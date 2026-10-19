# Lab Day 5 — TLK Module (Part 1)

[⬅️ README Day 5](./README.md) · [📘 SPEC](../docs/spesifikasi-sistem.md) · 🧩 Code templates (**Templat & Rujukan** module) · [⚡ spark commands](../docs/arahan-spark.md)

> **Lab rules:** individual work in `kelas-ci-<nama>`; show your output to the trainer or the person next to you before ticking it off. Every step gives **complete code to copy**. Read every line before you run it — you must be able to explain it (KOLABORASI §3). Stuck: read the full error message, ask the trainer or your neighbour, or use AI to *explain* the error. The Whoops page shows the file & line.

| Lab | Session | Branch | Result |
|-----|------|--------|-------|
| 5.1 | S1 09:00–10:30 | `feat/tlk-model` | Enums, Entity, 5 Models, unit tests |
| 5.2 | S2 10:45–12:30 | `feat/tlk-crud` | Admin slot CRUD + paginated booking list |
| 5.3 | S3 14:30–16:00 | `feat/tlk-borang-tempahan` | Form + validation + `TLK-2026-0001` |
| 5.4 | S4 16:00–17:00 | — | `docs/ujian-manual-tlk.md` |

---

## Lab 5.1 — Enum, Entity & Model (S1)

### 🎯 Objective
Write the `BookingStatus` & `SlotCategory` enums, the `SlotBooking` Entity and the TLK (Special Vehicle Parking — *Tempat Letak Kenderaan Khas*) Models with `$allowedFields` + `$validationRules`, proven by unit tests.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Day 4 finished: 10 migrations + seeders, login works
- `git switch main && git pull && git switch -c feat/tlk-model`

### Steps

1. Create the folders that do not exist yet in appstarter:

   ```bash
   mkdir -p app/Enums app/Entities app/Services app/Validation tests/tlk
   ```

2. **Enum `BookingStatus`** — README §1.1, complete with `allowedTransitions()`, `isFinal()` (returns `true` if `allowedTransitions()` is empty) and `options()`:

   `app/Enums/BookingStatus.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Enums;

   /**
    * Status tempahan slot TLK (slot_bookings.status).
    * SATU-SATUNYA sumber kebenaran untuk nilai, label BM, warna badge & peralihan.
    *
    *   pending ──► approved ──► cancelled
    *      │            └──────► expired
    *      └──────► rejected
    */
   enum BookingStatus: string
   {
       case Pending   = 'pending';
       case Approved  = 'approved';
       case Rejected  = 'rejected';
       case Cancelled = 'cancelled';
       case Expired   = 'expired';

       /** Label Bahasa Melayu untuk paparan UI. */
       public function label(): string
       {
           return match ($this) {
               self::Pending   => 'Menunggu',
               self::Approved  => 'Diluluskan',
               self::Rejected  => 'Ditolak',
               self::Cancelled => 'Dibatalkan',
               self::Expired   => 'Tamat Tempoh',
           };
       }

       /** Warna kontekstual Bootstrap 5.3 — guna sebagai `text-bg-{badge}`. */
       public function badge(): string
       {
           return match ($this) {
               self::Pending   => 'warning',
               self::Approved  => 'success',
               self::Rejected  => 'danger',
               self::Cancelled => 'secondary',
               self::Expired   => 'dark',
           };
       }

       /**
        * Status yang dibenarkan selepas status semasa.
        *
        * @return list<self>
        */
       public function allowedTransitions(): array
       {
           return match ($this) {
               self::Pending  => [self::Approved, self::Rejected],
               self::Approved => [self::Cancelled, self::Expired],
               // Status akhir (terminal) — tiada peralihan lagi
               self::Rejected, self::Cancelled, self::Expired => [],
           };
       }

       public function canTransitionTo(self $to): bool
       {
           return in_array($to, $this->allowedTransitions(), true);
       }

       public function isFinal(): bool
       {
           return $this->allowedTransitions() === [];
       }

       /**
        * Status yang dikira "aktif" untuk BR-TLK-01 (pertindihan) & BR-TLK-04 (had 1 aktif).
        *
        * @return list<string> ['pending', 'approved']
        */
       public static function active(): array
       {
           return [self::Pending->value, self::Approved->value];
       }

       /**
        * Untuk dropdown penapis: ['pending' => 'Menunggu', ...]
        *
        * @return array<string, string>
        */
       public static function options(): array
       {
           $options = [];

           foreach (self::cases() as $case) {
               $options[$case->value] = $case->label();
           }

           return $options;
       }
   }
   ```

3. **Enum `SlotCategory`** — the 5 SPEC cases with `label()`, `icon()` (Bootstrap Icons), `options()` for dropdowns and `inList()`, which returns `'in_list[oku,mengandung,pegawai_kanan,kenderaan_rasmi,pelawat_vip]'` for validation rules:

   `app/Enums/SlotCategory.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Enums;

   /**
    * Kategori slot letak kenderaan khas (parking_slots.category).
    */
   enum SlotCategory: string
   {
       case Oku            = 'oku';
       case Mengandung     = 'mengandung';
       case PegawaiKanan   = 'pegawai_kanan';
       case KenderaanRasmi = 'kenderaan_rasmi';
       case PelawatVip     = 'pelawat_vip';

       public function label(): string
       {
           return match ($this) {
               self::Oku            => 'OKU',
               self::Mengandung     => 'Ibu Mengandung',
               self::PegawaiKanan   => 'Pegawai Kanan',
               self::KenderaanRasmi => 'Kenderaan Rasmi',
               self::PelawatVip     => 'Pelawat VIP',
           };
       }

       /** Ikon Bootstrap Icons untuk paparan. */
       public function icon(): string
       {
           return match ($this) {
               self::Oku            => 'bi-person-wheelchair',
               self::Mengandung     => 'bi-heart-pulse',
               self::PegawaiKanan   => 'bi-person-badge',
               self::KenderaanRasmi => 'bi-car-front',
               self::PelawatVip     => 'bi-star',
           };
       }

       /** @return array<string, string> ['oku' => 'OKU', ...] */
       public static function options(): array
       {
           $options = [];

           foreach (self::cases() as $case) {
               $options[$case->value] = $case->label();
           }

           return $options;
       }

       /** Untuk peraturan validasi: 'in_list[oku,mengandung,...]' */
       public static function inList(): string
       {
           return 'in_list[' . implode(',', array_column(self::cases(), 'value')) . ']';
       }
   }
   ```

4. **Entity `SlotBooking`** — README §1.2, complete with `isActive()` (status is in `BookingStatus::active()`) and `durationDays()`:

   `app/Entities/SlotBooking.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Entities;

   use App\Enums\BookingStatus;
   use CodeIgniter\Entity\Entity;
   use DateTimeImmutable;

   /**
    * Satu baris slot_bookings.
    *
    * start_date/end_date dikekalkan sebagai string 'Y-m-d' (lajur DATE) —
    * mudah dibanding dan dihantar semula ke borang. decided_at/created_at/
    * updated_at ditukar kepada CodeIgniter\I18n\Time secara automatik.
    */
   class SlotBooking extends Entity
   {
       protected $dates = ['decided_at', 'created_at', 'updated_at'];

       protected $casts = [
           'id'         => 'integer',
           'user_id'    => 'integer',
           'vehicle_id' => 'integer',
           'slot_id'    => 'integer',
           'decided_by' => '?integer',
       ];

       public function statusEnum(): BookingStatus
       {
           return BookingStatus::from((string) $this->attributes['status']);
       }

       public function statusLabel(): string
       {
           return $this->statusEnum()->label();
       }

       public function statusBadge(): string
       {
           return $this->statusEnum()->badge();
       }

       public function isActive(): bool
       {
           return in_array($this->attributes['status'], BookingStatus::active(), true);
       }

       public function isOwnedBy(int $userId): bool
       {
           return (int) $this->attributes['user_id'] === $userId;
       }

       /**
        * Bilangan hari kalendar yang diliputi, termasuk hari pertama & terakhir
        * (1 Okt hingga 1 Okt = 1 hari) — untuk paparan. Peraturan 90 hari (BR-TLK-03)
        * pula mengira (end_date − start_date) tanpa +1 — jangan guna kaedah ini untuknya.
        */
       public function durationDays(): int
       {
           $start = new DateTimeImmutable((string) $this->attributes['start_date']);
           $end   = new DateTimeImmutable((string) $this->attributes['end_date']);

           return $start->diff($end)->days + 1;
       }
   }
   ```

   > ℹ️ `durationDays()` is the **display** duration (inclusive, +1): the maximum booking 2026-10-01 → 2026-12-30 shows *91 hari*. BR-TLK-03 instead checks `end_date − start_date ≤ 90` (date difference, no +1) — do not use `durationDays()` for that rule.

5. Unit tests **without a DB** — `tests/tlk/BookingStatusTest.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Tlk;

   use App\Entities\SlotBooking;
   use App\Enums\BookingStatus;
   use App\Enums\SlotCategory;
   use CodeIgniter\Test\CIUnitTestCase;

   /**
    * @internal
    */
   final class BookingStatusTest extends CIUnitTestCase
   {
       public function testLabelsAreMalay(): void
       {
           $this->assertSame('Menunggu', BookingStatus::Pending->label());
           $this->assertSame('Tamat Tempoh', BookingStatus::Expired->label());
           $this->assertSame('Ibu Mengandung', SlotCategory::Mengandung->label());
       }

       public function testFromDatabaseValue(): void
       {
           $this->assertSame(BookingStatus::Approved, BookingStatus::from('approved'));
           $this->assertNull(BookingStatus::tryFrom('diluluskan'));   // the Malay label is NOT the DB value
       }

       public function testActiveStatuses(): void
       {
           $this->assertSame(['pending', 'approved'], BookingStatus::active());
       }

       public function testTransitions(): void
       {
           $this->assertTrue(BookingStatus::Pending->canTransitionTo(BookingStatus::Approved));
           $this->assertFalse(BookingStatus::Pending->canTransitionTo(BookingStatus::Cancelled));
           $this->assertFalse(BookingStatus::Rejected->canTransitionTo(BookingStatus::Approved));
       }

       public function testEntityHelpers(): void
       {
           $booking = new SlotBooking([
               'user_id'    => 7,
               'status'     => 'pending',
               'start_date' => '2026-10-01',
               'end_date'   => '2026-10-10',
           ]);

           $this->assertSame(BookingStatus::Pending, $booking->statusEnum());
           $this->assertSame('warning', $booking->statusBadge());
           $this->assertSame(10, $booking->durationDays());
           $this->assertTrue($booking->isOwnedBy(7));
           $this->assertTrue($booking->isActive());
       }
   }
   ```

   ```bash
   composer test -- --no-coverage tests/tlk/BookingStatusTest.php
   ```

6. Models — generate and fill them in:

   ```bash
   php spark make:model ParkingSlotModel --table parking_slots
   php spark make:model VehicleModel
   php spark make:model SlotBookingModel --table slot_bookings
   ```

   > `DepartmentModel` from Lab 3.3 does not change. `ParkingZoneModel` from Lab 3.4 only gains `dropdown()` — replace the file with the version below (`cari()` is kept). Without `--table`, the default table name is wrong (`parkingslots`); see [spark commands](../docs/arahan-spark.md).

   > `make:model` generates many default settings. **Replace** the whole content of each generated file with the code below so you can read the Model on one screen.

   | Model | `$returnType` | Special settings | Extra methods |
   |-------|---------------|--------------|-----------------|
   | `DepartmentModel` | `array` | — | — |
   | `ParkingZoneModel` | `array` | — | `dropdown(): array` → `[id => 'A — Blok Utama']` |
   | `ParkingSlotModel` | `array` | `$useSoftDeletes = true` | `withZone()`, `activeDropdown()`, `isSlotNoTaken()` |
   | `VehicleModel` | `array` | — | `dropdownForUser(int $userId)` |
   | `SlotBookingModel` | `SlotBooking::class` | — | `listing()`, `findDetailed(int $id)` |

   `ParkingZoneModel` — `cari()` from Lab 3.4 + `dropdown()` for the slot form:

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

       /** @return array<int, string> [id => 'A — Blok Utama'] */
       public function dropdown(): array
       {
           $options = [];

           foreach ($this->orderBy('code')->findAll() as $row) {
               $options[$row['id']] = $row['code'] . ' — ' . $row['name'];
           }

           return $options;
       }
   }
   ```

   `ParkingSlotModel` — soft delete, Model rules with Malay messages, `withZone()`, `isSlotNoTaken()` and `activeDropdown()`:

   `app/Models/ParkingSlotModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use App\Enums\SlotCategory;
   use CodeIgniter\Model;

   class ParkingSlotModel extends Model
   {
       protected $table          = 'parking_slots';
       protected $returnType     = 'array';
       protected $useSoftDeletes = true;             // SPEC §3: parking_slots.deleted_at
       protected $allowedFields  = ['zone_id', 'slot_no', 'category', 'is_active'];
       protected $useTimestamps  = true;

       protected $validationRules = [
           'id'        => 'permit_empty|is_natural_no_zero',
           'zone_id'   => 'required|is_natural_no_zero|is_not_unique[parking_zones.id]',
           'slot_no'   => 'required|alpha_dash|max_length[10]',
           'category'  => 'required|in_list[oku,mengandung,pegawai_kanan,kenderaan_rasmi,pelawat_vip]',
           'is_active' => 'permit_empty|in_list[0,1]',
       ];

       protected $validationMessages = [
           'zone_id'  => ['required' => 'Sila pilih zon.', 'is_not_unique' => 'Zon tidak sah.'],
           'slot_no'  => ['required' => 'No. slot wajib diisi.', 'alpha_dash' => 'No. slot hanya huruf, nombor, - dan _.'],
           'category' => ['required' => 'Sila pilih kategori.', 'in_list' => 'Kategori tidak sah.'],
       ];

       public function withZone(): static
       {
           return $this->select('parking_slots.*, parking_zones.code AS zone_code, parking_zones.name AS zone_name')
               ->join('parking_zones', 'parking_zones.id = parking_slots.zone_id')
               ->orderBy('parking_zones.code')
               ->orderBy('parking_slots.slot_no');
       }

       /** UNIQUE(zone_id, slot_no) — is_unique CI4 hanya menyemak satu lajur */
       public function isSlotNoTaken(int $zoneId, string $slotNo, ?int $ignoreId = null): bool
       {
           $builder = $this->withDeleted()->where('zone_id', $zoneId)->where('slot_no', $slotNo);

           if ($ignoreId !== null) {
               $builder->where('id !=', $ignoreId);
           }

           return $builder->countAllResults() > 0;
       }

       /**
        * [id => 'A / A-01 (OKU)'] — slot aktif sahaja, untuk borang tempahan.
        *
        * @return array<int, string>
        */
       public function activeDropdown(): array
       {
           $options = [];

           foreach ($this->withZone()->where('parking_slots.is_active', 1)->findAll() as $row) {
               $options[$row['id']] = sprintf(
                   '%s / %s (%s)',
                   $row['zone_code'],
                   $row['slot_no'],
                   SlotCategory::from($row['category'])->label(),
               );
           }

           return $options;
       }
   }
   ```

   `VehicleModel` — `dropdownForUser()` returns only the vehicles the user owns:

   `app/Models/VehicleModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use CodeIgniter\Model;

   class VehicleModel extends Model
   {
       protected $table         = 'vehicles';
       protected $returnType    = 'array';
       protected $allowedFields = ['user_id', 'plate_no', 'model', 'color'];
       protected $useTimestamps = true;

       protected $validationRules = [
           'user_id'  => 'required|is_natural_no_zero',
           'plate_no' => 'required|max_length[15]|is_unique[vehicles.plate_no,id,{id}]',
           'model'    => 'required|max_length[80]',
           'color'    => 'required|max_length[30]',
       ];

       /** @return array<int, string> [id => 'WXX 1234 — Proton Saga'] — kenderaan milik pengguna sahaja */
       public function dropdownForUser(int $userId): array
       {
           $options = [];

           foreach ($this->where('user_id', $userId)->orderBy('plate_no')->findAll() as $v) {
               $options[$v['id']] = $v['plate_no'] . ' — ' . $v['model'];
           }

           return $options;
       }
   }
   ```

   `SlotBookingModel` — README §1.3 (including `listing()`) plus `findDetailed()`:

   `app/Models/SlotBookingModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use App\Entities\SlotBooking;
   use CodeIgniter\Model;

   class SlotBookingModel extends Model
   {
       protected $table         = 'slot_bookings';
       protected $returnType    = SlotBooking::class;
       protected $allowedFields = [
           'ref_no', 'user_id', 'vehicle_id', 'slot_id',
           'start_date', 'end_date', 'reason', 'status',
           'decided_by', 'decided_at',
       ];
       protected $useTimestamps = true;

       // Peraturan asas (format & wajib). Peraturan perniagaan (BR-TLK-01/03/04)
       // disemak dalam borang (BookingRules) dan BookingService.
       protected $validationRules = [
           'ref_no'     => 'required|max_length[20]',
           'user_id'    => 'required|is_natural_no_zero',
           'vehicle_id' => 'required|is_natural_no_zero',
           'slot_id'    => 'required|is_natural_no_zero',
           'start_date' => 'required|valid_date[Y-m-d]',
           'end_date'   => 'required|valid_date[Y-m-d]',
           'reason'     => 'required|min_length[10]|max_length[1000]',
           'status'     => 'required|in_list[pending,approved,rejected,cancelled,expired]',
       ];

       /**
        * Query asas senarai: tempahan + slot + zon + kenderaan + nama pemohon.
        * Guna: $model->listing()->where(...)->paginate(10)
        */
       public function listing(): static
       {
           return $this->select(
               'slot_bookings.*, parking_slots.slot_no, parking_slots.category, '
               . 'parking_zones.code AS zone_code, vehicles.plate_no, users.full_name AS applicant_name',
           )
               ->join('parking_slots', 'parking_slots.id = slot_bookings.slot_id')
               ->join('parking_zones', 'parking_zones.id = parking_slots.zone_id')
               ->join('vehicles', 'vehicles.id = slot_bookings.vehicle_id')
               ->join('users', 'users.id = slot_bookings.user_id')
               ->orderBy('slot_bookings.created_at', 'DESC')
               ->orderBy('slot_bookings.id', 'DESC');
       }

       /** Satu tempahan lengkap dengan maklumat paparan (untuk halaman show). */
       public function findDetailed(int $id): ?SlotBooking
       {
           return $this->listing()->where('slot_bookings.id', $id)->first();
       }
   }
   ```


7. Commit:

   ```bash
   git add app/Enums app/Entities app/Models tests/tlk
   git commit -m "TLK: enum BookingStatus/SlotCategory, entity SlotBooking, model TLK"
   ```

### ✅ Checkpoint
- `composer test -- --no-coverage tests/tlk/BookingStatusTest.php` → `OK (5 tests, …)` (`OK (6 tests, …)` if the ⭐ challenge test is added).
- You can answer: *"Why is `status` in `$allowedFields` even though the applicant cannot set it?"* (README §1.3).
- Compare with `BookingStatus.php.txt` (**Templat & Rujukan** module), `SlotCategory.php.txt` (**Templat & Rujukan** module), `SlotBooking-Entity.php.txt` (**Templat & Rujukan** module), `SlotBookingModel.php.txt` (**Templat & Rujukan** module).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Class "App\Enums\BookingStatus" not found` | File name ≠ enum name, or wrong `namespace` | File `app/Enums/BookingStatus.php`, `namespace App\Enums;` |
| `UnhandledMatchError` | `match` does not cover every case | Add the missing case — this is actually a **safety feature** of enums |
| `"diluluskan" is not a valid backing value` | `from()` was given a label, not a value | Use the value (`approved`), or `tryFrom()` for user input |
| `No code coverage driver available` (warning) | No Xdebug/PCOV | Add `--no-coverage` |
| `make:model` asks for "Model class name" | Command run without an argument | `php spark make:model NamaModel` |

### ⭐ Bonus challenge
- Add a test: every `BookingStatus::cases()` has a non-empty `label()` and a `badge()` from the list of valid Bootstrap colours.
- Add `DepartmentModel::dropdown()` and `phone` on the user profile (display only).

---

## Lab 5.2 — Slot CRUD (admin) & Booking List (S2)

### 🎯 Objective
Build `Admin/SlotController` (list, add, edit, soft delete) and a paginated `Tlk/BookingController::index` scoped to the owner.

### Prerequisites
- Lab 5.1 checkpoint passed and merged: `git switch main && git merge --no-ff feat/tlk-model`
- `git switch -c feat/tlk-crud`

### Steps

1. `app/Config/Routes.php` — add this **after** `service('auth')->routes($routes);`:

   ```php
   // (the line `use CodeIgniter\Router\RouteCollection;` is already at the top of the file)

   // TLK: bookings (applicant)
   $routes->group('tlk/tempahan', ['namespace' => 'App\Controllers\Tlk', 'filter' => 'session'], static function (RouteCollection $routes): void {
       $routes->get('/', 'BookingController::index', ['as' => 'tlk.index']);
   });

   // Admin — slot CRUD
   $routes->group('admin/slot', ['namespace' => 'App\Controllers\Admin', 'filter' => 'group:admin'], static function (RouteCollection $routes): void {
       $routes->get('/', 'SlotController::index', ['as' => 'admin.slot.index']);
       $routes->get('new', 'SlotController::new', ['as' => 'admin.slot.new']);
       $routes->post('/', 'SlotController::create', ['as' => 'admin.slot.create']);
       $routes->get('(:num)/edit', 'SlotController::edit/$1', ['as' => 'admin.slot.edit']);
       $routes->post('(:num)', 'SlotController::update/$1', ['as' => 'admin.slot.update']);
       $routes->post('(:num)/delete', 'SlotController::delete/$1', ['as' => 'admin.slot.delete']);
   });
   ```

2. **Controller `Admin/SlotController`** — the `save()` method follows README §2.2: whitelisted `getPost()` → `validateData()` with the Model's rules → `isSlotNoTaken()` + `$this->validator->setError()` → insert/update:

   `app/Controllers/Admin/SlotController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Admin;

   use App\Controllers\BaseController;
   use App\Enums\SlotCategory;
   use App\Models\ParkingSlotModel;
   use App\Models\ParkingZoneModel;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\RedirectResponse;

   /**
    * CRUD slot letak kenderaan (admin). Laluan: /admin/slot (filter group:admin).
    */
   class SlotController extends BaseController
   {
       private ParkingSlotModel $slots;
       private ParkingZoneModel $zones;

       public function __construct()
       {
           $this->slots = model(ParkingSlotModel::class);
           $this->zones = model(ParkingZoneModel::class);
       }

       public function index(): string
       {
           return view('admin/slot/index', [
               'title' => 'Pengurusan Slot',
               'slots' => $this->slots->withZone()->paginate(10),
               'pager' => $this->slots->pager,
           ]);
       }

       public function new(): string
       {
           return $this->form(null);
       }

       public function create(): RedirectResponse
       {
           return $this->save(null);
       }

       public function edit(int $id): string
       {
           return $this->form($this->findOr404($id));
       }

       public function update(int $id): RedirectResponse
       {
           $this->findOr404($id);

           return $this->save($id);
       }

       public function delete(int $id): RedirectResponse
       {
           $slot = $this->findOr404($id);
           $this->slots->delete($id);   // soft delete → deleted_at diisi

           return redirect()->to('admin/slot')->with('success', 'Slot ' . $slot['slot_no'] . ' telah dipadam.');
       }

       private function form(?array $slot): string
       {
           return view('admin/slot/form', [
               'title'      => $slot === null ? 'Tambah Slot' : 'Kemaskini Slot ' . $slot['slot_no'],
               'slot'       => $slot,
               'zones'      => $this->zones->dropdown(),
               'categories' => SlotCategory::options(),
           ]);
       }

       /**
        * README §2.2: getPost() senarai putih → validateData() dengan peraturan Model
        * → isSlotNoTaken() + setError() → insert/update → PRG.
        */
       private function save(?int $id): RedirectResponse
       {
           $data              = $this->request->getPost(['zone_id', 'slot_no', 'category']);   // senarai putih medan
           $data['slot_no']   = strtoupper(trim((string) $data['slot_no']));
           $data['is_active'] = $this->request->getPost('is_active') === '1' ? 1 : 0;           // checkbox

           // 1. Validasi format dengan peraturan Model yang SAMA (satu sumber peraturan)
           $rules = $this->slots->getValidationRules(['except' => ['id']]);

           if (! $this->validateData($data, $rules, $this->slots->getValidationMessages())) {
               return redirect()->back()->withInput();          // ralat + input lama dibawa ke borang
           }

           // 2. UNIQUE(zone_id, slot_no) — semakan komposit, ralat diletak pada medan slot_no
           if ($this->slots->isSlotNoTaken((int) $data['zone_id'], $data['slot_no'], $id)) {
               $this->validator->setError('slot_no', 'No. slot ini sudah wujud dalam zon tersebut.');

               return redirect()->back()->withInput();
           }

           $id === null ? $this->slots->insert($data) : $this->slots->update($id, $data);

           return redirect()->to('admin/slot')->with('success', 'Slot ' . $data['slot_no'] . ' telah disimpan.');
       }

       private function findOr404(int $id): array
       {
           return $this->slots->find($id) ?? throw PageNotFoundException::forPageNotFound('Slot tidak dijumpai.');
       }
   }
   ```

3. `app/Views/admin/slot/index.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php use App\Enums\SlotCategory; ?>

   <div class="d-flex justify-content-end mb-3">
       <a href="<?= url_to('admin.slot.new') ?>" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Tambah Slot</a>
   </div>

   <div class="card">
       <div class="table-responsive">
           <table class="table table-hover align-middle mb-0">
               <thead class="table-light">
               <tr><th>Zon</th><th>No. Slot</th><th>Kategori</th><th>Status</th><th class="text-end">Tindakan</th></tr>
               </thead>
               <tbody>
               <?php foreach ($slots as $slot): ?>
                   <?php $category = SlotCategory::from($slot['category']); ?>
                   <tr>
                       <td><?= esc($slot['zone_code']) ?> — <?= esc($slot['zone_name']) ?></td>
                       <td class="fw-semibold"><?= esc($slot['slot_no']) ?></td>
                       <td><i class="bi <?= esc($category->icon(), 'attr') ?>"></i> <?= esc($category->label()) ?></td>
                       <td><?= $slot['is_active'] ? 'Aktif' : 'Tidak aktif' ?></td>
                       <td class="text-end">
                           <a href="<?= url_to('admin.slot.edit', $slot['id']) ?>" class="btn btn-sm btn-outline-primary">Ubah</a>
                           <form action="<?= url_to('admin.slot.delete', $slot['id']) ?>" method="post" class="d-inline"
                                 data-confirm="Padam slot <?= esc($slot['slot_no'], 'attr') ?>?">
                               <?= csrf_field() ?>
                               <button type="submit" class="btn btn-sm btn-outline-danger">Padam</button>
                           </form>
                       </td>
                   </tr>
               <?php endforeach ?>
               <?php if ($slots === []): ?>
                   <tr><td colspan="5" class="text-center text-muted py-4">Tiada slot.</td></tr>
               <?php endif ?>
               </tbody>
           </table>
       </div>
   </div>

   <div class="mt-3"><?= $pager->links() ?></div>
   <?= $this->endSection() ?>
   ```

   > The `data-confirm` attribute will be switched on by the layout script on Day 6 S4. Today, delete happens straight away.

4. `app/Views/admin/slot/form.php` — use `form_dropdown()` (the `form` helper is loaded in `BaseController`) and `old()`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php
   $action  = $slot === null ? url_to('admin.slot.create') : url_to('admin.slot.update', $slot['id']);
   $active  = old('is_active', $slot['is_active'] ?? '1');
   $invalid = static fn (string $field): string => validation_show_error($field) !== '' ? ' is-invalid' : '';
   ?>
   <div class="card" style="max-width: 640px">
       <div class="card-body">
           <form action="<?= $action ?>" method="post" novalidate>
               <?= csrf_field() ?>

               <div class="mb-3">
                   <label for="zone_id" class="form-label">Zon</label>
                   <?= form_dropdown('zone_id', ['' => '— Pilih zon —'] + $zones, old('zone_id', $slot['zone_id'] ?? ''), ['id' => 'zone_id', 'class' => 'form-select' . $invalid('zone_id')]) ?>
                   <div class="invalid-feedback"><?= validation_show_error('zone_id') ?></div>
               </div>

               <div class="mb-3">
                   <label for="slot_no" class="form-label">No. Slot</label>
                   <input type="text" name="slot_no" id="slot_no" maxlength="10" class="form-control<?= $invalid('slot_no') ?>"
                          value="<?= esc(old('slot_no', $slot['slot_no'] ?? ''), 'attr') ?>" placeholder="cth A-05">
                   <div class="invalid-feedback"><?= validation_show_error('slot_no') ?></div>
               </div>

               <div class="mb-3">
                   <label for="category" class="form-label">Kategori</label>
                   <?= form_dropdown('category', ['' => '— Pilih kategori —'] + $categories, old('category', $slot['category'] ?? ''), ['id' => 'category', 'class' => 'form-select' . $invalid('category')]) ?>
                   <div class="invalid-feedback"><?= validation_show_error('category') ?></div>
               </div>

               <div class="form-check form-switch mb-4">
                   <input class="form-check-input" type="checkbox" role="switch" name="is_active" id="is_active" value="1" <?= (string) $active === '1' ? 'checked' : '' ?>>
                   <label class="form-check-label" for="is_active">Slot aktif</label>
               </div>

               <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Simpan</button>
               <a href="<?= url_to('admin.slot.index') ?>" class="btn btn-link">Batal</a>
           </form>
       </div>
   </div>
   <?= $this->endSection() ?>
   ```

5. **Controller `Tlk/BookingController`** — only the `index()` method from README §2.3 for now (`new()`, `create()` and `show()` are added in Lab 5.3):

   `app/Controllers/Tlk/BookingController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Tlk;

   use App\Controllers\BaseController;
   use App\Enums\BookingStatus;
   use App\Models\SlotBookingModel;

   /**
    * Tempahan TLK (pemohon). Controller NIPIS: request → validasi → BookingService → view/redirect.
    */
   class BookingController extends BaseController
   {
       /** GET /tlk/tempahan — "Tempahan Saya" (SKOP PEMILIK dalam query) */
       public function index(): string
       {
           $model  = model(SlotBookingModel::class);
           $status = (string) $this->request->getGet('status');

           $query = $model->listing()->where('slot_bookings.user_id', auth()->id());

           if (BookingStatus::tryFrom($status) !== null) {        // input tidak sah → diabaikan
               $query->where('slot_bookings.status', $status);
           }

           return view('tlk/booking/index', [
               'title'    => 'Tempahan Saya',
               'bookings' => $query->paginate(10),
               'pager'    => $model->pager,
               'status'   => $status,
           ]);
       }
   }
   ```

6. `app/Views/tlk/booking/index.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php use App\Enums\BookingStatus; ?>

   <form method="get" class="d-flex gap-2 mb-3" style="max-width: 420px">
       <?= form_dropdown('status', ['' => 'Semua status'] + BookingStatus::options(), $status, ['class' => 'form-select', 'aria-label' => 'Tapis status']) ?>
       <button class="btn btn-outline-secondary" type="submit"><i class="bi bi-funnel"></i> Tapis</button>
   </form>

   <div class="card">
       <div class="table-responsive">
           <table class="table table-hover align-middle mb-0">
               <thead class="table-light">
               <tr><th>No. Rujukan</th><th>Slot</th><th>Kenderaan</th><th>Tempoh</th><th>Status</th><th></th></tr>
               </thead>
               <tbody>
               <?php foreach ($bookings as $b): ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($b->ref_no) ?></td>
                       <td><?= esc($b->zone_code) ?> / <?= esc($b->slot_no) ?></td>
                       <td><?= esc($b->plate_no) ?></td>
                       <td><?= esc($b->start_date) ?> hingga <?= esc($b->end_date) ?> <span class="text-muted small">(<?= $b->durationDays() ?> hari)</span></td>
                       <td><?= esc($b->statusLabel()) ?></td>
                       <td class="text-end"><a href="<?= url_to('tlk.show', $b->id) ?>" class="btn btn-sm btn-outline-primary">Lihat</a></td>
                   </tr>
               <?php endforeach ?>
               <?php if ($bookings === []): ?>
                   <tr><td colspan="6" class="text-center text-muted py-4">Tiada tempahan.</td></tr>
               <?php endif ?>
               </tbody>
           </table>
       </div>
   </div>

   <div class="mt-3"><?= $pager->links() ?></div>
   <?= $this->endSection() ?>
   ```

   > `url_to('tlk.show', …)` will throw an error until the `tlk.show` route is added in Lab 5.3. In the meantime, replace it with `#` **or** go ahead to Lab 5.3 step 1 first.

7. Test:

   ```bash
   php spark routes | grep -E "admin/slot|tlk/tempahan"
   php spark serve
   ```

8. Commit: `git add app/ && git commit -m "TLK: CRUD slot admin + senarai tempahan berpagination"`.

### ✅ Checkpoint
- Log in as `admin@latihan.test` → `http://localhost:8080/admin/slot` → 10 slots + a page link `2` (12 seeded slots).
- Add `A-05` / Zone A / OKU → flash *"Slot A-05 telah disimpan."*. Add `A-05` / Zone A again → *"No. slot ini sudah wujud dalam zon tersebut."*. Add `A-05` / Zone **B** → succeeds.
- Delete `A-05` Zone B → gone from the list; `php spark db:table parking_slots --desc --limit-rows 2` shows `deleted_at` filled in.
- Log in as `pemohon1@latihan.test` → open `/admin/slot` → redirected to `/` (Shield: no group permission).
- `/tlk/tempahan` as pemohon1 → empty table *"Tiada tempahan."* (no bookings yet).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `404 Controller or its method is not found: \App\Controllers\Admin\SlotController::index` | Wrong namespace/folder | File `app/Controllers/Admin/SlotController.php`, `namespace App\Controllers\Admin;` |
| `Call to undefined function form_dropdown()` | `form` helper not loaded | `BaseController::initController()` → `$this->helpers = ['form', 'url'];` |
| `The action you requested is not allowed.` | `csrf_field()` missing from the form | Add it inside every `<form method="post">` |
| `Too few arguments to function … edit(), 0 passed` | Route without `/$1` | `'SlotController::edit/$1'` |
| The "Slot aktif" box cannot be unticked | A checkbox is not sent when it is not ticked | `is_active = getPost('is_active') === '1' ? 1 : 0` |
| `Unknown column 'deleted_at'` on another model | `$useSoftDeletes = true` copied into a Model whose table has no `deleted_at` | Only `ParkingSlotModel` |

### ⭐ Bonus challenge
- Zone CRUD (`Admin/ZoneController`) — block deleting a zone that still has slots (FK `RESTRICT` will throw a DB error; catch it and show a Malay message).
- Category filter on `/admin/slot?category=oku`.

---

## Lab 5.3 — Booking Form, Validation & `TLK-2026-0001` (S3)

### 🎯 Objective
Build the booking form with server-side validation (including BR-TLK-03), `ReferenceNumberService`, `BookingService` v1, and generate `TLK-2026-0001`.

### Prerequisites
- Lab 5.2 merged; `git switch -c feat/tlk-borang-tempahan`

### Steps

1. Add routes inside the `tlk/tempahan` group:

   ```php
   $routes->get('new', 'BookingController::new', ['as' => 'tlk.new', 'filter' => 'permission:tlk.apply']);
   $routes->post('/', 'BookingController::create', ['as' => 'tlk.create', 'filter' => 'permission:tlk.apply']);
   $routes->get('(:num)', 'BookingController::show/$1', ['as' => 'tlk.show']);
   ```

   > The `permission:tlk.apply` filter on a route is **added** to the group's `session` filter. Approvers (no `tlk.apply`) cannot apply.

2. **Validation rules `BookingRules`** — README §3.2, complete with `parse()`:

   `app/Validation/BookingRules.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Validation;

   use DateTimeImmutable;

   /**
    * Peraturan validasi tersuai borang tempahan TLK (BR-TLK-03).
    * Didaftar dalam Config\Validation::$ruleSets.
    *
    *   'start_date' => 'required|valid_date[Y-m-d]|not_past_date',
    *   'end_date'   => 'required|valid_date[Y-m-d]|date_on_or_after[start_date]|max_period_days[start_date,90]',
    */
   class BookingRules
   {
       /** Tarikh bukan masa lalu — hari ini dibenarkan. */
       public function not_past_date(?string $str): bool
       {
           $date = $this->parse($str);

           return $date !== null && $date >= new DateTimeImmutable('today');
       }

       /** Tarikh ini >= tarikh medan lain (cth end_date >= start_date). */
       public function date_on_or_after(?string $str, string $otherField, array $data): bool
       {
           $date  = $this->parse($str);
           $other = $this->parse($data[$otherField] ?? null);

           return $date === null || $other === null || $date >= $other;
       }

       /** (tarikh ini − tarikh medan lain) <= N hari. Param: "start_date,90". */
       public function max_period_days(?string $str, string $params, array $data): bool
       {
           [$otherField, $maxDays] = array_map('trim', explode(',', $params)) + [1 => '90'];

           $end   = $this->parse($str);
           $start = $this->parse($data[$otherField] ?? null);

           if ($end === null || $start === null || $end < $start) {
               return true;   // biar peraturan lain melapor
           }

           return $start->diff($end)->days <= (int) $maxDays;   // BR-TLK-03
       }

       private function parse(?string $value): ?DateTimeImmutable
       {
           if ($value === null || $value === '') {
               return null;
           }

           $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);   // '!' = masa 00:00:00

           return $date === false ? null : $date;
       }
   }
   ```

   Register it in `app/Config/Validation.php`:

   ```php
   public array $ruleSets = [
       Rules::class,
       FormatRules::class,
       FileRules::class,
       CreditCardRules::class,
       \App\Validation\BookingRules::class,   // ← add
   ];
   ```

3. **Service `ReferenceNumberService`** — README §3.3. The constructor takes `?BaseConnection $db = null` and uses `db_connect()` if null:

   `app/Services/ReferenceNumberService.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use CodeIgniter\Database\BaseConnection;
   use CodeIgniter\Database\Exceptions\DatabaseException;
   use RuntimeException;
   use Throwable;

   /**
    * Menjana nombor rujukan berjujukan per prefix per tahun:
    *   next('TLK') → 'TLK-2026-0001', 'TLK-2026-0002', ...
    *   next('PAS') → 'PAS-2026-0001', ...
    *
    * Selamat untuk permintaan serentak: baris (prefix, year) dalam
    * reference_sequences dikunci dengan SELECT ... FOR UPDATE dalam transaksi.
    * Jika dipanggil DALAM transaksi lain (cth BookingService), transaksi CI4
    * bersarang — kunci dilepaskan hanya apabila transaksi luar commit/rollback,
    * dan nombor tidak "hilang" jika tempahan gagal.
    *
    * Tertib penting (elak deadlock): SELECT ... FOR UPDATE DAHULU. INSERT IGNORE hanya
    * jika baris tahun itu belum wujud. Jika INSERT IGNORE dijalankan pada baris yang SUDAH
    * wujud, InnoDB mengambil kunci S (kongsi); dua permintaan serentak yang kemudian meminta
    * kunci X pada baris sama akan deadlock (ralat 1213).
    */
   class ReferenceNumberService
   {
       /** Ralat MySQL/MariaDB: 1213 = deadlock, 1205 = lock wait timeout */
       private const RETRYABLE = [1213, 1205];

       private const MAX_ATTEMPTS = 3;

       private BaseConnection $db;

       public function __construct(?BaseConnection $db = null)
       {
           $this->db = $db ?? db_connect();
       }

       public function next(string $prefix): string
       {
           $prefix = strtoupper(trim($prefix));

           // Cuba semula HANYA jika kita pemilik transaksi (bukan bersarang). Dalam transaksi
           // luar, deadlock telah me-rollback SEMUA kerja pemanggil — pemanggil mesti mengendalikannya.
           $ownsTransaction = $this->db->transDepth === 0;

           for ($attempt = 1; ; $attempt++) {
               try {
                   return $this->allocate($prefix);
               } catch (DatabaseException $e) {
                   if (! $ownsTransaction || $attempt >= self::MAX_ATTEMPTS || ! in_array($e->getCode(), self::RETRYABLE, true)) {
                       throw $e;
                   }

                   usleep(random_int(5_000, 50_000));   // undur sebentar sebelum cuba semula
               }
           }
       }

       private function allocate(string $prefix): string
       {
           $year = (int) date('Y');
           $now  = date('Y-m-d H:i:s');

           // Ralat query → exception (bukan `false` senyap) supaya transaksi tidak separuh siap.
           $this->db->transException(true)->transBegin();

           try {
               // 1. Kunci baris (prefix, year). Permintaan lain untuk prefix+tahun yang sama
               //    akan MENUNGGU di sini sehingga kita commit.
               $row = $this->lockSequence($prefix, $year);

               // 2. Tahun baharu: cipta baris (INSERT IGNORE — selamat jika pihak lain
               //    mendahului kita), kemudian kunci semula.
               if ($row === null) {
                   $this->db->table('reference_sequences')->ignore(true)->insert([
                       'prefix'      => $prefix,
                       'year'        => $year,
                       'last_number' => 0,
                       'created_at'  => $now,
                       'updated_at'  => $now,
                   ]);

                   $row = $this->lockSequence($prefix, $year)
                       ?? throw new RuntimeException("Gagal mencipta jujukan {$prefix}-{$year}.");
               }

               $number = (int) $row->last_number + 1;

               // 3. Simpan nombor baharu.
               $updated = $this->db->table('reference_sequences')
                   ->where('id', $row->id)
                   ->update(['last_number' => $number, 'updated_at' => $now]);

               if ($updated === false) {
                   throw new RuntimeException('Gagal mengemas kini jujukan nombor rujukan.');
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               $this->db->transRollback();

               throw $e;
           }

           return sprintf('%s-%d-%04d', $prefix, $year, $number);
       }

       /** SELECT ... FOR UPDATE. Query Builder CI4 tiada lockForUpdate() — guna query binding. */
       private function lockSequence(string $prefix, int $year): ?object
       {
           $table = $this->db->prefixTable('reference_sequences');
           $query = $this->db->query(
               "SELECT id, last_number FROM {$table} WHERE prefix = ? AND year = ? FOR UPDATE",
               [$prefix, $year],
           );

           if ($query === false) {   // DBDebug = false: query() pulang false, bukan exception
               throw new RuntimeException('Gagal mengunci jujukan nombor rujukan.');
           }

           return $query->getRow();
       }
   }
   ```

4. `app/Services/BookingService.php` — **version 1** (upgraded tomorrow):

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use App\Entities\SlotBooking;
   use App\Enums\BookingStatus;
   use App\Models\SlotBookingModel;
   use App\Models\VehicleModel;
   use DomainException;

   /**
    * VERSION 1 (Day 5) — deliberately incomplete.
    * Day 6: transactions, row locks, BR-TLK-01/04 and status_logs.
    */
   class BookingService
   {
       public const MODULE = 'TLK';

       public function __construct(
           private readonly SlotBookingModel $bookings = new SlotBookingModel(),
           private readonly VehicleModel $vehicles = new VehicleModel(),
           private readonly ReferenceNumberService $refNumbers = new ReferenceNumberService(),
       ) {
       }

       public function create(int $userId, array $data): SlotBooking
       {
           $owned = $this->vehicles
               ->where('id', (int) $data['vehicle_id'])
               ->where('user_id', $userId)
               ->countAllResults() > 0;

           if (! $owned) {
               throw new DomainException('Kenderaan yang dipilih bukan milik anda.');
           }

           $id = $this->bookings->insert([
               'ref_no'     => $this->refNumbers->next(self::MODULE),
               'user_id'    => $userId,                 // from the session, NOT from the form
               'vehicle_id' => (int) $data['vehicle_id'],
               'slot_id'    => (int) $data['slot_id'],
               'start_date' => $data['start_date'],
               'end_date'   => $data['end_date'],
               'reason'     => trim((string) $data['reason']),
               'status'     => BookingStatus::Pending->value,
           ]);

           if ($id === false) {
               throw new DomainException(implode(' ', $this->bookings->errors()));
           }

           return $this->bookings->find($id);
       }
   }
   ```

5. Register the services — replace `app/Config/Services.php`:

   ```php
   <?php

   namespace Config;

   use App\Services\BookingService;
   use App\Services\ReferenceNumberService;
   use CodeIgniter\Config\BaseService;

   class Services extends BaseService
   {
       public static function referenceNumber(bool $getShared = true): ReferenceNumberService
       {
           if ($getShared) {
               return static::getSharedInstance('referenceNumber');
           }

           return new ReferenceNumberService(db_connect());
       }

       public static function bookingService(bool $getShared = true): BookingService
       {
           if ($getShared) {
               return static::getSharedInstance('bookingService');
           }

           // db_connect() = a SHARED connection → nested transactions on the same connection (Day 6)
           return new BookingService(refNumbers: new ReferenceNumberService(db_connect()));
       }
   }
   ```

6. **Complete `BookingController`** — replace the Lab 5.2 file with this version: `index()` stays, plus `new()`, `create()` (README §3.2 + §3.4), `show()` with the ownership check, and `rules()` and `messages()` (Malay messages for every rule):

   `app/Controllers/Tlk/BookingController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Tlk;

   use App\Controllers\BaseController;
   use App\Enums\BookingStatus;
   use App\Models\ParkingSlotModel;
   use App\Models\SlotBookingModel;
   use App\Models\VehicleModel;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\RedirectResponse;
   use DomainException;

   /**
    * Tempahan TLK (pemohon). Controller NIPIS: request → validasi → BookingService → view/redirect.
    */
   class BookingController extends BaseController
   {
       /** GET /tlk/tempahan — "Tempahan Saya" (SKOP PEMILIK dalam query) */
       public function index(): string
       {
           $model  = model(SlotBookingModel::class);
           $status = (string) $this->request->getGet('status');

           $query = $model->listing()->where('slot_bookings.user_id', auth()->id());

           if (BookingStatus::tryFrom($status) !== null) {        // input tidak sah → diabaikan
               $query->where('slot_bookings.status', $status);
           }

           return view('tlk/booking/index', [
               'title'    => 'Tempahan Saya',
               'bookings' => $query->paginate(10),
               'pager'    => $model->pager,
               'status'   => $status,
           ]);
       }

       /** GET /tlk/tempahan/new */
       public function new(): string
       {
           return view('tlk/booking/form', [
               'title'    => 'Mohon Slot Letak Kenderaan Khas',
               'vehicles' => model(VehicleModel::class)->dropdownForUser(auth()->id()),
               'slots'    => model(ParkingSlotModel::class)->activeDropdown(),
           ]);
       }

       /** POST /tlk/tempahan */
       public function create(): RedirectResponse
       {
           if (! $this->validate($this->rules(), $this->messages())) {
               return redirect()->back()->withInput();                      // ralat medan dibawa
           }

           try {
               $booking = service('bookingService')->create(auth()->id(), $this->validator->getValidated());
           } catch (DomainException $e) {
               return redirect()->back()->withInput()->with('error', $e->getMessage());
           }

           return redirect()->to(url_to('tlk.show', $booking->id))
               ->with('success', 'Permohonan ' . $booking->ref_no . ' telah dihantar.');
       }

       /** GET /tlk/tempahan/{id} */
       public function show(int $id): string
       {
           $booking = model(SlotBookingModel::class)->findDetailed($id);

           if ($booking === null || ! $booking->isOwnedBy(auth()->id())) {   // semakan PEMILIKAN
               throw PageNotFoundException::forPageNotFound('Tempahan tidak dijumpai.');
           }

           return view('tlk/booking/show', ['title' => 'Tempahan ' . $booking->ref_no, 'booking' => $booking]);
       }

       // -----------------------------------------------------------------

       /** @return array<string, string> */
       private function rules(): array
       {
           return [
               'vehicle_id' => 'required|is_natural_no_zero',
               'slot_id'    => 'required|is_natural_no_zero|is_not_unique[parking_slots.id]',
               'start_date' => 'required|valid_date[Y-m-d]|not_past_date',
               'end_date'   => 'required|valid_date[Y-m-d]|date_on_or_after[start_date]|max_period_days[start_date,90]',
               'reason'     => 'required|min_length[10]|max_length[1000]',
           ];
       }

       /** @return array<string, array<string, string>> mesej BM — kunci = nama peraturan tepat */
       private function messages(): array
       {
           return [
               'vehicle_id' => [
                   'required'           => 'Sila pilih kenderaan.',
                   'is_natural_no_zero' => 'Kenderaan tidak sah.',
               ],
               'slot_id' => [
                   'required'           => 'Sila pilih slot.',
                   'is_natural_no_zero' => 'Slot tidak sah.',
                   'is_not_unique'      => 'Slot tidak wujud.',
               ],
               'start_date' => [
                   'required'      => 'Tarikh mula wajib diisi.',
                   'valid_date'    => 'Format tarikh mula tidak sah.',
                   'not_past_date' => 'Tarikh mula tidak boleh pada masa lalu.',
               ],
               'end_date' => [
                   'required'         => 'Tarikh tamat wajib diisi.',
                   'valid_date'       => 'Format tarikh tamat tidak sah.',
                   'date_on_or_after' => 'Tarikh tamat mesti sama atau selepas tarikh mula.',
                   'max_period_days'  => 'Tarikh tamat tidak boleh melebihi 90 hari selepas tarikh mula.',
               ],
               'reason' => [
                   'required'   => 'Sebab permohonan wajib diisi.',
                   'min_length' => 'Sebab permohonan mestilah sekurang-kurangnya 10 aksara.',
                   'max_length' => 'Sebab permohonan tidak boleh melebihi 1000 aksara.',
               ],
           ];
       }
   }
   ```

7. `app/Views/tlk/booking/form.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php $invalid = static fn (string $field): string => validation_show_error($field) !== '' ? ' is-invalid' : ''; ?>

   <?php if ($vehicles === []): ?>
       <div class="alert alert-warning">Anda belum mendaftar kenderaan. Hubungi pentadbir.</div>
   <?php endif ?>

   <div class="card" style="max-width: 720px">
       <div class="card-body">
           <form action="<?= url_to('tlk.create') ?>" method="post" novalidate>
               <?= csrf_field() ?>

               <div class="mb-3">
                   <label for="vehicle_id" class="form-label">Kenderaan</label>
                   <?= form_dropdown('vehicle_id', ['' => '— Pilih kenderaan —'] + $vehicles, old('vehicle_id'), ['id' => 'vehicle_id', 'class' => 'form-select' . $invalid('vehicle_id')]) ?>
                   <div class="invalid-feedback"><?= validation_show_error('vehicle_id') ?></div>
               </div>

               <div class="mb-3">
                   <label for="slot_id" class="form-label">Slot</label>
                   <?= form_dropdown('slot_id', ['' => '— Pilih slot —'] + $slots, old('slot_id'), ['id' => 'slot_id', 'class' => 'form-select' . $invalid('slot_id')]) ?>
                   <div class="invalid-feedback"><?= validation_show_error('slot_id') ?></div>
               </div>

               <div class="row">
                   <div class="col-md-6 mb-3">
                       <label for="start_date" class="form-label">Tarikh mula</label>
                       <input type="date" name="start_date" id="start_date" class="form-control<?= $invalid('start_date') ?>"
                              value="<?= esc(old('start_date'), 'attr') ?>" min="<?= date('Y-m-d') ?>">
                       <div class="invalid-feedback"><?= validation_show_error('start_date') ?></div>
                   </div>
                   <div class="col-md-6 mb-3">
                       <label for="end_date" class="form-label">Tarikh tamat</label>
                       <input type="date" name="end_date" id="end_date" class="form-control<?= $invalid('end_date') ?>"
                              value="<?= esc(old('end_date'), 'attr') ?>" min="<?= date('Y-m-d') ?>">
                       <div class="invalid-feedback"><?= validation_show_error('end_date') ?></div>
                   </div>
               </div>

               <div class="mb-3">
                   <label for="reason" class="form-label">Sebab permohonan</label>
                   <textarea name="reason" id="reason" rows="3" maxlength="1000" class="form-control<?= $invalid('reason') ?>"><?= esc(old('reason')) ?></textarea>
                   <div class="invalid-feedback"><?= validation_show_error('reason') ?></div>
                   <div class="form-text">Tarikh tamat maksimum 90 hari selepas tarikh mula.</div>
               </div>

               <button type="submit" class="btn btn-primary"><i class="bi bi-send"></i> Hantar Permohonan</button>
               <a href="<?= url_to('tlk.index') ?>" class="btn btn-link">Batal</a>
           </form>
       </div>
   </div>
   <?= $this->endSection() ?>
   ```

8. `app/Views/tlk/booking/show.php` (Day 5 version — status history is added tomorrow):

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php use App\Enums\SlotCategory; ?>
   <div class="card" style="max-width: 720px">
       <div class="card-header d-flex justify-content-between">
           <span class="fw-semibold"><?= esc($booking->ref_no) ?></span>
           <span><?= esc($booking->statusLabel()) ?></span>
       </div>
       <div class="card-body">
           <dl class="row mb-0">
               <dt class="col-sm-4">Slot</dt>
               <dd class="col-sm-8"><?= esc($booking->zone_code) ?> / <?= esc($booking->slot_no) ?> (<?= esc(SlotCategory::from($booking->category)->label()) ?>)</dd>
               <dt class="col-sm-4">Kenderaan</dt>
               <dd class="col-sm-8"><?= esc($booking->plate_no) ?></dd>
               <dt class="col-sm-4">Tempoh</dt>
               <dd class="col-sm-8"><?= esc($booking->start_date) ?> hingga <?= esc($booking->end_date) ?> (<?= $booking->durationDays() ?> hari)</dd>
               <dt class="col-sm-4">Sebab</dt>
               <dd class="col-sm-8"><?= nl2br(esc($booking->reason)) ?></dd>
           </dl>
       </div>
   </div>
   <a href="<?= url_to('tlk.index') ?>" class="btn btn-link mt-3">&larr; Kembali</a>
   <?= $this->endSection() ?>
   ```

9. Test: log in as `pemohon1@latihan.test` → `http://localhost:8080/tlk/tempahan/new` → fill in slot A-01, vehicle `WXX 1234`, start date tomorrow, end date +7 days, reason ≥ 10 characters → **Hantar**.

10. Commit: `TLK: borang tempahan + validasi BR-TLK-03 + ReferenceNumberService`.

### ✅ Checkpoint
- After submitting: redirected to `/tlk/tempahan/1` with the flash *"Permohonan TLK-2026-0001 telah dihantar."* (the year follows the current date).
- DB:

  ```bash
  php spark db:table slot_bookings
  php spark db:table reference_sequences
  ```

  → `ref_no = TLK-2026-0001`, `status = pending`; `reference_sequences`: `TLK | 2026 | 1`.
- Submit a second booking (another slot) → `TLK-2026-0002`.
- Start date yesterday → the message *"Tarikh mula tidak boleh pada masa lalu."* under the field, other values kept.
- End date = start + 91 days → *"Tarikh tamat tidak boleh melebihi 90 hari selepas tarikh mula."*; + 90 days → accepted.
- Log in as `pelulus@latihan.test` → `/tlk/tempahan/new` → redirected (no `tlk.apply`).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `"not_past_date" is not a valid rule` | `BookingRules` not registered yet | `app/Config/Validation.php` → `$ruleSets` |
| Validation messages in English ("The start_date field …") | `$messages` not passed, or wrong keys | `$this->validate($rules, $messages)`; key = the exact rule name |
| Errors not shown under the field | Using `->with('errors', …)` or relying on Model errors (`$model->errors()`) | Validate in the controller (`validate()`/`validateData()`), then `redirect()->back()->withInput()` — CI4 carries the **controller validator** errors automatically; the view uses `validation_show_error()` |
| `Call to undefined function validation_show_error()` | CI < 4.3, or the `form` helper is not loaded | Make sure CI ≥ 4.6 and the `form` helper |
| `Call to a member function next() on null` / `Service bookingService not found` | `Config\Services` not updated | Step 5 |
| `Unknown column 'year'` / SQL syntax error | Using `{$table}` without `prefixTable()` while a `DBPrefix` is set | Use `$this->db->prefixTable('reference_sequences')` |
| `ref_no` is always `TLK-2026-0001` → `Duplicate entry` | The `UPDATE` never ran (no `where('id', …)`), or the transaction did not commit | Check step 3 and `transCommit()` |

### ⭐ Bonus challenge
- Add `SlotCategory` to the slot dropdown with an `<optgroup>` per zone.
- Open **two browser tabs** as `pemohon1` and `pemohon2`, and submit slot A-01 with the same dates in both. What happens? Record it as a bug for Day 6 (BR-TLK-01 is not enforced yet — **this is expected**).

---

## Lab 5.4 — Manual Testing & Bug Records (S4)

### 🎯 Objective
Run the TLK manual test list systematically and record bugs with repeatable steps.

### Prerequisites
- Labs 5.1–5.3 merged into `main`; `php spark db:seed DatabaseSeeder` (complete base data)
- Two browsers (or one normal + one *incognito*)

### Steps

1. Create `docs/ujian-manual-tlk.md` with this table and run **every** case. Fill in the *Actual* & *Status* columns (✅ pass / ❌ fail / ⏭️ not run yet).

   | ID | Role | Steps | Expected | Actual | Status |
   |----|---------|---------|----------|---------|--------|
   | TM-TLK-01 | admin | Open `/admin/slot` | 10 slots + page 2 | | |
   | TM-TLK-02 | admin | Add `A-06` Zone A, category `mengandung` | Success flash; appears in the list | | |
   | TM-TLK-03 | admin | Add `A-06` Zone A again | Message "sudah wujud dalam zon"; no new row | | |
   | TM-TLK-04 | admin | Add a slot without choosing a category | "Sila pilih kategori."; other values kept | | |
   | TM-TLK-05 | admin | Delete `A-06` | Gone from the list; `deleted_at` filled in | | |
   | TM-TLK-06 | pemohon1 | Open `/admin/slot` directly | Redirected to `/` (no access) | | |
   | TM-TLK-07 | pemohon1 | Submit a valid booking | New `TLK-YYYY-NNNN`, status *Menunggu* | | |
   | TM-TLK-08 | pemohon1 | Start date = yesterday | Past-date message; no new row | | |
   | TM-TLK-09 | pemohon1 | End date < start date | Message "sama atau selepas" | | |
   | TM-TLK-10 | pemohon1 | End = start + 91 days | 90-day message | | |
   | TM-TLK-11 | pemohon1 | Reason of 5 characters | Minimum 10 characters message | | |
   | TM-TLK-12 | pemohon1 | DevTools: change the vehicle option's `value` to pemohon2's vehicle ID (`3`), submit | "Kenderaan … bukan milik anda." | | |
   | TM-TLK-13 | pemohon2 | Open `/tlk/tempahan/1` (owned by pemohon1) | 404 | | |
   | TM-TLK-14 | pemohon1 | DevTools: delete the `csrf_test_name` input, submit | "The action you requested is not allowed." | | |
   | TM-TLK-15 | pemohon1 | `/tlk/tempahan?status=xyz` | Filter ignored; all of the user's own bookings shown | | |
   | TM-TLK-16 | pemohon1 & 2 | Two bookings for slot A-01, overlapping dates | **Expected to fail today** (BR-TLK-01 tomorrow) | | |

2. For every ❌, write a bug report (format in README §4.3) at the bottom of the same file.

3. Fix the **High/Medium** bugs you have time for (one `fix/…` branch per bug; commit `FIX: …`). Do **not** fix bug TM-TLK-16 today.

4. Wrap-up: commit `docs/ujian-manual-tlk.md` with `TLK: rekod ujian manual Hari 5`.

### ✅ Checkpoint
- `docs/ujian-manual-tlk.md` — 16 cases, each one with a status; ≥ 14 ✅ (TM-TLK-16 ❌ expected).
- At least **one** complete bug report with steps to reproduce (TM-TLK-16 counts).
- `git log --oneline main` shows the merges of `feat/tlk-model`, `feat/tlk-crud`, `feat/tlk-borang-tempahan`.

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| Cannot log in as two users at the same time | The session is shared within one browser | Use an *incognito* window or a second browser |
| TM-TLK-12 succeeds (it should not) | `BookingService` does not check vehicle ownership | Check step 4 of Lab 5.3 |
| TM-TLK-13 shows the booking | `show()` has no `isOwnedBy()` check | Add the check → `PageNotFoundException` |

### ⭐ Bonus challenge
Turn TM-TLK-08 to TM-TLK-11 into PHPUnit tests for `BookingRules` (without a DB): `(new BookingRules())->max_period_days('2026-12-31', 'start_date,90', ['start_date' => '2026-10-01'])` → `false`.

---

## Self-check — end of day

```bash
composer test -- --no-coverage tests/tlk/BookingStatusTest.php   # OK (5 tests, …)
git log --oneline --merges main -3                               # 3 feat/tlk-* merges
git status --short                                               # no output
```

- [ ] As `admin@latihan.test`, `/admin/slot` shows the paginated slot list; adding & deleting a slot works (TM-TLK-01 to 05).
- [ ] As `pemohon1@latihan.test`, a valid booking form produces a new `TLK-YYYY-NNNN` with status *Menunggu* (Pending) at `/tlk/tempahan`.
- [ ] BR-TLK-03: end = start + 91 days is rejected; end = start + 90 days is accepted; a start date of yesterday is rejected.
- [ ] `composer test -- --no-coverage tests/tlk/BookingStatusTest.php` → `OK (5 tests, …)` (6 with ⭐).
- [ ] `docs/ujian-manual-tlk.md` has 16 cases with a status (≥ 14 ✅) and ≥ 1 bug report (TM-TLK-16).
- [ ] `git log --oneline --merges main` shows the `feat/tlk-model`, `feat/tlk-crud`, `feat/tlk-borang-tempahan` merges; `git status --short` is empty.
