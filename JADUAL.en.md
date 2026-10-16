# JADUAL — Official 10-Day Programme (CI-KKM-10)

> Follows the **Tentative Schedule for the KKM CodeIgniter Course** (RH Dynamic Resources). Fixed breaks every day: **10:30–10:45** (morning) · **12:30–14:30** (lunch). No afternoon break. Canon: [`docs/spesifikasi-sistem.md`](./docs/spesifikasi-sistem.md).

## Phase summary

| Phase | Day | Focus | Phase output |
|------|------|-------|-------------|
| **A — Understand & Build CI Basics** | 1–3 | Requirements (Day 1 + Day 2 S1), project `kelas-ci-<nama>` on GitLab, routes/views/forms, database & migrations | An individual CI4 project on GitLab with a form & the first migrations |
| **B — Set Up & Build** | 4–8 | CI4 environment, migrations, **M1 TLK**, **M2 Pass** | Two working, tested transaction modules |
| **C — Report & Hand Over** | 9–10 | **M3 Report**, **M4 Statistics**, final testing, demo | Complete system demonstrated to the system owner |

---

## Day 1 — Project Kickoff & Requirement Deep Dive · [notes](./hari-1/README.md)

| Time | Session | Activity | Session objective (participants can…) |
|------|------|----------|-------------------------------|
| 08:30–09:00 | — | Registration / introduction | — |
| 09:00–10:30 | S1 | Project briefing & scope of work; meet the team & the system owner | State the goals, scope & limits of the 4 modules; identify the stakeholders |
| 10:45–12:30 | S2 | Requirement deep-dive — **TLK module** | Gather TLK (Special Vehicle Parking) requirements through structured interviews; record *pain points* |
| 14:30–16:00 | S3 | Requirement deep-dive — **Pass module** | Gather Pass requirements, including documents & approval stages |
| 16:00–17:00 | S4 | Initial list of functional & non-functional requirements; local CI4 setup (Laragon) & an overview of the existing system's ERD; wrap-up | Write FR/NFR with ID format (`FR-TLK-01`) & classify them with MoSCoW; run CI4 on your laptop (Lab 1.5) |

## Day 2 — Requirement Sign-off & Your CI Project on GitLab · [notes](./hari-2/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 1 recap | — |
| 09:00–10:30 | S1 | Review & confirm the requirements with the system owner | Confirm/reject each FR; record decisions & open questions |
| 10:45–12:30 | S2 | Project `kelas-ci-<nama>` on KKM GitLab | Create the GitLab project & CI4 project; push the first commit |
| 14:30–16:00 | S3 | Route, controller & layout view | Build the first MVC flow, a route parameter, a layout; `php spark routes` |
| 16:00–17:00 | S4 | Form, validation & CSRF; wrap-up | Build a `/daftar` form with validation, flash & CSRF |

## Day 3 — Database, Migrations, Models & Search · [notes](./hari-3/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 2 recap | — |
| 09:00–10:30 | S1 | MySQL database & `.env` | Create the databases & the `kkm_dev` user; connect the project |
| 10:45–12:30 | S2 | First migrations & seeders | Write the `departments` & `parking_zones` migrations; idempotent seeders |
| 14:30–16:00 | S3 | Model & the `/jabatan` pages | Build a model with validation; list & new form |
| 16:00–17:00 | S4 | `/zon` search & pagination; wrap-up | Build a Query Builder search & pagination on your own |

## Day 4 — Development Kickoff: Shield, Full Schema & Git Flow · [notes](./hari-4/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 3 recap | — |
| 09:00–10:30 | S1 | Own-repo demo & the request cycle | Demo your GitLab repo & `/zon`; trace the CI4 MVC request flow with the Debug Toolbar |
| 10:45–12:30 | S2 | Project structure, `.env` + Shield | Complete `.env`, install Shield, roles & the Bootstrap layout |
| 14:30–16:00 | S3 | Migrations & seeders from the reference ERD | Write the 8 remaining migrations + seeders; `php spark migrate` succeeds |
| 16:00–17:00 | S4 | Solo Git flow & merge request; wrap-up | Push `SETUP:`, open the first MR, branch plan & the Definition of Done |

## Day 5 — TLK Module (Part 1) · [notes](./hari-5/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 4 recap | — |
| 09:00–10:30 | S1 | Migrations & Models for vehicles/slots/bookings | Write Models with `$allowedFields`, `$validationRules`, Entity & enum |
| 10:45–12:30 | S2 | Basic CRUD Controller & View | Build slot CRUD (admin) & a booking list with pagination |
| 14:30–16:00 | S3 | Application form & input validation | Build the booking form with server-side validation + `TLK-` reference number |
| 16:00–17:00 | S4 | Manual testing & review; wrap-up | Run the manual test list & record bugs |

## Day 6 — TLK Module (Part 2) · [notes](./hari-6/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 5 recap | — |
| 09:00–10:30 | S1 | Slot availability check logic | Write a date-range overlap query & show free slots |
| 10:45–12:30 | S2 | Overlap control & status (pending/approved/rejected) | Enforce BR-TLK-01/04/05 in a transaction; status transitions + log |
| 14:30–16:00 | S3 | Module functional testing | Write PHPUnit tests for overlap & status transitions |
| 16:00–17:00 | S4 | UI improvements; module wrap-up | Add status badges, flash messages, confirmations; **M1 done** |

## Day 7 — Pass Module (Part 1) · [notes](./hari-7/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 6 recap | — |
| 09:00–10:30 | S1 | Migrations & Model for pass applications | Write the `PassApplication` & `PassDocument` Model/Entity |
| 10:45–12:30 | S2 | Basic CRUD Controller & View | Build the list (owner-scoped) & the detail view |
| 14:30–16:00 | S3 | Form, validation & document upload | Secure file upload (type/size/random name/outside `public`) |
| 16:00–17:00 | S4 | Manual testing & review; wrap-up | Test upload & validation edge cases |

## Day 8 — Pass Module (Part 2) · [notes](./hari-8/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 7 recap | — |
| 09:00–10:30 | S1 | Approval flow apply → review → approve/reject | Implement `PassWorkflowService` with `PassStatus::canTransitionTo()` |
| 10:45–12:30 | S2 | Role-based access control | Configure Shield groups/permissions + route filters + ownership checks |
| 14:30–16:00 | S3 | Status/history log & functional testing | Show the `status_logs` timeline; positive & negative access tests |
| 16:00–17:00 | S4 | Pass module wrap-up | Demo the full flow with 3 roles; **M2 done** |

## Day 9 — Report Module · [notes](./hari-9/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 8 recap | — |
| 09:00–10:30 | S1 | Report design (types, search/filter criteria) | Define the RPT-01..03 specification & the GET filter form |
| 10:45–12:30 | S2 | Aggregate queries & data search | Write `ReportService` (join, `groupBy`, `selectCount`, dynamic filters) |
| 14:30–16:00 | S3 | PDF/Excel export | Generate PDF (Dompdf) & `.xlsx` (PhpSpreadsheet) from the same filters |
| 16:00–17:00 | S4 | Report module testing; wrap-up | Confirm report totals = DB totals; **M3 done** |

## Day 10 — Statistics Module & Capstone · [notes](./hari-10/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 9 recap | — |
| 09:00–10:30 | S1 | Statistics dashboard (charts, cross-module summary) | Build KPI cards + 4 Chart.js charts from a JSON endpoint |
| 10:45–12:30 | S2 | Aggregate queries & basic caching | Use `cache()->remember()` + invalidation when a status changes |
| 14:30–16:00 | S3 | Final system testing & bug fixing | Run the UAT script; reproduce → failing test → fix cycle |
| 16:00–17:00 | S4 | Capstone demo to the system owner & closing | Demo the end-to-end flow; retrospective |

---

*The timetable can be adjusted to actual needs during the course.*
