# Tutorial — Jira Cloud & MCP `atlassian`: Backlog dan Sprint dari Claude Code (Windows)

[← Indeks docs](./README.md) · [🤖 Tutorial subagent, skill & MCP](./tutorial-agent-skill-mcp.md) · [👥 Peranan pasukan](./peranan-pasukan.md) · [🎨 Figma MCP](./tutorial-figma-mcp.md)

> **Untuk siapa:** pemegang kerusi Jira Hari 9–10 (pasukan Projek dan seorang daripada setiap pasangan Dev). Mulai Hari 9, **backlog ada dalam Jira** (story, AC, sprint, papan, versi `v1.1.0`) dan **kod kekal di GitLab** (branch, commit, MR, CI). Site Jira: pautan daripada jurulatih (isu #19), space `KAN`. Rujukan rasmi: <https://support.atlassian.com/atlassian-rovo-mcp-server/>.

**Prinsip:** satu kad Jira = satu story atau pepijat. Kunci Jira (`KAN-14`) muncul dalam nama branch, commit dan tajuk MR, jadi sesiapa boleh mengesan kad → kod → MR. Isu GitLab KKM #1–#33 kekal sebagai rujukan BRS dan ditutup oleh MR seperti biasa. Jira Cloud ialah **perkhidmatan luar**: data sintetik sahaja.

## 1. Prasyarat

- Jira Free: **10 kerusi** — jurulatih, PM, BA, 2 QA, seorang daripada setiap pasangan Dev dan floater. Rakan pasangan bekerja dalam sesi Claude yang sama (pemandu/navigator), jadi satu log masuk MCP setiap pasangan sudah cukup.
- Emel jemputan Jira daripada jurulatih → **Accept invitation** → log masuk (akaun Atlassian percuma, emel yang dijemput). Buka space `KAN` dan pastikan anda nampak papan sprint.
- Claude Code dalam folder `~/latihan/espkpv2`, dengan `main` terkini (`git switch main && git pull`) supaya `.mcp.json` mengandungi server `atlassian` dan skill `isu-baharu` / `semak-mr` membaca Jira.

## 2. Sambung MCP `atlassian` (sekali)

Server sudah didaftar dalam `.mcp.json` repo (skop *project*, tiada token). Dalam Git Bash:

```bash
cd ~/latihan/espkpv2
git switch main && git pull
claude
```

Dalam `claude`:

1. Apabila ditanya, **luluskan** server `atlassian` daripada `.mcp.json`.
2. Taip `/mcp` → pilih `atlassian` → **Authenticate**.
3. Pelayar dibuka → log masuk Atlassian dengan emel yang dijemput → pilih site kelas → **Accept**.
4. `/mcp` sekali lagi → `atlassian` ✔ connected.
5. Uji (mod *Plan*): `Senaraikan site dan space Jira yang saya boleh lihat.` Jawapan mesti menyebut space `KAN`.

Tool baca (`getJiraIssue`, `searchJiraIssuesUsingJql`, `getVisibleJiraProjects`, `getTransitionsForJiraIssue`) dibenarkan dalam `.claude/settings.json`. Tool tulis (`createJiraIssue`, `editJiraIssue`, `transitionJiraIssue`, `addCommentToJiraIssue`) **ditanya setiap kali**: baca medan yang akan dihantar sebelum menjawab *Yes*.

## 3. Konvensyen kunci Jira

| Tempat | Format | Contoh |
|---|---|---|
| Branch | `feat/KAN-<n>-<ringkas>` (`fix/…` untuk pepijat) | `feat/KAN-14-peringatan` |
| Commit | baris akhir `Rujuk KAN-<n>` | `Rujuk KAN-14` |
| Tajuk MR | `KAN-<n>: <ringkasan>` | `KAN-14: peringatan pindaan > 7 hari` |
| Penerangan MR | `Jira: KAN-<n>` + `Closes #N` jika ada isu GitLab KKM | `Jira: KAN-14` · `Closes #13` |

Status papan: **Idea (belum ada AC) → To Do → In Progress → Testing (semakan QA) → Done**. Disekat = label `disekat` + bendera (*flag*). Pasangan: label `pasangan-1`…`pasangan-4`; pasukan yang bertindak sekarang: `pasukan-projek` / `pasukan-dev`.

## 4. Prompt mengikut peranan

**PM — ringkasan sprint:**

```text
Guna Jira (MCP atlassian). JQL: project = KAN AND sprint in openSprints() ORDER BY status. Ringkaskan sebagai jadual: kunci, ringkasan, status, pasangan, assignee, label disekat. Baca sahaja.
```

**PM — serah kepada Dev (tulis, selepas ya):**

```text
KAN-14 sudah ada AC dan pelan ujian. Cadangkan perubahan: label pasukan-dev dan pasangan-1, assignee ahli pertama pasangan 1. Tunjukkan medan dahulu; hantar hanya selepas saya kata ya.
```

**BA — story dan AC:**

```text
/isu-baharu KAN-21
```

**QA — pelan ujian daripada AC:**

```text
Baca AC KAN-14 (getJiraIssue). Draf jadual AC → kes ujian (akaun 9001010100NN, langkah, hasil dijangka) untuk komen Jira. Jangan hantar lagi.
```

**Dev — mula kerja:**

```text
Baca KAN-14 dan senaraikan AC dan fail panas yang disebut. Kemudian cadangkan nama branch ikut CONTRIBUTING.md dan transition ke In Progress. Tunggu ya saya sebelum transition.
```

**QA — semak MR:**

```text
/semak-mr 12
```

**Semua — pepijat daripada ujian eksploratori:**

```text
Draf work item Bug untuk KAN daripada pemerhatian ini: <langkah, jangkaan, sebenar, akaun>. Data sintetik sahaja. Tunjukkan medan; cipta hanya selepas saya kata ya.
```

## 5. Had dan tingkah laku

- Setiap panggilan tool memerlukan `cloudId`; Claude mencarinya dengan `getAccessibleAtlassianResources` pada panggilan pertama.
- MCP hanya melihat apa yang akaun anda boleh lihat dalam Jira. Tiada akses → jemputan belum diterima.
- Satu prompt, satu tujuan. Untuk perubahan pukal (banyak kad), PM buat di pelayar (*bulk change*).
- Papan Jira ialah paparan; peraturan kod kekal dalam repo (`docs/pasukan.md`, `CONTRIBUTING.md`).

## 6. Kesilapan lazim

| Gejala | Punca | Penyelesaian |
|---|---|---|
| `/mcp` tidak menunjukkan `atlassian` | `main` setempat belum dikemas kini, atau server belum diluluskan | `git pull`, mulakan semula `claude`; `claude mcp reset-project-choices` |
| `atlassian` → *needs authentication* | Belum log masuk atau sesi tamat | `/mcp` → `atlassian` → Authenticate semula |
| Space `KAN` tiada dalam senarai | Jemputan belum diterima, atau log masuk dengan emel lain | Terima jemputan dalam emel; log keluar Atlassian di pelayar, Authenticate semula dengan emel yang dijemput |
| `transitionJiraIssue` gagal: status tiada | Nama status berbeza pada papan | `Senaraikan transition yang dibenarkan untuk KAN-14` (getTransitionsForJiraIssue), kemudian pilih |
| Claude mahu mencipta banyak kad sekali gus | Prompt terlalu umum | Tolak; satu kad setiap prompt, baca medan dahulu |
| Pelayar tidak kembali ke Claude selepas *Accept* | Pengalihan `localhost` disekat | Salin URL dari bar alamat dan tampal apabila Claude meminta |

## 7. Keselamatan

- Kad Jira hanya mengandungi ringkasan, cerita pengguna, AC, kesan dan pautan GitLab KKM. **Jangan** salin teks BRS, nombor halaman/§ BRS, nama sebenar, No. KP, emel, `.env`, token atau tangkapan skrin ke dalam Jira.
- AI tidak mencipta, menukar status atau menutup kad tanpa anda membaca medan dan berkata ya.
- Keputusan pemilik sistem dijawab jurulatih dalam komen kad; jangan biar Claude meneka.

## 8. Aliran pasukan: Projek merancang, Dev mengambil, berbincang dalam kad

Skill dalam repo (`git pull` di `main`): Projek `/rancang-sprint` dan `/isu-baharu`; Dev `/ambil-kad`. Claude menulis ke Jira hanya selepas anda membaca medan dan berkata ya.

| Langkah | Siapa | Prompt | Hasil dalam Jira |
|---|---|---|---|
| 1. AC siap | BA | `/isu-baharu KAN-<n>` | Description dengan AC; Idea → To Do |
| 2. Agih | PM | `/rancang-sprint sprint` | Assignee + `pasukan-dev` + `pasangan-N`; PM seret kad ke sprint dan *Start sprint* di papan |
| 3. Ambil | Dev (pemegang kerusi pasangan) | `/ambil-kad` | Senarai kad yang di-assign kepada anda sahaja |
| 4. Tanya | Dev | `/ambil-kad KAN-<n>` → AC kabur | Komen `SOALAN: AC-2 …` + label `soalan` |
| 5. Jawab | BA / PM | `/rancang-sprint soalan` | Komen `JAWAPAN: …`, AC dikemas kini, label `soalan` dibuang |
| 6. Mula | Dev | `/ambil-kad KAN-<n>` → sedia | *In Progress* + komen `MULA: branch feat/KAN-<n>-…` |
| 7. MR | Dev | `MR !<no> sudah Ready. Tambah komen MR pada KAN-<n> dan cadang transition ke Testing.` | Komen `MR: <pautan>` + *Testing* |
| 8. Semak & tutup | QA, PM | `/semak-mr <no>` → merge → UAT | PM: *Done* |

**Peraturan perbincangan:** soalan dan jawapan dalam komen kad, bukan WhatsApp atau mesej peribadi, supaya orang seterusnya (dan Claude) membaca konteks yang sama. Dev tidak mengubah AC, assignee atau sprint; Projek tidak menulis kod. Keputusan pemilik sistem → jurulatih, label `disekat`.
