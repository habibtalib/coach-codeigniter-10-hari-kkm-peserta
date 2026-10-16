# 06 · Shield: Pengesahan (Authn) & Kawalan Akses Berperanan (RBAC)

> Nota topikal (rujukan merentas hari) · Kanun: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Indeks: [`README.md`](./nota.md)

## Objektif nota

- **Membezakan** pengesahan (*authentication*) dan kebenaran (*authorization*) dengan contoh TLK/Pas.
- **Mengkonfigur** `Config\AuthGroups` (groups, permissions, `$matrix`) tepat seperti SPEC §4.
- **Melindungi** route dengan filter Shield `session`, `group:` dan `permission:` dalam `app/Config/Routes.php`.
- **Menulis** semakan pemilikan (BR-PAS-04) untuk menghalang IDOR, dan **menerangkan** kenapa menyembunyikan butang bukan kawalan keselamatan.

---

## 1. Authn vs Authz — dua soalan berbeza

| | Pengesahan (Authentication) | Kebenaran (Authorization) |
|---|---|---|
| Soalan | **Siapa anda?** | **Apa yang anda boleh buat?** |
| Bukti | E-mel + kata laluan (`Latihan@2026`) | Group (`reviewer`) + permission (`pas.review`) + pemilikan rekod |
| Gagal | Redirect ke `/login` | 403/404 atau redirect dengan mesej ralat |
| Dalam Shield | `auth()->attempt()`, filter `session` | `$user->can()`, `$user->inGroup()`, filter `group:`/`permission:` |

Contoh: `pemohon1@latihan.test` **berjaya log masuk** (authn lulus) tetapi cuba buka `/pas/semakan` — ditolak kerana bukan `reviewer` (authz gagal). Cuba pula buka `/pas/permohonan/12` milik `pemohon2` — mesti ditolak walaupun dia ada permission `pas.apply` (authz peringkat **objek**).

Kenapa guna Shield dan bukan tulis sendiri? Shield sudah mengurus *password hashing* (bcrypt/argon2), *session fixation*, *remember-me token*, *login throttling*, dan pengurusan group/permission — perkara yang mudah tersilap jika ditulis sendiri.

---

## 2. Pemasangan (Hari 4)

```bash
composer require codeigniter4/shield
php spark shield:setup      # jana Config\Auth, Config\AuthGroups, laluan auth, jalankan migration
php spark routes            # sahkan /login, /logout, /register wujud
```

`shield:setup` menambah `service('auth')->routes($routes);` dalam `Routes.php` dan mendaftar alias filter Shield (`session`, `tokens`, `chain`, `group`, `permission`, `auth-rates`, `force-reset`) secara automatik melalui *Registrar* Shield — anda **tidak perlu** menaip alias itu sendiri dalam `Config\Filters`.

> Medan tambahan `users` (`full_name`, `staff_no`, `department_id`, `phone`) — lihat [nota 02](./nota-02-migration-seeder-dan-query-builder.md). Untuk menyimpannya melalui Shield, jana model sendiri: `php spark shield:model UserModel`, tambah medan ke `$allowedFields`, dan tetapkan `Config\Auth::$userProvider = \App\Models\UserModel::class`.

---

## 3. `app/Config/AuthGroups.php` — sumber tunggal peranan

```php
<?php

declare(strict_types=1);

namespace Config;

use CodeIgniter\Shield\Config\AuthGroups as ShieldAuthGroups;

class AuthGroups extends ShieldAuthGroups
{
    // Pengguna baharu (cth daftar sendiri) terus menjadi pemohon
    public string $defaultGroup = 'applicant';

    public array $groups = [
        'applicant' => ['title' => 'Pemohon',   'description' => 'Kakitangan pemohon'],
        'reviewer'  => ['title' => 'Penyemak',  'description' => 'Pegawai penyemak pas'],
        'approver'  => ['title' => 'Pelulus',   'description' => 'Pegawai pelulus pas & tempahan TLK'],
        'admin'     => ['title' => 'Pentadbir', 'description' => 'Pentadbir sistem'],
    ];

    // SETIAP permission mesti diisytihar di sini sebelum digunakan
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

    // Tepat seperti SPEC §4 — jangan tambah tanpa kemas kini SPEC
    public array $matrix = [
        'applicant' => ['tlk.apply', 'pas.apply'],
        'reviewer'  => ['pas.review', 'laporan.view'],
        'approver'  => ['tlk.decide', 'pas.approve', 'laporan.view', 'statistik.view'],
        'admin'     => ['admin.*', 'tlk.*', 'pas.*', 'laporan.*', 'statistik.*'],
    ];
}
```

**Kad liar (`*`)**: `tlk.*` bermaksud semua permission yang bermula `tlk.` (`tlk.apply`, `tlk.decide`). Admin automatik mendapat permission baharu dalam keluarga yang sama tanpa perlu kemas kini matriks.

**Group atau permission?** Semak **permission** dalam kod (`can('pas.review')`), bukan nama group. Jika esok pentadbir mahu `approver` turut menyemak, anda hanya ubah `$matrix` — tiada kod controller berubah.

### Menambah group kepada pengguna (seeder)

```php
use CodeIgniter\Shield\Entities\User;

$users = auth()->getProvider();

$user = new User([
    'username' => 'penyemak',
    'email'    => 'penyemak@latihan.test',   // sintetik sahaja
    'password' => 'Latihan@2026',
]);
$users->save($user);

$user = $users->findById($users->getInsertID());
$user->addGroup('reviewer');   // mesti nama yang wujud dalam $groups
```

---

## 4. Lapisan 1: filter laluan (`app/Config/Routes.php`)

Filter berjalan **sebelum** controller (lihat [nota 01](./nota-01-mvc-dan-kitaran-request-ci4.md)). Jika gagal, controller langsung tidak dipanggil.

```php
use App\Controllers\Admin\SlotController;
use App\Controllers\Pas\ApplicationController;
use App\Controllers\Pas\ReviewController;
use App\Controllers\Tlk\BookingController;
use App\Controllers\Tlk\DecisionController;

service('auth')->routes($routes);

// Mesti log masuk sahaja
$routes->group('tlk/tempahan', ['filter' => 'session'], static function ($routes) {
    $routes->get('/', [BookingController::class, 'index']);
    $routes->get('new', [BookingController::class, 'new']);
    $routes->post('/', [BookingController::class, 'create']);
    $routes->get('(:num)', [BookingController::class, 'show']);
    $routes->post('(:num)/cancel', [BookingController::class, 'cancel']);
});

// Mesti ada permission tertentu
$routes->group('tlk/keputusan', ['filter' => 'permission:tlk.decide'], static function ($routes) {
    $routes->get('/', [DecisionController::class, 'index']);
    $routes->post('(:num)/approve', [DecisionController::class, 'approve']);
    $routes->post('(:num)/reject', [DecisionController::class, 'reject']);
});

// Mesti dalam group admin
$routes->group('admin/slot', ['filter' => 'group:admin'], static function ($routes) {
    $routes->get('/', [SlotController::class, 'index']);
    // ... CRUD lain
});

// Salah satu daripada beberapa group (OR)
$routes->group('pas/semakan', ['filter' => 'group:reviewer,approver,admin'], static function ($routes) {
    $routes->get('/', [ReviewController::class, 'index']);
    $routes->post('(:num)/review', [ReviewController::class, 'review']);
    $routes->post('(:num)/approve', [ReviewController::class, 'approve']);
    $routes->post('(:num)/reject', [ReviewController::class, 'reject']);
});
```

Nota tingkah laku: filter `group:`/`permission:` akan meminta log masuk jika pengguna belum log masuk; jika sudah log masuk tetapi tiada hak, Shield redirect dengan mesej ralat (boleh diubah dalam `Config\Auth`). Sahkan dengan `php spark routes` — lajur *Filters* mesti menunjukkan filter yang betul.

> **Perhatian:** filter `group:reviewer,approver,admin` membenarkan **reviewer** mengakses `/approve`. Lapisan kedua (Service / `can('pas.approve')`) mesti menolaknya. Inilah sebab kita perlukan lebih daripada satu lapisan.

---

## 5. Lapisan 2: semakan dalam controller/service

```php
// Dalam ReviewController::approve()
if (! auth()->user()->can('pas.approve')) {
    throw new \CodeIgniter\Exceptions\PageNotFoundException();   // atau pulang 403
}
```

`PassWorkflowService` juga menyemak peralihan (`PassStatus::canTransitionTo()`, BR-PAS-01) dan siapa pelakunya — peranan + status **kedua-duanya** mesti sah.

---

## 6. Lapisan 3: semakan pemilikan (BR-PAS-04) — cegah IDOR

**IDOR** (*Insecure Direct Object Reference*): pengguna menukar `/pas/permohonan/12` kepada `/pas/permohonan/13` dan nampak data orang lain. Filter `session` **tidak** menghalang ini — ia hanya tahu anda log masuk.

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

        // BR-PAS-04: pemilik ATAU peranan yang boleh lihat semua
        $canViewAll = $user->inGroup('reviewer', 'approver', 'admin');

        if ($app === null || (! $canViewAll && (int) $app->user_id !== (int) auth()->id())) {
            // 404, bukan 403: jangan dedahkan bahawa rekod #13 WUJUD
            throw PageNotFoundException::forPageNotFound();
        }

        return view('pas/show', ['app' => $app]);
    }

    public function index()
    {
        $model = model(PassApplicationModel::class);

        // Skop senarai di peringkat QUERY, bukan tapis selepas ambil semua
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

**404 atau 403?** 403 memberitahu penyerang "rekod ini wujud tetapi bukan milik anda" — maklumat itu membantu penyerang meneka ID. Untuk rekod milik orang lain, **404** lebih selamat. Untuk route peranan (cth `/statistik`), 403/redirect adalah wajar kerana kewujudan route bukan rahsia.

Semakan yang sama **wajib** pada muat turun dokumen `/pas/permohonan/dokumen/{id}` — lihat [nota 07](./nota-07-muat-naik-fail-selamat.md).

---

## 7. Menyembunyikan butang ≠ keselamatan

```php
<?php if (auth()->user()->can('pas.approve')): ?>
    <form method="post" action="<?= site_url('pas/semakan/' . $app->id . '/approve') ?>">
        <?= csrf_field() ?>
        <button class="btn btn-success"><i class="bi bi-check2"></i> Lulus</button>
    </form>
<?php endif ?>
```

Ini hanya untuk **UX** (pengguna tidak nampak butang yang tidak boleh ditekan). Penyerang boleh menghantar `POST` terus dengan `curl` atau DevTools. Kawalan sebenar ialah filter + semakan di server (SPEC §4: "tidak cukup sekadar sembunyi butang").

### Helper Shield yang kerap diguna

| Kod | Fungsi |
|-----|--------|
| `auth()->loggedIn()` | `true` jika sesi sah |
| `auth()->id()` | ID pengguna semasa (`int`/`null`) |
| `auth()->user()` | Entity `User` semasa |
| `$user->can('pas.review')` | Semak permission (termasuk kad liar dari matriks) |
| `$user->inGroup('reviewer', 'approver')` | `true` jika dalam **salah satu** group |
| `$user->addGroup('approver')` / `removeGroup()` | Urus group (seeder/admin) |

---

## 8. Menguji akses (ringkas)

Setiap route dilindungi perlu **dua** ujian: positif (peranan betul → 200) dan negatif (peranan salah → bukan 200). Gunakan `actingAs()` dari `CodeIgniter\Shield\Test\AuthenticationTesting`. Contoh penuh: [nota 10](./nota-10-ujian-phpunit-ci4.md).

---

## ⚠️ Kesilapan lazim

| Kesilapan | Akibat | Betulkan |
|-----------|--------|----------|
| Hanya sembunyi butang dalam view | Sesiapa boleh `POST` terus ke `/approve` | Filter route + `can()` dalam controller/service |
| Hanya filter `session` pada `/pas/permohonan/(:num)` | IDOR — pemohon lihat permohonan orang lain | Semakan pemilikan BR-PAS-04 + skop query senarai |
| Semak nama group dalam kod (`inGroup('approver')`) untuk tindakan | Tukar polisi = tukar kod di banyak tempat | Semak permission (`can('pas.approve')`); group untuk skop paparan |
| Permission guna dalam `$matrix` tetapi tidak diisytihar dalam `$permissions` | Ralat atau `can()` sentiasa `false` | Isytihar semua dalam `$permissions` |
| Salah eja group dalam filter (`group:reviewers`) | Semua pengguna ditolak / ralat | Salin tepat dari SPEC §4; semak `php spark routes` |
| Ambil semua rekod kemudian tapis dalam PHP | Bocor data, lambat, pagination salah | `where('user_id', auth()->id())` sebelum `paginate()` |
| Pulang 403 untuk rekod orang lain | Penyerang tahu ID itu wujud | 404 (`PageNotFoundException`) |
| Hardcode kata laluan sebenar dalam seeder | Kebocoran rahsia | Kata laluan latihan sintetik sahaja (`Latihan@2026`) |

## Rujukan rasmi

- [Shield — Installation & Setup](https://shield.codeigniter.com/latest/getting_started/install/)
- [Shield — Authorization (groups, permissions, matrix)](https://shield.codeigniter.com/latest/references/authorization/)
- [Shield — Controller Filters](https://shield.codeigniter.com/latest/references/controller_filters/)
- [Shield — Adding Attributes to Users](https://shield.codeigniter.com/latest/customization/adding_attributes_to_users/)
- [CI4 — Controller Filters](https://codeigniter.com/user_guide/incoming/filters.html)
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP — IDOR Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)

## Bacaan buku — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), edisi 2021 (CodeIgniter 4.1). `hlm.` = nombor halaman yang tercetak di kaki halaman buku.

- Controller filter & `app/Config/Filters.php` (`Throttle`) — hlm. 94–96

Buku terbit sebelum Shield; groups, permissions dan `auth()` hanya dalam nota ini dan dokumentasi Shield.

---
**Digunakan pada Hari 8** — S2 (groups/permissions + filter route + semakan pemilikan) dan S3 (ujian akses positif & negatif). Turut Hari 4 S2 (pasang Shield & `UserSeeder`) dan Hari 10 (`permission:statistik.view`). Nota berkaitan: [01 Kitaran request](./nota-01-mvc-dan-kitaran-request-ci4.md) · [07 Muat naik](./nota-07-muat-naik-fail-selamat.md) · [11 Keselamatan](./nota-11-keselamatan-aplikasi-web.md)
