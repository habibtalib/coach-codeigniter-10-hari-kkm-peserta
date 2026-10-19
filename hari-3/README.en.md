# Day 3 — Database, Migrations, Models & Search

[📅 Schedule](../JADUAL.md) · [📘 Specification](../docs/spesifikasi-sistem.md) · [🧪 Day 3 Lab](./lab.md)

> Yesterday the `kelas-ci-<nama>` project got routes, views and a form. Today it gets a **database**: tables are created with migrations (not clicks in HeidiSQL), synthetic data is filled with seeders, and pages read and write data through a **model**. The table design is already done in [`erd-rujukan.md`](../docs/erd-rujukan.md) — you go straight to writing code.

---

## 🎯 Learning Objectives

By the end of today, participants can:

| # | Objective (measurable) | Session | Evidence |
|---|------------------------|------|-------|
| O1 | **Create** development & test databases with a dedicated user, and **connect** the project through `.env` | S1 | [Lab 3.1](./lab.en.md#lab-31--mysql-database--env-s1); `php spark db:table --show` |
| O2 | **Write** the `departments` and `parking_zones` migrations exactly as in specification §3, and **test** `migrate` / `rollback` | S2 | [Lab 3.2](./lab.en.md#lab-32--first-migrations--seeders-s2); `php spark migrate:status` |
| O3 | **Write** idempotent seeders that can run again and again with no duplicate rows | S2 | `departments` = 4 rows after two runs |
| O4 | **Build** a model with `$allowedFields`, `$useTimestamps` and validation, plus a list page and a new-record form | S3 | [Lab 3.3](./lab.en.md#lab-33--model--the-jabatan-pages-s3); `/jabatan` |
| O5 | **Build** a Query Builder search (`like()` in a group) with pagination on your own | S4 | [Lab 3.4](./lab.en.md#lab-34--zone-search--pagination-s4); `/zon?q=`; Quiz S4 passed |

---

## 📅 Today's Schedule

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 2 recap | — |
| 09:00–10:30 | S1 | MySQL database & `.env` | Create the databases & the `kkm_dev` user; connect the project |
| 10:30–10:45 | — | Morning break | — |
| 10:45–12:30 | S2 | First migrations & seeders | Write the `departments` & `parking_zones` migrations; idempotent seeders |
| 12:30–14:30 | — | Lunch | — |
| 14:30–16:00 | S3 | Model & the `/jabatan` pages | Build a model with validation; list & new form |
| 16:00–17:00 | S4 | `/zon` search & pagination; wrap-up | Build a Query Builder search & pagination on your own |

---

## 🧭 Why today matters

Every module on Days 5–10 (TLK, Pass, Report, Statistics) is **a model + controller + view on top of a table**. Today you build that pattern once, end to end, on small tables, so Days 4 to 10 only repeat the same pattern on bigger tables.

- **Migrations, not clicks:** the database structure is code — committed, reviewed and rebuildable on any laptop with `php spark migrate`.
- **Idempotent seeders:** training data can be refilled at any time with no `Duplicate entry`.
- **The model guards the door:** `$allowedFields` and validation in the model protect every form that uses it.

```mermaid
flowchart LR
    M["Migration<br/>CreateDepartmentsTable"] --> DB[("MySQL<br/>kkm_latihan")]
    S["Seeder<br/>DepartmentSeeder"] --> DB
    DB --> MD["DepartmentModel<br/>allowedFields + validation"]
    MD --> C["Jabatan controller"]
    C --> V["View + layout"]
```

---

## S1 — MySQL Database & `.env` (09:00–10:30)

### 1.1 Two databases, one user

| Database | Use | Who writes it |
|----------|------|---------------|
| `kkm_latihan` | Development — `php spark serve`, migrations, seeders | You |
| `kkm_latihan_test` | PHPUnit tests (Day 6) — tables are dropped & recreated every time the tests run | `composer test` |

The `kkm_dev` user only has rights on these two databases. `root` never goes into `.env`: if the password in `.env` leaks, the damage is limited to the training databases.

### 1.2 From `.env` to a connection

`.env` sets `database.default.*`. CI4 reads those values into `Config\Database::$default` when a request starts. `php spark db:table --show` is the fastest connection test: *Database has no tables!* means the connection worked and the database is still empty.

Lab: [Lab 3.1](./lab.en.md#lab-31--mysql-database--env-s1).

### 🎯 Quiz S1

> Answer after Lab 3.1 on your laptop — the answers come from real output. Passing this quiz ticks the Lab 3.1 checkpoints.

1. Lab 3.1 step 4: what does `php spark db:table --show` print for your new database?
   - [ ] An empty list with no message
   - [x] *Database has no tables!*
   - [ ] *Unable to connect to the database.*
   - [ ] One `migrations` table
   > The new database has no tables yet. The `migrations` table is only created by the first `migrate` (Lab 3.2). *Unable to connect* means a `.env` value is wrong.

2. Lab 3.1 step 5: what does `git check-ignore -v .env` print?
   - [ ] Nothing — `.env` is not ignored
   - [x] One line `.gitignore:<line number>:.env` followed by the file name `.env`
   - [ ] `fatal: not a git repository`
   - [ ] `.env` listed as *modified*
   > `-v` shows the file, line number and pattern that ignores `.env` (new CI4 project: `.gitignore:44:.env`). No output means `.env` could be committed along with the database password.

---

## S2 — First Migrations & Seeders (10:45–12:30)

### 2.1 Migrations = the history of the database structure

| Command | What happens |
|--------|------------------|
| `php spark make:migration CreateDepartmentsTable` | Creates a timestamped file in `app/Database/Migrations/` |
| `php spark migrate` | Runs `up()` of every migration not yet run, and records it in the `migrations` table |
| `php spark migrate:status` | Lists migrations, the *Migrated On* date and the **Batch** |
| `php spark migrate:rollback` | Runs `down()` for the last batch |

CI creates the `migrations` table itself on the first `migrate` — that is why `db:table --show` shows one table more than you wrote.

### 2.2 Idempotent seeders

A plain `insertBatch()` fails on the second run (*Duplicate entry*) because `code` is UNIQUE. `ignore(true)` turns it into `INSERT IGNORE`: rows that already exist are skipped. A seeder that is safe to run again and again is called **idempotent**.

Tables & fields: [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 · ERD: [`erd-rujukan.md`](../docs/erd-rujukan.md) · Notes: [`nota-02-migration-seeder-dan-query-builder.md`](../docs/nota-02-migration-seeder-dan-query-builder.md).

Lab: [Lab 3.2](./lab.en.md#lab-32--first-migrations--seeders-s2).

### 🎯 Quiz S2

> Answer after Lab 3.2 on your laptop — the answers come from real output. Passing this quiz ticks the Lab 3.2 checkpoints.

1. After the first `php spark migrate` in Lab 3.2 (step 4), how many tables does `php spark db:table --show` list?
   - [ ] 2 — `departments` and `parking_zones`
   - [ ] 0 — tables only appear after the seeder runs
   - [x] 3 — `departments`, `migrations` and `parking_zones`
   - [ ] 4 — including Shield's `users` table
   > CI creates the `migrations` table on the first `migrate` to record which migrations have run. Shield is not installed yet (Day 4), so there is no `users`.

2. In Lab 3.2 step 4 you ran `migrate`, `migrate:rollback`, then `migrate` again. What is the **Batch** value in the last `migrate:status`?
   - [x] 1
   - [ ] 2
   - [ ] 3
   - [ ] Empty — rollback deletes the migration history
   > Rollback deletes the batch 1 rows from the `migrations` table. The next `migrate` becomes the batch after the highest one still there — there is none, so it is batch 1 again.

---

## S3 — Model & the `/jabatan` Pages (14:30–16:00)

### 3.1 What a model gives you

| Property | Effect |
|-------|-------|
| `$table` | The table that is read/written |
| `$allowedFields` | Only these fields are accepted by `insert()`/`update()` — other fields (e.g. a forged `id`) are ignored |
| `$useTimestamps` | `created_at` & `updated_at` are filled automatically |
| `$validationRules` | Checked on every `insert()`/`update()`; failure → `false` + `errors()` |

### 3.2 Validation in the model vs the controller

Lab 2.4 checked the form in the controller (`$this->validate()`). From today, data rules live in the **model**, so every form, seeder and service that writes to `departments` goes through the same rules. The controller only calls `insert()` and sends `errors()` back to the form.

Notes: [`nota-03-model-entity-dan-enum.md`](../docs/nota-03-model-entity-dan-enum.md) · [`nota-04-validasi-dan-borang.md`](../docs/nota-04-validasi-dan-borang.md).

Lab: [Lab 3.3](./lab.en.md#lab-33--model--the-jabatan-pages-s3).

### 🎯 Quiz S3

> Answer after Lab 3.3 on your laptop — the answers come from real output. Passing this quiz ticks the Lab 3.3 checkpoints.

1. You submit the `/jabatan/baharu` form with Kod `BTM` (it already exists). What message appears under the Kod field?
   - [ ] *Duplicate entry 'BTM' for key 'code'*
   - [ ] *Kod BTM sudah wujud.*
   - [ ] No message; a second record is saved
   - [x] *The Kod field must contain a unique value.*
   > `is_unique[departments.code,id,{id}]` in the model's `$validationRules` refuses the code before the `INSERT` query runs, so MySQL never sees a duplicate row. The `label` `Kod` replaces the field name `code` in the message.

2. On `/jabatan` (sorted with `orderBy('code')`), which department is in the first row?
   - [ ] `BTM` — Bahagian Teknologi Maklumat (Latihan), because it was inserted first
   - [x] `BKW` — Bahagian Kewangan (Latihan)
   - [ ] `BPA` — Bahagian Pengurusan Aset (Latihan)
   - [ ] `BSM` — Bahagian Sumber Manusia (Latihan)
   > `orderBy('code')` sorts by code alphabetically: `BKW` < `BPA` < `BSM` < `BTM`. Without `orderBy`, the order depends on the database and is usually by `id`.

---

## S4 — `/zon` Search & Pagination (16:00–17:00)

### 4.1 Searching with the Query Builder

```php
$this->groupStart()
    ->like('name', $q)
    ->orLike('location', $q)
    ->orLike('code', $q)
    ->groupEnd();
```

`groupStart()`/`groupEnd()` wrap the `OR`s in brackets so other conditions (e.g. `is_active = 1` later) are not cancelled. The Query Builder escapes the value of `$q`, so input like `' OR 1=1 --` is searched as plain text — not run as SQL.

### 4.2 Pagination

`$model->paginate(2)` fetches 2 rows for the current page (`?page=`), and `$model->pager->links()` prints page links that keep the other query-string values (`?q=`). The search uses `GET`, not `POST`, so results can be bookmarked and pagination works.

Lab: [Lab 3.4](./lab.en.md#lab-34--zone-search--pagination-s4).

### 🎯 Quiz S4

> Answer after Lab 3.4 on your laptop — the answers come from real output. Passing this quiz ticks the Lab 3.4 checkpoints.

1. You open `/zon?q=KLINIK` (capital letters) in Lab 3.4. What is shown?
   - [ ] *Tiada zon sepadan dengan "KLINIK".* because the search is case-sensitive
   - [x] Only zone **B — Blok Klinik**
   - [ ] All three zones because `like()` always matches every row
   - [ ] An SQL error because `q` is not escaped
   > The database was created with the collation `utf8mb4_unicode_ci` — `ci` = *case-insensitive*, so `LIKE '%KLINIK%'` matches "Blok Klinik" and "Sebelah klinik pakar".

2. You type `' OR 1=1 --` in the `/zon` search box. What is shown?
   - [x] *Tiada zon sepadan dengan "' OR 1=1 --".*
   - [ ] Every zone — the `OR 1=1` condition is always true
   - [ ] Error 500 *You have an error in your SQL syntax*
   - [ ] Error 403 from the CSRF filter
   > The Query Builder escapes the value in `like()`, so that input is searched as plain text. No zone contains that text. A `GET` form does not go through CSRF.

---

## 📦 Deliverables — Today's Output

- [ ] Databases `kkm_latihan` + `kkm_latihan_test` with the `kkm_dev` user; `.env` connected (not committed)
- [ ] Migrations `CreateDepartmentsTable` + `CreateParkingZonesTable`; idempotent seeders
- [ ] `DepartmentModel` + `/jabatan` (list & new form with model validation)
- [ ] `ParkingZoneModel` + `/zon` (`?q=` search & pagination)
- [ ] GitLab shows the `DB:`, `JABATAN:` and `ZON:` commits

---

## 🧠 Self-check

1. Why is the database structure written as migrations, not created in HeidiSQL?
   <details><summary>Answer</summary>Migrations are code: committed to Git, reviewed in an MR, and able to rebuild the same database on any laptop or server with <code>php spark migrate</code>. Clicks in HeidiSQL leave no history.</details>

2. What makes `DepartmentSeeder` safe to run twice?
   <details><summary>Answer</summary><code>ignore(true)</code> turns the query into <code>INSERT IGNORE</code>; rows whose <code>code</code> already exists (UNIQUE) are skipped, so there is no <em>Duplicate entry</em>.</details>

3. Someone sends a POST to `/jabatan` with an extra field `id=99`. What happens?
   <details><summary>Answer</summary><code>id</code> is not in <code>$allowedFields</code>, so the model ignores it. The new record gets its <code>id</code> from AUTO_INCREMENT.</details>

4. Why does validation live in the model, not the controller, from today?
   <details><summary>Answer</summary>All code that writes to the table (forms, seeders, services) goes through the same rules. The controller stays thin: call <code>insert()</code>, send <code>errors()</code> back to the form.</details>

5. Why does the `/zon` search use `GET` and not `POST`?
   <details><summary>Answer</summary><code>?q=</code> stays in the URL: the pagination links carry it, results can be bookmarked or shared, and F5 does not ask to resend a form. A search does not change data, so <code>GET</code> fits.</details>

---

## ➡️ Preparation for tomorrow

- Make sure GitLab shows the `DB:`, `JABATAN:` and `ZON:` commits; finish Labs 3.3–3.4 if not yet done.
- Day 4 installs **Shield** (login & roles), a Bootstrap layout and the remaining 8 tables of specification §3 in the same project.
- Read specification §4 (roles `applicant`, `reviewer`, `approver`, `admin`) and [`erd-rujukan.md`](../docs/erd-rujukan.md).
