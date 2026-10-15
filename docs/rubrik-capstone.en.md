# Rubric for the Capstone Demo — CI-KKM-10

[← docs](./README.md) · [Day 10 README](../hari-10/README.md) · [SPEC](../SPEC-KURSUS.md) · [COLLABORATION (DoD)](../KOLABORASI.md)

> **When:** Day 10 S4 (15:45–17:00). **Who is assessed:** each **pair** (pair score) + one **individual** note (the "explain the code" segment). **Who assesses:** panel = trainer (chair) + system owner/representative.
> **Read early:** participants read this rubric at the end of Day 9 so there are no surprises.

---

## 1. Demo format (15 minutes)

| Minute | Segment | Main criteria assessed |
|-------|--------|------------------------|
| 0–1 | Introduction: pair, tag `v1.0-capstone`, one-sentence scope | E |
| 1–4 | **M1 TLK (Special Vehicle Parking)**: apply → overlap rejected → approve → `TLK-2026-####` | A1 |
| 4–7 | **M2 Pass**: apply + documents → review → approve/reject → timeline | A2, B |
| 7–9 | **M3 Report**: filter → pagination keeps the filters → PDF & Excel give the same totals | A3 |
| 9–11 | **M4 Statistics**: 4 KPIs + 4 charts → change a status → dashboard updates | A4 |
| 11–13 | **Explain the code**: the panel picks a file + line; a pair member explains it | C, E (+ individual note) |
| 13–15 | Q&A + test evidence (`vendor/bin/phpunit`) + negative access | B, D, E |

At minute **15:00** the demo stops. A segment that is not shown = not assessed (Level 1 for the related criteria, unless the panel sees evidence during Q&A).

---

## 2. Critical *gates* (pass/fail)

Any **❌** below limits the result to **"Conditional pass"** (max 59) until it is fixed and verified by the trainer (within a 2-week follow-up period).

| # | Gate | How the panel checks |
|---|------|---------------------|
| G1 | An `applicant` user **cannot** open records owned by another applicant (BR-PAS-04) | Ask the pair to change the id in the URL as `pemohon2` |
| G2 | Routes are protected on the **server**: `applicant` cannot open `/tlk/keputusan`, `/pas/semakan`, `/laporan/*`, `/statistik` | Type the URL directly |
| G3 | No `.env`, passwords or real data in the repo | `git ls-files \| grep -E "(^\|/)\.env$"` → empty |
| G4 | Uploaded files are **not** in `public/` | `ls public/` / `find public -name "*.pdf"` |
| G5 | No raw SQL concatenated with user input | Ask: "Show where the filter input goes into the query" |

---

## 3. Criteria & level descriptors

Weights (in line with the course slides): **Functionality 30 % · Security 20 % · Code quality 20 % · Testing 15 % · Demo 15 %**.
Each criterion is assessed at **Level 1–4**. Criterion score = (Level ÷ 4) × Weight.

### A. Functionality — 30 marks (A1 TLK 8 · A2 Pass 8 · A3 Report 7 · A4 Statistics 7)

| Sub | Level 4 (Excellent) | Level 3 (Good) | Level 2 (Basic) | Level 1 (Not yet) |
|-----|---------------------|----------------|----------------|-----------------|
| **A1 TLK** (8) | Full flow + `TLK-{YYYY}-{0000}` + overlap (BR-TLK-01) & limit of 1 active booking (BR-TLK-04) rejected with a clear message + cancel | Full flow; one rule not shown | Create & approve only; no overlap check shown | Not working / not shown |
| **A2 Pass** (8) | Apply + 1–3 valid documents → `under_review` → approve/reject (remarks required, BR-PAS-03) → `status_logs` timeline | Full flow; timeline missing/incomplete | Apply & approve only; no documents or two-stage review | Not working |
| **A3 Report** (7) | RPT-01..03 with the SPEC §2.3 filters; pagination keeps the filters; PDF (A4 landscape, header/footer) & Excel with the **same** totals | 3 reports; one minor issue (e.g. PDF in portrait, one filter missing) | 1–2 reports or exports inconsistent with the screen | Not working |
| **A4 Statistics** (7) | 4 KPIs + 4 charts (bar, doughnut, horizontal bar, line) from `/statistik/data`; cache + invalidation shown | All KPIs & charts; invalidation not shown/not working | ≤ 2 charts or a wrongly defined KPI | Not working |

### B. Security & access control — 20 marks

| Level 4 | Level 3 | Level 2 | Level 1 |
|---------|---------|---------|---------|
| G1–G5 pass; global CSRF; consistent `esc()`; `group:`/`permission:` filters on every route group **and** ownership checks in the service; secure upload (BR-PAS-02); K1–K10 checklist with evidence | G1–G5 pass; 1–2 K items not proven | One gate fails but the pair identified it themselves | More than one gate fails |

### C. Code quality & architecture — 20 marks

| Level 4 | Level 3 | Level 2 | Level 1 |
|---------|---------|---------|---------|
| Thin controllers; logic & business rules (BR-TLK-01..06, BR-PAS-01..06) in `Services/` with transactions + `FOR UPDATE`; every transition goes through the enum `canTransitionTo()` and is recorded in `status_logs`; services registered in `Config/Services.php`; table/field/class/route names exactly as in the SPEC; Query Builder; small prefixed commits | One or two "fat" controllers or one BR outside the service; names mostly follow the SPEC | Much business logic in controllers/views; statuses as typed strings; names deviate | Structure cannot be followed |

### D. Automated testing — 15 marks

| Level 4 | Level 3 | Level 2 | Level 1 |
|---------|---------|---------|---------|
| `vendor/bin/phpunit` green in front of the panel; tests cover overlap, status transitions, negative access, report totals = SQL, cache invalidation; ≥ 1 UAT bug with a red→green test | Green; 3–4 of the areas above covered | Some tests; some are red/skipped | No tests run |

### E. Demo & explanation — 15 marks

| Level 4 | Level 3 | Level 2 | Level 1 |
|---------|---------|---------|---------|
| On time; smooth flow by role; **both** members explain lines of code: *what + why + what happens if it is removed*; answers "what if…" honestly | On time; explanation of *what + why* | Over time or only one person explains; explanation of *what* only | Cannot explain their own code |

---

## 4. Score sheet (one per pair)

Copy this table (or print it) for each pair.

**Pair:** `______________________` & `______________________`  **Panel:** `A / B / C`  **Start time:** `__:__`  **Git tag:** `v1.0-capstone` ☐

### 4.1 Critical gates

| G1 | G2 | G3 | G4 | G5 |
|----|----|----|----|----|
| ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ |

### 4.2 Criterion scores

| Criterion | Weight | Level (1–4) | Score = Level ÷ 4 × Weight | Panel remarks |
|----------|---------:|:-----------:|------------------------------:|---------------|
| A1 TLK | 8 | | | |
| A2 Pass | 8 | | | |
| A3 Report | 7 | | | |
| A4 Statistics | 7 | | | |
| B Security & access control | 20 | | | |
| C Code quality & architecture | 20 | | | |
| D Automated testing | 15 | | | |
| E Demo & explanation | 15 | | | |
| **Total** | **100** | | **____ / 100** | |

**Calculation example:** A3 Level 3 → 3 ÷ 4 × 7 = **5.25**; B Level 4 → 4 ÷ 4 × 20 = **20**.

### 4.3 Individual note — "explain the code" (minutes 11–13)

| Participant | File / line picked by the panel | Level (1–4) | Meets certificate criterion #4? |
|---------|----------------------------|:-----------:|:---------------------------:|
| | | | ☐ Yes ☐ No |
| | | | ☐ Yes ☐ No |

### 4.4 Result

| Range / condition | Result | Mark |
|----------------|-----------|:-----:|
| ≥ 85 and all gates ✅ | **Excellent** | ☐ |
| 70–84 and all gates ✅ | **Good** | ☐ |
| 60–69 and all gates ✅ | **Pass** | ☐ |
| < 60, **or** any gate ❌ | **Conditional pass** — 2-week follow-up plan | ☐ |

**One main strength:** ______________________________________________

**One thing to improve:** ______________________________________________

**Signature:** Trainer ____________  System owner ____________  Date ____________

---

## 5. Consolidation table (trainer, after S4)

| # | Pair | Panel | A Functionality (30) | B Security (20) | C Code quality (20) | D Testing (15) | E Demo (15) | Total | Gate | Result | Completion certificate (participant 1 / 2) |
|---|----------|-------|------------------:|-------------------:|-------------------:|-------------:|------------:|-------:|:----:|-----------|-----------------------------|
| 1 | | | | | | | | | | | ☐ / ☐ |
| 2 | | | | | | | | | | | ☐ / ☐ |
| 3 | | | | | | | | | | | ☐ / ☐ |
| 4 | | | | | | | | | | | ☐ / ☐ |
| 5 | | | | | | | | | | | ☐ / ☐ |
| 6 | | | | | | | | | | | ☐ / ☐ |

---

## 6. Link to the certificate criteria

The course completion certificate criteria (Day 10 README §4.3) use this rubric as follows:

| Certificate criterion | Source in the rubric |
|----------------|---------------------|
| #2 Modules M1–M4 demonstrated | §4.2 A1–A4 each ≥ Level 2 |
| #3 Score ≥ 60 and no unfixed failed gate | §4.2 Total + §4.1 |
| #4 The participant personally explains one line of code | §4.3 ≥ Level 2 |

## 7. Consistency guide between panels

- Before the first demo, the panel assesses **one shared example** (a 3-minute trainer demo or a recording) and agrees on Level 3 for A3 and E.
- Give marks **based on what is shown**, not what is claimed. "It worked on my laptop yesterday" = not shown.
- The system owner gives the main view on **A** (functionality against the URS); the trainer on **B**, **C**, **D**; **E** is agreed together.
- A difference of > 1 level between panel members → discuss for 1 minute; if it still differs, take the lower level and record the reason.
