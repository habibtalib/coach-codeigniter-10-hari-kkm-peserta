# Lab Hari 6 — Modul TLK (Bahagian 2)

[⬅️ README Hari 6](./README.md) · [📘 SPEC](../docs/spesifikasi-sistem.md) · 🧩 Template kod (modul **Templat & Rujukan**) · [⚡ Arahan spark](../docs/arahan-spark.md)

> **Peraturan lab:** hari ini tentang **ketepatan di bawah tekanan**, bukan kelajuan. Setiap langkah memberi kod lengkap untuk disalin. Isi jadual pertindihan (Lab 6.1 langkah 1) **sebelum** menyalin query, dan baca setiap baris transaksi sebelum menjalankannya. AI boleh membantu menerangkan `Lock wait timeout` atau `errno` — tetapi anda mesti boleh menerangkan kenapa kunci diambil mengikut tertib pengguna → slot.

| Lab | Sesi | Branch | Hasil |
|-----|------|--------|-------|
| 6.1 | S1 09:00–10:30 | `feat/tlk-ketersediaan` | `SlotAvailabilityService` + paparan slot kosong |
| 6.2 | S2 10:45–12:30 | `feat/tlk-keputusan` | `BookingService` v2 + `status_logs` + lulus/tolak/batal |
| 6.3 | S3 14:30–16:00 | `feat/tlk-ujian` | `BookingServiceTest` + `DecisionAccessTest` hijau |
| 6.4 | S4 16:00–17:00 | `main` | UI digilap, demo M1, tag `m1-siap` |

---

## Lab 6.1 — Semakan Ketersediaan Slot (S1)

### 🎯 Objektif
Menulis `SlotAvailabilityService` (`hasOverlap()` & `availableSlots()`) dan paparan slot kosong bagi julat tarikh.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Hari 5 di-merge ke `main`; `TLK-2026-0001` wujud
- `git switch main && git pull && git switch -c feat/tlk-ketersediaan`

### Langkah

1. **Di atas kertas dahulu (5 minit).** Salin jadual ini ke `docs/pertindihan-tarikh.md` dan isi lajur *Bertindih?* **sebelum** menulis kod. Tempahan sedia ada: 10–20 Okt.

   | Kes | Baharu | `E.start <= N.end`? | `E.end >= N.start`? | Bertindih? |
   |-----|--------|---------------------|---------------------|------------|
   | 1 | 10–20 | | | |
   | 2 | 5–10 | | | |
   | 3 | 20–25 | | | |
   | 4 | 12–15 | | | |
   | 5 | 5–25 | | | |
   | 6 | 5–9 | | | |
   | 7 | 21–25 | | | |

2. `app/Services/SlotAvailabilityService.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use App\Enums\BookingStatus;
   use App\Models\ParkingSlotModel;
   use App\Models\SlotBookingModel;
   use CodeIgniter\Database\BaseBuilder;

   /**
    * Semakan ketersediaan slot (BR-TLK-01).
    *
    * Dua julat [A_start, A_end] dan [B_start, B_end] BERTINDIH jika:
    *     A_start <= B_end  AND  A_end >= B_start
    * (tarikh inklusif — hari terakhir tempahan masih dikira digunakan).
    */
   class SlotAvailabilityService
   {
       public function __construct(
           private readonly SlotBookingModel $bookings = new SlotBookingModel(),
           private readonly ParkingSlotModel $slots = new ParkingSlotModel(),
       ) {
       }

       /**
        * Adakah slot ini sudah ada tempahan aktif (pending/approved) yang bertindih?
        *
        * @param int|null $excludeBookingId abaikan tempahan ini (guna semasa lulus)
        */
       public function hasOverlap(int $slotId, string $start, string $end, ?int $excludeBookingId = null): bool
       {
           $builder = $this->bookings->builder()
               ->where('slot_id', $slotId)
               ->whereIn('status', BookingStatus::active())
               ->where('start_date <=', $end)     // sedia ada bermula sebelum/pada julat baharu tamat
               ->where('end_date >=', $start);    // sedia ada tamat selepas/pada julat baharu bermula

           if ($excludeBookingId !== null) {
               $builder->where('id !=', $excludeBookingId);
           }

           return $builder->countAllResults() > 0;
       }

       /**
        * Slot aktif yang TIADA tempahan aktif bertindih dalam julat [start, end].
        *
        * @return list<array<string, mixed>> baris parking_slots + zone_code, zone_name
        */
       public function availableSlots(string $start, string $end, ?string $category = null, ?int $zoneId = null): array
       {
           $query = $this->slots->withZone()
               ->where('parking_slots.is_active', 1)
               // Subquery: slot yang SIBUK dalam julat → kecualikan
               ->whereNotIn('parking_slots.id', static fn (BaseBuilder $sub) => $sub
                   ->select('slot_id')
                   ->from('slot_bookings')
                   ->whereIn('status', BookingStatus::active())
                   ->where('start_date <=', $end)
                   ->where('end_date >=', $start));

           if ($category !== null && $category !== '') {
               $query->where('parking_slots.category', $category);
           }

           if ($zoneId !== null) {
               $query->where('parking_slots.zone_id', $zoneId);
           }

           return $query->findAll();
       }
   }
   ```

3. Daftar dalam `app/Config/Services.php` — tambah kaedah ini dalam kelas `Services`, selepas `bookingService()` (tambah juga `use App\Services\SlotAvailabilityService;`):

   ```php
   public static function slotAvailability(bool $getShared = true): SlotAvailabilityService
   {
       if ($getShared) {
           return static::getSharedInstance('slotAvailability');
       }

       return new SlotAvailabilityService();
   }
   ```

4. Route — dalam kumpulan `tlk/tempahan`, **sebelum** `(:num)`:

   ```php
   $routes->get('ketersediaan', 'BookingController::availability', ['as' => 'tlk.availability']);
   ```

5. `BookingController::availability()` (tambah `use App\Enums\SlotCategory; use App\Models\ParkingZoneModel;`):

   ```php
   /** GET tlk/tempahan/ketersediaan?start_date=&end_date=&category=&zone_id= */
   public function availability(): string
   {
       $filters = [
           'start_date' => (string) ($this->request->getGet('start_date') ?? ''),
           'end_date'   => (string) ($this->request->getGet('end_date') ?? ''),
           'category'   => (string) ($this->request->getGet('category') ?? ''),
           'zone_id'    => (string) ($this->request->getGet('zone_id') ?? ''),
       ];

       $slots  = null;   // null = borang belum dihantar
       $errors = [];

       if ($filters['start_date'] !== '' || $filters['end_date'] !== '') {
           $validation = service('validation')->setRules([
               'start_date' => 'required|valid_date[Y-m-d]',
               'end_date'   => 'required|valid_date[Y-m-d]|date_on_or_after[start_date]',
               'category'   => 'permit_empty|' . SlotCategory::inList(),
               'zone_id'    => 'permit_empty|is_natural_no_zero',
           ]);

           if ($validation->run($filters)) {
               $slots = service('slotAvailability')->availableSlots(
                   $filters['start_date'],
                   $filters['end_date'],
                   $filters['category'] ?: null,
                   $filters['zone_id'] !== '' ? (int) $filters['zone_id'] : null,
               );
           } else {
               $errors = $validation->getErrors();
           }
       }

       return view('tlk/booking/availability', [
           'title'      => 'Semak Slot Kosong',
           'filters'    => $filters,
           'slots'      => $slots,
           'errors'     => $errors,
           'zones'      => model(ParkingZoneModel::class)->dropdown(),
           'categories' => SlotCategory::options(),
       ]);
   }
   ```

6. `app/Views/tlk/booking/availability.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php use App\Enums\SlotCategory; ?>

   <form method="get" class="card card-body mb-4">
       <div class="row g-3 align-items-end">
           <div class="col-md-3">
               <label class="form-label" for="start_date">Tarikh mula</label>
               <input type="date" class="form-control" id="start_date" name="start_date" value="<?= esc($filters['start_date'], 'attr') ?>">
           </div>
           <div class="col-md-3">
               <label class="form-label" for="end_date">Tarikh tamat</label>
               <input type="date" class="form-control" id="end_date" name="end_date" value="<?= esc($filters['end_date'], 'attr') ?>">
           </div>
           <div class="col-md-2">
               <label class="form-label" for="category">Kategori</label>
               <?= form_dropdown('category', ['' => 'Semua'] + $categories, $filters['category'], ['id' => 'category', 'class' => 'form-select']) ?>
           </div>
           <div class="col-md-2">
               <label class="form-label" for="zone_id">Zon</label>
               <?= form_dropdown('zone_id', ['' => 'Semua'] + $zones, $filters['zone_id'], ['id' => 'zone_id', 'class' => 'form-select']) ?>
           </div>
           <div class="col-md-2">
               <button class="btn btn-primary w-100" type="submit"><i class="bi bi-search"></i> Semak</button>
           </div>
       </div>
   </form>

   <?php if ($errors !== []): ?>
       <div class="alert alert-danger"><?php foreach ($errors as $e): ?><div><?= esc($e) ?></div><?php endforeach ?></div>
   <?php elseif ($slots !== null): ?>
       <p class="text-muted"><?= count($slots) ?> slot kosong bagi <?= esc($filters['start_date']) ?> hingga <?= esc($filters['end_date']) ?>.</p>
       <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
           <?php foreach ($slots as $slot): ?>
               <?php $category = SlotCategory::from($slot['category']); ?>
               <div class="col">
                   <div class="card text-center border-success h-100">
                       <div class="card-body">
                           <div class="fs-4 fw-bold"><?= esc($slot['slot_no']) ?></div>
                           <div class="small text-muted"><?= esc($slot['zone_code']) ?></div>
                           <div class="small"><i class="bi <?= esc($category->icon(), 'attr') ?>"></i> <?= esc($category->label()) ?></div>
                       </div>
                   </div>
               </div>
           <?php endforeach ?>
       </div>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```

7. Uji dan commit `TLK: semakan ketersediaan slot (BR-TLK-01)`.

### ✅ Checkpoint
- `docs/pertindihan-tarikh.md`: kes 1–5 bertindih, kes 6–7 tidak.
- Tempahan `TLK-2026-0001` (slot A-01) ada dalam DB. Buka `http://localhost:8080/tlk/tempahan/ketersediaan?start_date=<mula>&end_date=<tamat>&category=oku` menggunakan tarikh yang **bertindih** dengan tempahan itu → A-01 **tiada** dalam senarai; tarikh **selepas** tempahan tamat → A-01 **ada**.
- Debug Toolbar → *Database*: query mengandungi `NOT IN (SELECT slot_id FROM slot_bookings WHERE status IN ('pending','approved') …)`.
- `?start_date=2026-10-20&end_date=2026-10-10` → mesej ralat, tiada senarai.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `/tlk/tempahan/ketersediaan` → 404 | Route belum ditambah, salah eja, atau diletak di luar kumpulan `tlk/tempahan` | `php spark routes \| grep ketersediaan` |
| Slot yang dipadam (soft delete) muncul | Guna `$this->slots->builder()` (Query Builder mentah) | Guna kaedah Model (`withZone()->…->findAll()`) — filter `deleted_at` automatik |
| Semua slot hilang | Subquery tanpa `whereIn('status', …)` / syarat terbalik | Semak jadual langkah 1 |
| `Call to undefined method … whereNotIn() closure` | Versi CI lama | CI ≥ 4.6 menyokong closure subquery |

### ⭐ Cabaran tambahan
- Tunjukkan slot **sibuk** juga (kad kelabu) dengan nombor rujukan tempahan yang mendudukinya (hanya untuk `tlk.decide`).
- Tambah butang "Mohon slot ini" pada setiap kad yang membuka `/tlk/tempahan/new?slot_id=…&start_date=…&end_date=…` dan isi borang secara automatik.

---

## Lab 6.2 — Transaksi, Kunci Baris, Kelulusan & `status_logs` (S2)

### 🎯 Objektif
Menaik taraf `BookingService` kepada versi 2 (transaksi + `FOR UPDATE` + BR-TLK-01/04/05), menambah `StatusLogModel`, `DecisionController` dan pembatalan, serta membuktikan kunci dengan dua sesi MySQL.

### Prasyarat
- Lab 6.1 di-merge; `git switch -c feat/tlk-keputusan`
- Klien MySQL CLI (`mysql -u kkm_dev -p kkm_latihan`) atau HeidiSQL/TablePlus dengan dua tab query. 🪟 Dalam tetingkap Git Bash berasingan (bukan terminal VS Code), jika prompt kata laluan tidak muncul: `winpty mysql -u kkm_dev -p kkm_latihan`

### Langkah

**A. Buktikan masalah dahulu (5 minit)**

1. Dengan `BookingService` v1, log masuk `pemohon1` (pelayar biasa) & `pemohon2` (incognito). Kedua-dua mohon slot A-02, tarikh bertindih. Kedua-dua berjaya → **pepijat TM-TLK-16 dihasilkan semula**. Rekod ID tempahan.

**B. `StatusLogModel`**

2. `app/Models/StatusLogModel.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use CodeIgniter\Model;

   class StatusLogModel extends Model
   {
       protected $table         = 'status_logs';
       protected $returnType    = 'array';
       protected $allowedFields = ['module', 'record_id', 'from_status', 'to_status', 'actor_id', 'remarks'];

       protected $useTimestamps = true;
       protected $createdField  = 'created_at';
       protected $updatedField  = '';            // jadual audit: tiada updated_at

       protected $validationRules = [
           'module'      => 'required|in_list[TLK,PAS]',
           'record_id'   => 'required|is_natural_no_zero',
           'from_status' => 'permit_empty|max_length[20]',
           'to_status'   => 'required|max_length[20]',
           'actor_id'    => 'required|is_natural_no_zero',
       ];

       public function record(string $module, int $recordId, ?string $from, string $to, int $actorId, ?string $remarks = null): bool
       {
           return $this->insert([
               'module'      => strtoupper($module),
               'record_id'   => $recordId,
               'from_status' => $from,
               'to_status'   => $to,
               'actor_id'    => $actorId,
               'remarks'     => $remarks,
           ]) !== false;
       }

       public function history(string $module, int $recordId): array
       {
           return $this->select('status_logs.*, users.full_name AS actor_name')
               ->join('users', 'users.id = status_logs.actor_id', 'left')
               ->where('status_logs.module', strtoupper($module))
               ->where('status_logs.record_id', $recordId)
               ->orderBy('status_logs.created_at', 'ASC')
               ->orderBy('status_logs.id', 'ASC')
               ->findAll();
       }
   }
   ```

   > Tandatangan `record()` dan `history()` **dikunci** — Modul Pas (Hari 8) memanggilnya dengan `'PAS'`.

**C. `BookingService` versi 2**

3. Gantikan seluruh `app/Services/BookingService.php` dengan versi 2 di bawah (README §2.2–2.3 menerangkan setiap bahagian). Senarai semak — tanda setiap satu selepas anda menemuinya dalam kod:
   - [ ] Konstruktor menerima `StatusLogModel $logs`, `SlotAvailabilityService $availability`, `ReferenceNumberService $refNumbers`, `?BaseConnection $db` (lalai `db_connect()`)
   - [ ] `create()`: `assertValidPeriod()` → `assertVehicleOwnedBy()` → `transBegin()` → kunci `users` → kunci `parking_slots` → slot aktif? → BR-TLK-04 → BR-TLK-01 → `next('TLK')` → `insert` → `record(null → pending)` → `transCommit()`
   - [ ] `catch (Throwable $e) { transRollback(); throw $e; }`
   - [ ] `assertValidPeriod()` awam: format, bukan masa lalu (hari ini dibenarkan), `end >= start`, `diff()->days > 90` ditolak
   - [ ] `approve()`, `reject()` (sebab ≥ 10 aksara), `cancel()` (pemilik **atau** admin) → semua melalui `transition()`
   - [ ] `transition()`: kunci baris tempahan → `canTransitionTo()` → jika lulus: kunci slot + `hasOverlap(…, $bookingId)` → `update` → `record()`
   - [ ] `lockRow()` guna `prefixTable()` + binding `?`

   `app/Services/BookingService.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use App\Entities\SlotBooking;
   use App\Enums\BookingStatus;
   use App\Models\SlotBookingModel;
   use App\Models\StatusLogModel;
   use App\Models\VehicleModel;
   use CodeIgniter\Database\BaseConnection;
   use DateTimeImmutable;
   use DomainException;
   use RuntimeException;
   use Throwable;

   /**
    * Logik perniagaan tempahan TLK. Controller HANYA memanggil kaedah di sini.
    *
    *  - BR-TLK-01 tiada pertindihan (SlotAvailabilityService::hasOverlap)
    *  - BR-TLK-03 (end_date − start_date) ≤ 90 hari, end >= start, start bukan masa lalu (hari ini dibenarkan)
    *  - BR-TLK-04 maksimum 1 tempahan aktif seorang
    *  - BR-TLK-05 semakan + tulis dalam SATU transaksi dengan SELECT ... FOR UPDATE
    *  - BR-TLK-06 hanya 'approved' boleh dibatalkan, oleh pemilik atau admin
    *
    * Semua pelanggaran peraturan → DomainException (mesej BM, selamat dipapar).
    */
   class BookingService
   {
       public const MODULE   = 'TLK';
       public const MAX_DAYS = 90;

       private BaseConnection $db;

       public function __construct(
           private readonly SlotBookingModel $bookings = new SlotBookingModel(),
           private readonly VehicleModel $vehicles = new VehicleModel(),
           private readonly StatusLogModel $logs = new StatusLogModel(),
           private readonly SlotAvailabilityService $availability = new SlotAvailabilityService(),
           private readonly ReferenceNumberService $refNumbers = new ReferenceNumberService(),
           ?BaseConnection $db = null,
       ) {
           $this->db = $db ?? db_connect();
       }

       /**
        * Cipta tempahan baharu berstatus 'pending'.
        *
        * @param array{vehicle_id:int|string, slot_id:int|string, start_date:string, end_date:string, reason:string} $data
        *
        * @throws DomainException jika mana-mana peraturan perniagaan dilanggar
        */
       public function create(int $userId, array $data): SlotBooking
       {
           $slotId    = (int) $data['slot_id'];
           $vehicleId = (int) $data['vehicle_id'];
           $start     = (string) $data['start_date'];
           $end       = (string) $data['end_date'];

           $this->assertValidPeriod($start, $end);           // BR-TLK-03 (pertahanan berlapis)
           $this->assertVehicleOwnedBy($vehicleId, $userId);

           $this->db->transException(true)->transBegin();   // ralat query → exception, bukan `false` senyap

           try {
               // Susunan kunci TETAP (pengguna → slot) untuk elak deadlock.
               $this->lockRow('users', $userId);              // BR-TLK-04: serialkan per pemohon
               $slot = $this->lockRow('parking_slots', $slotId, 'id, is_active, deleted_at');  // BR-TLK-05

               if ($slot === null || $slot->deleted_at !== null || (int) $slot->is_active !== 1) {
                   throw new DomainException('Slot yang dipilih tidak wujud atau tidak aktif.');
               }

               if ($this->countActiveForUser($userId) > 0) {
                   throw new DomainException('Anda sudah mempunyai satu tempahan aktif (Menunggu/Diluluskan). Hanya 1 dibenarkan.');
               }

               if ($this->availability->hasOverlap($slotId, $start, $end)) {
                   throw new DomainException('Slot ini sudah ditempah bagi tarikh yang bertindih. Sila pilih slot atau tarikh lain.');
               }

               $refNo = $this->refNumbers->next(self::MODULE);   // transaksi bersarang

               $id = $this->bookings->insert([
                   'ref_no'     => $refNo,
                   'user_id'    => $userId,
                   'vehicle_id' => $vehicleId,
                   'slot_id'    => $slotId,
                   'start_date' => $start,
                   'end_date'   => $end,
                   'reason'     => trim((string) $data['reason']),
                   'status'     => BookingStatus::Pending->value,
               ]);

               if ($id === false) {
                   throw new DomainException(implode(' ', $this->bookings->errors()));
               }

               if (! $this->logs->record(self::MODULE, (int) $id, null, BookingStatus::Pending->value, $userId)) {
                   throw new RuntimeException('Gagal merekod log status.');
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               $this->db->transRollback();

               throw $e;
           }

           return $this->bookings->find($id);
       }

       /** Pelulus meluluskan tempahan: pending → approved. */
       public function approve(int $bookingId, int $actorId, ?string $remarks = null): SlotBooking
       {
           return $this->transition($bookingId, BookingStatus::Approved, $actorId, $remarks);
       }

       /** Pelulus menolak tempahan: pending → rejected. Sebab wajib. */
       public function reject(int $bookingId, int $actorId, string $remarks): SlotBooking
       {
           if (mb_strlen(trim($remarks)) < 10) {
               throw new DomainException('Sebab penolakan wajib diisi (sekurang-kurangnya 10 aksara).');
           }

           return $this->transition($bookingId, BookingStatus::Rejected, $actorId, $remarks);
       }

       /**
        * BR-TLK-06: batal tempahan yang telah DILULUSKAN: approved → cancelled.
        * Dibenarkan untuk pemilik tempahan atau admin. 'pending' TIDAK boleh dibatalkan
        * (BookingStatus::canTransitionTo menolaknya).
        */
       public function cancel(int $bookingId, int $actorId, ?string $remarks = null): SlotBooking
       {
           $booking = $this->bookings->find($bookingId);

           if ($booking === null || (! $booking->isOwnedBy($actorId) && ! $this->isAdmin($actorId))) {
               // Mesej sama untuk "tiada" & "bukan milik anda" — jangan dedahkan kewujudan rekod.
               throw new DomainException('Tempahan tidak dijumpai.');
           }

           return $this->transition($bookingId, BookingStatus::Cancelled, $actorId, $remarks);
       }

       /**
        * BR-TLK-03. Awam supaya boleh diuji terus.
        *
        * @throws DomainException
        */
       public function assertValidPeriod(string $start, string $end): void
       {
           $startDate = DateTimeImmutable::createFromFormat('!Y-m-d', $start);
           $endDate   = DateTimeImmutable::createFromFormat('!Y-m-d', $end);

           if ($startDate === false || $endDate === false) {
               throw new DomainException('Format tarikh tidak sah (YYYY-MM-DD).');
           }

           if ($startDate < new DateTimeImmutable('today')) {
               throw new DomainException('Tarikh mula tidak boleh pada masa lalu.');
           }

           if ($endDate < $startDate) {
               throw new DomainException('Tarikh tamat mesti sama atau selepas tarikh mula.');
           }

           // Kanun: (end_date − start_date) ≤ 90 hari. Tempahan satu hari (end = start) → 0, dibenarkan.
           if ($startDate->diff($endDate)->days > self::MAX_DAYS) {
               throw new DomainException('Tarikh tamat tidak boleh melebihi ' . self::MAX_DAYS . ' hari selepas tarikh mula.');
           }
       }

       // ------------------------------------------------------------------

       private function transition(int $bookingId, BookingStatus $to, int $actorId, ?string $remarks): SlotBooking
       {
           $this->db->transException(true)->transBegin();   // ralat query → exception, bukan `false` senyap

           try {
               // Kunci baris tempahan: dua pelulus serentak tidak boleh memutuskan rekod sama.
               $locked = $this->lockRow('slot_bookings', $bookingId, 'id, slot_id, status, start_date, end_date');

               if ($locked === null) {
                   throw new DomainException('Tempahan tidak dijumpai.');
               }

               $from = BookingStatus::from($locked->status);

               if (! $from->canTransitionTo($to)) {
                   throw new DomainException(sprintf(
                       'Status "%s" tidak boleh ditukar kepada "%s".',
                       $from->label(),
                       $to->label(),
                   ));
               }

               if ($to === BookingStatus::Approved) {
                   $this->lockRow('parking_slots', (int) $locked->slot_id);

                   // Pertahanan berlapis BR-TLK-01: semak semula ketika lulus.
                   if ($this->availability->hasOverlap((int) $locked->slot_id, $locked->start_date, $locked->end_date, $bookingId)) {
                       throw new DomainException('Tidak boleh lulus: terdapat tempahan aktif lain yang bertindih.');
                   }
               }

               $update = ['status' => $to->value];

               if (in_array($to, [BookingStatus::Approved, BookingStatus::Rejected], true)) {
                   $update['decided_by'] = $actorId;
                   $update['decided_at'] = date('Y-m-d H:i:s');
               }

               // Semak SETIAP tulisan: tiada log tanpa perubahan status, tiada perubahan tanpa log (BR-PAS-05 corak sama)
               if (! $this->bookings->update($bookingId, $update)) {
                   throw new RuntimeException('Gagal mengemas kini tempahan: ' . implode(' ', $this->bookings->errors()));
               }

               if (! $this->logs->record(self::MODULE, $bookingId, $from->value, $to->value, $actorId, $remarks)) {
                   throw new RuntimeException('Gagal merekod log status.');
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               $this->db->transRollback();

               throw $e;
           }

           return $this->bookings->find($bookingId);
       }

       /**
        * SELECT ... FOR UPDATE pada satu baris (id). Query Builder CI4 tiada
        * kaedah lockForUpdate(), jadi kita guna query dengan binding (?) —
        * nama jadual dari kod kita sendiri, BUKAN input pengguna.
        */
       private function lockRow(string $table, int $id, string $columns = 'id'): ?object
       {
           $sql = sprintf('SELECT %s FROM %s WHERE id = ? FOR UPDATE', $columns, $this->db->prefixTable($table));

           $query = $this->db->query($sql, [$id]);

           if ($query === false) {   // DBDebug = false: query() pulang false, bukan exception
               throw new RuntimeException("Gagal mengunci baris {$table}#{$id}.");
           }

           return $query->getRow();
       }

       private function isAdmin(int $userId): bool
       {
           return auth()->getProvider()->findById($userId)?->inGroup('admin') ?? false;
       }

       private function countActiveForUser(int $userId): int
       {
           return $this->bookings->builder()
               ->where('user_id', $userId)
               ->whereIn('status', BookingStatus::active())
               ->countAllResults();
       }

       private function assertVehicleOwnedBy(int $vehicleId, int $userId): void
       {
           $owned = $this->vehicles->where('id', $vehicleId)->where('user_id', $userId)->countAllResults() > 0;

           if (! $owned) {
               throw new DomainException('Kenderaan yang dipilih bukan milik anda.');
           }
       }
   }
   ```

4. Kemas kini `Config\Services::bookingService()` — connection dikongsi untuk kedua-dua service. Gantikan baris `return new BookingService(refNumbers: new ReferenceNumberService(db_connect()));` di hujung kaedah dengan:

   ```php
   return new BookingService(
       refNumbers: new ReferenceNumberService(db_connect()),
       db: db_connect(),
   );
   ```

**D. Route, controller & view**

5. Kumpulan `tlk/tempahan` — tambah:

   ```php
   $routes->post('(:num)/cancel', 'BookingController::cancel/$1', ['as' => 'tlk.cancel']);
   ```

   Kumpulan baharu (selepas kumpulan `tlk/tempahan`):

   ```php
   $routes->group('tlk/keputusan', ['namespace' => 'App\Controllers\Tlk', 'filter' => 'permission:tlk.decide'], static function (RouteCollection $routes): void {
       $routes->get('/', 'DecisionController::index', ['as' => 'tlk.decision.index']);
       $routes->post('(:num)/approve', 'DecisionController::approve/$1', ['as' => 'tlk.decision.approve']);
       $routes->post('(:num)/reject', 'DecisionController::reject/$1', ['as' => 'tlk.decision.reject']);
   });
   ```

   Semak dengan `Routes-tlk.php.txt` (modul **Templat & Rujukan**).

6. `app/Controllers/Tlk/DecisionController.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Tlk;

   use App\Controllers\BaseController;
   use App\Enums\BookingStatus;
   use App\Models\SlotBookingModel;
   use CodeIgniter\HTTP\RedirectResponse;
   use DomainException;

   class DecisionController extends BaseController
   {
       public function index(): string
       {
           $model  = model(SlotBookingModel::class);
           $status = (string) ($this->request->getGet('status') ?? BookingStatus::Pending->value);   // lalai: Menunggu

           $query = $model->listing();

           if (BookingStatus::tryFrom($status) !== null) {
               $query->where('slot_bookings.status', $status);
           }

           return view('tlk/decision/index', [
               'title'    => 'Keputusan Tempahan TLK',
               'bookings' => $query->paginate(15),
               'pager'    => $model->pager,
               'status'   => $status,
           ]);
       }

       public function approve(int $id): RedirectResponse
       {
           try {
               $booking = service('bookingService')->approve($id, auth()->id(), $this->request->getPost('remarks') ?: null);
           } catch (DomainException $e) {
               return redirect()->back()->with('error', $e->getMessage());
           }

           return redirect()->back()->with('success', 'Tempahan ' . $booking->ref_no . ' telah DILULUSKAN.');
       }

       public function reject(int $id): RedirectResponse
       {
           try {
               $booking = service('bookingService')->reject($id, auth()->id(), (string) $this->request->getPost('remarks'));
           } catch (DomainException $e) {
               return redirect()->back()->with('error', $e->getMessage());
           }

           return redirect()->back()->with('success', 'Tempahan ' . $booking->ref_no . ' telah DITOLAK.');
       }
   }
   ```

7. `app/Views/tlk/decision/index.php` — jadual tempahan dengan filter status. Setiap baris `pending` ada borang **Lulus** (POST, `data-confirm`) dan butang **Tolak** yang membuka baris `collapse` mengandungi input `remarks` (min 10 aksara) + butang *Sahkan Tolak*. Untuk admin, baris `approved` ada borang **Batal** → `tlk.cancel`. Badge status dan pautan no. rujukan ditambah dalam Lab 6.4:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php
   use App\Enums\BookingStatus;

   $isAdmin = auth()->user()->inGroup('admin');
   ?>

   <form method="get" class="d-flex gap-2 mb-3" style="max-width: 420px">
       <?= form_dropdown('status', ['' => 'Semua status'] + BookingStatus::options(), $status, ['class' => 'form-select', 'aria-label' => 'Tapis status']) ?>
       <button class="btn btn-outline-secondary" type="submit"><i class="bi bi-funnel"></i> Tapis</button>
   </form>

   <div class="card">
       <div class="table-responsive">
           <table class="table align-middle mb-0">
               <thead class="table-light">
               <tr><th>No. Rujukan</th><th>Pemohon</th><th>Slot</th><th>Tempoh</th><th>Status</th><th class="text-end">Tindakan</th></tr>
               </thead>
               <tbody>
               <?php foreach ($bookings as $b): ?>
                   <?php $current = $b->statusEnum(); ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($b->ref_no) ?></td>
                       <td><?= esc($b->applicant_name ?? '—') ?><div class="small text-muted"><?= esc($b->plate_no) ?></div></td>
                       <td><?= esc($b->zone_code) ?> / <?= esc($b->slot_no) ?></td>
                       <td><?= esc($b->start_date) ?> hingga <?= esc($b->end_date) ?> <span class="text-muted small">(<?= $b->durationDays() ?> hari)</span></td>
                       <td><?= esc($b->statusLabel()) ?></td>
                       <td class="text-end text-nowrap">
                           <?php if ($current->canTransitionTo(BookingStatus::Approved)): ?>
                               <form action="<?= url_to('tlk.decision.approve', $b->id) ?>" method="post" class="d-inline"
                                     data-confirm="Luluskan <?= esc($b->ref_no, 'attr') ?>?">
                                   <?= csrf_field() ?>
                                   <button type="submit" class="btn btn-sm btn-success"><i class="bi bi-check-lg"></i> Lulus</button>
                               </form>
                           <?php endif ?>
                           <?php if ($current->canTransitionTo(BookingStatus::Rejected)): ?>
                               <button type="button" class="btn btn-sm btn-outline-danger" data-bs-toggle="collapse"
                                       data-bs-target="#tolak-<?= $b->id ?>" aria-expanded="false" aria-controls="tolak-<?= $b->id ?>">
                                   <i class="bi bi-x-lg"></i> Tolak
                               </button>
                           <?php endif ?>
                           <?php if ($isAdmin && $current->canTransitionTo(BookingStatus::Cancelled)): ?>
                               <form action="<?= url_to('tlk.cancel', $b->id) ?>" method="post" class="d-inline"
                                     data-confirm="Batalkan <?= esc($b->ref_no, 'attr') ?>? Tindakan ini tidak boleh diundur.">
                                   <?= csrf_field() ?>
                                   <button type="submit" class="btn btn-sm btn-outline-secondary"><i class="bi bi-x-circle"></i> Batal</button>
                               </form>
                           <?php endif ?>
                       </td>
                   </tr>
                   <?php if ($current->canTransitionTo(BookingStatus::Rejected)): ?>
                       <tr class="collapse" id="tolak-<?= $b->id ?>">
                           <td colspan="6" class="bg-light">
                               <form action="<?= url_to('tlk.decision.reject', $b->id) ?>" method="post" class="d-flex gap-2"
                                     data-confirm="Tolak <?= esc($b->ref_no, 'attr') ?>?">
                                   <?= csrf_field() ?>
                                   <label for="remarks-<?= $b->id ?>" class="visually-hidden">Sebab penolakan</label>
                                   <input type="text" name="remarks" id="remarks-<?= $b->id ?>" class="form-control" minlength="10" required
                                          placeholder="Sebab penolakan (min 10 aksara)">
                                   <button class="btn btn-danger text-nowrap" type="submit">Sahkan Tolak</button>
                               </form>
                           </td>
                       </tr>
                   <?php endif ?>
               <?php endforeach ?>
               <?php if ($bookings === []): ?>
                   <tr><td colspan="6" class="text-center text-muted py-4">Tiada tempahan untuk status ini.</td></tr>
               <?php endif ?>
               </tbody>
           </table>
       </div>
   </div>

   <div class="mt-3"><?= $pager->links() ?></div>
   <?= $this->endSection() ?>
   ```

8. `BookingController` — gantikan `show()` (pelulus/admin boleh lihat; hantar sejarah) dan tambah `cancel()`. Tambah di atas kelas jika belum ada: `use App\Models\StatusLogModel; use App\Services\BookingService; use CodeIgniter\HTTP\RedirectResponse; use DomainException;`

   ```php
   public function show(int $id): string
   {
       $booking = model(SlotBookingModel::class)->findDetailed($id);

       // Pemohon: milik sendiri sahaja. Pelulus/admin (tlk.decide): semua.
       if ($booking === null || (! $booking->isOwnedBy(auth()->id()) && ! auth()->user()->can('tlk.decide'))) {
           throw PageNotFoundException::forPageNotFound('Tempahan tidak dijumpai.');
       }

       return view('tlk/booking/show', [
           'title'   => 'Tempahan ' . $booking->ref_no,
           'booking' => $booking,
           'history' => model(StatusLogModel::class)->history(BookingService::MODULE, $id),
       ]);
   }

   public function cancel(int $id): RedirectResponse
   {
       try {
           $booking = service('bookingService')->cancel($id, auth()->id(), $this->request->getPost('remarks') ?: null);
       } catch (DomainException $e) {
           return redirect()->back()->with('error', $e->getMessage());
       }

       return redirect()->back()->with('success', 'Tempahan ' . $booking->ref_no . ' telah dibatalkan.');
   }
   ```

9. Gantikan seluruh `app/Views/tlk/booking/show.php` — dua lajur: butiran tempahan (dengan butang Batal bersyarat) di kiri, **Sejarah Status** di kanan:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php
   use App\Enums\BookingStatus;
   use App\Enums\SlotCategory;
   ?>
   <div class="row g-4">
       <div class="col-lg-7">
           <div class="card">
               <div class="card-header d-flex justify-content-between align-items-center">
                   <span class="fw-semibold"><?= esc($booking->ref_no) ?></span>
                   <span><?= esc($booking->statusLabel()) ?></span>
               </div>
               <div class="card-body">
                   <dl class="row mb-0">
                       <dt class="col-sm-4">Pemohon</dt>
                       <dd class="col-sm-8"><?= esc($booking->applicant_name ?? '—') ?></dd>
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
               <?php if ($booking->statusEnum()->canTransitionTo(BookingStatus::Cancelled)): ?>
                   <div class="card-footer bg-white">
                       <form action="<?= url_to('tlk.cancel', $booking->id) ?>" method="post"
                             data-confirm="Batalkan tempahan <?= esc($booking->ref_no, 'attr') ?>? Tindakan ini tidak boleh diundur.">
                           <?= csrf_field() ?>
                           <button type="submit" class="btn btn-outline-danger"><i class="bi bi-x-circle"></i> Batalkan Tempahan</button>
                       </form>
                   </div>
               <?php endif ?>
           </div>
       </div>

       <div class="col-lg-5">
           <div class="card">
               <div class="card-header fw-semibold"><i class="bi bi-clock-history"></i> Sejarah Status</div>
               <ul class="list-group list-group-flush">
                   <?php foreach ($history as $log): ?>
                       <?php $to = BookingStatus::from($log['to_status']); ?>
                       <li class="list-group-item">
                           <span class="badge text-bg-<?= esc($to->badge(), 'attr') ?>"><?= esc($to->label()) ?></span>
                           <span class="small text-muted ms-1"><?= esc($log['created_at']) ?> · <?= esc($log['actor_name'] ?? '-') ?></span>
                           <?php if (! empty($log['remarks'])): ?>
                               <div class="small mt-1"><?= esc($log['remarks']) ?></div>
                           <?php endif ?>
                       </li>
                   <?php endforeach ?>
                   <?php if ($history === []): ?>
                       <li class="list-group-item text-muted fst-italic">Tiada rekod sejarah.</li>
                   <?php endif ?>
               </ul>
           </div>
       </div>
   </div>
   <a href="<?= url_to('tlk.index') ?>" class="btn btn-link mt-3 px-0">&larr; Kembali</a>
   <?= $this->endSection() ?>
   ```

**E. Buktikan kunci dengan dua sesi MySQL (demo wajib)**

10. Terminal A (klien MySQL):

    ```sql
    SELECT id FROM parking_slots WHERE slot_no = 'A-03';    -- cari ID (tanpa kunci), cth 3
    START TRANSACTION;
    SELECT id FROM parking_slots WHERE id = 3 FOR UPDATE;   -- kunci baris A-03 melalui PRIMARY KEY
    ```

    > Kenapa ikut `id`? InnoDB mengunci baris yang **diimbas melalui index**. `WHERE slot_no = 'A-03'` tiada index sendiri (hanya komposit `zone_id, slot_no`) → imbasan penuh → **semua** baris slot terkunci. Itulah juga sebabnya `lockRow()` sentiasa mengunci ikut `id`.

11. Pelayar: log masuk `pemohon2`, mohon slot **A-03** → tekan *Hantar*. Pelayar **berpusing** (menunggu kunci).
12. Dalam masa 50 saat, Terminal A: `COMMIT;` → pelayar serta-merta selesai.
13. Ulang langkah 10–11 tetapi **tunggu > 50 saat** → pelayar memaparkan ralat `Lock wait timeout exceeded` (`innodb_lock_wait_timeout` lalai 50 s). Catat dalam `docs/ujian-manual-tlk.md` — ini tingkah laku yang **betul** (permintaan tidak meneruskan tanpa kunci).
14. Ulang langkah 1 (dua pemohon, slot sama, tarikh bertindih) → kini hanya **satu** berjaya; yang kedua mendapat *"Slot ini sudah ditempah bagi tarikh yang bertindih."* Kemas kini TM-TLK-16 → ✅.

15. Commit `TLK: transaksi + kunci baris BR-TLK-01/04/05, keputusan & status_logs`.

### ✅ Checkpoint
- Langkah 11: permintaan **menunggu** sehingga `COMMIT` (bukti visual kunci baris).
- `pelulus@latihan.test` → `/tlk/keputusan` → *Lulus* satu tempahan → flash hijau; *Tolak* dengan sebab 5 aksara (buang dahulu atribut `minlength`/`required` pada `<input name="remarks">` melalui DevTools — pelayar menyekatnya; kita menguji peraturan **server**) → flash merah *"Sebab penolakan wajib diisi (sekurang-kurangnya 10 aksara)."*
- `pemohon1` → butiran tempahan yang diluluskan → *Batalkan* → status *Dibatalkan*; sejarah menunjukkan 3 baris (Menunggu → Diluluskan → Dibatalkan) dengan nama pelaku.
- Tempahan `pending` **tiada** butang Batal; POST terus ke `/tlk/tempahan/{id}/cancel` → mesej *"Status "Menunggu" tidak boleh ditukar kepada "Dibatalkan"."*
- `pemohon1` cuba tempahan kedua semasa satu masih `pending` → *"Anda sudah mempunyai satu tempahan aktif…"* (BR-TLK-04).
- SQL:

  ```sql
  SELECT module, record_id, from_status, to_status, actor_id, remarks FROM status_logs ORDER BY id;
  ```

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Demo langkah 11 **tidak** menunggu | `lockRow('parking_slots', …)` dipanggil di luar transaksi, atau slot berbeza | Pastikan `transBegin()` sebelum `lockRow()`; slot ID sama |
| `Lock wait timeout exceeded` dalam penggunaan biasa | Transaksi tidak ditutup (tiada `transCommit()`/`transRollback()` pada satu path) | Setiap path keluar dari `try` mesti commit **atau** rollback |
| `Deadlock found when trying to get lock` | Dua kaedah mengunci baris dalam **tertib berbeza** (slot→user vs user→slot) | Tertib kunci tetap: pengguna → slot |
| `There is no active transaction` / nombor rujukan melompat | `ReferenceNumberService` mencipta connection sendiri | Kedua-dua guna `db_connect()` (dikongsi) — langkah 4 |
| Log `status_logs` tidak ditulis | `StatusLogModel::$updatedField` tidak dikosongkan → `Unknown column 'updated_at'` | `$updatedField = ''` |
| `actor_name` kosong dalam sejarah | Pengguna tiada `full_name` | Semak seeder; `LEFT JOIN` memastikan baris masih dipapar |
| Pelulus mendapat 404 bila klik no. rujukan | `show()` masih semakan pemilik sahaja | Tambah `|| can('tlk.decide')` (langkah 8) |

### ⭐ Cabaran tambahan
- Spark command `tlk:expire` yang menukar tempahan `approved` dengan `end_date < hari ini` kepada `expired` melalui `transition()` (pelaku = pengguna sistem/admin). Jalankan `php spark tlk:expire` dan semak `status_logs`.
- Kunci baris tempahan dalam `approve()` menghalang dua pelulus serentak. Buktikan dengan dua sesi MySQL seperti langkah 10–12 tetapi pada `slot_bookings`.

---

## Lab 6.3 — Ujian PHPUnit Modul TLK (S3)

### 🎯 Objektif
Menulis ujian integrasi `BookingServiceTest` (pertindihan, BR-TLK-03/04, peralihan, log) dan ujian fungsian `DecisionAccessTest` (akses + aliran HTTP).

### Prasyarat
- Lab 6.2 di-merge; `git switch -c feat/tlk-ujian`
- Database `kkm_latihan_test` wujud dan `database.tests.*` dalam `.env` (README §3.2)

### Langkah

1. Sahkan konfigurasi ujian:

   ```bash
   composer test -- --no-coverage tests/tlk/BookingStatusTest.php       # ujian Hari 5 — masih hijau
   php spark db:table --show --dbgroup tests                            # sambungan ke kkm_latihan_test berjaya
   ```

2. `tests/tlk/BookingServiceTest.php` — salin rangka + pembantu ini dahulu, kemudian tampal ujian dari langkah 3 **satu demi satu**, jalankan selepas setiap satu:

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Tlk;

   use App\Enums\BookingStatus;
   use App\Services\BookingService;
   use App\Services\SlotAvailabilityService;
   use CodeIgniter\Test\CIUnitTestCase;
   use CodeIgniter\Test\DatabaseTestTrait;
   use DomainException;
   use PHPUnit\Framework\Attributes\DataProvider;

   /**
    * @internal
    */
   final class BookingServiceTest extends CIUnitTestCase
   {
       use DatabaseTestTrait;

       protected $migrate   = true;
       protected $refresh   = true;
       protected $namespace = null;   // Shield + App

       private BookingService $service;
       private int $applicantId;
       private int $otherApplicantId;
       private int $approverId;
       private int $vehicleId;
       private int $otherVehicleId;
       private int $slotId;
       private int $zoneId;

       protected function setUp(): void
       {
           parent::setUp();

           $this->applicantId      = $this->makeUser('ujian1', 'Pemohon Ujian Satu');
           $this->otherApplicantId = $this->makeUser('ujian2', 'Pemohon Ujian Dua');
           $this->approverId       = $this->makeUser('pelulus_ujian', 'Pelulus Ujian');

           $this->db->table('parking_zones')->insert(['code' => 'T', 'name' => 'Zon Ujian', 'location' => 'Makmal']);
           $this->zoneId = (int) $this->db->insertID();

           $this->db->table('parking_slots')->insert(['zone_id' => $this->zoneId, 'slot_no' => 'T-01', 'category' => 'oku', 'is_active' => 1]);
           $this->slotId = (int) $this->db->insertID();

           $this->db->table('vehicles')->insert(['user_id' => $this->applicantId, 'plate_no' => 'WXX 0001', 'model' => 'Proton Saga', 'color' => 'Putih']);
           $this->vehicleId = (int) $this->db->insertID();

           $this->db->table('vehicles')->insert(['user_id' => $this->otherApplicantId, 'plate_no' => 'WXX 0002', 'model' => 'Perodua Myvi', 'color' => 'Biru']);
           $this->otherVehicleId = (int) $this->db->insertID();

           $this->service = new BookingService();
       }

       // ---- ujian anda di sini ----

       private function makeUser(string $username, string $fullName): int
       {
           $this->db->table('users')->insert(['username' => $username, 'full_name' => $fullName, 'active' => 1]);

           return (int) $this->db->insertID();
       }

       private function day(int $offset): string
       {
           return date('Y-m-d', strtotime("{$offset} days"));
       }

       private function payload(int $startOffset, int $endOffset, ?int $vehicleId = null): array
       {
           return [
               'vehicle_id' => $vehicleId ?? $this->vehicleId,
               'slot_id'    => $this->slotId,
               'start_date' => $this->day($startOffset),
               'end_date'   => $this->day($endOffset),
               'reason'     => 'Ujian automatik tempahan slot.',
           ];
       }
   }
   ```

3. Ujian yang akan anda tambah (README §3.3 menerangkan dua daripadanya):

   | # | Ujian | Semak |
   |---|-------|-------|
   | 1 | `testCreateGeneratesReferencePendingStatusAndLog` | `ref_no` = `TLK-{tahun}-0001`, status Pending, baris `status_logs` `null → pending` |
   | 2 | `testOverlapDetection` + `rangeProvider` (7 kes) | Jadual Lab 6.1 langkah 1 |
   | 3 | `testCreateRejectsOverlappingBooking` | `expectExceptionMessage('bertindih')` |
   | 4 | `testRejectedBookingFreesTheSlot` | Tolak → slot boleh ditempah semula |
   | 5 | `testMoreThan90DaysIsRejected` | `payload(1, 92)` (end − start = 91) → exception `'90 hari'` |
   | 6 | `testExactly90DaysIsAllowed` | `payload(1, 91)` (end − start = 90) → berjaya |
   | 7 | `testSingleDayStartingTodayIsAllowed` | `payload(0, 0)` → berjaya, `durationDays() === 1` |
   | 8 | `testApplicantCanHaveOnlyOneActiveBooking` | Slot kedua, tarikh lain → exception `'tempahan aktif'` |
   | 9 | `testApproveSetsDecisionFieldsAndLogs` | `decided_by`, `decided_at`, log `pending → approved` |
   | 10 | `testCannotApproveRejectedBooking` | exception |
   | 11 | `testFailedTransitionDoesNotWriteLog` | README §3.3 |
   | 12 | `testOwnerCanCancelApprovedBooking` / `testOtherUserCannotCancelBooking` / `testAdminCanCancelSomeoneElsesApprovedBooking` | Hanya pemilik atau admin |

   Tampal kaedah di bawah di tempat baris komen penanda ujian dalam rangka langkah 2, satu ujian pada satu masa. Ujian admin memberi kumpulan `admin` dengan `auth()->getProvider()->findById($adminId)->addGroup('admin');`:

   ```php
       public function testCreateGeneratesReferencePendingStatusAndLog(): void
       {
           $booking = $this->service->create($this->applicantId, $this->payload(3, 10));

           $this->assertSame('TLK-' . date('Y') . '-0001', $booking->ref_no);
           $this->assertSame(BookingStatus::Pending, $booking->statusEnum());

           $this->seeInDatabase('status_logs', [
               'module'      => 'TLK',
               'record_id'   => $booking->id,
               'from_status' => null,
               'to_status'   => 'pending',
               'actor_id'    => $this->applicantId,
           ]);
       }

       /**
        * Tempahan sedia ada: hari +10 hingga +20 (jadual Lab 6.1 langkah 1).
        *
        * @return array<string, array{int, int, bool}> [mula, tamat, dijangka bertindih?]
        */
       public static function rangeProvider(): array
       {
           return [
               'sama tepat'                => [10, 20, true],
               'bertindih di hujung awal'  => [5, 10, true],    // hari +10 dikongsi
               'bertindih di hujung akhir' => [20, 25, true],   // hari +20 dikongsi
               'di dalam'                  => [12, 15, true],
               'meliputi keseluruhan'      => [5, 25, true],
               'sebelum (bersebelahan)'    => [5, 9, false],
               'selepas (bersebelahan)'    => [21, 25, false],
           ];
       }

       #[DataProvider('rangeProvider')]
       public function testOverlapDetection(int $start, int $end, bool $expected): void
       {
           $this->service->create($this->applicantId, $this->payload(10, 20));

           $overlap = (new SlotAvailabilityService())->hasOverlap($this->slotId, $this->day($start), $this->day($end));

           $this->assertSame($expected, $overlap);
       }

       public function testCreateRejectsOverlappingBooking(): void
       {
           $this->service->create($this->applicantId, $this->payload(10, 20));

           $this->expectException(DomainException::class);
           $this->expectExceptionMessage('bertindih');

           $this->service->create($this->otherApplicantId, $this->payload(15, 25, $this->otherVehicleId));
       }

       public function testRejectedBookingFreesTheSlot(): void
       {
           $first = $this->service->create($this->applicantId, $this->payload(10, 20));
           $this->service->reject($first->id, $this->approverId, 'Dokumen sokongan tidak lengkap.');

           // Status 'rejected' bukan aktif → slot boleh ditempah semula
           $second = $this->service->create($this->otherApplicantId, $this->payload(10, 20, $this->otherVehicleId));

           $this->assertSame(BookingStatus::Pending, $second->statusEnum());
       }

       public function testMoreThan90DaysIsRejected(): void
       {
           $this->expectException(DomainException::class);
           $this->expectExceptionMessage('90 hari');

           $this->service->create($this->applicantId, $this->payload(1, 92));   // end − start = 91 hari
       }

       public function testExactly90DaysIsAllowed(): void
       {
           $booking = $this->service->create($this->applicantId, $this->payload(1, 91));   // end − start = 90 hari

           $this->assertSame(BookingStatus::Pending, $booking->statusEnum());
       }

       public function testSingleDayStartingTodayIsAllowed(): void
       {
           $booking = $this->service->create($this->applicantId, $this->payload(0, 0));

           $this->assertSame(1, $booking->durationDays());
       }

       public function testApplicantCanHaveOnlyOneActiveBooking(): void
       {
           $this->db->table('parking_slots')->insert(['zone_id' => $this->zoneId, 'slot_no' => 'T-02', 'category' => 'oku', 'is_active' => 1]);
           $secondSlot = (int) $this->db->insertID();

           $this->service->create($this->applicantId, $this->payload(10, 20));

           $this->expectException(DomainException::class);
           $this->expectExceptionMessage('tempahan aktif');

           $this->service->create($this->applicantId, ['slot_id' => $secondSlot] + $this->payload(30, 40));
       }

       public function testApproveSetsDecisionFieldsAndLogs(): void
       {
           $booking  = $this->service->create($this->applicantId, $this->payload(3, 10));
           $approved = $this->service->approve($booking->id, $this->approverId);

           $this->assertSame(BookingStatus::Approved, $approved->statusEnum());
           $this->assertSame($this->approverId, $approved->decided_by);
           $this->assertNotNull($approved->decided_at);
           $this->seeInDatabase('status_logs', ['record_id' => $booking->id, 'from_status' => 'pending', 'to_status' => 'approved']);
       }

       public function testCannotApproveRejectedBooking(): void
       {
           $booking = $this->service->create($this->applicantId, $this->payload(3, 10));
           $this->service->reject($booking->id, $this->approverId, 'Kategori slot tidak sepadan.');

           $this->expectException(DomainException::class);

           $this->service->approve($booking->id, $this->approverId);
       }

       public function testFailedTransitionDoesNotWriteLog(): void
       {
           $booking = $this->service->create($this->applicantId, $this->payload(3, 10));

           try {
               $this->service->cancel($booking->id, $this->applicantId);   // pending → cancelled TIDAK dibenarkan
               $this->fail('Sepatutnya DomainException');
           } catch (DomainException) {
               // dijangka
           }

           $this->seeNumRecords(1, 'status_logs', ['record_id' => $booking->id]);   // hanya log 'pending'
           $this->seeInDatabase('slot_bookings', ['id' => $booking->id, 'status' => 'pending']);
       }

       public function testOwnerCanCancelApprovedBooking(): void
       {
           $booking = $this->service->create($this->applicantId, $this->payload(3, 10));
           $this->service->approve($booking->id, $this->approverId);

           $cancelled = $this->service->cancel($booking->id, $this->applicantId);

           $this->assertSame(BookingStatus::Cancelled, $cancelled->statusEnum());
           $this->seeNumRecords(3, 'status_logs', ['record_id' => $booking->id]);
       }

       public function testOtherUserCannotCancelBooking(): void
       {
           $booking = $this->service->create($this->applicantId, $this->payload(3, 10));
           $this->service->approve($booking->id, $this->approverId);

           $this->expectException(DomainException::class);

           $this->service->cancel($booking->id, $this->otherApplicantId);
       }

       public function testAdminCanCancelSomeoneElsesApprovedBooking(): void
       {
           $adminId = $this->makeUser('admin_ujian', 'Admin Ujian');
           auth()->getProvider()->findById($adminId)->addGroup('admin');

           $booking = $this->service->create($this->applicantId, $this->payload(3, 10));
           $this->service->approve($booking->id, $this->approverId);

           $cancelled = $this->service->cancel($booking->id, $adminId, 'Slot diperlukan untuk kerja penyelenggaraan.');

           $this->assertSame(BookingStatus::Cancelled, $cancelled->statusEnum());
           $this->seeInDatabase('status_logs', ['record_id' => $booking->id, 'to_status' => 'cancelled', 'actor_id' => $adminId]);
       }
   ```

   ```bash
   composer test -- --no-coverage --testdox tests/tlk/BookingServiceTest.php
   ```

4. `tests/tlk/DecisionAccessTest.php` — ujian fungsian HTTP (salin, kemudian **terangkan setiap ujian kepada jurulatih atau rakan sebelah**):

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Tlk;

   use App\Models\UserModel;
   use App\Services\BookingService;
   use CodeIgniter\Shield\Entities\User;
   use CodeIgniter\Shield\Test\AuthenticationTesting;
   use CodeIgniter\Test\CIUnitTestCase;
   use CodeIgniter\Test\DatabaseTestTrait;
   use CodeIgniter\Test\FeatureTestTrait;

   /**
    * @internal
    */
   final class DecisionAccessTest extends CIUnitTestCase
   {
       use DatabaseTestTrait;
       use FeatureTestTrait;
       use AuthenticationTesting;   // Shield: actingAs($user)

       protected $migrate   = true;
       protected $refresh   = true;
       protected $namespace = null;

       private array $originalBeforeFilters;
       private User $applicant;
       private User $approver;
       private int $bookingId;

       protected function setUp(): void
       {
           // Shield menyimpan pengguna log masuk dalam service 'auth' (dikongsi) — tanpa reset,
           // actingAs() dari kelas ujian lain "bocor" ke ujian ini apabila semua ujian dijalankan bersama.
           // MESTI sebelum parent::setUp() (yang memasang mock session/cache).
           $this->resetServices();

           parent::setUp();

           // Ujian ini menguji AKSES, bukan CSRF → nyahaktif CSRF dalam ujian sahaja
           $filters                     = config('Filters');
           $this->originalBeforeFilters = $filters->globals['before'];
           $filters->globals['before']  = array_filter($filters->globals['before'], static fn ($v) => $v !== 'csrf');

           $this->applicant = $this->makeUser('pemohon_ujian', 'applicant');
           $this->approver  = $this->makeUser('pelulus_ujian', 'approver');

           $this->db->table('parking_zones')->insert(['code' => 'T', 'name' => 'Zon Ujian', 'location' => 'Makmal']);
           $this->db->table('parking_slots')->insert(['zone_id' => $this->db->insertID(), 'slot_no' => 'T-01', 'category' => 'oku', 'is_active' => 1]);
           $slotId = $this->db->insertID();
           $this->db->table('vehicles')->insert(['user_id' => $this->applicant->id, 'plate_no' => 'WXX 0001', 'model' => 'Proton Saga', 'color' => 'Putih']);

           $this->bookingId = (new BookingService())->create($this->applicant->id, [
               'vehicle_id' => $this->db->insertID(),
               'slot_id'    => $slotId,
               'start_date' => date('Y-m-d', strtotime('+3 days')),
               'end_date'   => date('Y-m-d', strtotime('+10 days')),
               'reason'     => 'Ujian fungsian aliran keputusan.',
           ])->id;
       }

       protected function tearDown(): void
       {
           config('Filters')->globals['before'] = $this->originalBeforeFilters;   // pulihkan untuk ujian lain

           parent::tearDown();
       }

       public function testGuestIsRedirectedToLogin(): void
       {
           $result = $this->get('tlk/keputusan');

           $result->assertRedirect();
           $this->assertStringContainsString('login', $result->getRedirectUrl());
       }

       public function testApplicantCannotOpenDecisionPage(): void
       {
           $result = $this->actingAs($this->applicant)->get('tlk/keputusan');

           $result->assertRedirect();   // Shield: tiada kebenaran → redirect + flash 'error'
           $result->assertDontSee('Keputusan Tempahan TLK');
       }

       public function testApplicantCannotApproveViaDirectPost(): void
       {
           $this->actingAs($this->applicant)->post("tlk/keputusan/{$this->bookingId}/approve");

           $this->seeInDatabase('slot_bookings', ['id' => $this->bookingId, 'status' => 'pending']);
       }

       public function testApproverSeesPendingList(): void
       {
           $result = $this->actingAs($this->approver)->get('tlk/keputusan');

           $result->assertOK();
           $result->assertSee('TLK-' . date('Y') . '-0001');
       }

       public function testApproverCanApprove(): void
       {
           $result = $this->actingAs($this->approver)->post("tlk/keputusan/{$this->bookingId}/approve");

           $result->assertRedirect();
           $result->assertSessionHas('success');
           $this->seeInDatabase('slot_bookings', ['id' => $this->bookingId, 'status' => 'approved', 'decided_by' => $this->approver->id]);
       }

       private function makeUser(string $username, string $group): User
       {
           $users = model(UserModel::class);
           $id    = $users->insert(['username' => $username, 'full_name' => ucfirst($username), 'active' => 1]);
           $user  = $users->findById($id);
           $user->addGroup($group);

           return $user;
       }
   }
   ```

5. Jalankan semua ujian TLK:

   ```bash
   composer test -- --no-coverage --testdox tests/tlk
   ```

6. **Kitaran merah → hijau (wajib, 10 minit):** dalam `BookingService::create()`, komen sementara baris `hasOverlap()`. Jalankan ujian → catat ujian mana yang **merah**. Pulihkan → hijau. Ulang dengan menukar `->where('start_date <=', $end)` kepada `<` dalam `hasOverlap()`. Tulis dapatan dalam `docs/ujian-manual-tlk.md` (bahagian "Ujian mutasi").

7. Commit `TLK: ujian PHPUnit BookingService + akses keputusan`.

### ✅ Checkpoint
- `composer test -- --no-coverage tests/tlk` → `OK` dengan **≥ 25 ujian** (BookingStatus 5 + BookingService ≥ 15 + DecisionAccess 5). Penyelesaian rujukan (tag `penyelesaian-hari-6`): **43** = BookingStatus 6 (dengan ⭐) + BookingService 28 (template 27 + 1) + DecisionAccess 7 (dengan ⭐) + ReferenceNumberService 2.
- Langkah 6: membuang `hasOverlap()` menyebabkan sekurang-kurangnya `testCreateRejectsOverlappingBooking` merah; menukar `<=` → `<` menyebabkan kes *"bertindih di hujung awal"* merah.
- `mysql -u kkm_dev -p -e "SELECT COUNT(*) FROM slot_bookings" kkm_latihan` sebelum dan selepas `composer test` → nombor **sama** dan bukan `0` (tempahan Lab 6.1–6.2 masih ada). Ujian menulis ke `kkm_latihan_test` (kumpulan `tests`), **bukan** `kkm_latihan`.
- Bandingkan dengan `BookingServiceTest.php.txt` (modul **Templat & Rujukan**).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `near "FOR": syntax error` | Kumpulan `tests` masih SQLite `:memory:` | Tetapkan `database.tests.*` MySQL dalam `.env` |
| `Table 'kkm_latihan_test.users' doesn't exist` | `$namespace = 'App'` (lalai) — migration Shield tidak dijalankan | `protected $namespace = null;` |
| `Access denied for user … to database 'kkm_latihan_test'` | Tiada `GRANT` | `GRANT ALL ON kkm_latihan_test.* TO 'kkm_dev'@'localhost';` |
| `The action you requested is not allowed.` dalam ujian POST | CSRF global aktif | Nyahaktif dalam `setUp()` + pulihkan dalam `tearDown()` (langkah 4) |
| Ujian lulus seorang diri tetapi gagal bila dijalankan bersama | Keadaan bocor antara ujian (cth filter tidak dipulihkan, ID dikod keras, pengguna `actingAs()` kelas lain kekal dalam service `auth` Shield) | `$refresh = true`; pulihkan konfigurasi; guna `insertID()`; `$this->resetServices();` **sebelum** `parent::setUp()` (langkah 4) |
| Ujian tarikh gagal selepas tengah malam | Tarikh dikod keras / zon waktu | Tarikh relatif `strtotime('+N days')`; `app.appTimezone` |
| `No code coverage driver available` | Amaran sahaja | `--no-coverage` |

### ⭐ Cabaran tambahan
- Ujian fungsian: pemohon2 membuka `/tlk/tempahan/{id}` milik pemohon1. Dalam `FeatureTestTrait`, `PageNotFoundException` **dibaling** terus ke ujian (bukan respons 404), jadi guna `$this->expectException(\CodeIgniter\Exceptions\PageNotFoundException::class);` sebelum `->get(…)`.
- Ujian `ReferenceNumberService`: tahun berbeza → nombor bermula semula dari 0001 (petua: masukkan terus baris `('TLK', (int) date('Y') - 1, 42)` dan pastikan `next('TLK')` masih `'TLK-' . date('Y') . '-0001'` — jangan kod keras tahun, ujian akan gagal tahun depan).

---

## Lab 6.4 — Penambahbaikan UI & M1 Siap (S4)

### 🎯 Objektif
Menggilap UI Modul TLK (badge, flash, pengesahan, pagination Bootstrap, menu ikut kebenaran) dan mendemokan M1 hujung-ke-hujung.

### Prasyarat
- Lab 6.1–6.3 di-merge ke `main`; ujian hijau

### Langkah

1. **Badge status** — dalam `tlk/booking/index.php` dan `tlk/decision/index.php`, gantikan baris `<td><?= esc($b->statusLabel()) ?></td>` dengan:

   ```php
   <td><span class="badge text-bg-<?= esc($b->statusBadge(), 'attr') ?>"><?= esc($b->statusLabel()) ?></span></td>
   ```

   Dalam `tlk/booking/show.php` (header kad), gantikan `<span><?= esc($booking->statusLabel()) ?></span>` dengan:

   ```php
   <span class="badge text-bg-<?= esc($booking->statusBadge(), 'attr') ?>"><?= esc($booking->statusLabel()) ?></span>
   ```

2. **Flash** — `partials/flash.php` menjadi boleh ditutup dengan ikon (kekalkan kedua-dua kunci berjaya `success` dan `message` — konvensyen Lab 4):

   ```php
   <?php foreach (['success', 'message'] as $key): ?>
       <?php if (session($key)): ?>
           <div class="alert alert-success alert-dismissible fade show" role="alert">
               <i class="bi bi-check-circle-fill"></i> <?= esc(session($key)) ?>
               <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
           </div>
       <?php endif ?>
   <?php endforeach ?>
   <?php if (session('error')): ?>
       <div class="alert alert-danger alert-dismissible fade show" role="alert">
           <i class="bi bi-exclamation-triangle-fill"></i> <?= esc(session('error')) ?>
           <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
       </div>
   <?php endif ?>
   ```

3. **Layout** — gantikan seluruh `app/Views/layouts/main.php`: menu *Tempahan Saya*, *Mohon Slot* (`can('tlk.apply')`), *Slot Kosong*, *Keputusan TLK* (`can('tlk.decide')`), *Urus Slot* (`inGroup('admin')`), dan skrip `data-confirm` sebelum `</body>` (README §4.1):

   ```php
   <?php
   /**
    * Layout utama — Bootstrap 5.3 + Bootstrap Icons.
    * Guna dalam view: <?= $this->extend('layouts/main') ?> + <?= $this->section('content') ?> (kandungan) <?= $this->endSection() ?>
    *
    * @var \CodeIgniter\View\View $this
    * @var string|null            $title
    */
   $user = auth()->loggedIn() ? auth()->user() : null;
   ?>
   <!doctype html>
   <html lang="ms">
   <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title><?= esc($title ?? 'Sistem TLK & Pas') ?> · KKM (Latihan)</title>
       <!-- Tiada internet di makmal? Muat turun fail ke public/assets/ dan tukar href kepada base_url('assets/bootstrap.min.css') -->
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
       <?= $this->renderSection('head') ?>
   </head>
   <body class="bg-body-tertiary d-flex flex-column min-vh-100">

   <nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
       <div class="container">
           <a class="navbar-brand fw-semibold" href="<?= site_url('/') ?>">
               <i class="bi bi-p-square-fill"></i> TLK &amp; Pas
           </a>
           <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navUtama"
                   aria-controls="navUtama" aria-expanded="false" aria-label="Menu">
               <span class="navbar-toggler-icon"></span>
           </button>

           <div class="collapse navbar-collapse" id="navUtama">
               <?php if ($user !== null): ?>
                   <ul class="navbar-nav me-auto">
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.index') ?>"><i class="bi bi-list-ul"></i> Tempahan Saya</a></li>
                       <?php if ($user->can('tlk.apply')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.new') ?>"><i class="bi bi-plus-circle"></i> Mohon Slot</a></li>
                       <?php endif ?>
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.availability') ?>"><i class="bi bi-search"></i> Slot Kosong</a></li>
                       <?php if ($user->can('tlk.decide')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.decision.index') ?>"><i class="bi bi-check2-square"></i> Keputusan TLK</a></li>
                       <?php endif ?>
                       <?php if ($user->inGroup('admin')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('admin.slot.index') ?>"><i class="bi bi-gear"></i> Urus Slot</a></li>
                       <?php endif ?>
                   </ul>
                   <span class="navbar-text me-3">
                       <i class="bi bi-person-circle"></i> <?= esc($user->full_name ?? $user->username) ?>
                   </span>
                   <a class="btn btn-outline-light btn-sm" href="<?= url_to('logout') ?>"><i class="bi bi-box-arrow-right"></i> Log Keluar</a>
               <?php endif ?>
           </div>
       </div>
   </nav>

   <main class="container py-4 flex-grow-1">
       <?php if (! empty($title)): ?>
           <h1 class="h3 mb-3"><?= esc($title) ?></h1>
       <?php endif ?>

       <?= $this->include('partials/flash') ?>

       <?= $this->renderSection('content') ?>
   </main>

   <footer class="py-3 border-top bg-white small text-muted">
       <div class="container">Sistem latihan CI-KKM-10 · data sintetik sahaja</div>
   </footer>

   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
   <script>
       // Dialog pengesahan: <form data-confirm="Anda pasti?"> — elak klik tidak sengaja.
       document.querySelectorAll('form[data-confirm]').forEach(function (form) {
           form.addEventListener('submit', function (event) {
               if (!window.confirm(form.dataset.confirm)) {
                   event.preventDefault();
               }
           });
       });
   </script>
   <?= $this->renderSection('scripts') ?>
   </body>
   </html>
   ```

4. **Pagination Bootstrap** — cipta `app/Views/pager/bootstrap_full.php`:

   ```php
   <?php
   /** @var \CodeIgniter\Pager\PagerRenderer $pager */
   $pager->setSurroundCount(2);
   ?>
   <nav aria-label="Navigasi halaman">
       <ul class="pagination pagination-sm mb-0">
           <?php if ($pager->hasPrevious()): ?>
               <li class="page-item"><a class="page-link" href="<?= $pager->getFirst() ?>" aria-label="Pertama">&laquo;</a></li>
               <li class="page-item"><a class="page-link" href="<?= $pager->getPrevious() ?>" aria-label="Sebelum">&lsaquo;</a></li>
           <?php endif ?>

           <?php foreach ($pager->links() as $link): ?>
               <li class="page-item <?= $link['active'] ? 'active' : '' ?>">
                   <a class="page-link" href="<?= $link['uri'] ?>"<?= $link['active'] ? ' aria-current="page"' : '' ?>><?= $link['title'] ?></a>
               </li>
           <?php endforeach ?>

           <?php if ($pager->hasNext()): ?>
               <li class="page-item"><a class="page-link" href="<?= $pager->getNext() ?>" aria-label="Seterusnya">&rsaquo;</a></li>
               <li class="page-item"><a class="page-link" href="<?= $pager->getLast() ?>" aria-label="Terakhir">&raquo;</a></li>
           <?php endif ?>
       </ul>
   </nav>
   ```

   `app/Config/Pager.php` — tukar template lalai supaya **semua** `$pager->links()` menggunakan Bootstrap:

   ```php
   public array $templates = [
       'default_full'   => 'App\Views\pager\bootstrap_full',
       'default_simple' => 'CodeIgniter\Pager\Views\default_simple',
       'default_head'   => 'CodeIgniter\Pager\Views\default_head',
   ];
   ```

5. **Pautan** — dalam `tlk/decision/index.php`, gantikan baris `<td class="fw-semibold"><?= esc($b->ref_no) ?></td>` dengan pautan ke butiran:

   ```php
   <td class="fw-semibold"><a href="<?= url_to('tlk.show', $b->id) ?>"><?= esc($b->ref_no) ?></a></td>
   ```

   Dalam `tlk/booking/form.php`, tambah pautan ini terus selepas baris `$invalid` (sebelum `<?php if ($vehicles === []): ?>`):

   ```php
   <p><a href="<?= url_to('tlk.availability') ?>"><i class="bi bi-search"></i> Semak slot kosong dahulu</a></p>
   ```

6. **Senarai semak aksesibiliti ringkas:** setiap `<input>` ada `<label for>`; butang ikon ada teks; warna badge bukan satu-satunya petunjuk (label teks sentiasa ada).

7. **Demo M1 (5 minit setiap peserta)** — skrip:

   **Prasyarat:** `pemohon1` dan `pemohon2` masih ada tempahan aktif dari Lab 6.1–6.2. Tanpa langkah ini, langkah 1–2 terkena BR-TLK-04 (*"Anda sudah mempunyai satu tempahan aktif…"*), bukan BR-TLK-01. Kosongkan melalui aplikasi supaya `status_logs` lengkap: `pelulus` → `/tlk/keputusan` → *Tolak* setiap tempahan `pending` (sebab ≥ 10 aksara); pemohon → butiran → *Batalkan* setiap tempahan `approved`. Sahkan:

   ```sql
   SELECT user_id, ref_no, status FROM slot_bookings WHERE status IN ('pending', 'approved');
   -- 0 baris bagi user_id pemohon1 & pemohon2
   ```


   | # | Peranan | Tindakan | Tunjuk |
   |---|---------|----------|--------|
   | 1 | pemohon1 | Semak slot kosong → mohon A-04 | `TLK-…` baharu, badge *Menunggu*, sejarah 1 baris |
   | 2 | pemohon2 | Mohon A-04, tarikh bertindih | Mesej *bertindih* (BR-TLK-01) |
   | 3 | pelulus | Keputusan → Lulus (dialog pengesahan) | Badge *Diluluskan*, flash |
   | 4 | pemohon1 | Butiran → Batal | Sejarah 3 baris dengan nama pelaku |
   | 5 | pemohon1 | Taip `/tlk/keputusan` | Dialih — tiada akses |
   | 6 | — | `composer test -- --no-coverage tests/tlk` | Hijau |

8. Kemas kini `docs/ujian-manual-tlk.md` (TM-TLK-16 ✅), tanda DoD M1 (README §4.2) dalam `docs/pelan-kerja.md`, kemudian:

   ```bash
   git add -A && git commit -m "TLK: penambahbaikan UI — badge, flash, pengesahan, pagination"
   git tag -a m1-siap -m "M1 TLK siap: ketersediaan, transaksi, keputusan, ujian"
   git push && git push --tags
   ```

### ✅ Checkpoint
- `/admin/slot?page=2` memaparkan pagination Bootstrap (`<ul class="pagination">` dengan `page-item active`).
- Klik *Lulus* → dialog `confirm()` muncul; *Batal* dalam dialog → tiada perubahan.
- Log masuk sebagai 3 peranan → menu berbeza mengikut kebenaran.
- Demo 6 langkah berjaya di hadapan jurulatih; `git tag` menunjukkan `m1-siap`.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Dialog pengesahan tidak muncul | Skrip diletak sebelum borang dimuat / dalam `<head>` | Letak skrip di hujung `<body>` selepas `bootstrap.bundle` |
| Butang *Tolak* tidak membuka baris | `bootstrap.bundle.min.js` tidak dimuat | Pastikan skrip JS Bootstrap dalam layout |
| `Invalid file: "App\Views\pager\bootstrap_full.php"` | Path/nama fail salah | Fail `app/Views/pager/bootstrap_full.php`; nilai config tanpa `.php` |
| Badge tiada warna | Kelas salah eja (`bg-text-warning`) atau guna sintaks Bootstrap 4 (`badge-warning`) | `badge text-bg-{warna}` (Bootstrap 5.3) |

### ⭐ Cabaran tambahan
- Tunjukkan bilangan tempahan `pending` sebagai badge pada menu *Keputusan TLK* (`countAllResults()` — pertimbangkan kos query setiap halaman).
- Sediakan paparan mesra cetak (`@media print`) untuk butiran tempahan yang diluluskan — pemohon boleh meletakkannya di papan pemuka kereta.

---

## Semakan kendiri — akhir hari

```bash
composer test -- --no-coverage tests/tlk   # OK (≥ 25 tests, …)
git tag                                    # … m1-siap
git status --short                         # tiada output
```

- [ ] `/tlk/tempahan/ketersediaan` dengan julat tarikh memaparkan slot kosong sahaja (slot yang ditempah bertindih tiada dalam senarai).
- [ ] BR-TLK-01: dua pemohon, slot sama, tarikh bertindih → hanya satu berjaya; TM-TLK-16 ✅ dalam `docs/ujian-manual-tlk.md`.
- [ ] BR-TLK-04: `pemohon1` dengan satu tempahan `pending` tidak boleh membuat tempahan kedua.
- [ ] Lulus → Batal satu tempahan menghasilkan 3 baris dalam `status_logs` (`from_status` → `to_status`, `actor_id` diisi).
- [ ] `composer test -- --no-coverage tests/tlk` → `OK` dengan ≥ 25 ujian.
- [ ] `git tag` menunjukkan `m1-siap`; `git status --short` kosong dan `git push --tags` selesai.
