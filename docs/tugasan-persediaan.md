# Tugasan Persediaan — Sebelum Hari 4

[📅 Jadual](../JADUAL.md) · [📘 Kanun SPEC](../SPEC-KURSUS.md) · [📖 Hari 3](../hari-3/README.md) · [🤝 KOLABORASI](../KOLABORASI.md)

| Perkara | Nilai |
|---------|-------|
| Diedarkan | Hari 3, S4 (15:45–17:00) |
| Tarikh akhir | **Hari 4, 08:30** |
| Disemak | Hari 4, S1 (09:00–10:30) — demo 3 minit setiap pasangan + soalan rawak |
| Kerja | Tugasan **T1** individu (setiap laptop mesti berfungsi); **T2–T4** berpasangan |
| Anggaran masa | 4–6 jam |
| Markah | 100 (lihat [Rubrik](#rubrik-pemarkahan)) — **bukan peperiksaan**; tujuan: memastikan semua orang bermula Hari 4 dari garisan yang sama |

## 🎯 Kenapa tugasan ini

Hari 4 S2 terus mencipta projek CI4 sebenar, memasang Shield dan menulis migration daripada ERD anda. Jika persekitaran tidak berfungsi atau aliran **Route → Controller → Model → View** belum pernah dilihat, anda akan ketinggalan sepanjang Fasa B. Tugasan ini memastikan:

1. Laptop anda **sedia** (T1).
2. Anda sudah melihat CI4 berfungsi hujung-ke-hujung sekali (T2).
3. Reka bentuk anda (ERD) dan keperluan (AC) **bersedia** untuk ditukar kepada kod (T3, T4).

---

## T1 — Pasang persekitaran (individu)

### Senarai semak

| # | Perisian | Versi minimum | Semak dengan | Nota |
|---|----------|---------------|--------------|------|
| 1 | PHP | **8.2** | `php -v` | Windows: **Laragon** ([`persediaan.md`](./persediaan.md) §2) · macOS: Homebrew atau Laravel Herd · Linux: pakej `php8.2` |
| 2 | Sambungan PHP | `intl`, `mbstring`, `mysqlnd`/`mysqli`, `curl`, `json`, `fileinfo`, `gd`, `zip`, `xml`, `dom` | `php -m` | `intl` dan `mbstring` **wajib** untuk CI4; `fileinfo` untuk semakan MIME muat naik (BR-PAS-02); `gd`, `zip`, `xml` untuk PhpSpreadsheet/Dompdf (Hari 9) |
| 3 | Composer | **2.x** | `composer -V` | <https://getcomposer.org/download/> |
| 4 | MySQL / MariaDB | **MySQL 8** atau **MariaDB 10.6+** | `mysql --version` | Windows: MySQL 8.4 Laragon. XAMPP (MariaDB 10.4) terlalu lama — nyahpasang. Ingat nama pengguna & kata laluan root — **jangan** commit |
| 5 | Git | 2.x | `git --version` | Tetapkan `git config --global user.name` dan `user.email` |
| 6 | Editor | VS Code (disyorkan) | — | Sambungan: *PHP Intelephense*, *Markdown Preview Mermaid Support* |
| 7 | Klien DB (pilihan) | HeidiSQL / DBeaver (phpMyAdmin perlu Apache Laragon) | — | Untuk melihat jadual |
| 8 | Terminal (Windows) | **Git Bash** sebagai terminal lalai VS Code | `echo $SHELL` → `/usr/bin/bash` | *Terminal: Select Default Profile → Git Bash* ([`persediaan.md`](./persediaan.md) §5). Semua arahan `bash` kursus dijalankan di sini |

### Langkah pengesahan

```bash
php -v
php -m
composer -V
mysql --version
git --version
```

**macOS / Linux / Windows Git Bash** — semak sambungan sekali gus:
```bash
for e in intl mbstring mysqli mysqlnd curl json fileinfo gd zip xml dom; do
  php -m | grep -qi "^$e$" && echo "OK    $e" || echo "TIADA $e"
done
```

**Jika bukan Git Bash (PowerShell)**:
```powershell
"intl","mbstring","mysqli","mysqlnd","curl","json","fileinfo","gd","zip","xml","dom" | ForEach-Object {
  if (php -m | Select-String -Pattern "^$_$" -Quiet) { "OK    $_" } else { "TIADA $_" }
}
```

> 💡 **Tip Windows:** Jika `intl` TIADA, buka `php.ini` (Laragon: *Menu → PHP → php.ini*; atau lokasi: `php --ini`), cari `;extension=intl`, buang `;`, simpan, tutup dan buka semula terminal.

### Bukti

Simpan output kelima-lima arahan + semakan sambungan ke `docs/tugasan/T1-persekitaran.txt` dalam repo dokumen pasangan anda (satu fail setiap ahli: `T1-persekitaran-<nama>.txt`).

---

## T2 — Tutorial rasmi CI4: *Build Your First Application*

Rujukan: <https://codeigniter.com/user_guide/tutorial/index.html>

Anda akan membina aplikasi **berita** kecil yang menggunakan corak yang sama dengan sistem TLK/Pas: route → controller → model → view, borang dengan validasi, dan CSRF.

### Bahagian yang wajib disiapkan

| # | Bahagian tutorial | Hasil yang boleh dilihat |
|---|-------------------|--------------------------|
| 2a | Persediaan projek (`composer create-project codeigniter4/appstarter ci-news`) + `.env` | `php spark serve` → halaman selamat datang CI4 di `http://localhost:8080` |
| 2b | **Static Pages** — controller `Pages`, view `templates/header.php`, `templates/footer.php`, `pages/home.php`, `pages/about.php` | `http://localhost:8080/home` dan `/about` dipaparkan dengan header & footer |
| 2c | **News Section** — jadual `news`, `NewsModel`, controller `News` (`index`, `show`) | `/news` menyenaraikan berita; `/news/<slug>` memaparkan satu berita |
| 2d | **Create News Items** — borang `news/new`, `create()` dengan validasi, `url_title()` untuk slug | Borang di `/news/new`; ralat validasi dipaparkan bila medan kosong; berita baharu muncul di `/news` |

### Nota persediaan

1. Cipta pangkalan data:
   ```sql
   CREATE DATABASE ci4tutorial CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   ```
2. Salin `env` ke `.env` dan tetapkan (nilai contoh — guna kata laluan anda sendiri):
   ```ini
   CI_ENVIRONMENT = development

   database.default.hostname = localhost
   database.default.database = ci4tutorial
   database.default.username = root
   database.default.password =
   database.default.DBDriver = MySQLi
   ```
3. **Data sintetik sahaja** untuk berita (cth "Latihan CI4 Hari 1", "Ujian slug berita"). Tiada nama atau berita sebenar.
4. Jika anda menggunakan Git untuk `ci-news`, pastikan `.env` **tidak** dicommit (`git check-ignore .env` mesti mencetak `.env`).

### Soalan refleksi (jawab dalam `docs/tugasan/T2-refleksi.md`, 3–5 ayat setiap satu)

1. Surih satu permintaan ke `/news/latihan-ci4`: fail mana dipanggil, dalam susunan apa? (Routes → … → View)
2. Apa fungsi `$allowedFields` dalam `NewsModel`? Apa akan berlaku jika ia tiada?
3. Kenapa tutorial memanggil `esc()` dalam view?
4. Borang `news/new` mengandungi `csrf_field()`. Apa yang dihalang oleh CSRF?
5. Dalam sistem TLK, apakah padanan bagi `News`, `NewsModel` dan jadual `news`? (Petunjuk: SPEC §5.)

### Bukti

- Tangkapan skrin dalam `docs/tugasan/`: `T2a-welcome.png`, `T2b-about.png`, `T2c-news-list.png`, `T2d-validation-error.png`, `T2d-news-created.png`
- `docs/tugasan/T2-refleksi.md`
- Projek `ci-news` berjalan di laptop untuk demo Hari 4

> ⚠️ **Disiplin AI (KOLABORASI §3):** AI dibenarkan untuk **menerangkan ralat**. Jangan minta AI menjana keseluruhan tutorial. Pada Hari 4, jurulatih akan menunjuk **satu baris rawak** dalam `News.php` atau `NewsModel.php` — anda mesti boleh menerangkannya.

---

## T3 — Perhalusi ERD (berpasangan)

### Langkah

1. Buka `docs/semakan-reka-bentuk.md` (Hari 3 Lab 3.4). Pastikan **semua** item E1–E8 kini Lulus.
2. Kemas kini `docs/erd.md`:
   - ERD Mermaid 10 jadual, 13 hubungan, sepadan SPEC §3.
   - Tambah bahagian `## Urutan migration` — senaraikan susunan jadual dicipta supaya setiap FK merujuk jadual yang telah wujud. Nyatakan di mana medan tambahan `users` (`full_name`, `staff_no`, `department_id`, `phone`) ditambah berbanding jadual Shield.
   - Tambah bahagian `## Perubahan sejak Hari 3` — senarai apa yang diubah dan kenapa.
3. Kemas kini `docs/kamus-data.md` supaya selaras dengan ERD.
4. Commit: `SETUP: perhalusi ERD & kamus data untuk migration`.

### Bukti

`docs/erd.md` dan `docs/kamus-data.md` dikemas kini; commit bertarikh selepas Hari 3.

---

## T4 — Tulis 3 acceptance criteria baharu (berpasangan)

Tulis **3 AC baharu** (bukan salinan dari Hari 2) dalam `docs/acceptance-criteria.md`, bahagian `## AC Tugasan Persediaan`. Syarat:

| # | Syarat |
|---|--------|
| 1 | Satu AC untuk **FR-TLK** yang belum ada AC (cth pembatalan `approved → cancelled`, tamat tempoh, atau CRUD slot admin) |
| 2 | Satu AC untuk **FR-PAS** yang menguji **akses peranan** (cth `reviewer` cuba meluluskan; `applicant` cuba buka `/pas/semakan`) |
| 3 | Satu AC jenis **sempadan** (🟡) untuk mana-mana BR — dengan jadual `Contoh:` sekurang-kurangnya 3 baris |

Setiap AC: ID `AC-…`, Given (data konkrit dari *Data ujian asas*), satu When, Then boleh diperhatikan, rujukan FR & BR.

---

## 📤 Cara menghantar

1. Pastikan struktur ini wujud dalam repo dokumen pasangan anda:
   ```text
   docs/
   ├── erd.md                     # T3
   ├── kamus-data.md              # T3
   ├── acceptance-criteria.md     # T4 (bahagian baharu)
   └── tugasan/
       ├── T1-persekitaran-<nama1>.txt
       ├── T1-persekitaran-<nama2>.txt
       ├── T2a-welcome.png … T2d-news-created.png
       └── T2-refleksi.md
   ```
2. Commit & tag:
   ```bash
   git add docs/ && git commit -m "SETUP: tugasan persediaan Hari 4"
   git tag tugasan-persediaan
   ```
3. Bawa laptop dengan `ci-news` sedia untuk `php spark serve`.

---

## Rubrik pemarkahan

| Tugasan | Kriteria | Cemerlang | Memuaskan | Perlu bantuan | Markah |
|---------|----------|-----------|-----------|---------------|--------|
| **T1** Persekitaran | Versi & sambungan | PHP ≥ 8.2, semua 11 sambungan OK, Composer 2, MySQL 8/MariaDB 10.6+, Git dikonfigur (Windows: Git Bash terminal lalai) — **(20)** | Semua perisian ada; 1–2 sambungan bukan-wajib tiada (`gd`/`zip`) — **(14)** | PHP < 8.2, atau `intl`/`mbstring` tiada, atau MySQL tidak berjalan — **(0–7)** | /20 |
| **T2** Tutorial CI4 | 2a–2d berfungsi | Keempat-empat berfungsi dalam demo langsung; validasi & CSRF berfungsi — **(20)** | 2a–2c berfungsi; 2d separa — **(13)** | Hanya 2a/2b — **(0–6)** | /20 |
| | Refleksi & kefahaman | 5 soalan dijawab tepat; boleh menerangkan baris rawak dengan yakin — **(20)** | 3–4 soalan tepat; penerangan baris dengan sedikit bantuan — **(13)** | < 3 soalan; tidak dapat menerangkan baris — **(0–6)** | /20 |
| **T3** ERD | Ketepatan & urutan migration | ERD 100% sepadan SPEC §3; urutan migration betul; perubahan direkod — **(20)** | 1–2 ralat kecil (ejaan medan, kardinaliti); urutan hampir betul — **(13)** | Jadual/medan hilang atau `users.role` masih ada; tiada urutan — **(0–6)** | /20 |
| **T4** AC | Kualiti 3 AC | 3 AC memenuhi syarat 1–3; data konkrit; satu When; Then boleh diperhatikan — **(20)** | 3 AC ada; satu syarat tidak dipenuhi atau satu Then kabur — **(13)** | < 3 AC atau tidak boleh diuji — **(0–6)** | /20 |
| | | | | **Jumlah** | **/100** |

### Tafsiran markah

| Julat | Maksud | Tindakan Hari 4 |
|-------|--------|-----------------|
| 80–100 | Sedia sepenuhnya | Boleh mengambil ⭐ cabaran tambahan Hari 4 |
| 60–79 | Sedia dengan jurang kecil | Betulkan jurang semasa S2 dengan bantuan rakan |
| < 60 | Perlu sokongan | Klinik persekitaran bersama jurulatih awal S2; dipasangkan dengan peserta "Cemerlang" |

> **T1 dan T2a adalah pintu masuk.** Jika laptop tidak dapat menjalankan `php spark serve` pada 09:00 Hari 4, jurulatih akan membantu **sebelum** apa-apa lagi — beritahu jurulatih seawal mungkin (malam Hari 3) jika anda tersekat.

---

## 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Class "Locale" not found` / ralat `intl` | Sambungan `intl` tidak dihidupkan | Hidupkan `extension=intl` dalam `php.ini`; buka semula terminal |
| `composer: command not found` | Composer tiada dalam PATH | Pasang semula dengan pemasang rasmi; Laragon: *Menu → Tools → Path → Add Laragon to Path*, kemudian buka semula VS Code |
| `Unable to connect to the database` | `.env` salah atau MySQL tidak berjalan | Semak `database.default.*`; mulakan servis MySQL; cuba `mysql -u root -p` |
| Halaman `/news` papar "Whoops!" tanpa butiran | `CI_ENVIRONMENT` bukan `development` | Tetapkan `CI_ENVIRONMENT = development` dalam `.env` |
| `404 - Can't find a route for 'GET: news'` | Route tidak ditambah / susunan salah | Semak `app/Config/Routes.php`; route `news` mesti sebelum `(:segment)` pages |
| Borang hantar → "The action you requested is not allowed" | Token CSRF tiada/tamat | Pastikan `<?= csrf_field() ?>` dalam borang; muat semula halaman |
| Port 8080 sudah digunakan | Aplikasi lain | `php spark serve --port 8081` dan `app.baseURL = 'http://localhost:8081/'` dalam `.env` |
| Composer: `curl error 60` / `unable to get local issuer certificate`, atau sangat lambat / *timeout* | SSL inspection pejabat; Windows Defender mengimbas `vendor/` | [`persediaan.md`](./persediaan.md) §3 (*Rangkaian pejabat dengan SSL inspection*) dan §8 (baris Defender/antivirus) |

---

## ❓ Soalan?

Tambah soalan dalam `docs/soalan-terbuka.md` atau hubungi jurulatih melalui kumpulan kursus. Jangan tunggu sehingga pagi Hari 4 jika persekitaran gagal.
