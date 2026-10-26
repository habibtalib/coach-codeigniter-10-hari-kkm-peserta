# Lab Day 7 — Pass Module (1): Model, CRUD & Secure Upload

[⬅️ README](./README.md) · [Schedule](../JADUAL.md) · [SPEC canon](../docs/spesifikasi-sistem.md) · [⚡ spark commands](../docs/arahan-spark.md)

| Lab | Session | Time | Outcome |
|-----|---------|------|---------|
| 7.6 | S9 | 09:10–10:00 | Claude Code verified; course-standard `CLAUDE.md`; `CLAUDE.local.md`; Plan mode |
| 7.9 | S12 | 10:05–10:30 | `docs/nota-claude.md` (3 onboarding prompts); practice PRD `~/latihan/prd-latihan/docs/prd.md` + slice plan + 2 fixes |
| 7.7 | S10 | 11:00–11:45 | `semak-ci4` subagent + `docs/semakan-ci4-hari6.md`; `migration-ci4` skill |
| 7.8 | S11 | 11:55–12:30 | `ci4-spark` MCP server tested & registered in `.mcp.json`; Context7; MySQL/GitLab optional |
| 7.0 | Start of S1 | 10 min | Git branch + `php.ini` ready for uploads |
| 7.1 | S1 | 09:10–10:00 | Enums, Entity, 2 Models |
| 7.1b | S5 | 10:00–10:30 | `PassType::icon()`, `PassStatus::pending()`, `validityDays()`/`daysRemaining()` tested in `php spark shell` |
| 7.2 | S2 | 10:45–12:00 | Routes, Service (`canView`), list & detail |
| 7.2b | S6 | 12:00–12:30 | `?pass_type=` filter + `?q=` search (proof of the `orLike()` leak without brackets) |
| 7.3 | S3 | 14:30–15:30 | Form + validation + upload + download |
| 7.3b | S7 | 15:30–16:00 | Follow-up documents (max. 3 per application, `FOR UPDATE` lock) |
| 7.4 | S4 | 16:00–16:35 | 17 boundary test cases recorded |
| 7.4b | S8 | 16:35–17:00 | PHPUnit `PassSubmitTest`: 14 automated boundary cases + `>=` mutation |

> ℹ️ **Day 7 schedule (updated):** Labs 7.6, 7.9, 7.7 and 7.8 (Claude Code) in the morning; Labs 7.0, 7.1 and 7.2 (+7.1b/7.2b if time allows) start at 14:30. Lab 7.3, 7.4 (and 7.3b/7.4b) continue on Day 8 morning. The 7.0–7.4b times in the table above are the original schedule.

---

## Lab 7.6 — Claude Code: Install, Log In & Project CLAUDE.md (S9)

> 🛡️ **Data rules (Lab 7.6–7.8).** **Synthetic** data only. Never give Claude the contents of `.env`, passwords or tokens. Never connect Claude Code or an MCP server to a real KKM/eSPKP system, codebase or database. Full *Allowed / Not allowed* table: [Claude Code tutorial — Data rules](../docs/tutorial-claude-code.md#️-data-rules-read-first).

### 🎯 Objective
Confirm Claude Code works in `kelas-ci-<nama>`, generate `CLAUDE.md` with `/init` and **rewrite it** to the course standard (stack, commands, folder conventions, rules), tell user/project/local memory apart with `/memory`, and use *Plan* mode to ask about the Day 6 code without changing any files.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- [Claude Code tutorial](../docs/tutorial-claude-code.md) §1–§5 done (done before Lab 6.3c): `claude --version` works, you are logged in with your own Claude account, and `.claude/settings.json` exists.
- Project `kelas-ci-<nama>` with the Day 6 (TLK) code committed; `git status` is clean.

### Steps

1. **Check the installation (5 min).** In the VS Code Git Bash terminal:

   ```bash
   claude --version
   claude doctor
   ```

   Expected: version `2.1.x (Claude Code)` and `claude doctor` with no errors. Not installed yet? Follow [tutorial §2–§4](../docs/tutorial-claude-code.md#2-install) now (PowerShell: `irm https://claude.ai/install.ps1 | iex`), then reopen VS Code.

2. **A branch for the Claude Code work**, and start a session in the project root:

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/latihan/kelas-ci-<nama>
   git switch main && git pull
   git switch -c chore/claude-code
   claude
   ```

   ```powershell tab="PowerShell"
   cd $HOME\latihan\kelas-ci-<nama>
   git switch main
   git pull
   git switch -c chore/claude-code
   claude
   ```

   In Claude Code, type `/status` (your account) and `/permissions` (the *Deny* tab lists 4 `Read(...)` rules). No rules? Create `.claude/settings.json` from [tutorial §5](../docs/tutorial-claude-code.md#5-project-settings-block-env) first.

3. **Generate a draft with `/init`.** Type:

   ```text
   /init
   ```

   Claude reads `composer.json`, `app/` and `tests/`, then proposes a `CLAUDE.md` (or improvements if the file already exists from Lab 6.3c). Read the *diff* and approve it. Open `CLAUDE.md` in VS Code: note **one** thing that is correct and **one** that is wrong or missing (e.g. the test command, the test DB name, the `.env` rule).

4. **Rewrite `CLAUDE.md` to the course standard.** Replace the file's contents with this template, then adjust the parts marked `<…>`. Keep it under 200 lines.

   `CLAUDE.md`

   ```markdown
   # CLAUDE.md — kelas-ci-<nama>

   CI-KKM-10 training project (KKM): 4 CodeIgniter 4 modules — TLK, Pass, Report, Statistics.
   Canon for table/field/enum/class names: the course SPEC (docs/spesifikasi-sistem.md on pelatih.my).

   ## Your role (Claude)
   - Explainer and reviewer, NOT a module generator. Explain first; I write the code.
   - Before suggesting a commit: explain every change line by line and wait until I understand.
   - Answer in English; keep technical terms as they are (route, filter, controller, view).

   ## Stack
   - CodeIgniter 4.7 + Shield 1.x, PHP 8.2+, MySQL 8 (Laragon), Bootstrap 5.3, PHPUnit.
   - Dev DB: kkm_latihan · Test DB: kkm_latihan_test (MySQL, not SQLite — FOR UPDATE is needed).
   - Windows + Laragon; Git Bash terminal.

   ## Commands
   - Dev server: `php spark serve` → http://localhost:8080
   - Tests: `composer test` (one file: `composer test -- --no-coverage tests/tlk/BookingServiceTest.php`)
   - Migration: `php spark migrate --all` · status: `php spark migrate:status`
   - Seeder: `php spark db:seed DatabaseSeeder`
   - Routes & filters: `php spark routes` · `php spark filter:check GET /pas/permohonan`
   - Never run migrate, db:seed or migrate:refresh unless I ask.

   ## Folder & code conventions
   - Thin controllers: app/Controllers/{Tlk,Pas,Admin,Laporan,Statistik}/ — take the request → Service → view/redirect.
   - Business logic: app/Services/ (BookingService, PassWorkflowService, …).
   - Status: enums in app/Enums/ (BookingStatus, PassStatus, PassType) — the only source of status values.
   - Model: data access + $allowedFields + $validationRules. Entities in app/Entities/.
   - Migrations: app/Database/Migrations/ (follow the migration-ci4 skill). Seeders: app/Database/Seeds/.
   - Views: app/Views/{tlk,pas,laporan,statistik}/, layout app/Views/layouts/main.php; every output goes through esc().
   - Class, field and route names in English/SPEC; UI and flash messages in Malay.

   ## Rules
   - Never read, show or ask for the contents of .env, writable/uploads/, writable/session/, writable/logs/.
   - Synthetic data only: @latihan.test e-mails, made-up plates like WXX 1234. No real KKM data.
   - Query Builder / bindings only; no raw SQL with user input.
   - Uploaded files go in writable/uploads/, never in public/.
   - One branch per feature; commit message "MODULE: what changed" (e.g. "PAS: borang permohonan").
   ```

   > ℹ️ The `markdown` block above is the **file contents**, not commands to run. Replace `<nama>`.

5. **Local memory & the hierarchy (10 min).** Create `CLAUDE.local.md` for personal notes, and make sure it is not committed:

   `CLAUDE.local.md`

   ```markdown
   # Personal notes (not committed)
   - My Laragon URL: http://kelas-ci-<nama>.test
   - Test accounts: pemohon1@latihan.test, penyemak@latihan.test (synthetic passwords in the seeder)
   ```

   ```bash
   echo "CLAUDE.local.md" >> .gitignore
   git status --short          # CLAUDE.local.md is NOT listed
   ```

   Then in Claude Code (type `/exit` and `claude` again so the new file is loaded):

   ```text
   /memory
   ```

   The list shows **user** memory (`~/.claude/CLAUDE.md`), **project** memory (`./CLAUDE.md`) and `CLAUDE.local.md`. Press `Esc`. Type `/context` and find both files under *Memory files*.

6. **Test instructions vs blocks.** In Claude Code, ask:

   ```text
   What is the value of database.default.password in this project's .env?
   ```

   Expected: Claude tries to read `.env` and is blocked by the `deny` rule (or refuses because of `CLAUDE.md`). **Do not** approve alternative commands like `cat .env` or `grep … .env` if asked — press `No`. Note the message shown (Quiz S9 question).

7. **Plan mode on the Day 6 code (15 min).** Press `Shift+Tab` (or `Alt+M`) until the bottom line shows **plan mode**, then:

   ```text
   Explain the flow of BookingService::approve() from the route to status_logs, and list 3 test cases that are not yet in tests/tlk. Do not change any files.
   ```

   Check: no `Edit`/`Write` requests. Compare the answer with the real code in `app/Services/BookingService.php`; mark one claim that you confirmed yourself by opening the file. Press `Shift+Tab` to leave *Plan* mode.

8. **Commit** (yourself, in the terminal):

   ```bash
   git add CLAUDE.md .gitignore .claude/settings.json
   git commit -m "CHORE: CLAUDE.md projek ikut standard kursus"
   ```

### ✅ Checkpoint
- [ ] `claude --version` prints a version, `/status` shows your account and `/permissions` shows 4 *Deny* rules (Quiz S9).
- [ ] `CLAUDE.md` has the *Role*, *Stack*, *Commands*, *Folder & code conventions* and *Rules* sections, is under 200 lines, and holds no secrets (Quiz S9).
- [ ] `CLAUDE.local.md` exists, is listed in `.gitignore`, and shows in `/memory` (Quiz S9).
- [ ] The step 6 `.env` question is refused without revealing a value, and the step 7 *Plan* mode answer changed no files (Quiz S9).
- [ ] The commit `CHORE: CLAUDE.md projek ikut standard kursus` is in the `git log` of branch `chore/claude-code` (Quiz S9).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `claude: command not found` | Terminal opened before the install | Close all VS Code windows and reopen; [tutorial §2](../docs/tutorial-claude-code.md#2-install) |
| `/init` writes a long English `CLAUDE.md` | Default behaviour | Replace it with the step 4 template; the template is the course standard |
| `CLAUDE.local.md` does not appear in `/memory` | File created after the session started | `/exit`, then `claude` again |
| `CLAUDE.local.md` appears in `git status` | `.gitignore` not updated or the line is misspelt | Check `cat .gitignore`; the exact file name is `CLAUDE.local.md` |
| `Shift+Tab` does not switch modes | Windows terminal without VT input mode | `Alt+M` |
| Claude reads `.env` | `.claude/settings.json` missing or invalid JSON | `claude doctor`; fix the file ([tutorial §5](../docs/tutorial-claude-code.md#5-project-settings-block-env)) |

### ⭐ Bonus challenge
- Add one path-scoped rule: create `.claude/rules/views.md` with the frontmatter `paths: ["app/Views/**"]` that reminds about `esc()` and `csrf_field()`. Check with `/context` that it only loads after Claude reads a view file.

---

## Lab 7.9 — Prompting: Existing Project, New Project & PRD (S12)

> 🛡️ **Synthetic data only.** The practice idea is made up; do not use real KKM names, complaints or systems. The practice PRD is saved in a separate practice folder `~/latihan/prd-latihan/`, **not** in `kelas-ci-<nama>`, and it is **not** a change to the course SPEC.

### 🎯 Objective
Write three onboarding prompts in *Plan* mode on the `kelas-ci-<nama>` project and record the verified answers, draft a small PRD for a practice idea through an interview with Claude, ask for a *vertical slice* plan without code, and review the PRD critically and fix 2 issues yourself. Reference: [`tutorial-prompt-projek.md`](../docs/tutorial-prompt-projek.md) · prompts [AI-15..AI-18](../docs/pustaka-prompt.en.md#f--project--prd).

### Prerequisites
- Lab 7.6 done: the project `CLAUDE.md` is committed and you know how to switch to *Plan* mode (`Shift+Tab` or `Alt+M`).
- 🪟 **Windows:** Git Bash terminal in VS Code. For command blocks with two tabs: choose **PowerShell** if your terminal is PowerShell.

### Steps

1. **Onboarding an existing project (8 minutes).** In `kelas-ci-<nama>`, start `claude`, switch to **plan mode**, and send these three prompts one at a time ([AI-15](../docs/pustaka-prompt.en.md#ai-15--onboarding-an-existing-project)):

   ```text
   Explain this project's structure in 10 lines: the main folders in app/, the role of each, and where the tests are. Do not change files.
   ```

   ```text
   Where does the TLK booking approval logic live? List the files and method names, from the route to status_logs.
   ```

   ```text
   Trace one request: POST /tlk/tempahan from the route, filter, controller, service, model to the redirect. Show the file name at each step.
   ```

   For each answer, open **one** file it mentions and verify that claim yourself. Record it in a new file `docs/nota-claude.md` (you type it, not Claude):

   `docs/nota-claude.md`

   ```markdown
   # Claude Code onboarding notes — kelas-ci-<nama>

   | # | Prompt | Answer summary (3 lines) | Verified in file | Correct? |
   |---|--------|--------------------------|------------------|----------|
   | 1 | Project structure | ... | app/... | Yes / Partly / No |
   | 2 | TLK approval logic | ... | app/Services/BookingService.php | ... |
   | 3 | POST /tlk/tempahan flow | ... | app/Config/Routes.php | ... |
   ```

   Press `Shift+Tab` to leave *Plan* mode, then type `/exit`.

2. **Practice folder for a new project.** The practice PRD does **not** go into `kelas-ci-<nama>`:

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p ~/latihan/prd-latihan/docs
   cd ~/latihan/prd-latihan
   git init
   claude
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force $HOME\latihan\prd-latihan\docs
   cd $HOME\latihan\prd-latihan
   git init
   claude
   ```

3. **PRD interview (10 minutes).** Stay in the default mode (**not** *accept edits*) so Claude asks permission before writing a file. Send ([AI-16](../docs/pustaka-prompt.en.md#ai-16--prd-interview)):

   ```text
   I want to build a small web application: Facility Damage Complaints. Staff report damage to office facilities (lifts, air conditioners, lights), and technicians update the complaint status.
   Interview me to draft a PRD. Ask ONE question at a time, at most 8 questions, covering: problem, users & roles, in/out of scope, functional requirements, business rules, security, data/entities, acceptance criteria.
   After the interview, draft docs/prd.md with the sections: Problem, Users & roles, Scope, Functional requirements (FR-01..), Business rules (BR-01..), NFR, Data/entities, Acceptance criteria (AC-01.., Given/When/Then format), Milestones.
   Limit it to 2 roles and 5 functional requirements. Synthetic data only. Do not write code.
   ```

   Answer Claude's questions briefly. If you get stuck, use these answers:

   | Topic | Practice answer |
   |-------|-----------------|
   | Roles | `pelapor` (staff reporter) and `juruteknik` (technician) |
   | Requirements | Submit a complaint · see own complaints · list all complaints (technician) · change status · add an action note |
   | Status | `baru` → `dalam_tindakan` → `selesai` |
   | Out of scope | SMS notifications, a mobile app, spare-parts inventory |

   When Claude asks permission to write `docs/prd.md`, **read the draft first**, then approve. Check: exactly 2 roles, FR-01..FR-05, every FR has at least one AC.

4. **A *vertical slice* plan without code (5 minutes).** Switch to **plan mode** and send ([AI-17](../docs/pustaka-prompt.en.md#ai-17--prd--vertical-slice-plan)):

   ```text
   Plan mode. Read @docs/prd.md. Break it into vertical slices (at most 4). Each slice: short name, the FR/BR/AC it meets, the CodeIgniter 4.7 files involved, how to test. Order them by dependency. Mark any FR that is in no slice. Do not write code.
   ```

   If Claude offers to implement the plan, choose **No** / keep planning. Type the slice names yourself in the *Milestones* section of `docs/prd.md` (e.g. `M1 — Slice 1: pelapor menghantar aduan (FR-01, AC-01)`). Check `git status`: only `docs/prd.md` exists, no PHP files.

5. **Review the PRD critically (5 minutes).** Still in **plan mode** ([AI-18](../docs/pustaka-prompt.en.md#ai-18--review-a-prd)):

   ```text
   Plan mode. Review @docs/prd.md critically as a tester and system owner. Do not change files. List at most 6 issues in a table (section · issue · why it matters · suggested fix): missing roles, unclear BRs, untestable ACs, FRs without an AC, scope creep, data with no owner.
   ```

   Pick **2** issues and fix them **yourself** in VS Code (example: change "complaints are handled immediately" into a testable BR; add the AC "reporter B opens reporter A's complaint → 404"). Add a `## Log perubahan` (change log) section at the end of the PRD with two lines: date · change · reason.

6. **Commit (yourself).**

   ```bash tab="Git Bash / macOS / Linux"
   git add docs/prd.md
   git commit -m "PRD: draf Aduan Kerosakan Kemudahan + 2 pembetulan semakan"
   cd ~/latihan/kelas-ci-<nama>
   git add docs/nota-claude.md
   git commit -m "CHORE: nota onboarding Claude Code"
   ```

   ```powershell tab="PowerShell"
   git add docs/prd.md
   git commit -m "PRD: draf Aduan Kerosakan Kemudahan + 2 pembetulan semakan"
   cd $HOME\latihan\kelas-ci-<nama>
   git add docs/nota-claude.md
   git commit -m "CHORE: nota onboarding Claude Code"
   ```

### ✅ Checkpoint
- [ ] `docs/nota-claude.md` in `kelas-ci-<nama>` records the 3 onboarding prompts, each with a file you opened yourself to verify the answer (Quiz S12).
- [ ] `~/latihan/prd-latihan/docs/prd.md` has 2 roles, FR-01..FR-05, at least one BR and one AC for every FR (Quiz S12).
- [ ] The *Milestones* section lists the slices from the *Plan* mode plan, and `git status` in `prd-latihan` shows no code files (Quiz S12).
- [ ] Two issues from the AI-18 review were fixed by you and recorded in `## Log perubahan` (Quiz S12).
- [ ] `git log --oneline` in `prd-latihan` shows the `PRD: …` commit. 🪟 PowerShell: `git -C $HOME\latihan\prd-latihan log --oneline` (Quiz S12).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Claude writes the PRD straight away without asking | The prompt did not say "ONE question at a time" | `Esc`, then send the full AI-16 prompt again |
| Claude generates PHP files or `composer.json` | *Accept edits* mode is on, or you approved the plan | Refuse (`No`); delete the file; use **plan mode** for steps 4–5 |
| `docs/prd.md` is written in `kelas-ci-<nama>` | `claude` was started in the wrong folder | Move the file to `~/latihan/prd-latihan/docs/`; `git restore --staged` if it was already `add`ed |
| The PRD is too long (10+ FRs) | No limit was given | Ask: "Limit it to the 5 most important FRs; move the rest to Out of scope" |
| An onboarding answer names a file that does not exist | Claude guessed | Record "No" in `docs/nota-claude.md`; this is proof of why every claim must be verified |

### ⭐ Bonus challenge
- Ask Claude (*Plan* mode) to compare your practice PRD with the M1 TLK section in [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md): what is in the SPEC but not in the PRD (tables, fields, enums, routes)? Write 3 lines in `docs/nota-claude.md` about the difference between a PRD and a SPEC.

---

## Lab 7.7 — Subagents & Skills for a CI4 Project (S10)

> 🛡️ Same data rules as [Lab 7.6](#lab-76--claude-code-install-log-in--project-claudemd-s9): synthetic only, no `.env`, no KKM systems.

### 🎯 Objective
Create a read-only subagent `semak-ci4` and **use it** to security-review your own Day 6 code (`esc()`, CSRF, filters/permissions, Query Builder bindings, validation), **record** the findings in `docs/semakan-ci4-hari6.md`, then create a `migration-ci4` skill and **show** that the skill loads when Claude drafts a migration.

### Prerequisites
- [Lab 7.6](#lab-76--claude-code-install-log-in--project-claudemd-s9) done; you are on branch `chore/claude-code`.
- The Day 6 TLK code (`app/Controllers/Tlk/`, `app/Services/BookingService.php`, `app/Views/tlk/`) is in the project.

### Steps

1. **Create the folders** (Git Bash):

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p .claude/agents .claude/skills/migration-ci4
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force .claude\agents, .claude\skills\migration-ci4
   ```

2. **Subagent `semak-ci4`.** Create this file in VS Code:

   `.claude/agents/semak-ci4.md`

   ```markdown
   ---
   name: semak-ci4
   description: CodeIgniter 4 security reviewer (READ ONLY). Use after writing or changing a controller, view, model, route or filter, or when asked to security-review CI4 code.
   tools: Read, Grep, Glob
   model: sonnet
   ---

   You are a CodeIgniter 4.7 + Shield security reviewer for the KKM training project.
   You do NOT change files. You only read, search and report.
   Never read .env, writable/uploads/, writable/session/ or writable/logs/.

   Check the given files or folders for these five things:

   1. View output: every variable in a view is printed through esc()
      (`<?= esc($x) ?>`, context `esc($x, 'attr')` / `'url'` / `'js'`).
      Raw `<?= $x ?>` for user data = a finding.
   2. CSRF: `csrf` in `Config\Filters::$globals['before']`; every POST form uses
      `csrf_field()` or `form_open()`; data changes only through POST, not GET.
   3. Filters & permissions: every module route has a `session` / `permission:...` /
      `group:...` filter (see app/Config/Routes.php and `php spark routes` if output is given);
      the Service checks ownership (`ownedBy()`, 404 for non-owners).
   4. Query Builder: no user input concatenated into SQL
      (`query("... $x")`, `where("col = $x")`, `orderBy($this->request->getGet(...))` without an allow-list).
      Correct: `where('col', $x)`, `query($sql, [$x])`, `like()` inside `groupStart()`.
   5. Validation & mass assignment: `$this->validate()` or the Model's `$validationRules`;
      the controller does not pass the full `getPost()` to `insert()`/`update()`;
      `status`, `user_id`, `approved_by` are set by the Service, not by the form.

   Answer format (English):
   - Table: | File:line | Category (1–5) | Severity (High/Medium/Low) | Finding | Suggestion |
   - Only findings you saw in the code; quote the real line. Do not guess.
   - End with "No findings" for each category that is clean.
   ```

   Go back to Claude Code (no need to leave *Plan* mode). The `.claude/agents/` folder was just created, so type `/exit` and `claude` again once.

3. **Run the review on your Day 6 code.** In *Plan* mode:

   ```text
   Use the semak-ci4 subagent to review app/Controllers/Tlk, app/Views/tlk and app/Config/Routes.php.
   ```

   Expected: a `semak-ci4` line appears (the subagent is running), then a table of findings. Check **every** finding by opening that file:line yourself. Record them in a new file:

   `docs/semakan-ci4-hari6.md`

   ```markdown
   # Day 6 security review (semak-ci4 subagent)

   | # | File:line | Category | AI finding | Verified? (Yes/No — why) | Action |
   |---|-----------|----------|------------|--------------------------|--------|
   | 1 |           |          |            |                          |        |
   ```

   At least 3 rows. If the review is clean, write the finding "No findings" for each category and **one** test you did to confirm it (e.g. open a form and check `csrf_test_name` in *View Source*).

4. **Test the tool limits.** Still in the same session, ask:

   ```text
   Use the semak-ci4 subagent to fix the first finding in that file itself.
   ```

   Watch its answer (Quiz S10 question). The real fix, if any, you make yourself on the Day 6 branch after today's class — not now.

5. **Skill `migration-ci4`.** Create:

   `.claude/skills/migration-ci4/SKILL.md`

   ```markdown
   ---
   name: migration-ci4
   description: Migration & seeder conventions of the CI-KKM-10 course (CodeIgniter 4, MySQL). Use when writing, drafting or reviewing a migration, a seeder, or a table schema change.
   argument-hint: "[table name]"
   ---

   Follow these conventions for migrations and seeders in this project. Target table: $ARGUMENTS

   ## Migration
   - Generate the skeleton with `php spark make:migration CreateNamaJadual` (file
     app/Database/Migrations/YYYY-MM-DD-HHMMSS_CreateNamaJadual.php). One table per file.
   - `public function up(): void` and `public function down(): void`; `down()` fully reverses `up()`.
   - `id`: `['type' => 'INT', 'unsigned' => true, 'auto_increment' => true]` + `addKey('id', true)`.
   - Foreign keys: the SAME type as the parent field (INT unsigned);
     `addForeignKey('medan', 'induk', 'id', 'CASCADE', 'RESTRICT')`, or `'SET NULL'` if the field can be NULL.
   - Status/type: VARCHAR(20) holding the PHP enum value (app/Enums/), NOT a MySQL ENUM.
   - `created_at`, `updated_at`, `deleted_at`: DATETIME null (soft delete if the SPEC says so).
   - `createTable('nama', true)` and `dropTable('nama', true)` (IF [NOT] EXISTS).
   - File order follows the ERD dependencies: parent before child.
   - Never change a migration that has already run: write a new migration (e.g. AddXToY).
   - Add fields to the Shield `users` table through a separate migration; never edit vendor/.
   - Table & field names EXACTLY as in the SPEC; if the table is not in the SPEC, mark it as "training".

   ## Seeder
   - app/Database/Seeds/; DatabaseSeeder calls the other seeders in parent → child order.
   - Synthetic data only: @latihan.test e-mails, made-up plates like WXX 1234, made-up names.

   ## How to work
   - Draft the code and explain every field, index and FK in English.
   - NEVER run `php spark migrate`, `migrate:rollback`, `migrate:refresh` or `db:seed`.
     Print the command for the participant to run themselves.
   ```

   New skills are picked up without a restart. If `/migration-ci4` does not appear when you type `/mig`, type `/reload-skills`.

6. **See the skill load.** In *Plan* mode, ask for a draft for a **training** table (not in the SPEC; do not save or commit it):

   ```text
   Draft a migration for the training table pass_comments: application_id (FK to pass_applications), user_id (FK to users), body (TEXT), created_at. Do not write any files.
   ```

   Expected: Claude Code shows that the `migration-ci4` skill is loaded, and the draft has `INT unsigned` on both FKs, `addForeignKey(...)`, `createTable('pass_comments', true)`, `down()` with `dropTable(..., true)`, and the `php spark migrate` command **printed**, not run. Then try the slash command form:

   ```text
   /migration-ci4 vehicle_notes
   ```

   Note in `docs/semakan-ci4-hari6.md` (new *Skill* section) two skill rules you saw followed in the draft.

7. **Commit** the agent, the skill and the report:

   ```bash
   git add .claude/agents/semak-ci4.md .claude/skills/migration-ci4/SKILL.md docs/semakan-ci4-hari6.md
   git commit -m "CHORE: subagent semak-ci4, skill migration-ci4 & semakan Hari 6"
   ```

### ✅ Checkpoint
- [ ] `.claude/agents/semak-ci4.md` has the frontmatter `name`, `description`, `tools: Read, Grep, Glob` and `model`, and the subagent ran on `app/Controllers/Tlk` (Quiz S10).
- [ ] `docs/semakan-ci4-hari6.md` has ≥ 3 finding rows with the *Verified?* column filled in by you (Quiz S10).
- [ ] The step 4 "fix it yourself" request did **not** change any file (Quiz S10).
- [ ] The `pass_comments` draft follows the `migration-ci4` skill (FK `INT unsigned`, `createTable(..., true)`, `migrate` command printed only) and there is no new migration file in `git status` (Quiz S10).
- [ ] The commit `CHORE: subagent semak-ci4, skill migration-ci4 & semakan Hari 6` is in `git log` (Quiz S10).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Claude reviews by itself, `semak-ci4` does not run | The `.claude/agents/` folder was created in the current session | `/exit` and `claude` again; or type `@agent-semak-ci4` |
| Subagent silently ignored | Bad frontmatter (no opening `---`, no `name`, misspelt field) | The file's first line must be `---`; unknown fields are ignored without an error |
| `/migration-ci4` does not appear | The `skills/` folder is new; or the file name is not `SKILL.md` | `/reload-skills`; the exact name is `SKILL.md` (upper case) in `.claude/skills/migration-ci4/` |
| Draft does not follow the skill | `description` does not match the request | Say "migration" in the request, or use `/migration-ci4` directly |
| Claude tries to write the migration file | *Plan* mode not active | Refuse (`No`); `Shift+Tab` / `Alt+M` to **plan mode** |
| Notepad saves `SKILL.md.txt` | Hidden Windows file extensions | Create the file in VS Code, not Notepad |

### ⭐ Bonus challenge
- Create a second subagent `semak-ujian` (`tools: Read, Grep, Glob, Bash`) that may only run `composer test`. Write in its instructions that it must report the number of passed/failed tests and must not change files. Discuss with the trainer: why does `Bash` make this subagent riskier than `semak-ci4`?

---

## Lab 7.8 — MCP: ci4-spark, MySQL, Context7 & GitLab (S11)

> 🛡️ Same data rules as [Lab 7.6](#lab-76--claude-code-install-log-in--project-claudemd-s9). **Never point an MCP server at a KKM/eSPKP database.** Only the `kkm_latihan` training DB in your Laragon.

### 🎯 Objective
Install the `ci4-spark` MCP server (PHP, read only) from the course template, **test it** with hand-written JSON-RPC messages, register it for the project with `.mcp.json`, use the `routes`/`filter_check` tools through Claude Code, and add Context7 for current CodeIgniter 4/Shield documentation. MySQL (read only) and GitLab are optional/demo parts.

| Part | Status | Time |
|------|--------|------|
| A. `ci4-spark` | Required | 15 min |
| B. Context7 | Required | 5 min |
| C. MySQL read only | If time allows (or homework) | 10 min |
| D. GitLab GitLab KKM | Trainer demo; try it if GitLab KKM supports it & the network allows | 5 min |

### Prerequisites
- [Lab 7.7](#lab-77--subagents--skills-for-a-ci4-project-s10) done; branch `chore/claude-code`.
- `php` on the `PATH`: `php -v` works in Git Bash **and** PowerShell (Laragon: *Menu → Tools → Path → Add Laragon to Path*).
- Template [`templates/kod/ci4-spark-mcp.php.txt`](../templates/kod/ci4-spark-mcp.php.txt) (**Templat & Rujukan** module on pelatih.my).

### Steps

**A. `ci4-spark` server (required)**

1. **Copy the template** to `tools/ci4-spark-mcp.php` in the project root (VS Code: new file → paste the template contents). Check the syntax:

   ```bash
   php -l tools/ci4-spark-mcp.php
   ```

   Expected: `No syntax errors detected in tools/ci4-spark-mcp.php`. Read the file for 3 minutes: find `tools()` (4 tools), `callTool()` (input-checking regexes) and `spark()` (`proc_open()` with an array, no shell).

2. **JSON-RPC test file.** Create `tools/ujian-mcp.jsonl` — **one JSON message per line**, exactly as below:

   `tools/ujian-mcp.jsonl`

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"ujian","version":"0"}}}
   {"jsonrpc":"2.0","method":"notifications/initialized"}
   {"jsonrpc":"2.0","id":2,"method":"tools/list"}
   {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"filter_check","arguments":{"method":"GET","path":"/tlk/tempahan"}}}
   {"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"db_table","arguments":{"table":"users; DROP TABLE users"}}}
   {"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"migrate","arguments":{}}}
   ```

3. **Run the server with that file as stdin:**

   ```bash tab="Git Bash / macOS / Linux"
   php tools/ci4-spark-mcp.php < tools/ujian-mcp.jsonl
   ```

   ```powershell tab="PowerShell"
   Get-Content tools\ujian-mcp.jsonl | php tools\ci4-spark-mcp.php
   ```

4. **Read every reply** (one JSON line per `id`; the `[ci4-spark] started…` line is stderr):

   | `id` | Expected |
   |------|----------|
   | 1 | `"protocolVersion":"2025-06-18"`, `"serverInfo":{"name":"ci4-spark",…}` |
   | — | No reply to `notifications/initialized` (a notification) |
   | 2 | 4 tools: `routes`, `migrate_status`, `db_table`, `filter_check`, each with `"readOnlyHint":true` |
   | 3 | `"isError":false`, text starting `$ php spark filter:check GET /tlk/tempahan`, with the `session` filter in the *Before Filters* column |
   | 4 | Note the exact reply (Quiz S11 question) |
   | 5 | `"error":{"code":-32602,"message":"Unknown tool: migrate"}` |

5. **Register it for the project (`.mcp.json`).** In Git Bash (not inside a `claude` session):

   ```bash
   claude mcp add --scope project ci4-spark -- php tools/ci4-spark-mcp.php
   cat .mcp.json
   ```

   Expected `.mcp.json` (the same as writing it by hand):

   ```json
   {
     "mcpServers": {
       "ci4-spark": {
         "type": "stdio",
         "command": "php",
         "args": [
           "tools/ci4-spark-mcp.php"
         ],
         "env": {}
       }
     }
   }
   ```

   🪟 PowerShell: if the `--` gets lost and `claude mcp add` reports an unknown option, run the command in Git Bash, or write the `.mcp.json` above by hand.

6. **Approve and use it.** Start `claude`. Claude Code asks whether to use the servers from `.mcp.json`: choose to allow `ci4-spark`. Type `/mcp`: `ci4-spark` shows as *connected* with 4 tools. Then:

   ```text
   Use the ci4-spark tools: list the TLK module routes and the filters for GET /tlk/tempahan. Is every TLK route protected by the session filter?
   ```

   Approve each MCP tool call (`ci4-spark - routes`, `ci4-spark - filter_check`). Compare the answer with `php spark routes`, run by you.

**B. Context7 (required)**

7. **Add Context7** (a remote HTTP server; no Node needed). In the terminal:

   ```bash
   claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
   claude mcp list
   ```

   Expected: `context7: https://mcp.context7.com/mcp (HTTP) - ✔ Connected`. Optional API key (higher rate limits): add `--header "Authorization: Bearer <kunci>"` — never commit the key.

8. **Ask for current documentation** in `claude`:

   ```text
   Use context7: in CodeIgniter Shield, how does $matrix in Config\AuthGroups give permissions to groups, and how is the permission: filter used on a route?
   ```

   Expected: a `resolve-library-id` call, then `query-docs`. Compare with your `app/Config/AuthGroups.php` (Day 4).

**C. MySQL read only (if time allows)**

9. **Node 20+.** Laragon Full ships with Node.js:

   ```bash
   node -v      # must be v20 or newer
   ```

   Older or missing? Install Node.js LTS from <https://nodejs.org>, then close and reopen VS Code.

10. **A `SELECT`-only MySQL user.** Laragon → *Database* (HeidiSQL) → *Query* tab, as `root`:

    ```sql
    CREATE USER 'claude_ro'@'127.0.0.1' IDENTIFIED BY 'BacaSahaja-2026';
    GRANT SELECT, SHOW VIEW ON kkm_latihan.* TO 'claude_ro'@'127.0.0.1';
    ```

    Two layers: the MCP server blocks `INSERT`/`UPDATE`/`DELETE` by default, **and** this user cannot write even if the server is misconfigured.

11. **Register with `local` scope** (the credentials stay in your `~/.claude.json`, not in the repo). One line, in Git Bash:

    ```bash
    claude mcp add mysql-kelas -e MYSQL_HOST=127.0.0.1 -e MYSQL_PORT=3306 -e MYSQL_USER=claude_ro -e MYSQL_PASS=BacaSahaja-2026 -e MYSQL_DB=kkm_latihan -- npx -y @benborla29/mcp-server-mysql
    ```

    In `claude`, `/mcp` → `mysql-kelas` *connected*. Ask:

    ```text
    Use mysql-kelas: how many rows are in slot_bookings by status? Then try to INSERT one test row into departments.
    ```

    Expected: the `GROUP BY status` count works; the `INSERT` is refused (by the server or by MySQL: `INSERT command denied to user 'claude_ro'`).

    > ℹ️ Want to share the config in `.mcp.json`? Write `"MYSQL_PASS": "${MYSQL_PASS}"` in the `env` block and set the `MYSQL_PASS` *environment variable* on each participant's laptop before `claude` starts. Never write the real password in `.mcp.json`.

**D. GitLab GitLab KKM (trainer demo)**

12. **Official option: GitLab's built-in MCP server.** Available in GitLab 18.6+ (beta), all tiers since 19.2, GA in 19.5; the instance administrator must allow MCP access. If GitLab KKM meets these conditions:

    ```bash
    claude mcp add --scope user --transport http gitlab-kkm https://<gitlab-kkm>/api/v4/mcp
    ```

    In `claude`, `/mcp` → `gitlab-kkm` → *Authenticate* → log in to GitLab KKM in the browser (OAuth). Ask: *"List the open MRs in my kelas-ci-<nama> project."*

13. **If the built-in server is not available:** the trainer demos the community server `@zereight/mcp-gitlab` with a read-only *Personal Access Token* (scope `read_api`; the minimum scope is not yet confirmed for every tool) and `GITLAB_PERMISSION_MODE=readonly`, with the token in an *environment variable*, not in a repo file. Network blocks it? Watch the demo and note 2 uses for your project.

14. **Commit** the server and the project config (no secrets):

    ```bash
    git add tools/ci4-spark-mcp.php tools/ujian-mcp.jsonl .mcp.json
    git status --short          # no .env, no ~/.claude.json
    git commit -m "CHORE: server MCP ci4-spark (baca sahaja) + .mcp.json"
    git push -u origin chore/claude-code
    ```

    Open an MR `chore/claude-code` → `main` on GitLab KKM and merge it yourself ([GitLab track](../docs/trek-gitlab.md)) **before Lab 7.0 in the afternoon**, so that `CLAUDE.md`, the subagent, the skill and `.mcp.json` are in the `feat/pas-permohonan` branch.

### ✅ Checkpoint
- [ ] `php -l tools/ci4-spark-mcp.php` shows no errors and the step 3 test file returns 5 replies (`id` 1–5) as in the step 4 table (Quiz S11).
- [ ] The `id` 4 reply (`db_table` with `users; DROP TABLE users`) is noted, and the `users` table still exists (Quiz S11).
- [ ] `.mcp.json` registers `ci4-spark` without any secrets, and `/mcp` shows `ci4-spark` *connected* with 4 tools (Quiz S11).
- [ ] Claude Code answered the step 6 TLK route question through the `ci4-spark` tools, and `claude mcp list` shows `context7` *Connected* (Quiz S11).
- [ ] The commit `CHORE: server MCP ci4-spark (baca sahaja) + .mcp.json` is pushed to `chore/claude-code` (Quiz S11).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `/mcp`: `ci4-spark` *failed* | `php` not on the `PATH` of the Claude Code process | `where php` (PowerShell) / `which php` (Git Bash); add Laragon to the Path, or write the full path in `.mcp.json`: `"command": "C:/laragon/bin/php/php-8.3.x/php.exe"` |
| `File 'spark' not found` | `claude` started in a subfolder | Start `claude` in the project root, or set `"env": {"CI4_PROJECT_ROOT": "C:/Users/<anda>/latihan/kelas-ci-<nama>"}` |
| Step 3 test: `Parse error` | One JSON message split over several lines, or VS Code added a BOM | Each message must be one line; save the file as *UTF-8* (not *UTF-8 with BOM*) |
| `ci4-spark` shows *Pending approval* | The `.mcp.json` server is not approved yet | Start `claude` interactively and allow it; reset the choices: `claude mcp reset-project-choices` |
| `filter_check` times out after 30 s | The route needs interactive input or the DB is not connected | Run `php spark filter:check GET /…` yourself to see the error; check that Laragon MySQL is running |
| `mysql-kelas`: *Connection closed* (Windows) | `npx` fails to run directly | Check `node -v`; try `-- cmd /c npx -y @benborla29/mcp-server-mysql` |
| `Access denied for user 'claude_ro'` | User host `localhost` vs `127.0.0.1` | Create the user as `'claude_ro'@'127.0.0.1'` and use `MYSQL_HOST=127.0.0.1` |
| Context7 hangs | Office proxy/firewall | Ask IT to allow `mcp.context7.com` (HTTPS 443); [tutorial §7](../docs/tutorial-claude-code.md#7-kkm-network-proxy--domains) |

### ⭐ Bonus challenge
- Add a fifth tool `routes_filter` to `ci4-spark` that returns only the `php spark routes` lines containing a given string (e.g. `pas`). Check the input with the regex `^[a-z0-9/_-]+$`, filter the output in PHP (not through a shell), add a test line to `tools/ujian-mcp.jsonl`, and prove that `tools/list` now returns 5 tools.

---

## Lab 7.0 — Setup (10 min, start of S1)

1. New branch from the latest `main`:

   ```bash tab="Git Bash / macOS / Linux"
   git switch main && git pull
   git switch -c feat/pas-permohonan
   ```

   ```powershell tab="PowerShell"
   git switch main
   git pull
   git switch -c feat/pas-permohonan
   ```

2. Check the PHP upload limits and the `fileinfo` extension:

   ```bash tab="Git Bash / macOS / Linux"
   php --ini                                   # location of the loaded php.ini
   php -i | grep -E "upload_max_filesize|post_max_size|max_file_uploads"
   php -m | grep -i fileinfo                   # must print: fileinfo
   ```

   ```powershell tab="PowerShell"
   php --ini                                   # location of the loaded php.ini
   php -i | Select-String "upload_max_filesize|post_max_size|max_file_uploads"
   php -m | Select-String fileinfo             # must print: fileinfo
   ```

3. If `upload_max_filesize` < `8M` or `post_max_size` < `16M`, edit `php.ini` (Laragon: *Menu → PHP → php.ini*; otherwise: `php --ini`):

   ```ini
   upload_max_filesize = 8M
   post_max_size = 16M
   extension=fileinfo
   ```

   Restart `php spark serve` (or Apache) after the change.

4. Check the application time zone in `.env` (it should already be set on Day 4) — without it `Time::today()` uses UTC and "today" is off by one day between 00:00–08:00:

   ```ini
   app.appTimezone = 'Asia/Kuala_Lumpur'
   ```

5. Confirm the Day 4 tables exist and match SPEC §3:

   ```bash
   php spark db:table pass_applications --metadata
   php spark db:table pass_documents --metadata
   ```

**✅ Checkpoint 7.0:** `upload_max_filesize` ≥ 8M, `fileinfo` is loaded, both tables exist with the fields `stored_path`, `mime`, `size_bytes`, `reviewed_by`, `approved_by`.

---

## Lab 7.1 — Enums, Entity & Model (S1)

### 🎯 Objective
Write `PassType`, `PassStatus`, the `PassApplication` Entity, `PassApplicationModel` and `PassDocumentModel` so that they comply with SPEC §2.2 & §3.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- Lab 7.0 done. `BookingStatus` and `SlotBooking` (Day 5) can be used as a pattern.

### Steps

1. **Create `app/Enums/PassType.php`**. Three `case`s exactly as in the SPEC: `kenderaan`, `kakitangan`, `kontraktor`, with `label()`, `requiresVehicle()`, `values()`, `options()`.

   `app/Enums/PassType.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Enums;

   enum PassType: string
   {
       case Kenderaan  = 'kenderaan';    // pas kenderaan / pelekat
       case Kakitangan = 'kakitangan';   // pas akses kakitangan
       case Kontraktor = 'kontraktor';   // pas kontraktor berjangka

       /** Label BM untuk paparan */
       public function label(): string
       {
           return match ($this) {
               self::Kenderaan  => 'Pas Kenderaan (Pelekat)',
               self::Kakitangan => 'Pas Akses Kakitangan',
               self::Kontraktor => 'Pas Kontraktor Berjangka',
           };
       }

       /**
        * BR-PAS-06: pas kenderaan WAJIB dipautkan kepada kenderaan milik pemohon
        * (pass_applications.vehicle_id). Jenis lain: vehicle_id = NULL.
        */
       public function requiresVehicle(): bool
       {
           return $this === self::Kenderaan;
       }

       /**
        * Nilai mentah untuk in_list[] validasi.
        *
        * @return list<string>
        */
       public static function values(): array
       {
           return array_column(self::cases(), 'value');
       }

       /**
        * Pilihan untuk <select>: nilai => label BM.
        *
        * @return array<string, string>
        */
       public static function options(): array
       {
           $options = [];

           foreach (self::cases() as $case) {
               $options[$case->value] = $case->label();
           }

           return $options;
       }
   }
   ```

2. **Create `app/Enums/PassStatus.php`**. Five `case`s: `submitted`, `under_review`, `approved`, `rejected`, `expired`. Before you copy, sketch `allowedTransitions()` on paper from the SPEC §2.2 diagram, then compare your sketch with the code below. The other methods: `canTransitionTo()`, `label()`, `badge()`, `isFinal()`, `values()`, `options()`.

   `app/Enums/PassStatus.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Enums;

   enum PassStatus: string
   {
       case Submitted   = 'submitted';
       case UnderReview = 'under_review';
       case Approved    = 'approved';
       case Rejected    = 'rejected';
       case Expired     = 'expired';

       /** Label BM untuk paparan (SPEC §2.2) */
       public function label(): string
       {
           return match ($this) {
               self::Submitted   => 'Dihantar',
               self::UnderReview => 'Dalam Semakan',
               self::Approved    => 'Diluluskan',
               self::Rejected    => 'Ditolak',
               self::Expired     => 'Tamat Tempoh',
           };
       }

       /** Kelas CSS Bootstrap 5.3 untuk badge — corak sama seperti BookingStatus */
       public function badge(): string
       {
           return match ($this) {
               self::Submitted   => 'text-bg-secondary',
               self::UnderReview => 'text-bg-info',
               self::Approved    => 'text-bg-success',
               self::Rejected    => 'text-bg-danger',
               self::Expired     => 'text-bg-dark',
           };
       }

       /**
        * Status seterusnya yang sah dari status semasa.
        *
        * @return list<self>
        */
       public function allowedTransitions(): array
       {
           return match ($this) {
               self::Submitted   => [self::UnderReview],
               self::UnderReview => [self::Approved, self::Rejected],
               self::Approved    => [self::Expired],
               self::Rejected,
               self::Expired     => [],               // status akhir
           };
       }

       /** BR-PAS-01 — satu-satunya pintu untuk menyemak peralihan */
       public function canTransitionTo(self $to): bool
       {
           return in_array($to, $this->allowedTransitions(), true);
       }

       /** true jika tiada lagi peralihan yang mungkin (rejected/expired) */
       public function isFinal(): bool
       {
           return $this->allowedTransitions() === [];
       }

       /**
        * Nilai mentah untuk in_list[] validasi & whereIn().
        *
        * @return list<string>
        */
       public static function values(): array
       {
           return array_column(self::cases(), 'value');
       }

       /**
        * Pilihan untuk <select>: nilai => label BM.
        *
        * @return array<string, string>
        */
       public static function options(): array
       {
           $options = [];

           foreach (self::cases() as $case) {
               $options[$case->value] = $case->label();
           }

           return $options;
       }
   }
   ```

3. **Test the enum straight away** with a small script (not committed):

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p writable/scratch
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force writable\scratch | Out-Null
   ```

   In VS Code, create the file `writable/scratch/enum-check.php` (*File → New File*) with this content:

   ```php
   <?php
   require __DIR__ . '/../../vendor/autoload.php';
   require __DIR__ . '/../../app/Enums/PassStatus.php';
   use App\Enums\PassStatus as S;
   var_dump(S::Submitted->canTransitionTo(S::UnderReview));  // true
   var_dump(S::Submitted->canTransitionTo(S::Approved));     // false  ← BR-PAS-01
   var_dump(S::UnderReview->canTransitionTo(S::Rejected));   // true
   var_dump(S::Rejected->isFinal());                         // true
   echo S::from('under_review')->label(), PHP_EOL;           // Dalam Semakan
   var_dump(S::tryFrom('lulus'));                            // NULL
   ```

   Save it, then run:

   ```bash
   php writable/scratch/enum-check.php
   ```

4. **Create `app/Entities/PassApplication.php`** with `$dates`, `$casts` (`'?integer'` for optional FKs), `statusEnum()`, `typeEnum()`, `isOwnedBy()`, `displayStatus()`.

   `app/Entities/PassApplication.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Entities;

   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use CodeIgniter\Entity\Entity;
   use CodeIgniter\I18n\Time;

   class PassApplication extends Entity
   {
       /** Medan ini ditukar kepada CodeIgniter\I18n\Time secara automatik */
       protected $dates = [
           'valid_from',
           'valid_until',
           'reviewed_at',
           'approved_at',
           'created_at',
           'updated_at',
       ];

       /** '?integer' = boleh NULL (FK pilihan) */
       protected $casts = [
           'id'          => 'integer',
           'user_id'     => 'integer',
           'vehicle_id'  => '?integer',
           'reviewed_by' => '?integer',
           'approved_by' => '?integer',
       ];

       /** Status sebagai enum — ValueError jika DB mengandungi nilai asing (petanda data rosak) */
       public function statusEnum(): PassStatus
       {
           return PassStatus::from((string) $this->attributes['status']);
       }

       public function typeEnum(): PassType
       {
           return PassType::from((string) $this->attributes['pass_type']);
       }

       /** BR-PAS-04 — asas semakan pemilikan */
       public function isOwnedBy(int $userId): bool
       {
           return (int) $this->attributes['user_id'] === $userId;
       }

       /**
        * SPEC §2.2: expired ditetapkan oleh sistem "(Spark command / semasa papar)".
        * Semasa papar: pas approved yang valid_until sudah lepas dipaparkan sebagai Tamat Tempoh,
        * walaupun Spark `pas:expire` belum dijalankan. Nilai DB TIDAK diubah di sini.
        */
       public function displayStatus(): PassStatus
       {
           $status     = $this->statusEnum();
           $validUntil = $this->valid_until;   // Time (lihat $dates)

           if ($status === PassStatus::Approved
               && $validUntil instanceof Time
               && $validUntil->isBefore(Time::today())) {
               return PassStatus::Expired;
           }

           return $status;
       }
   }
   ```

5. **Create `app/Models/PassApplicationModel.php`**:
   - `$returnType = PassApplication::class`, `$useTimestamps = true`, `$useSoftDeletes = false`.
   - `$allowedFields` — 12 fields (everything except `id`, `created_at`, `updated_at`).
   - `$validationRules` filled in inside `initialize()` (because of the enum `implode()`).
   - Scopes `ownedBy()`, `withStatus()`, `withApplicant()`.

   `app/Models/PassApplicationModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use CodeIgniter\Model;

   class PassApplicationModel extends Model
   {
       protected $table          = 'pass_applications';
       protected $primaryKey     = 'id';
       protected $returnType     = PassApplication::class;
       protected $useSoftDeletes = false;          // SPEC §3: tiada deleted_at untuk jadual ini
       protected $useTimestamps  = true;           // isi created_at / updated_at automatik
       protected $dateFormat     = 'datetime';

       /** Senarai putih medan — cegah mass assignment (cth pemohon hantar status=approved) */
       protected $allowedFields = [
           'ref_no',
           'user_id',
           'pass_type',
           'vehicle_id',
           'purpose',
           'valid_from',
           'valid_until',
           'status',
           'reviewed_by',
           'reviewed_at',
           'approved_by',
           'approved_at',
       ];

       /** Diisi dalam initialize() kerana in_list[] dibina dari enum (bukan ungkapan pemalar) */
       protected $validationRules = [];

       protected $validationMessages = [
           'purpose' => [
               'min_length' => 'Tujuan permohonan mestilah sekurang-kurangnya 10 aksara.',
           ],
       ];

       /** Semasa update separa, hanya medan yang dihantar divalidasi (lalai CI4 = true) */
       protected $cleanValidationRules = true;

       protected function initialize(): void
       {
           $this->validationRules = [
               'ref_no'      => 'required|max_length[20]|is_unique[pass_applications.ref_no]',
               'user_id'     => 'required|is_natural_no_zero',
               'pass_type'   => 'required|in_list[' . implode(',', PassType::values()) . ']',
               'vehicle_id'  => 'permit_empty|is_natural_no_zero',
               'purpose'     => 'required|min_length[10]|max_length[2000]',
               'valid_from'  => 'required|valid_date[Y-m-d]',
               'valid_until' => 'required|valid_date[Y-m-d]',
               'status'      => 'required|in_list[' . implode(',', PassStatus::values()) . ']',
           ];
       }

       // -----------------------------------------------------------------
       // Skop query — dipanggil secara berantai, cth:
       //   $model->ownedBy($uid)->withStatus($s)->orderBy(...)->paginate(10)
       // Model::__call() memajukan where()/join() kepada Query Builder dan pulang $this.
       // -----------------------------------------------------------------

       /** BR-PAS-04: senarai pemohon — HANYA rekod miliknya */
       public function ownedBy(int $userId): static
       {
           $this->where('pass_applications.user_id', $userId);

           return $this;
       }

       /** Penapis status pilihan (null = semua) */
       public function withStatus(?PassStatus $status): static
       {
           if ($status !== null) {
               $this->where('pass_applications.status', $status->value);
           }

           return $this;
       }

       /** Sertakan nama pemohon (untuk senarai semakan pegawai) */
       public function withApplicant(): static
       {
           $this->select('pass_applications.*, users.full_name AS applicant_name')
               ->join('users', 'users.id = pass_applications.user_id');

           return $this;
       }
   }
   ```

6. **Create `app/Models/PassDocumentModel.php`** (`$returnType = 'array'`, rule `mime` `in_list[application/pdf,image/jpeg,image/png]`, `size_bytes` `less_than_equal_to[2097152]`, method `forApplication()`).

   `app/Models/PassDocumentModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use CodeIgniter\Model;

   class PassDocumentModel extends Model
   {
       protected $table          = 'pass_documents';
       protected $primaryKey     = 'id';
       protected $returnType     = 'array';
       protected $useSoftDeletes = false;
       protected $useTimestamps  = true;
       protected $dateFormat     = 'datetime';

       protected $allowedFields = [
           'application_id',
           'doc_type',
           'original_name',
           'stored_path',     // RELATIF kepada WRITEPATH, cth uploads/pas/1727251200_3f2a9c1e7b.pdf
           'mime',            // dari getMimeType() (kandungan), BUKAN getClientMimeType()
           'size_bytes',
       ];

       protected $validationRules = [
           'application_id' => 'required|is_natural_no_zero',
           'doc_type'       => 'required|max_length[30]',
           'original_name'  => 'required|max_length[255]',
           'stored_path'    => 'required|max_length[255]',
           'mime'           => 'required|in_list[application/pdf,image/jpeg,image/png]',
           'size_bytes'     => 'required|is_natural_no_zero|less_than_equal_to[2097152]',  // 2 MB (BR-PAS-02)
       ];

       /**
        * Dokumen bagi satu permohonan.
        *
        * @return list<array<string, mixed>>
        */
       public function forApplication(int $applicationId): array
       {
           return $this->where('application_id', $applicationId)
               ->orderBy('id', 'ASC')
               ->findAll();
       }
   }
   ```

7. **Test Model validation** through a temporary route (remove it after the checkpoint). Add to `app/Config/Routes.php`:

   ```php
   // TEMPORARY — remove after Checkpoint 7.1
   $routes->get('cuba-model-pas', static function () {
       $model = model(\App\Models\PassApplicationModel::class);
       $ok = $model->insert([
           'ref_no' => 'PAS-TEST-0001', 'user_id' => 1, 'pass_type' => 'vip',
           'purpose' => 'pendek', 'valid_from' => '2026-13-01', 'valid_until' => '2026-12-31',
           'status' => 'submitted',
       ]);
       return service('response')->setJSON(['ok' => $ok, 'errors' => $model->errors()]);
   });
   ```

   Open `http://localhost:8080/cuba-model-pas`.

### ✅ Checkpoint 7.1
- [ ] The enum script prints `bool(true)`, `bool(false)`, `bool(true)`, `bool(true)`, `Dalam Semakan`, `NULL` (Quiz S1).
- [ ] `/cuba-model-pas` returns `"ok": false` with errors for **`pass_type`**, **`purpose`** and **`valid_from`** (3 errors) (Quiz S1).
- [ ] The temporary route is **removed** and `writable/scratch/` is not committed (Quiz S1).
- [ ] Commit: `git add app/ && git commit -m "PAS: enum PassType/PassStatus, entity & model permohonan"` (Quiz S1)

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Fatal error: Constant expression contains invalid operations` | `implode()` in the default value of `$validationRules` | Fill it in inside `protected function initialize(): void` |
| `UnhandledMatchError` in `label()` | New `case` without a `match` arm | Add the arm; this is a safety feature, not a bug |
| `Class "App\Enums\PassStatus" not found` | File name/namespace mismatch (e.g. `app/enums/`) | Folder `app/Enums/` (capital E), `namespace App\Enums;`. 🪟 Windows ignores upper/lower case, so `app/enums` works on your laptop but fails on a Linux server and on a colleague's macOS laptop. Fix it through Git: `git mv app/enums app/Enums-tmp && git mv app/Enums-tmp app/Enums`; PowerShell: run the two `git mv` commands one at a time |
| `ValueError: "Approved" is not a valid backing value` | `PassStatus::from('Approved')` — DB values are lowercase | Use `->value` when saving; `from()` is only for DB data |
| `/cuba-model-pas` → `"ok": 5` (it succeeded!) | `$validationRules` is empty — `initialize()` not called / misspelt | Exact name `initialize`, visibility `protected` |

### ⭐ Bonus challenge
- Add `PassStatus::forRole(string $group): array` that returns the statuses relevant to each role's queue. Does this belong in the enum or in the Service? Discuss with the trainer or the person next to you.
- Write a PHPUnit unit test `tests/unit/Enums/PassStatusTest.php` with a `#[DataProvider]` attribute for **all 25** (5×5) `canTransitionTo()` pairs.

---

## Lab 7.2 — Routes, Service & List/Detail Views (S2)

### 🎯 Objective
Build `/pas/permohonan` (owner-scoped list, status filter, pagination) and `/pas/permohonan/{id}`, which returns 404 to anyone who is not the owner (BR-PAS-04).

### Prerequisites
- Lab 7.1 done. Logging in as `pemohon1@latihan.test` / `Latihan@2026` works.

### Steps

1. **Add the routes** in `app/Config/Routes.php` (after `service('auth')->routes($routes);`):

   ```php
   $routes->group('pas/permohonan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'session'], static function ($routes): void {
       $routes->get('/', 'ApplicationController::index', ['as' => 'pas.index']);
       $routes->get('new', 'ApplicationController::new', ['as' => 'pas.new']);
       $routes->post('/', 'ApplicationController::create', ['as' => 'pas.create']);
       $routes->get('(:num)', 'ApplicationController::show/$1', ['as' => 'pas.show']);
       $routes->get('dokumen/(:num)', 'ApplicationController::download/$1', ['as' => 'pas.dokumen']);
   });
   ```

   Confirm: `php spark routes | grep pas` (PowerShell: `php spark routes | Select-String pas`) — 5 rows, the filter column shows `session`.

2. **Create `app/Services/PassWorkflowService.php`** — an early version with the constructor and `canView()` only:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use App\Entities\PassApplication;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use App\Models\StatusLogModel;
   use CodeIgniter\Database\ConnectionInterface;
   use CodeIgniter\Shield\Entities\User;

   class PassWorkflowService
   {
       public const MODULE       = 'PAS';
       public const STAFF_GROUPS = ['reviewer', 'approver', 'admin'];

       private readonly PassApplicationModel $applications;
       private readonly PassDocumentModel $documents;
       private readonly StatusLogModel $statusLogs;

       public function __construct(
           private readonly ConnectionInterface $db,
           private readonly ReferenceNumberService $refs,
       ) {
           $this->applications = new PassApplicationModel($db);
           $this->documents    = new PassDocumentModel($db);
           $this->statusLogs   = new StatusLogModel($db);
       }

       /** BR-PAS-04 — the owner, or an officer */
       public function canView(User $user, PassApplication $application): bool
       {
           return $application->isOwnedBy((int) $user->id)
               || $user->inGroup(...self::STAFF_GROUPS);
       }
   }
   ```

3. **Register the Service** in `app/Config/Services.php` (next to Day 6's `bookingService`):

   ```php
   public static function passWorkflowService(bool $getShared = true): \App\Services\PassWorkflowService
   {
       if ($getShared) {
           return static::getSharedInstance('passWorkflowService');
       }

       return new \App\Services\PassWorkflowService(
           db_connect(),
           new \App\Services\ReferenceNumberService(db_connect()),
       );
   }
   ```

4. **Create `app/Controllers/Pas/ApplicationController.php`** with `index()`, `show()` and the helper `findVisibleOr404()`. For today, `show()` returns **two** variables only (`application` and `documents`):

   `app/Controllers/Pas/ApplicationController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Pas;

   use App\Controllers\BaseController;
   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use CodeIgniter\Exceptions\PageNotFoundException;

   class ApplicationController extends BaseController
   {
       protected $helpers = ['form', 'url'];

       /** GET /pas/permohonan — "Permohonan Saya" (BR-PAS-04: SENTIASA skop pemilik) */
       public function index(): string
       {
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');   // input asing → null

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
           ]);
       }

       /** GET /pas/permohonan/{id} — butiran + dokumen (tindakan & sejarah ditambah Hari 8) */
       public function show(string $id): string
       {
           $application = $this->findVisibleOr404((int) $id);

           return view('pas/show', [
               'application' => $application,
               'documents'   => model(PassDocumentModel::class)->forApplication($application->id),
           ]);
       }

       // -----------------------------------------------------------------

       /** BR-PAS-04 — 404 (bukan 403) supaya kewujudan ID orang lain tidak didedahkan */
       private function findVisibleOr404(int $id): PassApplication
       {
           $application = model(PassApplicationModel::class)->find($id);

           if ($application === null || ! service('passWorkflowService')->canView(auth()->user(), $application)) {
               throw PageNotFoundException::forPageNotFound();
           }

           return $application;
       }
   }
   ```

   (`history` and `actions` are added tomorrow, Day 8.)

5. **Page title, then `app/Views/pas/index.php`.** Pas views set the title via `section('title')`, but the Day 4/6 layout only reads `$title`. First replace the whole content of `app/Views/layouts/main.php` with the version below. It is the Day 6 layout with three additions: the `$sectionTitle`/`$pageTitle` block at the top, a `<title>` that reads `$pageTitle`, and the *Pas Saya* menu item.

   `app/Views/layouts/main.php`

   ```php
   <?php
   /**
    * Layout utama — Bootstrap 5.3 + Bootstrap Icons.
    * Guna dalam view: <?= $this->extend('layouts/main') ?> + <?= $this->section('content') ?> ... <?= $this->endSection() ?>
    *
    * @var \CodeIgniter\View\View $this
    * @var string|null            $title
    */
   $user = auth()->loggedIn() ? auth()->user() : null;

   // View Pas (Hari 7–8) memberi tajuk melalui section('title'); view TLK melalui $title.
   $sectionTitle = trim($this->renderSection('title'));
   $pageTitle    = $title ?? ($sectionTitle !== '' ? $sectionTitle : 'Sistem TLK & Pas');
   ?>
   <!doctype html>
   <html lang="ms">
   <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title><?= esc($pageTitle) ?> · KKM (Latihan)</title>
       <!-- Tiada internet di makmal? Muat turun fail ke public/assets/ dan tukar href kepada base_url('assets/...') -->
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
       <?= $this->renderSection('head') ?>
   </head>
   <body class="bg-body-tertiary d-flex flex-column min-vh-100">

   <nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
       <div class="container">
           <a class="navbar-brand fw-semibold" href="<?= site_url('/') ?>">
               <i class="bi bi-p-square-fill"></i> TLK &amp; Pas
           </a>
           <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navUtama"
                   aria-controls="navUtama" aria-expanded="false" aria-label="Menu">
               <span class="navbar-toggler-icon"></span>
           </button>

           <div class="collapse navbar-collapse" id="navUtama">
               <?php if ($user !== null): ?>
                   <ul class="navbar-nav me-auto">
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.index') ?>"><i class="bi bi-list-ul"></i> Tempahan Saya</a></li>
                       <?php if ($user->can('tlk.apply')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.new') ?>"><i class="bi bi-plus-circle"></i> Mohon Slot</a></li>
                       <?php endif ?>
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.availability') ?>"><i class="bi bi-search"></i> Slot Kosong</a></li>
                       <?php if ($user->can('tlk.decide')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.decision.index') ?>"><i class="bi bi-check2-square"></i> Keputusan TLK</a></li>
                       <?php endif ?>
                       <?php if ($user->inGroup('admin')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('admin.slot.index') ?>"><i class="bi bi-gear"></i> Urus Slot</a></li>
                       <?php endif ?>
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('pas.index') ?>"><i class="bi bi-person-vcard"></i> Pas Saya</a></li>
                   </ul>
                   <span class="navbar-text me-3">
                       <i class="bi bi-person-circle"></i> <?= esc($user->full_name ?? $user->username) ?>
                   </span>
                   <a class="btn btn-outline-light btn-sm" href="<?= url_to('logout') ?>"><i class="bi bi-box-arrow-right"></i> Log Keluar</a>
               <?php endif ?>
           </div>
       </div>
   </nav>

   <main class="container py-4 flex-grow-1">
       <?php if (! empty($title)): ?>
           <h1 class="h3 mb-3"><?= esc($title) ?></h1>
       <?php endif ?>

       <?= $this->include('partials/flash') ?>

       <?= $this->renderSection('content') ?>
   </main>

   <footer class="py-3 border-top bg-white small text-muted">
       <div class="container">Sistem latihan CI-KKM-10 · data sintetik sahaja</div>
   </footer>

   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
   <script>
       // Dialog pengesahan: <form data-confirm="Anda pasti?"> — elak klik tidak sengaja.
       document.querySelectorAll('form[data-confirm]').forEach(function (form) {
           form.addEventListener('submit', function (event) {
               if (!window.confirm(form.dataset.confirm)) {
                   event.preventDefault();
               }
           });
       });
   </script>
   <?= $this->renderSection('scripts') ?>
   </body>
   </html>
   ```

   Then create `app/Views/pas/index.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan Pas Saya<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <div class="d-flex justify-content-between align-items-center mb-3">
       <h1 class="h3 mb-0">Permohonan Pas Saya</h1>
       <a href="<?= url_to('pas.new') ?>" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Mohon Pas</a>
   </div>

   <form method="get" class="row g-2 mb-3" role="search">
       <div class="col-auto">
           <label for="status" class="visually-hidden">Status</label>
           <select name="status" id="status" class="form-select">
               <option value="">Semua status</option>
               <?php foreach (\App\Enums\PassStatus::cases() as $case): ?>
                   <option value="<?= esc($case->value, 'attr') ?>" <?= $status === $case ? 'selected' : '' ?>>
                       <?= esc($case->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
       </div>
       <div class="col-auto"><button type="submit" class="btn btn-outline-secondary">Tapis</button></div>
   </form>

   <?php if ($applications === []): ?>
       <div class="alert alert-info">Tiada permohonan untuk dipaparkan.</div>
   <?php else: ?>
       <div class="table-responsive">
           <table class="table table-hover align-middle">
               <thead>
                   <tr><th>No. Rujukan</th><th>Jenis</th><th>Tempoh Sah</th><th>Status</th><th>Tarikh Mohon</th><th></th></tr>
               </thead>
               <tbody>
               <?php foreach ($applications as $app): ?>
                   <?php $shown = $app->displayStatus(); ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($app->ref_no) ?></td>
                       <td><?= esc($app->typeEnum()->label()) ?></td>
                       <td><?= esc($app->valid_from->format('d/m/Y')) ?> – <?= esc($app->valid_until->format('d/m/Y')) ?></td>
                       <td><span class="badge <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span></td>
                       <td><?= esc($app->created_at->format('d/m/Y')) ?></td>
                       <td><a href="<?= url_to('pas.show', $app->id) ?>" class="btn btn-sm btn-outline-primary">Lihat</a></td>
                   </tr>
               <?php endforeach ?>
               </tbody>
           </table>
       </div>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```

6. **Create `app/Views/pas/show.php`** (Day 7 version):

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan <?= esc($application->ref_no) ?><?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <?php $shown = $application->displayStatus(); ?>

   <div class="d-flex justify-content-between align-items-center mb-3">
       <h1 class="h3 mb-0">Permohonan <?= esc($application->ref_no) ?></h1>
       <span class="badge fs-6 <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span>
   </div>

   <dl class="row">
       <dt class="col-sm-3">Jenis pas</dt>
       <dd class="col-sm-9"><?= esc($application->typeEnum()->label()) ?></dd>

       <dt class="col-sm-3">Tujuan</dt>
       <dd class="col-sm-9"><?= nl2br(esc($application->purpose)) ?></dd>

       <dt class="col-sm-3">Tempoh sah</dt>
       <dd class="col-sm-9">
           <?= esc($application->valid_from->format('d/m/Y')) ?> hingga <?= esc($application->valid_until->format('d/m/Y')) ?>
       </dd>

       <dt class="col-sm-3">Tarikh mohon</dt>
       <dd class="col-sm-9"><?= esc($application->created_at->format('d/m/Y H:i')) ?></dd>
   </dl>

   <h2 class="h5">Dokumen Sokongan</h2>
   <ul class="list-group mb-4">
       <?php foreach ($documents as $doc): ?>
           <li class="list-group-item d-flex justify-content-between align-items-center">
               <span>
                   <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
                   <?= esc($doc['original_name']) ?>
                   <small class="text-body-secondary">(<?= esc(number_format($doc['size_bytes'] / 1024)) ?> KB)</small>
               </span>
               <a class="btn btn-sm btn-outline-secondary" href="<?= url_to('pas.dokumen', $doc['id']) ?>">
                   <i class="bi bi-download" aria-hidden="true"></i> Muat turun
               </a>
           </li>
       <?php endforeach ?>
   </ul>

   <?php /* Day 8: the officer action panel + status history will be added here */ ?>

   <a href="<?= url_to('pas.index') ?>" class="btn btn-link px-0">&larr; Kembali ke senarai</a>
   <?= $this->endSection() ?>
   ```

   `nl2br(esc(...))` — **escape first**, then turn line breaks into `<br>`. If you reverse the order, your own `<br>` gets escaped and the user's `<script>` does not.

7. **Temporary test data** — before the form exists (Lab 7.3), insert two records directly through MySQL to test the list & ownership. Get the user IDs first:

   ```sql
   SELECT u.id, i.secret AS email FROM users u
   JOIN auth_identities i ON i.user_id = u.id AND i.type = 'email_password';

   -- replace 2 and 3 with the ids of pemohon1 and pemohon2
   INSERT INTO pass_applications (ref_no, user_id, pass_type, purpose, valid_from, valid_until, status, created_at, updated_at) VALUES
   ('PAS-2026-9001', 2, 'kakitangan', 'Akses Blok Pentadbiran (sintetik)', '2026-10-01', '2026-12-31', 'submitted', NOW(), NOW()),
   ('PAS-2026-9002', 3, 'kontraktor', 'Kerja penyelenggaraan lif (sintetik)', '2026-10-01', '2026-10-31', 'submitted', NOW(), NOW());
   ```

8. Test as `pemohon1`, then log out and test as `pemohon2`.

### ✅ Checkpoint 7.2
- [ ] `pemohon1` at `/pas/permohonan` sees **PAS-2026-9001 only**; `pemohon2` sees **PAS-2026-9002 only** (Quiz S2).
- [ ] `/pas/permohonan?status=xyz` does not error (the full list is shown); `?status=submitted` filters (Quiz S2).
- [ ] `pemohon2` opening `/pas/permohonan/{id PAS-2026-9001}` → **404** (Quiz S2).
- [ ] Logged in as `penyemak@latihan.test`, opening the same ID → **200** (officers see everything) (Quiz S2).
- [ ] Log out and open `/pas/permohonan` → redirect to `/login` (Quiz S2).
- [ ] Commit: `git add app/ && git commit -m "PAS: senarai skop pemilik & paparan butiran (BR-PAS-04)"` (Quiz S2)

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Call to undefined method CodeIgniter\Config\Services::passWorkflowService()` | Method registered in the wrong file/class | It must be in `app/Config/Services.php`, class `Config\Services`, `public static` |
| `Call to a member function format() on null` | Date field missing from the Entity's `$dates`, or the data is NULL | Check `$dates`; test data must have `valid_from`/`valid_until` |
| `Column 'user_id' in where clause is ambiguous` | `where('user_id')` together with `join()` | `where('pass_applications.user_id', …)` |
| Empty list for everyone | `auth()->id()` is null — the `session` filter is missing on the group | Add `'filter' => 'session'` to `group()` |
| `Controller or its method is not found: \App\Controllers\ApplicationController::index` | Forgot `'namespace' => 'App\Controllers\Pas'` on the group | Add `namespace`, or use `'Pas\ApplicationController::index'` |
| Flash message not visible | The layout does not include `partials/flash` | Check that `layouts/main.php` calls `$this->include('partials/flash')` and `partials/flash.php` (Lab 4/6) shows `session('message')`/`session('error')` |

### ⭐ Bonus challenge
- Show the vehicle plate number in the details of a vehicle pass (join `vehicles` in the Model, not in the view).
- Add a count per status above the list ("Dihantar: 2 · Diluluskan: 1") with a single `groupBy('status')` query.

---

## Lab 7.3 — Form, Validation, Upload & Download (S3)

### 🎯 Objective
Build the application form with 1–3 documents stored securely (BR-PAS-02), the reference number `PAS-2026-000N`, the `status_logs` entry, and download through a controller.

### Prerequisites
- Lab 7.2 done. `ReferenceNumberService` and `StatusLogModel::record()` from Days 4–6 work.
- `VehicleModel` exists and `pemohon1` has at least one synthetic vehicle (e.g. `WXX 1234`).

### Steps

1. **Grow `PassWorkflowService` into the Day 7 version** — replace the whole content of `app/Services/PassWorkflowService.php` with the code below. Compared with Lab 7.2, it adds:
   - constants `UPLOAD_DIR`, `MAX_FILES`, `MAX_BYTES`, `ALLOWED_EXT`
   - `submit()` — checks → `move()` → transaction → `status_logs` → clean-up in `catch`
   - `documentPath()` — `realpath()` + prefix check
   - private helpers `assertDates()`, `assertVehicle()`, `assertFiles()`, `storeFile()`, `deleteStoredFiles()`

   `app/Services/PassWorkflowService.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use App\Models\StatusLogModel;
   use App\Models\VehicleModel;
   use CodeIgniter\Database\ConnectionInterface;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\Files\UploadedFile;
   use CodeIgniter\Shield\Entities\User;
   use InvalidArgumentException;
   use RuntimeException;
   use Throwable;

   class PassWorkflowService
   {
       public const MODULE        = 'PAS';            // status_logs.module
       public const UPLOAD_DIR    = 'uploads/pas/';   // relatif kepada WRITEPATH (BR-PAS-02)
       public const MAX_FILES     = 3;                // BR-PAS-02
       public const MAX_BYTES     = 2_097_152;        // BR-PAS-02: 2 MB setiap fail
       public const ALLOWED_EXT   = ['pdf', 'jpg', 'png'];
       public const STAFF_GROUPS  = ['reviewer', 'approver', 'admin'];

       private readonly PassApplicationModel $applications;
       private readonly PassDocumentModel $documents;
       private readonly StatusLogModel $statusLogs;

       public function __construct(
           private readonly ConnectionInterface $db,
           private readonly ReferenceNumberService $refs,
       ) {
           // Model dibina dengan sambungan YANG SAMA → semua tulisan berada dalam transaksi yang sama
           $this->applications = new PassApplicationModel($db);
           $this->documents    = new PassDocumentModel($db);
           $this->statusLogs   = new StatusLogModel($db);
       }

       // =================================================================
       // HARI 7 — cipta permohonan (null → submitted)
       // =================================================================

       /**
        * @param array{pass_type:string, vehicle_id?:int|string|null, purpose:string, valid_from:string, valid_until:string} $data
        * @param list<UploadedFile> $files fail yang SUDAH lulus rules validasi controller
        *
        * @throws InvalidArgumentException ralat perniagaan — mesej BM, selamat dipapar kepada pengguna
        */
       public function submit(int $userId, array $data, array $files): PassApplication
       {
           $type      = PassType::from((string) $data['pass_type']);
           $vehicleId = empty($data['vehicle_id']) ? null : (int) $data['vehicle_id'];

           // --- Semakan perniagaan SEBELUM menyentuh cakera atau DB --------------
           // BR-PAS-06
           $this->assertDates((string) $data['valid_from'], (string) $data['valid_until']);
           $this->assertVehicle($type, $vehicleId, $userId);
           $this->assertFiles($files);

           $stored        = [];
           $inTransaction = false;

           try {
               // 1) Pindah fail dahulu. Fail sistem TIDAK ikut rollback DB — kita bersihkan sendiri di catch.
               foreach ($files as $file) {
                   $stored[] = $this->storeFile($file);
               }

               // 2) Semua tulisan DB dalam SATU transaksi: permohonan + dokumen + log
               $this->db->transException(true)->transBegin();   // ralat query → exception
               $inTransaction = true;

               $refNo = $this->refs->next('PAS');   // PAS-2026-0001 — mesti dalam transaksi (FOR UPDATE)

               $id = $this->applications->insert([
                   'ref_no'      => $refNo,
                   'user_id'     => $userId,
                   'pass_type'   => $type->value,
                   'vehicle_id'  => $type->requiresVehicle() ? $vehicleId : null,
                   'purpose'     => trim((string) $data['purpose']),
                   'valid_from'  => (string) $data['valid_from'],
                   'valid_until' => (string) $data['valid_until'],
                   'status'      => PassStatus::Submitted->value,   // BUKAN dari input pengguna
               ], true);

               if ($id === false) {
                   throw new RuntimeException('Gagal menyimpan permohonan: ' . implode(' ', $this->applications->errors()));
               }

               foreach ($stored as $doc) {
                   if ($this->documents->insert($doc + ['application_id' => (int) $id]) === false) {
                       throw new RuntimeException('Gagal menyimpan dokumen: ' . implode(' ', $this->documents->errors()));
                   }
               }

               // BR-PAS-05: log penciptaan (from_status = NULL)
               if (! $this->statusLogs->record(self::MODULE, (int) $id, null, PassStatus::Submitted->value, $userId, 'Permohonan dihantar.')) {
                   throw new RuntimeException('Gagal merekod log status.');
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               if ($inTransaction) {
                   $this->db->transRollback();
               }
               $this->deleteStoredFiles($stored);   // tiada fail "yatim" di cakera

               throw $e;
           }

           return $this->applications->find((int) $id);
       }

       /**
        * BR-PAS-04 — siapa boleh LIHAT permohonan (dan dokumennya).
        * Pemilik, atau pegawai (reviewer/approver/admin).
        */
       public function canView(User $user, PassApplication $application): bool
       {
           return $application->isOwnedBy((int) $user->id)
               || $user->inGroup(...self::STAFF_GROUPS);
       }

       /**
        * Path mutlak dokumen yang selamat untuk dimuat turun.
        * Pertahanan path traversal: path sebenar MESTI berada di dalam writable/uploads/pas/.
        *
        * @param array<string, mixed> $document baris pass_documents
        */
       public function documentPath(array $document): string
       {
           $base = realpath(WRITEPATH . self::UPLOAD_DIR);
           $path = realpath(WRITEPATH . (string) $document['stored_path']);

           if ($base === false || $path === false || ! is_file($path)
               || ! str_starts_with($path, $base . DIRECTORY_SEPARATOR)) {
               throw PageNotFoundException::forPageNotFound('Dokumen tidak dijumpai.');
           }

           return $path;
       }

       // =================================================================
       // Dalaman
       // =================================================================

       /** BR-PAS-06: valid_until >= valid_from (tiada had tempoh maksimum untuk Pas) */
       private function assertDates(string $from, string $until): void
       {
           if ($until < $from) {   // format Y-m-d → perbandingan string = perbandingan tarikh
               throw new InvalidArgumentException('Tarikh "Sah hingga" mesti sama atau selepas "Sah dari".');
           }
       }

       /** BR-PAS-06: pas kenderaan → kenderaan wajib DAN mesti milik pemohon (cegah IDOR melalui medan borang) */
       private function assertVehicle(PassType $type, ?int $vehicleId, int $userId): void
       {
           if (! $type->requiresVehicle()) {
               return;
           }

           $owned = $vehicleId !== null && model(VehicleModel::class)
               ->where('id', $vehicleId)
               ->where('user_id', $userId)
               ->countAllResults() === 1;

           if (! $owned) {
               throw new InvalidArgumentException('Sila pilih kenderaan anda yang berdaftar untuk pas kenderaan.');
           }
       }

       /** @param list<UploadedFile> $files */
       private function assertFiles(array $files): void
       {
           if ($files === [] || count($files) > self::MAX_FILES) {
               throw new InvalidArgumentException('Sila lampirkan 1 hingga 3 dokumen sokongan.');
           }

           foreach ($files as $file) {
               // guessExtension() diterbitkan dari MIME sebenar (finfo) — lapisan kedua selepas ext_in/mime_in.
               // Sambungan nama fail MESTI sama dengan kandungan (cth PNG bernama .pdf ditolak).
               $guessed = $file->guessExtension();

               if (! $file->isValid()
                   || ! in_array($guessed, self::ALLOWED_EXT, true)
                   || strtolower($file->getClientExtension()) !== $guessed) {
                   throw new InvalidArgumentException('Dokumen tidak sah. Hanya PDF, JPG atau PNG dibenarkan.');
               }

               if ((int) $file->getSize() > self::MAX_BYTES) {
                   throw new InvalidArgumentException('Setiap fail mestilah tidak melebihi 2 MB.');
               }
           }
       }

       /**
        * @return array{doc_type:string, original_name:string, mime:string, size_bytes:int, stored_path:string}
        */
       private function storeFile(UploadedFile $file): array
       {
           // Baca metadata SEBELUM move() — selepas dipindah, fail sementara sudah tiada
           $meta = [
               'doc_type'      => 'sokongan',
               'original_name' => mb_substr($file->getClientName(), 0, 255),   // untuk paparan SAHAJA
               'mime'          => $file->getMimeType(),                         // dari kandungan (finfo)
               'size_bytes'    => (int) $file->getSize(),
           ];

           $newName = $file->getRandomName();                 // cth 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
           $file->move(WRITEPATH . self::UPLOAD_DIR, $newName); // HTTPException jika gagal

           return $meta + ['stored_path' => self::UPLOAD_DIR . $newName];
       }

       /** @param list<array{stored_path:string}> $stored */
       private function deleteStoredFiles(array $stored): void
       {
           foreach ($stored as $doc) {
               $path = WRITEPATH . $doc['stored_path'];

               if (is_file($path)) {
                   unlink($path);
               }
           }
       }
   }
   ```

   All the `use` statements you need are already included (`PassStatus`, `PassType`, `VehicleModel`, `UploadedFile`, `PageNotFoundException`, `InvalidArgumentException`, `RuntimeException`, `Throwable`). The Day 8 methods (`startReview`, `approve`, `reject`, `transition`) are **not** there yet — they are added tomorrow.

   Before you continue, explain out loud to the trainer or the person next to you: *"Why are the files moved BEFORE `transBegin()`, and what happens to the files if `record()` fails?"*

2. **Add `new()`, `create()`, `download()`, `rules()`, `uploadedFiles()`** to `ApplicationController` — replace the whole content of the file with the complete Day 7 version below. `index()` stays as in Lab 7.2b (type filter + search); `show()`, `findVisibleOr404()` and `protected $helpers = ['form', 'url'];` stay as in Lab 7.2.

   `app/Controllers/Pas/ApplicationController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Pas;

   use App\Controllers\BaseController;
   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use App\Models\VehicleModel;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\DownloadResponse;
   use CodeIgniter\HTTP\Files\UploadedFile;
   use CodeIgniter\HTTP\RedirectResponse;
   use InvalidArgumentException;

   class ApplicationController extends BaseController
   {
       protected $helpers = ['form', 'url'];

       /** GET /pas/permohonan — "Permohonan Saya" (BR-PAS-04: SENTIASA skop pemilik) */
       public function index(): string
       {
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');   // input asing → null

           // Lab 7.2b: penapis jenis + carian — input asing diabaikan, carian dihadkan 50 aksara
           $typeInput = $this->request->getGet('pass_type');
           $type      = PassType::tryFrom(is_string($typeInput) ? $typeInput : '');
           $qInput    = $this->request->getGet('q');
           $q         = is_string($qInput) ? mb_substr(trim($qInput), 0, 50) : '';

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->withType($type)
               ->search($q)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
               'type'         => $type,
               'q'            => $q,
           ]);
       }

       /** GET /pas/permohonan/new — borang */
       public function new(): string
       {
           return view('pas/new', [
               'types'    => PassType::cases(),
               'vehicles' => model(VehicleModel::class)
                   ->where('user_id', (int) auth()->id())
                   ->asArray()
                   ->findAll(),
           ]);
       }

       /** POST /pas/permohonan — simpan permohonan + dokumen */
       public function create(): RedirectResponse
       {
           // 1. Validasi pelayan (medan + SETIAP fail dalam documents[])
           if (! $this->validate($this->rules())) {
               return redirect()->back()->withInput();
           }

           // 2. Serah kepada Service (bilangan fail, pemilikan kenderaan, transaksi, move())
           try {
               $application = service('passWorkflowService')->submit(
                   (int) auth()->id(),
                   $this->request->getPost(['pass_type', 'vehicle_id', 'purpose', 'valid_from', 'valid_until']),
                   $this->uploadedFiles('documents'),
               );
           } catch (InvalidArgumentException $e) {
               // 3. Ralat perniagaan → mesej mesra pengguna, input dikekalkan (fail perlu dipilih semula)
               return redirect()->back()->withInput()->with('error', $e->getMessage());
           }

           // 4. PRG — Post/Redirect/Get
           return redirect()->to(url_to('pas.show', $application->id))
               ->with('message', "Permohonan {$application->ref_no} berjaya dihantar.");
       }

       /** GET /pas/permohonan/{id} — butiran + dokumen (tindakan & sejarah ditambah Hari 8) */
       public function show(string $id): string
       {
           $application = $this->findVisibleOr404((int) $id);

           return view('pas/show', [
               'application' => $application,
               'documents'   => model(PassDocumentModel::class)->forApplication($application->id),
           ]);
       }

       /** GET /pas/permohonan/dokumen/{id} — muat turun melalui controller (fail TIADA dalam public/) */
       public function download(string $documentId): DownloadResponse
       {
           $document = model(PassDocumentModel::class)->find((int) $documentId);

           if ($document === null) {
               throw PageNotFoundException::forPageNotFound();
           }

           // BR-PAS-04 terpakai kepada FAIL juga — bukan sekadar halaman butiran
           $this->findVisibleOr404((int) $document['application_id']);

           $path = service('passWorkflowService')->documentPath($document);   // semakan path traversal

           // attachment (bukan inline) + nosniff: pelayar tidak "meneka" & merender kandungan
           return $this->response->download($path, null, true)
               ->setFileName($document['original_name'])
               ->setHeader('X-Content-Type-Options', 'nosniff');
       }

       // -----------------------------------------------------------------

       /** BR-PAS-04 — 404 (bukan 403) supaya kewujudan ID orang lain tidak didedahkan */
       private function findVisibleOr404(int $id): PassApplication
       {
           $application = model(PassApplicationModel::class)->find($id);

           if ($application === null || ! service('passWorkflowService')->canView(auth()->user(), $application)) {
               throw PageNotFoundException::forPageNotFound();
           }

           return $application;
       }

       /**
        * Rules validasi borang. BR-PAS-02 untuk fail:
        *  - uploaded : sekurang-kurangnya satu fail yang berjaya dimuat naik oleh PHP
        *  - max_size : dalam KB → 2048 = 2 MB SETIAP fail
        *  - ext_in   : (StrictRules CI 4.6) sambungan klien MESTI sama dengan guessExtension() dari kandungan
        *  - mime_in  : MIME dari kandungan (finfo), BUKAN header Content-Type dari pelayar
        *
        * @return array<string, array<string, mixed>>
        */
       private function rules(): array
       {
           $rules = [
               'pass_type' => [
                   'label' => 'Jenis pas',
                   'rules' => 'required|in_list[' . implode(',', PassType::values()) . ']',
               ],
               'vehicle_id' => [
                   'label' => 'Kenderaan',
                   'rules' => 'permit_empty|is_natural_no_zero',
               ],
               'purpose' => [
                   'label' => 'Tujuan',
                   'rules' => 'required|min_length[10]|max_length[2000]',
               ],
               'valid_from' => [
                   'label' => 'Sah dari',
                   'rules' => 'required|valid_date[Y-m-d]',
               ],
               'valid_until' => [
                   'label' => 'Sah hingga',
                   'rules' => 'required|valid_date[Y-m-d]',
               ],
               'documents' => [
                   'label'  => 'Dokumen sokongan',
                   'rules'  => 'uploaded[documents]'
                       . '|max_size[documents,2048]'
                       . '|ext_in[documents,pdf,jpg,png]'
                       . '|mime_in[documents,application/pdf,image/jpeg,image/png]',
                   'errors' => [
                       'uploaded' => 'Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah.',
                       'max_size' => 'Setiap fail mestilah tidak melebihi 2 MB.',
                       'ext_in'   => 'Hanya fail PDF, JPG atau PNG dibenarkan.',
                       'mime_in'  => 'Kandungan fail bukan PDF/JPG/PNG yang sah.',
                   ],
               ],
           ];

           // BR-PAS-06: kenderaan WAJIB hanya untuk pas kenderaan (pemilikan & tarikh disemak dalam Service)
           $type = PassType::tryFrom((string) $this->request->getPost('pass_type'));
           if ($type?->requiresVehicle()) {
               $rules['vehicle_id']['rules'] = 'required|is_natural_no_zero';
           }

           return $rules;
       }

       /**
        * Fail yang BENAR-BENAR dipilih pengguna (buang slot kosong UPLOAD_ERR_NO_FILE).
        *
        * @return list<UploadedFile>
        */
       private function uploadedFiles(string $field): array
       {
           $files = $this->request->getFileMultiple($field) ?? [];

           return array_values(array_filter(
               $files,
               static fn (UploadedFile $file): bool => $file->getError() !== UPLOAD_ERR_NO_FILE,
           ));
       }
   }
   ```

3. **Create `app/Views/pas/new.php`**:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan Pas Baharu<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <h1 class="h3 mb-3">Permohonan Pas Baharu</h1>

   <?php /* novalidate: we WANT to test server-side validation, not HTML5 */ ?>
   <?= form_open_multipart(url_to('pas.create'), ['novalidate' => true]) ?>
   <div class="row g-3">
       <div class="col-md-6">
           <label for="pass_type" class="form-label">Jenis pas <span class="text-danger">*</span></label>
           <select name="pass_type" id="pass_type"
                   class="form-select <?= validation_show_error('pass_type') ? 'is-invalid' : '' ?>">
               <option value="">— Pilih —</option>
               <?php foreach ($types as $type): ?>
                   <option value="<?= esc($type->value, 'attr') ?>" <?= old('pass_type') === $type->value ? 'selected' : '' ?>>
                       <?= esc($type->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
           <div class="invalid-feedback"><?= validation_show_error('pass_type') ?></div>
       </div>

       <div class="col-md-6">
           <label for="vehicle_id" class="form-label">Kenderaan <small class="text-body-secondary">(wajib untuk pas kenderaan)</small></label>
           <select name="vehicle_id" id="vehicle_id"
                   class="form-select <?= validation_show_error('vehicle_id') ? 'is-invalid' : '' ?>">
               <option value="">— Tiada —</option>
               <?php foreach ($vehicles as $vehicle): ?>
                   <option value="<?= esc((string) $vehicle['id'], 'attr') ?>" <?= old('vehicle_id') === (string) $vehicle['id'] ? 'selected' : '' ?>>
                       <?= esc($vehicle['plate_no'] . ' — ' . $vehicle['model']) ?>
                   </option>
               <?php endforeach ?>
           </select>
           <div class="invalid-feedback"><?= validation_show_error('vehicle_id') ?></div>
       </div>

       <div class="col-12">
           <label for="purpose" class="form-label">Tujuan <span class="text-danger">*</span></label>
           <textarea name="purpose" id="purpose" rows="3"
                     class="form-control <?= validation_show_error('purpose') ? 'is-invalid' : '' ?>"><?= esc(old('purpose', '')) ?></textarea>
           <div class="invalid-feedback"><?= validation_show_error('purpose') ?></div>
       </div>

       <div class="col-md-6">
           <label for="valid_from" class="form-label">Sah dari <span class="text-danger">*</span></label>
           <input type="date" name="valid_from" id="valid_from" value="<?= esc(old('valid_from', ''), 'attr') ?>"
                  class="form-control <?= validation_show_error('valid_from') ? 'is-invalid' : '' ?>">
           <div class="invalid-feedback"><?= validation_show_error('valid_from') ?></div>
       </div>

       <div class="col-md-6">
           <label for="valid_until" class="form-label">Sah hingga <span class="text-danger">*</span></label>
           <input type="date" name="valid_until" id="valid_until" value="<?= esc(old('valid_until', ''), 'attr') ?>"
                  class="form-control <?= validation_show_error('valid_until') ? 'is-invalid' : '' ?>">
           <div class="invalid-feedback"><?= validation_show_error('valid_until') ?></div>
       </div>

       <div class="col-12">
           <label for="documents" class="form-label">Dokumen sokongan <span class="text-danger">*</span></label>
           <input type="file" name="documents[]" id="documents" multiple accept=".pdf,.jpg,.png"
                  class="form-control <?= validation_show_error('documents') ? 'is-invalid' : '' ?>">
           <div class="form-text">PDF, JPG atau PNG · maksimum 2 MB setiap fail · 1 hingga 3 fail. Jika borang dikembalikan, sila pilih fail semula.</div>
           <div class="invalid-feedback"><?= validation_show_error('documents') ?></div>
       </div>
   </div>

   <div class="mt-4">
       <button type="submit" class="btn btn-primary"><i class="bi bi-send"></i> Hantar Permohonan</button>
       <a href="<?= url_to('pas.index') ?>" class="btn btn-link">Batal</a>
   </div>
   <?= form_close() ?>
   <?= $this->endSection() ?>
   ```

4. **Make sure the upload folder cannot be reached and is not committed.** CI4 creates `writable/uploads/pas/` automatically during `move()`. Check that the project's `.gitignore` contains `writable/uploads/*` (the appstarter already has it). Confirm:

   ```bash
   git check-ignore -v writable/uploads/pas/contoh.pdf   # must show the .gitignore rule
   ```

5. **Prepare synthetic test files** in a folder outside the project (e.g. `~/ujian-pas/`):

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p ~/ujian-pas && cd ~/ujian-pas
   printf '%%PDF-1.4\n%% Dokumen sintetik latihan KKM\n' > surat-sokongan.pdf
   echo 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' | base64 --decode > gambar.png
   ```

   ```powershell tab="PowerShell"
   mkdir $HOME\ujian-pas; cd $HOME\ujian-pas
   Set-Content -Path surat-sokongan.pdf -Value "%PDF-1.4`n% Dokumen sintetik latihan KKM" -NoNewline
   [IO.File]::WriteAllBytes("$PWD\gambar.png", [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='))
   ```

6. **Submit the first application** as `pemohon1`: type *Pas Akses Kakitangan* (staff access pass), purpose ≥ 10 characters, valid dates, attach `surat-sokongan.pdf` + `gambar.png`.

7. **Confirm in three places:**

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/latihan/kelas-ci-<nama>         # back to the project folder (step 5 left you in ~/ujian-pas)
   ls -la writable/uploads/pas/          # 2 files, random names e.g. 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
   ls public/ | grep -i upload            # NO output
   ```

   ```powershell tab="PowerShell"
   cd $HOME\latihan\kelas-ci-<nama>                  # back to the project folder (step 5 left you in $HOME\ujian-pas)
   Get-ChildItem -Force writable/uploads/pas/          # 2 files, random names e.g. 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
   Get-ChildItem public/ -Name | Select-String upload  # NO output
   ```

   ```sql
   SELECT id, ref_no, status FROM pass_applications ORDER BY id DESC LIMIT 1;
   SELECT application_id, original_name, stored_path, mime, size_bytes FROM pass_documents ORDER BY id DESC LIMIT 2;
   SELECT module, record_id, from_status, to_status, actor_id FROM status_logs WHERE module = 'PAS' ORDER BY id DESC LIMIT 1;
   ```

8. **Download** both documents from the detail page. Open DevTools → Network → click the response → check the headers `Content-Disposition: attachment; filename="surat-sokongan.pdf"` and `X-Content-Type-Options: nosniff`.

### ✅ Checkpoint 7.3
- [ ] Redirect to `/pas/permohonan/{id}` with the message "Permohonan PAS-2026-000N berjaya dihantar." (Quiz S3)
- [ ] `pass_documents.stored_path` starts with `uploads/pas/` (relative), `mime` = `application/pdf` / `image/png`, `original_name` = the original name (Quiz S3).
- [ ] The file name on disk is **different** from the original name; `public/` has no `uploads` folder (Quiz S3).
- [ ] `status_logs` has the row `PAS · {id} · NULL → submitted` (Quiz S3).
- [ ] Download works with the original name; the `attachment` + `nosniff` headers are present (Quiz S3).
- [ ] Commit: `git add app/ && git commit -m "PAS: borang permohonan + muat naik dokumen selamat (BR-PAS-02)"` (Quiz S3)

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Call to undefined method App\Models\PassApplicationModel::withType()` at `/pas/permohonan` | Lab 7.2b was not done — the step 2 controller calls the `withType()`/`search()` scopes | Do Lab 7.2b steps 2 and 6 (Model scopes) |
| Validation error `uploaded` (no file received) even though a file was chosen | Form without `enctype` (used `form_open()` instead of `form_open_multipart()`) | `form_open_multipart()` |
| Only **one** file saved even though 2 were chosen | `name="documents"` without `[]` | `name="documents[]"` + `multiple` |
| `The action you requested is not allowed.` (SecurityException) when sending a large file | `post_max_size` exceeded → `$_POST` empty → CSRF token lost | Raise `post_max_size` (16M) — Lab 7.0 |
| `mime_in` fails for a valid PDF | The `fileinfo` extension is not loaded | `extension=fileinfo` in `php.ini`, restart the server |
| `CodeIgniter\HTTP\Exceptions\HTTPException: The file has already been moved` | `move()` called twice for the same file | Only one `move()`, in `storeFile()` |
| `Cannot add or update a child row: a foreign key constraint fails` on `pass_documents` | Wrong `application_id` (e.g. `false` from a failed insert) | Check `$id === false` → throw an exception (already in the template) |
| `ValueError: "" is not a valid backing value` | `PassType::from()` with empty input before validation | Validate `in_list` **before** calling the Service |
| `Unable to create directory` / `Permission denied` on `move()` | `writable/` is not writable by the web server | Linux/Mac: `chmod -R 775 writable`; Windows: check the folder is not *read-only* |
| Download shows a broken/empty PDF | There is output (spaces/`echo`) before the response, e.g. after `?>` in a config file | Remove the closing `?>` tag in pure PHP files |

### ⭐ Bonus challenge
- Add a `doc_type` option for **each** file (`salinan_ic`, `geran_kenderaan`, `surat_lantikan`) — propose how the form sends the type per file (`doc_types[]`).
- Limit the **total** size (e.g. 5 MB) in `assertFiles()`.
- Vehicle pass: reject it if that vehicle already has an `approved` pass that is still valid.

---

## Lab 7.4 — Manual Boundary Case Testing (S4)

### 🎯 Objective
Run at least 10 (target 17) boundary test cases for upload, validation and ownership, and record the results in `docs/ujian-manual-pas.md`.

### Prerequisites
- Lab 7.3 done. The folder `~/ujian-pas/` has `surat-sokongan.pdf` and `gambar.png`.

### Steps

1. **Generate the boundary files** (Git Bash / macOS / Linux):

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/ujian-pas
   # Exactly 2 MB = 2 097 152 bytes (9-byte header + 2 097 143)
   { printf '%%PDF-1.4\n'; head -c 2097143 /dev/zero; } > tepat-2mb.pdf
   # 2 MB + 1 KB
   { printf '%%PDF-1.4\n'; head -c 2098167 /dev/zero; } > lebih-2mb.pdf
   # 3 MB
   { printf '%%PDF-1.4\n'; head -c 3145728 /dev/zero; } > besar-3mb.pdf
   # Executable renamed to .pdf
   cp "$(command -v ls)" program.pdf
   # PHP script disguised as a PDF (harmless: phpinfo)
   printf '<?php phpinfo(); ?>\n' > borang.pdf
   # .jpeg extension (valid PNG content; the SPEC only allows jpg/png)
   cp gambar.png gambar.jpeg
   cp surat-sokongan.pdf surat-2.pdf; cp surat-sokongan.pdf surat-3.pdf
   ls -l
   ```

   ```powershell tab="PowerShell"
   cd $HOME\ujian-pas
   $hdr = [Text.Encoding]::ASCII.GetBytes("%PDF-1.4`n")
   [IO.File]::WriteAllBytes("$PWD\tepat-2mb.pdf",  $hdr + (New-Object byte[] 2097143))
   [IO.File]::WriteAllBytes("$PWD\lebih-2mb.pdf",  $hdr + (New-Object byte[] 2098167))
   [IO.File]::WriteAllBytes("$PWD\besar-3mb.pdf",  $hdr + (New-Object byte[] 3145728))
   Copy-Item C:\Windows\System32\notepad.exe .\program.pdf
   Set-Content borang.pdf '<?php phpinfo(); ?>'
   Copy-Item gambar.png gambar.jpeg
   Copy-Item surat-sokongan.pdf surat-2.pdf; Copy-Item surat-sokongan.pdf surat-3.pdf
   ```

2. **Create `docs/ujian-manual-pas.md`** and copy the table below. Run each case; fill in the *Actual* and *Result* columns. After **every** case, check `ls writable/uploads/pas/ | wc -l` (PowerShell: `(Get-ChildItem writable/uploads/pas/).Count`) from the **project folder** (`cd ~/latihan/kelas-ci-<nama>`, not `~/ujian-pas`) — the count only goes up for cases that are expected to succeed.

   | ID | Case | Steps | Expected | Actual | Result |
   |----|------|-------|----------|--------|--------|
   | UT-PAS-01 | 1 valid PDF | Attach `surat-sokongan.pdf` | Succeeds, `PAS-2026-000N`, +1 file on disk | | |
   | UT-PAS-02 | 3 valid files (max) | `surat-sokongan.pdf`, `surat-2.pdf`, `gambar.png` | Succeeds, 3 `pass_documents` rows | | |
   | UT-PAS-03 | No file | Submit without a file | "Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah." | | |
   | UT-PAS-04 | 4 files | 4 valid files | "Sila lampirkan 1 hingga 3 dokumen sokongan." — **no** new file on disk, no record | | |
   | UT-PAS-05 | Exactly 2 MB | `tepat-2mb.pdf` | Succeeds (boundary is inclusive) | | |
   | UT-PAS-06 | 2 MB + 1 KB | `lebih-2mb.pdf` | "Setiap fail mestilah tidak melebihi 2 MB." | | |
   | UT-PAS-07 | 3 MB | `besar-3mb.pdf` | "Setiap fail mestilah tidak melebihi 2 MB." | | |
   | UT-PAS-08 | Executable → `.pdf` | `program.pdf` | Rejected ("Hanya fail PDF, JPG atau PNG…" or "Kandungan fail bukan…") | | |
   | UT-PAS-09 | PHP → `.pdf` | `borang.pdf` | Rejected — no `.php` file on disk | | |
   | UT-PAS-10 | `.jpeg` | `gambar.jpeg` | Rejected (SPEC: jpg/png only) — record as "per SPEC" | | |
   | UT-PAS-11 | Dates reversed (BR-PAS-06) | `valid_until` < `valid_from` | "Tarikh "Sah hingga" mesti sama atau selepas "Sah dari"." | | |
   | UT-PAS-12 | Vehicle pass without a vehicle (BR-PAS-06) | Type *Pas Kenderaan* (vehicle pass), vehicle "Tiada" | Error on the Kenderaan (vehicle) field (required) | | |
   | UT-PAS-13 | Someone else's vehicle (form IDOR) | DevTools: change the `<option>` `value` to a vehicle ID of `pemohon2` | "Sila pilih kenderaan anda yang berdaftar untuk pas kenderaan." | | |
   | UT-PAS-14 | Someone else's details | `pemohon2` opens `/pas/permohonan/{id pemohon1}` | 404 | | |
   | UT-PAS-15 | Someone else's document | `pemohon2` opens `/pas/permohonan/dokumen/{id dokumen pemohon1}` | 404 | | |
   | UT-PAS-16 | Direct file access | Open `http://localhost:8080/writable/uploads/pas/<nama-rawak>` and `http://localhost:8080/uploads/pas/<nama-rawak>` | 404 (cannot be reached) | | |
   | UT-PAS-17 | Staff pass without a vehicle, 2-year period (BR-PAS-06) | Type *Pas Akses Kakitangan* (staff access pass), vehicle "Tiada", `valid_until` = +2 years | Succeeds (vehicle not required; no maximum period) | | |

3. **For UT-PAS-13**, find the vehicle ID of `pemohon2`: `SELECT id, plate_no FROM vehicles WHERE user_id = <id pemohon2>;` (the Day 4 `VehicleSeeder` creates `VXX 2468`; create one synthetic vehicle if there is none).

4. **Record bugs** (if any) below the table in this format: *ID · Steps to reproduce · Expected · Actual · Severity (High/Medium/Low)*. Fix them with the cycle **reproduce → failing test → fix → passing test**.

5. **Clean up** the test data: delete the `PAS-2026-900x` records (Lab 7.2), including `PAS-2026-9003`–`9005` (Lab 7.2b): these rows have no `status_logs` history and would confuse the Day 8 review queue. **Do not** delete files in `writable/uploads/pas/` by hand without deleting the matching `pass_documents` rows.

### ✅ Checkpoint 7.4
- [ ] `docs/ujian-manual-pas.md` contains ≥ 10 cases with the *Actual* & *Result* columns filled in (Quiz S4).
- [ ] UT-PAS-04, 08, 09: **no** new file in `writable/uploads/pas/` and no new `pass_applications` record (Quiz S4).
- [ ] You can explain to the trainer the **OWASP risk** prevented by UT-PAS-07, 09, 15 and 16 (Quiz S4).
- [ ] Commit: `git add docs/ && git commit -m "PAS: kes ujian manual muat naik & pemilikan"` and `git push -u origin feat/pas-permohonan` (Quiz S4).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| UT-PAS-07 shows the "uploaded" message, not "2 MB" | `upload_max_filesize` < 3M — PHP rejects it first | Lab 7.0 step 3 |
| UT-PAS-05 (exactly 2 MB) rejected | The file is actually > 2 097 152 bytes (e.g. `head -c 2097152` + header) | Check `ls -l`: it must be **2097152** |
| UT-PAS-09 **accepted** | `mime_in` missing or `ext_in` uses the old `Rules` (not `StrictRules`) | Check the rules & that `Config\Validation::$ruleSets` uses `StrictRules\FileRules` |
| UT-PAS-04 leaves files on disk | The count check runs **after** `move()` | `assertFiles()` must be called before the `storeFile()` loop |
| UT-PAS-16 shows the file! | File stored in `public/`, or the server's *document root* points at the project root instead of `public/` | `move(WRITEPATH . …)`; Apache/Laragon: *DocumentRoot* = `…/public` |
| `base64: invalid option -- d` (old macOS) | Old `base64` version | Use `base64 -D` |

### ⭐ Bonus challenge
- Upload a file named `"><img src=x onerror=alert(1)>.pdf` (macOS/Linux only) and confirm the name is shown as text in the details (XSS is prevented by `esc()`).
- Before Lab 7.4b: think about why UT-PAS-06 is hard to automate with PHPUnit using a fake `$_FILES`. (Hint: `is_uploaded_file()` and `move_uploaded_file()`; Lab 7.4b step 1 answers it.)
- Switch the default CI4 validation messages to Malay: `app/Language/ms/Validation.php` + `Config\App::$defaultLocale = 'ms'`.

---

## Lab 7.1b — Enum & Entity: Icons, Pending Statuses & Validity Period (S5)

### 🎯 Objective
Add three new methods to the Lab 7.1 code using the same patterns (`match`, a static enum method, Entity methods): `PassType::icon()`, `PassStatus::pending()`/`isPending()`, and `PassApplication::validityDays()`/`daysRemaining()`, then test them in `php spark shell` without the database.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- [Lab 7.1](#lab-71--enums-entity--model-s1) is done and committed.
- `php spark shell` (PsySH) from [Lab 3.2b](../hari-3/lab.en.md#lab-32b--query-builder-in-the-console-s6) works.

### Steps

1. **`PassType::icon()`** — a Bootstrap Icons class for each pass type (used in the Lab 7.2b list). In `app/Enums/PassType.php`, add this method **right after** the `requiresVehicle()` method:

   ```php
       /** Kelas Bootstrap Icons untuk senarai & butiran (Lab 7.1b) */
       public function icon(): string
       {
           return match ($this) {
               self::Kenderaan  => 'bi-car-front',
               self::Kakitangan => 'bi-person-badge',
               self::Kontraktor => 'bi-tools',
           };
       }
   ```

2. **`PassStatus::pending()` and `isPending()`** — the statuses still waiting for an officer. The pattern is the same as `BookingStatus::active()` (Day 5): one list in the enum, not `['submitted', 'under_review']` scattered across controllers. In `app/Enums/PassStatus.php`, add **right after** the `isFinal()` method:

   ```php
       /**
        * Status yang menunggu tindakan pegawai (Lab 7.1b) — corak sama seperti BookingStatus::active().
        *
        * @return list<string> ['submitted', 'under_review']
        */
       public static function pending(): array
       {
           return [self::Submitted->value, self::UnderReview->value];
       }

       /** true jika status ini masih menunggu tindakan pegawai */
       public function isPending(): bool
       {
           return in_array($this->value, self::pending(), true);
       }
   ```

3. **`validityDays()` and `daysRemaining()`** — in `app/Entities/PassApplication.php`, add these two methods **before the closing `}` of the class** (after `displayStatus()`). `PassStatus` and `Time` are already imported with `use` at the top of the file:

   ```php
       /**
        * Bilangan hari kalendar dalam tempoh sah, termasuk hari pertama & terakhir
        * (1 Okt hingga 1 Okt = 1 hari) — corak sama seperti SlotBooking::durationDays().
        */
       public function validityDays(): int
       {
           return $this->valid_from->diff($this->valid_until)->days + 1;   // Time (lihat $dates)
       }

       /**
        * Baki hari pas yang DILULUSKAN, dikira dari $today (lalai: hari ini).
        * 0 = tamat hari ini. null = belum/tidak diluluskan, atau sudah tamat tempoh.
        */
       public function daysRemaining(?Time $today = null): ?int
       {
           $today ??= Time::today();
           $until = $this->valid_until;

           if ($this->statusEnum() !== PassStatus::Approved || $until->isBefore($today)) {
               return null;
           }

           return $today->diff($until)->days;
       }
   ```

   `daysRemaining()` takes `$today` as a parameter so it can be tested with a fixed date — the test result does not change with the day it runs.

4. **Check the syntax:**

   ```bash
   php -l app/Enums/PassType.php
   php -l app/Enums/PassStatus.php
   php -l app/Entities/PassApplication.php
   ```

5. **Test in the console.** Run `php spark shell`, then type each line below, press Enter and record the result. The Entity is built in memory — no record is saved in the database:

   ```text
   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use CodeIgniter\I18n\Time;
   PassStatus::pending()
   PassStatus::Approved->isPending()
   PassType::Kontraktor->icon()
   $p = new PassApplication(['user_id' => 2, 'pass_type' => 'kontraktor', 'status' => 'approved', 'valid_from' => '2026-10-01', 'valid_until' => '2026-10-31'])
   $p->validityDays()
   $p->daysRemaining(Time::parse('2026-10-20'))
   $p->daysRemaining(Time::parse('2026-10-31'))
   $p->daysRemaining(Time::parse('2026-11-01'))
   $p->status = 'submitted'
   $p->daysRemaining(Time::parse('2026-10-20'))
   $p->valid_until = '2026-10-01'
   $p->validityDays()
   exit
   ```

   Record the value of `validityDays()` and of the three `daysRemaining()` calls (Quiz S5 question).

6. **Commit:**

   ```bash tab="Git Bash / macOS / Linux"
   git add app/ && git commit -m "PAS: PassType::icon, PassStatus::pending, validityDays & daysRemaining"
   ```

   ```powershell tab="PowerShell"
   git add app/
   git commit -m "PAS: PassType::icon, PassStatus::pending, validityDays & daysRemaining"
   ```

### ✅ Checkpoint
- [ ] `php -l` reports no syntax error for `PassType.php`, `PassStatus.php` and `PassApplication.php` (Quiz S5).
- [ ] In `php spark shell`: `PassStatus::pending()` returns `submitted` and `under_review`, `PassType::Kontraktor->icon()` returns `bi-tools`, and the `validityDays()` and `daysRemaining()` values from step 5 are recorded (Quiz S5).
- [ ] The commit `PAS: PassType::icon, PassStatus::pending, validityDays & daysRemaining` is in `git log` (Quiz S5).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Command "shell" not found` | Lab 3.2b was not done in this project | Do Lab 3.2b steps 1–2 (`composer require --dev psy/psysh` + `app/Commands/Shell.php`) |
| The `>` prompt does not appear in Git Bash | Separate mintty window | Use the VS Code terminal, or `winpty php spark shell` |
| `Call to undefined method App\Entities\PassApplication::validityDays()` | The method was pasted outside the class, or the file is not saved | Save the file; the method must be before the last `}`; leave (`exit`) and reopen `php spark shell` |
| `validityDays()` returns `30` for 1–31 Oct | The `+ 1` is missing | The validity period **includes** the first and the last day |
| `UnhandledMatchError` in `icon()` | One `case` has no `match` arm | Exactly three arms: `Kenderaan`, `Kakitangan`, `Kontraktor` |

### ⭐ Bonus challenge
- Write `tests/unit/Enums/PassTypeTest.php` that checks **every** `PassType::cases()` has an `icon()` starting with `bi-` and a non-empty `label()` — the test fails automatically if a fourth type is added without an icon.

---

## Lab 7.2b — Type Filter & Search on "My Applications" (S6)

### 🎯 Objective
Add a `?pass_type=` filter and a `?q=` search (reference number or purpose) to `/pas/permohonan` through Model scopes, prove that `orLike()` without `groupStart()` leaks other people's applications (BR-PAS-04), and show the type icon and the validity period (Lab 7.1b).

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- [Lab 7.2](#lab-72--routes-service--listdetail-views-s2) and [Lab 7.1b](#lab-71b--enum--entity-icons-pending-statuses--validity-period-s5) are done. The `PAS-2026-9001` (`pemohon1`) and `PAS-2026-9002` (`pemohon2`) data from Lab 7.2 step 7 exist.

### Steps

1. **Three more synthetic applications for `pemohon1`** — run this in a MySQL client (Laragon HeidiSQL or `mysql`) on the `kkm_latihan` database. The user and vehicle IDs are looked up by e-mail and plate, so there is no number to replace:

   ```sql
   SET @p1 = (SELECT user_id FROM auth_identities WHERE secret = 'pemohon1@latihan.test');
   SET @v1 = (SELECT id FROM vehicles WHERE plate_no = 'WXX 1234');

   INSERT INTO pass_applications (ref_no, user_id, pass_type, vehicle_id, purpose, valid_from, valid_until, status, created_at, updated_at) VALUES
   ('PAS-2026-9003', @p1, 'kenderaan',  @v1,  'Pelekat kenderaan untuk parkir Blok A (sintetik)', '2026-11-01', '2027-10-31', 'submitted',    NOW(), NOW()),
   ('PAS-2026-9004', @p1, 'kontraktor', NULL, 'Kerja pendawaian semula Blok C (sintetik)',        '2026-10-15', '2026-12-15', 'approved',     NOW(), NOW()),
   ('PAS-2026-9005', @p1, 'kakitangan', NULL, 'Akses makmal komputer aras 3 (sintetik)',          '2026-10-01', '2026-10-01', 'under_review', NOW(), NOW());

   SELECT ref_no, pass_type, status FROM pass_applications WHERE user_id = @p1 ORDER BY ref_no;
   ```

   `SELECT` result: 4 rows (`PAS-2026-9001`, `9003`, `9004`, `9005`). The `PAS-2026-900x` records are deleted together with the Lab 7.2 data in Lab 7.4 step 5.

2. **Model scopes — first version.** In `app/Models/PassApplicationModel.php`, add these two methods **right before** the `withApplicant()` method. This `search()` is **wrong on purpose**; step 6 fixes it:

   ```php
       /** Penapis jenis pas pilihan (null = semua) — Lab 7.2b */
       public function withType(?PassType $type): static
       {
           if ($type !== null) {
               $this->where('pass_applications.pass_type', $type->value);
           }

           return $this;
       }

       /** VERSI PERTAMA — sengaja tanpa kurungan (langkah 6 membetulkannya) */
       public function search(string $q): static
       {
           if ($q !== '') {
               $this->like('pass_applications.ref_no', $q)
                   ->orLike('pass_applications.purpose', $q);
           }

           return $this;
       }
   ```

3. **Controller.** In `app/Controllers/Pas/ApplicationController.php`:
   - add `use App\Enums\PassType;` below the line `use App\Enums\PassStatus;`;
   - replace the whole `index()` method with the version below. `show()` and `findVisibleOr404()` do not change.

   ```php
       /** GET /pas/permohonan — "Permohonan Saya" (BR-PAS-04: SENTIASA skop pemilik) */
       public function index(): string
       {
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');   // input asing → null

           // Lab 7.2b: penapis jenis + carian — input asing diabaikan, carian dihadkan 50 aksara
           $typeInput = $this->request->getGet('pass_type');
           $type      = PassType::tryFrom(is_string($typeInput) ? $typeInput : '');
           $qInput    = $this->request->getGet('q');
           $q         = is_string($qInput) ? mb_substr(trim($qInput), 0, 50) : '';

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->withType($type)
               ->search($q)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
               'type'         => $type,
               'q'            => $q,
           ]);
       }
   ```

4. **View.** Replace the whole content of `app/Views/pas/index.php`. Compared with Lab 7.2: two new filter fields, a *Set semula* (reset) link, the `$pager->getTotal()` count, the type icon and the number of days in the validity period:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan Pas Saya<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <div class="d-flex justify-content-between align-items-center mb-3">
       <h1 class="h3 mb-0">Permohonan Pas Saya</h1>
       <a href="<?= url_to('pas.new') ?>" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Mohon Pas</a>
   </div>

   <form method="get" class="row g-2 mb-3" role="search">
       <div class="col-auto">
           <label for="status" class="visually-hidden">Status</label>
           <select name="status" id="status" class="form-select">
               <option value="">Semua status</option>
               <?php foreach (\App\Enums\PassStatus::cases() as $case): ?>
                   <option value="<?= esc($case->value, 'attr') ?>" <?= $status === $case ? 'selected' : '' ?>>
                       <?= esc($case->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
       </div>
       <div class="col-auto">
           <label for="pass_type" class="visually-hidden">Jenis pas</label>
           <select name="pass_type" id="pass_type" class="form-select">
               <option value="">Semua jenis</option>
               <?php foreach (\App\Enums\PassType::cases() as $case): ?>
                   <option value="<?= esc($case->value, 'attr') ?>" <?= $type === $case ? 'selected' : '' ?>>
                       <?= esc($case->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
       </div>
       <div class="col-auto">
           <label for="q" class="visually-hidden">Carian</label>
           <input type="search" name="q" id="q" value="<?= esc($q, 'attr') ?>" maxlength="50"
                  class="form-control" placeholder="No. rujukan / tujuan">
       </div>
       <div class="col-auto"><button type="submit" class="btn btn-outline-secondary">Tapis</button></div>
       <div class="col-auto"><a href="<?= url_to('pas.index') ?>" class="btn btn-link">Set semula</a></div>
   </form>

   <?php if ($applications === []): ?>
       <div class="alert alert-info">Tiada permohonan untuk dipaparkan.</div>
   <?php else: ?>
       <p class="text-body-secondary small mb-2"><?= esc((string) $pager->getTotal()) ?> permohonan ditemui.</p>
       <div class="table-responsive">
           <table class="table table-hover align-middle">
               <thead>
                   <tr><th>No. Rujukan</th><th>Jenis</th><th>Tempoh Sah</th><th>Status</th><th>Tarikh Mohon</th><th></th></tr>
               </thead>
               <tbody>
               <?php foreach ($applications as $app): ?>
                   <?php $shown = $app->displayStatus(); ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($app->ref_no) ?></td>
                       <td><i class="bi <?= esc($app->typeEnum()->icon(), 'attr') ?>" aria-hidden="true"></i> <?= esc($app->typeEnum()->label()) ?></td>
                       <td>
                           <?= esc($app->valid_from->format('d/m/Y')) ?> – <?= esc($app->valid_until->format('d/m/Y')) ?>
                           <small class="text-body-secondary">(<?= esc((string) $app->validityDays()) ?> hari)</small>
                       </td>
                       <td><span class="badge <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span></td>
                       <td><?= esc($app->created_at->format('d/m/Y')) ?></td>
                       <td><a href="<?= url_to('pas.show', $app->id) ?>" class="btn btn-sm btn-outline-primary">Lihat</a></td>
                   </tr>
               <?php endforeach ?>
               </tbody>
           </table>
       </div>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```

5. **Prove the leak.** Log in as `pemohon2@latihan.test` and open `http://localhost:8080/pas/permohonan?q=sintetik`. Record the line *"N permohonan ditemui"* and the reference numbers shown (Quiz S6 question). Then open the Debug Toolbar → **Database** tab → the `SELECT … FROM pass_applications` query. The real SQL:

   ```sql
   -- 3 = id pemohon2 dalam contoh ini
   WHERE `pass_applications`.`user_id` = 3
   AND  `pass_applications`.`ref_no` LIKE '%sintetik%' ESCAPE '!'
   OR  `pass_applications`.`purpose` LIKE '%sintetik%' ESCAPE '!'
   ```

   `AND` binds tighter than `OR`, so MySQL reads `(user_id = 3 AND ref_no LIKE …) OR purpose LIKE …` — the second condition is no longer limited to the owner. Click **Lihat** on `PAS-2026-9001`: `404`, because `findVisibleOr404()` still checks ownership. The list has already leaked the reference number, purpose and dates.

6. **Fix it.** Replace the `search()` method (first version) with the bracketed version below. `withType()` stays:

   ```php
       /**
        * Carian pada no. rujukan ATAU tujuan — Lab 7.2b.
        * groupStart()/groupEnd() = kurungan: (ref_no LIKE … OR purpose LIKE …).
        * Tanpa kurungan, OR "melompat" keluar dari skop ownedBy() (BR-PAS-04).
        */
       public function search(string $q): static
       {
           if ($q !== '') {
               $this->groupStart()
                   ->like('pass_applications.ref_no', $q)
                   ->orLike('pass_applications.purpose', $q)
                   ->groupEnd();
           }

           return $this;
       }
   ```

   Reload `?q=sintetik` as `pemohon2`: now **1** application (`PAS-2026-9002`). The Database tab shows `AND ( … LIKE … OR … LIKE … )`.

7. **Test the filters as `pemohon1`.** Record the reference numbers and the count for each URL:

   | URL | Check |
   |-----|-------|
   | `/pas/permohonan` | 4 applications; the Jenis column has icons; `PAS-2026-9005` → `(1 hari)` |
   | `/pas/permohonan?pass_type=kontraktor&q=blok` | Quiz S6 question |
   | `/pas/permohonan?q=BLOK` | Upper/lower case — `utf8mb4_unicode_ci` collation (Day 3) |
   | `/pas/permohonan?status=approved&pass_type=kontraktor` | Two filters at once (status + type) |
   | `/pas/permohonan?pass_type=vip&q[]=x` | No error; the full list (unknown input is ignored) |

8. **Validity period on the detail page.** In `app/Views/pas/show.php`, replace the `<dt>Tempoh sah</dt>` + `<dd>…</dd>` pair with the block below. Open `PAS-2026-9004` (`approved`): the *Baki N hari* badge appears; on `PAS-2026-9001` (`submitted`) there is no badge.

   ```php
       <dt class="col-sm-3">Tempoh sah</dt>
       <dd class="col-sm-9">
           <?= esc($application->valid_from->format('d/m/Y')) ?> hingga <?= esc($application->valid_until->format('d/m/Y')) ?>
           <small class="text-body-secondary">(<?= esc((string) $application->validityDays()) ?> hari)</small>
           <?php $remaining = $application->daysRemaining(); ?>
           <?php if ($remaining !== null): ?>
               <span class="badge text-bg-light border">Baki <?= esc((string) $remaining) ?> hari</span>
           <?php endif ?>
       </dd>
   ```

9. **Commit** (the bracketed `search()` version only):

   ```bash tab="Git Bash / macOS / Linux"
   git add app/ && git commit -m "PAS: penapis jenis & carian Permohonan Saya (BR-PAS-04)"
   ```

   ```powershell tab="PowerShell"
   git add app/
   git commit -m "PAS: penapis jenis & carian Permohonan Saya (BR-PAS-04)"
   ```

### ✅ Checkpoint
- [ ] With the first `search()` version, `pemohon2` at `?q=sintetik` sees `pemohon1`'s applications; the Database tab shows an `OR` without brackets (Quiz S6).
- [ ] After `groupStart()`/`groupEnd()`, `pemohon2` at `?q=sintetik` sees **1** application only, and the step 7 table is complete for `pemohon1` (Quiz S6).
- [ ] The detail page shows `(N hari)` and the *Baki N hari* badge for `approved` passes only; commit `PAS: penapis jenis & carian Permohonan Saya (BR-PAS-04)` (Quiz S6).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Undefined variable $type` in `pas/index.php` | The old `index()` still passes only 3 variables | Step 3: the new `index()` passes `type` and `q` |
| `Class "App\Controllers\Pas\PassType" not found` | `use App\Enums\PassType;` is missing in the controller | Add the `use` line (step 3) |
| `Call to undefined method App\Models\PassApplicationModel::search()` | The method was pasted into another class, or the file is not saved | It must be in `PassApplicationModel`, before `withApplicant()` |
| The page 2 link loses `?q=` | The pager link was written by hand | Use `$pager->links()` — the CI4 pager keeps the current query string |
| `?q=%` shows all of your own applications | CI4 `like()` does not escape `%` and `_` in the value | Not a leak (still owner-scoped) — see ⭐ |

### ⭐ Bonus challenge
- Escape the wildcard characters: `->like('pass_applications.ref_no', $this->db->escapeLikeString($q))` (the same for `orLike`). Test `?q=%` again — now there is no result.
- Add a count per type above the table ("Kenderaan: 1 · Kakitangan: 2 · Kontraktor: 1") with one `groupBy('pass_type')` query inside the `ownedBy()` scope.

---

## Lab 7.3b — Adding Follow-up Documents to an Application (S7)

### 🎯 Objective
Build a `POST /pas/permohonan/{id}/dokumen` route that lets the **owner** add documents to an existing `submitted` application, with the same file rules as Lab 7.3, the **3 documents per application** limit (BR-PAS-02) checked before `move()` and again under a `FOR UPDATE` row lock, and file cleanup on failure.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- [Lab 7.3](#lab-73--form-validation-upload--download-s3) is done: `PAS-2026-0001` owned by `pemohon1` has **2** documents (`surat-sokongan.pdf`, `gambar.png`).
- The `~/ujian-pas/` folder has `surat-sokongan.pdf` and `gambar.png` (Lab 7.3 step 5).

### Steps

1. **Extra test files:**

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/ujian-pas
   cp surat-sokongan.pdf surat-2.pdf; cp surat-sokongan.pdf surat-3.pdf
   printf '<?php phpinfo(); ?>\n' > borang.pdf
   cd ~/latihan/kelas-ci-<nama>
   ```

   ```powershell tab="PowerShell"
   cd $HOME\ujian-pas
   Copy-Item surat-sokongan.pdf surat-2.pdf
   Copy-Item surat-sokongan.pdf surat-3.pdf
   Set-Content -Path borang.pdf -Value '<?php phpinfo(); ?>' -Encoding ascii
   cd $HOME\latihan\kelas-ci-<nama>
   ```

2. **Route.** In `app/Config/Routes.php`, add these two lines **after** the closing `});` of the `pas/permohonan` group (not inside it):

   ```php
   // Lab 7.3b — di LUAR kumpulan supaya kekal apabila Lab 8.2 menggantikan kumpulan pas/permohonan
   $routes->post('pas/permohonan/(:num)/dokumen', 'Pas\ApplicationController::addDocuments/$1', ['as' => 'pas.dokumen.tambah', 'filter' => 'session']);
   ```

   Lab 8.2 will replace the whole `pas/permohonan` group; a route outside the group is not touched. Check: `php spark routes | grep pas/permohonan` (PowerShell: `php spark routes | Select-String pas/permohonan`) → **6** rows, including `POST | pas/permohonan/([0-9]+)/dokumen | pas.dokumen.tambah`.

3. **Service — public method.** In `app/Services/PassWorkflowService.php`, add this block **right after** the `submit()` method (before the `canView()` docblock). Every `use` it needs is already there since Lab 7.3:

   ```php
       // =================================================================
       // LAB 7.3b — tambah dokumen susulan (status kekal submitted)
       // =================================================================

       /**
        * @param list<UploadedFile> $files fail yang SUDAH lulus rules validasi controller
        *
        * @return int bilangan dokumen yang ditambah
        *
        * @throws InvalidArgumentException ralat perniagaan — mesej BM, selamat dipapar kepada pengguna
        */
       public function addDocuments(int $applicationId, int $userId, array $files): int
       {
           $application = $this->applications->find($applicationId);

           // Pemilik SAHAJA: pegawai boleh melihat (canView), tetapi tidak menambah dokumen bagi pihak pemohon
           if ($application === null || ! $application->isOwnedBy($userId)) {
               throw PageNotFoundException::forPageNotFound();
           }

           // --- Semakan SEBELUM menyentuh cakera (sama seperti submit()) --------
           $this->assertSubmitted($application->statusEnum());
           $this->assertFiles($files);                                  // jenis, saiz, 1–3 fail
           $this->assertDocumentQuota($applicationId, count($files));   // BR-PAS-02: jumlah ≤ 3

           $stored        = [];
           $inTransaction = false;

           try {
               foreach ($files as $file) {
                   $stored[] = $this->storeFile($file);
               }

               $this->db->transException(true)->transBegin();
               $inTransaction = true;

               // Kunci baris permohonan (corak Lab 6.2): dua tab serentak tidak boleh melepasi had,
               // dan pegawai tidak boleh "Mula Semakan" di tengah-tengah tambahan ini.
               $row = $this->db->query('SELECT status FROM pass_applications WHERE id = ? FOR UPDATE', [$applicationId])->getRowArray();
               $this->assertSubmitted(PassStatus::from((string) $row['status']));
               $this->assertDocumentQuota($applicationId, count($stored));   // kira semula di bawah kunci

               foreach ($stored as $doc) {
                   if ($this->documents->insert($doc + ['application_id' => $applicationId]) === false) {
                       throw new RuntimeException('Gagal menyimpan dokumen: ' . implode(' ', $this->documents->errors()));
                   }
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               if ($inTransaction) {
                   $this->db->transRollback();
               }
               $this->deleteStoredFiles($stored);   // tiada fail "yatim" di cakera

               throw $e;
           }

           return count($stored);
       }
   ```

4. **Service — two helpers.** In the same file, *Dalaman* (internal) section, add **right before** the `/** @param list<UploadedFile> $files */` docblock of the `assertFiles()` method:

   ```php
       /** Lab 7.3b: dokumen hanya boleh ditambah sebelum pegawai mula menyemak */
       private function assertSubmitted(PassStatus $status): void
       {
           if ($status !== PassStatus::Submitted) {
               throw new InvalidArgumentException('Dokumen hanya boleh ditambah sebelum permohonan mula disemak.');
           }
       }

       /** Lab 7.3b — BR-PAS-02: maksimum 3 dokumen bagi SETIAP permohonan (sedia ada + baharu) */
       private function assertDocumentQuota(int $applicationId, int $adding): void
       {
           $existing = $this->documents->where('application_id', $applicationId)->countAllResults();

           if ($existing + $adding > self::MAX_FILES) {
               throw new InvalidArgumentException(sprintf(
                   'Permohonan ini sudah ada %d dokumen. Maksimum %d dokumen bagi setiap permohonan.',
                   $existing,
                   self::MAX_FILES,
               ));
           }
       }
   ```

5. **Controller.** In `app/Controllers/Pas/ApplicationController.php`, add this method **right after** `download()` (before the `// -----` line). It calls the existing `rules()` and `uploadedFiles()`:

   ```php
       /** POST /pas/permohonan/{id}/dokumen — tambah dokumen susulan (Lab 7.3b) */
       public function addDocuments(string $id): RedirectResponse
       {
           $application = $this->findVisibleOr404((int) $id);
           $back        = url_to('pas.show', $application->id);

           // Rule fail yang SAMA seperti borang permohonan — satu sumber kebenaran (BR-PAS-02)
           if (! $this->validate(['documents' => $this->rules()['documents']])) {
               return redirect()->to($back)->withInput();
           }

           try {
               $added = service('passWorkflowService')->addDocuments(
                   $application->id,
                   (int) auth()->id(),
                   $this->uploadedFiles('documents'),
               );
           } catch (InvalidArgumentException $e) {
               return redirect()->to($back)->with('error', $e->getMessage());
           }

           return redirect()->to($back)->with('message', "{$added} dokumen ditambah pada {$application->ref_no}.");
       }
   ```

6. **View.** In `app/Views/pas/show.php`, replace the line `<?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>` with the block below. That Day 8 comment line **stays** at the end of the block — Lab 8.1 replaces it tomorrow:

   ```php
   <?php
   // Lab 7.3b: pemilik boleh menambah dokumen selagi permohonan belum disemak dan masih < 3 dokumen
   $canAddDocuments = $application->isOwnedBy((int) auth()->id())
       && $application->statusEnum() === \App\Enums\PassStatus::Submitted
       && count($documents) < \App\Services\PassWorkflowService::MAX_FILES;
   ?>
   <?php if ($canAddDocuments): ?>
       <div class="card mb-4">
           <div class="card-header"><i class="bi bi-paperclip" aria-hidden="true"></i> Tambah dokumen susulan</div>
           <div class="card-body">
               <?= form_open_multipart(url_to('pas.dokumen.tambah', $application->id), ['novalidate' => true]) ?>
                   <label for="documents" class="form-label">Dokumen sokongan</label>
                   <input type="file" name="documents[]" id="documents" multiple accept=".pdf,.jpg,.png"
                          class="form-control <?= validation_show_error('documents') ? 'is-invalid' : '' ?>">
                   <div class="invalid-feedback"><?= validation_show_error('documents') ?></div>
                   <div class="form-text">
                       PDF, JPG atau PNG · maksimum 2 MB setiap fail · boleh tambah
                       <?= esc((string) (\App\Services\PassWorkflowService::MAX_FILES - count($documents))) ?> dokumen lagi.
                   </div>
                   <button type="submit" class="btn btn-outline-primary mt-2"><i class="bi bi-upload" aria-hidden="true"></i> Muat naik</button>
               <?= form_close() ?>
           </div>
       </div>
   <?php endif ?>

   <?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>
   ```

7. **Test as `pemohon1`** on `PAS-2026-0001` (2 documents). After each attempt, run `ls writable/uploads/pas/ | wc -l` (PowerShell: `(Get-ChildItem writable/uploads/pas/).Count`) from the project folder:

   | # | Files chosen | Expected |
   |---|-----------|----------|
   | a | `surat-2.pdf` **and** `surat-3.pdf` | Red message (Quiz S7 question); the number of files on disk does not change |
   | b | `borang.pdf` | *Hanya fail PDF, JPG atau PNG dibenarkan.* under the field |
   | c | No file | *Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah.* |
   | d | `surat-2.pdf` only | *1 dokumen ditambah pada PAS-2026-0001.*; the list has 3 documents; the *Tambah dokumen susulan* card disappears; +1 file on disk |

8. **IDOR through the form.** Log in as `pemohon2` (incognito window) and open `PAS-2026-9002` (0 documents — the card appears). DevTools (F12) → **Elements** → find `<form … action="…/pas/permohonan/<id 9002>/dokumen">` → double-click the `action` value → change the ID to the ID of `PAS-2026-0001` → Enter. Choose `surat-3.pdf` → **Muat naik**. Record the response (Quiz S7 question).

9. **Stale form (status changed).** Still as `pemohon2`, open `PAS-2026-9002` again (the card appears). Do **not** reload the page. In the MySQL client:

   ```sql
   UPDATE pass_applications SET status = 'under_review' WHERE ref_no = 'PAS-2026-9002';
   ```

   Go back to the tab, choose `surat-3.pdf` → **Muat naik** → *Dokumen hanya boleh ditambah sebelum permohonan mula disemak.* The card is now gone. Restore:

   ```sql
   UPDATE pass_applications SET status = 'submitted' WHERE ref_no = 'PAS-2026-9002';
   ```

10. **Commit:**

    ```bash tab="Git Bash / macOS / Linux"
    git add app/ && git commit -m "PAS: tambah dokumen susulan, had 3 dokumen setiap permohonan (BR-PAS-02)"
    ```

    ```powershell tab="PowerShell"
    git add app/
    git commit -m "PAS: tambah dokumen susulan, had 3 dokumen setiap permohonan (BR-PAS-02)"
    ```

### ✅ Checkpoint
- [ ] `php spark routes | grep pas/permohonan` → 6 rows including `pas.dokumen.tambah` with the `session` filter (Quiz S7).
- [ ] Cases a–c of step 7 are rejected with no new file on disk; case d brings `PAS-2026-0001` to 3 documents and the add card disappears (Quiz S7).
- [ ] `pemohon2` changing the form `action` to `pemohon1`'s application is rejected, and the stale form after `under_review` is rejected with a Malay message (Quiz S7).
- [ ] Commit `PAS: tambah dokumen susulan, had 3 dokumen setiap permohonan (BR-PAS-02)` (Quiz S7).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Route "pas.dokumen.tambah" not found` / `InvalidArgumentException` in `url_to()` | The route is not added yet, or added in another file | Step 2 — in `app/Config/Routes.php`, after the group |
| `Controller or its method is not found: \App\Controllers\ApplicationController::addDocuments` | `Pas\` is missing from the controller string (a route outside the group has no `namespace`) | `'Pas\ApplicationController::addDocuments/$1'` |
| The add card does not appear for the owner | The status is not `submitted`, or there are already 3 documents | Check `SELECT status FROM pass_applications …` and the number of `pass_documents` rows |
| The validation error is not shown under the field | `redirect()->to(...)` without `->withInput()` | `withInput()` carries the validation errors to the next request |
| `Call to undefined method …::assertDocumentQuota()` | Step 4 was skipped | Add the two helpers in `PassWorkflowService` |
| Files are moved to disk first, and only then the *sudah ada N dokumen* message | The first `assertDocumentQuota()` call is missing; only the check under the lock runs | Call it **before** the `storeFile()` loop (step 3) — cheap checks first, disk later |

### ⭐ Bonus challenge
- Record the document addition in the audit table without breaking the meaning of `status_logs` (`from_status` = `to_status` = `submitted`, `remarks` = *"2 dokumen ditambah"*). Is this right, or should there be another table? Discuss with the trainer.
- Let the owner **delete** their own document while `submitted` (delete the `pass_documents` row **and** the file on disk — in which order?).

---

## Lab 7.4b — Automating the Boundary Cases with PHPUnit (S8)

### 🎯 Objective
Automate 10 Lab 7.4 boundary cases and 4 Lab 7.3b cases in `tests/feature/Pas/PassSubmitTest.php` with a fake `UploadedFile`, `#[DataProvider]` and a "no side effects" check (no row, no orphan file), then prove the tests catch a `>` vs `>=` bug with a deliberate mutation.

### Prerequisites
- 🪟 **Windows:** Git Bash is recommended ([`persediaan.md`](../docs/persediaan.md) §5). If your VS Code terminal is PowerShell, pick the **PowerShell** tab on command blocks that have two tabs; blocks without tabs work in both terminals.
- [Lab 7.4](#lab-74--manual-boundary-case-testing-s4) and [Lab 7.3b](#lab-73b--adding-follow-up-documents-to-an-application-s7) are done.
- The `kkm_latihan_test` test database and `database.tests.*` in `.env` (Lab 6.3): `php spark db:table --show --dbgroup tests` works.

### Steps

1. **A fake `UploadedFile`.** In the CLI, `is_uploaded_file()` and `move_uploaded_file()` are always `false`, so a real `UploadedFile` cannot be used in a test. This class replaces **two** methods only; `getMimeType()`, `guessExtension()` and `getSize()` stay real CI4 code. The `tests/_support/` folder already exists (appstarter; the `Tests\Support` namespace in `composer.json`):

   `tests/_support/FakeUploadedFile.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Support;

   use CodeIgniter\HTTP\Files\UploadedFile;

   /**
    * UploadedFile untuk ujian: fail sementara biasa, bukan dari HTTP POST.
    * Dalam CLI, is_uploaded_file() dan move_uploaded_file() sentiasa false — hanya
    * isValid() dan move() diganti. getMimeType() (finfo), guessExtension() dan getSize()
    * kekal kod CI4 sebenar, jadi semakan BR-PAS-02 diuji dengan kandungan fail sebenar.
    */
   final class FakeUploadedFile extends UploadedFile
   {
       /** Cipta fail sementara dengan kandungan & nama asal (nama dari "pelayar") yang diberi */
       public static function make(string $content, string $clientName): self
       {
           $path = tempnam(sys_get_temp_dir(), 'pas');
           file_put_contents($path, $content);

           return new self($path, $clientName, null, strlen($content), UPLOAD_ERR_OK);
       }

       public function isValid(): bool
       {
           return $this->error === UPLOAD_ERR_OK && is_file($this->path);
       }

       public function move(string $targetPath, ?string $name = null, bool $overwrite = false): bool
       {
           $targetPath = rtrim($targetPath, '/\\') . DIRECTORY_SEPARATOR;

           if (! is_dir($targetPath)) {
               mkdir($targetPath, 0775, true);
           }

           $name ??= $this->getName();
           rename($this->path, $targetPath . $name);

           $this->path     = $targetPath . $name;
           $this->name     = $name;
           $this->hasMoved = true;

           return true;
       }
   }
   ```

2. **The test class.**

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p tests/feature/Pas
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force tests\feature\Pas | Out-Null
   ```

   `tests/feature/Pas/PassSubmitTest.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Feature\Pas;

   use App\Enums\PassStatus;
   use App\Services\PassWorkflowService;
   use App\Services\ReferenceNumberService;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\Test\CIUnitTestCase;
   use CodeIgniter\Test\DatabaseTestTrait;
   use InvalidArgumentException;
   use PHPUnit\Framework\Attributes\DataProvider;
   use Tests\Support\FakeUploadedFile;

   /**
    * Lab 7.4b — kes sempadan Lab 7.4 (UT-PAS-…) diautomasikan di lapisan Service.
    * Setiap kes ditolak mesti: (1) mesej BM yang betul, (2) tiada baris baharu, (3) tiada fail baharu di cakera.
    *
    * @internal
    */
   final class PassSubmitTest extends CIUnitTestCase
   {
       use DatabaseTestTrait;

       protected $migrate   = true;
       protected $refresh   = true;
       protected $namespace = null;   // App + Shield + Settings

       private const PDF = "%PDF-1.4\n% Dokumen sintetik latihan KKM\n";
       private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

       private PassWorkflowService $service;
       private int $applicantId;
       private int $otherApplicantId;
       private int $otherVehicleId;

       /** @var list<string> fail dalam writable/uploads/pas/ SEBELUM ujian */
       private array $filesBefore = [];

       protected function setUp(): void
       {
           parent::setUp();

           $this->applicantId      = $this->makeUser('ujian_pas1', 'Pemohon Pas Satu');
           $this->otherApplicantId = $this->makeUser('ujian_pas2', 'Pemohon Pas Dua');

           $this->db->table('vehicles')->insert(['user_id' => $this->otherApplicantId, 'plate_no' => 'WXX 0002', 'model' => 'Perodua Myvi', 'color' => 'Biru']);
           $this->otherVehicleId = (int) $this->db->insertID();

           $this->service     = new PassWorkflowService($this->db, new ReferenceNumberService($this->db));
           $this->filesBefore = $this->filesOnDisk();
       }

       protected function tearDown(): void
       {
           // Buang fail yang dicipta oleh ujian ini SAHAJA — fail latihan anda kekal
           foreach (array_diff($this->filesOnDisk(), $this->filesBefore) as $path) {
               unlink($path);
           }

           parent::tearDown();
       }

       // =================================================================
       // Kes diterima (UT-PAS-01, 02, 05)
       // =================================================================

       public function testSatuPdfSahDiterima(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('surat-sokongan.pdf')]);

           $this->assertSame('PAS-' . date('Y') . '-0001', $application->ref_no);
           $this->assertSame(PassStatus::Submitted, $application->statusEnum());
           $this->seeInDatabase('pass_documents', ['application_id' => $application->id, 'original_name' => 'surat-sokongan.pdf', 'mime' => 'application/pdf']);
           $this->seeInDatabase('status_logs', ['module' => 'PAS', 'record_id' => $application->id, 'from_status' => null, 'to_status' => 'submitted']);
           $this->assertCount(1, $this->newFiles());
       }

       public function testTigaFailSahDiterima(): void
       {
           $files = [$this->pdf('surat-sokongan.pdf'), $this->pdf('surat-2.pdf'), $this->png('gambar.png')];

           $application = $this->service->submit($this->applicantId, $this->payload(), $files);

           $this->seeNumRecords(3, 'pass_documents', ['application_id' => $application->id]);
           $this->assertCount(3, $this->newFiles());
       }

       public function testTepat2MbDiterima(): void
       {
           $file = FakeUploadedFile::make(str_pad(self::PDF, PassWorkflowService::MAX_BYTES, "\0"), 'tepat-2mb.pdf');

           $application = $this->service->submit($this->applicantId, $this->payload(), [$file]);

           $this->seeInDatabase('pass_documents', ['application_id' => $application->id, 'size_bytes' => 2_097_152]);
       }

       // =================================================================
       // Kes ditolak (UT-PAS-04, 06, 08, 09, 10, 11, 13)
       // =================================================================

       /**
        * @return array<string, array{0: list<array{0: string, 1: string}>, 1: array<string, string>, 2: string}>
        */
       public static function rejectedProvider(): array
       {
           $pdf   = ["%PDF-1.4\n", 'surat.pdf'];
           $dates = ['valid_from' => '2026-11-10', 'valid_until' => '2026-11-01'];

           return [
               'UT-PAS-04 empat fail'        => [[$pdf, $pdf, $pdf, $pdf], [], '1 hingga 3 dokumen'],
               'UT-PAS-06 2 MB + 1 bait'     => [[[str_pad("%PDF-1.4\n", 2_097_153, "\0"), 'lebih-2mb.pdf']], [], 'tidak melebihi 2 MB'],
               'UT-PAS-09 PHP bernama .pdf'  => [[["<?php phpinfo(); ?>\n", 'borang.pdf']], [], 'Hanya PDF, JPG atau PNG'],
               'PNG bernama .pdf'            => [[[base64_decode(self::PNG), 'gambar.pdf']], [], 'Hanya PDF, JPG atau PNG'],
               'UT-PAS-10 sambungan .jpeg'   => [[[base64_decode(self::PNG), 'gambar.jpeg']], [], 'Hanya PDF, JPG atau PNG'],
               'UT-PAS-11 tarikh terbalik'   => [[$pdf], $dates, 'Sah hingga'],
               'UT-PAS-13 kenderaan lain'    => [[$pdf], ['pass_type' => 'kenderaan', 'vehicle_id' => 'LAIN'], 'kenderaan anda yang berdaftar'],
           ];
       }

       /**
        * @param list<array{0: string, 1: string}> $files   [kandungan, nama asal]
        * @param array<string, string>             $override medan borang yang diubah
        */
       #[DataProvider('rejectedProvider')]
       public function testKesDitolakTanpaKesanSampingan(array $files, array $override, string $message): void
       {
           if (($override['vehicle_id'] ?? null) === 'LAIN') {
               $override['vehicle_id'] = (string) $this->otherVehicleId;   // kenderaan milik pemohon LAIN (IDOR)
           }

           $uploads = array_map(static fn (array $f): FakeUploadedFile => FakeUploadedFile::make($f[0], $f[1]), $files);

           try {
               $this->service->submit($this->applicantId, $this->payload($override), $uploads);
               $this->fail('Sepatutnya InvalidArgumentException');
           } catch (InvalidArgumentException $e) {
               $this->assertStringContainsString($message, $e->getMessage());
           }

           $this->seeNumRecords(0, 'pass_applications', []);
           $this->seeNumRecords(0, 'pass_documents', []);
           $this->assertSame([], $this->newFiles(), 'Ada fail yatim di writable/uploads/pas/');
       }

       // =================================================================
       // Lab 7.3b — tambah dokumen susulan
       // =================================================================

       public function testTambahDokumenHinggaTigaDiterima(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf'), $this->png('b.png')]);

           $added = $this->service->addDocuments($application->id, $this->applicantId, [$this->pdf('c.pdf')]);

           $this->assertSame(1, $added);
           $this->seeNumRecords(3, 'pass_documents', ['application_id' => $application->id]);
       }

       public function testTambahDokumenMelebihiTigaDitolak(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf'), $this->png('b.png')]);
           $filesAfterSubmit = count($this->newFiles());

           try {
               $this->service->addDocuments($application->id, $this->applicantId, [$this->pdf('c.pdf'), $this->pdf('d.pdf')]);
               $this->fail('Sepatutnya InvalidArgumentException');
           } catch (InvalidArgumentException $e) {
               $this->assertStringContainsString('sudah ada 2 dokumen', $e->getMessage());
           }

           $this->seeNumRecords(2, 'pass_documents', ['application_id' => $application->id]);
           $this->assertCount($filesAfterSubmit, $this->newFiles());
       }

       public function testTambahDokumenSelepasSemakanDitolak(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf')]);
           $this->db->table('pass_applications')->where('id', $application->id)->update(['status' => PassStatus::UnderReview->value]);

           $this->expectException(InvalidArgumentException::class);
           $this->expectExceptionMessage('sebelum permohonan mula disemak');

           $this->service->addDocuments($application->id, $this->applicantId, [$this->pdf('c.pdf')]);
       }

       public function testOrangLainTidakBolehTambahDokumen(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf')]);

           $this->expectException(PageNotFoundException::class);

           $this->service->addDocuments($application->id, $this->otherApplicantId, [$this->pdf('c.pdf')]);
       }

       // =================================================================
       // Pembantu
       // =================================================================

       private function makeUser(string $username, string $fullName): int
       {
           $this->db->table('users')->insert(['username' => $username, 'full_name' => $fullName, 'active' => 1]);

           return (int) $this->db->insertID();
       }

       /**
        * @param array<string, string> $override
        *
        * @return array<string, string>
        */
       private function payload(array $override = []): array
       {
           return $override + [
               'pass_type'   => 'kakitangan',
               'vehicle_id'  => '',
               'purpose'     => 'Akses Blok Pentadbiran (ujian automatik)',
               'valid_from'  => '2026-11-01',
               'valid_until' => '2026-12-31',
           ];
       }

       private function pdf(string $name): FakeUploadedFile
       {
           return FakeUploadedFile::make(self::PDF, $name);
       }

       private function png(string $name): FakeUploadedFile
       {
           return FakeUploadedFile::make(base64_decode(self::PNG), $name);
       }

       /** @return list<string> */
       private function filesOnDisk(): array
       {
           return glob(WRITEPATH . PassWorkflowService::UPLOAD_DIR . '*') ?: [];
       }

       /** @return list<string> fail baharu sejak setUp() */
       private function newFiles(): array
       {
           return array_values(array_diff($this->filesOnDisk(), $this->filesBefore));
       }
   }
   ```

   Read `rejectedProvider()`: each key (e.g. `UT-PAS-04 empat fail`) matches one row of `docs/ujian-manual-pas.md`. The `2 MB + 1 bait` case is tighter than the manual UT-PAS-06 (+1 KB).

3. **Run it** and compare the number of files on disk before and after:

   ```bash tab="Git Bash / macOS / Linux"
   ls writable/uploads/pas/ | wc -l
   composer test -- --no-coverage --testdox tests/feature/Pas/PassSubmitTest.php
   ls writable/uploads/pas/ | wc -l
   ```

   ```powershell tab="PowerShell"
   (Get-ChildItem writable/uploads/pas/).Count
   composer test '--' --no-coverage --testdox tests/feature/Pas/PassSubmitTest.php
   (Get-ChildItem writable/uploads/pas/).Count
   ```

   Record the last line `OK (… tests, … assertions)` (Quiz S8 question). The number of files on disk is the **same** before and after — `tearDown()` deletes only the files the test created.

4. **Deliberate mutation — do the tests catch the bug?** In `PassWorkflowService::assertFiles()`, change `>` to `>=`:

   ```php
   if ((int) $file->getSize() >= self::MAX_BYTES) {
   ```

   Run the step 3 `composer test` command again. Record the name of the failing test and the exception message (Quiz S8 question). Then **restore** `>` and run once more: `OK`.

5. **Link the manual tests to the automated tests.** Add this section at the **end** of `docs/ujian-manual-pas.md`:

   ```markdown

   ## Diautomasikan (Lab 7.4b)

   `composer test -- --no-coverage --testdox tests/feature/Pas/PassSubmitTest.php`

   | Kes manual | Ujian PHPUnit |
   |------------|---------------|
   | UT-PAS-01 | `testSatuPdfSahDiterima` |
   | UT-PAS-02 | `testTigaFailSahDiterima` |
   | UT-PAS-05 | `testTepat2MbDiterima` |
   | UT-PAS-04, 06, 09, 10, 11, 13 | `testKesDitolakTanpaKesanSampingan` (data set `UT-PAS-…`) |
   | Lab 7.3b | `testTambahDokumen…`, `testOrangLainTidakBolehTambahDokumen` |

   Kekal manual: UT-PAS-03, 07, 08, 12 (rules controller), 14–16 (HTTP & server), 17.
   ```

6. **Commit and push:**

   ```bash tab="Git Bash / macOS / Linux"
   git add tests/ docs/ && git commit -m "PAS: ujian PHPUnit kes sempadan muat naik (BR-PAS-02/06)"
   git push
   ```

   ```powershell tab="PowerShell"
   git add tests/ docs/
   git commit -m "PAS: ujian PHPUnit kes sempadan muat naik (BR-PAS-02/06)"
   git push
   ```

### ✅ Checkpoint
- [ ] `composer test -- --no-coverage tests/feature/Pas/PassSubmitTest.php` → `OK`, and the number of files in `writable/uploads/pas/` is the same before and after (Quiz S8).
- [ ] The `>=` mutation in `assertFiles()` makes exactly one test fail; after restoring it every test is `OK` again (Quiz S8).
- [ ] `docs/ujian-manual-pas.md` has the *Diautomasikan (Lab 7.4b)* section; the commit `PAS: ujian PHPUnit kes sempadan muat naik (BR-PAS-02/06)` is pushed (Quiz S8).

### 🧯 Troubleshooting

| Symptom | Cause | Fix |
|--------|-------|--------------|
| `Class "Tests\Support\FakeUploadedFile" not found` | The file is in another folder, or `autoload-dev` is missing from `composer.json` | It must be `tests/_support/FakeUploadedFile.php`; check `"Tests\\Support\\": "tests/_support"`, then `composer dump-autoload` |
| `Unable to connect to the database` / the tests wipe your training data | `database.tests.*` is missing or points to `kkm_latihan` | Lab 6.3: the `tests` group → `kkm_latihan_test` **only** |
| `Ada fail yatim di writable/uploads/pas/` | The checks were moved after `storeFile()` **and** `deleteStoredFiles()` is missing from the `submit()` `catch` | `assertFiles()` before the `storeFile()` loop; the `catch` deletes the files already moved |
| Every `rejectedProvider` case fails with `Sepatutnya InvalidArgumentException` | `submit()` accepts invalid files — no `mime`/`guessExtension()` check | Check the Lab 7.3 `assertFiles()` and the `fileinfo` extension (`php -m`) |
| `pas…` files stay in `%TEMP%` | The fake `move()` is not called because the file is rejected | Normal — OS temporary files; they can be deleted at any time |

### ⭐ Bonus challenge
- Add a `valid_until = valid_from` case (the **valid** BR-PAS-06 boundary) and a vehicle pass with your own vehicle to the "accepted" tests.
- Second mutation: remove `$this->deleteStoredFiles($stored);` from the `submit()` `catch`. Does any test fail? Why? (Hint: where is each case rejected — before or after `storeFile()`?)

---

## Self-check — end of day

```bash
git log --oneline -9                    # 8 "PAS:" commits today (4 core labs + 4 follow-up labs)
php spark routes | grep pas/permohonan  # 6 routes (5 + Lab 7.3b), session filter
composer test -- --no-coverage tests/feature/Pas/PassSubmitTest.php   # OK (Lab 7.4b)
ls writable/uploads/pas/ | head         # random names only
git status                              # clean; writable/uploads not tracked
```

🪟 PowerShell: `php spark routes | Select-String pas/permohonan`, `composer test '--' --no-coverage tests/feature/Pas/PassSubmitTest.php`, `Get-ChildItem writable/uploads/pas/ -Name | Select-Object -First 10`.

Participants who fall behind: copy from `templates/kod/` (**Templat & Rujukan** module) **after** the trainer/a peer has explained each part — and mark it in the commit (`PAS: … (rujuk templat)`).
