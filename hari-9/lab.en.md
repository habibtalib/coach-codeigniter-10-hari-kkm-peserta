# Day 9 Lab — Team Work: Sprint 2

[← README](./README.en.md) · [Schedule](../JADUAL.en.md) · [👥 Team roles](../docs/peranan-pasukan.en.md) · [💬 Prompt library §H](../docs/pustaka-prompt.en.md)

| Lab | Session | Time | Output |
|-----|---------|------|--------|
| 9.20 | S13 | 09:00–10:30 | `atlassian` MCP connected, Sprint 2 started in Jira (`pasangan-N`), sync note, failing tests from the AC, slice 1 |
| 9.21 | S14 | 10:45–12:30 | Every pair's Sprint 2 feature slice by slice with green tests; Sprint 3 AC |
| 9.22 | S15 | 14:30–16:00 | `Ready` MR + QA review; ≥ 1 Jira Bug card from exploratory testing |
| 9.23 | S16 | 16:00–17:00 | All MRs merged, green `main` (PHPUnit + E2E), sprint demo, retro |

> ℹ️ Repo: `aplikasi-baharu/espkpv2`. Fixed teams: **Projek** (PM, BA, 2 QA) and **Dev** (4 pairs + a floater) — names in issue #19, rules in the repo's `docs/pasukan.md`. The issue → branch → MR → merge mechanics are the same as [Labs 8.21–8.23](../hari-8/lab.en.md#lab-821--sprint-1-morning-issue-test-plan--first-slice-s16); today's labs add the sync, exploratory testing between pairs and a green `main`. **From today the backlog lives in Jira** (space `KAN`, site link in issue #19, [Jira MCP tutorial](../docs/tutorial-jira-mcp.en.md)); code, MRs and CI stay on GitLab KKM, and GitLab KKM issues #1–#33 stay as the BRS reference. The individual Reports module labs (9.1–9.13) are in the [Appendix](#appendix--individual-reports-module-labs-reference).

---

## Lab 9.20 — Sprint 2 Planning, PM Sync & Slice 1 (S13)

### 🎯 Objective
Plan Sprint 2 (existing issues, BRS gaps and Sprint 1 follow-ups), **coordinate** hot files and the merge order between the Dev pairs, and start the first slice with failing tests from the AC.

### Prerequisites
- `git switch main && git pull && composer install && php spark migrate --all` — `composer test` green.
- Your team and role: issue #19 (Projek: PM, BA, QA; Dev: pairs 1–4 + floater).
- Jira seat holders: invitation accepted (email from Atlassian) and you can open the `KAN` space in the browser.

### Steps — Jira & `atlassian` MCP setup (Jira seat holders, before the stand-up)

Jira Free: **10 seats** — the trainer, PM, BA, 2 QA, one member of each Dev pair and the floater. The pair partner works in the same Claude session (driver/navigator), so one MCP sign-in per pair is enough.

1. `git switch main && git pull` (`.mcp.json` now has the `atlassian` server), then restart `claude` in `~/latihan/espkpv2` and **approve** `atlassian` when asked.
2. `/mcp` → `atlassian` → **Authenticate** → sign in with the invited email → choose the class site → **Accept** → `/mcp`: `atlassian` ✔ connected.
3. Test (*Plan* mode):

   ```text
   List the Jira sites and spaces I can see, then the first 5 cards in the KAN backlog (key, summary, status). Read only.
   ```

4. Read the key convention ([tutorial §3](../docs/tutorial-jira-mcp.en.md#3-jira-key-convention)): branch `feat/KAN-<n>-<short>`, commit `Rujuk KAN-<n>`, MR title `KAN-<n>: …`.

### Steps

1. **Stand-up (08:30, within each team).** 2 minutes each: done · next · blocked. The PM (Projek) and the floater (Dev) record blockers as comments in the related issues.

2. **Projek — Sprint 2 issues (20 minutes).**

   ```text
   Use Jira. JQL: project = KAN AND labels = pasukan-projek AND statusCategory != Done ORDER BY rank. Table: key, summary, GitLab KKM link, has AC (yes/no). Read only.
   ```

   - **BA:** the remaining AC (`/isu-baharu KAN-<n>`, start with the cards from #21–#26).
   - **QA:** an AC → test case table in a comment on every Jira card.
   - **PM:** create the sprint *Sprint 2 (Hari 9)* on the board; ready card → into the sprint, labels `pasukan-dev` + `pasangan-<N>`, *Assignee* the pair's first member (in the browser, or ask Claude and approve the fields). **Start sprint** after the sync. Capacity: one M-size card per pair per half day; extra cards → stay in the backlog with a comment giving the reason.

3. **Sync (09:00, 15 minutes: PM, BA, floater, one member of each pair + trainer).** The PM writes in a comment on issue #19:

   ```markdown
   **Sync Sprint 2**
   - Pasangan 1: isu …, fail panas …
   - Pasangan 2: …
   - Pasangan 3: …
   - Pasangan 4: …
   - Floater: …
   - Kebergantungan: …
   - Susunan merge dipersetujui: …
   ```

4. **QA — failing tests (60 minutes).** The [Lab 8.21 — QA](../hari-8/lab.en.md#lab-821--sprint-1-morning-issue-test-plan--first-slice-s16) rhythm: AI-25 (`penguji-espkp`), AI-26 (one failing test) in the issue branch. For #13, before writing tests:

   ```text
   Plan mode. How do the existing tests control time (service('jam')) and email (service('notifikasi')) so the reminder command can be tested without waiting 7 days? Show example file:line in tests/.
   ```

5. **Dev — slice 1 (60 minutes, every pair).** The [Lab 8.21 — Dev](../hari-8/lab.en.md#lab-821--sprint-1-morning-issue-test-plan--first-slice-s16) rhythm: AI-29 → `/ciri-baharu <no>` → branch `feat/KAN-<n>-<short>` → card *In Progress* → slice 1 (*Manual* mode) → `composer semak` → `semak-espkp` → commit `Rujuk KAN-<n>` → push. New migration: the first digit of the version = the pair number.

### ✅ Checkpoint
- [ ] `/mcp` shows `atlassian` ✔ connected and Claude lists the `KAN` backlog cards.
- [ ] Sprint 2 started in Jira; every sprint card has the labels `pasukan-dev` + `pasangan-N` and an *Assignee*.
- [ ] A sync note in issue #19 with the merge order agreed by all pairs.
- [ ] The test fails because the feature is missing, with a message that names the AC.
- [ ] A `feat/KAN-<n>-…` branch per pair with a first commit; card *In Progress*.

---

## Lab 9.21 — Build Sprint 2: Dev Pair Features (S14)

### 🎯 Objective
Implement the pair's Sprint 2 issues slice by slice, paying special attention to each issue's technical risk (idempotency, training-account compatibility, CSP and export limits, `Aliran.php` consistency), while the Projek team prepares Sprint 3.

### Steps

1. **Dev — continue the slices** (swap the driver every slice). Every slice: *Manual* mode → the navigator reads the diff → `composer semak` → `semak-espkp` → commit `Rujuk KAN-<n>`.

2. **Dev — risk check** before the last slice: ask Claude (*Plan* mode) and verify yourself:

   | Pair | Prompt | Verify |
   |---|---|---|
   | 1 — #13 / #22 | `Is the reminder command idempotent? Show the line that prevents a second email and the test that proves it.` | Run `php spark espkp:peringatan` twice on dev data; no second email (log / on-screen TAC) |
   | 2 — #9 / #25 | `Do the 9001010100NN training accounts with Latihan@2026 still pass the new policy? Does the phone migration add a NULL column without changing existing data?` | Log in as `900101010001` in the browser; `php spark db:table profil_pengguna` |
   | 3 — #17 / #26 | `Does the RPT-10 chart use laporan/_carta and data-carta without inline <script>? Does the export go through EksportService with limits and audit?` | DevTools → no CSP errors; download the XLSX, total = table |
   | 4 — #21 / #23 | `Show the Aliran.php change for Hilang via the Supervisor; are KonfigurasiAliranTest and the stepper steps still consistent?` | `vendor/bin/phpunit --filter KonfigurasiAliranTest`; try the Hilang flow with accounts 01 → 02 → 03 → 04 → 05 |
   | Floater — #8 | `Draft a mariadb CI job in .gitlab-ci.yml that runs migrate --all and the Database suite on mariadb:10.6, without changing the existing ujian job.` | Read the YAML; new job only |

3. **Projek — Sprint 3.** BA: AC for the cards from #27–#32 (`/isu-baharu KAN-<n>`), system-owner questions → card comment + label `disekat` (or #33). QA: add AC tests to the Sprint 2 branches (in step with the pair) and run `vendor/bin/phpunit --filter <Class>` after every Dev commit. PM: Jira board and blockers (label `disekat`).

### ✅ Checkpoint
- [ ] ≥ 2 slices committed per pair; QA tests for the core AC **pass**.

---

## Lab 9.22 — MR, Review & Exploratory Testing (S15)

### 🎯 Objective
Bring Sprint 2 to a QA-reviewed MR, and **test exploratorily** the features already merged — QA for every feature, Dev pairs for another pair's feature.

### Steps

1. **Dev — MR** as in [Lab 8.22 — Dev](../hari-8/lab.en.md#lab-822--sprint-1-afternoon-mr-qa-review--board-s17): draft MR titled `KAN-<n>: …` (`Jira: KAN-<n>` in the description) → checklist → *Three key lines* → *Ready* → card *Testing*.

2. **QA — MR review** with `/semak-mr <MR-no>` (AI-27), open every `file:line`, approve or request changes (card *In Progress* + a comment with the MR link).

3. **Exploratory testing (30 minutes).** QA tests the features merged to `main`; every Dev pair tests **another pair's** feature (1 → 2 → 3 → 4 → 1) for 20 minutes. Use at least three training accounts (e.g. 01 applicant, 07 company rep, 05 approver) and a 360px width (DevTools → *Toggle device*). For every observation:

   ```text
   Draft a Jira Bug card for KAN from this observation: <steps, expected, actual, account>. Follow the sections of .gitlab/issue_templates/Pepijat.md. Synthetic data only. Show the fields; do not create it yet.
   ```

   Repeat the steps yourself, then answer *Yes* to `createJiraIssue` (type Bug, label `pasukan-projek`). The PM triages, adds `pasangan-<owner>` and puts the card in the sprint or the backlog.

4. **PM** — bug triage, board, blockers; re-confirm the S16 merge order with the floater.

### ✅ Checkpoint
- [ ] ≥ 1 Jira Bug card that the owning pair managed to reproduce.

---

## Lab 9.23 — Merge, Green `main`, Sprint Demo & Retro (S16)

### 🎯 Objective
Merge Sprint 2 in the sync order, **prove** `main` is green with PHPUnit and E2E, and plan the v1.1.0 scope.

### Steps

1. **Merge** in order (Lab 8.23 steps 1–4: QA approves → PM merges → other MRs rebase → `composer semak` → `--force-with-lease`).

2. **Green `main` (one person from each pair).**

   ```bash
   git switch main && git pull
   composer install
   php spark migrate --all
   composer test
   ```

3. **E2E (QA or the floater, once).** Follow the *Ujian hujung ke hujung (E2E)* section of the espkpv2 README: a separate `espkp_contoh_e2e` database, an env file outside the repo, server `php -S localhost:8095`, then:

   ```bash
   npm install && npx playwright install chromium
   npm run e2e:sedia
   npm run e2e
   ```

   Red → ask Claude: `This E2E spec fails on main after merging !<a> and !<b>: <output>. Which commit is the likely cause? Do not fix it yet.` The causing pair opens a Jira Bug card with priority *Highest*.

4. **FigJam board (pairs that changed the schema or a workflow).** Update the ERD or the workflow arrows with the `papan-figjam` subagent ([tutorial](../docs/tutorial-figma-mcp.en.md)), one prompt per change.

5. **Sprint demo (3 minutes per pair)** and **retro** (stickies in the FigJam *Retro* section + a `Retro Sprint 2` issue: went well, change, one prompt rule).

6. **v1.1.0 scope (PM).** In Jira: *Complete sprint* Sprint 2 (unfinished cards → Sprint 3 or the backlog), create *Sprint 3 + v1.1 (Hari 10)*, add the Sprint 3 cards with AC and the critical Bugs, set *Fix version* `v1.1.0` (create the version under *Releases* if it does not exist). Cards **not** in v1.1.0 stay in the backlog.

### ✅ Checkpoint
- [ ] `composer test` green; E2E green or every failure has a critical Bug card.
- [ ] Sprint 3 in Jira contains the v1.1.0 scope (*Fix version*) agreed by the PM and the floater.

### Common mistakes
| Symptom | Cause | Fix |
|---|---|---|
| E2E wipes your dev data | E2E ran on `espkp_contoh_dev` | E2E env file with `database_default_database=espkp_contoh_e2e`; `migrate --all` + `db:seed` dev again |
| `composer test` green locally, CI red on RPT-10 | `ONLY_FULL_GROUP_BY` on CI's MySQL 8.4 | Add the column to `GROUP BY` or use an aggregate; test on local MySQL 8 |
| Two pairs' migrations collide | Same version | First digit of the version = the pair number (`…-1xxxxx_` … `5…` floater) |
| Two MRs change `Aliran.php` at the same time | The sync did not name the hot file | One open MR per hot file; the second waits and rebases |
| Claude cannot see the `KAN` space | MCP signed in with another email, or the invitation not accepted | Accept the invitation; sign out of Atlassian in the browser, `/mcp` → `atlassian` → Authenticate again |
| The Jira card has no link to the MR | MR title or branch without the key | MR title `KAN-<n>: …`; add the MR link in a card comment |

---

## Self-check — end of day

**Teamwork (today):** `glab mr list --merged -R aplikasi-baharu/espkpv2`; in Claude: `JQL project = KAN AND sprint in openSprints()` and `project = KAN AND type = Bug AND created >= startOfDay()`.

- [ ] `atlassian` MCP connected; Sprint 2 planned in Jira with pair labels and the sync note recorded in issue #19 (Lab 9.20).
- [ ] My pair's Sprint 2 card (or one I reviewed/wrote the AC for) is merged through an `KAN-<n>: …` MR with a QA review and green tests (Labs 9.21–9.23).
- [ ] I tested another pair's feature and at least one Jira Bug card was created from exploratory testing (Lab 9.22).
- [ ] `composer test` and E2E are green on `main` after all merges, or every failure has a critical Bug card (Lab 9.23).

**Individual Reports module (reference, optional):**

```bash
composer test                                                     # all green (including ReportServiceTest)
php spark laporan:explain tempahan approved 2026-06-01 2026-06-30 # EXPLAIN plan printed without errors
git status --short                                                # no output
git log --oneline -10                                             # today's RPT: commits
```

- [ ] `/laporan/tempahan`, `/laporan/pas` and `/laporan/penggunaan` load with GET filters; the RPT-01 "Jumlah rekod" (total records) for `status=approved` = the SQL `COUNT(*)` (Quiz S2).
- [ ] `?export=pdf` and `?export=xlsx` download files that open, for all three reports; `pemohon1@latihan.test` is refused (Quiz S3).
- [ ] `composer test` is green, including `tests/Services/ReportServiceTest.php` (≥ 7 tests) (Quiz S4).
- [ ] `php spark laporan:explain tempahan approved 2026-06-01 2026-06-30` shows a `key` that is not `NULL` for table `b` (Quiz S4).
- [ ] `git status --short` is empty and the `feat/laporan` branch has been pushed (MR to `main` opened) (Quiz S4).
- [ ] The **Bulan ini / Bulan lepas / Tahun ini** buttons and the active filter chips work on all three reports (Lab 9.1b) (Quiz S5).
- [ ] The RPT-01/RPT-02 status summary buttons add up to "Jumlah rekod", and the RPT-03 JUMLAH row is a weighted average (Lab 9.2b) (Quiz S6).
- [ ] The RPT-01/RPT-02 Excel files have a *Ringkasan* tab with an `=SUM()` formula, and the PDF has a summary table (Lab 9.3b) (Quiz S7).
- [ ] `ReportServiceTest` is green with ≥ 12 tests, and the Lab 9.4b commit is pushed to the `feat/laporan` MR (Lab 9.4b) (Quiz S8).

---

## Appendix — Individual Reports module labs (reference)

> ℹ️ The labs below are the Day 9 labs from before team mode: the Reports module built individually in `kelas-ci-<nama>` with Claude Code (Labs 9.10–9.13) or manually (Labs 9.1–9.4b). They remain as **reference, optional**.

## Lab 9.10 — Claude Code: `ReportService` & Whitelisted Filters (S9)

### 🎯 Objective
Build slice L1 of the Report Module with Claude Code: the `/laporan/*` routes with `permission:laporan.view`, a thin `ReportController`, and `ReportService` (`normaliseFilters()` with a whitelist, `builder()` with `join()` + `when()` + binding, `applySort()` with a column whitelist). You **write the input → filter result table yourself** first, then **prove** every row with `php spark shell` and the `ci4-spark` MCP tools.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs run in both terminals.
- M1 and M2 merged into `main` (Lab 8.13); `composer test` green.
- Lab 7.6–7.8: `CLAUDE.md`, the `semak-ci4` subagent, the `ci4-spark` MCP server *connected*.
- `php spark shell` (Day 3, [`arahan-spark.md`](../docs/arahan-spark.md)) works.

### Steps

0. **Branch & demo data.**

   ```bash tab="Git Bash / macOS / Linux"
   git switch main && git pull
   git switch -c feat/laporan-claude
   ```

   ```powershell tab="PowerShell"
   git switch main
   git pull
   git switch -c feat/laporan-claude
   ```

   Demo data: follow Lab 9.1 **step 0** only (copy `DemoDataSeeder.php.txt`, add the call in `DatabaseSeeder::run()`, run the seeder). This is data, not a code-writing exercise.

   > 📚 **Reference only:** Labs 9.1–9.4 (manual) are the reference code for the Report Module. You do **not** need to type them. Open them only at the *Compare with the reference code* step or when a Claude diff looks doubtful.

1. **SPEC & filter table (you, 15 minutes).** Read SPEC §2.3 (RPT-01..03 and their filters), §5 (`ReportService`), §6 (report routes) and §10 (*Do not write raw SQL with user input*). Then:
   - Copy the spec card from Lab 9.1 step 1 into `docs/laporan-spec.md` and fill it in yourself for RPT-01 and RPT-02.
   - Add this filter target table and fill in the right-hand column **before** opening Claude:

   ```markdown
   ## Filters — targets (slice L1)
   | ?query input | Expected $filters result |
   |--------------|--------------------------|
   | from=2026-06-01 | |
   | from=2026-02-31 | |
   | from=2026-06-30&to=2026-06-01 | |
   | status=approved | |
   | status=bogus | |
   | status[]=approved | |
   | sort=b.id; DROP TABLE users | |
   | dir=sideways | |
   ```

2. **Plan (Plan mode).** Start `claude`, press `Shift+Tab` (or `Alt+M`) until **plan mode**, then paste:

   ```text
   Plan mode. Do not change any file.
   Report Module slice L1: routes, skeleton controller and ReportService (filters + builder), no views yet.
   Read @docs/spesifikasi-sistem.md sections 2.3, 3, 5, 6, 9 and 10, @docs/laporan-spec.md,
   @app/Enums/BookingStatus.php, @app/Enums/PassStatus.php, @app/Enums/PassType.php and @app/Enums/SlotCategory.php.
   Propose a numbered plan (maximum 5 steps). Each step: file, method, what changes, how I test it.
   The plan must include:
   - A laporan route group (tempahan, pas, penggunaan) with the permission:laporan.view filter.
   - A thin ReportController: bookings(), passes(), usage() calling service('reportService').
   - ReportService::normaliseFilters(string $report, array $input): every value goes through a whitelist —
     enum ::tryFrom(), valid dates (Y-m-d and real), reversed range swapped, positive ids only,
     arrays refused, sort only keys in the SORTABLE constant (URL key => SQL column), dir only asc/desc.
     It must satisfy the "Filters — targets" table in @docs/laporan-spec.md.
   - ReportService::builder(string $report, array $f): Query Builder with join() and when();
     RPT-01 overlapping range (start_date <= :to AND end_date >= :from, BR-TLK-01);
     RPT-02 half-open created_at (>= from, < to + 1 day); departments LEFT JOIN.
   - applySort() that only passes columns from SORTABLE to orderBy(), with id as the second sort.
   - Register reportService in app/Config/Services.php.
   No SQL concatenated with input. Do not touch migrations or tests. Ask me first if anything is unclear.
   ```

   **A good plan contains:** the whitelist before the query (filters are cleaned once, then the builder only accepts clean `$filters`); `where('b.status', $f['status'])` (automatic binding); `SORTABLE` as a constant; different date ranges for RPT-01 (overlap) and RPT-02 (half-open); route and class names exactly as SPEC §5–§6.

   **REJECT the plan if:** `orderBy($this->request->getGet('sort'))` or any input straight into `orderBy()`/`select()`; `where("status = '$status'")`; filter validation in the controller only; `group:` instead of `permission:laporan.view`; a separate query per report without a shared `builder()`; views or export in this slice.

   Edit the plan and copy the final plan into `docs/nota-claude.md` → a new section *Slice L1 — ReportService (Lab 9.10)*.

3. **Implement in Manual mode** (`Shift+Tab` until neither *plan mode* nor *accept edits* shows; *auto*/*bypass* are forbidden), one step at a time:

   ```text
   Implement step 1 of the plan only. Before every Edit, explain in 2 lines what changes and why.
   Do not run php spark, composer or git. Stop after step 1.
   ```

   **A good diff:** `PassStatus::tryFrom($this->str($input, 'status') ?? '')?->value`; `array_key_exists((string) $sort, self::SORTABLE[$report]) ? $sort : $defaultSort`; `->when($f['status'] ?? null, static fn (BaseBuilder $q, string $s) => $q->where('p.status', $s))`; `->orderBy(self::SORTABLE[$report][$f['sort']], $f['dir'])->orderBy('p.id', $f['dir'])`.

   **REJECT the diff if:** raw `$_GET` values reach `builder()`; `$db->query("... {$x} ...")`; `like()` or `orWhere()` without `groupStart()`; manual `escape()` instead of binding; a `<= to` date on `created_at` (the last day is lost); files outside the plan.

4. **Verify (yourself).**
   - MCP (Plan mode): `Use the ci4-spark filter_check tool for GET /laporan/pas and GET /laporan/tempahan.` Expected: `permission:laporan.view` in *Before Filters*. Compare with `php spark routes` run yourself.
   - `php spark shell` (🪟 Git Bash: `winpty php spark shell` if the prompt hangs), one line at a time:

     ```php
     $r = service('reportService');
     print_r($r->normaliseFilters('pas', ['status' => 'bogus', 'sort' => 'b.id; DROP TABLE users', 'dir' => 'sideways']));
     print_r($r->normaliseFilters('tempahan', ['from' => '2026-06-30', 'to' => '2026-06-01', 'status' => ['approved']]));
     echo $r->builder('pas', $r->normaliseFilters('pas', ['status' => 'approved', 'from' => '2026-09-01', 'to' => '2026-09-30']))->getCompiledSelect();
     ```

     Expected: line 1 → `status` empty, `sort` = `created_at`, `dir` = `desc`; line 2 → `from` `2026-06-01`, `to` `2026-06-30`, `status` empty; line 3 → SQL with a `LEFT JOIN` on `departments`, `'approved'` escaped, `created_at >= '2026-09-01 00:00:00'` and `created_at < '2026-10-01 00:00:00'`. Mark each row of the *Filters — targets* table ✔ or ✘.
   - `composer test` → green (M1/M2 not broken).

5. **`semak-ci4` review** (Plan mode):

   ```text
   Use the semak-ci4 subagent to review app/Services/ReportService.php, app/Controllers/Laporan and app/Config/Routes.php. Focus on category 4 (Query Builder, orderBy, whitelist).
   ```

   Fix real findings through the same loop; record false findings with the reason.

6. **Explain gate.** In `docs/nota-claude.md` (Slice L1), 3 lines in your own words: the `SORTABLE`/`array_key_exists` line for `sort`, one `tryFrom()` line, and the `created_at <` range line. For each one: *what malicious input it blocks, and what happens if it is removed*.

7. **Small commit:**

   ```bash
   git add app/ docs/
   git commit -m "RPT: ReportService — penapis whitelist & builder berbinding (slice L1)"
   ```

8. **Compare with the reference code.** Open [Lab 9.2](#lab-92--reportservice-join-dynamic-filters-aggregate-pagination-s2) step 2 (`normaliseFilters()`), 3–5 (builder and `applySort()`). Record one difference in `docs/nota-claude.md` and whether it is acceptable.

### ✅ Checkpoint
- [ ] The *Filters — targets* table is filled in by you before the plan, and all eight rows are ✔ in `php spark shell` (Quiz S9).
- [ ] `filter_check` (MCP) and `php spark routes` show `permission:laporan.view` on all three report routes (Quiz S9).
- [ ] The RPT-02 `getCompiledSelect()` SQL shows a `LEFT JOIN` and a half-open `created_at` range (Quiz S9).
- [ ] No user input reaches `orderBy()` without going through `SORTABLE`; the `semak-ci4` findings are recorded (Quiz S9).
- [ ] The 3-line explain gate is filled in in your own words (Quiz S9).
- [ ] Commit `RPT: ReportService — penapis whitelist & builder berbinding (slice L1)` in `git log` (Quiz S9).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `php spark shell` hangs in Git Bash | mintty does not support interactive PHP input | `winpty php spark shell`, or use the VS Code PowerShell terminal |
| `Call to undefined method ... reportService()` | The service is not registered in `app/Config/Services.php` | See the plan step; reject a diff that creates `new ReportService()` in the controller without registration |
| `php spark routes \| grep laporan` fails in PowerShell | There is no `grep` | `php spark routes \| Select-String laporan` |
| `filter_check` in Git Bash: route not found | Git Bash turns `/laporan/pas` into a Windows path | `MSYS_NO_PATHCONV=1 php spark filter:check GET /laporan/pas` |
| `print_r` in the shell prints an empty `Array ( )` | Input key misspelt (`from_date` instead of `from`) | Use the SPEC keys: `from`, `to`, `status`, `pass_type`, `department_id`, `zone_id`, `category`, `sort`, `dir` |
| `Unknown column 'd.name'` | `departments` is joined with a different alias | Reject the diff; ask Claude to follow the plan aliases (`p`, `u`, `d`) |

### ⭐ Bonus challenge
- Ask Claude (Plan mode) to find one `?query` input that still passes `normaliseFilters()` but silently produces an empty report. Add that row to the target table and decide yourself what the correct behaviour is.

---

## Lab 9.11 — Claude Code: Report List Views & RPT-03 (S10)

### 🎯 Objective
Build slice L2: a `method="get"` filter form that keeps its values, a paginated table that carries the same filters, sortable headers (whitelist), export links from the **clean** filters, and the RPT-03 aggregate (`selectCount()` + `groupBy()`). You **test** attribute XSS and access leaks yourself.

### Prerequisites
- Lab 9.10 done and committed on `feat/laporan-claude`.

### Steps

1. **SPEC (you, 5 minutes).** Read SPEC §2.3 (*paginated HTML view + Export PDF + Export Excel buttons; the same filter is carried through the query string*) and README §1.3–§1.4. In `docs/nota-claude.md`, write a *Slice L2* section with the 4 things you will test: filters kept after submitting, filters kept on page 2, export links carry the same filters, and `pemohon1` is refused.

2. **Plan (Plan mode):**

   ```text
   Plan mode. Do not change any file.
   Report Module slice L2: RPT-01/RPT-02 list views and the RPT-03 aggregate.
   Read @docs/spesifikasi-sistem.md sections 2.3, 3 and 6, @docs/laporan-spec.md,
   @app/Services/ReportService.php, @app/Controllers/Laporan/ReportController.php and @app/Views/layouts/main.php.
   Propose a numbered plan (maximum 5 steps). Each step: file, what changes, how I test it.
   The plan must include:
   - One view app/Views/laporan/index.php for all three reports: a method="get" form that
     keeps its values from the CLEAN $filters (not $_GET), every value through esc(..., 'attr').
   - ReportService::paginate(): the record total + the current page rows from the same builder().
   - A pager that keeps the filters on every page.
   - Sortable column headers only for keys in SORTABLE.
   - Export PDF/Excel links built from toQuery($filters) + export=pdf|xlsx (the real export comes in slice L3).
   - RPT-03 usageByZone(): selectCount() + groupBy() per zone for the month/year; utilisation percentage calculated in PHP.
   - A Laporan menu link only if auth()->user()->can('laporan.view') (UX only).
   Do not change normaliseFilters() or the routes. Ask me first if anything is unclear.
   ```

   **A good plan contains:** one filter source (`$filters` from `normaliseFilters()`) for the form, the pager, the sort headers and the export links; `esc()` with the `'attr'` context in attributes; `GET` (not `POST`) for the filter form.

   **REJECT the plan if:** the form is `method="post"`; form values or links are built from raw `$_GET`/`$this->request->getGet()`; the RPT-03 aggregate query is written as concatenated raw SQL; `getResultArray()` for all rows without pagination; hiding the menu is the only access control.

   Edit the plan and copy it into `docs/nota-claude.md`.

3. **Implement in Manual mode**, one step at a time:

   ```text
   Implement step 1 of the plan only. Before every Edit, explain in 2 lines what changes and why.
   Do not run php spark, composer or git. Stop after step 1.
   ```

   **A good diff:** `<input type="date" name="from" value="<?= esc($filters['from'] ?? '', 'attr') ?>">`; `href="<?= current_url() . '?' . esc(http_build_query($query + ['export' => 'pdf']), 'attr') ?>"`; `->selectCount('b.id', 'bookings')->groupBy('z.id')`.

   **REJECT the diff if:** `value="<?= $_GET['from'] ?>"` or `value="<?= $filters['from'] ?>"` without `esc()`; `<?= $row['full_name'] ?>` without `esc()`; export links from `$_GET`; sort headers accept a column name from the URL without a `SORTABLE` check.

4. **Verify (yourself)** as `penyemak@latihan.test`:
   - `/laporan/pas?status=approved` → submit the form with `pass_type`; both values stay in the form; click page 2 → the URL still has `status` and `pass_type`.
   - Hover the **Eksport Excel** link → the URL carries the same filters + `export=xlsx`.
   - Attribute XSS: open `/laporan/tempahan?from=%22%3E%3Cb%3Ex` → *View Page Source*: the `from` value is empty (invalid date dropped) and there is no raw `<b>` in the HTML.
   - Debug Toolbar → *Database*: the report query shows the filter values in `WHERE`, `LIMIT 20`.
   - `/laporan/penggunaan?year=2026&month=6` → one row per zone with the utilisation percentage.
   - Log in as `pemohon1@latihan.test` → open `/laporan/pas` → redirect with a Shield message; there is no Laporan menu.

5. **`semak-ci4` review** (Plan mode):

   ```text
   Use the semak-ci4 subagent to review app/Views/laporan, app/Services/ReportService.php and app/Views/layouts/main.php. Focus on category 1 (esc() and the attr/url contexts).
   ```

6. **Explain gate.** In `docs/nota-claude.md` (Slice L2), 3 lines in your own words: the `esc(..., 'attr')` line in the form, the export link line built from `$query`, and the RPT-03 `groupBy()` line.

7. **Small commit:**

   ```bash
   git add app/ docs/
   git commit -m "RPT: paparan senarai berpagination & RPT-03 aggregate (slice L2)"
   ```

8. **Compare with the reference code.** Open [Lab 9.1](#lab-91--report-design--get-filter-form-s1) step 4 (form) and [Lab 9.2](#lab-92--reportservice-join-dynamic-filters-aggregate-pagination-s2) steps 6, 7 and 9 (pagination, RPT-03, table). Record one difference in `docs/nota-claude.md`.

### ✅ Checkpoint
- [ ] Filters are kept after submitting and on page 2; export links carry the same filters (Quiz S10).
- [ ] `?from=%22%3E%3Cb%3Ex` produces no raw HTML in *View Page Source* (Quiz S10).
- [ ] RPT-03 June 2026 shows one row per zone with the utilisation percentage (Quiz S10).
- [ ] `pemohon1` is refused on the server for `/laporan/pas`; the Laporan menu is not shown (Quiz S10).
- [ ] The 3-line explain gate is filled in; the `semak-ci4` findings are recorded (Quiz S10).
- [ ] Commit `RPT: paparan senarai berpagination & RPT-03 aggregate (slice L2)` in `git log` (Quiz S10).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Page 2 loses the filters | The pager is built without the current query string | Reject the diff; ask for a pager that carries `toQuery($filters)` |
| The `type="date"` input is empty even though the URL has `from` | The format is not `Y-m-d` (e.g. `01/06/2026` from Windows language settings) | The `value` must be `Y-m-d`; the browser handles the local display |
| RPT-03 percentage over 100 % | Booking days counted beyond the selected month | Ask Claude (Plan mode) to explain the formula; compare with README §1.2 (Zone A June = 25.0 %) |
| `Undefined variable $query` in the view | The controller does not pass `toQuery($filters)` | See the plan step; accept a diff that adds `'query' => $service->toQuery($filters)` |
| No Debug Toolbar | `CI_ENVIRONMENT` is not `development` | `.env`: `CI_ENVIRONMENT = development` (do not commit `.env`) |

### ⭐ Bonus challenge
- Ask Claude (Plan mode) to compare the number of queries in the Debug Toolbar for RPT-01 page 1 and page 2. Explain yourself why `countAllResults(false)` is used before `limit()`.

---

## Lab 9.12 — Claude Code: Safe PDF & Excel Export (S11)

### 🎯 Objective
Build slice L3: `ExportService::pdf()` (Dompdf) and `xlsx()` (PhpSpreadsheet) from `ReportService::exportRows()`, which calls the **same** `builder()` as the screen, with a row limit (`LengthException`), `esc()` in the PDF view, and Excel text written explicitly as strings (safe from formula injection). You **prove** screen = PDF = Excel and that `=1+1` stays text.

### Prerequisites
- Lab 9.11 done and committed.
- `ext-zip` and `ext-gd` enabled (`php -m`).

### Steps

1. **Libraries (yourself, not Claude).**

   ```bash
   composer require dompdf/dompdf phpoffice/phpspreadsheet
   composer show dompdf/dompdf phpoffice/phpspreadsheet
   ```

   Expected: both packages listed with a version. Commit `composer.json` and `composer.lock` only (`vendor/` is in `.gitignore`).

2. **SPEC & risks (you, 5 minutes).** Read SPEC §1 (Dompdf, PhpSpreadsheet), §2.3 and README §3.1–§3.4. In `docs/nota-claude.md` → *Slice L3*, write the 4 risks the plan must handle: Excel formula injection, HTML in names (PDF), row/memory limits, export filters that differ from the screen.

3. **Plan (Plan mode):**

   ```text
   Plan mode. Do not change any file.
   Report Module slice L3: PDF and Excel export.
   Read @docs/spesifikasi-sistem.md sections 1, 2.3, 5 and 9, @app/Services/ReportService.php,
   @app/Controllers/Laporan/ReportController.php and @app/Views/laporan/index.php.
   Propose a numbered plan (maximum 5 steps). Each step: file, what changes, how I test it.
   The plan must include:
   - ReportService::exportRows(string $report, array $filters, string $format): use the SAME builder()
     as the screen; countAllResults(false) first; LengthException if over EXPORT_LIMIT
     (pdf 2000, xlsx 10000); rows read one at a time (getUnbufferedRow), not getResultArray().
   - app/Services/ExportService.php: pdf() with Dompdf (A4 landscape, isRemoteEnabled false, DejaVu Sans font)
     and xlsx() with PhpSpreadsheet (bold header, auto width, frozen row).
   - In xlsx(): numbers written as numbers; ALL text written with
     setCellValueExplicit(..., DataType::TYPE_STRING) so text starting with =, +, - or @ does not become a formula.
   - View app/Views/laporan/pdf.php without the Bootstrap layout; every value through esc().
   - ReportController: ?export=pdf|xlsx -> exportRows() -> ExportService -> download() with the file name
     laporan-<report>-YmdHis.<ext>; LengthException -> redirect to the same URL without export, error flash.
   - Register exportService in app/Config/Services.php.
   Do not change normaliseFilters(), builder() or the routes. Ask me first if anything is unclear.
   ```

   **A good plan contains:** export through the same `builder()` (one source of truth); the limit check **before** reading rows; `TYPE_STRING` for text; `esc()` in `pdf.php`; export permission coming from the same route filter (`permission:laporan.view`).

   **REJECT the plan if:** the export query is rewritten (`$db->table('pass_applications')->...`); `fromArray()` for user data (`=...` values become formulas); `isRemoteEnabled` `true`; temporary files in `public/`; a new export route without a filter; Claude proposes running `composer require` itself.

   Edit the plan and copy it into `docs/nota-claude.md`.

4. **Implement in Manual mode**, one step at a time:

   ```text
   Implement step 1 of the plan only. Before every Edit, explain in 2 lines what changes and why.
   Do not run composer, php spark or git. Stop after step 1.
   ```

   **A good diff:** `$sheet->setCellValueExplicit($coord, (string) $value, DataType::TYPE_STRING);` in the row loop; `if ($total > $limit) { throw new LengthException(...); }` before `streamRows()`; `<td><?= esc($row[$key]) ?></td>` in `pdf.php`; `$options->set('isRemoteEnabled', false);`.

   **REJECT the diff if:** `$sheet->fromArray($rows)` for the data rows; `setCellValue()` for user text; `<?= $row[$key] ?>` without `esc()` in the PDF; `ini_set('memory_limit', '-1')` as a "fix"; a leftover `echo` or `var_dump` (corrupts the binary file).

5. **Verify (yourself)** as `penyemak@latihan.test`:
   - RPT-01 `status=approved`: screen *N* records → PDF "Jumlah rekod: *N*" → Excel *N* data rows. **Three equal numbers.**
   - Formula injection: note the original `full_name` of `pemohon2`, change it to `=1+1` (Lab 9.3 step 8, the `mysql … UPDATE users SET full_name = '=1+1' …` command), export RPT-02 to Excel → the name cell shows the text `=1+1`, not `2`. Restore the original `full_name`.
   - File name: `laporan-pas-<tarikh>-<masa>.xlsx`.
   - `pemohon1@latihan.test` opens `/laporan/pas?export=xlsx` directly → refused (Shield redirect), no file downloaded.
   - `composer test` → green.

6. **`semak-ci4` review** (Plan mode), then the AI-06-style export review from Lab 9.3 step 8 (paste the same prompt):

   ```text
   Use the semak-ci4 subagent to review app/Services/ExportService.php, app/Services/ReportService.php, app/Views/laporan/pdf.php and app/Controllers/Laporan/ReportController.php.
   ```

7. **Explain gate.** In `docs/nota-claude.md` (Slice L3), 3 lines in your own words: the `setCellValueExplicit(..., TYPE_STRING)` line, the `EXPORT_LIMIT` check line, and the `esc()` line in `pdf.php`.

8. **Small commit:**

   ```bash
   git add app/ composer.json composer.lock docs/
   git commit -m "RPT: eksport PDF & Excel selamat dari builder yang sama (slice L3)"
   ```

9. **Compare with the reference code.** Open [Lab 9.3](#lab-93--pdf-dompdf--excel-phpspreadsheet-export-s3) step 2 (`ExportService`), 4 (`exportRows()`) and 5 (controller). Record one difference in `docs/nota-claude.md`.

### ✅ Checkpoint
- [ ] The screen, the PDF and Excel show the same record total for RPT-01 `status=approved` (Quiz S11).
- [ ] The synthetic name `=1+1` stays text in Excel; the original `full_name` is restored (Quiz S11).
- [ ] `pemohon1` is refused for `/laporan/pas?export=xlsx` (Quiz S11).
- [ ] An export over the limit shows an error flash, not a corrupt file or a memory error (Quiz S11).
- [ ] The 3-line explain gate is filled in; the `semak-ci4` findings are recorded (Quiz S11).
- [ ] Commit `RPT: eksport PDF & Excel selamat dari builder yang sama (slice L3)` in `git log` (Quiz S11).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ZipArchive not found` during `.xlsx` | `ext-zip` not enabled in Laragon | `php.ini`: `extension=zip`; restart Laragon |
| Excel: *We found a problem with some content* | Extra output (space after `?>`, BOM, `echo`) mixed with the binary | Remove the closing `?>` in pure PHP files; save as UTF-8 **without BOM** (VS Code: *Save with Encoding*) |
| `mysql` asks for a password but no prompt appears in Git Bash | mintty | `winpty mysql …`, or Laragon's HeidiSQL |
| `?` characters in the PDF | The Helvetica font has no Unicode glyphs | `setDefaultFont('DejaVu Sans')` in the plan; reject a diff that removes the font |
| `composer require` fails: `ext-gd` required | `extension=gd` is commented out in `php.ini` | Enable `gd`; `php -m` in the same terminal |
| The downloaded file is named `pas` with no extension | `download()` without the full file name | Name `laporan-<laporan>-YmdHis.<ext>` as in the plan |

### ⭐ Bonus challenge
- Ask Claude (Plan mode) to explain why `exportRows()` is **not** a generator function even though it returns a generator. Check the answer by reading the comment in Lab 9.3 step 4.

---

## Lab 9.13 — Claude Code: Report Tests & Performance (S12)

### 🎯 Objective
Close the Report Module: `tests/Services/ReportServiceTest.php` that proves *report total = SQL total* from a fixture **you calculate by hand**, one mutation that fails a test, an `EXPLAIN` analysis (the `laporan:explain` command) and the existing indexes through the `db_table` MCP tool, and an index proposal that is recorded (not implemented) — **M3 done**.

### Prerequisites
- Labs 9.10–9.12 committed; `.env` `database.tests.*` → MySQL `kkm_latihan_test`.

### Steps

1. **Fixture on paper (you, 10 minutes).** Design 5 bookings (slot, dates, status) and 3 pass applications (`created_at`, status). Calculate by hand and write in `docs/nota-claude.md` → *Slice L4*: how many are `approved`; how many overlap June 2026; how many passes fall in September 2026 including the last day; the Zone A utilisation percentage for June.

2. **Plan (Plan mode):**

   ```text
   Plan mode. Do not change any file.
   Report Module slice L4: ReportService tests and performance analysis.
   Read @app/Services/ReportService.php, @docs/spesifikasi-sistem.md sections 3 and 9,
   and the Slice L4 fixture and hand answers in @docs/nota-claude.md.
   Propose a numbered plan (maximum 4 steps). Each step: file, what changes, how I test it.
   The plan must include:
   - tests/Services/ReportServiceTest.php: DatabaseTestTrait, $migrate = true, $refresh = true,
     $namespace = null; the fixture EXACTLY as in my notes, with fixed dates (not date('Y-m-d')).
   - At least 7 tests: RPT-01 without filters = table total; RPT-01 status = SQL COUNT(*);
     overlapping range; sort outside the whitelist falls back to the default; export total = HTML total;
     RPT-02 last day of the range not lost; RPT-03 utilisation rate June 2026.
   - Expected values taken from my hand answers, not recalculated by the code under test.
   - app/Commands/ReportExplain.php (laporan:explain <tempahan|pas> [status] [from] [to]) that prints
     the SQL from builder()->getCompiledSelect() and EXPLAIN FORMAT=TRADITIONAL.
   Do not change ReportService to make the tests pass. Do not add migrations or indexes.
   Ask me first if anything is unclear.
   ```

   **A good plan contains:** expected values from your notes (e.g. `assertSame(3, $total)`); a comparison with a direct SQL `COUNT(*)` through `$this->db->table(...)->countAllResults()`; fixed June/September 2026 dates.

   **REJECT the plan if:** the tests calculate expected values by calling `ReportService` itself; the tests use SQLite; the fixture depends on `kkm_latihan` data; a new index migration; application code is changed so the tests pass.

3. **Implement in Manual mode**, one step at a time:

   ```text
   Implement step 1 of the plan only. Before every Edit, explain in 2 lines what changes and why.
   Do not run composer, php spark or git. Stop after step 1.
   ```

   **REJECT the diff if:** `assertGreaterThan(0, ...)` replaces an exact number; `markTestSkipped()`; expected values differ from your hand answers without explanation (discuss first: who is wrong, you or the code?).

4. **Verify (yourself).**

   ```bash
   composer test -- tests/Services/ReportServiceTest.php --testdox
   ```

   Expected: at least 7 `✔` lines and `OK (N tests, M assertions)`.

   **Mutation:** in the RPT-02 `builder()`, change `'p.created_at <'` to `'p.created_at <='` yourself and remove the `+ 1 hari` (as in Lab 9.4 step 5). Run again → the *last day of the range* test **must fail**. Restore with `git restore app/Services/ReportService.php` → green.

5. **Performance (MCP + EXPLAIN).**
   - Plan mode: `Use the ci4-spark db_table tool for pass_applications and slot_bookings. List the indexes of each table.` Expected: `pass_applications` has the `status` and `ref_no` (UNIQUE) indexes but **no** index on `created_at`; `slot_bookings` has the (`slot_id`,`start_date`,`end_date`) and `status` indexes. Compare with `php spark db:table pass_applications --metadata`.
   - Terminal:

     ```bash
     php spark laporan:explain tempahan approved 2026-06-01 2026-06-30
     php spark laporan:explain pas "" 2026-09-01 2026-09-30
     ```

     Expected: RPT-01 with `status` → table `b` uses an index (`key` not empty); RPT-02 with dates only → table `p` `type = ALL`. Record `type`, `key`, `rows` in `docs/laporan-spec.md` → *Prestasi*.
   - Plan mode: paste the EXPLAIN output and ask Claude to explain `type = ALL`, a suitable index and its cost on `INSERT`. The `INDEX(created_at)` proposal is recorded in `docs/log-keputusan.md` as a **proposal to the system owner** — no migration today.

6. **Final review.** `semak-ci4` on `app/Services`, `app/Controllers/Laporan`, `app/Views/laporan` and `app/Commands/ReportExplain.php`; then AI-08 (DoD [`kolaborasi.md`](../docs/kolaborasi.md) §2) in Plan mode as in Lab 8.13 step 2. Fix every real "Not met" with a `FIX:` commit.

7. **Explain gate.** In `docs/nota-claude.md` (Slice L4), 3 lines in your own words: one `assertSame()` with your hand value, the `getCompiledSelect()` line in `ReportExplain`, and one EXPLAIN output line (`type = ALL`). Then a partner picks 1 random line from `git diff main...feat/laporan-claude -- app/` for you to explain without Claude.

8. **Commit & MR:**

   ```bash tab="Git Bash / macOS / Linux"
   git add app/ tests/ docs/
   git commit -m "RPT: ReportServiceTest, laporan:explain & cadangan index (slice L4)"
   git push -u origin feat/laporan-claude
   ```

   ```powershell tab="PowerShell"
   git add app/ tests/ docs/
   git commit -m "RPT: ReportServiceTest, laporan:explain & cadangan index (slice L4)"
   git push -u origin feat/laporan-claude
   ```

   Open the MR `feat/laporan-claude` → `main`, answer one comment, then merge — **M3 done**.

9. **Compare with the reference code.** Open [Lab 9.4](#lab-94--test-report-total--sql-total--explain-s4) steps 2–3 (fixture and 7 tests) and 6 (`ReportExplain`). Find one reference test that is missing from your tests and record whether it should be added.

### ✅ Checkpoint
- [ ] The fixture hand answers are written before the plan; `ReportServiceTest` is green with at least 7 tests that use those hand numbers (Quiz S12).
- [ ] The `<=` mutation fails the last-day test; the code is restored (Quiz S12).
- [ ] The `db_table` (MCP) index list matches `php spark db:table --metadata`; RPT-02 with dates only shows `type = ALL` on `p` (Quiz S12).
- [ ] The index proposal is recorded in `docs/log-keputusan.md`, no new migration (Quiz S12).
- [ ] The MR `feat/laporan-claude` → `main` is merged after the final review and the explain gate — **M3 done** (Quiz S12).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `no such function: DATEDIFF` | The `tests` DB group is still SQLite | `.env`: `database.tests.*` → MySQL `kkm_latihan_test` |
| EXPLAIN prints a tree `-> Nested loop …` | MySQL 9 changed the default format | `EXPLAIN FORMAT=TRADITIONAL`; MariaDB: remove `FORMAT=TRADITIONAL` |
| `laporan:explain pas "" 2026-09-01 …` in PowerShell: the date goes in as the status | PowerShell drops the empty `""` | Use `'""'` or `--% pas "" 2026-09-01 2026-09-30` |
| Tests pass on your laptop, fail on your partner's | The fixture depends on `date('Y-m-d')` | Fixed June/September 2026 dates |
| `Duplicate entry 'WXX 9001'` | Data left over from a previous test | `protected $refresh = true;` |
| `db_table` MCP: `Table 'pass_applications' not found` | `.env` points to another database | Check `database.default.database = kkm_latihan`; `/mcp` → *reconnect* |

### ⭐ Bonus challenge
- Ask Claude (Plan mode) to draft a **new** migration `AddCreatedAtIndexToPassApplications` without writing the file. Compare it with the `migration-ci4` skill (Lab 7.7): two rules it follows, one it does not.

---

## Lab 9.1 — Report design & GET filter form (S1)

### 🎯 Objective
- Write spec cards for RPT-01, RPT-02, RPT-03.
- Build the `/laporan/*` routes protected by `permission:laporan.view`.
- Build a `GET` filter form that keeps its values after it is submitted.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- M1 & M2 done and merged; `php spark migrate:status` all *Yes*.
- Synthetic data exists: `php spark db:seed DatabaseSeeder`; the report demo data is prepared in **step 0**.
- You can log in as `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test`, `pemohon1@latihan.test` (password `Latihan@2026`).

### Steps

**0. Prepare the demo data (10 min).** The reports and the charts (Day 10) need data across months and statuses. Copy `DemoDataSeeder.php.txt` (**Templat & Rujukan** module) to `app/Database/Seeds/DemoDataSeeder.php` (copy it as is — this is data, not a writing exercise), then add its call at the end of `DatabaseSeeder::run()`:

```php
$this->call(DemoDataSeeder::class);     // Days 9–10: demo data for Reports/Statistics (≥ 20 bookings, ≥ 15 passes)
```

```bash
php spark db:seed DemoDataSeeder
```

This seeder is **skipped** if `slot_bookings` or `pass_applications` already has rows (your lab data). For clean demo data (22 bookings, 18 Pass applications, 12 months), reset the development DB — this **deletes all data** in `kkm_latihan`:

```bash
php spark migrate:refresh --all
php spark db:seed DatabaseSeeder
```

**1. Write the spec cards (15 min).** Copy this table into `docs/laporan-spec.md` in your project repo and fill in every cell. Look at README §1.2 **after** you have tried it yourself.

```markdown
| | RPT-01 | RPT-02 | RPT-03 |
|---|---|---|---|
| Business question answered | | | |
| Main reader | | | |
| Columns (in order) | | | |
| Filters + input type | | | |
| Meaning of the date range | | | |
| Default sort order | | | |
| Who can view it (permission) | | | |
```

**2. Add the routes.** Open `app/Config/Routes.php` and add the report group (see `Routes-laporan-statistik.php.txt` (**Templat & Rujukan** module)):

```php
$routes->group('laporan', [
    'namespace' => 'App\Controllers\Laporan',
    'filter'    => 'permission:laporan.view',
], static function ($routes) {
    $routes->get('tempahan', 'ReportController::bookings', ['as' => 'laporan.tempahan']);
    $routes->get('pas', 'ReportController::passes', ['as' => 'laporan.pas']);
    $routes->get('penggunaan', 'ReportController::usage', ['as' => 'laporan.penggunaan']);
});
```

```bash tab="Git Bash / macOS / Linux"
php spark routes | grep laporan
```

```powershell tab="PowerShell"
php spark routes | Select-String laporan
```

**3. Create a skeleton controller.**

```bash
php spark make:controller Laporan/ReportController
```

Replace the generated file's contents with the skeleton below. For now `bookings()`, `passes()` and `usage()` only show the filter form: raw GET values and dropdown options, no report data. The full controller is built in Lab 9.2.

`app/Controllers/Laporan/ReportController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Laporan;

use App\Controllers\BaseController;
use App\Enums\BookingStatus;
use App\Enums\PassStatus;
use App\Enums\PassType;
use App\Enums\SlotCategory;
use App\Models\DepartmentModel;
use App\Models\ParkingZoneModel;

/**
 * RANGKA Lab 9.1 — borang penapis sahaja, tiada data laporan.
 * Lab 9.2 langkah 8 menggantikan seluruh fail ini dengan versi yang memanggil ReportService.
 */
class ReportController extends BaseController
{
    /** GET /laporan/tempahan — RPT-01 */
    public function bookings(): string
    {
        return $this->skeleton('tempahan', 'RPT-01 Senarai Tempahan TLK');
    }

    /** GET /laporan/pas — RPT-02 */
    public function passes(): string
    {
        return $this->skeleton('pas', 'RPT-02 Senarai Permohonan Pas');
    }

    /** GET /laporan/penggunaan — RPT-03 */
    public function usage(): string
    {
        return $this->skeleton('penggunaan', 'RPT-03 Penggunaan Slot Mengikut Zon');
    }

    private function skeleton(string $report, string $title): string
    {
        // SEMENTARA: nilai GET mentah (view tetap guna esc()). Lab 9.2: normaliseFilters() membuat whitelist.
        $get     = $this->request->getGet() ?? [];
        $filters = [];

        foreach (['from', 'to', 'zone_id', 'category', 'department_id', 'pass_type', 'status', 'year', 'month', 'sort', 'dir'] as $key) {
            $filters[$key] = is_string($get[$key] ?? null) ? $get[$key] : null;
        }
        $filters['year'] ??= date('Y');

        // Pilihan dropdown dari enum ::cases() + ->label() — bukan senarai ditaip tangan.
        $enumOptions = static fn (array $cases): array => array_map(
            static fn ($c): array => ['value' => $c->value, 'label' => $c->label()],
            $cases,
        );

        return view('laporan/index', [
            'title'   => $title,
            'report'  => $report,
            'filters' => $filters,
            'options' => [
                'zones' => array_map(
                    static fn (array $z): array => ['value' => (int) $z['id'], 'label' => $z['code'] . ' — ' . $z['name']],
                    model(ParkingZoneModel::class)->orderBy('code')->findAll(),
                ),
                'departments' => array_map(
                    static fn (array $d): array => ['value' => (int) $d['id'], 'label' => $d['code'] . ' — ' . $d['name']],
                    model(DepartmentModel::class)->orderBy('name')->findAll(),
                ),
                'categories' => $enumOptions(SlotCategory::cases()),
                'pass_types' => $enumOptions(PassType::cases()),
                'statuses'   => $report === 'pas' ? $enumOptions(PassStatus::cases()) : $enumOptions(BookingStatus::cases()),
            ],
        ]);
    }
}
```

**4. Build the filter form view** `app/Views/laporan/index.php`. Must-haves:

- `<form method="get" action="<?= current_url() ?>">` — **no** `csrf_field()` (GET).
- Every input is refilled from `$filters`:
  ```php
  <input type="date" name="from" class="form-control" value="<?= esc((string) $filters['from'], 'attr') ?>">
  <option value="<?= esc($o['value'], 'attr') ?>" <?= (string) $filters['status'] === (string) $o['value'] ? 'selected' : '' ?>>
      <?= esc($o['label']) ?>
  </option>
  ```
- The status/category/pass type dropdowns are built from the enum's `::cases()` and `->label()` — **not** from a hand-typed list.
- The **Reset** button = a link to `current_url()` without the query string.

Full code. The last comment line before `endSection()` is where the Lab 9.2 table goes:

`app/Views/laporan/index.php`

```php
<?php

/**
 * app/Views/laporan/index.php — Hari 9
 * Satu view untuk RPT-01/02/03. Lab 9.1: borang penapis GET. Lab 9.2: jadual berpagination + butang eksport.
 *
 * @var string                          $title    dipapar sebagai <h1> oleh layouts/main.php
 * @var string                          $report   tempahan|pas|penggunaan
 * @var array<string, int|string|null>  $filters  nilai penapis semasa
 * @var array<string, list<array>>      $options  pilihan dropdown {value, label}
 */

// Pembantu kecil untuk <select>: tanda pilihan yang sedang aktif.
$selected = static fn ($current, $value): string => (string) $current === (string) $value ? 'selected' : '';
?>
<?= $this->extend('layouts/main') ?>

<?php // Tajuk <h1> & mesej flash (cth ralat had eksport) dipapar oleh layouts/main.php daripada $title & partials/flash. ?>
<?= $this->section('content') ?>
<div class="mb-3">
    <!-- Tab laporan -->
    <ul class="nav nav-pills">
        <?php foreach (['tempahan' => 'RPT-01 Tempahan', 'pas' => 'RPT-02 Pas', 'penggunaan' => 'RPT-03 Penggunaan'] as $key => $label): ?>
            <li class="nav-item">
                <a class="nav-link <?= $key === $report ? 'active' : '' ?>" href="<?= site_url('laporan/' . $key) ?>"><?= esc($label) ?></a>
            </li>
        <?php endforeach ?>
    </ul>
</div>

<!-- ============ BORANG PENAPIS (GET) ============
     method="get": URL boleh ditanda buku/dikongsi; tiada CSRF diperlukan (GET tidak ubah data).
     Nilai diisi semula dari $filters (bukan old()) kerana tiada redirect berlaku. -->
<form method="get" action="<?= current_url() ?>" class="card card-body mb-3">
    <div class="row g-2 align-items-end">

        <?php if ($report === 'penggunaan'): ?>
            <div class="col-sm-3 col-md-2">
                <label for="year" class="form-label">Tahun</label>
                <input type="number" id="year" name="year" class="form-control" min="2020" max="2100"
                       value="<?= esc((string) $filters['year'], 'attr') ?>">
            </div>
            <div class="col-sm-3 col-md-2">
                <label for="month" class="form-label">Bulan</label>
                <select id="month" name="month" class="form-select">
                    <option value="">Setahun</option>
                    <?php foreach (['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'] as $i => $m): ?>
                        <option value="<?= $i + 1 ?>" <?= $selected($filters['month'], $i + 1) ?>><?= esc($m) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php else: ?>
            <div class="col-sm-6 col-md-2">
                <label for="from" class="form-label">Dari tarikh</label>
                <input type="date" id="from" name="from" class="form-control" value="<?= esc((string) $filters['from'], 'attr') ?>">
            </div>
            <div class="col-sm-6 col-md-2">
                <label for="to" class="form-label">Hingga tarikh</label>
                <input type="date" id="to" name="to" class="form-control" value="<?= esc((string) $filters['to'], 'attr') ?>">
            </div>
        <?php endif ?>

        <?php if ($report === 'tempahan'): ?>
            <div class="col-sm-4 col-md-2">
                <label for="zone_id" class="form-label">Zon</label>
                <select id="zone_id" name="zone_id" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['zones'] as $o): ?>
                        <option value="<?= esc((string) $o['value'], 'attr') ?>" <?= $selected($filters['zone_id'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
            <div class="col-sm-4 col-md-2">
                <label for="category" class="form-label">Kategori</label>
                <select id="category" name="category" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['categories'] as $o): ?>
                        <option value="<?= esc($o['value'], 'attr') ?>" <?= $selected($filters['category'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php endif ?>

        <?php if ($report === 'pas'): ?>
            <div class="col-sm-4 col-md-2">
                <label for="department_id" class="form-label">Jabatan</label>
                <select id="department_id" name="department_id" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['departments'] as $o): ?>
                        <option value="<?= esc((string) $o['value'], 'attr') ?>" <?= $selected($filters['department_id'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
            <div class="col-sm-4 col-md-2">
                <label for="pass_type" class="form-label">Jenis pas</label>
                <select id="pass_type" name="pass_type" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['pass_types'] as $o): ?>
                        <option value="<?= esc($o['value'], 'attr') ?>" <?= $selected($filters['pass_type'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php endif ?>

        <?php if ($report !== 'penggunaan'): ?>
            <div class="col-sm-4 col-md-2">
                <label for="status" class="form-label">Status</label>
                <select id="status" name="status" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['statuses'] as $o): ?>
                        <option value="<?= esc($o['value'], 'attr') ?>" <?= $selected($filters['status'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php endif ?>

        <!-- Kekalkan susunan semasa apabila penapis dihantar semula -->
        <input type="hidden" name="sort" value="<?= esc((string) $filters['sort'], 'attr') ?>">
        <input type="hidden" name="dir" value="<?= esc((string) $filters['dir'], 'attr') ?>">

        <div class="col-md-auto d-flex gap-2">
            <button type="submit" class="btn btn-primary"><i class="bi bi-funnel"></i> Tapis</button>
            <a href="<?= current_url() ?>" class="btn btn-outline-secondary">Set semula</a>
        </div>
    </div>
</form>

<?php // JADUAL & PAGINATION — Lab 9.2 langkah 9 menggantikan baris ini. ?>
<?= $this->endSection() ?>
```

**5. Add a menu link** in `app/Views/layouts/main.php` only if the user has the permission (a UI convenience only — the real control is the route filter in step 2). Put it inside `<ul class="navbar-nav me-auto">`, just before its closing `</ul>`:

```php
<?php if (auth()->loggedIn() && auth()->user()->can('laporan.view')): ?>
    <li class="nav-item"><a class="nav-link" href="<?= url_to('laporan.tempahan') ?>">Laporan</a></li>
<?php endif ?>
```

**6. Commit.** `git add -A && git commit -m "RPT: laluan, controller rangka & borang penapis GET"`; PowerShell: run `git add` and `git commit` one at a time

**7. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste:

```text
Plan mode. Do not change any file.
Read @docs/laporan-spec.md and @app/Views/laporan/index.php.
1. For RPT-01..03: does every filter in the spec card have a field in the form, and the other way round?
2. List every user input value printed back in the view. Does it go through esc()
   with the right context ('attr' inside an attribute)?
3. Why must this form be method="get"? Give one effect of changing it to POST.
4. Use the ci4-spark routes tool: do all three report routes have the permission:laporan.view filter?
Answer in a table with file:line. Do not rewrite the code.
```

Look for in the answer: `esc(..., 'attr')` on every `value="…"`, `selected` compared as strings, and the reasons for GET (the URL can be bookmarked; pagination & export carry the same filters).

Verify it yourself: open `/laporan/tempahan?from=%22%3E%3Cb%3Ex` as `penyemak@latihan.test`, then *View Page Source* (`Ctrl+U`). You must see `&quot;&gt;&lt;b&gt;x` in the `value` attribute, not a raw `<b>` tag. Compare the answer to item 4 with `php spark routes` (the first item of Checkpoint 9.1). Record it in `docs/nota-claude.md` (create the file if it does not exist).

### ✅ Checkpoint 9.1
- [ ] `php spark routes | grep laporan` shows 3 routes with the `permission:laporan.view` filter (Quiz S1).
- [ ] Log in as `pemohon1@latihan.test` → `/laporan/tempahan` is **denied** (the Shield filter *redirects*, no data shown). As `penyemak@latihan.test` → allowed (Quiz S1).
- [ ] Choose a status + dates → click **Tapis** (Filter) → the URL contains `?from=...&status=...` and the dropdown **still** shows the choice you made (Quiz S1).
- [ ] Spec cards complete for the 3 reports and checked by the trainer (Quiz S1).
- [ ] Prompting: the filter form review in *Plan* mode is recorded; *View Page Source* shows `?from=` escaped in the `value` attribute (Quiz S1).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Class "App\Controllers\Laporan\ReportController" not found` | The namespace in the file does not match the folder | First line: `namespace App\Controllers\Laporan;` · file in `app/Controllers/Laporan/` |
| Every user (including admin) is denied | Permission misspelt, e.g. `laporan.views` | Check `app/Config/AuthGroups.php` → `$matrix` (SPEC §4) |
| The dropdown goes back to "Semua" (All) after filtering | No `selected` attribute / comparing an int with a string | Compare as strings: `(string) $a === (string) $b` |
| `The action you requested is not allowed` | The form has `method="post"` by mistake | Change it to `get` |

### ⭐ Bonus challenge
- Add the HTML5 `max` attribute to the `from` input (the current `to` value) and `min` to the `to` input (the current `from` value) so the browser blocks a reversed range. Discuss: why does Lab 9.2 `normaliseFilters()` still need to swap the range on the server?

---

## Lab 9.2 — `ReportService`: join, dynamic filters, aggregate, pagination (S2)

### 🎯 Objective
- Write `normaliseFilters()` with a whitelist for dates, enums, ids and sort order.
- Write the RPT-01/RPT-02 builders with `join()` + `when()`.
- Write the RPT-03 aggregate with `selectCount()` + `groupBy()`.
- Show a paginated table that keeps the filters.

### Prerequisites
- Lab 9.1 done.
- The enums `BookingStatus`, `PassStatus`, `PassType`, `SlotCategory` exist with `label()`.

### Steps

**1. Create the file** `app/Services/ReportService.php` with this skeleton:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\PassStatus;
use App\Enums\PassType;
use App\Enums\SlotCategory;
use CodeIgniter\Database\BaseBuilder;
use CodeIgniter\Database\BaseConnection;
use DateTimeImmutable;
use Generator;
use InvalidArgumentException;
use LengthException;

class ReportService
{
    public const REPORTS = ['tempahan', 'pas', 'penggunaan'];

    public const PER_PAGE = 20;

    private BaseConnection $db;

    public function __construct(?BaseConnection $db = null)
    {
        $this->db = $db ?? db_connect();
    }
}
```

Every method in steps 2–8 goes **inside this class, before the final `}`**, unless the step names another place.

**2. Write `normaliseFilters()` first** (whitelist before the query). Target behaviour:

| `$_GET` input | `$filters` result |
|---------------|-------------------|
| `from=2026-06-01` | `'from' => '2026-06-01'` |
| `from=2026-02-31` | `'from' => null` (date does not exist) |
| `from=2026-06-30&to=2026-06-01` | swapped: from 01/06, to 30/06 |
| `status=approved` | `'status' => 'approved'` |
| `status=bogus` | `'status' => null` |
| `status[]=approved` | `'status' => null` (array rejected) |
| `sort=b.id; DROP TABLE users` | `'sort' => 'start_date'` (default) |
| `dir=sideways` | `'dir' => 'desc'` (default) |

First add the sort whitelist, right after `public const PER_PAGE = 20;`:

`app/Services/ReportService.php`

```php
    /**
     * WHITELIST lajur susunan: kunci URL (?sort=) => lajur SQL sebenar.
     * Input pengguna TIDAK PERNAH dihantar terus ke orderBy().
     */
    private const SORTABLE = [
        'tempahan' => [
            'ref_no'     => 'b.ref_no',
            'zone'       => 'z.code',
            'start_date' => 'b.start_date',
            'end_date'   => 'b.end_date',
            'status'     => 'b.status',
        ],
        'pas' => [
            'ref_no'     => 'p.ref_no',
            'department' => 'd.name',
            'pass_type'  => 'p.pass_type',
            'status'     => 'p.status',
            'created_at' => 'p.created_at',
        ],
        // RPT-03 disusun dalam PHP (data aggregate kecil, satu baris per zon).
        'penggunaan' => [
            'zone_code'   => 'zone_code',
            'utilisation' => 'utilisation',
        ],
    ];

    private const DEFAULT_SORT = [
        'tempahan'   => ['start_date', 'desc'],
        'pas'        => ['created_at', 'desc'],
        'penggunaan' => ['zone_code', 'asc'],
    ];
```

Then add `normaliseFilters()`, `toQuery()` and their helpers `assertReport()`, `str()`, `validDate()`:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 1. Penapis: terima $_GET mentah → pulang array bersih (whitelist)
    // ------------------------------------------------------------------

    /**
     * Semua nilai dipulangkan sebagai skalar (string/int/null) supaya boleh
     * dibina semula ke query string untuk pagination & butang eksport.
     *
     * @param array<string, mixed> $input biasanya $this->request->getGet()
     *
     * @return array<string, int|string|null>
     */
    public function normaliseFilters(string $report, array $input): array
    {
        $this->assertReport($report);

        $f = [];

        if ($report === 'penggunaan') {
            $year  = (int) ($this->str($input, 'year') ?? date('Y'));
            $month = (int) ($this->str($input, 'month') ?? 0);

            $f['year']  = ($year >= 2020 && $year <= 2100) ? $year : (int) date('Y');
            $f['month'] = ($month >= 1 && $month <= 12) ? $month : null; // null = setahun
        } else {
            $f['from'] = $this->validDate($this->str($input, 'from'));
            $f['to']   = $this->validDate($this->str($input, 'to'));

            // Pengguna terbalikkan julat? Tukar semula, jangan pulang kosong secara senyap.
            if ($f['from'] !== null && $f['to'] !== null && $f['from'] > $f['to']) {
                [$f['from'], $f['to']] = [$f['to'], $f['from']];
            }
        }

        if ($report === 'tempahan') {
            $zoneId        = (int) ($this->str($input, 'zone_id') ?? 0);
            $f['zone_id']  = $zoneId > 0 ? $zoneId : null;
            $f['category'] = SlotCategory::tryFrom($this->str($input, 'category') ?? '')?->value;
            $f['status']   = BookingStatus::tryFrom($this->str($input, 'status') ?? '')?->value;
        }

        if ($report === 'pas') {
            $deptId             = (int) ($this->str($input, 'department_id') ?? 0);
            $f['department_id'] = $deptId > 0 ? $deptId : null;
            $f['pass_type']     = PassType::tryFrom($this->str($input, 'pass_type') ?? '')?->value;
            $f['status']        = PassStatus::tryFrom($this->str($input, 'status') ?? '')?->value;
        }

        // Susunan: hanya kunci dalam whitelist diterima.
        [$defaultSort, $defaultDir] = self::DEFAULT_SORT[$report];
        $sort     = $this->str($input, 'sort');
        $dir      = strtolower($this->str($input, 'dir') ?? '');
        $f['sort'] = array_key_exists((string) $sort, self::SORTABLE[$report]) ? $sort : $defaultSort;
        $f['dir']  = in_array($dir, ['asc', 'desc'], true) ? $dir : $defaultDir;

        return $f;
    }

    /**
     * Penapis bersih → query string (buang nilai kosong). Guna untuk pautan eksport/susun.
     *
     * @param array<string, int|string|null> $filters
     *
     * @return array<string, int|string>
     */
    public function toQuery(array $filters): array
    {
        return array_filter($filters, static fn ($v): bool => $v !== null && $v !== '');
    }

    // ------------------------------------------------------------------
    // Pembantu
    // ------------------------------------------------------------------

    private function assertReport(string $report): void
    {
        if (! in_array($report, self::REPORTS, true)) {
            throw new InvalidArgumentException("Laporan tidak dikenali: {$report}");
        }
    }

    /** Ambil nilai string yang dipangkas; tolak array (cth ?status[]=x) dan string kosong. */
    private function str(array $input, string $key): ?string
    {
        $v = $input[$key] ?? null;

        if (! is_string($v) && ! is_int($v)) {
            return null;
        }

        $v = trim((string) $v);

        return $v === '' ? null : $v;
    }

    /** Terima Y-m-d yang BENAR-BENAR sah sahaja (tolak 2026-02-31). */
    private function validDate(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $d = DateTimeImmutable::createFromFormat('!Y-m-d', $value);

        return ($d !== false && $d->format('Y-m-d') === $value) ? $value : null;
    }
```

Quick check: in the Lab 9.1 skeleton controller, **temporarily** replace the `bookings()` method with the version below. Open `/laporan/tempahan?…` in the browser with the inputs from the table above, then **restore** the original `bookings()` (without `dd()`) before you commit.

`app/Controllers/Laporan/ReportController.php`

```php
public function bookings(): string
{
    $filters = (new \App\Services\ReportService())->normaliseFilters('tempahan', $this->request->getGet() ?? []);
    dd($filters);   // SEMENTARA — buang baris ini dan baris di atas sebelum commit

    return $this->skeleton('tempahan', 'RPT-01 Senarai Tempahan TLK');
}
```

**3. Write `bookingsBuilder()` (RPT-01)** — 4 joins + 5 `when()`. Note that the date range uses the overlap condition of BR-TLK-01 (TLK = Special Vehicle Parking — *Tempat Letak Kenderaan Khas*):

`builder()` is the single SQL entry point for RPT-01/02 (Lab 9.4 runs `EXPLAIN` on it). Add:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 5. Builder — SATU tempat untuk join + penapis dinamik
    // ------------------------------------------------------------------

    /** Dibuat public supaya S4 boleh jalankan EXPLAIN pada SQL yang sama. */
    public function builder(string $report, array $f): BaseBuilder
    {
        return match ($report) {
            'tempahan' => $this->bookingsBuilder($f),
            'pas'      => $this->passesBuilder($f),
            default    => throw new InvalidArgumentException("Laporan {$report} tiada builder SQL."),
        };
    }

    /** RPT-01 — Senarai tempahan TLK */
    private function bookingsBuilder(array $f): BaseBuilder
    {
        return $this->db->table('slot_bookings b')
            ->select('b.id, b.ref_no, b.start_date, b.end_date, b.status, b.created_at')
            ->select('u.full_name, v.plate_no, s.slot_no, s.category, z.code AS zone_code, z.name AS zone_name')
            ->join('users u', 'u.id = b.user_id')
            ->join('vehicles v', 'v.id = b.vehicle_id')
            ->join('parking_slots s', 's.id = b.slot_id') // termasuk slot soft-deleted: sejarah kekal
            ->join('parking_zones z', 'z.id = s.zone_id')
            // Julat tarikh = tempahan yang AKTIF dalam julat (syarat bertindih BR-TLK-01):
            //   start_date <= :to AND end_date >= :from
            ->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where('b.start_date <=', $to))
            ->when($f['from'] ?? null, static fn (BaseBuilder $q, string $from) => $q->where('b.end_date >=', $from))
            ->when($f['zone_id'] ?? null, static fn (BaseBuilder $q, int $id) => $q->where('s.zone_id', $id))
            ->when($f['category'] ?? null, static fn (BaseBuilder $q, string $c) => $q->where('s.category', $c))
            ->when($f['status'] ?? null, static fn (BaseBuilder $q, string $s) => $q->where('b.status', $s));
    }
```

**4. Write `passesBuilder()` (RPT-02)** — `departments` must be a **LEFT** join; the `created_at` range is half-open:

Add:

`app/Services/ReportService.php`

```php
    /** RPT-02 — Senarai permohonan Pas */
    private function passesBuilder(array $f): BaseBuilder
    {
        return $this->db->table('pass_applications p')
            ->select('p.id, p.ref_no, p.pass_type, p.valid_from, p.valid_until, p.status, p.created_at, p.approved_at')
            ->select('u.full_name, u.staff_no, d.code AS dept_code, d.name AS dept_name')
            ->join('users u', 'u.id = p.user_id')
            ->join('departments d', 'd.id = u.department_id', 'left') // department_id boleh NULL
            // created_at ialah DATETIME → julat SEPARUH-TERBUKA [from 00:00, to+1 hari 00:00)
            // supaya rekod pada hari terakhir (cth 30/09 14:00) TIDAK tercicir.
            ->when($f['from'] ?? null, static fn (BaseBuilder $q, string $from) => $q->where('p.created_at >=', $from . ' 00:00:00'))
            ->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where(
                'p.created_at <',
                (new DateTimeImmutable($to))->modify('+1 day')->format('Y-m-d 00:00:00'),
            ))
            ->when($f['department_id'] ?? null, static fn (BaseBuilder $q, int $id) => $q->where('u.department_id', $id))
            ->when($f['pass_type'] ?? null, static fn (BaseBuilder $q, string $t) => $q->where('p.pass_type', $t))
            ->when($f['status'] ?? null, static fn (BaseBuilder $q, string $s) => $q->where('p.status', $s));
    }
```

**5. Write `applySort()` with a whitelist + `id` as the second sort key:**

The `SORTABLE` and `DEFAULT_SORT` whitelists were added in step 2. Add `applySort()`:

`app/Services/ReportService.php`

```php
    private function applySort(BaseBuilder $builder, string $report, array $f): BaseBuilder
    {
        $column = self::SORTABLE[$report][$f['sort']] ?? self::SORTABLE[$report][self::DEFAULT_SORT[$report][0]];
        $dir    = $f['dir'] === 'asc' ? 'ASC' : 'DESC';
        $idCol  = $report === 'tempahan' ? 'b.id' : 'p.id';

        // Susunan kedua (id) → susunan STABIL; tanpa ini rekod boleh "melompat" antara halaman.
        return $builder->orderBy($column, $dir)->orderBy($idCol, $dir);
    }
```

**6. Write `paginate()`:**

Add `paginate()`, `formatRow()` (enum values → Malay labels, dates → `d/m/Y`) and `dmy()`. The `penggunaan` branch calls `usageByZone()` from step 7.

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 3. Paparan HTML berpagination
    // ------------------------------------------------------------------

    /**
     * @param array<string, int|string|null> $filters hasil normaliseFilters()
     *
     * @return array{rows: list<array<string, mixed>>, total: int, page: int, perPage: int}
     */
    public function paginate(string $report, array $filters, int $page, int $perPage = self::PER_PAGE): array
    {
        $this->assertReport($report);
        $page = max(1, $page);

        if ($report === 'penggunaan') {
            // Aggregate kecil (satu baris per zon) — potong dalam PHP.
            $all = $this->usageByZone($filters);

            return [
                'rows'    => array_slice($all, ($page - 1) * $perPage, $perPage),
                'total'   => count($all),
                'page'    => $page,
                'perPage' => $perPage,
            ];
        }

        $builder = $this->builder($report, $filters);

        // countAllResults(false) = kira TANPA reset builder; join/where kekal untuk get().
        $total = $builder->countAllResults(false);

        $rows = $this->applySort($builder, $report, $filters)
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()
            ->getResultArray();

        return [
            'rows'    => array_map(fn (array $r): array => $this->formatRow($report, $r), $rows),
            'total'   => $total,
            'page'    => $page,
            'perPage' => $perPage,
        ];
    }

    // ------------------------------------------------------------------
    // 7. Format baris — label BM daripada enum, tarikh d/m/Y
    // ------------------------------------------------------------------

    /** @return array<string, mixed> kunci sepadan columns($report) */
    private function formatRow(string $report, array $r): array
    {
        return match ($report) {
            'tempahan' => [
                'ref_no'     => $r['ref_no'],
                'full_name'  => $r['full_name'],
                'plate_no'   => $r['plate_no'],
                'zone'       => $r['zone_code'],
                'slot_no'    => $r['slot_no'],
                'category'   => SlotCategory::tryFrom((string) $r['category'])?->label() ?? $r['category'],
                'start_date' => $this->dmy($r['start_date']),
                'end_date'   => $this->dmy($r['end_date']),
                'status'     => BookingStatus::tryFrom((string) $r['status'])?->label() ?? $r['status'],
            ],
            'pas' => [
                'ref_no'      => $r['ref_no'],
                'full_name'   => $r['full_name'],
                'staff_no'    => $r['staff_no'] ?? '-',
                'department'  => $r['dept_name'] ?? '-',
                'pass_type'   => PassType::tryFrom((string) $r['pass_type'])?->label() ?? $r['pass_type'],
                'valid_from'  => $this->dmy($r['valid_from']),
                'valid_until' => $this->dmy($r['valid_until']),
                'status'      => PassStatus::tryFrom((string) $r['status'])?->label() ?? $r['status'],
                'created_at'  => $this->dmy($r['created_at'], withTime: true),
            ],
            default => $r,
        };
    }

    private function dmy(?string $value, bool $withTime = false): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        return (new DateTimeImmutable($value))->format($withTime ? 'd/m/Y H:i' : 'd/m/Y');
    }
```

**7. Write `usageByZone()` (RPT-03)** — two aggregate queries + merge in PHP. Check the formula against the example in README §1.2 (Zone A June = 25.0 %). Add `usageByZone()` and `usagePeriod()`:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 6. RPT-03 — Penggunaan slot mengikut zon (aggregate)
    // ------------------------------------------------------------------

    /**
     * Penggunaan (%) = hari-slot ditempah ÷ (bil. slot aktif × bil. hari dalam tempoh) × 100
     *
     * @return list<array<string, int|float|string>>
     */
    public function usageByZone(array $f): array
    {
        [$start, $end] = $this->usagePeriod($f);
        $days          = (new DateTimeImmutable($start))->diff(new DateTimeImmutable($end))->days + 1;

        // (a) Bil. slot aktif setiap zon. LEFT JOIN → zon tanpa slot tetap muncul (0).
        //     escape=false kerana syarat ON mengandungi literal (1, IS NULL) — tiada input pengguna di sini.
        $zones = $this->db->table('parking_zones z')
            ->select('z.id, z.code, z.name')
            ->selectCount('s.id', 'total_slots')
            ->join('parking_slots s', 's.zone_id = z.id AND s.is_active = 1 AND s.deleted_at IS NULL', 'left', false)
            ->groupBy(['z.id', 'z.code', 'z.name'])
            ->get()
            ->getResultArray();

        // (b) Tempahan yang digunakan (approved/expired) & bertindih dengan tempoh.
        //     Hari bertindih = DATEDIFF(LEAST(end, :end), GREATEST(start, :start)) + 1
        //     $start/$end dijana oleh kita (bukan teks pengguna) DAN di-escape().
        $startQ = $this->db->escape($start);
        $endQ   = $this->db->escape($end);

        $usage = $this->db->table('slot_bookings b')
            ->select('s.zone_id')
            ->selectCount('b.id', 'total_bookings')
            ->select("SUM(DATEDIFF(LEAST(b.end_date, {$endQ}), GREATEST(b.start_date, {$startQ})) + 1) AS booked_days", false)
            // Sama dengan penyebut (a): hanya slot aktif & tidak dipadam → penggunaan tidak melebihi 100 %
            ->join('parking_slots s', 's.id = b.slot_id AND s.is_active = 1 AND s.deleted_at IS NULL', 'inner', false)
            ->whereIn('b.status', [BookingStatus::Approved->value, BookingStatus::Expired->value])
            ->where('b.start_date <=', $end)
            ->where('b.end_date >=', $start)
            ->groupBy('s.zone_id')
            ->get()
            ->getResultArray();

        $byZone = array_column($usage, null, 'zone_id');
        $rows   = [];

        foreach ($zones as $z) {
            $slots    = (int) $z['total_slots'];
            $booked   = (int) ($byZone[$z['id']]['booked_days'] ?? 0);
            $capacity = $slots * $days;

            $rows[] = [
                'zone_code'      => $z['code'],
                'zone_name'      => $z['name'],
                'total_slots'    => $slots,
                'total_bookings' => (int) ($byZone[$z['id']]['total_bookings'] ?? 0),
                'booked_days'    => $booked,
                'capacity_days'  => $capacity,
                'utilisation'    => $capacity > 0 ? round($booked / $capacity * 100, 1) : 0.0,
            ];
        }

        $key = $f['sort'] ?? 'zone_code';
        $dir = ($f['dir'] ?? 'asc') === 'desc' ? -1 : 1;
        usort($rows, static fn (array $a, array $b): int => ($a[$key] <=> $b[$key]) * $dir);

        return $rows;
    }

    /** @return array{0: string, 1: string} [Y-m-d mula, Y-m-d tamat] */
    public function usagePeriod(array $f): array
    {
        $year = (int) ($f['year'] ?? date('Y'));

        if (! empty($f['month'])) {
            $first = new DateTimeImmutable(sprintf('%04d-%02d-01', $year, (int) $f['month']));

            return [$first->format('Y-m-d'), $first->format('Y-m-t')];
        }

        return ["{$year}-01-01", "{$year}-12-31"];
    }
```

**8. Register the service & complete the controller** (thin!). The controller needs each report's title, columns and dropdown options. Add these metadata methods to `ReportService`:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 2. Metadata laporan: tajuk, lajur, pilihan dropdown
    // ------------------------------------------------------------------

    public function title(string $report): string
    {
        $this->assertReport($report);

        return match ($report) {
            'tempahan'   => 'RPT-01 Senarai Tempahan TLK',
            'pas'        => 'RPT-02 Senarai Permohonan Pas',
            'penggunaan' => 'RPT-03 Penggunaan Slot Mengikut Zon',
        };
    }

    /**
     * Lajur yang SAMA untuk HTML, PDF dan Excel. Kunci = kunci baris selepas formatRow().
     *
     * @return array<string, string>
     */
    public function columns(string $report): array
    {
        $this->assertReport($report);

        return match ($report) {
            'tempahan' => [
                'ref_no'     => 'No. Rujukan',
                'full_name'  => 'Pemohon',
                'plate_no'   => 'No. Plat',
                'zone'       => 'Zon',
                'slot_no'    => 'Slot',
                'category'   => 'Kategori',
                'start_date' => 'Tarikh Mula',
                'end_date'   => 'Tarikh Tamat',
                'status'     => 'Status',
            ],
            'pas' => [
                'ref_no'      => 'No. Rujukan',
                'full_name'   => 'Pemohon',
                'staff_no'    => 'No. Pekerja',
                'department'  => 'Jabatan',
                'pass_type'   => 'Jenis Pas',
                'valid_from'  => 'Sah Dari',
                'valid_until' => 'Sah Hingga',
                'status'      => 'Status',
                'created_at'  => 'Tarikh Mohon',
            ],
            'penggunaan' => [
                'zone_code'      => 'Kod Zon',
                'zone_name'      => 'Nama Zon',
                'total_slots'    => 'Bil. Slot Aktif',
                'total_bookings' => 'Bil. Tempahan',
                'booked_days'    => 'Hari-Slot Ditempah',
                'capacity_days'  => 'Kapasiti (Hari-Slot)',
                'utilisation'    => 'Penggunaan (%)',
            ],
        };
    }

    /** @return list<string> kunci lajur yang boleh disusun (untuk pautan pengepala jadual) */
    public function sortableColumns(string $report): array
    {
        $this->assertReport($report);

        return array_keys(self::SORTABLE[$report]);
    }

    /**
     * Pilihan dropdown borang penapis.
     *
     * @return array<string, list<array{value: int|string, label: string}>>
     */
    public function filterOptions(string $report): array
    {
        $this->assertReport($report);

        $enumOptions = static fn (array $cases): array => array_map(
            static fn ($c): array => ['value' => $c->value, 'label' => $c->label()],
            $cases,
        );

        return match ($report) {
            'tempahan' => [
                'zones' => array_map(
                    static fn (array $z): array => ['value' => (int) $z['id'], 'label' => $z['code'] . ' — ' . $z['name']],
                    $this->db->table('parking_zones')->select('id, code, name')->orderBy('code')->get()->getResultArray(),
                ),
                'categories' => $enumOptions(SlotCategory::cases()),
                'statuses'   => $enumOptions(BookingStatus::cases()),
            ],
            'pas' => [
                'departments' => array_map(
                    static fn (array $d): array => ['value' => (int) $d['id'], 'label' => $d['code'] . ' — ' . $d['name']],
                    $this->db->table('departments')->select('id, code, name')->orderBy('name')->get()->getResultArray(),
                ),
                'pass_types' => $enumOptions(PassType::cases()),
                'statuses'   => $enumOptions(PassStatus::cases()),
            ],
            'penggunaan' => [],
        };
    }
```

In `app/Config/Services.php`, inside the `Services` class (same pattern as `bookingService`, Day 6):

`app/Config/Services.php`

```php
public static function reportService(bool $getShared = true): \App\Services\ReportService
{
    if ($getShared) {
        return static::getSharedInstance('reportService');
    }

    return new \App\Services\ReportService();
}
```

Replace the **whole** Lab 9.1 skeleton controller with this thin controller: `$this->reports = service('reportService');` in `__construct()`, and one private method `handle($report)` for all three reports:

`app/Controllers/Laporan/ReportController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Laporan;

use App\Controllers\BaseController;
use App\Services\ReportService;
use CodeIgniter\HTTP\ResponseInterface;

class ReportController extends BaseController
{
    private ReportService $reports;

    public function __construct()
    {
        $this->reports = service('reportService');
    }

    /** GET /laporan/tempahan — RPT-01 */
    public function bookings(): string|ResponseInterface
    {
        return $this->handle('tempahan');
    }

    /** GET /laporan/pas — RPT-02 */
    public function passes(): string|ResponseInterface
    {
        return $this->handle('pas');
    }

    /** GET /laporan/penggunaan — RPT-03 */
    public function usage(): string|ResponseInterface
    {
        return $this->handle('penggunaan');
    }

    /** Satu aliran untuk ketiga-tiga laporan: penapis → HTML berpagination. (Eksport: Lab 9.3.) */
    private function handle(string $report): string|ResponseInterface
    {
        $filters = $this->reports->normaliseFilters($report, $this->request->getGet() ?? []);

        $page   = (int) ($this->request->getGet('page') ?? 1);
        $result = $this->reports->paginate($report, $filters, $page);

        return view('laporan/index', [
            'title'    => $this->reports->title($report),
            'report'   => $report,
            'filters'  => $filters,
            'query'    => $this->reports->toQuery($filters),
            'columns'  => $this->reports->columns($report),
            'sortable' => $this->reports->sortableColumns($report),
            'options'  => $this->reports->filterOptions($report),
            'result'   => $result,
            'pager'    => service('pager'),
        ]);
    }
}
```

**9. Table + pagination in the view:**

In `app/Views/laporan/index.php`, replace the line `<?php // JADUAL & PAGINATION — Lab 9.2 langkah 9 menggantikan baris ini. ?>` with this block (record count, export buttons built from `$query`, table with sortable headers, pager):

`app/Views/laporan/index.php`

```php
<!-- ============ RINGKASAN + EKSPORT ============
     Pautan eksport dibina dari $query (penapis BERSIH) + export=... → data eksport = data skrin. -->
<div class="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
    <div class="text-muted">
        Jumlah rekod: <strong><?= number_format($result['total']) ?></strong>
    </div>
    <div class="btn-group">
        <a class="btn btn-outline-danger btn-sm"
           href="<?= current_url() . '?' . esc(http_build_query($query + ['export' => 'pdf']), 'attr') ?>">
            <i class="bi bi-filetype-pdf"></i> Eksport PDF
        </a>
        <a class="btn btn-outline-success btn-sm"
           href="<?= current_url() . '?' . esc(http_build_query($query + ['export' => 'xlsx']), 'attr') ?>">
            <i class="bi bi-file-earmark-excel"></i> Eksport Excel
        </a>
    </div>
</div>

<!-- ============ JADUAL ============ -->
<div class="table-responsive">
    <table class="table table-sm table-striped table-hover align-middle">
        <thead class="table-light">
        <tr>
            <th scope="col">#</th>
            <?php foreach ($columns as $key => $label): ?>
                <th scope="col">
                    <?php if (in_array($key, $sortable, true)): ?>
                        <?php
                        // Klik lajur yang sama → terbalikkan arah; lajur lain → mula dengan asc
                        $isCurrent = $filters['sort'] === $key;
                        $nextDir   = $isCurrent && $filters['dir'] === 'asc' ? 'desc' : 'asc';
                        $href      = current_url() . '?' . http_build_query(['sort' => $key, 'dir' => $nextDir] + $query);
                        ?>
                        <a href="<?= esc($href, 'attr') ?>" class="link-dark text-decoration-none">
                            <?= esc($label) ?>
                            <?php if ($isCurrent): ?>
                                <i class="bi bi-caret-<?= $filters['dir'] === 'asc' ? 'up' : 'down' ?>-fill"></i>
                            <?php endif ?>
                        </a>
                    <?php else: ?>
                        <?= esc($label) ?>
                    <?php endif ?>
                </th>
            <?php endforeach ?>
        </tr>
        </thead>
        <tbody>
        <?php if ($result['rows'] === []): ?>
            <tr>
                <td colspan="<?= count($columns) + 1 ?>" class="text-center text-muted py-4">
                    Tiada rekod sepadan dengan penapis.
                </td>
            </tr>
        <?php endif ?>

        <?php foreach ($result['rows'] as $i => $row): ?>
            <tr>
                <td><?= ($result['page'] - 1) * $result['perPage'] + $i + 1 ?></td>
                <?php foreach (array_keys($columns) as $key): ?>
                    <td><?= esc((string) ($row[$key] ?? '')) ?></td>
                <?php endforeach ?>
            </tr>
        <?php endforeach ?>
        </tbody>
    </table>
</div>

<!-- Pager CI4 mengekalkan query string semasa ($_GET) secara automatik: ?status=approved&page=2 -->
<?= $pager->makeLinks($result['page'], $result['perPage'], $result['total']) ?>
```

**10. Commit.** `git add app/ && git commit -m "RPT: ReportService (join, when, groupBy, selectCount) + pagination"`; PowerShell: run `git add` and `git commit` one at a time

**11. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (Query Builder binding review + the `db_table` MCP tool):

```text
Plan mode. Do not change any file.
1. Read @app/Services/ReportService.php. For every value from $filters that reaches a query
   (where, when, orderBy, limit), give the file:line and classify it: bound/escaped by Query Builder,
   checked against a whitelist, or concatenated straight into SQL.
2. Does applySort() reject columns and directions that are not in the whitelist? Give example input.
3. Use the ci4-spark db_table tool for slot_bookings and pass_applications. List the existing indexes,
   and for each RPT-01/RPT-02 filter say whether an index can be used.
Tables only. Do not rewrite the code.
```

Look for in the answer: `where()`/`when()` values are bound by Query Builder; `orderBy()` takes a column name, so the column **must** come from the `applySort()` whitelist; no `$filters` value is concatenated straight into an SQL string.

Verify it yourself: open `/laporan/tempahan?sort=nonsense&dir=sideways`, then Debug Toolbar → **Database** tab: `ORDER BY` uses the default column. Run `php spark db:table slot_bookings --metadata` and compare the index list with the `db_table` answer. Keep the index list for Lab 9.4 (EXPLAIN). Record it in `docs/nota-claude.md`.

### ✅ Checkpoint 9.2
- [ ] `/laporan/tempahan?status=approved` → "Jumlah rekod" (total records) is **the same** as the SQL result (Quiz S2):
  ```sql
  SELECT COUNT(*) FROM slot_bookings WHERE status = 'approved';
  ```
- [ ] Filter by status + zone → click page 2 → the URL still contains `status=...&zone_id=...&page=2` (Quiz S2).
- [ ] `/laporan/pas?to=<hari ini>` (`<hari ini>` = today's date) shows the applications you submitted **today** (proof of the half-open range) (Quiz S2).
- [ ] `/laporan/tempahan?sort=nonsense` does not error — it falls back to the default sort order (Quiz S2).
- [ ] `/laporan/penggunaan?year=2026&month=6` shows every zone (including zones without bookings = 0.0 %) (Quiz S2).
- [ ] Thin controller: each method only reads filters → calls `ReportService` → view/export (no queries, joins or calculations); no `$this->db` in the controller (Quiz S2).
- [ ] Prompting: every `$filters` value in `ReportService` is classified (bind/whitelist), and the `db_table` index list matches `php spark db:table --metadata`; recorded in `docs/nota-claude.md` (Quiz S2).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error 1055: Expression #2 of SELECT list is not in GROUP BY clause ... only_full_group_by` | A non-aggregate column is missing from `groupBy()` | `->groupBy(['z.id', 'z.code', 'z.name'])` |
| The RPT-02 total is lower than `COUNT(*)` | An INNER join to `departments` drops users without a department | `join('departments d', '...', 'left')` |
| A zone with no slots shows "1 slot aktif" (1 active slot) | `COUNT(*)` after a LEFT JOIN | `selectCount('s.id', 'total_slots')` |
| `Unknown column 'b.status' in 'where clause'` after `countAllResults()` | `countAllResults()` (without `false`) **resets** the builder | `countAllResults(false)` |
| `Table 'db_parking_slots' doesn't exist` | `DBPrefix` is set; a join with `escape=false` does not get the prefix | Make sure `database.default.DBPrefix =` is empty (as on Day 4) |
| The same record appears on page 1 and page 2 | Unstable sort order | Add `->orderBy('b.id', $dir)` |
| `TypeError: ... must be of type string, array given` | `?status[]=x` passed straight to `tryFrom()` | Use the `str()` helper, which rejects arrays |
| Pagination links without Bootstrap styling | CI4's `default_full` template has no `page-item` class | Accept it for now, or the ⭐ challenge below |

### ⭐ Bonus challenge
- Create a Bootstrap pager template `app/Views/pager/bootstrap.php` (copy `system/Pager/Views/default_full.php`, add `page-item`/`page-link`), register it in `app/Config/Pager.php` → `$templates['bootstrap']`, and use `makeLinks(..., 'bootstrap')`.
- Add an **Average days per booking** column (booked slot-days ÷ number of bookings) to RPT-03: update only `usageByZone()` and `columns('penggunaan')`. The screen table, PDF and Excel follow automatically — why?

---

## Lab 9.3 — PDF (Dompdf) & Excel (PhpSpreadsheet) export (S3)

### 🎯 Objective
- Install Dompdf & PhpSpreadsheet through Composer.
- Generate an A4 landscape PDF with a header, a footer "Dijana pada … oleh …" (Generated on … by …) and page numbers.
- Generate an `.xlsx` with a bold header, automatic widths and a frozen row.
- Prove that HTML, PDF and Excel show the same number of records.

### Prerequisites
- Lab 9.2 done; the export buttons in the view are already built from `$query`.
- PHP extensions: `ext-dom`, `ext-mbstring`, `ext-gd`, `ext-zip`, `ext-xml` (`php -m` to check).

### Steps

**1. Install the libraries.**

```bash tab="Git Bash / macOS / Linux"
composer require dompdf/dompdf phpoffice/phpspreadsheet
git add composer.json composer.lock && git commit -m "RPT: tambah dompdf & phpspreadsheet"
```

```powershell tab="PowerShell"
composer require dompdf/dompdf phpoffice/phpspreadsheet
git add composer.json composer.lock
git commit -m "RPT: tambah dompdf & phpspreadsheet"
```

**2. Create `app/Services/ExportService.php`** and register `exportService()` in `app/Config/Services.php` (same pattern as `reportService()`). Two public methods, `pdf()` and `xlsx()`:

`app/Services/ExportService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportService
{
    /**
     * @param array<string, string>            $columns
     * @param iterable<array<string, mixed>>   $rows
     * @param array{filters: string, user: string, generated_at: string} $meta
     */
    public function pdf(string $title, array $columns, iterable $rows, array $meta): string
    {
        // 1) HTML dijana oleh view biasa CI4 — esc() tetap digunakan di dalam view.
        $html = view('laporan/pdf', [
            'title'   => $title,
            'columns' => $columns,
            'rows'    => $rows,
            'meta'    => $meta,
        ]);

        // 2) Pilihan keselamatan & fon
        $options = new Options();
        $options->setDefaultFont('DejaVu Sans');       // fon Unicode terbina dalam Dompdf (UTF-8 selamat)
        $options->setIsRemoteEnabled(false);          // JANGAN muat URL luar (SSRF / lambat)
        $options->setIsPhpEnabled(false);             // jangan laksana <script type="text/php">
        $options->setTempDir(WRITEPATH . 'cache');    // folder boleh tulis
        $options->setChroot([FCPATH]);                // fail tempatan (cth logo) hanya dari public/

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'landscape');         // laporan berlajur banyak → landskap
        $dompdf->render();

        // 3) Nombor muka surat — hanya diketahui SELEPAS render(), jadi ditulis pada canvas.
        //    A4 landskap = 841.89 × 595.28 pt. Koordinat (x, y) dari bucu kiri atas.
        $canvas = $dompdf->getCanvas();
        $font   = $dompdf->getFontMetrics()->getFont('DejaVu Sans');
        $canvas->page_text(760, 572, 'Muka {PAGE_NUM} / {PAGE_COUNT}', $font, 8, [0.3, 0.3, 0.3]);

        return $dompdf->output();
    }

    /**
     * @param array<string, string>            $columns
     * @param iterable<array<string, mixed>>   $rows
     * @param array{filters: string, user: string, generated_at: string} $meta
     */
    public function xlsx(string $title, array $columns, iterable $rows, array $meta): string
    {
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getProperties()
            ->setCreator($meta['user'])
            ->setTitle($title);

        $sheet = $spreadsheet->getActiveSheet();
        // Nama sheet: maks 31 aksara, tiada : \ / ? * [ ]
        $sheet->setTitle(mb_substr(preg_replace('/[:\\\\\/?*\[\]]/', '', $title) ?? 'Laporan', 0, 31));

        $colCount = count($columns);
        $lastCol  = Coordinate::stringFromColumnIndex($colCount);

        // Baris 1–3: tajuk & metadata (jejak audit: siapa & bila)
        $sheet->setCellValue('A1', $title);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->setCellValue('A2', 'Penapis: ' . $meta['filters']);
        $sheet->setCellValue('A3', 'Dijana pada ' . $meta['generated_at'] . ' oleh ' . $meta['user']);

        // Baris 5: pengepala lajur — tebal + latar
        $headerRow = 5;
        $sheet->fromArray(array_values($columns), null, "A{$headerRow}");
        $headerStyle = $sheet->getStyle("A{$headerRow}:{$lastCol}{$headerRow}");
        $headerStyle->getFont()->setBold(true);
        $headerStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DDEBF7');

        // Baris data. Nombor kekal nombor (boleh dijumlah dalam Excel);
        // teks ditulis EKSPLISIT sebagai string supaya "001234" tidak jadi 1234
        // dan teks bermula "=" tidak dianggap formula (formula injection).
        $r = $headerRow + 1;
        foreach ($rows as $row) {
            $c = 1;
            foreach (array_keys($columns) as $key) {
                $value = $row[$key] ?? '';
                $coord = Coordinate::stringFromColumnIndex($c) . $r;

                if (is_int($value) || is_float($value)) {
                    $sheet->setCellValue($coord, $value);
                } else {
                    $sheet->setCellValueExplicit($coord, (string) $value, DataType::TYPE_STRING);
                }
                $c++;
            }
            $r++;
        }
        $lastRow = max($headerRow, $r - 1);

        // Lebar lajur automatik
        for ($i = 1; $i <= $colCount; $i++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($i))->setAutoSize(true);
        }

        // Beku pengepala: sel kiri-atas kawasan boleh skrol = baris selepas pengepala
        $sheet->freezePane('A' . ($headerRow + 1));
        $sheet->setAutoFilter("A{$headerRow}:{$lastCol}{$lastRow}");

        // Tulis ke memori (bukan fail sementara) dan pulangkan string binari
        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $binary = (string) ob_get_clean();

        // Bebaskan memori — objek Spreadsheet mempunyai rujukan kitaran
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet, $writer);

        return $binary;
    }
}
```

`$meta = ['filters' => 'ringkasan penapis', 'user' => 'nama pengguna', 'generated_at' => 'd/m/Y H:i']` (filter summary, user name, generation time). Both return a **binary string**; the controller sends the response.

In `app/Config/Services.php`, add after `reportService()`:

`app/Config/Services.php`

```php
public static function exportService(bool $getShared = true): \App\Services\ExportService
{
    if ($getShared) {
        return static::getSharedInstance('exportService');
    }

    return new \App\Services\ExportService();
}
```

**3. Create the PDF view** `app/Views/laporan/pdf.php` — plain HTML, **without** the Bootstrap layout:

`@page` leaves margins for the `position: fixed` `header`/`footer` (repeated on every page), `thead { display: table-header-group; }` repeats the table header, and the `DejaVu Sans` font renders Unicode characters.

`app/Views/laporan/pdf.php`

```php
<?php

/**
 * app/Views/laporan/pdf.php — Hari 9 S3
 * HTML ringkas KHUSUS untuk Dompdf (bukan layout Bootstrap):
 *  - Dompdf menyokong CSS 2.1 + sebahagian CSS3 → TIADA flexbox/grid; guna jadual & position:fixed.
 *  - Elemen position:fixed diulang pada SETIAP muka surat → pengepala & pengaki.
 *  - <thead> diulang secara automatik apabila jadual merentas muka surat.
 *  - Nombor muka surat ditambah oleh ExportService::pdf() melalui $canvas->page_text().
 *
 * @var string                          $title
 * @var array<string, string>           $columns
 * @var iterable<array<string, mixed>>  $rows
 * @var array{filters: string, user: string, generated_at: string} $meta
 */
?>
<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <title><?= esc($title) ?></title>
    <style>
        /* Margin muka surat memberi ruang untuk pengepala (atas) & pengaki (bawah) */
        @page { margin: 85px 28px 50px 28px; }

        body { font-family: "DejaVu Sans", sans-serif; font-size: 8.5pt; color: #222; }

        header { position: fixed; top: -70px; left: 0; right: 0; height: 60px;
                 border-bottom: 1px solid #999; }
        header .agency { font-size: 8pt; color: #555; }
        header h1 { font-size: 13pt; margin: 2px 0; }
        header .filters { font-size: 8pt; color: #555; }

        footer { position: fixed; bottom: -35px; left: 0; right: 0; height: 20px;
                 border-top: 1px solid #999; font-size: 7.5pt; color: #555; padding-top: 3px; }

        table { width: 100%; border-collapse: collapse; }
        thead { display: table-header-group; }          /* ulang pengepala setiap muka */
        tr { page-break-inside: avoid; }                /* jangan pecah satu baris */
        th { background: #DDEBF7; text-align: left; }
        th, td { border: 1px solid #bbb; padding: 3px 4px; vertical-align: top; }
        td.num { text-align: right; }
        .empty { text-align: center; color: #777; padding: 20px; }
    </style>
</head>
<body>

<header>
    <div class="agency">Sistem TLK &amp; Pas — Latihan CI-KKM-10 (DATA SINTETIK)</div>
    <h1><?= esc($title) ?></h1>
    <div class="filters">Penapis: <?= esc($meta['filters']) ?></div>
</header>

<footer>
    Dijana pada <?= esc($meta['generated_at']) ?> oleh <?= esc($meta['user']) ?>
    <!-- "Muka X / Y" dilukis di bucu kanan oleh page_text() -->
</footer>

<table>
    <thead>
    <tr>
        <th style="width: 3%">#</th>
        <?php foreach ($columns as $label): ?>
            <th><?= esc($label) ?></th>
        <?php endforeach ?>
    </tr>
    </thead>
    <tbody>
    <?php $n = 0; ?>
    <?php foreach ($rows as $row): ?>
        <?php $n++; ?>
        <tr>
            <td class="num"><?= $n ?></td>
            <?php foreach (array_keys($columns) as $key): ?>
                <?php $value = $row[$key] ?? ''; ?>
                <td class="<?= is_int($value) || is_float($value) ? 'num' : '' ?>"><?= esc((string) $value) ?></td>
            <?php endforeach ?>
        </tr>
    <?php endforeach ?>

    <?php if ($n === 0): ?>
        <tr><td colspan="<?= count($columns) + 1 ?>" class="empty">Tiada rekod sepadan dengan penapis.</td></tr>
    <?php endif ?>
    </tbody>
</table>

<p style="margin-top: 8px; font-size: 8pt;">Jumlah rekod: <strong><?= number_format($n) ?></strong></p>

</body>
</html>
```

**4. Add `exportRows()` to `ReportService`** — count first, reject if over the limit, then return a Generator:

Add the export limit right after `public const PER_PAGE = 20;`:

`app/Services/ReportService.php`

```php
    /** Had eksport — Dompdf perlahan untuk jadual besar; PhpSpreadsheet guna ~1 KB memori/sel. */
    public const EXPORT_LIMIT = ['pdf' => 2000, 'xlsx' => 10000];
```

Then add `exportRows()` and `streamRows()` before the final `}` of the class:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 4. Eksport: semua baris (tanpa pagination) tetapi berhad
    // ------------------------------------------------------------------

    /**
     * BUKAN fungsi generator — supaya semakan had (LengthException) berlaku SERTA-MERTA
     * apabila dipanggil, bukan tertangguh sehingga baris pertama dibaca.
     *
     * @return iterable<array<string, mixed>>
     *
     * @throws LengthException jika melebihi EXPORT_LIMIT
     */
    public function exportRows(string $report, array $filters, string $format): iterable
    {
        $this->assertReport($report);
        $limit = self::EXPORT_LIMIT[$format] ?? throw new InvalidArgumentException("Format tidak sah: {$format}");

        if ($report === 'penggunaan') {
            return $this->usageByZone($filters); // paling banyak beberapa puluh zon
        }

        $builder = $this->builder($report, $filters);
        $total   = $builder->countAllResults(false);

        if ($total > $limit) {
            throw new LengthException(sprintf(
                'Terlalu banyak rekod (%s) untuk eksport %s. Had: %s. Sila kecilkan julat penapis.',
                number_format($total),
                strtoupper($format),
                number_format($limit),
            ));
        }

        return $this->streamRows($report, $this->applySort($builder, $report, $filters));
    }

    /** Baca baris satu demi satu — elak membina array PHP gergasi. */
    private function streamRows(string $report, BaseBuilder $builder): Generator
    {
        $query = $builder->get();

        // fetch_assoc() pulang null (tamat) atau false (ralat) — kedua-duanya hentikan gelung.
        while (is_array($row = $query->getUnbufferedRow('array'))) {
            yield $this->formatRow($report, $row);
        }

        $query->freeResult();
    }
```

**5. Wire it into the controller.** Replace the **whole** `app/Controllers/Laporan/ReportController.php` with this version. Compared with Lab 9.2: `handle()` checks `?export=pdf|xlsx` first; `export()` calls `exportRows()` and `ExportService`, then `download($filename, $binary, true)` (`true` = guess the MIME type from the file extension); `LengthException` is caught → `redirect()` to the same URL without `export`, with an `error` flash; `describeFilters()` turns ids/enums into labels for the file header.

`app/Controllers/Laporan/ReportController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Laporan;

use App\Controllers\BaseController;
use App\Services\ExportService;
use App\Services\ReportService;
use CodeIgniter\HTTP\ResponseInterface;
use LengthException;

class ReportController extends BaseController
{
    private ReportService $reports;
    private ExportService $exporter;

    public function __construct()
    {
        $this->reports  = service('reportService');
        $this->exporter = service('exportService');
    }

    /** GET /laporan/tempahan — RPT-01 */
    public function bookings(): string|ResponseInterface
    {
        return $this->handle('tempahan');
    }

    /** GET /laporan/pas — RPT-02 */
    public function passes(): string|ResponseInterface
    {
        return $this->handle('pas');
    }

    /** GET /laporan/penggunaan — RPT-03 */
    public function usage(): string|ResponseInterface
    {
        return $this->handle('penggunaan');
    }

    /**
     * Satu aliran untuk ketiga-tiga laporan:
     *   penapis sama → HTML berpagination  ATAU  ?export=pdf|xlsx
     */
    private function handle(string $report): string|ResponseInterface
    {
        $filters = $this->reports->normaliseFilters($report, $this->request->getGet() ?? []);
        $export  = $this->request->getGet('export');

        if ($export === 'pdf' || $export === 'xlsx') {
            return $this->export($report, $filters, $export);
        }

        $page   = (int) ($this->request->getGet('page') ?? 1);
        $result = $this->reports->paginate($report, $filters, $page);

        return view('laporan/index', [
            'title'    => $this->reports->title($report),
            'report'   => $report,
            'filters'  => $filters,
            'query'    => $this->reports->toQuery($filters),
            'columns'  => $this->reports->columns($report),
            'sortable' => $this->reports->sortableColumns($report),
            'options'  => $this->reports->filterOptions($report),
            'result'   => $result,
            'pager'    => service('pager'),
        ]);
    }

    private function export(string $report, array $filters, string $format): ResponseInterface
    {
        try {
            $rows = $this->reports->exportRows($report, $filters, $format);
        } catch (LengthException $e) {
            // Kembali ke paparan HTML dengan penapis yang SAMA (tanpa ?export=)
            return redirect()
                ->to(current_url() . '?' . http_build_query($this->reports->toQuery($filters)))
                ->with('error', $e->getMessage());
        }

        $user  = auth()->user();
        $title = $this->reports->title($report);
        $meta  = [
            'filters'      => $this->describeFilters($report, $filters),
            'user'         => (string) ($user->full_name ?? $user->email ?? '-'),
            'generated_at' => date('d/m/Y H:i'),
        ];

        $binary = $format === 'pdf'
            ? $this->exporter->pdf($title, $this->reports->columns($report), $rows, $meta)
            : $this->exporter->xlsx($title, $this->reports->columns($report), $rows, $meta);

        $filename = sprintf('laporan-%s-%s.%s', $report, date('Ymd-His'), $format);

        // download(nama, data, setMime=true) → Content-Type diteka dari sambungan fail
        // (application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
        // dan Content-Disposition: attachment.
        return $this->response->download($filename, $binary, true);
    }

    /** Ringkasan penapis untuk pengepala PDF/Excel — pembaca tahu data ini ditapis bagaimana. */
    private function describeFilters(string $report, array $f): string
    {
        $parts = [];

        if ($report === 'penggunaan') {
            [$start, $end] = $this->reports->usagePeriod($f);
            $parts[]       = 'Tempoh ' . date('d/m/Y', strtotime($start)) . ' – ' . date('d/m/Y', strtotime($end));
        } else {
            $parts[] = 'Tarikh ' . ($f['from'] ? date('d/m/Y', strtotime($f['from'])) : '(mula)')
                . ' – ' . ($f['to'] ? date('d/m/Y', strtotime($f['to'])) : '(kini)');
        }

        // Tukar nilai id/enum kepada label yang dipaparkan dalam dropdown
        foreach ($this->reports->filterOptions($report) as $group => $opts) {
            $key = match ($group) {
                'zones'       => 'zone_id',
                'categories'  => 'category',
                'statuses'    => 'status',
                'departments' => 'department_id',
                'pass_types'  => 'pass_type',
                default       => null,
            };

            if ($key !== null && ($f[$key] ?? null) !== null) {
                foreach ($opts as $o) {
                    if ((string) $o['value'] === (string) $f[$key]) {
                        $parts[] = $o['label'];
                    }
                }
            }
        }

        return implode(' · ', $parts);
    }
}
```

**6. Test all three reports × two formats** (6 files). Open each file and go through the list in the Checkpoint.

The seeder gives staff numbers `LT0001`–`LT0005` (no leading zeros). To test leading zeros in Excel, change the staff number of `pemohon2` (who has pass applications from `DemoDataSeeder`) to `001234`, then export RPT-02:

```bash
mysql -u kkm_dev -p -e "UPDATE users SET staff_no = '001234' WHERE username = 'pemohon2'" kkm_latihan
```

🪟 If the password prompt does not appear in Git Bash: `winpty mysql …` (as on Day 6).

**7. Commit.** `git add app/ && git commit -m "RPT: eksport PDF (Dompdf) & Excel (PhpSpreadsheet)"`; PowerShell: run `git add` and `git commit` one at a time

**8. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (export security review, AI-06 style):

```text
Plan mode. Do not change any file.
Review export security in @app/Services/ExportService.php, @app/Views/laporan/pdf.php
and the export method in @app/Controllers/Laporan/ReportController.php.
Report in a table | Risk | Control present? (Yes/No/Partial) | Evidence file:line | How I test it |:
1. Formula injection in Excel (text starting with =, +, -, @)
2. PDF output without esc() (HTML in a name)
3. Export without a permission check (opening ?export=xlsx directly)
4. Row & memory limit: what is the maximum number of rows, and what happens above it?
5. File name & the Content-Disposition header
6. Export filters that differ from the screen filters
Do NOT rewrite the code. Explain only.
```

Look for in the answer: `setCellValueExplicit(..., DataType::TYPE_STRING)` for text, `esc()` in `pdf.php`, the row limit in `exportRows()`, and the same builder for the screen and the export.

Verify it yourself: note `pemohon2`'s original `full_name` (`SELECT full_name FROM users WHERE username = 'pemohon2';`), change it to a formula, export RPT-02 to Excel, then restore it:

```bash
mysql -u kkm_dev -p -e "UPDATE users SET full_name = '=1+1' WHERE username = 'pemohon2'" kkm_latihan
```

The name cell must show the text `=1+1`, not `2`. Afterwards restore `pemohon2`'s original `full_name` with the same `UPDATE`. 🪟 If the password prompt does not appear in Git Bash: `winpty mysql …` (as in step 6). Record the findings in `docs/nota-claude.md`.

### ✅ Checkpoint 9.3
- [ ] Filter RPT-01 by `status=approved` → screen: *N* records → PDF: "Jumlah rekod: *N*" → Excel: *N* data rows (rows 6 to 5+*N*). **All three numbers match.** (Quiz S3)
- [ ] PDF: A4 **landscape**; the header repeats on every page; footer "Dijana pada … oleh *your name*"; "Muka 1 / 3" (Page 1 / 3) in the bottom-right corner (Quiz S3).
- [ ] PDF: names with special characters (e.g. add a synthetic user "Nur'aini Ābdul") display correctly — not `?` (Quiz S3).
- [ ] Excel: the header row is **bold**; columns are wide enough; scroll down → the header stays (frozen); No. Pekerja (staff number) `001234` keeps its leading zeros (Quiz S3).
- [ ] File name: `laporan-tempahan-20260925-143012.pdf` (Quiz S3).
- [ ] Log in as `pemohon1@latihan.test` and open `/laporan/pas?export=xlsx` directly → **denied** (Quiz S3).
- [ ] Prompting: the export review in *Plan* mode is recorded, and the synthetic name `=1+1` stays text in the Excel file (Quiz S3).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `?` characters or empty boxes in the PDF | The core PDF font (Helvetica) has no Unicode glyphs | `setDefaultFont('DejaVu Sans')` + `font-family: "DejaVu Sans"` in the CSS; `loadHtml($html, 'UTF-8')` |
| `Cannot modify header information - headers already sent by (output started at .../app/Config/Xxx.php:NN)` | There is output before the response: spaces/blank lines after `?>`, a BOM, `echo`/`var_dump`/`dd()` | Remove the closing `?>` in pure PHP files; remove debug code; save files as UTF-8 **without BOM** |
| Excel: "*We found a problem with some content*" / corrupt file | Extra output (spaces, PHP warnings) mixed into the binary | Same as above; check `writable/logs/` for warnings |
| `Allowed memory size of 134217728 bytes exhausted` | Too many cells/rows | The `EXPORT_LIMIT` cap; `disconnectWorksheets()`; do not use `getResultArray()` for exports |
| `Maximum execution time of 30 seconds exceeded` (PDF) | Dompdf is slow for tables with thousands of rows | PDF limit 2,000; suggest Excel for large data |
| The logo does not appear in the PDF | `isRemoteEnabled=false` blocks `http://…` URLs | Use a local file path in `public/` (allowed by `setChroot([FCPATH])`) or a base64 data URI |
| PDF layout is a mess | Using flexbox/grid/Bootstrap | Dompdf = CSS 2.1: use `<table>`, `position: fixed`, `float` |
| `Class "Dompdf\Dompdf" not found` | `composer require` was run in another folder / `vendor/` not updated | Run it in the project root; `composer dump-autoload` |
| `ZipArchive not found` when creating `.xlsx` | The `ext-zip` extension is not enabled | Enable it in `php.ini` (`extension=zip`) and restart the server |

### ⭐ Bonus challenge
- Add a **PDF preview** button that opens the PDF in a new tab (inline) using:
  ```php
  return $this->response
      ->setContentType('application/pdf')
      ->setHeader('Content-Disposition', 'inline; filename="' . $filename . '"')
      ->setBody($binary);
  ```
- Add a streamed **CSV** format (`fputcsv` to `php://output`) for exports with no practical limit. Discuss: why is CSV lighter than `.xlsx`?

---

## Lab 9.4 — Test "report total = SQL total" & EXPLAIN (S4)

### 🎯 Objective
- Write PHPUnit tests with your own fixtures and compare report totals with direct SQL counts.
- Read the `EXPLAIN` plan for the RPT-01/RPT-02 queries and judge how indexes are used.

### Prerequisites
- Labs 9.2 & 9.3 done.
- A separate test database exists:
  ```sql
  CREATE DATABASE IF NOT EXISTS kkm_latihan_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- `.env` (do NOT commit):
  ```ini
  database.tests.hostname = localhost
  database.tests.database = kkm_latihan_test
  database.tests.username = <pengguna anda>
  database.tests.password = <kata laluan anda>
  database.tests.DBDriver = MySQLi
  database.tests.DBPrefix =
  ```

### Steps

**1. Create** `tests/Services/ReportServiceTest.php`. Skeleton:

```php
<?php

declare(strict_types=1);

namespace Tests\Services;

use App\Services\ReportService;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;

final class ReportServiceTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate   = true;
    protected $refresh   = true;
    protected $namespace = null;   // all migrations, including Shield (users table)

    private ReportService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReportService();
        $this->seedFixtures();       // small data set whose answers we know
    }
}
```

**2. Design the fixtures on paper first.** Draw a table of 5 bookings (slot, dates, status) and 3 pass applications (`created_at`, status). Work out by hand: how many are `approved`? how many overlap June? what is the % usage of Zone A in June? **Only then** write `seedFixtures()`.

Compare your design with the fixtures below, then add them inside the class, after `setUp()` (the `$id` property keeps record ids for the tests):

`tests/Services/ReportServiceTest.php`

```php
    /** @var array<string, int> id rekod fixture (diisi oleh seedFixtures()) */
    private array $id = [];

    // =====================================================================
    // Fixture — data sintetik yang kita tahu jawapannya
    // =====================================================================

    private function seedFixtures(): void
    {
        $now = '2026-01-01 08:00:00';

        $this->id['dept1'] = $this->insert('departments', ['code' => 'UJI-IT', 'name' => 'Unit Teknologi Maklumat (Ujian)']);
        $this->id['dept2'] = $this->insert('departments', ['code' => 'UJI-KEW', 'name' => 'Unit Kewangan (Ujian)']);

        $this->id['user1'] = $this->insert('users', [
            'username' => 'ujian1', 'active' => 1, 'full_name' => 'Pemohon Ujian Satu',
            'staff_no' => 'U0001', 'department_id' => $this->id['dept1'], 'created_at' => $now,
        ]);
        $this->id['user2'] = $this->insert('users', [
            'username' => 'ujian2', 'active' => 1, 'full_name' => 'Pemohon Ujian Dua',
            'staff_no' => 'U0002', 'department_id' => $this->id['dept2'], 'created_at' => $now,
        ]);

        $this->id['veh1'] = $this->insert('vehicles', ['user_id' => $this->id['user1'], 'plate_no' => 'WXX 9001', 'model' => 'Myvi', 'color' => 'Putih']);
        $this->id['veh2'] = $this->insert('vehicles', ['user_id' => $this->id['user2'], 'plate_no' => 'WXX 9002', 'model' => 'Saga', 'color' => 'Hitam']);

        $this->id['zoneA'] = $this->insert('parking_zones', ['code' => 'ZA', 'name' => 'Zon A Ujian', 'location' => 'Blok A']);
        $this->id['zoneB'] = $this->insert('parking_zones', ['code' => 'ZB', 'name' => 'Zon B Ujian', 'location' => 'Blok B']);

        $a1 = $this->insert('parking_slots', ['zone_id' => $this->id['zoneA'], 'slot_no' => 'A01', 'category' => 'oku', 'is_active' => 1]);
        $a2 = $this->insert('parking_slots', ['zone_id' => $this->id['zoneA'], 'slot_no' => 'A02', 'category' => 'oku', 'is_active' => 1]);
        $this->insert('parking_slots', ['zone_id' => $this->id['zoneA'], 'slot_no' => 'A03', 'category' => 'oku', 'is_active' => 0]);
        $b1 = $this->insert('parking_slots', ['zone_id' => $this->id['zoneB'], 'slot_no' => 'B01', 'category' => 'pegawai_kanan', 'is_active' => 1]);

        $bookings = [
            // [slot, user, vehicle, start, end, status]
            [$a1, 'user1', 'veh1', '2026-06-01', '2026-06-10', 'approved'],  // #1
            [$a2, 'user2', 'veh2', '2026-05-25', '2026-06-05', 'approved'],  // #2
            [$b1, 'user1', 'veh1', '2026-06-15', '2026-06-20', 'pending'],   // #3
            [$b1, 'user2', 'veh2', '2026-06-01', '2026-06-03', 'rejected'],  // #4
            [$a1, 'user1', 'veh1', '2026-07-01', '2026-07-05', 'approved'],  // #5
        ];

        foreach ($bookings as $i => [$slot, $user, $veh, $start, $end, $status]) {
            $this->insert('slot_bookings', [
                'ref_no'     => sprintf('TLK-2026-%04d', 9001 + $i),
                'user_id'    => $this->id[$user],
                'vehicle_id' => $this->id[$veh],
                'slot_id'    => $slot,
                'start_date' => $start,
                'end_date'   => $end,
                'reason'     => 'Data ujian sintetik',
                'status'     => $status,
                'created_at' => $now,
            ]);
        }

        $passes = [
            // [user, created_at, status]
            ['user1', '2026-09-01 09:00:00', 'submitted'],
            ['user1', '2026-09-30 14:00:00', 'under_review'],  // hari terakhir julat
            ['user2', '2026-10-01 00:00:00', 'approved'],      // di luar julat September
        ];

        foreach ($passes as $i => [$user, $createdAt, $status]) {
            $this->insert('pass_applications', [
                'ref_no'      => sprintf('PAS-2026-%04d', 9001 + $i),
                'user_id'     => $this->id[$user],
                'pass_type'   => 'kakitangan',
                'purpose'     => 'Data ujian sintetik',
                'valid_from'  => '2026-10-01',
                'valid_until' => '2026-12-31',
                'status'      => $status,
                'created_at'  => $createdAt,
            ]);
        }
    }

    private function insert(string $table, array $row): int
    {
        $this->db->table($table)->insert($row);

        return (int) $this->db->insertID();
    }
```

**3. Write at least 7 tests** (descriptive Malay names):

| Test | Main assertion |
|------|----------------|
| `testRpt01TanpaPenapisSamaDenganJumlahJadual` | `total === COUNT(*)` |
| `testRpt01PenapisStatusSamaDenganKiraanSql` | `total === COUNT(*) WHERE status` **and** `=== 3` |
| `testRpt01JulatTarikhGunaSyaratBertindih` | 4 (not 3!) |
| `testRpt02HariTerakhirJulatTidakTercicir` | the 30/09 14:00 record is included |
| `testSusunanDiluarWhitelistJatuhKeLalai` | `sort === 'start_date'`; the `users` table still exists |
| `testEksportSamaJumlahDenganPaparanHtml` | `count(iterator_to_array(exportRows)) === paginate total` |
| `testRpt03KadarPenggunaanJun2026` | Zone A = `25.0` |

Test code. Add it inside the class, after `setUp()` and before the fixtures:

`tests/Services/ReportServiceTest.php`

```php
    // =====================================================================
    // RPT-01 — Senarai tempahan TLK
    // =====================================================================

    public function testRpt01TanpaPenapisSamaDenganJumlahJadual(): void
    {
        $f      = $this->service->normaliseFilters('tempahan', []);
        $result = $this->service->paginate('tempahan', $f, 1);

        $this->assertSame($this->db->table('slot_bookings')->countAllResults(), $result['total']);
        $this->assertSame(5, $result['total']);
    }

    public function testRpt01PenapisStatusSamaDenganKiraanSql(): void
    {
        $f      = $this->service->normaliseFilters('tempahan', ['status' => 'approved']);
        $result = $this->service->paginate('tempahan', $f, 1);

        $expected = $this->db->table('slot_bookings')->where('status', 'approved')->countAllResults();

        $this->assertSame($expected, $result['total']);
        $this->assertSame(3, $result['total']);
    }

    public function testRpt01JulatTarikhGunaSyaratBertindih(): void
    {
        // Jun 2026: tempahan #1, #2 (mula 25/05, tamat 05/06), #3, #4 bertindih. #5 (Julai) tidak.
        $f      = $this->service->normaliseFilters('tempahan', ['from' => '2026-06-01', 'to' => '2026-06-30']);
        $result = $this->service->paginate('tempahan', $f, 1);

        $expected = $this->db->table('slot_bookings')
            ->where('start_date <=', '2026-06-30')
            ->where('end_date >=', '2026-06-01')
            ->countAllResults();

        $this->assertSame($expected, $result['total']);
        $this->assertSame(4, $result['total']);
    }


    public function testSusunanDiluarWhitelistJatuhKeLalai(): void
    {
        $f = $this->service->normaliseFilters('tempahan', ['sort' => 'b.id; DROP TABLE users', 'dir' => 'sideways']);

        $this->assertSame('start_date', $f['sort']);
        $this->assertSame('desc', $f['dir']);
        $this->assertSame(5, $this->service->paginate('tempahan', $f, 1)['total']);
        $this->assertTrue($this->db->tableExists('users'));
    }


    public function testEksportSamaJumlahDenganPaparanHtml(): void
    {
        $f = $this->service->normaliseFilters('tempahan', ['status' => 'approved']);

        $html   = $this->service->paginate('tempahan', $f, 1)['total'];
        $export = iterator_to_array($this->service->exportRows('tempahan', $f, 'xlsx'), false);

        $this->assertCount($html, $export);
        $this->assertSame('Diluluskan', $export[0]['status']); // label BM dari enum
    }

    // =====================================================================
    // RPT-02 — Senarai permohonan Pas
    // =====================================================================

    public function testRpt02HariTerakhirJulatTidakTercicir(): void
    {
        // Permohonan pada 30/09 14:00 MESTI termasuk apabila "hingga 30/09".
        // (Pepijat klasik: where('created_at <=', '2026-09-30') = sehingga 00:00 sahaja.)
        $f = $this->service->normaliseFilters('pas', ['from' => '2026-09-01', 'to' => '2026-09-30']);

        $this->assertSame(2, $this->service->paginate('pas', $f, 1)['total']);
    }

    // =====================================================================
    // RPT-03 — Penggunaan slot mengikut zon
    // =====================================================================

    public function testRpt03KadarPenggunaanJun2026(): void
    {
        $f    = $this->service->normaliseFilters('penggunaan', ['year' => '2026', 'month' => '6']);
        $rows = array_column($this->service->usageByZone($f), null, 'zone_code');

        // Zon A: 2 slot aktif (slot tidak aktif dikecualikan) × 30 hari = 60 hari-slot.
        // Ditempah: #1 = 10 hari (01–10/06), #2 = 5 hari (01–05/06). 15 / 60 = 25.0 %
        $this->assertSame(2, $rows['ZA']['total_slots']);
        $this->assertSame(2, $rows['ZA']['total_bookings']);
        $this->assertSame(15, $rows['ZA']['booked_days']);
        $this->assertSame(60, $rows['ZA']['capacity_days']);
        $this->assertSame(25.0, $rows['ZA']['utilisation']);

        // Zon B: pending & rejected TIDAK dikira sebagai penggunaan.
        $this->assertSame(0, $rows['ZB']['booked_days']);
        $this->assertSame(0.0, $rows['ZB']['utilisation']);
    }
```

**4. Run them.**

```bash
composer test -- tests/Services/ReportServiceTest.php --testdox
```

**5. Prove the tests catch bugs (manual mutation).** In `passesBuilder()`, temporarily replace the whole `->when($f['to'] ?? null, ...)` condition (4 lines, `'p.created_at <'`) with this single line:

```php
// DELIBERATELY WRONG — to see the test fail
->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where('p.created_at <=', $to))
```

Run again → `testRpt02HariTerakhirJulatTidakTercicir` **must fail**. Restore → green.

**6. EXPLAIN.** Create a small Spark command `app/Commands/ReportExplain.php`:

```php
<?php

declare(strict_types=1);

namespace App\Commands;

use App\Services\ReportService;
use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

class ReportExplain extends BaseCommand
{
    protected $group       = 'Laporan';
    protected $name        = 'laporan:explain';
    protected $description = 'Papar SQL & pelan EXPLAIN bagi laporan tempahan/pas.';
    protected $usage       = 'laporan:explain <tempahan|pas> [status] [from] [to]';

    public function run(array $params)
    {
        $report = $params[0] ?? 'tempahan';

        if (! in_array($report, ['tempahan', 'pas'], true)) {
            CLI::error('Laporan mesti "tempahan" atau "pas" (RPT-03 ialah aggregate PHP).');

            return EXIT_ERROR;
        }

        $service = new ReportService();
        $filters = $service->normaliseFilters($report, [
            'status' => $params[1] ?? null,
            'from'   => $params[2] ?? null,
            'to'     => $params[3] ?? null,
        ]);

        $sql = $service->builder($report, $filters)->getCompiledSelect();   // the REAL SQL
        CLI::write($sql, 'yellow');

        // FORMAT=TRADITIONAL: MySQL 9 changed the default EXPLAIN format to a tree (MariaDB: drop FORMAT=TRADITIONAL).
        // A justified K7 exception: $sql is compiled by the Query Builder (values already escaped), CLI command only.
        $plan = db_connect()->query('EXPLAIN FORMAT=TRADITIONAL ' . $sql)->getResultArray();
        CLI::table($plan, array_keys($plan[0] ?? []));

        return EXIT_SUCCESS;
    }
}
```

```bash
php spark laporan:explain tempahan approved 2026-06-01 2026-06-30
php spark laporan:explain pas "" 2026-09-01 2026-09-30
```

**7. Record your observations** in `docs/laporan-spec.md` → section "Prestasi" (Performance): for each query, note `type`, `key`, `rows` for the main table (`b` / `p`). Answer: *which query has no index for its main filter?*

**8. Commit & open the MR.**

```bash tab="Git Bash / macOS / Linux"
git add -A && git commit -m "RPT: ujian jumlah laporan = SQL + arahan laporan:explain"
git push -u origin feat/laporan    # open an MR to main → trainer/neighbour comments; do NOT merge yet — Labs 9.1b–9.4b add commits to this MR
```

```powershell tab="PowerShell"
git add -A
git commit -m "RPT: ujian jumlah laporan = SQL + arahan laporan:explain"
git push -u origin feat/laporan    # open an MR to main → trainer/neighbour comments; do NOT merge yet — Labs 9.1b–9.4b add commits to this MR
```

**9. Prompting (Claude Code, Plan mode).** In `claude`, press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then paste (AI-09 + reading EXPLAIN):

```text
Plan mode. Do not change any file.
1. Read @tests/Services/ReportServiceTest.php and @app/Services/ReportService.php.
   List the branches in normaliseFilters(), applySort() and usageByZone() that have NO test.
   For the 3 riskiest give | Given | When | Then |. Do NOT write test code.
2. Here is my php spark laporan:explain output:
[paste the output of step 6]
Explain the type, key and rows columns for tables b and p. What index suits RPT-02
with a date filter only, and what does it cost on INSERT?
```

Look for in the answer: real branches (reversed range, month outside 1–12, invalid sort column) and an explanation of `type = ALL` that matches README §4.2.

Verify it yourself: pick one branch, write that test yourself, then type `!composer test -- tests/Services/ReportServiceTest.php` in Claude Code: green. Compare the EXPLAIN reading with your notes in `docs/laporan-spec.md` → "Prestasi". Do **not** add the suggested index today; note it as a suggestion in `docs/nota-claude.md`.

### ✅ Checkpoint 9.4 — **M3 done**
- [ ] `composer test -- tests/Services/ReportServiceTest.php` → all green (≥ 7 tests) (Quiz S4).
- [ ] The mutation in step 5 makes exactly **one** test fail; it has been restored (Quiz S4).
- [ ] The output of `laporan:explain tempahan approved` shows `key = status` (or another index) for table `b` — not `type = ALL` (Quiz S4).
- [ ] You can explain to the trainer why RPT-02 with only a date filter shows `type = ALL` on `p` (Quiz S4).
- [ ] DoD KOLABORASI §2 ticked for M3 (Quiz S4).
- [ ] Prompting: one untested branch (from AI-09) is now tested by you and green; Claude's EXPLAIN reading is compared with README §4.2 (Quiz S4).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| Tests use SQLite & fail with `no such function: DATEDIFF` | CI4's default `tests` group = SQLite | Set `database.tests.*` to MySQL in `.env` |
| `Table 'kkm_latihan_test.users' doesn't exist` | `$namespace = 'App'` (default) → the Shield migrations do not run | `protected $namespace = null;` |
| `Duplicate entry 'WXX 9001' for key 'plate_no'` | Data left over from the last test | `protected $refresh = true;` |
| Tests pass on machine A, fail on B (dates) | Fixtures depend on `date('Y-m-d')` | Use fixed dates (June 2026) in the fixtures |
| EXPLAIN output is one tree-shaped column (`-> Nested loop ...`) | MySQL 9 changed the default EXPLAIN format | Use `'EXPLAIN FORMAT=TRADITIONAL ' . $sql` |
| `getCompiledSelect()` followed by `get()` returns every row without filters | `getCompiledSelect()` (default) **resets** the builder | Use a new builder, or `getCompiledSelect(false)` |

### ⭐ Bonus challenge
- Generate 50,000 synthetic bookings (a separate seeder `BulkBookingSeeder`, using `insertBatch()` in batches of 1,000), time RPT-02 with only a date filter, then propose (in a **new** migration, not by changing the old one) `INDEX(created_at)` on `pass_applications`. Run `laporan:explain` before/after and present the difference in `type`/`rows`. Record it as a recommendation to the system owner — schema changes must be recorded in `docs/log-keputusan.md`.
- Add a test `testEksportMelebihiHadDitolak`: make the limit a constructor parameter (`?array $exportLimit = null`), create the service with the limit `['pdf' => 2, 'xlsx' => 2]`, and `expectException(\LengthException::class)`. (Why does a subclass that overrides `const EXPORT_LIMIT` have no effect if the code calls `self::EXPORT_LIMIT`? Hint: `self::` vs `static::`.)

---

## Lab 9.1b — Quick periods & active filter chips (S5)

### 🎯 Objective
- Add "Quick periods" and "Active filters" rows to the RPT-01..03 spec cards.
- Build **Bulan ini / Bulan lepas / Tahun ini** (This month / Last month / This year) GET links that fill the date range and keep the other filters.
- Build **active filter chips**: one click removes one filter, the other filters stay.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- [Lab 9.1](#lab-91--report-design--get-filter-form-s1) done: the filter form keeps its values after **Tapis** (Filter).

### Steps

**1. Update the spec cards (5 min).** Add these two rows at the end of the table in `docs/laporan-spec.md`, then fill in every cell:

```markdown
| Tempoh pantas (butang) | | | |
| Filter aktif dipapar sebagai | | | |
```

Hint: RPT-01 and RPT-02 fill `from`/`to`; RPT-03 fills `year`/`month`. The card and the code must match: if the card says "Minggu ini" (This week), the code needs that button too.

**2. Helper variables in the view.** In `app/Views/laporan/index.php`, add this block directly after the `$selected = static fn ...` line and **before** the first `?>`:

`app/Views/laporan/index.php`

```php
// Lab 9.1b — tempoh pantas & cip penapis aktif.
// $keep = penapis yang berisi (termasuk sort/dir) → asas setiap pautan supaya pilihan lain kekal.
$keep  = array_filter($filters, static fn ($v): bool => $v !== null && $v !== '');
$today = new DateTimeImmutable('today');

if ($report !== 'penggunaan') {
    unset($keep['year']); // rangka Lab 9.1 mengisi year untuk semua laporan; hanya RPT-03 memerlukannya
}

// Bina URL laporan semasa daripada array penapis; nilai null/kosong dibuang.
$urlWith = static function (array $params): string {
    $qs = http_build_query(array_filter($params, static fn ($v): bool => $v !== null && $v !== ''));

    return current_url() . ($qs === '' ? '' : '?' . $qs);
};

// Tempoh pantas. 'first day of last month' selamat pada 31 haribulan; '-1 month' tidak (31/03 → 03/03).
$lastMonth = $today->modify('first day of last month');
$presets   = $report === 'penggunaan'
    ? [
        'Bulan ini'   => ['year' => $today->format('Y'), 'month' => $today->format('n')],
        'Bulan lepas' => ['year' => $lastMonth->format('Y'), 'month' => $lastMonth->format('n')],
        'Tahun ini'   => ['year' => $today->format('Y'), 'month' => null], // null → kunci dibuang = "Setahun"
    ]
    : [
        'Bulan ini'   => ['from' => $today->modify('first day of this month')->format('Y-m-d'), 'to' => $today->modify('last day of this month')->format('Y-m-d')],
        'Bulan lepas' => ['from' => $lastMonth->format('Y-m-d'), 'to' => $lastMonth->modify('last day of this month')->format('Y-m-d')],
        'Tahun ini'   => ['from' => $today->format('Y') . '-01-01', 'to' => $today->format('Y') . '-12-31'],
    ];

// Cip penapis aktif: kunci → [label, kumpulan $options untuk menukar nilai kepada label dropdown].
$chipDefs = [
    'from'          => ['Dari', ''],
    'to'            => ['Hingga', ''],
    'zone_id'       => ['Zon', 'zones'],
    'category'      => ['Kategori', 'categories'],
    'department_id' => ['Jabatan', 'departments'],
    'pass_type'     => ['Jenis pas', 'pass_types'],
    'status'        => ['Status', 'statuses'],
    'month'         => ['Bulan', ''],
];
$chips = [];

foreach ($chipDefs as $key => [$label, $group]) {
    if (! isset($keep[$key])) {
        continue;
    }

    $text = (string) $keep[$key];

    if ($key === 'month') {
        $text = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'][(int) $text - 1] ?? $text;
    }

    foreach ($options[$group] ?? [] as $o) {
        if ((string) $o['value'] === $text) {
            $text = $o['label'];
        }
    }

    $chips[$key] = $label . ': ' . $text;
}
```

- `$keep` holds the filters that have a value. Every link starts from it, so the other choices stay.
- `$preset + $keep`: the `+` operator keeps the keys of the **left** array. The period values overwrite the current `from`/`to`, and `status` stays.
- `'month' => null` on **Tahun ini** (This year) overwrites the current month, then `$urlWith()` drops that key. As a result, the Bulan (Month) dropdown shows *Setahun* (Whole year).
- `$chips` turns values into dropdown labels (`approved` → *Diluluskan*, `1` → *A — Blok Utama*) with the same `$options` as the form.

**3. Quick periods & chips block.** In the same file, add this block directly after `</form>` and **before** the line `<?php // JADUAL & PAGINATION — Lab 9.2 langkah 9 menggantikan baris ini. ?>` (Lab 9.2 replaces only that line, so this block stays). If Lab 9.2 is already done, put this block before `<!-- ============ RINGKASAN + EKSPORT`:

`app/Views/laporan/index.php`

```php
<!-- ============ Lab 9.1b: TEMPOH PANTAS + CIP PENAPIS AKTIF ============
     Pautan GET biasa (tiada JavaScript). Setiap pautan bermula daripada $keep → pilihan lain kekal.
     Tiada 'page' dalam pautan → kembali ke halaman 1 apabila penapis berubah. -->
<div class="d-flex flex-wrap align-items-center gap-2 mb-3">
    <span class="text-muted small">Tempoh pantas:</span>
    <?php foreach ($presets as $label => $preset): ?>
        <?php
        // Aktif jika setiap nilai preset sama dengan penapis semasa (null = penapis itu mesti kosong)
        $isOn = true;
        foreach ($preset as $k => $v) {
            $isOn = $isOn && (string) ($filters[$k] ?? '') === (string) ($v ?? '');
        }
        ?>
        <a href="<?= esc($urlWith($preset + $keep), 'attr') ?>"
           class="btn btn-sm <?= $isOn ? 'btn-secondary' : 'btn-outline-secondary' ?>"><?= esc($label) ?></a>
    <?php endforeach ?>

    <?php foreach ($chips as $key => $text): ?>
        <!-- Klik cip = buang SATU penapis; yang lain kekal -->
        <a href="<?= esc($urlWith(array_diff_key($keep, [$key => true])), 'attr') ?>"
           class="badge rounded-pill text-bg-light border text-decoration-none" title="Buang penapis ini">
            <?= esc($text) ?> <i class="bi bi-x-lg"></i>
        </a>
    <?php endforeach ?>
</div>
```

**4. Test in the browser** as `penyemak@latihan.test`:

1. `/laporan/tempahan` → click **Bulan ini**. URL: `?from=<1hb bulan ini>&to=<hari terakhir bulan ini>` (the 1st and the last day of this month). The **Bulan ini** button turns dark; the *Dari* (From) and *Hingga* (To) chips appear.
2. Choose Status *Diluluskan* (Approved) → **Tapis**. The URL now contains `zone_id=&category=&…&sort=&dir=` (the form sends every field). The *Status: Diluluskan* chip appears and **Bulan ini** is still dark.
3. Click the *Dari: …* chip. Write down the query string of the new URL (Quiz S5).
4. Click **Bulan lepas** (Last month). `from`/`to` change to last month, and the *Status: Diluluskan* chip is still there.
5. `/laporan/penggunaan` → choose Bulan *Jun* (June) → **Tapis** → click **Tahun ini**. Write down the Bulan dropdown choice and which button is dark (Quiz S5).
6. Test `esc()`: open `/laporan/tempahan?from=<b>x</b>`. The chip shows the text `<b>x</b>` literally, not bold text.

**5. Commit.** `git add -A && git commit -m "RPT: tempoh pantas & cip penapis aktif"`; PowerShell: run `git add` and `git commit` one at a time

### ✅ Checkpoint
- [ ] `docs/laporan-spec.md` has complete "Tempoh pantas" and "Filter aktif" rows for the 3 reports (Quiz S5).
- [ ] RPT-01: **Bulan ini** fills `from`/`to` with the current month; the chosen Status stays after you click **Bulan lepas** (Quiz S5).
- [ ] Clicking one chip removes **one** filter only, and the new URL has no empty keys (`zone_id=&…`) (Quiz S5).
- [ ] RPT-03: **Tahun ini** removes `month` → the Bulan dropdown shows *Setahun*, the **Tahun ini** button is dark (Quiz S5).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| PHP code printed as text at the top of the page | The step 2 block was pasted **after** `?>` | Move the block above the first `?>` |
| **Bulan lepas** on 31/03 gives 03/03–… (March), not February | `modify('-1 month')` → 31/02 → adjusted to 03/03 | Use `modify('first day of last month')` as in the code |
| The URL after clicking a chip is still long `?zone_id=&category=&…` | `array_filter()` is missing in `$urlWith` | Copy `$urlWith` again |
| A button is not dark even though the URL is right | Comparing `2026` (int) with `'2026'` (string) using `===` | Cast both sides to `(string)` as in the `$isOn` block |
| A chip shows `approved`, not *Diluluskan* | Wrong group name in `$chipDefs` (e.g. `'status'`, not `'statuses'`) | The group must match an `$options` key |
| `Undefined variable $chips` | The step 2 block was pasted into another file or after `endSection()` | Both blocks go in `app/Views/laporan/index.php`; step 2 at the top, step 3 after `</form>` |

### ⭐ Bonus challenge
- Add a **Minggu ini** (This week, Monday–Sunday) button for RPT-01/02. Hint: `$today->modify('monday this week')` and `$today->modify('sunday this week')`. Update the spec card first.

---

## Lab 9.2b — Status summary & RPT-03 totals row (S6)

### 🎯 Objective
- Write `statusSummary()`, which wraps `builder()` as a subquery (`fromSubquery()`) with `selectCount()` + `groupBy()`, so the summary filters are the same as the list filters.
- Write `usageTotals()`: overall RPT-03 usage as a **weighted** average.
- Show summary buttons that filter by status when clicked, and a JUMLAH (TOTAL) `<tfoot>` row.

### Prerequisites
- [Lab 9.2](#lab-92--reportservice-join-dynamic-filters-aggregate-pagination-s2) done: the three reports show a paginated table.
- [Lab 9.1b](#lab-91b--quick-periods--active-filter-chips-s5) done.

### Steps

**1. Plan the query.** The summary must count the **same** rows as the list. So the summary query does not rewrite the joins and `when()` calls; it wraps the list builder:

```sql
SELECT r.status, COUNT(r.id) AS total
FROM ( <SQL senarai RPT-01: 4 join + when() yang sama> ) r
GROUP BY r.status
```

**2. Add two methods** in `app/Services/ReportService.php`, before the last `}` of the class:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // Lab 9.2b — Ringkasan status (RPT-01/02) & baris jumlah (RPT-03)
    // ------------------------------------------------------------------

    /**
     * Bilangan rekod setiap status bagi penapis yang SAMA dengan senarai.
     * builder() dibalut sebagai subquery → join & when() tidak ditulis semula.
     *
     * @param array<string, int|string|null> $filters hasil normaliseFilters()
     *
     * @return list<array{value: string, label: string, total: int}> ikut susunan enum; status 0 tidak dipapar
     */
    public function statusSummary(string $report, array $filters): array
    {
        $this->assertReport($report);

        if ($report === 'penggunaan') {
            return []; // RPT-03 sudah aggregate; tiada lajur status
        }

        // SELECT r.status, COUNT(r.id) AS total FROM (<SQL senarai>) r GROUP BY r.status
        $counts = $this->db->newQuery()
            ->fromSubquery($this->builder($report, $filters), 'r')
            ->select('r.status')
            ->selectCount('r.id', 'total')
            ->groupBy('r.status')
            ->get()
            ->getResultArray();

        $counts = array_column($counts, 'total', 'status');
        $cases  = $report === 'tempahan' ? BookingStatus::cases() : PassStatus::cases();
        $rows   = [];

        foreach ($cases as $case) {
            if (isset($counts[$case->value])) {
                $rows[] = ['value' => $case->value, 'label' => $case->label(), 'total' => (int) $counts[$case->value]];
            }
        }

        return $rows;
    }

    /**
     * Baris JUMLAH RPT-03. Penggunaan keseluruhan = jumlah hari-slot ÷ jumlah kapasiti (purata BERWAJARAN),
     * bukan purata peratus zon — zon kecil tidak boleh "menarik" angka keseluruhan.
     *
     * @param list<array<string, int|float|string>> $rows hasil usageByZone()
     *
     * @return array<string, int|float|string>
     */
    public function usageTotals(array $rows): array
    {
        $booked   = array_sum(array_column($rows, 'booked_days'));
        $capacity = array_sum(array_column($rows, 'capacity_days'));

        return [
            'zone_code'      => 'JUMLAH',
            'zone_name'      => count($rows) . ' zon',
            'total_slots'    => array_sum(array_column($rows, 'total_slots')),
            'total_bookings' => array_sum(array_column($rows, 'total_bookings')),
            'booked_days'    => $booked,
            'capacity_days'  => $capacity,
            'utilisation'    => $capacity > 0 ? round($booked / $capacity * 100, 1) : 0.0,
        ];
    }
```

- `$this->db->newQuery()` gives an empty builder with no table; `fromSubquery()` turns the list builder into the derived table `r`.
- The `cases()` loop orders the result by the enum (not by MySQL's order) and turns values into labels.
- `usageTotals()` takes the `usageByZone()` rows and runs no query.

**3. Replace the whole `paginate()`** (docblock + method, under the comment `// 3. Paparan HTML berpagination`) with this version. Compared with Lab 9.2, both `return` statements have two new keys: `summary` and `totals`.

`app/Services/ReportService.php`

```php
    /**
     * @param array<string, int|string|null> $filters hasil normaliseFilters()
     *
     * @return array{rows: list<array<string, mixed>>, total: int, page: int, perPage: int, summary: list<array>, totals: array<string, mixed>|null}
     */
    public function paginate(string $report, array $filters, int $page, int $perPage = self::PER_PAGE): array
    {
        $this->assertReport($report);
        $page = max(1, $page);

        if ($report === 'penggunaan') {
            // Aggregate kecil (satu baris per zon) — potong dalam PHP.
            $all = $this->usageByZone($filters);

            return [
                'rows'    => array_slice($all, ($page - 1) * $perPage, $perPage),
                'total'   => count($all),
                'page'    => $page,
                'perPage' => $perPage,
                'summary' => [],
                'totals'  => $this->usageTotals($all), // Lab 9.2b: SEMUA zon, bukan halaman semasa sahaja
            ];
        }

        $builder = $this->builder($report, $filters);

        // countAllResults(false) = kira TANPA reset builder; join/where kekal untuk get().
        $total = $builder->countAllResults(false);

        $rows = $this->applySort($builder, $report, $filters)
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()
            ->getResultArray();

        return [
            'rows'    => array_map(fn (array $r): array => $this->formatRow($report, $r), $rows),
            'total'   => $total,
            'page'    => $page,
            'perPage' => $perPage,
            'summary' => $this->statusSummary($report, $filters), // Lab 9.2b
            'totals'  => null,
        ];
    }
```

The controller **does not change**: `$result` is already passed to the view, so the view can read `$result['summary']` and `$result['totals']` directly.

**4. Update the view** `app/Views/laporan/index.php`.

(a) Add the summary block directly **before** the line `<!-- ============ JADUAL ============ -->`:

`app/Views/laporan/index.php`

```php
<!-- ============ Lab 9.2b: RINGKASAN STATUS ============
     Satu query GROUP BY atas builder yang SAMA → jumlah semua butang = "Jumlah rekod".
     Klik butang = tapis status itu (penapis lain kekal; kembali ke halaman 1). -->
<?php if ($result['summary'] !== []): ?>
    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
        <span class="text-muted small">Ringkasan status:</span>
        <?php foreach ($result['summary'] as $s): ?>
            <a href="<?= esc(current_url() . '?' . http_build_query(['status' => $s['value']] + $query), 'attr') ?>"
               class="btn btn-sm <?= $filters['status'] === $s['value'] ? 'btn-primary' : 'btn-outline-primary' ?>">
                <?= esc($s['label']) ?> <span class="badge text-bg-light"><?= number_format($s['total']) ?></span>
            </a>
        <?php endforeach ?>
    </div>
<?php endif ?>
```

(b) Add the JUMLAH row directly **after** `</tbody>` (before `</table>`):

`app/Views/laporan/index.php`

```php
        <?php if ($result['totals'] !== null && $result['total'] > 0): ?>
            <!-- Lab 9.2b: baris JUMLAH RPT-03 (semua zon, purata berwajaran) -->
            <tfoot class="table-group-divider fw-bold">
            <tr>
                <td></td>
                <?php foreach (array_keys($columns) as $key): ?>
                    <td><?= esc((string) ($result['totals'][$key] ?? '')) ?></td>
                <?php endforeach ?>
            </tr>
            </tfoot>
        <?php endif ?>
```

**5. Test RPT-01 and RPT-02** as `penyemak@latihan.test`:

1. `/laporan/tempahan` with no filters. Add up the number on each summary button; the result must equal "Jumlah rekod" (total records).
2. Debug Toolbar → *Database* tab. Find the query `SELECT r.status, COUNT(r.id) AS total FROM (SELECT b.id, … ) r GROUP BY r.status`. The joins and `WHERE` inside the brackets are the same as the list query.
3. Open `/laporan/tempahan?status=approved`. Write down the number of summary buttons and their numbers (Quiz S6).
4. Choose Zon (Zone) *A* → **Tapis** → click page 2 if there is one → click a summary button. Write down which parameters stay in the URL (Quiz S6).
5. `/laporan/pas` → click the *Ditolak* (Rejected) button. The table shows only rejected applications.

**6. Test the RPT-03 JUMLAH row.** Open `/laporan/penggunaan?year=<tahun ini>&month=<bulan ini>` (this year, this month). The JUMLAH row (bold, under the table) shows `3 zon` (or your number of zones). Calculate by hand: Σ *Hari-Slot Ditempah* (booked slot-days) ÷ Σ *Kapasiti* (capacity) × 100. The result must equal the JUMLAH row's *Penggunaan (%)*. If your zones differ in size, a plain average of the zone percentages gives a **different** number.

**7. Commit.** `git add app/ && git commit -m "RPT: ringkasan status (subquery + groupBy) & baris jumlah RPT-03"`; PowerShell: run `git add` and `git commit` one at a time

### ✅ Checkpoint
- [ ] `/laporan/tempahan` with no filters: the sum of the summary button numbers = "Jumlah rekod" = `SELECT COUNT(*) FROM slot_bookings` (Quiz S6).
- [ ] The Debug Toolbar *Database* tab shows the summary query `… FROM (SELECT …) r GROUP BY r.status` with the same `WHERE` as the list query (Quiz S6).
- [ ] Clicking a summary button filters by that status; the other filters stay and the page goes back to 1 (Quiz S6).
- [ ] RPT-03: the JUMLAH row = Σ slot-days ÷ Σ capacity × 100, the same as your hand calculation (Quiz S6).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Every derived table must have its own alias` | `fromSubquery()` without an alias, or an empty alias | `fromSubquery($this->builder($report, $filters), 'r')` |
| `Duplicate column name 'id'` | You added `u.id` (or another column with the same name) to the builder's `select()` | Every subquery column must be unique; use an alias, e.g. `u.id AS user_id` |
| The sum of the summary buttons ≠ "Jumlah rekod" after you choose a filter | The summary is counted straight from `table('slot_bookings')` | Use `$this->builder($report, $filters)` in `fromSubquery()` |
| `Undefined array key "summary"` in the view | The Lab 9.2 version of `paginate()` is still in use | Replace the whole `paginate()` (step 3) |
| The RPT-03 JUMLAH row changes when you click page 2 | `usageTotals()` receives the current page's rows | Pass `$all`, not `array_slice(...)` |
| Status *Menunggu* (Pending) appears after *Diluluskan* | The result is ordered by MySQL's order | Build `$rows` with the `cases()` loop, not `foreach ($counts …)` |

### ⭐ Bonus challenge
- Add a **pass type** summary for RPT-02 with the same pattern: a `passTypeSummary()` method (subquery + `groupBy('r.pass_type')`) and buttons that filter by `pass_type`. Can you make `statusSummary()` generic with a column parameter, without letting user input reach `groupBy()`?

---

## Lab 9.3b — Excel Summary sheet & PDF summary (S7)

### 🎯 Objective
- Add a second **Ringkasan** (Summary) sheet to the `.xlsx` file with `createSheet()`, a JUMLAH row as an `=SUM()` formula, and `setActiveSheetIndex(0)`.
- Add a status summary table to the PDF.
- Prove that the summary numbers in the files = the summary buttons on screen, because both call `statusSummary()` with the same `$filters`.

### Prerequisites
- [Lab 9.3](#lab-93--pdf-dompdf--excel-phpspreadsheet-export-s3) done: the six export files open.
- [Lab 9.2b](#lab-92b--status-summary--rpt-03-totals-row-s6) done: `statusSummary()` exists.

### Steps

**1. Add a `$summary` parameter** to both public methods in `app/Services/ExportService.php`. The default value `[]` keeps old calls working. Replace the `pdf()` signature line:

`app/Services/ExportService.php`

```php
    public function pdf(string $title, array $columns, iterable $rows, array $meta, array $summary = []): string
```

and the `xlsx()` signature line:

`app/Services/ExportService.php`

```php
    public function xlsx(string $title, array $columns, iterable $rows, array $meta, array $summary = []): string
```

**2. Pass `$summary` to the PDF view.** In `pdf()`, inside the `view('laporan/pdf', [...])` array, add this line directly after `'meta'    => $meta,`:

`app/Services/ExportService.php`

```php
            'summary' => $summary,   // Lab 9.3b
```

**3. Call the Summary sheet in `xlsx()`.** Add this block directly **before** the comment `// Tulis ke memori (bukan fail sementara) dan pulangkan string binari`:

`app/Services/ExportService.php`

```php
        // Lab 9.3b: lembaran kedua "Ringkasan" (RPT-01/02 sahaja; RPT-03 menghantar [])
        if ($summary !== []) {
            $this->addSummarySheet($spreadsheet, $summary);
        }
```

**4. Add `addSummarySheet()`** to `ExportService`, before the last `}` of the class:

`app/Services/ExportService.php`

```php
    /**
     * Lab 9.3b — lembaran "Ringkasan": satu baris setiap status + JUMLAH sebagai FORMULA Excel.
     *
     * @param list<array{value: string, label: string, total: int}> $summary hasil ReportService::statusSummary()
     */
    private function addSummarySheet(Spreadsheet $spreadsheet, array $summary): void
    {
        $sheet = $spreadsheet->createSheet();   // lembaran baharu di hujung (indeks 1)
        $sheet->setTitle('Ringkasan');

        $sheet->fromArray(['Status', 'Bilangan'], null, 'A1');
        $sheet->getStyle('A1:B1')->getFont()->setBold(true);
        $sheet->getStyle('A1:B1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DDEBF7');

        $r = 2;
        foreach ($summary as $s) {
            $sheet->setCellValueExplicit("A{$r}", $s['label'], DataType::TYPE_STRING);
            $sheet->setCellValue("B{$r}", $s['total']);   // nombor → boleh dijumlah
            $r++;
        }

        // Formula, bukan nombor PHP: jika pengguna mengubah angka di atas, Excel mengira semula JUMLAH.
        $sheet->setCellValue("A{$r}", 'JUMLAH');
        $sheet->setCellValue("B{$r}", '=SUM(B2:B' . ($r - 1) . ')');
        $sheet->getStyle("A{$r}:B{$r}")->getFont()->setBold(true);

        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);

        $spreadsheet->setActiveSheetIndex(0);   // fail dibuka pada lembaran data, bukan Ringkasan
    }
```

- Counts are written as **numbers** (they can be summed); labels are written explicitly as strings (as in Lab 9.3).
- JUMLAH is a **formula**. If a user corrects a number in Excel, JUMLAH is recalculated.

**5. Summary table in the PDF.** In `app/Views/laporan/pdf.php`, add this block directly after the line `<p style="margin-top: 8px; font-size: 8pt;">Jumlah rekod: …</p>`:

`app/Views/laporan/pdf.php`

```php
<?php if (($summary ?? []) !== []): ?>
    <!-- Lab 9.3b: ringkasan status — angka sama dengan butang "Ringkasan status" pada skrin -->
    <table style="width: 40%; margin-top: 6px;">
        <thead>
        <tr><th>Status</th><th style="width: 30%">Bilangan</th></tr>
        </thead>
        <tbody>
        <?php foreach ($summary as $s): ?>
            <tr><td><?= esc($s['label']) ?></td><td class="num"><?= number_format($s['total']) ?></td></tr>
        <?php endforeach ?>
        <tr><td><strong>JUMLAH</strong></td><td class="num"><strong><?= number_format(array_sum(array_column($summary, 'total'))) ?></strong></td></tr>
        </tbody>
    </table>
<?php endif ?>
```

**6. Wire it up in the controller.** In `export()` in `app/Controllers/Laporan/ReportController.php`, replace the `$binary = $format === 'pdf' ...` block (3 lines) with:

`app/Controllers/Laporan/ReportController.php`

```php
        // Lab 9.3b: ringkasan status bagi penapis yang SAMA — angka fail = butang ringkasan skrin. RPT-03 → [].
        $summary = $this->reports->statusSummary($report, $filters);

        $binary = $format === 'pdf'
            ? $this->exporter->pdf($title, $this->reports->columns($report), $rows, $meta, $summary)
            : $this->exporter->xlsx($title, $this->reports->columns($report), $rows, $meta, $summary);
```

**7. Test.**

1. `/laporan/tempahan?status=approved` → **Eksport Excel**. The file opens on the data tab. Click the **Ringkasan** tab: one *Diluluskan* row + JUMLAH, with the same number as the summary button on screen.
2. `/laporan/pas` (no filters) → **Eksport Excel** → **Ringkasan** tab → click the JUMLAH cell in column B. Write down what the formula bar shows (Quiz S7). Change one number above it → JUMLAH changes.
3. `/laporan/pas` → **Eksport PDF**. After "Jumlah rekod: *N*" there is a Status/Bilangan (Count) table; JUMLAH = *N*.
4. `/laporan/penggunaan` → **Eksport Excel**. Count the tabs at the bottom of the Excel window (Quiz S7).

**8. Commit.** `git add app/ && git commit -m "RPT: lembaran Ringkasan Excel & ringkasan PDF"`; PowerShell: run `git add` and `git commit` one at a time

### ✅ Checkpoint
- [ ] Excel RPT-01/RPT-02: a second *Ringkasan* tab whose number for each status = the summary button on screen, and the file opens on the data tab (Quiz S7).
- [ ] The JUMLAH cell is an `=SUM(...)` formula; changing one number changes JUMLAH (Quiz S7).
- [ ] PDF RPT-01/RPT-02: a Status/Bilangan table after "Jumlah rekod", and JUMLAH = "Jumlah rekod" (Quiz S7).
- [ ] The RPT-03 Excel file has only one tab (Quiz S7).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Call to undefined method App\Services\ReportService::statusSummary()` | Lab 9.2b is not done | Finish Lab 9.2b step 2 first |
| The Excel file opens on the *Ringkasan* tab | `setActiveSheetIndex(0)` is missing | Add the last line of `addSummarySheet()` |
| The PDF has no summary table and no error | `'summary' => $summary` is not passed in `pdf()` (the view gets `[]` through `?? []`) | Step 2 |
| The JUMLAH cell shows the text `=SUM(B2:B6)` | It was written with `setCellValueExplicit(..., TYPE_STRING)` | Write formulas with `setCellValue()` |
| No *Ringkasan* tab for RPT-01 with a filter that has no records | `statusSummary()` returns `[]` when there are no records | Expected — there is no status to summarise |
| Numbers in the file ≠ the summary buttons on screen | The summary is counted from the raw `$this->request->getGet()` | Pass `$filters` (the `normaliseFilters()` result), as `exportRows()` does |

### ⭐ Bonus challenge
- Add the RPT-03 JUMLAH row (`usageTotals()`) at the end of the RPT-03 export **without** changing the PDF "Jumlah rekod" (which counts the zones). Hint: pass the JUMLAH row as a separate parameter, not as a row in `$rows`.

---

## Lab 9.4b — Testing the summary, JUMLAH & Excel sheet (S8)

### 🎯 Objective
- Write 5 PHPUnit tests that compare the status summary with a direct SQL `GROUP BY` and with hand-calculated numbers, test the RPT-03 weighted average, and read back a real `.xlsx` file.
- Prove with two manual mutations that a test **without filters** can pass falsely.
- Update the `feat/laporan` MR with a new commit on the same branch.

### Prerequisites
- [Lab 9.4](#lab-94--test-report-total--sql-total--explain-s4) done: `ReportServiceTest` is green (7 tests) and the `feat/laporan` MR is open.
- [Lab 9.2b](#lab-92b--status-summary--rpt-03-totals-row-s6) and [Lab 9.3b](#lab-93b--excel-summary-sheet--pdf-summary-s7) done.

### Steps

**1. Add two `use` lines** in `tests/Services/ReportServiceTest.php`, after `use CodeIgniter\Test\DatabaseTestTrait;`:

`tests/Services/ReportServiceTest.php`

```php
use App\Services\ExportService;
use PhpOffice\PhpSpreadsheet\IOFactory;
```

**2. Calculate by hand first** from the Lab 9.4 fixture (5 bookings, 3 pass applications, Zone A 2 active slots, Zone B 1 active slot):

| Test | Hand answer |
|-------|----------------|
| RPT-01 summary, no filters | pending 1, approved 3, rejected 1 |
| RPT-01 summary, June 2026 | pending 1, approved 2, rejected 1 (total 4 = the list) |
| RPT-02 summary, September 2026 | submitted 1, under_review 1 |
| RPT-03 JUMLAH, June 2026 | 3 slots, 15 slot-days, capacity 90 → 16.7 % (not 12.5 %) |
| Excel *Ringkasan* sheet | 2 sheets; `B5` = `=SUM(B2:B4)` = 5 |

**3. Add 5 tests** to the class, directly after `testRpt03KadarPenggunaanJun2026()` and before the fixture comment `/** @var array<string, int> id rekod fixture …`:

`tests/Services/ReportServiceTest.php`

```php
    // =====================================================================
    // Lab 9.4b — Ringkasan status, baris JUMLAH RPT-03 & lembaran Ringkasan
    // =====================================================================

    public function testRingkasanStatusSamaDenganGroupBySql(): void
    {
        $f       = $this->service->normaliseFilters('tempahan', []);
        $summary = array_column($this->service->statusSummary('tempahan', $f), 'total', 'value');

        $sql = $this->db->table('slot_bookings')
            ->select('status')
            ->selectCount('id', 'total')
            ->groupBy('status')
            ->get()
            ->getResultArray();

        // assertEquals: susunan kunci tidak penting; intval kerana MySQLi memulangkan COUNT sebagai string
        $this->assertEquals(array_map('intval', array_column($sql, 'total', 'status')), $summary);
        // assertSame: nilai DAN susunan enum (Pending, Approved, Rejected)
        $this->assertSame(['pending' => 1, 'approved' => 3, 'rejected' => 1], $summary);
    }

    public function testRingkasanIkutJulatTarikhSamaDenganSenarai(): void
    {
        // Jun 2026: #1, #2 (approved), #3 (pending), #4 (rejected). #5 (Julai) di luar julat.
        $f       = $this->service->normaliseFilters('tempahan', ['from' => '2026-06-01', 'to' => '2026-06-30']);
        $summary = array_column($this->service->statusSummary('tempahan', $f), 'total', 'value');

        $this->assertSame(['pending' => 1, 'approved' => 2, 'rejected' => 1], $summary);
        $this->assertSame($this->service->paginate('tempahan', $f, 1)['total'], array_sum($summary));
    }

    public function testRingkasanPasIkutJulatSeptember(): void
    {
        // 30/09 14:00 termasuk; 01/10 00:00 (approved) di luar julat — penapis sama seperti senarai.
        $f       = $this->service->normaliseFilters('pas', ['from' => '2026-09-01', 'to' => '2026-09-30']);
        $summary = array_column($this->service->statusSummary('pas', $f), 'total', 'value');

        $this->assertSame(['submitted' => 1, 'under_review' => 1], $summary);
    }

    public function testJumlahRpt03IalahPurataBerwajaran(): void
    {
        $f      = $this->service->normaliseFilters('penggunaan', ['year' => '2026', 'month' => '6']);
        $totals = $this->service->paginate('penggunaan', $f, 1)['totals'];

        // Zon A 15/60 hari-slot (25.0 %) + Zon B 0/30 (0.0 %) → 15/90 = 16.7 %.
        // Purata peratus zon (25.0 + 0.0) / 2 = 12.5 % ialah SALAH: Zon B (1 slot) diberi berat sama dengan Zon A (2 slot).
        $this->assertSame(3, $totals['total_slots']);
        $this->assertSame(15, $totals['booked_days']);
        $this->assertSame(90, $totals['capacity_days']);
        $this->assertSame(16.7, $totals['utilisation']);
    }

    public function testEksportExcelAdaLembaranRingkasan(): void
    {
        $f      = $this->service->normaliseFilters('tempahan', []);
        $binary = (new ExportService())->xlsx(
            $this->service->title('tempahan'),
            $this->service->columns('tempahan'),
            $this->service->exportRows('tempahan', $f, 'xlsx'),
            ['filters' => 'Ujian', 'user' => 'Ujian', 'generated_at' => '01/01/2026 08:00'],
            $this->service->statusSummary('tempahan', $f),
        );

        // Baca semula fail .xlsx sebenar (bukan objek dalam memori) — inilah yang pengguna buka.
        $file = tempnam(WRITEPATH . 'cache', 'xlsx');
        file_put_contents($file, $binary);
        $book = IOFactory::createReader('Xlsx')->load($file);
        unlink($file);

        $this->assertSame(['RPT-01 Senarai Tempahan TLK', 'Ringkasan'], $book->getSheetNames());
        $this->assertSame(0, $book->getActiveSheetIndex());   // dibuka pada lembaran data

        $sheet = $book->getSheetByName('Ringkasan');
        $this->assertSame('=SUM(B2:B4)', $sheet->getCell('B5')->getValue());   // formula, bukan nombor tetap
        $this->assertSame(5, $sheet->getCell('B5')->getCalculatedValue());     // = 5 tempahan fixture
    }
```

```bash
composer test -- tests/Services/ReportServiceTest.php --testdox
```

**4. Mutation A — the summary query rewritten without filters.** In `statusSummary()`, temporarily replace the line `->fromSubquery($this->builder($report, $filters), 'r')` with:

```php
            // SENGAJA SALAH — jadual terus: penapis diabaikan
            ->from(($report === 'tempahan' ? 'slot_bookings' : 'pass_applications') . ' r')
```

Run again. Write down the tests that fail **and** the summary test that still passes (Quiz S8). Restore the original line → green.

**5. Mutation B — an unweighted average.** In `usageTotals()`, temporarily replace the line `'utilisation' => $capacity > 0 ? …` with:

```php
            // SENGAJA SALAH — purata peratus zon (tanpa wajaran)
            'utilisation'    => $rows === [] ? 0.0 : round(array_sum(array_column($rows, 'utilisation')) / count($rows), 1),
```

Run again and write down the failure message (Quiz S8). Restore → green.

**6. All tests.** `composer test` → all green, including the Day 5–8 tests.

**7. Commit & push to the same MR.**

```bash tab="Git Bash / macOS / Linux"
git add tests/ && git commit -m "RPT: ujian ringkasan status, jumlah RPT-03 & lembaran Excel"
git push    # MR feat/laporan dikemas kini — tiada MR baharu (Hari 4)
```

```powershell tab="PowerShell"
git add tests/
git commit -m "RPT: ujian ringkasan status, jumlah RPT-03 & lembaran Excel"
git push    # MR feat/laporan updated — no new MR (Day 4)
```

After the trainer/neighbour approves the review, **merge** the `feat/laporan` MR into `main` (M3 done; Day 10 starts from `main`).

### ✅ Checkpoint
- [ ] `composer test -- tests/Services/ReportServiceTest.php` → all green (≥ 12 tests: 7 from Lab 9.4 + 5 from Lab 9.4b) (Quiz S8).
- [ ] Mutation A: exactly two tests fail, and the summary test without filters still passes; restored (Quiz S8).
- [ ] Mutation B: `testJumlahRpt03IalahPurataBerwajaran` fails with the value `12.5`; restored (Quiz S8).
- [ ] The *Commits* tab of the `feat/laporan` MR shows the commit `RPT: ujian ringkasan status, …` (Quiz S8).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Class "Tests\Services\ExportService" not found` | The step 1 `use` lines are missing | Add the two `use` lines |
| `Failed asserting that two arrays are identical` with `'approved' => '3'` | `(int)` is missing in `statusSummary()`; MySQLi returns `COUNT` as a string | `'total' => (int) $counts[$case->value]` |
| `tempnam(): file created in the system's temporary directory` | `writable/cache/` is missing or not writable | Recreate the `writable/cache/` folder and make sure it is writable |
| Mutation A: no test fails | `ReportService.php` is not saved yet, or the filtered tests (June, September) were not added | Save the file; check that step 3 added **5** tests |
| `Failed asserting that 16.666666666666668 is identical to 16.7.` | `round(..., 1)` is missing in `usageTotals()` | Round as `usageByZone()` does |

### ⭐ Bonus challenge
- Add a test that `statusSummary('penggunaan', …)` returns `[]` and that the RPT-03 Excel export has only **one** sheet.

---
