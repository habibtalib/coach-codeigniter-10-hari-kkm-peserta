# Day 8 Lab — Pass Module (2): Approval Flow, RBAC & Access Tests

[📅 Schedule](../JADUAL.md) · [📘 SPEC canon](../docs/spesifikasi-sistem.md) · [📖 Day 8 Notes](./README.md) · [⚡ spark commands](../docs/arahan-spark.md)

> Work **individually** in `kelas-ci-<nama>`; show your output to the trainer or the person next to you before ticking it off. Run every command from the **CI4 project root**. Every step gives **complete code to copy**. Read every line before you run it — you must be able to explain it (KOLABORASI §3). Stuck: read the full error message, ask the trainer or your neighbour, or use AI to *explain* the error.

| Lab | Session | Time | Output |
|-----|---------|------|--------|
| 8.0 | Early S1 | 10 min | Branch + demo data + 3 role accounts confirmed |
| 8.1 | S1 | 09:10–10:00 | Transition service + `ReviewController` + queue + action panel |
| 8.1b | S5 | 10:00–10:30 | Bulk start review from the queue through `startReview()` |
| 8.2 | S2 | 10:45–12:00 | `AuthGroups`, `permission:` filter, `authorize()`, 403 |
| 8.2b | S6 | 12:00–12:30 | `permission:pas.review` on the bulk route + 4-role matrix |
| 8.3 | S3 | 14:30–15:30 | `status_logs` timeline + green `PassAccessTest` |
| 8.3b | S7 | 15:30–16:00 | `PassBatchReviewTest` (5 tests) + 2 mutations |
| 8.4 | S4 | 16:00–16:35 | 3-role demo, DoD, merge into `main` · ⭐ `pas:expire` |
| 8.4b | S8 | 16:35–17:00 | `admin` role demo + separation-of-duties finding (`docs/demo-m2.md`) |

---

## Lab 8.0 — Setup (10 min, early S1)

1. Create a new branch from the Day 7 branch you pushed:

   ```bash
   git switch feat/pas-permohonan && git pull
   git switch -c feat/pas-kelulusan
   ```

2. Confirm the seeded accounts & groups (Day 4):

   ```sql
   SELECT u.id, i.secret AS email, g.`group`
   FROM users u
   JOIN auth_identities i ON i.user_id = u.id AND i.type = 'email_password'
   LEFT JOIN auth_groups_users g ON g.user_id = u.id
   ORDER BY u.id;
   ```

   Expected: `pemohon1`, `pemohon2` → `applicant` · `penyemak` → `reviewer` · `pelulus` → `approver` · `admin` → `admin`. If they are missing: `php spark db:seed UserSeeder`.

3. Make sure there are **at least 3** `submitted` applications (submit them through the Day 7 form as `pemohon1`/`pemohon2` if needed).

**✅ Checkpoint 8.0:** 5 accounts in the right groups; ≥ 3 `submitted` applications; the `feat/pas-kelulusan` branch is active.

---

## Lab 8.1 — Approval Flow (S1)

### 🎯 Objective
Implement `startReview()`, `approve()` and `reject()` through one locked `transition()` that enforces BR-PAS-01, BR-PAS-03 and BR-PAS-05, plus a thin `ReviewController`.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- Lab 8.0 is done. The Day 7 `PassWorkflowService` (`canView`, `submit`, `documentPath`) works.

### Steps

1. **Add the Day 8 methods to `app/Services/PassWorkflowService.php`** (the Day 7 version of the file) — four pastes (a)–(d) below:
   - the constant `REMARKS_MIN = 10`
   - `startReview()`, `approve()`, `reject()`, `history()`
   - `transition()` (private)
   - `use CodeIgniter\I18n\Time; use DomainException;`

   **(a)** Add these two `use` lines with the other `use` lines at the top of the file (after `namespace App\Services;`):

   ```php
   use CodeIgniter\I18n\Time;
   use DomainException;
   ```

   **(b)** Add this constant directly below the line `public const ALLOWED_EXT   = ['pdf', 'jpg', 'png'];`:

   ```php
       public const REMARKS_MIN   = 10;               // BR-PAS-03
   ```

   **(c)** Paste these public methods **after** the `documentPath()` method and **before** the `// Dalaman` comment block:

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

   **(d)** Paste the private `transition()` method in the `// Dalaman` section, **before** the docblock of the `assertDates()` method:

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

   **For this lab, do NOT activate the `$this->authorize(...)` lines** in the three public methods — in code (c) they are deliberately commented out (`// $this->authorize(...)`). We will activate them in Lab 8.2 after you have seen for yourself why they are needed.

2. Before you go on, explain to the trainer or the person next to you (out loud, 2 minutes): *"Why is the status read AFTER `FOR UPDATE`, and what happens if `record()` returns `false`?"*

3. **Create `app/Controllers/Pas/ReviewController.php`**: `index()`, `review()`, `approve()`, `reject()`, `act()`, `defaultQueue()`.

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

4. **Add the routes** in `app/Config/Routes.php` — for now with the **group** filter only:

   ```php
   $routes->group('pas/semakan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'group:reviewer,approver,admin'], static function ($routes): void {
       $routes->get('/', 'ReviewController::index', ['as' => 'pas.semakan']);
       $routes->post('(:num)/review', 'ReviewController::review/$1', ['as' => 'pas.review']);
       $routes->post('(:num)/approve', 'ReviewController::approve/$1', ['as' => 'pas.approve']);
       $routes->post('(:num)/reject', 'ReviewController::reject/$1', ['as' => 'pas.reject']);
   });
   ```

5. **Create `app/Views/pas/semakan/index.php`**:

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

6. **Update `ApplicationController::show()`** so that it passes `history` and `actions` (see the template `ApplicationController-upload.php.txt` (**Templat & Rujukan** module)):

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

7. **Add the action panel to `app/Views/pas/show.php`** — replace the line `<?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>` with:

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
                   <?php /* novalidate: BR-PAS-03 is enforced on the SERVER — we want to be able to test it */ ?>
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

8. **Test the flow** with three browser windows (normal · incognito · another browser):
   - `penyemak`: `/pas/semakan` → open application A → **Mula Semakan** (Start Review).
   - `pelulus` (another browser — a second session): also log in as `pelulus`, open A. Do **not** click.
   - `pelulus` (incognito): `/pas/semakan` → open A → **Lulus** (Approve) with the remarks "Dokumen lengkap."
   - `penyemak`: application B → **Mula Semakan** → **Tolak** (Reject) with the remarks "tak ok" (an error is expected), then "Salinan kad kuasa tidak jelas." (success is expected).
   - `pelulus` (another browser): without reloading page A, click **Lulus**. A second session is needed because the CSRF token is replaced after every POST — an old tab in the **same** session is refused with *The action you requested is not allowed.* before it reaches `transition()`.

9. Check the DB:

   ```sql
   SELECT id, ref_no, status, reviewed_by, reviewed_at, approved_by, approved_at FROM pass_applications ORDER BY id;
   SELECT record_id, from_status, to_status, actor_id, remarks, created_at FROM status_logs WHERE module = 'PAS' ORDER BY id;
   ```

### ✅ Checkpoint 8.1
- [ ] Application A: `approved`, `reviewed_by` = the reviewer's id, `approved_by` = the approver's id, both timestamps filled in (Quiz S1).
- [ ] `status_logs` for A: 3 rows (`NULL→submitted`, `submitted→under_review`, `under_review→approved`) (Quiz S1).
- [ ] Rejecting with "tak ok" → the message "Catatan penolakan mestilah sekurang-kurangnya 10 aksara." and B's status stays `under_review` (Quiz S1).
- [ ] Clicking **Lulus** in the second `pelulus` session → "Peralihan status "Diluluskan" → "Diluluskan" tidak dibenarkan." and **no** extra log row (Quiz S1).
- [ ] `pemohon1` opens `/pas/semakan` → refused (redirect with a message) (Quiz S1).
- [ ] Commit: `git add app/ && git commit -m "PAS: aliran semak/lulus/tolak melalui PassWorkflowService"` (Quiz S1)

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `The action you requested is not allowed.` | A form with no CSRF token (a plain HTML `<form>`) | Use `form_open()` — it adds `csrf_field()` automatically |
| `The action you requested is not allowed.` when clicking **Lulus** in an old tab | The CSRF token is replaced after every POST (`Config\Security::$regenerate = true`); an old tab in the same session carries the old token | Test the second click from **another session** (another browser), as in step 8 |
| `Call to a member function can() on null` | A route with no login filter → `auth()->user()` is null | Check that the `pas/semakan` group has the `group:` filter (it also forces login) |
| `ValueError: "" is not a valid backing value for enum` | `PassStatus::from()` on an empty `$row['status']` — broken/test data | Check the data; `from()` fails loudly on purpose for invalid DB data |
| `Undefined variable $actions` / `$history` in the view | `show()` has not been updated (step 6) | Pass both from the controller |
| The status changes but there is **no** `status_logs` row | `record()` is called outside `transition()`, or its `false` return is ignored | Every transition goes through `transition()`; check `if (! ...record(...)) throw` |
| The second approval **succeeds** (two "approved" rows) | `canTransitionTo()` is checked on the old entity, not on the locked row | Read the status from `SELECT … FOR UPDATE` inside the transaction |
| `Lock wait timeout exceeded` | Another transaction was not closed (forgot `transRollback()` in `catch`, or a `mysql` window left with `BEGIN`) | Add `transRollback()`; `COMMIT;` in the `mysql` window |

### ⭐ Bonus challenge
- **Separation of duties:** in `approve()`, refuse if `reviewed_by === $actor->id` ("Pegawai yang menyemak tidak boleh meluluskan permohonan yang sama" — the officer who reviewed cannot approve the same application). The case: an admin who has `pas.*`.
- In `startReview()`, refuse if the officer is the **applicant** of that application.
- Add a "waiting for N days" count to the queue, with a red badge if > 3 days.

---

## Lab 8.2 — Role-Based Access Control (S2)

### 🎯 Objective
Configure `AuthGroups` exactly as in SPEC §4, add a `permission:` filter per action, `authorize()` in the Service and a 403 response — and prove every layer with a manual attack.

### Prerequisites
- Lab 8.1 is done (without `authorize()`).

### Steps

1. **Attack your own application (5 min).** Log in as `penyemak`. Open an application with status `under_review` — there is no *Lulus* (Approve) button, only *Tolak* (Reject). Open DevTools → Elements → find `<form action=".../reject"` → change `reject` to `approve` → click **Tolak** (with remarks ≥ 10 characters).
   Check the DB: who is `approved_by`? Record this result in `docs/ujian-manual-pas.md` as **UT-PAS-20 (before the fix)**.

   A `curl` alternative (copy the `ci_session` session cookie and the CSRF token from DevTools):

   ```bash
   curl -i -X POST http://localhost:8080/pas/semakan/5/approve -b "ci_session=<nilai>" -d "csrf_test_name=<token>&remarks=serangan"
   ```

2. **Check `app/Config/AuthGroups.php`** against SPEC §4: 4 groups, 8 permissions, an exact `$matrix`. `$defaultGroup = 'applicant'`. If anything differs, replace the whole content of the file with the version below:

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

3. **Add a `permission:` filter per route** — in `app/Config/Routes.php`, replace both the `pas/permohonan` group (Lab 7.2) and the `pas/semakan` group (Lab 8.1 step 4) with the code below. Only the `new`, `create`, `review`, `approve` and `reject` routes get a new filter. The **second** `pas/semakan` group for the bulk route (Lab 8.1b) stays — Lab 8.2b updates it:

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

4. **Confirm the combined filters:**

   ```bash
   php spark routes | grep pas/      # PowerShell: php spark routes | Select-String "pas/"
   ```

   The *Before Filters* column for `pas/semakan/([0-9]+)/approve` must contain **both** `group:reviewer,approver,admin` and `permission:pas.approve` (CI 4.5.4+ combines group & route filters). `csrf` is listed too because it is a global filter.

5. **Add `authorize()` to the Service** (`app/Services/PassWorkflowService.php`):
   - In `startReview()`, `approve()` and `reject()`, remove the `// ` in front of the `$this->authorize(...)` line so that it runs.
   - Add `use CodeIgniter\Shield\Exceptions\PermissionException;` with the other `use` lines at the top of the file.
   - Paste the private `authorize()` method below into the `// Dalaman` section, directly after `transition()`:

   ```php
       /** Lapisan kedua selepas filter laluan (defence in depth) */
       private function authorize(User $actor, string ...$permissions): void
       {
           if (! $actor->can(...$permissions)) {
               throw new PermissionException('Anda tidak mempunyai kebenaran untuk tindakan ini.');
           }
       }
   ```

6. **Create `app/Views/errors/forbidden.php`** (shown by `ReviewController::act()` for 403):

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

7. **Repeat the attack from step 1** on another `under_review` application. This time the expected result is: a redirect to `/` with a Shield error message, and the status does **not** change. Record it as **UT-PAS-20 (after the fix)**.

8. **Prove that Layer 2 stands on its own:** temporarily remove `'filter' => 'permission:pas.approve'` from the `/approve` route and repeat the attack → expect **403 — Akses Ditolak** (from `authorize()`). **Restore the filter** afterwards.

9. **Run the manual access matrix** — fill it in in `docs/ujian-manual-pas.md`:

   | ID | User | Action | Expected |
   |----|------|--------|----------|
   | UT-PAS-21 | `pemohon1` | GET `/pas/semakan` | Refused (redirect + message) |
   | UT-PAS-22 | `pemohon1` | POST `/pas/semakan/{id}/review` (curl/DevTools) | Refused, status unchanged |
   | UT-PAS-23 | `penyemak` | GET `/pas/permohonan/new` | Refused (no `pas.apply`) |
   | UT-PAS-24 | `pelulus` | POST `/review` on `submitted` | Refused, status unchanged |
   | UT-PAS-25 | `admin` | Start review → Approve | Succeeds (`pas.*`) |
   | UT-PAS-26 | `pemohon2` | GET `/pas/permohonan/{id pemohon1}` (pemohon1's id) | 404 |

### ✅ Checkpoint 8.2
- [ ] `php spark routes` shows the combined filters on all three review POST routes (Quiz S2).
- [ ] UT-PAS-20 (after) — the reviewer cannot approve through DevTools/curl; the status is unchanged (Quiz S2).
- [ ] Step 8 — without the route filter, the Service returns **403**; the filter has been restored (Quiz S2).
- [ ] UT-PAS-21 to 26 pass (Quiz S2).
- [ ] You can explain: *route filter vs `authorize()` vs `canView()` — what each one protects* (Quiz S2).
- [ ] Commit: `git add app/ docs/ && git commit -m "PAS: RBAC Shield — permission per tindakan + authorize() dalam Service"` (Quiz S2)

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Every officer is refused after adding the filter | A typo in `AuthGroups` (`pas.aprove`) or the user is not in the group | Check `$matrix`; `SELECT * FROM auth_groups_users;` |
| `php spark routes` shows `permission:` but **no** `group:` on the POST routes | CI < 4.5.4 — the route filter **replaces** the group filter (they are not combined) | Upgrade to CI 4.6+ (SPEC); or list both filters in the route array `['filter' => ['group:…', 'permission:…']]` |
| `Filter "permission" not found` / `"group" not found` | Shield is not registered (the Shield Registrar is not loaded) | `composer show codeigniter4/shield`; run `php spark shield:setup` again (Day 4) |
| The refusal message is in English ("You do not have the necessary permission…") | Shield has no `ms` language pack | Accept it for now, or do the ⭐ challenge below |
| Admin is refused on `/approve` | `$matrix['admin']` has no `pas.*` | Copy the admin row exactly from SPEC §4 |
| Redirect loop to `/` | `permission_denied` points to a route that also needs a permission | Set `Config\Auth::$redirects['permission_denied']` to a public/`session`-only route |
| `Class "App\Controllers\Pas\PermissionException" not found` | Forgot `use CodeIgniter\Shield\Exceptions\PermissionException;` | Add the `use` in the Service **and** in `ReviewController` |

### ⭐ Bonus challenge
- Translate the Shield messages: create `app/Language/ms/Auth.php` with `'notEnoughPrivilege' => 'Anda tidak mempunyai kebenaran untuk tindakan ini.'`, set `app.defaultLocale = 'ms'` and test again.
- Point `Config\Auth::$redirects['permission_denied']` and `['group_denied']` to a `/akses-ditolak` route that shows `errors/forbidden` with status **403**.
- Log every `PermissionException` refusal to `writable/logs` with `log_message('warning', …)` (user ID, route, time) — audit evidence of access attempts.

---

## Lab 8.3 — Status Timeline & Feature Tests (S3)

### 🎯 Objective
Show the `status_logs` history on the details page, and write a `PassAccessTest` that tests positive & negative access for every role (≥ 13 green tests).

### Prerequisites
- Lab 8.2 is done. The MySQL test database (`kkm_latihan_test`) has been configured since Day 6 ([note 10](../docs/nota-10-ujian-phpunit-ci4.md) §3).

### Steps

1. **Create `app/Views/partials/status_timeline.php`**:

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

2. **Show it in `app/Views/pas/show.php`** — after the action panel, before the "Kembali" (Back) link:

   ```php
   <?= view('partials/status_timeline', ['history' => $history, 'enum' => \App\Enums\PassStatus::class]) ?>
   ```

3. Open application A (approved) and B (rejected). Confirm the timeline: badge, officer name, time, remarks.

4. **Set up the tests:**

   ```bash
   mkdir -p tests/feature/Pas
   ```

   Create `tests/feature/Pas/PassAccessTest.php` with the content below. **Read every test** one by one and mark in the README §3.2 table which matrix cells are covered.

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

5. **Run:**

   ```bash
   composer test -- tests/feature/Pas/PassAccessTest.php --testdox
   ```

   Expected (13 tests):

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

6. **Prove the tests really test something (manual mutation testing).** One at a time, make each change below, run the tests, note which tests **fail**, then **revert** the change:

   | Mutation | Tests that should fail |
   |----------|------------------------|
   | Remove `'filter' => 'permission:pas.approve'` from the `/approve` route **and** comment out `authorize()` in `approve()` | `testPenyemakTidakBolehLuluskan`, `testServiceMenyekatPenyemakWalaupunFilterTerlepas` |
   | In `canView()`, return `true` | `testPemohonLainMendapat404BagiPermohonanOrangLain` |
   | In `PassStatus::allowedTransitions()`, add `self::Approved` for `Submitted` | `testServiceMenolakPeralihanTidakSah` |
   | In `reject()`, change `REMARKS_MIN` to `3` and remove `min_length[10]` from the controller | `testTolakTanpaCatatanYangCukupTidakMengubahStatus` |

7. **Add one test of your own** (pick one): *admin can approve* · *the approver can reject with remarks* · *an applicant cannot download someone else's document* (insert a `pass_documents` row directly through `$this->db->table(...)`). Paste the method you choose into `PassAccessTest`, **before** the `// Pembantu` comment block. All three options (each one complete and independent):

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
- [ ] The timeline shows 3 entries for A, including the approval remarks (Quiz S3).
- [ ] `composer test -- tests/feature/Pas` → all green (13 + your test) (Quiz S3).
- [ ] The mutation table (step 6) is filled in — every mutation makes at least one test fail (Quiz S3).
- [ ] Commit: `git add app/ tests/ && git commit -m "PAS: garis masa status_logs + ujian akses peranan"` (Quiz S3)

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `SecurityException: The action you requested is not allowed.` in a POST test | CSRF is on — `FeatureTestTrait` does not bypass it | The template's `setUp()` block removes `csrf` from `$globals['before']`; make sure `tearDown()` restores it |
| `Table 'kkm_latihan_test.users' doesn't exist` | The default `$namespace` only runs the `App` migrations | `protected $namespace = null;` |
| Tests pass when run alone but fail (wrong redirect/403) in a full `composer test` run | The `actingAs()` user from another test class "leaks" through Shield's shared `auth` service | `$this->resetServices();` **before** `parent::setUp()` (see the template's `setUp()`) |
| `near "FOR": syntax error` | Still using SQLite `:memory:` | `.env`: `database.tests.DBDriver = MySQLi`, `database.tests.database = kkm_latihan_test`, empty `DBPrefix` |
| `Unknown database 'kkm_latihan_test'` | The test DB has not been created | `CREATE DATABASE kkm_latihan_test CHARACTER SET utf8mb4;` |
| `Call to a member function assertSee() on null` | Chaining `->assertOK()->assertSee()` — the `assert*` methods return `void` | Store `$result = $this->…->get(...)`, then `$result->assertOK(); $result->assertSee(...);` |
| The 404 test fails: *Failed asserting that exception of type PageNotFoundException is thrown* | `canView()` allows it, **or** `expectException()` is placed **after** `get()` | Put `expectException()` before the request; check `canView()` |
| `testPelulusBolehLuluskan` fails on `assertRedirectTo` | `indexPage`/`baseURL` differ in the test `.env` | Compare `$result->getRedirectUrl()`; make sure `app.baseURL` is the same; or use `assertRedirect()` + a DB check |
| `Call to undefined method Config\Services::passWorkflowService()` | The service is not registered yet (Day 7) | Lab 7.2 step 3 |

### ⭐ Bonus challenge
- Turn the negative tests into a single `@dataProvider`: `[peranan, laluan, status awal]` (role, route, starting status) → always "refused & status unchanged".
- A `tests/unit/Enums/PassStatusTest.php` unit test for all 25 `canTransitionTo()` pairs (if you did not do it on Day 7).
- Reuse the timeline partial for TLK (`BookingStatus::class`) on the booking details page (TLK = Special Vehicle Parking, *Tempat Letak Kenderaan Khas*).

---

## Lab 8.4 — 3-Role Demo & M2 Done (S4)

### 🎯 Objective
Demo the Pass flow end to end with 3 roles in 5 minutes, confirm the DoD, and merge M2 into `main`.

### Prerequisites
- Labs 8.1–8.3 are done; all tests are green.

### Steps

1. **Rehearse the demo script** (README §4.1) twice before the demo. Prepare three browser windows in advance (logged in as `pemohon1`, `penyemak`, `pelulus`) and one terminal.

2. **Demo to the person next to you** (5 minutes). Your neighbour holds the **DoD checklist** (README §4.2) and ticks every item proven during the demo. Swap roles.

3. **Merge into `main`:**

   ```bash
   composer test                             # ALL tests (TLK + Pass) green
   git switch main && git pull
   git merge --no-ff feat/pas-kelulusan -m "PAS: M2 siap — aliran kelulusan, RBAC, status_logs, ujian"
   git push
   ```

4. **⭐ Optional — `php spark pas:expire`:**
   1. Create `app/Commands/ExpirePassesCommand.php`:

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

      This command calls `expirableIds()` and `expire()` — paste both into `app/Services/PassWorkflowService.php`, directly after the `reject()` method:

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
   2. `php spark list | grep pas` → `pas:expire` is listed under the **Pas** group.
   3. Prepare the data: `UPDATE pass_applications SET valid_until = CURDATE() - INTERVAL 1 DAY WHERE id = <id A>;`
   4. Open `pemohon1`'s list — the badge already shows **Tamat Tempoh** (Expired, from `displayStatus()`), even though the DB still says `approved`.
   5. `php spark pas:expire --dry-run` → a list of IDs, no changes.
   6. `php spark pas:expire` → `✔ PAS-2026-000N → Tamat Tempoh`; check that `status_logs` has `approved → expired`.
   7. Run it again → "Tiada pas untuk ditamatkan" (no passes to expire).

### ✅ Checkpoint 8.4
- [ ] The 5-minute demo passes every DoD item (signed off by the person next to you) (Quiz S4).
- [ ] `main` contains M1 + M2; `composer test` is green on `main` (Quiz S4).
- [ ] ⭐ `pas:expire` changes expired passes, with a log (Quiz S4).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Merge conflict in `app/Config/Routes.php` | TLK and Pass add routes in the same place | Keep **both** groups; run `php spark routes` after resolving |
| `pas:expire` is not listed | Wrong namespace/folder | `app/Commands/`, `namespace App\Commands;`, the class `extends BaseCommand` |
| `Tiada actor sah` | No user in the `admin` group | `php spark pas:expire --actor <id admin>` or run `UserSeeder` |
| `pas:expire` does not find passes that expired yesterday (00:00–08:00) | `app.appTimezone` is still `UTC` | `.env`: `app.appTimezone = 'Asia/Kuala_Lumpur'` |

### ⭐ Bonus challenge
- Write tests for `PassWorkflowService::expire()` and `expirableIds()` (an `approved` pass ending yesterday → included; a `rejected` one ending yesterday → not included).
- Add a `--before=2026-12-31` option to simulate the reference date.

---

## Lab 8.1b — Bulk Start Review from the Queue (S5)

### 🎯 Objective
Reuse `startReview()` and `transition()` (Lab 8.1) for a new feature: the reviewer ticks several **Dihantar** (Submitted) applications in `/pas/semakan` and starts the review of all of them at once. Each application goes through its own transaction and its own `status_logs` row; one BR-PAS-01 failure does not stop the others.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- [Lab 8.1](#lab-81--approval-flow-s1) done. The `$this->authorize(...)` lines are still commented out — same as Lab 8.1; Lab 8.2 turns them on.
- The Lab 8.1 browser windows (`penyemak`, `pelulus`). Step 6 needs one **other session** that has `pas.review`: `admin@latihan.test` in another browser.

### Steps

1. **Prepare data.** Log in as `pemohon2` and submit **3** new applications through the Day 7 form (`/pas/permohonan/new`, staff pass, one small PDF each). We call them C, D and E. Check:

   ```sql
   SELECT id, ref_no, status FROM pass_applications WHERE status = 'submitted' ORDER BY id;
   ```

   Expected: at least 3 rows. Note the ids of C, D and E.

2. **Add the route** in `app/Config/Routes.php`, directly **after** the `pas/semakan` group (Lab 8.1 step 4). It is a **separate** group with the same prefix: Lab 8.2 step 3 replaces only the first group, so this route stays.

   ```php
   // Lab 8.1b — mula semakan pukal. Kumpulan BERASINGAN: Lab 8.2 langkah 3 menggantikan kumpulan di atas, bukan yang ini.
   $routes->group('pas/semakan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'group:reviewer,approver,admin'], static function ($routes): void {
       $routes->post('pukal/review', 'ReviewController::reviewBatch', ['as' => 'pas.review.pukal']);
   });
   ```

3. **Update `app/Controllers/Pas/ReviewController.php`** — three pastes (a)–(c):

   **(a)** Add this `use` line next to the other `use` lines at the top of the file:

   ```php
   use CodeIgniter\Exceptions\PageNotFoundException;
   ```

   **(b)** Replace the whole `index()` method with this version. Only one line is new: `canReview` is passed to the view.

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

   **(c)** Paste the `reviewBatch()` method **after** the `reject()` method and **before** the comment line `// -----------------------------------------------------------------`:

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

   Notice three things: (1) the controller does not touch the status — each ID goes through `startReview()`, so the `FOR UPDATE` lock, BR-PAS-01 and BR-PAS-05 all apply; (2) the `try/catch` inside the loop catches the `DomainException` of **one** application and carries on with the rest; (3) `PermissionException` is caught outside the loop — it will happen once `authorize()` is turned on in Lab 8.2.

4. **Replace the whole `app/Views/pas/semakan/index.php`** with this version. Compared with Lab 8.1: the table is wrapped in `form_open()` (automatic CSRF token), the checkbox column and the button appear only for officers with `pas.review`, and the checkbox appears only on **Dihantar** applications.

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

5. **Verify:**

   ```bash
   php -l app/Controllers/Pas/ReviewController.php
   php spark routes | grep pukal      # PowerShell: php spark routes | Select-String "pukal"
   ```

   The `pas/semakan/pukal/review` row has Before Filters `csrf group:reviewer,approver,admin` only — no `permission:`. Lab 8.2b fixes that.

6. **Concurrency test (two sessions):**
   - `penyemak` (normal window): open `/pas/semakan` → tick C, D and E. Do **not** click the button yet.
   - `admin` (another browser): open E (`/pas/permohonan/<id E>`) → **Mula Semakan** (Start Review).
   - `penyemak`: without reloading the page, click **Mula Semakan (yang ditanda)** (Start review of ticked) → **OK**.

   Note the green and red messages shown. Why `admin` in another browser, not a second `penyemak` tab? The CSRF token is replaced after every POST (`Config\Security::$regenerate = true`), so an old page in the **same** session is refused with *The action you requested is not allowed.* before the controller runs.

7. **Nothing ticked:** click **Mula Semakan (yang ditanda)** without ticking anything. Expected: *Pilih sekurang-kurangnya satu permohonan.* (Select at least one application.)

8. **Check the DB:**

   ```sql
   SELECT id, ref_no, status, reviewed_by FROM pass_applications WHERE id IN (<id C>, <id D>, <id E>);
   SELECT record_id, from_status, to_status, actor_id FROM status_logs WHERE module = 'PAS' AND to_status = 'under_review' ORDER BY id;
   ```

9. In the `pelulus` window, open `/pas/semakan`: no checkboxes and no button. Hiding the button is UX only — Lab 8.2b proves it.

10. **Commit:**

    ```bash
    git add app/ && git commit -m "PAS: mula semakan pukal melalui startReview()"
    ```

### ✅ Checkpoint 8.1b
- [ ] Step 6: C and D are `under_review` with `reviewed_by` = the reviewer's id; E is refused with the BR-PAS-01 message in a red flash (Quiz S5).
- [ ] `status_logs` has exactly **one** `submitted → under_review` row for each of C, D and E — no duplicate log for E (Quiz S5).
- [ ] Nothing ticked → *Pilih sekurang-kurangnya satu permohonan.*; the `pelulus` window shows no checkboxes (Quiz S5).
- [ ] Commit `PAS: mula semakan pukal melalui startReview()` (Quiz S5).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| *The action you requested is not allowed.* after clicking **Mula Semakan (yang ditanda)** | The page was opened before another POST in the same session — the CSRF token has already been replaced | Reload `/pas/semakan` and tick again; for step 6 use another browser (a separate session) |
| `Undefined variable $canReview` | `index()` has not been replaced | Step 3(b) |
| `The route for "pas.review.pukal" cannot be found.` | The step 2 route is missing or its `as` name is wrong | Check `Routes.php`; `php spark routes \| grep pukal` |
| `Class "App\Controllers\Pas\PageNotFoundException" not found` | The step 3(a) `use` line is missing | Add `use CodeIgniter\Exceptions\PageNotFoundException;` |
| A `DomainException` error page (not a red flash) | The `try/catch` inside the loop is missing — the first exception stops everything | Copy `reviewBatch()` from step 3(c) again |
| The bulk route disappears after Lab 8.2 | The separate group was also replaced in Lab 8.2 step 3 | Paste the step 2 block again after the `pas/semakan` group |

### ⭐ Bonus challenge
- Add a **Tick all** checkbox in the table header (a small JavaScript in `section('scripts')`).
- Why is **bulk reject** with one shared remark a bad idea? Relate it to BR-PAS-03 and what the auditor reads in `status_logs`.

---

## Lab 8.2b — Protect the Bulk Route: `permission:` Filter & Role Matrix (S6)

### 🎯 Objective
Close the Lab 8.1b hole: the bulk route only has a `group:` filter, so `pelulus` reaches the controller. Prove that Layer 2 (`authorize()` from Lab 8.2) already refuses with 403, add Layer 1 `permission:pas.review`, and record the 4 roles × bulk route matrix in `docs/ujian-manual-pas.md`.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- [Lab 8.2](#lab-82--role-based-access-control-s2) done: `authorize()` is active in `startReview()`, `approve()` and `reject()`.
- [Lab 8.1b](#lab-81b--bulk-start-review-from-the-queue-s5) done. At least one `submitted` and one `under_review` application (submit another one as `pemohon2` if needed).

### Steps

1. **Measure.** Git Bash converts paths that start with `/`, so put `MSYS_NO_PATHCONV=1` in front:

   ```bash
   MSYS_NO_PATHCONV=1 php spark filter:check POST /pas/semakan/pukal/review
   MSYS_NO_PATHCONV=1 php spark filter:check POST /pas/semakan/1/review
   ```

   Compare the *Before Filters* column: the single route has `permission:pas.review`; the bulk route does not.

2. **Attack as `pelulus`.** Log in as `pelulus`. Open an `under_review` application (`/pas/permohonan/<id>`) — this page has the **Lulus** (Approve) form, so it has a CSRF token. Note the id of a `submitted` application (`/pas/semakan?status=submitted`). Press F12 → **Console** tab, paste the code below, change `<ID>` to that `submitted` id, press Enter:

   ```js
   fetch('/pas/semakan/pukal/review', {
       method: 'POST',
       body: new URLSearchParams({
           csrf_test_name: document.querySelector('input[name="csrf_test_name"]').value,
           'ids[]': '<ID>',
       }),
   }).then((r) => console.log(r.status, r.url));
   ```

   Note what is printed, then check the status of that application:

   ```sql
   SELECT id, status, reviewed_by FROM pass_applications WHERE id = <ID>;
   ```

   `authorize()` in the Service refuses, so nothing changes. But a 403 from the Service means a misconfigured route (README §2.4): Layer 1 should have refused first.

3. **Add the filter.** In `app/Config/Routes.php`, replace the separate Lab 8.1b group with this version (only the `post` line changes):

   ```php
   // Lab 8.1b — mula semakan pukal. Kumpulan BERASINGAN: Lab 8.2 langkah 3 menggantikan kumpulan di atas, bukan yang ini.
   $routes->group('pas/semakan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'group:reviewer,approver,admin'], static function ($routes): void {
       // Lab 8.2b: Lapisan 1 — sama seperti (:num)/review. Tanpanya, approver (ada group, tiada pas.review) sampai ke controller.
       $routes->post('pukal/review', 'ReviewController::reviewBatch', ['as' => 'pas.review.pukal', 'filter' => 'permission:pas.review']);
   });
   ```

4. Repeat the step 1 `filter:check` for the bulk route. *Before Filters* is now `forcehttps pagecache csrf group:reviewer,approver,admin permission:pas.review`.

5. **Repeat the attack.** Reload the `under_review` application page (a new CSRF token — the old one was replaced by the step 2 POST), then run the same Console code. Note what is printed, and check the status again with the step 2 SQL.

6. **Role matrix.** Test each row, then add this table at the end of `docs/ujian-manual-pas.md` and fill in the *Hasil* (Result) column. For `pemohon1`, run the Console code from `/pas/permohonan/new` (that page has a CSRF token). Reload the page before each attempt.

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
- [ ] Step 2 (before the filter): the `pelulus` Console prints `403 …/pas/semakan/pukal/review` and the application stays `submitted` (Quiz S6).
- [ ] `filter:check POST /pas/semakan/pukal/review` shows `group:reviewer,approver,admin permission:pas.review`; step 5 prints `200 http://localhost:8080/` and the status is unchanged (Quiz S6).
- [ ] UT-PAS-27 to 30 pass and are recorded in `docs/ujian-manual-pas.md` (Quiz S6).
- [ ] Commit `PAS: permission:pas.review pada route pukal + UT-PAS-27..30` (Quiz S6).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Chrome refuses to paste: *Warning: Don't paste code…* | Chrome paste protection | Type `allow pasting`, Enter, then paste again |
| `TypeError: Cannot read properties of null (reading 'value')` | The page has no form, so no `csrf_test_name` (e.g. a `submitted` application opened as `pelulus`) | Open an `under_review` application (`pelulus`) or `/pas/permohonan/new` (`pemohon1`) |
| `403` after step 3 as well | Stale token — the page was not reloaded after the previous POST; the `csrf` filter refuses with 403 before the Shield filter | Reload the page before every `fetch` |
| `404 …/pas/semakan/pukal/review` | A different app URL (e.g. `index.php` or a Laragon subfolder) | Use the same URL as the browser; check `app.indexPage` and `app.baseURL` |
| `filter:check`: `Can't find a route: "POST C:/Program Files/Git/pas/…"` | Git Bash converts the path | `MSYS_NO_PATHCONV=1` in front of the command |

### ⭐ Bonus challenge
In `ReviewController::reviewBatch()`, add `log_message('warning', …)` inside `catch (PermissionException $e)` (user ID, the `ids` list, time). Why should this log stay **empty** after step 3?

---

## Lab 8.3b — Feature Tests for the Bulk Action (S7)

### 🎯 Objective
Write `PassBatchReviewTest` (5 tests) for the bulk route — positive, partial failure, nothing ticked, and two negative tests that check the response **and** the DB — then prove with two mutations that the tests catch Lab 8.1b and 8.2b mistakes.

### Prerequisites
- [Lab 8.3](#lab-83--status-timeline--feature-tests-s3) done: `PassAccessTest` is green; the `kkm_latihan_test` test DB works.
- [Lab 8.2b](#lab-82b--protect-the-bulk-route-permission-filter--role-matrix-s6) done: the bulk route has `permission:pas.review`.

### Steps

1. **Create `tests/feature/Pas/PassBatchReviewTest.php`** with the content below. The `setUp()`/`tearDown()` pattern and the helpers are the same as in `PassAccessTest`; what is new is `assertSessionHas()` (flash `message`/`error`) and `logCount()`.

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

2. **Run:**

   ```bash
   composer test -- tests/feature/Pas/PassBatchReviewTest.php --testdox
   ```

   Expected: 5 ✔. Note the last line of the output.

3. **Mutation 1 — remove Layer 1.** In `app/Config/Routes.php`, remove `, 'filter' => 'permission:pas.review'` from the bulk route. Run step 2 again, note the failing test and its message. **Restore.**

4. **Mutation 2 — remove the `try/catch` in the loop.** In `reviewBatch()`, replace the `try { … } catch (DomainException|PageNotFoundException $e) { … }` block inside the `foreach` with the single line `$started[] = $workflow->startReview($id, $user)->ref_no;`. Run step 2 again, note the failing test and its message. **Restore** (copy Lab 8.1b step 3(c) again if unsure).

5. Record both mutations at the end of `docs/ujian-manual-pas.md`:

   ```markdown

   ## Mutasi PassBatchReviewTest (Lab 8.3b)

   | Mutasi | Ujian yang gagal | Mesej |
   |--------|------------------|-------|
   | Buang `permission:pas.review` dari route pukal | | |
   | Buang `try/catch` dalam gelung `reviewBatch()` | | |
   ```

6. **All Pass tests:**

   ```bash
   composer test -- tests/feature/Pas
   ```

   All green, including `PassAccessTest` (13 + your test) and `PassBatchReviewTest` (5).

7. **Commit:**

   ```bash
   git add tests/ docs/ && git commit -m "PAS: ujian fungsian route pukal + jadual mutasi"
   ```

### ✅ Checkpoint 8.3b
- [ ] `PassBatchReviewTest` → `OK (5 tests, 24 assertions)` (Quiz S7).
- [ ] The mutation table is filled in: mutations 1 and 2 each make one test fail; the code is restored and everything is green again (Quiz S7).
- [ ] `composer test -- tests/feature/Pas` is green; commit `PAS: ujian fungsian route pukal + jadual mutasi` (Quiz S7).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Redirect URL '/' does not match 'http://localhost:8080'` | `assertRedirectTo('/')` is compared with the full URL without the trailing `/` | The tests use `assertRedirect()` + `assertSessionHas('error')` for Shield refusals — copy them again |
| `assertSessionHas('message', …)` fails because the text differs | The message in `reviewBatch()` was changed (full stop, `—` dash, `·` separator) | Copy `reviewBatch()` from Lab 8.1b again; the text must match character for character |
| Passes on its own, fails in the full suite | `$this->resetServices()` is missing before `parent::setUp()` | See the template `setUp()` |
| `SecurityException` | CSRF is still active in the test | The `setUp()` block that removes `csrf` + `tearDown()` |

### ⭐ Bonus challenge
Add `testAdminBolehMulakanSemakanPukal` (admin through `pas.*`), and `testIdTidakWujudDilaporkan` — `ids` = `[99999]` → flash `error` `1 gagal — ID 99999: …` (why does that message come from `PageNotFoundException`?).

---

## Lab 8.4b — Fourth-Role Demo: `admin` & Separation-of-Duties Finding (S8)

### 🎯 Objective
Add an `admin` scene to the M2 demo: the admin applies, starts the review in bulk and approves their own application (SPEC §4 allows it through `pas.*`); prove BR-PAS-01 with two approvers at the same time (`admin` and `pelulus`); and record the separation-of-duties finding for the system owner in `docs/demo-m2.md`.

### Prerequisites
- [Lab 8.4](#lab-84--3-role-demo--m2-done-s4) done: `feat/pas-kelulusan` (including Labs 8.1b–8.3b) is merged into `main`.
- The `pelulus` (incognito) and `admin` (another browser) windows are logged in.

### Steps

1. **Branch:**

   ```bash
   git switch main && git pull
   git switch -c docs/demo-m2
   ```

2. **`admin` applies.** `/pas/permohonan/new` → staff pass + one PDF → **Hantar** (Submit). Note the reference number (we call it F) and the id in the URL.

3. **`admin` checks their own list.** `/pas/permohonan` — count how many rows are shown.

4. **`admin` starts the bulk review.** `/pas/semakan` → tick F → **Mula Semakan (yang ditanda)**.

5. **`pelulus` opens F** (`/pas/permohonan/<id F>`). The **Lulus** form is shown. Do **not** click.

6. **`admin` approves F** with the remarks `Diluluskan oleh pentadbir.`

7. **`pelulus`**: without reloading the step 5 page, click **Lulus** → **OK**. Note the message.

8. **`admin` reloads F.** Read the timeline: the number of entries and the name on each entry.

9. **Check the DB:**

   ```sql
   SELECT user_id, reviewed_by, approved_by FROM pass_applications WHERE id = <id F>;
   SELECT from_status, to_status, actor_id FROM status_logs WHERE module = 'PAS' AND record_id = <id F> ORDER BY id;
   ```

10. **Create `docs/demo-m2.md`** and fill in the *Hasil* (Result) column from steps 2–9:

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

11. **Demo to the person next to you** (3 minutes): steps 4–8 only. They fill in the *Hasil* column of rows 11–13 on their copy.

12. **Commit & merge:**

    ```bash
    git add docs/demo-m2.md && git commit -m "DOCS: demo M2 peranan admin + dapatan pemisahan tugas"
    git switch main && git merge --no-ff docs/demo-m2 -m "DOCS: demo M2 peranan admin" && git push
    git branch -d docs/demo-m2
    ```

### ✅ Checkpoint 8.4b
- [ ] Step 7: `pelulus` sees *Peralihan status "Diluluskan" → "Diluluskan" tidak dibenarkan.* and F's `status_logs` has only one `under_review → approved` row (Quiz S8).
- [ ] Steps 8–9: F's timeline has 3 entries, all with the admin's name; F's `user_id`, `reviewed_by` and `approved_by` are the same (Quiz S8).
- [ ] `docs/demo-m2.md` is on `main` with the separation-of-duties finding; `git log --oneline -3` shows the `docs/demo-m2` merge (Quiz S8).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Step 7: *The action you requested is not allowed.* | `pelulus` sent another POST in the same session after step 5 — the page's CSRF token was replaced | Repeat steps 2–7 with a new application; do not send another POST in the `pelulus` window between steps 5 and 7 |
| Step 5: no **Lulus** form | F is not `under_review` yet (step 4 not done) or the page was opened before step 4 | Reload F after step 4 |
| `admin` is refused at `/pas/permohonan/new` | `$matrix['admin']` has no `pas.*` | Copy the admin row exactly from SPEC §4 |
| No checkbox for F in `/pas/semakan` | The admin has no `pas.review`, or F is not `submitted` | Check `$matrix`; filter with `?status=submitted` |

### ⭐ Bonus challenge
Record scene 12 (two approvers at the same time) as a short GIF for the Day 10 capstone demo — it is the BR-PAS-01 proof the system owner understands most easily.

---

## Self-check — end of day

```bash
git log --oneline -8
php spark routes | grep pas/              # 11 Pass routes; review routes with permission:
composer test -- --testdox | tail -20   # all green
```

- [ ] One application moves `submitted → under_review → approved` with 3 `status_logs` rows (Quiz S1).
- [ ] The reviewer cannot approve through DevTools/curl; `pelulus` cannot start a bulk review — both redirect, status unchanged (Quiz S6).
- [ ] `composer test -- tests/feature/Pas` is green, including `PassAccessTest` and `PassBatchReviewTest` (Quiz S7).
- [ ] `main` contains M2 and `docs/demo-m2.md`; `git status --short` is empty (Quiz S8).

Participants who fall behind: use `templates/kod/` (**Templat & Rujukan** module) following the catch-up plan in the trainer notes — but **Lab 8.2 step 1 (the DevTools attack)** must be done yourself: it is the main lesson of the day.
