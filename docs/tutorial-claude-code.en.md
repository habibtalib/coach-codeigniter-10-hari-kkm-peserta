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

- Windows 10 1809+ or Windows 11, **64-bit**; Git for Windows (Git Bash) and VS Code already installed ([`persediaan.en.md`](./persediaan.en.md)).
- **A Claude account provided for the course** (Pro, Max, Team, Enterprise or Console). The free claude.ai plan does **not** include Claude Code. Ask the trainer if you have not received an invitation.
- Internet access to the domains in [§7](#7-kkm-network-proxy--domains).

**Pre-check (1 minute), in Windows PowerShell:**

```powershell
[Environment]::Is64BitOperatingSystem
curl.exe -sI https://downloads.claude.ai/claude-code-releases/latest
```

- The first line must be `True`. `False` = 32-bit Windows, Claude Code cannot be installed; use another computer or follow the trainer's demo.
- The first line of the `curl.exe` output must be `HTTP/1.1 200 OK`. `403`, no output or *Could not resolve host* = the network blocks `downloads.claude.ai`: see [§7](#7-kkm-network-proxy--domains) before installing.
- Use `curl.exe`, not `curl`: in PowerShell, `curl` is an alias for `Invoke-WebRequest`.

## 2. Install

Pick **one** method. An administrator window (*Run as administrator*) is **not** needed.

**A. Windows PowerShell (recommended).** Press **Start**, type `PowerShell`, open **Windows PowerShell**. Do **not** pick *Windows PowerShell (x86)*: it is a 32-bit process and the installer rejects it. The prompt starts with `PS C:\`.

```powershell
irm https://claude.ai/install.ps1 | iex
```

**B. Command Prompt (CMD).** If PowerShell is blocked by the ICT unit. Prompt `C:\` without `PS`:

```bat
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

**C. WinGet.** If the installer script is blocked but Microsoft Store/WinGet is allowed:

```powershell
winget install Anthropic.ClaudeCode
```

WinGet does **not** update automatically: run `winget upgrade Anthropic.ClaudeCode` now and then.

After installing:

1. The installer shows **no** progress while it downloads. Wait until the prompt returns (1–3 minutes).
2. Methods A and B install `claude.exe` to `%USERPROFILE%\.local\bin` and keep it updated automatically in the background.
3. Close **all** VS Code and terminal windows, then reopen them so the new `PATH` is read. The terminal inside VS Code inherits its `PATH` from VS Code, so VS Code itself must be closed.

> ⚠️ **Common mistake:** running the Mac/Linux command `curl -fsSL https://claude.ai/install.sh | bash` on Windows. The error is `A parameter cannot be found that matches parameter name 'fsSL'` or `'bash' is not recognized`. Use method A, B or C above.

**Option without a terminal:** the **Claude Desktop** app for Windows (<https://claude.com/download>) has a *Code* tab that runs Claude Code. The course labs use the terminal, so use Desktop only if the terminal install fails and the trainer agrees.

## 3. Verify

In the VS Code **Git Bash** terminal:

```bash
claude --version     # e.g. 2.1.x (Claude Code)
claude doctor        # install & settings check; follow its suggestions if it warns
```

**`claude` not found?** The install succeeded but the folder `%USERPROFILE%\.local\bin` is not in `PATH` yet. In Windows PowerShell:

```powershell
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
```

`False` = not installed: repeat §2. `True` = the file is there, add the folder to your user `PATH` (once, permanent):

```powershell
$p = [Environment]::GetEnvironmentVariable('PATH', 'User')
[Environment]::SetEnvironmentVariable('PATH', "$p;$env:USERPROFILE\.local\bin", 'User')
```

Close all VS Code and terminal windows, reopen, run `claude --version` again.

**The shell Claude Code uses.** With Git for Windows, Claude Code runs commands through **Git Bash**; without it, it uses PowerShell. This course uses Git Bash. If `claude doctor` reports Git Bash not found (Git installed outside `C:\Program Files\Git`), find it with `where.exe git` in PowerShell, then add to `%USERPROFILE%\.claude\settings.json` (the file must be named `bash.exe`, not `git-bash.exe`):

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


Login fails for no clear reason? `/logout`, close Claude Code, run `claude` again and log in once more. The error `OAuth error: Invalid code` means the code expired or was cut off when copied: press `Enter` and complete the login quickly.

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

Prompting for an existing project, a new project and a PRD: [`tutorial-prompt-projek.md`](./tutorial-prompt-projek.md) (Day 7 S12).

## 7. KKM network: proxy & domains

If `claude` hangs or login fails on the office network, ask IT to allow these domains (HTTPS 443):

| Domain | For |
|--------|-----|
| `api.anthropic.com` | Model & checks |
| `claude.ai`, `claude.com` | Login |
| `platform.claude.com` | Console login & tokens |
| `downloads.claude.ai` | Installer & automatic updates |
| `code.claude.com` | Built-in documentation |
| `sso.claude.com` | Login for organisations that use SSO |
| `registry.npmjs.org` | MCP servers launched with `npx` (Lab 7.8) |

Does the network use a proxy? Add this to `%USERPROFILE%\.claude\settings.json` (address from IT), then reopen `claude`:

```json
{
  "env": {
    "HTTPS_PROXY": "http://proxy.contoh.gov.my:8080"
  }
}
```

Check with `/status` (the *Proxy* row). SOCKS proxies are not supported.

**Proxy with TLS inspection** (errors `unable to get local issuer certificate` or `SELF_SIGNED_CERT_IN_CHAIN`): Claude Code installed with method A/B trusts the Windows certificate store by default, so ask IT to install the proxy's CA certificate in the Windows store. If IT gives you a `.pem` certificate file, add it to the `env` of the same file: `"NODE_EXTRA_CA_CERTS": "C:\\path\\corporate-ca.pem"`.

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
| `claude` not found although the install succeeded | `%USERPROFILE%\.local\bin` not in `PATH` | §3 — `Test-Path`, then add it to the user `PATH` |
| `Claude Code does not support 32-bit Windows` | *Windows PowerShell (x86)* was opened | Open *Windows PowerShell* without (x86); check `[Environment]::Is64BitOperatingSystem` |
| `A parameter cannot be found that matches parameter name 'fsSL'` | Mac/Linux command run in PowerShell | §2 method A |
| `The token '&&' is not a valid statement separator` | CMD command run in PowerShell | §2 method A, or open Command Prompt for method B |
| `Could not create SSL/TLS secure channel` | Windows PowerShell 5.1 without TLS 1.2 | Run `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`, then the §2 A command in the same window |
| `CRYPT_E_NO_REVOCATION_CHECK` or `CRYPT_E_REVOCATION_OFFLINE` (method B) | Firewall blocks the certificate revocation check | Add `--ssl-revoke-best-effort` to the method B `curl`, or use method A |
| Error containing HTML, `403` or `System.Xml.XmlDocument` during install | Network/proxy returns a block page | §1 `curl.exe` check; §7; or method C (WinGet) |
| `The process cannot access the file … being used by another process` | A previous install is still running | Close all `claude` windows, retry |
| `API Error: 403` after login | Subscription inactive or proxy | Check the account at <https://claude.ai/settings>; §7 |
| `claude doctor`: Git Bash not found | Git in a non-default location | §3 — `CLAUDE_CODE_GIT_BASH_PATH` |

## ✅ Checklist

- [ ] `claude --version` prints a version and `claude doctor` shows no errors.
- [ ] `/status` shows your course account.
- [ ] `.claude/settings.json` (§5) exists in `kelas-ci-<nama>`; `/permissions` shows 4 *Deny* rules.
- [ ] `.gitignore` contains `.claude/settings.local.json`.

Uninstall (if needed): `Remove-Item "$env:USERPROFILE\.local\bin\claude.exe"` and `Remove-Item -Recurse "$env:USERPROFILE\.local\share\claude"` in PowerShell. Official reference: <https://code.claude.com/docs/en/setup>.
