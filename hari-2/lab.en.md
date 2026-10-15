# Day 2 Lab — Confirmation, Flowcharts, Acceptance Criteria & URS v1.0

[📅 Schedule](../JADUAL.md) · [📘 SPEC canon](../SPEC-KURSUS.md) · [📖 Day 2 README](./README.md)

| Lab | Session | Output |
|-----|---------|--------|
| [Lab 2.1](#lab-21--confirmation-session--decision-log) | S1 | `docs/log-keputusan.md`, `docs/keperluan-awal.md` v0.9 |
| [Lab 2.2](#lab-22--as-is--to-be-flowcharts) | S2 | `docs/carta-alir.md` |
| [Lab 2.3](#lab-23--givenwhenthen-acceptance-criteria) | S3 | `docs/acceptance-criteria.md` |
| [Lab 2.4](#lab-24--assemble-urs-v10) | S4 | `docs/URS-v1.md` |

Reference templates: [`urs-templat.md`](../templates/dokumen/urs-templat.md) · [`acceptance-criteria-templat.md`](../templates/dokumen/acceptance-criteria-templat.md).

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
3. **Presentation (8 minutes per pair)** to the system owner (TLK = Special Vehicle Parking, *Tempat Letak Kenderaan Khas*):
   - Read aloud the 4–5 riskiest "Must" FRs (the ones that touch a BR).
   - Ask the 2 most important open questions from `docs/soalan-terbuka.md`.
   - The other pairs listen and note the decisions that apply to them too.
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

## Lab 2.2 — As-Is & To-Be Flowcharts

### 🎯 Objective
Draw 4 Mermaid flowcharts (TLK/Pass × as-is/to-be) with actor lanes, and mark the improvement points that trace to pain points.

### Prerequisites
- `docs/temubual-tlk.md` and `docs/temubual-pas.md` (the current-process sections).
- Read README §2.2–2.5.

### Steps
1. Create `docs/carta-alir.md` with 4 sections: `## 1. TLK as-is`, `## 2. TLK to-be`, `## 3. Pas as-is`, `## 4. Pas to-be`.
2. **TLK as-is (15 min):** Draw it from the interview answers — not from the README example. At least 3 lanes (`subgraph`): Applicant, Clerk, Unit Head. Start with this outline:
   ```mermaid
   flowchart TB
       subgraph P["Applicant"]
           A([Start]) --> B["Fill in paper form"]
       end
       subgraph K["Clerk"]
           B --> C[("Slot log book")]
       end
   ```
3. Below the chart, list the **visible problems** — refer to the pain point IDs (`PP-TLK-nn`).
4. **TLK to-be (25 min):** At least 4 lanes: Applicant (`applicant`), System, Approver (`approver`), and Administrator (`admin`) if there is a slot management step. You must have decision nodes for:
   - date validation (BR-TLK-03)
   - the active booking limit (BR-TLK-04)
   - overlap (BR-TLK-01)
5. Mark the improvement nodes with `classDef`:
   ```text
   classDef baik fill:#d1f2d9,stroke:#1e7b34,color:#000
   class C,D,E baik
   ```
   Then add a ⚡ table below the chart: `| ⚡ | Perubahan | Menyelesaikan (PP) | BR |`.
6. **Pass as-is & to-be (35 min):** Repeat steps 2–5. The Pass to-be chart must show: the file check (BR-PAS-02), two lanes for reviewer & approver, rejection with remarks (BR-PAS-03), and expiry by the System.
7. **Check the syntax:** paste every chart into <https://mermaid.live>. No errors.
8. Commit:
   ```bash
   git add docs/ && git commit -m "SETUP: carta alir as-is & to-be TLK/Pas"
   ```

### ✅ Checkpoint
- [ ] The 4 charts render without errors in the VS Code preview / mermaid.live.
- [ ] Every to-be chart has a **System** lane.
- [ ] Every to-be chart has ≥ 3 ⚡ points, each with a pain point ID.
- [ ] The status names in the to-be charts match the SPEC enums (`pending`, `approved`, `under_review`, …).
- [ ] The Pass to-be chart does **not** have a direct `submitted → approved` path.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Parse error … got 'end'` | A node is named `end` | Change the ID to `tamat` or `Z` |
| Arrows crossing lanes are tangled | Too many nodes in one lane | Use `flowchart TB`; move decision nodes to the System lane |
| Label cut off/error with `(` or `:` | No quotes | `B["Semak (manual): buku log"]` |
| `<` `>` characters in a label break | Interpreted as HTML | Write "less than" or use `≤`/`≥` |

### ⭐ Bonus challenge
Draw a to-be flowchart for **cancelling** a TLK booking (`approved → cancelled`) and for automatic **expiry** (`approved → expired`) — who/what triggers it, and what is recorded in `status_logs`.

---

## Lab 2.3 — Given/When/Then Acceptance Criteria

### 🎯 Objective
Write testable ACs for at least 8 key FRs, including negative and boundary scenarios, using concrete synthetic data.

### Prerequisites
- `docs/keperluan-awal.md` v0.9.
- Read README §3.1–3.5 and [`acceptance-criteria-templat.md`](../templates/dokumen/acceptance-criteria-templat.md).

### Steps
1. Create `docs/acceptance-criteria.md` based on the template.
2. Prepare a **Base test data** section at the top of the file — every scenario refers to it:
   ```markdown
   ## Base test data
   - Users: pemohon1@latihan.test, pemohon2@latihan.test, penyemak@latihan.test,
     pelulus@latihan.test, admin@latihan.test (password Latihan@2026)
   - Zone A "Blok Utama": slot A-01 (oku), A-02 (mengandung), A-03 (pegawai_kanan)
   - pemohon1's vehicle: WXX 1234 · pemohon2: VXX 2468 (made up)
   - Existing booking: TLK-2026-0007, slot A-01, 2026-10-01 → 2026-10-10, approved
   - "Today" = 2026-10-01
   ```
3. Write ACs for the following **8 required FRs** (minimum). The FR IDs follow the README examples (or the equivalent ID in your list):

   | FR | BR | Minimum scenarios |
   |----|----|-------------------|
   | FR-TLK-01 (apply) | — | happy path |
   | FR-TLK-03 (overlap) | BR-TLK-01 | happy path, negative, same-day boundary, inactive status |
   | FR-TLK-04 (1 active) | BR-TLK-04 | negative (has `pending`), happy path (has `rejected` only) |
   | FR-TLK-05 (dates) | BR-TLK-03 | table of 5 boundary cases |
   | FR-TLK-07 (approve/reject) | — | approve → `decided_by`/`decided_at` filled + a `status_logs` row |
   | FR-PAS-02 (upload) | BR-PAS-02 | wrong type, size boundary, 4 files |
   | FR-PAS-04 (ownership) | BR-PAS-04 | pemohon2 opens pemohon1's application |
   | FR-PAS-06 (reject) | BR-PAS-01, BR-PAS-03 | remarks < 10 characters, valid remarks, reject from `submitted`? |

4. Give every scenario an ID `AC-{MODUL}-{nn}-{nn}` (e.g. `AC-TLK-03-02`).
5. **Test your own ACs:** for every scenario, ask — *"Could a tester who never attended this course run this scenario and decide PASS/FAIL without asking me?"* If not, fix it.
6. **Swap with another pair (10 min):** they try to "break" your ACs — they look for missing scenarios.
7. Commit:
   ```bash
   git add docs/ && git commit -m "SETUP: acceptance criteria TLK & Pas"
   ```

### ✅ Checkpoint
- [ ] End of S3: ACs for ≥ 6 of the 8 required FRs (finish the rest in S4 before assembling the URS). End of day: 8 FRs, ≥ 20 scenarios in total.
- [ ] Every `When` contains **one** action.
- [ ] Every `Then` is observable (message, status, DB row, HTTP code).
- [ ] Boundary scenarios exist for: 90 days, 2 MB, 10 characters, same-day dates (for the FRs that already have ACs).
- [ ] Synthetic data only (`@latihan.test`, made-up plates).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Then` = "successful" | Not specific | State **what** is seen: status, message, record |
| A scenario depends on another scenario | Shared state with no Given | Every scenario must have its own complete `Given` |
| Not sure of the right answer for an odd case | The requirement is not clear yet | That is a finding! Add it to `soalan-terbuka.md` and ask the system owner |
| An AC names a PHP method | Testing the implementation | Test the behaviour the user can see |

### ⭐ Bonus challenge
1. Write an AC for **two simultaneous approvals** (BR-TLK-05): two approvers approve two overlapping `pending` bookings for the same slot at the same moment. What is the expected result?
2. Write an AC for `FR-TLK-04` where the applicant has an `approved` booking whose `end_date` **has already passed** but whose status is still `approved` (not yet changed to `expired`). Is it still "active"? Record it as an open question if you are not sure.

---

## Lab 2.4 — Assemble URS v1.0

### 🎯 Objective
Assemble all the Day 1–2 documents into a complete URS v1.0, with a traceability matrix, signed off by the system owner.

### Prerequisites
- Labs 2.1–2.3 are done.
- [`templates/dokumen/urs-templat.md`](../templates/dokumen/urs-templat.md).

### Steps
1. Create the file `docs/URS-v1.md` and copy in the content of the template `templates/dokumen/urs-templat.md` (the trainer will share it).
2. Fill in sections 1–4 (document information, introduction/scope, stakeholders, glossary) from `docs/carta-skop.md`. The glossary must have a Malay label for **every** `BookingStatus` and `PassStatus` value.
3. Section 5: **link** to `docs/carta-alir.md` (do not copy it again), or paste only the two to-be charts.
4. Section 6: list BR-TLK-01..06 and BR-PAS-01..06 in user language.
5. Sections 7–8: copy only the FRs/NFRs that are **Disahkan/Diubah** (confirmed/changed). "Ditolak" (rejected) goes to the Out of scope / Won't section.
6. Section 9: link to `docs/acceptance-criteria.md`.
7. Section 10: build the traceability matrix — one row per BR, with FR and AC columns. Check both directions (README §4.3).
8. Section 11: the remaining open questions + **assumptions** (e.g. "The document retention period is assumed to be unlimited until Q-04 is answered").
9. Section 12: submit it to the system owner. Fill in the name, date and "Disahkan" (confirmed) once they agree.
10. Tag the version in Git:
    ```bash
    git add docs/ && git commit -m "SETUP: URS v1.0 disahkan"
    git tag urs-v1.0
    ```

### ✅ Checkpoint
- [ ] `docs/URS-v1.md` contains 12 titled sections. Sections 6, 7, 9, 10, 11 and 12 are complete; sections 1–5 and 8 may be marked **"Draf"** (draft) and finished before 08:30 tomorrow.
- [ ] Traceability matrix: 12 BR rows; **no** empty AC column.
- [ ] Every "Must" FR has ≥ 1 AC.
- [ ] The version history shows v0.1 → v0.9 → v1.0.
- [ ] The signature table is filled in; `git tag` shows `urs-v1.0`.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| The URS is very long and copies everything | Copying content instead of linking | Link to the supporting files; the URS is the master document |
| A BR with no AC in the matrix | An AC was missed | Write a minimum AC (one negative scenario) before sign-off |
| The system owner refuses to sign | There are still critical questions | Correct! Resolve them, or record them as agreed assumptions |

### ⭐ Bonus challenge
Add a short **"Report requirements"** section to the URS that maps RPT-01..03 (SPEC §2.3) to filters and users, so that Day 9 starts with requirements that are already confirmed.

---

## Self-check — end of day

```bash
ls docs/
# URS-v1.md  acceptance-criteria.md  carta-alir.md  carta-skop.md  keperluan-awal.md
# log-keputusan.md  soalan-terbuka.md  temubual-pas.md  temubual-tlk.md
git tag   # urs-v1.0
```
