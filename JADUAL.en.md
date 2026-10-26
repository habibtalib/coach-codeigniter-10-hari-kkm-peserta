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

## Day 7 — Claude Code: Implementation & Best Practice · [notes](./hari-7/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 6 recap | — |
| 09:00–09:45 | S9 | Claude Code: install, `CLAUDE.md` & Plan mode | Write the project `CLAUDE.md` to the course standard; user/project/local memory |
| 09:45–10:30 | S12 | Claude Code: prompting, new projects & PRD | Write onboarding and plan prompts in Plan mode; draft and review a practice PRD |
| 10:45–11:30 | S17 | The art of the prompt: anatomy & example catalogue | Lab 7.14: rewrite 5 weak prompts; run 6 catalogue prompts ([`seni-prompt.en.md`](./docs/seni-prompt.en.md)) in Plan mode and score the answers |
| 11:30–12:00 | S10 | Claude Code: subagents & skills | Read-only `semak-ci4` subagent on Day 6 code; `migration-ci4` skill |
| 12:00–12:30 | S11 | Claude Code: MCP for CodeIgniter | `ci4-spark` MCP server (PHP, read-only); Context7; MySQL/GitLab optional |
| 14:30–15:30 | S18 | Claude Code best practice | Lab 7.15: context (`/context`, `/compact`, `/clear`), `/rewind`, allow/deny, `sekat-env` + `php -l` hooks, `claude -p` review, Git, security |
| 15:30–16:15 | S15 | Claude Code: understand the eSPKP example project | Lab 7.12: 6 Plan-mode onboarding prompts on eSPKP Contoh, verified with `file:line` and a 2-role demo |
| 16:15–17:00 | S16 | Claude Code: plan & adjust requirements from the example project | Lab 7.13: PRD from code, gap table vs SPEC, `docs/keperluan-pas.md` + `docs/pelan-pas.md` |

> ℹ️ Day 7 focuses on Claude Code. S13/S14 (Labs 7.10/7.11) are done on Day 8 morning; the Pass sessions S1–S8 and the manual Labs 7.0–7.4 (and 7.1b–7.4b) are in the Day 7 Appendix as reference code.

> ℹ️ From Day 8 to Day 10, modules are built with Claude Code ([`kolaborasi.en.md`](./docs/kolaborasi.en.md) §3).

## Day 8 — Pass Module (Part 2) · [notes](./hari-8/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 7 recap | — |
| 09:00–10:30 | S13 (Day 7) | Claude Code: Pass slice 1 — model, list & detail | Lab 7.10: enums, `ownedBy()` Model, list & detail with 404 for non-owners, guided by `docs/keperluan-pas.md` and `docs/pelan-pas.md` ([Lab 7.10](./hari-7/lab.en.md#lab-710--claude-code-pass-slice-1--migrationenummodel-owner-scoped-list--detail-s13)) |
| 10:45–12:30 | S14 (Day 7) | Claude Code: Pass slice 2 — form & secure upload | Lab 7.11: form + CSRF, file validation, random names outside `public/`, transaction + clean-up ([Lab 7.11](./hari-7/lab.en.md#lab-711--claude-code-pass-slice-2--form-validation--secure-document-upload-s14)) |
| 14:30–15:30 | S9 | Claude Code: Pass approval flow (slice 3) | Lab 8.10: `PassWorkflowService` with `PassStatus::canTransitionTo()` through the plan and diff gates |
| 15:30–16:30 | S10 | Claude Code: Shield RBAC & access scope (slice 4) | Lab 8.11: the `permission:` filter, `authorize()` and `canView()` proven with `filter_check` and an attack |
| 16:30–17:00 | S11 | Claude Code: access tests & status history (slice 5) — essentials | Lab 8.12 (essentials): role × action matrix and positive & negative `PassAccessTest` |

> ℹ️ **Labs 8.12 and 8.13:** Lab 8.12 is completed, and Lab 8.13 (S12, M2 demo & merge) runs, at the start of Day 9 08:30–09:00 or as homework.

> ℹ️ Modules are built with Claude Code through the 7 review gates ([`kolaborasi.en.md`](./docs/kolaborasi.en.md) §3); today's manual labs are reference code, not required.

## Day 9 — Report Module · [notes](./hari-9/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 8 recap (Pass flow + RBAC) | — |
| 09:00–10:30 | **S9** | Claude Code: `ReportService` & whitelisted filters (slice L1) | O11 |
| 10:45–12:30 | **S10** | Claude Code: list views & RPT-03 (slice L2) | O12 |
| 14:30–16:00 | **S11** | Claude Code: safe PDF & Excel export (slice L3) | O13 |
| 16:00–17:00 | **S12** | Claude Code: report tests & performance — **M3 done** | O14 |

> ℹ️ Modules are built with Claude Code through the 7 review gates ([`kolaborasi.en.md`](./docs/kolaborasi.en.md) §3); today's manual labs are reference code, not required.

## Day 10 — Statistics Module & Capstone · [notes](./hari-10/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 9 recap (reports & export) | — |
| 09:00–10:30 | **S5** | Claude Code: Statistics module slices 1–2 (KPIs, chart datasets, `/statistik/data`) — Lab 10.10 | O1, O7 |
| 10:45–11:45 | **S5** | Claude Code: Statistics module slices 3–4 (Chart.js, cache + invalidation after commit) | O2, O3, O7 |
| 11:45–12:30 | **S3** | Manual UAT across the 4 modules + K1–K10 (Lab 10.3 steps 1–3 and 5) | O4 |
| 14:30–16:00 | **S6** | Claude Code: capstone preparation (`semak-ci4`, AI-08, AI-09, AI-18, tag) — Lab 10.11 | O5, O8 |
| 16:00–17:00 | **S7** | Capstone demo (S4 format) & Claude Code reflection — Lab 10.12 | O6, O9 |

> ℹ️ Modules are built with Claude Code through the 7 review gates ([`kolaborasi.en.md`](./docs/kolaborasi.en.md) §3); today's manual labs are reference code, not required.

---

*The timetable can be adjusted to actual needs during the course.*
