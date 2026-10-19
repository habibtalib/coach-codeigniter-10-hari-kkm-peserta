# URS — Spesifikasi Keperluan Pengguna: Sistem TLK & Pas

> **Templat.** Salin ke `docs/URS-v1.md` (Hari 2 Lab 2.4). Ganti semua `<…>`. Padam blok "Panduan" selepas diisi. Rujuk [`docs/spesifikasi-sistem.md`](../../docs/spesifikasi-sistem.md) untuk nama status, peranan dan BR — **jangan** mencipta nilai baharu.

---

## 1. Maklumat dokumen

| Perkara | Nilai |
|---------|-------|
| Nama sistem | Sistem Tempat Letak Kenderaan Khas (TLK) & Pas |
| Organisasi | `<Fasiliti KKM rekaan, cth Hospital Latihan Seri Harapan>` |
| Pemilik sistem | `<nama persona>` |
| Disediakan oleh | `<nama peserta>` |
| Versi | `1.0` |
| Tarikh | `2026-__-__` |
| Status | `Draf` / `Untuk semakan` / **`Disahkan`** |

### 1.1 Sejarah versi

| Versi | Tarikh | Perubahan | Oleh |
|-------|--------|-----------|------|
| 0.1 | `<Hari 1>` | Senarai awal FR/NFR dari temu bual | `<…>` |
| 0.9 | `<Hari 2>` | Selepas sesi pengesahan (lihat log keputusan) | `<…>` |
| 1.0 | `<Hari 2>` | Disahkan pemilik sistem | `<…>` |

---

## 2. Pengenalan

### 2.1 Latar belakang
> Panduan: 3–5 ayat tentang proses semasa dan masalahnya. Rujuk pain point `PP-TLK-nn` / `PP-PAS-nn`.

`<…>`

### 2.2 Matlamat
`<1–2 ayat dalam bahasa pemilik sistem>`

### 2.3 Skop

| Modul | Dalam skop |
|-------|-----------|
| M1 TLK | `<…>` |
| M2 Pas | `<…>` |
| M3 Laporan | RPT-01, RPT-02, RPT-03 + eksport PDF/Excel |
| M4 Statistik | 4 kad KPI + 4 carta |

### 2.4 Luar skop (fasa ini)
- `<cth Bayaran/caj parkir>`
- `<cth Notifikasi SMS/WhatsApp>`
- `<…>`

---

## 3. Pihak berkepentingan & peranan

| Pihak berkepentingan | Peranan sistem (Shield group) | Tanggungjawab dalam sistem |
|----------------------|-------------------------------|----------------------------|
| Kakitangan / kontraktor | `applicant` | Mohon tempahan TLK & pas; lihat status sendiri |
| Pegawai penyemak | `reviewer` | Semak permohonan pas; tolak dengan catatan |
| Pegawai pelulus | `approver` | Lulus/tolak tempahan TLK & pas; lihat laporan & statistik |
| Pentadbir sistem | `admin` | Urus zon, slot, pengguna; akses penuh |
| `<pengguna tidak langsung>` | *(tiada akaun)* | `<…>` |

---

## 4. Glosari

| Istilah | Maksud |
|---------|--------|
| TLK | Tempat Letak Kenderaan Khas |
| Slot | Satu petak letak kenderaan bernombor dalam satu zon |
| Zon | Kawasan letak kenderaan (cth Zon A — Lobi Utama) |
| Tempahan aktif | Tempahan berstatus Menunggu (`pending`) atau Diluluskan (`approved`) |
| `<…>` | `<…>` |

### 4.1 Status

| Modul | Nilai | Label BM |
|-------|-------|----------|
| TLK | `pending` | Menunggu |
| TLK | `approved` | Diluluskan |
| TLK | `rejected` | Ditolak |
| TLK | `cancelled` | Dibatalkan |
| TLK | `expired` | Tamat Tempoh |
| Pas | `submitted` | Dihantar |
| Pas | `under_review` | Dalam Semakan |
| Pas | `approved` | Diluluskan |
| Pas | `rejected` | Ditolak |
| Pas | `expired` | Tamat Tempoh |

---

## 5. Proses to-be

> Panduan: pautkan ke `docs/carta-alir.md` atau tampal dua carta to-be Mermaid. Senaraikan titik penambahbaikan ⚡.

- Carta alir: `docs/carta-alir.md` (dalam repo projek anda)

| ⚡ | Penambahbaikan | Pain point | BR |
|----|----------------|------------|----|
| 1 | `<…>` | `<PP-…>` | `<BR-…>` |

---

## 6. Peraturan perniagaan

> Panduan: tulis dalam bahasa pengguna. ID mesti sama seperti SPEC §2.

| ID | Peraturan |
|----|-----------|
| BR-TLK-01 | `<…>` |
| BR-TLK-02 | `<…>` |
| BR-TLK-03 | `<…>` |
| BR-TLK-04 | `<…>` |
| BR-TLK-05 | `<…>` |
| BR-TLK-06 | `<…>` |
| BR-PAS-01 | `<…>` |
| BR-PAS-02 | `<…>` |
| BR-PAS-03 | `<…>` |
| BR-PAS-04 | `<…>` |
| BR-PAS-05 | `<…>` |
| BR-PAS-06 | `<…>` |

---

## 7. Keperluan fungsian

> Panduan: pola *"[Aktor] boleh / Sistem mesti [tindakan] [objek] [syarat]"*. Satu FR = satu tindakan. Hanya FR berstatus Disahkan/Diubah.

### 7.1 Modul TLK

| ID | Keperluan | BR | MoSCoW | Status |
|----|-----------|----|--------|--------|
| FR-TLK-01 | `<…>` | `<…>` | Must | Disahkan |

### 7.2 Modul Pas

| ID | Keperluan | BR | MoSCoW | Status |
|----|-----------|----|--------|--------|
| FR-PAS-01 | `<…>` | | | |

### 7.3 Laporan & Statistik

| ID | Keperluan | MoSCoW | Status |
|----|-----------|--------|--------|
| FR-RPT-01 | `<…>` | | |
| FR-STAT-01 | `<…>` | | |

### 7.4 Won't (dipersetujui tidak dibuat fasa ini)

| ID | Keperluan | Sebab (rujuk log keputusan) |
|----|-----------|-----------------------------|
| `<…>` | `<…>` | `<D-nn>` |

---

## 8. Keperluan bukan fungsian

| ID | Kategori | Keperluan | Cara ukur |
|----|----------|-----------|-----------|
| NFR-01 | Keselamatan | `<…>` | `<…>` |
| NFR-02 | | | |

---

## 9. Acceptance criteria

- Fail penuh: `docs/acceptance-criteria.md` (dalam repo projek anda; templat: [`acceptance-criteria-templat.md`](./acceptance-criteria-templat.md))
- Ringkasan: `<bil.>` FR mempunyai AC; jumlah senario `<bil.>`.

---

## 10. Matriks jejak

> Panduan: satu baris setiap BR. Tiada sel AC kosong sebelum tandatangan. Lajur "Ujian" diisi pada Hari 6/8.

| BR | FR | AC | Ujian (Hari 6/8) |
|----|----|----|------------------|
| BR-TLK-01 | | | |
| BR-TLK-02 | | | |
| BR-TLK-03 | | | |
| BR-TLK-04 | | | |
| BR-TLK-05 | | | |
| BR-TLK-06 | | | |
| BR-PAS-01 | | | |
| BR-PAS-02 | | | |
| BR-PAS-03 | | | |
| BR-PAS-04 | | | |
| BR-PAS-05 | | | |
| BR-PAS-06 | | | |

---

## 11. Soalan terbuka & andaian

| # | Soalan / andaian | Pemilik tindakan | Tarikh akhir | Status |
|---|------------------|------------------|--------------|--------|
| Q-01 | `<…>` | `<…>` | `<…>` | Terbuka |
| A-01 | Andaian: `<…>` | — | — | Dipersetujui |

---

## 12. Pengesahan

Dengan menandatangani, pemilik sistem bersetuju bahawa keperluan di atas lengkap bagi fasa ini. Perubahan selepas v1.0 melalui permohonan perubahan (CR) dan menaikkan versi dokumen.

| Peranan | Nama | Tarikh | Keputusan |
|---------|------|--------|-----------|
| Pemilik sistem | `<…>` | `<…>` | Disahkan / Ditolak (sebab: `<…>`) |
| Pembangun (peserta) | `<…>` | `<…>` | Disediakan |
| Jurulatih | `<…>` | `<…>` | Disemak |

### 12.1 Log permohonan perubahan (selepas v1.0)

| CR-ID | Tarikh | Keperluan terkesan | Perubahan | Kesan | Keputusan |
|-------|--------|--------------------|-----------|-------|-----------|
| CR-01 | | | | | |
