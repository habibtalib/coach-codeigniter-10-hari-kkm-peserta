# Official Reference Links — by day

> All links checked in September 2026. CodeIgniter documentation refers to the **latest 4.x version** (compatible with 4.6+). If an example in the documentation differs from the course notes, **SPEC-KURSUS.md decides the names**, and the official documentation decides the **API**.
> Topic notes: [`../nota/README.md`](../nota/README.md)

## Core references (keep open throughout the course)

| Source | Link |
|--------|--------|
| CodeIgniter 4 User Guide | <https://codeigniter.com/user_guide/> |
| CodeIgniter Shield | <https://shield.codeigniter.com/latest/> |
| PHP Manual | <https://www.php.net/manual/en/> |
| Bootstrap 5.3 | <https://getbootstrap.com/docs/5.3/> · Icons: <https://icons.getbootstrap.com/> |
| Mermaid | <https://mermaid.js.org/intro/> |
| OWASP Top 10 | <https://owasp.org/Top10/> |

> Tip: in the CI4 User Guide, use the search box at the top left. Make sure the page is not for **CodeIgniter 3** (`codeigniter.com/userguide3/`).

---

## Day 1 — Project Kickoff & Requirement Deep Dive

| Topic | Link |
|-------|--------|
| Requirements interview techniques (IIBA — Elicitation) | <https://www.iiba.org/business-analysis-blogs/> |
| MoSCoW prioritisation | <https://www.agilebusiness.org/dsdm-project-framework/moscow-prioritisation.html> |
| Non-functional requirements (ISO/IEC 25010) | <https://iso25000.com/index.php/en/iso-25000-standards/iso-25010> |

## Day 2 — Requirement Finalization & Process Flow

| Topic | Link |
|-------|--------|
| Mermaid flowchart (as-is/to-be process flow) | <https://mermaid.js.org/syntax/flowchart.html> |
| Mermaid state diagram (`BookingStatus`/`PassStatus` status chart) | <https://mermaid.js.org/syntax/stateDiagram.html> |
| Given/When/Then (Gherkin) | <https://cucumber.io/docs/gherkin/reference/> |

## Day 3 — Database Design & UI/UX Foundation

| Topic | Link |
|-------|--------|
| Mermaid ERD | <https://mermaid.js.org/syntax/entityRelationshipDiagram.html> |
| MySQL 8 — data types | <https://dev.mysql.com/doc/refman/8.0/en/data-types.html> |
| MySQL 8 — indexes | <https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html> |
| Bootstrap 5.3 — form components | <https://getbootstrap.com/docs/5.3/forms/overview/> |
| draw.io | <https://app.diagrams.net/> |
| Excalidraw | <https://excalidraw.com/> |

## Day 4 — Assignment Review & Development Kickoff

| Topic | Link |
|-------|--------|
| CI4 server requirements | <https://codeigniter.com/user_guide/intro/requirements.html> |
| Install with Composer (`appstarter`) | <https://codeigniter.com/user_guide/installation/installing_composer.html> |
| Application structure | <https://codeigniter.com/user_guide/concepts/structure.html> |
| MVC in CI4 | <https://codeigniter.com/user_guide/concepts/mvc.html> |
| Configuration & `.env` | <https://codeigniter.com/user_guide/general/configuration.html> |
| Routing | <https://codeigniter.com/user_guide/incoming/routing.html> |
| Controller | <https://codeigniter.com/user_guide/incoming/controllers.html> |
| View layouts | <https://codeigniter.com/user_guide/outgoing/view_layouts.html> |
| Migration | <https://codeigniter.com/user_guide/dbmgmt/migration.html> |
| Database Forge | <https://codeigniter.com/user_guide/dbmgmt/forge.html> |
| Seeder | <https://codeigniter.com/user_guide/dbmgmt/seeds.html> |
| Spark commands | <https://codeigniter.com/user_guide/cli/spark_commands.html> |
| Shield — installation | <https://shield.codeigniter.com/latest/getting_started/install/> |
| Shield — concepts | <https://shield.codeigniter.com/latest/getting_started/concepts/> |
| Shield — add user fields (`full_name`, `staff_no`…) | <https://shield.codeigniter.com/latest/customization/adding_attributes_to_users/> |
| Git — Pro Git book (chapters 2–3) | <https://git-scm.com/book/en/v2> |

## Day 5 — TLK Module (1)

| Topic | Link |
|-------|--------|
| Model | <https://codeigniter.com/user_guide/models/model.html> |
| Entity | <https://codeigniter.com/user_guide/models/entities.html> |
| PHP backed enum | <https://www.php.net/manual/en/language.enumerations.backed.php> |
| PHP `match` | <https://www.php.net/manual/en/control-structures.match.php> |
| Validation | <https://codeigniter.com/user_guide/libraries/validation.html> |
| Form helper (`form_open`, `old`) | <https://codeigniter.com/user_guide/helpers/form_helper.html> |
| Pagination | <https://codeigniter.com/user_guide/libraries/pagination.html> |
| Common functions (`esc`, `old`, `redirect`) | <https://codeigniter.com/user_guide/general/common_functions.html> |

## Day 6 — TLK Module (2)

| Topic | Link |
|-------|--------|
| Query Builder | <https://codeigniter.com/user_guide/database/query_builder.html> |
| Transactions | <https://codeigniter.com/user_guide/database/transactions.html> |
| MySQL — *locking reads* (`SELECT … FOR UPDATE`) | <https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html> |
| Services (`app/Config/Services.php`) | <https://codeigniter.com/user_guide/concepts/services.html> |
| Testing — overview | <https://codeigniter.com/user_guide/testing/overview.html> |
| Testing — database | <https://codeigniter.com/user_guide/testing/database.html> |
| PHPUnit 10 | <https://docs.phpunit.de/en/10.5/> |

## Day 7 — Pass Module (1)

| Topic | Link |
|-------|--------|
| Uploaded files (`UploadedFile`) | <https://codeigniter.com/user_guide/libraries/uploaded_files.html> |
| File validation (`uploaded`, `max_size`, `ext_in`, `mime_in`) | <https://codeigniter.com/user_guide/libraries/validation.html#rules-for-file-uploads> |
| Response — `download()` | <https://codeigniter.com/user_guide/outgoing/response.html> |
| OWASP File Upload Cheat Sheet | <https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html> |
| PHP — file uploads & `php.ini` limits | <https://www.php.net/manual/en/features.file-upload.php> |

## Day 8 — Pass Module (2)

| Topic | Link |
|-------|--------|
| Shield — authorization (groups, permissions, matrix) | <https://shield.codeigniter.com/latest/references/authorization/> |
| Shield — using authorization (quick start guide) | <https://shield.codeigniter.com/latest/quick_start_guide/using_authorization/> |
| Shield — controller filters (`session`, `group:`, `permission:`) | <https://shield.codeigniter.com/latest/references/controller_filters/> |
| Shield — managing users | <https://shield.codeigniter.com/latest/user_management/managing_users/> |
| CI4 controller filters | <https://codeigniter.com/user_guide/incoming/filters.html> |
| Feature testing (`FeatureTestTrait`) | <https://codeigniter.com/user_guide/testing/feature.html> |
| Testing — responses (`assertStatus`, `assertRedirectTo`) | <https://codeigniter.com/user_guide/testing/response.html> |
| Shield — testing (`actingAs`) | <https://shield.codeigniter.com/latest/references/testing/> |
| OWASP Authorization Cheat Sheet (IDOR) | <https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html> |

## Day 9 — Report Module

| Topic | Link |
|-------|--------|
| Query Builder — `selectCount`, `groupBy`, `join` | <https://codeigniter.com/user_guide/database/query_builder.html> |
| Pagination with a query string | <https://codeigniter.com/user_guide/libraries/pagination.html> |
| Dompdf | <https://github.com/dompdf/dompdf> |
| PhpSpreadsheet | <https://phpspreadsheet.readthedocs.io/en/latest/> |
| OWASP — CSV/Formula Injection | <https://owasp.org/www-community/attacks/CSV_Injection> |

## Day 10 — Statistics Module & Capstone

| Topic | Link |
|-------|--------|
| Caching (`cache()->remember()`) | <https://codeigniter.com/user_guide/libraries/caching.html> |
| JSON response (`setJSON`) | <https://codeigniter.com/user_guide/outgoing/response.html> |
| Chart.js 4 | <https://www.chartjs.org/docs/latest/> |
| Chart.js — chart types (bar, doughnut, line) | <https://www.chartjs.org/docs/latest/charts/bar.html> |
| CI4 security (CSRF) | <https://codeigniter.com/user_guide/libraries/security.html> |
| CI4 security practices (OWASP) | <https://codeigniter.com/user_guide/concepts/security.html> |
| Content Security Policy | <https://codeigniter.com/user_guide/outgoing/csp.html> |
| Logging | <https://codeigniter.com/user_guide/general/logging.html> |

---

## Environment (see [`persediaan.md`](./persediaan.md))

| Tool | Link |
|------|--------|
| Composer | <https://getcomposer.org/download/> |
| Laragon (Windows — course stack) | <https://laragon.org/download> |
| Laravel Herd (macOS; this course uses Laragon for Windows) | <https://herd.laravel.com/> |
| MySQL Community | <https://dev.mysql.com/downloads/> |
| MariaDB | <https://mariadb.org/download/> |
| Git (Windows: Git for Windows + Git Bash) | <https://git-scm.com/downloads> |
| VS Code | <https://code.visualstudio.com/> |
