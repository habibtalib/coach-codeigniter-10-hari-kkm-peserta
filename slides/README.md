# Slaid — CI-KKM-10

Dek slaid kursus **Coaching Pembangunan Aplikasi Menggunakan CodeIgniter** (10 hari, KKM, RH Dynamic Resources).

| Fail | Keterangan |
|------|------------|
| `ci-kkm-10.html` | Dek penuh (117 slaid), **satu fail self-contained**: CSS + JavaScript inline, fon sistem, tiada CDN. Berfungsi **tanpa internet**. |

Kandungan patuh [`../SPEC-KURSUS.md`](../SPEC-KURSUS.md) dan [`../JADUAL.md`](../JADUAL.md). Jika SPEC berubah (nama jadual, enum, kelas, route), kemas kini slaid yang berkaitan.

## Susunan dek

1. **Pengenalan** (slaid 1–9): kulit, agenda, objektif kursus, 4 modul, apa yang baharu, rentak harian, peta 10 hari, stack, cara kerja.
2. **Hari 1–10**: setiap hari = slaid pembahagi navy → *Objektif hari ini* → slaid konsep/kod → *Hasil hari ini*.
3. **Penutup**: senarai semak keselamatan, rubrik capstone, langkah seterusnya, terima kasih.

## Cara membentang

1. Buka `ci-kkm-10.html` dalam Chrome, Edge atau Firefox (klik dua kali atau seret ke pelayar).
2. Tekan **F** untuk skrin penuh.
3. Tekan **S** untuk panel nota penceramah (bawah skrin: nota, slaid seterusnya, jam masa berlalu).

Pentas slaid tetap 1280×720 (16:9) dan diskala automatik mengikut saiz tetingkap.

### Pintasan papan kekunci

| Kekunci | Tindakan |
|---------|----------|
| `→` `↓` `Space` `PageDown` `N` | Slaid seterusnya |
| `←` `↑` `PageUp` `P` `Shift+Space` | Slaid sebelumnya |
| `Home` / `End` | Slaid pertama / terakhir |
| `G`, nombor, `Enter` | Lompat ke slaid (cth `G` `4` `2` `Enter`) |
| `O` | Gambaran keseluruhan semua slaid (klik untuk lompat) |
| `S` | Buka/tutup nota penceramah |
| `F` | Skrin penuh |
| `?` | Senarai pintasan |
| `Esc` | Tutup panel |

Tetikus & sentuh: klik **separuh kiri** = sebelum, **separuh kanan** = seterusnya. Pada tablet, **leret** kiri/kanan.

Pautan terus: tambah `#n` pada URL, cth `ci-kkm-10.html#56` membuka slaid 56 (Hari 5). URL dikemas kini semasa bergerak.

## Cetak ke PDF

1. Buka dek dalam **Chrome/Edge** → `Ctrl/Cmd + P`.
2. Destinasi: **Save as PDF**. Saiz kertas **A4**, orientasi **Landskap**, margin **Tiada**.
3. Hidupkan **Background graphics**.
4. Simpan. Hasil: satu slaid bagi setiap halaman A4 landskap (117 halaman), nombor halaman di penjuru, **nota penceramah tidak dicetak**.

## Cara mengedit

Setiap slaid ialah satu `<section class="slide">` di dalam `<div class="stage">`. Susunan dalam fail = susunan pembentangan; nombor slaid dikira automatik.

```html
<section class="slide">
  <div class="eyebrow">Hari 5 · S1 — Enum</div>
  <h2>Tajuk slaid</h2>
  … kandungan …
  <aside class="notes"><p>Nota penceramah dalam BM.</p></aside>
</section>
```

- **Label hari** di HUD bawah datang dari `data-label` pada slaid pembahagi (cth `data-label="Hari 5 · TLK (1)"`). Slaid berikutnya mewarisi label itu.
- **Slaid gelap**: tambah kelas `dark` (+ `divider` untuk pembahagi hari, `cover` untuk kulit).
- **Slaid kod berat**: tambah kelas `codey` supaya tajuk lebih padat.
- **Had kandungan**: ≤ 6 butiran setiap slaid; kod ≤ ~22 baris. Jika melimpah, pecahkan kepada dua slaid.

### Komponen sedia ada

| Kelas | Kegunaan |
|-------|----------|
| `.grid.c2` / `.c3` / `.c4` | Grid kad 2/3/4 lajur |
| `.split` (`.l`, `.r`) | Dua lajur (kiri lebar / kanan lebar) |
| `.card` (+ `.top`, `.side`, `.flat`) | Kad; warna jalur ikut kelas modul |
| `.m-tlk` `.m-pas` `.m-rpt` `.m-stat` | Warna modul: TLK teal, Pas indigo, Laporan amber, Statistik rose |
| `.chip` | Cip bulat (guna dengan kelas modul) |
| `.st.pending` / `.approved` / `.rejected` / … | Badge status (nilai enum) |
| `ul.checks` / `ul.checks.done` | Senarai objektif (kotak kosong) / hasil (kotak bertanda) — **balut teks setiap `<li>` dalam `<span>`** |
| `ol.steps` | Langkah bernombor |
| `.callout.tip` / `.warn` / `.danger` | Kotak 💡 / ⚠️ |
| `table.t` | Jadual |
| `.flow > .node + .arr` | Aliran mendatar |

### Blok kod

```html
<div class="codewrap"><div class="codebar">app/Enums/BookingStatus.php<span class="lang">php</span></div>
<pre class="code sm" data-lang="php">…kod…</pre></div>
```

- Lepaskan aksara HTML dalam kod: `<` → `&lt;`, `>` → `&gt;`, `&` → `&amp;`.
- Warna sintaks ialah `<span>` manual: `.k` kata kunci, `.s` string, `.c` komen, `.f` fungsi, `.t` jenis/kelas, `.v` variable, `.n` nombor, `.o` operator. Span ini **pilihan**. Kod tanpa span tetap dipaparkan dengan betul (teks terang atas latar gelap).
- Kod mesti sah untuk **CodeIgniter 4.6+ / PHP 8.2+** dan guna nama tepat seperti SPEC.

## Token tema

Semua warna dan fon ditakrif sebagai CSS variable dalam `:root` di bahagian atas `<style>`. Ubah di situ sahaja.

| Token | Nilai | Kegunaan |
|-------|-------|----------|
| `--navy-900` / `--navy-800` | `#14213D` / `#1F3864` | Latar kulit & pembahagi hari |
| `--paper` | `#F7F8FA` | Latar slaid kandungan |
| `--ink` / `--muted` | `#0F172A` / `#64748B` | Teks utama / sekunder |
| `--teal` | `#0EA5A4` | Aksen utama, modul TLK |
| `--amber` | `#F59E0B` | Amaran, modul Laporan |
| `--indigo` | `#6366F1` | Modul Pas |
| `--rose` | `#F43F5E` | Modul Statistik |
| `--code-bg` | `#0B1220` | Latar blok kod |
| `--font` | `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", …` | Fon teks (Inter jika dipasang, jika tidak fon sistem) |
| `--mono` | `ui-monospace, "SF Mono", Consolas, …` | Fon kod |

Animasi peralihan ≤ 200 ms dan dimatikan automatik jika sistem menetapkan *reduce motion*.

## Semakan selepas mengedit

```bash
grep -c '<section class="slide' ci-kkm-10.html   # bilangan slaid
```

Kemudian buka dek, tekan `O` untuk melihat semua slaid sekali gus, dan semak tiada teks yang melimpah atau terpotong.
