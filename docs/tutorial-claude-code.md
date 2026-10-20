# Tutorial — Persediaan Claude Code (Windows)

[📘 SPEC](./spesifikasi-sistem.md) · [🤖 Pustaka prompt](./pustaka-prompt.md) · [🤝 Kolaborasi](./kolaborasi.md)

> **Bila:** siapkan **sebelum Hari 6**. [Lab 6.3c](../hari-6/lab.md#lab-63c--claude-code-cadang-ujian-semak-dengan-larian-s7) menggunakan Claude Code dalam projek `kelas-ci-<nama>` anda. Tempoh: 20–30 minit.
>
> **Peranan Claude Code dalam kursus ini:** penjelas dan penyemak, **bukan** penjana modul ([`kolaborasi.md`](./kolaborasi.md) §3). Anda mesti boleh menerangkan setiap baris yang di-commit.

## 🎯 Objektif

- **Memasang** Claude Code pada Windows dan **mengesahkannya** dengan `claude --version` dan `claude doctor`.
- **Log masuk** dengan akaun kursus dan **menyemak** akaun dengan `/status`.
- **Mengkonfigur** `.claude/settings.json` projek supaya Claude Code tidak boleh membaca `.env` dan fail muat naik.
- **Menggunakan** mod *Plan*, `Esc`, `@fail` dan `!arahan` dengan selamat.

## 🛡️ Peraturan data (baca dahulu)

| Boleh | Tidak boleh |
|-------|-------------|
| Projek latihan `kelas-ci-<nama>` dengan data sintetik (`@latihan.test`, plat `WXX 1234`) | Kod atau pangkalan data eSPKP, atau mana-mana sistem KKM sebenar |
| Mesej ralat, fail kod anda sendiri, output `composer test` | `.env`, kata laluan, token GitLab, Personal Access Token |
| Soalan konsep ("kenapa `FOR UPDATE`?") | Data peribadi sebenar (nama, No. KP, e-mel, telefon) |

Semua yang anda taip, dan setiap fail yang Claude Code baca, dihantar ke server Anthropic. Dasar data: <https://code.claude.com/docs/en/data-usage>.

## 1. Prasyarat

- Windows 10 1809+ atau Windows 11; Git for Windows (Git Bash) dan VS Code sudah dipasang ([`persediaan.md`](./persediaan.md)).
- **Akaun Claude yang diberi untuk kursus** (Pro, Max, Team, Enterprise atau Console). Pelan percuma claude.ai **tidak** termasuk Claude Code. Tanya jurulatih jika anda belum menerima jemputan.
- Akses Internet ke domain di [§7](#7-rangkaian-kkm-proxy--domain).

## 2. Pasang

Claude Code dipasang dari **PowerShell** (bukan Git Bash). Tetingkap pentadbir tidak perlu.

1. Tekan **Start**, taip `PowerShell`, buka **Windows PowerShell**.
2. Jalankan:

   ```powershell
   irm https://claude.ai/install.ps1 | iex
   ```

   Pemasang memuat turun `claude.exe` ke `%USERPROFILE%\.local\bin` dan mengemas kininya secara automatik di latar belakang.

3. Tutup **semua** tetingkap VS Code dan terminal, kemudian buka semula (supaya `PATH` baharu dibaca).

Ralat lazim: `'irm' is not recognized` → anda berada dalam Command Prompt, bukan PowerShell.

## 3. Sahkan

Dalam terminal **Git Bash** VS Code:

```bash
claude --version     # cth 2.1.x (Claude Code)
claude doctor        # semakan pemasangan & tetapan; ikut cadangan jika ada amaran
```

Claude Code menggunakan Git Bash untuk arahan shell. Jika `claude doctor` melaporkan Git Bash tidak dijumpai, tambah dalam `%USERPROFILE%\.claude\settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

## 4. Log masuk

```bash
cd ~/latihan/kelas-ci-<nama>
claude
```

1. Pada larian pertama, pelayar dibuka ke halaman log masuk. Pilih jenis akaun yang diberi jurulatih dan log masuk. Pelayar tidak dibuka? Tekan `c` untuk menyalin URL, tampal dalam pelayar.
2. Terminal memaparkan `Login successful`.
3. Taip `/status` → baris akaun menunjukkan e-mel anda. Taip `/exit` (atau `Ctrl+C` dua kali) untuk keluar.

| Arahan | Fungsi |
|--------|--------|
| `/login` | Log masuk atau tukar akaun |
| `/logout` | Log keluar |
| `/status` | Versi, model, akaun, sambungan |

## 5. Tetapan projek: sekat `.env`

Cipta fail ini dalam akar projek `kelas-ci-<nama>`. Ia di-commit supaya peraturan yang sama terpakai setiap kali.

`.claude/settings.json`

```json
{
  "permissions": {
    "defaultMode": "default",
    "deny": [
      "Read(./.env)",
      "Read(./writable/uploads/**)",
      "Read(./writable/session/**)",
      "Read(./writable/logs/**)"
    ]
  }
}
```

- `defaultMode: "default"` (dipaparkan sebagai **Manual**): Claude Code **bertanya** sebelum setiap edit fail dan setiap arahan shell.
- Peraturan `deny` `Read(...)` juga menyekat edit pada fail yang sama, dan arahan seperti `cat .env`. Ia **tidak** menyekat skrip yang anda tulis sendiri — jadi jangan luluskan arahan yang anda tidak faham.
- Pilihan "Yes, and don't ask again" menyimpan kebenaran dalam `.claude/settings.local.json` (peribadi). Jangan commit fail itu:

```bash
echo ".claude/settings.local.json" >> .gitignore
```

Semak dengan `/permissions` dalam Claude Code: tab *Deny* menyenaraikan empat peraturan di atas.

## 6. Asas penggunaan

| Kekunci / arahan | Fungsi |
|------------------|--------|
| `Shift+Tab` | Tukar mod: **Manual** → *accept edits* → **Plan**. Jika tidak berfungsi di Windows: `Alt+M` |
| Mod **Plan** | Claude Code membaca dan mencadang sahaja — tiada fail diubah. Guna untuk soalan & semakan |
| `Esc` | Hentikan jawapan yang sedang berjalan |
| `@app/Services/BookingService.php` | Rujuk fail tertentu dalam prompt |
| `!composer test -- --no-coverage tests/tlk` | Jalankan arahan terus; output masuk ke perbualan |
| `/init` | Cipta `CLAUDE.md` — ringkasan projek yang dibaca pada setiap sesi |
| `/clear` | Mula perbualan baharu (perbualan panjang = jawapan kurang tepat) |
| `/usage` | Penggunaan sesi & had pelan |

**Jangan** guna mod *accept edits*, *auto* atau *bypass permissions* dalam kursus ini. Apabila Claude Code meminta kebenaran mengubah fail, baca *diff* dahulu; tolak (`No`) jika anda tidak faham.

Prompt kursus ada dalam [`pustaka-prompt.md`](./pustaka-prompt.md): **AI-01** (terang ralat), **AI-02** (terang kod baris demi baris), **AI-09** (cadang kes ujian), **AI-05** (semak terhadap BR).

## 7. Rangkaian KKM: proxy & domain

Jika `claude` tergantung atau log masuk gagal di rangkaian pejabat, minta IT membenarkan domain ini (HTTPS 443):

| Domain | Untuk |
|--------|-------|
| `api.anthropic.com` | Model & semakan |
| `claude.ai`, `claude.com` | Log masuk |
| `platform.claude.com` | Log masuk Console & token |
| `downloads.claude.ai` | Pemasang & kemas kini automatik |
| `code.claude.com` | Dokumentasi terbina |

Rangkaian menggunakan proxy? Tambah dalam `%USERPROFILE%\.claude\settings.json` (alamat daripada IT), kemudian buka semula `claude`:

```json
{
  "env": {
    "HTTPS_PROXY": "http://proxy.contoh.gov.my:8080"
  }
}
```

Semak dengan `/status` (baris *Proxy*). Proxy SOCKS tidak disokong.

## 8. Sambungan VS Code (pilihan)

*Extensions* (`Ctrl+Shift+X`) → cari **Claude Code** (penerbit Anthropic) → *Install*. Buka: `Ctrl+Shift+P` → *Claude Code: Open in New Tab*. Pilih baris dalam editor dan tekan `Alt+K` untuk merujuknya dalam prompt. Tetapan `.claude/settings.json` yang sama terpakai.

## 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `claude: command not found` dalam Git Bash | Terminal dibuka sebelum pemasangan | Tutup semua tetingkap VS Code, buka semula; semak `ls ~/.local/bin/claude.exe` |
| `'irm' is not recognized` | Arahan dijalankan dalam Command Prompt | Guna Windows PowerShell |
| Log masuk: *Claude Code is not included in your plan* | Akaun percuma claude.ai | Guna akaun kursus daripada jurulatih |
| `Shift+Tab` tidak menukar mod | Terminal tanpa mod input VT | `Alt+M` |
| `/status` → `Login: Expired` | Sesi log masuk tamat | `/login` |
| Tergantung pada *Connecting…* | Proxy/firewall pejabat | §7 — domain & `HTTPS_PROXY` |
| Claude Code membaca `.env` | `.claude/settings.json` tiada atau JSON tidak sah | `claude doctor` melaporkan ralat tetapan; betulkan fail §5 |

## ✅ Senarai semak

- [ ] `claude --version` mencetak versi dan `claude doctor` tiada ralat.
- [ ] `/status` menunjukkan akaun kursus anda.
- [ ] `.claude/settings.json` (§5) wujud dalam `kelas-ci-<nama>`; `/permissions` menunjukkan 4 peraturan *Deny*.
- [ ] `.gitignore` mengandungi `.claude/settings.local.json`.

Uninstall (jika perlu): `Remove-Item "$env:USERPROFILE\.local\bin\claude.exe"` dan `Remove-Item -Recurse "$env:USERPROFILE\.local\share\claude"` dalam PowerShell. Rujukan rasmi: <https://code.claude.com/docs/en/setup>.
