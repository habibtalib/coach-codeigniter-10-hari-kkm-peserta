# Lab Hari 8 — Modul Pas (2): Aliran Kelulusan, RBAC & Ujian Akses

[📅 Jadual](../JADUAL.md) · [📘 Kanun SPEC](../docs/spesifikasi-sistem.md) · [📖 Nota Hari 8](./README.md)

> Bekerja **berpasangan** (tukar driver/navigator setiap sesi). Semua arahan dari **akar projek CI4**. Rujukan jurulatih: `templates/kod/` (modul **Templat & Rujukan**) — salin **hanya** selepas anda boleh menerangkan setiap baris (KOLABORASI §3).

| Lab | Sesi | Masa | Hasil |
|-----|------|------|-------|
| 8.0 | Awal S1 | 10 min | Branch + data demo + 3 akaun peranan disahkan |
| 8.1 | S1 | 09:10–10:30 | Service peralihan + `ReviewController` + baris gilir + panel tindakan |
| 8.2 | S2 | 10:45–12:30 | `AuthGroups`, filter `permission:`, `authorize()`, 403 |
| 8.3 | S3 | 14:30–16:00 | Garis masa `status_logs` + `PassAccessTest` hijau |
| 8.4 | S4 | 16:00–17:00 | Demo 3 peranan, DoD, gabung ke `main` · ⭐ `pas:expire` |

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

1. **Tambah kaedah Hari 8 dalam `app/Services/PassWorkflowService.php`** dari `PassWorkflowService.php.txt` (modul **Templat & Rujukan**):
   - pemalar `REMARKS_MIN = 10`
   - `startReview()`, `approve()`, `reject()`, `history()`
   - `transition()` (peribadi)
   - `use CodeIgniter\I18n\Time; use DomainException;`

   **Untuk lab ini, JANGAN salin baris `$this->authorize(...)`** dalam ketiga-tiga kaedah awam (atau komen-kan). Kita akan menambahnya dalam Lab 8.2 selepas melihat sendiri kenapa ia perlu.

2. Sebelum meneruskan, navigator menerangkan kepada driver (lisan, 2 minit): *"Kenapa status dibaca SELEPAS `FOR UPDATE`, dan apa berlaku jika `record()` memulangkan `false`?"*

3. **Cipta `app/Controllers/Pas/ReviewController.php`** dari `ReviewController.php.txt` (modul **Templat & Rujukan**): `index()`, `review()`, `approve()`, `reject()`, `act()`, `defaultQueue()`.

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

7. **Tambah panel tindakan dalam `app/Views/pas/show.php`** — gantikan komen `/* Hari 8: … */` dengan:

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
   - `pelulus`: `/pas/semakan` → buka A → **Lulus** dengan catatan "Dokumen lengkap."
   - `penyemak`: permohonan B → **Mula Semakan** → **Tolak** dengan catatan "tak ok" (dijangka ralat), kemudian "Salinan kad kuasa tidak jelas." (dijangka berjaya).
   - `pelulus`: kembali ke tab A yang **lama** (sebelum dimuat semula) dan klik **Lulus** sekali lagi.

9. Semak DB:

   ```sql
   SELECT id, ref_no, status, reviewed_by, reviewed_at, approved_by, approved_at FROM pass_applications ORDER BY id;
   SELECT record_id, from_status, to_status, actor_id, remarks, created_at FROM status_logs WHERE module = 'PAS' ORDER BY id;
   ```

### ✅ Checkpoint 8.1
- [ ] Permohonan A: `approved`, `reviewed_by` = id penyemak, `approved_by` = id pelulus, kedua-dua cap masa diisi.
- [ ] `status_logs` untuk A: 3 baris (`NULL→submitted`, `submitted→under_review`, `under_review→approved`).
- [ ] Tolak "tak ok" → mesej "Catatan penolakan mestilah sekurang-kurangnya 10 aksara." dan status B kekal `under_review`.
- [ ] Klik **Lulus** kali kedua → "Peralihan status "Diluluskan" → "Diluluskan" tidak dibenarkan." dan **tiada** baris log tambahan.
- [ ] `pemohon1` membuka `/pas/semakan` → ditolak (redirect dengan mesej).
- [ ] Commit: `git add app/ && git commit -m "PAS: aliran semak/lulus/tolak melalui PassWorkflowService"`

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `The action you requested is not allowed.` | Borang tanpa token CSRF (HTML `<form>` biasa) | Guna `form_open()` — ia menambah `csrf_field()` automatik |
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

2. **Semak `app/Config/AuthGroups.php`** terhadap SPEC §4 dan `AuthGroups.php.txt` (modul **Templat & Rujukan**): 4 groups, 8 permissions, `$matrix` tepat. `$defaultGroup = 'applicant'`.

3. **Tambah filter `permission:` per route** dalam `app/Config/Routes.php` (bandingkan dengan `Routes-pas.php.txt` (modul **Templat & Rujukan**)):

   ```php
   // pas/permohonan
   $routes->get('new', 'ApplicationController::new', ['as' => 'pas.new', 'filter' => 'permission:pas.apply']);
   $routes->post('/', 'ApplicationController::create', ['as' => 'pas.create', 'filter' => 'permission:pas.apply']);

   // pas/semakan
   $routes->post('(:num)/review', 'ReviewController::review/$1', ['as' => 'pas.review', 'filter' => 'permission:pas.review']);
   $routes->post('(:num)/approve', 'ReviewController::approve/$1', ['as' => 'pas.approve', 'filter' => 'permission:pas.approve']);
   $routes->post('(:num)/reject', 'ReviewController::reject/$1', ['as' => 'pas.reject', 'filter' => 'permission:pas.review,pas.approve']);
   ```

4. **Sahkan gabungan filter:**

   ```bash
   php spark routes | grep pas/      # PowerShell: php spark routes | Select-String "pas/"
   ```

   Lajur *Before Filters* untuk `pas/semakan/([0-9]+)/approve` mesti mengandungi **kedua-dua** `group:reviewer,approver,admin` dan `permission:pas.approve` (CI 4.5.4+ menggabungkan filter kumpulan & route). `csrf` turut tersenarai kerana ia filter global.

5. **Tambah `authorize()` dalam Service** — nyah-komen/salin baris `$this->authorize(...)` dalam `startReview()`, `approve()`, `reject()` dan kaedah peribadi `authorize()`. Tambah `use CodeIgniter\Shield\Exceptions\PermissionException;`.

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
- [ ] `php spark routes` menunjukkan filter gabungan pada ketiga-tiga route POST semakan.
- [ ] UT-PAS-20 (selepas) — penyemak tidak boleh meluluskan melalui DevTools/curl; status kekal.
- [ ] Langkah 8 — tanpa filter route, Service memulangkan **403**; filter sudah dipulihkan.
- [ ] UT-PAS-21 hingga 26 lulus.
- [ ] Setiap ahli boleh menerangkan: *filter route vs `authorize()` vs `canView()` — apa yang setiap satu lindungi*.
- [ ] Commit: `git add app/ docs/ && git commit -m "PAS: RBAC Shield — permission per tindakan + authorize() dalam Service"`

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

1. **Cipta `app/Views/partials/status_timeline.php`** dari `status-timeline-view.php.txt` (modul **Templat & Rujukan**).

2. **Paparkan dalam `app/Views/pas/show.php`** — selepas panel tindakan, sebelum pautan "Kembali":

   ```php
   <?= view('partials/status_timeline', ['history' => $history, 'enum' => \App\Enums\PassStatus::class]) ?>
   ```

3. Buka permohonan A (diluluskan) dan B (ditolak). Sahkan garis masa: badge, nama pegawai, masa, catatan.

4. **Sediakan ujian:**

   ```bash
   mkdir -p tests/feature/Pas
   ```

   Salin `PassAccessTest.php.txt` (modul **Templat & Rujukan**) ke `tests/feature/Pas/PassAccessTest.php`. **Baca setiap ujian** bersama pasangan dan tanda dalam jadual README §3.2 sel matriks mana yang diliputi.

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

7. **Tambah satu ujian sendiri** (pilih satu): *admin boleh meluluskan* · *pelulus boleh menolak dengan catatan* · *pemohon tidak boleh memuat turun dokumen orang lain* (sisipkan baris `pass_documents` terus melalui `$this->db->table(...)`).

### ✅ Checkpoint 8.3
- [ ] Garis masa dipapar dengan 3 entri untuk A, termasuk catatan kelulusan.
- [ ] `composer test -- tests/feature/Pas` → semua hijau (13 + ujian anda).
- [ ] Jadual mutasi (langkah 6) diisi — setiap mutasi menyebabkan sekurang-kurangnya satu ujian gagal.
- [ ] Commit: `git add app/ tests/ && git commit -m "PAS: garis masa status_logs + ujian akses peranan"`

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

1. **Latih skrip demo** (README §4.1) dua kali — sekali setiap ahli sebagai pembentang. Sediakan tiga tetingkap pelayar lebih awal (log masuk `pemohon1`, `penyemak`, `pelulus`) dan satu terminal.

2. **Demo kepada pasangan jiran** (5 minit). Pasangan jiran memegang **senarai semak DoD** (README §4.2) dan menandakan setiap item yang dibuktikan semasa demo. Tukar peranan.

3. **Gabung ke `main`:**

   ```bash
   composer test                             # SEMUA ujian (TLK + Pas) hijau
   git switch main && git pull
   git merge --no-ff feat/pas-kelulusan -m "PAS: M2 siap — aliran kelulusan, RBAC, status_logs, ujian"
   git push
   ```

4. **⭐ Pilihan — `php spark pas:expire`:**
   1. Salin `ExpirePassesCommand.php.txt` (modul **Templat & Rujukan**) ke `app/Commands/ExpirePassesCommand.php`.
   2. `php spark list | grep pas` → `pas:expire` tersenarai di bawah kumpulan **Pas**.
   3. Sediakan data: `UPDATE pass_applications SET valid_until = CURDATE() - INTERVAL 1 DAY WHERE id = <id A>;`
   4. Buka senarai `pemohon1` — badge sudah **Tamat Tempoh** (dari `displayStatus()`), walaupun DB masih `approved`.
   5. `php spark pas:expire --dry-run` → senarai ID, tiada perubahan.
   6. `php spark pas:expire` → `✔ PAS-2026-000N → Tamat Tempoh`; semak `status_logs` ada `approved → expired`.
   7. Jalankan sekali lagi → "Tiada pas untuk ditamatkan".

### ✅ Checkpoint 8.4
- [ ] Demo 5 minit lulus semua item DoD (ditandatangani pasangan jiran).
- [ ] `main` mengandungi M1 + M2; `composer test` hijau pada `main`.
- [ ] ⭐ `pas:expire` menukar pas tamat tempoh dengan log.

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

## Semakan kendiri — akhir hari

```bash
git log --oneline -6
php spark routes | grep pas/              # 9 laluan Pas; semakan dengan permission:
composer test -- --testdox | tail -20   # semua hijau
```

Pasangan yang ketinggalan: gunakan `templates/kod/` (modul **Templat & Rujukan**) mengikut pelan kejar dalam nota penceramah — tetapi **Lab 8.2 langkah 1 (serangan DevTools)** wajib dibuat sendiri: itu pelajaran utama hari ini.
