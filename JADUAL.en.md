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

> ℹ️ Day 7 focuses on Claude Code. S13/S14 (Labs 7.10/7.11), the Pass sessions S1–S8 and the manual Labs 7.0–7.4 (and 7.1b–7.4b) are in the Day 7 Appendix as reference.

> ℹ️ From Day 8 to Day 10, the class works as **one team** in the espkpv2 repo (GitLab KKM `aplikasi-baharu/espkpv2`): Day 8 morning in 3 rotating squads, then **two fixed teams** — Projek (PM, BA, 2 QA) and Dev (4 pairs + a floater) — every role assisted by Claude Code ([`peranan-pasukan.en.md`](./docs/peranan-pasukan.en.md), [`kolaborasi.en.md`](./docs/kolaborasi.en.md) §6).

## Day 8 — Team Work with Claude Code: Sprint 1 · [notes](./hari-8/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Day 7 recap, squad formation & role cards | — |
| 09:00–10:30 | S15 | Team setup: espkpv2 on Laragon, shared Claude Code, issue board | Lab 8.20: clone with a token, `composer test` green, `/isu-baharu` + `/semak-mr` + `ci4-spark` loaded, `glab` |
| 10:45–12:30 | S16 | Sprint 1 morning: PM writes the issue, QA plans tests, Dev plans & slice 1 | Lab 8.21: issue `status::sedia` with AC, failing tests from the AC, branch `feat/<no>-…` + `Rujuk #N` commit |
| 14:30–16:00 | S17 | Sprint 1 afternoon (2 fixed teams: Projek & Dev): MR, QA review, BRS issue AC, board | Lab 8.22: MR `Closes #N`, `/semak-mr` comment with an AC table, accurate board |
| 16:00–17:00 | S18 | Merge, conflict drill, pair demo & retro | Lab 8.23: MRs merged, `Routes.php` conflict resolved, 2-minute demo, retro issue |

> ℹ️ The individual Day 8 Pass module sessions (S1–S12, Labs 8.0–8.13) are in the Day 8 Appendix as reference.

## Day 9 — Team Work: Sprint 2 · [notes](./hari-9/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:15–08:30 | — | Jira & `atlassian` MCP setup (Jira seat holders) | Lab 9.20: `/mcp` → `atlassian` ✔, space `KAN` |
| 08:30–09:00 | — | Stand-up of the Projek and Dev teams | — |
| 09:00–10:30 | S13 | Sprint 2 planning, PM sync, test plan & slice 1 | Lab 9.20: Sprint 2 started in Jira (`pasangan-N`), PM sync note, failing test from the AC, Sprint 2 branch |
| 10:45–12:30 | S14 | Build Sprint 2: P1 #13/#22 reminders · P2 #9/#25 password & phone · P3 #17/#26 RPT-10 & yearly report · P4 #21/#23 Hilang workflow · floater #8/#24; Projek: Sprint 3 AC | Lab 9.21: slice by slice with tests; risk check (idempotency, training accounts, CSP, export limits, `Aliran.php`) |
| 14:30–16:00 | S15 | MR, QA review & exploratory testing between pairs | Lab 9.22: `Ready` MR + `/semak-mr`; ≥ 1 Jira Bug card from exploratory testing |
| 16:00–17:00 | S16 | Merge, green `main` (PHPUnit + E2E), sprint demo, retro, v1.1.0 scope | Lab 9.23: all MRs merged, `composer test` + `npm run e2e` green |

> ℹ️ The individual Reports module sessions (S1–S12, Labs 9.1–9.13) are in the Day 9 Appendix as reference.

## Day 10 — Team Work: Sprint 3, Release v1.1.0 & Capstone · [notes](./hari-10/README.md)

| Time | Session | Activity | Session objective |
|------|------|----------|---------------|
| 08:30–09:00 | — | Stand-up of the Projek and Dev teams | — |
| 09:00–12:30 | S8 | Sprint 3 in Jira: cards from #14, #15, #18, #27–#32 (by `pasangan-N`) + critical bugs · **feature freeze 12:30** | Lab 10.20: cards *Done* or moved with a reason; `main` green |
| 14:30–15:15 | S9 | Release v1.1.0 | Lab 10.21: CHANGELOG (Jira version `v1.1.0` + MRs) through an MR, tag `v1.1.0` + Release, Jira version released |
| 15:15–16:30 | S10 | Capstone demo (Projek 12 minutes + 10 minutes per Dev pair) | Lab 10.22: PM · BA · QA · Dev pairs · work-line questions for every member ([rubric](./docs/rubrik-capstone.en.md) §8) |
| 16:30–17:00 | S11 | Team retro & Claude Code reflection, closing | Lab 10.22: every member's final retro comment |

> ℹ️ The individual Statistics & capstone sessions (S1–S7, Labs 10.1–10.12) are in the Day 10 Appendix as reference.

---

*The timetable can be adjusted to actual needs during the course.*
