# Persediaan Persekitaran — sebelum Hari 1 & Hari 4

> **Dua tarikh akhir:**
> - **Sebelum Hari 1:** Git, VS Code (+ sambungan **Markdown Preview Mermaid Support**), pelayar moden; Windows: Git Bash sebagai terminal lalai VS Code (§5). Lab Hari 1 menggunakan Git dan pratonton Mermaid.
> - **Sebelum Hari 4** (Development Kickoff): stack PHP — PHP 8.2+, sambungan PHP, Composer, MySQL/MariaDB, Laragon/Herd dan ujian asap CI4 (§6). Hari 1–3 tidak menulis kod, jadi gunakan masa itu untuk membetulkan persekitaran — jangan tunggu pagi Hari 4.
> Kanun stack: [`SPEC-KURSUS.md`](../SPEC-KURSUS.md) §1.

## Kenapa perlu disediakan awal?

Pengalaman kursus lepas: **30–60 minit pertama Hari 4 hilang** kerana sambungan PHP tidak aktif, port MySQL bertembung, atau Composer tersekat di belakang proksi. Setiap minit itu diambil daripada masa membina migration. Senarai semak ini memastikan anda tiba dengan persekitaran yang **disahkan**, bukan "rasanya dah install".

---

## 1. Senarai semak ringkas

| # | Perkara | Versi minimum | Arahan semak | Siap sebelum | ✅ |
|---|---------|---------------|--------------|--------------|----|
| 1 | PHP (CLI) | **8.2** | `php -v` | Hari 4 | [ ] |
| 2 | Sambungan PHP | `intl`, `mbstring`, `mysqlnd`, `mysqli`, `gd`, `zip`, `curl`, `xml` (+ `dom`, `fileinfo`, `json`) | `php -m` | Hari 4 | [ ] |
| 3 | Composer | **2.x** | `composer -V` | Hari 4 | [ ] |
| 4 | MySQL / MariaDB | **MySQL 8.0** / **MariaDB 10.6** | `mysql --version` | Hari 4 | [ ] |
| 5 | Git | 2.30+ | `git --version` | **Hari 1** | [ ] |
| 6 | VS Code + sambungan (termasuk Mermaid) | terkini | lihat §5 | **Hari 1** (Intelephense: Hari 4) | [ ] |
| 7 | Pelayar moden | Chrome/Edge/Firefox terkini | — | **Hari 1** | [ ] |
| 8 | Windows: **Laragon** + **Git Bash** sebagai terminal lalai VS Code · macOS (opsyenal): Herd | Laragon 8 | §2, §5 | Git Bash: **Hari 1** · Laragon/Herd: Hari 4 | [ ] |
| 9 | Ujian asap: projek CI4 kosong berjalan | CI **4.6+** | §6 | Hari 4 | [ ] |
| 10 | *Pilihan* — [trek GitHub](./trek-github.md): akaun GitHub + kunci SSH | — | `ssh -T git@github.com` | Hari 4 | — |
| 11 | *Pilihan* — [trek Jira](./trek-jira.md): akaun Jira Cloud (e-mel) | — | log masuk `*.atlassian.net` | Hari 4 | — |

### Kenapa setiap sambungan PHP diperlukan?

| Sambungan | Digunakan oleh | Gejala jika tiada |
|-----------|---------------|-------------------|
| `intl` | Teras CI4 (`Time`, `number_to_currency`, lokaliti) | `composer create-project` gagal: *requires ext-intl* |
| `mbstring` | Teras CI4, Dompdf, PhpSpreadsheet (teks UTF-8 BM) | Ralat fatal `mb_strlen()` tidak wujud |
| `mysqlnd` / `mysqli` | Pemacu DB `MySQLi` CI4 | `Unable to connect to the database` / `Call to undefined function mysqli_init()` |
| `gd` | Imej dalam PDF (Dompdf), PhpSpreadsheet | Logo tidak keluar dalam PDF; ralat semasa eksport Excel |
| `zip` | PhpSpreadsheet (fail `.xlsx` = arkib ZIP), Composer | `composer require phpoffice/phpspreadsheet` gagal |
| `curl` | Composer, permintaan HTTP keluar | Composer lambat/gagal muat turun pakej |
| `xml` (`dom`, `xmlwriter`, `simplexml`) | PhpSpreadsheet, Dompdf, PHPUnit | Eksport Excel/PDF gagal; laporan liputan PHPUnit gagal |
| `fileinfo` | `UploadedFile::getMimeType()` (Hari 7), PhpSpreadsheet | Semakan jenis fail muat naik tidak boleh dipercayai |

---

## 2. PHP 8.2+

### Pasang

| OS | Cara disyorkan |
|----|----------------|
| Windows | **Laragon Full** (PHP + MySQL 8.4 + Apache/Nginx + Composer) — ikut *Windows (Laragon) — langkah demi langkah* di bawah. XAMPP **tidak disokong** untuk kursus ini: ia membawa MariaDB 10.4, lebih lama daripada minimum 10.6. |
| macOS | **Laravel Herd** (PHP sahaja, ringan) atau `brew install php@8.3` |
| Linux (Ubuntu) | `sudo apt install php8.3-cli php8.3-intl php8.3-mbstring php8.3-mysql php8.3-gd php8.3-zip php8.3-curl php8.3-xml` |

> Herd dan Laragon membawa PHP sendiri. Pastikan `php` dalam terminal ialah **PHP yang sama** yang anda jangka: `which php` (macOS/Linux/Git Bash) atau `where php` (Command Prompt).

### Windows (Laragon) — langkah demi langkah

> 🪟 **Windows:** semua blok `bash` dalam kursus ini dijalankan dalam **Git Bash**, bukan PowerShell. Pasang Git for Windows dan jadikan Git Bash terminal lalai VS Code (§5) **sebelum** langkah 5 di bawah.

1. **Muat turun Laragon Full** dari <https://laragon.org/download>. Guna **Laragon 8.x terkini** (semakan Okt 2026: 8.7.0), satu pemasang `laragon-wamp.exe` (±229 MB) yang membawa PHP 8.1–8.5, MySQL 8.4/9.x, Apache, Nginx dan Composer. Pasang ke folder lalai `C:\laragon`.
2. **Lesen.** Sejak versi 7, Laragon bukan lagi perisian percuma sepenuhnya. Penggunaan tanpa lesen dibenarkan untuk tujuan bukan komersial; tetingkap peringatan lesen dipaparkan setiap kali Laragon dimulakan — tutup sahaja. Untuk laptop jabatan, semak dengan unit ICT sama ada lesen diperlukan.
3. **Mulakan MySQL sahaja.** Kursus ini menghidangkan aplikasi dengan `php spark serve`, jadi Apache (port 80/443) tidak diperlukan. Laragon → *Menu → Preferences → Services & Ports* → nyahtanda **Apache**; selepas itu **Start All** hanya memulakan MySQL (tetapan diingati). Alternatif: *Menu → MySQL → Start MySQL*. Matikan juga *Menu → Preferences → Auto virtual hosts* — ia menulis semula fail `hosts` Windows dan sering meminta kebenaran pentadbir. Jika Windows Defender bertanya, benarkan akses rangkaian *Private*.
4. **Pilih PHP 8.2+.** *Menu → PHP → Version* → pilih **8.3.x** (atau 8.2.x). PHP 8.4/8.5 juga berfungsi, tetapi kursus diuji dengan 8.3.
5. **Letak PHP, Composer & MySQL dalam PATH.** *Menu → Tools → Path → Add Laragon to Path*. **Tutup VS Code sepenuhnya** dan buka semula (terminal lama masih memegang `PATH` lama). Dalam Git Bash:

   ```bash
   which php composer mysql
   php -v | head -1
   ```

   Ketiga-tiga arahan mesti menunjuk ke `/c/laragon/bin/...`. Jika `mysql` tiada: *Menu → Tools → Path → Manage Path* → tambah folder `C:\laragon\bin\mysql\mysql-8.4.x-winx64\bin` (ikut nama folder sebenar), kemudian buka semula VS Code.

   Jika `which composer` tidak mencetak apa-apa: Laragon membawa `composer.bat` + `composer.phar`, dan Git Bash tidak menjalankan `composer.bat` apabila anda menaip `composer`. Tambah alias sekali sahaja (tukar laluan jika Laragon dipasang di folder lain):

   ```bash
   echo 'alias composer="php /c/laragon/bin/composer/composer.phar"' >> ~/.bashrc && source ~/.bashrc
   composer --version
   ```
6. **Hidupkan sambungan & had muat naik.** *Menu → PHP → php.ini* membuka fail yang betul (sama untuk CLI dan web). Pastikan baris ini wujud **tanpa** `;` di hadapan, dan tetapkan had muat naik:

   ```ini
   extension=intl
   extension=zip
   extension=gd
   extension=fileinfo
   extension=mysqli
   upload_max_filesize = 8M
   post_max_size = 16M
   memory_limit = 256M
   date.timezone = Asia/Kuala_Lumpur
   ```

   (Sambungan juga boleh ditanda melalui *Menu → PHP → Extensions*.) Simpan → buka terminal baharu (PHP CLI membaca `php.ini` setiap kali dijalankan; Laragon tidak perlu dimulakan semula; hentikan & jalankan semula `php spark serve` yang sedang berjalan). Sahkan dengan `php --ini` (fail di bawah `C:\laragon\bin\php\...`) dan semakan 10 sambungan di bawah.
7. **MySQL.** Laragon mencipta pengguna `root` **tanpa kata laluan**: log masuk dengan `mysql -u root`, kemudian jalankan SQL §4. Klien GUI: butang **Database** Laragon (HeidiSQL, tidak perlu Apache). phpMyAdmin memerlukan Apache (**Start All**).

### Sahkan

```bash
php -v
```

Output dijangka (nombor tampalan boleh berbeza):

```text
PHP 8.3.12 (cli) (built: ...) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.12, Copyright (c) Zend Technologies
```

```bash
# macOS / Linux / Windows Git Bash
php -m | grep -Ei '^(intl|mbstring|mysqlnd|mysqli|gd|zip|curl|xml|dom|fileinfo)$'
```

Jika bukan Git Bash (PowerShell):

```powershell
php -m | Select-String -Pattern '^(intl|mbstring|mysqlnd|mysqli|gd|zip|curl|xml|dom|fileinfo)$'
```

Output dijangka — **10 baris** (susunan boleh berbeza):

```text
curl
dom
fileinfo
gd
intl
mbstring
mysqli
mysqlnd
xml
zip
```

Kurang daripada 10 baris? Lihat §8 *Penyelesaian masalah*.

### Tetapan `php.ini` yang disyorkan (latihan)

Cari fail: `php --ini` → baris *Loaded Configuration File*.

```ini
; Muat naik dokumen Pas (Hari 7): 2 MB setiap fail × 3 fail (BR-PAS-02)
upload_max_filesize = 8M
post_max_size = 16M
memory_limit = 256M          ; PhpSpreadsheet & Dompdf (Hari 9)
max_execution_time = 60
date.timezone = Asia/Kuala_Lumpur
```

> Kenapa `upload_max_filesize` lebih besar daripada 2 MB? Supaya **aplikasi** (validasi `max_size`) yang menolak fail 3 MB dengan mesej BM yang jelas — bukan PHP yang membuang fail secara senyap sebelum sampai ke controller.

---

## 3. Composer 2

Pasang dari <https://getcomposer.org/download/> (Laragon & Herd sudah menyertakannya).

```bash
composer -V
```

```text
Composer version 2.8.x 2025-xx-xx xx:xx:xx
PHP version 8.3.12 (/path/to/php)
```

> Pastikan baris *PHP version* menunjukkan **8.2+** — Composer mungkin menggunakan PHP lain daripada terminal anda.

```bash
composer diagnose      # semua baris patut "OK" (amaran proksi boleh diabaikan jika tiada proksi)
```

**Di belakang proksi pejabat?** Tetapkan pemboleh ubah persekitaran sebelum `composer`:

```bash
export HTTPS_PROXY=http://proksi.contoh.test:8080   # macOS/Linux/Git Bash
$env:HTTPS_PROXY="http://proksi.contoh.test:8080"   # Windows PowerShell
```

**Rangkaian pejabat dengan SSL inspection?** Gejala: `curl error 60` / `SSL certificate problem: unable to get local issuer certificate` pada `composer` atau `git clone`. Firewall pejabat menandatangani semula trafik HTTPS dengan sijil CA dalaman, yang PHP dan Git tidak kenal.

1. Minta **sijil CA akar** daripada unit ICT (fail `.pem` atau `.crt`). Jika tiada: buka <https://packagist.org> dalam Edge/Chrome → ikon maklumat tapak di kiri URL (ikon *tune*/gelangsar; dahulu mangga) → *Connection is secure → Certificate is valid* → tab *Details* → pilih sijil **paling atas** dalam rantaian → *Export* sebagai *Base64-encoded ASCII* (dialog Windows: *Copy to File → Base-64 encoded X.509 (.CER)*). Simpan sebagai `C:\certs\ca-pejabat.pem`.
2. Bina **himpunan gabungan**: CA awam (senarai Mozilla dari curl) + CA pejabat. Jika fail hanya mengandungi CA pejabat, Composer dan PHP **gagal** di luar rangkaian pejabat (rumah, hotspot).

   ```bash
   mkdir -p /c/certs && cd /c/certs
   curl --cacert ca-pejabat.pem -o cacert.pem https://curl.se/ca/cacert.pem   # atau muat turun melalui pelayar
   cat cacert.pem ca-pejabat.pem > cacert-pejabat.pem
   ```

3. Composer:

   ```bash
   composer config --global cafile "C:/certs/cacert-pejabat.pem"
   composer diagnose
   ```

4. PHP (untuk `curl`/`file_get_contents` dalam aplikasi): dalam `php.ini` (`php --ini`), tetapkan

   ```ini
   openssl.cafile = "C:/certs/cacert-pejabat.pem"
   curl.cainfo = "C:/certs/cacert-pejabat.pem"
   ```

5. Git (Windows): `git config --global http.sslBackend schannel` — Git guna stor sijil Windows, yang biasanya sudah mempunyai CA pejabat.

**Undur** (laptop tidak lagi di rangkaian pejabat): `composer config --global --unset cafile` dan buang dua baris `openssl.cafile`/`curl.cainfo` daripada `php.ini`. Tetapan `schannel` Git boleh dikekalkan.

**Jangan** matikan `secure-http` atau `http.sslVerify` — itu membuka laluan serangan *man-in-the-middle*.

---

## 4. MySQL 8 / MariaDB 10.6+

```bash
mysql --version
```

```text
mysql  Ver 8.4.3 for Win64 on x86_64 (MySQL Community Server - GPL)   # Laragon
# atau (macOS, Homebrew)
mysql  Ver 8.0.39 for macos14 on arm64 (Homebrew)
```

Cipta **dua** pangkalan data — satu untuk pembangunan, satu khusus untuk ujian PHPUnit (jadual di dalamnya akan **dipadam semula** setiap kali ujian dijalankan):

```sql
-- log masuk: mysql -u root -p   (Laragon: mysql -u root — tiada kata laluan)
CREATE DATABASE kkm_latihan      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE kkm_latihan_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- pengguna khusus latihan (jangan guna root dalam .env)
CREATE USER 'kkm_dev'@'localhost' IDENTIFIED BY 'Latihan@2026';
GRANT ALL PRIVILEGES ON kkm_latihan.*      TO 'kkm_dev'@'localhost';
GRANT ALL PRIVILEGES ON kkm_latihan_test.* TO 'kkm_dev'@'localhost';
FLUSH PRIVILEGES;
```

Sahkan:

```bash
mysql -u kkm_dev -p -e "SHOW DATABASES LIKE 'kkm_latihan%';"
```

```text
+--------------------------+
| Database (kkm_latihan%)  |
+--------------------------+
| kkm_latihan              |
| kkm_latihan_test         |
+--------------------------+
```

> 🪟 **Windows:** dalam terminal VS Code (Git Bash), `mysql -p` bertanya kata laluan seperti biasa. Dalam tetingkap Git Bash berasingan (mintty), `mysql` boleh tergantung tanpa prompt — tambah `winpty` di hadapan: `winpty mysql -u kkm_dev -p`.

> **Kenapa MySQL untuk ujian, bukan SQLite?** BR-TLK-05 memerlukan `SELECT … FOR UPDATE`, yang tidak disokong SQLite. Lihat [`../nota/10-ujian-phpunit-ci4.md`](../nota/10-ujian-phpunit-ci4.md).

Alat GUI (pilih satu): HeidiSQL (Laragon: butang **Database**), phpMyAdmin (perlu Apache Laragon), TablePlus, DBeaver, atau MySQL Workbench.

---

## 5. Git & VS Code

**Windows:** pasang **Git for Windows** dari <https://git-scm.com/download/win> (membawa **Git Bash**). Dalam pemasang, kekalkan pilihan lalai, kecuali:

- *Choosing the default editor* → **Visual Studio Code**.
- *Adjusting your PATH environment* → **Git from the command line and also from 3rd-party software**.
- *Configuring the line ending conversions* → **Checkout Windows-style, commit Unix-style line endings** (sama dengan `core.autocrlf true` di bawah).

```bash
git --version
```

```text
git version 2.46.0
```

Konfigurasi sekali sahaja (guna nama sebenar anda, e-mel kerja atau rekaan — **jangan** kata laluan):

```bash
git config --global user.name  "Nama Anda"
git config --global user.email "nama@contoh.test"
git config --global init.defaultBranch main
git config --global core.autocrlf input     # macOS/Linux; Windows: true
git config --global core.editor "code --wait"   # mesej commit dibuka dalam VS Code, bukan Vim
```

> Tanpa `core.editor`, Git membuka **Vim** untuk mesej commit (cth `git pull` yang mencipta commit merge). Terperangkap dalam Vim? Tekan `Esc`, taip `:wq`, tekan `Enter`.

### VS Code — Git Bash sebagai terminal lalai (Windows)

Terminal lalai VS Code di Windows ialah PowerShell. Kebanyakan arahan kursus (`&&`, `grep`, `head`, `cp`, `export`) ditulis untuk bash, jadi tukar sekali sahaja:

1. `Ctrl+Shift+P` → taip **Terminal: Select Default Profile** → pilih **Git Bash**.
2. Tutup semua terminal lama (ikon tong sampah), kemudian buka terminal baharu: `` Ctrl+Shift+` ``.
3. Sahkan:

   ```bash
   echo $SHELL
   ```

   ```text
   /usr/bin/bash
   ```

   Baris kosong, atau `$SHELL` dicetak semula? Anda masih dalam PowerShell/Command Prompt — ulang langkah 1–2.

> Laluan dalam Git Bash: `C:\Users\ali\latihan` ditulis `/c/Users/ali/latihan`, dan `~` = `C:\Users\ali`.

### VS Code — sambungan wajib & disyorkan

| Sambungan | ID | Kenapa |
|-----------|----|--------|
| **PHP Intelephense** | `bmewburn.vscode-intelephense-client` | Autolengkap, *go to definition* untuk kelas CI4 & Shield, amaran jenis |
| **Markdown Preview Mermaid Support** | `bierner.markdown-mermaid` | Papar carta skop, carta alir dan ERD Mermaid dalam pratonton Markdown (**dari Hari 1**). Tiada internet/sambungan? Lakar di kertas atau tulis sebagai jadual dahulu, pratonton kemudian |
| EditorConfig | `EditorConfig.EditorConfig` | Inden konsisten antara pasangan |
| GitLens (opsyenal) | `eamodio.gitlens` | Lihat sejarah baris & cabang |
| Claude Code (opsyenal) | — | Pembantu AI mengikut [`pustaka-prompt.md`](./pustaka-prompt.md) |

Pasang melalui terminal:

```bash
code --install-extension bmewburn.vscode-intelephense-client
code --install-extension bierner.markdown-mermaid
code --install-extension EditorConfig.EditorConfig
```

> Nyahaktifkan sambungan PHP terbina VS Code (*PHP Language Features*) jika Intelephense memaparkan cadangan berganda.

---

## 6. Ujian asap — projek CI4 kosong

Lakukan di folder latihan (bukan dalam repo bahan kursus):

```bash
composer create-project codeigniter4/appstarter ujian-asap
cd ujian-asap
php spark --version     # atau: php spark
```

```text
CodeIgniter v4.6.x Command Line Tool - Server Time: 2026-xx-xx xx:xx:xx UTC+08:00
```

```bash
cp env .env
php spark serve
```

```text
CodeIgniter development server started on http://localhost:8080
Press Control-C to stop.
```

Buka <http://localhost:8080> → halaman *Welcome to CodeIgniter 4.6.x*. ✅

> 🪟 **Windows:** cipta `.env` dengan `cp env .env` dalam Git Bash — **jangan** dengan Notepad (ia boleh menyimpan `.env.txt`). Hidupkan *File Explorer → View → Show → File name extensions* supaya nama penuh `.env` kelihatan. Sunting kandungannya dalam VS Code.

Sambungan DB — sunting `.env`:

```ini
CI_ENVIRONMENT = development

database.default.hostname = localhost
database.default.database = kkm_latihan
database.default.username = kkm_dev
database.default.password = Latihan@2026
database.default.DBDriver = MySQLi
database.default.port = 3306
```

```bash
php spark db:table --show
```

Output dijangka: senarai jadual kosong **tanpa ralat** sambungan (contoh: `No tables found` atau jadual kosong). Ralat `Unable to connect` → lihat §8.

Selesai? Padam folder `ujian-asap/` — projek sebenar dicipta pada Hari 4.

---

## 7. Laragon (Windows, wajib) / Herd (macOS, pilihan)

| Alat | Kelebihan | Perhatian |
|------|-----------|-----------|
| **Laragon** | **Stack Windows kursus ini** (§2). Satu klik: PHP + MySQL 8.4 + Composer + HeidiSQL (butang **Database**); *pretty URL* `http://projek.test` perlu Apache + *Auto virtual hosts* (tidak digunakan dalam kursus) | Aktifkan sambungan melalui *Menu → PHP → Extensions*; mulakan semula Laragon selepas menukar versi PHP; tetingkap peringatan lesen tanpa lesen (§2 langkah 2) |
| **Herd** | PHP pantas, bertukar versi mudah, `*.test` automatik | Herd **tidak** membawa MySQL dalam edisi percuma — pasang MySQL/DBngin berasingan. Folder mesti "Parked" untuk `*.test`. |

Windows: guna Laragon (§2). macOS: Herd **tidak wajib** — `php spark serve` sudah memadai untuk kursus ini.

---

## 8. Penyelesaian masalah

| Gejala | Punca lazim | Penyelesaian |
|--------|-------------|--------------|
| `php` bukan arahan dikenali / `bash: php: command not found` | PHP tiada dalam `PATH` | Laragon: *Menu → Tools → Path → Add Laragon to Path*, kemudian tutup & buka semula VS Code |
| `bash: mysql: command not found` (Git Bash) | Folder `bin` MySQL Laragon tiada dalam `PATH` | *Menu → Tools → Path → Manage Path* → tambah `C:\laragon\bin\mysql\mysql-8.4.x-winx64\bin`; buka semula VS Code |
| `bash: composer: command not found` (Git Bash) | Laragon hanya membawa `composer.bat`/`composer.phar`; Git Bash tidak menjalankan `.bat` tanpa sambungan | `echo 'alias composer="php /c/laragon/bin/composer/composer.phar"' >> ~/.bashrc && source ~/.bashrc` (§2 langkah 5) |
| `mysql -p` / `php spark shield:user create` tergantung tanpa prompt | Tetingkap Git Bash berasingan (mintty) tanpa konsol Windows | Jalankan dalam terminal VS Code, atau tambah `winpty` di hadapan: `winpty mysql -u kkm_dev -p` |
| Arahan `&&`, `grep`, `head` gagal di Windows | Terminal VS Code masih PowerShell | §5: *Terminal: Select Default Profile → Git Bash*; `echo $SHELL` → `/usr/bin/bash` |
| `php -v` tunjuk 7.x/8.0/8.1 | Beberapa PHP dipasang | `which -a php` / `where php`; susun semula `PATH` atau guna versi Herd/Laragon |
| `requires ext-intl * -> it is missing` | `intl` tidak aktif | `php.ini`: buang `;` pada `extension=intl`; Linux: `sudo apt install php8.3-intl` |
| Sambungan dah diaktifkan tapi masih tiada | Sunting `php.ini` yang salah | `php --ini` untuk fail sebenar CLI (CLI & web boleh guna `php.ini` berbeza) |
| `Unable to connect to the database` | Kelayakan/port salah, MySQL tidak berjalan | Semak `.env`; `mysql -u kkm_dev -p`; guna `127.0.0.1` jika `localhost` gagal (soket) |
| `SQLSTATE[HY000] [1045] Access denied` | Kata laluan/pengguna salah | Ulang langkah `CREATE USER` di §4 |
| `The server requested authentication method unknown to the client` | MySQL 8 `caching_sha2_password` dengan klien PHP lama | Naik taraf PHP ke 8.2+ (`mysqlnd` menyokong `caching_sha2_password`) — **jangan** tukar kaedah pengesahan. `ALTER USER … IDENTIFIED WITH mysql_native_password …` hanya untuk MariaDB / MySQL ≤ 8.0; ia gagal pada MySQL 8.4 (Laragon) kerana plugin itu dimatikan |
| Port 8080 sedang digunakan | Aplikasi lain | `php spark serve --port 8081` **dan** `app.baseURL = 'http://localhost:8081/'` dalam `.env` (jika tidak, pautan & redirect masih menuju `:8080`) |
| Port 3306 sedang digunakan / MySQL Laragon tidak mahu mula | Pelayan MySQL lain berjalan (cth XAMPP lama, servis Windows `MySQL80`) | Git Bash: `netstat -ano \| findstr :3306` → nombor terakhir ialah PID. Hentikan proses itu: Task Manager → *Details* → cari PID → *End task*, atau `taskkill //PID <pid> //F` (Git Bash perlu `//`). Servis Windows: `services.msc` → hentikan & set *Manual*. Atau tukar port MySQL Laragon (*Menu → Preferences → Services & Ports* → MySQL `3307`) **dan** `database.default.port = 3307` dalam `.env` |
| Composer: `curl error 60 SSL certificate` / `SSL certificate problem: unable to get local issuer certificate` | Rangkaian pejabat memeriksa SSL (*SSL inspection*) dengan sijil CA sendiri | Lihat *Rangkaian pejabat dengan SSL inspection* di §3; **jangan** matikan `secure-http` |
| Git: `SSL certificate problem: unable to get local issuer certificate` | Sama (SSL inspection) | Windows: `git config --global http.sslBackend schannel` (guna stor sijil Windows) |
| Composer sangat lambat | Rangkaian | `composer config -g repos.packagist composer https://repo.packagist.org`; cuba rangkaian lain |
| `composer install`/`create-project` tersekat lama / `The process exceeded the timeout` (Windows) | Windows Defender/antivirus mengimbas setiap fail dalam `vendor/` | `composer config --global process-timeout 900`; `composer install --prefer-dist`; jalankan ujian asap §6 seawal mungkin (sebelum Hari 3, apabila Tugasan Persediaan diedarkan) supaya cache Composer sudah penuh. Jika dibenarkan unit ICT: kecualikan `C:\laragon` dan folder latihan daripada imbasan masa nyata |
| `writable/` tidak boleh ditulis (macOS/Linux) | Kebenaran folder | `chmod -R 775 writable` |
| Halaman `Whoops!` tanpa butiran | `CI_ENVIRONMENT` bukan `development` | Pastikan fail bernama `.env` (bukan `env`) dan `CI_ENVIRONMENT = development` |
| Mermaid tidak dipapar dalam VS Code | Sambungan tiada | Pasang `bierner.markdown-mermaid`, buka pratonton `Ctrl+Shift+V`. Tiada internet: lakar di kertas atau tulis sebagai jadual, pratonton kemudian (atau <https://mermaid.live>) |

Masih tersekat? Catat **arahan + output penuh** dan hantar kepada jurulatih sebelum Hari 4. Anda juga boleh guna prompt **AI-01 Terangkan ralat** dalam [`pustaka-prompt.md`](./pustaka-prompt.md).

---

## 9. Pengesahan akhir (tampal ke kumpulan kursus)

Windows: jalankan dalam **Git Bash** (terminal VS Code) — `head` dan `grep` tidak wujud dalam PowerShell.

```bash
php -v | head -1
php -m | grep -Eic '^(intl|mbstring|mysqlnd|mysqli|gd|zip|curl|xml|dom|fileinfo)$'   # patut: 10
composer -V | head -1
mysql --version
git --version
```

Hantar 5 baris output ini kepada jurulatih — **tiada kata laluan, tiada `.env`**.
