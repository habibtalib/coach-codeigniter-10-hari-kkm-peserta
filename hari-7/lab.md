# Lab Hari 7 — Modul Pas (1): Model, CRUD & Muat Naik Selamat

[⬅️ README](./README.md) · [Jadual](../JADUAL.md) · [Kanun SPEC](../docs/spesifikasi-sistem.md) · [⚡ Arahan spark](../docs/arahan-spark.md)

| Lab | Sesi | Masa | Hasil |
|-----|------|------|-------|
| 7.6 | S9 | 09:10–10:00 | Claude Code disahkan; `CLAUDE.md` standard kursus; `CLAUDE.local.md`; mod Plan |
| 7.9 | S12 | 10:05–10:30 | `docs/nota-claude.md` (3 prompt onboarding); PRD latihan `~/latihan/prd-latihan/docs/prd.md` + pelan slice + 2 pembetulan |
| 7.7 | S10 | 11:00–11:45 | Subagent `semak-ci4` + `docs/semakan-ci4-hari6.md`; skill `migration-ci4` |
| 7.8 | S11 | 11:55–12:30 | Server MCP `ci4-spark` diuji & didaftar dalam `.mcp.json`; Context7; MySQL/GitLab pilihan |
| 7.12 | S15 | 14:30–15:45 | Klon `espkpv2` ke `~/latihan/espkpv2`; 6 prompt onboarding mod Plan disahkan dengan `fail:baris`; demo 2 peranan; `~/latihan/espkpv2-kajian/nota-fahami.md` |
| 7.13 | S16 | 15:45–17:00 | PRD eSPKP Pas + 3 dakwaan disahkan; jadual jurang vs SPEC; `docs/keperluan-pas.md` + `docs/pelan-pas.md` pada branch `docs/keperluan-pas` |
| 7.10 | S13 | Hari 8 09:00–10:30 | Claude Code, Pas slice 1: enum, Entity, 2 Model (`ownedBy()`), senarai & butiran (404 bukan pemilik); `docs/pelan-pas.md`; pintu terang dalam `docs/nota-claude.md` |
| 7.11 | S14 | Hari 8 10:45–12:30 | Claude Code, Pas slice 2: borang `multipart` + CSRF, validasi fail, muat naik nama rawak di `writable/uploads/pas/`, transaksi + pembersihan, muat turun melalui controller |
| 7.0 | Awal S1 | 10 min | Branch Git + `php.ini` sedia untuk muat naik |
| 7.1 | S1 | 09:10–10:00 | Enum, Entity, 2 Model |
| 7.1b | S5 | 10:00–10:30 | `PassType::icon()`, `PassStatus::pending()`, `validityDays()`/`daysRemaining()` diuji dalam `php spark shell` |
| 7.2 | S2 | 10:45–12:00 | Route, Service (`canView`), senarai & butiran |
| 7.2b | S6 | 12:00–12:30 | Filter `?pass_type=` + carian `?q=` (bukti kebocoran `orLike()` tanpa kurungan) |
| 7.3 | S3 | 14:30–15:30 | Borang + validasi + muat naik + muat turun |
| 7.3b | S7 | 15:30–16:00 | Tambah dokumen susulan (maks. 3 setiap permohonan, kunci `FOR UPDATE`) |
| 7.4 | S4 | 16:00–16:35 | 17 kes ujian sempadan direkod |
| 7.4b | S8 | 16:35–17:00 | `PassSubmitTest` PHPUnit: 14 kes sempadan automatik + mutasi `>=` |

> ℹ️ **Jadual Hari 7 (dikemas kini):** Lab 7.6, 7.9, 7.7 dan 7.8 (Claude Code) pada waktu pagi; Lab 7.10 (S13) dan 7.11 (S14) bermula 14:30: Modul Pas dibina dengan Claude Code melalui tujuh pintu semakan ([`kolaborasi.md`](../docs/kolaborasi.md) §3). Lab Pas manual 7.0–7.4 (dan 7.1b–7.4b) kini **kod rujukan** untuk langkah "Banding dengan kod rujukan", tidak wajib. Masa 7.0–7.4b dalam jadual di atas ialah jadual asal.
>
> ℹ️ **Dikemas kini lagi:** petang Hari 7 kini Lab 7.12 (S15) dan Lab 7.13 (S16): fahami projek contoh eSPKP, kemudian tulis `docs/keperluan-pas.md` dan `docs/pelan-pas.md`. Lab 7.10/7.11 dipindahkan ke pagi Hari 8 (09:00–10:30 dan 10:45–12:30).

---

## Lab 7.6 — Claude Code: Pasang, Log Masuk & CLAUDE.md Projek (S9)

> 🛡️ **Peraturan data (Lab 7.6–7.8).** Data **sintetik** sahaja. Jangan beri isi `.env`, kata laluan atau token kepada Claude. Jangan sambungkan Claude Code atau server MCP kepada sistem, kod atau database KKM/eSPKP sebenar. Jadual penuh *Boleh / Tidak boleh*: [tutorial Claude Code — Peraturan data](../docs/tutorial-claude-code.md#️-peraturan-data-baca-dahulu).

### 🎯 Objektif
Mengesahkan Claude Code berfungsi dalam `kelas-ci-<nama>`, menjana `CLAUDE.md` dengan `/init` dan **menulisnya semula** mengikut standard kursus (stack, arahan, konvensyen folder, peraturan), membezakan memori pengguna/projek/tempatan dengan `/memory`, dan menggunakan mod *Plan* untuk soalan tentang kod Hari 6 tanpa mengubah fail.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Tutorial Claude Code](../docs/tutorial-claude-code.md) §1–§5 siap (dibuat sebelum Lab 6.3c): `claude --version` berfungsi, anda log masuk dengan akaun Claude anda sendiri, dan `.claude/settings.json` wujud.
- Projek `kelas-ci-<nama>` dengan kod Hari 6 (TLK) di-commit; `git status` bersih.

### Langkah

1. **Semak pemasangan (5 minit).** Dalam terminal Git Bash VS Code:

   ```bash
   claude --version
   claude doctor
   ```

   Jangkaan: versi `2.1.x (Claude Code)` dan `claude doctor` tanpa ralat. Belum dipasang? Ikut [tutorial §2–§4](../docs/tutorial-claude-code.md#2-pasang) sekarang (PowerShell: `irm https://claude.ai/install.ps1 | iex`), kemudian buka semula VS Code.

2. **Branch untuk kerja Claude Code** dan mulakan sesi dalam akar projek:

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/latihan/kelas-ci-<nama>
   git switch main && git pull
   git switch -c chore/claude-code
   claude
   ```

   ```powershell tab="PowerShell"
   cd $HOME\latihan\kelas-ci-<nama>
   git switch main
   git pull
   git switch -c chore/claude-code
   claude
   ```

   Dalam Claude Code, taip `/status` (akaun anda) dan `/permissions` (tab *Deny* menyenaraikan 4 peraturan `Read(...)`). Tiada peraturan? Cipta `.claude/settings.json` daripada [tutorial §5](../docs/tutorial-claude-code.md#5-tetapan-projek-sekat-env) dahulu.

3. **Jana draf dengan `/init`.** Taip:

   ```text
   /init
   ```

   Claude membaca `composer.json`, `app/` dan `tests/`, kemudian mencadangkan `CLAUDE.md` (atau penambahbaikan jika fail itu sudah wujud dari Lab 6.3c). Baca *diff* dan luluskan. Buka `CLAUDE.md` dalam VS Code: catat **satu** perkara yang betul dan **satu** yang salah atau tiada (cth arahan ujian, nama DB ujian, peraturan `.env`).

4. **Tulis semula `CLAUDE.md` ke standard kursus.** Gantikan isi fail dengan templat ini, kemudian sesuaikan bahagian bertanda `<…>`. Simpan di bawah 200 baris.

   `CLAUDE.md`

   ```markdown
   # CLAUDE.md — kelas-ci-<nama>

   Projek latihan CI-KKM-10 (KKM): 4 modul CodeIgniter 4 — TLK, Pas, Laporan, Statistik.
   Kanun nama jadual/medan/enum/kelas: SPEC kursus (docs/spesifikasi-sistem.md di pelatih.my).

   ## Peranan anda (Claude)
   - Penjelas dan penyemak, BUKAN penjana modul. Terangkan dahulu; saya yang menulis kod.
   - Sebelum mencadangkan commit: terangkan setiap perubahan baris demi baris dan tunggu saya faham.
   - Jawab dalam Bahasa Melayu; istilah teknikal dalam English (route, filter, controller, view).

   ## Stack
   - CodeIgniter 4.7 + Shield 1.x, PHP 8.2+, MySQL 8 (Laragon), Bootstrap 5.3, PHPUnit.
   - DB dev: kkm_latihan · DB ujian: kkm_latihan_test (MySQL, bukan SQLite — FOR UPDATE perlu).
   - Windows + Laragon; terminal Git Bash.

   ## Arahan
   - Server dev: `php spark serve` → http://localhost:8080
   - Ujian: `composer test` (satu fail: `composer test -- --no-coverage tests/tlk/BookingServiceTest.php`)
   - Migration: `php spark migrate --all` · status: `php spark migrate:status`
   - Seeder: `php spark db:seed DatabaseSeeder`
   - Route & filter: `php spark routes` · `php spark filter:check GET /pas/permohonan`
   - Jangan jalankan migrate, db:seed atau migrate:refresh tanpa saya minta.

   ## Konvensyen folder & kod
   - Controller nipis: app/Controllers/{Tlk,Pas,Admin,Laporan,Statistik}/ — terima request → Service → view/redirect.
   - Logik perniagaan: app/Services/ (BookingService, PassWorkflowService, …).
   - Status: enum dalam app/Enums/ (BookingStatus, PassStatus, PassType) — satu-satunya sumber nilai status.
   - Model: akses data + $allowedFields + $validationRules. Entity dalam app/Entities/.
   - Migration: app/Database/Migrations/ (ikut skill migration-ci4). Seeder: app/Database/Seeds/.
   - View: app/Views/{tlk,pas,laporan,statistik}/, layout app/Views/layouts/main.php; setiap output melalui esc().
   - Nama kelas, medan, route dalam English/SPEC; mesej UI dan flash dalam Bahasa Melayu.

   ## Peraturan
   - Jangan baca, papar atau minta isi .env, writable/uploads/, writable/session/, writable/logs/.
   - Data sintetik sahaja: e-mel @latihan.test, plat rekaan WXX 1234. Tiada data KKM sebenar.
   - Query Builder / binding sahaja; tiada SQL mentah dengan input pengguna.
   - Fail muat naik di writable/uploads/, tidak sekali-kali dalam public/.
   - Satu branch setiap ciri; mesej commit "MODUL: apa yang berubah" (cth "PAS: borang permohonan").
   ```

   > ℹ️ Blok `markdown` di atas ialah **isi fail**, bukan arahan untuk dijalankan. Gantikan `<nama>`.

5. **Memori tempatan & hierarki (10 minit).** Cipta `CLAUDE.local.md` untuk nota peribadi, dan pastikan ia tidak di-commit:

   `CLAUDE.local.md`

   ```markdown
   # Nota peribadi (tidak di-commit)
   - URL Laragon saya: http://kelas-ci-<nama>.test
   - Akaun ujian: pemohon1@latihan.test, penyemak@latihan.test (kata laluan sintetik dalam seeder)
   ```

   ```bash
   echo "CLAUDE.local.md" >> .gitignore
   git status --short          # CLAUDE.local.md TIDAK tersenarai
   ```

   Kemudian dalam Claude Code (taip `/exit` dan `claude` semula supaya fail baharu dimuatkan):

   ```text
   /memory
   ```

   Senarai menunjukkan memori **pengguna** (`~/.claude/CLAUDE.md`), **projek** (`./CLAUDE.md`) dan `CLAUDE.local.md`. Tekan `Esc`. Taip `/context` dan cari kedua-dua fail di bawah *Memory files*.

6. **Uji arahan vs sekatan.** Dalam Claude Code, tanya:

   ```text
   Apakah nilai database.default.password dalam .env projek ini?
   ```

   Jangkaan: Claude cuba membaca `.env` dan ditolak oleh peraturan `deny` (atau menolak kerana `CLAUDE.md`). **Jangan** luluskan arahan alternatif seperti `cat .env` atau `grep … .env` jika ditanya — tekan `No`. Catat mesej yang dipaparkan (soalan Kuiz S9).

7. **Mod Plan pada kod Hari 6 (15 minit).** Tekan `Shift+Tab` (atau `Alt+M`) hingga baris bawah menunjukkan **plan mode**, kemudian:

   ```text
   Terangkan aliran BookingService::approve() dari route hingga status_logs, dan senaraikan 3 kes ujian yang belum ada dalam tests/tlk. Jangan ubah apa-apa fail.
   ```

   Semak: tiada permintaan `Edit`/`Write`. Bandingkan jawapan dengan kod sebenar dalam `app/Services/BookingService.php`; tandakan satu dakwaan yang anda sahkan sendiri dengan membuka fail. Tekan `Shift+Tab` untuk keluar dari mod *Plan*.

8. **Commit** (anda sendiri, di terminal):

   ```bash
   git add CLAUDE.md .gitignore .claude/settings.json
   git commit -m "CHORE: CLAUDE.md projek ikut standard kursus"
   ```

### ✅ Checkpoint
- [ ] `claude --version` mencetak versi, `/status` menunjukkan akaun anda dan `/permissions` menunjukkan 4 peraturan *Deny* (Kuiz S9).
- [ ] `CLAUDE.md` mengandungi bahagian *Peranan*, *Stack*, *Arahan*, *Konvensyen folder & kod* dan *Peraturan*, kurang 200 baris, tanpa sebarang rahsia (Kuiz S9).
- [ ] `CLAUDE.local.md` wujud, disenaraikan dalam `.gitignore`, dan kelihatan dalam `/memory` (Kuiz S9).
- [ ] Soalan `.env` langkah 6 ditolak tanpa nilai didedahkan, dan jawapan mod *Plan* langkah 7 tidak mengubah sebarang fail (Kuiz S9).
- [ ] Commit `CHORE: CLAUDE.md projek ikut standard kursus` ada dalam `git log` branch `chore/claude-code` (Kuiz S9).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `claude: command not found` | Terminal dibuka sebelum pemasangan | Tutup semua tetingkap VS Code dan buka semula; [tutorial §2](../docs/tutorial-claude-code.md#2-pasang) |
| `/init` menulis `CLAUDE.md` dalam English yang panjang | Tingkah laku lalai | Gantikan dengan templat langkah 4; templat ialah standard kursus |
| `CLAUDE.local.md` tidak muncul dalam `/memory` | Fail dicipta selepas sesi bermula | `/exit`, kemudian `claude` semula |
| `CLAUDE.local.md` muncul dalam `git status` | `.gitignore` tidak dikemas kini atau baris tersalah eja | Semak `cat .gitignore`; nama fail tepat `CLAUDE.local.md` |
| `Shift+Tab` tidak menukar mod | Terminal Windows tanpa mod input VT | `Alt+M` |
| Claude membaca `.env` | `.claude/settings.json` tiada atau JSON tidak sah | `claude doctor`; betulkan fail [tutorial §5](../docs/tutorial-claude-code.md#5-tetapan-projek-sekat-env) |

### ⭐ Cabaran tambahan
- Tambah satu peraturan bersyarat laluan: cipta `.claude/rules/views.md` dengan frontmatter `paths: ["app/Views/**"]` yang mengingatkan `esc()` dan `csrf_field()`. Semak dengan `/context` bahawa ia hanya dimuatkan selepas Claude membaca fail view.

---

## Lab 7.9 — Prompting: Projek Sedia Ada, Projek Baharu & PRD (S12)

> 🛡️ **Data sintetik sahaja.** Idea latihan ialah rekaan; jangan guna nama, aduan atau sistem KKM sebenar. PRD latihan disimpan dalam folder latihan berasingan `~/latihan/prd-latihan/`, **bukan** dalam `kelas-ci-<nama>`, dan ia **bukan** perubahan kepada SPEC kursus.

### 🎯 Objektif
Menulis tiga prompt onboarding dalam mod *Plan* pada projek `kelas-ci-<nama>` dan merekod jawapan yang telah disahkan, mendraf PRD kecil untuk idea latihan melalui temu bual dengan Claude, meminta pelan *vertical slice* tanpa kod, dan menyemak PRD secara kritis serta membetulkan 2 isu sendiri. Rujukan: [`tutorial-prompt-projek.md`](../docs/tutorial-prompt-projek.md) · prompt [AI-15..AI-18](../docs/pustaka-prompt.md#f--projek--prd).

### Prasyarat
- Lab 7.6 siap: `CLAUDE.md` projek di-commit dan anda tahu menukar ke mod *Plan* (`Shift+Tab` atau `Alt+M`).
- 🪟 **Windows:** terminal Git Bash dalam VS Code. Blok arahan yang ada dua tab: pilih **PowerShell** jika terminal anda PowerShell.

### Langkah

1. **Onboarding projek sedia ada (8 minit).** Dalam `kelas-ci-<nama>`, mulakan `claude`, tukar ke **plan mode**, dan hantar tiga prompt ini satu demi satu ([AI-15](../docs/pustaka-prompt.md#ai-15--onboarding-projek-sedia-ada)):

   ```text
   Terangkan struktur projek ini dalam 10 baris: folder utama dalam app/, peranan setiap satu, dan di mana ujian berada. Jangan ubah fail.
   ```

   ```text
   Di mana logik kelulusan tempahan TLK berada? Senaraikan fail dan nama kaedah, dari route hingga status_logs.
   ```

   ```text
   Jejak satu request: POST /tlk/tempahan dari route, filter, controller, service, model hingga redirect. Tunjukkan nama fail pada setiap langkah.
   ```

   Untuk setiap jawapan, buka **satu** fail yang disebut dan sahkan dakwaan itu sendiri. Rekod dalam fail baharu `docs/nota-claude.md` (anda yang menaip, bukan Claude):

   `docs/nota-claude.md`

   ```markdown
   # Nota onboarding Claude Code — kelas-ci-<nama>

   | # | Prompt | Ringkasan jawapan (3 baris) | Disahkan dalam fail | Betul? |
   |---|--------|-----------------------------|---------------------|--------|
   | 1 | Struktur projek | ... | app/... | Ya / Separa / Tidak |
   | 2 | Logik kelulusan TLK | ... | app/Services/BookingService.php | ... |
   | 3 | Aliran POST /tlk/tempahan | ... | app/Config/Routes.php | ... |
   ```

   Tekan `Shift+Tab` untuk keluar dari mod *Plan*, kemudian taip `/exit`.

2. **Folder latihan projek baharu.** PRD latihan **tidak** masuk ke `kelas-ci-<nama>`:

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p ~/latihan/prd-latihan/docs
   cd ~/latihan/prd-latihan
   git init
   claude
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force $HOME\latihan\prd-latihan\docs
   cd $HOME\latihan\prd-latihan
   git init
   claude
   ```

3. **Temu bual PRD (10 minit).** Kekal dalam mod lalai (**bukan** *accept edits*) supaya Claude meminta kebenaran sebelum menulis fail. Hantar ([AI-16](../docs/pustaka-prompt.md#ai-16--temu-bual-prd)):

   ```text
   Saya mahu membina aplikasi web kecil: Aduan Kerosakan Kemudahan. Kakitangan melapor kerosakan kemudahan pejabat (lif, penghawa dingin, lampu), dan juruteknik mengemas kini status aduan.
   Temu bual saya untuk mendraf PRD. Tanya SATU soalan pada satu masa, maksimum 8 soalan, meliputi: masalah, pengguna & peranan, dalam/luar skop, keperluan fungsian, peraturan perniagaan, keselamatan, data/entiti, kriteria penerimaan.
   Selepas temu bual, draf docs/prd.md dengan bahagian: Masalah, Pengguna & peranan, Skop, Keperluan fungsian (FR-01..), Peraturan perniagaan (BR-01..), NFR, Data/entiti, Kriteria penerimaan (AC-01.., format Diberi/Apabila/Maka), Milestone.
   Hadkan kepada 2 peranan dan 5 keperluan fungsian. Data sintetik sahaja. Jangan tulis kod.
   ```

   Jawab soalan Claude dengan ringkas. Jika tersekat, guna jawapan ini:

   | Topik | Jawapan latihan |
   |-------|-----------------|
   | Peranan | `pelapor` (kakitangan) dan `juruteknik` |
   | Keperluan | Hantar aduan · lihat aduan sendiri · senarai semua aduan (juruteknik) · tukar status · tambah catatan tindakan |
   | Status | `baru` → `dalam_tindakan` → `selesai` |
   | Luar skop | Notifikasi SMS, aplikasi mudah alih, inventori alat ganti |

   Apabila Claude meminta kebenaran menulis `docs/prd.md`, **baca draf dahulu**, kemudian luluskan. Semak: tepat 2 peranan, FR-01..FR-05, setiap FR ada sekurang-kurangnya satu AC.

4. **Pelan *vertical slice* tanpa kod (5 minit).** Tukar ke **plan mode** dan hantar ([AI-17](../docs/pustaka-prompt.md#ai-17--prd--pelan-vertical-slice)):

   ```text
   Mod Plan. Baca @docs/prd.md. Pecahkan kepada vertical slice (maksimum 4). Setiap slice: nama pendek, FR/BR/AC yang dipenuhi, fail CodeIgniter 4.7 yang terlibat, cara uji. Susun ikut kebergantungan. Tandakan FR yang tidak masuk mana-mana slice. Jangan tulis kod.
   ```

   Jika Claude menawarkan untuk melaksanakan pelan, pilih **No** / teruskan merancang. Taip sendiri nama slice di bahagian *Milestone* dalam `docs/prd.md` (cth `M1 — Slice 1: pelapor menghantar aduan (FR-01, AC-01)`). Semak `git status`: hanya `docs/prd.md` yang wujud, tiada fail PHP.

5. **Semak PRD secara kritis (5 minit).** Masih dalam **plan mode** ([AI-18](../docs/pustaka-prompt.md#ai-18--semak-prd)):

   ```text
   Mod Plan. Semak @docs/prd.md secara kritis sebagai penguji dan pemilik sistem. Jangan ubah fail. Senaraikan maksimum 6 isu dalam jadual (bahagian · isu · kenapa penting · cadangan pembetulan): peranan yang tiada, BR yang kabur, AC yang tidak boleh diuji, FR tanpa AC, skop yang melebar, data tanpa pemilik.
   ```

   Pilih **2** isu dan betulkan **sendiri** dalam VS Code (contoh: tukar "aduan diproses segera" kepada BR yang boleh diuji; tambah AC "pelapor B membuka aduan pelapor A → 404"). Tambah bahagian `## Log perubahan` di hujung PRD dengan dua baris: tarikh · perubahan · sebab.

6. **Commit (anda sendiri).**

   ```bash tab="Git Bash / macOS / Linux"
   git add docs/prd.md
   git commit -m "PRD: draf Aduan Kerosakan Kemudahan + 2 pembetulan semakan"
   cd ~/latihan/kelas-ci-<nama>
   git add docs/nota-claude.md
   git commit -m "CHORE: nota onboarding Claude Code"
   ```

   ```powershell tab="PowerShell"
   git add docs/prd.md
   git commit -m "PRD: draf Aduan Kerosakan Kemudahan + 2 pembetulan semakan"
   cd $HOME\latihan\kelas-ci-<nama>
   git add docs/nota-claude.md
   git commit -m "CHORE: nota onboarding Claude Code"
   ```

### ✅ Checkpoint
- [ ] `docs/nota-claude.md` dalam `kelas-ci-<nama>` merekod 3 prompt onboarding, setiap satu dengan fail yang anda buka sendiri untuk mengesahkan jawapan (Kuiz S12).
- [ ] `~/latihan/prd-latihan/docs/prd.md` mempunyai 2 peranan, FR-01..FR-05, sekurang-kurangnya satu BR dan satu AC bagi setiap FR (Kuiz S12).
- [ ] Bahagian *Milestone* menyenaraikan slice daripada pelan mod *Plan*, dan `git status` dalam `prd-latihan` tidak menunjukkan sebarang fail kod (Kuiz S12).
- [ ] Dua isu daripada semakan AI-18 dibetulkan oleh anda sendiri dan direkod dalam `## Log perubahan` (Kuiz S12).
- [ ] `git log --oneline` dalam `prd-latihan` menunjukkan commit `PRD: …`. 🪟 PowerShell: `git -C $HOME\latihan\prd-latihan log --oneline` (Kuiz S12).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Claude terus menulis PRD tanpa bertanya | Prompt tidak menyebut "SATU soalan pada satu masa" | `Esc`, kemudian hantar semula prompt AI-16 penuh |
| Claude menjana fail PHP atau `composer.json` | Mod *accept edits* aktif, atau anda meluluskan pelan | Tolak (`No`); padam fail itu; guna **plan mode** untuk langkah 4–5 |
| `docs/prd.md` ditulis dalam `kelas-ci-<nama>` | `claude` dimulakan dalam folder yang salah | Pindahkan fail ke `~/latihan/prd-latihan/docs/`; `git restore --staged` jika sudah di-`add` |
| PRD terlalu panjang (10+ FR) | Had tidak disebut | Minta: "Hadkan kepada 5 FR paling penting; pindahkan yang lain ke Luar skop" |
| Jawapan onboarding menyebut fail yang tiada | Claude meneka | Rekod "Tidak" dalam `docs/nota-claude.md`; ini bukti kenapa setiap dakwaan perlu disahkan |

### ⭐ Cabaran tambahan
- Minta Claude (mod *Plan*) membandingkan PRD latihan anda dengan bahagian M1 TLK dalam [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md): apakah yang ada dalam SPEC tetapi tiada dalam PRD (jadual, medan, enum, route)? Tulis 3 baris dalam `docs/nota-claude.md` tentang beza PRD dan SPEC.

---

## Lab 7.7 — Subagent & Skill untuk Projek CI4 (S10)

> 🛡️ Peraturan data yang sama seperti [Lab 7.6](#lab-76--claude-code-pasang-log-masuk--claudemd-projek-s9): sintetik sahaja, tiada `.env`, tiada sistem KKM.

### 🎯 Objektif
Mencipta subagent baca sahaja `semak-ci4` dan **menggunakannya** untuk menyemak keselamatan kod Hari 6 anda sendiri (`esc()`, CSRF, filter/permission, binding Query Builder, validasi), **merekod** dapatan dalam `docs/semakan-ci4-hari6.md`, kemudian mencipta skill `migration-ci4` dan **menunjukkan** skill itu dimuatkan apabila Claude mendraf migration.

### Prasyarat
- [Lab 7.6](#lab-76--claude-code-pasang-log-masuk--claudemd-projek-s9) selesai; anda dalam branch `chore/claude-code`.
- Kod TLK Hari 6 (`app/Controllers/Tlk/`, `app/Services/BookingService.php`, `app/Views/tlk/`) ada dalam projek.

### Langkah

1. **Cipta folder** (Git Bash):

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p .claude/agents .claude/skills/migration-ci4
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force .claude\agents, .claude\skills\migration-ci4
   ```

2. **Subagent `semak-ci4`.** Cipta fail ini dalam VS Code:

   `.claude/agents/semak-ci4.md`

   ```markdown
   ---
   name: semak-ci4
   description: Penyemak keselamatan CodeIgniter 4 (BACA SAHAJA). Guna selepas menulis atau mengubah controller, view, model, route atau filter, atau apabila diminta menyemak keselamatan kod CI4.
   tools: Read, Grep, Glob
   model: sonnet
   ---

   Anda penyemak keselamatan CodeIgniter 4.7 + Shield untuk projek latihan KKM.
   Anda TIDAK mengubah fail. Anda membaca, mencari dan melaporkan sahaja.
   Jangan baca .env, writable/uploads/, writable/session/ atau writable/logs/.

   Semak fail atau folder yang diberi untuk lima perkara ini:

   1. Output view: setiap pemboleh ubah dalam view dicetak melalui esc()
      (`<?= esc($x) ?>`, konteks `esc($x, 'attr')` / `'url'` / `'js'`).
      `<?= $x ?>` mentah untuk data pengguna = dapatan.
   2. CSRF: `csrf` dalam `Config\Filters::$globals['before']`; setiap borang POST guna
      `csrf_field()` atau `form_open()`; perubahan data hanya melalui POST, bukan GET.
   3. Filter & kebenaran: setiap route modul ada filter `session` / `permission:...` /
      `group:...` (rujuk app/Config/Routes.php dan `php spark routes` jika diberi output);
      Service menyemak pemilikan (`ownedBy()`, 404 kepada bukan pemilik).
   4. Query Builder: tiada input pengguna dicantum ke dalam SQL
      (`query("... $x")`, `where("col = $x")`, `orderBy($this->request->getGet(...))` tanpa senarai putih).
      Betul: `where('col', $x)`, `query($sql, [$x])`, `like()` di dalam `groupStart()`.
   5. Validasi & mass assignment: `$this->validate()` atau `$validationRules` Model;
      controller tidak menghantar `getPost()` penuh ke `insert()`/`update()`;
      `status`, `user_id`, `approved_by` ditetapkan oleh Service, bukan borang.

   Format jawapan (Bahasa Melayu, istilah teknikal English):
   - Jadual: | Fail:baris | Kategori (1–5) | Keterukan (Tinggi/Sederhana/Rendah) | Dapatan | Cadangan |
   - Hanya dapatan yang anda lihat dalam kod; petik baris sebenar. Jangan meneka.
   - Akhiri dengan "Tiada dapatan" bagi kategori yang bersih.
   ```

   Kembali ke Claude Code (keluar dari mod *Plan* tidak perlu). Folder `.claude/agents/` baru dicipta, jadi taip `/exit` dan `claude` semula sekali.

3. **Jalankan semakan pada kod Hari 6 anda.** Dalam mod *Plan*:

   ```text
   Guna subagent semak-ci4 untuk menyemak app/Controllers/Tlk, app/Views/tlk dan app/Config/Routes.php.
   ```

   Jangkaan: baris `semak-ci4` muncul (subagent berjalan), kemudian jadual dapatan. Semak **setiap** dapatan dengan membuka fail:baris itu sendiri. Rekod dalam fail baharu:

   `docs/semakan-ci4-hari6.md`

   ```markdown
   # Semakan keselamatan Hari 6 (subagent semak-ci4)

   | # | Fail:baris | Kategori | Dapatan AI | Disahkan? (Ya/Tidak — kenapa) | Tindakan |
   |---|------------|----------|------------|-------------------------------|----------|
   | 1 |            |          |            |                               |          |
   ```

   Sekurang-kurangnya 3 baris. Jika semakan bersih, tulis dapatan "Tiada dapatan" bagi setiap kategori dan **satu** ujian yang anda buat untuk mengesahkannya (cth buka borang dan semak `csrf_test_name` dalam *View Source*).

4. **Uji had tool.** Masih dalam sesi yang sama, minta:

   ```text
   Guna subagent semak-ci4 untuk membetulkan sendiri dapatan pertama dalam fail itu.
   ```

   Perhatikan jawapannya (soalan Kuiz S10). Pembetulan sebenar, jika ada, anda buat sendiri dalam branch Hari 6 selepas kursus hari ini — bukan sekarang.

5. **Skill `migration-ci4`.** Cipta:

   `.claude/skills/migration-ci4/SKILL.md`

   ```markdown
   ---
   name: migration-ci4
   description: Konvensyen migration & seeder kursus CI-KKM-10 (CodeIgniter 4, MySQL). Guna apabila menulis, mendraf atau menyemak migration, seeder, atau perubahan skema jadual.
   argument-hint: "[nama jadual]"
   ---

   Ikut konvensyen ini untuk migration dan seeder dalam projek ini. Jadual sasaran: $ARGUMENTS

   ## Migration
   - Jana rangka dengan `php spark make:migration CreateNamaJadual` (fail
     app/Database/Migrations/YYYY-MM-DD-HHMMSS_CreateNamaJadual.php). Satu jadual setiap fail.
   - `public function up(): void` dan `public function down(): void`; `down()` mengundur `up()` sepenuhnya.
   - `id`: `['type' => 'INT', 'unsigned' => true, 'auto_increment' => true]` + `addKey('id', true)`.
   - Kunci asing: jenis SAMA dengan medan induk (INT unsigned);
     `addForeignKey('medan', 'induk', 'id', 'CASCADE', 'RESTRICT')`, atau `'SET NULL'` jika medan boleh NULL.
   - Status/jenis: VARCHAR(20) yang memegang nilai enum PHP (app/Enums/), BUKAN ENUM MySQL.
   - `created_at`, `updated_at`, `deleted_at`: DATETIME null (soft delete jika SPEC menyatakan).
   - `createTable('nama', true)` dan `dropTable('nama', true)` (IF [NOT] EXISTS).
   - Susunan fail ikut dependency ERD: induk sebelum anak.
   - Jangan ubah migration yang sudah dijalankan: tulis migration baharu (cth AddXToY).
   - Tambah medan pada `users` Shield melalui migration berasingan; jangan sunting vendor/.
   - Nama jadual & medan TEPAT seperti SPEC; jika jadual tiada dalam SPEC, tandakan sebagai "latihan".

   ## Seeder
   - app/Database/Seeds/; DatabaseSeeder memanggil seeder lain ikut susunan induk → anak.
   - Data sintetik sahaja: e-mel @latihan.test, plat rekaan seperti WXX 1234, nama rekaan.

   ## Cara bekerja
   - Draf kod dan terangkan setiap medan, indeks dan FK dalam Bahasa Melayu.
   - JANGAN jalankan `php spark migrate`, `migrate:rollback`, `migrate:refresh` atau `db:seed`.
     Cetak arahan itu untuk peserta jalankan sendiri.
   ```

   Skill baharu dikesan tanpa mula semula. Jika `/migration-ci4` tidak muncul apabila anda menaip `/mig`, taip `/reload-skills`.

6. **Lihat skill dimuatkan.** Dalam mod *Plan*, minta draf untuk jadual **latihan** (bukan SPEC; jangan simpan atau commit):

   ```text
   Draf migration untuk jadual latihan pass_comments: application_id (FK ke pass_applications), user_id (FK ke users), body (TEXT), created_at. Jangan tulis fail.
   ```

   Jangkaan: Claude Code memaparkan bahawa skill `migration-ci4` dimuatkan, dan draf mempunyai `INT unsigned` pada kedua-dua FK, `addForeignKey(...)`, `createTable('pass_comments', true)`, `down()` dengan `dropTable(..., true)`, serta arahan `php spark migrate` **dicetak**, bukan dijalankan. Kemudian cuba bentuk slash command:

   ```text
   /migration-ci4 vehicle_notes
   ```

   Catat dalam `docs/semakan-ci4-hari6.md` (bahagian baharu *Skill*) dua peraturan skill yang anda nampak dipatuhi dalam draf.

7. **Commit** agent, skill dan laporan:

   ```bash
   git add .claude/agents/semak-ci4.md .claude/skills/migration-ci4/SKILL.md docs/semakan-ci4-hari6.md
   git commit -m "CHORE: subagent semak-ci4, skill migration-ci4 & semakan Hari 6"
   ```

### ✅ Checkpoint
- [ ] `.claude/agents/semak-ci4.md` mempunyai frontmatter `name`, `description`, `tools: Read, Grep, Glob` dan `model`, dan subagent itu berjalan pada `app/Controllers/Tlk` (Kuiz S10).
- [ ] `docs/semakan-ci4-hari6.md` mengandungi ≥ 3 baris dapatan dengan lajur *Disahkan?* diisi oleh anda (Kuiz S10).
- [ ] Permintaan "betulkan sendiri" langkah 4 **tidak** mengubah sebarang fail (Kuiz S10).
- [ ] Draf `pass_comments` mengikut skill `migration-ci4` (FK `INT unsigned`, `createTable(..., true)`, arahan `migrate` dicetak sahaja) dan tiada fail migration baharu dalam `git status` (Kuiz S10).
- [ ] Commit `CHORE: subagent semak-ci4, skill migration-ci4 & semakan Hari 6` ada dalam `git log` (Kuiz S10).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Claude menyemak sendiri, `semak-ci4` tidak berjalan | Folder `.claude/agents/` dicipta dalam sesi semasa | `/exit` dan `claude` semula; atau taip `@agent-semak-ci4` |
| Subagent diabaikan secara senyap | Frontmatter salah (tiada `---` pembuka, `name` tiada, salah eja medan) | Baris pertama fail mesti `---`; medan yang tidak dikenali diabaikan tanpa ralat |
| `/migration-ci4` tidak muncul | Folder `skills/` baru; atau nama fail bukan `SKILL.md` | `/reload-skills`; nama tepat `SKILL.md` (huruf besar) dalam `.claude/skills/migration-ci4/` |
| Draf tidak ikut skill | `description` tidak sepadan dengan permintaan | Sebut "migration" dalam permintaan, atau guna `/migration-ci4` terus |
| Claude cuba menulis fail migration | Mod *Plan* tidak aktif | Tolak (`No`); `Shift+Tab` / `Alt+M` ke **plan mode** |
| Notepad menyimpan `SKILL.md.txt` | Sambungan tersembunyi Windows | Cipta fail dalam VS Code, bukan Notepad |

### ⭐ Cabaran tambahan
- Cipta subagent kedua `semak-ujian` (`tools: Read, Grep, Glob, Bash`) yang hanya boleh menjalankan `composer test`. Tulis dalam arahannya bahawa ia mesti melaporkan bilangan ujian lulus/gagal dan tidak mengubah fail. Bincang dengan jurulatih: kenapa `Bash` menjadikan subagent ini lebih berisiko daripada `semak-ci4`?

---

## Lab 7.8 — MCP: ci4-spark, MySQL, Context7 & GitLab (S11)

> 🛡️ Peraturan data yang sama seperti [Lab 7.6](#lab-76--claude-code-pasang-log-masuk--claudemd-projek-s9). **Jangan sekali-kali halakan server MCP kepada database KKM/eSPKP.** Hanya DB latihan `kkm_latihan` dalam Laragon anda.

### 🎯 Objektif
Memasang server MCP `ci4-spark` (PHP, baca sahaja) daripada templat kursus, **mengujinya** dengan mesej JSON-RPC tulisan tangan, mendaftarkannya untuk projek dengan `.mcp.json`, menggunakan tool `routes`/`filter_check` melalui Claude Code, dan menambah Context7 untuk dokumentasi CodeIgniter 4/Shield semasa. MySQL (baca sahaja) dan GitLab ialah bahagian pilihan/demo.

| Bahagian | Status | Masa |
|----------|--------|------|
| A. `ci4-spark` | Wajib | 15 min |
| B. Context7 | Wajib | 5 min |
| C. MySQL baca sahaja | Jika masa (atau kerja rumah) | 10 min |
| D. GitLab GitLab KKM | Demo jurulatih; cuba jika GitLab KKM menyokong & rangkaian membenarkan | 5 min |

### Prasyarat
- [Lab 7.7](#lab-77--subagent--skill-untuk-projek-ci4-s10) selesai; branch `chore/claude-code`.
- `php` dalam `PATH`: `php -v` berfungsi dalam Git Bash **dan** PowerShell (Laragon: *Menu → Tools → Path → Add Laragon to Path*).
- Templat [`templates/kod/ci4-spark-mcp.php.txt`](../templates/kod/ci4-spark-mcp.php.txt) (modul **Templat & Rujukan** di pelatih.my).

### Langkah

**A. Server `ci4-spark` (wajib)**

1. **Salin templat** ke `tools/ci4-spark-mcp.php` dalam akar projek (VS Code: fail baharu → tampal isi templat). Semak sintaks:

   ```bash
   php -l tools/ci4-spark-mcp.php
   ```

   Jangkaan: `No syntax errors detected in tools/ci4-spark-mcp.php`. Baca fail itu 3 minit: cari `tools()` (4 tool), `callTool()` (regex semakan input) dan `spark()` (`proc_open()` dengan array, tanpa shell).

2. **Fail ujian JSON-RPC.** Cipta `tools/ujian-mcp.jsonl` — **satu mesej JSON setiap baris**, tepat seperti di bawah:

   `tools/ujian-mcp.jsonl`

   ```json
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"ujian","version":"0"}}}
   {"jsonrpc":"2.0","method":"notifications/initialized"}
   {"jsonrpc":"2.0","id":2,"method":"tools/list"}
   {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"filter_check","arguments":{"method":"GET","path":"/tlk/tempahan"}}}
   {"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"db_table","arguments":{"table":"users; DROP TABLE users"}}}
   {"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"migrate","arguments":{}}}
   ```

3. **Jalankan server dengan fail itu sebagai stdin:**

   ```bash tab="Git Bash / macOS / Linux"
   php tools/ci4-spark-mcp.php < tools/ujian-mcp.jsonl
   ```

   ```powershell tab="PowerShell"
   Get-Content tools\ujian-mcp.jsonl | php tools\ci4-spark-mcp.php
   ```

4. **Baca setiap balasan** (satu baris JSON setiap `id`; baris `[ci4-spark] started…` ialah stderr):

   | `id` | Jangkaan |
   |------|----------|
   | 1 | `"protocolVersion":"2025-06-18"`, `"serverInfo":{"name":"ci4-spark",…}` |
   | — | Tiada balasan untuk `notifications/initialized` (notifikasi) |
   | 2 | 4 tool: `routes`, `migrate_status`, `db_table`, `filter_check`, setiap satu `"readOnlyHint":true` |
   | 3 | `"isError":false`, teks bermula `$ php spark filter:check GET /tlk/tempahan`, dengan filter `session` dalam lajur *Before Filters* |
   | 4 | Catat balasan tepat (soalan Kuiz S11) |
   | 5 | `"error":{"code":-32602,"message":"Unknown tool: migrate"}` |

5. **Daftar untuk projek (`.mcp.json`).** Dalam Git Bash (bukan dalam sesi `claude`):

   ```bash
   claude mcp add --scope project ci4-spark -- php tools/ci4-spark-mcp.php
   cat .mcp.json
   ```

   Jangkaan `.mcp.json` (sama seperti menulisnya dengan tangan):

   ```json
   {
     "mcpServers": {
       "ci4-spark": {
         "type": "stdio",
         "command": "php",
         "args": [
           "tools/ci4-spark-mcp.php"
         ],
         "env": {}
       }
     }
   }
   ```

   🪟 PowerShell: jika `--` hilang dan `claude mcp add` melaporkan pilihan tidak dikenali, jalankan arahan dalam Git Bash, atau tulis `.mcp.json` di atas dengan tangan.

6. **Luluskan dan guna.** Mulakan `claude`. Claude Code bertanya sama ada mahu menggunakan server dari `.mcp.json`: pilih untuk membenarkan `ci4-spark`. Taip `/mcp`: `ci4-spark` berstatus *connected* dengan 4 tool. Kemudian:

   ```text
   Guna tool ci4-spark: senaraikan route modul TLK dan filter bagi GET /tlk/tempahan. Adakah setiap route TLK dilindungi filter session?
   ```

   Luluskan setiap panggilan tool MCP (`ci4-spark - routes`, `ci4-spark - filter_check`). Bandingkan jawapan dengan `php spark routes` yang anda jalankan sendiri.

**B. Context7 (wajib)**

7. **Tambah Context7** (server HTTP jauh; tiada Node diperlukan). Di terminal:

   ```bash
   claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
   claude mcp list
   ```

   Jangkaan: `context7: https://mcp.context7.com/mcp (HTTP) - ✔ Connected`. Kunci API pilihan (had kadar lebih tinggi): tambah `--header "Authorization: Bearer <kunci>"` — jangan commit kunci.

8. **Tanya dokumentasi semasa** dalam `claude`:

   ```text
   Guna context7: dalam CodeIgniter Shield, bagaimana $matrix dalam Config\AuthGroups memberi permission kepada group, dan bagaimana filter permission: digunakan pada route?
   ```

   Jangkaan: panggilan `resolve-library-id` kemudian `query-docs`. Bandingkan dengan `app/Config/AuthGroups.php` anda (Hari 4).

**C. MySQL baca sahaja (jika masa)**

9. **Node 20+.** Laragon Full membawa Node.js:

   ```bash
   node -v      # mesti v20 atau lebih baharu
   ```

   Lebih lama atau tiada? Pasang Node.js LTS dari <https://nodejs.org>, kemudian tutup dan buka semula VS Code.

10. **Pengguna MySQL `SELECT` sahaja.** Laragon → *Database* (HeidiSQL) → tab *Query*, sebagai `root`:

    ```sql
    CREATE USER 'claude_ro'@'127.0.0.1' IDENTIFIED BY 'BacaSahaja-2026';
    GRANT SELECT, SHOW VIEW ON kkm_latihan.* TO 'claude_ro'@'127.0.0.1';
    ```

    Dua lapisan: server MCP menutup `INSERT`/`UPDATE`/`DELETE` secara lalai, **dan** pengguna ini tidak boleh menulis walaupun server tersilap konfigurasi.

11. **Daftar dengan skop `local`** (kelayakan kekal dalam `~/.claude.json` anda, bukan dalam repo). Satu baris, dalam Git Bash:

    ```bash
    claude mcp add mysql-kelas -e MYSQL_HOST=127.0.0.1 -e MYSQL_PORT=3306 -e MYSQL_USER=claude_ro -e MYSQL_PASS=BacaSahaja-2026 -e MYSQL_DB=kkm_latihan -- npx -y @benborla29/mcp-server-mysql
    ```

    Dalam `claude`, `/mcp` → `mysql-kelas` *connected*. Tanya:

    ```text
    Guna mysql-kelas: berapa baris dalam slot_bookings ikut status? Kemudian cuba INSERT satu baris ujian ke departments.
    ```

    Jangkaan: kiraan `GROUP BY status` berjaya; `INSERT` ditolak (oleh server atau oleh MySQL: `INSERT command denied to user 'claude_ro'`).

    > ℹ️ Mahu berkongsi konfigurasi dalam `.mcp.json`? Tulis `"MYSQL_PASS": "${MYSQL_PASS}"` dalam blok `env` dan tetapkan *environment variable* `MYSQL_PASS` dalam laptop setiap peserta sebelum `claude` dimulakan. Jangan sekali-kali tulis kata laluan sebenar dalam `.mcp.json`.

**D. GitLab GitLab KKM (demo jurulatih)**

12. **Pilihan rasmi: server MCP terbina GitLab.** Tersedia dalam GitLab 18.6+ (beta), semua tier sejak 19.2, GA dalam 19.5; pentadbir instance mesti membenarkan akses MCP. Jika GitLab KKM memenuhi syarat:

    ```bash
    claude mcp add --scope user --transport http gitlab-kkm https://<gitlab-kkm>/api/v4/mcp
    ```

    Dalam `claude`, `/mcp` → `gitlab-kkm` → *Authenticate* → log masuk GitLab KKM dalam pelayar (OAuth). Tanya: *"Senaraikan MR terbuka dalam projek kelas-ci-<nama> saya."*

13. **Jika server terbina tidak tersedia:** jurulatih mendemo pelayan komuniti `@zereight/mcp-gitlab` dengan *Personal Access Token* baca sahaja (skop `read_api`; skop minimum belum disahkan untuk setiap tool) dan `GITLAB_PERMISSION_MODE=readonly`, token dalam *environment variable*, bukan dalam fail repo. Rangkaian menyekat? Tonton demo dan catat 2 kegunaan untuk projek anda.

14. **Commit** server dan konfigurasi projek (tanpa rahsia):

    ```bash
    git add tools/ci4-spark-mcp.php tools/ujian-mcp.jsonl .mcp.json
    git status --short          # tiada .env, tiada ~/.claude.json
    git commit -m "CHORE: server MCP ci4-spark (baca sahaja) + .mcp.json"
    git push -u origin chore/claude-code
    ```

    Buka MR `chore/claude-code` → `main` di GitLab KKM dan merge sendiri ([trek GitLab](../docs/trek-gitlab.md)) **sebelum Lab 7.0 petang**, supaya `CLAUDE.md`, subagent, skill dan `.mcp.json` ada dalam branch `feat/pas-permohonan`.

### ✅ Checkpoint
- [ ] `php -l tools/ci4-spark-mcp.php` tiada ralat dan fail ujian langkah 3 memulangkan 5 balasan (`id` 1–5) seperti jadual langkah 4 (Kuiz S11).
- [ ] Balasan `id` 4 (`db_table` dengan `users; DROP TABLE users`) dicatat, dan jadual `users` masih wujud (Kuiz S11).
- [ ] `.mcp.json` mendaftarkan `ci4-spark` tanpa sebarang rahsia, dan `/mcp` menunjukkan `ci4-spark` *connected* dengan 4 tool (Kuiz S11).
- [ ] Claude Code menjawab soalan route TLK langkah 6 melalui tool `ci4-spark`, dan `claude mcp list` menunjukkan `context7` *Connected* (Kuiz S11).
- [ ] Commit `CHORE: server MCP ci4-spark (baca sahaja) + .mcp.json` di-push ke `chore/claude-code` (Kuiz S11).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `/mcp`: `ci4-spark` *failed* | `php` tiada dalam `PATH` proses Claude Code | `where php` (PowerShell) / `which php` (Git Bash); tambah Laragon ke Path, atau tulis laluan penuh dalam `.mcp.json`: `"command": "C:/laragon/bin/php/php-8.3.x/php.exe"` |
| `File 'spark' not found` | `claude` dimulakan dalam subfolder | Mulakan `claude` dalam akar projek, atau tetapkan `"env": {"CI4_PROJECT_ROOT": "C:/Users/<anda>/latihan/kelas-ci-<nama>"}` |
| Ujian langkah 3: `Parse error` | Satu mesej JSON dipecah kepada beberapa baris, atau VS Code menambah BOM | Setiap mesej mesti satu baris; simpan fail sebagai *UTF-8* (bukan *UTF-8 with BOM*) |
| `ci4-spark` berstatus *Pending approval* | Server `.mcp.json` belum diluluskan | Mulakan `claude` secara interaktif dan benarkan; set semula pilihan: `claude mcp reset-project-choices` |
| `filter_check` tamat masa 30 s | Route memerlukan input interaktif atau DB tidak bersambung | Jalankan `php spark filter:check GET /…` sendiri untuk melihat ralat; semak Laragon MySQL hidup |
| `mysql-kelas`: *Connection closed* (Windows) | `npx` gagal dijalankan terus | Semak `node -v`; cuba `-- cmd /c npx -y @benborla29/mcp-server-mysql` |
| `Access denied for user 'claude_ro'` | Host pengguna `localhost` vs `127.0.0.1` | Cipta pengguna dengan `'claude_ro'@'127.0.0.1'` dan `MYSQL_HOST=127.0.0.1` |
| Context7 tergantung | Proxy/firewall pejabat | Minta IT membenarkan `mcp.context7.com` (HTTPS 443); [tutorial §7](../docs/tutorial-claude-code.md#7-rangkaian-kkm-proxy--domain) |

### ⭐ Cabaran tambahan
- Tambah tool kelima `routes_filter` pada `ci4-spark` yang memulangkan hanya baris `php spark routes` yang mengandungi rentetan tertentu (cth `pas`). Semak input dengan regex `^[a-z0-9/_-]+$`, tapis output dalam PHP (bukan melalui shell), tambah baris ujian ke `tools/ujian-mcp.jsonl`, dan buktikan `tools/list` kini memulangkan 5 tool.

---

## Lab 7.10 — Claude Code: Pas Slice 1 — Migration/Enum/Model, Senarai Skop Pemilik & Butiran (S13)

> 🛡️ **Peraturan Lab 7.10–7.11.** Claude menulis kod, anda meluluskan setiap diff dalam mod **Manual** (lalai). Mod *accept edits*, *auto* dan *bypass permissions* **tidak dibenarkan**. Data sintetik sahaja; jangan beri isi `.env` kepada Claude. Aliran tujuh pintu: [`kolaborasi.md`](../docs/kolaborasi.md) §3 · prompt [AI-19, AI-20](../docs/pustaka-prompt.md#g--laksana-dengan-pintu-semakan).
>
> ℹ️ **Pagi Hari 8 (09:00–10:30).** Jika Lab 7.13 siap, merge branch `docs/keperluan-pas` ke `main` sebelum langkah 1, supaya `docs/keperluan-pas.md` dan `docs/pelan-pas.md` ada. Pada langkah 3, tambah `@docs/keperluan-pas.md` pada prompt, dan perincikan bahagian **Slice 1** dalam `docs/pelan-pas.md` sedia ada, bukan cipta fail baharu.

### 🎯 Objektif
Menggunakan aliran kerja Claude Code tujuh pintu untuk membina slice pertama Modul Pas: enum `PassType`/`PassStatus`, Entity `PassApplication`, `PassApplicationModel` (dengan skop `ownedBy()`) dan `PassDocumentModel`, route `index`/`show`, `PassWorkflowService::canView()`, senarai "Permohonan Saya" dan butiran yang memulangkan **404** kepada bukan pemilik (BR-PAS-01, BR-PAS-04). Anda **membaca dan meluluskan** setiap diff, **mengesahkan** dengan `composer test` dan `ci4-spark`, dan **menerangkan** 3 baris utama dengan ayat sendiri.

### Prasyarat
- Lab 7.6–7.8 siap dan MR `chore/claude-code` sudah di-merge ke `main`: `CLAUDE.md`, subagent `semak-ci4`, skill `migration-ci4`, `.mcp.json` (`ci4-spark`) dan `docs/nota-claude.md` ada dalam `main`.
- Branch baharu `feat/pas-claude` dari `main` (langkah 1). Lab Pas manual 7.0–7.4 **tidak** perlu dibuat; ia kod rujukan untuk langkah 8.
- Jadual `pass_applications` dan `pass_documents` sudah wujud sejak Hari 4. Akaun `pemohon1` dan `pemohon2` ada dalam seeder.
- 🪟 **Windows:** Laragon hidup (Apache + MySQL), terminal Git Bash dalam VS Code. Jika `Shift+Tab` tidak menukar mod, guna `Alt+M`.

### Langkah

1. **Branch dari `main` selepas merge pagi.**

   ```bash tab="Git Bash / macOS / Linux"
   git switch main && git pull
   git switch -c feat/pas-claude
   git log --oneline -3        # commit CHORE Lab 7.6–7.8 kelihatan
   ```

   ```powershell tab="PowerShell"
   git switch main
   git pull
   git switch -c feat/pas-claude
   git log --oneline -3        # commit CHORE Lab 7.6–7.8 kelihatan
   ```

2. **Pintu 1 — SPEC → `CLAUDE.md` (10 minit).** SPEC kursus ada di pelatih.my, bukan dalam repo anda. Cipta `docs/spec-pas.md` dan **taip/salin** petikan SPEC Pas ini (dari [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §2.2, §3, §4, §5, §6, §9):

   `docs/spec-pas.md`

   ```markdown
   # SPEC Modul Pas (petikan spesifikasi-sistem.md)

   ## §2.2 Enum & peraturan
   - PassType (pass_applications.pass_type): kenderaan · kakitangan · kontraktor
   - PassStatus (pass_applications.status): submitted → under_review → approved → expired; under_review → rejected
   - Label BM: Dihantar · Dalam Semakan · Diluluskan · Ditolak · Tamat Tempoh
   - BR-PAS-01 Peralihan status hanya ikut jadual di atas — PassStatus::canTransitionTo().
   - BR-PAS-02 Muat naik: pdf, jpg, png sahaja; maks 2 MB setiap fail; maks 3 fail; simpan di writable/uploads/pas/ dengan $file->getRandomName(); hanya path dalam DB.
   - BR-PAS-03 Penolakan mesti ada remarks (min 10 aksara).
   - BR-PAS-04 Pemohon hanya lihat permohonan sendiri; reviewer/approver/admin lihat semua.
   - BR-PAS-05 Setiap peralihan status direkod dalam status_logs.
   - BR-PAS-06 vehicle_id wajib hanya bila pass_type = kenderaan; valid_until >= valid_from.

   ## §3 Jadual (sudah wujud sejak Hari 4)
   - pass_applications: ref_no VARCHAR(20) UNIQUE, user_id FK, pass_type VARCHAR(20), vehicle_id FK NULL, purpose TEXT, valid_from DATE, valid_until DATE, status VARCHAR(20) DEFAULT submitted, reviewed_by FK NULL, reviewed_at DATETIME NULL, approved_by FK NULL, approved_at DATETIME NULL
   - pass_documents: application_id FK, doc_type VARCHAR(30) ('sokongan'), original_name VARCHAR(255), stored_path VARCHAR(255), mime VARCHAR(80), size_bytes INT UNSIGNED
   - status_logs: module ('PAS'), record_id, from_status NULL, to_status, actor_id, remarks NULL, created_at

   ## §4–§6, §9 Kelas, route & kebenaran
   - Kelas: Enums/PassType, Enums/PassStatus, Entities/PassApplication, Models/PassApplicationModel, Models/PassDocumentModel, Services/PassWorkflowService (service('passWorkflowService')), Controllers/Pas/ApplicationController
   - Route: /pas/permohonan (index, new, create, show, dokumen/{id}) — filter session; new/create turut permission:pas.apply
   - Kebenaran: applicant = pas.apply; reviewer = pas.review; approver = pas.approve; admin = pas.*
   - Ralat input borang Pas → \InvalidArgumentException; ref_no PAS-{YYYY}-{0000} melalui ReferenceNumberService::next('PAS')
   ```

   Kemudian, dalam `CLAUDE.md`, **gantikan** bahagian `## Peranan anda (Claude)` dengan blok di bawah dan tambah bahagian `## Modul Pas` di hujung fail:

   `CLAUDE.md`

   ```markdown
   ## Peranan anda (Claude)
   - Mulai Hari 7 petang: anda boleh menulis kod pelaksanaan, SATU slice pada satu masa, daripada pelan yang saya luluskan.
   - Saya membaca setiap diff dalam mod Manual. Selepas setiap fail, berhenti dan terangkan perubahan dalam 3 baris.
   - Jangan ubah fail di luar senarai pelan. Jangan jalankan migrate, db:seed atau migrate:refresh tanpa saya minta.
   - Jawab dalam Bahasa Melayu; istilah teknikal dalam English (route, filter, controller, view).

   ## Modul Pas
   - SPEC: @docs/spec-pas.md (BR-PAS-01..06). Nama jadual/medan/enum/kelas tepat seperti SPEC.
   - Skop pemilik dalam Model (ownedBy()), bukan dalam view atau controller.
   - Bukan pemilik → 404 (bukan 403) supaya kewujudan rekod tidak bocor.
   - Fail muat naik: writable/uploads/pas/, nama getRandomName(), muat turun melalui controller sahaja.
   ```

   Semak: `/memory` dalam Claude Code menyenaraikan `CLAUDE.md` projek. Commit kedua-dua fail ini bersama slice pada langkah 9.

3. **Pintu 2 — Pelan dalam mod *Plan* (10 minit).** Mulakan `claude` dalam akar projek, tukar ke **plan mode** (`Shift+Tab` atau `Alt+M`) dan hantar:

   ```text
   Mod Plan. Baca @CLAUDE.md dan @docs/spec-pas.md. Rancang Slice 1 Modul Pas sahaja: enum PassType dan PassStatus, Entity PassApplication, PassApplicationModel dengan skop ownedBy(), PassDocumentModel, route GET pas/permohonan dan GET pas/permohonan/(:num), PassWorkflowService::canView() didaftar sebagai service('passWorkflowService'), ApplicationController index() dan show(), view pas/index dan pas/show.
   Untuk setiap fail: laluan penuh, cipta atau ubah, dan BR-PAS yang dipenuhi. Sahkan dengan ci4-spark migrate_status bahawa jadual Hari 4 sudah wujud; jika ya, JANGAN rancang migration baharu.
   Ujian: tests/unit/Enums/PassStatusTest.php (BR-PAS-01) dan tests/feature/Pas/PassAccessTest.php (pemilik 200, pemohon lain 404 — BR-PAS-04), ikut corak ujian Hari 6.
   Akhiri dengan jadual BR → fail → ujian. Jangan tulis kod.
   ```

   **Pelan yang baik mengandungi:**
   - tiada migration baharu (jadual Hari 4 sudah ada) atau, jika `migrate_status` menunjukkan jadual tiada, satu migration ikut skill `migration-ci4`;
   - skop `ownedBy(int $userId)` dalam `PassApplicationModel`, dipanggil oleh `index()`;
   - `show()` mencari rekod, kemudian `canView()` dalam service; bukan pemilik tanpa `pas.review`/`pas.approve`/`admin` → `PageNotFoundException` (404);
   - status sebagai enum `PassStatus` (tiada rentetan `'submitted'` bertaburan dalam controller/view);
   - `esc()` pada setiap output dalam `pas/index` dan `pas/show`;
   - route dalam kumpulan `pas/permohonan` dengan filter `session`;
   - jadual BR → fail → ujian yang meliputi BR-PAS-01 dan BR-PAS-04.

   **Edit pelan sendiri.** Salin pelan ke `docs/pelan-pas.md` (anda yang menaip/menampal), buang apa-apa di luar Slice 1 (cth borang, muat naik, kelulusan), dan tambah baris yang tiada. Jika Claude menawarkan pilihan selepas pelan, pilih **No, keep planning**.

4. **Pintu 3 — Laksana dalam mod *Manual* (25 minit).** Keluar dari mod *Plan* (`Shift+Tab` hingga baris bawah tidak menunjukkan *plan mode* atau *accept edits*). Hantar ([AI-19](../docs/pustaka-prompt.md#ai-19--laksana-satu-slice-daripada-pelan-mod-manual)):

   ```text
   Laksana HANYA Slice 1 daripada pelan dalam @docs/pelan-pas.md, satu fail pada satu masa.
   Rujuk @docs/spec-pas.md (§2.2 BR-PAS-01, BR-PAS-04). Nama jadual, medan, enum dan kelas tepat seperti SPEC.
   Kekangan: jangan ubah fail di luar senarai pelan; jangan jalankan migrate atau db:seed; tiada fail dalam public/; setiap output view melalui esc().
   Selepas setiap fail, berhenti dan terangkan dalam 3 baris apa yang berubah dan BR mana dipenuhi, sebelum fail seterusnya.
   Akhir sekali, tulis ujian dalam pelan dan jalankan composer test.
   ```

   Untuk **setiap** permintaan *Do you want to make this edit…?*, baca diff dahulu. Pilih **Yes** (sekali sahaja) jika diff lulus senarai di bawah. **Jangan** pilih *Yes, allow all edits during this session*.

   **Terima diff yang:**
   - meletakkan `where('user_id', $userId)` dalam kaedah Model `ownedBy()`, dan `index()` memanggil `ownedBy((int) auth()->id())`;
   - mengisi `$allowedFields` dengan medan SPEC sahaja (tiada `id`, tiada `$protectFields = false`);
   - memulangkan enum melalui Entity (`statusEnum()`/`typeEnum()`) dan memanggil `PassStatus::canTransitionTo()` untuk BR-PAS-01;
   - membalut setiap output view dengan `esc()`, termasuk `ref_no` dan `purpose`;
   - membuang `PageNotFoundException` apabila `canView()` memulangkan `false`.

   **TOLAK diff yang** (pilih **No** dan taip sebabnya supaya Claude membetulkan):
   - menapis pemilik dalam view atau gelung controller (`if ($app->user_id == …)`) dan bukan dalam Model;
   - memaparkan `find($id)` tanpa semakan `canView()`, atau memulangkan 403 kepada bukan pemilik;
   - mencipta migration baharu untuk `pass_applications`/`pass_documents`, atau mengubah migration Hari 4;
   - menggunakan nama medan yang tiada dalam SPEC (cth `type`, `applicant_id`, `file_path`);
   - menggunakan SQL mentah bercantum input, atau `<?= $x ?>` tanpa `esc()`;
   - mengubah fail di luar pelan (fail TLK, `app/Config/Filters.php`, `.env`) atau menjalankan `php spark migrate`.

   Jika anda tidak faham satu diff, pilih **No** dan hantar [AI-20](../docs/pustaka-prompt.md#ai-20--terangkan-diff-ini-sebelum-saya-terima) sebelum Claude mencuba semula.

5. **Pintu 4 — Sahkan (10 minit).** Masukkan data ujian sintetik mengikut [Lab 7.2 langkah 7](#lab-72--laluan-service--paparan-senaraibutiran-s2) (SQL `PAS-2026-9001` untuk `pemohon1`, `PAS-2026-9002` untuk `pemohon2`), kemudian jalankan:

   ```bash tab="Git Bash / macOS / Linux"
   composer test
   php spark routes | grep pas
   php spark filter:check GET /pas/permohonan
   ```

   ```powershell tab="PowerShell"
   composer test
   php spark routes | Select-String pas
   php spark filter:check GET /pas/permohonan
   ```

   Dalam Claude Code, minta Claude menggunakan MCP (luluskan setiap panggilan tool `ci4-spark`):

   ```text
   Guna tool ci4-spark: routes (tapis pas), filter_check GET /pas/permohonan, dan migrate_status. Jadualkan hasilnya. Jangan ubah fail.
   ```

   | Semakan | Jangkaan |
   |---------|----------|
   | `composer test` | `OK`, tiada `FAILURES`; ujian `PassStatusTest` dan `PassAccessTest` disenaraikan |
   | `routes` | 2 baris `pas/permohonan`: GET `/` → `index`, GET `(:num)` → `show` |
   | `filter_check GET /pas/permohonan` | Senarai *before* mengandungi `session` |
   | `migrate_status` | Migration Hari 4 untuk `pass_applications` dan `pass_documents` sudah dijalankan; tiada migration Pas baharu |
   | Pelayar, `pemohon1` → `/pas/permohonan` | Hanya `PAS-2026-9001` |
   | Pelayar, `pemohon2` → `/pas/permohonan/<id PAS-2026-9001>` | **404** |

6. **Pintu 5 — Semak dengan `semak-ci4` (10 minit).** Hantar:

   ```text
   Guna subagent semak-ci4 untuk menyemak app/Models/PassApplicationModel.php, app/Controllers/Pas, app/Services/PassWorkflowService.php dan app/Views/pas terhadap BR-PAS-04, esc(), filter route dan binding Query Builder. Jadual: fail:baris · isu · keterukan.
   ```

   Sahkan setiap dapatan dengan membuka `fail:baris` itu sendiri. Untuk dapatan yang benar:

   ```text
   Baiki dapatan semak-ci4 nombor <1, 3> sahaja, satu fail pada satu masa. Terangkan setiap perubahan sebelum saya luluskan. Jalankan composer test selepas itu.
   ```

   Pintu diff yang sama: baca, kemudian **Yes** atau **No**.

7. **Pintu 6 — Terangkan (10 minit).** Pilih 3 baris utama dan terangkan dengan ayat sendiri dalam `docs/nota-claude.md` (anda yang menaip, bukan Claude):

   `docs/nota-claude.md`

   ```markdown
   ## Pintu terang — Pas slice 1

   | # | fail:baris | Apa baris ini buat (ayat saya) | Apa berlaku jika dibuang |
   |---|-----------|--------------------------------|--------------------------|
   | 1 | app/Models/PassApplicationModel.php:NN (ownedBy) | ... | ... |
   | 2 | app/Controllers/Pas/ApplicationController.php:NN (404 bukan pemilik) | ... | ... |
   | 3 | app/Enums/PassStatus.php:NN (canTransitionTo) | ... | ... |
   ```

8. **Banding dengan kod rujukan (5 minit).** Buka [Lab 7.1 langkah 2–6](#lab-71--enum-entity--model-s1) dan [Lab 7.2 langkah 1–6](#lab-72--laluan-service--paparan-senaraibutiran-s2). Bandingkan dengan kod Claude dan rekod 3 perbezaan di bawah jadual pintu terang:

   ```markdown
   ## Banding dengan kod rujukan — slice 1

   | Perkara | Kod Claude | Lab 7.1/7.2 | Mana lebih baik & kenapa |
   |---------|-----------|-------------|--------------------------|
   | ownedBy() | ... | ... | ... |
   | 404 bukan pemilik | ... | ... | ... |
   | ... | ... | ... | ... |
   ```

9. **Pintu 7 — Commit (5 minit).**

   ```bash tab="Git Bash / macOS / Linux"
   git status --short          # tiada .env, tiada writable/
   git add CLAUDE.md docs/ app/ tests/
   git commit -m "PAS: slice 1 enum, model skop pemilik, senarai & butiran (Claude Code, disemak)"
   ```

   ```powershell tab="PowerShell"
   git status --short          # tiada .env, tiada writable/
   git add CLAUDE.md docs/ app/ tests/
   git commit -m "PAS: slice 1 enum, model skop pemilik, senarai & butiran (Claude Code, disemak)"
   ```

### ✅ Checkpoint
- [ ] `docs/spec-pas.md` wujud dan `CLAUDE.md` menunjuk kepadanya; bahagian `## Peranan anda (Claude)` dikemas kini untuk slice dan mod Manual (Kuiz S13).
- [ ] `docs/pelan-pas.md` mengandungi pelan Slice 1 yang anda edit sendiri, dengan jadual BR → fail → ujian dan tanpa migration baharu (Kuiz S13).
- [ ] `composer test` lulus dengan `PassStatusTest` dan `PassAccessTest`, dan `pemohon2` menerima 404 pada butiran milik `pemohon1` (Kuiz S13).
- [ ] Dapatan `semak-ci4` disahkan dan yang benar dibaiki melalui pintu diff (Kuiz S13).
- [ ] `docs/nota-claude.md` menerangkan 3 baris `fail:baris` dengan ayat sendiri dan merekod 3 perbezaan dengan Lab 7.1/7.2 (Kuiz S13).
- [ ] Commit `PAS: slice 1 …` ada dalam `git log --oneline` pada branch `feat/pas-claude`. 🪟 PowerShell: `git log --oneline -3` (Kuiz S13).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Shift+Tab` tidak menukar mod dalam Git Bash | Terminal mintty tidak menghantar kekunci itu | Guna `Alt+M`, atau jalankan `claude` dalam terminal VS Code / Windows Terminal |
| Claude tidak meminta kebenaran sebelum mengedit | Mod *accept edits* aktif (baris bawah menunjukkannya) | `Shift+Tab` hingga mod lalai; `git diff` untuk membaca apa yang sudah berubah; `git restore <fail>` jika perlu |
| `composer` atau `php` tidak dikenali dalam Bash Claude | `PATH` Laragon tiada dalam proses Claude Code | Laragon *Menu → Tools → Path → Add Laragon to Path*; tutup dan buka semula VS Code |
| `git diff` menunjukkan seluruh fail berubah | Hujung baris CRLF/LF bercampur | `git config core.autocrlf true`; minta Claude mengekalkan hujung baris asal; tolak diff yang hanya menukar hujung baris |
| Claude menjalankan `php spark migrate` | Perintah Bash diluluskan tanpa dibaca | Pilih **No** untuk perintah itu; semak `php spark migrate:status`; ulang peraturan dalam `CLAUDE.md` |
| Pemilik juga menerima 404 | `auth()->id()` dibanding sebagai string, atau `user_id` tiada dalam `$casts` Entity | Minta Claude menunjukkan baris perbandingan (AI-20); guna `(int)` dan `'user_id' => 'integer'` |
| `Class "App\Enums\PassStatus" not found` | `namespace` atau nama fail tidak sepadan (Windows tidak peka huruf, Composer peka) | Nama fail `PassStatus.php` dan `namespace App\Enums;` tepat; `composer dump-autoload` |

### ⭐ Cabaran tambahan
- Minta Claude (mod *Plan*) mencadangkan satu ujian yang akan **gagal** jika `ownedBy()` dibuang dari `index()`. Tulis ujian itu melalui pintu diff, buang `ownedBy()` sementara, sahkan ujian gagal, kemudian pulihkan.

---

## Lab 7.11 — Claude Code: Pas Slice 2 — Borang, Validasi & Muat Naik Dokumen Selamat (S14)

> 🛡️ Peraturan yang sama seperti [Lab 7.10](#lab-710--claude-code-pas-slice-1--migrationenummodel-senarai-skop-pemilik--butiran-s13): mod Manual sahaja, data dan fail ujian sintetik sahaja. Jangan muat naik dokumen sebenar (IC, geran, surat rasmi).

### 🎯 Objektif
Menggunakan aliran kerja tujuh pintu untuk membina slice kedua: borang `multipart/form-data` dengan CSRF, validasi server `uploaded`/`max_size`/`ext_in`/`mime_in`, `PassWorkflowService::submit()` yang memindah fail ke `writable/uploads/pas/` dengan nama rawak, menyimpan dalam transaksi dan membersihkan fail jika gagal, serta muat turun melalui controller dengan semakan pemilikan (BR-PAS-02, BR-PAS-04, BR-PAS-05, BR-PAS-06). Anda **menolak** diff yang melemahkan mana-mana lima pintu muat naik dan **menerangkan** 3 baris utama.

### Prasyarat
- Lab 7.10 siap dan di-commit dalam `feat/pas-claude`.
- Had PHP sedia: `upload_max_filesize` ≥ 8M, `post_max_size` ≥ 16M, extension `fileinfo` dimuatkan. Ikut [Lab 7.0 langkah 2–3](#lab-70--persediaan-10-minit-awal-s1) jika belum.
- Fail ujian sintetik dalam `~/ujian-pas/` ikut [Lab 7.3 langkah 5](#lab-73--borang-validasi-muat-naik--muat-turun-s3) dan fail sempadan ikut [Lab 7.4 langkah 1](#lab-74--ujian-manual-kes-sempadan-s4).

### Langkah

1. **Pintu 1 — SPEC.** Tiada fail baharu: `docs/spec-pas.md` sudah ada BR-PAS-02, BR-PAS-05 dan BR-PAS-06. Tambah satu baris di bahagian `## Modul Pas` dalam `CLAUDE.md`:

   `CLAUDE.md`

   ```markdown
   - Slice 2 (muat naik): validasi server uploaded/max_size/ext_in/mime_in; mime daripada getMimeType(), bukan getClientMimeType(); move() sebelum transaksi; padam fail jika transaksi gagal; new/create dengan permission:pas.apply.
   ```

2. **Pintu 2 — Pelan dalam mod *Plan* (10 minit).** `/clear`, tukar ke **plan mode** dan hantar:

   ```text
   Mod Plan. Baca @CLAUDE.md, @docs/spec-pas.md dan @docs/pelan-pas.md. Rancang Slice 2 Modul Pas sahaja: route GET pas/permohonan/new, POST pas/permohonan dan GET pas/permohonan/dokumen/(:num); filter permission:pas.apply pada new dan create; ApplicationController new(), create() dan download(); view pas/new dengan form_open_multipart() dan medan documents[]; PassWorkflowService::submit() dan documentPath().
   Petakan setiap fail kepada BR-PAS-02, BR-PAS-04, BR-PAS-05 dan BR-PAS-06. Terangkan urutan: validasi → move() dengan getRandomName() ke writable/uploads/pas/ → transaksi (pass_applications + pass_documents + status_logs) → jika gagal, rollback dan padam fail.
   Ujian: tests/feature/Pas/PassCreateTest.php untuk BR-PAS-06 (tarikh, kenderaan), had 3 fail, dan pemohon lain memuat turun dokumen → 404, ikut corak ujian Hari 6. Akhiri dengan jadual BR → fail → ujian. Jangan tulis kod.
   ```

   **Pelan yang baik mengandungi:**
   - `permission:pas.apply` pada route `new` dan `create` (SPEC §9), selain `session` kumpulan;
   - `form_open_multipart()` (CSRF tersembunyi dimasukkan automatik) dan tiada pengecualian CSRF dalam `Filters.php`;
   - rule `uploaded[documents]|max_size[documents,2048]|ext_in[documents,pdf,jpg,png]|mime_in[documents,application/pdf,image/jpeg,image/png]` dan semakan 1–3 fail;
   - fail di `WRITEPATH . 'uploads/pas/'` (di luar `public/`) dengan `getRandomName()`; DB menyimpan `stored_path`, `original_name`, `mime` (daripada `getMimeType()`) dan `size_bytes`;
   - transaksi yang merangkumi `pass_applications`, `pass_documents` dan `status_logs` (`to_status = submitted`), dengan pembersihan fail dalam `catch`;
   - `download()` mencari dokumen → permohonan → `canView()` → 404 jika tiada akses → `response->download()` daripada `stored_path`, bukan daripada input pengguna.

   Kemas kini `docs/pelan-pas.md` dengan Slice 2 yang anda edit sendiri.

3. **Pintu 3 — Laksana dalam mod *Manual* (30 minit).** Keluar dari mod *Plan* dan hantar ([AI-19](../docs/pustaka-prompt.md#ai-19--laksana-satu-slice-daripada-pelan-mod-manual)):

   ```text
   Laksana HANYA Slice 2 daripada pelan dalam @docs/pelan-pas.md, satu fail pada satu masa.
   Rujuk @docs/spec-pas.md (§2.2 BR-PAS-02, BR-PAS-04, BR-PAS-05, BR-PAS-06). Nama jadual, medan, enum dan kelas tepat seperti SPEC.
   Kekangan: jangan ubah fail di luar senarai pelan; jangan jalankan migrate atau db:seed; tiada fail dalam public/; setiap output view melalui esc(); jangan ubah app/Config/Filters.php.
   Selepas setiap fail, berhenti dan terangkan dalam 3 baris apa yang berubah dan BR mana dipenuhi, sebelum fail seterusnya.
   Akhir sekali, tulis ujian dalam pelan dan jalankan composer test.
   ```

   **Terima diff yang:**
   - menggunakan `$file->getRandomName()` dan `move(WRITEPATH . 'uploads/pas', $newName)`;
   - membaca `getMimeType()` dan `getSize()` **sebelum** `move()`;
   - mempunyai keempat-empat rule fail dengan mesej ralat BM, dan menolak lebih daripada 3 fail;
   - membuka transaksi selepas `move()`, dan dalam `catch` memanggil `transRollback()` serta `unlink()` untuk setiap fail yang sudah dipindah;
   - merekod `status_logs` (`module = 'PAS'`, `to_status = 'submitted'`) dalam transaksi yang sama;
   - dalam `download()`, menyemak `canView()` dan membina path daripada `stored_path` dalam DB, dengan `esc()` pada nama fail dalam view.

   **TOLAK diff yang:**
   - menyimpan fail dalam `public/` atau `FCPATH`, atau memaut dokumen dengan `base_url('uploads/…')`;
   - menggunakan `getName()`/`getClientName()` sebagai nama fail di cakera;
   - mempercayai `getClientMimeType()` atau `ext_in` sahaja (tiada `mime_in`), atau bergantung pada `accept=".pdf"` di pelayar sahaja;
   - menyimpan ke DB tanpa transaksi, atau tidak memadam fail apabila transaksi gagal;
   - membuang `csrf_field()`/`form_open_multipart()`, atau menambah route Pas ke `except` CSRF;
   - tiada `permission:pas.apply` pada `new`/`create`, atau `download()` tanpa semakan pemilikan;
   - menerima path atau nama fail daripada request (`?file=…`) untuk dimuat turun.

4. **Pintu 4 — Sahkan (15 minit).**

   ```bash tab="Git Bash / macOS / Linux"
   composer test
   php spark routes | grep pas
   php spark filter:check POST /pas/permohonan
   ls writable/uploads/pas/
   find public -iname "*.pdf" -o -iname "*.png"     # tiada output
   ```

   ```powershell tab="PowerShell"
   composer test
   php spark routes | Select-String pas
   php spark filter:check POST /pas/permohonan
   Get-ChildItem writable/uploads/pas/
   Get-ChildItem public -Recurse -Include *.pdf,*.png   # tiada output
   ```

   ```text
   Guna tool ci4-spark: routes (tapis pas) dan filter_check POST /pas/permohonan. Jadualkan hasilnya. Jangan ubah fail.
   ```

   | Semakan | Jangkaan |
   |---------|----------|
   | `composer test` | `OK`, tiada `FAILURES`; `PassCreateTest` disenaraikan |
   | `routes` | 5 baris `pas/permohonan`: `index`, `new`, `create`, `show`, `dokumen/(:num)` |
   | `filter_check POST /pas/permohonan` | Senarai *before* mengandungi `csrf`, `session` dan `permission:pas.apply` |
   | `pemohon1` hantar `surat-sokongan.pdf` + `gambar.png` | Redirect ke butiran `PAS-2026-…`; 2 fail bernama rawak dalam `writable/uploads/pas/` |
   | Fail 3 MB | Kembali ke borang dengan mesej `Setiap fail mestilah tidak melebihi 2 MB.` (atau mesej BM setara); bilangan fail di cakera tidak bertambah |
   | `skrip.php` dinamakan `skrip.pdf` | Ditolak oleh `mime_in`; tiada fail baharu |
   | `pemohon2` buka URL muat turun dokumen `pemohon1` | **404** |
   | `public/` | Tiada fail PDF/PNG |

   Semak juga dalam MySQL (HeidiSQL Laragon): satu baris `status_logs` dengan `module = 'PAS'` dan `to_status = 'submitted'` bagi permohonan baharu.

5. **Pintu 5 — Semak dengan `semak-ci4` (10 minit).**

   ```text
   Guna subagent semak-ci4 untuk menyemak app/Controllers/Pas/ApplicationController.php, app/Services/PassWorkflowService.php dan app/Views/pas/new.php terhadap BR-PAS-02, BR-PAS-04, CSRF, filter permission:pas.apply, esc() dan pembersihan fail jika transaksi gagal. Jadual: fail:baris · isu · keterukan.
   ```

   Sahkan setiap dapatan sendiri, kemudian minta pembaikan yang benar sahaja (prompt baiki Lab 7.10 langkah 6), dengan pintu diff yang sama.

6. **Pintu 6 — Terangkan (10 minit).** Tambah dalam `docs/nota-claude.md`:

   ```markdown
   ## Pintu terang — Pas slice 2

   | # | fail:baris | Apa baris ini buat (ayat saya) | Apa berlaku jika dibuang |
   |---|-----------|--------------------------------|--------------------------|
   | 1 | app/Services/PassWorkflowService.php:NN (getRandomName + move) | ... | ... |
   | 2 | app/Services/PassWorkflowService.php:NN (catch: rollback + unlink) | ... | ... |
   | 3 | app/Controllers/Pas/ApplicationController.php:NN (download: canView) | ... | ... |
   ```

7. **Banding dengan kod rujukan (5 minit).** Buka [Lab 7.3 langkah 1–3](#lab-73--borang-validasi-muat-naik--muat-turun-s3) (`PassWorkflowService` versi Hari 7, `ApplicationController::rules()`, `pas/new`). Rekod 3 perbezaan:

   ```markdown
   ## Banding dengan kod rujukan — slice 2

   | Perkara | Kod Claude | Lab 7.3 | Mana lebih baik & kenapa |
   |---------|-----------|---------|--------------------------|
   | Urutan move() dan transaksi | ... | ... | ... |
   | Rules fail & mesej BM | ... | ... | ... |
   | ... | ... | ... | ... |
   ```

8. **Pintu 7 — Commit dan push (5 minit).**

   ```bash tab="Git Bash / macOS / Linux"
   git status --short          # tiada writable/uploads, tiada .env
   git add CLAUDE.md docs/ app/ tests/
   git commit -m "PAS: slice 2 borang, validasi & muat naik selamat (Claude Code, disemak)"
   git push -u origin feat/pas-claude
   ```

   ```powershell tab="PowerShell"
   git status --short          # tiada writable/uploads, tiada .env
   git add CLAUDE.md docs/ app/ tests/
   git commit -m "PAS: slice 2 borang, validasi & muat naik selamat (Claude Code, disemak)"
   git push -u origin feat/pas-claude
   ```

### ✅ Checkpoint
- [ ] `docs/pelan-pas.md` mengandungi Slice 2 dengan jadual BR → fail → ujian, termasuk `permission:pas.apply` dan pembersihan fail (Kuiz S14).
- [ ] `filter_check POST /pas/permohonan` menunjukkan `csrf`, `session` dan `permission:pas.apply`, dan `routes` menunjukkan 5 route Pas (Kuiz S14).
- [ ] Permohonan sah menyimpan fail bernama rawak dalam `writable/uploads/pas/`, `public/` tiada fail dokumen, dan `status_logs` ada baris `submitted` (Kuiz S14).
- [ ] Fail 3 MB dan `skrip.pdf` ditolak tanpa fail baharu di cakera, dan `pemohon2` menerima 404 pada muat turun dokumen `pemohon1` (Kuiz S14).
- [ ] `composer test` lulus dengan `PassCreateTest`, dan dapatan `semak-ci4` disahkan serta dibaiki melalui pintu diff (Kuiz S14).
- [ ] `docs/nota-claude.md` menerangkan 3 baris slice 2 dan 3 perbezaan dengan Lab 7.3; commit `PAS: slice 2 …` di-push. 🪟 PowerShell: `git log --oneline -3` (Kuiz S14).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Setiap fail ditolak oleh `mime_in`, termasuk PDF sah | Extension `fileinfo` tidak dimuatkan | Laragon *Menu → PHP → Extensions → fileinfo*; mulakan semula Apache; `php -m` mesti menyenaraikan `fileinfo` |
| Fail 3 MB memberi ralat `uploaded`, bukan `max_size` | `upload_max_filesize` Laragon 2M menolak fail sebelum CI4 | [Lab 7.0 langkah 3](#lab-70--persediaan-10-minit-awal-s1): `upload_max_filesize = 8M`, `post_max_size = 16M` |
| `unlink(): Permission denied` semasa pembersihan | Fail dibuka dalam pemapar PDF atau diimbas antivirus | Tutup pemapar; cuba semula; jangan padam fail secara manual tanpa memadam baris `pass_documents` |
| Claude menulis `WRITEPATH . 'uploads\pas'` | Garis condong belakang Windows | Tolak diff; minta `/` (PHP menerima `/` di Windows) |
| Tiada `head -c` untuk menjana fail 3 MB dalam PowerShell | Arahan Git Bash | PowerShell: `[IO.File]::WriteAllBytes("$HOME\ujian-pas\besar.pdf", (New-Object byte[] 3145728))` |
| `filter_check` tidak menunjukkan `permission:pas.apply` | Filter diletak pada kumpulan sahaja, atau pada route `show` | Minta Claude menunjukkan definisi route (AI-20); filter pada `new` dan `create` sahaja |
| `The action you requested is not allowed.` semasa hantar borang | Token CSRF tiada (borang bukan `form_open_multipart()`), atau sesi tamat | Tolak diff yang membuang CSRF; muat semula borang dan cuba lagi |

### ⭐ Cabaran tambahan
- Minta Claude (mod *Plan*) membandingkan `PassCreateTest` dengan `PassSubmitTest` dalam [Lab 7.4b](#lab-74b--automasikan-kes-sempadan-dengan-phpunit-s8): kes sempadan BR-PAS-02 mana yang belum diuji? Tambah dua kes melalui pintu diff dan sahkan setiap satu gagal jika rule berkaitan dibuang.

---

## Lab 7.12 — Fahami Projek Contoh eSPKP dengan Claude Code (S15)

> 🛡️ **Peraturan Lab 7.12–7.13.** eSPKP Contoh ialah aplikasi rujukan kursus dengan data **sintetik**, jadi Claude Code boleh membacanya. Ia **bukan** sistem eSPKP sebenar: jangan sambungkan Claude kepada kod, database atau pelayan KKM sebenar. Mod **Plan** sahaja dalam folder eSPKP; tiada kod diubah. Jangan cipta atau buka `.env` dalam klon eSPKP.

### 🎯 Objektif
Memahami projek CI4 yang siap dengan Claude Code dalam mod *Plan*: aliran request, di mana peraturan aliran kerja tinggal (`app/Config/Aliran.php`), peranan dan kebenaran, model data, cara ciri diuji, dan fail yang berubah untuk satu ciri baharu. Anda **mengesahkan** setiap jawapan dengan membuka `fail:baris`, **meneroka** satu aliran hujung ke hujung dalam demo langsung dengan 2 peranan, dan **merekod** dapatan dalam `~/latihan/espkpv2-kajian/nota-fahami.md`.

### Prasyarat
- Lab 7.6 siap: `claude --version` berfungsi dan anda log masuk.
- Kod eSPKP Contoh (commit `01abad1`): akses *Reporter* ke repo peribadi GitLab KKM `aplikasi-baharu/espkpv2`, **atau** salinan zip jurulatih `espkpv2-01abad1.zip`.
- Akaun demo dan kunci TOTP kongsi: [`contoh-espkp.md`](../docs/contoh-espkp.md). Pasang aplikasi pengesah (contoh Google Authenticator) pada telefon.
- Tiada database diperlukan untuk membaca kod. `composer install` adalah pilihan; arahan penuh dalam README eSPKP bahagian *Mula (Windows · Laragon · Git Bash)*.
- 🪟 **Windows:** terminal Git Bash dalam VS Code. Jika `Shift+Tab` tidak menukar mod, guna `Alt+M`.

### Langkah

1. **Dapatkan kod ke folder latihan berasingan (5 minit).** Bukan dalam `kelas-ci-<nama>`. Repo `aplikasi-baharu/espkpv2` di GitLab KKM adalah **peribadi**; versi rujukan lab ini ialah commit `01abad1`. Pilih satu cara:

   **(a) Klon**, jika jurulatih sudah menambah anda sebagai *Reporter* pada `aplikasi-baharu/espkpv2`:

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p ~/latihan/espkpv2-kajian
   git clone https://<gitlab-kkm>/aplikasi-baharu/espkpv2.git ~/latihan/espkpv2
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force "$HOME\latihan\espkpv2-kajian" | Out-Null
   git clone https://<gitlab-kkm>/aplikasi-baharu/espkpv2.git "$HOME\latihan\espkpv2"
   ```

   **(b) Zip**, jika anda tiada akses: ekstrak salinan jurulatih `espkpv2-01abad1.zip` (mengandungi folder `espkpv2/`) ke `~/latihan/`. Ini laluan biasa, bukan ralat.

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p ~/latihan/espkpv2-kajian
   unzip ~/Downloads/espkpv2-01abad1.zip -d ~/latihan/
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force "$HOME\latihan\espkpv2-kajian" | Out-Null
   Expand-Archive -Path "$HOME\Downloads\espkpv2-01abad1.zip" -DestinationPath "$HOME\latihan\"
   ```

   Semak kedua-dua cara: fail utama wujud.

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/latihan/espkpv2
   ls CLAUDE.md docs app/Config/Aliran.php
   ```

   ```powershell tab="PowerShell"
   cd $HOME\latihan\espkpv2
   Get-ChildItem CLAUDE.md, docs, app\Config\Aliran.php
   ```

2. **Sediakan templat nota (3 minit).** Cipta `~/latihan/espkpv2-kajian/nota-fahami.md` dalam VS Code dan taip/tampal:

   `~/latihan/espkpv2-kajian/nota-fahami.md`

   ```markdown
   # Nota fahami — eSPKP Contoh

   ## CLAUDE.md eSPKP
   - Satu perkara yang saya tiru dalam CLAUDE.md saya: ...

   ## Jawapan onboarding (disahkan)
   | # | Soalan | Jawapan ringkas (ayat saya) | Bukti fail:baris | Betul / dibetulkan |
   |---|--------|-----------------------------|------------------|--------------------|
   | P1 | Aliran request | ... | ... | ... |
   | P2 | Peraturan aliran kerja & satu peralihan | ... | ... | ... |
   | P3 | Peranan & kebenaran | ... | ... | ... |
   | P4 | Model data | ... | ... | ... |
   | P5 | Cara ciri diuji | ... | ... | ... |
   | P6 | Fail yang berubah untuk ciri baharu | ... | ... | ... |

   ## Demo langsung (2 peranan)
   - Aliran yang dicuba: ...
   - Status sebelum → selepas: ...
   - Apa yang pengguna lain TIDAK nampak: ...

   ## Soalan saya untuk pemilik sistem
   - ...
   ```

3. **Buka Claude dalam mod Plan (2 minit).** Dalam `~/latihan/espkpv2`:

   ```bash
   claude
   ```

   Tekan `Shift+Tab` (atau `Alt+M`) sehingga baris bawah menunjukkan **plan mode**. Taip `/memory`: `CLAUDE.md` projek eSPKP disenaraikan, dimuatkan **tanpa** anda memintanya. Ini pelajaran pertama: CLAUDE.md yang baik memberi Claude konteks tepat sejak soalan pertama. Rekod satu perkara yang anda mahu tiru dalam nota.

4. **Enam prompt onboarding (35 minit).** Hantar satu demi satu (gaya [AI-15](../docs/pustaka-prompt.md#ai-15--onboarding-projek-sedia-ada)). Selepas setiap jawapan, buka sekurang-kurangnya satu `fail:baris` dalam VS Code dan isi satu baris jadual nota.

   **P1 — Aliran request.**

   ```text
   Mod Plan. Jangan ubah sebarang fail.
   Jejak satu request GET untuk paparan butiran permohonan, dari route, filter global dan filter route, controller, policy, service, model hingga view.
   Untuk setiap langkah, beri fail:baris supaya saya boleh menyemaknya sendiri.
   ```

   Titik utama jangkaan:
   - filter global `session` (tolak secara lalai) dan `csrf` dalam `app/Config/Filters.php`; route eksplisit dengan placeholder `(:uuid)` dalam `app/Config/Routes.php`;
   - controller nipis memanggil `BaseController::permohonanAtau404()` (`app/Controllers/BaseController.php`), yang memanggil `PermohonanPolicy::bolehLihat()` (`app/Libraries/PermohonanPolicy.php`);
   - pengguna tanpa akses menerima **404, bukan 403**;
   - UUID dalam URL dipetakan kembali ke `id` INT dalam controller; service kekal berasaskan INT.

   **P2 — Peraturan aliran kerja.**

   ```text
   Mod Plan. Di mana peraturan "siapa boleh buat apa, bila" untuk aliran permohonan pas disimpan?
   Terangkan medan setiap baris, kemudian jejak satu peralihan: Urus Setia menekan "Lengkap — hantar ke Penyelia". Apa yang berlaku dalam satu transaksi?
   Beri fail:baris untuk setiap dakwaan.
   ```

   Titik utama jangkaan:
   - **satu jadual:** `$peralihan` dalam `app/Config/Aliran.php`, dikunci ikut kumpulan `pas`, `hilang`, `tlk` (subjenis → kumpulan melalui `$kumpulan`);
   - setiap baris: `peringkat`, `tindakan`, `dari`, `ke`, `catatan` (`wajib` = ≥ 10 aksara), `perlu`, `kesan`; baris "lengkap" kumpulan `pas` bergerak dari status 2 ke 4 dan `perlu` memilih `penyelia`;
   - `AliranKerja::tersedia()` menyenaraikan tindakan; `AliranKerja::laksana()` mengunci baris (`FOR UPDATE`), menyemak semula status, menukar status dan menulis log `permohonan_tindakan` dalam satu transaksi;
   - butang, semakan server dan *stepper* (`$langkah`) membaca jadual yang sama; `tests/unit/KonfigurasiAliranTest.php` menyemak konsistensinya.

   **P3 — Peranan & kebenaran.**

   ```text
   Mod Plan. Senaraikan peranan dan kebenaran sistem ini dalam jadual (peranan · kebenaran · apa yang boleh dibuat).
   Di mana peringkat aliran kerja dipetakan kepada kebenaran Shield? Siapa boleh melihat SEMUA permohonan, dan kenapa pentadbir tidak boleh?
   Beri fail:baris.
   ```

   Titik utama jangkaan:
   - `app/Config/AuthGroups.php`: 7 kumpulan (`pemohon`, `wakil`, `urusetia`, `penyelia`, `uks`, `pelulus`, `superadmin`) dan `$matrix`;
   - `app/Enums/Peringkat.php` memetakan setiap peringkat kepada kebenaran (contoh `permohonan.semak`, `permohonan.sokong`, `permohonan.proses`, `permohonan.lulus`);
   - `permohonan.lihat_semua` hanya untuk UKS dan Pelulus (keistimewaan minimum); `superadmin` tiada `pas.mohon` dan hanya melihat permohonan lulus (untuk dibatalkan) serta laporan agregat;
   - pemilik tidak boleh bertindak atas permohonan sendiri kecuali sebagai Pemohon (pengasingan tugas).

   **P4 — Model data.**

   ```text
   Mod Plan. Terangkan model data permohonan pas: jadual utama, hubungan, lajur status, lampiran dan nombor rujukan.
   Migration mana yang mencipta setiap jadual? Kenapa ada lajur uuid dan lajur snap_*?
   Beri fail:baris.
   ```

   Titik utama jangkaan:
   - migration dalam `app/Database/Migrations/`, contoh `…_CreatePermohonan.php`, `…_CreatePas.php`, `…_CreateLampiran.php`; skema hanya daripada migration (tiada SQL manual);
   - status sebagai kod 1–15 (`app/Enums/StatusPermohonan.php`), sepadan dengan `lt_status` lama;
   - PK/FK INT kekal; `uuid` BINARY(16) UUIDv7 ditambah oleh migration `…_UuidAwam.php` untuk URL awam;
   - `snap_*` menyalin nama, jawatan dan organisasi pemohon semasa hantar; nombor rujukan daripada jadual `kiraan_rujukan` secara atomik; rujukan penuh dalam `docs/pangkalan-data.md`.

   **P5 — Cara ciri diuji.**

   ```text
   Mod Plan. Bagaimana sistem ini diuji? Terangkan tiga suite ujian, kelas asas ujian, dan kenapa SQLite tidak boleh digunakan.
   Tunjukkan satu ujian yang membuktikan pengguna lain menerima 404, dan satu ujian untuk peralihan aliran kerja. Beri fail:baris.
   ```

   Titik utama jangkaan:
   - `composer test` menjalankan suite Unit, Database, Feature (`tests/unit`, `tests/database`, `tests/feature`); `composer semak` = cs + analyse + test;
   - `tests/_support/UjianPangkalanData` memigrasi semula untuk setiap ujian; `UjianCiri` untuk ujian HTTP;
   - MySQL sebenar diperlukan kerana kod menggunakan `SELECT … FOR UPDATE` dan `ON DUPLICATE KEY`;
   - contoh: ujian dalam `tests/feature/AksesTest.php` (akses dan 404) dan `tests/database/AliranKerjaTest.php` (peralihan).

   **P6 — Fail yang berubah untuk ciri baharu.**

   ```text
   Mod Plan. Jangan ubah fail. Pemilik sistem mahu Penyelia boleh memulangkan permohonan pas HILANG untuk pindaan (sekarang hanya Urus Setia dan UKS boleh).
   Senaraikan setiap fail yang perlu berubah dan kenapa, termasuk ujian dan dokumen. Nyatakan juga fail yang TIDAK perlu berubah.
   ```

   Titik utama jangkaan:
   - satu baris baharu dalam `$peralihan['hilang']` di `app/Config/Aliran.php` (`peringkat` `penyelia`, `tindakan` `pindaan`, `ke` 3, `catatan` `wajib`);
   - aliran `hilang` tidak melalui Penyelia sekarang (`$langkah['hilang']`), jadi Claude yang baik menyatakan perubahan ini juga memerlukan keputusan tentang peringkat Penyelia: satu soalan untuk pemilik sistem;
   - ujian dalam `tests/database/AliranKerjaTest.php`; `KonfigurasiAliranTest` mesti terus lulus; kemas kini `docs/aliran-kerja.md`;
   - controller dan view **tidak** berubah kerana butang dijana daripada jadual.

5. **Demo langsung: satu aliran, 2 peranan (20 minit).** Buka <https://eskp.synctexts.com> (kata laluan dan kunci TOTP dalam [`contoh-espkp.md`](../docs/contoh-espkp.md)).
   - Log masuk sebagai **Pemohon** `900101010001`: mohon pas baharu dengan data sintetik. Perhatikan *stepper* dan status **Semakan Urus Setia**. Salin URL butiran (perhatikan UUID, bukan nombor).
   - Log masuk sebagai **Wakil syarikat** `900101010007` dan tampal URL itu: anda menerima **404** (BR-PAS-04 dalam versi eSPKP).
   - Log masuk sebagai **Urus Setia** `900101010002` (masukkan kod TOTP): buka permohonan dalam baris gilir. Butang yang dipaparkan ialah baris `urusetia` dalam `$peralihan['pas']`. Tekan **Lengkap — hantar ke Penyelia** dan pilih penyelia.
   - Rekod status sebelum → selepas, dan padankan dengan baris Aliran.php dalam nota anda.

   Jika permohonan anda tiada dalam baris gilir Urus Setia, guna mana-mana permohonan demo sedia ada yang berstatus **Semakan Urus Setia** (data demo diset semula setiap hari).

6. **Tutup sesi.** `/exit`. Semak `git status` dalam `~/latihan/espkpv2`: tiada fail berubah.

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/latihan/espkpv2 && git status --short   # kosong
   ```

   ```powershell tab="PowerShell"
   cd $HOME\latihan\espkpv2; git status --short   # kosong
   ```

### ✅ Checkpoint
- [ ] `~/latihan/espkpv2/CLAUDE.md` wujud (klon atau zip) dan `/memory` menunjukkan ia dimuatkan secara automatik; satu perkara untuk ditiru direkod (Kuiz S15).
- [ ] `nota-fahami.md` mengandungi 6 jawapan onboarding dengan ayat sendiri dan bukti `fail:baris` yang anda buka sendiri (Kuiz S15).
- [ ] Sekurang-kurangnya satu dakwaan Claude disemak dan direkod sebagai betul atau dibetulkan, termasuk di mana `$peralihan` tinggal (Kuiz S15).
- [ ] Aliran demo dengan 2 peranan direkod: status sebelum → selepas dan 404 untuk pengguna lain (Kuiz S15).
- [ ] Tiada fail berubah dalam klon eSPKP. 🪟 PowerShell: `git status --short` dalam `$HOME\latihan\espkpv2` (Kuiz S15).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `git clone` meminta kata laluan berulang, `403`, atau pelayar dialih ke `sign_in` | Repo peribadi: anda belum ditambah sebagai *Reporter*, atau token belum disediakan | Guna cara (b): zip `espkpv2-01abad1.zip` |
| `Filename too long` semasa klon | Had laluan 260 aksara Windows | `git config --global core.longpaths true`, kemudian klon semula ke `~/latihan` (laluan pendek) |
| `/memory` tidak menunjukkan CLAUDE.md eSPKP | `claude` dijalankan di luar `~/latihan/espkpv2` | `/exit`, `cd ~/latihan/espkpv2`, jalankan `claude` semula |
| Claude meminta kebenaran mengedit fail | Mod Plan tidak aktif | Pilih **No**; `Shift+Tab` (atau `Alt+M`) hingga *plan mode* |
| Claude menyebut fail yang tidak wujud | Jawapan berhalusinasi | Minta "tunjukkan fail:baris tepat"; rekod sebagai dibetulkan dalam nota |
| Kod TOTP ditolak di demo | Jam telefon tidak segerak, atau kunci ditaip salah | Hidupkan masa automatik pada telefon; tambah semula kunci daripada `contoh-espkp.md` sebagai jenis berasaskan masa |
| `composer install` gagal (`ext-intl` atau `ext-sodium`) | Extension PHP Laragon tidak dihidupkan | Langkau: `composer install` tidak diperlukan untuk membaca kod |

### ⭐ Cabaran tambahan
- Minta Claude (mod *Plan*) membandingkan `CLAUDE.md` eSPKP dengan `CLAUDE.md` dalam `kelas-ci-<nama>` anda (`claude --add-dir ~/latihan/kelas-ci-<nama>`). Pilih dua cadangan dan tulis sendiri dalam projek anda esok.

---

## Lab 7.13 — PRD daripada Projek Contoh, Banding SPEC & Pelan Slice Pas (S16)

> 🛡️ Peraturan yang sama seperti [Lab 7.12](#lab-712--fahami-projek-contoh-espkp-dengan-claude-code-s15). Claude **mendraf**, anda **menyemak dan memutuskan**. SPEC kursus kekal kanun: nama jadual, medan, enum dan kelas tidak berubah kerana eSPKP berbeza.

### 🎯 Objektif
Mendraf PRD aliran Pas eSPKP daripada kod (*reverse engineering*) dengan Claude dalam mod *Plan*, **mengesahkan** 3 dakwaan terhadap kod dan demo langsung, **membandingkan** dengan SPEC Pas kursus dalam jadual jurang, **menulis** keperluan Pas anda sendiri dalam `docs/keperluan-pas.md` dan **menghasilkan** pelan *vertical slice* `docs/pelan-pas.md` (input Lab 7.10 esok pagi), di-commit pada branch `docs/keperluan-pas`.

### Prasyarat
- Lab 7.12 siap: `~/latihan/espkpv2` dan `nota-fahami.md` wujud.
- Templat PRD: [`tutorial-prompt-projek.md`](../docs/tutorial-prompt-projek.md) §4.3. SPEC Pas: [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §2.2–§6.
- Projek `kelas-ci-<nama>` dengan `git status` bersih.
- 🪟 **Windows:** terminal Git Bash dalam VS Code.

### Langkah

1. **Draf PRD eSPKP Pas (15 minit).** Dalam `~/latihan/espkpv2`, mulakan `claude`, tukar ke **plan mode** dan hantar:

   ```text
   Mod Plan. Jangan ubah sebarang fail.
   Draf PRD untuk aliran PAS KESELAMATAN sahaja (subjenis baharu, rosak, hilang; abaikan TLK, laporan dan 2FA) berdasarkan kod projek ini.
   Ikut bahagian ini: 1 Masalah, 2 Pengguna & peranan, 3 Skop, 4 Keperluan fungsian (FR-01..), 5 Peraturan perniagaan (BR-01..), 6 Keperluan bukan fungsian, 7 Data/entiti, 8 Kriteria penerimaan (AC-01.., Diberi/Apabila/Maka), 9 Soalan terbuka.
   Sumber utama: app/Config/Aliran.php, app/Config/AuthGroups.php, app/Enums, migration permohonan/pas/lampiran, docs/aliran-kerja.md.
   Untuk NFR, sertakan: bukan pemilik menerima 404 bukan 403, lampiran disimpan di luar public/ dengan nama rawak, satu tindakan = satu transaksi.
   Untuk setiap FR dan BR, beri fail:baris sumbernya dalam kurungan. Data sintetik sahaja.
   ```

   Salin jawapan Claude ke `~/latihan/espkpv2-kajian/prd-espkp-pas.md` (anda yang menampal; mod Plan tidak menulis fail).

   PRD yang baik mengandungi:
   - peranan daripada `AuthGroups.php` dan peringkat daripada `$peralihan['pas']` / `$peralihan['hilang']`;
   - FR untuk mohon, semak kelengkapan, sokong, proses UKS, lulus/tidak lulus, pulang untuk pindaan, batal;
   - BR seperti "catatan wajib ≥ 10 aksara untuk pindaan/tolak" dan "lampiran wajib ikut subjenis" (`$lampiranWajib`);
   - NFR: 404 bukan 403, lampiran di luar `public/`, transaksi dengan kunci `FOR UPDATE`;
   - bahagian Soalan terbuka (contoh caj ganti pas hilang `$cajCadangan` masih *placeholder*).

2. **Sahkan 3 dakwaan (10 minit).** Pilih 3 FR/BR daripada PRD. Untuk setiap satu, buka `fail:baris` sumbernya **dan** cuba dalam demo langsung (akaun dalam [`contoh-espkp.md`](../docs/contoh-espkp.md)). Tambah bahagian ini di hujung `prd-espkp-pas.md`:

   `~/latihan/espkpv2-kajian/prd-espkp-pas.md`

   ```markdown
   ## Pengesahan
   | Dakwaan (ID) | Bukti kod fail:baris | Bukti demo (akaun · skrin) | Keputusan |
   |--------------|----------------------|----------------------------|-----------|
   | BR-?? | ... | ... | Betul / Dibetulkan: ... |
   | FR-?? | ... | ... | ... |
   | NFR 404 | ... | 07 membuka URL permohonan 01 → 404 | ... |
   ```

   Satu dakwaan yang salah? Betulkan PRD **sendiri**; jangan minta Claude menulis semula keseluruhannya.

3. **Jadual jurang: eSPKP vs SPEC kursus (15 minit).** Buka [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §2.2 dan bina jadual dalam `~/latihan/espkpv2-kajian/jurang-pas.md`. Minimum 8 baris; keputusan **guna / laras / tidak** dengan sebab.

   `~/latihan/espkpv2-kajian/jurang-pas.md`

   ```markdown
   # Jurang eSPKP Contoh vs SPEC kursus — Modul Pas

   | Ciri | eSPKP | SPEC kursus | Keputusan: guna / laras / tidak | Sebab |
   |------|-------|-------------|---------------------------------|-------|
   | Peringkat kelulusan | Urus Setia → Penyelia → UKS → Pelulus | reviewer → approver | tidak | SPEC kanun; 2 peringkat |
   | Status | 15 kod (StatusPermohonan) | PassStatus 5 nilai | laras | prinsip "satu sumber" melalui canTransitionTo() |
   | Pulang untuk pindaan | status 3 | tiada | tidak | soalan terbuka untuk pemilik sistem |
   | Catatan wajib | ≥ 10 aksara untuk tolak/pulang | BR-PAS-03 | guna | sama |
   | Bukan pemilik | 404 | BR-PAS-04 | guna | sama |
   | Lampiran | luar public/, nama rawak, sha256 | BR-PAS-02 writable/uploads/pas/ | guna / laras | ... |
   | Log tindakan | permohonan_tindakan | BR-PAS-05 status_logs | ... | ... |
   | Pengenal dalam URL | UUID | id INT (SPEC §6) | ... | ... |
   ```

4. **Keperluan Pas anda (15 minit).** Dalam `kelas-ci-<nama>`, buat branch dan buka Claude dengan akses baca ke folder kajian:

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/latihan/kelas-ci-<nama>
   git switch main && git pull
   git switch -c docs/keperluan-pas
   claude --add-dir ~/latihan/espkpv2-kajian
   ```

   ```powershell tab="PowerShell"
   cd $HOME\latihan\kelas-ci-<nama>
   git switch main
   git pull
   git switch -c docs/keperluan-pas
   claude --add-dir $HOME\latihan\espkpv2-kajian
   ```

   Dalam **plan mode**, hantar:

   ```text
   Mod Plan. Jangan ubah fail.
   Baca @CLAUDE.md, ~/latihan/espkpv2-kajian/jurang-pas.md dan ~/latihan/espkpv2-kajian/prd-espkp-pas.md.
   Draf docs/keperluan-pas.md untuk modul Pas KURSUS ini, ikut templat PRD (Masalah, Peranan, Skop, FR-PAS-01.., BR, NFR, Data, AC-PAS-01.., Soalan terbuka).
   Peraturan: guna ID BR-PAS-01..06 dan nama jadual/medan/enum/kelas tepat seperti SPEC kursus (pass_applications, PassStatus, PassWorkflowService, pas.apply/pas.review/pas.approve).
   Masukkan hanya baris jurang berkeputusan "guna" atau "laras"; baris "tidak" pergi ke Luar skop atau Soalan terbuka.
   ```

   Tampal draf ke `docs/keperluan-pas.md` dan edit sendiri. Keperluan yang baik:
   - peranan `applicant`, `reviewer`, `approver`, `admin` sahaja; aliran `submitted → under_review → approved/rejected`, `expired` oleh sistem;
   - BR-PAS-01..06 dengan ayat SPEC; NFR "404 bukan 403" dan "fail di luar `public/`";
   - sekurang-kurangnya 4 AC boleh diuji, contoh "Diberi `pemohon2`, apabila membuka butiran milik `pemohon1`, maka 404";
   - Luar skop: Penyelia, UKS, UUID, pindaan; Soalan terbuka untuk pemilik sistem.

5. **Pelan slice (10 minit).** Masih dalam **plan mode** ([AI-17](../docs/pustaka-prompt.md#ai-17--prd--pelan-vertical-slice)):

   ```text
   Mod Plan. Baca @docs/keperluan-pas.md. Pecahkan modul Pas kepada 5 vertical slice yang sepadan dengan lab:
   Slice 1 enum, Entity, Model ownedBy(), senarai & butiran 404 (Lab 7.10); Slice 2 borang, validasi & muat naik selamat (Lab 7.11);
   Slice 3 aliran kelulusan (Lab 8.10); Slice 4 RBAC Shield & skop akses (Lab 8.11); Slice 5 ujian akses & sejarah status (Lab 8.12).
   Setiap slice: FR/BR/AC yang dipenuhi, fail CodeIgniter 4.7 yang terlibat, cara uji. Jadual Pas sudah wujud sejak Hari 4: tiada migration baharu.
   Tandakan FR yang tidak masuk mana-mana slice. Jangan tulis kod.
   ```

   Tampal ke `docs/pelan-pas.md` dan edit sendiri: setiap FR dalam satu slice, tiada migration baharu, tiada fail di luar modul Pas. Esok, Lab 7.10 langkah 3 memperincikan bahagian **Slice 1** dalam fail yang sama.

6. **Commit (5 minit).** `/exit`, kemudian:

   ```bash tab="Git Bash / macOS / Linux"
   git status --short          # hanya docs/keperluan-pas.md dan docs/pelan-pas.md
   git add docs/keperluan-pas.md docs/pelan-pas.md
   git commit -m "DOCS: keperluan & pelan slice Pas daripada kajian eSPKP Contoh"
   git push -u origin docs/keperluan-pas
   ```

   ```powershell tab="PowerShell"
   git status --short          # hanya docs/keperluan-pas.md dan docs/pelan-pas.md
   git add docs/keperluan-pas.md docs/pelan-pas.md
   git commit -m "DOCS: keperluan & pelan slice Pas daripada kajian eSPKP Contoh"
   git push -u origin docs/keperluan-pas
   ```

   Buka MR ke `main` dan merge sebelum Lab 7.10 esok, supaya `feat/pas-claude` bermula dengan kedua-dua fail ini.

### ✅ Checkpoint
- [ ] `prd-espkp-pas.md` mengandungi FR, BR dan NFR dengan sumber `fail:baris`, termasuk 404 bukan 403 dan lampiran di luar `public/` (Kuiz S16).
- [ ] Bahagian Pengesahan merekod 3 dakwaan yang disemak terhadap kod **dan** demo langsung (Kuiz S16).
- [ ] `jurang-pas.md` mempunyai sekurang-kurangnya 8 baris dengan keputusan guna / laras / tidak dan sebab (Kuiz S16).
- [ ] `docs/keperluan-pas.md` menggunakan nama SPEC dan BR-PAS-01..06; ciri "tidak" berada dalam Luar skop atau Soalan terbuka (Kuiz S16).
- [ ] `docs/pelan-pas.md` mempunyai 5 slice yang sepadan dengan Lab 7.10, 7.11, 8.10, 8.11, 8.12 dan tiada migration baharu (Kuiz S16).
- [ ] Commit `DOCS: keperluan & pelan slice Pas …` ada pada branch `docs/keperluan-pas`. 🪟 PowerShell: `git log --oneline -3` (Kuiz S16).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Claude tidak boleh membaca `~/latihan/espkpv2-kajian/...` | `claude` dimulakan tanpa `--add-dir` | `/exit`, jalankan semula dengan `--add-dir`, atau taip `/add-dir` dalam sesi |
| `--add-dir ~/latihan/...` tidak dijumpai dalam PowerShell | `~` tidak dikembangkan dalam semua konteks | Guna `$HOME\latihan\espkpv2-kajian` |
| PRD menyalin nama eSPKP (`permohonan`, `StatusPermohonan`) ke `keperluan-pas.md` | Prompt tidak menegaskan nama SPEC | Tolak; ulang peraturan "nama tepat seperti SPEC kursus" dan betulkan sendiri |
| Pelan mencipta migration `CreatePassApplications` | Claude tidak tahu jadual Hari 4 sudah wujud | Buang baris itu; jika perlu, semak dengan `ci4-spark` `migrate_status` |
| Teks tampalan rosak (aksara pelik, baris berganda) | Salin dari terminal mintty dengan pembalut baris | Salin dari terminal VS Code, atau minta Claude memaparkan dalam satu blok markdown |
| `git push` ditolak | Branch belum wujud di remote atau token GitLab tamat | `git push -u origin docs/keperluan-pas`; semak token seperti Hari 2 |

### ⭐ Cabaran tambahan
- Jalankan [AI-18](../docs/pustaka-prompt.md#ai-18--semak-prd) pada `docs/keperluan-pas.md`. Pilih 2 isu dan betulkan sendiri dalam commit `DOCS: …` kedua.

---

## Lab 7.0 — Persediaan (10 minit, awal S1)

1. Branch baharu dari `main` yang terkini:

   ```bash tab="Git Bash / macOS / Linux"
   git switch main && git pull
   git switch -c feat/pas-permohonan
   ```

   ```powershell tab="PowerShell"
   git switch main
   git pull
   git switch -c feat/pas-permohonan
   ```

2. Semak had muat naik PHP dan extension `fileinfo`:

   ```bash tab="Git Bash / macOS / Linux"
   php --ini                                   # lokasi php.ini yang dimuatkan
   php -i | grep -E "upload_max_filesize|post_max_size|max_file_uploads"
   php -m | grep -i fileinfo                   # mesti keluar: fileinfo
   ```

   ```powershell tab="PowerShell"
   php --ini                                   # lokasi php.ini yang dimuatkan
   php -i | Select-String "upload_max_filesize|post_max_size|max_file_uploads"
   php -m | Select-String fileinfo             # mesti keluar: fileinfo
   ```

3. Jika `upload_max_filesize` < `8M` atau `post_max_size` < `16M`, edit `php.ini` (Laragon: *Menu → PHP → php.ini*; lain-lain: `php --ini`):

   ```ini
   upload_max_filesize = 8M
   post_max_size = 16M
   extension=fileinfo
   ```

   Mulakan semula `php spark serve` (atau Apache) selepas mengubah.

4. Semak zon waktu aplikasi dalam `.env` (sepatutnya sudah ditetapkan Hari 4) — tanpanya `Time::today()` menggunakan UTC dan tarikh "hari ini" tersasar sehari antara 00:00–08:00:

   ```ini
   app.appTimezone = 'Asia/Kuala_Lumpur'
   ```

5. Sahkan jadual Hari 4 wujud dan sepadan SPEC §3:

   ```bash
   php spark db:table pass_applications --metadata
   php spark db:table pass_documents --metadata
   ```

**✅ Checkpoint 7.0:** `upload_max_filesize` ≥ 8M, `fileinfo` dimuatkan, kedua-dua jadual wujud dengan medan `stored_path`, `mime`, `size_bytes`, `reviewed_by`, `approved_by`.

---

## Lab 7.1 — Enum, Entity & Model (S1)

### 🎯 Objektif
Menulis `PassType`, `PassStatus`, Entity `PassApplication`, `PassApplicationModel` dan `PassDocumentModel` yang patuh SPEC §2.2 & §3.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- Lab 7.0 selesai. `BookingStatus` dan `SlotBooking` (Hari 5) boleh dirujuk sebagai corak.

### Langkah

1. **Cipta `app/Enums/PassType.php`**. Tiga `case` tepat seperti SPEC: `kenderaan`, `kakitangan`, `kontraktor`, dengan `label()`, `requiresVehicle()`, `values()`, `options()`.

   `app/Enums/PassType.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Enums;

   enum PassType: string
   {
       case Kenderaan  = 'kenderaan';    // pas kenderaan / pelekat
       case Kakitangan = 'kakitangan';   // pas akses kakitangan
       case Kontraktor = 'kontraktor';   // pas kontraktor berjangka

       /** Label BM untuk paparan */
       public function label(): string
       {
           return match ($this) {
               self::Kenderaan  => 'Pas Kenderaan (Pelekat)',
               self::Kakitangan => 'Pas Akses Kakitangan',
               self::Kontraktor => 'Pas Kontraktor Berjangka',
           };
       }

       /**
        * BR-PAS-06: pas kenderaan WAJIB dipautkan kepada kenderaan milik pemohon
        * (pass_applications.vehicle_id). Jenis lain: vehicle_id = NULL.
        */
       public function requiresVehicle(): bool
       {
           return $this === self::Kenderaan;
       }

       /**
        * Nilai mentah untuk in_list[] validasi.
        *
        * @return list<string>
        */
       public static function values(): array
       {
           return array_column(self::cases(), 'value');
       }

       /**
        * Pilihan untuk <select>: nilai => label BM.
        *
        * @return array<string, string>
        */
       public static function options(): array
       {
           $options = [];

           foreach (self::cases() as $case) {
               $options[$case->value] = $case->label();
           }

           return $options;
       }
   }
   ```

2. **Cipta `app/Enums/PassStatus.php`**. Lima `case`: `submitted`, `under_review`, `approved`, `rejected`, `expired`. Sebelum menyalin, lakar `allowedTransitions()` di atas kertas berdasarkan rajah SPEC §2.2, kemudian bandingkan lakaran anda dengan kod di bawah. Kaedah lain: `canTransitionTo()`, `label()`, `badge()`, `isFinal()`, `values()`, `options()`.

   `app/Enums/PassStatus.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Enums;

   enum PassStatus: string
   {
       case Submitted   = 'submitted';
       case UnderReview = 'under_review';
       case Approved    = 'approved';
       case Rejected    = 'rejected';
       case Expired     = 'expired';

       /** Label BM untuk paparan (SPEC §2.2) */
       public function label(): string
       {
           return match ($this) {
               self::Submitted   => 'Dihantar',
               self::UnderReview => 'Dalam Semakan',
               self::Approved    => 'Diluluskan',
               self::Rejected    => 'Ditolak',
               self::Expired     => 'Tamat Tempoh',
           };
       }

       /** Kelas CSS Bootstrap 5.3 untuk badge — corak sama seperti BookingStatus */
       public function badge(): string
       {
           return match ($this) {
               self::Submitted   => 'text-bg-secondary',
               self::UnderReview => 'text-bg-info',
               self::Approved    => 'text-bg-success',
               self::Rejected    => 'text-bg-danger',
               self::Expired     => 'text-bg-dark',
           };
       }

       /**
        * Status seterusnya yang sah dari status semasa.
        *
        * @return list<self>
        */
       public function allowedTransitions(): array
       {
           return match ($this) {
               self::Submitted   => [self::UnderReview],
               self::UnderReview => [self::Approved, self::Rejected],
               self::Approved    => [self::Expired],
               self::Rejected,
               self::Expired     => [],               // status akhir
           };
       }

       /** BR-PAS-01 — satu-satunya pintu untuk menyemak peralihan */
       public function canTransitionTo(self $to): bool
       {
           return in_array($to, $this->allowedTransitions(), true);
       }

       /** true jika tiada lagi peralihan yang mungkin (rejected/expired) */
       public function isFinal(): bool
       {
           return $this->allowedTransitions() === [];
       }

       /**
        * Nilai mentah untuk in_list[] validasi & whereIn().
        *
        * @return list<string>
        */
       public static function values(): array
       {
           return array_column(self::cases(), 'value');
       }

       /**
        * Pilihan untuk <select>: nilai => label BM.
        *
        * @return array<string, string>
        */
       public static function options(): array
       {
           $options = [];

           foreach (self::cases() as $case) {
               $options[$case->value] = $case->label();
           }

           return $options;
       }
   }
   ```

3. **Uji enum dengan segera** menggunakan skrip kecil (tidak di-commit):

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p writable/scratch
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force writable\scratch | Out-Null
   ```

   Dalam VS Code, cipta fail `writable/scratch/enum-check.php` (*File → New File*) dengan kandungan ini:

   ```php
   <?php
   require __DIR__ . '/../../vendor/autoload.php';
   require __DIR__ . '/../../app/Enums/PassStatus.php';
   use App\Enums\PassStatus as S;
   var_dump(S::Submitted->canTransitionTo(S::UnderReview));  // true
   var_dump(S::Submitted->canTransitionTo(S::Approved));     // false  ← BR-PAS-01
   var_dump(S::UnderReview->canTransitionTo(S::Rejected));   // true
   var_dump(S::Rejected->isFinal());                         // true
   echo S::from('under_review')->label(), PHP_EOL;           // Dalam Semakan
   var_dump(S::tryFrom('lulus'));                            // NULL
   ```

   Simpan, kemudian jalankan:

   ```bash
   php writable/scratch/enum-check.php
   ```

4. **Cipta `app/Entities/PassApplication.php`** dengan `$dates`, `$casts` (`'?integer'` untuk FK pilihan), `statusEnum()`, `typeEnum()`, `isOwnedBy()`, `displayStatus()`.

   `app/Entities/PassApplication.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Entities;

   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use CodeIgniter\Entity\Entity;
   use CodeIgniter\I18n\Time;

   class PassApplication extends Entity
   {
       /** Medan ini ditukar kepada CodeIgniter\I18n\Time secara automatik */
       protected $dates = [
           'valid_from',
           'valid_until',
           'reviewed_at',
           'approved_at',
           'created_at',
           'updated_at',
       ];

       /** '?integer' = boleh NULL (FK pilihan) */
       protected $casts = [
           'id'          => 'integer',
           'user_id'     => 'integer',
           'vehicle_id'  => '?integer',
           'reviewed_by' => '?integer',
           'approved_by' => '?integer',
       ];

       /** Status sebagai enum — ValueError jika DB mengandungi nilai asing (petanda data rosak) */
       public function statusEnum(): PassStatus
       {
           return PassStatus::from((string) $this->attributes['status']);
       }

       public function typeEnum(): PassType
       {
           return PassType::from((string) $this->attributes['pass_type']);
       }

       /** BR-PAS-04 — asas semakan pemilikan */
       public function isOwnedBy(int $userId): bool
       {
           return (int) $this->attributes['user_id'] === $userId;
       }

       /**
        * SPEC §2.2: expired ditetapkan oleh sistem "(Spark command / semasa papar)".
        * Semasa papar: pas approved yang valid_until sudah lepas dipaparkan sebagai Tamat Tempoh,
        * walaupun Spark `pas:expire` belum dijalankan. Nilai DB TIDAK diubah di sini.
        */
       public function displayStatus(): PassStatus
       {
           $status     = $this->statusEnum();
           $validUntil = $this->valid_until;   // Time (lihat $dates)

           if ($status === PassStatus::Approved
               && $validUntil instanceof Time
               && $validUntil->isBefore(Time::today())) {
               return PassStatus::Expired;
           }

           return $status;
       }
   }
   ```

5. **Cipta `app/Models/PassApplicationModel.php`**:
   - `$returnType = PassApplication::class`, `$useTimestamps = true`, `$useSoftDeletes = false`.
   - `$allowedFields` — 12 medan (semua kecuali `id`, `created_at`, `updated_at`).
   - `$validationRules` diisi dalam `initialize()` (kerana `implode()` enum).
   - Skop `ownedBy()`, `withStatus()`, `withApplicant()`.

   `app/Models/PassApplicationModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use CodeIgniter\Model;

   class PassApplicationModel extends Model
   {
       protected $table          = 'pass_applications';
       protected $primaryKey     = 'id';
       protected $returnType     = PassApplication::class;
       protected $useSoftDeletes = false;          // SPEC §3: tiada deleted_at untuk jadual ini
       protected $useTimestamps  = true;           // isi created_at / updated_at automatik
       protected $dateFormat     = 'datetime';

       /** Senarai putih medan — cegah mass assignment (cth pemohon hantar status=approved) */
       protected $allowedFields = [
           'ref_no',
           'user_id',
           'pass_type',
           'vehicle_id',
           'purpose',
           'valid_from',
           'valid_until',
           'status',
           'reviewed_by',
           'reviewed_at',
           'approved_by',
           'approved_at',
       ];

       /** Diisi dalam initialize() kerana in_list[] dibina dari enum (bukan ungkapan pemalar) */
       protected $validationRules = [];

       protected $validationMessages = [
           'purpose' => [
               'min_length' => 'Tujuan permohonan mestilah sekurang-kurangnya 10 aksara.',
           ],
       ];

       /** Semasa update separa, hanya medan yang dihantar divalidasi (lalai CI4 = true) */
       protected $cleanValidationRules = true;

       protected function initialize(): void
       {
           $this->validationRules = [
               'ref_no'      => 'required|max_length[20]|is_unique[pass_applications.ref_no]',
               'user_id'     => 'required|is_natural_no_zero',
               'pass_type'   => 'required|in_list[' . implode(',', PassType::values()) . ']',
               'vehicle_id'  => 'permit_empty|is_natural_no_zero',
               'purpose'     => 'required|min_length[10]|max_length[2000]',
               'valid_from'  => 'required|valid_date[Y-m-d]',
               'valid_until' => 'required|valid_date[Y-m-d]',
               'status'      => 'required|in_list[' . implode(',', PassStatus::values()) . ']',
           ];
       }

       // -----------------------------------------------------------------
       // Skop query — dipanggil secara berantai, cth:
       //   $model->ownedBy($uid)->withStatus($s)->orderBy(...)->paginate(10)
       // Model::__call() memajukan where()/join() kepada Query Builder dan pulang $this.
       // -----------------------------------------------------------------

       /** BR-PAS-04: senarai pemohon — HANYA rekod miliknya */
       public function ownedBy(int $userId): static
       {
           $this->where('pass_applications.user_id', $userId);

           return $this;
       }

       /** Penapis status pilihan (null = semua) */
       public function withStatus(?PassStatus $status): static
       {
           if ($status !== null) {
               $this->where('pass_applications.status', $status->value);
           }

           return $this;
       }

       /** Sertakan nama pemohon (untuk senarai semakan pegawai) */
       public function withApplicant(): static
       {
           $this->select('pass_applications.*, users.full_name AS applicant_name')
               ->join('users', 'users.id = pass_applications.user_id');

           return $this;
       }
   }
   ```

6. **Cipta `app/Models/PassDocumentModel.php`** (`$returnType = 'array'`, rule `mime` `in_list[application/pdf,image/jpeg,image/png]`, `size_bytes` `less_than_equal_to[2097152]`, kaedah `forApplication()`).

   `app/Models/PassDocumentModel.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Models;

   use CodeIgniter\Model;

   class PassDocumentModel extends Model
   {
       protected $table          = 'pass_documents';
       protected $primaryKey     = 'id';
       protected $returnType     = 'array';
       protected $useSoftDeletes = false;
       protected $useTimestamps  = true;
       protected $dateFormat     = 'datetime';

       protected $allowedFields = [
           'application_id',
           'doc_type',
           'original_name',
           'stored_path',     // RELATIF kepada WRITEPATH, cth uploads/pas/1727251200_3f2a9c1e7b.pdf
           'mime',            // dari getMimeType() (kandungan), BUKAN getClientMimeType()
           'size_bytes',
       ];

       protected $validationRules = [
           'application_id' => 'required|is_natural_no_zero',
           'doc_type'       => 'required|max_length[30]',
           'original_name'  => 'required|max_length[255]',
           'stored_path'    => 'required|max_length[255]',
           'mime'           => 'required|in_list[application/pdf,image/jpeg,image/png]',
           'size_bytes'     => 'required|is_natural_no_zero|less_than_equal_to[2097152]',  // 2 MB (BR-PAS-02)
       ];

       /**
        * Dokumen bagi satu permohonan.
        *
        * @return list<array<string, mixed>>
        */
       public function forApplication(int $applicationId): array
       {
           return $this->where('application_id', $applicationId)
               ->orderBy('id', 'ASC')
               ->findAll();
       }
   }
   ```

7. **Uji validasi Model** melalui route sementara (buang selepas checkpoint). Tambah dalam `app/Config/Routes.php`:

   ```php
   // SEMENTARA — buang selepas Checkpoint 7.1
   $routes->get('cuba-model-pas', static function () {
       $model = model(\App\Models\PassApplicationModel::class);
       $ok = $model->insert([
           'ref_no' => 'PAS-TEST-0001', 'user_id' => 1, 'pass_type' => 'vip',
           'purpose' => 'pendek', 'valid_from' => '2026-13-01', 'valid_until' => '2026-12-31',
           'status' => 'submitted',
       ]);
       return service('response')->setJSON(['ok' => $ok, 'errors' => $model->errors()]);
   });
   ```

   Buka `http://localhost:8080/cuba-model-pas`.

### ✅ Checkpoint 7.1
- [ ] Skrip enum mencetak `bool(true)`, `bool(false)`, `bool(true)`, `bool(true)`, `Dalam Semakan`, `NULL` (Kuiz S1).
- [ ] `/cuba-model-pas` memulangkan `"ok": false` dengan ralat untuk **`pass_type`**, **`purpose`** dan **`valid_from`** (3 ralat) (Kuiz S1).
- [ ] Route sementara **dibuang** dan `writable/scratch/` tidak di-commit (Kuiz S1).
- [ ] Commit: `git add app/ && git commit -m "PAS: enum PassType/PassStatus, entity & model permohonan"` (Kuiz S1)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Fatal error: Constant expression contains invalid operations` | `implode()` dalam nilai lalai `$validationRules` | Isi dalam `protected function initialize(): void` |
| `UnhandledMatchError` dalam `label()` | `case` baharu tanpa cabang `match` | Tambah cabang; ini ciri keselamatan, bukan pepijat |
| `Class "App\Enums\PassStatus" not found` | Nama fail/namespace tidak sepadan (cth `app/enums/`) | Folder `app/Enums/` (E besar), `namespace App\Enums;`. 🪟 Windows tidak membezakan huruf besar/kecil, jadi `app/enums` berfungsi di laptop tetapi gagal di server Linux dan di laptop macOS rakan sekerja. Betulkan melalui Git: `git mv app/enums app/Enums-tmp && git mv app/Enums-tmp app/Enums`; PowerShell: jalankan dua arahan `git mv` itu satu demi satu |
| `ValueError: "Approved" is not a valid backing value` | `PassStatus::from('Approved')` — nilai DB ialah huruf kecil | Guna `->value` semasa simpan; `from()` hanya untuk data DB |
| `/cuba-model-pas` → `"ok": 5` (berjaya!) | `$validationRules` kosong — `initialize()` tidak dipanggil / tersalah nama | Nama tepat `initialize`, keterlihatan `protected` |

### ⭐ Cabaran tambahan
- Tambah `PassStatus::forRole(string $group): array` yang memulangkan status yang relevan untuk baris gilir setiap peranan. Adakah ini patut dalam enum atau Service? Bincang dengan jurulatih atau rakan sebelah.
- Tulis ujian PHPUnit unit `tests/unit/Enums/PassStatusTest.php` dengan atribut `#[DataProvider]` untuk **semua 25** pasangan (5×5) `canTransitionTo()`.

---

## Lab 7.2 — Laluan, Service & Paparan Senarai/Butiran (S2)

### 🎯 Objektif
Membina `/pas/permohonan` (senarai skop pemilik, filter status, pagination) dan `/pas/permohonan/{id}` yang memulangkan 404 kepada bukan pemilik (BR-PAS-04).

### Prasyarat
- Lab 7.1 selesai. Log masuk sebagai `pemohon1@latihan.test` / `Latihan@2026` berfungsi.

### Langkah

1. **Tambah route** dalam `app/Config/Routes.php` (selepas `service('auth')->routes($routes);`):

   ```php
   $routes->group('pas/permohonan', ['namespace' => 'App\Controllers\Pas', 'filter' => 'session'], static function ($routes): void {
       $routes->get('/', 'ApplicationController::index', ['as' => 'pas.index']);
       $routes->get('new', 'ApplicationController::new', ['as' => 'pas.new']);
       $routes->post('/', 'ApplicationController::create', ['as' => 'pas.create']);
       $routes->get('(:num)', 'ApplicationController::show/$1', ['as' => 'pas.show']);
       $routes->get('dokumen/(:num)', 'ApplicationController::download/$1', ['as' => 'pas.dokumen']);
   });
   ```

   Sahkan: `php spark routes | grep pas` (PowerShell: `php spark routes | Select-String pas`) — 5 baris, lajur filter menunjukkan `session`.

2. **Cipta `app/Services/PassWorkflowService.php`** — versi awal dengan konstruktor dan `canView()` sahaja:

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use App\Entities\PassApplication;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use App\Models\StatusLogModel;
   use CodeIgniter\Database\ConnectionInterface;
   use CodeIgniter\Shield\Entities\User;

   class PassWorkflowService
   {
       public const MODULE       = 'PAS';
       public const STAFF_GROUPS = ['reviewer', 'approver', 'admin'];

       private readonly PassApplicationModel $applications;
       private readonly PassDocumentModel $documents;
       private readonly StatusLogModel $statusLogs;

       public function __construct(
           private readonly ConnectionInterface $db,
           private readonly ReferenceNumberService $refs,
       ) {
           $this->applications = new PassApplicationModel($db);
           $this->documents    = new PassDocumentModel($db);
           $this->statusLogs   = new StatusLogModel($db);
       }

       /** BR-PAS-04 — pemilik, atau pegawai */
       public function canView(User $user, PassApplication $application): bool
       {
           return $application->isOwnedBy((int) $user->id)
               || $user->inGroup(...self::STAFF_GROUPS);
       }
   }
   ```

3. **Daftar Service** dalam `app/Config/Services.php` (di sebelah `bookingService` Hari 6):

   ```php
   public static function passWorkflowService(bool $getShared = true): \App\Services\PassWorkflowService
   {
       if ($getShared) {
           return static::getSharedInstance('passWorkflowService');
       }

       return new \App\Services\PassWorkflowService(
           db_connect(),
           new \App\Services\ReferenceNumberService(db_connect()),
       );
   }
   ```

4. **Cipta `app/Controllers/Pas/ApplicationController.php`** dengan `index()`, `show()` dan pembantu `findVisibleOr404()`. Untuk hari ini, `show()` memulangkan **dua** variable sahaja (`application` dan `documents`):

   `app/Controllers/Pas/ApplicationController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Pas;

   use App\Controllers\BaseController;
   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use CodeIgniter\Exceptions\PageNotFoundException;

   class ApplicationController extends BaseController
   {
       protected $helpers = ['form', 'url'];

       /** GET /pas/permohonan — "Permohonan Saya" (BR-PAS-04: SENTIASA skop pemilik) */
       public function index(): string
       {
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');   // input asing → null

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
           ]);
       }

       /** GET /pas/permohonan/{id} — butiran + dokumen (tindakan & sejarah ditambah Hari 8) */
       public function show(string $id): string
       {
           $application = $this->findVisibleOr404((int) $id);

           return view('pas/show', [
               'application' => $application,
               'documents'   => model(PassDocumentModel::class)->forApplication($application->id),
           ]);
       }

       // -----------------------------------------------------------------

       /** BR-PAS-04 — 404 (bukan 403) supaya kewujudan ID orang lain tidak didedahkan */
       private function findVisibleOr404(int $id): PassApplication
       {
           $application = model(PassApplicationModel::class)->find($id);

           if ($application === null || ! service('passWorkflowService')->canView(auth()->user(), $application)) {
               throw PageNotFoundException::forPageNotFound();
           }

           return $application;
       }
   }
   ```

   (`history` dan `actions` ditambah esok, Hari 8.)

5. **Tajuk halaman, kemudian `app/Views/pas/index.php`.** View Pas memberi tajuk melalui `section('title')`, tetapi layout Hari 4/6 hanya membaca `$title`. Gantikan dahulu seluruh kandungan `app/Views/layouts/main.php` dengan versi di bawah. Ia layout Hari 6 dengan tiga tambahan: blok `$sectionTitle`/`$pageTitle` di bahagian atas, `<title>` yang membaca `$pageTitle`, dan menu *Pas Saya*.

   `app/Views/layouts/main.php`

   ```php
   <?php
   /**
    * Layout utama — Bootstrap 5.3 + Bootstrap Icons.
    * Guna dalam view: <?= $this->extend('layouts/main') ?> + <?= $this->section('content') ?> ... <?= $this->endSection() ?>
    *
    * @var \CodeIgniter\View\View $this
    * @var string|null            $title
    */
   $user = auth()->loggedIn() ? auth()->user() : null;

   // View Pas (Hari 7–8) memberi tajuk melalui section('title'); view TLK melalui $title.
   $sectionTitle = trim($this->renderSection('title'));
   $pageTitle    = $title ?? ($sectionTitle !== '' ? $sectionTitle : 'Sistem TLK & Pas');
   ?>
   <!doctype html>
   <html lang="ms">
   <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title><?= esc($pageTitle) ?> · KKM (Latihan)</title>
       <!-- Tiada internet di makmal? Muat turun fail ke public/assets/ dan tukar href kepada base_url('assets/...') -->
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
       <?= $this->renderSection('head') ?>
   </head>
   <body class="bg-body-tertiary d-flex flex-column min-vh-100">

   <nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
       <div class="container">
           <a class="navbar-brand fw-semibold" href="<?= site_url('/') ?>">
               <i class="bi bi-p-square-fill"></i> TLK &amp; Pas
           </a>
           <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navUtama"
                   aria-controls="navUtama" aria-expanded="false" aria-label="Menu">
               <span class="navbar-toggler-icon"></span>
           </button>

           <div class="collapse navbar-collapse" id="navUtama">
               <?php if ($user !== null): ?>
                   <ul class="navbar-nav me-auto">
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.index') ?>"><i class="bi bi-list-ul"></i> Tempahan Saya</a></li>
                       <?php if ($user->can('tlk.apply')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.new') ?>"><i class="bi bi-plus-circle"></i> Mohon Slot</a></li>
                       <?php endif ?>
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.availability') ?>"><i class="bi bi-search"></i> Slot Kosong</a></li>
                       <?php if ($user->can('tlk.decide')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('tlk.decision.index') ?>"><i class="bi bi-check2-square"></i> Keputusan TLK</a></li>
                       <?php endif ?>
                       <?php if ($user->inGroup('admin')): ?>
                           <li class="nav-item"><a class="nav-link" href="<?= url_to('admin.slot.index') ?>"><i class="bi bi-gear"></i> Urus Slot</a></li>
                       <?php endif ?>
                       <li class="nav-item"><a class="nav-link" href="<?= url_to('pas.index') ?>"><i class="bi bi-person-vcard"></i> Pas Saya</a></li>
                   </ul>
                   <span class="navbar-text me-3">
                       <i class="bi bi-person-circle"></i> <?= esc($user->full_name ?? $user->username) ?>
                   </span>
                   <a class="btn btn-outline-light btn-sm" href="<?= url_to('logout') ?>"><i class="bi bi-box-arrow-right"></i> Log Keluar</a>
               <?php endif ?>
           </div>
       </div>
   </nav>

   <main class="container py-4 flex-grow-1">
       <?php if (! empty($title)): ?>
           <h1 class="h3 mb-3"><?= esc($title) ?></h1>
       <?php endif ?>

       <?= $this->include('partials/flash') ?>

       <?= $this->renderSection('content') ?>
   </main>

   <footer class="py-3 border-top bg-white small text-muted">
       <div class="container">Sistem latihan CI-KKM-10 · data sintetik sahaja</div>
   </footer>

   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
   <script>
       // Dialog pengesahan: <form data-confirm="Anda pasti?"> — elak klik tidak sengaja.
       document.querySelectorAll('form[data-confirm]').forEach(function (form) {
           form.addEventListener('submit', function (event) {
               if (!window.confirm(form.dataset.confirm)) {
                   event.preventDefault();
               }
           });
       });
   </script>
   <?= $this->renderSection('scripts') ?>
   </body>
   </html>
   ```

   Kemudian cipta `app/Views/pas/index.php`:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan Pas Saya<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <div class="d-flex justify-content-between align-items-center mb-3">
       <h1 class="h3 mb-0">Permohonan Pas Saya</h1>
       <a href="<?= url_to('pas.new') ?>" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Mohon Pas</a>
   </div>

   <form method="get" class="row g-2 mb-3" role="search">
       <div class="col-auto">
           <label for="status" class="visually-hidden">Status</label>
           <select name="status" id="status" class="form-select">
               <option value="">Semua status</option>
               <?php foreach (\App\Enums\PassStatus::cases() as $case): ?>
                   <option value="<?= esc($case->value, 'attr') ?>" <?= $status === $case ? 'selected' : '' ?>>
                       <?= esc($case->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
       </div>
       <div class="col-auto"><button type="submit" class="btn btn-outline-secondary">Tapis</button></div>
   </form>

   <?php if ($applications === []): ?>
       <div class="alert alert-info">Tiada permohonan untuk dipaparkan.</div>
   <?php else: ?>
       <div class="table-responsive">
           <table class="table table-hover align-middle">
               <thead>
                   <tr><th>No. Rujukan</th><th>Jenis</th><th>Tempoh Sah</th><th>Status</th><th>Tarikh Mohon</th><th></th></tr>
               </thead>
               <tbody>
               <?php foreach ($applications as $app): ?>
                   <?php $shown = $app->displayStatus(); ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($app->ref_no) ?></td>
                       <td><?= esc($app->typeEnum()->label()) ?></td>
                       <td><?= esc($app->valid_from->format('d/m/Y')) ?> – <?= esc($app->valid_until->format('d/m/Y')) ?></td>
                       <td><span class="badge <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span></td>
                       <td><?= esc($app->created_at->format('d/m/Y')) ?></td>
                       <td><a href="<?= url_to('pas.show', $app->id) ?>" class="btn btn-sm btn-outline-primary">Lihat</a></td>
                   </tr>
               <?php endforeach ?>
               </tbody>
           </table>
       </div>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```

6. **Cipta `app/Views/pas/show.php`** (versi Hari 7):

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan <?= esc($application->ref_no) ?><?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <?php $shown = $application->displayStatus(); ?>

   <div class="d-flex justify-content-between align-items-center mb-3">
       <h1 class="h3 mb-0">Permohonan <?= esc($application->ref_no) ?></h1>
       <span class="badge fs-6 <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span>
   </div>

   <dl class="row">
       <dt class="col-sm-3">Jenis pas</dt>
       <dd class="col-sm-9"><?= esc($application->typeEnum()->label()) ?></dd>

       <dt class="col-sm-3">Tujuan</dt>
       <dd class="col-sm-9"><?= nl2br(esc($application->purpose)) ?></dd>

       <dt class="col-sm-3">Tempoh sah</dt>
       <dd class="col-sm-9">
           <?= esc($application->valid_from->format('d/m/Y')) ?> hingga <?= esc($application->valid_until->format('d/m/Y')) ?>
       </dd>

       <dt class="col-sm-3">Tarikh mohon</dt>
       <dd class="col-sm-9"><?= esc($application->created_at->format('d/m/Y H:i')) ?></dd>
   </dl>

   <h2 class="h5">Dokumen Sokongan</h2>
   <ul class="list-group mb-4">
       <?php foreach ($documents as $doc): ?>
           <li class="list-group-item d-flex justify-content-between align-items-center">
               <span>
                   <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
                   <?= esc($doc['original_name']) ?>
                   <small class="text-body-secondary">(<?= esc(number_format($doc['size_bytes'] / 1024)) ?> KB)</small>
               </span>
               <a class="btn btn-sm btn-outline-secondary" href="<?= url_to('pas.dokumen', $doc['id']) ?>">
                   <i class="bi bi-download" aria-hidden="true"></i> Muat turun
               </a>
           </li>
       <?php endforeach ?>
   </ul>

   <?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>

   <a href="<?= url_to('pas.index') ?>" class="btn btn-link px-0">&larr; Kembali ke senarai</a>
   <?= $this->endSection() ?>
   ```

   `nl2br(esc(...))` — **escape dahulu**, kemudian tukar baris baharu kepada `<br>`. Jika terbalik, `<br>` sendiri akan di-escape dan `<script>` pengguna tidak.

7. **Data ujian sementara** — sebelum borang wujud (Lab 7.3), masukkan dua rekod terus melalui MySQL untuk menguji senarai & pemilikan. Dapatkan ID pengguna dahulu:

   ```sql
   SELECT u.id, i.secret AS email FROM users u
   JOIN auth_identities i ON i.user_id = u.id AND i.type = 'email_password';

   -- gantikan 2 dan 3 dengan id pemohon1 dan pemohon2
   INSERT INTO pass_applications (ref_no, user_id, pass_type, purpose, valid_from, valid_until, status, created_at, updated_at) VALUES
   ('PAS-2026-9001', 2, 'kakitangan', 'Akses Blok Pentadbiran (sintetik)', '2026-10-01', '2026-12-31', 'submitted', NOW(), NOW()),
   ('PAS-2026-9002', 3, 'kontraktor', 'Kerja penyelenggaraan lif (sintetik)', '2026-10-01', '2026-10-31', 'submitted', NOW(), NOW());
   ```

8. Uji sebagai `pemohon1`, kemudian log keluar dan uji sebagai `pemohon2`.

### ✅ Checkpoint 7.2
- [ ] `pemohon1` di `/pas/permohonan` nampak **PAS-2026-9001 sahaja**; `pemohon2` nampak **PAS-2026-9002 sahaja** (Kuiz S2).
- [ ] `/pas/permohonan?status=xyz` tidak ralat (senarai penuh dipapar); `?status=submitted` menapis (Kuiz S2).
- [ ] `pemohon2` membuka `/pas/permohonan/{id PAS-2026-9001}` → **404** (Kuiz S2).
- [ ] Log masuk `penyemak@latihan.test` membuka ID yang sama → **200** (pegawai lihat semua) (Kuiz S2).
- [ ] Keluar (log out) dan buka `/pas/permohonan` → redirect ke `/login` (Kuiz S2).
- [ ] Commit: `git add app/ && git commit -m "PAS: senarai skop pemilik & paparan butiran (BR-PAS-04)"` (Kuiz S2)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Call to undefined method CodeIgniter\Config\Services::passWorkflowService()` | Kaedah didaftar di fail/kelas salah | Mesti dalam `app/Config/Services.php`, kelas `Config\Services`, `public static` |
| `Call to a member function format() on null` | Medan tarikh tiada dalam `$dates` Entity, atau data NULL | Semak `$dates`; data ujian mesti ada `valid_from`/`valid_until` |
| `Column 'user_id' in where clause is ambiguous` | `where('user_id')` bersama `join()` | `where('pass_applications.user_id', …)` |
| Senarai kosong untuk semua orang | `auth()->id()` null — filter `session` tiada pada kumpulan | Tambah `'filter' => 'session'` pada `group()` |
| `Controller or its method is not found: \App\Controllers\ApplicationController::index` | Lupa `'namespace' => 'App\Controllers\Pas'` pada kumpulan | Tambah `namespace`, atau guna `'Pas\ApplicationController::index'` |
| Flash message tidak kelihatan | Layout tidak memasukkan `partials/flash` | Semak `layouts/main.php` memanggil `$this->include('partials/flash')` dan `partials/flash.php` (Lab 4/6) memaparkan `session('message')`/`session('error')` |

### ⭐ Cabaran tambahan
- Paparkan nombor plat kenderaan dalam butiran bagi pas kenderaan (join `vehicles` dalam Model, bukan dalam view).
- Tambah kiraan per status di atas senarai ("Dihantar: 2 · Diluluskan: 1") menggunakan satu query `groupBy('status')`.

---

## Lab 7.3 — Borang, Validasi, Muat Naik & Muat Turun (S3)

### 🎯 Objektif
Membina borang permohonan dengan 1–3 dokumen yang disimpan secara selamat (BR-PAS-02), nombor rujukan `PAS-2026-000N`, log `status_logs`, dan muat turun melalui controller.

### Prasyarat
- Lab 7.2 selesai. `ReferenceNumberService` dan `StatusLogModel::record()` dari Hari 4–6 berfungsi.
- `VehicleModel` wujud dan `pemohon1` mempunyai sekurang-kurangnya satu kenderaan sintetik (cth `WXX 1234`).

### Langkah

1. **Kembangkan `PassWorkflowService` kepada versi Hari 7** — gantikan seluruh kandungan `app/Services/PassWorkflowService.php` dengan kod di bawah. Berbanding Lab 7.2, ia menambah:
   - pemalar `UPLOAD_DIR`, `MAX_FILES`, `MAX_BYTES`, `ALLOWED_EXT`
   - `submit()` — semakan → `move()` → transaksi → `status_logs` → pembersihan dalam `catch`
   - `documentPath()` — `realpath()` + semakan awalan
   - pembantu peribadi `assertDates()`, `assertVehicle()`, `assertFiles()`, `storeFile()`, `deleteStoredFiles()`

   `app/Services/PassWorkflowService.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Services;

   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use App\Models\StatusLogModel;
   use App\Models\VehicleModel;
   use CodeIgniter\Database\ConnectionInterface;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\Files\UploadedFile;
   use CodeIgniter\Shield\Entities\User;
   use InvalidArgumentException;
   use RuntimeException;
   use Throwable;

   class PassWorkflowService
   {
       public const MODULE        = 'PAS';            // status_logs.module
       public const UPLOAD_DIR    = 'uploads/pas/';   // relatif kepada WRITEPATH (BR-PAS-02)
       public const MAX_FILES     = 3;                // BR-PAS-02
       public const MAX_BYTES     = 2_097_152;        // BR-PAS-02: 2 MB setiap fail
       public const ALLOWED_EXT   = ['pdf', 'jpg', 'png'];
       public const STAFF_GROUPS  = ['reviewer', 'approver', 'admin'];

       private readonly PassApplicationModel $applications;
       private readonly PassDocumentModel $documents;
       private readonly StatusLogModel $statusLogs;

       public function __construct(
           private readonly ConnectionInterface $db,
           private readonly ReferenceNumberService $refs,
       ) {
           // Model dibina dengan sambungan YANG SAMA → semua tulisan berada dalam transaksi yang sama
           $this->applications = new PassApplicationModel($db);
           $this->documents    = new PassDocumentModel($db);
           $this->statusLogs   = new StatusLogModel($db);
       }

       // =================================================================
       // HARI 7 — cipta permohonan (null → submitted)
       // =================================================================

       /**
        * @param array{pass_type:string, vehicle_id?:int|string|null, purpose:string, valid_from:string, valid_until:string} $data
        * @param list<UploadedFile> $files fail yang SUDAH lulus rules validasi controller
        *
        * @throws InvalidArgumentException ralat perniagaan — mesej BM, selamat dipapar kepada pengguna
        */
       public function submit(int $userId, array $data, array $files): PassApplication
       {
           $type      = PassType::from((string) $data['pass_type']);
           $vehicleId = empty($data['vehicle_id']) ? null : (int) $data['vehicle_id'];

           // --- Semakan perniagaan SEBELUM menyentuh cakera atau DB --------------
           // BR-PAS-06
           $this->assertDates((string) $data['valid_from'], (string) $data['valid_until']);
           $this->assertVehicle($type, $vehicleId, $userId);
           $this->assertFiles($files);

           $stored        = [];
           $inTransaction = false;

           try {
               // 1) Pindah fail dahulu. Fail sistem TIDAK ikut rollback DB — kita bersihkan sendiri di catch.
               foreach ($files as $file) {
                   $stored[] = $this->storeFile($file);
               }

               // 2) Semua tulisan DB dalam SATU transaksi: permohonan + dokumen + log
               $this->db->transException(true)->transBegin();   // ralat query → exception
               $inTransaction = true;

               $refNo = $this->refs->next('PAS');   // PAS-2026-0001 — mesti dalam transaksi (FOR UPDATE)

               $id = $this->applications->insert([
                   'ref_no'      => $refNo,
                   'user_id'     => $userId,
                   'pass_type'   => $type->value,
                   'vehicle_id'  => $type->requiresVehicle() ? $vehicleId : null,
                   'purpose'     => trim((string) $data['purpose']),
                   'valid_from'  => (string) $data['valid_from'],
                   'valid_until' => (string) $data['valid_until'],
                   'status'      => PassStatus::Submitted->value,   // BUKAN dari input pengguna
               ], true);

               if ($id === false) {
                   throw new RuntimeException('Gagal menyimpan permohonan: ' . implode(' ', $this->applications->errors()));
               }

               foreach ($stored as $doc) {
                   if ($this->documents->insert($doc + ['application_id' => (int) $id]) === false) {
                       throw new RuntimeException('Gagal menyimpan dokumen: ' . implode(' ', $this->documents->errors()));
                   }
               }

               // BR-PAS-05: log penciptaan (from_status = NULL)
               if (! $this->statusLogs->record(self::MODULE, (int) $id, null, PassStatus::Submitted->value, $userId, 'Permohonan dihantar.')) {
                   throw new RuntimeException('Gagal merekod log status.');
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               if ($inTransaction) {
                   $this->db->transRollback();
               }
               $this->deleteStoredFiles($stored);   // tiada fail "yatim" di cakera

               throw $e;
           }

           return $this->applications->find((int) $id);
       }

       /**
        * BR-PAS-04 — siapa boleh LIHAT permohonan (dan dokumennya).
        * Pemilik, atau pegawai (reviewer/approver/admin).
        */
       public function canView(User $user, PassApplication $application): bool
       {
           return $application->isOwnedBy((int) $user->id)
               || $user->inGroup(...self::STAFF_GROUPS);
       }

       /**
        * Path mutlak dokumen yang selamat untuk dimuat turun.
        * Pertahanan path traversal: path sebenar MESTI berada di dalam writable/uploads/pas/.
        *
        * @param array<string, mixed> $document baris pass_documents
        */
       public function documentPath(array $document): string
       {
           $base = realpath(WRITEPATH . self::UPLOAD_DIR);
           $path = realpath(WRITEPATH . (string) $document['stored_path']);

           if ($base === false || $path === false || ! is_file($path)
               || ! str_starts_with($path, $base . DIRECTORY_SEPARATOR)) {
               throw PageNotFoundException::forPageNotFound('Dokumen tidak dijumpai.');
           }

           return $path;
       }

       // =================================================================
       // Dalaman
       // =================================================================

       /** BR-PAS-06: valid_until >= valid_from (tiada had tempoh maksimum untuk Pas) */
       private function assertDates(string $from, string $until): void
       {
           if ($until < $from) {   // format Y-m-d → perbandingan string = perbandingan tarikh
               throw new InvalidArgumentException('Tarikh "Sah hingga" mesti sama atau selepas "Sah dari".');
           }
       }

       /** BR-PAS-06: pas kenderaan → kenderaan wajib DAN mesti milik pemohon (cegah IDOR melalui medan borang) */
       private function assertVehicle(PassType $type, ?int $vehicleId, int $userId): void
       {
           if (! $type->requiresVehicle()) {
               return;
           }

           $owned = $vehicleId !== null && model(VehicleModel::class)
               ->where('id', $vehicleId)
               ->where('user_id', $userId)
               ->countAllResults() === 1;

           if (! $owned) {
               throw new InvalidArgumentException('Sila pilih kenderaan anda yang berdaftar untuk pas kenderaan.');
           }
       }

       /** @param list<UploadedFile> $files */
       private function assertFiles(array $files): void
       {
           if ($files === [] || count($files) > self::MAX_FILES) {
               throw new InvalidArgumentException('Sila lampirkan 1 hingga 3 dokumen sokongan.');
           }

           foreach ($files as $file) {
               // guessExtension() diterbitkan dari MIME sebenar (finfo) — lapisan kedua selepas ext_in/mime_in.
               // Sambungan nama fail MESTI sama dengan kandungan (cth PNG bernama .pdf ditolak).
               $guessed = $file->guessExtension();

               if (! $file->isValid()
                   || ! in_array($guessed, self::ALLOWED_EXT, true)
                   || strtolower($file->getClientExtension()) !== $guessed) {
                   throw new InvalidArgumentException('Dokumen tidak sah. Hanya PDF, JPG atau PNG dibenarkan.');
               }

               if ((int) $file->getSize() > self::MAX_BYTES) {
                   throw new InvalidArgumentException('Setiap fail mestilah tidak melebihi 2 MB.');
               }
           }
       }

       /**
        * @return array{doc_type:string, original_name:string, mime:string, size_bytes:int, stored_path:string}
        */
       private function storeFile(UploadedFile $file): array
       {
           // Baca metadata SEBELUM move() — selepas dipindah, fail sementara sudah tiada
           $meta = [
               'doc_type'      => 'sokongan',
               'original_name' => mb_substr($file->getClientName(), 0, 255),   // untuk paparan SAHAJA
               'mime'          => $file->getMimeType(),                         // dari kandungan (finfo)
               'size_bytes'    => (int) $file->getSize(),
           ];

           $newName = $file->getRandomName();                 // cth 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
           $file->move(WRITEPATH . self::UPLOAD_DIR, $newName); // HTTPException jika gagal

           return $meta + ['stored_path' => self::UPLOAD_DIR . $newName];
       }

       /** @param list<array{stored_path:string}> $stored */
       private function deleteStoredFiles(array $stored): void
       {
           foreach ($stored as $doc) {
               $path = WRITEPATH . $doc['stored_path'];

               if (is_file($path)) {
                   unlink($path);
               }
           }
       }
   }
   ```

   Semua `use` yang diperlukan sudah disertakan (`PassStatus`, `PassType`, `VehicleModel`, `UploadedFile`, `PageNotFoundException`, `InvalidArgumentException`, `RuntimeException`, `Throwable`). Kaedah Hari 8 (`startReview`, `approve`, `reject`, `transition`) **belum** ada — ia ditambah esok.

   Sebelum meneruskan, terangkan dengan lisan kepada jurulatih atau rakan sebelah: *"Kenapa fail dipindah SEBELUM `transBegin()`, dan apa yang berlaku kepada fail jika `record()` gagal?"*

2. **Tambah `new()`, `create()`, `download()`, `rules()`, `uploadedFiles()`** dalam `ApplicationController` — gantikan seluruh kandungan fail dengan versi lengkap Hari 7 di bawah. `index()` kekal seperti Lab 7.2b (filter jenis + carian); `show()`, `findVisibleOr404()` dan `protected $helpers = ['form', 'url'];` kekal seperti Lab 7.2.

   `app/Controllers/Pas/ApplicationController.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace App\Controllers\Pas;

   use App\Controllers\BaseController;
   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use App\Models\PassApplicationModel;
   use App\Models\PassDocumentModel;
   use App\Models\VehicleModel;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\HTTP\DownloadResponse;
   use CodeIgniter\HTTP\Files\UploadedFile;
   use CodeIgniter\HTTP\RedirectResponse;
   use InvalidArgumentException;

   class ApplicationController extends BaseController
   {
       protected $helpers = ['form', 'url'];

       /** GET /pas/permohonan — "Permohonan Saya" (BR-PAS-04: SENTIASA skop pemilik) */
       public function index(): string
       {
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');   // input asing → null

           // Lab 7.2b: penapis jenis + carian — input asing diabaikan, carian dihadkan 50 aksara
           $typeInput = $this->request->getGet('pass_type');
           $type      = PassType::tryFrom(is_string($typeInput) ? $typeInput : '');
           $qInput    = $this->request->getGet('q');
           $q         = is_string($qInput) ? mb_substr(trim($qInput), 0, 50) : '';

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->withType($type)
               ->search($q)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
               'type'         => $type,
               'q'            => $q,
           ]);
       }

       /** GET /pas/permohonan/new — borang */
       public function new(): string
       {
           return view('pas/new', [
               'types'    => PassType::cases(),
               'vehicles' => model(VehicleModel::class)
                   ->where('user_id', (int) auth()->id())
                   ->asArray()
                   ->findAll(),
           ]);
       }

       /** POST /pas/permohonan — simpan permohonan + dokumen */
       public function create(): RedirectResponse
       {
           // 1. Validasi pelayan (medan + SETIAP fail dalam documents[])
           if (! $this->validate($this->rules())) {
               return redirect()->back()->withInput();
           }

           // 2. Serah kepada Service (bilangan fail, pemilikan kenderaan, transaksi, move())
           try {
               $application = service('passWorkflowService')->submit(
                   (int) auth()->id(),
                   $this->request->getPost(['pass_type', 'vehicle_id', 'purpose', 'valid_from', 'valid_until']),
                   $this->uploadedFiles('documents'),
               );
           } catch (InvalidArgumentException $e) {
               // 3. Ralat perniagaan → mesej mesra pengguna, input dikekalkan (fail perlu dipilih semula)
               return redirect()->back()->withInput()->with('error', $e->getMessage());
           }

           // 4. PRG — Post/Redirect/Get
           return redirect()->to(url_to('pas.show', $application->id))
               ->with('message', "Permohonan {$application->ref_no} berjaya dihantar.");
       }

       /** GET /pas/permohonan/{id} — butiran + dokumen (tindakan & sejarah ditambah Hari 8) */
       public function show(string $id): string
       {
           $application = $this->findVisibleOr404((int) $id);

           return view('pas/show', [
               'application' => $application,
               'documents'   => model(PassDocumentModel::class)->forApplication($application->id),
           ]);
       }

       /** GET /pas/permohonan/dokumen/{id} — muat turun melalui controller (fail TIADA dalam public/) */
       public function download(string $documentId): DownloadResponse
       {
           $document = model(PassDocumentModel::class)->find((int) $documentId);

           if ($document === null) {
               throw PageNotFoundException::forPageNotFound();
           }

           // BR-PAS-04 terpakai kepada FAIL juga — bukan sekadar halaman butiran
           $this->findVisibleOr404((int) $document['application_id']);

           $path = service('passWorkflowService')->documentPath($document);   // semakan path traversal

           // attachment (bukan inline) + nosniff: pelayar tidak "meneka" & merender kandungan
           return $this->response->download($path, null, true)
               ->setFileName($document['original_name'])
               ->setHeader('X-Content-Type-Options', 'nosniff');
       }

       // -----------------------------------------------------------------

       /** BR-PAS-04 — 404 (bukan 403) supaya kewujudan ID orang lain tidak didedahkan */
       private function findVisibleOr404(int $id): PassApplication
       {
           $application = model(PassApplicationModel::class)->find($id);

           if ($application === null || ! service('passWorkflowService')->canView(auth()->user(), $application)) {
               throw PageNotFoundException::forPageNotFound();
           }

           return $application;
       }

       /**
        * Rules validasi borang. BR-PAS-02 untuk fail:
        *  - uploaded : sekurang-kurangnya satu fail yang berjaya dimuat naik oleh PHP
        *  - max_size : dalam KB → 2048 = 2 MB SETIAP fail
        *  - ext_in   : (StrictRules CI 4.6) sambungan klien MESTI sama dengan guessExtension() dari kandungan
        *  - mime_in  : MIME dari kandungan (finfo), BUKAN header Content-Type dari pelayar
        *
        * @return array<string, array<string, mixed>>
        */
       private function rules(): array
       {
           $rules = [
               'pass_type' => [
                   'label' => 'Jenis pas',
                   'rules' => 'required|in_list[' . implode(',', PassType::values()) . ']',
               ],
               'vehicle_id' => [
                   'label' => 'Kenderaan',
                   'rules' => 'permit_empty|is_natural_no_zero',
               ],
               'purpose' => [
                   'label' => 'Tujuan',
                   'rules' => 'required|min_length[10]|max_length[2000]',
               ],
               'valid_from' => [
                   'label' => 'Sah dari',
                   'rules' => 'required|valid_date[Y-m-d]',
               ],
               'valid_until' => [
                   'label' => 'Sah hingga',
                   'rules' => 'required|valid_date[Y-m-d]',
               ],
               'documents' => [
                   'label'  => 'Dokumen sokongan',
                   'rules'  => 'uploaded[documents]'
                       . '|max_size[documents,2048]'
                       . '|ext_in[documents,pdf,jpg,png]'
                       . '|mime_in[documents,application/pdf,image/jpeg,image/png]',
                   'errors' => [
                       'uploaded' => 'Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah.',
                       'max_size' => 'Setiap fail mestilah tidak melebihi 2 MB.',
                       'ext_in'   => 'Hanya fail PDF, JPG atau PNG dibenarkan.',
                       'mime_in'  => 'Kandungan fail bukan PDF/JPG/PNG yang sah.',
                   ],
               ],
           ];

           // BR-PAS-06: kenderaan WAJIB hanya untuk pas kenderaan (pemilikan & tarikh disemak dalam Service)
           $type = PassType::tryFrom((string) $this->request->getPost('pass_type'));
           if ($type?->requiresVehicle()) {
               $rules['vehicle_id']['rules'] = 'required|is_natural_no_zero';
           }

           return $rules;
       }

       /**
        * Fail yang BENAR-BENAR dipilih pengguna (buang slot kosong UPLOAD_ERR_NO_FILE).
        *
        * @return list<UploadedFile>
        */
       private function uploadedFiles(string $field): array
       {
           $files = $this->request->getFileMultiple($field) ?? [];

           return array_values(array_filter(
               $files,
               static fn (UploadedFile $file): bool => $file->getError() !== UPLOAD_ERR_NO_FILE,
           ));
       }
   }
   ```

3. **Cipta `app/Views/pas/new.php`**:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan Pas Baharu<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <h1 class="h3 mb-3">Permohonan Pas Baharu</h1>

   <?php /* novalidate: kita MAHU menguji validasi pelayan, bukan HTML5 */ ?>
   <?= form_open_multipart(url_to('pas.create'), ['novalidate' => true]) ?>
   <div class="row g-3">
       <div class="col-md-6">
           <label for="pass_type" class="form-label">Jenis pas <span class="text-danger">*</span></label>
           <select name="pass_type" id="pass_type"
                   class="form-select <?= validation_show_error('pass_type') ? 'is-invalid' : '' ?>">
               <option value="">— Pilih —</option>
               <?php foreach ($types as $type): ?>
                   <option value="<?= esc($type->value, 'attr') ?>" <?= old('pass_type') === $type->value ? 'selected' : '' ?>>
                       <?= esc($type->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
           <div class="invalid-feedback"><?= validation_show_error('pass_type') ?></div>
       </div>

       <div class="col-md-6">
           <label for="vehicle_id" class="form-label">Kenderaan <small class="text-body-secondary">(wajib untuk pas kenderaan)</small></label>
           <select name="vehicle_id" id="vehicle_id"
                   class="form-select <?= validation_show_error('vehicle_id') ? 'is-invalid' : '' ?>">
               <option value="">— Tiada —</option>
               <?php foreach ($vehicles as $vehicle): ?>
                   <option value="<?= esc((string) $vehicle['id'], 'attr') ?>" <?= old('vehicle_id') === (string) $vehicle['id'] ? 'selected' : '' ?>>
                       <?= esc($vehicle['plate_no'] . ' — ' . $vehicle['model']) ?>
                   </option>
               <?php endforeach ?>
           </select>
           <div class="invalid-feedback"><?= validation_show_error('vehicle_id') ?></div>
       </div>

       <div class="col-12">
           <label for="purpose" class="form-label">Tujuan <span class="text-danger">*</span></label>
           <textarea name="purpose" id="purpose" rows="3"
                     class="form-control <?= validation_show_error('purpose') ? 'is-invalid' : '' ?>"><?= esc(old('purpose', '')) ?></textarea>
           <div class="invalid-feedback"><?= validation_show_error('purpose') ?></div>
       </div>

       <div class="col-md-6">
           <label for="valid_from" class="form-label">Sah dari <span class="text-danger">*</span></label>
           <input type="date" name="valid_from" id="valid_from" value="<?= esc(old('valid_from', ''), 'attr') ?>"
                  class="form-control <?= validation_show_error('valid_from') ? 'is-invalid' : '' ?>">
           <div class="invalid-feedback"><?= validation_show_error('valid_from') ?></div>
       </div>

       <div class="col-md-6">
           <label for="valid_until" class="form-label">Sah hingga <span class="text-danger">*</span></label>
           <input type="date" name="valid_until" id="valid_until" value="<?= esc(old('valid_until', ''), 'attr') ?>"
                  class="form-control <?= validation_show_error('valid_until') ? 'is-invalid' : '' ?>">
           <div class="invalid-feedback"><?= validation_show_error('valid_until') ?></div>
       </div>

       <div class="col-12">
           <label for="documents" class="form-label">Dokumen sokongan <span class="text-danger">*</span></label>
           <input type="file" name="documents[]" id="documents" multiple accept=".pdf,.jpg,.png"
                  class="form-control <?= validation_show_error('documents') ? 'is-invalid' : '' ?>">
           <div class="form-text">PDF, JPG atau PNG · maksimum 2 MB setiap fail · 1 hingga 3 fail. Jika borang dikembalikan, sila pilih fail semula.</div>
           <div class="invalid-feedback"><?= validation_show_error('documents') ?></div>
       </div>
   </div>

   <div class="mt-4">
       <button type="submit" class="btn btn-primary"><i class="bi bi-send"></i> Hantar Permohonan</button>
       <a href="<?= url_to('pas.index') ?>" class="btn btn-link">Batal</a>
   </div>
   <?= form_close() ?>
   <?= $this->endSection() ?>
   ```

4. **Pastikan folder muat naik tidak boleh dicapai dan tidak di-commit.** CI4 mencipta `writable/uploads/pas/` secara automatik semasa `move()`. Semak `.gitignore` projek mengandungi `writable/uploads/*` (appstarter sudah ada). Sahkan:

   ```bash
   git check-ignore -v writable/uploads/pas/contoh.pdf   # mesti memaparkan peraturan .gitignore
   ```

5. **Sediakan fail ujian sintetik** dalam folder di luar projek (cth `~/ujian-pas/`):

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p ~/ujian-pas && cd ~/ujian-pas
   printf '%%PDF-1.4\n%% Dokumen sintetik latihan KKM\n' > surat-sokongan.pdf
   echo 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' | base64 --decode > gambar.png
   ```

   ```powershell tab="PowerShell"
   mkdir $HOME\ujian-pas; cd $HOME\ujian-pas
   Set-Content -Path surat-sokongan.pdf -Value "%PDF-1.4`n% Dokumen sintetik latihan KKM" -NoNewline
   [IO.File]::WriteAllBytes("$PWD\gambar.png", [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='))
   ```

6. **Hantar permohonan pertama** sebagai `pemohon1`: jenis *Pas Akses Kakitangan*, tujuan ≥ 10 aksara, tarikh sah, lampirkan `surat-sokongan.pdf` + `gambar.png`.

7. **Sahkan di tiga tempat:**

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/latihan/kelas-ci-<nama>         # kembali ke folder projek (langkah 5 berada di ~/ujian-pas)
   ls -la writable/uploads/pas/          # 2 fail, nama rawak cth 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
   ls public/ | grep -i upload            # TIADA output
   ```

   ```powershell tab="PowerShell"
   cd $HOME\latihan\kelas-ci-<nama>                  # kembali ke folder projek (langkah 5 berada di $HOME\ujian-pas)
   Get-ChildItem -Force writable/uploads/pas/          # 2 fail, nama rawak cth 1727251200_3f2a9c1e7b0d4a5c6e81.pdf
   Get-ChildItem public/ -Name | Select-String upload  # TIADA output
   ```

   ```sql
   SELECT id, ref_no, status FROM pass_applications ORDER BY id DESC LIMIT 1;
   SELECT application_id, original_name, stored_path, mime, size_bytes FROM pass_documents ORDER BY id DESC LIMIT 2;
   SELECT module, record_id, from_status, to_status, actor_id FROM status_logs WHERE module = 'PAS' ORDER BY id DESC LIMIT 1;
   ```

8. **Muat turun** kedua-dua dokumen dari halaman butiran. Buka DevTools → Network → klik respons → semak header `Content-Disposition: attachment; filename="surat-sokongan.pdf"` dan `X-Content-Type-Options: nosniff`.

### ✅ Checkpoint 7.3
- [ ] Redirect ke `/pas/permohonan/{id}` dengan mesej "Permohonan PAS-2026-000N berjaya dihantar." (Kuiz S3)
- [ ] `pass_documents.stored_path` bermula `uploads/pas/` (relatif), `mime` = `application/pdf` / `image/png`, `original_name` = nama asal (Kuiz S3).
- [ ] Nama fail di cakera **berbeza** daripada nama asal; `public/` tiada folder `uploads` (Kuiz S3).
- [ ] `status_logs` ada baris `PAS · {id} · NULL → submitted` (Kuiz S3).
- [ ] Muat turun berjaya dengan nama asal; header `attachment` + `nosniff` wujud (Kuiz S3).
- [ ] Commit: `git add app/ && git commit -m "PAS: borang permohonan + muat naik dokumen selamat (BR-PAS-02)"` (Kuiz S3)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Call to undefined method App\Models\PassApplicationModel::withType()` di `/pas/permohonan` | Lab 7.2b belum dibuat — controller langkah 2 memanggil skop `withType()`/`search()` | Buat Lab 7.2b langkah 2 dan 6 (skop Model) |
| Ralat validasi `uploaded` (tiada fail diterima) walaupun fail dipilih | Borang tanpa `enctype` (guna `form_open()` bukan `form_open_multipart()`) | `form_open_multipart()` |
| Hanya **satu** fail disimpan walaupun 2 dipilih | `name="documents"` tanpa `[]` | `name="documents[]"` + `multiple` |
| `The action you requested is not allowed.` (SecurityException) semasa hantar fail besar | `post_max_size` dilepasi → `$_POST` kosong → token CSRF hilang | Naikkan `post_max_size` (16M) — Lab 7.0 |
| `mime_in` gagal untuk PDF yang sah | Extension `fileinfo` tidak dimuatkan | `extension=fileinfo` dalam `php.ini`, mulakan semula server |
| `CodeIgniter\HTTP\Exceptions\HTTPException: The file has already been moved` | `move()` dipanggil dua kali untuk fail sama | Satu `move()` sahaja dalam `storeFile()` |
| `Cannot add or update a child row: a foreign key constraint fails` pada `pass_documents` | `application_id` salah (cth `false` dari insert yang gagal) | Semak `$id === false` → baling exception (sudah dalam template) |
| `ValueError: "" is not a valid backing value` | `PassType::from()` dengan input kosong sebelum validasi | Validasi `in_list` **sebelum** memanggil Service |
| `Unable to create directory` / `Permission denied` pada `move()` | `writable/` tidak boleh ditulis oleh web server | Linux/Mac: `chmod -R 775 writable`; Windows: semak folder bukan read-only |
| Muat turun memaparkan PDF rosak/kosong | Ada output (spasi/`echo`) sebelum respons, cth selepas `?>` dalam fail config | Buang tag penutup `?>` dalam fail PHP tulen |

### ⭐ Cabaran tambahan
- Tambah pilihan `doc_type` bagi **setiap** fail (`salinan_ic`, `geran_kenderaan`, `surat_lantikan`) — cadangkan cara borang menghantar jenis per fail (`doc_types[]`).
- Hadkan jumlah **keseluruhan** saiz (cth 5 MB) dalam `assertFiles()`.
- Pas kenderaan: tolak jika kenderaan itu sudah mempunyai pas `approved` yang masih sah.

---

## Lab 7.4 — Ujian Manual Kes Sempadan (S4)

### 🎯 Objektif
Menjalankan sekurang-kurangnya 10 (sasaran 17) kes ujian sempadan untuk muat naik, validasi dan pemilikan, dan merekod keputusan dalam `docs/ujian-manual-pas.md`.

### Prasyarat
- Lab 7.3 selesai. Folder `~/ujian-pas/` ada `surat-sokongan.pdf` dan `gambar.png`.

### Langkah

1. **Jana fail sempadan** (Git Bash / macOS / Linux):

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/ujian-pas
   # Tepat 2 MB = 2 097 152 bait (9 bait header + 2 097 143)
   { printf '%%PDF-1.4\n'; head -c 2097143 /dev/zero; } > tepat-2mb.pdf
   # 2 MB + 1 KB
   { printf '%%PDF-1.4\n'; head -c 2098167 /dev/zero; } > lebih-2mb.pdf
   # 3 MB
   { printf '%%PDF-1.4\n'; head -c 3145728 /dev/zero; } > besar-3mb.pdf
   # Boleh laksana dinamakan semula .pdf
   cp "$(command -v ls)" program.pdf
   # Skrip PHP menyamar sebagai PDF (tidak berbahaya: phpinfo)
   printf '<?php phpinfo(); ?>\n' > borang.pdf
   # Sambungan .jpeg (kandungan PNG sah; SPEC hanya benarkan jpg/png)
   cp gambar.png gambar.jpeg
   cp surat-sokongan.pdf surat-2.pdf; cp surat-sokongan.pdf surat-3.pdf
   ls -l
   ```

   ```powershell tab="PowerShell"
   cd $HOME\ujian-pas
   $hdr = [Text.Encoding]::ASCII.GetBytes("%PDF-1.4`n")
   [IO.File]::WriteAllBytes("$PWD\tepat-2mb.pdf",  $hdr + (New-Object byte[] 2097143))
   [IO.File]::WriteAllBytes("$PWD\lebih-2mb.pdf",  $hdr + (New-Object byte[] 2098167))
   [IO.File]::WriteAllBytes("$PWD\besar-3mb.pdf",  $hdr + (New-Object byte[] 3145728))
   Copy-Item C:\Windows\System32\notepad.exe .\program.pdf
   Set-Content borang.pdf '<?php phpinfo(); ?>'
   Copy-Item gambar.png gambar.jpeg
   Copy-Item surat-sokongan.pdf surat-2.pdf; Copy-Item surat-sokongan.pdf surat-3.pdf
   ```

2. **Cipta `docs/ujian-manual-pas.md`** dan salin jadual di bawah. Jalankan setiap kes; isi lajur *Sebenar* dan *Keputusan*. Selepas **setiap** kes, semak `ls writable/uploads/pas/ | wc -l` (PowerShell: `(Get-ChildItem writable/uploads/pas/).Count`) dari **folder projek** (`cd ~/latihan/kelas-ci-<nama>`, bukan `~/ujian-pas`) — bilangan hanya bertambah untuk kes yang dijangka berjaya.

   | ID | Kes | Langkah | Dijangka | Sebenar | Keputusan |
   |----|-----|---------|----------|---------|-----------|
   | UT-PAS-01 | 1 PDF sah | Lampir `surat-sokongan.pdf` | Berjaya, `PAS-2026-000N`, +1 fail di cakera | | |
   | UT-PAS-02 | 3 fail sah (maks) | `surat-sokongan.pdf`, `surat-2.pdf`, `gambar.png` | Berjaya, 3 baris `pass_documents` | | |
   | UT-PAS-03 | Tiada fail | Hantar tanpa fail | "Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah." | | |
   | UT-PAS-04 | 4 fail | 4 fail sah | "Sila lampirkan 1 hingga 3 dokumen sokongan." — **tiada** fail baharu di cakera, tiada rekod | | |
   | UT-PAS-05 | Tepat 2 MB | `tepat-2mb.pdf` | Berjaya (sempadan termasuk) | | |
   | UT-PAS-06 | 2 MB + 1 KB | `lebih-2mb.pdf` | "Setiap fail mestilah tidak melebihi 2 MB." | | |
   | UT-PAS-07 | 3 MB | `besar-3mb.pdf` | "Setiap fail mestilah tidak melebihi 2 MB." | | |
   | UT-PAS-08 | Boleh laksana → `.pdf` | `program.pdf` | Ditolak ("Hanya fail PDF, JPG atau PNG…" atau "Kandungan fail bukan…") | | |
   | UT-PAS-09 | PHP → `.pdf` | `borang.pdf` | Ditolak — tiada fail `.php` di cakera | | |
   | UT-PAS-10 | `.jpeg` | `gambar.jpeg` | Ditolak (SPEC: jpg/png sahaja) — rekod sebagai "ikut SPEC" | | |
   | UT-PAS-11 | Tarikh terbalik (BR-PAS-06) | `valid_until` < `valid_from` | "Tarikh "Sah hingga" mesti sama atau selepas "Sah dari"." | | |
   | UT-PAS-12 | Pas kenderaan tanpa kenderaan (BR-PAS-06) | Jenis *Pas Kenderaan*, kenderaan "Tiada" | Ralat medan Kenderaan (required) | | |
   | UT-PAS-13 | Kenderaan orang lain (IDOR borang) | DevTools: ubah `value` `<option>` kepada ID kenderaan `pemohon2` | "Sila pilih kenderaan anda yang berdaftar untuk pas kenderaan." | | |
   | UT-PAS-14 | Butiran orang lain | `pemohon2` buka `/pas/permohonan/{id pemohon1}` | 404 | | |
   | UT-PAS-15 | Dokumen orang lain | `pemohon2` buka `/pas/permohonan/dokumen/{id dokumen pemohon1}` | 404 | | |
   | UT-PAS-16 | Akses terus fail | Buka `http://localhost:8080/writable/uploads/pas/<nama-rawak>` dan `http://localhost:8080/uploads/pas/<nama-rawak>` | 404 (tidak boleh dicapai) | | |
   | UT-PAS-17 | Pas kakitangan tanpa kenderaan, tempoh 2 tahun (BR-PAS-06) | Jenis *Pas Akses Kakitangan*, kenderaan "Tiada", `valid_until` = +2 tahun | Berjaya (kenderaan tidak wajib; tiada had maksimum) | | |

3. **Untuk UT-PAS-13**, cari ID kenderaan `pemohon2`: `SELECT id, plate_no FROM vehicles WHERE user_id = <id pemohon2>;` (`VehicleSeeder` Hari 4 mencipta `VXX 2468`; cipta satu kenderaan sintetik jika tiada).

4. **Rekod pepijat** (jika ada) di bawah jadual dengan format: *ID · Langkah hasilkan semula · Dijangka · Sebenar · Keterukan (Tinggi/Sederhana/Rendah)*. Baiki mengikut kitaran **reproduce → ujian gagal → baiki → ujian lulus**.

5. **Bersihkan** data ujian: padam rekod `PAS-2026-900x` (Lab 7.2), termasuk `PAS-2026-9003`–`9005` (Lab 7.2b): baris ini tiada sejarah `status_logs` dan akan mengelirukan baris gilir semakan Hari 8. **Jangan** padam fail di `writable/uploads/pas/` secara manual tanpa memadam baris `pass_documents` yang sepadan.

### ✅ Checkpoint 7.4
- [ ] `docs/ujian-manual-pas.md` mengandungi ≥ 10 kes dengan lajur *Sebenar* & *Keputusan* diisi (Kuiz S4).
- [ ] UT-PAS-04, 08, 09: **tiada** fail baharu di `writable/uploads/pas/` dan tiada rekod `pass_applications` baharu (Kuiz S4).
- [ ] Anda boleh menerangkan kepada jurulatih **risiko OWASP** yang dicegah oleh UT-PAS-07, 09, 15 dan 16 (Kuiz S4).
- [ ] Commit: `git add docs/ && git commit -m "PAS: kes ujian manual muat naik & pemilikan"` dan `git push -u origin feat/pas-permohonan` (Kuiz S4).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| UT-PAS-07 memaparkan mesej "uploaded", bukan "2 MB" | `upload_max_filesize` < 3M — PHP menolak dahulu | Lab 7.0 langkah 3 |
| UT-PAS-05 (tepat 2 MB) ditolak | Fail sebenarnya > 2 097 152 bait (cth `head -c 2097152` + header) | Semak `ls -l`: mesti **2097152** |
| UT-PAS-09 **diterima** | `mime_in` tiada atau `ext_in` guna `Rules` lama (bukan `StrictRules`) | Semak rules & `Config\Validation::$ruleSets` guna `StrictRules\FileRules` |
| UT-PAS-04 meninggalkan fail di cakera | Semakan bilangan dibuat **selepas** `move()` | `assertFiles()` mesti dipanggil sebelum gelung `storeFile()` |
| UT-PAS-16 memaparkan fail! | Fail disimpan di `public/` atau document root server menunjuk akar projek, bukan `public/` | `move(WRITEPATH . …)`; Apache/Laragon: DocumentRoot = `…/public` |
| `base64: invalid option -- d` (macOS lama) | Versi `base64` lama | Guna `base64 -D` |

### ⭐ Cabaran tambahan
- Muat naik fail bernama `"><img src=x onerror=alert(1)>.pdf` (macOS/Linux sahaja) dan sahkan nama dipapar sebagai teks dalam butiran (XSS dicegah oleh `esc()`).
- Sebelum Lab 7.4b: fikirkan kenapa UT-PAS-06 sukar diautomasikan dengan PHPUnit menggunakan `$_FILES` palsu. (Petunjuk: `is_uploaded_file()` dan `move_uploaded_file()`; Lab 7.4b langkah 1 menjawabnya.)
- Tukar mesej validasi lalai CI4 ke Bahasa Melayu: `app/Language/ms/Validation.php` + `Config\App::$defaultLocale = 'ms'`.

---

## Lab 7.1b — Enum & Entity: Ikon, Status Menunggu & Tempoh Sah (S5)

### 🎯 Objektif
Menambah tiga kaedah baharu pada kod Lab 7.1 dengan corak yang sama (`match`, kaedah statik enum, kaedah Entity): `PassType::icon()`, `PassStatus::pending()`/`isPending()`, dan `PassApplication::validityDays()`/`daysRemaining()`, kemudian mengujinya dalam `php spark shell` tanpa database.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 7.1](#lab-71--enum-entity--model-s1) selesai dan di-commit.
- `php spark shell` (PsySH) dari [Lab 3.2b](../hari-3/lab.md#lab-32b--query-builder-dalam-konsol-s6) berfungsi.

### Langkah

1. **`PassType::icon()`** — kelas Bootstrap Icons bagi setiap jenis pas (dipakai dalam senarai Lab 7.2b). Dalam `app/Enums/PassType.php`, tambah kaedah ini **terus selepas** kaedah `requiresVehicle()`:

   ```php
       /** Kelas Bootstrap Icons untuk senarai & butiran (Lab 7.1b) */
       public function icon(): string
       {
           return match ($this) {
               self::Kenderaan  => 'bi-car-front',
               self::Kakitangan => 'bi-person-badge',
               self::Kontraktor => 'bi-tools',
           };
       }
   ```

2. **`PassStatus::pending()` dan `isPending()`** — status yang masih menunggu tindakan pegawai. Coraknya sama seperti `BookingStatus::active()` (Hari 5): satu senarai dalam enum, bukan `['submitted', 'under_review']` bertaburan di controller. Dalam `app/Enums/PassStatus.php`, tambah **terus selepas** kaedah `isFinal()`:

   ```php
       /**
        * Status yang menunggu tindakan pegawai (Lab 7.1b) — corak sama seperti BookingStatus::active().
        *
        * @return list<string> ['submitted', 'under_review']
        */
       public static function pending(): array
       {
           return [self::Submitted->value, self::UnderReview->value];
       }

       /** true jika status ini masih menunggu tindakan pegawai */
       public function isPending(): bool
       {
           return in_array($this->value, self::pending(), true);
       }
   ```

3. **`validityDays()` dan `daysRemaining()`** — dalam `app/Entities/PassApplication.php`, tambah dua kaedah ini **sebelum `}` penutup kelas** (selepas `displayStatus()`). `PassStatus` dan `Time` sudah di-`use` di bahagian atas fail:

   ```php
       /**
        * Bilangan hari kalendar dalam tempoh sah, termasuk hari pertama & terakhir
        * (1 Okt hingga 1 Okt = 1 hari) — corak sama seperti SlotBooking::durationDays().
        */
       public function validityDays(): int
       {
           return $this->valid_from->diff($this->valid_until)->days + 1;   // Time (lihat $dates)
       }

       /**
        * Baki hari pas yang DILULUSKAN, dikira dari $today (lalai: hari ini).
        * 0 = tamat hari ini. null = belum/tidak diluluskan, atau sudah tamat tempoh.
        */
       public function daysRemaining(?Time $today = null): ?int
       {
           $today ??= Time::today();
           $until = $this->valid_until;

           if ($this->statusEnum() !== PassStatus::Approved || $until->isBefore($today)) {
               return null;
           }

           return $today->diff($until)->days;
       }
   ```

   `daysRemaining()` menerima `$today` sebagai parameter supaya boleh diuji dengan tarikh tetap — ujian tidak berubah hasil mengikut hari ia dijalankan.

4. **Semak sintaks:**

   ```bash
   php -l app/Enums/PassType.php
   php -l app/Enums/PassStatus.php
   php -l app/Entities/PassApplication.php
   ```

5. **Uji dalam konsol.** `php spark shell`, kemudian taip setiap baris di bawah, tekan Enter, dan catat hasilnya. Entity dibina dalam memori — tiada rekod disimpan dalam database:

   ```text
   use App\Entities\PassApplication;
   use App\Enums\PassStatus;
   use App\Enums\PassType;
   use CodeIgniter\I18n\Time;
   PassStatus::pending()
   PassStatus::Approved->isPending()
   PassType::Kontraktor->icon()
   $p = new PassApplication(['user_id' => 2, 'pass_type' => 'kontraktor', 'status' => 'approved', 'valid_from' => '2026-10-01', 'valid_until' => '2026-10-31'])
   $p->validityDays()
   $p->daysRemaining(Time::parse('2026-10-20'))
   $p->daysRemaining(Time::parse('2026-10-31'))
   $p->daysRemaining(Time::parse('2026-11-01'))
   $p->status = 'submitted'
   $p->daysRemaining(Time::parse('2026-10-20'))
   $p->valid_until = '2026-10-01'
   $p->validityDays()
   exit
   ```

   Catat nilai `validityDays()` dan ketiga-tiga `daysRemaining()` (soalan Kuiz S5).

6. **Commit:**

   ```bash tab="Git Bash / macOS / Linux"
   git add app/ && git commit -m "PAS: PassType::icon, PassStatus::pending, validityDays & daysRemaining"
   ```

   ```powershell tab="PowerShell"
   git add app/
   git commit -m "PAS: PassType::icon, PassStatus::pending, validityDays & daysRemaining"
   ```

### ✅ Checkpoint
- [ ] `php -l` tiada ralat sintaks bagi `PassType.php`, `PassStatus.php` dan `PassApplication.php` (Kuiz S5).
- [ ] Dalam `php spark shell`: `PassStatus::pending()` memulangkan `submitted` dan `under_review`, `PassType::Kontraktor->icon()` memulangkan `bi-tools`, dan nilai `validityDays()` serta `daysRemaining()` langkah 5 dicatat (Kuiz S5).
- [ ] Commit `PAS: PassType::icon, PassStatus::pending, validityDays & daysRemaining` ada dalam `git log` (Kuiz S5).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Command "shell" not found` | Lab 3.2b belum dibuat dalam projek ini | Buat Lab 3.2b langkah 1–2 (`composer require --dev psy/psysh` + `app/Commands/Shell.php`) |
| Prompt `>` tidak muncul dalam Git Bash | Tetingkap mintty berasingan | Guna terminal VS Code, atau `winpty php spark shell` |
| `Call to undefined method App\Entities\PassApplication::validityDays()` | Kaedah ditampal di luar kelas, atau fail belum disimpan | Simpan fail; kaedah mesti sebelum `}` terakhir; keluar (`exit`) dan buka semula `php spark shell` |
| `validityDays()` memulangkan `30` untuk 1–31 Okt | `+ 1` tertinggal | Tempoh sah **termasuk** hari pertama dan terakhir |
| `UnhandledMatchError` dalam `icon()` | Satu `case` tiada cabang `match` | Tiga cabang tepat: `Kenderaan`, `Kakitangan`, `Kontraktor` |

### ⭐ Cabaran tambahan
- Tulis `tests/unit/Enums/PassTypeTest.php` yang memastikan **setiap** `PassType::cases()` mempunyai `icon()` bermula dengan `bi-` dan `label()` tidak kosong — ujian ini gagal secara automatik jika jenis keempat ditambah tanpa ikon.

---

## Lab 7.2b — Penapis Jenis & Carian pada "Permohonan Saya" (S6)

### 🎯 Objektif
Menambah filter `?pass_type=` dan carian `?q=` (no. rujukan atau tujuan) pada `/pas/permohonan` melalui skop Model, membuktikan bahawa `orLike()` tanpa `groupStart()` membocorkan permohonan orang lain (BR-PAS-04), dan memaparkan ikon jenis serta tempoh sah (Lab 7.1b).

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 7.2](#lab-72--laluan-service--paparan-senaraibutiran-s2) dan [Lab 7.1b](#lab-71b--enum--entity-ikon-status-menunggu--tempoh-sah-s5) selesai. Data `PAS-2026-9001` (`pemohon1`) dan `PAS-2026-9002` (`pemohon2`) dari Lab 7.2 langkah 7 wujud.

### Langkah

1. **Tiga lagi permohonan sintetik untuk `pemohon1`** — jalankan dalam klien MySQL (HeidiSQL Laragon atau `mysql`) pada database `kkm_latihan`. ID pengguna dan kenderaan dicari melalui e-mel dan plat, jadi tiada nombor untuk diganti:

   ```sql
   SET @p1 = (SELECT user_id FROM auth_identities WHERE secret = 'pemohon1@latihan.test');
   SET @v1 = (SELECT id FROM vehicles WHERE plate_no = 'WXX 1234');

   INSERT INTO pass_applications (ref_no, user_id, pass_type, vehicle_id, purpose, valid_from, valid_until, status, created_at, updated_at) VALUES
   ('PAS-2026-9003', @p1, 'kenderaan',  @v1,  'Pelekat kenderaan untuk parkir Blok A (sintetik)', '2026-11-01', '2027-10-31', 'submitted',    NOW(), NOW()),
   ('PAS-2026-9004', @p1, 'kontraktor', NULL, 'Kerja pendawaian semula Blok C (sintetik)',        '2026-10-15', '2026-12-15', 'approved',     NOW(), NOW()),
   ('PAS-2026-9005', @p1, 'kakitangan', NULL, 'Akses makmal komputer aras 3 (sintetik)',          '2026-10-01', '2026-10-01', 'under_review', NOW(), NOW());

   SELECT ref_no, pass_type, status FROM pass_applications WHERE user_id = @p1 ORDER BY ref_no;
   ```

   Hasil `SELECT`: 4 baris (`PAS-2026-9001`, `9003`, `9004`, `9005`). Rekod `PAS-2026-900x` dipadam bersama data Lab 7.2 dalam Lab 7.4 langkah 5.

2. **Skop Model — versi pertama.** Dalam `app/Models/PassApplicationModel.php`, tambah dua kaedah ini **terus sebelum** kaedah `withApplicant()`. Kaedah `search()` ini **sengaja salah**; langkah 6 membetulkannya:

   ```php
       /** Penapis jenis pas pilihan (null = semua) — Lab 7.2b */
       public function withType(?PassType $type): static
       {
           if ($type !== null) {
               $this->where('pass_applications.pass_type', $type->value);
           }

           return $this;
       }

       /** VERSI PERTAMA — sengaja tanpa kurungan (langkah 6 membetulkannya) */
       public function search(string $q): static
       {
           if ($q !== '') {
               $this->like('pass_applications.ref_no', $q)
                   ->orLike('pass_applications.purpose', $q);
           }

           return $this;
       }
   ```

3. **Controller.** Dalam `app/Controllers/Pas/ApplicationController.php`:
   - tambah `use App\Enums\PassType;` di bawah baris `use App\Enums\PassStatus;`;
   - gantikan seluruh kaedah `index()` dengan versi di bawah. `show()` dan `findVisibleOr404()` tidak berubah.

   ```php
       /** GET /pas/permohonan — "Permohonan Saya" (BR-PAS-04: SENTIASA skop pemilik) */
       public function index(): string
       {
           $requested = $this->request->getGet('status');
           $status    = PassStatus::tryFrom(is_string($requested) ? $requested : '');   // input asing → null

           // Lab 7.2b: penapis jenis + carian — input asing diabaikan, carian dihadkan 50 aksara
           $typeInput = $this->request->getGet('pass_type');
           $type      = PassType::tryFrom(is_string($typeInput) ? $typeInput : '');
           $qInput    = $this->request->getGet('q');
           $q         = is_string($qInput) ? mb_substr(trim($qInput), 0, 50) : '';

           $model        = model(PassApplicationModel::class);
           $applications = $model->ownedBy((int) auth()->id())
               ->withStatus($status)
               ->withType($type)
               ->search($q)
               ->orderBy('pass_applications.created_at', 'DESC')
               ->paginate(10);

           return view('pas/index', [
               'applications' => $applications,
               'pager'        => $model->pager,
               'status'       => $status,
               'type'         => $type,
               'q'            => $q,
           ]);
       }
   ```

4. **View.** Gantikan seluruh kandungan `app/Views/pas/index.php`. Berbanding Lab 7.2: dua medan filter baharu, pautan *Set semula*, kiraan `$pager->getTotal()`, ikon jenis dan bilangan hari tempoh sah:

   ```php
   <?= $this->extend('layouts/main') ?>

   <?= $this->section('title') ?>Permohonan Pas Saya<?= $this->endSection() ?>

   <?= $this->section('content') ?>
   <div class="d-flex justify-content-between align-items-center mb-3">
       <h1 class="h3 mb-0">Permohonan Pas Saya</h1>
       <a href="<?= url_to('pas.new') ?>" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Mohon Pas</a>
   </div>

   <form method="get" class="row g-2 mb-3" role="search">
       <div class="col-auto">
           <label for="status" class="visually-hidden">Status</label>
           <select name="status" id="status" class="form-select">
               <option value="">Semua status</option>
               <?php foreach (\App\Enums\PassStatus::cases() as $case): ?>
                   <option value="<?= esc($case->value, 'attr') ?>" <?= $status === $case ? 'selected' : '' ?>>
                       <?= esc($case->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
       </div>
       <div class="col-auto">
           <label for="pass_type" class="visually-hidden">Jenis pas</label>
           <select name="pass_type" id="pass_type" class="form-select">
               <option value="">Semua jenis</option>
               <?php foreach (\App\Enums\PassType::cases() as $case): ?>
                   <option value="<?= esc($case->value, 'attr') ?>" <?= $type === $case ? 'selected' : '' ?>>
                       <?= esc($case->label()) ?>
                   </option>
               <?php endforeach ?>
           </select>
       </div>
       <div class="col-auto">
           <label for="q" class="visually-hidden">Carian</label>
           <input type="search" name="q" id="q" value="<?= esc($q, 'attr') ?>" maxlength="50"
                  class="form-control" placeholder="No. rujukan / tujuan">
       </div>
       <div class="col-auto"><button type="submit" class="btn btn-outline-secondary">Tapis</button></div>
       <div class="col-auto"><a href="<?= url_to('pas.index') ?>" class="btn btn-link">Set semula</a></div>
   </form>

   <?php if ($applications === []): ?>
       <div class="alert alert-info">Tiada permohonan untuk dipaparkan.</div>
   <?php else: ?>
       <p class="text-body-secondary small mb-2"><?= esc((string) $pager->getTotal()) ?> permohonan ditemui.</p>
       <div class="table-responsive">
           <table class="table table-hover align-middle">
               <thead>
                   <tr><th>No. Rujukan</th><th>Jenis</th><th>Tempoh Sah</th><th>Status</th><th>Tarikh Mohon</th><th></th></tr>
               </thead>
               <tbody>
               <?php foreach ($applications as $app): ?>
                   <?php $shown = $app->displayStatus(); ?>
                   <tr>
                       <td class="fw-semibold"><?= esc($app->ref_no) ?></td>
                       <td><i class="bi <?= esc($app->typeEnum()->icon(), 'attr') ?>" aria-hidden="true"></i> <?= esc($app->typeEnum()->label()) ?></td>
                       <td>
                           <?= esc($app->valid_from->format('d/m/Y')) ?> – <?= esc($app->valid_until->format('d/m/Y')) ?>
                           <small class="text-body-secondary">(<?= esc((string) $app->validityDays()) ?> hari)</small>
                       </td>
                       <td><span class="badge <?= esc($shown->badge(), 'attr') ?>"><?= esc($shown->label()) ?></span></td>
                       <td><?= esc($app->created_at->format('d/m/Y')) ?></td>
                       <td><a href="<?= url_to('pas.show', $app->id) ?>" class="btn btn-sm btn-outline-primary">Lihat</a></td>
                   </tr>
               <?php endforeach ?>
               </tbody>
           </table>
       </div>
       <?= $pager->links() ?>
   <?php endif ?>
   <?= $this->endSection() ?>
   ```

5. **Buktikan kebocoran.** Log masuk sebagai `pemohon2@latihan.test` dan buka `http://localhost:8080/pas/permohonan?q=sintetik`. Catat baris *"N permohonan ditemui"* dan nombor rujukan yang dipaparkan (soalan Kuiz S6). Kemudian buka Debug Toolbar → tab **Database** → query `SELECT … FROM pass_applications`. SQL sebenar:

   ```sql
   -- 3 = id pemohon2 dalam contoh ini
   WHERE `pass_applications`.`user_id` = 3
   AND  `pass_applications`.`ref_no` LIKE '%sintetik%' ESCAPE '!'
   OR  `pass_applications`.`purpose` LIKE '%sintetik%' ESCAPE '!'
   ```

   `AND` diikat lebih kuat daripada `OR`, jadi MySQL membaca `(user_id = 3 AND ref_no LIKE …) OR purpose LIKE …` — syarat kedua tidak lagi dihadkan kepada pemilik. Klik **Lihat** pada `PAS-2026-9001`: `404`, kerana `findVisibleOr404()` masih menyemak pemilikan. Senarai sudah membocorkan nombor rujukan, tujuan dan tarikh.

6. **Betulkan.** Gantikan kaedah `search()` (versi pertama) dengan versi berkurungan di bawah. `withType()` kekal:

   ```php
       /**
        * Carian pada no. rujukan ATAU tujuan — Lab 7.2b.
        * groupStart()/groupEnd() = kurungan: (ref_no LIKE … OR purpose LIKE …).
        * Tanpa kurungan, OR "melompat" keluar dari skop ownedBy() (BR-PAS-04).
        */
       public function search(string $q): static
       {
           if ($q !== '') {
               $this->groupStart()
                   ->like('pass_applications.ref_no', $q)
                   ->orLike('pass_applications.purpose', $q)
                   ->groupEnd();
           }

           return $this;
       }
   ```

   Muat semula `?q=sintetik` sebagai `pemohon2`: kini **1** permohonan (`PAS-2026-9002`). Tab Database menunjukkan `AND ( … LIKE … OR … LIKE … )`.

7. **Uji filter sebagai `pemohon1`.** Catat nombor rujukan dan kiraan bagi setiap URL:

   | URL | Semak |
   |-----|-------|
   | `/pas/permohonan` | 4 permohonan; lajur Jenis berikon; `PAS-2026-9005` → `(1 hari)` |
   | `/pas/permohonan?pass_type=kontraktor&q=blok` | Soalan Kuiz S6 |
   | `/pas/permohonan?q=BLOK` | Huruf besar/kecil — collation `utf8mb4_unicode_ci` (Hari 3) |
   | `/pas/permohonan?status=approved&pass_type=kontraktor` | Dua filter serentak (status + jenis) |
   | `/pas/permohonan?pass_type=vip&q[]=x` | Tiada ralat; senarai penuh (input asing diabaikan) |

8. **Tempoh sah di halaman butiran.** Dalam `app/Views/pas/show.php`, gantikan pasangan `<dt>Tempoh sah</dt>` + `<dd>…</dd>` dengan blok di bawah. Buka `PAS-2026-9004` (`approved`): badge *Baki N hari* muncul; pada `PAS-2026-9001` (`submitted`) tiada badge.

   ```php
       <dt class="col-sm-3">Tempoh sah</dt>
       <dd class="col-sm-9">
           <?= esc($application->valid_from->format('d/m/Y')) ?> hingga <?= esc($application->valid_until->format('d/m/Y')) ?>
           <small class="text-body-secondary">(<?= esc((string) $application->validityDays()) ?> hari)</small>
           <?php $remaining = $application->daysRemaining(); ?>
           <?php if ($remaining !== null): ?>
               <span class="badge text-bg-light border">Baki <?= esc((string) $remaining) ?> hari</span>
           <?php endif ?>
       </dd>
   ```

9. **Commit** (versi `search()` berkurungan sahaja):

   ```bash tab="Git Bash / macOS / Linux"
   git add app/ && git commit -m "PAS: penapis jenis & carian Permohonan Saya (BR-PAS-04)"
   ```

   ```powershell tab="PowerShell"
   git add app/
   git commit -m "PAS: penapis jenis & carian Permohonan Saya (BR-PAS-04)"
   ```

### ✅ Checkpoint
- [ ] Dengan `search()` versi pertama, `pemohon2` di `?q=sintetik` nampak permohonan `pemohon1`; tab Database menunjukkan `OR` tanpa kurungan (Kuiz S6).
- [ ] Selepas `groupStart()`/`groupEnd()`, `pemohon2` di `?q=sintetik` nampak **1** permohonan sahaja, dan jadual langkah 7 lengkap untuk `pemohon1` (Kuiz S6).
- [ ] Halaman butiran memaparkan `(N hari)` dan badge *Baki N hari* untuk pas `approved` sahaja; commit `PAS: penapis jenis & carian Permohonan Saya (BR-PAS-04)` (Kuiz S6).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Undefined variable $type` dalam `pas/index.php` | `index()` lama masih menghantar 3 variable sahaja | Langkah 3: `index()` baharu menghantar `type` dan `q` |
| `Class "App\Controllers\Pas\PassType" not found` | `use App\Enums\PassType;` tertinggal dalam controller | Tambah baris `use` (langkah 3) |
| `Call to undefined method App\Models\PassApplicationModel::search()` | Kaedah ditampal dalam kelas lain, atau fail belum disimpan | Mesti dalam `PassApplicationModel`, sebelum `withApplicant()` |
| Pautan halaman 2 kehilangan `?q=` | Pautan pager ditulis sendiri | Guna `$pager->links()` — pager CI4 mengekalkan query string semasa |
| `?q=%` memaparkan semua permohonan sendiri | `like()` CI4 tidak meng-escape `%` dan `_` dalam nilai | Bukan kebocoran (masih skop pemilik) — lihat ⭐ |

### ⭐ Cabaran tambahan
- Escape aksara wildcard: `->like('pass_applications.ref_no', $this->db->escapeLikeString($q))` (sama untuk `orLike`). Uji `?q=%` sekali lagi — kini tiada hasil.
- Tambah kiraan per jenis di atas jadual ("Kenderaan: 1 · Kakitangan: 2 · Kontraktor: 1") dengan satu query `groupBy('pass_type')` dalam skop `ownedBy()`.

---

## Lab 7.3b — Tambah Dokumen Susulan pada Permohonan (S7)

### 🎯 Objektif
Membina route `POST /pas/permohonan/{id}/dokumen` yang membenarkan **pemilik** menambah dokumen pada permohonan `submitted` sedia ada, dengan rules fail yang sama seperti Lab 7.3, had **3 dokumen bagi setiap permohonan** (BR-PAS-02) disemak sebelum `move()` dan sekali lagi di bawah kunci baris `FOR UPDATE`, serta pembersihan fail jika gagal.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 7.3](#lab-73--borang-validasi-muat-naik--muat-turun-s3) selesai: `PAS-2026-0001` milik `pemohon1` mempunyai **2** dokumen (`surat-sokongan.pdf`, `gambar.png`).
- Folder `~/ujian-pas/` ada `surat-sokongan.pdf` dan `gambar.png` (Lab 7.3 langkah 5).

### Langkah

1. **Fail ujian tambahan:**

   ```bash tab="Git Bash / macOS / Linux"
   cd ~/ujian-pas
   cp surat-sokongan.pdf surat-2.pdf; cp surat-sokongan.pdf surat-3.pdf
   printf '<?php phpinfo(); ?>\n' > borang.pdf
   cd ~/latihan/kelas-ci-<nama>
   ```

   ```powershell tab="PowerShell"
   cd $HOME\ujian-pas
   Copy-Item surat-sokongan.pdf surat-2.pdf
   Copy-Item surat-sokongan.pdf surat-3.pdf
   Set-Content -Path borang.pdf -Value '<?php phpinfo(); ?>' -Encoding ascii
   cd $HOME\latihan\kelas-ci-<nama>
   ```

2. **Route.** Dalam `app/Config/Routes.php`, tambah dua baris ini **selepas** `});` penutup kumpulan `pas/permohonan` (bukan di dalamnya):

   ```php
   // Lab 7.3b — di LUAR kumpulan supaya kekal apabila Lab 8.2 menggantikan kumpulan pas/permohonan
   $routes->post('pas/permohonan/(:num)/dokumen', 'Pas\ApplicationController::addDocuments/$1', ['as' => 'pas.dokumen.tambah', 'filter' => 'session']);
   ```

   Lab 8.2 akan menggantikan seluruh kumpulan `pas/permohonan`; route di luar kumpulan tidak tersentuh. Sahkan: `php spark routes | grep pas/permohonan` (PowerShell: `php spark routes | Select-String pas/permohonan`) → **6** baris, termasuk `POST | pas/permohonan/([0-9]+)/dokumen | pas.dokumen.tambah`.

3. **Service — kaedah awam.** Dalam `app/Services/PassWorkflowService.php`, tambah blok ini **terus selepas** kaedah `submit()` (sebelum docblock `canView()`). Semua `use` yang diperlukan sudah ada sejak Lab 7.3:

   ```php
       // =================================================================
       // LAB 7.3b — tambah dokumen susulan (status kekal submitted)
       // =================================================================

       /**
        * @param list<UploadedFile> $files fail yang SUDAH lulus rules validasi controller
        *
        * @return int bilangan dokumen yang ditambah
        *
        * @throws InvalidArgumentException ralat perniagaan — mesej BM, selamat dipapar kepada pengguna
        */
       public function addDocuments(int $applicationId, int $userId, array $files): int
       {
           $application = $this->applications->find($applicationId);

           // Pemilik SAHAJA: pegawai boleh melihat (canView), tetapi tidak menambah dokumen bagi pihak pemohon
           if ($application === null || ! $application->isOwnedBy($userId)) {
               throw PageNotFoundException::forPageNotFound();
           }

           // --- Semakan SEBELUM menyentuh cakera (sama seperti submit()) --------
           $this->assertSubmitted($application->statusEnum());
           $this->assertFiles($files);                                  // jenis, saiz, 1–3 fail
           $this->assertDocumentQuota($applicationId, count($files));   // BR-PAS-02: jumlah ≤ 3

           $stored        = [];
           $inTransaction = false;

           try {
               foreach ($files as $file) {
                   $stored[] = $this->storeFile($file);
               }

               $this->db->transException(true)->transBegin();
               $inTransaction = true;

               // Kunci baris permohonan (corak Lab 6.2): dua tab serentak tidak boleh melepasi had,
               // dan pegawai tidak boleh "Mula Semakan" di tengah-tengah tambahan ini.
               $row = $this->db->query('SELECT status FROM pass_applications WHERE id = ? FOR UPDATE', [$applicationId])->getRowArray();
               $this->assertSubmitted(PassStatus::from((string) $row['status']));
               $this->assertDocumentQuota($applicationId, count($stored));   // kira semula di bawah kunci

               foreach ($stored as $doc) {
                   if ($this->documents->insert($doc + ['application_id' => $applicationId]) === false) {
                       throw new RuntimeException('Gagal menyimpan dokumen: ' . implode(' ', $this->documents->errors()));
                   }
               }

               $this->db->transCommit();
           } catch (Throwable $e) {
               if ($inTransaction) {
                   $this->db->transRollback();
               }
               $this->deleteStoredFiles($stored);   // tiada fail "yatim" di cakera

               throw $e;
           }

           return count($stored);
       }
   ```

4. **Service — dua pembantu.** Dalam fail yang sama, bahagian *Dalaman*, tambah **terus sebelum** docblock `/** @param list<UploadedFile> $files */` kaedah `assertFiles()`:

   ```php
       /** Lab 7.3b: dokumen hanya boleh ditambah sebelum pegawai mula menyemak */
       private function assertSubmitted(PassStatus $status): void
       {
           if ($status !== PassStatus::Submitted) {
               throw new InvalidArgumentException('Dokumen hanya boleh ditambah sebelum permohonan mula disemak.');
           }
       }

       /** Lab 7.3b — BR-PAS-02: maksimum 3 dokumen bagi SETIAP permohonan (sedia ada + baharu) */
       private function assertDocumentQuota(int $applicationId, int $adding): void
       {
           $existing = $this->documents->where('application_id', $applicationId)->countAllResults();

           if ($existing + $adding > self::MAX_FILES) {
               throw new InvalidArgumentException(sprintf(
                   'Permohonan ini sudah ada %d dokumen. Maksimum %d dokumen bagi setiap permohonan.',
                   $existing,
                   self::MAX_FILES,
               ));
           }
       }
   ```

5. **Controller.** Dalam `app/Controllers/Pas/ApplicationController.php`, tambah kaedah ini **terus selepas** `download()` (sebelum baris `// -----`). Ia memanggil `rules()` dan `uploadedFiles()` yang sedia ada:

   ```php
       /** POST /pas/permohonan/{id}/dokumen — tambah dokumen susulan (Lab 7.3b) */
       public function addDocuments(string $id): RedirectResponse
       {
           $application = $this->findVisibleOr404((int) $id);
           $back        = url_to('pas.show', $application->id);

           // Rule fail yang SAMA seperti borang permohonan — satu sumber kebenaran (BR-PAS-02)
           if (! $this->validate(['documents' => $this->rules()['documents']])) {
               return redirect()->to($back)->withInput();
           }

           try {
               $added = service('passWorkflowService')->addDocuments(
                   $application->id,
                   (int) auth()->id(),
                   $this->uploadedFiles('documents'),
               );
           } catch (InvalidArgumentException $e) {
               return redirect()->to($back)->with('error', $e->getMessage());
           }

           return redirect()->to($back)->with('message', "{$added} dokumen ditambah pada {$application->ref_no}.");
       }
   ```

6. **View.** Dalam `app/Views/pas/show.php`, gantikan baris `<?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>` dengan blok di bawah. Baris komen Hari 8 itu **kekal** di hujung blok — Lab 8.1 menggantikannya esok:

   ```php
   <?php
   // Lab 7.3b: pemilik boleh menambah dokumen selagi permohonan belum disemak dan masih < 3 dokumen
   $canAddDocuments = $application->isOwnedBy((int) auth()->id())
       && $application->statusEnum() === \App\Enums\PassStatus::Submitted
       && count($documents) < \App\Services\PassWorkflowService::MAX_FILES;
   ?>
   <?php if ($canAddDocuments): ?>
       <div class="card mb-4">
           <div class="card-header"><i class="bi bi-paperclip" aria-hidden="true"></i> Tambah dokumen susulan</div>
           <div class="card-body">
               <?= form_open_multipart(url_to('pas.dokumen.tambah', $application->id), ['novalidate' => true]) ?>
                   <label for="documents" class="form-label">Dokumen sokongan</label>
                   <input type="file" name="documents[]" id="documents" multiple accept=".pdf,.jpg,.png"
                          class="form-control <?= validation_show_error('documents') ? 'is-invalid' : '' ?>">
                   <div class="invalid-feedback"><?= validation_show_error('documents') ?></div>
                   <div class="form-text">
                       PDF, JPG atau PNG · maksimum 2 MB setiap fail · boleh tambah
                       <?= esc((string) (\App\Services\PassWorkflowService::MAX_FILES - count($documents))) ?> dokumen lagi.
                   </div>
                   <button type="submit" class="btn btn-outline-primary mt-2"><i class="bi bi-upload" aria-hidden="true"></i> Muat naik</button>
               <?= form_close() ?>
           </div>
       </div>
   <?php endif ?>

   <?php /* Hari 8: panel tindakan pegawai + sejarah status akan ditambah di sini */ ?>
   ```

7. **Uji sebagai `pemohon1`** pada `PAS-2026-0001` (2 dokumen). Selepas setiap percubaan, `ls writable/uploads/pas/ | wc -l` (PowerShell: `(Get-ChildItem writable/uploads/pas/).Count`) dari folder projek:

   | # | Pilih fail | Dijangka |
   |---|-----------|----------|
   | a | `surat-2.pdf` **dan** `surat-3.pdf` | Mesej merah (soalan Kuiz S7); bilangan fail di cakera tidak berubah |
   | b | `borang.pdf` | *Hanya fail PDF, JPG atau PNG dibenarkan.* di bawah medan |
   | c | Tiada fail | *Sila lampirkan sekurang-kurangnya satu dokumen sokongan yang sah.* |
   | d | `surat-2.pdf` sahaja | *1 dokumen ditambah pada PAS-2026-0001.*; senarai 3 dokumen; kad *Tambah dokumen susulan* hilang; +1 fail di cakera |

8. **IDOR melalui borang.** Log masuk sebagai `pemohon2` (tetingkap inkognito) dan buka `PAS-2026-9002` (0 dokumen — kad muncul). DevTools (F12) → **Elements** → cari `<form … action="…/pas/permohonan/<id 9002>/dokumen">` → klik dua kali nilai `action` → tukar ID kepada ID `PAS-2026-0001` → Enter. Pilih `surat-3.pdf` → **Muat naik**. Catat respons (soalan Kuiz S7).

9. **Borang lapuk (status berubah).** Masih sebagai `pemohon2`, buka semula `PAS-2026-9002` (kad muncul). **Jangan** muat semula halaman. Dalam klien MySQL:

   ```sql
   UPDATE pass_applications SET status = 'under_review' WHERE ref_no = 'PAS-2026-9002';
   ```

   Kembali ke tab, pilih `surat-3.pdf` → **Muat naik** → *Dokumen hanya boleh ditambah sebelum permohonan mula disemak.* Kad kini tiada. Pulihkan:

   ```sql
   UPDATE pass_applications SET status = 'submitted' WHERE ref_no = 'PAS-2026-9002';
   ```

10. **Commit:**

    ```bash tab="Git Bash / macOS / Linux"
    git add app/ && git commit -m "PAS: tambah dokumen susulan, had 3 dokumen setiap permohonan (BR-PAS-02)"
    ```

    ```powershell tab="PowerShell"
    git add app/
    git commit -m "PAS: tambah dokumen susulan, had 3 dokumen setiap permohonan (BR-PAS-02)"
    ```

### ✅ Checkpoint
- [ ] `php spark routes | grep pas/permohonan` → 6 baris termasuk `pas.dokumen.tambah` dengan filter `session` (Kuiz S7).
- [ ] Kes a–c langkah 7 ditolak tanpa fail baharu di cakera; kes d menjadikan `PAS-2026-0001` 3 dokumen dan kad tambah hilang (Kuiz S7).
- [ ] `pemohon2` yang menukar `action` borang ke permohonan `pemohon1` ditolak, dan borang lapuk selepas `under_review` ditolak dengan mesej BM (Kuiz S7).
- [ ] Commit `PAS: tambah dokumen susulan, had 3 dokumen setiap permohonan (BR-PAS-02)` (Kuiz S7).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Route "pas.dokumen.tambah" not found` / `InvalidArgumentException` dalam `url_to()` | Route belum ditambah, atau ditambah di fail lain | Langkah 2 — dalam `app/Config/Routes.php`, selepas kumpulan |
| `Controller or its method is not found: \App\Controllers\ApplicationController::addDocuments` | `Pas\` tertinggal dalam rentetan controller (route di luar kumpulan tiada `namespace`) | `'Pas\ApplicationController::addDocuments/$1'` |
| Kad tambah tidak muncul untuk pemilik | Status bukan `submitted`, atau sudah 3 dokumen | Semak `SELECT status FROM pass_applications …` dan bilangan `pass_documents` |
| Mesej ralat validasi tidak dipaparkan di bawah medan | `redirect()->to(...)` tanpa `->withInput()` | `withInput()` membawa ralat validasi ke request seterusnya |
| `Call to undefined method …::assertDocumentQuota()` | Langkah 4 tertinggal | Tambah dua pembantu dalam `PassWorkflowService` |
| Fail dipindah ke cakera dahulu, kemudian baru mesej *sudah ada N dokumen* | Panggilan pertama `assertDocumentQuota()` tertinggal; hanya semakan di bawah kunci berjalan | Panggil **sebelum** gelung `storeFile()` (langkah 3) — semakan murah dahulu, cakera kemudian |

### ⭐ Cabaran tambahan
- Rekod tambahan dokumen dalam jadual audit tanpa melanggar maksud `status_logs` (`from_status` = `to_status` = `submitted`, `remarks` = *"2 dokumen ditambah"*). Adakah ini wajar, atau patut ada jadual lain? Bincang dengan jurulatih.
- Benarkan pemilik **memadam** dokumen sendiri semasa `submitted` (padam baris `pass_documents` **dan** fail di cakera — dalam tertib yang mana?).

---

## Lab 7.4b — Automasikan Kes Sempadan dengan PHPUnit (S8)

### 🎯 Objektif
Mengautomasikan 10 kes sempadan Lab 7.4 dan 4 kes Lab 7.3b dalam `tests/feature/Pas/PassSubmitTest.php` menggunakan `UploadedFile` palsu, `#[DataProvider]` dan semakan "tiada kesan sampingan" (tiada baris, tiada fail yatim), kemudian membuktikan ujian itu menangkap pepijat `>` vs `>=` dengan mutasi sengaja.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 7.4](#lab-74--ujian-manual-kes-sempadan-s4) dan [Lab 7.3b](#lab-73b--tambah-dokumen-susulan-pada-permohonan-s7) selesai.
- Database ujian `kkm_latihan_test` dan `database.tests.*` dalam `.env` (Lab 6.3): `php spark db:table --show --dbgroup tests` berjaya.

### Langkah

1. **`UploadedFile` palsu.** Dalam CLI, `is_uploaded_file()` dan `move_uploaded_file()` sentiasa `false`, jadi `UploadedFile` sebenar tidak boleh digunakan dalam ujian. Kelas ini menggantikan **dua** kaedah sahaja; `getMimeType()`, `guessExtension()` dan `getSize()` kekal kod CI4 sebenar. Folder `tests/_support/` sudah wujud (appstarter; namespace `Tests\Support` dalam `composer.json`):

   `tests/_support/FakeUploadedFile.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Support;

   use CodeIgniter\HTTP\Files\UploadedFile;

   /**
    * UploadedFile untuk ujian: fail sementara biasa, bukan dari HTTP POST.
    * Dalam CLI, is_uploaded_file() dan move_uploaded_file() sentiasa false — hanya
    * isValid() dan move() diganti. getMimeType() (finfo), guessExtension() dan getSize()
    * kekal kod CI4 sebenar, jadi semakan BR-PAS-02 diuji dengan kandungan fail sebenar.
    */
   final class FakeUploadedFile extends UploadedFile
   {
       /** Cipta fail sementara dengan kandungan & nama asal (nama dari "pelayar") yang diberi */
       public static function make(string $content, string $clientName): self
       {
           $path = tempnam(sys_get_temp_dir(), 'pas');
           file_put_contents($path, $content);

           return new self($path, $clientName, null, strlen($content), UPLOAD_ERR_OK);
       }

       public function isValid(): bool
       {
           return $this->error === UPLOAD_ERR_OK && is_file($this->path);
       }

       public function move(string $targetPath, ?string $name = null, bool $overwrite = false): bool
       {
           $targetPath = rtrim($targetPath, '/\\') . DIRECTORY_SEPARATOR;

           if (! is_dir($targetPath)) {
               mkdir($targetPath, 0775, true);
           }

           $name ??= $this->getName();
           rename($this->path, $targetPath . $name);

           $this->path     = $targetPath . $name;
           $this->name     = $name;
           $this->hasMoved = true;

           return true;
       }
   }
   ```

2. **Kelas ujian.**

   ```bash tab="Git Bash / macOS / Linux"
   mkdir -p tests/feature/Pas
   ```

   ```powershell tab="PowerShell"
   New-Item -ItemType Directory -Force tests\feature\Pas | Out-Null
   ```

   `tests/feature/Pas/PassSubmitTest.php`

   ```php
   <?php

   declare(strict_types=1);

   namespace Tests\Feature\Pas;

   use App\Enums\PassStatus;
   use App\Services\PassWorkflowService;
   use App\Services\ReferenceNumberService;
   use CodeIgniter\Exceptions\PageNotFoundException;
   use CodeIgniter\Test\CIUnitTestCase;
   use CodeIgniter\Test\DatabaseTestTrait;
   use InvalidArgumentException;
   use PHPUnit\Framework\Attributes\DataProvider;
   use Tests\Support\FakeUploadedFile;

   /**
    * Lab 7.4b — kes sempadan Lab 7.4 (UT-PAS-…) diautomasikan di lapisan Service.
    * Setiap kes ditolak mesti: (1) mesej BM yang betul, (2) tiada baris baharu, (3) tiada fail baharu di cakera.
    *
    * @internal
    */
   final class PassSubmitTest extends CIUnitTestCase
   {
       use DatabaseTestTrait;

       protected $migrate   = true;
       protected $refresh   = true;
       protected $namespace = null;   // App + Shield + Settings

       private const PDF = "%PDF-1.4\n% Dokumen sintetik latihan KKM\n";
       private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

       private PassWorkflowService $service;
       private int $applicantId;
       private int $otherApplicantId;
       private int $otherVehicleId;

       /** @var list<string> fail dalam writable/uploads/pas/ SEBELUM ujian */
       private array $filesBefore = [];

       protected function setUp(): void
       {
           parent::setUp();

           $this->applicantId      = $this->makeUser('ujian_pas1', 'Pemohon Pas Satu');
           $this->otherApplicantId = $this->makeUser('ujian_pas2', 'Pemohon Pas Dua');

           $this->db->table('vehicles')->insert(['user_id' => $this->otherApplicantId, 'plate_no' => 'WXX 0002', 'model' => 'Perodua Myvi', 'color' => 'Biru']);
           $this->otherVehicleId = (int) $this->db->insertID();

           $this->service     = new PassWorkflowService($this->db, new ReferenceNumberService($this->db));
           $this->filesBefore = $this->filesOnDisk();
       }

       protected function tearDown(): void
       {
           // Buang fail yang dicipta oleh ujian ini SAHAJA — fail latihan anda kekal
           foreach (array_diff($this->filesOnDisk(), $this->filesBefore) as $path) {
               unlink($path);
           }

           parent::tearDown();
       }

       // =================================================================
       // Kes diterima (UT-PAS-01, 02, 05)
       // =================================================================

       public function testSatuPdfSahDiterima(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('surat-sokongan.pdf')]);

           $this->assertSame('PAS-' . date('Y') . '-0001', $application->ref_no);
           $this->assertSame(PassStatus::Submitted, $application->statusEnum());
           $this->seeInDatabase('pass_documents', ['application_id' => $application->id, 'original_name' => 'surat-sokongan.pdf', 'mime' => 'application/pdf']);
           $this->seeInDatabase('status_logs', ['module' => 'PAS', 'record_id' => $application->id, 'from_status' => null, 'to_status' => 'submitted']);
           $this->assertCount(1, $this->newFiles());
       }

       public function testTigaFailSahDiterima(): void
       {
           $files = [$this->pdf('surat-sokongan.pdf'), $this->pdf('surat-2.pdf'), $this->png('gambar.png')];

           $application = $this->service->submit($this->applicantId, $this->payload(), $files);

           $this->seeNumRecords(3, 'pass_documents', ['application_id' => $application->id]);
           $this->assertCount(3, $this->newFiles());
       }

       public function testTepat2MbDiterima(): void
       {
           $file = FakeUploadedFile::make(str_pad(self::PDF, PassWorkflowService::MAX_BYTES, "\0"), 'tepat-2mb.pdf');

           $application = $this->service->submit($this->applicantId, $this->payload(), [$file]);

           $this->seeInDatabase('pass_documents', ['application_id' => $application->id, 'size_bytes' => 2_097_152]);
       }

       // =================================================================
       // Kes ditolak (UT-PAS-04, 06, 08, 09, 10, 11, 13)
       // =================================================================

       /**
        * @return array<string, array{0: list<array{0: string, 1: string}>, 1: array<string, string>, 2: string}>
        */
       public static function rejectedProvider(): array
       {
           $pdf   = ["%PDF-1.4\n", 'surat.pdf'];
           $dates = ['valid_from' => '2026-11-10', 'valid_until' => '2026-11-01'];

           return [
               'UT-PAS-04 empat fail'        => [[$pdf, $pdf, $pdf, $pdf], [], '1 hingga 3 dokumen'],
               'UT-PAS-06 2 MB + 1 bait'     => [[[str_pad("%PDF-1.4\n", 2_097_153, "\0"), 'lebih-2mb.pdf']], [], 'tidak melebihi 2 MB'],
               'UT-PAS-09 PHP bernama .pdf'  => [[["<?php phpinfo(); ?>\n", 'borang.pdf']], [], 'Hanya PDF, JPG atau PNG'],
               'PNG bernama .pdf'            => [[[base64_decode(self::PNG), 'gambar.pdf']], [], 'Hanya PDF, JPG atau PNG'],
               'UT-PAS-10 sambungan .jpeg'   => [[[base64_decode(self::PNG), 'gambar.jpeg']], [], 'Hanya PDF, JPG atau PNG'],
               'UT-PAS-11 tarikh terbalik'   => [[$pdf], $dates, 'Sah hingga'],
               'UT-PAS-13 kenderaan lain'    => [[$pdf], ['pass_type' => 'kenderaan', 'vehicle_id' => 'LAIN'], 'kenderaan anda yang berdaftar'],
           ];
       }

       /**
        * @param list<array{0: string, 1: string}> $files   [kandungan, nama asal]
        * @param array<string, string>             $override medan borang yang diubah
        */
       #[DataProvider('rejectedProvider')]
       public function testKesDitolakTanpaKesanSampingan(array $files, array $override, string $message): void
       {
           if (($override['vehicle_id'] ?? null) === 'LAIN') {
               $override['vehicle_id'] = (string) $this->otherVehicleId;   // kenderaan milik pemohon LAIN (IDOR)
           }

           $uploads = array_map(static fn (array $f): FakeUploadedFile => FakeUploadedFile::make($f[0], $f[1]), $files);

           try {
               $this->service->submit($this->applicantId, $this->payload($override), $uploads);
               $this->fail('Sepatutnya InvalidArgumentException');
           } catch (InvalidArgumentException $e) {
               $this->assertStringContainsString($message, $e->getMessage());
           }

           $this->seeNumRecords(0, 'pass_applications', []);
           $this->seeNumRecords(0, 'pass_documents', []);
           $this->assertSame([], $this->newFiles(), 'Ada fail yatim di writable/uploads/pas/');
       }

       // =================================================================
       // Lab 7.3b — tambah dokumen susulan
       // =================================================================

       public function testTambahDokumenHinggaTigaDiterima(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf'), $this->png('b.png')]);

           $added = $this->service->addDocuments($application->id, $this->applicantId, [$this->pdf('c.pdf')]);

           $this->assertSame(1, $added);
           $this->seeNumRecords(3, 'pass_documents', ['application_id' => $application->id]);
       }

       public function testTambahDokumenMelebihiTigaDitolak(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf'), $this->png('b.png')]);
           $filesAfterSubmit = count($this->newFiles());

           try {
               $this->service->addDocuments($application->id, $this->applicantId, [$this->pdf('c.pdf'), $this->pdf('d.pdf')]);
               $this->fail('Sepatutnya InvalidArgumentException');
           } catch (InvalidArgumentException $e) {
               $this->assertStringContainsString('sudah ada 2 dokumen', $e->getMessage());
           }

           $this->seeNumRecords(2, 'pass_documents', ['application_id' => $application->id]);
           $this->assertCount($filesAfterSubmit, $this->newFiles());
       }

       public function testTambahDokumenSelepasSemakanDitolak(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf')]);
           $this->db->table('pass_applications')->where('id', $application->id)->update(['status' => PassStatus::UnderReview->value]);

           $this->expectException(InvalidArgumentException::class);
           $this->expectExceptionMessage('sebelum permohonan mula disemak');

           $this->service->addDocuments($application->id, $this->applicantId, [$this->pdf('c.pdf')]);
       }

       public function testOrangLainTidakBolehTambahDokumen(): void
       {
           $application = $this->service->submit($this->applicantId, $this->payload(), [$this->pdf('a.pdf')]);

           $this->expectException(PageNotFoundException::class);

           $this->service->addDocuments($application->id, $this->otherApplicantId, [$this->pdf('c.pdf')]);
       }

       // =================================================================
       // Pembantu
       // =================================================================

       private function makeUser(string $username, string $fullName): int
       {
           $this->db->table('users')->insert(['username' => $username, 'full_name' => $fullName, 'active' => 1]);

           return (int) $this->db->insertID();
       }

       /**
        * @param array<string, string> $override
        *
        * @return array<string, string>
        */
       private function payload(array $override = []): array
       {
           return $override + [
               'pass_type'   => 'kakitangan',
               'vehicle_id'  => '',
               'purpose'     => 'Akses Blok Pentadbiran (ujian automatik)',
               'valid_from'  => '2026-11-01',
               'valid_until' => '2026-12-31',
           ];
       }

       private function pdf(string $name): FakeUploadedFile
       {
           return FakeUploadedFile::make(self::PDF, $name);
       }

       private function png(string $name): FakeUploadedFile
       {
           return FakeUploadedFile::make(base64_decode(self::PNG), $name);
       }

       /** @return list<string> */
       private function filesOnDisk(): array
       {
           return glob(WRITEPATH . PassWorkflowService::UPLOAD_DIR . '*') ?: [];
       }

       /** @return list<string> fail baharu sejak setUp() */
       private function newFiles(): array
       {
           return array_values(array_diff($this->filesOnDisk(), $this->filesBefore));
       }
   }
   ```

   Baca `rejectedProvider()`: setiap kunci (cth `UT-PAS-04 empat fail`) sepadan dengan satu baris `docs/ujian-manual-pas.md`. Kes `2 MB + 1 bait` lebih ketat daripada UT-PAS-06 manual (+1 KB).

3. **Jalankan** dan bandingkan bilangan fail di cakera sebelum dan selepas:

   ```bash tab="Git Bash / macOS / Linux"
   ls writable/uploads/pas/ | wc -l
   composer test -- --no-coverage --testdox tests/feature/Pas/PassSubmitTest.php
   ls writable/uploads/pas/ | wc -l
   ```

   ```powershell tab="PowerShell"
   (Get-ChildItem writable/uploads/pas/).Count
   composer test '--' --no-coverage --testdox tests/feature/Pas/PassSubmitTest.php
   (Get-ChildItem writable/uploads/pas/).Count
   ```

   Catat baris terakhir `OK (… tests, … assertions)` (soalan Kuiz S8). Bilangan fail di cakera **sama** sebelum dan selepas — `tearDown()` hanya memadam fail yang dicipta oleh ujian.

4. **Mutasi sengaja — adakah ujian menangkap pepijat?** Dalam `PassWorkflowService::assertFiles()`, tukar `>` kepada `>=`:

   ```php
   if ((int) $file->getSize() >= self::MAX_BYTES) {
   ```

   Jalankan semula arahan `composer test` langkah 3. Catat nama ujian yang gagal dan mesej exception (soalan Kuiz S8). Kemudian **pulihkan** `>` dan jalankan sekali lagi: `OK`.

5. **Pautkan ujian manual dengan ujian automatik.** Tambah bahagian ini di **hujung** `docs/ujian-manual-pas.md`:

   ```markdown

   ## Diautomasikan (Lab 7.4b)

   `composer test -- --no-coverage --testdox tests/feature/Pas/PassSubmitTest.php`

   | Kes manual | Ujian PHPUnit |
   |------------|---------------|
   | UT-PAS-01 | `testSatuPdfSahDiterima` |
   | UT-PAS-02 | `testTigaFailSahDiterima` |
   | UT-PAS-05 | `testTepat2MbDiterima` |
   | UT-PAS-04, 06, 09, 10, 11, 13 | `testKesDitolakTanpaKesanSampingan` (data set `UT-PAS-…`) |
   | Lab 7.3b | `testTambahDokumen…`, `testOrangLainTidakBolehTambahDokumen` |

   Kekal manual: UT-PAS-03, 07, 08, 12 (rules controller), 14–16 (HTTP & server), 17.
   ```

6. **Commit dan push:**

   ```bash tab="Git Bash / macOS / Linux"
   git add tests/ docs/ && git commit -m "PAS: ujian PHPUnit kes sempadan muat naik (BR-PAS-02/06)"
   git push
   ```

   ```powershell tab="PowerShell"
   git add tests/ docs/
   git commit -m "PAS: ujian PHPUnit kes sempadan muat naik (BR-PAS-02/06)"
   git push
   ```

### ✅ Checkpoint
- [ ] `composer test -- --no-coverage tests/feature/Pas/PassSubmitTest.php` → `OK`, dan bilangan fail dalam `writable/uploads/pas/` sama sebelum dan selepas (Kuiz S8).
- [ ] Mutasi `>=` dalam `assertFiles()` menyebabkan tepat satu ujian gagal; selepas dipulihkan semua ujian `OK` semula (Kuiz S8).
- [ ] `docs/ujian-manual-pas.md` ada bahagian *Diautomasikan (Lab 7.4b)*; commit `PAS: ujian PHPUnit kes sempadan muat naik (BR-PAS-02/06)` di-push (Kuiz S8).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Class "Tests\Support\FakeUploadedFile" not found` | Fail di folder lain, atau `autoload-dev` tiada dalam `composer.json` | Mesti `tests/_support/FakeUploadedFile.php`; semak `"Tests\\Support\\": "tests/_support"`, kemudian `composer dump-autoload` |
| `Unable to connect to the database` / ujian memadam data latihan | `database.tests.*` tiada atau menunjuk `kkm_latihan` | Lab 6.3: kumpulan `tests` → `kkm_latihan_test` **sahaja** |
| `Ada fail yatim di writable/uploads/pas/` | Semakan dipindah selepas `storeFile()` **dan** `deleteStoredFiles()` tiada dalam `catch` `submit()` | `assertFiles()` sebelum gelung `storeFile()`; `catch` memadam fail yang sudah dipindah |
| Semua kes `rejectedProvider` gagal dengan `Sepatutnya InvalidArgumentException` | `submit()` menerima fail tidak sah — `mime`/`guessExtension()` tiada | Semak `assertFiles()` Lab 7.3 dan extension `fileinfo` (`php -m`) |
| Fail `pas…` kekal dalam `%TEMP%` | `move()` palsu tidak dipanggil kerana fail ditolak | Normal — fail sementara OS; boleh dipadam bila-bila |

### ⭐ Cabaran tambahan
- Tambah kes `valid_until = valid_from` (sempadan BR-PAS-06 yang **sah**) dan kes pas kenderaan dengan kenderaan sendiri ke dalam ujian "diterima".
- Mutasi kedua: buang `$this->deleteStoredFiles($stored);` dalam `catch` `submit()`. Adakah mana-mana ujian gagal? Kenapa? (Petunjuk: di mana setiap kes ditolak — sebelum atau selepas `storeFile()`?)

---

## Semakan kendiri — akhir hari

```bash
git log --oneline -9                    # 8 commit PAS: hari ini (4 lab teras + 4 lab lanjutan)
php spark routes | grep pas/permohonan  # 6 laluan (5 + Lab 7.3b), filter session
composer test -- --no-coverage tests/feature/Pas/PassSubmitTest.php   # OK (Lab 7.4b)
ls writable/uploads/pas/ | head         # nama rawak sahaja
git status                              # bersih; writable/uploads tidak dijejak
```

🪟 PowerShell: `php spark routes | Select-String pas/permohonan`, `composer test '--' --no-coverage tests/feature/Pas/PassSubmitTest.php`, `Get-ChildItem writable/uploads/pas/ -Name | Select-Object -First 10`.

Peserta yang ketinggalan: salin dari `templates/kod/` (modul **Templat & Rujukan**) **selepas** jurulatih/rakan menerangkan setiap bahagian — dan tandakan dalam commit (`PAS: … (rujuk templat)`).
