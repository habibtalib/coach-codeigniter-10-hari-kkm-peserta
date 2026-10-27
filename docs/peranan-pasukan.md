# Peranan Pasukan — Projek (PM, BA, QA) & Dev dengan Claude Code (Hari 8–10)

[← Indeks docs](./README.md) · [🤝 Kolaborasi](./kolaborasi.md) §6 · [💬 Pustaka prompt](./pustaka-prompt.md) §H · [🎨 Papan FigJam](./tutorial-figma-mcp.md) · [📋 Jira MCP](./tutorial-jira-mcp.md)

> Mulai Hari 8 petang hingga Hari 10, kelas bekerja sebagai **dua pasukan tetap** dalam repo **espkpv2** (`<gitlab-kkm>/aplikasi-baharu/espkpv2`): **Projek** (keperluan & pengujian) dan **Dev** (pembangunan). Nama dan pasangan: isu #19. Dokumen ini menerangkan **apa** yang setiap peranan buat dan **bagaimana** Claude Code membantunya. Peraturan teknikal repo (fail panas, nama migration, susunan merge) ada dalam `docs/pasukan.md` dalam repo itu sendiri.

## 1. Pasukan

| Pasukan | Ahli | Memiliki | Label (GitLab · Jira mulai Hari 9) |
|---|---|---|---|
| **Projek** | 1 PM, 1 BA, 2 QA | Backlog, cerita pengguna, AC, keutamaan, pelan ujian, semakan MR, UAT, soalan kepada pemilik sistem | `pasukan::projek` · `pasukan-projek` |
| **Dev** | 4 pasangan + 1 floater | Branch, slice, migration, ujian unit/feature, MR, rebase & konflik | `pasukan::dev` + `pasangan::1`…`4` · `pasukan-dev` + `pasangan-1`…`4` |

Label `pasukan::` menunjukkan siapa bertindak **sekarang**: isu bergerak Projek → Dev → Projek.

**Backlog:** isu sedia ada (#1, #8–#18) + jurang BRS (#20–#32, daripada semakan dokumen asal KKM) + #33 soalan pemilik sistem. Sprint 1 = Hari 8, Sprint 2 = Hari 9, Sprint 3 + keluaran v1.1.0 = Hari 10.

**Jira mulai Hari 9.** Backlog (story, AC, sprint, papan, versi `v1.1.0`) berpindah ke Jira Cloud kelas (space `KAN`); kod, MR dan CI kekal di GitLab KKM, dan isu GitLab KKM kekal sebagai rujukan BRS. Kunci Jira dalam branch (`feat/KAN-<n>-…`), commit (`Rujuk KAN-<n>`) dan tajuk MR. Claude membaca dan menulis Jira melalui MCP `atlassian` ([tutorial](./tutorial-jira-mcp.md)); menulis hanya selepas anda berkata ya. Jira Free = 10 kerusi: jurulatih, Projek (4), seorang setiap pasangan Dev dan floater. Jira ialah perkhidmatan luar: kad mengandungi ringkasan, cerita pengguna, AC dan pautan GitLab KKM sahaja — tiada teks BRS atau nama sebenar.

**Jurulatih = pemilik sistem.** Keputusan dasar (status mana dikira "lulus", nilai had, teks rasmi, percanggahan dalam BRS) dijawab jurulatih dalam komen isu.

## 2. Kad peranan

### PM (pasukan Projek)

| | |
|---|---|
| **Tanggungjawab** | Keutamaan dan skop sprint; label `status::`, `pasukan::`, `pasangan::`; assign isu kepada pasangan; triage pepijat; susunan merge bersama floater; merge MR selepas QA lulus; soalan pemilik sistem (#33); demo dan retro |
| **Claude Code** | `glab issue list/view` (Hari 8) atau MCP `atlassian` dengan JQL (Hari 9–10) + mod *Plan* untuk ringkasan papan; `/isu-baharu` untuk menyemak isu BA |
| **Siap apabila** | Setiap isu sprint `status::sedia` + `pasukan::dev` + `pasangan::N` (Hari 9–10: kad dalam sprint Jira dengan `pasangan-N`) dengan *Assignee*; papan tepat; nota sync dalam isu #19 |
| **AI tidak boleh** | Mencipta, menyunting atau menutup isu tanpa PM membaca; meneka keputusan pemilik sistem |

### BA (pasukan Projek)

| | |
|---|---|
| **Tanggungjawab** | Isu BRS dan isu stub → cerita pengguna + AC Diberi/Apabila/Maka yang boleh diuji; peranan terjejas; fail panas; lakaran perubahan skema di lorong *Cadangan ERD* FigJam |
| **Claude Code** | Skill `/isu-baharu <no>` (Hari 9–10: `/isu-baharu KAN-<n>`, tulis ke Jira selepas ya); subagent `papan-figjam` (cadangan ERD) |
| **Siap apabila** | ≥ 3 AC termasuk satu AC akses 404 dan satu kes sempadan, saiz ≤ M, setiap AC berasal daripada isu/BRS |
| **AI tidak boleh** | Mereka keperluan yang tiada dalam isu atau BRS; menjawab bagi pihak pemilik sistem |

### QA (pasukan Projek, 2 orang)

| | |
|---|---|
| **Tanggungjawab** | Pelan ujian daripada AC (sebelum melihat kod); ujian gagal dahulu dalam branch isu; semak MR terhadap AC; ujian eksploratori; E2E; UAT di `main` selepas merge |
| **Claude Code** | Subagent `penguji-espkp` (jurang ujian); skill `/semak-mr` (AC ↔ kod ↔ ujian, draf komen; AC daripada kad Jira mulai Hari 9); kad Bug melalui MCP `atlassian`; mod *Manual* untuk menulis ujian; `npm run e2e` |
| **Siap apabila** | Setiap AC ada bukti `fail:baris` + ujian, atau komen "minta perubahan" yang khusus |
| **AI tidak boleh** | Approve atau merge; menganggap AC dipenuhi tanpa bukti yang QA buka sendiri |

### Dev (pasukan Dev: 4 pasangan + floater)

| | |
|---|---|
| **Tanggungjawab** | Fahami isu; pelan slice; laksana slice demi slice di branch `feat/<no>-…`; `composer semak`; MR dengan `Closes #N`; jawab komen QA; rebase dan selesaikan konflik; uji ciri pasangan lain (Hari 9) |
| **Claude Code** | Mod *Plan* + skill `/ciri-baharu`; skill `aliran-kerja` / `migration-espkp`; mod *Manual* untuk setiap slice; subagent `semak-espkp`; MCP `ci4-spark`; `papan-figjam` selepas skema/aliran berubah |
| **Siap apabila** | MR `Ready`: senarai semak diisi dengan bukti, "Tiga baris utama" ditulis sendiri, `composer semak` hijau |
| **AI tidak boleh** | Menulis seluruh ciri dalam satu prompt; push; `migrate:refresh` / `db:seed`; mod *auto* / *bypass*; mengubah fail di luar isu |

**Floater** bertindak sebagai Dev tambahan: membantu pasangan yang disekat > 15 minit, menyelaras susunan MR untuk fail panas bersama PM, menyelesaikan konflik rebase bersama pasangan, dan menjalankan E2E.

**Pemandu & navigator.** Dua Dev dalam satu pasangan berkongsi satu branch dan satu sesi Claude: pemandu menaip prompt dan menjawab *Yes/No*; navigator membaca setiap diff dan menjalankan ujian. Tukar selepas setiap slice.

## 3. Pasukan tetap, bukan putaran

Pasukan kekal sama dari Hari 8 petang hingga Hari 10 (Hari 8 pagi menggunakan 3 skuad berputar). Kemahiran berpindah melalui **isu**, bukan melalui pertukaran peranan:

- **Serah tugas** setiap kali isu bertukar pasukan: komen — *Siap*, *Seterusnya*, *Soalan terbuka*. Orang seterusnya (dan Claude) membaca isu, bukan mesej peribadi.
- **Pasangan Dev menguji ciri pasangan lain** (Hari 9), jadi setiap Dev juga berlatih berfikir seperti QA.
- **BA menerangkan AC dalam demo**, jadi Projek juga mesti memahami kod yang membuktikan AC.

## 4. Satu isu, tiga sesi Claude

| Langkah | Siapa | Mod Claude | Hasil dalam GitLab (Hari 8) · Jira (Hari 9–10) |
|---|---|---|---|
| 1. Isu + AC | BA (PM semak) | *Plan* + `/isu-baharu` | Isu dengan AC, `pasukan::projek` · kad Jira dengan AC |
| 2. Pelan ujian | QA | *Plan* + `penguji-espkp` | Komen jadual AC → kes ujian |
| 3. Serah ke Dev | PM | — | `status::sedia` + `pasukan::dev` + `pasangan::N` · kad dalam sprint, `pasangan-N`, *Assignee* |
| 4. Pelan slice | Dev | *Plan* + `/ciri-baharu` | Komen pelan slice |
| 5. Ujian gagal | QA | *Manual* | Commit `ujian: … Rujuk #N` |
| 6. Slice | Dev | *Manual* + `semak-espkp` | Commit `<area>: … Rujuk #N` |
| 7. MR | Dev | — | MR `Closes #N`, `status::semakan` + `pasukan::projek` · MR `KAN-<n>: …`, kad *Testing* |
| 8. Semakan | QA | *Plan* + `/semak-mr` | Komen semakan + approve / minta perubahan |
| 9. Merge + UAT | PM, QA | — | Isu ditutup · kad *Done*; QA sahkan di `main` |

Sesi Claude yang berasingan (Projek dan Dev) tidak berkongsi konteks. Itu disengajakan: QA menyemak terhadap **AC**, bukan terhadap penjelasan Claude kepada Dev.

## 5. Penilaian

Hari 8–10 dinilai sebagai pasukan dan individu ([`rubrik-capstone.md`](./rubrik-capstone.md) §8): kualiti isu dan AC (PM, BA), bukti semakan dan ujian (QA), kebersihan MR dan ujian (Dev), dan keupayaan setiap orang **menerangkan** satu baris kerjanya — kod, ujian atau AC — tanpa Claude.
