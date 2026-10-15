# Lab Day 7 — Pass Module (1): Model, CRUD & Secure Upload

[📅 Schedule](../JADUAL.md) · [📘 SPEC canon](../SPEC-KURSUS.md) · [📖 Day 7 notes](./README.md)

> Work **in pairs** (driver/navigator — swap every session). Run every command from the **root of your CI4 project** (the folder that contains `spark`). Full trainer reference: [`templates/kod/`](../templates/kod/). **Copy only after you can explain every line** (KOLABORASI §3).

| Lab | Session | Time | Outcome |
|-----|---------|------|---------|
| 7.0 | Start of S1 | 10 min | Git branch + `php.ini` ready for uploads |
| 7.1 | S1 | 09:10–10:30 | Enums, Entity, 2 Models |
| 7.2 | S2 | 10:45–12:30 | Routes, Service (`canView`), list & detail |
| 7.3 | S3 | 14:30–16:00 | Form + validation + upload + download |
| 7.4 | S4 | 16:00–17:00 | 17 boundary test cases recorded |

---

## Lab 7.0 — Setup (10 min, start of S1)

1. New branch from the latest `main`:

   ```bash
   git switch main && git pull
   git switch -c feat/pas-permohonan
   ```

2. Check the PHP upload limits and the `fileinfo` extension:

   ```bash
   php --ini                                   # location of the loaded php.ini
   php -i | grep -E "upload_max_filesize|post_max_size|max_file_uploads"
   php -m | grep -i fileinfo                   # must print: fileinfo
   ```

   If you are not in Git Bash (PowerShell): `php -i | Select-String "upload_max_filesize|post_max_size"`.

3. If `upload_max_filesize` < `8M` or `post_max_size` < `16M`, edit `php.ini` (Laragon: *Menu → PHP → php.ini*; otherwise: `php --ini`):

   ```ini
   upload_max_filesize = 8M
   post_max_size = 16M
   extension=fileinfo
   ```

   Restart `php spark serve` (or Apache) after the change.

4. Check the application time zone in `.env` (it should already be set on Day 4) — without it `Time::today()` uses UTC and "today" is off by one day between 00:00–08:00:

   ```ini
   app.appTimezone = 'Asia/Kuala_Lumpur'
   ```

5. Confirm the Day 4 tables exist and match SPEC §3:

   ```bash
   php spark db:table pass_applications --metadata
   php spark db:table pass_documents --metadata
   ```

**✅ Checkpoint 7.0:** `upload_max_filesize` ≥ 8M, `fileinfo` is loaded, both tables exist with the fields `stored_path`, `mime`, `size_bytes`, `reviewed_by`, `approved_by`.

---

## Lab 7.1 — Enums, Entity & Model (S1)

### 🎯 Objective
Write `PassType`, `PassStatus`, the `PassApplication` Entity, `PassApplicationModel` and `PassDocumentModel` so that they comply with SPEC §2.2 & §3.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Lab 7.0 done. `BookingStatus` and `SlotBooking` (Day 5) can be used as a pattern.

### Steps

1. **Create `app/Enums/PassType.php`**. Three `case`s exactly as in the SPEC: `kenderaan`, `kakitangan`, `kontraktor`. Add `label()`, `requiresVehicle()`, `values()`, `options()`.
   Reference: [`PassType.php.txt`](../templates/kod/PassType.php.txt).

2. **Create `app/Enums/PassStatus.php`**. Five `case`s: `submitted`, `under_review`, `approved`, `rejected`, `expired`. Write `allowedTransitions()` **yourself first** from the SPEC §2.2 diagram, then `canTransitionTo()`, `label()`, `badge()`, `isFinal()`, `values()`, `options()`.
   Reference: [`PassStatus.php.txt`](../templates/kod/PassStatus.php.txt).

3. **Test the enum straight away** with a small script (not committed):

   ```bash
   mkdir -p writable/scratch
   ```

   In VS Code, create the file `writable/scratch/enum-check.php` (*File → New File*) with this content:

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

   Save it, then run:

   ```bash
   php writable/scratch/enum-check.php
   ```

4. **Create `app/Entities/PassApplication.php`** with `$dates`, `$casts` (`'?integer'` for optional FKs), `statusEnum()`, `typeEnum()`, `isOwnedBy()`, `displayStatus()`.
   Reference: [`PassApplication-Entity.php.txt`](../templates/kod/PassApplication-Entity.php.txt).

5. **Create `app/Models/PassApplicationModel.php`**:
   - `$returnType = PassApplication::class`, `$useTimestamps = true`, `$useSoftDeletes = false`.
   - `$allowedFields` — 12 fields (everything except `id`, `created_at`, `updated_at`).
   - `$validationRules` filled in inside `initialize()` (because of the enum `implode()`).
   - Scopes `ownedBy()`, `withStatus()`, `withApplicant()`.

6. **Create `app/Models/PassDocumentModel.php`** (`$returnType = 'array'`, rule `mime` `in_list[...]`, `size_bytes` `less_than_equal_to[2097152]`, method `forApplication()`).
   Reference for both models: [`PassApplicationModel.php.txt`](../templates/kod/PassApplicationModel.php.txt) (the file holds two classes — split them).

7. **Test Model validation** through a temporary route (remove it after the checkpoint). Add to `app/Config/Routes.php`:

   ```php
   // TEMPORARY — remove after Checkpoint 7.1
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

   Open `http://localhost:8080/cuba-model-pas`.

### ✅ Checkpoint 7.1
- [ ] The enum script prints `bool(true)`, `bool(false)`, `bool(true)`, `bool(true)`, `Dalam Semakan`, `NULL`.
- [ ] `/cuba-model-pas` returns `"ok": false` with errors for **`pass_type`**, **`purpose`** and **`valid_from`** (3 errors).
- [ ] The temporary route is **removed** and `writable/scratch/` is not committed.
- [ ] Commit: `git add app/ && git commit -m "PAS: enum PassType/PassStatus, entity & model permohonan"`

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Fatal error: Constant expression contains invalid operations` | `implode()` in the default value of `$validationRules` | Fill it in inside `protected function initialize(): void` |
| `UnhandledMatchError` in `label()` | New `case` without a `match` arm | Add the arm; this is a safety feature, not a bug |
| `Class "App\Enums\PassStatus" not found` | File name/namespace mismatch (e.g. `app/enums/`) | Folder `app/Enums/` (capital E), `namespace App\Enums;`. 🪟 Windows ignores upper/lower case, so `app/enums` works on your laptop but fails on a Linux server and on your partner's macOS laptop. Fix it through Git: `git mv app/enums app/Enums-tmp && git mv app/Enums-tmp app/Enums` |
| `ValueError: "Approved" is not a valid backing value` | `PassStatus::from('Approved')` — DB values are lowercase | Use `->value` when saving; `from()` is only for DB data |
| `/cuba-model-pas` → `"ok": 5` (it succeeded!) | `$validationRules` is empty — `initialize()` not called / misspelt | Exact name `initialize`, visibility `protected` |

### ⭐ Bonus challenge
- Add `PassStatus::forRole(string $group): array` that returns the statuses relevant to each role's queue. Does this belong in the enum or in the Service? Discuss with your partner.
- Write a PHPUnit unit test `tests/unit/Enums/PassStatusTest.php` with a `#[DataProvider]` attribute for **all 25** (5×5) `canTransitionTo()` pairs.

---

## Lab 7.2 — Routes, Service & List/Detail Views (S2)

### 🎯 Objective
Build `/pas/permohonan` (owner-scoped list, status filter, pagination) and `/pas/permohonan/{id}`, which returns 404 to anyone who is not the owner (BR-PAS-04).

### Prerequisites
- Lab 7.1 done. Logging in as `pemohon1@latihan.test` / `Latihan@2026` works.

### Steps

1. **Add the routes** in `app/Config/Routes.php` (after `service('auth')->routes($routes);`):

   ```php
   $routes->group('pas/permohonan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'session'], static function ($routes): void {
       $routes->get('/', 'ApplicationController::index', ['as' => 'pas.index']);
       $routes->get('new', 'ApplicationController::new', ['as' => 'pas.new']);
       $routes->post('/', 'ApplicationController::create', ['as' => 'pas.create']);
       $routes->get('(:num)', 'ApplicationController::show/$1', ['as' => 'pas.show']);
       $routes->get('dokumen/(:num)', 'ApplicationController::download/$1', ['as' => 'pas.dokumen']);
   });
   ```

   Confirm: `php spark routes | grep pas` (PowerShell: `php spark routes | Select-String pas`) — 5 rows, the filter column shows `session`.

2. **Create `app/Services/PassWorkflowService.php`** — an early version with the constructor and `canView()` only:

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

       /** BR-PAS-04 — the owner, or an officer */
       public function canView(User $user, PassApplication $application): bool
       {
           return $application->isOwnedBy((int) $user->id)
               || $user->inGroup(...self::STAFF_GROUPS);
       }
   }
   ```

3. **Register the Service** in `app/Config/Services.php` (next to Day 6's `bookingService`):

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

4. **Create `app/Controllers/Pas/ApplicationController.php`** with `index()`, `show()` and the helper `findVisibleOr404()`. Copy the relevant parts from [`ApplicationController-upload.php.txt`](../templates/kod/ApplicationController-upload.php.txt). For today, `show()` returns **two** variables only:

   ```php
   public function show(string $id): string
   {
       $application = $this->findVisibleOr404((int) $id);

       return view('pas/show', [
           'application' => $application,
           'documents'   => model(PassDocumentModel::class)->forApplication($application->id),
       ]);
   }
   ```

   (`history` and `actions` are added tomorrow, Day 8.)

5. **Page title, then `app/Views/pas/index.php`.** Pas views set the title via `section('title')`, but the Day 4/6 layout only reads `$title`. First update the top of `app/Views/layouts/main.php` (as in [`layout-main.php.txt`](../templates/kod/layout-main.php.txt)):

   ```php
   <?php
   $user = auth()->loggedIn() ? auth()->user() : null;

   // Pas views set the title via section('title'); TLK views via $title.
   $sectionTitle = trim($this->renderSection('title'));
   $pageTitle    = $title ?? ($sectionTitle !== '' ? $sectionTitle : 'Sistem TLK & Pas');
   ?>
   <!-- … inside <head>: -->
   <title><?= esc($pageTitle) ?> · KKM (Latihan)</title>
   ```

   Then create `app/Views/pas/index.php`:

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

6. **Create `app/Views/pas/show.php`** (Day 7 version):

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

   <?php /* Day 8: the officer action panel + status history will be added here */ ?>

   <a href="<?= url_to('pas.index') ?>" class="btn btn-link px-0">&larr; Kembali ke senarai</a>
   <?= $this->endSection() ?>
   ```

   `nl2br(esc(...))` — **escape first**, then turn line breaks into `<br>`. If you reverse the order, your own `<br>` gets escaped and the user's `<script>` does not.

7. **Temporary test data** — before the form exists (Lab 7.3), insert two records directly through MySQL to test the list & ownership. Get the user IDs first:

   ```sql
   SELECT u.id, i.secret AS email FROM users u
   JOIN auth_identities i ON i.user_id = u.id AND i.type = 'email_password';

   -- replace 2 and 3 with the ids of pemohon1 and pemohon2
   INSERT INTO pass_applications (ref_no, user_id, pass_type, purpose, valid_from, valid_until, status, created_at, updated_at) VALUES
   ('PAS-2026-9001', 2, 'kakitangan', 'Akses Blok Pentadbiran (sintetik)', '2026-10-01', '2026-12-31', 'submitted', NOW(), NOW()),
   ('PAS-2026-9002', 3, 'kontraktor', 'Kerja penyelenggaraan lif (sintetik)', '2026-10-01', '2026-10-31', 'submitted', NOW(), NOW());
   ```

8. Test as `pemohon1`, then log out and test as `pemohon2`.

### ✅ Checkpoint 7.2
- [ ] `pemohon1` at `/pas/permohonan` sees **PAS-2026-9001 only**; `pemohon2` sees **PAS-2026-9002 only**.
- [ ] `/pas/permohonan?status=xyz` does not error (the full list is shown); `?status=submitted` filters.
- [ ] `pemohon2` opening `/pas/permohonan/{id PAS-2026-9001}` → **404**.
- [ ] Logged in as `penyemak@latihan.test`, opening the same ID → **200** (officers see everything).
- [ ] Log out and open `/pas/permohonan` → redirect to `/login`.
- [ ] Commit: `git add app/ && git commit -m "PAS: senarai skop pemilik & paparan butiran (BR-PAS-04)"`

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Call to undefined method CodeIgniter\Config\Services::passWorkflowService()` | Method registered in the wrong file/class | It must be in `app/Config/Services.php`, class `Config\Services`, `public static` |
| `Call to a member function format() on null` | Date field missing from the Entity's `$dates`, or the data is NULL | Check `$dates`; test data must have `valid_from`/`valid_until` |
| `Column 'user_id' in where clause is ambiguous` | `where('user_id')` together with `join()` | `where('pass_applications.user_id', …)` |
| Empty list for everyone | `auth()->id()` is null — the `session` filter is missing on the group | Add `'filter' => 'session'` to `group()` |
| `Controller or its method is not found: \App\Controllers\ApplicationController::index` | Forgot `'namespace' => 'App\Controllers\Pas'` on the group | Add `namespace`, or use `'Pas\ApplicationController::index'` |
| Flash message not visible | The layout does not include `partials/flash` | Check that `layouts/main.php` calls `$this->include('partials/flash')` and `partials/flash.php` (Lab 4/6) shows `session('message')`/`session('error')` |

### ⭐ Bonus challenge
- Show the vehicle plate number in the details of a vehicle pass (join `vehicles` in the Model, not in the view).
- Add a count per status above the list ("Dihantar: 2 · Diluluskan: 1") with a single `groupBy('status')` query.

---

## Lab 7.3 — Form, Validation, Upload & Download (S3)

### 🎯 Objective
Build the application form with 1–3 documents stored securely (BR-PAS-02), the reference number `PAS-2026-000N`, the `status_logs` entry, and download through a controller.

### Prerequisites
- Lab 7.2 done. `ReferenceNumberService` and `StatusLogModel::record()` from Days 4–6 work.
- `VehicleModel` exists and `pemohon1` has at least one synthetic vehicle (e.g. `WXX 1234`).

### Steps

1. **Complete `PassWorkflowService`** with the Day 7 methods from [`PassWorkflowService.php.txt`](../templates/kod/PassWorkflowService.php.txt):
   - constants `UPLOAD_DIR`, `MAX_FILES`, `ALLOWED_EXT`
   - `submit()` — checks → `move()` → transaction → `status_logs` → clean-up in `catch`
   - `documentPath()` — `realpath()` + prefix check
   - private helpers `assertDates()`, `assertVehicle()`, `assertFiles()`, `storeFile()`, `deleteStoredFiles()`

   Add the `use` statements you need (`PassStatus`, `PassType`, `VehicleModel`, `UploadedFile`, `PageNotFoundException`, `InvalidArgumentException`, `RuntimeException`, `Throwable`). **Do not** copy the Day 8 methods (`startReview`, `approve`, `reject`, `transition`) yet.

   Before you continue, the navigator explains out loud: *"Why are the files moved BEFORE `transBegin()`, and what happens to the files if `record()` fails?"*

2. **Add `new()`, `create()`, `download()`, `rules()`, `uploadedFiles()`** to `ApplicationController` (see the template). Make sure you have `protected $helpers = ['form', 'url'];`.

3. **Create `app/Views/pas/new.php`**:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan Pas Baharu<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <h1 class="h3 mb-3">Permohonan Pas Baharu</h1>

   <?php /* novalidate: we WANT to test server-side validation, not HTML5 */ ?>
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

4. **Make sure the upload folder cannot be reached and is not committed.** CI4 creates `writable/uploads/pas/` automatically during `move()`. Check that the project's `.gitignore` contains `writable/uploads/*` (the appstarter already has it). Confirm:

   ```bash
   git check-ignore -v writable/uploads/pas/contoh.pdf   # must show the .gitignore rule
   ```

5. **Prepare synthetic test files** in a folder outside the project (e.g. `~/ujian-pas/`):

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

6. **Submit the first application** as `pemohon1`: type *Pas Akses Kakitangan* (staff access pass), purpose ≥ 10 characters, valid dates, attach `surat-sokongan.pdf` + `gambar.png`.

7. **Confirm in three places:**

   ```bash
   cd ~/latihan/sistem-tlk-pas          # back to the project folder (step 5 left you in ~/ujian-pas)
   ls -la writable/uploads/pas/          # 2 files, random names e.g. 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
   ls public/ | grep -i upload            # NO output
   ```

   ```sql
   SELECT id, ref_no, status FROM pass_applications ORDER BY id DESC LIMIT 1;
   SELECT application_id, original_name, stored_path, mime, size_bytes FROM pass_documents ORDER BY id DESC LIMIT 2;
   SELECT module, record_id, from_status, to_status, actor_id FROM status_logs WHERE module = 'PAS' ORDER BY id DESC LIMIT 1;
   ```

8. **Download** both documents from the detail page. Open DevTools → Network → click the response → check the headers `Content-Disposition: attachment; filename="surat-sokongan.pdf"` and `X-Content-Type-Options: nosniff`.

### ✅ Checkpoint 7.3
- [ ] Redirect to `/pas/permohonan/{id}` with the message "Permohonan PAS-2026-000N berjaya dihantar."
- [ ] `pass_documents.stored_path` starts with `uploads/pas/` (relative), `mime` = `application/pdf` / `image/png`, `original_name` = the original name.
- [ ] The file name on disk is **different** from the original name; `public/` has no `uploads` folder.
- [ ] `status_logs` has the row `PAS · {id} · NULL → submitted`.
- [ ] Download works with the original name; the `attachment` + `nosniff` headers are present.
- [ ] Commit: `git add app/ && git commit -m "PAS: borang permohonan + muat naik dokumen selamat (BR-PAS-02)"`

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Validation error `uploaded` (no file received) even though a file was chosen | Form without `enctype` (used `form_open()` instead of `form_open_multipart()`) | `form_open_multipart()` |
| Only **one** file saved even though 2 were chosen | `name="documents"` without `[]` | `name="documents[]"` + `multiple` |
| `The action you requested is not allowed.` (SecurityException) when sending a large file | `post_max_size` exceeded → `$_POST` empty → CSRF token lost | Raise `post_max_size` (16M) — Lab 7.0 |
| `mime_in` fails for a valid PDF | The `fileinfo` extension is not loaded | `extension=fileinfo` in `php.ini`, restart the server |
| `CodeIgniter\HTTP\Exceptions\HTTPException: The file has already been moved` | `move()` called twice for the same file | Only one `move()`, in `storeFile()` |
| `Cannot add or update a child row: a foreign key constraint fails` on `pass_documents` | Wrong `application_id` (e.g. `false` from a failed insert) | Check `$id === false` → throw an exception (already in the template) |
| `ValueError: "" is not a valid backing value` | `PassType::from()` with empty input before validation | Validate `in_list` **before** calling the Service |
| `Unable to create directory` / `Permission denied` on `move()` | `writable/` is not writable by the web server | Linux/Mac: `chmod -R 775 writable`; Windows: check the folder is not *read-only* |
| Download shows a broken/empty PDF | There is output (spaces/`echo`) before the response, e.g. after `?>` in a config file | Remove the closing `?>` tag in pure PHP files |

### ⭐ Bonus challenge
- Add a `doc_type` option for **each** file (`salinan_ic`, `geran_kenderaan`, `surat_lantikan`) — propose how the form sends the type per file (`doc_types[]`).
- Limit the **total** size (e.g. 5 MB) in `assertFiles()`.
- Vehicle pass: reject it if that vehicle already has an `approved` pass that is still valid.

---

## Lab 7.4 — Manual Boundary Case Testing (S4)

### 🎯 Objective
Run at least 10 (target 17) boundary test cases for upload, validation and ownership, and record the results in `docs/ujian-manual-pas.md`.

### Prerequisites
- Lab 7.3 done. The folder `~/ujian-pas/` has `surat-sokongan.pdf` and `gambar.png`.

### Steps

1. **Generate the boundary files** (Git Bash / macOS / Linux):

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/ujian-pas
   # Exactly 2 MB = 2 097 152 bytes (9-byte header + 2 097 143)
   { printf '%%PDF-1.4\n'; head -c 2097143 /dev/zero; } > tepat-2mb.pdf
   # 2 MB + 1 KB
   { printf '%%PDF-1.4\n'; head -c 2098167 /dev/zero; } > lebih-2mb.pdf
   # 3 MB
   { printf '%%PDF-1.4\n'; head -c 3145728 /dev/zero; } > besar-3mb.pdf
   # Executable renamed to .pdf
   cp "$(command -v ls)" program.pdf
   # PHP script disguised as a PDF (harmless: phpinfo)
   printf '<?php phpinfo(); ?>\n' > borang.pdf
   # .jpeg extension (valid PNG content; the SPEC only allows jpg/png)
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

2. **Create `docs/ujian-manual-pas.md`** and copy the table below. Run each case; fill in the *Actual* and *Result* columns. After **every** case, check `ls writable/uploads/pas/ | wc -l` from the **project folder** (`cd ~/latihan/sistem-tlk-pas`, not `~/ujian-pas`) — the count only goes up for cases that are expected to succeed.

   | ID | Case | Steps | Expected | Actual | Result |
   |----|------|-------|----------|--------|--------|
   | UT-PAS-01 | 1 valid PDF | Attach `surat-sokongan.pdf` | Succeeds, `PAS-2026-000N`, +1 file on disk | | |
   | UT-PAS-02 | 3 valid files (max) | `surat-sokongan.pdf`, `surat-2.pdf`, `gambar.png` | Succeeds, 3 `pass_documents` rows | | |
   | UT-PAS-03 | No file | Submit without a file | "Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah." | | |
   | UT-PAS-04 | 4 files | 4 valid files | "Sila lampirkan 1 hingga 3 dokumen sokongan." — **no** new file on disk, no record | | |
   | UT-PAS-05 | Exactly 2 MB | `tepat-2mb.pdf` | Succeeds (boundary is inclusive) | | |
   | UT-PAS-06 | 2 MB + 1 KB | `lebih-2mb.pdf` | "Setiap fail mestilah tidak melebihi 2 MB." | | |
   | UT-PAS-07 | 3 MB | `besar-3mb.pdf` | "Setiap fail mestilah tidak melebihi 2 MB." | | |
   | UT-PAS-08 | Executable → `.pdf` | `program.pdf` | Rejected ("Hanya fail PDF, JPG atau PNG…" or "Kandungan fail bukan…") | | |
   | UT-PAS-09 | PHP → `.pdf` | `borang.pdf` | Rejected — no `.php` file on disk | | |
   | UT-PAS-10 | `.jpeg` | `gambar.jpeg` | Rejected (SPEC: jpg/png only) — record as "per SPEC" | | |
   | UT-PAS-11 | Dates reversed (BR-PAS-06) | `valid_until` < `valid_from` | "Tarikh "Sah hingga" mesti sama atau selepas "Sah dari"." | | |
   | UT-PAS-12 | Vehicle pass without a vehicle (BR-PAS-06) | Type *Pas Kenderaan* (vehicle pass), vehicle "Tiada" | Error on the Kenderaan (vehicle) field (required) | | |
   | UT-PAS-13 | Someone else's vehicle (form IDOR) | DevTools: change the `<option>` `value` to a vehicle ID of `pemohon2` | "Sila pilih kenderaan anda yang berdaftar untuk pas kenderaan." | | |
   | UT-PAS-14 | Someone else's details | `pemohon2` opens `/pas/permohonan/{id pemohon1}` | 404 | | |
   | UT-PAS-15 | Someone else's document | `pemohon2` opens `/pas/permohonan/dokumen/{id dokumen pemohon1}` | 404 | | |
   | UT-PAS-16 | Direct file access | Open `http://localhost:8080/writable/uploads/pas/<nama-rawak>` and `http://localhost:8080/uploads/pas/<nama-rawak>` | 404 (cannot be reached) | | |
   | UT-PAS-17 | Staff pass without a vehicle, 2-year period (BR-PAS-06) | Type *Pas Akses Kakitangan* (staff access pass), vehicle "Tiada", `valid_until` = +2 years | Succeeds (vehicle not required; no maximum period) | | |

3. **For UT-PAS-13**, find the vehicle ID of `pemohon2`: `SELECT id, plate_no FROM vehicles WHERE user_id = <id pemohon2>;` (the Day 4 `VehicleSeeder` creates `VXX 2468`; create one synthetic vehicle if there is none).

4. **Record bugs** (if any) below the table in this format: *ID · Steps to reproduce · Expected · Actual · Severity (High/Medium/Low)*. Fix them with the cycle **reproduce → failing test → fix → passing test**.

5. **Clean up** the test data: delete the `PAS-2026-900x` records (Lab 7.2) — or keep them as demo data for tomorrow. **Do not** delete files in `writable/uploads/pas/` by hand without deleting the matching `pass_documents` rows.

### ✅ Checkpoint 7.4
- [ ] `docs/ujian-manual-pas.md` contains ≥ 10 cases with the *Actual* & *Result* columns filled in.
- [ ] UT-PAS-04, 08, 09: **no** new file in `writable/uploads/pas/` and no new `pass_applications` record.
- [ ] Each pair can explain to the trainer the **OWASP risk** prevented by UT-PAS-07, 09, 15 and 16.
- [ ] Commit: `git add docs/ && git commit -m "PAS: kes ujian manual muat naik & pemilikan"` and `git push -u origin feat/pas-permohonan`.

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| UT-PAS-07 shows the "uploaded" message, not "2 MB" | `upload_max_filesize` < 3M — PHP rejects it first | Lab 7.0 step 3 |
| UT-PAS-05 (exactly 2 MB) rejected | The file is actually > 2 097 152 bytes (e.g. `head -c 2097152` + header) | Check `ls -l`: it must be **2097152** |
| UT-PAS-09 **accepted** | `mime_in` missing or `ext_in` uses the old `Rules` (not `StrictRules`) | Check the rules & that `Config\Validation::$ruleSets` uses `StrictRules\FileRules` |
| UT-PAS-04 leaves files on disk | The count check runs **after** `move()` | `assertFiles()` must be called before the `storeFile()` loop |
| UT-PAS-16 shows the file! | File stored in `public/`, or the server's *document root* points at the project root instead of `public/` | `move(WRITEPATH . …)`; Apache/Laragon: *DocumentRoot* = `…/public` |
| `base64: invalid option -- d` (old macOS) | Old `base64` version | Use `base64 -D` |

### ⭐ Bonus challenge
- Upload a file named `"><img src=x onerror=alert(1)>.pdf` (macOS/Linux only) and confirm the name is shown as text in the details (XSS is prevented by `esc()`).
- Automate UT-PAS-06 with PHPUnit using a fake `$_FILES` — what is the difficulty? (Hint: `is_uploaded_file()` and `move_uploaded_file()`.)
- Switch the default CI4 validation messages to Malay: `app/Language/ms/Validation.php` + `Config\App::$defaultLocale = 'ms'`.

---

## Self-check — end of day

```bash
git log --oneline -5                    # 4 "PAS:" commits today
php spark routes | grep pas/permohonan  # 5 routes, session filter
ls writable/uploads/pas/ | head         # random names only
git status                              # clean; writable/uploads not tracked
```

Pairs who fall behind: copy from [`templates/kod/`](../templates/kod/) **after** the trainer/a peer has explained each part — and mark it in the commit (`PAS: … (rujuk templat)`).
