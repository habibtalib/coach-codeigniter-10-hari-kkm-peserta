# Topical Notes — CI-KKM-10

> In-depth notes referred to **across days**. Each `hari-N/` README gives a summary of the session concepts; this folder explains **why** a pattern is used, with annotated code, common mistakes and official links.
> Canon: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Schedule: [`JADUAL.md`](../JADUAL.md) · Working agreement: [`docs/kolaborasi.md`](kolaborasi.md)

## How to use

1. **Before the session**, read the *Note objectives* and *Concepts* sections of the notes for that day (see the **Day** column).
2. **During the lab**, refer to the annotated code blocks — don't copy blindly; read the `//` comments first.
3. **After the lab**, check the *⚠️ Common mistakes* list against your own code.
4. Unsure about a table, field, status or class name? **docs/spesifikasi-sistem.md wins.**

## Index

| # | File | Topic | Day |
|---|------|-------|------|
| 01 | [`01-mvc-dan-kitaran-request-ci4.md`](./nota-01-mvc-dan-kitaran-request-ci4.md) | CI4 request lifecycle, routing, controller, view, layout, filter | 4, 5 |
| 02 | [`02-migration-seeder-dan-query-builder.md`](./nota-02-migration-seeder-dan-query-builder.md) | Migrations from the ERD, seeders (including Shield users), Query Builder & date-overlap queries | 4, 6, 9 |
| 03 | [`03-model-entity-dan-enum.md`](./nota-03-model-entity-dan-enum.md) | `Model` (`$allowedFields`, `$validationRules`, callbacks, soft delete), `Entity`, backed enums with `label()`/`badge()` | 5, 7 |
| 04 | [`04-validasi-dan-borang.md`](./nota-04-validasi-dan-borang.md) | Validation rules, custom rules, `old()`, error display, CSRF | 5, 7 |
| 05 | [`05-service-layer-dan-transaksi.md`](./nota-05-service-layer-dan-transaksi.md) | Thin controllers, Service layer, DB transactions, `SELECT … FOR UPDATE`, *race condition* | 6, 8 |
| 06 | [`06-shield-auth-dan-rbac.md`](./nota-06-shield-auth-dan-rbac.md) | Authentication vs authorization, Shield groups/permissions/matrix, route filters, ownership checks | 4, 8 |
| 07 | [`07-muat-naik-fail-selamat.md`](./nota-07-muat-naik-fail-selamat.md) | Upload risks (OWASP), the `UploadedFile` API, storage in `writable/`, checked downloads | 7 |
| 08 | [`08-laporan-eksport-pdf-excel.md`](./nota-08-laporan-eksport-pdf-excel.md) | `ReportService`, GET filters, pagination, Dompdf, PhpSpreadsheet | 9 |
| 09 | [`09-statistik-chartjs-dan-cache.md`](./nota-09-statistik-chartjs-dan-cache.md) | `StatisticsService`, JSON endpoints, Chart.js 4, `cache()->remember()` & invalidation | 10 |
| 10 | [`10-ujian-phpunit-ci4.md`](./nota-10-ujian-phpunit-ci4.md) | Unit vs feature tests, `DatabaseTestTrait`, `FeatureTestTrait`, Shield `actingAs()`, test DB | 6, 8, 10 |
| 11 | [`11-keselamatan-aplikasi-web.md`](./nota-11-keselamatan-aplikasi-web.md) | OWASP Top 10 mapped to CI4 features + pre-demo checklist | 4, 7, 8, 10 |
| 12 | [`12-git-aliran-kerja.md`](./nota-12-git-aliran-kerja.md) | Branch per feature, commit messages, merge, resolving conflicts | 4 → 10 |

## Notes map by day

| Day | Title | Main notes | Supporting notes |
|------|-------|-----------|---------------|
| 1–3 | Requirements, process, ERD, wireframe | — (see `hari-1/` … `hari-3/`) | [02](./nota-02-migration-seeder-dan-query-builder.md) (read ERD → migration as preparation) |
| 4 | Assignment Review & Development Kickoff | [01](./nota-01-mvc-dan-kitaran-request-ci4.md), [02](./nota-02-migration-seeder-dan-query-builder.md), [06](./nota-06-shield-auth-dan-rbac.md) | [12](./nota-12-git-aliran-kerja.md), [11](./nota-11-keselamatan-aplikasi-web.md) |
| 5 | TLK (1) | [03](./nota-03-model-entity-dan-enum.md), [04](./nota-04-validasi-dan-borang.md) | [01](./nota-01-mvc-dan-kitaran-request-ci4.md) |
| 6 | TLK (2) | [05](./nota-05-service-layer-dan-transaksi.md), [10](./nota-10-ujian-phpunit-ci4.md) | [02](./nota-02-migration-seeder-dan-query-builder.md) |
| 7 | Pass (1) | [07](./nota-07-muat-naik-fail-selamat.md), [04](./nota-04-validasi-dan-borang.md) | [03](./nota-03-model-entity-dan-enum.md), [11](./nota-11-keselamatan-aplikasi-web.md) |
| 8 | Pass (2) | [06](./nota-06-shield-auth-dan-rbac.md), [05](./nota-05-service-layer-dan-transaksi.md) | [10](./nota-10-ujian-phpunit-ci4.md) |
| 9 | Report | [08](./nota-08-laporan-eksport-pdf-excel.md) | [02](./nota-02-migration-seeder-dan-query-builder.md) |
| 10 | Statistics & Capstone | [09](./nota-09-statistik-chartjs-dan-cache.md), [10](./nota-10-ujian-phpunit-ci4.md) | [11](./nota-11-keselamatan-aplikasi-web.md) |

## Format of each note

Every file has the same structure so it is easy to scan:

- **Note objectives** — 3–4 things you should be able to do after reading.
- **Concepts + WHY** — explanation, Mermaid diagram (where suitable) and annotated code.
- **⚠️ Common mistakes** — the bugs trainers see most often.
- **Official references** — CodeIgniter 4, Shield, PHP and OWASP documentation.
- **Book reading** — the matching pages in *CodeIgniter 4 Foundations* (Lonnie Ezell, 2021), with a note where this course differs from the book (the book targets CI 4.1 and predates Shield). Note 12 (Git) has no such section.
- **Used on Day N** — the sessions where this note is used.

> **AI discipline:** if you ask Claude Code to explain any of these notes, use the prompts in [`../docs/pustaka-prompt.md`](pustaka-prompt.md). Understand first, accept later.
