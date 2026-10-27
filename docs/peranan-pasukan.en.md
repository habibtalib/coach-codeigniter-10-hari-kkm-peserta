# Team Roles — Projek (PM, BA, QA) & Dev with Claude Code (Days 8–10)

[← Docs index](./README.en.md) · [🤝 Collaboration](./kolaborasi.en.md) §6 · [💬 Prompt library](./pustaka-prompt.en.md) §H · [🎨 FigJam board](./tutorial-figma-mcp.en.md)

> From Day 8 afternoon to Day 10, the class works as **two fixed teams** in the **espkpv2** repo (`<gitlab-kkm>/aplikasi-baharu/espkpv2`): **Projek** (requirements & testing) and **Dev** (building). Names and pairs: issue #19. This document explains **what** each role does and **how** Claude Code helps. The repo's technical rules (hot files, migration names, merge order) live in `docs/pasukan.md` in the repo itself.

## 1. Teams

| Team | Members | Owns | GitLab label |
|---|---|---|---|
| **Projek** | 1 PM, 1 BA, 2 QA | Backlog, user stories, AC, priorities, test plans, MR review, UAT, questions for the system owner | `pasukan::projek` |
| **Dev** | 4 pairs + 1 floater | Branches, slices, migrations, unit/feature tests, MRs, rebase & conflicts | `pasukan::dev` + `pasangan::1`…`4` |

The `pasukan::` label shows who acts **now**: an issue moves Projek → Dev → Projek.

**Backlog:** existing issues (#1, #8–#18) + BRS gaps (#20–#32, from the review of the original KKM documents) + #33 system-owner questions. Sprint 1 = Day 8, Sprint 2 = Day 9, Sprint 3 + the v1.1.0 release = Day 10.

**The trainer = the system owner.** Policy decisions (which status counts as "approved", limit values, official text, contradictions in the BRS) are answered by the trainer in issue comments.

## 2. Role cards

### PM (Projek team)

| | |
|---|---|
| **Responsibilities** | Priorities and sprint scope; `status::`, `pasukan::`, `pasangan::` labels; assigning issues to pairs; bug triage; merge order with the floater; merging MRs after QA passes; system-owner questions (#33); demo and retro |
| **Claude Code** | `glab issue list/view` + *Plan* mode for board summaries; `/isu-baharu` to review the BA's issues |
| **Done when** | Every sprint issue is `status::sedia` + `pasukan::dev` + `pasangan::N` with an *Assignee*; the board is accurate; the sync note is in issue #19 |
| **AI must not** | Create, edit or close issues without the PM reading them; guess system-owner decisions |

### BA (Projek team)

| | |
|---|---|
| **Responsibilities** | BRS issues and stub issues → user stories + testable Given/When/Then AC; affected roles; hot files; schema sketches in the FigJam *Cadangan ERD* lane |
| **Claude Code** | The `/isu-baharu <no>` skill; the `papan-figjam` subagent (ERD proposals) |
| **Done when** | ≥ 3 AC including one 404 access AC and one edge case, size ≤ M, every AC traceable to the issue/BRS |
| **AI must not** | Invent requirements that are not in the issue or the BRS; answer on behalf of the system owner |

### QA (Projek team, 2 people)

| | |
|---|---|
| **Responsibilities** | A test plan from the AC (before looking at the code); failing tests first in the issue branch; MR review against the AC; exploratory testing; E2E; UAT on `main` after merge |
| **Claude Code** | The `penguji-espkp` subagent (test gaps); the `/semak-mr` skill (AC ↔ code ↔ tests, draft comment); *Manual* mode to write tests; `npm run e2e` |
| **Done when** | Every AC has `file:line` + test evidence, or a specific "request changes" comment |
| **AI must not** | Approve or merge; treat an AC as met without evidence QA opened themselves |

### Dev (Dev team: 4 pairs + a floater)

| | |
|---|---|
| **Responsibilities** | Understand the issue; plan slices; implement slice by slice on a `feat/<no>-…` branch; `composer semak`; MR with `Closes #N`; answer QA comments; rebase and resolve conflicts; test another pair's feature (Day 9) |
| **Claude Code** | *Plan* mode + the `/ciri-baharu` skill; the `aliran-kerja` / `migration-espkp` skills; *Manual* mode for every slice; the `semak-espkp` subagent; the `ci4-spark` MCP; `papan-figjam` after a schema/workflow change |
| **Done when** | MR `Ready`: checklist filled in with evidence, "Three key lines" written yourself, `composer semak` green |
| **AI must not** | Write a whole feature in one prompt; push; `migrate:refresh` / `db:seed`; *auto* / *bypass* mode; change files outside the issue |

The **floater** acts as an extra Dev: helps pairs blocked for > 15 minutes, coordinates the MR order for hot files with the PM, resolves rebase conflicts together with the pairs, and runs E2E.

**Driver & navigator.** The two Devs of a pair share one branch and one Claude session: the driver types the prompts and answers *Yes/No*; the navigator reads every diff and runs the tests. Swap after every slice.

## 3. Fixed teams, not rotation

The teams stay the same from Day 8 afternoon to Day 10 (Day 8 morning used 3 rotating squads). Skills move through **issues**, not through role swaps:

- **Hand over** every time an issue changes team: a comment — *Done*, *Next*, *Open questions*. The next person (and Claude) reads the issue, not a private message.
- **Dev pairs test another pair's feature** (Day 9), so every Dev also practises thinking like QA.
- **The BA explains the AC in the demo**, so Projek must also understand the code that proves the AC.

## 4. One issue, three Claude sessions

| Step | Who | Claude mode | Result in GitLab |
|---|---|---|---|
| 1. Issue + AC | BA (PM reviews) | *Plan* + `/isu-baharu` | Issue with AC, `pasukan::projek` |
| 2. Test plan | QA | *Plan* + `penguji-espkp` | AC → test case table comment |
| 3. Hand to Dev | PM | — | `status::sedia` + `pasukan::dev` + `pasangan::N` |
| 4. Slice plan | Dev | *Plan* + `/ciri-baharu` | Slice plan comment |
| 5. Failing test | QA | *Manual* | Commit `ujian: … Rujuk #N` |
| 6. Slice | Dev | *Manual* + `semak-espkp` | Commit `<area>: … Rujuk #N` |
| 7. MR | Dev | — | MR `Closes #N`, `status::semakan` + `pasukan::projek` |
| 8. Review | QA | *Plan* + `/semak-mr` | Review comment + approve / request changes |
| 9. Merge + UAT | PM, QA | — | Issue closed; QA confirms on `main` |

The separate Claude sessions (Projek and Dev) do not share context. That is deliberate: QA reviews against the **AC**, not against Claude's explanation to the Dev.

## 5. Assessment

Days 8–10 are assessed as a team and individually ([`rubrik-capstone.en.md`](./rubrik-capstone.en.md) §8): issue and AC quality (PM, BA), review and test evidence (QA), MR hygiene and tests (Dev), and each person's ability to **explain** one line of their work — code, test or AC — without Claude.
