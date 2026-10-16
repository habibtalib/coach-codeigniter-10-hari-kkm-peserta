# Pautan Rujukan Rasmi — ikut hari

> Semua pautan disemak pada September 2026. Dokumentasi CodeIgniter merujuk **versi terkini 4.x** (serasi 4.6+). Jika contoh dalam dokumentasi berbeza dengan nota kursus, **docs/spesifikasi-sistem.md menentukan nama**, dokumentasi rasmi menentukan **API**.
> Nota topikal: [`nota.md`](nota.md)

## Rujukan teras (buka sepanjang kursus)

| Sumber | Pautan |
|--------|--------|
| CodeIgniter 4 User Guide | <https://codeigniter.com/user_guide/> |
| CodeIgniter Shield | <https://shield.codeigniter.com/latest/> |
| Manual PHP | <https://www.php.net/manual/en/> |
| Bootstrap 5.3 | <https://getbootstrap.com/docs/5.3/> · Ikon: <https://icons.getbootstrap.com/> |
| Mermaid | <https://mermaid.js.org/intro/> |
| OWASP Top 10 | <https://owasp.org/Top10/> |

> Tip: dalam User Guide CI4, guna kotak carian di kiri atas. Pastikan halaman bukan untuk **CodeIgniter 3** (`codeigniter.com/userguide3/`).

---

## Hari 1 — Project Kickoff & Requirement Deep Dive

| Topik | Pautan |
|-------|--------|
| Teknik temu bual keperluan (IIBA — Elicitation) | <https://www.iiba.org/business-analysis-blogs/> |
| Keutamaan MoSCoW | <https://www.agilebusiness.org/dsdm-project-framework/moscow-prioritisation.html> |
| Keperluan bukan fungsian (ISO/IEC 25010) | <https://iso25000.com/index.php/en/iso-25000-standards/iso-25010> |

## Hari 2 — Requirement Finalization & Process Flow

| Topik | Pautan |
|-------|--------|
| Mermaid flowchart (carta alir as-is/to-be) | <https://mermaid.js.org/syntax/flowchart.html> |
| Mermaid state diagram (carta status `BookingStatus`/`PassStatus`) | <https://mermaid.js.org/syntax/stateDiagram.html> |
| Given/When/Then (Gherkin) | <https://cucumber.io/docs/gherkin/reference/> |

## Hari 3 — Database Design & UI/UX Foundation

| Topik | Pautan |
|-------|--------|
| Mermaid ERD | <https://mermaid.js.org/syntax/entityRelationshipDiagram.html> |
| MySQL 8 — jenis data | <https://dev.mysql.com/doc/refman/8.0/en/data-types.html> |
| MySQL 8 — indeks | <https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html> |
| Bootstrap 5.3 — komponen borang | <https://getbootstrap.com/docs/5.3/forms/overview/> |
| draw.io | <https://app.diagrams.net/> |
| Excalidraw | <https://excalidraw.com/> |

## Hari 4 — Assignment Review & Development Kickoff

| Topik | Pautan |
|-------|--------|
| Keperluan server CI4 | <https://codeigniter.com/user_guide/intro/requirements.html> |
| Pasang melalui Composer (`appstarter`) | <https://codeigniter.com/user_guide/installation/installing_composer.html> |
| Struktur aplikasi | <https://codeigniter.com/user_guide/concepts/structure.html> |
| MVC dalam CI4 | <https://codeigniter.com/user_guide/concepts/mvc.html> |
| Konfigurasi & `.env` | <https://codeigniter.com/user_guide/general/configuration.html> |
| Routing | <https://codeigniter.com/user_guide/incoming/routing.html> |
| Controller | <https://codeigniter.com/user_guide/incoming/controllers.html> |
| View layouts | <https://codeigniter.com/user_guide/outgoing/view_layouts.html> |
| Migration | <https://codeigniter.com/user_guide/dbmgmt/migration.html> |
| Database Forge | <https://codeigniter.com/user_guide/dbmgmt/forge.html> |
| Seeder | <https://codeigniter.com/user_guide/dbmgmt/seeds.html> |
| Arahan Spark | <https://codeigniter.com/user_guide/cli/spark_commands.html> |
| Shield — pemasangan | <https://shield.codeigniter.com/latest/getting_started/install/> |
| Shield — konsep | <https://shield.codeigniter.com/latest/getting_started/concepts/> |
| Shield — tambah medan pengguna (`full_name`, `staff_no`…) | <https://shield.codeigniter.com/latest/customization/adding_attributes_to_users/> |
| Git — buku Pro Git (bab 2–3) | <https://git-scm.com/book/en/v2> |

## Hari 5 — Modul TLK (1)

| Topik | Pautan |
|-------|--------|
| Model | <https://codeigniter.com/user_guide/models/model.html> |
| Entity | <https://codeigniter.com/user_guide/models/entities.html> |
| PHP backed enum | <https://www.php.net/manual/en/language.enumerations.backed.php> |
| PHP `match` | <https://www.php.net/manual/en/control-structures.match.php> |
| Validation | <https://codeigniter.com/user_guide/libraries/validation.html> |
| Form helper (`form_open`, `old`) | <https://codeigniter.com/user_guide/helpers/form_helper.html> |
| Pagination | <https://codeigniter.com/user_guide/libraries/pagination.html> |
| Fungsi umum (`esc`, `old`, `redirect`) | <https://codeigniter.com/user_guide/general/common_functions.html> |

## Hari 6 — Modul TLK (2)

| Topik | Pautan |
|-------|--------|
| Query Builder | <https://codeigniter.com/user_guide/database/query_builder.html> |
| Transaksi | <https://codeigniter.com/user_guide/database/transactions.html> |
| MySQL — *locking reads* (`SELECT … FOR UPDATE`) | <https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html> |
| Services (`app/Config/Services.php`) | <https://codeigniter.com/user_guide/concepts/services.html> |
| Ujian — gambaran | <https://codeigniter.com/user_guide/testing/overview.html> |
| Ujian — database | <https://codeigniter.com/user_guide/testing/database.html> |
| PHPUnit 10 | <https://docs.phpunit.de/en/10.5/> |

## Hari 7 — Modul Pas (1)

| Topik | Pautan |
|-------|--------|
| Uploaded files (`UploadedFile`) | <https://codeigniter.com/user_guide/libraries/uploaded_files.html> |
| Validasi fail (`uploaded`, `max_size`, `ext_in`, `mime_in`) | <https://codeigniter.com/user_guide/libraries/validation.html#rules-for-file-uploads> |
| Response — `download()` | <https://codeigniter.com/user_guide/outgoing/response.html> |
| OWASP File Upload Cheat Sheet | <https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html> |
| PHP — muat naik fail & had `php.ini` | <https://www.php.net/manual/en/features.file-upload.php> |

## Hari 8 — Modul Pas (2)

| Topik | Pautan |
|-------|--------|
| Shield — authorization (groups, permissions, matrix) | <https://shield.codeigniter.com/latest/references/authorization/> |
| Shield — guna authorization (panduan pantas) | <https://shield.codeigniter.com/latest/quick_start_guide/using_authorization/> |
| Shield — controller filters (`session`, `group:`, `permission:`) | <https://shield.codeigniter.com/latest/references/controller_filters/> |
| Shield — urus pengguna | <https://shield.codeigniter.com/latest/user_management/managing_users/> |
| Controller filters CI4 | <https://codeigniter.com/user_guide/incoming/filters.html> |
| Ujian ciri (`FeatureTestTrait`) | <https://codeigniter.com/user_guide/testing/feature.html> |
| Ujian — respons (`assertStatus`, `assertRedirectTo`) | <https://codeigniter.com/user_guide/testing/response.html> |
| Shield — ujian (`actingAs`) | <https://shield.codeigniter.com/latest/references/testing/> |
| OWASP Authorization Cheat Sheet (IDOR) | <https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html> |

## Hari 9 — Modul Laporan

| Topik | Pautan |
|-------|--------|
| Query Builder — `selectCount`, `groupBy`, `join` | <https://codeigniter.com/user_guide/database/query_builder.html> |
| Pagination dengan query string | <https://codeigniter.com/user_guide/libraries/pagination.html> |
| Dompdf | <https://github.com/dompdf/dompdf> |
| PhpSpreadsheet | <https://phpspreadsheet.readthedocs.io/en/latest/> |
| OWASP — CSV/Formula Injection | <https://owasp.org/www-community/attacks/CSV_Injection> |

## Hari 10 — Modul Statistik & Capstone

| Topik | Pautan |
|-------|--------|
| Caching (`cache()->remember()`) | <https://codeigniter.com/user_guide/libraries/caching.html> |
| Response JSON (`setJSON`) | <https://codeigniter.com/user_guide/outgoing/response.html> |
| Chart.js 4 | <https://www.chartjs.org/docs/latest/> |
| Chart.js — jenis carta (bar, doughnut, line) | <https://www.chartjs.org/docs/latest/charts/bar.html> |
| Keselamatan CI4 (CSRF) | <https://codeigniter.com/user_guide/libraries/security.html> |
| Amalan keselamatan CI4 (OWASP) | <https://codeigniter.com/user_guide/concepts/security.html> |
| Content Security Policy | <https://codeigniter.com/user_guide/outgoing/csp.html> |
| Logging | <https://codeigniter.com/user_guide/general/logging.html> |

---

## Persekitaran (rujuk [`persediaan.md`](./persediaan.md))

| Alat | Pautan |
|------|--------|
| Composer | <https://getcomposer.org/download/> |
| Laragon (Windows — stack kursus) | <https://laragon.org/download> |
| Laravel Herd (macOS; kursus ini guna Laragon untuk Windows) | <https://herd.laravel.com/> |
| MySQL Community | <https://dev.mysql.com/downloads/> |
| MariaDB | <https://mariadb.org/download/> |
| Git (Windows: Git for Windows + Git Bash) | <https://git-scm.com/downloads> |
| VS Code | <https://code.visualstudio.com/> |
