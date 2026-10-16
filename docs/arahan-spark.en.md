# `php spark` commands — quick reference

[📖 Docs index](./README.en.md) · [📘 Specification](./spesifikasi-sistem.md) · [Reference ERD](./erd-rujukan.md)

> CodeIgniter 4.7 CLI commands that generate controllers, models, migrations, seeders, filters, entities, tests and commands — plus the database and inspection commands. Every example below was run on CI 4.7.5 + Shield. Run them from the project folder (`~/latihan/kelas-ci-<nama>`, the folder that contains the `spark` file), in the VS Code terminal or Git Bash.

## Basics

```bash
php spark list
php spark help make:model
php spark make:model --help
```

| Command | What it does |
|--------|--------|
| `php spark list` | Lists every command, by group (`Database`, `Generators`, `Shield`, …) |
| `php spark help <command>` | Arguments and options (`--table`, `--force`, …) for one command |

- **Generators only create a skeleton.** The new file holds an empty class with `// TODO` or `//` — you still write the body yourself.
- **Existing files are not overwritten.** The command prints `File exists` and stops. `--force` overwrites — never use it on a file you have already changed.
- **Full names, no `--suffix`.** This course writes full class names: `DepartmentModel`, `DepartmentSeeder`, `RoleFilter`. The `--suffix` option appends `Model`/`Seeder`/`Controller` automatically, but for controllers that gives `JabatanController`, not `Jabatan` as in the labs.

## Generating files (`make:*`)

| Command (course example) | File created | Note |
|------------------------|-------------------|------|
| `php spark make:controller Jabatan` | `app/Controllers/Jabatan.php` | Extends `BaseController` |
| `php spark make:controller Admin/Laporan` | `app/Controllers/Admin/Laporan.php` | Namespace `App\Controllers\Admin`; route `'Admin\Laporan::index'` |
| `php spark make:controller Api/Zon --restful` | `app/Controllers/Api/Zon.php` | `ResourceController` with 7 methods (`index`, `show`, `new`, `create`, `edit`, `update`, `delete`) |
| `php spark make:model DepartmentModel` | `app/Models/DepartmentModel.php` | Check `$table` (see ⚠ below) and fill in `$allowedFields` |
| `php spark make:model PassApplicationModel --table pass_applications` | `app/Models/PassApplicationModel.php` | `$table` correct straight away |
| `php spark make:model SlotBookingModel --table slot_bookings --return entity` | `app/Models/SlotBookingModel.php` + `app/Entities/SlotBooking.php` | `$returnType` = the entity class |
| `php spark make:entity PassApplication` | `app/Entities/PassApplication.php` | Entity only |
| `php spark make:migration CreateVehiclesTable` | `app/Database/Migrations/<timestamp>_CreateVehiclesTable.php` | Empty `up()` and `down()` |
| `php spark make:seeder VehicleSeeder` | `app/Database/Seeds/VehicleSeeder.php` | Empty `run()` |
| `php spark make:filter RoleFilter` | `app/Filters/RoleFilter.php` | Register an alias in `app/Config/Filters.php` |
| `php spark make:test Services/BookingServiceTest` | `tests/Services/BookingServiceTest.php` | Namespace `Tests\Services` |
| `php spark make:command ExpirePassesCommand --command pas:luput --group TLK` | `app/Commands/ExpirePassesCommand.php` | Shows up in `php spark list` under the `TLK` group |
| `php spark make:validation PermohonanRules` | `app/Validation/PermohonanRules.php` | For custom validation rules |

⚠ **The default `$table` = the class name without `Model`, lowercased, plus `s`, with no underscores.** `VehicleModel` → `vehicles` (correct), but `PassApplicationModel` → `passapplications` and `ParkingSlotModel` → `parkingslots` (wrong). For two-word names, pass `--table table_name` or fix `$table` before testing.

⚠ **Avoid `make:scaffold`.** It creates a controller, model, migration and seeder at once, but the migration is named `KenderaanMigration` (not `CreateVehiclesTable`) and the model gets `$table = 'kenderaans'`. Run the commands one at a time.

**There is no generator for services or enums.** Create them yourself: `app/Services/BookingService.php` (namespace `App\Services`) and `app/Enums/PassStatus.php` (namespace `App\Enums`).

## Shield

| Command | What it does |
|--------|--------|
| `php spark shield:setup` | Once only, after `composer require codeigniter4/shield`: copies config, adds routes & helpers, offers `migrate --all` |
| `php spark shield:model UserModel` | `app/Models/UserModel.php` extending the Shield model — to add fields such as `full_name` to `$allowedFields` |
| `php spark shield:user create -n pemohon3 -e pemohon3@latihan.test -g applicant` | Creates a user in the `applicant` group; asks for the password |
| `php spark shield:user list` | Lists users |
| `php spark shield:user addgroup -n pemohon3 -g reviewer` | Adds a group |
| `php spark shield:user password -n pemohon3` | Changes the password |

🪟 If the password prompt does not appear in Git Bash (mintty), use the VS Code terminal, or `winpty php spark shield:user create …`.

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

| Command | What it does |
|--------|--------|
| `migrate` | Runs the `App` migrations not yet run (one new *batch*) |
| `migrate --all` | Includes package migrations (Shield, Settings) |
| `migrate:status` | Lists migrations: when each ran and in which batch |
| `migrate:rollback` | Rolls back the last batch (`down()`); `-b 1` = roll back to batch 1 |
| `migrate:refresh` | Rolls everything back and runs it again — **data is lost**; own laptop only, never on a server |
| `db:seed DatabaseSeeder` | Runs a seeder (which calls the other seeders) |
| `db:table --show` | Lists tables |
| `db:table <table>` | The first 10 rows; `--metadata` = type, length and keys of every field |
| `--dbgroup tests` / `-g tests` | Uses the `tests` connection (`kkm_latihan_test`) instead of `default` |

Rule: never change a migration that has been pushed — write a new migration (`php spark make:migration AddProfileFieldsToUsers`).

## Inspection & other

| Command | What it does |
|--------|--------|
| `php spark routes` | Every route: method, URI, handler, *before*/*after* filters |
| `php spark routes \| grep zon` | Filters the routes (PowerShell: `\| Select-String zon`) |
| `php spark filter:check GET zon` | The filters that actually run for one route |
| `php spark env` | The current environment (`development`/`production`) |
| `php spark serve --port 8081` | Development server on another port (if 8080 is taken) |
| `php spark cache:clear` | Clears the cache |
| `php spark key:generate` | Generates `encryption.key` in `.env` |
| `php spark phpini:check` | Checks the important `php.ini` settings (memory, upload) |

## The usual order for a new feature

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

After each step: open the generated file, write its body (the lab gives hints), run it, then commit.
