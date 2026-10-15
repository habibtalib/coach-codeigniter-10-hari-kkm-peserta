# Day 10 Lab — Statistics (M4) & Capstone

[← Day 10 README](./README.md) · [SPEC canon](../SPEC-KURSUS.md) · [Schedule](../JADUAL.md) · [Capstone Rubric](../docs/rubrik-capstone.md)

> **Working branch:** `git switch main && git pull && git switch -c feat/statistik`
> **Commit prefix:** `STAT:` (dashboard/cache) · `FIX:` (UAT bug fixes)
> **Trainer reference code:** [`templates/kod/`](../templates/kod/) — `StatisticsService.php.txt`, `DashboardController.php.txt`, `dashboard-view.php.txt`, `Routes-laporan-statistik.php.txt`.

| Lab | Session | Duration | Outcome |
|-----|------|--------|-------|
| 10.1 | S1 | 75 min | `StatisticsService` (no cache) · `/statistik` + `/statistik/data` · 4 KPIs · 4 charts |
| 10.2 | S2 | 90 min | `remember()` · invalidation in `BookingService` & `PassWorkflowService` · `StatisticsCacheTest` |
| 10.3 | S3 | 85 min | UAT filled in · ≥ 1 bug fixed through a failing test · security checklist · tag `v1.0-capstone` |
| 10.4 | S4 | 75 min | 15-minute demo · retrospective |

---

## Lab 10.1 — Dashboard: KPIs + 4 Chart.js charts (S1)

### 🎯 Objective
- Write `StatisticsService::build()`, which returns 4 KPIs + 4 datasets.
- Build `/statistik` (HTML + KPI cards) and `/statistik/data` (JSON).
- Draw bar, doughnut, horizontal bar and line charts with Chart.js 4.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- M1, M2, M3 merged into `main`; `composer test` green.
- Enough seed data: `DemoDataSeeder` from Lab 9.1 step 0 (≥ 20 bookings, ≥ 15 Pass applications with various statuses & months).
- Internet for the Chart.js CDN (or a local copy — see 🧯).

### Steps

**1. Routes.** Add to `app/Config/Routes.php`:

```php
$routes->group('statistik', [
    'namespace' => 'App\Controllers\Statistik',
    'filter'    => 'permission:statistik.view',
], static function ($routes) {
    $routes->get('/', 'DashboardController::index', ['as' => 'statistik']);
    $routes->get('data', 'DashboardController::data', ['as' => 'statistik.data']);
});
```

```bash
php spark routes | grep statistik
# MSYS_NO_PATHCONV=1: Git Bash (Windows) does not turn /statistik into a C:/… path; no effect on macOS/Linux
MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik
```

**2. Service — start WITHOUT a cache.** Create `app/Services/StatisticsService.php`:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\PassStatus;
use CodeIgniter\Database\BaseConnection;
use DateTimeImmutable;

class StatisticsService
{
    public const CACHE_KEY = 'stat_dashboard';
    public const CACHE_TTL = 600;

    private const MONTHS_BM = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    private BaseConnection $db;
    private DateTimeImmutable $now;

    public function __construct(?BaseConnection $db = null, ?DateTimeImmutable $now = null, private ?ReportService $reports = null)
    {
        $this->db      = $db ?? db_connect();
        $this->now     = $now ?? new DateTimeImmutable();
        $this->reports ??= new ReportService($this->db);
    }

    public function dashboard(): array
    {
        return $this->build();          // Lab 10.2 will wrap this in cache()->remember()
    }

    public function build(): array
    {
        return [
            'generated_at' => $this->now->format('d/m/Y H:i:s'),
            'kpi'    => [ /* 4 KPIs */ ],
            'charts' => [ /* 4 datasets */ ],
        ];
    }
}
```

**3. Write the 4 KPIs** as private methods. Check the definitions in README §1.1. Two examples:

```php
private function activeBookings(): int
{
    return $this->db->table('slot_bookings')
        ->whereIn('status', BookingStatus::active())     // ['pending', 'approved'] — BR-TLK-04
        ->countAllResults();
}

private function avgDaysToApprove(): ?float
{
    $row = $this->db->table('pass_applications')
        ->select('AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) / 24 AS avg_days', false)
        ->where('approved_at IS NOT NULL')
        ->get()->getRowArray();

    return isset($row['avg_days']) ? round((float) $row['avg_days'], 1) : null;
}
```

Write `slotUtilisationToday()` (hint: `->select('slot_id')->distinct()->...->countAllResults()`) and `pendingPasses()` yourself.

**4. Write the 4 chart datasets.** Uniform format `['labels' => [...], 'data' => [...]]`:

| Method | Main query | Remember |
|--------|-------------|-------|
| `bookingsByMonth()` | `select('MONTH(created_at) AS m', false)->selectCount('id', 'total')->groupBy('m')` for the current year | **Zero-fill** all 12 months |
| `passStatus()` | `select('status')->selectCount('id', 'total')->groupBy('status')` | Follow `PassStatus::cases()`; return `keys` + `labels` |
| `usageByZone()` | **Reuse** `$this->reports->usageByZone(['year'=>..., 'month'=>..., 'sort'=>'utilisation', 'dir'=>'desc'])` | No new query |
| `passTrend12Months()` | `select("DATE_FORMAT(created_at, '%Y-%m') AS ym", false)` for the last 12 months | Zero-fill; label `Okt 25` |

Full reference: [`StatisticsService.php.txt`](../templates/kod/StatisticsService.php.txt).

**5. Register the service & a thin controller.** In `app/Config/Services.php`:

```php
public static function statisticsService(bool $getShared = true): \App\Services\StatisticsService
{
    if ($getShared) {
        return static::getSharedInstance('statisticsService');
    }

    return new \App\Services\StatisticsService();
}
```

```bash
php spark make:controller Statistik/DashboardController
```

```php
public function index(): string
{
    $stats = service('statisticsService')->dashboard();

    return view('statistik/dashboard', [
        'title'       => 'Dashboard Statistik',
        'kpi'         => $stats['kpi'],
        'generatedAt' => $stats['generated_at'],
    ]);
}

public function data(): ResponseInterface
{
    return $this->response
        ->setHeader('Cache-Control', 'no-store')
        ->setJSON(service('statisticsService')->dashboard());
}
```

**6. Check the JSON first, the charts later.** Log in as `pelulus@latihan.test` and open `http://localhost:8080/statistik/data`. Check: 12 values in `charts.bookings_by_month.data`, 5 in `charts.pass_status.data`, 12 in `charts.pass_trend.data`.

**7. View** `app/Views/statistik/dashboard.php`. **Save time (recommended):** S1 has only ~30 minutes of hands-on time — create this file and copy in the content of the template `templates/kod/dashboard-view.php.txt` (the trainer will share it) as your starting point, then read and adapt it; spend your time on writing `StatisticsService`. Make sure your view meets this list:
- 4 KPI cards (Bootstrap `card`, `col-sm-6 col-xl-3`) rendered from `$kpi` with `esc()`.
- 4 `<canvas>` elements, each inside `<div style="position: relative; height: 280px">`.
- In `<?= $this->section('scripts') ?>`: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>` (a **pinned** version — not an open `@4`; or the local copy `base_url('assets/vendor/chartjs/chart.umd.min.js')`, see 🧯) and a `fetch('<?= site_url('statistik/data') ?>')` script.
- A `draw()` function that calls `Chart.getChart(canvas)?.destroy()` before `new Chart(...)`.
- Third chart: `type: 'bar'` + `options.indexAxis: 'y'`.

Full reference: [`dashboard-view.php.txt`](../templates/kod/dashboard-view.php.txt).

**8. Menu.** In `layouts/main.php`, add the link only if `auth()->user()->can('statistik.view')`.

**9. Commit.** `git add -A && git commit -m "STAT: StatisticsService, dashboard KPI + 4 carta Chart.js"`

### ✅ Checkpoint 10.1
- [ ] `pelulus@latihan.test` and `admin@latihan.test` → `/statistik` shows 4 cards + 4 charts.
- [ ] `penyemak@latihan.test` and `pemohon1@latihan.test` → `/statistik` **and** `/statistik/data` are blocked.
- [ ] KPI "Tempahan aktif" (Active bookings) = the SQL result: `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');`
- [ ] The bar chart shows 12 months (months without data = an empty bar, not missing).
- [ ] The zone chart is a **horizontal** bar; the zone percentages = RPT-03 for the current month (`/laporan/penggunaan`).
- [ ] The browser console (F12) has no errors.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Uncaught ReferenceError: Chart is not defined` | The CDN script did not load (no internet/proxy) or the chart script runs before the CDN | Order: CDN first. No internet: download `chart.umd.min.js` (4.4.7) into `public/assets/vendor/chartjs/` and use `base_url('assets/vendor/chartjs/chart.umd.min.js')` |
| `Canvas is already in use. Chart with ID '0' must be destroyed before the canvas with ID 'chartX' can be reused.` | `new Chart()` called twice on the same canvas (e.g. a "Muat semula" (Reload) button) | `Chart.getChart(canvas)?.destroy()` before creating it |
| `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` | Session expired/no permission → Shield returns the login HTML | Check `res.ok` & `Content-Type` before `res.json()`; log in again |
| Chart is 0 px tall or keeps growing | No container with a fixed height | `<div style="position:relative;height:280px">` + `maintainAspectRatio: false` |
| The June bar appears in the March position | Empty months not zero-filled | `array_column(..., 'total', 'm')` + a loop over 1..12 |
| `Error 1055 ... only_full_group_by` on `DATE_FORMAT` | The GROUP BY expression differs from the SELECT | `groupBy('ym')` (alias) — MySQL allows GROUP BY on an alias |
| Average days = `null` → empty card/`number_format()` error | No Pass approved yet | The view shows `—` when `null` |

### ⭐ Bonus challenge
- Add a **Muat semula** (Reload) button that calls `load()` again (test that `destroy()` works).
- Click a zone bar → open `/laporan/penggunaan?year=…&month=…` (Chart.js `options.onClick`).

---

## Lab 10.2 — `remember()` cache & invalidation after status changes (S2)

### 🎯 Objective
- Wrap `dashboard()` in `cache()->remember('stat_dashboard', 600, fn)`.
- **Add** `cache()->delete(StatisticsService::CACHE_KEY)` after every status change in `BookingService` and `PassWorkflowService`.
- Prove the invalidation with an automated test that **fails** without the invalidation code.

### Prerequisites
- Lab 10.1 complete.
- `app/Config/Cache.php` → `$handler = 'file'` (default); `writable/cache/` is writable.

### Steps

**1. Measure BEFORE the cache.** Open `/statistik`, Debug Toolbar (the CI flame icon, bottom right) → **Database** tab. Note the number of queries & the time. Reload 3 times — the numbers stay the same.

**2. Wrap with `remember()`:**

```php
public function dashboard(): array
{
    return cache()->remember(self::CACHE_KEY, self::CACHE_TTL, fn (): array => $this->build());
}
```

**3. Measure AFTER.** Reload `/statistik` twice. Second request: the Database tab shows **no** aggregate queries; "Data dijana" (Data generated) does not change.

```bash
ls -la writable/cache/          # the stat_dashboard file exists
php spark cache:info            # handler & cache files
```

**4. Show the stale-data problem.** As `pelulus`, approve one Pass application at `/pas/semakan`. Go back to `/statistik` → the KPI "Pas menunggu" (Pending passes) **does not change**. Note the time. (This is the bug we will fix.)

**5. Write a FAILING test first.** Create `tests/Services/StatisticsCacheTest.php`:

```php
<?php

declare(strict_types=1);

namespace Tests\Services;

use App\Services\BookingService;
use App\Services\StatisticsService;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;

final class StatisticsCacheTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate   = true;
    protected $refresh   = true;
    protected $namespace = null;

    protected function setUp(): void
    {
        parent::setUp();
        cache()->delete(StatisticsService::CACHE_KEY);   // start clean — the file cache persists between tests!
    }

    public function testDashboardDisimpanDalamCache(): void
    {
        $this->assertNull(cache()->get(StatisticsService::CACHE_KEY));

        (new StatisticsService())->dashboard();

        $this->assertIsArray(cache()->get(StatisticsService::CACHE_KEY));
    }

    public function testKelulusanTempahanMengosongkanCache(): void
    {
        $bookingId = $this->createPendingBooking();
        (new StatisticsService())->dashboard();                          // fill the cache
        $this->assertNotNull(cache()->get(StatisticsService::CACHE_KEY));

        (new BookingService())->approve($bookingId, actorId: 1);

        $this->assertNull(
            cache()->get(StatisticsService::CACHE_KEY),
            'Cache mesti dikosongkan selepas status berubah',
        );
    }

    private function createPendingBooking(): int
    {
        $db = $this->db;
        $db->table('users')->insert(['username' => 'pelulus-ujian', 'active' => 1, 'full_name' => 'Pelulus Ujian']);
        $db->table('parking_zones')->insert(['code' => 'ZT', 'name' => 'Zon Ujian', 'location' => 'Blok T']);
        $db->table('parking_slots')->insert(['zone_id' => $db->insertID(), 'slot_no' => 'T01', 'category' => 'oku', 'is_active' => 1]);
        $slotId = (int) $db->insertID();
        $db->table('vehicles')->insert(['user_id' => 1, 'plate_no' => 'WXX 7001', 'model' => 'Myvi', 'color' => 'Putih']);
        $db->table('slot_bookings')->insert([
            'ref_no'     => 'TLK-2026-7001', 'user_id' => 1, 'vehicle_id' => (int) $db->insertID(), 'slot_id' => $slotId,
            'start_date' => date('Y-m-d', strtotime('+1 day')), 'end_date' => date('Y-m-d', strtotime('+5 days')),
            'reason'     => 'Data ujian sintetik', 'status' => 'pending',
        ]);

        return (int) $db->insertID();
    }
}
```

```bash
composer test -- tests/Services/StatisticsCacheTest.php
```

Expected: `testKelulusanTempahanMengosongkanCache` **FAILS** — *"Cache mesti dikosongkan selepas status berubah"* ("The cache must be cleared after the status changes"). Good: the test catches the bug from step 4.

**6. Add invalidation in `BookingService`.** Open `app/Services/BookingService.php`. Add a `use` if needed (the class is in the same namespace — not needed) and put **one line** after **every** `$this->db->transCommit();`:

```php
            $this->db->transCommit();
            cache()->delete(StatisticsService::CACHE_KEY);   // Day 10: invalidate AFTER the commit
```

Places where it must go (in the Day 5–6 reference template):

| Method | Transition | Why |
|--------|-----------|--------|
| `create()` | `null → pending` | "Tempahan aktif" (Active bookings) goes up |
| `transition()` (called by `approve()`, `reject()`, `cancel()`) | `pending → approved/rejected`, `approved → cancelled` | KPIs & charts change |

**7. Add invalidation in `PassWorkflowService`.** The same — after `$this->db->transCommit();` in:

| Method | Transition |
|--------|-----------|
| `submit()` | `null → submitted` ("Pas menunggu" (Pending passes) +1) |
| `transition()` (called by `startReview()`, `approve()`, `reject()`, `expire()`) | all other transitions, including `pas:expire` |

> ✋ **Stop & think (2 min, in pairs):** Why not inside the `try` block **before** `transCommit()`? Why not in the controller? Write your answer in the commit message. (Answer: README §2.4; the controller is not the only caller — the Spark command `pas:expire` does not go through a controller.)

**8. Run it again.**

```bash
composer test -- tests/Services/StatisticsCacheTest.php     # green
composer test                                                # ALL green — no regressions
```

**9. Repeat step 4 manually.** Approve another Pass application → `/statistik` → "Pas menunggu" (Pending passes) drops **immediately**; "Data dijana" (Data generated) = the current time.

**10. Commit.** `git add app/ tests/ && git commit -m "STAT: cache dashboard 10 minit + invalidasi selepas commit status (TLK & PAS)"`

### ✅ Checkpoint 10.2
- [ ] Second reload of `/statistik` → 0 aggregate queries in the Debug Toolbar.
- [ ] `StatisticsCacheTest` **was red** (step 5) and is now **green** (step 8) — show the trainer in the terminal history.
- [ ] `grep -n "CACHE_KEY" app/Services/*.php` → at least 4 hits in `BookingService`/`PassWorkflowService` (2 each) and **no** typed `'stat_dashboard'` string outside `StatisticsService`.
- [ ] Every `cache()->delete(...)` is **after** `transCommit()`.
- [ ] You can explain 1 advantage & 1 disadvantage of "TTL + delete" compared with "TTL only".

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Cache unable to write to "…/writable/cache/"` | Folder permissions | `chmod -R 775 writable/cache` (Linux/macOS); Windows: make sure the folder is not read-only |
| The test passes even without invalidation | The cache is empty from the start → `assertNotNull` is not checked, or the test does not fill the cache | Make sure `dashboard()` is called & `assertNotNull` runs before `approve()` |
| Other tests suddenly fail with old numbers | Cache file from an earlier test persists (the `file` handler is shared) | `cache()->delete(...)` in `setUp()`; or `php spark cache:clear` |
| Dashboard still stale after an approval | `delete()` placed in another controller / one path missed / key misspelled | Use `StatisticsService::CACHE_KEY`; put it in the service's `transition()` |
| `Class "App\Services\StatisticsService" not found` in BookingService | Wrong namespace | Both are in `App\Services` — no `use` needed; check the spelling |
| `Serialization of 'Closure' is not allowed` | Objects/closures stored in the cache data | `build()` must return **scalar arrays** only |

### ⭐ Bonus challenge
- Replace the direct calls with **Events**: in the service `Events::trigger('status_changed', 'TLK', $id)`; in `app/Config/Events.php` → `Events::on('status_changed', static fn () => cache()->delete(StatisticsService::CACHE_KEY));`. Discuss: advantage (the service knows nothing about statistics) vs disadvantage (the flow is harder to trace).
- Add a test for `PassWorkflowService::approve()` (needs a Shield `User` with the `pas.approve` permission — see `PassAccessTest` from Day 8).

---

## Lab 10.3 — Final system testing (UAT), bug fixing & security (S3)

### 🎯 Objective
- Run the 15-step UAT script (covering scenarios UAT-01..UAT-10) across the 4 modules and 5 accounts.
- Fix at least one bug through the cycle *reproduce → failing test → fix → pass*.
- Complete the K1–K10 security checklist.

### Prerequisites
- Labs 10.1 & 10.2 complete and merged into `main`.
- Create the file `docs/UAT-signoff.md` and copy in the content of the template `templates/dokumen/uat-signoff-templat.md` (the trainer will share it).
- Create the file `docs/kes-ujian-akhir.md` and copy in the content of the template `templates/dokumen/kes-ujian-templat.md` (the trainer will share it).
- Clean database: `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder`.

### Steps

**1. Prepare 5 windows** (incognito/separate profiles): `pemohon1`, `pemohon2`, `penyemak`, `pelulus`, `admin` (password `Latihan@2026`).

**2. Run the UAT script** in README §3.2 (15 steps) **in order**. The driver clicks; the recorder fills in the *Keputusan* (Result) & *Catatan* (Notes) columns in `docs/UAT-signoff.md` §4 (UAT-01..UAT-10). The last column of the README §3.2 table maps each step to a UAT ID (e.g. steps 1 & 5 → UAT-01; steps 4, 6, 11 & 15 → UAT-10). Mark a UAT ID ✅ only if **all** the steps mapped to it pass. Target time: 35 minutes.

**3. Record every failure** in the *Bug log* (`docs/kes-ujian-akhir.md`) — `BUG-001`, `BUG-002`, … with severity High/Medium/Low. **Don't fix anything yet.**

**4. Pick the highest-severity bug** and run the cycle:

```bash
git switch -c fix/bug-001-<ringkas>
```

| Step | Action | Evidence |
|---------|----------|-------|
| a. Reproduce | Write the exact steps + data in the bug log | A colleague can repeat it in < 2 min |
| b. Failing test | Write a PHPUnit test (unit/service or `FeatureTestTrait`) | `composer test -- --filter <namaUjian>` **red** — keep a terminal screenshot |
| c. Fix | A **minimal** change | A small & focused `git diff` |
| d. Pass | That test is green **+** all of `composer test` is green | Terminal screenshot |
| e. Commit | `git add app/ tests/ docs/ && git commit -m "FIX: <ringkasan> (BUG-001)"` → merge | Bug log: *Closed* |

> **No bugs found?** The trainer will give you a "planted bug" (see the BUG-007 example in README §3.3). Practise the full cycle on that bug.

**5. Security checklist K1–K10** (README §3.4), ~10 minutes. Tick K1–K10 yourselves: run the evidence commands below (K2, K3, K4, K5, K7) and check the remaining Ks visually. The trainer then **spot-checks 3 Ks** on your machine — K3 always, plus 2 of the trainer's choice — so every tick must be provable on the spot.

```bash
# K2 — output without esc() (every remaining line must be justified; ignore app/Views/errors/)
grep -rnF '<?= $' app/Views | grep -vF 'esc(' | grep -vF '$this->'

# K3 — .env never went into Git
git ls-files | grep -E "(^|/)\.env$"
git log --all --oneline -- .env

# K4 — no uploaded files in public/
find public -type f \( -name "*.pdf" -o -name "*.jpg" -o -name "*.png" \) | grep -v assets

# K5 — a filter on every protected route
php spark routes
MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik
MSYS_NO_PATHCONV=1 php spark filter:check GET /laporan/tempahan

# K7 — raw queries (every hit must use ? bindings; justified exception: EXPLAIN in
#      app/Commands/ReportExplain.php — SQL compiled by the Query Builder, no web user input)
grep -rn -e '->query(' app/
```

Tick each K in `docs/UAT-signoff.md` §5/§6 (or an appendix).

**6. Prepare for the demo.**

```bash
composer test                              # green
git switch main && git pull
git add docs/ && git commit -m "SETUP: UAT-signoff, log pepijat & senarai semak K1–K10"
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

Write a **1-page demo script** (following the format in README §4.1) and make sure both members can explain any file.

### ✅ Checkpoint 10.3
- [ ] `docs/UAT-signoff.md` §4: UAT-01..UAT-10 are all marked (✅/❌/⚠️) — no ⬜.
- [ ] All **Critical** scenarios are ✅, or every ❌ has a Bug-ID and an action plan.
- [ ] ≥ 1 bug closed with **red → green** test evidence.
- [ ] K1–K10 ticked with command evidence.
- [ ] Tag `v1.0-capstone` exists: `git tag -l`.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| Logging in as a second role replaces the first role's session | Normal tabs share the session cookie | Use incognito windows / separate browser profiles |
| UAT fails because of yesterday's data (e.g. slot already booked) | The DB is not clean | `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder` |
| `The action you requested is not allowed.` during UAT | Form left open too long → CSRF token expired, or `csrf_field()` missing | Reload the form; if it keeps happening, check that the form has `csrf_field()` |
| Feature test fails with `Config\Security::$csrfProtection is set to 'cookie'` | Shield configuration | `app/Config/Security.php` → `$csrfProtection = 'session'` (Day 4) |
| Tests pass on your machine but fail on your partner's | Depends on seed data/today's date | Own fixtures in the test; relative (`+1 day`) or fixed dates |
| `git tag` rejected: *already exists* | Tag created before the fix | `git tag -d v1.0-capstone && git tag -a v1.0-capstone -m "…"` (before pushing) |

### ⭐ Bonus challenge
- Write a `FeatureTestTrait` test for UAT-08: `applicant` → `GET /statistik` and `/laporan/tempahan` → not 200.
- Run `composer audit` and discuss the results.

---

## Lab 10.4 — Capstone demo & retrospective (S4)

### 🎯 Objective
- Demo the system end to end in 15 minutes, following the format.
- Explain one line of code chosen by the panel.
- Contribute ≥ 3 retrospective cards (Start/Stop/Continue).

### Prerequisites
- Checkpoint 10.3 passed; tag `v1.0-capstone`.
- Clean demo DB + seed; 5 logged-in windows ready; 1-page demo script.
- Read [`docs/rubrik-capstone.md`](../docs/rubrik-capstone.md).

### Steps

**1. 10 minutes before your turn:** `php spark serve` running; browser zoom 125 %; notifications off; `docs/UAT-signoff.md` open.

**2. 15-minute demo** — follow the segment schedule in README §4.1. The panel's timekeeper will signal at minutes 4, 7, 9, 11 and 13.

**3. "Explain the code" segment (minutes 11–13).** The panel picks one file and one line (e.g. `ReportService::applySort()`, `BookingService::transition()`, `dashboard.php` `draw()`). **Either** member of the pair answers: *what does this line do, why is it here, what happens if it is removed?*

**4. Q&A (minutes 13–15).** Answer honestly — "we didn't get to it yet, our plan is …" is worth more than guessing.

**5. Retrospective.** Write ≥ 1 card for each column **Start / Stop / Continue** (yellow card = yourself, blue card = the course). Stick them on the board. Vote with 3 dots on the cards that matter most.

**6. Hand over the repo.** Send the repo link / zip archive (without `vendor/`, without `.env`, without `writable/uploads/`) to the trainer.

### ✅ Checkpoint 10.4
- [ ] Demo finished in ≤ 15 minutes; all four modules shown.
- [ ] The panel signs the pair's score sheet.
- [ ] ≥ 3 retrospective cards posted.
- [ ] Repo handed over.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `php spark serve` fails: *Address already in use* | Another server on port 8080 | `php spark serve --port 8081` and `app.baseURL = 'http://localhost:8081/'` in `.env` |
| Charts empty during the demo | No internet for the CDN | Local copy of `chart.umd.min.js` (Lab 10.1 🧯) — prepare it before the demo |
| Forgot the synthetic account password | — | `Latihan@2026` (SPEC §4) |
| Time runs out before M4 | Too long on M1 | Follow the script; if you are behind at minute 7, jump straight to Reports |

### ⭐ Bonus challenge
- Record a 3-minute demo (screen capture + voice) as handover material for your supervisor.

---

## Self-check — end of day

```bash
composer test         # all green (including StatisticsCacheTest)
git log --oneline -8  # today's STAT: and FIX: commits
git tag -l            # v1.0-capstone
git status --short    # no output
```

- [ ] `pelulus@latihan.test` → `/statistik` shows 4 KPI cards + 4 charts; `/statistik/data` returns JSON with 12 values in `charts.bookings_by_month.data`.
- [ ] `penyemak@latihan.test` → `/statistik` and `/statistik/data` are blocked.
- [ ] `composer test` is green, including `tests/Services/StatisticsCacheTest.php`.
- [ ] `docs/UAT-signoff.md` §4: UAT-01..UAT-10 has no ⬜; `git log --oneline` shows ≥ 1 `FIX:` commit.
- [ ] `git tag -l` shows `v1.0-capstone` and `git status --short` is empty.
