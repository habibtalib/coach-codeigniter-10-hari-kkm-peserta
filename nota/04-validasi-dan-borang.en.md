# 04 · Validation and Forms

> Topical notes (reference across days) · Canon: [`SPEC-KURSUS.md`](../SPEC-KURSUS.md) · Index: [`README.md`](./README.md)

## Notes objectives

- **Explain** why validation must happen on the server even when the form already has JavaScript/HTML5 checks.
- **Write** CI4 built-in validation rules and **build** custom rules for BR-TLK-03 (period ≤ 90 days, date not in the past).
- **Build** a Bootstrap form that redisplays old input (`old()`) and the error message for each field.
- **Explain** how CSRF protects forms and how to send the token through `fetch()`.

---

## 1. Why is server validation mandatory?

Checks in the browser (`required`, `type="date"`, JavaScript) are only a **convenience for the user**. Anyone can:

- open DevTools and remove the `required` attribute;
- send a request directly with `curl` or Postman;
- change a `<select>` value to `slot_id=9999`.

The server is **the only place you control**. The DoD (KOLABORASI §2) states: *"Validation on the server (Model rules / Validation) — not JavaScript only."*

### Two places for validation — when to use which?

| Place | Suitable for | Example |
|-------|--------------|---------|
| **Controller** (`$this->validateData()`) | Rules specific to **this form/action** | Booking form: date not in the past, ≤ 90 days |
| **Model** (`$validationRules`) | Data integrity that is **always** true no matter where the data comes from | `reason` min 10 characters, `status` in the valid list |
| **Service** | Rules that need a DB **query/state** | No overlap (BR-TLK-01), 1 active booking (BR-TLK-04) |

---

## 2. Form flow: GET display → POST save → redirect

```mermaid
flowchart LR
    A[GET /tlk/tempahan/baru] --> B[Display empty form]
    B --> C[POST /tlk/tempahan]
    C --> D{validateData passes?}
    D -- No --> E["redirect()->back()->withInput()"]
    E --> B2[Form displayed again<br/>old() + field errors]
    D -- Yes --> F[BookingService::apply]
    F --> G["redirect()->to(show)->with('success', …)"]
```

The **Post/Redirect/Get** pattern makes sure that pressing *Refresh* after a successful submit does not send the form twice.

---

## 3. Controller — validation with `validateData()`

```php
<?php
// app/Controllers/Tlk/BookingController.php (excerpt)

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
            // … list of the user's vehicles, zones …
        ]);
    }

    public function create(): RedirectResponse
    {
        // 1. Take ONLY the expected fields (avoid mass assignment)
        $data = $this->request->getPost(['vehicle_id', 'slot_id', 'start_date', 'end_date', 'reason']);

        // 2. Rules for this form
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
            // withInput() carries the old input AND the validation errors to the next request
            return redirect()->back()->withInput();
        }

        // 3. Only data that passed validation
        $valid = $this->validator->getValidated();

        try {
            // Business logic in the service (service registration: see notes 05)
            $booking = service('bookingService')->create(auth()->id(), $valid);
        } catch (DomainException $e) {
            // Business rule (overlap, limit of 1 active) — user-friendly message
            return redirect()->back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->to('tlk/tempahan/' . $booking->id)
            ->with('success', "Permohonan {$booking->ref_no} berjaya dihantar.");
    }
}
```

Built-in rules used often in the project:

| Rule | Use | Example field |
|------|-----|---------------|
| `required`, `permit_empty` | Required / may be empty | `reason` / `phone` |
| `min_length[n]`, `max_length[n]` | Text length | `remarks` min 10 (BR-PAS-03) |
| `valid_date[Y-m-d]` | Exact date format | `start_date`, `valid_from` |
| `in_list[a,b,c]` | Value from a list | `pass_type` = `kenderaan,kakitangan,kontraktor` |
| `is_not_unique[table.field]` | Reference **must exist** | `slot_id`, `vehicle_id` |
| `is_unique[table.field,id,{id}]` | Must be unique (ignore its own record on update) | `vehicles.plate_no` |
| `regex_match[/…/]` | Special format | plate `WXX 1234` |
| `uploaded`, `max_size`, `ext_in`, `mime_in` | Files | see [notes 07](./07-muat-naik-fail-selamat.md) |

> **Tip:** generate the `in_list` list from the enum so it is not repeated: `'in_list[' . implode(',', \App\Enums\PassType::values()) . ']'` (add `values()` to the enum as in [notes 03](./03-model-entity-dan-enum.md)).

---

## 4. Custom rules — BR-TLK-03

There is no built-in rule for "end date ≥ start date and period ≤ 90 days". We write our own rule class:

```php
<?php
// app/Validation/TlkRules.php

namespace App\Validation;

class TlkRules
{
    /** Date (Y-m-d) must be today or later. Usage: not_in_past */
    public function not_in_past($value, ?string &$error = null): bool
    {
        if (! is_string($value) || $value === '') {
            return false;
        }

        return $value >= date('Y-m-d');   // string comparison is safe for the Y-m-d format
    }

    /**
     * end_date >= start field AND period ≤ maximum days.
     * Usage: booking_range[start_date,90]
     */
    public function booking_range($value, string $params, array $data, ?string &$error = null): bool
    {
        [$startField, $maxDays] = array_map('trim', explode(',', $params));
        $start = $data[$startField] ?? null;

        if (! is_string($value) || ! is_string($start) || $start === '') {
            return false;   // format already checked by valid_date
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

        $days = $startDate->diff($endDate)->days + 1;   // inclusive
        if ($days > (int) $maxDays) {
            $error = "Tempoh tempahan maksimum {$maxDays} hari (anda memohon {$days} hari).";
            return false;
        }

        return true;
    }
}
```

Register the class in `app/Config/Validation.php`:

```php
public array $ruleSets = [
    \CodeIgniter\Validation\StrictRules\CreditCardRules::class,
    \CodeIgniter\Validation\StrictRules\FileRules::class,
    \CodeIgniter\Validation\StrictRules\FormatRules::class,
    \CodeIgniter\Validation\StrictRules\Rules::class,
    \App\Validation\TlkRules::class,   // ← add
];
```

**Why `?string &$error`?** The reference parameter lets one rule return a **different message** depending on why it failed (reversed vs too long). Without it, the user only sees a generic message.

---

## 5. View — `old()` and errors for each field

```php
<!-- app/Views/tlk/new.php -->
<?= $this->extend('layouts/main') ?>
<?= $this->section('content') ?>

<h1 class="h4"><?= esc($title) ?></h1>

<?php if (session('error')): ?>
    <div class="alert alert-danger"><?= esc(session('error')) ?></div>
<?php endif ?>

<?= form_open('tlk/tempahan', ['novalidate' => true]) ?>  <!-- form_open() adds csrf_field() automatically -->

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

- **`old('field')`** — the value the user typed before the redirect. The user does not have to retype everything because one field is wrong. Always wrap it in `esc()`.
- **`validation_show_error('field')`** — the error message for one field (already escaped in the default template). Returns an empty string if there is no error, so it suits adding the `is-invalid` class.
- **`validation_list_errors()`** — a list of all errors above the form (useful for long forms).
- `novalidate` turns off the HTML5 pop-ups so the trainer can show that **server** validation works.
- For `<select>`: `<option value="<?= $v->id ?>" <?= set_select('vehicle_id', (string) $v->id) ?>>`.

---

## 6. CSRF — why forms need a token

**Cross-Site Request Forgery**: a malicious site makes the browser of a logged-in user send a POST to our system — e.g. approving a pass application — using the victim's session cookie. A CSRF token is a random value that only exists in **our** page; other sites cannot read it, so the forged request is rejected.

```php
// app/Config/Filters.php
public array $globals = [
    'before' => ['csrf'],   // every POST/PUT/PATCH/DELETE is checked
    'after'  => ['toolbar'],
];
```

In the form:

```php
<form method="post" action="<?= site_url('pas/semakan/' . $app->id . '/lulus') ?>">
    <?= csrf_field() ?>   <!-- <input type="hidden" name="csrf_test_name" value="…"> -->
    …
</form>
```

For `fetch()` (e.g. an AJAX button):

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

If the token does not match, CI4 throws `SecurityException` — "The action you requested is not allowed." (403). In `production`, by default the user is redirected back with an error message.

---

## ⚠️ Common mistakes

| Mistake | Result | Fix |
|---------|--------|-----|
| Only JavaScript/HTML5 validation | Bypassed with DevTools/curl | `validateData()` / Model rules on the server |
| `return view(...)` after validation fails (not a redirect) | Refresh = submit again; wrong URL | `redirect()->back()->withInput()` |
| Forgetting `withInput()` | `old()` and field errors are empty | Add `->withInput()` |
| Forgetting `helper('form')` | `Call to undefined function old()` / `form_open()` | `helper('form')` in the controller or `$helpers` in `BaseController` |
| Using `$this->request->getPost()` directly after validation | Extra unchecked fields come along | `$this->validator->getValidated()` |
| Custom rule not registered in `$ruleSets` | `InvalidArgumentException: … is not a valid rule` | Add the class to `Config\Validation::$ruleSets` |
| `old()` displayed without `esc()` | Stored XSS in the form | `esc(old('reason'))` |
| Removing `csrf` from `$globals` because of a "403 error" | Every form is exposed to CSRF | Add `csrf_field()` to the forms that were missed |

## Official references

- [Validation](https://codeigniter.com/user_guide/libraries/validation.html)
- [Validation — Creating Custom Rules](https://codeigniter.com/user_guide/libraries/validation.html#creating-custom-rules)
- [Form Helper](https://codeigniter.com/user_guide/helpers/form_helper.html)
- [Security (CSRF)](https://codeigniter.com/user_guide/libraries/security.html)
- [OWASP — Cross-Site Request Forgery](https://owasp.org/www-community/attacks/csrf)

## Book reading — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), 2021 edition (CodeIgniter 4.1). `p.` = the page number printed at the foot of the book page.

- `esc()` when displaying data — p. 32–33
- `$this->validate()` in a controller & a validation-error test — p. 62–63
- Forms & input (*The Form*) — p. 68–70
- Validation when creating an API record — p. 86–88

The book uses `validate()`; this course uses `validateData()` (CI 4.2+) so the checked data is explicit.

---
**Used on Day 5** — S3 (TLK (Special Vehicle Parking) booking form + server validation + custom rule BR-TLK-03); **Day 7** — S3 (Pass application form + file validation). Related notes: [03 · Model](./03-model-entity-dan-enum.md) · [07 · File upload](./07-muat-naik-fail-selamat.md) · [11 · Security](./11-keselamatan-aplikasi-web.md)
