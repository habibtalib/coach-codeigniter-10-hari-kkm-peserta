# SPEC-KURSUS — Single Canon (CI-KKM-10)

> **Single canon.** All material (day READMEs, labs, trainer notes, slides, code templates) **must** follow this file. Do not change table, field, status, role, prefix or class names without updating this file first.

Course: **Application Development Coaching with CodeIgniter** · 10 days · Ministry of Health Malaysia (KKM) · Prepared by **RH Dynamic Resources**.

---

## 1. Tech stack (final)

| Item | Value |
|---------|-------|
| Framework | **CodeIgniter 4.6+** (`codeigniter4/appstarter`) |
| Language | **PHP 8.2+** (backed enum, `readonly`, named arguments) |
| Database | **MySQL 8 / MariaDB 10.6+** (InnoDB, `utf8mb4`) |
| Authentication & roles | **CodeIgniter Shield** (`codeigniter4/shield`) — groups + permissions |
| Interface | **Bootstrap 5.3** + Bootstrap Icons (layout `app/Views/layouts/main.php`) |
| Charts | **Chart.js 4** |
| Export | **Dompdf** (PDF) · **PhpSpreadsheet** (Excel `.xlsx`) |
| Cache | CodeIgniter Cache (`file` handler during training) |
| Testing | **PHPUnit** + CodeIgniter Testing (`FeatureTestTrait`, `DatabaseTestTrait`) |
| CLI | **Spark** (`migrate`, `db:seed`, `make:*`, `routes`, `serve`) |
| Version control | **Git** (one branch per module/feature) |
| Diagrams | **Mermaid** (ERD, flowcharts, status charts) · **draw.io/Excalidraw** (wireframes) |
| AI assistant | **Claude Code** — from Day 7 afternoon it may implement code one slice at a time through the 7 review gates ([`kolaborasi.en.md`](./kolaborasi.en.md) §3) |
| Language | Notes/UI in **Malay** · code, class names & technical terms in **English** |

## 2. Four modules

| # | Module | Reference prefix | Day |
|---|-------|----------------|------|
| M1 | **Special Vehicle Parking** (TLK) | `TLK-{YYYY}-{0000}` | 5–6 |
| M2 | **Pass** (vehicle/access pass application) | `PAS-{YYYY}-{0000}` | 7–8 |
| M3 | **Report** (filtered lists + PDF/Excel export) | — | 9 |
| M4 | **Statistics** (dashboard across M1 & M2) | — | 10 |

Days 1–3: requirements, processes, ERD, wireframes. Day 4: environment + initial migrations.

### 2.1 M1 — Special Vehicle Parking

Staff apply for a **special parking slot** (e.g. disabled (OKU), pregnant mothers, senior officers, official vehicles) for a date range. The administrator checks availability and approves/rejects.

**Enum `SlotCategory`** (`parking_slots.category`): `oku` · `mengandung` · `pegawai_kanan` · `kenderaan_rasmi` · `pelawat_vip`.

**Enum `BookingStatus`** (`slot_bookings.status`):

```text
pending ──► approved ──► cancelled
   │            └──────► expired
   └──────► rejected
```

| Value | Malay label |
|-------|----------|
| `pending` | Menunggu (Pending) |
| `approved` | Diluluskan (Approved) |
| `rejected` | Ditolak (Rejected) |
| `cancelled` | Dibatalkan (Cancelled) |
| `expired` | Tamat Tempoh (Expired) |

**Core business rules:**
- **BR-TLK-01** No overlap: a slot cannot have two `pending`/`approved` bookings whose date ranges overlap. Overlap condition: `start_date <= :end AND end_date >= :start`.
- **BR-TLK-02** The slot category must match the applicant's eligibility (e.g. an `oku` slot needs a document/confirmation — checked by the administrator).
- **BR-TLK-03** The maximum length of one booking = **90 days** (`end_date − start_date ≤ 90`, e.g. 2026-10-01 → 2026-12-30 is accepted, → 2026-12-31 is rejected); `end_date >= start_date` (one-day bookings are allowed); `start_date` cannot be in the past (today is allowed).
- **BR-TLK-06** Only `approved` bookings can be cancelled, by the applicant themselves or by `admin`. A `pending` booking cannot be cancelled (change requests — phase 2).
- **BR-TLK-04** An applicant may have at most **1** active booking (`pending`/`approved`) at a time.
- **BR-TLK-05** The overlap check & approval happen in a **DB transaction** with a lock on the slot row (`SELECT … FOR UPDATE`).

### 2.2 M2 — Pass

Staff/contractors apply for a **pass** with supporting documents. Two-stage approval flow: reviewer → approver.

**Enum `PassType`** (`pass_applications.pass_type`): `kenderaan` (vehicle pass/sticker) · `kakitangan` (staff access pass) · `kontraktor` (fixed-term contractor pass).

**Enum `PassStatus`** (`pass_applications.status`):

```text
submitted ──► under_review ──► approved ──► expired
                   │
                   └─────────► rejected
```

| Value | Malay label | Who can change to this status |
|-------|----------|-------------------------------|
| `submitted` | Dihantar (Submitted) | `applicant` (on create) |
| `under_review` | Dalam Semakan (Under review) | `reviewer` |
| `approved` | Diluluskan (Approved) | `approver` |
| `rejected` | Ditolak (Rejected) | `reviewer` or `approver` (remarks **required**) |
| `expired` | Tamat Tempoh (Expired) | system (Spark command / on display) |

**Core business rules:**
- **BR-PAS-01** Status transitions follow only the table above — enforced by `PassStatus::canTransitionTo()`.
- **BR-PAS-02** Uploads: `pdf`, `jpg`, `png` only; maximum **2 MB** per file; maximum 3 files; stored in `writable/uploads/pas/` with a random name (`$file->getRandomName()`); only the path is stored in the DB.
- **BR-PAS-03** A rejection must have `remarks` (min 10 characters).
- **BR-PAS-04** Applicants can only see their own applications; `reviewer`/`approver`/`admin` see all.
- **BR-PAS-05** Every status transition is recorded in `status_logs`.
- **BR-PAS-06** `vehicle_id` is required only when `pass_type = kenderaan`; `valid_until >= valid_from` (no maximum limit).

### 2.3 M3 — Report

| Code | Report | Filters |
|-----|---------|---------|
| `RPT-01` | List of TLK bookings | date range, zone, category, status |
| `RPT-02` | List of Pass applications | date range, pass type, department, status |
| `RPT-03` | Slot usage by zone (aggregate) | month/year |

Each report: paginated HTML view + **Export PDF** + **Export Excel** buttons (the same filters are carried through the query string).

### 2.4 M4 — Statistics

Dashboard `/statistik` (roles `admin`, `approver`):
- **KPI cards:** total active bookings, slot utilisation rate (%), pending pass applications, average days to approve a pass.
- **Charts:** bookings by month (bar), pass status (doughnut), usage by zone (horizontal bar), 12-month application trend (line).
- Aggregate data from `StatisticsService`, **cached for 10 minutes** (`cache()->remember()`), cleared when a status changes.

## 3. Database schema (final table & field names)

All tables: `id` INT UNSIGNED AUTO_INCREMENT PK, `created_at`, `updated_at` (DATETIME NULL) — **except `status_logs`: `created_at` only** (an audit log is never updated). `deleted_at` only where stated (soft delete).

| Table | Main fields |
|--------|-------------|
| `departments` | `code` VARCHAR(20) UNIQUE, `name` VARCHAR(150) |
| `users` *(Shield)* | + extra fields: `full_name` VARCHAR(150), `staff_no` VARCHAR(20) UNIQUE NULL, `department_id` FK NULL, `phone` VARCHAR(20) NULL |
| `parking_zones` | `code` VARCHAR(10) UNIQUE, `name` VARCHAR(100), `location` VARCHAR(150) |
| `parking_slots` | `zone_id` FK, `slot_no` VARCHAR(10), `category` VARCHAR(20), `is_active` TINYINT(1) DEFAULT 1 · UNIQUE(`zone_id`,`slot_no`) · `deleted_at` |
| `vehicles` | `user_id` FK, `plate_no` VARCHAR(15) UNIQUE, `model` VARCHAR(80), `color` VARCHAR(30) |
| `slot_bookings` | `ref_no` VARCHAR(20) UNIQUE, `user_id` FK, `vehicle_id` FK, `slot_id` FK, `start_date` DATE, `end_date` DATE, `reason` TEXT, `status` VARCHAR(20) DEFAULT `pending`, `decided_by` FK NULL, `decided_at` DATETIME NULL · INDEX(`slot_id`,`start_date`,`end_date`) · INDEX(`status`) |
| `pass_applications` | `ref_no` VARCHAR(20) UNIQUE, `user_id` FK, `pass_type` VARCHAR(20), `vehicle_id` FK NULL, `purpose` TEXT, `valid_from` DATE, `valid_until` DATE, `status` VARCHAR(20) DEFAULT `submitted`, `reviewed_by` FK NULL, `reviewed_at` DATETIME NULL, `approved_by` FK NULL, `approved_at` DATETIME NULL · INDEX(`status`) |
| `pass_documents` | `application_id` FK, `doc_type` VARCHAR(30), `original_name` VARCHAR(255), `stored_path` VARCHAR(255), `mime` VARCHAR(80), `size_bytes` INT UNSIGNED |
| `status_logs` | `module` VARCHAR(5) (`TLK`/`PAS`), `record_id` INT UNSIGNED, `from_status` VARCHAR(20) NULL, `to_status` VARCHAR(20), `actor_id` FK, `remarks` TEXT NULL, `created_at` · INDEX(`module`,`record_id`) — **one audit table for both modules** |
| `reference_sequences` | `prefix` VARCHAR(5), `year` SMALLINT, `last_number` INT UNSIGNED · UNIQUE(`prefix`,`year`) |

## 4. Roles (Shield groups) & permissions

| Group | Description | Permissions (`AuthGroups::$matrix`) |
|-------|-----------|-----------------------------------|
| `applicant` | Staff applicant | `tlk.apply`, `pas.apply` |
| `reviewer` | Pass reviewing officer | `pas.review`, `laporan.view` |
| `approver` | Approving officer for passes & TLK bookings | `tlk.decide`, `pas.approve`, `laporan.view`, `statistik.view` |
| `admin` | System administrator | `admin.*`, `tlk.*`, `pas.*`, `laporan.*`, `statistik.*` |

Access is enforced on the **server** through Shield filters (`group:`/`permission:`) in `app/Config/Routes.php` **and** ownership checks in the controller/service — hiding buttons is not enough.

Synthetic users (seeder `UserSeeder`, password `Latihan@2026`): `pemohon1@latihan.test`, `pemohon2@latihan.test`, `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test`.

## 5. Application code structure (final class names)

```text
app/
├── Config/Routes.php, Filters.php, AuthGroups.php
├── Controllers/
│   ├── Tlk/BookingController.php        # booking application & list (applicant)
│   ├── Tlk/DecisionController.php       # approve/reject (approver)
│   ├── Admin/SlotController.php         # slot & zone CRUD (admin)
│   ├── Pas/ApplicationController.php    # apply, list, view, download documents
│   ├── Pas/ReviewController.php         # review / approve / reject
│   ├── Laporan/ReportController.php     # RPT-01..03 + export
│   └── Statistik/DashboardController.php
├── Enums/        BookingStatus.php · PassStatus.php · PassType.php · SlotCategory.php
├── Entities/     SlotBooking.php · PassApplication.php
├── Models/       DepartmentModel · ParkingZoneModel · ParkingSlotModel · VehicleModel ·
│                 SlotBookingModel · PassApplicationModel · PassDocumentModel · StatusLogModel
├── Services/     ReferenceNumberService · SlotAvailabilityService · BookingService ·
│                 PassWorkflowService · ReportService · ExportService · StatisticsService
├── Database/Migrations/ · Database/Seeds/ (DatabaseSeeder calls them all)
└── Views/layouts/main.php · tlk/ · pas/ · laporan/ · statistik/ · partials/
```

Principles: **Thin controller** (receive request → call service → return view/redirect). **Business logic in the Service.** **Model** = data access + `$validationRules`. The enum = the single source of statuses.

## 6. Main routes

| Group | URL | Filter |
|----------|-----|--------|
| TLK | `/tlk/tempahan` (index, new, create, show, cancel) | `session` |
| TLK decisions | `/tlk/keputusan` (index, approve, reject) | `permission:tlk.decide` |
| Admin slots | `/admin/slot` (CRUD) | `group:admin` |
| Pass | `/pas/permohonan` (index, new, create, show, dokumen/{id}) | `session` |
| Pass review | `/pas/semakan` (index, review, approve, reject) | `group:reviewer,approver,admin` |
| Report | `/laporan/{tempahan\|pas\|penggunaan}` + `?export=pdf\|xlsx` | `permission:laporan.view` |
| Statistics | `/statistik` + `/statistik/data` (JSON) | `permission:statistik.view` |

## 7. 10-day mapping

| Day | Title (from the tentative schedule) | Main deliverable |
|------|----------------------|---------------------------|
| 1 | Project Kickoff & Requirement Deep Dive | Scope chart · initial list of functional (FR) & non-functional (NFR) requirements for TLK & Pass |
| 2 | Requirement Sign-off & Your CI Project on GitLab | FRs confirmed with the system owner · `kelas-ci-<nama>` project on GitLab · route, controller, layout view · `/daftar` form with validation & CSRF |
| 3 | Database, Migrations, Models & Search | `kkm_dev` database + `.env` · first migrations & seeders (`departments`, `parking_zones`) · model + `/jabatan` pages · `/zon` search & pagination |
| 4 | Development Kickoff: Shield, Full Schema & Git Flow | MVC request cycle · Shield + roles · **all migrations + seeders** from the reference ERD · solo Git flow & first MR |
| 5 | TLK (1) | Booking Model + Entity + CRUD · form + validation · `TLK-2026-0001` generated |
| 6 | TLK (2) | Availability check · overlap prevention in a transaction · approve/reject · tests · **M1 done** |
| 7 | Pass (1) | Application CRUD · form + secure document upload |
| 8 | Pass (2) | Approval flow · Shield RBAC · `status_logs` · access tests · **M2 done** |
| 9 | Report | RPT-01..03 · filters · aggregate · PDF/Excel export · **M3 done** |
| 10 | Statistics & Capstone | Chart.js dashboard + cache · final testing · **capstone demo** to the system owner |

## 8. Daily material format

Each `hari-N/`:
- `README.md` — **Learning Objectives** (measurable) · session timetable (exact times from [`JADUAL.md`](../JADUAL.md)) · concept notes for each session · day deliverables · self-check · links.
- `lab.md` — hands-on: each lab is **🎯 Objective → Prerequisites → numbered steps → ✅ Checkpoint → 🧯 Troubleshooting → ⭐ Extra challenge**.
- `nota-penceramah.md` — minute-by-minute time breakdown, key messages, questions to ask, common misconceptions, "done" criteria before moving on.

Daily rhythm: 08:30–09:00 recap · break 10:30–10:45 · lunch 12:30–14:30. Days 1, 2 and 10 have 4 sessions: S1 09:00–10:30 · S2 10:45–12:30 · S3 14:30–16:00 · S4 16:00–17:00. Days 3–9 have 8 sessions; each core session is followed by a follow-up session: S1 09:00–10:00 · S5 10:00–10:30 · S2 10:45–12:00 · S6 12:00–12:30 · S3 14:30–15:30 · S7 15:30–16:00 · S4 16:00–16:35 · S8 16:35–17:00 (Days 3 and 6 differ slightly; see `JADUAL.md`).

## 9. Additional details (locked while preparing the material)

| Item | Value |
|---------|-------|
| Service registration | `app/Config/Services.php` → `service('bookingService')`, `passWorkflowService`, `reportService`, `exportService`, `statisticsService` |
| Main signatures | `BookingService::create/approve/reject/cancel` · `SlotAvailabilityService::hasOverlap(int $slotId, string $start, string $end, ?int $excludeBookingId = null)` · `PassWorkflowService::submit/startReview/approve/reject/expire` · `ReferenceNumberService::next(string $prefix)` · `StatusLogModel::record()/history()` |
| Enum | PascalCase cases (`BookingStatus::Approved`, `PassStatus::UnderReview`); `label()`, `badge()`, `canTransitionTo()`, `static values()`/`active()` |
| Business rule errors | `\DomainException` with a Malay message (TLK; illegal Pas status transitions). Pas form input errors (`submit()`, rejection remarks) → `\InvalidArgumentException`; `ReviewController` catches both. Technical failures (query/save) → `\RuntimeException`; access denied in a service → 403 `app/Views/errors/forbidden.php`; Shield filter → redirect |
| Concrete permission | `admin.access` (under `admin.*`) |
| Extra routes | `/tlk/tempahan/ketersediaan` (free slot view); TLK & Pass `new`/`create` also use `permission:tlk.apply` / `pas.apply` |
| Partner labs (S5–S8) | Extra routes & classes: `jabatan/(:num)/edit`, POST `jabatan/(:num)`, `zon/(:num)`, `app/Commands/Shell.php` (Day 3) · `/admin/slot/zon` (zone CRUD in `Admin\SlotController`), `/kenderaan` (`VehicleController`, `app/Validation/VehicleRules.php`) (Day 5) · `/tlk/tempahan/ketersediaan/sibuk`, `php spark tlk:expire` (`ExpireBookingsCommand`) (Day 6) · POST `pas/permohonan/(:num)/dokumen` (Day 7) · POST `pas/semakan/pukal/review` (Day 8) |
| Rejecting a TLK booking | `remarks` required, min 10 characters (in line with BR-PAS-03) |
| Supporting files | `app/Validation/BookingRules.php` · `app/Views/pager/bootstrap_full.php` · `app/Views/partials/status_timeline.php` · flash partial in the layout |
| Pass documents | `doc_type = 'sokongan'`; form field `documents[]` |
| Cache | `StatisticsService::CACHE_KEY = 'stat_dashboard'`, TTL 600 s; services call `cache()->delete(StatisticsService::CACHE_KEY)` after `transCommit()` (`StatisticsService::forget()` is an equivalent wrapper) |
| Environment | `app.appTimezone = 'Asia/Kuala_Lumpur'`; CSRF enabled manually in `Filters::$globals`; MySQL test DB `kkm_latihan_test` (not SQLite — no `FOR UPDATE`), empty `DBPrefix` |
| Capstone rubric | Functionality 30 · Security 20 · Code quality 20 · Testing 15 · Demo 15 ([`docs/rubrik-capstone.md`](./rubrik-capstone.md)) |

The reference code is tested on CodeIgniter 4.7.5 + Shield 1.4.1 + PHP 8.3 + MySQL (PHPUnit tests pass). Course minimum: CI 4.6+.

## 10. Don'ts

- Don't use real KKM data (patients, staff, real number plates) — **synthetic only** (`@latihan.test`, made-up `WXX 1234` plates).
- Don't commit `.env`, passwords, tokens.
- Don't store uploaded files in `public/`.
- Don't write raw SQL with user input — use Query Builder / bindings.
- Don't let AI generate a whole module in one prompt — implement slice by slice through the review gates; participants must be able to explain every committed line.
