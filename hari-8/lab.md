# Lab Hari 8 — Modul Pas (2): Aliran Kelulusan, RBAC & Ujian Akses

[📅 Jadual](../JADUAL.md) · [📘 Kanun SPEC](../docs/spesifikasi-sistem.md) · [📖 Nota Hari 8](./README.md) · [⚡ Arahan spark](../docs/arahan-spark.md)

> Kerja **individu** dalam `kelas-ci-<nama>`; tunjuk output kepada jurulatih atau rakan sebelah sebelum menanda. Semua arahan dari **akar projek CI4**. Setiap langkah memberi **kod lengkap untuk disalin**. Baca setiap baris sebelum menjalankannya — anda mesti boleh menerangkannya (KOLABORASI §3). Buntu: baca mesej ralat penuh, tanya jurulatih atau rakan sebelah, atau guna AI untuk *menerangkan* ralat.

| Lab | Sesi | Masa | Hasil |
|-----|------|------|-------|
| 8.0 | Awal S1 | 10 min | Branch + data demo + 3 akaun peranan disahkan |
| 8.1 | S1 | 09:10–10:00 | Service peralihan + `ReviewController` + baris gilir + panel tindakan |
| 8.1b | S5 | 10:00–10:30 | Mula semakan pukal dari baris gilir melalui `startReview()` |
| 8.2 | S2 | 10:45–12:00 | `AuthGroups`, filter `permission:`, `authorize()`, 403 |
| 8.2b | S6 | 12:00–12:30 | `permission:pas.review` pada route pukal + matriks 4 peranan |
| 8.3 | S3 | 14:30–15:30 | Garis masa `status_logs` + `PassAccessTest` hijau |
| 8.3b | S7 | 15:30–16:00 | `PassBatchReviewTest` (5 ujian) + 2 mutasi |
| 8.4 | S4 | 16:00–16:35 | Demo 3 peranan, DoD, gabung ke `main` · ⭐ `pas:expire` |
| 8.4b | S8 | 16:35–17:00 | Demo peranan `admin` + dapatan pemisahan tugas (`docs/demo-m2.md`) |

---

## Lab 8.0 — Persediaan (10 minit, awal S1)

1. Branch baharu dari branch Hari 7 yang telah di-push:

   ```bash
   git switch feat/pas-permohonan && git pull
   git switch -c feat/pas-kelulusan
   ```

2. Sahkan akaun & group seeder (Hari 4):

   ```sql
   SELECT u.id, i.secret AS email, g.`group`
   FROM users u
   JOIN auth_identities i ON i.user_id = u.id AND i.type = 'email_password'
   LEFT JOIN auth_groups_users g ON g.user_id = u.id
   ORDER BY u.id;
   ```

   Dijangka: `pemohon1`, `pemohon2` → `applicant` · `penyemak` → `reviewer` · `pelulus` → `approver` · `admin` → `admin`. Jika tiada: `php spark db:seed UserSeeder`.

3. Pastikan ada **sekurang-kurangnya 3** permohonan `submitted` (hantar melalui borang Hari 7 sebagai `pemohon1`/`pemohon2` jika perlu).

**✅ Checkpoint 8.0:** 5 akaun dengan group betul; ≥ 3 permohonan `submitted`; branch `feat/pas-kelulusan` aktif.

---

## Lab 8.1 — Aliran Kelulusan (S1)

### 🎯 Objektif
Melaksanakan `startReview()`, `approve()`, `reject()` melalui satu `transition()` berkunci yang menguatkuasa BR-PAS-01, BR-PAS-03 dan BR-PAS-05, serta `ReviewController` yang nipis.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Lab 8.0 selesai. `PassWorkflowService` Hari 7 (`canView`, `submit`, `documentPath`) berfungsi.

### Langkah

1. **Tambah kaedah Hari 8 dalam `app/Services/PassWorkflowService.php`** (fail versi Hari 7) — empat tampalan (a)–(d) di bawah:
   - pemalar `REMARKS_MIN = 10`
   - `startReview()`, `approve()`, `reject()`, `history()`
   - `transition()` (peribadi)
   - `use CodeIgniter\I18n\Time; use DomainException;`

   **(a)** Tambah dua baris `use` ini bersama baris `use` lain di bahagian atas fail (selepas `namespace App\Services;`):

   ```php
   use CodeIgniter\I18n\Time;
   use DomainException;
   ```

   **(b)** Tambah pemalar ini terus di bawah baris `public const ALLOWED_EXT   = ['pdf', 'jpg', 'png'];`:

   ```php
       public const REMARKS_MIN   = 10;               // BR-PAS-03
   ```

   **(c)** Tampal kaedah awam ini **selepas** kaedah `documentPath()` dan **sebelum** blok komen `// Dalaman`:

   ```php
       // =================================================================
       // HARI 8 — aliran kelulusan
       // =================================================================

       /** submitted → under_review (reviewer) */
       public function startReview(int $applicationId, User $actor): PassApplication
       {
           // $this->authorize($actor, 'pas.review');   // Lab 8.2 langkah 5

           return $this->transition($applicationId, PassStatus::UnderReview, (int) $actor->id, null, [
               'reviewed_by' => (int) $actor->id,
               'reviewed_at' => Time::now()->toDateTimeString(),
           ]);
       }

       /** under_review → approved (approver). Catatan pilihan. */
       public function approve(int $applicationId, User $actor, ?string $remarks = null): PassApplication
       {
           // $this->authorize($actor, 'pas.approve');   // Lab 8.2 langkah 5

           $remarks = $remarks === null ? null : trim($remarks);

           return $this->transition($applicationId, PassStatus::Approved, (int) $actor->id, $remarks === '' ? null : $remarks, [
               'approved_by' => (int) $actor->id,
               'approved_at' => Time::now()->toDateTimeString(),
           ]);
       }

       /** under_review → rejected (reviewer ATAU approver). BR-PAS-03: catatan wajib ≥ 10 aksara. */
       public function reject(int $applicationId, User $actor, string $remarks): PassApplication
       {
           // $this->authorize($actor, 'pas.review', 'pas.approve');   // Lab 8.2 langkah 5 — can() = mana-mana satu (OR)

           $remarks = trim($remarks);
           if (mb_strlen($remarks) < self::REMARKS_MIN) {
               throw new InvalidArgumentException('Catatan penolakan wajib diisi (sekurang-kurangnya 10 aksara).');
           }

           return $this->transition($applicationId, PassStatus::Rejected, (int) $actor->id, $remarks);
       }

       /**
        * Garis masa status (BR-PAS-05) — dari status_logs.
        *
        * @return list<array<string, mixed>>
        */
       public function history(int $applicationId): array
       {
           return $this->statusLogs->history(self::MODULE, $applicationId);
       }
   ```

   **(d)** Tampal kaedah peribadi `transition()` dalam bahagian `// Dalaman`, **sebelum** docblock kaedah `assertDates()`:

   ```php
       /**
        * Satu-satunya tempat status berubah selepas penciptaan.
        *
        * @param array<string, mixed> $extra medan tambahan (reviewed_by, approved_at, …)
        */
       private function transition(
           int $applicationId,
           PassStatus $to,
           int $actorId,
           ?string $remarks = null,
           array $extra = [],
       ): PassApplication {
           $this->db->transException(true)->transBegin();   // ralat query → exception

           try {
               // Kunci baris: jika dua pegawai klik "Lulus" serentak, yang kedua MENUNGGU di sini,
               // kemudian membaca status baharu dan gagal canTransitionTo(). Binding ? — tiada SQL injection.
               $query = $this->db->query(
                   sprintf('SELECT id, status FROM %s WHERE id = ? FOR UPDATE', $this->db->prefixTable('pass_applications')),
                   [$applicationId],
               );

               if ($query === false) {
                   throw new RuntimeException('Gagal mengunci permohonan.');
               }

               $row = $query->getRowArray();

               if ($row === null) {
                   throw PageNotFoundException::forPageNotFound('Permohonan tidak dijumpai.');
               }

               $from = PassStatus::from((string) $row['status']);

               // BR-PAS-01
               if (! $from->canTransitionTo($to)) {
                   throw new DomainException(sprintf(
                       'Peralihan status "%s" → "%s" tidak dibenarkan.',
                       $from->label(),
                       $to->label(),
                   ));
               }

               if (! $this->applications->update($applicationId, ['status' => $to->value] + $extra)) {
                   throw new RuntimeException('Gagal mengemas kini permohonan: ' . implode(' ', $this->applications->errors()));
               }

               // BR-PAS-05 — dalam transaksi yang SAMA: tiada perubahan status tanpa log
               if (! $this->statusLogs->record(self::MODULE, $applicationId, $from->value, $to->value, $actorId, $remarks)) {
                   throw new RuntimeException('Gagal merekod log status.');
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               $this->db->transRollback();

               throw $e;
           }

           return $this->applications->find($applicationId);
       }
   ```

   **Untuk lab ini, JANGAN aktifkan baris `$this->authorize(...)`** dalam ketiga-tiga kaedah awam — dalam kod (c) ia sengaja dikomen (`// $this->authorize(...)`). Kita akan mengaktifkannya dalam Lab 8.2 selepas melihat sendiri kenapa ia perlu.

2. Sebelum meneruskan, terangkan kepada jurulatih atau rakan sebelah (lisan, 2 minit): *"Kenapa status dibaca SELEPAS `FOR UPDATE`, dan apa berlaku jika `record()` memulangkan `false`?"*

3. **Cipta `app/Controllers/Pas/ReviewController.php`**: `index()`, `review()`, `approve()`, `reject()`, `act()`, `defaultQueue()`.

   `app/Controllers/Pas/ReviewController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Pas;

   use App\Controllers\BaseController;
   use App\Enums\PassStatus;
   use App\Models\PassApplicationModel;
   use App\Services\PassWorkflowService;
   use CodeIgniter\HTTP\ResponseInterface;
   use CodeIgniter\Shield\Entities\User;
   use CodeIgniter\Shield\Exceptions\PermissionException;
   use DomainException;
   use InvalidArgumentException;

   class ReviewController extends BaseController
   {
       protected $helpers = ['form', 'url'];

       /** GET /pas/semakan — baris gilir pegawai */
       public function index(): string
       {
           $user      = auth()->user();
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');

           $model = model(PassApplicationModel::class)->withApplicant();

           if ($status !== null) {
               $model->withStatus($status);
           } else {
               // Lalai: apa yang perlu SAYA ambil tindakan
               $model->whereIn('pass_applications.status', $this->defaultQueue($user));
           }

           return view('pas/semakan/index', [
               'applications' => $model->orderBy('pass_applications.created_at', 'ASC')->paginate(15),
               'pager'        => $model->pager,
               'status'       => $status,
           ]);
       }

       /** POST /pas/semakan/{id}/review — submitted → under_review */
       public function review(string $id): ResponseInterface
       {
           return $this->act(
               (int) $id,
               'Permohonan kini Dalam Semakan.',
               static fn (PassWorkflowService $wf, User $user) => $wf->startReview((int) $id, $user),
           );
       }

       /** POST /pas/semakan/{id}/approve — under_review → approved */
       public function approve(string $id): ResponseInterface
       {
           $remarks = (string) $this->request->getPost('remarks');

           return $this->act(
               (int) $id,
               'Permohonan telah Diluluskan.',
               static fn (PassWorkflowService $wf, User $user) => $wf->approve((int) $id, $user, $remarks),
           );
       }

       /** POST /pas/semakan/{id}/reject — under_review → rejected (BR-PAS-03) */
       public function reject(string $id): ResponseInterface
       {
           // Lapisan 1: validasi borang. Lapisan 2: Service menyemak semula (jika dipanggil dari tempat lain).
           $rules = [
               'remarks' => [
                   'label'  => 'Catatan penolakan',
                   'rules'  => 'required|min_length[10]|max_length[1000]',
                   'errors' => [
                       'required'   => 'Catatan penolakan wajib diisi.',
                       'min_length' => 'Catatan penolakan mestilah sekurang-kurangnya 10 aksara.',
                   ],
               ],
           ];

           if (! $this->validate($rules)) {
               return redirect()->to(url_to('pas.show', (int) $id))
                   ->withInput()
                   ->with('error', $this->validator->getError('remarks'));
           }

           $remarks = (string) $this->request->getPost('remarks');

           return $this->act(
               (int) $id,
               'Permohonan telah Ditolak.',
               static fn (PassWorkflowService $wf, User $user) => $wf->reject((int) $id, $user, $remarks),
           );
       }

       // -----------------------------------------------------------------

       /**
        * Corak seragam: panggil Service → terjemah exception kepada respons HTTP.
        *   PermissionException           → 403 (pengguna log masuk tetapi tiada hak)
        *   DomainException (BR-PAS-01)   → kembali ke butiran + mesej ralat
        *   InvalidArgumentException      → kembali ke butiran + mesej ralat (BR-PAS-03)
        *   PageNotFoundException         → dibiar naik → 404
        */
       private function act(int $id, string $successMessage, callable $action): ResponseInterface
       {
           try {
               $action(service('passWorkflowService'), auth()->user());
           } catch (PermissionException $e) {
               return $this->response
                   ->setStatusCode(403)
                   ->setBody(view('errors/forbidden', ['message' => $e->getMessage()]));
           } catch (DomainException|InvalidArgumentException $e) {
               return redirect()->to(url_to('pas.show', $id))->with('error', $e->getMessage());
           }

           return redirect()->to(url_to('pas.show', $id))->with('message', $successMessage);
       }

       /**
        * Status lalai dalam baris gilir ikut permission (bukan nama group).
        *
        * @return list<string>
        */
       private function defaultQueue(User $user): array
       {
           $statuses = [];

           if ($user->can('pas.review')) {
               $statuses[] = PassStatus::Submitted->value;     // perlu dimulakan semakan
           }

           $statuses[] = PassStatus::UnderReview->value;       // perlu keputusan (lulus/tolak)

           return $statuses;
       }
   }
   ```

4. **Tambah route** dalam `app/Config/Routes.php` — buat masa ini dengan filter **group sahaja**:

   ```php
   $routes->group('pas/semakan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'group:reviewer,approver,admin'], static function ($routes): void {
       $routes->get('/', 'ReviewController::index', ['as' => 'pas.semakan']);
       $routes->post('(:num)/review', 'ReviewController::review/$1', ['as' => 'pas.review']);
       $routes->post('(:num)/approve', 'ReviewController::approve/$1', ['as' => 'pas.approve']);
       $routes->post('(:num)/reject', 'ReviewController::reject/$1', ['as' => 'pas.reject']);
   });
   ```

5. **Cipta `app/Views/pas/semakan/index.php`**:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Semakan Permohonan Pas<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <h1 class="h3 mb-3">Semakan Permohonan Pas</h1>

   <form method="get" class="row g-2 mb-3" role="search">
       <div class="col-auto">
           <label for="status" class="visually-hidden">Status</label>
           <select name="status" id="status" class="form-select">
               <option value="">Baris gilir saya</option>
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
       <div class="alert alert-success">Tiada permohonan menunggu tindakan anda.</div>
   <?php else: ?>
       <div class="table-responsive">
           <table class="table table-hover align-middle">
               <thead>
                   <tr><th>No. Rujukan</th><th>Pemohon</th><th>Jenis</th><th>Tempoh Sah</th><th>Status</th><th>Dihantar</th><th></th></tr>
               </thead>
               <tbody>
               <?php foreach ($applications as $app): ?>
                   <?php $shown = $app->displayStatus(); ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($app->ref_no) ?></td>
                       <td><?= esc($app->applicant_name ?? '—') ?></td>
                       <td><?= esc($app->typeEnum()->label()) ?></td>
                       <td><?= esc($app->valid_from->format('d/m/Y')) ?> – <?= esc($app->valid_until->format('d/m/Y')) ?></td>
                       <td><span class="badge <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span></td>
                       <td><?= esc($app->created_at->format('d/m/Y H:i')) ?></td>
                       <td><a href="<?= url_to('pas.show', $app->id) ?>" class="btn btn-sm btn-primary">Buka</a></td>
                   </tr>
               <?php endforeach ?>
               </tbody>
           </table>
       </div>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```

6. **Kemas kini `ApplicationController::show()`** supaya menghantar `history` dan `actions` (rujuk template `ApplicationController-upload.php.txt` (modul **Templat & Rujukan**)):

   ```php
   public function show(string $id): string
   {
       $application = $this->findVisibleOr404((int) $id);
       $user        = auth()->user();
       $status      = $application->statusEnum();

       return view('pas/show', [
           'application' => $application,
           'documents'   => model(PassDocumentModel::class)->forApplication($application->id),
           'history'     => service('passWorkflowService')->history($application->id),
           'actions'     => [
               'review'  => $user->can('pas.review') && $status->canTransitionTo(PassStatus::UnderReview),
               'approve' => $user->can('pas.approve') && $status->canTransitionTo(PassStatus::Approved),
               'reject'  => $user->can('pas.review', 'pas.approve') && $status->canTransitionTo(PassStatus::Rejected),
           ],
       ]);
   }
   ```

7. **Tambah panel tindakan dalam `app/Views/pas/show.php`** — gantikan baris `<?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>` dengan:

   ```php
   <?php if (in_array(true, $actions, true)): ?>
       <div class="card border-primary mb-4">
           <div class="card-header bg-primary-subtle"><i class="bi bi-person-check" aria-hidden="true"></i> Tindakan Pegawai</div>
           <div class="card-body">
               <?php if ($actions['review']): ?>
                   <?= form_open(url_to('pas.review', $application->id)) ?>
                       <p class="mb-2">Permohonan ini belum disemak.</p>
                       <button type="submit" class="btn btn-info"><i class="bi bi-search" aria-hidden="true"></i> Mula Semakan</button>
                   <?= form_close() ?>
               <?php endif ?>

               <?php if ($actions['approve']): ?>
                   <?= form_open(url_to('pas.approve', $application->id), ['class' => 'mb-4']) ?>
                       <label for="approve-remarks" class="form-label">Catatan kelulusan <small class="text-body-secondary">(pilihan)</small></label>
                       <textarea name="remarks" id="approve-remarks" rows="2" class="form-control mb-2"></textarea>
                       <button type="submit" class="btn btn-success" onclick="return confirm('Luluskan permohonan ini?')">
                           <i class="bi bi-check-circle" aria-hidden="true"></i> Lulus
                       </button>
                   <?= form_close() ?>
               <?php endif ?>

               <?php if ($actions['reject']): ?>
                   <?php /* novalidate: BR-PAS-03 dikuatkuasa di PELAYAN — kita mahu boleh mengujinya */ ?>
                   <?= form_open(url_to('pas.reject', $application->id), ['novalidate' => true]) ?>
                       <label for="reject-remarks" class="form-label">Catatan penolakan <span class="text-danger">*</span> <small class="text-body-secondary">(min. 10 aksara)</small></label>
                       <textarea name="remarks" id="reject-remarks" rows="2" class="form-control mb-2" minlength="10"><?= esc(old('remarks', '')) ?></textarea>
                       <button type="submit" class="btn btn-danger" onclick="return confirm('Tolak permohonan ini?')">
                           <i class="bi bi-x-circle" aria-hidden="true"></i> Tolak
                       </button>
                   <?= form_close() ?>
               <?php endif ?>
           </div>
       </div>
   <?php endif ?>
   ```

8. **Uji aliran** dengan tiga tetingkap pelayar (biasa · inkognito · pelayar lain):
   - `penyemak`: `/pas/semakan` → buka permohonan A → **Mula Semakan**.
   - `pelulus` (pelayar lain — sesi kedua): log masuk juga sebagai `pelulus`, buka A. **Jangan** klik.
   - `pelulus` (inkognito): `/pas/semakan` → buka A → **Lulus** dengan catatan "Dokumen lengkap."
   - `penyemak`: permohonan B → **Mula Semakan** → **Tolak** dengan catatan "tak ok" (dijangka ralat), kemudian "Salinan kad kuasa tidak jelas." (dijangka berjaya).
   - `pelulus` (pelayar lain): tanpa memuat semula halaman A, klik **Lulus**. Sesi kedua diperlukan kerana token CSRF ditukar selepas setiap POST — tab lama dalam sesi yang **sama** ditolak dengan *The action you requested is not allowed.* sebelum sampai ke `transition()`.

9. Semak DB:

   ```sql
   SELECT id, ref_no, status, reviewed_by, reviewed_at, approved_by, approved_at FROM pass_applications ORDER BY id;
   SELECT record_id, from_status, to_status, actor_id, remarks, created_at FROM status_logs WHERE module = 'PAS' ORDER BY id;
   ```

### ✅ Checkpoint 8.1
- [ ] Permohonan A: `approved`, `reviewed_by` = id penyemak, `approved_by` = id pelulus, kedua-dua cap masa diisi (Kuiz S1).
- [ ] `status_logs` untuk A: 3 baris (`NULL→submitted`, `submitted→under_review`, `under_review→approved`) (Kuiz S1).
- [ ] Tolak "tak ok" → mesej "Catatan penolakan mestilah sekurang-kurangnya 10 aksara." dan status B kekal `under_review` (Kuiz S1).
- [ ] Klik **Lulus** dalam sesi kedua `pelulus` → "Peralihan status "Diluluskan" → "Diluluskan" tidak dibenarkan." dan **tiada** baris log tambahan (Kuiz S1).
- [ ] `pemohon1` membuka `/pas/semakan` → ditolak (redirect dengan mesej) (Kuiz S1).
- [ ] Commit: `git add app/ && git commit -m "PAS: aliran semak/lulus/tolak melalui PassWorkflowService"` (Kuiz S1)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `The action you requested is not allowed.` | Borang tanpa token CSRF (HTML `<form>` biasa) | Guna `form_open()` — ia menambah `csrf_field()` automatik |
| `The action you requested is not allowed.` semasa klik **Lulus** pada tab lama | Token CSRF ditukar selepas setiap POST (`Config\Security::$regenerate = true`); tab lama dalam sesi yang sama membawa token lama | Uji klik kedua dari **sesi lain** (pelayar lain), seperti langkah 8 |
| `Call to a member function can() on null` | Route tanpa filter log masuk → `auth()->user()` null | Semak kumpulan `pas/semakan` ada filter `group:` (ia juga memaksa log masuk) |
| `ValueError: "" is not a valid backing value for enum` | `PassStatus::from()` pada `$row['status']` kosong — data rosak/ujian | Semak data; `from()` sengaja gagal kuat untuk data DB yang tidak sah |
| `Undefined variable $actions` / `$history` dalam view | `show()` belum dikemas kini (langkah 6) | Hantar kedua-duanya dari controller |
| Status berubah tetapi **tiada** baris `status_logs` | `record()` dipanggil di luar `transition()` atau pulangan `false` diabaikan | Semua peralihan melalui `transition()`; semak `if (! ...record(...)) throw` |
| Lulus kali kedua **berjaya** (dua baris "approved") | `canTransitionTo()` disemak pada entity lama, bukan baris yang dikunci | Baca status dari `SELECT … FOR UPDATE` dalam transaksi |
| `Lock wait timeout exceeded` | Transaksi lain tidak ditutup (lupa `transRollback()` dalam `catch`, atau tetingkap `mysql` dengan `BEGIN` terbiar) | Tambah `transRollback()`; `COMMIT;` dalam tetingkap `mysql` |

### ⭐ Cabaran tambahan
- **Pemisahan tugas:** dalam `approve()`, tolak jika `reviewed_by === $actor->id` ("Pegawai yang menyemak tidak boleh meluluskan permohonan yang sama"). Kes: admin yang mempunyai `pas.*`.
- Dalam `startReview()`, tolak jika pegawai ialah **pemohon** permohonan itu sendiri.
- Tambah pengiraan "menunggu sejak N hari" dalam baris gilir, dengan badge merah jika > 3 hari.

---

## Lab 8.2 — Kawalan Akses Ikut Peranan (S2)

### 🎯 Objektif
Mengkonfigur `AuthGroups` tepat SPEC §4, menambah filter `permission:` per tindakan, `authorize()` dalam Service dan respons 403 — dan membuktikan setiap lapisan dengan serangan manual.

### Prasyarat
- Lab 8.1 selesai (tanpa `authorize()`).

### Langkah

1. **Serang aplikasi anda sendiri (5 minit).** Log masuk sebagai `penyemak`. Buka permohonan berstatus `under_review` — butang *Lulus* tiada, hanya *Tolak*. Buka DevTools → Elements → cari `<form action=".../reject"` → tukar `reject` kepada `approve` → klik **Tolak** (dengan catatan ≥ 10 aksara).
   Semak DB: siapa `approved_by`? Rekodkan hasil ini dalam `docs/ujian-manual-pas.md` sebagai **UT-PAS-20 (sebelum pembaikan)**.

   Alternatif `curl` (salin kuki sesi `ci_session` dan token CSRF dari DevTools):

   ```bash
   curl -i -X POST http://localhost:8080/pas/semakan/5/approve -b "ci_session=<nilai>" -d "csrf_test_name=<token>&remarks=serangan"
   ```

2. **Semak `app/Config/AuthGroups.php`** terhadap SPEC §4: 4 groups, 8 permissions, `$matrix` tepat. `$defaultGroup = 'applicant'`. Jika ada yang berbeza, gantikan seluruh kandungan fail dengan versi di bawah:

   `app/Config/AuthGroups.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Config;

   use CodeIgniter\Shield\Config\AuthGroups as ShieldAuthGroups;

   /**
    * Peranan & kebenaran — tepat seperti SPEC §4.
    * Hanya KEAHLIAN group disimpan dalam DB (auth_groups_users, diisi UserSeeder).
    */
   class AuthGroups extends ShieldAuthGroups
   {
       /** Pengguna baharu (cth daftar sendiri) terus menjadi pemohon */
       public string $defaultGroup = 'applicant';

       /**
        * Groups (peranan). Kunci = nama group yang digunakan dalam filter `group:` dan inGroup().
        */
       public array $groups = [
           'applicant' => [
               'title'       => 'Pemohon',
               'description' => 'Kakitangan pemohon',
           ],
           'reviewer' => [
               'title'       => 'Penyemak',
               'description' => 'Pegawai penyemak pas',
           ],
           'approver' => [
               'title'       => 'Pelulus',
               'description' => 'Pegawai pelulus pas & tempahan TLK',
           ],
           'admin' => [
               'title'       => 'Pentadbir',
               'description' => 'Pentadbir sistem',
           ],
       ];

       /**
        * SETIAP permission mesti diisytihar di sini. Format: "skop.tindakan".
        */
       public array $permissions = [
           'admin.access'   => 'Akses modul pentadbir (slot, zon, pengguna)',
           'tlk.apply'      => 'Memohon tempahan TLK',
           'tlk.decide'     => 'Meluluskan / menolak tempahan TLK',
           'pas.apply'      => 'Memohon pas',
           'pas.review'     => 'Menyemak permohonan pas',
           'pas.approve'    => 'Meluluskan permohonan pas',
           'laporan.view'   => 'Melihat & mengeksport laporan',
           'statistik.view' => 'Melihat dashboard statistik',
       ];

       /**
        * Matriks group → permission (SPEC §4). `skop.*` = semua permission dalam skop itu.
        */
       public array $matrix = [
           'applicant' => ['tlk.apply', 'pas.apply'],
           'reviewer'  => ['pas.review', 'laporan.view'],
           'approver'  => ['tlk.decide', 'pas.approve', 'laporan.view', 'statistik.view'],
           'admin'     => ['admin.*', 'tlk.*', 'pas.*', 'laporan.*', 'statistik.*'],
       ];
   }
   ```

3. **Tambah filter `permission:` per route** — dalam `app/Config/Routes.php`, gantikan kedua-dua kumpulan `pas/permohonan` (Lab 7.2) dan `pas/semakan` (Lab 8.1 langkah 4) dengan kod di bawah. Hanya route `new`, `create`, `review`, `approve` dan `reject` mendapat filter baharu. Kumpulan `pas/semakan` **kedua** untuk route pukal (Lab 8.1b) kekal — Lab 8.2b mengemas kininya:

   ```php
   $routes->group('pas/permohonan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'session'], static function ($routes): void {
       $routes->get('/', 'ApplicationController::index', ['as' => 'pas.index']);
       // Hari 8 S2: hanya pemegang pas.apply boleh mohon (SPEC §4 — applicant, admin melalui pas.*)
       $routes->get('new', 'ApplicationController::new', ['as' => 'pas.new', 'filter' => 'permission:pas.apply']);
       $routes->post('/', 'ApplicationController::create', ['as' => 'pas.create', 'filter' => 'permission:pas.apply']);
       $routes->get('(:num)', 'ApplicationController::show/$1', ['as' => 'pas.show']);
       $routes->get('dokumen/(:num)', 'ApplicationController::download/$1', ['as' => 'pas.dokumen']);
   });

   // CI 4.5+ MENGGABUNGKAN filter kumpulan dengan filter route.
   $routes->group('pas/semakan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'group:reviewer,approver,admin'], static function ($routes): void {
       $routes->get('/', 'ReviewController::index', ['as' => 'pas.semakan']);
       // Filter permission per tindakan — tanpanya, reviewer boleh POST ke /approve (group sahaja tidak cukup)
       $routes->post('(:num)/review', 'ReviewController::review/$1', ['as' => 'pas.review', 'filter' => 'permission:pas.review']);
       $routes->post('(:num)/approve', 'ReviewController::approve/$1', ['as' => 'pas.approve', 'filter' => 'permission:pas.approve']);
       $routes->post('(:num)/reject', 'ReviewController::reject/$1', ['as' => 'pas.reject', 'filter' => 'permission:pas.review,pas.approve']);
   });
   ```

4. **Sahkan gabungan filter:**

   ```bash
   php spark routes | grep pas/      # PowerShell: php spark routes | Select-String "pas/"
   ```

   Lajur *Before Filters* untuk `pas/semakan/([0-9]+)/approve` mesti mengandungi **kedua-dua** `group:reviewer,approver,admin` dan `permission:pas.approve` (CI 4.5.4+ menggabungkan filter kumpulan & route). `csrf` turut tersenarai kerana ia filter global.

5. **Tambah `authorize()` dalam Service** (`app/Services/PassWorkflowService.php`):
   - Dalam `startReview()`, `approve()` dan `reject()`, buang `// ` di hadapan baris `$this->authorize(...)` supaya ia aktif.
   - Tambah `use CodeIgniter\Shield\Exceptions\PermissionException;` bersama baris `use` lain di bahagian atas fail.
   - Tampal kaedah peribadi `authorize()` di bawah dalam bahagian `// Dalaman`, terus selepas `transition()`:

   ```php
       /** Lapisan kedua selepas filter laluan (defence in depth) */
       private function authorize(User $actor, string ...$permissions): void
       {
           if (! $actor->can(...$permissions)) {
               throw new PermissionException('Anda tidak mempunyai kebenaran untuk tindakan ini.');
           }
       }
   ```

6. **Cipta `app/Views/errors/forbidden.php`** (dipapar oleh `ReviewController::act()` untuk 403):

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Akses Ditolak<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <div class="alert alert-danger" role="alert">
       <h1 class="h4"><i class="bi bi-shield-lock" aria-hidden="true"></i> 403 — Akses Ditolak</h1>
       <p class="mb-0"><?= esc($message ?? 'Anda tidak mempunyai kebenaran untuk tindakan ini.') ?></p>
   </div>
   <a href="<?= site_url('pas/permohonan') ?>" class="btn btn-outline-secondary">&larr; Kembali</a>
   <?= $this->endSection() ?>
   ```

7. **Ulang serangan langkah 1** pada permohonan `under_review` yang lain. Kali ini dijangka: redirect ke `/` dengan mesej ralat Shield, status **tidak** berubah. Rekodkan sebagai **UT-PAS-20 (selepas pembaikan)**.

8. **Buktikan Lapisan 2 berdiri sendiri:** buang sementara `'filter' => 'permission:pas.approve'` dari route `/approve`, ulang serangan → dijangka **403 — Akses Ditolak** (dari `authorize()`). **Pulihkan filter** selepas itu.

9. **Jalankan matriks akses manual** — isi dalam `docs/ujian-manual-pas.md`:

   | ID | Pengguna | Tindakan | Dijangka |
   |----|----------|----------|----------|
   | UT-PAS-21 | `pemohon1` | GET `/pas/semakan` | Ditolak (redirect + mesej) |
   | UT-PAS-22 | `pemohon1` | POST `/pas/semakan/{id}/review` (curl/DevTools) | Ditolak, status kekal |
   | UT-PAS-23 | `penyemak` | GET `/pas/permohonan/new` | Ditolak (tiada `pas.apply`) |
   | UT-PAS-24 | `pelulus` | POST `/review` pada `submitted` | Ditolak, status kekal |
   | UT-PAS-25 | `admin` | Mula semak → Lulus | Berjaya (`pas.*`) |
   | UT-PAS-26 | `pemohon2` | GET `/pas/permohonan/{id pemohon1}` | 404 |

### ✅ Checkpoint 8.2
- [ ] `php spark routes` menunjukkan filter gabungan pada ketiga-tiga route POST semakan (Kuiz S2).
- [ ] UT-PAS-20 (selepas) — penyemak tidak boleh meluluskan melalui DevTools/curl; status kekal (Kuiz S2).
- [ ] Langkah 8 — tanpa filter route, Service memulangkan **403**; filter sudah dipulihkan (Kuiz S2).
- [ ] UT-PAS-21 hingga 26 lulus (Kuiz S2).
- [ ] Anda boleh menerangkan: *filter route vs `authorize()` vs `canView()` — apa yang setiap satu lindungi* (Kuiz S2).
- [ ] Commit: `git add app/ docs/ && git commit -m "PAS: RBAC Shield — permission per tindakan + authorize() dalam Service"` (Kuiz S2)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Semua pegawai ditolak selepas menambah filter | `AuthGroups` tersalah ejaan (`pas.aprove`) atau pengguna tiada dalam group | Semak `$matrix`; `SELECT * FROM auth_groups_users;` |
| `php spark routes` menunjukkan `permission:` tetapi **tiada** `group:` pada route POST | CI < 4.5.4 — filter route **menggantikan** filter kumpulan (bukan digabung) | Naik taraf ke CI 4.6+ (SPEC); atau nyatakan kedua-dua filter dalam route array `['filter' => ['group:…', 'permission:…']]` |
| `Filter "permission" not found` / `"group" not found` | Shield tidak didaftarkan (Registrar Shield tidak dimuatkan) | `composer show codeigniter4/shield`; jalankan semula `php spark shield:setup` (Hari 4) |
| Mesej penolakan dalam Bahasa Inggeris ("You do not have the necessary permission…") | Shield tiada pek bahasa `ms` | Terima buat masa ini, atau ⭐ cabaran di bawah |
| Admin ditolak pada `/approve` | `$matrix['admin']` tiada `pas.*` | Salin baris admin tepat dari SPEC §4 |
| Redirect gelung ke `/` | `permission_denied` menghala ke route yang juga memerlukan permission | Tetapkan `Config\Auth::$redirects['permission_denied']` ke route awam/`session` sahaja |
| `Class "App\Controllers\Pas\PermissionException" not found` | Lupa `use CodeIgniter\Shield\Exceptions\PermissionException;` | Tambah `use` dalam Service **dan** `ReviewController` |

### ⭐ Cabaran tambahan
- Terjemah mesej Shield: cipta `app/Language/ms/Auth.php` dengan `'notEnoughPrivilege' => 'Anda tidak mempunyai kebenaran untuk tindakan ini.'`, tetapkan `app.defaultLocale = 'ms'` dan uji semula.
- Tukar `Config\Auth::$redirects['permission_denied']` dan `['group_denied']` ke route `/akses-ditolak` yang memaparkan `errors/forbidden` dengan status **403**.
- Log setiap penolakan `PermissionException` ke `writable/logs` dengan `log_message('warning', …)` (ID pengguna, route, masa) — bukti audit cubaan akses.

---

## Lab 8.3 — Garis Masa Status & Ujian Fungsian (S3)

### 🎯 Objektif
Memaparkan sejarah `status_logs` pada halaman butiran, dan menulis `PassAccessTest` yang menguji akses positif & negatif setiap peranan (≥ 13 ujian hijau).

### Prasyarat
- Lab 8.2 selesai. Database ujian MySQL (`kkm_latihan_test`) sudah dikonfigur sejak Hari 6 ([nota 10](../docs/nota-10-ujian-phpunit-ci4.md) §3).

### Langkah

1. **Cipta `app/Views/partials/status_timeline.php`**:

   `app/Views/partials/status_timeline.php`

   ```php
   <?php
   /**
    * Garis masa status dari status_logs (BR-PAS-05). Generik: boleh dipakai TLK juga.
    *
    * Guna (dalam app/Views/pas/show.php):
    *   <?= view('partials/status_timeline', ['history' => $history, 'enum' => \App\Enums\PassStatus::class]) ?>
    *
    * @var list<array{actor_name:?string, from_status:?string, to_status:string, remarks:?string, created_at:string}> $history
    *      dari StatusLogModel::history('PAS', $id) — susunan menaik (paling lama dahulu)
    * @var class-string<\BackedEnum> $enum  enum yang ada label() & badge(), cth App\Enums\PassStatus::class
    */

   $caseOf = static fn (?string $value) => $value === null ? null : $enum::tryFrom($value);

   // PassStatus::badge() memulangkan 'text-bg-info'; BookingStatus::badge() memulangkan 'warning'.
   // Normalkan supaya partial ini benar-benar generik (TLK & PAS) — lihat penyelesaian/hari-8/README.md.
   $badgeClass = static fn (?object $case): string => $case === null
       ? 'text-bg-light'
       : (str_starts_with($case->badge(), 'text-bg-') ? $case->badge() : 'text-bg-' . $case->badge());
   ?>
   <section class="mt-4" aria-labelledby="sejarah-status">
       <h2 id="sejarah-status" class="h5 mb-3"><i class="bi bi-clock-history"></i> Sejarah Status</h2>

       <?php if ($history === []): ?>
           <p class="text-body-secondary fst-italic">Tiada rekod sejarah.</p>
       <?php else: ?>
           <ol class="list-group list-group-numbered">
               <?php foreach ($history as $log): ?>
                   <?php
                       $from = $caseOf($log['from_status'] ?? null);
                       $to   = $caseOf($log['to_status']);
                   ?>
                   <li class="list-group-item d-flex justify-content-between align-items-start">
                       <div class="ms-2 me-auto">
                           <div class="fw-semibold">
                               <?php if ($from !== null): ?>
                                   <span class="badge <?= esc($badgeClass($from), 'attr') ?>"><?= esc($from->label()) ?></span>
                                   <i class="bi bi-arrow-right mx-1" aria-hidden="true"></i>
                                   <span class="visually-hidden">kepada</span>
                               <?php endif ?>
                               <span class="badge <?= esc($badgeClass($to), 'attr') ?>">
                                   <?= esc($to?->label() ?? $log['to_status']) ?>
                               </span>
                           </div>
                           <small class="text-body-secondary">
                               oleh <?= esc($log['actor_name'] ?? 'Sistem') ?>
                           </small>
                           <?php if (! empty($log['remarks'])): ?>
                               <div class="mt-1 fst-italic">&ldquo;<?= esc($log['remarks']) ?>&rdquo;</div>
                           <?php endif ?>
                       </div>
                       <small class="text-body-secondary text-nowrap ms-3">
                           <?= esc(date('d/m/Y H:i', strtotime((string) $log['created_at']))) ?>
                       </small>
                   </li>
               <?php endforeach ?>
           </ol>
       <?php endif ?>
   </section>
   ```

2. **Paparkan dalam `app/Views/pas/show.php`** — selepas panel tindakan, sebelum pautan "Kembali":

   ```php
   <?= view('partials/status_timeline', ['history' => $history, 'enum' => \App\Enums\PassStatus::class]) ?>
   ```

3. Buka permohonan A (diluluskan) dan B (ditolak). Sahkan garis masa: badge, nama pegawai, masa, catatan.

4. **Sediakan ujian:**

   ```bash
   mkdir -p tests/feature/Pas
   ```

   Cipta `tests/feature/Pas/PassAccessTest.php` dengan kandungan di bawah. **Baca setiap ujian** satu per satu dan tanda dalam jadual README §3.2 sel matriks mana yang diliputi.

   `tests/feature/Pas/PassAccessTest.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Feature\Pas;

   use App\Enums\PassStatus;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\Shield\Entities\User;
   use CodeIgniter\Shield\Exceptions\PermissionException;
   use CodeIgniter\Shield\Test\AuthenticationTesting;
   use CodeIgniter\Test\CIUnitTestCase;
   use CodeIgniter\Test\DatabaseTestTrait;
   use CodeIgniter\Test\FeatureTestTrait;
   use DomainException;

   /**
    * @internal
    */
   final class PassAccessTest extends CIUnitTestCase
   {
       use DatabaseTestTrait;
       use FeatureTestTrait;
       use AuthenticationTesting;

       protected $migrate   = true;
       protected $refresh   = true;
       protected $namespace = null;   // App + Shield + Settings (jadual users, auth_groups_users, settings)

       private User $pemohon1;
       private User $pemohon2;
       private User $penyemak;
       private User $pelulus;

       /** @var array<array-key, mixed> */
       private array $originalBeforeFilters = [];

       protected function setUp(): void
       {
           // Shield menyimpan pengguna log masuk dalam service 'auth' (dikongsi) — tanpa reset,
           // actingAs() dari kelas ujian lain "bocor" ke ujian ini apabila semua ujian dijalankan bersama.
           // MESTI sebelum parent::setUp() (yang memasang mock session/cache).
           $this->resetServices();

           parent::setUp();

           $this->pemohon1 = $this->createUser('applicant', 'pemohon1@latihan.test');
           $this->pemohon2 = $this->createUser('applicant', 'pemohon2@latihan.test');
           $this->penyemak = $this->createUser('reviewer', 'penyemak@latihan.test');
           $this->pelulus  = $this->createUser('approver', 'pelulus@latihan.test');

           // Ujian ini menguji LOGIK AKSES, bukan CSRF → nyahaktif CSRF dalam ujian sahaja (nota 10 §7.2)
           $filters                     = config('Filters');
           $this->originalBeforeFilters = $filters->globals['before'];
           $before                      = $filters->globals['before'];
           unset($before['csrf']);
           $filters->globals['before'] = array_filter($before, static fn ($v) => $v !== 'csrf');
       }

       protected function tearDown(): void
       {
           config('Filters')->globals['before'] = $this->originalBeforeFilters;   // pulihkan untuk ujian lain

           parent::tearDown();
       }

       // =================================================================
       // BR-PAS-04 — pemilikan
       // =================================================================

       public function testPemohonHanyaNampakPermohonanSendiriDalamSenarai(): void
       {
           $this->makeApplication($this->pemohon1, PassStatus::Submitted, 'PAS-2026-9001');
           $this->makeApplication($this->pemohon2, PassStatus::Submitted, 'PAS-2026-9002');

           $result = $this->actingAs($this->pemohon1)->get('pas/permohonan');

           $result->assertOK();
           $result->assertSee('PAS-2026-9001');
           $result->assertDontSee('PAS-2026-9002');
       }

       public function testPemohonLainMendapat404BagiPermohonanOrangLain(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::Submitted);

           $this->expectException(PageNotFoundException::class);
           $this->actingAs($this->pemohon2)->get("pas/permohonan/{$id}");
       }

       public function testPenyemakBolehLihatPermohonanSesiapa(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::Submitted, 'PAS-2026-9003');

           // Kaedah assert* TestResponse memulangkan void — jangan dirantai
           $result = $this->actingAs($this->penyemak)->get("pas/permohonan/{$id}");

           $result->assertOK();
           $result->assertSee('PAS-2026-9003');
       }

       // =================================================================
       // Filter laluan — negatif
       // =================================================================

       public function testPemohonTidakBolehBukaSenaraiSemakan(): void
       {
           $this->actingAs($this->pemohon1)->get('pas/semakan')->assertRedirect();
       }

       public function testPemohonTidakBolehLuluskan(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

           $this->actingAs($this->pemohon1)->post("pas/semakan/{$id}/approve")->assertRedirect();

           $this->assertStatusIs($id, PassStatus::UnderReview);
           $this->dontSeeInDatabase('status_logs', ['module' => 'PAS', 'record_id' => $id, 'to_status' => 'approved']);
       }

       public function testPenyemakTidakBolehLuluskan(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

           // Lulus filter group:reviewer,… TETAPI gagal permission:pas.approve
           $this->actingAs($this->penyemak)->post("pas/semakan/{$id}/approve")->assertRedirect();

           $this->assertStatusIs($id, PassStatus::UnderReview);
       }

       public function testPelulusTidakBolehMulakanSemakan(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::Submitted);

           $this->actingAs($this->pelulus)->post("pas/semakan/{$id}/review")->assertRedirect();

           $this->assertStatusIs($id, PassStatus::Submitted);
       }

       // =================================================================
       // Aliran — positif
       // =================================================================

       public function testPenyemakBolehMulakanSemakan(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::Submitted);

           $this->actingAs($this->penyemak)->post("pas/semakan/{$id}/review")
               ->assertRedirectTo("pas/permohonan/{$id}");

           $this->seeInDatabase('pass_applications', [
               'id'          => $id,
               'status'      => PassStatus::UnderReview->value,
               'reviewed_by' => $this->penyemak->id,
           ]);
           $this->seeInDatabase('status_logs', [
               'module'      => 'PAS',
               'record_id'   => $id,
               'from_status' => 'submitted',
               'to_status'   => 'under_review',
               'actor_id'    => $this->penyemak->id,
           ]);
       }

       public function testPelulusBolehLuluskan(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

           $this->actingAs($this->pelulus)
               ->post("pas/semakan/{$id}/approve", ['remarks' => 'Dokumen lengkap.'])
               ->assertRedirectTo("pas/permohonan/{$id}");

           $this->seeInDatabase('pass_applications', [
               'id'          => $id,
               'status'      => PassStatus::Approved->value,
               'approved_by' => $this->pelulus->id,
           ]);
           $this->seeInDatabase('status_logs', [
               'module'    => 'PAS',
               'record_id' => $id,
               'to_status' => 'approved',
               'actor_id'  => $this->pelulus->id,
           ]);
       }

       public function testTolakTanpaCatatanYangCukupTidakMengubahStatus(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

           $this->actingAs($this->penyemak)
               ->post("pas/semakan/{$id}/reject", ['remarks' => 'tak ok'])   // < 10 aksara (BR-PAS-03)
               ->assertRedirect();

           $this->assertStatusIs($id, PassStatus::UnderReview);
       }

       public function testPenyemakBolehTolakDenganCatatan(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

           $this->actingAs($this->penyemak)
               ->post("pas/semakan/{$id}/reject", ['remarks' => 'Salinan kad kuasa tidak jelas.'])
               ->assertRedirectTo("pas/permohonan/{$id}");

           $this->assertStatusIs($id, PassStatus::Rejected);
           $this->seeInDatabase('status_logs', [
               'record_id' => $id,
               'to_status' => 'rejected',
               'remarks'   => 'Salinan kad kuasa tidak jelas.',
           ]);
       }

       // =================================================================
       // Lapisan Service (defence in depth) — tanpa HTTP
       // =================================================================

       public function testServiceMenolakPeralihanTidakSah(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::Submitted);

           $this->expectException(DomainException::class);   // BR-PAS-01: submitted ↛ approved
           service('passWorkflowService', false)->approve($id, $this->pelulus);
       }

       public function testServiceMenyekatPenyemakWalaupunFilterTerlepas(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

           $this->expectException(PermissionException::class);
           service('passWorkflowService', false)->approve($id, $this->penyemak);
       }

       // =================================================================
       // Pembantu
       // =================================================================

       private function createUser(string $group, string $email): User
       {
           $users = auth()->getProvider();

           $user = new User([
               'username' => strstr($email, '@', true),
               'email'    => $email,              // sintetik sahaja
               'password' => 'Latihan@2026',
           ]);
           $users->save($user);

           $user = $users->findById($users->getInsertID());
           $user->addGroup($group);

           return $user;
       }

       private function makeApplication(User $owner, PassStatus $status, string $refNo = 'PAS-2026-9000'): int
       {
           $now = date('Y-m-d H:i:s');

           $this->db->table('pass_applications')->insert([
               'ref_no'      => $refNo,
               'user_id'     => $owner->id,
               'pass_type'   => 'kakitangan',
               'vehicle_id'  => null,
               'purpose'     => 'Akses bangunan pentadbiran (data sintetik).',
               'valid_from'  => date('Y-m-d'),
               'valid_until' => date('Y-m-d', strtotime('+90 days')),
               'status'      => $status->value,
               'created_at'  => $now,
               'updated_at'  => $now,
           ]);

           return (int) $this->db->insertID();
       }

       private function assertStatusIs(int $id, PassStatus $expected): void
       {
           $this->seeInDatabase('pass_applications', ['id' => $id, 'status' => $expected->value]);
       }
   }
   ```

5. **Jalankan:**

   ```bash
   composer test -- tests/feature/Pas/PassAccessTest.php --testdox
   ```

   Dijangka (13 ujian):

   ```text
   Pass Access (Tests\Feature\Pas\PassAccess)
    ✔ Pemohon hanya nampak permohonan sendiri dalam senarai
    ✔ Pemohon lain mendapat 404 bagi permohonan orang lain
    ✔ Penyemak boleh lihat permohonan sesiapa
    ✔ Pemohon tidak boleh buka senarai semakan
    ✔ Pemohon tidak boleh luluskan
    ✔ Penyemak tidak boleh luluskan
    ✔ Pelulus tidak boleh mulakan semakan
    ✔ Penyemak boleh mulakan semakan
    ✔ Pelulus boleh luluskan
    ✔ Tolak tanpa catatan yang cukup tidak mengubah status
    ✔ Penyemak boleh tolak dengan catatan
    ✔ Service menolak peralihan tidak sah
    ✔ Service menyekat penyemak walaupun filter terlepas

   OK (13 tests, 30 assertions)
   ```

6. **Buktikan ujian benar-benar menguji (ujian mutasi manual).** Satu demi satu, buat perubahan berikut, jalankan ujian, catat ujian mana yang **gagal**, kemudian **pulihkan**:

   | Mutasi | Ujian yang sepatutnya gagal |
   |--------|-----------------------------|
   | Buang `'filter' => 'permission:pas.approve'` dari route `/approve` **dan** komen `authorize()` dalam `approve()` | `testPenyemakTidakBolehLuluskan`, `testServiceMenyekatPenyemakWalaupunFilterTerlepas` |
   | Dalam `canView()`, pulangkan `true` | `testPemohonLainMendapat404BagiPermohonanOrangLain` |
   | Dalam `PassStatus::allowedTransitions()`, tambah `self::Approved` untuk `Submitted` | `testServiceMenolakPeralihanTidakSah` |
   | Dalam `reject()`, tukar `REMARKS_MIN` kepada `3` dan buang `min_length[10]` dari controller | `testTolakTanpaCatatanYangCukupTidakMengubahStatus` |

7. **Tambah satu ujian sendiri** (pilih satu): *admin boleh meluluskan* · *pelulus boleh menolak dengan catatan* · *pemohon tidak boleh memuat turun dokumen orang lain* (sisipkan baris `pass_documents` terus melalui `$this->db->table(...)`). Tampal kaedah pilihan anda ke dalam `PassAccessTest`, **sebelum** blok komen `// Pembantu`. Ketiga-tiga pilihan (setiap satu lengkap dan berdiri sendiri):

   ```php
       // =================================================================
       // Ujian sendiri (Lab 8.3 langkah 7) — pilih SATU
       // =================================================================

       public function testAdminBolehLuluskan(): void
       {
           $admin = $this->createUser('admin', 'admin@latihan.test');
           $id    = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

           $this->actingAs($admin)
               ->post("pas/semakan/{$id}/approve", ['remarks' => 'Diluluskan oleh pentadbir.'])
               ->assertRedirectTo("pas/permohonan/{$id}");

           $this->seeInDatabase('pass_applications', [
               'id'          => $id,
               'status'      => PassStatus::Approved->value,
               'approved_by' => $admin->id,
           ]);
       }

       public function testPelulusBolehTolakDenganCatatan(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

           $this->actingAs($this->pelulus)
               ->post("pas/semakan/{$id}/reject", ['remarks' => 'Tempoh pas melebihi tempoh kontrak.'])
               ->assertRedirectTo("pas/permohonan/{$id}");

           $this->assertStatusIs($id, PassStatus::Rejected);
           $this->seeInDatabase('status_logs', [
               'record_id' => $id,
               'to_status' => 'rejected',
               'actor_id'  => $this->pelulus->id,
           ]);
       }

       public function testPemohonTidakBolehMuatTurunDokumenOrangLain(): void
       {
           $id = $this->makeApplication($this->pemohon1, PassStatus::Submitted);
           $this->db->table('pass_documents')->insert([
               'application_id' => $id,
               'doc_type'       => 'sokongan',
               'original_name'  => 'surat.pdf',
               'stored_path'    => 'uploads/pas/tiada.pdf',
               'mime'           => 'application/pdf',
               'size_bytes'     => 40,
           ]);
           $docId = (int) $this->db->insertID();

           $this->expectException(PageNotFoundException::class);
           $this->actingAs($this->pemohon2)->get("pas/permohonan/dokumen/{$docId}");
       }
   ```

### ✅ Checkpoint 8.3
- [ ] Garis masa dipapar dengan 3 entri untuk A, termasuk catatan kelulusan (Kuiz S3).
- [ ] `composer test -- tests/feature/Pas` → semua hijau (13 + ujian anda) (Kuiz S3).
- [ ] Jadual mutasi (langkah 6) diisi — setiap mutasi menyebabkan sekurang-kurangnya satu ujian gagal (Kuiz S3).
- [ ] Commit: `git add app/ tests/ && git commit -m "PAS: garis masa status_logs + ujian akses peranan"` (Kuiz S3)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `SecurityException: The action you requested is not allowed.` dalam ujian POST | CSRF aktif — `FeatureTestTrait` tidak memintasnya | Blok `setUp()` template yang membuang `csrf` dari `$globals['before']`; pastikan `tearDown()` memulihkannya |
| `Table 'kkm_latihan_test.users' doesn't exist` | `$namespace` lalai hanya migrasi `App` | `protected $namespace = null;` |
| Ujian lulus apabila dijalankan seorang diri tetapi gagal (redirect/403 salah) dalam `composer test` penuh | Pengguna `actingAs()` dari kelas ujian lain "bocor" melalui service `auth` Shield yang dikongsi | `$this->resetServices();` **sebelum** `parent::setUp()` (lihat `setUp()` template) |
| `near "FOR": syntax error` | Masih guna SQLite `:memory:` | `.env`: `database.tests.DBDriver = MySQLi`, `database.tests.database = kkm_latihan_test`, `DBPrefix` kosong |
| `Unknown database 'kkm_latihan_test'` | DB ujian belum dicipta | `CREATE DATABASE kkm_latihan_test CHARACTER SET utf8mb4;` |
| `Call to a member function assertSee() on null` | Merantai `->assertOK()->assertSee()` — kaedah `assert*` memulangkan `void` | Simpan `$result = $this->…->get(...)`, kemudian `$result->assertOK(); $result->assertSee(...);` |
| Ujian 404 gagal: *Failed asserting that exception of type PageNotFoundException is thrown* | `canView()` membenarkan, **atau** `expectException()` diletak **selepas** `get()` | Letak `expectException()` sebelum permintaan; semak `canView()` |
| `testPelulusBolehLuluskan` gagal pada `assertRedirectTo` | `indexPage`/`baseURL` berbeza dalam `.env` ujian | Bandingkan `$result->getRedirectUrl()`; pastikan `app.baseURL` sama; atau guna `assertRedirect()` + semakan DB |
| `Call to undefined method Config\Services::passWorkflowService()` | Service belum didaftar (Hari 7) | Lab 7.2 langkah 3 |

### ⭐ Cabaran tambahan
- Tukar ujian negatif kepada `@dataProvider` tunggal: `[peranan, route, status awal]` → sentiasa "ditolak & status kekal".
- Ujian unit `tests/unit/Enums/PassStatusTest.php` untuk semua 25 pasangan `canTransitionTo()` (jika belum dari Hari 7).
- Jadikan partial garis masa digunakan juga untuk TLK (`BookingStatus::class`) pada halaman butiran tempahan.

---

## Lab 8.4 — Demo 3 Peranan & M2 Siap (S4)

### 🎯 Objektif
Mendemokan aliran Pas hujung-ke-hujung dengan 3 peranan dalam 5 minit, mengesahkan DoD, dan menggabungkan M2 ke `main`.

### Prasyarat
- Lab 8.1–8.3 selesai; semua ujian hijau.

### Langkah

1. **Latih skrip demo** (README §4.1) dua kali sebelum demo. Sediakan tiga tetingkap pelayar lebih awal (log masuk `pemohon1`, `penyemak`, `pelulus`) dan satu terminal.

2. **Demo kepada rakan sebelah** (5 minit). Rakan sebelah memegang **senarai semak DoD** (README §4.2) dan menandakan setiap item yang dibuktikan semasa demo. Tukar peranan.

3. **Gabung ke `main`:**

   ```bash
   composer test                             # SEMUA ujian (TLK + Pas) hijau
   git switch main && git pull
   git merge --no-ff feat/pas-kelulusan -m "PAS: M2 siap — aliran kelulusan, RBAC, status_logs, ujian"
   git push
   ```

4. **⭐ Pilihan — `php spark pas:expire`:**
   1. Cipta `app/Commands/ExpirePassesCommand.php`:

      `app/Commands/ExpirePassesCommand.php`

      ```php
      <?php

      declare(strict_types=1);

      namespace App\Commands;

      use CodeIgniter\CLI\BaseCommand;
      use CodeIgniter\CLI\CLI;
      use CodeIgniter\I18n\Time;
      use Throwable;

      class ExpirePassesCommand extends BaseCommand
      {
          protected $group       = 'Pas';
          protected $name        = 'pas:expire';
          protected $description = 'Tandakan pas "approved" yang melepasi valid_until sebagai "expired".';
          protected $usage       = 'pas:expire [--dry-run] [--actor <user_id>]';
          protected $options     = [
              '--dry-run' => 'Papar senarai sahaja; tiada perubahan pada DB.',
              '--actor'   => 'ID pengguna yang direkod sebagai actor_id dalam status_logs (lalai: admin pertama).',
          ];

          public function run(array $params)
          {
              $today    = Time::today()->toDateString();
              $workflow = service('passWorkflowService');
              $ids      = $workflow->expirableIds($today);

              if ($ids === []) {
                  CLI::write("Tiada pas untuk ditamatkan (tarikh rujukan {$today}).", 'green');

                  return EXIT_SUCCESS;
              }

              CLI::write(sprintf('%d pas melepasi valid_until sebelum %s: ID %s', count($ids), $today, implode(', ', $ids)));

              if (array_key_exists('dry-run', $params) || CLI::getOption('dry-run') !== null) {
                  CLI::write('--dry-run: tiada perubahan dibuat.', 'yellow');

                  return EXIT_SUCCESS;
              }

              $actorId = $this->resolveActorId($params);
              if ($actorId <= 0) {
                  CLI::error('Tiada actor sah. Guna --actor <user_id> atau pastikan ada pengguna dalam group admin.');

                  return EXIT_ERROR;
              }

              $ok   = 0;
              $fail = 0;

              foreach ($ids as $id) {
                  try {
                      $application = $workflow->expire($id, $actorId);   // canTransitionTo() + status_logs
                      CLI::write("  ✔ {$application->ref_no} → Tamat Tempoh", 'green');
                      $ok++;
                  } catch (Throwable $e) {
                      CLI::error("  ✘ ID {$id}: " . $e->getMessage());   // satu gagal tidak menghentikan yang lain
                      $fail++;
                  }
              }

              CLI::write(sprintf('Selesai: %d ditamatkan, %d gagal.', $ok, $fail), $fail === 0 ? 'green' : 'yellow');

              return $fail === 0 ? EXIT_SUCCESS : EXIT_ERROR;
          }

          /** @param array<int|string, mixed> $params */
          private function resolveActorId(array $params): int
          {
              $option = $params['actor'] ?? CLI::getOption('actor');

              if (is_string($option) && ctype_digit($option)) {
                  return (int) $option;
              }

              // Lalai: pengguna pertama dalam group admin (jadual Shield auth_groups_users)
              $table = config('Auth')->tables['groups_users'];
              $row   = db_connect()->table($table)
                  ->select('user_id')
                  ->where('group', 'admin')
                  ->orderBy('user_id', 'ASC')
                  ->get(1)
                  ->getRowArray();

              return (int) ($row['user_id'] ?? 0);
          }
      }
      ```

      Command ini memanggil `expirableIds()` dan `expire()` — tampal kedua-duanya dalam `app/Services/PassWorkflowService.php`, terus selepas kaedah `reject()`:

      ```php
          /**
           * approved → expired (SISTEM — dipanggil oleh Spark `pas:expire`).
           * Tiada semakan kebenaran: tiada laluan HTTP memanggil kaedah ini.
           */
          public function expire(int $applicationId, int $systemActorId): PassApplication
          {
              return $this->transition(
                  $applicationId,
                  PassStatus::Expired,
                  $systemActorId,
                  'Tamat tempoh automatik (pas:expire).',
              );
          }

          /**
           * ID permohonan approved yang valid_until < $today (Y-m-d).
           *
           * @return list<int>
           */
          public function expirableIds(string $today): array
          {
              $ids = $this->applications
                  ->where('status', PassStatus::Approved->value)
                  ->where('valid_until <', $today)
                  ->orderBy('id', 'ASC')
                  ->findColumn('id') ?? [];

              return array_map('intval', $ids);
          }
      ```
   2. `php spark list | grep pas` → `pas:expire` tersenarai di bawah kumpulan **Pas**.
   3. Sediakan data: `UPDATE pass_applications SET valid_until = CURDATE() - INTERVAL 1 DAY WHERE id = <id A>;`
   4. Buka senarai `pemohon1` — badge sudah **Tamat Tempoh** (dari `displayStatus()`), walaupun DB masih `approved`.
   5. `php spark pas:expire --dry-run` → senarai ID, tiada perubahan.
   6. `php spark pas:expire` → `✔ PAS-2026-000N → Tamat Tempoh`; semak `status_logs` ada `approved → expired`.
   7. Jalankan sekali lagi → "Tiada pas untuk ditamatkan".

### ✅ Checkpoint 8.4
- [ ] Demo 5 minit lulus semua item DoD (ditandatangani rakan sebelah) (Kuiz S4).
- [ ] `main` mengandungi M1 + M2; `composer test` hijau pada `main` (Kuiz S4).
- [ ] ⭐ `pas:expire` menukar pas tamat tempoh dengan log (Kuiz S4).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Konflik gabung dalam `app/Config/Routes.php` | TLK dan Pas menambah route di tempat yang sama | Kekalkan **kedua-dua** kumpulan; jalankan `php spark routes` selepas menyelesaikan |
| `pas:expire` tidak tersenarai | Namespace/folder salah | `app/Commands/`, `namespace App\Commands;`, kelas `extends BaseCommand` |
| `Tiada actor sah` | Tiada pengguna dalam group `admin` | `php spark pas:expire --actor <id admin>` atau jalankan `UserSeeder` |
| `pas:expire` tidak menjumpai pas yang tamat semalam (00:00–08:00) | `app.appTimezone` masih `UTC` | `.env`: `app.appTimezone = 'Asia/Kuala_Lumpur'` |

### ⭐ Cabaran tambahan
- Tulis ujian untuk `PassWorkflowService::expire()` dan `expirableIds()` (pas `approved` semalam → termasuk; `rejected` semalam → tidak).
- Tambah pilihan `--before=2026-12-31` untuk mensimulasikan tarikh rujukan.

---

## Lab 8.1b — Mula Semakan Pukal dari Baris Gilir (S5)

### 🎯 Objektif
Menggunakan semula `startReview()` dan `transition()` (Lab 8.1) untuk ciri baharu: penyemak menanda beberapa permohonan **Dihantar** di `/pas/semakan` dan memulakan semakan sekali gus. Setiap permohonan melalui transaksi dan baris `status_logs` sendiri; satu kegagalan BR-PAS-01 tidak menghentikan yang lain.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- [Lab 8.1](#lab-81--aliran-kelulusan-s1) siap. Baris `$this->authorize(...)` masih dikomen — sama seperti Lab 8.1; Lab 8.2 mengaktifkannya.
- Tetingkap pelayar Lab 8.1 (`penyemak`, `pelulus`). Langkah 6 memerlukan satu **sesi lain** yang ada `pas.review`: `admin@latihan.test` dalam pelayar lain.

### Langkah

1. **Sediakan data.** Log masuk sebagai `pemohon2` dan hantar **3** permohonan baharu melalui borang Hari 7 (`/pas/permohonan/new`, pas kakitangan, satu PDF kecil setiap satu). Kita panggil C, D dan E. Semak:

   ```sql
   SELECT id, ref_no, status FROM pass_applications WHERE status = 'submitted' ORDER BY id;
   ```

   Dijangka: sekurang-kurangnya 3 baris. Catat id C, D dan E.

2. **Tambah route** dalam `app/Config/Routes.php`, terus **selepas** kumpulan `pas/semakan` (Lab 8.1 langkah 4). Ia kumpulan **berasingan** dengan prefix yang sama: Lab 8.2 langkah 3 menggantikan kumpulan pertama sahaja, jadi route ini kekal.

   ```php
   // Lab 8.1b — mula semakan pukal. Kumpulan BERASINGAN: Lab 8.2 langkah 3 menggantikan kumpulan di atas, bukan yang ini.
   $routes->group('pas/semakan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'group:reviewer,approver,admin'], static function ($routes): void {
       $routes->post('pukal/review', 'ReviewController::reviewBatch', ['as' => 'pas.review.pukal']);
   });
   ```

3. **Kemas kini `app/Controllers/Pas/ReviewController.php`** — tiga tampalan (a)–(c):

   **(a)** Tambah baris `use` ini bersama baris `use` lain di bahagian atas fail:

   ```php
   use CodeIgniter\Exceptions\PageNotFoundException;
   ```

   **(b)** Gantikan seluruh kaedah `index()` dengan versi ini. Satu baris baharu sahaja: `canReview` dihantar ke view.

   ```php
       /** GET /pas/semakan — baris gilir pegawai */
       public function index(): string
       {
           $user      = auth()->user();
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');

           $model = model(PassApplicationModel::class)->withApplicant();

           if ($status !== null) {
               $model->withStatus($status);
           } else {
               // Lalai: apa yang perlu SAYA ambil tindakan
               $model->whereIn('pass_applications.status', $this->defaultQueue($user));
           }

           return view('pas/semakan/index', [
               'applications' => $model->orderBy('pass_applications.created_at', 'ASC')->paginate(15),
               'pager'        => $model->pager,
               'status'       => $status,
               'canReview'    => $user->can('pas.review'),   // Lab 8.1b: checkbox pukal (UX sahaja)
           ]);
       }
   ```

   **(c)** Tampal kaedah `reviewBatch()` **selepas** kaedah `reject()` dan **sebelum** baris komen `// -----------------------------------------------------------------`:

   ```php
       /**
        * POST /pas/semakan/pukal/review — Lab 8.1b: mula semakan beberapa permohonan sekali gus.
        * Setiap ID melalui startReview() → transition(): satu transaksi + satu baris status_logs bagi setiap permohonan.
        */
       public function reviewBatch(): ResponseInterface
       {
           // ids[] dari checkbox — tukar kepada int, buang 0/negatif dan pendua
           $ids = array_values(array_unique(array_filter(
               array_map('intval', (array) $this->request->getPost('ids')),
               static fn (int $id): bool => $id > 0,
           )));

           if ($ids === []) {
               return redirect()->to(url_to('pas.semakan'))->with('error', 'Pilih sekurang-kurangnya satu permohonan.');
           }

           $workflow = service('passWorkflowService');
           $user     = auth()->user();
           $started  = [];
           $failed   = [];

           try {
               foreach ($ids as $id) {
                   try {
                       $started[] = $workflow->startReview($id, $user)->ref_no;
                   } catch (DomainException|PageNotFoundException $e) {
                       $failed[] = "ID {$id}: " . $e->getMessage();   // satu gagal tidak menghentikan yang lain
                   }
               }
           } catch (PermissionException $e) {
               // authorize() menolak SEBELUM transition() — tiada permohonan berubah
               return $this->response
                   ->setStatusCode(403)
                   ->setBody(view('errors/forbidden', ['message' => $e->getMessage()]));
           }

           $redirect = redirect()->to(url_to('pas.semakan'));

           if ($started !== []) {
               $redirect = $redirect->with('message', sprintf('%d permohonan kini Dalam Semakan: %s.', count($started), implode(', ', $started)));
           }

           if ($failed !== []) {
               $redirect = $redirect->with('error', sprintf('%d gagal — %s', count($failed), implode(' · ', $failed)));
           }

           return $redirect;
       }
   ```

   Perhatikan tiga perkara: (1) controller tidak menyentuh status — setiap ID melalui `startReview()`, jadi kunci `FOR UPDATE`, BR-PAS-01 dan BR-PAS-05 terpakai; (2) `try/catch` dalam gelung menangkap `DomainException` bagi **satu** permohonan dan meneruskan yang lain; (3) `PermissionException` ditangkap di luar gelung — ia akan berlaku apabila `authorize()` diaktifkan dalam Lab 8.2.

4. **Gantikan seluruh `app/Views/pas/semakan/index.php`** dengan versi ini. Berbanding Lab 8.1: jadual dibalut `form_open()` (token CSRF automatik), lajur checkbox dan butang hanya untuk pegawai yang ada `pas.review`, dan checkbox hanya pada permohonan **Dihantar**.

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Semakan Permohonan Pas<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <h1 class="h3 mb-3">Semakan Permohonan Pas</h1>

   <form method="get" class="row g-2 mb-3" role="search">
       <div class="col-auto">
           <label for="status" class="visually-hidden">Status</label>
           <select name="status" id="status" class="form-select">
               <option value="">Baris gilir saya</option>
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
       <div class="alert alert-success">Tiada permohonan menunggu tindakan anda.</div>
   <?php else: ?>
       <?php /* Lab 8.1b: borang POST pukal membalut jadual — checkbox hanya untuk "Dihantar" + pegawai yang ada pas.review */ ?>
       <?= form_open(url_to('pas.review.pukal')) ?>
           <?php if ($canReview): ?>
               <button type="submit" class="btn btn-info mb-3" onclick="return confirm('Mula semakan semua permohonan yang ditanda?')">
                   <i class="bi bi-search" aria-hidden="true"></i> Mula Semakan (yang ditanda)
               </button>
           <?php endif ?>
           <div class="table-responsive">
               <table class="table table-hover align-middle">
                   <thead>
                       <tr>
                           <?php if ($canReview): ?><th scope="col"><span class="visually-hidden">Pilih</span></th><?php endif ?>
                           <th>No. Rujukan</th><th>Pemohon</th><th>Jenis</th><th>Tempoh Sah</th><th>Status</th><th>Dihantar</th><th></th>
                       </tr>
                   </thead>
                   <tbody>
                   <?php foreach ($applications as $app): ?>
                       <?php $shown = $app->displayStatus(); ?>
                       <tr>
                           <?php if ($canReview): ?>
                               <td>
                                   <?php if ($app->statusEnum() === \App\Enums\PassStatus::Submitted): ?>
                                       <input type="checkbox" name="ids[]" value="<?= esc((string) $app->id, 'attr') ?>" class="form-check-input" aria-label="Pilih <?= esc($app->ref_no, 'attr') ?>">
                                   <?php endif ?>
                               </td>
                           <?php endif ?>
                           <td class="fw-semibold"><?= esc($app->ref_no) ?></td>
                           <td><?= esc($app->applicant_name ?? '—') ?></td>
                           <td><?= esc($app->typeEnum()->label()) ?></td>
                           <td><?= esc($app->valid_from->format('d/m/Y')) ?> – <?= esc($app->valid_until->format('d/m/Y')) ?></td>
                           <td><span class="badge <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span></td>
                           <td><?= esc($app->created_at->format('d/m/Y H:i')) ?></td>
                           <td><a href="<?= url_to('pas.show', $app->id) ?>" class="btn btn-sm btn-primary">Buka</a></td>
                       </tr>
                   <?php endforeach ?>
                   </tbody>
               </table>
           </div>
       <?= form_close() ?>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```

5. **Sahkan:**

   ```bash
   php -l app/Controllers/Pas/ReviewController.php
   php spark routes | grep pukal      # PowerShell: php spark routes | Select-String "pukal"
   ```

   Baris `pas/semakan/pukal/review` mempunyai Before Filters `csrf group:reviewer,approver,admin` sahaja — tiada `permission:`. Lab 8.2b membaikinya.

6. **Ujian serentak (dua sesi):**
   - `penyemak` (tetingkap biasa): buka `/pas/semakan` → tanda C, D dan E. **Jangan** klik butang lagi.
   - `admin` (pelayar lain): buka E (`/pas/permohonan/<id E>`) → **Mula Semakan**.
   - `penyemak`: tanpa memuat semula halaman, klik **Mula Semakan (yang ditanda)** → **OK**.

   Catat mesej hijau dan merah yang dipaparkan. Kenapa `admin` dalam pelayar lain, bukan tab kedua `penyemak`? Token CSRF ditukar selepas setiap POST (`Config\Security::$regenerate = true`), jadi halaman lama dalam sesi yang **sama** ditolak dengan *The action you requested is not allowed.* sebelum controller dipanggil.

7. **Tanpa pilihan:** klik **Mula Semakan (yang ditanda)** tanpa menanda apa-apa. Dijangka: *Pilih sekurang-kurangnya satu permohonan.*

8. **Semak DB:**

   ```sql
   SELECT id, ref_no, status, reviewed_by FROM pass_applications WHERE id IN (<id C>, <id D>, <id E>);
   SELECT record_id, from_status, to_status, actor_id FROM status_logs WHERE module = 'PAS' AND to_status = 'under_review' ORDER BY id;
   ```

9. Dalam tetingkap `pelulus`, buka `/pas/semakan`: tiada checkbox dan tiada butang. Menyembunyikan butang ialah UX sahaja — Lab 8.2b membuktikannya.

10. **Commit:**

    ```bash
    git add app/ && git commit -m "PAS: mula semakan pukal melalui startReview()"
    ```

### ✅ Checkpoint 8.1b
- [ ] Langkah 6: C dan D `under_review` dengan `reviewed_by` = id penyemak; E ditolak dengan mesej BR-PAS-01 dalam flash merah (Kuiz S5).
- [ ] `status_logs` ada tepat **satu** baris `submitted → under_review` bagi setiap C, D dan E — tiada log pendua bagi E (Kuiz S5).
- [ ] Tanpa pilihan → *Pilih sekurang-kurangnya satu permohonan.*; tetingkap `pelulus` tidak memaparkan checkbox (Kuiz S5).
- [ ] Commit `PAS: mula semakan pukal melalui startReview()` (Kuiz S5).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| *The action you requested is not allowed.* selepas klik **Mula Semakan (yang ditanda)** | Halaman dibuka sebelum POST lain dalam sesi yang sama — token CSRF sudah ditukar | Muat semula `/pas/semakan` dan tanda semula; untuk langkah 6 guna pelayar lain (sesi berasingan) |
| `Undefined variable $canReview` | `index()` belum diganti | Langkah 3(b) |
| `The route for "pas.review.pukal" cannot be found.` | Route langkah 2 tiada atau salah nama `as` | Semak `Routes.php`; `php spark routes \| grep pukal` |
| `Class "App\Controllers\Pas\PageNotFoundException" not found` | Baris `use` langkah 3(a) tertinggal | Tambah `use CodeIgniter\Exceptions\PageNotFoundException;` |
| Halaman ralat `DomainException` (bukan flash merah) | `try/catch` dalam gelung tertinggal — exception pertama menghentikan semua | Salin semula `reviewBatch()` langkah 3(c) |
| Route pukal hilang selepas Lab 8.2 | Kumpulan berasingan turut diganti dalam Lab 8.2 langkah 3 | Tampal semula blok langkah 2 selepas kumpulan `pas/semakan` |

### ⭐ Cabaran tambahan
- Tambah checkbox **Tanda semua** di pengepala jadual (JavaScript kecil dalam `section('scripts')`).
- Kenapa **Tolak pukal** dengan satu catatan bersama ialah idea buruk? Kaitkan dengan BR-PAS-03 dan apa yang juruaudit baca dalam `status_logs`.

---

## Lab 8.2b — Lindungi Route Pukal: Filter `permission:` & Matriks Peranan (S6)

### 🎯 Objektif
Menutup lubang Lab 8.1b: route pukal hanya ada filter `group:`, jadi `pelulus` sampai ke controller. Membuktikan Lapisan 2 (`authorize()` dari Lab 8.2) sudah menolak dengan 403, menambah Lapisan 1 `permission:pas.review`, dan merekod matriks 4 peranan × route pukal dalam `docs/ujian-manual-pas.md`.

### Prasyarat
- 🪟 **Windows:** jalankan semua blok `bash` dalam terminal **Git Bash** VS Code, bukan PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- [Lab 8.2](#lab-82--kawalan-akses-ikut-peranan-s2) siap: `authorize()` aktif dalam `startReview()`, `approve()` dan `reject()`.
- [Lab 8.1b](#lab-81b--mula-semakan-pukal-dari-baris-gilir-s5) siap. Sekurang-kurangnya satu permohonan `submitted` dan satu `under_review` (hantar satu lagi sebagai `pemohon2` jika perlu).

### Langkah

1. **Ukur.** Git Bash menukar path yang bermula dengan `/`, jadi letak `MSYS_NO_PATHCONV=1` di hadapan:

   ```bash
   MSYS_NO_PATHCONV=1 php spark filter:check POST /pas/semakan/pukal/review
   MSYS_NO_PATHCONV=1 php spark filter:check POST /pas/semakan/1/review
   ```

   Bandingkan lajur *Before Filters*: route individu ada `permission:pas.review`; route pukal tiada.

2. **Serang sebagai `pelulus`.** Log masuk sebagai `pelulus`. Buka satu permohonan `under_review` (`/pas/permohonan/<id>`) — halaman ini ada borang **Lulus**, jadi ada token CSRF. Catat id satu permohonan `submitted` (`/pas/semakan?status=submitted`). Tekan F12 → tab **Console**, tampal kod di bawah, tukar `<ID>` kepada id `submitted` itu, tekan Enter:

   ```js
   fetch('/pas/semakan/pukal/review', {
       method: 'POST',
       body: new URLSearchParams({
           csrf_test_name: document.querySelector('input[name="csrf_test_name"]').value,
           'ids[]': '<ID>',
       }),
   }).then((r) => console.log(r.status, r.url));
   ```

   Catat apa yang dicetak, kemudian semak status permohonan itu:

   ```sql
   SELECT id, status, reviewed_by FROM pass_applications WHERE id = <ID>;
   ```

   `authorize()` dalam Service menolak, jadi tiada perubahan. Tetapi 403 dari Service bermaksud route tersalah konfigur (README §2.4): Lapisan 1 sepatutnya menolak dahulu.

3. **Tambah filter.** Dalam `app/Config/Routes.php`, gantikan kumpulan berasingan Lab 8.1b dengan versi ini (hanya baris `post` berubah):

   ```php
   // Lab 8.1b — mula semakan pukal. Kumpulan BERASINGAN: Lab 8.2 langkah 3 menggantikan kumpulan di atas, bukan yang ini.
   $routes->group('pas/semakan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'group:reviewer,approver,admin'], static function ($routes): void {
       // Lab 8.2b: Lapisan 1 — sama seperti (:num)/review. Tanpanya, approver (ada group, tiada pas.review) sampai ke controller.
       $routes->post('pukal/review', 'ReviewController::reviewBatch', ['as' => 'pas.review.pukal', 'filter' => 'permission:pas.review']);
   });
   ```

4. Ulang `filter:check` langkah 1 untuk route pukal. *Before Filters* kini `forcehttps pagecache csrf group:reviewer,approver,admin permission:pas.review`.

5. **Ulang serangan.** Muat semula halaman permohonan `under_review` (token CSRF baharu — token lama sudah ditukar oleh POST langkah 2), kemudian jalankan kod Console yang sama. Catat apa yang dicetak, dan semak semula status dengan SQL langkah 2.

6. **Matriks peranan.** Uji setiap baris, kemudian tambah jadual ini di hujung `docs/ujian-manual-pas.md` dan isi lajur *Hasil*. Untuk `pemohon1`, jalankan kod Console dari `/pas/permohonan/new` (halaman itu ada token CSRF). Muat semula halaman sebelum setiap cubaan.

   ```markdown

   ## Route pukal POST /pas/semakan/pukal/review (Lab 8.2b)

   | ID | Pengguna | Tindakan | Dijangka | Hasil |
   |----|----------|----------|----------|-------|
   | UT-PAS-27 | `pemohon1` | Console `fetch` (`ids[]` = permohonan `submitted`) | `200 …/` (filter `group:`), status kekal | |
   | UT-PAS-28 | `pelulus` | Console `fetch` | `200 …/` (filter `permission:pas.review`), status kekal | |
   | UT-PAS-29 | `penyemak` | Tanda 2 permohonan → **Mula Semakan (yang ditanda)** | 2 `under_review`, 2 baris `status_logs` | |
   | UT-PAS-30 | `admin` | Tanda 1 permohonan → **Mula Semakan (yang ditanda)** | `under_review` (`pas.*`) | |
   ```

7. **Commit:**

   ```bash
   git add app/ docs/ && git commit -m "PAS: permission:pas.review pada route pukal + UT-PAS-27..30"
   ```

### ✅ Checkpoint 8.2b
- [ ] Langkah 2 (sebelum filter): Console `pelulus` mencetak `403 …/pas/semakan/pukal/review` dan permohonan kekal `submitted` (Kuiz S6).
- [ ] `filter:check POST /pas/semakan/pukal/review` menunjukkan `group:reviewer,approver,admin permission:pas.review`; langkah 5 mencetak `200 http://localhost:8080/` dan status kekal (Kuiz S6).
- [ ] UT-PAS-27 hingga 30 lulus dan direkod dalam `docs/ujian-manual-pas.md` (Kuiz S6).
- [ ] Commit `PAS: permission:pas.review pada route pukal + UT-PAS-27..30` (Kuiz S6).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Chrome enggan menampal: *Warning: Don't paste code…* | Perlindungan tampal Chrome | Taip `allow pasting`, Enter, kemudian tampal semula |
| `TypeError: Cannot read properties of null (reading 'value')` | Halaman tiada borang, jadi tiada `csrf_test_name` (cth permohonan `submitted` dibuka sebagai `pelulus`) | Buka permohonan `under_review` (`pelulus`) atau `/pas/permohonan/new` (`pemohon1`) |
| `403` selepas langkah 3 juga | Token lama — halaman tidak dimuat semula selepas POST sebelumnya; filter `csrf` menolak dengan 403 sebelum filter Shield | Muat semula halaman sebelum setiap `fetch` |
| `404 …/pas/semakan/pukal/review` | URL aplikasi berbeza (cth `index.php` atau subfolder Laragon) | Guna URL yang sama seperti pelayar; semak `app.indexPage` dan `app.baseURL` |
| `filter:check`: `Can't find a route: "POST C:/Program Files/Git/pas/…"` | Git Bash menukar path | `MSYS_NO_PATHCONV=1` di hadapan arahan |

### ⭐ Cabaran tambahan
Dalam `ReviewController::reviewBatch()`, tambah `log_message('warning', …)` dalam `catch (PermissionException $e)` (ID pengguna, senarai `ids`, masa). Kenapa log ini sepatutnya **kosong** selepas langkah 3?

---

## Lab 8.3b — Ujian Fungsian Tindakan Pukal (S7)

### 🎯 Objektif
Menulis `PassBatchReviewTest` (5 ujian) bagi route pukal — positif, kegagalan separa, tanpa pilihan, dan dua ujian negatif yang menyemak respons **dan** DB — kemudian membuktikan dengan dua mutasi bahawa ujian itu menangkap kesilapan Lab 8.1b dan 8.2b.

### Prasyarat
- [Lab 8.3](#lab-83--garis-masa-status--ujian-fungsian-s3) siap: `PassAccessTest` hijau; DB ujian `kkm_latihan_test` berfungsi.
- [Lab 8.2b](#lab-82b--lindungi-route-pukal-filter-permission--matriks-peranan-s6) siap: route pukal ada `permission:pas.review`.

### Langkah

1. **Cipta `tests/feature/Pas/PassBatchReviewTest.php`** dengan kandungan di bawah. Corak `setUp()`/`tearDown()` dan pembantu sama seperti `PassAccessTest`; yang baharu ialah `assertSessionHas()` (flash `message`/`error`) dan `logCount()`.

   `tests/feature/Pas/PassBatchReviewTest.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Feature\Pas;

   use App\Enums\PassStatus;
   use CodeIgniter\Shield\Entities\User;
   use CodeIgniter\Shield\Test\AuthenticationTesting;
   use CodeIgniter\Test\CIUnitTestCase;
   use CodeIgniter\Test\DatabaseTestTrait;
   use CodeIgniter\Test\FeatureTestTrait;

   /**
    * Lab 8.3b — ujian fungsian tindakan pukal POST /pas/semakan/pukal/review (Lab 8.1b, 8.2b).
    *
    * @internal
    */
   final class PassBatchReviewTest extends CIUnitTestCase
   {
       use DatabaseTestTrait;
       use FeatureTestTrait;
       use AuthenticationTesting;

       protected $migrate   = true;
       protected $refresh   = true;
       protected $namespace = null;   // App + Shield + Settings

       private User $pemohon1;
       private User $penyemak;
       private User $pelulus;

       /** @var array<array-key, mixed> */
       private array $originalBeforeFilters = [];

       protected function setUp(): void
       {
           $this->resetServices();   // sebelum parent::setUp() — sama seperti PassAccessTest

           parent::setUp();

           $this->pemohon1 = $this->createUser('applicant', 'pemohon1@latihan.test');
           $this->penyemak = $this->createUser('reviewer', 'penyemak@latihan.test');
           $this->pelulus  = $this->createUser('approver', 'pelulus@latihan.test');

           // Ujian akses, bukan CSRF (nota 10 §7.2)
           $filters                     = config('Filters');
           $this->originalBeforeFilters = $filters->globals['before'];
           $before                      = $filters->globals['before'];
           unset($before['csrf']);
           $filters->globals['before'] = array_filter($before, static fn ($v) => $v !== 'csrf');
       }

       protected function tearDown(): void
       {
           config('Filters')->globals['before'] = $this->originalBeforeFilters;

           parent::tearDown();
       }

       // =================================================================
       // Positif
       // =================================================================

       public function testPenyemakMulakanSemakanPukal(): void
       {
           $a = $this->makeApplication(PassStatus::Submitted, 'PAS-2026-9101');
           $b = $this->makeApplication(PassStatus::Submitted, 'PAS-2026-9102');

           $result = $this->actingAs($this->penyemak)->post('pas/semakan/pukal/review', ['ids' => [$a, $b]]);

           $result->assertRedirectTo('pas/semakan');
           $result->assertSessionHas('message', '2 permohonan kini Dalam Semakan: PAS-2026-9101, PAS-2026-9102.');

           foreach ([$a, $b] as $id) {
               $this->seeInDatabase('pass_applications', [
                   'id'          => $id,
                   'status'      => PassStatus::UnderReview->value,
                   'reviewed_by' => $this->penyemak->id,
               ]);
           }
           $this->assertSame(2, $this->logCount('under_review'));   // satu log bagi setiap permohonan
       }

       public function testSatuGagalTidakMenghentikanYangLain(): void
       {
           $sedia = $this->makeApplication(PassStatus::UnderReview, 'PAS-2026-9103');   // sudah dimulakan orang lain
           $baru  = $this->makeApplication(PassStatus::Submitted, 'PAS-2026-9104');

           $result = $this->actingAs($this->penyemak)->post('pas/semakan/pukal/review', ['ids' => [$sedia, $baru]]);

           $result->assertSessionHas('message', '1 permohonan kini Dalam Semakan: PAS-2026-9104.');
           $result->assertSessionHas('error', "1 gagal — ID {$sedia}: Peralihan status \"Dalam Semakan\" → \"Dalam Semakan\" tidak dibenarkan.");
           $this->assertStatusIs($baru, PassStatus::UnderReview);
           $this->assertSame(1, $this->logCount('under_review'));   // yang gagal: tiada log
       }

       // =================================================================
       // Negatif — respons DAN DB
       // =================================================================

       public function testTanpaPilihanMemaparkanRalat(): void
       {
           $result = $this->actingAs($this->penyemak)->post('pas/semakan/pukal/review', []);

           $result->assertRedirectTo('pas/semakan');
           $result->assertSessionHas('error', 'Pilih sekurang-kurangnya satu permohonan.');
       }

       public function testPelulusDitolakFilterDanStatusKekal(): void
       {
           $id = $this->makeApplication(PassStatus::Submitted);

           // Lulus group:reviewer,… TETAPI gagal permission:pas.review (Lab 8.2b) → redirect + flash 'error' Shield
           $result = $this->actingAs($this->pelulus)->post('pas/semakan/pukal/review', ['ids' => [$id]]);

           $result->assertRedirect();
           $result->assertSessionHas('error');

           $this->assertStatusIs($id, PassStatus::Submitted);
           $this->assertSame(0, $this->logCount('under_review'));
       }

       public function testPemohonDitolakDanStatusKekal(): void
       {
           $id = $this->makeApplication(PassStatus::Submitted);

           $result = $this->actingAs($this->pemohon1)->post('pas/semakan/pukal/review', ['ids' => [$id]]);

           $result->assertRedirect();
           $result->assertSessionHas('error');

           $this->assertStatusIs($id, PassStatus::Submitted);
       }

       // =================================================================
       // Pembantu
       // =================================================================

       private function createUser(string $group, string $email): User
       {
           $users = auth()->getProvider();

           $user = new User([
               'username' => strstr($email, '@', true),
               'email'    => $email,              // sintetik sahaja
               'password' => 'Latihan@2026',
           ]);
           $users->save($user);

           $user = $users->findById($users->getInsertID());
           $user->addGroup($group);

           return $user;
       }

       private function makeApplication(PassStatus $status, string $refNo = 'PAS-2026-9100'): int
       {
           $now = date('Y-m-d H:i:s');

           $this->db->table('pass_applications')->insert([
               'ref_no'      => $refNo,
               'user_id'     => $this->pemohon1->id,
               'pass_type'   => 'kakitangan',
               'vehicle_id'  => null,
               'purpose'     => 'Akses bangunan pentadbiran (data sintetik).',
               'valid_from'  => date('Y-m-d'),
               'valid_until' => date('Y-m-d', strtotime('+90 days')),
               'status'      => $status->value,
               'created_at'  => $now,
               'updated_at'  => $now,
           ]);

           return (int) $this->db->insertID();
       }

       private function assertStatusIs(int $id, PassStatus $expected): void
       {
           $this->seeInDatabase('pass_applications', ['id' => $id, 'status' => $expected->value]);
       }

       private function logCount(string $toStatus): int
       {
           return $this->db->table('status_logs')
               ->where(['module' => 'PAS', 'to_status' => $toStatus])
               ->countAllResults();
       }
   }
   ```

2. **Jalankan:**

   ```bash
   composer test -- tests/feature/Pas/PassBatchReviewTest.php --testdox
   ```

   Dijangka 5 ✔. Catat baris akhir output.

3. **Mutasi 1 — buang Lapisan 1.** Dalam `app/Config/Routes.php`, buang `, 'filter' => 'permission:pas.review'` dari route pukal. Jalankan langkah 2 semula, catat ujian yang gagal dan mesejnya. **Pulihkan.**

4. **Mutasi 2 — buang `try/catch` dalam gelung.** Dalam `reviewBatch()`, gantikan blok `try { … } catch (DomainException|PageNotFoundException $e) { … }` dalam `foreach` dengan satu baris `$started[] = $workflow->startReview($id, $user)->ref_no;`. Jalankan langkah 2 semula, catat ujian yang gagal dan mesejnya. **Pulihkan** (salin semula Lab 8.1b langkah 3(c) jika ragu).

5. Rekod kedua-dua mutasi di hujung `docs/ujian-manual-pas.md`:

   ```markdown

   ## Mutasi PassBatchReviewTest (Lab 8.3b)

   | Mutasi | Ujian yang gagal | Mesej |
   |--------|------------------|-------|
   | Buang `permission:pas.review` dari route pukal | | |
   | Buang `try/catch` dalam gelung `reviewBatch()` | | |
   ```

6. **Semua ujian Pas:**

   ```bash
   composer test -- tests/feature/Pas
   ```

   Semua hijau, termasuk `PassAccessTest` (13 + ujian anda) dan `PassBatchReviewTest` (5).

7. **Commit:**

   ```bash
   git add tests/ docs/ && git commit -m "PAS: ujian fungsian route pukal + jadual mutasi"
   ```

### ✅ Checkpoint 8.3b
- [ ] `PassBatchReviewTest` → `OK (5 tests, 24 assertions)` (Kuiz S7).
- [ ] Jadual mutasi diisi: mutasi 1 dan 2 masing-masing menggagalkan satu ujian; kod dipulihkan dan semua hijau semula (Kuiz S7).
- [ ] `composer test -- tests/feature/Pas` hijau; commit `PAS: ujian fungsian route pukal + jadual mutasi` (Kuiz S7).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Redirect URL '/' does not match 'http://localhost:8080'` | `assertRedirectTo('/')` dibandingkan dengan URL penuh tanpa `/` akhir | Ujian guna `assertRedirect()` + `assertSessionHas('error')` untuk penolakan Shield — salin semula |
| `assertSessionHas('message', …)` gagal kerana teks berbeza | Mesej dalam `reviewBatch()` diubah (titik, sempang `—`, pemisah `·`) | Salin semula `reviewBatch()` Lab 8.1b; teks mesti sama aksara demi aksara |
| Lulus seorang diri, gagal dalam suite penuh | `$this->resetServices()` tiada sebelum `parent::setUp()` | Lihat `setUp()` template |
| `SecurityException` | CSRF masih aktif dalam ujian | Blok `setUp()` yang membuang `csrf` + `tearDown()` |

### ⭐ Cabaran tambahan
Tambah `testAdminBolehMulakanSemakanPukal` (admin melalui `pas.*`), dan `testIdTidakWujudDilaporkan` — `ids` = `[99999]` → flash `error` `1 gagal — ID 99999: …` (kenapa mesej itu datang dari `PageNotFoundException`?).

---

## Lab 8.4b — Demo Peranan Keempat: `admin` & Dapatan Pemisahan Tugas (S8)

### 🎯 Objektif
Menambah babak `admin` kepada demo M2: admin memohon, memulakan semakan pukal dan meluluskan permohonannya sendiri (SPEC §4 membenarkannya melalui `pas.*`); membuktikan BR-PAS-01 dengan dua pelulus serentak (`admin` dan `pelulus`); dan merekod dapatan pemisahan tugas untuk pemilik sistem dalam `docs/demo-m2.md`.

### Prasyarat
- [Lab 8.4](#lab-84--demo-3-peranan--m2-siap-s4) siap: `feat/pas-kelulusan` (termasuk Lab 8.1b–8.3b) sudah digabung ke `main`.
- Tetingkap `pelulus` (inkognito) dan `admin` (pelayar lain) log masuk.

### Langkah

1. **Branch:**

   ```bash
   git switch main && git pull
   git switch -c docs/demo-m2
   ```

2. **`admin` memohon.** `/pas/permohonan/new` → pas kakitangan + satu PDF → **Hantar**. Catat nombor rujukan (kita panggil F) dan id dalam URL.

3. **`admin` semak senarai sendiri.** `/pas/permohonan` — kira berapa baris dipaparkan.

4. **`admin` mula semakan pukal.** `/pas/semakan` → tanda F → **Mula Semakan (yang ditanda)**.

5. **`pelulus` buka F** (`/pas/permohonan/<id F>`). Borang **Lulus** dipaparkan. **Jangan** klik.

6. **`admin` luluskan F** dengan catatan `Diluluskan oleh pentadbir.`

7. **`pelulus`**: tanpa memuat semula halaman langkah 5, klik **Lulus** → **OK**. Catat mesej.

8. **`admin` muat semula F.** Baca garis masa: bilangan entri dan nama pada setiap entri.

9. **Semak DB:**

   ```sql
   SELECT user_id, reviewed_by, approved_by FROM pass_applications WHERE id = <id F>;
   SELECT from_status, to_status, actor_id FROM status_logs WHERE module = 'PAS' AND record_id = <id F> ORDER BY id;
   ```

10. **Cipta `docs/demo-m2.md`** dan isi lajur *Hasil* dari langkah 2–9:

    ```markdown
    # Demo M2 — Modul Pas (4 peranan)

    Skrip 3 peranan: README Hari 8 §4.1. Babak peranan keempat (Lab 8.4b):

    | # | Peranan | Tindakan | Hasil |
    |---|---------|----------|-------|
    | 9 | `admin` | Mohon pas kakitangan + 1 dokumen | |
    | 10 | `admin` | `/pas/permohonan` — senarai | |
    | 11 | `admin` | `/pas/semakan` → tanda F → Mula Semakan (yang ditanda) | |
    | 12 | `pelulus` + `admin` | `pelulus` buka F; `admin` lulus; `pelulus` klik Lulus | |
    | 13 | `admin` | Garis masa F | |

    ## Dapatan untuk pemilik sistem: pemisahan tugas

    - **Fakta:** `admin` memohon, menyemak dan meluluskan permohonan yang sama (`user_id` = `reviewed_by` = `approved_by`). SPEC §4 membenarkannya (`pas.*`).
    - **Risiko:** satu orang boleh meluluskan pas untuk dirinya tanpa semakan kedua.
    - **Pilihan:** (a) terima — admin dipercayai; (b) tolak dalam `approve()` jika `user_id` atau `reviewed_by` = pelulus (⭐ Lab 8.1) — perlu kemas kini SPEC dahulu.
    - **Keputusan pemilik sistem:** _(isi selepas perbincangan)_
    ```

11. **Demo kepada rakan sebelah** (3 minit): langkah 4–8 sahaja. Rakan sebelah mengisi lajur *Hasil* baris 11–13 pada salinan mereka.

12. **Commit & gabung:**

    ```bash
    git add docs/demo-m2.md && git commit -m "DOCS: demo M2 peranan admin + dapatan pemisahan tugas"
    git switch main && git merge --no-ff docs/demo-m2 -m "DOCS: demo M2 peranan admin" && git push
    git branch -d docs/demo-m2
    ```

### ✅ Checkpoint 8.4b
- [ ] Langkah 7: `pelulus` melihat *Peralihan status "Diluluskan" → "Diluluskan" tidak dibenarkan.* dan `status_logs` F ada satu baris `under_review → approved` sahaja (Kuiz S8).
- [ ] Langkah 8–9: garis masa F 3 entri, semuanya oleh nama admin; `user_id`, `reviewed_by` dan `approved_by` F sama (Kuiz S8).
- [ ] `docs/demo-m2.md` di `main` dengan dapatan pemisahan tugas; `git log --oneline -3` menunjukkan merge `docs/demo-m2` (Kuiz S8).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Langkah 7: *The action you requested is not allowed.* | `pelulus` menghantar POST lain dalam sesi yang sama selepas langkah 5 — token CSRF halaman sudah ditukar | Ulang langkah 2–7 dengan permohonan baharu; jangan buat POST lain dalam tetingkap `pelulus` antara langkah 5 dan 7 |
| Langkah 5: tiada borang **Lulus** | F belum `under_review` (langkah 4 belum dibuat) atau halaman dibuka sebelum langkah 4 | Muat semula F selepas langkah 4 |
| `admin` ditolak di `/pas/permohonan/new` | `$matrix['admin']` tiada `pas.*` | Salin baris admin tepat dari SPEC §4 |
| Tiada checkbox untuk F di `/pas/semakan` | Admin tiada `pas.review`, atau F bukan `submitted` | Semak `$matrix`; tapis `?status=submitted` |

### ⭐ Cabaran tambahan
Rakam babak 12 (dua pelulus serentak) sebagai GIF pendek untuk demo capstone Hari 10 — ia bukti BR-PAS-01 yang paling mudah difahami pemilik sistem.

---

## Semakan kendiri — akhir hari

```bash
git log --oneline -8
php spark routes | grep pas/              # 11 laluan Pas; semakan dengan permission:
composer test -- --testdox | tail -20   # semua hijau
```

- [ ] Satu permohonan bergerak `submitted → under_review → approved` dengan 3 baris `status_logs` (Kuiz S1).
- [ ] Penyemak tidak boleh meluluskan melalui DevTools/curl; `pelulus` tidak boleh memulakan semakan pukal — kedua-duanya redirect, status kekal (Kuiz S6).
- [ ] `composer test -- tests/feature/Pas` hijau, termasuk `PassAccessTest` dan `PassBatchReviewTest` (Kuiz S7).
- [ ] `main` mengandungi M2 dan `docs/demo-m2.md`; `git status --short` kosong (Kuiz S8).

Peserta yang ketinggalan: gunakan `templates/kod/` (modul **Templat & Rujukan**) mengikut pelan kejar dalam nota penceramah — tetapi **Lab 8.2 langkah 1 (serangan DevTools)** wajib dibuat sendiri: itu pelajaran utama hari ini.
