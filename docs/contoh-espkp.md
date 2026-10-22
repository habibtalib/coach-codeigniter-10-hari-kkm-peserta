# Contoh siap — eSPKP Contoh

[← Indeks docs](./README.md) · [📘 Spesifikasi sistem](./spesifikasi-sistem.md) · [📏 Rubrik capstone](./rubrik-capstone.md)

**eSPKP Contoh** ialah aplikasi CodeIgniter 4 yang siap sepenuhnya: Pas Keselamatan dan TLK Khas dengan aliran kelulusan 6 peranan, dibina dengan amalan yang sama seperti kursus ini. Guna ia sebagai **perbandingan** — buka skrin yang sama dengan modul anda dan lihat bagaimana ia dibina.

⚠️ **Amaran:** ini demo latihan, bukan sistem rasmi KKM. Semua data sintetik. Jangan masukkan data peribadi sebenar.

## Buka demo

| Perkara | Nilai |
|---|---|
| Alamat | <https://eskp.synctexts.com> |
| Kata laluan semua akaun | `Latihan@2026` |
| Kod TAC & emel | Dipaparkan pada skrin (mod demo) — tiada emel dihantar |

| No. KP | Peranan | Cuba ini |
|---|---|---|
| `900101010001` | Pemohon (kakitangan) | Mohon pas baharu, hilang, rosak dan TLK; pinda; batal |
| `900101010007` | Wakil syarikat | Daftar pekerja syarikat; mohon pas untuk beberapa pekerja serentak |
| `900101010002` | Urus Setia Bahagian | Semak kelengkapan, pilih penyelia |
| `900101010003` | Penyelia | Sokong / pulangkan untuk pindaan |
| `900101010004` | Unit Keselamatan (UKS) | Blok akses, siasatan & caj pas hilang, tetapkan lot TLK, keluarkan dan serah kad |
| `900101010005` | Pelulus | Lulus / tidak lulus |
| `900101010006` | Pentadbir | Pengguna, kod rujukan, hebahan, log audit, laporan |

Pegawai (02–06) menggunakan **pengesahan dua langkah**. Dalam demo, kelima-lima akaun berkongsi satu kunci: tambah kunci di bawah secara manual dalam aplikasi pengesah (contoh Google Authenticator — jenis berasaskan masa, 6 digit), kemudian masukkan kod 6 digit selepas kata laluan.

```text
ESPKPDEMOLATIHANCIKKMSEPULUHXXYZ
```

Akaun latihan kongsi tidak boleh ditukar kata laluan atau faktor 2FA-nya. Untuk mencuba pendaftaran 2FA, passkey dan set semula kata laluan, **daftar akaun sendiri** di halaman Daftar. Data demo diset semula setiap hari jam 03:00.

## Bandingkan dengan modul anda

| Hari | Topik kursus | Lihat dalam eSPKP Contoh |
|---|---|---|
| 3–4 | Migration, seeder, model | Database dibina daripada migration + seeder sahaja; data demo menggunakan aliran kerja sebenar |
| 5 | Validation & borang | Borang permohonan: lampiran wajib ikut jenis, semakan tarikh TLK (≤ 90 hari, tidak bertindih) |
| 6 | Service & transaksi | Satu jadual peralihan status menjana butang, semakan server dan *stepper*; setiap tindakan satu transaksi |
| 7 | Muat naik fail | Lampiran di luar `public/`, nama rawak, pemilikan disemak sebelum dimuat turun |
| 8 | Shield & RBAC | 6 kumpulan Shield, menu ikut kebenaran, 404 untuk rekod orang lain, kunci akaun, 2FA (TOTP & passkey), log audit |
| 9 | Laporan & statistik | 9 laporan dengan tapisan, eksport PDF & Excel berhad, papan pemuka ikut peranan dengan cache |
| 10 | Ujian & serahan | Ujian PHPUnit (unit, database, HTTP), ujian hujung ke hujung Playwright, pipeline CI, Docker |

**Trek sampingan (pilihan):** selepas modul anda lulus senarai semak, cari satu perbezaan dengan contoh ini dan terangkan sebab reka bentuk anda — perbincangan yang baik untuk demo capstone.
