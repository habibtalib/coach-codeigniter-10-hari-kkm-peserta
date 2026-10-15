# Acceptance Criteria — Sistem TLK & Pas

> **Templat.** Salin ke `docs/acceptance-criteria.md` (Hari 2 Lab 2.3). Satu bahagian setiap FR. Setiap FR "Must" perlu ≥ 1 senario gembira **dan** ≥ 1 senario negatif atau sempadan.

## Peraturan menulis

| Bahagian | Peraturan | ❌ Elak |
|----------|-----------|---------|
| **Given** | Data konkrit: pengguna, slot, tarikh, status sebenar | "Given ada data" |
| **When** | **Satu** tindakan | "When isi borang dan hantar dan semak" |
| **Then** | Hasil boleh diperhatikan: mesej, status, baris DB, kod HTTP | "Then sistem berfungsi" |
| ID | `AC-{MODUL}-{nn FR}-{nn senario}` cth `AC-TLK-03-02` | ID tanpa rujukan FR |

Jenis senario: 🟢 gembira · 🔴 negatif · 🟡 sempadan · 🔒 akses

---

## Data ujian asas

> Semua senario merujuk data ini. Sintetik sahaja.

| Jenis | Data |
|-------|------|
| Pengguna (kata laluan `Latihan@2026`) | `pemohon1@latihan.test`, `pemohon2@latihan.test`, `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test` |
| Zon | `A` — Lobi Utama · `B` — Blok Pentadbiran |
| Slot | `A-01` (`mengandung`), `A-02` (`oku`), `A-03` (`pegawai_kanan`), `B-01` (`kenderaan_rasmi`) |
| Kenderaan | pemohon1: `WXX 1234` · pemohon2: `WXY 5678` (rekaan) |
| Tempahan sedia ada | `<cth TLK-2026-0007, A-01, 2026-10-01 → 2026-10-10, approved>` |
| Permohonan pas sedia ada | `<cth PAS-2026-0001 milik pemohon1, submitted>` |
| "Hari ini" | `<cth 2026-10-01>` |

---

## FR-`<MODUL>`-`<nn>` — `<tajuk ringkas FR>`

**Keperluan:** `<salin ayat FR>`
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

### Senario berjadual (untuk nilai sempadan)

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

## Contoh terisi — FR-TLK-04 (BR-TLK-04)

**Keperluan:** Sistem mesti menolak permohonan jika pemohon sudah mempunyai 1 tempahan aktif (`pending`/`approved`).
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

## Ringkasan liputan

| FR | BR | Bil. senario | 🟢 | 🔴 | 🟡 | 🔒 |
|----|----|--------------|----|----|----|----|
| FR-TLK-01 | — | | | | | |
| FR-TLK-03 | BR-TLK-01 | | | | | |
| `<…>` | | | | | | |
| **Jumlah** | | | | | | |

## Senarai semak sebelum diserahkan

- [ ] Setiap FR "Must" ada AC.
- [ ] Setiap BR (BR-TLK-01..06, BR-PAS-01..06) diliputi ≥ 1 senario.
- [ ] Setiap `When` satu tindakan; setiap `Then` boleh diperhatikan.
- [ ] Senario sempadan untuk: 90 hari, tarikh hari sama, 2 MB, 3 fail, 10 aksara.
- [ ] Sekurang-kurangnya 1 senario 🔒 akses (BR-PAS-04).
- [ ] Data sintetik sahaja.
