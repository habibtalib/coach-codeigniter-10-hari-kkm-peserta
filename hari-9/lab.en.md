# Lab Day 9 — Report Module (M3)

[← Day 9 README](./README.md) · [SPEC canon](../docs/spesifikasi-sistem.md) · [Schedule](../JADUAL.md) · [⚡ spark commands](../docs/arahan-spark.md)

> **Working branch:** `git switch main && git pull && git switch -c feat/laporan`; PowerShell: run `git switch main`, `git pull` and `git switch -c` one at a time
> **Commit prefix:** `RPT:` · Every step gives **complete code to copy**. Read every line before you run it — you must be able to explain it (KOLABORASI §3). Stuck: read the full error message, ask the trainer or your neighbour, or use AI to *explain* the error.

| Lab | Session | Time | Outcome |
|-----|---------|------|---------|
| 9.1 | S1 | 09:00–10:00 | Spec cards RPT-01..03 · routes · skeleton controller · GET filter form |
| 9.1b | S5 | 10:00–10:30 | Quick periods (This month/Last month/This year) · active filter chips |
| 9.2 | S2 | 10:45–12:00 | Full `ReportService` · paginated table for 3 reports |
| 9.2b | S6 | 12:00–12:30 | `statusSummary()` (subquery + `groupBy`) · status summary buttons · RPT-03 JUMLAH row |
| 9.3 | S3 | 14:30–15:30 | `ExportService` · working PDF & Excel export buttons |
| 9.3b | S7 | 15:30–16:00 | Excel *Ringkasan* sheet (`=SUM()`) · PDF summary table |
| 9.4 | S4 | 16:00–16:35 | `ReportServiceTest` green · EXPLAIN · **M3 done** |
| 9.4b | S8 | 16:35–17:00 | 5 summary/JUMLAH/Excel tests · 2 mutations · push to the MR |

---

## Lab 9.1 — Report design & GET filter form (S1)

### 🎯 Objective
- Write spec cards for RPT-01, RPT-02, RPT-03.
- Build the `/laporan/*` routes protected by `permission:laporan.view`.
- Build a `GET` filter form that keeps its values after it is submitted.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- M1 & M2 done and merged; `php spark migrate:status` all *Yes*.
- Synthetic data exists: `php spark db:seed DatabaseSeeder`; the report demo data is prepared in **step 0**.
- You can log in as `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test`, `pemohon1@latihan.test` (password `Latihan@2026`).

### Steps

**0. Prepare the demo data (10 min).** The reports and the charts (Day 10) need data across months and statuses. Copy `DemoDataSeeder.php.txt` (**Templat & Rujukan** module) to `app/Database/Seeds/DemoDataSeeder.php` (copy it as is — this is data, not a writing exercise), then add its call at the end of `DatabaseSeeder::run()`:

```php
$this->call(DemoDataSeeder::class);     // Days 9–10: demo data for Reports/Statistics (≥ 20 bookings, ≥ 15 passes)
```

```bash
php spark db:seed DemoDataSeeder
```

This seeder is **skipped** if `slot_bookings` or `pass_applications` already has rows (your lab data). For clean demo data (22 bookings, 18 Pass applications, 12 months), reset the development DB — this **deletes all data** in `kkm_latihan`:

```bash
php spark migrate:refresh --all
php spark db:seed DatabaseSeeder
```

**1. Write the spec cards (15 min).** Copy this table into `docs/laporan-spec.md` in your project repo and fill in every cell. Look at README §1.2 **after** you have tried it yourself.

```markdown
| | RPT-01 | RPT-02 | RPT-03 |
|---|---|---|---|
| Business question answered | | | |
| Main reader | | | |
| Columns (in order) | | | |
| Filters + input type | | | |
| Meaning of the date range | | | |
| Default sort order | | | |
| Who can view it (permission) | | | |
```

**2. Add the routes.** Open `app/Config/Routes.php` and add the report group (see `Routes-laporan-statistik.php.txt` (**Templat & Rujukan** module)):

```php
$routes->group('laporan', [
    'namespace' => 'App\Controllers\Laporan',
    'filter'    => 'permission:laporan.view',
], static function ($routes) {
    $routes->get('tempahan', 'ReportController::bookings', ['as' => 'laporan.tempahan']);
    $routes->get('pas', 'ReportController::passes', ['as' => 'laporan.pas']);
    $routes->get('penggunaan', 'ReportController::usage', ['as' => 'laporan.penggunaan']);
});
```

```bash tab="Git Bash / macOS / Linux"
php spark routes | grep laporan
```

```powershell tab="PowerShell"
php spark routes | Select-String laporan
```

**3. Create a skeleton controller.**

```bash
php spark make:controller Laporan/ReportController
```

Replace the generated file's contents with the skeleton below. For now `bookings()`, `passes()` and `usage()` only show the filter form: raw GET values and dropdown options, no report data. The full controller is built in Lab 9.2.

`app/Controllers/Laporan/ReportController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Laporan;

use App\Controllers\BaseController;
use App\Enums\BookingStatus;
use App\Enums\PassStatus;
use App\Enums\PassType;
use App\Enums\SlotCategory;
use App\Models\DepartmentModel;
use App\Models\ParkingZoneModel;

/**
 * RANGKA Lab 9.1 — borang penapis sahaja, tiada data laporan.
 * Lab 9.2 langkah 8 menggantikan seluruh fail ini dengan versi yang memanggil ReportService.
 */
class ReportController extends BaseController
{
    /** GET /laporan/tempahan — RPT-01 */
    public function bookings(): string
    {
        return $this->skeleton('tempahan', 'RPT-01 Senarai Tempahan TLK');
    }

    /** GET /laporan/pas — RPT-02 */
    public function passes(): string
    {
        return $this->skeleton('pas', 'RPT-02 Senarai Permohonan Pas');
    }

    /** GET /laporan/penggunaan — RPT-03 */
    public function usage(): string
    {
        return $this->skeleton('penggunaan', 'RPT-03 Penggunaan Slot Mengikut Zon');
    }

    private function skeleton(string $report, string $title): string
    {
        // SEMENTARA: nilai GET mentah (view tetap guna esc()). Lab 9.2: normaliseFilters() membuat whitelist.
        $get     = $this->request->getGet() ?? [];
        $filters = [];

        foreach (['from', 'to', 'zone_id', 'category', 'department_id', 'pass_type', 'status', 'year', 'month', 'sort', 'dir'] as $key) {
            $filters[$key] = is_string($get[$key] ?? null) ? $get[$key] : null;
        }
        $filters['year'] ??= date('Y');

        // Pilihan dropdown dari enum ::cases() + ->label() — bukan senarai ditaip tangan.
        $enumOptions = static fn (array $cases): array => array_map(
            static fn ($c): array => ['value' => $c->value, 'label' => $c->label()],
            $cases,
        );

        return view('laporan/index', [
            'title'   => $title,
            'report'  => $report,
            'filters' => $filters,
            'options' => [
                'zones' => array_map(
                    static fn (array $z): array => ['value' => (int) $z['id'], 'label' => $z['code'] . ' — ' . $z['name']],
                    model(ParkingZoneModel::class)->orderBy('code')->findAll(),
                ),
                'departments' => array_map(
                    static fn (array $d): array => ['value' => (int) $d['id'], 'label' => $d['code'] . ' — ' . $d['name']],
                    model(DepartmentModel::class)->orderBy('name')->findAll(),
                ),
                'categories' => $enumOptions(SlotCategory::cases()),
                'pass_types' => $enumOptions(PassType::cases()),
                'statuses'   => $report === 'pas' ? $enumOptions(PassStatus::cases()) : $enumOptions(BookingStatus::cases()),
            ],
        ]);
    }
}
```

**4. Build the filter form view** `app/Views/laporan/index.php`. Must-haves:

- `<form method="get" action="<?= current_url() ?>">` — **no** `csrf_field()` (GET).
- Every input is refilled from `$filters`:
  ```php
  <input type="date" name="from" class="form-control" value="<?= esc((string) $filters['from'], 'attr') ?>">
  <option value="<?= esc($o['value'], 'attr') ?>" <?= (string) $filters['status'] === (string) $o['value'] ? 'selected' : '' ?>>
      <?= esc($o['label']) ?>
  </option>
  ```
- The status/category/pass type dropdowns are built from the enum's `::cases()` and `->label()` — **not** from a hand-typed list.
- The **Reset** button = a link to `current_url()` without the query string.

Full code. The last comment line before `endSection()` is where the Lab 9.2 table goes:

`app/Views/laporan/index.php`

```php
<?php

/**
 * app/Views/laporan/index.php — Hari 9
 * Satu view untuk RPT-01/02/03. Lab 9.1: borang penapis GET. Lab 9.2: jadual berpagination + butang eksport.
 *
 * @var string                          $title    dipapar sebagai <h1> oleh layouts/main.php
 * @var string                          $report   tempahan|pas|penggunaan
 * @var array<string, int|string|null>  $filters  nilai penapis semasa
 * @var array<string, list<array>>      $options  pilihan dropdown {value, label}
 */

// Pembantu kecil untuk <select>: tanda pilihan yang sedang aktif.
$selected = static fn ($current, $value): string => (string) $current === (string) $value ? 'selected' : '';
?>
<?= $this->extend('layouts/main') ?>

<?php // Tajuk <h1> & mesej flash (cth ralat had eksport) dipapar oleh layouts/main.php daripada $title & partials/flash. ?>
<?= $this->section('content') ?>
<div class="mb-3">
    <!-- Tab laporan -->
    <ul class="nav nav-pills">
        <?php foreach (['tempahan' => 'RPT-01 Tempahan', 'pas' => 'RPT-02 Pas', 'penggunaan' => 'RPT-03 Penggunaan'] as $key => $label): ?>
            <li class="nav-item">
                <a class="nav-link <?= $key === $report ? 'active' : '' ?>" href="<?= site_url('laporan/' . $key) ?>"><?= esc($label) ?></a>
            </li>
        <?php endforeach ?>
    </ul>
</div>

<!-- ============ BORANG PENAPIS (GET) ============
     method="get": URL boleh ditanda buku/dikongsi; tiada CSRF diperlukan (GET tidak ubah data).
     Nilai diisi semula dari $filters (bukan old()) kerana tiada redirect berlaku. -->
<form method="get" action="<?= current_url() ?>" class="card card-body mb-3">
    <div class="row g-2 align-items-end">

        <?php if ($report === 'penggunaan'): ?>
            <div class="col-sm-3 col-md-2">
                <label for="year" class="form-label">Tahun</label>
                <input type="number" id="year" name="year" class="form-control" min="2020" max="2100"
                       value="<?= esc((string) $filters['year'], 'attr') ?>">
            </div>
            <div class="col-sm-3 col-md-2">
                <label for="month" class="form-label">Bulan</label>
                <select id="month" name="month" class="form-select">
                    <option value="">Setahun</option>
                    <?php foreach (['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'] as $i => $m): ?>
                        <option value="<?= $i + 1 ?>" <?= $selected($filters['month'], $i + 1) ?>><?= esc($m) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php else: ?>
            <div class="col-sm-6 col-md-2">
                <label for="from" class="form-label">Dari tarikh</label>
                <input type="date" id="from" name="from" class="form-control" value="<?= esc((string) $filters['from'], 'attr') ?>">
            </div>
            <div class="col-sm-6 col-md-2">
                <label for="to" class="form-label">Hingga tarikh</label>
                <input type="date" id="to" name="to" class="form-control" value="<?= esc((string) $filters['to'], 'attr') ?>">
            </div>
        <?php endif ?>

        <?php if ($report === 'tempahan'): ?>
            <div class="col-sm-4 col-md-2">
                <label for="zone_id" class="form-label">Zon</label>
                <select id="zone_id" name="zone_id" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['zones'] as $o): ?>
                        <option value="<?= esc((string) $o['value'], 'attr') ?>" <?= $selected($filters['zone_id'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
            <div class="col-sm-4 col-md-2">
                <label for="category" class="form-label">Kategori</label>
                <select id="category" name="category" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['categories'] as $o): ?>
                        <option value="<?= esc($o['value'], 'attr') ?>" <?= $selected($filters['category'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php endif ?>

        <?php if ($report === 'pas'): ?>
            <div class="col-sm-4 col-md-2">
                <label for="department_id" class="form-label">Jabatan</label>
                <select id="department_id" name="department_id" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['departments'] as $o): ?>
                        <option value="<?= esc((string) $o['value'], 'attr') ?>" <?= $selected($filters['department_id'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
            <div class="col-sm-4 col-md-2">
                <label for="pass_type" class="form-label">Jenis pas</label>
                <select id="pass_type" name="pass_type" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['pass_types'] as $o): ?>
                        <option value="<?= esc($o['value'], 'attr') ?>" <?= $selected($filters['pass_type'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php endif ?>

        <?php if ($report !== 'penggunaan'): ?>
            <div class="col-sm-4 col-md-2">
                <label for="status" class="form-label">Status</label>
                <select id="status" name="status" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['statuses'] as $o): ?>
                        <option value="<?= esc($o['value'], 'attr') ?>" <?= $selected($filters['status'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php endif ?>

        <!-- Kekalkan susunan semasa apabila penapis dihantar semula -->
        <input type="hidden" name="sort" value="<?= esc((string) $filters['sort'], 'attr') ?>">
        <input type="hidden" name="dir" value="<?= esc((string) $filters['dir'], 'attr') ?>">

        <div class="col-md-auto d-flex gap-2">
            <button type="submit" class="btn btn-primary"><i class="bi bi-funnel"></i> Tapis</button>
            <a href="<?= current_url() ?>" class="btn btn-outline-secondary">Set semula</a>
        </div>
    </div>
</form>

<?php // JADUAL & PAGINATION — Lab 9.2 langkah 9 menggantikan baris ini. ?>
<?= $this->endSection() ?>
```

**5. Add a menu link** in `app/Views/layouts/main.php` only if the user has the permission. Put it inside `<ul class="navbar-nav me-auto">`, just before its closing `</ul>`:

```php
<?php if (auth()->loggedIn() && auth()->user()->can('laporan.view')): ?>
    <li class="nav-item"><a class="nav-link" href="<?= url_to('laporan.tempahan') ?>">Laporan</a></li>
<?php endif ?>
```

> Hiding the menu is only a **UI convenience**. The real control is the route filter in step 2.

**6. Commit.** `git add -A && git commit -m "RPT: laluan, controller rangka & borang penapis GET"`; PowerShell: run `git add` and `git commit` one at a time

### ✅ Checkpoint 9.1
- [ ] `php spark routes | grep laporan` shows 3 routes with the `permission:laporan.view` filter (Quiz S1).
- [ ] Log in as `pemohon1@latihan.test` → `/laporan/tempahan` is **denied** (the Shield filter *redirects*, no data shown). As `penyemak@latihan.test` → allowed (Quiz S1).
- [ ] Choose a status + dates → click **Tapis** (Filter) → the URL contains `?from=...&status=...` and the dropdown **still** shows the choice you made (Quiz S1).
- [ ] Spec cards complete for the 3 reports and checked by the trainer (Quiz S1).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Class "App\Controllers\Laporan\ReportController" not found` | The namespace in the file does not match the folder | First line: `namespace App\Controllers\Laporan;` · file in `app/Controllers/Laporan/` |
| Every user (including admin) is denied | Permission misspelt, e.g. `laporan.views` | Check `app/Config/AuthGroups.php` → `$matrix` (SPEC §4) |
| The dropdown goes back to "Semua" (All) after filtering | No `selected` attribute / comparing an int with a string | Compare as strings: `(string) $a === (string) $b` |
| `The action you requested is not allowed` | The form has `method="post"` by mistake | Change it to `get` |

### ⭐ Bonus challenge
- Add the HTML5 `max` attribute to the `from` input (the current `to` value) and `min` to the `to` input (the current `from` value) so the browser blocks a reversed range. Discuss: why does Lab 9.2 `normaliseFilters()` still need to swap the range on the server?

---

## Lab 9.2 — `ReportService`: join, dynamic filters, aggregate, pagination (S2)

### 🎯 Objective
- Write `normaliseFilters()` with a whitelist for dates, enums, ids and sort order.
- Write the RPT-01/RPT-02 builders with `join()` + `when()`.
- Write the RPT-03 aggregate with `selectCount()` + `groupBy()`.
- Show a paginated table that keeps the filters.

### Prerequisites
- Lab 9.1 done.
- The enums `BookingStatus`, `PassStatus`, `PassType`, `SlotCategory` exist with `label()`.

### Steps

**1. Create the file** `app/Services/ReportService.php` with this skeleton:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\PassStatus;
use App\Enums\PassType;
use App\Enums\SlotCategory;
use CodeIgniter\Database\BaseBuilder;
use CodeIgniter\Database\BaseConnection;
use DateTimeImmutable;
use Generator;
use InvalidArgumentException;
use LengthException;

class ReportService
{
    public const REPORTS = ['tempahan', 'pas', 'penggunaan'];

    public const PER_PAGE = 20;

    private BaseConnection $db;

    public function __construct(?BaseConnection $db = null)
    {
        $this->db = $db ?? db_connect();
    }
}
```

Every method in steps 2–8 goes **inside this class, before the final `}`**, unless the step names another place.

**2. Write `normaliseFilters()` first** (whitelist before the query). Target behaviour:

| `$_GET` input | `$filters` result |
|---------------|-------------------|
| `from=2026-06-01` | `'from' => '2026-06-01'` |
| `from=2026-02-31` | `'from' => null` (date does not exist) |
| `from=2026-06-30&to=2026-06-01` | swapped: from 01/06, to 30/06 |
| `status=approved` | `'status' => 'approved'` |
| `status=bogus` | `'status' => null` |
| `status[]=approved` | `'status' => null` (array rejected) |
| `sort=b.id; DROP TABLE users` | `'sort' => 'start_date'` (default) |
| `dir=sideways` | `'dir' => 'desc'` (default) |

First add the sort whitelist, right after `public const PER_PAGE = 20;`:

`app/Services/ReportService.php`

```php
    /**
     * WHITELIST lajur susunan: kunci URL (?sort=) => lajur SQL sebenar.
     * Input pengguna TIDAK PERNAH dihantar terus ke orderBy().
     */
    private const SORTABLE = [
        'tempahan' => [
            'ref_no'     => 'b.ref_no',
            'zone'       => 'z.code',
            'start_date' => 'b.start_date',
            'end_date'   => 'b.end_date',
            'status'     => 'b.status',
        ],
        'pas' => [
            'ref_no'     => 'p.ref_no',
            'department' => 'd.name',
            'pass_type'  => 'p.pass_type',
            'status'     => 'p.status',
            'created_at' => 'p.created_at',
        ],
        // RPT-03 disusun dalam PHP (data aggregate kecil, satu baris per zon).
        'penggunaan' => [
            'zone_code'   => 'zone_code',
            'utilisation' => 'utilisation',
        ],
    ];

    private const DEFAULT_SORT = [
        'tempahan'   => ['start_date', 'desc'],
        'pas'        => ['created_at', 'desc'],
        'penggunaan' => ['zone_code', 'asc'],
    ];
```

Then add `normaliseFilters()`, `toQuery()` and their helpers `assertReport()`, `str()`, `validDate()`:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 1. Penapis: terima $_GET mentah → pulang array bersih (whitelist)
    // ------------------------------------------------------------------

    /**
     * Semua nilai dipulangkan sebagai skalar (string/int/null) supaya boleh
     * dibina semula ke query string untuk pagination & butang eksport.
     *
     * @param array<string, mixed> $input biasanya $this->request->getGet()
     *
     * @return array<string, int|string|null>
     */
    public function normaliseFilters(string $report, array $input): array
    {
        $this->assertReport($report);

        $f = [];

        if ($report === 'penggunaan') {
            $year  = (int) ($this->str($input, 'year') ?? date('Y'));
            $month = (int) ($this->str($input, 'month') ?? 0);

            $f['year']  = ($year >= 2020 && $year <= 2100) ? $year : (int) date('Y');
            $f['month'] = ($month >= 1 && $month <= 12) ? $month : null; // null = setahun
        } else {
            $f['from'] = $this->validDate($this->str($input, 'from'));
            $f['to']   = $this->validDate($this->str($input, 'to'));

            // Pengguna terbalikkan julat? Tukar semula, jangan pulang kosong secara senyap.
            if ($f['from'] !== null && $f['to'] !== null && $f['from'] > $f['to']) {
                [$f['from'], $f['to']] = [$f['to'], $f['from']];
            }
        }

        if ($report === 'tempahan') {
            $zoneId        = (int) ($this->str($input, 'zone_id') ?? 0);
            $f['zone_id']  = $zoneId > 0 ? $zoneId : null;
            $f['category'] = SlotCategory::tryFrom($this->str($input, 'category') ?? '')?->value;
            $f['status']   = BookingStatus::tryFrom($this->str($input, 'status') ?? '')?->value;
        }

        if ($report === 'pas') {
            $deptId             = (int) ($this->str($input, 'department_id') ?? 0);
            $f['department_id'] = $deptId > 0 ? $deptId : null;
            $f['pass_type']     = PassType::tryFrom($this->str($input, 'pass_type') ?? '')?->value;
            $f['status']        = PassStatus::tryFrom($this->str($input, 'status') ?? '')?->value;
        }

        // Susunan: hanya kunci dalam whitelist diterima.
        [$defaultSort, $defaultDir] = self::DEFAULT_SORT[$report];
        $sort     = $this->str($input, 'sort');
        $dir      = strtolower($this->str($input, 'dir') ?? '');
        $f['sort'] = array_key_exists((string) $sort, self::SORTABLE[$report]) ? $sort : $defaultSort;
        $f['dir']  = in_array($dir, ['asc', 'desc'], true) ? $dir : $defaultDir;

        return $f;
    }

    /**
     * Penapis bersih → query string (buang nilai kosong). Guna untuk pautan eksport/susun.
     *
     * @param array<string, int|string|null> $filters
     *
     * @return array<string, int|string>
     */
    public function toQuery(array $filters): array
    {
        return array_filter($filters, static fn ($v): bool => $v !== null && $v !== '');
    }

    // ------------------------------------------------------------------
    // Pembantu
    // ------------------------------------------------------------------

    private function assertReport(string $report): void
    {
        if (! in_array($report, self::REPORTS, true)) {
            throw new InvalidArgumentException("Laporan tidak dikenali: {$report}");
        }
    }

    /** Ambil nilai string yang dipangkas; tolak array (cth ?status[]=x) dan string kosong. */
    private function str(array $input, string $key): ?string
    {
        $v = $input[$key] ?? null;

        if (! is_string($v) && ! is_int($v)) {
            return null;
        }

        $v = trim((string) $v);

        return $v === '' ? null : $v;
    }

    /** Terima Y-m-d yang BENAR-BENAR sah sahaja (tolak 2026-02-31). */
    private function validDate(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $d = DateTimeImmutable::createFromFormat('!Y-m-d', $value);

        return ($d !== false && $d->format('Y-m-d') === $value) ? $value : null;
    }
```

Quick check: in the Lab 9.1 skeleton controller, **temporarily** replace the `bookings()` method with the version below. Open `/laporan/tempahan?…` in the browser with the inputs from the table above, then **restore** the original `bookings()` (without `dd()`) before you commit.

`app/Controllers/Laporan/ReportController.php`

```php
public function bookings(): string
{
    $filters = (new \App\Services\ReportService())->normaliseFilters('tempahan', $this->request->getGet() ?? []);
    dd($filters);   // SEMENTARA — buang baris ini dan baris di atas sebelum commit

    return $this->skeleton('tempahan', 'RPT-01 Senarai Tempahan TLK');
}
```

**3. Write `bookingsBuilder()` (RPT-01)** — 4 joins + 5 `when()`. Note that the date range uses the overlap condition of BR-TLK-01 (TLK = Special Vehicle Parking — *Tempat Letak Kenderaan Khas*):

`builder()` is the single SQL entry point for RPT-01/02 (Lab 9.4 runs `EXPLAIN` on it). Add:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 5. Builder — SATU tempat untuk join + penapis dinamik
    // ------------------------------------------------------------------

    /** Dibuat public supaya S4 boleh jalankan EXPLAIN pada SQL yang sama. */
    public function builder(string $report, array $f): BaseBuilder
    {
        return match ($report) {
            'tempahan' => $this->bookingsBuilder($f),
            'pas'      => $this->passesBuilder($f),
            default    => throw new InvalidArgumentException("Laporan {$report} tiada builder SQL."),
        };
    }

    /** RPT-01 — Senarai tempahan TLK */
    private function bookingsBuilder(array $f): BaseBuilder
    {
        return $this->db->table('slot_bookings b')
            ->select('b.id, b.ref_no, b.start_date, b.end_date, b.status, b.created_at')
            ->select('u.full_name, v.plate_no, s.slot_no, s.category, z.code AS zone_code, z.name AS zone_name')
            ->join('users u', 'u.id = b.user_id')
            ->join('vehicles v', 'v.id = b.vehicle_id')
            ->join('parking_slots s', 's.id = b.slot_id') // termasuk slot soft-deleted: sejarah kekal
            ->join('parking_zones z', 'z.id = s.zone_id')
            // Julat tarikh = tempahan yang AKTIF dalam julat (syarat bertindih BR-TLK-01):
            //   start_date <= :to AND end_date >= :from
            ->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where('b.start_date <=', $to))
            ->when($f['from'] ?? null, static fn (BaseBuilder $q, string $from) => $q->where('b.end_date >=', $from))
            ->when($f['zone_id'] ?? null, static fn (BaseBuilder $q, int $id) => $q->where('s.zone_id', $id))
            ->when($f['category'] ?? null, static fn (BaseBuilder $q, string $c) => $q->where('s.category', $c))
            ->when($f['status'] ?? null, static fn (BaseBuilder $q, string $s) => $q->where('b.status', $s));
    }
```

**4. Write `passesBuilder()` (RPT-02)** — `departments` must be a **LEFT** join; the `created_at` range is half-open:

Add:

`app/Services/ReportService.php`

```php
    /** RPT-02 — Senarai permohonan Pas */
    private function passesBuilder(array $f): BaseBuilder
    {
        return $this->db->table('pass_applications p')
            ->select('p.id, p.ref_no, p.pass_type, p.valid_from, p.valid_until, p.status, p.created_at, p.approved_at')
            ->select('u.full_name, u.staff_no, d.code AS dept_code, d.name AS dept_name')
            ->join('users u', 'u.id = p.user_id')
            ->join('departments d', 'd.id = u.department_id', 'left') // department_id boleh NULL
            // created_at ialah DATETIME → julat SEPARUH-TERBUKA [from 00:00, to+1 hari 00:00)
            // supaya rekod pada hari terakhir (cth 30/09 14:00) TIDAK tercicir.
            ->when($f['from'] ?? null, static fn (BaseBuilder $q, string $from) => $q->where('p.created_at >=', $from . ' 00:00:00'))
            ->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where(
                'p.created_at <',
                (new DateTimeImmutable($to))->modify('+1 day')->format('Y-m-d 00:00:00'),
            ))
            ->when($f['department_id'] ?? null, static fn (BaseBuilder $q, int $id) => $q->where('u.department_id', $id))
            ->when($f['pass_type'] ?? null, static fn (BaseBuilder $q, string $t) => $q->where('p.pass_type', $t))
            ->when($f['status'] ?? null, static fn (BaseBuilder $q, string $s) => $q->where('p.status', $s));
    }
```

**5. Write `applySort()` with a whitelist + `id` as the second sort key:**

The `SORTABLE` and `DEFAULT_SORT` whitelists were added in step 2. Add `applySort()`:

`app/Services/ReportService.php`

```php
    private function applySort(BaseBuilder $builder, string $report, array $f): BaseBuilder
    {
        $column = self::SORTABLE[$report][$f['sort']] ?? self::SORTABLE[$report][self::DEFAULT_SORT[$report][0]];
        $dir    = $f['dir'] === 'asc' ? 'ASC' : 'DESC';
        $idCol  = $report === 'tempahan' ? 'b.id' : 'p.id';

        // Susunan kedua (id) → susunan STABIL; tanpa ini rekod boleh "melompat" antara halaman.
        return $builder->orderBy($column, $dir)->orderBy($idCol, $dir);
    }
```

**6. Write `paginate()`:**

Add `paginate()`, `formatRow()` (enum values → Malay labels, dates → `d/m/Y`) and `dmy()`. The `penggunaan` branch calls `usageByZone()` from step 7.

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 3. Paparan HTML berpagination
    // ------------------------------------------------------------------

    /**
     * @param array<string, int|string|null> $filters hasil normaliseFilters()
     *
     * @return array{rows: list<array<string, mixed>>, total: int, page: int, perPage: int}
     */
    public function paginate(string $report, array $filters, int $page, int $perPage = self::PER_PAGE): array
    {
        $this->assertReport($report);
        $page = max(1, $page);

        if ($report === 'penggunaan') {
            // Aggregate kecil (satu baris per zon) — potong dalam PHP.
            $all = $this->usageByZone($filters);

            return [
                'rows'    => array_slice($all, ($page - 1) * $perPage, $perPage),
                'total'   => count($all),
                'page'    => $page,
                'perPage' => $perPage,
            ];
        }

        $builder = $this->builder($report, $filters);

        // countAllResults(false) = kira TANPA reset builder; join/where kekal untuk get().
        $total = $builder->countAllResults(false);

        $rows = $this->applySort($builder, $report, $filters)
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()
            ->getResultArray();

        return [
            'rows'    => array_map(fn (array $r): array => $this->formatRow($report, $r), $rows),
            'total'   => $total,
            'page'    => $page,
            'perPage' => $perPage,
        ];
    }

    // ------------------------------------------------------------------
    // 7. Format baris — label BM daripada enum, tarikh d/m/Y
    // ------------------------------------------------------------------

    /** @return array<string, mixed> kunci sepadan columns($report) */
    private function formatRow(string $report, array $r): array
    {
        return match ($report) {
            'tempahan' => [
                'ref_no'     => $r['ref_no'],
                'full_name'  => $r['full_name'],
                'plate_no'   => $r['plate_no'],
                'zone'       => $r['zone_code'],
                'slot_no'    => $r['slot_no'],
                'category'   => SlotCategory::tryFrom((string) $r['category'])?->label() ?? $r['category'],
                'start_date' => $this->dmy($r['start_date']),
                'end_date'   => $this->dmy($r['end_date']),
                'status'     => BookingStatus::tryFrom((string) $r['status'])?->label() ?? $r['status'],
            ],
            'pas' => [
                'ref_no'      => $r['ref_no'],
                'full_name'   => $r['full_name'],
                'staff_no'    => $r['staff_no'] ?? '-',
                'department'  => $r['dept_name'] ?? '-',
                'pass_type'   => PassType::tryFrom((string) $r['pass_type'])?->label() ?? $r['pass_type'],
                'valid_from'  => $this->dmy($r['valid_from']),
                'valid_until' => $this->dmy($r['valid_until']),
                'status'      => PassStatus::tryFrom((string) $r['status'])?->label() ?? $r['status'],
                'created_at'  => $this->dmy($r['created_at'], withTime: true),
            ],
            default => $r,
        };
    }

    private function dmy(?string $value, bool $withTime = false): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        return (new DateTimeImmutable($value))->format($withTime ? 'd/m/Y H:i' : 'd/m/Y');
    }
```

**7. Write `usageByZone()` (RPT-03)** — two aggregate queries + merge in PHP. Check the formula against the example in README §1.2 (Zone A June = 25.0 %). Add `usageByZone()` and `usagePeriod()`:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 6. RPT-03 — Penggunaan slot mengikut zon (aggregate)
    // ------------------------------------------------------------------

    /**
     * Penggunaan (%) = hari-slot ditempah ÷ (bil. slot aktif × bil. hari dalam tempoh) × 100
     *
     * @return list<array<string, int|float|string>>
     */
    public function usageByZone(array $f): array
    {
        [$start, $end] = $this->usagePeriod($f);
        $days          = (new DateTimeImmutable($start))->diff(new DateTimeImmutable($end))->days + 1;

        // (a) Bil. slot aktif setiap zon. LEFT JOIN → zon tanpa slot tetap muncul (0).
        //     escape=false kerana syarat ON mengandungi literal (1, IS NULL) — tiada input pengguna di sini.
        $zones = $this->db->table('parking_zones z')
            ->select('z.id, z.code, z.name')
            ->selectCount('s.id', 'total_slots')
            ->join('parking_slots s', 's.zone_id = z.id AND s.is_active = 1 AND s.deleted_at IS NULL', 'left', false)
            ->groupBy(['z.id', 'z.code', 'z.name'])
            ->get()
            ->getResultArray();

        // (b) Tempahan yang digunakan (approved/expired) & bertindih dengan tempoh.
        //     Hari bertindih = DATEDIFF(LEAST(end, :end), GREATEST(start, :start)) + 1
        //     $start/$end dijana oleh kita (bukan teks pengguna) DAN di-escape().
        $startQ = $this->db->escape($start);
        $endQ   = $this->db->escape($end);

        $usage = $this->db->table('slot_bookings b')
            ->select('s.zone_id')
            ->selectCount('b.id', 'total_bookings')
            ->select("SUM(DATEDIFF(LEAST(b.end_date, {$endQ}), GREATEST(b.start_date, {$startQ})) + 1) AS booked_days", false)
            // Sama dengan penyebut (a): hanya slot aktif & tidak dipadam → penggunaan tidak melebihi 100 %
            ->join('parking_slots s', 's.id = b.slot_id AND s.is_active = 1 AND s.deleted_at IS NULL', 'inner', false)
            ->whereIn('b.status', [BookingStatus::Approved->value, BookingStatus::Expired->value])
            ->where('b.start_date <=', $end)
            ->where('b.end_date >=', $start)
            ->groupBy('s.zone_id')
            ->get()
            ->getResultArray();

        $byZone = array_column($usage, null, 'zone_id');
        $rows   = [];

        foreach ($zones as $z) {
            $slots    = (int) $z['total_slots'];
            $booked   = (int) ($byZone[$z['id']]['booked_days'] ?? 0);
            $capacity = $slots * $days;

            $rows[] = [
                'zone_code'      => $z['code'],
                'zone_name'      => $z['name'],
                'total_slots'    => $slots,
                'total_bookings' => (int) ($byZone[$z['id']]['total_bookings'] ?? 0),
                'booked_days'    => $booked,
                'capacity_days'  => $capacity,
                'utilisation'    => $capacity > 0 ? round($booked / $capacity * 100, 1) : 0.0,
            ];
        }

        $key = $f['sort'] ?? 'zone_code';
        $dir = ($f['dir'] ?? 'asc') === 'desc' ? -1 : 1;
        usort($rows, static fn (array $a, array $b): int => ($a[$key] <=> $b[$key]) * $dir);

        return $rows;
    }

    /** @return array{0: string, 1: string} [Y-m-d mula, Y-m-d tamat] */
    public function usagePeriod(array $f): array
    {
        $year = (int) ($f['year'] ?? date('Y'));

        if (! empty($f['month'])) {
            $first = new DateTimeImmutable(sprintf('%04d-%02d-01', $year, (int) $f['month']));

            return [$first->format('Y-m-d'), $first->format('Y-m-t')];
        }

        return ["{$year}-01-01", "{$year}-12-31"];
    }
```

**8. Register the service & complete the controller** (thin!). The controller needs each report's title, columns and dropdown options. Add these metadata methods to `ReportService`:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 2. Metadata laporan: tajuk, lajur, pilihan dropdown
    // ------------------------------------------------------------------

    public function title(string $report): string
    {
        $this->assertReport($report);

        return match ($report) {
            'tempahan'   => 'RPT-01 Senarai Tempahan TLK',
            'pas'        => 'RPT-02 Senarai Permohonan Pas',
            'penggunaan' => 'RPT-03 Penggunaan Slot Mengikut Zon',
        };
    }

    /**
     * Lajur yang SAMA untuk HTML, PDF dan Excel. Kunci = kunci baris selepas formatRow().
     *
     * @return array<string, string>
     */
    public function columns(string $report): array
    {
        $this->assertReport($report);

        return match ($report) {
            'tempahan' => [
                'ref_no'     => 'No. Rujukan',
                'full_name'  => 'Pemohon',
                'plate_no'   => 'No. Plat',
                'zone'       => 'Zon',
                'slot_no'    => 'Slot',
                'category'   => 'Kategori',
                'start_date' => 'Tarikh Mula',
                'end_date'   => 'Tarikh Tamat',
                'status'     => 'Status',
            ],
            'pas' => [
                'ref_no'      => 'No. Rujukan',
                'full_name'   => 'Pemohon',
                'staff_no'    => 'No. Pekerja',
                'department'  => 'Jabatan',
                'pass_type'   => 'Jenis Pas',
                'valid_from'  => 'Sah Dari',
                'valid_until' => 'Sah Hingga',
                'status'      => 'Status',
                'created_at'  => 'Tarikh Mohon',
            ],
            'penggunaan' => [
                'zone_code'      => 'Kod Zon',
                'zone_name'      => 'Nama Zon',
                'total_slots'    => 'Bil. Slot Aktif',
                'total_bookings' => 'Bil. Tempahan',
                'booked_days'    => 'Hari-Slot Ditempah',
                'capacity_days'  => 'Kapasiti (Hari-Slot)',
                'utilisation'    => 'Penggunaan (%)',
            ],
        };
    }

    /** @return list<string> kunci lajur yang boleh disusun (untuk pautan pengepala jadual) */
    public function sortableColumns(string $report): array
    {
        $this->assertReport($report);

        return array_keys(self::SORTABLE[$report]);
    }

    /**
     * Pilihan dropdown borang penapis.
     *
     * @return array<string, list<array{value: int|string, label: string}>>
     */
    public function filterOptions(string $report): array
    {
        $this->assertReport($report);

        $enumOptions = static fn (array $cases): array => array_map(
            static fn ($c): array => ['value' => $c->value, 'label' => $c->label()],
            $cases,
        );

        return match ($report) {
            'tempahan' => [
                'zones' => array_map(
                    static fn (array $z): array => ['value' => (int) $z['id'], 'label' => $z['code'] . ' — ' . $z['name']],
                    $this->db->table('parking_zones')->select('id, code, name')->orderBy('code')->get()->getResultArray(),
                ),
                'categories' => $enumOptions(SlotCategory::cases()),
                'statuses'   => $enumOptions(BookingStatus::cases()),
            ],
            'pas' => [
                'departments' => array_map(
                    static fn (array $d): array => ['value' => (int) $d['id'], 'label' => $d['code'] . ' — ' . $d['name']],
                    $this->db->table('departments')->select('id, code, name')->orderBy('name')->get()->getResultArray(),
                ),
                'pass_types' => $enumOptions(PassType::cases()),
                'statuses'   => $enumOptions(PassStatus::cases()),
            ],
            'penggunaan' => [],
        };
    }
```

In `app/Config/Services.php`, inside the `Services` class (same pattern as `bookingService`, Day 6):

`app/Config/Services.php`

```php
public static function reportService(bool $getShared = true): \App\Services\ReportService
{
    if ($getShared) {
        return static::getSharedInstance('reportService');
    }

    return new \App\Services\ReportService();
}
```

Replace the **whole** Lab 9.1 skeleton controller with this thin controller: `$this->reports = service('reportService');` in `__construct()`, and one private method `handle($report)` for all three reports:

`app/Controllers/Laporan/ReportController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Laporan;

use App\Controllers\BaseController;
use App\Services\ReportService;
use CodeIgniter\HTTP\ResponseInterface;

class ReportController extends BaseController
{
    private ReportService $reports;

    public function __construct()
    {
        $this->reports = service('reportService');
    }

    /** GET /laporan/tempahan — RPT-01 */
    public function bookings(): string|ResponseInterface
    {
        return $this->handle('tempahan');
    }

    /** GET /laporan/pas — RPT-02 */
    public function passes(): string|ResponseInterface
    {
        return $this->handle('pas');
    }

    /** GET /laporan/penggunaan — RPT-03 */
    public function usage(): string|ResponseInterface
    {
        return $this->handle('penggunaan');
    }

    /** Satu aliran untuk ketiga-tiga laporan: penapis → HTML berpagination. (Eksport: Lab 9.3.) */
    private function handle(string $report): string|ResponseInterface
    {
        $filters = $this->reports->normaliseFilters($report, $this->request->getGet() ?? []);

        $page   = (int) ($this->request->getGet('page') ?? 1);
        $result = $this->reports->paginate($report, $filters, $page);

        return view('laporan/index', [
            'title'    => $this->reports->title($report),
            'report'   => $report,
            'filters'  => $filters,
            'query'    => $this->reports->toQuery($filters),
            'columns'  => $this->reports->columns($report),
            'sortable' => $this->reports->sortableColumns($report),
            'options'  => $this->reports->filterOptions($report),
            'result'   => $result,
            'pager'    => service('pager'),
        ]);
    }
}
```

**9. Table + pagination in the view:**

In `app/Views/laporan/index.php`, replace the line `<?php // JADUAL & PAGINATION — Lab 9.2 langkah 9 menggantikan baris ini. ?>` with this block (record count, export buttons built from `$query`, table with sortable headers, pager):

`app/Views/laporan/index.php`

```php
<!-- ============ RINGKASAN + EKSPORT ============
     Pautan eksport dibina dari $query (penapis BERSIH) + export=... → data eksport = data skrin. -->
<div class="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
    <div class="text-muted">
        Jumlah rekod: <strong><?= number_format($result['total']) ?></strong>
    </div>
    <div class="btn-group">
        <a class="btn btn-outline-danger btn-sm"
           href="<?= current_url() . '?' . esc(http_build_query($query + ['export' => 'pdf']), 'attr') ?>">
            <i class="bi bi-filetype-pdf"></i> Eksport PDF
        </a>
        <a class="btn btn-outline-success btn-sm"
           href="<?= current_url() . '?' . esc(http_build_query($query + ['export' => 'xlsx']), 'attr') ?>">
            <i class="bi bi-file-earmark-excel"></i> Eksport Excel
        </a>
    </div>
</div>

<!-- ============ JADUAL ============ -->
<div class="table-responsive">
    <table class="table table-sm table-striped table-hover align-middle">
        <thead class="table-light">
        <tr>
            <th scope="col">#</th>
            <?php foreach ($columns as $key => $label): ?>
                <th scope="col">
                    <?php if (in_array($key, $sortable, true)): ?>
                        <?php
                        // Klik lajur yang sama → terbalikkan arah; lajur lain → mula dengan asc
                        $isCurrent = $filters['sort'] === $key;
                        $nextDir   = $isCurrent && $filters['dir'] === 'asc' ? 'desc' : 'asc';
                        $href      = current_url() . '?' . http_build_query(['sort' => $key, 'dir' => $nextDir] + $query);
                        ?>
                        <a href="<?= esc($href, 'attr') ?>" class="link-dark text-decoration-none">
                            <?= esc($label) ?>
                            <?php if ($isCurrent): ?>
                                <i class="bi bi-caret-<?= $filters['dir'] === 'asc' ? 'up' : 'down' ?>-fill"></i>
                            <?php endif ?>
                        </a>
                    <?php else: ?>
                        <?= esc($label) ?>
                    <?php endif ?>
                </th>
            <?php endforeach ?>
        </tr>
        </thead>
        <tbody>
        <?php if ($result['rows'] === []): ?>
            <tr>
                <td colspan="<?= count($columns) + 1 ?>" class="text-center text-muted py-4">
                    Tiada rekod sepadan dengan penapis.
                </td>
            </tr>
        <?php endif ?>

        <?php foreach ($result['rows'] as $i => $row): ?>
            <tr>
                <td><?= ($result['page'] - 1) * $result['perPage'] + $i + 1 ?></td>
                <?php foreach (array_keys($columns) as $key): ?>
                    <td><?= esc((string) ($row[$key] ?? '')) ?></td>
                <?php endforeach ?>
            </tr>
        <?php endforeach ?>
        </tbody>
    </table>
</div>

<!-- Pager CI4 mengekalkan query string semasa ($_GET) secara automatik: ?status=approved&page=2 -->
<?= $pager->makeLinks($result['page'], $result['perPage'], $result['total']) ?>
```

**10. Commit.** `git add app/ && git commit -m "RPT: ReportService (join, when, groupBy, selectCount) + pagination"`; PowerShell: run `git add` and `git commit` one at a time

### ✅ Checkpoint 9.2
- [ ] `/laporan/tempahan?status=approved` → "Jumlah rekod" (total records) is **the same** as the SQL result (Quiz S2):
  ```sql
  SELECT COUNT(*) FROM slot_bookings WHERE status = 'approved';
  ```
- [ ] Filter by status + zone → click page 2 → the URL still contains `status=...&zone_id=...&page=2` (Quiz S2).
- [ ] `/laporan/pas?to=<hari ini>` (`<hari ini>` = today's date) shows the applications you submitted **today** (proof of the half-open range) (Quiz S2).
- [ ] `/laporan/tempahan?sort=nonsense` does not error — it falls back to the default sort order (Quiz S2).
- [ ] `/laporan/penggunaan?year=2026&month=6` shows every zone (including zones without bookings = 0.0 %) (Quiz S2).
- [ ] Thin controller: each method only reads filters → calls `ReportService` → view/export (no queries, joins or calculations); no `$this->db` in the controller (Quiz S2).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error 1055: Expression #2 of SELECT list is not in GROUP BY clause ... only_full_group_by` | A non-aggregate column is missing from `groupBy()` | `->groupBy(['z.id', 'z.code', 'z.name'])` |
| The RPT-02 total is lower than `COUNT(*)` | An INNER join to `departments` drops users without a department | `join('departments d', '...', 'left')` |
| A zone with no slots shows "1 slot aktif" (1 active slot) | `COUNT(*)` after a LEFT JOIN | `selectCount('s.id', 'total_slots')` |
| `Unknown column 'b.status' in 'where clause'` after `countAllResults()` | `countAllResults()` (without `false`) **resets** the builder | `countAllResults(false)` |
| `Table 'db_parking_slots' doesn't exist` | `DBPrefix` is set; a join with `escape=false` does not get the prefix | Make sure `database.default.DBPrefix =` is empty (as on Day 4) |
| The same record appears on page 1 and page 2 | Unstable sort order | Add `->orderBy('b.id', $dir)` |
| `TypeError: ... must be of type string, array given` | `?status[]=x` passed straight to `tryFrom()` | Use the `str()` helper, which rejects arrays |
| Pagination links without Bootstrap styling | CI4's `default_full` template has no `page-item` class | Accept it for now, or the ⭐ challenge below |

### ⭐ Bonus challenge
- Create a Bootstrap pager template `app/Views/pager/bootstrap.php` (copy `system/Pager/Views/default_full.php`, add `page-item`/`page-link`), register it in `app/Config/Pager.php` → `$templates['bootstrap']`, and use `makeLinks(..., 'bootstrap')`.
- Add an **Average days per booking** column (booked slot-days ÷ number of bookings) to RPT-03: update only `usageByZone()` and `columns('penggunaan')`. The screen table, PDF and Excel follow automatically — why?

---

## Lab 9.3 — PDF (Dompdf) & Excel (PhpSpreadsheet) export (S3)

### 🎯 Objective
- Install Dompdf & PhpSpreadsheet through Composer.
- Generate an A4 landscape PDF with a header, a footer "Dijana pada … oleh …" (Generated on … by …) and page numbers.
- Generate an `.xlsx` with a bold header, automatic widths and a frozen row.
- Prove that HTML, PDF and Excel show the same number of records.

### Prerequisites
- Lab 9.2 done; the export buttons in the view are already built from `$query`.
- PHP extensions: `ext-dom`, `ext-mbstring`, `ext-gd`, `ext-zip`, `ext-xml` (`php -m` to check).

### Steps

**1. Install the libraries.**

```bash tab="Git Bash / macOS / Linux"
composer require dompdf/dompdf phpoffice/phpspreadsheet
git add composer.json composer.lock && git commit -m "RPT: tambah dompdf & phpspreadsheet"
```

```powershell tab="PowerShell"
composer require dompdf/dompdf phpoffice/phpspreadsheet
git add composer.json composer.lock
git commit -m "RPT: tambah dompdf & phpspreadsheet"
```

**2. Create `app/Services/ExportService.php`** and register `exportService()` in `app/Config/Services.php` (same pattern as `reportService()`). Two public methods, `pdf()` and `xlsx()`:

`app/Services/ExportService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportService
{
    /**
     * @param array<string, string>            $columns
     * @param iterable<array<string, mixed>>   $rows
     * @param array{filters: string, user: string, generated_at: string} $meta
     */
    public function pdf(string $title, array $columns, iterable $rows, array $meta): string
    {
        // 1) HTML dijana oleh view biasa CI4 — esc() tetap digunakan di dalam view.
        $html = view('laporan/pdf', [
            'title'   => $title,
            'columns' => $columns,
            'rows'    => $rows,
            'meta'    => $meta,
        ]);

        // 2) Pilihan keselamatan & fon
        $options = new Options();
        $options->setDefaultFont('DejaVu Sans');       // fon Unicode terbina dalam Dompdf (UTF-8 selamat)
        $options->setIsRemoteEnabled(false);          // JANGAN muat URL luar (SSRF / lambat)
        $options->setIsPhpEnabled(false);             // jangan laksana <script type="text/php">
        $options->setTempDir(WRITEPATH . 'cache');    // folder boleh tulis
        $options->setChroot([FCPATH]);                // fail tempatan (cth logo) hanya dari public/

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'landscape');         // laporan berlajur banyak → landskap
        $dompdf->render();

        // 3) Nombor muka surat — hanya diketahui SELEPAS render(), jadi ditulis pada canvas.
        //    A4 landskap = 841.89 × 595.28 pt. Koordinat (x, y) dari bucu kiri atas.
        $canvas = $dompdf->getCanvas();
        $font   = $dompdf->getFontMetrics()->getFont('DejaVu Sans');
        $canvas->page_text(760, 572, 'Muka {PAGE_NUM} / {PAGE_COUNT}', $font, 8, [0.3, 0.3, 0.3]);

        return $dompdf->output();
    }

    /**
     * @param array<string, string>            $columns
     * @param iterable<array<string, mixed>>   $rows
     * @param array{filters: string, user: string, generated_at: string} $meta
     */
    public function xlsx(string $title, array $columns, iterable $rows, array $meta): string
    {
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getProperties()
            ->setCreator($meta['user'])
            ->setTitle($title);

        $sheet = $spreadsheet->getActiveSheet();
        // Nama sheet: maks 31 aksara, tiada : \ / ? * [ ]
        $sheet->setTitle(mb_substr(preg_replace('/[:\\\\\/?*\[\]]/', '', $title) ?? 'Laporan', 0, 31));

        $colCount = count($columns);
        $lastCol  = Coordinate::stringFromColumnIndex($colCount);

        // Baris 1–3: tajuk & metadata (jejak audit: siapa & bila)
        $sheet->setCellValue('A1', $title);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->setCellValue('A2', 'Penapis: ' . $meta['filters']);
        $sheet->setCellValue('A3', 'Dijana pada ' . $meta['generated_at'] . ' oleh ' . $meta['user']);

        // Baris 5: pengepala lajur — tebal + latar
        $headerRow = 5;
        $sheet->fromArray(array_values($columns), null, "A{$headerRow}");
        $headerStyle = $sheet->getStyle("A{$headerRow}:{$lastCol}{$headerRow}");
        $headerStyle->getFont()->setBold(true);
        $headerStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DDEBF7');

        // Baris data. Nombor kekal nombor (boleh dijumlah dalam Excel);
        // teks ditulis EKSPLISIT sebagai string supaya "001234" tidak jadi 1234
        // dan teks bermula "=" tidak dianggap formula (formula injection).
        $r = $headerRow + 1;
        foreach ($rows as $row) {
            $c = 1;
            foreach (array_keys($columns) as $key) {
                $value = $row[$key] ?? '';
                $coord = Coordinate::stringFromColumnIndex($c) . $r;

                if (is_int($value) || is_float($value)) {
                    $sheet->setCellValue($coord, $value);
                } else {
                    $sheet->setCellValueExplicit($coord, (string) $value, DataType::TYPE_STRING);
                }
                $c++;
            }
            $r++;
        }
        $lastRow = max($headerRow, $r - 1);

        // Lebar lajur automatik
        for ($i = 1; $i <= $colCount; $i++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($i))->setAutoSize(true);
        }

        // Beku pengepala: sel kiri-atas kawasan boleh skrol = baris selepas pengepala
        $sheet->freezePane('A' . ($headerRow + 1));
        $sheet->setAutoFilter("A{$headerRow}:{$lastCol}{$lastRow}");

        // Tulis ke memori (bukan fail sementara) dan pulangkan string binari
        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $binary = (string) ob_get_clean();

        // Bebaskan memori — objek Spreadsheet mempunyai rujukan kitaran
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet, $writer);

        return $binary;
    }
}
```

`$meta = ['filters' => 'ringkasan penapis', 'user' => 'nama pengguna', 'generated_at' => 'd/m/Y H:i']` (filter summary, user name, generation time). Both return a **binary string**; the controller sends the response.

In `app/Config/Services.php`, add after `reportService()`:

`app/Config/Services.php`

```php
public static function exportService(bool $getShared = true): \App\Services\ExportService
{
    if ($getShared) {
        return static::getSharedInstance('exportService');
    }

    return new \App\Services\ExportService();
}
```

**3. Create the PDF view** `app/Views/laporan/pdf.php` — plain HTML, **without** the Bootstrap layout:

`@page` leaves margins for the `position: fixed` `header`/`footer` (repeated on every page), `thead { display: table-header-group; }` repeats the table header, and the `DejaVu Sans` font renders Unicode characters.

`app/Views/laporan/pdf.php`

```php
<?php

/**
 * app/Views/laporan/pdf.php — Hari 9 S3
 * HTML ringkas KHUSUS untuk Dompdf (bukan layout Bootstrap):
 *  - Dompdf menyokong CSS 2.1 + sebahagian CSS3 → TIADA flexbox/grid; guna jadual & position:fixed.
 *  - Elemen position:fixed diulang pada SETIAP muka surat → pengepala & pengaki.
 *  - <thead> diulang secara automatik apabila jadual merentas muka surat.
 *  - Nombor muka surat ditambah oleh ExportService::pdf() melalui $canvas->page_text().
 *
 * @var string                          $title
 * @var array<string, string>           $columns
 * @var iterable<array<string, mixed>>  $rows
 * @var array{filters: string, user: string, generated_at: string} $meta
 */
?>
<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <title><?= esc($title) ?></title>
    <style>
        /* Margin muka surat memberi ruang untuk pengepala (atas) & pengaki (bawah) */
        @page { margin: 85px 28px 50px 28px; }

        body { font-family: "DejaVu Sans", sans-serif; font-size: 8.5pt; color: #222; }

        header { position: fixed; top: -70px; left: 0; right: 0; height: 60px;
                 border-bottom: 1px solid #999; }
        header .agency { font-size: 8pt; color: #555; }
        header h1 { font-size: 13pt; margin: 2px 0; }
        header .filters { font-size: 8pt; color: #555; }

        footer { position: fixed; bottom: -35px; left: 0; right: 0; height: 20px;
                 border-top: 1px solid #999; font-size: 7.5pt; color: #555; padding-top: 3px; }

        table { width: 100%; border-collapse: collapse; }
        thead { display: table-header-group; }          /* ulang pengepala setiap muka */
        tr { page-break-inside: avoid; }                /* jangan pecah satu baris */
        th { background: #DDEBF7; text-align: left; }
        th, td { border: 1px solid #bbb; padding: 3px 4px; vertical-align: top; }
        td.num { text-align: right; }
        .empty { text-align: center; color: #777; padding: 20px; }
    </style>
</head>
<body>

<header>
    <div class="agency">Sistem TLK &amp; Pas — Latihan CI-KKM-10 (DATA SINTETIK)</div>
    <h1><?= esc($title) ?></h1>
    <div class="filters">Penapis: <?= esc($meta['filters']) ?></div>
</header>

<footer>
    Dijana pada <?= esc($meta['generated_at']) ?> oleh <?= esc($meta['user']) ?>
    <!-- "Muka X / Y" dilukis di bucu kanan oleh page_text() -->
</footer>

<table>
    <thead>
    <tr>
        <th style="width: 3%">#</th>
        <?php foreach ($columns as $label): ?>
            <th><?= esc($label) ?></th>
        <?php endforeach ?>
    </tr>
    </thead>
    <tbody>
    <?php $n = 0; ?>
    <?php foreach ($rows as $row): ?>
        <?php $n++; ?>
        <tr>
            <td class="num"><?= $n ?></td>
            <?php foreach (array_keys($columns) as $key): ?>
                <?php $value = $row[$key] ?? ''; ?>
                <td class="<?= is_int($value) || is_float($value) ? 'num' : '' ?>"><?= esc((string) $value) ?></td>
            <?php endforeach ?>
        </tr>
    <?php endforeach ?>

    <?php if ($n === 0): ?>
        <tr><td colspan="<?= count($columns) + 1 ?>" class="empty">Tiada rekod sepadan dengan penapis.</td></tr>
    <?php endif ?>
    </tbody>
</table>

<p style="margin-top: 8px; font-size: 8pt;">Jumlah rekod: <strong><?= number_format($n) ?></strong></p>

</body>
</html>
```

**4. Add `exportRows()` to `ReportService`** — count first, reject if over the limit, then return a Generator:

Add the export limit right after `public const PER_PAGE = 20;`:

`app/Services/ReportService.php`

```php
    /** Had eksport — Dompdf perlahan untuk jadual besar; PhpSpreadsheet guna ~1 KB memori/sel. */
    public const EXPORT_LIMIT = ['pdf' => 2000, 'xlsx' => 10000];
```

Then add `exportRows()` and `streamRows()` before the final `}` of the class:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 4. Eksport: semua baris (tanpa pagination) tetapi berhad
    // ------------------------------------------------------------------

    /**
     * BUKAN fungsi generator — supaya semakan had (LengthException) berlaku SERTA-MERTA
     * apabila dipanggil, bukan tertangguh sehingga baris pertama dibaca.
     *
     * @return iterable<array<string, mixed>>
     *
     * @throws LengthException jika melebihi EXPORT_LIMIT
     */
    public function exportRows(string $report, array $filters, string $format): iterable
    {
        $this->assertReport($report);
        $limit = self::EXPORT_LIMIT[$format] ?? throw new InvalidArgumentException("Format tidak sah: {$format}");

        if ($report === 'penggunaan') {
            return $this->usageByZone($filters); // paling banyak beberapa puluh zon
        }

        $builder = $this->builder($report, $filters);
        $total   = $builder->countAllResults(false);

        if ($total > $limit) {
            throw new LengthException(sprintf(
                'Terlalu banyak rekod (%s) untuk eksport %s. Had: %s. Sila kecilkan julat penapis.',
                number_format($total),
                strtoupper($format),
                number_format($limit),
            ));
        }

        return $this->streamRows($report, $this->applySort($builder, $report, $filters));
    }

    /** Baca baris satu demi satu — elak membina array PHP gergasi. */
    private function streamRows(string $report, BaseBuilder $builder): Generator
    {
        $query = $builder->get();

        // fetch_assoc() pulang null (tamat) atau false (ralat) — kedua-duanya hentikan gelung.
        while (is_array($row = $query->getUnbufferedRow('array'))) {
            yield $this->formatRow($report, $row);
        }

        $query->freeResult();
    }
```

**5. Wire it into the controller.** Replace the **whole** `app/Controllers/Laporan/ReportController.php` with this version. Compared with Lab 9.2: `handle()` checks `?export=pdf|xlsx` first; `export()` calls `exportRows()` and `ExportService`, then `download($filename, $binary, true)` (`true` = guess the MIME type from the file extension); `LengthException` is caught → `redirect()` to the same URL without `export`, with an `error` flash; `describeFilters()` turns ids/enums into labels for the file header.

`app/Controllers/Laporan/ReportController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Laporan;

use App\Controllers\BaseController;
use App\Services\ExportService;
use App\Services\ReportService;
use CodeIgniter\HTTP\ResponseInterface;
use LengthException;

class ReportController extends BaseController
{
    private ReportService $reports;
    private ExportService $exporter;

    public function __construct()
    {
        $this->reports  = service('reportService');
        $this->exporter = service('exportService');
    }

    /** GET /laporan/tempahan — RPT-01 */
    public function bookings(): string|ResponseInterface
    {
        return $this->handle('tempahan');
    }

    /** GET /laporan/pas — RPT-02 */
    public function passes(): string|ResponseInterface
    {
        return $this->handle('pas');
    }

    /** GET /laporan/penggunaan — RPT-03 */
    public function usage(): string|ResponseInterface
    {
        return $this->handle('penggunaan');
    }

    /**
     * Satu aliran untuk ketiga-tiga laporan:
     *   penapis sama → HTML berpagination  ATAU  ?export=pdf|xlsx
     */
    private function handle(string $report): string|ResponseInterface
    {
        $filters = $this->reports->normaliseFilters($report, $this->request->getGet() ?? []);
        $export  = $this->request->getGet('export');

        if ($export === 'pdf' || $export === 'xlsx') {
            return $this->export($report, $filters, $export);
        }

        $page   = (int) ($this->request->getGet('page') ?? 1);
        $result = $this->reports->paginate($report, $filters, $page);

        return view('laporan/index', [
            'title'    => $this->reports->title($report),
            'report'   => $report,
            'filters'  => $filters,
            'query'    => $this->reports->toQuery($filters),
            'columns'  => $this->reports->columns($report),
            'sortable' => $this->reports->sortableColumns($report),
            'options'  => $this->reports->filterOptions($report),
            'result'   => $result,
            'pager'    => service('pager'),
        ]);
    }

    private function export(string $report, array $filters, string $format): ResponseInterface
    {
        try {
            $rows = $this->reports->exportRows($report, $filters, $format);
        } catch (LengthException $e) {
            // Kembali ke paparan HTML dengan penapis yang SAMA (tanpa ?export=)
            return redirect()
                ->to(current_url() . '?' . http_build_query($this->reports->toQuery($filters)))
                ->with('error', $e->getMessage());
        }

        $user  = auth()->user();
        $title = $this->reports->title($report);
        $meta  = [
            'filters'      => $this->describeFilters($report, $filters),
            'user'         => (string) ($user->full_name ?? $user->email ?? '-'),
            'generated_at' => date('d/m/Y H:i'),
        ];

        $binary = $format === 'pdf'
            ? $this->exporter->pdf($title, $this->reports->columns($report), $rows, $meta)
            : $this->exporter->xlsx($title, $this->reports->columns($report), $rows, $meta);

        $filename = sprintf('laporan-%s-%s.%s', $report, date('Ymd-His'), $format);

        // download(nama, data, setMime=true) → Content-Type diteka dari sambungan fail
        // (application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
        // dan Content-Disposition: attachment.
        return $this->response->download($filename, $binary, true);
    }

    /** Ringkasan penapis untuk pengepala PDF/Excel — pembaca tahu data ini ditapis bagaimana. */
    private function describeFilters(string $report, array $f): string
    {
        $parts = [];

        if ($report === 'penggunaan') {
            [$start, $end] = $this->reports->usagePeriod($f);
            $parts[]       = 'Tempoh ' . date('d/m/Y', strtotime($start)) . ' – ' . date('d/m/Y', strtotime($end));
        } else {
            $parts[] = 'Tarikh ' . ($f['from'] ? date('d/m/Y', strtotime($f['from'])) : '(mula)')
                . ' – ' . ($f['to'] ? date('d/m/Y', strtotime($f['to'])) : '(kini)');
        }

        // Tukar nilai id/enum kepada label yang dipaparkan dalam dropdown
        foreach ($this->reports->filterOptions($report) as $group => $opts) {
            $key = match ($group) {
                'zones'       => 'zone_id',
                'categories'  => 'category',
                'statuses'    => 'status',
                'departments' => 'department_id',
                'pass_types'  => 'pass_type',
                default       => null,
            };

            if ($key !== null && ($f[$key] ?? null) !== null) {
                foreach ($opts as $o) {
                    if ((string) $o['value'] === (string) $f[$key]) {
                        $parts[] = $o['label'];
                    }
                }
            }
        }

        return implode(' · ', $parts);
    }
}
```

**6. Test all three reports × two formats** (6 files). Open each file and go through the list in the Checkpoint.

The seeder gives staff numbers `LT0001`–`LT0005` (no leading zeros). To test leading zeros in Excel, change the staff number of `pemohon2` (who has pass applications from `DemoDataSeeder`) to `001234`, then export RPT-02:

```bash
mysql -u kkm_dev -p -e "UPDATE users SET staff_no = '001234' WHERE username = 'pemohon2'" kkm_latihan
```

🪟 If the password prompt does not appear in Git Bash: `winpty mysql …` (as on Day 6).

**7. Commit.** `git add app/ && git commit -m "RPT: eksport PDF (Dompdf) & Excel (PhpSpreadsheet)"`; PowerShell: run `git add` and `git commit` one at a time

### ✅ Checkpoint 9.3
- [ ] Filter RPT-01 by `status=approved` → screen: *N* records → PDF: "Jumlah rekod: *N*" → Excel: *N* data rows (rows 6 to 5+*N*). **All three numbers match.** (Quiz S3)
- [ ] PDF: A4 **landscape**; the header repeats on every page; footer "Dijana pada … oleh *your name*"; "Muka 1 / 3" (Page 1 / 3) in the bottom-right corner (Quiz S3).
- [ ] PDF: names with special characters (e.g. add a synthetic user "Nur'aini Ābdul") display correctly — not `?` (Quiz S3).
- [ ] Excel: the header row is **bold**; columns are wide enough; scroll down → the header stays (frozen); No. Pekerja (staff number) `001234` keeps its leading zeros (Quiz S3).
- [ ] File name: `laporan-tempahan-20260925-143012.pdf` (Quiz S3).
- [ ] Log in as `pemohon1@latihan.test` and open `/laporan/pas?export=xlsx` directly → **denied** (Quiz S3).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `?` characters or empty boxes in the PDF | The core PDF font (Helvetica) has no Unicode glyphs | `setDefaultFont('DejaVu Sans')` + `font-family: "DejaVu Sans"` in the CSS; `loadHtml($html, 'UTF-8')` |
| `Cannot modify header information - headers already sent by (output started at .../app/Config/Xxx.php:NN)` | There is output before the response: spaces/blank lines after `?>`, a BOM, `echo`/`var_dump`/`dd()` | Remove the closing `?>` in pure PHP files; remove debug code; save files as UTF-8 **without BOM** |
| Excel: "*We found a problem with some content*" / corrupt file | Extra output (spaces, PHP warnings) mixed into the binary | Same as above; check `writable/logs/` for warnings |
| `Allowed memory size of 134217728 bytes exhausted` | Too many cells/rows | The `EXPORT_LIMIT` cap; `disconnectWorksheets()`; do not use `getResultArray()` for exports |
| `Maximum execution time of 30 seconds exceeded` (PDF) | Dompdf is slow for tables with thousands of rows | PDF limit 2,000; suggest Excel for large data |
| The logo does not appear in the PDF | `isRemoteEnabled=false` blocks `http://…` URLs | Use a local file path in `public/` (allowed by `setChroot([FCPATH])`) or a base64 data URI |
| PDF layout is a mess | Using flexbox/grid/Bootstrap | Dompdf = CSS 2.1: use `<table>`, `position: fixed`, `float` |
| `Class "Dompdf\Dompdf" not found` | `composer require` was run in another folder / `vendor/` not updated | Run it in the project root; `composer dump-autoload` |
| `ZipArchive not found` when creating `.xlsx` | The `ext-zip` extension is not enabled | Enable it in `php.ini` (`extension=zip`) and restart the server |

### ⭐ Bonus challenge
- Add a **PDF preview** button that opens the PDF in a new tab (inline) using:
  ```php
  return $this->response
      ->setContentType('application/pdf')
      ->setHeader('Content-Disposition', 'inline; filename="' . $filename . '"')
      ->setBody($binary);
  ```
- Add a streamed **CSV** format (`fputcsv` to `php://output`) for exports with no practical limit. Discuss: why is CSV lighter than `.xlsx`?

---

## Lab 9.4 — Test "report total = SQL total" & EXPLAIN (S4)

### 🎯 Objective
- Write PHPUnit tests with your own fixtures and compare report totals with direct SQL counts.
- Read the `EXPLAIN` plan for the RPT-01/RPT-02 queries and judge how indexes are used.

### Prerequisites
- Labs 9.2 & 9.3 done.
- A separate test database exists:
  ```sql
  CREATE DATABASE IF NOT EXISTS kkm_latihan_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- `.env` (do NOT commit):
  ```ini
  database.tests.hostname = localhost
  database.tests.database = kkm_latihan_test
  database.tests.username = <pengguna anda>
  database.tests.password = <kata laluan anda>
  database.tests.DBDriver = MySQLi
  database.tests.DBPrefix =
  ```

### Steps

**1. Create** `tests/Services/ReportServiceTest.php`. Skeleton:

```php
<?php

declare(strict_types=1);

namespace Tests\Services;

use App\Services\ReportService;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;

final class ReportServiceTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate   = true;
    protected $refresh   = true;
    protected $namespace = null;   // all migrations, including Shield (users table)

    private ReportService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReportService();
        $this->seedFixtures();       // small data set whose answers we know
    }
}
```

**2. Design the fixtures on paper first.** Draw a table of 5 bookings (slot, dates, status) and 3 pass applications (`created_at`, status). Work out by hand: how many are `approved`? how many overlap June? what is the % usage of Zone A in June? **Only then** write `seedFixtures()`.

Compare your design with the fixtures below, then add them inside the class, after `setUp()` (the `$id` property keeps record ids for the tests):

`tests/Services/ReportServiceTest.php`

```php
    /** @var array<string, int> id rekod fixture (diisi oleh seedFixtures()) */
    private array $id = [];

    // =====================================================================
    // Fixture — data sintetik yang kita tahu jawapannya
    // =====================================================================

    private function seedFixtures(): void
    {
        $now = '2026-01-01 08:00:00';

        $this->id['dept1'] = $this->insert('departments', ['code' => 'UJI-IT', 'name' => 'Unit Teknologi Maklumat (Ujian)']);
        $this->id['dept2'] = $this->insert('departments', ['code' => 'UJI-KEW', 'name' => 'Unit Kewangan (Ujian)']);

        $this->id['user1'] = $this->insert('users', [
            'username' => 'ujian1', 'active' => 1, 'full_name' => 'Pemohon Ujian Satu',
            'staff_no' => 'U0001', 'department_id' => $this->id['dept1'], 'created_at' => $now,
        ]);
        $this->id['user2'] = $this->insert('users', [
            'username' => 'ujian2', 'active' => 1, 'full_name' => 'Pemohon Ujian Dua',
            'staff_no' => 'U0002', 'department_id' => $this->id['dept2'], 'created_at' => $now,
        ]);

        $this->id['veh1'] = $this->insert('vehicles', ['user_id' => $this->id['user1'], 'plate_no' => 'WXX 9001', 'model' => 'Myvi', 'color' => 'Putih']);
        $this->id['veh2'] = $this->insert('vehicles', ['user_id' => $this->id['user2'], 'plate_no' => 'WXX 9002', 'model' => 'Saga', 'color' => 'Hitam']);

        $this->id['zoneA'] = $this->insert('parking_zones', ['code' => 'ZA', 'name' => 'Zon A Ujian', 'location' => 'Blok A']);
        $this->id['zoneB'] = $this->insert('parking_zones', ['code' => 'ZB', 'name' => 'Zon B Ujian', 'location' => 'Blok B']);

        $a1 = $this->insert('parking_slots', ['zone_id' => $this->id['zoneA'], 'slot_no' => 'A01', 'category' => 'oku', 'is_active' => 1]);
        $a2 = $this->insert('parking_slots', ['zone_id' => $this->id['zoneA'], 'slot_no' => 'A02', 'category' => 'oku', 'is_active' => 1]);
        $this->insert('parking_slots', ['zone_id' => $this->id['zoneA'], 'slot_no' => 'A03', 'category' => 'oku', 'is_active' => 0]);
        $b1 = $this->insert('parking_slots', ['zone_id' => $this->id['zoneB'], 'slot_no' => 'B01', 'category' => 'pegawai_kanan', 'is_active' => 1]);

        $bookings = [
            // [slot, user, vehicle, start, end, status]
            [$a1, 'user1', 'veh1', '2026-06-01', '2026-06-10', 'approved'],  // #1
            [$a2, 'user2', 'veh2', '2026-05-25', '2026-06-05', 'approved'],  // #2
            [$b1, 'user1', 'veh1', '2026-06-15', '2026-06-20', 'pending'],   // #3
            [$b1, 'user2', 'veh2', '2026-06-01', '2026-06-03', 'rejected'],  // #4
            [$a1, 'user1', 'veh1', '2026-07-01', '2026-07-05', 'approved'],  // #5
        ];

        foreach ($bookings as $i => [$slot, $user, $veh, $start, $end, $status]) {
            $this->insert('slot_bookings', [
                'ref_no'     => sprintf('TLK-2026-%04d', 9001 + $i),
                'user_id'    => $this->id[$user],
                'vehicle_id' => $this->id[$veh],
                'slot_id'    => $slot,
                'start_date' => $start,
                'end_date'   => $end,
                'reason'     => 'Data ujian sintetik',
                'status'     => $status,
                'created_at' => $now,
            ]);
        }

        $passes = [
            // [user, created_at, status]
            ['user1', '2026-09-01 09:00:00', 'submitted'],
            ['user1', '2026-09-30 14:00:00', 'under_review'],  // hari terakhir julat
            ['user2', '2026-10-01 00:00:00', 'approved'],      // di luar julat September
        ];

        foreach ($passes as $i => [$user, $createdAt, $status]) {
            $this->insert('pass_applications', [
                'ref_no'      => sprintf('PAS-2026-%04d', 9001 + $i),
                'user_id'     => $this->id[$user],
                'pass_type'   => 'kakitangan',
                'purpose'     => 'Data ujian sintetik',
                'valid_from'  => '2026-10-01',
                'valid_until' => '2026-12-31',
                'status'      => $status,
                'created_at'  => $createdAt,
            ]);
        }
    }

    private function insert(string $table, array $row): int
    {
        $this->db->table($table)->insert($row);

        return (int) $this->db->insertID();
    }
```

**3. Write at least 7 tests** (descriptive Malay names):

| Test | Main assertion |
|------|----------------|
| `testRpt01TanpaPenapisSamaDenganJumlahJadual` | `total === COUNT(*)` |
| `testRpt01PenapisStatusSamaDenganKiraanSql` | `total === COUNT(*) WHERE status` **and** `=== 3` |
| `testRpt01JulatTarikhGunaSyaratBertindih` | 4 (not 3!) |
| `testRpt02HariTerakhirJulatTidakTercicir` | the 30/09 14:00 record is included |
| `testSusunanDiluarWhitelistJatuhKeLalai` | `sort === 'start_date'`; the `users` table still exists |
| `testEksportSamaJumlahDenganPaparanHtml` | `count(iterator_to_array(exportRows)) === paginate total` |
| `testRpt03KadarPenggunaanJun2026` | Zone A = `25.0` |

Test code. Add it inside the class, after `setUp()` and before the fixtures:

`tests/Services/ReportServiceTest.php`

```php
    // =====================================================================
    // RPT-01 — Senarai tempahan TLK
    // =====================================================================

    public function testRpt01TanpaPenapisSamaDenganJumlahJadual(): void
    {
        $f      = $this->service->normaliseFilters('tempahan', []);
        $result = $this->service->paginate('tempahan', $f, 1);

        $this->assertSame($this->db->table('slot_bookings')->countAllResults(), $result['total']);
        $this->assertSame(5, $result['total']);
    }

    public function testRpt01PenapisStatusSamaDenganKiraanSql(): void
    {
        $f      = $this->service->normaliseFilters('tempahan', ['status' => 'approved']);
        $result = $this->service->paginate('tempahan', $f, 1);

        $expected = $this->db->table('slot_bookings')->where('status', 'approved')->countAllResults();

        $this->assertSame($expected, $result['total']);
        $this->assertSame(3, $result['total']);
    }

    public function testRpt01JulatTarikhGunaSyaratBertindih(): void
    {
        // Jun 2026: tempahan #1, #2 (mula 25/05, tamat 05/06), #3, #4 bertindih. #5 (Julai) tidak.
        $f      = $this->service->normaliseFilters('tempahan', ['from' => '2026-06-01', 'to' => '2026-06-30']);
        $result = $this->service->paginate('tempahan', $f, 1);

        $expected = $this->db->table('slot_bookings')
            ->where('start_date <=', '2026-06-30')
            ->where('end_date >=', '2026-06-01')
            ->countAllResults();

        $this->assertSame($expected, $result['total']);
        $this->assertSame(4, $result['total']);
    }


    public function testSusunanDiluarWhitelistJatuhKeLalai(): void
    {
        $f = $this->service->normaliseFilters('tempahan', ['sort' => 'b.id; DROP TABLE users', 'dir' => 'sideways']);

        $this->assertSame('start_date', $f['sort']);
        $this->assertSame('desc', $f['dir']);
        $this->assertSame(5, $this->service->paginate('tempahan', $f, 1)['total']);
        $this->assertTrue($this->db->tableExists('users'));
    }


    public function testEksportSamaJumlahDenganPaparanHtml(): void
    {
        $f = $this->service->normaliseFilters('tempahan', ['status' => 'approved']);

        $html   = $this->service->paginate('tempahan', $f, 1)['total'];
        $export = iterator_to_array($this->service->exportRows('tempahan', $f, 'xlsx'), false);

        $this->assertCount($html, $export);
        $this->assertSame('Diluluskan', $export[0]['status']); // label BM dari enum
    }

    // =====================================================================
    // RPT-02 — Senarai permohonan Pas
    // =====================================================================

    public function testRpt02HariTerakhirJulatTidakTercicir(): void
    {
        // Permohonan pada 30/09 14:00 MESTI termasuk apabila "hingga 30/09".
        // (Pepijat klasik: where('created_at <=', '2026-09-30') = sehingga 00:00 sahaja.)
        $f = $this->service->normaliseFilters('pas', ['from' => '2026-09-01', 'to' => '2026-09-30']);

        $this->assertSame(2, $this->service->paginate('pas', $f, 1)['total']);
    }

    // =====================================================================
    // RPT-03 — Penggunaan slot mengikut zon
    // =====================================================================

    public function testRpt03KadarPenggunaanJun2026(): void
    {
        $f    = $this->service->normaliseFilters('penggunaan', ['year' => '2026', 'month' => '6']);
        $rows = array_column($this->service->usageByZone($f), null, 'zone_code');

        // Zon A: 2 slot aktif (slot tidak aktif dikecualikan) × 30 hari = 60 hari-slot.
        // Ditempah: #1 = 10 hari (01–10/06), #2 = 5 hari (01–05/06). 15 / 60 = 25.0 %
        $this->assertSame(2, $rows['ZA']['total_slots']);
        $this->assertSame(2, $rows['ZA']['total_bookings']);
        $this->assertSame(15, $rows['ZA']['booked_days']);
        $this->assertSame(60, $rows['ZA']['capacity_days']);
        $this->assertSame(25.0, $rows['ZA']['utilisation']);

        // Zon B: pending & rejected TIDAK dikira sebagai penggunaan.
        $this->assertSame(0, $rows['ZB']['booked_days']);
        $this->assertSame(0.0, $rows['ZB']['utilisation']);
    }
```

**4. Run them.**

```bash
composer test -- tests/Services/ReportServiceTest.php --testdox
```

**5. Prove the tests catch bugs (manual mutation).** In `passesBuilder()`, temporarily replace the whole `->when($f['to'] ?? null, ...)` condition (4 lines, `'p.created_at <'`) with this single line:

```php
// DELIBERATELY WRONG — to see the test fail
->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where('p.created_at <=', $to))
```

Run again → `testRpt02HariTerakhirJulatTidakTercicir` **must fail**. Restore → green.

**6. EXPLAIN.** Create a small Spark command `app/Commands/ReportExplain.php`:

```php
<?php

declare(strict_types=1);

namespace App\Commands;

use App\Services\ReportService;
use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

class ReportExplain extends BaseCommand
{
    protected $group       = 'Laporan';
    protected $name        = 'laporan:explain';
    protected $description = 'Papar SQL & pelan EXPLAIN bagi laporan tempahan/pas.';
    protected $usage       = 'laporan:explain <tempahan|pas> [status] [from] [to]';

    public function run(array $params)
    {
        $report = $params[0] ?? 'tempahan';

        if (! in_array($report, ['tempahan', 'pas'], true)) {
            CLI::error('Laporan mesti "tempahan" atau "pas" (RPT-03 ialah aggregate PHP).');

            return EXIT_ERROR;
        }

        $service = new ReportService();
        $filters = $service->normaliseFilters($report, [
            'status' => $params[1] ?? null,
            'from'   => $params[2] ?? null,
            'to'     => $params[3] ?? null,
        ]);

        $sql = $service->builder($report, $filters)->getCompiledSelect();   // the REAL SQL
        CLI::write($sql, 'yellow');

        // FORMAT=TRADITIONAL: MySQL 9 changed the default EXPLAIN format to a tree (MariaDB: drop FORMAT=TRADITIONAL).
        // A justified K7 exception: $sql is compiled by the Query Builder (values already escaped), CLI command only.
        $plan = db_connect()->query('EXPLAIN FORMAT=TRADITIONAL ' . $sql)->getResultArray();
        CLI::table($plan, array_keys($plan[0] ?? []));

        return EXIT_SUCCESS;
    }
}
```

```bash
php spark laporan:explain tempahan approved 2026-06-01 2026-06-30
php spark laporan:explain pas "" 2026-09-01 2026-09-30
```

**7. Record your observations** in `docs/laporan-spec.md` → section "Prestasi" (Performance): for each query, note `type`, `key`, `rows` for the main table (`b` / `p`). Answer: *which query has no index for its main filter?*

**8. Commit & open the MR.**

```bash tab="Git Bash / macOS / Linux"
git add -A && git commit -m "RPT: ujian jumlah laporan = SQL + arahan laporan:explain"
git push -u origin feat/laporan    # open an MR to main → trainer/neighbour comments; do NOT merge yet — Labs 9.1b–9.4b add commits to this MR
```

```powershell tab="PowerShell"
git add -A
git commit -m "RPT: ujian jumlah laporan = SQL + arahan laporan:explain"
git push -u origin feat/laporan    # open an MR to main → trainer/neighbour comments; do NOT merge yet — Labs 9.1b–9.4b add commits to this MR
```

### ✅ Checkpoint 9.4 — **M3 done**
- [ ] `composer test -- tests/Services/ReportServiceTest.php` → all green (≥ 7 tests) (Quiz S4).
- [ ] The mutation in step 5 makes exactly **one** test fail; it has been restored (Quiz S4).
- [ ] The output of `laporan:explain tempahan approved` shows `key = status` (or another index) for table `b` — not `type = ALL` (Quiz S4).
- [ ] You can explain to the trainer why RPT-02 with only a date filter shows `type = ALL` on `p` (Quiz S4).
- [ ] DoD KOLABORASI §2 ticked for M3 (Quiz S4).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| Tests use SQLite & fail with `no such function: DATEDIFF` | CI4's default `tests` group = SQLite | Set `database.tests.*` to MySQL in `.env` |
| `Table 'kkm_latihan_test.users' doesn't exist` | `$namespace = 'App'` (default) → the Shield migrations do not run | `protected $namespace = null;` |
| `Duplicate entry 'WXX 9001' for key 'plate_no'` | Data left over from the last test | `protected $refresh = true;` |
| Tests pass on machine A, fail on B (dates) | Fixtures depend on `date('Y-m-d')` | Use fixed dates (June 2026) in the fixtures |
| EXPLAIN output is one tree-shaped column (`-> Nested loop ...`) | MySQL 9 changed the default EXPLAIN format | Use `'EXPLAIN FORMAT=TRADITIONAL ' . $sql` |
| `getCompiledSelect()` followed by `get()` returns every row without filters | `getCompiledSelect()` (default) **resets** the builder | Use a new builder, or `getCompiledSelect(false)` |

### ⭐ Bonus challenge
- Generate 50,000 synthetic bookings (a separate seeder `BulkBookingSeeder`, using `insertBatch()` in batches of 1,000), time RPT-02 with only a date filter, then propose (in a **new** migration, not by changing the old one) `INDEX(created_at)` on `pass_applications`. Run `laporan:explain` before/after and present the difference in `type`/`rows`. Record it as a recommendation to the system owner — schema changes must be recorded in `docs/log-keputusan.md`.
- Add a test `testEksportMelebihiHadDitolak`: make the limit a constructor parameter (`?array $exportLimit = null`), create the service with the limit `['pdf' => 2, 'xlsx' => 2]`, and `expectException(\LengthException::class)`. (Why does a subclass that overrides `const EXPORT_LIMIT` have no effect if the code calls `self::EXPORT_LIMIT`? Hint: `self::` vs `static::`.)

---

## Lab 9.1b — Quick periods & active filter chips (S5)

### 🎯 Objective
- Add "Quick periods" and "Active filters" rows to the RPT-01..03 spec cards.
- Build **Bulan ini / Bulan lepas / Tahun ini** (This month / Last month / This year) GET links that fill the date range and keep the other filters.
- Build **active filter chips**: one click removes one filter, the other filters stay.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- [Lab 9.1](#lab-91--report-design--get-filter-form-s1) done: the filter form keeps its values after **Tapis** (Filter).

### Steps

**1. Update the spec cards (5 min).** Add these two rows at the end of the table in `docs/laporan-spec.md`, then fill in every cell:

```markdown
| Tempoh pantas (butang) | | | |
| Filter aktif dipapar sebagai | | | |
```

Hint: RPT-01 and RPT-02 fill `from`/`to`; RPT-03 fills `year`/`month`. The card and the code must match: if the card says "Minggu ini" (This week), the code needs that button too.

**2. Helper variables in the view.** In `app/Views/laporan/index.php`, add this block directly after the `$selected = static fn ...` line and **before** the first `?>`:

`app/Views/laporan/index.php`

```php
// Lab 9.1b — tempoh pantas & cip penapis aktif.
// $keep = penapis yang berisi (termasuk sort/dir) → asas setiap pautan supaya pilihan lain kekal.
$keep  = array_filter($filters, static fn ($v): bool => $v !== null && $v !== '');
$today = new DateTimeImmutable('today');

if ($report !== 'penggunaan') {
    unset($keep['year']); // rangka Lab 9.1 mengisi year untuk semua laporan; hanya RPT-03 memerlukannya
}

// Bina URL laporan semasa daripada array penapis; nilai null/kosong dibuang.
$urlWith = static function (array $params): string {
    $qs = http_build_query(array_filter($params, static fn ($v): bool => $v !== null && $v !== ''));

    return current_url() . ($qs === '' ? '' : '?' . $qs);
};

// Tempoh pantas. 'first day of last month' selamat pada 31 haribulan; '-1 month' tidak (31/03 → 03/03).
$lastMonth = $today->modify('first day of last month');
$presets   = $report === 'penggunaan'
    ? [
        'Bulan ini'   => ['year' => $today->format('Y'), 'month' => $today->format('n')],
        'Bulan lepas' => ['year' => $lastMonth->format('Y'), 'month' => $lastMonth->format('n')],
        'Tahun ini'   => ['year' => $today->format('Y'), 'month' => null], // null → kunci dibuang = "Setahun"
    ]
    : [
        'Bulan ini'   => ['from' => $today->modify('first day of this month')->format('Y-m-d'), 'to' => $today->modify('last day of this month')->format('Y-m-d')],
        'Bulan lepas' => ['from' => $lastMonth->format('Y-m-d'), 'to' => $lastMonth->modify('last day of this month')->format('Y-m-d')],
        'Tahun ini'   => ['from' => $today->format('Y') . '-01-01', 'to' => $today->format('Y') . '-12-31'],
    ];

// Cip penapis aktif: kunci → [label, kumpulan $options untuk menukar nilai kepada label dropdown].
$chipDefs = [
    'from'          => ['Dari', ''],
    'to'            => ['Hingga', ''],
    'zone_id'       => ['Zon', 'zones'],
    'category'      => ['Kategori', 'categories'],
    'department_id' => ['Jabatan', 'departments'],
    'pass_type'     => ['Jenis pas', 'pass_types'],
    'status'        => ['Status', 'statuses'],
    'month'         => ['Bulan', ''],
];
$chips = [];

foreach ($chipDefs as $key => [$label, $group]) {
    if (! isset($keep[$key])) {
        continue;
    }

    $text = (string) $keep[$key];

    if ($key === 'month') {
        $text = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'][(int) $text - 1] ?? $text;
    }

    foreach ($options[$group] ?? [] as $o) {
        if ((string) $o['value'] === $text) {
            $text = $o['label'];
        }
    }

    $chips[$key] = $label . ': ' . $text;
}
```

- `$keep` holds the filters that have a value. Every link starts from it, so the other choices stay.
- `$preset + $keep`: the `+` operator keeps the keys of the **left** array. The period values overwrite the current `from`/`to`, and `status` stays.
- `'month' => null` on **Tahun ini** (This year) overwrites the current month, then `$urlWith()` drops that key. As a result, the Bulan (Month) dropdown shows *Setahun* (Whole year).
- `$chips` turns values into dropdown labels (`approved` → *Diluluskan*, `1` → *A — Blok Utama*) with the same `$options` as the form.

**3. Quick periods & chips block.** In the same file, add this block directly after `</form>` and **before** the line `<?php // JADUAL & PAGINATION — Lab 9.2 langkah 9 menggantikan baris ini. ?>` (Lab 9.2 replaces only that line, so this block stays). If Lab 9.2 is already done, put this block before `<!-- ============ RINGKASAN + EKSPORT`:

`app/Views/laporan/index.php`

```php
<!-- ============ Lab 9.1b: TEMPOH PANTAS + CIP PENAPIS AKTIF ============
     Pautan GET biasa (tiada JavaScript). Setiap pautan bermula daripada $keep → pilihan lain kekal.
     Tiada 'page' dalam pautan → kembali ke halaman 1 apabila penapis berubah. -->
<div class="d-flex flex-wrap align-items-center gap-2 mb-3">
    <span class="text-muted small">Tempoh pantas:</span>
    <?php foreach ($presets as $label => $preset): ?>
        <?php
        // Aktif jika setiap nilai preset sama dengan penapis semasa (null = penapis itu mesti kosong)
        $isOn = true;
        foreach ($preset as $k => $v) {
            $isOn = $isOn && (string) ($filters[$k] ?? '') === (string) ($v ?? '');
        }
        ?>
        <a href="<?= esc($urlWith($preset + $keep), 'attr') ?>"
           class="btn btn-sm <?= $isOn ? 'btn-secondary' : 'btn-outline-secondary' ?>"><?= esc($label) ?></a>
    <?php endforeach ?>

    <?php foreach ($chips as $key => $text): ?>
        <!-- Klik cip = buang SATU penapis; yang lain kekal -->
        <a href="<?= esc($urlWith(array_diff_key($keep, [$key => true])), 'attr') ?>"
           class="badge rounded-pill text-bg-light border text-decoration-none" title="Buang penapis ini">
            <?= esc($text) ?> <i class="bi bi-x-lg"></i>
        </a>
    <?php endforeach ?>
</div>
```

**4. Test in the browser** as `penyemak@latihan.test`:

1. `/laporan/tempahan` → click **Bulan ini**. URL: `?from=<1hb bulan ini>&to=<hari terakhir bulan ini>` (the 1st and the last day of this month). The **Bulan ini** button turns dark; the *Dari* (From) and *Hingga* (To) chips appear.
2. Choose Status *Diluluskan* (Approved) → **Tapis**. The URL now contains `zone_id=&category=&…&sort=&dir=` (the form sends every field). The *Status: Diluluskan* chip appears and **Bulan ini** is still dark.
3. Click the *Dari: …* chip. Write down the query string of the new URL (Quiz S5).
4. Click **Bulan lepas** (Last month). `from`/`to` change to last month, and the *Status: Diluluskan* chip is still there.
5. `/laporan/penggunaan` → choose Bulan *Jun* (June) → **Tapis** → click **Tahun ini**. Write down the Bulan dropdown choice and which button is dark (Quiz S5).
6. Test `esc()`: open `/laporan/tempahan?from=<b>x</b>`. The chip shows the text `<b>x</b>` literally, not bold text.

**5. Commit.** `git add -A && git commit -m "RPT: tempoh pantas & cip penapis aktif"`; PowerShell: run `git add` and `git commit` one at a time

### ✅ Checkpoint
- [ ] `docs/laporan-spec.md` has complete "Tempoh pantas" and "Filter aktif" rows for the 3 reports (Quiz S5).
- [ ] RPT-01: **Bulan ini** fills `from`/`to` with the current month; the chosen Status stays after you click **Bulan lepas** (Quiz S5).
- [ ] Clicking one chip removes **one** filter only, and the new URL has no empty keys (`zone_id=&…`) (Quiz S5).
- [ ] RPT-03: **Tahun ini** removes `month` → the Bulan dropdown shows *Setahun*, the **Tahun ini** button is dark (Quiz S5).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| PHP code printed as text at the top of the page | The step 2 block was pasted **after** `?>` | Move the block above the first `?>` |
| **Bulan lepas** on 31/03 gives 03/03–… (March), not February | `modify('-1 month')` → 31/02 → adjusted to 03/03 | Use `modify('first day of last month')` as in the code |
| The URL after clicking a chip is still long `?zone_id=&category=&…` | `array_filter()` is missing in `$urlWith` | Copy `$urlWith` again |
| A button is not dark even though the URL is right | Comparing `2026` (int) with `'2026'` (string) using `===` | Cast both sides to `(string)` as in the `$isOn` block |
| A chip shows `approved`, not *Diluluskan* | Wrong group name in `$chipDefs` (e.g. `'status'`, not `'statuses'`) | The group must match an `$options` key |
| `Undefined variable $chips` | The step 2 block was pasted into another file or after `endSection()` | Both blocks go in `app/Views/laporan/index.php`; step 2 at the top, step 3 after `</form>` |

### ⭐ Bonus challenge
- Add a **Minggu ini** (This week, Monday–Sunday) button for RPT-01/02. Hint: `$today->modify('monday this week')` and `$today->modify('sunday this week')`. Update the spec card first.

---

## Lab 9.2b — Status summary & RPT-03 totals row (S6)

### 🎯 Objective
- Write `statusSummary()`, which wraps `builder()` as a subquery (`fromSubquery()`) with `selectCount()` + `groupBy()`, so the summary filters are the same as the list filters.
- Write `usageTotals()`: overall RPT-03 usage as a **weighted** average.
- Show summary buttons that filter by status when clicked, and a JUMLAH (TOTAL) `<tfoot>` row.

### Prerequisites
- [Lab 9.2](#lab-92--reportservice-join-dynamic-filters-aggregate-pagination-s2) done: the three reports show a paginated table.
- [Lab 9.1b](#lab-91b--quick-periods--active-filter-chips-s5) done.

### Steps

**1. Plan the query.** The summary must count the **same** rows as the list. So the summary query does not rewrite the joins and `when()` calls; it wraps the list builder:

```sql
SELECT r.status, COUNT(r.id) AS total
FROM ( <SQL senarai RPT-01: 4 join + when() yang sama> ) r
GROUP BY r.status
```

**2. Add two methods** in `app/Services/ReportService.php`, before the last `}` of the class:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // Lab 9.2b — Ringkasan status (RPT-01/02) & baris jumlah (RPT-03)
    // ------------------------------------------------------------------

    /**
     * Bilangan rekod setiap status bagi penapis yang SAMA dengan senarai.
     * builder() dibalut sebagai subquery → join & when() tidak ditulis semula.
     *
     * @param array<string, int|string|null> $filters hasil normaliseFilters()
     *
     * @return list<array{value: string, label: string, total: int}> ikut susunan enum; status 0 tidak dipapar
     */
    public function statusSummary(string $report, array $filters): array
    {
        $this->assertReport($report);

        if ($report === 'penggunaan') {
            return []; // RPT-03 sudah aggregate; tiada lajur status
        }

        // SELECT r.status, COUNT(r.id) AS total FROM (<SQL senarai>) r GROUP BY r.status
        $counts = $this->db->newQuery()
            ->fromSubquery($this->builder($report, $filters), 'r')
            ->select('r.status')
            ->selectCount('r.id', 'total')
            ->groupBy('r.status')
            ->get()
            ->getResultArray();

        $counts = array_column($counts, 'total', 'status');
        $cases  = $report === 'tempahan' ? BookingStatus::cases() : PassStatus::cases();
        $rows   = [];

        foreach ($cases as $case) {
            if (isset($counts[$case->value])) {
                $rows[] = ['value' => $case->value, 'label' => $case->label(), 'total' => (int) $counts[$case->value]];
            }
        }

        return $rows;
    }

    /**
     * Baris JUMLAH RPT-03. Penggunaan keseluruhan = jumlah hari-slot ÷ jumlah kapasiti (purata BERWAJARAN),
     * bukan purata peratus zon — zon kecil tidak boleh "menarik" angka keseluruhan.
     *
     * @param list<array<string, int|float|string>> $rows hasil usageByZone()
     *
     * @return array<string, int|float|string>
     */
    public function usageTotals(array $rows): array
    {
        $booked   = array_sum(array_column($rows, 'booked_days'));
        $capacity = array_sum(array_column($rows, 'capacity_days'));

        return [
            'zone_code'      => 'JUMLAH',
            'zone_name'      => count($rows) . ' zon',
            'total_slots'    => array_sum(array_column($rows, 'total_slots')),
            'total_bookings' => array_sum(array_column($rows, 'total_bookings')),
            'booked_days'    => $booked,
            'capacity_days'  => $capacity,
            'utilisation'    => $capacity > 0 ? round($booked / $capacity * 100, 1) : 0.0,
        ];
    }
```

- `$this->db->newQuery()` gives an empty builder with no table; `fromSubquery()` turns the list builder into the derived table `r`.
- The `cases()` loop orders the result by the enum (not by MySQL's order) and turns values into labels.
- `usageTotals()` takes the `usageByZone()` rows and runs no query.

**3. Replace the whole `paginate()`** (docblock + method, under the comment `// 3. Paparan HTML berpagination`) with this version. Compared with Lab 9.2, both `return` statements have two new keys: `summary` and `totals`.

`app/Services/ReportService.php`

```php
    /**
     * @param array<string, int|string|null> $filters hasil normaliseFilters()
     *
     * @return array{rows: list<array<string, mixed>>, total: int, page: int, perPage: int, summary: list<array>, totals: array<string, mixed>|null}
     */
    public function paginate(string $report, array $filters, int $page, int $perPage = self::PER_PAGE): array
    {
        $this->assertReport($report);
        $page = max(1, $page);

        if ($report === 'penggunaan') {
            // Aggregate kecil (satu baris per zon) — potong dalam PHP.
            $all = $this->usageByZone($filters);

            return [
                'rows'    => array_slice($all, ($page - 1) * $perPage, $perPage),
                'total'   => count($all),
                'page'    => $page,
                'perPage' => $perPage,
                'summary' => [],
                'totals'  => $this->usageTotals($all), // Lab 9.2b: SEMUA zon, bukan halaman semasa sahaja
            ];
        }

        $builder = $this->builder($report, $filters);

        // countAllResults(false) = kira TANPA reset builder; join/where kekal untuk get().
        $total = $builder->countAllResults(false);

        $rows = $this->applySort($builder, $report, $filters)
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()
            ->getResultArray();

        return [
            'rows'    => array_map(fn (array $r): array => $this->formatRow($report, $r), $rows),
            'total'   => $total,
            'page'    => $page,
            'perPage' => $perPage,
            'summary' => $this->statusSummary($report, $filters), // Lab 9.2b
            'totals'  => null,
        ];
    }
```

The controller **does not change**: `$result` is already passed to the view, so the view can read `$result['summary']` and `$result['totals']` directly.

**4. Update the view** `app/Views/laporan/index.php`.

(a) Add the summary block directly **before** the line `<!-- ============ JADUAL ============ -->`:

`app/Views/laporan/index.php`

```php
<!-- ============ Lab 9.2b: RINGKASAN STATUS ============
     Satu query GROUP BY atas builder yang SAMA → jumlah semua butang = "Jumlah rekod".
     Klik butang = tapis status itu (penapis lain kekal; kembali ke halaman 1). -->
<?php if ($result['summary'] !== []): ?>
    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
        <span class="text-muted small">Ringkasan status:</span>
        <?php foreach ($result['summary'] as $s): ?>
            <a href="<?= esc(current_url() . '?' . http_build_query(['status' => $s['value']] + $query), 'attr') ?>"
               class="btn btn-sm <?= $filters['status'] === $s['value'] ? 'btn-primary' : 'btn-outline-primary' ?>">
                <?= esc($s['label']) ?> <span class="badge text-bg-light"><?= number_format($s['total']) ?></span>
            </a>
        <?php endforeach ?>
    </div>
<?php endif ?>
```

(b) Add the JUMLAH row directly **after** `</tbody>` (before `</table>`):

`app/Views/laporan/index.php`

```php
        <?php if ($result['totals'] !== null && $result['total'] > 0): ?>
            <!-- Lab 9.2b: baris JUMLAH RPT-03 (semua zon, purata berwajaran) -->
            <tfoot class="table-group-divider fw-bold">
            <tr>
                <td></td>
                <?php foreach (array_keys($columns) as $key): ?>
                    <td><?= esc((string) ($result['totals'][$key] ?? '')) ?></td>
                <?php endforeach ?>
            </tr>
            </tfoot>
        <?php endif ?>
```

**5. Test RPT-01 and RPT-02** as `penyemak@latihan.test`:

1. `/laporan/tempahan` with no filters. Add up the number on each summary button; the result must equal "Jumlah rekod" (total records).
2. Debug Toolbar → *Database* tab. Find the query `SELECT r.status, COUNT(r.id) AS total FROM (SELECT b.id, … ) r GROUP BY r.status`. The joins and `WHERE` inside the brackets are the same as the list query.
3. Open `/laporan/tempahan?status=approved`. Write down the number of summary buttons and their numbers (Quiz S6).
4. Choose Zon (Zone) *A* → **Tapis** → click page 2 if there is one → click a summary button. Write down which parameters stay in the URL (Quiz S6).
5. `/laporan/pas` → click the *Ditolak* (Rejected) button. The table shows only rejected applications.

**6. Test the RPT-03 JUMLAH row.** Open `/laporan/penggunaan?year=<tahun ini>&month=<bulan ini>` (this year, this month). The JUMLAH row (bold, under the table) shows `3 zon` (or your number of zones). Calculate by hand: Σ *Hari-Slot Ditempah* (booked slot-days) ÷ Σ *Kapasiti* (capacity) × 100. The result must equal the JUMLAH row's *Penggunaan (%)*. If your zones differ in size, a plain average of the zone percentages gives a **different** number.

**7. Commit.** `git add app/ && git commit -m "RPT: ringkasan status (subquery + groupBy) & baris jumlah RPT-03"`; PowerShell: run `git add` and `git commit` one at a time

### ✅ Checkpoint
- [ ] `/laporan/tempahan` with no filters: the sum of the summary button numbers = "Jumlah rekod" = `SELECT COUNT(*) FROM slot_bookings` (Quiz S6).
- [ ] The Debug Toolbar *Database* tab shows the summary query `… FROM (SELECT …) r GROUP BY r.status` with the same `WHERE` as the list query (Quiz S6).
- [ ] Clicking a summary button filters by that status; the other filters stay and the page goes back to 1 (Quiz S6).
- [ ] RPT-03: the JUMLAH row = Σ slot-days ÷ Σ capacity × 100, the same as your hand calculation (Quiz S6).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Every derived table must have its own alias` | `fromSubquery()` without an alias, or an empty alias | `fromSubquery($this->builder($report, $filters), 'r')` |
| `Duplicate column name 'id'` | You added `u.id` (or another column with the same name) to the builder's `select()` | Every subquery column must be unique; use an alias, e.g. `u.id AS user_id` |
| The sum of the summary buttons ≠ "Jumlah rekod" after you choose a filter | The summary is counted straight from `table('slot_bookings')` | Use `$this->builder($report, $filters)` in `fromSubquery()` |
| `Undefined array key "summary"` in the view | The Lab 9.2 version of `paginate()` is still in use | Replace the whole `paginate()` (step 3) |
| The RPT-03 JUMLAH row changes when you click page 2 | `usageTotals()` receives the current page's rows | Pass `$all`, not `array_slice(...)` |
| Status *Menunggu* (Pending) appears after *Diluluskan* | The result is ordered by MySQL's order | Build `$rows` with the `cases()` loop, not `foreach ($counts …)` |

### ⭐ Bonus challenge
- Add a **pass type** summary for RPT-02 with the same pattern: a `passTypeSummary()` method (subquery + `groupBy('r.pass_type')`) and buttons that filter by `pass_type`. Can you make `statusSummary()` generic with a column parameter, without letting user input reach `groupBy()`?

---

## Lab 9.3b — Excel Summary sheet & PDF summary (S7)

### 🎯 Objective
- Add a second **Ringkasan** (Summary) sheet to the `.xlsx` file with `createSheet()`, a JUMLAH row as an `=SUM()` formula, and `setActiveSheetIndex(0)`.
- Add a status summary table to the PDF.
- Prove that the summary numbers in the files = the summary buttons on screen, because both call `statusSummary()` with the same `$filters`.

### Prerequisites
- [Lab 9.3](#lab-93--pdf-dompdf--excel-phpspreadsheet-export-s3) done: the six export files open.
- [Lab 9.2b](#lab-92b--status-summary--rpt-03-totals-row-s6) done: `statusSummary()` exists.

### Steps

**1. Add a `$summary` parameter** to both public methods in `app/Services/ExportService.php`. The default value `[]` keeps old calls working. Replace the `pdf()` signature line:

`app/Services/ExportService.php`

```php
    public function pdf(string $title, array $columns, iterable $rows, array $meta, array $summary = []): string
```

and the `xlsx()` signature line:

`app/Services/ExportService.php`

```php
    public function xlsx(string $title, array $columns, iterable $rows, array $meta, array $summary = []): string
```

**2. Pass `$summary` to the PDF view.** In `pdf()`, inside the `view('laporan/pdf', [...])` array, add this line directly after `'meta'    => $meta,`:

`app/Services/ExportService.php`

```php
            'summary' => $summary,   // Lab 9.3b
```

**3. Call the Summary sheet in `xlsx()`.** Add this block directly **before** the comment `// Tulis ke memori (bukan fail sementara) dan pulangkan string binari`:

`app/Services/ExportService.php`

```php
        // Lab 9.3b: lembaran kedua "Ringkasan" (RPT-01/02 sahaja; RPT-03 menghantar [])
        if ($summary !== []) {
            $this->addSummarySheet($spreadsheet, $summary);
        }
```

**4. Add `addSummarySheet()`** to `ExportService`, before the last `}` of the class:

`app/Services/ExportService.php`

```php
    /**
     * Lab 9.3b — lembaran "Ringkasan": satu baris setiap status + JUMLAH sebagai FORMULA Excel.
     *
     * @param list<array{value: string, label: string, total: int}> $summary hasil ReportService::statusSummary()
     */
    private function addSummarySheet(Spreadsheet $spreadsheet, array $summary): void
    {
        $sheet = $spreadsheet->createSheet();   // lembaran baharu di hujung (indeks 1)
        $sheet->setTitle('Ringkasan');

        $sheet->fromArray(['Status', 'Bilangan'], null, 'A1');
        $sheet->getStyle('A1:B1')->getFont()->setBold(true);
        $sheet->getStyle('A1:B1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DDEBF7');

        $r = 2;
        foreach ($summary as $s) {
            $sheet->setCellValueExplicit("A{$r}", $s['label'], DataType::TYPE_STRING);
            $sheet->setCellValue("B{$r}", $s['total']);   // nombor → boleh dijumlah
            $r++;
        }

        // Formula, bukan nombor PHP: jika pengguna mengubah angka di atas, Excel mengira semula JUMLAH.
        $sheet->setCellValue("A{$r}", 'JUMLAH');
        $sheet->setCellValue("B{$r}", '=SUM(B2:B' . ($r - 1) . ')');
        $sheet->getStyle("A{$r}:B{$r}")->getFont()->setBold(true);

        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);

        $spreadsheet->setActiveSheetIndex(0);   // fail dibuka pada lembaran data, bukan Ringkasan
    }
```

- Counts are written as **numbers** (they can be summed); labels are written explicitly as strings (as in Lab 9.3).
- JUMLAH is a **formula**. If a user corrects a number in Excel, JUMLAH is recalculated.

**5. Summary table in the PDF.** In `app/Views/laporan/pdf.php`, add this block directly after the line `<p style="margin-top: 8px; font-size: 8pt;">Jumlah rekod: …</p>`:

`app/Views/laporan/pdf.php`

```php
<?php if (($summary ?? []) !== []): ?>
    <!-- Lab 9.3b: ringkasan status — angka sama dengan butang "Ringkasan status" pada skrin -->
    <table style="width: 40%; margin-top: 6px;">
        <thead>
        <tr><th>Status</th><th style="width: 30%">Bilangan</th></tr>
        </thead>
        <tbody>
        <?php foreach ($summary as $s): ?>
            <tr><td><?= esc($s['label']) ?></td><td class="num"><?= number_format($s['total']) ?></td></tr>
        <?php endforeach ?>
        <tr><td><strong>JUMLAH</strong></td><td class="num"><strong><?= number_format(array_sum(array_column($summary, 'total'))) ?></strong></td></tr>
        </tbody>
    </table>
<?php endif ?>
```

**6. Wire it up in the controller.** In `export()` in `app/Controllers/Laporan/ReportController.php`, replace the `$binary = $format === 'pdf' ...` block (3 lines) with:

`app/Controllers/Laporan/ReportController.php`

```php
        // Lab 9.3b: ringkasan status bagi penapis yang SAMA — angka fail = butang ringkasan skrin. RPT-03 → [].
        $summary = $this->reports->statusSummary($report, $filters);

        $binary = $format === 'pdf'
            ? $this->exporter->pdf($title, $this->reports->columns($report), $rows, $meta, $summary)
            : $this->exporter->xlsx($title, $this->reports->columns($report), $rows, $meta, $summary);
```

**7. Test.**

1. `/laporan/tempahan?status=approved` → **Eksport Excel**. The file opens on the data tab. Click the **Ringkasan** tab: one *Diluluskan* row + JUMLAH, with the same number as the summary button on screen.
2. `/laporan/pas` (no filters) → **Eksport Excel** → **Ringkasan** tab → click the JUMLAH cell in column B. Write down what the formula bar shows (Quiz S7). Change one number above it → JUMLAH changes.
3. `/laporan/pas` → **Eksport PDF**. After "Jumlah rekod: *N*" there is a Status/Bilangan (Count) table; JUMLAH = *N*.
4. `/laporan/penggunaan` → **Eksport Excel**. Count the tabs at the bottom of the Excel window (Quiz S7).

**8. Commit.** `git add app/ && git commit -m "RPT: lembaran Ringkasan Excel & ringkasan PDF"`; PowerShell: run `git add` and `git commit` one at a time

### ✅ Checkpoint
- [ ] Excel RPT-01/RPT-02: a second *Ringkasan* tab whose number for each status = the summary button on screen, and the file opens on the data tab (Quiz S7).
- [ ] The JUMLAH cell is an `=SUM(...)` formula; changing one number changes JUMLAH (Quiz S7).
- [ ] PDF RPT-01/RPT-02: a Status/Bilangan table after "Jumlah rekod", and JUMLAH = "Jumlah rekod" (Quiz S7).
- [ ] The RPT-03 Excel file has only one tab (Quiz S7).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Call to undefined method App\Services\ReportService::statusSummary()` | Lab 9.2b is not done | Finish Lab 9.2b step 2 first |
| The Excel file opens on the *Ringkasan* tab | `setActiveSheetIndex(0)` is missing | Add the last line of `addSummarySheet()` |
| The PDF has no summary table and no error | `'summary' => $summary` is not passed in `pdf()` (the view gets `[]` through `?? []`) | Step 2 |
| The JUMLAH cell shows the text `=SUM(B2:B6)` | It was written with `setCellValueExplicit(..., TYPE_STRING)` | Write formulas with `setCellValue()` |
| No *Ringkasan* tab for RPT-01 with a filter that has no records | `statusSummary()` returns `[]` when there are no records | Expected — there is no status to summarise |
| Numbers in the file ≠ the summary buttons on screen | The summary is counted from the raw `$this->request->getGet()` | Pass `$filters` (the `normaliseFilters()` result), as `exportRows()` does |

### ⭐ Bonus challenge
- Add the RPT-03 JUMLAH row (`usageTotals()`) at the end of the RPT-03 export **without** changing the PDF "Jumlah rekod" (which counts the zones). Hint: pass the JUMLAH row as a separate parameter, not as a row in `$rows`.

---

## Lab 9.4b — Testing the summary, JUMLAH & Excel sheet (S8)

### 🎯 Objective
- Write 5 PHPUnit tests that compare the status summary with a direct SQL `GROUP BY` and with hand-calculated numbers, test the RPT-03 weighted average, and read back a real `.xlsx` file.
- Prove with two manual mutations that a test **without filters** can pass falsely.
- Update the `feat/laporan` MR with a new commit on the same branch.

### Prerequisites
- [Lab 9.4](#lab-94--test-report-total--sql-total--explain-s4) done: `ReportServiceTest` is green (7 tests) and the `feat/laporan` MR is open.
- [Lab 9.2b](#lab-92b--status-summary--rpt-03-totals-row-s6) and [Lab 9.3b](#lab-93b--excel-summary-sheet--pdf-summary-s7) done.

### Steps

**1. Add two `use` lines** in `tests/Services/ReportServiceTest.php`, after `use CodeIgniter\Test\DatabaseTestTrait;`:

`tests/Services/ReportServiceTest.php`

```php
use App\Services\ExportService;
use PhpOffice\PhpSpreadsheet\IOFactory;
```

**2. Calculate by hand first** from the Lab 9.4 fixture (5 bookings, 3 pass applications, Zone A 2 active slots, Zone B 1 active slot):

| Test | Hand answer |
|-------|----------------|
| RPT-01 summary, no filters | pending 1, approved 3, rejected 1 |
| RPT-01 summary, June 2026 | pending 1, approved 2, rejected 1 (total 4 = the list) |
| RPT-02 summary, September 2026 | submitted 1, under_review 1 |
| RPT-03 JUMLAH, June 2026 | 3 slots, 15 slot-days, capacity 90 → 16.7 % (not 12.5 %) |
| Excel *Ringkasan* sheet | 2 sheets; `B5` = `=SUM(B2:B4)` = 5 |

**3. Add 5 tests** to the class, directly after `testRpt03KadarPenggunaanJun2026()` and before the fixture comment `/** @var array<string, int> id rekod fixture …`:

`tests/Services/ReportServiceTest.php`

```php
    // =====================================================================
    // Lab 9.4b — Ringkasan status, baris JUMLAH RPT-03 & lembaran Ringkasan
    // =====================================================================

    public function testRingkasanStatusSamaDenganGroupBySql(): void
    {
        $f       = $this->service->normaliseFilters('tempahan', []);
        $summary = array_column($this->service->statusSummary('tempahan', $f), 'total', 'value');

        $sql = $this->db->table('slot_bookings')
            ->select('status')
            ->selectCount('id', 'total')
            ->groupBy('status')
            ->get()
            ->getResultArray();

        // assertEquals: susunan kunci tidak penting; intval kerana MySQLi memulangkan COUNT sebagai string
        $this->assertEquals(array_map('intval', array_column($sql, 'total', 'status')), $summary);
        // assertSame: nilai DAN susunan enum (Pending, Approved, Rejected)
        $this->assertSame(['pending' => 1, 'approved' => 3, 'rejected' => 1], $summary);
    }

    public function testRingkasanIkutJulatTarikhSamaDenganSenarai(): void
    {
        // Jun 2026: #1, #2 (approved), #3 (pending), #4 (rejected). #5 (Julai) di luar julat.
        $f       = $this->service->normaliseFilters('tempahan', ['from' => '2026-06-01', 'to' => '2026-06-30']);
        $summary = array_column($this->service->statusSummary('tempahan', $f), 'total', 'value');

        $this->assertSame(['pending' => 1, 'approved' => 2, 'rejected' => 1], $summary);
        $this->assertSame($this->service->paginate('tempahan', $f, 1)['total'], array_sum($summary));
    }

    public function testRingkasanPasIkutJulatSeptember(): void
    {
        // 30/09 14:00 termasuk; 01/10 00:00 (approved) di luar julat — penapis sama seperti senarai.
        $f       = $this->service->normaliseFilters('pas', ['from' => '2026-09-01', 'to' => '2026-09-30']);
        $summary = array_column($this->service->statusSummary('pas', $f), 'total', 'value');

        $this->assertSame(['submitted' => 1, 'under_review' => 1], $summary);
    }

    public function testJumlahRpt03IalahPurataBerwajaran(): void
    {
        $f      = $this->service->normaliseFilters('penggunaan', ['year' => '2026', 'month' => '6']);
        $totals = $this->service->paginate('penggunaan', $f, 1)['totals'];

        // Zon A 15/60 hari-slot (25.0 %) + Zon B 0/30 (0.0 %) → 15/90 = 16.7 %.
        // Purata peratus zon (25.0 + 0.0) / 2 = 12.5 % ialah SALAH: Zon B (1 slot) diberi berat sama dengan Zon A (2 slot).
        $this->assertSame(3, $totals['total_slots']);
        $this->assertSame(15, $totals['booked_days']);
        $this->assertSame(90, $totals['capacity_days']);
        $this->assertSame(16.7, $totals['utilisation']);
    }

    public function testEksportExcelAdaLembaranRingkasan(): void
    {
        $f      = $this->service->normaliseFilters('tempahan', []);
        $binary = (new ExportService())->xlsx(
            $this->service->title('tempahan'),
            $this->service->columns('tempahan'),
            $this->service->exportRows('tempahan', $f, 'xlsx'),
            ['filters' => 'Ujian', 'user' => 'Ujian', 'generated_at' => '01/01/2026 08:00'],
            $this->service->statusSummary('tempahan', $f),
        );

        // Baca semula fail .xlsx sebenar (bukan objek dalam memori) — inilah yang pengguna buka.
        $file = tempnam(WRITEPATH . 'cache', 'xlsx');
        file_put_contents($file, $binary);
        $book = IOFactory::createReader('Xlsx')->load($file);
        unlink($file);

        $this->assertSame(['RPT-01 Senarai Tempahan TLK', 'Ringkasan'], $book->getSheetNames());
        $this->assertSame(0, $book->getActiveSheetIndex());   // dibuka pada lembaran data

        $sheet = $book->getSheetByName('Ringkasan');
        $this->assertSame('=SUM(B2:B4)', $sheet->getCell('B5')->getValue());   // formula, bukan nombor tetap
        $this->assertSame(5, $sheet->getCell('B5')->getCalculatedValue());     // = 5 tempahan fixture
    }
```

```bash
composer test -- tests/Services/ReportServiceTest.php --testdox
```

**4. Mutation A — the summary query rewritten without filters.** In `statusSummary()`, temporarily replace the line `->fromSubquery($this->builder($report, $filters), 'r')` with:

```php
            // SENGAJA SALAH — jadual terus: penapis diabaikan
            ->from(($report === 'tempahan' ? 'slot_bookings' : 'pass_applications') . ' r')
```

Run again. Write down the tests that fail **and** the summary test that still passes (Quiz S8). Restore the original line → green.

**5. Mutation B — an unweighted average.** In `usageTotals()`, temporarily replace the line `'utilisation' => $capacity > 0 ? …` with:

```php
            // SENGAJA SALAH — purata peratus zon (tanpa wajaran)
            'utilisation'    => $rows === [] ? 0.0 : round(array_sum(array_column($rows, 'utilisation')) / count($rows), 1),
```

Run again and write down the failure message (Quiz S8). Restore → green.

**6. All tests.** `composer test` → all green, including the Day 5–8 tests.

**7. Commit & push to the same MR.**

```bash tab="Git Bash / macOS / Linux"
git add tests/ && git commit -m "RPT: ujian ringkasan status, jumlah RPT-03 & lembaran Excel"
git push    # MR feat/laporan dikemas kini — tiada MR baharu (Hari 4)
```

```powershell tab="PowerShell"
git add tests/
git commit -m "RPT: ujian ringkasan status, jumlah RPT-03 & lembaran Excel"
git push    # MR feat/laporan updated — no new MR (Day 4)
```

After the trainer/neighbour approves the review, **merge** the `feat/laporan` MR into `main` (M3 done; Day 10 starts from `main`).

### ✅ Checkpoint
- [ ] `composer test -- tests/Services/ReportServiceTest.php` → all green (≥ 12 tests: 7 from Lab 9.4 + 5 from Lab 9.4b) (Quiz S8).
- [ ] Mutation A: exactly two tests fail, and the summary test without filters still passes; restored (Quiz S8).
- [ ] Mutation B: `testJumlahRpt03IalahPurataBerwajaran` fails with the value `12.5`; restored (Quiz S8).
- [ ] The *Commits* tab of the `feat/laporan` MR shows the commit `RPT: ujian ringkasan status, …` (Quiz S8).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Class "Tests\Services\ExportService" not found` | The step 1 `use` lines are missing | Add the two `use` lines |
| `Failed asserting that two arrays are identical` with `'approved' => '3'` | `(int)` is missing in `statusSummary()`; MySQLi returns `COUNT` as a string | `'total' => (int) $counts[$case->value]` |
| `tempnam(): file created in the system's temporary directory` | `writable/cache/` is missing or not writable | Recreate the `writable/cache/` folder and make sure it is writable |
| Mutation A: no test fails | `ReportService.php` is not saved yet, or the filtered tests (June, September) were not added | Save the file; check that step 3 added **5** tests |
| `Failed asserting that 16.666666666666668 is identical to 16.7.` | `round(..., 1)` is missing in `usageTotals()` | Round as `usageByZone()` does |

### ⭐ Bonus challenge
- Add a test that `statusSummary('penggunaan', …)` returns `[]` and that the RPT-03 Excel export has only **one** sheet.

---

## Self-check — end of day

```bash
composer test                                                     # all green (including ReportServiceTest)
php spark laporan:explain tempahan approved 2026-06-01 2026-06-30 # EXPLAIN plan printed without errors
git status --short                                                # no output
git log --oneline -10                                             # today's RPT: commits
```

- [ ] `/laporan/tempahan`, `/laporan/pas` and `/laporan/penggunaan` load with GET filters; the RPT-01 "Jumlah rekod" (total records) for `status=approved` = the SQL `COUNT(*)` (Quiz S2).
- [ ] `?export=pdf` and `?export=xlsx` download files that open, for all three reports; `pemohon1@latihan.test` is refused (Quiz S3).
- [ ] `composer test` is green, including `tests/Services/ReportServiceTest.php` (≥ 7 tests) (Quiz S4).
- [ ] `php spark laporan:explain tempahan approved 2026-06-01 2026-06-30` shows a `key` that is not `NULL` for table `b` (Quiz S4).
- [ ] `git status --short` is empty and the `feat/laporan` branch has been pushed (MR to `main` opened) (Quiz S4).
- [ ] The **Bulan ini / Bulan lepas / Tahun ini** buttons and the active filter chips work on all three reports (Lab 9.1b) (Quiz S5).
- [ ] The RPT-01/RPT-02 status summary buttons add up to "Jumlah rekod", and the RPT-03 JUMLAH row is a weighted average (Lab 9.2b) (Quiz S6).
- [ ] The RPT-01/RPT-02 Excel files have a *Ringkasan* tab with an `=SUM()` formula, and the PDF has a summary table (Lab 9.3b) (Quiz S7).
- [ ] `ReportServiceTest` is green with ≥ 12 tests, and the Lab 9.4b commit is pushed to the `feat/laporan` MR (Lab 9.4b) (Quiz S8).
