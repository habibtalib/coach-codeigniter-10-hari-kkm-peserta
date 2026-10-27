# Tutorial — Figma MCP & Subagent `papan-figjam`: Kemas Kini Papan FigJam dari Claude Code (Windows)

[← Indeks docs](./README.md) · [🤖 Tutorial subagent, skill & MCP](./tutorial-agent-skill-mcp.md) · [👥 Peranan pasukan](./peranan-pasukan.md)

> **Untuk siapa:** semua peserta Hari 8–10 (pasukan Projek dan Dev) yang mahu mengubah papan FigJam kelas — ERD, aliran kerja, papan isu, Cadangan ERD, Retro — dengan prompt Claude Code, bukan dengan tetikus. Papan: pautan daripada jurulatih (isu #19). Rujukan rasmi: <https://developers.figma.com/docs/figma-mcp-server/>.

**Prinsip:** repo `espkpv2` ialah sumber kebenaran (migration, `Config/Aliran.php`, isu GitLab). Papan FigJam ialah salinan kerja untuk berbincang. Figma ialah **perkhidmatan luar**: data sintetik sahaja.

## 1. Prasyarat

- Akaun Figma (percuma) dan akses **edit** ke papan kelas (buka pautan daripada jurulatih, log masuk, pastikan anda boleh menambah sticky).
- Claude Code dalam folder `~/latihan/espkpv2` (Lab 8.20), dengan `main` terkini (`git pull`) supaya subagent `papan-figjam` ada.

## 2. Pasang Figma MCP (sekali)

Dalam Git Bash:

```bash
claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp
```

Nama server **mesti** `figma`: subagent `papan-figjam` menggunakan tool `mcp__figma__*`.

Kemudian dalam `claude`:

1. Taip `/mcp` → pilih `figma` → **Authenticate**.
2. Pelayar dibuka → log masuk Figma → **Allow**.
3. `/mcp` sekali lagi → `figma` ✔ connected.
4. Uji: `Guna tool whoami Figma dan beritahu nama akaun saya.`

## 3. Subagent `papan-figjam`

Fail `.claude/agents/papan-figjam.md` dalam repo menerangkan susun atur papan (nama seksyen dan lorong) dan peraturannya: baca dahulu, satu panggilan tulis, jangan padam kerja orang lain, data sintetik sahaja. Semak: `/agents` → `papan-figjam` (*Project*).

Panggil dengan `Guna subagent papan-figjam untuk …` atau `@agent-papan-figjam …`. Mulakan dalam mod **Plan** untuk melihat apa yang akan diubah, kemudian luluskan.

## 4. Prompt mengikut peranan

**BA / Dev — cadangan ERD sebelum migration:**

```text
Guna subagent papan-figjam. Isu #25: tambah lajur telefon_bimbit VARCHAR(15) NULL pada profil_pengguna. Salin kad profil_pengguna ke lorong "Cadangan (Dev / BA)", tambah baris baharu berwarna kuning, dan tambah sticky "isu #25 · pasangan 2 · BRS §3.2". Satu panggilan tulis sahaja.
```

**QA — semak cadangan (baca sahaja):**

```text
Guna subagent papan-figjam, baca sahaja. Ringkaskan semua kad dan sticky dalam lorong "Disemak Projek" sebagai jadual: isu, jadual, lajur baharu, soalan terbuka.
```

**PM — gerakkan isu di papan:**

```text
Guna subagent papan-figjam. Dalam seksyen "Papan isu", alih sticky "#1 Satu permohonan terbuka" dari lorong "Dev: dalam kerja" ke "Semakan QA / UAT".
```

**Dev — selepas migration di-merge:**

```text
Guna subagent papan-figjam. Migration 2026-10-28-200001_TelefonBimbit.php sudah di-merge ke main. Kemas kini kad profil_pengguna dalam seksyen ERD "Pengguna & keselamatan" supaya sepadan dengan migration itu. Jangan ubah lorong cadangan.
```

**Dev — selepas perubahan aliran kerja:**

```text
Guna subagent papan-figjam. Isu #20 sudah di-merge: pemohon boleh membatalkan TLK selepas lulus. Dalam seksyen "TLK Khas — Pelawat & Ibu Mengandung", tukar anak panah ungu putus-putus 9 → 11 kepada garis merah biasa dan buang perkataan "cadangan" daripada labelnya.
```

**Semua — retro:**

```text
Guna subagent papan-figjam. Tambah satu sticky dalam lorong "Claude Code: membantu / menyusahkan" seksyen Retro: "Dev · /ciri-baharu membantu pecahkan slice; perlu baca diff dengan teliti".
```

## 5. Had penggunaan

Pelan Figma **Starter** (percuma) mempunyai had panggilan tool MCP yang rendah. Jurulatih mencapai had selepas kira-kira 20 panggilan dalam satu sesi. Oleh itu:

- Satu prompt = satu perubahan yang lengkap (subagent menggabungkan tulisan dalam **satu** `use_figma`).
- Minta baca **satu seksyen**, bukan seluruh papan.
- Jika had dicapai: buat perubahan kecil terus di pelayar, atau tunggu.

## 6. Kesilapan lazim

| Gejala | Punca | Penyelesaian |
|---|---|---|
| `/mcp` → `figma` ✘ / *needs authentication* | Belum log masuk atau token tamat | `/mcp` → `figma` → Authenticate semula |
| Subagent berkata tiada tool Figma | Server dinamakan selain `figma` | `claude mcp remove figma` (atau nama lain), pasang semula dengan nama `figma` |
| `You've reached the Figma MCP tool call limit` | Had pelan Starter | Gabungkan prompt, ubah terus di pelayar, atau tunggu |
| `You don't have edit access` | Akaun hanya boleh lihat | Minta pautan edit daripada jurulatih |
| Pelayar tidak kembali ke Claude selepas *Allow* | Pengalihan `localhost` disekat | Salin URL dari bar alamat dan tampal apabila Claude meminta |
| Subagent mahu memadam seksyen | Prompt terlalu umum | Tolak; ulang prompt dengan nama seksyen/lorong yang tepat |

## 7. Keselamatan

- Jangan tampal kandungan dokumen asal KKM (BRS, ERD asal, carta aliran), No. KP sebenar, `.env` atau token ke dalam prompt yang menulis ke Figma.
- Baca pelan subagent sebelum meluluskan tulisan.
- Keputusan tetap dalam isu GitLab; skema tetap dalam migration + `docs/pangkalan-data.md`.
