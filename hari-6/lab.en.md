# Lab Day 6 — TLK Module (Part 2)

[⬅️ README Day 6](./README.md) · [📘 SPEC](../SPEC-KURSUS.md) · [🧩 Code templates](../templates/kod/)

> **Lab rules:** today is about **accuracy under pressure**, not speed. Write the overlap query and the transaction **yourself first**; compare with the template only after the checkpoint. AI can help explain `Lock wait timeout` or `errno` — but you must be able to explain why the locks are taken in the order user → slot.

| Lab | Session | Branch | Result |
|-----|------|--------|-------|
| 6.1 | S1 09:00–10:30 | `feat/tlk-ketersediaan` | `SlotAvailabilityService` + free-slot view |
| 6.2 | S2 10:45–12:30 | `feat/tlk-keputusan` | `BookingService` v2 + `status_logs` + approve/reject/cancel |
| 6.3 | S3 14:30–16:00 | `feat/tlk-ujian` | `BookingServiceTest` + `DecisionAccessTest` green |
| 6.4 | S4 16:00–17:00 | `main` | Polished UI, M1 demo, tag `m1-siap` |

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

   class SlotAvailabilityService
   {
       public function __construct(
           private readonly SlotBookingModel $bookings = new SlotBookingModel(),
           private readonly ParkingSlotModel $slots = new ParkingSlotModel(),
       ) {
       }

       public function hasOverlap(int $slotId, string $start, string $end, ?int $excludeBookingId = null): bool
       {
           // TODO: write it yourself — README §1.2. Tip: whereIn('status', BookingStatus::active())
       }

       public function availableSlots(string $start, string $end, ?string $category = null, ?int $zoneId = null): array
       {
           // TODO: withZone() + is_active + whereNotIn(subquery) + optional filters — README §1.2
       }
   }
   ```

3. Register it in `app/Config/Services.php` (add `use App\Services\SlotAvailabilityService;`):

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
- `docs/pertindihan-tarikh.md`: cases 1–5 overlap, cases 6–7 do not.
- Booking `TLK-2026-0001` (slot A-01) is in the DB. Open `http://localhost:8080/tlk/tempahan/ketersediaan?start_date=<mula>&end_date=<tamat>&category=oku` with dates that **overlap** that booking → A-01 is **not** in the list; with dates **after** the booking ends → A-01 **is** in the list.
- Debug Toolbar → *Database*: the query contains `NOT IN (SELECT slot_id FROM slot_bookings WHERE status IN ('pending','approved') …)`.
- `?start_date=2026-10-20&end_date=2026-10-10` → error message, no list.

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `/tlk/tempahan/ketersediaan` → 404 | Route not added yet, misspelt, or placed outside the `tlk/tempahan` group | `php spark routes \| grep ketersediaan` |
| Deleted (soft-deleted) slots appear | Using `$this->slots->builder()` (raw Query Builder) | Use Model methods (`withZone()->…->findAll()`) — the `deleted_at` filter is automatic |
| All slots disappear | Subquery without `whereIn('status', …)` / condition reversed | Check the table from step 1 |
| `Call to undefined method … whereNotIn() closure` | Old CI version | CI ≥ 4.6 supports closure subqueries |

### ⭐ Bonus challenge
- Also show **busy** slots (grey cards) with the reference number of the booking that occupies them (only for `tlk.decide`).
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

3. Rewrite `app/Services/BookingService.php` following README §2.2–2.3. Checklist — tick each one:
   - [ ] The constructor accepts `StatusLogModel $logs`, `SlotAvailabilityService $availability`, `ReferenceNumberService $refNumbers`, `?BaseConnection $db` (default `db_connect()`)
   - [ ] `create()`: `assertValidPeriod()` → `assertVehicleOwnedBy()` → `transBegin()` → lock `users` → lock `parking_slots` → slot active? → BR-TLK-04 → BR-TLK-01 → `next('TLK')` → `insert` → `record(null → pending)` → `transCommit()`
   - [ ] `catch (Throwable $e) { transRollback(); throw $e; }`
   - [ ] public `assertValidPeriod()`: format, not in the past (today is allowed), `end >= start`, `diff()->days > 90` rejected
   - [ ] `approve()`, `reject()` (reason ≥ 10 characters), `cancel()` (owner **or** admin) → all go through `transition()`
   - [ ] `transition()`: lock the booking row → `canTransitionTo()` → if approving: lock the slot + `hasOverlap(…, $bookingId)` → `update` → `record()`
   - [ ] `lockRow()` uses `prefixTable()` + `?` binding

   `isAdmin()` helper for `cancel()`:

   ```php
   private function isAdmin(int $userId): bool
   {
       return auth()->getProvider()->findById($userId)?->inGroup('admin') ?? false;
   }
   ```

4. Update `Config\Services::bookingService()` — one shared connection for both services:

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

   Check against [`Routes-tlk.php.txt`](../templates/kod/Routes-tlk.php.txt).

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

7. `app/Views/tlk/decision/index.php` — a booking table with a status filter; for every `pending` row: an **Approve** form (POST, `data-confirm`) and a **Reject** button that opens a `collapse` row holding a `remarks` input (min 10 characters) + a *Confirm Reject* button. For admins, `approved` rows have a **Cancel** form → `tlk.cancel`. Write it yourself; follow the pattern in `tlk/booking/index.php`. Tip for the reject row:

   ```php
   <tr class="collapse" id="tolak-<?= $b->id ?>">
       <td colspan="6" class="bg-light">
           <form action="<?= url_to('tlk.decision.reject', $b->id) ?>" method="post" class="d-flex gap-2"
                 data-confirm="Tolak <?= esc($b->ref_no, 'attr') ?>?">
               <?= csrf_field() ?>
               <input type="text" name="remarks" class="form-control" minlength="10" required placeholder="Sebab penolakan (min 10 aksara)">
               <button class="btn btn-danger" type="submit">Sahkan Tolak</button>
           </form>
       </td>
   </tr>
   ```

8. `BookingController` — update `show()` (approver/admin can view; pass the history) and add `cancel()`:

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

9. `app/Views/tlk/booking/show.php` — add a right-hand **Status History** column and a conditional Cancel button:

   ```php
   <?php if ($booking->statusEnum()->canTransitionTo(BookingStatus::Cancelled)): ?>
       <form action="<?= url_to('tlk.cancel', $booking->id) ?>" method="post"
             data-confirm="Batalkan tempahan <?= esc($booking->ref_no, 'attr') ?>? Tindakan ini tidak boleh diundur.">
           <?= csrf_field() ?>
           <button type="submit" class="btn btn-outline-danger"><i class="bi bi-x-circle"></i> Batalkan Tempahan</button>
       </form>
   <?php endif ?>

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
   </ul>
   ```

   (add `use App\Enums\BookingStatus;` at the top of the view)

**E. Prove the lock with two MySQL sessions (compulsory demo)**

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
14. Repeat step 1 (two applicants, same slot, overlapping dates) → now only **one** succeeds; the second gets *"Slot ini sudah ditempah bagi tarikh yang bertindih."* (This slot is already booked for overlapping dates.) Update TM-TLK-16 → ✅.

15. Commit `TLK: transaksi + kunci baris BR-TLK-01/04/05, keputusan & status_logs`.

### ✅ Checkpoint
- Step 11: the request **waits** until `COMMIT` (visual proof of the row lock).
- `pelulus@latihan.test` → `/tlk/keputusan` → *Lulus* (Approve) one booking → green flash; *Tolak* (Reject) with a 5-character reason (first remove the `minlength`/`required` attributes on the `<input name="remarks">` via DevTools — the browser blocks it; we are testing the **server** rule) → red flash *"Sebab penolakan wajib diisi (sekurang-kurangnya 10 aksara)."* (A rejection reason is required, at least 10 characters.)
- `pemohon1` → details of the approved booking → *Batalkan* (Cancel) → status *Dibatalkan* (Cancelled); the history shows 3 rows (Menunggu → Diluluskan → Dibatalkan, i.e. Pending → Approved → Cancelled) with the actor's name.
- A `pending` booking has **no** Cancel button; a direct POST to `/tlk/tempahan/{id}/cancel` → message *"Status "Menunggu" tidak boleh ditukar kepada "Dibatalkan"."* (Status "Pending" cannot be changed to "Cancelled".)
- `pemohon1` tries a second booking while one is still `pending` → *"Anda sudah mempunyai satu tempahan aktif…"* (You already have one active booking…) (BR-TLK-04).
- SQL:

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
- A Spark command `tlk:expire` that changes `approved` bookings with `end_date < hari ini` (before today) to `expired` through `transition()` (actor = system user/admin). Run `php spark tlk:expire` and check `status_logs`.
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

2. `tests/tlk/BookingServiceTest.php` — start with the skeleton + helpers (copy), then write the tests **one at a time**, running after each one:

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

3. Write these tests (the names are a guide; README §3.3 gives examples of two of them):

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

   For the admin test: `auth()->getProvider()->findById($adminId)->addGroup('admin');`

   ```bash
   composer test -- --no-coverage --testdox tests/tlk/BookingServiceTest.php
   ```

4. `tests/tlk/DecisionAccessTest.php` — HTTP feature test (copy it, then **explain each test to your partner**):

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
- `composer test -- --no-coverage tests/tlk` → `OK` with **≥ 25 tests** (BookingStatus 5 + BookingService ≥ 15 + DecisionAccess 5). Reference solution (tag `penyelesaian-hari-6`): **43** = BookingStatus 6 (with ⭐) + BookingService 28 (template 27 + 1) + DecisionAccess 7 (with ⭐) + ReferenceNumberService 2.
- Step 6: removing `hasOverlap()` turns at least `testCreateRejectsOverlappingBooking` red; changing `<=` → `<` turns the *"overlap at the start edge"* case red.
- `mysql -u kkm_dev -p -e "SELECT COUNT(*) FROM slot_bookings" kkm_latihan` before and after `composer test` → the **same** number, not `0` (your Lab 6.1–6.2 bookings are still there). The tests write to `kkm_latihan_test` (the `tests` group), **not** `kkm_latihan`.
- Compare with [`BookingServiceTest.php.txt`](../templates/kod/BookingServiceTest.php.txt).

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

1. **Status badge** — in `tlk/booking/index.php`, `tlk/booking/show.php`, `tlk/decision/index.php` replace the status text with:

   ```php
   <span class="badge text-bg-<?= esc($b->statusBadge(), 'attr') ?>"><?= esc($b->statusLabel()) ?></span>
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

3. **Layout** — update `app/Views/layouts/main.php` following [`layout-main.php.txt`](../templates/kod/layout-main.php.txt): menu items *Tempahan Saya* (My Bookings), *Mohon Slot* (Apply for a Slot) (`can('tlk.apply')`), *Slot Kosong* (Free Slots), *Keputusan TLK* (TLK Decisions) (`can('tlk.decide')`), *Urus Slot* (Manage Slots) (`inGroup('admin')`), and the `data-confirm` script before `</body>` (README §4.1).

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

5. **Links** — the reference number in `tlk/decision/index.php` becomes a link to `url_to('tlk.show', $b->id)`; the booking form has a *"Semak slot kosong dahulu"* (Check free slots first) link to `tlk.availability`.

6. **Short accessibility checklist:** every `<input>` has a `<label for>`; icon buttons have text; badge colour is not the only cue (a text label is always present).

7. **M1 demo (5 min per pair)** — script:

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
- `/admin/slot?page=2` shows Bootstrap pagination (`<ul class="pagination">` with `page-item active`).
- Click *Lulus* (Approve) → a `confirm()` dialog appears; *Cancel* in the dialog → no change.
- Log in as the 3 roles → the menu differs by permission.
- The 6-step demo succeeds in front of the trainer; `git tag` shows `m1-siap`.

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

## Self-check — end of day

```bash
composer test -- --no-coverage tests/tlk   # OK (≥ 25 tests, …)
git tag                                    # … m1-siap
git status --short                         # no output
```

- [ ] `/tlk/tempahan/ketersediaan` with a date range shows only free slots (a slot booked for overlapping dates is not in the list).
- [ ] BR-TLK-01: two applicants, same slot, overlapping dates → only one succeeds; TM-TLK-16 ✅ in `docs/ujian-manual-tlk.md`.
- [ ] BR-TLK-04: `pemohon1` with one `pending` booking cannot make a second booking.
- [ ] Approve → Cancel on one booking produces 3 rows in `status_logs` (`from_status` → `to_status`, `actor_id` filled).
- [ ] `composer test -- --no-coverage tests/tlk` → `OK` with ≥ 25 tests.
- [ ] `git tag` shows `m1-siap`; `git status --short` is empty and `git push --tags` has completed.
