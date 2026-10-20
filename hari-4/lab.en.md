# Day 4 Lab — Development Kickoff

[⬅️ Day 4 README](./README.md) · [📘 SPEC](../docs/spesifikasi-sistem.md) · [🤝 COLLABORATION](../docs/kolaborasi.md) · 🧩 Code templates (**Templat & Rujukan** module) · [⚡ spark commands](../docs/arahan-spark.md)

> **Lab rule:** Every step gives **complete code to copy**. Read every line before you run it — you must be able to explain it (KOLABORASI §3). Stuck: read the full error message, ask the trainer or your neighbour, or use AI to *explain* the error.

| Lab | Session | Time | Outcome |
|-----|------|------|-------|
| 4.1 | S1 | 09:00–10:00 | `kelas-ci-<nama>` project demo + request lifecycle trace |
| 4.1b | S5 | 10:00–10:30 | Trace of the POST `/jabatan` request (`csrf` filter, `INSERT`, 303 redirect) |
| 4.2 | S2 | 10:45–12:00 | Tests + Shield + Bootstrap layout (same project) |
| 4.2b | S6 | 12:00–12:30 | `session` & `permission:` filters on `/jabatan` and `/zon` |
| 4.3 | S3 | 14:30–15:30 | 8 more migrations (10 in total) + seeders + login |
| 4.3b | S7 | 15:30–16:00 | FK & `ON DELETE` drills + `ReferenceSequenceSeeder` |
| 4.4 | S4 | 16:00–16:35 | Work plan, branch + merge request, fresh clone |
| 4.4b | S8 | 16:35–17:00 | Second merge request: project README + review |

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
- `docs/kitaran-request.md` complete with 7 rows of evidence, pushed to GitLab (Quiz S1).
- You can answer: *"If I add the `session` filter to the `/zon` route, which step changes and what happens to a user who is not logged in?"* (Quiz S1)

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

   The internal KKM system does not allow self-registration: `/register` now redirects away with an error message.

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

   Accounts are created by `UserSeeder` (Lab 4.3 step 9) or by an admin:

   ```bash
   php spark shield:user create -n pemohon3 -e pemohon3@latihan.test -g applicant
   ```

   🪟 The password is asked interactively. In a separate Git Bash window (not the VS Code terminal), if the prompt does not appear: `winpty php spark shield:user create …`.

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

16. `app/Config/Routes.php` — protect the home page. Only the `/` line changes (`session` `filter` + route name `home`); the `jabatan` and `zon` routes from Day 3 (including the department edit and zone detail routes from Lab 3.3b/3.4b) stay. `php spark shield:setup` already added `service('auth')->routes($routes);` at the end — do not add it a second time (duplicate routes). The whole file after the change:

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
    $routes->get('jabatan/(:num)/edit', 'Jabatan::edit/$1');
    $routes->post('jabatan/(:num)', 'Jabatan::kemaskini/$1');
    $routes->get('zon/(:num)', 'Zon::butiran/$1');

    service('auth')->routes($routes);
    ```

    Restart `php spark serve` (stopped in step 6), then run the checkpoint below.

### ✅ Checkpoint
- `php spark routes | grep -E "login|logout"` → the `login` (GET & POST) and `logout` routes exist (Quiz S2).
- `http://localhost:8080/` (not logged in yet) → **redirected** to `http://localhost:8080/login` (no `index.php` in the URL) (Quiz S2).
- `php spark db:table --show` → the tables `users`, `auth_identities`, `auth_groups_users`, `settings`, `migrations` exist (Quiz S2).
- `git status` does **not** list `.env` (Quiz S2).
- `php spark list` — the first line ends with `UTC+08:00` (proof that `app.appTimezone` is read) (Quiz S2).

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

1. Generate the first file only, `AddProfileFieldsToUsers`. The other seven are generated in step 5, **one by one, in FK order**: `php spark migrate` runs every file in the folder, including files that are still empty, and records them as already run (then `Nothing to migrate`). The timestamp decides the run order; `CreateDepartmentsTable` and `CreateParkingZonesTable` from Lab 3.2 are earlier, so the FK order stays correct:

   ```bash
   php spark make:migration AddProfileFieldsToUsers
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

5. Fill in the remaining 7 migrations with the code below (based on [`erd-rujukan.md`](../docs/erd-rujukan.md) and specification §3). Replace the whole content of each file generated by `make:migration`; the class names already match. Generate and fill in **one file at a time**, in this order (do not generate them all first — the `php spark migrate` in the ⏱️ tip below would run the files that are still empty):

   ```bash
   php spark make:migration CreateParkingSlotsTable
   php spark make:migration CreateVehiclesTable
   php spark make:migration CreateSlotBookingsTable
   php spark make:migration CreatePassApplicationsTable
   php spark make:migration CreatePassDocumentsTable
   php spark make:migration CreateStatusLogsTable
   php spark make:migration CreateReferenceSequencesTable
   ```

   Checklist for each file:
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
- `php spark migrate:status` → 10 rows with namespace `App`, all with a *Migrated On* date (Quiz S3).
- `php spark db:table --show` → **18 tables** (10 from the SPEC including `users` + 6 `auth_*` + `settings` + `migrations`) (Quiz S3).
- The second `db:seed` run has **no** `Duplicate entry` error (Quiz S3).
- `php spark db:table auth_groups_users` → 5 rows (`applicant` ×2, `reviewer`, `approver`, `admin`) (Quiz S3).
- Home page after login: *"Selamat datang, Dr. Devi a/p Sampel. Peranan: approver"* ("Welcome, … Role: approver") (Quiz S3).
- FK test (in the MySQL client) (Quiz S3):

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

## Lab 4.4 — Work Plan, Git Branches & DoD (S4)

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
- `git log --oneline` shows ≥ 2 `SETUP:` commits and one `feat/pelan-kerja` merge on GitLab (Quiz S4).
- `git ls-files | grep -c "^\.env$"` → `0` (Quiz S4).
- The fresh-clone recipe (step 6) works up to login — **this proves your migrations & seeders are complete** (Quiz S4).
- `docs/pelan-kerja.md` exists and you can name 3 DoD items without looking (Quiz S4).

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

## Lab 4.1b — Tracing the POST `/jabatan` Request (S5)

### 🎯 Objective
Trace one **POST** request (the `/jabatan/baharu` form from Lab 3.3) with the Debug Toolbar and `php spark filter:check`, then compare it with the GET `/zon` trace from Lab 4.1: the `csrf` filter, the `is_unique` validation, the `INSERT` and the `303` redirect.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- [Lab 4.1](#lab-41--project-demo--request-lifecycle-trace-s1) done: `docs/kitaran-request.md` is pushed.
- [Lab 3.3](../hari-3/lab.en.md#lab-33--model--the-jabatan-pages-s3) done: `/jabatan/baharu` saves a new department.

### Steps

1. `php spark serve`, open `http://localhost:8080/jabatan/baharu`. Enter Kod `BPK`, Nama `Bahagian Perkhidmatan (Latihan)` → **Simpan**. The browser returns to `/jabatan` with the message *"Jabatan BPK disimpan."*
2. The toolbar at the bottom of `/jabatan` belongs to the **GET** request after the redirect, not the POST. Click the 🔥 icon → **History** tab. The table lists recent requests (columns *Status*, *Method*, *URL*). On the **POST** `http://localhost:8080/jabatan` row, click **Load**. The toolbar now shows the data of that POST request.
3. Record from the loaded POST request:
   - The *Status* column in History: the POST status code (not `200`).
   - **Vars** tab → *Response* section: the `Location` header. *POST* section: the fields the controller received — `csrf_test_name` is missing because the `csrf` filter removes it after verifying the token.
   - **Database** tab: the number of queries and their SQL. Click the `SELECT 1 FROM departments …` query to see its *trace*: it comes from `Validation\Rules->is_unique()`, not from the controller.
   - **Views** tab: the number of views loaded during the POST.
   - **Routes** tab: the matched controller and method.
4. Second terminal (keep `serve` running). Git Bash converts `/jabatan` into a Windows path (`C:/Program Files/Git/jabatan`), so put `MSYS_NO_PATHCONV=1` in front:

   ```bash
   MSYS_NO_PATHCONV=1 php spark filter:check POST /jabatan
   MSYS_NO_PATHCONV=1 php spark filter:check GET /zon
   ```

   Read the *Before Filters* column: `forcehttps pagecache csrf` for both. The `csrf` filter runs on every request, but it only **verifies the token** on POST.
5. **Duplicate code.** Open `/jabatan/baharu` again, enter Kod `BTM` (already exists), Nama `Ujian berganda` → **Simpan**. An error shows under Kod. History → **Load** the newest POST row: record the number of queries in the Database tab and the `Location` header.
6. **Without the CSRF token.** On `/jabatan/baharu`, press F12 → **Elements** tab → find `<input type="hidden" name="csrf_test_name" …>` → right-click → **Delete element**. Enter Kod `BPX`, Nama `Tanpa token` → **Simpan**. The error page shows *The action you requested is not allowed.* (code `403`). Open `/jabatan`: `BPX` is **not** there — the `csrf` filter stopped the request before the controller.
7. Add this section at the **end** of `docs/kitaran-request.md`, then fill the empty columns from your notes in steps 3–6:

   ```markdown

   ## POST /jabatan (Lab 4.1b)

   | # | Langkah | Fail | Bukti POST /jabatan | Beza dengan GET /zon |
   |---|---------|------|---------------------|----------------------|
   | 1 | Front controller | `public/index.php` | | |
   | 2 | Routing | `app/Config/Routes.php` | `$routes->post('jabatan', 'Jabatan::simpan')` | |
   | 3 | Filter before | `app/Config/Filters.php` | `csrf` mengesahkan token | |
   | 4 | Controller | `app/Controllers/Jabatan.php` | `simpan()` | |
   | 5 | Model | `app/Models/DepartmentModel.php` | | |
   | 6 | View | — | | |
   | 7 | Response | — | | |

   - Kod berganda `BTM`: query = , `Location` =
   - Tanpa token CSRF: status = , controller dipanggil? 
   ```

8. Commit and push:

   ```bash
   git add docs/kitaran-request.md && git commit -m "DOCS: kitaran request POST /jabatan" && git push
   ```

### ✅ Checkpoint
- [ ] The Debug Toolbar History shows POST `/jabatan` with status `303`, two queries (`SELECT 1 … LIMIT 1` from `is_unique` and the `INSERT`) and no view (Quiz S5).
- [ ] The duplicate code `BTM` gives a single `SELECT` query (no `INSERT`); the form without a CSRF token is rejected with `403` before the controller (Quiz S5).
- [ ] GitLab shows the `DOCS: kitaran request POST /jabatan` commit (Quiz S5).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| The History tab has no POST row | The toolbar was opened on an old page, or the `writable/debugbar/` folder is not writable | Reload `/jabatan` after Simpan, then open History; check that `writable/debugbar/` exists |
| The Views tab shows `jabatan/index` | You loaded the **GET** `/jabatan` row, not the POST | Click **Load** on the row whose *Method* column = `POST` |
| `Can't find a route: "POST C:/Program Files/Git/jabatan"` | Git Bash converted `/jabatan` into a Windows path | Put `MSYS_NO_PATHCONV=1` in front of the command |
| *The action you requested is not allowed.* on a normal Simpan | The tab was open too long, or the form was loaded before `serve` restarted | Reload `/jabatan/baharu` (new token), then submit again |

### ⭐ Bonus challenge
After Lab 4.2, repeat this trace for **POST `/login`**: which queries does Shield run (`auth_identities`, `auth_logins`), and where does the `Location` header take you?

---

## Lab 4.2b — Protecting the Day 3 Pages with Shield Filters (S6)

### 🎯 Objective
Put the Shield filters `session` and `permission:admin.access` on the Day 3 routes (`/jabatan`, `/zon`, `/jabatan/baharu`), prove them with `php spark routes` and `filter:check`, and test them with two test accounts (`admin` and `applicant`) created with `php spark shield:user`.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- [Lab 4.2](#lab-42--ci4-project-env-shield--layout-s2) checkpoint passed: `/` redirects to `/login`, `AuthGroups` follows SPEC §4, the `layouts/main.php` layout + `partials/flash.php` exist.
- Lab 4.3 **not** done yet: the `users` table has no profile fields and no synthetic users. This lab creates two temporary test accounts and deletes them at the end.

### Steps

1. **Before.** Look at the access gap now:

   ```bash
   php spark routes | grep -E "jabatan|zon"
   ```

   The *Before Filters* column shows only `csrf`. Open `http://localhost:8080/zon` in an **incognito** window (not logged in): the zone list is shown to anyone.
2. `app/Config/Routes.php` — replace the whole file. The `/` route and `service('auth')->routes($routes);` from Lab 4.2 stay; the Day 3 routes get filters:

   `app/Config/Routes.php`

   ```php
   <?php

   use CodeIgniter\Router\RouteCollection;

   /** @var RouteCollection $routes */
   $routes->get('/', 'Home::index', ['filter' => 'session', 'as' => 'home']);

   // Hari 3: senarai — mesti log masuk
   $routes->get('jabatan', 'Jabatan::index', ['filter' => 'session']);
   $routes->get('zon', 'Zon::index', ['filter' => 'session']);
   $routes->get('zon/(:num)', 'Zon::butiran/$1', ['filter' => 'session']);

   // Hari 3: tambah & edit jabatan — admin sahaja (permission admin.access, SPEC §9)
   $routes->get('jabatan/baharu', 'Jabatan::baharu', ['filter' => 'permission:admin.access']);
   $routes->post('jabatan', 'Jabatan::simpan', ['filter' => 'permission:admin.access']);
   $routes->get('jabatan/(:num)/edit', 'Jabatan::edit/$1', ['filter' => 'permission:admin.access']);
   $routes->post('jabatan/(:num)', 'Jabatan::kemaskini/$1', ['filter' => 'permission:admin.access']);

   service('auth')->routes($routes);
   ```

   > `permission:admin.access` asks "*what* are you allowed to do?". Only the `admin` group has it (`admin.*` in `$matrix`). The same filter goes on the GET (form) **and** the POST (save) — if the POST is not protected, anyone logged in can submit the form directly.
3. Verify:

   ```bash
   php -l app/Config/Routes.php
   php spark routes | grep -E "jabatan|zon"
   MSYS_NO_PATHCONV=1 php spark filter:check GET /jabatan/baharu
   ```

   `jabatan`, `zon` and `zon/([0-9]+)` → `csrf session`; `jabatan/baharu`, `jabatan/([0-9]+)/edit` (GET) and `jabatan`, `jabatan/([0-9]+)` (POST) → `csrf permission:admin.access`. `filter:check` shows the `CodeIgniter\Shield\Filters\PermissionFilter:admin.access` class after `CSRF`.
4. Create two test accounts. Each command asks for the password twice — type `Latihan@2026`:

   ```bash
   php spark shield:user create -n ujiadmin -e ujiadmin@latihan.test -g admin
   php spark shield:user create -n ujipemohon -e ujipemohon@latihan.test -g applicant
   php spark shield:user list
   ```

   Output: `User "ujiadmin" created` and `The user is added to group "admin".` (likewise `ujipemohon` → `applicant`).
5. Create `docs/akses-route.md`, then test each row in an **incognito** window and fill the *Sebenar* (actual) column:

   ```markdown
   # Matriks akses route — Hari 3 (Lab 4.2b)

   | # | Pengguna | Tindakan | Dijangka | Sebenar |
   |---|----------|----------|----------|---------|
   | 1 | (belum log masuk) | Buka `/zon` | Dialih ke `/login` | |
   | 2 | `ujipemohon@latihan.test` | Log masuk di halaman #1 | Halaman selepas log masuk = ? | |
   | 3 | `ujipemohon@latihan.test` | Buka `/jabatan` | Senarai jabatan | |
   | 4 | `ujipemohon@latihan.test` | Buka `/jabatan/baharu` | Dialih ke = ?, mesej = ? | |
   | 5 | `ujiadmin@latihan.test` | `/logout`, log masuk, buka `/jabatan/baharu` | Borang *Jabatan baharu* | |
   | 6 | `ujiadmin@latihan.test` | Buka `/zon?q=aras` | Senarai zon ditapis | |

   Filter (`php spark routes`):
   - `jabatan`, `zon`, `zon/(:num)` → `session`
   - `jabatan/baharu`, `jabatan/(:num)/edit` (GET) dan `jabatan`, `jabatan/(:num)` (POST) → `permission:admin.access`
   ```

   The home page shows *"Selamat datang, ujipemohon."* — the username, because the `full_name` field is only added in Lab 4.3.
6. Log out (`http://localhost:8080/logout`), then delete both test accounts so Lab 4.3 starts with an empty `users` table. Answer `y` to each confirmation question:

   ```bash
   php spark shield:user delete -n ujiadmin
   php spark shield:user delete -n ujipemohon
   php spark shield:user list
   ```

   If you created `pemohon3` in Lab 4.2 step 9, delete it too: `php spark shield:user delete -n pemohon3`.

   `shield:user delete` removes the `users` row permanently; `auth_identities` and `auth_groups_users` go with it (Shield's `ON DELETE CASCADE` FKs — you prove this in Lab 4.3b).
7. Commit and push **the docs file only** (`Routes.php` goes into the `SETUP:` commit in Lab 4.4 step 2):

   ```bash
   git add docs/akses-route.md && git commit -m "DOCS: matriks akses route Hari 3" && git push
   ```

### ✅ Checkpoint
- [ ] `php spark routes` shows `session` on `jabatan` and `zon`, and `permission:admin.access` on `jabatan/baharu` (GET) and `jabatan` (POST) (Quiz S6).
- [ ] The `docs/akses-route.md` matrix is complete: not logged in → `/login`; `ujipemohon` is turned away from `/jabatan/baharu`; `ujiadmin` sees the form (Quiz S6).
- [ ] GitLab shows the `DOCS: matriks akses route Hari 3` commit, and `php spark shield:user list` no longer lists `ujiadmin`/`ujipemohon` (Quiz S6).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `/zon` still shows without logging in | The normal window is still logged in, or `Routes.php` is not saved | Use an incognito window; check `php spark routes` |
| `shield:user create` shows no password prompt | Separate Git Bash window (mintty) | Use the VS Code terminal, or `winpty php spark shield:user create …` |
| `The "Password" field must be at least 8 characters in length.` and the prompt repeats | Password shorter than 8 characters | Type `Latihan@2026` when asked again |
| `Can't find a route: "GET C:/Program Files/Git/jabatan/baharu"` | Git Bash converted the path | `MSYS_NO_PATHCONV=1` in front of `php spark filter:check` |
| An error or blank page after `shield:user delete` | The browser is still logged in as the deleted account | Open `/logout` or close the incognito window |

### ⭐ Bonus challenge
Hide the *+ Jabatan baharu* link in `app/Views/jabatan/index.php` from non-admins with `<?php if (auth()->user()?->can('admin.access')): ?> … <?php endif ?>`. Then open `/jabatan/baharu` directly as `ujipemohon` (create it again, delete it afterwards): why is the route filter still needed even though the link is hidden?

---

## Lab 4.3b — FK & `ON DELETE` Drills & Sequence Seeder (S7)

### 🎯 Objective
Prove every Lab 4.3 constraint with real queries in the MySQL client — FK without a parent (`1452`), composite UNIQUE (`1062`), `RESTRICT` (`1451`), `SET NULL` and `CASCADE` — without damaging the data (transaction + `ROLLBACK`), then add an idempotent `ReferenceSequenceSeeder`.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- [Lab 4.3](#lab-43--migrations--seeders-from-the-erd-s3) checkpoint passed: 18 tables, 5 users, 12 slots, 5 vehicles in `kkm_latihan`.
- Lab 4.2b done (test accounts already deleted).

### Steps

**A. Constraints in the MySQL client**

1. Open the MySQL client on the development database (password `Latihan@2026`):

   ```bash
   mysql -u kkm_dev -p kkm_latihan
   ```

   The prompt changes to `mysql>`. Paste each block below **one at a time** and read the output before the next block.
2. List every FK and its `ON DELETE`:

   ```sql
   SELECT TABLE_NAME, CONSTRAINT_NAME, DELETE_RULE
   FROM information_schema.REFERENTIAL_CONSTRAINTS
   WHERE CONSTRAINT_SCHEMA = 'kkm_latihan'
   ORDER BY TABLE_NAME, CONSTRAINT_NAME;
   ```

   Match each row with an `addForeignKey()` in the Lab 4.3 migrations (and the Shield migrations for `auth_*`).
3. FK without a parent and composite UNIQUE — both are rejected, no row changes:

   ```sql
   UPDATE users SET department_id = 99 WHERE username = 'pemohon1';
   UPDATE parking_slots SET slot_no = 'A-02' WHERE slot_no = 'A-01';
   ```

   Expected: `ERROR 1452 … CONSTRAINT users_department_id_fk …` and `ERROR 1062 … Duplicate entry '…-A-02' for key 'parking_slots.zone_id_slot_no'` (the number before `-A-02` is the `id` of zone A).
4. `RESTRICT` — a parent that still has children cannot be deleted:

   ```sql
   DELETE FROM parking_zones WHERE code = 'A';
   DELETE FROM users WHERE username = 'pemohon2';
   ```

   Record the `CONSTRAINT` name in each `ERROR 1451` message.
5. `SET NULL` — inside a transaction, then `ROLLBACK` so the data stays:

   ```sql
   START TRANSACTION;
   DELETE FROM departments WHERE code = 'BPA';
   SELECT username, department_id FROM users ORDER BY id;
   ROLLBACK;
   SELECT username, department_id FROM users ORDER BY id;
   ```

   Record how many users get a `NULL` `department_id` before the `ROLLBACK`, and the values after it.
6. `CASCADE` (Shield FKs) — delete `penyemak` (no vehicles) inside a transaction:

   ```sql
   START TRANSACTION;
   DELETE FROM users WHERE username = 'penyemak';
   SELECT COUNT(*) AS identiti FROM auth_identities;
   SELECT COUNT(*) AS ahli_group FROM auth_groups_users;
   ROLLBACK;
   SELECT COUNT(*) AS identiti FROM auth_identities;
   SELECT COUNT(*) AS ahli_group FROM auth_groups_users;
   ```

   Expected: `4` and `4` before the `ROLLBACK`, `5` and `5` after it. Type `exit` to leave.

   > ⚠️ Steps 5–6 **must** start with `START TRANSACTION;`. Without it the `DELETE` happens immediately — see *Troubleshooting*.
7. Create `docs/ujian-fk.md` and fill the *Sebenar* (actual) column from the output of steps 3–6:

   ```markdown
   # Ujian FK & ON DELETE — kkm_latihan (Lab 4.3b)

   | # | Query | Kekangan | Dijangka | Sebenar |
   |---|-------|----------|----------|---------|
   | 1 | `UPDATE users SET department_id = 99 …` | `users_department_id_fk` | ERROR 1452 | |
   | 2 | `UPDATE parking_slots SET slot_no = 'A-02' …` | UNIQUE (`zone_id`, `slot_no`) | ERROR 1062 | |
   | 3 | `DELETE FROM parking_zones WHERE code = 'A'` | `parking_slots.zone_id` RESTRICT | ERROR 1451 | |
   | 4 | `DELETE FROM users WHERE username = 'pemohon2'` | ? RESTRICT | ERROR 1451 | |
   | 5 | `DELETE FROM departments WHERE code = 'BPA'` (transaksi) | `users.department_id` SET NULL | ? pengguna → NULL | |
   | 6 | `DELETE FROM users WHERE username = 'penyemak'` (transaksi) | `auth_*` CASCADE | `auth_identities` 5 → 4 | |

   Selepas ROLLBACK: data sama seperti sebelum ujian (ya/tidak):
   ```

**B. Reference-number sequence seeder**

8. Generate the seeder:

   ```bash
   php spark make:seeder ReferenceSequenceSeeder
   ```

   Replace the whole content of the generated file:

   `app/Database/Seeds/ReferenceSequenceSeeder.php`

   ```php
   <?php

   namespace App\Database\Seeds;

   use CodeIgniter\Database\Seeder;

   /**
    * Baris jujukan nombor rujukan tahun semasa (TLK & PAS), last_number = 0.
    * ReferenceNumberService (Hari 5) menyambung dari sini: TLK-YYYY-0001 dahulu.
    */
   class ReferenceSequenceSeeder extends Seeder
   {
       public function run(): void
       {
           $now  = date('Y-m-d H:i:s');
           $year = (int) date('Y');   // ikut app.appTimezone

           $rows = [];

           foreach (['TLK', 'PAS'] as $prefix) {
               $rows[] = [
                   'prefix'      => $prefix,
                   'year'        => $year,
                   'last_number' => 0,
                   'created_at'  => $now,
                   'updated_at'  => $now,
               ];
           }

           // UNIQUE(prefix, year) → INSERT IGNORE: last_number yang sudah bertambah tidak ditimpa
           $this->db->table('reference_sequences')->ignore(true)->insertBatch($rows);
       }
   }
   ```

9. `DatabaseSeeder` — replace the Lab 4.3 file with this version (one new line at the end):

   `app/Database/Seeds/DatabaseSeeder.php`

   ```php
   <?php

   namespace App\Database\Seeds;

   use CodeIgniter\Database\Seeder;

   class DatabaseSeeder extends Seeder
   {
       public function run(): void
       {
           $this->call(DepartmentSeeder::class);          // induk dahulu
           $this->call(UserSeeder::class);                // perlukan departments
           $this->call(ParkingSeeder::class);
           $this->call(VehicleSeeder::class);             // perlukan users
           $this->call(ReferenceSequenceSeeder::class);   // tiada FK
       }
   }
   ```

10. Run it **twice** and check:

    ```bash
    php -l app/Database/Seeds/ReferenceSequenceSeeder.php
    php spark db:seed DatabaseSeeder
    php spark db:seed DatabaseSeeder
    php spark db:table reference_sequences
    ```

    Expected: 2 rows — `TLK` and `PAS`, the current year, `last_number` `0` — with no `Duplicate entry` error. Tomorrow `ReferenceNumberService::next('TLK')` locks this `TLK` row and generates `TLK-2026-0001`.
11. Commit and push **the docs file only** (the seeder goes into the `SETUP:` commit in Lab 4.4 step 2):

    ```bash
    git add docs/ujian-fk.md && git commit -m "DOCS: ujian FK & ON DELETE" && git push
    ```

### ✅ Checkpoint
- [ ] `docs/ujian-fk.md` has all 6 rows: `1452`, `1062`, two `1451` (with the `CONSTRAINT` name), `SET NULL` and `CASCADE` inside a transaction; after `ROLLBACK` the data is back as before (Quiz S7).
- [ ] `php spark db:seed DatabaseSeeder` twice → `reference_sequences` has exactly 2 rows (`TLK`, `PAS`, `last_number` `0`) (Quiz S7).
- [ ] GitLab shows the `DOCS: ujian FK & ON DELETE` commit (Quiz S7).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `mysql` hangs with no prompt | Separate Git Bash window (mintty) | Use the VS Code terminal, or `winpty mysql -u kkm_dev -p kkm_latihan` |
| The `DELETE` in step 5/6 succeeds but `ROLLBACK` does not restore the data | `START TRANSACTION;` was left out (autocommit) | Rebuild the synthetic data: `php spark migrate:refresh --all` → `php spark db:seed DatabaseSeeder` (⚠️ deletes all data in `kkm_latihan`) |
| `ERROR 1046 (3D000): No database selected` | `mysql -u kkm_dev -p` without a database name | Type `USE kkm_latihan;` or repeat with `kkm_latihan` at the end of the command |
| `Duplicate entry 'TLK-2026' for key …` on the second seed | `insertBatch()` without `ignore(true)` | Use `->ignore(true)->insertBatch($rows)` |
| `Class "App\Database\Seeds\ReferenceSequenceSeeder" not found` | File and class names differ | File `app/Database/Seeds/ReferenceSequenceSeeder.php`, class `ReferenceSequenceSeeder` |

### ⭐ Bonus challenge
Run `SHOW CREATE TABLE slot_bookings;` and list all four FKs with their `ON DELETE`. Explain to your neighbour why `decided_by` is `SET NULL` but `user_id` is `RESTRICT`.

---

## Lab 4.4b — Second Merge Request: Project README & Review (S8)

### 🎯 Objective
Run a full merge request cycle a second time with a real change (the project `README.md`): branch → commit → MR → review comment → fix commit on the **same** branch → merge → delete the branch → `git log --graph`.

### Prerequisites
- [Lab 4.4](#lab-44--work-plan-git-branches--dod-s4) checkpoint passed: MR `feat/pelan-kerja` *Merged*, `git status --short` empty.

### Steps

1. Start a new branch from the latest `main`:

   ```bash
   git switch main && git pull
   git switch -c feat/readme-projek
   ```

2. The `README.md` in the project root is still the generic appstarter README. Replace its whole content:

   `README.md`

   ```markdown
   # kelas-ci-<nama> — Sistem TLK & Pas (latihan)

   Projek latihan *Coaching Pembangunan Aplikasi Menggunakan CodeIgniter* (KKM): CodeIgniter 4.7 + Shield + Bootstrap 5.3. **Data sintetik sahaja.**

   ## Persediaan pembangun

   1. `composer install`
   2. `cp env .env`, kemudian isi `CI_ENVIRONMENT = development`, `app.baseURL`, `app.indexPage = ''`, `app.appTimezone = 'Asia/Kuala_Lumpur'` dan `database.default.*`
   3. `php spark migrate --all`
   4. `php spark db:seed DatabaseSeeder` (boleh diulang — seeder idempoten)
   5. `php spark serve` → `http://localhost:8080/login`

   `.env` **tidak** di-commit (`.gitignore`).

   ## Akaun sintetik

   Kata laluan semua akaun: `Latihan@2026` (demo latihan sahaja).

   | E-mel | Group |
   |-------|-------|
   | `pemohon1@latihan.test` | `applicant` |
   | `pemohon2@latihan.test` | `applicant` |
   | `penyemak@latihan.test` | `reviewer` |
   | `pelulus@latihan.test` | `approver` |
   | `admin@latihan.test` | `admin` |

   ## Akses route

   | Route | Filter |
   |-------|--------|
   | `/`, `/jabatan`, `/zon`, `/zon/{id}` | `session` |
   | `/jabatan/baharu`, `/jabatan/{id}/edit`, `POST /jabatan`, `POST /jabatan/{id}` | `permission:admin.access` |

   Matriks ujian: `docs/akses-route.md`. Ujian FK: `docs/ujian-fk.md`.
   ```

3. Commit and push the branch:

   ```bash
   git add README.md
   git commit -m "DOCS: README persediaan pembangun"
   git push -u origin feat/readme-projek
   ```

4. On GitLab: **Create merge request** (target: `main` of your own repo). Tick ✅ *Delete source branch when merge request is accepted*; do **not** tick *Squash commits*. Ask the trainer or your neighbour (Reporter) to leave this comment in the *Changes* tab, on the `## Akses route` line:

   > *Add how to check the route filters with `php spark filter:check` so a new developer can verify access on their own.*

5. Fix it on the **same** branch — add this section at the **end** of `README.md`:

   ```markdown

   ## Semak filter route

   Git Bash menukar `/jabatan` kepada path Windows, jadi letak `MSYS_NO_PATHCONV=1` di hadapan:

       MSYS_NO_PATHCONV=1 php spark filter:check GET /jabatan/baharu

   Lajur *Before Filters* mesti mengandungi `permission:admin.access`.
   ```

   Then:

   ```bash
   git add README.md
   git commit -m "DOCS: README — semakan filter (komen MR)"
   git push
   ```

   Reload the MR: how many commits does the *Commits* tab show now? Reply to the reviewer's comment (*"Fixed in commit …"*) and click **Resolve thread**.
6. **Merge**. Then on your laptop:

   ```bash
   git switch main
   git pull
   git fetch --prune
   git branch -d feat/readme-projek
   git log --oneline --graph -6
   ```

   `git fetch --prune` prints `- [deleted] (none) -> origin/feat/readme-projek` (GitLab already deleted the source branch); `git branch -d` prints `Deleted branch feat/readme-projek (was …)`.
7. Open the project page on GitLab: the new README shows below the file list.

### ✅ Checkpoint
- [ ] MR `feat/readme-projek` is *Merged* with 2 commits and one *Resolved* comment thread (Quiz S8).
- [ ] `git log --oneline --graph -6` shows the `feat/readme-projek` merge commit with two `DOCS:` commits on the side line (Quiz S8).
- [ ] `git branch -a` no longer lists `feat/readme-projek` (local or `origin/`), and `git status --short` is empty (Quiz S8).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `git push` is rejected (`rejected … fetch first`) | The README was edited on GitLab directly (e.g. *Apply suggestion*) | `git pull` on that branch first, then `git push` |
| A straight graph with no merge commit | *Squash commits* was ticked, or the project merge method is *Fast-forward* | *Settings → Merge requests → Merge method* = **Merge commit**; do not tick *Squash* |
| `error: the branch 'feat/readme-projek' is not fully merged` | `git pull` not done after the merge | `git switch main && git pull`, then repeat `git branch -d` |
| The README does not show on GitLab | The file is not `README.md` in the project root | `git mv` it to `README.md` in the root |

### ⭐ Bonus challenge
Ask the reviewer to use the **Insert suggestion** button in a comment (a one-line suggestion). Click **Apply suggestion** on GitLab, then `git pull` on the branch before your next commit — what happens if you `git push` without `git pull` first?

---

## Self-check — end of day

```bash
php spark migrate:status    # every App, Shield & Settings migration marked as run
git status --short          # no output
git log --oneline           # ≥ 2 SETUP: commits
```

- [ ] `php spark serve` → `http://localhost:8080/` redirects to the login page without errors (Quiz S2).
- [ ] `php spark migrate:status` shows **all** migrations (10 App + Shield + Settings) as run (Quiz S3).
- [ ] Logging in as `pelulus@latihan.test` / `Latihan@2026` works; `pemohon1@latihan.test` too (Quiz S3).
- [ ] `git status --short` is empty and `git ls-files | grep -c "^\.env$"` → `0` (Quiz S2).
- [ ] `git log --oneline` shows ≥ 2 `SETUP:` commits (Quiz S4).
- [ ] A fresh clone (Lab 4.4 step 6) works through to login (Quiz S4).
- [ ] Before logging in, `/zon` and `/jabatan` redirect to `/login`; `/jabatan/baharu` opens only for `admin@latihan.test` (Lab 4.2b) (Quiz S6).
- [ ] `php spark db:table reference_sequences` → 2 rows (`TLK`, `PAS`), and MR `feat/readme-projek` is *Merged* (Lab 4.3b, 4.4b) (Quiz S8).
