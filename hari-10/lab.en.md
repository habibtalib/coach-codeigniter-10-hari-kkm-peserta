# Day 10 Lab — Team Work: Sprint 3, Release v1.1.0 & Team Capstone

[← README](./README.en.md) · [Schedule](../JADUAL.en.md) · [👥 Team roles](../docs/peranan-pasukan.en.md) · [📋 Capstone Rubric](../docs/rubrik-capstone.en.md)

| Lab | Session | Time | Output |
|-----|---------|------|--------|
| 10.20 | S8 | 09:00–12:30 | Sprint 3 issues closed or moved; `main` green at the feature freeze |
| 10.21 | S9 | 14:30–15:15 | CHANGELOG 1.1.0 MR, release notes, tag `v1.1.0` + Release |
| 10.22 | S10–S11 | 15:15–17:00 | Team capstone demo, work-line questions, final retro |

> ℹ️ Repo: `aplikasi-baharu/espkpv2`. The issue → MR → merge mechanics are as in [Labs 8.21–8.23](../hari-8/lab.en.md#lab-821--sprint-1-morning-issue-test-plan--first-slice-s16). The individual Statistics & capstone labs (10.1–10.12) are in the [Appendix](#appendix--individual-statistics--capstone-labs-reference).

---

## Lab 10.20 — Sprint 3: Final Features & Freeze (S8)

### 🎯 Objective
Finish every pair's Sprint 3 issues and critical bugs through MRs reviewed by QA before the **12:30 feature freeze**, and make a clear scope decision for unfinished issues.

### Prerequisites
- The latest `main` is green (`git pull`, `composer install`, `php spark migrate --all`, `composer test`).
- The Projek and Dev teams stay the same (issue #19); Sprint 3 issues have AC and a `pasangan::N` label (Lab 9.21).

### Steps

1. **Stand-up and scope (08:30–09:30).** PM:

   ```text
   Run glab issue list --milestone "Sprint 3 + v1.1 (Hari 10)" --label pasukan::dev. For each issue: size, pair, the risk of not finishing before 12:30. Propose a work order: keutamaan::1-kritikal bugs first.
   ```

   The PM decides and updates the *Assignee* and `status::`.

2. **Critical bugs first (Dev + QA).** Each bug: a failing test that shows the bug → fix → green test → MR `fix/<no>-…` with `Closes #<no>`.

   ```text
   This test/E2E fails: <output>. Reproduce first: write one PHPUnit test that fails because of this bug. Do not change code in app/ yet.
   ```

3. **Sprint 3 feature (09:30–11:30).** The rhythm of Labs 8.21–8.22: `/ciri-baharu <no>` → slice (*Manual* mode) → `composer semak` → `semak-espkp` → commit `Rujuk #<no>`.

4. **MR and merge (11:30–12:15).** `/semak-mr <no>` by QA → approve → the PM merges in order.

5. **Freeze (12:30).** Feature MRs not yet merged: switch to draft, comment *"Moved to the backlog after the v1.1.0 freeze: <status, what is left>"*, remove the milestone. After 12:30, only `fix/…` branches can be merged.

### ✅ Checkpoint
- [ ] Every Sprint 3 issue is closed or moved with a comment; `composer test` is green on `main` after the last merge.

---

## Lab 10.21 — Release v1.1.0 (S9)

### 🎯 Objective
Prepare the v1.1.0 release from a green `main`: a CHANGELOG where every line links to a real MR, release notes, an annotated tag and a GitLab Release.

### Steps

1. **Stabilise (QA and the floater, 15 minutes).** On the latest `main`: `composer test` and E2E (the repo README's *Ujian hujung ke hujung (E2E)* section). Failures → a small `fix/…` or a known issue in the release notes.

2. **Draft the CHANGELOG (release PM, 15 minutes).** *Plan* mode:

   ```text
   Run glab mr list --merged for the milestones "Sprint 1 (Hari 8)", "Sprint 2 (Hari 9)" and "Sprint 3 + v1.1 (Hari 10)". Draft CHANGELOG.md with the heading "# Changelog" and a "## [1.1.0] - 2026-10-30" section (Keep a Changelog format: Added, Changed, Fixed, Security). One line per MR with the !no and #issue. Do not write files.
   ```

   The BA and one member of each pair check their issues' lines against the real MRs. A line without an MR → remove it.

3. **CHANGELOG MR.** Branch `docs/changelog-v1.1.0`, paste the checked CHANGELOG, an MR with QA as reviewer, the release PM merges.

4. **Tag and Release (the trainer, in front of the class).** `v*` tags are protected (Maintainer). The release PM reads the release notes; the trainer runs:

   ```bash
   git switch main && git pull --ff-only
   git tag -a v1.1.0 -m "v1.1.0: satu permohonan terbuka, peringatan Pindaan, RPT-10, sejarah log masuk, dasar kata laluan"
   git push origin v1.1.0
   glab release create v1.1.0 --notes-file nota-v1.1.0.md
   ```

### ✅ Checkpoint
- [ ] `glab release view v1.1.0` shows the release notes; `CHANGELOG.md` is on `main`.

---

## Lab 10.22 — Team Capstone Demo & Reflection (S10–S11)

### 🎯 Objective
Demo the team's result on `v1.1.0` with evidence from every role, **explain** one line of your own work (code, test or AC) without Claude, and reflect on using Claude Code in a team.

### Steps

1. **Preparation (10 minutes, before your turn).** `git switch --detach v1.1.0`, `php spark migrate --all`, `php spark serve`. Every member picks one line they committed themselves:

   ```bash
   git log --author="<your name>" --oneline v1.1.0
   ```

   Practise (Claude must not give the answers):

   ```text
   Ask me 3 questions about the line <file:line> I committed, like the capstone panel. Do not give the answers.
   ```

2. **Capstone demo.** The Projek team 12 minutes (PM: backlog & scope decisions; BA: one BRS issue → AC; QA: the tests that prove the AC, one bug caught before merge, E2E). Every Dev pair 10 minutes (the feature in the browser with ≥ 2 accounts, including one that gets a 404; MR and tests). Floater 5 minutes. Panel 18 minutes (work-line questions for every member).

3. **Final retro (S11, 20 minutes).** In the issue `Retro akhir — Pasukan CI-KKM-10`, everyone adds one comment: the role that taught the most, one time Claude sped things up (which prompt) and one time Claude slowed things down or misled (which gate caught it), one rule to take back to the department.

### ✅ Checkpoint
- [ ] The team score sheet ([`rubrik-capstone.en.md`](../docs/rubrik-capstone.en.md) §8) is filled in by the panel.
- [ ] A retro comment from every member.

---

## Self-check — end of day

**Team work (today):** `glab release view v1.1.0 -R aplikasi-baharu/espkpv2`, `glab issue list --milestone "Sprint 3 + v1.1 (Hari 10)" -R aplikasi-baharu/espkpv2`.

- [ ] My team's Sprint 3 issues are closed or moved to the backlog with a reason before the freeze (Lab 10.20).
- [ ] `CHANGELOG.md` 1.1.0 is merged and every line matches a real MR; tag `v1.1.0` exists (Lab 10.21).
- [ ] I explained one line of my work (code, test or AC) without Claude during the demo (Lab 10.22).
- [ ] My final retro comment is added in the team retro issue (Lab 10.22).

**Individual Statistics & capstone (reference, optional):**

```bash
composer test         # all green (including StatisticsCacheTest)
git log --oneline -8  # today's STAT: and FIX: commits
git tag -l            # v1.0-capstone
git status --short    # no output
```

- [ ] `pelulus@latihan.test` → `/statistik` shows 4 KPI cards + 4 charts; `/statistik/data` returns JSON with 12 values in `charts.bookings_by_month.data`.
- [ ] `penyemak@latihan.test` → `/statistik` and `/statistik/data` are blocked.
- [ ] `composer test` is green, including `tests/Services/StatisticsCacheTest.php`.
- [ ] `docs/UAT-signoff.md` §4: UAT-01..UAT-10 has no ⬜; `git log --oneline` shows ≥ 1 `FIX:` commit.
- [ ] `git tag -l` shows `v1.0-capstone` and `git status --short` is empty.

---

## Appendix — Individual Statistics & capstone labs (reference)

> ℹ️ The labs below are the Day 10 labs from before team mode: the Statistics module and the individual capstone in `kelas-ci-<nama>` with Claude Code (Labs 10.10–10.12) or manually (Labs 10.1–10.4). They remain as **reference, optional**.

## Lab 10.10 — Claude Code: Statistics slice by slice (S5)

> 🛡️ **Rules for Labs 10.10–10.12.** Synthetic data only; do not give the contents of `.env` to Claude. Every edit is made in **Manual** mode: you read and approve each diff one at a time. *Accept edits*, *auto* and `bypassPermissions` modes are forbidden, and so are the "Yes, allow all edits…" and "Yes, and don't ask again" options for file edits. The Lab 10.1–10.2 code is **reference code** for the "Compare with the reference code" step, not for retyping.

### 🎯 Objective
Build the Statistics module (M4) with Claude Code in 4 slices (`StatisticsService` + 4 KPIs; chart datasets + JSON endpoint; Chart.js 4 view; cache + invalidation after commit). Each slice goes through the 7-step loop in [README §5.1](./README.md#51-the-7-step-loop-for-each-slice), and 3 key lines per slice are explained in your own words in `docs/nota-claude.md`.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, choose the **PowerShell** tab on command blocks that have two tabs; blocks without tabs run in both terminals.
- Labs 7.6–7.9 done: the project `CLAUDE.md`, the `semak-ci4` subagent, the `ci4-spark` MCP server in `.mcp.json`, and `docs/nota-claude.md`.
- `.claude/settings.json` has `"defaultMode": "default"` (shown as **Manual**) and a `deny` rule for `.env` ([Claude Code tutorial](../docs/tutorial-claude-code.md) §5).
- M1, M2, M3 merged to `main`; `composer test` green; demo data from `DemoDataSeeder` (Lab 9.1 step 0).

### Steps

**1. Branch, session and mode (5 min).**

```bash tab="Git Bash / macOS / Linux"
git switch main && git pull
git switch -c feat/statistik
claude
```

```powershell tab="PowerShell"
git switch main
git pull
git switch -c feat/statistik
claude
```

In Claude Code, type `/mcp`: `ci4-spark` shows *connected*. The bottom line does **not** show *accept edits on* or *plan mode on*: that is Manual mode. If it shows *accept edits on*, press `Shift+Tab` (or `Alt+M`) until there is no mode label.

**2. Loop step 1: SPEC & BR (5 min).** Open [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §2.4, §4, §6 and §9, and README §1.1 and §1.4. Add this section to `docs/nota-claude.md` (you type it):

```text
## Day 10 — Statistics (M4)

| Slice | SPEC / definition | BR / gate | Proof test |
|---|---|---|---|
| 1 KPI | §2.4, §9 service registration, README §1.1 | BR-TLK-04 (active definition) | tests/Services/StatisticsServiceTest.php |
| 2 Data + JSON | §2.4, §4, §6, README §1.4 | G2 | tests/feature/Statistik/StatistikAccessTest.php |
| 3 View | README §1.2, §1.5 | K2 (esc) | browser + semak-ci4 |
| 4 Cache | §2.4, §9 Cache | BR-PAS-01, BR-PAS-05, BR-TLK-05 | tests/Services/StatisticsCacheTest.php |

### Explain gate
| Slice | File:line | What | Why | If removed |
|---|---|---|---|---|

### Diffs I rejected
| Slice | Claude's suggestion | Why I rejected it |
|---|---|---|
```

**3. Loop step 2: slice plan in Plan mode (15 min).** Press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste:

```text
Plan mode. Do not change any files.
Context: @docs/spesifikasi-sistem.md §2.4 (M4 Statistics), §4 (roles), §6 (routes), §9 (the "Pendaftaran service"
and "Cache" rows), and @CLAUDE.md.
KPI definitions: Active bookings = slot_bookings with status pending/approved (BR-TLK-04). Slot utilisation rate =
distinct slots with an approved booking covering today ÷ active slots (is_active = 1, not deleted) × 100.
Pending passes = pass_applications with status submitted/under_review. Average days to approve =
AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) / 24 for approved_at IS NOT NULL.
Task: propose a 4-slice plan for the Statistics module:
1. StatisticsService::build() with 4 KPIs + register service('statisticsService') + a unit test with a fixed $now.
2. 4 chart datasets (12 months filled with zero; usage_by_zone reuses ReportService::usageByZone()) + dashboard()
   + DashboardController index()/data() + the statistik route group with the permission:statistik.view filter + a feature test.
3. View app/Views/statistik/dashboard.php: KPI cards rendered on the server, 4 <canvas>, Chart.js 4.4.7, fetch /statistik/data.
4. cache()->remember(StatisticsService::CACHE_KEY, 600, ...) + cache()->delete(StatisticsService::CACHE_KEY) AFTER
   every transCommit() in BookingService and PassWorkflowService + a StatisticsCacheTest that is red first.
For each slice: files created/changed, methods, the test that proves it, the verification command, and the risks.
Constraints: CodeIgniter 4.6+, PHP 8.2+, Query Builder only, names exactly as in the SPEC, no new composer packages,
do not touch .env or migrations. Ask me first if anything is unclear.
```

A good plan contains:
- 4 slices that can each be tested on their own, with the files, methods and tests named;
- `StatisticsService::CACHE_KEY = 'stat_dashboard'` and TTL 600 (SPEC §9), `service('statisticsService')`;
- `$now` injected through the constructor so that the "today" KPI can be tested;
- slice 4 starting with a red test, and `cache()->delete(...)` after **every** `transCommit()` (`create()`/`submit()` and `transition()`).

Reject or edit a plan that: merges all slices into one step, adds a migration or a new table, writes a second query for zone usage (instead of `ReportService::usageByZone()`), or puts the invalidation in a controller.

**Edit the plan at least once.** At the plan approval question, choose the option to keep planning and type your corrections, e.g. "Slice 2: add an applicant → not 200 test for /statistik/data." When the plan is right, choose the option that **keeps manual approval** for every edit; never choose an *auto-accept edits* option.

**4. Slice 1: KPIs (25 min).**

**4a. Implement (Manual).** Make sure the bottom line has no mode label, then paste:

```text
Implement Slice 1 only from the plan.
- app/Services/StatisticsService.php: CACHE_KEY = 'stat_dashboard', CACHE_TTL = 600, constructor
  (?BaseConnection $db = null, ?DateTimeImmutable $now = null), build() that returns generated_at and kpi
  (active_bookings, slot_utilisation, pending_passes, avg_days_to_approve). charts = [] for now.
- Register statisticsService in app/Config/Services.php (SPEC §9).
- tests/Services/StatisticsServiceTest.php: its own synthetic fixtures, a fixed $now of 2026-09-25 09:00:00, one test per
  KPI, including avg_days_to_approve = null when no pass is approved and slot_utilisation = 0 when there are no active slots.
Use the BookingStatus/PassStatus enums for status values, not typed strings. One file at a time; after each
file, explain the 3 most important lines. Do not run migrations.
```

A good diff: `declare(strict_types=1)`, `whereIn('status', …)` with enum values, `TIMESTAMPDIFF(HOUR, …) / 24`, `$this->now` for "today", a divide-by-zero guard, and tests with `DatabaseTestTrait` (`$migrate`, `$refresh`, `$namespace = null`).

**Reject** (choose **No** and type the reason) if you see: `TIMESTAMPDIFF(DAY`, `status = 'approved'` for the average, `date('Y-m-d')` in the service, `->query("… $x")`, a test that only does `assertIsArray()`, or changes to other services. Example reason: "No: use $this->now, not date(), so the tests do not depend on today's date." Record every rejection in the *Diffs I rejected* table.

**4b. Verify.** In Claude Code:

```text
!composer test -- tests/Services/StatisticsServiceTest.php
```

Expected: `OK (5 tests, …)` or more. Then run yourself, in HeidiSQL/phpMyAdmin, `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');` on the development DB, and compare it with `php spark shell` → `service('statisticsService')->build()['kpi']`.

**4c. Review with `semak-ci4`.**

```text
Use the semak-ci4 subagent to review app/Services/StatisticsService.php, app/Config/Services.php and
tests/Services/StatisticsServiceTest.php: Query Builder/binding, names as in SPEC §9, division by zero,
dependence on today's date, and tests that test nothing.
Table | File:line | Issue | Severity | Suggestion |. Do not change files.
```

Open every file:line yourself. For each valid finding, ask for the fix **one finding at a time** ("Fix finding #1 only"), read the diff, approve it, and repeat 4b.

**4d. Explain gate.** Choose 3 key lines (e.g. `whereIn('status', …)`, `/ 24`, the zero guard) and fill the *Explain gate* table in your own words: what, why, what happens if it is removed. Do not copy Claude's answer.

**4e. Small commit.**

```bash tab="Git Bash / macOS / Linux"
git add app/Services/StatisticsService.php app/Config/Services.php tests/Services/StatisticsServiceTest.php docs/nota-claude.md
git commit -m "STAT: StatisticsService 4 KPI + ujian (slice 1)"
```

```powershell tab="PowerShell"
git add app/Services/StatisticsService.php app/Config/Services.php tests/Services/StatisticsServiceTest.php docs/nota-claude.md
git commit -m "STAT: StatisticsService 4 KPI + ujian (slice 1)"
```

Type `/clear` in Claude Code before the next slice, then `@docs/nota-claude.md` if you need the plan context.

**5. Slice 2: chart datasets + JSON endpoint (30 min).**

**5a. Implement (Manual):**

```text
Implement Slice 2 only.
- In StatisticsService::build() add charts: bookings_by_month (12 months of the current year, empty months = 0),
  pass_status (keys = PassStatus enum values, Malay labels, data), usage_by_zone (reuse ReportService::usageByZone(),
  do not write a second query), pass_trend (last 12 months). The shape must match the contract in Day 10 README §1.4.
- Add dashboard() that returns build() (slice 4 will wrap it with the cache).
- app/Controllers/Statistik/DashboardController.php: index() shows the view with kpi;
  data() returns $this->response->setJSON(service('statisticsService')->dashboard()).
- app/Config/Routes.php: the statistik route group (namespace App\Controllers\Statistik, filter permission:statistik.view),
  GET / (as statistik) and GET data (as statistik.data), following SPEC §6.
- Unit test: bookings_by_month has 12 values and months with no records = 0.
- tests/feature/Statistik/StatistikAccessTest.php: approver → GET /statistik/data 200 JSON; applicant → not 200.
One file at a time; explain the 3 most important lines after each file.
```

A good diff: `array_column($rows, 'total', 'm')` + a 1..12 loop with `?? 0`, `groupBy` on the alias, `keys` separate from `labels`, a controller with no queries, and one route group with the filter.

**Reject** if: the zone usage query is rewritten in `StatisticsService`, the controller calls `db_connect()`, a route has no filter or only the `session` filter, the access test covers only the allowed role, or `labels` are used as colour keys.

**5b. Verify:**

```text
!composer test
```

Expected: all green, including `StatistikAccessTest`. Then ask `ci4-spark`:

```text
Use the ci4-spark tools: list the statistik routes and the filters for GET /statistik/data. Are both routes protected by permission:statistik.view?
```

Approve the `ci4-spark - routes` and `ci4-spark - filter_check` calls, and compare with `php spark routes` that you run yourself. In the browser: `pelulus@latihan.test` → `/statistik/data` shows JSON with 12 values in `charts.bookings_by_month.data`; `pemohon1@latihan.test` → blocked.

**5c. Review:**

```text
Use the semak-ci4 subagent to review app/Controllers/Statistik/DashboardController.php, app/Config/Routes.php
(the statistik group) and the charts changes in app/Services/StatisticsService.php: a filter on every statistik route,
no queries in the controller, empty months filled with zero, usage_by_zone reusing ReportService.
Table | File:line | Issue | Severity | Suggestion |. Do not change files.
```

**5d–5e.** Explain gate (3 lines, e.g. the `permission:statistik.view` filter, `array_column(..., 'total', 'm')`, `setJSON()`), then commit:

```bash tab="Git Bash / macOS / Linux"
git add app/ tests/ docs/nota-claude.md
git commit -m "STAT: dataset carta + /statistik/data + ujian akses (slice 2)"
```

```powershell tab="PowerShell"
git add app/ tests/ docs/nota-claude.md
git commit -m "STAT: dataset carta + /statistik/data + ujian akses (slice 2)"
```

**6. Slice 3: Chart.js view (20 min).**

**6a. Implement (Manual):**

```text
Implement Slice 3 only: app/Views/statistik/dashboard.php using the existing layout.
- KPI cards rendered on the server with esc() and number_format(); show — when avg_days_to_approve is null.
- 4 <canvas> (chartBookingsByMonth, chartPassStatus, chartUsageByZone, chartPassTrend), each inside
  <div style="position:relative;height:280px">.
- Chart.js 4.4.7 from https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js, loaded before your script.
- fetch to url_to('statistik.data') with res.ok and Content-Type checks before res.json(); a friendly message on failure.
- A draw() function that calls Chart.getChart(canvas)?.destroy() first. Types: bar, doughnut, horizontal bar
  (indexAxis: 'y'), line; maintainAspectRatio: false.
- Do not use innerHTML for server data; use textContent.
Explain the 3 most important lines when the file is done.
```

A good diff: every `<?= ?>` goes through `esc()` (or `url_to()` wrapped in `esc()`), a `res.ok` check, `indexAxis: 'y'`, `destroy()` before `new Chart()`.

**Reject** if: `innerHTML` with server data, `res.json()` without a `res.ok` check, another Chart.js version or `@latest`, KPIs recalculated in JavaScript, or the view calls `service()`/queries directly.

**6b. Verify.** Log in as `pelulus@latihan.test` → `/statistik`: 4 cards + 4 charts. DevTools (`F12`) → *Console*: no red errors; *Network* → `data`: status 200, `Content-Type: application/json`. Then `!composer test`: green.

**6c. Review:**

```text
Use the semak-ci4 subagent to review app/Views/statistik/dashboard.php: every <?= without esc(), any use of
innerHTML or insertAdjacentHTML with server data, the res.ok check before res.json(), and URLs built with url_to().
Table | File:line | Issue | Severity | Suggestion |. Do not change files.
```

**6d–6e.** Explain gate (e.g. `res.ok`, `indexAxis: 'y'`, `Chart.getChart(canvas)?.destroy()`), then commit:

```bash tab="Git Bash / macOS / Linux"
git add app/Views/statistik/dashboard.php docs/nota-claude.md
git commit -m "STAT: dashboard Chart.js 4 kad KPI + 4 carta (slice 3)"
```

```powershell tab="PowerShell"
git add app/Views/statistik/dashboard.php docs/nota-claude.md
git commit -m "STAT: dashboard Chart.js 4 kad KPI + 4 carta (slice 3)"
```

**7. Slice 4: cache + invalidation after commit (30 min).**

**7a. Red test first (Manual):**

```text
Implement Slice 4, part A only: write tests/Services/StatisticsCacheTest.php FIRST.
- setUp() calls cache()->delete(StatisticsService::CACHE_KEY).
- Test 1: dashboard() fills the cache (cache()->get(StatisticsService::CACHE_KEY) is not null).
- Test 2: fill the cache, BookingService::approve() on a synthetic pending booking, then the cache must be null.
- Test 3: the same for one PassWorkflowService transition (follow the Shield user pattern in tests/feature/Pas/PassAccessTest.php).
DO NOT change application code. When the file is done, explain which tests should be red now and why.
```

Then run it yourself:

```text
!composer test -- tests/Services/StatisticsCacheTest.php
```

Expected: **red** (dashboard() does not use the cache yet, so test 1 and the `assertNotNull` check in test 2 fail). Keep this output; the checkpoint needs it.

**7b. Implementation (Manual):**

```text
Implement Slice 4, part B. Before changing anything, list every $this->db->transCommit() in
app/Services/BookingService.php and app/Services/PassWorkflowService.php (method + status transition).
Then:
- wrap dashboard() with cache()->remember(self::CACHE_KEY, self::CACHE_TTL, fn (): array => $this->build());
- add ONE line cache()->delete(StatisticsService::CACHE_KEY); AFTER every transCommit() you listed:
  not before the commit, not inside the try block before the commit, not in a controller.
Do not change the tests. One file at a time.
```

A good diff: the `transCommit()` list covers `create()`/`submit()` and `transition()`; every `delete` is on the line **after** `transCommit()`; the key is always `StatisticsService::CACHE_KEY`.

**Reject** if: `delete` comes before `transCommit()` or is in a controller, the string `'stat_dashboard'` is typed in another service, `cache()->clean()`, a TTL other than 600, or any change to `StatisticsCacheTest`.

**7c. Verify:**

```bash tab="Git Bash / macOS / Linux"
grep -n -e "transCommit" -e "CACHE_KEY" app/Services/*.php
composer test
```

```powershell tab="PowerShell"
Select-String -Path app\Services\*.php -Pattern "transCommit|CACHE_KEY"
composer test
```

Expected: every `transCommit` line in `BookingService` and `PassWorkflowService` is followed by a `CACHE_KEY` line; all tests green. In the browser: as `pelulus`, approve one pass application → `/statistik` → "Pas menunggu" (Pending passes) drops immediately.

**7d. Review:**

```text
Use the semak-ci4 subagent to review app/Services/BookingService.php, app/Services/PassWorkflowService.php and
app/Services/StatisticsService.php: every transCommit() followed by cache()->delete(StatisticsService::CACHE_KEY),
no delete before the commit or in a controller, no 'stat_dashboard' string outside StatisticsService,
and cached data that is only a scalar array. Table | File:line | Issue | Severity | Suggestion |. Do not change files.
```

**7e.** Explain gate (e.g. `remember()`, `delete` after `transCommit()`, the `setUp()` that clears the cache), then commit:

```bash tab="Git Bash / macOS / Linux"
git add app/ tests/ docs/nota-claude.md
git commit -m "STAT: cache dashboard 10 minit + invalidasi selepas commit (slice 4)"
```

```powershell tab="PowerShell"
git add app/ tests/ docs/nota-claude.md
git commit -m "STAT: cache dashboard 10 minit + invalidasi selepas commit (slice 4)"
```

**8. Compare with the reference code (10 min).** Open Lab 10.1 step 2 onwards, Lab 10.2 steps 2 and 5–7, and `StatisticsService.php.txt` (**Templat & Rujukan** module). Fill in this table in `docs/nota-claude.md`:

```text
| Item | My code (Claude + me) | Reference code | Same? | If different: why, and does it break the SPEC? |
|---|---|---|---|---|
| Definition of the 4 KPIs | | | | |
| Empty months = 0 | | | | |
| usage_by_zone uses ReportService | | | | |
| Location of cache()->delete | | | | |
| Cache test (red first) | | | | |
```

Style differences may stay, with a reason. Differences that break the SPEC or the KPI definitions are fixed through the same loop (small plan → Manual diff → verify → `FIX:` commit).

**9. Merge.**

```bash tab="Git Bash / macOS / Linux"
git add docs/nota-claude.md && git commit -m "STAT: banding dengan kod rujukan"
git push -u origin feat/statistik
```

```powershell tab="PowerShell"
git add docs/nota-claude.md
git commit -m "STAT: banding dengan kod rujukan"
git push -u origin feat/statistik
```

Open an MR to `main` and merge it. Lab 10.11 starts from `main`.

### ✅ Checkpoint 10.10
- [ ] The 4-slice plan was made in Plan mode and you edited it at least once; every file edit was approved in Manual mode, with no *accept edits*, *auto* or *bypass* (Quiz S5).
- [ ] `composer test` is green, including `StatisticsServiceTest`, `StatistikAccessTest` and `StatisticsCacheTest`, and the red `StatisticsCacheTest` output from step 7a was shown to the trainer (Quiz S5).
- [ ] `pelulus@latihan.test` sees 4 cards + 4 charts at `/statistik`; `pemohon1@latihan.test` is blocked; every `transCommit()` is followed by `cache()->delete(StatisticsService::CACHE_KEY)`. 🪟 PowerShell: `Select-String -Path app\Services\*.php -Pattern "transCommit|CACHE_KEY"` (Quiz S5).
- [ ] `docs/nota-claude.md` contains 12 explain gate lines (3 per slice) in your own words, at least 1 rejected diff with a reason, and the reference code comparison table (Quiz S5).
- [ ] `git log --oneline` shows 4 small `STAT:` commits (one per slice) on `feat/statistik`, merged to `main` (Quiz S5).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Shift+Tab` does not change the mode (Windows) | The terminal captures the key | Press `Alt+M` |
| `!composer test` → `'composer' is not recognized` or `command not found` (Windows) | The Claude Code session PATH differs from your terminal | Close and reopen VS Code after installing Composer; check `where composer` in PowerShell |
| Claude Code cannot run shell commands (Windows) | Claude Code on Windows needs Git Bash | Install Git for Windows; if it still fails, set `CLAUDE_CODE_GIT_BASH_PATH` to `C:\Program Files\Git\bin\bash.exe` ([tutorial](../docs/tutorial-claude-code.md)) |
| The diff shows every line of the file changed (Windows) | Mixed CRLF/LF line endings | Reject that diff and ask Claude to keep the original line endings; check `git diff --stat` before committing |
| `/mcp` → `ci4-spark` *failed* (Windows) | `php` is not in the Claude process PATH | `claude mcp add --scope local ci4-spark -- "C:\laragon\bin\php\<versi>\php.exe" tools/ci4-spark-mcp.php` (`local` scope, does not change the shared `.mcp.json`) |
| `Cache unable to write to "…\writable\cache\"` (Windows) | Read-only folder or the project is in OneDrive | Move the project out of OneDrive; untick *Read-only* on `writable\` |
| Empty charts; *Console*: `Chart is not defined` | The department proxy blocks the CDN | Local copy of `chart.umd.min.js` (Lab 10.1 🧯) |

### ⭐ Bonus challenge
- Ask Claude (Plan mode) to explain `cache()->remember()` in CodeIgniter's `system/Cache/`, then confirm it yourself by opening that file, and record the confirmed line in `docs/nota-claude.md`.

---

## Lab 10.11 — Claude Code: Capstone preparation (S6)

### 🎯 Objective
Run 4 capstone reviews with Claude Code: the `semak-ci4` subagent on the whole repo, AI-08 (DoD) for each module, AI-09 (test gaps) and AI-18 (`README.md`/`CLAUDE.md`/PRD). You confirm every finding yourself, fix the accepted ones through the 7-step loop, and tag `v1.0-capstone`.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, choose the **PowerShell** tab on command blocks that have two tabs; blocks without tabs run in both terminals.
- Checkpoint 10.10 passed; `feat/statistik` merged to `main`.
- Manual UAT (Lab 10.3 steps 1–3 and 5, 11:45–12:30) already done: `docs/UAT-signoff.md` filled in and bugs recorded in `docs/kes-ujian-akhir.md`.

### Steps

**1. Branch and clean context (2 min).**

```bash tab="Git Bash / macOS / Linux"
git switch main && git pull
git switch -c chore/capstone
claude
```

```powershell tab="PowerShell"
git switch main
git pull
git switch -c chore/capstone
claude
```

**2. Whole-repo review with `semak-ci4` (15 min).**

```text
Use the semak-ci4 subagent to review the WHOLE repo as the capstone panel (@docs/rubrik-capstone.md §2 and
Day 10 README §3.4):
- G1 / BR-PAS-04: every method that opens a Pas/TLK record by id checks ownership in the service.
- G2 / K5: every route in app/Config/Routes.php apart from login has a session, group or permission filter.
- K2: every <?= $ in app/Views without esc() (ignore app/Views/errors/).
- G4: every move()/store() of an uploaded file writes outside public/.
- G5 / K7: every ->query( and every where/like that concatenates user input.
Give a table | # | Gate/K | File:line | Pass/Fail | Evidence |. Do not change files.
```

Create `docs/semakan-capstone.md` and record **every** finding (you type it):

```text
# Capstone review (semak-ci4 subagent)

| # | Gate/K | Finding | File:line | Confirmed with | Accept/Reject | Reason |
|---|---|---|---|---|---|---|
| 1 | K5 | ... | app/Config/Routes.php:.. | php spark filter:check GET /... | Reject | filter on the group |
```

Confirm with the Lab 10.3 step 5 evidence commands or the `ci4-spark` tools:

```text
Use the ci4-spark filter_check tool for GET /statistik, GET /laporan/tempahan and GET /pas/semakan. List the filters for each one.
```

**3. Fix the accepted findings (20 min).** For each **Accept** finding (and the highest-severity UAT bug), one at a time:

```bash
git switch -c fix/<bug-id>-<ringkas>
```

Red test first (AI-10, Manual):

```text
Finding #<n> in docs/semakan-capstone.md (or BUG-00N in docs/kes-ujian-akhir.md): <summary>.
Steps to reproduce: <1. … 2. … 3. …>. Rule: <BR-… / G… / K…>.
Write ONE PHPUnit test (DatabaseTestTrait or FeatureTestTrait) that FAILS now because of this issue.
DO NOT change application code. Explain every line of the test.
```

Run `!composer test -- --filter <namaUjian>`: it must be **red**. Then:

```text
Test <testName> is red. Propose the MINIMUM fix in one file to make it green, without changing the test.
Explain why the fix is enough and what could break.
```

Read the diff, approve it, run `!composer test` (all green). Stage the changes in your terminal (`git add app/ tests/ docs/`), then in Claude Code run AI-08 on the staged diff:

```text
!git diff --staged
```

```text
Plan mode. Review the staged diff above against the Definition of Done in @docs/kolaborasi.md §2 (AI-08): server-side validation,
server-side access control, status_logs, esc(), no raw SQL concatenating input, no secrets, names as in the SPEC.
Pass/Fail + an evidence line for each item. Suggest a commit message "FIX: <summary> (BUG-00N)".
```

Fix every "Fail" through the same gate, then commit `FIX:` and merge into `chore/capstone`. Mark it *Closed* in the bug log.

**Reject** if: the fix touches more files than needed, a test is changed so that it turns green, or the "fix" only hides a button with no check on the server.

**4. AI-08: Definition of Done matrix (15 min).** In Plan mode:

```text
Plan mode. Do not change any files.
For each module (M1 TLK, M2 Pas, M3 Laporan, M4 Statistik), check the 7 Definition of Done items in
@docs/kolaborasi.md §2 against the current code. Give a matrix | DoD item | M1 | M2 | M3 | M4 |, each cell
Pass/Fail + a file:line or test name as evidence. For the "participant can explain" item, write "Participant".
Finally list at most 5 Fail cells, most important first.
```

A good matrix: every cell has evidence you can open. Choose **3 cells at random** (including one "Pass") and confirm them yourself by opening the file or running that test. Cells with no evidence or wrong evidence are marked "Not confirmed" in `docs/semakan-capstone.md`. Every valid Fail cell is fixed as in step 3.

**5. AI-09: test gaps (15 min).** In Plan mode:

```text
Plan mode. Do not change any files.
Compare every rule BR-TLK-01..06 and BR-PAS-01..06 in @docs/spesifikasi-sistem.md §2 with the tests in tests/.
Table | BR | Covering test (file::method) | None / Partial / Full |.
Then suggest test cases (AI-09) for the 2 riskiest gaps:
| # | Type (unit/feature) | Given | When | Then | BR |. DO NOT write test code yet.
```

Choose 2 cases, then in Manual mode:

```text
Write test cases #<a> and #<b> from the table above in <an existing or new test file in tests/>.
Its own synthetic fixtures, relative dates (+1 day). Do not change application code. Explain every assert.
```

**Proof that the test catches a violation:** for each new test, break that rule temporarily in the service (e.g. change `90` to `91` for BR-TLK-03), run the test (red), then restore:

```bash
composer test -- --filter <namaUjian>
git restore app/
git diff --stat app/
composer test
```

Expected: red while the rule is broken; `git diff --stat app/` empty after `git restore`; all green. Commit `FIX: ujian <BR> (jurang AI-09)`.

**6. AI-18: handover documents (10 min).** In Plan mode:

```text
Plan mode. Do not change any files.
Review @README.md, @CLAUDE.md and @docs/prd.md (if it exists) critically (AI-18) as a new developer who inherits the
repo tomorrow: missing setup steps (composer install, php spark migrate --all, php spark db:seed, composer test,
@latihan.test accounts), instructions that are out of date compared with the current code (Laporan, Statistik, cache,
the semak-ci4 subagent, ci4-spark), and FRs/ACs in the PRD that are not built yet or have changed.
At most 8 issues in a table | File · section | Issue | Why it matters | Suggestion |, most important first.
```

Confirm at least 2 issues by opening the files, then in Manual mode:

```text
Fix issues #<a> and #<b> only in README.md/CLAUDE.md (and docs/prd.md if relevant). One file at a time.
Do not add secrets; only the synthetic @latihan.test accounts and Latihan@2026 are allowed. Show the diff for each file.
```

**Reject** if the diff adds `.env` contents, a real URL or password, or rewrites a whole file. Confirm that every command in the README really exists (`composer run-script --list`, `php spark list`). Commit `CHORE: kemas kini README & CLAUDE.md untuk serahan`.

**7. Compare with the reference code (5 min).** Compare your tests and fixes with Lab 10.3 steps 4–5 and with `BookingServiceTest.php.txt` and `PassAccessTest.php.txt` (**Templat & Rujukan** module). Write 2 differences and their reasons in `docs/semakan-capstone.md`.

**8. Merge and tag.**

```bash tab="Git Bash / macOS / Linux"
git add docs/ && git commit -m "SETUP: semakan capstone semak-ci4, DoD & jurang ujian"
git push -u origin chore/capstone
```

```powershell tab="PowerShell"
git add docs/
git commit -m "SETUP: semakan capstone semak-ci4, DoD & jurang ujian"
git push -u origin chore/capstone
```

Open an MR to `main` and merge it. Then test `main` and tag it (same as Lab 10.3 step 6):

```bash tab="Git Bash / macOS / Linux"
git switch main && git pull
composer test
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

```powershell tab="PowerShell"
git switch main
git pull
composer test
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

### ✅ Checkpoint 10.11
- [ ] `docs/semakan-capstone.md` records every `semak-ci4` finding with Accept/Reject and evidence from commands you ran yourself (Quiz S6).
- [ ] Every accepted finding was fixed through a red → green test, and AI-08 was run on the staged diff before every `FIX:` commit (Quiz S6).
- [ ] 2 new tests from AI-09 are green, and each one was seen red while its rule was temporarily broken (Quiz S6).
- [ ] At least 2 AI-18 issues were fixed in `README.md`/`CLAUDE.md` and committed as `CHORE:` (Quiz S6).
- [ ] `composer test` is green on `main` and `git tag -l` shows `v1.0-capstone`. 🪟 PowerShell: the same command, `git tag -l` (Quiz S6).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `semak-ci4` does not run; Claude reviews by itself | The subagent is not loaded in this session | `/agents` to check; `/exit` and `claude` again; or type `@agent-semak-ci4` |
| `!git diff --staged` is empty | The changes are not staged yet | Run `git add app/ tests/ docs/` in your terminal first |
| `git restore app/` also removes fixes that were not committed | Other changes were not committed while the rule was temporarily broken | Commit the fix first; `git status --short` must be clean before step 5 |
| `php spark filter:check GET /statistik` → the path becomes `C:/Program Files/Git/statistik` (Windows Git Bash) | Git Bash converts paths that start with `/` | Prefix `MSYS_NO_PATHCONV=1` (Lab 10.3 step 5), or use PowerShell |
| `git tag` rejected: *already exists* | The tag was created before the last fix | `git tag -d v1.0-capstone`, then `git tag -a …` again (before pushing); PowerShell: run them one at a time |
| Tests pass on your machine but fail on a colleague's (Windows) | Fixed dates or a different time zone | Relative dates; `app.appTimezone = 'Asia/Kuala_Lumpur'` (SPEC §9) |

### ⭐ Bonus challenge
- Ask Claude (Plan mode) to compare `docs/semakan-capstone.md` with K1–K10 in README §3.4: which K has no evidence yet? Confirm and complete it yourself.

---

## Lab 10.12 — Capstone demo & Claude Code reflection (S7)

### 🎯 Objective
Demo the system in 8 minutes following the README §4.1 format, explain by yourself the line the panel chooses (including lines Claude wrote), and write an accept/reject reflection based on the evidence in `docs/nota-claude.md`.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, choose the **PowerShell** tab on command blocks that have two tabs; blocks without tabs run in both terminals.
- Checkpoint 10.11 passed; tag `v1.0-capstone`.
- Lab 10.4 prerequisites: a clean demo DB + seed, 5 login windows, a 1-page demo script.

### Steps

**1. Practise the explain-the-code segment (10 min, before your turn).** In Claude Code, Plan mode (AI-14):

```text
Plan mode. Do not change any files.
Act as the capstone panel (@docs/rubrik-capstone.md §3 criterion E and §4.3). Choose ONE line from each file:
app/Services/StatisticsService.php, app/Services/BookingService.php and app/Views/statistik/dashboard.php.
Ask me about one line at a time: what does this line do, why is it here, what happens if it is removed?
Wait for my answer, then give a Level 1–4 under criterion E and explain what was missing.
```

For every Level 1–2 answer: reread that file and update the related explain gate line in `docs/nota-claude.md`. Do not memorise Claude's answers; explain in your own words.

**2. 8-minute demo.** Follow Lab 10.4 steps 1–4. In the M4 segment (minutes 6–7): approve one pass application, then reload `/statistik` → "Pas menunggu" (Pending passes) changes immediately (slice 4 invalidation). In the explain-the-code segment (minutes 7–8), answer yourself: *what + why + what happens if it is removed*.

**3. Evidence on the laptop after minute 8.** The panel checks while filling in the mark sheet:

```bash
composer test
git tag -l
git log --oneline -20
```

Also show `docs/nota-claude.md` (12 explain gate lines + rejected diffs) and `docs/semakan-capstone.md`.

**4. Claude Code reflection (10 min).** Collect the raw data first (Plan mode):

```text
Plan mode. Do not change any files.
From today's git log and @docs/nota-claude.md, list in a table: every STAT:/FIX:/CHORE: commit, the files
changed, and the related explain gate line or rejected diff. Do not write the reflection for me.
```

Then write the reflection **yourself** at the end of `docs/nota-claude.md`:

```text
## Claude Code reflection — Day 10

| # | Claude's suggestion | Accept / Reject | Evidence (commit, test, file:line) | Lesson |
|---|---|---|---|---|
| 1 | | Accept | | |
| 2 | | Accept | | |
| 3 | | Accept | | |
| 4 | | Reject | | |
| 5 | | Reject | | |

One time Claude was wrong, and how I caught it: ...
One rule I will keep using after the course: ...
```

**5. Retrospective.** Follow Lab 10.4 step 5, and add one card about Claude Code (Start/Stop/Continue).

**6. Compare with the reference code (5 min).** Compare your `app/Services/StatisticsService.php` with `StatisticsService.php.txt` (**Templat & Rujukan** module). Write 2 differences in your reflection: why they exist, and whether you will keep them.

**7. Hand over the repo.** Follow Lab 10.4 step 6. Include `CLAUDE.md`, `.claude/agents/`, `.claude/skills/`, `.mcp.json` and `docs/nota-claude.md`. Do not include `.env`, `.claude/settings.local.json` or `CLAUDE.local.md`:

```bash tab="Git Bash / macOS / Linux"
git ls-files | grep -E "settings\.local|CLAUDE\.local|(^|/)\.env$"
git add docs/nota-claude.md && git commit -m "CHORE: refleksi Claude Code Hari 10"
git push origin main
```

```powershell tab="PowerShell"
git ls-files | Select-String "settings\.local|CLAUDE\.local|(^|/)\.env$"
git add docs/nota-claude.md
git commit -m "CHORE: refleksi Claude Code Hari 10"
git push origin main
```

Expected: the `ls-files` command prints nothing. A reflection commit after the tag does not move `v1.0-capstone`.

### ✅ Checkpoint 10.12
- [ ] The demo finished in ≤ 8 minutes, and the M4 segment showed the "Pas menunggu" KPI change immediately after an approval (Quiz S7).
- [ ] The line chosen by the panel was explained by you: what, why, and what happens if it is removed (Quiz S7).
- [ ] The reflection in `docs/nota-claude.md` has ≥ 3 Accept and ≥ 2 Reject, each with commit, test or file:line evidence (Quiz S7).
- [ ] The repo was handed over with no `.env`, `.claude/settings.local.json` or `CLAUDE.local.md` in `git ls-files`. 🪟 PowerShell: `git ls-files | Select-String "settings\.local|CLAUDE\.local|(^|/)\.env$"` prints nothing (Quiz S7).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `.claude/settings.local.json` appears in `git ls-files` (Windows) | The file was committed before `.gitignore` was updated | `git rm --cached .claude/settings.local.json`, add it to `.gitignore`, commit |
| Claude in Plan mode asks permission for `git log` | Shell commands still need approval | Approve once only ("Yes"); do not choose "don't ask again" for commands that change files |
| Empty charts during the demo | No internet for the CDN | Local copy of `chart.umd.min.js` (Lab 10.1 🧯), prepared before the demo |
| `php spark serve` fails: *Address already in use* (Windows) | Laragon/Apache is using port 8080 | `php spark serve --port 8081` and `app.baseURL = 'http://localhost:8081/'` in `.env` |

### ⭐ Bonus challenge
- Write one paragraph for your supervisor: how the 7-step loop can be used in your department's projects without breaking the data rules (synthetic only, no `.env`, no real systems).

---

## Lab 10.1 — Dashboard: KPIs + 4 Chart.js charts (S1)

### 🎯 Objective
- Write `StatisticsService::build()`, which returns 4 KPIs + 4 datasets.
- Build `/statistik` (HTML + KPI cards) and `/statistik/data` (JSON).
- Draw bar, doughnut, horizontal bar and line charts with Chart.js 4.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- M1, M2, M3 merged into `main`; `composer test` green.
- Enough seed data: `DemoDataSeeder` from Lab 9.1 step 0 (≥ 20 bookings, ≥ 15 Pass applications with various statuses & months).
- Internet for the Chart.js CDN (or a local copy — see 🧯).

### Steps

**1. Routes.** Add to `app/Config/Routes.php`:

```php
$routes->group('statistik', [
    'namespace' => 'App\Controllers\Statistik',
    'filter'    => 'permission:statistik.view',
], static function ($routes) {
    $routes->get('/', 'DashboardController::index', ['as' => 'statistik']);
    $routes->get('data', 'DashboardController::data', ['as' => 'statistik.data']);
});
```

```bash tab="Git Bash / macOS / Linux"
php spark routes | grep statistik
# MSYS_NO_PATHCONV=1: Git Bash (Windows) does not turn /statistik into a C:/… path; no effect on macOS/Linux
MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik
```

```powershell tab="PowerShell"
php spark routes | Select-String statistik
# PowerShell does not rewrite /statistik into a C:/… path, so no prefix is needed
php spark filter:check GET /statistik
```

**2. Service — start WITHOUT a cache.** Create `app/Services/StatisticsService.php`:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\PassStatus;
use CodeIgniter\Database\BaseConnection;
use DateTimeImmutable;

class StatisticsService
{
    public const CACHE_KEY = 'stat_dashboard';

    public const CACHE_TTL = 600; // saat = 10 minit (SPEC §2.4)

    private const MONTHS_BM = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    private BaseConnection $db;

    private DateTimeImmutable $now;

    /** $now boleh disuntik dalam ujian supaya keputusan tidak bergantung pada tarikh hari ini. */
    public function __construct(?BaseConnection $db = null, ?DateTimeImmutable $now = null, private ?ReportService $reports = null)
    {
        $this->db      = $db ?? db_connect();
        $this->now     = $now ?? new DateTimeImmutable();
        $this->reports ??= new ReportService($this->db);
    }

    /**
     * Pintu masuk tunggal untuk controller.
     *
     * @return array{generated_at: string, kpi: array<string, int|float|null>, charts: array<string, array>}
     */
    public function dashboard(): array
    {
        return $this->build();          // Lab 10.2 akan membalut dengan cache()->remember()
    }

    /** Kira semua data TANPA cache (public supaya boleh diuji terus). */
    public function build(): array
    {
        return [
            'generated_at' => $this->now->format('d/m/Y H:i:s'),
            'kpi'          => [
                'active_bookings'     => $this->activeBookings(),
                'slot_utilisation'    => $this->slotUtilisationToday(),
                'pending_passes'      => $this->pendingPasses(),
                'avg_days_to_approve' => $this->avgDaysToApprove(),
            ],
            'charts' => [
                'bookings_by_month' => $this->bookingsByMonth(),
                'pass_status'       => $this->passStatus(),
                'usage_by_zone'     => $this->usageByZone(),
                'pass_trend'        => $this->passTrend12Months(),
            ],
        ];
    }
}
```

`build()` calls 8 private methods that you add in steps 3–4, **inside this class, before the final `}`**. The page only works after step 4.

**3. Write the 4 KPIs** as private methods. Check the definitions in README §1.1. Add all four:

`app/Services/StatisticsService.php`

```php
    // ------------------------------------------------------------------
    // KPI
    // ------------------------------------------------------------------

    /** Tempahan aktif = pending + approved (takrif sama seperti BR-TLK-04). */
    private function activeBookings(): int
    {
        return $this->db->table('slot_bookings')
            ->whereIn('status', BookingStatus::active())   // ['pending', 'approved']
            ->countAllResults();
    }

    /** Kadar penggunaan slot HARI INI (%) = slot berbeza yang diduduki ÷ slot aktif × 100. */
    private function slotUtilisationToday(): float
    {
        $today = $this->now->format('Y-m-d');

        $activeSlots = $this->db->table('parking_slots')
            ->where('is_active', 1)
            ->where('deleted_at', null)
            ->countAllResults();

        if ($activeSlots === 0) {
            return 0.0;
        }

        // distinct() + countAllResults() → CI4 membungkus sebagai subquery: COUNT(*) FROM (SELECT DISTINCT slot_id ...)
        $occupied = $this->db->table('slot_bookings')
            ->select('slot_id')
            ->distinct()
            ->where('status', BookingStatus::Approved->value)
            ->where('start_date <=', $today)
            ->where('end_date >=', $today)
            ->countAllResults();

        return round($occupied / $activeSlots * 100, 1);
    }

    /** Permohonan pas menunggu tindakan = submitted + under_review. */
    private function pendingPasses(): int
    {
        return $this->db->table('pass_applications')
            ->whereIn('status', [PassStatus::Submitted->value, PassStatus::UnderReview->value])
            ->countAllResults();
    }

    /**
     * Purata hari untuk lulus pas = AVG(approved_at − created_at).
     * Guna approved_at IS NOT NULL (bukan status = approved) supaya pas yang kini 'expired'
     * tetapi pernah diluluskan tetap dikira. Jam ÷ 24 → pecahan hari yang lebih tepat.
     */
    private function avgDaysToApprove(): ?float
    {
        $row = $this->db->table('pass_applications')
            ->select('AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) / 24 AS avg_days', false)
            ->where('approved_at IS NOT NULL')
            ->get()
            ->getRowArray();

        return isset($row['avg_days']) ? round((float) $row['avg_days'], 1) : null; // null = tiada data lagi
    }
```

`slotUtilisationToday()` uses `->select('slot_id')->distinct()->...->countAllResults()`: a slot booked twice today is counted only once.

**4. Write the 4 chart datasets.** Uniform format `['labels' => [...], 'data' => [...]]`:

| Method | Main query | Remember |
|--------|-------------|-------|
| `bookingsByMonth()` | `select('MONTH(created_at) AS m', false)->selectCount('id', 'total')->groupBy('m')` for the current year | **Zero-fill** all 12 months |
| `passStatus()` | `select('status')->selectCount('id', 'total')->groupBy('status')` | Follow `PassStatus::cases()`; return `keys` + `labels` |
| `usageByZone()` | **Reuse** `$this->reports->usageByZone(['year'=>..., 'month'=>..., 'sort'=>'utilisation', 'dir'=>'desc'])` | No new query |
| `passTrend12Months()` | `select("DATE_FORMAT(created_at, '%Y-%m') AS ym", false)` for the last 12 months | Zero-fill; label `Okt 25` |

Full code for all four methods:

`app/Services/StatisticsService.php`

```php
    // ------------------------------------------------------------------
    // Dataset carta — format seragam: ['labels' => [...], 'data' => [...]]
    // ------------------------------------------------------------------

    /** (bar) Tempahan dibuat setiap bulan bagi tahun semasa — Jan..Dis, bulan kosong = 0. */
    private function bookingsByMonth(): array
    {
        $year = (int) $this->now->format('Y');

        $rows = $this->db->table('slot_bookings')
            ->select('MONTH(created_at) AS m', false)
            ->selectCount('id', 'total')
            ->where('created_at >=', "{$year}-01-01 00:00:00")
            ->where('created_at <', ($year + 1) . '-01-01 00:00:00')
            ->groupBy('m')
            ->get()
            ->getResultArray();

        $byMonth = array_column($rows, 'total', 'm');
        $data    = [];

        for ($m = 1; $m <= 12; $m++) {
            $data[] = (int) ($byMonth[$m] ?? 0);  // ISI SIFAR — jika tidak, bar teranjak ke bulan salah
        }

        return ['labels' => self::MONTHS_BM, 'data' => $data, 'year' => $year];
    }

    /** (doughnut) Taburan status pas. 'keys' = nilai enum (untuk warna di JS), 'labels' = BM. */
    private function passStatus(): array
    {
        $rows = $this->db->table('pass_applications')
            ->select('status')
            ->selectCount('id', 'total')
            ->groupBy('status')
            ->get()
            ->getResultArray();

        $counts = array_column($rows, 'total', 'status');
        $out    = ['keys' => [], 'labels' => [], 'data' => []];

        // Ikut susunan enum (bukan susunan DB) supaya warna & legenda sentiasa konsisten.
        foreach (PassStatus::cases() as $status) {
            $out['keys'][]   = $status->value;
            $out['labels'][] = $status->label();
            $out['data'][]   = (int) ($counts[$status->value] ?? 0);
        }

        return $out;
    }

    /** (bar mendatar) Penggunaan (%) setiap zon bulan semasa — GUNA SEMULA RPT-03. */
    private function usageByZone(): array
    {
        $rows = $this->reports->usageByZone([
            'year'  => (int) $this->now->format('Y'),
            'month' => (int) $this->now->format('n'),
            'sort'  => 'utilisation',
            'dir'   => 'desc',
        ]);

        return [
            'labels' => array_map(static fn (array $r): string => $r['zone_code'] . ' ' . $r['zone_name'], $rows),
            'data'   => array_map(static fn (array $r): float => (float) $r['utilisation'], $rows),
        ];
    }

    /** (line) Bilangan permohonan pas 12 bulan terakhir (termasuk bulan semasa). */
    private function passTrend12Months(): array
    {
        $firstMonth = $this->now->modify('first day of this month')->modify('-11 months')->setTime(0, 0);

        $rows = $this->db->table('pass_applications')
            ->select("DATE_FORMAT(created_at, '%Y-%m') AS ym", false)
            ->selectCount('id', 'total')
            ->where('created_at >=', $firstMonth->format('Y-m-d H:i:s'))
            ->groupBy('ym')
            ->get()
            ->getResultArray();

        $byMonth = array_column($rows, 'total', 'ym');
        $labels  = [];
        $data    = [];

        for ($i = 0; $i < 12; $i++) {
            $month    = $firstMonth->modify("+{$i} months");
            $labels[] = self::MONTHS_BM[(int) $month->format('n') - 1] . ' ' . $month->format('y');
            $data[]   = (int) ($byMonth[$month->format('Y-m')] ?? 0);
        }

        return ['labels' => $labels, 'data' => $data];
    }
```

**5. Register the service & a thin controller.** In `app/Config/Services.php`, inside the `Services` class, after `exportService()`:

```php
public static function statisticsService(bool $getShared = true): \App\Services\StatisticsService
{
    if ($getShared) {
        return static::getSharedInstance('statisticsService');
    }

    return new \App\Services\StatisticsService();
}
```

```bash
php spark make:controller Statistik/DashboardController
```

Replace the generated file's contents with:

`app/Controllers/Statistik/DashboardController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Statistik;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;

class DashboardController extends BaseController
{
    public function index(): string
    {
        $stats = service('statisticsService')->dashboard();

        return view('statistik/dashboard', [
            'title'       => 'Dashboard Statistik',
            'kpi'         => $stats['kpi'],
            'generatedAt' => $stats['generated_at'],
        ]);
    }

    public function data(): ResponseInterface
    {
        $stats = service('statisticsService')->dashboard();

        // setJSON() → Content-Type: application/json; charset=UTF-8
        // no-store: pelayar/proksi jangan simpan salinan — cache kita di PELAYAN, bukan klien.
        return $this->response
            ->setHeader('Cache-Control', 'no-store')
            ->setJSON($stats);
    }
}
```

**6. Check the JSON first, the charts later.** Log in as `pelulus@latihan.test` and open `http://localhost:8080/statistik/data`. Check: 12 values in `charts.bookings_by_month.data`, 5 in `charts.pass_status.data`, 12 in `charts.pass_trend.data`.

**7. View** `app/Views/statistik/dashboard.php`. Create this file with the full code below, then read it and make sure you can explain every item in this list:
- 4 KPI cards (Bootstrap `card`, `col-sm-6 col-xl-3`) rendered from `$kpi` with `esc()`.
- 4 `<canvas>` elements, each inside `<div style="position: relative; height: 280px">`.
- In `<?= $this->section('scripts') ?>`: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>` (a **pinned** version — not an open `@4`; or the local copy `base_url('assets/vendor/chartjs/chart.umd.min.js')`, see 🧯) and a `fetch('<?= site_url('statistik/data') ?>')` script.
- A `draw()` function that calls `Chart.getChart(canvas)?.destroy()` before `new Chart(...)`.
- Third chart: `type: 'bar'` + `options.indexAxis: 'y'`.

The chart script goes into `section('scripts')`, so `app/Views/layouts/main.php` must have `<?= $this->renderSection('scripts') ?>` before `</body>` (Day 6 layout).

`app/Views/statistik/dashboard.php`

```php
<?php

/**
 * app/Views/statistik/dashboard.php — Hari 10
 * Kad KPI dirender di pelayan (cepat, berfungsi walaupun JS gagal).
 * 4 carta dilukis oleh Chart.js 4 daripada JSON /statistik/data.
 *
 * @var string                          $title
 * @var array<string, int|float|null>   $kpi
 * @var string                          $generatedAt
 */

$cards = [
    ['label' => 'Tempahan aktif',            'value' => number_format((int) $kpi['active_bookings']),                  'icon' => 'bi-p-square',        'color' => 'primary'],
    ['label' => 'Kadar penggunaan slot hari ini', 'value' => number_format((float) $kpi['slot_utilisation'], 1) . ' %', 'icon' => 'bi-speedometer2',   'color' => 'success'],
    ['label' => 'Permohonan pas menunggu',   'value' => number_format((int) $kpi['pending_passes']),                   'icon' => 'bi-hourglass-split', 'color' => 'warning'],
    ['label' => 'Purata hari untuk lulus pas', 'value' => $kpi['avg_days_to_approve'] === null ? '—' : number_format((float) $kpi['avg_days_to_approve'], 1) . ' hari', 'icon' => 'bi-stopwatch', 'color' => 'info'],
];
?>
<?= $this->extend('layouts/main') ?>

<?php // <h1> dipapar oleh layouts/main.php daripada $title. Skrip Chart.js masuk ke section 'scripts' (sebelum </body>). ?>
<?= $this->section('content') ?>
<div class="d-flex justify-content-end mb-3">
    <small class="text-muted">
        Data dijana: <span id="generated-at"><?= esc($generatedAt) ?></span>
        <span class="badge text-bg-light border">cache 10 minit</span>
    </small>
</div>

<!-- ============ KAD KPI ============ -->
<div class="row g-3 mb-4">
    <?php foreach ($cards as $c): ?>
        <div class="col-sm-6 col-xl-3">
            <div class="card h-100 border-start border-4 border-<?= esc($c['color'], 'attr') ?>">
                <div class="card-body d-flex align-items-center gap-3">
                    <i class="bi <?= esc($c['icon'], 'attr') ?> fs-2 text-<?= esc($c['color'], 'attr') ?>" aria-hidden="true"></i>
                    <div>
                        <div class="text-muted small"><?= esc($c['label']) ?></div>
                        <div class="fs-4 fw-semibold"><?= esc($c['value']) ?></div>
                    </div>
                </div>
            </div>
        </div>
    <?php endforeach ?>
</div>

<div id="chart-error" class="alert alert-danger d-none" role="alert"></div>

<!-- ============ 4 CARTA ============
     Setiap <canvas> dibalut div berketinggian tetap + maintainAspectRatio:false
     supaya carta tidak "membesar tanpa henti" dalam grid responsif. -->
<div class="row g-3">
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Tempahan TLK mengikut bulan (<span id="year-label"></span>)</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartBookingsByMonth" aria-label="Carta bar tempahan mengikut bulan" role="img"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Status permohonan pas</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartPassStatus" aria-label="Carta doughnut status pas" role="img"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Penggunaan slot mengikut zon — bulan ini (%)</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartUsageByZone" aria-label="Carta bar mendatar penggunaan zon" role="img"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Trend permohonan pas — 12 bulan</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartPassTrend" aria-label="Carta garis trend permohonan pas" role="img"></canvas></div>
        </div></div>
    </div>
</div>
<?= $this->endSection() ?>

<?= $this->section('scripts') ?>
<?php // Chart.js 4.4.7 DIPIN. Tiada internet? Guna salinan tempatan base_url('assets/vendor/chartjs/chart.umd.min.js') (lihat 🧯). ?>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script>
(() => {
    'use strict';

    // Warna ikut NILAI enum PassStatus (bukan label) — padan dengan PassStatus::badge() (text-bg-*)
    const PASS_COLORS = {
        submitted:    '#6c757d', // secondary
        under_review: '#0dcaf0', // info
        approved:     '#198754', // success
        rejected:     '#dc3545', // danger
        expired:      '#212529', // dark
    };

    // Lukis carta pada kanvas; musnahkan carta lama dahulu jika kanvas pernah digunakan
    // (elak ralat "Canvas is already in use. Chart with ID ... must be destroyed").
    function draw(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        Chart.getChart(canvas)?.destroy();
        return new Chart(canvas, config);
    }

    const base = { responsive: true, maintainAspectRatio: false };

    async function load() {
        const res = await fetch('<?= site_url('statistik/data') ?>', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        });

        // Sesi tamat → Shield redirect ke /login (HTML) → res.json() akan gagal. Semak dahulu.
        const type = res.headers.get('Content-Type') || '';
        if (!res.ok || !type.includes('application/json')) {
            throw new Error('Gagal memuatkan data statistik (HTTP ' + res.status + '). Sila log masuk semula.');
        }

        const { charts, generated_at: generatedAt } = await res.json();
        document.getElementById('generated-at').textContent = generatedAt;
        document.getElementById('year-label').textContent = charts.bookings_by_month.year;

        // 1) BAR — tempahan ikut bulan
        draw('chartBookingsByMonth', {
            type: 'bar',
            data: {
                labels: charts.bookings_by_month.labels,
                datasets: [{ label: 'Bil. tempahan', data: charts.bookings_by_month.data, backgroundColor: '#0d6efd' }],
            },
            options: { ...base, plugins: { legend: { display: false } },
                       scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
        });

        // 2) DOUGHNUT — status pas (bahagian daripada keseluruhan)
        draw('chartPassStatus', {
            type: 'doughnut',
            data: {
                labels: charts.pass_status.labels,
                datasets: [{
                    data: charts.pass_status.data,
                    backgroundColor: charts.pass_status.keys.map(k => PASS_COLORS[k] ?? '#adb5bd'),
                }],
            },
            options: { ...base, plugins: { legend: { position: 'right' } } },
        });

        // 3) BAR MENDATAR — indexAxis:'y' (label zon panjang lebih mudah dibaca)
        draw('chartUsageByZone', {
            type: 'bar',
            data: {
                labels: charts.usage_by_zone.labels,
                datasets: [{ label: 'Penggunaan (%)', data: charts.usage_by_zone.data, backgroundColor: '#198754' }],
            },
            options: { ...base, indexAxis: 'y', plugins: { legend: { display: false } },
                       scales: { x: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } } },
        });

        // 4) LINE — trend 12 bulan
        draw('chartPassTrend', {
            type: 'line',
            data: {
                labels: charts.pass_trend.labels,
                datasets: [{ label: 'Permohonan pas', data: charts.pass_trend.data,
                             borderColor: '#6f42c1', backgroundColor: 'rgba(111,66,193,.15)', fill: true, tension: 0.3 }],
            },
            options: { ...base, plugins: { legend: { display: false } },
                       scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
        });
    }

    load().catch(err => {
        const box = document.getElementById('chart-error');
        box.textContent = err.message;      // textContent — bukan innerHTML (elak XSS)
        box.classList.remove('d-none');
        console.error(err);
    });
})();
</script>
<?= $this->endSection() ?>
```

**8. Menu.** In `app/Views/layouts/main.php`, add the link only if `auth()->user()->can('statistik.view')`. Put it inside `<ul class="navbar-nav me-auto">`, right after the Laporan link (Lab 9.1):

`app/Views/layouts/main.php`

```php
<?php if (auth()->loggedIn() && auth()->user()->can('statistik.view')): ?>
    <li class="nav-item"><a class="nav-link" href="<?= url_to('statistik') ?>"><i class="bi bi-bar-chart-line"></i> Statistik</a></li>
<?php endif ?>
```

**9. Commit.** `git add -A && git commit -m "STAT: StatisticsService, dashboard KPI + 4 carta Chart.js"`; PowerShell: run `git add` and `git commit` one at a time

**10. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (AI-04):

```text
Plan mode. Do not change any file.
Review the LOGIC of the 4 KPIs and 4 chart datasets in @app/Services/StatisticsService.php against these definitions:
[paste the KPI definition table from README §1.1]
Table | Method | Definition met? | Unhandled edge case (example input) | file:line |, including:
- months without data (must be 0, not missing)
- which statuses are counted and which are not
- date ranges (first/last day of the month, bookings that cover today)
Then check @app/Views/statistik/dashboard.php: is any data put into the DOM with innerHTML?
Do NOT rewrite the code.
```

Look for in the answer: `status IN ('pending','approved')` for active bookings, `TIMESTAMPDIFF(HOUR, …) / 24` for the average days, 12 months filled with 0, and `textContent` (not `innerHTML`) for the error message.

Verify it yourself: for each issue, run the SQL yourself and compare it with the KPI card, e.g. `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');`. A real issue → the AI-10 cycle (failing test first). Record it in `docs/nota-claude.md` (create the file if it does not exist).

### ✅ Checkpoint 10.1
- [ ] `pelulus@latihan.test` and `admin@latihan.test` → `/statistik` shows 4 cards + 4 charts.
- [ ] `penyemak@latihan.test` and `pemohon1@latihan.test` → `/statistik` **and** `/statistik/data` are blocked.
- [ ] KPI "Tempahan aktif" (Active bookings) = the SQL result: `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');`
- [ ] The bar chart shows 12 months (months without data = an empty bar, not missing).
- [ ] The zone chart is a **horizontal** bar; the zone percentages = RPT-03 for the current month (`/laporan/penggunaan`).
- [ ] The browser console (F12) has no errors.
- [ ] Prompting: the AI-04 KPI review is recorded in `docs/nota-claude.md`; every issue is confirmed or rejected with SQL you ran yourself.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Uncaught ReferenceError: Chart is not defined` | The CDN script did not load (no internet/proxy) or the chart script runs before the CDN | Order: CDN first. No internet: download `chart.umd.min.js` (4.4.7) into `public/assets/vendor/chartjs/` and use `base_url('assets/vendor/chartjs/chart.umd.min.js')` |
| `Canvas is already in use. Chart with ID '0' must be destroyed before the canvas with ID 'chartX' can be reused.` | `new Chart()` called twice on the same canvas (e.g. a "Muat semula" (Reload) button) | `Chart.getChart(canvas)?.destroy()` before creating it |
| `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` | Session expired/no permission → Shield returns the login HTML | Check `res.ok` & `Content-Type` before `res.json()`; log in again |
| Chart is 0 px tall or keeps growing | No container with a fixed height | `<div style="position:relative;height:280px">` + `maintainAspectRatio: false` |
| The June bar appears in the March position | Empty months not zero-filled | `array_column(..., 'total', 'm')` + a loop over 1..12 |
| `Error 1055 ... only_full_group_by` on `DATE_FORMAT` | The GROUP BY expression differs from the SELECT | `groupBy('ym')` (alias) — MySQL allows GROUP BY on an alias |
| Average days = `null` → empty card/`number_format()` error | No Pass approved yet | The view shows `—` when `null` |

### ⭐ Bonus challenge
- Add a **Muat semula** (Reload) button that calls `load()` again (test that `destroy()` works).
- Click a zone bar → open `/laporan/penggunaan?year=…&month=…` (Chart.js `options.onClick`).

---

## Lab 10.2 — `remember()` cache & invalidation after status changes (S2)

### 🎯 Objective
- Wrap `dashboard()` in `cache()->remember('stat_dashboard', 600, fn)`.
- **Add** `cache()->delete(StatisticsService::CACHE_KEY)` after every status change in `BookingService` and `PassWorkflowService`.
- Prove the invalidation with an automated test that **fails** without the invalidation code.

### Prerequisites
- Lab 10.1 complete.
- `app/Config/Cache.php` → `$handler = 'file'` (default); `writable/cache/` is writable.

### Steps

**1. Measure BEFORE the cache.** Open `/statistik`, Debug Toolbar (the CI flame icon, bottom right) → **Database** tab. Note the number of queries & the time. Reload 3 times — the numbers stay the same.

**2. Wrap with `remember()`:**

```php
public function dashboard(): array
{
    return cache()->remember(self::CACHE_KEY, self::CACHE_TTL, fn (): array => $this->build());
}
```

**3. Measure AFTER.** Reload `/statistik` twice. Second request: the Database tab shows **no** aggregate queries; "Data dijana" (Data generated) does not change.

```bash
ls -la writable/cache/          # the stat_dashboard file exists
php spark cache:info            # handler & cache files
```

**4. Show the stale-data problem.** As `pelulus`, approve one Pass application at `/pas/semakan`. Go back to `/statistik` → the KPI "Pas menunggu" (Pending passes) **does not change**. Note the time. (This is the bug we will fix.)

**5. Write a FAILING test first.** Create `tests/Services/StatisticsCacheTest.php`:

```php
<?php

declare(strict_types=1);

namespace Tests\Services;

use App\Services\BookingService;
use App\Services\StatisticsService;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;

final class StatisticsCacheTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate   = true;
    protected $refresh   = true;
    protected $namespace = null;

    protected function setUp(): void
    {
        parent::setUp();
        cache()->delete(StatisticsService::CACHE_KEY);   // start clean — the file cache persists between tests!
    }

    public function testDashboardDisimpanDalamCache(): void
    {
        $this->assertNull(cache()->get(StatisticsService::CACHE_KEY));

        (new StatisticsService())->dashboard();

        $this->assertIsArray(cache()->get(StatisticsService::CACHE_KEY));
    }

    public function testKelulusanTempahanMengosongkanCache(): void
    {
        $bookingId = $this->createPendingBooking();
        (new StatisticsService())->dashboard();                          // fill the cache
        $this->assertNotNull(cache()->get(StatisticsService::CACHE_KEY));

        (new BookingService())->approve($bookingId, actorId: 1);

        $this->assertNull(
            cache()->get(StatisticsService::CACHE_KEY),
            'Cache mesti dikosongkan selepas status berubah',
        );
    }

    private function createPendingBooking(): int
    {
        $db = $this->db;
        $db->table('users')->insert(['username' => 'pelulus-ujian', 'active' => 1, 'full_name' => 'Pelulus Ujian']);
        $db->table('parking_zones')->insert(['code' => 'ZT', 'name' => 'Zon Ujian', 'location' => 'Blok T']);
        $db->table('parking_slots')->insert(['zone_id' => $db->insertID(), 'slot_no' => 'T01', 'category' => 'oku', 'is_active' => 1]);
        $slotId = (int) $db->insertID();
        $db->table('vehicles')->insert(['user_id' => 1, 'plate_no' => 'WXX 7001', 'model' => 'Myvi', 'color' => 'Putih']);
        $db->table('slot_bookings')->insert([
            'ref_no'     => 'TLK-2026-7001', 'user_id' => 1, 'vehicle_id' => (int) $db->insertID(), 'slot_id' => $slotId,
            'start_date' => date('Y-m-d', strtotime('+1 day')), 'end_date' => date('Y-m-d', strtotime('+5 days')),
            'reason'     => 'Data ujian sintetik', 'status' => 'pending',
        ]);

        return (int) $db->insertID();
    }
}
```

```bash
composer test -- tests/Services/StatisticsCacheTest.php
```

Expected: `testKelulusanTempahanMengosongkanCache` **FAILS** — *"Cache mesti dikosongkan selepas status berubah"* ("The cache must be cleared after the status changes"). Good: the test catches the bug from step 4.

**6. Add invalidation in `BookingService`.** Open `app/Services/BookingService.php`. Add a `use` if needed (the class is in the same namespace — not needed) and put **one line** after **every** `$this->db->transCommit();`:

```php
            $this->db->transCommit();
            cache()->delete(StatisticsService::CACHE_KEY);   // Day 10: invalidate AFTER the commit
```

Places where it must go (in the Day 5–6 reference template):

| Method | Transition | Why |
|--------|-----------|--------|
| `create()` | `null → pending` | "Tempahan aktif" (Active bookings) goes up |
| `transition()` (called by `approve()`, `reject()`, `cancel()`) | `pending → approved/rejected`, `approved → cancelled` | KPIs & charts change |

**7. Add invalidation in `PassWorkflowService`.** The same — after `$this->db->transCommit();` in:

| Method | Transition |
|--------|-----------|
| `submit()` | `null → submitted` ("Pas menunggu" (Pending passes) +1) |
| `transition()` (called by `startReview()`, `approve()`, `reject()`, `expire()`) | all other transitions, including `pas:expire` |

**Stop & think (2 min):** why not inside the `try` block **before** `transCommit()`, and why not in the controller? Write your answer in the commit message.

**8. Run it again.**

```bash
composer test -- tests/Services/StatisticsCacheTest.php     # green
composer test                                                # ALL green — no regressions
```

**9. Repeat step 4 manually.** Approve another Pass application → `/statistik` → "Pas menunggu" (Pending passes) drops **immediately**; "Data dijana" (Data generated) = the current time.

**10. Commit & merge.** `git add app/ tests/ && git commit -m "STAT: cache dashboard 10 minit + invalidasi selepas commit status (TLK & PAS)"`; PowerShell: run `git add` and `git commit` one at a time, then `git push -u origin feat/statistik` → open an MR to `main` → merge (Lab 10.3 starts from `main`).

**11. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (invalidation coverage + AI-09):

```text
Plan mode. Do not change any file.
1. List every transCommit() in app/Services/. For each one: the method, the status transition,
   and whether cache()->delete(StatisticsService::CACHE_KEY) happens AFTER the commit, BEFORE the commit, or not at all.
2. Read @tests/Services/StatisticsCacheTest.php: which transitions are not tested?
   Suggest 2 test cases (Given / When / Then), including pas:expire. Do NOT write code.
```

Look for in the answer: every `transCommit()` in `BookingService` and `PassWorkflowService` is followed by `cache()->delete(...)`; no `delete` before the commit or in a controller.

Verify it yourself:

```bash
grep -n -e "transCommit" -e "CACHE_KEY" app/Services/*.php
```

🪟 PowerShell: `Select-String -Path app\Services\*.php -Pattern "transCommit|CACHE_KEY"`

Claude's list must match this output. Write one suggested case yourself, then `!composer test -- tests/Services/StatisticsCacheTest.php` in Claude Code: green. Commit `STAT: ujian cache tambahan` on `main` before Lab 10.3.

### ✅ Checkpoint 10.2
- [ ] Second reload of `/statistik` → 0 aggregate queries in the Debug Toolbar.
- [ ] `StatisticsCacheTest` **was red** (step 5) and is now **green** (step 8) — show the trainer in the terminal history.
- [ ] `grep -n "CACHE_KEY" app/Services/*.php` → at least 4 hits in `BookingService`/`PassWorkflowService` (2 each) and **no** typed `'stat_dashboard'` string outside `StatisticsService`.
- [ ] Every `cache()->delete(...)` is **after** `transCommit()`.
- [ ] You can explain 1 advantage & 1 disadvantage of "TTL + delete" compared with "TTL only".
- [ ] Prompting: Claude's `transCommit()` list matches your own `grep`, and one extra cache test case is written by you and green.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Cache unable to write to "…/writable/cache/"` | Folder permissions | `chmod -R 775 writable/cache` (Linux/macOS); Windows: make sure the folder is not read-only |
| The test passes even without invalidation | The cache is empty from the start → `assertNotNull` is not checked, or the test does not fill the cache | Make sure `dashboard()` is called & `assertNotNull` runs before `approve()` |
| Other tests suddenly fail with old numbers | Cache file from an earlier test persists (the `file` handler is shared) | `cache()->delete(...)` in `setUp()`; or `php spark cache:clear` |
| Dashboard still stale after an approval | `delete()` placed in another controller / one path missed / key misspelled | Use `StatisticsService::CACHE_KEY`; put it in the service's `transition()` |
| `Class "App\Services\StatisticsService" not found` in BookingService | Wrong namespace | Both are in `App\Services` — no `use` needed; check the spelling |
| `Serialization of 'Closure' is not allowed` | Objects/closures stored in the cache data | `build()` must return **scalar arrays** only |

### ⭐ Bonus challenge
- Replace the direct calls with **Events**: in the service `Events::trigger('status_changed', 'TLK', $id)`; in `app/Config/Events.php` → `Events::on('status_changed', static fn () => cache()->delete(StatisticsService::CACHE_KEY));`. Discuss: advantage (the service knows nothing about statistics) vs disadvantage (the flow is harder to trace).
- Add a test for `PassWorkflowService::approve()` (needs a Shield `User` with the `pas.approve` permission — see `PassAccessTest` from Day 8).

---

## Lab 10.3 — Final system testing (UAT), bug fixing & security (S3)

### 🎯 Objective
- Run the 15-step UAT script (covering scenarios UAT-01..UAT-10) across the 4 modules and 5 accounts.
- Fix at least one bug through the cycle *reproduce → failing test → fix → pass*.
- Complete the K1–K10 security checklist.

### Prerequisites
- Labs 10.1 & 10.2 complete and merged into `main`.
- Create the file `docs/UAT-signoff.md` and copy in the content of the template `templates/dokumen/uat-signoff-templat.md` (**Templat & Rujukan** module).
- Create the file `docs/kes-ujian-akhir.md` and copy in the content of the template `templates/dokumen/kes-ujian-templat.md` (**Templat & Rujukan** module).
- Clean database: `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder`; PowerShell: run `php spark migrate:refresh` and `php spark db:seed` one at a time.

### Steps

**1. Prepare 5 windows** (incognito/separate profiles): `pemohon1`, `pemohon2`, `penyemak`, `pelulus`, `admin` (password `Latihan@2026`).

**2. Run the UAT script** in README §3.2 (15 steps) **in order**. Click each step yourself, and fill in the *Keputusan* (Result) & *Catatan* (Notes) columns before the next step in `docs/UAT-signoff.md` §4 (UAT-01..UAT-10). The last column of the README §3.2 table maps each step to a UAT ID (e.g. steps 1 & 5 → UAT-01; steps 4, 6, 11 & 15 → UAT-10). Mark a UAT ID ✅ only if **all** the steps mapped to it pass. Target time: 35 minutes.

**3. Record every failure** in the *Bug log* (`docs/kes-ujian-akhir.md`) — `BUG-001`, `BUG-002`, … with severity High/Medium/Low. **Don't fix anything yet.**

**4. Pick the highest-severity bug** and run the cycle:

```bash
git switch -c fix/bug-001-<ringkas>
```

| Step | Action | Evidence |
|---------|----------|-------|
| a. Reproduce | Write the exact steps + data in the bug log | The trainer/the person next to you can repeat it in < 2 min |
| b. Failing test | Write a PHPUnit test (unit/service or `FeatureTestTrait`) | `composer test -- --filter <namaUjian>` **red** — keep a terminal screenshot |
| c. Fix | A **minimal** change | A small & focused `git diff` |
| d. Pass | That test is green **+** all of `composer test` is green | Terminal screenshot |
| e. Commit | `git add app/ tests/ docs/ && git commit -m "FIX: <ringkasan> (BUG-001)"`; PowerShell: run `git add` and `git commit` one at a time → merge | Bug log: *Closed* |

No bugs found? The trainer will give you a "planted bug" (the BUG-007 example in README §3.3); practise the full cycle on it.

**5. Security checklist K1–K10** (README §3.4), ~10 minutes. Tick K1–K10 yourself: run the evidence commands below (K2, K3, K4, K5, K7) and check the remaining Ks visually. The trainer then **spot-checks 3 Ks** on your machine — K3 always, plus 2 of the trainer's choice — so every tick must be provable on the spot.

```bash tab="Git Bash / macOS / Linux"
# K2 — output without esc() (every remaining line must be justified; ignore app/Views/errors/)
grep -rnF '<?= $' app/Views | grep -vF 'esc(' | grep -vF '$this->'

# K3 — .env never went into Git
git ls-files | grep -E "(^|/)\.env$"
git log --all --oneline -- .env

# K4 — no uploaded files in public/
find public -type f \( -name "*.pdf" -o -name "*.jpg" -o -name "*.png" \) | grep -v assets

# K5 — a filter on every protected route
php spark routes
MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik
MSYS_NO_PATHCONV=1 php spark filter:check GET /laporan/tempahan

# K7 — raw queries (every hit must use ? bindings; justified exception: EXPLAIN in
#      app/Commands/ReportExplain.php — SQL compiled by the Query Builder, no web user input)
grep -rn -e '->query(' app/
```

```powershell tab="PowerShell"
# K2 — output without esc() (every remaining line must be justified; ignore app/Views/errors/)
Get-ChildItem app/Views -Recurse -File | Select-String -SimpleMatch '<?= $' | Where-Object { $_.Line -notlike '*esc(*' -and $_.Line -notlike '*$this->*' }

# K3 — .env never went into Git
git ls-files | Select-String "(^|/)\.env$"
git log --all --oneline -- .env

# K4 — no uploaded files in public/
Get-ChildItem public -Recurse -File -Include *.pdf, *.jpg, *.png | Where-Object { $_.FullName -notmatch 'assets' } | ForEach-Object FullName

# K5 — a filter on every protected route
php spark routes
php spark filter:check GET /statistik
php spark filter:check GET /laporan/tempahan

# K7 — raw queries (every hit must use ? bindings; justified exception: EXPLAIN in
#      app/Commands/ReportExplain.php — SQL compiled by the Query Builder, no web user input)
Get-ChildItem app -Recurse -File | Select-String -SimpleMatch '->query('
```

Tick each K in `docs/UAT-signoff.md` §5/§6 (or an appendix).

**6. Prepare for the demo.**

```bash tab="Git Bash / macOS / Linux"
git switch main && git pull
composer test                              # green — test the `main` you are about to tag
git add docs/ && git commit -m "SETUP: UAT-signoff, log pepijat & senarai semak K1–K10"
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

```powershell tab="PowerShell"
git switch main
git pull
composer test                              # green — test the `main` you are about to tag
git add docs/
git commit -m "SETUP: UAT-signoff, log pepijat & senarai semak K1–K10"
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

Write a **1-page demo script** (following the format in README §4.1) and make sure you can explain any file.

**7. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (the `semak-ci4` subagent + AI-08):

```text
Use the semak-ci4 subagent to re-check K2, K5 and K7 (README §3.4) across app/:
- K2: every <?= $ in app/Views without esc()
- K5: routes in app/Config/Routes.php without a session, group or permission filter
- K7: every ->query( and whether it uses ? binding
Give a table | K | File:line | Pass/Fail | Reason |. Do not change any file.
```

Look for: the `semak-ci4` line appears, then a table with file:line.

Verify it yourself: compare it with your K2/K5/K7 marks in `docs/UAT-signoff.md` from your own commands in step 5. For each "Fail" your commands missed: open the file:line. If it is real, record it as `BUG-00N` in `docs/kes-ujian-akhir.md`; do not move the `v1.0-capstone` tag. Fix it after the demo with the AI-10 cycle, and before each `FIX:` commit run AI-08 on `!git diff --staged` in Claude Code.

### ✅ Checkpoint 10.3
- [ ] `docs/UAT-signoff.md` §4: UAT-01..UAT-10 are all marked (✅/❌/⚠️) — no ⬜.
- [ ] All **Critical** scenarios are ✅, or every ❌ has a Bug-ID and an action plan.
- [ ] ≥ 1 bug closed with **red → green** test evidence.
- [ ] K1–K10 ticked with command evidence.
- [ ] Tag `v1.0-capstone` exists: `git tag -l`.
- [ ] Prompting: the `semak-ci4` findings for K2/K5/K7 are compared with your marks; each difference is rejected with evidence or recorded as `BUG-00N`.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| Logging in as a second role replaces the first role's session | Normal tabs share the session cookie | Use incognito windows / separate browser profiles |
| UAT fails because of yesterday's data (e.g. slot already booked) | The DB is not clean | `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder`; PowerShell: run `php spark migrate:refresh` and `php spark db:seed` one at a time |
| `The action you requested is not allowed.` during UAT | Form left open too long → CSRF token expired, or `csrf_field()` missing | Reload the form; if it keeps happening, check that the form has `csrf_field()` |
| Feature test fails with `Config\Security::$csrfProtection is set to 'cookie'` | Shield configuration | `app/Config/Security.php` → `$csrfProtection = 'session'` (Day 4) |
| Tests pass on your machine but fail on a neighbour's machine | Depends on seed data/today's date | Own fixtures in the test; relative (`+1 day`) or fixed dates |
| `git tag` rejected: *already exists* | Tag created before the fix | `git tag -d v1.0-capstone && git tag -a v1.0-capstone -m "…"`; PowerShell: run `git tag -d` and `git tag -a` one at a time (before pushing) |

### ⭐ Bonus challenge
- Write a `FeatureTestTrait` test for UAT-08: `applicant` → `GET /statistik` and `/laporan/tempahan` → not 200.
- Run `composer audit` and discuss the results.

---

## Lab 10.4 — Capstone demo & retrospective (S4)

### 🎯 Objective
- Demo the system end to end in 8 minutes, following the format.
- Explain one line of code chosen by the panel.
- Contribute ≥ 3 retrospective cards (Start/Stop/Continue).

### Prerequisites
- Checkpoint 10.3 passed; tag `v1.0-capstone`.
- Clean demo DB + seed; 5 logged-in windows ready; 1-page demo script.
- Read [`docs/rubrik-capstone.md`](../docs/rubrik-capstone.md).

### Steps

**1. 10 minutes before your turn:** `php spark serve` running; browser zoom 125 %; notifications off; `docs/UAT-signoff.md` open.

**2. 8-minute demo** — follow the segment schedule in README §4.1. The panel's timekeeper will signal at minutes 1, 3, 5, 6 and 7.

**3. "Explain the code" segment (minutes 7–8).** The panel picks one file and one line (e.g. `ReportService::applySort()`, `BookingService::transition()`, `dashboard.php` `draw()`). **You yourself** answer: *what does this line do, why is it here, what happens if it is removed?*

**4. Q&A (if the panel asks during the demo).** Answer honestly — "I didn't get to it yet, my plan is …" is worth more than guessing.

**5. Retrospective.** Write ≥ 1 card for each column **Start / Stop / Continue** (yellow card = yourself, blue card = the course). Stick them on the board. Vote with 3 dots on the cards that matter most.

**6. Hand over the repo.** Send the repo link / zip archive (without `vendor/`, without `.env`, without `writable/uploads/`) to the trainer.

**7. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (handover, based on AI-18):

```text
Plan mode. Do not change any file.
Review this project's @README.md and @CLAUDE.md critically, as a new developer who inherits the repo tomorrow.
1. README: can I clone, composer install, migrate, seed, run composer test and log in
   with the synthetic accounts just by reading it? Which steps are missing?
2. CLAUDE.md: which instructions, conventions or rules are out of date compared with the current code
   (Pas, Laporan, Statistik, cache)?
At most 8 issues in a table | File · section | Issue | Why it matters | Suggestion |, most important first.
```

Look for in the answer: missing commands (e.g. `php spark db:seed`, the `@latihan.test` accounts), and parts of `CLAUDE.md` that do not mention the Laporan/Statistik modules yet.

Verify it yourself: pick at least 2 issues, confirm each one by opening the file, then fix them **yourself** in `README.md`/`CLAUDE.md`. Commit `CHORE: kemas kini README & CLAUDE.md selepas capstone`, push, and tell the trainer. For your next project, start with AI-15 (existing project) or AI-16 → AI-18 → AI-17 (new project).

### ✅ Checkpoint 10.4
- [ ] Demo finished in ≤ 8 minutes; all four modules shown.
- [ ] The panel signs your score sheet.
- [ ] ≥ 3 retrospective cards posted.
- [ ] Repo handed over.
- [ ] Prompting: at least 2 AI-18 issues in `README.md`/`CLAUDE.md` are fixed by you and committed.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `php spark serve` fails: *Address already in use* | Another server on port 8080 | `php spark serve --port 8081` and `app.baseURL = 'http://localhost:8081/'` in `.env` |
| Charts empty during the demo | No internet for the CDN | Local copy of `chart.umd.min.js` (Lab 10.1 🧯) — prepare it before the demo |
| Forgot the synthetic account password | — | `Latihan@2026` (SPEC §4) |
| Time runs out before M4 | Too long on M1 | Follow the script; if you are behind at minute 7, jump straight to Reports |

### ⭐ Bonus challenge
- Record a 3-minute demo (screen capture + voice) as handover material for your supervisor.

---
