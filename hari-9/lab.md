# Lab Hari 9 — Modul Laporan (M3)

[← README Hari 9](./README.md) · [Kanun SPEC](../docs/spesifikasi-sistem.md) · [Jadual](../JADUAL.md)

> **Branch kerja:** `git switch main && git pull && git switch -c feat/laporan`
> **Prefix commit:** `RPT:` · **Kod rujukan jurulatih:** `templates/kod/` (modul **Templat & Rujukan**) (guna untuk **semak**, bukan salin bulat-bulat — anda mesti boleh menerangkan setiap baris).

| Lab | Sesi | Tempoh | Hasil |
|-----|------|--------|-------|
| 9.1 | S1 | 70 min | Kad spesifikasi RPT-01..03 · route · controller rangka · borang filter GET |
| 9.2 | S2 | 90 min | `ReportService` penuh · jadual berpagination untuk 3 laporan |
| 9.3 | S3 | 75 min | `ExportService` · butang Eksport PDF & Excel berfungsi |
| 9.4 | S4 | 60 min | `ReportServiceTest` hijau · EXPLAIN · **M3 siap** |

---

## Lab 9.1 — Reka bentuk laporan & borang penapis GET (S1)

### 🎯 Objektif
- Menulis kad spesifikasi untuk RPT-01, RPT-02, RPT-03.
- Membina route `/laporan/*` yang dilindungi `permission:laporan.view`.
- Membina borang filter `GET` yang mengekalkan nilai selepas dihantar.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- M1 & M2 siap dan di-merge; `php spark migrate:status` semua *Yes*.
- Data sintetik wujud: `php spark db:seed DatabaseSeeder`; data demo laporan disediakan dalam **langkah 0**.
- Boleh log masuk sebagai `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test`, `pemohon1@latihan.test` (kata laluan `Latihan@2026`).

### Langkah

**0. Sediakan data demo (10 min).** Laporan dan carta (Hari 10) perlukan data merentas bulan dan status. Salin `DemoDataSeeder.php.txt` (modul **Templat & Rujukan**) ke `app/Database/Seeds/DemoDataSeeder.php` (salin terus — ini data, bukan latihan menulis), kemudian tambah panggilannya di hujung `DatabaseSeeder::run()`:

```php
$this->call(DemoDataSeeder::class);     // Hari 9–10: data demo Laporan/Statistik (≥ 20 tempahan, ≥ 15 pas)
```

```bash
php spark db:seed DemoDataSeeder
```

Seeder ini **dilangkau** jika `slot_bookings` atau `pass_applications` sudah berisi (data lab anda). Untuk data demo yang bersih (22 tempahan, 18 permohonan pas, 12 bulan), set semula DB pembangunan — ini **memadam semua data** dalam `kkm_latihan`:

```bash
php spark migrate:refresh --all
php spark db:seed DatabaseSeeder
```

**1. Tulis kad spesifikasi (15 min, berpasangan).** Salin jadual ini ke `docs/laporan-spec.md` dalam repo projek anda dan lengkapkan setiap sel. Rujuk README §1.2 **selepas** anda cuba sendiri.

```markdown
| | RPT-01 | RPT-02 | RPT-03 |
|---|---|---|---|
| Soalan perniagaan yang dijawab | | | |
| Pembaca utama | | | |
| Lajur (ikut susunan) | | | |
| Penapis + jenis input | | | |
| Makna julat tarikh | | | |
| Susunan lalai | | | |
| Siapa boleh lihat (permission) | | | |
```

**2. Tambah route.** Buka `app/Config/Routes.php` dan tambah kumpulan laporan (rujuk `Routes-laporan-statistik.php.txt` (modul **Templat & Rujukan**)):

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

**3. Cipta controller rangka.**

```bash
php spark make:controller Laporan/ReportController
```

Buat sementara `bookings()`, `passes()`, `usage()` yang memulangkan `view('laporan/index', [...])` dengan data kosong. Controller penuh dibina dalam Lab 9.2.

**4. Bina view borang filter** `app/Views/laporan/index.php`. Perkara wajib:

- `<form method="get" action="<?= current_url() ?>">` — **tiada** `csrf_field()` (GET).
- Setiap input diisi semula dari `$filters`:
  ```php
  <input type="date" name="from" class="form-control" value="<?= esc((string) $filters['from'], 'attr') ?>">
  <option value="<?= esc($o['value'], 'attr') ?>" <?= (string) $filters['status'] === (string) $o['value'] ? 'selected' : '' ?>>
      <?= esc($o['label']) ?>
  </option>
  ```
- Dropdown status/kategori/jenis pas dibina dari enum `::cases()` dan `->label()` — **bukan** senarai ditaip tangan.
- Butang **Set semula** = pautan ke `current_url()` tanpa query string.

Rujukan penuh: `report-filter-view.php.txt` (modul **Templat & Rujukan**).

**5. Tambah pautan menu** dalam `layouts/main.php` hanya jika pengguna ada kebenaran:

```php
<?php if (auth()->loggedIn() && auth()->user()->can('laporan.view')): ?>
    <li class="nav-item"><a class="nav-link" href="<?= url_to('laporan.tempahan') ?>">Laporan</a></li>
<?php endif ?>
```

> Menyembunyikan menu hanyalah **kemudahan UI**. Kawalan sebenar ialah filter route di langkah 2.

**6. Commit.** `git add -A && git commit -m "RPT: laluan, controller rangka & borang penapis GET"`

### ✅ Checkpoint 9.1
- [ ] `php spark routes | grep laporan` menunjukkan 3 route dengan filter `permission:laporan.view`.
- [ ] Log masuk sebagai `pemohon1@latihan.test` → `/laporan/tempahan` **ditolak** (filter Shield redirect, tiada data dipapar). Sebagai `penyemak@latihan.test` → dibenarkan.
- [ ] Pilih status + tarikh → klik **Tapis** → URL mengandungi `?from=...&status=...` dan dropdown **masih** menunjukkan pilihan tadi.
- [ ] Kad spesifikasi lengkap untuk 3 laporan dan disemak jurulatih.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Class "App\Controllers\Laporan\ReportController" not found` | Namespace dalam fail tidak sepadan dengan folder | Baris pertama: `namespace App\Controllers\Laporan;` · fail di `app/Controllers/Laporan/` |
| Semua pengguna (termasuk admin) ditolak | Salah eja kebenaran, cth `laporan.views` | Semak `app/Config/AuthGroups.php` → `$matrix` (SPEC §4) |
| Dropdown kembali ke "Semua" selepas tapis | Tiada atribut `selected` / membanding int dengan string | Bandingkan sebagai string: `(string) $a === (string) $b` |
| `The action you requested is not allowed` | Borang tersilap `method="post"` | Tukar ke `get` |

### ⭐ Cabaran tambahan
- Tambah butang pantas "Bulan ini" dan "Bulan lepas" yang mengisi `from`/`to` (pautan GET biasa — tiada JavaScript).

---

## Lab 9.2 — `ReportService`: join, penapis dinamik, aggregate, pagination (S2)

### 🎯 Objektif
- Menulis `normaliseFilters()` dengan whitelist tarikh, enum, id dan susunan.
- Menulis builder RPT-01/RPT-02 dengan `join()` + `when()`.
- Menulis aggregate RPT-03 dengan `selectCount()` + `groupBy()`.
- Memaparkan jadual berpagination yang mengekalkan filter.

### Prasyarat
- Lab 9.1 siap.
- Enum `BookingStatus`, `PassStatus`, `PassType`, `SlotCategory` wujud dengan `label()`.

### Langkah

**1. Cipta fail** `app/Services/ReportService.php` dengan rangka:

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

**2. Tulis `normaliseFilters()` dahulu** (whitelist sebelum query). Sasaran tingkah laku:

| Input `$_GET` | Hasil `$filters` |
|---------------|------------------|
| `from=2026-06-01` | `'from' => '2026-06-01'` |
| `from=2026-02-31` | `'from' => null` (tarikh tidak wujud) |
| `from=2026-06-30&to=2026-06-01` | ditukar: from 01/06, to 30/06 |
| `status=approved` | `'status' => 'approved'` |
| `status=bogus` | `'status' => null` |
| `status[]=approved` | `'status' => null` (array ditolak) |
| `sort=b.id; DROP TABLE users` | `'sort' => 'start_date'` (lalai) |
| `dir=sideways` | `'dir' => 'desc'` (lalai) |

Pembantu teras (rujuk `ReportService.php.txt` (modul **Templat & Rujukan**) §1 dan §Pembantu):

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

Semak cepat: letak sementara `dd($filters);` dalam controller, buka URL dengan pelbagai input di pelayar, kemudian **buang** `dd()` sebelum commit.

**3. Tulis `bookingsBuilder()` (RPT-01)** — 4 join + 5 `when()`. Perhatikan julat tarikh menggunakan syarat bertindih BR-TLK-01:

```php
->when($f['to'] ?? null,   static fn (BaseBuilder $q, string $to)   => $q->where('b.start_date <=', $to))
->when($f['from'] ?? null, static fn (BaseBuilder $q, string $from) => $q->where('b.end_date >=', $from))
```

**4. Tulis `passesBuilder()` (RPT-02)** — `departments` mesti **LEFT** join; julat `created_at` separuh-terbuka:

```php
->join('departments d', 'd.id = u.department_id', 'left')
->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where(
    'p.created_at <',
    (new \DateTimeImmutable($to))->modify('+1 day')->format('Y-m-d 00:00:00'),
))
```

**5. Tulis `applySort()` dengan whitelist + susunan kedua `id`:**

```php
private const SORTABLE = [
    'tempahan' => ['ref_no' => 'b.ref_no', 'zone' => 'z.code', 'start_date' => 'b.start_date',
                   'end_date' => 'b.end_date', 'status' => 'b.status'],
    'pas'      => ['ref_no' => 'p.ref_no', 'department' => 'd.name', 'pass_type' => 'p.pass_type',
                   'status' => 'p.status', 'created_at' => 'p.created_at'],
];
```

**6. Tulis `paginate()`:**

```php
$builder = $this->builder($report, $filters);
$total   = $builder->countAllResults(false);          // false: jangan reset builder
$rows    = $this->applySort($builder, $report, $filters)
    ->limit($perPage, ($page - 1) * $perPage)
    ->get()->getResultArray();
```

Kemudian `formatRow()` menukar nilai enum → label BM dan tarikh → `d/m/Y`.

**7. Tulis `usageByZone()` (RPT-03)** — dua query aggregate + gabung dalam PHP. Semak rumus dengan contoh di README §1.2 (Zon A Jun = 25.0 %).

**8. Daftar service & lengkapkan controller** (nipis!). Dalam `app/Config/Services.php` (corak sama seperti `bookingService`, Hari 6):

```php
public static function reportService(bool $getShared = true): \App\Services\ReportService
{
    if ($getShared) {
        return static::getSharedInstance('reportService');
    }

    return new \App\Services\ReportService();
}
// exportService() — corak sama (Lab 9.3)
```

Dalam controller: `$this->reports = service('reportService');` (dalam `__construct()`). Satu kaedah peribadi `handle($report)` untuk ketiga-tiga laporan:

```php
private function handle(string $report): string|ResponseInterface
{
    $filters = $this->reports->normaliseFilters($report, $this->request->getGet() ?? []);
    // (eksport ditambah di Lab 9.3)
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

**9. Jadual + pagination dalam view:**

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
- [ ] `/laporan/tempahan?status=approved` → "Jumlah rekod" **sama** dengan hasil SQL:
  ```sql
  SELECT COUNT(*) FROM slot_bookings WHERE status = 'approved';
  ```
- [ ] Tapis status + zon → klik halaman 2 → URL masih mengandungi `status=...&zone_id=...&page=2`.
- [ ] `/laporan/pas?to=<hari ini>` memaparkan permohonan yang anda hantar **hari ini** (bukti julat separuh-terbuka).
- [ ] `/laporan/tempahan?sort=nonsense` tidak ralat — jatuh ke susunan lalai.
- [ ] `/laporan/penggunaan?year=2026&month=6` menunjukkan setiap zon (termasuk zon tanpa tempahan = 0.0 %).
- [ ] Controller nipis: setiap kaedah hanya baca filter → panggil `ReportService` → view/eksport (tiada query, join atau kiraan); tiada `$this->db` dalam controller.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Error 1055: Expression #2 of SELECT list is not in GROUP BY clause ... only_full_group_by` | Lajur bukan-aggregate tiada dalam `groupBy()` | `->groupBy(['z.id', 'z.code', 'z.name'])` |
| Jumlah RPT-02 kurang daripada `COUNT(*)` | INNER join ke `departments` membuang pengguna tanpa jabatan | `join('departments d', '...', 'left')` |
| Zon tanpa slot menunjukkan "1 slot aktif" | `COUNT(*)` selepas LEFT JOIN | `selectCount('s.id', 'total_slots')` |
| `Unknown column 'b.status' in 'where clause'` selepas `countAllResults()` | `countAllResults()` (tanpa `false`) **reset** builder | `countAllResults(false)` |
| `Table 'db_parking_slots' doesn't exist` | `DBPrefix` diset; join dengan `escape=false` tidak ditambah prefix | Pastikan `database.default.DBPrefix =` kosong (seperti Hari 4) |
| Rekod sama muncul di halaman 1 dan 2 | Susunan tidak stabil | Tambah `->orderBy('b.id', $dir)` |
| `TypeError: ... must be of type string, array given` | `?status[]=x` dihantar terus ke `tryFrom()` | Guna pembantu `str()` yang menolak array |
| Pautan pagination tanpa gaya Bootstrap | Template `default_full` CI4 tiada kelas `page-item` | Terima buat masa ini, atau ⭐ cabaran di bawah |

### ⭐ Cabaran tambahan
- Cipta template pager Bootstrap `app/Views/pager/bootstrap.php` (salin `system/Pager/Views/default_full.php`, tambah `page-item`/`page-link`), daftar dalam `app/Config/Pager.php` → `$templates['bootstrap']`, dan guna `makeLinks(..., 'bootstrap')`.
- Tambah baris **jumlah** di bawah RPT-03 (jumlah slot, jumlah hari-slot, purata penggunaan berwajaran).

---

## Lab 9.3 — Eksport PDF (Dompdf) & Excel (PhpSpreadsheet) (S3)

### 🎯 Objektif
- Memasang Dompdf & PhpSpreadsheet melalui Composer.
- Menjana PDF A4 landskap dengan pengepala, pengaki "Dijana pada … oleh …" dan nombor muka.
- Menjana `.xlsx` dengan pengepala tebal, lebar automatik, baris beku.
- Membuktikan HTML, PDF dan Excel memaparkan jumlah rekod yang sama.

### Prasyarat
- Lab 9.2 siap; butang eksport dalam view sudah dibina dari `$query`.
- Extension PHP: `ext-dom`, `ext-mbstring`, `ext-gd`, `ext-zip`, `ext-xml` (`php -m` untuk semak).

### Langkah

**1. Pasang pustaka.**

```bash
composer require dompdf/dompdf phpoffice/phpspreadsheet
git add composer.json composer.lock && git commit -m "RPT: tambah dompdf & phpspreadsheet"
```

**2. Cipta `app/Services/ExportService.php`** dan daftar `exportService()` dalam `app/Config/Services.php` (corak sama seperti `reportService()`). Dua kaedah awam:

```php
public function pdf(string $title, array $columns, iterable $rows, array $meta): string
public function xlsx(string $title, array $columns, iterable $rows, array $meta): string
```

`$meta = ['filters' => 'ringkasan penapis', 'user' => 'nama pengguna', 'generated_at' => 'd/m/Y H:i']`. Kedua-dua memulangkan **string binari**; controller yang menghantar respons. Rujukan: `ExportService.php.txt` (modul **Templat & Rujukan**).

**3. Cipta view PDF** `app/Views/laporan/pdf.php` — HTML ringkas, **tanpa** layout Bootstrap:

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

Rujukan penuh: `report-pdf-view.php.txt` (modul **Templat & Rujukan**).

**4. Tambah `exportRows()` dalam `ReportService`** — kira dahulu, tolak jika melebihi had, kemudian pulang Generator:

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

**5. Sambungkan dalam controller** — di awal `handle()`:

```php
$export = $this->request->getGet('export');
if ($export === 'pdf' || $export === 'xlsx') {
    return $this->export($report, $filters, $export);
}
```

dan dalam `export()`:

```php
$binary   = $format === 'pdf'
    ? $this->exporter->pdf($title, $columns, $rows, $meta)
    : $this->exporter->xlsx($title, $columns, $rows, $meta);
$filename = sprintf('laporan-%s-%s.%s', $report, date('Ymd-His'), $format);

return $this->response->download($filename, $binary, true);   // true = teka MIME dari sambungan
```

Tangkap `LengthException` → `redirect()->to(current_url() . '?' . http_build_query($query))->with('error', $e->getMessage())`.

**6. Uji ketiga-tiga laporan × dua format** (6 fail). Buka setiap fail dan semak senarai di Checkpoint.

Seeder memberi No. Pekerja `LT0001`–`LT0005` (tiada sifar di depan). Untuk menguji sifar di depan dalam Excel, tukar No. Pekerja `pemohon2` (yang ada permohonan pas dari `DemoDataSeeder`) kepada `001234`, kemudian eksport RPT-02:

```bash
mysql -u kkm_dev -p -e "UPDATE users SET staff_no = '001234' WHERE username = 'pemohon2'" kkm_latihan
```

🪟 Jika prompt kata laluan tidak muncul dalam Git Bash: `winpty mysql …` (seperti Hari 6).

**7. Commit.** `git add app/ && git commit -m "RPT: eksport PDF (Dompdf) & Excel (PhpSpreadsheet)"`

### ✅ Checkpoint 9.3
- [ ] Tapis RPT-01 `status=approved` → skrin: *N* rekod → PDF: "Jumlah rekod: *N*" → Excel: *N* baris data (baris 6 hingga 5+*N*). **Tiga nombor sama.**
- [ ] PDF: A4 **landskap**; pengepala berulang setiap muka; pengaki "Dijana pada … oleh *nama anda*"; "Muka 1 / 3" di bucu kanan bawah.
- [ ] PDF: nama dengan aksara khas (cth tambah pengguna sintetik "Nur'aini Ābdul") dipapar betul — bukan `?`.
- [ ] Excel: baris pengepala **tebal**; lajur cukup lebar; skrol ke bawah → pengepala kekal (beku); No. Pekerja `001234` kekal dengan sifar di depan.
- [ ] Nama fail: `laporan-tempahan-20260925-143012.pdf`.
- [ ] Log masuk sebagai `pemohon1@latihan.test` dan buka terus `/laporan/pas?export=xlsx` → **ditolak**.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Aksara `?` atau kotak kosong dalam PDF | Fon teras PDF (Helvetica) tiada glif Unicode | `setDefaultFont('DejaVu Sans')` + `font-family: "DejaVu Sans"` dalam CSS; `loadHtml($html, 'UTF-8')` |
| `Cannot modify header information - headers already sent by (output started at .../app/Config/Xxx.php:NN)` | Ada output sebelum respons: ruang/baris kosong selepas `?>`, BOM, `echo`/`var_dump`/`dd()` | Buang `?>` penutup dalam fail PHP tulen; buang debug; simpan fail sebagai UTF-8 **tanpa BOM** |
| Excel: "*We found a problem with some content*" / fail rosak | Output tambahan (ruang, amaran PHP) bercampur dengan binari | Sama seperti di atas; semak `writable/logs/` untuk amaran |
| `Allowed memory size of 134217728 bytes exhausted` | Terlalu banyak sel/baris | Had `EXPORT_LIMIT`; `disconnectWorksheets()`; jangan `getResultArray()` untuk eksport |
| `Maximum execution time of 30 seconds exceeded` (PDF) | Dompdf perlahan untuk jadual beribu baris | Had PDF 2,000; cadangkan Excel untuk data besar |
| Logo tidak muncul dalam PDF | `isRemoteEnabled=false` menyekat URL `http://…` | Guna path fail tempatan dalam `public/` (dibenarkan oleh `setChroot([FCPATH])`) atau data URI base64 |
| Susun atur PDF bersepah | Guna flexbox/grid/Bootstrap | Dompdf = CSS 2.1: guna `<table>`, `position: fixed`, `float` |
| `Class "Dompdf\Dompdf" not found` | `composer require` dijalankan dalam folder lain / `vendor/` tidak dikemas kini | Jalankan di akar projek; `composer dump-autoload` |
| `ZipArchive not found` semasa `.xlsx` | Extension `ext-zip` tidak aktif | Aktifkan dalam `php.ini` (`extension=zip`) dan mulakan semula server |

### ⭐ Cabaran tambahan
- Tambah butang **Pratonton PDF** yang membuka PDF dalam tab baharu (inline) menggunakan:
  ```php
  return $this->response
      ->setContentType('application/pdf')
      ->setHeader('Content-Disposition', 'inline; filename="' . $filename . '"')
      ->setBody($binary);
  ```
- Tambah format **CSV** berstrim (`fputcsv` ke `php://output`) untuk eksport tanpa had praktikal. Bincang: kenapa CSV lebih ringan daripada `.xlsx`?

---

## Lab 9.4 — Ujian "jumlah laporan = jumlah SQL" & EXPLAIN (S4)

### 🎯 Objektif
- Menulis ujian PHPUnit dengan fixture sendiri dan membandingkan jumlah laporan dengan kiraan SQL terus.
- Membaca pelan `EXPLAIN` bagi query RPT-01/RPT-02 dan menilai penggunaan index.

### Prasyarat
- Lab 9.2 & 9.3 siap.
- Database ujian berasingan wujud:
  ```sql
  CREATE DATABASE IF NOT EXISTS kkm_latihan_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- `.env` (JANGAN commit):
  ```ini
  database.tests.hostname = localhost
  database.tests.database = kkm_latihan_test
  database.tests.username = <pengguna anda>
  database.tests.password = <kata laluan anda>
  database.tests.DBDriver = MySQLi
  database.tests.DBPrefix =
  ```

### Langkah

**1. Cipta** `tests/Services/ReportServiceTest.php`. Rangka:

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
    protected $namespace = null;   // semua migration termasuk Shield (jadual users)

    private ReportService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReportService();
        $this->seedFixtures();       // data kecil yang kita tahu jawapannya
    }
}
```

**2. Reka fixture di atas kertas dahulu.** Lukis jadual 5 tempahan (slot, tarikh, status) dan 3 permohonan pas (`created_at`, status). Kira dengan tangan: berapa `approved`? berapa bertindih dengan Jun? berapa % penggunaan Zon A Jun? **Baru** tulis `seedFixtures()`.

**3. Tulis sekurang-kurangnya 7 ujian** (nama BM deskriptif):

| Ujian | Assertion utama |
|-------|-----------------|
| `testRpt01TanpaPenapisSamaDenganJumlahJadual` | `total === COUNT(*)` |
| `testRpt01PenapisStatusSamaDenganKiraanSql` | `total === COUNT(*) WHERE status` **dan** `=== 3` |
| `testRpt01JulatTarikhGunaSyaratBertindih` | 4 (bukan 3!) |
| `testRpt02HariTerakhirJulatTidakTercicir` | rekod 30/09 14:00 termasuk |
| `testSusunanDiluarWhitelistJatuhKeLalai` | `sort === 'start_date'`; jadual `users` masih wujud |
| `testEksportSamaJumlahDenganPaparanHtml` | `count(iterator_to_array(exportRows)) === paginate total` |
| `testRpt03KadarPenggunaanJun2026` | Zon A = `25.0` |

Rujukan penuh: `ReportServiceTest.php.txt` (modul **Templat & Rujukan**).

**4. Jalankan.**

```bash
composer test -- tests/Services/ReportServiceTest.php --testdox
```

**5. Buktikan ujian menangkap pepijat (mutasi manual).** Tukar sementara dalam `passesBuilder()`:

```php
// SENGAJA SALAH — untuk melihat ujian gagal
->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where('p.created_at <=', $to))
```

Jalankan semula → `testRpt02HariTerakhirJulatTidakTercicir` **mesti gagal**. Pulihkan → hijau.

**6. EXPLAIN.** Cipta arahan Spark kecil `app/Commands/ReportExplain.php`:

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

        $sql = $service->builder($report, $filters)->getCompiledSelect();   // SQL SEBENAR
        CLI::write($sql, 'yellow');

        // FORMAT=TRADITIONAL: MySQL 9 menukar format lalai EXPLAIN kepada pokok (MariaDB: buang FORMAT=TRADITIONAL).
        // Pengecualian K7 yang sah: $sql dikompil oleh Query Builder (nilai sudah di-escape), arahan CLI sahaja.
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

**7. Rekod pemerhatian** dalam `docs/laporan-spec.md` → bahagian "Prestasi": untuk setiap query, catat `type`, `key`, `rows` bagi jadual utama (`b` / `p`). Jawab: *query mana yang tiada index untuk filter utamanya?*

**8. Commit & merge.**

```bash
git add -A && git commit -m "RPT: ujian jumlah laporan = SQL + arahan laporan:explain"
git push -u origin feat/laporan    # buka PR → semakan rakan → merge ke main
```

### ✅ Checkpoint 9.4 — **M3 siap**
- [ ] `composer test -- tests/Services/ReportServiceTest.php` → semua hijau (≥ 7 ujian).
- [ ] Mutasi di langkah 5 menyebabkan tepat **satu** ujian gagal; dipulihkan.
- [ ] Output `laporan:explain tempahan approved` menunjukkan `key = status` (atau index lain) untuk jadual `b` — bukan `type = ALL`.
- [ ] Anda boleh menerangkan kepada jurulatih: kenapa RPT-02 dengan filter tarikh sahaja menunjukkan `type = ALL` pada `p`.
- [ ] DoD KOLABORASI §2 ditanda untuk M3.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Ujian menggunakan SQLite & gagal `no such function: DATEDIFF` | Kumpulan `tests` lalai CI4 = SQLite | Set `database.tests.*` ke MySQL dalam `.env` |
| `Table 'kkm_latihan_test.users' doesn't exist` | `$namespace = 'App'` (lalai) → migration Shield tidak dijalankan | `protected $namespace = null;` |
| `Duplicate entry 'WXX 9001' for key 'plate_no'` | Data kekal dari ujian lepas | `protected $refresh = true;` |
| Ujian lulus di mesin A, gagal di B (tarikh) | Fixture bergantung pada `date('Y-m-d')` | Guna tarikh tetap (Jun 2026) dalam fixture |
| Output EXPLAIN satu lajur berbentuk pokok (`-> Nested loop ...`) | MySQL 9 menukar format lalai EXPLAIN | Guna `'EXPLAIN FORMAT=TRADITIONAL ' . $sql` |
| `getCompiledSelect()` kemudian `get()` pulang semua baris tanpa filter | `getCompiledSelect()` (lalai) **reset** builder | Guna builder baharu, atau `getCompiledSelect(false)` |

### ⭐ Cabaran tambahan
- Jana 50,000 tempahan sintetik (seeder berasingan `BulkBookingSeeder`, guna `insertBatch()` berkelompok 1,000), ukur masa RPT-02 dengan filter tarikh sahaja, kemudian cadangkan (dalam migration **baharu**, bukan ubah yang lama) `INDEX(created_at)` pada `pass_applications`. Jalankan `laporan:explain` sebelum/selepas dan bentangkan perbezaan `type`/`rows`. Catat sebagai cadangan kepada pemilik sistem — perubahan skema mesti direkod dalam kamus data.
- Tambah ujian `testEksportMelebihiHadDitolak`: jadikan had sebagai parameter constructor (`?array $exportLimit = null`), cipta service dengan had `['pdf' => 2, 'xlsx' => 2]`, dan `expectException(\LengthException::class)`. (Kenapa subclass yang mengatasi `const EXPORT_LIMIT` tidak berkesan jika kod memanggil `self::EXPORT_LIMIT`? Petunjuk: `self::` vs `static::`.)

---

## Semakan kendiri — akhir hari

```bash
composer test                                                     # semua hijau (termasuk ReportServiceTest)
php spark laporan:explain tempahan approved 2026-06-01 2026-06-30 # pelan EXPLAIN dicetak tanpa ralat
git status --short                                                # tiada output
git log --oneline -5                                              # commit RPT: hari ini
```

- [ ] `/laporan/tempahan`, `/laporan/pas` dan `/laporan/penggunaan` dimuat dengan filter GET; "Jumlah rekod" RPT-01 `status=approved` = `COUNT(*)` SQL.
- [ ] `?export=pdf` dan `?export=xlsx` memuat turun fail yang boleh dibuka bagi ketiga-tiga laporan; `pemohon1@latihan.test` ditolak.
- [ ] `composer test` hijau, termasuk `tests/Services/ReportServiceTest.php` (≥ 7 ujian).
- [ ] `php spark laporan:explain tempahan approved 2026-06-01 2026-06-30` menunjukkan `key` bukan `NULL` untuk jadual `b`.
- [ ] `git status --short` kosong dan branch `feat/laporan` sudah di-push (PR dibuka).
