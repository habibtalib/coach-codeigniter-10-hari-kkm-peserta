# 03 · Models, Entities and Enums

Topic notes (reference across days) · Canon: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Index: [`README.md`](./nota.md)

## Objectives of these notes

- **Write** a complete CI4 Model: `$allowedFields`, `$validationRules`, timestamps, soft delete and callbacks.
- **Build** the `SlotBooking` / `PassApplication` Entities as the `$returnType` and explain their advantages over arrays.
- **Write** PHP 8.1+ backed enums (`BookingStatus`, `PassStatus`) with `label()`, `badge()` and `canTransitionTo()`.
- **Explain** why the enum is the only source of status values in the project.

---

## 1. Three roles, three classes

| Class | Answers the question | Example |
|-------|-----------------|--------|
| **Model** | *How do I read/save the data in this table?* | `SlotBookingModel` |
| **Entity** | *What is this one record and what does it know about itself?* | `SlotBooking` |
| **Enum** | *What are the valid values for this field and what do they mean?* | `BookingStatus` |

Why separate them? If the status `'pending'` is typed as a string in 15 places, one typo (`'pendng'`) will not be caught until a user reports a bug. With an enum, a typo is an immediate **PHP error**.

---

## 2. Backed enum — the single source of truth for status

```php
<?php
// app/Enums/BookingStatus.php

namespace App\Enums;

enum BookingStatus: string   // "backed" — each case has a string value that is stored in the DB
{
    case Pending   = 'pending';
    case Approved  = 'approved';
    case Rejected  = 'rejected';
    case Cancelled = 'cancelled';
    case Expired   = 'expired';

    /** Malay label for display (SPEC §2.1) */
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

    /** Bootstrap 5.3 contextual colour — use as `text-bg-{badge}`. */
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

    /** Statuses that "hold" a slot — used by the BR-TLK-01/04 overlap check */
    public function isActive(): bool
    {
        return in_array($this, [self::Pending, self::Approved], true);
    }

    /** pending → approved|rejected ; approved → cancelled|expired */
    public function canTransitionTo(self $to): bool
    {
        return in_array($to, match ($this) {
            self::Pending  => [self::Approved, self::Rejected],
            self::Approved => [self::Cancelled, self::Expired],
            default        => [],                  // rejected/cancelled/expired = final statuses
        }, true);
    }

    /** Raw values for in_list[] validation & whereIn() */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
```

`PassStatus` follows the same pattern. The BR-PAS-01 transitions:

```php
<?php
// app/Enums/PassStatus.php (excerpt)

namespace App\Enums;

enum PassStatus: string
{
    case Submitted   = 'submitted';
    case UnderReview = 'under_review';
    case Approved    = 'approved';
    case Rejected    = 'rejected';
    case Expired     = 'expired';

    public function canTransitionTo(self $to): bool
    {
        return in_array($to, match ($this) {
            self::Submitted   => [self::UnderReview],
            self::UnderReview => [self::Approved, self::Rejected],
            self::Approved    => [self::Expired],
            default           => [],
        }, true);
    }

    // label(), badge() — as in BookingStatus:
    // Dihantar, Dalam Semakan, Diluluskan, Ditolak, Tamat Tempoh
}
```

Useful operations:

```php
BookingStatus::from('approved');       // BookingStatus::Approved — invalid value → ValueError
BookingStatus::tryFrom('xyz');         // null — suitable for user input
BookingStatus::Approved->value;        // 'approved' — to save to the DB
BookingStatus::Pending->label();       // 'Menunggu'
```

**Why `match` and not `switch`?** `match` must cover every case — if you add a new `case` and forget to update `label()`, PHP throws an `UnhandledMatchError` during testing, instead of silently displaying nothing.

`SlotCategory` (`oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`) and `PassType` (`kenderaan`, `kakitangan`, `kontraktor`) are written in the same way (only `label()`).

---

## 3. Entity — a "smart" record

```php
<?php
// app/Entities/SlotBooking.php

namespace App\Entities;

use App\Enums\BookingStatus;
use CodeIgniter\Entity\Entity;

class SlotBooking extends Entity
{
    // Date fields are converted to CodeIgniter\I18n\Time objects automatically
    protected $dates = ['decided_at', 'created_at', 'updated_at'];

    protected $casts = [
        'id'         => 'integer',
        'user_id'    => 'integer',
        'vehicle_id' => 'integer',
        'slot_id'    => 'integer',
        'decided_by' => '?integer',   // "?" = nullable
    ];

    /** Status as an enum (CI 4.6 compatible) */
    public function statusEnum(): BookingStatus
    {
        return BookingStatus::from($this->attributes['status']);
    }

    /** Number of booking days (inclusive) — for display & BR-TLK-03 */
    public function durationDays(): int
    {
        $start = new \DateTimeImmutable($this->attributes['start_date']);
        $end   = new \DateTimeImmutable($this->attributes['end_date']);

        return $start->diff($end)->days + 1;
    }

    public function isOwnedBy(int $userId): bool
    {
        return $this->user_id === $userId;   // $casts makes sure both are int
    }
}
```

**Why an Entity and not an array?**

- Small pieces of logic **about the record itself** (`isOwnedBy`, `durationDays`, `statusEnum`) live in one place — views and services call them instead of repeating them.
- Consistent data types (`$casts`) — `user_id` is always an `int`, so `===` works.
- `$entity->hasChanged('status')` lets the Model save only the fields that changed.

---

## 4. Model — the door to a table's data

```php
<?php
// app/Models/SlotBookingModel.php

namespace App\Models;

use App\Entities\SlotBooking;
use App\Enums\BookingStatus;
use CodeIgniter\Model;

class SlotBookingModel extends Model
{
    protected $table          = 'slot_bookings';
    protected $primaryKey     = 'id';
    protected $returnType     = SlotBooking::class;   // find()/findAll() return an Entity
    protected $useSoftDeletes = false;                // SPEC: soft delete only for parking_slots

    // Whitelist of fields that may be filled through insert()/update()/save()
    protected $allowedFields = [
        'ref_no', 'user_id', 'vehicle_id', 'slot_id',
        'start_date', 'end_date', 'reason',
        'status', 'decided_by', 'decided_at',
    ];

    protected $useTimestamps = true;                  // fill created_at/updated_at automatically
    protected $dateFormat    = 'datetime';

    protected $validationRules = [
        'user_id'    => 'required|is_natural_no_zero',
        'vehicle_id' => 'required|is_not_unique[vehicles.id]',     // must exist
        'slot_id'    => 'required|is_not_unique[parking_slots.id]',
        'start_date' => 'required|valid_date[Y-m-d]',
        'end_date'   => 'required|valid_date[Y-m-d]',
        'reason'     => 'required|min_length[10]|max_length[1000]',
        'status'     => 'required|in_list[pending,approved,rejected,cancelled,expired]',
    ];

    protected $validationMessages = [
        'reason' => ['min_length' => 'Sebab tempahan mesti sekurang-kurangnya 10 aksara.'],
    ];

    // Callback — runs before insert
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['setDefaultStatus'];

    protected function setDefaultStatus(array $data): array
    {
        // $data['data'] = the fields that will be inserted
        $data['data']['status'] ??= BookingStatus::Pending->value;

        return $data;   // you MUST return $data
    }

    /** Reusable scope: an applicant's active bookings (BR-TLK-04) */
    public function activeForUser(int $userId): static
    {
        return $this->where('user_id', $userId)
                    ->whereIn('status', [BookingStatus::Pending->value, BookingStatus::Approved->value]);
    }
}
```

### Why `$allowedFields` matters so much

Without a whitelist, an attacker can add a hidden field to the form:

```html
<input type="hidden" name="status" value="approved">
```

If the controller does `$model->insert($this->request->getPost())`, the booking is approved straight away (*mass assignment*). Two layers of defence:

1. The **controller** takes only the expected fields: `$this->request->getPost(['vehicle_id', 'slot_id', 'start_date', 'end_date', 'reason'])`.
2. The **service** sets the sensitive fields itself (`user_id = auth()->id()`, `status = pending`, `ref_no` generated) — not from input.

`$allowedFields` still has to contain `status` because the legitimate service needs to update it. That is why the main defence is in layers 1 and 2.

### Soft delete (`parking_slots`)

```php
class ParkingSlotModel extends Model
{
    protected $table          = 'parking_slots';
    protected $useSoftDeletes = true;          // delete() fills deleted_at, not a real DELETE
    protected $deletedField   = 'deleted_at';
    protected $allowedFields  = ['zone_id', 'slot_no', 'category', 'is_active'];
    protected $useTimestamps  = true;
}

$model->delete(5);                 // UPDATE parking_slots SET deleted_at = NOW() WHERE id = 5
$model->findAll();                 // automatically adds WHERE deleted_at IS NULL
$model->withDeleted()->find(5);    // includes deleted rows
$model->onlyDeleted()->findAll();  // for a "restore" screen
```

**Why soft delete for slots?** Old bookings (`slot_bookings.slot_id`) still refer to that slot. Really deleting it would either fail (FK `RESTRICT`) or destroy the report history.

### Using the Model in code

```php
$model   = model(SlotBookingModel::class);
$booking = $model->find(12);                       // ?SlotBooking
$pending = $model->where('status', 'pending')->findAll();

if (! $model->insert($data)) {                     // validationRules run automatically
    $errors = $model->errors();                    // ['reason' => 'Sebab tempahan mesti…']
}
$id = $model->getInsertID();
```

---

## 5. Entity + enum in a view

```php
<?php $status = $booking->statusEnum(); ?>
<span class="badge text-bg-<?= $status->badge() ?>"><?= esc($status->label()) ?></span>

<?php if ($status === \App\Enums\BookingStatus::Approved && $booking->isOwnedBy(auth()->id())): ?>
    <form method="post" action="<?= site_url('tlk/tempahan/' . $booking->id . '/batal') ?>">
        <?= csrf_field() ?>
        <button class="btn btn-outline-danger btn-sm">Batal</button>
    </form>
<?php endif ?>
```

Hiding the button is only a **UI convenience** — `BookingService::cancel()` still checks ownership and `canTransitionTo()`.

---

## ⚠️ Common mistakes

| Mistake | Consequence | Fix |
|-----------|--------|----------|
| New field not added to `$allowedFields` | `insert()` succeeds but the field is empty/NULL (silently!) | Add the field; check with `seeInDatabase` in a test |
| `$model->insert($this->request->getPost())` | Mass assignment (`status=approved`) | Take specific fields; the service sets sensitive fields |
| Callback does not `return $data` | Insert fails / data is lost | Always return `$data` |
| Comparing status strings (`== 'Approved'`) | Wrong upper/lower case, silent bug | Use the enum: `statusEnum() === BookingStatus::Approved` |
| `BookingStatus::from($input)` on user input | `ValueError` → error 500 | `tryFrom()` + check for `null`, or validate with `in_list` first |
| Forgetting `$returnType` | You get an array; `$b->statusEnum()` errors | Set `$returnType = SlotBooking::class` |
| `$useSoftDeletes = true` but no `deleted_at` column | SQL error "Unknown column" | Add the column in a migration |

## Official references

- [Using CodeIgniter's Model](https://codeigniter.com/user_guide/models/model.html)
- [Using Entity Classes](https://codeigniter.com/user_guide/models/entities.html)
- [PHP Manual — Enumerations](https://www.php.net/manual/en/language.enumerations.php)
- [PHP Manual — Backed enumerations](https://www.php.net/manual/en/language.enumerations.backed.php)
- [PHP Manual — `match`](https://www.php.net/manual/en/control-structures.match.php)

## Book reading — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), 2021 edition (CodeIgniter 4.1). `p.` = the page number printed at the foot of the book page.

- Basic model (`$allowedFields`, `$returnType`) — p. 30–31
- `PostModel` and Entity — p. 38–40
- Entity to API data (*Representing a Resource*) — p. 84–85
- Model with `$useTimestamps` — p. 98–99

Backed enums (PHP 8.1) are not in the book; follow this note.

---
**Used on Day 5** — S1 (TLK Model + Entity + enum); **Day 7** — S1 (`PassApplication` & `PassDocument` Model/Entity, `PassStatus`/`PassType` enums). Related notes: [02 · Migration](./nota-02-migration-seeder-dan-query-builder.md) · [04 · Validation](./nota-04-validasi-dan-borang.md) · [05 · Service](./nota-05-service-layer-dan-transaksi.md)
