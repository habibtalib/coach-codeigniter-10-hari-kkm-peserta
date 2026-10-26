# Team Roles — PM, QA & Dev with Claude Code (Days 8–10)

[← Docs index](./README.en.md) · [🤝 Collaboration](./kolaborasi.en.md) §6 · [💬 Prompt library](./pustaka-prompt.en.md) §H

> From Day 8, the class works as one team in the **espkpv2** repo (`<gitlab-kkm>/aplikasi-baharu/espkpv2`): 3 squads × 4 people. This document explains **what** each role does and **how** Claude Code helps it. The repo's technical rules (hotspots, migration names, merge order) are in `docs/pasukan.md` in that repo itself.

## 1. Squads

| Squad | Area | Hotspot (owning squad only) | Sprint 1 (D8) | Sprint 2 (D9) | Sprint 3 (D10) |
|---|---|---|---|---|---|
| A — Workflow | Workflow, applications, reminders | `Config/Aliran.php`, `Services/AliranKerja.php`, `DemoSeeder.php` | #1 One open application | #13 Pindaan reminder > 7 days | #14 E2E & documentation |
| B — Accounts & Security | Accounts, security, admin | `Config/Auth.php`, `AuthGroups.php`, `Security.php`, `Filters.php` | #10 CSRF, #12 Auth config | #9 password policy, #8 MariaDB migration | #15 Login history |
| C — Reports & Statistics | Reports, exports, dashboard | `Config/Laporan.php`, `Services/Laporan/*`, `StatistikService.php` | #16 RPT-10 decision rate | #17 RPT-10 chart & export | #18 Approval-rate KPI card |

**The trainer = the system owner.** Policy decisions (which statuses count as "approved", limit values, official text) are answered by the trainer in issue comments.

## 2. Role cards

### PM (squad Product/Project Manager)

| | |
|---|---|
| **Responsibilities** | Squad backlog; issues with a user story + testable AC; `status::` labels; answer Dev questions; coordinate hotspots and merge order with the other PMs; merge MRs after QA approval; demo and retro |
| **Claude Code** | `/isu-baharu` skill (draft issue + AC + hotspots + `glab` commands); *Plan* mode for board summaries; `glab issue list/view` |
| **Done when** | Issue `status::sedia`: ≥ 3 Given/When/Then AC, one 404 access AC, one edge-case AC, size ≤ M, owner questions answered |
| **AI must not** | Create, edit or close issues without the PM reading them; guess the system owner's decisions |

### QA (squad Quality Assurance)

| | |
|---|---|
| **Responsibilities** | Test plan from the AC (before seeing code); failing tests first; review MRs against the AC; manual tests in the browser; Bug issues |
| **Claude Code** | `penguji-espkp` subagent (test gaps); `/semak-mr` skill (AC ↔ code ↔ tests, draft comment); *Manual* mode for writing tests; `npm run e2e` |
| **Done when** | Every AC has `file:line` + test evidence, or a specific "request changes" comment |
| **AI must not** | Approve or merge; treat an AC as met without evidence QA opened themselves |

### Dev (2 people, in a pair)

| | |
|---|---|
| **Responsibilities** | Understand the issue; slice plan; implement slice by slice on a `feat/<no>-…` branch; `composer semak`; MR with `Closes #N`; answer QA comments; rebase and resolve conflicts |
| **Claude Code** | *Plan* mode + `/ciri-baharu` skill; `aliran-kerja` / `migration-espkp` skills; *Manual* mode for every slice; `semak-espkp` subagent; `ci4-spark` MCP |
| **Done when** | MR `Ready`: checklist filled in with evidence, "Three key lines" written yourself, `composer semak` green |
| **AI must not** | Write a whole feature in one prompt; push; `migrate:refresh` / `db:seed`; *auto* / *bypass* mode; change files outside the issue |

**Driver & navigator.** Two Devs on one issue share one branch and one Claude session: the driver types the prompts and answers *Yes/No*; the navigator reads every diff and runs the tests. Swap after each slice.

## 3. Role rotation

Seat numbers 1–4 are set by the trainer on Day 8 morning. Everyone is PM once, QA once and Dev at least twice.

| Slot | PM | QA | Dev |
|---|---|---|---|
| Day 8 morning (Sprint 1) | 1 | 2 | 3, 4 |
| Day 8 afternoon (Sprint 1) | 2 | 3 | 4, 1 |
| Day 9 morning (Sprint 2) | 3 | 4 | 1, 2 |
| Day 9 afternoon (Sprint 2) | 4 | 1 | 2, 3 |
| Day 10 (Sprint 3 + release) | squad's choice | | |

**Handover** before every rotation: a comment in the issue — *Done*, *Next*, *Open questions*. Not a private message: the next person (and Claude) reads the issue.

## 4. One issue, three Claude sessions

| Step | Who | Claude mode | Output in GitLab |
|---|---|---|---|
| 1. Issue + AC | PM | *Plan* + `/isu-baharu` | Issue `status::sedia` |
| 2. Test plan | QA | *Plan* + `penguji-espkp` | Comment: AC → test case table |
| 3. Slice plan | Dev | *Plan* + `/ciri-baharu` | Comment: slice plan |
| 4. Failing test | QA | *Manual* | Commit `ujian: … Rujuk #N` |
| 5. Slice | Dev | *Manual* + `semak-espkp` | Commit `<area>: … Rujuk #N` |
| 6. MR | Dev | — | MR `Closes #N`, `status::semakan` |
| 7. Review | QA | *Plan* + `/semak-mr` | Review comment + approve / request changes |
| 8. Merge | PM | — | Issue closed |

The three separate Claude sessions (PM, QA, Dev) do not share context. That is deliberate: QA reviews against the **AC**, not against Claude's explanation to the Dev.

## 5. Assessment

Days 8–10 are assessed per squad and per individual ([`rubrik-capstone.md`](./rubrik-capstone.md)): issue quality (PM), review evidence (QA), MR hygiene and tests (Dev), and everyone's ability to **explain** the lines committed under their name.
