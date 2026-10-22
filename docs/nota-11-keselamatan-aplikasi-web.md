# 11 · Keselamatan Aplikasi Web (OWASP × CodeIgniter 4)

Nota topikal (rujukan merentas hari) · Kanun: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Indeks: [`README.md`](./nota.md)

## Objektif nota

- **Memetakan** setiap kategori OWASP Top 10 (2021) kepada ciri CodeIgniter 4 / Shield yang mengurangkan risikonya.
- **Menerangkan** kenapa kawalan akses mesti dikuatkuasa di server (filter + semakan pemilikan), bukan sekadar menyembunyikan butang.
- **Menggunakan** `esc()` mengikut konteks, CSRF, `$allowedFields` dan Query Builder binding dengan betul.
- **Melaksanakan** senarai semak keselamatan sebelum demo capstone.

---

## 1. Kenapa keselamatan dari hari pertama?

Sistem TLK & Pas menyimpan data kakitangan, nombor plat dan dokumen sokongan. Dalam sektor awam, satu kebocoran boleh menjejaskan kepercayaan dan melanggar dasar keselamatan maklumat. Lebih murah **membina dengan selamat** daripada menampal selepas audit. CodeIgniter 4 menyediakan banyak perlindungan terbina — tetapi hanya berkesan jika **dihidupkan dan digunakan dengan betul**.

Prinsip asas:
1. **Jangan percaya input** — semua dari pelayar (borang, query string, header, nama fail) boleh dipalsukan.
2. **Pertahanan berlapis** — filter route + semakan pemilikan + validasi model; jika satu terlepas, yang lain menahan.
3. **Keistimewaan minimum** — setiap peranan hanya dapat apa yang perlu (`AuthGroups::$matrix`).

---

## 2. OWASP Top 10 (2021) dipetakan ke CI4

| # | Kategori | Contoh risiko dalam projek | Kawalan CI4 / Shield |
|---|----------|----------------------------|----------------------|
| **A01** | Broken Access Control | Pemohon menukar URL `/pas/permohonan/7` → melihat permohonan orang lain | Filter `session`/`group:`/`permission:` pada `Routes.php` **+** semakan pemilikan (BR-PAS-04) dalam controller/service |
| **A02** | Cryptographic Failures | Kata laluan disimpan teks biasa; login melalui HTTP | Shield hash kata laluan (`password_hash`, bcrypt/argon2); `Config\App::$forceGlobalSecureRequests = true` (filter `forcehttps`); `encryption.key` dijana `php spark key:generate` |
| **A03** | Injection (SQL, XSS) | `"WHERE plate_no = '" . $q . "'"`; nama zon dengan `<script>` | Query Builder / binding `?`; `esc()` semasa output |
| **A04** | Insecure Design | Dua pelulus meluluskan slot sama serentak | BR-TLK-05: transaksi + `SELECT … FOR UPDATE`; `PassStatus::canTransitionTo()` |
| **A05** | Security Misconfiguration | Debug Toolbar & stack trace di pengeluaran; `.env` dalam Git | `CI_ENVIRONMENT = production`; `.env` dalam `.gitignore`; hanya `public/` sebagai document root; `writable/` tidak boleh dicapai web |
| **A06** | Vulnerable & Outdated Components | Dompdf/PhpSpreadsheet versi lama berlubang | `composer audit`, `composer outdated`; kemas kini berkala |
| **A07** | Identification & Authentication Failures | Serangan teka kata laluan berulang | Shield: filter `auth-rates` (had cubaan), sesi dijana semula selepas login, polisi kata laluan (`Config\Auth::$passwordValidators`) |
| **A08** | Software & Data Integrity Failures | Package dipasang tanpa kunci versi; fail muat naik disamar | Commit `composer.lock`; muat naik disemak `mime_in`/`ext_in`, nama rawak, luar `public/` |
| **A09** | Security Logging & Monitoring Failures | Tiada jejak siapa meluluskan pas | `status_logs` (BR-PAS-05) + `log_message('warning', …)` untuk percubaan akses ditolak |
| **A10** | Server-Side Request Forgery | HTML laporan memuatkan URL luar semasa jana PDF | Dompdf `isRemoteEnabled = false`; jangan `file_get_contents($urlDariPengguna)` |

---

## 3. A01 — Kawalan akses dua lapis

```php
// app/Config/Routes.php — lapis 1: siapa boleh masuk laluan ini?
$routes->group('pas/semakan', ['filter' => 'group:reviewer,approver,admin'], static function ($routes) {
    $routes->get('/', [\App\Controllers\Pas\ReviewController::class, 'index']);
});
```

```php
// app/Controllers/Pas/ApplicationController.php — lapis 2: rekod INI milik siapa?
public function show(int $id): string
{
    $app  = model(\App\Models\PassApplicationModel::class)->find($id);
    $user = auth()->user();

    $isOwner   = $app !== null && (int) $app->user_id === (int) $user->id;
    $isOfficer = $user->inGroup('reviewer', 'approver', 'admin');

    if (! $isOwner && ! $isOfficer) {
        log_message('warning', 'Akses ditolak: user {uid} cuba buka PAS id {id}', ['uid' => $user->id, 'id' => $id]);
        // 404 (bukan 403) — jangan dedahkan bahawa rekod wujud
        throw \CodeIgniter\Exceptions\PageNotFoundException::forPageNotFound();
    }

    return view('pas/show', ['app' => $app]);
}
```

**Kenapa dua lapis?** Filter `session` hanya tahu pengguna *log masuk*; ia tidak tahu rekod `id=7` milik siapa. Menyembunyikan butang "Lulus" dalam view **bukan** kawalan akses — sesiapa boleh menghantar POST terus menggunakan alat pelayar.

---

## 4. A03 — Injection

### SQL injection

```php
// ❌ BAHAYA — input bercantum terus ke SQL
$db->query("SELECT * FROM vehicles WHERE plate_no = '" . $this->request->getGet('q') . "'");

// ✅ Query Builder — nilai di-escape automatik
$db->table('vehicles')->where('plate_no', $this->request->getGet('q'))->get();

// ✅ SQL mentah (cth FOR UPDATE) — guna binding ?
$db->query('SELECT id FROM parking_slots WHERE id = ? FOR UPDATE', [$slotId]);
```

Awas: `like()`, `where()` selamat untuk **nilai**, tetapi **nama lajur** tidak boleh datang dari pengguna. Untuk susunan dinamik (`?sort=`), guna senarai putih:

```php
$allowedSort = ['start_date', 'ref_no', 'status'];
$sort = in_array($this->request->getGet('sort'), $allowedSort, true) ? $this->request->getGet('sort') : 'start_date';
```

### XSS — `esc()` ikut konteks

| Konteks | Contoh | Panggilan |
|---------|--------|-----------|
| Kandungan HTML | `<td><?= esc($b->reason) ?></td>` | `esc($x)` (lalai `'html'`) |
| Atribut HTML | `<input value="<?= esc($v, 'attr') ?>">` | `esc($x, 'attr')` |
| Dalam JavaScript | `const ref = '<?= esc($ref, 'js') ?>';` | `esc($x, 'js')` |
| Segmen URL | `<a href="/cari?q=<?= esc($q, 'url') ?>">` | `esc($x, 'url')` |
| CSS | (elakkan data pengguna dalam CSS) | `esc($x, 'css')` |

**Kenapa ikut konteks?** Aksara yang berbahaya berbeza: dalam HTML ia `<`, dalam atribut ia `"`, dalam JS ia `'` dan `</script>`. `esc()` yang salah konteks mungkin tidak melindungi.

---

## 5. CSRF — Cross-Site Request Forgery

Tanpa CSRF, laman jahat boleh membuat pelayar pelulus (yang sedang log masuk) menghantar POST `/tlk/keputusan/…/approve` tanpa disedari.

```php
// app/Config/Filters.php — dihidupkan secara global (docs/kolaborasi.md §5)
public array $globals = [
    'before' => [
        'csrf',
    ],
    'after' => [
        'secureheaders',   // X-Frame-Options, X-Content-Type-Options, dll.
    ],
];
```

```php
<!-- Dalam borang: form_open() menambah token secara automatik -->
<?= form_open('tlk/tempahan') ?>
<!-- atau secara manual jika guna <form> biasa -->
<?= csrf_field() ?>
```

```js
// fetch() POST — hantar token dalam header
fetch(url, { method: 'POST', headers: { '<?= csrf_header() ?>': '<?= csrf_hash() ?>' }, body: data });
```

> ⚠️ **Amaran:** CSRF hanya melindungi POST/PUT/PATCH/DELETE. Oleh itu **jangan** buat tindakan yang mengubah data melalui GET (cth `GET /tlk/tempahan/5/cancel`).

---

## 6. Mass assignment — `$allowedFields`

```php
// app/Models/PassApplicationModel.php
protected $allowedFields = [
    'ref_no', 'user_id', 'pass_type', 'vehicle_id', 'purpose', 'valid_from', 'valid_until', 'status',
];
```

Walaupun `status` dibenarkan dalam model (service perlu menukarnya), **controller jangan** menghantar `$this->request->getPost()` mentah ke `insert()`. Pilih medan secara eksplisit:

```php
$data = $this->request->getPost(['pass_type', 'vehicle_id', 'purpose', 'valid_from', 'valid_until']);
$data['user_id'] = auth()->id();   // dari sesi, BUKAN dari borang
// status ditetapkan oleh service = PassStatus::Submitted->value
```

**Kenapa?** Penyerang boleh menambah `<input name="status" value="approved">` dalam DevTools.

---

## 7. Konfigurasi selamat (A05)

```ini
# .env pengeluaran (contoh — JANGAN commit)
CI_ENVIRONMENT = production
app.baseURL = 'https://tlk.latihan.test/'
app.forceGlobalSecureRequests = true
encryption.key = hex2bin:...           # php spark key:generate
cookie.secure   = true
cookie.httponly = true
cookie.samesite = 'Lax'
```

- `CI_ENVIRONMENT = production` → mesej ralat generik, Debug Toolbar mati.
- Document root web server **mesti** `public/` — supaya `app/`, `.env`, `writable/` tidak boleh dicapai.
- Content Security Policy: `Config\App::$CSPEnabled = true` kemudian tetapkan sumber dalam `app/Config/ContentSecurityPolicy.php` (cth `scriptSrc = 'self'` — sebab itu Chart.js disimpan setempat).
- Kebenaran fail: `writable/` boleh ditulis oleh web server; kod lain baca-sahaja.

---

## 8. A07 — Pengesahan dengan Shield

```php
// app/Config/Filters.php — hadkan kadar cubaan pada laluan auth
public array $filters = [
    'auth-rates' => [
        'before' => ['login*', 'register', 'auth/*'],
    ],
];
```

Shield juga menjana semula ID sesi selepas login (menghalang *session fixation*) dan menyemak kekuatan kata laluan melalui `Config\Auth::$passwordValidators` (termasuk semakan kata laluan lazim). Jangan tulis sistem login sendiri.

---

## 9. A06 & A08 — Kebergantungan

```bash
composer audit          # semak kelemahan diketahui dalam pakej terpasang
composer outdated -D    # pakej langsung yang ada versi baharu
```

Commit `composer.lock` supaya semua laptop dan server memasang versi **tepat** yang sama.

---

## 10. A09 — Log & jejak audit

- Setiap peralihan status → baris `status_logs` (`module`, `record_id`, `from_status`, `to_status`, `actor_id`, `remarks`).
- Percubaan akses ditolak → `log_message('warning', …)` (fail dalam `writable/logs/`).
- **Jangan** log kata laluan, token, atau kandungan dokumen.

---

## ⚠️ Kesilapan lazim

| Kesilapan | Akibat | Betulkan |
|-----------|--------|----------|
| Sembunyi butang sahaja, tiada filter/semakan pemilikan | Pengguna buka rekod orang lain melalui URL (A01) | Filter route + semakan pemilikan dalam controller/service |
| `<?= $b->reason ?>` tanpa `esc()` | XSS disimpan (stored XSS) | `<?= esc($b->reason) ?>` |
| SQL dicantum dengan input | SQL injection | Query Builder / binding `?` |
| `insert($this->request->getPost())` | Mass assignment — `status`/`user_id` dipalsukan | `getPost([...medan dibenarkan])` + `user_id` dari `auth()->id()` |
| Tindakan ubah data melalui GET | Tidak dilindungi CSRF; boleh dicetus oleh `<img src>` | Guna POST + `csrf_field()` |
| `CI_ENVIRONMENT = development` di server | Stack trace & path fail terdedah | `production` di server |
| `.env` di-commit | Kata laluan DB/kunci bocor | `.gitignore` + tukar (rotate) rahsia — lihat [nota 12](./nota-12-git-aliran-kerja.md) |
| Fail muat naik dalam `public/` | Skrip boleh dilaksana/dimuat turun tanpa semakan | `writable/uploads/pas/` + muat turun melalui controller |

---

## ✅ Senarai semak keselamatan sebelum demo (Hari 10)

- [ ] Setiap route dalam `php spark routes` ada filter yang betul (bandingkan dengan SPEC §6).
- [ ] Pemohon A **tidak** boleh buka `/pas/permohonan/{id}` milik pemohon B (diuji manual + PHPUnit).
- [ ] Pemohon tidak boleh buka `/pas/semakan`, `/tlk/keputusan`, `/admin/slot`, `/laporan/*`, `/statistik`.
- [ ] Semua output data pengguna dalam view melalui `esc()` (cari `<?= $` tanpa `esc`).
- [ ] Tiada `->query(` dengan cantuman string input (`grep -rn "query(" app/`).
- [ ] CSRF ada dalam `globals.before`; semua borang guna `form_open()`/`csrf_field()`.
- [ ] Controller tidak menghantar `getPost()` mentah ke `insert()`/`update()`.
- [ ] Fail muat naik dalam `writable/uploads/pas/`, nama rawak, disemak `ext_in`/`mime_in`/`max_size`.
- [ ] Dompdf `isRemoteEnabled = false`.
- [ ] `.env` tidak pernah di-commit (`git log --all -- .env` kosong).
- [ ] `composer audit` tiada kelemahan kritikal.
- [ ] Data sintetik sahaja (`@latihan.test`, plat `WXX 1234` rekaan).

---

## Rujukan rasmi

- OWASP Top 10 (2021): <https://owasp.org/Top10/>
- OWASP Cheat Sheet Series: <https://cheatsheetseries.owasp.org/>
- CodeIgniter 4 — Security guidelines: <https://codeigniter.com/user_guide/concepts/security.html>
- CodeIgniter 4 — Security (CSRF): <https://codeigniter.com/user_guide/libraries/security.html>
- CodeIgniter 4 — `esc()` & fungsi global: <https://codeigniter.com/user_guide/general/common_functions.html>
- CodeIgniter 4 — Content Security Policy: <https://codeigniter.com/user_guide/outgoing/csp.html>
- CodeIgniter 4 — Controller Filters (`secureheaders`, `forcehttps`): <https://codeigniter.com/user_guide/incoming/filters.html>
- CodeIgniter Shield — Authorization: <https://shield.codeigniter.com/latest/references/authorization/> · Authentication: <https://shield.codeigniter.com/latest/references/authentication/authentication/>
- Composer `audit`: <https://getcomposer.org/doc/03-cli.md#audit>

## Bacaan buku — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), edisi 2021 (CodeIgniter 4.1). `hlm.` = nombor halaman yang tercetak di kaki halaman buku.

- `esc()` terhadap XSS — hlm. 32–33
- Validasi input — hlm. 62–63
- Had kadar dengan filter `Throttle` — hlm. 94–96
- Alias filter `csrf` dalam `Filters.php` — hlm. 95

Buku tidak membincangkan OWASP Top 10; senarai semak pra-demo ikut nota ini.

---
**Digunakan pada Hari 4, 7, 8 dan 10** — merentas kursus: Hari 4 S2 (`.env`, CSRF, Shield), Hari 7 S3 (muat naik selamat), Hari 8 S2 (RBAC & pemilikan), Hari 10 S3 (senarai semak sebelum demo). Nota berkaitan: [04 · Validasi & Borang](./nota-04-validasi-dan-borang.md) · [06 · Shield Auth & RBAC](./nota-06-shield-auth-dan-rbac.md) · [07 · Muat Naik Fail Selamat](./nota-07-muat-naik-fail-selamat.md)
