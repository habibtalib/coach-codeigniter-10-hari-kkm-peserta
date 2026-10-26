# Lab Hari 9 — Kerja Pasukan: Sprint 2

[← README](./README.md) · [Jadual](../JADUAL.md) · [👥 Peranan pasukan](../docs/peranan-pasukan.md) · [💬 Pustaka prompt §H](../docs/pustaka-prompt.md)

| Lab | Sesi | Masa | Hasil |
|-----|------|------|-------|
| 9.20 | S13 | 09:00–10:30 | Isu Sprint 2 `status::sedia`, nota sync PM, ujian gagal dari AC, slice 1 |
| 9.21 | S14 | 10:45–12:30 | Ciri Sprint 2 skuad slice demi slice dengan ujian hijau |
| 9.22 | S15 | 14:30–16:00 | MR `Ready` + semakan QA; ≥ 1 isu Pepijat merentas skuad |
| 9.23 | S16 | 16:00–17:00 | Semua MR di-merge, `main` hijau (PHPUnit + E2E), demo sprint, retro |

> ℹ️ Repo: `aplikasi-baharu/espkpv2`. Mekanik isu → branch → MR → merge sama seperti [Lab 8.21–8.23](../hari-8/lab.md#lab-821--sprint-1-pagi-isu-pelan-ujian--slice-pertama-s16); lab hari ini menambah sync PM, ujian merentas skuad dan `main` hijau. Lab individu Modul Laporan (9.1–9.13) dalam [Lampiran](#lampiran--lab-individu-modul-laporan-rujukan).

---

## Lab 9.20 — Perancangan Sprint 2, Sync PM & Slice 1 (S13)

### 🎯 Objektif
Merancang Sprint 2 skuad (isu baharu + susulan Sprint 1), **menyelaras** fail dikongsi dan susunan merge dengan PM lain, dan memulakan slice pertama dengan ujian gagal dari AC.

### Prasyarat
- `git switch main && git pull && composer install && php spark migrate --all` — `composer test` hijau.
- Peranan pagi: slot *Hari 9 pagi* dalam [`peranan-pasukan.md`](../docs/peranan-pasukan.md) §3 (tempat 3 = PM, 4 = QA, 1 & 2 = Dev).

### Langkah

1. **Stand-up (08:30, semua).** Setiap orang 2 minit: siap · seterusnya · tersekat. PM mencatat penyekat sebagai komen dalam isu berkaitan.

2. **PM — isu Sprint 2 (20 minit).**

   ```bash
   glab issue list --milestone "Sprint 2 (Hari 9)" --label skuad::<x>
   ```

   ```text
   /isu-baharu <13>
   ```

   Sertakan isu susulan Sprint 1 (AC yang belum siap). Kapasiti: satu isu bersaiz M setiap pasangan Dev setiap separuh hari. Isu lebih → turunkan ke backlog dengan komen sebab.

3. **PM — sync (09:00, 15 minit, tiga PM + jurulatih).** Setiap PM menjawab dalam komen isu utama skuad:

   ```markdown
   **Sync PM — Sprint 2**
   - Fail dikongsi yang akan disentuh: …
   - Bergantung pada skuad lain: …
   - Susunan merge dipersetujui: …
   ```

4. **QA — pelan ujian dan ujian gagal (60 minit).** Ritma [Lab 8.21 — QA](../hari-8/lab.md#lab-821--sprint-1-pagi-isu-pelan-ujian--slice-pertama-s16): jadual AC → kes ujian dalam komen isu, AI-25 (`penguji-espkp`), AI-26 (satu ujian gagal). Skuad A (#13), sebelum menulis ujian:

   ```text
   Mod Plan. Bagaimana ujian sedia ada mengawal masa (service('jam')) dan emel (service('notifikasi')) supaya perintah peringatan boleh diuji tanpa menunggu 7 hari? Tunjukkan fail:baris contoh dalam tests/.
   ```

5. **Dev — slice 1 (60 minit).** Ritma [Lab 8.21 — Dev](../hari-8/lab.md#lab-821--sprint-1-pagi-isu-pelan-ujian--slice-pertama-s16): AI-29 → `/ciri-baharu <no>` → branch `feat/<no>-<ringkas>` → slice 1 (mod *Manual*) → `composer semak` → `semak-espkp` → commit `Rujuk #<no>` → push.

### ✅ Checkpoint
- [ ] Isu Sprint 2 `status::sedia` dengan *Assignee*.
- [ ] Ketiga-tiga skuad mencatat susunan merge yang **sama**.
- [ ] Ujian gagal kerana ciri tiada, dengan mesej yang menyebut AC.
- [ ] Branch Sprint 2 dengan commit pertama; label `status::dalam-kerja`.

---

## Lab 9.21 — Bina Sprint 2: Ciri Skuad (S14)

### 🎯 Objektif
Melaksanakan ciri Sprint 2 skuad slice demi slice, dengan perhatian khusus pada risiko teknikal skuad (idempoten, keserasian akaun latihan, CSP dan had eksport).

### Langkah

1. **Teruskan slice** (pemandu bertukar setiap slice). Setiap slice: mod *Manual* → navigator membaca diff → `composer semak` → `semak-espkp` → commit `Rujuk #<no>`.

2. **Semakan risiko skuad** — sebelum slice terakhir, tanya Claude (mod *Plan*) dan sahkan sendiri:

   | Skuad | Prompt | Sahkan |
   |---|---|---|
   | A — #13 | `Adakah perintah peringatan Pindaan idempoten? Tunjukkan baris yang menghalang emel kedua dan ujian yang membuktikannya.` | Jalankan `php spark espkp:peringatan` dua kali pada data dev; emel kedua tiada (log / TAC skrin) |
   | B — #9 | `Adakah akaun latihan 9001010100NN dengan Latihan@2026 masih lulus dasar baharu? Tunjukkan ujian.` | Log masuk `900101010001` di pelayar |
   | B — #8 | `Draf job CI mariadb dalam .gitlab-ci.yml yang menjalankan migrate --all dan suite Database pada mariadb:10.6, tanpa mengubah job ujian sedia ada.` | `composer validate`; baca YAML; job baharu sahaja |
   | C — #17 | `Adakah carta RPT-10 menggunakan laporan/_carta dan data-carta tanpa <script> sebaris? Adakah eksport melalui EksportService dengan had dan audit?` | DevTools → tiada ralat CSP; muat turun XLSX, jumlah = jadual |

3. **QA** menyambungkan ujian AC yang lain ke dalam branch (selaras dengan Dev), dan menjalankan `vendor/bin/phpunit --filter <Kelas>` selepas setiap commit Dev.

### ✅ Checkpoint
- [ ] ≥ 2 slice di-commit; ujian QA untuk AC teras **lulus**.

---

## Lab 9.22 — MR, Semakan & Ujian Merentas Skuad (S15)

### 🎯 Objektif
Selepas tukar peranan, membawa Sprint 2 ke MR yang disemak QA, dan **menguji secara eksploratori** ciri skuad lain yang sudah di-merge.

### Langkah

1. **Tukar peranan** (slot *Hari 9 petang*: tempat 4 = PM, 1 = QA, 2 & 3 = Dev). Baca komen *Serah tugas* dalam isu.

2. **Dev — MR** seperti [Lab 8.22 — Dev](../hari-8/lab.md#lab-822--sprint-1-petang-mr-semakan-qa--papan-s17): MR draf → senarai semak → *Tiga baris utama* → *Ready* → `status::semakan`.

3. **QA — semak MR skuad sendiri** dengan `/semak-mr <no-MR>` (AI-27), buka setiap `fail:baris`, approve atau minta perubahan.

4. **QA — ujian eksploratori merentas skuad (30 minit).** QA skuad A menguji ciri skuad B, B → C, C → A, pada `main` terkini. Gunakan sekurang-kurangnya tiga akaun latihan (contoh 01 pemohon, 07 wakil, 05 pelulus) dan lebar 360px (DevTools → *Toggle device*). Untuk setiap pemerhatian:

   ```text
   Draf isu Pepijat ikut .gitlab/issue_templates/Pepijat.md daripada pemerhatian ini: <langkah, jangkaan, sebenar, akaun>. Data sintetik sahaja. Jangan cipta isu.
   ```

   Ulang langkah sendiri, kemudian cipta isu dengan label skuad **pemilik** ciri:

   ```bash
   glab issue create --title "<ringkas>" --label "jenis::pepijat,skuad::<pemilik>,status::baharu" --description "$(cat pepijat.md)"
   ```

5. **PM** — papan, penyekat, dan sahkan semula susunan merge S16 dengan PM lain.

### ✅ Checkpoint
- [ ] ≥ 1 isu Pepijat yang skuad pemilik berjaya ulang.

---

## Lab 9.23 — Merge, `main` Hijau, Demo Sprint & Retro (S16)

### 🎯 Objektif
Me-merge Sprint 2 mengikut susunan sync, **membuktikan** `main` hijau dengan PHPUnit dan E2E, dan merancang skop v1.1.0.

### Langkah

1. **Merge** mengikut susunan (Lab 8.23 langkah 1–4: QA approve → PM merge → MR lain rebase → `composer semak` → `--force-with-lease`).

2. **`main` hijau (satu Dev setiap skuad).**

   ```bash
   git switch main && git pull
   composer install
   php spark migrate --all
   composer test
   ```

3. **E2E (QA setiap skuad, sekali).** Ikut bahagian *Ujian hujung ke hujung (E2E)* dalam README espkpv2: database `espkp_contoh_e2e` berasingan, fail env di luar repo, server `php -S localhost:8095`, kemudian:

   ```bash
   npm install && npx playwright install chromium
   npm run e2e:sedia
   npm run e2e
   ```

   Merah → minta Claude: `Spesifikasi E2E ini gagal pada main selepas merge !<a> dan !<b>: <output>. Commit mana yang mungkin punca? Jangan baiki lagi.` Skuad punca membuka isu Pepijat `keutamaan::1-kritikal`.

4. **Demo sprint (3 minit setiap skuad)** dan **retro** (isu `Retro Sprint 2 — Skuad <X>`: berjalan baik, ubah, satu peraturan prompt).

5. **Skop v1.1.0 (PM).** Dalam milestone *Sprint 3 + v1.1 (Hari 10)*: isu Sprint 3, pepijat kritikal, dan isu yang **tidak** masuk v1.1.0 dialihkan ke backlog.

### ✅ Checkpoint
- [ ] `composer test` hijau; E2E hijau atau setiap kegagalan ada isu Pepijat kritikal.
- [ ] Milestone Sprint 3 mengandungi skop v1.1.0 yang dipersetujui ketiga-tiga PM.

### Kesilapan lazim
| Gejala | Punca | Penyelesaian |
|---|---|---|
| E2E memadam data dev anda | E2E dijalankan pada `espkp_contoh_dev` | Fail env E2E dengan `database_default_database=espkp_contoh_e2e`; `migrate --all` + `db:seed` dev semula |
| `composer test` hijau setempat, CI merah pada RPT-10 | `ONLY_FULL_GROUP_BY` di MySQL 8.4 CI | Tambah lajur dalam `GROUP BY` atau guna aggregate; uji pada MySQL 8 setempat |
| Dua migration skuad bertembung | Versi sama | Awalan skuad (`…-1xxxxx_` A, `2…` B, `3…` C) |

---

## Semakan kendiri — akhir hari

**Kerja pasukan (hari ini):** `glab mr list --merged -R aplikasi-baharu/espkpv2`, `glab issue list --label jenis::pepijat -R aplikasi-baharu/espkpv2`.

- [ ] Isu Sprint 2 skuad saya dirancang dan nota sync PM dicatat dalam isu (Lab 9.20).
- [ ] Ciri Sprint 2 skuad saya di-merge melalui MR dengan semakan QA dan ujian hijau (Lab 9.21–9.23).
- [ ] Saya menguji ciri skuad lain dan sekurang-kurangnya satu isu Pepijat merentas skuad dicipta (Lab 9.22).
- [ ] `composer test` dan E2E hijau pada `main` selepas semua merge, atau setiap kegagalan ada isu kritikal (Lab 9.23).

**Modul Laporan individu (rujukan, tidak wajib):**

```bash
composer test                                                     # semua hijau (termasuk ReportServiceTest)
php spark laporan:explain tempahan approved 2026-06-01 2026-06-30 # pelan EXPLAIN dicetak tanpa ralat
git status --short                                                # tiada output
git log --oneline -10                                             # commit RPT: hari ini
```

- [ ] `/laporan/tempahan`, `/laporan/pas` dan `/laporan/penggunaan` dimuat dengan filter GET; "Jumlah rekod" RPT-01 `status=approved` = `COUNT(*)` SQL (Kuiz S2).
- [ ] `?export=pdf` dan `?export=xlsx` memuat turun fail yang boleh dibuka bagi ketiga-tiga laporan; `pemohon1@latihan.test` ditolak (Kuiz S3).
- [ ] `composer test` hijau, termasuk `tests/Services/ReportServiceTest.php` (≥ 7 ujian) (Kuiz S4).
- [ ] `php spark laporan:explain tempahan approved 2026-06-01 2026-06-30` menunjukkan `key` bukan `NULL` untuk jadual `b` (Kuiz S4).
- [ ] `git status --short` kosong dan branch `feat/laporan` sudah di-push (MR ke `main` dibuka) (Kuiz S4).
- [ ] Butang **Bulan ini / Bulan lepas / Tahun ini** dan cip filter aktif berfungsi pada ketiga-tiga laporan (Lab 9.1b) (Kuiz S5).
- [ ] Jumlah butang ringkasan status RPT-01/RPT-02 = "Jumlah rekod", dan baris JUMLAH RPT-03 ialah purata berwajaran (Lab 9.2b) (Kuiz S6).
- [ ] Excel RPT-01/RPT-02 ada tab *Ringkasan* dengan formula `=SUM()`, dan PDF ada jadual ringkasan (Lab 9.3b) (Kuiz S7).
- [ ] `ReportServiceTest` hijau dengan ≥ 12 ujian, dan commit Lab 9.4b di-push ke MR `feat/laporan` (Lab 9.4b) (Kuiz S8).

---

## Lampiran — Lab individu Modul Laporan (rujukan)

> ℹ️ Lab di bawah ialah lab Hari 9 sebelum mod pasukan: Modul Laporan dibina secara individu dalam `kelas-ci-<nama>` dengan Claude Code (Lab 9.10–9.13) atau secara manual (Lab 9.1–9.4b). Ia kekal sebagai **rujukan, tidak wajib**.

## Lab 9.10 — Claude Code: `ReportService` & Penapis Whitelist (S9)

### 🎯 Objektif
Membina slice L1 Modul Laporan dengan Claude Code: route `/laporan/*` dengan `permission:laporan.view`, `ReportController` nipis, dan `ReportService` (`normaliseFilters()` dengan whitelist, `builder()` dengan `join()` + `when()` + binding, `applySort()` dengan whitelist lajur). Anda **menulis jadual input → hasil penapis sendiri** dahulu, kemudian **membuktikan** setiap baris dengan `php spark shell` dan tool MCP `ci4-spark`.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- M1 dan M2 di-merge ke `main` (Lab 8.13); `composer test` hijau.
- Lab 7.6–7.8: `CLAUDE.md`, subagent `semak-ci4`, server MCP `ci4-spark` *connected*.
- `php spark shell` (Hari 3, [`arahan-spark.md`](../docs/arahan-spark.md)) berfungsi.

### Langkah

0. **Branch & data demo.**

   ```bash tab="Git Bash / macOS / Linux"
   git switch main && git pull
   git switch -c feat/laporan-claude
   ```

   ```powershell tab="PowerShell"
   git switch main
   git pull
   git switch -c feat/laporan-claude
   ```

   Data demo: ikut Lab 9.1 **langkah 0** sahaja (salin `DemoDataSeeder.php.txt`, tambah panggilan dalam `DatabaseSeeder::run()`, jalankan seeder). Ini data, bukan latihan menulis kod.

   > 📚 **Rujukan sahaja:** Lab 9.1–9.4 (manual) ialah kod rujukan Modul Laporan. Anda **tidak** perlu menaipnya. Buka hanya pada langkah *Banding dengan kod rujukan* atau apabila diff Claude meragukan.

1. **SPEC & jadual penapis (anda, 15 minit).** Baca SPEC §2.3 (RPT-01..03 dan penapisnya), §5 (`ReportService`), §6 (route laporan) dan §10 (*Jangan tulis SQL mentah dengan input pengguna*). Kemudian:
   - Salin kad spesifikasi Lab 9.1 langkah 1 ke `docs/laporan-spec.md` dan isi sendiri untuk RPT-01 dan RPT-02.
   - Tambah jadual sasaran penapis ini dan isi lajur kanan **sebelum** membuka Claude:

   ```markdown
   ## Penapis — sasaran (slice L1)
   | Input ?query | Hasil $filters dijangka |
   |--------------|-------------------------|
   | from=2026-06-01 | |
   | from=2026-02-31 | |
   | from=2026-06-30&to=2026-06-01 | |
   | status=approved | |
   | status=bogus | |
   | status[]=approved | |
   | sort=b.id; DROP TABLE users | |
   | dir=sideways | |
   ```

2. **Pelan (mod Plan).** Mulakan `claude`, tekan `Shift+Tab` (atau `Alt+M`) hingga **plan mode**, kemudian tampal:

   ```text
   Mod Plan. Jangan ubah sebarang fail.
   Slice L1 Modul Laporan: route, controller rangka dan ReportService (penapis + builder), tanpa view lagi.
   Baca @docs/spesifikasi-sistem.md bahagian 2.3, 3, 5, 6, 9 dan 10, @docs/laporan-spec.md,
   @app/Enums/BookingStatus.php, @app/Enums/PassStatus.php, @app/Enums/PassType.php dan @app/Enums/SlotCategory.php.
   Cadangkan pelan bernombor (maksimum 5 langkah). Setiap langkah: fail, kaedah, apa berubah, cara saya uji.
   Pelan mesti mengandungi:
   - Route group laporan (tempahan, pas, penggunaan) dengan filter permission:laporan.view.
   - ReportController nipis: bookings(), passes(), usage() memanggil service('reportService').
   - ReportService::normaliseFilters(string $report, array $input): setiap nilai melalui whitelist —
     enum ::tryFrom(), tarikh sah (Y-m-d dan wujud), julat terbalik ditukar, id positif sahaja,
     array ditolak, sort hanya kunci dalam pemalar SORTABLE (kunci URL => lajur SQL), dir hanya asc/desc.
     Mesti memenuhi jadual "Penapis — sasaran" dalam @docs/laporan-spec.md.
   - ReportService::builder(string $report, array $f): Query Builder dengan join() dan when();
     RPT-01 julat bertindih (start_date <= :to AND end_date >= :from, BR-TLK-01);
     RPT-02 created_at separuh terbuka (>= from, < to + 1 hari); departments LEFT JOIN.
   - applySort() yang hanya menghantar lajur dari SORTABLE ke orderBy(), dengan id sebagai susunan kedua.
   - Daftar reportService dalam app/Config/Services.php.
   Tiada SQL bercantum input. Jangan sentuh migration atau ujian. Tanya saya dahulu jika ada yang kabur.
   ```

   **Pelan yang baik mengandungi:** whitelist sebelum query (penapis dibersihkan sekali, kemudian builder hanya menerima `$filters` bersih); `where('b.status', $f['status'])` (binding automatik); `SORTABLE` sebagai pemalar; julat tarikh yang berbeza bagi RPT-01 (bertindih) dan RPT-02 (separuh terbuka); nama route dan kelas tepat SPEC §5–§6.

   **TOLAK pelan jika:** `orderBy($this->request->getGet('sort'))` atau mana-mana input terus ke `orderBy()`/`select()`; `where("status = '$status'")`; validasi penapis dalam controller sahaja; `group:` menggantikan `permission:laporan.view`; query berasingan untuk setiap laporan tanpa `builder()` dikongsi; view atau eksport dalam slice ini.

   Sunting pelan dan salin pelan akhir ke `docs/nota-claude.md` → bahagian baharu *Slice L1 — ReportService (Lab 9.10)*.

3. **Laksana dalam mod Manual** (`Shift+Tab` hingga tiada *plan mode* atau *accept edits*; *auto*/*bypass* dilarang), satu langkah pada satu masa:

   ```text
   Laksana langkah 1 pelan sahaja. Sebelum setiap Edit, terangkan dalam 2 baris apa yang berubah dan kenapa.
   Jangan jalankan php spark, composer atau git. Berhenti selepas langkah 1.
   ```

   **Diff yang baik:** `PassStatus::tryFrom($this->str($input, 'status') ?? '')?->value`; `array_key_exists((string) $sort, self::SORTABLE[$report]) ? $sort : $defaultSort`; `->when($f['status'] ?? null, static fn (BaseBuilder $q, string $s) => $q->where('p.status', $s))`; `->orderBy(self::SORTABLE[$report][$f['sort']], $f['dir'])->orderBy('p.id', $f['dir'])`.

   **TOLAK diff jika:** nilai `$_GET` mentah sampai ke `builder()`; `$db->query("... {$x} ...")`; `like()` atau `orWhere()` tanpa `groupStart()`; `escape()` manual menggantikan binding; tarikh `<= to` pada `created_at` (hari terakhir tercicir); fail di luar pelan.

4. **Sahkan (anda sendiri).**
   - MCP (mod Plan): `Guna tool ci4-spark filter_check untuk GET /laporan/pas dan GET /laporan/tempahan.` Dijangka: `permission:laporan.view` dalam *Before Filters*. Bandingkan dengan `php spark routes` sendiri.
   - `php spark shell` (🪟 Git Bash: `winpty php spark shell` jika prompt tergantung), satu baris pada satu masa:

     ```php
     $r = service('reportService');
     print_r($r->normaliseFilters('pas', ['status' => 'bogus', 'sort' => 'b.id; DROP TABLE users', 'dir' => 'sideways']));
     print_r($r->normaliseFilters('tempahan', ['from' => '2026-06-30', 'to' => '2026-06-01', 'status' => ['approved']]));
     echo $r->builder('pas', $r->normaliseFilters('pas', ['status' => 'approved', 'from' => '2026-09-01', 'to' => '2026-09-30']))->getCompiledSelect();
     ```

     Dijangka: baris 1 → `status` kosong, `sort` = `created_at`, `dir` = `desc`; baris 2 → `from` `2026-06-01`, `to` `2026-06-30`, `status` kosong; baris 3 → SQL dengan `LEFT JOIN` `departments`, `'approved'` dilepaskan, `created_at >= '2026-09-01 00:00:00'` dan `created_at < '2026-10-01 00:00:00'`. Tandakan setiap baris jadual *Penapis — sasaran* sebagai ✔ atau ✘.
   - `composer test` → hijau (M1/M2 tidak rosak).

5. **Semakan `semak-ci4`** (mod Plan):

   ```text
   Guna subagent semak-ci4 untuk menyemak app/Services/ReportService.php, app/Controllers/Laporan dan app/Config/Routes.php. Fokus kategori 4 (Query Builder, orderBy, whitelist).
   ```

   Baiki dapatan sahih melalui gelung yang sama; rekod dapatan palsu dengan sebabnya.

6. **Gerbang terang.** Dalam `docs/nota-claude.md` (Slice L1), 3 baris dengan ayat sendiri: baris `SORTABLE`/`array_key_exists` untuk `sort`, satu baris `tryFrom()`, dan baris julat `created_at <`. Untuk setiap satu: *input jahat apa yang disekat, dan apa jadi jika dibuang*.

7. **Commit kecil:**

   ```bash
   git add app/ docs/
   git commit -m "RPT: ReportService — penapis whitelist & builder berbinding (slice L1)"
   ```

8. **Banding dengan kod rujukan.** Buka [Lab 9.2](#lab-92--reportservice-join-penapis-dinamik-aggregate-pagination-s2) langkah 2 (`normaliseFilters()`), 3–5 (builder dan `applySort()`). Catat dalam `docs/nota-claude.md` satu perbezaan dan sama ada ia boleh diterima.

### ✅ Checkpoint
- [ ] Jadual *Penapis — sasaran* diisi oleh anda sebelum pelan, dan kelapan-lapan baris ✔ dalam `php spark shell` (Kuiz S9).
- [ ] `filter_check` (MCP) dan `php spark routes` menunjukkan `permission:laporan.view` pada ketiga-tiga route laporan (Kuiz S9).
- [ ] SQL `getCompiledSelect()` RPT-02 menunjukkan `LEFT JOIN` dan julat `created_at` separuh terbuka (Kuiz S9).
- [ ] Tiada input pengguna sampai ke `orderBy()` tanpa melalui `SORTABLE`; dapatan `semak-ci4` direkod (Kuiz S9).
- [ ] Gerbang terang 3 baris diisi dengan ayat anda sendiri (Kuiz S9).
- [ ] Commit `RPT: ReportService — penapis whitelist & builder berbinding (slice L1)` dalam `git log` (Kuiz S9).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `php spark shell` tergantung dalam Git Bash | mintty tidak menyokong input interaktif PHP | `winpty php spark shell`, atau guna terminal PowerShell VS Code |
| `Call to undefined method ... reportService()` | Service belum didaftar dalam `app/Config/Services.php` | Lihat langkah pelan; tolak diff yang mencipta `new ReportService()` dalam controller tanpa pendaftaran |
| `php spark routes \| grep laporan` gagal dalam PowerShell | `grep` tiada | `php spark routes \| Select-String laporan` |
| `filter_check` dalam Git Bash: route tidak dijumpai | Git Bash menukar `/laporan/pas` kepada path Windows | `MSYS_NO_PATHCONV=1 php spark filter:check GET /laporan/pas` |
| `print_r` dalam shell mencetak `Array ( )` kosong | Kunci input salah eja (`from_date` bukan `from`) | Guna kunci SPEC: `from`, `to`, `status`, `pass_type`, `department_id`, `zone_id`, `category`, `sort`, `dir` |
| `Unknown column 'd.name'` | `departments` di-join dengan alias berbeza | Tolak diff; minta Claude ikut alias pelan (`p`, `u`, `d`) |

### ⭐ Cabaran tambahan
- Minta Claude (mod Plan) mencari satu input `?query` yang masih melepasi `normaliseFilters()` tetapi menghasilkan laporan kosong secara senyap. Tambah baris itu ke jadual sasaran dan putuskan sendiri tingkah laku yang betul.

---

## Lab 9.11 — Claude Code: Paparan Senarai Laporan & RPT-03 (S10)

### 🎯 Objektif
Membina slice L2: borang penapis `method="get"` yang mengekalkan nilai, jadual berpagination yang membawa penapis yang sama, pengepala boleh disusun (whitelist), pautan eksport dari penapis **bersih**, dan RPT-03 aggregate (`selectCount()` + `groupBy()`). Anda **menguji** XSS dalam atribut dan kebocoran akses sendiri.

### Prasyarat
- Lab 9.10 selesai dan di-commit di `feat/laporan-claude`.

### Langkah

1. **SPEC (anda, 5 minit).** Baca SPEC §2.3 (*paparan HTML berpagination + butang Eksport PDF + Eksport Excel; filter sama dibawa melalui query string*) dan README §1.3–§1.4. Dalam `docs/nota-claude.md`, tulis bahagian *Slice L2* dengan 4 perkara yang anda akan uji: penapis kekal selepas hantar, penapis kekal di halaman 2, pautan eksport membawa penapis yang sama, dan `pemohon1` ditolak.

2. **Pelan (mod Plan):**

   ```text
   Mod Plan. Jangan ubah sebarang fail.
   Slice L2 Modul Laporan: paparan senarai RPT-01/RPT-02 dan RPT-03 aggregate.
   Baca @docs/spesifikasi-sistem.md bahagian 2.3, 3 dan 6, @docs/laporan-spec.md,
   @app/Services/ReportService.php, @app/Controllers/Laporan/ReportController.php dan @app/Views/layouts/main.php.
   Cadangkan pelan bernombor (maksimum 5 langkah). Setiap langkah: fail, apa berubah, cara saya uji.
   Pelan mesti mengandungi:
   - Satu view app/Views/laporan/index.php untuk ketiga-tiga laporan: borang method="get" yang
     mengekalkan nilai dari $filters BERSIH (bukan $_GET), setiap nilai melalui esc(..., 'attr').
   - ReportService::paginate(): jumlah rekod + baris halaman semasa dari builder() yang sama.
   - Pager yang mengekalkan penapis di setiap halaman.
   - Pengepala lajur boleh disusun hanya bagi kunci dalam SORTABLE.
   - Pautan Eksport PDF/Excel dibina dari toQuery($filters) + export=pdf|xlsx (eksport sebenar dalam slice L3).
   - RPT-03 usageByZone(): selectCount() + groupBy() mengikut zon bagi bulan/tahun; peratus penggunaan dikira dalam PHP.
   - Pautan menu Laporan hanya jika auth()->user()->can('laporan.view') (UX sahaja).
   Jangan ubah normaliseFilters() atau route. Tanya saya dahulu jika ada yang kabur.
   ```

   **Pelan yang baik mengandungi:** satu sumber penapis (`$filters` dari `normaliseFilters()`) untuk borang, pager, pengepala susun dan pautan eksport; `esc()` dengan konteks `'attr'` dalam atribut; `GET` (bukan `POST`) untuk borang penapis.

   **TOLAK pelan jika:** borang `method="post"`; nilai borang atau pautan dibina dari `$_GET`/`$this->request->getGet()` mentah; query aggregate RPT-03 ditulis sebagai SQL mentah bercantum; `getResultArray()` untuk semua baris tanpa pagination; menu disembunyikan sebagai satu-satunya kawalan akses.

   Sunting pelan dan salin ke `docs/nota-claude.md`.

3. **Laksana dalam mod Manual**, satu langkah pada satu masa:

   ```text
   Laksana langkah 1 pelan sahaja. Sebelum setiap Edit, terangkan dalam 2 baris apa yang berubah dan kenapa.
   Jangan jalankan php spark, composer atau git. Berhenti selepas langkah 1.
   ```

   **Diff yang baik:** `<input type="date" name="from" value="<?= esc($filters['from'] ?? '', 'attr') ?>">`; `href="<?= current_url() . '?' . esc(http_build_query($query + ['export' => 'pdf']), 'attr') ?>"`; `->selectCount('b.id', 'bookings')->groupBy('z.id')`.

   **TOLAK diff jika:** `value="<?= $_GET['from'] ?>"` atau `value="<?= $filters['from'] ?>"` tanpa `esc()`; `<?= $row['full_name'] ?>` tanpa `esc()`; pautan eksport dari `$_GET`; pengepala susun menerima nama lajur dari URL tanpa semakan `SORTABLE`.

4. **Sahkan (anda sendiri)** sebagai `penyemak@latihan.test`:
   - `/laporan/pas?status=approved` → hantar borang dengan `pass_type`; kedua-dua nilai kekal dalam borang; klik halaman 2 → URL masih ada `status` dan `pass_type`.
   - Hover pautan **Eksport Excel** → URL membawa penapis yang sama + `export=xlsx`.
   - XSS atribut: buka `/laporan/tempahan?from=%22%3E%3Cb%3Ex` → *View Page Source*: nilai `from` kosong (tarikh tidak sah dibuang) dan tiada `<b>` mentah dalam HTML.
   - Debug Toolbar → *Database*: query laporan menunjukkan nilai penapis dalam `WHERE`, `LIMIT 20`.
   - `/laporan/penggunaan?year=2026&month=6` → satu baris bagi setiap zon dengan peratus penggunaan.
   - Log masuk `pemohon1@latihan.test` → buka `/laporan/pas` → redirect dengan mesej Shield; menu Laporan tiada.

5. **Semakan `semak-ci4`** (mod Plan):

   ```text
   Guna subagent semak-ci4 untuk menyemak app/Views/laporan, app/Services/ReportService.php dan app/Views/layouts/main.php. Fokus kategori 1 (esc() dan konteks attr/url).
   ```

6. **Gerbang terang.** Dalam `docs/nota-claude.md` (Slice L2), 3 baris dengan ayat sendiri: baris `esc(..., 'attr')` dalam borang, baris pautan eksport dari `$query`, dan baris `groupBy()` RPT-03.

7. **Commit kecil:**

   ```bash
   git add app/ docs/
   git commit -m "RPT: paparan senarai berpagination & RPT-03 aggregate (slice L2)"
   ```

8. **Banding dengan kod rujukan.** Buka [Lab 9.1](#lab-91--reka-bentuk-laporan--borang-penapis-get-s1) langkah 4 (borang) dan [Lab 9.2](#lab-92--reportservice-join-penapis-dinamik-aggregate-pagination-s2) langkah 6, 7 dan 9 (pagination, RPT-03, jadual). Catat satu perbezaan dalam `docs/nota-claude.md`.

### ✅ Checkpoint
- [ ] Penapis kekal selepas hantar dan di halaman 2; pautan eksport membawa penapis yang sama (Kuiz S10).
- [ ] `?from=%22%3E%3Cb%3Ex` tidak menghasilkan HTML mentah dalam *View Page Source* (Kuiz S10).
- [ ] RPT-03 Jun 2026 memaparkan satu baris bagi setiap zon dengan peratus penggunaan (Kuiz S10).
- [ ] `pemohon1` ditolak di server untuk `/laporan/pas`; menu Laporan tidak dipaparkan (Kuiz S10).
- [ ] Gerbang terang 3 baris diisi; dapatan `semak-ci4` direkod (Kuiz S10).
- [ ] Commit `RPT: paparan senarai berpagination & RPT-03 aggregate (slice L2)` dalam `git log` (Kuiz S10).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Halaman 2 kehilangan penapis | Pager dibina tanpa query string semasa | Tolak diff; minta pager yang membawa `toQuery($filters)` |
| Input `type="date"` kosong walaupun URL ada `from` | Format bukan `Y-m-d` (contoh `01/06/2026` dari tetapan bahasa Windows) | Nilai `value` mesti `Y-m-d`; paparan tempatan diurus oleh pelayar |
| Peratus RPT-03 lebih 100 % | Hari tempahan dikira melebihi bulan dipilih | Minta Claude (mod Plan) terangkan rumus; banding dengan README §1.2 (Zon A Jun = 25.0 %) |
| `Undefined variable $query` dalam view | Controller tidak menghantar `toQuery($filters)` | Lihat langkah pelan; terima diff yang menambah `'query' => $service->toQuery($filters)` |
| Debug Toolbar tiada | `CI_ENVIRONMENT` bukan `development` | `.env`: `CI_ENVIRONMENT = development` (jangan commit `.env`) |

### ⭐ Cabaran tambahan
- Minta Claude (mod Plan) membandingkan bilangan query dalam Debug Toolbar untuk RPT-01 halaman 1 dan halaman 2. Terangkan sendiri kenapa `countAllResults(false)` digunakan sebelum `limit()`.

---

## Lab 9.12 — Claude Code: Eksport PDF & Excel Selamat (S11)

### 🎯 Objektif
Membina slice L3: `ExportService::pdf()` (Dompdf) dan `xlsx()` (PhpSpreadsheet) daripada `ReportService::exportRows()` yang memanggil `builder()` yang **sama** dengan skrin, dengan had baris (`LengthException`), `esc()` dalam view PDF, dan teks Excel ditulis eksplisit sebagai string (selamat daripada formula injection). Anda **membuktikan** skrin = PDF = Excel dan `=1+1` kekal teks.

### Prasyarat
- Lab 9.11 selesai dan di-commit.
- `ext-zip` dan `ext-gd` aktif (`php -m`).

### Langkah

1. **Pustaka (anda sendiri, bukan Claude).**

   ```bash
   composer require dompdf/dompdf phpoffice/phpspreadsheet
   composer show dompdf/dompdf phpoffice/phpspreadsheet
   ```

   Dijangka: kedua-dua pakej disenaraikan dengan versi. Commit `composer.json` dan `composer.lock` sahaja (`vendor/` dalam `.gitignore`).

2. **SPEC & risiko (anda, 5 minit).** Baca SPEC §1 (Dompdf, PhpSpreadsheet), §2.3 dan README §3.1–§3.4. Dalam `docs/nota-claude.md` → *Slice L3*, tulis 4 risiko yang pelan mesti tangani: formula injection Excel, HTML dalam nama (PDF), had baris/memori, penapis eksport berbeza daripada skrin.

3. **Pelan (mod Plan):**

   ```text
   Mod Plan. Jangan ubah sebarang fail.
   Slice L3 Modul Laporan: eksport PDF dan Excel.
   Baca @docs/spesifikasi-sistem.md bahagian 1, 2.3, 5 dan 9, @app/Services/ReportService.php,
   @app/Controllers/Laporan/ReportController.php dan @app/Views/laporan/index.php.
   Cadangkan pelan bernombor (maksimum 5 langkah). Setiap langkah: fail, apa berubah, cara saya uji.
   Pelan mesti mengandungi:
   - ReportService::exportRows(string $report, array $filters, string $format): guna builder() yang SAMA
     dengan skrin; countAllResults(false) dahulu; LengthException jika melebihi EXPORT_LIMIT
     (pdf 2000, xlsx 10000); baris dibaca satu demi satu (getUnbufferedRow), bukan getResultArray().
   - app/Services/ExportService.php: pdf() dengan Dompdf (A4 landskap, isRemoteEnabled false, fon DejaVu Sans)
     dan xlsx() dengan PhpSpreadsheet (pengepala tebal, lebar automatik, baris beku).
   - Dalam xlsx(): nombor ditulis sebagai nombor; SEMUA teks ditulis dengan
     setCellValueExplicit(..., DataType::TYPE_STRING) supaya teks bermula =, +, - atau @ tidak menjadi formula.
   - View app/Views/laporan/pdf.php tanpa layout Bootstrap; setiap nilai melalui esc().
   - ReportController: ?export=pdf|xlsx -> exportRows() -> ExportService -> download() dengan nama fail
     laporan-<laporan>-YmdHis.<ext>; LengthException -> redirect ke URL yang sama tanpa export, flash error.
   - Daftar exportService dalam app/Config/Services.php.
   Jangan ubah normaliseFilters(), builder() atau route. Tanya saya dahulu jika ada yang kabur.
   ```

   **Pelan yang baik mengandungi:** eksport melalui `builder()` yang sama (satu sumber kebenaran); semakan had **sebelum** membaca baris; `TYPE_STRING` untuk teks; `esc()` dalam `pdf.php`; kebenaran eksport datang dari filter route yang sama (`permission:laporan.view`).

   **TOLAK pelan jika:** query eksport ditulis semula (`$db->table('pass_applications')->...`); `fromArray()` untuk data pengguna (nilai `=...` menjadi formula); `isRemoteEnabled` `true`; fail sementara dalam `public/`; route eksport baharu tanpa filter; Claude mencadangkan menjalankan `composer require` sendiri.

   Sunting pelan dan salin ke `docs/nota-claude.md`.

4. **Laksana dalam mod Manual**, satu langkah pada satu masa:

   ```text
   Laksana langkah 1 pelan sahaja. Sebelum setiap Edit, terangkan dalam 2 baris apa yang berubah dan kenapa.
   Jangan jalankan composer, php spark atau git. Berhenti selepas langkah 1.
   ```

   **Diff yang baik:** `$sheet->setCellValueExplicit($coord, (string) $value, DataType::TYPE_STRING);` dalam gelung baris; `if ($total > $limit) { throw new LengthException(...); }` sebelum `streamRows()`; `<td><?= esc($row[$key]) ?></td>` dalam `pdf.php`; `$options->set('isRemoteEnabled', false);`.

   **TOLAK diff jika:** `$sheet->fromArray($rows)` untuk baris data; `setCellValue()` untuk teks pengguna; `<?= $row[$key] ?>` tanpa `esc()` dalam PDF; `ini_set('memory_limit', '-1')` sebagai "penyelesaian"; `echo` atau `var_dump` tertinggal (merosakkan fail binari).

5. **Sahkan (anda sendiri)** sebagai `penyemak@latihan.test`:
   - RPT-01 `status=approved`: skrin *N* rekod → PDF "Jumlah rekod: *N*" → Excel *N* baris data. **Tiga nombor sama.**
   - Formula injection: catat `full_name` asal `pemohon2`, tukar kepada `=1+1` (Lab 9.3 langkah 8, arahan `mysql … UPDATE users SET full_name = '=1+1' …`), eksport RPT-02 ke Excel → sel nama menunjukkan teks `=1+1`, bukan `2`. Pulihkan `full_name` asal.
   - Nama fail: `laporan-pas-<tarikh>-<masa>.xlsx`.
   - `pemohon1@latihan.test` buka terus `/laporan/pas?export=xlsx` → ditolak (redirect Shield), tiada fail dimuat turun.
   - `composer test` → hijau.

6. **Semakan `semak-ci4`** (mod Plan), kemudian semakan eksport gaya AI-06 dari Lab 9.3 langkah 8 (tampal prompt yang sama):

   ```text
   Guna subagent semak-ci4 untuk menyemak app/Services/ExportService.php, app/Services/ReportService.php, app/Views/laporan/pdf.php dan app/Controllers/Laporan/ReportController.php.
   ```

7. **Gerbang terang.** Dalam `docs/nota-claude.md` (Slice L3), 3 baris dengan ayat sendiri: baris `setCellValueExplicit(..., TYPE_STRING)`, baris semakan `EXPORT_LIMIT`, dan baris `esc()` dalam `pdf.php`.

8. **Commit kecil:**

   ```bash
   git add app/ composer.json composer.lock docs/
   git commit -m "RPT: eksport PDF & Excel selamat dari builder yang sama (slice L3)"
   ```

9. **Banding dengan kod rujukan.** Buka [Lab 9.3](#lab-93--eksport-pdf-dompdf--excel-phpspreadsheet-s3) langkah 2 (`ExportService`), 4 (`exportRows()`) dan 5 (controller). Catat satu perbezaan dalam `docs/nota-claude.md`.

### ✅ Checkpoint
- [ ] Skrin, PDF dan Excel memaparkan jumlah rekod yang sama untuk RPT-01 `status=approved` (Kuiz S11).
- [ ] Nama sintetik `=1+1` kekal teks dalam Excel; `full_name` asal dipulihkan (Kuiz S11).
- [ ] `pemohon1` ditolak untuk `/laporan/pas?export=xlsx` (Kuiz S11).
- [ ] Eksport melebihi had memaparkan flash ralat, bukan fail rosak atau ralat memori (Kuiz S11).
- [ ] Gerbang terang 3 baris diisi; dapatan `semak-ci4` direkod (Kuiz S11).
- [ ] Commit `RPT: eksport PDF & Excel selamat dari builder yang sama (slice L3)` dalam `git log` (Kuiz S11).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `ZipArchive not found` semasa `.xlsx` | `ext-zip` tidak aktif dalam Laragon | `php.ini`: `extension=zip`; mulakan semula Laragon |
| Excel: *We found a problem with some content* | Output tambahan (ruang selepas `?>`, BOM, `echo`) bercampur binari | Buang `?>` penutup dalam fail PHP tulen; simpan UTF-8 **tanpa BOM** (VS Code: *Save with Encoding*) |
| `mysql` meminta kata laluan tetapi tiada prompt dalam Git Bash | mintty | `winpty mysql …`, atau HeidiSQL Laragon |
| Aksara `?` dalam PDF | Fon Helvetica tiada glif Unicode | `setDefaultFont('DejaVu Sans')` dalam pelan; tolak diff yang membuang fon |
| `composer require` gagal: `ext-gd` diperlukan | `extension=gd` dikomen dalam `php.ini` | Aktifkan `gd`; `php -m` dalam terminal yang sama |
| Fail dimuat turun bernama `pas` tanpa extension | `download()` tanpa nama fail penuh | Nama `laporan-<laporan>-YmdHis.<ext>` seperti pelan |

### ⭐ Cabaran tambahan
- Minta Claude (mod Plan) menerangkan kenapa `exportRows()` **bukan** fungsi generator walaupun ia memulangkan generator. Sahkan dengan membaca komen dalam Lab 9.3 langkah 4.

---

## Lab 9.13 — Claude Code: Ujian Laporan & Prestasi (S12)

### 🎯 Objektif
Menutup Modul Laporan: `tests/Services/ReportServiceTest.php` yang membuktikan *jumlah laporan = jumlah SQL* daripada fixture yang **anda kira dengan tangan**, satu mutasi yang menggagalkan ujian, analisis `EXPLAIN` (arahan `laporan:explain`) dan index sedia ada melalui tool MCP `db_table`, serta cadangan index yang direkod (bukan dilaksana) — **M3 siap**.

### Prasyarat
- Lab 9.10–9.12 di-commit; `.env` `database.tests.*` → MySQL `kkm_latihan_test`.

### Langkah

1. **Fixture di atas kertas (anda, 10 minit).** Reka 5 tempahan (slot, tarikh, status) dan 3 permohonan pas (`created_at`, status). Kira dengan tangan dan tulis dalam `docs/nota-claude.md` → *Slice L4*: berapa `approved`; berapa bertindih dengan Jun 2026; berapa pas dalam September 2026 termasuk hari terakhir; peratus penggunaan Zon A Jun.

2. **Pelan (mod Plan):**

   ```text
   Mod Plan. Jangan ubah sebarang fail.
   Slice L4 Modul Laporan: ujian ReportService dan analisis prestasi.
   Baca @app/Services/ReportService.php, @docs/spesifikasi-sistem.md bahagian 3 dan 9,
   dan fixture serta jawapan tangan Slice L4 dalam @docs/nota-claude.md.
   Cadangkan pelan bernombor (maksimum 4 langkah). Setiap langkah: fail, apa berubah, cara saya uji.
   Pelan mesti mengandungi:
   - tests/Services/ReportServiceTest.php: DatabaseTestTrait, $migrate = true, $refresh = true,
     $namespace = null; fixture TEPAT seperti dalam nota saya, dengan tarikh tetap (bukan date('Y-m-d')).
   - Sekurang-kurangnya 7 ujian: RPT-01 tanpa penapis = jumlah jadual; RPT-01 status = COUNT(*) SQL;
     julat bertindih; sort di luar whitelist jatuh ke lalai; jumlah eksport = jumlah HTML;
     RPT-02 hari terakhir julat tidak tercicir; kadar penggunaan RPT-03 Jun 2026.
   - Nilai dijangka diambil dari jawapan tangan saya, bukan dikira semula oleh kod yang diuji.
   - app/Commands/ReportExplain.php (laporan:explain <tempahan|pas> [status] [from] [to]) yang mencetak
     SQL dari builder()->getCompiledSelect() dan EXPLAIN FORMAT=TRADITIONAL.
   Jangan ubah ReportService untuk membuat ujian lulus. Jangan tambah migration atau index.
   Tanya saya dahulu jika ada yang kabur.
   ```

   **Pelan yang baik mengandungi:** nilai dijangka dari nota anda (contoh `assertSame(3, $total)`); perbandingan dengan `COUNT(*)` SQL terus melalui `$this->db->table(...)->countAllResults()`; tarikh tetap Jun/September 2026.

   **TOLAK pelan jika:** ujian mengira nilai dijangka dengan memanggil `ReportService` sendiri; ujian menggunakan SQLite; fixture bergantung pada data `kkm_latihan`; migration index baharu; kod aplikasi diubah supaya ujian lulus.

3. **Laksana dalam mod Manual**, satu langkah pada satu masa:

   ```text
   Laksana langkah 1 pelan sahaja. Sebelum setiap Edit, terangkan dalam 2 baris apa yang berubah dan kenapa.
   Jangan jalankan composer, php spark atau git. Berhenti selepas langkah 1.
   ```

   **TOLAK diff jika:** `assertGreaterThan(0, ...)` menggantikan nombor tepat; `markTestSkipped()`; nilai dijangka berbeza daripada jawapan tangan anda tanpa penjelasan (bincang dahulu: siapa yang salah, anda atau kod?).

4. **Sahkan (anda sendiri).**

   ```bash
   composer test -- tests/Services/ReportServiceTest.php --testdox
   ```

   Dijangka: sekurang-kurangnya 7 baris `✔` dan `OK (N tests, M assertions)`.

   **Mutasi:** dalam `builder()` RPT-02, tukar sendiri `'p.created_at <'` kepada `'p.created_at <='` dan buang `+ 1 hari` (ikut Lab 9.4 langkah 5). Jalankan semula → ujian *hari terakhir julat* **mesti gagal**. Pulihkan dengan `git restore app/Services/ReportService.php` → hijau.

5. **Prestasi (MCP + EXPLAIN).**
   - Mod Plan: `Guna tool ci4-spark db_table untuk pass_applications dan slot_bookings. Senaraikan index setiap jadual.` Dijangka: `pass_applications` ada index `status` dan `ref_no` (UNIQUE) tetapi **tiada** index pada `created_at`; `slot_bookings` ada index (`slot_id`,`start_date`,`end_date`) dan `status`. Bandingkan dengan `php spark db:table pass_applications --metadata`.
   - Terminal:

     ```bash
     php spark laporan:explain tempahan approved 2026-06-01 2026-06-30
     php spark laporan:explain pas "" 2026-09-01 2026-09-30
     ```

     Dijangka: RPT-01 dengan `status` → jadual `b` menggunakan index (`key` tidak kosong); RPT-02 dengan tarikh sahaja → jadual `p` `type = ALL`. Catat `type`, `key`, `rows` dalam `docs/laporan-spec.md` → *Prestasi*.
   - Mod Plan: tampal output EXPLAIN dan minta Claude menerangkan `type = ALL` serta index yang sesuai dan kosnya pada `INSERT`. Cadangan `INDEX(created_at)` direkod dalam `docs/log-keputusan.md` sebagai **cadangan kepada pemilik sistem** — tiada migration hari ini.

6. **Semakan akhir.** `semak-ci4` pada `app/Services`, `app/Controllers/Laporan`, `app/Views/laporan` dan `app/Commands/ReportExplain.php`; kemudian AI-08 (DoD [`kolaborasi.md`](../docs/kolaborasi.md) §2) dalam mod Plan seperti Lab 8.13 langkah 2. Baiki setiap "Tidak" yang sahih dengan commit `FIX:`.

7. **Gerbang terang.** Dalam `docs/nota-claude.md` (Slice L4), 3 baris dengan ayat sendiri: satu `assertSame()` dengan nilai tangan anda, baris `getCompiledSelect()` dalam `ReportExplain`, dan satu baris output EXPLAIN (`type = ALL`). Kemudian rakan memilih 1 baris rawak dari `git diff main...feat/laporan-claude -- app/` untuk anda terangkan tanpa Claude.

8. **Commit & MR:**

   ```bash tab="Git Bash / macOS / Linux"
   git add app/ tests/ docs/
   git commit -m "RPT: ReportServiceTest, laporan:explain & cadangan index (slice L4)"
   git push -u origin feat/laporan-claude
   ```

   ```powershell tab="PowerShell"
   git add app/ tests/ docs/
   git commit -m "RPT: ReportServiceTest, laporan:explain & cadangan index (slice L4)"
   git push -u origin feat/laporan-claude
   ```

   Buka MR `feat/laporan-claude` → `main`, jawab satu komen, kemudian merge — **M3 siap**.

9. **Banding dengan kod rujukan.** Buka [Lab 9.4](#lab-94--ujian-jumlah-laporan--jumlah-sql--explain-s4) langkah 2–3 (fixture dan 7 ujian) dan 6 (`ReportExplain`). Cari satu ujian rujukan yang tiada dalam ujian anda dan catat sama ada ia patut ditambah.

### ✅ Checkpoint
- [ ] Jawapan tangan fixture ditulis sebelum pelan; `ReportServiceTest` hijau dengan sekurang-kurangnya 7 ujian yang memakai nombor tangan itu (Kuiz S12).
- [ ] Mutasi `<=` menggagalkan ujian hari terakhir; kod dipulihkan (Kuiz S12).
- [ ] Senarai index `db_table` (MCP) sama dengan `php spark db:table --metadata`; RPT-02 tarikh sahaja menunjukkan `type = ALL` pada `p` (Kuiz S12).
- [ ] Cadangan index direkod dalam `docs/log-keputusan.md`, tiada migration baharu (Kuiz S12).
- [ ] MR `feat/laporan-claude` → `main` di-merge selepas semakan akhir dan gerbang terang — **M3 siap** (Kuiz S12).

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `no such function: DATEDIFF` | Kumpulan DB `tests` masih SQLite | `.env`: `database.tests.*` → MySQL `kkm_latihan_test` |
| EXPLAIN mencetak pokok `-> Nested loop …` | MySQL 9 menukar format lalai | `EXPLAIN FORMAT=TRADITIONAL`; MariaDB: buang `FORMAT=TRADITIONAL` |
| `laporan:explain pas "" 2026-09-01 …` dalam PowerShell: tarikh masuk sebagai status | PowerShell membuang `""` kosong | Guna `'""'` atau `--% pas "" 2026-09-01 2026-09-30` |
| Ujian lulus di laptop anda, gagal di laptop rakan | Fixture bergantung pada `date('Y-m-d')` | Tarikh tetap Jun/September 2026 |
| `Duplicate entry 'WXX 9001'` | Data kekal dari ujian lepas | `protected $refresh = true;` |
| `db_table` MCP: `Table 'pass_applications' not found` | `.env` menunjuk database lain | Semak `database.default.database = kkm_latihan`; `/mcp` → *reconnect* |

### ⭐ Cabaran tambahan
- Minta Claude (mod Plan) mendraf migration **baharu** `AddCreatedAtIndexToPassApplications` tanpa menulis fail. Bandingkan dengan skill `migration-ci4` (Lab 7.7): dua peraturan yang dipatuhi, satu yang tidak.

---

## Lab 9.1 — Reka bentuk laporan & borang penapis GET (S1)

### 🎯 Objektif
- Menulis kad spesifikasi untuk RPT-01, RPT-02, RPT-03.
- Membina route `/laporan/*` yang dilindungi `permission:laporan.view`.
- Membina borang filter `GET` yang mengekalkan nilai selepas dihantar.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- M1 & M2 siap dan di-merge; `php spark migrate:status` semua *Yes*.
- Data sintetik wujud: `php spark db:seed DatabaseSeeder`; data demo laporan disediakan dalam **langkah 0**.
- Boleh log masuk sebagai `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test`, `pemohon1@latihan.test` (kata laluan `Latihan@2026`).

### Langkah

**0. Sediakan data demo (10 min).** Laporan dan carta (Hari 10) perlukan data merentas bulan dan status. Salin `DemoDataSeeder.php.txt` (modul **Templat & Rujukan**) ke `app/Database/Seeds/DemoDataSeeder.php` (salin terus — ini data, bukan latihan menulis), kemudian tambah panggilannya di hujung `DatabaseSeeder::run()`:

```php
$this->call(DemoDataSeeder::class);     // Hari 9–10: data demo Laporan/Statistik (≥ 20 tempahan, ≥ 15 pas)
```

```bash
php spark db:seed DemoDataSeeder
```

Seeder ini **dilangkau** jika `slot_bookings` atau `pass_applications` sudah berisi (data lab anda). Untuk data demo yang bersih (22 tempahan, 18 permohonan pas, 12 bulan), set semula DB pembangunan — ini **memadam semua data** dalam `kkm_latihan`:

```bash
php spark migrate:refresh --all
php spark db:seed DatabaseSeeder
```

**1. Tulis kad spesifikasi (15 min).** Salin jadual ini ke `docs/laporan-spec.md` dalam repo projek anda dan lengkapkan setiap sel. Rujuk README §1.2 **selepas** anda cuba sendiri.

```markdown
| | RPT-01 | RPT-02 | RPT-03 |
|---|---|---|---|
| Soalan perniagaan yang dijawab | | | |
| Pembaca utama | | | |
| Lajur (ikut susunan) | | | |
| Penapis + jenis input | | | |
| Makna julat tarikh | | | |
| Susunan lalai | | | |
| Siapa boleh lihat (permission) | | | |
```

**2. Tambah route.** Buka `app/Config/Routes.php` dan tambah kumpulan laporan (rujuk `Routes-laporan-statistik.php.txt` (modul **Templat & Rujukan**)):

```php
$routes->group('laporan', [
    'namespace' => 'App\Controllers\Laporan',
    'filter'    => 'permission:laporan.view',
], static function ($routes) {
    $routes->get('tempahan', 'ReportController::bookings', ['as' => 'laporan.tempahan']);
    $routes->get('pas', 'ReportController::passes', ['as' => 'laporan.pas']);
    $routes->get('penggunaan', 'ReportController::usage', ['as' => 'laporan.penggunaan']);
});
```

```bash tab="Git Bash / macOS / Linux"
php spark routes | grep laporan
```

```powershell tab="PowerShell"
php spark routes | Select-String laporan
```

**3. Cipta controller rangka.**

```bash
php spark make:controller Laporan/ReportController
```

Gantikan kandungan fail yang dijana dengan rangka di bawah. Buat masa ini `bookings()`, `passes()` dan `usage()` hanya memaparkan borang filter: nilai GET mentah dan pilihan dropdown, tanpa data laporan. Controller penuh dibina dalam Lab 9.2.

`app/Controllers/Laporan/ReportController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Laporan;

use App\Controllers\BaseController;
use App\Enums\BookingStatus;
use App\Enums\PassStatus;
use App\Enums\PassType;
use App\Enums\SlotCategory;
use App\Models\DepartmentModel;
use App\Models\ParkingZoneModel;

/**
 * RANGKA Lab 9.1 — borang penapis sahaja, tiada data laporan.
 * Lab 9.2 langkah 8 menggantikan seluruh fail ini dengan versi yang memanggil ReportService.
 */
class ReportController extends BaseController
{
    /** GET /laporan/tempahan — RPT-01 */
    public function bookings(): string
    {
        return $this->skeleton('tempahan', 'RPT-01 Senarai Tempahan TLK');
    }

    /** GET /laporan/pas — RPT-02 */
    public function passes(): string
    {
        return $this->skeleton('pas', 'RPT-02 Senarai Permohonan Pas');
    }

    /** GET /laporan/penggunaan — RPT-03 */
    public function usage(): string
    {
        return $this->skeleton('penggunaan', 'RPT-03 Penggunaan Slot Mengikut Zon');
    }

    private function skeleton(string $report, string $title): string
    {
        // SEMENTARA: nilai GET mentah (view tetap guna esc()). Lab 9.2: normaliseFilters() membuat whitelist.
        $get     = $this->request->getGet() ?? [];
        $filters = [];

        foreach (['from', 'to', 'zone_id', 'category', 'department_id', 'pass_type', 'status', 'year', 'month', 'sort', 'dir'] as $key) {
            $filters[$key] = is_string($get[$key] ?? null) ? $get[$key] : null;
        }
        $filters['year'] ??= date('Y');

        // Pilihan dropdown dari enum ::cases() + ->label() — bukan senarai ditaip tangan.
        $enumOptions = static fn (array $cases): array => array_map(
            static fn ($c): array => ['value' => $c->value, 'label' => $c->label()],
            $cases,
        );

        return view('laporan/index', [
            'title'   => $title,
            'report'  => $report,
            'filters' => $filters,
            'options' => [
                'zones' => array_map(
                    static fn (array $z): array => ['value' => (int) $z['id'], 'label' => $z['code'] . ' — ' . $z['name']],
                    model(ParkingZoneModel::class)->orderBy('code')->findAll(),
                ),
                'departments' => array_map(
                    static fn (array $d): array => ['value' => (int) $d['id'], 'label' => $d['code'] . ' — ' . $d['name']],
                    model(DepartmentModel::class)->orderBy('name')->findAll(),
                ),
                'categories' => $enumOptions(SlotCategory::cases()),
                'pass_types' => $enumOptions(PassType::cases()),
                'statuses'   => $report === 'pas' ? $enumOptions(PassStatus::cases()) : $enumOptions(BookingStatus::cases()),
            ],
        ]);
    }
}
```

**4. Bina view borang filter** `app/Views/laporan/index.php`. Perkara wajib:

- `<form method="get" action="<?= current_url() ?>">` — **tiada** `csrf_field()` (GET).
- Setiap input diisi semula dari `$filters`:
  ```php
  <input type="date" name="from" class="form-control" value="<?= esc((string) $filters['from'], 'attr') ?>">
  <option value="<?= esc($o['value'], 'attr') ?>" <?= (string) $filters['status'] === (string) $o['value'] ? 'selected' : '' ?>>
      <?= esc($o['label']) ?>
  </option>
  ```
- Dropdown status/kategori/jenis pas dibina dari enum `::cases()` dan `->label()` — **bukan** senarai ditaip tangan.
- Butang **Set semula** = pautan ke `current_url()` tanpa query string.

Kod penuh. Baris komen terakhir sebelum `endSection()` ialah tempat jadual Lab 9.2:

`app/Views/laporan/index.php`

```php
<?php

/**
 * app/Views/laporan/index.php — Hari 9
 * Satu view untuk RPT-01/02/03. Lab 9.1: borang penapis GET. Lab 9.2: jadual berpagination + butang eksport.
 *
 * @var string                          $title    dipapar sebagai <h1> oleh layouts/main.php
 * @var string                          $report   tempahan|pas|penggunaan
 * @var array<string, int|string|null>  $filters  nilai penapis semasa
 * @var array<string, list<array>>      $options  pilihan dropdown {value, label}
 */

// Pembantu kecil untuk <select>: tanda pilihan yang sedang aktif.
$selected = static fn ($current, $value): string => (string) $current === (string) $value ? 'selected' : '';
?>
<?= $this->extend('layouts/main') ?>

<?php // Tajuk <h1> & mesej flash (cth ralat had eksport) dipapar oleh layouts/main.php daripada $title & partials/flash. ?>
<?= $this->section('content') ?>
<div class="mb-3">
    <!-- Tab laporan -->
    <ul class="nav nav-pills">
        <?php foreach (['tempahan' => 'RPT-01 Tempahan', 'pas' => 'RPT-02 Pas', 'penggunaan' => 'RPT-03 Penggunaan'] as $key => $label): ?>
            <li class="nav-item">
                <a class="nav-link <?= $key === $report ? 'active' : '' ?>" href="<?= site_url('laporan/' . $key) ?>"><?= esc($label) ?></a>
            </li>
        <?php endforeach ?>
    </ul>
</div>

<!-- ============ BORANG PENAPIS (GET) ============
     method="get": URL boleh ditanda buku/dikongsi; tiada CSRF diperlukan (GET tidak ubah data).
     Nilai diisi semula dari $filters (bukan old()) kerana tiada redirect berlaku. -->
<form method="get" action="<?= current_url() ?>" class="card card-body mb-3">
    <div class="row g-2 align-items-end">

        <?php if ($report === 'penggunaan'): ?>
            <div class="col-sm-3 col-md-2">
                <label for="year" class="form-label">Tahun</label>
                <input type="number" id="year" name="year" class="form-control" min="2020" max="2100"
                       value="<?= esc((string) $filters['year'], 'attr') ?>">
            </div>
            <div class="col-sm-3 col-md-2">
                <label for="month" class="form-label">Bulan</label>
                <select id="month" name="month" class="form-select">
                    <option value="">Setahun</option>
                    <?php foreach (['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'] as $i => $m): ?>
                        <option value="<?= $i + 1 ?>" <?= $selected($filters['month'], $i + 1) ?>><?= esc($m) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php else: ?>
            <div class="col-sm-6 col-md-2">
                <label for="from" class="form-label">Dari tarikh</label>
                <input type="date" id="from" name="from" class="form-control" value="<?= esc((string) $filters['from'], 'attr') ?>">
            </div>
            <div class="col-sm-6 col-md-2">
                <label for="to" class="form-label">Hingga tarikh</label>
                <input type="date" id="to" name="to" class="form-control" value="<?= esc((string) $filters['to'], 'attr') ?>">
            </div>
        <?php endif ?>

        <?php if ($report === 'tempahan'): ?>
            <div class="col-sm-4 col-md-2">
                <label for="zone_id" class="form-label">Zon</label>
                <select id="zone_id" name="zone_id" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['zones'] as $o): ?>
                        <option value="<?= esc((string) $o['value'], 'attr') ?>" <?= $selected($filters['zone_id'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
            <div class="col-sm-4 col-md-2">
                <label for="category" class="form-label">Kategori</label>
                <select id="category" name="category" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['categories'] as $o): ?>
                        <option value="<?= esc($o['value'], 'attr') ?>" <?= $selected($filters['category'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php endif ?>

        <?php if ($report === 'pas'): ?>
            <div class="col-sm-4 col-md-2">
                <label for="department_id" class="form-label">Jabatan</label>
                <select id="department_id" name="department_id" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['departments'] as $o): ?>
                        <option value="<?= esc((string) $o['value'], 'attr') ?>" <?= $selected($filters['department_id'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
            <div class="col-sm-4 col-md-2">
                <label for="pass_type" class="form-label">Jenis pas</label>
                <select id="pass_type" name="pass_type" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['pass_types'] as $o): ?>
                        <option value="<?= esc($o['value'], 'attr') ?>" <?= $selected($filters['pass_type'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php endif ?>

        <?php if ($report !== 'penggunaan'): ?>
            <div class="col-sm-4 col-md-2">
                <label for="status" class="form-label">Status</label>
                <select id="status" name="status" class="form-select">
                    <option value="">Semua</option>
                    <?php foreach ($options['statuses'] as $o): ?>
                        <option value="<?= esc($o['value'], 'attr') ?>" <?= $selected($filters['status'], $o['value']) ?>><?= esc($o['label']) ?></option>
                    <?php endforeach ?>
                </select>
            </div>
        <?php endif ?>

        <!-- Kekalkan susunan semasa apabila penapis dihantar semula -->
        <input type="hidden" name="sort" value="<?= esc((string) $filters['sort'], 'attr') ?>">
        <input type="hidden" name="dir" value="<?= esc((string) $filters['dir'], 'attr') ?>">

        <div class="col-md-auto d-flex gap-2">
            <button type="submit" class="btn btn-primary"><i class="bi bi-funnel"></i> Tapis</button>
            <a href="<?= current_url() ?>" class="btn btn-outline-secondary">Set semula</a>
        </div>
    </div>
</form>

<?php // JADUAL & PAGINATION — Lab 9.2 langkah 9 menggantikan baris ini. ?>
<?= $this->endSection() ?>
```

**5. Tambah pautan menu** dalam `app/Views/layouts/main.php` hanya jika pengguna ada kebenaran (kemudahan UI sahaja — kawalan sebenar ialah filter route di langkah 2). Letak dalam `<ul class="navbar-nav me-auto">`, terus sebelum `</ul>` penutupnya:

```php
<?php if (auth()->loggedIn() && auth()->user()->can('laporan.view')): ?>
    <li class="nav-item"><a class="nav-link" href="<?= url_to('laporan.tempahan') ?>">Laporan</a></li>
<?php endif ?>
```

**6. Commit.** `git add -A && git commit -m "RPT: laluan, controller rangka & borang penapis GET"`; PowerShell: jalankan `git add` dan `git commit` satu demi satu

**7. Prompting (Claude Code, mod Plan).** Dalam `claude`, tekan `Shift+Tab` (atau `Alt+M`) hingga baris bawah menunjukkan **plan mode**, kemudian tampal:

```text
Mod Plan. Jangan ubah sebarang fail.
Baca @docs/laporan-spec.md dan @app/Views/laporan/index.php.
1. Untuk RPT-01..03: adakah setiap penapis dalam kad spesifikasi ada medan dalam borang, dan sebaliknya?
2. Senaraikan setiap nilai input pengguna yang dicetak semula dalam view. Adakah ia melalui esc()
   dengan konteks yang betul ('attr' dalam atribut)?
3. Kenapa borang ini mesti method="get"? Beri satu kesan jika ia ditukar kepada POST.
4. Guna tool ci4-spark routes: adakah ketiga-tiga route laporan ada filter permission:laporan.view?
Jawab dalam jadual dengan fail:baris. Jangan tulis semula kod.
```

Cari dalam jawapan: `esc(..., 'attr')` pada setiap `value="…"`, `selected` dibanding sebagai string, dan alasan GET (URL boleh ditanda buku, pagination & eksport membawa penapis yang sama).

Sahkan sendiri: buka `/laporan/tempahan?from=%22%3E%3Cb%3Ex` sebagai `penyemak@latihan.test`, kemudian *View Page Source* (`Ctrl+U`). Anda mesti nampak `&quot;&gt;&lt;b&gt;x` dalam atribut `value`, bukan tag `<b>` mentah. Bandingkan jawapan item 4 dengan `php spark routes` (Checkpoint 9.1 pertama). Rekod dalam `docs/nota-claude.md` (cipta fail jika belum ada).

### ✅ Checkpoint 9.1
- [ ] `php spark routes | grep laporan` menunjukkan 3 route dengan filter `permission:laporan.view` (Kuiz S1).
- [ ] Log masuk sebagai `pemohon1@latihan.test` → `/laporan/tempahan` **ditolak** (filter Shield redirect, tiada data dipapar). Sebagai `penyemak@latihan.test` → dibenarkan (Kuiz S1).
- [ ] Pilih status + tarikh → klik **Tapis** → URL mengandungi `?from=...&status=...` dan dropdown **masih** menunjukkan pilihan tadi (Kuiz S1).
- [ ] Kad spesifikasi lengkap untuk 3 laporan dan disemak jurulatih (Kuiz S1).
- [ ] Prompting: semakan borang penapis mod *Plan* direkod; *View Page Source* menunjukkan `?from=` dilepaskan dalam atribut `value` (Kuiz S1).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Class "App\Controllers\Laporan\ReportController" not found` | Namespace dalam fail tidak sepadan dengan folder | Baris pertama: `namespace App\Controllers\Laporan;` · fail di `app/Controllers/Laporan/` |
| Semua pengguna (termasuk admin) ditolak | Salah eja kebenaran, cth `laporan.views` | Semak `app/Config/AuthGroups.php` → `$matrix` (SPEC §4) |
| Dropdown kembali ke "Semua" selepas tapis | Tiada atribut `selected` / membanding int dengan string | Bandingkan sebagai string: `(string) $a === (string) $b` |
| `The action you requested is not allowed` | Borang tersilap `method="post"` | Tukar ke `get` |

### ⭐ Cabaran tambahan
- Tambah atribut HTML5 `max` pada input `from` (nilai `to` semasa) dan `min` pada input `to` (nilai `from` semasa) supaya pelayar menghalang julat terbalik. Bincang: kenapa `normaliseFilters()` Lab 9.2 tetap perlu menukar julat di server?

---

## Lab 9.2 — `ReportService`: join, penapis dinamik, aggregate, pagination (S2)

### 🎯 Objektif
- Menulis `normaliseFilters()` dengan whitelist tarikh, enum, id dan susunan.
- Menulis builder RPT-01/RPT-02 dengan `join()` + `when()`.
- Menulis aggregate RPT-03 dengan `selectCount()` + `groupBy()`.
- Memaparkan jadual berpagination yang mengekalkan filter.

### Prasyarat
- Lab 9.1 siap.
- Enum `BookingStatus`, `PassStatus`, `PassType`, `SlotCategory` wujud dengan `label()`.

### Langkah

**1. Cipta fail** `app/Services/ReportService.php` dengan rangka:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\PassStatus;
use App\Enums\PassType;
use App\Enums\SlotCategory;
use CodeIgniter\Database\BaseBuilder;
use CodeIgniter\Database\BaseConnection;
use DateTimeImmutable;
use Generator;
use InvalidArgumentException;
use LengthException;

class ReportService
{
    public const REPORTS = ['tempahan', 'pas', 'penggunaan'];

    public const PER_PAGE = 20;

    private BaseConnection $db;

    public function __construct(?BaseConnection $db = null)
    {
        $this->db = $db ?? db_connect();
    }
}
```

Setiap kaedah dalam langkah 2–8 ditambah **dalam kelas ini, sebelum `}` terakhir**, kecuali jika langkah menyatakan tempat lain.

**2. Tulis `normaliseFilters()` dahulu** (whitelist sebelum query). Sasaran tingkah laku:

| Input `$_GET` | Hasil `$filters` |
|---------------|------------------|
| `from=2026-06-01` | `'from' => '2026-06-01'` |
| `from=2026-02-31` | `'from' => null` (tarikh tidak wujud) |
| `from=2026-06-30&to=2026-06-01` | ditukar: from 01/06, to 30/06 |
| `status=approved` | `'status' => 'approved'` |
| `status=bogus` | `'status' => null` |
| `status[]=approved` | `'status' => null` (array ditolak) |
| `sort=b.id; DROP TABLE users` | `'sort' => 'start_date'` (lalai) |
| `dir=sideways` | `'dir' => 'desc'` (lalai) |

Mula-mula tambah whitelist susunan, terus selepas `public const PER_PAGE = 20;`:

`app/Services/ReportService.php`

```php
    /**
     * WHITELIST lajur susunan: kunci URL (?sort=) => lajur SQL sebenar.
     * Input pengguna TIDAK PERNAH dihantar terus ke orderBy().
     */
    private const SORTABLE = [
        'tempahan' => [
            'ref_no'     => 'b.ref_no',
            'zone'       => 'z.code',
            'start_date' => 'b.start_date',
            'end_date'   => 'b.end_date',
            'status'     => 'b.status',
        ],
        'pas' => [
            'ref_no'     => 'p.ref_no',
            'department' => 'd.name',
            'pass_type'  => 'p.pass_type',
            'status'     => 'p.status',
            'created_at' => 'p.created_at',
        ],
        // RPT-03 disusun dalam PHP (data aggregate kecil, satu baris per zon).
        'penggunaan' => [
            'zone_code'   => 'zone_code',
            'utilisation' => 'utilisation',
        ],
    ];

    private const DEFAULT_SORT = [
        'tempahan'   => ['start_date', 'desc'],
        'pas'        => ['created_at', 'desc'],
        'penggunaan' => ['zone_code', 'asc'],
    ];
```

Kemudian tambah `normaliseFilters()`, `toQuery()` dan pembantunya `assertReport()`, `str()`, `validDate()`:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 1. Penapis: terima $_GET mentah → pulang array bersih (whitelist)
    // ------------------------------------------------------------------

    /**
     * Semua nilai dipulangkan sebagai skalar (string/int/null) supaya boleh
     * dibina semula ke query string untuk pagination & butang eksport.
     *
     * @param array<string, mixed> $input biasanya $this->request->getGet()
     *
     * @return array<string, int|string|null>
     */
    public function normaliseFilters(string $report, array $input): array
    {
        $this->assertReport($report);

        $f = [];

        if ($report === 'penggunaan') {
            $year  = (int) ($this->str($input, 'year') ?? date('Y'));
            $month = (int) ($this->str($input, 'month') ?? 0);

            $f['year']  = ($year >= 2020 && $year <= 2100) ? $year : (int) date('Y');
            $f['month'] = ($month >= 1 && $month <= 12) ? $month : null; // null = setahun
        } else {
            $f['from'] = $this->validDate($this->str($input, 'from'));
            $f['to']   = $this->validDate($this->str($input, 'to'));

            // Pengguna terbalikkan julat? Tukar semula, jangan pulang kosong secara senyap.
            if ($f['from'] !== null && $f['to'] !== null && $f['from'] > $f['to']) {
                [$f['from'], $f['to']] = [$f['to'], $f['from']];
            }
        }

        if ($report === 'tempahan') {
            $zoneId        = (int) ($this->str($input, 'zone_id') ?? 0);
            $f['zone_id']  = $zoneId > 0 ? $zoneId : null;
            $f['category'] = SlotCategory::tryFrom($this->str($input, 'category') ?? '')?->value;
            $f['status']   = BookingStatus::tryFrom($this->str($input, 'status') ?? '')?->value;
        }

        if ($report === 'pas') {
            $deptId             = (int) ($this->str($input, 'department_id') ?? 0);
            $f['department_id'] = $deptId > 0 ? $deptId : null;
            $f['pass_type']     = PassType::tryFrom($this->str($input, 'pass_type') ?? '')?->value;
            $f['status']        = PassStatus::tryFrom($this->str($input, 'status') ?? '')?->value;
        }

        // Susunan: hanya kunci dalam whitelist diterima.
        [$defaultSort, $defaultDir] = self::DEFAULT_SORT[$report];
        $sort     = $this->str($input, 'sort');
        $dir      = strtolower($this->str($input, 'dir') ?? '');
        $f['sort'] = array_key_exists((string) $sort, self::SORTABLE[$report]) ? $sort : $defaultSort;
        $f['dir']  = in_array($dir, ['asc', 'desc'], true) ? $dir : $defaultDir;

        return $f;
    }

    /**
     * Penapis bersih → query string (buang nilai kosong). Guna untuk pautan eksport/susun.
     *
     * @param array<string, int|string|null> $filters
     *
     * @return array<string, int|string>
     */
    public function toQuery(array $filters): array
    {
        return array_filter($filters, static fn ($v): bool => $v !== null && $v !== '');
    }

    // ------------------------------------------------------------------
    // Pembantu
    // ------------------------------------------------------------------

    private function assertReport(string $report): void
    {
        if (! in_array($report, self::REPORTS, true)) {
            throw new InvalidArgumentException("Laporan tidak dikenali: {$report}");
        }
    }

    /** Ambil nilai string yang dipangkas; tolak array (cth ?status[]=x) dan string kosong. */
    private function str(array $input, string $key): ?string
    {
        $v = $input[$key] ?? null;

        if (! is_string($v) && ! is_int($v)) {
            return null;
        }

        $v = trim((string) $v);

        return $v === '' ? null : $v;
    }

    /** Terima Y-m-d yang BENAR-BENAR sah sahaja (tolak 2026-02-31). */
    private function validDate(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $d = DateTimeImmutable::createFromFormat('!Y-m-d', $value);

        return ($d !== false && $d->format('Y-m-d') === $value) ? $value : null;
    }
```

Semak cepat: dalam controller rangka Lab 9.1, gantikan **sementara** kaedah `bookings()` dengan versi di bawah. Buka `/laporan/tempahan?…` dengan input dari jadual di atas dalam pelayar, kemudian **pulihkan** `bookings()` asal (tanpa `dd()`) sebelum commit.

`app/Controllers/Laporan/ReportController.php`

```php
public function bookings(): string
{
    $filters = (new \App\Services\ReportService())->normaliseFilters('tempahan', $this->request->getGet() ?? []);
    dd($filters);   // SEMENTARA — buang baris ini dan baris di atas sebelum commit

    return $this->skeleton('tempahan', 'RPT-01 Senarai Tempahan TLK');
}
```

**3. Tulis `bookingsBuilder()` (RPT-01)** — 4 join + 5 `when()`. Perhatikan julat tarikh menggunakan syarat bertindih BR-TLK-01:

`builder()` ialah satu-satunya pintu masuk SQL untuk RPT-01/02 (Lab 9.4 menjalankan `EXPLAIN` padanya). Tambah:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 5. Builder — SATU tempat untuk join + penapis dinamik
    // ------------------------------------------------------------------

    /** Dibuat public supaya S4 boleh jalankan EXPLAIN pada SQL yang sama. */
    public function builder(string $report, array $f): BaseBuilder
    {
        return match ($report) {
            'tempahan' => $this->bookingsBuilder($f),
            'pas'      => $this->passesBuilder($f),
            default    => throw new InvalidArgumentException("Laporan {$report} tiada builder SQL."),
        };
    }

    /** RPT-01 — Senarai tempahan TLK */
    private function bookingsBuilder(array $f): BaseBuilder
    {
        return $this->db->table('slot_bookings b')
            ->select('b.id, b.ref_no, b.start_date, b.end_date, b.status, b.created_at')
            ->select('u.full_name, v.plate_no, s.slot_no, s.category, z.code AS zone_code, z.name AS zone_name')
            ->join('users u', 'u.id = b.user_id')
            ->join('vehicles v', 'v.id = b.vehicle_id')
            ->join('parking_slots s', 's.id = b.slot_id') // termasuk slot soft-deleted: sejarah kekal
            ->join('parking_zones z', 'z.id = s.zone_id')
            // Julat tarikh = tempahan yang AKTIF dalam julat (syarat bertindih BR-TLK-01):
            //   start_date <= :to AND end_date >= :from
            ->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where('b.start_date <=', $to))
            ->when($f['from'] ?? null, static fn (BaseBuilder $q, string $from) => $q->where('b.end_date >=', $from))
            ->when($f['zone_id'] ?? null, static fn (BaseBuilder $q, int $id) => $q->where('s.zone_id', $id))
            ->when($f['category'] ?? null, static fn (BaseBuilder $q, string $c) => $q->where('s.category', $c))
            ->when($f['status'] ?? null, static fn (BaseBuilder $q, string $s) => $q->where('b.status', $s));
    }
```

**4. Tulis `passesBuilder()` (RPT-02)** — `departments` mesti **LEFT** join; julat `created_at` separuh-terbuka:

Tambah:

`app/Services/ReportService.php`

```php
    /** RPT-02 — Senarai permohonan Pas */
    private function passesBuilder(array $f): BaseBuilder
    {
        return $this->db->table('pass_applications p')
            ->select('p.id, p.ref_no, p.pass_type, p.valid_from, p.valid_until, p.status, p.created_at, p.approved_at')
            ->select('u.full_name, u.staff_no, d.code AS dept_code, d.name AS dept_name')
            ->join('users u', 'u.id = p.user_id')
            ->join('departments d', 'd.id = u.department_id', 'left') // department_id boleh NULL
            // created_at ialah DATETIME → julat SEPARUH-TERBUKA [from 00:00, to+1 hari 00:00)
            // supaya rekod pada hari terakhir (cth 30/09 14:00) TIDAK tercicir.
            ->when($f['from'] ?? null, static fn (BaseBuilder $q, string $from) => $q->where('p.created_at >=', $from . ' 00:00:00'))
            ->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where(
                'p.created_at <',
                (new DateTimeImmutable($to))->modify('+1 day')->format('Y-m-d 00:00:00'),
            ))
            ->when($f['department_id'] ?? null, static fn (BaseBuilder $q, int $id) => $q->where('u.department_id', $id))
            ->when($f['pass_type'] ?? null, static fn (BaseBuilder $q, string $t) => $q->where('p.pass_type', $t))
            ->when($f['status'] ?? null, static fn (BaseBuilder $q, string $s) => $q->where('p.status', $s));
    }
```

**5. Tulis `applySort()` dengan whitelist + susunan kedua `id`:**

Whitelist `SORTABLE` dan `DEFAULT_SORT` sudah ditambah di langkah 2. Tambah `applySort()`:

`app/Services/ReportService.php`

```php
    private function applySort(BaseBuilder $builder, string $report, array $f): BaseBuilder
    {
        $column = self::SORTABLE[$report][$f['sort']] ?? self::SORTABLE[$report][self::DEFAULT_SORT[$report][0]];
        $dir    = $f['dir'] === 'asc' ? 'ASC' : 'DESC';
        $idCol  = $report === 'tempahan' ? 'b.id' : 'p.id';

        // Susunan kedua (id) → susunan STABIL; tanpa ini rekod boleh "melompat" antara halaman.
        return $builder->orderBy($column, $dir)->orderBy($idCol, $dir);
    }
```

**6. Tulis `paginate()`:**

Tambah `paginate()`, `formatRow()` (nilai enum → label BM, tarikh → `d/m/Y`) dan `dmy()`. Cabang `penggunaan` memanggil `usageByZone()` dari langkah 7.

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 3. Paparan HTML berpagination
    // ------------------------------------------------------------------

    /**
     * @param array<string, int|string|null> $filters hasil normaliseFilters()
     *
     * @return array{rows: list<array<string, mixed>>, total: int, page: int, perPage: int}
     */
    public function paginate(string $report, array $filters, int $page, int $perPage = self::PER_PAGE): array
    {
        $this->assertReport($report);
        $page = max(1, $page);

        if ($report === 'penggunaan') {
            // Aggregate kecil (satu baris per zon) — potong dalam PHP.
            $all = $this->usageByZone($filters);

            return [
                'rows'    => array_slice($all, ($page - 1) * $perPage, $perPage),
                'total'   => count($all),
                'page'    => $page,
                'perPage' => $perPage,
            ];
        }

        $builder = $this->builder($report, $filters);

        // countAllResults(false) = kira TANPA reset builder; join/where kekal untuk get().
        $total = $builder->countAllResults(false);

        $rows = $this->applySort($builder, $report, $filters)
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()
            ->getResultArray();

        return [
            'rows'    => array_map(fn (array $r): array => $this->formatRow($report, $r), $rows),
            'total'   => $total,
            'page'    => $page,
            'perPage' => $perPage,
        ];
    }

    // ------------------------------------------------------------------
    // 7. Format baris — label BM daripada enum, tarikh d/m/Y
    // ------------------------------------------------------------------

    /** @return array<string, mixed> kunci sepadan columns($report) */
    private function formatRow(string $report, array $r): array
    {
        return match ($report) {
            'tempahan' => [
                'ref_no'     => $r['ref_no'],
                'full_name'  => $r['full_name'],
                'plate_no'   => $r['plate_no'],
                'zone'       => $r['zone_code'],
                'slot_no'    => $r['slot_no'],
                'category'   => SlotCategory::tryFrom((string) $r['category'])?->label() ?? $r['category'],
                'start_date' => $this->dmy($r['start_date']),
                'end_date'   => $this->dmy($r['end_date']),
                'status'     => BookingStatus::tryFrom((string) $r['status'])?->label() ?? $r['status'],
            ],
            'pas' => [
                'ref_no'      => $r['ref_no'],
                'full_name'   => $r['full_name'],
                'staff_no'    => $r['staff_no'] ?? '-',
                'department'  => $r['dept_name'] ?? '-',
                'pass_type'   => PassType::tryFrom((string) $r['pass_type'])?->label() ?? $r['pass_type'],
                'valid_from'  => $this->dmy($r['valid_from']),
                'valid_until' => $this->dmy($r['valid_until']),
                'status'      => PassStatus::tryFrom((string) $r['status'])?->label() ?? $r['status'],
                'created_at'  => $this->dmy($r['created_at'], withTime: true),
            ],
            default => $r,
        };
    }

    private function dmy(?string $value, bool $withTime = false): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        return (new DateTimeImmutable($value))->format($withTime ? 'd/m/Y H:i' : 'd/m/Y');
    }
```

**7. Tulis `usageByZone()` (RPT-03)** — dua query aggregate + gabung dalam PHP. Semak rumus dengan contoh di README §1.2 (Zon A Jun = 25.0 %). Tambah `usageByZone()` dan `usagePeriod()`:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 6. RPT-03 — Penggunaan slot mengikut zon (aggregate)
    // ------------------------------------------------------------------

    /**
     * Penggunaan (%) = hari-slot ditempah ÷ (bil. slot aktif × bil. hari dalam tempoh) × 100
     *
     * @return list<array<string, int|float|string>>
     */
    public function usageByZone(array $f): array
    {
        [$start, $end] = $this->usagePeriod($f);
        $days          = (new DateTimeImmutable($start))->diff(new DateTimeImmutable($end))->days + 1;

        // (a) Bil. slot aktif setiap zon. LEFT JOIN → zon tanpa slot tetap muncul (0).
        //     escape=false kerana syarat ON mengandungi literal (1, IS NULL) — tiada input pengguna di sini.
        $zones = $this->db->table('parking_zones z')
            ->select('z.id, z.code, z.name')
            ->selectCount('s.id', 'total_slots')
            ->join('parking_slots s', 's.zone_id = z.id AND s.is_active = 1 AND s.deleted_at IS NULL', 'left', false)
            ->groupBy(['z.id', 'z.code', 'z.name'])
            ->get()
            ->getResultArray();

        // (b) Tempahan yang digunakan (approved/expired) & bertindih dengan tempoh.
        //     Hari bertindih = DATEDIFF(LEAST(end, :end), GREATEST(start, :start)) + 1
        //     $start/$end dijana oleh kita (bukan teks pengguna) DAN di-escape().
        $startQ = $this->db->escape($start);
        $endQ   = $this->db->escape($end);

        $usage = $this->db->table('slot_bookings b')
            ->select('s.zone_id')
            ->selectCount('b.id', 'total_bookings')
            ->select("SUM(DATEDIFF(LEAST(b.end_date, {$endQ}), GREATEST(b.start_date, {$startQ})) + 1) AS booked_days", false)
            // Sama dengan penyebut (a): hanya slot aktif & tidak dipadam → penggunaan tidak melebihi 100 %
            ->join('parking_slots s', 's.id = b.slot_id AND s.is_active = 1 AND s.deleted_at IS NULL', 'inner', false)
            ->whereIn('b.status', [BookingStatus::Approved->value, BookingStatus::Expired->value])
            ->where('b.start_date <=', $end)
            ->where('b.end_date >=', $start)
            ->groupBy('s.zone_id')
            ->get()
            ->getResultArray();

        $byZone = array_column($usage, null, 'zone_id');
        $rows   = [];

        foreach ($zones as $z) {
            $slots    = (int) $z['total_slots'];
            $booked   = (int) ($byZone[$z['id']]['booked_days'] ?? 0);
            $capacity = $slots * $days;

            $rows[] = [
                'zone_code'      => $z['code'],
                'zone_name'      => $z['name'],
                'total_slots'    => $slots,
                'total_bookings' => (int) ($byZone[$z['id']]['total_bookings'] ?? 0),
                'booked_days'    => $booked,
                'capacity_days'  => $capacity,
                'utilisation'    => $capacity > 0 ? round($booked / $capacity * 100, 1) : 0.0,
            ];
        }

        $key = $f['sort'] ?? 'zone_code';
        $dir = ($f['dir'] ?? 'asc') === 'desc' ? -1 : 1;
        usort($rows, static fn (array $a, array $b): int => ($a[$key] <=> $b[$key]) * $dir);

        return $rows;
    }

    /** @return array{0: string, 1: string} [Y-m-d mula, Y-m-d tamat] */
    public function usagePeriod(array $f): array
    {
        $year = (int) ($f['year'] ?? date('Y'));

        if (! empty($f['month'])) {
            $first = new DateTimeImmutable(sprintf('%04d-%02d-01', $year, (int) $f['month']));

            return [$first->format('Y-m-d'), $first->format('Y-m-t')];
        }

        return ["{$year}-01-01", "{$year}-12-31"];
    }
```

**8. Daftar service & lengkapkan controller** (nipis!). Controller memerlukan tajuk, lajur dan pilihan dropdown setiap laporan. Tambah kaedah metadata ini dalam `ReportService`:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 2. Metadata laporan: tajuk, lajur, pilihan dropdown
    // ------------------------------------------------------------------

    public function title(string $report): string
    {
        $this->assertReport($report);

        return match ($report) {
            'tempahan'   => 'RPT-01 Senarai Tempahan TLK',
            'pas'        => 'RPT-02 Senarai Permohonan Pas',
            'penggunaan' => 'RPT-03 Penggunaan Slot Mengikut Zon',
        };
    }

    /**
     * Lajur yang SAMA untuk HTML, PDF dan Excel. Kunci = kunci baris selepas formatRow().
     *
     * @return array<string, string>
     */
    public function columns(string $report): array
    {
        $this->assertReport($report);

        return match ($report) {
            'tempahan' => [
                'ref_no'     => 'No. Rujukan',
                'full_name'  => 'Pemohon',
                'plate_no'   => 'No. Plat',
                'zone'       => 'Zon',
                'slot_no'    => 'Slot',
                'category'   => 'Kategori',
                'start_date' => 'Tarikh Mula',
                'end_date'   => 'Tarikh Tamat',
                'status'     => 'Status',
            ],
            'pas' => [
                'ref_no'      => 'No. Rujukan',
                'full_name'   => 'Pemohon',
                'staff_no'    => 'No. Pekerja',
                'department'  => 'Jabatan',
                'pass_type'   => 'Jenis Pas',
                'valid_from'  => 'Sah Dari',
                'valid_until' => 'Sah Hingga',
                'status'      => 'Status',
                'created_at'  => 'Tarikh Mohon',
            ],
            'penggunaan' => [
                'zone_code'      => 'Kod Zon',
                'zone_name'      => 'Nama Zon',
                'total_slots'    => 'Bil. Slot Aktif',
                'total_bookings' => 'Bil. Tempahan',
                'booked_days'    => 'Hari-Slot Ditempah',
                'capacity_days'  => 'Kapasiti (Hari-Slot)',
                'utilisation'    => 'Penggunaan (%)',
            ],
        };
    }

    /** @return list<string> kunci lajur yang boleh disusun (untuk pautan pengepala jadual) */
    public function sortableColumns(string $report): array
    {
        $this->assertReport($report);

        return array_keys(self::SORTABLE[$report]);
    }

    /**
     * Pilihan dropdown borang penapis.
     *
     * @return array<string, list<array{value: int|string, label: string}>>
     */
    public function filterOptions(string $report): array
    {
        $this->assertReport($report);

        $enumOptions = static fn (array $cases): array => array_map(
            static fn ($c): array => ['value' => $c->value, 'label' => $c->label()],
            $cases,
        );

        return match ($report) {
            'tempahan' => [
                'zones' => array_map(
                    static fn (array $z): array => ['value' => (int) $z['id'], 'label' => $z['code'] . ' — ' . $z['name']],
                    $this->db->table('parking_zones')->select('id, code, name')->orderBy('code')->get()->getResultArray(),
                ),
                'categories' => $enumOptions(SlotCategory::cases()),
                'statuses'   => $enumOptions(BookingStatus::cases()),
            ],
            'pas' => [
                'departments' => array_map(
                    static fn (array $d): array => ['value' => (int) $d['id'], 'label' => $d['code'] . ' — ' . $d['name']],
                    $this->db->table('departments')->select('id, code, name')->orderBy('name')->get()->getResultArray(),
                ),
                'pass_types' => $enumOptions(PassType::cases()),
                'statuses'   => $enumOptions(PassStatus::cases()),
            ],
            'penggunaan' => [],
        };
    }
```

Dalam `app/Config/Services.php`, dalam kelas `Services` (corak sama seperti `bookingService`, Hari 6):

`app/Config/Services.php`

```php
public static function reportService(bool $getShared = true): \App\Services\ReportService
{
    if ($getShared) {
        return static::getSharedInstance('reportService');
    }

    return new \App\Services\ReportService();
}
```

Gantikan **seluruh** controller rangka Lab 9.1 dengan controller nipis ini: `$this->reports = service('reportService');` dalam `__construct()`, dan satu kaedah peribadi `handle($report)` untuk ketiga-tiga laporan:

`app/Controllers/Laporan/ReportController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Laporan;

use App\Controllers\BaseController;
use App\Services\ReportService;
use CodeIgniter\HTTP\ResponseInterface;

class ReportController extends BaseController
{
    private ReportService $reports;

    public function __construct()
    {
        $this->reports = service('reportService');
    }

    /** GET /laporan/tempahan — RPT-01 */
    public function bookings(): string|ResponseInterface
    {
        return $this->handle('tempahan');
    }

    /** GET /laporan/pas — RPT-02 */
    public function passes(): string|ResponseInterface
    {
        return $this->handle('pas');
    }

    /** GET /laporan/penggunaan — RPT-03 */
    public function usage(): string|ResponseInterface
    {
        return $this->handle('penggunaan');
    }

    /** Satu aliran untuk ketiga-tiga laporan: penapis → HTML berpagination. (Eksport: Lab 9.3.) */
    private function handle(string $report): string|ResponseInterface
    {
        $filters = $this->reports->normaliseFilters($report, $this->request->getGet() ?? []);

        $page   = (int) ($this->request->getGet('page') ?? 1);
        $result = $this->reports->paginate($report, $filters, $page);

        return view('laporan/index', [
            'title'    => $this->reports->title($report),
            'report'   => $report,
            'filters'  => $filters,
            'query'    => $this->reports->toQuery($filters),
            'columns'  => $this->reports->columns($report),
            'sortable' => $this->reports->sortableColumns($report),
            'options'  => $this->reports->filterOptions($report),
            'result'   => $result,
            'pager'    => service('pager'),
        ]);
    }
}
```

**9. Jadual + pagination dalam view:**

Dalam `app/Views/laporan/index.php`, gantikan baris `<?php // JADUAL & PAGINATION — Lab 9.2 langkah 9 menggantikan baris ini. ?>` dengan blok ini (jumlah rekod, butang eksport dari `$query`, jadual dengan pengepala boleh disusun, pager):

`app/Views/laporan/index.php`

```php
<!-- ============ RINGKASAN + EKSPORT ============
     Pautan eksport dibina dari $query (penapis BERSIH) + export=... → data eksport = data skrin. -->
<div class="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
    <div class="text-muted">
        Jumlah rekod: <strong><?= number_format($result['total']) ?></strong>
    </div>
    <div class="btn-group">
        <a class="btn btn-outline-danger btn-sm"
           href="<?= current_url() . '?' . esc(http_build_query($query + ['export' => 'pdf']), 'attr') ?>">
            <i class="bi bi-filetype-pdf"></i> Eksport PDF
        </a>
        <a class="btn btn-outline-success btn-sm"
           href="<?= current_url() . '?' . esc(http_build_query($query + ['export' => 'xlsx']), 'attr') ?>">
            <i class="bi bi-file-earmark-excel"></i> Eksport Excel
        </a>
    </div>
</div>

<!-- ============ JADUAL ============ -->
<div class="table-responsive">
    <table class="table table-sm table-striped table-hover align-middle">
        <thead class="table-light">
        <tr>
            <th scope="col">#</th>
            <?php foreach ($columns as $key => $label): ?>
                <th scope="col">
                    <?php if (in_array($key, $sortable, true)): ?>
                        <?php
                        // Klik lajur yang sama → terbalikkan arah; lajur lain → mula dengan asc
                        $isCurrent = $filters['sort'] === $key;
                        $nextDir   = $isCurrent && $filters['dir'] === 'asc' ? 'desc' : 'asc';
                        $href      = current_url() . '?' . http_build_query(['sort' => $key, 'dir' => $nextDir] + $query);
                        ?>
                        <a href="<?= esc($href, 'attr') ?>" class="link-dark text-decoration-none">
                            <?= esc($label) ?>
                            <?php if ($isCurrent): ?>
                                <i class="bi bi-caret-<?= $filters['dir'] === 'asc' ? 'up' : 'down' ?>-fill"></i>
                            <?php endif ?>
                        </a>
                    <?php else: ?>
                        <?= esc($label) ?>
                    <?php endif ?>
                </th>
            <?php endforeach ?>
        </tr>
        </thead>
        <tbody>
        <?php if ($result['rows'] === []): ?>
            <tr>
                <td colspan="<?= count($columns) + 1 ?>" class="text-center text-muted py-4">
                    Tiada rekod sepadan dengan penapis.
                </td>
            </tr>
        <?php endif ?>

        <?php foreach ($result['rows'] as $i => $row): ?>
            <tr>
                <td><?= ($result['page'] - 1) * $result['perPage'] + $i + 1 ?></td>
                <?php foreach (array_keys($columns) as $key): ?>
                    <td><?= esc((string) ($row[$key] ?? '')) ?></td>
                <?php endforeach ?>
            </tr>
        <?php endforeach ?>
        </tbody>
    </table>
</div>

<!-- Pager CI4 mengekalkan query string semasa ($_GET) secara automatik: ?status=approved&page=2 -->
<?= $pager->makeLinks($result['page'], $result['perPage'], $result['total']) ?>
```

**10. Commit.** `git add app/ && git commit -m "RPT: ReportService (join, when, groupBy, selectCount) + pagination"`; PowerShell: jalankan `git add` dan `git commit` satu demi satu

**11. Prompting (Claude Code, mod Plan).** Dalam `claude`, tekan `Shift+Tab` (atau `Alt+M`) hingga baris bawah menunjukkan **plan mode**, kemudian tampal (semakan binding Query Builder + tool MCP `db_table`):

```text
Mod Plan. Jangan ubah sebarang fail.
1. Baca @app/Services/ReportService.php. Untuk setiap nilai dari $filters yang sampai ke query
   (where, when, orderBy, limit), beri fail:baris dan kelaskan: di-bind/di-escape oleh Query Builder,
   disemak whitelist, atau dicantum terus ke SQL.
2. Adakah applySort() menolak lajur dan arah yang tiada dalam whitelist? Beri input contoh.
3. Guna tool ci4-spark db_table untuk slot_bookings dan pass_applications. Senaraikan index sedia ada,
   dan untuk setiap penapis RPT-01/RPT-02 nyatakan sama ada ada index yang boleh digunakan.
Jadual sahaja. Jangan tulis semula kod.
```

Cari dalam jawapan: nilai `where()`/`when()` di-bind oleh Query Builder; `orderBy()` menerima nama lajur, jadi lajur **mesti** datang dari whitelist `applySort()`; tiada `$filters` dicantum terus ke string SQL.

Sahkan sendiri: buka `/laporan/tempahan?sort=nonsense&dir=sideways`, kemudian Debug Toolbar → tab **Database**: `ORDER BY` menggunakan lajur lalai. Jalankan `php spark db:table slot_bookings --metadata` dan bandingkan senarai index dengan jawapan `db_table`. Simpan senarai index untuk Lab 9.4 (EXPLAIN). Rekod dalam `docs/nota-claude.md`.

### ✅ Checkpoint 9.2
- [ ] `/laporan/tempahan?status=approved` → "Jumlah rekod" **sama** dengan hasil SQL (Kuiz S2):
  ```sql
  SELECT COUNT(*) FROM slot_bookings WHERE status = 'approved';
  ```
- [ ] Tapis status + zon → klik halaman 2 → URL masih mengandungi `status=...&zone_id=...&page=2` (Kuiz S2).
- [ ] `/laporan/pas?to=<hari ini>` memaparkan permohonan yang anda hantar **hari ini** (bukti julat separuh-terbuka) (Kuiz S2).
- [ ] `/laporan/tempahan?sort=nonsense` tidak ralat — jatuh ke susunan lalai (Kuiz S2).
- [ ] `/laporan/penggunaan?year=2026&month=6` menunjukkan setiap zon (termasuk zon tanpa tempahan = 0.0 %) (Kuiz S2).
- [ ] Controller nipis: setiap kaedah hanya baca filter → panggil `ReportService` → view/eksport (tiada query, join atau kiraan); tiada `$this->db` dalam controller (Kuiz S2).
- [ ] Prompting: setiap nilai `$filters` dalam `ReportService` dikelaskan (bind/whitelist), dan senarai index `db_table` sama dengan `php spark db:table --metadata`; direkod dalam `docs/nota-claude.md` (Kuiz S2).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Error 1055: Expression #2 of SELECT list is not in GROUP BY clause ... only_full_group_by` | Lajur bukan-aggregate tiada dalam `groupBy()` | `->groupBy(['z.id', 'z.code', 'z.name'])` |
| Jumlah RPT-02 kurang daripada `COUNT(*)` | INNER join ke `departments` membuang pengguna tanpa jabatan | `join('departments d', '...', 'left')` |
| Zon tanpa slot menunjukkan "1 slot aktif" | `COUNT(*)` selepas LEFT JOIN | `selectCount('s.id', 'total_slots')` |
| `Unknown column 'b.status' in 'where clause'` selepas `countAllResults()` | `countAllResults()` (tanpa `false`) **reset** builder | `countAllResults(false)` |
| `Table 'db_parking_slots' doesn't exist` | `DBPrefix` diset; join dengan `escape=false` tidak ditambah prefix | Pastikan `database.default.DBPrefix =` kosong (seperti Hari 4) |
| Rekod sama muncul di halaman 1 dan 2 | Susunan tidak stabil | Tambah `->orderBy('b.id', $dir)` |
| `TypeError: ... must be of type string, array given` | `?status[]=x` dihantar terus ke `tryFrom()` | Guna pembantu `str()` yang menolak array |
| Pautan pagination tanpa gaya Bootstrap | Template `default_full` CI4 tiada kelas `page-item` | Terima buat masa ini, atau ⭐ cabaran di bawah |

### ⭐ Cabaran tambahan
- Cipta template pager Bootstrap `app/Views/pager/bootstrap.php` (salin `system/Pager/Views/default_full.php`, tambah `page-item`/`page-link`), daftar dalam `app/Config/Pager.php` → `$templates['bootstrap']`, dan guna `makeLinks(..., 'bootstrap')`.
- Tambah lajur **Purata hari setiap tempahan** (hari-slot ditempah ÷ bil. tempahan) dalam RPT-03: kemas kini `usageByZone()` dan `columns('penggunaan')` sahaja. Jadual skrin, PDF dan Excel ikut secara automatik — kenapa?

---

## Lab 9.3 — Eksport PDF (Dompdf) & Excel (PhpSpreadsheet) (S3)

### 🎯 Objektif
- Memasang Dompdf & PhpSpreadsheet melalui Composer.
- Menjana PDF A4 landskap dengan pengepala, pengaki "Dijana pada … oleh …" dan nombor muka.
- Menjana `.xlsx` dengan pengepala tebal, lebar automatik, baris beku.
- Membuktikan HTML, PDF dan Excel memaparkan jumlah rekod yang sama.

### Prasyarat
- Lab 9.2 siap; butang eksport dalam view sudah dibina dari `$query`.
- Extension PHP: `ext-dom`, `ext-mbstring`, `ext-gd`, `ext-zip`, `ext-xml` (`php -m` untuk semak).

### Langkah

**1. Pasang pustaka.**

```bash tab="Git Bash / macOS / Linux"
composer require dompdf/dompdf phpoffice/phpspreadsheet
git add composer.json composer.lock && git commit -m "RPT: tambah dompdf & phpspreadsheet"
```

```powershell tab="PowerShell"
composer require dompdf/dompdf phpoffice/phpspreadsheet
git add composer.json composer.lock
git commit -m "RPT: tambah dompdf & phpspreadsheet"
```

**2. Cipta `app/Services/ExportService.php`** dan daftar `exportService()` dalam `app/Config/Services.php` (corak sama seperti `reportService()`). Dua kaedah awam, `pdf()` dan `xlsx()`:

`app/Services/ExportService.php`

```php
<?php

declare(strict_types=1);

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportService
{
    /**
     * @param array<string, string>            $columns
     * @param iterable<array<string, mixed>>   $rows
     * @param array{filters: string, user: string, generated_at: string} $meta
     */
    public function pdf(string $title, array $columns, iterable $rows, array $meta): string
    {
        // 1) HTML dijana oleh view biasa CI4 — esc() tetap digunakan di dalam view.
        $html = view('laporan/pdf', [
            'title'   => $title,
            'columns' => $columns,
            'rows'    => $rows,
            'meta'    => $meta,
        ]);

        // 2) Pilihan keselamatan & fon
        $options = new Options();
        $options->setDefaultFont('DejaVu Sans');       // fon Unicode terbina dalam Dompdf (UTF-8 selamat)
        $options->setIsRemoteEnabled(false);          // JANGAN muat URL luar (SSRF / lambat)
        $options->setIsPhpEnabled(false);             // jangan laksana <script type="text/php">
        $options->setTempDir(WRITEPATH . 'cache');    // folder boleh tulis
        $options->setChroot([FCPATH]);                // fail tempatan (cth logo) hanya dari public/

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'landscape');         // laporan berlajur banyak → landskap
        $dompdf->render();

        // 3) Nombor muka surat — hanya diketahui SELEPAS render(), jadi ditulis pada canvas.
        //    A4 landskap = 841.89 × 595.28 pt. Koordinat (x, y) dari bucu kiri atas.
        $canvas = $dompdf->getCanvas();
        $font   = $dompdf->getFontMetrics()->getFont('DejaVu Sans');
        $canvas->page_text(760, 572, 'Muka {PAGE_NUM} / {PAGE_COUNT}', $font, 8, [0.3, 0.3, 0.3]);

        return $dompdf->output();
    }

    /**
     * @param array<string, string>            $columns
     * @param iterable<array<string, mixed>>   $rows
     * @param array{filters: string, user: string, generated_at: string} $meta
     */
    public function xlsx(string $title, array $columns, iterable $rows, array $meta): string
    {
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getProperties()
            ->setCreator($meta['user'])
            ->setTitle($title);

        $sheet = $spreadsheet->getActiveSheet();
        // Nama sheet: maks 31 aksara, tiada : \ / ? * [ ]
        $sheet->setTitle(mb_substr(preg_replace('/[:\\\\\/?*\[\]]/', '', $title) ?? 'Laporan', 0, 31));

        $colCount = count($columns);
        $lastCol  = Coordinate::stringFromColumnIndex($colCount);

        // Baris 1–3: tajuk & metadata (jejak audit: siapa & bila)
        $sheet->setCellValue('A1', $title);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->setCellValue('A2', 'Penapis: ' . $meta['filters']);
        $sheet->setCellValue('A3', 'Dijana pada ' . $meta['generated_at'] . ' oleh ' . $meta['user']);

        // Baris 5: pengepala lajur — tebal + latar
        $headerRow = 5;
        $sheet->fromArray(array_values($columns), null, "A{$headerRow}");
        $headerStyle = $sheet->getStyle("A{$headerRow}:{$lastCol}{$headerRow}");
        $headerStyle->getFont()->setBold(true);
        $headerStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DDEBF7');

        // Baris data. Nombor kekal nombor (boleh dijumlah dalam Excel);
        // teks ditulis EKSPLISIT sebagai string supaya "001234" tidak jadi 1234
        // dan teks bermula "=" tidak dianggap formula (formula injection).
        $r = $headerRow + 1;
        foreach ($rows as $row) {
            $c = 1;
            foreach (array_keys($columns) as $key) {
                $value = $row[$key] ?? '';
                $coord = Coordinate::stringFromColumnIndex($c) . $r;

                if (is_int($value) || is_float($value)) {
                    $sheet->setCellValue($coord, $value);
                } else {
                    $sheet->setCellValueExplicit($coord, (string) $value, DataType::TYPE_STRING);
                }
                $c++;
            }
            $r++;
        }
        $lastRow = max($headerRow, $r - 1);

        // Lebar lajur automatik
        for ($i = 1; $i <= $colCount; $i++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($i))->setAutoSize(true);
        }

        // Beku pengepala: sel kiri-atas kawasan boleh skrol = baris selepas pengepala
        $sheet->freezePane('A' . ($headerRow + 1));
        $sheet->setAutoFilter("A{$headerRow}:{$lastCol}{$lastRow}");

        // Tulis ke memori (bukan fail sementara) dan pulangkan string binari
        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $binary = (string) ob_get_clean();

        // Bebaskan memori — objek Spreadsheet mempunyai rujukan kitaran
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet, $writer);

        return $binary;
    }
}
```

`$meta = ['filters' => 'ringkasan penapis', 'user' => 'nama pengguna', 'generated_at' => 'd/m/Y H:i']`. Kedua-dua memulangkan **string binari**; controller yang menghantar respons.

Dalam `app/Config/Services.php`, tambah selepas `reportService()`:

`app/Config/Services.php`

```php
public static function exportService(bool $getShared = true): \App\Services\ExportService
{
    if ($getShared) {
        return static::getSharedInstance('exportService');
    }

    return new \App\Services\ExportService();
}
```

**3. Cipta view PDF** `app/Views/laporan/pdf.php` — HTML ringkas, **tanpa** layout Bootstrap:

`@page` memberi margin untuk `header`/`footer` `position: fixed` (diulang setiap muka), `thead { display: table-header-group; }` mengulang pengepala jadual, dan fon `DejaVu Sans` memaparkan aksara Unicode.

`app/Views/laporan/pdf.php`

```php
<?php

/**
 * app/Views/laporan/pdf.php — Hari 9 S3
 * HTML ringkas KHUSUS untuk Dompdf (bukan layout Bootstrap):
 *  - Dompdf menyokong CSS 2.1 + sebahagian CSS3 → TIADA flexbox/grid; guna jadual & position:fixed.
 *  - Elemen position:fixed diulang pada SETIAP muka surat → pengepala & pengaki.
 *  - <thead> diulang secara automatik apabila jadual merentas muka surat.
 *  - Nombor muka surat ditambah oleh ExportService::pdf() melalui $canvas->page_text().
 *
 * @var string                          $title
 * @var array<string, string>           $columns
 * @var iterable<array<string, mixed>>  $rows
 * @var array{filters: string, user: string, generated_at: string} $meta
 */
?>
<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <title><?= esc($title) ?></title>
    <style>
        /* Margin muka surat memberi ruang untuk pengepala (atas) & pengaki (bawah) */
        @page { margin: 85px 28px 50px 28px; }

        body { font-family: "DejaVu Sans", sans-serif; font-size: 8.5pt; color: #222; }

        header { position: fixed; top: -70px; left: 0; right: 0; height: 60px;
                 border-bottom: 1px solid #999; }
        header .agency { font-size: 8pt; color: #555; }
        header h1 { font-size: 13pt; margin: 2px 0; }
        header .filters { font-size: 8pt; color: #555; }

        footer { position: fixed; bottom: -35px; left: 0; right: 0; height: 20px;
                 border-top: 1px solid #999; font-size: 7.5pt; color: #555; padding-top: 3px; }

        table { width: 100%; border-collapse: collapse; }
        thead { display: table-header-group; }          /* ulang pengepala setiap muka */
        tr { page-break-inside: avoid; }                /* jangan pecah satu baris */
        th { background: #DDEBF7; text-align: left; }
        th, td { border: 1px solid #bbb; padding: 3px 4px; vertical-align: top; }
        td.num { text-align: right; }
        .empty { text-align: center; color: #777; padding: 20px; }
    </style>
</head>
<body>

<header>
    <div class="agency">Sistem TLK &amp; Pas — Latihan CI-KKM-10 (DATA SINTETIK)</div>
    <h1><?= esc($title) ?></h1>
    <div class="filters">Penapis: <?= esc($meta['filters']) ?></div>
</header>

<footer>
    Dijana pada <?= esc($meta['generated_at']) ?> oleh <?= esc($meta['user']) ?>
    <!-- "Muka X / Y" dilukis di bucu kanan oleh page_text() -->
</footer>

<table>
    <thead>
    <tr>
        <th style="width: 3%">#</th>
        <?php foreach ($columns as $label): ?>
            <th><?= esc($label) ?></th>
        <?php endforeach ?>
    </tr>
    </thead>
    <tbody>
    <?php $n = 0; ?>
    <?php foreach ($rows as $row): ?>
        <?php $n++; ?>
        <tr>
            <td class="num"><?= $n ?></td>
            <?php foreach (array_keys($columns) as $key): ?>
                <?php $value = $row[$key] ?? ''; ?>
                <td class="<?= is_int($value) || is_float($value) ? 'num' : '' ?>"><?= esc((string) $value) ?></td>
            <?php endforeach ?>
        </tr>
    <?php endforeach ?>

    <?php if ($n === 0): ?>
        <tr><td colspan="<?= count($columns) + 1 ?>" class="empty">Tiada rekod sepadan dengan penapis.</td></tr>
    <?php endif ?>
    </tbody>
</table>

<p style="margin-top: 8px; font-size: 8pt;">Jumlah rekod: <strong><?= number_format($n) ?></strong></p>

</body>
</html>
```

**4. Tambah `exportRows()` dalam `ReportService`** — kira dahulu, tolak jika melebihi had, kemudian pulang Generator:

Tambah had eksport terus selepas `public const PER_PAGE = 20;`:

`app/Services/ReportService.php`

```php
    /** Had eksport — Dompdf perlahan untuk jadual besar; PhpSpreadsheet guna ~1 KB memori/sel. */
    public const EXPORT_LIMIT = ['pdf' => 2000, 'xlsx' => 10000];
```

Kemudian tambah `exportRows()` dan `streamRows()` sebelum `}` terakhir kelas:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // 4. Eksport: semua baris (tanpa pagination) tetapi berhad
    // ------------------------------------------------------------------

    /**
     * BUKAN fungsi generator — supaya semakan had (LengthException) berlaku SERTA-MERTA
     * apabila dipanggil, bukan tertangguh sehingga baris pertama dibaca.
     *
     * @return iterable<array<string, mixed>>
     *
     * @throws LengthException jika melebihi EXPORT_LIMIT
     */
    public function exportRows(string $report, array $filters, string $format): iterable
    {
        $this->assertReport($report);
        $limit = self::EXPORT_LIMIT[$format] ?? throw new InvalidArgumentException("Format tidak sah: {$format}");

        if ($report === 'penggunaan') {
            return $this->usageByZone($filters); // paling banyak beberapa puluh zon
        }

        $builder = $this->builder($report, $filters);
        $total   = $builder->countAllResults(false);

        if ($total > $limit) {
            throw new LengthException(sprintf(
                'Terlalu banyak rekod (%s) untuk eksport %s. Had: %s. Sila kecilkan julat penapis.',
                number_format($total),
                strtoupper($format),
                number_format($limit),
            ));
        }

        return $this->streamRows($report, $this->applySort($builder, $report, $filters));
    }

    /** Baca baris satu demi satu — elak membina array PHP gergasi. */
    private function streamRows(string $report, BaseBuilder $builder): Generator
    {
        $query = $builder->get();

        // fetch_assoc() pulang null (tamat) atau false (ralat) — kedua-duanya hentikan gelung.
        while (is_array($row = $query->getUnbufferedRow('array'))) {
            yield $this->formatRow($report, $row);
        }

        $query->freeResult();
    }
```

**5. Sambungkan dalam controller.** Gantikan **seluruh** `app/Controllers/Laporan/ReportController.php` dengan versi ini. Berbanding Lab 9.2: `handle()` menyemak `?export=pdf|xlsx` di awal; `export()` memanggil `exportRows()` dan `ExportService`, kemudian `download($filename, $binary, true)` (`true` = teka MIME dari extension fail); `LengthException` ditangkap → `redirect()` ke URL yang sama tanpa `export`, dengan flash `error`; `describeFilters()` menukar id/enum kepada label untuk pengepala fail.

`app/Controllers/Laporan/ReportController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Laporan;

use App\Controllers\BaseController;
use App\Services\ExportService;
use App\Services\ReportService;
use CodeIgniter\HTTP\ResponseInterface;
use LengthException;

class ReportController extends BaseController
{
    private ReportService $reports;
    private ExportService $exporter;

    public function __construct()
    {
        $this->reports  = service('reportService');
        $this->exporter = service('exportService');
    }

    /** GET /laporan/tempahan — RPT-01 */
    public function bookings(): string|ResponseInterface
    {
        return $this->handle('tempahan');
    }

    /** GET /laporan/pas — RPT-02 */
    public function passes(): string|ResponseInterface
    {
        return $this->handle('pas');
    }

    /** GET /laporan/penggunaan — RPT-03 */
    public function usage(): string|ResponseInterface
    {
        return $this->handle('penggunaan');
    }

    /**
     * Satu aliran untuk ketiga-tiga laporan:
     *   penapis sama → HTML berpagination  ATAU  ?export=pdf|xlsx
     */
    private function handle(string $report): string|ResponseInterface
    {
        $filters = $this->reports->normaliseFilters($report, $this->request->getGet() ?? []);
        $export  = $this->request->getGet('export');

        if ($export === 'pdf' || $export === 'xlsx') {
            return $this->export($report, $filters, $export);
        }

        $page   = (int) ($this->request->getGet('page') ?? 1);
        $result = $this->reports->paginate($report, $filters, $page);

        return view('laporan/index', [
            'title'    => $this->reports->title($report),
            'report'   => $report,
            'filters'  => $filters,
            'query'    => $this->reports->toQuery($filters),
            'columns'  => $this->reports->columns($report),
            'sortable' => $this->reports->sortableColumns($report),
            'options'  => $this->reports->filterOptions($report),
            'result'   => $result,
            'pager'    => service('pager'),
        ]);
    }

    private function export(string $report, array $filters, string $format): ResponseInterface
    {
        try {
            $rows = $this->reports->exportRows($report, $filters, $format);
        } catch (LengthException $e) {
            // Kembali ke paparan HTML dengan penapis yang SAMA (tanpa ?export=)
            return redirect()
                ->to(current_url() . '?' . http_build_query($this->reports->toQuery($filters)))
                ->with('error', $e->getMessage());
        }

        $user  = auth()->user();
        $title = $this->reports->title($report);
        $meta  = [
            'filters'      => $this->describeFilters($report, $filters),
            'user'         => (string) ($user->full_name ?? $user->email ?? '-'),
            'generated_at' => date('d/m/Y H:i'),
        ];

        $binary = $format === 'pdf'
            ? $this->exporter->pdf($title, $this->reports->columns($report), $rows, $meta)
            : $this->exporter->xlsx($title, $this->reports->columns($report), $rows, $meta);

        $filename = sprintf('laporan-%s-%s.%s', $report, date('Ymd-His'), $format);

        // download(nama, data, setMime=true) → Content-Type diteka dari sambungan fail
        // (application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
        // dan Content-Disposition: attachment.
        return $this->response->download($filename, $binary, true);
    }

    /** Ringkasan penapis untuk pengepala PDF/Excel — pembaca tahu data ini ditapis bagaimana. */
    private function describeFilters(string $report, array $f): string
    {
        $parts = [];

        if ($report === 'penggunaan') {
            [$start, $end] = $this->reports->usagePeriod($f);
            $parts[]       = 'Tempoh ' . date('d/m/Y', strtotime($start)) . ' – ' . date('d/m/Y', strtotime($end));
        } else {
            $parts[] = 'Tarikh ' . ($f['from'] ? date('d/m/Y', strtotime($f['from'])) : '(mula)')
                . ' – ' . ($f['to'] ? date('d/m/Y', strtotime($f['to'])) : '(kini)');
        }

        // Tukar nilai id/enum kepada label yang dipaparkan dalam dropdown
        foreach ($this->reports->filterOptions($report) as $group => $opts) {
            $key = match ($group) {
                'zones'       => 'zone_id',
                'categories'  => 'category',
                'statuses'    => 'status',
                'departments' => 'department_id',
                'pass_types'  => 'pass_type',
                default       => null,
            };

            if ($key !== null && ($f[$key] ?? null) !== null) {
                foreach ($opts as $o) {
                    if ((string) $o['value'] === (string) $f[$key]) {
                        $parts[] = $o['label'];
                    }
                }
            }
        }

        return implode(' · ', $parts);
    }
}
```

**6. Uji ketiga-tiga laporan × dua format** (6 fail). Buka setiap fail dan semak senarai di Checkpoint.

Seeder memberi No. Pekerja `LT0001`–`LT0005` (tiada sifar di depan). Untuk menguji sifar di depan dalam Excel, tukar No. Pekerja `pemohon2` (yang ada permohonan pas dari `DemoDataSeeder`) kepada `001234`, kemudian eksport RPT-02:

```bash
mysql -u kkm_dev -p -e "UPDATE users SET staff_no = '001234' WHERE username = 'pemohon2'" kkm_latihan
```

🪟 Jika prompt kata laluan tidak muncul dalam Git Bash: `winpty mysql …` (seperti Hari 6).

**7. Commit.** `git add app/ && git commit -m "RPT: eksport PDF (Dompdf) & Excel (PhpSpreadsheet)"`; PowerShell: jalankan `git add` dan `git commit` satu demi satu

**8. Prompting (Claude Code, mod Plan).** Dalam `claude`, tekan `Shift+Tab` (atau `Alt+M`) hingga baris bawah menunjukkan **plan mode**, kemudian tampal (semakan keselamatan eksport, gaya AI-06):

```text
Mod Plan. Jangan ubah sebarang fail.
Semak keselamatan eksport dalam @app/Services/ExportService.php, @app/Views/laporan/pdf.php
dan kaedah eksport dalam @app/Controllers/Laporan/ReportController.php.
Laporkan dalam jadual | Risiko | Ada kawalan? (Ya/Tidak/Separa) | Bukti fail:baris | Cara saya uji |:
1. Formula injection dalam Excel (teks bermula =, +, -, @)
2. Output PDF tanpa esc() (HTML dalam nama)
3. Eksport tanpa semakan kebenaran (buka ?export=xlsx terus)
4. Had baris & memori: berapa baris maksimum, apa berlaku jika melebihi?
5. Nama fail & header Content-Disposition
6. Penapis eksport berbeza daripada penapis skrin
JANGAN tulis semula kod. Terangkan sahaja.
```

Cari dalam jawapan: `setCellValueExplicit(..., DataType::TYPE_STRING)` untuk teks, `esc()` dalam `pdf.php`, had baris dalam `exportRows()`, dan builder yang sama untuk skrin dan eksport.

Sahkan sendiri: catat `full_name` asal `pemohon2` (`SELECT full_name FROM users WHERE username = 'pemohon2';`), tukar kepada formula, eksport RPT-02 ke Excel, kemudian pulihkan:

```bash
mysql -u kkm_dev -p -e "UPDATE users SET full_name = '=1+1' WHERE username = 'pemohon2'" kkm_latihan
```

Sel nama mesti menunjukkan teks `=1+1`, bukan `2`. Selepas itu pulihkan `full_name` asal `pemohon2` dengan `UPDATE` yang sama. 🪟 Jika prompt kata laluan tidak muncul dalam Git Bash: `winpty mysql …` (seperti langkah 6). Rekod dapatan dalam `docs/nota-claude.md`.

### ✅ Checkpoint 9.3
- [ ] Tapis RPT-01 `status=approved` → skrin: *N* rekod → PDF: "Jumlah rekod: *N*" → Excel: *N* baris data (baris 6 hingga 5+*N*). **Tiga nombor sama.** (Kuiz S3)
- [ ] PDF: A4 **landskap**; pengepala berulang setiap muka; pengaki "Dijana pada … oleh *nama anda*"; "Muka 1 / 3" di bucu kanan bawah (Kuiz S3).
- [ ] PDF: nama dengan aksara khas (cth tambah pengguna sintetik "Nur'aini Ābdul") dipapar betul — bukan `?` (Kuiz S3).
- [ ] Excel: baris pengepala **tebal**; lajur cukup lebar; skrol ke bawah → pengepala kekal (beku); No. Pekerja `001234` kekal dengan sifar di depan (Kuiz S3).
- [ ] Nama fail: `laporan-tempahan-20260925-143012.pdf` (Kuiz S3).
- [ ] Log masuk sebagai `pemohon1@latihan.test` dan buka terus `/laporan/pas?export=xlsx` → **ditolak** (Kuiz S3).
- [ ] Prompting: semakan eksport mod *Plan* direkod, dan nama sintetik `=1+1` kekal sebagai teks dalam fail Excel (Kuiz S3).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Aksara `?` atau kotak kosong dalam PDF | Fon teras PDF (Helvetica) tiada glif Unicode | `setDefaultFont('DejaVu Sans')` + `font-family: "DejaVu Sans"` dalam CSS; `loadHtml($html, 'UTF-8')` |
| `Cannot modify header information - headers already sent by (output started at .../app/Config/Xxx.php:NN)` | Ada output sebelum respons: ruang/baris kosong selepas `?>`, BOM, `echo`/`var_dump`/`dd()` | Buang `?>` penutup dalam fail PHP tulen; buang debug; simpan fail sebagai UTF-8 **tanpa BOM** |
| Excel: "*We found a problem with some content*" / fail rosak | Output tambahan (ruang, amaran PHP) bercampur dengan binari | Sama seperti di atas; semak `writable/logs/` untuk amaran |
| `Allowed memory size of 134217728 bytes exhausted` | Terlalu banyak sel/baris | Had `EXPORT_LIMIT`; `disconnectWorksheets()`; jangan `getResultArray()` untuk eksport |
| `Maximum execution time of 30 seconds exceeded` (PDF) | Dompdf perlahan untuk jadual beribu baris | Had PDF 2,000; cadangkan Excel untuk data besar |
| Logo tidak muncul dalam PDF | `isRemoteEnabled=false` menyekat URL `http://…` | Guna path fail tempatan dalam `public/` (dibenarkan oleh `setChroot([FCPATH])`) atau data URI base64 |
| Susun atur PDF bersepah | Guna flexbox/grid/Bootstrap | Dompdf = CSS 2.1: guna `<table>`, `position: fixed`, `float` |
| `Class "Dompdf\Dompdf" not found` | `composer require` dijalankan dalam folder lain / `vendor/` tidak dikemas kini | Jalankan di akar projek; `composer dump-autoload` |
| `ZipArchive not found` semasa `.xlsx` | Extension `ext-zip` tidak aktif | Aktifkan dalam `php.ini` (`extension=zip`) dan mulakan semula server |

### ⭐ Cabaran tambahan
- Tambah butang **Pratonton PDF** yang membuka PDF dalam tab baharu (inline) menggunakan:
  ```php
  return $this->response
      ->setContentType('application/pdf')
      ->setHeader('Content-Disposition', 'inline; filename="' . $filename . '"')
      ->setBody($binary);
  ```
- Tambah format **CSV** berstrim (`fputcsv` ke `php://output`) untuk eksport tanpa had praktikal. Bincang: kenapa CSV lebih ringan daripada `.xlsx`?

---

## Lab 9.4 — Ujian "jumlah laporan = jumlah SQL" & EXPLAIN (S4)

### 🎯 Objektif
- Menulis ujian PHPUnit dengan fixture sendiri dan membandingkan jumlah laporan dengan kiraan SQL terus.
- Membaca pelan `EXPLAIN` bagi query RPT-01/RPT-02 dan menilai penggunaan index.

### Prasyarat
- Lab 9.2 & 9.3 siap.
- Database ujian berasingan wujud:
  ```sql
  CREATE DATABASE IF NOT EXISTS kkm_latihan_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- `.env` (JANGAN commit):
  ```ini
  database.tests.hostname = localhost
  database.tests.database = kkm_latihan_test
  database.tests.username = <pengguna anda>
  database.tests.password = <kata laluan anda>
  database.tests.DBDriver = MySQLi
  database.tests.DBPrefix =
  ```

### Langkah

**1. Cipta** `tests/Services/ReportServiceTest.php`. Rangka:

```php
<?php

declare(strict_types=1);

namespace Tests\Services;

use App\Services\ReportService;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;

final class ReportServiceTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate   = true;
    protected $refresh   = true;
    protected $namespace = null;   // semua migration termasuk Shield (jadual users)

    private ReportService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReportService();
        $this->seedFixtures();       // data kecil yang kita tahu jawapannya
    }
}
```

**2. Reka fixture di atas kertas dahulu.** Lukis jadual 5 tempahan (slot, tarikh, status) dan 3 permohonan pas (`created_at`, status). Kira dengan tangan: berapa `approved`? berapa bertindih dengan Jun? berapa % penggunaan Zon A Jun? **Baru** tulis `seedFixtures()`.

Bandingkan reka bentuk anda dengan fixture di bawah, kemudian tambah dalam kelas, selepas `setUp()` (sifat `$id` menyimpan id rekod untuk ujian):

`tests/Services/ReportServiceTest.php`

```php
    /** @var array<string, int> id rekod fixture (diisi oleh seedFixtures()) */
    private array $id = [];

    // =====================================================================
    // Fixture — data sintetik yang kita tahu jawapannya
    // =====================================================================

    private function seedFixtures(): void
    {
        $now = '2026-01-01 08:00:00';

        $this->id['dept1'] = $this->insert('departments', ['code' => 'UJI-IT', 'name' => 'Unit Teknologi Maklumat (Ujian)']);
        $this->id['dept2'] = $this->insert('departments', ['code' => 'UJI-KEW', 'name' => 'Unit Kewangan (Ujian)']);

        $this->id['user1'] = $this->insert('users', [
            'username' => 'ujian1', 'active' => 1, 'full_name' => 'Pemohon Ujian Satu',
            'staff_no' => 'U0001', 'department_id' => $this->id['dept1'], 'created_at' => $now,
        ]);
        $this->id['user2'] = $this->insert('users', [
            'username' => 'ujian2', 'active' => 1, 'full_name' => 'Pemohon Ujian Dua',
            'staff_no' => 'U0002', 'department_id' => $this->id['dept2'], 'created_at' => $now,
        ]);

        $this->id['veh1'] = $this->insert('vehicles', ['user_id' => $this->id['user1'], 'plate_no' => 'WXX 9001', 'model' => 'Myvi', 'color' => 'Putih']);
        $this->id['veh2'] = $this->insert('vehicles', ['user_id' => $this->id['user2'], 'plate_no' => 'WXX 9002', 'model' => 'Saga', 'color' => 'Hitam']);

        $this->id['zoneA'] = $this->insert('parking_zones', ['code' => 'ZA', 'name' => 'Zon A Ujian', 'location' => 'Blok A']);
        $this->id['zoneB'] = $this->insert('parking_zones', ['code' => 'ZB', 'name' => 'Zon B Ujian', 'location' => 'Blok B']);

        $a1 = $this->insert('parking_slots', ['zone_id' => $this->id['zoneA'], 'slot_no' => 'A01', 'category' => 'oku', 'is_active' => 1]);
        $a2 = $this->insert('parking_slots', ['zone_id' => $this->id['zoneA'], 'slot_no' => 'A02', 'category' => 'oku', 'is_active' => 1]);
        $this->insert('parking_slots', ['zone_id' => $this->id['zoneA'], 'slot_no' => 'A03', 'category' => 'oku', 'is_active' => 0]);
        $b1 = $this->insert('parking_slots', ['zone_id' => $this->id['zoneB'], 'slot_no' => 'B01', 'category' => 'pegawai_kanan', 'is_active' => 1]);

        $bookings = [
            // [slot, user, vehicle, start, end, status]
            [$a1, 'user1', 'veh1', '2026-06-01', '2026-06-10', 'approved'],  // #1
            [$a2, 'user2', 'veh2', '2026-05-25', '2026-06-05', 'approved'],  // #2
            [$b1, 'user1', 'veh1', '2026-06-15', '2026-06-20', 'pending'],   // #3
            [$b1, 'user2', 'veh2', '2026-06-01', '2026-06-03', 'rejected'],  // #4
            [$a1, 'user1', 'veh1', '2026-07-01', '2026-07-05', 'approved'],  // #5
        ];

        foreach ($bookings as $i => [$slot, $user, $veh, $start, $end, $status]) {
            $this->insert('slot_bookings', [
                'ref_no'     => sprintf('TLK-2026-%04d', 9001 + $i),
                'user_id'    => $this->id[$user],
                'vehicle_id' => $this->id[$veh],
                'slot_id'    => $slot,
                'start_date' => $start,
                'end_date'   => $end,
                'reason'     => 'Data ujian sintetik',
                'status'     => $status,
                'created_at' => $now,
            ]);
        }

        $passes = [
            // [user, created_at, status]
            ['user1', '2026-09-01 09:00:00', 'submitted'],
            ['user1', '2026-09-30 14:00:00', 'under_review'],  // hari terakhir julat
            ['user2', '2026-10-01 00:00:00', 'approved'],      // di luar julat September
        ];

        foreach ($passes as $i => [$user, $createdAt, $status]) {
            $this->insert('pass_applications', [
                'ref_no'      => sprintf('PAS-2026-%04d', 9001 + $i),
                'user_id'     => $this->id[$user],
                'pass_type'   => 'kakitangan',
                'purpose'     => 'Data ujian sintetik',
                'valid_from'  => '2026-10-01',
                'valid_until' => '2026-12-31',
                'status'      => $status,
                'created_at'  => $createdAt,
            ]);
        }
    }

    private function insert(string $table, array $row): int
    {
        $this->db->table($table)->insert($row);

        return (int) $this->db->insertID();
    }
```

**3. Tulis sekurang-kurangnya 7 ujian** (nama BM deskriptif):

| Ujian | Assertion utama |
|-------|-----------------|
| `testRpt01TanpaPenapisSamaDenganJumlahJadual` | `total === COUNT(*)` |
| `testRpt01PenapisStatusSamaDenganKiraanSql` | `total === COUNT(*) WHERE status` **dan** `=== 3` |
| `testRpt01JulatTarikhGunaSyaratBertindih` | 4 (bukan 3!) |
| `testRpt02HariTerakhirJulatTidakTercicir` | rekod 30/09 14:00 termasuk |
| `testSusunanDiluarWhitelistJatuhKeLalai` | `sort === 'start_date'`; jadual `users` masih wujud |
| `testEksportSamaJumlahDenganPaparanHtml` | `count(iterator_to_array(exportRows)) === paginate total` |
| `testRpt03KadarPenggunaanJun2026` | Zon A = `25.0` |

Kod ujian. Tambah dalam kelas, selepas `setUp()` dan sebelum fixture:

`tests/Services/ReportServiceTest.php`

```php
    // =====================================================================
    // RPT-01 — Senarai tempahan TLK
    // =====================================================================

    public function testRpt01TanpaPenapisSamaDenganJumlahJadual(): void
    {
        $f      = $this->service->normaliseFilters('tempahan', []);
        $result = $this->service->paginate('tempahan', $f, 1);

        $this->assertSame($this->db->table('slot_bookings')->countAllResults(), $result['total']);
        $this->assertSame(5, $result['total']);
    }

    public function testRpt01PenapisStatusSamaDenganKiraanSql(): void
    {
        $f      = $this->service->normaliseFilters('tempahan', ['status' => 'approved']);
        $result = $this->service->paginate('tempahan', $f, 1);

        $expected = $this->db->table('slot_bookings')->where('status', 'approved')->countAllResults();

        $this->assertSame($expected, $result['total']);
        $this->assertSame(3, $result['total']);
    }

    public function testRpt01JulatTarikhGunaSyaratBertindih(): void
    {
        // Jun 2026: tempahan #1, #2 (mula 25/05, tamat 05/06), #3, #4 bertindih. #5 (Julai) tidak.
        $f      = $this->service->normaliseFilters('tempahan', ['from' => '2026-06-01', 'to' => '2026-06-30']);
        $result = $this->service->paginate('tempahan', $f, 1);

        $expected = $this->db->table('slot_bookings')
            ->where('start_date <=', '2026-06-30')
            ->where('end_date >=', '2026-06-01')
            ->countAllResults();

        $this->assertSame($expected, $result['total']);
        $this->assertSame(4, $result['total']);
    }


    public function testSusunanDiluarWhitelistJatuhKeLalai(): void
    {
        $f = $this->service->normaliseFilters('tempahan', ['sort' => 'b.id; DROP TABLE users', 'dir' => 'sideways']);

        $this->assertSame('start_date', $f['sort']);
        $this->assertSame('desc', $f['dir']);
        $this->assertSame(5, $this->service->paginate('tempahan', $f, 1)['total']);
        $this->assertTrue($this->db->tableExists('users'));
    }


    public function testEksportSamaJumlahDenganPaparanHtml(): void
    {
        $f = $this->service->normaliseFilters('tempahan', ['status' => 'approved']);

        $html   = $this->service->paginate('tempahan', $f, 1)['total'];
        $export = iterator_to_array($this->service->exportRows('tempahan', $f, 'xlsx'), false);

        $this->assertCount($html, $export);
        $this->assertSame('Diluluskan', $export[0]['status']); // label BM dari enum
    }

    // =====================================================================
    // RPT-02 — Senarai permohonan Pas
    // =====================================================================

    public function testRpt02HariTerakhirJulatTidakTercicir(): void
    {
        // Permohonan pada 30/09 14:00 MESTI termasuk apabila "hingga 30/09".
        // (Pepijat klasik: where('created_at <=', '2026-09-30') = sehingga 00:00 sahaja.)
        $f = $this->service->normaliseFilters('pas', ['from' => '2026-09-01', 'to' => '2026-09-30']);

        $this->assertSame(2, $this->service->paginate('pas', $f, 1)['total']);
    }

    // =====================================================================
    // RPT-03 — Penggunaan slot mengikut zon
    // =====================================================================

    public function testRpt03KadarPenggunaanJun2026(): void
    {
        $f    = $this->service->normaliseFilters('penggunaan', ['year' => '2026', 'month' => '6']);
        $rows = array_column($this->service->usageByZone($f), null, 'zone_code');

        // Zon A: 2 slot aktif (slot tidak aktif dikecualikan) × 30 hari = 60 hari-slot.
        // Ditempah: #1 = 10 hari (01–10/06), #2 = 5 hari (01–05/06). 15 / 60 = 25.0 %
        $this->assertSame(2, $rows['ZA']['total_slots']);
        $this->assertSame(2, $rows['ZA']['total_bookings']);
        $this->assertSame(15, $rows['ZA']['booked_days']);
        $this->assertSame(60, $rows['ZA']['capacity_days']);
        $this->assertSame(25.0, $rows['ZA']['utilisation']);

        // Zon B: pending & rejected TIDAK dikira sebagai penggunaan.
        $this->assertSame(0, $rows['ZB']['booked_days']);
        $this->assertSame(0.0, $rows['ZB']['utilisation']);
    }
```

**4. Jalankan.**

```bash
composer test -- tests/Services/ReportServiceTest.php --testdox
```

**5. Buktikan ujian menangkap pepijat (mutasi manual).** Dalam `passesBuilder()`, gantikan sementara seluruh syarat `->when($f['to'] ?? null, ...)` (4 baris, `'p.created_at <'`) dengan satu baris ini:

```php
// SENGAJA SALAH — untuk melihat ujian gagal
->when($f['to'] ?? null, static fn (BaseBuilder $q, string $to) => $q->where('p.created_at <=', $to))
```

Jalankan semula → `testRpt02HariTerakhirJulatTidakTercicir` **mesti gagal**. Pulihkan → hijau.

**6. EXPLAIN.** Cipta arahan Spark kecil `app/Commands/ReportExplain.php`:

```php
<?php

declare(strict_types=1);

namespace App\Commands;

use App\Services\ReportService;
use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

class ReportExplain extends BaseCommand
{
    protected $group       = 'Laporan';
    protected $name        = 'laporan:explain';
    protected $description = 'Papar SQL & pelan EXPLAIN bagi laporan tempahan/pas.';
    protected $usage       = 'laporan:explain <tempahan|pas> [status] [from] [to]';

    public function run(array $params)
    {
        $report = $params[0] ?? 'tempahan';

        if (! in_array($report, ['tempahan', 'pas'], true)) {
            CLI::error('Laporan mesti "tempahan" atau "pas" (RPT-03 ialah aggregate PHP).');

            return EXIT_ERROR;
        }

        $service = new ReportService();
        $filters = $service->normaliseFilters($report, [
            'status' => $params[1] ?? null,
            'from'   => $params[2] ?? null,
            'to'     => $params[3] ?? null,
        ]);

        $sql = $service->builder($report, $filters)->getCompiledSelect();   // SQL SEBENAR
        CLI::write($sql, 'yellow');

        // FORMAT=TRADITIONAL: MySQL 9 menukar format lalai EXPLAIN kepada pokok (MariaDB: buang FORMAT=TRADITIONAL).
        // Pengecualian K7 yang sah: $sql dikompil oleh Query Builder (nilai sudah di-escape), arahan CLI sahaja.
        $plan = db_connect()->query('EXPLAIN FORMAT=TRADITIONAL ' . $sql)->getResultArray();
        CLI::table($plan, array_keys($plan[0] ?? []));

        return EXIT_SUCCESS;
    }
}
```

```bash
php spark laporan:explain tempahan approved 2026-06-01 2026-06-30
php spark laporan:explain pas "" 2026-09-01 2026-09-30
```

**7. Rekod pemerhatian** dalam `docs/laporan-spec.md` → bahagian "Prestasi": untuk setiap query, catat `type`, `key`, `rows` bagi jadual utama (`b` / `p`). Jawab: *query mana yang tiada index untuk filter utamanya?*

**8. Commit & buka MR.**

```bash tab="Git Bash / macOS / Linux"
git add -A && git commit -m "RPT: ujian jumlah laporan = SQL + arahan laporan:explain"
git push -u origin feat/laporan    # buka MR ke main → jurulatih/rakan sebelah komen; JANGAN merge lagi — Lab 9.1b–9.4b menambah commit ke MR ini
```

```powershell tab="PowerShell"
git add -A
git commit -m "RPT: ujian jumlah laporan = SQL + arahan laporan:explain"
git push -u origin feat/laporan    # buka MR ke main → jurulatih/rakan sebelah komen; JANGAN merge lagi — Lab 9.1b–9.4b menambah commit ke MR ini
```

**9. Prompting (Claude Code, mod Plan).** Dalam `claude`, tekan `Shift+Tab` (atau `Alt+M`) hingga baris bawah menunjukkan **plan mode**, kemudian tampal (AI-09 + tafsiran EXPLAIN):

```text
Mod Plan. Jangan ubah sebarang fail.
1. Baca @tests/Services/ReportServiceTest.php dan @app/Services/ReportService.php.
   Senaraikan cabang dalam normaliseFilters(), applySort() dan usageByZone() yang TIADA ujian.
   Untuk 3 yang paling berisiko beri | Given | When | Then |. JANGAN tulis kod ujian.
2. Ini output php spark laporan:explain saya:
[tampal output langkah 6]
Terangkan lajur type, key dan rows untuk jadual b dan p. Index apa yang sesuai untuk RPT-02
dengan filter tarikh sahaja, dan apakah kosnya pada INSERT?
```

Cari dalam jawapan: cabang sebenar (julat terbalik, bulan di luar 1–12, lajur sort tidak sah) dan penerangan `type = ALL` yang sepadan dengan README §4.2.

Sahkan sendiri: pilih satu cabang, tulis ujian itu sendiri, kemudian taip `!composer test -- tests/Services/ReportServiceTest.php` dalam Claude Code: hijau. Bandingkan tafsiran EXPLAIN dengan pemerhatian anda dalam `docs/laporan-spec.md` → "Prestasi". Index yang dicadangkan **tidak** ditambah hari ini; catat sebagai cadangan dalam `docs/nota-claude.md`.

### ✅ Checkpoint 9.4 — **M3 siap**
- [ ] `composer test -- tests/Services/ReportServiceTest.php` → semua hijau (≥ 7 ujian) (Kuiz S4).
- [ ] Mutasi di langkah 5 menyebabkan tepat **satu** ujian gagal; dipulihkan (Kuiz S4).
- [ ] Output `laporan:explain tempahan approved` menunjukkan `key = status` (atau index lain) untuk jadual `b` — bukan `type = ALL` (Kuiz S4).
- [ ] Anda boleh menerangkan kepada jurulatih: kenapa RPT-02 dengan filter tarikh sahaja menunjukkan `type = ALL` pada `p` (Kuiz S4).
- [ ] DoD KOLABORASI §2 ditanda untuk M3 (Kuiz S4).
- [ ] Prompting: satu cabang tanpa ujian (dari AI-09) kini diuji oleh anda dan hijau; tafsiran EXPLAIN Claude dibandingkan dengan README §4.2 (Kuiz S4).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Ujian menggunakan SQLite & gagal `no such function: DATEDIFF` | Kumpulan `tests` lalai CI4 = SQLite | Set `database.tests.*` ke MySQL dalam `.env` |
| `Table 'kkm_latihan_test.users' doesn't exist` | `$namespace = 'App'` (lalai) → migration Shield tidak dijalankan | `protected $namespace = null;` |
| `Duplicate entry 'WXX 9001' for key 'plate_no'` | Data kekal dari ujian lepas | `protected $refresh = true;` |
| Ujian lulus di mesin A, gagal di B (tarikh) | Fixture bergantung pada `date('Y-m-d')` | Guna tarikh tetap (Jun 2026) dalam fixture |
| Output EXPLAIN satu lajur berbentuk pokok (`-> Nested loop ...`) | MySQL 9 menukar format lalai EXPLAIN | Guna `'EXPLAIN FORMAT=TRADITIONAL ' . $sql` |
| `getCompiledSelect()` kemudian `get()` pulang semua baris tanpa filter | `getCompiledSelect()` (lalai) **reset** builder | Guna builder baharu, atau `getCompiledSelect(false)` |

### ⭐ Cabaran tambahan
- Jana 50,000 tempahan sintetik (seeder berasingan `BulkBookingSeeder`, guna `insertBatch()` berkelompok 1,000), ukur masa RPT-02 dengan filter tarikh sahaja, kemudian cadangkan (dalam migration **baharu**, bukan ubah yang lama) `INDEX(created_at)` pada `pass_applications`. Jalankan `laporan:explain` sebelum/selepas dan bentangkan perbezaan `type`/`rows`. Catat sebagai cadangan kepada pemilik sistem — perubahan skema mesti direkod dalam `docs/log-keputusan.md`.
- Tambah ujian `testEksportMelebihiHadDitolak`: jadikan had sebagai parameter constructor (`?array $exportLimit = null`), cipta service dengan had `['pdf' => 2, 'xlsx' => 2]`, dan `expectException(\LengthException::class)`. (Kenapa subclass yang mengatasi `const EXPORT_LIMIT` tidak berkesan jika kod memanggil `self::EXPORT_LIMIT`? Petunjuk: `self::` vs `static::`.)

---

## Lab 9.1b — Tempoh pantas & cip penapis aktif (S5)

### 🎯 Objektif
- Menambah baris "Tempoh pantas" dan "Filter aktif" pada kad spesifikasi RPT-01..03.
- Membina pautan GET **Bulan ini / Bulan lepas / Tahun ini** yang mengisi julat tarikh dan mengekalkan filter lain.
- Membina **cip filter aktif**: satu klik membuang satu filter, filter lain kekal.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- [Lab 9.1](#lab-91--reka-bentuk-laporan--borang-penapis-get-s1) siap: borang filter mengekalkan nilai selepas **Tapis**.

### Langkah

**1. Kemas kini kad spesifikasi (5 min).** Tambah dua baris ini di hujung jadual dalam `docs/laporan-spec.md`, kemudian isi setiap sel:

```markdown
| Tempoh pantas (butang) | | | |
| Filter aktif dipapar sebagai | | | |
```

Petunjuk: RPT-01 dan RPT-02 mengisi `from`/`to`; RPT-03 mengisi `year`/`month`. Kad dan kod mesti sama: jika kad menyebut "Minggu ini", kod juga perlu butang itu.

**2. Pembolehubah pembantu dalam view.** Dalam `app/Views/laporan/index.php`, tambah blok ini terus selepas baris `$selected = static fn ...` dan **sebelum** `?>` pertama:

`app/Views/laporan/index.php`

```php
// Lab 9.1b — tempoh pantas & cip penapis aktif.
// $keep = penapis yang berisi (termasuk sort/dir) → asas setiap pautan supaya pilihan lain kekal.
$keep  = array_filter($filters, static fn ($v): bool => $v !== null && $v !== '');
$today = new DateTimeImmutable('today');

if ($report !== 'penggunaan') {
    unset($keep['year']); // rangka Lab 9.1 mengisi year untuk semua laporan; hanya RPT-03 memerlukannya
}

// Bina URL laporan semasa daripada array penapis; nilai null/kosong dibuang.
$urlWith = static function (array $params): string {
    $qs = http_build_query(array_filter($params, static fn ($v): bool => $v !== null && $v !== ''));

    return current_url() . ($qs === '' ? '' : '?' . $qs);
};

// Tempoh pantas. 'first day of last month' selamat pada 31 haribulan; '-1 month' tidak (31/03 → 03/03).
$lastMonth = $today->modify('first day of last month');
$presets   = $report === 'penggunaan'
    ? [
        'Bulan ini'   => ['year' => $today->format('Y'), 'month' => $today->format('n')],
        'Bulan lepas' => ['year' => $lastMonth->format('Y'), 'month' => $lastMonth->format('n')],
        'Tahun ini'   => ['year' => $today->format('Y'), 'month' => null], // null → kunci dibuang = "Setahun"
    ]
    : [
        'Bulan ini'   => ['from' => $today->modify('first day of this month')->format('Y-m-d'), 'to' => $today->modify('last day of this month')->format('Y-m-d')],
        'Bulan lepas' => ['from' => $lastMonth->format('Y-m-d'), 'to' => $lastMonth->modify('last day of this month')->format('Y-m-d')],
        'Tahun ini'   => ['from' => $today->format('Y') . '-01-01', 'to' => $today->format('Y') . '-12-31'],
    ];

// Cip penapis aktif: kunci → [label, kumpulan $options untuk menukar nilai kepada label dropdown].
$chipDefs = [
    'from'          => ['Dari', ''],
    'to'            => ['Hingga', ''],
    'zone_id'       => ['Zon', 'zones'],
    'category'      => ['Kategori', 'categories'],
    'department_id' => ['Jabatan', 'departments'],
    'pass_type'     => ['Jenis pas', 'pass_types'],
    'status'        => ['Status', 'statuses'],
    'month'         => ['Bulan', ''],
];
$chips = [];

foreach ($chipDefs as $key => [$label, $group]) {
    if (! isset($keep[$key])) {
        continue;
    }

    $text = (string) $keep[$key];

    if ($key === 'month') {
        $text = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'][(int) $text - 1] ?? $text;
    }

    foreach ($options[$group] ?? [] as $o) {
        if ((string) $o['value'] === $text) {
            $text = $o['label'];
        }
    }

    $chips[$key] = $label . ': ' . $text;
}
```

- `$keep` ialah filter yang berisi. Setiap pautan bermula daripadanya, jadi pilihan lain kekal.
- `$preset + $keep`: operator `+` mengekalkan kunci array **kiri**. Nilai tempoh menimpa `from`/`to` semasa, dan `status` kekal.
- `'month' => null` pada **Tahun ini** menimpa bulan semasa, kemudian `$urlWith()` membuang kunci itu. Hasilnya, dropdown Bulan menunjukkan *Setahun*.
- `$chips` menukar nilai kepada label dropdown (`approved` → *Diluluskan*, `1` → *A — Blok Utama*) menggunakan `$options` yang sama dengan borang.

**3. Blok tempoh pantas & cip.** Dalam fail yang sama, tambah blok ini terus selepas `</form>` dan **sebelum** baris `<?php // JADUAL & PAGINATION — Lab 9.2 langkah 9 menggantikan baris ini. ?>` (Lab 9.2 menggantikan baris itu sahaja, jadi blok ini kekal). Jika Lab 9.2 sudah siap, letak blok ini sebelum `<!-- ============ RINGKASAN + EKSPORT`:

`app/Views/laporan/index.php`

```php
<!-- ============ Lab 9.1b: TEMPOH PANTAS + CIP PENAPIS AKTIF ============
     Pautan GET biasa (tiada JavaScript). Setiap pautan bermula daripada $keep → pilihan lain kekal.
     Tiada 'page' dalam pautan → kembali ke halaman 1 apabila penapis berubah. -->
<div class="d-flex flex-wrap align-items-center gap-2 mb-3">
    <span class="text-muted small">Tempoh pantas:</span>
    <?php foreach ($presets as $label => $preset): ?>
        <?php
        // Aktif jika setiap nilai preset sama dengan penapis semasa (null = penapis itu mesti kosong)
        $isOn = true;
        foreach ($preset as $k => $v) {
            $isOn = $isOn && (string) ($filters[$k] ?? '') === (string) ($v ?? '');
        }
        ?>
        <a href="<?= esc($urlWith($preset + $keep), 'attr') ?>"
           class="btn btn-sm <?= $isOn ? 'btn-secondary' : 'btn-outline-secondary' ?>"><?= esc($label) ?></a>
    <?php endforeach ?>

    <?php foreach ($chips as $key => $text): ?>
        <!-- Klik cip = buang SATU penapis; yang lain kekal -->
        <a href="<?= esc($urlWith(array_diff_key($keep, [$key => true])), 'attr') ?>"
           class="badge rounded-pill text-bg-light border text-decoration-none" title="Buang penapis ini">
            <?= esc($text) ?> <i class="bi bi-x-lg"></i>
        </a>
    <?php endforeach ?>
</div>
```

**4. Uji di pelayar** sebagai `penyemak@latihan.test`:

1. `/laporan/tempahan` → klik **Bulan ini**. URL: `?from=<1hb bulan ini>&to=<hari terakhir bulan ini>`. Butang **Bulan ini** menjadi gelap; cip *Dari* dan *Hingga* muncul.
2. Pilih Status *Diluluskan* → **Tapis**. URL kini mengandungi `zone_id=&category=&…&sort=&dir=` (borang menghantar semua medan). Cip *Status: Diluluskan* muncul dan **Bulan ini** masih gelap.
3. Klik cip *Dari: …*. Catat query string URL baharu (Kuiz S5).
4. Klik **Bulan lepas**. `from`/`to` bertukar ke bulan lepas, dan cip *Status: Diluluskan* masih ada.
5. `/laporan/penggunaan` → pilih Bulan *Jun* → **Tapis** → klik **Tahun ini**. Catat pilihan dropdown Bulan dan butang yang gelap (Kuiz S5).
6. Uji `esc()`: buka `/laporan/tempahan?from=<b>x</b>`. Cip memaparkan teks `<b>x</b>` secara literal, bukan huruf tebal.

**5. Commit.** `git add -A && git commit -m "RPT: tempoh pantas & cip penapis aktif"`; PowerShell: jalankan `git add` dan `git commit` satu demi satu

### ✅ Checkpoint
- [ ] `docs/laporan-spec.md` ada baris "Tempoh pantas" dan "Filter aktif" yang lengkap untuk 3 laporan (Kuiz S5).
- [ ] RPT-01: **Bulan ini** mengisi `from`/`to` bulan semasa; Status yang dipilih kekal selepas klik **Bulan lepas** (Kuiz S5).
- [ ] Klik satu cip membuang **satu** filter sahaja, dan URL baharu tiada kunci kosong (`zone_id=&…`) (Kuiz S5).
- [ ] RPT-03: **Tahun ini** membuang `month` → dropdown Bulan *Setahun*, butang **Tahun ini** gelap (Kuiz S5).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Kod PHP tercetak sebagai teks di atas halaman | Blok langkah 2 ditampal **selepas** `?>` | Pindahkan blok ke atas `?>` pertama |
| **Bulan lepas** pada 31/03 memberi 03/03–… (Mac), bukan Februari | `modify('-1 month')` → 31/02 → dilaraskan ke 03/03 | Guna `modify('first day of last month')` seperti kod |
| URL selepas klik cip masih panjang `?zone_id=&category=&…` | `array_filter()` tertinggal dalam `$urlWith` | Salin semula `$urlWith` |
| Butang tidak gelap walaupun URL betul | Membanding `2026` (int) dengan `'2026'` (string) dengan `===` | Tukar kedua-dua belah ke `(string)` seperti dalam blok `$isOn` |
| Cip menunjukkan `approved`, bukan *Diluluskan* | Nama kumpulan salah dalam `$chipDefs` (cth `'status'`, bukan `'statuses'`) | Kumpulan mesti sama dengan kunci `$options` |
| `Undefined variable $chips` | Blok langkah 2 ditampal dalam fail lain atau selepas `endSection()` | Kedua-dua blok dalam `app/Views/laporan/index.php`; langkah 2 di atas, langkah 3 selepas `</form>` |

### ⭐ Cabaran tambahan
- Tambah butang **Minggu ini** (Isnin–Ahad) untuk RPT-01/02. Petunjuk: `$today->modify('monday this week')` dan `$today->modify('sunday this week')`. Kemas kini kad spesifikasi dahulu.

---

## Lab 9.2b — Ringkasan status & baris JUMLAH RPT-03 (S6)

### 🎯 Objektif
- Menulis `statusSummary()` yang membalut `builder()` sebagai subquery (`fromSubquery()`) dengan `selectCount()` + `groupBy()`, supaya filter ringkasan sama dengan filter senarai.
- Menulis `usageTotals()`: penggunaan keseluruhan RPT-03 sebagai purata **berwajaran**.
- Memaparkan butang ringkasan yang menapis status apabila diklik, dan baris `<tfoot>` JUMLAH.

### Prasyarat
- [Lab 9.2](#lab-92--reportservice-join-penapis-dinamik-aggregate-pagination-s2) siap: tiga laporan memaparkan jadual berpagination.
- [Lab 9.1b](#lab-91b--tempoh-pantas--cip-penapis-aktif-s5) siap.

### Langkah

**1. Rancang query.** Ringkasan mesti mengira baris yang **sama** dengan senarai. Jadi query ringkasan tidak menulis semula join dan `when()`, tetapi membalut builder senarai:

```sql
SELECT r.status, COUNT(r.id) AS total
FROM ( <SQL senarai RPT-01: 4 join + when() yang sama> ) r
GROUP BY r.status
```

**2. Tambah dua kaedah** dalam `app/Services/ReportService.php`, sebelum `}` terakhir kelas:

`app/Services/ReportService.php`

```php
    // ------------------------------------------------------------------
    // Lab 9.2b — Ringkasan status (RPT-01/02) & baris jumlah (RPT-03)
    // ------------------------------------------------------------------

    /**
     * Bilangan rekod setiap status bagi penapis yang SAMA dengan senarai.
     * builder() dibalut sebagai subquery → join & when() tidak ditulis semula.
     *
     * @param array<string, int|string|null> $filters hasil normaliseFilters()
     *
     * @return list<array{value: string, label: string, total: int}> ikut susunan enum; status 0 tidak dipapar
     */
    public function statusSummary(string $report, array $filters): array
    {
        $this->assertReport($report);

        if ($report === 'penggunaan') {
            return []; // RPT-03 sudah aggregate; tiada lajur status
        }

        // SELECT r.status, COUNT(r.id) AS total FROM (<SQL senarai>) r GROUP BY r.status
        $counts = $this->db->newQuery()
            ->fromSubquery($this->builder($report, $filters), 'r')
            ->select('r.status')
            ->selectCount('r.id', 'total')
            ->groupBy('r.status')
            ->get()
            ->getResultArray();

        $counts = array_column($counts, 'total', 'status');
        $cases  = $report === 'tempahan' ? BookingStatus::cases() : PassStatus::cases();
        $rows   = [];

        foreach ($cases as $case) {
            if (isset($counts[$case->value])) {
                $rows[] = ['value' => $case->value, 'label' => $case->label(), 'total' => (int) $counts[$case->value]];
            }
        }

        return $rows;
    }

    /**
     * Baris JUMLAH RPT-03. Penggunaan keseluruhan = jumlah hari-slot ÷ jumlah kapasiti (purata BERWAJARAN),
     * bukan purata peratus zon — zon kecil tidak boleh "menarik" angka keseluruhan.
     *
     * @param list<array<string, int|float|string>> $rows hasil usageByZone()
     *
     * @return array<string, int|float|string>
     */
    public function usageTotals(array $rows): array
    {
        $booked   = array_sum(array_column($rows, 'booked_days'));
        $capacity = array_sum(array_column($rows, 'capacity_days'));

        return [
            'zone_code'      => 'JUMLAH',
            'zone_name'      => count($rows) . ' zon',
            'total_slots'    => array_sum(array_column($rows, 'total_slots')),
            'total_bookings' => array_sum(array_column($rows, 'total_bookings')),
            'booked_days'    => $booked,
            'capacity_days'  => $capacity,
            'utilisation'    => $capacity > 0 ? round($booked / $capacity * 100, 1) : 0.0,
        ];
    }
```

- `$this->db->newQuery()` memberi builder kosong tanpa jadual; `fromSubquery()` menjadikan builder senarai sebagai jadual terbitan `r`.
- Gelung `cases()` menyusun hasil ikut enum (bukan ikut susunan MySQL) dan menukar nilai kepada label.
- `usageTotals()` menerima baris `usageByZone()` dan tidak menjalankan query.

**3. Gantikan seluruh `paginate()`** (docblock + kaedah, di bawah komen `// 3. Paparan HTML berpagination`) dengan versi ini. Berbanding Lab 9.2, ada dua kunci baharu pada kedua-dua `return`: `summary` dan `totals`.

`app/Services/ReportService.php`

```php
    /**
     * @param array<string, int|string|null> $filters hasil normaliseFilters()
     *
     * @return array{rows: list<array<string, mixed>>, total: int, page: int, perPage: int, summary: list<array>, totals: array<string, mixed>|null}
     */
    public function paginate(string $report, array $filters, int $page, int $perPage = self::PER_PAGE): array
    {
        $this->assertReport($report);
        $page = max(1, $page);

        if ($report === 'penggunaan') {
            // Aggregate kecil (satu baris per zon) — potong dalam PHP.
            $all = $this->usageByZone($filters);

            return [
                'rows'    => array_slice($all, ($page - 1) * $perPage, $perPage),
                'total'   => count($all),
                'page'    => $page,
                'perPage' => $perPage,
                'summary' => [],
                'totals'  => $this->usageTotals($all), // Lab 9.2b: SEMUA zon, bukan halaman semasa sahaja
            ];
        }

        $builder = $this->builder($report, $filters);

        // countAllResults(false) = kira TANPA reset builder; join/where kekal untuk get().
        $total = $builder->countAllResults(false);

        $rows = $this->applySort($builder, $report, $filters)
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()
            ->getResultArray();

        return [
            'rows'    => array_map(fn (array $r): array => $this->formatRow($report, $r), $rows),
            'total'   => $total,
            'page'    => $page,
            'perPage' => $perPage,
            'summary' => $this->statusSummary($report, $filters), // Lab 9.2b
            'totals'  => null,
        ];
    }
```

Controller **tidak berubah**: `$result` sudah dihantar ke view, jadi view terus boleh membaca `$result['summary']` dan `$result['totals']`.

**4. Kemas kini view** `app/Views/laporan/index.php`.

(a) Tambah blok ringkasan terus **sebelum** baris `<!-- ============ JADUAL ============ -->`:

`app/Views/laporan/index.php`

```php
<!-- ============ Lab 9.2b: RINGKASAN STATUS ============
     Satu query GROUP BY atas builder yang SAMA → jumlah semua butang = "Jumlah rekod".
     Klik butang = tapis status itu (penapis lain kekal; kembali ke halaman 1). -->
<?php if ($result['summary'] !== []): ?>
    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
        <span class="text-muted small">Ringkasan status:</span>
        <?php foreach ($result['summary'] as $s): ?>
            <a href="<?= esc(current_url() . '?' . http_build_query(['status' => $s['value']] + $query), 'attr') ?>"
               class="btn btn-sm <?= $filters['status'] === $s['value'] ? 'btn-primary' : 'btn-outline-primary' ?>">
                <?= esc($s['label']) ?> <span class="badge text-bg-light"><?= number_format($s['total']) ?></span>
            </a>
        <?php endforeach ?>
    </div>
<?php endif ?>
```

(b) Tambah baris JUMLAH terus **selepas** `</tbody>` (sebelum `</table>`):

`app/Views/laporan/index.php`

```php
        <?php if ($result['totals'] !== null && $result['total'] > 0): ?>
            <!-- Lab 9.2b: baris JUMLAH RPT-03 (semua zon, purata berwajaran) -->
            <tfoot class="table-group-divider fw-bold">
            <tr>
                <td></td>
                <?php foreach (array_keys($columns) as $key): ?>
                    <td><?= esc((string) ($result['totals'][$key] ?? '')) ?></td>
                <?php endforeach ?>
            </tr>
            </tfoot>
        <?php endif ?>
```

**5. Uji RPT-01 dan RPT-02** sebagai `penyemak@latihan.test`:

1. `/laporan/tempahan` tanpa filter. Jumlahkan nombor setiap butang ringkasan; hasilnya mesti sama dengan "Jumlah rekod".
2. Debug Toolbar → tab *Database*. Cari query `SELECT r.status, COUNT(r.id) AS total FROM (SELECT b.id, … ) r GROUP BY r.status`. Join dan `WHERE` dalam kurungan sama dengan query senarai.
3. Buka `/laporan/tempahan?status=approved`. Catat bilangan butang ringkasan dan nombornya (Kuiz S6).
4. Pilih Zon *A* → **Tapis** → klik halaman 2 jika ada → klik satu butang ringkasan. Catat parameter yang kekal dalam URL (Kuiz S6).
5. `/laporan/pas` → klik butang *Ditolak*. Jadual hanya menunjukkan permohonan ditolak.

**6. Uji baris JUMLAH RPT-03.** Buka `/laporan/penggunaan?year=<tahun ini>&month=<bulan ini>`. Baris JUMLAH (tebal, bawah jadual) memaparkan `3 zon` (atau bilangan zon anda). Kira dengan tangan: Σ *Hari-Slot Ditempah* ÷ Σ *Kapasiti* × 100. Hasilnya mesti sama dengan *Penggunaan (%)* baris JUMLAH. Jika zon anda berbeza saiz, purata biasa peratus zon memberi nombor yang **berbeza**.

**7. Commit.** `git add app/ && git commit -m "RPT: ringkasan status (subquery + groupBy) & baris jumlah RPT-03"`; PowerShell: jalankan `git add` dan `git commit` satu demi satu

### ✅ Checkpoint
- [ ] `/laporan/tempahan` tanpa filter: jumlah nombor butang ringkasan = "Jumlah rekod" = `SELECT COUNT(*) FROM slot_bookings` (Kuiz S6).
- [ ] Tab *Database* Debug Toolbar menunjukkan query ringkasan `… FROM (SELECT …) r GROUP BY r.status` dengan `WHERE` yang sama seperti query senarai (Kuiz S6).
- [ ] Klik butang ringkasan menapis status itu; filter lain kekal dan halaman kembali ke 1 (Kuiz S6).
- [ ] RPT-03: baris JUMLAH = Σ hari-slot ÷ Σ kapasiti × 100, sama dengan kiraan tangan anda (Kuiz S6).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Every derived table must have its own alias` | `fromSubquery()` tanpa alias, atau alias kosong | `fromSubquery($this->builder($report, $filters), 'r')` |
| `Duplicate column name 'id'` | Anda menambah `u.id` (atau lajur lain bernama sama) dalam `select()` builder | Setiap lajur subquery mesti unik; guna alias, cth `u.id AS user_id` |
| Jumlah butang ringkasan ≠ "Jumlah rekod" selepas memilih filter | Ringkasan dikira terus daripada `table('slot_bookings')` | Guna `$this->builder($report, $filters)` dalam `fromSubquery()` |
| `Undefined array key "summary"` dalam view | `paginate()` versi Lab 9.2 masih digunakan | Gantikan seluruh `paginate()` (langkah 3) |
| Baris JUMLAH RPT-03 berubah apabila anda klik halaman 2 | `usageTotals()` menerima baris halaman semasa | Hantar `$all`, bukan `array_slice(...)` |
| Status *Menunggu* muncul selepas *Diluluskan* | Hasil disusun ikut susunan MySQL | Bina `$rows` dengan gelung `cases()`, bukan `foreach ($counts …)` |

### ⭐ Cabaran tambahan
- Tambah ringkasan **jenis pas** untuk RPT-02 dengan corak yang sama: kaedah `passTypeSummary()` (subquery + `groupBy('r.pass_type')`) dan butang yang menapis `pass_type`. Bolehkah anda menjadikan `statusSummary()` generik dengan parameter lajur, tanpa membenarkan input pengguna masuk ke `groupBy()`?

---

## Lab 9.3b — Lembaran Ringkasan Excel & ringkasan PDF (S7)

### 🎯 Objektif
- Menambah lembaran kedua **Ringkasan** dalam fail `.xlsx` dengan `createSheet()`, baris JUMLAH sebagai formula `=SUM()`, dan `setActiveSheetIndex(0)`.
- Menambah jadual ringkasan status dalam PDF.
- Membuktikan bahawa angka ringkasan dalam fail = butang ringkasan di skrin, kerana kedua-duanya memanggil `statusSummary()` dengan `$filters` yang sama.

### Prasyarat
- [Lab 9.3](#lab-93--eksport-pdf-dompdf--excel-phpspreadsheet-s3) siap: enam fail eksport boleh dibuka.
- [Lab 9.2b](#lab-92b--ringkasan-status--baris-jumlah-rpt-03-s6) siap: `statusSummary()` wujud.

### Langkah

**1. Tambah parameter `$summary`** pada kedua-dua kaedah awam dalam `app/Services/ExportService.php`. Nilai lalai `[]` membuatkan panggilan lama terus berfungsi. Gantikan baris tandatangan `pdf()`:

`app/Services/ExportService.php`

```php
    public function pdf(string $title, array $columns, iterable $rows, array $meta, array $summary = []): string
```

dan baris tandatangan `xlsx()`:

`app/Services/ExportService.php`

```php
    public function xlsx(string $title, array $columns, iterable $rows, array $meta, array $summary = []): string
```

**2. Hantar `$summary` ke view PDF.** Dalam `pdf()`, dalam array `view('laporan/pdf', [...])`, tambah baris ini terus selepas `'meta'    => $meta,`:

`app/Services/ExportService.php`

```php
            'summary' => $summary,   // Lab 9.3b
```

**3. Panggil lembaran Ringkasan dalam `xlsx()`.** Tambah blok ini terus **sebelum** komen `// Tulis ke memori (bukan fail sementara) dan pulangkan string binari`:

`app/Services/ExportService.php`

```php
        // Lab 9.3b: lembaran kedua "Ringkasan" (RPT-01/02 sahaja; RPT-03 menghantar [])
        if ($summary !== []) {
            $this->addSummarySheet($spreadsheet, $summary);
        }
```

**4. Tambah `addSummarySheet()`** dalam `ExportService`, sebelum `}` terakhir kelas:

`app/Services/ExportService.php`

```php
    /**
     * Lab 9.3b — lembaran "Ringkasan": satu baris setiap status + JUMLAH sebagai FORMULA Excel.
     *
     * @param list<array{value: string, label: string, total: int}> $summary hasil ReportService::statusSummary()
     */
    private function addSummarySheet(Spreadsheet $spreadsheet, array $summary): void
    {
        $sheet = $spreadsheet->createSheet();   // lembaran baharu di hujung (indeks 1)
        $sheet->setTitle('Ringkasan');

        $sheet->fromArray(['Status', 'Bilangan'], null, 'A1');
        $sheet->getStyle('A1:B1')->getFont()->setBold(true);
        $sheet->getStyle('A1:B1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('DDEBF7');

        $r = 2;
        foreach ($summary as $s) {
            $sheet->setCellValueExplicit("A{$r}", $s['label'], DataType::TYPE_STRING);
            $sheet->setCellValue("B{$r}", $s['total']);   // nombor → boleh dijumlah
            $r++;
        }

        // Formula, bukan nombor PHP: jika pengguna mengubah angka di atas, Excel mengira semula JUMLAH.
        $sheet->setCellValue("A{$r}", 'JUMLAH');
        $sheet->setCellValue("B{$r}", '=SUM(B2:B' . ($r - 1) . ')');
        $sheet->getStyle("A{$r}:B{$r}")->getFont()->setBold(true);

        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);

        $spreadsheet->setActiveSheetIndex(0);   // fail dibuka pada lembaran data, bukan Ringkasan
    }
```

- Bilangan ditulis sebagai **nombor** (boleh dijumlah); label ditulis eksplisit sebagai string (seperti Lab 9.3).
- JUMLAH ialah **formula**. Jika pengguna membetulkan satu angka dalam Excel, JUMLAH dikira semula.

**5. Jadual ringkasan dalam PDF.** Dalam `app/Views/laporan/pdf.php`, tambah blok ini terus selepas baris `<p style="margin-top: 8px; font-size: 8pt;">Jumlah rekod: …</p>`:

`app/Views/laporan/pdf.php`

```php
<?php if (($summary ?? []) !== []): ?>
    <!-- Lab 9.3b: ringkasan status — angka sama dengan butang "Ringkasan status" pada skrin -->
    <table style="width: 40%; margin-top: 6px;">
        <thead>
        <tr><th>Status</th><th style="width: 30%">Bilangan</th></tr>
        </thead>
        <tbody>
        <?php foreach ($summary as $s): ?>
            <tr><td><?= esc($s['label']) ?></td><td class="num"><?= number_format($s['total']) ?></td></tr>
        <?php endforeach ?>
        <tr><td><strong>JUMLAH</strong></td><td class="num"><strong><?= number_format(array_sum(array_column($summary, 'total'))) ?></strong></td></tr>
        </tbody>
    </table>
<?php endif ?>
```

**6. Sambungkan dalam controller.** Dalam `export()` dalam `app/Controllers/Laporan/ReportController.php`, gantikan blok `$binary = $format === 'pdf' ...` (3 baris) dengan:

`app/Controllers/Laporan/ReportController.php`

```php
        // Lab 9.3b: ringkasan status bagi penapis yang SAMA — angka fail = butang ringkasan skrin. RPT-03 → [].
        $summary = $this->reports->statusSummary($report, $filters);

        $binary = $format === 'pdf'
            ? $this->exporter->pdf($title, $this->reports->columns($report), $rows, $meta, $summary)
            : $this->exporter->xlsx($title, $this->reports->columns($report), $rows, $meta, $summary);
```

**7. Uji.**

1. `/laporan/tempahan?status=approved` → **Eksport Excel**. Fail dibuka pada tab data. Klik tab **Ringkasan**: satu baris *Diluluskan* + JUMLAH, dengan angka yang sama seperti butang ringkasan di skrin.
2. `/laporan/pas` (tanpa filter) → **Eksport Excel** → tab **Ringkasan** → klik sel JUMLAH lajur B. Catat isi bar formula (Kuiz S7). Tukar satu angka di atasnya → JUMLAH berubah.
3. `/laporan/pas` → **Eksport PDF**. Selepas "Jumlah rekod: *N*" ada jadual Status/Bilangan; JUMLAH = *N*.
4. `/laporan/penggunaan` → **Eksport Excel**. Kira tab di bawah tetingkap Excel (Kuiz S7).

**8. Commit.** `git add app/ && git commit -m "RPT: lembaran Ringkasan Excel & ringkasan PDF"`; PowerShell: jalankan `git add` dan `git commit` satu demi satu

### ✅ Checkpoint
- [ ] Excel RPT-01/RPT-02: tab kedua *Ringkasan* dengan angka setiap status = butang ringkasan skrin, dan fail dibuka pada tab data (Kuiz S7).
- [ ] Sel JUMLAH ialah formula `=SUM(...)`; mengubah satu angka mengubah JUMLAH (Kuiz S7).
- [ ] PDF RPT-01/RPT-02: jadual Status/Bilangan selepas "Jumlah rekod", dan JUMLAH = "Jumlah rekod" (Kuiz S7).
- [ ] Excel RPT-03 hanya ada satu tab (Kuiz S7).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Call to undefined method App\Services\ReportService::statusSummary()` | Lab 9.2b belum siap | Siapkan Lab 9.2b langkah 2 dahulu |
| Fail Excel dibuka pada tab *Ringkasan* | `setActiveSheetIndex(0)` tertinggal | Tambah baris terakhir `addSummarySheet()` |
| PDF tiada jadual ringkasan, tiada ralat | `'summary' => $summary` tidak dihantar dalam `pdf()` (view menerima `[]` melalui `?? []`) | Langkah 2 |
| Sel JUMLAH memaparkan teks `=SUM(B2:B6)` | Ditulis dengan `setCellValueExplicit(..., TYPE_STRING)` | Formula ditulis dengan `setCellValue()` |
| Tab *Ringkasan* tiada untuk RPT-01 dengan filter yang tiada rekod | `statusSummary()` memulangkan `[]` apabila tiada rekod | Dijangka — tiada status untuk diringkaskan |
| Angka dalam fail ≠ butang ringkasan skrin | Ringkasan dikira daripada `$this->request->getGet()` mentah | Hantar `$filters` (hasil `normaliseFilters()`) seperti `exportRows()` |

### ⭐ Cabaran tambahan
- Tambah baris JUMLAH RPT-03 (`usageTotals()`) di hujung eksport RPT-03 **tanpa** mengubah "Jumlah rekod" PDF (yang mengira bilangan zon). Petunjuk: hantar baris JUMLAH sebagai parameter berasingan, bukan sebagai baris dalam `$rows`.

---

## Lab 9.4b — Ujian ringkasan, JUMLAH & lembaran Excel (S8)

### 🎯 Objektif
- Menulis 5 ujian PHPUnit yang membandingkan ringkasan status dengan `GROUP BY` SQL terus dan nombor yang dikira dengan tangan, menguji purata berwajaran RPT-03, dan membaca semula fail `.xlsx` sebenar.
- Membuktikan dengan dua mutasi manual bahawa ujian **tanpa filter** boleh lulus secara palsu.
- Mengemas kini MR `feat/laporan` dengan commit baharu pada branch yang sama.

### Prasyarat
- [Lab 9.4](#lab-94--ujian-jumlah-laporan--jumlah-sql--explain-s4) siap: `ReportServiceTest` hijau (7 ujian) dan MR `feat/laporan` dibuka.
- [Lab 9.2b](#lab-92b--ringkasan-status--baris-jumlah-rpt-03-s6) dan [Lab 9.3b](#lab-93b--lembaran-ringkasan-excel--ringkasan-pdf-s7) siap.

### Langkah

**1. Tambah dua `use`** dalam `tests/Services/ReportServiceTest.php`, selepas `use CodeIgniter\Test\DatabaseTestTrait;`:

`tests/Services/ReportServiceTest.php`

```php
use App\Services\ExportService;
use PhpOffice\PhpSpreadsheet\IOFactory;
```

**2. Kira dengan tangan dahulu** daripada fixture Lab 9.4 (5 tempahan, 3 permohonan pas, Zon A 2 slot aktif, Zon B 1 slot aktif):

| Ujian | Jawapan tangan |
|-------|----------------|
| Ringkasan RPT-01 tanpa filter | pending 1, approved 3, rejected 1 |
| Ringkasan RPT-01 Jun 2026 | pending 1, approved 2, rejected 1 (jumlah 4 = senarai) |
| Ringkasan RPT-02 September 2026 | submitted 1, under_review 1 |
| JUMLAH RPT-03 Jun 2026 | 3 slot, 15 hari-slot, kapasiti 90 → 16.7 % (bukan 12.5 %) |
| Lembaran *Ringkasan* Excel | 2 lembaran; `B5` = `=SUM(B2:B4)` = 5 |

**3. Tambah 5 ujian** dalam kelas, terus selepas `testRpt03KadarPenggunaanJun2026()` dan sebelum komen fixture `/** @var array<string, int> id rekod fixture …`:

`tests/Services/ReportServiceTest.php`

```php
    // =====================================================================
    // Lab 9.4b — Ringkasan status, baris JUMLAH RPT-03 & lembaran Ringkasan
    // =====================================================================

    public function testRingkasanStatusSamaDenganGroupBySql(): void
    {
        $f       = $this->service->normaliseFilters('tempahan', []);
        $summary = array_column($this->service->statusSummary('tempahan', $f), 'total', 'value');

        $sql = $this->db->table('slot_bookings')
            ->select('status')
            ->selectCount('id', 'total')
            ->groupBy('status')
            ->get()
            ->getResultArray();

        // assertEquals: susunan kunci tidak penting; intval kerana MySQLi memulangkan COUNT sebagai string
        $this->assertEquals(array_map('intval', array_column($sql, 'total', 'status')), $summary);
        // assertSame: nilai DAN susunan enum (Pending, Approved, Rejected)
        $this->assertSame(['pending' => 1, 'approved' => 3, 'rejected' => 1], $summary);
    }

    public function testRingkasanIkutJulatTarikhSamaDenganSenarai(): void
    {
        // Jun 2026: #1, #2 (approved), #3 (pending), #4 (rejected). #5 (Julai) di luar julat.
        $f       = $this->service->normaliseFilters('tempahan', ['from' => '2026-06-01', 'to' => '2026-06-30']);
        $summary = array_column($this->service->statusSummary('tempahan', $f), 'total', 'value');

        $this->assertSame(['pending' => 1, 'approved' => 2, 'rejected' => 1], $summary);
        $this->assertSame($this->service->paginate('tempahan', $f, 1)['total'], array_sum($summary));
    }

    public function testRingkasanPasIkutJulatSeptember(): void
    {
        // 30/09 14:00 termasuk; 01/10 00:00 (approved) di luar julat — penapis sama seperti senarai.
        $f       = $this->service->normaliseFilters('pas', ['from' => '2026-09-01', 'to' => '2026-09-30']);
        $summary = array_column($this->service->statusSummary('pas', $f), 'total', 'value');

        $this->assertSame(['submitted' => 1, 'under_review' => 1], $summary);
    }

    public function testJumlahRpt03IalahPurataBerwajaran(): void
    {
        $f      = $this->service->normaliseFilters('penggunaan', ['year' => '2026', 'month' => '6']);
        $totals = $this->service->paginate('penggunaan', $f, 1)['totals'];

        // Zon A 15/60 hari-slot (25.0 %) + Zon B 0/30 (0.0 %) → 15/90 = 16.7 %.
        // Purata peratus zon (25.0 + 0.0) / 2 = 12.5 % ialah SALAH: Zon B (1 slot) diberi berat sama dengan Zon A (2 slot).
        $this->assertSame(3, $totals['total_slots']);
        $this->assertSame(15, $totals['booked_days']);
        $this->assertSame(90, $totals['capacity_days']);
        $this->assertSame(16.7, $totals['utilisation']);
    }

    public function testEksportExcelAdaLembaranRingkasan(): void
    {
        $f      = $this->service->normaliseFilters('tempahan', []);
        $binary = (new ExportService())->xlsx(
            $this->service->title('tempahan'),
            $this->service->columns('tempahan'),
            $this->service->exportRows('tempahan', $f, 'xlsx'),
            ['filters' => 'Ujian', 'user' => 'Ujian', 'generated_at' => '01/01/2026 08:00'],
            $this->service->statusSummary('tempahan', $f),
        );

        // Baca semula fail .xlsx sebenar (bukan objek dalam memori) — inilah yang pengguna buka.
        $file = tempnam(WRITEPATH . 'cache', 'xlsx');
        file_put_contents($file, $binary);
        $book = IOFactory::createReader('Xlsx')->load($file);
        unlink($file);

        $this->assertSame(['RPT-01 Senarai Tempahan TLK', 'Ringkasan'], $book->getSheetNames());
        $this->assertSame(0, $book->getActiveSheetIndex());   // dibuka pada lembaran data

        $sheet = $book->getSheetByName('Ringkasan');
        $this->assertSame('=SUM(B2:B4)', $sheet->getCell('B5')->getValue());   // formula, bukan nombor tetap
        $this->assertSame(5, $sheet->getCell('B5')->getCalculatedValue());     // = 5 tempahan fixture
    }
```

```bash
composer test -- tests/Services/ReportServiceTest.php --testdox
```

**4. Mutasi A — query ringkasan ditulis semula tanpa filter.** Dalam `statusSummary()`, gantikan sementara baris `->fromSubquery($this->builder($report, $filters), 'r')` dengan:

```php
            // SENGAJA SALAH — jadual terus: penapis diabaikan
            ->from(($report === 'tempahan' ? 'slot_bookings' : 'pass_applications') . ' r')
```

Jalankan semula. Catat ujian yang gagal **dan** ujian ringkasan yang masih lulus (Kuiz S8). Pulihkan baris asal → hijau.

**5. Mutasi B — purata tanpa wajaran.** Dalam `usageTotals()`, gantikan sementara baris `'utilisation' => $capacity > 0 ? …` dengan:

```php
            // SENGAJA SALAH — purata peratus zon (tanpa wajaran)
            'utilisation'    => $rows === [] ? 0.0 : round(array_sum(array_column($rows, 'utilisation')) / count($rows), 1),
```

Jalankan semula dan catat mesej kegagalan (Kuiz S8). Pulihkan → hijau.

**6. Semua ujian.** `composer test` → semua hijau, termasuk ujian Hari 5–8.

**7. Commit & push ke MR yang sama.**

```bash tab="Git Bash / macOS / Linux"
git add tests/ && git commit -m "RPT: ujian ringkasan status, jumlah RPT-03 & lembaran Excel"
git push    # MR feat/laporan dikemas kini — tiada MR baharu (Hari 4)
```

```powershell tab="PowerShell"
git add tests/
git commit -m "RPT: ujian ringkasan status, jumlah RPT-03 & lembaran Excel"
git push    # MR feat/laporan dikemas kini — tiada MR baharu (Hari 4)
```

Selepas jurulatih/rakan sebelah meluluskan semakan, **merge** MR `feat/laporan` ke `main` (M3 siap; Hari 10 bermula dari `main`).

### ✅ Checkpoint
- [ ] `composer test -- tests/Services/ReportServiceTest.php` → semua hijau (≥ 12 ujian: 7 Lab 9.4 + 5 Lab 9.4b) (Kuiz S8).
- [ ] Mutasi A: tepat dua ujian gagal, dan ujian ringkasan tanpa filter tetap lulus; dipulihkan (Kuiz S8).
- [ ] Mutasi B: `testJumlahRpt03IalahPurataBerwajaran` gagal dengan nilai `12.5`; dipulihkan (Kuiz S8).
- [ ] Tab *Commits* MR `feat/laporan` menunjukkan commit `RPT: ujian ringkasan status, …` (Kuiz S8).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Class "Tests\Services\ExportService" not found` | `use` langkah 1 tertinggal | Tambah dua baris `use` |
| `Failed asserting that two arrays are identical` dengan `'approved' => '3'` | `(int)` tertinggal dalam `statusSummary()`; MySQLi memulangkan `COUNT` sebagai string | `'total' => (int) $counts[$case->value]` |
| `tempnam(): file created in the system's temporary directory` | `writable/cache/` tiada atau tidak boleh ditulis | Cipta semula folder `writable/cache/` dan pastikan ia boleh ditulis |
| Mutasi A: tiada ujian gagal | Fail `ReportService.php` belum disimpan, atau ujian berfilter (Jun, September) tidak ditambah | Simpan fail; semak langkah 3 menambah **5** ujian |
| `Failed asserting that 16.666666666666668 is identical to 16.7.` | `round(..., 1)` tertinggal dalam `usageTotals()` | Bundarkan seperti `usageByZone()` |

### ⭐ Cabaran tambahan
- Tambah ujian bahawa `statusSummary('penggunaan', …)` memulangkan `[]` dan bahawa eksport Excel RPT-03 hanya ada **satu** lembaran.

---
