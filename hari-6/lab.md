# Lab Hari 6 — Modul TLK (Bahagian 2)

[⬅️ README Hari 6](./README.md) · [📘 SPEC](../SPEC-KURSUS.md) · [🧩 Template kod](../templates/kod/)

> **Peraturan lab:** hari ini tentang **ketepatan di bawah tekanan**, bukan kelajuan. Tulis query pertindihan & transaksi **sendiri dahulu**; bandingkan dengan template hanya selepas checkpoint. AI boleh membantu menerangkan `Lock wait timeout` atau `errno` — tetapi anda mesti boleh menerangkan kenapa kunci diambil mengikut tertib pengguna → slot.

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

   class SlotAvailabilityService
   {
       public function __construct(
           private readonly SlotBookingModel $bookings = new SlotBookingModel(),
           private readonly ParkingSlotModel $slots = new ParkingSlotModel(),
       ) {
       }

       public function hasOverlap(int $slotId, string $start, string $end, ?int $excludeBookingId = null): bool
       {
           // TODO: tulis sendiri — README §1.2. Petua: whereIn('status', BookingStatus::active())
       }

       public function availableSlots(string $start, string $end, ?string $category = null, ?int $zoneId = null): array
       {
           // TODO: withZone() + is_active + whereNotIn(subquery) + penapis pilihan — README §1.2
       }
   }
   ```

3. Daftar dalam `app/Config/Services.php` (tambah `use App\Services\SlotAvailabilityService;`):

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

3. Tulis semula `app/Services/BookingService.php` mengikut README §2.2–2.3. Senarai semak — tanda setiap satu:
   - [ ] Konstruktor menerima `StatusLogModel $logs`, `SlotAvailabilityService $availability`, `ReferenceNumberService $refNumbers`, `?BaseConnection $db` (lalai `db_connect()`)
   - [ ] `create()`: `assertValidPeriod()` → `assertVehicleOwnedBy()` → `transBegin()` → kunci `users` → kunci `parking_slots` → slot aktif? → BR-TLK-04 → BR-TLK-01 → `next('TLK')` → `insert` → `record(null → pending)` → `transCommit()`
   - [ ] `catch (Throwable $e) { transRollback(); throw $e; }`
   - [ ] `assertValidPeriod()` awam: format, bukan masa lalu (hari ini dibenarkan), `end >= start`, `diff()->days > 90` ditolak
   - [ ] `approve()`, `reject()` (sebab ≥ 10 aksara), `cancel()` (pemilik **atau** admin) → semua melalui `transition()`
   - [ ] `transition()`: kunci baris tempahan → `canTransitionTo()` → jika lulus: kunci slot + `hasOverlap(…, $bookingId)` → `update` → `record()`
   - [ ] `lockRow()` guna `prefixTable()` + binding `?`

   Pembantu `isAdmin()` untuk `cancel()`:

   ```php
   private function isAdmin(int $userId): bool
   {
       return auth()->getProvider()->findById($userId)?->inGroup('admin') ?? false;
   }
   ```

4. Kemas kini `Config\Services::bookingService()` — connection dikongsi untuk kedua-dua service:

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

   Semak dengan [`Routes-tlk.php.txt`](../templates/kod/Routes-tlk.php.txt).

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

7. `app/Views/tlk/decision/index.php` — jadual tempahan dengan filter status; untuk setiap baris `pending`: borang **Lulus** (POST, `data-confirm`) dan butang **Tolak** yang membuka baris `collapse` mengandungi input `remarks` (min 10 aksara) + butang *Sahkan Tolak*. Untuk admin, baris `approved` ada borang **Batal** → `tlk.cancel`. Tulis sendiri; rujuk pola dari `tlk/booking/index.php`. Petua bagi baris tolak:

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

8. `BookingController` — kemas kini `show()` (pelulus/admin boleh lihat; hantar sejarah) dan tambah `cancel()`:

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

9. `app/Views/tlk/booking/show.php` — tambah lajur kanan **Sejarah Status** dan butang Batal bersyarat:

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

   (tambah `use App\Enums\BookingStatus;` di atas view)

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

2. `tests/tlk/BookingServiceTest.php` — mula dengan rangka + pembantu (salin), kemudian tulis ujian **satu demi satu**, jalankan selepas setiap satu:

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

3. Tulis ujian ini (nama sebagai panduan; README §3.3 memberi contoh dua daripadanya):

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

   Untuk ujian admin: `auth()->getProvider()->findById($adminId)->addGroup('admin');`

   ```bash
   composer test -- --no-coverage --testdox tests/tlk/BookingServiceTest.php
   ```

4. `tests/tlk/DecisionAccessTest.php` — ujian fungsian HTTP (salin, kemudian **terangkan setiap ujian kepada pasangan**):

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
- Bandingkan dengan [`BookingServiceTest.php.txt`](../templates/kod/BookingServiceTest.php.txt).

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

1. **Badge status** — dalam `tlk/booking/index.php`, `tlk/booking/show.php`, `tlk/decision/index.php` gantikan teks status dengan:

   ```php
   <span class="badge text-bg-<?= esc($b->statusBadge(), 'attr') ?>"><?= esc($b->statusLabel()) ?></span>
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

3. **Layout** — kemas kini `app/Views/layouts/main.php` mengikut [`layout-main.php.txt`](../templates/kod/layout-main.php.txt): menu *Tempahan Saya*, *Mohon Slot* (`can('tlk.apply')`), *Slot Kosong*, *Keputusan TLK* (`can('tlk.decide')`), *Urus Slot* (`inGroup('admin')`), dan skrip `data-confirm` sebelum `</body>` (README §4.1).

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

5. **Pautan** — no. rujukan dalam `tlk/decision/index.php` menjadi pautan ke `url_to('tlk.show', $b->id)`; borang tempahan ada pautan *"Semak slot kosong dahulu"* ke `tlk.availability`.

6. **Senarai semak aksesibiliti ringkas:** setiap `<input>` ada `<label for>`; butang ikon ada teks; warna badge bukan satu-satunya petunjuk (label teks sentiasa ada).

7. **Demo M1 (5 minit setiap pasangan)** — skrip:

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
