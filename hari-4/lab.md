# Lab Hari 4 — Development Kickoff

[⬅️ README Hari 4](./README.md) · [📘 SPEC](../SPEC-KURSUS.md) · [🤝 KOLABORASI](../KOLABORASI.md) · [🧩 Template kod](../templates/kod/)

> **Peraturan lab:** cuba **manual dahulu** (baca ralat, semak SPEC, tanya navigator). AI (Claude Code) hanya selepas 10 minit buntu — dan hanya untuk *menerangkan*, bukan menjana fail penuh. Template dalam `templates/kod/` untuk **menyemak**, bukan menyalin.

| Lab | Sesi | Masa | Hasil |
|-----|------|------|-------|
| 4.1 | S1 | 09:00–10:30 | Demo tugasan + jejak kitaran request |
| 4.2 | S2 | 10:45–12:30 | Projek CI4 + `.env` + Shield + layout |
| 4.3 | S3 | 14:30–16:00 | 10 migration + 5 seeder + log masuk |
| 4.4 | S4 | 16:00–17:00 | Pelan kerja, branch Git, commit `SETUP:` |

---

## Lab 4.1 — Demo Tugasan & Jejak Kitaran Request (S1)

### 🎯 Objektif
Mendemokan aplikasi berita tugasan persediaan dan menerangkan 7 langkah kitaran request CI4 dengan bukti dari Debug Toolbar.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Tugasan T1–T4 ([`docs/tugasan-persediaan.md`](../docs/tugasan-persediaan.md)) siap
- Aplikasi berita berjalan: `php spark serve` → `http://localhost:8080/news`
- `~/latihan/kelas-ci-<nama>` dengan borang `/daftar` ([Lab 2.4](../hari-2/lab.md#lab-24--borang-validation--csrf-s4)) — demo 1 minit bersama aplikasi berita

### Langkah

1. Buka `http://localhost:8080/news`. Klik ikon 🔥 **Debug Toolbar** (penjuru kanan bawah — hanya muncul jika `CI_ENVIRONMENT = development`).
2. Tab **Timeline** — cari dan catat masa bagi: `Routing`, `Before Filters`, `Controller`, `After Filters`.
3. Tab **Routes** — catat controller & method yang dipadan untuk `/news`.
4. Tab **Database** — salin query SQL yang dijalankan. Cari baris dalam `NewsModel` yang menjananya.
5. Tab **Views** — senaraikan fail view yang dimuat (termasuk `templates/header`).
6. Terminal:

   ```bash
   php spark routes
   ```

   Padankan baris `news/(:segment)` dengan method controller.
7. Isi jadual ini dalam `docs/kitaran-request.md` (salin ke repo anda):

   | # | Langkah | Fail | Bukti (Toolbar/`spark routes`) |
   |---|---------|------|-------------------------------|
   | 1 | Front controller | `public/index.php` | |
   | 2 | Routing | | |
   | 3 | Filter before | | |
   | 4 | Controller | | |
   | 5 | Model | | |
   | 6 | View | | |
   | 7 | Response | | |

8. Demo 3 minit kepada jurulatih: tunjukkan aplikasi, kemudian terangkan jadual di atas.

### ✅ Checkpoint
- `docs/kitaran-request.md` lengkap 7 baris dengan bukti.
- Anda boleh menjawab: *"Jika saya tambah filter `session` pada route `/news`, langkah mana yang berubah dan apa berlaku kepada pengguna tidak log masuk?"*

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Debug Toolbar tidak muncul | `CI_ENVIRONMENT` bukan `development` / `.env` tiada | `cp env .env`, nyahkomen `CI_ENVIRONMENT = development` |
| `404 - Can't find a route for 'GET: news'` | Route belum ditambah / auto routing dimatikan | Tambah `$routes->get('news', [News::class, 'index']);` |
| `Unable to connect to the database` | `.env` salah | Semak `database.default.*`; cuba `hostname = 127.0.0.1` |
| `The required PHP extension "sqlite3" is not loaded` bila `composer test` (Windows) | Kumpulan database `tests` appstarter masih SQLite; Laragon tidak menghidupkan `sqlite3` | Kursus guna MySQL untuk ujian: salin blok `database.tests.*` dari [`nota/10`](../nota/10-ujian-phpunit-ci4.md) §3 ke `.env` (database `kkm_latihan_test`) — Hari 6 menetapkannya juga. Disahkan pada Windows: selepas itu `composer test` → `OK` |

### ⭐ Cabaran tambahan
Tambah `log_message('info', 'News::show slug={slug}', ['slug' => $slug]);` dalam controller, tetapkan `app/Config/Logger.php` `$threshold = 7`, kemudian cari baris itu dalam `writable/logs/log-YYYY-MM-DD.log`.

---

## Lab 4.2 — Projek CI4, `.env`, Shield & Layout (S2)

### 🎯 Objektif
Mencipta projek CI4 dalam repo pasangan, mengkonfigur `.env`, memasang Shield dengan medan profil & peranan SPEC §4, dan membina layout Bootstrap 5.3.

### Prasyarat
- Repo `~/latihan/sistem-tlk-pas` (dari Hari 1, mengandungi `docs/`)
- Route, controller, layout view, borang, validation dan CSRF sudah dibuat dalam `kelas-ci-<nama>` (Lab 2.2–2.4). Lab ini menambah database, Shield dan Bootstrap dalam projek yang sama.
- Database `kkm_latihan` & `kkm_latihan_test` + pengguna `kkm_dev` ([`docs/persediaan.md`](../docs/persediaan.md) §4)
- PHP ≥ 8.2 dengan `intl`, `mbstring`, `mysqli` (`php -m`)
- `php.ini` (untuk muat naik dokumen Pas, Hari 7): `upload_max_filesize = 8M` dan `post_max_size = 16M` atau lebih. Semak: `php -i | grep -E "upload_max_filesize|post_max_size"`. Cari fail dengan `php --ini`; mulakan semula `php spark serve` selepas menukar.

### Langkah

**A. Cipta projek dalam repo sedia ada**

1. `composer create-project` memerlukan folder kosong, jadi cipta dalam subfolder sementara dan pindahkan:

   ```bash
   cd ~/latihan/sistem-tlk-pas
   composer create-project codeigniter4/appstarter ci4-tmp
   cp -Rn ci4-tmp/. .        # -n: jangan tulis ganti fail sedia ada (cth README.md anda)
   rm -rf ci4-tmp
   ```

   🪟 **Windows:** jalankan blok di atas dalam Git Bash. Jangan guna `Copy-Item` PowerShell — ia menulis ganti `README.md` anda.

   **Kebersihan projek (semua OS).** Cipta dua fail di akar projek dalam VS Code (*File → New File*), supaya hujung baris LF dan inden sama di Windows, macOS dan Linux. `.gitattributes` (template: [`gitattributes.txt`](../templates/kod/gitattributes.txt)):

   ```text
   * text=auto eol=lf
   *.bat text eol=crlf
   *.png binary
   *.jpg binary
   *.jpeg binary
   *.gif binary
   *.ico binary
   *.pdf binary
   *.xlsx binary
   *.zip binary
   *.woff binary
   *.woff2 binary
   *.ttf binary
   ```

   `.editorconfig` (template: [`editorconfig.txt`](../templates/kod/editorconfig.txt)):

   ```ini
   root = true

   [*]
   charset = utf-8
   end_of_line = lf
   insert_final_newline = true
   trim_trailing_whitespace = true
   indent_style = space
   indent_size = 4

   [*.md]
   trim_trailing_whitespace = false

   [*.{yml,yaml}]
   indent_size = 2
   ```

   Kemudian normalkan fail yang sudah di-commit (dokumen Hari 1–3) dan semak skrip ujian Composer:

   ```bash
   git add .gitattributes .editorconfig
   git add --renormalize .
   composer config process-timeout 0    # skrip Composer tidak dihentikan selepas 300 s (suite penuh di laptop perlahan)
   git commit -m "SETUP: .gitattributes + .editorconfig (hujung baris LF)"
   composer run-script --list
   ```

   Senarai mesti mengandungi `test`. `composer.json` appstarter sudah ada `"scripts": { "test": "phpunit" }`; jika tiada, tambah blok itu. Kursus ini menjalankan ujian dengan `composer test` (sama dengan `vendor/bin/phpunit`, dan berfungsi dalam Git Bash dan Command Prompt Windows). Argumen PHPUnit diletak selepas `--`: `composer test -- --filter BookingStatusTest`.

   **Buang blok coverage.** Laptop kursus tiada Xdebug/PCOV, dan `phpunit.dist.xml` appstarter meminta laporan coverage dengan `failOnWarning="true"` — tanpa langkah ini `composer test` mencetak *No code coverage driver available* dan keluar dengan kod 1 walaupun semua ujian lulus. Dalam VS Code, buka `phpunit.dist.xml` dan padam seluruh blok `<coverage …> … </coverage>` (biarkan `<source>`, `<testsuites>` dan `<php>`). Semak: `composer test` → `OK (…)`, kod keluar 0 (`echo $?` → `0`).

2. Sahkan:

   ```bash
   php spark --version
   ls app public writable spark docs
   ```

   > Versi 4.7.x dipasang? Tidak mengapa — kursus memerlukan **4.6+**.

   Folder `docs/` (URS, carta alir, ERD, kamus data, wireframe Hari 1–3) kini berada di **akar projek CI4**. Jika anda ikut Lab 1.0 (Hari 1), `docs/` sudah berada di `~/latihan/sistem-tlk-pas/docs` — langkau langkah ini. Jika dokumen pasukan anda disimpan di repo/folder lain (contoh di bawah: `~/latihan/dokumen-pasukan`), salin **kandungannya** ke sini dan commit. Tulis path sebenar anda; jangan taip `<` `>` (dalam Git Bash ia bermaksud redirect):

   ```bash
   mkdir -p docs
   cp -R ~/latihan/dokumen-pasukan/docs/. ./docs/   # "/." = salin isi folder, bukan cipta docs/docs
   # Git Bash: C:\Users\ali\dok → /c/Users/ali/dok
   git add docs && git commit -m "SETUP: pindah dokumen Hari 1–3 ke projek CI4"
   ```

**B. `.env`**

3. Salin template dan sunting:

   ```bash
   cp env .env          # Windows: dalam Git Bash, bukan Notepad
   ```

   Nyahkomen & isi (padam `#` di hadapan):

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

   > Port 8080 sudah digunakan aplikasi lain? Tukar **dua-dua** tempat: `app.baseURL = 'http://localhost:8081/'` dalam `.env` dan `php spark serve --port 8081`. Jika hanya port ditukar, `base_url()`, pautan dan redirect Shield masih menuju `:8080`.

4. Sahkan `.env` diabaikan Git:

   ```bash
   git status --short | grep -c "\.env$"     # mesti 0
   git check-ignore -v .env                 # mesti menunjukkan baris .gitignore
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

   Sunting `app/Models/UserModel.php` — tambah medan profil:

   ```php
   $this->allowedFields = [
       ...$this->allowedFields,
       'full_name',
       'staff_no',
       'department_id',
       'phone',
   ];
   ```

8. `app/Config/Auth.php` — cari `$userProvider` dan `$allowRegistration`, kemudian tukar:

   ```php
   public bool $allowRegistration = false;   // sistem dalaman: tiada daftar sendiri
   public string $userProvider = \App\Models\UserModel::class;
   ```

   Sistem dalaman KKM tidak membenarkan daftar sendiri: `/register` kini dialih keluar dengan mesej ralat. Akaun dicipta oleh `UserSeeder` (langkah 9 Lab 4.3) atau oleh admin:

   ```bash
   php spark shield:user create -n pemohon3 -e pemohon3@latihan.test -g applicant
   ```

   🪟 Kata laluan ditanya secara interaktif. Dalam tetingkap Git Bash berasingan (bukan terminal VS Code), jika prompt tidak muncul: `winpty php spark shield:user create …`.

9. `app/Config/AuthGroups.php` — gantikan `$defaultGroup`, `$groups`, `$permissions`, `$matrix` dengan nilai SPEC §4 (4 group: `applicant`, `reviewer`, `approver`, `admin`; 8 permission: `admin.access`, `tlk.apply`, `tlk.decide`, `pas.apply`, `pas.review`, `pas.approve`, `laporan.view`, `statistik.view`). Tulis sendiri dahulu berdasarkan README §2.3, kemudian semak dengan [`templates/kod/AuthGroups.php.txt`](../templates/kod/AuthGroups.php.txt).

10. `app/Config/Filters.php` — dalam `$globals['before']`, nyahkomen `'csrf'`. (`shield:setup` hanya menukar `Security::$csrfProtection = 'session'`; ia **tidak** menghidupkan filter CSRF.)

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

    > Konvensyen flash kursus: `success` (TLK) dan `message` (Pas, Hari 7–8) = mesej berjaya (hijau); `error` = merah. Partial ini memaparkan kedua-dua kunci berjaya supaya controller Pas berfungsi tanpa ubah suai.
    >
    > Ralat validasi **per medan** tidak diletak di sini. Borang memaparkannya dengan `validation_show_error('medan')` (Hari 5), dibawa oleh `redirect()->back()->withInput()`.

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

    > Tiada internet di makmal? Muat turun `bootstrap.min.css`, `bootstrap.bundle.min.js` dan folder `bootstrap-icons/font` ke `public/assets/` dan tukar `href` kepada `base_url('assets/…')`.

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

15. `app/Controllers/Home.php`:

    ```php
    public function index(): string
    {
        return view('home', ['title' => 'Utama']);
    }
    ```

16. `app/Config/Routes.php` — lindungi halaman utama. Tukar baris `/` sahaja; `php spark shield:setup` sudah menambah `service('auth')->routes($routes);` — jangan tambah kali kedua (route pendua):

    ```php
    $routes->get('/', 'Home::index', ['filter' => 'session', 'as' => 'home']);

    service('auth')->routes($routes);
    ```

### ✅ Checkpoint
- `php spark routes | grep -E "login|logout"` → route `login` (GET & POST) dan `logout` wujud.
- `http://localhost:8080/` (belum log masuk) → **dialih** ke `http://localhost:8080/login` (tiada `index.php` dalam URL).
- `php spark db:table --show` → jadual `users`, `auth_identities`, `auth_groups_users`, `settings`, `migrations` wujud.
- `git status` **tidak** menyenaraikan `.env`.
- `php spark list` — baris pertama berakhir dengan `UTC+08:00` (bukti `app.appTimezone` dibaca).

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
Menukar ERD Hari 3 kepada 10 migration (FK, UNIQUE, INDEX), menulis 5 seeder idempoten, dan log masuk sebagai pengguna sintetik.

### Prasyarat
- Lab 4.2 checkpoint lulus (jadual Shield sudah wujud)
- `docs/erd.md` & `docs/kamus-data.md` dibuka di sebelah (navigator membaca, driver menaip)

### Langkah

**A. Migration — mengikut tertib FK**

1. Jana 10 fail **satu demi satu, mengikut tertib ini** (cap masa menentukan tertib larian):

   ```bash
   php spark make:migration CreateDepartmentsTable
   php spark make:migration AddProfileFieldsToUsers
   php spark make:migration CreateParkingZonesTable
   php spark make:migration CreateParkingSlotsTable
   php spark make:migration CreateVehiclesTable
   php spark make:migration CreateSlotBookingsTable
   php spark make:migration CreatePassApplicationsTable
   php spark make:migration CreatePassDocumentsTable
   php spark make:migration CreateStatusLogsTable
   php spark make:migration CreateReferenceSequencesTable
   ```

2. Tulis `CreateDepartmentsTable` bersama (jurulatih demo langsung):

   ```php
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
   ```

3. Tulis `AddProfileFieldsToUsers` (README §3.3 — `addColumn` + `processIndexes`). `down()`:

   ```php
   public function down(): void
   {
       $this->forge->dropForeignKey('users', 'users_department_id_fk');
       $this->forge->dropKey('users', 'users_staff_no_unique', false);
       $this->forge->dropColumn('users', ['full_name', 'staff_no', 'department_id', 'phone']);
   }
   ```

4. Jalankan dan uji **sebelum** menulis yang lain (kitaran pendek!):

   ```bash
   php spark migrate
   php spark db:table users --metadata
   php spark migrate:rollback
   php spark migrate
   ```

5. Tulis 8 migration selebihnya berdasarkan kamus data anda. Senarai semak setiap fail:
   - [ ] Nama jadual & medan **tepat** SPEC §3
   - [ ] `id` INT UNSIGNED AI + `created_at`/`updated_at` DATETIME NULL
   - [ ] `parking_slots` sahaja ada `deleted_at`; `status_logs` hanya `created_at` (rekod audit tidak dikemas kini)
   - [ ] UNIQUE: `parking_zones.code`, (`zone_id`,`slot_no`), `vehicles.plate_no`, `slot_bookings.ref_no`, `pass_applications.ref_no`, (`prefix`,`year`)
   - [ ] INDEX: `slot_bookings` (`slot_id`,`start_date`,`end_date`) & (`status`); `pass_applications` (`status`); `status_logs` (`module`,`record_id`)
   - [ ] Setiap FK: jenis INT UNSIGNED sama dengan induk; `ON DELETE` dipilih dengan sebab
   - [ ] `down()` memadam apa yang `up()` cipta

   > ⏱️ **Ketinggalan?** Jika belum selesai pada minit ke-60 sesi, ikut pelan kejar jurulatih: salin blok `up()`/`down()` dari [`templates/kod/migration-core-tables.php.txt`](../templates/kod/migration-core-tables.php.txt) ke fail yang dijana `make:migration` (kekalkan nama kelas), kemudian navigator menerangkan satu FK dan satu `ON DELETE` kepada jurulatih.

6. Jalankan semua:

   ```bash
   php spark migrate
   php spark migrate:status
   ```

**B. Seeder**

7. Jana:

   ```bash
   php spark make:seeder DepartmentSeeder
   php spark make:seeder UserSeeder
   php spark make:seeder ParkingSeeder
   php spark make:seeder VehicleSeeder
   php spark make:seeder DatabaseSeeder
   ```

8. `DepartmentSeeder` (corak `INSERT IGNORE` — ulang untuk Parking/Vehicle):

   ```php
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
   ```

9. `UserSeeder` — tulis berdasarkan README §3.4 (5 pengguna, group, `Latihan@2026`, `department_id` dicari ikut `code`, langkau jika e-mel wujud). Semak dengan [`templates/kod/UserSeeder.php.txt`](../templates/kod/UserSeeder.php.txt).

10. `ParkingSeeder` — zon `A` *Blok Utama*, `B` *Blok Klinik*, `C` *Parkir Bertingkat*; 4 slot setiap zon (`A-01`…`C-04`) meliputi kelima-lima kategori `oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`. Dapatkan `zone_id` dengan:

    ```php
    $zoneIds = array_column(
        $this->db->table('parking_zones')->select('id, code')->get()->getResultArray(),
        'id',
        'code',
    );   // ['A' => 1, 'B' => 2, 'C' => 3]
    ```

11. `VehicleSeeder` — plat rekaan sahaja: `pemohon1` → `WXX 1234` & `WXX 5678`; `pemohon2` → `VXX 2468`; `pelulus` → `WXY 1357`; `admin` → `BXX 9090`. Cari pengguna dengan `auth()->getProvider()->findByCredentials(['email' => …])`.

12. `DatabaseSeeder`:

    ```php
    public function run(): void
    {
        $this->call(DepartmentSeeder::class);   // induk dahulu
        $this->call(UserSeeder::class);         // perlukan departments
        $this->call(ParkingSeeder::class);
        $this->call(VehicleSeeder::class);      // perlukan users
    }
    ```

13. Jalankan **dua kali** (ujian idempoten):

    ```bash
    php spark db:seed DatabaseSeeder
    php spark db:seed DatabaseSeeder
    ```

14. `php spark serve` → log masuk `http://localhost:8080/login` sebagai `pelulus@latihan.test` / `Latihan@2026`.

### ✅ Checkpoint
- `php spark migrate:status` → 10 baris namespace `App`, semua ada tarikh *Migrated On*.
- `php spark db:table --show` → **18 jadual** (10 SPEC termasuk `users` + 6 `auth_*` + `settings` + `migrations`).
- Larian `db:seed` kedua **tanpa** ralat `Duplicate entry`.
- `php spark db:table auth_groups_users` → 5 baris (`applicant` ×2, `reviewer`, `approver`, `admin`).
- Halaman utama selepas log masuk: *"Selamat datang, Dr. Devi a/p Sampel. Peranan: approver"*.
- Ujian FK (dalam klien MySQL):

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

## Lab 4.4 — Pembahagian Tugas, Cabang Git & DoD (S4)

### 🎯 Objektif
Menghasilkan pelan kerja pasangan dan menolak commit `SETUP:` yang bersih ke `main`.

### Prasyarat
- Lab 4.3 checkpoint lulus

### Langkah

1. Semak apa yang akan di-commit — **tiada** `.env`, `vendor/`, `writable/session/*`:

   ```bash
   git status --short | head -30
   git status --short | grep -E "\.env$|^.. vendor/" || echo "OK: tiada fail sulit/vendor"
   ```

2. Commit berperingkat (mesej bermakna, prefix `SETUP:`):

   ```bash
   git add composer.json composer.lock spark env public app/Config app/Controllers app/Views builds preload.php phpunit*.dist* tests writable .gitignore LICENSE
   git commit -m "SETUP: projek CI4 + Shield + layout Bootstrap"
   git add app
   git commit -m "SETUP: 10 migration SPEC §3 + 5 seeder sintetik"
   ```

   > `writable` di-commit untuk mengekalkan struktur folder sahaja: subfolder `cache/`, `logs/`, `session/`, `uploads/`, `debugbar/` hanya mengandungi `index.html` (`.gitignore` appstarter mengabaikan fail lain), jadi log dan sesi tidak ikut di-commit. Tanpanya, klon baharu (langkah 6) tiada `writable/` dan gagal.

   > Versi CI 4.6 menamakan fail ujian `phpunit.xml.dist`; 4.7+ `phpunit.dist.xml`. Corak `phpunit*.dist*` menambah yang wujud.

3. Tolak ke remote (jika repo pasangan ada remote GitLab/GitHub dalaman):

   ```bash
   git push -u origin main
   ```

4. Cipta `docs/pelan-kerja.md`:

   ```markdown
   # Pelan Kerja Pasangan — <nama A> & <nama B>

   ## Giliran driver
   | Hari | S1 | S2 | S3 | S4 |
   |------|----|----|----|----|
   | 5 | A | B | A | B |
   | 6 | B | A | B | A |
   | … | | | | |

   ## Cabang
   | Hari | Cabang | Status |
   |------|--------|--------|
   | 5 | feat/tlk-model | ⬜ |
   | 5 | feat/tlk-crud | ⬜ |
   | 5 | feat/tlk-borang-tempahan | ⬜ |
   | 6 | feat/tlk-ketersediaan | ⬜ |
   | 6 | feat/tlk-keputusan | ⬜ |
   | 6 | feat/tlk-ujian | ⬜ |

   ## Definition of Done (salin dari KOLABORASI §2)
   - [ ] …
   ```

5. Cuba aliran branch sekali (latihan 5 minit):

   ```bash
   git switch -c feat/tlk-model
   git commit --allow-empty -m "TLK: mula cabang model"
   git switch main
   git merge --no-ff feat/tlk-model -m "Merge feat/tlk-model"
   git log --oneline --graph -5
   ```

6. Pasangan **kedua** klon repo anda (atau anda klon semula ke folder lain) dan ikut *resepi klon baharu*:

   ```bash
   composer install
   cp env .env          # isi database.default.*
   php spark migrate --all
   php spark db:seed DatabaseSeeder
   php spark serve
   ```

### ✅ Checkpoint
- `git log --oneline` menunjukkan ≥ 2 commit `SETUP:`.
- `git ls-files | grep -c "^\.env$"` → `0`.
- Resepi klon baharu (langkah 6) berjaya sehingga log masuk — **ini bukti migration & seeder anda lengkap**.
- `docs/pelan-kerja.md` wujud dan kedua-dua ahli boleh menyebut 3 item DoD tanpa melihat.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `.env` tersenarai dalam `git status` | `.gitignore` appstarter tertimpa oleh `.gitignore` Hari 1 | Tambah baris `.env` dan `/vendor/` ke `.gitignore` |
| `.env` sudah ter-commit | Tersilap `git add .` | `git rm --cached .env` → commit → **tukar kata laluan DB** (ia sudah bocor dalam sejarah) |
| `composer install` gagal pada klon baharu | `composer.lock` tidak di-commit | Commit `composer.lock` |

### ⭐ Cabaran tambahan
Lindungi `main`: tetapkan protected branch di GitLab/GitHub dalaman supaya perubahan hanya melalui merge request yang disemak rakan pasangan.

---

## Semakan kendiri — akhir hari

```bash
php spark migrate:status    # semua migration App, Shield & Settings bertanda telah dijalankan
git status --short          # tiada output
git log --oneline           # ≥ 2 commit SETUP:
```

- [ ] `php spark serve` → `http://localhost:8080/` mengalih ke halaman log masuk tanpa ralat.
- [ ] `php spark migrate:status` menunjukkan **semua** migration (10 App + Shield + Settings) telah dijalankan.
- [ ] Log masuk sebagai `pelulus@latihan.test` / `Latihan@2026` berjaya; `pemohon1@latihan.test` juga.
- [ ] `git status --short` kosong dan `git ls-files | grep -c "^\.env$"` → `0`.
- [ ] `git log --oneline` menunjukkan ≥ 2 commit `SETUP:`.
- [ ] Klon baharu (Lab 4.4 langkah 6) berjaya sehingga log masuk.
