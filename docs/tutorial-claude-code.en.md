# Tutorial — Claude Code Setup (Windows)

[📘 SPEC](./spesifikasi-sistem.en.md) · [🤖 Prompt library](./pustaka-prompt.en.md) · [🤝 Collaboration](./kolaborasi.en.md)

> **When:** finish this **before Day 6**. [Lab 6.3c](../hari-6/lab.en.md#lab-63c--claude-code-suggest-tests-check-by-running-s7) uses Claude Code in your `kelas-ci-<nama>` project. Time: 20–30 minutes.
>
> **Claude Code's role in this course:** an explainer and reviewer, **not** a module generator ([`kolaborasi.en.md`](./kolaborasi.en.md) §3). You must be able to explain every line you commit.

## 🎯 Objectives

- **Install** Claude Code on Windows and **verify** it with `claude --version` and `claude doctor`.
- **Log in** with the course account and **check** the account with `/status`.
- **Configure** the project's `.claude/settings.json` so Claude Code cannot read `.env` or uploaded files.
- **Use** *Plan* mode, `Esc`, `@file` and `!command` safely.

## 🛡️ Data rules (read first)

| Allowed | Not allowed |
|---------|-------------|
| The `kelas-ci-<nama>` practice project with synthetic data (`@latihan.test`, plate `WXX 1234`) | eSPKP code or database, or any real KKM system |
| Error messages, your own code files, `composer test` output | `.env`, passwords, GitLab tokens, Personal Access Tokens |
| Concept questions ("why `FOR UPDATE`?") | Real personal data (names, IC numbers, emails, phone numbers) |

Everything you type, and every file Claude Code reads, is sent to Anthropic's servers. Data policy: <https://code.claude.com/docs/en/data-usage>.

## 1. Prerequisites

- Windows 10 1809+ or Windows 11; Git for Windows (Git Bash) and VS Code already installed ([`persediaan.en.md`](./persediaan.en.md)).
- **A Claude account provided for the course** (Pro, Max, Team, Enterprise or Console). The free claude.ai plan does **not** include Claude Code. Ask the trainer if you have not received an invitation.
- Internet access to the domains in [§7](#7-kkm-network-proxy--domains).

## 2. Install

Claude Code is installed from **PowerShell** (not Git Bash). No administrator window is needed.

1. Press **Start**, type `PowerShell`, open **Windows PowerShell**.
2. Run:

   ```powershell
   irm https://claude.ai/install.ps1 | iex
   ```

   The installer downloads `claude.exe` to `%USERPROFILE%\.local\bin` and keeps it updated automatically in the background.

3. Close **all** VS Code and terminal windows, then reopen them (so the new `PATH` is read).

Common error: `'irm' is not recognized` → you are in Command Prompt, not PowerShell.

## 3. Verify

In the VS Code **Git Bash** terminal:

```bash
claude --version     # cth 2.1.x (Claude Code)
claude doctor        # semakan pemasangan & tetapan; ikut cadangan jika ada amaran
```

Claude Code uses Git Bash for shell commands. If `claude doctor` reports that Git Bash was not found, add this to `%USERPROFILE%\.claude\settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

## 4. Log in

```bash
cd ~/latihan/kelas-ci-<nama>
claude
```

1. On the first run, a browser opens the login page. Choose the account type the trainer gave you and log in. No browser? Press `c` to copy the URL and paste it into a browser.
2. The terminal shows `Login successful`.
3. Type `/status` → the account row shows your email. Type `/exit` (or `Ctrl+C` twice) to quit.

| Command | Purpose |
|---------|---------|
| `/login` | Log in or switch accounts |
| `/logout` | Log out |
| `/status` | Version, model, account, connectivity |

## 5. Project settings: block `.env`

Create this file in the root of your `kelas-ci-<nama>` project. It is committed so the same rules apply every time.

`.claude/settings.json`

```json
{
  "permissions": {
    "defaultMode": "default",
    "deny": [
      "Read(./.env)",
      "Read(./writable/uploads/**)",
      "Read(./writable/session/**)",
      "Read(./writable/logs/**)"
    ]
  }
}
```

- `defaultMode: "default"` (shown as **Manual**): Claude Code **asks** before every file edit and every shell command.
- A `Read(...)` `deny` rule also blocks edits to the same file, and commands such as `cat .env`. It does **not** block a script you write yourself — so never approve a command you do not understand.
- The "Yes, and don't ask again" choice saves the permission in `.claude/settings.local.json` (personal). Do not commit that file:

```bash
echo ".claude/settings.local.json" >> .gitignore
```

Check with `/permissions` in Claude Code: the *Deny* tab lists the four rules above.

## 6. Basic use

| Key / command | Purpose |
|---------------|---------|
| `Shift+Tab` | Switch mode: **Manual** → *accept edits* → **Plan**. If it does not work on Windows: `Alt+M` |
| **Plan** mode | Claude Code reads and suggests only — no files change. Use it for questions & reviews |
| `Esc` | Stop the answer in progress |
| `@app/Services/BookingService.php` | Refer to a specific file in the prompt |
| `!composer test -- --no-coverage tests/tlk` | Run a command directly; the output goes into the conversation |
| `/init` | Create `CLAUDE.md` — a project summary read in every session |
| `/clear` | Start a new conversation (long conversation = less accurate answers) |
| `/usage` | Session usage & plan limits |

**Do not** use *accept edits*, *auto* or *bypass permissions* mode in this course. When Claude Code asks permission to change a file, read the *diff* first; refuse (`No`) if you do not understand it.

The course prompts are in [`pustaka-prompt.en.md`](./pustaka-prompt.en.md): **AI-01** (explain an error), **AI-02** (explain code line by line), **AI-09** (suggest test cases), **AI-05** (review against BR).

## 7. KKM network: proxy & domains

If `claude` hangs or login fails on the office network, ask IT to allow these domains (HTTPS 443):

| Domain | For |
|--------|-----|
| `api.anthropic.com` | Model & checks |
| `claude.ai`, `claude.com` | Login |
| `platform.claude.com` | Console login & tokens |
| `downloads.claude.ai` | Installer & automatic updates |
| `code.claude.com` | Built-in documentation |

Does the network use a proxy? Add this to `%USERPROFILE%\.claude\settings.json` (address from IT), then reopen `claude`:

```json
{
  "env": {
    "HTTPS_PROXY": "http://proxy.contoh.gov.my:8080"
  }
}
```

Check with `/status` (the *Proxy* row). SOCKS proxies are not supported.

## 8. VS Code extension (optional)

*Extensions* (`Ctrl+Shift+X`) → search **Claude Code** (publisher Anthropic) → *Install*. Open it: `Ctrl+Shift+P` → *Claude Code: Open in New Tab*. Select lines in the editor and press `Alt+K` to refer to them in a prompt. The same `.claude/settings.json` applies.

## 🧯 Common problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| `claude: command not found` in Git Bash | Terminal opened before the install | Close all VS Code windows, reopen; check `ls ~/.local/bin/claude.exe` |
| `'irm' is not recognized` | Command run in Command Prompt | Use Windows PowerShell |
| Login: *Claude Code is not included in your plan* | Free claude.ai account | Use the course account from the trainer |
| `Shift+Tab` does not switch mode | Terminal without VT input mode | `Alt+M` |
| `/status` → `Login: Expired` | Login session expired | `/login` |
| Hangs on *Connecting…* | Office proxy/firewall | §7 — domains & `HTTPS_PROXY` |
| Claude Code reads `.env` | `.claude/settings.json` missing or invalid JSON | `claude doctor` reports settings errors; fix the §5 file |

## ✅ Checklist

- [ ] `claude --version` prints a version and `claude doctor` shows no errors.
- [ ] `/status` shows your course account.
- [ ] `.claude/settings.json` (§5) exists in `kelas-ci-<nama>`; `/permissions` shows 4 *Deny* rules.
- [ ] `.gitignore` contains `.claude/settings.local.json`.

Uninstall (if needed): `Remove-Item "$env:USERPROFILE\.local\bin\claude.exe"` and `Remove-Item -Recurse "$env:USERPROFILE\.local\share\claude"` in PowerShell. Official reference: <https://code.claude.com/docs/en/setup>.
