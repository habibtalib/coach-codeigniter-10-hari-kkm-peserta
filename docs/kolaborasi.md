# KOLABORASI — Kontrak Kerja

Cara kerja sepanjang 10 hari. Kanun teknikal: [`docs/spesifikasi-sistem.md`](./spesifikasi-sistem.md).

## 1. Git — satu branch per ciri

```bash
git switch main && git pull
git switch -c feat/tlk-borang-tempahan      # satu ciri = satu branch
# … kerja, commit kecil & kerap …
git commit -m "TLK: tambah validasi tarikh tempahan"
git push -u origin feat/tlk-borang-tempahan # buka merge request ke main anda
```

Setiap ciri melalui **merge request (MR) ke `main` projek anda sendiri** `kelas-ci-<nama>` ([`trek-gitlab.md`](./trek-gitlab.md) §6). Minta jurulatih atau rakan sebelah memberi sekurang-kurangnya satu komen, jawab komen itu, kemudian merge sendiri. Hari 2–3 push terus ke `main`; aliran MR bermula Hari 4 S4.

Prefix commit: `TLK:` · `PAS:` · `RPT:` · `STAT:` · `SETUP:` · `FIX:`.

## 2. Definition of Done (DoD)

Satu ciri "siap" hanya apabila:

- [ ] Peraturan BR-* dalam [`spesifikasi-sistem.md`](./spesifikasi-sistem.md) yang berkaitan **diuji** dan lulus (manual + PHPUnit).
- [ ] Validasi di **server** (Model rules / Validation) — bukan JavaScript sahaja.
- [ ] Akses dikawal di server (filter + semakan pemilikan).
- [ ] Peralihan status direkod dalam `status_logs` (jika berkaitan).
- [ ] Ujian PHPUnit berkaitan lulus (`vendor/bin/phpunit`).
- [ ] Tiada `.env`/rahsia dalam commit; data sintetik sahaja.
- [ ] Peserta boleh **menerangkan** setiap baris kod kepada rakan/jurulatih.

Jalankan ujian dengan `composer test` (= `vendor/bin/phpunit`; berfungsi sama di Git Bash, PowerShell, macOS dan Linux).

## 3. Disiplin AI — "faham dahulu, terima kemudian"

**Claude Code boleh menulis kod pelaksanaan dengan pintu semakan.** Hari 1–7 pagi: Claude menerangkan, merancang dan menyemak; anda menulis kod. Mulai Hari 7 petang hingga Hari 10, Claude boleh menulis kod modul (Pas, Laporan, Statistik) **satu slice pada satu masa**, dan setiap slice melalui tujuh pintu ini:

1. **SPEC.** Baca seksyen SPEC dan ID `BR-*` yang berkaitan. `CLAUDE.md` projek menunjuk kepadanya.
2. **Pelan (mod *Plan*).** Minta pelan slice: fail (migration, model, service, controller, view, ujian) dan pemetaan BR, **tanpa kod**. Anda menyemak dan mengedit pelan itu.
3. **Laksana (mod *Manual*, lalai).** Claude mengedit; anda **membaca setiap diff** dan meluluskan atau menolaknya. Mod *accept edits*, *auto* dan *bypass permissions* tidak dibenarkan.
4. **Sahkan.** `composer test`, pelayar, dan tool `ci4-spark` (`routes`, `filter_check`, `migrate_status`).
5. **Semak.** Jalankan subagent `semak-ci4`, kemudian minta Claude membaiki dapatan, dengan pintu diff yang sama.
6. **Terangkan.** Dalam `docs/nota-claude.md`, terangkan 3 baris utama dengan ayat sendiri (`fail:baris`). Kuiz menyemak kefahaman ini.
7. **Commit.** Commit kecil dengan mesej yang jelas, dalam feature branch.

**Masih tidak dibenarkan:** satu prompt untuk menjana seluruh modul; mod *auto*/*bypass* (atau *accept edits*); commit kod yang anda tidak boleh terangkan; rahsia (`.env`, kata laluan, token) atau data sebenar dalam prompt.

Prinsipnya kekal **"faham dahulu, terima kemudian"**: diff diterima **hanya** selepas anda boleh menerangkannya. Bila ralat: **reproduce → ujian gagal → baiki → ujian lulus**.

## 4. Kerja individu & semakan

Setiap peserta bekerja **sendiri** dalam projek private `kelas-ci-<nama>` dan membina keempat-empat modul. Jurulatih (Reporter dalam projek anda) menyemak di setiap ✅ checkpoint dan memberi komen pada MR. Bantu rakan sebelah dengan menerangkan, bukan menaip untuknya. Peserta yang cepat mengambil ⭐ cabaran tambahan.

## 5. Keselamatan & data

- Data **sintetik** sahaja (`@latihan.test`, plat rekaan).
- CSRF dihidupkan (`app/Config/Filters.php` → `globals.before['csrf']`).
- Muat naik di `writable/uploads/` — bukan `public/`.
- Query Builder / binding sahaja — tiada SQL mentah bercantum input.
- Output view dilepaskan dengan `esc()`.

## 6. Kerja pasukan dalam espkpv2 (Hari 8–10)

Mulai Hari 8, kelas bekerja dalam **satu** repo: `<gitlab-kkm>/aplikasi-baharu/espkpv2`, sebagai 3 skuad × 4 (PM, QA, 2 Dev). Butiran peranan dan putaran: [`peranan-pasukan.md`](peranan-pasukan.md); peraturan teknikal repo: `docs/pasukan.md` dan `CONTRIBUTING.md` dalam espkpv2.

- **Satu isu → satu branch (`feat/<no>-<ringkas>`) → satu MR** ke `main` yang dilindungi; commit `Rujuk #N`, MR `Closes #N`.
- **Tujuh pintu §3 kekal** untuk setiap slice Dev. Pintu 5 (semak) kini dua lapis: subagent `semak-espkp` oleh Dev, kemudian semakan MR oleh **QA skuad** dengan `/semak-mr` terhadap AC isu.
- **Tiada siapa meluluskan MR sendiri.** QA approve; PM merge mengikut susunan yang dipersetujui antara PM.
- **Hotspot ada pemilik** (skuad A `Aliran.php`, B `Auth*.php`, C `Laporan.php`); fail dikongsi diubah dalam blok kawasan sendiri sahaja.
- §4 (kerja individu dalam `kelas-ci-<nama>`) terpakai untuk Hari 1–7 dan lab rujukan dalam Lampiran Hari 8–10.
