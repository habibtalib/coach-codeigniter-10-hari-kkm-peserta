# SPEC-KURSUS — Kanun Tunggal (CI-KKM-10)

> **Kanun tunggal.** Semua bahan (README hari, lab, nota penceramah, slaid, template kod) **mesti** patuh fail ini. Jangan tukar nama jadual, medan, status, peranan, prefix atau nama kelas tanpa mengemas kini fail ini dahulu.

Kursus: **Coaching Pembangunan Aplikasi Menggunakan CodeIgniter** · 10 hari · Kementerian Kesihatan Malaysia (KKM) · Disediakan oleh **RH Dynamic Resources**.

---

## 1. Tech stack (muktamad)

| Perkara | Nilai |
|---------|-------|
| Rangka | **CodeIgniter 4.6+** (`codeigniter4/appstarter`) |
| Bahasa | **PHP 8.2+** (backed enum, `readonly`, named arguments) |
| Database | **MySQL 8 / MariaDB 10.6+** (InnoDB, `utf8mb4`) |
| Pengesahan & peranan | **CodeIgniter Shield** (`codeigniter4/shield`) — groups + permissions |
| Antara muka | **Bootstrap 5.3** + Bootstrap Icons (layout `app/Views/layouts/main.php`) |
| Carta | **Chart.js 4** |
| Eksport | **Dompdf** (PDF) · **PhpSpreadsheet** (Excel `.xlsx`) |
| Cache | CodeIgniter Cache (`file` handler semasa latihan) |
| Ujian | **PHPUnit** + CodeIgniter Testing (`FeatureTestTrait`, `DatabaseTestTrait`) |
| CLI | **Spark** (`migrate`, `db:seed`, `make:*`, `routes`, `serve`) |
| Kawalan versi | **Git** (satu branch per modul/ciri) |
| Diagram | **Mermaid** (ERD, carta alir, carta status) · **draw.io/Excalidraw** (wireframe) |
| Pembantu AI (opsyenal) | **Claude Code** — penjelas & pencadang, bukan penjana modul |
| Bahasa | Nota/UI **Bahasa Melayu** · kod, nama kelas & istilah teknikal **Bahasa Inggeris** |

## 2. Empat modul

| # | Modul | Prefix rujukan | Hari |
|---|-------|----------------|------|
| M1 | **Tempat Letak Kenderaan Khas** (TLK) | `TLK-{YYYY}-{0000}` | 5–6 |
| M2 | **Pas** (permohonan pas kenderaan/akses) | `PAS-{YYYY}-{0000}` | 7–8 |
| M3 | **Laporan** (senarai bertapis + eksport PDF/Excel) | — | 9 |
| M4 | **Statistik** (dashboard merentas M1 & M2) | — | 10 |

Hari 1–3: keperluan, proses, ERD, wireframe. Hari 4: persekitaran + migration awal.

### 2.1 M1 — Tempat Letak Kenderaan Khas

Kakitangan memohon **slot letak kenderaan khas** (cth OKU, ibu mengandung, pegawai kanan, kenderaan rasmi) bagi satu tempoh tarikh. Pentadbir menyemak ketersediaan dan meluluskan/menolak.

**Enum `SlotCategory`** (`parking_slots.category`): `oku` · `mengandung` · `pegawai_kanan` · `kenderaan_rasmi` · `pelawat_vip`.

**Enum `BookingStatus`** (`slot_bookings.status`):

```text
pending ──► approved ──► cancelled
   │            └──────► expired
   └──────► rejected
```

| Nilai | Label BM |
|-------|----------|
| `pending` | Menunggu |
| `approved` | Diluluskan |
| `rejected` | Ditolak |
| `cancelled` | Dibatalkan |
| `expired` | Tamat Tempoh |

**Peraturan perniagaan teras:**
- **BR-TLK-01** Tiada pertindihan: satu slot tidak boleh ada dua tempahan `pending`/`approved` yang julat tarikhnya bertindih. Syarat bertindih: `start_date <= :end AND end_date >= :start`.
- **BR-TLK-02** Kategori slot mesti sepadan dengan kelayakan pemohon (cth slot `oku` perlu dokumen/pengesahan — semakan pentadbir).
- **BR-TLK-03** Tempoh maksimum satu tempahan = **90 hari** (`end_date − start_date ≤ 90`, cth 2026-10-01 → 2026-12-30 diterima, → 2026-12-31 ditolak); `end_date >= start_date` (tempahan satu hari dibenarkan); `start_date` tidak boleh di masa lalu (hari ini dibenarkan).
- **BR-TLK-06** Hanya tempahan `approved` boleh dibatalkan, oleh pemohon sendiri atau `admin`. Tempahan `pending` tidak boleh dibatalkan (permintaan perubahan — fasa 2).
- **BR-TLK-04** Seorang pemohon maksimum **1** tempahan aktif (`pending`/`approved`) pada satu masa.
- **BR-TLK-05** Semakan pertindihan & kelulusan berlaku dalam **transaksi DB** dengan kunci baris slot (`SELECT … FOR UPDATE`).

### 2.2 M2 — Pas

Kakitangan/kontraktor memohon **pas** dengan dokumen sokongan. Aliran kelulusan dua peringkat: penyemak → pelulus.

**Enum `PassType`** (`pass_applications.pass_type`): `kenderaan` (pas kenderaan/pelekat) · `kakitangan` (pas akses kakitangan) · `kontraktor` (pas kontraktor berjangka).

**Enum `PassStatus`** (`pass_applications.status`):

```text
submitted ──► under_review ──► approved ──► expired
                   │
                   └─────────► rejected
```

| Nilai | Label BM | Siapa boleh ubah ke status ini |
|-------|----------|-------------------------------|
| `submitted` | Dihantar | `applicant` (semasa cipta) |
| `under_review` | Dalam Semakan | `reviewer` |
| `approved` | Diluluskan | `approver` |
| `rejected` | Ditolak | `reviewer` atau `approver` (catatan **wajib**) |
| `expired` | Tamat Tempoh | sistem (Spark command / semasa papar) |

**Peraturan perniagaan teras:**
- **BR-PAS-01** Peralihan status hanya mengikut jadual di atas — dikuatkuasa oleh `PassStatus::canTransitionTo()`.
- **BR-PAS-02** Muat naik: `pdf`, `jpg`, `png` sahaja; maksimum **2 MB** setiap fail; maksimum 3 fail; disimpan di `writable/uploads/pas/` dengan nama rawak (`$file->getRandomName()`); hanya path disimpan di DB.
- **BR-PAS-03** Penolakan mesti ada `remarks` (min 10 aksara).
- **BR-PAS-04** Pemohon hanya boleh lihat permohonan sendiri; `reviewer`/`approver`/`admin` lihat semua.
- **BR-PAS-05** Setiap peralihan status direkod dalam `status_logs`.
- **BR-PAS-06** `vehicle_id` wajib hanya apabila `pass_type = kenderaan`; `valid_until >= valid_from` (tiada had maksimum).

### 2.3 M3 — Laporan

| Kod | Laporan | Filter |
|-----|---------|---------|
| `RPT-01` | Senarai tempahan TLK | julat tarikh, zon, kategori, status |
| `RPT-02` | Senarai permohonan Pas | julat tarikh, jenis pas, jabatan, status |
| `RPT-03` | Penggunaan slot mengikut zon (aggregate) | bulan/tahun |

Setiap laporan: paparan HTML berpagination + butang **Eksport PDF** + **Eksport Excel** (filter sama dibawa melalui query string).

### 2.4 M4 — Statistik

Dashboard `/statistik` (peranan `admin`, `approver`):
- **Kad KPI:** jumlah tempahan aktif, kadar penggunaan slot (%), permohonan pas menunggu, purata hari untuk lulus pas.
- **Carta:** tempahan ikut bulan (bar), status pas (doughnut), penggunaan ikut zon (bar mendatar), trend permohonan 12 bulan (line).
- Data aggregate dari `StatisticsService`, di-**cache 10 minit** (`cache()->remember()`), dikosongkan apabila status berubah.

## 3. Skema pangkalan data (nama jadual & medan muktamad)

Semua jadual: `id` INT UNSIGNED AUTO_INCREMENT PK, `created_at`, `updated_at` (DATETIME NULL) — **kecuali `status_logs`: `created_at` sahaja** (log audit tidak pernah dikemas kini). `deleted_at` hanya di mana dinyatakan (soft delete).

| Jadual | Medan utama |
|--------|-------------|
| `departments` | `code` VARCHAR(20) UNIQUE, `name` VARCHAR(150) |
| `users` *(Shield)* | + medan tambahan: `full_name` VARCHAR(150), `staff_no` VARCHAR(20) UNIQUE NULL, `department_id` FK NULL, `phone` VARCHAR(20) NULL |
| `parking_zones` | `code` VARCHAR(10) UNIQUE, `name` VARCHAR(100), `location` VARCHAR(150) |
| `parking_slots` | `zone_id` FK, `slot_no` VARCHAR(10), `category` VARCHAR(20), `is_active` TINYINT(1) DEFAULT 1 · UNIQUE(`zone_id`,`slot_no`) · `deleted_at` |
| `vehicles` | `user_id` FK, `plate_no` VARCHAR(15) UNIQUE, `model` VARCHAR(80), `color` VARCHAR(30) |
| `slot_bookings` | `ref_no` VARCHAR(20) UNIQUE, `user_id` FK, `vehicle_id` FK, `slot_id` FK, `start_date` DATE, `end_date` DATE, `reason` TEXT, `status` VARCHAR(20) DEFAULT `pending`, `decided_by` FK NULL, `decided_at` DATETIME NULL · INDEX(`slot_id`,`start_date`,`end_date`) · INDEX(`status`) |
| `pass_applications` | `ref_no` VARCHAR(20) UNIQUE, `user_id` FK, `pass_type` VARCHAR(20), `vehicle_id` FK NULL, `purpose` TEXT, `valid_from` DATE, `valid_until` DATE, `status` VARCHAR(20) DEFAULT `submitted`, `reviewed_by` FK NULL, `reviewed_at` DATETIME NULL, `approved_by` FK NULL, `approved_at` DATETIME NULL · INDEX(`status`) |
| `pass_documents` | `application_id` FK, `doc_type` VARCHAR(30), `original_name` VARCHAR(255), `stored_path` VARCHAR(255), `mime` VARCHAR(80), `size_bytes` INT UNSIGNED |
| `status_logs` | `module` VARCHAR(5) (`TLK`/`PAS`), `record_id` INT UNSIGNED, `from_status` VARCHAR(20) NULL, `to_status` VARCHAR(20), `actor_id` FK, `remarks` TEXT NULL, `created_at` · INDEX(`module`,`record_id`) — **satu jadual audit untuk kedua-dua modul** |
| `reference_sequences` | `prefix` VARCHAR(5), `year` SMALLINT, `last_number` INT UNSIGNED · UNIQUE(`prefix`,`year`) |

## 4. Peranan (Shield groups) & kebenaran

| Group | Keterangan | Kebenaran (`AuthGroups::$matrix`) |
|-------|-----------|-----------------------------------|
| `applicant` | Kakitangan pemohon | `tlk.apply`, `pas.apply` |
| `reviewer` | Pegawai penyemak pas | `pas.review`, `laporan.view` |
| `approver` | Pegawai pelulus pas & tempahan TLK | `tlk.decide`, `pas.approve`, `laporan.view`, `statistik.view` |
| `admin` | Pentadbir sistem | `admin.*`, `tlk.*`, `pas.*`, `laporan.*`, `statistik.*` |

Akses dikuatkuasa di **server** melalui Shield filters (`group:`/`permission:`) pada `app/Config/Routes.php` **dan** semakan pemilikan dalam controller/service — tidak cukup sekadar sembunyi butang.

Pengguna sintetik (seeder `UserSeeder`, kata laluan `Latihan@2026`): `pemohon1@latihan.test`, `pemohon2@latihan.test`, `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test`.

## 5. Struktur kod aplikasi (nama kelas muktamad)

```text
app/
├── Config/Routes.php, Filters.php, AuthGroups.php
├── Controllers/
│   ├── Tlk/BookingController.php        # permohonan & senarai tempahan (applicant)
│   ├── Tlk/DecisionController.php       # lulus/tolak (approver)
│   ├── Admin/SlotController.php         # CRUD slot & zon (admin)
│   ├── Pas/ApplicationController.php    # mohon, senarai, papar, muat turun dokumen
│   ├── Pas/ReviewController.php         # semak / lulus / tolak
│   ├── Laporan/ReportController.php     # RPT-01..03 + eksport
│   └── Statistik/DashboardController.php
├── Enums/        BookingStatus.php · PassStatus.php · PassType.php · SlotCategory.php
├── Entities/     SlotBooking.php · PassApplication.php
├── Models/       DepartmentModel · ParkingZoneModel · ParkingSlotModel · VehicleModel ·
│                 SlotBookingModel · PassApplicationModel · PassDocumentModel · StatusLogModel
├── Services/     ReferenceNumberService · SlotAvailabilityService · BookingService ·
│                 PassWorkflowService · ReportService · ExportService · StatisticsService
├── Database/Migrations/ · Database/Seeds/ (DatabaseSeeder memanggil semua)
└── Views/layouts/main.php · tlk/ · pas/ · laporan/ · statistik/ · partials/
```

Prinsip: **Controller nipis** (terima request → panggil service → pulang view/redirect). **Logik perniagaan dalam Service.** **Model** = akses data + `$validationRules`. Enum = satu-satunya sumber status.

## 6. Laluan (routes) utama

| Kumpulan | URL | Filter |
|----------|-----|--------|
| TLK | `/tlk/tempahan` (index, new, create, show, cancel) | `session` |
| TLK keputusan | `/tlk/keputusan` (index, approve, reject) | `permission:tlk.decide` |
| Admin slot | `/admin/slot` (CRUD) | `group:admin` |
| Pas | `/pas/permohonan` (index, new, create, show, dokumen/{id}) | `session` |
| Pas semakan | `/pas/semakan` (index, review, approve, reject) | `group:reviewer,approver,admin` |
| Laporan | `/laporan/{tempahan\|pas\|penggunaan}` + `?export=pdf\|xlsx` | `permission:laporan.view` |
| Statistik | `/statistik` + `/statistik/data` (JSON) | `permission:statistik.view` |

## 7. Pemetaan 10 hari

| Hari | Tajuk (ikut tentatif) | Hasil utama (deliverable) |
|------|----------------------|---------------------------|
| 1 | Project Kickoff & Requirement Deep Dive | Carta skop · senarai awal keperluan fungsian (FR) & bukan fungsian (NFR) TLK & Pas |
| 2 | Requirement Finalization & Process Flow | **URS disahkan** · carta alir as-is/to-be · acceptance criteria (Given/When/Then) |
| 3 | Database Design & UI/UX Foundation | **ERD Mermaid** · kamus data · wireframe skrin utama · tugasan persediaan diedar |
| 4 | Assignment Review & Development Kickoff | Projek CI4 berjalan · `.env` · Shield · **semua migration + seeder** · pelan kerja & aliran Git solo |
| 5 | TLK (1) | Model + Entity + CRUD tempahan · borang + validasi · `TLK-2026-0001` dijana |
| 6 | TLK (2) | Semakan ketersediaan · anti-pertindihan dalam transaksi · lulus/tolak · ujian · **M1 siap** |
| 7 | Pas (1) | CRUD permohonan · borang + muat naik dokumen selamat |
| 8 | Pas (2) | Aliran kelulusan · RBAC Shield · `status_logs` · ujian akses · **M2 siap** |
| 9 | Laporan | RPT-01..03 · filter · aggregate · eksport PDF/Excel · **M3 siap** |
| 10 | Statistik & Capstone | Dashboard Chart.js + cache · ujian akhir · **demo capstone** kepada pemilik sistem |

## 8. Format bahan setiap hari

Setiap `hari-N/`:
- `README.md` — **Objektif Pembelajaran** (boleh diukur) · jadual 4 sesi (masa tentatif tepat) · nota konsep setiap sesi · hasil hari · semakan kendiri · pautan.
- `lab.md` — hands-on: setiap lab **🎯 Objektif → Prasyarat → langkah bernombor → ✅ Checkpoint → 🧯 Masalah lazim → ⭐ Cabaran tambahan**.
- `nota-penceramah.md` — pecahan masa minit-demi-minit, mesej utama, soalan untuk ditanya, salah faham lazim, kriteria "siap" sebelum bergerak.

Rentak harian tetap (dari tentatif): 08:30–09:00 recap · S1 09:00–10:30 · rehat 10:30–10:45 · S2 10:45–12:30 · makan 12:30–14:30 · S3 14:30–16:00 · S4 16:00–17:00.

## 9. Butiran tambahan (dikunci semasa penyediaan bahan)

| Perkara | Nilai |
|---------|-------|
| Pendaftaran service | `app/Config/Services.php` → `service('bookingService')`, `passWorkflowService`, `reportService`, `exportService`, `statisticsService` |
| Tandatangan utama | `BookingService::create/approve/reject/cancel` · `SlotAvailabilityService::hasOverlap(int $slotId, string $start, string $end, ?int $excludeBookingId = null)` · `PassWorkflowService::submit/startReview/approve/reject/expire` · `ReferenceNumberService::next(string $prefix)` · `StatusLogModel::record()/history()` |
| Enum | Kes PascalCase (`BookingStatus::Approved`, `PassStatus::UnderReview`); `label()`, `badge()`, `canTransitionTo()`, `static values()`/`active()` |
| Ralat peraturan perniagaan | `\DomainException` dengan mesej BM (TLK; peralihan status Pas yang tidak sah). Ralat input borang Pas (`submit()`, catatan penolakan) → `\InvalidArgumentException`; `ReviewController` menangkap kedua-duanya. Kegagalan teknikal (query/simpan) → `\RuntimeException`; akses ditolak dalam service → 403 `app/Views/errors/forbidden.php`; filter Shield → redirect |
| Kebenaran konkrit | `admin.access` (di bawah `admin.*`) |
| Route tambahan | `/tlk/tempahan/ketersediaan` (paparan slot kosong); `new`/`create` TLK & Pas turut `permission:tlk.apply` / `pas.apply` |
| Lab lanjutan (S5–S8) | Route & kelas tambahan: `jabatan/(:num)/edit`, POST `jabatan/(:num)`, `zon/(:num)`, `app/Commands/Shell.php` (Hari 3) · `/admin/slot/zon` (CRUD zon dalam `Admin\SlotController`), `/kenderaan` (`VehicleController`, `app/Validation/VehicleRules.php`) (Hari 5) · `/tlk/tempahan/ketersediaan/sibuk`, `php spark tlk:expire` (`ExpireBookingsCommand`) (Hari 6) · POST `pas/permohonan/(:num)/dokumen` (Hari 7) · POST `pas/semakan/pukal/review` (Hari 8) |
| Tolak tempahan TLK | `remarks` wajib min 10 aksara (selari BR-PAS-03) |
| Fail sokongan | `app/Validation/BookingRules.php` · `app/Views/pager/bootstrap_full.php` · `app/Views/partials/status_timeline.php` · partial flash dalam layout |
| Dokumen Pas | `doc_type = 'sokongan'`; medan borang `documents[]` |
| Cache | `StatisticsService::CACHE_KEY = 'stat_dashboard'`, TTL 600 s; service memanggil `cache()->delete(StatisticsService::CACHE_KEY)` selepas `transCommit()` (`StatisticsService::forget()` ialah pembalut setara) |
| Persekitaran | `app.appTimezone = 'Asia/Kuala_Lumpur'`; CSRF dihidupkan manual di `Filters::$globals`; DB ujian MySQL `kkm_latihan_test` (bukan SQLite — tiada `FOR UPDATE`), `DBPrefix` kosong |
| Rubrik capstone | Kefungsian 30 · Keselamatan 20 · Kualiti kod 20 · Ujian 15 · Demo 15 ([`docs/rubrik-capstone.md`](./rubrik-capstone.md)) |

Kod rujukan telah dijalankan pada CodeIgniter 4.7.4 + Shield 1.4.1 + PHP 8.4 + MySQL (ujian PHPUnit lulus); "4.6+" kekal sah.

## 10. Jangan

- Jangan guna data KKM sebenar (pesakit, kakitangan, plat kenderaan sebenar) — **sintetik sahaja** (`@latihan.test`, plat `WXX 1234` rekaan).
- Jangan commit `.env`, kata laluan, token.
- Jangan simpan fail muat naik dalam `public/`.
- Jangan tulis SQL mentah dengan input pengguna — guna Query Builder / binding.
- Jangan biar AI menjana modul penuh — peserta mesti boleh menerangkan setiap baris.
