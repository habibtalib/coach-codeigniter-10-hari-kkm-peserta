# Kod rujukan — Hari 3

[← Lab Hari 3](../hari-3/lab.md) · [📘 Spesifikasi](./spesifikasi-sistem.md) · [ERD rujukan](./erd-rujukan.md)

> Kod penuh yang telah diuji (CodeIgniter 4.7) bagi setiap langkah Lab 3.2–3.4. **Cuba sendiri dahulu** dengan rangka & petunjuk dalam lab; buka bahagian di sini hanya selepas 10 minit buntu, dan pastikan anda boleh menerangkan setiap baris sebelum menyalin.


## 3.2-2 · `CreateDepartmentsTable`

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

## 3.2-3 · `CreateParkingZonesTable`

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

## 3.2-5a · `DepartmentSeeder`

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

## 3.2-5b · `ParkingSeeder`

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

## 3.2-5c · `DatabaseSeeder`

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

## 3.3-1 · `DepartmentModel`

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

## 3.3-3 · `Jabatan`

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

## 3.3-4 · `jabatan/index.php`

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

## 3.3-5 · `jabatan/baharu.php`

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

## 3.4-1 · `ParkingZoneModel`

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

## 3.4-2 · `Zon`

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

## 3.4-4 · `zon/index.php`

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
