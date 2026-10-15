# Tutorial Rangka Aplikasi CI4 — Mula Awal (pilihan)

[🛠️ Persediaan](./persediaan.md) · [🧪 Lab Hari 4](../hari-4/lab.md) · [📘 SPEC](../SPEC-KURSUS.md) · [🤝 KOLABORASI](../KOLABORASI.md) · [🧪 Nota 10 · Ujian](../nota/10-ujian-phpunit-ci4.md)

> **Pilihan, bukan wajib.** Hari 1–3 hanya keperluan (URS, carta alir, ERD). Binaan sebenar bermula pada Hari 4 ([Lab 4.2](../hari-4/lab.md) dan [Lab 4.3](../hari-4/lab.md)). Halaman ini memberi anda **permulaan awal**: Bahagian A ialah projek latihan CI4 asas pada Hari 1; Bahagian B–G membina rangka aplikasi sebenar dalam repo pasangan, dengan nama, arahan, kunci `.env`, nama DB dan laluan fail **sama** dengan Lab 4.2/4.3.

**Platform kursus: Windows + Laragon + Git Bash** ([`persediaan.md`](./persediaan.md) §2, §5). Taip semua blok `bash` dalam terminal **Git Bash** VS Code (`echo $SHELL` → `/usr/bin/bash`). Jika arahan berbeza dalam Command Prompt, bentuk `bat` diberi di sebelahnya. Dalam Git Bash, `~` = `C:\Users\<nama>`, dan `C:\Users\<nama>\latihan` ditulis `/c/Users/<nama>/latihan`.

Arahan CI4 dan Shield disahkan dengan CodeIgniter **4.7.5** + Shield **1.4.1** pada 2026-10-15. Kursus memerlukan CI **4.6+** dan PHP **8.2+**.

| Bahagian | Apa | Folder | Bila | Minit |
|----------|-----|--------|------|-------|
| A | CI4 asas: welcome page, `.env`, laluan → controller → view | `~/latihan/ci4-asas` (latihan) | Hari 1, selepas kelas | ±40 |
| B | Projek CI4 dalam repo pasangan + struktur folder | `~/latihan/sistem-tlk-pas` | Sebelum Hari 4 | 20 |
| C | `.env` pangkalan data | `~/latihan/sistem-tlk-pas` | Selepas [`persediaan.md`](./persediaan.md) §4 | 10 |
| D | Pasang Shield | `~/latihan/sistem-tlk-pas` | Selepas C | 20 |
| E | Laluan → controller `Home` → view dengan layout | `~/latihan/sistem-tlk-pas` | Selepas D | 20 |
| F | Migration pertama + seeder (satu jadual) | `~/latihan/sistem-tlk-pas` | Selepas E | 20 |
| G | Ujian asap `composer test` | `~/latihan/sistem-tlk-pas` | Selepas F | 10 |

> **Dua folder, dua tujuan.** `ci4-asas` ialah projek **latihan sahaja** — bukan repo Git, tidak dibawa ke Hari 4, dan boleh dipadam bila-bila masa. Rangka sebenar dibina dalam repo pasangan `sistem-tlk-pas` (Lab 1.0). Kedua-dua folder tidak perlu berada dalam `C:\laragon\www`: kursus menghidangkan aplikasi dengan `php spark serve`, bukan Apache Laragon.

---

## Bahagian A — CI4 asas di laptop (Hari 1)

### 🎯 Matlamat

Menjalankan projek latihan `ci4-asas` di <http://localhost:8080>, menghidupkan Debug Toolbar dengan `.env`, dan membina aliran MVC pertama: laluan `hello` → controller `Hello` → view `hello.php` dengan satu pemboleh ubah `esc()`.

### Langkah

1. **Semak alat.** Laragon sudah dipasang dan dalam `PATH` ([`persediaan.md`](./persediaan.md) §2 langkah 1–6). Dalam Git Bash:

   ```bash
   where php                                       # baris pertama: C:\laragon\bin\php\php-8.x…\php.exe
   php -v | head -1
   php -m | grep -Eic '^(intl|mbstring|mysqli)$'   # patut: 3
   composer -V | head -1
   ```

   Command Prompt: `where php`, `php -v`, `composer -V` sama; `php -m` menyenaraikan sambungan (cari `intl`, `mbstring`, `mysqli`).

   - `where php` menunjuk folder lain dahulu (cth XAMPP lama)? Laragon → *Menu → Tools → Path → Add Laragon to Path*, kemudian tutup dan buka semula VS Code.
   - Versi salah? Laragon → *Menu → PHP → Version* → pilih **8.3.x** (atau 8.2.x).
   - Sambungan tiada? Laragon → *Menu → PHP → Extensions* → tanda `intl` / `mbstring` / `mysqli`.
   - `composer: command not found` dalam Git Bash? Laragon membawa `composer.bat`, yang Git Bash tidak jalankan apabila anda menaip `composer`. Tambah alias sekali ([`persediaan.md`](./persediaan.md) §2 langkah 5). Command Prompt menjalankan `composer.bat` terus.

2. **Cipta projek latihan:**

   ```bash
   mkdir -p ~/latihan
   cd ~/latihan
   composer create-project codeigniter4/appstarter ci4-asas
   cd ci4-asas
   php spark --version
   ```

   Command Prompt:

   ```bat
   mkdir %USERPROFILE%\latihan
   cd /d %USERPROFILE%\latihan
   composer create-project codeigniter4/appstarter ci4-asas
   cd ci4-asas
   php spark --version
   ```

   > 🛡️ `composer create-project` lambat atau `The process exceeded the timeout`? Windows Defender mengimbas setiap fail dalam `vendor/`. Lihat [`persediaan.md`](./persediaan.md) §8 (`composer config --global process-timeout 900`, pengecualian imbasan jika dibenarkan unit ICT).

3. **Jalankan pelayan:**

   ```bash
   php spark serve
   ```

   Buka <http://localhost:8080>. Hentikan dengan Ctrl+C.

   > 🛡️ Kali pertama, **Windows Defender Firewall** mungkin bertanya sama ada `php.exe` dibenarkan pada rangkaian. Tanda **Private networks** sahaja → *Allow access*. Jika anda pilih *Cancel*, `localhost` masih berfungsi; hanya komputer lain tidak dapat sambung.

4. **`.env` untuk pembangunan.** Salin templat:

   ```bash
   cp env .env
   ```

   Command Prompt: `copy env .env`. **Jangan** cipta dengan Notepad (ia boleh menyimpan `.env.txt`); hidupkan *File Explorer → View → Show → File name extensions*.

   Buka `.env` dalam VS Code dan nyahkomen (padam `#`) baris ini:

   ```ini
   CI_ENVIRONMENT = development
   ```

   Jalankan semula `php spark serve` dan muat semula halaman — ikon 🔥 **Debug Toolbar** muncul di penjuru kanan bawah.

5. **Laluan.** `app/Config/Routes.php` — tambah satu baris di bawah laluan `/`:

   ```php
   $routes->get('hello', 'Hello::index');
   ```

6. **Controller.** Cipta `app/Controllers/Hello.php`:

   ```php
   <?php

   namespace App\Controllers;

   class Hello extends BaseController
   {
       public function index(): string
       {
           return view('hello', ['nama' => 'Peserta KKM']);
       }
   }
   ```

7. **View.** Cipta `app/Views/hello.php`. `esc()` menukar `<` `>` kepada teks biasa supaya input pengguna tidak boleh menyuntik HTML/JavaScript (XSS):

   ```php
   <!doctype html>
   <html lang="ms">
   <head>
       <meta charset="utf-8">
       <title>Hello CI4</title>
   </head>
   <body>
       <h1>Hello, <?= esc($nama) ?>!</h1>
       <p>View pertama anda: app/Views/hello.php</p>
   </body>
   </html>
   ```

8. **Cuba.** Dengan `php spark serve` berjalan, buka <http://localhost:8080/hello>.

9. **Uji `esc()` (pilihan).** Dalam `Hello.php`, gantikan baris `return` supaya nama diambil daripada URL (`?nama=`), dengan `'Peserta KKM'` sebagai lalai:

   ```php
   return view('hello', ['nama' => $this->request->getGet('nama') ?? 'Peserta KKM']);
   ```

   Buka <http://localhost:8080/hello?nama=%3Cb%3EAli%3C/b%3E> (iaitu `?nama=<b>Ali</b>`).

10. Dalam Debug Toolbar, buka tab **Routes** (controller yang dipadan) dan **Views** (`hello.php`). Kemudian, dalam terminal kedua:

    ```bash
    php spark routes
    MSYS_NO_PATHCONV=1 php spark filter:check GET /hello
    ```

    > **`MSYS_NO_PATHCONV=1`:** Git Bash menukar argumen yang bermula dengan `/` kepada laluan Windows (`/hello` → `C:/Program Files/Git/hello`). Awalan ini mematikan penukaran untuk satu arahan. Command Prompt tidak perlu: `php spark filter:check GET /hello`.

### Anda patut nampak

```text
CodeIgniter v4.7.5 Command Line Tool - Server Time: 2026-10-15 11:59:57 UTC+00:00
```

- <http://localhost:8080> → *Welcome to CodeIgniter 4.7.5* (4.6.x juga sah) dengan Debug Toolbar selepas langkah 4.
- `/hello` → **Hello, Peserta KKM!**
- Langkah 9: `/hello?nama=<b>Ali</b>` → **Hello, &lt;b&gt;Ali&lt;/b&gt;!** — tag dipapar sebagai teks, **bukan** tebal. Itu bukti `esc()` berfungsi.
- `php spark routes` → baris `GET` `hello` → `\App\Controllers\Hello::index`.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `requires ext-intl * -> it is missing` | `intl` tidak aktif | Laragon → *Menu → PHP → Extensions* → `intl`; buka terminal baharu |
| `Failed to listen on localhost:8080` | Port 8080 sedang digunakan | `php spark serve --port 8081`, buka <http://localhost:8081> |
| `bash: composer: command not found` | Git Bash tidak menjalankan `composer.bat` | Alias dalam `~/.bashrc` ([`persediaan.md`](./persediaan.md) §2 langkah 5), atau guna Command Prompt |
| Halaman lain (bukan CI4) di `:8080` | Aplikasi lain guna port 8080 | Cari PID: `netstat -ano \| findstr :8080`; atau guna port 8081 seperti baris di atas |
| Debug Toolbar tidak muncul | Fail bernama `env` atau `.env.txt`, atau `#` belum dipadam | Nama mesti `.env` (semak di File Explorer dengan sambungan nama fail kelihatan); baris `CI_ENVIRONMENT = development` tanpa `#` |
| `404 - Can't find a route for 'GET: hello'` | Laluan belum disimpan, atau nama fail tidak sama dengan nama kelas | Semak `Routes.php` disimpan dan fail bernama `Hello.php` (kelas `Hello`); `php spark routes` |
| `Invalid file: "hello.php"` | View di folder salah | Mesti `app/Views/hello.php` |
| `filter:check` gagal mencari laluan, atau laluan dipapar sebagai `C:/Program Files/Git/hello` | Git Bash menukar `/hello` | Awalan `MSYS_NO_PATHCONV=1` (langkah 10) |

### Commit

Tiada — `ci4-asas` ialah projek latihan, bukan repo Git. Selepas selesai, anda boleh memadamnya:

```bash
rm -rf ~/latihan/ci4-asas
```

Command Prompt: `rmdir /s /q %USERPROFILE%\latihan\ci4-asas`.

- [ ] `/hello` memaparkan "Hello, Peserta KKM!" melalui `Hello::index` dan `app/Views/hello.php`.
- [ ] Anda boleh menerangkan fail mana yang dibaca untuk laluan, controller dan view `/hello`.

---

## Bahagian B — Projek CI4 dalam repo pasangan & struktur folder

### 🎯 Matlamat

Mencipta projek CI4 sebenar dalam repo pasangan `~/latihan/sistem-tlk-pas` (sama dengan Lab 4.2 langkah 1), membuat commit yang bersih, dan menerangkan fungsi setiap folder utama.

### Prasyarat

Repo `~/latihan/sistem-tlk-pas` (`C:\Users\<nama>\latihan\sistem-tlk-pas`) dari Lab 1.0, dengan `README.md` dan `docs/`. Repo sudah ada Git — **jangan** `git init` lagi.

### Langkah

1. **Cipta projek dalam repo sedia ada.** `composer create-project` memerlukan folder kosong, jadi cipta dalam subfolder sementara dan pindahkan. Jalankan dalam **Git Bash** sahaja — Command Prompt tiada `cp -n`, dan `Copy-Item` PowerShell menulis ganti `README.md` anda:

   ```bash
   cd ~/latihan/sistem-tlk-pas
   composer create-project codeigniter4/appstarter ci4-tmp
   cp -Rn ci4-tmp/. .        # -n: jangan tulis ganti fail sedia ada (cth README.md anda)
   rm -rf ci4-tmp
   php spark --version
   ```

2. **Kebersihan projek.** Cipta `.gitattributes` dan `.editorconfig` di akar projek dalam VS Code (*File → New File*). Kandungannya ada dalam Lab 4.2 langkah 1 (templat: [`gitattributes.txt`](../templates/kod/gitattributes.txt), [`editorconfig.txt`](../templates/kod/editorconfig.txt)). `* text=auto eol=lf` memastikan fail di-commit dengan hujung baris LF walaupun Git Windows anda `core.autocrlf true`. Kemudian:

   ```bash
   git add .gitattributes .editorconfig
   git add --renormalize .
   composer config process-timeout 0    # skrip Composer tidak dihentikan selepas 300 s
   git commit -m "SETUP: .gitattributes + .editorconfig (hujung baris LF)"
   ```

   **Buang blok coverage** (Lab 4.2 langkah 1). Laptop kursus tiada Xdebug/PCOV, dan `phpunit.dist.xml` appstarter meminta laporan coverage dengan `failOnWarning="true"`, jadi `composer test` keluar dengan kod 1 walaupun semua ujian lulus. Dalam VS Code, buka `phpunit.dist.xml` dan padam seluruh blok `<coverage …> … </coverage>` (biarkan `<source>`, `<testsuites>` dan `<php>`). Fail ini di-commit dalam langkah 3.

3. **Semak `.gitignore`, kemudian commit projek.** `.gitignore` appstarter mesti mengabaikan `.env`, `vendor/` dan kandungan `writable/`:

   ```bash
   git check-ignore -v .env vendor/autoload.php writable/logs/ujian.log
   ```

   Ketiga-tiga baris mesti dicetak. Commit projek (senarai fail Lab 4.4 langkah 2, dengan seluruh folder `app`):

   ```bash
   git add composer.json composer.lock spark env public app builds preload.php phpunit*.dist* tests writable .gitignore LICENSE
   git status --short | grep -E "\.env$|^.. vendor/" || echo "OK: tiada fail sulit/vendor"
   git commit -m "SETUP: projek CI4 appstarter"
   ```

4. **Lawatan folder.** Buka folder projek dalam VS Code dan bandingkan dengan peta ini:

   ```text
   sistem-tlk-pas\
   ├── app\
   │   ├── Config\          tetapan: Routes.php, Database.php, Filters.php, Auth.php (selepas Shield)
   │   ├── Controllers\     Home.php, BaseController.php
   │   ├── Models\          model (UserModel.php selepas Shield)
   │   ├── Views\           templat HTML (welcome_message.php, layouts\, partials\)
   │   └── Database\
   │       ├── Migrations\  perubahan skema, satu fail = satu langkah
   │       └── Seeds\       data sintetik
   ├── public\              akar web: index.php (front controller), CSS/JS
   ├── writable\            cache, logs, session, uploads (CI4 menulis di sini)
   ├── tests\               ujian PHPUnit (contoh appstarter)
   ├── vendor\              pakej Composer (JANGAN sunting, JANGAN commit)
   ├── docs\                dokumen Hari 1–3 anda
   ├── env                  templat; .env = salinan setempat anda (tidak di-commit)
   └── spark                alat baris arahan CI4
   ```

   `public/index.php` ialah langkah 1 kitaran request yang anda jejak dalam Lab 4.1. Senaraikan arahan yang tersedia:

   ```bash
   php spark list
   ```

### Anda patut nampak

- `git check-ignore` mencetak tiga baris `.gitignore:…`.
- `git log --oneline` → commit `SETUP: mula repo dokumen` (Lab 1.0) + dua commit `SETUP:` baharu.
- `php spark list` → kumpulan arahan `Database` (`migrate`, `db:seed`, `db:table`) dan `Generators` (`make:migration`, `make:seeder`).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Project directory "…" is not empty` | `create-project` terus ke folder repo | Guna subfolder `ci4-tmp` seperti langkah 1 |
| `README.md` anda hilang / diganti README CodeIgniter | Disalin dengan PowerShell / Explorer, bukan `cp -Rn` | `git checkout -- README.md` |
| `git check-ignore` tidak mencetak `.env` | `.gitignore` tiada / tertimpa | Pastikan `.gitignore` appstarter disalin (`ls -a`); tambah baris `.env` dan `/vendor/` |
| `Could not open input file: spark` | Terminal bukan di akar projek | `cd ~/latihan/sistem-tlk-pas` |
| `warning: in the working copy of '…', LF will be replaced by CRLF` | `core.autocrlf true` Git Windows | Amaran sahaja; `.gitattributes` (langkah 2) menetapkan LF dalam repo |

### Commit

```text
SETUP: .gitattributes + .editorconfig (hujung baris LF)
SETUP: projek CI4 appstarter
```

---

## Bahagian C — `.env` pangkalan data

### 🎯 Matlamat

Menyambung projek ke pangkalan data `kkm_latihan` dengan pengguna `kkm_dev`, seperti Lab 4.2 langkah 3–5.

### Prasyarat

- Pangkalan data `kkm_latihan` & `kkm_latihan_test` + pengguna `kkm_dev` sudah dicipta ([`persediaan.md`](./persediaan.md) §4).
- MySQL Laragon berjalan: **Start All** (Apache dinyahtanda, §2 langkah 3) atau *Menu → MySQL → Start MySQL*.

### Langkah

1. Salin templat (Command Prompt: `copy env .env`), kemudian buka `.env` dalam VS Code:

   ```bash
   cp env .env
   ```

2. Nyahkomen & isi (nilai ini juga dipapar pada halaman kohort anda):

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

   > Port 8080 sibuk? Tukar **dua-dua** tempat: `app.baseURL = 'http://localhost:8081/'` dan `php spark serve --port 8081`.

3. Sahkan `.env` diabaikan Git dan sambungan berfungsi:

   ```bash
   git status --short | grep -c "\.env$"     # mesti 0
   php spark db:table --show
   php spark list | head -2
   ```

### Anda patut nampak

```text
| localhost | kkm_latihan | kkm_dev  | MySQLi   |          | 3306 |
Database has no tables!
```

- `php spark list` — baris pertama berakhir dengan `UTC+08:00` (bukti `app.appTimezone` dibaca).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Unable to connect to the database` | MySQL Laragon tidak berjalan / `.env` salah | Laragon → **Start All**; cuba `hostname = 127.0.0.1` |
| `SQLSTATE[HY000] [1045] Access denied` | Pengguna/kata laluan salah | Ulang `CREATE USER` di [`persediaan.md`](./persediaan.md) §4 (butang **Database** Laragon → HeidiSQL) |
| MySQL Laragon tidak mahu mula / port 3306 sibuk | Pelayan MySQL lain (XAMPP lama, servis `MySQL80`) | [`persediaan.md`](./persediaan.md) §8: `netstat -ano \| findstr :3306` |
| `db:table` menunjukkan `ci4` / `root` | Baris masih berkomen `#` | Padam `#` di hadapan setiap baris `database.default.*` |

### Commit

Tiada — `.env` **tidak pernah** di-commit.

---

## Bahagian D — Pasang Shield

### 🎯 Matlamat

Memasang CodeIgniter Shield, menjana `UserModel` sendiri, mematikan daftar sendiri dan menghidupkan CSRF (Lab 4.2 langkah 6–8, 10–11).

### Langkah

1. Hentikan `serve` (Ctrl+C), kemudian dalam terminal VS Code:

   ```bash
   composer require codeigniter4/shield
   php spark shield:setup
   ```

   | Soalan | Jawab |
   |--------|-------|
   | `Config\Email::$fromEmail is not set. Do you set now?` | `y` → `noreply@latihan.test` |
   | `Config\Email::$fromName is not set. Do you set now?` | `y` → `Sistem TLK` |
   | ``Run `spark migrate --all` now?`` | `y` |

   `shield:setup` menyalin `Auth.php`, `AuthGroups.php`, `AuthToken.php` ke `app/Config/`, menambah `service('auth')->routes($routes);` ke `Routes.php`, menetapkan CSRF kepada `session` dan menjalankan migration Shield.

   > 🪟 Dalam tetingkap Git Bash berasingan (mintty, bukan terminal VS Code), soalan interaktif boleh tergantung. Tambah `winpty` di hadapan: `winpty php spark shield:setup`.

2. Jana model pengguna sendiri dan tambah medan profil dalam `app/Models/UserModel.php`:

   ```bash
   php spark shield:model UserModel
   ```

   ```php
   $this->allowedFields = [
       ...$this->allowedFields,
       'full_name',
       'staff_no',
       'department_id',
       'phone',
   ];
   ```

   Lajur ini dicipta oleh migration `AddProfileFieldsToUsers` dalam Lab 4.3.

3. `app/Config/Auth.php` — cari dan tukar:

   ```php
   public bool $allowRegistration = false;   // sistem dalaman: tiada daftar sendiri
   public string $userProvider = \App\Models\UserModel::class;
   ```

4. `app/Config/Filters.php` — dalam `$globals['before']`, nyahkomen `'csrf'`.

5. `app/Controllers/BaseController.php` — dalam `initController()`, letak helper **sebelum** `parent::initController(...)`:

   ```php
   $this->helpers = ['form', 'url'];   // MESTI sebelum parent::initController()
   ```

6. `app/Config/AuthGroups.php` (4 group & 8 permission SPEC §4) ialah Lab 4.2 langkah 9 — ia memerlukan README Hari 4 §2.3, jadi buat pada Hari 4.

### Anda patut nampak

```bash
php spark routes | grep -E "login|logout"
php spark db:table --show
```

- Laluan `login` (GET & POST) dan `logout` wujud.
- Jadual `users`, `auth_identities`, `auth_groups_users`, `settings`, `migrations` wujud.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `shield:setup` → `TypeError … InputOutput::input(): Return value must be of type string, false returned` | Dijalankan tanpa terminal interaktif | Jalankan dalam terminal VS Code; tetingkap Git Bash berasingan: `winpty php spark shield:setup` |
| `composer require` lambat / timeout | Windows Defender mengimbas `vendor/` | [`persediaan.md`](./persediaan.md) §8 |
| `Class "App\Models\UserModel" not found` | Langkah 2 belum dibuat | `php spark shield:model UserModel` |
| `Call to undefined function form_dropdown()` (Hari 5) | Helper diletak selepas `parent::initController()` | Pindah baris `$this->helpers` ke atas |

### Commit

```bash
git add composer.json composer.lock app
git commit -m "SETUP: pasang Shield + UserModel + Auth/Filters"
```

---

## Bahagian E — Laluan → controller `Home` → view dengan layout

### 🎯 Matlamat

Membina aliran **laluan → controller → view** dengan satu layout Bootstrap 5.3 (`$this->extend` / `$this->section`), dan melindungi `/` dengan filter `session` (Lab 4.2 langkah 12–16).

### Langkah

1. **Partial flash** — cipta `app/Views/partials/flash.php` dengan kod Lab 4.2 langkah 12 (mesej `success`/`message` hijau, `error` merah).

2. **Layout** — cipta `app/Views/layouts/main.php` dengan kod Lab 4.2 langkah 13. Bahagian penting ialah tempat kandungan halaman dimasukkan:

   ```php
   <main class="container py-4">
       <?php if (! empty($title)): ?><h1 class="h3 mb-3"><?= esc($title) ?></h1><?php endif ?>
       <?= $this->include('partials/flash') ?>
       <?= $this->renderSection('content') ?>
   </main>
   ```

3. **View** — `app/Views/home.php` mewarisi layout dan mengisi seksyen `content`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <div class="p-4 bg-white rounded-3 border">
       <p class="lead mb-1">Selamat datang, <?= esc(auth()->user()->full_name ?? auth()->user()->username) ?>.</p>
       <p class="text-muted mb-0">Peranan: <?= esc(implode(', ', auth()->user()->getGroups())) ?></p>
   </div>
   <?= $this->endSection() ?>
   ```

4. **Controller** — `app/Controllers/Home.php`, gantikan `view('welcome_message')`:

   ```php
   public function index(): string
   {
       return view('home', ['title' => 'Utama']);
   }
   ```

5. **Laluan** — `app/Config/Routes.php`. Baris `service('auth')->routes($routes);` sudah ditambah oleh `shield:setup`; ubah baris `/` sahaja:

   ```php
   $routes->get('/', 'Home::index', ['filter' => 'session', 'as' => 'home']);

   service('auth')->routes($routes);
   ```

6. Sahkan filter pada `/` (Command Prompt: tanpa `MSYS_NO_PATHCONV=1`):

   ```bash
   MSYS_NO_PATHCONV=1 php spark filter:check GET /
   ```

### Anda patut nampak

- `filter:check` → lajur *Before Filters* untuk `/` mengandungi `session`.
- `php spark serve` → buka <http://localhost:8080/> (belum log masuk) → **dialih** ke `http://localhost:8080/login` (tiada `index.php` dalam URL), halaman log masuk Shield.

> Belum ada pengguna untuk log masuk — `UserSeeder` dibina dalam Lab 4.3. **Jangan** cipta pengguna ujian sendiri dalam `kkm_latihan`: checkpoint Lab 4.3 mengira tepat 5 baris dalam `auth_groups_users`.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| URL mengandungi `/index.php/login` | `app.indexPage` belum dikosongkan | `.env`: `app.indexPage = ''` |
| `Invalid file: "layouts/main.php"` | Fail di folder salah | Mesti `app/Views/layouts/main.php` |
| Halaman putih / CSS tiada | Tiada internet ke CDN | Salinan tempatan dalam `public/assets/` (Lab 4.2 langkah 13) |
| `/` masih memaparkan *Welcome to CodeIgniter* | `Home::index` masih `view('welcome_message')`, atau laluan tanpa `'filter' => 'session'` | Semak langkah 4 dan 5 |
| `filter:check` gagal mencari laluan, atau laluan dipapar sebagai `C:/Program Files/Git/` | Git Bash menukar `/` | Awalan `MSYS_NO_PATHCONV=1` (langkah 6) |

### Commit

```bash
git add app/Views app/Controllers app/Config/Routes.php
git commit -m "SETUP: layout Bootstrap + halaman utama dilindungi"
```

---

## Bahagian F — Migration pertama + seeder (satu jadual)

### 🎯 Matlamat

Menulis **satu** migration (`departments`) dan seeder idempoten sebagai corak. Sembilan migration lain kekal untuk Lab 4.3.

### Langkah

1. Jana fail. `CreateDepartmentsTable` mesti yang **pertama** — cap masa nama fail menentukan tertib larian, dan `users.department_id` (Lab 4.3) merujuk jadual ini:

   ```bash
   php spark make:migration CreateDepartmentsTable
   php spark make:seeder DepartmentSeeder
   ```

2. Isi `up()`/`down()` dalam `app/Database/Migrations/*_CreateDepartmentsTable.php` (`*` = cap masa) dengan kod Lab 4.3 langkah 2 (`id`, `code` UNIQUE, `name`, `created_at`, `updated_at`; `dropTable('departments', true)` dalam `down()`).

3. Kitaran pendek — jalankan, semak, undur, jalankan semula:

   ```bash
   php spark migrate
   php spark db:table departments --metadata
   php spark migrate:rollback
   php spark migrate
   ```

4. Isi `app/Database/Seeds/DepartmentSeeder.php` dengan kod Lab 4.3 langkah 8 (4 bahagian `BTM`, `BKW`, `BSM`, `BPA`; `->ignore(true)->insertBatch()`). Jalankan **dua kali**:

   ```bash
   php spark db:seed DepartmentSeeder
   php spark db:seed DepartmentSeeder
   php spark db:table departments
   ```

   Semak juga dalam HeidiSQL (butang **Database** Laragon) → `kkm_latihan` → `departments`.

### Anda patut nampak

```text
Running: (App) 2026-10-15-040102_App\Database\Migrations\CreateDepartmentsTable
Seeded: App\Database\Seeds\DepartmentSeeder
Seeded: App\Database\Seeds\DepartmentSeeder
```

- `php spark migrate:status` → satu baris namespace `App` (`CreateDepartmentsTable`) dengan tarikh *Migrated On*.
- `departments` → **4** baris selepas dua larian, tanpa `Duplicate entry`.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Nothing to migrate` selepas mengubah fail | Fail sudah direkod dalam jadual `migrations` | `php spark migrate:rollback` → `php spark migrate` |
| `Duplicate entry 'BTM' for key 'code'` pada seed kedua | `insertBatch()` tanpa `ignore(true)` | Guna `->ignore(true)->insertBatch()` |
| `Table 'departments' already exists` semasa `migrate` | `make:migration CreateDepartmentsTable` dijalankan dua kali | Padam fail pendua (cap masa lebih baharu) dalam `app/Database/Migrations/` |

### Commit

```bash
git add app/Database
git commit -m "SETUP: migration departments + DepartmentSeeder"
```

---

## Bahagian G — Ujian asap `composer test`

### 🎯 Matlamat

Menjalankan ujian contoh appstarter pada pangkalan data **ujian** MySQL, bukan DB pembangunan.

### Langkah

1. Tambah kumpulan `tests` ke `.env` (sama dengan README Hari 6 §3.2). `DatabaseTestTrait` memadam semula jadual — **jangan** halakan ke `kkm_latihan`:

   ```ini
   database.tests.hostname = localhost
   database.tests.database = kkm_latihan_test
   database.tests.username = kkm_dev
   database.tests.password = Latihan@2026
   database.tests.DBDriver = MySQLi
   database.tests.DBPrefix =
   database.tests.port = 3306
   ```

   Tanpa blok ini, kumpulan `tests` appstarter guna SQLite, dan Laragon tidak menghidupkan sambungan `sqlite3`.

2. Jalankan:

   ```bash
   composer test
   echo $?                              # mesti 0
   ```

### Anda patut nampak

```text
OK (5 tests, 7 assertions)
```

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `No code coverage driver available` + `Script phpunit … returned with error code 1` | Blok `<coverage>` masih dalam `phpunit.dist.xml` (`failOnWarning="true"`, tiada Xdebug/PCOV) | Padam blok `<coverage …> … </coverage>` (Bahagian B langkah 2) |
| `The required PHP extension "sqlite3" is not loaded` | Kumpulan `tests` masih SQLite lalai appstarter | Langkah 1 belum dibuat |
| `Access denied for user 'kkm_dev'@'localhost' to database 'kkm_latihan_test'` | `GRANT` untuk DB ujian tiada | Ulang `GRANT … kkm_latihan_test.*` di [`persediaan.md`](./persediaan.md) §4 |
| `The process … exceeded the timeout of 300 seconds` | `process-timeout` Composer lalai | `composer config process-timeout 0` (Bahagian B langkah 2) |

### Commit

Tiada — perubahan hanya dalam `.env`. Sahkan `git status --short` kosong.

---

## Semakan kendiri

- [ ] <http://localhost:8080/> mengalih ke `/login` tanpa `index.php`.
- [ ] `php spark migrate:status` → Shield, Settings dan `CreateDepartmentsTable` semua telah dijalankan.
- [ ] `composer test` → `OK`, `echo $?` → `0`.
- [ ] `git log --oneline` → commit `SETUP:` bagi Bahagian B, D, E dan F; `git ls-files | grep -c "^\.env$"` → `0`.

---

## Pada Hari 4

[Lab 4.2](../hari-4/lab.md) dan [Lab 4.3](../hari-4/lab.md) kekal **sumber kebenaran**. Jika anda sudah buat tutorial ini:

- **Baca imbas** Lab 4.2/4.3 dan sahkan setiap ✅ Checkpoint pada projek `sistem-tlk-pas` anda. Mana-mana yang gagal → ikut langkah lab.
- **Langkau** yang sudah siap: `composer create-project` (Lab 4.2 langkah 1), `shield:setup`, `make:migration CreateDepartmentsTable` dan `make:seeder DepartmentSeeder`. Menjalankannya semula mencipta fail pendua.
- **Masih perlu** pada Hari 4: `AuthGroups.php` (Lab 4.2 langkah 9), 9 migration lain bermula dengan `AddProfileFieldsToUsers`, dan 4 seeder lain (Lab 4.3).
- Lab 4.4 langkah 2 akan berkata `nothing to commit` untuk fail yang sudah anda commit — itu normal; checkpoint ≥ 2 commit `SETUP:` sudah dipenuhi.
- `ci4-asas` (Bahagian A) tidak digunakan pada Hari 4 — padam jika belum.
- Hari 4 menetapkan `.gitattributes`, `.env` dan Shield bersama — anda boleh membantu pasangan anda.

---

## Rujukan rasmi

Semua disemak 2026-10-15:

- Keperluan pelayan (PHP 8.2+, `intl`, `mbstring`; dokumentasi 4.7.5): <https://codeigniter.com/user_guide/intro/requirements.html>
- Pasang dengan Composer (`composer create-project codeigniter4/appstarter`): <https://codeigniter.com/user_guide/installation/installing_composer.html>
- Menjalankan aplikasi (`php spark serve`, port 8080, `CI_ENVIRONMENT`): <https://codeigniter.com/user_guide/installation/running.html>
- Pasang Shield (`composer require codeigniter4/shield`, `php spark shield:setup`): <https://shield.codeigniter.com/latest/getting_started/install/>
- Migration (`php spark make:migration`, `migrate`, `migrate:rollback`, `migrate:status`): <https://codeigniter.com/user_guide/dbmgmt/migration.html>
