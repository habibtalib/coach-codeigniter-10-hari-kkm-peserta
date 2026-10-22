# Lab Hari 4 — Development Kickoff

[⬅️ README](./README.md) · [Jadual](../JADUAL.md) · [Kanun SPEC](../docs/spesifikasi-sistem.md) · [KOLABORASI](../docs/kolaborasi.md) · 🧩 Template kod (modul **Templat & Rujukan**) · [⚡ Arahan spark](../docs/arahan-spark.md)

> **Peraturan lab:** Setiap langkah memberi **kod lengkap untuk disalin**. Baca setiap baris sebelum menjalankannya — anda mesti boleh menerangkannya (KOLABORASI §3). Buntu: baca mesej ralat penuh, tanya jurulatih atau rakan sebelah, atau guna AI untuk *menerangkan* ralat.

| Lab | Sesi | Masa | Hasil |
|-----|------|------|-------|
| 4.1 | S1 | 09:00–10:00 | Demo projek `kelas-ci-<nama>` + jejak kitaran request |
| 4.1b | S5 | 10:00–10:30 | Jejak request POST `/jabatan` (filter `csrf`, `INSERT`, redirect 303) |
| 4.2 | S2 | 10:45–12:00 | Ujian + Shield + layout Bootstrap (projek yang sama) |
| 4.2b | S6 | 12:00–12:30 | Filter `session` & `permission:` pada `/jabatan` dan `/zon` |
| 4.3 | S3 | 14:30–15:30 | 8 migration lagi (jumlah 10) + seeder + log masuk |
| 4.3b | S7 | 15:30–16:00 | Latihan FK & `ON DELETE` + `ReferenceSequenceSeeder` |
| 4.4 | S4 | 16:00–16:35 | Pelan kerja, branch + merge request, klon baharu |
| 4.4b | S8 | 16:35–17:00 | Merge request kedua: README projek + semakan |

---

## Lab 4.1 — Demo Projek & Jejak Kitaran Request (S1)

### 🎯 Objektif
Mendemokan projek `kelas-ci-<nama>` anda (GitLab + `/zon`) dan menerangkan 7 langkah kitaran request CI4 dengan bukti dari Debug Toolbar.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 3.4](../hari-3/lab.md#lab-34--carian--pagination-zon-s4) siap: `/zon` berfungsi dan GitLab menunjukkan commit `ZON:`.

### Langkah

1. `php spark serve`, buka `http://localhost:8080/zon?q=aras`. Klik ikon 🔥 **Debug Toolbar** (penjuru kanan bawah — hanya muncul jika `CI_ENVIRONMENT = development`).
2. Tab **Timeline** — cari dan catat masa bagi: `Routing`, `Before Filters`, `Controller`, `After Filters`.
3. Tab **Routes** — catat controller & method yang dipadan untuk `/zon`.
4. Tab **Database** — salin query SQL yang dijalankan (ada `LIKE '%aras%'`). Cari kaedah dalam `ParkingZoneModel` yang menjananya.
5. Tab **Views** — senaraikan fail view yang dimuat (`zon/index`, `layout`, dan view pager).
6. Terminal:

   ```bash
   php spark routes
   ```

   Padankan baris `zon` dengan method controller, dan baca lajur *Before Filters*.
7. Cipta `docs/kitaran-request.md` dalam projek anda dan isi jadual ini:

   | # | Langkah | Fail | Bukti (Toolbar/`spark routes`) |
   |---|---------|------|-------------------------------|
   | 1 | Front controller | `public/index.php` | |
   | 2 | Routing | | |
   | 3 | Filter before | | |
   | 4 | Controller | | |
   | 5 | Model | | |
   | 6 | View | | |
   | 7 | Response | | |

8. Commit dan push (`git add docs/kitaran-request.md && git commit -m "DOCS: kitaran request /zon" && git push`; PowerShell: jalankan `git add`, `git commit` dan `git push` satu demi satu), kemudian demo 3 minit kepada jurulatih: halaman projek GitLab anda, `/zon?q=aras`, dan jadual di atas.

### ✅ Checkpoint
- `docs/kitaran-request.md` lengkap 7 baris dengan bukti, di-push ke GitLab (Kuiz S1).
- Anda boleh menjawab: *"Jika saya tambah filter `session` pada route `/zon`, langkah mana yang berubah dan apa berlaku kepada pengguna tidak log masuk?"* (Kuiz S1)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Debug Toolbar tidak muncul | `CI_ENVIRONMENT` bukan `development` / `.env` tiada | `cp env .env`, nyahkomen `CI_ENVIRONMENT = development` |
| `404 - Can't find a route for 'GET: zon'` | Lab 3.4 belum siap atau route tertinggal | Tambah `$routes->get('zon', 'Zon::index');` |
| `Unable to connect to the database` | `.env` salah | Semak `database.default.*`; cuba `hostname = 127.0.0.1` |
| `The required PHP extension "sqlite3" is not loaded` bila `composer test` (Windows) | Kumpulan database `tests` appstarter masih SQLite; Laragon tidak menghidupkan `sqlite3` | Kursus guna MySQL untuk ujian: salin blok `database.tests.*` dari [`nota-10`](../docs/nota-10-ujian-phpunit-ci4.md) §3 ke `.env` (database `kkm_latihan_test`) — Hari 6 menetapkannya juga. Disahkan pada Windows: selepas itu `composer test` → `OK` |

### ⭐ Cabaran tambahan
Tambah `log_message('info', 'Zon::index q={q}', ['q' => (string) $q]);` dalam controller, tetapkan `app/Config/Logger.php` `$threshold = 7`, kemudian cari baris itu dalam `writable/logs/log-YYYY-MM-DD.log`.

---

## Lab 4.2 — Projek CI4, `.env`, Shield & Layout (S2)

### 🎯 Objektif
Menyediakan ujian (`composer test`) dalam projek `kelas-ci-<nama>`, menyemak `.env`, memasang Shield dengan medan profil & peranan SPEC §4, dan membina layout Bootstrap 5.3.

### Prasyarat
- Projek `~/latihan/kelas-ci-<nama>` (Hari 2–3): `.env` bersambung ke `kkm_latihan`, migration `departments` + `parking_zones` sudah dijalankan
- Route, controller, layout view, borang, validation dan CSRF sudah dibuat dalam `kelas-ci-<nama>` (Lab 2.2–2.4). Lab ini menambah ujian, Shield dan Bootstrap dalam projek yang sama.
- Database `kkm_latihan` & `kkm_latihan_test` + pengguna `kkm_dev` ([Lab 3.1](../hari-3/lab.md#lab-31--database-mysql--env-s1))
- PHP ≥ 8.2 dengan `intl`, `mbstring`, `mysqli` (`php -m`)
- `php.ini` (untuk muat naik dokumen Pas, Hari 7): `upload_max_filesize = 8M` dan `post_max_size = 16M` atau lebih. Semak: `php -i | grep -E "upload_max_filesize|post_max_size"` (PowerShell: `php -i | Select-String "upload_max_filesize|post_max_size"`). Cari fail dengan `php --ini`; mulakan semula `php spark serve` selepas menukar.

### Langkah

**A. Ujian Composer**

1. Projek, `.gitattributes` dan `.editorconfig` sudah dicipta dalam [Lab 2.2](../hari-2/lab.md#lab-22--projek-ci-anda-di-gitlab-s2). Sediakan skrip ujian Composer:

   ```bash
   composer config process-timeout 0    # skrip Composer tidak dihentikan selepas 300 s (suite penuh di laptop perlahan)
   composer run-script --list
   ```

   Senarai mesti mengandungi `test`. `composer.json` appstarter sudah ada `"scripts": { "test": "phpunit" }`; jika tiada, tambah blok itu. Kursus ini menjalankan ujian dengan `composer test` (sama dengan `vendor/bin/phpunit`, dan berfungsi dalam Git Bash dan Command Prompt Windows). Argumen PHPUnit diletak selepas `--`: `composer test -- --filter BookingStatusTest`.

   **Buang blok coverage.** Laptop kursus tiada Xdebug/PCOV, dan `phpunit.dist.xml` appstarter meminta laporan coverage dengan `failOnWarning="true"` — tanpa langkah ini `composer test` mencetak *No code coverage driver available* dan keluar dengan kod 1 walaupun semua ujian lulus. Dalam VS Code, buka `phpunit.dist.xml` dan padam seluruh blok `<coverage …> … </coverage>` ini (biarkan `<source>`, `<testsuites>` dan `<php>`):

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

   Semak: `composer test` → `OK (…)`, kod keluar 0 (`echo $?` → `0`).

2. Sahkan:

   ```bash
   php spark --version
   ls app public writable spark
   ```

   Commit: `git add composer.json phpunit.dist.xml && git commit -m "SETUP: composer test tanpa coverage"` (PowerShell: jalankan `git add` dan `git commit` satu demi satu).

**B. `.env`**

3. `.env` sudah wujud ([Lab 2.2](../hari-2/lab.md#lab-22--projek-ci-anda-di-gitlab-s2), [Lab 3.1](../hari-3/lab.md#lab-31--database-mysql--env-s1)). Buka dan pastikan semua nilai ini ada (tambah yang tertinggal, cth `app.indexPage = ''`; tiada `#` di hadapan):

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

   > ⚠️ Port 8080 sudah digunakan aplikasi lain? Tukar **dua-dua** tempat: `app.baseURL = 'http://localhost:8081/'` dalam `.env` dan `php spark serve --port 8081`. Jika hanya port ditukar, `base_url()`, pautan dan redirect Shield masih menuju `:8080`.

4. Sahkan `.env` diabaikan Git:

   ```bash tab="Git Bash / macOS / Linux"
   git status --short | grep -c "\.env$"     # mesti 0
   git check-ignore -v .env                 # mesti menunjukkan baris .gitignore
   ```

   ```powershell tab="PowerShell"
   (git status --short | Select-String "\.env$").Count  # mesti 0
   git check-ignore -v .env                             # mesti menunjukkan baris .gitignore
   ```

5. Uji connection:

   ```bash
   php spark db:table --show
   php spark serve
   ```

   Buka `http://localhost:8080` → halaman *Welcome to CodeIgniter*.

**C. Shield**

6. Pasang dan jalankan setup (hentikan `serve` dahulu dengan Ctrl+C):

   ```bash
   composer require codeigniter4/shield
   php spark shield:setup
   ```

   Jawapan kepada soalan interaktif:

   | Soalan | Jawab |
   |--------|-------|
   | `Config\Email::$fromEmail is not set. Do you set now?` | `y` → `noreply@latihan.test` |
   | `Config\Email::$fromName is not set. Do you set now?` | `y` → `Sistem TLK` |
   | ``Run `spark migrate --all` now?`` | `y` |

7. Jana model pengguna sendiri:

   ```bash
   php spark shield:model UserModel
   ```

   Gantikan seluruh kandungan `app/Models/UserModel.php` yang dijana dengan kod ini (medan profil ditambah dalam `initialize()`):

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

8. `app/Config/Auth.php` — cari `$userProvider` dan `$allowRegistration`, kemudian tukar:

   ```php
   public bool $allowRegistration = false;   // sistem dalaman: tiada daftar sendiri
   public string $userProvider = \App\Models\UserModel::class;
   ```

   Sistem dalaman KKM tidak membenarkan daftar sendiri: `/register` kini dialih keluar dengan mesej ralat.

9. `app/Config/AuthGroups.php` — gantikan seluruh kandungan fail dengan kod di bawah: nilai SPEC §4 (4 group: `applicant`, `reviewer`, `approver`, `admin`; 8 permission: `admin.access`, `tlk.apply`, `tlk.decide`, `pas.apply`, `pas.review`, `pas.approve`, `laporan.view`, `statistik.view`). Komen panjang dalam fail asal Shield tidak diperlukan.

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

   Akaun dicipta oleh `UserSeeder` (langkah 9 Lab 4.3) atau oleh admin:

   ```bash
   php spark shield:user create -n pemohon3 -e pemohon3@latihan.test -g applicant
   ```

   🪟 Kata laluan ditanya secara interaktif. Dalam tetingkap Git Bash berasingan (bukan terminal VS Code), jika prompt tidak muncul: `winpty php spark shield:user create …`.

10. `app/Config/Filters.php` — semak `$globals['before']` masih mengandungi `'csrf'` (dihidupkan dalam Lab 2.4). (`shield:setup` hanya menukar `Security::$csrfProtection = 'session'`; ia **tidak** menghidupkan filter CSRF.)

11. `app/Controllers/BaseController.php` — dalam `initController()`, muatkan helper borang **sebelum** baris `parent::initController(...)`. Jika diletak selepasnya, helper tidak dimuatkan dan `form_dropdown()` gagal pada Hari 5 (*Call to undefined function*):

    ```php
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        $this->helpers = ['form', 'url'];   // MESTI sebelum parent::initController()

        parent::initController($request, $response, $logger);
    }
    ```

**D. Layout Bootstrap 5.3**

12. Cipta `app/Views/partials/flash.php` — mesej flash sekali-papar selepas redirect:

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

    Kunci `success` (TLK) dan `message` (Pas, Hari 7–8) dipapar hijau, `error` merah. Ralat validasi **per medan** tidak di sini — borang memaparkannya dengan `validation_show_error('medan')` (Hari 5).

13. Cipta `app/Views/layouts/main.php` — kerangka minimum (Hari 6 S4 kita akan menggilapnya):

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

    > ℹ️ Tiada internet di makmal? Muat turun `bootstrap.min.css`, `bootstrap.bundle.min.js` dan folder `bootstrap-icons/font` ke `public/assets/` dan tukar `href` kepada `base_url('assets/…')`.

14. Cipta `app/Views/home.php`:

    ```php
    <?= $this->extend('layouts/main') ?>

    <?= $this->section('content') ?>
    <div class="p-4 bg-white rounded-3 border">
        <p class="lead mb-1">Selamat datang, <?= esc(auth()->user()->full_name ?? auth()->user()->username) ?>.</p>
        <p class="text-muted mb-0">Peranan: <?= esc(implode(', ', auth()->user()->getGroups())) ?></p>
    </div>
    <?= $this->endSection() ?>
    ```

15. `app/Controllers/Home.php` — gantikan seluruh fail:

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

16. `app/Config/Routes.php` — lindungi halaman utama. Hanya baris `/` berubah (`filter` `session` + nama route `home`); route `jabatan` dan `zon` dari Hari 3 (termasuk edit jabatan dan butiran zon daripada Lab 3.3b/3.4b) kekal. `php spark shield:setup` sudah menambah `service('auth')->routes($routes);` di hujung — jangan tambah kali kedua (route pendua). Seluruh fail selepas perubahan:

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

    Mulakan semula `php spark serve` (dihentikan dalam langkah 6), kemudian semak checkpoint di bawah.

### ✅ Checkpoint
- `php spark routes | grep -E "login|logout"` → route `login` (GET & POST) dan `logout` wujud (Kuiz S2).
- `http://localhost:8080/` (belum log masuk) → **dialih** ke `http://localhost:8080/login` (tiada `index.php` dalam URL) (Kuiz S2).
- `php spark db:table --show` → jadual `users`, `auth_identities`, `auth_groups_users`, `settings`, `migrations` wujud (Kuiz S2).
- `git status` **tidak** menyenaraikan `.env` (Kuiz S2).
- `php spark list` — baris pertama berakhir dengan `UTC+08:00` (bukti `app.appTimezone` dibaca) (Kuiz S2).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Your requirements could not be resolved… ext-intl` | Extension `intl` tiada | Aktifkan `extension=intl` dalam `php.ini` (`php --ini` untuk cari fail) |
| `shield:setup` → `TypeError … InputOutput::input(): Return value must be of type string, false returned` | Dijalankan tanpa terminal interaktif (cth dalam skrip/IDE) | Jalankan dalam terminal VS Code (tetingkap Git Bash berasingan: `winpty php spark shield:setup`); atau isi `app/Config/Email.php` `$fromEmail`/`$fromName` dahulu, kemudian ulang |
| URL mengandungi `/index.php/login` | `app.indexPage` belum dikosongkan | `.env`: `app.indexPage = ''` |
| `Class "App\Models\UserModel" not found` selepas ubah `Auth.php` | Langkah 7 belum dibuat / namespace salah | `php spark shield:model UserModel`; semak `namespace App\Models;` |
| Halaman putih / CSS tiada | Tiada internet ke CDN | Guna salinan tempatan dalam `public/assets/` |
| `The action you requested is not allowed.` | CSRF dihidupkan, borang tiada token | Tambah `<?= csrf_field() ?>` dalam setiap `<form method="post">` |

### ⭐ Cabaran tambahan
- Tambah `bi-person-circle` dan senarai group pengguna dalam navbar menggunakan `$user->getGroups()`.
- Terjemah halaman log masuk ke BM: salin `vendor/codeigniter4/shield/src/Views/login.php` ke `app/Views/auth/login.php`, ubah teks, kemudian tetapkan `app/Config/Auth.php` → `$views['login'] = 'auth/login'`. (Jangan sunting fail dalam `vendor/` — ia ditulis ganti oleh `composer update`.)

---

## Lab 4.3 — Migration & Seeder daripada ERD (S3)

### 🎯 Objektif
Melengkapkan 10 migration spesifikasi §3 (2 dari Lab 3.2 + 8 baharu, dengan FK, UNIQUE, INDEX), melengkapkan seeder idempoten, dan log masuk sebagai pengguna sintetik.

### Prasyarat
- Lab 4.2 checkpoint lulus (jadual Shield sudah wujud)
- [`erd-rujukan.md`](../docs/erd-rujukan.md) dan [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 dibuka di sebelah
- `departments` + `parking_zones` dan `DepartmentSeeder`/`ParkingSeeder`/`DatabaseSeeder` sudah wujud dari [Lab 3.2](../hari-3/lab.md#lab-32--migration--seeder-pertama-s2)

### Langkah

**A. Migration — mengikut tertib FK**

1. Jana fail pertama sahaja, `AddProfileFieldsToUsers`. Tujuh fail lain dijana dalam langkah 5, **satu demi satu, mengikut tertib FK**: `php spark migrate` menjalankan semua fail dalam folder, termasuk fail yang masih kosong, dan merekodkannya sebagai sudah dijalankan (kemudian `Nothing to migrate`). Cap masa menentukan tertib larian; `CreateDepartmentsTable` dan `CreateParkingZonesTable` dari Lab 3.2 lebih awal, jadi tertib FK kekal betul:

   ```bash
   php spark make:migration AddProfileFieldsToUsers
   ```

2. Buka semula `CreateDepartmentsTable` dari Lab 3.2: corak `addField` + `addPrimaryKey` + `addUniqueKey` + `createTable(…, false, ['ENGINE' => 'InnoDB'])` dan `down()` yang memadam jadual sama digunakan untuk 8 fail baharu.

3. Isi `AddProfileFieldsToUsers` (README §3.3 — `addColumn` + `processIndexes`). Gantikan seluruh kandungan fail yang dijana:

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

4. Jalankan dan uji **sebelum** menulis yang lain (kitaran pendek!):

   ```bash
   php spark migrate
   php spark db:table users --metadata
   php spark migrate:rollback
   php spark migrate
   ```

5. Isi 7 migration selebihnya dengan kod di bawah (berdasarkan [`erd-rujukan.md`](../docs/erd-rujukan.md) dan spesifikasi §3). Gantikan seluruh kandungan setiap fail yang dijana `make:migration`; nama kelas sudah sepadan. Jana dan isi **satu fail pada satu masa**, mengikut tertib ini (jangan jana semua dahulu — `php spark migrate` akan menjalankan fail yang masih kosong):

   ```bash
   php spark make:migration CreateParkingSlotsTable
   php spark make:migration CreateVehiclesTable
   php spark make:migration CreateSlotBookingsTable
   php spark make:migration CreatePassApplicationsTable
   php spark make:migration CreatePassDocumentsTable
   php spark make:migration CreateStatusLogsTable
   php spark make:migration CreateReferenceSequencesTable
   ```

   Senarai semak setiap fail:
   - [ ] Nama jadual & medan **tepat** SPEC §3
   - [ ] `id` INT UNSIGNED AI + `created_at`/`updated_at` DATETIME NULL
   - [ ] `parking_slots` sahaja ada `deleted_at`; `status_logs` hanya `created_at` (rekod audit tidak dikemas kini)
   - [ ] UNIQUE: `parking_zones.code`, (`zone_id`,`slot_no`), `vehicles.plate_no`, `slot_bookings.ref_no`, `pass_applications.ref_no`, (`prefix`,`year`)
   - [ ] INDEX: `slot_bookings` (`slot_id`,`start_date`,`end_date`) & (`status`); `pass_applications` (`status`); `status_logs` (`module`,`record_id`)
   - [ ] Setiap FK: jenis INT UNSIGNED sama dengan induk; `ON DELETE` dipilih dengan sebab
   - [ ] `down()` memadam apa yang `up()` cipta

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

   Jalankan `php spark migrate` selepas setiap satu atau dua fail supaya ralat FK mudah dikesan. Selepas semuanya siap, terangkan satu FK dan satu `ON DELETE` kepada jurulatih.

6. Jalankan semua:

   ```bash
   php spark migrate
   php spark migrate:status
   ```

**B. Seeder**

7. Jana:

   ```bash
   php spark make:seeder UserSeeder
   php spark make:seeder VehicleSeeder
   ```

8. `DepartmentSeeder` sudah ada dari Lab 3.2 (4 jabatan). Corak `ignore(true)->insertBatch()` yang sama diulang untuk slot dan kenderaan di bawah.

9. `UserSeeder` — 5 pengguna (README §3.4), group, `Latihan@2026`, `department_id` dicari ikut `code`, langkau jika e-mel wujud. Gantikan seluruh kandungan fail yang dijana:

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

10. `ParkingSeeder` — zon `A`, `B`, `C` sudah diisi dalam Lab 3.2. Tambah dalam fail yang sama, selepas `insertBatch` zon: 4 slot setiap zon (`A-01`…`C-04`) meliputi kelima-lima kategori `oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`. `zone_id` didapati dengan `array_column()`. Seluruh fail selepas tambahan:

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

11. `VehicleSeeder` — plat rekaan sahaja: `pemohon1` → `WXX 1234` & `WXX 5678`; `pemohon2` → `VXX 2468`; `pelulus` → `WXY 1357`; `admin` → `BXX 9090`. Pengguna dicari dengan `auth()->getProvider()->findByCredentials(['email' => …])`. Gantikan seluruh kandungan fail yang dijana:

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

12. `DatabaseSeeder` — gantikan fail dari Lab 3.2 supaya tertibnya begini:

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

13. Jalankan **dua kali** (ujian idempoten):

    ```bash
    php spark db:seed DatabaseSeeder
    php spark db:seed DatabaseSeeder
    ```

14. `php spark serve` → log masuk `http://localhost:8080/login` sebagai `pelulus@latihan.test` / `Latihan@2026`.

### ✅ Checkpoint
- `php spark migrate:status` → 10 baris namespace `App`, semua ada tarikh *Migrated On* (Kuiz S3).
- `php spark db:table --show` → **18 jadual** (10 SPEC termasuk `users` + 6 `auth_*` + `settings` + `migrations`) (Kuiz S3).
- Larian `db:seed` kedua **tanpa** ralat `Duplicate entry` (Kuiz S3).
- `php spark db:table auth_groups_users` → 5 baris (`applicant` ×2, `reviewer`, `approver`, `admin`) (Kuiz S3).
- Halaman utama selepas log masuk: *"Selamat datang, Dr. Devi a/p Sampel. Peranan: approver"* (Kuiz S3).
- Ujian FK (dalam klien MySQL) (Kuiz S3):

  ```sql
  INSERT INTO vehicles (user_id, plate_no, model, color) VALUES (999, 'WXX 0000', 'Ujian', 'Hitam');
  -- Dijangka: ERROR 1452 … a foreign key constraint fails
  ```

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `errno: 150 "Foreign key constraint is incorrectly formed"` | Jenis FK ≠ jenis PK (signed vs unsigned) atau jadual induk belum wujud | Samakan `'unsigned' => true`; semak tertib cap masa nama fail |
| `Table 'kkm_latihan.users' doesn't exist` semasa `AddProfileFieldsToUsers` | Migration Shield belum dijalankan | `php spark migrate --all` |
| `Nothing to migrate` selepas mengubah fail | Fail sudah direkod dalam jadual `migrations` | `php spark migrate:rollback` → `php spark migrate` |
| `Duplicate entry 'BTM' for key 'code'` pada seed kedua | `insertBatch()` biasa, bukan `ignore(true)` | Guna `->ignore(true)->insertBatch()` |
| `Call to a member function addGroup() on null` | `findById()` dipanggil dengan ID salah | Guna `$users->getInsertID()` **selepas** `save()` |
| Log masuk gagal "Unable to log you in" | Kata laluan tidak di-hash (insert terus ke DB) | Cipta pengguna melalui `UserModel::save(new User([...]))` sahaja |
| ID slot bermula dari 13, bukan 1, selepas seed kedua | `INSERT IGNORE` InnoDB masih "menggunakan" nilai AUTO_INCREMENT | Normal — jangan kod keras ID dalam kod/ujian |

### ⭐ Cabaran tambahan
- Tulis ujian `migrate:refresh --all` → `db:seed` dan ukur masa (`time php spark …`). Tambah skrip Composer `"reset-db"` dalam `composer.json`.
- Tambah `TlkDemoSeeder` (tidak dipanggil `DatabaseSeeder`) yang mencipta 3 tempahan contoh — berguna untuk Hari 9 (Laporan). **Jangan** kod keras `ref_no`; ia akan dijana oleh `ReferenceNumberService` esok.

---

## Lab 4.4 — Pelan Kerja, Branch Git & DoD (S4)

### 🎯 Objektif
Menolak commit `SETUP:` yang bersih ke GitLab, menulis pelan kerja anda, mencuba aliran branch → merge request ke `main` anda sendiri, dan membuktikan repo lengkap dengan klon baharu.

### Prasyarat
- Lab 4.3 checkpoint lulus

### Langkah

1. Semak apa yang akan di-commit — **tiada** `.env`, `vendor/`, `writable/session/*`:

   ```bash tab="Git Bash / macOS / Linux"
   git status --short | head -30
   git status --short | grep -E "\.env$|^.. vendor/" || echo "OK: tiada fail sulit/vendor"
   ```

   ```powershell tab="PowerShell"
   git status --short | Select-Object -First 30
   $m = git status --short | Select-String "\.env$|^.. vendor/"
   if ($m) { $m } else { "OK: tiada fail sulit/vendor" }
   ```

2. Commit berperingkat (mesej bermakna, prefix `SETUP:`):

   ```bash
   git add composer.json composer.lock spark env public app/Config app/Controllers app/Views builds preload.php phpunit*.dist* tests writable .gitignore LICENSE
   git commit -m "SETUP: Shield + layout Bootstrap"
   git add app
   git commit -m "SETUP: 8 migration SPEC §3 + seeder sintetik"
   ```

   `writable` di-commit hanya untuk struktur folder — subfolder di dalamnya mengandungi `index.html` sahaja (`.gitignore` appstarter mengabaikan fail lain), jadi log dan sesi tidak ikut; tanpanya klon baharu (langkah 6) gagal. Corak `phpunit*.dist*` menambah fail ujian yang wujud (`phpunit.xml.dist` pada 4.6, `phpunit.dist.xml` pada 4.7+).

3. Push ke GitLab:

   ```bash
   git push
   ```

4. Cipta `docs/pelan-kerja.md`:

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

5. Cuba aliran branch + merge request sekali (latihan 10 minit):

   ```bash
   git switch -c feat/pelan-kerja
   git add docs/pelan-kerja.md
   git commit -m "DOCS: pelan kerja + DoD"
   git push -u origin feat/pelan-kerja
   ```

   Di GitLab: **Create merge request** (sasaran `main` repo anda sendiri) → minta jurulatih (sudah Reporter sejak Lab 2.2) atau rakan sebelah memberi satu komen → **Merge**. Rakan sebelah perlu dijemput dahulu: *Members → Invite members*, peranan **Reporter**. Kemudian:

   ```bash
   git switch main
   git pull
   git log --oneline --graph -5
   ```

6. **Klon baharu** ke folder lain untuk membuktikan repo lengkap. Klon menggunakan database ujian supaya semua jadual dibina dari kosong (jadual di dalamnya dipadam semula setiap kali ujian dijalankan, jadi ia selamat diguna). Hentikan `php spark serve` projek asal dahulu (`Ctrl+C`):

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/latihan
   git clone https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git kelas-ci-<nama>-klon
   cd kelas-ci-<nama>-klon
   composer install
   cp ../kelas-ci-<nama>/.env .env
   ```

   ```powershell tab="PowerShell"
   cd $HOME\latihan
   git clone https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git kelas-ci-<nama>-klon
   cd kelas-ci-<nama>-klon
   composer install
   Copy-Item ../kelas-ci-<nama>/.env .env
   ```

   Dalam `.env` klon, tukar **satu** baris: `database.default.database = kkm_latihan_test`. Kemudian:

   ```bash
   php spark migrate --all
   php spark db:seed DatabaseSeeder
   php spark serve
   ```

   Log masuk sebagai `pelulus@latihan.test` / `Latihan@2026`. Berjaya? Padam folder klon: `cd ~/latihan && rm -rf kelas-ci-<nama>-klon` (PowerShell: `cd $HOME\latihan`, kemudian `Remove-Item -Recurse -Force kelas-ci-<nama>-klon`).

### ✅ Checkpoint
- `git log --oneline` menunjukkan ≥ 2 commit `SETUP:` dan satu merge `feat/pelan-kerja` di GitLab (Kuiz S4).
- `git ls-files | grep -c "^\.env$"` → `0` (Kuiz S4).
- Resepi klon baharu (langkah 6) berjaya sehingga log masuk — **ini bukti migration & seeder anda lengkap** (Kuiz S4).
- `docs/pelan-kerja.md` wujud dan anda boleh menyebut 3 item DoD tanpa melihat (Kuiz S4).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `.env` tersenarai dalam `git status` | `.gitignore` appstarter terubah | Tambah baris `.env` dan `/vendor/` ke `.gitignore` |
| `.env` sudah ter-commit | Tersilap `git add -f` | `git rm --cached .env` → commit → **tukar kata laluan DB** (ia sudah bocor dalam sejarah) |
| `composer install` gagal pada klon baharu | `composer.lock` tidak di-commit | Commit `composer.lock` |
| Butang *Merge* tiada di GitLab | Akaun anda bukan Maintainer projek, atau MR masih *Draft* | Projek dalam namespace anda sendiri (anda Owner); buang tanda *Draft* |
| `migrate --all` pada klon → `Nothing to migrate` | `.env` klon masih menunjuk `kkm_latihan` | Tukar `database.default.database = kkm_latihan_test` |

### ⭐ Cabaran tambahan
Lindungi `main` di GitLab (*Settings → Repository → Protected branches*: *Allowed to push* = **No one**) supaya setiap perubahan mulai Hari 5 melalui merge request.

---

## Lab 4.1b — Jejak Request POST `/jabatan` (S5)

### 🎯 Objektif
Menjejak satu request **POST** (borang `/jabatan/baharu` dari Lab 3.3) dengan Debug Toolbar dan `php spark filter:check`, kemudian membandingkannya dengan jejak GET `/zon` dari Lab 4.1: filter `csrf`, validation `is_unique`, `INSERT` dan redirect `303`.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 4.1](#lab-41--demo-projek--jejak-kitaran-request-s1) siap: `docs/kitaran-request.md` sudah di-push.
- [Lab 3.3](../hari-3/lab.md#lab-33--model--halaman-jabatan-s3) siap: `/jabatan/baharu` menyimpan jabatan baharu.

### Langkah

1. `php spark serve`, buka `http://localhost:8080/jabatan/baharu`. Isi Kod `BPK`, Nama `Bahagian Perkhidmatan (Latihan)` → **Simpan**. Pelayar kembali ke `/jabatan` dengan mesej *"Jabatan BPK disimpan."*
2. Toolbar di bawah halaman `/jabatan` ialah request **GET** selepas redirect, bukan POST. Klik ikon 🔥 → tab **History**. Jadual menyenaraikan request terkini (lajur *Status*, *Method*, *URL*). Pada baris **POST** `http://localhost:8080/jabatan`, klik **Load**. Toolbar kini memaparkan data request POST itu.
3. Catat daripada request POST yang dimuat:
   - Lajur *Status* dalam History: kod status POST (bukan `200`).
   - Tab **Vars** → bahagian *Response*: header `Location`. Bahagian *POST*: medan yang diterima controller — `csrf_test_name` tiada kerana filter `csrf` membuangnya selepas token disahkan.
   - Tab **Database**: bilangan query dan teks SQL. Klik query `SELECT 1 FROM departments …` untuk melihat *trace*: ia datang dari `Validation\Rules->is_unique()`, bukan dari controller.
   - Tab **Views**: bilangan view yang dimuat semasa POST.
   - Tab **Routes**: controller dan method yang dipadan.
4. Terminal kedua (biarkan `serve` berjalan). Pilih tab ikut terminal anda. Git Bash menukar `/jabatan` kepada path Windows (`C:/Program Files/Git/jabatan`), jadi letak `MSYS_NO_PATHCONV=1` di hadapan. PowerShell tidak menukar path, jadi taip arahan tanpa awalan itu:

   ```bash tab="Git Bash / macOS / Linux"
   MSYS_NO_PATHCONV=1 php spark filter:check POST /jabatan
   MSYS_NO_PATHCONV=1 php spark filter:check GET /zon
   ```

   ```powershell tab="PowerShell"
   php spark filter:check POST /jabatan
   php spark filter:check GET /zon
   ```

   Baca lajur *Before Filters*: `forcehttps pagecache csrf` bagi kedua-duanya. Filter `csrf` berjalan pada setiap request, tetapi hanya **mengesahkan token** pada POST.
5. **Kod berganda.** Buka semula `/jabatan/baharu`, isi Kod `BTM` (sudah wujud), Nama `Ujian berganda` → **Simpan**. Ralat dipaparkan di bawah Kod. History → **Load** baris POST terbaharu: catat bilangan query dalam tab Database dan header `Location`.
6. **Tanpa token CSRF.** Di `/jabatan/baharu`, tekan F12 → tab **Elements** → cari `<input type="hidden" name="csrf_test_name" …>` → klik kanan → **Delete element**. Isi Kod `BPX`, Nama `Tanpa token` → **Simpan**. Halaman ralat memaparkan *The action you requested is not allowed.* (kod `403`). Buka `/jabatan`: `BPX` **tiada** — filter `csrf` menghentikan request sebelum controller.
7. Tambah bahagian ini di **hujung** `docs/kitaran-request.md`, kemudian isi lajur yang kosong daripada catatan langkah 3–6:

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

8. Commit dan push:

   ```bash tab="Git Bash / macOS / Linux"
   git add docs/kitaran-request.md && git commit -m "DOCS: kitaran request POST /jabatan" && git push
   ```

   ```powershell tab="PowerShell"
   git add docs/kitaran-request.md
   git commit -m "DOCS: kitaran request POST /jabatan"
   git push
   ```

### ✅ Checkpoint
- [ ] History Debug Toolbar menunjukkan POST `/jabatan` berstatus `303` dengan dua query (`SELECT 1 … LIMIT 1` dari `is_unique` dan `INSERT`) dan tiada view (Kuiz S5).
- [ ] Kod berganda `BTM` menghasilkan satu query `SELECT` sahaja (tiada `INSERT`); borang tanpa token CSRF ditolak `403` sebelum controller (Kuiz S5).
- [ ] GitLab menunjukkan commit `DOCS: kitaran request POST /jabatan` (Kuiz S5).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Tab History tiada baris POST | Toolbar dibuka pada halaman lama, atau folder `writable/debugbar/` tidak boleh ditulis | Muat semula `/jabatan` selepas Simpan, kemudian buka History; semak `writable/debugbar/` wujud |
| Tab Views menunjukkan `jabatan/index` | Baris **GET** `/jabatan` yang dimuat, bukan POST | Klik **Load** pada baris yang lajur *Method* = `POST` |
| `Can't find a route: "POST C:/Program Files/Git/jabatan"` | Git Bash menukar `/jabatan` kepada path Windows | Letak `MSYS_NO_PATHCONV=1` di hadapan arahan |
| `MSYS_NO_PATHCONV=1 : The term 'MSYS_NO_PATHCONV=1' is not recognized` | Arahan Git Bash ditaip dalam PowerShell | Guna tab **PowerShell**: buang `MSYS_NO_PATHCONV=1` |
| `The token '&&' is not a valid statement separator` | Windows PowerShell 5.1 tidak menyokong `&&` | Guna tab **PowerShell**: jalankan `git add`, `git commit` dan `git push` satu demi satu |
| *The action you requested is not allowed.* semasa Simpan biasa | Tab dibuka terlalu lama atau borang dimuat sebelum `serve` dimulakan semula | Muat semula `/jabatan/baharu` (token baharu), kemudian hantar semula |

### ⭐ Cabaran tambahan
Selepas Lab 4.2, ulang jejak ini untuk **POST `/login`**: query apa yang Shield jalankan (`auth_identities`, `auth_logins`), dan ke mana header `Location` membawa anda?

---

## Lab 4.2b — Lindungi Halaman Hari 3 dengan Filter Shield (S6)

### 🎯 Objektif
Memasang filter Shield `session` dan `permission:admin.access` pada route Hari 3 (`/jabatan`, `/zon`, `/jabatan/baharu`), membuktikannya dengan `php spark routes` dan `filter:check`, dan mengujinya dengan dua akaun ujian (`admin` dan `applicant`) yang dicipta dengan `php spark shield:user`.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 4.2](#lab-42--projek-ci4-env-shield--layout-s2) checkpoint lulus: `/` dialih ke `/login`, `AuthGroups` ikut SPEC §4, layout `layouts/main.php` + `partials/flash.php` wujud.
- Lab 4.3 **belum** dibuat: jadual `users` belum ada medan profil dan belum ada pengguna sintetik. Lab ini mencipta dua akaun ujian sementara dan memadamnya di hujung lab.

### Langkah

1. **Sebelum.** Lihat lubang akses sekarang:

   ```bash tab="Git Bash / macOS / Linux"
   php spark routes | grep -E "jabatan|zon"
   ```

   ```powershell tab="PowerShell"
   php spark routes | Select-String "jabatan|zon"
   ```

   Lajur *Before Filters* hanya `csrf`. Buka `http://localhost:8080/zon` dalam tetingkap **incognito** (belum log masuk): senarai zon dipaparkan kepada sesiapa sahaja.
2. `app/Config/Routes.php` — gantikan seluruh fail. Route `/` dan `service('auth')->routes($routes);` dari Lab 4.2 kekal; route Hari 3 mendapat filter:

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

   Filter yang sama pada GET (borang) **dan** POST (simpan) — jika POST tidak dilindungi, sesiapa yang log masuk boleh menghantar borang terus.
3. Sahkan:

   ```bash tab="Git Bash / macOS / Linux"
   php -l app/Config/Routes.php
   php spark routes | grep -E "jabatan|zon"
   MSYS_NO_PATHCONV=1 php spark filter:check GET /jabatan/baharu
   ```

   ```powershell tab="PowerShell"
   php -l app/Config/Routes.php
   php spark routes | Select-String "jabatan|zon"
   php spark filter:check GET /jabatan/baharu
   ```

   `jabatan`, `zon` dan `zon/([0-9]+)` → `csrf session`; `jabatan/baharu`, `jabatan/([0-9]+)/edit` (GET) dan `jabatan`, `jabatan/([0-9]+)` (POST) → `csrf permission:admin.access`. `filter:check` menunjukkan kelas `CodeIgniter\Shield\Filters\PermissionFilter:admin.access` selepas `CSRF`.
4. Cipta dua akaun ujian. Setiap arahan menanya kata laluan dua kali — taip `Latihan@2026`:

   ```bash
   php spark shield:user create -n ujiadmin -e ujiadmin@latihan.test -g admin
   php spark shield:user create -n ujipemohon -e ujipemohon@latihan.test -g applicant
   php spark shield:user list
   ```

   Output: `User "ujiadmin" created` dan `The user is added to group "admin".` (begitu juga `ujipemohon` → `applicant`).
5. Cipta `docs/akses-route.md`, kemudian uji setiap baris dalam tetingkap **incognito** dan isi lajur *Sebenar*:

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

   Halaman Utama memaparkan *"Selamat datang, ujipemohon."* — nama pengguna, kerana medan `full_name` hanya ditambah dalam Lab 4.3.
6. Log keluar (`http://localhost:8080/logout`), kemudian padam kedua-dua akaun ujian supaya Lab 4.3 bermula dengan jadual `users` kosong. Jawab `y` bagi setiap soalan pengesahan:

   ```bash
   php spark shield:user delete -n ujiadmin
   php spark shield:user delete -n ujipemohon
   php spark shield:user list
   ```

   Jika anda mencipta `pemohon3` dalam Lab 4.2 langkah 9, padam juga: `php spark shield:user delete -n pemohon3`.

   `shield:user delete` memadam baris `users` secara kekal; `auth_identities` dan `auth_groups_users` ikut terpadam (FK `ON DELETE CASCADE` Shield — anda membuktikannya dalam Lab 4.3b).
7. Commit dan push **fail docs sahaja** (`Routes.php` masuk commit `SETUP:` dalam Lab 4.4 langkah 2):

   ```bash tab="Git Bash / macOS / Linux"
   git add docs/akses-route.md && git commit -m "DOCS: matriks akses route Hari 3" && git push
   ```

   ```powershell tab="PowerShell"
   git add docs/akses-route.md
   git commit -m "DOCS: matriks akses route Hari 3"
   git push
   ```

### ✅ Checkpoint
- [ ] `php spark routes` menunjukkan `session` pada `jabatan` dan `zon`, dan `permission:admin.access` pada `jabatan/baharu` (GET) serta `jabatan` (POST) (Kuiz S6).
- [ ] Matriks `docs/akses-route.md` lengkap: belum log masuk → `/login`; `ujipemohon` ditolak dari `/jabatan/baharu`; `ujiadmin` nampak borang (Kuiz S6).
- [ ] GitLab menunjukkan commit `DOCS: matriks akses route Hari 3`, dan `php spark shield:user list` tidak lagi menyenaraikan `ujiadmin`/`ujipemohon` (Kuiz S6).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `/zon` masih dipaparkan tanpa log masuk | Tetingkap biasa masih log masuk, atau `Routes.php` belum disimpan | Guna tetingkap incognito; semak `php spark routes` |
| `shield:user create` tidak memaparkan prompt kata laluan | Tetingkap Git Bash berasingan (mintty) | Guna terminal VS Code, atau `winpty php spark shield:user create …` |
| `The "Password" field must be at least 8 characters in length.` dan prompt diulang | Kata laluan kurang 8 aksara | Taip `Latihan@2026` apabila ditanya semula |
| `Can't find a route: "GET C:/Program Files/Git/jabatan/baharu"` | Git Bash menukar path | `MSYS_NO_PATHCONV=1` di hadapan `php spark filter:check` |
| Ralat atau halaman kosong selepas `shield:user delete` | Pelayar masih log masuk sebagai akaun yang dipadam | Buka `/logout` atau tutup tetingkap incognito |

### ⭐ Cabaran tambahan
Sembunyikan pautan *+ Jabatan baharu* dalam `app/Views/jabatan/index.php` daripada bukan admin dengan `<?php if (auth()->user()?->can('admin.access')): ?> … <?php endif ?>`. Kemudian buka `/jabatan/baharu` terus sebagai `ujipemohon` (cipta semula, padam selepas itu): kenapa filter route masih diperlukan walaupun pautan sudah disembunyikan?

---

## Lab 4.3b — Latihan FK, `ON DELETE` & Seeder Jujukan (S7)

### 🎯 Objektif
Membuktikan setiap kekangan Lab 4.3 dengan query sebenar dalam klien MySQL — FK tanpa induk (`1452`), UNIQUE komposit (`1062`), `RESTRICT` (`1451`), `SET NULL` dan `CASCADE` — tanpa merosakkan data (transaksi + `ROLLBACK`), kemudian menambah `ReferenceSequenceSeeder` yang idempoten.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 4.3](#lab-43--migration--seeder-daripada-erd-s3) checkpoint lulus: 18 jadual, 5 pengguna, 12 slot, 5 kenderaan dalam `kkm_latihan`.
- Lab 4.2b selesai (akaun ujian sudah dipadam).

### Langkah

**A. Kekangan dalam klien MySQL**

1. Buka klien MySQL pada database pembangunan (kata laluan `Latihan@2026`):

   ```bash
   mysql -u kkm_dev -p kkm_latihan
   ```

   Prompt bertukar kepada `mysql>`. Tampal setiap blok di bawah **satu demi satu** dan baca output sebelum blok seterusnya.
2. Senarai semua FK dan `ON DELETE` masing-masing:

   ```sql
   SELECT TABLE_NAME, CONSTRAINT_NAME, DELETE_RULE
   FROM information_schema.REFERENTIAL_CONSTRAINTS
   WHERE CONSTRAINT_SCHEMA = 'kkm_latihan'
   ORDER BY TABLE_NAME, CONSTRAINT_NAME;
   ```

   Padankan setiap baris dengan `addForeignKey()` dalam migration Lab 4.3 (dan migration Shield untuk `auth_*`).
3. FK tanpa induk dan UNIQUE komposit — kedua-dua ditolak, tiada baris berubah:

   ```sql
   UPDATE users SET department_id = 99 WHERE username = 'pemohon1';
   UPDATE parking_slots SET slot_no = 'A-02' WHERE slot_no = 'A-01';
   ```

   Dijangka: `ERROR 1452 … CONSTRAINT users_department_id_fk …` dan `ERROR 1062 … Duplicate entry '…-A-02' for key 'parking_slots.zone_id_slot_no'` (nombor di hadapan `-A-02` ialah `id` zon A).
4. `RESTRICT` — induk yang masih ada anak tidak boleh dipadam:

   ```sql
   DELETE FROM parking_zones WHERE code = 'A';
   DELETE FROM users WHERE username = 'pemohon2';
   ```

   Catat nama `CONSTRAINT` dalam setiap mesej `ERROR 1451`.
5. `SET NULL` — dalam transaksi, kemudian `ROLLBACK` supaya data kekal:

   ```sql
   START TRANSACTION;
   DELETE FROM departments WHERE code = 'BPA';
   SELECT username, department_id FROM users ORDER BY id;
   ROLLBACK;
   SELECT username, department_id FROM users ORDER BY id;
   ```

   Catat berapa pengguna mendapat `department_id` `NULL` sebelum `ROLLBACK`, dan nilai selepasnya.
6. `CASCADE` (FK Shield) — padam `penyemak` (tiada kenderaan) dalam transaksi:

   ```sql
   START TRANSACTION;
   DELETE FROM users WHERE username = 'penyemak';
   SELECT COUNT(*) AS identiti FROM auth_identities;
   SELECT COUNT(*) AS ahli_group FROM auth_groups_users;
   ROLLBACK;
   SELECT COUNT(*) AS identiti FROM auth_identities;
   SELECT COUNT(*) AS ahli_group FROM auth_groups_users;
   ```

   Dijangka: `4` dan `4` sebelum `ROLLBACK`, `5` dan `5` selepasnya. Taip `exit` untuk keluar.

   > ⚠️ Langkah 5–6 **mesti** bermula dengan `START TRANSACTION;`. Tanpanya `DELETE` berlaku serta-merta — lihat *Masalah lazim*.
7. Cipta `docs/ujian-fk.md` dan isi lajur *Sebenar* daripada output langkah 3–6:

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

**B. Seeder jujukan nombor rujukan**

8. Jana seeder:

   ```bash
   php spark make:seeder ReferenceSequenceSeeder
   ```

   Gantikan seluruh kandungan fail yang dijana:

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

9. `DatabaseSeeder` — gantikan fail Lab 4.3 dengan versi ini (satu baris baharu di hujung):

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

10. Jalankan **dua kali** dan semak:

    ```bash
    php -l app/Database/Seeds/ReferenceSequenceSeeder.php
    php spark db:seed DatabaseSeeder
    php spark db:seed DatabaseSeeder
    php spark db:table reference_sequences
    ```

    Dijangka: 2 baris — `TLK` dan `PAS`, tahun semasa, `last_number` `0` — tanpa ralat `Duplicate entry`. Esok `ReferenceNumberService::next('TLK')` mengunci baris `TLK` ini dan menjana `TLK-2026-0001`.
11. Commit dan push **fail docs sahaja** (seeder masuk commit `SETUP:` dalam Lab 4.4 langkah 2):

    ```bash tab="Git Bash / macOS / Linux"
    git add docs/ujian-fk.md && git commit -m "DOCS: ujian FK & ON DELETE" && git push
    ```

    ```powershell tab="PowerShell"
    git add docs/ujian-fk.md
    git commit -m "DOCS: ujian FK & ON DELETE"
    git push
    ```

### ✅ Checkpoint
- [ ] `docs/ujian-fk.md` lengkap 6 baris: `1452`, `1062`, dua `1451` (dengan nama `CONSTRAINT`), `SET NULL` dan `CASCADE` dalam transaksi; selepas `ROLLBACK` data kembali asal (Kuiz S7).
- [ ] `php spark db:seed DatabaseSeeder` dua kali → `reference_sequences` tepat 2 baris (`TLK`, `PAS`, `last_number` `0`) (Kuiz S7).
- [ ] GitLab menunjukkan commit `DOCS: ujian FK & ON DELETE` (Kuiz S7).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `mysql` tergantung tanpa prompt | Tetingkap Git Bash berasingan (mintty) | Guna terminal VS Code, atau `winpty mysql -u kkm_dev -p kkm_latihan` |
| `DELETE` langkah 5/6 berjaya tetapi `ROLLBACK` tidak memulihkan data | `START TRANSACTION;` tertinggal (autocommit) | Bina semula data sintetik: `php spark migrate:refresh --all` → `php spark db:seed DatabaseSeeder` (⚠️ memadam semua data dalam `kkm_latihan`) |
| `ERROR 1046 (3D000): No database selected` | `mysql -u kkm_dev -p` tanpa nama database | Taip `USE kkm_latihan;` atau ulang dengan `kkm_latihan` di hujung arahan |
| `Duplicate entry 'TLK-2026' for key …` pada seed kedua | `insertBatch()` tanpa `ignore(true)` | Guna `->ignore(true)->insertBatch($rows)` |
| `Class "App\Database\Seeds\ReferenceSequenceSeeder" not found` | Nama fail/kelas tidak sama | Fail `app/Database/Seeds/ReferenceSequenceSeeder.php`, kelas `ReferenceSequenceSeeder` |

### ⭐ Cabaran tambahan
Jalankan `SHOW CREATE TABLE slot_bookings;` dan senaraikan keempat-empat FK dengan `ON DELETE` masing-masing. Terangkan kepada rakan sebelah kenapa `decided_by` ialah `SET NULL` tetapi `user_id` ialah `RESTRICT`.

---

## Lab 4.4b — Merge Request Kedua: README Projek & Semakan (S8)

### 🎯 Objektif
Menjalankan kitaran merge request lengkap kali kedua dengan perubahan sebenar (`README.md` projek): branch → commit → MR → komen semakan → commit pembetulan pada branch yang **sama** → merge → padam branch → `git log --graph`.

### Prasyarat
- [Lab 4.4](#lab-44--pelan-kerja-branch-git--dod-s4) checkpoint lulus: MR `feat/pelan-kerja` *Merged*, `git status --short` kosong.

### Langkah

1. Mulakan branch baharu daripada `main` terkini:

   ```bash tab="Git Bash / macOS / Linux"
   git switch main && git pull
   git switch -c feat/readme-projek
   ```

   ```powershell tab="PowerShell"
   git switch main
   git pull
   git switch -c feat/readme-projek
   ```

2. `README.md` dalam akar projek masih README umum appstarter. Gantikan seluruh kandungannya:

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

3. Commit dan push branch:

   ```bash
   git add README.md
   git commit -m "DOCS: README persediaan pembangun"
   git push -u origin feat/readme-projek
   ```

4. Di GitLab: **Create merge request** (sasaran `main` repo anda sendiri). Tanda ✅ *Delete source branch when merge request is accepted*; **jangan** tanda *Squash commits*. Minta jurulatih atau rakan sebelah (Reporter) memberi komen ini pada tab *Changes*, baris `## Akses route`:

   > *Tambah cara menyemak filter route dengan `php spark filter:check` supaya pembangun baharu boleh mengesahkan akses sendiri.*

5. Betulkan pada branch yang **sama** — tambah bahagian ini di **hujung** `README.md`:

   ```markdown

   ## Semak filter route

   Git Bash menukar `/jabatan` kepada path Windows, jadi letak `MSYS_NO_PATHCONV=1` di hadapan:

       MSYS_NO_PATHCONV=1 php spark filter:check GET /jabatan/baharu

   PowerShell tidak menukar path, jadi taip arahan tanpa `MSYS_NO_PATHCONV=1`.

   Lajur *Before Filters* mesti mengandungi `permission:admin.access`.
   ```

   Kemudian:

   ```bash
   git add README.md
   git commit -m "DOCS: README — semakan filter (komen MR)"
   git push
   ```

   Muat semula MR: tab *Commits* kini menunjukkan berapa commit? Balas komen penyemak (*"Dibetulkan dalam commit …"*) dan klik **Resolve thread**.
6. **Merge**. Kemudian di laptop:

   ```bash
   git switch main
   git pull
   git fetch --prune
   git branch -d feat/readme-projek
   git log --oneline --graph -6
   ```

   `git fetch --prune` mencetak `- [deleted] (none) -> origin/feat/readme-projek` (GitLab sudah memadam branch sumber); `git branch -d` mencetak `Deleted branch feat/readme-projek (was …)`.
7. Buka halaman projek di GitLab: README baharu dipaparkan di bawah senarai fail.

### ✅ Checkpoint
- [ ] MR `feat/readme-projek` berstatus *Merged* dengan 2 commit dan satu thread komen *Resolved* (Kuiz S8).
- [ ] `git log --oneline --graph -6` menunjukkan commit merge `feat/readme-projek` dengan dua commit `DOCS:` pada garis sisi (Kuiz S8).
- [ ] `git branch -a` tidak lagi menyenaraikan `feat/readme-projek` (lokal atau `origin/`), dan `git status --short` kosong (Kuiz S8).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `git push` ditolak (`rejected … fetch first`) | README diedit terus di GitLab (cth *Apply suggestion*) | `git pull` pada branch itu dahulu, kemudian `git push` |
| Graf lurus tanpa commit merge | *Squash commits* ditanda, atau kaedah merge projek *Fast-forward* | *Settings → Merge requests → Merge method* = **Merge commit**; jangan tanda *Squash* |
| `error: the branch 'feat/readme-projek' is not fully merged` | `git pull` belum dibuat selepas merge | `git switch main && git pull` (PowerShell: jalankan `git switch main` dan `git pull` satu demi satu), kemudian ulang `git branch -d` |
| README tidak dipaparkan di GitLab | Nama fail bukan `README.md` di akar projek | `git mv` ke `README.md` di akar |

### ⭐ Cabaran tambahan
Minta penyemak menggunakan butang **Insert suggestion** dalam komen (cadangan satu baris). Klik **Apply suggestion** di GitLab, kemudian `git pull` pada branch sebelum commit seterusnya — apa yang berlaku jika anda `git push` tanpa `git pull` dahulu?

---

## Semakan kendiri — akhir hari

```bash
php spark migrate:status    # semua migration App, Shield & Settings bertanda telah dijalankan
git status --short          # tiada output
git log --oneline           # ≥ 2 commit SETUP:
```

- [ ] `php spark serve` → `http://localhost:8080/` mengalih ke halaman log masuk tanpa ralat (Kuiz S2).
- [ ] `php spark migrate:status` menunjukkan **semua** migration (10 App + Shield + Settings) telah dijalankan (Kuiz S3).
- [ ] Log masuk sebagai `pelulus@latihan.test` / `Latihan@2026` berjaya; `pemohon1@latihan.test` juga (Kuiz S3).
- [ ] `git status --short` kosong dan `git ls-files | grep -c "^\.env$"` → `0` (Kuiz S2).
- [ ] `git log --oneline` menunjukkan ≥ 2 commit `SETUP:` (Kuiz S4).
- [ ] Klon baharu (Lab 4.4 langkah 6) berjaya sehingga log masuk (Kuiz S4).
- [ ] Sebelum log masuk, `/zon` dan `/jabatan` mengalih ke `/login`; `/jabatan/baharu` hanya dibuka oleh `admin@latihan.test` (Lab 4.2b) (Kuiz S6).
- [ ] `php spark db:table reference_sequences` → 2 baris (`TLK`, `PAS`), dan MR `feat/readme-projek` berstatus *Merged* (Lab 4.3b, 4.4b) (Kuiz S8).
