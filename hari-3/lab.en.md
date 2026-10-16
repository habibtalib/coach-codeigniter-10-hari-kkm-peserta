# Day 3 Lab — Database, Migrations, Models & Search

[📅 Schedule](../JADUAL.md) · [📘 Specification](../docs/spesifikasi-sistem.md) · [📖 Day 3 README](./README.md) · [⚡ spark commands](../docs/arahan-spark.md)

| Lab | Session | Output |
|-----|---------|--------|
| [Lab 3.1](#lab-31--mysql-database--env-s1) | S1 | Databases `kkm_latihan` + `kkm_latihan_test`, user `kkm_dev`, `.env` connected |
| [Lab 3.2](#lab-32--first-migrations--seeders-s2) | S2 | Migrations for `departments` + `parking_zones`, idempotent seeders; commit pushed |
| [Lab 3.3](#lab-33--model--the-jabatan-pages-s3) | S3 | `DepartmentModel` + `/jabatan` (list & new form); commit pushed |
| [Lab 3.4](#lab-34--zone-search--pagination-s4) | S4 | `/zon` with `?q=` search & pagination; commit pushed |

> All work happens in your **individual** project `~/latihan/kelas-ci-<nama>` (Day 2). Tables & fields follow [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 and [`erd-rujukan.md`](../docs/erd-rujukan.md) — you do not draw the ERD yourself. The original ERD/data dictionary/wireframe material is now optional reading in [`rujukan-keperluan.md`](../docs/rujukan-keperluan.md).

---

## Lab 3.1 — MySQL database & `.env` (S1)

### 🎯 Objective
Create the development and test databases with a dedicated user `kkm_dev`, connect the `kelas-ci-<nama>` project through `.env`, and confirm the connection with `php spark db:table --show`.

### Prerequisites
- [Lab 2.4](../hari-2/lab.en.md#lab-24--form-validation--csrf-s4) done: GitLab shows 4 commits.
- Laragon → **Start All** (MySQL green). A Git Bash terminal in VS Code.

> 🔍 **Proof of work:** the platform ticks today's lab checkpoints when you **pass the Day quiz** — its questions can only be answered by running the code.

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
- [ ] `SHOW DATABASES LIKE 'kkm_latihan%'` as `kkm_dev` lists two databases (Quiz day).
- [ ] `php spark db:table --show` prints *Database has no tables!* with no connection error (Quiz day).

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

   ```php
   public function up(): void
   {
       // TODO: addField — id, code, name, created_at, updated_at
       // TODO: addPrimaryKey, addUniqueKey('code'), createTable('departments', …)
   }
   public function down(): void { /* TODO: dropTable('departments', true) */ }
   ```

   Stuck for more than 10 minutes? Full reference code: [3.2-2](../docs/kod-rujukan-hari-3.en.md#32-2--createdepartmentstable)
3. **`CreateParkingZonesTable`** — the same pattern, fields per specification §3 (`code` VARCHAR(10) UNIQUE, `name` VARCHAR(100), `location` VARCHAR(150)):

   Hints: the same as `CreateDepartmentsTable`, fields `code` VARCHAR 10 UNIQUE, `name` VARCHAR 100, `location` VARCHAR 150.

   ```php
   public function up(): void
   {
       // TODO: addField — id, code, name, location, created_at, updated_at
       // TODO: addPrimaryKey, addUniqueKey('code'), createTable('parking_zones', …)
   }
   public function down(): void { /* TODO: dropTable('parking_zones', true) */ }
   ```

   Stuck for more than 10 minutes? Full reference code: [3.2-3](../docs/kod-rujukan-hari-3.en.md#32-3--createparkingzonestable)
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
   Note the **number of tables** in `db:table --show` and the value of the **Batch** column after rollback + migrate — Day quiz questions.
5. **Seeders.** Generate three files:
   ```bash
   php spark make:seeder DepartmentSeeder
   php spark make:seeder ParkingSeeder
   php spark make:seeder DatabaseSeeder
   ```
   `DepartmentSeeder` — `ignore(true)` makes it `INSERT IGNORE`, so a second run adds no duplicate rows:

   Data (copy exactly — the Day quiz depends on it): `BTM` Bahagian Teknologi Maklumat (Latihan) · `BKW` Bahagian Kewangan (Latihan) · `BSM` Bahagian Sumber Manusia (Latihan) · `BPA` Bahagian Pengurusan Aset (Latihan). Fill `created_at` and `updated_at` with `date('Y-m-d H:i:s')`.

   ```php
   public function run(): void
   {
       $rows = [/* TODO: 4 jabatan di atas + created_at/updated_at */];
       // TODO: table('departments')->ignore(true)->insertBatch($rows)
   }
   ```

   Stuck for more than 10 minutes? Full reference code: [3.2-5a](../docs/kod-rujukan-hari-3.en.md#32-5a--departmentseeder)
   `ParkingSeeder` — three zones (Day 4 adds slots in the same file):

   Data (copy exactly): `A` Blok Utama — *Aras G, pintu masuk utama* · `B` Blok Klinik — *Sebelah klinik pakar* · `C` Parkir Bertingkat — *Aras 1–3, bangunan parkir*.

   ```php
   public function run(): void
   {
       $zones = [/* TODO: zon A, B, C di atas + created_at/updated_at */];
       // TODO: table('parking_zones')->ignore(true)->insertBatch($zones)
   }
   ```

   Stuck for more than 10 minutes? Full reference code: [3.2-5b](../docs/kod-rujukan-hari-3.en.md#32-5b--parkingseeder)
   `DatabaseSeeder` — calls the other seeders in order:

   Hints: `$this->call(DepartmentSeeder::class)` — parent first.

   ```php
   public function run(): void
   {
       // TODO: $this->call(DepartmentSeeder::class) dan ParkingSeeder
   }
   ```

   Stuck for more than 10 minutes? Full reference code: [3.2-5c](../docs/kod-rujukan-hari-3.en.md#32-5c--databaseseeder)
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
- [ ] `php spark migrate:status` shows 2 `App` migrations with a *Migrated On* date (Quiz day).
- [ ] After `db:seed` twice, `departments` has 4 rows and `parking_zones` 3 rows (Quiz day).
- [ ] GitLab shows the commit `DB: migration departments + parking_zones, seeder` (Quiz day).

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

   ```php
   class DepartmentModel extends Model
   {
       // TODO: $table, $returnType = 'array', $allowedFields, $useTimestamps
       // TODO: $validationRules — code (label Kod) & name (label Nama)
   }
   ```

   Stuck for more than 10 minutes? Full reference code: [3.3-1](../docs/kod-rujukan-hari-3.en.md#33-1--departmentmodel)
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

   ```php
   class Jabatan extends BaseController
   {
       protected $helpers = ['form'];
       // TODO: index() — senarai ikut code; baharu() — borang
       // TODO: simpan() — insert(); gagal → withInput + errors; berjaya → flash
   }
   ```

   Stuck for more than 10 minutes? Full reference code: [3.3-3](../docs/kod-rujukan-hari-3.en.md#33-3--jabatan)
   Validation happens in the **model**: `insert()` returns `false` and `$model->errors()` gives the messages per field.
4. **List view** `app/Views/jabatan/index.php`:

   Hints: the same as `daftar.php` (Lab 2.4): `session()->getFlashdata('berjaya')`, `site_url('jabatan/baharu')`, every value through `esc()`.

   ```php
   <?= $this->extend('layout') ?>
   <?= $this->section('content') ?>
   <!-- TODO: h1, flash 'berjaya', pautan + Jabatan baharu -->
   <!-- TODO: jadual Kod | Nama | Dicipta — foreach $jabatan, esc() -->
   <?= $this->endSection() ?>
   ```

   Stuck for more than 10 minutes? Full reference code: [3.3-4](../docs/kod-rujukan-hari-3.en.md#33-4--jabatanindexphp)
5. **Form view** `app/Views/jabatan/baharu.php`:

   Hints: inputs `name="code"` and `name="name"` with `esc(old('code'))`; field errors `$errors['code']` / `$errors['name']` in a `<span class="ralat">`.

   ```php
   <?= $this->extend('layout') ?>
   <?= $this->section('content') ?>
   <!-- TODO: $errors = session()->getFlashdata('errors') ?? [] -->
   <!-- TODO: form POST jabatan + csrf_field(); code & name + old() + ralat -->
   <?= $this->endSection() ?>
   ```

   Stuck for more than 10 minutes? Full reference code: [3.3-5](../docs/kod-rujukan-hari-3.en.md#33-5--jabatanbaharuphp)
6. **Test.** `php spark serve`, open <http://localhost:8080/jabatan> (4 departments, ordered by code). Click **+ Jabatan baharu**:
   - Submit empty → Kod and Nama errors.
   - Submit Kod `BTM` → note the **exact** error message under Kod (a Day quiz question).
   - Submit Kod `BPP`, Nama `Bahagian Perolehan (Latihan)` → back to the list with *"Jabatan BPP disimpan."* and the **Dicipta** column holding a date and time.
7. Commit and push:
   ```bash
   git add . && git commit -m "JABATAN: model, senarai & borang baharu" && git push
   ```

### ✅ Checkpoint
- [ ] `/jabatan` lists departments from the database through `DepartmentModel` (Quiz day).
- [ ] A duplicate code is refused with the model's validation message; a new department is saved with an automatic `created_at` (Quiz day).
- [ ] GitLab shows the commit `JABATAN: model, senarai & borang baharu` (Quiz day).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| *The Kod field is required.* even though Kod is filled in | The form's `name` attribute does not match the model field | `name="code"` and `name="name"` exactly, the same as `$allowedFields` |
| A duplicate code is not refused | `is_unique` missing or the wrong table name | `is_unique[departments.code,id,{id}]` |
| Errors are not shown | Missing `->with('errors', $model->errors())` or no `withInput()` | Follow `simpan()` above |
| The Dicipta column is empty | `$useTimestamps` missing | `protected $useTimestamps = true;` |
| *The action you requested is not allowed.* | The form has no `csrf_field()` (global CSRF from Lab 2.4) | Add `<?= csrf_field() ?>` |

### ⭐ Bonus challenge
Add `/jabatan/(:num)/edit` (GET a filled form, POST `update($id, $data)`) with its own routes and view. Why does `{id}` in `is_unique` matter now?

⭐ **Interactive console:** build `php spark shell` ([spark commands](../docs/arahan-spark.md#php-spark-shell)), then try `model(App\Models\DepartmentModel::class)->insert(['code' => 'UJI', 'name' => 'Ujian'])` twice and read `->errors()` — the same message as in the `/jabatan` form?

---

## Lab 3.4 — Zone search & pagination (S4)

### 🎯 Objective
Build `/zon` **on your own** with the Lab 3.3 pattern: a `ParkingZoneModel` with a Query Builder search method (`like()` / `orLike()` inside `groupStart()`), a `GET ?q=` search form, and pagination.

### Prerequisites
- [Lab 3.3](#lab-33--model--the-jabatan-pages-s3) done.

### Steps
1. **Model** `app/Models/ParkingZoneModel.php` with a `cari()` method:

   Generate the file: `php spark make:model ParkingZoneModel`. Hints: `$table = 'parking_zones'`, `$allowedFields = ['code', 'name', 'location']`, `$useTimestamps = true`; `trim((string) $q)`; `like('name', $q)`, `orLike('location', $q)`, `orLike('code', $q)`.

   ```php
   public function cari(?string $q): static
   {
       // TODO: jika $q tidak kosong: groupStart()->like()->orLike()->orLike()->groupEnd()
       // TODO: return $this->orderBy('code');
   }
   ```

   Stuck for more than 10 minutes? Full reference code: [3.4-1](../docs/kod-rujukan-hari-3.en.md#34-1--parkingzonemodel)
2. **Controller** `app/Controllers/Zon.php` — 2 zones per page so pagination shows with 3 zones:

   Generate the file: `php spark make:controller Zon`. Hints: `$model = model(ParkingZoneModel::class)`; pass `'pager' => $model->pager` after `paginate()`.

   ```php
   public function index(): string
   {
       // TODO: $q dari getGet('q'); $zon = $model->cari($q)->paginate(2)
       // TODO: view('zon/index', [zon, pager, q, tajuk])
   }
   ```

   Stuck for more than 10 minutes? Full reference code: [3.4-2](../docs/kod-rujukan-hari-3.en.md#34-2--zon)
3. **Route:**
   ```php
   $routes->get('zon', 'Zon::index');
   ```
4. **View** `app/Views/zon/index.php`:

   Hints: `<form method="get" action="<?= site_url('zon') ?>">`; `$zon === []` for no results (*Tiada zon sepadan dengan "…".*); `<?= $pager->links() ?>`.

   ```php
   <?= $this->extend('layout') ?>
   <?= $this->section('content') ?>
   <!-- TODO: borang GET zon dengan input q (value esc($q)) -->
   <!-- TODO: tiada hasil → mesej; ada → jadual + $pager->links() -->
   <?= $this->endSection() ?>
   ```

   Stuck for more than 10 minutes? Full reference code: [3.4-4](../docs/kod-rujukan-hari-3.en.md#34-4--zonindexphp)
5. **Test and note** (Day quiz questions):
   - <http://localhost:8080/zon> → page 1 (A, B) and a link to page 2 (C).
   - <http://localhost:8080/zon?q=KLINIK> (capital letters) — which zone is shown?
   - <http://localhost:8080/zon?q=aras> — the pagination links still carry `q=aras`.
   - Type `' OR 1=1 --` in the search box — what is shown?
6. Commit and push:
   ```bash
   git add . && git commit -m "ZON: carian + pagination" && git push
   ```

### ✅ Checkpoint
- [ ] `/zon` shows 2 zones per page with pagination links (Quiz day).
- [ ] The `?q=` search filters by name, location or code, and the input `' OR 1=1 --` does not break the query (Quiz day).
- [ ] GitLab shows the commit `ZON: carian + pagination` (Quiz day).

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

## Self-check — end of day

```bash
cd ~/latihan/kelas-ci-<nama>
php spark migrate:status        # 2 migration App, Batch 1
php spark db:table --show       # departments, migrations, parking_zones
php spark routes                # jabatan (GET/POST), jabatan/baharu, zon
git log --oneline | head -4     # ZON, JABATAN, DB, CI-ASAS
```
