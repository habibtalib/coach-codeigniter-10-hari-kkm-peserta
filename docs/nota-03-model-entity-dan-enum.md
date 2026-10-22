# 03 · Model, Entity dan Enum

Nota topikal (rujukan merentas hari) · Kanun: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Indeks: [`README.md`](./nota.md)

## Objektif nota

- **Menulis** Model CI4 yang lengkap: `$allowedFields`, `$validationRules`, timestamps, soft delete dan callback.
- **Membina** Entity `SlotBooking` / `PassApplication` sebagai `$returnType` dan menerangkan kelebihannya berbanding array.
- **Menulis** backed enum PHP 8.1+ (`BookingStatus`, `PassStatus`) dengan `label()`, `badge()` dan `canTransitionTo()`.
- **Menerangkan** kenapa enum menjadi satu-satunya sumber nilai status dalam projek.

---

## 1. Tiga peranan, tiga kelas

| Kelas | Menjawab soalan | Contoh |
|-------|-----------------|--------|
| **Model** | *Bagaimana saya baca/simpan data jadual ini?* | `SlotBookingModel` |
| **Entity** | *Apakah satu rekod ini dan apa yang ia tahu tentang dirinya?* | `SlotBooking` |
| **Enum** | *Apakah nilai sah bagi medan ini dan apa maknanya?* | `BookingStatus` |

Kenapa pisah? Jika status `'pending'` ditaip sebagai string di 15 tempat, satu salah ejaan (`'pendng'`) tidak akan dikesan sehingga pengguna melaporkan pepijat. Dengan enum, salah ejaan ialah **ralat PHP** serta-merta.

---

## 2. Backed enum — satu sumber kebenaran status

```php
<?php
// app/Enums/BookingStatus.php

namespace App\Enums;

enum BookingStatus: string   // "backed" — setiap case ada nilai string yang disimpan dalam DB
{
    case Pending   = 'pending';
    case Approved  = 'approved';
    case Rejected  = 'rejected';
    case Cancelled = 'cancelled';
    case Expired   = 'expired';

    /** Label BM untuk paparan (SPEC §2.1) */
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

    /** Status yang "memegang" slot — digunakan oleh semakan pertindihan BR-TLK-01/04 */
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
            default        => [],                  // rejected/cancelled/expired = status akhir
        }, true);
    }

    /** Nilai mentah untuk in_list[] validasi & whereIn() */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
```

`PassStatus` mengikut corak sama. Peralihan BR-PAS-01:

```php
<?php
// app/Enums/PassStatus.php (petikan)

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

    // label(), badge() — seperti BookingStatus:
    // Dihantar, Dalam Semakan, Diluluskan, Ditolak, Tamat Tempoh
}
```

Operasi berguna:

```php
BookingStatus::from('approved');       // BookingStatus::Approved — nilai tak sah → ValueError
BookingStatus::tryFrom('xyz');         // null — sesuai untuk input pengguna
BookingStatus::Approved->value;        // 'approved' — untuk simpan ke DB
BookingStatus::Pending->label();       // 'Menunggu'
```

**Kenapa `match` dan bukan `switch`?** `match` mesti meliputi semua kes — jika anda tambah `case` baharu dan lupa kemas kini `label()`, PHP melontar `UnhandledMatchError` semasa ujian, bukan diam-diam memaparkan kosong.

`SlotCategory` (`oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`) dan `PassType` (`kenderaan`, `kakitangan`, `kontraktor`) ditulis dengan cara yang sama (hanya `label()`).

---

## 3. Entity — rekod yang "pandai"

```php
<?php
// app/Entities/SlotBooking.php

namespace App\Entities;

use App\Enums\BookingStatus;
use CodeIgniter\Entity\Entity;

class SlotBooking extends Entity
{
    // Medan tarikh ditukar kepada objek CodeIgniter\I18n\Time secara automatik
    protected $dates = ['decided_at', 'created_at', 'updated_at'];

    protected $casts = [
        'id'         => 'integer',
        'user_id'    => 'integer',
        'vehicle_id' => 'integer',
        'slot_id'    => 'integer',
        'decided_by' => '?integer',   // "?" = boleh null
    ];

    /** Status sebagai enum (serasi CI 4.6) */
    public function statusEnum(): BookingStatus
    {
        return BookingStatus::from($this->attributes['status']);
    }

    /** Bilangan hari tempahan (inklusif) — untuk paparan & BR-TLK-03 */
    public function durationDays(): int
    {
        $start = new \DateTimeImmutable($this->attributes['start_date']);
        $end   = new \DateTimeImmutable($this->attributes['end_date']);

        return $start->diff($end)->days + 1;
    }

    public function isOwnedBy(int $userId): bool
    {
        return $this->user_id === $userId;   // $casts memastikan kedua-dua int
    }
}
```

**Kenapa Entity dan bukan array?**

- Logik kecil yang **tentang rekod itu sendiri** (`isOwnedBy`, `durationDays`, `statusEnum`) duduk di satu tempat — view dan service memanggilnya, tidak mengulang.
- Jenis data konsisten (`$casts`) — `user_id` sentiasa `int`, jadi `===` berfungsi.
- `$entity->hasChanged('status')` membolehkan Model menyimpan medan yang berubah sahaja.

---

## 4. Model — pintu data jadual

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
    protected $returnType     = SlotBooking::class;   // find()/findAll() pulang Entity
    protected $useSoftDeletes = false;                // SPEC: soft delete hanya parking_slots

    // Senarai putih medan yang boleh diisi melalui insert()/update()/save()
    protected $allowedFields = [
        'ref_no', 'user_id', 'vehicle_id', 'slot_id',
        'start_date', 'end_date', 'reason',
        'status', 'decided_by', 'decided_at',
    ];

    protected $useTimestamps = true;                  // isi created_at/updated_at automatik
    protected $dateFormat    = 'datetime';

    protected $validationRules = [
        'user_id'    => 'required|is_natural_no_zero',
        'vehicle_id' => 'required|is_not_unique[vehicles.id]',     // mesti wujud
        'slot_id'    => 'required|is_not_unique[parking_slots.id]',
        'start_date' => 'required|valid_date[Y-m-d]',
        'end_date'   => 'required|valid_date[Y-m-d]',
        'reason'     => 'required|min_length[10]|max_length[1000]',
        'status'     => 'required|in_list[pending,approved,rejected,cancelled,expired]',
    ];

    protected $validationMessages = [
        'reason' => ['min_length' => 'Sebab tempahan mesti sekurang-kurangnya 10 aksara.'],
    ];

    // Callback — dijalankan sebelum insert
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['setDefaultStatus'];

    protected function setDefaultStatus(array $data): array
    {
        // $data['data'] = medan yang akan di-insert
        $data['data']['status'] ??= BookingStatus::Pending->value;

        return $data;   // WAJIB pulangkan $data
    }

    /** Skop kegunaan semula: tempahan aktif seorang pemohon (BR-TLK-04) */
    public function activeForUser(int $userId): static
    {
        return $this->where('user_id', $userId)
                    ->whereIn('status', [BookingStatus::Pending->value, BookingStatus::Approved->value]);
    }
}
```

### Kenapa `$allowedFields` sangat penting

Tanpa senarai putih, penyerang boleh menambah medan tersembunyi pada borang:

```html
<input type="hidden" name="status" value="approved">
```

Jika controller melakukan `$model->insert($this->request->getPost())`, tempahan akan terus diluluskan (*mass assignment*). Dua lapis pertahanan:

1. **Controller** hanya ambil medan yang dijangka: `$this->request->getPost(['vehicle_id', 'slot_id', 'start_date', 'end_date', 'reason'])`.
2. **Service** menetapkan medan sensitif sendiri (`user_id = auth()->id()`, `status = pending`, `ref_no` dijana) — bukan dari input.

`$allowedFields` masih perlu mengandungi `status` kerana service yang sah perlu mengemaskininya. Itulah sebab pertahanan utama di lapis 1 dan 2.

### Soft delete (`parking_slots`)

```php
class ParkingSlotModel extends Model
{
    protected $table          = 'parking_slots';
    protected $useSoftDeletes = true;          // delete() isi deleted_at, bukan DELETE sebenar
    protected $deletedField   = 'deleted_at';
    protected $allowedFields  = ['zone_id', 'slot_no', 'category', 'is_active'];
    protected $useTimestamps  = true;
}

$model->delete(5);                 // UPDATE parking_slots SET deleted_at = NOW() WHERE id = 5
$model->findAll();                 // automatik tambah WHERE deleted_at IS NULL
$model->withDeleted()->find(5);    // termasuk yang dipadam
$model->onlyDeleted()->findAll();  // untuk skrin "pulihkan"
```

**Kenapa soft delete untuk slot?** Tempahan lama (`slot_bookings.slot_id`) masih merujuk slot itu. Memadam betul-betul akan sama ada gagal (FK `RESTRICT`) atau memusnahkan sejarah laporan.

### Guna Model dalam kod

```php
$model   = model(SlotBookingModel::class);
$booking = $model->find(12);                       // ?SlotBooking
$pending = $model->where('status', 'pending')->findAll();

if (! $model->insert($data)) {                     // validationRules dijalankan automatik
    $errors = $model->errors();                    // ['reason' => 'Sebab tempahan mesti…']
}
$id = $model->getInsertID();
```

---

## 5. Entity + enum dalam view

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

Menyembunyikan butang ialah **kemudahan UI** sahaja — `BookingService::cancel()` tetap menyemak pemilikan dan `canTransitionTo()`.

---

## ⚠️ Kesilapan lazim

| Kesilapan | Akibat | Betulkan |
|-----------|--------|----------|
| Medan baharu tidak ditambah ke `$allowedFields` | `insert()` berjaya tetapi medan kosong/NULL (senyap!) | Tambah medan; semak dengan `seeInDatabase` dalam ujian |
| `$model->insert($this->request->getPost())` | Mass assignment (`status=approved`) | Ambil medan tertentu; service tetapkan medan sensitif |
| Callback tidak `return $data` | Insert gagal / data hilang | Sentiasa pulangkan `$data` |
| Bandingkan string status (`== 'Approved'`) | Salah huruf besar/kecil, pepijat senyap | Guna enum: `statusEnum() === BookingStatus::Approved` |
| `BookingStatus::from($input)` pada input pengguna | `ValueError` → ralat 500 | `tryFrom()` + semak `null`, atau validasi `in_list` dahulu |
| Lupa `$returnType` | Dapat array; `$b->statusEnum()` ralat | Set `$returnType = SlotBooking::class` |
| `$useSoftDeletes = true` tetapi tiada lajur `deleted_at` | Ralat SQL "Unknown column" | Tambah lajur dalam migration |

## Rujukan rasmi

- [Using CodeIgniter's Model](https://codeigniter.com/user_guide/models/model.html)
- [Using Entity Classes](https://codeigniter.com/user_guide/models/entities.html)
- [PHP Manual — Enumerations](https://www.php.net/manual/en/language.enumerations.php)
- [PHP Manual — Backed enumerations](https://www.php.net/manual/en/language.enumerations.backed.php)
- [PHP Manual — `match`](https://www.php.net/manual/en/control-structures.match.php)

## Bacaan buku — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), edisi 2021 (CodeIgniter 4.1). `hlm.` = nombor halaman yang tercetak di kaki halaman buku.

- Model asas (`$allowedFields`, `$returnType`) — hlm. 30–31
- `PostModel` dan Entity — hlm. 38–40
- Entity kepada data API (*Representing a Resource*) — hlm. 84–85
- Model dengan `$useTimestamps` — hlm. 98–99

Backed enum (PHP 8.1) tiada dalam buku; ikut nota ini.

---
**Digunakan pada Hari 5** — S1 (Model + Entity + enum TLK); **Hari 7** — S1 (Model/Entity `PassApplication` & `PassDocument`, enum `PassStatus`/`PassType`). Nota berkaitan: [02 · Migration](./nota-02-migration-seeder-dan-query-builder.md) · [04 · Validasi](./nota-04-validasi-dan-borang.md) · [05 · Service](./nota-05-service-layer-dan-transaksi.md)
