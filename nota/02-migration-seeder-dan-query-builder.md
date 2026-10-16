# 02 · Migration, Seeder dan Query Builder

> Nota topikal (rujukan merentas hari) · Kanun: [`SPEC-KURSUS.md`](../SPEC-KURSUS.md) · Indeks: [`README.md`](./README.md)

## Objektif nota

- **Menukar** ERD Hari 3 kepada fail migration CI4 dengan kunci primer, unik, indeks dan kunci asing yang betul.
- **Menulis** seeder data sintetik termasuk pengguna Shield bersama group.
- **Membina** query pertindihan julat tarikh (BR-TLK-01) dan query aggregate dengan Query Builder tanpa mencantum input pengguna.
- **Menerangkan** kenapa susunan migration dan `migrate:rollback` penting semasa kerja berpasukan.

---

## 1. Kenapa migration, bukan fail `.sql`?

| Fail `.sql` dikongsi | Migration CI4 |
|----------------------|---------------|
| Tiada rekod siapa sudah jalankan apa | Jadual `migrations` merekod setiap fail yang dijalankan |
| Rakan terlepas satu perubahan → database berbeza | `php spark migrate` menjalankan **hanya** yang belum |
| Sukar undur | `down()` + `php spark migrate:rollback` |
| Tidak disemak dalam PR | Kod PHP — disemak dalam Git seperti kod lain |

Migration ialah **sejarah skema dalam bentuk kod**. Setiap pasangan boleh bina semula DB yang sama dengan satu arahan.

---

## 2. Susunan migration ikut ERD

Kunci asing (FK) hanya boleh dicipta jika jadual induk **sudah wujud**. Jadi susunan fail (ikut cap masa nama fail) mesti mengikut dependency:

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

Jana rangka dengan `php spark make:migration CreateParkingSlots`. Jadual Shield (`users`, `auth_*`) datang daripada `php spark shield:setup` / `php spark migrate --all`.

---

## 3. Contoh migration: `parking_slots`

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
            'zone_id'    => ['type' => 'INT', 'unsigned' => true],          // mesti sama jenis dengan parking_zones.id
            'slot_no'    => ['type' => 'VARCHAR', 'constraint' => 10],
            'category'   => ['type' => 'VARCHAR', 'constraint' => 20],      // nilai SlotCategory (enum PHP, bukan ENUM MySQL)
            'is_active'  => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],         // soft delete (SPEC §3)
        ]);
        $this->forge->addKey('id', true);                                   // true = PRIMARY KEY
        $this->forge->addUniqueKey(['zone_id', 'slot_no']);                 // A-01 hanya sekali dalam satu zon
        $this->forge->addForeignKey('zone_id', 'parking_zones', 'id', 'CASCADE', 'RESTRICT');
        //                          medan     jadual induk    medan  onUpdate  onDelete
        // RESTRICT: zon tidak boleh dipadam selagi ada slot — elak rekod yatim

        $this->forge->createTable('parking_slots', true);                   // true = IF NOT EXISTS
    }

    public function down(): void
    {
        $this->forge->dropTable('parking_slots', true);
    }
}
```

**Kenapa `category` VARCHAR dan bukan `ENUM` MySQL?** Senarai nilai sah dipegang oleh enum PHP `SlotCategory` (satu sumber kebenaran — SPEC §5). Menambah kategori baharu tidak memerlukan `ALTER TABLE`.

### Indeks untuk semakan pertindihan

```php
// dalam CreateSlotBookings::up()
$this->forge->addKey(['slot_id', 'start_date', 'end_date']);   // INDEX komposit — query BR-TLK-01 laju
$this->forge->addKey('status');
$this->forge->addUniqueKey('ref_no');
$this->forge->addForeignKey('decided_by', 'users', 'id', 'CASCADE', 'SET NULL'); // decided_by NULL dibenarkan
```

### Tambah medan pada jadual `users` Shield

Jangan sunting migration Shield dalam `vendor/`. Buat migration **berasingan**:

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
        $this->forge->processIndexes('users');   // cipta FK pada jadual sedia ada
    }

    public function down(): void
    {
        $this->forge->dropForeignKey('users', 'users_department_id_foreign');
        $this->forge->dropColumn('users', ['full_name', 'staff_no', 'department_id', 'phone']);
    }
}
```

Supaya Shield boleh **menyimpan** medan tambahan ini, jana model sendiri: `php spark shield:model UserModel`, tambah medan ke `$allowedFields` dalam `initialize()`, kemudian set `public string $userProvider = \App\Models\UserModel::class;` dalam `app/Config/Auth.php`.

### Arahan Spark harian

```bash
php spark migrate --all          # jalankan semua (app + Shield)
php spark migrate:status         # lihat fail mana sudah/belum
php spark migrate:rollback       # undur satu batch
php spark migrate:refresh --all  # rollback semua + migrate semula (DB latihan sahaja!)
```

---

## 4. Seeder — data sintetik boleh diulang

Seeder memberi setiap pasangan data **yang sama** untuk diuji. `DatabaseSeeder` memanggil semua:

```php
<?php
// app/Database/Seeds/DatabaseSeeder.php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call('DepartmentSeeder');   // induk dahulu
        $this->call('UserSeeder');
        $this->call('ParkingSeeder');      // zon + slot
        $this->call('VehicleSeeder');
    }
}
```

### Pengguna Shield + group

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
        $users = auth()->getProvider();   // UserModel (Shield atau App\Models\UserModel)

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
                'password'  => 'Latihan@2026',   // Shield hash secara automatik — data latihan sahaja
                'full_name' => $nama,
            ]);
            $users->save($user);

            $user = $users->findById($users->getInsertID()); // ambil semula dengan id
            $user->addGroup($group);                         // rekod dalam auth_groups_users
        }
    }
}
```

```bash
php spark db:seed DatabaseSeeder
```

> Plat kenderaan dalam `VehicleSeeder` mesti **rekaan** — cth `WXX 1234`, `VBB 5678`.

---

## 5. Query Builder — kenapa, bukan SQL mentah

Query Builder menjana SQL dan **mengikat (bind)** nilai secara automatik, jadi input pengguna tidak boleh mengubah struktur query (SQL injection). Ia juga lebih mudah dibaca dan boleh dibina sedikit demi sedikit (filter dinamik).

```php
// ❌ JANGAN — input dicantum terus ke SQL
$db->query("SELECT * FROM slot_bookings WHERE status = '" . $this->request->getGet('status') . "'");

// ✅ Query Builder — nilai diikat
$db->table('slot_bookings')->where('status', $this->request->getGet('status'))->get();

// ✅ Jika terpaksa SQL mentah — guna binding "?"
$db->query('SELECT * FROM slot_bookings WHERE status = ?', [$status]);
```

### Query pertindihan BR-TLK-01

Dua julat `[A_start, A_end]` dan `[B_start, B_end]` bertindih **jika dan hanya jika** `A_start <= B_end AND A_end >= B_start`. Lukis di papan putih — semua empat kes (bertindih kiri, kanan, di dalam, merangkumi) dipenuhi oleh syarat tunggal ini.

```php
<?php
// app/Services/SlotAvailabilityService.php (petikan)

namespace App\Services;

use CodeIgniter\Database\BaseConnection;

class SlotAvailabilityService
{
    public function __construct(private readonly BaseConnection $db)
    {
    }

    /** Adakah slot ini sudah ada tempahan aktif yang bertindih dengan julat baharu? */
    public function hasOverlap(int $slotId, string $start, string $end, ?int $excludeBookingId = null): bool
    {
        $builder = $this->db->table('slot_bookings')
            ->where('slot_id', $slotId)
            ->whereIn('status', ['pending', 'approved'])   // hanya status "aktif" dikira
            ->where('start_date <=', $end)                 // A_start <= B_end
            ->where('end_date >=', $start);                // A_end   >= B_start

        if ($excludeBookingId !== null) {
            $builder->where('id !=', $excludeBookingId);    // semasa meluluskan tempahan sendiri
        }

        return $builder->countAllResults() > 0;
    }

    /** Slot aktif dalam zon yang TIADA pertindihan (paparan slot kosong). */
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
            ->whereNotIn('id', $busy)                      // subquery — CI 4.x menyokong Builder sebagai nilai
            ->orderBy('slot_no')
            ->get()->getResultArray();
    }
}
```

(Cara menyuntik `$db` — `db_connect()` atau melalui `Config\Services` — diterangkan dalam [nota 05](./05-service-layer-dan-transaksi.md).)

### `groupStart()` — kurungan untuk syarat OR

```php
// Carian: (ref_no LIKE %kata% OR reason LIKE %kata%) AND status = pending
$builder->groupStart()
            ->like('ref_no', $kata)
            ->orLike('reason', $kata)
        ->groupEnd()
        ->where('status', 'pending');
```

Tanpa `groupStart()`, `OR` akan "memecahkan" syarat `status` — pepijat klasik yang memaparkan rekod status lain.

### Aggregate untuk laporan RPT-03

```php
// Penggunaan slot mengikut zon bagi satu bulan
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

### Nyahpepijat query

```php
$result = $builder->get();
log_message('debug', (string) $db->getLastQuery());  // SQL sebenar dengan nilai
```

Atau buka tab **Database** pada Debug Toolbar (persekitaran `development`).

---

## ⚠️ Kesilapan lazim

| Kesilapan | Akibat | Betulkan |
|-----------|--------|----------|
| FK `zone_id` jenis `INT` tetapi `id` induk `INT UNSIGNED` | `errno: 150 Foreign key constraint is incorrectly formed` | Padankan jenis & `unsigned` |
| Migration anak dijalankan sebelum induk | FK gagal dicipta | Susun nama fail ikut dependency ERD |
| Sunting migration yang sudah di-*merge* & dijalankan rakan | DB rakan tidak berubah | Cipta migration **baharu** untuk perubahan |
| `down()` kosong | `migrate:rollback` tidak mengundur | Tulis `dropTable`/`dropColumn` yang sepadan |
| Syarat pertindihan `start_date BETWEEN …` sahaja | Terlepas kes julat baharu merangkumi julat lama | Guna `start_date <= :end AND end_date >= :start` |
| Lupa tapis `status` dalam semakan pertindihan | Tempahan `rejected`/`cancelled` menghalang slot | `whereIn('status', ['pending','approved'])` |
| `orLike` tanpa `groupStart()` | Rekod yang tidak sepatutnya muncul | Bungkus syarat OR dalam kumpulan |
| Kata laluan/data sebenar dalam seeder | Pendedahan data | Data sintetik `@latihan.test` sahaja |

## Rujukan rasmi

- [Database Migrations](https://codeigniter.com/user_guide/dbmgmt/migration.html)
- [Database Forge](https://codeigniter.com/user_guide/dbmgmt/forge.html)
- [Database Seeding](https://codeigniter.com/user_guide/dbmgmt/seeds.html)
- [Query Builder Class](https://codeigniter.com/user_guide/database/query_builder.html)
- [Shield — Adding Attributes to Users](https://shield.codeigniter.com/latest/customization/adding_attributes_to_users/)

## Bacaan buku — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), edisi 2021 (CodeIgniter 4.1). `hlm.` = nombor halaman yang tercetak di kaki halaman buku.

- Database connection & `.env` — hlm. 27
- Migration pertama (*Creating the Schema*) — hlm. 28–30
- Seeder data demo — hlm. 33–35
- Migration & seeder projek blog — hlm. 36–42
- `where()` melalui model dalam controller — hlm. 46
- Mengubah migration sedia ada — hlm. 78

Query pertindihan tarikh dan `SELECT … FOR UPDATE` tiada dalam buku; ikut nota ini.

---
**Digunakan pada Hari 4** — S3 (migration + seeder daripada ERD); **Hari 6** — S1 (query pertindihan & slot kosong); **Hari 9** — S2 (query aggregate `ReportService`). Nota berkaitan: [03 · Model & Entity](./03-model-entity-dan-enum.md) · [05 · Transaksi](./05-service-layer-dan-transaksi.md) · [08 · Laporan](./08-laporan-eksport-pdf-excel.md)
