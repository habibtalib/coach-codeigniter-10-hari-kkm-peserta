# Lab Hari 2 — Pengesahan Keperluan & Projek CI Anda di GitLab

[📅 Jadual](../JADUAL.md) · [📘 Kanun SPEC](../docs/spesifikasi-sistem.md) · [📖 README Hari 2](./README.md)

| Lab | Sesi | Hasil |
|-----|------|-------|
| [Lab 2.1](#lab-21--sesi-pengesahan--log-keputusan) | S1 | `docs/log-keputusan.md`, `docs/keperluan-awal.md` v0.9 |
| [Lab 2.2](#lab-22--projek-ci-anda-di-gitlab-s2) | S2 | Projek private `kelas-ci-<nama>` di GitLab KKM + commit pertama |
| [Lab 2.3](#lab-23--route-controller--layout-view-s3) | S3 | `/hello`, `/hello/<nama>`, `layout.php`; 2 commit di-push |
| [Lab 2.4](#lab-24--borang-validation--csrf-s4) | S4 | Borang `/daftar` + validation + CSRF; commit di-push |

> Mulai Lab 2.2 semua kerja dalam projek **individu** `kelas-ci-<nama>`. Lab carta alir, acceptance criteria dan URS yang asal kini bacaan pilihan dalam [`docs/rujukan-keperluan.md`](../docs/rujukan-keperluan.md).

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

## Lab 2.2 — Projek CI anda di GitLab (S2)

### 🎯 Objektif
Mencipta projek private `kelas-ci-<nama>` di GitLab KKM (GitLab KKM), mencipta projek CodeIgniter 4 baharu di laptop, dan push commit pertama — tanpa `.env` dan `vendor/`. Projek ini digunakan sepanjang kursus.

### Prasyarat
- Akaun GitLab KKM (`https://<gitlab-kkm>`) — log masuk berjaya.
- Laragon (PHP 8.2+, Composer) dan Git Bash dalam VS Code ([Lab 1.5](../hari-1/lab.md#lab-15--ci4-asas-di-laptop-dalam-kelas-s4)). `php -v` dan `composer -V` berjalan.
- Kerja **individu**: setiap peserta ada repo sendiri. `<nama>` = nama pendek anda, huruf kecil tanpa ruang (cth `kelas-ci-aminah`).

### Langkah
1. **Cipta projek kosong di GitLab.** Log masuk GitLab KKM → **New project** → **Create blank project**:
   - *Project name:* `kelas-ci-<nama>`
   - *Project URL:* namespace anda sendiri (nama pengguna anda)
   - *Visibility Level:* **Private**
   - **Buang tanda** *Initialize repository with a README* (projek mesti kosong)

   Klik **Create project**. GitLab memaparkan halaman *"The repository for this project is empty"* dengan URL HTTPS seperti `https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git` — salin URL itu.
2. **Tambah jurulatih.** *Project information → Members → Invite members* → nama pengguna jurulatih, peranan **Reporter** → *Invite*. Jurulatih boleh melihat kod anda tetapi tidak boleh push.
3. **Identiti Git (sekali sahaja setiap laptop).** Dalam Git Bash, guna nama dan e-mel akaun GitLab KKM anda:
   ```bash
   git config --global user.name "Nama Penuh Anda"
   git config --global user.email "emel-anda@moh.gov.my"
   git config --global init.defaultBranch main
   git config --global --list | grep -E "user|init"
   ```
4. **Cipta projek CI4 baharu:**
   ```bash
   mkdir -p ~/latihan && cd ~/latihan
   composer create-project codeigniter4/appstarter kelas-ci-<nama>
   cd kelas-ci-<nama>
   php spark --version
   ```
   Tukar `<nama>` kepada nama anda (jangan taip `<` `>` — dalam Git Bash ia bermaksud redirect).
5. **Mod pembangunan.** `cp env .env`, buka `.env` dalam VS Code (`code .`), buang `#` dan tetapkan `CI_ENVIRONMENT = development`. Jalankan `php spark serve` dan buka <http://localhost:8080> — halaman *Welcome to CodeIgniter* dengan ikon Debug Toolbar di penjuru kanan bawah. Hentikan server (`Ctrl+C`).
6. **Hujung baris LF untuk semua.** Cipta dua fail di akar projek dalam VS Code (*File → New File*), **sebelum** commit pertama, supaya Windows tidak menukar hujung baris kepada CRLF. `.gitattributes`:
   ```text
   * text=auto eol=lf
   *.bat text eol=crlf
   *.png binary
   *.jpg binary
   *.jpeg binary
   *.gif binary
   *.ico binary
   *.pdf binary
   *.xlsx binary
   *.zip binary
   *.woff binary
   *.woff2 binary
   *.ttf binary
   ```
   `.editorconfig`:
   ```ini
   root = true

   [*]
   charset = utf-8
   end_of_line = lf
   insert_final_newline = true
   trim_trailing_whitespace = true
   indent_style = space
   indent_size = 4

   [*.md]
   trim_trailing_whitespace = false

   [*.{yml,yaml}]
   indent_size = 2
   ```
7. **Commit pertama dan push** (arahan "Push an existing folder" di halaman GitLab, dengan URL anda):
   ```bash
   git init --initial-branch=main
   git remote add origin https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git
   git status --short | grep -E "env|vendor"
   git add .
   git commit -m "SETUP: projek CI4 appstarter"
   git push -u origin main
   ```
   `git status` hanya menunjukkan `?? env` — `.env` (rahsia) dan `vendor/` (pakej Composer) diabaikan oleh `.gitignore` appstarter. Pada push pertama, **Git Credential Manager** membuka tetingkap log masuk: log masuk dengan akaun GitLab KKM anda. Kata laluan ditolak? Cipta *Personal Access Token* (avatar → *Edit profile → Access Tokens*, skop `write_repository`) dan guna token sebagai kata laluan.
8. **Semak di GitLab.** Muat semula halaman projek: fail `app/`, `public/`, `spark`, `composer.json` kelihatan; **tiada** `.env` dan **tiada** `vendor/`. Salin URL projek ke ruang yang jurulatih minta (cth senarai kelas).

### ✅ Checkpoint
- [ ] Projek `kelas-ci-<nama>` wujud di GitLab KKM, **Private**, jurulatih ditambah sebagai Reporter.
- [ ] `php spark serve` memaparkan *Welcome to CodeIgniter* dengan Debug Toolbar (`CI_ENVIRONMENT = development`).
- [ ] Halaman GitLab menunjukkan commit `SETUP: projek CI4 appstarter`; `.env` dan `vendor/` tiada dalam repo (Kuiz hari).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `! [rejected] main -> main (fetch first)` | Projek GitLab dicipta **dengan** README | Padam projek dan cipta semula tanpa README, atau `git pull --rebase origin main` dahulu |
| `remote: HTTP Basic: Access denied` | Kata laluan ditolak (SSO/2FA) atau kelayakan lama tersimpan | Guna Personal Access Token sebagai kata laluan; padam kelayakan lama: Windows → *Credential Manager → Windows Credentials* → `git:https://<gitlab-kkm>` |
| `fatal: remote origin already exists` | `git remote add` dijalankan dua kali | `git remote set-url origin <url-betul>` |
| `.env` kelihatan di GitLab | `.env` dicipta sebelum `.gitignore` atau dipaksa dengan `git add -f` | `git rm --cached .env`, commit, push; tukar mana-mana kata laluan di dalamnya |
| `error: src refspec main does not match any` | Belum ada commit | Jalankan `git add .` dan `git commit` dahulu |
| `SSL certificate problem` | Proksi/sijil rangkaian KKM | Lapor kepada jurulatih; **jangan** matikan `http.sslVerify` ([`persediaan.md`](../docs/persediaan.md)) |

### ⭐ Cabaran tambahan
Tambah `README.md` ringkas (nama anda, cara menjalankan: `composer install`, `cp env .env`, `php spark serve`), commit `DOCS: README projek` dan push. Lihat GitLab memaparkannya di halaman utama projek.

---

## Lab 2.3 — Route, controller & layout view (S3)

### 🎯 Objektif
Membina aliran MVC dalam `kelas-ci-<nama>`: route → controller → view, route berparameter, layout view yang dikongsi, dan membaca jadual `php spark routes`. Setiap langkah di-commit dan di-push ke GitLab.

### Prasyarat
- [Lab 2.2](#lab-22--projek-ci-anda-di-gitlab-s2) siap: commit pertama kelihatan di GitLab.
- Dua terminal Git Bash dalam folder `~/latihan/kelas-ci-<nama>`: satu untuk `php spark serve`, satu untuk Git.

> 🔍 **Bukti kerja:** platform menanda checkpoint lab ini apabila anda **lulus Kuiz hari** — soalannya hanya boleh dijawab dengan menjalankan kod. Jurulatih juga membuka repo GitLab anda secara rawak.

### Langkah
1. **Route → controller → view pertama.** Tambah dalam `app/Config/Routes.php`:
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
   Jalankan `php spark serve` dan buka <http://localhost:8080/hello>. Buka tab *Routes* dan *Views* dalam Debug Toolbar: request melalui `Routes.php` → `Hello::index` → `hello.php`.
2. Commit dan push:
   ```bash
   git add . && git commit -m "CI-ASAS: route /hello" && git push
   ```
3. **Route berparameter.** Tambah di bawah route `hello`:
   ```php
   $routes->get('hello/(:segment)', 'Hello::sapa/$1');
   ```
   Tambah method kedua dalam `Hello`:
   ```php
   public function sapa(string $nama): string
   {
       return view('hello', ['nama' => $nama]);
   }
   ```
   Buka <http://localhost:8080/hello/Ali>, <http://localhost:8080/hello/Ali%20Bakar> dan <http://localhost:8080/hello/Ali/Bakar>. Catat apa yang berlaku pada setiap satu.
4. **Cuba input berbahaya.** Taip `http://localhost:8080/hello/<b>Ali</b>` dalam bar alamat. Catat **kod status dan mesej** — soalan Kuiz hari.
5. **Baca jadual route:**
   ```bash
   php spark routes
   ```
   Cari baris `Hello::sapa/$1`. Catat lajur **Route** — CI menukar `(:segment)` kepada regex sebenar.
6. **Layout view.** Cipta `app/Views/layout.php`:
   ```php
   <!doctype html>
   <html lang="ms">
   <head>
       <meta charset="utf-8">
       <title><?= esc($tajuk ?? 'CI4 Asas') ?></title>
   </head>
   <body>
       <nav><a href="<?= site_url('hello') ?>">Hello</a></nav>
       <main>
           <?= $this->renderSection('content') ?>
       </main>
   </body>
   </html>
   ```
   Tukar `app/Views/hello.php` supaya guna layout:
   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Hello, <?= esc($nama) ?>!</h1>
   <?= $this->endSection() ?>
   ```
   Muat semula `/hello` dan `/hello/Ali`: kedua-dua halaman kini ada pautan **Hello** di atas. Satu layout, banyak view.
7. Commit dan push:
   ```bash
   git add . && git commit -m "CI-ASAS: route berparameter + layout" && git push
   git log --oneline
   ```

### ✅ Checkpoint
- [ ] `/hello/Ali` memaparkan "Hello, Ali!" melalui `Hello::sapa` dan `layout.php` (Kuiz hari).
- [ ] `php spark routes` dijalankan dan lajur Route bagi `Hello::sapa/$1` dicatat (Kuiz hari).
- [ ] GitLab menunjukkan 3 commit (`SETUP:` + 2 `CI-ASAS:`) (Kuiz hari).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `/hello` → *404 Can't find a route* | Route belum disimpan atau salah eja kelas | Simpan `Routes.php`; nama fail `Hello.php` sama dengan nama kelas; semak `php spark routes` |
| *Too few arguments to function Hello::sapa()* | Route tanpa `/$1` | Tulis `'Hello::sapa/$1'` |
| Halaman kosong selepas tukar ke layout | `section('content')` tidak sama dengan `renderSection('content')` | Guna nama yang sama dalam kedua-dua fail |
| `git push` → *no upstream branch* | Push pertama tanpa `-u` | `git push -u origin main` sekali |

### ⭐ Cabaran tambahan
Hantar `'tajuk' => 'Sapa ' . $nama` dari `sapa()` dan lihat tajuk tab berubah. Kenapa layout boleh membaca `$tajuk` walaupun ia hanya dihantar kepada `hello`?

---

## Lab 2.4 — Borang, validation & CSRF (S4)

### 🎯 Objektif
Membina borang `/daftar` dalam `kelas-ci-<nama>` dengan validation server, flash message (PRG) dan CSRF — corak yang sama digunakan dalam borang tempahan TLK Hari 5.

### Prasyarat
- [Lab 2.3](#lab-23--route-controller--layout-view-s3) siap: `layout.php` wujud dan GitLab menunjukkan 3 commit.
- ±45 minit. Platform menanda checkpoint lab ini apabila anda **lulus Kuiz hari**.

### Langkah
1. **Route GET dan POST** dalam `app/Config/Routes.php`:
   ```php
   $routes->get('daftar', 'Daftar::index');
   $routes->post('daftar', 'Daftar::simpan');
   ```
2. **Controller** `app/Controllers/Daftar.php`:
   ```php
   <?php

   namespace App\Controllers;

   use CodeIgniter\HTTP\RedirectResponse;

   class Daftar extends BaseController
   {
       protected $helpers = ['form'];

       public function index(): string
       {
           return view('daftar');
       }

       public function simpan(): RedirectResponse
       {
           $rules = [
               'nama' => ['label' => 'Nama', 'rules' => 'required|min_length[3]|max_length[100]'],
               'emel' => ['label' => 'E-mel', 'rules' => 'required|valid_email'],
               'nokp' => ['label' => 'No. KP', 'rules' => 'required|exact_length[12]|numeric'],
           ];

           if (! $this->validate($rules)) {
               return redirect()->to('daftar')->withInput();
           }

           $data = $this->validator->getValidated();

           return redirect()->to('daftar')->with('berjaya', 'Pendaftaran ' . $data['nama'] . ' diterima.');
       }
   }
   ```
   `$helpers = ['form']` wajib: tanpanya `validation_show_error()` dalam view memberi *Call to undefined function*.
3. **View** `app/Views/daftar.php`:
   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Daftar peserta</h1>

   <?php if (session()->getFlashdata('berjaya')): ?>
       <p class="berjaya"><?= esc(session()->getFlashdata('berjaya')) ?></p>
   <?php endif ?>

   <form method="post" action="<?= site_url('daftar') ?>">
       <?= csrf_field() ?>

       <label for="nama">Nama</label>
       <input id="nama" name="nama" value="<?= esc(old('nama')) ?>">
       <?= validation_show_error('nama') ?>

       <label for="emel">E-mel</label>
       <input id="emel" name="emel" type="email" value="<?= esc(old('emel')) ?>">
       <?= validation_show_error('emel') ?>

       <label for="nokp">No. KP</label>
       <input id="nokp" name="nokp" inputmode="numeric" value="<?= esc(old('nokp')) ?>">
       <?= validation_show_error('nokp') ?>

       <button type="submit">Hantar</button>
   </form>
   <?= $this->endSection() ?>
   ```
4. **Uji validation.** Buka <http://localhost:8080/daftar>. Hantar dengan Nama **kosong**, E-mel `x` dan No. KP `123`. Catat mesej ralat **tepat** di bawah Nama — ini soalan Kuiz hari. Perhatikan E-mel dan No. KP yang anda taip kekal dalam borang (`old()`).
5. **Uji kejayaan.** Isi data sintetik (Nama `Aminah`, E-mel `aminah@latihan.test`, No. KP `900101010001`) dan hantar. Mesej "Pendaftaran Aminah diterima." muncul sekali; muat semula (F5) — mesej hilang dan pelayar **tidak** bertanya "hantar semula borang?". Itulah PRG (Post/Redirect/Get) + flash.
6. **Hidupkan CSRF secara global.** Dalam `app/Config/Filters.php`, `$globals['before']`, buang `//` di depan `'csrf'`:
   ```php
   public array $globals = [
       'before' => [
           // 'honeypot',
           'csrf',
           // 'invalidchars',
       ],
   ```
   Jalankan `php spark routes` — lajur **Before Filters** bagi `daftar` kini menunjukkan `csrf`.
7. **Buktikan CSRF berfungsi.** Dalam `daftar.php`, jadikan `<?= csrf_field() ?>` komen sementara (`<?php // csrf_field() ?>`), muat semula `/daftar` dan hantar borang yang sah. Catat **kod status dan mesej** — soalan Kuiz hari. Pulihkan `<?= csrf_field() ?>` dan hantar semula: berjaya.
8. Commit:
   ```bash
   git add . && git commit -m "CI-ASAS: borang daftar + validation + CSRF" && git push
   git log --oneline
   ```

### ✅ Checkpoint
- [ ] Borang kosong memaparkan mesej ralat Nama, E-mel dan No. KP, dan nilai yang ditaip kekal (Kuiz hari).
- [ ] Hantar yang sah memaparkan flash "Pendaftaran … diterima." sekali sahaja; F5 tidak menghantar semula (Kuiz hari).
- [ ] CSRF global hidup: tanpa `csrf_field()` borang ditolak dengan 403; GitLab menunjukkan 4 commit (Kuiz hari).

> ⏱️ Tidak sempat? Siapkan sebelum 08:30 Hari 3 — Hari 3 bermula dengan database untuk borang ini.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| *Call to undefined function validation_show_error()* | Form helper belum dimuatkan | `protected $helpers = ['form'];` dalam `Daftar` |
| Ralat validation tidak muncul selepas hantar | `withInput()` tertinggal pada redirect | `return redirect()->to('daftar')->withInput();` |
| Borang sah masih *The action you requested is not allowed.* | `csrf_field()` masih dikomen dari langkah 7 | Pulihkan `<?= csrf_field() ?>`, muat semula `/daftar`, hantar semula |
| Redirect ke `localhost:8080/index.php/...` sedangkan server di port lain | `app.baseURL` dalam `.env` tidak sama dengan port | Guna port 8080, atau tetapkan `app.baseURL = 'http://localhost:8081/'` |

### ⭐ Cabaran tambahan
Tambah medan **Telefon** yang tidak wajib: rule `permit_empty|numeric|max_length[11]`, label `Telefon`, `old('telefon')` dan `validation_show_error('telefon')` dalam view. Hantar dengan Telefon kosong (lulus) dan dengan `01-234` (gagal). Apa yang berlaku jika `permit_empty` dibuang daripada rule?

---

## Semakan kendiri — akhir hari

```bash
cd ~/latihan/kelas-ci-<nama>
git status          # nothing to commit, working tree clean
git log --oneline   # 4 commit: SETUP + 3 CI-ASAS
php spark routes    # hello, hello/([^/]+), daftar (GET & POST)
```
