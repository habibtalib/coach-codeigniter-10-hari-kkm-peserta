# Day 2 Lab — Requirement Sign-off & Your CI Project on GitLab

[📅 Schedule](../JADUAL.md) · [📘 SPEC canon](../docs/spesifikasi-sistem.md) · [📖 Day 2 README](./README.md) · [⚡ spark commands](../docs/arahan-spark.md)

| Lab | Session | Output |
|-----|---------|--------|
| [Lab 2.1](#lab-21--confirmation-session--decision-log) | S1 | `docs/log-keputusan.md`, `docs/keperluan-awal.md` v0.9 |
| [Lab 2.2](#lab-22--your-ci-project-on-gitlab-s2) | S2 | Private project `kelas-ci-<nama>` on GitLab KKM + first commit |
| [Lab 2.3](#lab-23--route-controller--layout-view-s3) | S3 | `/hello`, `/hello/<nama>`, `layout.php`; 2 commits pushed |
| [Lab 2.4](#lab-24--form-validation--csrf-s4) | S4 | `/daftar` form + validation + CSRF; commit pushed |

> From Lab 2.2 all work happens in your **individual** project `kelas-ci-<nama>`. The original flowchart, acceptance criteria and URS labs are now optional reading in [`docs/rujukan-keperluan.md`](../docs/rujukan-keperluan.md).

---

## Lab 2.1 — Confirmation Session & Decision Log

### 🎯 Objective
Present the FRs to the system owner, record a decision for each one, and update the requirements list to v0.9.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- `docs/keperluan-awal.md` v0.1 and `docs/soalan-terbuka.md` from Day 1.
- Read README §1.1–1.3.

### Steps
1. Create `docs/log-keputusan.md`:
   ```markdown
   # Decision Log — TLK & Pass System

   | # | Date | Item | Decision | Reason / details | Decided by |
   |---|------|------|----------|------------------|------------|
   ```
2. Add a **Status** column to every FR table in `docs/keperluan-awal.md` (values: `Draf`, `Disahkan`, `Diubah`, `Ditolak`, `Ditangguh`).
3. **Presentation (a few trainees, 3 minutes each)** to the system owner (TLK = Special Vehicle Parking, *Tempat Letak Kenderaan Khas*):
   - Read aloud the 4–5 riskiest "Must" FRs (the ones that touch a BR).
   - Ask the 2 most important open questions from `docs/soalan-terbuka.md`.
   - The other trainees listen and note the decisions in their own file — they apply to everyone, because everyone builds the same system.
4. Record every decision as a `D-nn` row in the log. For "Ditangguh" (deferred): you must fill in the action owner + deadline.
5. Update `docs/keperluan-awal.md`:
   - Rewrite the FRs marked "Diubah" (changed), and keep the old text with ~~strikethrough~~ below it.
   - Move the FRs marked "Ditolak" (rejected) to the "Won't" section.
   - Change the title to `v0.9 (Hari 2 — selepas pengesahan)`.
6. Update `docs/soalan-terbuka.md` — mark answered questions as `Ditutup (D-nn)`.
7. Commit (`git add docs/` so the new file `log-keputusan.md` is included too):
   ```bash
   git add docs/ && git commit -m "SETUP: pengesahan keperluan v0.9 + log keputusan"
   ```

### ✅ Checkpoint
- [ ] Every FR has a status other than `Draf`.
- [ ] The decision log has ≥ 5 rows; at least one is "Diubah".
- [ ] The log contains the system owner's **7 required decisions** (examples in README §1.2 D-01, D-02; the rest are announced as an owner memo): (1) the 90-day calculation (BR-TLK-03); (2) cancelling `pending`; (3) who can cancel (BR-TLK-06); (4) `pending` counts as active for the 1-booking limit (BR-TLK-04); (5) same-day overlap (BR-TLK-01); (6) `vehicle_id` for Pass; (7) `valid_until` ≥ `valid_from`.
- [ ] Every "Ditangguh" has a name and a date.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| The system owner answers "up to you" | The question was asked as a technical choice | Present it in business language: "If you choose A, madam, applicants will…; if B…" |
| A decision conflicts with the SPEC | The system owner changed their mind | Record it as a CR; do not change the FR silently. Refer to the trainer — the SPEC is canon. |
| Too many FRs to present | Presenting all of them | Pick the ones that touch a BR; the trainer confirms the rest in writing |

### ⭐ Bonus challenge
Write one complete **CR-01** (README §1.4) for a requirement the system owner wants but that does not match the SPEC. Assess the impact on the enums, DB tables and tests.

---

## Lab 2.2 — Your CI project on GitLab (S2)

### 🎯 Objective
Create a private project `kelas-ci-<nama>` on KKM GitLab (GitLab KKM), create a new CodeIgniter 4 project on your laptop, and push the first commit — without `.env` and `vendor/`. You use this project for the rest of the course.

### Prerequisites
- A GitLab KKM account (`https://<gitlab-kkm>`) — you can sign in.
- Laragon (PHP 8.2+, Composer) and Git Bash in VS Code ([Lab 1.5](../hari-1/lab.en.md#lab-15--ci4-basics-on-your-laptop-in-class-s4)). `php -v` and `composer -V` work.
- **Individual** work: every participant has their own repo. `<nama>` = your short name, lower case with no spaces (e.g. `kelas-ci-aminah`).

### Steps
1. **Create an empty project on GitLab.** Sign in to GitLab KKM → **New project** → **Create blank project**:
   - *Project name:* `kelas-ci-<nama>`
   - *Project URL:* your own namespace (your username)
   - *Visibility Level:* **Private**
   - **Untick** *Initialize repository with a README* (the project must be empty)

   Click **Create project**. GitLab shows the page *"The repository for this project is empty"* with an HTTPS URL like `https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git` — copy that URL.
2. **Add the trainer.** *Project information → Members → Invite members* → the trainer's username, role **Reporter** → *Invite*. The trainer can see your code but cannot push.
3. **Git identity (once per laptop).** In Git Bash, use the name and email of your GitLab KKM account:
   ```bash
   git config --global user.name "Nama Penuh Anda"
   git config --global user.email "emel-anda@moh.gov.my"
   git config --global init.defaultBranch main
   git config --global --list | grep -E "user|init"
   ```
4. **Create a new CI4 project:**
   ```bash
   mkdir -p ~/latihan && cd ~/latihan
   composer create-project codeigniter4/appstarter kelas-ci-<nama>
   cd kelas-ci-<nama>
   php spark --version
   ```
   Replace `<nama>` with your name (don't type `<` `>` — in Git Bash they mean redirect).
5. **Development mode.** `cp env .env`, open `.env` in VS Code (`code .`), remove the `#` and set `CI_ENVIRONMENT = development`. Run `php spark serve` and open <http://localhost:8080> — the *Welcome to CodeIgniter* page with the Debug Toolbar icon in the bottom-right corner. Stop the server (`Ctrl+C`).
6. **LF line endings for everyone.** Create two files at the project root in VS Code (*File → New File*), **before** the first commit, so Windows does not turn line endings into CRLF. `.gitattributes`:
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
   `.editorconfig`:
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
7. **First commit and push** (GitLab's "Push an existing folder" commands, with your URL):
   ```bash
   git init --initial-branch=main
   git remote add origin https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git
   git status --short | grep -E "env|vendor"
   git add .
   git commit -m "SETUP: projek CI4 appstarter"
   git push -u origin main
   ```
   `git status` shows only `?? env` — `.env` (secrets) and `vendor/` (Composer packages) are ignored by the appstarter's `.gitignore`. On the first push, **Git Credential Manager** opens a sign-in window: sign in with your GitLab KKM account. Password refused? Create a *Personal Access Token* (avatar → *Edit profile → Access Tokens*, scope `write_repository`) and use the token as the password.
8. **Check on GitLab.** Reload the project page: `app/`, `public/`, `spark`, `composer.json` are visible; there is **no** `.env` and **no** `vendor/`. Copy the project URL to wherever the trainer asks (e.g. the class list).

### ✅ Checkpoint
- [ ] Project `kelas-ci-<nama>` exists on GitLab KKM, **Private**, with the trainer added as Reporter.
- [ ] `php spark serve` shows *Welcome to CodeIgniter* with the Debug Toolbar (`CI_ENVIRONMENT = development`).
- [ ] The GitLab page shows the commit `SETUP: projek CI4 appstarter`; `.env` and `vendor/` are not in the repo (Quiz day).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `! [rejected] main -> main (fetch first)` | The GitLab project was created **with** a README | Delete and recreate the project without a README, or `git pull --rebase origin main` first |
| `remote: HTTP Basic: Access denied` | Password refused (SSO/2FA) or old stored credentials | Use a Personal Access Token as the password; delete old credentials: Windows → *Credential Manager → Windows Credentials* → `git:https://<gitlab-kkm>` |
| `fatal: remote origin already exists` | `git remote add` ran twice | `git remote set-url origin <url-betul>` |
| `.env` is visible on GitLab | `.env` was created before `.gitignore` or forced with `git add -f` | `git rm --cached .env`, commit, push; change any password inside it |
| `error: src refspec main does not match any` | No commit yet | Run `git add .` and `git commit` first |
| `SSL certificate problem` | KKM network proxy/certificate | Report to the trainer; **don't** turn off `http.sslVerify` ([`persediaan.md`](../docs/persediaan.md)) |

### ⭐ Bonus challenge
Add a short `README.md` (your name, how to run it: `composer install`, `cp env .env`, `php spark serve`), commit `DOCS: README projek` and push. See GitLab show it on the project's main page.

---

## Lab 2.3 — Route, controller & layout view (S3)

### 🎯 Objective
Build the MVC flow in `kelas-ci-<nama>`: route → controller → view, a route with a parameter, a shared layout view, and reading the `php spark routes` table. Every step is committed and pushed to GitLab.

### Prerequisites
- [Lab 2.2](#lab-22--your-ci-project-on-gitlab-s2) done: the first commit is visible on GitLab.
- Two Git Bash terminals in `~/latihan/kelas-ci-<nama>`: one for `php spark serve`, one for Git.

> 🔍 **Proof of work:** the platform ticks this lab's checkpoints when you **pass the Day quiz** — its questions can only be answered by running the code. The trainer also opens your GitLab repo at random.

### Steps
1. **First route → controller → view.** Add to `app/Config/Routes.php`:
   ```php
   $routes->get('hello', 'Hello::index');
   ```
   Create `app/Controllers/Hello.php`:
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
   Create `app/Views/hello.php`:
   ```php
   <h1>Hello, <?= esc($nama) ?>!</h1>
   ```
   Run `php spark serve` and open <http://localhost:8080/hello>. Open the *Routes* and *Views* tabs in the Debug Toolbar: the request goes through `Routes.php` → `Hello::index` → `hello.php`.
2. Commit and push:
   ```bash
   git add . && git commit -m "CI-ASAS: route /hello" && git push
   ```
3. **Route with a parameter.** Add below the `hello` route:
   ```php
   $routes->get('hello/(:segment)', 'Hello::sapa/$1');
   ```
   Add a second method to `Hello`:
   ```php
   public function sapa(string $nama): string
   {
       return view('hello', ['nama' => $nama]);
   }
   ```
   Open <http://localhost:8080/hello/Ali>, <http://localhost:8080/hello/Ali%20Bakar> and <http://localhost:8080/hello/Ali/Bakar>. Note what happens for each one.
4. **Try dangerous input.** Type `http://localhost:8080/hello/<b>Ali</b>` in the address bar. Note the **status code and message** — a Day quiz question.
5. **Read the route table:**
   ```bash
   php spark routes
   ```
   Find the `Hello::sapa/$1` row. Note the **Route** column — CI turns `(:segment)` into the real regex.
6. **Layout view.** Create `app/Views/layout.php`:
   ```php
   <!doctype html>
   <html lang="ms">
   <head>
       <meta charset="utf-8">
       <title><?= esc($tajuk ?? 'CI4 Asas') ?></title>
   </head>
   <body>
       <nav><a href="<?= site_url('hello') ?>">Hello</a></nav>
       <main>
           <?= $this->renderSection('content') ?>
       </main>
   </body>
   </html>
   ```
   Change `app/Views/hello.php` to use the layout:
   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Hello, <?= esc($nama) ?>!</h1>
   <?= $this->endSection() ?>
   ```
   Reload `/hello` and `/hello/Ali`: both pages now have a **Hello** link at the top. One layout, many views.
7. Commit and push:
   ```bash
   git add . && git commit -m "CI-ASAS: route berparameter + layout" && git push
   git log --oneline
   ```

### ✅ Checkpoint
- [ ] `/hello/Ali` shows "Hello, Ali!" through `Hello::sapa` and `layout.php` (Quiz day).
- [ ] `php spark routes` was run and the Route column for `Hello::sapa/$1` noted (Quiz day).
- [ ] GitLab shows 3 commits (`SETUP:` + 2 `CI-ASAS:`) (Quiz day).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `/hello` → *404 Can't find a route* | Route not saved or class name misspelt | Save `Routes.php`; the file name `Hello.php` must match the class name; check `php spark routes` |
| *Too few arguments to function Hello::sapa()* | Route without `/$1` | Write `'Hello::sapa/$1'` |
| Blank page after switching to the layout | `section('content')` does not match `renderSection('content')` | Use the same name in both files |
| `git push` → *no upstream branch* | First push without `-u` | `git push -u origin main` once |

### ⭐ Bonus challenge
Pass `'tajuk' => 'Sapa ' . $nama` from `sapa()` and watch the tab title change. Why can the layout read `$tajuk` even though it was only passed to `hello`?

---

## Lab 2.4 — Form, validation & CSRF (S4)

### 🎯 Objective
Build a `/daftar` form in `kelas-ci-<nama>` with server validation, a flash message (PRG) and CSRF — the same pattern the Day 5 TLK booking form uses.

### Prerequisites
- [Lab 2.3](#lab-23--route-controller--layout-view-s3) done: `layout.php` exists and GitLab shows 3 commits.
- ±45 minutes. The platform ticks this lab's checkpoints when you **pass the Day quiz**.

### Steps
1. **GET and POST routes** in `app/Config/Routes.php`:
   ```php
   $routes->get('daftar', 'Daftar::index');
   $routes->post('daftar', 'Daftar::simpan');
   ```
2. **Controller** `app/Controllers/Daftar.php`:
   ```php
   <?php

   namespace App\Controllers;

   use CodeIgniter\HTTP\RedirectResponse;

   class Daftar extends BaseController
   {
       protected $helpers = ['form'];

       public function index(): string
       {
           return view('daftar');
       }

       public function simpan(): RedirectResponse
       {
           $rules = [
               'nama' => ['label' => 'Nama', 'rules' => 'required|min_length[3]|max_length[100]'],
               'emel' => ['label' => 'E-mel', 'rules' => 'required|valid_email'],
               'nokp' => ['label' => 'No. KP', 'rules' => 'required|exact_length[12]|numeric'],
           ];

           if (! $this->validate($rules)) {
               return redirect()->to('daftar')->withInput();
           }

           $data = $this->validator->getValidated();

           return redirect()->to('daftar')->with('berjaya', 'Pendaftaran ' . $data['nama'] . ' diterima.');
       }
   }
   ```
   `$helpers = ['form']` is required: without it, `validation_show_error()` in the view gives *Call to undefined function*.
3. **View** `app/Views/daftar.php`:
   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Daftar peserta</h1>

   <?php if (session()->getFlashdata('berjaya')): ?>
       <p class="berjaya"><?= esc(session()->getFlashdata('berjaya')) ?></p>
   <?php endif ?>

   <form method="post" action="<?= site_url('daftar') ?>">
       <?= csrf_field() ?>

       <label for="nama">Nama</label>
       <input id="nama" name="nama" value="<?= esc(old('nama')) ?>">
       <?= validation_show_error('nama') ?>

       <label for="emel">E-mel</label>
       <input id="emel" name="emel" type="email" value="<?= esc(old('emel')) ?>">
       <?= validation_show_error('emel') ?>

       <label for="nokp">No. KP</label>
       <input id="nokp" name="nokp" inputmode="numeric" value="<?= esc(old('nokp')) ?>">
       <?= validation_show_error('nokp') ?>

       <button type="submit">Hantar</button>
   </form>
   <?= $this->endSection() ?>
   ```
4. **Test validation.** Open <http://localhost:8080/daftar>. Submit with an **empty** Nama, E-mel `x` and No. KP `123`. Note the **exact** error message under Nama — this is a Day quiz question. Notice that the E-mel and No. KP you typed stay in the form (`old()`).
5. **Test success.** Fill in synthetic data (Nama `Aminah`, E-mel `aminah@latihan.test`, No. KP `900101010001`) and submit. The message "Pendaftaran Aminah diterima." appears once; reload (F5) — the message is gone and the browser does **not** ask "resubmit the form?". That is PRG (Post/Redirect/Get) + flash.
6. **Turn on CSRF globally.** In `app/Config/Filters.php`, `$globals['before']`, remove the `//` in front of `'csrf'`:
   ```php
   public array $globals = [
       'before' => [
           // 'honeypot',
           'csrf',
           // 'invalidchars',
       ],
   ```
   Run `php spark routes` — the **Before Filters** column for `daftar` now shows `csrf`.
7. **Prove CSRF works.** In `daftar.php`, comment out `<?= csrf_field() ?>` for now (`<?php // csrf_field() ?>`), reload `/daftar` and submit a valid form. Note the **status code and message** — a Day quiz question. Restore `<?= csrf_field() ?>` and submit again: it works.
8. Commit:
   ```bash
   git add . && git commit -m "CI-ASAS: borang daftar + validation + CSRF" && git push
   git log --oneline
   ```

### ✅ Checkpoint
- [ ] An empty form shows the Nama, E-mel and No. KP error messages, and the typed values stay (Quiz day).
- [ ] A valid submit shows the flash "Pendaftaran … diterima." only once; F5 does not resubmit (Quiz day).
- [ ] Global CSRF is on: without `csrf_field()` the form is refused with 403; GitLab shows 4 commits (Quiz day).

> ⏱️ No time? Finish before 08:30 on Day 3 — Day 3 starts with a database for this form.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| *Call to undefined function validation_show_error()* | Form helper not loaded | `protected $helpers = ['form'];` in `Daftar` |
| Validation errors do not show after submitting | `withInput()` missing on the redirect | `return redirect()->to('daftar')->withInput();` |
| A valid form still gives *The action you requested is not allowed.* | `csrf_field()` still commented out from step 7 | Restore `<?= csrf_field() ?>`, reload `/daftar`, submit again |
| Redirect to `localhost:8080/index.php/...` while the server runs on another port | `app.baseURL` in `.env` does not match the port | Use port 8080, or set `app.baseURL = 'http://localhost:8081/'` |

### ⭐ Bonus challenge
Add an optional **Telefon** field: rule `permit_empty|numeric|max_length[11]`, label `Telefon`, `old('telefon')` and `validation_show_error('telefon')` in the view. Submit with Telefon empty (passes) and with `01-234` (fails). What happens if you remove `permit_empty` from the rule?

---

## Self-check — end of day

```bash
cd ~/latihan/kelas-ci-<nama>
git status          # nothing to commit, working tree clean
git log --oneline   # 4 commit: SETUP + 3 CI-ASAS
php spark routes    # hello, hello/([^/]+), daftar (GET & POST)
```
