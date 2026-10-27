# Tutorial — Figma MCP & the `papan-figjam` Subagent: Update the FigJam Board from Claude Code (Windows)

[← Docs index](./README.en.md) · [🤖 Subagent, skill & MCP tutorial](./tutorial-agent-skill-mcp.en.md) · [👥 Team roles](./peranan-pasukan.en.md)

> **For whom:** every Day 8–10 trainee (Projek and Dev teams) who wants to change the class FigJam board — ERD, workflows, issue board, ERD proposals, Retro — with a Claude Code prompt instead of the mouse. Board: link from the trainer (issue #19). Official reference: <https://developers.figma.com/docs/figma-mcp-server/>.

**Principle:** the `espkpv2` repo is the source of truth (migrations, `Config/Aliran.php`, GitLab issues). The FigJam board is a working copy for discussion. Figma is an **external service**: synthetic data only.

## 1. Prerequisites

- A Figma account (free) and **edit** access to the class board (open the trainer's link, sign in, check that you can add a sticky).
- Claude Code in `~/latihan/espkpv2` (Lab 8.20), on the latest `main` (`git pull`) so the `papan-figjam` subagent is there.

## 2. Install Figma MCP (once)

In Git Bash:

```bash
claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp
```

The server name **must** be `figma`: the `papan-figjam` subagent uses the `mcp__figma__*` tools.

Then inside `claude`:

1. Type `/mcp` → choose `figma` → **Authenticate**.
2. The browser opens → sign in to Figma → **Allow**.
3. `/mcp` again → `figma` ✔ connected.
4. Test: `Use the Figma whoami tool and tell me my account name.`

## 3. The `papan-figjam` subagent

The repo file `.claude/agents/papan-figjam.md` describes the board layout (section and lane names) and its rules: read first, one write call, never delete other people's work, synthetic data only. Check: `/agents` → `papan-figjam` (*Project*).

Call it with `Use the papan-figjam subagent to …` or `@agent-papan-figjam …`. Start in **Plan** mode to see what will change, then approve.

## 4. Prompts by role

**BA / Dev — ERD proposal before the migration:**

```text
Use the papan-figjam subagent. Issue #25: add column telefon_bimbit VARCHAR(15) NULL to profil_pengguna. Copy the profil_pengguna card into the "Cadangan (Dev / BA)" lane, add the new row in yellow, and add a sticky "isu #25 · pasangan 2 · BRS §3.2". One write call only.
```

**QA — review proposals (read only):**

```text
Use the papan-figjam subagent, read only. Summarise every card and sticky in the "Disemak Projek" lane as a table: issue, table, new columns, open questions.
```

**PM — move an issue on the board:**

```text
Use the papan-figjam subagent. In the "Papan isu" section, move the sticky "#1 Satu permohonan terbuka" from the "Dev: dalam kerja" lane to "Semakan QA / UAT".
```

**Dev — after a migration is merged:**

```text
Use the papan-figjam subagent. Migration 2026-10-28-200001_TelefonBimbit.php is merged to main. Update the profil_pengguna card in the ERD section "Pengguna & keselamatan" to match that migration. Do not touch the proposal lanes.
```

**Dev — after a workflow change:**

```text
Use the papan-figjam subagent. Issue #20 is merged: the applicant can cancel a TLK after approval. In the section "TLK Khas — Pelawat & Ibu Mengandung", change the dashed purple arrow 9 → 11 to a normal red line and remove the word "cadangan" from its label.
```

**Everyone — retro:**

```text
Use the papan-figjam subagent. Add one sticky to the "Claude Code: membantu / menyusahkan" lane of the Retro section: "Dev · /ciri-baharu helped split slices; diffs need careful reading".
```

## 5. Usage limits

The Figma **Starter** (free) plan has a low MCP tool-call limit. The trainer hit it after about 20 calls in one session. So:

- One prompt = one complete change (the subagent puts all writes into **one** `use_figma`).
- Ask it to read **one section**, not the whole board.
- If you hit the limit: make small changes directly in the browser, or wait.

## 6. Common mistakes

| Symptom | Cause | Fix |
|---|---|---|
| `/mcp` → `figma` ✘ / *needs authentication* | Not signed in, or the token expired | `/mcp` → `figma` → Authenticate again |
| The subagent says there is no Figma tool | The server has a name other than `figma` | `claude mcp remove figma` (or the other name), install again as `figma` |
| `You've reached the Figma MCP tool call limit` | Starter plan limit | Combine prompts, edit in the browser, or wait |
| `You don't have edit access` | The account can only view | Ask the trainer for the edit link |
| The browser does not return to Claude after *Allow* | `localhost` redirect blocked | Copy the URL from the address bar and paste it when Claude asks |
| The subagent wants to delete a section | Prompt too vague | Reject; repeat the prompt with the exact section/lane name |

## 7. Safety

- Never paste original KKM documents (BRS, original ERD, flowcharts), real ID numbers, `.env` or tokens into a prompt that writes to Figma.
- Read the subagent's plan before approving a write.
- Decisions stay in GitLab issues; the schema stays in migrations + `docs/pangkalan-data.md`.
