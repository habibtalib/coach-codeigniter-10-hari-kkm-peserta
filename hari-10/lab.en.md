# Day 10 Lab — Statistics (M4) & Capstone

[⬅️ README](./README.md) · [Schedule](../JADUAL.md) · [SPEC canon](../docs/spesifikasi-sistem.md) · 🧩 Code templates (**Templat & Rujukan** module) · [Capstone Rubric](../docs/rubrik-capstone.md) · [⚡ spark commands](../docs/arahan-spark.md)

**Working branch:** `git switch main && git pull && git switch -c feat/statistik` (PowerShell: run them one at a time) · **Commit prefix:** `STAT:` (dashboard/cache), `FIX:` (UAT bug fixes) · **Reference code:** `StatisticsService.php.txt`, `DashboardController.php.txt`, `dashboard-view.php.txt`, `Routes-laporan-statistik.php.txt` (**Templat & Rujukan** module)

| Lab | Session | Duration | Outcome |
|-----|------|--------|-------|
| 10.1 | S1 | 75 min | `StatisticsService` (no cache) · `/statistik` + `/statistik/data` · 4 KPIs · 4 charts |
| 10.2 | S2 | 90 min | `remember()` · invalidation in `BookingService` & `PassWorkflowService` · `StatisticsCacheTest` |
| 10.3 | S3 | 85 min | UAT filled in · ≥ 1 bug fixed through a failing test · security checklist · tag `v1.0-capstone` |
| 10.4 | S4 | 60 min | 8-minute demo · retrospective |

---

## Lab 10.1 — Dashboard: KPIs + 4 Chart.js charts (S1)

### 🎯 Objective
- Write `StatisticsService::build()`, which returns 4 KPIs + 4 datasets.
- Build `/statistik` (HTML + KPI cards) and `/statistik/data` (JSON).
- Draw bar, doughnut, horizontal bar and line charts with Chart.js 4.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
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

```bash tab="Git Bash / macOS / Linux"
php spark routes | grep statistik
# MSYS_NO_PATHCONV=1: Git Bash (Windows) does not turn /statistik into a C:/… path; no effect on macOS/Linux
MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik
```

```powershell tab="PowerShell"
php spark routes | Select-String statistik
# PowerShell does not rewrite /statistik into a C:/… path, so no prefix is needed
php spark filter:check GET /statistik
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

    public const CACHE_TTL = 600; // saat = 10 minit (SPEC §2.4)

    private const MONTHS_BM = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    private BaseConnection $db;

    private DateTimeImmutable $now;

    /** $now boleh disuntik dalam ujian supaya keputusan tidak bergantung pada tarikh hari ini. */
    public function __construct(?BaseConnection $db = null, ?DateTimeImmutable $now = null, private ?ReportService $reports = null)
    {
        $this->db      = $db ?? db_connect();
        $this->now     = $now ?? new DateTimeImmutable();
        $this->reports ??= new ReportService($this->db);
    }

    /**
     * Pintu masuk tunggal untuk controller.
     *
     * @return array{generated_at: string, kpi: array<string, int|float|null>, charts: array<string, array>}
     */
    public function dashboard(): array
    {
        return $this->build();          // Lab 10.2 akan membalut dengan cache()->remember()
    }

    /** Kira semua data TANPA cache (public supaya boleh diuji terus). */
    public function build(): array
    {
        return [
            'generated_at' => $this->now->format('d/m/Y H:i:s'),
            'kpi'          => [
                'active_bookings'     => $this->activeBookings(),
                'slot_utilisation'    => $this->slotUtilisationToday(),
                'pending_passes'      => $this->pendingPasses(),
                'avg_days_to_approve' => $this->avgDaysToApprove(),
            ],
            'charts' => [
                'bookings_by_month' => $this->bookingsByMonth(),
                'pass_status'       => $this->passStatus(),
                'usage_by_zone'     => $this->usageByZone(),
                'pass_trend'        => $this->passTrend12Months(),
            ],
        ];
    }
}
```

`build()` calls 8 private methods that you add in steps 3–4, **inside this class, before the final `}`**. The page only works after step 4.

**3. Write the 4 KPIs** as private methods. Check the definitions in README §1.1. Add all four:

`app/Services/StatisticsService.php`

```php
    // ------------------------------------------------------------------
    // KPI
    // ------------------------------------------------------------------

    /** Tempahan aktif = pending + approved (takrif sama seperti BR-TLK-04). */
    private function activeBookings(): int
    {
        return $this->db->table('slot_bookings')
            ->whereIn('status', BookingStatus::active())   // ['pending', 'approved']
            ->countAllResults();
    }

    /** Kadar penggunaan slot HARI INI (%) = slot berbeza yang diduduki ÷ slot aktif × 100. */
    private function slotUtilisationToday(): float
    {
        $today = $this->now->format('Y-m-d');

        $activeSlots = $this->db->table('parking_slots')
            ->where('is_active', 1)
            ->where('deleted_at', null)
            ->countAllResults();

        if ($activeSlots === 0) {
            return 0.0;
        }

        // distinct() + countAllResults() → CI4 membungkus sebagai subquery: COUNT(*) FROM (SELECT DISTINCT slot_id ...)
        $occupied = $this->db->table('slot_bookings')
            ->select('slot_id')
            ->distinct()
            ->where('status', BookingStatus::Approved->value)
            ->where('start_date <=', $today)
            ->where('end_date >=', $today)
            ->countAllResults();

        return round($occupied / $activeSlots * 100, 1);
    }

    /** Permohonan pas menunggu tindakan = submitted + under_review. */
    private function pendingPasses(): int
    {
        return $this->db->table('pass_applications')
            ->whereIn('status', [PassStatus::Submitted->value, PassStatus::UnderReview->value])
            ->countAllResults();
    }

    /**
     * Purata hari untuk lulus pas = AVG(approved_at − created_at).
     * Guna approved_at IS NOT NULL (bukan status = approved) supaya pas yang kini 'expired'
     * tetapi pernah diluluskan tetap dikira. Jam ÷ 24 → pecahan hari yang lebih tepat.
     */
    private function avgDaysToApprove(): ?float
    {
        $row = $this->db->table('pass_applications')
            ->select('AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) / 24 AS avg_days', false)
            ->where('approved_at IS NOT NULL')
            ->get()
            ->getRowArray();

        return isset($row['avg_days']) ? round((float) $row['avg_days'], 1) : null; // null = tiada data lagi
    }
```

`slotUtilisationToday()` uses `->select('slot_id')->distinct()->...->countAllResults()`: a slot booked twice today is counted only once.

**4. Write the 4 chart datasets.** Uniform format `['labels' => [...], 'data' => [...]]`:

| Method | Main query | Remember |
|--------|-------------|-------|
| `bookingsByMonth()` | `select('MONTH(created_at) AS m', false)->selectCount('id', 'total')->groupBy('m')` for the current year | **Zero-fill** all 12 months |
| `passStatus()` | `select('status')->selectCount('id', 'total')->groupBy('status')` | Follow `PassStatus::cases()`; return `keys` + `labels` |
| `usageByZone()` | **Reuse** `$this->reports->usageByZone(['year'=>..., 'month'=>..., 'sort'=>'utilisation', 'dir'=>'desc'])` | No new query |
| `passTrend12Months()` | `select("DATE_FORMAT(created_at, '%Y-%m') AS ym", false)` for the last 12 months | Zero-fill; label `Okt 25` |

Full code for all four methods:

`app/Services/StatisticsService.php`

```php
    // ------------------------------------------------------------------
    // Dataset carta — format seragam: ['labels' => [...], 'data' => [...]]
    // ------------------------------------------------------------------

    /** (bar) Tempahan dibuat setiap bulan bagi tahun semasa — Jan..Dis, bulan kosong = 0. */
    private function bookingsByMonth(): array
    {
        $year = (int) $this->now->format('Y');

        $rows = $this->db->table('slot_bookings')
            ->select('MONTH(created_at) AS m', false)
            ->selectCount('id', 'total')
            ->where('created_at >=', "{$year}-01-01 00:00:00")
            ->where('created_at <', ($year + 1) . '-01-01 00:00:00')
            ->groupBy('m')
            ->get()
            ->getResultArray();

        $byMonth = array_column($rows, 'total', 'm');
        $data    = [];

        for ($m = 1; $m <= 12; $m++) {
            $data[] = (int) ($byMonth[$m] ?? 0);  // ISI SIFAR — jika tidak, bar teranjak ke bulan salah
        }

        return ['labels' => self::MONTHS_BM, 'data' => $data, 'year' => $year];
    }

    /** (doughnut) Taburan status pas. 'keys' = nilai enum (untuk warna di JS), 'labels' = BM. */
    private function passStatus(): array
    {
        $rows = $this->db->table('pass_applications')
            ->select('status')
            ->selectCount('id', 'total')
            ->groupBy('status')
            ->get()
            ->getResultArray();

        $counts = array_column($rows, 'total', 'status');
        $out    = ['keys' => [], 'labels' => [], 'data' => []];

        // Ikut susunan enum (bukan susunan DB) supaya warna & legenda sentiasa konsisten.
        foreach (PassStatus::cases() as $status) {
            $out['keys'][]   = $status->value;
            $out['labels'][] = $status->label();
            $out['data'][]   = (int) ($counts[$status->value] ?? 0);
        }

        return $out;
    }

    /** (bar mendatar) Penggunaan (%) setiap zon bulan semasa — GUNA SEMULA RPT-03. */
    private function usageByZone(): array
    {
        $rows = $this->reports->usageByZone([
            'year'  => (int) $this->now->format('Y'),
            'month' => (int) $this->now->format('n'),
            'sort'  => 'utilisation',
            'dir'   => 'desc',
        ]);

        return [
            'labels' => array_map(static fn (array $r): string => $r['zone_code'] . ' ' . $r['zone_name'], $rows),
            'data'   => array_map(static fn (array $r): float => (float) $r['utilisation'], $rows),
        ];
    }

    /** (line) Bilangan permohonan pas 12 bulan terakhir (termasuk bulan semasa). */
    private function passTrend12Months(): array
    {
        $firstMonth = $this->now->modify('first day of this month')->modify('-11 months')->setTime(0, 0);

        $rows = $this->db->table('pass_applications')
            ->select("DATE_FORMAT(created_at, '%Y-%m') AS ym", false)
            ->selectCount('id', 'total')
            ->where('created_at >=', $firstMonth->format('Y-m-d H:i:s'))
            ->groupBy('ym')
            ->get()
            ->getResultArray();

        $byMonth = array_column($rows, 'total', 'ym');
        $labels  = [];
        $data    = [];

        for ($i = 0; $i < 12; $i++) {
            $month    = $firstMonth->modify("+{$i} months");
            $labels[] = self::MONTHS_BM[(int) $month->format('n') - 1] . ' ' . $month->format('y');
            $data[]   = (int) ($byMonth[$month->format('Y-m')] ?? 0);
        }

        return ['labels' => $labels, 'data' => $data];
    }
```

**5. Register the service & a thin controller.** In `app/Config/Services.php`, inside the `Services` class, after `exportService()`:

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

Replace the generated file's contents with:

`app/Controllers/Statistik/DashboardController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Statistik;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;

class DashboardController extends BaseController
{
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
        $stats = service('statisticsService')->dashboard();

        // setJSON() → Content-Type: application/json; charset=UTF-8
        // no-store: pelayar/proksi jangan simpan salinan — cache kita di PELAYAN, bukan klien.
        return $this->response
            ->setHeader('Cache-Control', 'no-store')
            ->setJSON($stats);
    }
}
```

**6. Check the JSON first, the charts later.** Log in as `pelulus@latihan.test` and open `http://localhost:8080/statistik/data`. Check: 12 values in `charts.bookings_by_month.data`, 5 in `charts.pass_status.data`, 12 in `charts.pass_trend.data`.

**7. View** `app/Views/statistik/dashboard.php`. Create this file with the full code below, then read it and make sure you can explain every item in this list:
- 4 KPI cards (Bootstrap `card`, `col-sm-6 col-xl-3`) rendered from `$kpi` with `esc()`.
- 4 `<canvas>` elements, each inside `<div style="position: relative; height: 280px">`.
- In `<?= $this->section('scripts') ?>`: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>` (a **pinned** version — not an open `@4`; or the local copy `base_url('assets/vendor/chartjs/chart.umd.min.js')`, see 🧯) and a `fetch('<?= site_url('statistik/data') ?>')` script.
- A `draw()` function that calls `Chart.getChart(canvas)?.destroy()` before `new Chart(...)`.
- Third chart: `type: 'bar'` + `options.indexAxis: 'y'`.

The chart script goes into `section('scripts')`, so `app/Views/layouts/main.php` must have `<?= $this->renderSection('scripts') ?>` before `</body>` (Day 6 layout).

`app/Views/statistik/dashboard.php`

```php
<?php

/**
 * app/Views/statistik/dashboard.php — Hari 10
 * Kad KPI dirender di pelayan (cepat, berfungsi walaupun JS gagal).
 * 4 carta dilukis oleh Chart.js 4 daripada JSON /statistik/data.
 *
 * @var string                          $title
 * @var array<string, int|float|null>   $kpi
 * @var string                          $generatedAt
 */

$cards = [
    ['label' => 'Tempahan aktif',            'value' => number_format((int) $kpi['active_bookings']),                  'icon' => 'bi-p-square',        'color' => 'primary'],
    ['label' => 'Kadar penggunaan slot hari ini', 'value' => number_format((float) $kpi['slot_utilisation'], 1) . ' %', 'icon' => 'bi-speedometer2',   'color' => 'success'],
    ['label' => 'Permohonan pas menunggu',   'value' => number_format((int) $kpi['pending_passes']),                   'icon' => 'bi-hourglass-split', 'color' => 'warning'],
    ['label' => 'Purata hari untuk lulus pas', 'value' => $kpi['avg_days_to_approve'] === null ? '—' : number_format((float) $kpi['avg_days_to_approve'], 1) . ' hari', 'icon' => 'bi-stopwatch', 'color' => 'info'],
];
?>
<?= $this->extend('layouts/main') ?>

<?php // <h1> dipapar oleh layouts/main.php daripada $title. Skrip Chart.js masuk ke section 'scripts' (sebelum </body>). ?>
<?= $this->section('content') ?>
<div class="d-flex justify-content-end mb-3">
    <small class="text-muted">
        Data dijana: <span id="generated-at"><?= esc($generatedAt) ?></span>
        <span class="badge text-bg-light border">cache 10 minit</span>
    </small>
</div>

<!-- ============ KAD KPI ============ -->
<div class="row g-3 mb-4">
    <?php foreach ($cards as $c): ?>
        <div class="col-sm-6 col-xl-3">
            <div class="card h-100 border-start border-4 border-<?= esc($c['color'], 'attr') ?>">
                <div class="card-body d-flex align-items-center gap-3">
                    <i class="bi <?= esc($c['icon'], 'attr') ?> fs-2 text-<?= esc($c['color'], 'attr') ?>" aria-hidden="true"></i>
                    <div>
                        <div class="text-muted small"><?= esc($c['label']) ?></div>
                        <div class="fs-4 fw-semibold"><?= esc($c['value']) ?></div>
                    </div>
                </div>
            </div>
        </div>
    <?php endforeach ?>
</div>

<div id="chart-error" class="alert alert-danger d-none" role="alert"></div>

<!-- ============ 4 CARTA ============
     Setiap <canvas> dibalut div berketinggian tetap + maintainAspectRatio:false
     supaya carta tidak "membesar tanpa henti" dalam grid responsif. -->
<div class="row g-3">
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Tempahan TLK mengikut bulan (<span id="year-label"></span>)</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartBookingsByMonth" aria-label="Carta bar tempahan mengikut bulan" role="img"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Status permohonan pas</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartPassStatus" aria-label="Carta doughnut status pas" role="img"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Penggunaan slot mengikut zon — bulan ini (%)</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartUsageByZone" aria-label="Carta bar mendatar penggunaan zon" role="img"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Trend permohonan pas — 12 bulan</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartPassTrend" aria-label="Carta garis trend permohonan pas" role="img"></canvas></div>
        </div></div>
    </div>
</div>
<?= $this->endSection() ?>

<?= $this->section('scripts') ?>
<?php // Chart.js 4.4.7 DIPIN. Tiada internet? Guna salinan tempatan base_url('assets/vendor/chartjs/chart.umd.min.js') (lihat 🧯). ?>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script>
(() => {
    'use strict';

    // Warna ikut NILAI enum PassStatus (bukan label) — padan dengan PassStatus::badge() (text-bg-*)
    const PASS_COLORS = {
        submitted:    '#6c757d', // secondary
        under_review: '#0dcaf0', // info
        approved:     '#198754', // success
        rejected:     '#dc3545', // danger
        expired:      '#212529', // dark
    };

    // Lukis carta pada kanvas; musnahkan carta lama dahulu jika kanvas pernah digunakan
    // (elak ralat "Canvas is already in use. Chart with ID ... must be destroyed").
    function draw(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        Chart.getChart(canvas)?.destroy();
        return new Chart(canvas, config);
    }

    const base = { responsive: true, maintainAspectRatio: false };

    async function load() {
        const res = await fetch('<?= site_url('statistik/data') ?>', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        });

        // Sesi tamat → Shield redirect ke /login (HTML) → res.json() akan gagal. Semak dahulu.
        const type = res.headers.get('Content-Type') || '';
        if (!res.ok || !type.includes('application/json')) {
            throw new Error('Gagal memuatkan data statistik (HTTP ' + res.status + '). Sila log masuk semula.');
        }

        const { charts, generated_at: generatedAt } = await res.json();
        document.getElementById('generated-at').textContent = generatedAt;
        document.getElementById('year-label').textContent = charts.bookings_by_month.year;

        // 1) BAR — tempahan ikut bulan
        draw('chartBookingsByMonth', {
            type: 'bar',
            data: {
                labels: charts.bookings_by_month.labels,
                datasets: [{ label: 'Bil. tempahan', data: charts.bookings_by_month.data, backgroundColor: '#0d6efd' }],
            },
            options: { ...base, plugins: { legend: { display: false } },
                       scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
        });

        // 2) DOUGHNUT — status pas (bahagian daripada keseluruhan)
        draw('chartPassStatus', {
            type: 'doughnut',
            data: {
                labels: charts.pass_status.labels,
                datasets: [{
                    data: charts.pass_status.data,
                    backgroundColor: charts.pass_status.keys.map(k => PASS_COLORS[k] ?? '#adb5bd'),
                }],
            },
            options: { ...base, plugins: { legend: { position: 'right' } } },
        });

        // 3) BAR MENDATAR — indexAxis:'y' (label zon panjang lebih mudah dibaca)
        draw('chartUsageByZone', {
            type: 'bar',
            data: {
                labels: charts.usage_by_zone.labels,
                datasets: [{ label: 'Penggunaan (%)', data: charts.usage_by_zone.data, backgroundColor: '#198754' }],
            },
            options: { ...base, indexAxis: 'y', plugins: { legend: { display: false } },
                       scales: { x: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } } },
        });

        // 4) LINE — trend 12 bulan
        draw('chartPassTrend', {
            type: 'line',
            data: {
                labels: charts.pass_trend.labels,
                datasets: [{ label: 'Permohonan pas', data: charts.pass_trend.data,
                             borderColor: '#6f42c1', backgroundColor: 'rgba(111,66,193,.15)', fill: true, tension: 0.3 }],
            },
            options: { ...base, plugins: { legend: { display: false } },
                       scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
        });
    }

    load().catch(err => {
        const box = document.getElementById('chart-error');
        box.textContent = err.message;      // textContent — bukan innerHTML (elak XSS)
        box.classList.remove('d-none');
        console.error(err);
    });
})();
</script>
<?= $this->endSection() ?>
```

**8. Menu.** In `app/Views/layouts/main.php`, add the link only if `auth()->user()->can('statistik.view')`. Put it inside `<ul class="navbar-nav me-auto">`, right after the Laporan link (Lab 9.1):

`app/Views/layouts/main.php`

```php
<?php if (auth()->loggedIn() && auth()->user()->can('statistik.view')): ?>
    <li class="nav-item"><a class="nav-link" href="<?= url_to('statistik') ?>"><i class="bi bi-bar-chart-line"></i> Statistik</a></li>
<?php endif ?>
```

**9. Commit.** `git add -A && git commit -m "STAT: StatisticsService, dashboard KPI + 4 carta Chart.js"`; PowerShell: run `git add` and `git commit` one at a time

**10. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (AI-04):

```text
Plan mode. Do not change any file.
Review the LOGIC of the 4 KPIs and 4 chart datasets in @app/Services/StatisticsService.php against these definitions:
[paste the KPI definition table from README §1.1]
Table | Method | Definition met? | Unhandled edge case (example input) | file:line |, including:
- months without data (must be 0, not missing)
- which statuses are counted and which are not
- date ranges (first/last day of the month, bookings that cover today)
Then check @app/Views/statistik/dashboard.php: is any data put into the DOM with innerHTML?
Do NOT rewrite the code.
```

Look for in the answer: `status IN ('pending','approved')` for active bookings, `TIMESTAMPDIFF(HOUR, …) / 24` for the average days, 12 months filled with 0, and `textContent` (not `innerHTML`) for the error message.

Verify it yourself: for each issue, run the SQL yourself and compare it with the KPI card, e.g. `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');`. A real issue → the AI-10 cycle (failing test first). Record it in `docs/nota-claude.md` (create the file if it does not exist).

### ✅ Checkpoint 10.1
- [ ] `pelulus@latihan.test` and `admin@latihan.test` → `/statistik` shows 4 cards + 4 charts.
- [ ] `penyemak@latihan.test` and `pemohon1@latihan.test` → `/statistik` **and** `/statistik/data` are blocked.
- [ ] KPI "Tempahan aktif" (Active bookings) = the SQL result: `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');`
- [ ] The bar chart shows 12 months (months without data = an empty bar, not missing).
- [ ] The zone chart is a **horizontal** bar; the zone percentages = RPT-03 for the current month (`/laporan/penggunaan`).
- [ ] The browser console (F12) has no errors.
- [ ] Prompting: the AI-04 KPI review is recorded in `docs/nota-claude.md`; every issue is confirmed or rejected with SQL you ran yourself.

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

**Stop & think (2 min):** why not inside the `try` block **before** `transCommit()`, and why not in the controller? Write your answer in the commit message.

**8. Run it again.**

```bash
composer test -- tests/Services/StatisticsCacheTest.php     # green
composer test                                                # ALL green — no regressions
```

**9. Repeat step 4 manually.** Approve another Pass application → `/statistik` → "Pas menunggu" (Pending passes) drops **immediately**; "Data dijana" (Data generated) = the current time.

**10. Commit & merge.** `git add app/ tests/ && git commit -m "STAT: cache dashboard 10 minit + invalidasi selepas commit status (TLK & PAS)"`; PowerShell: run `git add` and `git commit` one at a time, then `git push -u origin feat/statistik` → open an MR to `main` → merge (Lab 10.3 starts from `main`).

**11. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (invalidation coverage + AI-09):

```text
Plan mode. Do not change any file.
1. List every transCommit() in app/Services/. For each one: the method, the status transition,
   and whether cache()->delete(StatisticsService::CACHE_KEY) happens AFTER the commit, BEFORE the commit, or not at all.
2. Read @tests/Services/StatisticsCacheTest.php: which transitions are not tested?
   Suggest 2 test cases (Given / When / Then), including pas:expire. Do NOT write code.
```

Look for in the answer: every `transCommit()` in `BookingService` and `PassWorkflowService` is followed by `cache()->delete(...)`; no `delete` before the commit or in a controller.

Verify it yourself:

```bash
grep -n -e "transCommit" -e "CACHE_KEY" app/Services/*.php
```

🪟 PowerShell: `Select-String -Path app\Services\*.php -Pattern "transCommit|CACHE_KEY"`

Claude's list must match this output. Write one suggested case yourself, then `!composer test -- tests/Services/StatisticsCacheTest.php` in Claude Code: green. Commit `STAT: ujian cache tambahan` on `main` before Lab 10.3.

### ✅ Checkpoint 10.2
- [ ] Second reload of `/statistik` → 0 aggregate queries in the Debug Toolbar.
- [ ] `StatisticsCacheTest` **was red** (step 5) and is now **green** (step 8) — show the trainer in the terminal history.
- [ ] `grep -n "CACHE_KEY" app/Services/*.php` → at least 4 hits in `BookingService`/`PassWorkflowService` (2 each) and **no** typed `'stat_dashboard'` string outside `StatisticsService`.
- [ ] Every `cache()->delete(...)` is **after** `transCommit()`.
- [ ] You can explain 1 advantage & 1 disadvantage of "TTL + delete" compared with "TTL only".
- [ ] Prompting: Claude's `transCommit()` list matches your own `grep`, and one extra cache test case is written by you and green.

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
- Create the file `docs/UAT-signoff.md` and copy in the content of the template `templates/dokumen/uat-signoff-templat.md` (**Templat & Rujukan** module).
- Create the file `docs/kes-ujian-akhir.md` and copy in the content of the template `templates/dokumen/kes-ujian-templat.md` (**Templat & Rujukan** module).
- Clean database: `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder`; PowerShell: run `php spark migrate:refresh` and `php spark db:seed` one at a time.

### Steps

**1. Prepare 5 windows** (incognito/separate profiles): `pemohon1`, `pemohon2`, `penyemak`, `pelulus`, `admin` (password `Latihan@2026`).

**2. Run the UAT script** in README §3.2 (15 steps) **in order**. Click each step yourself, and fill in the *Keputusan* (Result) & *Catatan* (Notes) columns before the next step in `docs/UAT-signoff.md` §4 (UAT-01..UAT-10). The last column of the README §3.2 table maps each step to a UAT ID (e.g. steps 1 & 5 → UAT-01; steps 4, 6, 11 & 15 → UAT-10). Mark a UAT ID ✅ only if **all** the steps mapped to it pass. Target time: 35 minutes.

**3. Record every failure** in the *Bug log* (`docs/kes-ujian-akhir.md`) — `BUG-001`, `BUG-002`, … with severity High/Medium/Low. **Don't fix anything yet.**

**4. Pick the highest-severity bug** and run the cycle:

```bash
git switch -c fix/bug-001-<ringkas>
```

| Step | Action | Evidence |
|---------|----------|-------|
| a. Reproduce | Write the exact steps + data in the bug log | The trainer/the person next to you can repeat it in < 2 min |
| b. Failing test | Write a PHPUnit test (unit/service or `FeatureTestTrait`) | `composer test -- --filter <namaUjian>` **red** — keep a terminal screenshot |
| c. Fix | A **minimal** change | A small & focused `git diff` |
| d. Pass | That test is green **+** all of `composer test` is green | Terminal screenshot |
| e. Commit | `git add app/ tests/ docs/ && git commit -m "FIX: <ringkasan> (BUG-001)"`; PowerShell: run `git add` and `git commit` one at a time → merge | Bug log: *Closed* |

No bugs found? The trainer will give you a "planted bug" (the BUG-007 example in README §3.3); practise the full cycle on it.

**5. Security checklist K1–K10** (README §3.4), ~10 minutes. Tick K1–K10 yourself: run the evidence commands below (K2, K3, K4, K5, K7) and check the remaining Ks visually. The trainer then **spot-checks 3 Ks** on your machine — K3 always, plus 2 of the trainer's choice — so every tick must be provable on the spot.

```bash tab="Git Bash / macOS / Linux"
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

```powershell tab="PowerShell"
# K2 — output without esc() (every remaining line must be justified; ignore app/Views/errors/)
Get-ChildItem app/Views -Recurse -File | Select-String -SimpleMatch '<?= $' | Where-Object { $_.Line -notlike '*esc(*' -and $_.Line -notlike '*$this->*' }

# K3 — .env never went into Git
git ls-files | Select-String "(^|/)\.env$"
git log --all --oneline -- .env

# K4 — no uploaded files in public/
Get-ChildItem public -Recurse -File -Include *.pdf, *.jpg, *.png | Where-Object { $_.FullName -notmatch 'assets' } | ForEach-Object FullName

# K5 — a filter on every protected route
php spark routes
php spark filter:check GET /statistik
php spark filter:check GET /laporan/tempahan

# K7 — raw queries (every hit must use ? bindings; justified exception: EXPLAIN in
#      app/Commands/ReportExplain.php — SQL compiled by the Query Builder, no web user input)
Get-ChildItem app -Recurse -File | Select-String -SimpleMatch '->query('
```

Tick each K in `docs/UAT-signoff.md` §5/§6 (or an appendix).

**6. Prepare for the demo.**

```bash tab="Git Bash / macOS / Linux"
git switch main && git pull
composer test                              # green — test the `main` you are about to tag
git add docs/ && git commit -m "SETUP: UAT-signoff, log pepijat & senarai semak K1–K10"
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

```powershell tab="PowerShell"
git switch main
git pull
composer test                              # green — test the `main` you are about to tag
git add docs/
git commit -m "SETUP: UAT-signoff, log pepijat & senarai semak K1–K10"
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

Write a **1-page demo script** (following the format in README §4.1) and make sure you can explain any file.

**7. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (the `semak-ci4` subagent + AI-08):

```text
Use the semak-ci4 subagent to re-check K2, K5 and K7 (README §3.4) across app/:
- K2: every <?= $ in app/Views without esc()
- K5: routes in app/Config/Routes.php without a session, group or permission filter
- K7: every ->query( and whether it uses ? binding
Give a table | K | File:line | Pass/Fail | Reason |. Do not change any file.
```

Look for: the `semak-ci4` line appears, then a table with file:line.

Verify it yourself: compare it with your K2/K5/K7 marks in `docs/UAT-signoff.md` from your own commands in step 5. For each "Fail" your commands missed: open the file:line. If it is real, record it as `BUG-00N` in `docs/kes-ujian-akhir.md`; do not move the `v1.0-capstone` tag. Fix it after the demo with the AI-10 cycle, and before each `FIX:` commit run AI-08 on `!git diff --staged` in Claude Code.

### ✅ Checkpoint 10.3
- [ ] `docs/UAT-signoff.md` §4: UAT-01..UAT-10 are all marked (✅/❌/⚠️) — no ⬜.
- [ ] All **Critical** scenarios are ✅, or every ❌ has a Bug-ID and an action plan.
- [ ] ≥ 1 bug closed with **red → green** test evidence.
- [ ] K1–K10 ticked with command evidence.
- [ ] Tag `v1.0-capstone` exists: `git tag -l`.
- [ ] Prompting: the `semak-ci4` findings for K2/K5/K7 are compared with your marks; each difference is rejected with evidence or recorded as `BUG-00N`.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| Logging in as a second role replaces the first role's session | Normal tabs share the session cookie | Use incognito windows / separate browser profiles |
| UAT fails because of yesterday's data (e.g. slot already booked) | The DB is not clean | `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder`; PowerShell: run `php spark migrate:refresh` and `php spark db:seed` one at a time |
| `The action you requested is not allowed.` during UAT | Form left open too long → CSRF token expired, or `csrf_field()` missing | Reload the form; if it keeps happening, check that the form has `csrf_field()` |
| Feature test fails with `Config\Security::$csrfProtection is set to 'cookie'` | Shield configuration | `app/Config/Security.php` → `$csrfProtection = 'session'` (Day 4) |
| Tests pass on your machine but fail on a neighbour's machine | Depends on seed data/today's date | Own fixtures in the test; relative (`+1 day`) or fixed dates |
| `git tag` rejected: *already exists* | Tag created before the fix | `git tag -d v1.0-capstone && git tag -a v1.0-capstone -m "…"`; PowerShell: run `git tag -d` and `git tag -a` one at a time (before pushing) |

### ⭐ Bonus challenge
- Write a `FeatureTestTrait` test for UAT-08: `applicant` → `GET /statistik` and `/laporan/tempahan` → not 200.
- Run `composer audit` and discuss the results.

---

## Lab 10.4 — Capstone demo & retrospective (S4)

### 🎯 Objective
- Demo the system end to end in 8 minutes, following the format.
- Explain one line of code chosen by the panel.
- Contribute ≥ 3 retrospective cards (Start/Stop/Continue).

### Prerequisites
- Checkpoint 10.3 passed; tag `v1.0-capstone`.
- Clean demo DB + seed; 5 logged-in windows ready; 1-page demo script.
- Read [`docs/rubrik-capstone.md`](../docs/rubrik-capstone.md).

### Steps

**1. 10 minutes before your turn:** `php spark serve` running; browser zoom 125 %; notifications off; `docs/UAT-signoff.md` open.

**2. 8-minute demo** — follow the segment schedule in README §4.1. The panel's timekeeper will signal at minutes 1, 3, 5, 6 and 7.

**3. "Explain the code" segment (minutes 7–8).** The panel picks one file and one line (e.g. `ReportService::applySort()`, `BookingService::transition()`, `dashboard.php` `draw()`). **You yourself** answer: *what does this line do, why is it here, what happens if it is removed?*

**4. Q&A (if the panel asks during the demo).** Answer honestly — "I didn't get to it yet, my plan is …" is worth more than guessing.

**5. Retrospective.** Write ≥ 1 card for each column **Start / Stop / Continue** (yellow card = yourself, blue card = the course). Stick them on the board. Vote with 3 dots on the cards that matter most.

**6. Hand over the repo.** Send the repo link / zip archive (without `vendor/`, without `.env`, without `writable/uploads/`) to the trainer.

**7. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (handover, based on AI-18):

```text
Plan mode. Do not change any file.
Review this project's @README.md and @CLAUDE.md critically, as a new developer who inherits the repo tomorrow.
1. README: can I clone, composer install, migrate, seed, run composer test and log in
   with the synthetic accounts just by reading it? Which steps are missing?
2. CLAUDE.md: which instructions, conventions or rules are out of date compared with the current code
   (Pas, Laporan, Statistik, cache)?
At most 8 issues in a table | File · section | Issue | Why it matters | Suggestion |, most important first.
```

Look for in the answer: missing commands (e.g. `php spark db:seed`, the `@latihan.test` accounts), and parts of `CLAUDE.md` that do not mention the Laporan/Statistik modules yet.

Verify it yourself: pick at least 2 issues, confirm each one by opening the file, then fix them **yourself** in `README.md`/`CLAUDE.md`. Commit `CHORE: kemas kini README & CLAUDE.md selepas capstone`, push, and tell the trainer. For your next project, start with AI-15 (existing project) or AI-16 → AI-18 → AI-17 (new project).

### ✅ Checkpoint 10.4
- [ ] Demo finished in ≤ 8 minutes; all four modules shown.
- [ ] The panel signs your score sheet.
- [ ] ≥ 3 retrospective cards posted.
- [ ] Repo handed over.
- [ ] Prompting: at least 2 AI-18 issues in `README.md`/`CLAUDE.md` are fixed by you and committed.

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
