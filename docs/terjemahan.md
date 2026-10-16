# Peraturan terjemahan · Translation rules (BM → English)

[← Indeks docs · Docs index](./README.md) · [Glosari](./glosari.md) · [Glossary](./glosari.en.md)

> Diadaptasi daripada · Adapted from `kursus-javascript-pgn-5-hari: docs/terjemahan.md` (dan pemeriksanya · and its checker `scripts/semak-terjemahan.mjs`).

**BM:** Kursus ini ditulis dalam Bahasa Melayu. Versi English diletak di sebelah setiap fail BM sebagai adik `.en.` (`README.md` → `README.en.md`). Pelatih (training-console) mengimport kedua-dua fail dan memadankan setiap blok English dengan blok BM **ikut struktur**. Jika struktur lari, halaman English kehilangan kuiz, senarai semak atau semakan lab, atau import gagal.

**EN:** The course is written in Malay. English versions sit next to each Malay file as an `.en.` sibling (`README.md` → `README.en.md`). Pelatih (training-console) imports both and matches every English block to its Malay block **by structure**. If the structure drifts, the English page loses quizzes, checklists or lab checks, or the import fails.

## Fail · Files

| BM | English | Catatan · Notes |
|----|---------|-----------------|
| `README.md`, `JADUAL.md`, `docs/spesifikasi-sistem.md`, `docs/kolaborasi.md` | `README.en.md`, `JADUAL.en.md`, `docs/spesifikasi-sistem.en.md`, `docs/kolaborasi.en.md` | |
| `hari-N/README.md`, `lab.md`, `nota-penceramah.md` | `hari-N/README.en.md`, `lab.en.md`, `nota-penceramah.en.md` | |
| `nota/NN-*.md`, `docs/nota.md` | `nota/NN-*.en.md`, `docs/nota.en.md` | |
| `docs/*.md` | `docs/*.en.md` | Kecuali · Except `docs/terjemahan.md` (halaman ini, dwibahasa · this page, bilingual) |
| `templates/dokumen/*.md` | `templates/dokumen/*.en.md` | |
| `slides/README.md` | `slides/README.en.md` | |
| `templates/kod/*.php.txt` | **Tidak diterjemah · Not translated** | Kod dikongsi · Shared code |
| `CLAUDE.md` | **Tidak diterjemah · Not translated** | Arahan ejen · Agent instructions |

## Gaya · Style

**BM:**
- English yang mudah dan jelas untuk kakitangan IT kerajaan. Ayat pendek. Terjemah dengan setia dan lengkap: jangan ringkaskan, buang, gabung atau susun semula perenggan, *bullet*, baris jadual, *callout* atau contoh.
- Istilah ikut [`glosari.md`](./glosari.md) dan jadual glosari di bawah.
- Kekalkan emoji, jadual, *callout* (`> **…**`), tebal/condong, pautan dan struktur markdown tepat seperti fail BM.
- Nama tempat, agensi dan orang di Malaysia kekal (Putrajaya, KKM, MAMPU).
- Masa: kekalkan digit (`09:00–10:30`); `pagi`/`tgh`/`ptg` → `am`/`pm`.
- Pautan ke fail `.md` lain boleh kekal menuju fail BM (`./lab.md`); platform menukarnya ke adik English.

**EN:**
- Plain, clear English for government IT staff. Short sentences. Translate faithfully and completely: don't summarise, drop, merge or reorder paragraphs, bullets, table rows, callouts or examples.
- Terms as in [`glosari.en.md`](./glosari.en.md) and the glossary table below.
- Keep emoji, tables, callouts (`> **…**`), bold/italic, links and markdown structure exactly as in the Malay file.
- Malaysian place names, agency names and people stay as they are (Putrajaya, KKM, MAMPU).
- Times: keep the digits (`09:00–10:30`); `pagi`/`tgh`/`ptg` → `am`/`pm`.
- Links to other `.md` files may keep pointing to the Malay file (`./lab.md`); the platform rewrites them to the English sibling.

## Glosari terjemahan · Translation glossary

| BM | English | Catatan · Notes |
|----|---------|-----------------|
| TLK (Tempat Letak Kenderaan Khas) | TLK (Special Vehicle Parking) | Kekalkan singkatan `TLK` · Keep the abbreviation `TLK` |
| Pas | Pass | Modul M2 · Module M2 |
| Laporan | Report | Modul M3 · Module M3 |
| Statistik | Statistics | Modul M4 · Module M4 |
| pemilik sistem | system owner | |
| pegawai | officer | |
| permohonan | application | |
| kelulusan | approval | |
| Hari N | Day N | `Hari 5` → `Day 5` |
| pelatih / peserta | participant | |
| jurulatih / penceramah | trainer | |
| latihan / penyelesaian (dalam prosa · in prose) | exercise / solution | |
| tempahan | booking | |
| pemohon / penyemak / pelulus / pentadbir | applicant / reviewer / approver / administrator | Nama *group* dalam kod kekal · Group names in code stay (`applicant`, `reviewer`…) |
| kuiz / semakan kendiri / jawapan | quiz / self-check / answer | |

## Jangan ubah · Never change

**BM:** Kod dikongsi oleh kedua-dua bahasa. **Terjemah komen sahaja.** Semua di bawah kekal sama bait demi bait:

**EN:** Code is shared by both languages. **Translate only comments.** Everything below stays byte-for-byte the same:

- pengecam, *string literal*, nombor, nilai data dan enum (`'menunggu'`, `'dalam_semakan'`, `TLK-2026-0001`), mesej ralat dan label UI dalam kod, nama fail dan laluan, URL, arahan dan output · identifiers, string literals, numbers, data and enum values (`'menunggu'`, `'dalam_semakan'`, `TLK-2026-0001`), error messages and UI labels inside code, file names and paths, URLs, commands and printed output;
- dalam blok kod berpagar (`php`, `sql`, `bash`, `json`, `html`, `gherkin`…): hanya komen (`//`, `/* */`, `#`, `<!-- -->`) dan anotasi `← …` boleh diterjemah · inside fenced code blocks (`php`, `sql`, `bash`, `json`, `html`, `gherkin`…): only comments (`//`, `/* */`, `#`, `<!-- -->`) and `← …` annotations may be translated;
- komen `;` dalam blok `ini` kekal BM (pemeriksa tidak mengenalinya sebagai komen) · `;` comments in `ini` blocks stay Malay (the checker doesn't treat them as comments);
- kod sebaris (`` `…` ``) dalam prosa; tambah glos English selepasnya jika perlu, cth `` `Menunggu` (Pending) `` · inline code (`` `…` ``) in prose; add an English gloss after it if needed, e.g. `` `Menunggu` (Pending) ``;
- `templates/kod/`.

**BM:** Blok `text` dan `mermaid` mengandungi prosa (rajah, pokok folder), jadi terjemah labelnya tetapi kekalkan bentuk, id nod dan anak panah.

**EN:** `text` and `mermaid` blocks hold prose (diagrams, folder trees), so translate the labels but keep the shape, the node ids and the arrows.

## Token struktur · Structural tokens

| Di mana · Where | BM | English: kekalkan bentuk ini · keep exactly this form |
|-----------------|----|-------------------------------------------------------|
| tajuk lab · lab heading | `## Lab 5.1 — Enum, Entity & Model (S1)` | `## Lab 5.1 — … (S1)`: kekalkan `Lab`, nombor, `—` dan `(S1)` · keep `Lab`, the number, the `—` and `(S1)` |
| tag masa lab · lab time tag | `(10 minit)` | `(10 min)`; kod sesi `(S1…)` kekal · the session code `(S1…)` stays |
| `Capstone` | `## Capstone — …` | `## Capstone — …`; tajuk lain jangan bermula dengan `Capstone` · other headings must not start with `Capstone` |
| sesi README hari · day README session | `## S2 — Controller & View CRUD (10:45–12:30)` | `## S2 — … (10:45–12:30)`; **bukan · not** "Session 2" |
| kuiz · quiz | `### 🎯 Kuiz S1`, `## 🧠 Kuiz` | `### 🎯 Quiz S1`, `## 🧠 Quiz`; bilangan soalan, susunan pilihan dan `[x]` sama · same questions, option order and `[x]` |
| subseksyen lab · lab subsections | `### 🎯 Objektif`, `### Prasyarat`, `### 🧯 Masalah lazim`, `### ⭐ Cabaran tambahan` | `### 🎯 Objective`, `### Prerequisites`, `### 🧯 Troubleshooting`, `### ⭐ Extra challenge` |
| senarai semak lab · lab checklist | `### ✅ Checkpoint`, `## Semakan …` | `### ✅ Checkpoint`, `## Checklist …` |
| README hari · day README | `## 🎯 Objektif Pembelajaran` | `## 🎯 Learning Objectives` |
| README hari · day README | `## 📦 Hasil Hari Ini` | `## 📦 Deliverables` (mesti **bermula** dengan · must **start** with `Deliverable`) |
| README hari · day README | `## 🧠 Semakan Kendiri` | `## 🧠 Self-check` |
| semua · everywhere | `- [ ]` | bilangan item sama dalam setiap seksyen · the same number of items in each section |
| semua · everywhere | `<details><summary>Jawapan</summary>…</details>` | bilangan `<details>` sama (`Answer`) · same number of `<details>` (`Answer`) |
| tajuk · headings | penomboran `### 2.1 …`, emoji di depan · numbering, leading emoji | kekalkan nombor, emoji dan aras; jangan tambah/buang tajuk · keep the number, emoji and level; don't add or remove headings |

## Semak · Check

**BM:** Pemeriksa struktur ialah `scripts/semak-terjemahan.mjs` (sama seperti kursus JavaScript). Jalankan selepas setiap fail diterjemah dan baiki sehingga `PASS`.

**EN:** The structure checker is `scripts/semak-terjemahan.mjs` (same as the JavaScript course). Run it after every file you translate, and fix the file until it shows `PASS`.

```bash
node scripts/semak-terjemahan.mjs                       # semua pasangan + laporan liputan · every pair + coverage report
node scripts/semak-terjemahan.mjs docs/nota-05-service-layer-dan-transaksi.en.md   # satu pasangan · one pair
```

**BM:** Pemeriksa membandingkan urutan tajuk (aras, emoji, nombor, nombor lab, kod sesi, skop kuiz, tag masa), soalan dan pilihan kuiz, `>` penjelasan, item tugasan dan `<details>` per seksyen, serta blok kod tanpa komen (`text` dan `mermaid` tidak dibandingkan). Bilangan baris jadual dan kod sebaris yang hilang dilaporkan sebagai amaran.

**EN:** The checker compares the heading sequence (level, emoji, numbering, lab number, session code, quiz scope, time tag), quiz questions and options, `>` explanations, task items and `<details>` per section, and fenced code blocks with comments stripped (`text` and `mermaid` blocks are not compared). Table row counts and missing inline code are reported as warnings.
