# Environment Setup — before Day 1 & Day 2

> **Two deadlines:**
> - **Before Day 1:** Git, VS Code (+ the **Markdown Preview Mermaid Support** extension), a modern browser; Windows: Git Bash as the VS Code default terminal (§5). The Day 1 labs use Git and the Mermaid preview.
> - **Before Day 2** (the `kelas-ci-<nama>` project, Lab 2.2): the PHP stack — PHP 8.2+, PHP extensions, Composer, MySQL/MariaDB, Laragon/Herd and the CI4 smoke test (§6). Day 1 S4 (Lab 1.5) already tries CI4; from Day 2 you write code every day in your own `kelas-ci-<nama>` project on GitLab, and Day 3 needs MySQL. Fix your environment on the evening of Day 1 — don't wait until the morning of Day 2.
> Stack canon: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) §1.

## Why set it up early?

Experience from past courses: **the first 30–60 minutes of the first coding day are lost** because a PHP extension is not enabled, the MySQL port clashes, or Composer gets stuck behind a proxy. Every one of those minutes is taken from time for building the `kelas-ci-<nama>` project. This checklist makes sure you arrive with a **verified** environment, not one you "think is installed".

---

## 1. Quick checklist

| # | Item | Minimum version | Check command | Ready before | ✅ |
|---|---------|---------------|--------------|--------------|----|
| 1 | PHP (CLI) | **8.2** | `php -v` | Day 2 | [ ] |
| 2 | PHP extensions | `intl`, `mbstring`, `mysqlnd`, `mysqli`, `gd`, `zip`, `curl`, `xml` (+ `dom`, `fileinfo`, `json`) | `php -m` | Day 2 | [ ] |
| 3 | Composer | **2.x** | `composer -V` | Day 2 | [ ] |
| 4 | MySQL / MariaDB | **MySQL 8.0** / **MariaDB 10.6** | `mysql --version` | Day 3 | [ ] |
| 5 | Git | 2.30+ | `git --version` | **Day 1** | [ ] |
| 6 | VS Code + extensions (including Mermaid) | latest | see §5 | **Day 1** (Intelephense: Day 2) | [ ] |
| 7 | Modern browser | latest Chrome/Edge/Firefox | — | **Day 1** | [ ] |
| 8 | Windows: **Laragon** + **Git Bash** as the VS Code default terminal · macOS (optional): Herd | Laragon 8 | §2, §5 | Git Bash: **Day 1** · Laragon/Herd: Day 2 | [ ] |
| 9 | Smoke test: empty CI4 project runs | CI **4.6+** | §6 | Day 2 | [ ] |
| 10 | KKM GitLab account (GitLab KKM, from KKM IT) — [the `kelas-ci-<nama>` repo](./trek-gitlab.md) | — | log in to `https://<gitlab-kkm>` | Day 2 | [ ] |
| 11 | *Optional* — [Jira track](./trek-jira.md): Jira Cloud account (email) | — | sign in to `*.atlassian.net` | Day 4 | — |

### Why is each PHP extension needed?

| Extension | Used by | Symptom if missing |
|-----------|---------------|-------------------|
| `intl` | CI4 core (`Time`, `number_to_currency`, locale) | `composer create-project` fails: *requires ext-intl* |
| `mbstring` | CI4 core, Dompdf, PhpSpreadsheet (Malay UTF-8 text) | Fatal error: `mb_strlen()` does not exist |
| `mysqlnd` / `mysqli` | CI4 `MySQLi` DB driver | `Unable to connect to the database` / `Call to undefined function mysqli_init()` |
| `gd` | Images in PDF (Dompdf), PhpSpreadsheet | Logo does not appear in the PDF; error during Excel export |
| `zip` | PhpSpreadsheet (an `.xlsx` file = a ZIP archive), Composer | `composer require phpoffice/phpspreadsheet` fails |
| `curl` | Composer, outgoing HTTP requests | Composer is slow/fails to download packages |
| `xml` (`dom`, `xmlwriter`, `simplexml`) | PhpSpreadsheet, Dompdf, PHPUnit | Excel/PDF export fails; PHPUnit coverage report fails |
| `fileinfo` | `UploadedFile::getMimeType()` (Day 7), PhpSpreadsheet | Upload file type check cannot be trusted |

---

## 2. PHP 8.2+

### Install

| OS | Recommended way |
|----|----------------|
| Windows | **Laragon Full** (PHP + MySQL 8.4 + Apache/Nginx + Composer) — follow *Windows (Laragon) — step by step* below. XAMPP is **not supported** for this course: it ships MariaDB 10.4, older than the 10.6 minimum. |
| macOS | **Laravel Herd** (PHP only, lightweight) or `brew install php@8.3` |
| Linux (Ubuntu) | `sudo apt install php8.3-cli php8.3-intl php8.3-mbstring php8.3-mysql php8.3-gd php8.3-zip php8.3-curl php8.3-xml` |

> Herd and Laragon bring their own PHP. Make sure `php` in the terminal is **the same PHP** you expect: `which php` (macOS/Linux/Git Bash) or `where php` (Command Prompt).

### Windows (Laragon) — step by step

> 🪟 **Windows:** every `bash` block in this course runs in **Git Bash**, not PowerShell. Install Git for Windows and make Git Bash the VS Code default terminal (§5) **before** step 5 below.

1. **Download Laragon Full** from <https://laragon.org/download>. Use the **latest Laragon 8.x** (checked Oct 2026: 8.7.0), one installer `laragon-wamp.exe` (±229 MB) that ships PHP 8.1–8.5, MySQL 8.4/9.x, Apache, Nginx and Composer. Install to the default folder `C:\laragon`.
2. **Licence.** Since version 7, Laragon is no longer fully free software. Unlicensed use is allowed for non-commercial purposes; a licence reminder window appears every time Laragon starts — just close it. For a department laptop, check with your ICT unit whether a licence is needed.
3. **Start MySQL only.** This course serves the app with `php spark serve`, so Apache (ports 80/443) is not needed. Laragon → *Menu → Preferences → Services & Ports* → untick **Apache**; after that **Start All** starts MySQL only (the setting is remembered). Alternative: *Menu → MySQL → Start MySQL*. Also turn off *Menu → Preferences → Auto virtual hosts* — it rewrites the Windows `hosts` file and often asks for administrator permission. If Windows Defender asks, allow *Private* network access.
4. **Choose PHP 8.2+.** *Menu → PHP → Version* → choose **8.3.x** (or 8.2.x). PHP 8.4/8.5 also work, but the course is tested with 8.3.
5. **Put PHP, Composer & MySQL on the PATH.** *Menu → Tools → Path → Add Laragon to Path*. **Close VS Code completely** and open it again (old terminals keep the old `PATH`). In Git Bash:

   ```bash
   which php composer mysql
   php -v | head -1
   ```

   All three commands must point to `/c/laragon/bin/...`. If `mysql` is missing: *Menu → Tools → Path → Manage Path* → add the folder `C:\laragon\bin\mysql\mysql-8.4.x-winx64\bin` (use the real folder name), then reopen VS Code.

   If `which composer` prints nothing: Laragon ships `composer.bat` + `composer.phar`, and Git Bash does not run `composer.bat` when you type `composer`. Add an alias once (change the path if Laragon is installed in another folder):

   ```bash
   echo 'alias composer="php /c/laragon/bin/composer/composer.phar"' >> ~/.bashrc && source ~/.bashrc
   composer --version
   ```
6. **Enable the extensions & upload limits.** *Menu → PHP → php.ini* opens the right file (the same one for CLI and web). Make sure these lines exist **without** a `;` in front, and set the upload limits:

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

   (You can also tick extensions in *Menu → PHP → Extensions*.) Save → open a new terminal (the PHP CLI reads `php.ini` on every run; Laragon does not need a restart; stop & rerun any running `php spark serve`). Verify with `php --ini` (the file is under `C:\laragon\bin\php\...`) and the 10-extension check below.
7. **MySQL.** Laragon creates the `root` user **with no password**: log in with `mysql -u root`, then run the §4 SQL. GUI client: Laragon's **Database** button (HeidiSQL, no Apache needed). phpMyAdmin needs Apache (**Start All**).

### Verify

```bash
php -v
```

Expected output (patch numbers may differ):

```text
PHP 8.3.12 (cli) (built: ...) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.12, Copyright (c) Zend Technologies
```

```bash
# macOS / Linux / Windows Git Bash
php -m | grep -Ei '^(intl|mbstring|mysqlnd|mysqli|gd|zip|curl|xml|dom|fileinfo)$'
```

If you are not in Git Bash (PowerShell):

```powershell
php -m | Select-String -Pattern '^(intl|mbstring|mysqlnd|mysqli|gd|zip|curl|xml|dom|fileinfo)$'
```

Expected output — **10 lines** (order may differ):

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

Fewer than 10 lines? See §8 *Troubleshooting*.

### Recommended `php.ini` settings (training)

Find the file: `php --ini` → the *Loaded Configuration File* line.

```ini
; Muat naik dokumen Pas (Hari 7): 2 MB setiap fail × 3 fail (BR-PAS-02)
upload_max_filesize = 8M
post_max_size = 16M
memory_limit = 256M          ; PhpSpreadsheet & Dompdf (Hari 9)
max_execution_time = 60
date.timezone = Asia/Kuala_Lumpur
```

> Why is `upload_max_filesize` larger than 2 MB? So that the **application** (`max_size` validation) is what rejects a 3 MB file with a clear Malay message — not PHP silently dropping the file before it reaches the controller.

---

## 3. Composer 2

Install from <https://getcomposer.org/download/> (Laragon & Herd already include it).

```bash
composer -V
```

```text
Composer version 2.8.x 2025-xx-xx xx:xx:xx
PHP version 8.3.12 (/path/to/php)
```

> Make sure the *PHP version* line shows **8.2+** — Composer may be using a different PHP from your terminal.

```bash
composer diagnose      # every line should be "OK" (proxy warnings can be ignored if you have no proxy)
```

**Behind an office proxy?** Set the environment variable before `composer`:

```bash
export HTTPS_PROXY=http://proksi.contoh.test:8080   # macOS/Linux/Git Bash
$env:HTTPS_PROXY="http://proksi.contoh.test:8080"   # Windows PowerShell
```

**Office network with SSL inspection?** Symptom: `curl error 60` / `SSL certificate problem: unable to get local issuer certificate` on `composer` or `git clone`. The office firewall re-signs HTTPS traffic with an internal CA certificate that PHP and Git don't know.

1. Ask the ICT unit for the **root CA certificate** (a `.pem` or `.crt` file). If there is none: open <https://packagist.org> in Edge/Chrome → the site-information icon left of the URL (the *tune*/sliders icon; formerly a padlock) → *Connection is secure → Certificate is valid* → *Details* tab → choose the **top** certificate in the chain → *Export* as *Base64-encoded ASCII* (Windows dialog: *Copy to File → Base-64 encoded X.509 (.CER)*). Save it as `C:\certs\ca-pejabat.pem`.
2. Build a **combined bundle**: the public CAs (Mozilla list from curl) + the office CA. If the file holds only the office CA, Composer and PHP **fail** off the office network (home, hotspot).

   ```bash
   mkdir -p /c/certs && cd /c/certs
   curl --cacert ca-pejabat.pem -o cacert.pem https://curl.se/ca/cacert.pem   # or download it with the browser
   cat cacert.pem ca-pejabat.pem > cacert-pejabat.pem
   ```

3. Composer:

   ```bash
   composer config --global cafile "C:/certs/cacert-pejabat.pem"
   composer diagnose
   ```

4. PHP (for `curl`/`file_get_contents` in the app): in `php.ini` (`php --ini`), set

   ```ini
   openssl.cafile = "C:/certs/cacert-pejabat.pem"
   curl.cainfo = "C:/certs/cacert-pejabat.pem"
   ```

5. Git (Windows): `git config --global http.sslBackend schannel` — Git uses the Windows certificate store, which usually already has the office CA.

**Undo** (the laptop is no longer on the office network): `composer config --global --unset cafile` and remove the two `openssl.cafile`/`curl.cainfo` lines from `php.ini`. You can keep Git's `schannel` setting.

**Don't** turn off `secure-http` or `http.sslVerify` — that opens the door to *man-in-the-middle* attacks.

---

## 4. MySQL 8 / MariaDB 10.6+

```bash
mysql --version
```

```text
mysql  Ver 8.4.3 for Win64 on x86_64 (MySQL Community Server - GPL)   # Laragon
# or (macOS, Homebrew)
mysql  Ver 8.0.39 for macos14 on arm64 (Homebrew)
```

Create **two** databases — one for development, one only for PHPUnit tests (the tables in it are **dropped again** every time the tests run):

```sql
-- log in: mysql -u root -p   (Laragon: mysql -u root — no password)
CREATE DATABASE kkm_latihan      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE kkm_latihan_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- dedicated training user (don't use root in .env)
CREATE USER 'kkm_dev'@'localhost' IDENTIFIED BY 'Latihan@2026';
GRANT ALL PRIVILEGES ON kkm_latihan.*      TO 'kkm_dev'@'localhost';
GRANT ALL PRIVILEGES ON kkm_latihan_test.* TO 'kkm_dev'@'localhost';
FLUSH PRIVILEGES;
```

Verify:

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

> 🪟 **Windows:** in the VS Code terminal (Git Bash), `mysql -p` asks for the password as usual. In a separate Git Bash window (mintty), `mysql` can hang with no prompt — put `winpty` in front: `winpty mysql -u kkm_dev -p`.

> **Why MySQL for tests, not SQLite?** BR-TLK-05 needs `SELECT … FOR UPDATE`, which SQLite does not support. See [`nota-10-ujian-phpunit-ci4.md`](nota-10-ujian-phpunit-ci4.md).

GUI tool (choose one): HeidiSQL (Laragon: **Database** button), phpMyAdmin (needs Laragon's Apache), TablePlus, DBeaver, or MySQL Workbench.

---

## 5. Git & VS Code

**Windows:** install **Git for Windows** from <https://git-scm.com/download/win> (it brings **Git Bash**). In the installer, keep the default choices, except:

- *Choosing the default editor* → **Visual Studio Code**.
- *Adjusting your PATH environment* → **Git from the command line and also from 3rd-party software**.
- *Configuring the line ending conversions* → **Checkout Windows-style, commit Unix-style line endings** (the same as `core.autocrlf true` below).

```bash
git --version
```

```text
git version 2.46.0
```

One-time configuration (use your real name, a work or made-up e-mail — **never** a password):

```bash
git config --global user.name  "Nama Anda"
git config --global user.email "nama@contoh.test"
git config --global init.defaultBranch main
git config --global core.autocrlf input     # macOS/Linux; Windows: true
git config --global core.editor "code --wait"   # commit messages open in VS Code, not Vim
```

> Without `core.editor`, Git opens **Vim** for commit messages (e.g. a `git pull` that creates a merge commit). Stuck in Vim? Press `Esc`, type `:wq`, press `Enter`.

### VS Code — Git Bash as the default terminal (Windows)

The VS Code default terminal on Windows is PowerShell. Most course commands (`&&`, `grep`, `head`, `cp`, `export`) are written for bash, so change it once:

1. `Ctrl+Shift+P` → type **Terminal: Select Default Profile** → choose **Git Bash**.
2. Close all old terminals (bin icon), then open a new terminal: `` Ctrl+Shift+` ``.
3. Verify:

   ```bash
   echo $SHELL
   ```

   ```text
   /usr/bin/bash
   ```

   An empty line, or `$SHELL` printed back? You are still in PowerShell/Command Prompt — repeat steps 1–2.

> Paths in Git Bash: `C:\Users\ali\latihan` is written `/c/Users/ali/latihan`, and `~` = `C:\Users\ali`.

### VS Code — required & recommended extensions

| Extension | ID | Why |
|-----------|----|--------|
| **PHP Intelephense** | `bmewburn.vscode-intelephense-client` | Autocomplete, *go to definition* for CI4 & Shield classes, type warnings |
| **Markdown Preview Mermaid Support** | `bierner.markdown-mermaid` | Shows Mermaid scope charts, flowcharts and ERDs in the Markdown preview (**from Day 1**). No internet/extension? Sketch on paper or write it as a table first, preview later |
| EditorConfig | `EditorConfig.EditorConfig` | Consistent indentation across laptops |
| GitLens (optional) | `eamodio.gitlens` | See line & branch history |
| Claude Code (before Day 6) | — | AI assistant for Lab 6.3c — install & log in with [`tutorial-claude-code.en.md`](./tutorial-claude-code.en.md); prompts in [`pustaka-prompt.md`](./pustaka-prompt.md) |

Install from the terminal:

```bash
code --install-extension bmewburn.vscode-intelephense-client
code --install-extension bierner.markdown-mermaid
code --install-extension EditorConfig.EditorConfig
```

> Disable VS Code's built-in PHP extension (*PHP Language Features*) if Intelephense shows duplicate suggestions.

---

## 6. Smoke test — empty CI4 project

Do this in a practice folder (not inside the course material repo):

```bash
composer create-project codeigniter4/appstarter ujian-asap
cd ujian-asap
php spark --version     # or: php spark
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

Open <http://localhost:8080> → the *Welcome to CodeIgniter 4.6.x* page. ✅

> 🪟 **Windows:** create `.env` with `cp env .env` in Git Bash — **not** with Notepad (it may save `.env.txt`). Turn on *File Explorer → View → Show → File name extensions* so the full name `.env` is visible. Edit its contents in VS Code.

DB connection — edit `.env`:

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

Expected output: an empty table list **with no** connection error (for example: `No tables found` or an empty table). An `Unable to connect` error → see §8.

Done? Delete the `ujian-asap/` folder — the real project `kelas-ci-<nama>` is created on Day 2 (Lab 2.2).

---

## 7. Laragon (Windows, required) / Herd (macOS, optional)

| Tool | Advantages | Watch out |
|------|-----------|-----------|
| **Laragon** | **This course's Windows stack** (§2). One click: PHP + MySQL 8.4 + Composer + HeidiSQL (**Database** button); the *pretty URL* `http://projek.test` needs Apache + *Auto virtual hosts* (not used in this course) | Enable extensions via *Menu → PHP → Extensions*; restart Laragon after changing the PHP version; licence reminder window when unlicensed (§2 step 2) |
| **Herd** | Fast PHP, easy version switching, automatic `*.test` | Herd does **not** ship MySQL in the free edition — install MySQL/DBngin separately. The folder must be "Parked" for `*.test`. |

Windows: use Laragon (§2). macOS: Herd is **not required** — `php spark serve` is enough for this course.

---

## 8. Troubleshooting

| Symptom | Common cause | Fix |
|--------|-------------|--------------|
| `php` is not a recognised command / `bash: php: command not found` | PHP is not in `PATH` | Laragon: *Menu → Tools → Path → Add Laragon to Path*, then close & reopen VS Code |
| `bash: mysql: command not found` (Git Bash) | Laragon's MySQL `bin` folder is not in `PATH` | *Menu → Tools → Path → Manage Path* → add `C:\laragon\bin\mysql\mysql-8.4.x-winx64\bin`; reopen VS Code |
| `bash: composer: command not found` (Git Bash) | Laragon only ships `composer.bat`/`composer.phar`; Git Bash does not run `.bat` without the extension | `echo 'alias composer="php /c/laragon/bin/composer/composer.phar"' >> ~/.bashrc && source ~/.bashrc` (§2 step 5) |
| `mysql -p` / `php spark shield:user create` hangs with no prompt | A separate Git Bash window (mintty) without a Windows console | Run it in the VS Code terminal, or put `winpty` in front: `winpty mysql -u kkm_dev -p` |
| `&&`, `grep`, `head` commands fail on Windows | The VS Code terminal is still PowerShell | §5: *Terminal: Select Default Profile → Git Bash*; `echo $SHELL` → `/usr/bin/bash` |
| `php -v` shows 7.x/8.0/8.1 | Several PHP versions installed | `which -a php` / `where php`; reorder `PATH` or use the Herd/Laragon version |
| `requires ext-intl * -> it is missing` | `intl` not enabled | `php.ini`: remove the `;` before `extension=intl`; Linux: `sudo apt install php8.3-intl` |
| Extension enabled but still missing | Edited the wrong `php.ini` | `php --ini` for the real CLI file (CLI & web may use different `php.ini` files) |
| `Unable to connect to the database` | Wrong credentials/port, MySQL not running | Check `.env`; `mysql -u kkm_dev -p`; use `127.0.0.1` if `localhost` fails (socket) |
| `SQLSTATE[HY000] [1045] Access denied` | Wrong password/user | Repeat the `CREATE USER` step in §4 |
| `The server requested authentication method unknown to the client` | MySQL 8 `caching_sha2_password` with an old PHP client | Upgrade PHP to 8.2+ (`mysqlnd` supports `caching_sha2_password`) — **don't** change the authentication method. `ALTER USER … IDENTIFIED WITH mysql_native_password …` is only for MariaDB / MySQL ≤ 8.0; it fails on MySQL 8.4 (Laragon) because that plugin is disabled |
| Port 8080 already in use | Another application | `php spark serve --port 8081` **and** `app.baseURL = 'http://localhost:8081/'` in `.env` (otherwise links & redirects still go to `:8080`) |
| Port 3306 already in use / Laragon's MySQL won't start | Another MySQL server is running (e.g. an old XAMPP, the Windows service `MySQL80`) | Git Bash: `netstat -ano \| findstr :3306` → the last number is the PID. Stop that process: Task Manager → *Details* → find the PID → *End task*, or `taskkill //PID <pid> //F` (Git Bash needs `//`). Windows service: `services.msc` → stop it & set it to *Manual*. Or change Laragon's MySQL port (*Menu → Preferences → Services & Ports* → MySQL `3307`) **and** `database.default.port = 3307` in `.env` |
| Composer: `curl error 60 SSL certificate` / `SSL certificate problem: unable to get local issuer certificate` | The office network inspects SSL (*SSL inspection*) with its own CA certificate | See *Office network with SSL inspection* in §3; **don't** turn off `secure-http` |
| Git: `SSL certificate problem: unable to get local issuer certificate` | Same (SSL inspection) | Windows: `git config --global http.sslBackend schannel` (uses the Windows certificate store) |
| Composer is very slow | Network | `composer config -g repos.packagist composer https://repo.packagist.org`; try another network |
| `composer install`/`create-project` stalls / `The process exceeded the timeout` (Windows) | Windows Defender/antivirus scans every file in `vendor/` | `composer config --global process-timeout 900`; `composer install --prefer-dist`; run the §6 smoke test as early as possible (before Day 3, when the Pre-course Assignment is handed out) so the Composer cache is already warm. If your ICT unit allows it: exclude `C:\laragon` and the training folder from real-time scanning |
| `writable/` is not writable (macOS/Linux) | Folder permissions | `chmod -R 775 writable` |
| `Whoops!` page with no details | `CI_ENVIRONMENT` is not `development` | Make sure the file is named `.env` (not `env`) and `CI_ENVIRONMENT = development` |
| Mermaid not shown in VS Code | Extension missing | Install `bierner.markdown-mermaid`, open the preview with `Ctrl+Shift+V`. No internet: sketch on paper or write it as a table, preview later (or <https://mermaid.live>) |

Still stuck? Note down the **command + full output** and send it to the trainer before Day 2. You can also use prompt **AI-01 Explain an error** in [`pustaka-prompt.md`](./pustaka-prompt.md).

---

## 9. Final verification (paste into the course group)

Windows: run these in **Git Bash** (the VS Code terminal) — `head` and `grep` don't exist in PowerShell.

```bash
php -v | head -1
php -m | grep -Eic '^(intl|mbstring|mysqlnd|mysqli|gd|zip|curl|xml|dom|fileinfo)$'   # should be: 10
composer -V | head -1
mysql --version
git --version
```

Send these 5 output lines to the trainer — **no passwords, no `.env`**.
