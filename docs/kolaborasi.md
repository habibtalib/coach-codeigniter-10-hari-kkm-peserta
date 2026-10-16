# KOLABORASI — Kontrak Kerja

> Cara kerja sepanjang 10 hari. Kanun teknikal: [`docs/spesifikasi-sistem.md`](./spesifikasi-sistem.md).

## 1. Git — satu cabang per ciri

```bash
git switch main && git pull
git switch -c feat/tlk-borang-tempahan      # satu ciri = satu cabang
# … kerja, commit kecil & kerap …
git commit -m "TLK: tambah validasi tarikh tempahan"
git push -u origin feat/tlk-borang-tempahan # buka PR/merge request
```

Prefix commit: `TLK:` · `PAS:` · `RPT:` · `STAT:` · `SETUP:` · `FIX:`.

## 2. Definition of Done (DoD)

Satu ciri "siap" hanya apabila:

- [ ] Acceptance criteria (Given/When/Then) dari URS **lulus** diuji manual.
- [ ] Validasi di **server** (Model rules / Validation) — bukan JavaScript sahaja.
- [ ] Akses dikawal di server (filter + semakan pemilikan).
- [ ] Peralihan status direkod dalam `status_logs` (jika berkaitan).
- [ ] Ujian PHPUnit berkaitan lulus (`vendor/bin/phpunit`).
- [ ] Tiada `.env`/rahsia dalam commit; data sintetik sahaja.
- [ ] Peserta boleh **menerangkan** setiap baris kod kepada rakan/jurulatih.

Jalankan ujian dengan `composer test` (= `vendor/bin/phpunit`; berfungsi sama di Git Bash, PowerShell, macOS dan Linux).

## 3. Disiplin AI — "faham dahulu, terima kemudian"

Claude Code (atau mana-mana AI) **dibenarkan** untuk: menerangkan ralat, mencadang ujian, menyemak logik, menjana boilerplate kecil.
**Tidak dibenarkan:** menjana modul penuh untuk disalin. Cadangan diterima **hanya** selepas peserta boleh menerangkannya. Bila ralat: **reproduce → ujian gagal → baiki → ujian lulus**.

## 4. Pembahagian kerja (disyorkan, Hari 4)

Peserta bekerja **berpasangan** (driver/navigator, tukar setiap sesi). Semua pasangan membina keempat-empat modul dalam repo sendiri; jurulatih menyemak di setiap ✅ checkpoint. Pasangan yang cepat mengambil ⭐ cabaran tambahan.

## 5. Keselamatan & data

- Data **sintetik** sahaja (`@latihan.test`, plat rekaan).
- CSRF dihidupkan (`app/Config/Filters.php` → `globals.before['csrf']`).
- Muat naik di `writable/uploads/` — bukan `public/`.
- Query Builder / binding sahaja — tiada SQL mentah bercantum input.
- Output view dilepaskan dengan `esc()`.
