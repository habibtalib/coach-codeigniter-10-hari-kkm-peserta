# Lab Hari 3 — Database, Migration, Model & Carian

[📅 Jadual](../JADUAL.md) · [📘 Spesifikasi](../docs/spesifikasi-sistem.md) · [📖 README Hari 3](./README.md) · [⚡ Arahan spark](../docs/arahan-spark.md)

| Lab | Sesi | Hasil |
|-----|------|-------|
| [Lab 3.1](#lab-31--database-mysql--env-s1) | S1 | Database `kkm_latihan` + `kkm_latihan_test`, pengguna `kkm_dev`, `.env` bersambung |
| [Lab 3.2](#lab-32--migration--seeder-pertama-s2) | S2 | Migration `departments` + `parking_zones`, seeder idempoten; commit di-push |
| [Lab 3.3](#lab-33--model--halaman-jabatan-s3) | S3 | `DepartmentModel` + `/jabatan` (senarai & borang baharu); commit di-push |
| [Lab 3.4](#lab-34--carian--pagination-zon-s4) | S4 | `/zon` dengan carian `?q=` & pagination; commit di-push |

> Semua kerja dalam projek **individu** `~/latihan/kelas-ci-<nama>` (Hari 2). Jadual & medan ikut [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 dan [`erd-rujukan.md`](../docs/erd-rujukan.md) — anda tidak perlu melukis ERD sendiri. Bahan ERD/kamus data/wireframe yang asal kini bacaan pilihan dalam [`rujukan-keperluan.md`](../docs/rujukan-keperluan.md).

---

## Lab 3.1 — Database MySQL & `.env` (S1)

### 🎯 Objektif
Mencipta database pembangunan dan ujian dengan pengguna khusus `kkm_dev`, menyambung projek `kelas-ci-<nama>` melalui `.env`, dan mengesahkan connection dengan `php spark db:table --show`.

### Prasyarat
- [Lab 2.4](../hari-2/lab.md#lab-24--borang-validation--csrf-s4) siap: GitLab menunjukkan 4 commit.
- Laragon → **Start All** (MySQL hijau). Terminal Git Bash dalam VS Code.

> 🔍 **Bukti kerja:** platform menanda checkpoint lab hari ini apabila anda **lulus Kuiz hari** — soalannya hanya boleh dijawab dengan menjalankan kod.

### Langkah
1. **Semak MySQL:**
   ```bash
   mysql --version
   ```
   `mysql: command not found`? Laragon → *Menu → Tools → Path → Add Laragon to Path*, tutup VS Code dan buka semula.
2. **Cipta database & pengguna** (sekali sahaja; langkau jika anda sudah buat [`persediaan.md`](../docs/persediaan.md) §4). Laragon: pengguna `root` tanpa kata laluan:
   ```bash
   mysql -u root <<'SQL'
   CREATE DATABASE IF NOT EXISTS kkm_latihan      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE IF NOT EXISTS kkm_latihan_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'kkm_dev'@'localhost' IDENTIFIED BY 'Latihan@2026';
   GRANT ALL PRIVILEGES ON kkm_latihan.*      TO 'kkm_dev'@'localhost';
   GRANT ALL PRIVILEGES ON kkm_latihan_test.* TO 'kkm_dev'@'localhost';
   FLUSH PRIVILEGES;
   SQL
   mysql -u kkm_dev -p -e "SHOW DATABASES LIKE 'kkm_latihan%';"
   ```
   Kata laluan `Latihan@2026`. Output menyenaraikan `kkm_latihan` dan `kkm_latihan_test`. Data latihan sahaja — **jangan** guna kata laluan sebenar.
3. **Sambung `.env`.** Buka `.env` dalam VS Code dan tambah di bawah `CI_ENVIRONMENT`:
   ```ini
   app.baseURL = 'http://localhost:8080/'
   app.appTimezone = 'Asia/Kuala_Lumpur'

   database.default.hostname = localhost
   database.default.database = kkm_latihan
   database.default.username = kkm_dev
   database.default.password = Latihan@2026
   database.default.DBDriver = MySQLi
   database.default.DBPrefix =
   database.default.port = 3306
   database.default.charset = utf8mb4
   database.default.DBCollat = utf8mb4_unicode_ci
   ```
4. **Uji connection:**
   ```bash
   php spark db:table --show
   ```
   Database baharu masih kosong: CI mencetak *Database has no tables!* — itu tanda connection **berjaya**. Ralat *Unable to connect* bermaksud `.env` salah.
5. **`.env` kekal rahsia:**
   ```bash
   git status --short
   git check-ignore -v .env
   ```
   `git status` tidak menyenaraikan `.env`; `git check-ignore` menunjukkan baris `.gitignore` yang mengabaikannya. Tiada fail untuk di-commit dalam lab ini.

### ✅ Checkpoint
- [ ] `SHOW DATABASES LIKE 'kkm_latihan%'` sebagai `kkm_dev` menyenaraikan dua database (Kuiz hari).
- [ ] `php spark db:table --show` mencetak *Database has no tables!* tanpa ralat connection (Kuiz hari).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `ERROR 2003 … Can't connect to MySQL server` | MySQL Laragon belum dimulakan | Laragon → **Start All**; tunggu MySQL hijau |
| `ERROR 1045 Access denied for user 'root'` | MySQL root ada kata laluan (bukan Laragon lalai) | `mysql -u root -p` dan masukkan kata laluan root anda |
| `mysql` tergantung tanpa prompt | Tetingkap Git Bash berasingan (mintty) | Guna terminal VS Code, atau `winpty mysql -u kkm_dev -p` |
| `Unable to connect to the database` | Nilai `.env` salah atau `#` masih ada | Semak setiap baris `database.default.*`; cuba `hostname = 127.0.0.1` |
| `Access denied for user 'kkm_dev'` | Kata laluan dalam `.env` tidak sama | Mesti `Latihan@2026` (huruf besar L) |

### ⭐ Cabaran tambahan
Buka HeidiSQL (Laragon → butang **Database**), log masuk sebagai `kkm_dev` dan lihat kedua-dua database. Kenapa kursus ini tidak menggunakan `root` dalam `.env`?

---

## Lab 3.2 — Migration & seeder pertama (S2)

### 🎯 Objektif
Menulis migration bagi `departments` dan `parking_zones` **tepat** seperti spesifikasi §3, menguji `migrate` / `rollback`, dan mengisi data sintetik dengan seeder yang boleh dijalankan berulang kali.

### Prasyarat
- [Lab 3.1](#lab-31--database-mysql--env-s1) siap.
- Buka [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 di sebelah.

### Langkah
1. **Jana dua migration** (tertib penting — cap masa menentukan tertib larian):
   ```bash
   php spark make:migration CreateDepartmentsTable
   php spark make:migration CreateParkingZonesTable
   ```
2. **`CreateDepartmentsTable`** — isi fail yang dijana dalam `app/Database/Migrations/`:

   Petunjuk: `$this->forge->addField([...])` dengan `id` INT 11 UNSIGNED `auto_increment`, `code` VARCHAR 20, `name` VARCHAR 150, `created_at`/`updated_at` DATETIME `null` → `addPrimaryKey('id')` → `addUniqueKey('code')` → `createTable('departments', false, ['ENGINE' => 'InnoDB'])`.

   ```php
   public function up(): void
   {
       // TODO: addField — id, code, name, created_at, updated_at
       // TODO: addPrimaryKey, addUniqueKey('code'), createTable('departments', …)
   }
   public function down(): void { /* TODO: dropTable('departments', true) */ }
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.2-2](../docs/kod-rujukan-hari-3.md#32-2--createdepartmentstable)
3. **`CreateParkingZonesTable`** — corak yang sama, medan ikut spesifikasi §3 (`code` VARCHAR(10) UNIQUE, `name` VARCHAR(100), `location` VARCHAR(150)):

   Petunjuk: sama seperti `CreateDepartmentsTable`, medan `code` VARCHAR 10 UNIQUE, `name` VARCHAR 100, `location` VARCHAR 150.

   ```php
   public function up(): void
   {
       // TODO: addField — id, code, name, location, created_at, updated_at
       // TODO: addPrimaryKey, addUniqueKey('code'), createTable('parking_zones', …)
   }
   public function down(): void { /* TODO: dropTable('parking_zones', true) */ }
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.2-3](../docs/kod-rujukan-hari-3.md#32-3--createparkingzonestable)
4. **Jalankan, semak, undur, jalankan semula** (kitaran pendek):
   ```bash
   php spark migrate
   php spark migrate:status
   php spark db:table --show
   php spark migrate:rollback
   php spark migrate
   php spark migrate:status
   php spark db:table departments --metadata
   ```
   Catat **bilangan jadual** dalam `db:table --show` dan nilai lajur **Batch** selepas rollback + migrate — soalan Kuiz hari.
5. **Seeder.** Jana tiga fail:
   ```bash
   php spark make:seeder DepartmentSeeder
   php spark make:seeder ParkingSeeder
   php spark make:seeder DatabaseSeeder
   ```
   `DepartmentSeeder` — `ignore(true)` menjadikan `INSERT IGNORE`, jadi larian kedua tidak menambah baris berganda:

   Data (salin tepat — Kuiz hari bergantung padanya): `BTM` Bahagian Teknologi Maklumat (Latihan) · `BKW` Bahagian Kewangan (Latihan) · `BSM` Bahagian Sumber Manusia (Latihan) · `BPA` Bahagian Pengurusan Aset (Latihan). Isi `created_at` dan `updated_at` dengan `date('Y-m-d H:i:s')`.

   ```php
   public function run(): void
   {
       $rows = [/* TODO: 4 jabatan di atas + created_at/updated_at */];
       // TODO: table('departments')->ignore(true)->insertBatch($rows)
   }
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.2-5a](../docs/kod-rujukan-hari-3.md#32-5a--departmentseeder)
   `ParkingSeeder` — tiga zon (Hari 4 menambah slot dalam fail yang sama):

   Data (salin tepat): `A` Blok Utama — *Aras G, pintu masuk utama* · `B` Blok Klinik — *Sebelah klinik pakar* · `C` Parkir Bertingkat — *Aras 1–3, bangunan parkir*.

   ```php
   public function run(): void
   {
       $zones = [/* TODO: zon A, B, C di atas + created_at/updated_at */];
       // TODO: table('parking_zones')->ignore(true)->insertBatch($zones)
   }
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.2-5b](../docs/kod-rujukan-hari-3.md#32-5b--parkingseeder)
   `DatabaseSeeder` — memanggil seeder lain mengikut tertib:

   Petunjuk: `$this->call(DepartmentSeeder::class)` — induk dahulu.

   ```php
   public function run(): void
   {
       // TODO: $this->call(DepartmentSeeder::class) dan ParkingSeeder
   }
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.2-5c](../docs/kod-rujukan-hari-3.md#32-5c--databaseseeder)
6. **Jalankan dua kali** (ujian idempoten):
   ```bash
   php spark db:seed DatabaseSeeder
   php spark db:seed DatabaseSeeder
   php spark db:table departments
   ```
   `departments` mesti ada **4** baris, bukan 8.
7. Commit dan push:
   ```bash
   git add . && git commit -m "DB: migration departments + parking_zones, seeder" && git push
   ```

### ✅ Checkpoint
- [ ] `php spark migrate:status` menunjukkan 2 migration `App` dengan tarikh *Migrated On* (Kuiz hari).
- [ ] Selepas `db:seed` dua kali, `departments` ada 4 baris dan `parking_zones` 3 baris (Kuiz hari).
- [ ] GitLab menunjukkan commit `DB: migration departments + parking_zones, seeder` (Kuiz hari).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `migrate` tidak buat apa-apa | Kelas dalam fail tidak sama dengan nama fail, atau namespace salah | Nama kelas = bahagian selepas cap masa (`CreateDepartmentsTable`); namespace `App\Database\Migrations` |
| `Table 'departments' already exists` | Jadual dicipta manual atau migration dijalankan dua kali dengan cap masa berbeza | `php spark migrate:rollback`, padam fail berganda, `php spark migrate` |
| `Duplicate entry 'BTM' for key 'code'` pada larian kedua | `ignore(true)` tertinggal | `$this->db->table('departments')->ignore(true)->insertBatch($rows)` |
| `Class "App\Database\Seeds\DepartmentSeeder" not found` | Nama fail ≠ nama kelas | Fail `DepartmentSeeder.php`, kelas `DepartmentSeeder` |

### ⭐ Cabaran tambahan
Jalankan `php spark migrate:refresh` kemudian `php spark db:seed DatabaseSeeder`. Apa yang `refresh` lakukan, dan kenapa ia **tidak boleh** dijalankan pada database production?

---

## Lab 3.3 — Model & halaman `/jabatan` (S3)

### 🎯 Objektif
Membina `DepartmentModel` dengan `$allowedFields`, `$useTimestamps` dan validation, kemudian halaman `/jabatan` (senarai) dan `/jabatan/baharu` (borang) menggunakan layout dan corak PRG dari Lab 2.4.

### Prasyarat
- [Lab 3.2](#lab-32--migration--seeder-pertama-s2) siap: `departments` ada 4 baris.

### Langkah
1. **Model** `app/Models/DepartmentModel.php`:

   Jana fail: `php spark make:model DepartmentModel`. Petunjuk: `$allowedFields = ['code', 'name']`; `$useTimestamps = true`; rule `code` = `required|alpha_numeric|max_length[20]|is_unique[departments.code,id,{id}]` (label `Kod`), `name` = `required|min_length[3]|max_length[150]` (label `Nama`).

   ```php
   class DepartmentModel extends Model
   {
       // TODO: $table, $returnType = 'array', $allowedFields, $useTimestamps
       // TODO: $validationRules — code (label Kod) & name (label Nama)
   }
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.3-1](../docs/kod-rujukan-hari-3.md#33-1--departmentmodel)
   - `$allowedFields` — hanya medan ini boleh diisi dari input (mass assignment selamat).
   - `$useTimestamps` — `created_at`/`updated_at` diisi automatik.
   - `is_unique[departments.code,id,{id}]` — kod mesti unik (kecuali rekod sendiri semasa kemas kini).
2. **Route** dalam `app/Config/Routes.php`:
   ```php
   $routes->get('jabatan', 'Jabatan::index');
   $routes->get('jabatan/baharu', 'Jabatan::baharu');
   $routes->post('jabatan', 'Jabatan::simpan');
   ```
3. **Controller** `app/Controllers/Jabatan.php`:

   Jana fail: `php spark make:controller Jabatan`. Petunjuk: `model(DepartmentModel::class)->orderBy('code')->findAll()`; `$this->request->getPost(['code', 'name'])`; `insert()` memulangkan `false` bila gagal → `redirect()->to('jabatan/baharu')->withInput()->with('errors', $model->errors())`; berjaya → `redirect()->to('jabatan')->with('berjaya', 'Jabatan ' . $data['code'] . ' disimpan.')`.

   ```php
   class Jabatan extends BaseController
   {
       protected $helpers = ['form'];
       // TODO: index() — senarai ikut code; baharu() — borang
       // TODO: simpan() — insert(); gagal → withInput + errors; berjaya → flash
   }
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.3-3](../docs/kod-rujukan-hari-3.md#33-3--jabatan)
   Validation berlaku dalam **model**: `insert()` memulangkan `false` dan `$model->errors()` memberi mesej ikut medan.
4. **View senarai** `app/Views/jabatan/index.php`:

   Petunjuk: sama seperti `daftar.php` (Lab 2.4): `session()->getFlashdata('berjaya')`, `site_url('jabatan/baharu')`, setiap nilai melalui `esc()`.

   ```php
   <?= $this->extend('layout') ?>
   <?= $this->section('content') ?>
   <!-- TODO: h1, flash 'berjaya', pautan + Jabatan baharu -->
   <!-- TODO: jadual Kod | Nama | Dicipta — foreach $jabatan, esc() -->
   <?= $this->endSection() ?>
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.3-4](../docs/kod-rujukan-hari-3.md#33-4--jabatanindexphp)
5. **View borang** `app/Views/jabatan/baharu.php`:

   Petunjuk: input `name="code"` dan `name="name"` dengan `esc(old('code'))`; ralat medan `$errors['code']` / `$errors['name']` dalam `<span class="ralat">`.

   ```php
   <?= $this->extend('layout') ?>
   <?= $this->section('content') ?>
   <!-- TODO: $errors = session()->getFlashdata('errors') ?? [] -->
   <!-- TODO: form POST jabatan + csrf_field(); code & name + old() + ralat -->
   <?= $this->endSection() ?>
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.3-5](../docs/kod-rujukan-hari-3.md#33-5--jabatanbaharuphp)
6. **Uji.** `php spark serve`, buka <http://localhost:8080/jabatan> (4 jabatan, susunan ikut kod). Klik **+ Jabatan baharu**:
   - Hantar kosong → ralat Kod dan Nama.
   - Hantar Kod `BTM` → catat mesej ralat **tepat** di bawah Kod (soalan Kuiz hari).
   - Hantar Kod `BPP`, Nama `Bahagian Perolehan (Latihan)` → kembali ke senarai dengan *"Jabatan BPP disimpan."* dan lajur **Dicipta** berisi tarikh masa.
7. Commit dan push:
   ```bash
   git add . && git commit -m "JABATAN: model, senarai & borang baharu" && git push
   ```

### ✅ Checkpoint
- [ ] `/jabatan` menyenaraikan jabatan daripada database melalui `DepartmentModel` (Kuiz hari).
- [ ] Kod berganda ditolak dengan mesej validation model; jabatan baharu disimpan dengan `created_at` automatik (Kuiz hari).
- [ ] GitLab menunjukkan commit `JABATAN: model, senarai & borang baharu` (Kuiz hari).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| *The Kod field is required.* walaupun Kod diisi | Atribut `name` dalam borang tidak sama dengan medan model | `name="code"` dan `name="name"` tepat, sama dengan `$allowedFields` |
| Kod berganda tidak ditolak | `is_unique` tertinggal atau salah nama jadual | `is_unique[departments.code,id,{id}]` |
| Ralat tidak dipaparkan | Lupa `->with('errors', $model->errors())` atau tiada `withInput()` | Ikut `simpan()` di atas |
| Lajur Dicipta kosong | `$useTimestamps` tertinggal | `protected $useTimestamps = true;` |
| *The action you requested is not allowed.* | Borang tanpa `csrf_field()` (CSRF global dari Lab 2.4) | Tambah `<?= csrf_field() ?>` |

### ⭐ Cabaran tambahan
Tambah `/jabatan/(:num)/edit` (GET borang terisi, POST `update($id, $data)`) dengan route dan view sendiri. Kenapa `{id}` dalam `is_unique` penting sekarang?

⭐ **Konsol interaktif:** bina `php spark shell` ([Arahan spark](../docs/arahan-spark.md#php-spark-shell)), kemudian cuba `model(App\Models\DepartmentModel::class)->insert(['code' => 'UJI', 'name' => 'Ujian'])` dua kali dan baca `->errors()` — mesej yang sama seperti dalam borang `/jabatan`?

---

## Lab 3.4 — Carian & pagination zon (S4)

### 🎯 Objektif
Membina `/zon` secara **berdikari** dengan corak Lab 3.3: model `ParkingZoneModel` dengan kaedah carian Query Builder (`like()` / `orLike()` dalam `groupStart()`), borang carian `GET ?q=`, dan pagination.

### Prasyarat
- [Lab 3.3](#lab-33--model--halaman-jabatan-s3) siap.

### Langkah
1. **Model** `app/Models/ParkingZoneModel.php` dengan kaedah `cari()`:

   Jana fail: `php spark make:model ParkingZoneModel`. Petunjuk: `$table = 'parking_zones'`, `$allowedFields = ['code', 'name', 'location']`, `$useTimestamps = true`; `trim((string) $q)`; `like('name', $q)`, `orLike('location', $q)`, `orLike('code', $q)`.

   ```php
   public function cari(?string $q): static
   {
       // TODO: jika $q tidak kosong: groupStart()->like()->orLike()->orLike()->groupEnd()
       // TODO: return $this->orderBy('code');
   }
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.4-1](../docs/kod-rujukan-hari-3.md#34-1--parkingzonemodel)
2. **Controller** `app/Controllers/Zon.php` — 2 zon setiap halaman supaya pagination kelihatan dengan 3 zon:

   Jana fail: `php spark make:controller Zon`. Petunjuk: `$model = model(ParkingZoneModel::class)`; hantar `'pager' => $model->pager` selepas `paginate()`.

   ```php
   public function index(): string
   {
       // TODO: $q dari getGet('q'); $zon = $model->cari($q)->paginate(2)
       // TODO: view('zon/index', [zon, pager, q, tajuk])
   }
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.4-2](../docs/kod-rujukan-hari-3.md#34-2--zon)
3. **Route:**
   ```php
   $routes->get('zon', 'Zon::index');
   ```
4. **View** `app/Views/zon/index.php`:

   Petunjuk: `<form method="get" action="<?= site_url('zon') ?>">`; `$zon === []` untuk tiada hasil (*Tiada zon sepadan dengan "…".*); `<?= $pager->links() ?>`.

   ```php
   <?= $this->extend('layout') ?>
   <?= $this->section('content') ?>
   <!-- TODO: borang GET zon dengan input q (value esc($q)) -->
   <!-- TODO: tiada hasil → mesej; ada → jadual + $pager->links() -->
   <?= $this->endSection() ?>
   ```

   Buntu lebih 10 minit? Kod rujukan penuh: [3.4-4](../docs/kod-rujukan-hari-3.md#34-4--zonindexphp)
5. **Uji dan catat** (soalan Kuiz hari):
   - <http://localhost:8080/zon> → halaman 1 (A, B) dan pautan ke halaman 2 (C).
   - <http://localhost:8080/zon?q=KLINIK> (huruf besar) — zon mana dipaparkan?
   - <http://localhost:8080/zon?q=aras> — pautan pagination masih membawa `q=aras`.
   - Taip `' OR 1=1 --` dalam kotak carian — apa yang dipaparkan?
6. Commit dan push:
   ```bash
   git add . && git commit -m "ZON: carian + pagination" && git push
   ```

### ✅ Checkpoint
- [ ] `/zon` memaparkan 2 zon setiap halaman dengan pautan pagination (Kuiz hari).
- [ ] Carian `?q=` menapis ikut nama, lokasi atau kod, dan input `' OR 1=1 --` tidak memecahkan query (Kuiz hari).
- [ ] GitLab menunjukkan commit `ZON: carian + pagination` (Kuiz hari).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| *Undefined variable $pager* | `pager` tidak dihantar ke view | `'pager' => $model->pager` selepas `paginate()` |
| Carian memaparkan semua zon | `cari()` dipanggil pada model lain daripada yang `paginate()` | Guna `$model` yang sama: `$model->cari($q)->paginate(2)` |
| Halaman 2 kehilangan carian | Borang `method="post"` | Carian guna `GET` supaya `?q=` kekal dalam URL |
| `orLike` memadankan rekod luar carian bila ada syarat lain | Tiada `groupStart()` / `groupEnd()` | Balut `like()`/`orLike()` dalam kumpulan |

### ⭐ Cabaran tambahan
Paparkan bilangan hasil: *"3 zon dijumpai"* menggunakan `$pager->getTotal()`. Kemudian buka tab *Database* dalam Debug Toolbar: lihat query `LIKE` sebenar yang CI jana untuk `?q=aras`.

---

## Semakan kendiri — akhir hari

```bash
cd ~/latihan/kelas-ci-<nama>
php spark migrate:status        # 2 migration App, Batch 1
php spark db:table --show       # departments, migrations, parking_zones
php spark routes                # jabatan (GET/POST), jabatan/baharu, zon
git log --oneline | head -4     # ZON, JABATAN, DB, CI-ASAS
```
