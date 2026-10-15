# Optional Track — KKM GitLab: Pair Repo & Merge Requests

[📅 Schedule](../JADUAL.md) · [🤝 KOLABORASI](../KOLABORASI.md) · [🌿 Note 12 · Git](../nota/12-git-aliran-kerja.md) · [🛠️ Setup](./persediaan.md) · [📋 Jira Track](./trek-jira.md) · [💡 Design Thinking Track](./trek-design-thinking.md)

> **Optional track.** The core labs keep local merges (`git merge --no-ff`) and pass without GitLab. This track puts the pair's repo on **KKM's GitLab** (self-managed) and replaces the local merge with a **merge request (MR)** that your partner reviews.

The local Git workflow (branches, commits, merges, conflicts) is explained in [Note 12](../nota/12-git-aliran-kerja.md). This page only adds a GitLab layer on top.

---

## 1. Purpose & when

- **Connect** the `~/latihan/sistem-tlk-pas` repo (Lab 1.0) to one *private* project on KKM's GitLab.
- **Protect** `main` and **merge** changes through MRs that your partner reviews ([KOLABORASI §2](../KOLABORASI.md)).

| When | What | Minutes |
|------|------|---------|
| Day 3, after S4 (with the [prep assignment](./tugasan-persediaan.md)) | §2–§6: log in, SSH key, project, push the documents, first MR | 40 |
| Day 4, Lab 4.4 (S4) | Final step: push the CI4 project through the MR `setup/projek-ci4` (§6) | 15 |

> Must be done **before Day 4**. Day 4 is full of CI4 installation; there is no time to fix SSH key or token problems.

---

## 2. Log in

1. Open `https://<gitlab-kkm>`. The trainer gives you the real URL.
2. Log in with the account that **KKM IT** gave you. Don't register your own account; each partner uses their own account.
3. Turn on 2FA only if KKM requires it (GitLab asks after you log in).

---

## 3. SSH key (or HTTPS token)

In **Git Bash** (Windows, Laragon). The key is stored in `C:\Users\<nama>\.ssh\id_ed25519` (`~/.ssh` in Git Bash):

```bash
ssh-keygen -t ed25519 -C "<emel>"     # Enter = ~/.ssh/id_ed25519; enter a passphrase
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519   # passphrase once per Git Bash window
clip < ~/.ssh/id_ed25519.pub          # copy the public key to the clipboard
```

On GitLab: avatar → *Edit profile* → *Access* → *SSH Keys* → *Add new key* → paste (Ctrl+V) → *Add key*. Then test:

```bash
ssh -T git@<gitlab-kkm>
```

The first time, answer `yes` to the host fingerprint. The correct output: `Welcome to GitLab, @<username>!`

> The file `~/.ssh/id_ed25519` (without `.pub`) is the **private** key. Never paste, commit or send it to anyone. Only `id_ed25519.pub` goes into GitLab.

**Port 22 blocked?** (`ssh -T` hangs or `Connection timed out`) Use HTTPS with a *Personal Access Token*: avatar → *Edit profile* → *Access* → *Personal access tokens* → scopes `read_repository` + `write_repository`, expiry 30 days. *Git Credential Manager* (shipped with Git for Windows) opens a sign-in window on the first `git push`: username = your GitLab username, password = the token. GCM stores it in *Windows Credential Manager*, so you aren't asked again. Don't keep the token in `.env`, notes or chat.

---

## 4. Private project & partner

One partner (the owner) does this:

1. *New project* → *Create blank project* → *Project name*: `sistem-tlk-pas` → *Visibility Level*: **Private**.
2. **Untick** *Initialize repository with a README*. The local repo already has commits (Lab 1.0); an empty project avoids a forked history.
3. *Manage* → *Members* → *Invite members* → your partner, role **Maintainer**, so both partners can merge each other's MRs.

---

## 5. Push the Day 1–3 documents

```bash
cd ~/latihan/sistem-tlk-pas
git status --short                    # must be empty; commit the Day 1–3 documents first
git remote add origin git@<gitlab-kkm>:<akaun>/sistem-tlk-pas.git
git push -u origin main
```

Replace `<gitlab-kkm>` and `<akaun>` (the owner's username), **including** the `<` `>`. HTTPS? Use `https://<gitlab-kkm>/<akaun>/sistem-tlk-pas.git`. Wrong URL? `git remote set-url origin <correct-url>`.

Partner: `cd ~/latihan && git clone git@<gitlab-kkm>:<akaun>/sistem-tlk-pas.git`.

Give the project URL to the **trainer**. The trainer records it as the lab detail **Pair Git repo** (`git_remote`).

---

## 6. Protect `main` & the first merge request

A new GitLab project protects the default branch automatically: no force push, and only Maintainers can push and merge. Check it under *Settings* → *Repository* → *Protected branches* (newer versions: *Branch rules*): `main` → *Allowed to merge* = Maintainers, *Allowed to push and merge* = Maintainers, *Allowed to force push* = off.

Pair rule: no direct pushes to `main` after §5. Every change goes through an MR.

1. **Branch & push:** `git switch -c setup/ahli-pasangan`, add both partners' names to `README.md`, commit `SETUP: ahli pasangan`, then `git push -u origin setup/ahli-pasangan`. Optional: `git push -o merge_request.create -u origin setup/ahli-pasangan` opens the MR straight away.
2. **Open the MR:** GitLab shows *Create merge request* → *Target branch*: `main` → *Reviewer*: your partner → *Create merge request*.
3. **The partner reviews** the *Changes* tab against the Definition of Done ([KOLABORASI §2](../KOLABORASI.md)): AC pass, tests green, no `.env`/secrets, the code can be explained. Fixes = new commits on the same branch + `git push`.
4. **The partner clicks** *Approve*, then *Merge*. The author **never** merges their own MR. On GitLab Free, *Approve* is optional and doesn't block merging; required approval rules are a Premium feature.
5. **Both partners:** `git switch main && git pull && git branch -d setup/ahli-pasangan`.

Mapping to the core labs:

| Core lab step | With the GitLab track |
|---------------|-----------------------|
| Day 4, Lab 4.4 step 3: `git push -u origin main` | Branch `setup/projek-ci4` → push → MR → the partner merges |
| `git switch main && git merge --no-ff feat/…` (Days 4–10) | Push `feat/…` → MR → the partner merges. GitLab's default merge method (*Merge commit*) matches `--no-ff` |
| Day 4, Lab 4.4 ⭐: *protected branch* | Already covered by §6 |

---

## 7. ✅ Ready before Day 4

- [ ] I can log in to the KKM GitLab, and `ssh -T git@<gitlab-kkm>` prints `Welcome to GitLab` (or a push over HTTPS + token works).
- [ ] Project `sistem-tlk-pas` is private, and the partner is a member.
- [ ] The Day 1–3 documents are on GitLab, the partner has cloned the repo, and the URL is given to the trainer.
- [ ] `main` is protected (no force push; only Maintainers merge).
- [ ] The first merge request was reviewed and merged by the partner.

---

## ⚠️ Common mistakes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `.env` or `vendor/` shows in the *Changes* tab | `git add .` without checking | Don't merge; follow [Note 12 §9](../nota/12-git-aliran-kerja.md) and **rotate** the secret |
| Other users can see the project | *Visibility Level* is not Private | *Settings* → *General* → *Visibility* → **Private** |
| The author merges their own MR | GitLab Free doesn't block it | The partner clicks *Merge*; the trainer checks `git log --merges` |

---

## Official references

GitLab Docs, checked 2026-10-15:

- SSH keys (adding a key, `ssh -T`): <https://docs.gitlab.com/user/ssh/>
- Protected branches: <https://docs.gitlab.com/user/project/repository/branches/protected/>
- Default branch (default *Fully protected* protection): <https://docs.gitlab.com/user/project/repository/branches/default/>
- Merge requests: <https://docs.gitlab.com/user/project/merge_requests/>
- Merge request approvals (Free: optional; Premium: required): <https://docs.gitlab.com/user/project/merge_requests/approvals/>
- Push options (`merge_request.create`): <https://docs.gitlab.com/topics/git/commit/>
- Personal access tokens: <https://docs.gitlab.com/user/profile/personal_access_tokens/>
- Token scopes: <https://docs.gitlab.com/security/tokens/access_token_scopes/>
