# Lab Hari 5 — Modul TLK (Bahagian 1)

[⬅️ README](./README.md) · [Jadual](../JADUAL.md) · [Kanun SPEC](../docs/spesifikasi-sistem.md) · 🧩 Template kod (modul **Templat & Rujukan**) · [⚡ Arahan spark](../docs/arahan-spark.md)

| Lab | Sesi | Branch | Hasil |
|-----|------|--------|-------|
| 5.1 | S1 09:00–10:00 | `feat/tlk-model` | Enum, Entity, 5 Model, ujian unit |
| 5.1b | S5 10:00–10:30 | `feat/tlk-model` | Peraturan Model zon & kenderaan, `normalisePlate()` + ujian unit |
| 5.2 | S2 10:45–12:00 | `feat/tlk-crud` | CRUD slot admin + senarai tempahan berpagination |
| 5.2b | S6 12:00–12:30 | `feat/tlk-crud` | CRUD zon admin `/admin/slot/zon` |
| 5.3 | S3 14:30–15:30 | `feat/tlk-borang-tempahan` | Borang + validasi + `TLK-2026-0001` |
| 5.3b | S7 15:30–16:00 | `feat/tlk-borang-tempahan` | Borang daftar kenderaan `/kenderaan` + `VehicleRules` |
| 5.4 | S4 16:00–16:35 | — | `docs/ujian-manual-tlk.md` |
| 5.4b | S8 16:35–17:00 | — | `docs/ujian-manual-zon-kenderaan.md` + BUG-ZON-001 |

---

## Lab 5.1 — Enum, Entity & Model (S1)

### 🎯 Objektif
Menulis enum `BookingStatus` & `SlotCategory`, Entity `SlotBooking` dan Model TLK dengan `$allowedFields` + `$validationRules`, dibuktikan oleh ujian unit.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- Hari 4 selesai: 10 migration + seeder, log masuk berfungsi
- `git switch main && git pull && git switch -c feat/tlk-model` (PowerShell: jalankan `git switch main`, `git pull` dan `git switch -c` satu demi satu)

### Langkah

1. Cipta folder yang belum wujud dalam appstarter:

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p app/Enums app/Entities app/Services app/Validation tests/tlk
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force app/Enums, app/Entities, app/Services, app/Validation, tests/tlk | Out-Null
   ```

2. **Enum `BookingStatus`** — README §1.1, lengkap dengan `allowedTransitions()`, `isFinal()` (pulang `true` jika `allowedTransitions()` kosong) dan `options()`:

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

3. **Enum `SlotCategory`** — 5 kes SPEC dengan `label()`, `icon()` (Bootstrap Icons), `options()` untuk dropdown dan `inList()` yang memulangkan `'in_list[oku,mengandung,pegawai_kanan,kenderaan_rasmi,pelawat_vip]'` untuk peraturan validasi:

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

4. **Entity `SlotBooking`** — README §1.2, lengkap dengan `isActive()` (status dalam `BookingStatus::active()`) dan `durationDays()`:

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

   > ⚠️ `durationDays()` ialah tempoh **paparan** (inklusif, +1): tempahan maksimum 2026-10-01 → 2026-12-30 dipapar *91 hari*. BR-TLK-03 pula menyemak `end_date − start_date ≤ 90` (beza tarikh, tanpa +1) — jangan guna `durationDays()` untuk peraturan itu.

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

   `--table` perlu bagi `ParkingSlotModel` dan `SlotBookingModel` — tanpanya nama jadual lalai salah (`parkingslots`). **Gantikan** seluruh kandungan setiap fail yang dijana dengan kod di bawah. `DepartmentModel` (Lab 3.3) tidak berubah; `ParkingZoneModel` (Lab 3.4) hanya ditambah `dropdown()`, jadi gantikan dengan versi di bawah (`cari()` dikekalkan).

   | Model | `$returnType` | Tetapan khas | Kaedah tambahan |
   |-------|---------------|--------------|-----------------|
   | `DepartmentModel` | `array` | — | — |
   | `ParkingZoneModel` | `array` | — | `dropdown(): array` → `[id => 'A — Blok Utama']` |
   | `ParkingSlotModel` | `array` | `$useSoftDeletes = true` | `withZone()`, `activeDropdown()`, `isSlotNoTaken()` |
   | `VehicleModel` | `array` | — | `dropdownForUser(int $userId)` |
   | `SlotBookingModel` | `SlotBooking::class` | — | `listing()`, `findDetailed(int $id)` |

   `ParkingZoneModel` — `cari()` dari Lab 3.4 + `dropdown()` untuk borang slot:

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

   `ParkingSlotModel` — soft delete, peraturan Model dengan mesej BM, `withZone()`, `isSlotNoTaken()` dan `activeDropdown()`:

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

   `VehicleModel` — `dropdownForUser()` memulangkan kenderaan milik pengguna sahaja:

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

   `SlotBookingModel` — README §1.3 (termasuk `listing()`) ditambah `findDetailed()`:

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
- `composer test -- --no-coverage tests/tlk/BookingStatusTest.php` → `OK (5 tests, …)` (`OK (6 tests, …)` jika ujian cabaran ⭐ ditambah) (Kuiz S1).
- Anda boleh menjawab: *"Kenapa `status` ada dalam `$allowedFields` tetapi pemohon tidak boleh menetapkannya?"* (README §1.3) (Kuiz S1).
- Bandingkan dengan `BookingStatus.php.txt` (modul **Templat & Rujukan**), `SlotCategory.php.txt` (modul **Templat & Rujukan**), `SlotBooking-Entity.php.txt` (modul **Templat & Rujukan**), `SlotBookingModel.php.txt` (modul **Templat & Rujukan**) (Kuiz S1).

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
- Lab 5.1 dan 5.1b checkpoint lulus dan di-merge: `git switch main && git merge --no-ff feat/tlk-model` (PowerShell: jalankan `git switch main` dan `git merge` satu demi satu)
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

2. **Controller `Admin/SlotController`** — kaedah `save()` mengikut README §2.2: `getPost()` senarai putih → `validateData()` dengan peraturan Model → `isSlotNoTaken()` + `$this->validator->setError()` → insert/update:

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

   Atribut `data-confirm` hanya aktif pada Hari 6 S4; hari ini padam berlaku terus.

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

5. **Controller `Tlk/BookingController`** — kaedah `index()` dari README §2.3 sahaja buat masa ini (`new()`, `create()` dan `show()` ditambah dalam Lab 5.3):

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

   > ℹ️ `url_to('tlk.show', …)` akan ralat sehingga route `tlk.show` ditambah dalam Lab 5.3. Sementara itu, gantikan dengan `#` **atau** teruskan ke Lab 5.3 langkah 1 dahulu.

7. Uji:

   ```bash tab="Git Bash / macOS / Linux"
   php spark routes | grep -E "admin/slot|tlk/tempahan"
   php spark serve
   ```

   ```powershell tab="PowerShell"
   php spark routes | Select-String "admin/slot|tlk/tempahan"
   php spark serve
   ```

8. Commit: `git add app/ && git commit -m "TLK: CRUD slot admin + senarai tempahan berpagination"` (PowerShell: jalankan `git add` dan `git commit` satu demi satu).

### ✅ Checkpoint
- Log masuk `admin@latihan.test` → `http://localhost:8080/admin/slot` → 10 slot + pautan halaman `2` (12 slot seeder) (Kuiz S2).
- Tambah `A-05` / Zon A / OKU → flash *"Slot A-05 telah disimpan."*. Tambah `A-05` / Zon A sekali lagi → *"No. slot ini sudah wujud dalam zon tersebut."*. Tambah `A-05` / Zon **B** → berjaya (Kuiz S2).
- Padam `A-05` Zon B → hilang dari senarai; `php spark db:table parking_slots --desc --limit-rows 2` menunjukkan `deleted_at` berisi (Kuiz S2).
- Log masuk `pemohon1@latihan.test` → buka `/admin/slot` → dialih ke `/` (Shield: tiada kebenaran group) (Kuiz S2).
- `/tlk/tempahan` sebagai pemohon1 → jadual kosong *"Tiada tempahan."* (belum ada tempahan) (Kuiz S2).

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
- Susun `/admin/slot` ikut `?sort=slot_no` atau `?sort=category` dengan senarai putih (corak Lab 3.4b). CRUD zon dibina dalam [Lab 5.2b](#lab-52b--crud-zon-admin-s6).
- Filter kategori pada `/admin/slot?category=oku`.

---

## Lab 5.3 — Borang Tempahan, Validasi & `TLK-2026-0001` (S3)

### 🎯 Objektif
Membina borang tempahan dengan validasi server (termasuk BR-TLK-03), `ReferenceNumberService`, `BookingService` v1, dan menjana `TLK-2026-0001`.

### Prasyarat
- Lab 5.2 dan 5.2b di-merge (`git switch main && git merge --no-ff feat/tlk-crud`; PowerShell: jalankan `git switch main` dan `git merge` satu demi satu); `git switch -c feat/tlk-borang-tempahan`

### Langkah

1. Tambah route dalam kumpulan `tlk/tempahan`:

   ```php
   $routes->get('new', 'BookingController::new', ['as' => 'tlk.new', 'filter' => 'permission:tlk.apply']);
   $routes->post('/', 'BookingController::create', ['as' => 'tlk.create', 'filter' => 'permission:tlk.apply']);
   $routes->get('(:num)', 'BookingController::show/$1', ['as' => 'tlk.show']);
   ```

   Filter `permission:tlk.apply` **ditambah** kepada filter `session` kumpulan, jadi pelulus (tiada `tlk.apply`) tidak boleh memohon.

2. **Peraturan validasi `BookingRules`** — README §3.2, lengkap dengan `parse()`:

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

3. **Service `ReferenceNumberService`** — README §3.3. Konstruktor menerima `?BaseConnection $db = null` dan guna `db_connect()` jika null:

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

6. **`BookingController` lengkap** — gantikan fail Lab 5.2 dengan versi ini: `index()` kekal, ditambah `new()`, `create()` (README §3.2 + §3.4), `show()` dengan semakan pemilikan, serta `rules()` dan `messages()` (mesej BM untuk setiap peraturan):

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
- Selepas hantar: dialih ke `/tlk/tempahan/1` dengan flash *"Permohonan TLK-2026-0001 telah dihantar."* (tahun ikut tarikh semasa) (Kuiz S3).
- DB (Kuiz S3):

  ```bash
  php spark db:table slot_bookings
  php spark db:table reference_sequences
  ```

  → `ref_no = TLK-2026-0001`, `status = pending`; `reference_sequences`: `TLK | 2026 | 1`.
- Hantar tempahan kedua (slot lain) → `TLK-2026-0002` (Kuiz S3).
- Tarikh mula semalam → mesej *"Tarikh mula tidak boleh pada masa lalu."* di bawah medan, nilai lain dikekalkan (Kuiz S3).
- Tarikh tamat = mula + 91 hari → *"Tarikh tamat tidak boleh melebihi 90 hari selepas tarikh mula."*; + 90 hari → diterima (Kuiz S3).
- Log masuk `pelulus@latihan.test` → `/tlk/tempahan/new` → dialih (tiada `tlk.apply`) (Kuiz S3).

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
- Lab 5.1–5.3 dan 5.1b–5.3b di-merge ke `main` (`git switch main && git merge --no-ff feat/tlk-borang-tempahan`; PowerShell: jalankan `git switch main` dan `git merge` satu demi satu); `php spark db:seed DatabaseSeeder` (data asas lengkap)
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
- `docs/ujian-manual-tlk.md` — 16 kes, setiap satu ada status; ≥ 14 ✅ (TM-TLK-16 ❌ dijangka) (Kuiz S4).
- Sekurang-kurangnya **satu** laporan pepijat lengkap dengan langkah menghasilkan semula (TM-TLK-16 dikira) (Kuiz S4).
- `git log --oneline main` menunjukkan merge `feat/tlk-model`, `feat/tlk-crud`, `feat/tlk-borang-tempahan` (Kuiz S4).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Tidak dapat log masuk dua pengguna serentak | Sesi dikongsi dalam satu pelayar | Guna tetingkap incognito atau pelayar kedua |
| TM-TLK-12 berjaya (tidak sepatutnya) | `BookingService` tidak menyemak pemilikan kenderaan | Semak langkah 4 Lab 5.3 |
| TM-TLK-13 memaparkan tempahan | `show()` tiada semakan `isOwnedBy()` | Tambah semakan → `PageNotFoundException` |

### ⭐ Cabaran tambahan
Tukar TM-TLK-08 hingga TM-TLK-11 menjadi ujian PHPUnit untuk `BookingRules` (tanpa DB): `(new BookingRules())->max_period_days('2026-12-31', 'start_date,90', ['start_date' => '2026-10-01'])` → `false`.

---

## Lab 5.1b — Peraturan Model Zon & Kenderaan (S5)

### 🎯 Objektif
Menulis `$validationRules` dan `$validationMessages` BM untuk `ParkingZoneModel` (termasuk `is_unique` dengan `{id}`) dan `VehicleModel`, menambah kaedah pembantu `slotCount()` dan `VehicleModel::normalisePlate()`, kemudian membuktikannya dengan `Model::validate()` dalam `php spark shell` dan ujian unit tanpa DB. Lab 5.2b (CRUD zon) dan Lab 5.3b (borang kenderaan) bergantung pada kod ini.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 5.1](#lab-51--enum-entity--model-s1) checkpoint lulus; anda masih di branch `feat/tlk-model` (belum di-merge).
- `php spark shell` dari [Lab 3.2b](../hari-3/lab.md#lab-32b--query-builder-dalam-konsol-s6) berfungsi.

### Langkah

1. **`ParkingZoneModel`** — gantikan seluruh fail Lab 5.1. `cari()` dan `dropdown()` kekal; yang baharu ialah peraturan, mesej BM dan `slotCount()`:

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

       // Lab 5.1b: peraturan format zon. 'id' perlu ada peraturan kerana {id} digunakan dalam is_unique.
       protected $validationRules = [
           'id'       => 'permit_empty|is_natural_no_zero',
           'code'     => 'required|alpha_dash|max_length[10]|is_unique[parking_zones.code,id,{id}]',
           'name'     => 'required|max_length[100]',
           'location' => 'required|max_length[150]',
       ];

       protected $validationMessages = [
           'code'     => [
               'required'   => 'Kod zon wajib diisi.',
               'alpha_dash' => 'Kod zon hanya huruf, nombor, - dan _.',
               'max_length' => 'Kod zon maksimum 10 aksara.',
               'is_unique'  => 'Kod zon {value} sudah wujud.',
           ],
           'name'     => ['required' => 'Nama zon wajib diisi.', 'max_length' => 'Nama zon maksimum 100 aksara.'],
           'location' => ['required' => 'Lokasi wajib diisi.', 'max_length' => 'Lokasi maksimum 150 aksara.'],
       ];

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

       /**
        * Bilangan slot dalam zon, TERMASUK slot yang dipadam lembut (deleted_at berisi).
        * FK parking_slots.zone_id (RESTRICT) masih nampak baris itu, jadi kiraan ini
        * yang menentukan sama ada zon boleh dipadam.
        */
       public function slotCount(int $zoneId): int
       {
           return $this->db->table('parking_slots')->where('zone_id', $zoneId)->countAllResults();
       }
   }
   ```

   `{id}` dalam `is_unique[parking_zones.code,id,{id}]` diganti dengan `id` data yang divalidasi, jadi semasa **edit** baris zon itu sendiri dikecualikan; CI4 mewajibkan peraturan untuk medan `id` apabila `{id}` digunakan (corak `DepartmentModel` Lab 3.3b).

2. **`VehicleModel`** — gantikan seluruh fail Lab 5.1. `dropdownForUser()` kekal; ditambah mesej BM dan kaedah **statik** `normalisePlate()`:

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
           'id'       => 'permit_empty|is_natural_no_zero',   // {id} dalam is_unique perlukan peraturan ini
           'user_id'  => 'required|is_natural_no_zero',
           'plate_no' => 'required|max_length[15]|is_unique[vehicles.plate_no,id,{id}]',
           'model'    => 'required|max_length[80]',
           'color'    => 'required|max_length[30]',
       ];

       // Lab 5.1b: mesej BM — {value} = nilai yang dihantar
       protected $validationMessages = [
           'plate_no' => [
               'required'   => 'No. plat wajib diisi.',
               'max_length' => 'No. plat maksimum 15 aksara.',
               'is_unique'  => 'No. plat {value} sudah didaftarkan.',
           ],
           'model' => ['required' => 'Model kenderaan wajib diisi.', 'max_length' => 'Model maksimum 80 aksara.'],
           'color' => ['required' => 'Warna wajib diisi.', 'max_length' => 'Warna maksimum 30 aksara.'],
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

       /**
        * Bentuk piawai no. plat sebelum validasi & simpan: huruf besar, ruang di hujung
        * dibuang, ruang berganda jadi satu. ' wxx   1234 ' → 'WXX 1234'
        */
       public static function normalisePlate(string $plate): string
       {
           return strtoupper((string) preg_replace('/\s+/', ' ', trim($plate)));
       }
   }
   ```

   `normalisePlate()` tidak menyentuh DB, jadi ia boleh diuji tanpa database dan dipanggil tanpa objek Model: `VehicleModel::normalisePlate($input)`.

3. **Ujian unit tanpa DB** — `tests/tlk/VehicleModelTest.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Tlk;

   use App\Models\VehicleModel;
   use CodeIgniter\Test\CIUnitTestCase;

   /**
    * @internal
    */
   final class VehicleModelTest extends CIUnitTestCase
   {
       public function testNormalisePlateUppercasesAndTrims(): void
       {
           $this->assertSame('WXX 1234', VehicleModel::normalisePlate('  wxx 1234 '));
       }

       public function testNormalisePlateCollapsesSpaces(): void
       {
           $this->assertSame('VXX 2468', VehicleModel::normalisePlate("vxx    2468"));
           $this->assertSame('WXY 1357', VehicleModel::normalisePlate("wxy\t1357"));   // tab juga ruang
       }

       public function testNormalisePlateKeepsOtherCharacters(): void
       {
           // Sengkang TIDAK dibuang — peraturan format (Lab 5.3b) yang menolaknya
           $this->assertSame('WXX-1234', VehicleModel::normalisePlate('wxx-1234'));
           $this->assertSame('', VehicleModel::normalisePlate('   '));
       }
   }
   ```

   ```bash
   php -l app/Models/ParkingZoneModel.php
   php -l app/Models/VehicleModel.php
   composer test -- --no-coverage tests/tlk/VehicleModelTest.php
   ```

   Dijangka: `OK (3 tests, 5 assertions)`.

4. **Uji peraturan dalam konsol.** `Model::validate()` menjalankan peraturan Model tanpa `INSERT`. Buka konsol, kemudian taip **satu baris** setiap kali dan baca hasilnya:

   ```bash
   php spark shell
   ```

   ```text
   $zones = model('ParkingZoneModel')
   $zones->validate(['code' => 'A', 'name' => 'Zon Berganda', 'location' => 'Aras 9'])
   $zones->errors()
   $a = $zones->where('code', 'A')->first()
   $zones->validate(['id' => $a['id'], 'code' => 'A', 'name' => 'Blok Utama', 'location' => 'Aras G, pintu masuk utama'])
   $zones->validate(['code' => 'z 1', 'name' => '', 'location' => 'Aras 9'])
   $zones->errors()
   $zones->slotCount($a['id'])
   \App\Models\VehicleModel::normalisePlate('  wxx   1234 ')
   $vehicles = model('VehicleModel')
   $vehicles->validate(['user_id' => 1, 'plate_no' => 'WXX 1234', 'model' => 'Proton Saga', 'color' => 'Putih'])
   $vehicles->errors()
   exit
   ```

   Catat hasil `validate()` dan `errors()` baris 2–5 (soalan Kuiz S5). `slotCount()` zon A memulangkan `4` (4 slot seeder Hari 4). Tiada baris DB berubah — `validate()` hanya menyemak.
5. Commit pada branch yang sama:

   ```bash
   git add app/Models tests/tlk
   git commit -m "TLK: peraturan Model zon & kenderaan + normalisePlate()"
   ```

### ✅ Checkpoint
- [ ] `composer test -- --no-coverage tests/tlk/VehicleModelTest.php` → `OK (3 tests, 5 assertions)` (Kuiz S5).
- [ ] Dalam `php spark shell`, `validate()` zon berkod `A` tanpa `id` → `false` dengan mesej BM; dengan `id` zon A → `true` (Kuiz S5).
- [ ] `git log --oneline -1` pada `feat/tlk-model` menunjukkan commit `TLK: peraturan Model zon & kenderaan + normalisePlate()` (Kuiz S5).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `LogicException: No validation rules for the placeholder: "id"` | Peraturan `'id' => 'permit_empty\|is_natural_no_zero'` tertinggal, tetapi data mengandungi `id` | Tambah peraturan `id` (langkah 1) |
| `errors()` → *The code field must contain a unique value.* | `$validationMessages` tiada, atau kunci bukan nama peraturan tepat | Kunci = `is_unique`, di bawah medan `code` |
| `Call to undefined method App\Models\ParkingZoneModel::slotCount()` | Fail belum disimpan, atau konsol dibuka sebelum fail diubah | Simpan fail, `exit`, buka semula `php spark shell` |
| Prompt `>` tidak muncul | Tetingkap Git Bash berasingan (mintty) | Guna terminal VS Code, atau `winpty php spark shell` |
| `No tests executed!` | Nama fail ≠ nama kelas, atau `namespace` salah | Fail `tests/tlk/VehicleModelTest.php`, `namespace Tests\Tlk;`, kelas `VehicleModelTest` |

### ⭐ Cabaran tambahan
Tambah ujian `testNormalisePlateIsIdempotent()`: `normalisePlate(normalisePlate($x))` mesti sama dengan `normalisePlate($x)` bagi tiga contoh. Kenapa sifat ini penting jika kaedah itu dipanggil di dua tempat (controller dan seeder)?

---

## Lab 5.2b — CRUD Zon (Admin) (S6)

### 🎯 Objektif
Membina CRUD zon di `/admin/slot/zon` dalam `Admin/SlotController` (SPEC §5: *CRUD slot & zon*) dengan corak Lab 5.2 — senarai putih medan, `validateData()` dengan peraturan Model, PRG, filter `group:admin` — dan menghalang padam zon yang masih ada slot dengan mesej BM, bukan ralat FK `1451`.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 5.2](#lab-52--crud-slot-admin--senarai-tempahan-s2) checkpoint lulus; anda masih di branch `feat/tlk-crud` (belum di-merge).
- [Lab 5.1b](#lab-51b--peraturan-model-zon--kenderaan-s5) siap: `ParkingZoneModel` ada peraturan dan `slotCount()`.

### Langkah

1. **Route.** Dalam `app/Config/Routes.php`, gantikan seluruh kumpulan `admin/slot` (Lab 5.2 langkah 1) dengan versi ini. Enam route slot tidak berubah; enam route zon ditambah dalam kumpulan yang **sama**, jadi filter `group:admin` melindungi kedua-duanya:

   ```php
   // Admin — CRUD slot & zon (SPEC §5: SlotController = CRUD slot & zon)
   $routes->group('admin/slot', ['namespace' => 'App\Controllers\Admin', 'filter' => 'group:admin'], static function (RouteCollection $routes): void {
       $routes->get('/', 'SlotController::index', ['as' => 'admin.slot.index']);
       $routes->get('new', 'SlotController::new', ['as' => 'admin.slot.new']);
       $routes->post('/', 'SlotController::create', ['as' => 'admin.slot.create']);
       $routes->get('(:num)/edit', 'SlotController::edit/$1', ['as' => 'admin.slot.edit']);
       $routes->post('(:num)', 'SlotController::update/$1', ['as' => 'admin.slot.update']);
       $routes->post('(:num)/delete', 'SlotController::delete/$1', ['as' => 'admin.slot.delete']);

       // Lab 5.2b: zon — /admin/slot/zon
       $routes->get('zon', 'SlotController::zones', ['as' => 'admin.zone.index']);
       $routes->get('zon/new', 'SlotController::newZone', ['as' => 'admin.zone.new']);
       $routes->post('zon', 'SlotController::createZone', ['as' => 'admin.zone.create']);
       $routes->get('zon/(:num)/edit', 'SlotController::editZone/$1', ['as' => 'admin.zone.edit']);
       $routes->post('zon/(:num)', 'SlotController::updateZone/$1', ['as' => 'admin.zone.update']);
       $routes->post('zon/(:num)/delete', 'SlotController::deleteZone/$1', ['as' => 'admin.zone.delete']);
   });
   ```

2. **Controller.** Dalam `app/Controllers/Admin/SlotController.php`, tambah kaedah berikut **terus sebelum** baris `private function findOr404(int $id): array`. Tiada `use` baharu — `ParkingZoneModel`, `PageNotFoundException` dan `RedirectResponse` sudah diimport dalam Lab 5.2:

   ```php
       // -----------------------------------------------------------------
       // Lab 5.2b: CRUD zon (/admin/slot/zon) — corak sama dengan slot

       public function zones(): string
       {
           return view('admin/zone/index', [
               'title' => 'Pengurusan Zon',
               'zones' => $this->zones->orderBy('code')->paginate(10),
               'pager' => $this->zones->pager,
           ]);
       }

       public function newZone(): string
       {
           return view('admin/zone/form', ['title' => 'Tambah Zon', 'zone' => null]);
       }

       public function createZone(): RedirectResponse
       {
           return $this->saveZone(null);
       }

       public function editZone(int $id): string
       {
           $zone = $this->findZoneOr404($id);

           return view('admin/zone/form', ['title' => 'Kemaskini Zon ' . $zone['code'], 'zone' => $zone]);
       }

       public function updateZone(int $id): RedirectResponse
       {
           $this->findZoneOr404($id);

           return $this->saveZone($id);
       }

       public function deleteZone(int $id): RedirectResponse
       {
           $zone  = $this->findZoneOr404($id);
           $count = $this->zones->slotCount($id);

           // FK parking_slots.zone_id = RESTRICT. Semak dahulu supaya admin mendapat mesej BM,
           // bukan halaman ralat DatabaseException 1451.
           if ($count > 0) {
               return redirect()->to('admin/slot/zon')->with('error', sprintf(
                   'Zon %s masih mempunyai %d slot (termasuk slot yang dipadam). Zon tidak boleh dipadam.',
                   $zone['code'],
                   $count,
               ));
           }

           $this->zones->delete($id);   // parking_zones tiada deleted_at → padam kekal

           return redirect()->to('admin/slot/zon')->with('success', 'Zon ' . $zone['code'] . ' telah dipadam.');
       }

       /** Corak save() slot: senarai putih → validateData() dengan peraturan Model → insert/update → PRG. */
       private function saveZone(?int $id): RedirectResponse
       {
           $data = array_map(
               static fn ($value): string => trim((string) $value),
               $this->request->getPost(['code', 'name', 'location']),   // senarai putih medan
           );
           $data['code'] = strtoupper($data['code']);

           if ($id !== null) {
               $data['id'] = $id;   // untuk {id} dalam is_unique; id bukan $allowedFields, jadi tidak ditulis
           }

           if (! $this->validateData($data, $this->zones->getValidationRules(), $this->zones->getValidationMessages())) {
               return redirect()->back()->withInput();
           }

           $id === null ? $this->zones->insert($data) : $this->zones->update($id, $data);

           return redirect()->to('admin/slot/zon')->with('success', 'Zon ' . $data['code'] . ' telah disimpan.');
       }

       private function findZoneOr404(int $id): array
       {
           return $this->zones->find($id) ?? throw PageNotFoundException::forPageNotFound('Zon tidak dijumpai.');
       }
   ```

3. Senarai zon — `app/Views/admin/zone/index.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <div class="d-flex justify-content-end gap-2 mb-3">
       <a href="<?= url_to('admin.slot.index') ?>" class="btn btn-outline-secondary"><i class="bi bi-p-square"></i> Urus Slot</a>
       <a href="<?= url_to('admin.zone.new') ?>" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Tambah Zon</a>
   </div>

   <div class="card">
       <div class="table-responsive">
           <table class="table table-hover align-middle mb-0">
               <thead class="table-light">
               <tr><th>Kod</th><th>Nama</th><th>Lokasi</th><th class="text-end">Tindakan</th></tr>
               </thead>
               <tbody>
               <?php foreach ($zones as $zone): ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($zone['code']) ?></td>
                       <td><?= esc($zone['name']) ?></td>
                       <td><?= esc($zone['location']) ?></td>
                       <td class="text-end">
                           <a href="<?= url_to('admin.zone.edit', $zone['id']) ?>" class="btn btn-sm btn-outline-primary">Ubah</a>
                           <form action="<?= url_to('admin.zone.delete', $zone['id']) ?>" method="post" class="d-inline"
                                 data-confirm="Padam zon <?= esc($zone['code'], 'attr') ?>?">
                               <?= csrf_field() ?>
                               <button type="submit" class="btn btn-sm btn-outline-danger">Padam</button>
                           </form>
                       </td>
                   </tr>
               <?php endforeach ?>
               <?php if ($zones === []): ?>
                   <tr><td colspan="4" class="text-center text-muted py-4">Tiada zon.</td></tr>
               <?php endif ?>
               </tbody>
           </table>
       </div>
   </div>

   <div class="mt-3"><?= $pager->links() ?></div>
   <?= $this->endSection() ?>
   ```

4. Borang zon (tambah & ubah) — `app/Views/admin/zone/form.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php
   $action  = $zone === null ? url_to('admin.zone.create') : url_to('admin.zone.update', $zone['id']);
   $invalid = static fn (string $field): string => validation_show_error($field) !== '' ? ' is-invalid' : '';
   ?>
   <div class="card" style="max-width: 640px">
       <div class="card-body">
           <form action="<?= $action ?>" method="post" novalidate>
               <?= csrf_field() ?>

               <div class="mb-3">
                   <label for="code" class="form-label">Kod zon</label>
                   <input type="text" name="code" id="code" maxlength="10" class="form-control<?= $invalid('code') ?>"
                          value="<?= esc(old('code', $zone['code'] ?? ''), 'attr') ?>" placeholder="cth D">
                   <div class="invalid-feedback"><?= validation_show_error('code') ?></div>
               </div>

               <div class="mb-3">
                   <label for="name" class="form-label">Nama</label>
                   <input type="text" name="name" id="name" maxlength="100" class="form-control<?= $invalid('name') ?>"
                          value="<?= esc(old('name', $zone['name'] ?? ''), 'attr') ?>">
                   <div class="invalid-feedback"><?= validation_show_error('name') ?></div>
               </div>

               <div class="mb-4">
                   <label for="location" class="form-label">Lokasi</label>
                   <input type="text" name="location" id="location" maxlength="150" class="form-control<?= $invalid('location') ?>"
                          value="<?= esc(old('location', $zone['location'] ?? ''), 'attr') ?>">
                   <div class="invalid-feedback"><?= validation_show_error('location') ?></div>
               </div>

               <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Simpan</button>
               <a href="<?= url_to('admin.zone.index') ?>" class="btn btn-link">Batal</a>
           </form>
       </div>
   </div>
   <?= $this->endSection() ?>
   ```

5. **Pautan dari senarai slot.** Dalam `app/Views/admin/slot/index.php`, gantikan blok tiga baris `<div class="d-flex justify-content-end mb-3">` … `</div>` di atas kad dengan:

   ```php
   <div class="d-flex justify-content-end gap-2 mb-3">
       <a href="<?= url_to('admin.zone.index') ?>" class="btn btn-outline-secondary"><i class="bi bi-geo-alt"></i> Urus Zon</a>
       <a href="<?= url_to('admin.slot.new') ?>" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Tambah Slot</a>
   </div>
   ```

6. Sahkan:

   ```bash tab="Git Bash / macOS / Linux"
   php -l app/Controllers/Admin/SlotController.php
   php -l app/Config/Routes.php
   php spark routes | grep "admin/slot/zon"
   ```

   ```powershell tab="PowerShell"
   php -l app/Controllers/Admin/SlotController.php
   php -l app/Config/Routes.php
   php spark routes | Select-String "admin/slot/zon"
   ```

   Dijangka: 6 baris `admin/slot/zon…`, setiap satu dengan filter `group:admin`.
7. `php spark serve`, log masuk `admin@latihan.test`, kemudian uji **mengikut tertib**:
   1. `http://localhost:8080/admin/slot` → klik **Urus Zon** → `/admin/slot/zon` memaparkan 3 zon: `A`, `B`, `C`.
   2. **Tambah Zon:** Kod ` d ` (huruf kecil, dengan ruang), Nama `Zon Ujian Lanjutan`, Lokasi `Aras 2, Blok Latihan` → flash *"Zon D telah disimpan."*; senarai memaparkan `D`.
   3. **Tambah Zon:** Kod `a`, Nama `Zon Berganda`, Lokasi `Aras 3` → mesej *"Kod zon A sudah wujud."* di bawah Kod; nilai lain kekal.
   4. Buka `/admin/slot/new` dan kembangkan dropdown **Zon**. Catat bilangan pilihan (tidak termasuk *— Pilih zon —*) dan pilihan terakhir (soalan Kuiz S6). Klik **Batal**.
   5. **Ubah** zon D: Kod kekal `D`, Nama `Zon Ujian Lanjutan (Kemas kini)` → *"Zon D telah disimpan."* Kod sendiri tidak ditolak kerana `$data['id']` + `{id}` mengecualikan baris D.
   6. **Padam** zon C. Catat mesej (soalan Kuiz S6). `php spark db:table parking_zones` → zon C masih ada.
   7. **Padam** zon D → *"Zon D telah dipadam."* (tiada slot). `parking_zones` kembali 3 baris.
   8. Log keluar, log masuk `pemohon1@latihan.test`, buka `/admin/slot/zon` → dialih ke `/` (tiada group `admin`).
8. Commit pada branch yang sama:

   ```bash
   git add app/
   git commit -m "TLK: CRUD zon admin (/admin/slot/zon)"
   ```

### ✅ Checkpoint
- [ ] `php spark routes` menunjukkan 6 route `admin/slot/zon…` dengan filter `group:admin`; `pemohon1` dialih ke `/` (Kuiz S6).
- [ ] Zon `D` dicipta (kod disimpan huruf besar), diubah tanpa ralat kod berganda, kemudian dipadam; Kod `a` ditolak dengan *"Kod zon A sudah wujud."* (Kuiz S6).
- [ ] Padam zon C ditolak dengan mesej bilangan slot, dan `parking_zones` kekal 3 baris `A`, `B`, `C` (Kuiz S6).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Call to undefined method App\Models\ParkingZoneModel::slotCount()` | Lab 5.1b langkah 1 belum dibuat | Gantikan `ParkingZoneModel` dengan versi Lab 5.1b |
| `DatabaseException` … `Cannot delete or update a parent row: a foreign key constraint fails` | `delete()` dipanggil sebelum (atau tanpa) semakan `slotCount()` | Semak `$count > 0` dahulu, seperti `deleteZone()` |
| Ubah zon D tanpa menukar kod → *"Kod zon D sudah wujud."* | `$data['id'] = $id` tertinggal dalam `saveZone()` | Tambah baris itu — `{id}` perlu nilai |
| `Undefined variable $zone` dalam `admin/zone/form.php` | `newZone()` tidak menghantar `'zone' => null` | Salin semula `newZone()` dari langkah 2 |
| `404 Can't find a route for 'GET: admin/slot/zon'` | Route zon diletak di luar kumpulan, atau fail belum disimpan | Langkah 1 — dalam kumpulan `admin/slot`; `php spark routes` |
| *The action you requested is not allowed.* semasa Padam | `csrf_field()` tertinggal dalam borang padam | Setiap `<form method="post">` perlu `csrf_field()` |

### ⭐ Cabaran tambahan
Tambah lajur **Slot** dalam senarai zon menggunakan `slotCount()`, dan sembunyikan butang **Padam** jika nilainya > 0. Kemudian terangkan kepada rakan sebelah kenapa semakan dalam `deleteZone()` mesti kekal walaupun butang sudah disembunyikan.

---

## Lab 5.3b — Borang Daftar Kenderaan (S7)

### 🎯 Objektif
Membina borang `/kenderaan` supaya pengguna mendaftar kenderaan **sendiri** dengan resipi Lab 5.3: normalkan input sebelum validasi, peraturan tersuai `valid_plate_no` (kelas `VehicleRules` didaftar dalam `$ruleSets`), mesej BM dengan `{value}`, `getValidated()`, `user_id` dari sesi dan PRG.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 5.3](#lab-53--borang-tempahan-validasi--tlk-2026-0001-s3) checkpoint lulus (`TLK-2026-0001` wujud); anda masih di branch `feat/tlk-borang-tempahan` (belum di-merge).
- [Lab 5.1b](#lab-51b--peraturan-model-zon--kenderaan-s5) siap: `VehicleModel::normalisePlate()` dan mesej BM wujud.

### Langkah

1. **Peraturan tersuai** — `app/Validation/VehicleRules.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Validation;

   /**
    * Peraturan validasi tersuai borang kenderaan (Lab 5.3b).
    * Didaftar dalam Config\Validation::$ruleSets.
    *
    *   'plate_no' => 'required|max_length[15]|valid_plate_no|is_unique[vehicles.plate_no]',
    */
   class VehicleRules
   {
       /**
        * Format ringkas no. plat: 1–3 huruf, satu ruang, 1–4 digit, satu huruf akhiran (pilihan).
        * Sah: WXX 1234, V 88, WXY 1357A. Tidak sah: WXX1234, WXX-1234, WXX 12345.
        * Nilai mesti sudah dinormalkan dengan VehicleModel::normalisePlate() (huruf besar, satu ruang).
        */
       public function valid_plate_no(?string $str): bool
       {
           return preg_match('/^[A-Z]{1,3} [0-9]{1,4}[A-Z]?$/', (string) $str) === 1;
       }
   }
   ```

2. Daftar dalam `app/Config/Validation.php` — tambah **satu baris** selepas `BookingRules` (Lab 5.3 langkah 2):

   ```php
       public array $ruleSets = [
           Rules::class,
           FormatRules::class,
           FileRules::class,
           CreditCardRules::class,
           \App\Validation\BookingRules::class,
           \App\Validation\VehicleRules::class,   // ← Lab 5.3b
       ];
   ```

3. **Controller** — `app/Controllers/VehicleController.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers;

   use App\Models\VehicleModel;
   use CodeIgniter\HTTP\RedirectResponse;

   /**
    * Kenderaan Saya (Lab 5.3b). Laluan: /kenderaan (filter session).
    * Setiap pengguna mendaftar kenderaan SENDIRI — user_id sentiasa dari sesi.
    */
   class VehicleController extends BaseController
   {
       /** GET /kenderaan — kenderaan milik pengguna log masuk sahaja (SKOP PEMILIK dalam query) */
       public function index(): string
       {
           return view('vehicle/index', [
               'title'    => 'Kenderaan Saya',
               'vehicles' => model(VehicleModel::class)
                   ->where('user_id', auth()->id())
                   ->orderBy('plate_no')
                   ->findAll(),
           ]);
       }

       /** GET /kenderaan/new */
       public function new(): string
       {
           return view('vehicle/form', ['title' => 'Daftar Kenderaan']);
       }

       /** POST /kenderaan */
       public function create(): RedirectResponse
       {
           $data             = $this->request->getPost(['plate_no', 'model', 'color']);   // senarai putih: TIADA user_id
           $data['plate_no'] = VehicleModel::normalisePlate((string) $data['plate_no']);   // ' wxx  1234' → 'WXX 1234'
           $data['model']    = trim((string) $data['model']);
           $data['color']    = trim((string) $data['color']);

           // Validasi nilai yang SUDAH dinormalkan — is_unique membandingkan 'WXX 1234', bukan ' wxx  1234'
           if (! $this->validateData($data, $this->rules(), $this->messages())) {
               return redirect()->back()->withInput();
           }

           $vehicles       = model(VehicleModel::class);
           $row            = $this->validator->getValidated();   // hanya medan berperaturan
           $row['user_id'] = auth()->id();                        // dari sesi, BUKAN dari borang

           if ($vehicles->insert($row) === false) {
               return redirect()->back()->withInput()->with('error', implode(' ', $vehicles->errors()));
           }

           return redirect()->to(url_to('vehicle.index'))
               ->with('success', 'Kenderaan ' . $row['plate_no'] . ' telah didaftarkan.');
       }

       // -----------------------------------------------------------------

       /** @return array<string, string> */
       private function rules(): array
       {
           return [
               'plate_no' => 'required|max_length[15]|valid_plate_no|is_unique[vehicles.plate_no]',
               'model'    => 'required|min_length[3]|max_length[80]',
               'color'    => 'required|alpha_space|max_length[30]',
           ];
       }

       /** @return array<string, array<string, string>> mesej BM — kunci = nama peraturan tepat */
       private function messages(): array
       {
           return [
               'plate_no' => [
                   'required'       => 'No. plat wajib diisi.',
                   'max_length'     => 'No. plat maksimum 15 aksara.',
                   'valid_plate_no' => 'Format no. plat tidak sah (cth WXX 1234).',
                   'is_unique'      => 'No. plat {value} sudah didaftarkan.',
               ],
               'model' => [
                   'required'   => 'Model kenderaan wajib diisi.',
                   'min_length' => 'Model kenderaan sekurang-kurangnya 3 aksara.',
                   'max_length' => 'Model kenderaan maksimum 80 aksara.',
               ],
               'color' => [
                   'required'    => 'Warna wajib diisi.',
                   'alpha_space' => 'Warna hanya huruf dan ruang.',
                   'max_length'  => 'Warna maksimum 30 aksara.',
               ],
           ];
       }
   }
   ```

4. **Route.** Tambah di **hujung** `app/Config/Routes.php`. Semua pengguna log masuk boleh mendaftar kenderaan sendiri, jadi filter kumpulan `session` sahaja:

   ```php
   // Lab 5.3b: Kenderaan Saya — setiap pengguna log masuk mendaftar kenderaan sendiri
   $routes->group('kenderaan', ['filter' => 'session'], static function (RouteCollection $routes): void {
       $routes->get('/', 'VehicleController::index', ['as' => 'vehicle.index']);
       $routes->get('new', 'VehicleController::new', ['as' => 'vehicle.new']);
       $routes->post('/', 'VehicleController::create', ['as' => 'vehicle.create']);
   });
   ```

5. Senarai — `app/Views/vehicle/index.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <div class="d-flex justify-content-end mb-3">
       <a href="<?= url_to('vehicle.new') ?>" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Daftar Kenderaan</a>
   </div>

   <div class="card" style="max-width: 720px">
       <div class="table-responsive">
           <table class="table table-hover align-middle mb-0">
               <thead class="table-light">
               <tr><th>No. Plat</th><th>Model</th><th>Warna</th></tr>
               </thead>
               <tbody>
               <?php foreach ($vehicles as $v): ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($v['plate_no']) ?></td>
                       <td><?= esc($v['model']) ?></td>
                       <td><?= esc($v['color']) ?></td>
                   </tr>
               <?php endforeach ?>
               <?php if ($vehicles === []): ?>
                   <tr><td colspan="3" class="text-center text-muted py-4">Tiada kenderaan.</td></tr>
               <?php endif ?>
               </tbody>
           </table>
       </div>
   </div>
   <?= $this->endSection() ?>
   ```

   Borang — `app/Views/vehicle/form.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php $invalid = static fn (string $field): string => validation_show_error($field) !== '' ? ' is-invalid' : ''; ?>
   <div class="card" style="max-width: 640px">
       <div class="card-body">
           <form action="<?= url_to('vehicle.create') ?>" method="post" novalidate>
               <?= csrf_field() ?>

               <div class="mb-3">
                   <label for="plate_no" class="form-label">No. plat</label>
                   <input type="text" name="plate_no" id="plate_no" maxlength="15" class="form-control<?= $invalid('plate_no') ?>"
                          value="<?= esc(old('plate_no'), 'attr') ?>" placeholder="cth WXX 1234">
                   <div class="invalid-feedback"><?= validation_show_error('plate_no') ?></div>
               </div>

               <div class="mb-3">
                   <label for="model" class="form-label">Model</label>
                   <input type="text" name="model" id="model" maxlength="80" class="form-control<?= $invalid('model') ?>"
                          value="<?= esc(old('model'), 'attr') ?>" placeholder="cth Proton Saga">
                   <div class="invalid-feedback"><?= validation_show_error('model') ?></div>
               </div>

               <div class="mb-4">
                   <label for="color" class="form-label">Warna</label>
                   <input type="text" name="color" id="color" maxlength="30" class="form-control<?= $invalid('color') ?>"
                          value="<?= esc(old('color'), 'attr') ?>" placeholder="cth Putih">
                   <div class="invalid-feedback"><?= validation_show_error('color') ?></div>
               </div>

               <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Daftar</button>
               <a href="<?= url_to('vehicle.index') ?>" class="btn btn-link">Batal</a>
           </form>
       </div>
   </div>
   <?= $this->endSection() ?>
   ```

6. **Pautan dari borang tempahan.** Dalam `app/Views/tlk/booking/form.php` (Lab 5.3 langkah 7), gantikan baris amaran `<div class="alert alert-warning">Anda belum mendaftar kenderaan. Hubungi pentadbir.</div>` dengan:

   ```php
       <div class="alert alert-warning">Anda belum mendaftar kenderaan. <a href="<?= url_to('vehicle.new') ?>" class="alert-link">Daftar kenderaan</a> dahulu.</div>
   ```

7. Sahkan:

   ```bash tab="Git Bash / macOS / Linux"
   php -l app/Validation/VehicleRules.php
   php -l app/Controllers/VehicleController.php
   php spark routes | grep kenderaan
   ```

   ```powershell tab="PowerShell"
   php -l app/Validation/VehicleRules.php
   php -l app/Controllers/VehicleController.php
   php spark routes | Select-String "kenderaan"
   ```

   Dijangka: `kenderaan` dan `kenderaan/new` (GET), `kenderaan` (POST) — ketiga-tiganya `session`.
8. `php spark serve`, log masuk `pemohon1@latihan.test`, kemudian uji **mengikut tertib**:
   1. `http://localhost:8080/kenderaan` → 2 kenderaan: `WXX 1234`, `WXX 5678`.
   2. **Daftar Kenderaan:** No. plat `  wxx   1234 ` (huruf kecil, ruang berganda), Model `Proton Saga`, Warna `Putih` → **Daftar**. Catat mesej (soalan Kuiz S7).
   3. No. plat `WXX-4321`, Model `Proton Saga`, Warna `Putih` → *"Format no. plat tidak sah (cth WXX 1234)."*. Kemudian No. plat `WXX 12345`, Model `Sa`, Warna `Putih 2` → tiga mesej, satu di bawah setiap medan.
   4. **Cuba menyamar.** Tekan F12 → tab **Elements** → klik kanan `<form action="…/kenderaan" …>` → **Edit as HTML** → tambah `<input type="hidden" name="user_id" value="2">` sebelum `</form>` → klik di luar kotak. Isi No. plat ` wxx 4321`, Model `Perodua Bezza`, Warna `Kelabu` → **Daftar** → *"Kenderaan WXX 4321 telah didaftarkan."*; senarai kini 3 kenderaan.
   5. Buka `/tlk/tempahan/new` → dropdown **Kenderaan** menyenaraikan `WXX 4321 — Perodua Bezza` di antara `WXX 1234` dan `WXX 5678` (`orderBy('plate_no')`).
   6. Tetingkap **incognito**: log masuk `pemohon2@latihan.test` → `/kenderaan`. Catat bilangan kenderaan (soalan Kuiz S7).
9. Commit pada branch yang sama:

   ```bash
   git add app/
   git commit -m "TLK: borang daftar kenderaan + VehicleRules"
   ```

### ✅ Checkpoint
- [ ] `php spark routes` menunjukkan `kenderaan`, `kenderaan/new` (GET) dan `kenderaan` (POST) dengan filter `session` (Kuiz S7).
- [ ] `  wxx   1234 ` ditolak dengan mesej yang menyebut `WXX 1234`; `WXX-4321` dan `WXX 12345` ditolak dengan *"Format no. plat tidak sah (cth WXX 1234)."* (Kuiz S7).
- [ ] `WXX 4321` didaftar untuk pemohon1 walaupun `user_id=2` diselitkan, dan pemohon2 tidak melihatnya di `/kenderaan` (Kuiz S7).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `"valid_plate_no" is not a valid rule.` | `VehicleRules` belum didaftar | Langkah 2 — `app/Config/Validation.php` → `$ruleSets` |
| ` wxx 4321` ditolak *"Format no. plat tidak sah"* | `normalisePlate()` dipanggil selepas `validateData()`, atau tidak dipanggil | Normalkan **dahulu** (langkah 3, baris `$data['plate_no'] = …`) |
| Halaman ralat `Duplicate entry 'WXX 1234' for key 'vehicles.plate_no'` | `is_unique[vehicles.plate_no]` tertinggal; hanya UNIQUE DB yang menangkap | Tambah `is_unique` dalam `rules()` |
| `Unable to find a route named "vehicle.new"` dalam borang tempahan | Langkah 4 belum dibuat atau fail belum disimpan | Tambah kumpulan `kenderaan`; `php spark routes \| grep vehicle` (PowerShell: `php spark routes \| Select-String vehicle`) |
| `WXX 4321` muncul dalam senarai pemohon2 | `user_id` diambil daripada `getPost()` | `$row['user_id'] = auth()->id();` sahaja |
| Mesej Inggeris *The plate_no field …* | Kunci `messages()` tidak sama dengan nama peraturan | Kunci = `required`, `max_length`, `valid_plate_no`, `is_unique` |

### ⭐ Cabaran tambahan
Tulis `tests/tlk/VehicleRulesTest.php` (tanpa DB, seperti cabaran Lab 5.4): `(new VehicleRules())->valid_plate_no('WXY 1357A')` → `true`; `'WXX1234'`, `'WXX-1234'` dan `'WXX 12345'` → `false`.

---

## Lab 5.4b — Ujian Manual Pusingan 2: Zon & Kenderaan (S8)

### 🎯 Objektif
Melaksanakan 12 kes ujian manual bagi ciri Lab 5.1b–5.3b, menyiasat satu kes yang gagal (slot dipadam lembut menyekat padam zon) dengan `php spark shell`, merekod pepijat itu dengan langkah boleh diulang, dan membersihkan data ujian dengan padam kekal `delete($id, true)`.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 5.4](#lab-54--ujian-manual--rekod-pepijat-s4) selesai; `feat/tlk-model`, `feat/tlk-crud`, `feat/tlk-borang-tempahan` (termasuk commit Lab 5.1b–5.3b) di-merge ke `main`.
- Dua pelayar (atau satu biasa + satu incognito).

### Langkah

1. Cipta `docs/ujian-manual-zon-kenderaan.md` dengan jadual ini dan laksanakan **setiap** kes mengikut tertib. Isi lajur *Sebenar* & *Status* (✅ lulus / ❌ gagal / ⏭️ belum dilaksana):

   ```markdown
   # Ujian manual — Zon & Kenderaan (Lab 5.4b)

   | ID | Peranan | Langkah | Jangkaan | Sebenar | Status |
   |----|---------|---------|----------|---------|--------|
   | TM-ZON-01 | admin | Buka `/admin/slot/zon` | 3 zon: A, B, C | | |
   | TM-ZON-02 | admin | Tambah zon `e` / `Zon Ujian E` / `Aras 4, Blok Latihan` | "Zon E telah disimpan."; kod dipapar `E` | | |
   | TM-ZON-03 | admin | Tambah zon `B` / `Zon Berganda` / `Aras 5` | "Kod zon B sudah wujud."; tiada baris baharu | | |
   | TM-ZON-04 | admin | Ubah zon E: kod kekal `E`, nama `Zon Ujian E (Kemas kini)` | "Zon E telah disimpan." | | |
   | TM-ZON-05 | admin | Tambah zon `F` dengan Nama & Lokasi kosong | Dua mesej di bawah medan; Kod `F` kekal diisi | | |
   | TM-ZON-06 | admin | Padam zon A | Mesej "masih mempunyai … slot"; zon A kekal | | |
   | TM-ZON-07 | admin | Tambah slot `E-01` di zon E, padam slot itu, kemudian padam zon E | Zon E (tiada slot dalam senarai) dipadam | | |
   | TM-ZON-08 | pemohon1 | Buka `/admin/slot/zon/new` terus | Dialih ke `/` (tiada akses) | | |
   | TM-KEN-01 | pemohon1 | Daftar `wxx  9876` / `Honda City` / `Hitam` | "Kenderaan WXX 9876 telah didaftarkan." | | |
   | TM-KEN-02 | pemohon1 | Daftar `WXX 9876` / `Honda City` / `Hitam` sekali lagi | "No. plat WXX 9876 sudah didaftarkan." | | |
   | TM-KEN-03 | pemohon1 | Daftar `WXX9876` (tanpa ruang) | "Format no. plat tidak sah (cth WXX 1234)." | | |
   | TM-KEN-04 | pemohon2 | Buka `/kenderaan` | Hanya `VXX 2468`; tiada kenderaan pemohon1 | | |
   ```

2. **TM-ZON-07 secara terperinci** (sebagai `admin`):
   1. `/admin/slot/new` → Zon `E — Zon Ujian E (Kemas kini)`, No. Slot `E-01`, Kategori `OKU` → **Simpan**.
   2. `/admin/slot` → cari `E-01` (halaman terakhir) → **Padam** → *"Slot E-01 telah dipadam."*; `E-01` hilang dari senarai.
   3. `/admin/slot/zon` → **Padam** zon E. Catat mesej (soalan Kuiz S8). Tandakan TM-ZON-07 ❌ — senarai slot tidak menunjukkan apa-apa slot zon E, tetapi zon tidak boleh dipadam.
3. **Siasat dengan konsol.** `php spark shell`, kemudian satu baris setiap kali:

   ```text
   $slots = model('ParkingSlotModel')
   $slots->where('slot_no', 'E-01')->countAllResults()
   $slots->withDeleted()->where('slot_no', 'E-01')->countAllResults()
   ```

   Catat kedua-dua nombor (soalan Kuiz S8). Model menambah `deleted_at IS NULL` secara automatik; `withDeleted()` membuangnya. `slotCount()` (Query Builder terus) dan FK MySQL melihat baris itu kerana ia masih wujud.
4. **Laporan pepijat.** Tambah di hujung `docs/ujian-manual-zon-kenderaan.md` (format README §4.3), kemudian lengkapkan *Sebenar*:

   ```markdown

   ## Laporan pepijat

   ### BUG-ZON-001 — Zon tidak boleh dipadam selepas semua slotnya dipadam
   - **Langkah:** log masuk admin → /admin/slot/new → slot E-01 di zon E → Simpan → Padam E-01 → /admin/slot/zon → Padam zon E
   - **Jangkaan:** zon E dipadam (senarai slot tidak menunjukkan slot zon E)
   - **Sebenar:**
   - **Punca:** slot dipadam lembut (`deleted_at` berisi) masih wujud; FK `parking_slots.zone_id` RESTRICT
   - **Keterukan:** Rendah (admin tidak boleh membersihkan zon sendiri) · **Status:** Dibuka
   - **Cadangan:** paparan slot dipadam bagi setiap zon + padam kekal oleh admin bagi slot yang tiada tempahan
   ```

5. **Bersihkan data ujian.** Dalam konsol yang sama (padam **kekal** hanya slot ujian `E-01`):

   ```text
   $e01 = $slots->onlyDeleted()->where('slot_no', 'E-01')->first()
   $slots->delete($e01['id'], true)
   $slots->withDeleted()->where('slot_no', 'E-01')->countAllResults()
   exit
   ```

   `delete($id, true)` = *purge*: `DELETE` sebenar, bukan `deleted_at`. Baris ketiga kini `0`. Kembali ke `/admin/slot/zon` → **Padam** zon E → *"Zon E telah dipadam."* Semak:

   ```bash
   php spark db:table parking_zones
   ```

   Dijangka: 3 baris `A`, `B`, `C`.
6. Commit dan push:

   ```bash
   git add docs/ujian-manual-zon-kenderaan.md
   git commit -m "TLK: rekod ujian manual zon & kenderaan"
   git push
   ```

### ✅ Checkpoint
- [ ] `docs/ujian-manual-zon-kenderaan.md` — 12 kes, setiap satu berstatus; ≥ 11 ✅ (TM-ZON-07 ❌ dijangka) (Kuiz S8).
- [ ] BUG-ZON-001 lengkap: langkah, jangkaan, sebenar (mesej tepat), punca, keterukan, cadangan (Kuiz S8).
- [ ] Selepas pembersihan: `parking_zones` 3 baris (`A`, `B`, `C`) dan tiada `E-01` dalam `parking_slots` walaupun dengan `withDeleted()` (Kuiz S8).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| TM-ZON-07: zon E terus dipadam | Slot `E-01` dicipta dalam zon lain | Semak lajur Zon di `/admin/slot`; ulang langkah 2 |
| TM-ZON-07: halaman ralat `Cannot delete or update a parent row` | `slotCount()` diubah kepada `$this->where(...)` (Model menapis `deleted_at`) | Kekalkan `$this->db->table('parking_slots')` (Lab 5.1b) |
| `Trying to access array offset on null` pada `delete($e01['id'], true)` | `onlyDeleted()` tidak menjumpai `E-01` — slot belum dipadam, atau sudah dipurge | Semak langkah 2.2; `withDeleted()->where('slot_no', 'E-01')->first()` |
| Padam zon E selepas purge masih ditolak | Ada slot lain dalam zon E | `withDeleted()->where('zone_id', <id zon E>)->findAll()` dalam konsol |
| Tidak dapat log masuk dua pengguna serentak | Sesi dikongsi dalam satu pelayar | Guna tetingkap incognito atau pelayar kedua |

### ⭐ Cabaran tambahan
Dalam branch `fix/zon-slot-dipadam`, tambah jadual *Slot dipadam* di `/admin/slot/zon/{id}/edit` (`onlyDeleted()->where('zone_id', $id)`). Bincang dengan jurulatih: patutkah admin boleh padam kekal slot yang pernah ditempah? (Petunjuk: FK `slot_bookings.slot_id` `RESTRICT` dan sejarah tempahan.)

---

## Semakan kendiri — akhir hari

```bash
composer test -- --no-coverage tests/tlk/BookingStatusTest.php   # OK (5 tests, …)
composer test -- --no-coverage tests/tlk   # OK (8 tests, …)
git log --oneline --merges main -3                               # 3 merge feat/tlk-*
git status --short                                               # tiada output
```

- [ ] Sebagai `admin@latihan.test`, `/admin/slot` memaparkan senarai slot berpagination; tambah & padam slot berfungsi (TM-TLK-01 hingga 05) (Kuiz S2).
- [ ] Sebagai `pemohon1@latihan.test`, borang tempahan sah menghasilkan `TLK-YYYY-NNNN` baharu berstatus *Menunggu* di `/tlk/tempahan` (Kuiz S3).
- [ ] BR-TLK-03: tamat = mula + 91 hari ditolak; tamat = mula + 90 hari diterima; tarikh mula semalam ditolak (Kuiz S3).
- [ ] `composer test -- --no-coverage tests/tlk/BookingStatusTest.php` → `OK (5 tests, …)` (6 dengan ⭐) (Kuiz S1).
- [ ] `docs/ujian-manual-tlk.md` ada 16 kes berstatus (≥ 14 ✅) dan ≥ 1 laporan pepijat (TM-TLK-16) (Kuiz S4).
- [ ] `git log --oneline --merges main` menunjukkan merge `feat/tlk-model`, `feat/tlk-crud`, `feat/tlk-borang-tempahan`; `git status --short` kosong (Kuiz S4).
- [ ] `composer test -- --no-coverage tests/tlk` → `OK (8 tests, …)`; dalam `php spark shell`, `validate()` zon berkod `A` ditolak dengan mesej BM (Lab 5.1b) (Kuiz S5).
- [ ] Sebagai `admin@latihan.test`, `/admin/slot/zon` boleh menambah, mengubah dan memadam zon; padam zon yang masih ada slot ditolak dengan mesej BM (Lab 5.2b) (Kuiz S6).
- [ ] Sebagai `pemohon1@latihan.test`, `/kenderaan` mendaftar `WXX 4321` dan menolak no. plat berganda atau format salah (Lab 5.3b) (Kuiz S7).
- [ ] `docs/ujian-manual-zon-kenderaan.md` ada 12 kes berstatus + BUG-ZON-001, dan `parking_zones` kembali 3 baris (Lab 5.4b) (Kuiz S8).
