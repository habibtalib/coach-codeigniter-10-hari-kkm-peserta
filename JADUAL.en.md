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
| 09:00–10:00 | S1 | MySQL database & `.env` | Create the databases & the `kkm_dev` user; connect the project |
| 10:00–10:30 | S5 | S1 follow-up: test database & `.env.example` | Connect the `tests` group; commit a secret-free template |
| 10:45–11:50 | S2 | First migrations & seeders | Write the `departments` & `parking_zones` migrations; idempotent seeders |
| 11:50–12:30 | S6 | S2 follow-up: Query Builder in the console | Run queries in `php spark shell`; read the real SQL |
| 14:30–15:20 | S3 | Model & the `/jabatan` pages | Build a model with validation; list & new form |
| 15:20–16:00 | S7 | S3 follow-up: edit a department | Build an edit form with `update()` and `is_unique` `{id}` |
| 16:00–16:35 | S4 | `/zon` search & pagination | Build a Query Builder search & pagination on your own |
| 16:35–17:00 | S8 | S4 follow-up: zone details & sorting; wrap-up | Build a details page with a 404 and whitelisted sorting |

## Day 4 — Development Kickoff: Shield, Full Schema & Git Flow · [notes](./hari-4/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 3 recap | — |
| 09:00–10:00 | S1 | Own-repo demo & the request cycle | Demo your GitLab repo & `/zon`; trace the CI4 MVC request flow with the Debug Toolbar |
| 10:00–10:30 | S5 | S1 follow-up: tracing the POST `/jabatan` request | Trace a POST with the Debug Toolbar History & `filter:check`; compare it with a GET |
| 10:45–12:00 | S2 | Project structure, `.env` + Shield | Complete `.env`, install Shield, roles & the Bootstrap layout |
| 12:00–12:30 | S6 | S2 follow-up: Shield filters on the Day 3 pages | Put `session` & `permission:admin.access` on `/jabatan`, `/zon`; test with two accounts |
| 14:30–15:30 | S3 | Migrations & seeders from the reference ERD | Write the 8 remaining migrations + seeders; `php spark migrate` succeeds |
| 15:30–16:00 | S7 | S3 follow-up: FK & `ON DELETE` drills | Prove `RESTRICT`/`SET NULL`/`CASCADE` inside a transaction; `ReferenceSequenceSeeder` |
| 16:00–16:35 | S4 | Solo Git flow & merge request | Push `SETUP:`, open the first MR, branch plan & the Definition of Done |
| 16:35–17:00 | S8 | S4 follow-up: second merge request; wrap-up | MR with a review comment + fix commit; delete the branch after merging |

## Day 5 — TLK Module (Part 1) · [notes](./hari-5/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 4 recap | — |
| 09:00–10:00 | S1 | Migrations & Models for vehicle/slot/booking | Write Models with `$allowedFields`, `$validationRules`, Entity & enum |
| 10:00–10:30 | S5 | S1 follow-up: Model rules for zones & vehicles | Write rules + Malay messages (`{id}`, `{value}`); test with `Model::validate()` & a unit test |
| 10:45–12:00 | S2 | Basic CRUD Controller & View | Build slot CRUD (admin) & a booking list with pagination |
| 12:00–12:30 | S6 | S2 follow-up: zone CRUD (admin) | Build zone CRUD at `/admin/slot/zon`; block deleting a zone that still has slots |
| 14:30–15:30 | S3 | Application form & input validation | Build the booking form with server-side validation + `TLK-` reference number |
| 15:30–16:00 | S7 | S3 follow-up: vehicle registration form | Build `/kenderaan` with normalisation, the custom rule `valid_plate_no` & `user_id` from the session |
| 16:00–16:35 | S4 | Manual testing & review | Carry out the manual test list & record bugs |
| 16:35–17:00 | S8 | S4 follow-up: manual testing round 2; wrap-up | Run 12 zone & vehicle cases; record BUG-ZON-001; clean up the test data |

## Day 6 — TLK Module (Part 2) · [notes](./hari-6/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 5 recap | — |
| 09:00–10:00 | S1 | Slot availability check logic | Write the date-range overlap query & the free-slot view |
| 10:00–10:30 | S5 | S1 follow-up: the busy-slot board | Build a board of active bookings per date range with a `JOIN`; restricted to approvers |
| 10:45–12:00 | S2 | Overlap control & status (pending/approved/rejected) | Enforce BR-TLK-01/04/05 in a transaction; status transitions + log |
| 12:00–12:30 | S6 | S2 follow-up: the `tlk:expire` command | Expire bookings through `transition()`; watch the command wait for a row lock |
| 14:30–15:30 | S3 | Module functional testing | Write PHPUnit tests for overlap & status transitions |
| 15:30–16:15 | S7 | S3 follow-up: tests for the new rules + Claude Code | Test the busy board & expiry; test cases suggested by Claude Code verified by running |
| 16:15–16:40 | S4 | UI improvements; module wrap-up | Add status badges, flash messages, confirmation; **M1 complete** |
| 16:40–17:00 | S8 | S4 follow-up: polish *Tempahan Saya* (My Bookings); wrap-up | Status tabs with counts, Cancel right from the list |

## Day 7 — Pass Module (Part 1) · [notes](./hari-7/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 6 recap | — |
| 09:00–10:00 | S9 | Claude Code: install, `CLAUDE.md` & Plan mode | Write the project `CLAUDE.md` to the course standard; user/project/local memory |
| 10:00–10:30 | S12 | Claude Code: prompting, new projects & PRD | Write onboarding and plan prompts in Plan mode; draft and review a practice PRD |
| 10:45–11:45 | S10 | Claude Code: subagents & skills | Read-only `semak-ci4` subagent on Day 6 code; `migration-ci4` skill |
| 11:45–12:30 | S11 | Claude Code: MCP for CodeIgniter | `ci4-spark` MCP server (PHP, read-only); Context7; MySQL/GitLab optional |
| 14:30–15:30 | S1 | Pass application migration & Model | Write the `PassApplication` & `PassDocument` Model/Entity |
| 15:30–16:45 | S2 | Basic CRUD Controller & View | Build the list (owner scope) & detail view |
| 16:45–17:00 | S5, S6 | Follow-ups if time allows; wrap-up | Lab 7.1b / 7.2b |

> ℹ️ Lab 7.3, 7.4 (and 7.3b/7.4b) continue on Day 8 morning.

## Day 8 — Pass Module (Part 2) · [notes](./hari-8/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 7 recap | — |
| 09:00–10:00 | S1 | Approval flow apply → review → approve/reject | Implement `PassWorkflowService` with `PassStatus::canTransitionTo()` |
| 10:00–10:30 | S5 | S1 follow-up: bulk start review | Build a bulk action through `startReview()`; report partial failures |
| 10:45–12:00 | S2 | Role-based access control | Configure Shield groups/permissions + route filters + ownership check |
| 12:00–12:30 | S6 | S2 follow-up: protecting the bulk route | Add `permission:pas.review`; `fetch()` attack + 4-role matrix |
| 14:30–15:30 | S3 | Status log/history & functional tests | Display the `status_logs` timeline; positive & negative access tests |
| 15:30–16:00 | S7 | S3 follow-up: bulk action feature tests | Write `PassBatchReviewTest` + 2 mutations |
| 16:00–16:35 | S4 | Pass Module wrap-up | Full 3-role flow demo; **M2 done** |
| 16:35–17:00 | S8 | S4 follow-up: `admin` role demo | Demo the admin; record the separation-of-duties finding in `docs/demo-m2.md` |

## Day 9 — Report Module · [notes](./hari-9/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 8 recap (Pass flow + RBAC) | — |
| 09:00–10:00 | **S1** | Report design (types, search/filter criteria) | O1, O2 |
| 10:00–10:30 | **S5** | S1 follow-up: quick periods & active filter chips | O7 |
| 10:45–12:00 | **S2** | Aggregate queries & data search | O3 |
| 12:00–12:30 | **S6** | S2 follow-up: status summary & RPT-03 JUMLAH row | O8 |
| 14:30–15:30 | **S3** | PDF/Excel export | O4, O6 |
| 15:30–16:00 | **S7** | S3 follow-up: Excel Summary sheet & PDF summary | O9 |
| 16:00–16:35 | **S4** | Testing the reports module — **M3 done** | O5, O6 |
| 16:35–17:00 | **S8** | S4 follow-up: summary tests & mutations; wrap-up | O10 |

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
