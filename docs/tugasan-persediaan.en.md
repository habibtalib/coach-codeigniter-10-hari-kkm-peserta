# Preparation Assignment — Self-Study (Optional)

[📅 Schedule](../JADUAL.md) · [📘 SPEC canon](spesifikasi-sistem.md) · [📖 Day 3](../hari-3/README.md) · [🤝 COLLABORATION](kolaborasi.md)

| Item | Value |
|---------|-------|
| Status | **Optional** — self-study, not submitted and not marked |
| When | Any time: before the course, the evenings of Days 2–3, or while you wait |
| Work | Individual, on your own laptop |
| Estimated time | T1: 15 minutes · T2: 2–3 hours |
| Link to the course | The required work happens in your `kelas-ci-<nama>` project ([Day 2 Lab 2.2](../hari-2/lab.md#lab-22--projek-ci-anda-di-gitlab-s2) onward). Day 4 S1 does **not** review this page |

## 🎯 Why this assignment

From Day 2 you build your own application in `kelas-ci-<nama>`: route → controller → view (Lab 2.3), a form (Lab 2.4), the database and models (Day 3). This page gives two extra exercises for anyone who wants more time:

1. Make sure your laptop is **ready** before class (T1).
2. See the **Route → Controller → Model → View** flow once more in a separate project, following the official CI4 tutorial (T2).

> 📚 The old tasks T3 (refine the ERD) and T4 (acceptance criteria) have been removed. A finished ERD is in [`erd-rujukan.md`](./erd-rujukan.md); the original ERD, data dictionary and AC material is now optional reading in [`rujukan-keperluan.md`](./rujukan-keperluan.md).

---

## T1 — Check the environment

### Checklist

| # | Software | Minimum version | Check with | Notes |
|---|----------|---------------|--------------|------|
| 1 | PHP | **8.2** | `php -v` | Windows: **Laragon** ([`persediaan.md`](./persediaan.md) §2) · macOS: Homebrew or Laravel Herd · Linux: package `php8.2` |
| 2 | PHP extensions | `intl`, `mbstring`, `mysqlnd`/`mysqli`, `curl`, `json`, `fileinfo`, `gd`, `zip`, `xml`, `dom` | `php -m` | `intl` and `mbstring` are **required** for CI4; `fileinfo` for the upload MIME check (BR-PAS-02); `gd`, `zip`, `xml` for PhpSpreadsheet/Dompdf (Day 9) |
| 3 | Composer | **2.x** | `composer -V` | <https://getcomposer.org/download/> |
| 4 | MySQL / MariaDB | **MySQL 8** or **MariaDB 10.6+** | `mysql --version` | Windows: Laragon's MySQL 8.4. XAMPP (MariaDB 10.4) is too old — uninstall it. Remember the root user name & password — **do not** commit them |
| 5 | Git | 2.x | `git --version` | Set `git config --global user.name` and `user.email` |
| 6 | Editor | VS Code (recommended) | — | Extensions: *PHP Intelephense*, *Markdown Preview Mermaid Support* |
| 7 | DB client (optional) | HeidiSQL / DBeaver (phpMyAdmin needs Laragon's Apache) | — | To view tables |
| 8 | Terminal (Windows) | **Git Bash** as the VS Code default terminal | `echo $SHELL` → `/usr/bin/bash` | *Terminal: Select Default Profile → Git Bash* ([`persediaan.md`](./persediaan.md) §5). Every course `bash` command runs here |

### Verification steps

```bash
php -v
php -m
composer -V
mysql --version
git --version
```

**macOS / Linux / Windows Git Bash** — check the extensions in one go:
```bash
for e in intl mbstring mysqli mysqlnd curl json fileinfo gd zip xml dom; do
  php -m | grep -qi "^$e$" && echo "OK    $e" || echo "TIADA $e"
done
```

**If you are not in Git Bash (PowerShell)**:
```powershell
"intl","mbstring","mysqli","mysqlnd","curl","json","fileinfo","gd","zip","xml","dom" | ForEach-Object {
  if (php -m | Select-String -Pattern "^$_$" -Quiet) { "OK    $_" } else { "TIADA $_" }
}
```

> 💡 **Windows tip:** If `intl` shows TIADA (missing), open `php.ini` (Laragon: *Menu → PHP → php.ini*; or location: `php --ini`), find `;extension=intl`, remove the `;`, save, then close and reopen the terminal.

### Result

Every line shows `OK` and all five commands print a version. Any `TIADA` (missing) or an error? Fix it with [`persediaan.md`](./persediaan.md) or tell the trainer **before** Day 2 S2 — Lab 2.2 needs working PHP, Composer and Git.

---

## T2 — Official CI4 tutorial: *Build Your First Application*

Reference: <https://codeigniter.com/user_guide/tutorial/index.html>

You will build a small **news** application that uses the same patterns as the TLK (Special Vehicle Parking)/Pass system: route → controller → model → view, a form with validation, and CSRF.

### Tutorial parts

| # | Tutorial part | Visible result |
|---|-------------------|--------------------------|
| 2a | Project setup (`composer create-project codeigniter4/appstarter ci-news`) + `.env` | `php spark serve` → CI4 welcome page at `http://localhost:8080` |
| 2b | **Static Pages** — controller `Pages`, views `templates/header.php`, `templates/footer.php`, `pages/home.php`, `pages/about.php` | `http://localhost:8080/home` and `/about` are displayed with header & footer |
| 2c | **News Section** — table `news`, `NewsModel`, controller `News` (`index`, `show`) | `/news` lists the news; `/news/<slug>` shows one news item |
| 2d | **Create News Items** — form `news/new`, `create()` with validation, `url_title()` for the slug | Form at `/news/new`; validation errors shown when a field is empty; the new item appears at `/news` |

### Setup notes

1. Create the database:
   ```sql
   CREATE DATABASE ci4tutorial CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   ```
2. Copy `env` to `.env` and set (example values — use your own password):
   ```ini
   CI_ENVIRONMENT = development

   database.default.hostname = localhost
   database.default.database = ci4tutorial
   database.default.username = root
   database.default.password =
   database.default.DBDriver = MySQLi
   ```
3. **Synthetic data only** for the news (e.g. "Latihan CI4 Hari 1", "Ujian slug berita"). No real names or real news.
4. If you use Git for `ci-news`, make sure `.env` is **not** committed (`git check-ignore .env` must print `.env`).
5. Build `ci-news` in a **separate** folder (e.g. `~/latihan/ci-news`), not inside `kelas-ci-<nama>`. Do not push `ci-news` to your course repo.

### Reflection questions (for yourself, 3–5 sentences each)

1. Trace one request to `/news/latihan-ci4`: which files are called, in what order? (Routes → … → View)
2. What does `$allowedFields` do in `NewsModel`? What would happen without it?
3. Why does the tutorial call `esc()` in the view?
4. The `news/new` form contains `csrf_field()`. What does CSRF prevent?
5. In the TLK system, what corresponds to `News`, `NewsModel` and the `news` table? (Hint: SPEC §5.)

Compare your answers with the code in `kelas-ci-<nama>`: `Hello` and `Daftar` (Day 2), `DepartmentModel` and `Jabatan` (Day 3) use the same patterns.

> ⚠️ **AI discipline (COLLABORATION §3):** AI is allowed for **explaining errors**. Do not ask AI to generate the whole tutorial. Test yourself: pick one random line in `News.php` or `NewsModel.php` — can you explain it without help?

---

## 🧯 Troubleshooting

| Symptom | Cause | Solution |
|--------|-------|--------------|
| `Class "Locale" not found` / `intl` error | The `intl` extension is not enabled | Enable `extension=intl` in `php.ini`; reopen the terminal |
| `composer: command not found` | Composer is not in PATH | Reinstall with the official installer; Laragon: *Menu → Tools → Path → Add Laragon to Path*, then reopen VS Code |
| `Unable to connect to the database` | Wrong `.env` or MySQL not running | Check `database.default.*`; start the MySQL service; try `mysql -u root -p` |
| The `/news` page shows "Whoops!" with no details | `CI_ENVIRONMENT` is not `development` | Set `CI_ENVIRONMENT = development` in `.env` |
| `404 - Can't find a route for 'GET: news'` | Route not added / wrong order | Check `app/Config/Routes.php`; the `news` route must come before the `(:segment)` pages route |
| Submitting the form → "The action you requested is not allowed" | CSRF token missing/expired | Make sure `<?= csrf_field() ?>` is in the form; reload the page |
| Port 8080 already in use | Another application | `php spark serve --port 8081` and `app.baseURL = 'http://localhost:8081/'` in `.env` |
| Composer: `curl error 60` / `unable to get local issuer certificate`, or very slow / *timeout* | Office SSL inspection; Windows Defender scanning `vendor/` | [`persediaan.md`](./persediaan.md) §3 (*Office network with SSL inspection*) and §8 (Defender/antivirus row) |

---

## ❓ Questions?

Ask the trainer through the course group. If your environment fails, say so as early as possible — do not wait until Lab 2.2.
