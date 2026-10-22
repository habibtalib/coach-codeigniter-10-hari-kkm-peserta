# Lab Hari 3 — Database, Migration, Model & Carian

[⬅️ README](./README.md) · [Jadual](../JADUAL.md) · [Kanun SPEC](../docs/spesifikasi-sistem.md) · [⚡ Arahan spark](../docs/arahan-spark.md)

| Lab | Sesi | Hasil |
|-----|------|-------|
| [Lab 3.1](#lab-31--database-mysql--env-s1) | S1 | Database `kkm_latihan` + `kkm_latihan_test`, pengguna `kkm_dev`, `.env` bersambung |
| [Lab 3.2](#lab-32--migration--seeder-pertama-s2) | S2 | Migration `departments` + `parking_zones`, seeder idempoten; commit di-push |
| [Lab 3.3](#lab-33--model--halaman-jabatan-s3) | S3 | `DepartmentModel` + `/jabatan` (senarai & borang baharu); commit di-push |
| [Lab 3.4](#lab-34--carian--pagination-zon-s4) | S4 | `/zon` dengan carian `?q=` & pagination; commit di-push |
| [Lab 3.1b](#lab-31b--database-ujian--envexample-s5) | S5 | Kumpulan `tests` → `kkm_latihan_test`; `.env.example` tanpa rahsia; commit di-push |
| [Lab 3.2b](#lab-32b--query-builder-dalam-konsol-s6) | S6 | `php spark shell` + query Query Builder dalam konsol; commit di-push |
| [Lab 3.3b](#lab-33b--edit-jabatan-s7) | S7 | `/jabatan/<id>/edit` dengan `update()` dan `is_unique` `{id}`; commit di-push |
| [Lab 3.4b](#lab-34b--butiran-zon--susunan-s8) | S8 | `/zon/<id>` (butiran + 404) dan susunan `?sort=`; commit di-push |

> ℹ️ Semua kerja dalam projek **individu** `~/latihan/kelas-ci-<nama>` (Hari 2). Jadual & medan ikut [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §3 dan [`erd-rujukan.md`](../docs/erd-rujukan.md) — anda tidak perlu melukis ERD sendiri. Bahan ERD/kamus data/wireframe yang asal kini bacaan pilihan dalam [`rujukan-keperluan.md`](../docs/rujukan-keperluan.md).

---

## Lab 3.1 — Database MySQL & `.env` (S1)

### 🎯 Objektif
Mencipta database pembangunan dan ujian dengan pengguna khusus `kkm_dev`, menyambung projek `kelas-ci-<nama>` melalui `.env`, dan mengesahkan connection dengan `php spark db:table --show`.

### Prasyarat
- [Lab 2.4](../hari-2/lab.md#lab-24--borang-validation--csrf-s4) siap: GitLab menunjukkan 4 commit.
- Laragon → **Start All** (MySQL hijau). Terminal Git Bash dalam VS Code.

Checkpoint setiap lab hari ini ditanda apabila anda lulus kuiz sesinya (Kuiz S1 untuk Lab 3.1, … Kuiz S4 untuk Lab 3.4, di halaman sesi), yang hanya boleh dijawab dengan menjalankan kod.

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
- [ ] `SHOW DATABASES LIKE 'kkm_latihan%'` sebagai `kkm_dev` menyenaraikan dua database (Kuiz S1).
- [ ] `php spark db:table --show` mencetak *Database has no tables!* tanpa ralat connection (Kuiz S1).

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

   `app/Database/Migrations/…_CreateDepartmentsTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreateDepartmentsTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'code'       => ['type' => 'VARCHAR', 'constraint' => 20],
               'name'       => ['type' => 'VARCHAR', 'constraint' => 150],
               'created_at' => ['type' => 'DATETIME', 'null' => true],
               'updated_at' => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addUniqueKey('code');
           $this->forge->createTable('departments', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('departments', true);
       }
   }
   ```
3. **`CreateParkingZonesTable`** — corak yang sama, medan ikut spesifikasi §3 (`code` VARCHAR(10) UNIQUE, `name` VARCHAR(100), `location` VARCHAR(150)):

   Petunjuk: sama seperti `CreateDepartmentsTable`, medan `code` VARCHAR 10 UNIQUE, `name` VARCHAR 100, `location` VARCHAR 150.

   `app/Database/Migrations/…_CreateParkingZonesTable.php`

   ```php
   <?php

   namespace App\Database\Migrations;

   use CodeIgniter\Database\Migration;

   class CreateParkingZonesTable extends Migration
   {
       public function up(): void
       {
           $this->forge->addField([
               'id'         => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
               'code'       => ['type' => 'VARCHAR', 'constraint' => 10],
               'name'       => ['type' => 'VARCHAR', 'constraint' => 100],
               'location'   => ['type' => 'VARCHAR', 'constraint' => 150],
               'created_at' => ['type' => 'DATETIME', 'null' => true],
               'updated_at' => ['type' => 'DATETIME', 'null' => true],
           ]);
           $this->forge->addPrimaryKey('id');
           $this->forge->addUniqueKey('code');
           $this->forge->createTable('parking_zones', false, ['ENGINE' => 'InnoDB']);
       }

       public function down(): void
       {
           $this->forge->dropTable('parking_zones', true);
       }
   }
   ```
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
   Catat **bilangan jadual** dalam `db:table --show` dan nilai lajur **Batch** selepas rollback + migrate — soalan Kuiz S2.
5. **Seeder.** Jana tiga fail:
   ```bash
   php spark make:seeder DepartmentSeeder
   php spark make:seeder ParkingSeeder
   php spark make:seeder DatabaseSeeder
   ```
   `DepartmentSeeder` — `ignore(true)` menjadikan `INSERT IGNORE`, jadi larian kedua tidak menambah baris berganda:

   Data (salin tepat — Kuiz S2 dan S3 bergantung padanya): `BTM` Bahagian Teknologi Maklumat (Latihan) · `BKW` Bahagian Kewangan (Latihan) · `BSM` Bahagian Sumber Manusia (Latihan) · `BPA` Bahagian Pengurusan Aset (Latihan). Isi `created_at` dan `updated_at` dengan `date('Y-m-d H:i:s')`.

   `app/Database/Seeds/DepartmentSeeder.php`

   ```php
   <?php

   namespace App\Database\Seeds;

   use CodeIgniter\Database\Seeder;

   class DepartmentSeeder extends Seeder
   {
       public function run(): void
       {
           $now  = date('Y-m-d H:i:s');
           $rows = [
               ['code' => 'BTM', 'name' => 'Bahagian Teknologi Maklumat (Latihan)'],
               ['code' => 'BKW', 'name' => 'Bahagian Kewangan (Latihan)'],
               ['code' => 'BSM', 'name' => 'Bahagian Sumber Manusia (Latihan)'],
               ['code' => 'BPA', 'name' => 'Bahagian Pengurusan Aset (Latihan)'],
           ];

           foreach ($rows as &$row) {
               $row['created_at'] = $row['updated_at'] = $now;
           }
           unset($row);

           $this->db->table('departments')->ignore(true)->insertBatch($rows);
       }
   }
   ```
   `ParkingSeeder` — tiga zon (Hari 4 menambah slot dalam fail yang sama):

   Data (salin tepat): `A` Blok Utama — *Aras G, pintu masuk utama* · `B` Blok Klinik — *Sebelah klinik pakar* · `C` Parkir Bertingkat — *Aras 1–3, bangunan parkir*.

   `app/Database/Seeds/ParkingSeeder.php`

   ```php
   <?php

   namespace App\Database\Seeds;

   use CodeIgniter\Database\Seeder;

   class ParkingSeeder extends Seeder
   {
       public function run(): void
       {
           $now   = date('Y-m-d H:i:s');
           $zones = [
               ['code' => 'A', 'name' => 'Blok Utama', 'location' => 'Aras G, pintu masuk utama'],
               ['code' => 'B', 'name' => 'Blok Klinik', 'location' => 'Sebelah klinik pakar'],
               ['code' => 'C', 'name' => 'Parkir Bertingkat', 'location' => 'Aras 1–3, bangunan parkir'],
           ];

           foreach ($zones as &$zone) {
               $zone['created_at'] = $zone['updated_at'] = $now;
           }
           unset($zone);

           $this->db->table('parking_zones')->ignore(true)->insertBatch($zones);
       }
   }
   ```
   `DatabaseSeeder` — memanggil seeder lain mengikut tertib:

   Petunjuk: `$this->call(DepartmentSeeder::class)` — induk dahulu.

   `app/Database/Seeds/DatabaseSeeder.php`

   ```php
   <?php

   namespace App\Database\Seeds;

   use CodeIgniter\Database\Seeder;

   class DatabaseSeeder extends Seeder
   {
       public function run(): void
       {
           $this->call(DepartmentSeeder::class);
           $this->call(ParkingSeeder::class);
       }
   }
   ```
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
- [ ] `php spark migrate:status` menunjukkan 2 migration `App` dengan tarikh *Migrated On* (Kuiz S2).
- [ ] Selepas `db:seed` dua kali, `departments` ada 4 baris dan `parking_zones` 3 baris (Kuiz S2).
- [ ] GitLab menunjukkan commit `DB: migration departments + parking_zones, seeder` (Kuiz S2).

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

   `app/Models/DepartmentModel.php`

   ```php
   <?php

   namespace App\Models;

   use CodeIgniter\Model;

   class DepartmentModel extends Model
   {
       protected $table         = 'departments';
       protected $returnType    = 'array';
       protected $allowedFields = ['code', 'name'];
       protected $useTimestamps = true;

       protected $validationRules = [
           'code' => [
               'label' => 'Kod',
               'rules' => 'required|alpha_numeric|max_length[20]|is_unique[departments.code,id,{id}]',
           ],
           'name' => [
               'label' => 'Nama',
               'rules' => 'required|min_length[3]|max_length[150]',
           ],
       ];
   }
   ```
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

   `app/Controllers/Jabatan.php`

   ```php
   <?php

   namespace App\Controllers;

   use App\Models\DepartmentModel;
   use CodeIgniter\HTTP\RedirectResponse;

   class Jabatan extends BaseController
   {
       protected $helpers = ['form'];

       public function index(): string
       {
           $jabatan = model(DepartmentModel::class)->orderBy('code')->findAll();

           return view('jabatan/index', ['jabatan' => $jabatan, 'tajuk' => 'Jabatan']);
       }

       public function baharu(): string
       {
           return view('jabatan/baharu', ['tajuk' => 'Jabatan baharu']);
       }

       public function simpan(): RedirectResponse
       {
           $model = model(DepartmentModel::class);
           $data  = $this->request->getPost(['code', 'name']);

           if ($model->insert($data) === false) {
               return redirect()->to('jabatan/baharu')->withInput()->with('errors', $model->errors());
           }

           return redirect()->to('jabatan')->with('berjaya', 'Jabatan ' . $data['code'] . ' disimpan.');
       }
   }
   ```
   Validation berlaku dalam **model**: `insert()` memulangkan `false` dan `$model->errors()` memberi mesej ikut medan.
4. **View senarai** `app/Views/jabatan/index.php`:

   Petunjuk: sama seperti `daftar.php` (Lab 2.4): `session()->getFlashdata('berjaya')`, `site_url('jabatan/baharu')`, setiap nilai melalui `esc()`.

   `app/Views/jabatan/index.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Jabatan</h1>

   <?php if (session()->getFlashdata('berjaya')): ?>
       <p class="berjaya"><?= esc(session()->getFlashdata('berjaya')) ?></p>
   <?php endif ?>

   <p><a href="<?= site_url('jabatan/baharu') ?>">+ Jabatan baharu</a></p>

   <table>
       <thead><tr><th>Kod</th><th>Nama</th><th>Dicipta</th></tr></thead>
       <tbody>
       <?php foreach ($jabatan as $j): ?>
           <tr>
               <td><?= esc($j['code']) ?></td>
               <td><?= esc($j['name']) ?></td>
               <td><?= esc($j['created_at']) ?></td>
           </tr>
       <?php endforeach ?>
       </tbody>
   </table>
   <?= $this->endSection() ?>
   ```
5. **View borang** `app/Views/jabatan/baharu.php`:

   Petunjuk: input `name="code"` dan `name="name"` dengan `esc(old('code'))`; ralat medan `$errors['code']` / `$errors['name']` dalam `<span class="ralat">`.

   `app/Views/jabatan/baharu.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Jabatan baharu</h1>

   <?php $errors = session()->getFlashdata('errors') ?? [] ?>

   <form method="post" action="<?= site_url('jabatan') ?>">
       <?= csrf_field() ?>

       <label for="code">Kod</label>
       <input id="code" name="code" maxlength="20" value="<?= esc(old('code')) ?>">
       <?php if (isset($errors['code'])): ?><span class="ralat"><?= esc($errors['code']) ?></span><?php endif ?>

       <label for="name">Nama</label>
       <input id="name" name="name" maxlength="150" value="<?= esc(old('name')) ?>">
       <?php if (isset($errors['name'])): ?><span class="ralat"><?= esc($errors['name']) ?></span><?php endif ?>

       <button type="submit">Simpan</button>
   </form>
   <?= $this->endSection() ?>
   ```
6. **Uji.** `php spark serve`, buka <http://localhost:8080/jabatan> (4 jabatan, susunan ikut kod). Klik **+ Jabatan baharu**:
   - Hantar kosong → ralat Kod dan Nama.
   - Hantar Kod `BTM` → catat mesej ralat **tepat** di bawah Kod (soalan Kuiz S3).
   - Hantar Kod `BPP`, Nama `Bahagian Perolehan (Latihan)` → kembali ke senarai dengan *"Jabatan BPP disimpan."* dan lajur **Dicipta** berisi tarikh masa.
7. Commit dan push:
   ```bash
   git add . && git commit -m "JABATAN: model, senarai & borang baharu" && git push
   ```

### ✅ Checkpoint
- [ ] `/jabatan` menyenaraikan jabatan daripada database melalui `DepartmentModel` (Kuiz S3).
- [ ] Kod berganda ditolak dengan mesej validation model; jabatan baharu disimpan dengan `created_at` automatik (Kuiz S3).
- [ ] GitLab menunjukkan commit `JABATAN: model, senarai & borang baharu` (Kuiz S3).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| *The Kod field is required.* walaupun Kod diisi | Atribut `name` dalam borang tidak sama dengan medan model | `name="code"` dan `name="name"` tepat, sama dengan `$allowedFields` |
| Kod berganda tidak ditolak | `is_unique` tertinggal atau salah nama jadual | `is_unique[departments.code,id,{id}]` |
| Ralat tidak dipaparkan | Lupa `->with('errors', $model->errors())` atau tiada `withInput()` | Ikut `simpan()` di atas |
| Lajur Dicipta kosong | `$useTimestamps` tertinggal | `protected $useTimestamps = true;` |
| *The action you requested is not allowed.* | Borang tanpa `csrf_field()` (CSRF global dari Lab 2.4) | Tambah `<?= csrf_field() ?>` |

### ⭐ Cabaran tambahan
Paparkan bilangan jabatan di bawah tajuk `/jabatan` (*5 jabatan*) menggunakan `count($jabatan)` dalam view.

⭐ **`maxlength` bukan validation:** dalam DevTools browser, buang atribut `maxlength` pada input Kod, kemudian hantar Kod 25 aksara. Mesej apa yang dipaparkan, dan kenapa rule model `max_length[20]` masih perlu walaupun borang ada `maxlength`?

---

## Lab 3.4 — Carian & pagination zon (S4)

### 🎯 Objektif
Membina `/zon` secara **berdikari** dengan corak Lab 3.3: model `ParkingZoneModel` dengan kaedah carian Query Builder (`like()` / `orLike()` dalam `groupStart()`), borang carian `GET ?q=`, dan pagination.

### Prasyarat
- [Lab 3.3](#lab-33--model--halaman-jabatan-s3) siap.

### Langkah
1. **Model** `app/Models/ParkingZoneModel.php` dengan kaedah `cari()`:

   Jana fail: `php spark make:model ParkingZoneModel`. Petunjuk: `$table = 'parking_zones'`, `$allowedFields = ['code', 'name', 'location']`, `$useTimestamps = true`; `trim((string) $q)`; `like('name', $q)`, `orLike('location', $q)`, `orLike('code', $q)`.

   `app/Models/ParkingZoneModel.php`

   ```php
   <?php

   namespace App\Models;

   use CodeIgniter\Model;

   class ParkingZoneModel extends Model
   {
       protected $table         = 'parking_zones';
       protected $returnType    = 'array';
       protected $allowedFields = ['code', 'name', 'location'];
       protected $useTimestamps = true;

       public function cari(?string $q): static
       {
           $q = trim((string) $q);

           if ($q !== '') {
               $this->groupStart()
                   ->like('name', $q)
                   ->orLike('location', $q)
                   ->orLike('code', $q)
                   ->groupEnd();
           }

           return $this->orderBy('code');
       }
   }
   ```
2. **Controller** `app/Controllers/Zon.php` — 2 zon setiap halaman supaya pagination kelihatan dengan 3 zon:

   Jana fail: `php spark make:controller Zon`. Petunjuk: `$model = model(ParkingZoneModel::class)`; hantar `'pager' => $model->pager` selepas `paginate()`.

   `app/Controllers/Zon.php`

   ```php
   <?php

   namespace App\Controllers;

   use App\Models\ParkingZoneModel;

   class Zon extends BaseController
   {
       public function index(): string
       {
           $q     = $this->request->getGet('q');
           $model = model(ParkingZoneModel::class);
           $zon   = $model->cari($q)->paginate(2);

           return view('zon/index', [
               'zon'   => $zon,
               'pager' => $model->pager,
               'q'     => $q,
               'tajuk' => 'Zon parkir',
           ]);
       }
   }
   ```
3. **Route:**
   ```php
   $routes->get('zon', 'Zon::index');
   ```
4. **View** `app/Views/zon/index.php`:

   Petunjuk: `<form method="get" action="<?= site_url('zon') ?>">`; `$zon === []` untuk tiada hasil (*Tiada zon sepadan dengan "…".*); `<?= $pager->links() ?>`.

   `app/Views/zon/index.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Zon parkir</h1>

   <form method="get" action="<?= site_url('zon') ?>">
       <input name="q" value="<?= esc($q ?? '') ?>" placeholder="Cari nama, lokasi atau kod">
       <button type="submit">Cari</button>
   </form>

   <?php if ($zon === []): ?>
       <p>Tiada zon sepadan dengan "<?= esc($q) ?>".</p>
   <?php else: ?>
       <table>
           <thead><tr><th>Kod</th><th>Nama</th><th>Lokasi</th></tr></thead>
           <tbody>
           <?php foreach ($zon as $z): ?>
               <tr>
                   <td><?= esc($z['code']) ?></td>
                   <td><?= esc($z['name']) ?></td>
                   <td><?= esc($z['location']) ?></td>
               </tr>
           <?php endforeach ?>
           </tbody>
       </table>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```
5. **Uji dan catat** (soalan Kuiz S4):
   - <http://localhost:8080/zon> → halaman 1 (A, B) dan pautan ke halaman 2 (C).
   - <http://localhost:8080/zon?q=KLINIK> (huruf besar) — zon mana dipaparkan?
   - <http://localhost:8080/zon?q=aras> — pautan pagination masih membawa `q=aras`.
   - Taip `' OR 1=1 --` dalam kotak carian — apa yang dipaparkan?
6. Commit dan push:
   ```bash
   git add . && git commit -m "ZON: carian + pagination" && git push
   ```

### ✅ Checkpoint
- [ ] `/zon` memaparkan 2 zon setiap halaman dengan pautan pagination (Kuiz S4).
- [ ] Carian `?q=` menapis ikut nama, lokasi atau kod, dan input `' OR 1=1 --` tidak memecahkan query (Kuiz S4).
- [ ] GitLab menunjukkan commit `ZON: carian + pagination` (Kuiz S4).

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

## Lab 3.1b — Database ujian & `.env.example` (S5)

### 🎯 Objektif
Menyambung kumpulan database `tests` ke `kkm_latihan_test` melalui `.env`, membuktikan connection dengan `--dbgroup tests`, dan meng-commit templat `.env.example` tanpa rahsia supaya sesiapa yang mengklon repo tahu kunci `.env` yang perlu diisi.

### Prasyarat
- [Lab 3.1](#lab-31--database-mysql--env-s1) siap: `php spark db:table --show` mencetak *Database has no tables!*.

### Langkah
1. **Lihat nilai lalai kumpulan `tests`:**
   ```bash
   php spark config:check Database
   ```
   Output memaparkan dua blok: `default` (dari `.env` anda) dan `tests`. Dalam blok `tests`, catat nilai `database`, `DBDriver` dan `DBPrefix` — soalan Kuiz S5. Output ini turut memaparkan kata laluan `default`: jangan kongsi tangkapan skrinnya.
2. **Tambah kumpulan `tests` dalam `.env`**, di bawah baris `database.default.DBCollat`:
   ```ini
   database.tests.hostname = localhost
   database.tests.database = kkm_latihan_test
   database.tests.username = kkm_dev
   database.tests.password = Latihan@2026
   database.tests.DBDriver = MySQLi
   database.tests.DBPrefix =
   database.tests.port = 3306
   database.tests.charset = utf8mb4
   database.tests.DBCollat = utf8mb4_unicode_ci
   ```
   `DBPrefix =` (kosong) penting: nilai lalai `tests` menambah awalan pada setiap nama jadual, jadi ujian Hari 6 akan mencari jadual yang tidak wujud.
3. **Uji connection kumpulan `tests`:**
   ```bash
   php spark db:table --show --dbgroup tests
   ```
   Jadual kecil di atas output menunjukkan `database` = `kkm_latihan_test`, `DBDriver` = `MySQLi` dan `DBPrefix` kosong, diikuti *Database has no tables!*. Jalankan `php spark config:check Database` sekali lagi: blok `tests` kini mengikut `.env`.

   Database ujian kosong buat masa ini; Lab 4.4 (klon repo) dan ujian PHPUnit Hari 6 (`DatabaseTestTrait`) akan mengisinya. **Jangan** jalankan `php spark migrate -g tests`: dalam CI 4.7 pilihan `-g` tidak menukar connection, jadi migration cuba mencipta jadual dalam `kkm_latihan`.
4. **Templat `.env.example`.** Cipta fail baharu `.env.example` di root projek (sebelah `.env`):

   `.env.example`

   ```ini
   # Templat .env — salin: cp .env.example .env, kemudian isi kata laluan sebenar.
   # Fail ini di-commit. JANGAN letak kata laluan sebenar di sini.
   CI_ENVIRONMENT = development

   app.baseURL = 'http://localhost:8080/'
   app.appTimezone = 'Asia/Kuala_Lumpur'

   database.default.hostname = localhost
   database.default.database = kkm_latihan
   database.default.username = kkm_dev
   database.default.password = ganti_kata_laluan
   database.default.DBDriver = MySQLi
   database.default.DBPrefix =
   database.default.port = 3306
   database.default.charset = utf8mb4
   database.default.DBCollat = utf8mb4_unicode_ci

   database.tests.hostname = localhost
   database.tests.database = kkm_latihan_test
   database.tests.username = kkm_dev
   database.tests.password = ganti_kata_laluan
   database.tests.DBDriver = MySQLi
   database.tests.DBPrefix =
   database.tests.port = 3306
   database.tests.charset = utf8mb4
   database.tests.DBCollat = utf8mb4_unicode_ci
   ```
5. **Semak Git dan rahsia:**
   ```bash
   git status --short
   git check-ignore -v .env.example
   grep -c "ganti_kata_laluan" .env.example
   grep -c "Latihan@2026" .env.example
   ```
   Catat output `git status --short` (soalan Kuiz S5). `git check-ignore` tiada output: `.env.example` tidak diabaikan, jadi ia boleh di-commit, manakala `.env` kekal diabaikan. `grep -c` mencetak `2` (dua tempat letak kata laluan) dan `0` (tiada kata laluan sebenar).
6. Commit dan push:
   ```bash
   git add .env.example && git commit -m "SETUP: .env.example tanpa rahsia" && git push
   ```

### ✅ Checkpoint
- [ ] `php spark db:table --show --dbgroup tests` menunjukkan `kkm_latihan_test` dan *Database has no tables!* (Kuiz S5).
- [ ] `git status --short` menyenaraikan `.env.example` tetapi tidak `.env` (Kuiz S5).
- [ ] GitLab menunjukkan commit `SETUP: .env.example tanpa rahsia` (Kuiz S5).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `--dbgroup tests` → *The required PHP extension "sqlite3" is not loaded* | Baris `database.tests.*` belum dibaca (salah eja `tests`, atau `#` masih ada) | Semak setiap baris bermula `database.tests.`; jalankan `php spark config:check Database` |
| `Access denied for user 'kkm_dev'@'localhost' to database 'kkm_latihan_test'` | `GRANT` untuk database ujian tertinggal | Sebagai `root`: `GRANT ALL PRIVILEGES ON kkm_latihan_test.* TO 'kkm_dev'@'localhost';` |
| `.env.example` tiada dalam `git status` | Windows menyimpannya sebagai `.env.example.txt` | `ls -a` untuk semak; namakan semula: `mv .env.example.txt .env.example` |
| `migrate -g tests` → *Table 'departments' already exists* | `-g` tidak menukar connection; migration berjalan pada `kkm_latihan` | Jangan guna `-g tests`; jadual ujian dibina oleh ujian Hari 6 |

### ⭐ Cabaran tambahan
Minta rakan sebelah klon repo anda ke folder lain, jalankan `cp .env.example .env` dan isi kata laluan. Berapa baris yang perlu mereka ubah sebelum `php spark db:table --show` berjaya?

---

## Lab 3.2b — Query Builder dalam konsol (S6)

### 🎯 Objektif
Membina `php spark shell` (PsySH), menjalankan query Query Builder (`where()`, `like()`, `orderBy()`, `countAllResults()`) terus pada `departments` dan `parking_zones`, membaca SQL sebenar dengan `getLastQuery()`, dan membuktikan `INSERT IGNORE` seeder dengan `affectedRows()`.

### Prasyarat
- [Lab 3.2](#lab-32--migration--seeder-pertama-s2) siap: `departments` ada 4 baris, `parking_zones` 3 baris.

### Langkah
1. **Pasang PsySH** sebagai pakej **dev** sahaja (tidak dipasang di server):
   ```bash
   composer require --dev psy/psysh
   ```
2. **Command `shell`.** Jana fail:
   ```bash
   php spark make:command Shell --command shell --group App
   ```
   Gantikan seluruh isi fail yang dijana:

   `app/Commands/Shell.php`

   ```php
   <?php

   namespace App\Commands;

   use CodeIgniter\CLI\BaseCommand;
   use CodeIgniter\CLI\CLI;
   use Psy\Configuration;
   use Psy\Shell as PsyShell;

   class Shell extends BaseCommand
   {
       protected $group       = 'App';
       protected $name        = 'shell';
       protected $description = 'Konsol PHP interaktif (PsySH) dengan aplikasi CI4 dimuatkan.';

       public function run(array $params)
       {
           if (ENVIRONMENT === 'production' || ! class_exists(PsyShell::class)) {
               CLI::error('shell: development sahaja (composer require --dev psy/psysh).');

               return EXIT_ERROR;
           }

           $shell = new PsyShell(new Configuration(['updateCheck' => 'never']));
           $shell->setScopeVariables(['db' => db_connect()]);
           $shell->run();
       }
   }
   ```
   `$db` ialah connection `default` (`kkm_latihan`) — data yang anda ubah dalam konsol **benar-benar berubah**.
3. **Buka konsol:**
   ```bash
   php spark shell
   ```
   Prompt `>` muncul. Prompt tergantung dalam tetingkap Git Bash berasingan? Guna terminal VS Code atau `winpty php spark shell`.
4. **Query baca.** Taip satu baris, tekan Enter, baca hasilnya, kemudian baris seterusnya:
   ```text
   $db->table('departments')->orderBy('code')->get()->getResultArray()
   $db->table('departments')->where('code', 'BSM')->get()->getRow()->name
   $db->getLastQuery()->getQuery()
   $db->table('parking_zones')->like('location', 'aras')->countAllResults()
   $db->getLastQuery()->getQuery()
   $db->table('parking_zones')->select('code, name')->orderBy('name', 'DESC')->get()->getResultArray()
   ```
   Catat nombor yang dipulangkan `countAllResults()` (soalan Kuiz S6). `getLastQuery()` menunjukkan SQL yang CI jana: nama lajur dalam backtick, nilai dalam petikan, dan `LIKE '%aras%' ESCAPE '!'`.
5. **Kenapa seeder perlu `ignore(true)`.** Dalam konsol yang sama:
   ```text
   $db->table('departments')->insert(['code' => 'BTM', 'name' => 'Pendua'])
   $db->table('departments')->ignore(true)->insert(['code' => 'BTM', 'name' => 'Pendua'])
   $db->affectedRows()
   $db->table('departments')->countAll()
   exit
   ```
   Baris pertama membaling ralat *Duplicate entry 'BTM'* (sama seperti seeder tanpa `ignore(true)`). Baris kedua memulangkan `true` tanpa ralat. Catat nilai `affectedRows()` (soalan Kuiz S6); `countAll()` kekal `4`.
6. Commit dan push (`composer.json`, `composer.lock` dan `app/Commands/Shell.php`):
   ```bash
   git add . && git commit -m "SETUP: php spark shell (PsySH)" && git push
   ```

### ✅ Checkpoint
- [ ] `php spark shell` membuka prompt PsySH dengan `$db` tersedia (Kuiz S6).
- [ ] `countAllResults()`, `getLastQuery()` dan `affectedRows()` memaparkan bilangan dan SQL sebenar dalam konsol (Kuiz S6).
- [ ] GitLab menunjukkan commit `SETUP: php spark shell (PsySH)` (Kuiz S6).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Command "shell" not found` | Fail tidak disimpan, atau namespace bukan `App\Commands` | Simpan `app/Commands/Shell.php`; semak `php spark list` (kumpulan `App`) |
| *shell: development sahaja (composer require --dev psy/psysh).* | PsySH belum dipasang, atau `CI_ENVIRONMENT` bukan `development` | Ulang langkah 1; semak `CI_ENVIRONMENT = development` dalam `.env` |
| `Undefined variable $db` | Baris `setScopeVariables` tertinggal | Salin semula `Shell.php` di atas |
| Prompt tidak muncul / anak panah tidak berfungsi | Tetingkap Git Bash berasingan (mintty) | Terminal VS Code, atau `winpty php spark shell` |
| `PARSE ERROR` | Baris ditaip separuh, atau `;` di tengah | Taip semula satu baris penuh; `;` di hujung tidak wajib |

### ⭐ Cabaran tambahan
Taip `$db->table('parking_zones')->like('name', 'blok')->orLike('code', 'C')->getCompiledSelect()` — SQL dicetak tanpa dijalankan. Di mana `OR` diletak, dan kenapa `cari()` dalam Lab 3.4 membalutnya dengan `groupStart()`?

---

## Lab 3.3b — Edit jabatan (S7)

### 🎯 Objektif
Menambah `/jabatan/(:num)/edit` (borang terisi) dan POST `/jabatan/(:num)` yang memanggil `$model->update($id, $data)`, membuktikan `is_unique[departments.code,id,{id}]` membenarkan kod sendiri tetapi menolak kod jabatan lain, dan memulangkan 404 bagi id yang tiada.

### Prasyarat
- [Lab 3.3](#lab-33--model--halaman-jabatan-s3) siap: `/jabatan` menyenaraikan 5 jabatan termasuk `BPP`.

> ⚠️ **Amaran:** Uji edit pada `BPP` sahaja. **Jangan** tukar kod empat jabatan asal (`BTM`, `BKW`, `BSM`, `BPA`): `UserSeeder` Hari 4 mencari jabatan ikut kod. Lab ini tidak membina **padam** jabatan: mulai Hari 4 `users.department_id` merujuk `departments`, jadi memadam jabatan akan mengosongkan jabatan pengguna.

### Langkah
1. **Route** — tambah di bawah tiga route `jabatan` dalam `app/Config/Routes.php`:
   ```php
   $routes->get('jabatan/(:num)/edit', 'Jabatan::edit/$1');
   $routes->post('jabatan/(:num)', 'Jabatan::kemaskini/$1');
   ```
   `(:num)` hanya menerima nombor, jadi `/jabatan/abc/edit` terus 404. Hari 4 memberi `Routes.php` penuh — pastikan dua baris ini kekal di situ.
2. **Model** — `{id}` dalam `is_unique` ialah *placeholder*: CI 4.7 hanya mengisinya jika medan `id` ada dalam data **dan** ada rule sendiri. Gantikan seluruh `app/Models/DepartmentModel.php` (hanya rule `id` baharu):

   `app/Models/DepartmentModel.php`

   ```php
   <?php

   namespace App\Models;

   use CodeIgniter\Model;

   class DepartmentModel extends Model
   {
       protected $table         = 'departments';
       protected $returnType    = 'array';
       protected $allowedFields = ['code', 'name'];
       protected $useTimestamps = true;

       protected $validationRules = [
           'id' => [
               'label' => 'ID',
               'rules' => 'permit_empty|is_natural_no_zero',
           ],
           'code' => [
               'label' => 'Kod',
               'rules' => 'required|alpha_numeric|max_length[20]|is_unique[departments.code,id,{id}]',
           ],
           'name' => [
               'label' => 'Nama',
               'rules' => 'required|min_length[3]|max_length[150]',
           ],
       ];
   }
   ```
   `permit_empty` membolehkan `insert()` (tiada `id`) berjalan seperti dalam Lab 3.3.
3. **Controller** — gantikan seluruh `app/Controllers/Jabatan.php` (`index()`, `baharu()` dan `simpan()` tidak berubah):

   `app/Controllers/Jabatan.php`

   ```php
   <?php

   namespace App\Controllers;

   use App\Models\DepartmentModel;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\RedirectResponse;

   class Jabatan extends BaseController
   {
       protected $helpers = ['form'];

       public function index(): string
       {
           $jabatan = model(DepartmentModel::class)->orderBy('code')->findAll();

           return view('jabatan/index', ['jabatan' => $jabatan, 'tajuk' => 'Jabatan']);
       }

       public function baharu(): string
       {
           return view('jabatan/baharu', ['tajuk' => 'Jabatan baharu']);
       }

       public function simpan(): RedirectResponse
       {
           $model = model(DepartmentModel::class);
           $data  = $this->request->getPost(['code', 'name']);

           if ($model->insert($data) === false) {
               return redirect()->to('jabatan/baharu')->withInput()->with('errors', $model->errors());
           }

           return redirect()->to('jabatan')->with('berjaya', 'Jabatan ' . $data['code'] . ' disimpan.');
       }

       public function edit(int $id): string
       {
           $jabatan = model(DepartmentModel::class)->find($id);

           if ($jabatan === null) {
               throw PageNotFoundException::forPageNotFound('Jabatan tidak dijumpai.');
           }

           return view('jabatan/edit', ['jabatan' => $jabatan, 'tajuk' => 'Edit jabatan']);
       }

       public function kemaskini(int $id): RedirectResponse
       {
           $model = model(DepartmentModel::class);

           if ($model->find($id) === null) {
               throw PageNotFoundException::forPageNotFound('Jabatan tidak dijumpai.');
           }

           $data       = $this->request->getPost(['code', 'name']);
           $data['id'] = $id; // untuk {id} dalam is_unique; id bukan $allowedFields, jadi tidak ditulis

           if ($model->update($id, $data) === false) {
               return redirect()->to('jabatan/' . $id . '/edit')->withInput()->with('errors', $model->errors());
           }

           return redirect()->to('jabatan')->with('berjaya', 'Jabatan ' . $data['code'] . ' dikemas kini.');
       }
   }
   ```
   `update($id, $data)` menjalankan `$validationRules` yang sama seperti `insert()`, **sebelum** `$allowedFields` membuang medan lain. Placeholder `{id}` dalam `is_unique` diisi daripada `$data['id']` — bukan daripada argumen pertama `update()` — jadi baris `$data['id'] = $id;` wajib. Hasilnya, untuk rekod id 5, `is_unique[departments.code,id,5]`: kod sendiri tidak dikira berganda. `id` tidak ditulis ke jadual kerana ia tiada dalam `$allowedFields`.
4. **View borang edit** `app/Views/jabatan/edit.php` — corak `baharu.php`, tetapi nilai awal daripada rekod:

   `app/Views/jabatan/edit.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Edit jabatan <?= esc($jabatan['code']) ?></h1>

   <?php $errors = session()->getFlashdata('errors') ?? [] ?>

   <form method="post" action="<?= site_url('jabatan/' . $jabatan['id']) ?>">
       <?= csrf_field() ?>

       <label for="code">Kod</label>
       <input id="code" name="code" maxlength="20" value="<?= esc(old('code', $jabatan['code'])) ?>">
       <?php if (isset($errors['code'])): ?><span class="ralat"><?= esc($errors['code']) ?></span><?php endif ?>

       <label for="name">Nama</label>
       <input id="name" name="name" maxlength="150" value="<?= esc(old('name', $jabatan['name'])) ?>">
       <?php if (isset($errors['name'])): ?><span class="ralat"><?= esc($errors['name']) ?></span><?php endif ?>

       <button type="submit">Kemas kini</button>
       <a href="<?= site_url('jabatan') ?>">Batal</a>
   </form>
   <?= $this->endSection() ?>
   ```
5. **View senarai** — gantikan seluruh `app/Views/jabatan/index.php` (lajur **Tindakan** baharu):

   `app/Views/jabatan/index.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Jabatan</h1>

   <?php if (session()->getFlashdata('berjaya')): ?>
       <p class="berjaya"><?= esc(session()->getFlashdata('berjaya')) ?></p>
   <?php endif ?>

   <p><a href="<?= site_url('jabatan/baharu') ?>">+ Jabatan baharu</a></p>

   <table>
       <thead><tr><th>Kod</th><th>Nama</th><th>Dicipta</th><th>Tindakan</th></tr></thead>
       <tbody>
       <?php foreach ($jabatan as $j): ?>
           <tr>
               <td><?= esc($j['code']) ?></td>
               <td><?= esc($j['name']) ?></td>
               <td><?= esc($j['created_at']) ?></td>
               <td><a href="<?= site_url('jabatan/' . $j['id'] . '/edit') ?>">Edit</a></td>
           </tr>
       <?php endforeach ?>
       </tbody>
   </table>
   <?= $this->endSection() ?>
   ```
6. **Uji dan catat** (soalan Kuiz S7). `php spark serve`, buka <http://localhost:8080/jabatan>, klik **Edit** pada `BPP`:
   - Kekalkan Kod `BPP`, tukar Nama kepada `Bahagian Perolehan dan Kontrak (Latihan)`, klik **Kemas kini** — apa yang dipaparkan?
   - Edit `BPP` sekali lagi, tukar Kod kepada `BKW` → mesej ralat di bawah Kod; borang masih menunjukkan `BKW` (`old()`).
   - Buka <http://localhost:8080/jabatan/999/edit> → halaman 404 *Jabatan tidak dijumpai.*
   - Hentikan server (`Ctrl+C`) dan jalankan `php spark db:table departments --limit-field-value 40` (tanpa pilihan ini nilai panjang dipotong `...`). Bandingkan lajur `created_at` dan `updated_at` baris `BPP`.
7. Commit dan push:
   ```bash
   git add . && git commit -m "JABATAN: edit & kemas kini" && git push
   ```

### ✅ Checkpoint
- [ ] `/jabatan/<id>/edit` memaparkan borang terisi dan menyimpan perubahan dengan `update()` (Kuiz S7).
- [ ] Kod sendiri diterima, kod jabatan lain ditolak oleh `is_unique[departments.code,id,{id}]`, dan `updated_at` dikemas kini (Kuiz S7).
- [ ] GitLab menunjukkan commit `JABATAN: edit & kemas kini` (Kuiz S7).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Kod sendiri ditolak: *The Kod field must contain a unique value.* | `$data['id'] = $id;` tertinggal — `{id}` tidak diisi, jadi rekod sendiri dikira berganda | Tambah `$data['id'] = $id;` sebelum `update()` |
| *No validation rules for the placeholder: "id"* | Rule `id` belum ditambah dalam `DepartmentModel` | Langkah 2: tambah rule `id` dalam `$validationRules` |
| Simpan mencipta baris baharu | Borang edit menghantar ke `site_url('jabatan')` (route `simpan`) | `action="<?= site_url('jabatan/' . $jabatan['id']) ?>"` |
| `404 - Can't find a route for 'GET: jabatan/5/edit'` | Route belum ditambah atau tersalah tertib segmen | `$routes->get('jabatan/(:num)/edit', 'Jabatan::edit/$1');` |
| `Too few arguments to function … edit()` | `/$1` tertinggal dalam route | `'Jabatan::edit/$1'` dan `'Jabatan::kemaskini/$1'` |
| Borang kosong selepas ralat | `old('code')` tanpa nilai lalai | `old('code', $jabatan['code'])` |

### ⭐ Cabaran tambahan
Hantar borang edit `BPP` tanpa sebarang perubahan, kemudian semak `updated_at` dengan `php spark db:table departments --limit-field-value 40`. Ubah `kemaskini()` supaya ia memaparkan *Tiada perubahan.* dan tidak memanggil `update()` jika `code` dan `name` sama dengan rekod daripada `find($id)`.

---

## Lab 3.4b — Butiran zon & susunan (S8)

### 🎯 Objektif
Membina halaman butiran `/zon/(:num)` yang memulangkan 404 (`PageNotFoundException`) bagi id yang tiada, dan pilihan susunan `?sort=code|name` pada `/zon` dengan whitelist yang mengekalkan carian `q` dan pagination.

### Prasyarat
- [Lab 3.4](#lab-34--carian--pagination-zon-s4) siap: `/zon` dengan carian dan pagination.

Lab ini **tidak** membina tambah/edit zon (CRUD pentadbir datang kemudian) dan tidak mengubah `ParkingZoneModel` (Hari 5 menggantikannya); semua logik baharu dalam controller dan view.

### Langkah
1. **Route** — tambah di bawah route `zon` dalam `app/Config/Routes.php`:
   ```php
   $routes->get('zon/(:num)', 'Zon::butiran/$1');
   ```
   Hari 4 memberi `Routes.php` penuh — pastikan baris ini kekal di situ.
2. **Controller** — gantikan seluruh `app/Controllers/Zon.php`:

   `app/Controllers/Zon.php`

   ```php
   <?php

   namespace App\Controllers;

   use App\Models\ParkingZoneModel;
   use CodeIgniter\Exceptions\PageNotFoundException;

   class Zon extends BaseController
   {
       private const SUSUNAN = ['code', 'name'];

       public function index(): string
       {
           $q     = $this->request->getGet('q');
           $sort  = $this->request->getGet('sort');
           $sort  = in_array($sort, self::SUSUNAN, true) ? $sort : 'code';
           $model = model(ParkingZoneModel::class);

           if ($sort === 'name') {
               // Sebelum cari(): ORDER BY name dahulu, kemudian code dari cari().
               $model->orderBy('name');
           }

           $zon = $model->cari($q)->paginate(2);

           return view('zon/index', [
               'zon'   => $zon,
               'pager' => $model->pager,
               'q'     => $q,
               'sort'  => $sort,
               'tajuk' => 'Zon parkir',
           ]);
       }

       public function butiran(int $id): string
       {
           $zon = model(ParkingZoneModel::class)->find($id);

           if ($zon === null) {
               throw PageNotFoundException::forPageNotFound('Zon tidak dijumpai.');
           }

           return view('zon/butiran', ['zon' => $zon, 'tajuk' => 'Zon ' . $zon['code']]);
       }
   }
   ```
   - **Whitelist:** hanya `code` atau `name` sampai ke `orderBy()`. Nilai lain (`location`, `id DESC`, teks pelik) jatuh kepada `code`.
   - `cari()` sentiasa menambah `orderBy('code')`; memanggil `orderBy('name')` **sebelum** `cari()` menjadikan `name` susunan utama.
3. **View senarai** — gantikan seluruh `app/Views/zon/index.php` (pilihan susunan + pautan butiran pada kod):

   `app/Views/zon/index.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Zon parkir</h1>

   <form method="get" action="<?= site_url('zon') ?>">
       <input name="q" value="<?= esc($q ?? '') ?>" placeholder="Cari nama, lokasi atau kod">
       <select name="sort">
           <option value="code" <?= $sort === 'code' ? 'selected' : '' ?>>Susun ikut kod</option>
           <option value="name" <?= $sort === 'name' ? 'selected' : '' ?>>Susun ikut nama</option>
       </select>
       <button type="submit">Cari</button>
   </form>

   <?php if ($zon === []): ?>
       <p>Tiada zon sepadan dengan "<?= esc($q) ?>".</p>
   <?php else: ?>
       <table>
           <thead><tr><th>Kod</th><th>Nama</th><th>Lokasi</th></tr></thead>
           <tbody>
           <?php foreach ($zon as $z): ?>
               <tr>
                   <td><a href="<?= site_url('zon/' . $z['id']) ?>"><?= esc($z['code']) ?></a></td>
                   <td><?= esc($z['name']) ?></td>
                   <td><?= esc($z['location']) ?></td>
               </tr>
           <?php endforeach ?>
           </tbody>
       </table>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```
4. **View butiran** `app/Views/zon/butiran.php`:

   `app/Views/zon/butiran.php`

   ```php
   <?= $this->extend('layout') ?>

   <?= $this->section('content') ?>
   <h1>Zon <?= esc($zon['code']) ?> — <?= esc($zon['name']) ?></h1>

   <table>
       <tr><th>Kod</th><td><?= esc($zon['code']) ?></td></tr>
       <tr><th>Nama</th><td><?= esc($zon['name']) ?></td></tr>
       <tr><th>Lokasi</th><td><?= esc($zon['location']) ?></td></tr>
       <tr><th>Dicipta</th><td><?= esc($zon['created_at']) ?></td></tr>
   </table>

   <p><a href="<?= site_url('zon') ?>">← Semua zon</a></p>
   <?= $this->endSection() ?>
   ```
5. **Uji dan catat** (soalan Kuiz S8):
   - <http://localhost:8080/zon?sort=name> — zon mana di baris pertama halaman 1? Klik pautan halaman 2: URL masih membawa `sort=name`.
   - Pilih **Susun ikut nama**, taip `blok`, klik **Cari** → dua zon `Blok …`, URL `?q=blok&sort=name`.
   - Klik kod `A` → `/zon/<id>` memaparkan butiran *Zon A — Blok Utama*. Buka <http://localhost:8080/zon/99> → 404 *Zon tidak dijumpai.*
   - <http://localhost:8080/zon?sort=location> — `location` tiada dalam whitelist. Zon mana di baris pertama?
6. Commit dan push:
   ```bash
   git add . && git commit -m "ZON: butiran + susunan" && git push
   ```

### ✅ Checkpoint
- [ ] `/zon/<id>` memaparkan butiran zon, dan id yang tiada memulangkan 404 (Kuiz S8).
- [ ] `?sort=name` menyusun ikut nama, nilai luar whitelist kembali kepada kod, dan pagination mengekalkan `q` serta `sort` (Kuiz S8).
- [ ] GitLab menunjukkan commit `ZON: butiran + susunan` (Kuiz S8).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `?sort=name` tidak mengubah susunan | `orderBy('name')` dipanggil **selepas** `cari()` (`ORDER BY code, name`) | Panggil `$model->orderBy('name')` sebelum `$model->cari($q)` |
| *Undefined variable $sort* | `'sort' => $sort` tidak dihantar ke view | Ikut `index()` di atas |
| `/zon/99` → ralat *Trying to access array offset on value of type null* | `find()` memulangkan `null`, tiada semakan | `if ($zon === null) { throw PageNotFoundException::forPageNotFound(…); }` |
| `/zon/1` → `404 - Can't find a route` | Route `zon/(:num)` belum ditambah | `$routes->get('zon/(:num)', 'Zon::butiran/$1');` |
| Halaman 2 kembali ke susunan kod | `sort` tidak dihantar oleh borang | `<select name="sort">` dalam borang `GET` yang sama |

### ⭐ Cabaran tambahan
Tambah pautan **Sebelum / Seterusnya** pada `butiran.php` menggunakan `where('code >', $zon['code'])->orderBy('code')->first()` dalam controller. Apa yang perlu dipaparkan pada zon terakhir?

---

## Semakan kendiri — akhir hari

```bash
cd ~/latihan/kelas-ci-<nama>
php spark migrate:status        # 2 migration App, Batch 1
php spark db:table --show       # departments, migrations, parking_zones
php spark db:table --show --dbgroup tests   # kkm_latihan_test: Database has no tables!
php spark routes                # jabatan, jabatan/baharu, jabatan/([0-9]+)/edit, jabatan/([0-9]+), zon, zon/([0-9]+)
git log --oneline | head -8     # ZON x2, JABATAN x2, SETUP x2, DB, CI-ASAS
```
