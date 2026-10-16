# Your Repo `kelas-ci-<nama>` — KKM GitLab (GitLab KKM) & Merge Requests

[📅 Schedule](../JADUAL.md) · [🤝 COLLABORATION](kolaborasi.md) · [🌿 Note 12 · Git](nota-12-git-aliran-kerja.md) · [🛠️ Setup](./persediaan.md) · [📋 Jira Track](./trek-jira.md) · [💡 Design Thinking Track](./trek-design-thinking.md)

> **Core flow.** Every participant has one *private* project `kelas-ci-<nama>` on KKM's GitLab (GitLab KKM), created in [Day 2 Lab 2.2](../hari-2/lab.md#lab-22--projek-ci-anda-di-gitlab-s2) and used up to Day 10. This page is the reference for that flow: log in, HTTPS, the project, push, protecting `main` and merge requests (MRs) into your own `main`.

The local Git flow (branch, commit, merge, conflicts) is explained in [Note 12](nota-12-git-aliran-kerja.md). This page only adds the GitLab layer on top of it.

---

## 1. Purpose & when

- **Connect** the local project `~/latihan/kelas-ci-<nama>` to one *private* project in your namespace on GitLab KKM.
- **Protect** `main` and **merge** changes through an MR into your own `main`, after the trainer or a neighbour leaves a comment ([COLLABORATION §2](kolaborasi.md)).

| When | What | Minutes |
|------|------|---------|
| Day 2, Lab 2.2 (S2) | §2–§5: log in, HTTPS + Git Credential Manager, private project, trainer as Reporter, first push | 40 |
| Day 4, Lab 4.4 (S4) | §6: `feat/…` branch → MR into your own `main` → comment → merge; a fresh clone in a second folder | 15 |

> On Days 2–3 you push straight to `main`. From Day 4 S4, every change goes through a `feat/…` branch and an MR.

---

## 2. Log in

1. Open `https://<gitlab-kkm>`.
2. Log in with the account given by **KKM IT**. Do not register your own account.
3. Turn on 2FA only if KKM requires it (GitLab will ask after you log in).

---

## 3. HTTPS: Git Credential Manager or a token (SSH optional)

The course uses **HTTPS**. *Git Credential Manager* (GCM, bundled with Git for Windows) opens a sign-in window on the first `git push`: sign in with your GitLab KKM account. GCM stores the credentials in *Windows Credential Manager*, so it does not ask again.

**Password rejected** (SSO/2FA)? Create a *Personal Access Token*: avatar → *Edit profile* → *Access Tokens* → scope `write_repository` (includes `read_repository`), expiry 30 days. On the next push: user name = your GitLab KKM user name, password = the token. Never store the token in `.env`, notes or chat.

**Optional — SSH key.** If port 22 is open on your network, in **Git Bash**:

```bash
ssh-keygen -t ed25519 -C "<emel>"     # Enter = ~/.ssh/id_ed25519; enter a passphrase
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519   # passphrase once per Git Bash window
clip < ~/.ssh/id_ed25519.pub          # copy the public key to the clipboard
```

In GitLab: avatar → *Edit profile* → *SSH Keys* → *Add new key* → paste (Ctrl+V) → *Add key*. Then test:

```bash
ssh -T git@<gitlab-kkm>
```

The first time, answer `yes` to the host fingerprint. The correct output: `Welcome to GitLab, @<pengguna>!` Switch the remote to SSH: `git remote set-url origin git@<gitlab-kkm>:<pengguna>/kelas-ci-<nama>.git`.

> The file `~/.ssh/id_ed25519` (without `.pub`) is the **private** key. Never paste, commit or send it to anyone. Only `id_ed25519.pub` goes into GitLab.

---

## 4. Private project & trainer

1. *New project* → *Create blank project* → *Project name*: `kelas-ci-<nama>` → *Project URL*: your own namespace (your user name) → *Visibility Level*: **Private**.
2. **Untick** *Initialize repository with a README*. The project must be empty so the first push is not rejected (`fetch first`).
3. *Manage* → *Members* → *Invite members* → the trainer's user name, role **Reporter**. The trainer can read the code and comment on MRs but cannot push. Optional: invite one neighbour as Reporter too, so they can review your MRs.

---

## 5. First push

```bash
cd ~/latihan/kelas-ci-<nama>
git status --short | grep -E "env|vendor"   # only ?? env; .env and vendor/ are ignored
git remote add origin https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git
git push -u origin main
```

Replace `<pengguna>` and `<nama>`, **including** the `<` `>`. Wrong URL? `git remote set-url origin <url-betul>`. Full steps (CI4 project, `.gitattributes`, first commit): [Lab 2.2](../hari-2/lab.md#lab-22--projek-ci-anda-di-gitlab-s2) steps 4–8.

Reload the project page: `app/`, `public/`, `spark` are visible; **no** `.env` and **no** `vendor/`. Copy the project URL to the place the trainer asks for (e.g. the class list).

---

## 6. Protect `main` & the first merge request

A new GitLab project protects the default branch automatically (no force push), but as the Owner you can still push directly. To enforce the MR flow: *Settings* → *Repository* → *Protected branches* (newer versions: *Branch rules*): `main` → *Allowed to merge* = Maintainers, *Allowed to push and merge* = **No one**, *Allowed to force push* = off.

Rule from Lab 4.4 step 5 (after the `SETUP:` push): no direct pushes to `main`. Every change goes through an MR into your own `main`.

1. **Branch & push:** `git switch -c feat/pelan-kerja`, add `docs/pelan-kerja.md`, commit `DOCS: pelan kerja + DoD`, then `git push -u origin feat/pelan-kerja`. Optional: `git push -o merge_request.create -u origin feat/pelan-kerja` opens the MR directly.
2. **Open the MR:** GitLab shows *Create merge request* → *Target branch*: `main` (your own project) → *Reviewer*: the trainer or a neighbour → *Create merge request*.
3. **Ask for one comment** on the *Changes* tab against the Definition of Done ([COLLABORATION §2](kolaborasi.md)): BR-* rules tested, tests green, no `.env`/secrets, code you can explain. Fixes = a new commit on the same branch + `git push`.
4. **Merge it yourself** once the comment is answered: click *Merge*. GitLab's default merge method (*Merge commit*) is the same as `git merge --no-ff`.
5. **Update locally:** `git switch main && git pull && git branch -d feat/pelan-kerja`.

Mapping to the core labs:

| Core lab step | On GitLab |
|---------------|-----------|
| Days 2–3, Labs 2.2–3.4: `git push` straight to `main` | Commits show on the project page; the trainer spot-checks |
| Day 4, Lab 4.4 step 5: `feat/pelan-kerja` | Push → MR → trainer/neighbour comment → you merge |
| Day 4, Lab 4.4 step 6: fresh clone | `git clone https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git kelas-ci-<nama>-klon` in a second folder |
| Days 5–10: `feat/…` per module | Push `feat/…` → MR → comment → merge |
| Day 4, Lab 4.4 ⭐: *protected branch* | Met by the settings above |

---

## 7. ✅ Check

- [ ] I can log in to GitLab KKM, and `git push` over HTTPS (GCM or token) works.
- [ ] The `kelas-ci-<nama>` project is private in my namespace, and the trainer is a Reporter.
- [ ] The project page has no `.env` or `vendor/`, and the URL has been given to the trainer.
- [ ] `main` is protected (no force push; *Allowed to push and merge* = No one).
- [ ] The first merge request into my own `main` got a trainer/neighbour comment and was merged.

---

## ⚠️ Common mistakes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `.env` or `vendor/` shows in the *Changes* tab | `git add .` without checking, or `git add -f` | Do not merge; follow [Note 12 §9](nota-12-git-aliran-kerja.md) and **rotate** the secrets |
| Other users can see the project | *Visibility Level* is not Private | *Settings* → *General* → *Visibility* → **Private** |
| `remote: HTTP Basic: Access denied` | Password rejected (SSO/2FA) or old stored credentials | Use a Personal Access Token; delete the old credentials: *Credential Manager → Windows Credentials* → `git:https://<gitlab-kkm>` |
| `remote: You are not allowed to push code to protected branches` | `main` is protected (*No one*) | Correct — create a `feat/…` branch and open an MR |
| MR merged with no comment | GitLab Free does not block it | Wait for at least one comment; the trainer checks `git log --merges` |

---

## Official references

GitLab Docs, checked 2026-10-15:

- SSH keys (add a key, `ssh -T`): <https://docs.gitlab.com/user/ssh/>
- Protected branches: <https://docs.gitlab.com/user/project/repository/branches/protected/>
- Default branch (default *Fully protected* protection): <https://docs.gitlab.com/user/project/repository/branches/default/>
- Merge requests: <https://docs.gitlab.com/user/project/merge_requests/>
- Merge request approvals (Free: optional; Premium: required): <https://docs.gitlab.com/user/project/merge_requests/approvals/>
- Push options (`merge_request.create`): <https://docs.gitlab.com/topics/git/commit/>
- Personal access tokens: <https://docs.gitlab.com/user/profile/personal_access_tokens/>
- Token scopes: <https://docs.gitlab.com/security/tokens/access_token_scopes/>
- Roles & permissions (Reporter): <https://docs.gitlab.com/user/permissions/>
