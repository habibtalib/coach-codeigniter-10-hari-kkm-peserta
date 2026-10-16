# CI4 App Skeleton Tutorial — Head Start (optional)

[🛠️ Setup](./persediaan.md) · [🧪 Day 4 Lab](../hari-4/lab.md) · [📘 SPEC](spesifikasi-sistem.md) · [🤝 KOLABORASI](kolaborasi.md) · [🧪 Note 10 · Testing](nota-10-ujian-phpunit-ci4.md)

> **Optional, not required.** Days 1–3 are requirements only (URS, flowcharts, ERD). The real build starts on Day 4 ([Lab 4.2](../hari-4/lab.md) and [Lab 4.3](../hari-4/lab.md)). This page gives you a **head start**: Part A is a CI4 basics practice project on Day 1; Parts B–G build the real app skeleton in the pair repo, with names, commands, `.env` keys, DB names and file paths **the same** as in Lab 4.2/4.3.

**Course platform: Windows + Laragon + Git Bash** ([`persediaan.md`](./persediaan.md) §2, §5). Type every `bash` block in the VS Code **Git Bash** terminal (`echo $SHELL` → `/usr/bin/bash`). Where a command differs in Command Prompt, the `bat` form is given next to it. In Git Bash, `~` = `C:\Users\<nama>`, and `C:\Users\<nama>\latihan` is written `/c/Users/<nama>/latihan`.

The CI4 and Shield commands were verified with CodeIgniter **4.7.5** + Shield **1.4.1** on 2026-10-15. The course needs CI **4.6+** and PHP **8.2+**.

| Part | What | Folder | When | Minutes |
|------|------|--------|------|---------|
| A | CI4 basics: welcome page, `.env`, route → controller → view | `~/latihan/ci4-asas` (practice) | Day 1 (Lab 1.5); the real project `kelas-ci-<nama>` starts on Day 2 (Labs 2.2–2.4) | ±40 |
| B | CI4 project in the pair repo + folder structure | `~/latihan/sistem-tlk-pas` | Before Day 4 | 20 |
| C | Database `.env` | `~/latihan/sistem-tlk-pas` | After [`persediaan.md`](./persediaan.md) §4 | 10 |
| D | Install Shield | `~/latihan/sistem-tlk-pas` | After C | 20 |
| E | Route → `Home` controller → view with a layout | `~/latihan/sistem-tlk-pas` | After D | 20 |
| F | First migration + seeder (one table) | `~/latihan/sistem-tlk-pas` | After E | 20 |
| G | `composer test` smoke test | `~/latihan/sistem-tlk-pas` | After F | 10 |

> **Two folders, two purposes.** `ci4-asas` is a **practice-only** project for Day 1 — not a Git repo, and safe to delete at any time. The real project is `kelas-ci-<nama>` on GitLab, created in Day 2 Lab 2.2. The real skeleton is built in the pair repo `sistem-tlk-pas` (Lab 1.0). Neither folder needs to be in `C:\laragon\www`: the course serves the app with `php spark serve`, not Laragon's Apache.

---

## Part A — CI4 basics on your laptop (Day 1)

### 🎯 Goal

Run the `ci4-asas` practice project on <http://localhost:8080>, turn on the Debug Toolbar with `.env`, and build your first MVC flow: the `hello` route → the `Hello` controller → the `hello.php` view with one `esc()` variable.

### Steps

1. **Check your tools.** Laragon is installed and on the `PATH` ([`persediaan.md`](./persediaan.md) §2 steps 1–6). In Git Bash:

   ```bash
   where php                                       # first line: C:\laragon\bin\php\php-8.x…\php.exe
   php -v | head -1
   php -m | grep -Eic '^(intl|mbstring|mysqli)$'   # should be: 3
   composer -V | head -1
   ```

   Command Prompt: `where php`, `php -v`, `composer -V` are the same; `php -m` lists the extensions (look for `intl`, `mbstring`, `mysqli`).

   - `where php` points to another folder first (e.g. an old XAMPP)? Laragon → *Menu → Tools → Path → Add Laragon to Path*, then close and reopen VS Code.
   - Wrong version? Laragon → *Menu → PHP → Version* → pick **8.3.x** (or 8.2.x).
   - Missing extension? Laragon → *Menu → PHP → Extensions* → tick `intl` / `mbstring` / `mysqli`.
   - `composer: command not found` in Git Bash? Laragon ships `composer.bat`, which Git Bash doesn't run when you type `composer`. Add the alias once ([`persediaan.md`](./persediaan.md) §2 step 5). Command Prompt runs `composer.bat` directly.

2. **Create the practice project:**

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

   > 🛡️ `composer create-project` slow, or `The process exceeded the timeout`? Windows Defender scans every file in `vendor/`. See [`persediaan.md`](./persediaan.md) §8 (`composer config --global process-timeout 900`, a scan exclusion if the ICT unit allows it).

3. **Start the server:**

   ```bash
   php spark serve
   ```

   Open <http://localhost:8080>. Stop it with Ctrl+C.

   > 🛡️ The first time, **Windows Defender Firewall** may ask whether `php.exe` may use the network. Tick **Private networks** only → *Allow access*. If you pick *Cancel*, `localhost` still works; only other computers can't connect.

4. **`.env` for development.** Copy the template:

   ```bash
   cp env .env
   ```

   Command Prompt: `copy env .env`. **Don't** create it with Notepad (it can save `.env.txt`); turn on *File Explorer → View → Show → File name extensions*.

   Open `.env` in VS Code and uncomment (delete the `#`) this line:

   ```ini
   CI_ENVIRONMENT = development
   ```

   Run `php spark serve` again and reload the page — the 🔥 **Debug Toolbar** icon appears in the bottom-right corner.

5. **Route.** `app/Config/Routes.php` — add one line under the `/` route:

   ```php
   $routes->get('hello', 'Hello::index');
   ```

6. **Controller.** Create `app/Controllers/Hello.php`:

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

7. **View.** Create `app/Views/hello.php`. `esc()` turns `<` `>` into plain text so user input can't inject HTML/JavaScript (XSS):

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

8. **Try it.** With `php spark serve` running, open <http://localhost:8080/hello>.

9. **Test `esc()` (optional).** In `Hello.php`, replace the `return` line so the name comes from the URL (`?nama=`), with `'Peserta KKM'` as the default:

   ```php
   return view('hello', ['nama' => $this->request->getGet('nama') ?? 'Peserta KKM']);
   ```

   Open <http://localhost:8080/hello?nama=%3Cb%3EAli%3C/b%3E> (that is `?nama=<b>Ali</b>`).

10. In the Debug Toolbar, open the **Routes** tab (the matched controller) and **Views** (`hello.php`). Then, in a second terminal:

    ```bash
    php spark routes
    MSYS_NO_PATHCONV=1 php spark filter:check GET /hello
    ```

    > **`MSYS_NO_PATHCONV=1`:** Git Bash converts arguments that start with `/` into Windows paths (`/hello` → `C:/Program Files/Git/hello`). This prefix turns the conversion off for one command. Command Prompt doesn't need it: `php spark filter:check GET /hello`.

### You should see

```text
CodeIgniter v4.7.5 Command Line Tool - Server Time: 2026-10-15 11:59:57 UTC+00:00
```

- <http://localhost:8080> → *Welcome to CodeIgniter 4.7.5* (4.6.x is also fine) with the Debug Toolbar after step 4.
- `/hello` → **Hello, Peserta KKM!**
- Step 9: `/hello?nama=<b>Ali</b>` → **Hello, &lt;b&gt;Ali&lt;/b&gt;!** — the tags show as text, **not** bold. That proves `esc()` works.
- `php spark routes` → a `GET` `hello` line → `\App\Controllers\Hello::index`.

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `requires ext-intl * -> it is missing` | `intl` is not enabled | Laragon → *Menu → PHP → Extensions* → `intl`; open a new terminal |
| `Failed to listen on localhost:8080` | Port 8080 is in use | `php spark serve --port 8081`, open <http://localhost:8081> |
| `bash: composer: command not found` | Git Bash doesn't run `composer.bat` | Alias in `~/.bashrc` ([`persediaan.md`](./persediaan.md) §2 step 5), or use Command Prompt |
| A different page (not CI4) on `:8080` | Another app is using port 8080 | Find the PID: `netstat -ano \| findstr :8080`; or use port 8081 as in the row above |
| Debug Toolbar doesn't appear | The file is named `env` or `.env.txt`, or the `#` wasn't deleted | The name must be `.env` (check in File Explorer with file name extensions visible); the line `CI_ENVIRONMENT = development` without `#` |
| `404 - Can't find a route for 'GET: hello'` | The route isn't saved, or the file name doesn't match the class name | Check `Routes.php` is saved and the file is named `Hello.php` (class `Hello`); `php spark routes` |
| `Invalid file: "hello.php"` | The view is in the wrong folder | It must be `app/Views/hello.php` |
| `filter:check` can't find the route, or shows it as `C:/Program Files/Git/hello` | Git Bash converts `/hello` | Prefix `MSYS_NO_PATHCONV=1` (step 10) |

### Commit

None — `ci4-asas` is a practice project, not a Git repo. Your repo is `kelas-ci-<nama>` ([Lab 2.2](../hari-2/lab.en.md#lab-22--your-ci-project-on-gitlab-s2)). You can delete `ci4-asas`:

```bash
rm -rf ~/latihan/ci4-asas
```

Command Prompt: `rmdir /s /q %USERPROFILE%\latihan\ci4-asas`.

- [ ] `/hello` shows "Hello, Peserta KKM!" through `Hello::index` and `app/Views/hello.php`.
- [ ] You can explain which files are read for the route, the controller and the view of `/hello`.

---

## Part B — CI4 project in the pair repo & folder structure

### 🎯 Goal

Create the real CI4 project inside the pair repo `~/latihan/sistem-tlk-pas` (same as Lab 4.2 step 1), make clean commits, and explain what each main folder does.

### Prerequisites

The `~/latihan/sistem-tlk-pas` repo (`C:\Users\<nama>\latihan\sistem-tlk-pas`) from Lab 1.0, with `README.md` and `docs/`. The repo already has Git — **don't** run `git init` again.

### Steps

1. **Create the project inside the existing repo.** `composer create-project` needs an empty folder, so create it in a temporary subfolder and move it. Run this in **Git Bash** only — Command Prompt has no `cp -n`, and PowerShell `Copy-Item` overwrites your `README.md`:

   ```bash
   cd ~/latihan/sistem-tlk-pas
   composer create-project codeigniter4/appstarter ci4-tmp
   cp -Rn ci4-tmp/. .        # -n: don't overwrite existing files (e.g. your README.md)
   rm -rf ci4-tmp
   php spark --version
   ```

2. **Project hygiene.** Create `.gitattributes` and `.editorconfig` in the project root in VS Code (*File → New File*). Their content is in Lab 4.2 step 1 (templates: `gitattributes.txt` (**Templat & Rujukan** module), `editorconfig.txt` (**Templat & Rujukan** module)). `* text=auto eol=lf` makes sure files are committed with LF line endings even though your Windows Git has `core.autocrlf true`. Then:

   ```bash
   git add .gitattributes .editorconfig
   git add --renormalize .
   composer config process-timeout 0    # Composer scripts are not stopped after 300 s
   git commit -m "SETUP: .gitattributes + .editorconfig (hujung baris LF)"
   ```

   **Remove the coverage block** (Lab 4.2 step 1). The course laptops have no Xdebug/PCOV, and the appstarter `phpunit.dist.xml` asks for a coverage report with `failOnWarning="true"`, so `composer test` exits with code 1 even when every test passes. In VS Code, open `phpunit.dist.xml` and delete the whole `<coverage …> … </coverage>` block (keep `<source>`, `<testsuites>` and `<php>`). This file is committed in step 3.

3. **Check `.gitignore`, then commit the project.** The appstarter `.gitignore` must ignore `.env`, `vendor/` and the contents of `writable/`:

   ```bash
   git check-ignore -v .env vendor/autoload.php writable/logs/ujian.log
   ```

   All three lines must print. Commit the project (the Lab 4.4 step 2 file list, with the whole `app` folder):

   ```bash
   git add composer.json composer.lock spark env public app builds preload.php phpunit*.dist* tests writable .gitignore LICENSE
   git status --short | grep -E "\.env$|^.. vendor/" || echo "OK: tiada fail sulit/vendor"
   git commit -m "SETUP: projek CI4 appstarter"
   ```

4. **Folder tour.** Open the project folder in VS Code and compare it with this map:

   ```text
   sistem-tlk-pas\
   ├── app\
   │   ├── Config\          settings: Routes.php, Database.php, Filters.php, Auth.php (after Shield)
   │   ├── Controllers\     Home.php, BaseController.php
   │   ├── Models\          models (UserModel.php after Shield)
   │   ├── Views\           HTML templates (welcome_message.php, layouts\, partials\)
   │   └── Database\
   │       ├── Migrations\  schema changes, one file = one step
   │       └── Seeds\       synthetic data
   ├── public\              web root: index.php (front controller), CSS/JS
   ├── writable\            cache, logs, session, uploads (CI4 writes here)
   ├── tests\               PHPUnit tests (appstarter examples)
   ├── vendor\              Composer packages (DON'T edit, DON'T commit)
   ├── docs\                your Day 1–3 documents
   ├── env                  template; .env = your local copy (not committed)
   └── spark                the CI4 command-line tool
   ```

   `public/index.php` is step 1 of the request cycle you trace in Lab 4.1. List the available commands:

   ```bash
   php spark list
   ```

### You should see

- `git check-ignore` prints three `.gitignore:…` lines.
- `git log --oneline` → the `SETUP: mula repo dokumen` commit (Lab 1.0) + two new `SETUP:` commits.
- `php spark list` → the `Database` command group (`migrate`, `db:seed`, `db:table`) and `Generators` (`make:migration`, `make:seeder`).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Project directory "…" is not empty` | `create-project` straight into the repo folder | Use the `ci4-tmp` subfolder as in step 1 |
| Your `README.md` is gone / replaced by the CodeIgniter README | Copied with PowerShell / Explorer, not `cp -Rn` | `git checkout -- README.md` |
| `git check-ignore` doesn't print `.env` | `.gitignore` is missing / overwritten | Make sure the appstarter `.gitignore` was copied (`ls -a`); add the `.env` and `/vendor/` lines |
| `Could not open input file: spark` | The terminal is not in the project root | `cd ~/latihan/sistem-tlk-pas` |
| `warning: in the working copy of '…', LF will be replaced by CRLF` | Windows Git `core.autocrlf true` | Warning only; `.gitattributes` (step 2) keeps LF in the repo |

### Commit

```text
SETUP: .gitattributes + .editorconfig (hujung baris LF)
SETUP: projek CI4 appstarter
```

---

## Part C — Database `.env`

### 🎯 Goal

Connect the project to the `kkm_latihan` database with the `kkm_dev` user, as in Lab 4.2 steps 3–5.

### Prerequisites

- The `kkm_latihan` & `kkm_latihan_test` databases + the `kkm_dev` user already exist ([`persediaan.md`](./persediaan.md) §4).
- Laragon's MySQL is running: **Start All** (Apache unticked, §2 step 3) or *Menu → MySQL → Start MySQL*.

### Steps

1. Copy the template (Command Prompt: `copy env .env`), then open `.env` in VS Code:

   ```bash
   cp env .env
   ```

2. Uncomment & fill in (these values are also shown on your cohort page):

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

   > Port 8080 busy? Change it in **both** places: `app.baseURL = 'http://localhost:8081/'` and `php spark serve --port 8081`.

3. Confirm Git ignores `.env` and the connection works:

   ```bash
   git status --short | grep -c "\.env$"     # must be 0
   php spark db:table --show
   php spark list | head -2
   ```

### You should see

```text
| localhost | kkm_latihan | kkm_dev  | MySQLi   |          | 3306 |
Database has no tables!
```

- `php spark list` — the first line ends with `UTC+08:00` (proof that `app.appTimezone` is read).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Unable to connect to the database` | Laragon's MySQL isn't running / `.env` is wrong | Laragon → **Start All**; try `hostname = 127.0.0.1` |
| `SQLSTATE[HY000] [1045] Access denied` | Wrong user/password | Repeat `CREATE USER` in [`persediaan.md`](./persediaan.md) §4 (Laragon **Database** button → HeidiSQL) |
| Laragon's MySQL won't start / port 3306 busy | Another MySQL server (old XAMPP, the `MySQL80` service) | [`persediaan.md`](./persediaan.md) §8: `netstat -ano \| findstr :3306` |
| `db:table` shows `ci4` / `root` | The lines are still commented with `#` | Delete the `#` in front of every `database.default.*` line |

### Commit

None — `.env` is **never** committed.

---

## Part D — Install Shield

### 🎯 Goal

Install CodeIgniter Shield, generate your own `UserModel`, turn off self-registration and turn on CSRF (Lab 4.2 steps 6–8, 10–11).

### Steps

1. Stop `serve` (Ctrl+C), then in the VS Code terminal:

   ```bash
   composer require codeigniter4/shield
   php spark shield:setup
   ```

   | Question | Answer |
   |----------|--------|
   | `Config\Email::$fromEmail is not set. Do you set now?` | `y` → `noreply@latihan.test` |
   | `Config\Email::$fromName is not set. Do you set now?` | `y` → `Sistem TLK` |
   | ``Run `spark migrate --all` now?`` | `y` |

   `shield:setup` copies `Auth.php`, `AuthGroups.php`, `AuthToken.php` into `app/Config/`, adds `service('auth')->routes($routes);` to `Routes.php`, sets CSRF to `session` and runs the Shield migrations.

   > 🪟 In a separate Git Bash window (mintty, not the VS Code terminal), the interactive questions can hang. Put `winpty` in front: `winpty php spark shield:setup`.

2. Generate your own user model and add the profile fields in `app/Models/UserModel.php`:

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

   The `AddProfileFieldsToUsers` migration in Lab 4.3 creates these columns.

3. `app/Config/Auth.php` — find and change:

   ```php
   public bool $allowRegistration = false;   // internal system: no self-registration
   public string $userProvider = \App\Models\UserModel::class;
   ```

4. `app/Config/Filters.php` — in `$globals['before']`, uncomment `'csrf'`.

5. `app/Controllers/BaseController.php` — in `initController()`, set the helpers **before** `parent::initController(...)`:

   ```php
   $this->helpers = ['form', 'url'];   // MUST be before parent::initController()
   ```

6. `app/Config/AuthGroups.php` (4 groups & 8 permissions, SPEC §4) is Lab 4.2 step 9 — it needs Day 4 README §2.3, so do it on Day 4.

### You should see

```bash
php spark routes | grep -E "login|logout"
php spark db:table --show
```

- The `login` (GET & POST) and `logout` routes exist.
- The `users`, `auth_identities`, `auth_groups_users`, `settings`, `migrations` tables exist.

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `shield:setup` → `TypeError … InputOutput::input(): Return value must be of type string, false returned` | Run without an interactive terminal | Run it in the VS Code terminal; in a separate Git Bash window: `winpty php spark shield:setup` |
| `composer require` slow / timeout | Windows Defender scans `vendor/` | [`persediaan.md`](./persediaan.md) §8 |
| `Class "App\Models\UserModel" not found` | Step 2 wasn't done | `php spark shield:model UserModel` |
| `Call to undefined function form_dropdown()` (Day 5) | The helpers were set after `parent::initController()` | Move the `$this->helpers` line up |

### Commit

```bash
git add composer.json composer.lock app
git commit -m "SETUP: pasang Shield + UserModel + Auth/Filters"
```

---

## Part E — Route → `Home` controller → view with a layout

### 🎯 Goal

Build the **route → controller → view** flow with one Bootstrap 5.3 layout (`$this->extend` / `$this->section`), and protect `/` with the `session` filter (Lab 4.2 steps 12–16).

### Steps

1. **Flash partial** — create `app/Views/partials/flash.php` with the Lab 4.2 step 12 code (`success`/`message` messages in green, `error` in red).

2. **Layout** — create `app/Views/layouts/main.php` with the Lab 4.2 step 13 code. The key part is where the page content goes in:

   ```php
   <main class="container py-4">
       <?php if (! empty($title)): ?><h1 class="h3 mb-3"><?= esc($title) ?></h1><?php endif ?>
       <?= $this->include('partials/flash') ?>
       <?= $this->renderSection('content') ?>
   </main>
   ```

3. **View** — `app/Views/home.php` extends the layout and fills the `content` section:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <div class="p-4 bg-white rounded-3 border">
       <p class="lead mb-1">Selamat datang, <?= esc(auth()->user()->full_name ?? auth()->user()->username) ?>.</p>
       <p class="text-muted mb-0">Peranan: <?= esc(implode(', ', auth()->user()->getGroups())) ?></p>
   </div>
   <?= $this->endSection() ?>
   ```

4. **Controller** — `app/Controllers/Home.php`, replace `view('welcome_message')`:

   ```php
   public function index(): string
   {
       return view('home', ['title' => 'Utama']);
   }
   ```

5. **Route** — `app/Config/Routes.php`. `shield:setup` already added the `service('auth')->routes($routes);` line; change only the `/` line:

   ```php
   $routes->get('/', 'Home::index', ['filter' => 'session', 'as' => 'home']);

   service('auth')->routes($routes);
   ```

6. Confirm the filter on `/` (Command Prompt: without `MSYS_NO_PATHCONV=1`):

   ```bash
   MSYS_NO_PATHCONV=1 php spark filter:check GET /
   ```

### You should see

- `filter:check` → the *Before Filters* column for `/` contains `session`.
- `php spark serve` → open <http://localhost:8080/> (not logged in) → **redirected** to `http://localhost:8080/login` (no `index.php` in the URL), the Shield login page.

> There are no users to log in with yet — `UserSeeder` is built in Lab 4.3. **Don't** create your own test users in `kkm_latihan`: the Lab 4.3 checkpoint counts exactly 5 rows in `auth_groups_users`.

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| The URL contains `/index.php/login` | `app.indexPage` hasn't been emptied | `.env`: `app.indexPage = ''` |
| `Invalid file: "layouts/main.php"` | The file is in the wrong folder | It must be `app/Views/layouts/main.php` |
| Blank page / no CSS | No internet access to the CDN | Local copies in `public/assets/` (Lab 4.2 step 13) |
| `/` still shows *Welcome to CodeIgniter* | `Home::index` still returns `view('welcome_message')`, or the route has no `'filter' => 'session'` | Check steps 4 and 5 |
| `filter:check` can't find the route, or shows it as `C:/Program Files/Git/` | Git Bash converts `/` | Prefix `MSYS_NO_PATHCONV=1` (step 6) |

### Commit

```bash
git add app/Views app/Controllers app/Config/Routes.php
git commit -m "SETUP: layout Bootstrap + halaman utama dilindungi"
```

---

## Part F — First migration + seeder (one table)

### 🎯 Goal

Write **one** migration (`departments`) and an idempotent seeder as a pattern. The other nine migrations stay for Lab 4.3.

### Steps

1. Generate the files. `CreateDepartmentsTable` must be the **first** one — the file name timestamp sets the run order, and `users.department_id` (Lab 4.3) references this table:

   ```bash
   php spark make:migration CreateDepartmentsTable
   php spark make:seeder DepartmentSeeder
   ```

2. Fill in `up()`/`down()` in `app/Database/Migrations/*_CreateDepartmentsTable.php` (`*` = timestamp) with the Lab 4.3 step 2 code (`id`, `code` UNIQUE, `name`, `created_at`, `updated_at`; `dropTable('departments', true)` in `down()`).

3. Short loop — run, check, roll back, run again:

   ```bash
   php spark migrate
   php spark db:table departments --metadata
   php spark migrate:rollback
   php spark migrate
   ```

4. Fill in `app/Database/Seeds/DepartmentSeeder.php` with the Lab 4.3 step 8 code (4 divisions `BTM`, `BKW`, `BSM`, `BPA`; `->ignore(true)->insertBatch()`). Run it **twice**:

   ```bash
   php spark db:seed DepartmentSeeder
   php spark db:seed DepartmentSeeder
   php spark db:table departments
   ```

   Also check in HeidiSQL (Laragon **Database** button) → `kkm_latihan` → `departments`.

### You should see

```text
Running: (App) 2026-10-15-040102_App\Database\Migrations\CreateDepartmentsTable
Seeded: App\Database\Seeds\DepartmentSeeder
Seeded: App\Database\Seeds\DepartmentSeeder
```

- `php spark migrate:status` → one `App` namespace row (`CreateDepartmentsTable`) with a *Migrated On* date.
- `departments` → **4** rows after two runs, no `Duplicate entry`.

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Nothing to migrate` after changing the file | The file is already recorded in the `migrations` table | `php spark migrate:rollback` → `php spark migrate` |
| `Duplicate entry 'BTM' for key 'code'` on the second seed | `insertBatch()` without `ignore(true)` | Use `->ignore(true)->insertBatch()` |
| `Table 'departments' already exists` during `migrate` | `make:migration CreateDepartmentsTable` was run twice | Delete the duplicate file (newer timestamp) in `app/Database/Migrations/` |

### Commit

```bash
git add app/Database
git commit -m "SETUP: migration departments + DepartmentSeeder"
```

---

## Part G — `composer test` smoke test

### 🎯 Goal

Run the appstarter example tests on the MySQL **test** database, not the development DB.

### Steps

1. Add the `tests` group to `.env` (same as Day 6 README §3.2). `DatabaseTestTrait` rebuilds the tables — **never** point it at `kkm_latihan`:

   ```ini
   database.tests.hostname = localhost
   database.tests.database = kkm_latihan_test
   database.tests.username = kkm_dev
   database.tests.password = Latihan@2026
   database.tests.DBDriver = MySQLi
   database.tests.DBPrefix =
   database.tests.port = 3306
   ```

   Without this block, the appstarter `tests` group uses SQLite, and Laragon doesn't enable the `sqlite3` extension.

2. Run:

   ```bash
   composer test
   echo $?                              # must be 0
   ```

### You should see

```text
OK (5 tests, 7 assertions)
```

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `No code coverage driver available` + `Script phpunit … returned with error code 1` | The `<coverage>` block is still in `phpunit.dist.xml` (`failOnWarning="true"`, no Xdebug/PCOV) | Delete the `<coverage …> … </coverage>` block (Part B step 2) |
| `The required PHP extension "sqlite3" is not loaded` | The `tests` group is still the appstarter's default SQLite | Step 1 wasn't done |
| `Access denied for user 'kkm_dev'@'localhost' to database 'kkm_latihan_test'` | No `GRANT` for the test DB | Repeat `GRANT … kkm_latihan_test.*` in [`persediaan.md`](./persediaan.md) §4 |
| `The process … exceeded the timeout of 300 seconds` | Composer's default `process-timeout` | `composer config process-timeout 0` (Part B step 2) |

### Commit

None — the change is only in `.env`. Confirm `git status --short` is empty.

---

## Self-check

- [ ] <http://localhost:8080/> redirects to `/login` without `index.php`.
- [ ] `php spark migrate:status` → Shield, Settings and `CreateDepartmentsTable` have all run.
- [ ] `composer test` → `OK`, `echo $?` → `0`.
- [ ] `git log --oneline` → `SETUP:` commits for Parts B, D, E and F; `git ls-files | grep -c "^\.env$"` → `0`.

---

## On Day 4

[Lab 4.2](../hari-4/lab.md) and [Lab 4.3](../hari-4/lab.md) remain the **source of truth**. If you already did this tutorial:

- **Skim** Lab 4.2/4.3 and verify every ✅ Checkpoint on your `sistem-tlk-pas` project. Anything that fails → follow the lab steps.
- **Skip** what is already done: `composer create-project` (Lab 4.2 step 1), `shield:setup`, `make:migration CreateDepartmentsTable` and `make:seeder DepartmentSeeder`. Running them again creates duplicate files.
- **Still to do** on Day 4: `AuthGroups.php` (Lab 4.2 step 9), the other 9 migrations starting with `AddProfileFieldsToUsers`, and the other 4 seeders (Lab 4.3).
- Lab 4.4 step 2 will say `nothing to commit` for files you already committed — that's normal; the ≥ 2 `SETUP:` commits checkpoint is already met.
- `ci4-asas` (Part A) isn't used on Day 4 — delete it if you haven't.
- Day 4 sets up `.gitattributes`, `.env` and Shield together — you can help your partner.

---

## Official references

All checked 2026-10-15:

- Server requirements (PHP 8.2+, `intl`, `mbstring`; 4.7.5 docs): <https://codeigniter.com/user_guide/intro/requirements.html>
- Installing with Composer (`composer create-project codeigniter4/appstarter`): <https://codeigniter.com/user_guide/installation/installing_composer.html>
- Running your app (`php spark serve`, port 8080, `CI_ENVIRONMENT`): <https://codeigniter.com/user_guide/installation/running.html>
- Installing Shield (`composer require codeigniter4/shield`, `php spark shield:setup`): <https://shield.codeigniter.com/latest/getting_started/install/>
- Migrations (`php spark make:migration`, `migrate`, `migrate:rollback`, `migrate:status`): <https://codeigniter.com/user_guide/dbmgmt/migration.html>
