# Day 3 Lab — ERD, Data Dictionary, Wireframes & Design Review

[📅 Schedule](../JADUAL.md) · [📘 SPEC canon](../SPEC-KURSUS.md) · [📖 Day 3 README](./README.md)

| Lab | Session | Output |
|-----|---------|--------|
| [Lab 3.1](#lab-31--mermaid-erd) | S1 | `docs/erd.md` |
| [Lab 3.2](#lab-32--data-dictionary--normalisation) | S2 | `docs/kamus-data.md` |
| [Lab 3.3](#lab-33--wireframes-for-the-6-main-screens) | S3 | `docs/wireframe/`, `docs/wireframe.md` |
| [Lab 3.4](#lab-34--design-cross-review) | S4 | `docs/semakan-reka-bentuk.md` |

> **Today's rule:** SPEC §3 is the final answer for table & field names. Your job is not to invent a new schema — it is to **rebuild** that schema from your own URS, understand **why** each part exists, and find what you missed.

---

## Lab 3.1 — Mermaid ERD

### 🎯 Objective
Identify the entities and cardinalities from the URS, then draw a Mermaid ERD that matches SPEC §3 100%.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- `docs/URS-v1.md` (Day 2) and the list of nouns (yesterday's preparation).
- Read README §1.1–1.2.

### Steps
1. **Without looking at SPEC §3 (15 min):** On paper, list the entities from the nouns in your URS. Draw boxes and lines. Write the cardinality at each end.
2. **Compare (5 min):** Open SPEC §3. In `docs/erd.md`, list them under a `## Apa yang saya terlepas` section:
   ```markdown
   ## What I missed (first sketch vs SPEC)
   - Did not think of `reference_sequences` — I assumed ref_no was generated from the id
   - I made a `roles` table — wrong, roles live in Shield
   ```
3. Create the ERD in `docs/erd.md`. Start with two tables and one relationship, preview it, then add more:
   ```mermaid
   erDiagram
       parking_zones {
           int id PK
           varchar code UK "VARCHAR(10)"
           varchar name "VARCHAR(100)"
           varchar location "VARCHAR(150)"
           datetime created_at
           datetime updated_at
       }
       parking_slots {
           int id PK
           int zone_id FK
           varchar slot_no "VARCHAR(10)"
           varchar category "VARCHAR(20) SlotCategory"
           tinyint is_active "DEFAULT 1"
           datetime created_at
           datetime updated_at
           datetime deleted_at
       }
       parking_zones ||--o{ parking_slots : "zone_id"
   ```
4. Add the remaining 8 tables **one at a time**, previewing after each table. Suggested order: `departments` → `users` → `vehicles` → `slot_bookings` → `pass_applications` → `pass_documents` → `status_logs` → `reference_sequences`.
5. Add all the relationships. Watch for `|o--o{` on NULL FKs (`department_id`, `decided_by`, `vehicle_id` in `pass_applications`, `reviewed_by`, `approved_by`).
6. Below the ERD, add the cardinality table (README §1.2) and **explain in your own words** three design decisions (README §1.4 a, b, c).
7. Commit: `SETUP: ERD Mermaid sistem TLK & Pas` (TLK = Special Vehicle Parking, *Tempat Letak Kenderaan Khas*).

### ✅ Checkpoint
- [ ] The ERD renders without errors on mermaid.live.
- [ ] **10 tables** — count them: `departments`, `users`, `parking_zones`, `parking_slots`, `vehicles`, `slot_bookings`, `pass_applications`, `pass_documents`, `status_logs`, `reference_sequences`.
- [ ] Cross-check with a short script (run it in your repo folder):
  ```bash
  for t in departments users parking_zones parking_slots vehicles slot_bookings \
           pass_applications pass_documents status_logs reference_sequences; do
    grep -Eq "^[[:space:]]*$t \{" docs/erd.md && echo "OK  $t" || echo "TIADA $t"
  done
  ```
  Every line must be `OK`.
- [ ] 13 relationships (including the two `users`–`pass_applications` relationships for `reviewed_by` and `approved_by`).
- [ ] No `users.role`.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Parse error` on an attribute line (especially in older Mermaid renderers) | The type contains `(`, as in `varchar(20)` | To work in every renderer, write the short type `varchar` and put the length in a comment `"VARCHAR(20)"` |
| Error on `PK FK` | Several keys without a comma | Use upper-case `PK`, `FK`, `UK`; separate several with commas: `PK, FK` |
| The diagram is too wide to read | 10 tables with every field | Normal. For presenting, make a second version without `created_at`/`updated_at` |
| Error on a relationship line | The relationship label is missing (Mermaid requires `: label`) | `users \|\|--o{ vehicles : "user_id"` |

### ⭐ Bonus challenge
Add a second ERD **just for Shield** that shows how `users` relates to `auth_identities` and `auth_groups_users` (see the Shield documentation). Explain why the user's email is not stored in `users`.

---

## Lab 3.2 — Data Dictionary & Normalisation

### 🎯 Objective
Write a complete data dictionary for 5 core tables in the session (the other 5 tables are finished before Day 4, 08:30) and prove the schema is in 3NF through a normalisation exercise.

### Prerequisites
- Lab 3.1 is done.
- [`templates/dokumen/kamus-data-templat.md`](../templates/dokumen/kamus-data-templat.md), README §2.

### Steps
1. Create the file `docs/kamus-data.md` and copy the contents of the template [`templates/dokumen/kamus-data-templat.md`](../templates/dokumen/kamus-data-templat.md) into it (the `## Jadual: <nama_jadual>` section is repeated for each table).
2. **In the session — 5 core tables, split the work in your pair:** the driver writes `parking_slots` and `slot_bookings`; the navigator checks against the SPEC. Swap for `pass_applications`, `pass_documents`, `status_logs`.
   **The other 5 tables** (`departments`, `users`, `parking_zones`, `vehicles`, `reference_sequences`) — finish them before **Day 4, 08:30** together with preparation task T3 ([`docs/tugasan-persediaan.md`](../docs/tugasan-persediaan.md)). These tables are small; README §2.5 gives their unique keys and special notes.
3. For every table fill in **all** the columns: Field, Type, NULL, Default, Key/Index, FK →, Rule/enum, Description. Use `slot_bookings` in README §2.2 as the example.
4. Fill in the **Rule** column with BR references, e.g.:
   - `pass_documents.mime` → `application/pdf`, `image/jpeg`, `image/png` (BR-PAS-02)
   - `pass_documents.size_bytes` → ≤ 2,097,152 (BR-PAS-02)
   - `status_logs.remarks` → required, ≥ 10 characters, when `to_status = rejected` — in both modules: BR-PAS-03 for Pass, SPEC §9 for TLK booking rejections
5. Fill in the **ON DELETE rules** section (README §2.3) — you may agree or disagree with the suggestions, but **write down the reason**.
6. **Normalisation exercise (25 min):** In the `## Normalisasi` section, take the Pass spreadsheet below (made-up data) and normalise it to 3NF. Show the resulting tables at each step 1NF → 2NF → 3NF.

   | Reference No | Applicant Name | Staff No | Department Code | Department Name | Pass Type | Plate | Vehicle Model | Doc 1 | Doc 2 | Doc 3 | Status | Reviewed By | Approved By |
   |------------|--------------|---------|-------------|--------------|-----------|------|-----------------|-------|-------|-------|--------|--------------|--------------|
   | PAS-2026-0001 | Aminah Latihan | S1001 | JKP | Jabatan Kejururawatan | kenderaan | WXX 1234 | Myvi | geran.pdf | ic.jpg | | approved | Faizal | Noraini |
   | PAS-2026-0002 | Chong Rekaan | — | — | — | kontraktor | | | lantikan.pdf | ic.png | permit.pdf | under_review | Faizal | |

7. Write one paragraph: **"Which SPEC tables come out of this normalisation, and which do not (and why)?"** (Hint: `status_logs` and `reference_sequences` do not come out of normalisation — they come from the audit requirement and the reference numbers.)
8. Commit: `SETUP: kamus data + normalisasi 3NF`.

### ✅ Checkpoint
- [ ] 5 core tables (`parking_slots`, `slot_bookings`, `pass_applications`, `pass_documents`, `status_logs`) in the data dictionary; no empty cells in the Type and NULL columns. The other 5 tables are scheduled before Day 4.
- [ ] Every FK has an `ON DELETE` rule and a reason.
- [ ] All UNIQUE fields in the 5 core tables (including the composite `(zone_id, slot_no)`) are listed; `(prefix, year)` is added with `reference_sequences` before Day 4.
- [ ] The normalisation exercise produces at least `users`, `departments`, `vehicles`, `pass_applications`, `pass_documents`.
- [ ] Types & lengths match the SPEC (e.g. `pass_documents.mime` VARCHAR(80), `status_logs.module` VARCHAR(5)).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Dok 1/2/3` becomes 3 columns in `pass_applications` | The repeating group was not recognised | 1NF: repeating group → child table `pass_documents` |
| "Reviewed By" becomes a name as text | Storing a value, not a reference | FK `reviewed_by` → `users.id` |
| Not sure whether it is NULL or not | The requirement is unclear | Ask: "Does this value exist **at the moment the record is created**?" `decided_at` does not → NULL |
| A contractor has no staff number — does that break UNIQUE? | UNIQUE vs NULL | MySQL allows many NULLs in a UNIQUE column — that is why `staff_no` is UNIQUE **NULL** |

### ⭐ Bonus challenge
Estimate the data size after 3 years (200 TLK bookings + 500 pass applications a year, an average of 2 documents, an average of 3 status logs per record). How many `status_logs` rows? Is `INDEX(module, record_id)` needed? Explain.

---

## Lab 3.3 — Wireframes for the 6 Main Screens

### 🎯 Objective
Sketch low-fidelity wireframes of the 6 main screens following the to-be user flow, with every field mapped to the data dictionary.

### Prerequisites
- `docs/carta-alir.md` (to-be) and `docs/kamus-data.md`.
- draw.io (<https://app.diagrams.net>) or Excalidraw (<https://excalidraw.com>) — or paper + a photo.
- Read README §3.

### Steps
1. Create `docs/wireframe/` and `docs/wireframe.md`. In `wireframe.md`, paste the table of 6 screens (README §3.3) and the user flow chart (README §3.2).
2. **Sketch the master layout first (10 min):** navigation bar (menu by role), breadcrumb, content area, flash message area. Every screen uses this layout (on Day 4 it becomes `app/Views/layouts/main.php`).
3. **Sketch the 6 screens (60 min — ~10 min each).** Every screen must have:
   - Screen title + breadcrumb
   - Every field/column (Malay names) — mapped to a data dictionary field
   - Action buttons (by role)
   - Space for error messages **and** the empty state
   - Side notes: `URL`, `Peranan`, `FR`

   | Screen | Must have |
   |--------|-----------|
   | W1 My bookings list | Columns: Reference No, Slot, Date, Status (Malay badge), Action (Cancel only if Approved); pagination; a "New application" button |
   | W2 Booking form | Zone (filters the Slot list only — not stored; the zone is derived through `slot_id → parking_slots.zone_id`), Slot (active only), Vehicle, Start date, End date, Reason; a note on the 90-day limit & 1 active booking |
   | W3 TLK decision | List of bookings; status filter (default Menunggu); Approve/Reject buttons + remarks |
   | W4 Pass form | Pass type, Vehicle (appears if `kenderaan`), Purpose, Valid from/to, 3 upload slots + a note on format/size |
   | W5 Pass review | Details, list of documents (download), `status_logs` timeline, remarks, buttons by role |
   | W6 Statistics dashboard | 4 KPI cards + 4 chart areas (SPEC §2.4) |

4. Export every screen as a PNG: `docs/wireframe/W1-senarai-tempahan.png`, `W2-borang-tempahan.png`, `W3-keputusan-tlk.png`, `W4-borang-pas.png`, `W5-semakan-pas.png`, `W6-dashboard-statistik.png`. Also keep the source files (`.drawio` / `.excalidraw`).
5. Link the images in `docs/wireframe.md`:
   ```markdown
   ### W2 — TLK booking form
   URL: `/tlk/tempahan/new` · Role: `applicant` · FR: FR-TLK-01, 03, 04, 05
   ![W2](wireframe/W2-borang-tempahan.png)
   System-generated fields (not input): `ref_no`, `user_id`, `status`
   ```
6. **Paper walkthrough test (10 min):** Someone from another pair plays `pemohon1` and "clicks" through W1 → W2 → W1 using your sketches. Note where they get confused.
7. Commit: `SETUP: wireframe 6 skrin utama`.

### ✅ Checkpoint
- [ ] 6 PNG files + sources in `docs/wireframe/`.
- [ ] Every field on the W2 and W4 forms exists in `docs/kamus-data.md` (except Zone on W2 — a display filter, marked "not stored").
- [ ] W2 and W4 do **not** contain `user_id`, `status` or `ref_no` as inputs.
- [ ] The Malay status labels are exact: Menunggu, Diluluskan, Ditolak, Dibatalkan, Tamat Tempoh, Dihantar, Dalam Semakan.
- [ ] W5 shows different buttons for `reviewer` and `approver`.
- [ ] The paper walkthrough test was run; at least 1 improvement was made.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| Too long on one screen | Decorating (colours, icons, fonts) | Grey boxes & text only. Limit of 10 minutes per screen |
| A wireframe field is not in the DB | UI designed before checking the data dictionary | Either remove the field, or open a CR (do not add a field silently) |
| draw.io cannot be opened (network) | Internet blocked | Use the draw.io desktop app, or paper + a phone photo |
| The W6 dashboard is empty because "we don't know the data yet" | Confusion | Sketch labelled boxes: "Bar chart: bookings by month" — that is enough |

### ⭐ Bonus challenge
Sketch a 7th screen: **W7 Report RPT-01** (`/laporan/tempahan`) with a GET filter form (date range, zone, category, status), a paginated table, and Export PDF / Excel buttons (SPEC §2.3).

---

## Lab 3.4 — Design Cross-Review

### 🎯 Objective
Review another pair's ERD and wireframes with a checklist, fix your own design, and understand the preparation assignment.

### Prerequisites
- Labs 3.1–3.3 are done.
- README §4.1–4.2.

### Steps
1. Create `docs/semakan-reka-bentuk.md`:
   ```markdown
   # Design Review — Day 3
   Reviewed by: Pair __ · Date: 2026-__-__

   | # | Check | Pass/Fail | Notes |
   |---|-------|-----------|-------|
   | E1 | 10 tables, exact names | | |
   ...
   | U6 | W4 shows the file limits | | |

   ## Fixes made
   | # | What changed | File | Commit |
   ```
2. **Cross-review (20 min):** Swap laptops with another pair. Review their ERD & wireframes with the E1–E8 and U1–U6 lists. Fill it in in **their** file.
3. **Trainer review (in turns):** The trainer picks 2 items at random and asks you to **explain** them (e.g. "Why is `vehicle_id` NULL here?").
4. **Fix (20 min):** Go back to your own laptop. Fix every "Fail" item. Record it in the "Fixes" table.
5. Read [`docs/tugasan-persediaan.md`](../docs/tugasan-persediaan.md) with your partner. Write any questions at the end of `docs/soalan-terbuka.md`.
6. Commit and tag:
   ```bash
   git add docs/ && git commit -m "SETUP: semakan reka bentuk Hari 3"
   git tag reka-bentuk-v1.0
   ```

### ✅ Checkpoint
- [ ] All 14 items (E1–E8, U1–U6) are marked Pass after the fixes.
- [ ] You can explain any field in the ERD to the trainer without looking at your notes.
- [ ] `git tag` shows `urs-v1.0` and `reka-bentuk-v1.0`.
- [ ] You know the 4 preparation tasks and their deadline (Day 4, 08:30).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| The reviewer "passes everything" quickly | Not really reviewing | The trainer picks 2 items at random to confirm again |
| Arguing about the `ON DELETE` choice | Both sides have a point | Accept it if the reason is written down; the SPEC does not fix `ON DELETE` |
| No time to fix the wireframes | Time | Put the ERD & data dictionary first — tomorrow they become migrations |

### ⭐ Bonus challenge
Write a draft of the **first migration** on paper (as a pseudo-order): list the order in which the tables must be created so that every FK points to a table that already exists. (Hint: `departments` before `users`? — `users` is created by Shield; the extra fields are added later.)

---

## Self-check — end of day

```bash
ls docs/ docs/wireframe/
# docs/: erd.md  kamus-data.md  semakan-reka-bentuk.md  wireframe.md  wireframe/ ... (Day 1–2 files)
# docs/wireframe/: W1-senarai-tempahan.png … W6-dashboard-statistik.png + source files
grep -cE '^[[:space:]]*[a-z_]+ \{' docs/erd.md   # 10
grep -c '^## Jadual:' docs/kamus-data.md           # ≥ 5 (10 before Day 4)
git log --oneline | wc -l
git tag                                            # urs-v1.0  reka-bentuk-v1.0
```

- [ ] `ls docs/` shows `erd.md`, `kamus-data.md`, `wireframe.md`, `semakan-reka-bentuk.md` and the `wireframe/` folder with 6 PNGs + sources.
- [ ] The ERD renders without errors in mermaid.live; the `grep` above counts **10** tables.
- [ ] Data dictionary: 5 core tables complete (no empty cells in Type/NULL); the other 5 are scheduled before Day 4, 08:30.
- [ ] The `## Normalisasi` section shows the steps 1NF → 2NF → 3NF.
- [ ] `git log --oneline | wc -l` has gone up by at least 4 since the end of Day 2 (ERD, data dictionary, wireframes, review).
- [ ] `git tag` shows `urs-v1.0` and `reka-bentuk-v1.0`.
