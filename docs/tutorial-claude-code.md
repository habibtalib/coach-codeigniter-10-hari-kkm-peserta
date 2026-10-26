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

- Windows 10 1809+ atau Windows 11, **64-bit**; Git for Windows (Git Bash) dan VS Code sudah dipasang ([`persediaan.md`](./persediaan.md)).
- **Akaun Claude yang diberi untuk kursus** (Pro, Max, Team, Enterprise atau Console). Pelan percuma claude.ai **tidak** termasuk Claude Code. Tanya jurulatih jika anda belum menerima jemputan.
- Akses Internet ke domain di [§7](#7-rangkaian-kkm-proxy--domain).

**Semakan awal (1 minit), dalam Windows PowerShell:**

```powershell
[Environment]::Is64BitOperatingSystem
curl.exe -sI https://downloads.claude.ai/claude-code-releases/latest
```

- Baris pertama mesti `True`. `False` = Windows 32-bit, Claude Code tidak boleh dipasang; guna komputer lain atau ikut demo jurulatih.
- Baris pertama output `curl.exe` mesti `HTTP/1.1 200 OK`. `403`, tiada output atau *Could not resolve host* = rangkaian menyekat `downloads.claude.ai`: lihat [§7](#7-rangkaian-kkm-proxy--domain) sebelum memasang.
- Gunakan `curl.exe`, bukan `curl`: dalam PowerShell, `curl` ialah alias `Invoke-WebRequest`.

## 2. Pasang

Pilih **satu** kaedah. Tetingkap pentadbir (*Run as administrator*) **tidak** perlu.

**A. Windows PowerShell (disyorkan).** Tekan **Start**, taip `PowerShell`, buka **Windows PowerShell**. **Jangan** pilih *Windows PowerShell (x86)*: ia proses 32-bit dan pemasang menolaknya. Prompt bermula dengan `PS C:\`.

```powershell
irm https://claude.ai/install.ps1 | iex
```

**B. Command Prompt (CMD).** Jika PowerShell disekat oleh unit ICT. Prompt `C:\` tanpa `PS`:

```bat
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

**C. WinGet.** Jika skrip pemasang disekat tetapi Microsoft Store/WinGet dibenarkan:

```powershell
winget install Anthropic.ClaudeCode
```

WinGet **tidak** mengemas kini secara automatik: jalankan `winget upgrade Anthropic.ClaudeCode` sekali-sekala.

Selepas memasang:

1. Pemasang **tidak** memaparkan kemajuan semasa memuat turun. Tunggu sehingga prompt kembali (1–3 minit).
2. Kaedah A dan B memasang `claude.exe` ke `%USERPROFILE%\.local\bin` dan mengemas kininya secara automatik di latar belakang.
3. Tutup **semua** tetingkap VS Code dan terminal, kemudian buka semula supaya `PATH` baharu dibaca. Terminal dalam VS Code mewarisi `PATH` daripada VS Code, jadi VS Code sendiri mesti ditutup.

> ⚠️ **Kesilapan lazim:** menjalankan arahan Mac/Linux `curl -fsSL https://claude.ai/install.sh | bash` dalam Windows. Ralatnya `A parameter cannot be found that matches parameter name 'fsSL'` atau `'bash' is not recognized`. Guna kaedah A, B atau C di atas.

**Pilihan tanpa terminal:** aplikasi **Claude Desktop** untuk Windows (<https://claude.com/download>) mempunyai tab *Code* yang menjalankan Claude Code. Lab kursus menggunakan terminal, jadi guna Desktop hanya jika pemasangan terminal gagal dan jurulatih bersetuju.

## 3. Sahkan

Dalam terminal **Git Bash** VS Code:

```bash
claude --version     # cth 2.1.x (Claude Code)
claude doctor        # semakan pemasangan & tetapan; ikut cadangan jika ada amaran
```

**`claude` tidak dijumpai?** Pemasangan berjaya tetapi folder `%USERPROFILE%\.local\bin` belum ada dalam `PATH`. Dalam Windows PowerShell:

```powershell
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
```

`False` = belum dipasang: ulang §2. `True` = fail ada, tambah folder itu ke `PATH` pengguna (sekali sahaja, kekal):

```powershell
$p = [Environment]::GetEnvironmentVariable('PATH', 'User')
[Environment]::SetEnvironmentVariable('PATH', "$p;$env:USERPROFILE\.local\bin", 'User')
```

Tutup semua VS Code dan terminal, buka semula, jalankan `claude --version` sekali lagi.

**Shell yang digunakan Claude Code.** Dengan Git for Windows, Claude Code menjalankan arahan melalui **Git Bash**; tanpanya, ia menggunakan PowerShell. Kursus ini menggunakan Git Bash. Jika `claude doctor` melaporkan Git Bash tidak dijumpai (Git dipasang di luar `C:\Program Files\Git`), cari lokasinya dengan `where.exe git` dalam PowerShell, kemudian tambah dalam `%USERPROFILE%\.claude\settings.json` (namakan fail `bash.exe`, bukan `git-bash.exe`):

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


Log masuk gagal tanpa sebab yang jelas? `/logout`, tutup Claude Code, jalankan `claude` semula dan log masuk sekali lagi. Ralat `OAuth error: Invalid code` bermaksud kod tamat atau terpotong semasa disalin: tekan `Enter` dan selesaikan log masuk dengan cepat.

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

Prompting untuk projek sedia ada, projek baharu dan PRD: [`tutorial-prompt-projek.md`](./tutorial-prompt-projek.md) (Hari 7 S12).

## 7. Rangkaian KKM: proxy & domain

Jika `claude` tergantung atau log masuk gagal di rangkaian pejabat, minta IT membenarkan domain ini (HTTPS 443):

| Domain | Untuk |
|--------|-------|
| `api.anthropic.com` | Model & semakan |
| `claude.ai`, `claude.com` | Log masuk |
| `platform.claude.com` | Log masuk Console & token |
| `downloads.claude.ai` | Pemasang & kemas kini automatik |
| `code.claude.com` | Dokumentasi terbina |
| `sso.claude.com` | Log masuk organisasi yang menggunakan SSO |
| `registry.npmjs.org` | Server MCP yang dilancar dengan `npx` (Lab 7.8) |

Rangkaian menggunakan proxy? Tambah dalam `%USERPROFILE%\.claude\settings.json` (alamat daripada IT), kemudian buka semula `claude`:

```json
{
  "env": {
    "HTTPS_PROXY": "http://proxy.contoh.gov.my:8080"
  }
}
```

Semak dengan `/status` (baris *Proxy*). Proxy SOCKS tidak disokong.

**Proxy dengan pemeriksaan TLS** (ralat `unable to get local issuer certificate` atau `SELF_SIGNED_CERT_IN_CHAIN`): Claude Code yang dipasang dengan kaedah A/B mempercayai stor sijil Windows secara lalai, jadi minta IT memasang sijil CA proxy dalam stor Windows. Jika IT memberi fail sijil `.pem`, tambah dalam `env` fail yang sama: `"NODE_EXTRA_CA_CERTS": "C:\\laluan\\ca-korporat.pem"`.

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
| `claude` tidak dijumpai walaupun pemasangan berjaya | `%USERPROFILE%\.local\bin` tiada dalam `PATH` | §3 — `Test-Path` kemudian tambah ke `PATH` pengguna |
| `Claude Code does not support 32-bit Windows` | Dibuka *Windows PowerShell (x86)* | Buka *Windows PowerShell* tanpa (x86); semak `[Environment]::Is64BitOperatingSystem` |
| `A parameter cannot be found that matches parameter name 'fsSL'` | Arahan Mac/Linux dijalankan dalam PowerShell | §2 kaedah A |
| `The token '&&' is not a valid statement separator` | Arahan CMD dijalankan dalam PowerShell | §2 kaedah A, atau buka Command Prompt untuk kaedah B |
| `Could not create SSL/TLS secure channel` | Windows PowerShell 5.1 tanpa TLS 1.2 | Jalankan `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`, kemudian arahan §2 A dalam tetingkap yang sama |
| `CRYPT_E_NO_REVOCATION_CHECK` atau `CRYPT_E_REVOCATION_OFFLINE` (kaedah B) | Firewall menyekat semakan pembatalan sijil | Tambah `--ssl-revoke-best-effort` pada `curl` kaedah B, atau guna kaedah A |
| Ralat berisi HTML, `403` atau `System.Xml.XmlDocument` semasa memasang | Rangkaian/proxy memulangkan halaman sekatan | §1 semakan `curl.exe`; §7; atau kaedah C (WinGet) |
| `The process cannot access the file … being used by another process` | Pemasangan sebelumnya masih berjalan | Tutup semua tetingkap `claude`, cuba semula |
| `API Error: 403` selepas log masuk | Langganan tidak aktif atau proxy | Semak akaun di <https://claude.ai/settings>; §7 |
| `claude doctor`: Git Bash tidak dijumpai | Git di lokasi bukan lalai | §3 — `CLAUDE_CODE_GIT_BASH_PATH` |

## ✅ Senarai semak

- [ ] `claude --version` mencetak versi dan `claude doctor` tiada ralat.
- [ ] `/status` menunjukkan akaun kursus anda.
- [ ] `.claude/settings.json` (§5) wujud dalam `kelas-ci-<nama>`; `/permissions` menunjukkan 4 peraturan *Deny*.
- [ ] `.gitignore` mengandungi `.claude/settings.local.json`.

Uninstall (jika perlu): `Remove-Item "$env:USERPROFILE\.local\bin\claude.exe"` dan `Remove-Item -Recurse "$env:USERPROFILE\.local\share\claude"` dalam PowerShell. Rujukan rasmi: <https://code.claude.com/docs/en/setup>.
