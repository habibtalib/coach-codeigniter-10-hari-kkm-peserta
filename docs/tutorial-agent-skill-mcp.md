# Tutorial — Menyediakan Subagent, Skill & MCP dalam Claude Code (Windows)

[← Indeks docs](./README.md) · [🤖 Tutorial Claude Code](./tutorial-claude-code.md) · [💬 Pustaka prompt](./pustaka-prompt.md)

> **Untuk siapa:** peserta yang sudah memasang Claude Code ([`tutorial-claude-code.md`](./tutorial-claude-code.md)) dan mahu memahami cara **menyediakan** subagent, skill dan server MCP dalam projek `kelas-ci-<nama>`. Lab berkaitan: **Lab 7.7** (subagent & skill) dan **Lab 7.8** (MCP), Hari 7. Rujukan rasmi: <https://code.claude.com/docs/en/sub-agents>, <https://code.claude.com/docs/en/skills>, <https://code.claude.com/docs/en/mcp>.

## 🧭 Bila guna apa

| Alat | Apa | Dimuat bila | Contoh kursus |
|------|-----|-------------|---------------|
| `CLAUDE.md` | Peraturan & konteks projek | Setiap sesi, sentiasa | Stack, arahan, peraturan data |
| **Skill** | Arahan/prosedur boleh guna semula | Apabila `description` sepadan dengan tugas, atau `/nama-skill` | `migration-ci4`, `perancangan-ci4` |
| **Subagent** | Pembantu khusus dengan konteks & tool sendiri | Apabila Claude mewakilkan tugas, atau anda minta | `semak-ci4` (baca sahaja), Explore terbina |
| **MCP** | Sambungan ke alat/data luar | Tool server tersedia dalam sesi | `ci4-spark`, Context7, MySQL, GitLab |

Petua: **peraturan** → `CLAUDE.md`; **prosedur berulang** → skill; **tugas berasingan yang menghasilkan output panjang** (semakan, carian) → subagent; **data atau alat di luar fail projek** → MCP.

## 1. Subagent

### 1.1 Lokasi fail

| Lokasi | Skop |
|--------|------|
| `.claude/agents/<nama>.md` | Projek ini — commit untuk dikongsi |
| `~/.claude/agents/<nama>.md` | Semua projek anda di komputer ini |

Jika nama sama, fail projek mengatasi fail pengguna. Folder `agents` yang **baru dicipta** perlukan `claude` dimulakan semula sekali; selepas itu perubahan fail dikesan dalam beberapa saat.

### 1.2 Format fail

```markdown
---
name: semak-ci4
description: Penyemak keselamatan CodeIgniter 4 (BACA SAHAJA). Guna selepas menulis atau mengubah controller, view, model, route atau filter.
tools: Read, Grep, Glob
model: sonnet
---

Anda penyemak keselamatan CodeIgniter 4 + Shield. Anda TIDAK mengubah fail.
Laporkan dapatan sebagai jadual: Fail:baris | Kategori | Keterukan | Dapatan | Cadangan.
```

| Medan | Wajib | Maksud |
|-------|-------|--------|
| `name` | Ya | Pengenal unik (huruf kecil, sengkang; tiada `:`) |
| `description` | Ya | **Bila** Claude patut mewakilkan kepadanya. Tulis kegunaan utama dahulu; frasa "guna secara proaktif" menggalakkan penggunaan automatik |
| `tools` | Tidak | Senarai tool yang dibenarkan. Tiada = warisi semua. `Read, Grep, Glob` = baca sahaja |
| `disallowedTools` | Tidak | Tool yang dibuang daripada senarai |
| `model` | Tidak | `sonnet`, `opus`, `haiku`, ID model penuh, atau `inherit` |
| `permissionMode` | Tidak | Mod kebenaran subagent (cth `plan`). Dalam kursus: jangan guna `bypassPermissions` atau `acceptEdits` |
| `color` | Tidak | Warna label dalam terminal |

Badan fail (selepas `---`) ialah *system prompt* subagent: peranan, langkah, format jawapan.

### 1.3 Subagent terbina

| Nama | Kegunaan |
|------|----------|
| **Explore** | Mencari & menganalisis kod, baca sahaja (tiada Write/Edit). Sesuai untuk memahami projek baharu |
| **Plan** | Menyelidik konteks dalam mod *Plan* sebelum pelan dibentangkan |
| **General-purpose** | Tugas berbilang langkah yang perlu meneroka **dan** bertindak |

### 1.4 Memanggil subagent

- **Bahasa biasa:** `Guna subagent semak-ci4 untuk menyemak app/Controllers/Tlk.`
- **@-mention:** taip `@agent-semak-ci4 semak app/Views/tlk`.
- **Automatik:** Claude memilih berdasarkan `description` dan tugas.
- `/agents` — panduan mengurus subagent (versi terkini mengarahkan anda mengedit `.claude/agents/` terus).

## 2. Skill

### 2.1 Lokasi fail

| Lokasi | Skop |
|--------|------|
| `.claude/skills/<nama>/SKILL.md` | Projek ini — commit untuk dikongsi |
| `~/.claude/skills/<nama>/SKILL.md` | Semua projek anda |

Skill ialah **folder**; `SKILL.md` wajib, fail sokongan (contoh, rujukan, skrip) pilihan dan dirujuk dari `SKILL.md`. Fail lama `.claude/commands/<nama>.md` masih berfungsi sebagai `/nama`, tetapi guna skill untuk kerja baharu.

### 2.2 Format `SKILL.md`

```markdown
---
name: migration-ci4
description: Konvensyen migration & seeder kursus CI-KKM-10. Guna apabila menulis, mendraf atau menyemak migration, seeder atau perubahan skema.
argument-hint: "[nama jadual]"
---

Ikut konvensyen ini. Jadual sasaran: $ARGUMENTS
- id INT unsigned auto_increment; FK sama jenis dengan induk.
- createTable('nama', true) / dropTable('nama', true).
- JANGAN jalankan php spark migrate — cetak arahan untuk peserta.
```

| Medan | Maksud |
|-------|--------|
| `name` | Nama dalam menu `/` (lalai: nama folder) |
| `description` | **Kegunaan utama dahulu** — Claude memutuskan bila memuatkan skill berdasarkan teks ini |
| `argument-hint` | Petunjuk argumen untuk `/nama-skill …` |
| `disable-model-invocation: true` | Hanya dipanggil melalui `/nama` (sesuai untuk tindakan berkesan sampingan: commit, deploy) |
| `user-invocable: false` | Disembunyikan daripada menu `/`; hanya Claude memuatkannya |
| `allowed-tools` | Tool yang boleh digunakan tanpa bertanya semasa giliran itu — guna dengan berhati-hati |

Pemboleh ubah dalam badan: `$ARGUMENTS` (semua argumen), `$0`, `$1` (mengikut kedudukan).

### 2.3 Memuat & menguji

- **Automatik:** minta tugas yang sepadan dengan `description` (cth "draf migration untuk jadual X").
- **Manual:** `/migration-ci4 vehicle_notes`.
- Perubahan `SKILL.md` dikesan tanpa mula semula. Folder `skills` yang **baru dicipta** selepas `claude` dimulakan → taip `/reload-skills`.
- Simpan `SKILL.md` di bawah ~500 baris; uji dalam sesi baharu (`/clear`).

## 3. MCP (Model Context Protocol)

### 3.1 Jenis sambungan

| Jenis | Bila | Contoh |
|-------|------|--------|
| `stdio` | Program tempatan yang dijalankan oleh Claude Code | `ci4-spark` (PHP), MySQL (`npx`) |
| `http` | Server jauh | Context7, GitLab |

### 3.2 Skop

| Skop | Disimpan dalam | Dikongsi melalui Git | Guna untuk |
|------|----------------|----------------------|------------|
| `local` (lalai) | `~/.claude.json` | Tidak | Server dengan kelayakan peribadi (MySQL, GitLab) |
| `project` | `.mcp.json` di akar projek | Ya | Server tanpa rahsia yang semua orang perlukan (`ci4-spark`, Context7) |
| `user` | `~/.claude.json` | Tidak | Server untuk semua projek anda |

### 3.3 Arahan (Git Bash, di luar sesi `claude`)

```bash
# stdio — semua selepas -- ialah arahan server
claude mcp add --scope project ci4-spark -- php tools/ci4-spark-mcp.php

# http — server jauh
claude mcp add --transport http --scope project context7 https://mcp.context7.com/mcp

# pemboleh ubah persekitaran untuk server (letak pilihan lain antara --env dan nama)
claude mcp add --env MYSQL_USER=claude_ro --transport stdio --scope local mysql -- npx -y @benborla29/mcp-server-mysql

claude mcp list          # senarai & status (✔ Connected)
claude mcp get ci4-spark # butiran satu server
claude mcp remove mysql  # buang
```

Dalam sesi `claude`: **`/mcp`** — status, pengesahan OAuth, hidup/matikan server. Server daripada `.mcp.json` projek perlu **diluluskan** sekali apabila `claude` dimulakan.

### 3.4 `.mcp.json` tanpa rahsia

```json
{
  "mcpServers": {
    "ci4-spark": { "type": "stdio", "command": "php", "args": ["tools/ci4-spark-mcp.php"] },
    "context7": { "type": "http", "url": "https://mcp.context7.com/mcp" }
  }
}
```

Rahsia **tidak** ditulis dalam `.mcp.json`. Gunakan `${PEMBOLEH_UBAH}` (atau `${VAR:-lalai}`) dan tetapkan nilai dalam persekitaran anda, atau daftar server berkelayakan dengan skop `local`.

### 3.5 Keselamatan MCP

- Sambung hanya server yang anda percaya; output server yang mengambil kandungan luar boleh membawa *prompt injection*.
- Tool baca sahaja dahulu (`ci4-spark` tidak mendedahkan `migrate`/`db:seed`; pengguna MySQL `claude_ro` SELECT sahaja).
- Jangan sekali-kali sambung ke database atau sistem KKM/eSPKP sebenar — data sintetik sahaja.

## 4. Semakan pantas (selepas menyediakan)

| Semak | Arahan / tindakan | Jangkaan |
|-------|-------------------|----------|
| Subagent dikesan | Minta: `Guna subagent semak-ci4 untuk menyemak app/Config/Routes.php` | Baris `semak-ci4` muncul, kemudian jadual dapatan |
| Skill dikesan | Taip `/mig` dalam `claude` | `/migration-ci4` dalam senarai |
| MCP bersambung | `claude mcp list` | `✔ Connected` bagi setiap server |
| Tool MCP digunakan | `Guna tool ci4-spark routes dan senaraikan route /tlk` | Panggilan tool `ci4-spark` dipaparkan, kemudian jawapan |

## 🧯 Masalah lazim (Windows)

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Subagent baharu tidak digunakan | Folder `.claude/agents` baru dicipta | `/exit`, mulakan `claude` semula sekali |
| Skill tidak muncul dalam `/` | Folder `skills` baru dicipta selepas sesi bermula | `/reload-skills` |
| Skill tidak dimuat automatik | `description` terlalu umum | Tulis kegunaan utama dahulu, dengan kata kunci tugas sebenar |
| `claude mcp list`: gagal bersambung (`ci4-spark`) | `php` tiada dalam PATH sesi | Semak `php -v` dalam Git Bash; guna laluan penuh `php.exe` Laragon dalam arahan `--` |
| Server `npx` gagal dimulakan | Node tiada / terlalu lama | `node -v` (Laragon Full); jika masih gagal, cuba `cmd /c npx …` sebagai arahan server |
| `--` hilang dalam PowerShell lama | PowerShell menelan `--` | Jalankan `claude mcp add` dalam Git Bash, atau tulis `.mcp.json` sendiri |
| Server `.mcp.json` tidak dimuat | Belum diluluskan | Mulakan `claude`, luluskan; `claude mcp reset-project-choices` untuk tanya semula |
| Nama server ditolak selepas `--env` | CLI membaca nama sebagai `KEY=value` | Letak `--transport stdio` antara `--env …` dan nama server |

## ✅ Senarai semak

- [ ] Subagent `semak-ci4` dalam `.claude/agents/` dan dipanggil sekali dengan jayanya.
- [ ] Skill `migration-ci4` dalam `.claude/skills/migration-ci4/SKILL.md` dan dimuat (automatik atau `/migration-ci4`).
- [ ] `claude mcp list` menunjukkan `ci4-spark` dan `context7` bersambung; `.mcp.json` di-commit tanpa rahsia.
