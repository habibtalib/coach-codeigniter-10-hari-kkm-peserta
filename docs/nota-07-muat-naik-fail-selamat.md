# 07 · Muat Naik Fail Selamat

Nota topikal (rujukan merentas hari) · Kanun: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Indeks: [`README.md`](./nota.md)

## Objektif nota

- **Menyenaraikan** risiko utama muat naik fail menurut OWASP dan kawalan yang menanganinya.
- **Menulis** rules validasi CI4 untuk BR-PAS-02 (`pdf`/`jpg`/`png`, ≤ 2 MB, ≤ 3 fail).
- **Menggunakan** API `UploadedFile` untuk menyimpan fail dengan nama rawak di `writable/uploads/pas/` dan merekod metadata dalam `pass_documents`.
- **Membina** route muat turun yang menyemak pemilikan sebelum menghantar fail.

---

## 1. Kenapa muat naik fail berbahaya?

Borang muat naik membenarkan pengguna **meletakkan fail pada server kita**. Itu satu keistimewaan besar. Risiko utama (OWASP File Upload Cheat Sheet):

| Risiko | Contoh serangan | Kawalan dalam kursus |
|--------|-----------------|----------------------|
| Pelaksanaan kod jauh (RCE) | Muat naik `shell.php` ke `public/` lalu buka `https://…/uploads/shell.php` | Simpan di **`writable/`** (di luar web root) |
| Penyamaran jenis | `shell.php` dinamakan semula `surat.pdf` | Semak **kandungan** (`mime_in` guna finfo) + extension |
| Path traversal / tulis ganti | Nama fail `../../app/Config/App.php` | **Jangan** guna nama asal; `getRandomName()` |
| Denial of service | Fail 2 GB atau 500 fail | `max_size`, bilangan maksimum 3, had `php.ini` |
| XSS melalui fail | SVG/HTML berisi `<script>` dibuka dalam pelayar | Senarai putih `pdf`,`jpg`,`png` sahaja; `Content-Disposition: attachment` |
| Kebocoran data | Pengguna meneka URL dokumen orang lain | Muat turun melalui controller + semakan pemilikan (BR-PAS-04) |

**Prinsip:** senarai **putih** (benarkan yang diketahui selamat), bukan senarai hitam (sekat `.php`, `.exe`…) — senarai hitam sentiasa tertinggal sesuatu (`.phtml`, `.phar`, `.php5`).

---

## 2. Peraturan BR-PAS-02 (SPEC)

- Jenis: `pdf`, `jpg`, `png` **sahaja**.
- Saiz: maksimum **2 MB** setiap fail.
- Bilangan: maksimum **3** fail setiap permohonan.
- Lokasi: `writable/uploads/pas/`, nama rawak `$file->getRandomName()`.
- DB (`pass_documents`) menyimpan **path + metadata sahaja** — bukan kandungan fail (BLOB).

---

## 3. Borang HTML

```php
<?= form_open_multipart('pas/permohonan') ?>   <!-- enctype="multipart/form-data" + CSRF automatik -->
    <div class="mb-3">
        <label for="documents" class="form-label">Dokumen sokongan (PDF/JPG/PNG, maks 2 MB, maks 3 fail)</label>
        <input type="file" class="form-control" id="documents" name="documents[]" multiple
               accept=".pdf,.jpg,.jpeg,.png">
        <?= validation_show_error('documents') ?>
    </div>
    <button class="btn btn-primary">Hantar</button>
<?= form_close() ?>
```

`accept=` hanya **memudahkan pengguna** memilih fail; ia tidak menghalang penyerang. Semua semakan sebenar di server.

---

## 4. Validasi di pelayan

```php
$rules = [
    'documents' => [
        'label' => 'Dokumen sokongan',
        'rules' => 'uploaded[documents]'
            . '|max_size[documents,2048]'                                   // KB → 2 MB
            . '|ext_in[documents,pdf,jpg,png]'
            . '|mime_in[documents,application/pdf,image/jpeg,image/png]',   // dari kandungan (finfo)
    ],
];

if (! $this->validate($rules)) {
    return redirect()->back()->withInput();
}
```

Rules fail CI4 memeriksa **setiap** fail dalam `documents[]`. Tiga perkara yang **rules tidak buat**, jadi kita semak sendiri dalam Service:

1. **Bilangan fail** (maks 3) — tiada rule terbina.
2. **Konsistensi extension ↔ kandungan** — `guessExtension()` (dari MIME sebenar) mesti dalam senarai putih.
3. **Fail yang gagal dimuat naik** oleh PHP (cth melebihi `upload_max_filesize`) — `isValid()`.

> ⚠️ **Amaran:** `ext_in` membaca extension dari nama klien; `mime_in` menggunakan `getMimeType()` yang **mengesan jenis dari kandungan** melalui PHP extension `fileinfo`. Kedua-duanya diperlukan. Pastikan `fileinfo` dihidupkan (lihat [`docs/persediaan.md`](persediaan.md)).

---

## 5. API `UploadedFile` — yang boleh dipercayai & yang tidak

| Kaedah | Sumber | Percaya? | Guna untuk |
|--------|--------|----------|-----------|
| `getClientName()` | Pelayar pengguna | ❌ | Paparan sahaja (`original_name`, sentiasa `esc()`) |
| `getClientMimeType()` | Header dari pelayar | ❌ | Jangan guna untuk keputusan keselamatan |
| `getMimeType()` | `finfo` pada kandungan | ✅ (munasabah) | Semakan jenis, simpan `mime` |
| `guessExtension()` | Dari MIME sebenar | ✅ | Extension fail simpanan |
| `getSize()` / `getSizeByUnit('kb')` | Saiz fail sementara | ✅ | `size_bytes`, semakan saiz |
| `isValid()` | Status muat naik PHP | ✅ | Tolak fail rosak/terpotong |
| `getErrorString()` | Mesej ralat PHP | — | Log / mesej ralat |
| `getRandomName()` | Dijana CI4 (masa + rawak + extension) | ✅ | Nama fail di cakera |
| `hasMoved()` | Status dalaman | — | Elak `move()` dua kali |
| `move($dir, $name)` | — | — | Pindah dari folder sementara |

---

## 6. Simpan fail — kod dalam `PassWorkflowService`

```php
<?php

namespace App\Services;

use App\Models\PassDocumentModel;
use CodeIgniter\HTTP\Files\UploadedFile;
use RuntimeException;

// Petikan — hanya bahagian dokumen. Tiada kelas baharu: SPEC §5 menetapkan
// logik ini tinggal dalam PassWorkflowService.
class PassWorkflowService
{
    private const ALLOWED_EXT  = ['pdf', 'jpg', 'png'];
    private const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
    private const MAX_FILES    = 3;
    private const MAX_BYTES    = 2 * 1024 * 1024;

    /**
     * Dipanggil oleh submit() selepas rekod pass_applications dicipta.
     *
     * @param list<UploadedFile> $files dari $this->request->getFileMultiple('documents')
     */
    private function storeDocuments(int $applicationId, array $files, string $docType = 'sokongan'): void
    {
        // Buang slot kosong (input file tanpa fail dipilih)
        $files = array_filter($files, static fn (UploadedFile $f) => $f->getError() !== UPLOAD_ERR_NO_FILE);

        if (count($files) > self::MAX_FILES) {
            throw new RuntimeException('Maksimum 3 fail sahaja.');
        }

        $dir = WRITEPATH . 'uploads/pas';      // writable/uploads/pas — BUKAN public/
        if (! is_dir($dir)) {
            mkdir($dir, 0750, true);
        }

        foreach ($files as $file) {
            if (! $file->isValid()) {
                throw new RuntimeException('Muat naik gagal: ' . $file->getErrorString());
            }

            // Semakan berlapis — walaupun rules sudah lulus (pertahanan mendalam)
            $mime = $file->getMimeType();              // dari kandungan
            $ext  = $file->guessExtension();           // 'jpg' untuk image/jpeg
            if (! in_array($mime, self::ALLOWED_MIME, true)
                || ! in_array($ext, self::ALLOWED_EXT, true)
                || $file->getSize() > self::MAX_BYTES) {
                throw new RuntimeException('Jenis atau saiz fail tidak dibenarkan.');
            }

            $original = $file->getClientName();        // simpan untuk paparan SAHAJA
            $size     = $file->getSize();              // baca SEBELUM move()
            $newName  = $file->getRandomName();        // cth 1727251200_3f2a9c1e7b.pdf

            if (! $file->hasMoved()) {
                $file->move($dir, $newName);
            }

            // Hanya metadata + path relatif disimpan dalam DB
            model(PassDocumentModel::class)->insert([
                'application_id' => $applicationId,
                'doc_type'       => $docType,
                'original_name'  => mb_substr($original, 0, 255),
                'stored_path'    => 'uploads/pas/' . $newName,   // relatif kepada WRITEPATH
                'mime'           => $mime,
                'size_bytes'     => $size,
            ]);
        }
    }
}
```

Kenapa `stored_path` **relatif**? Jika aplikasi dipindah ke server lain (`/var/www/…` → `D:\apps\…`), path mutlak dalam DB akan rosak. Gabungkan dengan `WRITEPATH` semasa baca.

> ⚠️ **Kesilapan lazim:** fail dipindah ke cakera **bukan** sebahagian transaksi DB. Jika insert `pass_applications` gagal selepas fail dipindah, fail menjadi yatim. Corak mudah: simpan rekod permohonan dahulu dalam transaksi, kemudian fail; jika fail gagal, `unlink()` fail yang sudah dipindah dan rollback.

Dalam controller:

```php
$files = $this->request->getFileMultiple('documents') ?? [];
service('passWorkflowService')->submit(auth()->id(), $this->validator->getValidated(), $files);
```

---

## 7. Muat turun melalui controller — dengan semakan pemilikan

Kerana fail di `writable/`, pelayar **tidak boleh** mencapainya melalui URL. Satu-satunya jalan ialah route `/pas/permohonan/dokumen/{id}` yang menyemak kebenaran dahulu.

```php
public function document(int $id)
{
    $doc = model(PassDocumentModel::class)->find($id);
    if ($doc === null) {
        throw PageNotFoundException::forPageNotFound();
    }

    $app  = model(PassApplicationModel::class)->find($doc->application_id);
    $user = auth()->user();

    // BR-PAS-04 — sama seperti show()
    $canViewAll = $user->inGroup('reviewer', 'approver', 'admin');
    if ($app === null || (! $canViewAll && (int) $app->user_id !== (int) auth()->id())) {
        throw PageNotFoundException::forPageNotFound();
    }

    $fullPath = WRITEPATH . $doc->stored_path;
    if (! is_file($fullPath)) {
        throw PageNotFoundException::forPageNotFound();
    }

    // download() → Content-Disposition: attachment (fail tidak dirender dalam tab)
    return $this->response->download($fullPath, null)->setFileName($doc->original_name);
}
```

---

## 8. Had PHP (`php.ini`) — punca ralat "senyap"

Jika fail melebihi had PHP, CI4 tidak pernah melihatnya — `$_FILES` kosong atau `isValid()` palsu.

| Tetapan | Nilai cadangan latihan | Kenapa |
|---------|------------------------|--------|
| `upload_max_filesize` | `8M` | > 2 MB supaya mesej validasi CI4 (bukan ralat PHP) dipaparkan |
| `post_max_size` | `16M` | ≥ 3 × saiz fail + medan borang; jika dilebihi, **seluruh `$_POST` kosong** (CSRF gagal!) |
| `max_file_uploads` | `20` | Lalai; had 3 dikuatkuasa oleh kita |
| `extension=fileinfo` | dihidupkan | Diperlukan `getMimeType()` / `mime_in` |

Semak: `php -i | grep -E "upload_max_filesize|post_max_size"`.

---

## 9. Senarai semak muat naik (DoD M2)

- [ ] Fail disimpan di `writable/uploads/pas/` — tiada apa-apa dalam `public/`
- [ ] `ext_in` + `mime_in` + `max_size` dalam rules; bilangan ≤ 3 disemak di Service
- [ ] Nama cakera = `getRandomName()`; nama asal hanya dalam `original_name`
- [ ] `pass_documents` simpan `stored_path` relatif, `mime`, `size_bytes`
- [ ] Muat turun melalui controller dengan semakan BR-PAS-04 (uji dengan `pemohon2`)
- [ ] `original_name` dipapar dengan `esc()`
- [ ] Ujian kes sempadan: 2.1 MB, `.exe` dinamakan `.pdf`, 4 fail, tiada fail

---

## ⚠️ Kesilapan lazim

| Kesilapan | Akibat | Betulkan |
|-----------|--------|----------|
| `move(FCPATH . 'uploads')` (folder `public/`) | Fail boleh dicapai & dilaksana terus melalui URL | `move(WRITEPATH . 'uploads/pas', …)` |
| Guna `getClientName()` sebagai nama cakera | Path traversal, tulis ganti fail | `getRandomName()` |
| Hanya `ext_in` tanpa `mime_in` | `.php` dinamakan `.pdf` diterima | Kedua-dua + `guessExtension()` |
| Percaya `getClientMimeType()` | Header boleh dipalsukan | `getMimeType()` (finfo) |
| Panggil `getSize()` selepas `move()` / `move()` dua kali | Ralat / nilai salah | Baca metadata dahulu; semak `hasMoved()` |
| `post_max_size` terlalu kecil | `$_POST` kosong → "The action you requested is not allowed" (CSRF) | Naikkan `post_max_size` |
| Muat turun tanpa semakan pemilikan | IDOR — dokumen peribadi bocor | Semakan BR-PAS-04 dalam `document()` |
| Simpan fail sebagai BLOB dalam DB | DB membengkak, backup lambat | Path dalam DB, fail dalam `writable/` |

## Rujukan rasmi

- [CI4 — Working with Uploaded Files](https://codeigniter.com/user_guide/libraries/uploaded_files.html)
- [CI4 — Validation: Rules for File Uploads](https://codeigniter.com/user_guide/libraries/validation.html#rules-for-file-uploads)
- [CI4 — HTTP Responses: Force File Download](https://codeigniter.com/user_guide/outgoing/response.html#force-file-download)
- [OWASP — File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [PHP — Handling file uploads / `php.ini` directives](https://www.php.net/manual/en/features.file-upload.php)

## Bacaan buku — *CodeIgniter 4 Foundations*

Lonnie Ezell, [Leanpub](https://leanpub.com/codeigniter4foundations), edisi 2021 (CodeIgniter 4.1). `hlm.` = nombor halaman yang tercetak di kaki halaman buku.

- Muat naik imej & semakan MIME (*PUT a Featured Image*) — hlm. 91–94

Buku menerima imej melalui API; simpanan di `writable/` dan muat turun bersemak ikut nota ini.

---
**Digunakan pada Hari 7** — S3 (borang, validasi & muat naik dokumen selamat) dan S4 (ujian kes sempadan muat naik). Turut Hari 8 (muat turun dokumen oleh penyemak/pelulus). Nota berkaitan: [04 Validasi](./nota-04-validasi-dan-borang.md) · [06 Shield & RBAC](./nota-06-shield-auth-dan-rbac.md) · [11 Keselamatan](./nota-11-keselamatan-aplikasi-web.md)
