# Lab Hari 5 — Modul TLK (Bahagian 1)

[⬅️ README Hari 5](./README.md) · [📘 SPEC](../docs/spesifikasi-sistem.md) · 🧩 Template kod (modul **Templat & Rujukan**) · [⚡ Arahan spark](../docs/arahan-spark.md)

> **Peraturan lab:** kerja individu dalam `kelas-ci-<nama>`; tunjuk output kepada jurulatih atau rakan sebelah sebelum menanda. **Cuba manual dahulu** — baca mesej ralat penuh (Whoops page menunjukkan fail & baris). Selepas 10 minit buntu: tanya jurulatih atau guna AI untuk *menerangkan* ralat. Template `templates/kod/*.php.txt` untuk **menyemak** selepas anda cuba.

| Lab | Sesi | Branch | Hasil |
|-----|------|--------|-------|
| 5.1 | S1 09:00–10:30 | `feat/tlk-model` | Enum, Entity, 5 Model, ujian unit |
| 5.2 | S2 10:45–12:30 | `feat/tlk-crud` | CRUD slot admin + senarai tempahan berpagination |
| 5.3 | S3 14:30–16:00 | `feat/tlk-borang-tempahan` | Borang + validasi + `TLK-2026-0001` |
| 5.4 | S4 16:00–17:00 | — | `docs/ujian-manual-tlk.md` |

---

## Lab 5.1 — Enum, Entity & Model (S1)

### 🎯 Objektif
Menulis enum `BookingStatus` & `SlotCategory`, Entity `SlotBooking` dan Model TLK dengan `$allowedFields` + `$validationRules`, dibuktikan oleh ujian unit.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Hari 4 selesai: 10 migration + seeder, log masuk berfungsi
- `git switch main && git pull && git switch -c feat/tlk-model`

### Langkah

1. Cipta folder yang belum wujud dalam appstarter:

   ```bash
   mkdir -p app/Enums app/Entities app/Services app/Validation tests/tlk
   ```

2. `app/Enums/BookingStatus.php` — tulis berdasarkan README §1.1. Lengkapkan dua kaedah yang tidak ditunjukkan penuh:

   ```php
   /** @return list<self> */
   public function allowedTransitions(): array
   {
       return match ($this) {
           self::Pending  => [self::Approved, self::Rejected],
           self::Approved => [self::Cancelled, self::Expired],
           self::Rejected, self::Cancelled, self::Expired => [],   // status akhir
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

   Tambah juga `isFinal(): bool` (pulang `true` jika `allowedTransitions()` kosong).

3. `app/Enums/SlotCategory.php` — 5 kes SPEC (`Oku='oku'`, `Mengandung='mengandung'`, `PegawaiKanan='pegawai_kanan'`, `KenderaanRasmi='kenderaan_rasmi'`, `PelawatVip='pelawat_vip'`) dengan:
   - `label()` → `OKU`, `Ibu Mengandung`, `Pegawai Kanan`, `Kenderaan Rasmi`, `Pelawat VIP`
   - `icon()` → `bi-person-wheelchair`, `bi-heart-pulse`, `bi-person-badge`, `bi-car-front`, `bi-star`
   - `static options(): array` dan `static inList(): string` yang memulangkan `'in_list[oku,mengandung,pegawai_kanan,kenderaan_rasmi,pelawat_vip]'` (petua: `array_column(self::cases(), 'value')`)

4. `app/Entities/SlotBooking.php` — README §1.2. Kaedah `durationDays()`:

   ```php
   public function durationDays(): int
   {
       $start = new \DateTimeImmutable((string) $this->attributes['start_date']);
       $end   = new \DateTimeImmutable((string) $this->attributes['end_date']);

       return $start->diff($end)->days + 1;   // hari kalendar termasuk hari pertama & terakhir
   }
   ```

   > ℹ️ `durationDays()` ialah tempoh **paparan** (inklusif, +1): tempahan maksimum 2026-10-01 → 2026-12-30 dipapar *91 hari*. BR-TLK-03 pula menyemak `end_date − start_date ≤ 90` (beza tarikh, tanpa +1) — jangan guna `durationDays()` untuk peraturan itu.

   Tambah juga `isActive(): bool` (status dalam `BookingStatus::active()`).

5. Ujian unit **tanpa DB** — `tests/tlk/BookingStatusTest.php`:

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
           $this->assertNull(BookingStatus::tryFrom('diluluskan'));   // label BM BUKAN nilai DB
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

6. Model — jana dan isi:

   ```bash
   php spark make:model ParkingSlotModel --table parking_slots
   php spark make:model VehicleModel
   php spark make:model SlotBookingModel --table slot_bookings
   ```

   > `DepartmentModel` dan `ParkingZoneModel` sudah wujud dari Lab 3.3–3.4 — buka dan tambah sahaja kaedah dalam jadual di bawah. Tanpa `--table`, nama jadual lalai salah (`parkingslots`); lihat [Arahan spark](../docs/arahan-spark.md).

   > `make:model` menjana banyak tetapan lalai. **Padam** yang tidak digunakan supaya anda boleh membaca Model dalam satu skrin.

   | Model | `$returnType` | Tetapan khas | Kaedah tambahan |
   |-------|---------------|--------------|-----------------|
   | `DepartmentModel` | `array` | — | — |
   | `ParkingZoneModel` | `array` | — | `dropdown(): array` → `[id => 'A — Blok Utama']` |
   | `ParkingSlotModel` | `array` | `$useSoftDeletes = true` | `withZone()`, `activeDropdown()`, `isSlotNoTaken()` |
   | `VehicleModel` | `array` | — | `dropdownForUser(int $userId)` |
   | `SlotBookingModel` | `SlotBooking::class` | — | `listing()`, `findDetailed(int $id)` |

   `ParkingSlotModel` — bahagian utama:

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

   /** UNIQUE(zone_id, slot_no) — is_unique CI4 hanya menyemak satu lajur */
   public function isSlotNoTaken(int $zoneId, string $slotNo, ?int $ignoreId = null): bool
   {
       $builder = $this->withDeleted()->where('zone_id', $zoneId)->where('slot_no', $slotNo);

       if ($ignoreId !== null) {
           $builder->where('id !=', $ignoreId);
       }

       return $builder->countAllResults() > 0;
   }

   /** [id => 'A / A-01 (OKU)'] — slot aktif sahaja, untuk borang tempahan */
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

   `SlotBookingModel` — README §1.3 (termasuk `listing()`), ditambah:

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
- `composer test -- --no-coverage tests/tlk/BookingStatusTest.php` → `OK (5 tests, …)` (`OK (6 tests, …)` jika ujian cabaran ⭐ ditambah).
- Anda boleh menjawab: *"Kenapa `status` ada dalam `$allowedFields` tetapi pemohon tidak boleh menetapkannya?"* (README §1.3).
- Bandingkan dengan `BookingStatus.php.txt` (modul **Templat & Rujukan**), `SlotCategory.php.txt` (modul **Templat & Rujukan**), `SlotBooking-Entity.php.txt` (modul **Templat & Rujukan**), `SlotBookingModel.php.txt` (modul **Templat & Rujukan**).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Class "App\Enums\BookingStatus" not found` | Nama fail ≠ nama enum, atau `namespace` salah | Fail `app/Enums/BookingStatus.php`, `namespace App\Enums;` |
| `UnhandledMatchError` | `match` tidak meliputi semua kes | Tambah kes yang hilang — ini sebenarnya **ciri keselamatan** enum |
| `"diluluskan" is not a valid backing value` | `from()` diberi label, bukan nilai | Guna nilai (`approved`) atau `tryFrom()` untuk input pengguna |
| `No code coverage driver available` (amaran) | Xdebug/PCOV tiada | Tambah `--no-coverage` |
| `make:model` menanya "Model class name" | Arahan tanpa argumen | `php spark make:model NamaModel` |

### ⭐ Cabaran tambahan
- Tambah ujian: setiap `BookingStatus::cases()` mempunyai `label()` bukan kosong dan `badge()` dalam senarai warna Bootstrap yang sah.
- Tambah `DepartmentModel::dropdown()` dan `phone` pada profil pengguna (paparan sahaja).

---

## Lab 5.2 — CRUD Slot (admin) & Senarai Tempahan (S2)

### 🎯 Objektif
Membina `Admin/SlotController` (senarai, tambah, ubah, padam lembut) dan `Tlk/BookingController::index` berpagination yang diskop kepada pemilik.

### Prasyarat
- Lab 5.1 checkpoint lulus dan di-merge: `git switch main && git merge --no-ff feat/tlk-model`
- `git switch -c feat/tlk-crud`

### Langkah

1. `app/Config/Routes.php` — tambah **selepas** `service('auth')->routes($routes);`:

   ```php
   // (baris `use CodeIgniter\Router\RouteCollection;` sudah ada di atas fail)

   // TLK: tempahan (pemohon)
   $routes->group('tlk/tempahan', ['namespace' => 'App\Controllers\Tlk', 'filter' => 'session'], static function (RouteCollection $routes): void {
       $routes->get('/', 'BookingController::index', ['as' => 'tlk.index']);
   });

   // Admin — CRUD slot
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

       private function save(?int $id): RedirectResponse
       {
           // README §2.2 — tulis kaedah save(): getPost() senarai putih → validateData()
           // dengan peraturan Model → isSlotNoTaken() + $this->validator->setError() → insert/update
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

   > Atribut `data-confirm` akan diaktifkan oleh skrip layout pada Hari 6 S4. Hari ini padam berlaku terus.

4. `app/Views/admin/slot/form.php` — gunakan `form_dropdown()` (helper `form` dimuat dalam `BaseController`) dan `old()`:

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

5. `app/Controllers/Tlk/BookingController.php` — kaedah `index()` dari README §2.3 (kelas `BookingController extends BaseController`, namespace `App\Controllers\Tlk`).

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

   > `url_to('tlk.show', …)` akan ralat sehingga route `tlk.show` ditambah dalam Lab 5.3. Sementara itu, gantikan dengan `#` **atau** teruskan ke Lab 5.3 langkah 1 dahulu.

7. Uji:

   ```bash
   php spark routes | grep -E "admin/slot|tlk/tempahan"
   php spark serve
   ```

8. Commit: `git add app/ && git commit -m "TLK: CRUD slot admin + senarai tempahan berpagination"`.

### ✅ Checkpoint
- Log masuk `admin@latihan.test` → `http://localhost:8080/admin/slot` → 10 slot + pautan halaman `2` (12 slot seeder).
- Tambah `A-05` / Zon A / OKU → flash *"Slot A-05 telah disimpan."*. Tambah `A-05` / Zon A sekali lagi → *"No. slot ini sudah wujud dalam zon tersebut."*. Tambah `A-05` / Zon **B** → berjaya.
- Padam `A-05` Zon B → hilang dari senarai; `php spark db:table parking_slots --desc --limit-rows 2` menunjukkan `deleted_at` berisi.
- Log masuk `pemohon1@latihan.test` → buka `/admin/slot` → dialih ke `/` (Shield: tiada kebenaran group).
- `/tlk/tempahan` sebagai pemohon1 → jadual kosong *"Tiada tempahan."* (belum ada tempahan).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `404 Controller or its method is not found: \App\Controllers\Admin\SlotController::index` | Namespace/folder salah | Fail `app/Controllers/Admin/SlotController.php`, `namespace App\Controllers\Admin;` |
| `Call to undefined function form_dropdown()` | Helper `form` tidak dimuat | `BaseController::initController()` → `$this->helpers = ['form', 'url'];` |
| `The action you requested is not allowed.` | `csrf_field()` tertinggal dalam borang | Tambah dalam setiap `<form method="post">` |
| `Too few arguments to function … edit(), 0 passed` | Route tanpa `/$1` | `'SlotController::edit/$1'` |
| Kotak "Slot aktif" tidak boleh dinyahtanda | Checkbox tidak dihantar bila tidak ditanda | `is_active = getPost('is_active') === '1' ? 1 : 0` |
| `Unknown column 'deleted_at'` pada model lain | `$useSoftDeletes = true` disalin ke Model yang jadualnya tiada `deleted_at` | Hanya `ParkingSlotModel` |

### ⭐ Cabaran tambahan
- CRUD zon (`Admin/ZoneController`) — halang padam zon yang masih ada slot (FK `RESTRICT` akan membaling ralat DB; tangkap dan papar mesej BM).
- Filter kategori pada `/admin/slot?category=oku`.

---

## Lab 5.3 — Borang Tempahan, Validasi & `TLK-2026-0001` (S3)

### 🎯 Objektif
Membina borang tempahan dengan validasi server (termasuk BR-TLK-03), `ReferenceNumberService`, `BookingService` v1, dan menjana `TLK-2026-0001`.

### Prasyarat
- Lab 5.2 di-merge; `git switch -c feat/tlk-borang-tempahan`

### Langkah

1. Tambah route dalam kumpulan `tlk/tempahan`:

   ```php
   $routes->get('new', 'BookingController::new', ['as' => 'tlk.new', 'filter' => 'permission:tlk.apply']);
   $routes->post('/', 'BookingController::create', ['as' => 'tlk.create', 'filter' => 'permission:tlk.apply']);
   $routes->get('(:num)', 'BookingController::show/$1', ['as' => 'tlk.show']);
   ```

   > Filter `permission:tlk.apply` pada route **ditambah** kepada filter `session` kumpulan. Pelulus (tiada `tlk.apply`) tidak boleh memohon.

2. `app/Validation/BookingRules.php` — README §3.2. Kaedah `parse()`:

   ```php
   private function parse(?string $value): ?\DateTimeImmutable
   {
       if ($value === null || $value === '') {
           return null;
       }

       $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);   // '!' = masa 00:00:00

       return $date === false ? null : $date;
   }
   ```

   Daftar dalam `app/Config/Validation.php`:

   ```php
   public array $ruleSets = [
       Rules::class,
       FormatRules::class,
       FileRules::class,
       CreditCardRules::class,
       \App\Validation\BookingRules::class,   // ← tambah
   ];
   ```

3. `app/Services/ReferenceNumberService.php` — tulis dari README §3.3 (konstruktor menerima `?BaseConnection $db = null` dan guna `db_connect()` jika null). Semak dengan `ReferenceNumberService.php.txt` (modul **Templat & Rujukan**).

4. `app/Services/BookingService.php` — **versi 1** (esok dinaik taraf):

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
    * VERSI 1 (Hari 5) — sengaja belum lengkap.
    * Hari 6: transaksi, kunci baris, BR-TLK-01/04 dan status_logs.
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
               'user_id'    => $userId,                 // dari sesi, BUKAN dari borang
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

5. Daftar service — gantikan `app/Config/Services.php`:

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

           // db_connect() = sambungan DIKONGSI → transaksi bersarang pada sambungan sama (Hari 6)
           return new BookingService(refNumbers: new ReferenceNumberService(db_connect()));
       }
   }
   ```

6. `BookingController` — tambah `new()`, `create()` (README §3.2 + §3.4, termasuk array `$messages` BM untuk setiap peraturan) dan `show()`:

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

       if ($booking === null || ! $booking->isOwnedBy(auth()->id())) {   // semakan PEMILIKAN
           throw PageNotFoundException::forPageNotFound('Tempahan tidak dijumpai.');
       }

       return view('tlk/booking/show', ['title' => 'Tempahan ' . $booking->ref_no, 'booking' => $booking]);
   }
   ```

   Contoh `$messages` untuk `end_date`:

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

8. `app/Views/tlk/booking/show.php` (versi Hari 5 — sejarah status ditambah esok):

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

9. Uji: log masuk `pemohon1@latihan.test` → `http://localhost:8080/tlk/tempahan/new` → isi slot A-01, kenderaan `WXX 1234`, tarikh mula esok, tamat +7 hari, sebab ≥ 10 aksara → **Hantar**.

10. Commit: `TLK: borang tempahan + validasi BR-TLK-03 + ReferenceNumberService`.

### ✅ Checkpoint
- Selepas hantar: dialih ke `/tlk/tempahan/1` dengan flash *"Permohonan TLK-2026-0001 telah dihantar."* (tahun ikut tarikh semasa).
- DB:

  ```bash
  php spark db:table slot_bookings
  php spark db:table reference_sequences
  ```

  → `ref_no = TLK-2026-0001`, `status = pending`; `reference_sequences`: `TLK | 2026 | 1`.
- Hantar tempahan kedua (slot lain) → `TLK-2026-0002`.
- Tarikh mula semalam → mesej *"Tarikh mula tidak boleh pada masa lalu."* di bawah medan, nilai lain dikekalkan.
- Tarikh tamat = mula + 91 hari → *"Tarikh tamat tidak boleh melebihi 90 hari selepas tarikh mula."*; + 90 hari → diterima.
- Log masuk `pelulus@latihan.test` → `/tlk/tempahan/new` → dialih (tiada `tlk.apply`).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `"not_past_date" is not a valid rule` | `BookingRules` belum didaftar | `app/Config/Validation.php` → `$ruleSets` |
| Mesej validasi dalam Inggeris ("The start_date field …") | `$messages` tidak dihantar atau kunci salah | `$this->validate($rules, $messages)`; kunci = nama peraturan tepat |
| Ralat tidak dipapar di bawah medan | Guna `->with('errors', …)` atau bergantung pada ralat Model (`$model->errors()`) | Validasi dalam controller (`validate()`/`validateData()`), kemudian `redirect()->back()->withInput()` — CI4 membawa ralat **validator controller** secara automatik; view guna `validation_show_error()` |
| `Call to undefined function validation_show_error()` | CI < 4.3 atau helper `form` tidak dimuat | Pastikan CI ≥ 4.6 dan helper `form` |
| `Call to a member function next() on null` / `Service bookingService not found` | `Config\Services` tidak dikemas kini | Langkah 5 |
| `Unknown column 'year'` / sintaks ralat SQL | Guna `{$table}` tanpa `prefixTable()` dan ada `DBPrefix` | Guna `$this->db->prefixTable('reference_sequences')` |
| `ref_no` sentiasa `TLK-2026-0001` → `Duplicate entry` | `UPDATE` tidak berlaku (tiada `where('id', …)`), atau transaksi tidak commit | Semak langkah 3 dan `transCommit()` |

### ⭐ Cabaran tambahan
- Tambah `SlotCategory` pada dropdown slot dengan `<optgroup>` ikut zon.
- Buka **dua tab** pelayar sebagai `pemohon1` dan `pemohon2`, hantar slot A-01 tarikh sama dalam kedua-dua. Apa berlaku? Catat sebagai pepijat untuk Hari 6 (BR-TLK-01 belum dikuatkuasa — **ini dijangka**).

---

## Lab 5.4 — Ujian Manual & Rekod Pepijat (S4)

### 🎯 Objektif
Melaksanakan senarai ujian manual TLK secara sistematik dan merekod pepijat dengan langkah boleh diulang.

### Prasyarat
- Lab 5.1–5.3 di-merge ke `main`; `php spark db:seed DatabaseSeeder` (data asas lengkap)
- Dua pelayar (atau satu biasa + satu incognito)

### Langkah

1. Cipta `docs/ujian-manual-tlk.md` dengan jadual ini dan laksanakan **setiap** kes. Isi lajur *Sebenar* & *Status* (✅ lulus / ❌ gagal / ⏭️ belum dilaksana).

   | ID | Peranan | Langkah | Jangkaan | Sebenar | Status |
   |----|---------|---------|----------|---------|--------|
   | TM-TLK-01 | admin | Buka `/admin/slot` | 10 slot + halaman 2 | | |
   | TM-TLK-02 | admin | Tambah `A-06` Zon A kategori `mengandung` | Flash berjaya; muncul dalam senarai | | |
   | TM-TLK-03 | admin | Tambah `A-06` Zon A sekali lagi | Mesej "sudah wujud dalam zon"; tiada baris baharu | | |
   | TM-TLK-04 | admin | Tambah slot tanpa memilih kategori | "Sila pilih kategori."; nilai lain kekal | | |
   | TM-TLK-05 | admin | Padam `A-06` | Hilang dari senarai; `deleted_at` berisi | | |
   | TM-TLK-06 | pemohon1 | Buka `/admin/slot` terus | Dialih ke `/` (tiada akses) | | |
   | TM-TLK-07 | pemohon1 | Hantar tempahan sah | `TLK-YYYY-NNNN` baharu, status *Menunggu* | | |
   | TM-TLK-08 | pemohon1 | Tarikh mula = semalam | Mesej masa lalu; tiada baris baharu | | |
   | TM-TLK-09 | pemohon1 | Tarikh tamat < tarikh mula | Mesej "sama atau selepas" | | |
   | TM-TLK-10 | pemohon1 | Tamat = mula + 91 hari | Mesej 90 hari | | |
   | TM-TLK-11 | pemohon1 | Sebab 5 aksara | Mesej min 10 aksara | | |
   | TM-TLK-12 | pemohon1 | DevTools: tukar `value` pilihan kenderaan kepada ID kenderaan pemohon2 (`3`), hantar | "Kenderaan … bukan milik anda." | | |
   | TM-TLK-13 | pemohon2 | Buka `/tlk/tempahan/1` (milik pemohon1) | 404 | | |
   | TM-TLK-14 | pemohon1 | DevTools: padam input `csrf_test_name`, hantar | "The action you requested is not allowed." | | |
   | TM-TLK-15 | pemohon1 | `/tlk/tempahan?status=xyz` | Filter diabaikan; semua tempahan sendiri dipapar | | |
   | TM-TLK-16 | pemohon1 & 2 | Dua tempahan slot A-01, tarikh bertindih | **Dijangka gagal hari ini** (BR-TLK-01 esok) | | |

2. Untuk setiap ❌, tulis laporan pepijat (format README §4.3) di bahagian bawah fail yang sama.

3. Baiki pepijat **Tinggi/Sederhana** yang sempat (satu branch `fix/…` setiap pepijat; commit `FIX: …`). Pepijat TM-TLK-16 **jangan** dibaiki hari ini.

4. Wrap-up: commit `docs/ujian-manual-tlk.md` dengan `TLK: rekod ujian manual Hari 5`.

### ✅ Checkpoint
- `docs/ujian-manual-tlk.md` — 16 kes, setiap satu ada status; ≥ 14 ✅ (TM-TLK-16 ❌ dijangka).
- Sekurang-kurangnya **satu** laporan pepijat lengkap dengan langkah menghasilkan semula (TM-TLK-16 dikira).
- `git log --oneline main` menunjukkan merge `feat/tlk-model`, `feat/tlk-crud`, `feat/tlk-borang-tempahan`.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Tidak dapat log masuk dua pengguna serentak | Sesi dikongsi dalam satu pelayar | Guna tetingkap incognito atau pelayar kedua |
| TM-TLK-12 berjaya (tidak sepatutnya) | `BookingService` tidak menyemak pemilikan kenderaan | Semak langkah 4 Lab 5.3 |
| TM-TLK-13 memaparkan tempahan | `show()` tiada semakan `isOwnedBy()` | Tambah semakan → `PageNotFoundException` |

### ⭐ Cabaran tambahan
Tukar TM-TLK-08 hingga TM-TLK-11 menjadi ujian PHPUnit untuk `BookingRules` (tanpa DB): `(new BookingRules())->max_period_days('2026-12-31', 'start_date,90', ['start_date' => '2026-10-01'])` → `false`.

---

## Semakan kendiri — akhir hari

```bash
composer test -- --no-coverage tests/tlk/BookingStatusTest.php   # OK (5 tests, …)
git log --oneline --merges main -3                               # 3 merge feat/tlk-*
git status --short                                               # tiada output
```

- [ ] Sebagai `admin@latihan.test`, `/admin/slot` memaparkan senarai slot berpagination; tambah & padam slot berfungsi (TM-TLK-01 hingga 05).
- [ ] Sebagai `pemohon1@latihan.test`, borang tempahan sah menghasilkan `TLK-YYYY-NNNN` baharu berstatus *Menunggu* di `/tlk/tempahan`.
- [ ] BR-TLK-03: tamat = mula + 91 hari ditolak; tamat = mula + 90 hari diterima; tarikh mula semalam ditolak.
- [ ] `composer test -- --no-coverage tests/tlk/BookingStatusTest.php` → `OK (5 tests, …)` (6 dengan ⭐).
- [ ] `docs/ujian-manual-tlk.md` ada 16 kes berstatus (≥ 14 ✅) dan ≥ 1 laporan pepijat (TM-TLK-16).
- [ ] `git log --oneline --merges main` menunjukkan merge `feat/tlk-model`, `feat/tlk-crud`, `feat/tlk-borang-tempahan`; `git status --short` kosong.
