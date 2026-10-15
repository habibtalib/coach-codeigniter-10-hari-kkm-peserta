# Acceptance Criteria — TLK (Special Vehicle Parking) & Pass System

> **Template.** Copy to `docs/acceptance-criteria.md` (Day 2 Lab 2.3). One section per FR. Every "Must" FR needs ≥ 1 happy scenario **and** ≥ 1 negative or boundary scenario.

## Writing rules

| Part | Rule | ❌ Avoid |
|----------|-----------|---------|
| **Given** | Concrete data: actual user, slot, date, status | "Given there is data" |
| **When** | **One** action | "When fill in the form and submit and check" |
| **Then** | An observable result: message, status, DB row, HTTP code | "Then the system works" |
| ID | `AC-{MODUL}-{nn FR}-{nn senario}` e.g. `AC-TLK-03-02` | An ID with no FR reference |

Scenario types: 🟢 happy · 🔴 negative · 🟡 boundary · 🔒 access

---

## Base test data

> Every scenario refers to this data. Synthetic only.

| Type | Data |
|-------|------|
| Users (password `Latihan@2026`) | `pemohon1@latihan.test`, `pemohon2@latihan.test`, `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test` |
| Zones | `A` — Main Lobby · `B` — Administration Block |
| Slots | `A-01` (`mengandung`), `A-02` (`oku`), `A-03` (`pegawai_kanan`), `B-01` (`kenderaan_rasmi`) |
| Vehicles | pemohon1: `WXX 1234` · pemohon2: `WXY 5678` (fictitious) |
| Existing booking | `<cth TLK-2026-0007, A-01, 2026-10-01 → 2026-10-10, approved>` |
| Existing pass application | `<cth PAS-2026-0001 milik pemohon1, submitted>` |
| "Today" | `<cth 2026-10-01>` |

---

## FR-`<MODUL>`-`<nn>` — `<tajuk ringkas FR>`

**Requirement:** `<salin ayat FR>`
**BR:** `<BR-… atau —>` · **MoSCoW:** `<Must/Should/Could>`

```gherkin
# AC-<MODUL>-<nn>-01 🟢
Senario: <nama ringkas>
  Given <keadaan awal>
  And   <keadaan tambahan jika perlu>
  When  <satu tindakan>
  Then  <hasil boleh diperhatikan>
  And   <hasil tambahan>

# AC-<MODUL>-<nn>-02 🔴
Senario: <…>
  Given <…>
  When  <…>
  Then  <…>
```

### Table-driven scenarios (for boundary values)

```gherkin
# AC-<MODUL>-<nn>-03 🟡
Senario Rangka: <nama>
  Given <keadaan>
  When  <tindakan dengan <parameter>>
  Then  keputusan ialah <keputusan>

  Contoh:
    | parameter | keputusan |
    | <…>       | <…>       |
```

---

## Filled-in example — FR-TLK-04 (BR-TLK-04)

**Requirement:** The system must reject an application if the applicant already has 1 active booking (`pending`/`approved`).
**BR:** BR-TLK-04 · **MoSCoW:** Must

```gherkin
# AC-TLK-04-01 🔴
Senario: Pemohon dengan tempahan pending tidak boleh mohon lagi
  Given pemohon1@latihan.test ada tempahan TLK-2026-0010 berstatus pending
  When  dia menghantar permohonan baharu untuk slot A-02 dari 2026-11-01 hingga 2026-11-05
  Then  permohonan tidak disimpan
  And   mesej "Anda sudah mempunyai satu tempahan aktif" dipaparkan

# AC-TLK-04-02 🟢
Senario: Tempahan rejected tidak dikira aktif
  Given pemohon2@latihan.test hanya ada tempahan berstatus rejected
  When  dia menghantar permohonan untuk slot A-02 dari 2026-11-01 hingga 2026-11-05
  Then  permohonan disimpan dengan status "pending"
```

---

## Coverage summary

| FR | BR | No. of scenarios | 🟢 | 🔴 | 🟡 | 🔒 |
|----|----|--------------|----|----|----|----|
| FR-TLK-01 | — | | | | | |
| FR-TLK-03 | BR-TLK-01 | | | | | |
| `<…>` | | | | | | |
| **Total** | | | | | | |

## Checklist before submitting

- [ ] Every "Must" FR has ACs.
- [ ] Every BR (BR-TLK-01..06, BR-PAS-01..06) is covered by ≥ 1 scenario.
- [ ] Every `When` is one action; every `Then` is observable.
- [ ] Boundary scenarios for: 90 days, same-day dates, 2 MB, 3 files, 10 characters.
- [ ] At least 1 🔒 access scenario (BR-PAS-04).
- [ ] Synthetic data only.
