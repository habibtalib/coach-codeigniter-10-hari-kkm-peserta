# Pengesahan UAT — Sistem TLK & Pas

> **Templat.** Digunakan pada **Hari 10** (S3 ujian akhir, S4 demo capstone). Pemilik sistem melaksanakan (atau menyaksikan) senario UAT yang dibina daripada acceptance criteria URS v1.0, kemudian menandatangani keputusan penerimaan. Simpan sebagai `docs/UAT-signoff.md`.

## 1. Maklumat

| Perkara | Nilai |
|---------|-------|
| Sistem | Sistem TLK & Pas (M1 TLK, M2 Pas, M3 Laporan, M4 Statistik) |
| Rujukan keperluan | `docs/URS-v1.md` versi `<1.x>` |
| Pembangun (peserta) | `<…>` |
| Versi dibuat UAT | tag Git `<cth v1.0-capstone>` · commit `<…>` |
| Tarikh UAT | `2026-__-__` |
| Persekitaran | `<laptop peserta · php spark serve · DB dengan DatabaseSeeder>` |
| Pemilik sistem | `<nama persona>` |

## 2. Skop UAT

| Modul | Dalam UAT | Nota |
|-------|-----------|------|
| M1 TLK | ✅ | |
| M2 Pas | ✅ | |
| M3 Laporan | ✅ | |
| M4 Statistik | ✅ | |
| `<luar skop>` | ❌ | Rujuk URS §2.4 |

## 3. Kriteria penerimaan

Sistem **diterima** jika:
1. Semua senario UAT bertanda **Kritikal** lulus.
2. Tiada pepijat keterukan **Tinggi** terbuka.
3. Pepijat Sederhana/Rendah yang terbuka mempunyai pelan tindakan bertarikh.

## 4. Senario UAT

> Satu senario UAT boleh meliputi beberapa AC dalam satu aliran hujung-ke-hujung.

| ID | Senario (aliran) | AC diliputi | Peranan | Kritikal? | Keputusan | Catatan pemilik |
|----|------------------|-------------|---------|-----------|-----------|-----------------|
| UAT-01 | Pemohon memohon slot `A-01` → pelulus meluluskan → pemohon nampak "Diluluskan" & nombor `TLK-2026-####` | AC-TLK-01-01, AC-TLK-07-01 | `applicant`, `approver` | Ya | ⬜ | |
| UAT-02 | Permohonan bertindih bagi slot sama ditolak (termasuk tarikh hari sama) | AC-TLK-03-02, AC-TLK-03-03 | `applicant` | Ya | ⬜ | |
| UAT-03 | Pemohon dengan tempahan aktif tidak boleh mohon kali kedua | AC-TLK-04-01 | `applicant` | Ya | ⬜ | |
| UAT-04 | Pas `kenderaan` dengan 2 dokumen → penyemak ambil (Dalam Semakan) → pelulus lulus → garis masa 3 entri | AC-PAS-01-01, AC-PAS-05-01, AC-PAS-07-01, BR-PAS-05 | `applicant`, `reviewer`, `approver` | Ya | ⬜ | |
| UAT-05 | Muat naik `.docx` dan fail > 2 MB ditolak | AC-PAS-02-01, AC-PAS-02-02 | `applicant` | Ya | ⬜ | |
| UAT-06 | Penolakan tanpa catatan mencukupi disekat; dengan catatan sah berjaya | AC-PAS-06-01 | `reviewer` | Ya | ⬜ | |
| UAT-07 | `pemohon2` cuba buka permohonan `pemohon1` melalui URL → disekat | AC-PAS-04-01 | `applicant` | Ya | ⬜ | |
| UAT-08 | `applicant` cuba buka `/tlk/keputusan` dan `/statistik` → disekat | NFR-01 | `applicant` | Ya | ⬜ | |
| UAT-09 | Laporan RPT-01 ditapis (zon A, status Diluluskan) → jumlah baris = jumlah dalam DB → eksport PDF & Excel sama | FR-RPT-01 | `approver` | Tidak | ⬜ | |
| UAT-10 | Dashboard `/statistik` memaparkan 4 KPI + 4 carta; selepas satu kelulusan baharu, angka dikemas kini | FR-STAT-01 | `admin` | Tidak | ⬜ | |
| `<…>` | | | | | ⬜ | |

**Keputusan:** ⬜ Belum · ✅ Lulus · ❌ Gagal · ⚠️ Lulus bersyarat

## 5. Pepijat & isu terbuka

| Bug-ID | UAT | Keterukan | Ringkasan | Pelan tindakan | Tarikh sasaran |
|--------|-----|-----------|-----------|----------------|----------------|
| `<…>` | | | | | |

## 6. Ringkasan

| Jumlah senario | ✅ Lulus | ❌ Gagal | ⚠️ Bersyarat | Kritikal gagal |
|----------------|---------|---------|-------------|----------------|
| | | | | |

## 7. Keputusan penerimaan

Pilih satu:

- [ ] **DITERIMA** — sistem memenuhi kriteria penerimaan.
- [ ] **DITERIMA BERSYARAT** — diterima dengan syarat item berikut diselesaikan sebelum `<tarikh>`: `<…>`
- [ ] **DITOLAK** — sebab: `<…>`

## 8. Tandatangan

| Peranan | Nama | Tandatangan | Tarikh |
|---------|------|-------------|--------|
| Pemilik sistem | `<…>` | | |
| Wakil pengguna (penyemak/pelulus) | `<…>` | | |
| Pembangun (peserta) | `<…>` | | |
| Jurulatih (saksi) | `<…>` | | |

> Latihan ini menggunakan data sintetik sahaja. Tandatangan ialah simulasi proses penerimaan sebenar.
