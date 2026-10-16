# Tugasan Persediaan — Latihan Kendiri (Pilihan)

[📅 Jadual](../JADUAL.md) · [📘 Kanun SPEC](spesifikasi-sistem.md) · [📖 Hari 3](../hari-3/README.md) · [🤝 KOLABORASI](kolaborasi.md)

| Perkara | Nilai |
|---------|-------|
| Status | **Pilihan** — latihan kendiri, tidak dihantar dan tidak dimarkah |
| Bila | Bila-bila masa: sebelum kursus, malam Hari 2–3, atau semasa menunggu |
| Kerja | Individu, di laptop anda sendiri |
| Anggaran masa | T1: 15 minit · T2: 2–3 jam |
| Hubungan dengan kursus | Kerja wajib berlaku dalam projek `kelas-ci-<nama>` anda ([Hari 2 Lab 2.2](../hari-2/lab.md#lab-22--projek-ci-anda-di-gitlab-s2) dan seterusnya). Hari 4 S1 **tidak** menyemak halaman ini |

## 🎯 Kenapa tugasan ini

Mulai Hari 2 anda membina aplikasi sendiri dalam `kelas-ci-<nama>`: route → controller → view (Lab 2.3), borang (Lab 2.4), database dan model (Hari 3). Halaman ini memberi dua latihan tambahan untuk sesiapa yang mahu lebih masa:

1. Pastikan laptop anda **sedia** sebelum kelas (T1).
2. Lihat aliran **Route → Controller → Model → View** sekali lagi dalam projek berasingan, ikut tutorial rasmi CI4 (T2).

> 📚 Tugasan lama T3 (perhalusi ERD) dan T4 (acceptance criteria) telah dibuang. ERD siap tersedia dalam [`erd-rujukan.md`](./erd-rujukan.md); bahan ERD, kamus data dan AC yang asal kini bacaan pilihan dalam [`rujukan-keperluan.md`](./rujukan-keperluan.md).

---

## T1 — Semak persekitaran

### Senarai semak

| # | Perisian | Versi minimum | Semak dengan | Nota |
|---|----------|---------------|--------------|------|
| 1 | PHP | **8.2** | `php -v` | Windows: **Laragon** ([`persediaan.md`](./persediaan.md) §2) · macOS: Homebrew atau Laravel Herd · Linux: package `php8.2` |
| 2 | PHP extension | `intl`, `mbstring`, `mysqlnd`/`mysqli`, `curl`, `json`, `fileinfo`, `gd`, `zip`, `xml`, `dom` | `php -m` | `intl` dan `mbstring` **wajib** untuk CI4; `fileinfo` untuk semakan MIME muat naik (BR-PAS-02); `gd`, `zip`, `xml` untuk PhpSpreadsheet/Dompdf (Hari 9) |
| 3 | Composer | **2.x** | `composer -V` | <https://getcomposer.org/download/> |
| 4 | MySQL / MariaDB | **MySQL 8** atau **MariaDB 10.6+** | `mysql --version` | Windows: MySQL 8.4 Laragon. XAMPP (MariaDB 10.4) terlalu lama — nyahpasang. Ingat nama pengguna & kata laluan root — **jangan** commit |
| 5 | Git | 2.x | `git --version` | Tetapkan `git config --global user.name` dan `user.email` |
| 6 | Editor | VS Code (disyorkan) | — | Extension: *PHP Intelephense*, *Markdown Preview Mermaid Support* |
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

**macOS / Linux / Windows Git Bash** — semak extension sekali gus:
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

### Hasil

Semua baris `OK` dan kelima-lima arahan mencetak versi. Ada `TIADA` atau ralat? Betulkan ikut [`persediaan.md`](./persediaan.md) atau beritahu jurulatih **sebelum** Hari 2 S2 — Lab 2.2 memerlukan PHP, Composer dan Git yang berfungsi.

---

## T2 — Tutorial rasmi CI4: *Build Your First Application*

Rujukan: <https://codeigniter.com/user_guide/tutorial/index.html>

Anda akan membina aplikasi **berita** kecil yang menggunakan corak yang sama dengan sistem TLK/Pas: route → controller → model → view, borang dengan validasi, dan CSRF.

### Bahagian tutorial

| # | Bahagian tutorial | Hasil yang boleh dilihat |
|---|-------------------|--------------------------|
| 2a | Persediaan projek (`composer create-project codeigniter4/appstarter ci-news`) + `.env` | `php spark serve` → halaman selamat datang CI4 di `http://localhost:8080` |
| 2b | **Static Pages** — controller `Pages`, view `templates/header.php`, `templates/footer.php`, `pages/home.php`, `pages/about.php` | `http://localhost:8080/home` dan `/about` dipaparkan dengan header & footer |
| 2c | **News Section** — jadual `news`, `NewsModel`, controller `News` (`index`, `show`) | `/news` menyenaraikan berita; `/news/<slug>` memaparkan satu berita |
| 2d | **Create News Items** — borang `news/new`, `create()` dengan validasi, `url_title()` untuk slug | Borang di `/news/new`; ralat validasi dipaparkan bila medan kosong; berita baharu muncul di `/news` |

### Nota persediaan

1. Cipta database:
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
5. Bina `ci-news` dalam folder **berasingan** (cth `~/latihan/ci-news`), bukan di dalam `kelas-ci-<nama>`. Jangan push `ci-news` ke repo kursus anda.

### Soalan refleksi (untuk diri sendiri, 3–5 ayat setiap satu)

1. Surih satu permintaan ke `/news/latihan-ci4`: fail mana dipanggil, dalam susunan apa? (Routes → … → View)
2. Apa fungsi `$allowedFields` dalam `NewsModel`? Apa akan berlaku jika ia tiada?
3. Kenapa tutorial memanggil `esc()` dalam view?
4. Borang `news/new` mengandungi `csrf_field()`. Apa yang dihalang oleh CSRF?
5. Dalam sistem TLK, apakah padanan bagi `News`, `NewsModel` dan jadual `news`? (Petunjuk: SPEC §5.)

Bandingkan jawapan anda dengan kod `kelas-ci-<nama>`: `Hello` dan `Daftar` (Hari 2), `DepartmentModel` dan `Jabatan` (Hari 3) menggunakan corak yang sama.

> ⚠️ **Disiplin AI (KOLABORASI §3):** AI dibenarkan untuk **menerangkan ralat**. Jangan minta AI menjana keseluruhan tutorial. Uji diri: pilih satu baris rawak dalam `News.php` atau `NewsModel.php` — bolehkah anda menerangkannya tanpa bantuan?

---

## 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Class "Locale" not found` / ralat `intl` | Extension `intl` tidak dihidupkan | Hidupkan `extension=intl` dalam `php.ini`; buka semula terminal |
| `composer: command not found` | Composer tiada dalam PATH | Pasang semula dengan pemasang rasmi; Laragon: *Menu → Tools → Path → Add Laragon to Path*, kemudian buka semula VS Code |
| `Unable to connect to the database` | `.env` salah atau MySQL tidak berjalan | Semak `database.default.*`; mulakan servis MySQL; cuba `mysql -u root -p` |
| Halaman `/news` papar "Whoops!" tanpa butiran | `CI_ENVIRONMENT` bukan `development` | Tetapkan `CI_ENVIRONMENT = development` dalam `.env` |
| `404 - Can't find a route for 'GET: news'` | Route tidak ditambah / susunan salah | Semak `app/Config/Routes.php`; route `news` mesti sebelum `(:segment)` pages |
| Borang hantar → "The action you requested is not allowed" | Token CSRF tiada/tamat | Pastikan `<?= csrf_field() ?>` dalam borang; muat semula halaman |
| Port 8080 sudah digunakan | Aplikasi lain | `php spark serve --port 8081` dan `app.baseURL = 'http://localhost:8081/'` dalam `.env` |
| Composer: `curl error 60` / `unable to get local issuer certificate`, atau sangat lambat / *timeout* | SSL inspection pejabat; Windows Defender mengimbas `vendor/` | [`persediaan.md`](./persediaan.md) §3 (*Rangkaian pejabat dengan SSL inspection*) dan §8 (baris Defender/antivirus) |

---

## ❓ Soalan?

Tanya jurulatih melalui kumpulan kursus. Jika persekitaran gagal, beritahu seawal mungkin — jangan tunggu sehingga Lab 2.2.
