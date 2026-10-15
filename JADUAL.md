# JADUAL — Aturcara Rasmi 10 Hari (CI-KKM-10)

> Ikut **Tentatif Kursus CodeIgniter KKM** (RH Dynamic Resources). Masa rehat tetap setiap hari: **10:30–10:45** (pagi) · **12:30–14:30** (makan tengah hari). Tiada rehat petang. Kanun: [`SPEC-KURSUS.md`](./SPEC-KURSUS.md).

## Ringkasan fasa

| Fasa | Hari | Fokus | Output fasa |
|------|------|-------|-------------|
| **A — Fahami & Reka** | 1–3 | Keperluan, proses, acceptance criteria, ERD, wireframe | URS disahkan + ERD + wireframe |
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

## Hari 2 — Requirement Finalization & Process Flow · [nota](./hari-2/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 1 | — |
| 09:00–10:30 | S1 | Semakan & pengesahan keperluan bersama pemilik sistem | Mengesahkan/menolak setiap FR; merekod keputusan & soalan terbuka |
| 10:45–12:30 | S2 | Pemetaan proses as-is vs to-be (carta alir) | Melukis carta alir as-is & to-be (Mermaid) dan menanda titik penambahbaikan |
| 14:30–16:00 | S3 | Acceptance criteria setiap keperluan utama | Menulis AC Given/When/Then yang boleh diuji |
| 16:00–17:00 | S4 | Muktamadkan URS & carta alir; wrap-up | Menghasilkan URS v1.0 bertandatangan (templat) |

## Hari 3 — Database Design & UI/UX Foundation · [nota](./hari-3/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 2 | — |
| 09:00–10:30 | S1 | ERD keseluruhan sistem | Mengenal pasti entiti & kardinaliti; melukis ERD Mermaid |
| 10:45–12:30 | S2 | Jadual, medan & hubungan | Menulis kamus data (jenis, null, index, FK) & menormalkan ke 3NF |
| 14:30–16:00 | S3 | Wireframe/mockup UI/UX skrin utama | Melakar wireframe 6 skrin utama mengikut aliran pengguna |
| 16:00–17:00 | S4 | Semakan ERD & wireframe bersama jurulatih; wrap-up | Membetulkan reka bentuk berdasarkan semakan; menerima **tugasan persediaan** |

## Hari 4 — Assignment Review & Development Kickoff · [nota](./hari-4/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 3 | — |
| 09:00–10:30 | S1 | Semakan tugasan persediaan peserta | Mendemokan tugasan; menjelaskan aliran request MVC CI4 |
| 10:45–12:30 | S2 | Persekitaran CI4 (struktur projek, `.env`) + Shield | Mencipta projek, konfigur `.env`, memasang Shield & layout Bootstrap |
| 14:30–16:00 | S3 | Migration awal daripada ERD | Menukar ERD kepada migration + seeder; `php spark migrate` berjaya |
| 16:00–17:00 | S4 | Pembahagian tugas/modul; wrap-up | Menerima tugasan modul, cabang Git & Definition of Done |

## Hari 5 — Modul TLK (Bahagian 1) · [nota](./hari-5/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 4 | — |
| 09:00–10:30 | S1 | Migration & Model kenderaan/slot/tempahan | Menulis Model dengan `$allowedFields`, `$validationRules`, Entity & enum |
| 10:45–12:30 | S2 | Controller & View CRUD asas | Membina CRUD slot (admin) & senarai tempahan dengan pagination |
| 14:30–16:00 | S3 | Borang permohonan & validasi input | Membina borang tempahan dengan validasi pelayan + nombor rujukan `TLK-` |
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
| 10:45–12:30 | S2 | Kawalan akses ikut peranan | Mengkonfigur Shield groups/permissions + filter laluan + semakan pemilikan |
| 14:30–16:00 | S3 | Log status/sejarah & ujian fungsian | Memaparkan garis masa `status_logs`; ujian akses positif & negatif |
| 16:00–17:00 | S4 | Wrap-up Modul Pas | Demo aliran penuh 3 peranan; **M2 siap** |

## Hari 9 — Modul Laporan · [nota](./hari-9/README.md)

| Masa | Sesi | Aktiviti | Objektif sesi |
|------|------|----------|---------------|
| 08:30–09:00 | — | Recap Hari 8 | — |
| 09:00–10:30 | S1 | Reka bentuk laporan (jenis, kriteria carian/penapis) | Menentukan spesifikasi RPT-01..03 & borang penapis GET |
| 10:45–12:30 | S2 | Query aggregate & carian data | Menulis `ReportService` (join, `groupBy`, `selectCount`, penapis dinamik) |
| 14:30–16:00 | S3 | Eksport PDF/Excel | Menjana PDF (Dompdf) & `.xlsx` (PhpSpreadsheet) dari penapis sama |
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
