# Repo Anda `kelas-ci-<nama>` — GitLab KKM (GitLab KKM) & Merge Request

[📅 Jadual](../JADUAL.md) · [🤝 KOLABORASI](kolaborasi.md) · [🌿 Nota 12 · Git](nota-12-git-aliran-kerja.md) · [🛠️ Persediaan](./persediaan.md) · [📋 Trek Jira](./trek-jira.md) · [💡 Trek Design Thinking](./trek-design-thinking.md)

> **Aliran teras.** Setiap peserta ada satu projek *private* `kelas-ci-<nama>` di GitLab KKM (GitLab KKM), dicipta dalam [Hari 2 Lab 2.2](../hari-2/lab.md#lab-22--projek-ci-anda-di-gitlab-s2) dan digunakan hingga Hari 10. Halaman ini ialah rujukan untuk aliran itu: log masuk, HTTPS, projek, push, melindungi `main` dan merge request (MR) ke `main` anda sendiri.

Aliran Git setempat (branch, commit, merge, konflik) diterangkan dalam [Nota 12](nota-12-git-aliran-kerja.md). Halaman ini hanya menambah lapisan GitLab di atasnya.

---

## 1. Tujuan & bila

- **Menyambung** projek setempat `~/latihan/kelas-ci-<nama>` kepada satu projek *private* dalam namespace anda di GitLab KKM.
- **Melindungi** `main` dan **menggabung** perubahan melalui MR ke `main` anda sendiri, selepas jurulatih atau rakan sebelah memberi komen ([KOLABORASI §2](kolaborasi.md)).

| Bila | Apa | Minit |
|------|-----|-------|
| Hari 2, Lab 2.2 (S2) | §2–§5: log masuk, HTTPS + Git Credential Manager, projek private, jurulatih sebagai Reporter, push pertama | 40 |
| Hari 4, Lab 4.4 (S4) | §6: branch `feat/…` → MR ke `main` sendiri → komen → merge; klon baharu dalam folder kedua | 15 |

> Hari 2–3 anda push terus ke `main`. Mulai Hari 4 S4, setiap perubahan melalui branch `feat/…` dan MR.

---

## 2. Log masuk

1. Buka `https://<gitlab-kkm>`.
2. Log masuk dengan akaun yang diberi oleh **IT KKM**. Jangan daftar akaun sendiri.
3. Hidupkan 2FA hanya jika KKM mewajibkannya (GitLab akan meminta selepas log masuk).

---

## 3. HTTPS: Git Credential Manager atau token (SSH pilihan)

Kursus menggunakan **HTTPS**. *Git Credential Manager* (GCM, dibawa bersama Git for Windows) membuka tetingkap log masuk pada `git push` pertama: log masuk dengan akaun GitLab KKM anda. GCM menyimpan kelayakan dalam *Windows Credential Manager*, jadi ia tidak ditanya lagi.

**Kata laluan ditolak** (SSO/2FA)? Cipta *Personal Access Token*: avatar → *Edit profile* → *Access Tokens* → skop `write_repository` (termasuk `read_repository`), tamat tempoh 30 hari. Pada push seterusnya: nama pengguna = nama pengguna GitLab KKM, kata laluan = token. Jangan simpan token dalam `.env`, nota atau chat.

**Pilihan — kunci SSH.** Jika port 22 dibuka di rangkaian anda, dalam **Git Bash**:

```bash
ssh-keygen -t ed25519 -C "<emel>"     # Enter = ~/.ssh/id_ed25519; masukkan passphrase
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519   # passphrase sekali bagi setiap tetingkap Git Bash
clip < ~/.ssh/id_ed25519.pub          # salin kunci awam ke clipboard
```

Di GitLab: avatar → *Edit profile* → *SSH Keys* → *Add new key* → tampal (Ctrl+V) → *Add key*. Kemudian uji:

```bash
ssh -T git@<gitlab-kkm>
```

Kali pertama, jawab `yes` untuk cap jari hos. Output yang betul: `Welcome to GitLab, @<pengguna>!` Tukar remote kepada SSH: `git remote set-url origin git@<gitlab-kkm>:<pengguna>/kelas-ci-<nama>.git`.

> Fail `~/.ssh/id_ed25519` (tanpa `.pub`) ialah kunci **peribadi**. Jangan tampal, commit atau hantar ia kepada sesiapa. Yang ditampal ke GitLab hanyalah `id_ed25519.pub`.

---

## 4. Projek private & jurulatih

1. *New project* → *Create blank project* → *Project name*: `kelas-ci-<nama>` → *Project URL*: namespace anda sendiri (nama pengguna anda) → *Visibility Level*: **Private**.
2. **Nyahtanda** *Initialize repository with a README*. Projek mesti kosong supaya push pertama tidak ditolak (`fetch first`).
3. *Manage* → *Members* → *Invite members* → nama pengguna jurulatih, peranan **Reporter**. Jurulatih boleh membaca kod dan memberi komen pada MR tetapi tidak boleh push. Pilihan: jemput seorang rakan sebelah sebagai Reporter juga supaya dia boleh mengulas MR anda.

---

## 5. Push pertama

```bash
cd ~/latihan/kelas-ci-<nama>
git status --short | grep -E "env|vendor"   # hanya ?? env; .env dan vendor/ diabaikan
git remote add origin https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git
git push -u origin main
```

Tukar `<pengguna>` dan `<nama>`, **termasuk** `<` `>`. Tersilap URL? `git remote set-url origin <url-betul>`. Langkah penuh (projek CI4, `.gitattributes`, commit pertama): [Lab 2.2](../hari-2/lab.md#lab-22--projek-ci-anda-di-gitlab-s2) langkah 4–8.

Muat semula halaman projek: `app/`, `public/`, `spark` kelihatan; **tiada** `.env` dan **tiada** `vendor/`. Salin URL projek ke ruang yang jurulatih minta (cth senarai kelas).

---

## 6. Lindungi `main` & merge request pertama

Projek GitLab baharu melindungi branch lalai secara automatik (tiada force push), tetapi anda sebagai Owner masih boleh push terus. Untuk memaksa aliran MR: *Settings* → *Repository* → *Protected branches* (versi baharu: *Branch rules*): `main` → *Allowed to merge* = Maintainers, *Allowed to push and merge* = **No one**, *Allowed to force push* = mati.

Peraturan mulai Lab 4.4 langkah 5 (selepas push `SETUP:`): tiada push terus ke `main`. Semua perubahan melalui MR ke `main` anda sendiri.

1. **Branch & push:** `git switch -c feat/pelan-kerja`, tambah `docs/pelan-kerja.md`, commit `DOCS: pelan kerja + DoD`, kemudian `git push -u origin feat/pelan-kerja`. Pilihan: `git push -o merge_request.create -u origin feat/pelan-kerja` terus membuka MR.
2. **Buka MR:** GitLab memaparkan *Create merge request* → *Target branch*: `main` (projek anda sendiri) → *Reviewer*: jurulatih atau rakan sebelah → *Create merge request*.
3. **Minta satu komen** pada tab *Changes* ikut Definition of Done ([KOLABORASI §2](kolaborasi.md)): peraturan BR-* diuji, ujian hijau, tiada `.env`/rahsia, kod boleh diterangkan. Pembetulan = commit baharu pada branch yang sama + `git push`.
4. **Merge sendiri** selepas komen dijawab: klik *Merge*. Kaedah merge lalai GitLab (*Merge commit*) sama dengan `git merge --no-ff`.
5. **Kemas kini setempat:** `git switch main && git pull && git branch -d feat/pelan-kerja`.

Pemetaan ke lab teras:

| Langkah lab teras | Di GitLab |
|-------------------|-----------|
| Hari 2–3, Lab 2.2–3.4: `git push` terus ke `main` | Commit kelihatan di halaman projek; jurulatih menyemak secara rawak |
| Hari 4, Lab 4.4 langkah 5: `feat/pelan-kerja` | Push → MR → komen jurulatih/rakan → anda merge |
| Hari 4, Lab 4.4 langkah 6: klon baharu | `git clone https://<gitlab-kkm>/<pengguna>/kelas-ci-<nama>.git kelas-ci-<nama>-klon` dalam folder kedua |
| Hari 5–10: `feat/…` setiap modul | Push `feat/…` → MR → komen → merge |
| Hari 4, Lab 4.4 ⭐: *protected branch* | Dipenuhi oleh tetapan di atas |

---

## 7. ✅ Semak

- [ ] Saya boleh log masuk ke GitLab KKM, dan `git push` melalui HTTPS (GCM atau token) berjaya.
- [ ] Projek `kelas-ci-<nama>` adalah private dalam namespace saya, dan jurulatih ialah Reporter.
- [ ] Halaman projek tidak mengandungi `.env` atau `vendor/`, dan URL diberikan kepada jurulatih.
- [ ] `main` dilindungi (tiada force push; *Allowed to push and merge* = No one).
- [ ] Merge request pertama ke `main` sendiri mendapat komen jurulatih/rakan dan di-merge.

---

## ⚠️ Kesilapan lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `.env` atau `vendor/` kelihatan dalam tab *Changes* | `git add .` tanpa semak, atau `git add -f` | Jangan merge; ikut [Nota 12 §9](nota-12-git-aliran-kerja.md) dan **tukar (rotate)** rahsia |
| Projek boleh dilihat oleh pengguna lain | *Visibility Level* bukan Private | *Settings* → *General* → *Visibility* → **Private** |
| `remote: HTTP Basic: Access denied` | Kata laluan ditolak (SSO/2FA) atau kelayakan lama tersimpan | Guna Personal Access Token; padam kelayakan lama: *Credential Manager → Windows Credentials* → `git:https://<gitlab-kkm>` |
| `remote: You are not allowed to push code to protected branches` | `main` dilindungi (*No one*) | Betul — buat branch `feat/…` dan buka MR |
| MR di-merge tanpa komen | Tiada sekatan di GitLab Free | Tunggu sekurang-kurangnya satu komen; jurulatih menyemak `git log --merges` |

---

## Rujukan rasmi

GitLab Docs, disemak 2026-10-15:

- SSH keys (tambah kunci, `ssh -T`): <https://docs.gitlab.com/user/ssh/>
- Protected branches: <https://docs.gitlab.com/user/project/repository/branches/protected/>
- Default branch (perlindungan lalai *Fully protected*): <https://docs.gitlab.com/user/project/repository/branches/default/>
- Merge requests: <https://docs.gitlab.com/user/project/merge_requests/>
- Merge request approvals (Free: pilihan; Premium: wajib): <https://docs.gitlab.com/user/project/merge_requests/approvals/>
- Push options (`merge_request.create`): <https://docs.gitlab.com/topics/git/commit/>
- Personal access tokens: <https://docs.gitlab.com/user/profile/personal_access_tokens/>
- Skop token: <https://docs.gitlab.com/security/tokens/access_token_scopes/>
- Peranan & kebenaran (Reporter): <https://docs.gitlab.com/user/permissions/>
