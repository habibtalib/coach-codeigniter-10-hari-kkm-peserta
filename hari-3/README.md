# Hari 3 — Database, Migration, Model & Carian

[📅 Jadual](../JADUAL.md) · [📘 Spesifikasi](../docs/spesifikasi-sistem.md) · [🧪 Lab Hari 3](./lab.md)

> Semalam projek `kelas-ci-<nama>` mendapat route, view dan borang. Hari ini ia mendapat **database**: jadual dicipta dengan migration (bukan klik dalam HeidiSQL), data sintetik diisi dengan seeder, dan halaman membaca serta menulis data melalui **model**. Reka bentuk jadual sudah siap dalam [`erd-rujukan.md`](../docs/erd-rujukan.md) — anda terus menulis kod.

---

## 🎯 Objektif Pembelajaran

Di akhir hari ini, peserta boleh:

| # | Objektif (boleh diukur) | Sesi | Bukti |
|---|------------------------|------|-------|
| O1 | **Mencipta** database pembangunan & ujian dengan pengguna khusus, dan **menyambung** projek melalui `.env` | S1 | [Lab 3.1](./lab.md#lab-31--database-mysql--env-s1); `php spark db:table --show` |
| O2 | **Menulis** migration `departments` dan `parking_zones` tepat seperti spesifikasi §3, dan **menguji** `migrate` / `rollback` | S2 | [Lab 3.2](./lab.md#lab-32--migration--seeder-pertama-s2); `php spark migrate:status` |
| O3 | **Menulis** seeder idempoten yang boleh dijalankan berulang kali tanpa baris berganda | S2 | `departments` = 4 baris selepas dua larian |
| O4 | **Membina** model dengan `$allowedFields`, `$useTimestamps` dan validation, serta halaman senarai + borang baharu | S3 | [Lab 3.3](./lab.md#lab-33--model--halaman-jabatan-s3); `/jabatan` |
| O5 | **Membina** carian Query Builder (`like()` dalam kumpulan) dengan pagination secara berdikari | S4 | [Lab 3.4](./lab.md#lab-34--carian--pagination-zon-s4); `/zon?q=`; Kuiz S4 lulus |
| O6 | **Mengkonfigurasi** kumpulan database `tests` melalui `.env` dan **meng-commit** templat `.env.example` tanpa rahsia | S5 | [Lab 3.1b](./lab.md#lab-31b--database-ujian--envexample-s5); `php spark db:table --show --dbgroup tests` |
| O7 | **Menjalankan** query Query Builder dalam `php spark shell` dan **menerangkan** SQL yang dijana melalui `getLastQuery()` | S6 | [Lab 3.2b](./lab.md#lab-32b--query-builder-dalam-konsol-s6); Kuiz S6 lulus |
| O8 | **Membina** borang edit dengan `update()` dan **menguji** `is_unique` dengan `{id}` | S7 | [Lab 3.3b](./lab.md#lab-33b--edit-jabatan-s7); `/jabatan/<id>/edit` |
| O9 | **Membina** halaman butiran dengan 404 dan susunan `?sort=` ber-whitelist | S8 | [Lab 3.4b](./lab.md#lab-34b--butiran-zon--susunan-s8); `/zon/<id>`, `/zon?sort=name` |

---

## 📅 Jadual Hari Ini

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 2 | — |
| 09:00–10:00 | S1 | Database MySQL & `.env` | Mencipta database & pengguna `kkm_dev`; menyambung projek |
| 10:00–10:30 | S5 | Lanjutan S1: database ujian & `.env.example` | Menyambung kumpulan `tests`; meng-commit templat tanpa rahsia |
| 10:30–10:45 | — | Rehat pagi | — |
| 10:45–11:50 | S2 | Migration & seeder pertama | Menulis migration `departments` & `parking_zones`; seeder idempoten |
| 11:50–12:30 | S6 | Lanjutan S2: Query Builder dalam konsol | Menjalankan query dalam `php spark shell`; membaca SQL sebenar |
| 12:30–14:30 | — | Makan tengah hari | — |
| 14:30–15:20 | S3 | Model & halaman `/jabatan` | Membina model dengan validation; senarai & borang baharu |
| 15:20–16:00 | S7 | Lanjutan S3: edit jabatan | Membina borang edit dengan `update()` dan `is_unique` `{id}` |
| 16:00–16:35 | S4 | Carian & pagination `/zon` | Membina carian Query Builder & pagination secara berdikari |
| 16:35–17:00 | S8 | Lanjutan S4: butiran zon & susunan; wrap-up | Membina halaman butiran dengan 404 dan susunan ber-whitelist |

---

## 🧭 Kenapa hari ini penting

Setiap modul Hari 5–10 (TLK, Pas, Laporan, Statistik) ialah **model + controller + view di atas jadual**. Hari ini anda membina corak itu sekali dari awal hingga akhir dengan jadual kecil, supaya Hari 4 hingga 10 hanya mengulang corak yang sama pada jadual yang lebih besar.

- **Migration, bukan klik:** struktur database ialah kod — di-commit, disemak dan boleh dibina semula pada mana-mana laptop dengan `php spark migrate`.
- **Seeder idempoten:** data latihan boleh diisi semula bila-bila masa tanpa `Duplicate entry`.
- **Model menjaga pintu:** `$allowedFields` dan validation dalam model melindungi setiap borang yang menggunakannya.

```mermaid
flowchart LR
    M["Migration<br/>CreateDepartmentsTable"] --> DB[("MySQL<br/>kkm_latihan")]
    S["Seeder<br/>DepartmentSeeder"] --> DB
    DB --> MD["DepartmentModel<br/>allowedFields + validation"]
    MD --> C["Jabatan controller"]
    C --> V["View + layout"]
```

---

## S1 — Database MySQL & `.env` (09:00–10:30)

### 1.1 Dua database, satu pengguna

| Database | Guna | Siapa menulis |
|----------|------|---------------|
| `kkm_latihan` | Pembangunan — `php spark serve`, migration, seeder | Anda |
| `kkm_latihan_test` | Ujian PHPUnit (Hari 6) — jadual dipadam & dicipta semula setiap kali ujian dijalankan | `composer test` |

Pengguna `kkm_dev` hanya ada hak ke atas dua database ini. `root` tidak pernah masuk `.env`: jika kata laluan dalam `.env` bocor, kerosakan terhad kepada database latihan.

### 1.2 Dari `.env` ke connection

`.env` menetapkan `database.default.*`. CI4 membaca nilai itu ke dalam `Config\Database::$default` semasa request bermula. `php spark db:table --show` ialah ujian connection paling cepat: *Database has no tables!* bermaksud connection berjaya dan database masih kosong.

Lab: [Lab 3.1](./lab.md#lab-31--database-mysql--env-s1).

### 🎯 Kuiz S1

> Jawab selepas Lab 3.1 di laptop anda — jawapan datang daripada output sebenar. Lulus kuiz ini menanda checkpoint Lab 3.1.

1. Lab 3.1 langkah 4: apakah output `php spark db:table --show` pada database baharu anda?
   - [ ] Senarai kosong tanpa sebarang mesej
   - [x] *Database has no tables!*
   - [ ] *Unable to connect to the database.*
   - [ ] Satu jadual `migrations`
   > Database baharu belum ada jadual. Jadual `migrations` hanya dicipta oleh `migrate` pertama (Lab 3.2). *Unable to connect* bermaksud nilai `.env` salah.

2. Lab 3.1 langkah 5: apakah output `git check-ignore -v .env`?
   - [ ] Tiada output — `.env` tidak diabaikan
   - [x] Satu baris `.gitignore:<nombor baris>:.env` diikuti nama fail `.env`
   - [ ] `fatal: not a git repository`
   - [ ] `.env` disenaraikan sebagai *modified*
   > `-v` menunjukkan fail, nombor baris dan corak yang mengabaikan `.env` (projek CI4 baharu: `.gitignore:44:.env`). Tiada output bermakna `.env` boleh ter-commit bersama kata laluan database.

---

## S2 — Migration & Seeder Pertama (10:45–12:30)

### 2.1 Migration = sejarah struktur database

| Arahan | Apa yang berlaku |
|--------|------------------|
| `php spark make:migration CreateDepartmentsTable` | Mencipta fail bercap masa dalam `app/Database/Migrations/` |
| `php spark migrate` | Menjalankan `up()` setiap migration yang belum dijalankan, dan merekodnya dalam jadual `migrations` |
| `php spark migrate:status` | Menyenaraikan migration, tarikh *Migrated On* dan **Batch** |
| `php spark migrate:rollback` | Menjalankan `down()` bagi batch terakhir |

Jadual `migrations` sendiri dicipta oleh CI pada `migrate` pertama — sebab itu `db:table --show` menunjukkan satu jadual lebih daripada yang anda tulis.

### 2.2 Seeder idempoten

`insertBatch()` biasa gagal pada larian kedua (*Duplicate entry*) kerana `code` UNIQUE. `ignore(true)` menjadikannya `INSERT IGNORE`: baris yang sudah wujud dilangkau. Seeder yang selamat dijalankan berulang kali dipanggil **idempoten**.

Jadual & medan: [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 · ERD: [`erd-rujukan.md`](../docs/erd-rujukan.md) · Nota: [`nota-02-migration-seeder-dan-query-builder.md`](../docs/nota-02-migration-seeder-dan-query-builder.md).

Lab: [Lab 3.2](./lab.md#lab-32--migration--seeder-pertama-s2).

### 🎯 Kuiz S2

> Jawab selepas Lab 3.2 di laptop anda — jawapan datang daripada output sebenar. Lulus kuiz ini menanda checkpoint Lab 3.2.

1. Selepas `php spark migrate` pertama dalam Lab 3.2 (langkah 4), berapa jadual disenaraikan oleh `php spark db:table --show`?
   - [ ] 2 — `departments` dan `parking_zones`
   - [ ] 0 — jadual hanya muncul selepas seeder dijalankan
   - [x] 3 — `departments`, `migrations` dan `parking_zones`
   - [ ] 4 — termasuk jadual `users` Shield
   > CI mencipta jadual `migrations` pada `migrate` pertama untuk merekod migration yang sudah dijalankan. Shield belum dipasang (Hari 4), jadi tiada `users`.

2. Dalam Lab 3.2 langkah 4 anda menjalankan `migrate`, `migrate:rollback`, kemudian `migrate` semula. Apakah nilai lajur **Batch** dalam `migrate:status` yang terakhir?
   - [x] 1
   - [ ] 2
   - [ ] 3
   - [ ] Kosong — rollback memadam sejarah migration
   > Rollback memadam rekod batch 1 daripada jadual `migrations`. Larian `migrate` seterusnya menjadi batch baharu selepas batch tertinggi yang masih ada — tiada lagi, jadi ia batch 1 semula.

---

## S3 — Model & Halaman `/jabatan` (14:30–16:00)

### 3.1 Apa yang model berikan

| Sifat | Kesan |
|-------|-------|
| `$table` | Jadual yang dibaca/ditulis |
| `$allowedFields` | Hanya medan ini diterima daripada `insert()`/`update()` — medan lain (cth `id` yang dipalsukan) diabaikan |
| `$useTimestamps` | `created_at` & `updated_at` diisi automatik |
| `$validationRules` | Disemak setiap kali `insert()`/`update()`; gagal → `false` + `errors()` |

### 3.2 Validation dalam model vs controller

Lab 2.4 menyemak borang dalam controller (`$this->validate()`). Mulai hari ini peraturan data diletak dalam **model**, supaya setiap borang, seeder dan servis yang menulis ke `departments` melalui peraturan yang sama. Controller hanya memanggil `insert()` dan menghantar `errors()` kembali ke borang.

Nota: [`nota-03-model-entity-dan-enum.md`](../docs/nota-03-model-entity-dan-enum.md) · [`nota-04-validasi-dan-borang.md`](../docs/nota-04-validasi-dan-borang.md).

Lab: [Lab 3.3](./lab.md#lab-33--model--halaman-jabatan-s3).

### 🎯 Kuiz S3

> Jawab selepas Lab 3.3 di laptop anda — jawapan datang daripada output sebenar. Lulus kuiz ini menanda checkpoint Lab 3.3.

1. Anda menghantar borang `/jabatan/baharu` dengan Kod `BTM` (sudah wujud). Apakah mesej di bawah medan Kod?
   - [ ] *Duplicate entry 'BTM' for key 'code'*
   - [ ] *Kod BTM sudah wujud.*
   - [ ] Tiada mesej; rekod kedua disimpan
   - [x] *The Kod field must contain a unique value.*
   > `is_unique[departments.code,id,{id}]` dalam `$validationRules` model menolak kod sebelum query `INSERT` dijalankan, jadi MySQL tidak pernah melihat baris berganda. `label` `Kod` menggantikan nama medan `code` dalam mesej.

2. Di `/jabatan` (susunan `orderBy('code')`), jabatan manakah di baris pertama?
   - [ ] `BTM` — Bahagian Teknologi Maklumat (Latihan), kerana ia dimasukkan dahulu
   - [x] `BKW` — Bahagian Kewangan (Latihan)
   - [ ] `BPA` — Bahagian Pengurusan Aset (Latihan)
   - [ ] `BSM` — Bahagian Sumber Manusia (Latihan)
   > `orderBy('code')` menyusun ikut abjad kod: `BKW` < `BPA` < `BSM` < `BTM`. Tanpa `orderBy`, susunan bergantung pada database dan biasanya ikut `id`.

---

## S4 — Carian & Pagination `/zon` (16:00–17:00)

### 4.1 Carian dengan Query Builder

```php
$this->groupStart()
    ->like('name', $q)
    ->orLike('location', $q)
    ->orLike('code', $q)
    ->groupEnd();
```

`groupStart()`/`groupEnd()` membalut `OR` dalam kurungan supaya syarat lain (cth `is_active = 1` kelak) tidak terbatal. Query Builder meng-escape nilai `$q`, jadi input seperti `' OR 1=1 --` dicari sebagai teks biasa — bukan dijalankan sebagai SQL.

### 4.2 Pagination

`$model->paginate(2)` mengambil 2 baris untuk halaman semasa (`?page=`), dan `$model->pager->links()` mencetak pautan halaman yang mengekalkan query string lain (`?q=`). Carian guna `GET`, bukan `POST`, supaya hasil boleh di-bookmark dan pagination berfungsi.

Lab: [Lab 3.4](./lab.md#lab-34--carian--pagination-zon-s4).

### 🎯 Kuiz S4

> Jawab selepas Lab 3.4 di laptop anda — jawapan datang daripada output sebenar. Lulus kuiz ini menanda checkpoint Lab 3.4.

1. Anda membuka `/zon?q=KLINIK` (huruf besar) dalam Lab 3.4. Apakah yang dipaparkan?
   - [ ] *Tiada zon sepadan dengan "KLINIK".* kerana carian sensitif huruf besar/kecil
   - [x] Zon **B — Blok Klinik** sahaja
   - [ ] Semua tiga zon kerana `like()` sentiasa memadankan semua baris
   - [ ] Ralat SQL kerana `q` tidak di-escape
   > Database dicipta dengan collation `utf8mb4_unicode_ci` — `ci` = *case-insensitive*, jadi `LIKE '%KLINIK%'` sepadan dengan "Blok Klinik" dan "Sebelah klinik pakar".

2. Anda menaip `' OR 1=1 --` dalam kotak carian `/zon`. Apakah yang dipaparkan?
   - [x] *Tiada zon sepadan dengan "' OR 1=1 --".*
   - [ ] Semua zon — syarat `OR 1=1` sentiasa benar
   - [ ] Ralat 500 *You have an error in your SQL syntax*
   - [ ] Ralat 403 daripada filter CSRF
   > Query Builder meng-escape nilai dalam `like()`, jadi input itu dicari sebagai teks biasa. Tiada zon mengandungi teks tersebut. Borang `GET` tidak melalui CSRF.

---

## S5 — Lanjutan S1: Database ujian & `.env.example` (selepas Lab 3.1)

### 5.1 Dua kumpulan connection

| Kumpulan | Digunakan oleh | Database |
|----------|----------------|----------|
| `default` | `php spark serve`, `migrate`, `db:seed`, model | `kkm_latihan` |
| `tests` | PHPUnit (`composer test`, Hari 6) — `app/Config/Database.php` menukar `defaultGroup` kepada `tests` apabila `ENVIRONMENT` ialah `testing` | `kkm_latihan_test` |

Nilai lalai `tests` dalam appstarter bukan MySQL. Baris `database.tests.*` dalam `.env` menimpanya, sama seperti `database.default.*` menimpa kumpulan `default`. `--dbgroup tests` pada `php spark db:table` memilih kumpulan itu secara jelas, jadi anda boleh menguji connection hari ini walaupun ujian PHPUnit bermula Hari 6.

### 5.2 `.env` vs `.env.example`

| Fail | Di-commit? | Isi |
|------|------------|-----|
| `.env` | Tidak — `.gitignore` | Nilai sebenar laptop anda, termasuk kata laluan |
| `.env.example` | Ya | Kunci yang sama; kata laluan diganti `ganti_kata_laluan` |

Sesiapa yang mengklon repo menjalankan `cp .env.example .env` dan hanya mengisi kata laluan. Setiap kali anda menambah kunci baharu dalam `.env`, tambah juga kunci itu (tanpa nilai rahsia) dalam `.env.example` dalam commit yang sama.

Lab: [Lab 3.1b](./lab.md#lab-31b--database-ujian--envexample-s5).

### 🎯 Kuiz S5

> Jawab selepas Lab 3.1b di laptop anda — jawapan datang daripada output sebenar. Lulus kuiz ini menanda checkpoint Lab 3.1b.

1. Lab 3.1b langkah 1 (sebelum `.env` diubah): dalam blok `tests` output `php spark config:check Database`, apakah nilai `DBDriver` dan `DBPrefix`?
   - [ ] `MySQLi` dan kosong — sama seperti `default`
   - [x] `SQLite3` dan `db_`
   - [ ] `MySQLi` dan `db_`
   - [ ] `SQLite3` dan kosong
   > Appstarter menetapkan `tests` kepada SQLite `:memory:` dengan awalan `db_`. Laragon tidak menghidupkan extension `sqlite3`, dan awalan `db_` menjadikan nama jadual `db_departments`. Sebab itu `.env` menimpa kedua-duanya: `DBDriver = MySQLi` dan `DBPrefix =` kosong.

2. Lab 3.1b langkah 5: apakah output `git status --short`?
   - [ ] `?? .env` dan `?? .env.example`
   - [x] `?? .env.example`
   - [ ] Tiada output — `.env.example` diabaikan seperti `.env`
   - [ ] `M .env`
   > `??` bermaksud fail baharu yang belum dijejak Git. `.gitignore` mengabaikan nama `.env` sahaja, jadi `.env.example` boleh di-commit manakala `.env` (dengan kata laluan) kekal di luar Git.

---

## S6 — Lanjutan S2: Query Builder dalam konsol (selepas Lab 3.2)

### 6.1 Konsol sebagai makmal query

`php spark shell` memuatkan aplikasi CI4 dan memberi `$db` (connection `default`). Setiap baris dijalankan serta-merta, jadi anda boleh mencuba Query Builder sebelum menulisnya dalam model.

| Kaedah | Kesan pada SQL |
|--------|----------------|
| `where('code', 'BSM')` | `WHERE code = 'BSM'` — nilai di-escape |
| `like('location', 'aras')` | `WHERE location LIKE '%aras%'` |
| `orderBy('name', 'DESC')` | `ORDER BY name DESC` |
| `countAllResults()` | `SELECT COUNT(*)` dengan syarat yang dibina |
| `countAll()` | Bilangan semua baris jadual, tanpa syarat |
| `$db->getLastQuery()` | SQL sebenar query terakhir |

### 6.2 Query Builder terus vs model

`$db->table('departments')` tidak melalui `DepartmentModel`, jadi tiada `$validationRules` dan tiada `$allowedFields`: hanya kekangan MySQL (`UNIQUE`, `NOT NULL`) yang menjaga data. `$db->affectedRows()` memberitahu berapa baris yang benar-benar ditulis oleh query terakhir — cara pantas membuktikan seeder idempoten tanpa membuka HeidiSQL.

Lab: [Lab 3.2b](./lab.md#lab-32b--query-builder-dalam-konsol-s6) · Rujukan: [`arahan-spark.md`](../docs/arahan-spark.md#php-spark-shell).

### 🎯 Kuiz S6

> Jawab selepas Lab 3.2b di laptop anda — jawapan datang daripada output sebenar. Lulus kuiz ini menanda checkpoint Lab 3.2b.

1. Lab 3.2b langkah 4: apakah nilai yang dipulangkan `$db->table('parking_zones')->like('location', 'aras')->countAllResults()`?
   - [ ] 0 — `aras` huruf kecil tidak sepadan dengan `Aras`
   - [ ] 1
   - [x] 2
   - [ ] 3
   > Zon A (*Aras G, pintu masuk utama*) dan zon C (*Aras 1–3, bangunan parkir*) sepadan; collation `utf8mb4_unicode_ci` tidak membezakan huruf besar/kecil. Zon B (*Sebelah klinik pakar*) tidak mengandungi `aras`.

2. Lab 3.2b langkah 5: apakah yang dipaparkan oleh `insert()` **tanpa** `ignore(true)`, dan apakah nilai `$db->affectedRows()` selepas `insert()` **dengan** `ignore(true)`?
   - [ ] *The Kod field must contain a unique value.* dan `0`
   - [x] Ralat *Duplicate entry 'BTM' for key …* dan `0`
   - [ ] Ralat *Duplicate entry 'BTM' for key …* dan `1`
   - [ ] `true` dan `1` — baris `BTM` kedua disimpan
   > `$db->table()` tidak melalui model, jadi tiada mesej validation `Kod`: MySQL sendiri menolak kod berganda melalui kunci `UNIQUE`. `ignore(true)` menjadikan query `INSERT IGNORE` — tiada ralat, tetapi 0 baris ditulis. Itulah sebab seeder Lab 3.2 selamat dijalankan dua kali.

---

## S7 — Lanjutan S3: Edit jabatan (selepas Lab 3.3)

### 7.1 Corak edit = corak baharu + id

| Request | Method controller | Langkah |
|---------|-------------------|---------|
| `GET /jabatan/5/edit` | `edit(5)` | `find(5)` → `null`? 404 : borang terisi (`old('code', $jabatan['code'])`) |
| `POST /jabatan/5` | `kemaskini(5)` | `update(5, $data)` → gagal? kembali ke borang dengan `errors()` : redirect ke `/jabatan` (PRG) |

`(:num)` dalam route hanya menerima digit dan menghantarnya sebagai argumen method (`/$1`).

### 7.2 `{id}` dalam `is_unique`

`is_unique[departments.code,id,{id}]` bermaksud "kod mesti unik, **kecuali** baris yang `id`-nya sama dengan `{id}`". CI 4.7 mengisi `{id}` hanya jika `$data` ada medan `id` **dan** model ada rule untuk `id`; jika tiada rule, CI membaling *No validation rules for the placeholder: "id"*. Validation berjalan sebelum `$allowedFields` membuang medan lain, jadi `id` digunakan untuk semakan tetapi tidak ditulis ke jadual.

### 7.3 Kenapa tiada padam

Mulai Hari 4, `users.department_id` merujuk `departments` (foreign key `ON DELETE SET NULL`). Memadam jabatan akan mengosongkan jabatan setiap pengguna di dalamnya, dan `UserSeeder` Hari 4 mencari jabatan ikut kod. Jadi kursus ini membina edit sahaja, dan anda tidak menukar kod empat jabatan asal.

Lab: [Lab 3.3b](./lab.md#lab-33b--edit-jabatan-s7).

### 🎯 Kuiz S7

> Jawab selepas Lab 3.3b di laptop anda — jawapan datang daripada output sebenar. Lulus kuiz ini menanda checkpoint Lab 3.3b.

1. Lab 3.3b langkah 6: anda mengekalkan Kod `BPP`, menukar Nama, dan klik **Kemas kini**. Apakah yang dipaparkan?
   - [ ] *The Kod field must contain a unique value.* di bawah Kod
   - [x] Senarai `/jabatan` dengan *Jabatan BPP dikemas kini.*
   - [ ] Senarai `/jabatan` dengan *Jabatan BPP disimpan.* dan dua baris `BPP`
   - [ ] Halaman 404 *Jabatan tidak dijumpai.*
   > `$data['id'] = $id` mengisi `{id}`, jadi `is_unique` mengecualikan baris `BPP` sendiri dan `update()` berjaya. Tanpa baris itu, kod sendiri dikira berganda dan mesej *unique value* muncul.

2. Lab 3.3b langkah 6: dalam `php spark db:table departments --limit-field-value 40`, apakah yang berlaku pada baris `BPP` selepas kemas kini?
   - [ ] `created_at` dan `updated_at` kedua-duanya bertukar kepada masa edit
   - [x] `created_at` kekal (masa Lab 3.3); `updated_at` bertukar kepada masa edit
   - [ ] Kedua-duanya kekal — `update()` tidak menyentuh cap masa
   - [ ] `updated_at` menjadi `NULL`
   > `$useTimestamps = true` mengisi `created_at` dan `updated_at` semasa `insert()`, tetapi hanya `updated_at` semasa `update()`.

---

## S8 — Lanjutan S4: Butiran zon & susunan (selepas Lab 3.4)

### 8.1 404 yang betul

`find($id)` memulangkan `null` jika tiada baris. Tanpa semakan, view cuba membaca `$zon['code']` daripada `null` dan memaparkan ralat. `throw PageNotFoundException::forPageNotFound('Zon tidak dijumpai.')` memberi status HTTP **404** — browser, enjin carian dan ujian Hari 6 semuanya faham maksudnya.

### 8.2 Whitelist untuk `orderBy()`

Query Builder meng-escape **nilai** dalam `where()` dan `like()`, tetapi `orderBy()` menerima **nama lajur**. Jangan hantar input pengguna terus ke `orderBy()`: semak dahulu dengan `in_array($sort, ['code', 'name'], true)` dan guna nilai lalai jika tiada dalam senarai. Pautan pagination menyalin query string semasa, jadi `q` dan `sort` kekal pada halaman 2.

Lab: [Lab 3.4b](./lab.md#lab-34b--butiran-zon--susunan-s8).

### 🎯 Kuiz S8

> Jawab selepas Lab 3.4b di laptop anda — jawapan datang daripada output sebenar. Lulus kuiz ini menanda checkpoint Lab 3.4b.

1. Anda membuka `/zon?sort=name` dalam Lab 3.4b. Zon manakah di baris pertama halaman 1?
   - [ ] **A — Blok Utama**
   - [x] **B — Blok Klinik**
   - [ ] **C — Parkir Bertingkat**
   - [ ] Ralat 500 kerana `sort` tidak di-escape
   > Susunan ikut nama: *Blok Klinik* < *Blok Utama* < *Parkir Bertingkat*. `orderBy('name')` dipanggil sebelum `cari()`, jadi SQL menjadi `ORDER BY name, code`.

2. Anda membuka `/zon?sort=location` (`location` tiada dalam whitelist). Zon manakah di baris pertama?
   - [x] **A — Blok Utama** — susunan kembali kepada kod
   - [ ] **C — Parkir Bertingkat** — disusun ikut lokasi
   - [ ] Ralat 500 *Unknown column*
   - [ ] *Tiada zon sepadan*
   > `in_array()` menolak `location`, jadi `$sort` menjadi `code`. Tanpa whitelist, lokasi *Aras 1–3, …* (zon C) akan berada di atas — pengguna boleh memilih apa-apa lajur, termasuk yang tidak sepatutnya dilihat.

---

## 📦 Hasil Hari Ini

- [ ] Database `kkm_latihan` + `kkm_latihan_test` dengan pengguna `kkm_dev`; `.env` bersambung (tidak di-commit)
- [ ] Migration `CreateDepartmentsTable` + `CreateParkingZonesTable`; seeder idempoten
- [ ] `DepartmentModel` + `/jabatan` (senarai & borang baharu dengan validation model)
- [ ] `ParkingZoneModel` + `/zon` (carian `?q=` & pagination)
- [ ] GitLab menunjukkan commit `DB:`, `JABATAN:` dan `ZON:`
- [ ] Kumpulan database `tests` → `kkm_latihan_test` dalam `.env`; `.env.example` tanpa rahsia di-commit
- [ ] `php spark shell` (PsySH) untuk menguji query Query Builder
- [ ] `/jabatan/<id>/edit` dengan `update()` dan `is_unique` `{id}`
- [ ] `/zon/<id>` (butiran + 404) dan susunan `/zon?sort=code` / `?sort=name`
- [ ] GitLab menunjukkan commit `SETUP: .env.example tanpa rahsia`, `SETUP: php spark shell (PsySH)`, `JABATAN: edit & kemas kini` dan `ZON: butiran + susunan`

---

## 🧠 Semakan Kendiri

1. Kenapa struktur database ditulis sebagai migration, bukan dicipta dalam HeidiSQL?
   <details><summary>Jawapan</summary>Migration ialah kod: di-commit ke Git, disemak dalam MR, dan boleh membina semula database yang sama pada mana-mana laptop atau server dengan <code>php spark migrate</code>. Klik dalam HeidiSQL tidak meninggalkan sejarah.</details>

2. Apa yang membuatkan `DepartmentSeeder` selamat dijalankan dua kali?
   <details><summary>Jawapan</summary><code>ignore(true)</code> menjadikan query <code>INSERT IGNORE</code>; baris dengan <code>code</code> yang sudah wujud (UNIQUE) dilangkau, jadi tiada <em>Duplicate entry</em>.</details>

3. Seseorang menghantar POST `/jabatan` dengan medan tambahan `id=99`. Apa yang berlaku?
   <details><summary>Jawapan</summary><code>id</code> tiada dalam <code>$allowedFields</code>, jadi model mengabaikannya. Rekod baharu mendapat <code>id</code> daripada AUTO_INCREMENT.</details>

4. Kenapa validation diletak dalam model, bukan controller, mulai hari ini?
   <details><summary>Jawapan</summary>Semua kod yang menulis ke jadual (borang, seeder, servis) melalui peraturan yang sama. Controller kekal nipis: panggil <code>insert()</code>, hantar <code>errors()</code> kembali ke borang.</details>

5. Kenapa carian `/zon` guna `GET` dan bukan `POST`?
   <details><summary>Jawapan</summary><code>?q=</code> kekal dalam URL: pautan pagination membawanya, hasil boleh di-bookmark atau dikongsi, dan F5 tidak bertanya untuk menghantar semula borang. Carian tidak mengubah data, jadi <code>GET</code> sesuai.</details>

---

## ➡️ Persediaan untuk esok

- Pastikan GitLab menunjukkan commit `DB:`, `JABATAN:` dan `ZON:`; siapkan Lab 3.3–3.4 jika belum.
- Hari 4 Lab 4.2 memberi `app/Config/Routes.php` penuh: pastikan route `jabatan/(:num)/edit`, `jabatan/(:num)` dan `zon/(:num)` dari Lab 3.3b–3.4b kekal di dalamnya.
- Hari 4 memasang **Shield** (log masuk & peranan), layout Bootstrap dan baki 8 jadual spesifikasi §3 dalam projek yang sama.
- Baca spesifikasi §4 (peranan `applicant`, `reviewer`, `approver`, `admin`) dan [`erd-rujukan.md`](../docs/erd-rujukan.md).
