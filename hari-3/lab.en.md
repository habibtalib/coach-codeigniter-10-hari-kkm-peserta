# Day 3 Lab — Database, Migrations, Models & Search

[📅 Schedule](../JADUAL.md) · [📘 Specification](../docs/spesifikasi-sistem.md) · [📖 Day 3 README](./README.md) · [⚡ spark commands](../docs/arahan-spark.md)

| Lab | Session | Output |
|-----|---------|--------|
| [Lab 3.1](#lab-31--mysql-database--env-s1) | S1 | Databases `kkm_latihan` + `kkm_latihan_test`, user `kkm_dev`, `.env` connected |
| [Lab 3.2](#lab-32--first-migrations--seeders-s2) | S2 | Migrations for `departments` + `parking_zones`, idempotent seeders; commit pushed |
| [Lab 3.3](#lab-33--model--the-jabatan-pages-s3) | S3 | `DepartmentModel` + `/jabatan` (list & new form); commit pushed |
| [Lab 3.4](#lab-34--zone-search--pagination-s4) | S4 | `/zon` with `?q=` search & pagination; commit pushed |
| [Lab 3.1b](#lab-31b--test-database--envexample-s5) | S5 | `tests` group → `kkm_latihan_test`; secret-free `.env.example`; commit pushed |
| [Lab 3.2b](#lab-32b--query-builder-in-the-console-s6) | S6 | `php spark shell` + Query Builder queries in the console; commit pushed |
| [Lab 3.3b](#lab-33b--edit-a-department-s7) | S7 | `/jabatan/<id>/edit` with `update()` and `is_unique` `{id}`; commit pushed |
| [Lab 3.4b](#lab-34b--zone-details--sorting-s8) | S8 | `/zon/<id>` (details + 404) and `?sort=` ordering; commit pushed |

> All work happens in your **individual** project `~/latihan/kelas-ci-<nama>` (Day 2). Tables & fields follow [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 and [`erd-rujukan.md`](../docs/erd-rujukan.md) — you do not draw the ERD yourself. The original ERD/data dictionary/wireframe material is now optional reading in [`rujukan-keperluan.md`](../docs/rujukan-keperluan.md).

---

## Lab 3.1 — MySQL database & `.env` (S1)

### 🎯 Objective
Create the development and test databases with a dedicated user `kkm_dev`, connect the `kelas-ci-<nama>` project through `.env`, and confirm the connection with `php spark db:table --show`.

### Prerequisites
- [Lab 2.4](../hari-2/lab.en.md#lab-24--form-validation--csrf-s4) done: GitLab shows 4 commits.
- Laragon → **Start All** (MySQL green). A Git Bash terminal in VS Code.

> 🔍 **Proof of work:** the platform ticks today's lab checkpoints when you **pass that lab's session quiz** (Quiz S1 for Lab 3.1, … Quiz S4 for Lab 3.4, on the session page) — its questions can only be answered by running the code.

### Steps
1. **Check MySQL:**
   ```bash
   mysql --version
   ```
   `mysql: command not found`? Laragon → *Menu → Tools → Path → Add Laragon to Path*, close VS Code and open it again.
2. **Create the databases & user** (once only; skip if you already did [`persediaan.md`](../docs/persediaan.md) §4). Laragon: user `root` with no password:
   ```bash
   mysql -u root <<'SQL'
   CREATE DATABASE IF NOT EXISTS kkm_latihan      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE IF NOT EXISTS kkm_latihan_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'kkm_dev'@'localhost' IDENTIFIED BY 'Latihan@2026';
   GRANT ALL PRIVILEGES ON kkm_latihan.*      TO 'kkm_dev'@'localhost';
   GRANT ALL PRIVILEGES ON kkm_latihan_test.* TO 'kkm_dev'@'localhost';
   FLUSH PRIVILEGES;
   SQL
   mysql -u kkm_dev -p -e "SHOW DATABASES LIKE 'kkm_latihan%';"
   ```
   Password `Latihan@2026`. The output lists `kkm_latihan` and `kkm_latihan_test`. Training data only — **never** use a real password.
3. **Connect `.env`.** Open `.env` in VS Code and add below `CI_ENVIRONMENT`:
   ```ini
   app.baseURL = 'http://localhost:8080/'
   app.appTimezone = 'Asia/Kuala_Lumpur'

   database.default.hostname = localhost
   database.default.database = kkm_latihan
   database.default.username = kkm_dev
   database.default.password = Latihan@2026
   database.default.DBDriver = MySQLi
   database.default.DBPrefix =
   database.default.port = 3306
   database.default.charset = utf8mb4
   database.default.DBCollat = utf8mb4_unicode_ci
   ```
4. **Test the connection:**
   ```bash
   php spark db:table --show
   ```
   The new database is still empty: CI prints *Database has no tables!* — that means the connection **worked**. The error *Unable to connect* means `.env` is wrong.
5. **`.env` stays secret:**
   ```bash
   git status --short
   git check-ignore -v .env
   ```
   `git status` does not list `.env`; `git check-ignore` shows the `.gitignore` line that ignores it. There is nothing to commit in this lab.

### ✅ Checkpoint
- [ ] `SHOW DATABASES LIKE 'kkm_latihan%'` as `kkm_dev` lists two databases (Quiz S1).
- [ ] `php spark db:table --show` prints *Database has no tables!* with no connection error (Quiz S1).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `ERROR 2003 … Can't connect to MySQL server` | Laragon's MySQL has not started | Laragon → **Start All**; wait for MySQL to turn green |
| `ERROR 1045 Access denied for user 'root'` | MySQL root has a password (not the Laragon default) | `mysql -u root -p` and enter your root password |
| `mysql` hangs with no prompt | A separate Git Bash window (mintty) | Use the VS Code terminal, or `winpty mysql -u kkm_dev -p` |
| `Unable to connect to the database` | Wrong `.env` values or a `#` still in front | Check every `database.default.*` line; try `hostname = 127.0.0.1` |
| `Access denied for user 'kkm_dev'` | The password in `.env` does not match | It must be `Latihan@2026` (capital L) |

### ⭐ Bonus challenge
Open HeidiSQL (Laragon → **Database** button), sign in as `kkm_dev` and look at both databases. Why does this course not use `root` in `.env`?

---

## Lab 3.2 — First migrations & seeders (S2)

### 🎯 Objective
Write migrations for `departments` and `parking_zones` **exactly** as in specification §3, test `migrate` / `rollback`, and fill synthetic data with seeders that can be run again and again.

### Prerequisites
- [Lab 3.1](#lab-31--mysql-database--env-s1) done.
- Keep [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 open next to you.

### Steps
1. **Generate two migrations** (order matters — the timestamp decides the run order):
   ```bash
   php spark make:migration CreateDepartmentsTable
   php spark make:migration CreateParkingZonesTable
   ```
2. **`CreateDepartmentsTable`** — fill in the generated file in `app/Database/Migrations/`:

   Hints: `$this->forge->addField([...])` with `id` INT 11 UNSIGNED `auto_increment`, `code` VARCHAR 20, `name` VARCHAR 150, `created_at`/`updated_at` DATETIME `null` → `addPrimaryKey('id')` → `addUniqueKey('code')` → `createTable('departments', false, ['ENGINE' => 'InnoDB'])`.

   `app/Database/Migrations/…_CreateDepartmentsTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreateDepartmentsTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'code'       => ['type' => 'VARCHAR', 'constraint' => 20],
               'name'       => ['type' => 'VARCHAR', 'constraint' => 150],
               'created_at' => ['type' => 'DATETIME', 'null' => true],
               'updated_at' => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addUniqueKey('code');
           $this->forge->createTable('departments', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('departments', true);
       }
   }
   ```
3. **`CreateParkingZonesTable`** — the same pattern, fields per specification §3 (`code` VARCHAR(10) UNIQUE, `name` VARCHAR(100), `location` VARCHAR(150)):

   Hints: the same as `CreateDepartmentsTable`, fields `code` VARCHAR 10 UNIQUE, `name` VARCHAR 100, `location` VARCHAR 150.

   `app/Database/Migrations/…_CreateParkingZonesTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreateParkingZonesTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'code'       => ['type' => 'VARCHAR', 'constraint' => 10],
               'name'       => ['type' => 'VARCHAR', 'constraint' => 100],
               'location'   => ['type' => 'VARCHAR', 'constraint' => 150],
               'created_at' => ['type' => 'DATETIME', 'null' => true],
               'updated_at' => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addUniqueKey('code');
           $this->forge->createTable('parking_zones', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('parking_zones', true);
       }
   }
   ```
4. **Run, check, roll back, run again** (a short loop):
   ```bash
   php spark migrate
   php spark migrate:status
   php spark db:table --show
   php spark migrate:rollback
   php spark migrate
   php spark migrate:status
   php spark db:table departments --metadata
   ```
   Note the **number of tables** in `db:table --show` and the value of the **Batch** column after rollback + migrate — Quiz S2 questions.
5. **Seeders.** Generate three files:
   ```bash
   php spark make:seeder DepartmentSeeder
   php spark make:seeder ParkingSeeder
   php spark make:seeder DatabaseSeeder
   ```
   `DepartmentSeeder` — `ignore(true)` makes it `INSERT IGNORE`, so a second run adds no duplicate rows:

   Data (copy exactly — Quizzes S2 and S3 depend on it): `BTM` Bahagian Teknologi Maklumat (Latihan) · `BKW` Bahagian Kewangan (Latihan) · `BSM` Bahagian Sumber Manusia (Latihan) · `BPA` Bahagian Pengurusan Aset (Latihan). Fill `created_at` and `updated_at` with `date('Y-m-d H:i:s')`.

   `app/Database/Seeds/DepartmentSeeder.php`

   ```php
   <?php

   namespace App\Database\Seeds;

   use CodeIgniter\Database\Seeder;

   class DepartmentSeeder extends Seeder
   {
       public function run(): void
       {
           $now  = date('Y-m-d H:i:s');
           $rows = [
               ['code' => 'BTM', 'name' => 'Bahagian Teknologi Maklumat (Latihan)'],
               ['code' => 'BKW', 'name' => 'Bahagian Kewangan (Latihan)'],
               ['code' => 'BSM', 'name' => 'Bahagian Sumber Manusia (Latihan)'],
               ['code' => 'BPA', 'name' => 'Bahagian Pengurusan Aset (Latihan)'],
           ];

           foreach ($rows as &$row) {
               $row['created_at'] = $row['updated_at'] = $now;
           }
           unset($row);

           $this->db->table('departments')->ignore(true)->insertBatch($rows);
       }
   }
   ```
   `ParkingSeeder` — three zones (Day 4 adds slots in the same file):

   Data (copy exactly): `A` Blok Utama — *Aras G, pintu masuk utama* · `B` Blok Klinik — *Sebelah klinik pakar* · `C` Parkir Bertingkat — *Aras 1–3, bangunan parkir*.

   `app/Database/Seeds/ParkingSeeder.php`

   ```php
   <?php

   namespace App\Database\Seeds;

   use CodeIgniter\Database\Seeder;

   class ParkingSeeder extends Seeder
   {
       public function run(): void
       {
           $now   = date('Y-m-d H:i:s');
           $zones = [
               ['code' => 'A', 'name' => 'Blok Utama', 'location' => 'Aras G, pintu masuk utama'],
               ['code' => 'B', 'name' => 'Blok Klinik', 'location' => 'Sebelah klinik pakar'],
               ['code' => 'C', 'name' => 'Parkir Bertingkat', 'location' => 'Aras 1–3, bangunan parkir'],
           ];

           foreach ($zones as &$zone) {
               $zone['created_at'] = $zone['updated_at'] = $now;
           }
           unset($zone);

           $this->db->table('parking_zones')->ignore(true)->insertBatch($zones);
       }
   }
   ```
   `DatabaseSeeder` — calls the other seeders in order:

   Hints: `$this->call(DepartmentSeeder::class)` — parent first.

   `app/Database/Seeds/DatabaseSeeder.php`

   ```php
   <?php

   namespace App\Database\Seeds;

   use CodeIgniter\Database\Seeder;

   class DatabaseSeeder extends Seeder
   {
       public function run(): void
       {
           $this->call(DepartmentSeeder::class);
           $this->call(ParkingSeeder::class);
       }
   }
   ```
6. **Run it twice** (idempotency test):
   ```bash
   php spark db:seed DatabaseSeeder
   php spark db:seed DatabaseSeeder
   php spark db:table departments
   ```
   `departments` must have **4** rows, not 8.
7. Commit and push:
   ```bash
   git add . && git commit -m "DB: migration departments + parking_zones, seeder" && git push
   ```

### ✅ Checkpoint
- [ ] `php spark migrate:status` shows 2 `App` migrations with a *Migrated On* date (Quiz S2).
- [ ] After `db:seed` twice, `departments` has 4 rows and `parking_zones` 3 rows (Quiz S2).
- [ ] GitLab shows the commit `DB: migration departments + parking_zones, seeder` (Quiz S2).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `migrate` does nothing | The class in the file does not match the file name, or the namespace is wrong | Class name = the part after the timestamp (`CreateDepartmentsTable`); namespace `App\Database\Migrations` |
| `Table 'departments' already exists` | The table was created by hand or the migration ran twice with different timestamps | `php spark migrate:rollback`, delete the duplicate file, `php spark migrate` |
| `Duplicate entry 'BTM' for key 'code'` on the second run | `ignore(true)` is missing | `$this->db->table('departments')->ignore(true)->insertBatch($rows)` |
| `Class "App\Database\Seeds\DepartmentSeeder" not found` | File name ≠ class name | File `DepartmentSeeder.php`, class `DepartmentSeeder` |

### ⭐ Bonus challenge
Run `php spark migrate:refresh` and then `php spark db:seed DatabaseSeeder`. What does `refresh` do, and why must it **never** be run on a production database?

---

## Lab 3.3 — Model & the `/jabatan` pages (S3)

### 🎯 Objective
Build `DepartmentModel` with `$allowedFields`, `$useTimestamps` and validation, then the `/jabatan` page (list) and `/jabatan/baharu` (form) using the layout and the PRG pattern from Lab 2.4.

### Prerequisites
- [Lab 3.2](#lab-32--first-migrations--seeders-s2) done: `departments` has 4 rows.

### Steps
1. **Model** `app/Models/DepartmentModel.php`:

   Generate the file: `php spark make:model DepartmentModel`. Hints: `$allowedFields = ['code', 'name']`; `$useTimestamps = true`; rule `code` = `required|alpha_numeric|max_length[20]|is_unique[departments.code,id,{id}]` (label `Kod`), `name` = `required|min_length[3]|max_length[150]` (label `Nama`).

   `app/Models/DepartmentModel.php`

   ```php
   <?php

   namespace App\Models;

   use CodeIgniter\Model;

   class DepartmentModel extends Model
   {
       protected $table         = 'departments';
       protected $returnType    = 'array';
       protected $allowedFields = ['code', 'name'];
       protected $useTimestamps = true;

       protected $validationRules = [
           'code' => [
               'label' => 'Kod',
               'rules' => 'required|alpha_numeric|max_length[20]|is_unique[departments.code,id,{id}]',
           ],
           'name' => [
               'label' => 'Nama',
               'rules' => 'required|min_length[3]|max_length[150]',
           ],
       ];
   }
   ```
   - `$allowedFields` — only these fields can be filled from input (safe mass assignment).
   - `$useTimestamps` — `created_at`/`updated_at` are filled automatically.
   - `is_unique[departments.code,id,{id}]` — the code must be unique (except the record itself during an update).
2. **Routes** in `app/Config/Routes.php`:
   ```php
   $routes->get('jabatan', 'Jabatan::index');
   $routes->get('jabatan/baharu', 'Jabatan::baharu');
   $routes->post('jabatan', 'Jabatan::simpan');
   ```
3. **Controller** `app/Controllers/Jabatan.php`:

   Generate the file: `php spark make:controller Jabatan`. Hints: `model(DepartmentModel::class)->orderBy('code')->findAll()`; `$this->request->getPost(['code', 'name'])`; `insert()` returns `false` on failure → `redirect()->to('jabatan/baharu')->withInput()->with('errors', $model->errors())`; success → `redirect()->to('jabatan')->with('berjaya', 'Jabatan ' . $data['code'] . ' disimpan.')`.

   `app/Controllers/Jabatan.php`

   ```php
   <?php

   namespace App\Controllers;

   use App\Models\DepartmentModel;
   use CodeIgniter\HTTP\RedirectResponse;

   class Jabatan extends BaseController
   {
       protected $helpers = ['form'];

       public function index(): string
       {
           $jabatan = model(DepartmentModel::class)->orderBy('code')->findAll();

           return view('jabatan/index', ['jabatan' => $jabatan, 'tajuk' => 'Jabatan']);
       }

       public function baharu(): string
       {
           return view('jabatan/baharu', ['tajuk' => 'Jabatan baharu']);
       }

       public function simpan(): RedirectResponse
       {
           $model = model(DepartmentModel::class);
           $data  = $this->request->getPost(['code', 'name']);

           if ($model->insert($data) === false) {
               return redirect()->to('jabatan/baharu')->withInput()->with('errors', $model->errors());
           }

           return redirect()->to('jabatan')->with('berjaya', 'Jabatan ' . $data['code'] . ' disimpan.');
       }
   }
   ```
   Validation happens in the **model**: `insert()` returns `false` and `$model->errors()` gives the messages per field.
4. **List view** `app/Views/jabatan/index.php`:

   Hints: the same as `daftar.php` (Lab 2.4): `session()->getFlashdata('berjaya')`, `site_url('jabatan/baharu')`, every value through `esc()`.

   `app/Views/jabatan/index.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Jabatan</h1>

   <?php if (session()->getFlashdata('berjaya')): ?>
       <p class="berjaya"><?= esc(session()->getFlashdata('berjaya')) ?></p>
   <?php endif ?>

   <p><a href="<?= site_url('jabatan/baharu') ?>">+ Jabatan baharu</a></p>

   <table>
       <thead><tr><th>Kod</th><th>Nama</th><th>Dicipta</th></tr></thead>
       <tbody>
       <?php foreach ($jabatan as $j): ?>
           <tr>
               <td><?= esc($j['code']) ?></td>
               <td><?= esc($j['name']) ?></td>
               <td><?= esc($j['created_at']) ?></td>
           </tr>
       <?php endforeach ?>
       </tbody>
   </table>
   <?= $this->endSection() ?>
   ```
5. **Form view** `app/Views/jabatan/baharu.php`:

   Hints: inputs `name="code"` and `name="name"` with `esc(old('code'))`; field errors `$errors['code']` / `$errors['name']` in a `<span class="ralat">`.

   `app/Views/jabatan/baharu.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Jabatan baharu</h1>

   <?php $errors = session()->getFlashdata('errors') ?? [] ?>

   <form method="post" action="<?= site_url('jabatan') ?>">
       <?= csrf_field() ?>

       <label for="code">Kod</label>
       <input id="code" name="code" maxlength="20" value="<?= esc(old('code')) ?>">
       <?php if (isset($errors['code'])): ?><span class="ralat"><?= esc($errors['code']) ?></span><?php endif ?>

       <label for="name">Nama</label>
       <input id="name" name="name" maxlength="150" value="<?= esc(old('name')) ?>">
       <?php if (isset($errors['name'])): ?><span class="ralat"><?= esc($errors['name']) ?></span><?php endif ?>

       <button type="submit">Simpan</button>
   </form>
   <?= $this->endSection() ?>
   ```
6. **Test.** `php spark serve`, open <http://localhost:8080/jabatan> (4 departments, ordered by code). Click **+ Jabatan baharu**:
   - Submit empty → Kod and Nama errors.
   - Submit Kod `BTM` → note the **exact** error message under Kod (a Quiz S3 question).
   - Submit Kod `BPP`, Nama `Bahagian Perolehan (Latihan)` → back to the list with *"Jabatan BPP disimpan."* and the **Dicipta** column holding a date and time.
7. Commit and push:
   ```bash
   git add . && git commit -m "JABATAN: model, senarai & borang baharu" && git push
   ```

### ✅ Checkpoint
- [ ] `/jabatan` lists departments from the database through `DepartmentModel` (Quiz S3).
- [ ] A duplicate code is refused with the model's validation message; a new department is saved with an automatic `created_at` (Quiz S3).
- [ ] GitLab shows the commit `JABATAN: model, senarai & borang baharu` (Quiz S3).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| *The Kod field is required.* even though Kod is filled in | The form's `name` attribute does not match the model field | `name="code"` and `name="name"` exactly, the same as `$allowedFields` |
| A duplicate code is not refused | `is_unique` missing or the wrong table name | `is_unique[departments.code,id,{id}]` |
| Errors are not shown | Missing `->with('errors', $model->errors())` or no `withInput()` | Follow `simpan()` above |
| The Dicipta column is empty | `$useTimestamps` missing | `protected $useTimestamps = true;` |
| *The action you requested is not allowed.* | The form has no `csrf_field()` (global CSRF from Lab 2.4) | Add `<?= csrf_field() ?>` |

### ⭐ Bonus challenge
Show the number of departments below the `/jabatan` heading (*5 jabatan*) using `count($jabatan)` in the view.

⭐ **`maxlength` is not validation:** in the browser DevTools, remove the `maxlength` attribute from the Kod input, then submit a 25-character Kod. What message is shown, and why is the model rule `max_length[20]` still needed even though the form has `maxlength`?

---

## Lab 3.4 — Zone search & pagination (S4)

### 🎯 Objective
Build `/zon` **on your own** with the Lab 3.3 pattern: a `ParkingZoneModel` with a Query Builder search method (`like()` / `orLike()` inside `groupStart()`), a `GET ?q=` search form, and pagination.

### Prerequisites
- [Lab 3.3](#lab-33--model--the-jabatan-pages-s3) done.

### Steps
1. **Model** `app/Models/ParkingZoneModel.php` with a `cari()` method:

   Generate the file: `php spark make:model ParkingZoneModel`. Hints: `$table = 'parking_zones'`, `$allowedFields = ['code', 'name', 'location']`, `$useTimestamps = true`; `trim((string) $q)`; `like('name', $q)`, `orLike('location', $q)`, `orLike('code', $q)`.

   `app/Models/ParkingZoneModel.php`

   ```php
   <?php

   namespace App\Models;

   use CodeIgniter\Model;

   class ParkingZoneModel extends Model
   {
       protected $table         = 'parking_zones';
       protected $returnType    = 'array';
       protected $allowedFields = ['code', 'name', 'location'];
       protected $useTimestamps = true;

       public function cari(?string $q): static
       {
           $q = trim((string) $q);

           if ($q !== '') {
               $this->groupStart()
                   ->like('name', $q)
                   ->orLike('location', $q)
                   ->orLike('code', $q)
                   ->groupEnd();
           }

           return $this->orderBy('code');
       }
   }
   ```
2. **Controller** `app/Controllers/Zon.php` — 2 zones per page so pagination shows with 3 zones:

   Generate the file: `php spark make:controller Zon`. Hints: `$model = model(ParkingZoneModel::class)`; pass `'pager' => $model->pager` after `paginate()`.

   `app/Controllers/Zon.php`

   ```php
   <?php

   namespace App\Controllers;

   use App\Models\ParkingZoneModel;

   class Zon extends BaseController
   {
       public function index(): string
       {
           $q     = $this->request->getGet('q');
           $model = model(ParkingZoneModel::class);
           $zon   = $model->cari($q)->paginate(2);

           return view('zon/index', [
               'zon'   => $zon,
               'pager' => $model->pager,
               'q'     => $q,
               'tajuk' => 'Zon parkir',
           ]);
       }
   }
   ```
3. **Route:**
   ```php
   $routes->get('zon', 'Zon::index');
   ```
4. **View** `app/Views/zon/index.php`:

   Hints: `<form method="get" action="<?= site_url('zon') ?>">`; `$zon === []` for no results (*Tiada zon sepadan dengan "…".*); `<?= $pager->links() ?>`.

   `app/Views/zon/index.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Zon parkir</h1>

   <form method="get" action="<?= site_url('zon') ?>">
       <input name="q" value="<?= esc($q ?? '') ?>" placeholder="Cari nama, lokasi atau kod">
       <button type="submit">Cari</button>
   </form>

   <?php if ($zon === []): ?>
       <p>Tiada zon sepadan dengan "<?= esc($q) ?>".</p>
   <?php else: ?>
       <table>
           <thead><tr><th>Kod</th><th>Nama</th><th>Lokasi</th></tr></thead>
           <tbody>
           <?php foreach ($zon as $z): ?>
               <tr>
                   <td><?= esc($z['code']) ?></td>
                   <td><?= esc($z['name']) ?></td>
                   <td><?= esc($z['location']) ?></td>
               </tr>
           <?php endforeach ?>
           </tbody>
       </table>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```
5. **Test and note** (Quiz S4 questions):
   - <http://localhost:8080/zon> → page 1 (A, B) and a link to page 2 (C).
   - <http://localhost:8080/zon?q=KLINIK> (capital letters) — which zone is shown?
   - <http://localhost:8080/zon?q=aras> — the pagination links still carry `q=aras`.
   - Type `' OR 1=1 --` in the search box — what is shown?
6. Commit and push:
   ```bash
   git add . && git commit -m "ZON: carian + pagination" && git push
   ```

### ✅ Checkpoint
- [ ] `/zon` shows 2 zones per page with pagination links (Quiz S4).
- [ ] The `?q=` search filters by name, location or code, and the input `' OR 1=1 --` does not break the query (Quiz S4).
- [ ] GitLab shows the commit `ZON: carian + pagination` (Quiz S4).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| *Undefined variable $pager* | `pager` not passed to the view | `'pager' => $model->pager` after `paginate()` |
| The search shows every zone | `cari()` called on a different model from the one that runs `paginate()` | Use the same `$model`: `$model->cari($q)->paginate(2)` |
| Page 2 loses the search | The form uses `method="post"` | Search uses `GET` so `?q=` stays in the URL |
| `orLike` matches records outside the search when there are other conditions | No `groupStart()` / `groupEnd()` | Wrap `like()`/`orLike()` in a group |

### ⭐ Bonus challenge
Show the number of results: *"3 zon dijumpai"* using `$pager->getTotal()`. Then open the *Database* tab in the Debug Toolbar: look at the real `LIKE` query CI builds for `?q=aras`.

---

## Lab 3.1b — Test database & `.env.example` (S5)

### 🎯 Objective
Connect the `tests` database group to `kkm_latihan_test` through `.env`, prove the connection with `--dbgroup tests`, and commit a secret-free `.env.example` template so anyone who clones the repo knows which `.env` keys to fill in.

### Prerequisites
- [Lab 3.1](#lab-31--mysql-database--env-s1) done: `php spark db:table --show` prints *Database has no tables!*.

### Steps
1. **Look at the default values of the `tests` group:**
   ```bash
   php spark config:check Database
   ```
   The output shows two blocks: `default` (from your `.env`) and `tests`. In the `tests` block, note the values of `database`, `DBDriver` and `DBPrefix` — a Quiz S5 question. This output also shows the `default` password: do not share a screenshot of it.
2. **Add the `tests` group to `.env`**, below the `database.default.DBCollat` line:
   ```ini
   database.tests.hostname = localhost
   database.tests.database = kkm_latihan_test
   database.tests.username = kkm_dev
   database.tests.password = Latihan@2026
   database.tests.DBDriver = MySQLi
   database.tests.DBPrefix =
   database.tests.port = 3306
   database.tests.charset = utf8mb4
   database.tests.DBCollat = utf8mb4_unicode_ci
   ```
   `DBPrefix =` (empty) matters: the `tests` default adds a prefix to every table name, so the Day 6 tests would look for tables that do not exist.
3. **Test the `tests` group connection:**
   ```bash
   php spark db:table --show --dbgroup tests
   ```
   The small table at the top of the output shows `database` = `kkm_latihan_test`, `DBDriver` = `MySQLi` and an empty `DBPrefix`, followed by *Database has no tables!*. Run `php spark config:check Database` again: the `tests` block now follows `.env`.

   The test database stays empty today — its tables are built by the Day 6 PHPUnit tests (`DatabaseTestTrait`). Do **not** run `php spark migrate -g tests`: in CI 4.7 the `-g` option does not switch the connection, so the migrations try to create the tables in `kkm_latihan`.
4. **The `.env.example` template.** Create a new file `.env.example` in the project root (next to `.env`):

   `.env.example`

   ```ini
   # Templat .env — salin: cp .env.example .env, kemudian isi kata laluan sebenar.
   # Fail ini di-commit. JANGAN letak kata laluan sebenar di sini.
   CI_ENVIRONMENT = development

   app.baseURL = 'http://localhost:8080/'
   app.appTimezone = 'Asia/Kuala_Lumpur'

   database.default.hostname = localhost
   database.default.database = kkm_latihan
   database.default.username = kkm_dev
   database.default.password = ganti_kata_laluan
   database.default.DBDriver = MySQLi
   database.default.DBPrefix =
   database.default.port = 3306
   database.default.charset = utf8mb4
   database.default.DBCollat = utf8mb4_unicode_ci

   database.tests.hostname = localhost
   database.tests.database = kkm_latihan_test
   database.tests.username = kkm_dev
   database.tests.password = ganti_kata_laluan
   database.tests.DBDriver = MySQLi
   database.tests.DBPrefix =
   database.tests.port = 3306
   database.tests.charset = utf8mb4
   database.tests.DBCollat = utf8mb4_unicode_ci
   ```
5. **Check Git and secrets:**
   ```bash
   git status --short
   git check-ignore -v .env.example
   grep -c "ganti_kata_laluan" .env.example
   grep -c "Latihan@2026" .env.example
   ```
   Note the output of `git status --short` (a Quiz S5 question). `git check-ignore` prints nothing: `.env.example` is not ignored, so it can be committed, while `.env` stays ignored. `grep -c` prints `2` (two password placeholders) and `0` (no real password).
6. Commit and push:
   ```bash
   git add .env.example && git commit -m "SETUP: .env.example tanpa rahsia" && git push
   ```

### ✅ Checkpoint
- [ ] `php spark db:table --show --dbgroup tests` shows `kkm_latihan_test` and *Database has no tables!* (Quiz S5).
- [ ] `git status --short` lists `.env.example` but not `.env` (Quiz S5).
- [ ] GitLab shows the commit `SETUP: .env.example tanpa rahsia` (Quiz S5).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `--dbgroup tests` → *The required PHP extension "sqlite3" is not loaded* | The `database.tests.*` lines were not read (`tests` misspelled, or `#` still there) | Check every line starts with `database.tests.`; run `php spark config:check Database` |
| `Access denied for user 'kkm_dev'@'localhost' to database 'kkm_latihan_test'` | The `GRANT` for the test database is missing | As `root`: `GRANT ALL PRIVILEGES ON kkm_latihan_test.* TO 'kkm_dev'@'localhost';` |
| `.env.example` does not appear in `git status` | Windows saved it as `.env.example.txt` | Check with `ls -a`; rename: `mv .env.example.txt .env.example` |
| `migrate -g tests` → *Table 'departments' already exists* | `-g` does not switch the connection; the migrations run on `kkm_latihan` | Do not use `-g tests`; the test tables are built by the Day 6 tests |

### ⭐ Bonus challenge
Ask the person next to you to clone your repo into another folder, run `cp .env.example .env` and fill in the password. How many lines do they need to change before `php spark db:table --show` works?

---

## Lab 3.2b — Query Builder in the console (S6)

### 🎯 Objective
Build `php spark shell` (PsySH), run Query Builder queries (`where()`, `like()`, `orderBy()`, `countAllResults()`) directly on `departments` and `parking_zones`, read the real SQL with `getLastQuery()`, and prove the seeder's `INSERT IGNORE` with `affectedRows()`.

### Prerequisites
- [Lab 3.2](#lab-32--first-migrations--seeders-s2) done: `departments` has 4 rows, `parking_zones` 3 rows.

### Steps
1. **Install PsySH** as a **dev** package only (it is not installed on the server):
   ```bash
   composer require --dev psy/psysh
   ```
2. **The `shell` command.** Generate the file:
   ```bash
   php spark make:command Shell --command shell --group App
   ```
   Replace the whole content of the generated file:

   `app/Commands/Shell.php`

   ```php
   <?php

   namespace App\Commands;

   use CodeIgniter\CLI\BaseCommand;
   use CodeIgniter\CLI\CLI;
   use Psy\Configuration;
   use Psy\Shell as PsyShell;

   class Shell extends BaseCommand
   {
       protected $group       = 'App';
       protected $name        = 'shell';
       protected $description = 'Konsol PHP interaktif (PsySH) dengan aplikasi CI4 dimuatkan.';

       public function run(array $params)
       {
           if (ENVIRONMENT === 'production' || ! class_exists(PsyShell::class)) {
               CLI::error('shell: development sahaja (composer require --dev psy/psysh).');

               return EXIT_ERROR;
           }

           $shell = new PsyShell(new Configuration(['updateCheck' => 'never']));
           $shell->setScopeVariables(['db' => db_connect()]);
           $shell->run();
       }
   }
   ```
   `$db` is the `default` connection (`kkm_latihan`) — data you change in the console **really changes**.
3. **Open the console:**
   ```bash
   php spark shell
   ```
   The `>` prompt appears. Prompt hangs in a separate Git Bash window? Use the VS Code terminal or `winpty php spark shell`.
4. **Read queries.** Type one line, press Enter, read the result, then the next line:
   ```text
   $db->table('departments')->orderBy('code')->get()->getResultArray()
   $db->table('departments')->where('code', 'BSM')->get()->getRow()->name
   $db->getLastQuery()->getQuery()
   $db->table('parking_zones')->like('location', 'aras')->countAllResults()
   $db->getLastQuery()->getQuery()
   $db->table('parking_zones')->select('code, name')->orderBy('name', 'DESC')->get()->getResultArray()
   ```
   Note the number returned by `countAllResults()` (a Quiz S6 question). `getLastQuery()` shows the SQL CI builds: column names in backticks, values in quotes, and `LIKE '%aras%' ESCAPE '!'`.
5. **Why the seeder needs `ignore(true)`.** In the same console:
   ```text
   $db->table('departments')->insert(['code' => 'BTM', 'name' => 'Pendua'])
   $db->table('departments')->ignore(true)->insert(['code' => 'BTM', 'name' => 'Pendua'])
   $db->affectedRows()
   $db->table('departments')->countAll()
   exit
   ```
   The first line throws the error *Duplicate entry 'BTM'* (the same as a seeder without `ignore(true)`). The second line returns `true` with no error. Note the value of `affectedRows()` (a Quiz S6 question); `countAll()` stays `4`.
6. Commit and push (`composer.json`, `composer.lock` and `app/Commands/Shell.php`):
   ```bash
   git add . && git commit -m "SETUP: php spark shell (PsySH)" && git push
   ```

### ✅ Checkpoint
- [ ] `php spark shell` opens a PsySH prompt with `$db` available (Quiz S6).
- [ ] `countAllResults()`, `getLastQuery()` and `affectedRows()` show the real counts and SQL in the console (Quiz S6).
- [ ] GitLab shows the commit `SETUP: php spark shell (PsySH)` (Quiz S6).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Command "shell" not found` | The file was not saved, or the namespace is not `App\Commands` | Save `app/Commands/Shell.php`; check `php spark list` (group `App`) |
| *shell: development sahaja (composer require --dev psy/psysh).* | PsySH not installed yet, or `CI_ENVIRONMENT` is not `development` | Repeat step 1; check `CI_ENVIRONMENT = development` in `.env` |
| `Undefined variable $db` | The `setScopeVariables` line is missing | Copy `Shell.php` above again |
| No prompt / arrow keys do not work | A separate Git Bash window (mintty) | VS Code terminal, or `winpty php spark shell` |
| `PARSE ERROR` | A line typed halfway, or a `;` in the middle | Retype the full line; a trailing `;` is optional |

### ⭐ Bonus challenge
Type `$db->table('parking_zones')->like('name', 'blok')->orLike('code', 'C')->getCompiledSelect()` — the SQL is printed without running. Where does the `OR` go, and why does `cari()` in Lab 3.4 wrap it in `groupStart()`?

---

## Lab 3.3b — Edit a department (S7)

### 🎯 Objective
Add `/jabatan/(:num)/edit` (a filled form) and POST `/jabatan/(:num)` that calls `$model->update($id, $data)`, prove that `is_unique[departments.code,id,{id}]` allows the record's own code but refuses another department's code, and return a 404 for an id that does not exist.

### Prerequisites
- [Lab 3.3](#lab-33--model--the-jabatan-pages-s3) done: `/jabatan` lists 5 departments including `BPP`.

> ⚠️ Test editing on `BPP` only. Do **not** change the codes of the four original departments (`BTM`, `BKW`, `BSM`, `BPA`): the Day 4 `UserSeeder` looks departments up by code. This lab does not build **delete**: from Day 4 `users.department_id` references `departments`, so deleting a department would clear the department of its users.

### Steps
1. **Routes** — add below the three `jabatan` routes in `app/Config/Routes.php`:
   ```php
   $routes->get('jabatan/(:num)/edit', 'Jabatan::edit/$1');
   $routes->post('jabatan/(:num)', 'Jabatan::kemaskini/$1');
   ```
   `(:num)` only accepts digits, so `/jabatan/abc/edit` is a straight 404. Day 4 gives a full `Routes.php` — make sure these two lines stay in it.
2. **Model** — `{id}` in `is_unique` is a *placeholder*: CI 4.7 only fills it when the `id` field is in the data **and** has its own rule. Replace the whole `app/Models/DepartmentModel.php` (only the `id` rule is new):

   `app/Models/DepartmentModel.php`

   ```php
   <?php

   namespace App\Models;

   use CodeIgniter\Model;

   class DepartmentModel extends Model
   {
       protected $table         = 'departments';
       protected $returnType    = 'array';
       protected $allowedFields = ['code', 'name'];
       protected $useTimestamps = true;

       protected $validationRules = [
           'id' => [
               'label' => 'ID',
               'rules' => 'permit_empty|is_natural_no_zero',
           ],
           'code' => [
               'label' => 'Kod',
               'rules' => 'required|alpha_numeric|max_length[20]|is_unique[departments.code,id,{id}]',
           ],
           'name' => [
               'label' => 'Nama',
               'rules' => 'required|min_length[3]|max_length[150]',
           ],
       ];
   }
   ```
   `permit_empty` lets `insert()` (no `id`) work as in Lab 3.3.
3. **Controller** — replace the whole `app/Controllers/Jabatan.php` (`index()`, `baharu()` and `simpan()` do not change):

   `app/Controllers/Jabatan.php`

   ```php
   <?php

   namespace App\Controllers;

   use App\Models\DepartmentModel;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\RedirectResponse;

   class Jabatan extends BaseController
   {
       protected $helpers = ['form'];

       public function index(): string
       {
           $jabatan = model(DepartmentModel::class)->orderBy('code')->findAll();

           return view('jabatan/index', ['jabatan' => $jabatan, 'tajuk' => 'Jabatan']);
       }

       public function baharu(): string
       {
           return view('jabatan/baharu', ['tajuk' => 'Jabatan baharu']);
       }

       public function simpan(): RedirectResponse
       {
           $model = model(DepartmentModel::class);
           $data  = $this->request->getPost(['code', 'name']);

           if ($model->insert($data) === false) {
               return redirect()->to('jabatan/baharu')->withInput()->with('errors', $model->errors());
           }

           return redirect()->to('jabatan')->with('berjaya', 'Jabatan ' . $data['code'] . ' disimpan.');
       }

       public function edit(int $id): string
       {
           $jabatan = model(DepartmentModel::class)->find($id);

           if ($jabatan === null) {
               throw PageNotFoundException::forPageNotFound('Jabatan tidak dijumpai.');
           }

           return view('jabatan/edit', ['jabatan' => $jabatan, 'tajuk' => 'Edit jabatan']);
       }

       public function kemaskini(int $id): RedirectResponse
       {
           $model = model(DepartmentModel::class);

           if ($model->find($id) === null) {
               throw PageNotFoundException::forPageNotFound('Jabatan tidak dijumpai.');
           }

           $data       = $this->request->getPost(['code', 'name']);
           $data['id'] = $id; // untuk {id} dalam is_unique; id bukan $allowedFields, jadi tidak ditulis

           if ($model->update($id, $data) === false) {
               return redirect()->to('jabatan/' . $id . '/edit')->withInput()->with('errors', $model->errors());
           }

           return redirect()->to('jabatan')->with('berjaya', 'Jabatan ' . $data['code'] . ' dikemas kini.');
       }
   }
   ```
   `update($id, $data)` runs the same `$validationRules` as `insert()`, **before** `$allowedFields` drops the other fields. The `{id}` placeholder in `is_unique` is filled from `$data['id']` — not from the first argument of `update()` — so the line `$data['id'] = $id;` is required. The result, for record id 5, is `is_unique[departments.code,id,5]`: the record's own code is not counted as a duplicate. `id` is not written to the table because it is not in `$allowedFields`.
4. **Edit form view** `app/Views/jabatan/edit.php` — the `baharu.php` pattern, but with starting values from the record:

   `app/Views/jabatan/edit.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Edit jabatan <?= esc($jabatan['code']) ?></h1>

   <?php $errors = session()->getFlashdata('errors') ?? [] ?>

   <form method="post" action="<?= site_url('jabatan/' . $jabatan['id']) ?>">
       <?= csrf_field() ?>

       <label for="code">Kod</label>
       <input id="code" name="code" maxlength="20" value="<?= esc(old('code', $jabatan['code'])) ?>">
       <?php if (isset($errors['code'])): ?><span class="ralat"><?= esc($errors['code']) ?></span><?php endif ?>

       <label for="name">Nama</label>
       <input id="name" name="name" maxlength="150" value="<?= esc(old('name', $jabatan['name'])) ?>">
       <?php if (isset($errors['name'])): ?><span class="ralat"><?= esc($errors['name']) ?></span><?php endif ?>

       <button type="submit">Kemas kini</button>
       <a href="<?= site_url('jabatan') ?>">Batal</a>
   </form>
   <?= $this->endSection() ?>
   ```
5. **List view** — replace the whole `app/Views/jabatan/index.php` (new **Tindakan** column):

   `app/Views/jabatan/index.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Jabatan</h1>

   <?php if (session()->getFlashdata('berjaya')): ?>
       <p class="berjaya"><?= esc(session()->getFlashdata('berjaya')) ?></p>
   <?php endif ?>

   <p><a href="<?= site_url('jabatan/baharu') ?>">+ Jabatan baharu</a></p>

   <table>
       <thead><tr><th>Kod</th><th>Nama</th><th>Dicipta</th><th>Tindakan</th></tr></thead>
       <tbody>
       <?php foreach ($jabatan as $j): ?>
           <tr>
               <td><?= esc($j['code']) ?></td>
               <td><?= esc($j['name']) ?></td>
               <td><?= esc($j['created_at']) ?></td>
               <td><a href="<?= site_url('jabatan/' . $j['id'] . '/edit') ?>">Edit</a></td>
           </tr>
       <?php endforeach ?>
       </tbody>
   </table>
   <?= $this->endSection() ?>
   ```
6. **Test and note** (Quiz S7 questions). `php spark serve`, open <http://localhost:8080/jabatan>, click **Edit** on `BPP`:
   - Keep Kod `BPP`, change Nama to `Bahagian Perolehan dan Kontrak (Latihan)`, click **Kemas kini** — what is shown?
   - Edit `BPP` again, change Kod to `BKW` → an error message under Kod; the form still shows `BKW` (`old()`).
   - Open <http://localhost:8080/jabatan/999/edit> → a 404 page *Jabatan tidak dijumpai.*
   - Stop the server (`Ctrl+C`) and run `php spark db:table departments --limit-field-value 40` (without this option long values are cut to `...`). Compare the `created_at` and `updated_at` columns of the `BPP` row.
7. Commit and push:
   ```bash
   git add . && git commit -m "JABATAN: edit & kemas kini" && git push
   ```

### ✅ Checkpoint
- [ ] `/jabatan/<id>/edit` shows a filled form and saves changes with `update()` (Quiz S7).
- [ ] The record's own code is accepted, another department's code is refused by `is_unique[departments.code,id,{id}]`, and `updated_at` is refreshed (Quiz S7).
- [ ] GitLab shows the commit `JABATAN: edit & kemas kini` (Quiz S7).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| The record's own code is refused: *The Kod field must contain a unique value.* | `$data['id'] = $id;` is missing — `{id}` is not filled, so the record counts as its own duplicate | Add `$data['id'] = $id;` before `update()` |
| *No validation rules for the placeholder: "id"* | The `id` rule was not added to `DepartmentModel` | Step 2: add the `id` rule to `$validationRules` |
| Saving creates a new row | The edit form posts to `site_url('jabatan')` (the `simpan` route) | `action="<?= site_url('jabatan/' . $jabatan['id']) ?>"` |
| `404 - Can't find a route for 'GET: jabatan/5/edit'` | Route not added, or segments in the wrong order | `$routes->get('jabatan/(:num)/edit', 'Jabatan::edit/$1');` |
| `Too few arguments to function … edit()` | `/$1` missing in the route | `'Jabatan::edit/$1'` and `'Jabatan::kemaskini/$1'` |
| Empty form after an error | `old('code')` with no default value | `old('code', $jabatan['code'])` |

### ⭐ Bonus challenge
Submit the `BPP` edit form with no changes, then check `updated_at` with `php spark db:table departments --limit-field-value 40`. Change `kemaskini()` so that it shows *Tiada perubahan.* and does not call `update()` when `code` and `name` are the same as the record from `find($id)`.

---

## Lab 3.4b — Zone details & sorting (S8)

### 🎯 Objective
Build a `/zon/(:num)` details page that returns a 404 (`PageNotFoundException`) for an id that does not exist, and a `?sort=code|name` option on `/zon` with a whitelist that keeps the `q` search and pagination.

### Prerequisites
- [Lab 3.4](#lab-34--zone-search--pagination-s4) done: `/zon` with search and pagination.

> This lab does **not** build adding/editing zones — admin CRUD comes later. `ParkingZoneModel` is not changed (Day 5 replaces that file); all the new logic lives in the controller and views.

### Steps
1. **Route** — add below the `zon` route in `app/Config/Routes.php`:
   ```php
   $routes->get('zon/(:num)', 'Zon::butiran/$1');
   ```
   Day 4 gives a full `Routes.php` — make sure this line stays in it.
2. **Controller** — replace the whole `app/Controllers/Zon.php`:

   `app/Controllers/Zon.php`

   ```php
   <?php

   namespace App\Controllers;

   use App\Models\ParkingZoneModel;
   use CodeIgniter\Exceptions\PageNotFoundException;

   class Zon extends BaseController
   {
       private const SUSUNAN = ['code', 'name'];

       public function index(): string
       {
           $q     = $this->request->getGet('q');
           $sort  = $this->request->getGet('sort');
           $sort  = in_array($sort, self::SUSUNAN, true) ? $sort : 'code';
           $model = model(ParkingZoneModel::class);

           if ($sort === 'name') {
               // Sebelum cari(): ORDER BY name dahulu, kemudian code dari cari().
               $model->orderBy('name');
           }

           $zon = $model->cari($q)->paginate(2);

           return view('zon/index', [
               'zon'   => $zon,
               'pager' => $model->pager,
               'q'     => $q,
               'sort'  => $sort,
               'tajuk' => 'Zon parkir',
           ]);
       }

       public function butiran(int $id): string
       {
           $zon = model(ParkingZoneModel::class)->find($id);

           if ($zon === null) {
               throw PageNotFoundException::forPageNotFound('Zon tidak dijumpai.');
           }

           return view('zon/butiran', ['zon' => $zon, 'tajuk' => 'Zon ' . $zon['code']]);
       }
   }
   ```
   - **Whitelist:** only `code` or `name` reaches `orderBy()`. Any other value (`location`, `id DESC`, odd text) falls back to `code`.
   - `cari()` always adds `orderBy('code')`; calling `orderBy('name')` **before** `cari()` makes `name` the main sort.
3. **List view** — replace the whole `app/Views/zon/index.php` (sort option + details link on the code):

   `app/Views/zon/index.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Zon parkir</h1>

   <form method="get" action="<?= site_url('zon') ?>">
       <input name="q" value="<?= esc($q ?? '') ?>" placeholder="Cari nama, lokasi atau kod">
       <select name="sort">
           <option value="code" <?= $sort === 'code' ? 'selected' : '' ?>>Susun ikut kod</option>
           <option value="name" <?= $sort === 'name' ? 'selected' : '' ?>>Susun ikut nama</option>
       </select>
       <button type="submit">Cari</button>
   </form>

   <?php if ($zon === []): ?>
       <p>Tiada zon sepadan dengan "<?= esc($q) ?>".</p>
   <?php else: ?>
       <table>
           <thead><tr><th>Kod</th><th>Nama</th><th>Lokasi</th></tr></thead>
           <tbody>
           <?php foreach ($zon as $z): ?>
               <tr>
                   <td><a href="<?= site_url('zon/' . $z['id']) ?>"><?= esc($z['code']) ?></a></td>
                   <td><?= esc($z['name']) ?></td>
                   <td><?= esc($z['location']) ?></td>
               </tr>
           <?php endforeach ?>
           </tbody>
       </table>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```
4. **Details view** `app/Views/zon/butiran.php`:

   `app/Views/zon/butiran.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Zon <?= esc($zon['code']) ?> — <?= esc($zon['name']) ?></h1>

   <table>
       <tr><th>Kod</th><td><?= esc($zon['code']) ?></td></tr>
       <tr><th>Nama</th><td><?= esc($zon['name']) ?></td></tr>
       <tr><th>Lokasi</th><td><?= esc($zon['location']) ?></td></tr>
       <tr><th>Dicipta</th><td><?= esc($zon['created_at']) ?></td></tr>
   </table>

   <p><a href="<?= site_url('zon') ?>">← Semua zon</a></p>
   <?= $this->endSection() ?>
   ```
5. **Test and note** (Quiz S8 questions):
   - <http://localhost:8080/zon?sort=name> — which zone is in the first row of page 1? Click the page 2 link: the URL still carries `sort=name`.
   - Choose **Susun ikut nama**, type `blok`, click **Cari** → two `Blok …` zones, URL `?q=blok&sort=name`.
   - Click code `A` → `/zon/<id>` shows the details *Zon A — Blok Utama*. Open <http://localhost:8080/zon/99> → a 404 *Zon tidak dijumpai.*
   - <http://localhost:8080/zon?sort=location> — `location` is not in the whitelist. Which zone is in the first row?
6. Commit and push:
   ```bash
   git add . && git commit -m "ZON: butiran + susunan" && git push
   ```

### ✅ Checkpoint
- [ ] `/zon/<id>` shows the zone details, and an id that does not exist returns a 404 (Quiz S8).
- [ ] `?sort=name` sorts by name, values outside the whitelist fall back to code, and pagination keeps `q` and `sort` (Quiz S8).
- [ ] GitLab shows the commit `ZON: butiran + susunan` (Quiz S8).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `?sort=name` does not change the order | `orderBy('name')` called **after** `cari()` (`ORDER BY code, name`) | Call `$model->orderBy('name')` before `$model->cari($q)` |
| *Undefined variable $sort* | `'sort' => $sort` not passed to the view | Follow `index()` above |
| `/zon/99` → error *Trying to access array offset on value of type null* | `find()` returns `null` and there is no check | `if ($zon === null) { throw PageNotFoundException::forPageNotFound(…); }` |
| `/zon/1` → `404 - Can't find a route` | The `zon/(:num)` route was not added | `$routes->get('zon/(:num)', 'Zon::butiran/$1');` |
| Page 2 goes back to code order | The form does not send `sort` | `<select name="sort">` inside the same `GET` form |

### ⭐ Bonus challenge
Add **Previous / Next** links to `butiran.php` using `where('code >', $zon['code'])->orderBy('code')->first()` in the controller. What should be shown on the last zone?

---

## Self-check — end of day

```bash
cd ~/latihan/kelas-ci-<nama>
php spark migrate:status        # 2 migration App, Batch 1
php spark db:table --show       # departments, migrations, parking_zones
php spark db:table --show --dbgroup tests   # kkm_latihan_test: Database has no tables!
php spark routes                # jabatan, jabatan/baharu, jabatan/([0-9]+)/edit, jabatan/([0-9]+), zon, zon/([0-9]+)
git log --oneline | head -8     # ZON x2, JABATAN x2, SETUP x2, DB, CI-ASAS
```
