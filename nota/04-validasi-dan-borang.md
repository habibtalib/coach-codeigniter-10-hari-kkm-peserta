# 04 · Validasi dan Borang

> Nota topikal (rujukan merentas hari) · Kanun: [`SPEC-KURSUS.md`](../SPEC-KURSUS.md) · Indeks: [`README.md`](./README.md)

## Objektif nota

- **Menerangkan** kenapa validasi mesti berlaku di pelayan walaupun borang sudah ada semakan JavaScript/HTML5.
- **Menulis** peraturan validasi terbina CI4 dan **membina** peraturan tersuai untuk BR-TLK-03 (tempoh ≤ 90 hari, tarikh tidak di masa lalu).
- **Membina** borang Bootstrap yang memaparkan semula input lama (`old()`) dan mesej ralat setiap medan.
- **Menerangkan** cara CSRF melindungi borang dan cara menghantar token melalui `fetch()`.

---

## 1. Kenapa validasi pelayan wajib?

Semakan di pelayar (`required`, `type="date"`, JavaScript) hanya **kemudahan pengguna**. Sesiapa boleh:

- membuka DevTools dan membuang atribut `required`;
- menghantar request terus dengan `curl` atau Postman;
- mengubah nilai `<select>` kepada `slot_id=9999`.

Pelayan ialah **satu-satunya tempat yang anda kawal**. DoD (KOLABORASI §2) menyatakan: *"Validasi di pelayan (Model rules / Validation) — bukan JavaScript sahaja."*

### Dua tempat validasi — bila guna yang mana?

| Tempat | Sesuai untuk | Contoh |
|--------|--------------|--------|
| **Controller** (`$this->validateData()`) | Peraturan khusus **borang/tindakan** ini | Borang tempahan: tarikh tidak lampau, ≤ 90 hari |
| **Model** (`$validationRules`) | Integriti data yang **sentiasa** benar tanpa mengira dari mana data datang | `reason` min 10 aksara, `status` dalam senarai sah |
| **Service** | Peraturan yang perlu **query/keadaan** DB | Tiada pertindihan (BR-TLK-01), 1 tempahan aktif (BR-TLK-04) |

---

## 2. Aliran borang: GET papar → POST simpan → redirect

```mermaid
flowchart LR
    A[GET /tlk/tempahan/baru] --> B[Papar borang kosong]
    B --> C[POST /tlk/tempahan]
    C --> D{validateData lulus?}
    D -- Tidak --> E["redirect()->back()->withInput()"]
    E --> B2[Borang dipapar semula<br/>old() + ralat medan]
    D -- Ya --> F[BookingService::apply]
    F --> G["redirect()->to(show)->with('success', …)"]
```

Corak **Post/Redirect/Get** memastikan menekan *Refresh* selepas berjaya tidak menghantar borang dua kali.

---

## 3. Controller — validasi dengan `validateData()`

```php
<?php
// app/Controllers/Tlk/BookingController.php (petikan)

namespace App\Controllers\Tlk;

use App\Controllers\BaseController;
use App\Enums\SlotCategory;
use CodeIgniter\HTTP\RedirectResponse;
use DomainException;

class BookingController extends BaseController
{
    public function new(): string
    {
        helper('form');   // old(), set_select(), form_open()

        return view('tlk/new', [
            'title'      => 'Mohon Tempat Letak Kenderaan Khas',
            'categories' => SlotCategory::cases(),
            // … senarai kenderaan milik pengguna, zon …
        ]);
    }

    public function create(): RedirectResponse
    {
        // 1. Ambil HANYA medan yang dijangka (elak mass assignment)
        $data = $this->request->getPost(['vehicle_id', 'slot_id', 'start_date', 'end_date', 'reason']);

        // 2. Peraturan borang ini
        $rules = [
            'vehicle_id' => ['label' => 'Kenderaan', 'rules' => 'required|is_natural_no_zero'],
            'slot_id'    => ['label' => 'Slot',      'rules' => 'required|is_not_unique[parking_slots.id]'],
            'start_date' => [
                'label'  => 'Tarikh mula',
                'rules'  => 'required|valid_date[Y-m-d]|not_in_past',
                'errors' => ['not_in_past' => '{field} tidak boleh di masa lalu.'],
            ],
            'end_date' => [
                'label' => 'Tarikh tamat',
                'rules' => 'required|valid_date[Y-m-d]|booking_range[start_date,90]',
            ],
            'reason' => ['label' => 'Sebab', 'rules' => 'required|min_length[10]|max_length[1000]'],
        ];

        if (! $this->validateData($data, $rules)) {
            // withInput() membawa input lama DAN ralat validasi ke request seterusnya
            return redirect()->back()->withInput();
        }

        // 3. Data yang telah lulus validasi sahaja
        $valid = $this->validator->getValidated();

        try {
            // Logik perniagaan dalam service (pendaftaran service: lihat nota 05)
            $booking = service('bookingService')->create(auth()->id(), $valid);
        } catch (DomainException $e) {
            // Peraturan perniagaan (pertindihan, had 1 aktif) — mesej mesra pengguna
            return redirect()->back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->to('tlk/tempahan/' . $booking->id)
            ->with('success', "Permohonan {$booking->ref_no} berjaya dihantar.");
    }
}
```

Peraturan terbina yang kerap digunakan dalam projek:

| Peraturan | Guna | Contoh medan |
|-----------|------|--------------|
| `required`, `permit_empty` | Wajib / boleh kosong | `reason` / `phone` |
| `min_length[n]`, `max_length[n]` | Panjang teks | `remarks` min 10 (BR-PAS-03) |
| `valid_date[Y-m-d]` | Format tarikh tepat | `start_date`, `valid_from` |
| `in_list[a,b,c]` | Nilai daripada senarai | `pass_type` = `kenderaan,kakitangan,kontraktor` |
| `is_not_unique[table.field]` | Rujukan **mesti wujud** | `slot_id`, `vehicle_id` |
| `is_unique[table.field,id,{id}]` | Mesti unik (abaikan rekod sendiri semasa kemas kini) | `vehicles.plate_no` |
| `regex_match[/…/]` | Format khas | plat `WXX 1234` |
| `uploaded`, `max_size`, `ext_in`, `mime_in` | Fail | lihat [nota 07](./07-muat-naik-fail-selamat.md) |

> **Tip:** jana senarai `in_list` daripada enum supaya tidak berulang: `'in_list[' . implode(',', \App\Enums\PassType::values()) . ']'` (tambah `values()` pada enum seperti dalam [nota 03](./03-model-entity-dan-enum.md)).

---

## 4. Peraturan tersuai — BR-TLK-03

Tiada peraturan terbina untuk "tarikh tamat ≥ tarikh mula dan tempoh ≤ 90 hari". Kita tulis kelas peraturan sendiri:

```php
<?php
// app/Validation/TlkRules.php

namespace App\Validation;

class TlkRules
{
    /** Tarikh (Y-m-d) mesti hari ini atau kemudian. Penggunaan: not_in_past */
    public function not_in_past($value, ?string &$error = null): bool
    {
        if (! is_string($value) || $value === '') {
            return false;
        }

        return $value >= date('Y-m-d');   // perbandingan string selamat untuk format Y-m-d
    }

    /**
     * end_date >= medan mula DAN tempoh ≤ maksimum hari.
     * Penggunaan: booking_range[start_date,90]
     */
    public function booking_range($value, string $params, array $data, ?string &$error = null): bool
    {
        [$startField, $maxDays] = array_map('trim', explode(',', $params));
        $start = $data[$startField] ?? null;

        if (! is_string($value) || ! is_string($start) || $start === '') {
            return false;   // format sudah disemak oleh valid_date
        }

        $startDate = \DateTimeImmutable::createFromFormat('!Y-m-d', $start);
        $endDate   = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);

        if ($startDate === false || $endDate === false) {
            return false;
        }

        if ($endDate < $startDate) {
            $error = 'Tarikh tamat mesti sama atau selepas tarikh mula.';
            return false;
        }

        $days = $startDate->diff($endDate)->days + 1;   // inklusif
        if ($days > (int) $maxDays) {
            $error = "Tempoh tempahan maksimum {$maxDays} hari (anda memohon {$days} hari).";
            return false;
        }

        return true;
    }
}
```

Daftar kelas dalam `app/Config/Validation.php`:

```php
public array $ruleSets = [
    \CodeIgniter\Validation\StrictRules\CreditCardRules::class,
    \CodeIgniter\Validation\StrictRules\FileRules::class,
    \CodeIgniter\Validation\StrictRules\FormatRules::class,
    \CodeIgniter\Validation\StrictRules\Rules::class,
    \App\Validation\TlkRules::class,   // ← tambah
];
```

**Kenapa `?string &$error`?** Parameter rujukan membolehkan satu peraturan memulangkan **mesej berbeza** bergantung pada sebab kegagalan (terbalik vs terlalu panjang). Tanpanya, pengguna hanya melihat mesej generik.

---

## 5. View — `old()` dan ralat setiap medan

```php
<!-- app/Views/tlk/new.php -->
<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<h1 class="h4"><?= esc($title) ?></h1>

<?php if (session('error')): ?>
    <div class="alert alert-danger"><?= esc(session('error')) ?></div>
<?php endif ?>

<?= form_open('tlk/tempahan', ['novalidate' => true]) ?>  <!-- form_open() menambah csrf_field() automatik -->

    <div class="mb-3">
        <label for="start_date" class="form-label">Tarikh mula</label>
        <input type="date" id="start_date" name="start_date"
               class="form-control <?= validation_show_error('start_date') ? 'is-invalid' : '' ?>"
               value="<?= esc(old('start_date')) ?>">
        <div class="invalid-feedback"><?= validation_show_error('start_date') ?></div>
    </div>

    <div class="mb-3">
        <label for="end_date" class="form-label">Tarikh tamat</label>
        <input type="date" id="end_date" name="end_date"
               class="form-control <?= validation_show_error('end_date') ? 'is-invalid' : '' ?>"
               value="<?= esc(old('end_date')) ?>">
        <div class="invalid-feedback"><?= validation_show_error('end_date') ?></div>
    </div>

    <div class="mb-3">
        <label for="reason" class="form-label">Sebab permohonan</label>
        <textarea id="reason" name="reason" rows="3"
                  class="form-control <?= validation_show_error('reason') ? 'is-invalid' : '' ?>"
        ><?= esc(old('reason')) ?></textarea>
        <div class="invalid-feedback"><?= validation_show_error('reason') ?></div>
    </div>

    <button type="submit" class="btn btn-primary"><i class="bi bi-send"></i> Hantar</button>
<?= form_close() ?>

<?= $this->endSection() ?>
```

- **`old('field')`** — nilai yang pengguna taip sebelum redirect. Pengguna tidak perlu menaip semula semuanya kerana satu medan salah. Sentiasa bungkus dengan `esc()`.
- **`validation_show_error('field')`** — mesej ralat satu medan (sudah dilepaskan dalam templat lalai). Pulang string kosong jika tiada ralat, jadi sesuai untuk menambah kelas `is-invalid`.
- **`validation_list_errors()`** — senarai semua ralat di atas borang (berguna untuk borang panjang).
- `novalidate` mematikan pop-up HTML5 supaya jurulatih boleh menunjukkan validasi **pelayan** berfungsi.
- Untuk `<select>`: `<option value="<?= $v->id ?>" <?= set_select('vehicle_id', (string) $v->id) ?>>`.

---

## 6. CSRF — kenapa borang perlukan token

**Cross-Site Request Forgery**: laman jahat membuat pelayar pengguna yang sudah log masuk menghantar POST ke sistem kita — cth meluluskan permohonan pas — menggunakan cookie sesi mangsa. Token CSRF ialah nilai rawak yang hanya ada dalam halaman **kita**; laman lain tidak boleh membacanya, jadi request palsu ditolak.

```php
// app/Config/Filters.php
public array $globals = [
    'before' => ['csrf'],   // semua POST/PUT/PATCH/DELETE disemak
    'after'  => ['toolbar'],
];
```

Dalam borang:

```php
<form method="post" action="<?= site_url('pas/semakan/' . $app->id . '/lulus') ?>">
    <?= csrf_field() ?>   <!-- <input type="hidden" name="csrf_test_name" value="…"> -->
    …
</form>
```

Untuk `fetch()` (cth butang AJAX):

```html
<meta name="<?= csrf_header() ?>" content="<?= csrf_hash() ?>">
<script>
const meta = document.querySelector('meta[name="<?= csrf_header() ?>"]');
fetch('<?= site_url('tlk/tempahan/5/batal') ?>', {
    method: 'POST',
    headers: { [meta.name]: meta.content, 'X-Requested-With': 'XMLHttpRequest' },
});
</script>
```

Jika token tidak sepadan, CI4 melontar `SecurityException` — "The action you requested is not allowed." (403). Dalam `production`, lalainya pengguna di-redirect kembali dengan mesej ralat.

---

## ⚠️ Kesilapan lazim

| Kesilapan | Akibat | Betulkan |
|-----------|--------|----------|
| Hanya validasi JavaScript/HTML5 | Dipintas dengan DevTools/curl | `validateData()` / Model rules di pelayan |
| `return view(...)` selepas gagal validasi (bukan redirect) | Refresh = hantar semula; URL salah | `redirect()->back()->withInput()` |
| Lupa `withInput()` | `old()` dan ralat medan kosong | Tambah `->withInput()` |
| Lupa `helper('form')` | `Call to undefined function old()` / `form_open()` | `helper('form')` dalam controller atau `$helpers` di `BaseController` |
| Guna `$this->request->getPost()` terus selepas validasi | Medan tambahan tidak disemak ikut masuk | `$this->validator->getValidated()` |
| Peraturan tersuai tidak didaftarkan dalam `$ruleSets` | `InvalidArgumentException: … is not a valid rule` | Tambah kelas ke `Config\Validation::$ruleSets` |
| `old()` dipapar tanpa `esc()` | XSS tersimpan dalam borang | `esc(old('reason'))` |
| Buang `csrf` dari `$globals` kerana "ralat 403" | Semua borang terdedah CSRF | Tambah `csrf_field()` pada borang yang tertinggal |

## Rujukan rasmi

- [Validation](https://codeigniter.com/user_guide/libraries/validation.html)
- [Validation — Creating Custom Rules](https://codeigniter.com/user_guide/libraries/validation.html#creating-custom-rules)
- [Form Helper](https://codeigniter.com/user_guide/helpers/form_helper.html)
- [Security (CSRF)](https://codeigniter.com/user_guide/libraries/security.html)
- [OWASP — Cross-Site Request Forgery](https://owasp.org/www-community/attacks/csrf)

## Bacaan buku — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), edisi 2021 (CodeIgniter 4.1). `hlm.` = nombor halaman yang tercetak di kaki halaman buku.

- `esc()` semasa memaparkan data — hlm. 32–33
- `$this->validate()` dalam controller & ujian ralat validasi — hlm. 62–63
- Borang & input (*The Form*) — hlm. 68–70
- Validasi semasa mencipta rekod API — hlm. 86–88

Buku guna `validate()`; kursus ini guna `validateData()` (CI 4.2+) supaya data yang disemak jelas.

---
**Digunakan pada Hari 5** — S3 (borang tempahan TLK + validasi pelayan + peraturan tersuai BR-TLK-03); **Hari 7** — S3 (borang permohonan Pas + validasi fail). Nota berkaitan: [03 · Model](./03-model-entity-dan-enum.md) · [07 · Muat naik fail](./07-muat-naik-fail-selamat.md) · [11 · Keselamatan](./11-keselamatan-aplikasi-web.md)
