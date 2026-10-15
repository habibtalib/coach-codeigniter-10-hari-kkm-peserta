# Test Cases — TLK (Special Vehicle Parking) & Pass System

> **Template.** Used for manual testing (Day 5 S4, Day 7 S4) and the final system test (Day 10 S3). Every test case traces to **one AC** in the URS. Save it as `docs/kes-ujian-<modul>.md`.

## Test cycle information

| Item | Value |
|---------|-------|
| Module | `<TLK / Pas / Laporan / Statistik>` |
| Cycle | `<cth Hari 5 — ujian manual 1>` |
| Tester | `<nama>` |
| Date | `2026-__-__` |
| Version / commit | `<git rev-parse --short HEAD>` |
| Environment | `php spark serve` · `http://localhost:8080` · DB `<nama>` · seeder `DatabaseSeeder` |

## General prerequisites

```bash
php spark migrate:refresh
php spark db:seed DatabaseSeeder
```

Synthetic users (password `Latihan@2026`): `pemohon1@latihan.test`, `pemohon2@latihan.test`, `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test`.

---

## Test cases

| ID | AC | Title | Role | Prerequisites | Steps | Data | Expected result | Actual result | Status |
|----|----|-------|---------|------------|---------|------|----------------|---------------|--------|
| TC-TLK-001 | AC-TLK-03-01 | `<…>` | `applicant` | `<…>` | 1. `<…>` 2. `<…>` | `<…>` | `<…>` | | ⬜ |

**Status:** ⬜ Not run · ✅ Pass · ❌ Fail · ⏭️ Blocked

---

## Filled-in example

| ID | AC | Title | Role | Prerequisites | Steps | Data | Expected result | Actual result | Status |
|----|----|-------|---------|------------|---------|------|----------------|---------------|--------|
| TC-TLK-003 | AC-TLK-03-03 | The same date counts as an overlap | `applicant` | Slot A-01 has an `approved` booking 2026-10-01 → 2026-10-10 | 1. Log in as `pemohon2` 2. Open `/tlk/tempahan/new` 3. Choose A-01, fill in the dates 4. Click "Hantar permohonan" | start 2026-10-10, end 2026-10-12 | Application rejected; message "Slot tidak tersedia bagi julat tarikh ini"; no new row in `slot_bookings` | | ⬜ |
| TC-PAS-004 | AC-PAS-04-01 | An applicant cannot view someone else's application | `applicant` | `PAS-2026-0001` owned by `pemohon1` (id = 1) | 1. Log in as `pemohon2` 2. Open `/pas/permohonan/1` directly in the address bar | — | HTTP 404 (or 403); no application details shown | | ⬜ |
| TC-PAS-006 | AC-PAS-06-01 | Reject with remarks < 10 characters | `reviewer` | `PAS-2026-0003` with status `under_review` | 1. Log in as `penyemak` 2. Open the application 3. Fill in the remarks 4. Click "Tolak" | remarks "Tidak ok" (8 characters) | Rejection blocked; message "Catatan minimum 10 aksara"; status stays `under_review`; no new `status_logs` row | | ⬜ |

---

## DB check (when the "Expected result" mentions data)

```sql
-- Example: verify the status log after an approval
SELECT module, record_id, from_status, to_status, actor_id, remarks, created_at
FROM status_logs
WHERE module = 'TLK' AND record_id = 7
ORDER BY id;
```

> Check queries are for testers only — inside the application, always use Query Builder / binding.

---

## Bug log

| Bug-ID | TC | Severity | Summary | Steps to reproduce | Expected vs actual | Fix branch | Status |
|--------|----|-----------|-----------|-------------------|---------------------|-------------------|--------|
| BUG-001 | `<TC-…>` | High / Medium / Low | `<…>` | `<…>` | `<…>` | `fix/<…>` | Open |

**Severity:**
- **High** — breaks a BR, data leak, system crash.
- **Medium** — a feature does not work but there is a workaround.
- **Low** — cosmetic, text, layout.

Fix cycle (COLLABORATION §3): **reproduce → failing test → fix → passing test**.

---

## Cycle summary

| Total | ✅ Pass | ❌ Fail | ⏭️ Blocked | ⬜ Not run |
|--------|---------|---------|-----------|---------|
| | | | | |

Tester's conclusion: `<…>`
