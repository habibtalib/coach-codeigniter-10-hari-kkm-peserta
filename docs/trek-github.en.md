# Optional Track — GitHub: Pair Repo, Pull Requests & Code Review

[📅 Schedule](../JADUAL.md) · [🤝 KOLABORASI](../KOLABORASI.md) · [🌿 Note 12 · Git](../nota/12-git-aliran-kerja.md) · [🛠️ Setup](./persediaan.md) · [📋 Jira Track](./trek-jira.md) · [💡 Design Thinking Track](./trek-design-thinking.md)

> **Optional track.** The core labs keep local merges (`git merge --no-ff`) and pass without GitHub. This track replaces the local merge steps with a **pull request (PR)** that your partner reviews. If your pair chooses it, finish §3–§6 **before Day 4** so you can push from the first coding day.

The local Git workflow (branches, commits, merges, conflicts) is explained in [Note 12](../nota/12-git-aliran-kerja.md). This page does **not** repeat it; it only adds a GitHub layer on top.

---

## 1. Purpose

- **Set up** secure GitHub access (SSH or HTTPS) on Windows Git Bash, macOS and Linux.
- **Create** one *private* repo for the pair and connect it to `~/latihan/sistem-tlk-pas` (Lab 1.0).
- **Protect** the `main` branch so changes come in through a PR that your partner approves.
- **Open, review and merge** a PR for every feature (Days 5–9) against the Definition of Done ([KOLABORASI §2](../KOLABORASI.md)).
- **Publish** the `v1.0-capstone` release on Day 10.

---

## 2. When

| When | What | Minutes |
|------|------|---------|
| Day 3 (S4 or the evening, with the [pre-course assignment](./tugasan-persediaan.md)) | §3 account & auth, §4 repo + push the Day 1–3 documents, §5 protect `main`, §6 PR template | 45–60 |
| Day 4, Lab 4.4 | First push of the CI4 project through the PR `setup/projek-ci4` (§7.3) | 15 |
| Days 5–9 | One PR per feature branch; the partner reviews before the merge | 10 per PR |
| Day 10, Lab 10.3 | UAT documents PR, tag `v1.0-capstone`, GitHub Release (§8) | 15 |

> This must be done **before Day 4**. Day 4 is full of CI4 and Shield installation; there is no time to fix SSH key or token problems.

---

## 3. Account & authentication (auth)

### 3.1 GitHub account & 2FA

1. Each member of the pair signs up for their own account at <https://github.com/signup> (don't share one account).
2. Turn on **two-factor authentication (2FA)**: *Settings → Password and authentication → Two-factor authentication*. Use an authenticator app and keep the *recovery codes* somewhere safe. GitHub requires 2FA for most accounts that contribute code.
3. Optional: use your GitHub *noreply* e-mail in commits so your personal e-mail is not exposed. *Settings → Emails* shows the `…@users.noreply.github.com` address; set it with `git config --global user.email` ([setup §5](./persediaan.md)).

> Your GitHub account password **cannot** be used for `git push`. You need an SSH key (§3.2) or HTTPS with a credential manager/token (§3.3).

### 3.2 Option A — SSH key (recommended)

Run in **Git Bash** (Windows) or a terminal (macOS/Linux):

```bash
ls ~/.ssh/id_ed25519.pub 2>/dev/null || echo "belum ada kunci"   # check first
ssh-keygen -t ed25519 -C "<github-user>@laptop-kursus"           # Enter = default location; type a passphrase
```

Start the SSH agent so the passphrase isn't asked on every push:

```bash
# Windows Git Bash / Linux (repeat in every new terminal, or add to ~/.bashrc)
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# macOS: keep the passphrase in the Keychain
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

Copy the **public** key (`.pub`, not the file without an extension):

```bash tab="Git Bash / macOS / Linux"
cat ~/.ssh/id_ed25519.pub     # copy the whole output line (starts with ssh-ed25519)
```

```powershell tab="PowerShell"
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard   # straight to the clipboard
```

Add it to GitHub: *Settings → SSH and GPG keys → New SSH key* → *Key type: Authentication Key* → paste → *Add SSH key*. Then test:

```bash
ssh -T git@github.com
```

The first time, answer `yes` to the host fingerprint. The correct output: `Hi <github-user>! You've successfully authenticated, but GitHub does not provide shell access.`

> The file `~/.ssh/id_ed25519` (without `.pub`) is the **private** key. Never paste, commit or send it to anyone, including the trainer.

### 3.3 Option B — HTTPS + credential manager or token

Use HTTPS if the office network blocks SSH port 22 (symptom: `ssh -T` hangs or `Connection timed out`).

- **Windows:** Git for Windows ships **Git Credential Manager (GCM)**. The first `git push` to an `https://` URL opens the browser to sign in to GitHub (2FA included). No token to copy.
- **macOS/Linux:** easiest with GitHub CLI: `gh auth login` → *GitHub.com* → *HTTPS* → *Login with a web browser*. Or use a *personal access token* as the password when Git asks.

**Personal access token (PAT):** *Settings → Developer settings → Personal access tokens*.

| Type | When | Minimum settings |
|------|------|------------------|
| *Fine-grained* | Repo **owner** only | *Resource owner*: your account · *Only select repositories*: `sistem-tlk-pas` · *Contents: Read and write*, *Pull requests: Read and write* · 30-day expiry |
| *Classic* | A **collaborator** partner who can't use SSH/GCM | `repo` scope · 30-day expiry |

> *Fine-grained* tokens don't yet support contributing to a repo where you are only a *collaborator* (see GitHub Docs, checked 2026-10-15). The partner who doesn't own the repo should use SSH or GCM.

Treat the token like a password: not in `.env`, notes, screenshots or chat. If it leaks, *Revoke* it at once and create a new one.

---

## 4. Pair repo

### 4.1 Create a private repo & invite your partner

One member (the owner) does this:

1. <https://github.com/new> → *Repository name*: `sistem-tlk-pas` → **Private** (read §5.1 before choosing).
2. **Don't** tick *Add a README*, *.gitignore* or *license*. Your local repo already has commits (Lab 1.0); an empty repo avoids diverging histories.
3. *Settings → Collaborators → Add people* → your partner's GitHub username. The partner accepts the invitation by e-mail or at <https://github.com/notifications>.
4. Give the repo URL to the **trainer**. The trainer records it as the lab detail **Pair's Git repo** (`git_remote`), which is shown back on the pelatih.my Lab details panel from Day 4.

### 4.2 Connect the local repo & push the Day 1–3 documents

In the Lab 1.0 folder:

```bash
cd ~/latihan/sistem-tlk-pas
git status --short                          # must be empty; commit the Day 1–3 documents first
git branch --show-current                   # must be main (setup §5: init.defaultBranch main)
git remote add origin git@github.com:<github-user>/sistem-tlk-pas.git
git push -u origin main
```

Replace `<github-user>` with the repo owner's username, **including** the `<` `>` (in Git Bash, `<` means *redirect*). Using HTTPS (§3.3)? Replace the URL with `https://github.com/<github-user>/sistem-tlk-pas.git`. Wrong URL? `git remote set-url origin <url-betul>`.

Reload the repo page: `README.md`, `docs/carta-skop.md` and the Day 2–3 documents are visible.

### 4.3 Partner: clone

```bash
cd ~/latihan
git clone git@github.com:<github-user>/sistem-tlk-pas.git
cd sistem-tlk-pas && git log --oneline -3
```

> On Day 4, the CI4 project is created in the same folder ([Lab 4.4](../hari-4/lab.md)). Both members work on clones of the same repo; the driver pushes, the navigator runs `git pull` before swapping roles ([Note 12 §10](../nota/12-git-aliran-kerja.md)).

---

## 5. Protect `main`

### 5.1 GitHub plan limits (checked 2026-10-15)

| Feature | **Public** repo, GitHub Free | **Private** repo, GitHub Free | Private repo, GitHub Pro / Team / Enterprise Cloud |
|---------|------------------------------|-------------------------------|----------------------------------------------------|
| Rulesets | ✅ | ❌ | ✅ |
| Protected branches (classic) | ✅ | ❌ | ✅ |
| `CODEOWNERS` | ✅ | ❌ | ✅ |
| PR, review, *Approve* | ✅ | ✅ (not enforced) | ✅ |

Sources: GitHub Docs *About rulesets*, *About protected branches*, *About code owners*, *GitHub's plans* (links under [Official references](#official-references)). Check again if the pages change.

This means a **free private** repo can take PRs and *Approve*, but GitHub does **not block** direct pushes to `main`. Pick one:

| Option | When | Conditions |
|--------|------|------------|
| **A. Private + pair rule** (default) | Almost every pair | Follow §5.4; the trainer checks `git log --merges` |
| **B. Public + ruleset** | The pair wants to practise real enforcement | Trainer's permission; the repo holds only training code and **synthetic** data; no `.env`, no real names/IC numbers/plates |
| **C. Private + ruleset** | One member already has GitHub Pro (e.g. through an education programme) | That Pro account must own the repo |

### 5.2 Ruleset step by step (Option B/C)

Do this **after** pushing the Day 1–3 documents (§4.2), because the ruleset rejects direct pushes to `main`.

1. Repo → *Settings* → *Rules → Rulesets* → *New ruleset* → *New branch ruleset*.
2. *Ruleset name*: `lindungi-main` · *Enforcement status*: **Active**.
3. *Bypass list*: leave it empty (the owner goes through PRs too).
4. *Target branches* → *Add target* → **Include default branch**.
5. *Rules*:
   - ✅ **Restrict deletions**
   - ✅ **Block force pushes**
   - ✅ **Require a pull request before merging** → *Required approvals*: **1**; tick *Dismiss stale pull request approvals when new commits are pushed*.
   - If *Allowed merge methods* is shown, choose **Merge** only.
6. *Create*. Test: `git push origin main` with an empty commit must be **rejected** (`GH013: Repository rule violations`).

### 5.3 Repo merge settings

*Settings → General → Pull Requests*:

- ✅ *Allow merge commits* — matches `git merge --no-ff` in the core labs ([Note 12 §6](../nota/12-git-aliran-kerja.md)).
- ⬜ *Allow squash merging* and ⬜ *Allow rebase merging* — turn them off so the history matches the labs.
- ✅ *Automatically delete head branches* — the branch on GitHub is removed after the merge.

### 5.4 No enforcement? Pair rule (Option A)

Write this in `docs/pelan-kerja.md` (Lab 4.4) and follow it:

1. No direct pushes to `main` after §4.2. Every change goes through a PR.
2. The author does **not** merge their own PR; the partner reviews (§7.2) and clicks *Approve* first.
3. Pushed to `main` by mistake? Tell your partner; don't `push --force`. Carry on and note it in the next PR.

---

## 6. PR template & CODEOWNERS

Create `.github/pull_request_template.md` on a `setup/templat-pr` branch, commit it with `SETUP: templat PR`, and open your first PR (practice for §7).

```markdown
## Summary
<!-- 2–3 lines: what changed and why -->

## Related issue
<!-- Jira key (e.g. KKM-12) or GitHub issue #number -->

## How tested
1. `composer test`
2. Log in as … → open … → expected …

## Definition of Done (KOLABORASI §2)
- [ ] Acceptance criteria (Given/When/Then) pass when tested manually
- [ ] Server-side validation (Model rules / Validation)
- [ ] Access controlled on the server (filter + ownership check)
- [ ] Status transitions recorded in `status_logs` (if relevant)
- [ ] `composer test` green
- [ ] No `.env`/secrets; synthetic data only
- [ ] I can explain every line of code
```

`CODEOWNERS` requests a review automatically from the owner of a path. It only takes effect on public repos (Free) or paid plans (§5.1). Example `.github/CODEOWNERS`:

```text
# Default: both members of the pair
*                    @<github-user> @<github-user-rakan>

# High-risk files: the partner must review
/app/Config/         @<github-user-rakan>
/app/Database/Migrations/ @<github-user-rakan>
```

To make it mandatory, tick *Require review from Code Owners* in the ruleset (§5.2).

---

## 7. One-feature PR flow

### 7.1 Steps

1. **Branch** from the latest `main` ([KOLABORASI §1](../KOLABORASI.md)):
   ```bash
   git switch main && git pull
   git switch -c feat/tlk-borang-tempahan
   ```
2. **Commit** in small steps with the course prefix; add the Jira key if your pair uses the [Jira Track](./trek-jira.md):
   ```bash
   git add -p
   git commit -m "TLK: tambah validasi tarikh tempahan (KKM-12)"
   ```
3. **Push** the branch:
   ```bash
   git push -u origin feat/tlk-borang-tempahan
   ```
4. **Open the PR** — web: GitHub shows *Compare & pull request* → *base:* `main` ← *compare:* your branch → fill in the template (§6) → *Reviewers*: your partner → *Create pull request*. Or GitHub CLI (optional):
   ```bash
   gh pr create --base main --title "TLK: borang tempahan" --reviewer <github-user-rakan>
   ```
5. **The partner reviews** the *Files changed* tab, runs the branch locally if needed, then *Review changes* → **Approve** or **Request changes** (§7.2). Fixes = new commits on the same branch + `git push`.
6. **Merge** — *Create a merge commit* → *Confirm merge* (same as `--no-ff`). Or `gh pr merge --merge --delete-branch`.
7. **Delete the branch & update** (both members):
   ```bash
   git switch main && git pull
   git branch -d feat/tlk-borang-tempahan
   git fetch --prune                         # remove origin/feat/… refs that were deleted
   composer test && php spark migrate        # tests green AFTER the merge; new migrations if any
   ```

### 7.2 Reviewer: 4 questions

Answer in this order and write short answers in the review comment:

1. **Does it meet the acceptance criteria?** Compare against the Given/When/Then AC in the URS.
2. **Do the tests run and pass?** `composer test` on this branch, not "they say it passes".
3. **No secrets?** No `.env`, passwords, tokens, `vendor/` or `writable/` files in *Files changed*.
4. **Is it readable?** Clear names, no `dd()`/`var_dump()`, and the author can explain every line ([KOLABORASI §3](../KOLABORASI.md)).

### 7.3 Mapping to the core lab steps

| Core lab step | With the GitHub track |
|---------------|-----------------------|
| Day 4, Lab 4.4 step 3: `git push -u origin main` | `git switch -c setup/projek-ci4` → `git push -u origin setup/projek-ci4` → PR → merge → `git switch main && git pull` |
| Day 4, Lab 4.4 step 5: practice merge of `feat/tlk-model` | Push `feat/tlk-model` → practice PR → merge → `git branch -d feat/tlk-model` (Day 5 creates this name again) |
| Day 4, Lab 4.4 ⭐: *protected branch* | §5.2 |
| Days 5–6: `git switch main && git merge --no-ff feat/tlk-…` | §7.1 steps 3–7 for every branch |
| Day 6, Lab 6.4 step 8: `git tag -a m1-siap` | Tag after the last M1 PR is merged and `git pull`; `git push origin m1-siap` |
| Days 7–8: `git merge --no-ff feat/pas-kelulusan` + `git push` | PR `feat/pas-kelulusan` → `main`. If `feat/pas-permohonan` isn't merged yet, merge that PR first |
| Day 9, Lab 9.4 step 8: `git push -u origin feat/laporan` | Already aligned: open a PR from that branch |
| Day 10: `fix/bug-001-…` → merge | PR with `FIX: … (BUG-001)` |
| Day 10, Lab 10.3 step 6: commit `docs/` straight on `main` | Branch `setup/uat-signoff` → PR → merge → tag (§8) |

---

## 8. Issues, Projects & Releases

- **The main board is Jira** ([Jira Track](./trek-jira.md)). GitHub Issues and Projects are optional; don't track the same work in two places. If you use Jira, put the key (e.g. `KKM-12`) in the PR or commit title.
- Without Jira: one *Issue* per feature, and write `Closes #7` in the PR body so the issue closes when the PR is merged.
- **Day 10 release** — after the `setup/uat-signoff` PR is merged:
  ```bash
  git switch main && git pull
  git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
  git push origin v1.0-capstone
  ```
  Repo → *Releases* → *Draft a new release* → *Choose a tag*: `v1.0-capstone` → *Generate release notes* → review → *Publish release*. Send the release URL to the trainer with your demo script.

> The `main` ruleset doesn't block tag pushes. Don't change a tag that is already pushed; if you need a fix, create `v1.0.1-capstone`.

---

## 9. Safety

- **Never push** `.env`, `vendor/`, `writable/` contents (except the appstarter `index.html` and `.gitignore`), test uploads or DB exports. Before the first push: `git ls-files | grep -E "(^|/)\.env$|^vendor/"` must be empty.
- Pushed `.env` or a token? Follow [Note 12 §9](../nota/12-git-aliran-kerja.md): remove it from tracking, **rotate** the secret at once, tell the trainer. A private repo doesn't make a secret safe.
- **Synthetic data only** (`@latihan.test`, made-up plates) in code, seeders, screenshots in PRs and issues.
- Don't paste the SSH private key, tokens or DB passwords into PRs, comments or AI chats.
- The repo stays the pair's own; after the course, *Settings → Danger Zone → Archive this repository* or delete it if not needed.

---

## 10. ✅ Ready before Day 4

- [ ] Both members have a GitHub account with 2FA turned on.
- [ ] `ssh -T git@github.com` prints `Hi <github-user>!` (or an HTTPS push works through GCM/`gh`).
- [ ] The `sistem-tlk-pas` repo is created and the partner has accepted the *collaborator* invitation.
- [ ] `git remote -v` shows `origin` and the Day 1–3 documents are visible on GitHub.
- [ ] The partner can `git clone` and `git pull`.
- [ ] The repo URL is given to the trainer (`git_remote`).
- [ ] `main` is protected by a ruleset (§5.2) **or** the pair rule is written down (§5.4).
- [ ] Only *Allow merge commits* and *Automatically delete head branches* are turned on (§5.3).
- [ ] The first PR `setup/templat-pr` is reviewed and merged.

---

## ⚠️ Common mistakes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Permission denied (publickey)` | Public key not added yet, or the agent didn't load the key | `ssh-add -l`; repeat §3.2; check the key under *Settings → SSH and GPG keys* |
| `ssh -T` hangs / `Connection timed out` | Port 22 blocked by the office network | Use HTTPS (§3.3) |
| `Support for password authentication was removed` | Account password used for HTTPS | GCM, `gh auth login` or a PAT (§3.3) |
| `remote: Repository not found` | Wrong URL, or the partner hasn't accepted the invitation | `git remote -v`; accept the invitation at <https://github.com/notifications> |
| `! [rejected] main -> main (fetch first)` | The GitHub repo was created with a README | `git pull --no-rebase origin main --allow-unrelated-histories` → check → `git push` |
| `GH013: Repository rule violations` when pushing `main` | The ruleset works | Push a branch and open a PR (§7) |
| The PR shows another feature's commits | The branch was created from a feature branch, not `main` | Merge the base PR first, or change the PR *base* |
| *Approve* can't be clicked | The author is reviewing their own PR | The partner reviews |
| `fatal: A branch named 'feat/tlk-model' already exists` (Day 5) | The Day 4 practice branch wasn't deleted | `git branch -d feat/tlk-model` |
| `.env` shows in *Files changed* | `git add .` without checking | Don't merge; follow [Note 12 §9](../nota/12-git-aliran-kerja.md) |

---

## Official references

Checked on 2026-10-15:

- Generating a new SSH key: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent>
- Testing your SSH connection: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection>
- Caching your GitHub credentials in Git (GCM): <https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git>
- Managing your personal access tokens: <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens>
- About rulesets: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets>
- Creating rulesets for a repository: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository>
- About protected branches: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches>
- About code owners: <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners>
- GitHub's plans: <https://docs.github.com/en/get-started/learning-about-github/githubs-plans>
- Creating a pull request template: <https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository>
- Managing releases: <https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository>
- GitHub CLI `gh pr create`: <https://cli.github.com/manual/gh_pr_create>
