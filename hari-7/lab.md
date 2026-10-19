# Lab Hari 7 — Modul Pas (1): Model, CRUD & Muat Naik Selamat

[📅 Jadual](../JADUAL.md) · [📘 Kanun SPEC](../docs/spesifikasi-sistem.md) · [📖 Nota Hari 7](./README.md) · [⚡ Arahan spark](../docs/arahan-spark.md)

> Kerja **individu** dalam `kelas-ci-<nama>`; tunjuk output kepada jurulatih atau rakan sebelah sebelum menanda. Semua arahan dijalankan dari **akar projek CI4** anda (folder yang ada `spark`). Setiap langkah memberi **kod lengkap untuk disalin**. Baca setiap baris sebelum menjalankannya — anda mesti boleh menerangkannya (KOLABORASI §3). Buntu: baca mesej ralat penuh, tanya jurulatih atau rakan sebelah, atau guna AI untuk *menerangkan* ralat.

| Lab | Sesi | Masa | Hasil |
|-----|------|------|-------|
| 7.0 | Awal S1 | 10 min | Branch Git + `php.ini` sedia untuk muat naik |
| 7.1 | S1 | 09:10–10:30 | Enum, Entity, 2 Model |
| 7.2 | S2 | 10:45–12:30 | Route, Service (`canView`), senarai & butiran |
| 7.3 | S3 | 14:30–16:00 | Borang + validasi + muat naik + muat turun |
| 7.4 | S4 | 16:00–17:00 | 17 kes ujian sempadan direkod |

---

## Lab 7.0 — Persediaan (10 minit, awal S1)

1. Branch baharu dari `main` yang terkini:

   ```bash
   git switch main && git pull
   git switch -c feat/pas-permohonan
   ```

2. Semak had muat naik PHP dan extension `fileinfo`:

   ```bash
   php --ini                                   # lokasi php.ini yang dimuatkan
   php -i | grep -E "upload_max_filesize|post_max_size|max_file_uploads"
   php -m | grep -i fileinfo                   # mesti keluar: fileinfo
   ```

   Jika bukan Git Bash (PowerShell): `php -i | Select-String "upload_max_filesize|post_max_size"`.

3. Jika `upload_max_filesize` < `8M` atau `post_max_size` < `16M`, edit `php.ini` (Laragon: *Menu → PHP → php.ini*; lain-lain: `php --ini`):

   ```ini
   upload_max_filesize = 8M
   post_max_size = 16M
   extension=fileinfo
   ```

   Mulakan semula `php spark serve` (atau Apache) selepas mengubah.

4. Semak zon waktu aplikasi dalam `.env` (sepatutnya sudah ditetapkan Hari 4) — tanpanya `Time::today()` menggunakan UTC dan tarikh "hari ini" tersasar sehari antara 00:00–08:00:

   ```ini
   app.appTimezone = 'Asia/Kuala_Lumpur'
   ```

5. Sahkan jadual Hari 4 wujud dan sepadan SPEC §3:

   ```bash
   php spark db:table pass_applications --metadata
   php spark db:table pass_documents --metadata
   ```

**✅ Checkpoint 7.0:** `upload_max_filesize` ≥ 8M, `fileinfo` dimuatkan, kedua-dua jadual wujud dengan medan `stored_path`, `mime`, `size_bytes`, `reviewed_by`, `approved_by`.

---

## Lab 7.1 — Enum, Entity & Model (S1)

### 🎯 Objektif
Menulis `PassType`, `PassStatus`, Entity `PassApplication`, `PassApplicationModel` dan `PassDocumentModel` yang patuh SPEC §2.2 & §3.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Lab 7.0 selesai. `BookingStatus` dan `SlotBooking` (Hari 5) boleh dirujuk sebagai corak.

### Langkah

1. **Cipta `app/Enums/PassType.php`**. Tiga `case` tepat seperti SPEC: `kenderaan`, `kakitangan`, `kontraktor`, dengan `label()`, `requiresVehicle()`, `values()`, `options()`.

   `app/Enums/PassType.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Enums;

   enum PassType: string
   {
       case Kenderaan  = 'kenderaan';    // pas kenderaan / pelekat
       case Kakitangan = 'kakitangan';   // pas akses kakitangan
       case Kontraktor = 'kontraktor';   // pas kontraktor berjangka

       /** Label BM untuk paparan */
       public function label(): string
       {
           return match ($this) {
               self::Kenderaan  => 'Pas Kenderaan (Pelekat)',
               self::Kakitangan => 'Pas Akses Kakitangan',
               self::Kontraktor => 'Pas Kontraktor Berjangka',
           };
       }

       /**
        * BR-PAS-06: pas kenderaan WAJIB dipautkan kepada kenderaan milik pemohon
        * (pass_applications.vehicle_id). Jenis lain: vehicle_id = NULL.
        */
       public function requiresVehicle(): bool
       {
           return $this === self::Kenderaan;
       }

       /**
        * Nilai mentah untuk in_list[] validasi.
        *
        * @return list<string>
        */
       public static function values(): array
       {
           return array_column(self::cases(), 'value');
       }

       /**
        * Pilihan untuk <select>: nilai => label BM.
        *
        * @return array<string, string>
        */
       public static function options(): array
       {
           $options = [];

           foreach (self::cases() as $case) {
               $options[$case->value] = $case->label();
           }

           return $options;
       }
   }
   ```

2. **Cipta `app/Enums/PassStatus.php`**. Lima `case`: `submitted`, `under_review`, `approved`, `rejected`, `expired`. Sebelum menyalin, lakar `allowedTransitions()` di atas kertas berdasarkan rajah SPEC §2.2, kemudian bandingkan lakaran anda dengan kod di bawah. Kaedah lain: `canTransitionTo()`, `label()`, `badge()`, `isFinal()`, `values()`, `options()`.

   `app/Enums/PassStatus.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Enums;

   enum PassStatus: string
   {
       case Submitted   = 'submitted';
       case UnderReview = 'under_review';
       case Approved    = 'approved';
       case Rejected    = 'rejected';
       case Expired     = 'expired';

       /** Label BM untuk paparan (SPEC §2.2) */
       public function label(): string
       {
           return match ($this) {
               self::Submitted   => 'Dihantar',
               self::UnderReview => 'Dalam Semakan',
               self::Approved    => 'Diluluskan',
               self::Rejected    => 'Ditolak',
               self::Expired     => 'Tamat Tempoh',
           };
       }

       /** Kelas CSS Bootstrap 5.3 untuk badge — corak sama seperti BookingStatus */
       public function badge(): string
       {
           return match ($this) {
               self::Submitted   => 'text-bg-secondary',
               self::UnderReview => 'text-bg-info',
               self::Approved    => 'text-bg-success',
               self::Rejected    => 'text-bg-danger',
               self::Expired     => 'text-bg-dark',
           };
       }

       /**
        * Status seterusnya yang sah dari status semasa.
        *
        * @return list<self>
        */
       public function allowedTransitions(): array
       {
           return match ($this) {
               self::Submitted   => [self::UnderReview],
               self::UnderReview => [self::Approved, self::Rejected],
               self::Approved    => [self::Expired],
               self::Rejected,
               self::Expired     => [],               // status akhir
           };
       }

       /** BR-PAS-01 — satu-satunya pintu untuk menyemak peralihan */
       public function canTransitionTo(self $to): bool
       {
           return in_array($to, $this->allowedTransitions(), true);
       }

       /** true jika tiada lagi peralihan yang mungkin (rejected/expired) */
       public function isFinal(): bool
       {
           return $this->allowedTransitions() === [];
       }

       /**
        * Nilai mentah untuk in_list[] validasi & whereIn().
        *
        * @return list<string>
        */
       public static function values(): array
       {
           return array_column(self::cases(), 'value');
       }

       /**
        * Pilihan untuk <select>: nilai => label BM.
        *
        * @return array<string, string>
        */
       public static function options(): array
       {
           $options = [];

           foreach (self::cases() as $case) {
               $options[$case->value] = $case->label();
           }

           return $options;
       }
   }
   ```

3. **Uji enum dengan segera** menggunakan skrip kecil (tidak di-commit):

   ```bash
   mkdir -p writable/scratch
   ```

   Dalam VS Code, cipta fail `writable/scratch/enum-check.php` (*File → New File*) dengan kandungan ini:

   ```php
   <?php
   require __DIR__ . '/../../vendor/autoload.php';
   require __DIR__ . '/../../app/Enums/PassStatus.php';
   use App\Enums\PassStatus as S;
   var_dump(S::Submitted->canTransitionTo(S::UnderReview));  // true
   var_dump(S::Submitted->canTransitionTo(S::Approved));     // false  ← BR-PAS-01
   var_dump(S::UnderReview->canTransitionTo(S::Rejected));   // true
   var_dump(S::Rejected->isFinal());                         // true
   echo S::from('under_review')->label(), PHP_EOL;           // Dalam Semakan
   var_dump(S::tryFrom('lulus'));                            // NULL
   ```

   Simpan, kemudian jalankan:

   ```bash
   php writable/scratch/enum-check.php
   ```

4. **Cipta `app/Entities/PassApplication.php`** dengan `$dates`, `$casts` (`'?integer'` untuk FK pilihan), `statusEnum()`, `typeEnum()`, `isOwnedBy()`, `displayStatus()`.

   `app/Entities/PassApplication.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Entities;

   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use CodeIgniter\Entity\Entity;
   use CodeIgniter\I18n\Time;

   class PassApplication extends Entity
   {
       /** Medan ini ditukar kepada CodeIgniter\I18n\Time secara automatik */
       protected $dates = [
           'valid_from',
           'valid_until',
           'reviewed_at',
           'approved_at',
           'created_at',
           'updated_at',
       ];

       /** '?integer' = boleh NULL (FK pilihan) */
       protected $casts = [
           'id'          => 'integer',
           'user_id'     => 'integer',
           'vehicle_id'  => '?integer',
           'reviewed_by' => '?integer',
           'approved_by' => '?integer',
       ];

       /** Status sebagai enum — ValueError jika DB mengandungi nilai asing (petanda data rosak) */
       public function statusEnum(): PassStatus
       {
           return PassStatus::from((string) $this->attributes['status']);
       }

       public function typeEnum(): PassType
       {
           return PassType::from((string) $this->attributes['pass_type']);
       }

       /** BR-PAS-04 — asas semakan pemilikan */
       public function isOwnedBy(int $userId): bool
       {
           return (int) $this->attributes['user_id'] === $userId;
       }

       /**
        * SPEC §2.2: expired ditetapkan oleh sistem "(Spark command / semasa papar)".
        * Semasa papar: pas approved yang valid_until sudah lepas dipaparkan sebagai Tamat Tempoh,
        * walaupun Spark `pas:expire` belum dijalankan. Nilai DB TIDAK diubah di sini.
        */
       public function displayStatus(): PassStatus
       {
           $status     = $this->statusEnum();
           $validUntil = $this->valid_until;   // Time (lihat $dates)

           if ($status === PassStatus::Approved
               && $validUntil instanceof Time
               && $validUntil->isBefore(Time::today())) {
               return PassStatus::Expired;
           }

           return $status;
       }
   }
   ```

5. **Cipta `app/Models/PassApplicationModel.php`**:
   - `$returnType = PassApplication::class`, `$useTimestamps = true`, `$useSoftDeletes = false`.
   - `$allowedFields` — 12 medan (semua kecuali `id`, `created_at`, `updated_at`).
   - `$validationRules` diisi dalam `initialize()` (kerana `implode()` enum).
   - Skop `ownedBy()`, `withStatus()`, `withApplicant()`.

   `app/Models/PassApplicationModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use CodeIgniter\Model;

   class PassApplicationModel extends Model
   {
       protected $table          = 'pass_applications';
       protected $primaryKey     = 'id';
       protected $returnType     = PassApplication::class;
       protected $useSoftDeletes = false;          // SPEC §3: tiada deleted_at untuk jadual ini
       protected $useTimestamps  = true;           // isi created_at / updated_at automatik
       protected $dateFormat     = 'datetime';

       /** Senarai putih medan — cegah mass assignment (cth pemohon hantar status=approved) */
       protected $allowedFields = [
           'ref_no',
           'user_id',
           'pass_type',
           'vehicle_id',
           'purpose',
           'valid_from',
           'valid_until',
           'status',
           'reviewed_by',
           'reviewed_at',
           'approved_by',
           'approved_at',
       ];

       /** Diisi dalam initialize() kerana in_list[] dibina dari enum (bukan ungkapan pemalar) */
       protected $validationRules = [];

       protected $validationMessages = [
           'purpose' => [
               'min_length' => 'Tujuan permohonan mestilah sekurang-kurangnya 10 aksara.',
           ],
       ];

       /** Semasa update separa, hanya medan yang dihantar divalidasi (lalai CI4 = true) */
       protected $cleanValidationRules = true;

       protected function initialize(): void
       {
           $this->validationRules = [
               'ref_no'      => 'required|max_length[20]|is_unique[pass_applications.ref_no]',
               'user_id'     => 'required|is_natural_no_zero',
               'pass_type'   => 'required|in_list[' . implode(',', PassType::values()) . ']',
               'vehicle_id'  => 'permit_empty|is_natural_no_zero',
               'purpose'     => 'required|min_length[10]|max_length[2000]',
               'valid_from'  => 'required|valid_date[Y-m-d]',
               'valid_until' => 'required|valid_date[Y-m-d]',
               'status'      => 'required|in_list[' . implode(',', PassStatus::values()) . ']',
           ];
       }

       // -----------------------------------------------------------------
       // Skop query — dipanggil secara berantai, cth:
       //   $model->ownedBy($uid)->withStatus($s)->orderBy(...)->paginate(10)
       // Model::__call() memajukan where()/join() kepada Query Builder dan pulang $this.
       // -----------------------------------------------------------------

       /** BR-PAS-04: senarai pemohon — HANYA rekod miliknya */
       public function ownedBy(int $userId): static
       {
           $this->where('pass_applications.user_id', $userId);

           return $this;
       }

       /** Penapis status pilihan (null = semua) */
       public function withStatus(?PassStatus $status): static
       {
           if ($status !== null) {
               $this->where('pass_applications.status', $status->value);
           }

           return $this;
       }

       /** Sertakan nama pemohon (untuk senarai semakan pegawai) */
       public function withApplicant(): static
       {
           $this->select('pass_applications.*, users.full_name AS applicant_name')
               ->join('users', 'users.id = pass_applications.user_id');

           return $this;
       }
   }
   ```

6. **Cipta `app/Models/PassDocumentModel.php`** (`$returnType = 'array'`, rule `mime` `in_list[application/pdf,image/jpeg,image/png]`, `size_bytes` `less_than_equal_to[2097152]`, kaedah `forApplication()`).

   `app/Models/PassDocumentModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use CodeIgniter\Model;

   class PassDocumentModel extends Model
   {
       protected $table          = 'pass_documents';
       protected $primaryKey     = 'id';
       protected $returnType     = 'array';
       protected $useSoftDeletes = false;
       protected $useTimestamps  = true;
       protected $dateFormat     = 'datetime';

       protected $allowedFields = [
           'application_id',
           'doc_type',
           'original_name',
           'stored_path',     // RELATIF kepada WRITEPATH, cth uploads/pas/1727251200_3f2a9c1e7b.pdf
           'mime',            // dari getMimeType() (kandungan), BUKAN getClientMimeType()
           'size_bytes',
       ];

       protected $validationRules = [
           'application_id' => 'required|is_natural_no_zero',
           'doc_type'       => 'required|max_length[30]',
           'original_name'  => 'required|max_length[255]',
           'stored_path'    => 'required|max_length[255]',
           'mime'           => 'required|in_list[application/pdf,image/jpeg,image/png]',
           'size_bytes'     => 'required|is_natural_no_zero|less_than_equal_to[2097152]',  // 2 MB (BR-PAS-02)
       ];

       /**
        * Dokumen bagi satu permohonan.
        *
        * @return list<array<string, mixed>>
        */
       public function forApplication(int $applicationId): array
       {
           return $this->where('application_id', $applicationId)
               ->orderBy('id', 'ASC')
               ->findAll();
       }
   }
   ```

7. **Uji validasi Model** melalui route sementara (buang selepas checkpoint). Tambah dalam `app/Config/Routes.php`:

   ```php
   // SEMENTARA — buang selepas Checkpoint 7.1
   $routes->get('cuba-model-pas', static function () {
       $model = model(\App\Models\PassApplicationModel::class);
       $ok = $model->insert([
           'ref_no' => 'PAS-TEST-0001', 'user_id' => 1, 'pass_type' => 'vip',
           'purpose' => 'pendek', 'valid_from' => '2026-13-01', 'valid_until' => '2026-12-31',
           'status' => 'submitted',
       ]);
       return service('response')->setJSON(['ok' => $ok, 'errors' => $model->errors()]);
   });
   ```

   Buka `http://localhost:8080/cuba-model-pas`.

### ✅ Checkpoint 7.1
- [ ] Skrip enum mencetak `bool(true)`, `bool(false)`, `bool(true)`, `bool(true)`, `Dalam Semakan`, `NULL`.
- [ ] `/cuba-model-pas` memulangkan `"ok": false` dengan ralat untuk **`pass_type`**, **`purpose`** dan **`valid_from`** (3 ralat).
- [ ] Route sementara **dibuang** dan `writable/scratch/` tidak di-commit.
- [ ] Commit: `git add app/ && git commit -m "PAS: enum PassType/PassStatus, entity & model permohonan"`

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Fatal error: Constant expression contains invalid operations` | `implode()` dalam nilai lalai `$validationRules` | Isi dalam `protected function initialize(): void` |
| `UnhandledMatchError` dalam `label()` | `case` baharu tanpa cabang `match` | Tambah cabang; ini ciri keselamatan, bukan pepijat |
| `Class "App\Enums\PassStatus" not found` | Nama fail/namespace tidak sepadan (cth `app/enums/`) | Folder `app/Enums/` (E besar), `namespace App\Enums;`. 🪟 Windows tidak membezakan huruf besar/kecil, jadi `app/enums` berfungsi di laptop tetapi gagal di server Linux dan di laptop macOS rakan sekerja. Betulkan melalui Git: `git mv app/enums app/Enums-tmp && git mv app/Enums-tmp app/Enums` |
| `ValueError: "Approved" is not a valid backing value` | `PassStatus::from('Approved')` — nilai DB ialah huruf kecil | Guna `->value` semasa simpan; `from()` hanya untuk data DB |
| `/cuba-model-pas` → `"ok": 5` (berjaya!) | `$validationRules` kosong — `initialize()` tidak dipanggil / tersalah nama | Nama tepat `initialize`, keterlihatan `protected` |

### ⭐ Cabaran tambahan
- Tambah `PassStatus::forRole(string $group): array` yang memulangkan status yang relevan untuk baris gilir setiap peranan. Adakah ini patut dalam enum atau Service? Bincang dengan jurulatih atau rakan sebelah.
- Tulis ujian PHPUnit unit `tests/unit/Enums/PassStatusTest.php` dengan atribut `#[DataProvider]` untuk **semua 25** pasangan (5×5) `canTransitionTo()`.

---

## Lab 7.2 — Laluan, Service & Paparan Senarai/Butiran (S2)

### 🎯 Objektif
Membina `/pas/permohonan` (senarai skop pemilik, filter status, pagination) dan `/pas/permohonan/{id}` yang memulangkan 404 kepada bukan pemilik (BR-PAS-04).

### Prasyarat
- Lab 7.1 selesai. Log masuk sebagai `pemohon1@latihan.test` / `Latihan@2026` berfungsi.

### Langkah

1. **Tambah route** dalam `app/Config/Routes.php` (selepas `service('auth')->routes($routes);`):

   ```php
   $routes->group('pas/permohonan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'session'], static function ($routes): void {
       $routes->get('/', 'ApplicationController::index', ['as' => 'pas.index']);
       $routes->get('new', 'ApplicationController::new', ['as' => 'pas.new']);
       $routes->post('/', 'ApplicationController::create', ['as' => 'pas.create']);
       $routes->get('(:num)', 'ApplicationController::show/$1', ['as' => 'pas.show']);
       $routes->get('dokumen/(:num)', 'ApplicationController::download/$1', ['as' => 'pas.dokumen']);
   });
   ```

   Sahkan: `php spark routes | grep pas` (PowerShell: `php spark routes | Select-String pas`) — 5 baris, lajur filter menunjukkan `session`.

2. **Cipta `app/Services/PassWorkflowService.php`** — versi awal dengan konstruktor dan `canView()` sahaja:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use App\Entities\PassApplication;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use App\Models\StatusLogModel;
   use CodeIgniter\Database\ConnectionInterface;
   use CodeIgniter\Shield\Entities\User;

   class PassWorkflowService
   {
       public const MODULE       = 'PAS';
       public const STAFF_GROUPS = ['reviewer', 'approver', 'admin'];

       private readonly PassApplicationModel $applications;
       private readonly PassDocumentModel $documents;
       private readonly StatusLogModel $statusLogs;

       public function __construct(
           private readonly ConnectionInterface $db,
           private readonly ReferenceNumberService $refs,
       ) {
           $this->applications = new PassApplicationModel($db);
           $this->documents    = new PassDocumentModel($db);
           $this->statusLogs   = new StatusLogModel($db);
       }

       /** BR-PAS-04 — pemilik, atau pegawai */
       public function canView(User $user, PassApplication $application): bool
       {
           return $application->isOwnedBy((int) $user->id)
               || $user->inGroup(...self::STAFF_GROUPS);
       }
   }
   ```

3. **Daftar Service** dalam `app/Config/Services.php` (di sebelah `bookingService` Hari 6):

   ```php
   public static function passWorkflowService(bool $getShared = true): \App\Services\PassWorkflowService
   {
       if ($getShared) {
           return static::getSharedInstance('passWorkflowService');
       }

       return new \App\Services\PassWorkflowService(
           db_connect(),
           new \App\Services\ReferenceNumberService(db_connect()),
       );
   }
   ```

4. **Cipta `app/Controllers/Pas/ApplicationController.php`** dengan `index()`, `show()` dan pembantu `findVisibleOr404()`. Untuk hari ini, `show()` memulangkan **dua** variable sahaja (`application` dan `documents`):

   `app/Controllers/Pas/ApplicationController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Pas;

   use App\Controllers\BaseController;
   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use CodeIgniter\Exceptions\PageNotFoundException;

   class ApplicationController extends BaseController
   {
       protected $helpers = ['form', 'url'];

       /** GET /pas/permohonan — "Permohonan Saya" (BR-PAS-04: SENTIASA skop pemilik) */
       public function index(): string
       {
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');   // input asing → null

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
           ]);
       }

       /** GET /pas/permohonan/{id} — butiran + dokumen (tindakan & sejarah ditambah Hari 8) */
       public function show(string $id): string
       {
           $application = $this->findVisibleOr404((int) $id);

           return view('pas/show', [
               'application' => $application,
               'documents'   => model(PassDocumentModel::class)->forApplication($application->id),
           ]);
       }

       // -----------------------------------------------------------------

       /** BR-PAS-04 — 404 (bukan 403) supaya kewujudan ID orang lain tidak didedahkan */
       private function findVisibleOr404(int $id): PassApplication
       {
           $application = model(PassApplicationModel::class)->find($id);

           if ($application === null || ! service('passWorkflowService')->canView(auth()->user(), $application)) {
               throw PageNotFoundException::forPageNotFound();
           }

           return $application;
       }
   }
   ```

   (`history` dan `actions` ditambah esok, Hari 8.)

5. **Tajuk halaman, kemudian `app/Views/pas/index.php`.** View Pas memberi tajuk melalui `section('title')`, tetapi layout Hari 4/6 hanya membaca `$title`. Gantikan dahulu seluruh kandungan `app/Views/layouts/main.php` dengan versi di bawah. Ia layout Hari 6 dengan tiga tambahan: blok `$sectionTitle`/`$pageTitle` di bahagian atas, `<title>` yang membaca `$pageTitle`, dan menu *Pas Saya*.

   `app/Views/layouts/main.php`

   ```php
   <?php
   /**
    * Layout utama — Bootstrap 5.3 + Bootstrap Icons.
    * Guna dalam view: <?= $this->extend('layouts/main') ?> + <?= $this->section('content') ?> ... <?= $this->endSection() ?>
    *
    * @var \CodeIgniter\View\View $this
    * @var string|null            $title
    */
   $user = auth()->loggedIn() ? auth()->user() : null;

   // View Pas (Hari 7–8) memberi tajuk melalui section('title'); view TLK melalui $title.
   $sectionTitle = trim($this->renderSection('title'));
   $pageTitle    = $title ?? ($sectionTitle !== '' ? $sectionTitle : 'Sistem TLK & Pas');
   ?>
   <!doctype html>
   <html lang="ms">
   <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title><?= esc($pageTitle) ?> · KKM (Latihan)</title>
       <!-- Tiada internet di makmal? Muat turun fail ke public/assets/ dan tukar href kepada base_url('assets/...') -->
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
       <?= $this->renderSection('head') ?>
   </head>
   <body class="bg-body-tertiary d-flex flex-column min-vh-100">

   <nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
       <div class="container">
           <a class="navbar-brand fw-semibold" href="<?= site_url('/') ?>">
               <i class="bi bi-p-square-fill"></i> TLK &amp; Pas
           </a>
           <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navUtama"
                   aria-controls="navUtama" aria-expanded="false" aria-label="Menu">
               <span class="navbar-toggler-icon"></span>
           </button>

           <div class="collapse navbar-collapse" id="navUtama">
               <?php if ($user !== null): ?>
                   <ul class="navbar-nav me-auto">
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.index') ?>"><i class="bi bi-list-ul"></i> Tempahan Saya</a></li>
                       <?php if ($user->can('tlk.apply')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.new') ?>"><i class="bi bi-plus-circle"></i> Mohon Slot</a></li>
                       <?php endif ?>
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.availability') ?>"><i class="bi bi-search"></i> Slot Kosong</a></li>
                       <?php if ($user->can('tlk.decide')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.decision.index') ?>"><i class="bi bi-check2-square"></i> Keputusan TLK</a></li>
                       <?php endif ?>
                       <?php if ($user->inGroup('admin')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('admin.slot.index') ?>"><i class="bi bi-gear"></i> Urus Slot</a></li>
                       <?php endif ?>
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('pas.index') ?>"><i class="bi bi-person-vcard"></i> Pas Saya</a></li>
                   </ul>
                   <span class="navbar-text me-3">
                       <i class="bi bi-person-circle"></i> <?= esc($user->full_name ?? $user->username) ?>
                   </span>
                   <a class="btn btn-outline-light btn-sm" href="<?= url_to('logout') ?>"><i class="bi bi-box-arrow-right"></i> Log Keluar</a>
               <?php endif ?>
           </div>
       </div>
   </nav>

   <main class="container py-4 flex-grow-1">
       <?php if (! empty($title)): ?>
           <h1 class="h3 mb-3"><?= esc($title) ?></h1>
       <?php endif ?>

       <?= $this->include('partials/flash') ?>

       <?= $this->renderSection('content') ?>
   </main>

   <footer class="py-3 border-top bg-white small text-muted">
       <div class="container">Sistem latihan CI-KKM-10 · data sintetik sahaja</div>
   </footer>

   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
   <script>
       // Dialog pengesahan: <form data-confirm="Anda pasti?"> — elak klik tidak sengaja.
       document.querySelectorAll('form[data-confirm]').forEach(function (form) {
           form.addEventListener('submit', function (event) {
               if (!window.confirm(form.dataset.confirm)) {
                   event.preventDefault();
               }
           });
       });
   </script>
   <?= $this->renderSection('scripts') ?>
   </body>
   </html>
   ```

   Kemudian cipta `app/Views/pas/index.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan Pas Saya<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <div class="d-flex justify-content-between align-items-center mb-3">
       <h1 class="h3 mb-0">Permohonan Pas Saya</h1>
       <a href="<?= url_to('pas.new') ?>" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Mohon Pas</a>
   </div>

   <form method="get" class="row g-2 mb-3" role="search">
       <div class="col-auto">
           <label for="status" class="visually-hidden">Status</label>
           <select name="status" id="status" class="form-select">
               <option value="">Semua status</option>
               <?php foreach (\App\Enums\PassStatus::cases() as $case): ?>
                   <option value="<?= esc($case->value, 'attr') ?>" <?= $status === $case ? 'selected' : '' ?>>
                       <?= esc($case->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
       </div>
       <div class="col-auto"><button type="submit" class="btn btn-outline-secondary">Tapis</button></div>
   </form>

   <?php if ($applications === []): ?>
       <div class="alert alert-info">Tiada permohonan untuk dipaparkan.</div>
   <?php else: ?>
       <div class="table-responsive">
           <table class="table table-hover align-middle">
               <thead>
                   <tr><th>No. Rujukan</th><th>Jenis</th><th>Tempoh Sah</th><th>Status</th><th>Tarikh Mohon</th><th></th></tr>
               </thead>
               <tbody>
               <?php foreach ($applications as $app): ?>
                   <?php $shown = $app->displayStatus(); ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($app->ref_no) ?></td>
                       <td><?= esc($app->typeEnum()->label()) ?></td>
                       <td><?= esc($app->valid_from->format('d/m/Y')) ?> – <?= esc($app->valid_until->format('d/m/Y')) ?></td>
                       <td><span class="badge <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span></td>
                       <td><?= esc($app->created_at->format('d/m/Y')) ?></td>
                       <td><a href="<?= url_to('pas.show', $app->id) ?>" class="btn btn-sm btn-outline-primary">Lihat</a></td>
                   </tr>
               <?php endforeach ?>
               </tbody>
           </table>
       </div>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```

6. **Cipta `app/Views/pas/show.php`** (versi Hari 7):

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan <?= esc($application->ref_no) ?><?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <?php $shown = $application->displayStatus(); ?>

   <div class="d-flex justify-content-between align-items-center mb-3">
       <h1 class="h3 mb-0">Permohonan <?= esc($application->ref_no) ?></h1>
       <span class="badge fs-6 <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span>
   </div>

   <dl class="row">
       <dt class="col-sm-3">Jenis pas</dt>
       <dd class="col-sm-9"><?= esc($application->typeEnum()->label()) ?></dd>

       <dt class="col-sm-3">Tujuan</dt>
       <dd class="col-sm-9"><?= nl2br(esc($application->purpose)) ?></dd>

       <dt class="col-sm-3">Tempoh sah</dt>
       <dd class="col-sm-9">
           <?= esc($application->valid_from->format('d/m/Y')) ?> hingga <?= esc($application->valid_until->format('d/m/Y')) ?>
       </dd>

       <dt class="col-sm-3">Tarikh mohon</dt>
       <dd class="col-sm-9"><?= esc($application->created_at->format('d/m/Y H:i')) ?></dd>
   </dl>

   <h2 class="h5">Dokumen Sokongan</h2>
   <ul class="list-group mb-4">
       <?php foreach ($documents as $doc): ?>
           <li class="list-group-item d-flex justify-content-between align-items-center">
               <span>
                   <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
                   <?= esc($doc['original_name']) ?>
                   <small class="text-body-secondary">(<?= esc(number_format($doc['size_bytes'] / 1024)) ?> KB)</small>
               </span>
               <a class="btn btn-sm btn-outline-secondary" href="<?= url_to('pas.dokumen', $doc['id']) ?>">
                   <i class="bi bi-download" aria-hidden="true"></i> Muat turun
               </a>
           </li>
       <?php endforeach ?>
   </ul>

   <?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>

   <a href="<?= url_to('pas.index') ?>" class="btn btn-link px-0">&larr; Kembali ke senarai</a>
   <?= $this->endSection() ?>
   ```

   `nl2br(esc(...))` — **escape dahulu**, kemudian tukar baris baharu kepada `<br>`. Jika terbalik, `<br>` sendiri akan di-escape dan `<script>` pengguna tidak.

7. **Data ujian sementara** — sebelum borang wujud (Lab 7.3), masukkan dua rekod terus melalui MySQL untuk menguji senarai & pemilikan. Dapatkan ID pengguna dahulu:

   ```sql
   SELECT u.id, i.secret AS email FROM users u
   JOIN auth_identities i ON i.user_id = u.id AND i.type = 'email_password';

   -- gantikan 2 dan 3 dengan id pemohon1 dan pemohon2
   INSERT INTO pass_applications (ref_no, user_id, pass_type, purpose, valid_from, valid_until, status, created_at, updated_at) VALUES
   ('PAS-2026-9001', 2, 'kakitangan', 'Akses Blok Pentadbiran (sintetik)', '2026-10-01', '2026-12-31', 'submitted', NOW(), NOW()),
   ('PAS-2026-9002', 3, 'kontraktor', 'Kerja penyelenggaraan lif (sintetik)', '2026-10-01', '2026-10-31', 'submitted', NOW(), NOW());
   ```

8. Uji sebagai `pemohon1`, kemudian log keluar dan uji sebagai `pemohon2`.

### ✅ Checkpoint 7.2
- [ ] `pemohon1` di `/pas/permohonan` nampak **PAS-2026-9001 sahaja**; `pemohon2` nampak **PAS-2026-9002 sahaja**.
- [ ] `/pas/permohonan?status=xyz` tidak ralat (senarai penuh dipapar); `?status=submitted` menapis.
- [ ] `pemohon2` membuka `/pas/permohonan/{id PAS-2026-9001}` → **404**.
- [ ] Log masuk `penyemak@latihan.test` membuka ID yang sama → **200** (pegawai lihat semua).
- [ ] Keluar (log out) dan buka `/pas/permohonan` → redirect ke `/login`.
- [ ] Commit: `git add app/ && git commit -m "PAS: senarai skop pemilik & paparan butiran (BR-PAS-04)"`

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Call to undefined method CodeIgniter\Config\Services::passWorkflowService()` | Kaedah didaftar di fail/kelas salah | Mesti dalam `app/Config/Services.php`, kelas `Config\Services`, `public static` |
| `Call to a member function format() on null` | Medan tarikh tiada dalam `$dates` Entity, atau data NULL | Semak `$dates`; data ujian mesti ada `valid_from`/`valid_until` |
| `Column 'user_id' in where clause is ambiguous` | `where('user_id')` bersama `join()` | `where('pass_applications.user_id', …)` |
| Senarai kosong untuk semua orang | `auth()->id()` null — filter `session` tiada pada kumpulan | Tambah `'filter' => 'session'` pada `group()` |
| `Controller or its method is not found: \App\Controllers\ApplicationController::index` | Lupa `'namespace' => 'App\Controllers\Pas'` pada kumpulan | Tambah `namespace`, atau guna `'Pas\ApplicationController::index'` |
| Flash message tidak kelihatan | Layout tidak memasukkan `partials/flash` | Semak `layouts/main.php` memanggil `$this->include('partials/flash')` dan `partials/flash.php` (Lab 4/6) memaparkan `session('message')`/`session('error')` |

### ⭐ Cabaran tambahan
- Paparkan nombor plat kenderaan dalam butiran bagi pas kenderaan (join `vehicles` dalam Model, bukan dalam view).
- Tambah kiraan per status di atas senarai ("Dihantar: 2 · Diluluskan: 1") menggunakan satu query `groupBy('status')`.

---

## Lab 7.3 — Borang, Validasi, Muat Naik & Muat Turun (S3)

### 🎯 Objektif
Membina borang permohonan dengan 1–3 dokumen yang disimpan secara selamat (BR-PAS-02), nombor rujukan `PAS-2026-000N`, log `status_logs`, dan muat turun melalui controller.

### Prasyarat
- Lab 7.2 selesai. `ReferenceNumberService` dan `StatusLogModel::record()` dari Hari 4–6 berfungsi.
- `VehicleModel` wujud dan `pemohon1` mempunyai sekurang-kurangnya satu kenderaan sintetik (cth `WXX 1234`).

### Langkah

1. **Kembangkan `PassWorkflowService` kepada versi Hari 7** — gantikan seluruh kandungan `app/Services/PassWorkflowService.php` dengan kod di bawah. Berbanding Lab 7.2, ia menambah:
   - pemalar `UPLOAD_DIR`, `MAX_FILES`, `MAX_BYTES`, `ALLOWED_EXT`
   - `submit()` — semakan → `move()` → transaksi → `status_logs` → pembersihan dalam `catch`
   - `documentPath()` — `realpath()` + semakan awalan
   - pembantu peribadi `assertDates()`, `assertVehicle()`, `assertFiles()`, `storeFile()`, `deleteStoredFiles()`

   `app/Services/PassWorkflowService.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use App\Models\StatusLogModel;
   use App\Models\VehicleModel;
   use CodeIgniter\Database\ConnectionInterface;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\Files\UploadedFile;
   use CodeIgniter\Shield\Entities\User;
   use InvalidArgumentException;
   use RuntimeException;
   use Throwable;

   class PassWorkflowService
   {
       public const MODULE        = 'PAS';            // status_logs.module
       public const UPLOAD_DIR    = 'uploads/pas/';   // relatif kepada WRITEPATH (BR-PAS-02)
       public const MAX_FILES     = 3;                // BR-PAS-02
       public const MAX_BYTES     = 2_097_152;        // BR-PAS-02: 2 MB setiap fail
       public const ALLOWED_EXT   = ['pdf', 'jpg', 'png'];
       public const STAFF_GROUPS  = ['reviewer', 'approver', 'admin'];

       private readonly PassApplicationModel $applications;
       private readonly PassDocumentModel $documents;
       private readonly StatusLogModel $statusLogs;

       public function __construct(
           private readonly ConnectionInterface $db,
           private readonly ReferenceNumberService $refs,
       ) {
           // Model dibina dengan sambungan YANG SAMA → semua tulisan berada dalam transaksi yang sama
           $this->applications = new PassApplicationModel($db);
           $this->documents    = new PassDocumentModel($db);
           $this->statusLogs   = new StatusLogModel($db);
       }

       // =================================================================
       // HARI 7 — cipta permohonan (null → submitted)
       // =================================================================

       /**
        * @param array{pass_type:string, vehicle_id?:int|string|null, purpose:string, valid_from:string, valid_until:string} $data
        * @param list<UploadedFile> $files fail yang SUDAH lulus rules validasi controller
        *
        * @throws InvalidArgumentException ralat perniagaan — mesej BM, selamat dipapar kepada pengguna
        */
       public function submit(int $userId, array $data, array $files): PassApplication
       {
           $type      = PassType::from((string) $data['pass_type']);
           $vehicleId = empty($data['vehicle_id']) ? null : (int) $data['vehicle_id'];

           // --- Semakan perniagaan SEBELUM menyentuh cakera atau DB --------------
           // BR-PAS-06
           $this->assertDates((string) $data['valid_from'], (string) $data['valid_until']);
           $this->assertVehicle($type, $vehicleId, $userId);
           $this->assertFiles($files);

           $stored        = [];
           $inTransaction = false;

           try {
               // 1) Pindah fail dahulu. Fail sistem TIDAK ikut rollback DB — kita bersihkan sendiri di catch.
               foreach ($files as $file) {
                   $stored[] = $this->storeFile($file);
               }

               // 2) Semua tulisan DB dalam SATU transaksi: permohonan + dokumen + log
               $this->db->transException(true)->transBegin();   // ralat query → exception
               $inTransaction = true;

               $refNo = $this->refs->next('PAS');   // PAS-2026-0001 — mesti dalam transaksi (FOR UPDATE)

               $id = $this->applications->insert([
                   'ref_no'      => $refNo,
                   'user_id'     => $userId,
                   'pass_type'   => $type->value,
                   'vehicle_id'  => $type->requiresVehicle() ? $vehicleId : null,
                   'purpose'     => trim((string) $data['purpose']),
                   'valid_from'  => (string) $data['valid_from'],
                   'valid_until' => (string) $data['valid_until'],
                   'status'      => PassStatus::Submitted->value,   // BUKAN dari input pengguna
               ], true);

               if ($id === false) {
                   throw new RuntimeException('Gagal menyimpan permohonan: ' . implode(' ', $this->applications->errors()));
               }

               foreach ($stored as $doc) {
                   if ($this->documents->insert($doc + ['application_id' => (int) $id]) === false) {
                       throw new RuntimeException('Gagal menyimpan dokumen: ' . implode(' ', $this->documents->errors()));
                   }
               }

               // BR-PAS-05: log penciptaan (from_status = NULL)
               if (! $this->statusLogs->record(self::MODULE, (int) $id, null, PassStatus::Submitted->value, $userId, 'Permohonan dihantar.')) {
                   throw new RuntimeException('Gagal merekod log status.');
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               if ($inTransaction) {
                   $this->db->transRollback();
               }
               $this->deleteStoredFiles($stored);   // tiada fail "yatim" di cakera

               throw $e;
           }

           return $this->applications->find((int) $id);
       }

       /**
        * BR-PAS-04 — siapa boleh LIHAT permohonan (dan dokumennya).
        * Pemilik, atau pegawai (reviewer/approver/admin).
        */
       public function canView(User $user, PassApplication $application): bool
       {
           return $application->isOwnedBy((int) $user->id)
               || $user->inGroup(...self::STAFF_GROUPS);
       }

       /**
        * Path mutlak dokumen yang selamat untuk dimuat turun.
        * Pertahanan path traversal: path sebenar MESTI berada di dalam writable/uploads/pas/.
        *
        * @param array<string, mixed> $document baris pass_documents
        */
       public function documentPath(array $document): string
       {
           $base = realpath(WRITEPATH . self::UPLOAD_DIR);
           $path = realpath(WRITEPATH . (string) $document['stored_path']);

           if ($base === false || $path === false || ! is_file($path)
               || ! str_starts_with($path, $base . DIRECTORY_SEPARATOR)) {
               throw PageNotFoundException::forPageNotFound('Dokumen tidak dijumpai.');
           }

           return $path;
       }

       // =================================================================
       // Dalaman
       // =================================================================

       /** BR-PAS-06: valid_until >= valid_from (tiada had tempoh maksimum untuk Pas) */
       private function assertDates(string $from, string $until): void
       {
           if ($until < $from) {   // format Y-m-d → perbandingan string = perbandingan tarikh
               throw new InvalidArgumentException('Tarikh "Sah hingga" mesti sama atau selepas "Sah dari".');
           }
       }

       /** BR-PAS-06: pas kenderaan → kenderaan wajib DAN mesti milik pemohon (cegah IDOR melalui medan borang) */
       private function assertVehicle(PassType $type, ?int $vehicleId, int $userId): void
       {
           if (! $type->requiresVehicle()) {
               return;
           }

           $owned = $vehicleId !== null && model(VehicleModel::class)
               ->where('id', $vehicleId)
               ->where('user_id', $userId)
               ->countAllResults() === 1;

           if (! $owned) {
               throw new InvalidArgumentException('Sila pilih kenderaan anda yang berdaftar untuk pas kenderaan.');
           }
       }

       /** @param list<UploadedFile> $files */
       private function assertFiles(array $files): void
       {
           if ($files === [] || count($files) > self::MAX_FILES) {
               throw new InvalidArgumentException('Sila lampirkan 1 hingga 3 dokumen sokongan.');
           }

           foreach ($files as $file) {
               // guessExtension() diterbitkan dari MIME sebenar (finfo) — lapisan kedua selepas ext_in/mime_in.
               // Sambungan nama fail MESTI sama dengan kandungan (cth PNG bernama .pdf ditolak).
               $guessed = $file->guessExtension();

               if (! $file->isValid()
                   || ! in_array($guessed, self::ALLOWED_EXT, true)
                   || strtolower($file->getClientExtension()) !== $guessed) {
                   throw new InvalidArgumentException('Dokumen tidak sah. Hanya PDF, JPG atau PNG dibenarkan.');
               }

               if ((int) $file->getSize() > self::MAX_BYTES) {
                   throw new InvalidArgumentException('Setiap fail mestilah tidak melebihi 2 MB.');
               }
           }
       }

       /**
        * @return array{doc_type:string, original_name:string, mime:string, size_bytes:int, stored_path:string}
        */
       private function storeFile(UploadedFile $file): array
       {
           // Baca metadata SEBELUM move() — selepas dipindah, fail sementara sudah tiada
           $meta = [
               'doc_type'      => 'sokongan',
               'original_name' => mb_substr($file->getClientName(), 0, 255),   // untuk paparan SAHAJA
               'mime'          => $file->getMimeType(),                         // dari kandungan (finfo)
               'size_bytes'    => (int) $file->getSize(),
           ];

           $newName = $file->getRandomName();                 // cth 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
           $file->move(WRITEPATH . self::UPLOAD_DIR, $newName); // HTTPException jika gagal

           return $meta + ['stored_path' => self::UPLOAD_DIR . $newName];
       }

       /** @param list<array{stored_path:string}> $stored */
       private function deleteStoredFiles(array $stored): void
       {
           foreach ($stored as $doc) {
               $path = WRITEPATH . $doc['stored_path'];

               if (is_file($path)) {
                   unlink($path);
               }
           }
       }
   }
   ```

   Semua `use` yang diperlukan sudah disertakan (`PassStatus`, `PassType`, `VehicleModel`, `UploadedFile`, `PageNotFoundException`, `InvalidArgumentException`, `RuntimeException`, `Throwable`). Kaedah Hari 8 (`startReview`, `approve`, `reject`, `transition`) **belum** ada — ia ditambah esok.

   Sebelum meneruskan, terangkan dengan lisan kepada jurulatih atau rakan sebelah: *"Kenapa fail dipindah SEBELUM `transBegin()`, dan apa yang berlaku kepada fail jika `record()` gagal?"*

2. **Tambah `new()`, `create()`, `download()`, `rules()`, `uploadedFiles()`** dalam `ApplicationController` — gantikan seluruh kandungan fail dengan versi lengkap Hari 7 di bawah. `index()`, `show()`, `findVisibleOr404()` dan `protected $helpers = ['form', 'url'];` kekal seperti Lab 7.2.

   `app/Controllers/Pas/ApplicationController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Pas;

   use App\Controllers\BaseController;
   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use App\Models\VehicleModel;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\DownloadResponse;
   use CodeIgniter\HTTP\Files\UploadedFile;
   use CodeIgniter\HTTP\RedirectResponse;
   use InvalidArgumentException;

   class ApplicationController extends BaseController
   {
       protected $helpers = ['form', 'url'];

       /** GET /pas/permohonan — "Permohonan Saya" (BR-PAS-04: SENTIASA skop pemilik) */
       public function index(): string
       {
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');   // input asing → null

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
           ]);
       }

       /** GET /pas/permohonan/new — borang */
       public function new(): string
       {
           return view('pas/new', [
               'types'    => PassType::cases(),
               'vehicles' => model(VehicleModel::class)
                   ->where('user_id', (int) auth()->id())
                   ->asArray()
                   ->findAll(),
           ]);
       }

       /** POST /pas/permohonan — simpan permohonan + dokumen */
       public function create(): RedirectResponse
       {
           // 1. Validasi pelayan (medan + SETIAP fail dalam documents[])
           if (! $this->validate($this->rules())) {
               return redirect()->back()->withInput();
           }

           // 2. Serah kepada Service (bilangan fail, pemilikan kenderaan, transaksi, move())
           try {
               $application = service('passWorkflowService')->submit(
                   (int) auth()->id(),
                   $this->request->getPost(['pass_type', 'vehicle_id', 'purpose', 'valid_from', 'valid_until']),
                   $this->uploadedFiles('documents'),
               );
           } catch (InvalidArgumentException $e) {
               // 3. Ralat perniagaan → mesej mesra pengguna, input dikekalkan (fail perlu dipilih semula)
               return redirect()->back()->withInput()->with('error', $e->getMessage());
           }

           // 4. PRG — Post/Redirect/Get
           return redirect()->to(url_to('pas.show', $application->id))
               ->with('message', "Permohonan {$application->ref_no} berjaya dihantar.");
       }

       /** GET /pas/permohonan/{id} — butiran + dokumen (tindakan & sejarah ditambah Hari 8) */
       public function show(string $id): string
       {
           $application = $this->findVisibleOr404((int) $id);

           return view('pas/show', [
               'application' => $application,
               'documents'   => model(PassDocumentModel::class)->forApplication($application->id),
           ]);
       }

       /** GET /pas/permohonan/dokumen/{id} — muat turun melalui controller (fail TIADA dalam public/) */
       public function download(string $documentId): DownloadResponse
       {
           $document = model(PassDocumentModel::class)->find((int) $documentId);

           if ($document === null) {
               throw PageNotFoundException::forPageNotFound();
           }

           // BR-PAS-04 terpakai kepada FAIL juga — bukan sekadar halaman butiran
           $this->findVisibleOr404((int) $document['application_id']);

           $path = service('passWorkflowService')->documentPath($document);   // semakan path traversal

           // attachment (bukan inline) + nosniff: pelayar tidak "meneka" & merender kandungan
           return $this->response->download($path, null, true)
               ->setFileName($document['original_name'])
               ->setHeader('X-Content-Type-Options', 'nosniff');
       }

       // -----------------------------------------------------------------

       /** BR-PAS-04 — 404 (bukan 403) supaya kewujudan ID orang lain tidak didedahkan */
       private function findVisibleOr404(int $id): PassApplication
       {
           $application = model(PassApplicationModel::class)->find($id);

           if ($application === null || ! service('passWorkflowService')->canView(auth()->user(), $application)) {
               throw PageNotFoundException::forPageNotFound();
           }

           return $application;
       }

       /**
        * Rules validasi borang. BR-PAS-02 untuk fail:
        *  - uploaded : sekurang-kurangnya satu fail yang berjaya dimuat naik oleh PHP
        *  - max_size : dalam KB → 2048 = 2 MB SETIAP fail
        *  - ext_in   : (StrictRules CI 4.6) sambungan klien MESTI sama dengan guessExtension() dari kandungan
        *  - mime_in  : MIME dari kandungan (finfo), BUKAN header Content-Type dari pelayar
        *
        * @return array<string, array<string, mixed>>
        */
       private function rules(): array
       {
           $rules = [
               'pass_type' => [
                   'label' => 'Jenis pas',
                   'rules' => 'required|in_list[' . implode(',', PassType::values()) . ']',
               ],
               'vehicle_id' => [
                   'label' => 'Kenderaan',
                   'rules' => 'permit_empty|is_natural_no_zero',
               ],
               'purpose' => [
                   'label' => 'Tujuan',
                   'rules' => 'required|min_length[10]|max_length[2000]',
               ],
               'valid_from' => [
                   'label' => 'Sah dari',
                   'rules' => 'required|valid_date[Y-m-d]',
               ],
               'valid_until' => [
                   'label' => 'Sah hingga',
                   'rules' => 'required|valid_date[Y-m-d]',
               ],
               'documents' => [
                   'label'  => 'Dokumen sokongan',
                   'rules'  => 'uploaded[documents]'
                       . '|max_size[documents,2048]'
                       . '|ext_in[documents,pdf,jpg,png]'
                       . '|mime_in[documents,application/pdf,image/jpeg,image/png]',
                   'errors' => [
                       'uploaded' => 'Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah.',
                       'max_size' => 'Setiap fail mestilah tidak melebihi 2 MB.',
                       'ext_in'   => 'Hanya fail PDF, JPG atau PNG dibenarkan.',
                       'mime_in'  => 'Kandungan fail bukan PDF/JPG/PNG yang sah.',
                   ],
               ],
           ];

           // BR-PAS-06: kenderaan WAJIB hanya untuk pas kenderaan (pemilikan & tarikh disemak dalam Service)
           $type = PassType::tryFrom((string) $this->request->getPost('pass_type'));
           if ($type?->requiresVehicle()) {
               $rules['vehicle_id']['rules'] = 'required|is_natural_no_zero';
           }

           return $rules;
       }

       /**
        * Fail yang BENAR-BENAR dipilih pengguna (buang slot kosong UPLOAD_ERR_NO_FILE).
        *
        * @return list<UploadedFile>
        */
       private function uploadedFiles(string $field): array
       {
           $files = $this->request->getFileMultiple($field) ?? [];

           return array_values(array_filter(
               $files,
               static fn (UploadedFile $file): bool => $file->getError() !== UPLOAD_ERR_NO_FILE,
           ));
       }
   }
   ```

3. **Cipta `app/Views/pas/new.php`**:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan Pas Baharu<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <h1 class="h3 mb-3">Permohonan Pas Baharu</h1>

   <?php /* novalidate: kita MAHU menguji validasi pelayan, bukan HTML5 */ ?>
   <?= form_open_multipart(url_to('pas.create'), ['novalidate' => true]) ?>
   <div class="row g-3">
       <div class="col-md-6">
           <label for="pass_type" class="form-label">Jenis pas <span class="text-danger">*</span></label>
           <select name="pass_type" id="pass_type"
                   class="form-select <?= validation_show_error('pass_type') ? 'is-invalid' : '' ?>">
               <option value="">— Pilih —</option>
               <?php foreach ($types as $type): ?>
                   <option value="<?= esc($type->value, 'attr') ?>" <?= old('pass_type') === $type->value ? 'selected' : '' ?>>
                       <?= esc($type->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
           <div class="invalid-feedback"><?= validation_show_error('pass_type') ?></div>
       </div>

       <div class="col-md-6">
           <label for="vehicle_id" class="form-label">Kenderaan <small class="text-body-secondary">(wajib untuk pas kenderaan)</small></label>
           <select name="vehicle_id" id="vehicle_id"
                   class="form-select <?= validation_show_error('vehicle_id') ? 'is-invalid' : '' ?>">
               <option value="">— Tiada —</option>
               <?php foreach ($vehicles as $vehicle): ?>
                   <option value="<?= esc((string) $vehicle['id'], 'attr') ?>" <?= old('vehicle_id') === (string) $vehicle['id'] ? 'selected' : '' ?>>
                       <?= esc($vehicle['plate_no'] . ' — ' . $vehicle['model']) ?>
                   </option>
               <?php endforeach ?>
           </select>
           <div class="invalid-feedback"><?= validation_show_error('vehicle_id') ?></div>
       </div>

       <div class="col-12">
           <label for="purpose" class="form-label">Tujuan <span class="text-danger">*</span></label>
           <textarea name="purpose" id="purpose" rows="3"
                     class="form-control <?= validation_show_error('purpose') ? 'is-invalid' : '' ?>"><?= esc(old('purpose', '')) ?></textarea>
           <div class="invalid-feedback"><?= validation_show_error('purpose') ?></div>
       </div>

       <div class="col-md-6">
           <label for="valid_from" class="form-label">Sah dari <span class="text-danger">*</span></label>
           <input type="date" name="valid_from" id="valid_from" value="<?= esc(old('valid_from', ''), 'attr') ?>"
                  class="form-control <?= validation_show_error('valid_from') ? 'is-invalid' : '' ?>">
           <div class="invalid-feedback"><?= validation_show_error('valid_from') ?></div>
       </div>

       <div class="col-md-6">
           <label for="valid_until" class="form-label">Sah hingga <span class="text-danger">*</span></label>
           <input type="date" name="valid_until" id="valid_until" value="<?= esc(old('valid_until', ''), 'attr') ?>"
                  class="form-control <?= validation_show_error('valid_until') ? 'is-invalid' : '' ?>">
           <div class="invalid-feedback"><?= validation_show_error('valid_until') ?></div>
       </div>

       <div class="col-12">
           <label for="documents" class="form-label">Dokumen sokongan <span class="text-danger">*</span></label>
           <input type="file" name="documents[]" id="documents" multiple accept=".pdf,.jpg,.png"
                  class="form-control <?= validation_show_error('documents') ? 'is-invalid' : '' ?>">
           <div class="form-text">PDF, JPG atau PNG · maksimum 2 MB setiap fail · 1 hingga 3 fail. Jika borang dikembalikan, sila pilih fail semula.</div>
           <div class="invalid-feedback"><?= validation_show_error('documents') ?></div>
       </div>
   </div>

   <div class="mt-4">
       <button type="submit" class="btn btn-primary"><i class="bi bi-send"></i> Hantar Permohonan</button>
       <a href="<?= url_to('pas.index') ?>" class="btn btn-link">Batal</a>
   </div>
   <?= form_close() ?>
   <?= $this->endSection() ?>
   ```

4. **Pastikan folder muat naik tidak boleh dicapai dan tidak di-commit.** CI4 mencipta `writable/uploads/pas/` secara automatik semasa `move()`. Semak `.gitignore` projek mengandungi `writable/uploads/*` (appstarter sudah ada). Sahkan:

   ```bash
   git check-ignore -v writable/uploads/pas/contoh.pdf   # mesti memaparkan peraturan .gitignore
   ```

5. **Sediakan fail ujian sintetik** dalam folder di luar projek (cth `~/ujian-pas/`):

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p ~/ujian-pas && cd ~/ujian-pas
   printf '%%PDF-1.4\n%% Dokumen sintetik latihan KKM\n' > surat-sokongan.pdf
   echo 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' | base64 --decode > gambar.png
   ```

   ```powershell tab="PowerShell"
   mkdir $HOME\ujian-pas; cd $HOME\ujian-pas
   Set-Content -Path surat-sokongan.pdf -Value "%PDF-1.4`n% Dokumen sintetik latihan KKM" -NoNewline
   [IO.File]::WriteAllBytes("$PWD\gambar.png", [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='))
   ```

6. **Hantar permohonan pertama** sebagai `pemohon1`: jenis *Pas Akses Kakitangan*, tujuan ≥ 10 aksara, tarikh sah, lampirkan `surat-sokongan.pdf` + `gambar.png`.

7. **Sahkan di tiga tempat:**

   ```bash
   cd ~/latihan/kelas-ci-<nama>         # kembali ke folder projek (langkah 5 berada di ~/ujian-pas)
   ls -la writable/uploads/pas/          # 2 fail, nama rawak cth 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
   ls public/ | grep -i upload            # TIADA output
   ```

   ```sql
   SELECT id, ref_no, status FROM pass_applications ORDER BY id DESC LIMIT 1;
   SELECT application_id, original_name, stored_path, mime, size_bytes FROM pass_documents ORDER BY id DESC LIMIT 2;
   SELECT module, record_id, from_status, to_status, actor_id FROM status_logs WHERE module = 'PAS' ORDER BY id DESC LIMIT 1;
   ```

8. **Muat turun** kedua-dua dokumen dari halaman butiran. Buka DevTools → Network → klik respons → semak header `Content-Disposition: attachment; filename="surat-sokongan.pdf"` dan `X-Content-Type-Options: nosniff`.

### ✅ Checkpoint 7.3
- [ ] Redirect ke `/pas/permohonan/{id}` dengan mesej "Permohonan PAS-2026-000N berjaya dihantar."
- [ ] `pass_documents.stored_path` bermula `uploads/pas/` (relatif), `mime` = `application/pdf` / `image/png`, `original_name` = nama asal.
- [ ] Nama fail di cakera **berbeza** daripada nama asal; `public/` tiada folder `uploads`.
- [ ] `status_logs` ada baris `PAS · {id} · NULL → submitted`.
- [ ] Muat turun berjaya dengan nama asal; header `attachment` + `nosniff` wujud.
- [ ] Commit: `git add app/ && git commit -m "PAS: borang permohonan + muat naik dokumen selamat (BR-PAS-02)"`

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Ralat validasi `uploaded` (tiada fail diterima) walaupun fail dipilih | Borang tanpa `enctype` (guna `form_open()` bukan `form_open_multipart()`) | `form_open_multipart()` |
| Hanya **satu** fail disimpan walaupun 2 dipilih | `name="documents"` tanpa `[]` | `name="documents[]"` + `multiple` |
| `The action you requested is not allowed.` (SecurityException) semasa hantar fail besar | `post_max_size` dilepasi → `$_POST` kosong → token CSRF hilang | Naikkan `post_max_size` (16M) — Lab 7.0 |
| `mime_in` gagal untuk PDF yang sah | Extension `fileinfo` tidak dimuatkan | `extension=fileinfo` dalam `php.ini`, mulakan semula server |
| `CodeIgniter\HTTP\Exceptions\HTTPException: The file has already been moved` | `move()` dipanggil dua kali untuk fail sama | Satu `move()` sahaja dalam `storeFile()` |
| `Cannot add or update a child row: a foreign key constraint fails` pada `pass_documents` | `application_id` salah (cth `false` dari insert yang gagal) | Semak `$id === false` → baling exception (sudah dalam template) |
| `ValueError: "" is not a valid backing value` | `PassType::from()` dengan input kosong sebelum validasi | Validasi `in_list` **sebelum** memanggil Service |
| `Unable to create directory` / `Permission denied` pada `move()` | `writable/` tidak boleh ditulis oleh web server | Linux/Mac: `chmod -R 775 writable`; Windows: semak folder bukan read-only |
| Muat turun memaparkan PDF rosak/kosong | Ada output (spasi/`echo`) sebelum respons, cth selepas `?>` dalam fail config | Buang tag penutup `?>` dalam fail PHP tulen |

### ⭐ Cabaran tambahan
- Tambah pilihan `doc_type` bagi **setiap** fail (`salinan_ic`, `geran_kenderaan`, `surat_lantikan`) — cadangkan cara borang menghantar jenis per fail (`doc_types[]`).
- Hadkan jumlah **keseluruhan** saiz (cth 5 MB) dalam `assertFiles()`.
- Pas kenderaan: tolak jika kenderaan itu sudah mempunyai pas `approved` yang masih sah.

---

## Lab 7.4 — Ujian Manual Kes Sempadan (S4)

### 🎯 Objektif
Menjalankan sekurang-kurangnya 10 (sasaran 17) kes ujian sempadan untuk muat naik, validasi dan pemilikan, dan merekod keputusan dalam `docs/ujian-manual-pas.md`.

### Prasyarat
- Lab 7.3 selesai. Folder `~/ujian-pas/` ada `surat-sokongan.pdf` dan `gambar.png`.

### Langkah

1. **Jana fail sempadan** (Git Bash / macOS / Linux):

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/ujian-pas
   # Tepat 2 MB = 2 097 152 bait (9 bait header + 2 097 143)
   { printf '%%PDF-1.4\n'; head -c 2097143 /dev/zero; } > tepat-2mb.pdf
   # 2 MB + 1 KB
   { printf '%%PDF-1.4\n'; head -c 2098167 /dev/zero; } > lebih-2mb.pdf
   # 3 MB
   { printf '%%PDF-1.4\n'; head -c 3145728 /dev/zero; } > besar-3mb.pdf
   # Boleh laksana dinamakan semula .pdf
   cp "$(command -v ls)" program.pdf
   # Skrip PHP menyamar sebagai PDF (tidak berbahaya: phpinfo)
   printf '<?php phpinfo(); ?>\n' > borang.pdf
   # Sambungan .jpeg (kandungan PNG sah; SPEC hanya benarkan jpg/png)
   cp gambar.png gambar.jpeg
   cp surat-sokongan.pdf surat-2.pdf; cp surat-sokongan.pdf surat-3.pdf
   ls -l
   ```

   ```powershell tab="PowerShell"
   cd $HOME\ujian-pas
   $hdr = [Text.Encoding]::ASCII.GetBytes("%PDF-1.4`n")
   [IO.File]::WriteAllBytes("$PWD\tepat-2mb.pdf",  $hdr + (New-Object byte[] 2097143))
   [IO.File]::WriteAllBytes("$PWD\lebih-2mb.pdf",  $hdr + (New-Object byte[] 2098167))
   [IO.File]::WriteAllBytes("$PWD\besar-3mb.pdf",  $hdr + (New-Object byte[] 3145728))
   Copy-Item C:\Windows\System32\notepad.exe .\program.pdf
   Set-Content borang.pdf '<?php phpinfo(); ?>'
   Copy-Item gambar.png gambar.jpeg
   Copy-Item surat-sokongan.pdf surat-2.pdf; Copy-Item surat-sokongan.pdf surat-3.pdf
   ```

2. **Cipta `docs/ujian-manual-pas.md`** dan salin jadual di bawah. Jalankan setiap kes; isi lajur *Sebenar* dan *Keputusan*. Selepas **setiap** kes, semak `ls writable/uploads/pas/ | wc -l` dari **folder projek** (`cd ~/latihan/kelas-ci-<nama>`, bukan `~/ujian-pas`) — bilangan hanya bertambah untuk kes yang dijangka berjaya.

   | ID | Kes | Langkah | Dijangka | Sebenar | Keputusan |
   |----|-----|---------|----------|---------|-----------|
   | UT-PAS-01 | 1 PDF sah | Lampir `surat-sokongan.pdf` | Berjaya, `PAS-2026-000N`, +1 fail di cakera | | |
   | UT-PAS-02 | 3 fail sah (maks) | `surat-sokongan.pdf`, `surat-2.pdf`, `gambar.png` | Berjaya, 3 baris `pass_documents` | | |
   | UT-PAS-03 | Tiada fail | Hantar tanpa fail | "Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah." | | |
   | UT-PAS-04 | 4 fail | 4 fail sah | "Sila lampirkan 1 hingga 3 dokumen sokongan." — **tiada** fail baharu di cakera, tiada rekod | | |
   | UT-PAS-05 | Tepat 2 MB | `tepat-2mb.pdf` | Berjaya (sempadan termasuk) | | |
   | UT-PAS-06 | 2 MB + 1 KB | `lebih-2mb.pdf` | "Setiap fail mestilah tidak melebihi 2 MB." | | |
   | UT-PAS-07 | 3 MB | `besar-3mb.pdf` | "Setiap fail mestilah tidak melebihi 2 MB." | | |
   | UT-PAS-08 | Boleh laksana → `.pdf` | `program.pdf` | Ditolak ("Hanya fail PDF, JPG atau PNG…" atau "Kandungan fail bukan…") | | |
   | UT-PAS-09 | PHP → `.pdf` | `borang.pdf` | Ditolak — tiada fail `.php` di cakera | | |
   | UT-PAS-10 | `.jpeg` | `gambar.jpeg` | Ditolak (SPEC: jpg/png sahaja) — rekod sebagai "ikut SPEC" | | |
   | UT-PAS-11 | Tarikh terbalik (BR-PAS-06) | `valid_until` < `valid_from` | "Tarikh "Sah hingga" mesti sama atau selepas "Sah dari"." | | |
   | UT-PAS-12 | Pas kenderaan tanpa kenderaan (BR-PAS-06) | Jenis *Pas Kenderaan*, kenderaan "Tiada" | Ralat medan Kenderaan (required) | | |
   | UT-PAS-13 | Kenderaan orang lain (IDOR borang) | DevTools: ubah `value` `<option>` kepada ID kenderaan `pemohon2` | "Sila pilih kenderaan anda yang berdaftar untuk pas kenderaan." | | |
   | UT-PAS-14 | Butiran orang lain | `pemohon2` buka `/pas/permohonan/{id pemohon1}` | 404 | | |
   | UT-PAS-15 | Dokumen orang lain | `pemohon2` buka `/pas/permohonan/dokumen/{id dokumen pemohon1}` | 404 | | |
   | UT-PAS-16 | Akses terus fail | Buka `http://localhost:8080/writable/uploads/pas/<nama-rawak>` dan `http://localhost:8080/uploads/pas/<nama-rawak>` | 404 (tidak boleh dicapai) | | |
   | UT-PAS-17 | Pas kakitangan tanpa kenderaan, tempoh 2 tahun (BR-PAS-06) | Jenis *Pas Akses Kakitangan*, kenderaan "Tiada", `valid_until` = +2 tahun | Berjaya (kenderaan tidak wajib; tiada had maksimum) | | |

3. **Untuk UT-PAS-13**, cari ID kenderaan `pemohon2`: `SELECT id, plate_no FROM vehicles WHERE user_id = <id pemohon2>;` (`VehicleSeeder` Hari 4 mencipta `VXX 2468`; cipta satu kenderaan sintetik jika tiada).

4. **Rekod pepijat** (jika ada) di bawah jadual dengan format: *ID · Langkah hasilkan semula · Dijangka · Sebenar · Keterukan (Tinggi/Sederhana/Rendah)*. Baiki mengikut kitaran **reproduce → ujian gagal → baiki → ujian lulus**.

5. **Bersihkan** data ujian: padam rekod `PAS-2026-900x` (Lab 7.2) — atau kekalkan sebagai data demo esok. **Jangan** padam fail di `writable/uploads/pas/` secara manual tanpa memadam baris `pass_documents` yang sepadan.

### ✅ Checkpoint 7.4
- [ ] `docs/ujian-manual-pas.md` mengandungi ≥ 10 kes dengan lajur *Sebenar* & *Keputusan* diisi.
- [ ] UT-PAS-04, 08, 09: **tiada** fail baharu di `writable/uploads/pas/` dan tiada rekod `pass_applications` baharu.
- [ ] Anda boleh menerangkan kepada jurulatih **risiko OWASP** yang dicegah oleh UT-PAS-07, 09, 15 dan 16.
- [ ] Commit: `git add docs/ && git commit -m "PAS: kes ujian manual muat naik & pemilikan"` dan `git push -u origin feat/pas-permohonan`.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| UT-PAS-07 memaparkan mesej "uploaded", bukan "2 MB" | `upload_max_filesize` < 3M — PHP menolak dahulu | Lab 7.0 langkah 3 |
| UT-PAS-05 (tepat 2 MB) ditolak | Fail sebenarnya > 2 097 152 bait (cth `head -c 2097152` + header) | Semak `ls -l`: mesti **2097152** |
| UT-PAS-09 **diterima** | `mime_in` tiada atau `ext_in` guna `Rules` lama (bukan `StrictRules`) | Semak rules & `Config\Validation::$ruleSets` guna `StrictRules\FileRules` |
| UT-PAS-04 meninggalkan fail di cakera | Semakan bilangan dibuat **selepas** `move()` | `assertFiles()` mesti dipanggil sebelum gelung `storeFile()` |
| UT-PAS-16 memaparkan fail! | Fail disimpan di `public/` atau document root server menunjuk akar projek, bukan `public/` | `move(WRITEPATH . …)`; Apache/Laragon: DocumentRoot = `…/public` |
| `base64: invalid option -- d` (macOS lama) | Versi `base64` lama | Guna `base64 -D` |

### ⭐ Cabaran tambahan
- Muat naik fail bernama `"><img src=x onerror=alert(1)>.pdf` (macOS/Linux sahaja) dan sahkan nama dipapar sebagai teks dalam butiran (XSS dicegah oleh `esc()`).
- Automasikan UT-PAS-06 dengan PHPUnit menggunakan `$_FILES` palsu — apakah cabarannya? (Petunjuk: `is_uploaded_file()` dan `move_uploaded_file()`.)
- Tukar mesej validasi lalai CI4 ke Bahasa Melayu: `app/Language/ms/Validation.php` + `Config\App::$defaultLocale = 'ms'`.

---

## Semakan kendiri — akhir hari

```bash
git log --oneline -5                    # 4 commit PAS: hari ini
php spark routes | grep pas/permohonan  # 5 laluan, filter session
ls writable/uploads/pas/ | head         # nama rawak sahaja
git status                              # bersih; writable/uploads tidak dijejak
```

Peserta yang ketinggalan: salin dari `templates/kod/` (modul **Templat & Rujukan**) **selepas** jurulatih/rakan menerangkan setiap bahagian — dan tandakan dalam commit (`PAS: … (rujuk templat)`).
