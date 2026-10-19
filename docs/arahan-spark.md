# Arahan `php spark` — rujukan pantas

[📖 Indeks docs](./README.md) · [📘 Spesifikasi](./spesifikasi-sistem.md) · [ERD rujukan](./erd-rujukan.md)

> Arahan CLI CodeIgniter 4.7 untuk menjana controller, model, migration, seeder, filter, entity, ujian dan command — serta arahan database dan semakan. Semua contoh di bawah telah dijalankan pada CI 4.7.5 + Shield. Jalankan dari folder projek (`~/latihan/kelas-ci-<nama>`, folder yang ada fail `spark`), dalam terminal VS Code atau Git Bash.

## Asas

```bash
php spark list
php spark help make:model
php spark make:model --help
```

| Arahan | Fungsi |
|--------|--------|
| `php spark list` | Senarai semua arahan, ikut kumpulan (`Database`, `Generators`, `Shield`, …) |
| `php spark help <arahan>` | Argumen dan pilihan (`--table`, `--force`, …) bagi satu arahan |

- **Penjana hanya mencipta rangka.** Fail baharu mengandungi kelas kosong dengan `// TODO` atau `//` — isinya disalin daripada lab.
- **Fail sedia ada tidak ditulis ganti.** Arahan memaparkan `File exists` dan berhenti. `--force` menulis ganti — jangan guna pada fail yang sudah anda ubah.
- **Nama penuh, tanpa `--suffix`.** Kursus ini menulis nama kelas penuh: `DepartmentModel`, `DepartmentSeeder`, `RoleFilter`. Pilihan `--suffix` menambah `Model`/`Seeder`/`Controller` secara automatik, tetapi untuk controller hasilnya `JabatanController`, bukan `Jabatan` seperti dalam lab.

## Menjana fail (`make:*`)

| Arahan (contoh kursus) | Fail yang dicipta | Nota |
|------------------------|-------------------|------|
| `php spark make:controller Jabatan` | `app/Controllers/Jabatan.php` | Extends `BaseController` |
| `php spark make:controller Admin/Laporan` | `app/Controllers/Admin/Laporan.php` | Namespace `App\Controllers\Admin`; route `'Admin\Laporan::index'` |
| `php spark make:controller Api/Zon --restful` | `app/Controllers/Api/Zon.php` | `ResourceController` dengan 7 method (`index`, `show`, `new`, `create`, `edit`, `update`, `delete`) |
| `php spark make:model DepartmentModel` | `app/Models/DepartmentModel.php` | Semak `$table` (lihat ⚠ di bawah) dan isi `$allowedFields` |
| `php spark make:model PassApplicationModel --table pass_applications` | `app/Models/PassApplicationModel.php` | `$table` betul terus |
| `php spark make:model SlotBookingModel --table slot_bookings --return entity` | `app/Models/SlotBookingModel.php` + `app/Entities/SlotBooking.php` | `$returnType` = kelas entity |
| `php spark make:entity PassApplication` | `app/Entities/PassApplication.php` | Entity sahaja |
| `php spark make:migration CreateVehiclesTable` | `app/Database/Migrations/<cap-masa>_CreateVehiclesTable.php` | `up()` dan `down()` kosong |
| `php spark make:seeder VehicleSeeder` | `app/Database/Seeds/VehicleSeeder.php` | `run()` kosong |
| `php spark make:filter RoleFilter` | `app/Filters/RoleFilter.php` | Daftarkan alias dalam `app/Config/Filters.php` |
| `php spark make:test Services/BookingServiceTest` | `tests/Services/BookingServiceTest.php` | Namespace `Tests\Services` |
| `php spark make:command ExpirePassesCommand --command pas:luput --group TLK` | `app/Commands/ExpirePassesCommand.php` | Muncul dalam `php spark list` bawah kumpulan `TLK` |
| `php spark make:validation PermohonanRules` | `app/Validation/PermohonanRules.php` | Untuk rule validation tersuai |

⚠ **`$table` lalai = nama kelas tanpa `Model`, huruf kecil, ditambah `s`, tanpa garis bawah.** `VehicleModel` → `vehicles` (betul), tetapi `PassApplicationModel` → `passapplications` dan `ParkingSlotModel` → `parkingslots` (salah). Untuk nama dua perkataan, beri `--table nama_jadual` atau betulkan `$table` sebelum menguji.

⚠ **Elakkan `make:scaffold`.** Ia mencipta controller, model, migration dan seeder serentak, tetapi migration dinamakan `KenderaanMigration` (bukan `CreateVehiclesTable`) dan model dengan `$table = 'kenderaans'`. Jalankan arahan satu demi satu.

**Tiada penjana untuk service dan enum.** Cipta sendiri: `app/Services/BookingService.php` (namespace `App\Services`) dan `app/Enums/PassStatus.php` (namespace `App\Enums`).

## Shield

| Arahan | Fungsi |
|--------|--------|
| `php spark shield:setup` | Sekali sahaja selepas `composer require codeigniter4/shield`: menyalin config, menambah route & helper, menawarkan `migrate --all` |
| `php spark shield:model UserModel` | `app/Models/UserModel.php` yang extends model Shield — untuk menambah medan seperti `full_name` ke `$allowedFields` |
| `php spark shield:user create -n pemohon3 -e pemohon3@latihan.test -g applicant` | Cipta pengguna dalam kumpulan `applicant`; kata laluan ditanya |
| `php spark shield:user list` | Senarai pengguna |
| `php spark shield:user addgroup -n pemohon3 -g reviewer` | Tambah kumpulan |
| `php spark shield:user password -n pemohon3` | Tukar kata laluan |

🪟 Jika prompt kata laluan tidak muncul dalam Git Bash (mintty), guna terminal VS Code, atau `winpty php spark shield:user create …`.

## Database

```bash
php spark migrate
php spark migrate --all
php spark migrate:status
php spark migrate:rollback
php spark migrate:rollback -b 1
php spark migrate:refresh
php spark db:seed DatabaseSeeder
php spark db:table --show
php spark db:table departments
php spark db:table departments --metadata
php spark db:table --show --dbgroup tests
php spark migrate:status -g tests
```

| Arahan | Fungsi |
|--------|--------|
| `migrate` | Jalankan migration `App` yang belum dijalankan (satu *batch* baharu) |
| `migrate --all` | Termasuk migration pakej (Shield, Settings) |
| `migrate:status` | Senarai migration: bila dijalankan dan dalam batch mana |
| `migrate:rollback` | Undur batch terakhir (`down()`); `-b 1` = undur hingga batch 1 |
| `migrate:refresh` | Undur semua dan jalankan semula — **data hilang**; laptop sendiri sahaja, jangan di server |
| `db:seed DatabaseSeeder` | Jalankan seeder (yang memanggil seeder lain) |
| `db:table --show` | Senarai jadual |
| `db:table <jadual>` | 10 baris pertama; `--metadata` = jenis, panjang dan kunci setiap medan |
| `--dbgroup tests` / `-g tests` | Guna sambungan `tests` (`kkm_latihan_test`) dan bukan `default` |

Peraturan: jangan ubah migration yang sudah di-push — tulis migration baharu (`php spark make:migration AddProfileFieldsToUsers`).

## Semakan & lain-lain

| Arahan | Fungsi |
|--------|--------|
| `php spark routes` | Semua route: method, URI, handler, filter *before*/*after* |
| `php spark routes \| grep zon` | Tapis route (PowerShell: `\| Select-String zon`) |
| `php spark filter:check GET zon` | Filter yang benar-benar berjalan untuk satu route |
| `php spark env` | Persekitaran semasa (`development`/`production`) |
| `php spark serve --port 8081` | Server pembangunan pada port lain (jika 8080 sudah digunakan) |
| `php spark cache:clear` | Kosongkan cache |
| `php spark key:generate` | Jana `encryption.key` dalam `.env` |
| `php spark phpini:check` | Semak tetapan `php.ini` penting (memory, upload) |

## `php spark shell`

Konsol interaktif seperti konsol JavaScript dalam browser: taip satu baris PHP, Enter, terus nampak hasilnya — dengan aplikasi CI4 sudah dimuatkan (model, `$db`, helper, service). CodeIgniter tidak menyediakannya; anda membinanya sekali dengan [PsySH](https://psysh.org) dan satu command.

1. Pasang PsySH sebagai pakej **dev** sahaja:

   ```bash
   composer require --dev psy/psysh
   ```

2. Jana `php spark make:command Shell --command shell --group App`, kemudian ganti isi `app/Commands/Shell.php`:

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

3. Cuba:

```text
php spark shell
> model(App\Models\DepartmentModel::class)->findAll()
> model(App\Models\ParkingZoneModel::class)->cari('klinik')->findAll()
> $db->table('parking_zones')->countAll()
> $db->getLastQuery()->getQuery()
> esc('<b>x</b>')
> exit
```

| Perlu | Guna |
|-------|------|
| Menguji model, query, validation, helper tanpa browser | `php spark shell` |
| PHP biasa tanpa CI (fungsi, `date()`, regex) | `php -a` |
| Seperti `console.log` dalam halaman | `d($pembolehubah)` (Kint, terlipat dalam browser); `dd(...)` = papar dan berhenti |
| Rekod nilai tanpa mengganggu halaman | `log_message('debug', json_encode($x))` → `writable/logs/` |
| Query SQL, masa, pembolehubah setiap request | Debug Toolbar (development) |

- Command menolak `ENVIRONMENT = production` dan berhenti jika PsySH tiada — `--dev` bermakna PsySH tidak dipasang di server.
- `$db` menggunakan connection `default` (`kkm_latihan`); data yang anda ubah di sini **benar-benar berubah**.
- 🪟 Belum diuji pada Laragon: jika prompt tergantung dalam Git Bash (mintty), guna terminal VS Code atau `winpty php spark shell`. Sejarah/anak panah mungkin tidak berfungsi pada Windows.

## Urutan biasa untuk satu ciri baharu

```bash
php spark make:migration CreateVehiclesTable
php spark migrate
php spark make:model VehicleModel
php spark make:seeder VehicleSeeder
php spark db:seed VehicleSeeder
php spark make:controller Kenderaan
php spark routes | grep kenderaan
php spark make:test Feature/KenderaanTest
composer test
```

Selepas setiap langkah: buka fail yang dijana, tulis isinya (lab memberi petunjuk), jalankan, kemudian commit.
