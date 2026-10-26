# Peranan Pasukan — PM, QA & Dev dengan Claude Code (Hari 8–10)

[← Indeks docs](./README.md) · [🤝 Kolaborasi](./kolaborasi.md) §6 · [💬 Pustaka prompt](./pustaka-prompt.md) §H

> Mulai Hari 8, kelas bekerja sebagai satu pasukan dalam repo **espkpv2** (`<gitlab-kkm>/aplikasi-baharu/espkpv2`): 3 skuad × 4 orang. Dokumen ini menerangkan **apa** yang setiap peranan buat dan **bagaimana** Claude Code membantunya. Peraturan teknikal repo (hotspot, nama migration, susunan merge) ada dalam `docs/pasukan.md` dalam repo itu sendiri.

## 1. Skuad

| Skuad | Kawasan | Hotspot (skuad pemilik sahaja) | Sprint 1 (H8) | Sprint 2 (H9) | Sprint 3 (H10) |
|---|---|---|---|---|---|
| A — Aliran | Aliran kerja, permohonan, peringatan | `Config/Aliran.php`, `Services/AliranKerja.php`, `DemoSeeder.php` | #1 Satu permohonan terbuka | #13 Peringatan Pindaan > 7 hari | #14 E2E & dokumentasi |
| B — Akaun & Keselamatan | Akaun, keselamatan, pentadbir | `Config/Auth.php`, `AuthGroups.php`, `Security.php`, `Filters.php` | #10 CSRF, #12 konfigurasi Auth | #9 dasar kata laluan, #8 migration MariaDB | #15 Sejarah log masuk |
| C — Laporan & Statistik | Laporan, eksport, papan pemuka | `Config/Laporan.php`, `Services/Laporan/*`, `StatistikService.php` | #16 RPT-10 kadar keputusan | #17 RPT-10 carta & eksport | #18 Kad KPI kadar kelulusan |

**Jurulatih = pemilik sistem.** Keputusan dasar (status mana dikira "lulus", nilai had, teks rasmi) dijawab jurulatih dalam komen isu.

## 2. Kad peranan

### PM (Product/Project Manager skuad)

| | |
|---|---|
| **Tanggungjawab** | Backlog skuad; isu dengan cerita pengguna + AC yang boleh diuji; label `status::`; jawab soalan Dev; selaras hotspot dan susunan merge dengan PM lain; merge MR selepas QA lulus; demo dan retro |
| **Claude Code** | Skill `/isu-baharu` (draf isu + AC + hotspot + arahan `glab`); mod *Plan* untuk ringkasan papan; `glab issue list/view` |
| **Siap apabila** | Isu `status::sedia`: ≥ 3 AC Diberi/Apabila/Maka, satu AC akses 404, satu AC kes sempadan, saiz ≤ M, soalan pemilik dijawab |
| **AI tidak boleh** | Mencipta, menyunting atau menutup isu tanpa PM membaca; meneka keputusan pemilik sistem |

### QA (Quality Assurance skuad)

| | |
|---|---|
| **Tanggungjawab** | Pelan ujian daripada AC (sebelum melihat kod); ujian gagal dahulu; semak MR terhadap AC; ujian manual di pelayar; isu Pepijat |
| **Claude Code** | Subagent `penguji-espkp` (jurang ujian); skill `/semak-mr` (AC ↔ kod ↔ ujian, draf komen); mod *Manual* untuk menulis ujian; `npm run e2e` |
| **Siap apabila** | Setiap AC ada bukti `fail:baris` + ujian, atau komen "minta perubahan" yang khusus |
| **AI tidak boleh** | Approve atau merge; menganggap AC dipenuhi tanpa bukti yang QA buka sendiri |

### Dev (2 orang, berpasangan)

| | |
|---|---|
| **Tanggungjawab** | Fahami isu; pelan slice; laksana slice demi slice di branch `feat/<no>-…`; `composer semak`; MR dengan `Closes #N`; jawab komen QA; rebase dan selesaikan konflik |
| **Claude Code** | Mod *Plan* + skill `/ciri-baharu`; skill `aliran-kerja` / `migration-espkp`; mod *Manual* untuk setiap slice; subagent `semak-espkp`; MCP `ci4-spark` |
| **Siap apabila** | MR `Ready`: senarai semak diisi dengan bukti, "Tiga baris utama" ditulis sendiri, `composer semak` hijau |
| **AI tidak boleh** | Menulis seluruh ciri dalam satu prompt; push; `migrate:refresh` / `db:seed`; mod *auto* / *bypass*; mengubah fail di luar isu |

**Pemandu & navigator.** Dua Dev pada satu isu berkongsi satu branch dan satu sesi Claude: pemandu menaip prompt dan menjawab *Yes/No*; navigator membaca setiap diff dan menjalankan ujian. Tukar selepas setiap slice.

## 3. Putaran peranan

Nombor tempat 1–4 ditetapkan jurulatih pada pagi Hari 8. Setiap orang menjadi PM sekali, QA sekali dan Dev sekurang-kurangnya dua kali.

| Slot | PM | QA | Dev |
|---|---|---|---|
| Hari 8 pagi (Sprint 1) | 1 | 2 | 3, 4 |
| Hari 8 petang (Sprint 1) | 2 | 3 | 4, 1 |
| Hari 9 pagi (Sprint 2) | 3 | 4 | 1, 2 |
| Hari 9 petang (Sprint 2) | 4 | 1 | 2, 3 |
| Hari 10 (Sprint 3 + keluaran) | pilihan skuad | | |

**Serah tugas** sebelum setiap putaran: komen dalam isu — *Siap*, *Seterusnya*, *Soalan terbuka*. Bukan mesej peribadi: orang seterusnya (dan Claude) membaca isu.

## 4. Satu isu, tiga sesi Claude

| Langkah | Siapa | Mod Claude | Hasil dalam GitLab |
|---|---|---|---|
| 1. Isu + AC | PM | *Plan* + `/isu-baharu` | Isu `status::sedia` |
| 2. Pelan ujian | QA | *Plan* + `penguji-espkp` | Komen jadual AC → kes ujian |
| 3. Pelan slice | Dev | *Plan* + `/ciri-baharu` | Komen pelan slice |
| 4. Ujian gagal | QA | *Manual* | Commit `ujian: … Rujuk #N` |
| 5. Slice | Dev | *Manual* + `semak-espkp` | Commit `<area>: … Rujuk #N` |
| 6. MR | Dev | — | MR `Closes #N`, `status::semakan` |
| 7. Semakan | QA | *Plan* + `/semak-mr` | Komen semakan + approve / minta perubahan |
| 8. Merge | PM | — | Isu ditutup |

Tiga sesi Claude yang berasingan (PM, QA, Dev) tidak berkongsi konteks. Itu disengajakan: QA menyemak terhadap **AC**, bukan terhadap penjelasan Claude kepada Dev.

## 5. Penilaian

Hari 8–10 dinilai sebagai skuad dan individu ([`rubrik-capstone.md`](./rubrik-capstone.md)): kualiti isu (PM), bukti semakan (QA), kebersihan MR dan ujian (Dev), dan keupayaan setiap orang **menerangkan** baris yang di-commit atas namanya.
