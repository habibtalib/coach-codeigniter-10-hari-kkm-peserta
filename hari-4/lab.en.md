# Day 4 Lab — Development Kickoff

[⬅️ Day 4 README](./README.md) · [📘 SPEC](../docs/spesifikasi-sistem.md) · [🤝 COLLABORATION](../docs/kolaborasi.md) · 🧩 Code templates (**Templat & Rujukan** module)

> **Lab rule:** try **manually first** (read the error, check the specification, ask your neighbour). Use AI (Claude Code) only after 10 minutes stuck — and only to *explain*, not to generate whole files. The templates in `templates/kod/` are for **checking**, not copying.

| Lab | Session | Time | Outcome |
|-----|------|------|-------|
| 4.1 | S1 | 09:00–10:30 | `kelas-ci-<nama>` project demo + request lifecycle trace |
| 4.2 | S2 | 10:45–12:30 | Tests + Shield + Bootstrap layout (same project) |
| 4.3 | S3 | 14:30–16:00 | 8 more migrations (10 in total) + seeders + login |
| 4.4 | S4 | 16:00–17:00 | Work plan, branch + merge request, fresh clone |

---

## Lab 4.1 — Project Demo & Request Lifecycle Trace (S1)

### 🎯 Objective
Demo your `kelas-ci-<nama>` project (GitLab + `/zon`) and explain the 7 steps of the CI4 request lifecycle with evidence from the Debug Toolbar.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- [Lab 3.4](../hari-3/lab.en.md#lab-34--zone-search--pagination-s4) done: `/zon` works and GitLab shows the `ZON:` commit.

### Steps

1. `php spark serve`, open `http://localhost:8080/zon?q=aras`. Click the 🔥 **Debug Toolbar** icon (bottom-right corner — it only appears when `CI_ENVIRONMENT = development`).
2. **Timeline** tab — find and note the time for: `Routing`, `Before Filters`, `Controller`, `After Filters`.
3. **Routes** tab — note the controller & method matched for `/zon`.
4. **Database** tab — copy the SQL query that ran (it has `LIKE '%aras%'`). Find the `ParkingZoneModel` method that generates it.
5. **Views** tab — list the view files that were loaded (`zon/index`, `layout`, and the pager view).
6. Terminal:

   ```bash
   php spark routes
   ```

   Match the `zon` row to the controller method, and read the *Before Filters* column.
7. Create `docs/kitaran-request.md` in your project and fill in this table:

   | # | Langkah | Fail | Bukti (Toolbar/`spark routes`) |
   |---|---------|------|-------------------------------|
   | 1 | Front controller | `public/index.php` | |
   | 2 | Routing | | |
   | 3 | Filter before | | |
   | 4 | Controller | | |
   | 5 | Model | | |
   | 6 | View | | |
   | 7 | Response | | |

8. Commit and push (`git add docs/kitaran-request.md && git commit -m "DOCS: kitaran request /zon" && git push`), then give the trainer a 3-minute demo: your GitLab project page, `/zon?q=aras`, and the table above.

### ✅ Checkpoint
- `docs/kitaran-request.md` complete with 7 rows of evidence, pushed to GitLab.
- You can answer: *"If I add the `session` filter to the `/zon` route, which step changes and what happens to a user who is not logged in?"*

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| The Debug Toolbar does not appear | `CI_ENVIRONMENT` is not `development` / no `.env` | `cp env .env`, uncomment `CI_ENVIRONMENT = development` |
| `404 - Can't find a route for 'GET: zon'` | Lab 3.4 not finished or the route is missing | Add `$routes->get('zon', 'Zon::index');` |
| `Unable to connect to the database` | Wrong `.env` | Check `database.default.*`; try `hostname = 127.0.0.1` |
| `The required PHP extension "sqlite3" is not loaded` on `composer test` (Windows) | The appstarter's `tests` database group is still SQLite; Laragon does not enable `sqlite3` | The course uses MySQL for tests: copy the `database.tests.*` block from [`nota-10`](../docs/nota-10-ujian-phpunit-ci4.md) §3 into `.env` (database `kkm_latihan_test`) — Day 6 sets it too. Verified on Windows: after that `composer test` → `OK` |

### ⭐ Bonus challenge
Add `log_message('info', 'Zon::index q={q}', ['q' => (string) $q]);` to the controller, set `app/Config/Logger.php` `$threshold = 7`, then find that line in `writable/logs/log-YYYY-MM-DD.log`.

---

## Lab 4.2 — CI4 Project, `.env`, Shield & Layout (S2)

### 🎯 Objective
Set up tests (`composer test`) in the `kelas-ci-<nama>` project, check `.env`, install Shield with the profile fields & roles from SPEC §4, and build a Bootstrap 5.3 layout.

### Prerequisites
- Project `~/latihan/kelas-ci-<nama>` (Days 2–3): `.env` connected to `kkm_latihan`, the `departments` + `parking_zones` migrations already run
- Routes, controllers, a layout view, a form, validation and CSRF are already done in `kelas-ci-<nama>` (Labs 2.2–2.4). This lab adds tests, Shield and Bootstrap to the same project.
- Databases `kkm_latihan` & `kkm_latihan_test` + user `kkm_dev` ([Lab 3.1](../hari-3/lab.en.md#lab-31--mysql-database--env-s1))
- PHP ≥ 8.2 with `intl`, `mbstring`, `mysqli` (`php -m`)
- `php.ini` (for Pass document uploads, Day 7): `upload_max_filesize = 8M` and `post_max_size = 16M` or more. Check: `php -i | grep -E "upload_max_filesize|post_max_size"`. Find the file with `php --ini`; restart `php spark serve` after changing it.

### Steps

**A. Composer tests**

1. The project, `.gitattributes` and `.editorconfig` were already created in [Lab 2.2](../hari-2/lab.en.md#lab-22--your-ci-project-on-gitlab-s2). Set up the Composer test script:

   ```bash
   composer config process-timeout 0    # skrip Composer tidak dihentikan selepas 300 s (suite penuh di laptop perlahan)
   composer run-script --list
   ```

   The list must contain `test`. The appstarter `composer.json` already has `"scripts": { "test": "phpunit" }`; if it is missing, add that block. This course runs the tests with `composer test` (the same as `vendor/bin/phpunit`, and it works in Git Bash and the Windows Command Prompt). PHPUnit arguments go after `--`: `composer test -- --filter BookingStatusTest`.

   **Remove the coverage block.** Course laptops have no Xdebug/PCOV, and the appstarter `phpunit.dist.xml` asks for a coverage report with `failOnWarning="true"`. Without this step `composer test` prints *No code coverage driver available* and exits with code 1 even when every test passes. In VS Code, open `phpunit.dist.xml` and delete the whole `<coverage …> … </coverage>` block (keep `<source>`, `<testsuites>` and `<php>`). Check: `composer test` → `OK (…)`, exit code 0 (`echo $?` → `0`).

2. Verify:

   ```bash
   php spark --version
   ls app public writable spark
   ```

   > Version 4.7.x installed? That's fine — the course needs **4.6+**.

   Commit: `git add composer.json phpunit.dist.xml && git commit -m "SETUP: composer test tanpa coverage"`.

**B. `.env`**

3. `.env` already exists ([Lab 2.2](../hari-2/lab.en.md#lab-22--your-ci-project-on-gitlab-s2), [Lab 3.1](../hari-3/lab.en.md#lab-31--mysql-database--env-s1)). Open it and make sure all these values are there (add any that are missing, e.g. `app.indexPage = ''`; no `#` in front):

   ```ini
   CI_ENVIRONMENT = development

   app.baseURL = 'http://localhost:8080/'
   app.indexPage = ''
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

   > Port 8080 already used by another application? Change it in **both** places: `app.baseURL = 'http://localhost:8081/'` in `.env` and `php spark serve --port 8081`. If you change only the port, `base_url()`, links and Shield redirects still go to `:8080`.

4. Verify that Git ignores `.env`:

   ```bash
   git status --short | grep -c "\.env$"     # must be 0
   git check-ignore -v .env                 # must show the .gitignore line
   ```

5. Test the connection:

   ```bash
   php spark db:table --show
   php spark serve
   ```

   Open `http://localhost:8080` → the *Welcome to CodeIgniter* page.

**C. Shield**

6. Install and run setup (stop `serve` first with Ctrl+C):

   ```bash
   composer require codeigniter4/shield
   php spark shield:setup
   ```

   Answers to the interactive questions:

   | Question | Answer |
   |--------|-------|
   | `Config\Email::$fromEmail is not set. Do you set now?` | `y` → `noreply@latihan.test` |
   | `Config\Email::$fromName is not set. Do you set now?` | `y` → `Sistem TLK` |
   | ``Run `spark migrate --all` now?`` | `y` |

7. Generate your own user model:

   ```bash
   php spark shield:model UserModel
   ```

   Edit `app/Models/UserModel.php` — add the profile fields:

   ```php
   $this->allowedFields = [
       ...$this->allowedFields,
       'full_name',
       'staff_no',
       'department_id',
       'phone',
   ];
   ```

8. `app/Config/Auth.php` — find `$userProvider` and `$allowRegistration`, then change them:

   ```php
   public bool $allowRegistration = false;   // internal system: no self-registration
   public string $userProvider = \App\Models\UserModel::class;
   ```

   The internal KKM system does not allow self-registration: `/register` now redirects away with an error message. Accounts are created by `UserSeeder` (Lab 4.3 step 9) or by an admin:

   ```bash
   php spark shield:user create -n pemohon3 -e pemohon3@latihan.test -g applicant
   ```

   🪟 The password is asked interactively. In a separate Git Bash window (not the VS Code terminal), if the prompt does not appear: `winpty php spark shield:user create …`.

9. `app/Config/AuthGroups.php` — replace `$defaultGroup`, `$groups`, `$permissions`, `$matrix` with the values from SPEC §4 (4 groups: `applicant`, `reviewer`, `approver`, `admin`; 8 permissions: `admin.access`, `tlk.apply`, `tlk.decide`, `pas.apply`, `pas.review`, `pas.approve`, `laporan.view`, `statistik.view`). Write it yourself first based on README §2.3, then check it against `templates/kod/AuthGroups.php.txt` (**Templat & Rujukan** module).

10. `app/Config/Filters.php` — check that `$globals['before']` still contains `'csrf'` (turned on in Lab 2.4). (`shield:setup` only changes `Security::$csrfProtection = 'session'`; it does **not** turn on the CSRF filter.)

11. `app/Controllers/BaseController.php` — in `initController()`, load the form helpers **before** the `parent::initController(...)` line. If placed after it, the helpers are not loaded and `form_dropdown()` fails on Day 5 (*Call to undefined function*):

    ```php
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        $this->helpers = ['form', 'url'];   // MUST come before parent::initController()

        parent::initController($request, $response, $logger);
    }
    ```

**D. Bootstrap 5.3 layout**

12. Create `app/Views/partials/flash.php` — one-time flash messages shown after a redirect:

    ```php
    <?php foreach (['success', 'message'] as $key): ?>
        <?php if (session($key)): ?>
            <div class="alert alert-success"><?= esc(session($key)) ?></div>
        <?php endif ?>
    <?php endforeach ?>
    <?php if (session('error')): ?>
        <div class="alert alert-danger"><?= esc(session('error')) ?></div>
    <?php endif ?>
    ```

    > Course flash convention: `success` (TLK) and `message` (Pas, Days 7–8) = success message (green); `error` = red. This partial shows both success keys so the Pas controllers work without changes.
    >
    > **Per-field** validation errors do not go here. Forms show them with `validation_show_error('medan')` (Day 5), carried by `redirect()->back()->withInput()`.

13. Create `app/Views/layouts/main.php` — a minimal skeleton (we will polish it on Day 6 S4):

    ```php
    <?php $user = auth()->loggedIn() ? auth()->user() : null; ?>
    <!doctype html>
    <html lang="ms">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><?= esc($title ?? 'Sistem TLK & Pas') ?> · KKM (Latihan)</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    </head>
    <body class="bg-body-tertiary">
    <nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
        <div class="container">
            <a class="navbar-brand" href="<?= site_url('/') ?>"><i class="bi bi-p-square-fill"></i> TLK &amp; Pas</a>
            <?php if ($user !== null): ?>
                <span class="navbar-text ms-auto me-3"><?= esc($user->full_name ?? $user->username) ?></span>
                <a class="btn btn-outline-light btn-sm" href="<?= url_to('logout') ?>">Log Keluar</a>
            <?php endif ?>
        </div>
    </nav>
    <main class="container py-4">
        <?php if (! empty($title)): ?><h1 class="h3 mb-3"><?= esc($title) ?></h1><?php endif ?>
        <?= $this->include('partials/flash') ?>
        <?= $this->renderSection('content') ?>
    </main>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
    ```

    > No internet in the lab? Download `bootstrap.min.css`, `bootstrap.bundle.min.js` and the `bootstrap-icons/font` folder into `public/assets/` and change the `href` to `base_url('assets/…')`.

14. Create `app/Views/home.php`:

    ```php
    <?= $this->extend('layouts/main') ?>

    <?= $this->section('content') ?>
    <div class="p-4 bg-white rounded-3 border">
        <p class="lead mb-1">Selamat datang, <?= esc(auth()->user()->full_name ?? auth()->user()->username) ?>.</p>
        <p class="text-muted mb-0">Peranan: <?= esc(implode(', ', auth()->user()->getGroups())) ?></p>
    </div>
    <?= $this->endSection() ?>
    ```

15. `app/Controllers/Home.php`:

    ```php
    public function index(): string
    {
        return view('home', ['title' => 'Utama']);
    }
    ```

16. `app/Config/Routes.php` — protect the home page. Change the `/` line only; `php spark shield:setup` already added `service('auth')->routes($routes);` — do not add it a second time (duplicate routes):

    ```php
    $routes->get('/', 'Home::index', ['filter' => 'session', 'as' => 'home']);

    service('auth')->routes($routes);
    ```

### ✅ Checkpoint
- `php spark routes | grep -E "login|logout"` → the `login` (GET & POST) and `logout` routes exist.
- `http://localhost:8080/` (not logged in yet) → **redirected** to `http://localhost:8080/login` (no `index.php` in the URL).
- `php spark db:table --show` → the tables `users`, `auth_identities`, `auth_groups_users`, `settings`, `migrations` exist.
- `git status` does **not** list `.env`.
- `php spark list` — the first line ends with `UTC+08:00` (proof that `app.appTimezone` is read).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Your requirements could not be resolved… ext-intl` | The `intl` extension is missing | Enable `extension=intl` in `php.ini` (`php --ini` to find the file) |
| `shield:setup` → `TypeError … InputOutput::input(): Return value must be of type string, false returned` | Run without an interactive terminal (e.g. in a script/IDE) | Run it in the VS Code terminal (separate Git Bash window: `winpty php spark shield:setup`); or fill in `app/Config/Email.php` `$fromEmail`/`$fromName` first, then repeat |
| URL contains `/index.php/login` | `app.indexPage` not emptied yet | `.env`: `app.indexPage = ''` |
| `Class "App\Models\UserModel" not found` after changing `Auth.php` | Step 7 not done / wrong namespace | `php spark shield:model UserModel`; check `namespace App\Models;` |
| Blank page / no CSS | No internet access to the CDN | Use local copies in `public/assets/` |
| `The action you requested is not allowed.` | CSRF is on, the form has no token | Add `<?= csrf_field() ?>` inside every `<form method="post">` |

### ⭐ Bonus challenge
- Add `bi-person-circle` and the user's group list to the navbar using `$user->getGroups()`.
- Translate the login page into Malay: copy `vendor/codeigniter4/shield/src/Views/login.php` to `app/Views/auth/login.php`, change the text, then set `app/Config/Auth.php` → `$views['login'] = 'auth/login'`. (Don't edit files in `vendor/` — they are overwritten by `composer update`.)

---

## Lab 4.3 — Migrations & Seeders from the ERD (S3)

### 🎯 Objective
Complete the 10 migrations of specification §3 (2 from Lab 3.2 + 8 new, with FK, UNIQUE, INDEX), complete the idempotent seeders, and log in as a synthetic user.

### Prerequisites
- Lab 4.2 checkpoint passed (the Shield tables already exist)
- [`erd-rujukan.md`](../docs/erd-rujukan.md) and [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 open side by side
- `departments` + `parking_zones` and `DepartmentSeeder`/`ParkingSeeder`/`DatabaseSeeder` already exist from [Lab 3.2](../hari-3/lab.en.md#lab-32--first-migrations--seeders-s2)

### Steps

**A. Migrations — in FK order**

1. Generate the 8 new files **one by one, in this order** (the timestamp decides the run order; `CreateDepartmentsTable` and `CreateParkingZonesTable` from Lab 3.2 are earlier, so the FK order stays correct):

   ```bash
   php spark make:migration AddProfileFieldsToUsers
   php spark make:migration CreateParkingSlotsTable
   php spark make:migration CreateVehiclesTable
   php spark make:migration CreateSlotBookingsTable
   php spark make:migration CreatePassApplicationsTable
   php spark make:migration CreatePassDocumentsTable
   php spark make:migration CreateStatusLogsTable
   php spark make:migration CreateReferenceSequencesTable
   ```

2. Reopen `CreateDepartmentsTable` from Lab 3.2: the same `addField` + `addPrimaryKey` + `addUniqueKey` + `createTable(…, false, ['ENGINE' => 'InnoDB'])` pattern, with a `down()` that drops the table, is used for the 8 new files.

3. Write `AddProfileFieldsToUsers` (README §3.3 — `addColumn` + `processIndexes`). `down()`:

   ```php
   public function down(): void
   {
       $this->forge->dropForeignKey('users', 'users_department_id_fk');
       $this->forge->dropKey('users', 'users_staff_no_unique', false);
       $this->forge->dropColumn('users', ['full_name', 'staff_no', 'department_id', 'phone']);
   }
   ```

4. Run and test it **before** writing the others (short cycles!):

   ```bash
   php spark migrate
   php spark db:table users --metadata
   php spark migrate:rollback
   php spark migrate
   ```

5. Write the remaining 7 migrations based on [`erd-rujukan.md`](../docs/erd-rujukan.md) and specification §3. Checklist for each file:
   - [ ] Table & field names **exactly** as in SPEC §3
   - [ ] `id` INT UNSIGNED AI + `created_at`/`updated_at` DATETIME NULL
   - [ ] Only `parking_slots` has `deleted_at`; `status_logs` has only `created_at` (audit records are never updated)
   - [ ] UNIQUE: `parking_zones.code`, (`zone_id`,`slot_no`), `vehicles.plate_no`, `slot_bookings.ref_no`, `pass_applications.ref_no`, (`prefix`,`year`)
   - [ ] INDEX: `slot_bookings` (`slot_id`,`start_date`,`end_date`) & (`status`); `pass_applications` (`status`); `status_logs` (`module`,`record_id`)
   - [ ] Every FK: the same INT UNSIGNED type as the parent; `ON DELETE` chosen for a reason
   - [ ] `down()` removes what `up()` creates

   > ⏱️ **Falling behind?** If you are not done by minute 60 of the session, follow the trainer's catch-up plan: copy the `up()`/`down()` blocks from `templates/kod/migration-core-tables.php.txt` (**Templat & Rujukan** module) into the files generated by `make:migration` (keep the class names), then explain one FK and one `ON DELETE` to the trainer.

6. Run them all:

   ```bash
   php spark migrate
   php spark migrate:status
   ```

**B. Seeders**

7. Generate:

   ```bash
   php spark make:seeder UserSeeder
   php spark make:seeder VehicleSeeder
   ```

8. `DepartmentSeeder` already exists from Lab 3.2 (4 departments). The same `ignore(true)->insertBatch()` pattern is repeated for slots and vehicles below.

9. `UserSeeder` — write it based on README §3.4 (5 users, groups, `Latihan@2026`, `department_id` looked up by `code`, skip if the e-mail exists). Check it against `templates/kod/UserSeeder.php.txt` (**Templat & Rujukan** module).

10. `ParkingSeeder` — zones `A`, `B`, `C` were already filled in Lab 3.2. Add to the same file, after the zone `insertBatch`: 4 slots per zone (`A-01`…`C-04`) covering all five categories `oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`. Get `zone_id` with:

    ```php
    $zoneIds = array_column(
        $this->db->table('parking_zones')->select('id, code')->get()->getResultArray(),
        'id',
        'code',
    );   // ['A' => 1, 'B' => 2, 'C' => 3]
    ```

11. `VehicleSeeder` — made-up plates only: `pemohon1` → `WXX 1234` & `WXX 5678`; `pemohon2` → `VXX 2468`; `pelulus` → `WXY 1357`; `admin` → `BXX 9090`. Find users with `auth()->getProvider()->findByCredentials(['email' => …])`.

12. `DatabaseSeeder` — update the file from Lab 3.2 so the order is:

    ```php
    public function run(): void
    {
        $this->call(DepartmentSeeder::class);   // parent first
        $this->call(UserSeeder::class);         // needs departments
        $this->call(ParkingSeeder::class);
        $this->call(VehicleSeeder::class);      // needs users
    }
    ```

13. Run it **twice** (idempotency test):

    ```bash
    php spark db:seed DatabaseSeeder
    php spark db:seed DatabaseSeeder
    ```

14. `php spark serve` → log in at `http://localhost:8080/login` as `pelulus@latihan.test` / `Latihan@2026`.

### ✅ Checkpoint
- `php spark migrate:status` → 10 rows with namespace `App`, all with a *Migrated On* date.
- `php spark db:table --show` → **18 tables** (10 from the SPEC including `users` + 6 `auth_*` + `settings` + `migrations`).
- The second `db:seed` run has **no** `Duplicate entry` error.
- `php spark db:table auth_groups_users` → 5 rows (`applicant` ×2, `reviewer`, `approver`, `admin`).
- Home page after login: *"Selamat datang, Dr. Devi a/p Sampel. Peranan: approver"* ("Welcome, … Role: approver").
- FK test (in the MySQL client):

  ```sql
  INSERT INTO vehicles (user_id, plate_no, model, color) VALUES (999, 'WXX 0000', 'Ujian', 'Hitam');
  -- Expected: ERROR 1452 … a foreign key constraint fails
  ```

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `errno: 150 "Foreign key constraint is incorrectly formed"` | FK type ≠ PK type (signed vs unsigned) or the parent table does not exist yet | Match `'unsigned' => true`; check the timestamp order of the file names |
| `Table 'kkm_latihan.users' doesn't exist` during `AddProfileFieldsToUsers` | The Shield migrations have not been run | `php spark migrate --all` |
| `Nothing to migrate` after changing a file | The file is already recorded in the `migrations` table | `php spark migrate:rollback` → `php spark migrate` |
| `Duplicate entry 'BTM' for key 'code'` on the second seed | Plain `insertBatch()`, not `ignore(true)` | Use `->ignore(true)->insertBatch()` |
| `Call to a member function addGroup() on null` | `findById()` called with the wrong ID | Use `$users->getInsertID()` **after** `save()` |
| Login fails with "Unable to log you in" | Password not hashed (inserted straight into the DB) | Create users only through `UserModel::save(new User([...]))` |
| Slot IDs start from 13, not 1, after the second seed | InnoDB `INSERT IGNORE` still "uses up" AUTO_INCREMENT values | Normal — don't hard-code IDs in code/tests |

### ⭐ Bonus challenge
- Write a `migrate:refresh --all` → `db:seed` test and time it (`time php spark …`). Add a Composer script `"reset-db"` in `composer.json`.
- Add a `TlkDemoSeeder` (not called by `DatabaseSeeder`) that creates 3 sample bookings — useful for Day 9 (Reports). **Don't** hard-code `ref_no`; it will be generated by `ReferenceNumberService` tomorrow.

---

## Lab 4.4 — Task Split, Git Branches & DoD (S4)

### 🎯 Objective
Push clean `SETUP:` commits to GitLab, write your work plan, try the branch → merge request into your own `main` flow once, and prove the repo is complete with a fresh clone.

### Prerequisites
- Lab 4.3 checkpoint passed

### Steps

1. Check what will be committed — **no** `.env`, `vendor/`, `writable/session/*`:

   ```bash
   git status --short | head -30
   git status --short | grep -E "\.env$|^.. vendor/" || echo "OK: tiada fail sulit/vendor"
   ```

2. Commit in stages (meaningful messages, `SETUP:` prefix):

   ```bash
   git add composer.json composer.lock spark env public app/Config app/Controllers app/Views builds preload.php phpunit*.dist* tests writable .gitignore LICENSE
   git commit -m "SETUP: Shield + layout Bootstrap"
   git add app
   git commit -m "SETUP: 8 migration SPEC §3 + seeder sintetik"
   ```

   > `writable` is committed only to keep the folder structure: the `cache/`, `logs/`, `session/`, `uploads/`, `debugbar/` subfolders hold only `index.html` (the appstarter's `.gitignore` ignores everything else), so logs and sessions are not committed. Without it, a fresh clone (step 6) has no `writable/` and fails.

   > CI 4.6 names the test file `phpunit.xml.dist`; 4.7+ uses `phpunit.dist.xml`. The `phpunit*.dist*` pattern adds whichever exists.

3. Push to GitLab:

   ```bash
   git push
   ```

4. Create `docs/pelan-kerja.md`:

   ```markdown
   # Pelan Kerja — <nama>

   ## Cabang
   | Hari | Cabang | Status |
   |------|--------|--------|
   | 5 | feat/tlk-model | ⬜ |
   | 5 | feat/tlk-crud | ⬜ |
   | 5 | feat/tlk-borang-tempahan | ⬜ |
   | 6 | feat/tlk-ketersediaan | ⬜ |
   | 6 | feat/tlk-keputusan | ⬜ |
   | 6 | feat/tlk-ujian | ⬜ |

   ## Definition of Done (salin dari kolaborasi §2)
   - [ ] …
   ```

5. Try the branch + merge request flow once (a 10-minute exercise):

   ```bash
   git switch -c feat/pelan-kerja
   git add docs/pelan-kerja.md
   git commit -m "DOCS: pelan kerja + DoD"
   git push -u origin feat/pelan-kerja
   ```

   On GitLab: **Create merge request** (target: `main` of your own repo) → ask the trainer (a Reporter since Lab 2.2) or your neighbour for one comment → **Merge**. Invite your neighbour first: *Members → Invite members*, role **Reporter**. Then:

   ```bash
   git switch main
   git pull
   git log --oneline --graph -5
   ```

6. **Fresh clone** into another folder to prove the repo is complete. The clone uses the test database so every table is built from empty (its tables are dropped again every time the tests run, so it is safe to use). Stop the original project's `php spark serve` first (`Ctrl+C`):

   ```bash
   cd ~/latihan
   git clone https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git kelas-ci-<nama>-klon
   cd kelas-ci-<nama>-klon
   composer install
   cp ../kelas-ci-<nama>/.env .env
   ```

   In the clone's `.env`, change **one** line: `database.default.database = kkm_latihan_test`. Then:

   ```bash
   php spark migrate --all
   php spark db:seed DatabaseSeeder
   php spark serve
   ```

   Log in as `pelulus@latihan.test` / `Latihan@2026`. It works? Delete the clone folder: `cd ~/latihan && rm -rf kelas-ci-<nama>-klon`.

### ✅ Checkpoint
- `git log --oneline` shows ≥ 2 `SETUP:` commits and one `feat/pelan-kerja` merge on GitLab.
- `git ls-files | grep -c "^\.env$"` → `0`.
- The fresh-clone recipe (step 6) works up to login — **this proves your migrations & seeders are complete**.
- `docs/pelan-kerja.md` exists and you can name 3 DoD items without looking.

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `.env` listed in `git status` | The appstarter's `.gitignore` was changed | Add the lines `.env` and `/vendor/` to `.gitignore` |
| `.env` already committed | An accidental `git add -f` | `git rm --cached .env` → commit → **change the DB password** (it has already leaked into the history) |
| `composer install` fails on the fresh clone | `composer.lock` was not committed | Commit `composer.lock` |
| No *Merge* button on GitLab | Your account is not a Maintainer of the project, or the MR is still *Draft* | The project is in your own namespace (you are the Owner); remove the *Draft* mark |
| `migrate --all` on the clone → `Nothing to migrate` | The clone's `.env` still points to `kkm_latihan` | Change `database.default.database = kkm_latihan_test` |

### ⭐ Bonus challenge
Protect `main` on GitLab (*Settings → Repository → Protected branches*: *Allowed to push* = **No one**) so every change from Day 5 onward goes through a merge request.

---

## Self-check — end of day

```bash
php spark migrate:status    # every App, Shield & Settings migration marked as run
git status --short          # no output
git log --oneline           # ≥ 2 SETUP: commits
```

- [ ] `php spark serve` → `http://localhost:8080/` redirects to the login page without errors.
- [ ] `php spark migrate:status` shows **all** migrations (10 App + Shield + Settings) as run.
- [ ] Logging in as `pelulus@latihan.test` / `Latihan@2026` works; `pemohon1@latihan.test` too.
- [ ] `git status --short` is empty and `git ls-files | grep -c "^\.env$"` → `0`.
- [ ] `git log --oneline` shows ≥ 2 `SETUP:` commits.
- [ ] A fresh clone (Lab 4.4 step 6) works through to login.
