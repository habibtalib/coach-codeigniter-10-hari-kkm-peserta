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
| 09:00–10:30 | S1 | Database MySQL & `.env` | Mencipta database & pengguna `kkm_dev`; menyambung projek |
| 10:45–12:30 | S2 | Migration & seeder pertama | Menulis migration `departments` & `parking_zones`; seeder idempoten |
| 14:30–16:00 | S3 | Model & halaman `/jabatan` | Membina model dengan validation; senarai & borang baharu |
| 16:00–17:00 | S4 | Carian & pagination `/zon`; wrap-up | Membina carian Query Builder & pagination secara berdikari |

## Hari 4 — Development Kickoff: Shield, Skema Penuh & Aliran Git · [nota](./hari-4/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 3 | — |
| 09:00–10:30 | S1 | Demo repo sendiri & kitaran request | Mendemokan repo GitLab & `/zon`; menjejak aliran request MVC CI4 dengan Debug Toolbar |
| 10:45–12:30 | S2 | Struktur projek, `.env` + Shield | Melengkapkan `.env`, memasang Shield, peranan & layout Bootstrap |
| 14:30–16:00 | S3 | Migration & seeder daripada ERD rujukan | Menulis 8 migration baki + seeder; `php spark migrate` berjaya |
| 16:00–17:00 | S4 | Aliran Git solo & merge request; wrap-up | Push `SETUP:`, membuka MR pertama, pelan branch & Definition of Done |

## Hari 5 — Modul TLK (Bahagian 1) · [nota](./hari-5/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 4 | — |
| 09:00–10:30 | S1 | Migration & Model kenderaan/slot/tempahan | Menulis Model dengan `$allowedFields`, `$validationRules`, Entity & enum |
| 10:45–12:30 | S2 | Controller & View CRUD asas | Membina CRUD slot (admin) & senarai tempahan dengan pagination |
| 14:30–16:00 | S3 | Borang permohonan & validasi input | Membina borang tempahan dengan validasi server + nombor rujukan `TLK-` |
| 16:00–17:00 | S4 | Ujian manual & semakan; wrap-up | Melaksanakan senarai ujian manual & merekod pepijat |

## Hari 6 — Modul TLK (Bahagian 2) · [nota](./hari-6/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 5 | — |
| 09:00–10:30 | S1 | Logik semakan ketersediaan slot | Menulis query pertindihan julat tarikh & paparan slot kosong |
| 10:45–12:30 | S2 | Kawalan pertindihan & status (menunggu/diluluskan/ditolak) | Menguatkuasa BR-TLK-01/04/05 dalam transaksi; peralihan status + log |
| 14:30–16:00 | S3 | Ujian fungsian modul | Menulis ujian PHPUnit untuk pertindihan & peralihan status |
| 16:00–17:00 | S4 | Penambahbaikan UI; wrap-up modul | Menambah badge status, flash message, pengesahan; **M1 siap** |

## Hari 7 — Modul Pas (Bahagian 1) · [nota](./hari-7/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 6 | — |
| 09:00–10:30 | S1 | Migration & Model permohonan pas | Menulis Model/Entity `PassApplication` & `PassDocument` |
| 10:45–12:30 | S2 | Controller & View CRUD asas | Membina senarai (skop pemilik) & paparan butiran |
| 14:30–16:00 | S3 | Borang, validasi & muat naik dokumen | Muat naik fail selamat (jenis/saiz/nama rawak/luar `public`) |
| 16:00–17:00 | S4 | Ujian manual & semakan; wrap-up | Menguji kes sempadan muat naik & validasi |

## Hari 8 — Modul Pas (Bahagian 2) · [nota](./hari-8/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 7 | — |
| 09:00–10:30 | S1 | Aliran kelulusan mohon → semak → lulus/tolak | Melaksanakan `PassWorkflowService` dengan `PassStatus::canTransitionTo()` |
| 10:45–12:30 | S2 | Kawalan akses ikut peranan | Mengkonfigur Shield groups/permissions + filter route + semakan pemilikan |
| 14:30–16:00 | S3 | Log status/sejarah & ujian fungsian | Memaparkan garis masa `status_logs`; ujian akses positif & negatif |
| 16:00–17:00 | S4 | Wrap-up Modul Pas | Demo aliran penuh 3 peranan; **M2 siap** |

## Hari 9 — Modul Laporan · [nota](./hari-9/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 8 | — |
| 09:00–10:30 | S1 | Reka bentuk laporan (jenis, kriteria carian/filter) | Menentukan spesifikasi RPT-01..03 & borang filter GET |
| 10:45–12:30 | S2 | Query aggregate & carian data | Menulis `ReportService` (join, `groupBy`, `selectCount`, filter dinamik) |
| 14:30–16:00 | S3 | Eksport PDF/Excel | Menjana PDF (Dompdf) & `.xlsx` (PhpSpreadsheet) dari filter sama |
| 16:00–17:00 | S4 | Ujian modul laporan; wrap-up | Mengesahkan jumlah laporan = jumlah DB; **M3 siap** |

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
