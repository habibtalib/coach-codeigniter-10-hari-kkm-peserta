# Kes Ujian — Sistem TLK & Pas

> **Templat.** Digunakan untuk ujian manual (Hari 5 S4, Hari 7 S4) dan ujian akhir sistem (Hari 10 S3). Setiap kes ujian menjejak ke **satu AC** dalam URS. Simpan sebagai `docs/kes-ujian-<modul>.md`.

## Maklumat kitaran ujian

| Perkara | Nilai |
|---------|-------|
| Modul | `<TLK / Pas / Laporan / Statistik>` |
| Kitaran | `<cth Hari 5 — ujian manual 1>` |
| Penguji | `<nama>` |
| Tarikh | `2026-__-__` |
| Versi / commit | `<git rev-parse --short HEAD>` |
| Persekitaran | `php spark serve` · `http://localhost:8080` · DB `<nama>` · seeder `DatabaseSeeder` |

## Pra-syarat umum

```bash
php spark migrate:refresh
php spark db:seed DatabaseSeeder
```

Pengguna sintetik (kata laluan `Latihan@2026`): `pemohon1@latihan.test`, `pemohon2@latihan.test`, `penyemak@latihan.test`, `pelulus@latihan.test`, `admin@latihan.test`.

---

## Kes ujian

| ID | AC | Tajuk | Peranan | Pra-syarat | Langkah | Data | Hasil dijangka | Hasil sebenar | Status |
|----|----|-------|---------|------------|---------|------|----------------|---------------|--------|
| TC-TLK-001 | AC-TLK-03-01 | `<…>` | `applicant` | `<…>` | 1. `<…>` 2. `<…>` | `<…>` | `<…>` | | ⬜ |

**Status:** ⬜ Belum · ✅ Lulus · ❌ Gagal · ⏭️ Disekat

---

## Contoh terisi

| ID | AC | Tajuk | Peranan | Pra-syarat | Langkah | Data | Hasil dijangka | Hasil sebenar | Status |
|----|----|-------|---------|------------|---------|------|----------------|---------------|--------|
| TC-TLK-003 | AC-TLK-03-03 | Tarikh sama dikira bertindih | `applicant` | Slot A-01 ada tempahan `approved` 2026-10-01 → 2026-10-10 | 1. Log masuk `pemohon2` 2. Buka `/tlk/tempahan/new` 3. Pilih A-01, isi tarikh 4. Klik "Hantar permohonan" | mula 2026-10-10, tamat 2026-10-12 | Permohonan ditolak; mesej "Slot tidak tersedia bagi julat tarikh ini"; tiada baris baharu dalam `slot_bookings` | | ⬜ |
| TC-PAS-004 | AC-PAS-04-01 | Pemohon tidak boleh lihat permohonan orang lain | `applicant` | `PAS-2026-0001` milik `pemohon1` (id = 1) | 1. Log masuk `pemohon2` 2. Buka `/pas/permohonan/1` terus di bar alamat | — | HTTP 404 (atau 403); tiada butiran permohonan dipaparkan | | ⬜ |
| TC-PAS-006 | AC-PAS-06-01 | Tolak dengan catatan < 10 aksara | `reviewer` | `PAS-2026-0003` berstatus `under_review` | 1. Log masuk `penyemak` 2. Buka permohonan 3. Isi catatan 4. Klik "Tolak" | catatan "Tidak ok" (8 aksara) | Penolakan disekat; mesej "Catatan minimum 10 aksara"; status kekal `under_review`; tiada baris `status_logs` baharu | | ⬜ |

---

## Semakan DB (bila "Hasil dijangka" menyebut data)

```sql
-- Contoh: sahkan log status selepas kelulusan
SELECT module, record_id, from_status, to_status, actor_id, remarks, created_at
FROM status_logs
WHERE module = 'TLK' AND record_id = 7
ORDER BY id;
```

> Query semakan hanya untuk penguji — di dalam aplikasi, sentiasa guna Query Builder / binding.

---

## Log pepijat

| Bug-ID | TC | Keterukan | Ringkasan | Langkah reproduce | Dijangka vs sebenar | Cabang pembetulan | Status |
|--------|----|-----------|-----------|-------------------|---------------------|-------------------|--------|
| BUG-001 | `<TC-…>` | Tinggi / Sederhana / Rendah | `<…>` | `<…>` | `<…>` | `fix/<…>` | Terbuka |

**Keterukan:**
- **Tinggi** — melanggar BR, kebocoran data, sistem ranap.
- **Sederhana** — ciri tidak berfungsi tetapi ada jalan kerja.
- **Rendah** — kosmetik, teks, susun atur.

Kitaran pembetulan (KOLABORASI §3): **reproduce → ujian gagal → baiki → ujian lulus**.

---

## Ringkasan kitaran

| Jumlah | ✅ Lulus | ❌ Gagal | ⏭️ Disekat | ⬜ Belum |
|--------|---------|---------|-----------|---------|
| | | | | |

Kesimpulan penguji: `<…>`
