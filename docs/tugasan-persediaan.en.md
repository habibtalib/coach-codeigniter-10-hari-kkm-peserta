# Preparation Assignment — Before Day 4

[📅 Schedule](../JADUAL.md) · [📘 SPEC canon](../SPEC-KURSUS.md) · [📖 Day 3](../hari-3/README.md) · [🤝 COLLABORATION](../KOLABORASI.md)

| Item | Value |
|---------|-------|
| Handed out | Day 3, S4 (16:00–17:00) |
| Deadline | **Day 4, 08:30** |
| Reviewed | Day 4, S1 (09:00–10:30) — 3-minute demo per pair + random questions |
| Work | Task **T1** individual (every laptop must work); **T2–T4** in pairs |
| Estimated time | 4–6 hours |
| Marks | 100 (see the [Rubric](#scoring-rubric)) — **not an exam**; the aim is to make sure everyone starts Day 4 from the same line |

## 🎯 Why this assignment

Day 4 S2 goes straight into creating a real CI4 project, installing Shield and writing migrations from your ERD. If your environment does not work, or you have never seen the **Route → Controller → Model → View** flow, you will fall behind for the whole of Phase B. This assignment makes sure that:

1. Your laptop is **ready** (T1).
2. You have already seen CI4 working end to end once (T2).
3. Your design (ERD) and requirements (AC) are **ready** to be turned into code (T3, T4).

---

## T1 — Install the environment (individual)

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

### Evidence

Save the output of all five commands + the extension check to `docs/tugasan/T1-persekitaran.txt` in your pair's documentation repo (one file per member: `T1-persekitaran-<nama>.txt`).

---

## T2 — Official CI4 tutorial: *Build Your First Application*

Reference: <https://codeigniter.com/user_guide/tutorial/index.html>

You will build a small **news** application that uses the same patterns as the TLK (Special Vehicle Parking)/Pass system: route → controller → model → view, a form with validation, and CSRF.

### Parts you must complete

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

### Reflection questions (answer in `docs/tugasan/T2-refleksi.md`, 3–5 sentences each)

1. Trace one request to `/news/latihan-ci4`: which files are called, in what order? (Routes → … → View)
2. What does `$allowedFields` do in `NewsModel`? What would happen without it?
3. Why does the tutorial call `esc()` in the view?
4. The `news/new` form contains `csrf_field()`. What does CSRF prevent?
5. In the TLK system, what corresponds to `News`, `NewsModel` and the `news` table? (Hint: SPEC §5.)

### Evidence

- Screenshots in `docs/tugasan/`: `T2a-welcome.png`, `T2b-about.png`, `T2c-news-list.png`, `T2d-validation-error.png`, `T2d-news-created.png`
- `docs/tugasan/T2-refleksi.md`
- The `ci-news` project running on your laptop for the Day 4 demo

> ⚠️ **AI discipline (COLLABORATION §3):** AI is allowed for **explaining errors**. Do not ask AI to generate the whole tutorial. On Day 4 the trainer will point to **one random line** in `News.php` or `NewsModel.php` — you must be able to explain it.

---

## T3 — Refine the ERD (in pairs)

### Steps

1. Open `docs/semakan-reka-bentuk.md` (Day 3 Lab 3.4). Make sure **all** items E1–E8 now Pass.
2. Update `docs/erd.md`:
   - Mermaid ERD with 10 tables and 13 relationships, matching SPEC §3.
   - Add a `## Urutan migration` section — list the order in which tables are created so that every FK refers to a table that already exists. State where the extra `users` fields (`full_name`, `staff_no`, `department_id`, `phone`) are added relative to the Shield tables.
   - Add a `## Perubahan sejak Hari 3` section — a list of what changed and why.
3. Update `docs/kamus-data.md` so it is consistent with the ERD.
4. Commit: `SETUP: perhalusi ERD & kamus data untuk migration`.

### Evidence

`docs/erd.md` and `docs/kamus-data.md` updated; a commit dated after Day 3.

---

## T4 — Write 3 new acceptance criteria (in pairs)

Write **3 new ACs** (not copies from Day 2) in `docs/acceptance-criteria.md`, section `## AC Tugasan Persediaan`. Requirements:

| # | Requirement |
|---|--------|
| 1 | One AC for an **FR-TLK** that has no AC yet (e.g. cancellation `approved → cancelled`, expiry, or admin slot CRUD) |
| 2 | One AC for an **FR-PAS** that tests **role access** (e.g. a `reviewer` tries to approve; an `applicant` tries to open `/pas/semakan`) |
| 3 | One **boundary** AC (🟡) for any BR — with an `Contoh:` table of at least 3 rows |

Each AC: ID `AC-…`, Given (concrete data from the *Data ujian asas* (base test data)), one When, an observable Then, FR & BR references.

---

## 📤 How to submit

1. Make sure this structure exists in your pair's documentation repo:
   ```text
   docs/
   ├── erd.md                     # T3
   ├── kamus-data.md              # T3
   ├── acceptance-criteria.md     # T4 (new section)
   └── tugasan/
       ├── T1-persekitaran-<nama1>.txt
       ├── T1-persekitaran-<nama2>.txt
       ├── T2a-welcome.png … T2d-news-created.png
       └── T2-refleksi.md
   ```
2. Commit & tag:
   ```bash
   git add docs/ && git commit -m "SETUP: tugasan persediaan Hari 4"
   git tag tugasan-persediaan
   ```
3. Bring your laptop with `ci-news` ready for `php spark serve`.

---

## Scoring rubric

| Task | Criterion | Excellent | Satisfactory | Needs help | Marks |
|---------|----------|-----------|-----------|---------------|--------|
| **T1** Environment | Versions & extensions | PHP ≥ 8.2, all 11 extensions OK, Composer 2, MySQL 8/MariaDB 10.6+, Git configured (Windows: Git Bash default terminal) — **(20)** | All software present; 1–2 non-required extensions missing (`gd`/`zip`) — **(14)** | PHP < 8.2, or `intl`/`mbstring` missing, or MySQL not running — **(0–7)** | /20 |
| **T2** CI4 tutorial | 2a–2d working | All four work in a live demo; validation & CSRF work — **(20)** | 2a–2c work; 2d partial — **(13)** | Only 2a/2b — **(0–6)** | /20 |
| | Reflection & understanding | 5 questions answered correctly; can explain a random line with confidence — **(20)** | 3–4 questions correct; line explained with a little help — **(13)** | < 3 questions; cannot explain the line — **(0–6)** | /20 |
| **T3** ERD | Accuracy & migration order | ERD 100% matches SPEC §3; migration order correct; changes recorded — **(20)** | 1–2 small errors (field spelling, cardinality); order almost correct — **(13)** | Tables/fields missing or `users.role` still present; no order — **(0–6)** | /20 |
| **T4** AC | Quality of the 3 ACs | 3 ACs meet requirements 1–3; concrete data; one When; observable Then — **(20)** | 3 ACs present; one requirement not met or one vague Then — **(13)** | < 3 ACs or not testable — **(0–6)** | /20 |
| | | | | **Total** | **/100** |

### Interpreting the marks

| Range | Meaning | Day 4 action |
|-------|--------|-----------------|
| 80–100 | Fully ready | May take the ⭐ extra Day 4 challenges |
| 60–79 | Ready with small gaps | Fix the gaps during S2 with help from peers |
| < 60 | Needs support | Environment clinic with the trainer at the start of S2; paired with an "Excellent" participant |

> **T1 and T2a are the entry gate.** If your laptop cannot run `php spark serve` at 09:00 on Day 4, the trainer will help **before** anything else — tell the trainer as early as possible (the evening of Day 3) if you are stuck.

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

Add questions to `docs/soalan-terbuka.md` or contact the trainer through the course group. Do not wait until the morning of Day 4 if your environment fails.
