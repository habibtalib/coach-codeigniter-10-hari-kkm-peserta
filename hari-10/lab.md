# Lab Hari 10 — Kerja Pasukan: Sprint 3, Keluaran v1.1.0 & Capstone Pasukan

[← README](./README.md) · [Jadual](../JADUAL.md) · [👥 Peranan pasukan](../docs/peranan-pasukan.md) · [📋 Rubrik Capstone](../docs/rubrik-capstone.md)

| Lab | Sesi | Masa | Hasil |
|-----|------|------|-------|
| 10.20 | S8 | 09:00–12:30 | Isu Sprint 3 ditutup atau dialih; `main` hijau pada pembekuan ciri |
| 10.21 | S9 | 14:30–15:15 | MR CHANGELOG 1.1.0, nota keluaran, tag `v1.1.0` + Release |
| 10.22 | S10–S11 | 15:15–17:00 | Demo capstone pasukan, soalan baris kerja, retro akhir |

> ℹ️ Repo: `aplikasi-baharu/espkpv2`. Mekanik isu → MR → merge seperti [Lab 8.21–8.23](../hari-8/lab.md#lab-821--sprint-1-pagi-isu-pelan-ujian--slice-pertama-s16). Lab individu Statistik & capstone (10.1–10.12) dalam [Lampiran](#lampiran--lab-individu-statistik--capstone-rujukan).

---

## Lab 10.20 — Sprint 3: Ciri Terakhir & Pembekuan (S8)

### 🎯 Objektif
Menyiapkan isu Sprint 3 setiap pasangan dan pepijat kritikal melalui MR yang disemak QA sebelum **pembekuan ciri 12:30**, dan membuat keputusan skop yang jelas untuk isu yang tidak siap.

### Prasyarat
- `main` terkini hijau (`git pull`, `composer install`, `php spark migrate --all`, `composer test`).
- Pasukan Projek dan Dev kekal (isu #19); isu Sprint 3 mempunyai AC dan label `pasangan::N` (Lab 9.21).

### Langkah

1. **Stand-up dan skop (08:30–09:30).** PM:

   ```text
   Jalankan glab issue list --milestone "Sprint 3 + v1.1 (Hari 10)" --label pasukan::dev. Untuk setiap isu: saiz, pasangan, risiko tidak siap sebelum 12:30. Cadangkan susunan kerja: pepijat keutamaan::1-kritikal dahulu.
   ```

   PM memutuskan, mengemas kini *Assignee* dan `status::`.

2. **Pepijat kritikal dahulu (Dev + QA).** Setiap pepijat: ujian gagal yang menunjukkan pepijat → pembetulan → ujian hijau → MR `fix/<no>-…` dengan `Closes #<no>`.

   ```text
   Ujian/E2E ini gagal: <output>. Reproduce dahulu: tulis satu ujian PHPUnit yang gagal kerana pepijat ini. Jangan ubah kod app/ lagi.
   ```

3. **Ciri Sprint 3 (09:30–11:30).** Ritma Lab 8.21–8.22: `/ciri-baharu <no>` → slice (mod *Manual*) → `composer semak` → `semak-espkp` → commit `Rujuk #<no>`.

4. **MR dan merge (11:30–12:15).** `/semak-mr <no>` oleh QA → approve → PM merge mengikut susunan.

5. **Pembekuan (12:30).** MR ciri yang belum di-merge: tukar ke draf, komen *"Dialih ke backlog selepas pembekuan v1.1.0: <status, apa tinggal>"*, buang milestone. Selepas 12:30, hanya branch `fix/…` boleh di-merge.

### ✅ Checkpoint
- [ ] Setiap isu Sprint 3 ditutup atau dialih dengan komen; `composer test` hijau pada `main` selepas merge terakhir.

---

## Lab 10.21 — Keluaran v1.1.0 (S9)

### 🎯 Objektif
Menyediakan keluaran v1.1.0 daripada `main` yang hijau: CHANGELOG yang setiap barisnya dipautkan kepada MR sebenar, nota keluaran, tag beranotasi dan Release GitLab.

### Langkah

1. **Stabil (QA dan floater, 15 minit).** Pada `main` terkini: `composer test` dan E2E (bahagian *Ujian hujung ke hujung (E2E)* README repo). Kegagalan → `fix/…` kecil atau isu yang diketahui dalam nota keluaran.

2. **Draf CHANGELOG (PM keluaran, 15 minit).** Mod *Plan*:

   ```text
   Jalankan glab mr list --merged untuk milestone "Sprint 1 (Hari 8)", "Sprint 2 (Hari 9)" dan "Sprint 3 + v1.1 (Hari 10)". Draf CHANGELOG.md dengan tajuk "# Changelog" dan bahagian "## [1.1.0] - 2026-10-30" (format Keep a Changelog: Ditambah, Diubah, Dibaiki, Keselamatan). Satu baris setiap MR dengan !no dan #isu. Jangan tulis fail.
   ```

   BA dan wakil setiap pasangan menyemak baris isu mereka terhadap MR sebenar. Baris tanpa MR → buang.

3. **MR CHANGELOG.** Branch `docs/changelog-v1.1.0`, tampal CHANGELOG yang disemak, MR dengan QA sebagai penyemak, PM keluaran merge.

4. **Tag dan Release (jurulatih, di hadapan kelas).** Tag `v*` dilindungi (Maintainer). PM keluaran membaca nota keluaran; jurulatih menjalankan:

   ```bash
   git switch main && git pull --ff-only
   git tag -a v1.1.0 -m "v1.1.0: satu permohonan terbuka, peringatan Pindaan, RPT-10, sejarah log masuk, dasar kata laluan"
   git push origin v1.1.0
   glab release create v1.1.0 --notes-file nota-v1.1.0.md
   ```

### ✅ Checkpoint
- [ ] `glab release view v1.1.0` menunjukkan nota keluaran; `CHANGELOG.md` di `main`.

---

## Lab 10.22 — Demo Capstone Pasukan & Refleksi (S10–S11)

### 🎯 Objektif
Mendemokan hasil pasukan pada `v1.1.0` dengan bukti setiap peranan, **menerangkan** satu baris kerja sendiri (kod, ujian atau AC) tanpa Claude, dan merefleksi penggunaan Claude Code dalam pasukan.

### Langkah

1. **Persediaan (10 minit, sebelum giliran).** `git switch --detach v1.1.0`, `php spark migrate --all`, `php spark serve`. Setiap ahli memilih satu baris yang di-commit sendiri:

   ```bash
   git log --author="<nama anda>" --oneline v1.1.0
   ```

   Latih diri (Claude tidak boleh memberi jawapan):

   ```text
   Tanya saya 3 soalan tentang baris <fail:baris> yang saya commit, seperti panel capstone. Jangan beri jawapan.
   ```

2. **Demo capstone.** Pasukan Projek 12 minit (PM: backlog & keputusan skop; BA: satu isu BRS → AC; QA: ujian yang membuktikan AC, satu pepijat yang ditangkap sebelum merge, E2E). Setiap pasangan Dev 10 minit (ciri di pelayar dengan ≥ 2 akaun, termasuk satu yang menerima 404; MR dan ujian). Floater 5 minit. Panel 18 minit (soalan baris kerja setiap ahli).

3. **Retro akhir (S11, 20 minit).** Dalam isu `Retro akhir — Pasukan CI-KKM-10`, setiap orang satu komen: peranan yang paling mengajar, satu kali Claude mempercepat (prompt mana) dan satu kali Claude melambatkan atau menyesatkan (pintu mana menangkapnya), satu peraturan yang dibawa ke jabatan.

### ✅ Checkpoint
- [ ] Helaian markah pasukan ([`rubrik-capstone.md`](../docs/rubrik-capstone.md) §8) diisi panel.
- [ ] Komen retro setiap ahli.

---

## Semakan kendiri — akhir hari

**Kerja pasukan (hari ini):** `glab release view v1.1.0 -R aplikasi-baharu/espkpv2`, `glab issue list --milestone "Sprint 3 + v1.1 (Hari 10)" -R aplikasi-baharu/espkpv2`.

- [ ] Isu Sprint 3 pasukan saya ditutup atau dialih ke backlog dengan sebab sebelum pembekuan (Lab 10.20).
- [ ] `CHANGELOG.md` 1.1.0 di-merge dan setiap baris sepadan dengan MR sebenar; tag `v1.1.0` wujud (Lab 10.21).
- [ ] Saya menerangkan satu baris kerja saya (kod, ujian atau AC) tanpa Claude semasa demo (Lab 10.22).
- [ ] Komen retro akhir saya ditambah dalam isu retro pasukan (Lab 10.22).

**Statistik & capstone individu (rujukan, tidak wajib):**

```bash
composer test         # semua hijau (termasuk StatisticsCacheTest)
git log --oneline -8  # commit STAT: dan FIX: hari ini
git tag -l            # v1.0-capstone
git status --short    # tiada output
```

- [ ] `pelulus@latihan.test` → `/statistik` memaparkan 4 kad KPI + 4 carta; `/statistik/data` memulangkan JSON dengan 12 nilai `charts.bookings_by_month.data`.
- [ ] `penyemak@latihan.test` → `/statistik` dan `/statistik/data` disekat.
- [ ] `composer test` hijau, termasuk `tests/Services/StatisticsCacheTest.php`.
- [ ] `docs/UAT-signoff.md` §4: UAT-01..UAT-10 tiada ⬜; `git log --oneline` menunjukkan ≥ 1 commit `FIX:`.
- [ ] `git tag -l` menunjukkan `v1.0-capstone` dan `git status --short` kosong.

---

## Lampiran — Lab individu Statistik & capstone (rujukan)

> ℹ️ Lab di bawah ialah lab Hari 10 sebelum mod pasukan: Modul Statistik dan capstone individu dalam `kelas-ci-<nama>` dengan Claude Code (Lab 10.10–10.12) atau secara manual (Lab 10.1–10.4). Ia kekal sebagai **rujukan, tidak wajib**.

## Lab 10.10 — Claude Code: Statistik slice demi slice (S5)

> 🛡️ **Peraturan Lab 10.10–10.12.** Data sintetik sahaja; jangan beri isi `.env` kepada Claude. Setiap edit dibuat dalam mod **Manual**: anda membaca dan meluluskan setiap diff satu demi satu. Mod *accept edits*, *auto* dan `bypassPermissions` dilarang, begitu juga pilihan "Yes, allow all edits…" dan "Yes, and don't ask again" untuk edit fail. Kod Lab 10.1–10.2 ialah **kod rujukan** untuk langkah "Banding dengan kod rujukan", bukan untuk ditaip semula.

### 🎯 Objektif
Membina modul Statistik (M4) bersama Claude Code dalam 4 slice (`StatisticsService` + 4 KPI; dataset carta + endpoint JSON; view Chart.js 4; cache + invalidasi selepas commit). Setiap slice melalui gelung 7 langkah [README §5.1](./README.md#51-gelung-7-langkah-untuk-setiap-slice), dan 3 baris kunci setiap slice diterangkan dengan ayat anda sendiri dalam `docs/nota-claude.md`.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- Lab 7.6–7.9 siap: `CLAUDE.md` projek, subagent `semak-ci4`, server MCP `ci4-spark` dalam `.mcp.json`, dan `docs/nota-claude.md`.
- `.claude/settings.json` mempunyai `"defaultMode": "default"` (dipaparkan sebagai **Manual**) dan peraturan `deny` untuk `.env` ([tutorial Claude Code](../docs/tutorial-claude-code.md) §5).
- M1, M2, M3 di-merge ke `main`; `composer test` hijau; data demo daripada `DemoDataSeeder` (Lab 9.1 langkah 0).

### Langkah

**1. Branch, sesi dan mod (5 min).**

```bash tab="Git Bash / macOS / Linux"
git switch main && git pull
git switch -c feat/statistik
claude
```

```powershell tab="PowerShell"
git switch main
git pull
git switch -c feat/statistik
claude
```

Dalam Claude Code, taip `/mcp`: `ci4-spark` berstatus *connected*. Baris bawah **tidak** menunjukkan *accept edits on* atau *plan mode on*: itulah mod Manual. Jika ia menunjukkan *accept edits on*, tekan `Shift+Tab` (atau `Alt+M`) sehingga tiada label mod.

**2. Gelung langkah 1: SPEC & BR (5 min).** Buka [`spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) §2.4, §4, §6 dan §9, serta README §1.1 dan §1.4. Tambah bahagian ini dalam `docs/nota-claude.md` (anda yang menaip):

```text
## Hari 10 — Statistik (M4)

| Slice | SPEC / takrif | BR / gate | Ujian bukti |
|---|---|---|---|
| 1 KPI | §2.4, §9 Pendaftaran service, README §1.1 | BR-TLK-04 (takrif aktif) | tests/Services/StatisticsServiceTest.php |
| 2 Data + JSON | §2.4, §4, §6, README §1.4 | G2 | tests/feature/Statistik/StatistikAccessTest.php |
| 3 View | README §1.2, §1.5 | K2 (esc) | pelayar + semak-ci4 |
| 4 Cache | §2.4, §9 Cache | BR-PAS-01, BR-PAS-05, BR-TLK-05 | tests/Services/StatisticsCacheTest.php |

### Gerbang terangkan
| Slice | Fail:baris | Apa | Kenapa | Jika dibuang |
|---|---|---|---|---|

### Diff yang saya tolak
| Slice | Cadangan Claude | Sebab saya tolak |
|---|---|---|
```

**3. Gelung langkah 2: pelan slice dalam mod Plan (15 min).** Tekan `Shift+Tab` (atau `Alt+M`) sehingga baris bawah menunjukkan **plan mode**, kemudian tampal:

```text
Mod Plan. Jangan ubah sebarang fail.
Konteks: @docs/spesifikasi-sistem.md §2.4 (M4 Statistik), §4 (peranan), §6 (route), §9 (baris "Pendaftaran service"
dan "Cache"), dan @CLAUDE.md.
Takrif KPI: Tempahan aktif = slot_bookings dengan status pending/approved (BR-TLK-04). Kadar penggunaan slot =
slot berbeza dengan tempahan approved yang meliputi hari ini ÷ slot aktif (is_active = 1, tidak dipadam) × 100.
Pas menunggu = pass_applications dengan status submitted/under_review. Purata hari lulus =
AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) / 24 bagi approved_at IS NOT NULL.
Tugas: cadangkan pelan 4 slice untuk modul Statistik:
1. StatisticsService::build() dengan 4 KPI + daftar service('statisticsService') + ujian unit dengan $now tetap.
2. 4 dataset carta (12 bulan diisi sifar; usage_by_zone guna semula ReportService::usageByZone()) + dashboard()
   + DashboardController index()/data() + route group statistik dengan filter permission:statistik.view + ujian feature.
3. View app/Views/statistik/dashboard.php: kad KPI dirender di server, 4 <canvas>, Chart.js 4.4.7, fetch /statistik/data.
4. cache()->remember(StatisticsService::CACHE_KEY, 600, ...) + cache()->delete(StatisticsService::CACHE_KEY) SELEPAS
   setiap transCommit() dalam BookingService dan PassWorkflowService + StatisticsCacheTest yang merah dahulu.
Untuk setiap slice: fail yang dicipta/diubah, kaedah, ujian yang membuktikannya, arahan pengesahan, dan risiko.
Kekangan: CodeIgniter 4.6+, PHP 8.2+, Query Builder sahaja, nama tepat ikut SPEC, tiada package composer baharu,
jangan sentuh .env atau migration. Tanya saya dahulu jika ada yang kabur.
```

Pelan yang baik mengandungi:
- 4 slice yang setiap satunya boleh diuji sendiri, dengan fail, kaedah dan ujian dinamakan;
- `StatisticsService::CACHE_KEY = 'stat_dashboard'` dan TTL 600 (SPEC §9), `service('statisticsService')`;
- `$now` disuntik melalui constructor supaya KPI "hari ini" boleh diuji;
- slice 4 bermula dengan ujian merah, dan `cache()->delete(...)` selepas **setiap** `transCommit()` (`create()`/`submit()` dan `transition()`).

Tolak atau edit pelan yang: menggabungkan semua slice dalam satu langkah, menambah migration atau jadual baharu, menulis query kedua untuk penggunaan zon (bukan `ReportService::usageByZone()`), atau meletakkan invalidasi dalam controller.

**Edit pelan itu sekurang-kurangnya sekali.** Pada soalan kelulusan pelan, pilih pilihan untuk terus merancang dan taip pembetulan anda, cth "Slice 2: tambah ujian applicant → bukan 200 untuk /statistik/data." Apabila pelan betul, pilih pilihan yang **mengekalkan kelulusan manual** untuk setiap edit; jangan sekali-kali pilih pilihan *auto-accept edits*.

**4. Slice 1: KPI (25 min).**

**4a. Laksana (Manual).** Pastikan baris bawah tiada label mod, kemudian tampal:

```text
Laksanakan Slice 1 sahaja daripada pelan.
- app/Services/StatisticsService.php: CACHE_KEY = 'stat_dashboard', CACHE_TTL = 600, constructor
  (?BaseConnection $db = null, ?DateTimeImmutable $now = null), build() yang memulangkan generated_at dan kpi
  (active_bookings, slot_utilisation, pending_passes, avg_days_to_approve). charts = [] buat masa ini.
- Daftar statisticsService dalam app/Config/Services.php (SPEC §9).
- tests/Services/StatisticsServiceTest.php: fixture sintetik sendiri, $now tetap 2026-09-25 09:00:00, satu ujian bagi
  setiap KPI, termasuk avg_days_to_approve = null apabila tiada pas diluluskan dan slot_utilisation = 0 apabila tiada slot aktif.
Guna enum BookingStatus/PassStatus untuk nilai status, bukan string bertaip. Satu fail pada satu masa; selepas setiap
fail, terangkan 3 baris paling penting. Jangan jalankan migration.
```

Diff yang baik: `declare(strict_types=1)`, `whereIn('status', …)` dengan nilai enum, `TIMESTAMPDIFF(HOUR, …) / 24`, `$this->now` untuk "hari ini", kawalan pembahagian dengan sifar, dan ujian dengan `DatabaseTestTrait` (`$migrate`, `$refresh`, `$namespace = null`).

**Tolak** (pilih **No** dan taip sebabnya) jika anda nampak: `TIMESTAMPDIFF(DAY`, `status = 'approved'` untuk purata, `date('Y-m-d')` dalam service, `->query("… $x")`, ujian yang hanya `assertIsArray()`, atau perubahan pada service lain. Contoh sebab: "No: guna $this->now, bukan date(), supaya ujian tidak bergantung pada tarikh hari ini." Rekod setiap penolakan dalam jadual *Diff yang saya tolak*.

**4b. Sahkan.** Dalam Claude Code:

```text
!composer test -- tests/Services/StatisticsServiceTest.php
```

Jangkaan: `OK (5 tests, …)` atau lebih. Kemudian jalankan sendiri di HeidiSQL/phpMyAdmin `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');` pada DB pembangunan, dan bandingkan dengan `php spark shell` → `service('statisticsService')->build()['kpi']`.

**4c. Semak dengan `semak-ci4`.**

```text
Guna subagent semak-ci4 untuk menyemak app/Services/StatisticsService.php, app/Config/Services.php dan
tests/Services/StatisticsServiceTest.php: Query Builder/binding, nama ikut SPEC §9, pembahagian dengan sifar,
kebergantungan pada tarikh hari ini, dan ujian yang tidak menguji apa-apa.
Jadual | Fail:baris | Isu | Keterukan | Cadangan |. Jangan ubah fail.
```

Buka setiap fail:baris sendiri. Untuk setiap dapatan yang sahih, minta pembetulan **satu dapatan pada satu masa** ("Betulkan dapatan #1 sahaja"), baca diff, luluskan, dan ulang 4b.

**4d. Gerbang terangkan.** Pilih 3 baris kunci (cth `whereIn('status', …)`, `/ 24`, kawalan sifar) dan isi jadual *Gerbang terangkan* dengan ayat anda sendiri: apa, kenapa, apa jadi jika dibuang. Jangan salin jawapan Claude.

**4e. Commit kecil.**

```bash tab="Git Bash / macOS / Linux"
git add app/Services/StatisticsService.php app/Config/Services.php tests/Services/StatisticsServiceTest.php docs/nota-claude.md
git commit -m "STAT: StatisticsService 4 KPI + ujian (slice 1)"
```

```powershell tab="PowerShell"
git add app/Services/StatisticsService.php app/Config/Services.php tests/Services/StatisticsServiceTest.php docs/nota-claude.md
git commit -m "STAT: StatisticsService 4 KPI + ujian (slice 1)"
```

Taip `/clear` dalam Claude Code sebelum slice seterusnya, kemudian `@docs/nota-claude.md` jika perlu konteks pelan.

**5. Slice 2: dataset carta + endpoint JSON (30 min).**

**5a. Laksana (Manual):**

```text
Laksanakan Slice 2 sahaja.
- Dalam StatisticsService::build() tambah charts: bookings_by_month (12 bulan tahun semasa, bulan kosong = 0),
  pass_status (keys = nilai enum PassStatus, labels BM, data), usage_by_zone (guna semula ReportService::usageByZone(),
  jangan tulis query kedua), pass_trend (12 bulan terakhir). Bentuk mesti sama dengan kontrak README Hari 10 §1.4.
- Tambah dashboard() yang memulangkan build() (slice 4 akan membalutnya dengan cache).
- app/Controllers/Statistik/DashboardController.php: index() memaparkan view dengan kpi;
  data() memulangkan $this->response->setJSON(service('statisticsService')->dashboard()).
- app/Config/Routes.php: route group statistik (namespace App\Controllers\Statistik, filter permission:statistik.view),
  GET / (as statistik) dan GET data (as statistik.data), ikut SPEC §6.
- Ujian unit: bookings_by_month mempunyai 12 nilai dan bulan tanpa rekod = 0.
- tests/feature/Statistik/StatistikAccessTest.php: approver → GET /statistik/data 200 JSON; applicant → bukan 200.
Satu fail pada satu masa; terangkan 3 baris paling penting selepas setiap fail.
```

Diff yang baik: `array_column($rows, 'total', 'm')` + gelung 1..12 dengan `?? 0`, `groupBy` pada alias, `keys` berasingan daripada `labels`, controller tanpa query, dan satu route group dengan filter.

**Tolak** jika: query penggunaan zon ditulis semula dalam `StatisticsService`, controller memanggil `db_connect()`, route tanpa filter atau filter `session` sahaja, ujian akses hanya untuk peranan yang dibenarkan, atau `labels` digunakan sebagai kunci warna.

**5b. Sahkan:**

```text
!composer test
```

Jangkaan: semua hijau, termasuk `StatistikAccessTest`. Kemudian tanya `ci4-spark`:

```text
Guna tool ci4-spark: senaraikan route statistik dan filter bagi GET /statistik/data. Adakah kedua-dua route dilindungi permission:statistik.view?
```

Luluskan panggilan `ci4-spark - routes` dan `ci4-spark - filter_check`, dan bandingkan dengan `php spark routes` yang anda jalankan sendiri. Dalam pelayar: `pelulus@latihan.test` → `/statistik/data` memaparkan JSON dengan 12 nilai `charts.bookings_by_month.data`; `pemohon1@latihan.test` → disekat.

**5c. Semak:**

```text
Guna subagent semak-ci4 untuk menyemak app/Controllers/Statistik/DashboardController.php, app/Config/Routes.php
(group statistik) dan perubahan charts dalam app/Services/StatisticsService.php: filter pada setiap route statistik,
tiada query dalam controller, bulan kosong diisi sifar, usage_by_zone guna semula ReportService.
Jadual | Fail:baris | Isu | Keterukan | Cadangan |. Jangan ubah fail.
```

**5d–5e.** Gerbang terangkan (3 baris, cth filter `permission:statistik.view`, `array_column(..., 'total', 'm')`, `setJSON()`), kemudian commit:

```bash tab="Git Bash / macOS / Linux"
git add app/ tests/ docs/nota-claude.md
git commit -m "STAT: dataset carta + /statistik/data + ujian akses (slice 2)"
```

```powershell tab="PowerShell"
git add app/ tests/ docs/nota-claude.md
git commit -m "STAT: dataset carta + /statistik/data + ujian akses (slice 2)"
```

**6. Slice 3: view Chart.js (20 min).**

**6a. Laksana (Manual):**

```text
Laksanakan Slice 3 sahaja: app/Views/statistik/dashboard.php menggunakan layout sedia ada.
- Kad KPI dirender di server dengan esc() dan number_format(); papar — apabila avg_days_to_approve null.
- 4 <canvas> (chartBookingsByMonth, chartPassStatus, chartUsageByZone, chartPassTrend), setiap satu dalam
  <div style="position:relative;height:280px">.
- Chart.js 4.4.7 dari https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js, dimuat sebelum skrip anda.
- fetch ke url_to('statistik.data') dengan semakan res.ok dan Content-Type sebelum res.json(); mesej mesra jika gagal.
- Fungsi draw() memanggil Chart.getChart(canvas)?.destroy() dahulu. Jenis: bar, doughnut, bar mendatar
  (indexAxis: 'y'), line; maintainAspectRatio: false.
- Jangan guna innerHTML untuk data dari server; guna textContent.
Terangkan 3 baris paling penting selepas fail siap.
```

Diff yang baik: setiap `<?= ?>` melalui `esc()` (atau `url_to()` yang dibalut `esc()`), semakan `res.ok`, `indexAxis: 'y'`, `destroy()` sebelum `new Chart()`.

**Tolak** jika: `innerHTML` dengan data server, `res.json()` tanpa semakan `res.ok`, Chart.js versi lain atau `@latest`, KPI dikira semula dalam JavaScript, atau view memanggil `service()`/query terus.

**6b. Sahkan.** Log masuk sebagai `pelulus@latihan.test` → `/statistik`: 4 kad + 4 carta. DevTools (`F12`) → *Console*: tiada ralat merah; *Network* → `data`: status 200, `Content-Type: application/json`. Kemudian `!composer test`: hijau.

**6c. Semak:**

```text
Guna subagent semak-ci4 untuk menyemak app/Views/statistik/dashboard.php: setiap <?= tanpa esc(), penggunaan
innerHTML atau insertAdjacentHTML dengan data server, semakan res.ok sebelum res.json(), dan URL dibina dengan url_to().
Jadual | Fail:baris | Isu | Keterukan | Cadangan |. Jangan ubah fail.
```

**6d–6e.** Gerbang terangkan (cth `res.ok`, `indexAxis: 'y'`, `Chart.getChart(canvas)?.destroy()`), kemudian commit:

```bash tab="Git Bash / macOS / Linux"
git add app/Views/statistik/dashboard.php docs/nota-claude.md
git commit -m "STAT: dashboard Chart.js 4 kad KPI + 4 carta (slice 3)"
```

```powershell tab="PowerShell"
git add app/Views/statistik/dashboard.php docs/nota-claude.md
git commit -m "STAT: dashboard Chart.js 4 kad KPI + 4 carta (slice 3)"
```

**7. Slice 4: cache + invalidasi selepas commit (30 min).**

**7a. Ujian merah dahulu (Manual):**

```text
Laksanakan Slice 4, bahagian A sahaja: tulis tests/Services/StatisticsCacheTest.php DAHULU.
- setUp() memanggil cache()->delete(StatisticsService::CACHE_KEY).
- Ujian 1: dashboard() mengisi cache (cache()->get(StatisticsService::CACHE_KEY) bukan null).
- Ujian 2: isi cache, BookingService::approve() pada tempahan pending sintetik, kemudian cache mesti null.
- Ujian 3: sama untuk satu peralihan PassWorkflowService (ikut corak pengguna Shield dalam tests/feature/Pas/PassAccessTest.php).
JANGAN ubah kod aplikasi. Selepas fail siap, terangkan ujian mana yang patut merah sekarang dan kenapa.
```

Kemudian jalankan sendiri:

```text
!composer test -- tests/Services/StatisticsCacheTest.php
```

Jangkaan: **merah** (dashboard() belum menggunakan cache, jadi ujian 1 dan semakan `assertNotNull` dalam ujian 2 gagal). Simpan output ini; checkpoint memerlukannya.

**7b. Pelaksanaan (Manual):**

```text
Laksanakan Slice 4, bahagian B. Sebelum mengubah apa-apa, senaraikan setiap $this->db->transCommit() dalam
app/Services/BookingService.php dan app/Services/PassWorkflowService.php (kaedah + peralihan status).
Kemudian:
- balut dashboard() dengan cache()->remember(self::CACHE_KEY, self::CACHE_TTL, fn (): array => $this->build());
- tambah SATU baris cache()->delete(StatisticsService::CACHE_KEY); SELEPAS setiap transCommit() yang anda senaraikan:
  bukan sebelum commit, bukan dalam blok try sebelum commit, bukan dalam controller.
Jangan ubah ujian. Satu fail pada satu masa.
```

Diff yang baik: senarai `transCommit()` merangkumi `create()`/`submit()` dan `transition()`; setiap `delete` berada pada baris **selepas** `transCommit()`; kunci sentiasa `StatisticsService::CACHE_KEY`.

**Tolak** jika: `delete` sebelum `transCommit()` atau dalam controller, string `'stat_dashboard'` ditaip dalam service lain, `cache()->clean()`, TTL selain 600, atau sebarang perubahan pada `StatisticsCacheTest`.

**7c. Sahkan:**

```bash tab="Git Bash / macOS / Linux"
grep -n -e "transCommit" -e "CACHE_KEY" app/Services/*.php
composer test
```

```powershell tab="PowerShell"
Select-String -Path app\Services\*.php -Pattern "transCommit|CACHE_KEY"
composer test
```

Jangkaan: setiap baris `transCommit` dalam `BookingService` dan `PassWorkflowService` diikuti baris `CACHE_KEY`; semua ujian hijau. Dalam pelayar: sebagai `pelulus`, lulus satu permohonan pas → `/statistik` → "Pas menunggu" turun serta-merta.

**7d. Semak:**

```text
Guna subagent semak-ci4 untuk menyemak app/Services/BookingService.php, app/Services/PassWorkflowService.php dan
app/Services/StatisticsService.php: setiap transCommit() diikuti cache()->delete(StatisticsService::CACHE_KEY),
tiada delete sebelum commit atau dalam controller, tiada string 'stat_dashboard' di luar StatisticsService,
dan data cache hanya array skalar. Jadual | Fail:baris | Isu | Keterukan | Cadangan |. Jangan ubah fail.
```

**7e.** Gerbang terangkan (cth `remember()`, `delete` selepas `transCommit()`, `setUp()` yang mengosongkan cache), kemudian commit:

```bash tab="Git Bash / macOS / Linux"
git add app/ tests/ docs/nota-claude.md
git commit -m "STAT: cache dashboard 10 minit + invalidasi selepas commit (slice 4)"
```

```powershell tab="PowerShell"
git add app/ tests/ docs/nota-claude.md
git commit -m "STAT: cache dashboard 10 minit + invalidasi selepas commit (slice 4)"
```

**8. Banding dengan kod rujukan (10 min).** Buka Lab 10.1 langkah 2 dan seterusnya, Lab 10.2 langkah 2 dan 5–7, dan `StatisticsService.php.txt` (modul **Templat & Rujukan**). Isi jadual ini dalam `docs/nota-claude.md`:

```text
| Perkara | Kod saya (Claude + saya) | Kod rujukan | Sama? | Jika beza: kenapa, dan adakah ia melanggar SPEC? |
|---|---|---|---|---|
| Takrif 4 KPI | | | | |
| Bulan kosong = 0 | | | | |
| usage_by_zone guna ReportService | | | | |
| Lokasi cache()->delete | | | | |
| Ujian cache (merah dahulu) | | | | |
```

Perbezaan gaya boleh dikekalkan dengan sebab. Perbezaan yang melanggar SPEC atau takrif KPI dibaiki melalui gelung yang sama (pelan kecil → diff Manual → sahkan → commit `FIX:`).

**9. Merge.**

```bash tab="Git Bash / macOS / Linux"
git add docs/nota-claude.md && git commit -m "STAT: banding dengan kod rujukan"
git push -u origin feat/statistik
```

```powershell tab="PowerShell"
git add docs/nota-claude.md
git commit -m "STAT: banding dengan kod rujukan"
git push -u origin feat/statistik
```

Buka MR ke `main` dan merge. Lab 10.11 bermula dari `main`.

### ✅ Checkpoint 10.10
- [ ] Pelan 4 slice dibuat dalam mod Plan dan anda edit sekurang-kurangnya sekali; setiap edit fail diluluskan dalam mod Manual, tanpa *accept edits*, *auto* atau *bypass* (Kuiz S5).
- [ ] `composer test` hijau, termasuk `StatisticsServiceTest`, `StatistikAccessTest` dan `StatisticsCacheTest`, dan output merah `StatisticsCacheTest` dari langkah 7a ditunjukkan kepada jurulatih (Kuiz S5).
- [ ] `pelulus@latihan.test` melihat 4 kad + 4 carta di `/statistik`; `pemohon1@latihan.test` disekat; setiap `transCommit()` diikuti `cache()->delete(StatisticsService::CACHE_KEY)`. 🪟 PowerShell: `Select-String -Path app\Services\*.php -Pattern "transCommit|CACHE_KEY"` (Kuiz S5).
- [ ] `docs/nota-claude.md` mengandungi 12 baris gerbang terangkan (3 setiap slice) dalam ayat anda sendiri, sekurang-kurangnya 1 diff yang ditolak dengan sebab, dan jadual banding dengan kod rujukan (Kuiz S5).
- [ ] `git log --oneline` menunjukkan 4 commit `STAT:` kecil (satu setiap slice) pada `feat/statistik`, di-merge ke `main` (Kuiz S5).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Shift+Tab` tidak menukar mod (Windows) | Terminal memintas kekunci | Tekan `Alt+M` |
| `!composer test` → `'composer' is not recognized` atau `command not found` (Windows) | PATH sesi Claude Code berbeza daripada terminal anda | Tutup dan buka semula VS Code selepas memasang Composer; semak `where composer` dalam PowerShell |
| Claude Code tidak boleh menjalankan arahan shell (Windows) | Claude Code di Windows memerlukan Git Bash | Pasang Git for Windows; jika masih gagal, tetapkan `CLAUDE_CODE_GIT_BASH_PATH` kepada `C:\Program Files\Git\bin\bash.exe` ([tutorial](../docs/tutorial-claude-code.md)) |
| Diff menunjukkan setiap baris fail berubah (Windows) | Hujung baris CRLF/LF bercampur | Tolak diff itu dan minta Claude mengekalkan hujung baris asal; semak `git diff --stat` sebelum commit |
| `/mcp` → `ci4-spark` *failed* (Windows) | `php` tiada dalam PATH proses Claude | `claude mcp add --scope local ci4-spark -- "C:\laragon\bin\php\<versi>\php.exe" tools/ci4-spark-mcp.php` (skop `local`, tidak mengubah `.mcp.json` yang dikongsi) |
| `Cache unable to write to "…\writable\cache\"` (Windows) | Folder baca sahaja atau projek dalam OneDrive | Alih projek keluar dari OneDrive; buang tanda *Read-only* pada `writable\` |
| Carta kosong; *Console*: `Chart is not defined` | Proksi jabatan menyekat CDN | Salinan tempatan `chart.umd.min.js` (Lab 10.1 🧯) |

### ⭐ Cabaran tambahan
- Minta Claude (mod Plan) menerangkan `cache()->remember()` dalam `system/Cache/` CodeIgniter, kemudian sahkan sendiri dengan membuka fail itu dan rekod baris yang disahkan dalam `docs/nota-claude.md`.

---

## Lab 10.11 — Claude Code: Persediaan capstone (S6)

### 🎯 Objektif
Menjalankan 4 semakan capstone dengan Claude Code: subagent `semak-ci4` pada seluruh repo, AI-08 (DoD) untuk setiap modul, AI-09 (jurang ujian) dan AI-18 (`README.md`/`CLAUDE.md`/PRD). Anda mengesahkan setiap dapatan sendiri, membaiki yang diterima melalui gelung 7 langkah, dan menanda `v1.0-capstone`.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- Checkpoint 10.10 lulus; `feat/statistik` di-merge ke `main`.
- UAT manual (Lab 10.3 langkah 1–3 dan 5, 11:45–12:30) sudah dijalankan: `docs/UAT-signoff.md` diisi dan pepijat direkod dalam `docs/kes-ujian-akhir.md`.

### Langkah

**1. Branch dan konteks bersih (2 min).**

```bash tab="Git Bash / macOS / Linux"
git switch main && git pull
git switch -c chore/capstone
claude
```

```powershell tab="PowerShell"
git switch main
git pull
git switch -c chore/capstone
claude
```

**2. Seluruh repo melalui subagent `semak-ci4` (15 min).**

```text
Guna subagent semak-ci4 untuk menyemak SELURUH repo sebagai panel capstone (@docs/rubrik-capstone.md §2 dan
README Hari 10 §3.4):
- G1 / BR-PAS-04: setiap kaedah yang membuka rekod Pas/TLK mengikut id menyemak pemilikan dalam service.
- G2 / K5: setiap route dalam app/Config/Routes.php selain log masuk mempunyai filter session, group atau permission.
- K2: setiap <?= $ dalam app/Views tanpa esc() (abaikan app/Views/errors/).
- G4: setiap move()/store() fail muat naik menulis di luar public/.
- G5 / K7: setiap ->query( dan setiap where/like yang mencantum input pengguna.
Beri jadual | # | Gate/K | Fail:baris | Lulus/Gagal | Bukti |. Jangan ubah fail.
```

Cipta `docs/semakan-capstone.md` dan rekod **setiap** dapatan (anda yang menaip):

```text
# Semakan capstone (subagent semak-ci4)

| # | Gate/K | Dapatan | Fail:baris | Disahkan dengan | Terima/Tolak | Sebab |
|---|---|---|---|---|---|---|
| 1 | K5 | ... | app/Config/Routes.php:.. | php spark filter:check GET /... | Tolak | filter pada group |
```

Sahkan dengan arahan bukti Lab 10.3 langkah 5 atau tool `ci4-spark`:

```text
Guna tool ci4-spark filter_check untuk GET /statistik, GET /laporan/tempahan dan GET /pas/semakan. Senaraikan filter bagi setiap satu.
```

**3. Baiki dapatan yang diterima (20 min).** Untuk setiap dapatan **Terima** (dan pepijat UAT keterukan tertinggi), satu demi satu:

```bash
git switch -c fix/<bug-id>-<ringkas>
```

Ujian merah dahulu (AI-10, Manual):

```text
Dapatan #<n> dalam docs/semakan-capstone.md (atau BUG-00N dalam docs/kes-ujian-akhir.md): <ringkasan>.
Langkah reproduce: <1. … 2. … 3. …>. Peraturan: <BR-… / G… / K…>.
Tulis SATU ujian PHPUnit (DatabaseTestTrait atau FeatureTestTrait) yang GAGAL sekarang kerana isu ini.
JANGAN ubah kod aplikasi. Terangkan setiap baris ujian.
```

Jalankan `!composer test -- --filter <namaUjian>`: mesti **merah**. Kemudian:

```text
Ujian <namaUjian> merah. Cadangkan pembetulan MINIMUM dalam satu fail untuk menjadikannya hijau, tanpa mengubah ujian.
Terangkan kenapa pembetulan itu cukup dan apa yang boleh rosak.
```

Baca diff, luluskan, jalankan `!composer test` (semua hijau). Stage perubahan di terminal anda (`git add app/ tests/ docs/`), kemudian dalam Claude Code jalankan AI-08 ke atas diff staged:

```text
!git diff --staged
```

```text
Mod Plan. Semak diff staged di atas terhadap Definition of Done @docs/kolaborasi.md §2 (AI-08): validasi di server,
akses di server, status_logs, esc(), tiada SQL mentah bercantum input, tiada rahsia, nama ikut SPEC.
Lulus/Gagal + baris bukti bagi setiap perkara. Cadangkan mesej commit "FIX: <ringkasan> (BUG-00N)".
```

Baiki setiap "Gagal" melalui gerbang yang sama, kemudian commit `FIX:` dan merge ke `chore/capstone`. Tandakan *Ditutup* dalam log pepijat.

**Tolak** jika: pembetulan menyentuh lebih daripada fail yang perlu, ujian diubah supaya hijau, atau "pembetulan" menyembunyikan butang sahaja tanpa semakan di server.

**4. AI-08: matriks Definition of Done (15 min).** Dalam mod Plan:

```text
Mod Plan. Jangan ubah sebarang fail.
Untuk setiap modul (M1 TLK, M2 Pas, M3 Laporan, M4 Statistik), semak 7 item Definition of Done dalam
@docs/kolaborasi.md §2 terhadap kod sekarang. Beri matriks | Item DoD | M1 | M2 | M3 | M4 |, setiap sel
Lulus/Gagal + fail:baris atau nama ujian sebagai bukti. Untuk item "peserta boleh menerangkan", tulis "Peserta".
Akhir sekali senaraikan maksimum 5 sel Gagal, paling penting dahulu.
```

Matriks yang baik: setiap sel ada bukti yang boleh dibuka. Pilih **3 sel secara rawak** (termasuk satu "Lulus") dan sahkan sendiri dengan membuka fail atau menjalankan ujian itu. Sel tanpa bukti atau bukti yang salah ditanda "Tidak disahkan" dalam `docs/semakan-capstone.md`. Setiap sel Gagal yang sahih dibaiki seperti langkah 3.

**5. AI-09: jurang ujian (15 min).** Dalam mod Plan:

```text
Mod Plan. Jangan ubah sebarang fail.
Bandingkan setiap peraturan BR-TLK-01..06 dan BR-PAS-01..06 dalam @docs/spesifikasi-sistem.md §2 dengan ujian dalam tests/.
Jadual | BR | Ujian yang meliputi (fail::kaedah) | Tiada / Separa / Penuh |.
Kemudian cadangkan kes ujian (AI-09) untuk 2 jurang paling berisiko:
| # | Jenis (unit/feature) | Given | When | Then | BR |. JANGAN tulis kod ujian lagi.
```

Pilih 2 kes, kemudian dalam mod Manual:

```text
Tulis kes ujian #<a> dan #<b> daripada jadual tadi dalam <fail ujian sedia ada atau baharu dalam tests/>.
Fixture sintetik sendiri, tarikh relatif (+1 day). Jangan ubah kod aplikasi. Terangkan setiap assert.
```

**Bukti ujian mengesan pelanggaran:** untuk setiap ujian baharu, langgar peraturan itu sementara dalam service (cth tukar `90` kepada `91` untuk BR-TLK-03), jalankan ujian (merah), kemudian pulihkan:

```bash
composer test -- --filter <namaUjian>
git restore app/
git diff --stat app/
composer test
```

Jangkaan: merah semasa peraturan dilanggar; `git diff --stat app/` kosong selepas `git restore`; semua hijau. Commit `FIX: ujian <BR> (jurang AI-09)`.

**6. AI-18: dokumen serahan (10 min).** Dalam mod Plan:

```text
Mod Plan. Jangan ubah sebarang fail.
Semak @README.md, @CLAUDE.md dan @docs/prd.md (jika wujud) secara kritis (AI-18) sebagai pembangun baharu yang mewarisi
repo esok: langkah pemasangan yang tiada (composer install, php spark migrate --all, php spark db:seed, composer test,
akaun @latihan.test), arahan yang lapuk berbanding kod sekarang (Laporan, Statistik, cache, subagent semak-ci4,
ci4-spark), dan FR/AC dalam PRD yang belum dibina atau sudah berubah.
Maksimum 8 isu dalam jadual | Fail · bahagian | Isu | Kenapa penting | Cadangan |, paling penting dahulu.
```

Sahkan sekurang-kurangnya 2 isu dengan membuka fail, kemudian dalam mod Manual:

```text
Betulkan isu #<a> dan #<b> sahaja dalam README.md/CLAUDE.md (dan docs/prd.md jika berkaitan). Satu fail pada satu masa.
Jangan tambah rahsia; hanya akaun sintetik @latihan.test dan Latihan@2026 dibenarkan. Tunjukkan diff setiap fail.
```

**Tolak** jika diff menambah kandungan `.env`, URL atau kata laluan sebenar, atau menulis semula keseluruhan fail. Sahkan setiap arahan dalam README benar-benar wujud (`composer run-script --list`, `php spark list`). Commit `CHORE: kemas kini README & CLAUDE.md untuk serahan`.

**7. Banding dengan kod rujukan (5 min).** Bandingkan ujian dan pembetulan anda dengan Lab 10.3 langkah 4–5 serta `BookingServiceTest.php.txt` dan `PassAccessTest.php.txt` (modul **Templat & Rujukan**). Tulis 2 perbezaan dan sebabnya dalam `docs/semakan-capstone.md`.

**8. Merge dan tag.**

```bash tab="Git Bash / macOS / Linux"
git add docs/ && git commit -m "SETUP: semakan capstone semak-ci4, DoD & jurang ujian"
git push -u origin chore/capstone
```

```powershell tab="PowerShell"
git add docs/
git commit -m "SETUP: semakan capstone semak-ci4, DoD & jurang ujian"
git push -u origin chore/capstone
```

Buka MR ke `main` dan merge. Kemudian uji `main` dan tag (sama seperti Lab 10.3 langkah 6):

```bash tab="Git Bash / macOS / Linux"
git switch main && git pull
composer test
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

```powershell tab="PowerShell"
git switch main
git pull
composer test
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

### ✅ Checkpoint 10.11
- [ ] `docs/semakan-capstone.md` merekod setiap dapatan `semak-ci4` dengan Terima/Tolak dan bukti arahan yang anda jalankan sendiri (Kuiz S6).
- [ ] Setiap dapatan yang diterima dibaiki melalui ujian merah → hijau, dan AI-08 dijalankan pada diff staged sebelum setiap commit `FIX:` (Kuiz S6).
- [ ] 2 ujian baharu daripada AI-09 hijau, dan setiap satu dilihat merah semasa peraturannya dilanggar sementara (Kuiz S6).
- [ ] Sekurang-kurangnya 2 isu AI-18 dibetulkan dalam `README.md`/`CLAUDE.md` dan di-commit `CHORE:` (Kuiz S6).
- [ ] `composer test` hijau pada `main` dan `git tag -l` menunjukkan `v1.0-capstone`. 🪟 PowerShell: arahan sama, `git tag -l` (Kuiz S6).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `semak-ci4` tidak berjalan; Claude menyemak sendiri | Subagent tidak dimuat dalam sesi ini | `/agents` untuk menyemak; `/exit` dan `claude` semula; atau taip `@agent-semak-ci4` |
| `!git diff --staged` kosong | Perubahan belum di-stage | Jalankan `git add app/ tests/ docs/` di terminal anda dahulu |
| `git restore app/` turut membuang pembetulan yang belum di-commit | Perubahan lain belum di-commit semasa peraturan dilanggar sementara | Commit pembetulan dahulu; `git status --short` mesti bersih sebelum langkah 5 |
| `php spark filter:check GET /statistik` → laluan ditukar kepada `C:/Program Files/Git/statistik` (Windows Git Bash) | Git Bash menukar laluan bermula `/` | Awalan `MSYS_NO_PATHCONV=1` (Lab 10.3 langkah 5), atau guna PowerShell |
| `git tag` ditolak: *already exists* | Tag dicipta sebelum pembaikan terakhir | `git tag -d v1.0-capstone`, kemudian `git tag -a …` semula (sebelum push); PowerShell: jalankan satu demi satu |
| Ujian lulus di mesin anda, gagal pada rakan (Windows) | Tarikh tetap atau zon masa berbeza | Tarikh relatif; `app.appTimezone = 'Asia/Kuala_Lumpur'` (SPEC §9) |

### ⭐ Cabaran tambahan
- Minta Claude (mod Plan) membandingkan `docs/semakan-capstone.md` dengan K1–K10 README §3.4: K mana yang belum ada bukti? Sahkan dan lengkapkan sendiri.

---

## Lab 10.12 — Demo capstone & refleksi Claude Code (S7)

### 🎯 Objektif
Mendemokan sistem dalam 8 minit mengikut format README §4.1, menerangkan sendiri baris yang dipilih panel (termasuk baris yang ditulis Claude), dan menulis refleksi terima/tolak berdasarkan bukti dalam `docs/nota-claude.md`.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- Checkpoint 10.11 lulus; tag `v1.0-capstone`.
- Prasyarat Lab 10.4: DB demo bersih + seed, 5 tetingkap log masuk, skrip demo 1 halaman.

### Langkah

**1. Latih segmen terangkan kod (10 min, sebelum giliran).** Dalam Claude Code, mod Plan (AI-14):

```text
Mod Plan. Jangan ubah sebarang fail.
Bertindak sebagai panel capstone (@docs/rubrik-capstone.md §3 kriteria E dan §4.3). Pilih SATU baris daripada setiap fail:
app/Services/StatisticsService.php, app/Services/BookingService.php dan app/Views/statistik/dashboard.php.
Tanya saya satu baris pada satu masa: apa baris ini buat, kenapa ia di sini, apa jadi jika dibuang?
Tunggu jawapan saya, kemudian beri Tahap 1–4 ikut kriteria E dan terangkan apa yang tertinggal.
```

Untuk setiap jawapan Tahap 1–2: baca semula fail itu dan kemas kini baris gerbang terangkan berkaitan dalam `docs/nota-claude.md`. Jangan hafal jawapan Claude; terangkan dengan ayat anda sendiri.

**2. Demo 8 minit.** Ikut Lab 10.4 langkah 1–4. Dalam segmen M4 (minit 6–7): lulus satu permohonan pas, kemudian muat semula `/statistik` → "Pas menunggu" berubah serta-merta (invalidasi slice 4). Dalam segmen terangkan kod (minit 7–8), jawab sendiri: *apa + kenapa + apa jadi jika dibuang*.

**3. Bukti di laptop selepas minit 8.** Panel menyemak semasa mengisi helaian markah:

```bash
composer test
git tag -l
git log --oneline -20
```

Tunjukkan juga `docs/nota-claude.md` (12 baris gerbang terangkan + diff yang ditolak) dan `docs/semakan-capstone.md`.

**4. Refleksi Claude Code (10 min).** Kumpul data mentah dahulu (mod Plan):

```text
Mod Plan. Jangan ubah sebarang fail.
Daripada git log hari ini dan @docs/nota-claude.md, senaraikan dalam jadual: setiap commit STAT:/FIX:/CHORE:, fail yang
diubah, dan baris gerbang terangkan atau diff ditolak yang berkaitan. Jangan tulis refleksi untuk saya.
```

Kemudian tulis refleksi **sendiri** di hujung `docs/nota-claude.md`:

```text
## Refleksi Claude Code — Hari 10

| # | Cadangan Claude | Terima / Tolak | Bukti (commit, ujian, fail:baris) | Pengajaran |
|---|---|---|---|---|
| 1 | | Terima | | |
| 2 | | Terima | | |
| 3 | | Terima | | |
| 4 | | Tolak | | |
| 5 | | Tolak | | |

Satu kali Claude salah, dan bagaimana saya mengesannya: ...
Satu peraturan yang saya akan terus guna selepas kursus: ...
```

**5. Retrospektif.** Ikut Lab 10.4 langkah 5, dan tambah satu kad tentang Claude Code (Start/Stop/Continue).

**6. Banding dengan kod rujukan (5 min).** Bandingkan `app/Services/StatisticsService.php` anda dengan `StatisticsService.php.txt` (modul **Templat & Rujukan**). Tulis 2 perbezaan dalam refleksi anda: kenapa ia wujud, dan sama ada anda akan mengekalkannya.

**7. Serah repo.** Ikut Lab 10.4 langkah 6. Sertakan `CLAUDE.md`, `.claude/agents/`, `.claude/skills/`, `.mcp.json` dan `docs/nota-claude.md`. Jangan sertakan `.env`, `.claude/settings.local.json` atau `CLAUDE.local.md`:

```bash tab="Git Bash / macOS / Linux"
git ls-files | grep -E "settings\.local|CLAUDE\.local|(^|/)\.env$"
git add docs/nota-claude.md && git commit -m "CHORE: refleksi Claude Code Hari 10"
git push origin main
```

```powershell tab="PowerShell"
git ls-files | Select-String "settings\.local|CLAUDE\.local|(^|/)\.env$"
git add docs/nota-claude.md
git commit -m "CHORE: refleksi Claude Code Hari 10"
git push origin main
```

Jangkaan: arahan `ls-files` tiada output. Commit refleksi selepas tag tidak mengalih `v1.0-capstone`.

### ✅ Checkpoint 10.12
- [ ] Demo selesai dalam ≤ 8 minit, dan segmen M4 menunjukkan KPI "Pas menunggu" berubah serta-merta selepas kelulusan (Kuiz S7).
- [ ] Baris yang dipilih panel diterangkan sendiri: apa, kenapa, dan apa jadi jika dibuang (Kuiz S7).
- [ ] Refleksi dalam `docs/nota-claude.md` mempunyai ≥ 3 Terima dan ≥ 2 Tolak, setiap satu dengan bukti commit, ujian atau fail:baris (Kuiz S7).
- [ ] Repo diserahkan tanpa `.env`, `.claude/settings.local.json` atau `CLAUDE.local.md` dalam `git ls-files`. 🪟 PowerShell: `git ls-files | Select-String "settings\.local|CLAUDE\.local|(^|/)\.env$"` tiada output (Kuiz S7).

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `.claude/settings.local.json` muncul dalam `git ls-files` (Windows) | Fail di-commit sebelum `.gitignore` dikemas kini | `git rm --cached .claude/settings.local.json`, tambah ke `.gitignore`, commit |
| Claude dalam mod Plan meminta kebenaran untuk `git log` | Arahan shell tetap memerlukan kelulusan | Luluskan sekali sahaja ("Yes"); jangan pilih "don't ask again" untuk arahan yang mengubah fail |
| Carta kosong semasa demo | Tiada internet untuk CDN | Salinan tempatan `chart.umd.min.js` (Lab 10.1 🧯), sediakan sebelum demo |
| `php spark serve` gagal: *Address already in use* (Windows) | Laragon/Apache menggunakan port 8080 | `php spark serve --port 8081` dan `app.baseURL = 'http://localhost:8081/'` dalam `.env` |

### ⭐ Cabaran tambahan
- Tulis satu perenggan untuk penyelia anda: bagaimana gelung 7 langkah boleh digunakan dalam projek jabatan anda tanpa melanggar peraturan data (sintetik sahaja, tiada `.env`, tiada sistem sebenar).

---

## Lab 10.1 — Dashboard: KPI + 4 carta Chart.js (S1)

### 🎯 Objektif
- Menulis `StatisticsService::build()` yang memulangkan 4 KPI + 4 dataset.
- Membina `/statistik` (HTML + kad KPI) dan `/statistik/data` (JSON).
- Melukis carta bar, doughnut, bar mendatar dan line dengan Chart.js 4.

### Prasyarat
- 🪟 **Windows:** Git Bash disyorkan ([`persediaan.md`](../docs/persediaan.md) §5). Jika terminal VS Code anda PowerShell, pilih tab **PowerShell** pada blok arahan yang ada dua tab; blok tanpa tab berjalan dalam kedua-dua terminal.
- M1, M2, M3 di-merge ke `main`; `composer test` hijau.
- Data seed cukup: `DemoDataSeeder` dari Lab 9.1 langkah 0 (≥ 20 tempahan, ≥ 15 permohonan pas pelbagai status & bulan).
- Internet untuk CDN Chart.js (atau salinan tempatan — lihat 🧯).

### Langkah

**1. Route.** Tambah dalam `app/Config/Routes.php`:

```php
$routes->group('statistik', [
    'namespace' => 'App\Controllers\Statistik',
    'filter'    => 'permission:statistik.view',
], static function ($routes) {
    $routes->get('/', 'DashboardController::index', ['as' => 'statistik']);
    $routes->get('data', 'DashboardController::data', ['as' => 'statistik.data']);
});
```

```bash tab="Git Bash / macOS / Linux"
php spark routes | grep statistik
# MSYS_NO_PATHCONV=1: Git Bash (Windows) tidak menukar /statistik kepada laluan C:/…; tiada kesan di macOS/Linux
MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik
```

```powershell tab="PowerShell"
php spark routes | Select-String statistik
# PowerShell tidak menukar /statistik kepada laluan C:/…, jadi tiada awalan diperlukan
php spark filter:check GET /statistik
```

**2. Service — mula TANPA cache.** Cipta `app/Services/StatisticsService.php`:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\PassStatus;
use CodeIgniter\Database\BaseConnection;
use DateTimeImmutable;

class StatisticsService
{
    public const CACHE_KEY = 'stat_dashboard';

    public const CACHE_TTL = 600; // saat = 10 minit (SPEC §2.4)

    private const MONTHS_BM = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    private BaseConnection $db;

    private DateTimeImmutable $now;

    /** $now boleh disuntik dalam ujian supaya keputusan tidak bergantung pada tarikh hari ini. */
    public function __construct(?BaseConnection $db = null, ?DateTimeImmutable $now = null, private ?ReportService $reports = null)
    {
        $this->db      = $db ?? db_connect();
        $this->now     = $now ?? new DateTimeImmutable();
        $this->reports ??= new ReportService($this->db);
    }

    /**
     * Pintu masuk tunggal untuk controller.
     *
     * @return array{generated_at: string, kpi: array<string, int|float|null>, charts: array<string, array>}
     */
    public function dashboard(): array
    {
        return $this->build();          // Lab 10.2 akan membalut dengan cache()->remember()
    }

    /** Kira semua data TANPA cache (public supaya boleh diuji terus). */
    public function build(): array
    {
        return [
            'generated_at' => $this->now->format('d/m/Y H:i:s'),
            'kpi'          => [
                'active_bookings'     => $this->activeBookings(),
                'slot_utilisation'    => $this->slotUtilisationToday(),
                'pending_passes'      => $this->pendingPasses(),
                'avg_days_to_approve' => $this->avgDaysToApprove(),
            ],
            'charts' => [
                'bookings_by_month' => $this->bookingsByMonth(),
                'pass_status'       => $this->passStatus(),
                'usage_by_zone'     => $this->usageByZone(),
                'pass_trend'        => $this->passTrend12Months(),
            ],
        ];
    }
}
```

`build()` memanggil 8 kaedah peribadi yang anda tambah dalam langkah 3–4, **dalam kelas ini, sebelum `}` terakhir**. Halaman hanya berfungsi selepas langkah 4.

**3. Tulis 4 KPI** sebagai kaedah peribadi. Semak takrif di README §1.1. Tambah keempat-empatnya:

`app/Services/StatisticsService.php`

```php
    // ------------------------------------------------------------------
    // KPI
    // ------------------------------------------------------------------

    /** Tempahan aktif = pending + approved (takrif sama seperti BR-TLK-04). */
    private function activeBookings(): int
    {
        return $this->db->table('slot_bookings')
            ->whereIn('status', BookingStatus::active())   // ['pending', 'approved']
            ->countAllResults();
    }

    /** Kadar penggunaan slot HARI INI (%) = slot berbeza yang diduduki ÷ slot aktif × 100. */
    private function slotUtilisationToday(): float
    {
        $today = $this->now->format('Y-m-d');

        $activeSlots = $this->db->table('parking_slots')
            ->where('is_active', 1)
            ->where('deleted_at', null)
            ->countAllResults();

        if ($activeSlots === 0) {
            return 0.0;
        }

        // distinct() + countAllResults() → CI4 membungkus sebagai subquery: COUNT(*) FROM (SELECT DISTINCT slot_id ...)
        $occupied = $this->db->table('slot_bookings')
            ->select('slot_id')
            ->distinct()
            ->where('status', BookingStatus::Approved->value)
            ->where('start_date <=', $today)
            ->where('end_date >=', $today)
            ->countAllResults();

        return round($occupied / $activeSlots * 100, 1);
    }

    /** Permohonan pas menunggu tindakan = submitted + under_review. */
    private function pendingPasses(): int
    {
        return $this->db->table('pass_applications')
            ->whereIn('status', [PassStatus::Submitted->value, PassStatus::UnderReview->value])
            ->countAllResults();
    }

    /**
     * Purata hari untuk lulus pas = AVG(approved_at − created_at).
     * Guna approved_at IS NOT NULL (bukan status = approved) supaya pas yang kini 'expired'
     * tetapi pernah diluluskan tetap dikira. Jam ÷ 24 → pecahan hari yang lebih tepat.
     */
    private function avgDaysToApprove(): ?float
    {
        $row = $this->db->table('pass_applications')
            ->select('AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) / 24 AS avg_days', false)
            ->where('approved_at IS NOT NULL')
            ->get()
            ->getRowArray();

        return isset($row['avg_days']) ? round((float) $row['avg_days'], 1) : null; // null = tiada data lagi
    }
```

`slotUtilisationToday()` menggunakan `->select('slot_id')->distinct()->...->countAllResults()`: slot yang ditempah dua kali hari ini dikira sekali sahaja.

**4. Tulis 4 dataset carta.** Format seragam `['labels' => [...], 'data' => [...]]`:

| Kaedah | Query utama | Ingat |
|--------|-------------|-------|
| `bookingsByMonth()` | `select('MONTH(created_at) AS m', false)->selectCount('id', 'total')->groupBy('m')` tahun semasa | **Isi sifar** 12 bulan |
| `passStatus()` | `select('status')->selectCount('id', 'total')->groupBy('status')` | Ikut `PassStatus::cases()`; pulang `keys` + `labels` |
| `usageByZone()` | **Guna semula** `$this->reports->usageByZone(['year'=>..., 'month'=>..., 'sort'=>'utilisation', 'dir'=>'desc'])` | Tiada query baharu |
| `passTrend12Months()` | `select("DATE_FORMAT(created_at, '%Y-%m') AS ym", false)` 12 bulan terakhir | Isi sifar; label `Okt 25` |

Kod penuh keempat-empat kaedah:

`app/Services/StatisticsService.php`

```php
    // ------------------------------------------------------------------
    // Dataset carta — format seragam: ['labels' => [...], 'data' => [...]]
    // ------------------------------------------------------------------

    /** (bar) Tempahan dibuat setiap bulan bagi tahun semasa — Jan..Dis, bulan kosong = 0. */
    private function bookingsByMonth(): array
    {
        $year = (int) $this->now->format('Y');

        $rows = $this->db->table('slot_bookings')
            ->select('MONTH(created_at) AS m', false)
            ->selectCount('id', 'total')
            ->where('created_at >=', "{$year}-01-01 00:00:00")
            ->where('created_at <', ($year + 1) . '-01-01 00:00:00')
            ->groupBy('m')
            ->get()
            ->getResultArray();

        $byMonth = array_column($rows, 'total', 'm');
        $data    = [];

        for ($m = 1; $m <= 12; $m++) {
            $data[] = (int) ($byMonth[$m] ?? 0);  // ISI SIFAR — jika tidak, bar teranjak ke bulan salah
        }

        return ['labels' => self::MONTHS_BM, 'data' => $data, 'year' => $year];
    }

    /** (doughnut) Taburan status pas. 'keys' = nilai enum (untuk warna di JS), 'labels' = BM. */
    private function passStatus(): array
    {
        $rows = $this->db->table('pass_applications')
            ->select('status')
            ->selectCount('id', 'total')
            ->groupBy('status')
            ->get()
            ->getResultArray();

        $counts = array_column($rows, 'total', 'status');
        $out    = ['keys' => [], 'labels' => [], 'data' => []];

        // Ikut susunan enum (bukan susunan DB) supaya warna & legenda sentiasa konsisten.
        foreach (PassStatus::cases() as $status) {
            $out['keys'][]   = $status->value;
            $out['labels'][] = $status->label();
            $out['data'][]   = (int) ($counts[$status->value] ?? 0);
        }

        return $out;
    }

    /** (bar mendatar) Penggunaan (%) setiap zon bulan semasa — GUNA SEMULA RPT-03. */
    private function usageByZone(): array
    {
        $rows = $this->reports->usageByZone([
            'year'  => (int) $this->now->format('Y'),
            'month' => (int) $this->now->format('n'),
            'sort'  => 'utilisation',
            'dir'   => 'desc',
        ]);

        return [
            'labels' => array_map(static fn (array $r): string => $r['zone_code'] . ' ' . $r['zone_name'], $rows),
            'data'   => array_map(static fn (array $r): float => (float) $r['utilisation'], $rows),
        ];
    }

    /** (line) Bilangan permohonan pas 12 bulan terakhir (termasuk bulan semasa). */
    private function passTrend12Months(): array
    {
        $firstMonth = $this->now->modify('first day of this month')->modify('-11 months')->setTime(0, 0);

        $rows = $this->db->table('pass_applications')
            ->select("DATE_FORMAT(created_at, '%Y-%m') AS ym", false)
            ->selectCount('id', 'total')
            ->where('created_at >=', $firstMonth->format('Y-m-d H:i:s'))
            ->groupBy('ym')
            ->get()
            ->getResultArray();

        $byMonth = array_column($rows, 'total', 'ym');
        $labels  = [];
        $data    = [];

        for ($i = 0; $i < 12; $i++) {
            $month    = $firstMonth->modify("+{$i} months");
            $labels[] = self::MONTHS_BM[(int) $month->format('n') - 1] . ' ' . $month->format('y');
            $data[]   = (int) ($byMonth[$month->format('Y-m')] ?? 0);
        }

        return ['labels' => $labels, 'data' => $data];
    }
```

**5. Daftar service & controller nipis.** Dalam `app/Config/Services.php`, dalam kelas `Services`, selepas `exportService()`:

```php
public static function statisticsService(bool $getShared = true): \App\Services\StatisticsService
{
    if ($getShared) {
        return static::getSharedInstance('statisticsService');
    }

    return new \App\Services\StatisticsService();
}
```

```bash
php spark make:controller Statistik/DashboardController
```

Gantikan kandungan fail yang dijana dengan:

`app/Controllers/Statistik/DashboardController.php`

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Statistik;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;

class DashboardController extends BaseController
{
    public function index(): string
    {
        $stats = service('statisticsService')->dashboard();

        return view('statistik/dashboard', [
            'title'       => 'Dashboard Statistik',
            'kpi'         => $stats['kpi'],
            'generatedAt' => $stats['generated_at'],
        ]);
    }

    public function data(): ResponseInterface
    {
        $stats = service('statisticsService')->dashboard();

        // setJSON() → Content-Type: application/json; charset=UTF-8
        // no-store: pelayar/proksi jangan simpan salinan — cache kita di PELAYAN, bukan klien.
        return $this->response
            ->setHeader('Cache-Control', 'no-store')
            ->setJSON($stats);
    }
}
```

**6. Semak JSON dahulu, carta kemudian.** Log masuk sebagai `pelulus@latihan.test` dan buka `http://localhost:8080/statistik/data`. Semak: 12 nilai dalam `charts.bookings_by_month.data`, 5 dalam `charts.pass_status.data`, 12 dalam `charts.pass_trend.data`.

**7. View** `app/Views/statistik/dashboard.php`. Cipta fail ini dengan kod penuh di bawah, kemudian baca dan pastikan anda boleh menerangkan setiap perkara dalam senarai ini:
- 4 kad KPI (Bootstrap `card`, `col-sm-6 col-xl-3`) dirender dari `$kpi` dengan `esc()`.
- 4 `<canvas>` masing-masing dalam `<div style="position: relative; height: 280px">`.
- Dalam `<?= $this->section('scripts') ?>`: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>` (versi **dipin** — jangan `@4` terbuka; atau salinan tempatan `base_url('assets/vendor/chartjs/chart.umd.min.js')`, lihat 🧯) dan skrip `fetch('<?= site_url('statistik/data') ?>')`.
- Fungsi `draw()` yang memanggil `Chart.getChart(canvas)?.destroy()` sebelum `new Chart(...)`.
- Carta ketiga: `type: 'bar'` + `options.indexAxis: 'y'`.

Skrip carta masuk ke `section('scripts')`, jadi `app/Views/layouts/main.php` mesti ada `<?= $this->renderSection('scripts') ?>` sebelum `</body>` (layout Hari 6).

`app/Views/statistik/dashboard.php`

```php
<?php

/**
 * app/Views/statistik/dashboard.php — Hari 10
 * Kad KPI dirender di pelayan (cepat, berfungsi walaupun JS gagal).
 * 4 carta dilukis oleh Chart.js 4 daripada JSON /statistik/data.
 *
 * @var string                          $title
 * @var array<string, int|float|null>   $kpi
 * @var string                          $generatedAt
 */

$cards = [
    ['label' => 'Tempahan aktif',            'value' => number_format((int) $kpi['active_bookings']),                  'icon' => 'bi-p-square',        'color' => 'primary'],
    ['label' => 'Kadar penggunaan slot hari ini', 'value' => number_format((float) $kpi['slot_utilisation'], 1) . ' %', 'icon' => 'bi-speedometer2',   'color' => 'success'],
    ['label' => 'Permohonan pas menunggu',   'value' => number_format((int) $kpi['pending_passes']),                   'icon' => 'bi-hourglass-split', 'color' => 'warning'],
    ['label' => 'Purata hari untuk lulus pas', 'value' => $kpi['avg_days_to_approve'] === null ? '—' : number_format((float) $kpi['avg_days_to_approve'], 1) . ' hari', 'icon' => 'bi-stopwatch', 'color' => 'info'],
];
?>
<?= $this->extend('layouts/main') ?>

<?php // <h1> dipapar oleh layouts/main.php daripada $title. Skrip Chart.js masuk ke section 'scripts' (sebelum </body>). ?>
<?= $this->section('content') ?>
<div class="d-flex justify-content-end mb-3">
    <small class="text-muted">
        Data dijana: <span id="generated-at"><?= esc($generatedAt) ?></span>
        <span class="badge text-bg-light border">cache 10 minit</span>
    </small>
</div>

<!-- ============ KAD KPI ============ -->
<div class="row g-3 mb-4">
    <?php foreach ($cards as $c): ?>
        <div class="col-sm-6 col-xl-3">
            <div class="card h-100 border-start border-4 border-<?= esc($c['color'], 'attr') ?>">
                <div class="card-body d-flex align-items-center gap-3">
                    <i class="bi <?= esc($c['icon'], 'attr') ?> fs-2 text-<?= esc($c['color'], 'attr') ?>" aria-hidden="true"></i>
                    <div>
                        <div class="text-muted small"><?= esc($c['label']) ?></div>
                        <div class="fs-4 fw-semibold"><?= esc($c['value']) ?></div>
                    </div>
                </div>
            </div>
        </div>
    <?php endforeach ?>
</div>

<div id="chart-error" class="alert alert-danger d-none" role="alert"></div>

<!-- ============ 4 CARTA ============
     Setiap <canvas> dibalut div berketinggian tetap + maintainAspectRatio:false
     supaya carta tidak "membesar tanpa henti" dalam grid responsif. -->
<div class="row g-3">
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Tempahan TLK mengikut bulan (<span id="year-label"></span>)</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartBookingsByMonth" aria-label="Carta bar tempahan mengikut bulan" role="img"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Status permohonan pas</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartPassStatus" aria-label="Carta doughnut status pas" role="img"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Penggunaan slot mengikut zon — bulan ini (%)</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartUsageByZone" aria-label="Carta bar mendatar penggunaan zon" role="img"></canvas></div>
        </div></div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100"><div class="card-body">
            <h2 class="h6">Trend permohonan pas — 12 bulan</h2>
            <div style="position: relative; height: 280px;"><canvas id="chartPassTrend" aria-label="Carta garis trend permohonan pas" role="img"></canvas></div>
        </div></div>
    </div>
</div>
<?= $this->endSection() ?>

<?= $this->section('scripts') ?>
<?php // Chart.js 4.4.7 DIPIN. Tiada internet? Guna salinan tempatan base_url('assets/vendor/chartjs/chart.umd.min.js') (lihat 🧯). ?>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script>
(() => {
    'use strict';

    // Warna ikut NILAI enum PassStatus (bukan label) — padan dengan PassStatus::badge() (text-bg-*)
    const PASS_COLORS = {
        submitted:    '#6c757d', // secondary
        under_review: '#0dcaf0', // info
        approved:     '#198754', // success
        rejected:     '#dc3545', // danger
        expired:      '#212529', // dark
    };

    // Lukis carta pada kanvas; musnahkan carta lama dahulu jika kanvas pernah digunakan
    // (elak ralat "Canvas is already in use. Chart with ID ... must be destroyed").
    function draw(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        Chart.getChart(canvas)?.destroy();
        return new Chart(canvas, config);
    }

    const base = { responsive: true, maintainAspectRatio: false };

    async function load() {
        const res = await fetch('<?= site_url('statistik/data') ?>', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        });

        // Sesi tamat → Shield redirect ke /login (HTML) → res.json() akan gagal. Semak dahulu.
        const type = res.headers.get('Content-Type') || '';
        if (!res.ok || !type.includes('application/json')) {
            throw new Error('Gagal memuatkan data statistik (HTTP ' + res.status + '). Sila log masuk semula.');
        }

        const { charts, generated_at: generatedAt } = await res.json();
        document.getElementById('generated-at').textContent = generatedAt;
        document.getElementById('year-label').textContent = charts.bookings_by_month.year;

        // 1) BAR — tempahan ikut bulan
        draw('chartBookingsByMonth', {
            type: 'bar',
            data: {
                labels: charts.bookings_by_month.labels,
                datasets: [{ label: 'Bil. tempahan', data: charts.bookings_by_month.data, backgroundColor: '#0d6efd' }],
            },
            options: { ...base, plugins: { legend: { display: false } },
                       scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
        });

        // 2) DOUGHNUT — status pas (bahagian daripada keseluruhan)
        draw('chartPassStatus', {
            type: 'doughnut',
            data: {
                labels: charts.pass_status.labels,
                datasets: [{
                    data: charts.pass_status.data,
                    backgroundColor: charts.pass_status.keys.map(k => PASS_COLORS[k] ?? '#adb5bd'),
                }],
            },
            options: { ...base, plugins: { legend: { position: 'right' } } },
        });

        // 3) BAR MENDATAR — indexAxis:'y' (label zon panjang lebih mudah dibaca)
        draw('chartUsageByZone', {
            type: 'bar',
            data: {
                labels: charts.usage_by_zone.labels,
                datasets: [{ label: 'Penggunaan (%)', data: charts.usage_by_zone.data, backgroundColor: '#198754' }],
            },
            options: { ...base, indexAxis: 'y', plugins: { legend: { display: false } },
                       scales: { x: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } } },
        });

        // 4) LINE — trend 12 bulan
        draw('chartPassTrend', {
            type: 'line',
            data: {
                labels: charts.pass_trend.labels,
                datasets: [{ label: 'Permohonan pas', data: charts.pass_trend.data,
                             borderColor: '#6f42c1', backgroundColor: 'rgba(111,66,193,.15)', fill: true, tension: 0.3 }],
            },
            options: { ...base, plugins: { legend: { display: false } },
                       scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
        });
    }

    load().catch(err => {
        const box = document.getElementById('chart-error');
        box.textContent = err.message;      // textContent — bukan innerHTML (elak XSS)
        box.classList.remove('d-none');
        console.error(err);
    });
})();
</script>
<?= $this->endSection() ?>
```

**8. Menu.** Dalam `app/Views/layouts/main.php`, tambah pautan hanya jika `auth()->user()->can('statistik.view')`. Letak dalam `<ul class="navbar-nav me-auto">`, terus selepas pautan Laporan (Lab 9.1):

`app/Views/layouts/main.php`

```php
<?php if (auth()->loggedIn() && auth()->user()->can('statistik.view')): ?>
    <li class="nav-item"><a class="nav-link" href="<?= url_to('statistik') ?>"><i class="bi bi-bar-chart-line"></i> Statistik</a></li>
<?php endif ?>
```

**9. Commit.** `git add -A && git commit -m "STAT: StatisticsService, dashboard KPI + 4 carta Chart.js"`; PowerShell: jalankan `git add` dan `git commit` satu demi satu

**10. Prompting (Claude Code, mod Plan).** Dalam `claude`, tekan `Shift+Tab` (atau `Alt+M`) hingga baris bawah menunjukkan **plan mode**, kemudian tampal (AI-04):

```text
Mod Plan. Jangan ubah sebarang fail.
Semak LOGIK 4 KPI dan 4 dataset carta dalam @app/Services/StatisticsService.php terhadap takrif ini:
[tampal jadual takrif KPI dari README §1.1]
Jadual | Kaedah | Takrif dipenuhi? | Kes sempadan tidak dikendalikan (input contoh) | fail:baris |, termasuk:
- bulan tanpa data (mesti 0, bukan hilang)
- status yang dikira dan tidak dikira
- julat tarikh (hari pertama/terakhir bulan, tempahan yang meliputi hari ini)
Kemudian semak @app/Views/statistik/dashboard.php: adakah data dimasukkan ke DOM dengan innerHTML?
JANGAN tulis semula kod.
```

Cari dalam jawapan: `status IN ('pending','approved')` untuk tempahan aktif, `TIMESTAMPDIFF(HOUR, …) / 24` untuk purata hari, 12 bulan diisi 0, dan `textContent` (bukan `innerHTML`) untuk mesej ralat.

Sahkan sendiri: untuk setiap isu, jalankan SQL sendiri dan bandingkan dengan kad KPI, cth `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');`. Isu sahih → kitaran AI-10 (ujian gagal dahulu). Rekod dalam `docs/nota-claude.md` (cipta fail jika belum ada).

### ✅ Checkpoint 10.1
- [ ] `pelulus@latihan.test` dan `admin@latihan.test` → `/statistik` memaparkan 4 kad + 4 carta.
- [ ] `penyemak@latihan.test` dan `pemohon1@latihan.test` → `/statistik` **dan** `/statistik/data` disekat.
- [ ] KPI "Tempahan aktif" = hasil SQL: `SELECT COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved');`
- [ ] Carta bar menunjukkan 12 bulan (bulan tanpa data = bar kosong, bukan hilang).
- [ ] Carta zon ialah bar **mendatar**; peratus zon = RPT-03 bulan semasa (`/laporan/penggunaan`).
- [ ] Konsol pelayar (F12) tiada ralat.
- [ ] Prompting: semakan KPI AI-04 direkod dalam `docs/nota-claude.md`; setiap isu disahkan atau ditolak dengan SQL yang anda jalankan sendiri.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Uncaught ReferenceError: Chart is not defined` | Skrip CDN tidak dimuat (tiada internet/proksi) atau skrip carta sebelum CDN | Susunan: CDN dahulu. Tiada internet: muat turun `chart.umd.min.js` (4.4.7) ke `public/assets/vendor/chartjs/` dan guna `base_url('assets/vendor/chartjs/chart.umd.min.js')` |
| `Canvas is already in use. Chart with ID '0' must be destroyed before the canvas with ID 'chartX' can be reused.` | `new Chart()` dipanggil dua kali pada kanvas sama (cth butang "Muat semula") | `Chart.getChart(canvas)?.destroy()` sebelum mencipta |
| `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` | Sesi tamat/tiada kebenaran → Shield pulang HTML log masuk | Semak `res.ok` & `Content-Type` sebelum `res.json()`; log masuk semula |
| Carta setinggi 0 px atau membesar tanpa henti | Tiada bekas berketinggian tetap | `<div style="position:relative;height:280px">` + `maintainAspectRatio: false` |
| Bar Jun muncul di kedudukan Mac | Bulan kosong tidak diisi sifar | `array_column(..., 'total', 'm')` + gelung 1..12 |
| `Error 1055 ... only_full_group_by` pada `DATE_FORMAT` | GROUP BY ungkapan berbeza daripada SELECT | `groupBy('ym')` (alias) — MySQL membenarkan GROUP BY alias |
| Purata hari = `null` → kad kosong/ralat `number_format()` | Belum ada pas diluluskan | View papar `—` apabila `null` |

### ⭐ Cabaran tambahan
- Tambah butang **Muat semula** yang memanggil `load()` semula (uji bahawa `destroy()` berfungsi).
- Klik bar zon → buka `/laporan/penggunaan?year=…&month=…` (Chart.js `options.onClick`).

---

## Lab 10.2 — Cache `remember()` & invalidasi selepas perubahan status (S2)

### 🎯 Objektif
- Membalut `dashboard()` dengan `cache()->remember('stat_dashboard', 600, fn)`.
- **Menambah** `cache()->delete(StatisticsService::CACHE_KEY)` selepas setiap perubahan status dalam `BookingService` dan `PassWorkflowService`.
- Membuktikan invalidasi dengan ujian automatik yang **gagal** tanpa kod invalidasi.

### Prasyarat
- Lab 10.1 siap.
- `app/Config/Cache.php` → `$handler = 'file'` (lalai); `writable/cache/` boleh ditulis.

### Langkah

**1. Ukur SEBELUM cache.** Buka `/statistik`, Debug Toolbar (ikon api CI bawah kanan) → tab **Database**. Catat bilangan query & masa. Muat semula 3 kali — nombor tetap sama.

**2. Balut dengan `remember()`:**

```php
public function dashboard(): array
{
    return cache()->remember(self::CACHE_KEY, self::CACHE_TTL, fn (): array => $this->build());
}
```

**3. Ukur SELEPAS.** Muat semula `/statistik` 2 kali. Permintaan kedua: tab Database **tiada** query aggregate; "Data dijana" tidak berubah.

```bash
ls -la writable/cache/          # fail stat_dashboard wujud
php spark cache:info            # handler & fail cache
```

**4. Tunjukkan masalah basi.** Sebagai `pelulus`, lulus satu permohonan pas di `/pas/semakan`. Kembali ke `/statistik` → KPI "Pas menunggu" **tidak berubah**. Catat masa. (Inilah pepijat yang akan kita baiki.)

**5. Tulis ujian yang GAGAL dahulu.** Cipta `tests/Services/StatisticsCacheTest.php`:

```php
<?php

declare(strict_types=1);

namespace Tests\Services;

use App\Services\BookingService;
use App\Services\StatisticsService;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;

final class StatisticsCacheTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate   = true;
    protected $refresh   = true;
    protected $namespace = null;

    protected function setUp(): void
    {
        parent::setUp();
        cache()->delete(StatisticsService::CACHE_KEY);   // mula bersih — cache fail kekal antara ujian!
    }

    public function testDashboardDisimpanDalamCache(): void
    {
        $this->assertNull(cache()->get(StatisticsService::CACHE_KEY));

        (new StatisticsService())->dashboard();

        $this->assertIsArray(cache()->get(StatisticsService::CACHE_KEY));
    }

    public function testKelulusanTempahanMengosongkanCache(): void
    {
        $bookingId = $this->createPendingBooking();
        (new StatisticsService())->dashboard();                          // isi cache
        $this->assertNotNull(cache()->get(StatisticsService::CACHE_KEY));

        (new BookingService())->approve($bookingId, actorId: 1);

        $this->assertNull(
            cache()->get(StatisticsService::CACHE_KEY),
            'Cache mesti dikosongkan selepas status berubah',
        );
    }

    private function createPendingBooking(): int
    {
        $db = $this->db;
        $db->table('users')->insert(['username' => 'pelulus-ujian', 'active' => 1, 'full_name' => 'Pelulus Ujian']);
        $db->table('parking_zones')->insert(['code' => 'ZT', 'name' => 'Zon Ujian', 'location' => 'Blok T']);
        $db->table('parking_slots')->insert(['zone_id' => $db->insertID(), 'slot_no' => 'T01', 'category' => 'oku', 'is_active' => 1]);
        $slotId = (int) $db->insertID();
        $db->table('vehicles')->insert(['user_id' => 1, 'plate_no' => 'WXX 7001', 'model' => 'Myvi', 'color' => 'Putih']);
        $db->table('slot_bookings')->insert([
            'ref_no'     => 'TLK-2026-7001', 'user_id' => 1, 'vehicle_id' => (int) $db->insertID(), 'slot_id' => $slotId,
            'start_date' => date('Y-m-d', strtotime('+1 day')), 'end_date' => date('Y-m-d', strtotime('+5 days')),
            'reason'     => 'Data ujian sintetik', 'status' => 'pending',
        ]);

        return (int) $db->insertID();
    }
}
```

```bash
composer test -- tests/Services/StatisticsCacheTest.php
```

Jangkaan: `testKelulusanTempahanMengosongkanCache` **GAGAL** — *"Cache mesti dikosongkan selepas status berubah"*. Bagus: ujian mengesan pepijat langkah 4.

**6. Tambah invalidasi dalam `BookingService`.** Buka `app/Services/BookingService.php`. Tambah `use` jika perlu (kelas dalam namespace sama — tidak perlu) dan letak **satu baris** selepas **setiap** `$this->db->transCommit();`:

```php
            $this->db->transCommit();
            cache()->delete(StatisticsService::CACHE_KEY);   // Hari 10: invalidasi SELEPAS commit
```

Tempat yang mesti ada (dalam template rujukan Hari 5–6):

| Kaedah | Peralihan | Kenapa |
|--------|-----------|--------|
| `create()` | `null → pending` | "Tempahan aktif" bertambah |
| `transition()` (dipanggil oleh `approve()`, `reject()`, `cancel()`) | `pending → approved/rejected`, `approved → cancelled` | KPI & carta berubah |

**7. Tambah invalidasi dalam `PassWorkflowService`.** Sama — selepas `$this->db->transCommit();` dalam:

| Kaedah | Peralihan |
|--------|-----------|
| `submit()` | `null → submitted` ("Pas menunggu" +1) |
| `transition()` (dipanggil oleh `startReview()`, `approve()`, `reject()`, `expire()`) | semua peralihan lain, termasuk `pas:expire` |

**Berhenti & fikir (2 min):** kenapa bukan di dalam blok `try` **sebelum** `transCommit()`, dan kenapa bukan dalam controller? Tulis jawapan anda dalam mesej commit.

**8. Jalankan semula.**

```bash
composer test -- tests/Services/StatisticsCacheTest.php     # hijau
composer test                                                # SEMUA hijau — tiada regresi
```

**9. Ulang langkah 4 secara manual.** Lulus satu lagi permohonan pas → `/statistik` → "Pas menunggu" turun **serta-merta**; "Data dijana" = masa sekarang.

**10. Commit & merge.** `git add app/ tests/ && git commit -m "STAT: cache dashboard 10 minit + invalidasi selepas commit status (TLK & PAS)"`; PowerShell: jalankan `git add` dan `git commit` satu demi satu, kemudian `git push -u origin feat/statistik` → buka MR ke `main` → merge (Lab 10.3 bermula dari `main`).

**11. Prompting (Claude Code, mod Plan).** Dalam `claude`, tekan `Shift+Tab` (atau `Alt+M`) hingga baris bawah menunjukkan **plan mode**, kemudian tampal (liputan invalidasi + AI-09):

```text
Mod Plan. Jangan ubah sebarang fail.
1. Senaraikan setiap transCommit() dalam app/Services/. Untuk setiap satu: kaedah, peralihan status,
   dan sama ada cache()->delete(StatisticsService::CACHE_KEY) berlaku SELEPAS commit, SEBELUM commit, atau tiada.
2. Baca @tests/Services/StatisticsCacheTest.php: peralihan mana yang tidak diuji?
   Cadangkan 2 kes ujian (Given / When / Then), termasuk pas:expire. JANGAN tulis kod.
```

Cari dalam jawapan: setiap `transCommit()` dalam `BookingService` dan `PassWorkflowService` diikuti `cache()->delete(...)`; tiada `delete` sebelum commit atau dalam controller.

Sahkan sendiri:

```bash
grep -n -e "transCommit" -e "CACHE_KEY" app/Services/*.php
```

🪟 PowerShell: `Select-String -Path app\Services\*.php -Pattern "transCommit|CACHE_KEY"`

Senarai Claude mesti sama dengan output ini. Tulis satu kes yang dicadangkan sendiri, kemudian `!composer test -- tests/Services/StatisticsCacheTest.php` dalam Claude Code: hijau. Commit `STAT: ujian cache tambahan` pada `main` sebelum Lab 10.3.

### ✅ Checkpoint 10.2
- [ ] Muat semula kedua `/statistik` → 0 query aggregate dalam Debug Toolbar.
- [ ] `StatisticsCacheTest` **pernah merah** (langkah 5) dan kini **hijau** (langkah 8) — tunjuk kepada jurulatih dalam sejarah terminal.
- [ ] `grep -n "CACHE_KEY" app/Services/*.php` → sekurang-kurangnya 4 hit di `BookingService`/`PassWorkflowService` (2 setiap satu) dan **tiada** string `'stat_dashboard'` bertaip di luar `StatisticsService`.
- [ ] Setiap `cache()->delete(...)` berada **selepas** `transCommit()`.
- [ ] Anda boleh menerangkan 1 kelebihan & 1 kelemahan "TTL + delete" berbanding "TTL sahaja".
- [ ] Prompting: senarai `transCommit()` Claude sama dengan `grep` anda sendiri, dan satu kes ujian cache tambahan ditulis sendiri dan hijau.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Cache unable to write to "…/writable/cache/"` | Kebenaran folder | `chmod -R 775 writable/cache` (Linux/macOS); Windows: pastikan folder tidak baca-sahaja |
| Ujian lulus walaupun tanpa invalidasi | Cache kosong dari awal → `assertNotNull` tidak disemak, atau ujian tidak mengisi cache | Pastikan `dashboard()` dipanggil & `assertNotNull` sebelum `approve()` |
| Ujian lain tiba-tiba gagal dengan angka lama | Fail cache dari ujian sebelumnya kekal (handler `file` dikongsi) | `cache()->delete(...)` dalam `setUp()`; atau `php spark cache:clear` |
| Dashboard masih basi selepas lulus | `delete()` diletak dalam controller lain / terlepas satu path / tersalah eja kunci | Guna `StatisticsService::CACHE_KEY`; letak dalam `transition()` service |
| `Class "App\Services\StatisticsService" not found` dalam BookingService | Salah namespace | Kedua-dua dalam `App\Services` — tiada `use` diperlukan; semak ejaan |
| `Serialization of 'Closure' is not allowed` | Menyimpan objek/closure dalam data cache | `build()` mesti pulang **array skalar** sahaja |

### ⭐ Cabaran tambahan
- Gantikan panggilan terus dengan **Events**: dalam service `Events::trigger('status_changed', 'TLK', $id)`; dalam `app/Config/Events.php` → `Events::on('status_changed', static fn () => cache()->delete(StatisticsService::CACHE_KEY));`. Bincang: kelebihan (service tidak tahu tentang statistik) vs kelemahan (aliran lebih sukar dijejak).
- Tambah ujian untuk `PassWorkflowService::approve()` (perlukan `User` Shield dengan kebenaran `pas.approve` — rujuk `PassAccessTest` Hari 8).

---

## Lab 10.3 — Ujian akhir sistem (UAT), pembetulan pepijat & keselamatan (S3)

### 🎯 Objektif
- Melaksanakan skrip UAT 15 langkah (meliputi senario UAT-01..UAT-10) merentas 4 modul dan 5 akaun.
- Membaiki sekurang-kurangnya satu pepijat melalui kitaran *reproduce → ujian gagal → baiki → lulus*.
- Melengkapkan senarai semak keselamatan K1–K10.

### Prasyarat
- Lab 10.1 & 10.2 siap dan di-merge ke `main`.
- Cipta fail `docs/UAT-signoff.md` dan salin kandungan templat `templates/dokumen/uat-signoff-templat.md` (modul **Templat & Rujukan**).
- Cipta fail `docs/kes-ujian-akhir.md` dan salin kandungan templat `templates/dokumen/kes-ujian-templat.md` (modul **Templat & Rujukan**).
- Database bersih: `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder`; PowerShell: jalankan `php spark migrate:refresh` dan `php spark db:seed` satu demi satu.

### Langkah

**1. Sediakan 5 tetingkap** (incognito/profil berasingan): `pemohon1`, `pemohon2`, `penyemak`, `pelulus`, `admin` (kata laluan `Latihan@2026`).

**2. Jalankan skrip UAT** dalam README §3.2 (15 langkah) **mengikut tertib**. Klik setiap langkah sendiri, dan isi lajur *Keputusan* & *Catatan* sebelum langkah seterusnya dalam `docs/UAT-signoff.md` §4 (UAT-01..UAT-10). Lajur terakhir jadual README §3.2 memetakan setiap langkah kepada ID UAT (cth langkah 1 & 5 → UAT-01; langkah 4, 6, 11 & 15 → UAT-10). Tanda satu ID UAT ✅ hanya jika **semua** langkah yang dipetakan kepadanya lulus. Masa sasaran: 35 minit.

**3. Rekod setiap kegagalan** dalam *Log pepijat* (`docs/kes-ujian-akhir.md`) — `BUG-001`, `BUG-002`, … dengan keterukan Tinggi/Sederhana/Rendah. **Jangan baiki lagi.**

**4. Pilih pepijat keterukan tertinggi** dan jalankan kitaran:

```bash
git switch -c fix/bug-001-<ringkas>
```

| Langkah | Tindakan | Bukti |
|---------|----------|-------|
| a. Reproduce | Tulis langkah tepat + data dalam log pepijat | Jurulatih/rakan sebelah boleh ulang dalam < 2 min |
| b. Ujian gagal | Tulis ujian PHPUnit (unit/service atau `FeatureTestTrait`) | `composer test -- --filter <namaUjian>` **merah** — simpan tangkapan terminal |
| c. Baiki | Perubahan **minimum** | `git diff` kecil & fokus |
| d. Lulus | Ujian tadi hijau **+** `composer test` semua hijau | Tangkapan terminal |
| e. Commit | `git add app/ tests/ docs/ && git commit -m "FIX: <ringkasan> (BUG-001)"`; PowerShell: jalankan `git add` dan `git commit` satu demi satu → merge | Log pepijat: *Ditutup* |

Tiada pepijat ditemui? Jurulatih akan memberi satu "pepijat tanaman" (contoh BUG-007 dalam README §3.3); latih kitaran penuh padanya.

**5. Senarai semak keselamatan K1–K10** (README §3.4), ~10 minit. Tanda K1–K10 sendiri: jalankan arahan bukti di bawah (K2, K3, K4, K5, K7) dan semak baki K secara visual. Selepas itu jurulatih **semak rawak 3 K** pada mesin anda — K3 sentiasa, ditambah 2 pilihan jurulatih — jadi setiap tanda mesti boleh dibuktikan serta-merta.

```bash tab="Git Bash / macOS / Linux"
# K2 — output tanpa esc() (setiap baris baki mesti dijustifikasi; abaikan app/Views/errors/)
grep -rnF '<?= $' app/Views | grep -vF 'esc(' | grep -vF '$this->'

# K3 — .env tidak pernah masuk Git
git ls-files | grep -E "(^|/)\.env$"
git log --all --oneline -- .env

# K4 — tiada fail muat naik dalam public/
find public -type f \( -name "*.pdf" -o -name "*.jpg" -o -name "*.png" \) | grep -v assets

# K5 — filter pada setiap laluan dilindungi
php spark routes
MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik
MSYS_NO_PATHCONV=1 php spark filter:check GET /laporan/tempahan

# K7 — query mentah (setiap hit mesti guna binding ?; pengecualian sah: EXPLAIN dalam
#      app/Commands/ReportExplain.php — SQL dikompil Query Builder, tiada input pengguna web)
grep -rn -e '->query(' app/
```

```powershell tab="PowerShell"
# K2 — output tanpa esc() (setiap baris baki mesti dijustifikasi; abaikan app/Views/errors/)
Get-ChildItem app/Views -Recurse -File | Select-String -SimpleMatch '<?= $' | Where-Object { $_.Line -notlike '*esc(*' -and $_.Line -notlike '*$this->*' }

# K3 — .env tidak pernah masuk Git
git ls-files | Select-String "(^|/)\.env$"
git log --all --oneline -- .env

# K4 — tiada fail muat naik dalam public/
Get-ChildItem public -Recurse -File -Include *.pdf, *.jpg, *.png | Where-Object { $_.FullName -notmatch 'assets' } | ForEach-Object FullName

# K5 — filter pada setiap laluan dilindungi
php spark routes
php spark filter:check GET /statistik
php spark filter:check GET /laporan/tempahan

# K7 — query mentah (setiap hit mesti guna binding ?; pengecualian sah: EXPLAIN dalam
#      app/Commands/ReportExplain.php — SQL dikompil Query Builder, tiada input pengguna web)
Get-ChildItem app -Recurse -File | Select-String -SimpleMatch '->query('
```

Tanda setiap K dalam `docs/UAT-signoff.md` §5/§6 (atau lampiran).

**6. Sediakan untuk demo.**

```bash tab="Git Bash / macOS / Linux"
git switch main && git pull
composer test                              # hijau — uji `main` yang akan ditag
git add docs/ && git commit -m "SETUP: UAT-signoff, log pepijat & senarai semak K1–K10"
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

```powershell tab="PowerShell"
git switch main
git pull
composer test                              # hijau — uji `main` yang akan ditag
git add docs/
git commit -m "SETUP: UAT-signoff, log pepijat & senarai semak K1–K10"
git tag -a v1.0-capstone -m "Capstone CI-KKM-10"
git push origin main --tags
```

Tulis **skrip demo 1 halaman** (ikut format README §4.1) dan pastikan anda boleh menerangkan mana-mana fail.

**7. Prompting (Claude Code, mod Plan).** Dalam `claude`, tekan `Shift+Tab` (atau `Alt+M`) hingga baris bawah menunjukkan **plan mode**, kemudian tampal (subagent `semak-ci4` + AI-08):

```text
Guna subagent semak-ci4 untuk menyemak semula K2, K5 dan K7 (README §3.4) pada seluruh app/:
- K2: setiap <?= $ dalam app/Views tanpa esc()
- K5: route dalam app/Config/Routes.php tanpa filter session, group atau permission
- K7: setiap ->query( dan sama ada ia guna binding ?
Beri jadual | K | Fail:baris | Lulus/Gagal | Sebab |. Jangan ubah fail.
```

Cari: baris `semak-ci4` muncul, kemudian jadual dengan fail:baris.

Sahkan sendiri: bandingkan dengan tanda K2/K5/K7 dalam `docs/UAT-signoff.md` dari arahan anda di langkah 5. Setiap "Gagal" yang arahan anda terlepas: buka fail:baris. Jika sahih, rekod sebagai `BUG-00N` dalam `docs/kes-ujian-akhir.md`; jangan alih tag `v1.0-capstone`. Baiki selepas demo dengan kitaran AI-10, dan sebelum setiap commit `FIX:`, jalankan AI-08 ke atas `!git diff --staged` dalam Claude Code.

### ✅ Checkpoint 10.3
- [ ] `docs/UAT-signoff.md` §4: UAT-01..UAT-10 semuanya bertanda (✅/❌/⚠️) — tiada ⬜.
- [ ] Semua senario **Kritikal** ✅, atau setiap ❌ ada Bug-ID dan pelan tindakan.
- [ ] ≥ 1 pepijat ditutup dengan bukti ujian **merah → hijau**.
- [ ] K1–K10 ditanda dengan bukti arahan.
- [ ] Tag `v1.0-capstone` wujud: `git tag -l`.
- [ ] Prompting: dapatan `semak-ci4` untuk K2/K5/K7 dibandingkan dengan tanda anda; setiap perbezaan ditolak dengan bukti atau direkod sebagai `BUG-00N`.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Log masuk peranan kedua menukar sesi peranan pertama | Tab biasa berkongsi kuki sesi | Guna tetingkap incognito / profil pelayar berasingan |
| UAT gagal kerana data semalam (cth slot sudah ditempah) | DB tidak bersih | `php spark migrate:refresh --all && php spark db:seed DatabaseSeeder`; PowerShell: jalankan `php spark migrate:refresh` dan `php spark db:seed` satu demi satu |
| `The action you requested is not allowed.` semasa UAT | Borang dibuka lama → token CSRF tamat, atau `csrf_field()` tertinggal | Muat semula borang; jika berulang, semak borang tersebut ada `csrf_field()` |
| Ujian feature gagal `Config\Security::$csrfProtection is set to 'cookie'` | Konfigurasi Shield | `app/Config/Security.php` → `$csrfProtection = 'session'` (Hari 4) |
| Ujian lulus di mesin sendiri, gagal pada rakan | Bergantung pada data seed/tarikh hari ini | Fixture sendiri dalam ujian; tarikh relatif (`+1 day`) atau tetap |
| `git tag` ditolak: *already exists* | Tag dicipta sebelum pembetulan | `git tag -d v1.0-capstone && git tag -a v1.0-capstone -m "…"`; PowerShell: jalankan `git tag -d` dan `git tag -a` satu demi satu (sebelum push) |

### ⭐ Cabaran tambahan
- Tulis ujian `FeatureTestTrait` untuk UAT-08: `applicant` → `GET /statistik` dan `/laporan/tempahan` → bukan 200.
- Jalankan `composer audit` dan bincang hasilnya.

---

## Lab 10.4 — Demo capstone & retrospektif (S4)

### 🎯 Objektif
- Mendemokan sistem hujung-ke-hujung dalam 8 minit mengikut format.
- Menerangkan satu baris kod yang dipilih panel.
- Menyumbang ≥ 3 kad retrospektif (Start/Stop/Continue).

### Prasyarat
- Checkpoint 10.3 lulus; tag `v1.0-capstone`.
- DB demo bersih + seed; 5 tetingkap log masuk sedia; skrip demo 1 halaman.
- Baca [`docs/rubrik-capstone.md`](../docs/rubrik-capstone.md).

### Langkah

**1. 10 minit sebelum giliran:** `php spark serve` berjalan; zum pelayar 125 %; tutup notifikasi; buka `docs/UAT-signoff.md`.

**2. Demo 8 minit** — ikut jadual segmen README §4.1. Penjaga masa panel akan memberi isyarat pada minit 1, 3, 5, 6 dan 7.

**3. Segmen "Terangkan kod" (minit 7–8).** Panel memilih satu fail dan satu baris (cth `ReportService::applySort()`, `BookingService::transition()`, `dashboard.php` `draw()`). **Anda sendiri** menjawab: *apa baris ini buat, kenapa ia di sini, apa jadi jika dibuang?*

**4. Soal jawab (jika panel bertanya semasa demo).** Jawab dengan jujur — "saya belum sempat, pelan saya ialah …" lebih bernilai daripada meneka.

**5. Retrospektif.** Tulis ≥ 1 kad bagi setiap lajur **Start / Stop / Continue** (kad kuning = diri sendiri, kad biru = kursus). Tampal pada papan. Undi 3 titik pada kad yang paling penting.

**6. Serah repo.** Hantar pautan repo / arkib zip (tanpa `vendor/`, tanpa `.env`, tanpa `writable/uploads/`) kepada jurulatih.

**7. Prompting (Claude Code, mod Plan).** Dalam `claude`, tekan `Shift+Tab` (atau `Alt+M`) hingga baris bawah menunjukkan **plan mode**, kemudian tampal (serahan, berdasarkan AI-18):

```text
Mod Plan. Jangan ubah sebarang fail.
Semak @README.md dan @CLAUDE.md projek ini secara kritis sebagai pembangun baharu yang mewarisi repo esok.
1. README: bolehkah saya clone, composer install, migrate, seed, menjalankan composer test dan log masuk
   dengan akaun sintetik hanya dengan membacanya? Langkah apa yang tiada?
2. CLAUDE.md: arahan, konvensyen atau peraturan apa yang lapuk berbanding kod sekarang
   (Pas, Laporan, Statistik, cache)?
Maksimum 8 isu dalam jadual | Fail · bahagian | Isu | Kenapa penting | Cadangan |, paling penting dahulu.
```

Cari dalam jawapan: arahan yang tiada (cth `php spark db:seed`, akaun `@latihan.test`), dan bahagian `CLAUDE.md` yang belum menyebut modul Laporan/Statistik.

Sahkan sendiri: pilih sekurang-kurangnya 2 isu, sahkan setiap satu dengan membuka fail, kemudian betulkan **sendiri** dalam `README.md`/`CLAUDE.md`. Commit `CHORE: kemas kini README & CLAUDE.md selepas capstone`, push, dan maklumkan jurulatih. Untuk projek seterusnya, mula dengan AI-15 (projek sedia ada) atau AI-16 → AI-18 → AI-17 (projek baharu).

### ✅ Checkpoint 10.4
- [ ] Demo selesai dalam ≤ 8 minit; keempat-empat modul ditunjukkan.
- [ ] Panel menandatangani helaian markah anda.
- [ ] ≥ 3 kad retrospektif ditampal.
- [ ] Repo diserahkan.
- [ ] Prompting: sekurang-kurangnya 2 isu AI-18 pada `README.md`/`CLAUDE.md` dibetulkan sendiri dan di-commit.

### 🧯 Masalah lazim
| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `php spark serve` gagal: *Address already in use* | Server lain di port 8080 | `php spark serve --port 8081` dan `app.baseURL = 'http://localhost:8081/'` dalam `.env` |
| Carta kosong semasa demo | Tiada internet untuk CDN | Salinan tempatan `chart.umd.min.js` (Lab 10.1 🧯) — sediakan sebelum demo |
| Terlupa kata laluan akaun sintetik | — | `Latihan@2026` (SPEC §4) |
| Masa tamat sebelum M4 | Terlalu lama pada M1 | Ikut skrip; jika lewat pada minit 7, lompat terus ke Laporan |

### ⭐ Cabaran tambahan
- Rakam demo 3 minit (tangkapan skrin + suara) sebagai bahan serahan kepada penyelia anda.

---
