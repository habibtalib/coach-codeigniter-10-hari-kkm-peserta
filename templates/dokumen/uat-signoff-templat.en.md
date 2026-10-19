# UAT Sign-off — TLK (Special Vehicle Parking) & Pass System

> **Template.** Used on **Day 10** (S3 final test, S4 capstone demo). The system owner runs (or witnesses) the UAT scenarios built from the acceptance criteria in URS v1.0, then signs the acceptance decision. Save it as `docs/UAT-signoff.md`.

## 1. Information

| Item | Value |
|---------|-------|
| System | TLK & Pass System (M1 TLK, M2 Pass, M3 Report, M4 Statistics) |
| Requirements reference | `docs/URS-v1.md` version `<1.x>` |
| Developer (trainee) | `<…>` |
| Version under UAT | Git tag `<cth v1.0-capstone>` · commit `<…>` |
| UAT date | `2026-__-__` |
| Environment | `<laptop peserta · php spark serve · DB dengan DatabaseSeeder>` |
| System owner | `<nama persona>` |

## 2. UAT scope

| Module | In UAT | Notes |
|-------|-----------|------|
| M1 TLK | ✅ | |
| M2 Pass | ✅ | |
| M3 Report | ✅ | |
| M4 Statistics | ✅ | |
| `<luar skop>` | ❌ | See URS §2.4 |

## 3. Acceptance criteria

The system is **accepted** if:
1. All UAT scenarios marked **Critical** pass.
2. No open **High** severity bugs.
3. Open Medium/Low bugs have a dated action plan.

## 4. UAT scenarios

> One UAT scenario can cover several ACs in one end-to-end flow.

| ID | Scenario (flow) | ACs covered | Role | Critical? | Result | Owner's remarks |
|----|------------------|-------------|---------|-----------|-----------|-----------------|
| UAT-01 | Applicant applies for slot `A-01` → approver approves → applicant sees "Diluluskan" (Approved) & number `TLK-2026-####` | AC-TLK-01-01, AC-TLK-07-01 | `applicant`, `approver` | Yes | ⬜ | |
| UAT-02 | An overlapping application for the same slot is rejected (including same-day dates) | AC-TLK-03-02, AC-TLK-03-03 | `applicant` | Yes | ⬜ | |
| UAT-03 | An applicant with an active booking cannot apply a second time | AC-TLK-04-01 | `applicant` | Yes | ⬜ | |
| UAT-04 | A `kenderaan` pass with 2 documents → reviewer takes it (Under review) → approver approves → timeline with 3 entries | AC-PAS-01-01, AC-PAS-05-01, AC-PAS-07-01, BR-PAS-05 | `applicant`, `reviewer`, `approver` | Yes | ⬜ | |
| UAT-05 | Uploading a `.docx` and a file > 2 MB is rejected | AC-PAS-02-01, AC-PAS-02-02 | `applicant` | Yes | ⬜ | |
| UAT-06 | Rejection without sufficient remarks is blocked; with valid remarks it succeeds | AC-PAS-06-01 | `reviewer` | Yes | ⬜ | |
| UAT-07 | `pemohon2` tries to open `pemohon1`'s application through the URL → blocked | AC-PAS-04-01 | `applicant` | Yes | ⬜ | |
| UAT-08 | `applicant` tries to open `/tlk/keputusan` and `/statistik` → blocked | NFR-01 | `applicant` | Yes | ⬜ | |
| UAT-09 | Report RPT-01 filtered (zone A, status Approved) → row count = count in the DB → PDF & Excel exports match | FR-RPT-01 | `approver` | No | ⬜ | |
| UAT-10 | The `/statistik` dashboard shows 4 KPIs + 4 charts; after a new approval, the figures update | FR-STAT-01 | `admin` | No | ⬜ | |
| `<…>` | | | | | ⬜ | |

**Result:** ⬜ Not run · ✅ Pass · ❌ Fail · ⚠️ Conditional pass

## 5. Bugs & open issues

| Bug-ID | UAT | Severity | Summary | Action plan | Target date |
|--------|-----|-----------|-----------|----------------|----------------|
| `<…>` | | | | | |

## 6. Summary

| Total scenarios | ✅ Pass | ❌ Fail | ⚠️ Conditional | Critical failed |
|----------------|---------|---------|-------------|----------------|
| | | | | |

## 7. Acceptance decision

Choose one:

- [ ] **ACCEPTED** — the system meets the acceptance criteria.
- [ ] **CONDITIONALLY ACCEPTED** — accepted on condition that the following items are resolved before `<tarikh>`: `<…>`
- [ ] **REJECTED** — reason: `<…>`

## 8. Signatures

| Role | Name | Signature | Date |
|---------|------|-------------|--------|
| System owner | `<…>` | | |
| User representative (reviewer/approver) | `<…>` | | |
| Developer (trainee) | `<…>` | | |
| Trainer (witness) | `<…>` | | |

> This exercise uses synthetic data only. The signatures simulate a real acceptance process.
