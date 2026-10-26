# JADUAL — Aturcara Rasmi 10 Hari (CI-KKM-10)

> Ikut **Tentatif Kursus CodeIgniter KKM** (RH Dynamic Resources). Masa rehat tetap setiap hari: **10:30–10:45** (pagi) · **12:30–14:30** (makan tengah hari). Tiada rehat petang. Kanun: [`docs/spesifikasi-sistem.md`](./docs/spesifikasi-sistem.md).

## Ringkasan fasa

| Fasa | Hari | Fokus | Output fasa |
|------|------|-------|-------------|
| **A — Fahami & Bina Asas CI** | 1–3 | Keperluan (Hari 1 + S1 Hari 2), projek `kelas-ci-<nama>` di GitLab, route/view/borang, database & migration | Projek CI4 individu di GitLab dengan borang & migration pertama |
| **B — Sedia & Bina** | 4–8 | Persekitaran CI4, migration, **M1 TLK**, **M2 Pas** | Dua modul transaksi berfungsi & diuji |
| **C — Lapor & Serah** | 9–10 | **M3 Laporan**, **M4 Statistik**, ujian akhir, demo | Sistem lengkap didemo kepada pemilik sistem |

---

## Hari 1 — Project Kickoff & Requirement Deep Dive · [nota](./hari-1/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi (peserta boleh…) |
|------|------|----------|-------------------------------|
| 08:30–09:00 | — | Pendaftaran / pengenalan | — |
| 09:00–10:30 | S1 | Taklimat projek & skop kerja; perkenalan pasukan & pemilik sistem | Menyatakan matlamat, skop & had 4 modul; mengenal pasti pihak berkepentingan |
| 10:45–12:30 | S2 | Requirement deep-dive — **Modul TLK** | Mengumpul keperluan TLK melalui temu bual berstruktur; merekod *pain point* |
| 14:30–16:00 | S3 | Requirement deep-dive — **Modul Pas** | Mengumpul keperluan Pas termasuk dokumen & peringkat kelulusan |
| 16:00–17:00 | S4 | Senarai awal keperluan fungsian & bukan fungsian; persediaan CI4 tempatan (Laragon) & gambaran ERD sistem sedia ada; wrap-up | Menulis FR/NFR berformat ID (`FR-TLK-01`) & mengelaskan MoSCoW; menjalankan CI4 di laptop (Lab 1.5) |

## Hari 2 — Pengesahan Keperluan & Projek CI di GitLab · [nota](./hari-2/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 1 | — |
| 09:00–10:30 | S1 | Semakan & pengesahan keperluan bersama pemilik sistem | Mengesahkan/menolak setiap FR; merekod keputusan & soalan terbuka |
| 10:45–12:30 | S2 | Projek `kelas-ci-<nama>` di GitLab KKM | Mencipta projek GitLab & projek CI4; push commit pertama |
| 14:30–16:00 | S3 | Route, controller & layout view | Membina MVC pertama, route berparameter, layout; `php spark routes` |
| 16:00–17:00 | S4 | Borang, validation & CSRF; wrap-up | Membina borang `/daftar` dengan validation, flash & CSRF |

## Hari 3 — Database, Migration, Model & Carian · [nota](./hari-3/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 2 | — |
| 09:00–10:00 | S1 | Database MySQL & `.env` | Mencipta database & pengguna `kkm_dev`; menyambung projek |
| 10:00–10:30 | S5 | Lanjutan S1: database ujian & `.env.example` | Menyambung kumpulan `tests`; meng-commit templat tanpa rahsia |
| 10:45–11:50 | S2 | Migration & seeder pertama | Menulis migration `departments` & `parking_zones`; seeder idempoten |
| 11:50–12:30 | S6 | Lanjutan S2: Query Builder dalam konsol | Menjalankan query dalam `php spark shell`; membaca SQL sebenar |
| 14:30–15:20 | S3 | Model & halaman `/jabatan` | Membina model dengan validation; senarai & borang baharu |
| 15:20–16:00 | S7 | Lanjutan S3: edit jabatan | Membina borang edit dengan `update()` dan `is_unique` `{id}` |
| 16:00–16:35 | S4 | Carian & pagination `/zon` | Membina carian Query Builder & pagination secara berdikari |
| 16:35–17:00 | S8 | Lanjutan S4: butiran zon & susunan; wrap-up | Membina halaman butiran dengan 404 dan susunan ber-whitelist |

## Hari 4 — Development Kickoff: Shield, Skema Penuh & Aliran Git · [nota](./hari-4/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 3 | — |
| 09:00–10:00 | S1 | Demo repo sendiri & kitaran request | Mendemokan repo GitLab & `/zon`; menjejak aliran request MVC CI4 dengan Debug Toolbar |
| 10:00–10:30 | S5 | Lanjutan S1: jejak request POST `/jabatan` | Menjejak POST dengan History Debug Toolbar & `filter:check`; membandingkan dengan GET |
| 10:45–12:00 | S2 | Struktur projek, `.env` + Shield | Melengkapkan `.env`, memasang Shield, peranan & layout Bootstrap |
| 12:00–12:30 | S6 | Lanjutan S2: filter Shield pada halaman Hari 3 | Memasang `session` & `permission:admin.access` pada `/jabatan`, `/zon`; menguji dengan dua akaun |
| 14:30–15:30 | S3 | Migration & seeder daripada ERD rujukan | Menulis 8 migration baki + seeder; `php spark migrate` berjaya |
| 15:30–16:00 | S7 | Lanjutan S3: latihan FK & `ON DELETE` | Membuktikan `RESTRICT`/`SET NULL`/`CASCADE` dalam transaksi; `ReferenceSequenceSeeder` |
| 16:00–16:35 | S4 | Aliran Git solo & merge request | Push `SETUP:`, membuka MR pertama, pelan branch & Definition of Done |
| 16:35–17:00 | S8 | Lanjutan S4: merge request kedua; wrap-up | MR dengan komen semakan + commit pembetulan; padam branch selepas merge |

## Hari 5 — Modul TLK (Bahagian 1) · [nota](./hari-5/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 4 | — |
| 09:00–10:00 | S1 | Migration & Model kenderaan/slot/tempahan | Menulis Model dengan `$allowedFields`, `$validationRules`, Entity & enum |
| 10:00–10:30 | S5 | Lanjutan S1: peraturan Model zon & kenderaan | Menulis peraturan + mesej BM (`{id}`, `{value}`); menguji dengan `Model::validate()` & ujian unit |
| 10:45–12:00 | S2 | Controller & View CRUD asas | Membina CRUD slot (admin) & senarai tempahan dengan pagination |
| 12:00–12:30 | S6 | Lanjutan S2: CRUD zon (admin) | Membina CRUD zon `/admin/slot/zon`; menghalang padam zon yang masih ada slot |
| 14:30–15:30 | S3 | Borang permohonan & validasi input | Membina borang tempahan dengan validasi server + nombor rujukan `TLK-` |
| 15:30–16:00 | S7 | Lanjutan S3: borang daftar kenderaan | Membina `/kenderaan` dengan normalisasi, peraturan tersuai `valid_plate_no` & `user_id` dari sesi |
| 16:00–16:35 | S4 | Ujian manual & semakan | Melaksanakan senarai ujian manual & merekod pepijat |
| 16:35–17:00 | S8 | Lanjutan S4: ujian manual pusingan 2; wrap-up | Melaksanakan 12 kes zon & kenderaan; merekod BUG-ZON-001; membersihkan data ujian |

## Hari 6 — Modul TLK (Bahagian 2) · [nota](./hari-6/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 5 | — |
| 09:00–10:00 | S1 | Logik semakan ketersediaan slot | Menulis query pertindihan julat tarikh & paparan slot kosong |
| 10:00–10:30 | S5 | Lanjutan S1: papan slot sibuk | Membina papan tempahan aktif ikut julat tarikh dengan `JOIN`; dihadkan kepada pelulus |
| 10:45–12:00 | S2 | Kawalan pertindihan & status (menunggu/diluluskan/ditolak) | Menguatkuasa BR-TLK-01/04/05 dalam transaksi; peralihan status + log |
| 12:00–12:30 | S6 | Lanjutan S2: command `tlk:expire` | Menamatkan tempahan melalui `transition()`; melihat command menunggu kunci baris |
| 14:30–15:30 | S3 | Ujian fungsian modul | Menulis ujian PHPUnit untuk pertindihan & peralihan status |
| 15:30–16:15 | S7 | Lanjutan S3: ujian peraturan baharu + Claude Code | Menguji papan sibuk & tamat tempoh; kes ujian dicadang Claude Code disahkan dengan larian |
| 16:15–16:40 | S4 | Penambahbaikan UI; wrap-up modul | Menambah badge status, flash message, pengesahan; **M1 siap** |
| 16:40–17:00 | S8 | Lanjutan S4: gilap *Tempahan Saya*; wrap-up | Tab status dengan kiraan, Batal terus dari senarai |

## Hari 7 — Modul Pas (Bahagian 1) · [nota](./hari-7/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 6 | — |
| 09:00–10:00 | S9 | Claude Code: pasang, `CLAUDE.md` & mod Plan | Menulis `CLAUDE.md` projek ikut standard kursus; memori pengguna/projek/tempatan |
| 10:00–10:30 | S12 | Claude Code: prompting, projek baharu & PRD | Menulis prompt onboarding & pelan dalam mod Plan; mendraf dan menyemak PRD latihan |
| 10:45–11:45 | S10 | Claude Code: subagent & skill | Subagent baca sahaja `semak-ci4` pada kod Hari 6; skill `migration-ci4` |
| 11:45–12:30 | S11 | Claude Code: MCP untuk CodeIgniter | Server MCP `ci4-spark` (PHP, baca sahaja); Context7; MySQL/GitLab pilihan |
| 14:30–15:45 | S15 | Claude Code: fahami projek contoh eSPKP | Lab 7.12: 6 prompt onboarding mod Plan pada eSPKP Contoh, disahkan dengan `fail:baris` dan demo 2 peranan |
| 15:45–17:00 | S16 | Claude Code: rancang & laras keperluan daripada projek contoh | Lab 7.13: PRD daripada kod, jadual jurang vs SPEC, `docs/keperluan-pas.md` + `docs/pelan-pas.md` |

> ℹ️ S13/S14 (Lab 7.10/7.11) dipindahkan ke pagi Hari 8.

> ℹ️ Mulai petang Hari 7 hingga Hari 10, modul dibina dengan Claude Code ([`kolaborasi.md`](./docs/kolaborasi.md) §3). Lab manual Pas 7.0–7.4 (dan 7.1b–7.4b) kini kod rujukan untuk perbandingan, bukan wajib.

## Hari 8 — Modul Pas (Bahagian 2) · [nota](./hari-8/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 7 | — |
| 09:00–10:30 | S13 (Hari 7) | Claude Code: Pas slice 1 — model, senarai & butiran | Lab 7.10: enum, Model `ownedBy()`, senarai & butiran 404 bukan pemilik, berpandukan `docs/keperluan-pas.md` dan `docs/pelan-pas.md` ([Lab 7.10](./hari-7/lab.md#lab-710--claude-code-pas-slice-1--migrationenummodel-senarai-skop-pemilik--butiran-s13)) |
| 10:45–12:30 | S14 (Hari 7) | Claude Code: Pas slice 2 — borang & muat naik selamat | Lab 7.11: borang + CSRF, validasi fail, nama rawak di luar `public/`, transaksi + pembersihan ([Lab 7.11](./hari-7/lab.md#lab-711--claude-code-pas-slice-2--borang-validasi--muat-naik-dokumen-selamat-s14)) |
| 14:30–15:30 | S9 | Claude Code: aliran kelulusan Pas (slice 3) | Lab 8.10: `PassWorkflowService` dengan `PassStatus::canTransitionTo()` melalui gerbang pelan dan diff |
| 15:30–16:30 | S10 | Claude Code: RBAC Shield & skop akses (slice 4) | Lab 8.11: filter `permission:`, `authorize()` dan `canView()` dibuktikan dengan `filter_check` dan serangan |
| 16:30–17:00 | S11 | Claude Code: ujian akses & sejarah status (slice 5) — teras | Lab 8.12 (teras): matriks peranan × tindakan dan `PassAccessTest` positif & negatif |

> ℹ️ **Lab 8.12 dan 8.13:** Lab 8.12 disiapkan, dan Lab 8.13 (S12, demo M2 & merge) dijalankan, pada awal Hari 9 08:30–09:00 atau sebagai kerja rumah.

> ℹ️ Modul dibina dengan Claude Code melalui 7 pintu semakan ([`kolaborasi.md`](./docs/kolaborasi.md) §3); lab manual hari ini ialah kod rujukan, tidak wajib.

## Hari 9 — Modul Laporan · [nota](./hari-9/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 8 (aliran Pas + RBAC) | — |
| 09:00–10:30 | **S9** | Claude Code: `ReportService` & penapis whitelist (slice L1) | O11 |
| 10:45–12:30 | **S10** | Claude Code: paparan senarai & RPT-03 (slice L2) | O12 |
| 14:30–16:00 | **S11** | Claude Code: eksport PDF & Excel selamat (slice L3) | O13 |
| 16:00–17:00 | **S12** | Claude Code: ujian laporan & prestasi — **M3 siap** | O14 |

> ℹ️ Modul dibina dengan Claude Code melalui 7 pintu semakan ([`kolaborasi.md`](./docs/kolaborasi.md) §3); lab manual hari ini ialah kod rujukan, tidak wajib.

## Hari 10 — Modul Statistik & Capstone · [nota](./hari-10/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 9 (laporan & eksport) | — |
| 09:00–10:30 | **S5** | Claude Code: modul Statistik slice 1–2 (KPI, dataset carta, `/statistik/data`) — Lab 10.10 | O1, O7 |
| 10:45–11:45 | **S5** | Claude Code: modul Statistik slice 3–4 (Chart.js, cache + invalidasi selepas commit) | O2, O3, O7 |
| 11:45–12:30 | **S3** | UAT manual merentas 4 modul + K1–K10 (Lab 10.3 langkah 1–3 dan 5) | O4 |
| 14:30–16:00 | **S6** | Claude Code: persediaan capstone (`semak-ci4`, AI-08, AI-09, AI-18, tag) — Lab 10.11 | O5, O8 |
| 16:00–17:00 | **S7** | Demo capstone (format S4) & refleksi Claude Code — Lab 10.12 | O6, O9 |

> ℹ️ Modul dibina dengan Claude Code melalui 7 pintu semakan ([`kolaborasi.md`](./docs/kolaborasi.md) §3); lab manual hari ini ialah kod rujukan, tidak wajib.

---

*Jadual boleh diselaraskan mengikut keperluan sebenar semasa kursus.*
