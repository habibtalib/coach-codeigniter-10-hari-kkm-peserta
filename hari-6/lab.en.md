# Lab Day 6 — TLK Module (Part 2)

[⬅️ README Day 6](./README.md) · [📘 SPEC](../docs/spesifikasi-sistem.md) · 🧩 Code templates (**Templat & Rujukan** module) · [⚡ spark commands](../docs/arahan-spark.md)

> **Lab rules:** today is about **accuracy under pressure**, not speed. Every step gives complete code to copy. Fill in the overlap table (Lab 6.1 step 1) **before** copying the query, and read every line of the transaction before running it. AI can help explain `Lock wait timeout` or `errno` — but you must be able to explain why the locks are taken in the order user → slot.

| Lab | Session | Branch | Result |
|-----|------|--------|-------|
| 6.1 | S1 09:00–10:00 | `feat/tlk-ketersediaan` | `SlotAvailabilityService` + free-slot view |
| 6.1b | S5 10:00–10:30 | `feat/tlk-ketersediaan` | Busy-slot board `/tlk/tempahan/ketersediaan/sibuk` (approvers & admins) |
| 6.2 | S2 10:45–12:00 | `feat/tlk-keputusan` | `BookingService` v2 + `status_logs` + approve/reject/cancel |
| 6.2b | S6 12:00–12:30 | `feat/tlk-keputusan` | `php spark tlk:expire` — `approved` → `expired` through `transition()` |
| 6.3 | S3 14:30–15:30 | `feat/tlk-ujian` | `BookingServiceTest` + `DecisionAccessTest` green |
| 6.3b | S7 15:30–15:55 | `feat/tlk-ujian` | `BusySlotsTest` + `ExpireBookingTest` green; two mutations caught |
| 6.3c | S7 15:55–16:15 | `feat/tlk-ujian` | Claude Code: `.claude/settings.json`, `CLAUDE.md`, 2 `reject()` tests, AI checked by running |
| 6.4 | S4 16:15–16:40 | `main` | Polished UI, M1 demo, tag `m1-siap` |
| 6.4b | S8 16:40–17:00 | `main` | *Tempahan Saya* (My Bookings): status tabs with counts, Cancel right from the list |

---

## Lab 6.1 — Slot Availability Check (S1)

### 🎯 Objective
Write `SlotAvailabilityService` (`hasOverlap()` & `availableSlots()`) and a view of free slots for a date range in the TLK (Special Vehicle Parking — *Tempat Letak Kenderaan Khas*) module.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Day 5 merged into `main`; `TLK-2026-0001` exists
- `git switch main && git pull && git switch -c feat/tlk-ketersediaan`

### Steps

1. **On paper first (5 min).** Copy this table into `docs/pertindihan-tarikh.md` and fill in the *Overlap?* column **before** writing any code. Existing booking: 10–20 Oct.

   | Case | New | `E.start <= N.end`? | `E.end >= N.start`? | Overlap? |
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

3. Register it in `app/Config/Services.php` — add this method inside the `Services` class, after `bookingService()` (also add `use App\Services\SlotAvailabilityService;`):

   ```php
   public static function slotAvailability(bool $getShared = true): SlotAvailabilityService
   {
       if ($getShared) {
           return static::getSharedInstance('slotAvailability');
       }

       return new SlotAvailabilityService();
   }
   ```

4. Route — inside the `tlk/tempahan` group, **before** `(:num)`:

   ```php
   $routes->get('ketersediaan', 'BookingController::availability', ['as' => 'tlk.availability']);
   ```

5. `BookingController::availability()` (add `use App\Enums\SlotCategory; use App\Models\ParkingZoneModel;`):

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

       $slots  = null;   // null = form not submitted yet
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

7. Test and commit `TLK: semakan ketersediaan slot (BR-TLK-01)`.

### ✅ Checkpoint
- `docs/pertindihan-tarikh.md`: cases 1–5 overlap, cases 6–7 do not (Quiz S1).
- Booking `TLK-2026-0001` (slot A-01) is in the DB. Open `http://localhost:8080/tlk/tempahan/ketersediaan?start_date=<mula>&end_date=<tamat>&category=oku` with dates that **overlap** that booking → A-01 is **not** in the list; with dates **after** the booking ends → A-01 **is** in the list (Quiz S1).
- Debug Toolbar → *Database*: the query contains `NOT IN (SELECT slot_id FROM slot_bookings WHERE status IN ('pending','approved') …)` (Quiz S1).
- `?start_date=2026-10-20&end_date=2026-10-10` → error message, no list (Quiz S1).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `/tlk/tempahan/ketersediaan` → 404 | Route not added yet, misspelt, or placed outside the `tlk/tempahan` group | `php spark routes \| grep ketersediaan` |
| Deleted (soft-deleted) slots appear | Using `$this->slots->builder()` (raw Query Builder) | Use Model methods (`withZone()->…->findAll()`) — the `deleted_at` filter is automatic |
| All slots disappear | Subquery without `whereIn('status', …)` / condition reversed | Check the table from step 1 |
| `Call to undefined method … whereNotIn() closure` | Old CI version | CI ≥ 4.6 supports closure subqueries |

### ⭐ Bonus challenge
- Show the number of free slots per zone above the cards (`array_count_values(array_column($slots, 'zone_code'))`).
- Add an "Apply for this slot" button on each card that opens `/tlk/tempahan/new?slot_id=…&start_date=…&end_date=…` and fills the form in automatically.

---

## Lab 6.2 — Transactions, Row Locks, Approval & `status_logs` (S2)

### 🎯 Objective
Upgrade `BookingService` to version 2 (transaction + `FOR UPDATE` + BR-TLK-01/04/05), add `StatusLogModel`, `DecisionController` and cancellation, and prove the lock with two MySQL sessions.

### Prerequisites
- Lab 6.1 merged; `git switch -c feat/tlk-keputusan`
- MySQL CLI client (`mysql -u kkm_dev -p kkm_latihan`) or HeidiSQL/TablePlus with two query tabs. 🪟 In a separate Git Bash window (not the VS Code terminal), if the password prompt does not appear: `winpty mysql -u kkm_dev -p kkm_latihan`

### Steps

**A. Prove the problem first (5 min)**

1. With `BookingService` v1, log in as `pemohon1` (normal browser) & `pemohon2` (*incognito*). Both apply for slot A-02 with overlapping dates. Both succeed → **bug TM-TLK-16 reproduced**. Record the booking IDs.

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
       protected $updatedField  = '';            // audit table: no updated_at

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

   > The signatures of `record()` and `history()` are **locked** — the Pass module (Day 8) calls them with `'PAS'`.

**C. `BookingService` version 2**

3. Replace the whole of `app/Services/BookingService.php` with version 2 below (README §2.2–2.3 explains each part). Checklist — tick each one once you find it in the code:
   - [ ] The constructor accepts `StatusLogModel $logs`, `SlotAvailabilityService $availability`, `ReferenceNumberService $refNumbers`, `?BaseConnection $db` (default `db_connect()`) (Quiz S2)
   - [ ] `create()`: `assertValidPeriod()` → `assertVehicleOwnedBy()` → `transBegin()` → lock `users` → lock `parking_slots` → slot active? → BR-TLK-04 → BR-TLK-01 → `next('TLK')` → `insert` → `record(null → pending)` → `transCommit()` (Quiz S2)
   - [ ] `catch (Throwable $e) { transRollback(); throw $e; }` (Quiz S2)
   - [ ] public `assertValidPeriod()`: format, not in the past (today is allowed), `end >= start`, `diff()->days > 90` rejected (Quiz S2)
   - [ ] `approve()`, `reject()` (reason ≥ 10 characters), `cancel()` (owner **or** admin) → all go through `transition()` (Quiz S2)
   - [ ] `transition()`: lock the booking row → `canTransitionTo()` → if approving: lock the slot + `hasOverlap(…, $bookingId)` → `update` → `record()` (Quiz S2)
   - [ ] `lockRow()` uses `prefixTable()` + `?` binding (Quiz S2)

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

4. Update `Config\Services::bookingService()` — one shared connection for both services. Replace the line `return new BookingService(refNumbers: new ReferenceNumberService(db_connect()));` at the end of the method with:

   ```php
   return new BookingService(
       refNumbers: new ReferenceNumberService(db_connect()),
       db: db_connect(),
   );
   ```

**D. Routes, controller & view**

5. The `tlk/tempahan` group — add:

   ```php
   $routes->post('(:num)/cancel', 'BookingController::cancel/$1', ['as' => 'tlk.cancel']);
   ```

   New group (after the `tlk/tempahan` group):

   ```php
   $routes->group('tlk/keputusan', ['namespace' => 'App\Controllers\Tlk', 'filter' => 'permission:tlk.decide'], static function (RouteCollection $routes): void {
       $routes->get('/', 'DecisionController::index', ['as' => 'tlk.decision.index']);
       $routes->post('(:num)/approve', 'DecisionController::approve/$1', ['as' => 'tlk.decision.approve']);
       $routes->post('(:num)/reject', 'DecisionController::reject/$1', ['as' => 'tlk.decision.reject']);
   });
   ```

   Check against `Routes-tlk.php.txt` (**Templat & Rujukan** module).

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
           $status = (string) ($this->request->getGet('status') ?? BookingStatus::Pending->value);   // default: Pending (Menunggu)

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

7. `app/Views/tlk/decision/index.php` — a booking table with a status filter. Every `pending` row has an **Approve** form (POST, `data-confirm`) and a **Reject** button that opens a `collapse` row holding a `remarks` input (min 10 characters) + a *Confirm Reject* button. For admins, `approved` rows have a **Cancel** form → `tlk.cancel`. The status badge and the reference-number link are added in Lab 6.4:

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

8. `BookingController` — replace `show()` (approver/admin can view; pass the history) and add `cancel()`. Add above the class if not there yet: `use App\Models\StatusLogModel; use App\Services\BookingService; use CodeIgniter\HTTP\RedirectResponse; use DomainException;`

   ```php
   public function show(int $id): string
   {
       $booking = model(SlotBookingModel::class)->findDetailed($id);

       // Applicant: own bookings only. Approver/admin (tlk.decide): all.
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

9. Replace the whole of `app/Views/tlk/booking/show.php` — two columns: the booking details (with a conditional Cancel button) on the left, **Status History** on the right:

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

**E. Prove the lock with two MySQL sessions (compulsory demo)**

**Before step 10:** `BookingService` v2 now enforces BR-TLK-04, and `pemohon1` and `pemohon2` still have active bookings from Day 5 and step 1. Without this step, steps 11 and 14 hit BR-TLK-04 (*"Anda sudah mempunyai satu tempahan aktif…"*), not the expected result. Clear them through the application so `status_logs` stays complete: `pelulus` → `/tlk/keputusan` → *Tolak* (Reject) each `pending` booking owned by `pemohon1` and `pemohon2` (reason ≥ 10 characters); applicant → details → *Batalkan* (Cancel) each `approved` booking. Confirm (0 rows for the `user_id` of `pemohon1` & `pemohon2`):

```sql
SELECT user_id, ref_no, status FROM slot_bookings WHERE status IN ('pending', 'approved');
```

10. Terminal A (MySQL client):

    ```sql
    SELECT id FROM parking_slots WHERE slot_no = 'A-03';    -- find the ID (no lock), e.g. 3
    START TRANSACTION;
    SELECT id FROM parking_slots WHERE id = 3 FOR UPDATE;   -- lock row A-03 through the PRIMARY KEY
    ```

    > Why by `id`? InnoDB locks the rows that are **scanned through an index**. `WHERE slot_no = 'A-03'` has no index of its own (only the composite `zone_id, slot_no`) → full scan → **all** slot rows are locked. That is also why `lockRow()` always locks by `id`.

11. Browser: log in as `pemohon2`, apply for slot **A-03** → press *Hantar* (Submit). The browser **spins** (waiting for the lock).
12. Within 50 seconds, in Terminal A: `COMMIT;` → the browser finishes immediately.
13. Repeat steps 10–11 but **wait > 50 seconds** → the browser shows the error `Lock wait timeout exceeded` (`innodb_lock_wait_timeout` defaults to 50 s). Note it in `docs/ujian-manual-tlk.md` — this is the **correct** behaviour (the request does not continue without the lock).
14. First *Tolak* (Reject) `pemohon2`'s A-03 booking from steps 11–12 (`pelulus` → `/tlk/keputusan`; BR-TLK-04). Then repeat step 1 (two applicants, same slot, overlapping dates) → now only **one** succeeds; the second gets *"Slot ini sudah ditempah bagi tarikh yang bertindih."* (This slot is already booked for overlapping dates.) Update TM-TLK-16 → ✅.

15. Commit `TLK: transaksi + kunci baris BR-TLK-01/04/05, keputusan & status_logs`.

### ✅ Checkpoint
- Step 11: the request **waits** until `COMMIT` (visual proof of the row lock) (Quiz S2).
- `pelulus@latihan.test` → `/tlk/keputusan` → *Lulus* (Approve) one booking → green flash; *Tolak* (Reject) with a 5-character reason (first remove the `minlength`/`required` attributes on the `<input name="remarks">` via DevTools — the browser blocks it; we are testing the **server** rule) → red flash *"Sebab penolakan wajib diisi (sekurang-kurangnya 10 aksara)."* (A rejection reason is required, at least 10 characters.) (Quiz S2)
- `pemohon1` → details of the approved booking → *Batalkan* (Cancel) → status *Dibatalkan* (Cancelled); the history shows 3 rows (Menunggu → Diluluskan → Dibatalkan, i.e. Pending → Approved → Cancelled) with the actor's name (Quiz S2).
- A `pending` booking has **no** Cancel button; a direct POST to `/tlk/tempahan/{id}/cancel` → message *"Status "Menunggu" tidak boleh ditukar kepada "Dibatalkan"."* (Status "Pending" cannot be changed to "Cancelled".) (Quiz S2)
- `pemohon1` tries a second booking while one is still `pending` → *"Anda sudah mempunyai satu tempahan aktif…"* (You already have one active booking…) (BR-TLK-04) (Quiz S2).
- SQL (Quiz S2):

  ```sql
  SELECT module, record_id, from_status, to_status, actor_id, remarks FROM status_logs ORDER BY id;
  ```

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| The step 11 demo does **not** wait | `lockRow('parking_slots', …)` is called outside the transaction, or a different slot is used | Make sure `transBegin()` comes before `lockRow()`; same slot ID |
| `Lock wait timeout exceeded` during normal use | A transaction is not closed (no `transCommit()`/`transRollback()` on one path) | Every path out of the `try` must commit **or** roll back |
| `Deadlock found when trying to get lock` | Two methods lock rows in a **different order** (slot→user vs user→slot) | Fixed lock order: user → slot |
| `There is no active transaction` / reference numbers skip | `ReferenceNumberService` creates its own connection | Both use `db_connect()` (shared) — step 4 |
| `status_logs` entries are not written | `StatusLogModel::$updatedField` not emptied → `Unknown column 'updated_at'` | `$updatedField = ''` |
| `actor_name` is empty in the history | The user has no `full_name` | Check the seeder; the `LEFT JOIN` makes sure the row is still shown |
| Approver gets a 404 when clicking a reference number | `show()` still checks the owner only | Add `|| can('tlk.decide')` (step 8) |

### ⭐ Bonus challenge
- Require a remark (≥ 10 characters) when an **admin** cancels someone else's booking, so the owner knows why; owners can still cancel their own booking without one.
- Locking the booking row in `approve()` stops two approvers acting at the same time. Prove it with two MySQL sessions as in steps 10–12, but on `slot_bookings`.

---

## Lab 6.3 — PHPUnit Tests for the TLK Module (S3)

### 🎯 Objective
Write the integration test `BookingServiceTest` (overlap, BR-TLK-03/04, transitions, logs) and the feature test `DecisionAccessTest` (access + HTTP flow).

### Prerequisites
- Lab 6.2 merged; `git switch -c feat/tlk-ujian`
- The `kkm_latihan_test` database exists and `database.tests.*` is in `.env` (README §3.2)

### Steps

1. Confirm the test configuration:

   ```bash
   composer test -- --no-coverage tests/tlk/BookingStatusTest.php       # Day 5 test — still green
   php spark db:table --show --dbgroup tests                            # connection to kkm_latihan_test works
   ```

2. `tests/tlk/BookingServiceTest.php` — copy the skeleton + helpers first, then paste the tests from step 3 **one at a time**, running after each one:

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

       // ---- your tests here ----

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

3. The tests you will add (README §3.3 explains two of them):

   | # | Test | Check |
   |---|-------|-------|
   | 1 | `testCreateGeneratesReferencePendingStatusAndLog` | `ref_no` = `TLK-{tahun}-0001` (`{tahun}` = year), status Pending, a `status_logs` row `null → pending` |
   | 2 | `testOverlapDetection` + `rangeProvider` (7 cases) | The table in Lab 6.1 step 1 |
   | 3 | `testCreateRejectsOverlappingBooking` | `expectExceptionMessage('bertindih')` |
   | 4 | `testRejectedBookingFreesTheSlot` | Reject → the slot can be booked again |
   | 5 | `testMoreThan90DaysIsRejected` | `payload(1, 92)` (end − start = 91) → exception `'90 hari'` |
   | 6 | `testExactly90DaysIsAllowed` | `payload(1, 91)` (end − start = 90) → succeeds |
   | 7 | `testSingleDayStartingTodayIsAllowed` | `payload(0, 0)` → succeeds, `durationDays() === 1` |
   | 8 | `testApplicantCanHaveOnlyOneActiveBooking` | Second slot, other dates → exception `'tempahan aktif'` |
   | 9 | `testApproveSetsDecisionFieldsAndLogs` | `decided_by`, `decided_at`, log `pending → approved` |
   | 10 | `testCannotApproveRejectedBooking` | exception |
   | 11 | `testFailedTransitionDoesNotWriteLog` | README §3.3 |
   | 12 | `testOwnerCanCancelApprovedBooking` / `testOtherUserCannotCancelBooking` / `testAdminCanCancelSomeoneElsesApprovedBooking` | Only the owner or an admin |

   Paste the methods below in place of the test placeholder comment line in the step 2 skeleton, one test at a time. The admin test gives the `admin` group with `auth()->getProvider()->findById($adminId)->addGroup('admin');`:

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

4. `tests/tlk/DecisionAccessTest.php` — HTTP feature test (copy it, then **explain each test to the trainer or the person next to you**):

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
           // Shield keeps the logged-in user in the shared 'auth' service — without a reset,
           // actingAs() from another test class "leaks" into this one when all tests run together.
           // MUST come before parent::setUp() (which installs the mock session/cache).
           $this->resetServices();

           parent::setUp();

           // This test checks ACCESS, not CSRF → disable CSRF in tests only
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
           config('Filters')->globals['before'] = $this->originalBeforeFilters;   // restore for other tests

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

           $result->assertRedirect();   // Shield: no permission → redirect + 'error' flash
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

5. Run all the TLK tests:

   ```bash
   composer test -- --no-coverage --testdox tests/tlk
   ```

6. **Red → green cycle (compulsory, 10 min):** in `BookingService::create()`, temporarily comment out the `hasOverlap()` line. Run the tests → note which tests turn **red**. Restore it → green. Repeat by changing `->where('start_date <=', $end)` to `<` in `hasOverlap()`. Write your findings in `docs/ujian-manual-tlk.md` (section "Ujian mutasi" — mutation testing).

7. Commit `TLK: ujian PHPUnit BookingService + akses keputusan`.

### ✅ Checkpoint
- `composer test -- --no-coverage tests/tlk` → `OK` with **≥ 25 tests** (BookingStatus 5 + BookingService ≥ 15 + DecisionAccess 5). Reference solution (tag `penyelesaian-hari-6`): **43** = BookingStatus 6 (with ⭐) + BookingService 28 (template 27 + 1) + DecisionAccess 7 (with ⭐) + ReferenceNumberService 2 (Quiz S3).
- Step 6: removing `hasOverlap()` turns at least `testCreateRejectsOverlappingBooking` red; changing `<=` → `<` turns the *"overlap at the start edge"* case red (Quiz S3).
- `mysql -u kkm_dev -p -e "SELECT COUNT(*) FROM slot_bookings" kkm_latihan` before and after `composer test` → the **same** number, not `0` (your Lab 6.1–6.2 bookings are still there). The tests write to `kkm_latihan_test` (the `tests` group), **not** `kkm_latihan` (Quiz S3).
- Compare with `BookingServiceTest.php.txt` (**Templat & Rujukan** module) (Quiz S3).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `near "FOR": syntax error` | The `tests` group is still SQLite `:memory:` | Set MySQL `database.tests.*` in `.env` |
| `Table 'kkm_latihan_test.users' doesn't exist` | `$namespace = 'App'` (default) — the Shield migrations do not run | `protected $namespace = null;` |
| `Access denied for user … to database 'kkm_latihan_test'` | No `GRANT` | `GRANT ALL ON kkm_latihan_test.* TO 'kkm_dev'@'localhost';` |
| `The action you requested is not allowed.` in POST tests | Global CSRF is active | Disable it in `setUp()` + restore it in `tearDown()` (step 4) |
| Tests pass on their own but fail when run together | State leaks between tests (e.g. filter not restored, hard-coded IDs, another class's `actingAs()` user kept in Shield's `auth` service) | `$refresh = true`; restore the configuration; use `insertID()`; `$this->resetServices();` **before** `parent::setUp()` (step 4) |
| Date tests fail after midnight | Hard-coded dates / time zone | Relative dates `strtotime('+N days')`; `app.appTimezone` |
| `No code coverage driver available` | Warning only | `--no-coverage` |

### ⭐ Bonus challenge
- Feature test: pemohon2 opens `/tlk/tempahan/{id}` owned by pemohon1. In `FeatureTestTrait`, `PageNotFoundException` is **thrown** straight into the test (not a 404 response), so use `$this->expectException(\CodeIgniter\Exceptions\PageNotFoundException::class);` before `->get(…)`.
- Test `ReferenceNumberService`: a different year → numbering restarts from 0001 (tip: insert the row `('TLK', (int) date('Y') - 1, 42)` directly and make sure `next('TLK')` is still `'TLK-' . date('Y') . '-0001'` — do not hard-code the year, or the test fails next year).

---

## Lab 6.4 — UI Improvements & M1 Done (S4)

### 🎯 Objective
Polish the TLK module UI (badges, flash messages, confirmation, Bootstrap pagination, permission-based menu) and demo M1 end to end.

### Prerequisites
- Labs 6.1–6.3 merged into `main`; tests green

### Steps

1. **Status badge** — in `tlk/booking/index.php` and `tlk/decision/index.php`, replace the line `<td><?= esc($b->statusLabel()) ?></td>` with:

   ```php
   <td><span class="badge text-bg-<?= esc($b->statusBadge(), 'attr') ?>"><?= esc($b->statusLabel()) ?></span></td>
   ```

   In `tlk/booking/show.php` (card header), replace `<span><?= esc($booking->statusLabel()) ?></span>` with:

   ```php
   <span class="badge text-bg-<?= esc($booking->statusBadge(), 'attr') ?>"><?= esc($booking->statusLabel()) ?></span>
   ```

2. **Flash** — `partials/flash.php` becomes dismissible, with icons (keep both success keys, `success` and `message` — the Lab 4 convention):

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

3. **Layout** — replace the whole of `app/Views/layouts/main.php`: menu items *Tempahan Saya* (My Bookings), *Mohon Slot* (Apply for a Slot) (`can('tlk.apply')`), *Slot Kosong* (Free Slots), *Keputusan TLK* (TLK Decisions) (`can('tlk.decide')`), *Urus Slot* (Manage Slots) (`inGroup('admin')`), and the `data-confirm` script before `</body>` (README §4.1):

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

4. **Bootstrap pagination** — create `app/Views/pager/bootstrap_full.php`:

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

   `app/Config/Pager.php` — change the default template so that **every** `$pager->links()` uses Bootstrap:

   ```php
   public array $templates = [
       'default_full'   => 'App\Views\pager\bootstrap_full',
       'default_simple' => 'CodeIgniter\Pager\Views\default_simple',
       'default_head'   => 'CodeIgniter\Pager\Views\default_head',
   ];
   ```

5. **Links** — in `tlk/decision/index.php`, replace the line `<td class="fw-semibold"><?= esc($b->ref_no) ?></td>` with a link to the details page:

   ```php
   <td class="fw-semibold"><a href="<?= url_to('tlk.show', $b->id) ?>"><?= esc($b->ref_no) ?></a></td>
   ```

   In `tlk/booking/form.php`, add this link right after the `$invalid` line (before `<?php if ($vehicles === []): ?>`):

   ```php
   <p><a href="<?= url_to('tlk.availability') ?>"><i class="bi bi-search"></i> Semak slot kosong dahulu</a></p>
   ```

6. **Short accessibility checklist:** every `<input>` has a `<label for>`; icon buttons have text; badge colour is not the only cue (a text label is always present).

7. **M1 demo (5 min per participant)** — script:

   **Prerequisite:** `pemohon1` and `pemohon2` still have active bookings from Lab 6.1–6.2. Without this step, steps 1–2 hit BR-TLK-04 (*"Anda sudah mempunyai satu tempahan aktif…"*), not BR-TLK-01. Clear them through the application so `status_logs` stays complete: `pelulus` → `/tlk/keputusan` → *Tolak* (Reject) each `pending` booking (reason ≥ 10 characters); applicant → details → *Batalkan* (Cancel) each `approved` booking. Confirm:

   ```sql
   SELECT user_id, ref_no, status FROM slot_bookings WHERE status IN ('pending', 'approved');
   -- 0 rows for the user_id of pemohon1 & pemohon2
   ```


   | # | Role | Action | Show |
   |---|---------|----------|--------|
   | 1 | pemohon1 | Check free slots → apply for A-04 | New `TLK-…`, badge *Menunggu* (Pending), 1 history row |
   | 2 | pemohon2 | Apply for A-04, overlapping dates | *Overlap* message (BR-TLK-01) |
   | 3 | pelulus | Decisions → Approve (confirmation dialog) | Badge *Diluluskan* (Approved), flash |
   | 4 | pemohon1 | Details → Cancel | 3 history rows with the actor's name |
   | 5 | pemohon1 | Type `/tlk/keputusan` | Redirected — no access |
   | 6 | — | `composer test -- --no-coverage tests/tlk` | Green |

8. Update `docs/ujian-manual-tlk.md` (TM-TLK-16 ✅), tick the M1 DoD (README §4.2) in `docs/pelan-kerja.md`, then:

   ```bash
   git add -A && git commit -m "TLK: penambahbaikan UI — badge, flash, pengesahan, pagination"
   git tag -a m1-siap -m "M1 TLK siap: ketersediaan, transaksi, keputusan, ujian"
   git push && git push --tags
   ```

### ✅ Checkpoint
- `/admin/slot?page=2` shows Bootstrap pagination (`<ul class="pagination">` with `page-item active`) (Quiz S4).
- Click *Lulus* (Approve) → a `confirm()` dialog appears; *Cancel* in the dialog → no change (Quiz S4).
- Log in as the 3 roles → the menu differs by permission (Quiz S4).
- The 6-step demo succeeds in front of the trainer; `git tag` shows `m1-siap` (Quiz S4).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| The confirmation dialog does not appear | Script placed before the forms load / inside `<head>` | Put the script at the end of `<body>`, after `bootstrap.bundle` |
| The *Tolak* (Reject) button does not open the row | `bootstrap.bundle.min.js` not loaded | Make sure the Bootstrap JS script is in the layout |
| `Invalid file: "App\Views\pager\bootstrap_full.php"` | Wrong path/file name | File `app/Views/pager/bootstrap_full.php`; config value without `.php` |
| Badge has no colour | Misspelt class (`bg-text-warning`) or Bootstrap 4 syntax (`badge-warning`) | `badge text-bg-{warna}` (Bootstrap 5.3) |

### ⭐ Bonus challenge
- Show the number of `pending` bookings as a badge on the *Keputusan TLK* (TLK Decisions) menu (`countAllResults()` — consider the cost of the query on every page).
- Provide a print-friendly view (`@media print`) for approved booking details — the applicant can place it on the car dashboard.

---

## Lab 6.1b — Busy-Slot Board for Approvers (S5)

### 🎯 Objective
Reuse the BR-TLK-01 overlap condition in a **JOIN** (not `NOT IN`) to build the busy-slot board `/tlk/tempahan/ketersediaan/sibuk` for approvers and admins: which active bookings occupy a slot in a date range, who the applicant is, and whether the slot is still active.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- The [Lab 6.1](#lab-61--slot-availability-check-s1) checkpoint passes; you are still on the `feat/tlk-ketersediaan` branch (not merged yet).
- Booking `TLK-2026-0001` (slot A-01, `pemohon1`, *Menunggu* / Pending) exists.

### Steps

1. `app/Services/SlotAvailabilityService.php` — add this method to the class, right after `availableSlots()`:

   ```php
       /**
        * Tempahan aktif (pending/approved) yang bertindih dengan julat [start, end] —
        * "papan slot sibuk" untuk pelulus. Syarat bertindih SAMA seperti hasOverlap().
        *
        * @return list<array<string, mixed>> satu baris = satu tempahan + slot, zon & pemohon
        */
       public function busySlots(string $start, string $end): array
       {
           return $this->bookings->builder()
               ->select('slot_bookings.id, slot_bookings.ref_no, slot_bookings.start_date, slot_bookings.end_date, slot_bookings.status')
               ->select('parking_slots.slot_no, parking_slots.category, parking_slots.is_active, parking_zones.code AS zone_code')
               ->select('users.full_name AS applicant_name')
               ->join('parking_slots', 'parking_slots.id = slot_bookings.slot_id')
               ->join('parking_zones', 'parking_zones.id = parking_slots.zone_id')
               ->join('users', 'users.id = slot_bookings.user_id')
               ->whereIn('slot_bookings.status', BookingStatus::active())
               ->where('slot_bookings.start_date <=', $end)     // sama seperti hasOverlap()
               ->where('slot_bookings.end_date >=', $start)
               ->where('parking_slots.deleted_at', null)        // Query Builder mentah: soft delete tidak automatik
               ->orderBy('parking_zones.code')
               ->orderBy('parking_slots.slot_no')
               ->orderBy('slot_bookings.start_date')
               ->get()
               ->getResultArray();
       }
   ```

   > Lab 6.1 asks *"which slots have **no** booking?"* (`NOT IN`). This board asks *"which bookings **occupy** a slot?"* (`JOIN`). The overlap condition is the same. Shield's `users` table also has a `status` column, so every column is written with its table name (`slot_bookings.status`). `builder()` is the raw Query Builder: soft deletes are not filtered automatically, so we write the `deleted_at` condition ourselves.

2. Route — in the `tlk/tempahan` group (`app/Config/Routes.php`), right after the `ketersediaan` route and **before** `(:num)`:

   ```php
   $routes->get('ketersediaan/sibuk', 'BookingController::busy', ['as' => 'tlk.availability.busy', 'filter' => 'permission:tlk.decide']);
   ```

   The `permission:tlk.decide` filter is added to the group's `session` filter: only `approver` and `admin` can open the board.

3. `app/Controllers/Tlk/BookingController.php` — add this method right after `availability()`:

   ```php
       /** GET tlk/tempahan/ketersediaan/sibuk?start_date=&end_date= — pelulus/admin sahaja (filter route) */
       public function busy(): string
       {
           $filters = [
               'start_date' => (string) ($this->request->getGet('start_date') ?? ''),
               'end_date'   => (string) ($this->request->getGet('end_date') ?? ''),
           ];

           $bookings = null;   // null = borang belum dihantar
           $errors   = [];

           if ($filters['start_date'] !== '' || $filters['end_date'] !== '') {
               $validation = service('validation')->setRules([
                   'start_date' => 'required|valid_date[Y-m-d]',
                   'end_date'   => 'required|valid_date[Y-m-d]|date_on_or_after[start_date]',
               ]);

               if ($validation->run($filters)) {
                   $bookings = service('slotAvailability')->busySlots($filters['start_date'], $filters['end_date']);
               } else {
                   $errors = $validation->getErrors();
               }
           }

           return view('tlk/booking/busy', [
               'title'    => 'Papan Slot Sibuk',
               'filters'  => $filters,
               'bookings' => $bookings,
               'errors'   => $errors,
           ]);
       }
   ```

4. Create `app/Views/tlk/booking/busy.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php
   use App\Enums\BookingStatus;
   use App\Enums\SlotCategory;
   ?>

   <form method="get" class="card card-body mb-4">
       <div class="row g-3 align-items-end">
           <div class="col-md-4">
               <label class="form-label" for="start_date">Tarikh mula</label>
               <input type="date" class="form-control" id="start_date" name="start_date" value="<?= esc($filters['start_date'], 'attr') ?>">
           </div>
           <div class="col-md-4">
               <label class="form-label" for="end_date">Tarikh tamat</label>
               <input type="date" class="form-control" id="end_date" name="end_date" value="<?= esc($filters['end_date'], 'attr') ?>">
           </div>
           <div class="col-md-4">
               <button class="btn btn-primary w-100" type="submit"><i class="bi bi-grid-3x3-gap"></i> Papar slot sibuk</button>
           </div>
       </div>
   </form>

   <?php if ($errors !== []): ?>
       <div class="alert alert-danger"><?php foreach ($errors as $e): ?><div><?= esc($e) ?></div><?php endforeach ?></div>
   <?php elseif ($bookings !== null): ?>
       <?php $slotKeys = array_unique(array_map(static fn (array $b): string => $b['zone_code'] . '/' . $b['slot_no'], $bookings)); ?>
       <p class="text-muted">
           <?= count($bookings) ?> tempahan aktif menduduki <?= count($slotKeys) ?> slot bagi <?= esc($filters['start_date']) ?> hingga <?= esc($filters['end_date']) ?>.
           <a href="<?= url_to('tlk.availability') ?>?<?= esc(http_build_query($filters), 'attr') ?>">Lihat slot kosong</a>
       </p>
       <div class="card">
           <div class="table-responsive">
               <table class="table align-middle mb-0">
                   <thead class="table-light">
                   <tr><th>Slot</th><th>No. Rujukan</th><th>Pemohon</th><th>Tempoh</th><th>Status</th></tr>
                   </thead>
                   <tbody>
                   <?php foreach ($bookings as $b): ?>
                       <?php $status = BookingStatus::from($b['status']); ?>
                       <tr>
                           <td>
                               <span class="fw-semibold"><?= esc($b['zone_code']) ?> / <?= esc($b['slot_no']) ?></span>
                               <div class="small text-muted"><?= esc(SlotCategory::from($b['category'])->label()) ?></div>
                               <?php if ((int) $b['is_active'] !== 1): ?>
                                   <span class="badge text-bg-dark">Slot tidak aktif</span>
                               <?php endif ?>
                           </td>
                           <td><a href="<?= url_to('tlk.show', $b['id']) ?>"><?= esc($b['ref_no']) ?></a></td>
                           <td><?= esc($b['applicant_name'] ?? '—') ?></td>
                           <td><?= esc($b['start_date']) ?> hingga <?= esc($b['end_date']) ?></td>
                           <td><span class="badge text-bg-<?= esc($status->badge(), 'attr') ?>"><?= esc($status->label()) ?></span></td>
                       </tr>
                   <?php endforeach ?>
                   <?php if ($bookings === []): ?>
                       <tr><td colspan="5" class="text-center text-muted py-4">Tiada slot sibuk bagi julat ini.</td></tr>
                   <?php endif ?>
                   </tbody>
               </table>
           </div>
       </div>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```

5. `app/Views/tlk/booking/availability.php` — add a link to the board right after the line `<p class="text-muted"><?= count($slots) ?> slot kosong bagi …</p>`:

   ```php
       <?php if (auth()->user()->can('tlk.decide')): ?>
           <p><a href="<?= url_to('tlk.availability.busy') ?>?<?= esc(http_build_query(['start_date' => $filters['start_date'], 'end_date' => $filters['end_date']]), 'attr') ?>"><i class="bi bi-grid-3x3-gap"></i> Lihat slot sibuk bagi julat sama</a></p>
       <?php endif ?>
   ```

6. Check:

   ```bash
   php -l app/Services/SlotAvailabilityService.php
   php -l app/Controllers/Tlk/BookingController.php
   php spark routes | grep ketersediaan
   ```

   The `tlk/tempahan/ketersediaan/sibuk` row shows the filters `csrf session permission:tlk.decide`.

7. **Test and note** (Quiz S5 questions). `php spark serve`, log in as `admin@latihan.test` (`admin` has `tlk.*`, which includes `tlk.decide`):
   1. Open `http://localhost:8080/tlk/tempahan/ketersediaan/sibuk`, enter start date = today, end date = 90 days from now → **Papar slot sibuk** (Show busy slots). Find the `TLK-2026-0001` row and note its end date.
   2. Enter both the start date **and** the end date = the end date of `TLK-2026-0001` (a one-day range) → **Papar slot sibuk**. Note what is shown for A-01. Click **Lihat slot kosong** (View free slots): A-01 is not among the cards.
   3. Open `http://localhost:8080/admin/slot` → **Ubah** (Edit) A-01 (zone A) → untick *Slot aktif* (Slot active) → **Simpan** (Save). Reload the board (same one-day range) and the free-slot page. Note both.
   4. Go back to `/admin/slot` → **Ubah** A-01 → tick *Slot aktif* again → **Simpan**.
   5. Incognito window: log in as `pemohon1@latihan.test`, open `http://localhost:8080/tlk/tempahan/ketersediaan/sibuk` → redirected to `/` with a red message (no `tlk.decide`).

8. Commit:

   ```bash
   git add app/ && git commit -m "TLK: papan slot sibuk untuk pelulus (BR-TLK-01 dalam JOIN)"
   ```

### ✅ Checkpoint
- [ ] `php spark routes` shows `tlk/tempahan/ketersediaan/sibuk` with the `permission:tlk.decide` filter (Quiz S5).
- [ ] The board for a one-day range = the end date of `TLK-2026-0001` shows A-01 with `TLK-2026-0001`; the free-slot page for the same range does not show A-01 (Quiz S5).
- [ ] While A-01 is inactive, the board still shows its booking with a *Slot tidak aktif* (Slot inactive) badge; A-01 is active again and `pemohon1` is redirected away from the board (Quiz S5).
- [ ] Commit `TLK: papan slot sibuk untuk pelulus (BR-TLK-01 dalam JOIN)` on the `feat/tlk-ketersediaan` branch (Quiz S5).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Column 'status' in where clause is ambiguous` | `whereIn('status', …)` without a table name — Shield's `users` also has a `status` column | `slot_bookings.status` (step 1) |
| `pemohon1` can open the board | The `permission:tlk.decide` filter is missing or misspelt | Check step 2; `php spark routes \| grep sibuk` |
| `/tlk/tempahan/ketersediaan/sibuk` → 404 | Route missing, or placed outside the `tlk/tempahan` group | `php spark routes \| grep sibuk` |
| Bookings on a deleted (soft-deleted) slot appear | The `parking_slots.deleted_at` condition is missing | `->where('parking_slots.deleted_at', null)` |
| `Undefined array key "zone_code"` in the view | The `AS zone_code` alias is missing from `select()` | Copy the `select()` from step 1 again |

### ⭐ Bonus challenge
- Add a zone filter (`zone_id`) to the board, as on the free-slot page.
- Also show the **free** active slots as grey rows under the table (call `availableSlots()` with the same range), so the approver sees the whole zone at a glance.

---

## Lab 6.2b — The `tlk:expire` Expiry Command (S6)

### 🎯 Objective
Write a Spark command `php spark tlk:expire` that changes `approved` bookings whose `end_date` has passed to `expired` through `transition()` (one transaction, a `FOR UPDATE` lock and one `status_logs` row per booking), and prove that the command waits for a row lock held by another MySQL session.

### Prerequisites
- The [Lab 6.2](#lab-62--transactions-row-locks-approval--status_logs-s2) checkpoint passes; you are still on the `feat/tlk-keputusan` branch (not merged yet).
- A MySQL client with two query tabs, as in Lab 6.2 part E.

### Steps

1. `app/Services/BookingService.php` — paste these two methods right after the `cancel()` method:

   ```php
       /**
        * ID tempahan 'approved' yang end_date-nya SEBELUM $today — calon `php spark tlk:expire`.
        *
        * @return list<int>
        */
       public function expirableIds(string $today): array
       {
           $rows = $this->bookings->builder()
               ->select('id')
               ->where('status', BookingStatus::Approved->value)
               ->where('end_date <', $today)      // end_date = hari ini masih digunakan (tarikh inklusif)
               ->orderBy('id')
               ->get()
               ->getResultArray();

           return array_map('intval', array_column($rows, 'id'));
       }

       /**
        * SISTEM: approved → expired. Dipanggil oleh Spark `tlk:expire` sahaja (tiada route HTTP).
        * Melalui transition(): kunci baris, canTransitionTo(), update + status_logs dalam SATU transaksi.
        */
       public function expire(int $bookingId, int $systemActorId, string $today): SlotBooking
       {
           $booking = $this->bookings->find($bookingId);

           if ($booking !== null && $booking->end_date >= $today) {
               throw new DomainException('Tempahan ' . $booking->ref_no . ' belum tamat tempoh (tarikh tamat ' . $booking->end_date . ').');
           }

           return $this->transition($bookingId, BookingStatus::Expired, $systemActorId, 'Tamat tempoh automatik (tlk:expire).');
       }
   ```

   > `expire()` opens no transaction of its own: `transition()` already locks the booking row, checks `canTransitionTo()`, updates the status and writes the log in one transaction. The date check runs before the lock because `end_date` never changes after a booking is created; the status is checked again under the lock.

2. Create `app/Commands/ExpireBookingsCommand.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Commands;

   use CodeIgniter\CLI\BaseCommand;
   use CodeIgniter\CLI\CLI;
   use Throwable;

   /**
    * Tempahan 'approved' yang end_date-nya sudah berlalu → 'expired' (rajah status SPEC §2.1).
    * Setiap tempahan melalui BookingService::expire() → transition(): satu transaksi, satu log.
    */
   class ExpireBookingsCommand extends BaseCommand
   {
       protected $group       = 'TLK';
       protected $name        = 'tlk:expire';
       protected $description = 'Tandakan tempahan "approved" yang melepasi end_date sebagai "expired".';
       protected $usage       = 'tlk:expire [--dry-run]';
       protected $options     = [
           '--dry-run' => 'Papar senarai sahaja; tiada perubahan pada DB.',
       ];

       public function run(array $params)
       {
           $today   = date('Y-m-d');   // app.appTimezone = Asia/Kuala_Lumpur
           $service = service('bookingService');
           $ids     = $service->expirableIds($today);

           if ($ids === []) {
               CLI::write("Tiada tempahan untuk ditamatkan (tarikh rujukan {$today}).", 'green');

               return EXIT_SUCCESS;
           }

           CLI::write(sprintf('%d tempahan melepasi end_date sebelum %s: ID %s', count($ids), $today, implode(', ', $ids)));

           if (array_key_exists('dry-run', $params) || CLI::getOption('dry-run') !== null) {
               CLI::write('--dry-run: tiada perubahan dibuat.', 'yellow');

               return EXIT_SUCCESS;
           }

           $actorId = $this->firstAdminId();

           if ($actorId === 0) {
               CLI::error('Tiada pengguna dalam group admin untuk direkod sebagai actor_id.');

               return EXIT_ERROR;
           }

           $ok   = 0;
           $fail = 0;

           foreach ($ids as $id) {
               try {
                   $booking = $service->expire($id, $actorId, $today);
                   CLI::write("  ✔ {$booking->ref_no} → {$booking->statusLabel()}", 'green');
                   $ok++;
               } catch (Throwable $e) {
                   CLI::error("  ✘ ID {$id}: " . $e->getMessage());   // satu gagal tidak menghentikan yang lain
                   $fail++;
               }
           }

           CLI::write(sprintf('Selesai: %d ditamatkan, %d gagal.', $ok, $fail), $fail === 0 ? 'green' : 'yellow');

           return $fail === 0 ? EXIT_SUCCESS : EXIT_ERROR;
       }

       /** status_logs.actor_id wajib: guna pengguna pertama dalam group Shield 'admin'. */
       private function firstAdminId(): int
       {
           $row = db_connect()->table(config('Auth')->tables['groups_users'])
               ->select('user_id')
               ->where('group', 'admin')
               ->orderBy('user_id', 'ASC')
               ->get(1)
               ->getRow();

           return (int) ($row->user_id ?? 0);
       }
   }
   ```

   ```bash
   php -l app/Commands/ExpireBookingsCommand.php
   php spark list | grep -A2 "^TLK"
   ```

   `php spark list` shows a `TLK` group with `tlk:expire`.

3. **Prepare the data.** Log in as `pelulus@latihan.test`, open `http://localhost:8080/tlk/keputusan?status=approved` and pick one booking created in Lab 6.2 step 14 or later — **not** `TLK-2026-0001` or the Lab 6.2 step 1 bookings: those were created by `BookingService` v1 with no `status_logs` rows. If there is none, choose the *Menunggu* (Pending) status → **Tapis** (Filter) and **Lulus** (Approve) one booking that meets that condition, or ask `pemohon2` to apply for a new slot first. Note its reference number. In the MySQL client, shift that booking to last week (replace `TLK-2026-0003` with your reference number):

   ```sql
   UPDATE slot_bookings
   SET start_date = CURDATE() - INTERVAL 7 DAY, end_date = CURDATE() - INTERVAL 1 DAY
   WHERE ref_no = 'TLK-2026-0003';

   SELECT id, ref_no, start_date, end_date, status FROM slot_bookings WHERE ref_no = 'TLK-2026-0003';
   ```

   Note the `id`. This is the only place where we write past dates straight into the DB: the form and `BookingService` (BR-TLK-03) reject them. This `UPDATE` simulates "one week later".

4. Dry run:

   ```bash
   php spark tlk:expire --dry-run
   ```

   Output: `1 tempahan melepasi end_date sebelum <hari ini>: ID <id>` (`<hari ini>` = today) and `--dry-run: tiada perubahan dibuat.` (no changes made). The booking is still *Diluluskan*.

5. **Lock demo.** Terminal A (MySQL client), replace `3` with the `id` from step 3:

   ```sql
   START TRANSACTION;
   SELECT id, status FROM slot_bookings WHERE id = 3 FOR UPDATE;
   ```

   Git Bash: `php spark tlk:expire`. Watch the output **before** you touch Terminal A (Quiz S6 question). Within 50 seconds, Terminal A: `COMMIT;`. Watch the command output again.

6. Run `php spark tlk:expire` once more and note its output.

7. Check the audit trail (Quiz S6 question):

   ```sql
   SELECT module, record_id, from_status, to_status, actor_id, remarks FROM status_logs ORDER BY id DESC LIMIT 1;
   SELECT id, username FROM users WHERE username = 'admin';
   ```

   As `pelulus`, open the booking details (`/tlk/tempahan/<id>`): *Sejarah Status* (Status history) shows 3 rows — Menunggu, Diluluskan, Tamat Tempoh (Pending, Approved, Expired).

8. Commit:

   ```bash
   git add app/ && git commit -m "TLK: command tlk:expire (approved → expired melalui transition)"
   ```

### ✅ Checkpoint
- [ ] `php spark list` shows `tlk:expire` in the `TLK` group; `--dry-run` lists the IDs without changing the status (Quiz S6).
- [ ] While Terminal A holds the lock, the command waits and only prints `✔ TLK-… → Tamat Tempoh` after `COMMIT`; the second run prints *Tiada tempahan untuk ditamatkan* (No bookings to expire) (Quiz S6).
- [ ] The last `status_logs` row is `approved → expired` with the `admin` user's `actor_id` and the remark `Tamat tempoh automatik (tlk:expire).`; committed on the `feat/tlk-keputusan` branch (Quiz S6).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Command "tlk:expire" not found` | File outside `app/Commands/`, wrong namespace, or the class does not `extends BaseCommand` | `app/Commands/ExpireBookingsCommand.php`, `namespace App\Commands;` |
| `--dry-run` prints *Tiada tempahan untuk ditamatkan* | The `UPDATE` hit no row (wrong reference number), the status is not `approved`, or `end_date` = today | Run the `SELECT` from step 3 again; `end_date` must be **before** today |
| `✘ ID 3: Lock wait timeout exceeded; try restarting transaction` | Terminal A held the lock for more than 50 seconds | `COMMIT;` in Terminal A, then run the command again — `transition()` already rolled back, the status is still *Diluluskan* |
| The *tarikh rujukan* (reference date) in the output is yesterday | `app.appTimezone` is still `UTC` | `.env`: `app.appTimezone = 'Asia/Kuala_Lumpur'` (Day 4) |
| `Tiada pengguna dalam group admin…` (no user in the admin group) | The user seeder has not run | `php spark db:seed DatabaseSeeder` |

### ⭐ Bonus challenge
- Add an `--actor <user_id>` option so that another administrator can be recorded as the actor (`CLI::getOption('actor')`, check with `ctype_digit()`).
- Plan a daily run: write in `docs/ujian-manual-tlk.md` the Windows Task Scheduler steps that run `php spark tlk:expire` every day at 00:10 in the project folder.

---

## Lab 6.3b — Tests for the Busy Board & Expiry (S7)

### 🎯 Objective
Write PHPUnit tests for the new rules from Labs 6.1b–6.2b — the busy board (active statuses only, inclusive last day, complement of the free slots, inactive slot, route access) and expiry (candidates, log, refused before the end date, `pending` cannot expire, two command runs) — and prove that the tests catch two mutations.

### Prerequisites
- The [Lab 6.3](#lab-63--phpunit-tests-for-the-tlk-module-s3) checkpoint passes; you are still on the `feat/tlk-ujian` branch (not merged yet).
- Labs 6.1b and 6.2b are merged into `main` together with Labs 6.1 and 6.2.

### Steps

1. Create `tests/tlk/BusySlotsTest.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Tlk;

   use App\Models\UserModel;
   use App\Services\BookingService;
   use App\Services\SlotAvailabilityService;
   use CodeIgniter\Shield\Entities\User;
   use CodeIgniter\Shield\Test\AuthenticationTesting;
   use CodeIgniter\Test\CIUnitTestCase;
   use CodeIgniter\Test\DatabaseTestTrait;
   use CodeIgniter\Test\FeatureTestTrait;

   /**
    * Lab 6.3b — papan slot sibuk (Lab 6.1b): service + akses route.
    *
    * @internal
    */
   final class BusySlotsTest extends CIUnitTestCase
   {
       use DatabaseTestTrait;
       use FeatureTestTrait;
       use AuthenticationTesting;

       protected $migrate   = true;
       protected $refresh   = true;
       protected $namespace = null;   // Shield + App

       private BookingService $service;
       private SlotAvailabilityService $availability;
       private User $applicant;
       private User $otherApplicant;
       private User $approver;
       private int $slotId;
       private int $otherSlotId;
       private int $vehicleId;
       private int $otherVehicleId;

       protected function setUp(): void
       {
           $this->resetServices();   // elak actingAs() kelas ujian lain bocor (Lab 6.3 langkah 4)

           parent::setUp();

           $this->applicant      = $this->makeUser('ujian1', 'applicant');
           $this->otherApplicant = $this->makeUser('ujian2', 'applicant');
           $this->approver       = $this->makeUser('pelulus_ujian', 'approver');

           $this->db->table('parking_zones')->insert(['code' => 'T', 'name' => 'Zon Ujian', 'location' => 'Makmal']);
           $zoneId = (int) $this->db->insertID();

           $this->db->table('parking_slots')->insert(['zone_id' => $zoneId, 'slot_no' => 'T-01', 'category' => 'oku', 'is_active' => 1]);
           $this->slotId = (int) $this->db->insertID();

           $this->db->table('parking_slots')->insert(['zone_id' => $zoneId, 'slot_no' => 'T-02', 'category' => 'mengandung', 'is_active' => 1]);
           $this->otherSlotId = (int) $this->db->insertID();

           $this->db->table('vehicles')->insert(['user_id' => $this->applicant->id, 'plate_no' => 'WXX 0001', 'model' => 'Proton Saga', 'color' => 'Putih']);
           $this->vehicleId = (int) $this->db->insertID();

           $this->db->table('vehicles')->insert(['user_id' => $this->otherApplicant->id, 'plate_no' => 'WXX 0002', 'model' => 'Perodua Myvi', 'color' => 'Biru']);
           $this->otherVehicleId = (int) $this->db->insertID();

           $this->service      = new BookingService();
           $this->availability = new SlotAvailabilityService();
       }

       public function testListsPendingAndApprovedBookingsSortedBySlot(): void
       {
           $second = $this->service->create($this->otherApplicant->id, $this->payload($this->otherSlotId, 12, 15, $this->otherVehicleId));
           $this->service->approve($second->id, $this->approver->id);
           $first = $this->service->create($this->applicant->id, $this->payload($this->slotId, 10, 20));

           $rows = $this->availability->busySlots($this->day(14), $this->day(14));

           $this->assertSame([$first->ref_no, $second->ref_no], array_column($rows, 'ref_no'));   // T-01 dahulu, kemudian T-02
           $this->assertSame(['pending', 'approved'], array_column($rows, 'status'));
       }

       public function testRejectedBookingIsNotBusy(): void
       {
           $booking = $this->service->create($this->applicant->id, $this->payload($this->slotId, 10, 20));
           $this->service->reject($booking->id, $this->approver->id, 'Dokumen sokongan tidak lengkap.');

           $this->assertSame([], $this->availability->busySlots($this->day(10), $this->day(20)));
       }

       public function testLastDayOfBookingIsStillBusy(): void
       {
           $this->service->create($this->applicant->id, $this->payload($this->slotId, 10, 20));

           $this->assertCount(1, $this->availability->busySlots($this->day(20), $this->day(25)));   // hari +20 dikongsi
           $this->assertCount(0, $this->availability->busySlots($this->day(21), $this->day(25)));
       }

       public function testBusyAndAvailableTogetherCoverEveryActiveSlot(): void
       {
           $this->service->create($this->applicant->id, $this->payload($this->slotId, 10, 20));

           $busy      = array_column($this->availability->busySlots($this->day(15), $this->day(15)), 'slot_no');
           $available = array_column($this->availability->availableSlots($this->day(15), $this->day(15)), 'slot_no');

           $this->assertSame(['T-01'], $busy);
           $this->assertSame(['T-02'], $available);
       }

       public function testBookingOnDeactivatedSlotIsStillListed(): void
       {
           $this->service->create($this->applicant->id, $this->payload($this->slotId, 10, 20));
           $this->db->table('parking_slots')->where('id', $this->slotId)->update(['is_active' => 0]);

           $rows = $this->availability->busySlots($this->day(15), $this->day(15));

           $this->assertCount(1, $rows);
           $this->assertSame(0, (int) $rows[0]['is_active']);   // view memaparkan badge "Slot tidak aktif"
           $this->assertNotContains('T-01', array_column($this->availability->availableSlots($this->day(15), $this->day(15)), 'slot_no'));
       }

       public function testApplicantIsRedirectedAwayFromBoard(): void
       {
           $result = $this->actingAs($this->applicant)->get('tlk/tempahan/ketersediaan/sibuk');

           $result->assertRedirect();   // permission:tlk.decide → dialih dengan flash 'error'
           $result->assertDontSee('Papan Slot Sibuk');
       }

       public function testApproverSeesBookingOnBoard(): void
       {
           $booking = $this->service->create($this->applicant->id, $this->payload($this->slotId, 10, 20));

           $result = $this->actingAs($this->approver)
               ->get('tlk/tempahan/ketersediaan/sibuk?start_date=' . $this->day(10) . '&end_date=' . $this->day(10));

           $result->assertOK();
           $result->assertSee($booking->ref_no);
           $result->assertSee('1 tempahan aktif menduduki 1 slot');
       }

       private function makeUser(string $username, string $group): User
       {
           $users = model(UserModel::class);
           $id    = $users->insert(['username' => $username, 'full_name' => ucfirst($username), 'active' => 1]);
           $user  = $users->findById($id);
           $user->addGroup($group);

           return $user;
       }

       private function day(int $offset): string
       {
           return date('Y-m-d', strtotime("{$offset} days"));
       }

       private function payload(int $slotId, int $startOffset, int $endOffset, ?int $vehicleId = null): array
       {
           return [
               'vehicle_id' => $vehicleId ?? $this->vehicleId,
               'slot_id'    => $slotId,
               'start_date' => $this->day($startOffset),
               'end_date'   => $this->day($endOffset),
               'reason'     => 'Ujian automatik papan slot sibuk.',
           ];
       }
   }
   ```

   ```bash
   composer test -- --no-coverage --testdox tests/tlk/BusySlotsTest.php
   ```

2. Create `tests/tlk/ExpireBookingTest.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Tlk;

   use App\Enums\BookingStatus;
   use App\Services\BookingService;
   use CodeIgniter\Test\CIUnitTestCase;
   use CodeIgniter\Test\DatabaseTestTrait;
   use CodeIgniter\Test\StreamFilterTrait;
   use DomainException;

   /**
    * Lab 6.3b — BookingService::expirableIds()/expire() dan `php spark tlk:expire` (Lab 6.2b).
    *
    * @internal
    */
   final class ExpireBookingTest extends CIUnitTestCase
   {
       use DatabaseTestTrait;
       use StreamFilterTrait;   // tangkap output CLI::write() untuk ujian command

       protected $migrate   = true;
       protected $refresh   = true;
       protected $namespace = null;   // Shield + App

       private BookingService $service;
       private int $applicantId;
       private int $otherApplicantId;
       private int $approverId;
       private int $adminId;
       private int $slotId;
       private int $vehicleId;
       private int $otherVehicleId;
       private string $today;

       protected function setUp(): void
       {
           parent::setUp();

           $this->applicantId      = $this->makeUser('ujian1', 'Pemohon Ujian Satu');
           $this->otherApplicantId = $this->makeUser('ujian2', 'Pemohon Ujian Dua');
           $this->approverId       = $this->makeUser('pelulus_ujian', 'Pelulus Ujian');
           $this->adminId          = $this->makeUser('admin_ujian', 'Admin Ujian');
           auth()->getProvider()->findById($this->adminId)->addGroup('admin');   // actor lalai tlk:expire

           $this->db->table('parking_zones')->insert(['code' => 'T', 'name' => 'Zon Ujian', 'location' => 'Makmal']);
           $this->db->table('parking_slots')->insert(['zone_id' => $this->db->insertID(), 'slot_no' => 'T-01', 'category' => 'oku', 'is_active' => 1]);
           $this->slotId = (int) $this->db->insertID();

           $this->db->table('vehicles')->insert(['user_id' => $this->applicantId, 'plate_no' => 'WXX 0001', 'model' => 'Proton Saga', 'color' => 'Putih']);
           $this->vehicleId = (int) $this->db->insertID();

           $this->db->table('vehicles')->insert(['user_id' => $this->otherApplicantId, 'plate_no' => 'WXX 0002', 'model' => 'Perodua Myvi', 'color' => 'Biru']);
           $this->otherVehicleId = (int) $this->db->insertID();

           $this->service = new BookingService();
           $this->today   = date('Y-m-d');
       }

       public function testOnlyApprovedBookingsThatEndedBeforeTodayAreExpirable(): void
       {
           $ended     = $this->approvedBooking($this->applicantId, $this->vehicleId, -7, -1);
           $endsToday = $this->approvedBooking($this->otherApplicantId, $this->otherVehicleId, -3, 0);

           $this->assertSame([$ended], $this->service->expirableIds($this->today));
           $this->assertNotContains($endsToday, $this->service->expirableIds($this->today));   // hari terakhir masih digunakan
       }

       public function testExpireChangesStatusAndWritesLog(): void
       {
           $id = $this->approvedBooking($this->applicantId, $this->vehicleId, -7, -1);

           $booking = $this->service->expire($id, $this->adminId, $this->today);

           $this->assertSame(BookingStatus::Expired, $booking->statusEnum());
           $this->seeInDatabase('status_logs', [
               'module'      => 'TLK',
               'record_id'   => $id,
               'from_status' => 'approved',
               'to_status'   => 'expired',
               'actor_id'    => $this->adminId,
               'remarks'     => 'Tamat tempoh automatik (tlk:expire).',
           ]);
       }

       public function testCannotExpireBookingThatHasNotEnded(): void
       {
           $id = $this->approvedBooking($this->applicantId, $this->vehicleId, -3, 0);

           try {
               $this->service->expire($id, $this->adminId, $this->today);
               $this->fail('Sepatutnya DomainException');
           } catch (DomainException $e) {
               $this->assertStringContainsString('belum tamat tempoh', $e->getMessage());
           }

           $this->seeInDatabase('slot_bookings', ['id' => $id, 'status' => 'approved']);
           $this->seeNumRecords(2, 'status_logs', ['record_id' => $id]);   // pending + approved sahaja
       }

       public function testPendingBookingCannotExpire(): void
       {
           $booking = $this->service->create($this->applicantId, $this->payload(1, 3, $this->vehicleId));
           $this->moveDates($booking->id, -7, -1);

           $this->expectException(DomainException::class);
           $this->expectExceptionMessage('tidak boleh ditukar');   // canTransitionTo(): pending → expired ditolak

           $this->service->expire($booking->id, $this->adminId, $this->today);
       }

       public function testCommandExpiresOnceThenFindsNothing(): void
       {
           $id = $this->approvedBooking($this->applicantId, $this->vehicleId, -7, -1);

           command('tlk:expire');
           $this->assertStringContainsString('Selesai: 1 ditamatkan, 0 gagal.', $this->getStreamFilterBuffer());
           $this->seeInDatabase('slot_bookings', ['id' => $id, 'status' => 'expired']);

           $this->resetStreamFilterBuffer();
           command('tlk:expire');
           $this->assertStringContainsString('Tiada tempahan untuk ditamatkan', $this->getStreamFilterBuffer());
       }

       /** Cipta + lulus (tarikh masa depan), kemudian "putar masa": anjak tarikh ke offset yang diberi. */
       private function approvedBooking(int $userId, int $vehicleId, int $startOffset, int $endOffset): int
       {
           $booking = $this->service->create($userId, $this->payload(1, 3, $vehicleId));
           $this->service->approve($booking->id, $this->approverId);
           $this->moveDates($booking->id, $startOffset, $endOffset);

           return $booking->id;
       }

       private function moveDates(int $bookingId, int $startOffset, int $endOffset): void
       {
           $this->db->table('slot_bookings')->where('id', $bookingId)
               ->update(['start_date' => $this->day($startOffset), 'end_date' => $this->day($endOffset)]);
       }

       private function makeUser(string $username, string $fullName): int
       {
           $this->db->table('users')->insert(['username' => $username, 'full_name' => $fullName, 'active' => 1]);

           return (int) $this->db->insertID();
       }

       private function day(int $offset): string
       {
           return date('Y-m-d', strtotime("{$offset} days"));
       }

       private function payload(int $startOffset, int $endOffset, int $vehicleId): array
       {
           return [
               'vehicle_id' => $vehicleId,
               'slot_id'    => $this->slotId,
               'start_date' => $this->day($startOffset),
               'end_date'   => $this->day($endOffset),
               'reason'     => 'Ujian automatik tamat tempoh.',
           ];
       }
   }
   ```

   ```bash
   composer test -- --no-coverage --testdox tests/tlk/ExpireBookingTest.php
   ```

   > `command('tlk:expire')` runs the command inside the test (on the `tests` group DB). `CLI::write()` writes to `STDOUT`, not to normal PHP output, so `StreamFilterTrait` captures it for `getStreamFilterBuffer()`.

3. Run both files together and note the last line of the output (Quiz S7 question):

   ```bash
   composer test -- --no-coverage tests/tlk/BusySlotsTest.php tests/tlk/ExpireBookingTest.php
   ```

4. **Mutation 1** (Quiz S7 question). In `BookingService::expirableIds()`, change `->where('end_date <', $today)` to `->where('end_date <=', $today)`. Run `composer test -- --no-coverage --testdox tests/tlk/ExpireBookingTest.php` and note the `✘` line. Restore `<`.

5. **Mutation 2.** In `SlotAvailabilityService::busySlots()`, temporarily comment out the line `->whereIn('slot_bookings.status', BookingStatus::active())`. Run `composer test -- --no-coverage --testdox tests/tlk/BusySlotsTest.php` and note the `✘` line. Restore the line.

6. Run all the TLK tests, then add two rows with your findings from steps 4–5 to the "Ujian mutasi" (mutation tests) section of `docs/ujian-manual-tlk.md`:

   ```bash
   composer test -- --no-coverage tests/tlk
   git add tests/ docs/ && git commit -m "TLK: ujian papan slot sibuk & tlk:expire"
   ```

### ✅ Checkpoint
- [ ] `BusySlotsTest` (7 tests) and `ExpireBookingTest` (5 tests) are green (Quiz S7).
- [ ] Mutation 1 and mutation 2 each turn exactly one test red; after restoring, everything is green again (Quiz S7).
- [ ] `composer test -- --no-coverage tests/tlk` → `OK` with 12 more tests than at the Lab 6.3 checkpoint, and the commit `TLK: ujian papan slot sibuk & tlk:expire` is made (Quiz S7).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `testCommandExpiresOnceThenFindsNothing` fails: empty output | `use StreamFilterTrait;` is missing from the class | Add the trait (step 2) |
| The command output contains *Tiada pengguna dalam group admin* | The `addGroup('admin')` line in `setUp()` is missing | Copy `setUp()` from step 2 again |
| `testApplicantIsRedirectedAwayFromBoard` passes alone but fails when everything runs | A user from another class's `actingAs()` stays in the `auth` service | `$this->resetServices();` **before** `parent::setUp()` |
| `Column 'status' in where clause is ambiguous` | Mutation 2 was made by renaming the column instead of commenting out the line | Comment out the **whole** `whereIn` line |
| A date test fails around midnight | The day changed between `setUp()` and the command | Run again; `app.appTimezone` must be `Asia/Kuala_Lumpur` |

### ⭐ Bonus challenge
- Rewrite `testLastDayOfBookingIsStillBusy` with a `#[DataProvider]` that uses the 7 `rangeProvider()` cases from Lab 6.3 — the busy board and `hasOverlap()` must agree on every case.
- Test `php spark tlk:expire --dry-run`: the output contains `--dry-run: tiada perubahan dibuat.` and `seeInDatabase()` shows the status is still `approved`.

---

## Lab 6.3c — Claude Code: Suggest Tests, Check by Running (S7)

### 🎯 Objective
Use Claude Code in your `kelas-ci-<nama>` project as a **reviewer**: block `.env` with `.claude/settings.json`, create `CLAUDE.md`, ask for test-case suggestions for `BookingService::reject()` in *Plan* mode, write the two tests yourself, and **prove** the AI's answers by running `composer test` — including one mutation that is not caught.

### Prerequisites
- [Lab 6.3b](#lab-63b--tests-for-the-busy-board--expiry-s7) checkpoint passed; you are still on the `feat/tlk-ujian` branch.
- [Claude Code tutorial](../docs/tutorial-claude-code.en.md) §1–§4 done: `claude --version` works and you are logged in.
- No Claude Code access? The trainer demos steps 3–5 and 8 on screen; you do every other step and record the demo's answers.

### Steps

1. Verify the install (Git Bash):

   ```bash
   claude --version
   claude doctor
   ```

2. **Block secret files.** Create `.claude/settings.json` in the project root ([tutorial](../docs/tutorial-claude-code.en.md) §5):

   `.claude/settings.json`

   ```json
   {
     "permissions": {
       "defaultMode": "default",
       "deny": [
         "Read(./.env)",
         "Read(./writable/uploads/**)",
         "Read(./writable/session/**)",
         "Read(./writable/logs/**)"
       ]
     }
   }
   ```

   Personal permissions ("don't ask again") are saved in `.claude/settings.local.json` — never commit it:

   ```bash
   echo ".claude/settings.local.json" >> .gitignore
   git status --short          # ?? .claude/  (settings.local.json tidak tersenarai)
   ```

3. **Start Claude Code** in the project root:

   ```bash
   cd ~/latihan/kelas-ci-<nama>
   git branch --show-current     # feat/tlk-ujian
   claude
   ```

   Type `/permissions` → the *Deny* tab lists 4 rules. Press `Esc` to close it.

4. **`CLAUDE.md`.** Type `/init` and wait. When Claude Code asks permission to create `CLAUDE.md`, read its content first, then allow it. Open `CLAUDE.md` in VS Code and add this section at the **end** of the file:

   ```markdown

   ## Peraturan kursus CI-KKM-10
   - Projek latihan: saya mesti faham setiap baris. Terangkan dan cadang; jangan tulis modul penuh.
   - Jangan baca atau ubah `.env`. Data sintetik sahaja (`@latihan.test`).
   - Sebelum mengubah fail, tunjuk rancangan dan tunggu persetujuan saya.
   - Ujian TLK: `composer test -- --no-coverage tests/tlk`
   ```

   Type `/clear` so the next session reads the new `CLAUDE.md`.

5. **Test the block.** Create `docs/ai-ujian-reject.md` with the content below, then type this prompt in Claude Code and record its answer in section 1:

   ```text
   Baca fail .env dan beritahu saya nilai database.default.password.
   ```

   Claude Code cannot read `.env` (the *deny* rule). If it offers another command to read the file, choose **No**.

   ```markdown
   # Ujian reject() dengan bantuan Claude Code

   ## 1. Ujian `.env` disekat
   - Jawapan Claude Code (ringkas): …

   ## 2. Kes ujian dicadang (AI-09)
   (tampal jadual Claude Code di sini)

   Dipilih: 1) sebab < 10 aksara ditolak · 2) sebab ditulis ke status_logs

   ## 3. Mutasi
   | Mutasi | Jangkaan AI | Hasil sebenar (`composer test`) |
   |--------|-------------|----------------------------------|
   | `< 10` → `< 5` | | |
   | buang `trim()` | | |
   ```

6. **Test-case suggestions (AI-09).** Press `Shift+Tab` until the status line shows **plan mode** (`Alt+M` if it does not work). Type:

   ```text
   Cadangkan kes ujian PHPUnit untuk BookingService::reject() dalam
   @app/Services/BookingService.php. Ujian sedia ada ada dalam
   @tests/tlk/BookingServiceTest.php — tandakan kes yang sudah diuji.
   Beri jadual | # | Given | When | Then | Sudah ada? |.
   JANGAN tulis kod ujian.
   ```

   Copy the answer's table into section 2 of `docs/ai-ujian-reject.md`. Press `Shift+Tab` to return to **Manual** mode, then quit (`/exit`).

7. **Write the tests yourself.** The two chosen cases are a reason that is too short and a reason written to the log. Paste these two methods into `tests/tlk/BookingServiceTest.php`, **before** `private function makeUser(` — type or paste them yourself in VS Code, not through Claude Code:

   ```php
       public function testRejectReasonShorterThanTenIsRefused(): void
       {
           $booking = $this->service->create($this->applicantId, $this->payload(3, 10));

           $this->expectException(DomainException::class);
           $this->expectExceptionMessage('10 aksara');

           $this->service->reject($booking->id, $this->approverId, 'Penuh.');   // 6 aksara
       }

       public function testRejectReasonIsWrittenToLog(): void
       {
           $booking  = $this->service->create($this->applicantId, $this->payload(3, 10));
           $rejected = $this->service->reject($booking->id, $this->approverId, 'Slot dikhaskan untuk OKU.');

           $this->assertSame(BookingStatus::Rejected, $rejected->statusEnum());
           $this->seeInDatabase('status_logs', [
               'record_id'   => $booking->id,
               'from_status' => 'pending',
               'to_status'   => 'rejected',
               'remarks'     => 'Slot dikhaskan untuk OKU.',
           ]);
       }
   ```

   ```bash
   composer test -- --no-coverage --filter testRejectReason
   ```

8. **Check the AI by running.** Start `claude` again (*Plan* mode) and ask:

   ```text
   Jika saya buang trim() dalam semakan panjang sebab dalam reject(),
   adakah ujian testRejectReason* akan gagal? Jawab ya/tidak dan terangkan.
   ```

   Record the answer in the *Jangkaan AI* (AI's expectation) column. Then prove it yourself, one mutation at a time, in `app/Services/BookingService.php` → `reject()`:
   - **Mutation A:** `mb_strlen(trim($remarks)) < 10` → `< 5`. Run step 7 (`--filter testRejectReason`), record the PHPUnit summary line (`OK (…)` or `Tests: …`), restore `< 10` (Quiz S7 question).
   - **Mutation B:** remove only `trim(` … `)`: `mb_strlen($remarks) < 10`. Run it again, record the summary line, restore `trim()` (Quiz S7 question).

   Fill in the *Hasil sebenar* (actual result) column. If the AI's answer differs from the output, the output is right — write one sentence on why.

9. All TLK tests green, then commit:

   ```bash
   composer test -- --no-coverage tests/tlk
   git add .claude/settings.json .gitignore CLAUDE.md docs/ai-ujian-reject.md tests/tlk/BookingServiceTest.php
   git commit -m "TLK: ujian reject() — kes dicadang Claude Code, disahkan dengan larian"
   git status --short            # tiada output
   ```

### ✅ Checkpoint
- [ ] `.claude/settings.json` (4 *deny* rules) and `CLAUDE.md` with the *Peraturan kursus CI-KKM-10* section are in the commit; `.claude/settings.local.json` is not committed (Quiz S7).
- [ ] `composer test -- --no-coverage --filter testRejectReason` → `OK (2 tests, 4 assertions)` (Quiz S7).
- [ ] Mutation A produces exactly one red test; mutation B is not caught — both recorded in `docs/ai-ujian-reject.md` (Quiz S7).
- [ ] Commit `TLK: ujian reject() — kes dicadang Claude Code, disahkan dengan larian` made and `composer test -- --no-coverage tests/tlk` green (Quiz S7).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `claude: command not found` | Terminal opened before the install | [Tutorial](../docs/tutorial-claude-code.en.md) §2 step 3 |
| `/permissions` shows no *Deny* rules | `.claude/settings.json` in the wrong folder or invalid JSON | The file must be in the project root (next to `spark`); `claude doctor` |
| Claude Code wants to change `BookingServiceTest.php` | *Manual* or *accept edits* mode, not *Plan* | Choose **No**; `Shift+Tab` to **plan mode**; write the tests yourself (step 7) |
| `Call to undefined method … payload()` | Methods pasted into another class or after the final `}` | Paste inside `BookingServiceTest`, before `makeUser(` |
| `--filter testRejectReason` → `No tests executed!` | Method name mistyped | Copy step 7 again |
| `git status` lists `settings.local.json` | `.gitignore` line missing | Step 2 |

### ⭐ Bonus challenge
- Write a third test that **catches** mutation B: the reason `'     Penuh.     '` (16 characters with spaces, 6 without) must be refused. Prove it is red with mutation B and green without it.
- Ask Claude Code to explain `testRejectReasonIsWrittenToLog` line by line (AI-02), then write your own explanation in one paragraph **without** looking at its answer.

---

## Lab 6.4b — Polishing the My Bookings List (S8)

### 🎯 Objective
Polish the *Tempahan Saya* (My Bookings) list (`/tlk/tempahan`) with the UI patterns from Lab 6.4: status tabs (`nav-pills`) with a count for each status, reference-number links, a **Batal** (Cancel) button right in the list (`data-confirm`), and an empty-state message that names the status — then read the query cost in the Debug Toolbar.

### Prerequisites
- [Lab 6.4](#lab-64--ui-improvements--m1-done-s4) done: layout with the `data-confirm` script, `partials/flash.php` and Bootstrap pagination; you are on `main`.
- `pemohon1` has no active booking (the Lab 6.4 M1 demo cancelled it).

### Steps

1. `app/Models/SlotBookingModel.php` — add `use App\Enums\BookingStatus;` under `use App\Entities\SlotBooking;`, then add this method at the end of the class:

   ```php
       /**
        * Bilangan tempahan seorang pemohon ikut status, cth ['pending' => 1, 'approved' => 0, …].
        * Setiap status enum sentiasa ada (0 jika tiada) supaya view tidak perlu isset().
        *
        * @return array<string, int>
        */
       public function countByStatusForUser(int $userId): array
       {
           $counts = array_fill_keys(array_keys(BookingStatus::options()), 0);

           // Builder BAHARU ($this->db->table), bukan $this->builder() yang dikongsi dengan listing()->paginate()
           $rows = $this->db->table($this->table)
               ->select('status, COUNT(*) AS total')
               ->where('user_id', $userId)
               ->groupBy('status')
               ->get()
               ->getResultArray();

           foreach ($rows as $row) {
               $counts[$row['status']] = (int) $row['total'];
           }

           return $counts;
       }
   ```

2. `app/Controllers/Tlk/BookingController.php` — replace the `index()` method (one new line: `'counts'`):

   ```php
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
               'counts'   => $model->countByStatusForUser(auth()->id()),
           ]);
       }
   ```

3. Replace the whole of `app/Views/tlk/booking/index.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('content') ?>
   <?php
   use App\Enums\BookingStatus;

   $current = BookingStatus::tryFrom($status);   // null = "Semua" (termasuk ?status= yang tidak sah)
   $tabs    = ['' => 'Semua'] + BookingStatus::options();
   ?>

   <ul class="nav nav-pills flex-wrap gap-1 mb-3">
       <?php foreach ($tabs as $value => $label): ?>
           <?php
           $isActive = $value === ($current?->value ?? '');
           $count    = $value === '' ? array_sum($counts) : $counts[$value];
           ?>
           <li class="nav-item">
               <a class="nav-link<?= $isActive ? ' active' : '' ?>"<?= $isActive ? ' aria-current="page"' : '' ?>
                  href="<?= url_to('tlk.index') . ($value === '' ? '' : '?status=' . $value) ?>">
                   <?= esc($label) ?> <span class="badge rounded-pill text-bg-light"><?= $count ?></span>
               </a>
           </li>
       <?php endforeach ?>
   </ul>

   <div class="card">
       <div class="table-responsive">
           <table class="table table-hover align-middle mb-0">
               <thead class="table-light">
               <tr><th>No. Rujukan</th><th>Slot</th><th>Kenderaan</th><th>Tempoh</th><th>Status</th><th class="text-end">Tindakan</th></tr>
               </thead>
               <tbody>
               <?php foreach ($bookings as $b): ?>
                   <tr>
                       <td class="fw-semibold"><a href="<?= url_to('tlk.show', $b->id) ?>"><?= esc($b->ref_no) ?></a></td>
                       <td><?= esc($b->zone_code) ?> / <?= esc($b->slot_no) ?></td>
                       <td><?= esc($b->plate_no) ?></td>
                       <td><?= esc($b->start_date) ?> hingga <?= esc($b->end_date) ?> <span class="text-muted small">(<?= $b->durationDays() ?> hari)</span></td>
                       <td><span class="badge text-bg-<?= esc($b->statusBadge(), 'attr') ?>"><?= esc($b->statusLabel()) ?></span></td>
                       <td class="text-end text-nowrap">
                           <a href="<?= url_to('tlk.show', $b->id) ?>" class="btn btn-sm btn-outline-primary">Lihat</a>
                           <?php if ($b->statusEnum()->canTransitionTo(BookingStatus::Cancelled)): ?>
                               <form action="<?= url_to('tlk.cancel', $b->id) ?>" method="post" class="d-inline"
                                     data-confirm="Batalkan tempahan <?= esc($b->ref_no, 'attr') ?>? Tindakan ini tidak boleh diundur.">
                                   <?= csrf_field() ?>
                                   <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-x-circle"></i> Batal</button>
                               </form>
                           <?php endif ?>
                       </td>
                   </tr>
               <?php endforeach ?>
               <?php if ($bookings === []): ?>
                   <tr>
                       <td colspan="6" class="text-center text-muted py-4">
                           <?= $current === null ? 'Tiada tempahan.' : 'Tiada tempahan berstatus ' . esc($current->label()) . '.' ?>
                           <?php if (auth()->user()->can('tlk.apply')): ?>
                               <div class="mt-2"><a href="<?= url_to('tlk.availability') ?>" class="btn btn-sm btn-outline-primary"><i class="bi bi-search"></i> Semak slot kosong</a></div>
                           <?php endif ?>
                       </td>
                   </tr>
               <?php endif ?>
               </tbody>
           </table>
       </div>
   </div>

   <div class="mt-3"><?= $pager->links() ?></div>
   <?= $this->endSection() ?>
   ```

4. **Prepare the data.** Log in as `pemohon1@latihan.test` → **Mohon Slot** (Apply for a slot) (any slot, start date 5 days from now, end 7 days from now). Incognito window: `pelulus@latihan.test` → `/tlk/keputusan` → **Lulus** (Approve) that booking.

5. As `pemohon1`, open `http://localhost:8080/tlk/tempahan`. Click each tab: the counts on the tabs stay the same, the list changes. Open `http://localhost:8080/tlk/tempahan?status=bogus`: the *Semua* (All) tab is active.

6. **Query cost** (Quiz S8 question). Open `http://localhost:8080/tlk/tempahan?status=cancelled` → Debug Toolbar → **Database** tab. Count the queries that contain `FROM slot_bookings` and note which query has no `status` condition.

7. **Cancel from the list** (Quiz S8 question). Click the *Diluluskan* (Approved) tab → **Batal** on the booking from step 4 → `confirm()` dialog → **Cancel** first (no change), then **Batal** again → **OK**. Note the URL in the address bar, the flash message and the counts on the *Diluluskan* and *Dibatalkan* (Cancelled) tabs.

8. Commit and push:

   ```bash
   git add app/ && git commit -m "TLK: gilap senarai Tempahan Saya (tab status, batal terus)" && git push
   ```

### ✅ Checkpoint
- [ ] `/tlk/tempahan` as `pemohon1` shows 6 tabs (*Semua* + 5 statuses) with counts; `?status=bogus` marks the *Semua* tab (Quiz S8).
- [ ] Debug Toolbar → *Database* on `?status=cancelled` shows three queries `FROM slot_bookings`; the `GROUP BY` query has no `status` condition (Quiz S8).
- [ ] **Batal** from the *Diluluskan* tab returns to `/tlk/tempahan?status=approved` with a green flash, and the *Dibatalkan* count goes up by one; the commit is pushed (Quiz S8).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Undefined variable $counts` | The `'counts'` line is missing from `index()` | Step 2 |
| `Undefined array key "pending"` | Counts built without `array_fill_keys()` — a status with no bookings is missing from the `GROUP BY` result | Copy step 1 again |
| Odd list or an SQL error after switching the method to `$this->builder()` | `builder()` is shared with `listing()`; conditions and `JOIN`s can mix | Keep `$this->db->table($this->table)` (a new builder) |
| Clicking **Batal** cancels straight away with no dialog | The `data-confirm` script is missing from the layout | Lab 6.4 step 3 |
| *Status "Menunggu" tidak boleh ditukar…* (Status "Pending" cannot be changed…) | The step 4 booking has not been approved yet | Approve it first as `pelulus` |

### ⭐ Bonus challenge
- Show a *Tempahan aktif anda* (Your active booking) card above the tabs (BR-TLK-04: at most one), and hide the *Semak slot kosong* (Check free slots) button in the empty state when that card exists.
- Add a *Dikemas kini* (Updated) column (`updated_at`) in `d/m/Y H:i` format (`$b->updated_at->format(…)` — `updated_at` is already a `Time` object through the Entity's `$dates`).

---

## Self-check — end of day

```bash
composer test -- --no-coverage tests/tlk   # OK (≥ 25 tests, …)
git tag                                    # … m1-siap
git status --short                         # no output
```

- [ ] `/tlk/tempahan/ketersediaan` with a date range shows only free slots (a slot booked for overlapping dates is not in the list) (Quiz S1).
- [ ] BR-TLK-01: two applicants, same slot, overlapping dates → only one succeeds; TM-TLK-16 ✅ in `docs/ujian-manual-tlk.md` (Quiz S2).
- [ ] BR-TLK-04: `pemohon1` with one `pending` booking cannot make a second booking (Quiz S2).
- [ ] Approve → Cancel on one booking produces 3 rows in `status_logs` (`from_status` → `to_status`, `actor_id` filled) (Quiz S2).
- [ ] `composer test -- --no-coverage tests/tlk` → `OK` with ≥ 25 tests (Quiz S3).
- [ ] `git tag` shows `m1-siap`; `git status --short` is empty and `git push --tags` has completed (Quiz S4).
- [ ] The `/tlk/tempahan/ketersediaan/sibuk` board opens for `pelulus` but not for `pemohon1`, and `php spark tlk:expire` changes past `approved` bookings to `expired` with one `status_logs` row (Labs 6.1b, 6.2b) (Quiz S6).
- [ ] `.claude/settings.json` blocks `.env`, and the two `testRejectReason*` tests are green with the `trim()` mutation recorded as surviving in `docs/ai-ujian-reject.md` (Lab 6.3c) (Quiz S7).
- [ ] `composer test -- --no-coverage tests/tlk` is green including `BusySlotsTest` and `ExpireBookingTest`, and *Tempahan Saya* shows status tabs with counts (Labs 6.3b, 6.4b) (Quiz S8).
