# Lab Hari 7 — Modul Pas (1): Model, CRUD & Muat Naik Selamat

[⬅️ README](./README.md) · [Jadual](../JADUAL.md) · [Kanun SPEC](../docs/spesifikasi-sistem.md) · [⚡ Arahan spark](../docs/arahan-spark.md)

| Lab | Sesi | Masa | Hasil |
|-----|------|------|-------|
| 7.0 | Awal S1 | 10 min | Branch Git + `php.ini` sedia untuk muat naik |
| 7.1 | S1 | 09:10–10:00 | Enum, Entity, 2 Model |
| 7.1b | S5 | 10:00–10:30 | `PassType::icon()`, `PassStatus::pending()`, `validityDays()`/`daysRemaining()` diuji dalam `php spark shell` |
| 7.2 | S2 | 10:45–12:00 | Route, Service (`canView`), senarai & butiran |
| 7.2b | S6 | 12:00–12:30 | Filter `?pass_type=` + carian `?q=` (bukti kebocoran `orLike()` tanpa kurungan) |
| 7.3 | S3 | 14:30–15:30 | Borang + validasi + muat naik + muat turun |
| 7.3b | S7 | 15:30–16:00 | Tambah dokumen susulan (maks. 3 setiap permohonan, kunci `FOR UPDATE`) |
| 7.4 | S4 | 16:00–16:35 | 17 kes ujian sempadan direkod |
| 7.4b | S8 | 16:35–17:00 | `PassSubmitTest` PHPUnit: 14 kes sempadan automatik + mutasi `>=` |

---

## Lab 7.0 — Persediaan (10 minit, awal S1)

1. Branch baharu dari `main` yang terkini:

   ```bash tab="Git Bash / macOS / Linux"
   git switch main && git pull
   git switch -c feat/pas-permohonan
   ```

   ```powershell tab="PowerShell"
   git switch main
   git pull
   git switch -c feat/pas-permohonan
   ```

2. Semak had muat naik PHP dan extension `fileinfo`:

   ```bash tab="Git Bash / macOS / Linux"
   php --ini                                   # lokasi php.ini yang dimuatkan
   php -i | grep -E "upload_max_filesize|post_max_size|max_file_uploads"
   php -m | grep -i fileinfo                   # mesti keluar: fileinfo
   ```

   ```powershell tab="PowerShell"
   php --ini                                   # lokasi php.ini yang dimuatkan
   php -i | Select-String "upload_max_filesize|post_max_size|max_file_uploads"
   php -m | Select-String fileinfo             # mesti keluar: fileinfo
   ```

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
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
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

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p writable/scratch
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force writable\scratch | Out-Null
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
- [ ] Skrip enum mencetak `bool(true)`, `bool(false)`, `bool(true)`, `bool(true)`, `Dalam Semakan`, `NULL` (Kuiz S1).
- [ ] `/cuba-model-pas` memulangkan `"ok": false` dengan ralat untuk **`pass_type`**, **`purpose`** dan **`valid_from`** (3 ralat) (Kuiz S1).
- [ ] Route sementara **dibuang** dan `writable/scratch/` tidak di-commit (Kuiz S1).
- [ ] Commit: `git add app/ && git commit -m "PAS: enum PassType/PassStatus, entity & model permohonan"` (Kuiz S1)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Fatal error: Constant expression contains invalid operations` | `implode()` dalam nilai lalai `$validationRules` | Isi dalam `protected function initialize(): void` |
| `UnhandledMatchError` dalam `label()` | `case` baharu tanpa cabang `match` | Tambah cabang; ini ciri keselamatan, bukan pepijat |
| `Class "App\Enums\PassStatus" not found` | Nama fail/namespace tidak sepadan (cth `app/enums/`) | Folder `app/Enums/` (E besar), `namespace App\Enums;`. 🪟 Windows tidak membezakan huruf besar/kecil, jadi `app/enums` berfungsi di laptop tetapi gagal di server Linux dan di laptop macOS rakan sekerja. Betulkan melalui Git: `git mv app/enums app/Enums-tmp && git mv app/Enums-tmp app/Enums`; PowerShell: jalankan dua arahan `git mv` itu satu demi satu |
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
- [ ] `pemohon1` di `/pas/permohonan` nampak **PAS-2026-9001 sahaja**; `pemohon2` nampak **PAS-2026-9002 sahaja** (Kuiz S2).
- [ ] `/pas/permohonan?status=xyz` tidak ralat (senarai penuh dipapar); `?status=submitted` menapis (Kuiz S2).
- [ ] `pemohon2` membuka `/pas/permohonan/{id PAS-2026-9001}` → **404** (Kuiz S2).
- [ ] Log masuk `penyemak@latihan.test` membuka ID yang sama → **200** (pegawai lihat semua) (Kuiz S2).
- [ ] Keluar (log out) dan buka `/pas/permohonan` → redirect ke `/login` (Kuiz S2).
- [ ] Commit: `git add app/ && git commit -m "PAS: senarai skop pemilik & paparan butiran (BR-PAS-04)"` (Kuiz S2)

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

2. **Tambah `new()`, `create()`, `download()`, `rules()`, `uploadedFiles()`** dalam `ApplicationController` — gantikan seluruh kandungan fail dengan versi lengkap Hari 7 di bawah. `index()` kekal seperti Lab 7.2b (filter jenis + carian); `show()`, `findVisibleOr404()` dan `protected $helpers = ['form', 'url'];` kekal seperti Lab 7.2.

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

           // Lab 7.2b: penapis jenis + carian — input asing diabaikan, carian dihadkan 50 aksara
           $typeInput = $this->request->getGet('pass_type');
           $type      = PassType::tryFrom(is_string($typeInput) ? $typeInput : '');
           $qInput    = $this->request->getGet('q');
           $q         = is_string($qInput) ? mb_substr(trim($qInput), 0, 50) : '';

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->withType($type)
               ->search($q)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
               'type'         => $type,
               'q'            => $q,
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

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/latihan/kelas-ci-<nama>         # kembali ke folder projek (langkah 5 berada di ~/ujian-pas)
   ls -la writable/uploads/pas/          # 2 fail, nama rawak cth 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
   ls public/ | grep -i upload            # TIADA output
   ```

   ```powershell tab="PowerShell"
   cd $HOME\latihan\kelas-ci-<nama>                  # kembali ke folder projek (langkah 5 berada di $HOME\ujian-pas)
   Get-ChildItem -Force writable/uploads/pas/          # 2 fail, nama rawak cth 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
   Get-ChildItem public/ -Name | Select-String upload  # TIADA output
   ```

   ```sql
   SELECT id, ref_no, status FROM pass_applications ORDER BY id DESC LIMIT 1;
   SELECT application_id, original_name, stored_path, mime, size_bytes FROM pass_documents ORDER BY id DESC LIMIT 2;
   SELECT module, record_id, from_status, to_status, actor_id FROM status_logs WHERE module = 'PAS' ORDER BY id DESC LIMIT 1;
   ```

8. **Muat turun** kedua-dua dokumen dari halaman butiran. Buka DevTools → Network → klik respons → semak header `Content-Disposition: attachment; filename="surat-sokongan.pdf"` dan `X-Content-Type-Options: nosniff`.

### ✅ Checkpoint 7.3
- [ ] Redirect ke `/pas/permohonan/{id}` dengan mesej "Permohonan PAS-2026-000N berjaya dihantar." (Kuiz S3)
- [ ] `pass_documents.stored_path` bermula `uploads/pas/` (relatif), `mime` = `application/pdf` / `image/png`, `original_name` = nama asal (Kuiz S3).
- [ ] Nama fail di cakera **berbeza** daripada nama asal; `public/` tiada folder `uploads` (Kuiz S3).
- [ ] `status_logs` ada baris `PAS · {id} · NULL → submitted` (Kuiz S3).
- [ ] Muat turun berjaya dengan nama asal; header `attachment` + `nosniff` wujud (Kuiz S3).
- [ ] Commit: `git add app/ && git commit -m "PAS: borang permohonan + muat naik dokumen selamat (BR-PAS-02)"` (Kuiz S3)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Call to undefined method App\Models\PassApplicationModel::withType()` di `/pas/permohonan` | Lab 7.2b belum dibuat — controller langkah 2 memanggil skop `withType()`/`search()` | Buat Lab 7.2b langkah 2 dan 6 (skop Model) |
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

2. **Cipta `docs/ujian-manual-pas.md`** dan salin jadual di bawah. Jalankan setiap kes; isi lajur *Sebenar* dan *Keputusan*. Selepas **setiap** kes, semak `ls writable/uploads/pas/ | wc -l` (PowerShell: `(Get-ChildItem writable/uploads/pas/).Count`) dari **folder projek** (`cd ~/latihan/kelas-ci-<nama>`, bukan `~/ujian-pas`) — bilangan hanya bertambah untuk kes yang dijangka berjaya.

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

5. **Bersihkan** data ujian: padam rekod `PAS-2026-900x` (Lab 7.2), termasuk `PAS-2026-9003`–`9005` (Lab 7.2b): baris ini tiada sejarah `status_logs` dan akan mengelirukan baris gilir semakan Hari 8. **Jangan** padam fail di `writable/uploads/pas/` secara manual tanpa memadam baris `pass_documents` yang sepadan.

### ✅ Checkpoint 7.4
- [ ] `docs/ujian-manual-pas.md` mengandungi ≥ 10 kes dengan lajur *Sebenar* & *Keputusan* diisi (Kuiz S4).
- [ ] UT-PAS-04, 08, 09: **tiada** fail baharu di `writable/uploads/pas/` dan tiada rekod `pass_applications` baharu (Kuiz S4).
- [ ] Anda boleh menerangkan kepada jurulatih **risiko OWASP** yang dicegah oleh UT-PAS-07, 09, 15 dan 16 (Kuiz S4).
- [ ] Commit: `git add docs/ && git commit -m "PAS: kes ujian manual muat naik & pemilikan"` dan `git push -u origin feat/pas-permohonan` (Kuiz S4).

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
- Sebelum Lab 7.4b: fikirkan kenapa UT-PAS-06 sukar diautomasikan dengan PHPUnit menggunakan `$_FILES` palsu. (Petunjuk: `is_uploaded_file()` dan `move_uploaded_file()`; Lab 7.4b langkah 1 menjawabnya.)
- Tukar mesej validasi lalai CI4 ke Bahasa Melayu: `app/Language/ms/Validation.php` + `Config\App::$defaultLocale = 'ms'`.

---

## Lab 7.1b — Enum & Entity: Ikon, Status Menunggu & Tempoh Sah (S5)

### 🎯 Objektif
Menambah tiga kaedah baharu pada kod Lab 7.1 dengan corak yang sama (`match`, kaedah statik enum, kaedah Entity): `PassType::icon()`, `PassStatus::pending()`/`isPending()`, dan `PassApplication::validityDays()`/`daysRemaining()`, kemudian mengujinya dalam `php spark shell` tanpa database.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 7.1](#lab-71--enum-entity--model-s1) selesai dan di-commit.
- `php spark shell` (PsySH) dari [Lab 3.2b](../hari-3/lab.md#lab-32b--query-builder-dalam-konsol-s6) berfungsi.

### Langkah

1. **`PassType::icon()`** — kelas Bootstrap Icons bagi setiap jenis pas (dipakai dalam senarai Lab 7.2b). Dalam `app/Enums/PassType.php`, tambah kaedah ini **terus selepas** kaedah `requiresVehicle()`:

   ```php
       /** Kelas Bootstrap Icons untuk senarai & butiran (Lab 7.1b) */
       public function icon(): string
       {
           return match ($this) {
               self::Kenderaan  => 'bi-car-front',
               self::Kakitangan => 'bi-person-badge',
               self::Kontraktor => 'bi-tools',
           };
       }
   ```

2. **`PassStatus::pending()` dan `isPending()`** — status yang masih menunggu tindakan pegawai. Coraknya sama seperti `BookingStatus::active()` (Hari 5): satu senarai dalam enum, bukan `['submitted', 'under_review']` bertaburan di controller. Dalam `app/Enums/PassStatus.php`, tambah **terus selepas** kaedah `isFinal()`:

   ```php
       /**
        * Status yang menunggu tindakan pegawai (Lab 7.1b) — corak sama seperti BookingStatus::active().
        *
        * @return list<string> ['submitted', 'under_review']
        */
       public static function pending(): array
       {
           return [self::Submitted->value, self::UnderReview->value];
       }

       /** true jika status ini masih menunggu tindakan pegawai */
       public function isPending(): bool
       {
           return in_array($this->value, self::pending(), true);
       }
   ```

3. **`validityDays()` dan `daysRemaining()`** — dalam `app/Entities/PassApplication.php`, tambah dua kaedah ini **sebelum `}` penutup kelas** (selepas `displayStatus()`). `PassStatus` dan `Time` sudah di-`use` di bahagian atas fail:

   ```php
       /**
        * Bilangan hari kalendar dalam tempoh sah, termasuk hari pertama & terakhir
        * (1 Okt hingga 1 Okt = 1 hari) — corak sama seperti SlotBooking::durationDays().
        */
       public function validityDays(): int
       {
           return $this->valid_from->diff($this->valid_until)->days + 1;   // Time (lihat $dates)
       }

       /**
        * Baki hari pas yang DILULUSKAN, dikira dari $today (lalai: hari ini).
        * 0 = tamat hari ini. null = belum/tidak diluluskan, atau sudah tamat tempoh.
        */
       public function daysRemaining(?Time $today = null): ?int
       {
           $today ??= Time::today();
           $until = $this->valid_until;

           if ($this->statusEnum() !== PassStatus::Approved || $until->isBefore($today)) {
               return null;
           }

           return $today->diff($until)->days;
       }
   ```

   `daysRemaining()` menerima `$today` sebagai parameter supaya boleh diuji dengan tarikh tetap — ujian tidak berubah hasil mengikut hari ia dijalankan.

4. **Semak sintaks:**

   ```bash
   php -l app/Enums/PassType.php
   php -l app/Enums/PassStatus.php
   php -l app/Entities/PassApplication.php
   ```

5. **Uji dalam konsol.** `php spark shell`, kemudian taip setiap baris di bawah, tekan Enter, dan catat hasilnya. Entity dibina dalam memori — tiada rekod disimpan dalam database:

   ```text
   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use CodeIgniter\I18n\Time;
   PassStatus::pending()
   PassStatus::Approved->isPending()
   PassType::Kontraktor->icon()
   $p = new PassApplication(['user_id' => 2, 'pass_type' => 'kontraktor', 'status' => 'approved', 'valid_from' => '2026-10-01', 'valid_until' => '2026-10-31'])
   $p->validityDays()
   $p->daysRemaining(Time::parse('2026-10-20'))
   $p->daysRemaining(Time::parse('2026-10-31'))
   $p->daysRemaining(Time::parse('2026-11-01'))
   $p->status = 'submitted'
   $p->daysRemaining(Time::parse('2026-10-20'))
   $p->valid_until = '2026-10-01'
   $p->validityDays()
   exit
   ```

   Catat nilai `validityDays()` dan ketiga-tiga `daysRemaining()` (soalan Kuiz S5).

6. **Commit:**

   ```bash tab="Git Bash / macOS / Linux"
   git add app/ && git commit -m "PAS: PassType::icon, PassStatus::pending, validityDays & daysRemaining"
   ```

   ```powershell tab="PowerShell"
   git add app/
   git commit -m "PAS: PassType::icon, PassStatus::pending, validityDays & daysRemaining"
   ```

### ✅ Checkpoint
- [ ] `php -l` tiada ralat sintaks bagi `PassType.php`, `PassStatus.php` dan `PassApplication.php` (Kuiz S5).
- [ ] Dalam `php spark shell`: `PassStatus::pending()` memulangkan `submitted` dan `under_review`, `PassType::Kontraktor->icon()` memulangkan `bi-tools`, dan nilai `validityDays()` serta `daysRemaining()` langkah 5 dicatat (Kuiz S5).
- [ ] Commit `PAS: PassType::icon, PassStatus::pending, validityDays & daysRemaining` ada dalam `git log` (Kuiz S5).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Command "shell" not found` | Lab 3.2b belum dibuat dalam projek ini | Buat Lab 3.2b langkah 1–2 (`composer require --dev psy/psysh` + `app/Commands/Shell.php`) |
| Prompt `>` tidak muncul dalam Git Bash | Tetingkap mintty berasingan | Guna terminal VS Code, atau `winpty php spark shell` |
| `Call to undefined method App\Entities\PassApplication::validityDays()` | Kaedah ditampal di luar kelas, atau fail belum disimpan | Simpan fail; kaedah mesti sebelum `}` terakhir; keluar (`exit`) dan buka semula `php spark shell` |
| `validityDays()` memulangkan `30` untuk 1–31 Okt | `+ 1` tertinggal | Tempoh sah **termasuk** hari pertama dan terakhir |
| `UnhandledMatchError` dalam `icon()` | Satu `case` tiada cabang `match` | Tiga cabang tepat: `Kenderaan`, `Kakitangan`, `Kontraktor` |

### ⭐ Cabaran tambahan
- Tulis `tests/unit/Enums/PassTypeTest.php` yang memastikan **setiap** `PassType::cases()` mempunyai `icon()` bermula dengan `bi-` dan `label()` tidak kosong — ujian ini gagal secara automatik jika jenis keempat ditambah tanpa ikon.

---

## Lab 7.2b — Penapis Jenis & Carian pada "Permohonan Saya" (S6)

### 🎯 Objektif
Menambah filter `?pass_type=` dan carian `?q=` (no. rujukan atau tujuan) pada `/pas/permohonan` melalui skop Model, membuktikan bahawa `orLike()` tanpa `groupStart()` membocorkan permohonan orang lain (BR-PAS-04), dan memaparkan ikon jenis serta tempoh sah (Lab 7.1b).

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 7.2](#lab-72--laluan-service--paparan-senaraibutiran-s2) dan [Lab 7.1b](#lab-71b--enum--entity-ikon-status-menunggu--tempoh-sah-s5) selesai. Data `PAS-2026-9001` (`pemohon1`) dan `PAS-2026-9002` (`pemohon2`) dari Lab 7.2 langkah 7 wujud.

### Langkah

1. **Tiga lagi permohonan sintetik untuk `pemohon1`** — jalankan dalam klien MySQL (HeidiSQL Laragon atau `mysql`) pada database `kkm_latihan`. ID pengguna dan kenderaan dicari melalui e-mel dan plat, jadi tiada nombor untuk diganti:

   ```sql
   SET @p1 = (SELECT user_id FROM auth_identities WHERE secret = 'pemohon1@latihan.test');
   SET @v1 = (SELECT id FROM vehicles WHERE plate_no = 'WXX 1234');

   INSERT INTO pass_applications (ref_no, user_id, pass_type, vehicle_id, purpose, valid_from, valid_until, status, created_at, updated_at) VALUES
   ('PAS-2026-9003', @p1, 'kenderaan',  @v1,  'Pelekat kenderaan untuk parkir Blok A (sintetik)', '2026-11-01', '2027-10-31', 'submitted',    NOW(), NOW()),
   ('PAS-2026-9004', @p1, 'kontraktor', NULL, 'Kerja pendawaian semula Blok C (sintetik)',        '2026-10-15', '2026-12-15', 'approved',     NOW(), NOW()),
   ('PAS-2026-9005', @p1, 'kakitangan', NULL, 'Akses makmal komputer aras 3 (sintetik)',          '2026-10-01', '2026-10-01', 'under_review', NOW(), NOW());

   SELECT ref_no, pass_type, status FROM pass_applications WHERE user_id = @p1 ORDER BY ref_no;
   ```

   Hasil `SELECT`: 4 baris (`PAS-2026-9001`, `9003`, `9004`, `9005`). Rekod `PAS-2026-900x` dipadam bersama data Lab 7.2 dalam Lab 7.4 langkah 5.

2. **Skop Model — versi pertama.** Dalam `app/Models/PassApplicationModel.php`, tambah dua kaedah ini **terus sebelum** kaedah `withApplicant()`. Kaedah `search()` ini **sengaja salah**; langkah 6 membetulkannya:

   ```php
       /** Penapis jenis pas pilihan (null = semua) — Lab 7.2b */
       public function withType(?PassType $type): static
       {
           if ($type !== null) {
               $this->where('pass_applications.pass_type', $type->value);
           }

           return $this;
       }

       /** VERSI PERTAMA — sengaja tanpa kurungan (langkah 6 membetulkannya) */
       public function search(string $q): static
       {
           if ($q !== '') {
               $this->like('pass_applications.ref_no', $q)
                   ->orLike('pass_applications.purpose', $q);
           }

           return $this;
       }
   ```

3. **Controller.** Dalam `app/Controllers/Pas/ApplicationController.php`:
   - tambah `use App\Enums\PassType;` di bawah baris `use App\Enums\PassStatus;`;
   - gantikan seluruh kaedah `index()` dengan versi di bawah. `show()` dan `findVisibleOr404()` tidak berubah.

   ```php
       /** GET /pas/permohonan — "Permohonan Saya" (BR-PAS-04: SENTIASA skop pemilik) */
       public function index(): string
       {
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');   // input asing → null

           // Lab 7.2b: penapis jenis + carian — input asing diabaikan, carian dihadkan 50 aksara
           $typeInput = $this->request->getGet('pass_type');
           $type      = PassType::tryFrom(is_string($typeInput) ? $typeInput : '');
           $qInput    = $this->request->getGet('q');
           $q         = is_string($qInput) ? mb_substr(trim($qInput), 0, 50) : '';

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->withType($type)
               ->search($q)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
               'type'         => $type,
               'q'            => $q,
           ]);
       }
   ```

4. **View.** Gantikan seluruh kandungan `app/Views/pas/index.php`. Berbanding Lab 7.2: dua medan filter baharu, pautan *Set semula*, kiraan `$pager->getTotal()`, ikon jenis dan bilangan hari tempoh sah:

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
       <div class="col-auto">
           <label for="pass_type" class="visually-hidden">Jenis pas</label>
           <select name="pass_type" id="pass_type" class="form-select">
               <option value="">Semua jenis</option>
               <?php foreach (\App\Enums\PassType::cases() as $case): ?>
                   <option value="<?= esc($case->value, 'attr') ?>" <?= $type === $case ? 'selected' : '' ?>>
                       <?= esc($case->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
       </div>
       <div class="col-auto">
           <label for="q" class="visually-hidden">Carian</label>
           <input type="search" name="q" id="q" value="<?= esc($q, 'attr') ?>" maxlength="50"
                  class="form-control" placeholder="No. rujukan / tujuan">
       </div>
       <div class="col-auto"><button type="submit" class="btn btn-outline-secondary">Tapis</button></div>
       <div class="col-auto"><a href="<?= url_to('pas.index') ?>" class="btn btn-link">Set semula</a></div>
   </form>

   <?php if ($applications === []): ?>
       <div class="alert alert-info">Tiada permohonan untuk dipaparkan.</div>
   <?php else: ?>
       <p class="text-body-secondary small mb-2"><?= esc((string) $pager->getTotal()) ?> permohonan ditemui.</p>
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
                       <td><i class="bi <?= esc($app->typeEnum()->icon(), 'attr') ?>" aria-hidden="true"></i> <?= esc($app->typeEnum()->label()) ?></td>
                       <td>
                           <?= esc($app->valid_from->format('d/m/Y')) ?> – <?= esc($app->valid_until->format('d/m/Y')) ?>
                           <small class="text-body-secondary">(<?= esc((string) $app->validityDays()) ?> hari)</small>
                       </td>
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

5. **Buktikan kebocoran.** Log masuk sebagai `pemohon2@latihan.test` dan buka `http://localhost:8080/pas/permohonan?q=sintetik`. Catat baris *"N permohonan ditemui"* dan nombor rujukan yang dipaparkan (soalan Kuiz S6). Kemudian buka Debug Toolbar → tab **Database** → query `SELECT … FROM pass_applications`. SQL sebenar:

   ```sql
   -- 3 = id pemohon2 dalam contoh ini
   WHERE `pass_applications`.`user_id` = 3
   AND  `pass_applications`.`ref_no` LIKE '%sintetik%' ESCAPE '!'
   OR  `pass_applications`.`purpose` LIKE '%sintetik%' ESCAPE '!'
   ```

   `AND` diikat lebih kuat daripada `OR`, jadi MySQL membaca `(user_id = 3 AND ref_no LIKE …) OR purpose LIKE …` — syarat kedua tidak lagi dihadkan kepada pemilik. Klik **Lihat** pada `PAS-2026-9001`: `404`, kerana `findVisibleOr404()` masih menyemak pemilikan. Senarai sudah membocorkan nombor rujukan, tujuan dan tarikh.

6. **Betulkan.** Gantikan kaedah `search()` (versi pertama) dengan versi berkurungan di bawah. `withType()` kekal:

   ```php
       /**
        * Carian pada no. rujukan ATAU tujuan — Lab 7.2b.
        * groupStart()/groupEnd() = kurungan: (ref_no LIKE … OR purpose LIKE …).
        * Tanpa kurungan, OR "melompat" keluar dari skop ownedBy() (BR-PAS-04).
        */
       public function search(string $q): static
       {
           if ($q !== '') {
               $this->groupStart()
                   ->like('pass_applications.ref_no', $q)
                   ->orLike('pass_applications.purpose', $q)
                   ->groupEnd();
           }

           return $this;
       }
   ```

   Muat semula `?q=sintetik` sebagai `pemohon2`: kini **1** permohonan (`PAS-2026-9002`). Tab Database menunjukkan `AND ( … LIKE … OR … LIKE … )`.

7. **Uji filter sebagai `pemohon1`.** Catat nombor rujukan dan kiraan bagi setiap URL:

   | URL | Semak |
   |-----|-------|
   | `/pas/permohonan` | 4 permohonan; lajur Jenis berikon; `PAS-2026-9005` → `(1 hari)` |
   | `/pas/permohonan?pass_type=kontraktor&q=blok` | Soalan Kuiz S6 |
   | `/pas/permohonan?q=BLOK` | Huruf besar/kecil — collation `utf8mb4_unicode_ci` (Hari 3) |
   | `/pas/permohonan?status=approved&pass_type=kontraktor` | Dua filter serentak (status + jenis) |
   | `/pas/permohonan?pass_type=vip&q[]=x` | Tiada ralat; senarai penuh (input asing diabaikan) |

8. **Tempoh sah di halaman butiran.** Dalam `app/Views/pas/show.php`, gantikan pasangan `<dt>Tempoh sah</dt>` + `<dd>…</dd>` dengan blok di bawah. Buka `PAS-2026-9004` (`approved`): badge *Baki N hari* muncul; pada `PAS-2026-9001` (`submitted`) tiada badge.

   ```php
       <dt class="col-sm-3">Tempoh sah</dt>
       <dd class="col-sm-9">
           <?= esc($application->valid_from->format('d/m/Y')) ?> hingga <?= esc($application->valid_until->format('d/m/Y')) ?>
           <small class="text-body-secondary">(<?= esc((string) $application->validityDays()) ?> hari)</small>
           <?php $remaining = $application->daysRemaining(); ?>
           <?php if ($remaining !== null): ?>
               <span class="badge text-bg-light border">Baki <?= esc((string) $remaining) ?> hari</span>
           <?php endif ?>
       </dd>
   ```

9. **Commit** (versi `search()` berkurungan sahaja):

   ```bash tab="Git Bash / macOS / Linux"
   git add app/ && git commit -m "PAS: penapis jenis & carian Permohonan Saya (BR-PAS-04)"
   ```

   ```powershell tab="PowerShell"
   git add app/
   git commit -m "PAS: penapis jenis & carian Permohonan Saya (BR-PAS-04)"
   ```

### ✅ Checkpoint
- [ ] Dengan `search()` versi pertama, `pemohon2` di `?q=sintetik` nampak permohonan `pemohon1`; tab Database menunjukkan `OR` tanpa kurungan (Kuiz S6).
- [ ] Selepas `groupStart()`/`groupEnd()`, `pemohon2` di `?q=sintetik` nampak **1** permohonan sahaja, dan jadual langkah 7 lengkap untuk `pemohon1` (Kuiz S6).
- [ ] Halaman butiran memaparkan `(N hari)` dan badge *Baki N hari* untuk pas `approved` sahaja; commit `PAS: penapis jenis & carian Permohonan Saya (BR-PAS-04)` (Kuiz S6).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Undefined variable $type` dalam `pas/index.php` | `index()` lama masih menghantar 3 variable sahaja | Langkah 3: `index()` baharu menghantar `type` dan `q` |
| `Class "App\Controllers\Pas\PassType" not found` | `use App\Enums\PassType;` tertinggal dalam controller | Tambah baris `use` (langkah 3) |
| `Call to undefined method App\Models\PassApplicationModel::search()` | Kaedah ditampal dalam kelas lain, atau fail belum disimpan | Mesti dalam `PassApplicationModel`, sebelum `withApplicant()` |
| Pautan halaman 2 kehilangan `?q=` | Pautan pager ditulis sendiri | Guna `$pager->links()` — pager CI4 mengekalkan query string semasa |
| `?q=%` memaparkan semua permohonan sendiri | `like()` CI4 tidak meng-escape `%` dan `_` dalam nilai | Bukan kebocoran (masih skop pemilik) — lihat ⭐ |

### ⭐ Cabaran tambahan
- Escape aksara wildcard: `->like('pass_applications.ref_no', $this->db->escapeLikeString($q))` (sama untuk `orLike`). Uji `?q=%` sekali lagi — kini tiada hasil.
- Tambah kiraan per jenis di atas jadual ("Kenderaan: 1 · Kakitangan: 2 · Kontraktor: 1") dengan satu query `groupBy('pass_type')` dalam skop `ownedBy()`.

---

## Lab 7.3b — Tambah Dokumen Susulan pada Permohonan (S7)

### 🎯 Objektif
Membina route `POST /pas/permohonan/{id}/dokumen` yang membenarkan **pemilik** menambah dokumen pada permohonan `submitted` sedia ada, dengan rules fail yang sama seperti Lab 7.3, had **3 dokumen bagi setiap permohonan** (BR-PAS-02) disemak sebelum `move()` dan sekali lagi di bawah kunci baris `FOR UPDATE`, serta pembersihan fail jika gagal.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 7.3](#lab-73--borang-validasi-muat-naik--muat-turun-s3) selesai: `PAS-2026-0001` milik `pemohon1` mempunyai **2** dokumen (`surat-sokongan.pdf`, `gambar.png`).
- Folder `~/ujian-pas/` ada `surat-sokongan.pdf` dan `gambar.png` (Lab 7.3 langkah 5).

### Langkah

1. **Fail ujian tambahan:**

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/ujian-pas
   cp surat-sokongan.pdf surat-2.pdf; cp surat-sokongan.pdf surat-3.pdf
   printf '<?php phpinfo(); ?>\n' > borang.pdf
   cd ~/latihan/kelas-ci-<nama>
   ```

   ```powershell tab="PowerShell"
   cd $HOME\ujian-pas
   Copy-Item surat-sokongan.pdf surat-2.pdf
   Copy-Item surat-sokongan.pdf surat-3.pdf
   Set-Content -Path borang.pdf -Value '<?php phpinfo(); ?>' -Encoding ascii
   cd $HOME\latihan\kelas-ci-<nama>
   ```

2. **Route.** Dalam `app/Config/Routes.php`, tambah dua baris ini **selepas** `});` penutup kumpulan `pas/permohonan` (bukan di dalamnya):

   ```php
   // Lab 7.3b — di LUAR kumpulan supaya kekal apabila Lab 8.2 menggantikan kumpulan pas/permohonan
   $routes->post('pas/permohonan/(:num)/dokumen', 'Pas\ApplicationController::addDocuments/$1', ['as' => 'pas.dokumen.tambah', 'filter' => 'session']);
   ```

   Lab 8.2 akan menggantikan seluruh kumpulan `pas/permohonan`; route di luar kumpulan tidak tersentuh. Sahkan: `php spark routes | grep pas/permohonan` (PowerShell: `php spark routes | Select-String pas/permohonan`) → **6** baris, termasuk `POST | pas/permohonan/([0-9]+)/dokumen | pas.dokumen.tambah`.

3. **Service — kaedah awam.** Dalam `app/Services/PassWorkflowService.php`, tambah blok ini **terus selepas** kaedah `submit()` (sebelum docblock `canView()`). Semua `use` yang diperlukan sudah ada sejak Lab 7.3:

   ```php
       // =================================================================
       // LAB 7.3b — tambah dokumen susulan (status kekal submitted)
       // =================================================================

       /**
        * @param list<UploadedFile> $files fail yang SUDAH lulus rules validasi controller
        *
        * @return int bilangan dokumen yang ditambah
        *
        * @throws InvalidArgumentException ralat perniagaan — mesej BM, selamat dipapar kepada pengguna
        */
       public function addDocuments(int $applicationId, int $userId, array $files): int
       {
           $application = $this->applications->find($applicationId);

           // Pemilik SAHAJA: pegawai boleh melihat (canView), tetapi tidak menambah dokumen bagi pihak pemohon
           if ($application === null || ! $application->isOwnedBy($userId)) {
               throw PageNotFoundException::forPageNotFound();
           }

           // --- Semakan SEBELUM menyentuh cakera (sama seperti submit()) --------
           $this->assertSubmitted($application->statusEnum());
           $this->assertFiles($files);                                  // jenis, saiz, 1–3 fail
           $this->assertDocumentQuota($applicationId, count($files));   // BR-PAS-02: jumlah ≤ 3

           $stored        = [];
           $inTransaction = false;

           try {
               foreach ($files as $file) {
                   $stored[] = $this->storeFile($file);
               }

               $this->db->transException(true)->transBegin();
               $inTransaction = true;

               // Kunci baris permohonan (corak Lab 6.2): dua tab serentak tidak boleh melepasi had,
               // dan pegawai tidak boleh "Mula Semakan" di tengah-tengah tambahan ini.
               $row = $this->db->query('SELECT status FROM pass_applications WHERE id = ? FOR UPDATE', [$applicationId])->getRowArray();
               $this->assertSubmitted(PassStatus::from((string) $row['status']));
               $this->assertDocumentQuota($applicationId, count($stored));   // kira semula di bawah kunci

               foreach ($stored as $doc) {
                   if ($this->documents->insert($doc + ['application_id' => $applicationId]) === false) {
                       throw new RuntimeException('Gagal menyimpan dokumen: ' . implode(' ', $this->documents->errors()));
                   }
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               if ($inTransaction) {
                   $this->db->transRollback();
               }
               $this->deleteStoredFiles($stored);   // tiada fail "yatim" di cakera

               throw $e;
           }

           return count($stored);
       }
   ```

4. **Service — dua pembantu.** Dalam fail yang sama, bahagian *Dalaman*, tambah **terus sebelum** docblock `/** @param list<UploadedFile> $files */` kaedah `assertFiles()`:

   ```php
       /** Lab 7.3b: dokumen hanya boleh ditambah sebelum pegawai mula menyemak */
       private function assertSubmitted(PassStatus $status): void
       {
           if ($status !== PassStatus::Submitted) {
               throw new InvalidArgumentException('Dokumen hanya boleh ditambah sebelum permohonan mula disemak.');
           }
       }

       /** Lab 7.3b — BR-PAS-02: maksimum 3 dokumen bagi SETIAP permohonan (sedia ada + baharu) */
       private function assertDocumentQuota(int $applicationId, int $adding): void
       {
           $existing = $this->documents->where('application_id', $applicationId)->countAllResults();

           if ($existing + $adding > self::MAX_FILES) {
               throw new InvalidArgumentException(sprintf(
                   'Permohonan ini sudah ada %d dokumen. Maksimum %d dokumen bagi setiap permohonan.',
                   $existing,
                   self::MAX_FILES,
               ));
           }
       }
   ```

5. **Controller.** Dalam `app/Controllers/Pas/ApplicationController.php`, tambah kaedah ini **terus selepas** `download()` (sebelum baris `// -----`). Ia memanggil `rules()` dan `uploadedFiles()` yang sedia ada:

   ```php
       /** POST /pas/permohonan/{id}/dokumen — tambah dokumen susulan (Lab 7.3b) */
       public function addDocuments(string $id): RedirectResponse
       {
           $application = $this->findVisibleOr404((int) $id);
           $back        = url_to('pas.show', $application->id);

           // Rule fail yang SAMA seperti borang permohonan — satu sumber kebenaran (BR-PAS-02)
           if (! $this->validate(['documents' => $this->rules()['documents']])) {
               return redirect()->to($back)->withInput();
           }

           try {
               $added = service('passWorkflowService')->addDocuments(
                   $application->id,
                   (int) auth()->id(),
                   $this->uploadedFiles('documents'),
               );
           } catch (InvalidArgumentException $e) {
               return redirect()->to($back)->with('error', $e->getMessage());
           }

           return redirect()->to($back)->with('message', "{$added} dokumen ditambah pada {$application->ref_no}.");
       }
   ```

6. **View.** Dalam `app/Views/pas/show.php`, gantikan baris `<?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>` dengan blok di bawah. Baris komen Hari 8 itu **kekal** di hujung blok — Lab 8.1 menggantikannya esok:

   ```php
   <?php
   // Lab 7.3b: pemilik boleh menambah dokumen selagi permohonan belum disemak dan masih < 3 dokumen
   $canAddDocuments = $application->isOwnedBy((int) auth()->id())
       && $application->statusEnum() === \App\Enums\PassStatus::Submitted
       && count($documents) < \App\Services\PassWorkflowService::MAX_FILES;
   ?>
   <?php if ($canAddDocuments): ?>
       <div class="card mb-4">
           <div class="card-header"><i class="bi bi-paperclip" aria-hidden="true"></i> Tambah dokumen susulan</div>
           <div class="card-body">
               <?= form_open_multipart(url_to('pas.dokumen.tambah', $application->id), ['novalidate' => true]) ?>
                   <label for="documents" class="form-label">Dokumen sokongan</label>
                   <input type="file" name="documents[]" id="documents" multiple accept=".pdf,.jpg,.png"
                          class="form-control <?= validation_show_error('documents') ? 'is-invalid' : '' ?>">
                   <div class="invalid-feedback"><?= validation_show_error('documents') ?></div>
                   <div class="form-text">
                       PDF, JPG atau PNG · maksimum 2 MB setiap fail · boleh tambah
                       <?= esc((string) (\App\Services\PassWorkflowService::MAX_FILES - count($documents))) ?> dokumen lagi.
                   </div>
                   <button type="submit" class="btn btn-outline-primary mt-2"><i class="bi bi-upload" aria-hidden="true"></i> Muat naik</button>
               <?= form_close() ?>
           </div>
       </div>
   <?php endif ?>

   <?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>
   ```

7. **Uji sebagai `pemohon1`** pada `PAS-2026-0001` (2 dokumen). Selepas setiap percubaan, `ls writable/uploads/pas/ | wc -l` (PowerShell: `(Get-ChildItem writable/uploads/pas/).Count`) dari folder projek:

   | # | Pilih fail | Dijangka |
   |---|-----------|----------|
   | a | `surat-2.pdf` **dan** `surat-3.pdf` | Mesej merah (soalan Kuiz S7); bilangan fail di cakera tidak berubah |
   | b | `borang.pdf` | *Hanya fail PDF, JPG atau PNG dibenarkan.* di bawah medan |
   | c | Tiada fail | *Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah.* |
   | d | `surat-2.pdf` sahaja | *1 dokumen ditambah pada PAS-2026-0001.*; senarai 3 dokumen; kad *Tambah dokumen susulan* hilang; +1 fail di cakera |

8. **IDOR melalui borang.** Log masuk sebagai `pemohon2` (tetingkap inkognito) dan buka `PAS-2026-9002` (0 dokumen — kad muncul). DevTools (F12) → **Elements** → cari `<form … action="…/pas/permohonan/<id 9002>/dokumen">` → klik dua kali nilai `action` → tukar ID kepada ID `PAS-2026-0001` → Enter. Pilih `surat-3.pdf` → **Muat naik**. Catat respons (soalan Kuiz S7).

9. **Borang lapuk (status berubah).** Masih sebagai `pemohon2`, buka semula `PAS-2026-9002` (kad muncul). **Jangan** muat semula halaman. Dalam klien MySQL:

   ```sql
   UPDATE pass_applications SET status = 'under_review' WHERE ref_no = 'PAS-2026-9002';
   ```

   Kembali ke tab, pilih `surat-3.pdf` → **Muat naik** → *Dokumen hanya boleh ditambah sebelum permohonan mula disemak.* Kad kini tiada. Pulihkan:

   ```sql
   UPDATE pass_applications SET status = 'submitted' WHERE ref_no = 'PAS-2026-9002';
   ```

10. **Commit:**

    ```bash tab="Git Bash / macOS / Linux"
    git add app/ && git commit -m "PAS: tambah dokumen susulan, had 3 dokumen setiap permohonan (BR-PAS-02)"
    ```

    ```powershell tab="PowerShell"
    git add app/
    git commit -m "PAS: tambah dokumen susulan, had 3 dokumen setiap permohonan (BR-PAS-02)"
    ```

### ✅ Checkpoint
- [ ] `php spark routes | grep pas/permohonan` → 6 baris termasuk `pas.dokumen.tambah` dengan filter `session` (Kuiz S7).
- [ ] Kes a–c langkah 7 ditolak tanpa fail baharu di cakera; kes d menjadikan `PAS-2026-0001` 3 dokumen dan kad tambah hilang (Kuiz S7).
- [ ] `pemohon2` yang menukar `action` borang ke permohonan `pemohon1` ditolak, dan borang lapuk selepas `under_review` ditolak dengan mesej BM (Kuiz S7).
- [ ] Commit `PAS: tambah dokumen susulan, had 3 dokumen setiap permohonan (BR-PAS-02)` (Kuiz S7).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Route "pas.dokumen.tambah" not found` / `InvalidArgumentException` dalam `url_to()` | Route belum ditambah, atau ditambah di fail lain | Langkah 2 — dalam `app/Config/Routes.php`, selepas kumpulan |
| `Controller or its method is not found: \App\Controllers\ApplicationController::addDocuments` | `Pas\` tertinggal dalam rentetan controller (route di luar kumpulan tiada `namespace`) | `'Pas\ApplicationController::addDocuments/$1'` |
| Kad tambah tidak muncul untuk pemilik | Status bukan `submitted`, atau sudah 3 dokumen | Semak `SELECT status FROM pass_applications …` dan bilangan `pass_documents` |
| Mesej ralat validasi tidak dipaparkan di bawah medan | `redirect()->to(...)` tanpa `->withInput()` | `withInput()` membawa ralat validasi ke request seterusnya |
| `Call to undefined method …::assertDocumentQuota()` | Langkah 4 tertinggal | Tambah dua pembantu dalam `PassWorkflowService` |
| Fail dipindah ke cakera dahulu, kemudian baru mesej *sudah ada N dokumen* | Panggilan pertama `assertDocumentQuota()` tertinggal; hanya semakan di bawah kunci berjalan | Panggil **sebelum** gelung `storeFile()` (langkah 3) — semakan murah dahulu, cakera kemudian |

### ⭐ Cabaran tambahan
- Rekod tambahan dokumen dalam jadual audit tanpa melanggar maksud `status_logs` (`from_status` = `to_status` = `submitted`, `remarks` = *"2 dokumen ditambah"*). Adakah ini wajar, atau patut ada jadual lain? Bincang dengan jurulatih.
- Benarkan pemilik **memadam** dokumen sendiri semasa `submitted` (padam baris `pass_documents` **dan** fail di cakera — dalam tertib yang mana?).

---

## Lab 7.4b — Automasikan Kes Sempadan dengan PHPUnit (S8)

### 🎯 Objektif
Mengautomasikan 10 kes sempadan Lab 7.4 dan 4 kes Lab 7.3b dalam `tests/feature/Pas/PassSubmitTest.php` menggunakan `UploadedFile` palsu, `#[DataProvider]` dan semakan "tiada kesan sampingan" (tiada baris, tiada fail yatim), kemudian membuktikan ujian itu menangkap pepijat `>` vs `>=` dengan mutasi sengaja.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 7.4](#lab-74--ujian-manual-kes-sempadan-s4) dan [Lab 7.3b](#lab-73b--tambah-dokumen-susulan-pada-permohonan-s7) selesai.
- Database ujian `kkm_latihan_test` dan `database.tests.*` dalam `.env` (Lab 6.3): `php spark db:table --show --dbgroup tests` berjaya.

### Langkah

1. **`UploadedFile` palsu.** Dalam CLI, `is_uploaded_file()` dan `move_uploaded_file()` sentiasa `false`, jadi `UploadedFile` sebenar tidak boleh digunakan dalam ujian. Kelas ini menggantikan **dua** kaedah sahaja; `getMimeType()`, `guessExtension()` dan `getSize()` kekal kod CI4 sebenar. Folder `tests/_support/` sudah wujud (appstarter; namespace `Tests\Support` dalam `composer.json`):

   `tests/_support/FakeUploadedFile.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Support;

   use CodeIgniter\HTTP\Files\UploadedFile;

   /**
    * UploadedFile untuk ujian: fail sementara biasa, bukan dari HTTP POST.
    * Dalam CLI, is_uploaded_file() dan move_uploaded_file() sentiasa false — hanya
    * isValid() dan move() diganti. getMimeType() (finfo), guessExtension() dan getSize()
    * kekal kod CI4 sebenar, jadi semakan BR-PAS-02 diuji dengan kandungan fail sebenar.
    */
   final class FakeUploadedFile extends UploadedFile
   {
       /** Cipta fail sementara dengan kandungan & nama asal (nama dari "pelayar") yang diberi */
       public static function make(string $content, string $clientName): self
       {
           $path = tempnam(sys_get_temp_dir(), 'pas');
           file_put_contents($path, $content);

           return new self($path, $clientName, null, strlen($content), UPLOAD_ERR_OK);
       }

       public function isValid(): bool
       {
           return $this->error === UPLOAD_ERR_OK && is_file($this->path);
       }

       public function move(string $targetPath, ?string $name = null, bool $overwrite = false): bool
       {
           $targetPath = rtrim($targetPath, '/\\') . DIRECTORY_SEPARATOR;

           if (! is_dir($targetPath)) {
               mkdir($targetPath, 0775, true);
           }

           $name ??= $this->getName();
           rename($this->path, $targetPath . $name);

           $this->path     = $targetPath . $name;
           $this->name     = $name;
           $this->hasMoved = true;

           return true;
       }
   }
   ```

2. **Kelas ujian.**

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p tests/feature/Pas
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force tests\feature\Pas | Out-Null
   ```

   `tests/feature/Pas/PassSubmitTest.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Feature\Pas;

   use App\Enums\PassStatus;
   use App\Services\PassWorkflowService;
   use App\Services\ReferenceNumberService;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\Test\CIUnitTestCase;
   use CodeIgniter\Test\DatabaseTestTrait;
   use InvalidArgumentException;
   use PHPUnit\Framework\Attributes\DataProvider;
   use Tests\Support\FakeUploadedFile;

   /**
    * Lab 7.4b — kes sempadan Lab 7.4 (UT-PAS-…) diautomasikan di lapisan Service.
    * Setiap kes ditolak mesti: (1) mesej BM yang betul, (2) tiada baris baharu, (3) tiada fail baharu di cakera.
    *
    * @internal
    */
   final class PassSubmitTest extends CIUnitTestCase
   {
       use DatabaseTestTrait;

       protected $migrate   = true;
       protected $refresh   = true;
       protected $namespace = null;   // App + Shield + Settings

       private const PDF = "%PDF-1.4\n% Dokumen sintetik latihan KKM\n";
       private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

       private PassWorkflowService $service;
       private int $applicantId;
       private int $otherApplicantId;
       private int $otherVehicleId;

       /** @var list<string> fail dalam writable/uploads/pas/ SEBELUM ujian */
       private array $filesBefore = [];

       protected function setUp(): void
       {
           parent::setUp();

           $this->applicantId      = $this->makeUser('ujian_pas1', 'Pemohon Pas Satu');
           $this->otherApplicantId = $this->makeUser('ujian_pas2', 'Pemohon Pas Dua');

           $this->db->table('vehicles')->insert(['user_id' => $this->otherApplicantId, 'plate_no' => 'WXX 0002', 'model' => 'Perodua Myvi', 'color' => 'Biru']);
           $this->otherVehicleId = (int) $this->db->insertID();

           $this->service     = new PassWorkflowService($this->db, new ReferenceNumberService($this->db));
           $this->filesBefore = $this->filesOnDisk();
       }

       protected function tearDown(): void
       {
           // Buang fail yang dicipta oleh ujian ini SAHAJA — fail latihan anda kekal
           foreach (array_diff($this->filesOnDisk(), $this->filesBefore) as $path) {
               unlink($path);
           }

           parent::tearDown();
       }

       // =================================================================
       // Kes diterima (UT-PAS-01, 02, 05)
       // =================================================================

       public function testSatuPdfSahDiterima(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('surat-sokongan.pdf')]);

           $this->assertSame('PAS-' . date('Y') . '-0001', $application->ref_no);
           $this->assertSame(PassStatus::Submitted, $application->statusEnum());
           $this->seeInDatabase('pass_documents', ['application_id' => $application->id, 'original_name' => 'surat-sokongan.pdf', 'mime' => 'application/pdf']);
           $this->seeInDatabase('status_logs', ['module' => 'PAS', 'record_id' => $application->id, 'from_status' => null, 'to_status' => 'submitted']);
           $this->assertCount(1, $this->newFiles());
       }

       public function testTigaFailSahDiterima(): void
       {
           $files = [$this->pdf('surat-sokongan.pdf'), $this->pdf('surat-2.pdf'), $this->png('gambar.png')];

           $application = $this->service->submit($this->applicantId, $this->payload(), $files);

           $this->seeNumRecords(3, 'pass_documents', ['application_id' => $application->id]);
           $this->assertCount(3, $this->newFiles());
       }

       public function testTepat2MbDiterima(): void
       {
           $file = FakeUploadedFile::make(str_pad(self::PDF, PassWorkflowService::MAX_BYTES, "\0"), 'tepat-2mb.pdf');

           $application = $this->service->submit($this->applicantId, $this->payload(), [$file]);

           $this->seeInDatabase('pass_documents', ['application_id' => $application->id, 'size_bytes' => 2_097_152]);
       }

       // =================================================================
       // Kes ditolak (UT-PAS-04, 06, 08, 09, 10, 11, 13)
       // =================================================================

       /**
        * @return array<string, array{0: list<array{0: string, 1: string}>, 1: array<string, string>, 2: string}>
        */
       public static function rejectedProvider(): array
       {
           $pdf   = ["%PDF-1.4\n", 'surat.pdf'];
           $dates = ['valid_from' => '2026-11-10', 'valid_until' => '2026-11-01'];

           return [
               'UT-PAS-04 empat fail'        => [[$pdf, $pdf, $pdf, $pdf], [], '1 hingga 3 dokumen'],
               'UT-PAS-06 2 MB + 1 bait'     => [[[str_pad("%PDF-1.4\n", 2_097_153, "\0"), 'lebih-2mb.pdf']], [], 'tidak melebihi 2 MB'],
               'UT-PAS-09 PHP bernama .pdf'  => [[["<?php phpinfo(); ?>\n", 'borang.pdf']], [], 'Hanya PDF, JPG atau PNG'],
               'PNG bernama .pdf'            => [[[base64_decode(self::PNG), 'gambar.pdf']], [], 'Hanya PDF, JPG atau PNG'],
               'UT-PAS-10 sambungan .jpeg'   => [[[base64_decode(self::PNG), 'gambar.jpeg']], [], 'Hanya PDF, JPG atau PNG'],
               'UT-PAS-11 tarikh terbalik'   => [[$pdf], $dates, 'Sah hingga'],
               'UT-PAS-13 kenderaan lain'    => [[$pdf], ['pass_type' => 'kenderaan', 'vehicle_id' => 'LAIN'], 'kenderaan anda yang berdaftar'],
           ];
       }

       /**
        * @param list<array{0: string, 1: string}> $files   [kandungan, nama asal]
        * @param array<string, string>             $override medan borang yang diubah
        */
       #[DataProvider('rejectedProvider')]
       public function testKesDitolakTanpaKesanSampingan(array $files, array $override, string $message): void
       {
           if (($override['vehicle_id'] ?? null) === 'LAIN') {
               $override['vehicle_id'] = (string) $this->otherVehicleId;   // kenderaan milik pemohon LAIN (IDOR)
           }

           $uploads = array_map(static fn (array $f): FakeUploadedFile => FakeUploadedFile::make($f[0], $f[1]), $files);

           try {
               $this->service->submit($this->applicantId, $this->payload($override), $uploads);
               $this->fail('Sepatutnya InvalidArgumentException');
           } catch (InvalidArgumentException $e) {
               $this->assertStringContainsString($message, $e->getMessage());
           }

           $this->seeNumRecords(0, 'pass_applications', []);
           $this->seeNumRecords(0, 'pass_documents', []);
           $this->assertSame([], $this->newFiles(), 'Ada fail yatim di writable/uploads/pas/');
       }

       // =================================================================
       // Lab 7.3b — tambah dokumen susulan
       // =================================================================

       public function testTambahDokumenHinggaTigaDiterima(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf'), $this->png('b.png')]);

           $added = $this->service->addDocuments($application->id, $this->applicantId, [$this->pdf('c.pdf')]);

           $this->assertSame(1, $added);
           $this->seeNumRecords(3, 'pass_documents', ['application_id' => $application->id]);
       }

       public function testTambahDokumenMelebihiTigaDitolak(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf'), $this->png('b.png')]);
           $filesAfterSubmit = count($this->newFiles());

           try {
               $this->service->addDocuments($application->id, $this->applicantId, [$this->pdf('c.pdf'), $this->pdf('d.pdf')]);
               $this->fail('Sepatutnya InvalidArgumentException');
           } catch (InvalidArgumentException $e) {
               $this->assertStringContainsString('sudah ada 2 dokumen', $e->getMessage());
           }

           $this->seeNumRecords(2, 'pass_documents', ['application_id' => $application->id]);
           $this->assertCount($filesAfterSubmit, $this->newFiles());
       }

       public function testTambahDokumenSelepasSemakanDitolak(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf')]);
           $this->db->table('pass_applications')->where('id', $application->id)->update(['status' => PassStatus::UnderReview->value]);

           $this->expectException(InvalidArgumentException::class);
           $this->expectExceptionMessage('sebelum permohonan mula disemak');

           $this->service->addDocuments($application->id, $this->applicantId, [$this->pdf('c.pdf')]);
       }

       public function testOrangLainTidakBolehTambahDokumen(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf')]);

           $this->expectException(PageNotFoundException::class);

           $this->service->addDocuments($application->id, $this->otherApplicantId, [$this->pdf('c.pdf')]);
       }

       // =================================================================
       // Pembantu
       // =================================================================

       private function makeUser(string $username, string $fullName): int
       {
           $this->db->table('users')->insert(['username' => $username, 'full_name' => $fullName, 'active' => 1]);

           return (int) $this->db->insertID();
       }

       /**
        * @param array<string, string> $override
        *
        * @return array<string, string>
        */
       private function payload(array $override = []): array
       {
           return $override + [
               'pass_type'   => 'kakitangan',
               'vehicle_id'  => '',
               'purpose'     => 'Akses Blok Pentadbiran (ujian automatik)',
               'valid_from'  => '2026-11-01',
               'valid_until' => '2026-12-31',
           ];
       }

       private function pdf(string $name): FakeUploadedFile
       {
           return FakeUploadedFile::make(self::PDF, $name);
       }

       private function png(string $name): FakeUploadedFile
       {
           return FakeUploadedFile::make(base64_decode(self::PNG), $name);
       }

       /** @return list<string> */
       private function filesOnDisk(): array
       {
           return glob(WRITEPATH . PassWorkflowService::UPLOAD_DIR . '*') ?: [];
       }

       /** @return list<string> fail baharu sejak setUp() */
       private function newFiles(): array
       {
           return array_values(array_diff($this->filesOnDisk(), $this->filesBefore));
       }
   }
   ```

   Baca `rejectedProvider()`: setiap kunci (cth `UT-PAS-04 empat fail`) sepadan dengan satu baris `docs/ujian-manual-pas.md`. Kes `2 MB + 1 bait` lebih ketat daripada UT-PAS-06 manual (+1 KB).

3. **Jalankan** dan bandingkan bilangan fail di cakera sebelum dan selepas:

   ```bash tab="Git Bash / macOS / Linux"
   ls writable/uploads/pas/ | wc -l
   composer test -- --no-coverage --testdox tests/feature/Pas/PassSubmitTest.php
   ls writable/uploads/pas/ | wc -l
   ```

   ```powershell tab="PowerShell"
   (Get-ChildItem writable/uploads/pas/).Count
   composer test '--' --no-coverage --testdox tests/feature/Pas/PassSubmitTest.php
   (Get-ChildItem writable/uploads/pas/).Count
   ```

   Catat baris terakhir `OK (… tests, … assertions)` (soalan Kuiz S8). Bilangan fail di cakera **sama** sebelum dan selepas — `tearDown()` hanya memadam fail yang dicipta oleh ujian.

4. **Mutasi sengaja — adakah ujian menangkap pepijat?** Dalam `PassWorkflowService::assertFiles()`, tukar `>` kepada `>=`:

   ```php
   if ((int) $file->getSize() >= self::MAX_BYTES) {
   ```

   Jalankan semula arahan `composer test` langkah 3. Catat nama ujian yang gagal dan mesej exception (soalan Kuiz S8). Kemudian **pulihkan** `>` dan jalankan sekali lagi: `OK`.

5. **Pautkan ujian manual dengan ujian automatik.** Tambah bahagian ini di **hujung** `docs/ujian-manual-pas.md`:

   ```markdown

   ## Diautomasikan (Lab 7.4b)

   `composer test -- --no-coverage --testdox tests/feature/Pas/PassSubmitTest.php`

   | Kes manual | Ujian PHPUnit |
   |------------|---------------|
   | UT-PAS-01 | `testSatuPdfSahDiterima` |
   | UT-PAS-02 | `testTigaFailSahDiterima` |
   | UT-PAS-05 | `testTepat2MbDiterima` |
   | UT-PAS-04, 06, 09, 10, 11, 13 | `testKesDitolakTanpaKesanSampingan` (data set `UT-PAS-…`) |
   | Lab 7.3b | `testTambahDokumen…`, `testOrangLainTidakBolehTambahDokumen` |

   Kekal manual: UT-PAS-03, 07, 08, 12 (rules controller), 14–16 (HTTP & server), 17.
   ```

6. **Commit dan push:**

   ```bash tab="Git Bash / macOS / Linux"
   git add tests/ docs/ && git commit -m "PAS: ujian PHPUnit kes sempadan muat naik (BR-PAS-02/06)"
   git push
   ```

   ```powershell tab="PowerShell"
   git add tests/ docs/
   git commit -m "PAS: ujian PHPUnit kes sempadan muat naik (BR-PAS-02/06)"
   git push
   ```

### ✅ Checkpoint
- [ ] `composer test -- --no-coverage tests/feature/Pas/PassSubmitTest.php` → `OK`, dan bilangan fail dalam `writable/uploads/pas/` sama sebelum dan selepas (Kuiz S8).
- [ ] Mutasi `>=` dalam `assertFiles()` menyebabkan tepat satu ujian gagal; selepas dipulihkan semua ujian `OK` semula (Kuiz S8).
- [ ] `docs/ujian-manual-pas.md` ada bahagian *Diautomasikan (Lab 7.4b)*; commit `PAS: ujian PHPUnit kes sempadan muat naik (BR-PAS-02/06)` di-push (Kuiz S8).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Class "Tests\Support\FakeUploadedFile" not found` | Fail di folder lain, atau `autoload-dev` tiada dalam `composer.json` | Mesti `tests/_support/FakeUploadedFile.php`; semak `"Tests\\Support\\": "tests/_support"`, kemudian `composer dump-autoload` |
| `Unable to connect to the database` / ujian memadam data latihan | `database.tests.*` tiada atau menunjuk `kkm_latihan` | Lab 6.3: kumpulan `tests` → `kkm_latihan_test` **sahaja** |
| `Ada fail yatim di writable/uploads/pas/` | Semakan dipindah selepas `storeFile()` **dan** `deleteStoredFiles()` tiada dalam `catch` `submit()` | `assertFiles()` sebelum gelung `storeFile()`; `catch` memadam fail yang sudah dipindah |
| Semua kes `rejectedProvider` gagal dengan `Sepatutnya InvalidArgumentException` | `submit()` menerima fail tidak sah — `mime`/`guessExtension()` tiada | Semak `assertFiles()` Lab 7.3 dan extension `fileinfo` (`php -m`) |
| Fail `pas…` kekal dalam `%TEMP%` | `move()` palsu tidak dipanggil kerana fail ditolak | Normal — fail sementara OS; boleh dipadam bila-bila |

### ⭐ Cabaran tambahan
- Tambah kes `valid_until = valid_from` (sempadan BR-PAS-06 yang **sah**) dan kes pas kenderaan dengan kenderaan sendiri ke dalam ujian "diterima".
- Mutasi kedua: buang `$this->deleteStoredFiles($stored);` dalam `catch` `submit()`. Adakah mana-mana ujian gagal? Kenapa? (Petunjuk: di mana setiap kes ditolak — sebelum atau selepas `storeFile()`?)

---

## Semakan kendiri — akhir hari

```bash
git log --oneline -9                    # 8 commit PAS: hari ini (4 lab teras + 4 lab lanjutan)
php spark routes | grep pas/permohonan  # 6 laluan (5 + Lab 7.3b), filter session
composer test -- --no-coverage tests/feature/Pas/PassSubmitTest.php   # OK (Lab 7.4b)
ls writable/uploads/pas/ | head         # nama rawak sahaja
git status                              # bersih; writable/uploads tidak dijejak
```

🪟 PowerShell: `php spark routes | Select-String pas/permohonan`, `composer test '--' --no-coverage tests/feature/Pas/PassSubmitTest.php`, `Get-ChildItem writable/uploads/pas/ -Name | Select-Object -First 10`.

Peserta yang ketinggalan: salin dari `templates/kod/` (modul **Templat & Rujukan**) **selepas** jurulatih/rakan menerangkan setiap bahagian — dan tandakan dalam commit (`PAS: … (rujuk templat)`).
