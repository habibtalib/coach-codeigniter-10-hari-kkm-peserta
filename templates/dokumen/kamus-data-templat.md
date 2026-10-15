# Kamus Data — Sistem TLK & Pas

> **Templat.** Salin ke `docs/kamus-data.md` (Hari 3 Lab 3.2). Nama jadual & medan **mesti** tepat seperti [`SPEC-KURSUS.md`](../../SPEC-KURSUS.md) §3. Kamus ini menjadi sumber migration pada Hari 4.

## Konvensyen

| Perkara | Konvensyen |
|---------|-----------|
| Enjin / charset | InnoDB · `utf8mb4` · `utf8mb4_general_ci` |
| Kunci primer | `id` INT UNSIGNED AUTO_INCREMENT |
| Cap masa | `created_at`, `updated_at` DATETIME NULL (diurus Model `$useTimestamps = true`) |
| Soft delete | `deleted_at` DATETIME NULL — **hanya** `parking_slots` |
| Nama | `snake_case`, jadual jamak (`slot_bookings`), FK `<entiti>_id` |
| Nilai enum | Disimpan sebagai `VARCHAR(20)` nilai Inggeris (`pending`); label BM dalam enum PHP |

## Legenda lajur

| Lajur | Isi dengan |
|-------|-----------|
| Jenis | `INT UNSIGNED`, `VARCHAR(n)`, `TEXT`, `DATE`, `DATETIME`, `TINYINT(1)`, `SMALLINT` |
| NULL | `Ya` / `Tidak` |
| Lalai | nilai lalai atau `—` |
| Kunci/Index | `PK`, `UNIQUE`, `INDEX`, `FK`, komposit `INDEX(a,b)` |
| FK → | `jadual.medan` |
| Peraturan / enum | peraturan validasi, nama enum PHP, rujukan BR |

---

## Jadual: `<nama_jadual>`

**Tujuan:** `<1 ayat>`
**Modul:** `<M1/M2/Kongsi>` · **Model:** `<cth SlotBookingModel>` · **Soft delete:** `<Ya/Tidak>`

| Medan | Jenis | NULL | Lalai | Kunci/Index | FK → | Peraturan / enum | Keterangan |
|-------|-------|------|-------|-------------|------|------------------|------------|
| `id` | INT UNSIGNED AI | Tidak | — | PK | — | — | Kunci dalaman |
| `<medan>` | | | | | | | |
| `created_at` | DATETIME | Ya | NULL | — | — | diurus Model | |
| `updated_at` | DATETIME | Ya | NULL | — | — | diurus Model | |

**Index & kunci unik tambahan:** `<cth UNIQUE(zone_id, slot_no)>`

**Foreign key & ON DELETE:**

| FK | Rujuk | ON DELETE | Sebab |
|----|-------|-----------|-------|
| `<medan>` | `<jadual.id>` | `RESTRICT` / `CASCADE` / `SET NULL` | `<…>` |

---

## Senarai jadual untuk dilengkapkan

> Tandakan ✅ bila siap. Semua 10 wajib.

- [ ] `departments`
- [ ] `users` *(Shield — isi 4 medan tambahan sahaja: `full_name`, `staff_no`, `department_id`, `phone`)*
- [ ] `parking_zones`
- [ ] `parking_slots`
- [ ] `vehicles`
- [ ] `slot_bookings`
- [ ] `pass_applications`
- [ ] `pass_documents`
- [ ] `status_logs`
- [ ] `reference_sequences`

---

## Contoh terisi — `pass_documents`

**Tujuan:** Metadata dokumen sokongan permohonan pas (fail fizikal di `writable/uploads/pas/`).
**Modul:** M2 · **Model:** `PassDocumentModel` · **Soft delete:** Tidak

| Medan | Jenis | NULL | Lalai | Kunci/Index | FK → | Peraturan / enum | Keterangan |
|-------|-------|------|-------|-------------|------|------------------|------------|
| `id` | INT UNSIGNED AI | Tidak | — | PK | — | — | |
| `application_id` | INT UNSIGNED | Tidak | — | FK | `pass_applications.id` | maks 3 dokumen setiap permohonan (BR-PAS-02, dikuatkuasa kod) | Permohonan induk |
| `doc_type` | VARCHAR(30) | Tidak | — | — | — | cth `geran`, `kad_kakitangan`, `surat_lantikan`, `ic` | Jenis dokumen |
| `original_name` | VARCHAR(255) | Tidak | — | — | — | untuk paparan sahaja; **jangan** guna sebagai nama fail storan | Nama asal fail |
| `stored_path` | VARCHAR(255) | Tidak | — | — | — | nama rawak `$file->getRandomName()`; di bawah `writable/uploads/pas/` (BR-PAS-02) | Laluan storan |
| `mime` | VARCHAR(80) | Tidak | — | — | — | `application/pdf`, `image/jpeg`, `image/png` | Jenis MIME disahkan pelayan |
| `size_bytes` | INT UNSIGNED | Tidak | — | — | — | ≤ 2,097,152 (2 MB) | Saiz fail |
| `created_at` | DATETIME | Ya | NULL | — | — | diurus Model | Masa muat naik |
| `updated_at` | DATETIME | Ya | NULL | — | — | diurus Model | |

**Foreign key & ON DELETE:**

| FK | Rujuk | ON DELETE | Sebab |
|----|-------|-----------|-------|
| `application_id` | `pass_applications.id` | `CASCADE` | Dokumen milik penuh permohonan |

---

## Normalisasi

> Tunjukkan langkah 1NF → 2NF → 3NF bagi hamparan yang diberi dalam lab.

| Langkah | Masalah dikesan | Tindakan | Jadual terhasil |
|---------|-----------------|----------|-----------------|
| 1NF | `<kumpulan berulang / nilai berbilang>` | `<…>` | `<…>` |
| 2NF | `<kebergantungan separa>` | `<…>` | `<…>` |
| 3NF | `<kebergantungan transitif>` | `<…>` | `<…>` |

## Senarai semak

- [ ] 10 jadual; nama & medan sepadan SPEC §3.
- [ ] Setiap FK ada `ON DELETE` + sebab.
- [ ] Kunci unik komposit: `parking_slots(zone_id, slot_no)`, `reference_sequences(prefix, year)`.
- [ ] Index: `slot_bookings(slot_id, start_date, end_date)`, `slot_bookings(status)`, `pass_applications(status)`, `status_logs(module, record_id)`.
- [ ] Setiap medan status/kategori/jenis merujuk enum PHP (`BookingStatus`, `PassStatus`, `PassType`, `SlotCategory`).
