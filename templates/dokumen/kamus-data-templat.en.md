# Data Dictionary — TLK (Special Vehicle Parking) & Pass System

> **Template.** Copy to `docs/kamus-data.md` (Day 3 Lab 3.2). Table & field names **must** be exactly as in [`docs/spesifikasi-sistem.md`](../../docs/spesifikasi-sistem.md) §3. This dictionary becomes the source for the migrations on Day 4.

## Conventions

| Item | Convention |
|---------|-----------|
| Engine / charset | InnoDB · `utf8mb4` · `utf8mb4_general_ci` |
| Primary key | `id` INT UNSIGNED AUTO_INCREMENT |
| Timestamps | `created_at`, `updated_at` DATETIME NULL (managed by the Model `$useTimestamps = true`) |
| Soft delete | `deleted_at` DATETIME NULL — **only** `parking_slots` |
| Names | `snake_case`, plural tables (`slot_bookings`), FK `<entiti>_id` |
| Enum values | Stored as `VARCHAR(20)` English values (`pending`); Malay labels in the PHP enum |

## Column legend

| Column | Fill with |
|-------|-----------|
| Type | `INT UNSIGNED`, `VARCHAR(n)`, `TEXT`, `DATE`, `DATETIME`, `TINYINT(1)`, `SMALLINT` |
| NULL | `Ya` (Yes) / `Tidak` (No) |
| Default | default value or `—` |
| Key/Index | `PK`, `UNIQUE`, `INDEX`, `FK`, composite `INDEX(a,b)` |
| FK → | `jadual.medan` (table.field) |
| Rules / enum | validation rules, PHP enum name, BR reference |

---

## Table: `<nama_jadual>`

**Purpose:** `<1 ayat>`
**Module:** `<M1/M2/Kongsi>` · **Model:** `<cth SlotBookingModel>` · **Soft delete:** `<Ya/Tidak>`

| Field | Type | NULL | Default | Key/Index | FK → | Rules / enum | Description |
|-------|-------|------|-------|-------------|------|------------------|------------|
| `id` | INT UNSIGNED AI | No | — | PK | — | — | Internal key |
| `<medan>` | | | | | | | |
| `created_at` | DATETIME | Yes | NULL | — | — | managed by the Model | |
| `updated_at` | DATETIME | Yes | NULL | — | — | managed by the Model | |

**Additional indexes & unique keys:** `<cth UNIQUE(zone_id, slot_no)>`

**Foreign keys & ON DELETE:**

| FK | References | ON DELETE | Reason |
|----|-------|-----------|-------|
| `<medan>` | `<jadual.id>` | `RESTRICT` / `CASCADE` / `SET NULL` | `<…>` |

---

## List of tables to complete

> Tick ✅ when done. All 10 are required.

- [ ] `departments`
- [ ] `users` *(Shield — fill in the 4 extra fields only: `full_name`, `staff_no`, `department_id`, `phone`)*
- [ ] `parking_zones`
- [ ] `parking_slots`
- [ ] `vehicles`
- [ ] `slot_bookings`
- [ ] `pass_applications`
- [ ] `pass_documents`
- [ ] `status_logs`
- [ ] `reference_sequences`

---

## Filled-in example — `pass_documents`

**Purpose:** Metadata of the supporting documents for a pass application (the physical files are in `writable/uploads/pas/`).
**Module:** M2 · **Model:** `PassDocumentModel` · **Soft delete:** No

| Field | Type | NULL | Default | Key/Index | FK → | Rules / enum | Description |
|-------|-------|------|-------|-------------|------|------------------|------------|
| `id` | INT UNSIGNED AI | No | — | PK | — | — | |
| `application_id` | INT UNSIGNED | No | — | FK | `pass_applications.id` | max 3 documents per application (BR-PAS-02, enforced in code) | Parent application |
| `doc_type` | VARCHAR(30) | No | — | — | — | e.g. `geran`, `kad_kakitangan`, `surat_lantikan`, `ic` | Document type |
| `original_name` | VARCHAR(255) | No | — | — | — | for display only; **do not** use it as the stored file name | Original file name |
| `stored_path` | VARCHAR(255) | No | — | — | — | random name `$file->getRandomName()`; under `writable/uploads/pas/` (BR-PAS-02) | Storage path |
| `mime` | VARCHAR(80) | No | — | — | — | `application/pdf`, `image/jpeg`, `image/png` | MIME type verified by the server |
| `size_bytes` | INT UNSIGNED | No | — | — | — | ≤ 2,097,152 (2 MB) | File size |
| `created_at` | DATETIME | Yes | NULL | — | — | managed by the Model | Upload time |
| `updated_at` | DATETIME | Yes | NULL | — | — | managed by the Model | |

**Foreign keys & ON DELETE:**

| FK | References | ON DELETE | Reason |
|----|-------|-----------|-------|
| `application_id` | `pass_applications.id` | `CASCADE` | Documents are wholly owned by the application |

---

## Normalisation

> Show the 1NF → 2NF → 3NF steps for the spreadsheet given in the lab.

| Step | Problem found | Action | Resulting tables |
|---------|-----------------|----------|-----------------|
| 1NF | `<kumpulan berulang / nilai berbilang>` | `<…>` | `<…>` |
| 2NF | `<kebergantungan separa>` | `<…>` | `<…>` |
| 3NF | `<kebergantungan transitif>` | `<…>` | `<…>` |

## Checklist

- [ ] 10 tables; names & fields match SPEC §3.
- [ ] Every FK has an `ON DELETE` + a reason.
- [ ] Composite unique keys: `parking_slots(zone_id, slot_no)`, `reference_sequences(prefix, year)`.
- [ ] Indexes: `slot_bookings(slot_id, start_date, end_date)`, `slot_bookings(status)`, `pass_applications(status)`, `status_logs(module, record_id)`.
- [ ] Every status/category/type field refers to a PHP enum (`BookingStatus`, `PassStatus`, `PassType`, `SlotCategory`).
