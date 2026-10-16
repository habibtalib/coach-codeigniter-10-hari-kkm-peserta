# 11 · Web Application Security (OWASP × CodeIgniter 4)

> Topical notes (cross-day reference) · Canon: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Index: [`README.md`](./nota.md)

## Note objectives

- **Map** each OWASP Top 10 (2021) category to the CodeIgniter 4 / Shield features that reduce its risk.
- **Explain** why access control must be enforced on the server (filters + ownership checks), not just by hiding buttons.
- **Use** context-aware `esc()`, CSRF, `$allowedFields` and Query Builder binding correctly.
- **Carry out** the security checklist before the capstone demo.

---

## 1. Why security from day one?

The TLK (Special Vehicle Parking) & Pass system stores staff data, plate numbers and supporting documents. In the public sector, a single leak can damage trust and breach information security policy. It is cheaper to **build securely** than to patch after an audit. CodeIgniter 4 provides many built-in protections — but they only work if they are **switched on and used correctly**.

Basic principles:
1. **Don't trust input** — everything from the browser (forms, query string, headers, file names) can be forged.
2. **Defence in depth** — route filters + ownership checks + model validation; if one slips, the others hold.
3. **Least privilege** — each role only gets what it needs (`AuthGroups::$matrix`).

---

## 2. OWASP Top 10 (2021) mapped to CI4

| # | Category | Example risk in the project | CI4 / Shield control |
|---|----------|----------------------------|----------------------|
| **A01** | Broken Access Control | An applicant changes the URL `/pas/permohonan/7` → sees someone else's application | `session`/`group:`/`permission:` filters in `Routes.php` **+** ownership check (BR-PAS-04) in the controller/service |
| **A02** | Cryptographic Failures | Passwords stored as plain text; login over HTTP | Shield hashes passwords (`password_hash`, bcrypt/argon2); `Config\App::$forceGlobalSecureRequests = true` (`forcehttps` filter); `encryption.key` generated with `php spark key:generate` |
| **A03** | Injection (SQL, XSS) | `"WHERE plate_no = '" . $q . "'"`; a zone name containing `<script>` | Query Builder / `?` binding; `esc()` on output |
| **A04** | Insecure Design | Two approvers approve the same slot at the same time | BR-TLK-05: transaction + `SELECT … FOR UPDATE`; `PassStatus::canTransitionTo()` |
| **A05** | Security Misconfiguration | Debug Toolbar & stack traces in production; `.env` in Git | `CI_ENVIRONMENT = production`; `.env` in `.gitignore`; only `public/` as the document root; `writable/` not reachable from the web |
| **A06** | Vulnerable & Outdated Components | Old Dompdf/PhpSpreadsheet versions with known holes | `composer audit`, `composer outdated`; regular updates |
| **A07** | Identification & Authentication Failures | Repeated password-guessing attacks | Shield: `auth-rates` filter (attempt limit), session regenerated after login, password policy (`Config\Auth::$passwordValidators`) |
| **A08** | Software & Data Integrity Failures | Packages installed without version locking; disguised upload files | Commit `composer.lock`; uploads checked with `mime_in`/`ext_in`, random names, outside `public/` |
| **A09** | Security Logging & Monitoring Failures | No trace of who approved a pass | `status_logs` (BR-PAS-05) + `log_message('warning', …)` for denied access attempts |
| **A10** | Server-Side Request Forgery | Report HTML loads external URLs while generating the PDF | Dompdf `isRemoteEnabled = false`; never `file_get_contents($urlDariPengguna)` |

---

## 3. A01 — Two-layer access control

```php
// app/Config/Routes.php — layer 1: who may enter this route?
$routes->group('pas/semakan', ['filter' => 'group:reviewer,approver,admin'], static function ($routes) {
    $routes->get('/', [\App\Controllers\Pas\ReviewController::class, 'index']);
});
```

```php
// app/Controllers/Pas/ApplicationController.php — layer 2: who owns THIS record?
public function show(int $id): string
{
    $app  = model(\App\Models\PassApplicationModel::class)->find($id);
    $user = auth()->user();

    $isOwner   = $app !== null && (int) $app->user_id === (int) $user->id;
    $isOfficer = $user->inGroup('reviewer', 'approver', 'admin');

    if (! $isOwner && ! $isOfficer) {
        log_message('warning', 'Akses ditolak: user {uid} cuba buka PAS id {id}', ['uid' => $user->id, 'id' => $id]);
        // 404 (not 403) — don't reveal that the record exists
        throw \CodeIgniter\Exceptions\PageNotFoundException::forPageNotFound();
    }

    return view('pas/show', ['app' => $app]);
}
```

**Why two layers?** The `session` filter only knows the user is *logged in*; it doesn't know who owns record `id=7`. Hiding the "Approve" button in the view is **not** access control — anyone can send a POST directly using browser tools.

---

## 4. A03 — Injection

### SQL injection

```php
// ❌ DANGER — input concatenated straight into SQL
$db->query("SELECT * FROM vehicles WHERE plate_no = '" . $this->request->getGet('q') . "'");

// ✅ Query Builder — values escaped automatically
$db->table('vehicles')->where('plate_no', $this->request->getGet('q'))->get();

// ✅ Raw SQL (e.g. FOR UPDATE) — use ? binding
$db->query('SELECT id FROM parking_slots WHERE id = ? FOR UPDATE', [$slotId]);
```

Careful: `like()` and `where()` are safe for **values**, but **column names** must not come from the user. For dynamic sorting (`?sort=`), use an allowlist:

```php
$allowedSort = ['start_date', 'ref_no', 'status'];
$sort = in_array($this->request->getGet('sort'), $allowedSort, true) ? $this->request->getGet('sort') : 'start_date';
```

### XSS — context-aware `esc()`

| Context | Example | Call |
|---------|--------|-----------|
| HTML content | `<td><?= esc($b->reason) ?></td>` | `esc($x)` (default `'html'`) |
| HTML attribute | `<input value="<?= esc($v, 'attr') ?>">` | `esc($x, 'attr')` |
| Inside JavaScript | `const ref = '<?= esc($ref, 'js') ?>';` | `esc($x, 'js')` |
| URL segment | `<a href="/cari?q=<?= esc($q, 'url') ?>">` | `esc($x, 'url')` |
| CSS | (avoid user data in CSS) | `esc($x, 'css')` |

**Why by context?** The dangerous characters differ: in HTML it is `<`, in an attribute it is `"`, in JS it is `'` and `</script>`. `esc()` with the wrong context may not protect you.

---

## 5. CSRF — Cross-Site Request Forgery

Without CSRF, a malicious site can make the browser of an approver (who is logged in) send a POST to `/tlk/keputusan/…/approve` without them noticing.

```php
// app/Config/Filters.php — enabled globally (docs/kolaborasi.md §5)
public array $globals = [
    'before' => [
        'csrf',
    ],
    'after' => [
        'secureheaders',   // X-Frame-Options, X-Content-Type-Options, etc.
    ],
];
```

```php
<!-- In a form: form_open() adds the token automatically -->
<?= form_open('tlk/tempahan') ?>
<!-- or manually if you use a plain <form> -->
<?= csrf_field() ?>
```

```js
// fetch() POST — send the token in a header
fetch(url, { method: 'POST', headers: { '<?= csrf_header() ?>': '<?= csrf_hash() ?>' }, body: data });
```

> CSRF only protects POST/PUT/PATCH/DELETE. So **don't** perform actions that change data through GET (e.g. `GET /tlk/tempahan/5/cancel`).

---

## 6. Mass assignment — `$allowedFields`

```php
// app/Models/PassApplicationModel.php
protected $allowedFields = [
    'ref_no', 'user_id', 'pass_type', 'vehicle_id', 'purpose', 'valid_from', 'valid_until', 'status',
];
```

Even though `status` is allowed in the model (the service needs to change it), the **controller must not** pass the raw `$this->request->getPost()` to `insert()`. Pick the fields explicitly:

```php
$data = $this->request->getPost(['pass_type', 'vehicle_id', 'purpose', 'valid_from', 'valid_until']);
$data['user_id'] = auth()->id();   // from the session, NOT from the form
// status is set by the service = PassStatus::Submitted->value
```

**Why?** An attacker can add `<input name="status" value="approved">` in DevTools.

---

## 7. Secure configuration (A05)

```ini
# production .env (example — DO NOT commit)
CI_ENVIRONMENT = production
app.baseURL = 'https://tlk.latihan.test/'
app.forceGlobalSecureRequests = true
encryption.key = hex2bin:...           # php spark key:generate
cookie.secure   = true
cookie.httponly = true
cookie.samesite = 'Lax'
```

- `CI_ENVIRONMENT = production` → generic error messages, Debug Toolbar off.
- The web server document root **must** be `public/` — so that `app/`, `.env` and `writable/` cannot be reached.
- Content Security Policy: `Config\App::$CSPEnabled = true`, then set the sources in `app/Config/ContentSecurityPolicy.php` (e.g. `scriptSrc = 'self'` — that is why Chart.js is stored locally).
- File permissions: `writable/` is writable by the web server; all other code is read-only.

---

## 8. A07 — Authentication with Shield

```php
// app/Config/Filters.php — limit the attempt rate on auth routes
public array $filters = [
    'auth-rates' => [
        'before' => ['login*', 'register', 'auth/*'],
    ],
];
```

Shield also regenerates the session ID after login (preventing *session fixation*) and checks password strength through `Config\Auth::$passwordValidators` (including a check against common passwords). Don't write your own login system.

---

## 9. A06 & A08 — Dependencies

```bash
composer audit          # check for known vulnerabilities in installed packages
composer outdated -D    # direct packages that have a newer version
```

Commit `composer.lock` so that every pair and every server installs **exactly** the same versions.

---

## 10. A09 — Logs & audit trail

- Every status transition → a `status_logs` row (`module`, `record_id`, `from_status`, `to_status`, `actor_id`, `remarks`).
- Denied access attempts → `log_message('warning', …)` (files in `writable/logs/`).
- **Don't** log passwords, tokens or document contents.

---

## ⚠️ Common mistakes

| Mistake | Consequence | Fix |
|-----------|--------|----------|
| Only hiding buttons, no filter/ownership check | Users open other people's records through the URL (A01) | Route filter + ownership check in the controller/service |
| `<?= $b->reason ?>` without `esc()` | Stored XSS | `<?= esc($b->reason) ?>` |
| SQL concatenated with input | SQL injection | Query Builder / `?` binding |
| `insert($this->request->getPost())` | Mass assignment — `status`/`user_id` forged | `getPost([...medan dibenarkan])` + `user_id` from `auth()->id()` |
| Data-changing actions through GET | Not protected by CSRF; can be triggered by `<img src>` | Use POST + `csrf_field()` |
| `CI_ENVIRONMENT = development` on the server | Stack traces & file paths exposed | `production` on the server |
| `.env` committed | DB password/keys leaked | `.gitignore` + rotate the secrets — see [note 12](./nota-12-git-aliran-kerja.md) |
| Upload files in `public/` | Scripts can be executed/downloaded without checks | `writable/uploads/pas/` + download through a controller |

---

## ✅ Security checklist before the demo (Day 10)

- [ ] Every route in `php spark routes` has the correct filter (compare with SPEC §6).
- [ ] Applicant A **cannot** open applicant B's `/pas/permohonan/{id}` (tested manually + PHPUnit).
- [ ] An applicant cannot open `/pas/semakan`, `/tlk/keputusan`, `/admin/slot`, `/laporan/*`, `/statistik`.
- [ ] All user data output in views goes through `esc()` (search for `<?= $` without `esc`).
- [ ] No `->query(` with string concatenation of input (`grep -rn "query(" app/`).
- [ ] CSRF is in `globals.before`; all forms use `form_open()`/`csrf_field()`.
- [ ] Controllers don't pass the raw `getPost()` to `insert()`/`update()`.
- [ ] Upload files are in `writable/uploads/pas/`, with random names, checked with `ext_in`/`mime_in`/`max_size`.
- [ ] Dompdf `isRemoteEnabled = false`.
- [ ] `.env` has never been committed (`git log --all -- .env` is empty).
- [ ] `composer audit` shows no critical vulnerabilities.
- [ ] Synthetic data only (`@latihan.test`, made-up `WXX 1234` plates).

---

## Official references

- OWASP Top 10 (2021): <https://owasp.org/Top10/>
- OWASP Cheat Sheet Series: <https://cheatsheetseries.owasp.org/>
- CodeIgniter 4 — Security guidelines: <https://codeigniter.com/user_guide/concepts/security.html>
- CodeIgniter 4 — Security (CSRF): <https://codeigniter.com/user_guide/libraries/security.html>
- CodeIgniter 4 — `esc()` & global functions: <https://codeigniter.com/user_guide/general/common_functions.html>
- CodeIgniter 4 — Content Security Policy: <https://codeigniter.com/user_guide/outgoing/csp.html>
- CodeIgniter 4 — Controller Filters (`secureheaders`, `forcehttps`): <https://codeigniter.com/user_guide/incoming/filters.html>
- CodeIgniter Shield — Authorization: <https://shield.codeigniter.com/latest/references/authorization/> · Authentication: <https://shield.codeigniter.com/latest/references/authentication/authentication/>
- Composer `audit`: <https://getcomposer.org/doc/03-cli.md#audit>

## Book reading — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), 2021 edition (CodeIgniter 4.1). `p.` = the page number printed at the foot of the book page.

- `esc()` against XSS — p. 32–33
- Input validation — p. 62–63
- Rate limiting with the `Throttle` filter — p. 94–96
- `csrf` filter alias in `Filters.php` — p. 95

The book does not cover the OWASP Top 10; the pre-demo checklist follows this note.

---
**Used on Days 4, 7, 8 and 10** — across the course: Day 4 S2 (`.env`, CSRF, Shield), Day 7 S3 (secure uploads), Day 8 S2 (RBAC & ownership), Day 10 S3 (checklist before the demo). Related notes: [04 · Validation & Forms](./nota-04-validasi-dan-borang.md) · [06 · Shield Auth & RBAC](./nota-06-shield-auth-dan-rbac.md) · [07 · Secure File Uploads](./nota-07-muat-naik-fail-selamat.md)
