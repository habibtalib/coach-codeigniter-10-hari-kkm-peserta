# Day 4 Lab — Development Kickoff

[⬅️ Day 4 README](./README.md) · [📘 SPEC](../docs/spesifikasi-sistem.md) · [🤝 COLLABORATION](../docs/kolaborasi.md) · 🧩 Code templates (**Templat & Rujukan** module) · [⚡ spark commands](../docs/arahan-spark.md)

> **Lab rule:** Every step gives **complete code to copy**. Read every line before you run it — you must be able to explain it (KOLABORASI §3). Stuck: read the full error message, ask the trainer or your neighbour, or use AI to *explain* the error.

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

   **Remove the coverage block.** Course laptops have no Xdebug/PCOV, and the appstarter `phpunit.dist.xml` asks for a coverage report with `failOnWarning="true"`. Without this step `composer test` prints *No code coverage driver available* and exits with code 1 even when every test passes. In VS Code, open `phpunit.dist.xml` and delete this whole `<coverage …> … </coverage>` block (keep `<source>`, `<testsuites>` and `<php>`):

   ```xml
   <coverage pathCoverage="false" ignoreDeprecatedCodeUnits="true">
       <report>
           <clover outputFile="build/logs/clover.xml"/>
           <html outputDirectory="build/logs/html"/>
           <php outputFile="build/logs/coverage.serialized"/>
           <text outputFile="php://stdout" showUncoveredFiles="false"/>
       </report>
   </coverage>
   ```

   Check: `composer test` → `OK (…)`, exit code 0 (`echo $?` → `0`).

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

   Replace the whole content of the generated `app/Models/UserModel.php` with this code (the profile fields are added in `initialize()`):

   `app/Models/UserModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use CodeIgniter\Shield\Models\UserModel as ShieldUserModel;

   class UserModel extends ShieldUserModel
   {
       protected function initialize(): void
       {
           parent::initialize();

           $this->allowedFields = [
               ...$this->allowedFields,   // medan Shield asal
               'full_name',
               'staff_no',
               'department_id',
               'phone',
           ];
       }
   }
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

9. `app/Config/AuthGroups.php` — replace the whole content of the file with the code below: the SPEC §4 values (4 groups: `applicant`, `reviewer`, `approver`, `admin`; 8 permissions: `admin.access`, `tlk.apply`, `tlk.decide`, `pas.apply`, `pas.review`, `pas.approve`, `laporan.view`, `statistik.view`). The long comments in the original Shield file are not needed.

   `app/Config/AuthGroups.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Config;

   use CodeIgniter\Shield\Config\AuthGroups as ShieldAuthGroups;

   class AuthGroups extends ShieldAuthGroups
   {
       // Group untuk pengguna baharu (SPEC §4)
       public string $defaultGroup = 'applicant';

       public array $groups = [
           'applicant' => [
               'title'       => 'Pemohon',
               'description' => 'Kakitangan pemohon',
           ],
           'reviewer' => [
               'title'       => 'Penyemak',
               'description' => 'Pegawai penyemak pas',
           ],
           'approver' => [
               'title'       => 'Pelulus',
               'description' => 'Pegawai pelulus pas & tempahan TLK',
           ],
           'admin' => [
               'title'       => 'Pentadbir',
               'description' => 'Pentadbir sistem',
           ],
       ];

       // Setiap permission dalam $matrix mesti diisytihar di sini
       public array $permissions = [
           'admin.access'   => 'Akses modul pentadbir (slot, zon, pengguna)',
           'tlk.apply'      => 'Memohon tempahan TLK',
           'tlk.decide'     => 'Meluluskan / menolak tempahan TLK',
           'pas.apply'      => 'Memohon pas',
           'pas.review'     => 'Menyemak permohonan pas',
           'pas.approve'    => 'Meluluskan permohonan pas',
           'laporan.view'   => 'Melihat & mengeksport laporan',
           'statistik.view' => 'Melihat dashboard statistik',
       ];

       public array $matrix = [
           'applicant' => ['tlk.apply', 'pas.apply'],
           'reviewer'  => ['pas.review', 'laporan.view'],
           'approver'  => ['tlk.decide', 'pas.approve', 'laporan.view', 'statistik.view'],
           'admin'     => ['admin.*', 'tlk.*', 'pas.*', 'laporan.*', 'statistik.*'],   // * = semua dalam skop
       ];
   }
   ```

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

15. `app/Controllers/Home.php` — replace the whole file:

    `app/Controllers/Home.php`

    ```php
    <?php

    namespace App\Controllers;

    class Home extends BaseController
    {
        public function index(): string
        {
            return view('home', ['title' => 'Utama']);
        }
    }
    ```

16. `app/Config/Routes.php` — protect the home page. Only the `/` line changes (`session` `filter` + route name `home`); the `jabatan` and `zon` routes from Day 3 stay. `php spark shield:setup` already added `service('auth')->routes($routes);` at the end — do not add it a second time (duplicate routes). The whole file after the change:

    `app/Config/Routes.php`

    ```php
    <?php

    use CodeIgniter\Router\RouteCollection;

    /** @var RouteCollection $routes */
    $routes->get('/', 'Home::index', ['filter' => 'session', 'as' => 'home']);
    $routes->get('jabatan', 'Jabatan::index');
    $routes->get('jabatan/baharu', 'Jabatan::baharu');
    $routes->post('jabatan', 'Jabatan::simpan');
    $routes->get('zon', 'Zon::index');

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

3. Fill in `AddProfileFieldsToUsers` (README §3.3 — `addColumn` + `processIndexes`). Replace the whole content of the generated file:

   `app/Database/Migrations/…_AddProfileFieldsToUsers.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   /**
    * Jadual `users` dicipta oleh Shield. Kita TIDAK mengubah migration Shield —
    * kita tambah medan profil melalui migration sendiri.
    */
   class AddProfileFieldsToUsers extends Migration
   {
       public function up(): void
       {
           $this->forge->addColumn('users', [
               'full_name'     => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true, 'after' => 'username'],
               'staff_no'      => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true, 'after' => 'full_name'],
               'department_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true, 'after' => 'staff_no'],
               'phone'         => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true, 'after' => 'department_id'],
           ]);

           // Tambah UNIQUE + FK pada jadual sedia ada: addKey/addForeignKey + processIndexes()
           $this->forge->addUniqueKey('staff_no', 'users_staff_no_unique');
           $this->forge->addForeignKey('department_id', 'departments', 'id', 'CASCADE', 'SET NULL', 'users_department_id_fk');
           $this->forge->processIndexes('users');
       }

       public function down(): void
       {
           $this->forge->dropForeignKey('users', 'users_department_id_fk');
           $this->forge->dropKey('users', 'users_staff_no_unique', false);
           $this->forge->dropColumn('users', ['full_name', 'staff_no', 'department_id', 'phone']);
       }
   }
   ```

4. Run and test it **before** writing the others (short cycles!):

   ```bash
   php spark migrate
   php spark db:table users --metadata
   php spark migrate:rollback
   php spark migrate
   ```

5. Fill in the remaining 7 migrations with the code below (based on [`erd-rujukan.md`](../docs/erd-rujukan.md) and specification §3). Replace the whole content of each file generated by `make:migration`; the class names already match. Checklist for each file:
   - [ ] Table & field names **exactly** as in SPEC §3
   - [ ] `id` INT UNSIGNED AI + `created_at`/`updated_at` DATETIME NULL
   - [ ] Only `parking_slots` has `deleted_at`; `status_logs` has only `created_at` (audit records are never updated)
   - [ ] UNIQUE: `parking_zones.code`, (`zone_id`,`slot_no`), `vehicles.plate_no`, `slot_bookings.ref_no`, `pass_applications.ref_no`, (`prefix`,`year`)
   - [ ] INDEX: `slot_bookings` (`slot_id`,`start_date`,`end_date`) & (`status`); `pass_applications` (`status`); `status_logs` (`module`,`record_id`)
   - [ ] Every FK: the same INT UNSIGNED type as the parent; `ON DELETE` chosen for a reason
   - [ ] `down()` removes what `up()` creates

   `app/Database/Migrations/…_CreateParkingSlotsTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreateParkingSlotsTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'zone_id'    => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'slot_no'    => ['type' => 'VARCHAR', 'constraint' => 10],
               'category'   => ['type' => 'VARCHAR', 'constraint' => 20], // nilai App\Enums\SlotCategory
               'is_active'  => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
               'created_at' => ['type' => 'DATETIME', 'null' => true],
               'updated_at' => ['type' => 'DATETIME', 'null' => true],
               'deleted_at' => ['type' => 'DATETIME', 'null' => true], // soft delete
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addUniqueKey(['zone_id', 'slot_no']);
           $this->forge->addForeignKey('zone_id', 'parking_zones', 'id', 'CASCADE', 'RESTRICT');
           $this->forge->createTable('parking_slots', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('parking_slots', true);
       }
   }
   ```

   `app/Database/Migrations/…_CreateVehiclesTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreateVehiclesTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'user_id'    => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'plate_no'   => ['type' => 'VARCHAR', 'constraint' => 15],
               'model'      => ['type' => 'VARCHAR', 'constraint' => 80],
               'color'      => ['type' => 'VARCHAR', 'constraint' => 30],
               'created_at' => ['type' => 'DATETIME', 'null' => true],
               'updated_at' => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addUniqueKey('plate_no');
           $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'RESTRICT');
           $this->forge->createTable('vehicles', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('vehicles', true);
       }
   }
   ```

   `app/Database/Migrations/…_CreateSlotBookingsTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreateSlotBookingsTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'ref_no'     => ['type' => 'VARCHAR', 'constraint' => 20],
               'user_id'    => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'vehicle_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'slot_id'    => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'start_date' => ['type' => 'DATE'],
               'end_date'   => ['type' => 'DATE'],
               'reason'     => ['type' => 'TEXT'],
               'status'     => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'pending'], // App\Enums\BookingStatus
               'decided_by' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true],
               'decided_at' => ['type' => 'DATETIME', 'null' => true],
               'created_at' => ['type' => 'DATETIME', 'null' => true],
               'updated_at' => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addUniqueKey('ref_no');
           // Index komposit untuk query pertindihan (BR-TLK-01)
           $this->forge->addKey(['slot_id', 'start_date', 'end_date']);
           $this->forge->addKey('status');
           $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'RESTRICT');
           $this->forge->addForeignKey('vehicle_id', 'vehicles', 'id', 'CASCADE', 'RESTRICT');
           $this->forge->addForeignKey('slot_id', 'parking_slots', 'id', 'CASCADE', 'RESTRICT');
           $this->forge->addForeignKey('decided_by', 'users', 'id', 'CASCADE', 'SET NULL');
           $this->forge->createTable('slot_bookings', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('slot_bookings', true);
       }
   }
   ```

   `app/Database/Migrations/…_CreatePassApplicationsTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreatePassApplicationsTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'          => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'ref_no'      => ['type' => 'VARCHAR', 'constraint' => 20],
               'user_id'     => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'pass_type'   => ['type' => 'VARCHAR', 'constraint' => 20], // App\Enums\PassType
               'vehicle_id'  => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true],
               'purpose'     => ['type' => 'TEXT'],
               'valid_from'  => ['type' => 'DATE'],
               'valid_until' => ['type' => 'DATE'],
               'status'      => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'submitted'], // App\Enums\PassStatus
               'reviewed_by' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true],
               'reviewed_at' => ['type' => 'DATETIME', 'null' => true],
               'approved_by' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true],
               'approved_at' => ['type' => 'DATETIME', 'null' => true],
               'created_at'  => ['type' => 'DATETIME', 'null' => true],
               'updated_at'  => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addUniqueKey('ref_no');
           $this->forge->addKey('status');
           $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'RESTRICT');
           $this->forge->addForeignKey('vehicle_id', 'vehicles', 'id', 'CASCADE', 'SET NULL');
           $this->forge->addForeignKey('reviewed_by', 'users', 'id', 'CASCADE', 'SET NULL');
           $this->forge->addForeignKey('approved_by', 'users', 'id', 'CASCADE', 'SET NULL');
           $this->forge->createTable('pass_applications', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('pass_applications', true);
       }
   }
   ```

   `app/Database/Migrations/…_CreatePassDocumentsTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreatePassDocumentsTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'             => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'application_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'doc_type'       => ['type' => 'VARCHAR', 'constraint' => 30],
               'original_name'  => ['type' => 'VARCHAR', 'constraint' => 255],
               'stored_path'    => ['type' => 'VARCHAR', 'constraint' => 255], // path dalam writable/uploads/pas/
               'mime'           => ['type' => 'VARCHAR', 'constraint' => 80],
               'size_bytes'     => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'created_at'     => ['type' => 'DATETIME', 'null' => true],
               'updated_at'     => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addForeignKey('application_id', 'pass_applications', 'id', 'CASCADE', 'CASCADE');
           $this->forge->createTable('pass_documents', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('pass_documents', true);
       }
   }
   ```

   `app/Database/Migrations/…_CreateStatusLogsTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   /**
    * Satu jadual audit untuk kedua-dua modul (TLK & PAS).
    * Rekod audit tidak dikemas kini — hanya `created_at`.
    */
   class CreateStatusLogsTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'          => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'module'      => ['type' => 'VARCHAR', 'constraint' => 5],  // 'TLK' | 'PAS'
               'record_id'   => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'from_status' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
               'to_status'   => ['type' => 'VARCHAR', 'constraint' => 20],
               'actor_id'    => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
               'remarks'     => ['type' => 'TEXT', 'null' => true],
               'created_at'  => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addKey(['module', 'record_id']);
           $this->forge->addForeignKey('actor_id', 'users', 'id', 'CASCADE', 'RESTRICT');
           $this->forge->createTable('status_logs', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('status_logs', true);
       }
   }
   ```

   `app/Database/Migrations/…_CreateReferenceSequencesTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreateReferenceSequencesTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'          => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'prefix'      => ['type' => 'VARCHAR', 'constraint' => 5],   // 'TLK' | 'PAS'
               'year'        => ['type' => 'SMALLINT', 'unsigned' => true],
               'last_number' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'default' => 0],
               'created_at'  => ['type' => 'DATETIME', 'null' => true],
               'updated_at'  => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addUniqueKey(['prefix', 'year']);
           $this->forge->createTable('reference_sequences', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('reference_sequences', true);
       }
   }
   ```

   > ⏱️ Run `php spark migrate` after every one or two files so FK errors are easy to trace. When all are done, explain one FK and one `ON DELETE` to the trainer.

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

9. `UserSeeder` — 5 users (README §3.4), groups, `Latihan@2026`, `department_id` looked up by `code`, skip if the e-mail exists. Replace the whole content of the generated file:

   `app/Database/Seeds/UserSeeder.php`

   ```php
   <?php

   namespace App\Database\Seeds;

   use CodeIgniter\Database\Seeder;
   use CodeIgniter\Shield\Entities\User;

   /**
    * Pengguna sintetik (SPEC §4). Kata laluan semua: Latihan@2026 (DEMO SAHAJA).
    * Bergantung pada DepartmentSeeder (department_id).
    */
   class UserSeeder extends Seeder
   {
       public const PASSWORD = 'Latihan@2026';

       public function run(): void
       {
           /** @var \App\Models\UserModel $users */
           $users = auth()->getProvider();   // = App\Models\UserModel (Config\Auth::$userProvider)

           $deptId = fn (string $code): ?int => ($row = $this->db->table('departments')->where('code', $code)->get()->getRow())
               ? (int) $row->id
               : null;

           $people = [
               ['email' => 'pemohon1@latihan.test', 'username' => 'pemohon1', 'full_name' => 'Aminah binti Latihan', 'staff_no' => 'LT0001', 'dept' => 'BTM', 'phone' => '012-0000001', 'group' => 'applicant'],
               ['email' => 'pemohon2@latihan.test', 'username' => 'pemohon2', 'full_name' => 'Badrul bin Contoh',    'staff_no' => 'LT0002', 'dept' => 'BKW', 'phone' => '012-0000002', 'group' => 'applicant'],
               ['email' => 'penyemak@latihan.test', 'username' => 'penyemak', 'full_name' => 'Chong Mei Ling',       'staff_no' => 'LT0003', 'dept' => 'BPA', 'phone' => '012-0000003', 'group' => 'reviewer'],
               ['email' => 'pelulus@latihan.test',  'username' => 'pelulus',  'full_name' => 'Dr. Devi a/p Sampel',  'staff_no' => 'LT0004', 'dept' => 'BPA', 'phone' => '012-0000004', 'group' => 'approver'],
               ['email' => 'admin@latihan.test',    'username' => 'admin',    'full_name' => 'Encik Admin Sistem',   'staff_no' => 'LT0005', 'dept' => 'BTM', 'phone' => '012-0000005', 'group' => 'admin'],
           ];

           foreach ($people as $p) {
               // Idempoten: langkau jika e-mel sudah wujud
               if ($users->findByCredentials(['email' => $p['email']]) !== null) {
                   continue;
               }

               $user = new User([
                   'username'      => $p['username'],
                   'email'         => $p['email'],        // disimpan ke auth_identities oleh Shield
                   'password'      => self::PASSWORD,     // di-hash oleh Shield (password_hash)
                   'active'        => 1,
                   'full_name'     => $p['full_name'],
                   'staff_no'      => $p['staff_no'],
                   'department_id' => $deptId($p['dept']),
                   'phone'         => $p['phone'],
               ]);

               $users->save($user);

               // Dapatkan semula dengan ID, kemudian tambah ke group Shield
               $user = $users->findById($users->getInsertID());
               $user->addGroup($p['group']);
           }
       }
   }
   ```

10. `ParkingSeeder` — zones `A`, `B`, `C` were already filled in Lab 3.2. Add to the same file, after the zone `insertBatch`: 4 slots per zone (`A-01`…`C-04`) covering all five categories `oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`. `zone_id` is looked up with `array_column()`. The whole file after the addition:

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

            // Hari 4: 4 slot setiap zon (A-01 … C-04), meliputi kelima-lima kategori
            $zoneIds = array_column(
                $this->db->table('parking_zones')->select('id, code')->get()->getResultArray(),
                'id',
                'code',
            );   // ['A' => 1, 'B' => 2, 'C' => 3]

            $layout = [
                'A' => ['oku', 'mengandung', 'pegawai_kanan', 'kenderaan_rasmi'],
                'B' => ['oku', 'mengandung', 'pelawat_vip', 'oku'],
                'C' => ['pegawai_kanan', 'kenderaan_rasmi', 'pelawat_vip', 'mengandung'],
            ];

            $slots = [];

            foreach ($layout as $code => $categories) {
                foreach ($categories as $i => $category) {
                    $slots[] = [
                        'zone_id'    => $zoneIds[$code],
                        'slot_no'    => sprintf('%s-%02d', $code, $i + 1),
                        'category'   => $category,
                        'is_active'  => 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            // UNIQUE(zone_id, slot_no) → INSERT IGNORE menjadikan seeder idempoten
            $this->db->table('parking_slots')->ignore(true)->insertBatch($slots);
        }
    }
    ```

11. `VehicleSeeder` — made-up plates only: `pemohon1` → `WXX 1234` & `WXX 5678`; `pemohon2` → `VXX 2468`; `pelulus` → `WXY 1357`; `admin` → `BXX 9090`. Users are looked up with `auth()->getProvider()->findByCredentials(['email' => …])`. Replace the whole content of the generated file:

    `app/Database/Seeds/VehicleSeeder.php`

    ```php
    <?php

    namespace App\Database\Seeds;

    use CodeIgniter\Database\Seeder;

    /**
     * Kenderaan sintetik — plat REKAAN sahaja (SPEC §10). Bergantung pada UserSeeder.
     */
    class VehicleSeeder extends Seeder
    {
        public function run(): void
        {
            $users = auth()->getProvider();
            $now   = date('Y-m-d H:i:s');

            $vehicles = [
                ['email' => 'pemohon1@latihan.test', 'plate_no' => 'WXX 1234', 'model' => 'Proton Saga',   'color' => 'Putih'],
                ['email' => 'pemohon1@latihan.test', 'plate_no' => 'WXX 5678', 'model' => 'Perodua Axia',  'color' => 'Merah'],
                ['email' => 'pemohon2@latihan.test', 'plate_no' => 'VXX 2468', 'model' => 'Perodua Myvi',  'color' => 'Biru'],
                ['email' => 'pelulus@latihan.test',  'plate_no' => 'WXY 1357', 'model' => 'Honda City',    'color' => 'Kelabu'],
                ['email' => 'admin@latihan.test',    'plate_no' => 'BXX 9090', 'model' => 'Toyota Vios',   'color' => 'Hitam'],
            ];

            $rows = [];

            foreach ($vehicles as $v) {
                $user = $users->findByCredentials(['email' => $v['email']]);

                if ($user === null) {
                    continue;   // UserSeeder belum dijalankan
                }

                $rows[] = [
                    'user_id'    => $user->id,
                    'plate_no'   => $v['plate_no'],
                    'model'      => $v['model'],
                    'color'      => $v['color'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if ($rows !== []) {
                $this->db->table('vehicles')->ignore(true)->insertBatch($rows);   // UNIQUE(plate_no)
            }
        }
    }
    ```

12. `DatabaseSeeder` — replace the file from Lab 3.2 so the order is:

    `app/Database/Seeds/DatabaseSeeder.php`

    ```php
    <?php

    namespace App\Database\Seeds;

    use CodeIgniter\Database\Seeder;

    class DatabaseSeeder extends Seeder
    {
        public function run(): void
        {
            $this->call(DepartmentSeeder::class);   // induk dahulu
            $this->call(UserSeeder::class);         // perlukan departments
            $this->call(ParkingSeeder::class);
            $this->call(VehicleSeeder::class);      // perlukan users
        }
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
   - [ ] Peraturan BR-* berkaitan diuji dan lulus (manual + PHPUnit).
   - [ ] Validasi di server (Model rules / Validation), bukan JavaScript sahaja.
   - [ ] Akses dikawal di server (filter + semakan pemilikan).
   - [ ] Peralihan status direkod dalam status_logs (jika berkaitan).
   - [ ] Ujian PHPUnit berkaitan lulus (composer test).
   - [ ] Tiada .env/rahsia dalam commit; data sintetik sahaja.
   - [ ] Saya boleh menerangkan setiap baris kod kepada rakan/jurulatih.
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
