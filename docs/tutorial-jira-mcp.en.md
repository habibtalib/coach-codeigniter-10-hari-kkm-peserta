# Tutorial — Jira Cloud & the `atlassian` MCP: Backlog and Sprint from Claude Code (Windows)

[← Docs index](./README.en.md) · [🤖 Subagent, skill & MCP tutorial](./tutorial-agent-skill-mcp.en.md) · [👥 Team roles](./peranan-pasukan.en.md) · [🎨 Figma MCP](./tutorial-figma-mcp.en.md)

> **Who it is for:** the Jira seat holders on Days 9–10 (the Projek team and one member of each Dev pair). From Day 9 the **backlog lives in Jira** (stories, AC, sprints, board, version `v1.1.0`) and the **code stays in GitLab** (branches, commits, MRs, CI). Jira site: link from the trainer (issue #19), space `KAN`. Official reference: <https://support.atlassian.com/atlassian-rovo-mcp-server/>.

**Principle:** one Jira card = one story or bug. The Jira key (`KAN-14`) appears in the branch name, commits and MR title, so anyone can trace card → code → MR. Codeforge issues #1–#33 stay as the BRS reference and are closed by MRs as before. Jira Cloud is an **external service**: synthetic data only.

## 1. Prerequisites

- Jira Free: **10 seats** — the trainer, PM, BA, 2 QA, one member of each Dev pair and the floater. The pair partner works in the same Claude session (driver/navigator), so one MCP sign-in per pair is enough.
- The Jira invitation email from the trainer → **Accept invitation** → sign in (free Atlassian account, the invited email). Open the `KAN` space and check you can see the sprint board.
- Claude Code in `~/latihan/espkpv2`, with an up-to-date `main` (`git switch main && git pull`) so `.mcp.json` contains the `atlassian` server and the `isu-baharu` / `semak-mr` skills read Jira.

## 2. Connect the `atlassian` MCP (once)

The server is already registered in the repo's `.mcp.json` (*project* scope, no token). In Git Bash:

```bash
cd ~/latihan/espkpv2
git switch main && git pull
claude
```

Inside `claude`:

1. When asked, **approve** the `atlassian` server from `.mcp.json`.
2. Type `/mcp` → choose `atlassian` → **Authenticate**.
3. The browser opens → sign in to Atlassian with the invited email → choose the class site → **Accept**.
4. `/mcp` again → `atlassian` ✔ connected.
5. Test (*Plan* mode): `List the Jira sites and spaces I can see.` The answer must mention the `KAN` space.

The read tools (`getJiraIssue`, `searchJiraIssuesUsingJql`, `getVisibleJiraProjects`, `getTransitionsForJiraIssue`) are allowed in `.claude/settings.json`. The write tools (`createJiraIssue`, `editJiraIssue`, `transitionJiraIssue`, `addCommentToJiraIssue`) **ask every time**: read the fields to be sent before answering *Yes*.

## 3. Jira key convention

| Where | Format | Example |
|---|---|---|
| Branch | `feat/KAN-<n>-<short>` (`fix/…` for bugs) | `feat/KAN-14-peringatan` |
| Commit | last line `Rujuk KAN-<n>` | `Rujuk KAN-14` |
| MR title | `KAN-<n>: <summary>` | `KAN-14: peringatan pindaan > 7 hari` |
| MR description | `Jira: KAN-<n>` + `Closes #N` if a GitLab KKM issue exists | `Jira: KAN-14` · `Closes #13` |

Board statuses: **Idea (no AC yet) → To Do → In Progress → Testing (QA review) → Done**. Blocked = label `disekat` + flag. Pairs: labels `pasangan-1`…`pasangan-4`; the team acting now: `pasukan-projek` / `pasukan-dev`.

## 4. Prompts by role

**PM — sprint summary:**

```text
Use Jira (atlassian MCP). JQL: project = KAN AND sprint in openSprints() ORDER BY status. Summarise as a table: key, summary, status, pair, assignee, disekat label. Read only.
```

**PM — hand over to Dev (write, after yes):**

```text
KAN-14 now has AC and a test plan. Propose the change: labels pasukan-dev and pasangan-1, assignee the first member of pair 1. Show the fields first; send only after I say yes.
```

**BA — story and AC:**

```text
/isu-baharu KAN-21
```

**QA — test plan from the AC:**

```text
Read the AC of KAN-14 (getJiraIssue). Draft an AC → test case table (account 9001010100NN, steps, expected result) for a Jira comment. Do not send it yet.
```

**Dev — start work:**

```text
Read KAN-14 and list the AC and the hot files it mentions. Then propose a branch name following CONTRIBUTING.md and the transition to In Progress. Wait for my yes before the transition.
```

**QA — review an MR:**

```text
/semak-mr 12
```

**Everyone — a bug from exploratory testing:**

```text
Draft a Bug work item for KAN from this observation: <steps, expected, actual, account>. Synthetic data only. Show the fields; create it only after I say yes.
```

## 5. Limits and behaviour

- Every tool call needs a `cloudId`; Claude finds it with `getAccessibleAtlassianResources` on the first call.
- The MCP sees only what your account can see in Jira. No access → the invitation has not been accepted.
- One prompt, one purpose. For bulk changes (many cards), the PM uses the browser (*bulk change*).
- The Jira board is a view; the code rules stay in the repo (`docs/pasukan.md`, `CONTRIBUTING.md`).

## 6. Common mistakes

| Symptom | Cause | Fix |
|---|---|---|
| `/mcp` does not show `atlassian` | Local `main` not updated, or the server not approved | `git pull`, restart `claude`; `claude mcp reset-project-choices` |
| `atlassian` → *needs authentication* | Not signed in or the session expired | `/mcp` → `atlassian` → Authenticate again |
| The `KAN` space is not listed | Invitation not accepted, or signed in with another email | Accept the invitation in the email; sign out of Atlassian in the browser, Authenticate again with the invited email |
| `transitionJiraIssue` fails: status not found | The status name differs on the board | `List the allowed transitions for KAN-14` (getTransitionsForJiraIssue), then choose |
| Claude wants to create many cards at once | Prompt too broad | Refuse; one card per prompt, read the fields first |
| The browser does not return to Claude after *Accept* | The `localhost` redirect is blocked | Copy the URL from the address bar and paste it when Claude asks |

## 7. Safety

- A Jira card contains only the summary, user story, AC, impact and the GitLab KKM link. **Do not** copy BRS text, BRS page/§ numbers, real names, IC numbers, emails, `.env`, tokens or screenshots into Jira.
- The AI does not create, transition or close cards without you reading the fields and saying yes.
- System-owner decisions are answered by the trainer in card comments; do not let Claude guess.

## 8. Team flow: Projek plans, Dev picks up, discussion on the card

Skills in the repo (`git pull` on `main`): Projek `/rancang-sprint` and `/isu-baharu`; Dev `/ambil-kad`. Claude writes to Jira only after you read the fields and say yes.

| Step | Who | Prompt | Result in Jira |
|---|---|---|---|
| 1. AC ready | BA | `/isu-baharu KAN-<n>` | Description with AC; Idea → To Do |
| 2. Assign | PM | `/rancang-sprint sprint` | Assignee + `pasukan-dev` + `pasangan-N`; the PM drags cards into the sprint and clicks *Start sprint* on the board |
| 3. Pick up | Dev (the pair's seat holder) | `/ambil-kad` | Only the cards assigned to you |
| 4. Ask | Dev | `/ambil-kad KAN-<n>` → unclear AC | Comment `SOALAN: AC-2 …` + label `soalan` |
| 5. Answer | BA / PM | `/rancang-sprint soalan` | Comment `JAWAPAN: …`, AC updated, label `soalan` removed |
| 6. Start | Dev | `/ambil-kad KAN-<n>` → ready | *In Progress* + comment `MULA: branch feat/KAN-<n>-…` |
| 7. MR | Dev | `MR !<no> is Ready. Add an MR comment on KAN-<n> and propose the transition to Testing.` | Comment `MR: <link>` + *Testing* |
| 8. Review & close | QA, PM | `/semak-mr <no>` → merge → UAT | PM: *Done* |

**Discussion rule:** questions and answers go in card comments, not WhatsApp or private messages, so the next person (and Claude) reads the same context. The Dev does not change AC, assignee or sprint; Projek does not write code. System-owner decisions → the trainer, label `disekat`.
