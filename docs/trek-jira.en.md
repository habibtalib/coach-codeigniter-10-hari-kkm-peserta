# Jira Track — Your Backlog & Sprints (Optional)

> **Optional side track.** This page shows how you manage the 10 days of work in **Jira Cloud** (Free plan): a backlog from the reference requirements, sprints matched to modules M1–M4, and links between Jira cards and Git branches and commits. It **does not replace** any course deliverable: [`rujukan-keperluan.md`](./rujukan-keperluan.md) (FRs & AC), the BR-* rules in [`spesifikasi-sistem.md`](./spesifikasi-sistem.md) and `docs/pelan-kerja.md` stay the source of truth. Jira is a tracking view on top of them.
> Canon: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · Schedule: [`JADUAL.md`](../JADUAL.md) · Working agreement: [`docs/kolaborasi.md`](kolaborasi.md) · Related tracks: [`trek-gitlab.md`](./trek-gitlab.md) · [`trek-design-thinking.md`](./trek-design-thinking.md)

> ℹ️ **Days 9–10: the class Jira.** This track is solo practice for Days 1–4 on your own site. From Day 9 the class shares **one** Jira site (space `KAN`) for the espkpv2 team backlog, and Claude reads it through the `atlassian` MCP: [`tutorial-jira-mcp.en.md`](./tutorial-jira-mcp.en.md).

> ⚠️ **Finish before Day 4.** Coding starts on Day 4. Setup and the backlog happen on Days 1–2, stories with acceptance criteria on Day 2, and sprint planning on Day 4 S4 before the first line of module code.

> ⚠️ **Warning — synthetic data only.** Jira Cloud is an external service. Don't put real KKM data (patient/staff names, real plates), screenshots of internal systems, passwords or `.env` content into cards. Use made-up values as in SPEC §10 (`pemohon1@latihan.test`, `WXX 1234`).

## 1. Purpose

At the office, most IT teams track work in a tool such as Jira. This track builds the same habits on the course project:

| Concept | What it means in this course |
|--------|-------------------------|
| **Backlog** | The list of unfinished work, ordered by priority — comes straight from the FRs in [`rujukan-keperluan.md`](./rujukan-keperluan.md) |
| **Epic** | One module (M1 TLK, M2 Pass, M3 Report, M4 Statistics) |
| **Story** | One confirmed FR, written from the user's point of view, with the acceptance criteria from [`rujukan-keperluan.md`](./rujukan-keperluan.md) |
| **Sprint** | One block of work with a goal: Sprint 1 = M1, Sprint 2 = M2–M4 |
| **Stand-up** | The 08:30 recap every morning — three questions |
| **Board** | To Do → In Progress → In Review → Done; "Done" means it passes the DoD ([`docs/kolaborasi.md`](kolaborasi.md) §2) |

**Core rule:** every piece of work has a card. If you are working on something that isn't on the board, stop and create its card first.

> 💡 **Current Jira terms.** The Jira Cloud interface now calls a *project* a **space**, an *issue* a **work item** and an *issue type* a **work type**. This page uses the current menu labels (space, work item), but the concepts are the same as in older Jira material. Prices, plan limits and importer menus can also change; if they differ on the course day, follow the Atlassian page.

## 2. When

| Day / session | Step | Minutes |
|-------------|---------|-------|
| Day 1 S4 (after Lab 1.4) | Create the Jira Free site, the Scrum space `TLKPAS`, invite the trainer (§4) | 20 |
| Day 2 recap (08:30) | Create 4 Epics M1–M4 (§5.1) | 10 |
| Day 2 S1 (after FR sign-off) | Create Stories from **confirmed** FRs only (§5.2); rejected FRs stay out | 20 |
| Day 2 S3 | Paste the Given/When/Then AC ([`rujukan-keperluan.md`](./rujukan-keperluan.md) Part 1 S3) into each Story's Description (§5.4) | 20 |
| Day 2 S4 | Priority from MoSCoW, labels, story points through planning poker (§5.3–5.6) | 25 |
| Day 3 S4 (optional) | Add the Day 4 setup Tasks (CI4 project, migrations, seeders) | 10 |
| Day 4 S4 | Sprint planning together with `docs/pelan-kerja.md`; start Sprint 1 (§7.2) | 25 |
| Days 5–10, 08:30 | Stand-up in front of the board (§7.3) | 5 |
| Day 6 S4 · Day 8 S4 · Day 9 S4 | Sprint review at each milestone; close Sprint 1 on Day 6 (§7.4) | 10 |
| Day 10 S4 | Sprint review = capstone demo; Start/Stop/Continue retrospective; close Sprint 2 (§7.4) | 15 |

Total ≈ 2.5 hours over 10 days, mostly in wrap-up time. The Day 1–4 steps are the requirement; the Day 5–10 steps keep the board alive.

## 3. What you end with

By Day 4 S4, you have:

| Result | Evidence |
|-------|-------|
| One Jira Cloud Free site of your own | Your name (and the trainer's, if invited) is listed in the space access |
| A Scrum space with the key `TLKPAS` | Work item keys look like `TLKPAS-12` |
| 4 Epics (M1–M4) | Every Story has an Epic as its parent |
| One Story per confirmed FR | Number of Stories = number of confirmed FRs in `docs/log-keputusan.md` |
| AC in the Description of every Must Story | The AC match the examples in `rujukan-keperluan.md` |
| Priority, labels and story points on every Story | No unestimated Story in the backlog |
| Sprint 1 started with M1 Stories only | The sprint board shows the TLK Stories in To Do |

## 4. Set up Jira Cloud

### 4.1 Free plan facts

Checked on 2026-10-15 against the official Atlassian pages (see Sources):

| Item | Free plan |
|---------|-----------|
| Users | Up to **10 users** — enough for you, the trainer and a few colleagues |
| Storage | **2 GB** of files |
| Agile features | Scrum and Kanban boards, backlog, agile reporting |
| Support | Atlassian Community only |
| Limits | Permissions, roles and work-item-level security are limited; configuration shared between spaces isn't available |

### 4.2 Create the site & space

1. You (the site owner) open <https://www.atlassian.com/software/jira/free> and sign up with your own email. The site owner becomes the Jira administrator — needed for the CSV import (§6).
2. Choose a neutral site name, e.g. `latihan-tlkpas-aminah` (giving `latihan-tlkpas-aminah.atlassian.net`). Don't use an agency name.
3. In the side navigation, hover over **Spaces** → **Create space**.
4. Choose the **Software development** category → the **Scrum** template → **Use template**.
5. Choose **Team-managed** (simple configuration, suits the Free plan).
6. Name the space `Sistem TLK & Pas`. Change the key to **`TLKPAS`** (at least 2 characters, starts with an uppercase letter, uppercase letters or numbers only).
7. Review the suggested default work types, statuses and views → **Create**.
8. Turn on estimation: ••• next to the space name → **Space settings** → **Features** → turn on **Estimation** → choose **Story points**.

✅ A test work item gets the key `TLKPAS-1`. Delete that test work item after checking.

### 4.3 Work types

Use these four work types only:

| Work type | When to use | Example |
|-----------|-----------|--------|
| **Epic** | One module — an umbrella for many Stories | `M1 — Tempat Letak Kenderaan Khas (TLK)` |
| **Story** | One confirmed FR; has value for the user | `As an applicant, I want …` |
| **Task** | Technical work with no user-facing side | `Tulis migration slot_bookings` |
| **Bug** | Wrong behaviour found during testing | `Tempahan 91 hari diterima (BR-TLK-03)` |

Subtasks are allowed under a Story if you want to split the work, but they are not required.

### 4.4 Invite the trainer (optional)

1. The site owner invites the trainer to the site (gear icon / admin settings → invite user by email).
2. After the invitation is accepted: ••• next to the space name → **Space settings** → **Access** → **Add people** → choose the trainer → role **Viewer**.
3. A neighbour who wants to comment on your cards can also be invited with the **Viewer** role. Only you manage the board and sprints.

✅ The trainer can open your board and backlog without changing them.

## 5. Backlog from the course artefacts

### 5.1 Epic = module

Create four Epics, one for each module in SPEC §2:

| Epic | Summary | Label |
|------|-----------|-------|
| M1 | `M1 — Tempat Letak Kenderaan Khas (TLK)` | `tlk` |
| M2 | `M2 — Pas` | `pas` |
| M3 | `M3 — Laporan` | `laporan` |
| M4 | `M4 — Statistik` | `statistik` |

### 5.2 Stories from FRs

One confirmed FR = one Story. Write the **Summary** in user story format and keep the FR ID in the Description:

```text
As a <role>, I want <action>, so that <value>.
```

| FR | Story (Summary) |
|----|-----------------|
| `FR-TLK-03` | As an applicant, I want the system to reject overlapping bookings, so that a slot approved for me isn't claimed by someone else |
| `FR-PAS-02` | As an applicant, I want to upload PDF/JPG/PNG supporting documents, so that the reviewer can assess the application without paper |
| `FR-RPT-01` | As an approver, I want a filtered TLK booking list I can export, so that I can report slot usage |

Rules:
- The role in a Story is a SPEC §4 role (`applicant`, `reviewer`, `approver`, `admin`).
- A Story doesn't name a class (`BookingService`) — that is design. Technical work goes in as a **Task**.
- Your FR IDs may differ from these examples. Follow the FRs in `rujukan-keperluan.md`.

### 5.3 MoSCoW → Priority

| MoSCoW (Lab 1.4) | Jira Priority | Sprint rule |
|------------------|---------------|------------------|
| **Must** | High | Goes into its module's sprint |
| **Should** | Medium | Goes into the sprint if there is capacity |
| **Could** | Low | ⭐ extra challenge; take it after all Musts are Done |
| **Won't** | Lowest + label `wont` | Stays in the backlog; never goes into a sprint |

`Highest` is reserved for a **Bug** that blocks the demo or breaks a BR.

### 5.4 Acceptance criteria in the Description

Copy the AC from [`rujukan-keperluan.md`](./rujukan-keperluan.md) into the Description, under a trace line:

```gherkin
# FR-TLK-03 · BR-TLK-01 · source: docs/rujukan-keperluan.md
Scenario: Overlapping booking is rejected
  Given slot A-01 has an approved booking 2026-10-01 to 2026-10-10
  When  pemohon2@latihan.test applies for slot A-01 from 2026-10-05 to 2026-10-15
  Then  the application is not saved
  And   the message "Slot tidak tersedia bagi julat tarikh ini" is shown
```

The Markdown file stays the source. If the AC change, update the file first, then the card.

### 5.5 Labels

| Label | Meaning |
|-------|--------|
| `tlk` · `pas` · `laporan` · `statistik` | Module (same as the Epic) |
| `br-tlk-01` … `br-pas-06` | Business rule enforced (lowercase) |
| `keselamatan` | Security: access, uploads, CSRF |
| `wont` | Won't in this phase |
| `retro` | Action from the Day 10 retrospective |

### 5.6 Story points & planning poker

Story points measure **relative size** (complexity + uncertainty), not hours. Use the Fibonacci series: `1 · 2 · 3 · 5 · 8 · 13`.

1. With a neighbour (your backlogs are the same because the spec is the same), pick one small Story you both understand as the reference = **2 points** (e.g. the list of your own bookings with pagination).
2. For each Story: read the Summary and AC out loud.
3. You and your neighbour pick a number silently (fingers, cards or an app), then reveal at the same time.
4. If they match → fill in **Story point estimate**. If they differ → the higher number explains the risk first, then vote once more.
5. A Story **> 13** is too big — split it into two Stories.

### 5.7 Three example stories

These examples match SPEC §2 and the Day 2 AC examples.

**Example 1 — overlap prevention (Sprint 1)**

| Field | Value |
|-------|-------|
| Summary | As an applicant, I want the system to reject overlapping bookings, so that a slot approved for me isn't claimed by someone else |
| Work type · Parent | Story · M1 — TLK |
| Priority | High (Must) |
| Label | `tlk`, `br-tlk-01`, `br-tlk-05` |
| Story point | 5 — the transaction and `SELECT … FOR UPDATE` add uncertainty |
| AC | AC-TLK-03-01..04: no overlap accepted; overlap rejected; same day counts as overlap; `rejected`/`cancelled` don't block |

**Example 2 — date limits (Sprint 1)**

| Field | Value |
|-------|-------|
| Summary | As an applicant, I want the system to reject invalid booking dates, so that my booking always stays within the allowed period |
| Work type · Parent | Story · M1 — TLK |
| Priority | High (Must) |
| Label | `tlk`, `br-tlk-03` |
| Story point | 3 — server-side validation with a clear boundary table |
| AC | AC-TLK-05-01..05: start in the past rejected; one day accepted; end before start rejected; 2026-10-01 → 2026-12-30 (90 days) accepted; → 2026-12-31 (91 days) rejected |

**Example 3 — document upload (Sprint 2)**

| Field | Value |
|-------|-------|
| Summary | As an applicant, I want to upload PDF/JPG/PNG supporting documents, so that the reviewer can assess the application without paper |
| Work type · Parent | Story · M2 — Pas |
| Priority | High (Must) |
| Label | `pas`, `br-pas-02`, `keselamatan` |
| Story point | 5 — type, size, random name and storage outside `public/` |
| AC | AC-PAS-02-01..02: `.docx` rejected; 2,048 KB accepted, 2,049 KB rejected; at most 3 files; files stored in `writable/uploads/pas/` |

## 6. CSV import (optional)

If the backlog is already complete (the FRs in `docs/rujukan-keperluan.md`), a CSV import is faster than typing cards one by one. Only a **Jira administrator** (the site owner) can import.

### 6.1 Example CSV

Save it as `docs/backlog-jira.csv` (UTF-8). The `Work item ID` and `Parent` columns link Stories to Epics; the Epic rows must come **before** their children. Repeat the `Labels` column for each label.

```csv
Work item ID,Summary,Issue Type,Priority,Description,Labels,Labels,Story Points,Parent
1,M1 — Tempat Letak Kenderaan Khas (TLK),Epic,High,"Module M1, Sprint 1 (Days 4–6)",tlk,,,
2,M2 — Pas,Epic,High,"Module M2, Sprint 2 (Days 7–8)",pas,,,
3,M3 — Laporan,Epic,Medium,"Module M3, Sprint 2 (Day 9)",laporan,,,
4,M4 — Statistik,Epic,Medium,"Module M4, Sprint 2 (Day 10)",statistik,,,
10,"As an applicant, I want the system to reject overlapping bookings, so that a slot approved for me isn't claimed by someone else",Story,High,"FR-TLK-03 · BR-TLK-01. AC: see docs/rujukan-keperluan.md AC-TLK-03-01..04",tlk,br-tlk-01,5,1
11,"As an applicant, I want the system to reject invalid booking dates, so that my booking always stays within the allowed period",Story,High,"FR-TLK-05 · BR-TLK-03. AC: AC-TLK-05-01..05",tlk,br-tlk-03,3,1
20,"As an applicant, I want to upload PDF/JPG/PNG supporting documents, so that the reviewer can assess the application without paper",Story,High,"FR-PAS-02 · BR-PAS-02. AC: AC-PAS-02-01..02",pas,br-pas-02,5,2
```

Format rules: wrap content that contains commas in `"…"`; don't drop the commas for empty trailing columns; no punctuation in the header row other than commas.

### 6.2 Importer steps

1. Log in as a Jira administrator → settings icon → **System** → the *Import and Export* section → **External System Import** → **CSV**. If the new import screen appears, choose **switch to the old experience**.
2. Choose the CSV file. Leave *Use an existing configuration file* unticked. Under **Advanced**, make sure the encoding is **UTF-8** and the delimiter is a comma → **Next**.
3. Choose the existing space `TLKPAS` → **Next**.
4. Map the columns: `Summary` → Summary (required), `Issue Type` → work type, `Priority`, `Description`, `Labels`, `Work item ID`, `Parent`. For `Story Points`, choose the story point estimate field if it is listed; if it isn't, untick that column and fill in the estimates by hand after the import.
5. Map the values: a team-managed space only accepts work types that **already exist** (Epic, Story, Task, Bug) → **Begin Import**.
6. Open the backlog: check that every Story has an Epic as its parent and that the number of Stories equals the number of Story rows in the CSV.

## 7. Sprints before code

### 7.1 Sprint map

| Sprint | Days | Sprint goal | Epic | Review |
|--------|------|-----------------|------|--------|
| **Sprint 1** | 4–6 | M1 TLK finished and passing the DoD | M1 | Day 6 S4 (**M1 done**) |
| **Sprint 2** | 7–10 | M2 Pass, M3 Report, M4 Statistics finished; capstone demo | M2 · M3 · M4 | Day 8 S4 (M2) · Day 9 S4 (M3) · Day 10 S4 (demo) |

The Day 4 setup Tasks (CI4 project, Shield, migrations, seeders) go into Sprint 1 because the sprint starts on Day 4.

### 7.2 Sprint planning on Day 4 S4

Do it **together with** Lab 4.4 ([`hari-4/lab.md`](../hari-4/lab.md)), after `docs/pelan-kerja.md` is created:

1. Backlog → **Create sprint** → name it `Sprint 1 — M1 TLK`.
2. Drag the M1 Must Stories and the Day 4 Tasks into Sprint 1, in priority order.
3. Check capacity: if the total points are well beyond what you are confident you can finish on Days 5–6, move Shoulds back to the backlog.
4. Match it with `docs/pelan-kerja.md`: every row in the **Cabang** (branches) table gets a Story key (e.g. `feat/TLKPAS-12-borang-tempahan`). One branch = one Story.
5. **Start sprint** → start date Day 4, end date Day 6 → write the sprint goal: *"M1 TLK finished and passing the DoD."*
6. Sprint 2 is created and started at the Day 7 recap in the same way.

### 7.3 Daily stand-up

At the 08:30 recap (Days 5–10), you open the board for 5 minutes and answer (to the trainer or a neighbour):

1. What did I finish yesterday (which cards moved)?
2. What will I work on today (which cards)?
3. What is blocking me?

Blockers are recorded as a comment on the card or as a new Bug.

### 7.4 Sprint review & retrospective

- **Sprint review** at each milestone (Days 6, 8, 9 S4): demo the Done Stories to the trainer, following the AC. A Story that doesn't pass goes back to In Progress, not "almost done".
- **Close Sprint 1** on Day 6 S4: Stories that aren't Done move to Sprint 2 (Jira offers this during *Complete sprint*).
- **Day 10 S4 capstone demo** = the last sprint review.
- **Day 10 S4 retrospective** follows Lab 10.4 ([`hari-10/lab.md`](../hari-10/lab.md)): **Start / Stop / Continue** cards and 3-dot voting. Afterwards, record the top 3 cards as Tasks labelled `retro`, then **Complete sprint** for Sprint 2.

### 7.5 Board columns ↔ DoD

A team-managed Scrum board starts with To Do, In Progress and Done. Add an **In Review** column in the board settings (board ••• menu → column configuration; menu labels may differ).

| Column | Enters when | Link to the DoD ([`docs/kolaborasi.md`](kolaborasi.md) §2) |
|-------|---------------|------------------------------------------------------|
| **To Do** | The Story is in the sprint, the AC are clear | The AC exist — DoD line 1 can be tested |
| **In Progress** | The `feat/TLKPAS-nn-…` branch is created, you start typing | — |
| **In Review** | A merge request into your `main` is opened; the trainer or a neighbour comments | Check server validation, access, `status_logs`, PHPUnit tests, no `.env` |
| **Done** | Merged into `main` and **every** DoD item ticked | All 7 DoD items; participants can explain every line |

Use [`senarai-semak-modul.md`](./senarai-semak-modul.md) (D1–D7) during In Review.

## 8. Link to Git

### 8.1 One rule: key + prefix

> **Jira key first, then the KOLABORASI prefix, then the description.**
> Branch: `feat/<KEY>-<description>` · Commit: `<KEY> <PREFIX>: <description>`

```bash
git switch main && git pull
git switch -c feat/TLKPAS-12-borang-tempahan
git commit -m "TLKPAS-12 TLK: tambah validasi tarikh tempahan"
git commit -m "TLKPAS-31 FIX: tolak tempahan 91 hari"
git push -u origin feat/TLKPAS-12-borang-tempahan
```

| Situation | Example |
|---------|--------|
| Module Story | `TLKPAS-12 TLK: …` · `TLKPAS-20 PAS: …` · `TLKPAS-40 RPT: …` · `TLKPAS-45 STAT: …` |
| Bug | `TLKPAS-31 FIX: …` (create the Bug first, then commit) |
| Setup Task | `TLKPAS-5 SETUP: …` |
| Day 1–4 commits before the backlog exists | `SETUP: …` without a key (allowed) |

Write the key in **uppercase** (`TLKPAS-12`, not `tlkpas-12`). Put the same key in the merge request / PR title.

### 8.2 Development panel (GitLab for Jira Cloud)

Your `kelas-ci-<nama>` repo is already on KKM's GitLab ([`trek-gitlab.md`](./trek-gitlab.md)), so the **GitLab for Jira Cloud** app can show the branches, commits and MRs that mention a key in the **Development** panel of each work item. This is **optional; ask the trainer / KKM IT** — the §8.1 rule is still useful without the app, because the keys in the Git history are searchable.

- A self-managed GitLab must be reachable from the internet over HTTPS (GitLab 15.7+), and KKM's **GitLab admin** must create an OAuth application. Participants can't install it themselves.
- The key must be in the branch name, the commit message or the MR title; something must be pushed after connecting so that Jira syncs.
- Do this after the GitLab track is done, not before Day 4 S4.

## 9. GitLab ↔ Jira mapping

For participants who know GitLab Issues/Boards ([`trek-gitlab.md`](./trek-gitlab.md)):

| GitLab Issues / Boards | Jira | Notes |
|------------------------|------|------|
| Issue | Work item (Story / Task / Bug) | Jira has stricter work types |
| Task / task list | Subtask | |
| Parent issue / module label | **Epic** (parent) | Built-in Jira hierarchy |
| Label | Label | |
| Milestone / Iteration | Sprint (or Release/Version) | Jira separates sprints and versions |
| *Weight* | Story point estimate | |
| Issue board | Scrum / Kanban board | |
| Assignee | Assignee | |
| `Closes #14` in an MR | `TLKPAS-12` in the branch, commit, MR title | The Development panel needs GitLab for Jira Cloud |

Choose **one** tool as the backlog's source of truth. If you use both GitLab Issues and Jira, GitLab manages code and MRs; Jira manages the backlog and sprints.

## 10. Three common mistakes

| Mistake | Why it's wrong | Fix |
|-----------|--------------|----------|
| A Story written as a technical task (`Bina BookingService`) | No user value; can't be tested with AC | Rewrite it as *As a … I want … so that …*; move the technical work into a Task |
| A card dragged to Done as soon as the code runs | Done without the DoD hides tests and access checks not yet done | Move the card to In Review first; Done only after every DoD item is ticked and it is merged into `main` |
| Two different backlogs (Jira + `pelan-kerja.md` + GitLab Issues) | Cards and files drift apart; you don't know which is right | One source of truth; `pelan-kerja.md` refers to Jira keys, not a separate work list |

## Checklist — Done before Day 4

- [ ] The Jira Cloud Free site exists and you can log in; the trainer is invited as Viewer (optional).
- [ ] A team-managed Scrum space with the key `TLKPAS`; Estimation turned on with Story points.
- [ ] 4 Epics M1–M4 created.
- [ ] Every FR confirmed in `docs/log-keputusan.md` has one Story in *As a … I want … so that …* format, with an Epic as its parent.
- [ ] Every Must Story has Given/When/Then AC in its Description, following the examples in `rujukan-keperluan.md`.
- [ ] Every Story has a Priority from MoSCoW, a module label and story points (Fibonacci, ≤ 13).
- [ ] Won't items are labelled `wont` and are not in any sprint.
- [ ] Board columns: To Do → In Progress → In Review → Done.
- [ ] Sprint 1 started on Day 4 S4 with M1 Stories and Day 4 Tasks only; the sprint goal is written.
- [ ] The **Cabang** (branches) table in `docs/pelan-kerja.md` uses Jira keys (`feat/TLKPAS-nn-…`).
- [ ] No real data, passwords or `.env` in any card.

## Links

- Course: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) · [`JADUAL.md`](../JADUAL.md) · [`docs/kolaborasi.md`](kolaborasi.md)
- Days: [`hari-1/lab.md`](../hari-1/lab.md) (Lab 1.4 FR/NFR + MoSCoW) · [`rujukan-keperluan.md`](./rujukan-keperluan.md) (acceptance criteria) · [`hari-2/lab.md`](../hari-2/lab.md) · [`hari-4/lab.md`](../hari-4/lab.md) (Lab 4.4 work plan) · [`hari-10/lab.md`](../hari-10/lab.md) (Lab 10.4 retrospective)
- Docs: [`README.md`](./README.md) · [`senarai-semak-modul.md`](./senarai-semak-modul.md) · [`trek-gitlab.md`](./trek-gitlab.md) · [`trek-design-thinking.md`](./trek-design-thinking.md) · [`glosari.md`](./glosari.md)

## Sources

Jira facts checked on **2026-10-15**:

- Free plan (10 users, 2 GB, Scrum/Kanban boards, backlog): <https://www.atlassian.com/software/free> · <https://support.atlassian.com/jira-cloud-administration/docs/explore-jira-cloud-plans/>
- Creating a space and key rules: <https://support.atlassian.com/jira-software-cloud/docs/create-a-new-project/>
- Turning on Estimation (story points): <https://support.atlassian.com/jira-software-cloud/docs/enable-estimation/>
- Adding people to a team-managed space: <https://support.atlassian.com/jira-software-cloud/docs/add-people-to-team-managed-projects/>
- CSV import: <https://support.atlassian.com/jira-cloud-administration/docs/import-data-from-a-csv-file/>
- Keys in branches/commits/PRs: <https://support.atlassian.com/jira-software-cloud/docs/reference-issues-in-your-development-work/>
- GitLab for Jira Cloud (checked 2026-10-15): <https://docs.gitlab.com/integration/jira/connect-app/> · self-managed: <https://docs.gitlab.com/administration/settings/jira_cloud_app/>
