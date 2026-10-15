# Coaching Pembangunan Aplikasi Menggunakan CodeIgniter — 10 Hari (KKM)

> **Repo awam untuk peserta.** Nota penceramah, kunci jawapan dan bahan jurulatih tidak termasuk dalam repo ini. Bahan terkini juga ada di pelatih.my.

Kod kursus **CI-KKM-10** · Kementerian Kesihatan Malaysia · Disediakan oleh **RH Dynamic Resources**

Bahan coaching lengkap (nota, lab hands-on, nota penceramah, templat, slaid) untuk membina sistem **CodeIgniter 4** sebenar dengan empat modul:

| # | Modul | Hari | Hasil |
|---|-------|------|-------|
| M1 | **Tempat Letak Kenderaan Khas (TLK)** | 5–6 | Permohonan slot khas, semakan ketersediaan, anti-pertindihan, lulus/tolak |
| M2 | **Pas** | 7–8 | Permohonan pas + dokumen, aliran mohon → semak → lulus/tolak, RBAC, sejarah status |
| M3 | **Laporan** | 9 | 3 laporan bertapis + eksport PDF/Excel |
| M4 | **Statistik** | 10 | Dashboard KPI + carta merentas modul, cache |

Hari 1–3: keperluan, carta alir, acceptance criteria, ERD, wireframe. Hari 4: persekitaran CI4 + migration. Hari 10 ditutup dengan **demo capstone kepada pemilik sistem**.

## Mula di sini

| Anda… | Buka |
|-------|------|
| Jurulatih | [`JADUAL.md`](./JADUAL.md) → `hari-N/nota-penceramah.md` → [`slides/`](./slides/) |
| Peserta | [`docs/persediaan.md`](./docs/persediaan.md) → `hari-N/README.md` → `hari-N/lab.md` |

## Setiap hari mengandungi

| Fail | Isi |
|------|-----|
| `README.md` | 🎯 **Objektif pembelajaran boleh diukur** (ditag S1–S4) · jadual ikut tentatif · nota konsep setiap sesi · hasil hari · semakan kendiri |
| `lab.md` | 🎯 Objektif → Prasyarat → langkah bernombor → ✅ Checkpoint → 🧯 Masalah lazim → ⭐ Cabaran |
| `nota-penceramah.md` | Pecahan masa minit-demi-minit, mesej utama, soalan, salah faham lazim, pelan kejar |

## Apa yang baharu berbanding edisi 15 hari

| Aspek | Edisi lepas (`coach-codeigniter-15-hari-kkm`) | Edisi ini (CI-KKM-10) |
|-------|------------------------------------------------|------------------------|
| Tempoh & skop | 15 hari, Parking + Permit Kerja | **10 hari padat** ikut tentatif, 4 modul (TLK, Pas, Laporan, Statistik) |
| Objektif | Fokus umum per hari | **Objektif boleh diukur per sesi** + semakan kendiri + ✅ checkpoint lab |
| Nota | README ringkas; lab "diperdalam kemudian" | Nota konsep penuh, lab langkah-demi-langkah, nota penceramah, nota topikal `nota/` |
| Stack | CI4 + auth sendiri | **CI 4.6+ · PHP 8.2 enum · Shield (groups/permissions) · Service layer · Entities** |
| Integriti data | Semakan pertindihan dalam controller | **Transaksi + `SELECT … FOR UPDATE`**, jadual `reference_sequences`, satu jadual audit `status_logs` |
| Laporan/Statistik | Sebahagian dashboard modul | **Modul khusus**: 3 laporan + eksport PDF/Excel; dashboard Chart.js + cache + invalidasi |
| Ujian | Disebut | Ujian PHPUnit pertindihan, peralihan status & akses ikut peranan |
| Reka bentuk | Markdown sahaja | **Dek slaid HTML moden** (offline, nota penceramah, mod overview, cetak PDF) + templat dokumen |

## Struktur

```text
SPEC-KURSUS.md  JADUAL.md  KOLABORASI.md  CLAUDE.md
hari-1/ … hari-10/     README.md · lab.md · nota-penceramah.md
nota/                  nota topikal (MVC, migration, model/enum, validasi, transaksi, Shield, upload, laporan, cache, ujian, keselamatan, Git)
templates/dokumen/     URS, acceptance criteria, kamus data, kes ujian, UAT sign-off
templates/kod/         kod rujukan jurulatih (*.php.txt) — kunci jawapan
docs/                  persediaan, tugasan persediaan, pustaka prompt, rubrik capstone, glosari
slides/                ci-kkm-10.html (buka terus dalam pelayar)
```

## Konvensyen

- Prosa **Bahasa Melayu**; kod & istilah teknikal **English**.
- Data **sintetik sahaja** — tiada data KKM sebenar. Tiada rahsia dalam repo.
- Disiplin AI: **faham dahulu, terima kemudian** — lihat [`KOLABORASI.md`](./KOLABORASI.md).

---

*Sumber jadual: Tentatif Kursus CodeIgniter KKM (RH Dynamic Resources). Jadual boleh diselaraskan mengikut keperluan sebenar semasa kursus.*
