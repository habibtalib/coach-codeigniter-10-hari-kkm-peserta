# Trek Jira — Backlog & Sprint Pasangan (Pilihan)

> **Trek sampingan pilihan.** Halaman ini menunjukkan cara pasangan menguruskan kerja 10 hari dalam **Jira Cloud** (pelan Free): backlog daripada keperluan Hari 1–2, sprint yang dipadankan dengan modul M1–M4, dan pautan antara kad Jira dengan branch dan commit Git. Ia **tidak menggantikan** mana-mana deliverable kursus: `docs/keperluan-awal.md`, `docs/acceptance-criteria.md` dan `docs/pelan-kerja.md` kekal sebagai sumber kebenaran. Jira ialah paparan penjejakan di atasnya.
> Kanun: [`SPEC-KURSUS.md`](../SPEC-KURSUS.md) · Jadual: [`JADUAL.md`](../JADUAL.md) · Kontrak kerja: [`KOLABORASI.md`](../KOLABORASI.md) · Trek berkaitan: [`trek-gitlab.md`](./trek-gitlab.md) · [`trek-design-thinking.md`](./trek-design-thinking.md)

> ⚠️ **Siap sebelum Hari 4.** Kod bermula Hari 4. Persediaan dan backlog dibuat Hari 1–2, story dengan acceptance criteria Hari 2, dan sprint planning Hari 4 S4 sebelum baris kod pertama modul.

> 🔒 **Data sintetik sahaja.** Jira Cloud ialah perkhidmatan luar. Jangan masukkan data KKM sebenar (nama pesakit/kakitangan, plat sebenar), tangkapan skrin sistem dalaman, kata laluan atau kandungan `.env` ke dalam kad. Guna nilai rekaan seperti dalam SPEC §10 (`pemohon1@latihan.test`, `WXX 1234`).

## 1. Tujuan

Di pejabat, kebanyakan pasukan IT menjejak kerja dalam alat seperti Jira. Trek ini melatih tabiat yang sama pada projek kursus:

| Konsep | Maksud dalam kursus ini |
|--------|-------------------------|
| **Backlog** | Senarai kerja belum siap, disusun ikut keutamaan — datang terus daripada FR dalam `docs/keperluan-awal.md` |
| **Epic** | Satu modul (M1 TLK, M2 Pas, M3 Laporan, M4 Statistik) |
| **Story** | Satu FR yang disahkan, ditulis dari sudut pengguna, dengan acceptance criteria Hari 2 |
| **Sprint** | Satu blok kerja bermatlamat: Sprint 1 = M1, Sprint 2 = M2–M4 |
| **Stand-up** | Recap 08:30 setiap pagi — tiga soalan |
| **Board** | To Do → In Progress → In Review → Done; "Done" bermaksud lulus DoD ([`KOLABORASI.md`](../KOLABORASI.md) §2) |

**Peraturan teras:** setiap kerja ada kad. Jika anda sedang mengerjakan sesuatu yang tiada pada board, berhenti dan cipta kadnya dahulu.

> 💡 **Istilah Jira terkini.** Antara muka Jira Cloud kini memanggil *project* sebagai **space**, *issue* sebagai **work item** dan *issue type* sebagai **work type**. Halaman ini guna label menu semasa (space, work item) tetapi konsepnya sama dengan bahan Jira yang lebih lama.

## 2. Bila

| Hari / sesi | Langkah | Minit |
|-------------|---------|-------|
| Hari 1 S4 (selepas Lab 1.4) | Cipta site Jira Free, space Scrum `TLKPAS`, jemput pasangan (§4) | 20 |
| Recap Hari 2 (08:30) | Cipta 4 Epic M1–M4 (§5.1) | 10 |
| Hari 2 S1 (selepas pengesahan FR) | Cipta Story daripada FR yang **disahkan** sahaja (§5.2); FR ditolak tidak masuk | 20 |
| Hari 2 S3 (selepas Lab 2.3) | Tampal AC Given/When/Then ke Description setiap Story (§5.4) | 20 |
| Hari 2 S4 | Priority ikut MoSCoW, label, story point melalui planning poker (§5.3–5.6) | 25 |
| Hari 3 S4 (pilihan) | Tambah Task persediaan Hari 4 (projek CI4, migration, seeder) | 10 |
| Hari 4 S4 | Sprint planning bersama `docs/pelan-kerja.md`; mulakan Sprint 1 (§7.2) | 25 |
| Hari 5–10, 08:30 | Stand-up di depan board (§7.3) | 5 |
| Hari 6 S4 · Hari 8 S4 · Hari 9 S4 | Sprint review pada setiap milestone; tutup Sprint 1 pada Hari 6 (§7.4) | 10 |
| Hari 10 S4 | Sprint review = demo capstone; retrospektif Start/Stop/Continue; tutup Sprint 2 (§7.4) | 15 |

Jumlah ≈ 2.5 jam sepanjang 10 hari, kebanyakannya dalam masa wrap-up. Langkah Hari 1–4 ialah syarat; langkah Hari 5–10 mengekalkan board hidup.

## 3. Hasil akhir

Menjelang Hari 4 S4, pasangan mempunyai:

| Hasil | Bukti |
|-------|-------|
| Satu site Jira Cloud Free dengan kedua-dua ahli pasangan | Kedua-dua nama tersenarai dalam akses space |
| Space Scrum berkunci `TLKPAS` | Kunci work item berbentuk `TLKPAS-12` |
| 4 Epic (M1–M4) | Setiap Story ada Epic sebagai parent |
| Satu Story setiap FR disahkan | Bilangan Story = bilangan FR disahkan dalam `docs/log-keputusan.md` |
| AC dalam Description setiap Story Must | AC sama dengan `docs/acceptance-criteria.md` |
| Priority, label dan story point pada setiap Story | Tiada Story tanpa anggaran dalam backlog |
| Sprint 1 bermula dengan Story M1 sahaja | Board sprint menunjukkan Story TLK di To Do |

## 4. Sediakan Jira Cloud

### 4.1 Fakta pelan Free

Disemak pada 2026-10-15 daripada halaman rasmi Atlassian (lihat bahagian Sumber):

| Perkara | Pelan Free |
|---------|-----------|
| Pengguna | Sehingga **10 pengguna** — cukup untuk satu pasangan dan jurulatih |
| Storan | **2 GB** fail |
| Ciri agile | Board Scrum dan Kanban, backlog, laporan agile |
| Sokongan | Komuniti Atlassian sahaja |
| Had | Kebenaran, peranan dan keselamatan peringkat work item adalah terhad; konfigurasi dikongsi antara space tidak tersedia |

> Harga dan had pelan boleh berubah. Jika halaman Atlassian menunjukkan angka lain pada hari kursus, ikut halaman itu.

### 4.2 Cipta site & space

1. Seorang ahli pasangan (pemilik site) membuka <https://www.atlassian.com/software/jira/free> dan mendaftar dengan e-mel sendiri. Pemilik site menjadi pentadbir Jira — perlu untuk import CSV (§6).
2. Pilih nama site yang neutral, cth `latihan-tlkpas-pasangan3` (jadi `latihan-tlkpas-pasangan3.atlassian.net`). Jangan guna nama agensi.
3. Dalam navigasi sisi, halakan tetikus ke **Spaces** → **Create space**.
4. Pilih kategori **Software development** → template **Scrum** → **Use template**.
5. Pilih **Team-managed** (konfigurasi ringkas, sesuai pelan Free).
6. Namakan space `Sistem TLK & Pas`. Tukar kunci kepada **`TLKPAS`** (sekurang-kurangnya 2 aksara, bermula dengan huruf besar, huruf besar atau nombor sahaja).
7. Semak work type, status dan paparan lalai yang dicadangkan → **Create**.
8. Hidupkan anggaran: ••• di sebelah nama space → **Space settings** → **Features** → hidupkan **Estimation** → pilih **Story points**.

✅ Sebuah work item ujian mendapat kunci `TLKPAS-1`. Padam work item ujian itu selepas disemak.

### 4.3 Jenis isu

Guna empat work type ini sahaja:

| Work type | Bila guna | Contoh |
|-----------|-----------|--------|
| **Epic** | Satu modul — payung kepada banyak Story | `M1 — Tempat Letak Kenderaan Khas (TLK)` |
| **Story** | Satu FR disahkan; ada nilai kepada pengguna | `Sebagai pemohon, saya mahu …` |
| **Task** | Kerja teknikal tanpa muka pengguna | `Tulis migration slot_bookings` |
| **Bug** | Kelakuan salah yang dijumpai semasa ujian | `Tempahan 91 hari diterima (BR-TLK-03)` |

Subtask dibenarkan di bawah Story jika pasangan mahu memecah kerja, tetapi tidak wajib.

### 4.4 Jemput pasangan

1. Pemilik site menjemput ahli kedua ke site (ikon gear / tetapan pentadbiran → jemput pengguna dengan e-mel).
2. Selepas jemputan diterima: ••• di sebelah nama space → **Space settings** → **Access** → **Add people** → pilih ahli kedua → peranan **Administrator** (kedua-dua ahli boleh mengurus board dan sprint).
3. Jika jurulatih mahu menyemak, jemput jurulatih dengan peranan **Viewer**.

✅ Ahli kedua boleh mencipta work item dan menyeretnya di board.

## 5. Backlog daripada artefak kursus

### 5.1 Epic = modul

Cipta empat Epic, satu untuk setiap modul SPEC §2:

| Epic | Ringkasan | Label |
|------|-----------|-------|
| M1 | `M1 — Tempat Letak Kenderaan Khas (TLK)` | `tlk` |
| M2 | `M2 — Pas` | `pas` |
| M3 | `M3 — Laporan` | `laporan` |
| M4 | `M4 — Statistik` | `statistik` |

### 5.2 Story daripada FR

Satu FR disahkan = satu Story. Tulis **Summary** dalam format user story dan simpan ID FR dalam Description:

```text
Sebagai <peranan>, saya mahu <tindakan>, supaya <nilai>.
```

| FR | Story (Summary) |
|----|-----------------|
| `FR-TLK-03` | Sebagai pemohon, saya mahu sistem menolak tempahan yang bertindih, supaya slot yang diluluskan untuk saya tidak dituntut orang lain |
| `FR-PAS-02` | Sebagai pemohon, saya mahu memuat naik dokumen sokongan PDF/JPG/PNG, supaya penyemak boleh menilai permohonan tanpa kertas |
| `FR-RPT-01` | Sebagai pelulus, saya mahu senarai tempahan TLK bertapis yang boleh dieksport, supaya saya boleh melapor penggunaan slot |

Peraturan:
- Peranan dalam Story ialah peranan SPEC §4 (`applicant`/pemohon, `reviewer`/penyemak, `approver`/pelulus, `admin`/pentadbir).
- Story tidak menyebut nama kelas (`BookingService`) — itu reka bentuk. Kerja teknikal masuk sebagai **Task**.
- ID FR anda mungkin berbeza daripada contoh ini. Ikut `docs/keperluan-awal.md` anda sendiri.

### 5.3 MoSCoW → Priority

| MoSCoW (Lab 1.4) | Priority Jira | Peraturan sprint |
|------------------|---------------|------------------|
| **Must** | High | Masuk sprint modulnya |
| **Should** | Medium | Masuk sprint jika kapasiti ada |
| **Could** | Low | ⭐ cabaran tambahan; ambil selepas semua Must Done |
| **Won't** | Lowest + label `wont` | Kekal dalam backlog; tidak pernah masuk sprint |

`Highest` dikhaskan untuk **Bug** yang menyekat demo atau melanggar BR.

### 5.4 Acceptance criteria dalam Description

Salin AC daripada `docs/acceptance-criteria.md` ke Description, di bawah baris jejak:

```gherkin
# FR-TLK-03 · BR-TLK-01 · sumber: docs/acceptance-criteria.md
Senario: Tempahan bertindih ditolak
  Given slot A-01 ada tempahan approved 2026-10-01 hingga 2026-10-10
  When  pemohon2@latihan.test memohon slot A-01 dari 2026-10-05 hingga 2026-10-15
  Then  permohonan tidak disimpan
  And   mesej "Slot tidak tersedia bagi julat tarikh ini" dipaparkan
```

Fail Markdown kekal sebagai sumber. Jika AC berubah, kemas kini fail dahulu, kemudian kad.

### 5.5 Label

| Label | Maksud |
|-------|--------|
| `tlk` · `pas` · `laporan` · `statistik` | Modul (sama dengan Epic) |
| `br-tlk-01` … `br-pas-06` | Peraturan perniagaan yang dikuatkuasa (huruf kecil) |
| `keselamatan` | Akses, muat naik, CSRF |
| `wont` | Won't fasa ini |
| `retro` | Tindakan daripada retrospektif Hari 10 |

### 5.6 Story point & planning poker

Story point mengukur **saiz relatif** (kerumitan + ketidakpastian), bukan jam. Guna siri Fibonacci: `1 · 2 · 3 · 5 · 8 · 13`.

1. Pilih satu Story kecil yang kedua-dua ahli faham sebagai rujukan = **2 mata** (cth senarai tempahan sendiri dengan pagination).
2. Untuk setiap Story: baca Summary dan AC kuat-kuat.
3. Kedua-dua ahli memilih nombor secara senyap (jari, kad atau aplikasi), kemudian dedahkan serentak.
4. Jika sama → isi **Story point estimate**. Jika berbeza → nombor tertinggi menerangkan risikonya dahulu, kemudian undi semula sekali.
5. Story **> 13** terlalu besar — pecahkan kepada dua Story.

### 5.7 Tiga contoh story

Contoh ini selari dengan SPEC §2 dan contoh AC Hari 2.

**Contoh 1 — anti-pertindihan (Sprint 1)**

| Medan | Nilai |
|-------|-------|
| Summary | Sebagai pemohon, saya mahu sistem menolak tempahan yang bertindih, supaya slot yang diluluskan untuk saya tidak dituntut orang lain |
| Work type · Parent | Story · M1 — TLK |
| Priority | High (Must) |
| Label | `tlk`, `br-tlk-01`, `br-tlk-05` |
| Story point | 5 — transaksi dan `SELECT … FOR UPDATE` menambah ketidakpastian |
| AC | AC-TLK-03-01..04: tidak bertindih diterima; bertindih ditolak; hari sama dikira bertindih; `rejected`/`cancelled` tidak menyekat |

**Contoh 2 — had tarikh (Sprint 1)**

| Medan | Nilai |
|-------|-------|
| Summary | Sebagai pemohon, saya mahu sistem menolak tarikh tempahan yang tidak sah, supaya tempahan saya sentiasa dalam tempoh yang dibenarkan |
| Work type · Parent | Story · M1 — TLK |
| Priority | High (Must) |
| Label | `tlk`, `br-tlk-03` |
| Story point | 3 — validasi server dengan jadual sempadan yang jelas |
| AC | AC-TLK-05-01..05: mula di masa lalu ditolak; satu hari diterima; tamat sebelum mula ditolak; 2026-10-01 → 2026-12-30 (90 hari) diterima; → 2026-12-31 (91 hari) ditolak |

**Contoh 3 — muat naik dokumen (Sprint 2)**

| Medan | Nilai |
|-------|-------|
| Summary | Sebagai pemohon, saya mahu memuat naik dokumen sokongan PDF/JPG/PNG, supaya penyemak boleh menilai permohonan tanpa kertas |
| Work type · Parent | Story · M2 — Pas |
| Priority | High (Must) |
| Label | `pas`, `br-pas-02`, `keselamatan` |
| Story point | 5 — jenis, saiz, nama rawak dan simpanan luar `public/` |
| AC | AC-PAS-02-01..02: `.docx` ditolak; 2,048 KB diterima, 2,049 KB ditolak; maksimum 3 fail; fail disimpan di `writable/uploads/pas/` |

## 6. Import CSV (pilihan)

Jika backlog sudah lengkap dalam `docs/keperluan-awal.md`, import CSV lebih cepat daripada menaip satu demi satu. Hanya **pentadbir Jira** (pemilik site) boleh mengimport.

### 6.1 Contoh CSV

Simpan sebagai `docs/backlog-jira.csv` (UTF-8). Lajur `Work item ID` dan `Parent` memautkan Story kepada Epic; baris Epic mesti muncul **sebelum** anaknya. Ulang lajur `Labels` untuk setiap label.

```csv
Work item ID,Summary,Issue Type,Priority,Description,Labels,Labels,Story Points,Parent
1,M1 — Tempat Letak Kenderaan Khas (TLK),Epic,High,"Modul M1, Sprint 1 (Hari 4–6)",tlk,,,
2,M2 — Pas,Epic,High,"Modul M2, Sprint 2 (Hari 7–8)",pas,,,
3,M3 — Laporan,Epic,Medium,"Modul M3, Sprint 2 (Hari 9)",laporan,,,
4,M4 — Statistik,Epic,Medium,"Modul M4, Sprint 2 (Hari 10)",statistik,,,
10,"Sebagai pemohon, saya mahu sistem menolak tempahan yang bertindih, supaya slot yang diluluskan untuk saya tidak dituntut orang lain",Story,High,"FR-TLK-03 · BR-TLK-01. AC: lihat docs/acceptance-criteria.md AC-TLK-03-01..04",tlk,br-tlk-01,5,1
11,"Sebagai pemohon, saya mahu sistem menolak tarikh tempahan yang tidak sah, supaya tempahan saya sentiasa dalam tempoh yang dibenarkan",Story,High,"FR-TLK-05 · BR-TLK-03. AC: AC-TLK-05-01..05",tlk,br-tlk-03,3,1
20,"Sebagai pemohon, saya mahu memuat naik dokumen sokongan PDF/JPG/PNG, supaya penyemak boleh menilai permohonan tanpa kertas",Story,High,"FR-PAS-02 · BR-PAS-02. AC: AC-PAS-02-01..02",pas,br-pas-02,5,2
```

Peraturan format: kandungan yang ada koma dibalut `"…"`; jangan buang koma untuk lajur kosong di hujung; baris pengepala tanpa tanda baca selain koma.

### 6.2 Langkah importer

1. Log masuk sebagai pentadbir Jira → ikon tetapan → **System** → bahagian *Import and Export* → **External System Import** → **CSV**. Jika paparan import baharu muncul, pilih **switch to the old experience**.
2. Pilih fail CSV. Biarkan *Use an existing configuration file* tidak bertanda. Di **Advanced**, pastikan pengekodan **UTF-8** dan pemisah koma → **Next**.
3. Pilih space sedia ada `TLKPAS` → **Next**.
4. Padankan lajur: `Summary` → Summary (wajib), `Issue Type` → work type, `Priority`, `Description`, `Labels`, `Work item ID`, `Parent`. Untuk `Story Points`, pilih medan anggaran story point jika disenaraikan; jika tiada, nyahtanda lajur itu dan isi anggaran secara manual selepas import.
5. Padankan nilai: space team-managed hanya menerima work type yang **sudah wujud** (Epic, Story, Task, Bug) → **Begin Import**.
6. Buka backlog: semak setiap Story ada Epic sebagai parent dan bilangan Story sama dengan bilangan baris CSV Story.

> Menu importer Jira berubah dari semasa ke semasa. Jika label menu berbeza, rujuk halaman Atlassian *Import data from a CSV file* (bahagian Sumber).

## 7. Sprint sebelum kod

### 7.1 Peta sprint

| Sprint | Hari | Matlamat sprint | Epic | Review |
|--------|------|-----------------|------|--------|
| **Sprint 1** | 4–6 | M1 TLK siap dan lulus DoD | M1 | Hari 6 S4 (**M1 siap**) |
| **Sprint 2** | 7–10 | M2 Pas, M3 Laporan, M4 Statistik siap; demo capstone | M2 · M3 · M4 | Hari 8 S4 (M2) · Hari 9 S4 (M3) · Hari 10 S4 (demo) |

Task persediaan Hari 4 (projek CI4, Shield, migration, seeder) masuk Sprint 1 kerana sprint bermula pada Hari 4.

### 7.2 Sprint planning Hari 4 S4

Lakukan **bersama** Lab 4.4 ([`hari-4/lab.md`](../hari-4/lab.md)), selepas `docs/pelan-kerja.md` dicipta:

1. Backlog → **Create sprint** → namakan `Sprint 1 — M1 TLK`.
2. Seret Story Must M1 dan Task Hari 4 ke Sprint 1, ikut susunan keutamaan.
3. Semak kapasiti: jika jumlah mata jauh melebihi apa yang pasangan yakin boleh siap dalam Hari 5–6, alih Should ke backlog.
4. Padankan dengan `docs/pelan-kerja.md`: setiap baris dalam jadual **Cabang** mendapat kunci Story (cth `feat/TLKPAS-12-borang-tempahan`). Satu branch = satu Story.
5. **Start sprint** → tarikh mula Hari 4, tarikh tamat Hari 6 → tulis matlamat sprint: *"M1 TLK siap dan lulus DoD."*
6. Sprint 2 dicipta dan dimulakan pada recap Hari 7 dengan cara yang sama.

### 7.3 Stand-up harian

Pada recap 08:30 (Hari 5–10), pasangan berdiri di depan board selama 5 minit. Setiap ahli menjawab:

1. Apa yang saya siapkan semalam (kad mana bergerak)?
2. Apa yang saya akan kerjakan hari ini (kad mana)?
3. Apa yang menghalang saya?

Halangan direkod sebagai komen pada kad atau sebagai Bug baharu. Giliran driver hari itu ikut `docs/pelan-kerja.md`.

### 7.4 Sprint review & retrospektif

- **Sprint review** pada setiap milestone (Hari 6, 8, 9 S4): demo Story Done kepada jurulatih, ikut AC. Story yang tidak lulus kembali ke In Progress, bukan "hampir siap".
- **Tutup Sprint 1** pada Hari 6 S4: Story belum Done dipindah ke Sprint 2 (Jira menawarkannya semasa *Complete sprint*).
- **Demo capstone Hari 10 S4** = sprint review terakhir.
- **Retrospektif Hari 10 S4** ikut Lab 10.4 ([`hari-10/lab.md`](../hari-10/lab.md)): kad **Start / Stop / Continue** dan undi 3 titik. Selepas itu, rekod 3 kad teratas sebagai Task berlabel `retro`, kemudian **Complete sprint** untuk Sprint 2.

### 7.5 Lajur board ↔ DoD

Board Scrum team-managed bermula dengan To Do, In Progress dan Done. Tambah lajur **In Review** dalam tetapan board (menu ••• board → konfigurasi lajur; label menu mungkin berbeza).

| Lajur | Masuk apabila | Kaitan DoD ([`KOLABORASI.md`](../KOLABORASI.md) §2) |
|-------|---------------|------------------------------------------------------|
| **To Do** | Story ada dalam sprint, AC jelas | AC wujud — syarat DoD baris 1 boleh diuji |
| **In Progress** | Branch `feat/TLKPAS-nn-…` dicipta, driver mula menaip | — |
| **In Review** | Merge request / PR dibuka; navigator menyemak | Semak validasi server, akses, `status_logs`, ujian PHPUnit, tiada `.env` |
| **Done** | Digabung ke `main` dan **semua** item DoD bertanda | Semua 7 item DoD; peserta boleh menerangkan setiap baris |

Gunakan [`senarai-semak-modul.md`](./senarai-semak-modul.md) (D1–D7) semasa In Review.

## 8. Pautkan ke Git

### 8.1 Satu peraturan: kunci + prefix

> **Kunci Jira dahulu, kemudian prefix KOLABORASI, kemudian huraian.**
> Branch: `feat/<KUNCI>-<huraian>` · Commit: `<KUNCI> <PREFIX>: <huraian>`

```bash
git switch main && git pull
git switch -c feat/TLKPAS-12-borang-tempahan
git commit -m "TLKPAS-12 TLK: tambah validasi tarikh tempahan"
git commit -m "TLKPAS-31 FIX: tolak tempahan 91 hari"
git push -u origin feat/TLKPAS-12-borang-tempahan
```

| Situasi | Contoh |
|---------|--------|
| Story modul | `TLKPAS-12 TLK: …` · `TLKPAS-20 PAS: …` · `TLKPAS-40 RPT: …` · `TLKPAS-45 STAT: …` |
| Bug | `TLKPAS-31 FIX: …` (Bug dicipta dahulu, kemudian commit) |
| Task persediaan | `TLKPAS-5 SETUP: …` |
| Commit Hari 1–4 sebelum backlog wujud | `SETUP: …` tanpa kunci (dibenarkan) |

Tulis kunci dalam **huruf besar** (`TLKPAS-12`, bukan `tlkpas-12`). Letakkan kunci yang sama dalam tajuk merge request / PR.

### 8.2 Panel Development (GitLab for Jira Cloud)

Jika repo pasangan di GitLab KKM ([`trek-gitlab.md`](./trek-gitlab.md)), aplikasi **GitLab for Jira Cloud** boleh memaparkan branch, commit dan MR yang menyebut kunci dalam panel **Development** setiap work item. Ini **pilihan; tanya jurulatih / IT KKM** — peraturan §8.1 tetap berguna tanpa aplikasi itu kerana kunci dalam sejarah Git boleh dicari.

- GitLab self-managed perlu boleh dicapai dari internet melalui HTTPS (GitLab 15.7+), dan **admin GitLab** KKM mesti mencipta aplikasi OAuth. Pasangan tidak boleh memasangnya sendiri.
- Kunci perlu ada dalam nama branch, mesej commit atau tajuk MR; sesuatu mesti di-push selepas sambungan supaya Jira menyegerak.
- Lakukan selepas trek GitLab siap, bukan sebelum Hari 4 S4.

## 9. Pemetaan GitLab ↔ Jira

Bagi pasangan yang biasa dengan GitLab Issues/Boards ([`trek-gitlab.md`](./trek-gitlab.md)):

| GitLab Issues / Boards | Jira | Nota |
|------------------------|------|------|
| Issue | Work item (Story / Task / Bug) | Jira ada work type yang lebih tegas |
| Task / task list | Subtask | |
| Issue induk / label modul | **Epic** (parent) | Hierarki Jira terbina |
| Label | Label | |
| Milestone / Iteration | Sprint (atau Release/Version) | Jira memisahkan sprint dan versi |
| *Weight* | Story point estimate | |
| Issue board | Board Scrum / Kanban | |
| Assignee | Assignee | |
| `Closes #14` dalam MR | `TLKPAS-12` dalam branch, commit, tajuk MR | Panel Development perlu GitLab for Jira Cloud |

> Pilih **satu** alat sebagai sumber kebenaran backlog. Jika pasangan guna kedua-dua trek, GitLab mengurus kod dan MR; Jira mengurus backlog dan sprint.

## 10. Tiga kesilapan lazim

| Kesilapan | Kenapa salah | Betulkan |
|-----------|--------------|----------|
| Story ditulis sebagai tugas teknikal (`Bina BookingService`) | Tiada nilai pengguna; tidak boleh diuji dengan AC | Tulis semula sebagai *Sebagai … saya mahu … supaya …*; pindah kerja teknikal ke Task |
| Kad diseret ke Done sebaik kod berjalan | Done tanpa DoD menyembunyikan ujian dan semakan akses yang belum dibuat | Kad ke In Review dahulu; Done hanya selepas semua item DoD bertanda dan digabung ke `main` |
| Dua backlog berbeza (Jira + `pelan-kerja.md` + GitLab Issues) | Kad dan fail tidak selari; pasangan tidak tahu mana yang betul | Satu sumber kebenaran; `pelan-kerja.md` merujuk kunci Jira, bukan senarai kerja berasingan |

## Semakan — Siap sebelum Hari 4

- [ ] Site Jira Cloud Free wujud; kedua-dua ahli pasangan boleh log masuk.
- [ ] Space Scrum team-managed berkunci `TLKPAS`; Estimation dihidupkan dengan Story points.
- [ ] 4 Epic M1–M4 dicipta.
- [ ] Setiap FR disahkan dalam `docs/keperluan-awal.md` ada satu Story berformat *Sebagai … saya mahu … supaya …*, dengan Epic sebagai parent.
- [ ] Setiap Story Must ada AC Given/When/Then dalam Description, sama dengan `docs/acceptance-criteria.md`.
- [ ] Setiap Story ada Priority ikut MoSCoW, label modul dan story point (Fibonacci, ≤ 13).
- [ ] Item Won't berlabel `wont` dan tidak berada dalam mana-mana sprint.
- [ ] Lajur board: To Do → In Progress → In Review → Done.
- [ ] Sprint 1 dimulakan pada Hari 4 S4 dengan Story M1 dan Task Hari 4 sahaja; matlamat sprint ditulis.
- [ ] Jadual **Cabang** dalam `docs/pelan-kerja.md` menggunakan kunci Jira (`feat/TLKPAS-nn-…`).
- [ ] Tiada data sebenar, kata laluan atau `.env` dalam mana-mana kad.

## Pautan

- Kursus: [`SPEC-KURSUS.md`](../SPEC-KURSUS.md) · [`JADUAL.md`](../JADUAL.md) · [`KOLABORASI.md`](../KOLABORASI.md)
- Hari: [`hari-1/lab.md`](../hari-1/lab.md) (Lab 1.4 FR/NFR + MoSCoW) · [`hari-2/README.md`](../hari-2/README.md) (S3 acceptance criteria) · [`hari-2/lab.md`](../hari-2/lab.md) · [`hari-4/lab.md`](../hari-4/lab.md) (Lab 4.4 pelan kerja) · [`hari-10/lab.md`](../hari-10/lab.md) (Lab 10.4 retrospektif)
- Docs: [`README.md`](./README.md) · [`senarai-semak-modul.md`](./senarai-semak-modul.md) · [`trek-gitlab.md`](./trek-gitlab.md) · [`trek-design-thinking.md`](./trek-design-thinking.md) · [`glosari.md`](./glosari.md)

## Sumber

Fakta Jira disemak pada **2026-10-15**:

- Pelan Free (10 pengguna, 2 GB, board Scrum/Kanban, backlog): <https://www.atlassian.com/software/free> · <https://support.atlassian.com/jira-cloud-administration/docs/explore-jira-cloud-plans/>
- Cipta space dan peraturan kunci: <https://support.atlassian.com/jira-software-cloud/docs/create-a-new-project/>
- Hidupkan Estimation (story points): <https://support.atlassian.com/jira-software-cloud/docs/enable-estimation/>
- Tambah orang ke space team-managed: <https://support.atlassian.com/jira-software-cloud/docs/add-people-to-team-managed-projects/>
- Import CSV: <https://support.atlassian.com/jira-cloud-administration/docs/import-data-from-a-csv-file/>
- Kunci dalam branch/commit/PR: <https://support.atlassian.com/jira-software-cloud/docs/reference-issues-in-your-development-work/>
- GitLab for Jira Cloud (disemak 2026-10-15): <https://docs.gitlab.com/integration/jira/connect-app/> · self-managed: <https://docs.gitlab.com/administration/settings/jira_cloud_app/>
