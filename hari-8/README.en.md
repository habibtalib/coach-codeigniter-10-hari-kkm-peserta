# Day 8 — Pass Module (Part 2): Approval Flow, Shield RBAC & Access Tests

[📅 Schedule](../JADUAL.md) · [📘 SPEC Canon](../docs/spesifikasi-sistem.md) · [🧪 Day 8 Lab](./lab.md)

> **Today the Pass Module becomes complete (M2 done).** Yesterday applicants could submit applications. Today **two officers** take over: the reviewer starts the review, the approver makes the decision — and the system **makes sure** each person can only press the buttons they are entitled to, every change is recorded, and all of this is proven with automated tests.

---

## 🎯 Learning Objectives

By the end of today, participants can:

| # | Objective (measurable) | Session | Evidence |
|---|------------------------|------|-------|
| O1 | **Implement** `PassWorkflowService` (`startReview`, `approve`, `reject`) that enforces BR-PAS-01 through `PassStatus::canTransitionTo()` in a transaction locked with `FOR UPDATE`, sets `reviewed_by/at` & `approved_by/at`, and records `status_logs` | S1 | An application moves `submitted → under_review → approved`; 3 `status_logs` rows |
| O2 | **Enforce** BR-PAS-03: a rejection without a note of ≥ 10 characters is refused in the form **and** in the Service | S1 | Reject with "tak ok" → status does not change |
| O3 | **Configure** `Config\AuthGroups` (groups, permissions, `$matrix`) exactly per SPEC §4 and the `group:` / `permission:` route filters | S2 | `php spark routes` shows the combined filters on `/pas/semakan/(:num)/approve` |
| O4 | **Explain** the difference between *authentication* and *authorization* and **build** three layers of defence: route filter → `authorize()` in the Service → ownership check | S2 | Reviewer POSTs to `/approve` → refused; calling the Service directly → `PermissionException` |
| O5 | **Display** a status history timeline from `status_logs` (who, when, from→to, note) | S3 | The detail page shows 3 badged entries |
| O6 | **Write** positive & negative feature tests for each role (applicant cannot approve, reviewer cannot approve, approver can) and **demo** the full 3-role flow | S3–S4 | `PassAccessTest` ≥ 13 green tests; 5-minute demo passes the DoD |

---

## 📅 Today's Schedule

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 7 recap | — |
| 09:00–10:30 | S1 | Approval flow apply → review → approve/reject | Implement `PassWorkflowService` with `PassStatus::canTransitionTo()` |
| 10:30–10:45 | — | Morning break | — |
| 10:45–12:30 | S2 | Role-based access control | Configure Shield groups/permissions + route filters + ownership check |
| 12:30–14:30 | — | Lunch | — |
| 14:30–16:00 | S3 | Status log/history & functional tests | Display the `status_logs` timeline; positive & negative access tests |
| 16:00–17:00 | S4 | Pass Module wrap-up | Full 3-role flow demo; **M2 done** |

---

## 🧭 Why today matters

A government approval system lives or dies on three audit questions:

1. **Who approved this?** → `approved_by`, `status_logs.actor_id`
2. **Were they entitled to?** → Shield groups/permissions + server-side checks
3. **Can it happen twice, or skip a stage?** → `canTransitionTo()` + locked transaction

If any one of these fails, the audit report will mark the system as **untrustworthy** — even if its interface is beautiful. Today we close all three holes, and build **automated tests** that will shout if someone reopens them six months from now.

```mermaid
flowchart LR
    subgraph L1[Layer 1 — Route]
        F1["session filter"] --> F2["filter group:reviewer,approver,admin"] --> F3["filter permission:pas.approve"]
    end
    subgraph L2[Layer 2 — Service]
        S1["authorize() → can('pas.approve')"] --> S2["canTransitionTo()"] --> S3["transaction + status_logs"]
    end
    subgraph L3[Layer 3 — Data]
        D1["canView(): owner or officer"]
    end
    U((User)) --> L1 --> L2 --> DB[(MySQL)]
    U -. GET details/documents .-> L3
```

---

## S1 — Approval Flow: Apply → Review → Approve/Reject (09:00–10:30)

### 1.1 The state machine becomes code

The SPEC §2.2 diagram, with **who** and which **fields** change on each arrow:

```mermaid
stateDiagram-v2
    [*] --> submitted: submit()<br/>applicant (Day 7)
    submitted --> under_review: startReview()<br/>pas.review · set reviewed_by/at
    under_review --> approved: approve()<br/>pas.approve · set approved_by/at
    under_review --> rejected: reject()<br/>pas.review OR pas.approve · remarks ≥ 10
    approved --> expired: expire()<br/>system (pas:expire)
```

Each public `PassWorkflowService` method is **thin** — it checks permission, then hands over to **one** private method, `transition()`:

```php
public function startReview(int $applicationId, User $actor): PassApplication
{
    $this->authorize($actor, 'pas.review');                       // Layer 2

    return $this->transition($applicationId, PassStatus::UnderReview, (int) $actor->id, null, [
        'reviewed_by' => (int) $actor->id,
        'reviewed_at' => Time::now()->toDateTimeString(),
    ]);
}

public function reject(int $applicationId, User $actor, string $remarks): PassApplication
{
    $this->authorize($actor, 'pas.review', 'pas.approve');        // can() = any one of them (OR)

    $remarks = trim($remarks);
    if (mb_strlen($remarks) < self::REMARKS_MIN) {                // BR-PAS-03
        throw new InvalidArgumentException('Catatan penolakan wajib diisi (sekurang-kurangnya 10 aksara).');
    }

    return $this->transition($applicationId, PassStatus::Rejected, (int) $actor->id, $remarks);
}
```

### 1.2 `transition()` — the only door for status changes

```php
private function transition(int $applicationId, PassStatus $to, int $actorId, ?string $remarks = null, array $extra = []): PassApplication
{
    $this->db->transException(true)->transBegin();   // query error → exception, not a silent `false`
    try {
        // 1. Lock the row (binding ?, not string concatenation; prefixTable() for DBPrefix)
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

        // 2. BR-PAS-01 — read the status AFTER the lock is acquired
        $from = PassStatus::from((string) $row['status']);
        if (! $from->canTransitionTo($to)) {
            throw new DomainException(sprintf('Peralihan status "%s" → "%s" tidak dibenarkan.', $from->label(), $to->label()));
        }

        // 3. Update + 4. BR-PAS-05 log — in the SAME transaction
        if (! $this->applications->update($applicationId, ['status' => $to->value] + $extra)) {
            throw new RuntimeException('Gagal mengemas kini permohonan: ' . implode(' ', $this->applications->errors()));
        }
        if (! $this->statusLogs->record('PAS', $applicationId, $from->value, $to->value, $actorId, $remarks)) {
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

Why **one** method? Because four rules (lock, BR-PAS-01, update, BR-PAS-05) must happen **together every time**. If each public method rewrote these steps, sooner or later someone would forget `record()` in one branch.

### 1.3 Why `FOR UPDATE` for approvals?

Two approvers (or one approver who double-clicks) press **Approve** at the same moment:

```mermaid
sequenceDiagram
    participant A as Approver A
    participant B as Approver B
    participant DB as MySQL
    A->>DB: BEGIN · SELECT … WHERE id=5 FOR UPDATE
    DB-->>A: status = under_review (lock held by A)
    B->>DB: BEGIN · SELECT … WHERE id=5 FOR UPDATE
    Note over B,DB: B WAITS…
    A->>DB: UPDATE status='approved' · INSERT status_logs · COMMIT
    DB-->>B: status = approved (only read after the lock is released)
    B->>B: approved → approved? canTransitionTo() = false
    B-->>B: DomainException → "Peralihan … tidak dibenarkan"
```

Without a lock, both read `under_review`, both pass the check, and `status_logs` has **two** "approved" entries by two different people. The auditor will ask who actually approved it. This is the same pattern as BR-TLK-05 (Day 6).

### 1.4 Thin controller: translate exceptions into HTTP

`ReviewController` knows nothing about statuses or transactions. It only maps the Service result to a response:

| Exception from the Service | Meaning | Response |
|------------------------|-------|---------|
| *(none)* | Success | Redirect to details + flash `message` |
| `DomainException` | BR-PAS-01 — invalid transition (e.g. already approved) | Redirect to details + flash `error` |
| `InvalidArgumentException` | BR-PAS-03 — note too short | Redirect to details + flash `error` |
| `PermissionException` (Shield) | Logged in but not entitled | **403** + view `errors/forbidden` |
| `PageNotFoundException` | ID does not exist | **404** |

```php
private function act(int $id, string $successMessage, callable $action): ResponseInterface
{
    try {
        $action(service('passWorkflowService'), auth()->user());
    } catch (PermissionException $e) {
        return $this->response->setStatusCode(403)->setBody(view('errors/forbidden', ['message' => $e->getMessage()]));
    } catch (DomainException|InvalidArgumentException $e) {
        return redirect()->to(url_to('pas.show', $id))->with('error', $e->getMessage());
    }
    return redirect()->to(url_to('pas.show', $id))->with('message', $successMessage);
}
```

The action forms are placed on the **existing detail page** (`/pas/permohonan/{id}`) — officers are already allowed to view it (BR-PAS-04). There is no duplicate "review details" page.

> ⚠️ **Common mistakes**
> - Checking the status **before** `transBegin()`/`FOR UPDATE` → the race condition comes back.
> - `$model->update($id, ['status' => $request->getPost('status')])` — status from user input! Status comes only from the enum in the Service.
> - Forgetting `transRollback()` in `catch` → the connection stays in an open transaction; the next request in the same process overlaps with it.
> - Setting `approved_at` when **rejecting** → the "average days to approve" statistic (Day 10) gets polluted. A rejection is recorded in `status_logs` only.

### 🎯 Quiz S1

1. A reviewer calls `reject()` with the following note. What is the result?
   ```php
   $workflow->reject($id, $penyemak, '  Tak ok  ');
   ```
   - [x] `InvalidArgumentException` — after `trim()`, `mb_strlen('Tak ok')` = 6 < 10 (BR-PAS-03); the status does not change
   - [ ] The status becomes `rejected` because the note is not empty
   - [ ] `DomainException` because `under_review` cannot go straight to `rejected`; the reviewer must return it to `submitted` first
   - [ ] `PermissionException` because the reviewer does not have `pas.approve`
   > `reject()` allows `pas.review` **or** `pas.approve`, so the reviewer is allowed. But the note is `trim()`med first and must be at least 10 characters before `transition()` is called.

2. Two approvers press **Approve** at the same time on the same `under_review` application. With `SELECT … FOR UPDATE` in `transition()`, what happens?
   - [x] Approver A succeeds; B waits for the lock, then reads `approved` and `canTransitionTo()` refuses with a `DomainException`
   - [ ] Both succeed because `FOR UPDATE` only locks during the SELECT; `status_logs` has two "approved" entries from two approvers
   - [ ] Both fail because of a deadlock
   - [ ] B succeeds because the last request wins
   > The row lock makes sure the status is read **after** the lock is acquired. Without a lock, both read `under_review` and the auditor sees two approvals by two different people.

---

## S2 — Role-Based Access Control (10:45–12:30)

### 2.1 Authentication vs authorization

| | *Authentication* | *Authorization* |
|--|------------------------------|-----------------------------|
| Question | **Who** are you? | **What** are you allowed to do? |
| Proof | Email + password → session | Group, permission, record ownership |
| Shield | `auth()->loggedIn()`, `session` filter | `$user->inGroup()`, `$user->can()`, `group:` / `permission:` filters |
| Failure | Redirect to `/login` | Redirect with a message / 403 / 404 |
| OWASP | A07 Identification & Authentication Failures | **A01 Broken Access Control** (#1) |

### 2.2 The Shield model: group → permission

```php
// app/Config/AuthGroups.php — exactly per SPEC §4
public array $matrix = [
    'applicant' => ['tlk.apply', 'pas.apply'],
    'reviewer'  => ['pas.review', 'laporan.view'],
    'approver'  => ['tlk.decide', 'pas.approve', 'laporan.view', 'statistik.view'],
    'admin'     => ['admin.*', 'tlk.*', 'pas.*', 'laporan.*', 'statistik.*'],
];
```

- **Group** = a human role (`reviewer`). Stored per user in the `auth_groups_users` table (by `UserSeeder`).
- **Permission** = a capability (`pas.approve`). Declared in `$permissions`, mapped in `$matrix` — **configuration**, not DB. No migration is needed when the matrix changes.
- **Code checks permissions, not groups.** `can('pas.approve')` and not `inGroup('approver')`. If tomorrow the system owner wants the Deputy Director (group `admin`) to approve as well — it already works through `pas.*` without changing a single line of code.
- **The deliberate exception:** BR-PAS-04 ("`reviewer`/`approver`/`admin` see everything") is stated by the SPEC in terms of **groups**, so `canView()` uses `inGroup()`.

| Role | `/pas/permohonan` (own) | Apply | See all | `/pas/semakan` | Start review | Approve | Reject |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `applicant` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `reviewer` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `approver` | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.3 Route filters — Layer 1

```php
$routes->group('pas/semakan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'group:reviewer,approver,admin'], static function ($routes): void {
    $routes->get('/', 'ReviewController::index', ['as' => 'pas.semakan']);
    $routes->post('(:num)/review',  'ReviewController::review/$1',  ['as' => 'pas.review',  'filter' => 'permission:pas.review']);
    $routes->post('(:num)/approve', 'ReviewController::approve/$1', ['as' => 'pas.approve', 'filter' => 'permission:pas.approve']);
    $routes->post('(:num)/reject',  'ReviewController::reject/$1',  ['as' => 'pas.reject',  'filter' => 'permission:pas.review,pas.approve']);
});
```

- `group:reviewer,approver,admin` — **any** one group (OR). `permission:pas.review,pas.approve` — any one permission (OR).
- **CI 4.5.4+ combines** the group filter with the route filter: `/approve` must pass `group:…` **and** `permission:pas.approve`. Confirm with `php spark routes` (the *Before Filters* column).
- Why is the group filter alone not enough? It lets `reviewer` reach `/approve`. Note 06 says it clearly: *the second layer must refuse it*.
- `/pas/permohonan/new` and `POST /pas/permohonan` are also given `permission:pas.apply` — SPEC §4 gives `pas.apply` to `applicant` (and `admin` through `pas.*`) only.

### 2.4 What does the user see when refused?

| Layer that refuses | Behaviour | Why |
|----------------------|----------|--------|
| `session` filter (not logged in yet) | Redirect to `/login` | Authentication |
| `group:` / `permission:` filter (Shield) | Redirect to `Config\Auth::$redirects['group_denied' / 'permission_denied']` (default `/`) with a flash `error` (Shield's default text is in English: *"You do not have the necessary permission…"* — translation is ⭐ Lab 8.2) | Shield's default behaviour — user-friendly |
| `authorize()` in the Service | **403** + `errors/forbidden` | Should not happen if the filters are correct — if it does, it signals a misconfigured route; a 403 is clear in the log |
| `canView()` (someone else's record) | **404** | Do not reveal that the ID exists (Day 7) |

> 💡 **Tip:** Want the Shield filters to return a clear page too? Change `permission_denied` and `group_denied` in `app/Config/Auth.php` to a route that shows a message, e.g. `'/akses-ditolak'`. Do not change files in `vendor/`.

### 2.5 Buttons: UX, not security

`ApplicationController::show()` computes `$actions` so the view only shows buttons that **will succeed**:

```php
'actions' => [
    'review'  => $user->can('pas.review')  && $status->canTransitionTo(PassStatus::UnderReview),
    'approve' => $user->can('pas.approve') && $status->canTransitionTo(PassStatus::Approved),
    'reject'  => $user->can('pas.review', 'pas.approve') && $status->canTransitionTo(PassStatus::Rejected),
],
```

Hiding buttons avoids confusion — but it does **not** stop an attacker who sends a POST with `curl`. That is the job of Layers 1 & 2.

> ⚠️ **Common mistakes**
> - A permission used in `$matrix`/code but not declared in `$permissions` → the permission list is incomplete, `$user->addPermission()` throws an error, and typos (`pas.aprove`) are not caught. Declare **all** permissions.
> - Writing `filter => 'permission:pas.review|pas.approve'` → filter arguments are separated by a **comma**, not `|`.
> - `inGroup('reviewer')` in the controller to approve → admin cannot approve; role logic gets scattered. Use `can()`.
> - Changing `AuthGroups` while the test users are not in the group (seeder not re-run) → everything is refused. Check `SELECT * FROM auth_groups_users;`.

### 🎯 Quiz S2

1. `penyemak` sends `POST /pas/semakan/5/approve` using curl. The route is in the `group:reviewer,approver,admin` group and has the `permission:pas.approve` filter. What happens?
   - [ ] Success — the reviewer passes the `group:reviewer,approver,admin` filter, and the group filter overrides the filter on individual routes
   - [ ] 404 because the reviewer cannot view the application
   - [ ] The status changes but there is no log
   - [x] Refused — both filters run; the reviewer passes `group:` but fails `permission:pas.approve`
   > The group filter alone is not enough because it lets `reviewer` reach `/approve`. The group filter does not override the route filter: both are combined and run, so `permission:pas.approve` still refuses the reviewer. The second layer, `authorize()` in the Service, would also refuse if a filter were missed.

2. Why does the code that approves a pass check `$user->can('pas.approve')` and not `$user->inGroup('approver')`?
   - [ ] `inGroup()` does not exist in Shield
   - [x] A permission is a capability; `admin` also gets `pas.approve` through `pas.*` without code changes, and role changes only touch `$matrix`
   - [ ] `can()` also checks record ownership and status transitions automatically, so `canTransitionTo()` is no longer needed in the Service
   - [ ] `inGroup()` needs a new migration
   > Code checks permissions, not groups. The deliberate exception is `canView()` (BR-PAS-04), because the SPEC states it in terms of groups.

---

## S3 — Status History & Functional Tests (14:30–16:00)

### 3.1 Timeline from `status_logs`

`status_logs` is **one** audit table for TLK (Special Vehicle Parking) & Pass (SPEC §3). `StatusLogModel::history('PAS', $id)` (Day 4) returns rows with `actor_name`, `from_status`, `to_status`, `remarks`, `created_at`. We display them with a generic partial:

```php
<?= view('partials/status_timeline', ['history' => $history, 'enum' => \App\Enums\PassStatus::class]) ?>
```

```php
// app/Views/partials/status_timeline.php (excerpt)
$caseOf = static fn (?string $value) => $value === null ? null : $enum::tryFrom($value);
…
<span class="badge <?= esc($to?->badge() ?? 'text-bg-light', 'attr') ?>"><?= esc($to?->label() ?? $log['to_status']) ?></span>
<small>oleh <?= esc($log['actor_name'] ?? 'Sistem') ?></small>
<?php if (! empty($log['remarks'])): ?>“<?= esc($log['remarks']) ?>”<?php endif ?>
```

- **Why `$enum` as a parameter?** The same partial can be used for TLK with `BookingStatus::class` — both enums have `label()` and `badge()`.
- **`tryFrom()`, not `from()`**: old audit data may contain values that no longer exist in the enum. The timeline must still be displayed.
- **`esc($log['remarks'])`**: notes are typed by officers — still user input.
- Sample output for one approved application:

```text
1. [Dihantar]                         oleh Pemohon Satu    24/09/2026 09:12
2. [Dihantar] → [Dalam Semakan]       oleh Penyemak Satu   24/09/2026 10:05
3. [Dalam Semakan] → [Diluluskan]     oleh Pelulus Satu    24/09/2026 11:40   "Dokumen lengkap."
```

### 3.2 Test strategy: role × action matrix

Every "❌" cell in the §2.2 table is a **negative test**; every important "✅" is a **positive test**. Negative tests check **two** things: the response is refused **and** the DB has not changed (`assertStatusIs()`), because a redirect alone does not prove there were no side effects.

| Test | Role | Action | Expected |
|-------|---------|----------|----------|
| `testPemohonHanyaNampakPermohonanSendiriDalamSenarai` | applicant | GET list | sees own only |
| `testPemohonLainMendapat404BagiPermohonanOrangLain` | applicant | GET someone else's details | `PageNotFoundException` |
| `testPenyemakBolehLihatPermohonanSesiapa` | reviewer | GET details | 200 |
| `testPemohonTidakBolehBukaSenaraiSemakan` | applicant | GET `/pas/semakan` | redirect |
| `testPemohonTidakBolehLuluskan` | applicant | POST approve | redirect + status unchanged |
| `testPenyemakTidakBolehLuluskan` | reviewer | POST approve | redirect + status unchanged |
| `testPelulusTidakBolehMulakanSemakan` | approver | POST review | redirect + status unchanged |
| `testPenyemakBolehMulakanSemakan` | reviewer | POST review | `under_review`, `reviewed_by`, log |
| `testPelulusBolehLuluskan` | approver | POST approve | `approved`, `approved_by`, log |
| `testTolakTanpaCatatanYangCukupTidakMengubahStatus` | reviewer | POST reject "tak ok" | status unchanged |
| `testPenyemakBolehTolakDenganCatatan` | reviewer | POST reject | `rejected` + remarks in the log |
| `testServiceMenolakPeralihanTidakSah` | approver | Service `approve()` on `submitted` | `DomainException` |
| `testServiceMenyekatPenyemakWalaupunFilterTerlepas` | reviewer | Service `approve()` | `PermissionException` |

```php
public function testPenyemakTidakBolehLuluskan(): void
{
    $id = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

    // Passes the group:reviewer,… filter BUT fails permission:pas.approve
    $this->actingAs($this->penyemak)->post("pas/semakan/{$id}/approve")->assertRedirect();

    $this->assertStatusIs($id, PassStatus::UnderReview);   // DB has NOT changed
}
```

### 3.3 Technical test points (same as Day 6 — note 10)

- **A separate MySQL test DB** (`kkm_latihan_test`, empty `DBPrefix`). SQLite `:memory:` does not support `FOR UPDATE`.
- `protected $namespace = null;` — runs migrations for **all** namespaces (App + Shield + Settings); without it the `users` table does not exist.
- **CSRF**: `FeatureTestTrait` does not bypass CSRF. `PassAccessTest` disables `csrf` in `setUp()` and restores it in `tearDown()` — these tests are about access, not CSRF. (CSRF-specific tests have existed since Day 6.)
- `actingAs($user)` from `CodeIgniter\Shield\Test\AuthenticationTesting`.
- 404 in tests: CI4 rethrows `PageNotFoundException` → use `expectException()`.

> ⚠️ **Common mistakes**
> - Testing only the *happy path*. Access control bugs are almost **always** in the negative tests nobody wrote.
> - Only `assertRedirect()` for negative tests — it passes even if the Service already changed the status before the redirect. Add a DB check.
> - Sharing users between tests with `$migrateOnce`/`$refresh = false` → tests depend on their order.

### 🎯 Quiz S3

1. The following negative test can pass even though the status has changed. What is its weakness?
   ```php
   public function testPenyemakTidakBolehLuluskan(): void
   {
       $id = $this->makeApplication($this->pemohon1, PassStatus::UnderReview);

       $this->actingAs($this->penyemak)->post("pas/semakan/{$id}/approve")->assertRedirect();
   }
   ```
   - [ ] No weakness; the redirect proves the request was refused
   - [ ] `actingAs()` should be called after `post()` so the reviewer's session does not affect other tests in the same class
   - [x] A redirect alone does not prove there were no side effects — add a DB check such as `$this->assertStatusIs($id, PassStatus::UnderReview)`
   - [ ] Negative tests are not needed for access control
   > A successful route also returns a redirect. A negative test must check that the response is refused **and** that the DB has not changed.

2. Why does the `status_timeline` partial use `$enum::tryFrom($value)` and not `$enum::from($value)`?
   - [ ] `from()` does not exist for backed enums
   - [ ] `tryFrom()` converts the DB value straight to a Malay label (e.g. `under_review` → "Dalam Semakan"), so `label()` does not need to be called
   - [ ] `tryFrom()` is faster
   - [x] Old audit data may contain values that no longer exist in the enum; `tryFrom()` returns `null` so the timeline is still displayed
   > `from()` would throw a `ValueError` and break the page. The partial uses `$to?->label() ?? $log['to_status']` as a fallback.

---

## S4 — Pass Module Wrap-up: 3-Role Demo (16:00–17:00)

### 4.1 Demo script (5 minutes per pair)

Three browser windows (normal, incognito, a second browser) — one for each role:

| # | Role | Action | What is shown to the "system owner" |
|---|---------|----------|---------------------------------------------|
| 1 | `pemohon1` | Apply for a staff pass + 2 documents | `PAS-2026-000N`, badge **Dihantar** (Submitted), timeline with 1 entry |
| 2 | `pemohon1` | Try to open `/pas/semakan` | Refused with a message |
| 3 | `penyemak` | `/pas/semakan` → open the application → download a document → **Mula Semakan** (Start Review) | Badge **Dalam Semakan** (Under Review); no *Lulus* (Approve) button |
| 4 | `penyemak` | (curl/DevTools) POST to `/approve` | Refused — "no button ≠ security; the server refuses" |
| 5 | `pelulus` | Open the application → **Lulus** (Approve) with a note | Badge **Diluluskan** (Approved); timeline with 3 entries with names & times |
| 6 | `pelulus` | Click **Lulus** (Approve) again (old tab) | "Peralihan status … tidak dibenarkan" (BR-PAS-01) |
| 7 | `penyemak` | Second application → Start Review → **Tolak** (Reject) "tak ok" → then a full note | Note error, then **Ditolak** (Rejected) (BR-PAS-03) |
| 8 | Terminal | `composer test -- tests/feature/Pas --testdox` | All green |

### 4.2 Definition of Done — M2

Check against [KOLABORASI §2](../docs/kolaborasi.md):

- [ ] The Pass URS acceptance criteria (Day 2) pass manual testing (`docs/ujian-manual-pas.md` + demo).
- [ ] Server-side validation: form (Day 7), rejection note (today), files (BR-PAS-02).
- [ ] Access controlled on the server: route filters + `authorize()` + `canView()`.
- [ ] Every transition is recorded in `status_logs` (BR-PAS-05) — including creation.
- [ ] `composer test` passes.
- [ ] No `.env`/secrets; synthetic data only.
- [ ] Each member of the pair can explain `transition()` and the three access layers.

### 4.3 ⭐ Automatic expiry: `php spark pas:expire`

SPEC §2.2: `expired` is set by the **system**. Yesterday we built the "at display time" version (`displayStatus()`). Today (optional) we build the permanent version — a Spark command that **calls the same Service**, so `canTransitionTo()` and `status_logs` still apply:

```bash
php spark pas:expire --dry-run     # 2 passes past valid_until before 2026-09-25: ID 4, 7
php spark pas:expire               # ✔ PAS-2026-0004 → Tamat Tempoh …
```

```php
foreach ($ids as $id) {
    try {
        $application = $workflow->expire($id, $actorId);   // through transition() — log recorded
        CLI::write("  ✔ {$application->ref_no} → Tamat Tempoh", 'green');
    } catch (Throwable $e) {
        CLI::error("  ✘ ID {$id}: " . $e->getMessage());   // one failure does not stop the others
    }
}
```

`status_logs.actor_id` is required (FK), so the command uses `--actor <id>` or the first admin. On a real server it is scheduled with cron (`10 0 * * * cd /var/www/app && php spark pas:expire`). Windows server: Task Scheduler, in Command Prompt as administrator — not Git Bash (`schtasks /create /tn KKM-PasExpire /sc daily /st 00:10 /tr "cmd /c cd /d C:\laragon\www\app && php spark pas:expire"`). Reference: `ExpirePassesCommand.php.txt` (**Templat & Rujukan** module).

### 🎯 Quiz S4

1. In the demo, the approver presses **Approve** again in an old tab after the application is already `approved`. What should the system owner see?
   - [ ] Another "Diluluskan" entry in the timeline
   - [ ] A 403 page because the approver has no `pas.approve` permission on an application that is already approved
   - [x] The message "Peralihan status … tidak dibenarkan" — `approved → approved` is refused by `canTransitionTo()` (BR-PAS-01)
   - [ ] The status changes to `expired`
   > The only valid transition from `approved` is to `expired`. `transition()` reads the status after the lock, so repeated clicks do not create duplicate logs.

2. Why does the `pas:expire` Spark command call `$workflow->expire($id, $actorId)` and not run `UPDATE pass_applications SET status = 'expired'` directly?
   - [x] So the transition goes through `transition()` — `canTransitionTo()` is enforced and `status_logs` is recorded (BR-PAS-05)
   - [ ] Because a Spark command cannot use the Query Builder
   - [ ] So the command can run without a database
   - [ ] Because `expired` can only be set by `approver`, so the command must act as an approver through the Service
   > One door for status changes for all callers (controller, command, tests). `status_logs.actor_id` is required, so the command uses `--actor <id>` or the first admin.

---

## 📦 Deliverables — Today's Output

- [ ] `PassWorkflowService`: `startReview`, `approve`, `reject`, `expire`, `history`, `transition`, `authorize`
- [ ] `app/Controllers/Pas/ReviewController.php` (`index`, `review`, `approve`, `reject`)
- [ ] `app/Config/AuthGroups.php` exactly per SPEC §4
- [ ] `pas/semakan` routes + `permission:` per action; `permission:pas.apply` for applying
- [ ] `app/Views/pas/semakan/index.php`, `app/Views/errors/forbidden.php`, `app/Views/partials/status_timeline.php`; `pas/show.php` with an action panel + timeline
- [ ] `tests/feature/Pas/PassAccessTest.php` — 13 green tests
- [ ] 3-role demo passes; branch `feat/pas-kelulusan` merged into `main` — **M2 done**
- [ ] ⭐ `app/Commands/ExpirePassesCommand.php`

Full trainer reference: `templates/kod/` (**Templat & Rujukan** module) — `PassWorkflowService`, `ReviewController`, `AuthGroups`, `Routes-pas`, `status-timeline-view`, `PassAccessTest`, `ExpirePassesCommand`. Topic notes: [06 Shield auth & RBAC](../docs/nota-06-shield-auth-dan-rbac.md) · [05 Service & transactions](../docs/nota-05-service-layer-dan-transaksi.md) · [10 PHPUnit tests](../docs/nota-10-ujian-phpunit-ci4.md).

---

## 🧠 Self-check

1. The `/pas/semakan` route already has `group:reviewer,approver,admin`. Why does `/pas/semakan/{id}/approve` still need `permission:pas.approve`, **and** `authorize()` in the Service?

<details><summary>Answer</summary>

The group filter lets `reviewer` in — without the permission filter, a reviewer could POST to `/approve`. `permission:pas.approve` closes that hole at Layer 1. `authorize()` in the Service is Layer 2: if one day a new route (API, Spark command, another controller) calls `approve()` without the right filter, the Service still refuses. Defence in depth means one configuration mistake does not immediately become a breach.
</details>

2. Approvers A and B press **Approve** at the same time on the same application. Explain what happens in `transition()` step by step.

<details><summary>Answer</summary>

A acquires the row lock through `SELECT … FOR UPDATE`; B waits. A reads `under_review`, `canTransitionTo(Approved)` is true, update + `status_logs`, commit — the lock is released. B now reads `approved`; `Approved->canTransitionTo(Approved)` is false → `DomainException` → `transRollback()` → B sees "Peralihan status … tidak dibenarkan." Only **one** approval entry in `status_logs`.
</details>

3. Why does our code check `$user->can('pas.approve')` and not `$user->inGroup('approver')`? When is `inGroup()` still appropriate?

<details><summary>Answer</summary>

Permissions separate **capability** from **role**. Admin (through `pas.*`) can approve without extra code; if the system owner changes who can approve, only `$matrix` changes. `inGroup()` is appropriate when the rule itself is defined in terms of groups — e.g. BR-PAS-04 "`reviewer`/`approver`/`admin` see everything" in `canView()`, or the SPEC §6 `group:` filter.
</details>

4. `testPenyemakTidakBolehLuluskan` only checks `assertRedirect()`. What bug could slip through, and how do you fix it?

<details><summary>Answer</summary>

If the controller/Service has already **changed the status** before the redirect (e.g. `update()` is called first, permission checked later), the response is still a redirect and the test passes — even though the data is already corrupted. Add `assertStatusIs($id, PassStatus::UnderReview)` (`seeInDatabase`) and `dontSeeInDatabase('status_logs', [... 'to_status' => 'approved'])`.
</details>

5. Why does `pas:expire` call `PassWorkflowService::expire()` and not run `UPDATE pass_applications SET status='expired' WHERE …` directly?

<details><summary>Answer</summary>

A bulk `UPDATE` would bypass BR-PAS-01 (it could change `rejected` to `expired` if the `WHERE` is wrong) and BR-PAS-05 (no `status_logs` entry). Through the Service, each pass goes through `transition()`: locked, checked with `canTransitionTo()`, updated, and recorded with the actor — consistent with every other transition.
</details>

---

## ➡️ Preparation for tomorrow

Day 9 — **Report Module (M3)**: RPT-01 (TLK bookings) and **RPT-02 (Pass applications)** with filters, aggregates and PDF/Excel export.

- Make sure `main` contains M1 **and** M2 (merge `feat/pas-kelulusan`).
- Create at least **8 Pass applications** with different statuses (`submitted`, `under_review`, `approved`, `rejected`) and different dates — tomorrow's reports need data to filter. Include at least one of each `pass_type`.
- Check `composer show dompdf/dompdf phpoffice/phpspreadsheet` — if not installed yet, see [`docs/persediaan.md`](../docs/persediaan.md).
- A question to think about: *Who should be able to see RPT-02 — and which route filter will you use?* (Hint: SPEC §6.)
