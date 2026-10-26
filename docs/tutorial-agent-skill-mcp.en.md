# Tutorial — Setting Up Subagents, Skills & MCP in Claude Code (Windows)

[← Docs index](./README.en.md) · [🤖 Claude Code tutorial](./tutorial-claude-code.en.md) · [💬 Prompt library](./pustaka-prompt.en.md)

> **For whom:** participants who have installed Claude Code ([`tutorial-claude-code.en.md`](./tutorial-claude-code.en.md)) and want to understand how to **set up** subagents, skills and MCP servers in their `kelas-ci-<nama>` project. Related labs: **Lab 7.7** (subagents & skills) and **Lab 7.8** (MCP), Day 7. Official references: <https://code.claude.com/docs/en/sub-agents>, <https://code.claude.com/docs/en/skills>, <https://code.claude.com/docs/en/mcp>.

## 🧭 When to use what

| Tool | What | Loaded when | Course example |
|------|------|-------------|----------------|
| `CLAUDE.md` | Project rules & context | Every session, always | Stack, commands, data rules |
| **Skill** | Reusable instructions/procedure | When its `description` matches the task, or `/skill-name` | `migration-ci4`, `perancangan-ci4` |
| **Subagent** | Specialised helper with its own context & tools | When Claude delegates, or when you ask | `semak-ci4` (read-only), built-in Explore |
| **MCP** | Connection to outside tools/data | Server tools are available in the session | `ci4-spark`, Context7, MySQL, GitLab |

Rule of thumb: **rules** → `CLAUDE.md`; **repeated procedure** → skill; **separate task with long output** (review, search) → subagent; **data or tools outside the project files** → MCP.

## 1. Subagents

### 1.1 File locations

| Location | Scope |
|----------|-------|
| `.claude/agents/<name>.md` | This project — commit it to share |
| `~/.claude/agents/<name>.md` | All your projects on this machine |

On a name clash the project file wins over the user file. A **newly created** `agents` folder needs `claude` restarted once; after that, file changes are picked up within a few seconds.

### 1.2 File format

```markdown
---
name: semak-ci4
description: CodeIgniter 4 security reviewer (READ ONLY). Use after writing or changing controllers, views, models, routes or filters.
tools: Read, Grep, Glob
model: sonnet
---

You are a CodeIgniter 4 + Shield security reviewer. You do NOT change files.
Report findings as a table: File:line | Category | Severity | Finding | Suggestion.
```

| Field | Required | Meaning |
|-------|----------|---------|
| `name` | Yes | Unique identifier (lowercase, hyphens; no `:`) |
| `description` | Yes | **When** Claude should delegate to it. Put the main use first; the phrase "use proactively" encourages automatic use |
| `tools` | No | Allowed tools. Omitted = inherit all. `Read, Grep, Glob` = read-only |
| `disallowedTools` | No | Tools removed from the list |
| `model` | No | `sonnet`, `opus`, `haiku`, a full model ID, or `inherit` |
| `permissionMode` | No | The subagent's permission mode (e.g. `plan`). In this course: never `bypassPermissions` or `acceptEdits` |
| `color` | No | Label colour in the terminal |

The file body (after `---`) is the subagent's *system prompt*: role, steps, answer format.

### 1.3 Built-in subagents

| Name | Use |
|------|-----|
| **Explore** | Searches & analyses code, read-only (no Write/Edit). Good for understanding a new project |
| **Plan** | Researches context in *Plan* mode before a plan is presented |
| **General-purpose** | Multi-step tasks that need to explore **and** act |

### 1.4 Invoking a subagent

- **Plain language:** `Use the semak-ci4 subagent to review app/Controllers/Tlk.`
- **@-mention:** type `@agent-semak-ci4 review app/Views/tlk`.
- **Automatic:** Claude chooses based on the `description` and the task.
- `/agents` — guidance for managing subagents (recent versions tell you to edit `.claude/agents/` directly).

## 2. Skills

### 2.1 File locations

| Location | Scope |
|----------|-------|
| `.claude/skills/<name>/SKILL.md` | This project — commit it to share |
| `~/.claude/skills/<name>/SKILL.md` | All your projects |

A skill is a **folder**; `SKILL.md` is required, supporting files (examples, references, scripts) are optional and referenced from `SKILL.md`. Old `.claude/commands/<name>.md` files still work as `/name`, but use skills for new work.

### 2.2 `SKILL.md` format

```markdown
---
name: migration-ci4
description: CI-KKM-10 migration & seeder conventions. Use when writing, drafting or reviewing migrations, seeders or schema changes.
argument-hint: "[table name]"
---

Follow these conventions. Target table: $ARGUMENTS
- id INT unsigned auto_increment; FKs the same type as the parent.
- createTable('name', true) / dropTable('name', true).
- Do NOT run php spark migrate — print the command for the participant.
```

| Field | Meaning |
|-------|---------|
| `name` | Name in the `/` menu (default: folder name) |
| `description` | **Main use first** — Claude decides when to load the skill from this text |
| `argument-hint` | Argument hint for `/skill-name …` |
| `disable-model-invocation: true` | Only invoked via `/name` (good for side-effect actions: commit, deploy) |
| `user-invocable: false` | Hidden from the `/` menu; only Claude loads it |
| `allowed-tools` | Tools usable without asking during that turn — use with care |

Variables in the body: `$ARGUMENTS` (all arguments), `$0`, `$1` (by position).

### 2.3 Loading & testing

- **Automatic:** ask for a task that matches the `description` (e.g. "draft a migration for table X").
- **Manual:** `/migration-ci4 vehicle_notes`.
- `SKILL.md` changes are picked up without a restart. A `skills` folder **newly created** after `claude` started → type `/reload-skills`.
- Keep `SKILL.md` under ~500 lines; test in a fresh session (`/clear`).

## 3. MCP (Model Context Protocol)

### 3.1 Connection types

| Type | When | Example |
|------|------|---------|
| `stdio` | A local program that Claude Code runs | `ci4-spark` (PHP), MySQL (`npx`) |
| `http` | A remote server | Context7, GitLab |

### 3.2 Scopes

| Scope | Stored in | Shared via Git | Use for |
|-------|-----------|----------------|---------|
| `local` (default) | `~/.claude.json` | No | Servers with personal credentials (MySQL, GitLab) |
| `project` | `.mcp.json` in the project root | Yes | Secret-free servers everyone needs (`ci4-spark`, Context7) |
| `user` | `~/.claude.json` | No | Servers for all your projects |

### 3.3 Commands (Git Bash, outside a `claude` session)

```bash
# stdio — everything after -- is the server command
claude mcp add --scope project ci4-spark -- php tools/ci4-spark-mcp.php

# http — remote server
claude mcp add --transport http --scope project context7 https://mcp.context7.com/mcp

# environment variables for a server (put another option between --env and the name)
claude mcp add --env MYSQL_USER=claude_ro --transport stdio --scope local mysql -- npx -y @benborla29/mcp-server-mysql

claude mcp list          # list & status (✔ Connected)
claude mcp get ci4-spark # details for one server
claude mcp remove mysql  # remove
```

Inside a `claude` session: **`/mcp`** — status, OAuth sign-in, enable/disable servers. Servers from a project `.mcp.json` must be **approved** once when `claude` starts.

### 3.4 Secret-free `.mcp.json`

```json
{
  "mcpServers": {
    "ci4-spark": { "type": "stdio", "command": "php", "args": ["tools/ci4-spark-mcp.php"] },
    "context7": { "type": "http", "url": "https://mcp.context7.com/mcp" }
  }
}
```

Secrets are **not** written in `.mcp.json`. Use `${VARIABLE}` (or `${VAR:-default}`) and set the value in your environment, or register credentialed servers with `local` scope.

### 3.5 MCP security

- Connect only servers you trust; output from servers that fetch outside content can carry *prompt injection*.
- Read-only tools first (`ci4-spark` does not expose `migrate`/`db:seed`; the MySQL user `claude_ro` is SELECT-only).
- Never connect to a real KKM/eSPKP database or system — synthetic data only.

## 4. Quick checks (after setting up)

| Check | Command / action | Expected |
|-------|------------------|----------|
| Subagent detected | Ask: `Use the semak-ci4 subagent to review app/Config/Routes.php` | A `semak-ci4` line appears, then a findings table |
| Skill detected | Type `/mig` in `claude` | `/migration-ci4` in the list |
| MCP connected | `claude mcp list` | `✔ Connected` for each server |
| MCP tool used | `Use the ci4-spark routes tool and list the /tlk routes` | A `ci4-spark` tool call is shown, then the answer |

## 🧯 Common problems (Windows)

| Symptom | Cause | Fix |
|---------|-------|-----|
| New subagent not used | `.claude/agents` folder just created | `/exit`, start `claude` again once |
| Skill not in the `/` menu | `skills` folder created after the session started | `/reload-skills` |
| Skill not loaded automatically | `description` too generic | Put the main use first, with real task keywords |
| `claude mcp list`: `ci4-spark` fails to connect | `php` not in the session PATH | Check `php -v` in Git Bash; use the full Laragon `php.exe` path in the `--` command |
| `npx` server fails to start | Node missing / too old | `node -v` (Laragon Full); if it still fails, try `cmd /c npx …` as the server command |
| `--` lost in old PowerShell | PowerShell swallows `--` | Run `claude mcp add` in Git Bash, or write `.mcp.json` yourself |
| `.mcp.json` server not loaded | Not approved yet | Start `claude`, approve; `claude mcp reset-project-choices` to be asked again |
| Server name rejected after `--env` | The CLI reads the name as `KEY=value` | Put `--transport stdio` between `--env …` and the server name |

## ✅ Checklist

- [ ] Subagent `semak-ci4` in `.claude/agents/` and invoked successfully once.
- [ ] Skill `migration-ci4` in `.claude/skills/migration-ci4/SKILL.md` and loaded (automatically or via `/migration-ci4`).
- [ ] `claude mcp list` shows `ci4-spark` and `context7` connected; `.mcp.json` committed without secrets.
