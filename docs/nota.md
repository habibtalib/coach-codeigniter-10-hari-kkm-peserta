# Nota Topikal — CI-KKM-10

> Nota mendalam yang dirujuk **merentas hari**. README setiap `hari-N/` memberi ringkasan konsep sesi; folder ini menerangkan **kenapa** sesuatu corak digunakan, dengan kod beranotasi, kesilapan lazim dan pautan rasmi.
> Kanun: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Jadual: [`JADUAL.md`](../JADUAL.md) · Kontrak kerja: [`docs/kolaborasi.md`](kolaborasi.md)

## Cara guna

1. **Sebelum sesi**, baca bahagian *Objektif nota* dan *Konsep* nota yang berkaitan dengan hari tersebut (lihat lajur **Hari**).
2. **Semasa lab**, rujuk blok kod beranotasi — jangan salin buta; baca komen `//` dahulu.
3. **Selepas lab**, semak senarai *⚠️ Kesilapan lazim* terhadap kod anda sendiri.
4. Ragu tentang nama jadual, medan, status atau kelas? **docs/spesifikasi-sistem.md menang.**

## Indeks

| # | Fail | Topik | Hari |
|---|------|-------|------|
| 01 | [`01-mvc-dan-kitaran-request-ci4.md`](./nota-01-mvc-dan-kitaran-request-ci4.md) | Kitaran hayat request CI4, routing, controller, view, layout, filter | 4, 5 |
| 02 | [`02-migration-seeder-dan-query-builder.md`](./nota-02-migration-seeder-dan-query-builder.md) | Migration dari ERD, seeder (termasuk pengguna Shield), Query Builder & query pertindihan tarikh | 4, 6, 9 |
| 03 | [`03-model-entity-dan-enum.md`](./nota-03-model-entity-dan-enum.md) | `Model` (`$allowedFields`, `$validationRules`, callbacks, soft delete), `Entity`, backed enum dengan `label()`/`badge()` | 5, 7 |
| 04 | [`04-validasi-dan-borang.md`](./nota-04-validasi-dan-borang.md) | Peraturan validasi, peraturan tersuai, `old()`, paparan ralat, CSRF | 5, 7 |
| 05 | [`05-service-layer-dan-transaksi.md`](./nota-05-service-layer-dan-transaksi.md) | Controller nipis, lapisan Service, transaksi DB, `SELECT … FOR UPDATE`, *race condition* | 6, 8 |
| 06 | [`06-shield-auth-dan-rbac.md`](./nota-06-shield-auth-dan-rbac.md) | Authentication vs authorization, Shield groups/permissions/matrix, filter route, semakan pemilikan | 4, 8 |
| 07 | [`07-muat-naik-fail-selamat.md`](./nota-07-muat-naik-fail-selamat.md) | Risiko muat naik (OWASP), API `UploadedFile`, simpanan di `writable/`, muat turun bersemak | 7 |
| 08 | [`08-laporan-eksport-pdf-excel.md`](./nota-08-laporan-eksport-pdf-excel.md) | `ReportService`, filter GET, pagination, Dompdf, PhpSpreadsheet | 9 |
| 09 | [`09-statistik-chartjs-dan-cache.md`](./nota-09-statistik-chartjs-dan-cache.md) | `StatisticsService`, endpoint JSON, Chart.js 4, `cache()->remember()` & invalidasi | 10 |
| 10 | [`10-ujian-phpunit-ci4.md`](./nota-10-ujian-phpunit-ci4.md) | Ujian unit vs ciri, `DatabaseTestTrait`, `FeatureTestTrait`, `actingAs()` Shield, DB ujian | 6, 8, 10 |
| 11 | [`11-keselamatan-aplikasi-web.md`](./nota-11-keselamatan-aplikasi-web.md) | OWASP Top 10 dipetakan kepada ciri CI4 + senarai semak pra-demo | 4, 7, 8, 10 |
| 12 | [`12-git-aliran-kerja.md`](./nota-12-git-aliran-kerja.md) | Branch per ciri, mesej commit, merge, menyelesaikan konflik | 4 → 10 |

## Peta nota ikut hari

| Hari | Tajuk | Nota utama | Nota sokongan |
|------|-------|-----------|---------------|
| 1–3 | Keperluan (Hari 1) · `kelas-ci-<nama>`: route, borang, database & migration pertama (Hari 2–3) | [01](./nota-01-mvc-dan-kitaran-request-ci4.md), [04](./nota-04-validasi-dan-borang.md), [02](./nota-02-migration-seeder-dan-query-builder.md) | [12](./nota-12-git-aliran-kerja.md) |
| 4 | Demo projek sendiri, Shield, 8 migration lagi & aliran Git solo | [01](./nota-01-mvc-dan-kitaran-request-ci4.md), [02](./nota-02-migration-seeder-dan-query-builder.md), [06](./nota-06-shield-auth-dan-rbac.md) | [12](./nota-12-git-aliran-kerja.md), [11](./nota-11-keselamatan-aplikasi-web.md) |
| 5 | TLK (1) | [03](./nota-03-model-entity-dan-enum.md), [04](./nota-04-validasi-dan-borang.md) | [01](./nota-01-mvc-dan-kitaran-request-ci4.md) |
| 6 | TLK (2) | [05](./nota-05-service-layer-dan-transaksi.md), [10](./nota-10-ujian-phpunit-ci4.md) | [02](./nota-02-migration-seeder-dan-query-builder.md) |
| 7 | Pas (1) | [07](./nota-07-muat-naik-fail-selamat.md), [04](./nota-04-validasi-dan-borang.md) | [03](./nota-03-model-entity-dan-enum.md), [11](./nota-11-keselamatan-aplikasi-web.md) |
| 8 | Pas (2) | [06](./nota-06-shield-auth-dan-rbac.md), [05](./nota-05-service-layer-dan-transaksi.md) | [10](./nota-10-ujian-phpunit-ci4.md) |
| 9 | Laporan | [08](./nota-08-laporan-eksport-pdf-excel.md) | [02](./nota-02-migration-seeder-dan-query-builder.md) |
| 10 | Statistik & Capstone | [09](./nota-09-statistik-chartjs-dan-cache.md), [10](./nota-10-ujian-phpunit-ci4.md) | [11](./nota-11-keselamatan-aplikasi-web.md) |

## Format setiap nota

Setiap fail mempunyai struktur yang sama supaya mudah diimbas:

- **Objektif nota** — 3–4 perkara yang anda patut boleh lakukan selepas membaca.
- **Konsep + KENAPA** — penerangan, rajah Mermaid (jika sesuai) dan kod beranotasi.
- **⚠️ Kesilapan lazim** — pepijat yang paling kerap dilihat jurulatih.
- **Rujukan rasmi** — dokumentasi CodeIgniter 4, Shield, PHP, OWASP.
- **Bacaan buku** — halaman berkaitan dalam *CodeIgniter 4 Foundations* (Lonnie Ezell, 2021), dengan nota di mana kursus ini berbeza daripada buku (buku ditulis untuk CI 4.1 dan terbit sebelum Shield). Nota 12 (Git) tiada bahagian ini.
- **Digunakan pada Hari N** — sesi di mana nota ini dipakai.

> **Disiplin AI:** jika anda meminta Claude Code menerangkan mana-mana nota ini, guna prompt dalam [`../docs/pustaka-prompt.md`](pustaka-prompt.md). Faham dahulu, terima kemudian.
