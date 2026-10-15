# Senarai Semak Modul M1–M4

> Guna di **hujung setiap sesi pembinaan** (S4 Hari 5–10) dan sebelum ✅ checkpoint jurulatih. Setiap baris dipetakan kepada **Definition of Done** ([`KOLABORASI.md`](../KOLABORASI.md) §2) dan peraturan perniagaan **`BR-*`** ([`SPEC-KURSUS.md`](../SPEC-KURSUS.md) §2).
> Salin fail ini ke repo projek anda (`docs/semakan-modul.md`) dan tandakan `[x]` bersama pasangan. Satu baris hanya ditanda jika **kedua-dua** driver dan navigator boleh menerangkannya.

## Legenda DoD

| Kod | Kriteria Definition of Done |
|-----|-----------------------------|
| **D1** | Acceptance criteria (Given/When/Then) dari URS lulus diuji manual |
| **D2** | Validasi di **pelayan** (Model rules / Validation) — bukan JS sahaja |
| **D3** | Akses dikawal di pelayan (filter + semakan pemilikan) |
| **D4** | Peralihan status direkod dalam `status_logs` |
| **D5** | Ujian PHPUnit berkaitan lulus (`vendor/bin/phpunit`) |
| **D6** | Tiada `.env`/rahsia dalam commit; data sintetik sahaja |
| **D7** | Peserta boleh menerangkan setiap baris kod |

---

## M0 — Asas projek (Hari 4)

| ✅ | Perkara | DoD | Cara semak |
|----|---------|-----|-----------|
| [ ] | Projek `codeigniter4/appstarter` 4.6+ berjalan (`php spark serve`) | — | Halaman utama dipapar |
| [ ] | `.env` dikonfigur; **`.env` dalam `.gitignore`** | D6 | `git check-ignore .env` → `.env` |
| [ ] | Shield dipasang (`php spark shield:setup`), log masuk berfungsi | D3 | Log masuk `pemohon1@latihan.test` / `Latihan@2026` |
| [ ] | `AuthGroups` — 4 group (`applicant`, `reviewer`, `approver`, `admin`) + `$matrix` ikut SPEC §4 | D3 | Baca `app/Config/AuthGroups.php` bersama SPEC |
| [ ] | Semua migration SPEC §3 (10 jadual + medan tambahan `users`) | — | `php spark migrate:status` — tiada *pending* |
| [ ] | `DatabaseSeeder` memanggil semua seeder; 5 pengguna sintetik | D6 | `php spark db:seed DatabaseSeeder` tanpa ralat |
| [ ] | Layout `app/Views/layouts/main.php` (Bootstrap 5.3 + Icons) | — | Semua halaman guna `$this->extend('layouts/main')` |
| [ ] | CSRF global dihidupkan (`Filters::$globals['before']`) | D3 | Borang tanpa `csrf_field()` ditolak |
| [ ] | Cabang Git per ciri; commit berprefix `SETUP:` | — | `git log --oneline` |

---

## M1 — Tempat Letak Kenderaan Khas (Hari 5–6)

### Struktur & data

| ✅ | Perkara | DoD | Cara semak |
|----|---------|-----|-----------|
| [ ] | Enum `SlotCategory` & `BookingStatus` (backed, `label()`, `badge()`) | D7 | Nilai sepadan SPEC §2.1 tepat |
| [ ] | `ParkingZoneModel`, `ParkingSlotModel` (soft delete), `VehicleModel`, `SlotBookingModel` dengan `$allowedFields` + `$validationRules` | D2 | Cuba hantar medan `status` melalui borang → diabaikan |
| [ ] | Entity `SlotBooking` (`$returnType`) | D7 | `dd($model->find(1))` → objek `App\Entities\SlotBooking` |
| [ ] | CRUD slot & zon (`/admin/slot`, `group:admin`) | D3 | `pemohon1` akses `/admin/slot` → ditolak |
| [ ] | Senarai tempahan berpagination (pemohon lihat **milik sendiri** sahaja) | D3 | `pemohon2` tidak nampak tempahan `pemohon1` |
| [ ] | Nombor rujukan `TLK-2026-0001` dijana oleh `ReferenceNumberService` (jadual `reference_sequences`) | D5 | Dua tempahan berturut → `…0001`, `…0002` |

### Peraturan perniagaan

| ✅ | Peraturan | Perkara | DoD | Cara semak |
|----|-----------|---------|-----|-----------|
| [ ] | **BR-TLK-01** | Tiada pertindihan `pending`/`approved` pada slot sama; syarat `start_date <= :end AND end_date >= :start` | D1 D5 | Ujian: dalam julat, hari terakhir sama, bersebelahan (tidak bertindih), tempahan `rejected` tidak menghalang |
| [ ] | **BR-TLK-02** | Kategori slot sepadan kelayakan; slot `oku` memerlukan semakan pentadbir | D1 | Senario manual: pelulus melihat kategori & sebab sebelum lulus |
| [ ] | **BR-TLK-03** | Maksimum 90 hari; `end_date >= start_date`; `start_date` bukan masa lalu | D2 D5 | Borang: 91 hari, tarikh terbalik, semalam → ralat BM di medan |
| [ ] | **BR-TLK-04** | Maksimum 1 tempahan aktif (`pending`/`approved`) setiap pemohon | D2 D5 | Tempahan kedua ditolak dengan mesej jelas |
| [ ] | **BR-TLK-05** | Semakan pertindihan & kelulusan dalam transaksi + `SELECT … FOR UPDATE` pada baris slot | D5 D7 | Tunjuk kod transaksi; terangkan garis masa *race condition* |

### Aliran status & UI

| ✅ | Perkara | DoD | Cara semak |
|----|---------|-----|-----------|
| [ ] | `/tlk/keputusan` (`permission:tlk.decide`) — lulus/tolak | D3 | `pemohon1` → ditolak; `pelulus` → berjaya |
| [ ] | Peralihan hanya `pending → approved/rejected`, `approved → cancelled/expired` | D1 D5 | Cuba lulus tempahan `rejected` → ditolak |
| [ ] | Setiap peralihan menulis `status_logs` (`module = 'TLK'`) dalam transaksi yang sama | D4 | `SELECT * FROM status_logs WHERE module='TLK'` |
| [ ] | `decided_by`, `decided_at` diisi semasa keputusan | D4 | Semak rekod DB |
| [ ] | Badge status (`BookingStatus::badge()`), flash message, dialog pengesahan | D1 | Demo UI |
| [ ] | Semua output view guna `esc()` | D3 | Masukkan `<script>alert(1)</script>` dalam `reason` → dipapar sebagai teks |
| [ ] | Ujian PHPUnit: pertindihan + peralihan status + akses | D5 | `vendor/bin/phpunit --testdox` hijau |
| [ ] | **M1 siap** — ditandatangani jurulatih | D7 | ✍️ ________ |

---

## M2 — Pas (Hari 7–8)

### Struktur & borang

| ✅ | Perkara | DoD | Cara semak |
|----|---------|-----|-----------|
| [ ] | Enum `PassType` & `PassStatus` (dengan `canTransitionTo()`) | D7 | Nilai sepadan SPEC §2.2 tepat |
| [ ] | `PassApplicationModel`, `PassDocumentModel`, `StatusLogModel`; Entity `PassApplication` | D2 | `$allowedFields` tidak termasuk `status`, `approved_by` |
| [ ] | Borang permohonan dengan validasi pelayan; `valid_until >= valid_from` | D2 | Hantar borang kosong → ralat di setiap medan, input lama kekal (`old()`) |
| [ ] | Nombor rujukan `PAS-2026-0001` | D5 | Semak `ref_no` |
| [ ] | Status awal `submitted` + log `status_logs` (`from_status` NULL) | D4 | Semak DB selepas hantar |

### Peraturan perniagaan

| ✅ | Peraturan | Perkara | DoD | Cara semak |
|----|-----------|---------|-----|-----------|
| [ ] | **BR-PAS-01** | Peralihan status hanya melalui `PassStatus::canTransitionTo()` | D5 D7 | Ujian unit dengan *data provider* — semua pasangan sah & tidak sah |
| [ ] | **BR-PAS-02** | `pdf`/`jpg`/`png` sahaja; ≤ 2 MB; ≤ 3 fail; `writable/uploads/pas/`; `getRandomName()`; hanya path dalam DB | D2 D3 | Uji: `.exe` dinamakan `.pdf`, fail 2.1 MB, 4 fail; semak tiada fail dalam `public/` |
| [ ] | **BR-PAS-03** | Penolakan wajib `remarks` ≥ 10 aksara | D2 D5 | Tolak dengan catatan 5 aksara → ralat |
| [ ] | **BR-PAS-04** | Pemohon lihat milik sendiri sahaja; `reviewer`/`approver`/`admin` lihat semua | D3 D5 | `pemohon2` buka `/pas/permohonan/{id milik pemohon1}` → 404; juga `/pas/permohonan/dokumen/{id}` |
| [ ] | **BR-PAS-05** | Setiap peralihan direkod dalam `status_logs` (`module = 'PAS'`) | D4 | Garis masa sejarah dipapar di halaman butiran |

### Aliran kelulusan & akses

| ✅ | Perkara | DoD | Cara semak |
|----|---------|-----|-----------|
| [ ] | `/pas/semakan` (`group:reviewer,approver,admin`) | D3 | `pemohon1` → ditolak |
| [ ] | `reviewer`: `submitted → under_review`, atau tolak | D3 D4 | Log masuk `penyemak@latihan.test` |
| [ ] | `approver`: `under_review → approved`, atau tolak | D3 D4 | Log masuk `pelulus@latihan.test` |
| [ ] | `reviewed_by/at`, `approved_by/at` diisi | D4 | Semak DB |
| [ ] | Semakan kebenaran **dalam service** juga (bukan filter laluan sahaja) | D3 | Terangkan kenapa (pertahanan berlapis) |
| [ ] | Muat turun dokumen melalui controller (`response->download()`) selepas semakan pemilikan | D3 | Tiada URL terus ke fail |
| [ ] | Ujian akses positif & negatif (3 peranan) | D5 | `vendor/bin/phpunit --filter Pas` hijau |
| [ ] | Demo aliran penuh 3 peranan | D1 | Pemohon → penyemak → pelulus |
| [ ] | **M2 siap** — ditandatangani jurulatih | D7 | ✍️ ________ |

---

## M3 — Laporan (Hari 9)

| ✅ | Perkara | DoD | Cara semak |
|----|---------|-----|-----------|
| [ ] | Laluan `/laporan/{tempahan\|pas\|penggunaan}` dengan `permission:laporan.view` | D3 | `pemohon1` → ditolak; `penyemak` → dibenarkan |
| [ ] | **RPT-01** Senarai tempahan TLK — penapis julat tarikh, zon, kategori, status | D1 | Setiap penapis mengubah hasil |
| [ ] | **RPT-02** Senarai permohonan Pas — penapis julat tarikh, jenis pas, jabatan, status | D1 | Setiap penapis mengubah hasil |
| [ ] | **RPT-03** Penggunaan slot ikut zon (aggregate `groupBy`) — penapis bulan/tahun | D1 | Jumlah sepadan query manual |
| [ ] | Borang penapis **GET**; pagination membawa query string | D1 | Halaman 2 masih bertapis |
| [ ] | Penapis disenarai putih (whitelist) & melalui Query Builder — tiada SQL bercantum input | D2 D3 | Cuba `?status=' OR 1=1 --` → tiada kesan |
| [ ] | Nilai penapis tidak sah (cth status bukan enum) diabaikan/ditolak | D2 | `?status=xyz` |
| [ ] | `?export=pdf` (Dompdf) guna penapis yang **sama** | D1 | Bilangan baris PDF = HTML |
| [ ] | `?export=xlsx` (PhpSpreadsheet) guna penapis yang **sama**; lindungi *formula injection* | D1 D3 | Sebab bermula `=` dipapar sebagai teks |
| [ ] | **Jumlah laporan = jumlah DB** | D5 | Ujian atau `SELECT COUNT(*)` manual |
| [ ] | Logik dalam `ReportService` / `ExportService` — controller nipis | D7 | Controller < ~30 baris setiap action |
| [ ] | **M3 siap** — ditandatangani jurulatih | D7 | ✍️ ________ |

---

## M4 — Statistik (Hari 10)

| ✅ | Perkara | DoD | Cara semak |
|----|---------|-----|-----------|
| [ ] | `/statistik` & `/statistik/data` (JSON) dengan `permission:statistik.view` | D3 | `pemohon1` & `penyemak` → ditolak; `pelulus` & `admin` → dibenarkan |
| [ ] | Kad KPI: tempahan aktif · kadar penggunaan slot (%) · pas menunggu · purata hari lulus pas | D1 | Semak setiap nilai dengan query manual |
| [ ] | Carta: tempahan ikut bulan (bar) · status pas (doughnut) · penggunaan ikut zon (bar mendatar) · trend 12 bulan (line) | D1 | 4 carta dipapar tanpa ralat konsol |
| [ ] | Chart.js dimuat dari aset tempatan (tiada internet diperlukan) | — | Putuskan rangkaian → carta masih dipapar |
| [ ] | Bulan tanpa data dipapar sebagai 0 (bukan hilang) | D1 | Trend 12 bulan sentiasa 12 titik |
| [ ] | Aggregate dalam `StatisticsService`, di-cache 10 minit (`cache()->remember()`) | D7 | Muat semula kedua → tiada query DB (Debug Toolbar) |
| [ ] | Cache dikosongkan apabila status TLK/Pas berubah | D5 | Lulus satu tempahan → KPI dikemas kini serta-merta |
| [ ] | **M4 siap** — ditandatangani jurulatih | D7 | ✍️ ________ |

---

## Sebelum demo capstone (Hari 10 S4)

| ✅ | Perkara | DoD |
|----|---------|-----|
| [ ] | `php spark migrate:refresh && php spark db:seed DatabaseSeeder` berjaya dari kosong | — |
| [ ] | `vendor/bin/phpunit` — semua hijau | D5 |
| [ ] | Skrip UAT (templat `templates/dokumen/`) dijalankan; pepijat dicatat & dibaiki | D1 |
| [ ] | `git log` — tiada `.env`, tiada data sebenar, commit berprefix | D6 |
| [ ] | Senarai semak keselamatan [`../nota/11-keselamatan-aplikasi-web.md`](../nota/11-keselamatan-aplikasi-web.md) dilalui | D3 |
| [ ] | Setiap ahli pasangan boleh menerangkan satu aliran hujung-ke-hujung (mohon → lulus → laporan → statistik) | D7 |
| [ ] | Rubrik: [`rubrik-capstone.md`](./rubrik-capstone.md) dibaca | — |
