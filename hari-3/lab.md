# Lab Hari 3 — ERD, Kamus Data, Wireframe & Semakan Reka Bentuk

[📅 Jadual](../JADUAL.md) · [📘 Kanun SPEC](../SPEC-KURSUS.md) · [📖 README Hari 3](./README.md)

| Lab | Sesi | Hasil |
|-----|------|-------|
| [Lab 3.1](#lab-31--erd-mermaid) | S1 | `docs/erd.md` |
| [Lab 3.2](#lab-32--kamus-data--normalisasi) | S2 | `docs/kamus-data.md` |
| [Lab 3.3](#lab-33--wireframe-6-skrin-utama) | S3 | `docs/wireframe/`, `docs/wireframe.md` |
| [Lab 3.4](#lab-34--semakan-silang-reka-bentuk) | S4 | `docs/semakan-reka-bentuk.md` |

> **Peraturan hari ini:** SPEC §3 ialah jawapan akhir untuk nama jadual & medan. Tugas anda bukan mencipta skema baharu — tetapi **membina semula** skema itu dari URS anda sendiri, memahami **kenapa** setiap bahagian wujud, dan menemui apa yang anda terlepas.

---

## Lab 3.1 — ERD Mermaid

### 🎯 Objektif
Mengenal pasti entiti dan kardinaliti dari URS, kemudian melukis ERD Mermaid yang sepadan 100% dengan SPEC §3.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- `docs/URS-v1.md` (Hari 2) dan senarai kata nama (persediaan semalam).
- Baca README §1.1–1.2.

### Langkah
1. **Tanpa melihat SPEC §3 (15 minit):** Pada kertas, senaraikan entiti dari kata nama URS anda. Lukis kotak dan garisan. Tulis kardinaliti di setiap hujung.
2. **Bandingkan (5 minit):** Buka SPEC §3. Senaraikan dalam `docs/erd.md` bahagian `## Apa yang saya terlepas`:
   ```markdown
   ## Apa yang saya terlepas (lakaran pertama vs SPEC)
   - Tidak terfikir `reference_sequences` — saya anggap ref_no dijana dari id
   - Saya buat jadual `roles` — salah, peranan dalam Shield
   ```
3. Cipta ERD dalam `docs/erd.md`. Mulakan dengan dua jadual dan satu hubungan, pratonton, kemudian tambah:
   ```mermaid
   erDiagram
       parking_zones {
           int id PK
           varchar code UK "VARCHAR(10)"
           varchar name "VARCHAR(100)"
           varchar location "VARCHAR(150)"
           datetime created_at
           datetime updated_at
       }
       parking_slots {
           int id PK
           int zone_id FK
           varchar slot_no "VARCHAR(10)"
           varchar category "VARCHAR(20) SlotCategory"
           tinyint is_active "DEFAULT 1"
           datetime created_at
           datetime updated_at
           datetime deleted_at
       }
       parking_zones ||--o{ parking_slots : "zone_id"
   ```
4. Tambah baki 8 jadual **satu demi satu**, pratonton selepas setiap jadual. Susunan disyorkan: `departments` → `users` → `vehicles` → `slot_bookings` → `pass_applications` → `pass_documents` → `status_logs` → `reference_sequences`.
5. Tambah semua hubungan. Perhatikan `|o--o{` untuk FK NULL (`department_id`, `decided_by`, `vehicle_id` dalam `pass_applications`, `reviewed_by`, `approved_by`).
6. Di bawah ERD, tambah jadual kardinaliti (README §1.2) dan **terangkan dengan ayat anda sendiri** tiga keputusan reka bentuk (README §1.4 a, b, c).
7. Commit: `SETUP: ERD Mermaid sistem TLK & Pas`.

### ✅ Checkpoint
- [ ] ERD dipaparkan tanpa ralat di mermaid.live.
- [ ] **10 jadual** — kira: `departments`, `users`, `parking_zones`, `parking_slots`, `vehicles`, `slot_bookings`, `pass_applications`, `pass_documents`, `status_logs`, `reference_sequences`.
- [ ] Semak silang dengan skrip ringkas (jalankan dalam folder repo anda):
  ```bash
  for t in departments users parking_zones parking_slots vehicles slot_bookings \
           pass_applications pass_documents status_logs reference_sequences; do
    grep -Eq "^[[:space:]]*$t \{" docs/erd.md && echo "OK  $t" || echo "TIADA $t"
  done
  ```
  Semua baris mesti `OK`.
- [ ] 13 hubungan (termasuk dua hubungan `users`–`pass_applications` untuk `reviewed_by` dan `approved_by`).
- [ ] Tiada `users.role`.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Parse error` pada baris atribut (terutama dalam pemapar Mermaid versi lama) | Jenis mengandungi `(` seperti `varchar(20)` | Untuk keserasian semua pemapar, tulis jenis ringkas `varchar` dan letak panjang dalam komen `"VARCHAR(20)"` |
| Ralat pada `PK FK` | Berbilang kunci tanpa koma | Guna `PK`, `FK`, `UK` huruf besar; berbilang dipisah koma: `PK, FK` |
| Diagram terlalu lebar untuk dibaca | 10 jadual dengan semua medan | Normal. Untuk pembentangan, buat versi kedua tanpa `created_at`/`updated_at` |
| Ralat pada baris hubungan | Label hubungan tertinggal (Mermaid mewajibkan `: label`) | `users \|\|--o{ vehicles : "user_id"` |

### ⭐ Cabaran tambahan
Tambah ERD kedua **khusus Shield** yang menunjukkan hubungan `users` dengan `auth_identities` dan `auth_groups_users` (rujuk dokumentasi Shield). Terangkan kenapa e-mel pengguna tidak berada dalam `users`.

---

## Lab 3.2 — Kamus Data & Normalisasi

### 🎯 Objektif
Menulis kamus data lengkap untuk 5 jadual teras dalam sesi (baki 5 jadual disiapkan sebelum Hari 4, 08:30) dan membuktikan skema berada dalam 3NF melalui latihan normalisasi.

### Prasyarat
- Lab 3.1 siap.
- [`templates/dokumen/kamus-data-templat.md`](../templates/dokumen/kamus-data-templat.md), README §2.

### Langkah
1. Cipta fail `docs/kamus-data.md` dan salin kandungan templat [`templates/dokumen/kamus-data-templat.md`](../templates/dokumen/kamus-data-templat.md) ke dalamnya (bahagian `## Jadual: <nama_jadual>` diulang untuk setiap jadual).
2. **Dalam sesi — 5 jadual teras, bahagi kerja dalam pasangan:** driver menulis `parking_slots` dan `slot_bookings`; navigator menyemak terhadap SPEC. Tukar untuk `pass_applications`, `pass_documents`, `status_logs`.
   **Baki 5 jadual** (`departments`, `users`, `parking_zones`, `vehicles`, `reference_sequences`) — siapkan sebelum **Hari 4, 08:30** bersama tugasan persediaan T3 ([`docs/tugasan-persediaan.md`](../docs/tugasan-persediaan.md)). Jadual ini kecil; README §2.5 memberi kunci unik dan nota khasnya.
3. Untuk setiap jadual isi **semua** lajur: Medan, Jenis, NULL, Lalai, Kunci/Index, FK →, Peraturan/enum, Keterangan. Gunakan `slot_bookings` dalam README §2.2 sebagai contoh.
4. Isi lajur **Peraturan** dengan rujukan BR, cth:
   - `pass_documents.mime` → `application/pdf`, `image/jpeg`, `image/png` (BR-PAS-02)
   - `pass_documents.size_bytes` → ≤ 2,097,152 (BR-PAS-02)
   - `status_logs.remarks` → wajib ≥ 10 aksara jika `to_status = rejected` — kedua-dua modul: BR-PAS-03 untuk Pas, SPEC §9 untuk penolakan tempahan TLK
5. Isi bahagian **Peraturan ON DELETE** (README §2.3) — anda boleh bersetuju atau tidak dengan cadangan, tetapi **tulis sebab**.
6. **Latihan normalisasi (25 minit):** Dalam bahagian `## Normalisasi`, ambil hamparan Pas di bawah (data rekaan) dan normalkan ke 3NF. Tunjukkan jadual yang terhasil pada setiap langkah 1NF → 2NF → 3NF.

   | No Rujukan | Nama Pemohon | No Staf | Kod Jabatan | Nama Jabatan | Jenis Pas | Plat | Model Kenderaan | Dok 1 | Dok 2 | Dok 3 | Status | Disemak Oleh | Dilulus Oleh |
   |------------|--------------|---------|-------------|--------------|-----------|------|-----------------|-------|-------|-------|--------|--------------|--------------|
   | PAS-2026-0001 | Aminah Latihan | S1001 | JKP | Jabatan Kejururawatan | kenderaan | WXX 1234 | Myvi | geran.pdf | ic.jpg | | approved | Faizal | Noraini |
   | PAS-2026-0002 | Chong Rekaan | — | — | — | kontraktor | | | lantikan.pdf | ic.png | permit.pdf | under_review | Faizal | |

7. Tulis satu perenggan: **"Jadual SPEC mana yang terhasil daripada normalisasi ini, dan mana yang tidak (dan kenapa)?"** (Petunjuk: `status_logs` dan `reference_sequences` tidak muncul dari normalisasi — ia muncul dari keperluan audit dan nombor rujukan.)
8. Commit: `SETUP: kamus data + normalisasi 3NF`.

### ✅ Checkpoint
- [ ] 5 jadual teras (`parking_slots`, `slot_bookings`, `pass_applications`, `pass_documents`, `status_logs`) dalam kamus data; tiada sel kosong dalam lajur Jenis dan NULL. Baki 5 jadual dijadualkan sebelum Hari 4.
- [ ] Setiap FK mempunyai peraturan `ON DELETE` dan sebab.
- [ ] Semua medan UNIQUE dalam 5 jadual teras (termasuk komposit `(zone_id, slot_no)`) disenaraikan; `(prefix, year)` ditambah bersama `reference_sequences` sebelum Hari 4.
- [ ] Latihan normalisasi menghasilkan sekurang-kurangnya `users`, `departments`, `vehicles`, `pass_applications`, `pass_documents`.
- [ ] Jenis & panjang sepadan SPEC (cth `pass_documents.mime` VARCHAR(80), `status_logs.module` VARCHAR(5)).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Dok 1/2/3` dijadikan 3 lajur dalam `pass_applications` | Tidak mengenal kumpulan berulang | 1NF: kumpulan berulang → jadual anak `pass_documents` |
| "Disemak Oleh" dijadikan teks nama | Menyimpan nilai, bukan rujukan | FK `reviewed_by` → `users.id` |
| Tidak pasti NULL atau tidak | Keperluan tidak jelas | Tanya: "Adakah nilai ini wujud **pada saat rekod dicipta**?" `decided_at` tidak → NULL |
| Kontraktor tiada no staf — pecahkan UNIQUE? | UNIQUE vs NULL | MySQL membenarkan banyak NULL dalam lajur UNIQUE — sebab itu `staff_no` UNIQUE **NULL** |

### ⭐ Cabaran tambahan
Anggarkan saiz data selepas 3 tahun (200 tempahan TLK + 500 permohonan pas setahun, purata 2 dokumen, purata 3 log status setiap rekod). Berapa baris `status_logs`? Adakah `INDEX(module, record_id)` perlu? Terangkan.

---

## Lab 3.3 — Wireframe 6 Skrin Utama

### 🎯 Objektif
Melakar wireframe kesetiaan rendah bagi 6 skrin utama mengikut aliran pengguna to-be, dengan setiap medan dipetakan ke kamus data.

### Prasyarat
- `docs/carta-alir.md` (to-be) dan `docs/kamus-data.md`.
- draw.io (<https://app.diagrams.net>) atau Excalidraw (<https://excalidraw.com>) — atau kertas + foto.
- Baca README §3.

### Langkah
1. Cipta `docs/wireframe/` dan `docs/wireframe.md`. Dalam `wireframe.md` tampal jadual 6 skrin (README §3.3) dan carta aliran pengguna (README §3.2).
2. **Lakar layout induk dahulu (10 minit):** bar navigasi (menu ikut peranan), breadcrumb, kawasan kandungan, kawasan flash message. Semua skrin guna layout ini (Hari 4 ia menjadi `app/Views/layouts/main.php`).
3. **Lakar 6 skrin (60 minit — ~10 minit setiap satu).** Setiap skrin mesti ada:
   - Tajuk skrin + breadcrumb
   - Semua medan/lajur (nama BM) — dipetakan ke medan kamus data
   - Butang tindakan (ikut peranan)
   - Ruang mesej ralat **dan** keadaan kosong
   - Nota di tepi: `URL`, `Peranan`, `FR`

   | Skrin | Wajib ada |
   |-------|-----------|
   | W1 Senarai tempahan saya | Lajur: No Rujukan, Slot, Tarikh, Status (badge BM), Tindakan (Batal hanya jika Diluluskan); pagination; butang "Mohon baharu" |
   | W2 Borang tempahan | Zon (penapis senarai Slot sahaja — tidak disimpan; zon diterbitkan melalui `slot_id → parking_slots.zone_id`), Slot (aktif sahaja), Kenderaan, Tarikh mula, Tarikh tamat, Sebab; nota had 90 hari & 1 tempahan aktif |
   | W3 Keputusan TLK | Senarai tempahan; penapis status (lalai Menunggu); butang Lulus/Tolak + catatan |
   | W4 Borang pas | Jenis pas, Kenderaan (muncul jika `kenderaan`), Tujuan, Sah dari/hingga, 3 slot muat naik + nota format/saiz |
   | W5 Semakan pas | Butiran, senarai dokumen (muat turun), garis masa `status_logs`, catatan, butang ikut peranan |
   | W6 Dashboard statistik | 4 kad KPI + 4 kawasan carta (SPEC §2.4) |

4. Eksport setiap skrin sebagai PNG: `docs/wireframe/W1-senarai-tempahan.png`, `W2-borang-tempahan.png`, `W3-keputusan-tlk.png`, `W4-borang-pas.png`, `W5-semakan-pas.png`, `W6-dashboard-statistik.png`. Simpan juga fail sumber (`.drawio` / `.excalidraw`).
5. Pautkan imej dalam `docs/wireframe.md`:
   ```markdown
   ### W2 — Borang tempahan TLK
   URL: `/tlk/tempahan/new` · Peranan: `applicant` · FR: FR-TLK-01, 03, 04, 05
   ![W2](wireframe/W2-borang-tempahan.png)
   Medan dijana sistem (bukan input): `ref_no`, `user_id`, `status`
   ```
6. **Ujian jalan kertas (10 minit):** Seorang dari pasangan lain berlakon sebagai `pemohon1` dan "klik" melalui W1 → W2 → W1 menggunakan lakaran anda. Catat di mana dia keliru.
7. Commit: `SETUP: wireframe 6 skrin utama`.

### ✅ Checkpoint
- [ ] 6 fail PNG + sumber dalam `docs/wireframe/`.
- [ ] Setiap medan borang W2 dan W4 wujud dalam `docs/kamus-data.md` (kecuali Zon di W2 — penapis paparan, ditanda "tidak disimpan").
- [ ] W2 dan W4 **tidak** mengandungi `user_id`, `status` atau `ref_no` sebagai input.
- [ ] Label status BM tepat: Menunggu, Diluluskan, Ditolak, Dibatalkan, Tamat Tempoh, Dihantar, Dalam Semakan.
- [ ] W5 menunjukkan butang berbeza untuk `reviewer` dan `approver`.
- [ ] Ujian jalan kertas dijalankan; sekurang-kurangnya 1 penambahbaikan dibuat.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Terlalu lama pada satu skrin | Menghias (warna, ikon, fon) | Kotak kelabu & teks sahaja. Had 10 minit setiap skrin |
| Medan dalam wireframe tiada dalam DB | Reka UI sebelum semak kamus data | Sama ada buang medan, atau buka CR (jangan tambah medan senyap) |
| Draw.io tidak dapat dibuka (rangkaian) | Sekatan internet | Guna aplikasi desktop draw.io atau kertas + foto telefon |
| Dashboard W6 kosong kerana "belum tahu data" | Keliru | Lakar kotak berlabel: "Carta bar: tempahan ikut bulan" — cukup |

### ⭐ Cabaran tambahan
Lakar skrin ke-7: **W7 Laporan RPT-01** (`/laporan/tempahan`) dengan borang penapis GET (julat tarikh, zon, kategori, status), jadual berpagination, dan butang Eksport PDF / Excel (SPEC §2.3).

---

## Lab 3.4 — Semakan Silang Reka Bentuk

### 🎯 Objektif
Menyemak ERD dan wireframe pasangan lain menggunakan senarai semak, membetulkan reka bentuk sendiri, dan memahami tugasan persediaan.

### Prasyarat
- Lab 3.1–3.3 siap.
- README §4.1–4.2.

### Langkah
1. Cipta `docs/semakan-reka-bentuk.md`:
   ```markdown
   # Semakan Reka Bentuk — Hari 3
   Disemak oleh: Pasangan __ · Tarikh: 2026-__-__

   | # | Semakan | Lulus/Gagal | Catatan |
   |---|---------|-------------|---------|
   | E1 | 10 jadual, nama tepat | | |
   ...
   | U6 | W4 papar had fail | | |

   ## Pembetulan yang dibuat
   | # | Apa diubah | Fail | Commit |
   ```
2. **Semakan silang (20 minit):** Tukar laptop dengan pasangan lain. Semak ERD & wireframe mereka dengan senarai E1–E8 dan U1–U6. Isi dalam fail **mereka**.
3. **Semakan jurulatih (bergilir):** Jurulatih memilih 2 item secara rawak dan meminta anda **menerangkan** (cth "Kenapa `vehicle_id` NULL di sini?").
4. **Betulkan (20 minit):** Pulang ke laptop sendiri. Betulkan setiap item "Gagal". Rekod dalam jadual "Pembetulan".
5. Baca [`docs/tugasan-persediaan.md`](../docs/tugasan-persediaan.md) bersama pasangan. Tulis sebarang soalan di hujung `docs/soalan-terbuka.md`.
6. Commit dan tag:
   ```bash
   git add docs/ && git commit -m "SETUP: semakan reka bentuk Hari 3"
   git tag reka-bentuk-v1.0
   ```

### ✅ Checkpoint
- [ ] Semua 14 item (E1–E8, U1–U6) bertanda Lulus selepas pembetulan.
- [ ] Anda boleh menerangkan mana-mana medan dalam ERD kepada jurulatih tanpa melihat nota.
- [ ] `git tag` menunjukkan `urs-v1.0` dan `reka-bentuk-v1.0`.
- [ ] Anda tahu 4 tugasan persediaan dan tarikh akhirnya (Hari 4, 08:30).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Penyemak "lulus semua" dengan cepat | Tidak benar-benar menyemak | Jurulatih memilih rawak 2 item untuk disahkan semula |
| Bertengkar tentang pilihan `ON DELETE` | Kedua-dua pihak ada logik | Terima jika sebab ditulis; SPEC tidak mengunci `ON DELETE` |
| Tidak sempat betulkan wireframe | Masa | Utamakan ERD & kamus data — esok ia menjadi migration |

### ⭐ Cabaran tambahan
Tulis draf **migration pertama** di atas kertas (pseudo-susunan): senaraikan urutan jadual yang mesti dicipta supaya setiap FK merujuk jadual yang sudah wujud. (Petunjuk: `departments` sebelum `users`? — `users` dicipta oleh Shield; medan tambahan ditambah kemudian.)

---

## Semakan kendiri — akhir hari

```bash
ls docs/ docs/wireframe/
# docs/: erd.md  kamus-data.md  semakan-reka-bentuk.md  wireframe.md  wireframe/ ... (fail Hari 1–2)
# docs/wireframe/: W1-senarai-tempahan.png … W6-dashboard-statistik.png + fail sumber
grep -cE '^[[:space:]]*[a-z_]+ \{' docs/erd.md   # 10
grep -c '^## Jadual:' docs/kamus-data.md           # ≥ 5 (10 sebelum Hari 4)
git log --oneline | wc -l
git tag                                            # urs-v1.0  reka-bentuk-v1.0
```

- [ ] `ls docs/` menunjukkan `erd.md`, `kamus-data.md`, `wireframe.md`, `semakan-reka-bentuk.md` dan folder `wireframe/` dengan 6 PNG + sumber.
- [ ] ERD dipaparkan tanpa ralat di mermaid.live; `grep` di atas mengira **10** jadual.
- [ ] Kamus data: 5 jadual teras lengkap (tiada sel kosong dalam Jenis/NULL); baki 5 dijadualkan sebelum Hari 4, 08:30.
- [ ] Bahagian `## Normalisasi` menunjukkan langkah 1NF → 2NF → 3NF.
- [ ] `git log --oneline | wc -l` bertambah sekurang-kurangnya 4 berbanding akhir Hari 2 (ERD, kamus data, wireframe, semakan).
- [ ] `git tag` menunjukkan `urs-v1.0` dan `reka-bentuk-v1.0`.
