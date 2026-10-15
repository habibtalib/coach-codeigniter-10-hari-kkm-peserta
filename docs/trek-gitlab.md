# Trek Pilihan — GitLab KKM: Repo Pasangan & Merge Request

[📅 Jadual](../JADUAL.md) · [🤝 KOLABORASI](../KOLABORASI.md) · [🌿 Nota 12 · Git](../nota/12-git-aliran-kerja.md) · [🛠️ Persediaan](./persediaan.md) · [📋 Trek Jira](./trek-jira.md) · [💡 Trek Design Thinking](./trek-design-thinking.md)

> **Trek pilihan.** Lab teras kekal dengan merge setempat (`git merge --no-ff`) dan lulus tanpa GitLab. Trek ini meletakkan repo pasangan di **GitLab KKM** (self-managed) dan menggantikan merge setempat dengan **merge request (MR)** yang disemak rakan pasangan.

Aliran Git setempat (cabang, commit, merge, konflik) diterangkan dalam [Nota 12](../nota/12-git-aliran-kerja.md). Halaman ini hanya menambah lapisan GitLab di atasnya.

---

## 1. Tujuan & bila

- **Menyambung** repo `~/latihan/sistem-tlk-pas` (Lab 1.0) kepada satu projek *private* di GitLab KKM.
- **Melindungi** `main` dan **menggabung** perubahan melalui MR yang disemak rakan ([KOLABORASI §2](../KOLABORASI.md)).

| Bila | Apa | Minit |
|------|-----|-------|
| Hari 3, selepas S4 (bersama [tugasan persediaan](./tugasan-persediaan.md)) | §2–§6: log masuk, kunci SSH, projek, push dokumen, MR pertama | 40 |
| Hari 4, Lab 4.4 (S4) | Langkah akhir: push projek CI4 melalui MR `setup/projek-ci4` (§6) | 15 |

> Mesti siap **sebelum Hari 4**. Hari 4 penuh dengan pemasangan CI4; tiada masa untuk menyelesaikan masalah kunci SSH atau token.

---

## 2. Log masuk

1. Buka `https://<gitlab-kkm>`. Jurulatih memberi URL sebenar.
2. Log masuk dengan akaun yang diberi oleh **IT KKM**. Jangan daftar akaun sendiri; setiap ahli pasangan guna akaun masing-masing.
3. Hidupkan 2FA hanya jika KKM mewajibkannya (GitLab akan meminta selepas log masuk).

---

## 3. Kunci SSH (atau token HTTPS)

Dalam **Git Bash** (Windows, Laragon). Kunci disimpan di `C:\Users\<nama>\.ssh\id_ed25519` (`~/.ssh` dalam Git Bash):

```bash
ssh-keygen -t ed25519 -C "<emel>"     # Enter = ~/.ssh/id_ed25519; masukkan passphrase
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519   # passphrase sekali bagi setiap tetingkap Git Bash
clip < ~/.ssh/id_ed25519.pub          # salin kunci awam ke clipboard
```

Di GitLab: avatar → *Edit profile* → *Access* → *SSH Keys* → *Add new key* → tampal (Ctrl+V) → *Add key*. Kemudian uji:

```bash
ssh -T git@<gitlab-kkm>
```

Kali pertama, jawab `yes` untuk cap jari hos. Output yang betul: `Welcome to GitLab, @<nama-pengguna>!`

> Fail `~/.ssh/id_ed25519` (tanpa `.pub`) ialah kunci **peribadi**. Jangan tampal, commit atau hantar ia kepada sesiapa. Yang ditampal ke GitLab hanyalah `id_ed25519.pub`.

**Port 22 disekat?** (`ssh -T` tergantung atau `Connection timed out`) Guna HTTPS dengan *Personal Access Token*: avatar → *Edit profile* → *Access* → *Personal access tokens* → skop `read_repository` + `write_repository`, tamat tempoh 30 hari. *Git Credential Manager* (dibawa bersama Git for Windows) membuka tetingkap log masuk pada `git push` pertama: nama pengguna = nama pengguna GitLab, kata laluan = token. GCM menyimpannya dalam *Windows Credential Manager*, jadi ia tidak ditanya lagi. Jangan simpan token dalam `.env`, nota atau chat.

---

## 4. Projek private & rakan

Seorang ahli (pemilik) melakukan:

1. *New project* → *Create blank project* → *Project name*: `sistem-tlk-pas` → *Visibility Level*: **Private**.
2. **Nyahtanda** *Initialize repository with a README*. Repo setempat sudah ada commit (Lab 1.0); projek kosong mengelakkan sejarah bercabang.
3. *Manage* → *Members* → *Invite members* → rakan pasangan, peranan **Maintainer**, supaya kedua-dua ahli boleh merge MR satu sama lain.

---

## 5. Push dokumen Hari 1–3

```bash
cd ~/latihan/sistem-tlk-pas
git status --short                    # mesti kosong; commit dokumen Hari 1–3 dahulu
git remote add origin git@<gitlab-kkm>:<akaun>/sistem-tlk-pas.git
git push -u origin main
```

Tukar `<gitlab-kkm>` dan `<akaun>` (nama pengguna pemilik), **termasuk** `<` `>`. HTTPS? Guna `https://<gitlab-kkm>/<akaun>/sistem-tlk-pas.git`. Tersilap URL? `git remote set-url origin <url-betul>`.

Rakan pasangan: `cd ~/latihan && git clone git@<gitlab-kkm>:<akaun>/sistem-tlk-pas.git`.

Berikan URL projek kepada **jurulatih**. Jurulatih merekodnya sebagai butiran lab **Repo Git pasangan** (`git_remote`).

---

## 6. Lindungi `main` & merge request pertama

Projek GitLab baharu melindungi cabang lalai secara automatik: tiada force push, dan hanya Maintainer boleh push dan merge. Semak di *Settings* → *Repository* → *Protected branches* (versi baharu: *Branch rules*): `main` → *Allowed to merge* = Maintainers, *Allowed to push and merge* = Maintainers, *Allowed to force push* = mati.

Peraturan pasangan: tiada push terus ke `main` selepas §5. Semua perubahan melalui MR.

1. **Cabang & push:** `git switch -c setup/ahli-pasangan`, tambah nama kedua-dua ahli dalam `README.md`, commit `SETUP: ahli pasangan`, kemudian `git push -u origin setup/ahli-pasangan`. Pilihan: `git push -o merge_request.create -u origin setup/ahli-pasangan` terus membuka MR.
2. **Buka MR:** GitLab memaparkan *Create merge request* → *Target branch*: `main` → *Reviewer*: rakan → *Create merge request*.
3. **Rakan menyemak** tab *Changes* ikut Definition of Done ([KOLABORASI §2](../KOLABORASI.md)): AC lulus, ujian hijau, tiada `.env`/rahsia, kod boleh diterangkan. Pembetulan = commit baharu pada cabang yang sama + `git push`.
4. **Rakan klik** *Approve*, kemudian *Merge*. Pengarang **tidak** merge MR sendiri. Di GitLab Free, *Approve* adalah pilihan dan tidak menyekat merge; peraturan kelulusan wajib ialah ciri Premium.
5. **Kedua-dua ahli:** `git switch main && git pull && git branch -d setup/ahli-pasangan`.

Pemetaan ke lab teras:

| Langkah lab teras | Dengan trek GitLab |
|-------------------|--------------------|
| Hari 4, Lab 4.4 langkah 3: `git push -u origin main` | Cabang `setup/projek-ci4` → push → MR → rakan merge |
| `git switch main && git merge --no-ff feat/…` (Hari 4–10) | Push `feat/…` → MR → rakan merge. Kaedah merge lalai GitLab (*Merge commit*) sama dengan `--no-ff` |
| Hari 4, Lab 4.4 ⭐: *protected branch* | Sudah dipenuhi oleh §6 |

---

## 7. ✅ Siap sebelum Hari 4

- [ ] Saya boleh log masuk ke GitLab KKM, dan `ssh -T git@<gitlab-kkm>` mencetak `Welcome to GitLab` (atau push melalui HTTPS + token berjaya).
- [ ] Projek `sistem-tlk-pas` adalah private, dan rakan pasangan ialah ahli projek.
- [ ] Dokumen Hari 1–3 ada di GitLab, rakan sudah clone repo, dan URL diberikan kepada jurulatih.
- [ ] `main` dilindungi (tiada force push; hanya Maintainer merge).
- [ ] Merge request pertama disemak dan di-merge oleh rakan pasangan.

---

## ⚠️ Kesilapan lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `.env` atau `vendor/` kelihatan dalam tab *Changes* | `git add .` tanpa semak | Jangan merge; ikut [Nota 12 §9](../nota/12-git-aliran-kerja.md) dan **tukar (rotate)** rahsia |
| Projek boleh dilihat oleh pengguna lain | *Visibility Level* bukan Private | *Settings* → *General* → *Visibility* → **Private** |
| Pengarang merge MR sendiri | GitLab Free tidak menyekatnya | Rakan yang klik *Merge*; jurulatih menyemak `git log --merges` |

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
