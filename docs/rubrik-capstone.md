# Rubrik Demo Capstone — CI-KKM-10

[← docs](./README.md) · [Hari 10 README](../hari-10/README.md) · [SPEC](../SPEC-KURSUS.md) · [KOLABORASI (DoD)](../KOLABORASI.md)

> **Bila:** Hari 10 S4 (16:00–17:00). **Siapa dinilai:** setiap **pasangan** (markah pasangan) + satu catatan **individu** (segmen "terangkan kod"). **Siapa menilai:** panel = jurulatih (pengerusi) + pemilik sistem/wakil.
> **Baca awal:** peserta membaca rubrik ini pada akhir Hari 9 supaya tiada kejutan.

---

## 1. Format demo (15 minit)

| Minit | Segmen | Kriteria utama dinilai |
|-------|--------|------------------------|
| 0–1 | Pengenalan: pasangan, tag `v1.0-capstone`, satu ayat skop | E |
| 1–4 | **M1 TLK**: mohon → pertindihan ditolak → lulus → `TLK-2026-####` | A1 |
| 4–7 | **M2 Pas**: mohon + dokumen → semak → lulus/tolak → garis masa | A2, B |
| 7–9 | **M3 Laporan**: tapis → pagination kekal filter → PDF & Excel sama jumlah | A3 |
| 9–11 | **M4 Statistik**: 4 KPI + 4 carta → ubah status → dashboard dikemas kini | A4 |
| 11–13 | **Terangkan kod**: panel pilih fail + baris; ahli pasangan menerangkan | C, E (+ catatan individu) |
| 13–15 | Soal jawab + bukti ujian (`vendor/bin/phpunit`) + akses negatif | B, D, E |

Pada minit **15:00** demo berhenti. Segmen yang tidak ditunjukkan = tidak dinilai (markah Tahap 1 bagi kriteria berkaitan, melainkan panel melihat bukti dalam soal jawab).

---

## 2. *Gate* kritikal (lulus/gagal)

Sebarang **❌** di bawah menghadkan keputusan kepada **"Lulus bersyarat"** (maks 59) sehingga dibaiki dan disahkan jurulatih (dalam tempoh susulan 2 minggu).

| # | Gate | Cara panel menyemak |
|---|------|---------------------|
| G1 | Pengguna `applicant` **tidak** boleh membuka rekod milik pemohon lain (BR-PAS-04) | Minta pasangan tukar id dalam URL sebagai `pemohon2` |
| G2 | Route dilindungi di **server**: `applicant` tidak boleh buka `/tlk/keputusan`, `/pas/semakan`, `/laporan/*`, `/statistik` | Taip URL terus |
| G3 | Tiada `.env`, kata laluan atau data sebenar dalam repo | `git ls-files \| grep -E "(^\|/)\.env$"` → kosong |
| G4 | Fail muat naik **tidak** dalam `public/` | `ls public/` / `find public -name "*.pdf"` |
| G5 | Tiada SQL mentah bercantum input pengguna | Soal: "Tunjukkan di mana input filter masuk ke query" |

---

## 3. Kriteria & deskriptor tahap

Pemberat (selaras dengan slaid kursus): **Kefungsian 30 % · Keselamatan 20 % · Kualiti kod 20 % · Ujian 15 % · Demo 15 %**.
Setiap kriteria dinilai **Tahap 1–4**. Markah kriteria = (Tahap ÷ 4) × Pemberat.

### A. Kefungsian — 30 markah (A1 TLK 8 · A2 Pas 8 · A3 Laporan 7 · A4 Statistik 7)

| Sub | Tahap 4 (Cemerlang) | Tahap 3 (Baik) | Tahap 2 (Asas) | Tahap 1 (Belum) |
|-----|---------------------|----------------|----------------|-----------------|
| **A1 TLK** (8) | Aliran penuh + `TLK-{YYYY}-{0000}` + pertindihan (BR-TLK-01) & had 1 tempahan aktif (BR-TLK-04) ditolak dengan mesej jelas + batal | Aliran penuh; satu peraturan tidak ditunjuk | Cipta & lulus sahaja; tiada semakan pertindihan ditunjuk | Tidak berfungsi / tidak ditunjuk |
| **A2 Pas** (8) | Mohon + 1–3 dokumen sah → `under_review` → lulus/tolak (catatan wajib, BR-PAS-03) → garis masa `status_logs` | Aliran penuh; garis masa tiada/tidak lengkap | Mohon & lulus sahaja; tiada dokumen atau semakan dua peringkat | Tidak berfungsi |
| **A3 Laporan** (7) | RPT-01..03 dengan filter SPEC §2.3; pagination kekal filter; PDF (A4 landskap, header/footer) & Excel dengan jumlah **sama** | 3 laporan; satu isu kecil (cth PDF potret, satu filter tiada) | 1–2 laporan atau eksport tidak konsisten dengan skrin | Tidak berfungsi |
| **A4 Statistik** (7) | 4 KPI + 4 carta (bar, doughnut, bar mendatar, line) dari `/statistik/data`; cache + invalidasi ditunjukkan | Semua KPI & carta; invalidasi tidak ditunjuk/tidak berfungsi | ≤ 2 carta atau KPI salah takrif | Tidak berfungsi |

### B. Keselamatan & kawalan akses — 20 markah

| Tahap 4 | Tahap 3 | Tahap 2 | Tahap 1 |
|---------|---------|---------|---------|
| G1–G5 lulus; CSRF global; `esc()` konsisten; filter `group:`/`permission:` pada setiap route group **dan** semakan pemilikan dalam service; muat naik selamat (BR-PAS-02); senarai semak K1–K10 dengan bukti | G1–G5 lulus; 1–2 item K tidak dibuktikan | Satu gate gagal tetapi dikenal pasti oleh pasangan sendiri | Lebih daripada satu gate gagal |

### C. Kualiti kod & seni bina — 20 markah

| Tahap 4 | Tahap 3 | Tahap 2 | Tahap 1 |
|---------|---------|---------|---------|
| Controller nipis; logik & peraturan perniagaan (BR-TLK-01..06, BR-PAS-01..06) dalam `Services/` dengan transaksi + `FOR UPDATE`; setiap peralihan melalui enum `canTransitionTo()` dan direkod dalam `status_logs`; service didaftar dalam `Config/Services.php`; nama jadual/medan/kelas/route tepat ikut SPEC; Query Builder; commit kecil berprefix | Satu dua controller "gemuk" atau satu BR di luar service; nama majoritinya ikut SPEC | Logik perniagaan banyak dalam controller/view; status sebagai string bertaip; nama menyimpang | Struktur tidak dapat diikuti |

### D. Ujian automatik — 15 markah

| Tahap 4 | Tahap 3 | Tahap 2 | Tahap 1 |
|---------|---------|---------|---------|
| `vendor/bin/phpunit` hijau di hadapan panel; ujian meliputi pertindihan, peralihan status, akses negatif, jumlah laporan = SQL, invalidasi cache; ≥ 1 pepijat UAT dengan ujian merah→hijau | Hijau; 3–4 kawasan di atas diliputi | Beberapa ujian; ada yang merah/dilangkau | Tiada ujian berjalan |

### E. Demo & penerangan — 15 markah

| Tahap 4 | Tahap 3 | Tahap 2 | Tahap 1 |
|---------|---------|---------|---------|
| Dalam masa; aliran lancar ikut peranan; **kedua-dua** ahli menerangkan baris kod: *apa + kenapa + apa jadi jika dibuang*; menjawab "bagaimana jika…" dengan jujur | Dalam masa; penerangan *apa + kenapa* | Melebihi masa atau hanya seorang yang menerangkan; penerangan *apa* sahaja | Tidak dapat menerangkan kod sendiri |

---

## 4. Helaian markah (satu setiap pasangan)

Salin jadual ini (atau cetak) untuk setiap pasangan.

**Pasangan:** `______________________` & `______________________`  **Panel:** `A / B / C`  **Masa mula:** `__:__`  **Tag Git:** `v1.0-capstone` ☐

### 4.1 Gate kritikal

| G1 | G2 | G3 | G4 | G5 |
|----|----|----|----|----|
| ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ | ☐ ✅ ☐ ❌ |

### 4.2 Markah kriteria

| Kriteria | Pemberat | Tahap (1–4) | Markah = Tahap ÷ 4 × Pemberat | Catatan panel |
|----------|---------:|:-----------:|------------------------------:|---------------|
| A1 TLK | 8 | | | |
| A2 Pas | 8 | | | |
| A3 Laporan | 7 | | | |
| A4 Statistik | 7 | | | |
| B Keselamatan & kawalan akses | 20 | | | |
| C Kualiti kod & seni bina | 20 | | | |
| D Ujian automatik | 15 | | | |
| E Demo & penerangan | 15 | | | |
| **Jumlah** | **100** | | **____ / 100** | |

**Contoh pengiraan:** A3 Tahap 3 → 3 ÷ 4 × 7 = **5.25**; B Tahap 4 → 4 ÷ 4 × 20 = **20**.

### 4.3 Catatan individu — "terangkan kod" (minit 11–13)

| Peserta | Fail / baris dipilih panel | Tahap (1–4) | Memenuhi kriteria sijil #4? |
|---------|----------------------------|:-----------:|:---------------------------:|
| | | | ☐ Ya ☐ Tidak |
| | | | ☐ Ya ☐ Tidak |

### 4.4 Keputusan

| Julat / syarat | Keputusan | Tanda |
|----------------|-----------|:-----:|
| ≥ 85 dan semua gate ✅ | **Cemerlang** | ☐ |
| 70–84 dan semua gate ✅ | **Baik** | ☐ |
| 60–69 dan semua gate ✅ | **Lulus** | ☐ |
| < 60, **atau** mana-mana gate ❌ | **Lulus bersyarat** — pelan susulan 2 minggu | ☐ |

**Satu kekuatan utama:** ______________________________________________

**Satu perkara untuk diperbaiki:** ______________________________________________

**Tandatangan:** Jurulatih ____________  Pemilik sistem ____________  Tarikh ____________

---

## 5. Jadual konsolidasi (jurulatih, selepas S4)

| # | Pasangan | Panel | A Kefungsian (30) | B Keselamatan (20) | C Kualiti kod (20) | D Ujian (15) | E Demo (15) | Jumlah | Gate | Keputusan | Sijil tamat (peserta 1 / 2) |
|---|----------|-------|------------------:|-------------------:|-------------------:|-------------:|------------:|-------:|:----:|-----------|-----------------------------|
| 1 | | | | | | | | | | | ☐ / ☐ |
| 2 | | | | | | | | | | | ☐ / ☐ |
| 3 | | | | | | | | | | | ☐ / ☐ |
| 4 | | | | | | | | | | | ☐ / ☐ |
| 5 | | | | | | | | | | | ☐ / ☐ |
| 6 | | | | | | | | | | | ☐ / ☐ |

---

## 6. Pautan kepada kriteria sijil

Kriteria sijil tamat kursus (Hari 10 README §4.3) menggunakan rubrik ini seperti berikut:

| Kriteria sijil | Sumber dalam rubrik |
|----------------|---------------------|
| #2 Modul M1–M4 didemo | §4.2 A1–A4 masing-masing ≥ Tahap 2 |
| #3 Markah ≥ 60 dan tiada gate gagal yang tidak dibaiki | §4.2 Jumlah + §4.1 |
| #4 Peserta sendiri menerangkan satu baris kod | §4.3 ≥ Tahap 2 |

## 7. Panduan keseragaman antara panel

- Sebelum demo pertama, panel menilai **satu contoh bersama** (demo jurulatih 3 minit atau rakaman) dan menyepakati Tahap 3 bagi A3 dan E.
- Beri markah **berdasarkan apa yang ditunjukkan**, bukan apa yang didakwa. "Ia berfungsi di laptop saya semalam" = tidak ditunjukkan.
- Pemilik sistem memberi pandangan utama untuk **A** (kefungsian ikut URS); jurulatih untuk **B**, **C**, **D**; **E** dipersetujui bersama.
- Selisih > 1 tahap antara ahli panel → bincang 1 minit; jika masih berbeza, ambil tahap yang lebih rendah dan catat sebabnya.
