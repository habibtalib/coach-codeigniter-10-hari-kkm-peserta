# Lab Day 9 — Report Module (M3)

[← Day 9 README](./README.md) · [SPEC canon](../docs/spesifikasi-sistem.md) · [Schedule](../JADUAL.md) · [⚡ spark commands](../docs/arahan-spark.md)

> **Working branch:** `git switch main && git pull && git switch -c feat/laporan`
> **Commit prefix:** `RPT:` · **Trainer reference code:** `templates/kod/` (**Templat & Rujukan** module) (use it to **check**, not to copy wholesale — you must be able to explain every line).

| Lab | Session | Duration | Outcome |
|-----|---------|----------|---------|
| 9.1 | S1 | 70 min | Spec cards RPT-01..03 · routes · skeleton controller · GET filter form |
| 9.2 | S2 | 90 min | Full `ReportService` · paginated table for 3 reports |
| 9.3 | S3 | 75 min | `ExportService` · working PDF & Excel export buttons |
| 9.4 | S4 | 60 min | `ReportServiceTest` green · EXPLAIN · **M3 done** |

---

## Lab 9.1 — Report design & GET filter form (S1)

### 🎯 Objective
- Write spec cards for RPT-01, RPT-02, RPT-03.
- Build the `/laporan/*` routes protected by `permission:laporan.view`.
- Build a `GET` filter form that keeps its values after it is submitted.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
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

```bash
php spark routes | grep laporan
```

**3. Create a skeleton controller.**

```bash
php spark make:controller Laporan/ReportController
```

For now, make `bookings()`, `passes()`, `usage()` return `view('laporan/index', [...])` with empty data. The full controller is built in Lab 9.2.

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

Full reference: `report-filter-view.php.txt` (**Templat & Rujukan** module).

**5. Add a menu link** in `layouts/main.php` only if the user has the permission:

```php
<?php if (auth()->loggedIn() && auth()->user()->can('laporan.view')): ?>
    <li class="nav-item"><a class="nav-link" href="<?= url_to('laporan.tempahan') ?>">Laporan</a></li>
<?php endif ?>
```

> Hiding the menu is only a **UI convenience**. The real control is the route filter in step 2.

**6. Commit.** `git add -A && git commit -m "RPT: laluan, controller rangka & borang penapis GET"`

### ✅ Checkpoint 9.1
- [ ] `php spark routes | grep laporan` shows 3 routes with the `permission:laporan.view` filter.
- [ ] Log in as `pemohon1@latihan.test` → `/laporan/tempahan` is **denied** (the Shield filter *redirects*, no data shown). As `penyemak@latihan.test` → allowed.
- [ ] Choose a status + dates → click **Tapis** (Filter) → the URL contains `?from=...&status=...` and the dropdown **still** shows the choice you made.
- [ ] Spec cards complete for the 3 reports and checked by the trainer.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Class "App\Controllers\Laporan\ReportController" not found` | The namespace in the file does not match the folder | First line: `namespace App\Controllers\Laporan;` · file in `app/Controllers/Laporan/` |
| Every user (including admin) is denied | Permission misspelt, e.g. `laporan.views` | Check `app/Config/AuthGroups.php` → `$matrix` (SPEC §4) |
| The dropdown goes back to "Semua" (All) after filtering | No `selected` attribute / comparing an int with a string | Compare as strings: `(string) $a === (string) $b` |
| `The action you requested is not allowed` | The form has `method="post"` by mistake | Change it to `get` |

### ⭐ Bonus challenge
- Add quick buttons "Bulan ini" (This month) and "Bulan lepas" (Last month) that fill `from`/`to` (plain GET links — no JavaScript).

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

class ReportService
{
    public const PER_PAGE = 20;

    private BaseConnection $db;

    public function __construct(?BaseConnection $db = null)
    {
        $this->db = $db ?? db_connect();
    }
}
```

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

Core helper (see `ReportService.php.txt` (**Templat & Rujukan** module) §1 and §Pembantu (Helpers)):

```php
private function validDate(?string $value): ?string
{
    if ($value === null) {
        return null;
    }
    $d = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);

    return ($d !== false && $d->format('Y-m-d') === $value) ? $value : null;
}
```

Quick check: temporarily put `dd($filters);` in the controller, open the URL with various inputs in the browser, then **remove** the `dd()` before you commit.

**3. Write `bookingsBuilder()` (RPT-01)** — 4 joins + 5 `when()`. Note that the date range uses the overlap condition of BR-TLK-01 (TLK = Special Vehicle Parking — *Tempat Letak Kenderaan Khas*):

```php
->when($f['to'] ?? null,   static fn (BaseBuilder $q, string $to)   => $q->where('b.start_date <=', $to))
->when($f['from'] ?? null, static fn (BaseBuilder $q, string $from) => $q->where('b.end_date >=', $from))
```

**4. Write `passesBuilder()` (RPT-02)** — `departments` must be a **LEFT** join; the `created_at` range is half-open:

```php
->join('departments d', 'd.id = u.department_id', 'left')
->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where(
    'p.created_at <',
    (new \DateTimeImmutable($to))->modify('+1 day')->format('Y-m-d 00:00:00'),
))
```

**5. Write `applySort()` with a whitelist + `id` as the second sort key:**

```php
private const SORTABLE = [
    'tempahan' => ['ref_no' => 'b.ref_no', 'zone' => 'z.code', 'start_date' => 'b.start_date',
                   'end_date' => 'b.end_date', 'status' => 'b.status'],
    'pas'      => ['ref_no' => 'p.ref_no', 'department' => 'd.name', 'pass_type' => 'p.pass_type',
                   'status' => 'p.status', 'created_at' => 'p.created_at'],
];
```

**6. Write `paginate()`:**

```php
$builder = $this->builder($report, $filters);
$total   = $builder->countAllResults(false);          // false: do not reset the builder
$rows    = $this->applySort($builder, $report, $filters)
    ->limit($perPage, ($page - 1) * $perPage)
    ->get()->getResultArray();
```

Then `formatRow()` turns enum values → Malay labels and dates → `d/m/Y`.

**7. Write `usageByZone()` (RPT-03)** — two aggregate queries + merge in PHP. Check the formula against the example in README §1.2 (Zone A June = 25.0 %).

**8. Register the service & complete the controller** (thin!). In `app/Config/Services.php` (same pattern as `bookingService`, Day 6):

```php
public static function reportService(bool $getShared = true): \App\Services\ReportService
{
    if ($getShared) {
        return static::getSharedInstance('reportService');
    }

    return new \App\Services\ReportService();
}
// exportService() — same pattern (Lab 9.3)
```

In the controller: `$this->reports = service('reportService');` (in `__construct()`). One private method `handle($report)` for all three reports:

```php
private function handle(string $report): string|ResponseInterface
{
    $filters = $this->reports->normaliseFilters($report, $this->request->getGet() ?? []);
    // (export is added in Lab 9.3)
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
```

**9. Table + pagination in the view:**

```php
<?php foreach ($result['rows'] as $row): ?>
    <tr>
        <?php foreach (array_keys($columns) as $key): ?>
            <td><?= esc((string) ($row[$key] ?? '')) ?></td>
        <?php endforeach ?>
    </tr>
<?php endforeach ?>
...
<?= $pager->makeLinks($result['page'], $result['perPage'], $result['total']) ?>
```

**10. Commit.** `git add app/ && git commit -m "RPT: ReportService (join, when, groupBy, selectCount) + pagination"`

### ✅ Checkpoint 9.2
- [ ] `/laporan/tempahan?status=approved` → "Jumlah rekod" (total records) is **the same** as the SQL result:
  ```sql
  SELECT COUNT(*) FROM slot_bookings WHERE status = 'approved';
  ```
- [ ] Filter by status + zone → click page 2 → the URL still contains `status=...&zone_id=...&page=2`.
- [ ] `/laporan/pas?to=<hari ini>` (`<hari ini>` = today's date) shows the applications you submitted **today** (proof of the half-open range).
- [ ] `/laporan/tempahan?sort=nonsense` does not error — it falls back to the default sort order.
- [ ] `/laporan/penggunaan?year=2026&month=6` shows every zone (including zones without bookings = 0.0 %).
- [ ] Thin controller: each method only reads filters → calls `ReportService` → view/export (no queries, joins or calculations); no `$this->db` in the controller.

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
- Add a **totals** row under RPT-03 (total slots, total slot-days, weighted average usage).

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

```bash
composer require dompdf/dompdf phpoffice/phpspreadsheet
git add composer.json composer.lock && git commit -m "RPT: tambah dompdf & phpspreadsheet"
```

**2. Create `app/Services/ExportService.php`** and register `exportService()` in `app/Config/Services.php` (same pattern as `reportService()`). Two public methods:

```php
public function pdf(string $title, array $columns, iterable $rows, array $meta): string
public function xlsx(string $title, array $columns, iterable $rows, array $meta): string
```

`$meta = ['filters' => 'ringkasan penapis', 'user' => 'nama pengguna', 'generated_at' => 'd/m/Y H:i']` (filter summary, user name, generation time). Both return a **binary string**; the controller sends the response. Reference: `ExportService.php.txt` (**Templat & Rujukan** module).

**3. Create the PDF view** `app/Views/laporan/pdf.php` — plain HTML, **without** the Bootstrap layout:

```html
<style>
    @page  { margin: 85px 28px 50px 28px; }
    body   { font-family: "DejaVu Sans", sans-serif; font-size: 8.5pt; }
    header { position: fixed; top: -70px; left: 0; right: 0; height: 60px; border-bottom: 1px solid #999; }
    footer { position: fixed; bottom: -35px; left: 0; right: 0; height: 20px; border-top: 1px solid #999; }
    thead  { display: table-header-group; }
</style>
<header><h1><?= esc($title) ?></h1><div>Penapis: <?= esc($meta['filters']) ?></div></header>
<footer>Dijana pada <?= esc($meta['generated_at']) ?> oleh <?= esc($meta['user']) ?></footer>
```

Full reference: `report-pdf-view.php.txt` (**Templat & Rujukan** module).

**4. Add `exportRows()` to `ReportService`** — count first, reject if over the limit, then return a Generator:

```php
public const EXPORT_LIMIT = ['pdf' => 2000, 'xlsx' => 10000];

public function exportRows(string $report, array $filters, string $format): iterable
{
    // ... $builder = $this->builder($report, $filters);
    $total = $builder->countAllResults(false);
    if ($total > self::EXPORT_LIMIT[$format]) {
        throw new \LengthException("Terlalu banyak rekod ({$total}). Sila kecilkan julat penapis.");
    }
    return $this->streamRows($report, $this->applySort($builder, $report, $filters));
}
```

**5. Wire it into the controller** — at the start of `handle()`:

```php
$export = $this->request->getGet('export');
if ($export === 'pdf' || $export === 'xlsx') {
    return $this->export($report, $filters, $export);
}
```

and in `export()`:

```php
$binary   = $format === 'pdf'
    ? $this->exporter->pdf($title, $columns, $rows, $meta)
    : $this->exporter->xlsx($title, $columns, $rows, $meta);
$filename = sprintf('laporan-%s-%s.%s', $report, date('Ymd-His'), $format);

return $this->response->download($filename, $binary, true);   // true = guess the MIME type from the extension
```

Catch `LengthException` → `redirect()->to(current_url() . '?' . http_build_query($query))->with('error', $e->getMessage())`.

**6. Test all three reports × two formats** (6 files). Open each file and go through the list in the Checkpoint.

The seeder gives staff numbers `LT0001`–`LT0005` (no leading zeros). To test leading zeros in Excel, change the staff number of `pemohon2` (who has pass applications from `DemoDataSeeder`) to `001234`, then export RPT-02:

```bash
mysql -u kkm_dev -p -e "UPDATE users SET staff_no = '001234' WHERE username = 'pemohon2'" kkm_latihan
```

🪟 If the password prompt does not appear in Git Bash: `winpty mysql …` (as on Day 6).

**7. Commit.** `git add app/ && git commit -m "RPT: eksport PDF (Dompdf) & Excel (PhpSpreadsheet)"`

### ✅ Checkpoint 9.3
- [ ] Filter RPT-01 by `status=approved` → screen: *N* records → PDF: "Jumlah rekod: *N*" → Excel: *N* data rows (rows 6 to 5+*N*). **All three numbers match.**
- [ ] PDF: A4 **landscape**; the header repeats on every page; footer "Dijana pada … oleh *your name*"; "Muka 1 / 3" (Page 1 / 3) in the bottom-right corner.
- [ ] PDF: names with special characters (e.g. add a synthetic user "Nur'aini Ābdul") display correctly — not `?`.
- [ ] Excel: the header row is **bold**; columns are wide enough; scroll down → the header stays (frozen); No. Pekerja (staff number) `001234` keeps its leading zeros.
- [ ] File name: `laporan-tempahan-20260925-143012.pdf`.
- [ ] Log in as `pemohon1@latihan.test` and open `/laporan/pas?export=xlsx` directly → **denied**.

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

Full reference: `ReportServiceTest.php.txt` (**Templat & Rujukan** module).

**4. Run them.**

```bash
composer test -- tests/Services/ReportServiceTest.php --testdox
```

**5. Prove the tests catch bugs (manual mutation).** Temporarily change `passesBuilder()`:

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

**8. Commit & merge.**

```bash
git add -A && git commit -m "RPT: ujian jumlah laporan = SQL + arahan laporan:explain"
git push -u origin feat/laporan    # open an MR to main → trainer/neighbour comments → you merge
```

### ✅ Checkpoint 9.4 — **M3 done**
- [ ] `composer test -- tests/Services/ReportServiceTest.php` → all green (≥ 7 tests).
- [ ] The mutation in step 5 makes exactly **one** test fail; it has been restored.
- [ ] The output of `laporan:explain tempahan approved` shows `key = status` (or another index) for table `b` — not `type = ALL`.
- [ ] You can explain to the trainer why RPT-02 with only a date filter shows `type = ALL` on `p`.
- [ ] DoD KOLABORASI §2 ticked for M3.

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

## Self-check — end of day

```bash
composer test                                                     # all green (including ReportServiceTest)
php spark laporan:explain tempahan approved 2026-06-01 2026-06-30 # EXPLAIN plan printed without errors
git status --short                                                # no output
git log --oneline -5                                              # today's RPT: commits
```

- [ ] `/laporan/tempahan`, `/laporan/pas` and `/laporan/penggunaan` load with GET filters; the RPT-01 "Jumlah rekod" (total records) for `status=approved` = the SQL `COUNT(*)`.
- [ ] `?export=pdf` and `?export=xlsx` download files that open, for all three reports; `pemohon1@latihan.test` is refused.
- [ ] `composer test` is green, including `tests/Services/ReportServiceTest.php` (≥ 7 tests).
- [ ] `php spark laporan:explain tempahan approved 2026-06-01 2026-06-30` shows a `key` that is not `NULL` for table `b`.
- [ ] `git status --short` is empty and the `feat/laporan` branch has been pushed (MR to `main` opened).
