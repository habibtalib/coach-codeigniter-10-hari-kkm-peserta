# Lab Hari 1 — Carta Skop, Temu Bual & Senarai Keperluan

[📅 Jadual](../JADUAL.md) · [📘 Kanun SPEC](../docs/spesifikasi-sistem.md) · [📖 README Hari 1](./README.md)

> Semua lab hari ini menghasilkan **dokumen Markdown**, bukan kod (kecuali Lab 1.5 dalam S4: CI4 asas di Laragon). Kerja berpasangan (driver menaip, navigator menyemak terhadap SPEC) — tukar peranan setiap lab.

| Lab | Sesi | Hasil |
|-----|------|-------|
| [Lab 1.1](#lab-11--carta-skop--pihak-berkepentingan) | S1 | `docs/carta-skop.md` |
| [Lab 1.2](#lab-12--temu-bual-berstruktur-modul-tlk) | S2 | `docs/temubual-tlk.md` |
| [Lab 1.3](#lab-13--temu-bual-modul-pas) | S3 | `docs/temubual-pas.md` |
| [Lab 1.4](#lab-14--senarai-awal-fr--nfr--moscow) | S4 | `docs/keperluan-awal.md`, `docs/soalan-terbuka.md` |
| [Lab 1.5](#lab-15--ci4-asas-di-laptop-dalam-kelas-s4) | S4 | Projek latihan `~/latihan/ci4-asas` + route `/hello` |

---

## Lab 1.0 — Sediakan repo dokumen (10 minit, S1 minit 50–85 bersama Lab 1.1)

1. Buka VS Code → *Terminal → New Terminal*. 🪟 **Windows:** terminal mesti **Git Bash** — `echo $SHELL` mencetak `/usr/bin/bash` ([`persediaan.md`](../docs/persediaan.md) §5). Cipta folder kerja pasukan dan mulakan Git:
   ```bash
   mkdir -p ~/latihan/sistem-tlk-pas/docs
   cd ~/latihan/sistem-tlk-pas
   git init
   echo "# Sistem TLK & Pas — Dokumen Keperluan" > README.md
   git add . && git commit -m "SETUP: mula repo dokumen"
   ```
   > Masih dalam PowerShell? `&&` gagal dalam Windows PowerShell 5.1, dan `>` menulis `README.md` sebagai UTF-16 (Git dan GitLab memaparkannya sebagai teks rosak). Tukar ke Git Bash, padam `README.md`, ulang.
2. Buka folder dalam VS Code. Pasang extension **Markdown Preview Mermaid Support** (atau guna <https://mermaid.live>).

✅ **Checkpoint:** `git log --oneline` menunjukkan satu commit `SETUP: mula repo dokumen`.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Commit pertama gagal: `Author identity unknown` / *"Please tell me who you are"* | Identiti Git belum ditetapkan pada komputer ini | Jalankan `git config --global user.name "Aminah Rahim"`, `git config --global user.email "aminah@latihan.test"` dan `git config --global init.defaultBranch main` (Hari 4 membuat `git push` branch `main`), kemudian ulang `git commit` (guna nama dan e-mel anda sendiri) |
| `git branch` menunjukkan `master`, bukan `main` | Repo dicipta sebelum `init.defaultBranch main` ditetapkan | `git branch -m master main` |

---

## Lab 1.1 — Carta Skop & Pihak Berkepentingan

### 🎯 Objektif
Menghasilkan carta skop yang menyatakan matlamat, 4 modul, dalam/luar skop, had projek dan pemetaan pihak berkepentingan kepada peranan Shield.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Telah mendengar taklimat projek S1.
- Baca [`docs/spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §1, §2 dan §4.

### Langkah
1. Cipta `docs/carta-skop.md` dengan rangka berikut:
   ```markdown
   # Carta Skop — Sistem TLK & Pas

   ## 1. Matlamat
   (1–2 ayat: masalah apa diselesaikan, untuk siapa)

   ## 2. Modul
   | # | Modul | Tujuan | Prefix |
   |---|-------|--------|--------|

   ## 3. Dalam skop
   ## 4. Luar skop (fasa ini)
   ## 5. Had (masa, teknologi, data, persekitaran)
   ## 6. Pihak berkepentingan
   | Pihak | Kepentingan | Peranan Shield | Pengaruh (R/S/T) |
   |-------|-------------|----------------|------------------|
   ```
2. Tulis **Matlamat** dalam bahasa pemilik sistem, bukan bahasa teknikal. Contoh: *"Memastikan slot letak kenderaan khas dan pas akses diberikan secara adil, telus dan boleh diaudit."*
3. Isi jadual **Modul** untuk M1–M4 berdasarkan SPEC §2.
4. Senaraikan **≥ 5 perkara dalam skop** dan **≥ 4 perkara luar skop**. Setiap perkara dalam skop mesti boleh dikaitkan dengan satu modul.
5. Tambah carta Mermaid `flowchart` ringkas yang menunjukkan sistem → dalam skop / luar skop (rujuk contoh di README §1.2).
6. Isi **Had** — sekurang-kurangnya 4 baris (masa, teknologi, data sintetik, persekitaran).
7. Isi jadual **Pihak berkepentingan** — ≥ 5 baris. Setiap baris mesti dipetakan kepada `applicant`, `reviewer`, `approver`, `admin` **atau** "tiada akaun".
8. Commit:
   ```bash
   git add docs/carta-skop.md && git commit -m "SETUP: carta skop & pihak berkepentingan"
   ```

### ✅ Checkpoint
- [ ] Carta Mermaid dipaparkan tanpa ralat dalam pratonton.
- [ ] Setiap nama peranan dieja **tepat** seperti SPEC §4 (`applicant`, bukan `pemohon` atau `Applicant`).
- [ ] Sekurang-kurangnya satu pihak berkepentingan "tiada akaun" (pengguna tidak langsung).
- [ ] "Luar skop" ada **≥ 4 item**, satu ayat setiap satu, menyatakan apa yang tidak akan dibina dalam fasa ini.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Mermaid papar "Syntax error" | Label mengandungi `(`, `)` atau `:` tanpa tanda petik | Balut label dengan `["..."]` |
| Pratonton tidak papar diagram | Extension Mermaid belum dipasang | Pasang extension atau tampal kod ke mermaid.live |
| Luar skop kosong | Tidak tanya pemilik sistem | Guna README §1.2 sebagai titik mula, sahkan dengan jurulatih |

### ⭐ Cabaran tambahan
Tambah `quadrantChart` Mermaid (peta pengaruh–kepentingan) dan tentukan **dua** pihak berkepentingan yang mesti ditemu bual dahulu. Terangkan kenapa.

---

## Lab 1.2 — Temu Bual Berstruktur Modul TLK

### 🎯 Objektif
Mengendalikan temu bual 35 minit dengan pemilik sistem (jurulatih dalam persona), merekod jawapan dan sekurang-kurangnya 5 pain point TLK.

### Prasyarat
- Lab 1.1 siap.
- Baca README §2.1 (struktur 4 fasa & teknik soalan).

### Langkah
1. **Sediakan soalan (20 minit).** Cipta `docs/temubual-tlk.md`:
   ```markdown
   # Temu Bual — Modul TLK
   Tarikh: 2026-__-__ · Penemu bual: ____ · Pencatat: ____ · Responden: (persona pemilik sistem)

   ## A. Soalan disediakan
   | # | Fasa | Soalan | Jawapan (ringkas) |
   |---|------|--------|-------------------|

   ## B. Pain point
   | ID | Siapa terkesan | Masalah | Kesan | Keperluan yang mungkin |
   |----|----------------|---------|-------|------------------------|

   ## C. Peraturan yang ditemui
   ## D. Soalan belum terjawab
   ```
2. Tulis **≥ 12 soalan** merangkumi keempat-empat fasa (Konteks, Masalah, Butiran, Pengesahan). Wajib ada:
   - ≥ 2 soalan "Bagaimana jika…?"
   - ≥ 1 soalan tentang **siapa** meluluskan
   - ≥ 1 soalan tentang **tempoh** tempahan
   - ≥ 1 soalan tentang **jenis/kategori** slot
3. **Temu bual (35 minit, berkumpulan).** Jurulatih memakai persona pemilik sistem. Setiap pasangan bergilir bertanya sekurang-kurangnya 2 soalan. Navigator mencatat.
   > Peraturan main: pemilik sistem **hanya** menjawab apa yang ditanya. Maklumat penting mungkin tersembunyi di sebalik soalan susulan.
4. **Rumuskan (20 minit).** Isi lajur "Jawapan". Kemudian isi jadual **Pain point** dengan ≥ 5 baris `PP-TLK-01`… Setiap pain point mesti ada keempat-empat elemen (siapa, masalah, kesan, keperluan).
5. Dalam bahagian **C. Peraturan yang ditemui**, padankan penemuan anda dengan BR dalam SPEC:
   ```markdown
   - "Satu slot tidak boleh diberi kepada dua orang pada tarikh sama" → BR-TLK-01
   - "Maksimum 3 bulan" → BR-TLK-03 (SPEC: 90 hari)
   ```
6. Senaraikan dalam **D** apa-apa yang pemilik sistem kata "nanti saya semak" — ini akan dipindah ke `docs/soalan-terbuka.md` dalam Lab 1.4.
7. Commit: `git add docs/ && git commit -m "SETUP: temu bual TLK"`.

### ✅ Checkpoint
- [ ] ≥ 12 soalan, keempat-empat fasa diwakili.
- [ ] ≥ 5 pain point, **tiada satu pun** berbunyi seperti penyelesaian ("tiada sistem online").
- [ ] Sekurang-kurangnya **5 daripada 6** BR-TLK (01–06) telah ditemui dan dipadankan dalam bahagian C.
- [ ] Kelima-lima nilai `SlotCategory` disebut (`oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Jawapan pemilik sistem pendek dan tidak membantu | Soalan tertutup ("Ada masalah tak?") | Tukar kepada terbuka: "Ceritakan aduan terakhir yang puan terima" |
| BR-TLK-05 (transaksi) tidak ditemui | Ini peraturan **teknikal**, bukan dari pengguna | Normal — tanya "Apa jadi jika dua kerani lulus slot sama pada saat sama?" untuk mendedahkan keperluannya |
| Terlalu banyak masa di satu topik | Tiada pengawal masa | Lantik seorang pengawal masa; 2 minit setiap soalan |

### ⭐ Cabaran tambahan
Lukis carta Mermaid `stateDiagram-v2` kitaran hayat tempahan **berdasarkan jawapan temu bual sahaja**, kemudian bandingkan dengan `BookingStatus` dalam SPEC §2.1. Senaraikan perbezaan sebagai soalan terbuka.

---

## Lab 1.3 — Temu Bual Modul Pas

### 🎯 Objektif
Mengumpul keperluan Modul Pas termasuk dokumen per jenis pas, dua peringkat kelulusan dan peraturan penolakan.

### Prasyarat
- Lab 1.2 siap (guna struktur yang sama).
- Baca README §3.1–3.2.

### Langkah
1. Salin struktur `docs/temubual-tlk.md` ke `docs/temubual-pas.md`, tambah bahagian:
   ```markdown
   ## E. Dokumen mengikut jenis pas
   | pass_type | Dokumen wajib | Format | Saiz maks |
   |-----------|---------------|--------|-----------|
   | kenderaan | | | |
   | kakitangan | | | |
   | kontraktor | | | |

   ## F. Matriks kelulusan
   | Dari status | Ke status | Siapa | Syarat |
   |-------------|-----------|-------|--------|
   ```
2. Sediakan **≥ 10 soalan** dalam tiga kelompok: Dokumen, Aliran kelulusan, Tempoh & tamat (README §3.2).
3. Temu bual pemilik sistem (persona Pas) — 30 minit.
4. Isi jadual **E** berdasarkan jawapan. Semak had format/saiz terhadap **BR-PAS-02**.
5. Isi jadual **F** — mesti menghasilkan 5 baris yang sepadan dengan jadual `PassStatus` SPEC §2.2.
6. Tulis ≥ 4 pain point `PP-PAS-nn`.
7. Commit: `git add docs/ && git commit -m "SETUP: temu bual Pas"`.

### ✅ Checkpoint
- [ ] Jadual E mengandungi ketiga-tiga `pass_type` dengan ejaan tepat (`kenderaan`, `kakitangan`, `kontraktor`).
- [ ] Jadual F: 5 peralihan; baris `→ rejected` menyebut `remarks` ≥ 10 aksara.
- [ ] Sekurang-kurangnya satu soalan tentang **siapa boleh melihat dokumen** (BR-PAS-04).
- [ ] Sekurang-kurangnya satu soalan tentang **tempoh simpanan** dokumen dicatat dalam bahagian D (soalan belum terjawab).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Peserta menganggap penyemak juga meluluskan | Tidak bertanya "siapa buat keputusan akhir?" | Tanya susulan: "Selepas penyemak puas hati, apa berlaku?" |
| Jadual F ada peralihan `submitted → approved` | Menganggap pelulus boleh langkau semakan | Sahkan dengan pemilik sistem — SPEC tidak membenarkan |
| Format fail tidak spesifik ("gambar") | Tidak tanya format sebenar | "Gambar format apa? `.heic` dari iPhone diterima?" → Tidak (`jpg`/`png` sahaja) |

### ⭐ Cabaran tambahan
Kenal pasti **satu medan** yang perlu wajib untuk `pass_type = kenderaan` tetapi opsyenal untuk jenis lain (petunjuk: lihat `pass_applications.vehicle_id` dalam SPEC §3). Tulis peraturan pengesahannya dalam ayat BM.

---

## Lab 1.4 — Senarai Awal FR & NFR + MoSCoW

### 🎯 Objektif
Menukar hasil temu bual kepada senarai keperluan berformat ID, dikelaskan MoSCoW dan dijejak kepada BR.

### Prasyarat
- Lab 1.2 dan 1.3 siap.
- Baca README §4.

### Langkah
1. Cipta `docs/keperluan-awal.md`:
   ```markdown
   # Senarai Awal Keperluan — v0.1 (Hari 1)

   ## 1. Keperluan Fungsian — Modul TLK
   | ID | Keperluan | Sumber (PP/temu bual) | BR | MoSCoW |
   |----|-----------|------------------------|----|--------|

   ## 2. Keperluan Fungsian — Modul Pas
   ## 3. Keperluan Fungsian — Laporan & Statistik (ringkas)
   ## 4. Keperluan Bukan Fungsian
   | ID | Kategori | Keperluan | Cara ukur |
   |----|----------|-----------|-----------|
   ## 5. Ringkasan MoSCoW
   | Kelas | Bil. |
   ```
2. Untuk **setiap pain point** dari Lab 1.2/1.3, tulis sekurang-kurangnya satu FR. Isi lajur "Sumber" dengan ID pain point (cth `PP-TLK-01`).
3. Gunakan pola: **[Aktor] boleh / Sistem mesti [tindakan] [objek] [syarat]**. Satu FR = satu tindakan.
4. Sasaran minimum: **≥ 16 FR** — ≥ 8 `FR-TLK-nn`, ≥ 6 `FR-PAS-nn`, ≥ 1 `FR-RPT-nn`, ≥ 1 `FR-STAT-nn`.
5. Tulis ≥ 5 `NFR-nn` — setiap satu mesti ada lajur **Cara ukur** (cth "Cuba akses `/pas/permohonan/5` sebagai pemohon2 → mesti 404").
6. Kelaskan **setiap** FR dan NFR dengan MoSCoW. Isi jadual ringkasan. Jika > 60% "Must", semak semula.
7. Pindahkan semua soalan belum terjawab ke `docs/soalan-terbuka.md`:
   ```markdown
   | # | Soalan | Modul | Ditanya oleh | Status |
   |---|--------|-------|--------------|--------|
   | Q-01 | Bolehkah pemohon batal tempahan yang masih pending? | TLK | Pasangan A | Terbuka |
   ```
8. **Semakan rakan (10 minit):** tukar fail dengan pasangan sebelah. Tanda ❌ pada mana-mana FR yang tidak boleh diuji. Betulkan.
9. Commit: `git add docs/ && git commit -m "SETUP: senarai awal FR/NFR v0.1"`.

### ✅ Checkpoint
- [ ] ≥ 16 FR (≥ 8 `FR-TLK`, ≥ 6 `FR-PAS`, ≥ 1 `FR-RPT`, ≥ 1 `FR-STAT`) + ≥ 5 NFR, setiap satu dengan MoSCoW.
- [ ] Setiap ID unik dan berformat betul (`FR-TLK-01`, bukan `FR-1` atau `TLK_FR_01`).
- [ ] Setiap BR dalam SPEC (BR-TLK-01..06, BR-PAS-01..06) dijejak oleh **sekurang-kurangnya satu** FR atau NFR.
- [ ] Ada sekurang-kurangnya 2 item "Won't".
- [ ] Rakan dari pasangan lain tidak menemui FR yang menggabungkan dua tindakan.
- [ ] `docs/soalan-terbuka.md` ada ≥ 3 soalan.

> ⏱️ Tidak sempat? Item yang belum siap boleh dilengkapkan semasa imbas semula Hari 2 (08:30).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| FR menyebut nama kelas/kod (`BookingService`) | Mencampur keperluan dengan reka bentuk | Tulis dari sudut pengguna; reka bentuk datang Hari 3–4 |
| BR-PAS-05 tiada FR | Terlupa keperluan audit | Tambah FR "Sistem mesti merekod setiap peralihan status…" |
| NFR tanpa ukuran | "Selamat", "cepat" | Tambah lajur Cara ukur; jika tidak boleh diukur, tulis semula |

### ⭐ Cabaran tambahan
Bina **matriks jejak** ringkas: baris = BR (12 baris), lajur = FR yang menjejaknya. Kenal pasti BR yang dijejak oleh lebih dari satu FR dan terangkan kenapa itu boleh diterima.

---

## Lab 1.5 — CI4 asas di laptop (dalam kelas, S4)

### 🎯 Objektif
Menjalankan projek CodeIgniter 4 kosong di laptop Windows dan membina satu route MVC (`/hello`) supaya Hari 4 tidak bermula dengan masalah persekitaran.

### Prasyarat
- Windows dengan **Laragon** (PHP 8.2+, Composer) dan **Git Bash** — [`docs/persediaan.md`](../docs/persediaan.md) §1–§6.
- Semua arahan di bawah ditaip dalam **Git Bash** (bukan PowerShell).

### Langkah
1. **Sediakan Laragon (sekali sahaja).** Laragon dipasang di `C:\laragon` (belum? [`docs/persediaan.md`](../docs/persediaan.md) §2 langkah 1–2). Dalam Laragon:
   - *Menu → PHP → Version* → pilih **8.3.x** (atau 8.2.x).
   - *Menu → PHP → Extensions* → tanda **`intl`** (wajib untuk CI4) dan **`zip`** (Composer lebih pantas).
   - *Menu → Tools → Path → Add Laragon to Path*, kemudian **tutup VS Code sepenuhnya** dan buka semula (terminal lama memegang `PATH` lama).
   - MySQL dan Apache **tidak** diperlukan untuk lab ini — `php spark serve` menghidangkan aplikasi. MySQL digunakan mulai Hari 4.

   Buka Git Bash baharu. Jika `composer -V` memberi `command not found`, tambah alias sekali sahaja:
   ```bash
   echo 'alias composer="php /c/laragon/bin/composer/composer.phar"' >> ~/.bashrc && source ~/.bashrc
   ```
2. Semak persekitaran:
   ```bash
   php -v              # PHP 8.2 atau lebih baharu
   composer -V         # Composer 2.x
   which php           # /c/laragon/bin/php/...
   php -m | grep intl  # intl
   ```
3. Cipta projek **latihan** di `C:\Users\<nama>\latihan\ci4-asas` (bukan repo `sistem-tlk-pas`):
   ```bash
   mkdir -p ~/latihan && cd ~/latihan
   composer create-project codeigniter4/appstarter ci4-asas
   cd ci4-asas
   php spark serve
   ```
   Jika Windows Defender bertanya, benarkan akses rangkaian *Private*. Buka <http://localhost:8080>.
4. Hidupkan mod pembangunan. Hentikan server (`Ctrl+C`), kemudian:
   ```bash
   cp env .env     # Command Prompt: copy env .env
   code .
   ```
   Dalam `.env`, buang `#` dan tetapkan `CI_ENVIRONMENT = development`. Jalankan semula `php spark serve` dan muat semula halaman — ikon Debug Toolbar muncul di penjuru kanan bawah.
5. Bina route MVC pertama. Tambah dalam `app/Config/Routes.php`:
   ```php
   $routes->get('hello', 'Hello::index');
   ```
   Cipta `app/Controllers/Hello.php`:
   ```php
   <?php

   namespace App\Controllers;

   class Hello extends BaseController
   {
       public function index(): string
       {
           return view('hello', ['nama' => 'Peserta KKM']);
       }
   }
   ```
   Cipta `app/Views/hello.php`:
   ```php
   <h1>Hello, <?= esc($nama) ?>!</h1>
   ```
   Buka <http://localhost:8080/hello>.
6. Terangkan kepada rakan pasangan aliran request: **Routes → Controller → View**. Langkah penuh dan penerangan: [Tutorial rangka — Bahagian A](../docs/tutorial-rangka.md#bahagian-a--ci4-asas-di-laptop-hari-1).

> `ci4-asas` ialah projek latihan sahaja dan boleh dipadam. Projek sebenar dicipta dalam repo `sistem-tlk-pas` pada Hari 4 Lab 4.2.

### ✅ Checkpoint
- [ ] `php spark serve` berjalan dan <http://localhost:8080> memaparkan halaman *Welcome to CodeIgniter*.
- [ ] `.env` menetapkan `CI_ENVIRONMENT = development` dan *Debug Toolbar* kelihatan.
- [ ] <http://localhost:8080/hello> memaparkan "Hello, Peserta KKM!" melalui `Hello::index` dan `app/Views/hello.php`.

> ⏱️ Tidak sempat malam ini? Siapkan sebelum Hari 4; jurulatih membantu semasa rehat.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `php: command not found` / `which php` kosong | Laragon belum dalam `PATH`, atau terminal dibuka sebelum *Add Laragon to Path* | Laragon → *Menu → Tools → Path → Add Laragon to Path*; tutup VS Code sepenuhnya dan buka semula |
| `composer: command not found` dalam Git Bash | Git Bash tidak menjalankan `composer.bat` Laragon | Tambah alias seperti [`docs/persediaan.md`](../docs/persediaan.md) §2 langkah 5, buka Git Bash baharu |
| `requires ext-intl` semasa `create-project` | Extension `intl` belum dihidupkan | Laragon → *Menu → PHP → Extensions* → tanda `intl`; buka terminal baharu |
| `Failed to listen on localhost:8080` | Port 8080 sedang digunakan | `php spark serve --port 8081`, buka <http://localhost:8081> |
| `/hello` → *404 Can't find a route* | Route tidak disimpan atau salah eja kelas | Semak `Routes.php` disimpan dan nama fail `Hello.php` sama dengan nama kelas |
| Tiada Debug Toolbar | `.env` masih bertanda `#` atau server belum dimulakan semula | Buang `#`, `Ctrl+C`, `php spark serve` semula |

---

## Semakan kendiri — akhir hari

```bash
ls docs/
# carta-skop.md  keperluan-awal.md  soalan-terbuka.md  temubual-pas.md  temubual-tlk.md
git log --oneline
```

✅ Lima fail wujud dan sekurang-kurangnya 4 commit bermesej jelas.
