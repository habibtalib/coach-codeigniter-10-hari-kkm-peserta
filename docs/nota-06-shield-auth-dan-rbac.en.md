# 06 · Shield: Authentication (Authn) & Role-Based Access Control (RBAC)

Topical notes (reference across days) · Canon: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Index: [`README.md`](./nota.md)

## Notes objectives

- **Distinguish** *authentication* from *authorization* with TLK (Special Vehicle Parking)/Pass examples.
- **Configure** `Config\AuthGroups` (groups, permissions, `$matrix`) exactly as in SPEC §4.
- **Protect** routes with the Shield filters `session`, `group:` and `permission:` in `app/Config/Routes.php`.
- **Write** an ownership check (BR-PAS-04) to prevent IDOR, and **explain** why hiding a button is not a security control.

---

## 1. Authn vs Authz — two different questions

| | Authentication | Authorization |
|---|---|---|
| Question | **Who are you?** | **What are you allowed to do?** |
| Proof | E-mail + password (`Latihan@2026`) | Group (`reviewer`) + permission (`pas.review`) + record ownership |
| Failure | Redirect to `/login` | 403/404 or redirect with an error message |
| In Shield | `auth()->attempt()`, `session` filter | `$user->can()`, `$user->inGroup()`, `group:`/`permission:` filters |

Example: `pemohon1@latihan.test` **logs in successfully** (authn passes) but tries to open `/pas/semakan` — rejected because they are not a `reviewer` (authz fails). Now they try to open `/pas/permohonan/12`, which belongs to `pemohon2` — it must be rejected even though they have the `pas.apply` permission (**object**-level authz).

Why use Shield instead of writing your own? Shield already handles *password hashing* (bcrypt/argon2), *session fixation*, *remember-me tokens*, *login throttling*, and group/permission management — things that are easy to get wrong when you write them yourself.

---

## 2. Installation (Day 4)

```bash
composer require codeigniter4/shield
php spark shield:setup      # generate Config\Auth, Config\AuthGroups, auth routes, run migrations
php spark routes            # confirm /login, /logout, /register exist
```

`shield:setup` adds `service('auth')->routes($routes);` to `Routes.php` and registers the Shield filter aliases (`session`, `tokens`, `chain`, `group`, `permission`, `auth-rates`, `force-reset`) automatically through the Shield *Registrar* — you **do not need** to type those aliases yourself in `Config\Filters`.

Extra `users` fields (`full_name`, `staff_no`, `department_id`, `phone`) — see [notes 02](./nota-02-migration-seeder-dan-query-builder.md). To save them through Shield, generate your own model: `php spark shield:model UserModel`, add the fields to `$allowedFields`, and set `Config\Auth::$userProvider = \App\Models\UserModel::class`.

---

## 3. `app/Config/AuthGroups.php` — the single source of roles

```php
<?php

declare(strict_types=1);

namespace Config;

use CodeIgniter\Shield\Config\AuthGroups as ShieldAuthGroups;

class AuthGroups extends ShieldAuthGroups
{
    // New users (e.g. self-registered) become applicants straight away
    public string $defaultGroup = 'applicant';

    public array $groups = [
        'applicant' => ['title' => 'Pemohon',   'description' => 'Kakitangan pemohon'],
        'reviewer'  => ['title' => 'Penyemak',  'description' => 'Pegawai penyemak pas'],
        'approver'  => ['title' => 'Pelulus',   'description' => 'Pegawai pelulus pas & tempahan TLK'],
        'admin'     => ['title' => 'Pentadbir', 'description' => 'Pentadbir sistem'],
    ];

    // EVERY permission must be declared here before it is used
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

    // Exactly as in SPEC §4 — do not add anything without updating the SPEC
    public array $matrix = [
        'applicant' => ['tlk.apply', 'pas.apply'],
        'reviewer'  => ['pas.review', 'laporan.view'],
        'approver'  => ['tlk.decide', 'pas.approve', 'laporan.view', 'statistik.view'],
        'admin'     => ['admin.*', 'tlk.*', 'pas.*', 'laporan.*', 'statistik.*'],
    ];
}
```

**Wildcards (`*`)**: `tlk.*` means every permission that starts with `tlk.` (`tlk.apply`, `tlk.decide`). Admin automatically gets new permissions in the same family without the matrix being updated.

**Group or permission?** Check the **permission** in code (`can('pas.review')`), not the group name. If tomorrow the administrator wants `approver` to review as well, you only change `$matrix` — no controller code changes.

### Adding a group to a user (seeder)

```php
use CodeIgniter\Shield\Entities\User;

$users = auth()->getProvider();

$user = new User([
    'username' => 'penyemak',
    'email'    => 'penyemak@latihan.test',   // synthetic only
    'password' => 'Latihan@2026',
]);
$users->save($user);

$user = $users->findById($users->getInsertID());
$user->addGroup('reviewer');   // must be a name that exists in $groups
```

---

## 4. Layer 1: route filters (`app/Config/Routes.php`)

Filters run **before** the controller (see [notes 01](./nota-01-mvc-dan-kitaran-request-ci4.md)). If one fails, the controller is not called at all.

```php
use App\Controllers\Admin\SlotController;
use App\Controllers\Pas\ApplicationController;
use App\Controllers\Pas\ReviewController;
use App\Controllers\Tlk\BookingController;
use App\Controllers\Tlk\DecisionController;

service('auth')->routes($routes);

// Must be logged in only
$routes->group('tlk/tempahan', ['filter' => 'session'], static function ($routes) {
    $routes->get('/', [BookingController::class, 'index']);
    $routes->get('new', [BookingController::class, 'new']);
    $routes->post('/', [BookingController::class, 'create']);
    $routes->get('(:num)', [BookingController::class, 'show']);
    $routes->post('(:num)/cancel', [BookingController::class, 'cancel']);
});

// Must have a specific permission
$routes->group('tlk/keputusan', ['filter' => 'permission:tlk.decide'], static function ($routes) {
    $routes->get('/', [DecisionController::class, 'index']);
    $routes->post('(:num)/approve', [DecisionController::class, 'approve']);
    $routes->post('(:num)/reject', [DecisionController::class, 'reject']);
});

// Must be in the admin group
$routes->group('admin/slot', ['filter' => 'group:admin'], static function ($routes) {
    $routes->get('/', [SlotController::class, 'index']);
    // ... other CRUD
});

// One of several groups (OR)
$routes->group('pas/semakan', ['filter' => 'group:reviewer,approver,admin'], static function ($routes) {
    $routes->get('/', [ReviewController::class, 'index']);
    $routes->post('(:num)/review', [ReviewController::class, 'review']);
    $routes->post('(:num)/approve', [ReviewController::class, 'approve']);
    $routes->post('(:num)/reject', [ReviewController::class, 'reject']);
});
```

Note on behaviour: the `group:`/`permission:` filters ask the user to log in if they are not logged in yet; if they are logged in but lack the right, Shield redirects with an error message (this can be changed in `Config\Auth`). Confirm with `php spark routes` — the *Filters* column must show the correct filter.

> ⚠️ **Warning:** the filter `group:reviewer,approver,admin` lets a **reviewer** reach `/approve`. The second layer (Service / `can('pas.approve')`) must reject it. This is why we need more than one layer.

---

## 5. Layer 2: checks in the controller/service

```php
// In ReviewController::approve()
if (! auth()->user()->can('pas.approve')) {
    throw new \CodeIgniter\Exceptions\PageNotFoundException();   // or return 403
}
```

`PassWorkflowService` also checks the transition (`PassStatus::canTransitionTo()`, BR-PAS-01) and who the actor is — role + status must **both** be valid.

---

## 6. Layer 3: ownership check (BR-PAS-04) — prevent IDOR

**IDOR** (*Insecure Direct Object Reference*): a user changes `/pas/permohonan/12` to `/pas/permohonan/13` and sees someone else's data. The `session` filter does **not** stop this — it only knows you are logged in.

```php
<?php

namespace App\Controllers\Pas;

use App\Controllers\BaseController;
use App\Models\PassApplicationModel;
use CodeIgniter\Exceptions\PageNotFoundException;

class ApplicationController extends BaseController
{
    public function show(int $id)
    {
        $app  = model(PassApplicationModel::class)->find($id);
        $user = auth()->user();

        // BR-PAS-04: the owner OR a role that can see everything
        $canViewAll = $user->inGroup('reviewer', 'approver', 'admin');

        if ($app === null || (! $canViewAll && (int) $app->user_id !== (int) auth()->id())) {
            // 404, not 403: do not reveal that record #13 EXISTS
            throw PageNotFoundException::forPageNotFound();
        }

        return view('pas/show', ['app' => $app]);
    }

    public function index()
    {
        $model = model(PassApplicationModel::class);

        // Scope the list at QUERY level, do not filter after fetching everything
        if (! auth()->user()->inGroup('reviewer', 'approver', 'admin')) {
            $model->where('user_id', auth()->id());
        }

        return view('pas/index', [
            'apps'  => $model->orderBy('created_at', 'DESC')->paginate(20),
            'pager' => $model->pager,
        ]);
    }
}
```

**404 or 403?** A 403 tells the attacker "this record exists but is not yours" — that information helps the attacker guess IDs. For records owned by someone else, **404** is safer. For role routes (e.g. `/statistik`), 403/redirect is fine because the existence of the route is not a secret.

The same check is **mandatory** on document downloads `/pas/permohonan/dokumen/{id}` — see [notes 07](./nota-07-muat-naik-fail-selamat.md).

---

## 7. Hiding a button ≠ security

```php
<?php if (auth()->user()->can('pas.approve')): ?>
    <form method="post" action="<?= site_url('pas/semakan/' . $app->id . '/approve') ?>">
        <?= csrf_field() ?>
        <button class="btn btn-success"><i class="bi bi-check2"></i> Lulus</button>
    </form>
<?php endif ?>
```

This is only for **UX** (users do not see a button they cannot press). An attacker can send a `POST` directly with `curl` or DevTools. The real control is the filter + checks on the server (SPEC §4: "hiding the button is not enough").

### Shield helpers used often

| Code | Function |
|------|----------|
| `auth()->loggedIn()` | `true` if the session is valid |
| `auth()->id()` | Current user ID (`int`/`null`) |
| `auth()->user()` | Current `User` entity |
| `$user->can('pas.review')` | Check a permission (including wildcards from the matrix) |
| `$user->inGroup('reviewer', 'approver')` | `true` if in **any one** of the groups |
| `$user->addGroup('approver')` / `removeGroup()` | Manage groups (seeder/admin) |

---

## 8. Testing access (briefly)

Every protected route needs **two** tests: positive (correct role → 200) and negative (wrong role → not 200). Use `actingAs()` from `CodeIgniter\Shield\Test\AuthenticationTesting`. Full example: [notes 10](./nota-10-ujian-phpunit-ci4.md).

---

## ⚠️ Common mistakes

| Mistake | Result | Fix |
|---------|--------|-----|
| Only hiding the button in the view | Anyone can `POST` directly to `/approve` | Route filter + `can()` in the controller/service |
| Only the `session` filter on `/pas/permohonan/(:num)` | IDOR — an applicant sees other people's applications | BR-PAS-04 ownership check + scoped list query |
| Checking the group name in code (`inGroup('approver')`) for actions | A policy change = code changes in many places | Check the permission (`can('pas.approve')`); groups for display scope |
| Permission used in `$matrix` but not declared in `$permissions` | Error, or `can()` is always `false` | Declare everything in `$permissions` |
| Misspelt group in a filter (`group:reviewers`) | Every user rejected / error | Copy exactly from SPEC §4; check `php spark routes` |
| Fetching all records then filtering in PHP | Data leak, slow, wrong pagination | `where('user_id', auth()->id())` before `paginate()` |
| Returning 403 for someone else's record | The attacker learns the ID exists | 404 (`PageNotFoundException`) |
| Hardcoding a real password in a seeder | Secret leak | Synthetic training passwords only (`Latihan@2026`) |

## Official references

- [Shield — Installation & Setup](https://shield.codeigniter.com/latest/getting_started/install/)
- [Shield — Authorization (groups, permissions, matrix)](https://shield.codeigniter.com/latest/references/authorization/)
- [Shield — Controller Filters](https://shield.codeigniter.com/latest/references/controller_filters/)
- [Shield — Adding Attributes to Users](https://shield.codeigniter.com/latest/customization/adding_attributes_to_users/)
- [CI4 — Controller Filters](https://codeigniter.com/user_guide/incoming/filters.html)
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP — IDOR Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)

## Book reading — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), 2021 edition (CodeIgniter 4.1). `p.` = the page number printed at the foot of the book page.

- Controller filter & `app/Config/Filters.php` (`Throttle`) — p. 94–96

The book predates Shield; groups, permissions and `auth()` are only in this note and the Shield docs.

---
**Used on Day 8** — S2 (groups/permissions + route filters + ownership check) and S3 (positive & negative access tests). Also Day 4 S2 (install Shield & `UserSeeder`) and Day 10 (`permission:statistik.view`). Related notes: [01 Request lifecycle](./nota-01-mvc-dan-kitaran-request-ci4.md) · [07 Upload](./nota-07-muat-naik-fail-selamat.md) · [11 Security](./nota-11-keselamatan-aplikasi-web.md)
