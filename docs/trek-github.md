# Trek Pilihan — GitHub: Repo Pasangan, Pull Request & Semakan Kod

[📅 Jadual](../JADUAL.md) · [🤝 KOLABORASI](../KOLABORASI.md) · [🌿 Nota 12 · Git](../nota/12-git-aliran-kerja.md) · [🛠️ Persediaan](./persediaan.md) · [📋 Trek Jira](./trek-jira.md) · [💡 Trek Design Thinking](./trek-design-thinking.md)

> **Trek pilihan.** Lab teras kekal dengan merge setempat (`git merge --no-ff`) dan lulus tanpa GitHub. Trek ini menggantikan langkah merge setempat dengan **pull request (PR)** yang disemak rakan pasangan. Jika pasangan anda memilihnya, siapkan §3–§6 **sebelum Hari 4** supaya anda boleh push dari hari pertama menulis kod.

Aliran Git setempat (cabang, commit, merge, konflik) diterangkan dalam [Nota 12](../nota/12-git-aliran-kerja.md). Halaman ini **tidak** mengulanginya; ia hanya menambah lapisan GitHub di atasnya.

---

## 1. Tujuan

- **Menyediakan** akses GitHub yang selamat (SSH atau HTTPS) di Windows Git Bash, macOS dan Linux.
- **Mencipta** satu repo *private* untuk pasangan dan menyambungkannya kepada `~/latihan/sistem-tlk-pas` (Lab 1.0).
- **Melindungi** cabang `main` supaya perubahan masuk melalui PR yang diluluskan rakan.
- **Membuka, menyemak dan menggabung** PR untuk setiap ciri (Hari 5–9) mengikut Definition of Done ([KOLABORASI §2](../KOLABORASI.md)).
- **Menerbitkan** keluaran `v1.0-capstone` pada Hari 10.

---

## 2. Bila

| Bila | Apa | Minit |
|------|-----|-------|
| Hari 3 (S4 atau malam, bersama [tugasan persediaan](./tugasan-persediaan.md)) | §3 akaun & auth, §4 repo + push dokumen Hari 1–3, §5 lindungi `main`, §6 templat PR | 45–60 |
| Hari 4, Lab 4.4 | Push pertama projek CI4 melalui PR `setup/projek-ci4` (§7.3) | 15 |
| Hari 5–9 | Satu PR bagi setiap cabang ciri; rakan menyemak sebelum merge | 10 setiap PR |
| Hari 10, Lab 10.3 | PR dokumen UAT, tag `v1.0-capstone`, GitHub Release (§8) | 15 |

> Mesti siap **sebelum Hari 4**. Hari 4 penuh dengan pemasangan CI4 dan Shield; tiada masa untuk menyelesaikan masalah kunci SSH atau token.

---

## 3. Akaun & pengesahan (auth)

### 3.1 Akaun GitHub & 2FA

1. Setiap ahli pasangan mendaftar akaun sendiri di <https://github.com/signup> (jangan kongsi satu akaun).
2. Hidupkan **pengesahan dua faktor (2FA)**: *Settings → Password and authentication → Two-factor authentication*. Guna aplikasi pengesah (authenticator app) dan simpan *recovery codes* di tempat selamat. GitHub mewajibkan 2FA bagi kebanyakan akaun yang menyumbang kod.
3. Pilihan: guna e-mel *noreply* GitHub dalam commit supaya e-mel peribadi tidak terdedah. *Settings → Emails* memaparkan alamat `…@users.noreply.github.com`; tetapkan dengan `git config --global user.email` ([persediaan §5](./persediaan.md)).

> Kata laluan akaun GitHub **tidak** boleh digunakan untuk `git push`. Anda perlukan kunci SSH (§3.2) atau HTTPS dengan pengurus kelayakan/token (§3.3).

### 3.2 Pilihan A — Kunci SSH (disyorkan)

Jalankan dalam **Git Bash** (Windows) atau terminal (macOS/Linux):

```bash
ls ~/.ssh/id_ed25519.pub 2>/dev/null || echo "belum ada kunci"   # semak dahulu
ssh-keygen -t ed25519 -C "<github-user>@laptop-kursus"           # Enter = lokasi lalai; masukkan passphrase
```

Mulakan ejen SSH supaya passphrase tidak ditanya pada setiap push:

```bash
# Windows Git Bash / Linux (ulang setiap terminal baharu, atau tambah ke ~/.bashrc)
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# macOS: simpan passphrase dalam Keychain
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

Salin kunci **awam** (`.pub`, bukan fail tanpa sambungan):

```bash tab="Git Bash / macOS / Linux"
cat ~/.ssh/id_ed25519.pub     # salin seluruh baris output (bermula ssh-ed25519)
```

```powershell tab="PowerShell"
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard   # terus ke clipboard
```

Tambah ke GitHub: *Settings → SSH and GPG keys → New SSH key* → *Key type: Authentication Key* → tampal → *Add SSH key*. Kemudian uji:

```bash
ssh -T git@github.com
```

Kali pertama, jawab `yes` untuk cap jari hos. Output yang betul: `Hi <github-user>! You've successfully authenticated, but GitHub does not provide shell access.`

> Fail `~/.ssh/id_ed25519` (tanpa `.pub`) ialah kunci **peribadi**. Jangan sekali-kali tampal, commit atau hantar ia kepada sesiapa, termasuk jurulatih.

### 3.3 Pilihan B — HTTPS + pengurus kelayakan atau token

Guna HTTPS jika rangkaian pejabat menyekat port SSH 22 (gejala: `ssh -T` tergantung atau `Connection timed out`).

- **Windows:** Git for Windows membawa **Git Credential Manager (GCM)**. `git push` pertama ke URL `https://` membuka pelayar untuk log masuk GitHub (termasuk 2FA). Tiada token perlu disalin.
- **macOS/Linux:** paling mudah dengan GitHub CLI: `gh auth login` → *GitHub.com* → *HTTPS* → *Login with a web browser*. Atau guna *personal access token* sebagai kata laluan apabila Git bertanya.

**Personal access token (PAT):** *Settings → Developer settings → Personal access tokens*.

| Jenis | Bila | Tetapan minimum |
|-------|------|-----------------|
| *Fine-grained* | **Pemilik** repo sahaja | *Resource owner*: akaun anda · *Only select repositories*: `sistem-tlk-pas` · *Contents: Read and write*, *Pull requests: Read and write* · tamat tempoh 30 hari |
| *Classic* | Rakan **collaborator** yang tidak boleh guna SSH/GCM | Skop `repo` · tamat tempoh 30 hari |

> Token *fine-grained* belum menyokong sumbangan ke repo di mana anda hanya *collaborator* (rujuk GitHub Docs, disemak 2026-10-15). Rakan pasangan yang bukan pemilik repo patut guna SSH atau GCM.

Simpan token seperti kata laluan: jangan dalam `.env`, nota, tangkapan skrin atau chat. Jika terdedah, *Revoke* serta-merta dan cipta yang baharu.

---

## 4. Repo pasangan

### 4.1 Cipta repo private & jemput rakan

Seorang ahli (pemilik) melakukan:

1. <https://github.com/new> → *Repository name*: `sistem-tlk-pas` → **Private** (lihat §5.1 sebelum memilih).
2. **Jangan** tanda *Add a README*, *.gitignore* atau *license*. Repo setempat anda sudah ada commit (Lab 1.0); repo kosong mengelakkan sejarah bercabang.
3. *Settings → Collaborators → Add people* → nama pengguna GitHub rakan. Rakan menerima jemputan melalui e-mel atau <https://github.com/notifications>.
4. Berikan URL repo kepada **jurulatih**. Jurulatih merekodnya sebagai butiran lab **Repo Git pasangan** (`git_remote`), yang dipaparkan semula pada panel butiran Lab pelatih.my mulai Hari 4.

### 4.2 Sambung repo setempat & push dokumen Hari 1–3

Dalam folder Lab 1.0:

```bash
cd ~/latihan/sistem-tlk-pas
git status --short                          # mesti kosong; commit dokumen Hari 1–3 dahulu
git branch --show-current                   # mesti main (persediaan §5: init.defaultBranch main)
git remote add origin git@github.com:<github-user>/sistem-tlk-pas.git
git push -u origin main
```

Tukar `<github-user>` kepada nama pengguna pemilik repo, **termasuk** `<` `>` (dalam Git Bash, `<` bermaksud *redirect*). Guna HTTPS (§3.3)? Gantikan URL dengan `https://github.com/<github-user>/sistem-tlk-pas.git`. Tersilap URL? `git remote set-url origin <url-betul>`.

Muat semula halaman repo: `README.md`, `docs/carta-skop.md` dan dokumen Hari 2–3 kelihatan.

### 4.3 Rakan pasangan: clone

```bash
cd ~/latihan
git clone git@github.com:<github-user>/sistem-tlk-pas.git
cd sistem-tlk-pas && git log --oneline -3
```

> Pada Hari 4, projek CI4 dicipta dalam folder yang sama ([Lab 4.4](../hari-4/lab.md)). Kedua-dua ahli bekerja pada klon repo yang sama; driver push, navigator `git pull` sebelum bertukar peranan ([Nota 12 §10](../nota/12-git-aliran-kerja.md)).

---

## 5. Lindungi `main`

### 5.1 Had pelan GitHub (disemak 2026-10-15)

| Ciri | Repo **public**, GitHub Free | Repo **private**, GitHub Free | Repo private, GitHub Pro / Team / Enterprise Cloud |
|------|------------------------------|-------------------------------|----------------------------------------------------|
| Rulesets | ✅ | ❌ | ✅ |
| Protected branches (klasik) | ✅ | ❌ | ✅ |
| `CODEOWNERS` | ✅ | ❌ | ✅ |
| PR, semakan, *Approve* | ✅ | ✅ (tanpa penguatkuasaan) | ✅ |

Sumber: GitHub Docs *About rulesets*, *About protected branches*, *About code owners*, *GitHub's plans* (pautan di [Rujukan rasmi](#rujukan-rasmi)). Semak semula jika halaman berubah.

Maksudnya, repo **private percuma** boleh menerima PR dan *Approve*, tetapi GitHub **tidak menghalang** push terus ke `main`. Pilih satu:

| Pilihan | Bila | Syarat |
|---------|------|--------|
| **A. Private + peraturan pasangan** (lalai) | Hampir semua pasangan | Ikut §5.4; jurulatih menyemak `git log --merges` |
| **B. Public + ruleset** | Pasangan mahu latih penguatkuasaan sebenar | Kebenaran jurulatih; repo hanya mengandungi kod latihan dan data **sintetik**; tiada `.env`, tiada nama/IC/plat sebenar |
| **C. Private + ruleset** | Salah seorang sudah ada GitHub Pro (cth melalui program pendidikan) | Akaun Pro itu mesti menjadi pemilik repo |

### 5.2 Ruleset langkah demi langkah (Pilihan B/C)

Buat **selepas** push dokumen Hari 1–3 (§4.2), kerana ruleset menolak push terus ke `main`.

1. Repo → *Settings* → *Rules → Rulesets* → *New ruleset* → *New branch ruleset*.
2. *Ruleset name*: `lindungi-main` · *Enforcement status*: **Active**.
3. *Bypass list*: biarkan kosong (pemilik pun ikut PR).
4. *Target branches* → *Add target* → **Include default branch**.
5. *Rules*:
   - ✅ **Restrict deletions**
   - ✅ **Block force pushes**
   - ✅ **Require a pull request before merging** → *Required approvals*: **1**; tanda *Dismiss stale pull request approvals when new commits are pushed*.
   - Jika ada *Allowed merge methods*, pilih **Merge** sahaja.
6. *Create*. Uji: `git push origin main` dengan commit kosong mesti **ditolak** (`GH013: Repository rule violations`).

### 5.3 Tetapan merge repo

*Settings → General → Pull Requests*:

- ✅ *Allow merge commits* — sepadan dengan `git merge --no-ff` dalam lab teras ([Nota 12 §6](../nota/12-git-aliran-kerja.md)).
- ⬜ *Allow squash merging* dan ⬜ *Allow rebase merging* — matikan supaya sejarah sama dengan lab.
- ✅ *Automatically delete head branches* — cabang di GitHub dibuang selepas merge.

### 5.4 Tiada penguatkuasaan? Peraturan pasangan (Pilihan A)

Tulis dalam `docs/pelan-kerja.md` (Lab 4.4) dan patuhi:

1. Tiada push terus ke `main` selepas §4.2. Semua perubahan melalui PR.
2. Pengarang **tidak** merge PR sendiri; rakan menyemak (§7.2) dan klik *Approve* dahulu.
3. Tersilap push ke `main`? Beritahu rakan; jangan `push --force`. Teruskan dan catat dalam PR seterusnya.

---

## 6. Templat PR & CODEOWNERS

Cipta `.github/pull_request_template.md` dalam cabang `setup/templat-pr`, commit dengan `SETUP: templat PR`, dan buka PR pertama anda (latihan §7).

```markdown
## Ringkasan
<!-- 2–3 baris: apa yang berubah dan kenapa -->

## Isu berkaitan
<!-- Kunci Jira (cth KKM-12) atau #nombor isu GitHub -->

## Cara uji
1. `composer test`
2. Log masuk sebagai … → buka … → jangkaan …

## Definition of Done (KOLABORASI §2)
- [ ] Acceptance criteria (Given/When/Then) lulus diuji manual
- [ ] Validasi di pelayan (Model rules / Validation)
- [ ] Akses dikawal di pelayan (filter + semakan pemilikan)
- [ ] Peralihan status direkod dalam `status_logs` (jika berkaitan)
- [ ] `composer test` hijau
- [ ] Tiada `.env`/rahsia; data sintetik sahaja
- [ ] Saya boleh menerangkan setiap baris kod
```

`CODEOWNERS` meminta semakan secara automatik daripada pemilik laluan. Ia hanya berkuat kuasa pada repo public (Free) atau pelan berbayar (§5.1). Contoh `.github/CODEOWNERS`:

```text
# Lalai: kedua-dua ahli pasangan
*                    @<github-user> @<github-user-rakan>

# Fail berisiko tinggi: rakan mesti menyemak
/app/Config/         @<github-user-rakan>
/app/Database/Migrations/ @<github-user-rakan>
```

Untuk menjadikannya wajib, tanda *Require review from Code Owners* dalam ruleset (§5.2).

---

## 7. Aliran PR satu ciri

### 7.1 Langkah

1. **Cabang** dari `main` terkini ([KOLABORASI §1](../KOLABORASI.md)):
   ```bash
   git switch main && git pull
   git switch -c feat/tlk-borang-tempahan
   ```
2. **Commit** kecil dengan prefix kursus; tambah kunci Jira jika pasangan guna [Trek Jira](./trek-jira.md):
   ```bash
   git add -p
   git commit -m "TLK: tambah validasi tarikh tempahan (KKM-12)"
   ```
3. **Push** cabang:
   ```bash
   git push -u origin feat/tlk-borang-tempahan
   ```
4. **Buka PR** — web: GitHub memaparkan *Compare & pull request* → *base:* `main` ← *compare:* cabang anda → isi templat (§6) → *Reviewers*: rakan → *Create pull request*. Atau GitHub CLI (pilihan):
   ```bash
   gh pr create --base main --title "TLK: borang tempahan" --reviewer <github-user-rakan>
   ```
5. **Rakan menyemak** tab *Files changed*, menjalankan cabang secara setempat jika perlu, kemudian *Review changes* → **Approve** atau **Request changes** (§7.2). Pembetulan = commit baharu pada cabang yang sama + `git push`.
6. **Merge** — *Create a merge commit* → *Confirm merge* (sama seperti `--no-ff`). Atau `gh pr merge --merge --delete-branch`.
7. **Buang cabang & kemas kini** (kedua-dua ahli):
   ```bash
   git switch main && git pull
   git branch -d feat/tlk-borang-tempahan
   git fetch --prune                         # buang rujukan origin/feat/… yang sudah dipadam
   composer test && php spark migrate        # ujian hijau SELEPAS merge; migration baharu jika ada
   ```

### 7.2 Penyemak: 4 soalan

Jawab mengikut turutan dan tulis jawapan ringkas dalam komen semakan:

1. **Adakah ia memenuhi acceptance criteria?** Bandingkan dengan AC Given/When/Then dalam URS.
2. **Adakah ujian berjalan dan hijau?** `composer test` pada cabang ini, bukan "katanya lulus".
3. **Tiada rahsia?** Tiada `.env`, kata laluan, token, `vendor/` atau fail `writable/` dalam *Files changed*.
4. **Boleh dibaca?** Nama jelas, tiada `dd()`/`var_dump()`, dan pengarang boleh menerangkan setiap baris ([KOLABORASI §3](../KOLABORASI.md)).

### 7.3 Pemetaan ke langkah lab teras

| Langkah lab teras | Dengan trek GitHub |
|-------------------|--------------------|
| Hari 4, Lab 4.4 langkah 3: `git push -u origin main` | `git switch -c setup/projek-ci4` → `git push -u origin setup/projek-ci4` → PR → merge → `git switch main && git pull` |
| Hari 4, Lab 4.4 langkah 5: merge latihan `feat/tlk-model` | Push `feat/tlk-model` → PR latihan → merge → `git branch -d feat/tlk-model` (Hari 5 mencipta semula nama ini) |
| Hari 4, Lab 4.4 ⭐: *protected branch* | §5.2 |
| Hari 5–6: `git switch main && git merge --no-ff feat/tlk-…` | §7.1 langkah 3–7 bagi setiap cabang |
| Hari 6, Lab 6.4 langkah 8: `git tag -a m1-siap` | Tag selepas PR terakhir M1 di-merge dan `git pull`; `git push origin m1-siap` |
| Hari 7–8: `git merge --no-ff feat/pas-kelulusan` + `git push` | PR `feat/pas-kelulusan` → `main`. Jika `feat/pas-permohonan` belum di-merge, merge PR itu dahulu |
| Hari 9, Lab 9.4 langkah 8: `git push -u origin feat/laporan` | Sudah selari: buka PR dari cabang itu |
| Hari 10: `fix/bug-001-…` → merge | PR dengan `FIX: … (BUG-001)` |
| Hari 10, Lab 10.3 langkah 6: commit `docs/` terus pada `main` | Cabang `setup/uat-signoff` → PR → merge → tag (§8) |

---

## 8. Issues, Projects & Releases

- **Board utama ialah Jira** ([Trek Jira](./trek-jira.md)). GitHub Issues dan Projects pilihan sahaja; jangan jejak kerja yang sama di dua tempat. Jika guna Jira, letak kunci (cth `KKM-12`) dalam tajuk PR atau commit.
- Tanpa Jira: satu *Issue* per ciri, dan tulis `Closes #7` dalam badan PR supaya isu ditutup apabila PR di-merge.
- **Release Hari 10** — selepas PR `setup/uat-signoff` di-merge:
  ```bash
  git switch main && git pull
  git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
  git push origin v1.0-capstone
  ```
  Repo → *Releases* → *Draft a new release* → *Choose a tag*: `v1.0-capstone` → *Generate release notes* → semak → *Publish release*. Hantar URL release kepada jurulatih bersama skrip demo.

> Ruleset `main` tidak menyekat push tag. Jangan ubah tag yang sudah di-push; jika perlu membetulkan, cipta `v1.0.1-capstone`.

---

## 9. Keselamatan

- **Jangan push** `.env`, `vendor/`, kandungan `writable/` (kecuali `index.html` dan `.gitignore` appstarter), muat naik ujian atau eksport DB. Sebelum push pertama: `git ls-files | grep -E "(^|/)\.env$|^vendor/"` mesti kosong.
- `.env` atau token ter-push? Ikut [Nota 12 §9](../nota/12-git-aliran-kerja.md): buang dari penjejakan, **tukar (rotate)** rahsia serta-merta, maklumkan jurulatih. Repo private tidak menjadikan rahsia selamat.
- **Data sintetik sahaja** (`@latihan.test`, plat rekaan) dalam kod, seeder, tangkapan skrin dalam PR dan isu.
- Jangan tampal kunci peribadi SSH, token atau kata laluan DB dalam PR, komen atau chat AI.
- Repo kekal milik pasangan; selepas kursus, *Settings → Danger Zone → Archive this repository* atau padam jika tidak diperlukan.

---

## 10. ✅ Siap sebelum Hari 4

- [ ] Kedua-dua ahli ada akaun GitHub dengan 2FA dihidupkan.
- [ ] `ssh -T git@github.com` mencetak `Hi <github-user>!` (atau push HTTPS berjaya melalui GCM/`gh`).
- [ ] Repo `sistem-tlk-pas` dicipta, rakan menerima jemputan *collaborator*.
- [ ] `git remote -v` menunjukkan `origin` dan dokumen Hari 1–3 kelihatan di GitHub.
- [ ] Rakan berjaya `git clone` dan `git pull`.
- [ ] URL repo diberikan kepada jurulatih (`git_remote`).
- [ ] `main` dilindungi oleh ruleset (§5.2) **atau** peraturan pasangan ditulis (§5.4).
- [ ] *Allow merge commits* sahaja dan *Automatically delete head branches* dihidupkan (§5.3).
- [ ] PR pertama `setup/templat-pr` disemak dan di-merge.

---

## ⚠️ Kesilapan lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Permission denied (publickey)` | Kunci awam belum ditambah, atau ejen tidak memuat kunci | `ssh-add -l`; ulang §3.2; semak kunci di *Settings → SSH and GPG keys* |
| `ssh -T` tergantung / `Connection timed out` | Port 22 disekat rangkaian pejabat | Guna HTTPS (§3.3) |
| `Support for password authentication was removed` | Kata laluan akaun digunakan untuk HTTPS | GCM, `gh auth login` atau PAT (§3.3) |
| `remote: Repository not found` | URL salah, atau rakan belum menerima jemputan | `git remote -v`; terima jemputan di <https://github.com/notifications> |
| `! [rejected] main -> main (fetch first)` | Repo GitHub dicipta dengan README | `git pull --no-rebase origin main --allow-unrelated-histories` → semak → `git push` |
| `GH013: Repository rule violations` semasa push `main` | Ruleset berfungsi | Push cabang dan buka PR (§7) |
| PR memaparkan commit ciri lain | Cabang dicipta dari cabang ciri, bukan `main` | Merge PR asas dahulu, atau tukar *base* PR |
| *Approve* tidak boleh diklik | Pengarang menyemak PR sendiri | Rakan yang menyemak |
| `fatal: A branch named 'feat/tlk-model' already exists` (Hari 5) | Cabang latihan Hari 4 belum dibuang | `git branch -d feat/tlk-model` |
| `.env` kelihatan dalam *Files changed* | `git add .` tanpa semak | Jangan merge; ikut [Nota 12 §9](../nota/12-git-aliran-kerja.md) |

---

## Rujukan rasmi

Disemak pada 2026-10-15:

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
