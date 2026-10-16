# Lab Day 5 — TLK Module (Part 1)

[⬅️ README Day 5](./README.md) · [📘 SPEC](../docs/spesifikasi-sistem.md) · 🧩 Code templates (**Templat & Rujukan** module)

> **Lab rules:** the navigator reads the steps & SPEC, the driver types. **Try it by hand first** — read the full error message (the Whoops page shows the file & line). After 10 minutes stuck: ask the trainer or use AI to *explain* the error. The `templates/kod/*.php.txt` templates are for **checking** after you have tried.

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

2. `app/Enums/BookingStatus.php` — write it based on README §1.1. Complete the two methods that are not shown in full:

   ```php
   /** @return list<self> */
   public function allowedTransitions(): array
   {
       return match ($this) {
           self::Pending  => [self::Approved, self::Rejected],
           self::Approved => [self::Cancelled, self::Expired],
           self::Rejected, self::Cancelled, self::Expired => [],   // final statuses
       };
   }

   /** @return array<string, string> ['pending' => 'Menunggu', ...] */
   public static function options(): array
   {
       $options = [];
       foreach (self::cases() as $case) {
           $options[$case->value] = $case->label();
       }
       return $options;
   }
   ```

   Also add `isFinal(): bool` (returns `true` if `allowedTransitions()` is empty).

3. `app/Enums/SlotCategory.php` — the 5 SPEC cases (`Oku='oku'`, `Mengandung='mengandung'`, `PegawaiKanan='pegawai_kanan'`, `KenderaanRasmi='kenderaan_rasmi'`, `PelawatVip='pelawat_vip'`) with:
   - `label()` → `OKU`, `Ibu Mengandung`, `Pegawai Kanan`, `Kenderaan Rasmi`, `Pelawat VIP`
   - `icon()` → `bi-person-wheelchair`, `bi-heart-pulse`, `bi-person-badge`, `bi-car-front`, `bi-star`
   - `static options(): array` and `static inList(): string`, which returns `'in_list[oku,mengandung,pegawai_kanan,kenderaan_rasmi,pelawat_vip]'` (tip: `array_column(self::cases(), 'value')`)

4. `app/Entities/SlotBooking.php` — README §1.2. The `durationDays()` method:

   ```php
   public function durationDays(): int
   {
       $start = new \DateTimeImmutable((string) $this->attributes['start_date']);
       $end   = new \DateTimeImmutable((string) $this->attributes['end_date']);

       return $start->diff($end)->days + 1;   // calendar days, including the first & last day
   }
   ```

   > ℹ️ `durationDays()` is the **display** duration (inclusive, +1): the maximum booking 2026-10-01 → 2026-12-30 shows *91 hari*. BR-TLK-03 instead checks `end_date − start_date ≤ 90` (date difference, no +1) — do not use `durationDays()` for that rule.

   Also add `isActive(): bool` (status is in `BookingStatus::active()`).

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
   php spark make:model DepartmentModel
   php spark make:model ParkingZoneModel
   php spark make:model ParkingSlotModel
   php spark make:model VehicleModel
   php spark make:model SlotBookingModel
   ```

   > `make:model` generates many default settings. **Delete** the ones you don't use so you can read the Model on one screen.

   | Model | `$returnType` | Special settings | Extra methods |
   |-------|---------------|--------------|-----------------|
   | `DepartmentModel` | `array` | — | — |
   | `ParkingZoneModel` | `array` | — | `dropdown(): array` → `[id => 'A — Blok Utama']` |
   | `ParkingSlotModel` | `array` | `$useSoftDeletes = true` | `withZone()`, `activeDropdown()`, `isSlotNoTaken()` |
   | `VehicleModel` | `array` | — | `dropdownForUser(int $userId)` |
   | `SlotBookingModel` | `SlotBooking::class` | — | `listing()`, `findDetailed(int $id)` |

   `ParkingSlotModel` — the main parts:

   ```php
   protected $table          = 'parking_slots';
   protected $returnType     = 'array';
   protected $useSoftDeletes = true;
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

   /** UNIQUE(zone_id, slot_no) — CI4's is_unique only checks one column */
   public function isSlotNoTaken(int $zoneId, string $slotNo, ?int $ignoreId = null): bool
   {
       $builder = $this->withDeleted()->where('zone_id', $zoneId)->where('slot_no', $slotNo);

       if ($ignoreId !== null) {
           $builder->where('id !=', $ignoreId);
       }

       return $builder->countAllResults() > 0;
   }

   /** [id => 'A / A-01 (OKU)'] — active slots only, for the booking form */
   public function activeDropdown(): array
   {
       $options = [];

       foreach ($this->withZone()->where('parking_slots.is_active', 1)->findAll() as $row) {
           $options[$row['id']] = sprintf('%s / %s (%s)', $row['zone_code'], $row['slot_no'],
               \App\Enums\SlotCategory::from($row['category'])->label());
       }

       return $options;
   }
   ```

   `VehicleModel::dropdownForUser()`:

   ```php
   public function dropdownForUser(int $userId): array
   {
       $options = [];

       foreach ($this->where('user_id', $userId)->orderBy('plate_no')->findAll() as $v) {
           $options[$v['id']] = $v['plate_no'] . ' — ' . $v['model'];
       }

       return $options;
   }
   ```

   `SlotBookingModel` — README §1.3 (including `listing()`), plus:

   ```php
   public function findDetailed(int $id): ?SlotBooking
   {
       return $this->listing()->where('slot_bookings.id', $id)->first();
   }
   ```

7. Commit:

   ```bash
   git add app/Enums app/Entities app/Models tests/tlk
   git commit -m "TLK: enum BookingStatus/SlotCategory, entity SlotBooking, model TLK"
   ```

### ✅ Checkpoint
- `composer test -- --no-coverage tests/tlk/BookingStatusTest.php` → `OK (5 tests, …)` (`OK (6 tests, …)` if the ⭐ challenge test is added).
- The navigator can answer: *"Why is `status` in `$allowedFields` even though the applicant cannot set it?"* (README §1.3).
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

2. `app/Controllers/Admin/SlotController.php`:

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
           $this->slots->delete($id);   // soft delete → deleted_at is filled in

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

       private function save(?int $id): RedirectResponse
       {
           // README §2.2 — write the save() method: whitelisted getPost() → validateData()
           // with the Model's rules → isSlotNoTaken() + $this->validator->setError() → insert/update
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

5. `app/Controllers/Tlk/BookingController.php` — the `index()` method from README §2.3 (class `BookingController extends BaseController`, namespace `App\Controllers\Tlk`).

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

2. `app/Validation/BookingRules.php` — README §3.2. The `parse()` method:

   ```php
   private function parse(?string $value): ?\DateTimeImmutable
   {
       if ($value === null || $value === '') {
           return null;
       }

       $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);   // '!' = time 00:00:00

       return $date === false ? null : $date;
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

3. `app/Services/ReferenceNumberService.php` — write it from README §3.3 (the constructor takes `?BaseConnection $db = null` and uses `db_connect()` if null). Check it against `ReferenceNumberService.php.txt` (**Templat & Rujukan** module).

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

6. `BookingController` — add `new()`, `create()` (README §3.2 + §3.4, including a Malay `$messages` array for every rule) and `show()`:

   ```php
   public function new(): string
   {
       return view('tlk/booking/form', [
           'title'    => 'Mohon Slot Letak Kenderaan Khas',
           'vehicles' => model(VehicleModel::class)->dropdownForUser(auth()->id()),
           'slots'    => model(ParkingSlotModel::class)->activeDropdown(),
       ]);
   }

   public function show(int $id): string
   {
       $booking = model(SlotBookingModel::class)->findDetailed($id);

       if ($booking === null || ! $booking->isOwnedBy(auth()->id())) {   // OWNERSHIP check
           throw PageNotFoundException::forPageNotFound('Tempahan tidak dijumpai.');
       }

       return view('tlk/booking/show', ['title' => 'Tempahan ' . $booking->ref_no, 'booking' => $booking]);
   }
   ```

   Example `$messages` for `end_date`:

   ```php
   'end_date' => [
       'required'         => 'Tarikh tamat wajib diisi.',
       'valid_date'       => 'Format tarikh tamat tidak sah.',
       'date_on_or_after' => 'Tarikh tamat mesti sama atau selepas tarikh mula.',
       'max_period_days'  => 'Tarikh tamat tidak boleh melebihi 90 hari selepas tarikh mula.',
   ],
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
