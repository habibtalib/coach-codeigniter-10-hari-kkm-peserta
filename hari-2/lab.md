# Lab Hari 2 — Pengesahan, Carta Alir, Acceptance Criteria & URS v1.0

[📅 Jadual](../JADUAL.md) · [📘 Kanun SPEC](../SPEC-KURSUS.md) · [📖 README Hari 2](./README.md)

| Lab | Sesi | Hasil |
|-----|------|-------|
| [Lab 2.1](#lab-21--sesi-pengesahan--log-keputusan) | S1 | `docs/log-keputusan.md`, `docs/keperluan-awal.md` v0.9 |
| [Lab 2.2](#lab-22--carta-alir-as-is--to-be) | S2 | `docs/carta-alir.md` |
| [Lab 2.3](#lab-23--acceptance-criteria-givenwhenthen) | S3 | `docs/acceptance-criteria.md` |
| [Lab 2.4](#lab-24--himpun-urs-v10) | S4 | `docs/URS-v1.md` |

Templat rujukan: [`urs-templat.md`](../templates/dokumen/urs-templat.md) · [`acceptance-criteria-templat.md`](../templates/dokumen/acceptance-criteria-templat.md).

---

## Lab 2.1 — Sesi Pengesahan & Log Keputusan

### 🎯 Objektif
Membentangkan FR kepada pemilik sistem, merekod keputusan setiap satu, dan mengemas kini senarai keperluan ke v0.9.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- `docs/keperluan-awal.md` v0.1 dan `docs/soalan-terbuka.md` dari Hari 1.
- Baca README §1.1–1.3.

### Langkah
1. Cipta `docs/log-keputusan.md`:
   ```markdown
   # Log Keputusan — Sistem TLK & Pas

   | # | Tarikh | Item | Keputusan | Sebab / butiran | Diputuskan oleh |
   |---|--------|------|-----------|-----------------|-----------------|
   ```
2. Tambah lajur **Status** pada setiap jadual FR dalam `docs/keperluan-awal.md` (nilai: `Draf`, `Disahkan`, `Diubah`, `Ditolak`, `Ditangguh`).
3. **Pembentangan (setiap pasangan 8 minit)** kepada pemilik sistem:
   - Baca 4–5 FR "Must" paling berisiko (yang menyentuh BR) dengan kuat.
   - Tanya 2 soalan terbuka paling penting dari `docs/soalan-terbuka.md`.
   - Pasangan lain mendengar dan mencatat keputusan yang terpakai kepada mereka juga.
4. Rekod setiap keputusan sebagai baris `D-nn` dalam log. Untuk "Ditangguh": wajib isi pemilik tindakan + tarikh akhir.
5. Kemas kini `docs/keperluan-awal.md`:
   - Tulis semula FR yang "Diubah" (simpan teks lama dengan ~~coret~~ di bawahnya).
   - Pindah FR yang "Ditolak" ke bahagian "Won't".
   - Tukar tajuk kepada `v0.9 (Hari 2 — selepas pengesahan)`.
6. Kemas kini `docs/soalan-terbuka.md` — tanda soalan dijawab sebagai `Ditutup (D-nn)`.
7. Commit (`git add docs/` supaya fail baharu `log-keputusan.md` turut masuk):
   ```bash
   git add docs/ && git commit -m "SETUP: pengesahan keperluan v0.9 + log keputusan"
   ```

### ✅ Checkpoint
- [ ] Setiap FR mempunyai status selain `Draf`.
- [ ] Log keputusan mengandungi ≥ 5 baris; sekurang-kurangnya satu "Diubah".
- [ ] Log mengandungi **7 keputusan wajib** pemilik sistem (contoh README §1.2 D-01, D-02; selebihnya diumumkan sebagai memo pemilik): (1) pengiraan 90 hari (BR-TLK-03); (2) pembatalan `pending`; (3) siapa boleh batal (BR-TLK-06); (4) `pending` dikira aktif untuk had 1 tempahan (BR-TLK-04); (5) pertindihan hari sama (BR-TLK-01); (6) `vehicle_id` untuk Pas; (7) `valid_until` ≥ `valid_from`.
- [ ] Setiap "Ditangguh" ada nama dan tarikh.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Pemilik sistem jawab "ikut awaklah" | Soalan ditanya sebagai pilihan teknikal | Bentang dalam bahasa perniagaan: "Jika Puan pilih A, pemohon akan…; jika B…" |
| Keputusan bercanggah dengan SPEC | Pemilik sistem mengubah fikiran | Rekod sebagai CR, jangan ubah FR secara senyap. Rujuk jurulatih — SPEC ialah kanun. |
| Terlalu banyak FR untuk dibentang | Membentang semuanya | Pilih yang menyentuh BR; yang lain disahkan secara bertulis oleh jurulatih |

### ⭐ Cabaran tambahan
Tulis satu **CR-01** lengkap (README §1.4) untuk satu keperluan yang pemilik sistem mahu tetapi tidak selaras dengan SPEC. Nilaikan kesan kepada enum, jadual DB dan ujian.

---

## Lab 2.2 — Carta Alir As-Is & To-Be

### 🎯 Objektif
Melukis 4 carta alir Mermaid (TLK/Pas × as-is/to-be) dengan lorong aktor dan menanda titik penambahbaikan yang menjejak ke pain point.

### Prasyarat
- `docs/temubual-tlk.md` dan `docs/temubual-pas.md` (bahagian proses semasa).
- Baca README §2.2–2.5.

### Langkah
1. Cipta `docs/carta-alir.md` dengan 4 bahagian: `## 1. TLK as-is`, `## 2. TLK to-be`, `## 3. Pas as-is`, `## 4. Pas to-be`.
2. **TLK as-is (15 minit):** Lukis dari jawapan temu bual — bukan dari contoh README. Minimum 3 lorong (`subgraph`): Pemohon, Kerani, Ketua Unit. Mulakan dengan rangka ini:
   ```mermaid
   flowchart TB
       subgraph P["Pemohon"]
           A([Mula]) --> B["Isi borang kertas"]
       end
       subgraph K["Kerani"]
           B --> C[("Buku log slot")]
       end
   ```
3. Di bawah carta, senaraikan **masalah yang kelihatan** — rujuk ID pain point (`PP-TLK-nn`).
4. **TLK to-be (25 minit):** Minimum 4 lorong: Pemohon (`applicant`), Sistem, Pelulus (`approver`), dan Pentadbir (`admin`) jika ada langkah urus slot. Wajib ada nod keputusan untuk:
   - validasi tarikh (BR-TLK-03)
   - had tempahan aktif (BR-TLK-04)
   - pertindihan (BR-TLK-01)
5. Tanda nod penambahbaikan dengan `classDef`:
   ```text
   classDef baik fill:#d1f2d9,stroke:#1e7b34,color:#000
   class C,D,E baik
   ```
   Kemudian tambah jadual ⚡ di bawah carta: `| ⚡ | Perubahan | Menyelesaikan (PP) | BR |`.
6. **Pas as-is & to-be (35 minit):** Ulang langkah 2–5. To-be Pas wajib menunjukkan: semakan fail (BR-PAS-02), dua lorong penyemak & pelulus, penolakan dengan catatan (BR-PAS-03), tamat tempoh oleh Sistem.
7. **Semak sintaks:** tampal setiap carta ke <https://mermaid.live>. Tiada ralat.
8. Commit:
   ```bash
   git add docs/ && git commit -m "SETUP: carta alir as-is & to-be TLK/Pas"
   ```

### ✅ Checkpoint
- [ ] 4 carta dipaparkan tanpa ralat dalam pratonton VS Code / mermaid.live.
- [ ] Setiap carta to-be ada lorong **Sistem**.
- [ ] Setiap carta to-be ada ≥ 3 titik ⚡, setiap satu dengan ID pain point.
- [ ] Nama status dalam carta to-be sepadan dengan enum SPEC (`pending`, `approved`, `under_review`, …).
- [ ] Carta to-be Pas **tidak** mempunyai laluan `submitted → approved` terus.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Parse error … got 'end'` | Nod bernama `end` | Tukar ID kepada `tamat` atau `Z` |
| Anak panah merentas lorong berselirat | Terlalu banyak nod dalam satu lorong | Guna `flowchart TB`; pindah nod keputusan ke lorong Sistem |
| Label terpotong/ralat dengan `(` atau `:` | Tiada tanda petik | `B["Semak (manual): buku log"]` |
| Aksara `<` `>` dalam label rosak | HTML ditafsir | Tulis "kurang daripada" atau guna `≤`/`≥` |

### ⭐ Cabaran tambahan
Lukis carta alir to-be untuk **pembatalan** tempahan TLK (`approved → cancelled`) dan **tamat tempoh** automatik (`approved → expired`) — siapa/apa mencetuskannya, dan apa yang direkod dalam `status_logs`.

---

## Lab 2.3 — Acceptance Criteria Given/When/Then

### 🎯 Objektif
Menulis AC yang boleh diuji untuk sekurang-kurangnya 8 FR utama, termasuk senario negatif dan sempadan, menggunakan data sintetik konkrit.

### Prasyarat
- `docs/keperluan-awal.md` v0.9.
- Baca README §3.1–3.5 dan [`acceptance-criteria-templat.md`](../templates/dokumen/acceptance-criteria-templat.md).

### Langkah
1. Cipta `docs/acceptance-criteria.md` berdasarkan templat.
2. Sediakan bahagian **Data ujian asas** di atas fail — semua senario merujuknya:
   ```markdown
   ## Data ujian asas
   - Pengguna: pemohon1@latihan.test, pemohon2@latihan.test, penyemak@latihan.test,
     pelulus@latihan.test, admin@latihan.test (kata laluan Latihan@2026)
   - Zon A "Blok Utama": slot A-01 (oku), A-02 (mengandung), A-03 (pegawai_kanan)
   - Kenderaan pemohon1: WXX 1234 · pemohon2: VXX 2468 (rekaan)
   - Tempahan sedia ada: TLK-2026-0007, slot A-01, 2026-10-01 → 2026-10-10, approved
   - "Hari ini" = 2026-10-01
   ```
3. Tulis AC untuk **8 FR wajib** berikut (minimum). ID FR ikut contoh README (atau ID setara dalam senarai anda):

   | FR | BR | Senario minimum |
   |----|----|-----------------|
   | FR-TLK-01 (mohon) | — | gembira |
   | FR-TLK-03 (pertindihan) | BR-TLK-01 | gembira, negatif, sempadan hari sama, status tidak aktif |
   | FR-TLK-04 (1 aktif) | BR-TLK-04 | negatif (ada `pending`), gembira (ada `rejected` sahaja) |
   | FR-TLK-05 (tarikh) | BR-TLK-03 | jadual 5 kes sempadan |
   | FR-TLK-07 (lulus/tolak) | — | lulus → `decided_by`/`decided_at` diisi + baris `status_logs` |
   | FR-PAS-02 (muat naik) | BR-PAS-02 | jenis salah, saiz sempadan, 4 fail |
   | FR-PAS-04 (pemilikan) | BR-PAS-04 | pemohon2 buka permohonan pemohon1 |
   | FR-PAS-06 (tolak) | BR-PAS-01, BR-PAS-03 | catatan < 10 aksara, catatan sah, tolak dari `submitted`? |

4. Beri setiap senario ID `AC-{MODUL}-{nn}-{nn}` (cth `AC-TLK-03-02`).
5. **Uji AC anda sendiri:** untuk setiap senario, tanya — *"Bolehkah seorang penguji yang tidak pernah hadir kursus ini melaksanakan senario ini dan memutuskan LULUS/GAGAL tanpa bertanya saya?"* Jika tidak, betulkan.
6. **Tukar dengan pasangan lain (10 minit):** mereka cuba "memecahkan" AC anda — cari senario yang tertinggal.
7. Commit:
   ```bash
   git add docs/ && git commit -m "SETUP: acceptance criteria TLK & Pas"
   ```

### ✅ Checkpoint
- [ ] Akhir S3: AC untuk ≥ 6 daripada 8 FR wajib (baki disiapkan dalam S4 sebelum menghimpun URS). Akhir hari: 8 FR, jumlah senario ≥ 20.
- [ ] Setiap `When` mengandungi **satu** tindakan.
- [ ] Setiap `Then` boleh diperhatikan (mesej, status, baris DB, kod HTTP).
- [ ] Senario sempadan wujud untuk: 90 hari, 2 MB, 10 aksara, tarikh hari sama (bagi FR yang sudah ada AC).
- [ ] Hanya data sintetik (`@latihan.test`, plat rekaan).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Then` = "berjaya" | Tidak spesifik | Nyatakan **apa** yang dilihat: status, mesej, rekod |
| Senario bergantung pada senario lain | Keadaan dikongsi tanpa Given | Setiap senario mesti ada `Given` sendiri yang lengkap |
| Tidak pasti jawapan betul untuk kes pelik | Keperluan belum jelas | Itu penemuan! Tambah ke `soalan-terbuka.md` dan tanya pemilik sistem |
| AC menyebut nama method PHP | Menguji pelaksanaan | Uji tingkah laku yang pengguna nampak |

### ⭐ Cabaran tambahan
1. Tulis AC untuk **dua kelulusan serentak** (BR-TLK-05): dua pelulus meluluskan dua tempahan `pending` bertindih bagi slot yang sama pada saat yang sama. Apa hasil yang dijangka?
2. Tulis AC untuk `FR-TLK-04` di mana pemohon ada tempahan `approved` yang **sudah tamat** `end_date` tetapi status masih `approved` (belum ditukar ke `expired`). Adakah ia masih "aktif"? Rekod sebagai soalan terbuka jika tidak pasti.

---

## Lab 2.4 — Himpun URS v1.0

### 🎯 Objektif
Menghimpun semua dokumen Hari 1–2 menjadi URS v1.0 lengkap dengan matriks jejak dan ditandatangani pemilik sistem.

### Prasyarat
- Lab 2.1–2.3 siap.
- [`templates/dokumen/urs-templat.md`](../templates/dokumen/urs-templat.md).

### Langkah
1. Cipta fail `docs/URS-v1.md` dan salin kandungan templat `templates/dokumen/urs-templat.md` (jurulatih akan kongsi).
2. Isi bahagian 1–4 (maklumat dokumen, pengenalan/skop, pihak berkepentingan, glosari) dari `docs/carta-skop.md`. Glosari mesti ada label BM bagi **semua** nilai `BookingStatus` dan `PassStatus`.
3. Bahagian 5: **pautkan** ke `docs/carta-alir.md` (jangan salin semula) atau tampal hanya dua carta to-be.
4. Bahagian 6: senaraikan BR-TLK-01..06 dan BR-PAS-01..06 dalam bahasa pengguna.
5. Bahagian 7–8: salin FR/NFR yang **Disahkan/Diubah** sahaja. "Ditolak" ke bahagian Luar skop / Won't.
6. Bahagian 9: pautkan ke `docs/acceptance-criteria.md`.
7. Bahagian 10: bina matriks jejak — satu baris setiap BR, lajur FR dan AC. Semak dua arah (README §4.3).
8. Bahagian 11: soalan terbuka yang masih tinggal + **andaian** (cth "Tempoh simpanan dokumen diandaikan tidak terhad sehingga Q-04 dijawab").
9. Bahagian 12: kemukakan kepada pemilik sistem. Isi nama, tarikh, dan "Disahkan" selepas beliau bersetuju.
10. Tag versi dalam Git:
    ```bash
    git add docs/ && git commit -m "SETUP: URS v1.0 disahkan"
    git tag urs-v1.0
    ```

### ✅ Checkpoint
- [ ] `docs/URS-v1.md` mengandungi 12 bahagian bertajuk. Bahagian 6, 7, 9, 10, 11 dan 12 lengkap; bahagian 1–5 dan 8 boleh bertanda **"Draf"** dan disiapkan sebelum 08:30 esok.
- [ ] Matriks jejak: 12 baris BR; **tiada** lajur AC kosong.
- [ ] Setiap FR "Must" ada ≥ 1 AC.
- [ ] Sejarah versi menunjukkan v0.1 → v0.9 → v1.0.
- [ ] Jadual tandatangan diisi; `git tag` menunjukkan `urs-v1.0`.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| URS sangat panjang, menyalin semua | Salin kandungan, bukan pautan | Pautkan ke fail sokongan; URS ialah dokumen induk |
| BR tanpa AC dalam matriks | AC tertinggal | Tulis AC minimum (satu senario negatif) sebelum tandatangan |
| Pemilik sistem enggan tandatangan | Masih ada soalan kritikal | Betul! Selesaikan atau rekod sebagai andaian yang dipersetujui |

### ⭐ Cabaran tambahan
Tambah bahagian **"Keperluan laporan"** ringkas dalam URS yang memetakan RPT-01..03 (SPEC §2.3) kepada penapis dan pengguna, supaya Hari 9 bermula dengan keperluan yang sudah disahkan.

---

## Semakan kendiri — akhir hari

```bash
ls docs/
# URS-v1.md  acceptance-criteria.md  carta-alir.md  carta-skop.md  keperluan-awal.md
# log-keputusan.md  soalan-terbuka.md  temubual-pas.md  temubual-tlk.md
git tag   # urs-v1.0
```
