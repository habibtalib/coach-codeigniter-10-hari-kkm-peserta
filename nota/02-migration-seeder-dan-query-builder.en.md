# 02 · Migrations, Seeders and the Query Builder

> Topic notes (reference across days) · Canon: [`SPEC-KURSUS.md`](../SPEC-KURSUS.md) · Index: [`README.md`](./README.md)

## Objectives of these notes

- **Convert** the Day 3 ERD into CI4 migration files with the correct primary keys, unique keys, indexes and foreign keys.
- **Write** a synthetic-data seeder, including Shield users with their groups.
- **Build** a date-range overlap query (BR-TLK-01) and aggregate queries with the Query Builder without concatenating user input.
- **Explain** why migration order and `migrate:rollback` matter when working in a team.

---

## 1. Why migrations, not a `.sql` file?

| Shared `.sql` file | CI4 migrations |
|----------------------|---------------|
| No record of who has run what | The `migrations` table records every file that has been run |
| A teammate misses one change → different databases | `php spark migrate` runs **only** what has not been run yet |
| Hard to undo | `down()` + `php spark migrate:rollback` |
| Not reviewed in a PR | PHP code — reviewed in Git like any other code |

A migration is **the schema's history in the form of code**. Every pair can rebuild the same DB with one command.

---

## 2. Migration order follows the ERD

A foreign key (FK) can only be created if the parent table **already exists**. So the file order (by the timestamp in the file name) must follow the dependencies:

```text
2026-01-01-000001_CreateDepartments.php
2026-01-01-000002_AddProfileFieldsToUsers.php      # users (Shield) → department_id
2026-01-01-000003_CreateParkingZones.php
2026-01-01-000004_CreateParkingSlots.php           # → parking_zones
2026-01-01-000005_CreateVehicles.php               # → users
2026-01-01-000006_CreateSlotBookings.php           # → users, vehicles, parking_slots
2026-01-01-000007_CreatePassApplications.php       # → users, vehicles
2026-01-01-000008_CreatePassDocuments.php          # → pass_applications
2026-01-01-000009_CreateStatusLogs.php             # → users
2026-01-01-000010_CreateReferenceSequences.php
```

Generate the skeleton with `php spark make:migration CreateParkingSlots`. The Shield tables (`users`, `auth_*`) come from `php spark shield:setup` / `php spark migrate --all`.

---

## 3. Example migration: `parking_slots`

```php
<?php
// app/Database/Migrations/2026-01-01-000004_CreateParkingSlots.php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateParkingSlots extends Migration
{
    public function up(): void
    {
        $this->forge->addField([
            'id'         => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'zone_id'    => ['type' => 'INT', 'unsigned' => true],          // must be the same type as parking_zones.id
            'slot_no'    => ['type' => 'VARCHAR', 'constraint' => 10],
            'category'   => ['type' => 'VARCHAR', 'constraint' => 20],      // SlotCategory value (PHP enum, not a MySQL ENUM)
            'is_active'  => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],         // soft delete (SPEC §3)
        ]);
        $this->forge->addKey('id', true);                                   // true = PRIMARY KEY
        $this->forge->addUniqueKey(['zone_id', 'slot_no']);                 // A-01 only once within a zone
        $this->forge->addForeignKey('zone_id', 'parking_zones', 'id', 'CASCADE', 'RESTRICT');
        //                          field     parent table    field  onUpdate  onDelete
        // RESTRICT: a zone cannot be deleted while it still has slots — avoids orphan records

        $this->forge->createTable('parking_slots', true);                   // true = IF NOT EXISTS
    }

    public function down(): void
    {
        $this->forge->dropTable('parking_slots', true);
    }
}
```

**Why is `category` a VARCHAR and not a MySQL `ENUM`?** The list of valid values is held by the PHP enum `SlotCategory` (a single source of truth — SPEC §5). Adding a new category does not need an `ALTER TABLE`.

### Indexes for the overlap check

```php
// in CreateSlotBookings::up()
$this->forge->addKey(['slot_id', 'start_date', 'end_date']);   // composite INDEX — makes the BR-TLK-01 query fast
$this->forge->addKey('status');
$this->forge->addUniqueKey('ref_no');
$this->forge->addForeignKey('decided_by', 'users', 'id', 'CASCADE', 'SET NULL'); // decided_by may be NULL
```

### Adding fields to the Shield `users` table

Do not edit the Shield migrations in `vendor/`. Create a **separate** migration:

```php
<?php
// app/Database/Migrations/2026-01-01-000002_AddProfileFieldsToUsers.php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddProfileFieldsToUsers extends Migration
{
    public function up(): void
    {
        $this->forge->addColumn('users', [
            'full_name'     => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true, 'after' => 'username'],
            'staff_no'      => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true, 'unique' => true],
            'department_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'phone'         => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
        ]);
        $this->forge->addForeignKey('department_id', 'departments', 'id', 'CASCADE', 'SET NULL');
        $this->forge->processIndexes('users');   // create the FK on an existing table
    }

    public function down(): void
    {
        $this->forge->dropForeignKey('users', 'users_department_id_foreign');
        $this->forge->dropColumn('users', ['full_name', 'staff_no', 'department_id', 'phone']);
    }
}
```

So that Shield can **save** these extra fields, generate your own model: `php spark shield:model UserModel`, add the fields to `$allowedFields` in `initialize()`, then set `public string $userProvider = \App\Models\UserModel::class;` in `app/Config/Auth.php`.

### Everyday Spark commands

```bash
php spark migrate --all          # run everything (app + Shield)
php spark migrate:status         # see which files have/have not been run
php spark migrate:rollback       # undo one batch
php spark migrate:refresh --all  # roll back everything + migrate again (training DB only!)
```

---

## 4. Seeders — repeatable synthetic data

A seeder gives every pair **the same** data to test with. `DatabaseSeeder` calls all of them:

```php
<?php
// app/Database/Seeds/DatabaseSeeder.php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call('DepartmentSeeder');   // parents first
        $this->call('UserSeeder');
        $this->call('ParkingSeeder');      // zones + slots
        $this->call('VehicleSeeder');
    }
}
```

### Shield users + groups

```php
<?php
// app/Database/Seeds/UserSeeder.php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use CodeIgniter\Shield\Entities\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = auth()->getProvider();   // UserModel (Shield or App\Models\UserModel)

        $senarai = [
            ['pemohon1', 'pemohon1@latihan.test', 'Aminah binti Latihan', 'applicant'],
            ['pemohon2', 'pemohon2@latihan.test', 'Rahman bin Contoh',    'applicant'],
            ['penyemak', 'penyemak@latihan.test', 'Siti Penyemak',        'reviewer'],
            ['pelulus',  'pelulus@latihan.test',  'Kamal Pelulus',        'approver'],
            ['admin',    'admin@latihan.test',    'Pentadbir Sistem',     'admin'],
        ];

        foreach ($senarai as [$username, $email, $nama, $group]) {
            $user = new User([
                'username'  => $username,
                'email'     => $email,
                'password'  => 'Latihan@2026',   // Shield hashes it automatically — training data only
                'full_name' => $nama,
            ]);
            $users->save($user);

            $user = $users->findById($users->getInsertID()); // fetch it again with its id
            $user->addGroup($group);                         // recorded in auth_groups_users
        }
    }
}
```

```bash
php spark db:seed DatabaseSeeder
```

> Vehicle plates in `VehicleSeeder` must be **made up** — e.g. `WXX 1234`, `VBB 5678`.

---

## 5. The Query Builder — why, instead of raw SQL

The Query Builder generates SQL and **binds** values automatically, so user input cannot change the structure of the query (SQL injection). It is also easier to read and can be built up step by step (dynamic filters).

```php
// ❌ DO NOT — input concatenated straight into SQL
$db->query("SELECT * FROM slot_bookings WHERE status = '" . $this->request->getGet('status') . "'");

// ✅ Query Builder — values are bound
$db->table('slot_bookings')->where('status', $this->request->getGet('status'))->get();

// ✅ If you must use raw SQL — use "?" binding
$db->query('SELECT * FROM slot_bookings WHERE status = ?', [$status]);
```

### The BR-TLK-01 overlap query

Two ranges `[A_start, A_end]` and `[B_start, B_end]` overlap **if and only if** `A_start <= B_end AND A_end >= B_start`. Draw it on the whiteboard — all four cases (overlap on the left, on the right, inside, enclosing) are covered by this single condition.

```php
<?php
// app/Services/SlotAvailabilityService.php (excerpt)

namespace App\Services;

use CodeIgniter\Database\BaseConnection;

class SlotAvailabilityService
{
    public function __construct(private readonly BaseConnection $db)
    {
    }

    /** Does this slot already have an active booking that overlaps the new range? */
    public function hasOverlap(int $slotId, string $start, string $end, ?int $excludeBookingId = null): bool
    {
        $builder = $this->db->table('slot_bookings')
            ->where('slot_id', $slotId)
            ->whereIn('status', ['pending', 'approved'])   // only "active" statuses count
            ->where('start_date <=', $end)                 // A_start <= B_end
            ->where('end_date >=', $start);                // A_end   >= B_start

        if ($excludeBookingId !== null) {
            $builder->where('id !=', $excludeBookingId);    // when approving the booking itself
        }

        return $builder->countAllResults() > 0;
    }

    /** Active slots in the zone with NO overlap (free-slot view). */
    public function availableSlots(int $zoneId, string $start, string $end): array
    {
        $busy = $this->db->table('slot_bookings')
            ->select('slot_id')
            ->whereIn('status', ['pending', 'approved'])
            ->where('start_date <=', $end)
            ->where('end_date >=', $start);

        return $this->db->table('parking_slots')
            ->where('zone_id', $zoneId)
            ->where('is_active', 1)
            ->where('deleted_at', null)
            ->whereNotIn('id', $busy)                      // subquery — CI 4.x accepts a Builder as the value
            ->orderBy('slot_no')
            ->get()->getResultArray();
    }
}
```

(How to inject `$db` — `db_connect()` or through `Config\Services` — is explained in [notes 05](./05-service-layer-dan-transaksi.md).)

### `groupStart()` — brackets for OR conditions

```php
// Search: (ref_no LIKE %word% OR reason LIKE %word%) AND status = pending
$builder->groupStart()
            ->like('ref_no', $kata)
            ->orLike('reason', $kata)
        ->groupEnd()
        ->where('status', 'pending');
```

Without `groupStart()`, the `OR` "breaks" the `status` condition — a classic bug that shows records with other statuses.

### Aggregates for report RPT-03

```php
// Slot usage by zone for one month
$rows = $db->table('slot_bookings b')
    ->select('z.code, z.name')
    ->selectCount('b.id', 'jumlah_tempahan')          // COUNT(b.id) AS jumlah_tempahan
    ->join('parking_slots s', 's.id = b.slot_id')
    ->join('parking_zones z', 'z.id = s.zone_id')
    ->where('b.status', 'approved')
    ->where('b.start_date <=', $akhirBulan)
    ->where('b.end_date >=', $awalBulan)
    ->groupBy(['z.code', 'z.name'])
    ->orderBy('jumlah_tempahan', 'DESC')
    ->get()->getResultArray();
```

### Debugging a query

```php
$result = $builder->get();
log_message('debug', (string) $db->getLastQuery());  // the actual SQL with values
```

Or open the **Database** tab on the Debug Toolbar (`development` environment).

---

## ⚠️ Common mistakes

| Mistake | Consequence | Fix |
|-----------|--------|----------|
| FK `zone_id` is type `INT` but the parent `id` is `INT UNSIGNED` | `errno: 150 Foreign key constraint is incorrectly formed` | Match the type & `unsigned` |
| Child migration runs before the parent | FK cannot be created | Order the file names by the ERD dependencies |
| Editing a migration that has already been *merged* & run by teammates | Teammates' DB does not change | Create a **new** migration for the change |
| Empty `down()` | `migrate:rollback` does not undo anything | Write the matching `dropTable`/`dropColumn` |
| Overlap condition using `start_date BETWEEN …` only | Misses the case where the new range encloses the old range | Use `start_date <= :end AND end_date >= :start` |
| Forgetting to filter `status` in the overlap check | `rejected`/`cancelled` bookings block the slot | `whereIn('status', ['pending','approved'])` |
| `orLike` without `groupStart()` | Records that should not appear show up | Wrap the OR conditions in a group |
| Real passwords/data in a seeder | Data exposure | Synthetic `@latihan.test` data only |

## Official references

- [Database Migrations](https://codeigniter.com/user_guide/dbmgmt/migration.html)
- [Database Forge](https://codeigniter.com/user_guide/dbmgmt/forge.html)
- [Database Seeding](https://codeigniter.com/user_guide/dbmgmt/seeds.html)
- [Query Builder Class](https://codeigniter.com/user_guide/database/query_builder.html)
- [Shield — Adding Attributes to Users](https://shield.codeigniter.com/latest/customization/adding_attributes_to_users/)

## Book reading — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), 2021 edition (CodeIgniter 4.1). `p.` = the page number printed at the foot of the book page.

- Database connection & `.env` — p. 27
- First migration (*Creating the Schema*) — p. 28–30
- Demo data seeder — p. 33–35
- Blog project migrations & seeder — p. 36–42
- `where()` through a model in a controller — p. 46
- Revising existing migrations — p. 78

The date-overlap query and `SELECT … FOR UPDATE` are not in the book; follow this note.

---
**Used on Day 4** — S3 (migrations + seeders from the ERD); **Day 6** — S1 (overlap & free-slot queries); **Day 9** — S2 (`ReportService` aggregate queries). Related notes: [03 · Model & Entity](./03-model-entity-dan-enum.md) · [05 · Transactions](./05-service-layer-dan-transaksi.md) · [08 · Report](./08-laporan-eksport-pdf-excel.md)
