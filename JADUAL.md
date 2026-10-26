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
| 14:30–15:30 | S1 | Migration & Model permohonan pas | Menulis Model/Entity `PassApplication` & `PassDocument` |
| 15:30–16:45 | S2 | Controller & View CRUD asas | Membina senarai (skop pemilik) & paparan butiran |
| 16:45–17:00 | S5, S6 | Lanjutan jika sempat; wrap-up | Lab 7.1b / 7.2b |

> ℹ️ Lab 7.3, 7.4 (dan 7.3b/7.4b) disambung pada pagi Hari 8.

## Hari 8 — Modul Pas (Bahagian 2) · [nota](./hari-8/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 7 | — |
| 09:00–10:00 | S1 | Aliran kelulusan mohon → semak → lulus/tolak | Melaksanakan `PassWorkflowService` dengan `PassStatus::canTransitionTo()` |
| 10:00–10:30 | S5 | Lanjutan S1: mula semakan pukal | Membina tindakan pukal melalui `startReview()`; kegagalan separa dilaporkan |
| 10:45–12:00 | S2 | Kawalan akses ikut peranan | Mengkonfigur Shield groups/permissions + filter route + semakan pemilikan |
| 12:00–12:30 | S6 | Lanjutan S2: lindungi route pukal | Menambah `permission:pas.review`; serangan `fetch()` + matriks 4 peranan |
| 14:30–15:30 | S3 | Log status/sejarah & ujian fungsian | Memaparkan garis masa `status_logs`; ujian akses positif & negatif |
| 15:30–16:00 | S7 | Lanjutan S3: ujian fungsian tindakan pukal | Menulis `PassBatchReviewTest` + 2 mutasi |
| 16:00–16:35 | S4 | Wrap-up Modul Pas | Demo aliran penuh 3 peranan; **M2 siap** |
| 16:35–17:00 | S8 | Lanjutan S4: demo peranan `admin` | Mendemokan admin; merekod dapatan pemisahan tugas dalam `docs/demo-m2.md` |

## Hari 9 — Modul Laporan · [nota](./hari-9/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 8 (aliran Pas + RBAC) | — |
| 09:00–10:00 | **S1** | Reka bentuk laporan (jenis, kriteria carian/filter) | O1, O2 |
| 10:00–10:30 | **S5** | Lanjutan S1: tempoh pantas & cip filter aktif | O7 |
| 10:45–12:00 | **S2** | Query aggregate & carian data | O3 |
| 12:00–12:30 | **S6** | Lanjutan S2: ringkasan status & baris JUMLAH RPT-03 | O8 |
| 14:30–15:30 | **S3** | Eksport PDF/Excel | O4, O6 |
| 15:30–16:00 | **S7** | Lanjutan S3: lembaran Ringkasan Excel & ringkasan PDF | O9 |
| 16:00–16:35 | **S4** | Ujian modul laporan — **M3 siap** | O5, O6 |
| 16:35–17:00 | **S8** | Lanjutan S4: ujian ringkasan & mutasi; wrap-up | O10 |

## Hari 10 — Modul Statistik & Capstone · [nota](./hari-10/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 9 | — |
| 09:00–10:30 | S1 | Dashboard statistik (carta, ringkasan merentas modul) | Membina kad KPI + 4 carta Chart.js dari endpoint JSON |
| 10:45–12:30 | S2 | Aggregate query & caching asas | Menggunakan `cache()->remember()` + invalidasi apabila status berubah |
| 14:30–16:00 | S3 | Ujian akhir sistem & pembetulan pepijat | Menjalankan skrip UAT; kitaran reproduce → ujian gagal → baiki |
| 16:00–17:00 | S4 | Demo capstone kepada pemilik sistem & penutup | Mendemokan aliran hujung-ke-hujung; retrospektif |

---

*Jadual boleh diselaraskan mengikut keperluan sebenar semasa kursus.*
