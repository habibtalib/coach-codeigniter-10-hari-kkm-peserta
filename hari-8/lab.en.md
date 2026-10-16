# Day 8 Lab — Pass Module (2): Approval Flow, RBAC & Access Tests

[📅 Schedule](../JADUAL.md) · [📘 SPEC canon](../docs/spesifikasi-sistem.md) · [📖 Day 8 Notes](./README.md)

> Work **in pairs** (swap driver/navigator every session). Run every command from the **CI4 project root**. Trainer reference: `templates/kod/` (**Templat & Rujukan** module) — copy from it **only** once you can explain every line (KOLABORASI §3).

| Lab | Session | Time | Output |
|-----|---------|------|--------|
| 8.0 | Early S1 | 10 min | Branch + demo data + 3 role accounts confirmed |
| 8.1 | S1 | 09:10–10:30 | Transition service + `ReviewController` + queue + action panel |
| 8.2 | S2 | 10:45–12:30 | `AuthGroups`, `permission:` filter, `authorize()`, 403 |
| 8.3 | S3 | 14:30–16:00 | `status_logs` timeline + green `PassAccessTest` |
| 8.4 | S4 | 16:00–17:00 | 3-role demo, DoD, merge into `main` · ⭐ `pas:expire` |

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

1. **Add the Day 8 methods to `app/Services/PassWorkflowService.php`** from `PassWorkflowService.php.txt` (**Templat & Rujukan** module):
   - the constant `REMARKS_MIN = 10`
   - `startReview()`, `approve()`, `reject()`, `history()`
   - `transition()` (private)
   - `use CodeIgniter\I18n\Time; use DomainException;`

   **For this lab, do NOT copy the `$this->authorize(...)` lines** in the three public methods (or comment them out). We will add them in Lab 8.2 after you have seen for yourself why they are needed.

2. Before you go on, the navigator explains to the driver (out loud, 2 minutes): *"Why is the status read AFTER `FOR UPDATE`, and what happens if `record()` returns `false`?"*

3. **Create `app/Controllers/Pas/ReviewController.php`** from `ReviewController.php.txt` (**Templat & Rujukan** module): `index()`, `review()`, `approve()`, `reject()`, `act()`, `defaultQueue()`.

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

7. **Add the action panel to `app/Views/pas/show.php`** — replace the `/* Hari 8: … */` comment with:

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
   - `pelulus`: `/pas/semakan` → open A → **Lulus** (Approve) with the remarks "Dokumen lengkap."
   - `penyemak`: application B → **Mula Semakan** → **Tolak** (Reject) with the remarks "tak ok" (an error is expected), then "Salinan kad kuasa tidak jelas." (success is expected).
   - `pelulus`: go back to the **old** tab for A (before it was reloaded) and click **Lulus** again.

9. Check the DB:

   ```sql
   SELECT id, ref_no, status, reviewed_by, reviewed_at, approved_by, approved_at FROM pass_applications ORDER BY id;
   SELECT record_id, from_status, to_status, actor_id, remarks, created_at FROM status_logs WHERE module = 'PAS' ORDER BY id;
   ```

### ✅ Checkpoint 8.1
- [ ] Application A: `approved`, `reviewed_by` = the reviewer's id, `approved_by` = the approver's id, both timestamps filled in.
- [ ] `status_logs` for A: 3 rows (`NULL→submitted`, `submitted→under_review`, `under_review→approved`).
- [ ] Rejecting with "tak ok" → the message "Catatan penolakan mestilah sekurang-kurangnya 10 aksara." and B's status stays `under_review`.
- [ ] Clicking **Lulus** a second time → "Peralihan status "Diluluskan" → "Diluluskan" tidak dibenarkan." and **no** extra log row.
- [ ] `pemohon1` opens `/pas/semakan` → refused (redirect with a message).
- [ ] Commit: `git add app/ && git commit -m "PAS: aliran semak/lulus/tolak melalui PassWorkflowService"`

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `The action you requested is not allowed.` | A form with no CSRF token (a plain HTML `<form>`) | Use `form_open()` — it adds `csrf_field()` automatically |
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

2. **Check `app/Config/AuthGroups.php`** against SPEC §4 and `AuthGroups.php.txt` (**Templat & Rujukan** module): 4 groups, 8 permissions, an exact `$matrix`. `$defaultGroup = 'applicant'`.

3. **Add a `permission:` filter per route** in `app/Config/Routes.php` (compare with `Routes-pas.php.txt` (**Templat & Rujukan** module)):

   ```php
   // pas/permohonan
   $routes->get('new', 'ApplicationController::new', ['as' => 'pas.new', 'filter' => 'permission:pas.apply']);
   $routes->post('/', 'ApplicationController::create', ['as' => 'pas.create', 'filter' => 'permission:pas.apply']);

   // pas/semakan
   $routes->post('(:num)/review', 'ReviewController::review/$1', ['as' => 'pas.review', 'filter' => 'permission:pas.review']);
   $routes->post('(:num)/approve', 'ReviewController::approve/$1', ['as' => 'pas.approve', 'filter' => 'permission:pas.approve']);
   $routes->post('(:num)/reject', 'ReviewController::reject/$1', ['as' => 'pas.reject', 'filter' => 'permission:pas.review,pas.approve']);
   ```

4. **Confirm the combined filters:**

   ```bash
   php spark routes | grep pas/      # PowerShell: php spark routes | Select-String "pas/"
   ```

   The *Before Filters* column for `pas/semakan/([0-9]+)/approve` must contain **both** `group:reviewer,approver,admin` and `permission:pas.approve` (CI 4.5.4+ combines group & route filters). `csrf` is listed too because it is a global filter.

5. **Add `authorize()` to the Service** — uncomment/copy the `$this->authorize(...)` lines in `startReview()`, `approve()`, `reject()` and the private `authorize()` method. Add `use CodeIgniter\Shield\Exceptions\PermissionException;`.

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
- [ ] `php spark routes` shows the combined filters on all three review POST routes.
- [ ] UT-PAS-20 (after) — the reviewer cannot approve through DevTools/curl; the status is unchanged.
- [ ] Step 8 — without the route filter, the Service returns **403**; the filter has been restored.
- [ ] UT-PAS-21 to 26 pass.
- [ ] Every member can explain: *route filter vs `authorize()` vs `canView()` — what each one protects*.
- [ ] Commit: `git add app/ docs/ && git commit -m "PAS: RBAC Shield — permission per tindakan + authorize() dalam Service"`

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

1. **Create `app/Views/partials/status_timeline.php`** from `status-timeline-view.php.txt` (**Templat & Rujukan** module).

2. **Show it in `app/Views/pas/show.php`** — after the action panel, before the "Kembali" (Back) link:

   ```php
   <?= view('partials/status_timeline', ['history' => $history, 'enum' => \App\Enums\PassStatus::class]) ?>
   ```

3. Open application A (approved) and B (rejected). Confirm the timeline: badge, officer name, time, remarks.

4. **Set up the tests:**

   ```bash
   mkdir -p tests/feature/Pas
   ```

   Copy `PassAccessTest.php.txt` (**Templat & Rujukan** module) to `tests/feature/Pas/PassAccessTest.php`. **Read every test** with your partner and mark in the README §3.2 table which matrix cells are covered.

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

7. **Add one test of your own** (pick one): *admin can approve* · *the approver can reject with remarks* · *an applicant cannot download someone else's document* (insert a `pass_documents` row directly through `$this->db->table(...)`).

### ✅ Checkpoint 8.3
- [ ] The timeline shows 3 entries for A, including the approval remarks.
- [ ] `composer test -- tests/feature/Pas` → all green (13 + your test).
- [ ] The mutation table (step 6) is filled in — every mutation makes at least one test fail.
- [ ] Commit: `git add app/ tests/ && git commit -m "PAS: garis masa status_logs + ujian akses peranan"`

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

1. **Rehearse the demo script** (README §4.1) twice — once with each member as presenter. Prepare three browser windows in advance (logged in as `pemohon1`, `penyemak`, `pelulus`) and one terminal.

2. **Demo to the neighbouring pair** (5 minutes). The neighbouring pair holds the **DoD checklist** (README §4.2) and ticks every item proven during the demo. Swap roles.

3. **Merge into `main`:**

   ```bash
   composer test                             # ALL tests (TLK + Pass) green
   git switch main && git pull
   git merge --no-ff feat/pas-kelulusan -m "PAS: M2 siap — aliran kelulusan, RBAC, status_logs, ujian"
   git push
   ```

4. **⭐ Optional — `php spark pas:expire`:**
   1. Copy `ExpirePassesCommand.php.txt` (**Templat & Rujukan** module) to `app/Commands/ExpirePassesCommand.php`.
   2. `php spark list | grep pas` → `pas:expire` is listed under the **Pas** group.
   3. Prepare the data: `UPDATE pass_applications SET valid_until = CURDATE() - INTERVAL 1 DAY WHERE id = <id A>;`
   4. Open `pemohon1`'s list — the badge already shows **Tamat Tempoh** (Expired, from `displayStatus()`), even though the DB still says `approved`.
   5. `php spark pas:expire --dry-run` → a list of IDs, no changes.
   6. `php spark pas:expire` → `✔ PAS-2026-000N → Tamat Tempoh`; check that `status_logs` has `approved → expired`.
   7. Run it again → "Tiada pas untuk ditamatkan" (no passes to expire).

### ✅ Checkpoint 8.4
- [ ] The 5-minute demo passes every DoD item (signed off by the neighbouring pair).
- [ ] `main` contains M1 + M2; `composer test` is green on `main`.
- [ ] ⭐ `pas:expire` changes expired passes, with a log.

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

## Self-check — end of day

```bash
git log --oneline -6
php spark routes | grep pas/              # 9 Pass routes; review routes with permission:
composer test -- --testdox | tail -20   # all green
```

Pairs who fall behind: use `templates/kod/` (**Templat & Rujukan** module) following the catch-up plan in the trainer notes — but **Lab 8.2 step 1 (the DevTools attack)** must be done yourselves: it is the main lesson of the day.
