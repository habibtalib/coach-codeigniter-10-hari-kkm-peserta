# Lab Hari 10 — Statistik (M4) & Capstone

[← README Hari 10](./README.md) · [Kanun SPEC](../docs/spesifikasi-sistem.md) · [Jadual](../JADUAL.md) · [Rubrik Capstone](../docs/rubrik-capstone.md)

> **Branch kerja:** `git switch main && git pull && git switch -c feat/statistik`
> **Prefix commit:** `STAT:` (dashboard/cache) · `FIX:` (pembetulan pepijat UAT)
> **Kod rujukan jurulatih:** `templates/kod/` (modul **Templat & Rujukan**) — `StatisticsService.php.txt`, `DashboardController.php.txt`, `dashboard-view.php.txt`, `Routes-laporan-statistik.php.txt`.

| Lab | Sesi | Tempoh | Hasil |
|-----|------|--------|-------|
| 10.1 | S1 | 75 min | `StatisticsService` (tanpa cache) · `/statistik` + `/statistik/data` · 4 KPI · 4 carta |
| 10.2 | S2 | 90 min | `remember()` · invalidasi dalam `BookingService` & `PassWorkflowService` · `StatisticsCacheTest` |
| 10.3 | S3 | 85 min | UAT diisi · ≥ 1 pepijat dibaiki melalui ujian gagal · senarai semak keselamatan · tag `v1.0-capstone` |
| 10.4 | S4 | 60 min | Demo 15 minit · retrospektif |

---

## Lab 10.1 — Dashboard: KPI + 4 carta Chart.js (S1)

### 🎯 Objektif
- Menulis `StatisticsService::build()` yang memulangkan 4 KPI + 4 dataset.
- Membina `/statistik` (HTML + kad KPI) dan `/statistik/data` (JSON).
- Melukis carta bar, doughnut, bar mendatar dan line dengan Chart.js 4.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- M1, M2, M3 di-merge ke `main`; `composer test` hijau.
- Data seed cukup: `DemoDataSeeder` dari Lab 9.1 langkah 0 (≥ 20 tempahan, ≥ 15 permohonan pas pelbagai status & bulan).
- Internet untuk CDN Chart.js (atau salinan tempatan — lihat 🧯).

### Langkah

**1. Route.** Tambah dalam `app/Config/Routes.php`:

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
# MSYS_NO_PATHCONV=1: Git Bash (Windows) tidak menukar /statistik kepada laluan C:/…; tiada kesan di macOS/Linux
MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik
```

**2. Service — mula TANPA cache.** Cipta `app/Services/StatisticsService.php`:

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
        return $this->build();          // Lab 10.2 akan membalut dengan cache()->remember()
    }

    public function build(): array
    {
        return [
            'generated_at' => $this->now->format('d/m/Y H:i:s'),
            'kpi'    => [ /* 4 KPI */ ],
            'charts' => [ /* 4 dataset */ ],
        ];
    }
}
```

**3. Tulis 4 KPI** sebagai kaedah peribadi. Semak takrif di README §1.1. Dua contoh:

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

Tulis sendiri `slotUtilisationToday()` (petunjuk: `->select('slot_id')->distinct()->...->countAllResults()`) dan `pendingPasses()`.

**4. Tulis 4 dataset carta.** Format seragam `['labels' => [...], 'data' => [...]]`:

| Kaedah | Query utama | Ingat |
|--------|-------------|-------|
| `bookingsByMonth()` | `select('MONTH(created_at) AS m', false)->selectCount('id', 'total')->groupBy('m')` tahun semasa | **Isi sifar** 12 bulan |
| `passStatus()` | `select('status')->selectCount('id', 'total')->groupBy('status')` | Ikut `PassStatus::cases()`; pulang `keys` + `labels` |
| `usageByZone()` | **Guna semula** `$this->reports->usageByZone(['year'=>..., 'month'=>..., 'sort'=>'utilisation', 'dir'=>'desc'])` | Tiada query baharu |
| `passTrend12Months()` | `select("DATE_FORMAT(created_at, '%Y-%m') AS ym", false)` 12 bulan terakhir | Isi sifar; label `Okt 25` |

Rujukan penuh: `StatisticsService.php.txt` (modul **Templat & Rujukan**).

**5. Daftar service & controller nipis.** Dalam `app/Config/Services.php`:

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

**6. Semak JSON dahulu, carta kemudian.** Log masuk sebagai `pelulus@latihan.test` dan buka `http://localhost:8080/statistik/data`. Semak: 12 nilai dalam `charts.bookings_by_month.data`, 5 dalam `charts.pass_status.data`, 12 dalam `charts.pass_trend.data`.

**7. View** `app/Views/statistik/dashboard.php`. **Jimat masa (disyorkan):** amali S1 hanya ~30 minit — cipta fail ini dan salin kandungan template `templates/kod/dashboard-view.php.txt` (modul **Templat & Rujukan**) sebagai titik mula, kemudian baca dan sesuaikan; tumpukan masa menulis `StatisticsService`. Pastikan view anda memenuhi senarai ini:
- 4 kad KPI (Bootstrap `card`, `col-sm-6 col-xl-3`) dirender dari `$kpi` dengan `esc()`.
- 4 `<canvas>` masing-masing dalam `<div style="position: relative; height: 280px">`.
- Dalam `<?= $this->section('scripts') ?>`: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>` (versi **dipin** — jangan `@4` terbuka; atau salinan tempatan `base_url('assets/vendor/chartjs/chart.umd.min.js')`, lihat 🧯) dan skrip `fetch('<?= site_url('statistik/data') ?>')`.
- Fungsi `draw()` yang memanggil `Chart.getChart(canvas)?.destroy()` sebelum `new Chart(...)`.
- Carta ketiga: `type: 'bar'` + `options.indexAxis: 'y'`.

Rujukan penuh: `dashboard-view.php.txt` (modul **Templat & Rujukan**).

**8. Menu.** Dalam `layouts/main.php`, tambah pautan hanya jika `auth()->user()->can('statistik.view')`.

**9. Commit.** `git add -A && git commit -m "STAT: StatisticsService, dashboard KPI + 4 carta Chart.js"`

### ✅ Checkpoint 10.1
- [ ] `pelulus@latihan.test` dan `admin@latihan.test` → `/statistik` memaparkan 4 kad + 4 carta.
- [ ] `penyemak@latihan.test` dan `pemohon1@latihan.test` → `/statistik` **dan** `/statistik/data` disekat.
- [ ] KPI "Tempahan aktif" = hasil SQL: `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');`
- [ ] Carta bar menunjukkan 12 bulan (bulan tanpa data = bar kosong, bukan hilang).
- [ ] Carta zon ialah bar **mendatar**; peratus zon = RPT-03 bulan semasa (`/laporan/penggunaan`).
- [ ] Konsol pelayar (F12) tiada ralat.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Uncaught ReferenceError: Chart is not defined` | Skrip CDN tidak dimuat (tiada internet/proksi) atau skrip carta sebelum CDN | Susunan: CDN dahulu. Tiada internet: muat turun `chart.umd.min.js` (4.4.7) ke `public/assets/vendor/chartjs/` dan guna `base_url('assets/vendor/chartjs/chart.umd.min.js')` |
| `Canvas is already in use. Chart with ID '0' must be destroyed before the canvas with ID 'chartX' can be reused.` | `new Chart()` dipanggil dua kali pada kanvas sama (cth butang "Muat semula") | `Chart.getChart(canvas)?.destroy()` sebelum mencipta |
| `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` | Sesi tamat/tiada kebenaran → Shield pulang HTML log masuk | Semak `res.ok` & `Content-Type` sebelum `res.json()`; log masuk semula |
| Carta setinggi 0 px atau membesar tanpa henti | Tiada bekas berketinggian tetap | `<div style="position:relative;height:280px">` + `maintainAspectRatio: false` |
| Bar Jun muncul di kedudukan Mac | Bulan kosong tidak diisi sifar | `array_column(..., 'total', 'm')` + gelung 1..12 |
| `Error 1055 ... only_full_group_by` pada `DATE_FORMAT` | GROUP BY ungkapan berbeza daripada SELECT | `groupBy('ym')` (alias) — MySQL membenarkan GROUP BY alias |
| Purata hari = `null` → kad kosong/ralat `number_format()` | Belum ada pas diluluskan | View papar `—` apabila `null` |

### ⭐ Cabaran tambahan
- Tambah butang **Muat semula** yang memanggil `load()` semula (uji bahawa `destroy()` berfungsi).
- Klik bar zon → buka `/laporan/penggunaan?year=…&month=…` (Chart.js `options.onClick`).

---

## Lab 10.2 — Cache `remember()` & invalidasi selepas perubahan status (S2)

### 🎯 Objektif
- Membalut `dashboard()` dengan `cache()->remember('stat_dashboard', 600, fn)`.
- **Menambah** `cache()->delete(StatisticsService::CACHE_KEY)` selepas setiap perubahan status dalam `BookingService` dan `PassWorkflowService`.
- Membuktikan invalidasi dengan ujian automatik yang **gagal** tanpa kod invalidasi.

### Prasyarat
- Lab 10.1 siap.
- `app/Config/Cache.php` → `$handler = 'file'` (lalai); `writable/cache/` boleh ditulis.

### Langkah

**1. Ukur SEBELUM cache.** Buka `/statistik`, Debug Toolbar (ikon api CI bawah kanan) → tab **Database**. Catat bilangan query & masa. Muat semula 3 kali — nombor tetap sama.

**2. Balut dengan `remember()`:**

```php
public function dashboard(): array
{
    return cache()->remember(self::CACHE_KEY, self::CACHE_TTL, fn (): array => $this->build());
}
```

**3. Ukur SELEPAS.** Muat semula `/statistik` 2 kali. Permintaan kedua: tab Database **tiada** query aggregate; "Data dijana" tidak berubah.

```bash
ls -la writable/cache/          # fail stat_dashboard wujud
php spark cache:info            # handler & fail cache
```

**4. Tunjukkan masalah basi.** Sebagai `pelulus`, lulus satu permohonan pas di `/pas/semakan`. Kembali ke `/statistik` → KPI "Pas menunggu" **tidak berubah**. Catat masa. (Inilah pepijat yang akan kita baiki.)

**5. Tulis ujian yang GAGAL dahulu.** Cipta `tests/Services/StatisticsCacheTest.php`:

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
        cache()->delete(StatisticsService::CACHE_KEY);   // mula bersih — cache fail kekal antara ujian!
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
        (new StatisticsService())->dashboard();                          // isi cache
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

Jangkaan: `testKelulusanTempahanMengosongkanCache` **GAGAL** — *"Cache mesti dikosongkan selepas status berubah"*. Bagus: ujian mengesan pepijat langkah 4.

**6. Tambah invalidasi dalam `BookingService`.** Buka `app/Services/BookingService.php`. Tambah `use` jika perlu (kelas dalam namespace sama — tidak perlu) dan letak **satu baris** selepas **setiap** `$this->db->transCommit();`:

```php
            $this->db->transCommit();
            cache()->delete(StatisticsService::CACHE_KEY);   // Hari 10: invalidasi SELEPAS commit
```

Tempat yang mesti ada (dalam template rujukan Hari 5–6):

| Kaedah | Peralihan | Kenapa |
|--------|-----------|--------|
| `create()` | `null → pending` | "Tempahan aktif" bertambah |
| `transition()` (dipanggil oleh `approve()`, `reject()`, `cancel()`) | `pending → approved/rejected`, `approved → cancelled` | KPI & carta berubah |

**7. Tambah invalidasi dalam `PassWorkflowService`.** Sama — selepas `$this->db->transCommit();` dalam:

| Kaedah | Peralihan |
|--------|-----------|
| `submit()` | `null → submitted` ("Pas menunggu" +1) |
| `transition()` (dipanggil oleh `startReview()`, `approve()`, `reject()`, `expire()`) | semua peralihan lain, termasuk `pas:expire` |

> ✋ **Berhenti & fikir (2 min, berpasangan):** Kenapa bukan di dalam blok `try` **sebelum** `transCommit()`? Kenapa bukan dalam controller? Tulis jawapan anda dalam mesej commit. (Jawapan: README §2.4; controller bukan satu-satunya pemanggil — Spark `pas:expire` tidak melalui controller.)

**8. Jalankan semula.**

```bash
composer test -- tests/Services/StatisticsCacheTest.php     # hijau
composer test                                                # SEMUA hijau — tiada regresi
```

**9. Ulang langkah 4 secara manual.** Lulus satu lagi permohonan pas → `/statistik` → "Pas menunggu" turun **serta-merta**; "Data dijana" = masa sekarang.

**10. Commit.** `git add app/ tests/ && git commit -m "STAT: cache dashboard 10 minit + invalidasi selepas commit status (TLK & PAS)"`

### ✅ Checkpoint 10.2
- [ ] Muat semula kedua `/statistik` → 0 query aggregate dalam Debug Toolbar.
- [ ] `StatisticsCacheTest` **pernah merah** (langkah 5) dan kini **hijau** (langkah 8) — tunjuk kepada jurulatih dalam sejarah terminal.
- [ ] `grep -n "CACHE_KEY" app/Services/*.php` → sekurang-kurangnya 4 hit di `BookingService`/`PassWorkflowService` (2 setiap satu) dan **tiada** string `'stat_dashboard'` bertaip di luar `StatisticsService`.
- [ ] Setiap `cache()->delete(...)` berada **selepas** `transCommit()`.
- [ ] Anda boleh menerangkan 1 kelebihan & 1 kelemahan "TTL + delete" berbanding "TTL sahaja".

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Cache unable to write to "…/writable/cache/"` | Kebenaran folder | `chmod -R 775 writable/cache` (Linux/macOS); Windows: pastikan folder tidak baca-sahaja |
| Ujian lulus walaupun tanpa invalidasi | Cache kosong dari awal → `assertNotNull` tidak disemak, atau ujian tidak mengisi cache | Pastikan `dashboard()` dipanggil & `assertNotNull` sebelum `approve()` |
| Ujian lain tiba-tiba gagal dengan angka lama | Fail cache dari ujian sebelumnya kekal (handler `file` dikongsi) | `cache()->delete(...)` dalam `setUp()`; atau `php spark cache:clear` |
| Dashboard masih basi selepas lulus | `delete()` diletak dalam controller lain / terlepas satu path / tersalah eja kunci | Guna `StatisticsService::CACHE_KEY`; letak dalam `transition()` service |
| `Class "App\Services\StatisticsService" not found` dalam BookingService | Salah namespace | Kedua-dua dalam `App\Services` — tiada `use` diperlukan; semak ejaan |
| `Serialization of 'Closure' is not allowed` | Menyimpan objek/closure dalam data cache | `build()` mesti pulang **array skalar** sahaja |

### ⭐ Cabaran tambahan
- Gantikan panggilan terus dengan **Events**: dalam service `Events::trigger('status_changed', 'TLK', $id)`; dalam `app/Config/Events.php` → `Events::on('status_changed', static fn () => cache()->delete(StatisticsService::CACHE_KEY));`. Bincang: kelebihan (service tidak tahu tentang statistik) vs kelemahan (aliran lebih sukar dijejak).
- Tambah ujian untuk `PassWorkflowService::approve()` (perlukan `User` Shield dengan kebenaran `pas.approve` — rujuk `PassAccessTest` Hari 8).

---

## Lab 10.3 — Ujian akhir sistem (UAT), pembetulan pepijat & keselamatan (S3)

### 🎯 Objektif
- Melaksanakan skrip UAT 15 langkah (meliputi senario UAT-01..UAT-10) merentas 4 modul dan 5 akaun.
- Membaiki sekurang-kurangnya satu pepijat melalui kitaran *reproduce → ujian gagal → baiki → lulus*.
- Melengkapkan senarai semak keselamatan K1–K10.

### Prasyarat
- Lab 10.1 & 10.2 siap dan di-merge ke `main`.
- Cipta fail `docs/UAT-signoff.md` dan salin kandungan templat `templates/dokumen/uat-signoff-templat.md` (modul **Templat & Rujukan**).
- Cipta fail `docs/kes-ujian-akhir.md` dan salin kandungan templat `templates/dokumen/kes-ujian-templat.md` (modul **Templat & Rujukan**).
- Database bersih: `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder`.

### Langkah

**1. Sediakan 5 tetingkap** (incognito/profil berasingan): `pemohon1`, `pemohon2`, `penyemak`, `pelulus`, `admin` (kata laluan `Latihan@2026`).

**2. Jalankan skrip UAT** dalam README §3.2 (15 langkah) **mengikut tertib**. Pemandu klik; perekod isi lajur *Keputusan* & *Catatan* dalam `docs/UAT-signoff.md` §4 (UAT-01..UAT-10). Lajur terakhir jadual README §3.2 memetakan setiap langkah kepada ID UAT (cth langkah 1 & 5 → UAT-01; langkah 4, 6, 11 & 15 → UAT-10). Tanda satu ID UAT ✅ hanya jika **semua** langkah yang dipetakan kepadanya lulus. Masa sasaran: 35 minit.

**3. Rekod setiap kegagalan** dalam *Log pepijat* (`docs/kes-ujian-akhir.md`) — `BUG-001`, `BUG-002`, … dengan keterukan Tinggi/Sederhana/Rendah. **Jangan baiki lagi.**

**4. Pilih pepijat keterukan tertinggi** dan jalankan kitaran:

```bash
git switch -c fix/bug-001-<ringkas>
```

| Langkah | Tindakan | Bukti |
|---------|----------|-------|
| a. Reproduce | Tulis langkah tepat + data dalam log pepijat | Rakan boleh ulang dalam < 2 min |
| b. Ujian gagal | Tulis ujian PHPUnit (unit/service atau `FeatureTestTrait`) | `composer test -- --filter <namaUjian>` **merah** — simpan tangkapan terminal |
| c. Baiki | Perubahan **minimum** | `git diff` kecil & fokus |
| d. Lulus | Ujian tadi hijau **+** `composer test` semua hijau | Tangkapan terminal |
| e. Commit | `git add app/ tests/ docs/ && git commit -m "FIX: <ringkasan> (BUG-001)"` → merge | Log pepijat: *Ditutup* |

> **Tiada pepijat ditemui?** Jurulatih akan memberi satu "pepijat tanaman" (rujuk contoh BUG-007 dalam README §3.3). Latih kitaran penuh pada pepijat itu.

**5. Senarai semak keselamatan K1–K10** (README §3.4), ~10 minit. Tanda K1–K10 sendiri: jalankan arahan bukti di bawah (K2, K3, K4, K5, K7) dan semak baki K secara visual. Selepas itu jurulatih **semak rawak 3 K** pada mesin anda — K3 sentiasa, ditambah 2 pilihan jurulatih — jadi setiap tanda mesti boleh dibuktikan serta-merta.

```bash
# K2 — output tanpa esc() (setiap baris baki mesti dijustifikasi; abaikan app/Views/errors/)
grep -rnF '<?= $' app/Views | grep -vF 'esc(' | grep -vF '$this->'

# K3 — .env tidak pernah masuk Git
git ls-files | grep -E "(^|/)\.env$"
git log --all --oneline -- .env

# K4 — tiada fail muat naik dalam public/
find public -type f \( -name "*.pdf" -o -name "*.jpg" -o -name "*.png" \) | grep -v assets

# K5 — filter pada setiap laluan dilindungi
php spark routes
MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik
MSYS_NO_PATHCONV=1 php spark filter:check GET /laporan/tempahan

# K7 — query mentah (setiap hit mesti guna binding ?; pengecualian sah: EXPLAIN dalam
#      app/Commands/ReportExplain.php — SQL dikompil Query Builder, tiada input pengguna web)
grep -rn -e '->query(' app/
```

Tanda setiap K dalam `docs/UAT-signoff.md` §5/§6 (atau lampiran).

**6. Sediakan untuk demo.**

```bash
composer test                              # hijau
git switch main && git pull
git add docs/ && git commit -m "SETUP: UAT-signoff, log pepijat & senarai semak K1–K10"
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

Tulis **skrip demo 1 halaman** (ikut format README §4.1) dan pastikan kedua-dua ahli boleh menerangkan mana-mana fail.

### ✅ Checkpoint 10.3
- [ ] `docs/UAT-signoff.md` §4: UAT-01..UAT-10 semuanya bertanda (✅/❌/⚠️) — tiada ⬜.
- [ ] Semua senario **Kritikal** ✅, atau setiap ❌ ada Bug-ID dan pelan tindakan.
- [ ] ≥ 1 pepijat ditutup dengan bukti ujian **merah → hijau**.
- [ ] K1–K10 ditanda dengan bukti arahan.
- [ ] Tag `v1.0-capstone` wujud: `git tag -l`.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Log masuk peranan kedua menukar sesi peranan pertama | Tab biasa berkongsi kuki sesi | Guna tetingkap incognito / profil pelayar berasingan |
| UAT gagal kerana data semalam (cth slot sudah ditempah) | DB tidak bersih | `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder` |
| `The action you requested is not allowed.` semasa UAT | Borang dibuka lama → token CSRF tamat, atau `csrf_field()` tertinggal | Muat semula borang; jika berulang, semak borang tersebut ada `csrf_field()` |
| Ujian feature gagal `Config\Security::$csrfProtection is set to 'cookie'` | Konfigurasi Shield | `app/Config/Security.php` → `$csrfProtection = 'session'` (Hari 4) |
| Ujian lulus di mesin sendiri, gagal pada rakan | Bergantung pada data seed/tarikh hari ini | Fixture sendiri dalam ujian; tarikh relatif (`+1 day`) atau tetap |
| `git tag` ditolak: *already exists* | Tag dicipta sebelum pembetulan | `git tag -d v1.0-capstone && git tag -a v1.0-capstone -m "…"` (sebelum push) |

### ⭐ Cabaran tambahan
- Tulis ujian `FeatureTestTrait` untuk UAT-08: `applicant` → `GET /statistik` dan `/laporan/tempahan` → bukan 200.
- Jalankan `composer audit` dan bincang hasilnya.

---

## Lab 10.4 — Demo capstone & retrospektif (S4)

### 🎯 Objektif
- Mendemokan sistem hujung-ke-hujung dalam 15 minit mengikut format.
- Menerangkan satu baris kod yang dipilih panel.
- Menyumbang ≥ 3 kad retrospektif (Start/Stop/Continue).

### Prasyarat
- Checkpoint 10.3 lulus; tag `v1.0-capstone`.
- DB demo bersih + seed; 5 tetingkap log masuk sedia; skrip demo 1 halaman.
- Baca [`docs/rubrik-capstone.md`](../docs/rubrik-capstone.md).

### Langkah

**1. 10 minit sebelum giliran:** `php spark serve` berjalan; zum pelayar 125 %; tutup notifikasi; buka `docs/UAT-signoff.md`.

**2. Demo 15 minit** — ikut jadual segmen README §4.1. Penjaga masa panel akan memberi isyarat pada minit 4, 7, 9, 11 dan 13.

**3. Segmen "Terangkan kod" (minit 11–13).** Panel memilih satu fail dan satu baris (cth `ReportService::applySort()`, `BookingService::transition()`, `dashboard.php` `draw()`). **Mana-mana** ahli pasangan menjawab: *apa baris ini buat, kenapa ia di sini, apa jadi jika dibuang?*

**4. Soal jawab (minit 13–15).** Jawab dengan jujur — "kami belum sempat, pelan kami ialah …" lebih bernilai daripada meneka.

**5. Retrospektif.** Tulis ≥ 1 kad bagi setiap lajur **Start / Stop / Continue** (kad kuning = diri sendiri, kad biru = kursus). Tampal pada papan. Undi 3 titik pada kad yang paling penting.

**6. Serah repo.** Hantar pautan repo / arkib zip (tanpa `vendor/`, tanpa `.env`, tanpa `writable/uploads/`) kepada jurulatih.

### ✅ Checkpoint 10.4
- [ ] Demo selesai dalam ≤ 15 minit; keempat-empat modul ditunjukkan.
- [ ] Panel menandatangani helaian markah pasangan.
- [ ] ≥ 3 kad retrospektif ditampal.
- [ ] Repo diserahkan.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `php spark serve` gagal: *Address already in use* | Server lain di port 8080 | `php spark serve --port 8081` dan `app.baseURL = 'http://localhost:8081/'` dalam `.env` |
| Carta kosong semasa demo | Tiada internet untuk CDN | Salinan tempatan `chart.umd.min.js` (Lab 10.1 🧯) — sediakan sebelum demo |
| Terlupa kata laluan akaun sintetik | — | `Latihan@2026` (SPEC §4) |
| Masa tamat sebelum M4 | Terlalu lama pada M1 | Ikut skrip; jika lewat pada minit 7, lompat terus ke Laporan |

### ⭐ Cabaran tambahan
- Rakam demo 3 minit (tangkapan skrin + suara) sebagai bahan serahan kepada penyelia anda.

---

## Semakan kendiri — akhir hari

```bash
composer test         # semua hijau (termasuk StatisticsCacheTest)
git log --oneline -8  # commit STAT: dan FIX: hari ini
git tag -l            # v1.0-capstone
git status --short    # tiada output
```

- [ ] `pelulus@latihan.test` → `/statistik` memaparkan 4 kad KPI + 4 carta; `/statistik/data` memulangkan JSON dengan 12 nilai `charts.bookings_by_month.data`.
- [ ] `penyemak@latihan.test` → `/statistik` dan `/statistik/data` disekat.
- [ ] `composer test` hijau, termasuk `tests/Services/StatisticsCacheTest.php`.
- [ ] `docs/UAT-signoff.md` §4: UAT-01..UAT-10 tiada ⬜; `git log --oneline` menunjukkan ≥ 1 commit `FIX:`.
- [ ] `git tag -l` menunjukkan `v1.0-capstone` dan `git status --short` kosong.
