# Hari 10 — Modul Statistik (M4) & Capstone

[← Jadual](../JADUAL.md) · [Kanun SPEC](../docs/spesifikasi-sistem.md) · [🧪 Lab Hari 10](./lab.md) · [📋 Rubrik Capstone](../docs/rubrik-capstone.md) · [← Hari 9](../hari-9/README.md)

> **Hari terakhir.** Pagi: kita membina dashboard yang merangkum M1 & M2 dan belajar satu konsep prestasi yang sering disalah guna — **cache**. Petang: kita berhenti membina dan mula **membuktikan** — UAT, pembetulan pepijat berdisiplin, semakan keselamatan, dan demo kepada pemilik sistem.

---

## 🎯 Objektif Pembelajaran

Di akhir hari ini, peserta boleh:

| # | Objektif (boleh diukur) | Sesi |
|---|-------------------------|------|
| O1 | **Menulis** `StatisticsService` yang mengira 4 KPI dan 4 dataset carta (SPEC §2.4) menggunakan aggregate Query Builder, termasuk mengisi bulan kosong dengan sifar. | S1 |
| O2 | **Membina** dashboard `/statistik` dengan kad KPI dan 4 carta Chart.js 4 (bar, doughnut, bar mendatar, line) yang mengambil data daripada endpoint JSON `/statistik/data`. | S1 |
| O3 | **Menggunakan** `cache()->remember('stat_dashboard', 600, …)` dan **menambah** `cache()->delete('stat_dashboard')` selepas setiap perubahan status dalam `BookingService` & `PassWorkflowService`, serta **menerangkan** tukar-ganti (tradeoff) invalidasi cache. | S2 |
| O4 | **Melaksanakan** skrip UAT merentas 4 modul mengikut peranan dan merekod keputusan dalam templat UAT. | S3 |
| O5 | **Membaiki** pepijat menggunakan kitaran *reproduce → ujian gagal → baiki → ujian lulus*, dan **mengesahkan** senarai semak keselamatan akhir (CSRF, `esc()`, `.env`, muat naik luar `public/`, filter route). | S3 |
| O6 | **Mendemokan** sistem hujung-ke-hujung dalam 8 minit, **menerangkan** baris kod yang dipilih panel, dan **menyumbang** kepada retrospektif Start/Stop/Continue. | S4 |

---

## 📅 Jadual Hari Ini

| Masa | Sesi | Aktiviti | Objektif |
|------|------|----------|----------|
| 08:30–09:00 | — | Recap Hari 9 (laporan & eksport) | — |
| 09:00–10:30 | **S1** | Dashboard statistik (carta, ringkasan merentas modul) | O1, O2 |
| 10:30–10:45 | — | Rehat pagi | — |
| 10:45–12:30 | **S2** | Aggregate query & caching asas | O3 |
| 12:30–14:30 | — | Makan tengah hari | — |
| 14:30–16:00 | **S3** | Ujian akhir sistem & pembetulan pepijat | O4, O5 |
| 16:00–17:00 | **S4** | Demo capstone kepada pemilik sistem & penutup | O6 |

---

## 🧭 Kenapa hari ini penting

Laporan (Hari 9) menjawab "*apa rekodnya?*". Dashboard menjawab "*bagaimana keadaan sekarang?*" — dalam 5 saat, tanpa menapis apa-apa. Pengarah yang membuka `/statistik` pada pagi Isnin mahu tahu: berapa tempahan aktif, adakah slot penuh, berapa pas tertunggak, berapa lama pemohon menunggu.

Tetapi dashboard ialah halaman yang **paling kerap dibuka** dan **paling mahal dikira** (8 query aggregate merentas semua jadual). Di sinilah cache masuk — dan di sinilah ramai pembangun mencipta pepijat paling licik: *"Saya dah lulus, kenapa dashboard masih tunjuk Menunggu?"*

Selepas makan tengah hari, fokus bertukar. Kod yang tidak pernah diuji oleh pengguna sebenar belum *siap*. Kita akan menjalankan UAT sebagai pemilik sistem, membaiki pepijat dengan disiplin, dan akhirnya mendemokan sistem lengkap — **4 modul, 4 peranan, satu aliran**.

```mermaid
flowchart LR
    subgraph Pagi[Pagi — bina]
        A[S1 Dashboard<br/>KPI + 4 carta] --> B[S2 Cache<br/>remember + delete]
    end
    subgraph Petang[Petang — buktikan]
        C[S3 UAT + pepijat<br/>+ keselamatan] --> D[S4 Demo capstone<br/>+ retrospektif]
    end
    B --> C
```

---

## S1 · Dashboard statistik (09:00–10:30)

### 1.1 Takrif KPI — tulis takrif dahulu, SQL kemudian

KPI yang tidak ditakrif dengan tepat akan dipertikaikan dalam mesyuarat pertama. Setiap KPI mesti ada **takrif BM** yang boleh dibaca pemilik sistem dan **rumus** yang boleh diuji.

| KPI | Takrif (BM) | Rumus / sumber |
|-----|-------------|----------------|
| **Tempahan aktif** | Tempahan yang masih Menunggu atau Diluluskan | `COUNT(*) FROM slot_bookings WHERE status IN ('pending','approved')` — takrif sama seperti BR-TLK-04 (`BookingStatus::active()`) |
| **Kadar penggunaan slot (%)** | Peratus slot aktif yang sedang diduduki hari ini | slot **berbeza** dengan tempahan `approved` yang meliputi hari ini ÷ slot aktif (`is_active = 1`, tidak dipadam) × 100 |
| **Permohonan pas menunggu** | Permohonan yang belum diputuskan | `status IN ('submitted','under_review')` |
| **Purata hari untuk lulus pas** | Purata masa dari hantar hingga lulus | `AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) / 24` bagi `approved_at IS NOT NULL` |

> 💡 **Tip — kenapa `approved_at IS NOT NULL` dan bukan `status = 'approved'`?** Pas yang diluluskan bulan lepas dan kini `expired` tetap *pernah* diluluskan. Jika kita tapis ikut status semasa, purata akan berubah setiap kali `pas:expire` berjalan — walaupun tiada kelulusan baharu. Guna **fakta sejarah** (`approved_at`), bukan keadaan semasa.

> ⚠️ **Kesilapan lazim — purata dalam hari integer.** `TIMESTAMPDIFF(DAY, ...)` membundarkan ke bawah: permohonan yang diluluskan selepas 23 jam = 0 hari. Kira dalam **jam** kemudian bahagi 24 untuk pecahan yang jujur (cth 1.4 hari).

### 1.2 Pilih carta yang betul untuk soalan yang betul

| Soalan | Carta | Kenapa |
|--------|-------|--------|
| Berapa tempahan setiap bulan tahun ini? | **Bar** (menegak) | Perbandingan kategori tersusun (Jan..Dis) |
| Bagaimana taburan status pas? | **Doughnut** | Bahagian daripada keseluruhan, ≤ 5 kategori |
| Zon mana paling sesak bulan ini? | **Bar mendatar** (`indexAxis: 'y'`) | Label zon panjang; mudah disusun dari tertinggi |
| Adakah permohonan pas meningkat? | **Line** | Trend masa berterusan (12 bulan) |

> ⚠️ **Kesilapan lazim — pie/doughnut untuk trend masa**, atau line untuk kategori tanpa tertib (zon). Bentuk carta membawa makna; bentuk yang salah mengelirukan walaupun datanya betul.

### 1.3 Seni bina: view + endpoint JSON

```mermaid
sequenceDiagram
    participant B as Pelayar
    participant C as DashboardController
    participant S as StatisticsService
    participant K as Cache (file)
    participant D as MySQL
    B->>C: GET /statistik
    C->>S: dashboard()
    S->>K: remember('stat_dashboard', 600, build)
    K-->>S: (hit) data cache
    C-->>B: HTML + kad KPI + 4 <canvas> kosong
    B->>C: fetch('/statistik/data')
    C->>S: dashboard()
    S->>K: remember(...) — hit lagi
    C-->>B: JSON {kpi, charts}
    B->>B: Chart.js lukis 4 carta
```

Kenapa **dua** route?

- **Kad KPI** dirender di server → muncul serta-merta, berfungsi walaupun JavaScript gagal, mudah diuji dengan `FeatureTestTrait`.
- **Carta** memerlukan JavaScript. Endpoint JSON (`setJSON()`) memisahkan *data* daripada *persembahan* — endpoint sama boleh digunakan semula (cth untuk skrin TV di bilik gerakan).
- Kedua-dua memanggil `StatisticsService::dashboard()` → **cache yang sama**, nombor yang sama.

### 1.4 Kontrak data — satu bentuk untuk semua carta

```json
{
  "generated_at": "25/09/2026 09:15:02",
  "kpi": { "active_bookings": 12, "slot_utilisation": 37.5, "pending_passes": 4, "avg_days_to_approve": 1.8 },
  "charts": {
    "bookings_by_month": { "labels": ["Jan", "Feb", "…", "Dis"], "data": [3, 5, 0, "…"], "year": 2026 },
    "pass_status":       { "keys": ["submitted", "…"], "labels": ["Dihantar", "…"], "data": [2, 2, 7, 1, 0] },
    "usage_by_zone":     { "labels": ["ZA Zon A", "ZB Zon B"], "data": [42.3, 10.0] },
    "pass_trend":        { "labels": ["Okt 25", "…", "Sep 26"], "data": [0, 1, "…"] }
  }
}
```

Tiga keputusan reka bentuk:

1. **Isi sifar untuk bulan kosong.** `GROUP BY MONTH(...)` tidak memulangkan bulan tanpa rekod. Tanpa sifar, data `[3, 5, 2]` akan dilukis sebagai Jan–Mac walaupun sebenarnya Jan, Feb, **Jun**.
   ```php
   $byMonth = array_column($rows, 'total', 'm');          // [1 => 3, 2 => 5, 6 => 2]
   for ($m = 1; $m <= 12; $m++) {
       $data[] = (int) ($byMonth[$m] ?? 0);               // [3, 5, 0, 0, 0, 2, 0, ...]
   }
   ```
2. **`keys` (nilai enum) berasingan daripada `labels` (BM).** JavaScript memetakan warna ikut `keys` — jika label BM ditukar, warna tidak rosak.
3. **Guna semula RPT-03.** `usage_by_zone` memanggil `ReportService::usageByZone()` — dashboard dan laporan **tidak boleh** berbeza.

### 1.5 Chart.js 4 — minimum yang perlu difahami

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
```

```js
function draw(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    Chart.getChart(canvas)?.destroy();          // elak "Canvas is already in use"
    return new Chart(canvas, config);
}

draw('chartUsageByZone', {
    type: 'bar',
    data: { labels: charts.usage_by_zone.labels,
            datasets: [{ label: 'Penggunaan (%)', data: charts.usage_by_zone.data }] },
    options: { indexAxis: 'y',                   // ← inilah "bar mendatar" dalam Chart.js 4
               responsive: true, maintainAspectRatio: false,
               scales: { x: { beginAtZero: true, max: 100 } } },
});
```

> 💡 **Tip:** Balut setiap `<canvas>` dalam `<div style="position: relative; height: 280px">` dan set `maintainAspectRatio: false`. Tanpa ini, carta dalam grid Bootstrap boleh "membesar tanpa henti" atau hilang ketinggian.

> ⚠️ **Kesilapan lazim — `res.json()` gagal dengan `Unexpected token '<'`.** Sesi tamat → filter Shield redirect ke halaman log masuk (HTML) → JSON parser tercekik. Semak `res.ok` dan `Content-Type` sebelum `res.json()`, dan papar mesej mesra.

### 🎯 Kuiz S1

1. KPI "Purata hari untuk lulus pas" dikira bagi permohonan dengan `approved_at IS NOT NULL`, bukan `status = 'approved'`. Kenapa?
   - [ ] `status` tidak mempunyai index
   - [ ] `status = 'approved'` tidak boleh digabung dengan `AVG()` dalam MySQL 8 kerana `ONLY_FULL_GROUP_BY`, jadi tapisan mesti dibuat pada medan tarikh
   - [x] Pas yang telah `expired` tetap *pernah* diluluskan; menapis ikut status semasa membuat purata berubah setiap kali `pas:expire` berjalan walaupun tiada kelulusan baharu
   - [ ] Kerana permohonan `rejected` turut mempunyai `approved_at`
   > Guna fakta sejarah (`approved_at`), bukan keadaan semasa. Penolakan tidak menetapkan `approved_at` (Hari 8), jadi ia tidak mencemarkan KPI ini.

2. Query `GROUP BY MONTH(created_at)` memulangkan `$rows` untuk Jan (3), Feb (5) dan Jun (2) sahaja. Apakah `$data` selepas kod ini?
   ```php
   $byMonth = array_column($rows, 'total', 'm');   // [1 => 3, 2 => 5, 6 => 2]
   $data = [];
   for ($m = 1; $m <= 12; $m++) {
       $data[] = (int) ($byMonth[$m] ?? 0);
   }
   ```
   - [ ] `[3, 5, 2]`
   - [x] `[3, 5, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0]`
   - [ ] `[3, 5, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]`
   - [ ] `[1 => 3, 2 => 5, 6 => 2]`
   > Bulan tanpa rekod diisi sifar supaya setiap nilai sejajar dengan label Jan..Dis. Tanpanya, `[3, 5, 2]` akan dilukis sebagai Jan–Mac.

---

## S2 · Aggregate query & caching asas (10:45–12:30)

### 2.1 Kenapa cache?

Tanpa cache, setiap muat semula `/statistik` = 2 permintaan × 8 query aggregate = **16 query** yang mengimbas `slot_bookings` dan `pass_applications`. Dengan 30 pegawai membuka dashboard setiap pagi, itu ~500 query yang memulangkan **jawapan yang sama**.

### 2.2 Corak *cache-aside* dengan `remember()`

```php
public const CACHE_KEY = 'stat_dashboard';
public const CACHE_TTL = 600;   // 10 minit (SPEC §2.4)

public function dashboard(): array
{
    return cache()->remember(self::CACHE_KEY, self::CACHE_TTL, fn (): array => $this->build());
}
```

`remember()` = tiga langkah dalam satu panggilan:

```mermaid
flowchart TD
    A[remember key, ttl, fn] --> B{Kunci wujud<br/>& belum tamat?}
    B -->|Ya — HIT| C[Pulang data cache<br/>0 query DB]
    B -->|Tidak — MISS| D[Jalankan fn → build<br/>8 query]
    D --> E[Simpan hasil selama TTL]
    E --> F[Pulang data]
```

### 2.3 Masalah sebenar: data basi (*stale*)

TTL 10 minit bermakna: pelulus meluluskan tempahan pada 09:01, tetapi dashboard masih tunjuk angka 09:00 sehingga 09:10. Untuk dashboard pengurusan, *mungkin* boleh diterima. Untuk pelulus yang baru klik "Lulus" dan terus membuka dashboard — ia kelihatan seperti **pepijat**.

Penyelesaian SPEC §2.4: **kosongkan cache apabila status berubah**.

```php
// Dalam BookingService::transition() dan create(); PassWorkflowService::transition() dan submit()
$this->db->transCommit();
cache()->delete(StatisticsService::CACHE_KEY);   // ← SELEPAS commit, bukan sebelum
```

### 2.4 Kenapa **selepas** commit?

```mermaid
sequenceDiagram
    participant P as Pelulus (req A)
    participant X as Pengarah (req B)
    participant K as Cache
    participant D as DB
    Note over P,D: ❌ SALAH — delete SEBELUM commit
    P->>D: BEGIN → UPDATE status='approved'
    P->>K: delete('stat_dashboard')
    X->>K: remember() → MISS
    X->>D: SELECT … (belum nampak UPDATE — transaksi A belum commit)
    X->>K: simpan data LAMA selama 10 minit 😱
    P->>D: COMMIT
```

Jika cache dikosongkan sebelum `COMMIT`, permintaan lain boleh membina semula cache daripada data lama dalam jurang milisaat itu — dan data lama itu kekal 10 minit. Selepas commit, sebarang binaan semula pasti melihat data baharu. Jika transaksi **gagal** (rollback), tiada apa berubah, jadi tiada apa perlu dikosongkan — satu lagi sebab meletakkannya selepas `transCommit()`.

### 2.5 Tukar-ganti (*tradeoff*) strategi invalidasi

| Strategi | Kelebihan | Kelemahan | Sesuai bila |
|----------|-----------|-----------|-------------|
| **Tiada cache** | Sentiasa tepat; tiada kod tambahan | Beban DB tinggi; perlahan apabila data besar | Data kecil, pengguna sedikit |
| **TTL sahaja** (remember 600) | Paling mudah; satu baris | Basi sehingga 10 minit | Dashboard pengurusan yang tidak kritikal masa |
| **TTL + delete semasa tulis** ✅ (pilihan kita) | Segar selepas perubahan; TTL sebagai jaring keselamatan | Mesti ingat setiap tempat yang menulis; terlepas satu = basi | Tulisan jarang, bacaan kerap (kes kita) |
| **Kemas kini cache semasa tulis** (write-through) | Tiada MISS selepas tulis | Kompleks; risiko kiraan salah; ulang logik | Jarang perlu untuk aplikasi jabatan |

> 💡 **Tip — "Ada dua perkara sukar dalam sains komputer: invalidasi cache dan menamakan sesuatu."** Kita ringankan kedua-duanya: **satu** kunci (`StatisticsService::CACHE_KEY`), dan invalidasi di **satu** tempat per service (kaedah peribadi `transition()` + kaedah cipta).

> ⚠️ **Kesilapan lazim:**
> - Menaip `'stat_dashboard'` di 5 tempat → satu tersalah eja (`'stats_dashboard'`) → tiada ralat, cuma basi. Guna **pemalar**.
> - Cache data **per pengguna** di bawah kunci global. Dashboard kita sama untuk semua `approver`/`admin`, jadi satu kunci selamat. Jika kelak ada data ikut jabatan pengguna, kunci mesti mengandungi id jabatan (`stat_dashboard_dept_3`) — jika tidak, data jabatan A bocor kepada jabatan B.
> - Lupa path tulis lain: `pas:expire` (Spark) juga mengubah status — tetapi kerana ia melalui `PassWorkflowService::transition()`, ia diliputi secara automatik. Inilah ganjaran "satu pintu untuk perubahan status" dari Hari 6 & 8.

### 2.6 Bagaimana kita tahu cache berfungsi?

| Bukti | Cara |
|-------|------|
| HIT | Muat semula `/statistik` → Debug Toolbar tab *Database*: **0** query aggregate; "Data dijana" tidak berubah |
| Fail cache wujud | `ls writable/cache/` → fail `stat_dashboard` |
| Invalidasi | Lulus satu tempahan → muat semula dashboard → "Data dijana" = masa sekarang; KPI berubah |
| Automatik | `StatisticsCacheTest` (lab S2): isi cache → `approve()` → `assertNull(cache()->get(...))` |

### 🎯 Kuiz S2

1. Dalam `BookingService::transition()`, di manakah `cache()->delete(StatisticsService::CACHE_KEY)` patut dipanggil?
   - [ ] Sebelum `transBegin()`
   - [ ] Selepas `UPDATE` tetapi sebelum `transCommit()`
   - [ ] Dalam blok `catch` selepas `transRollback()`
   - [x] Selepas `transCommit()`
   > Panggil `StatisticsService::forget()` (= `cache()->delete(CACHE_KEY)`) selepas commit. Jika dikosongkan sebelum commit, permintaan lain boleh membina semula cache daripada data lama dan menyimpannya selama 10 minit. Jika transaksi rollback, tiada apa berubah, jadi tiada apa perlu dikosongkan.

2. Satu service memanggil `cache()->delete('stats_dashboard')` (tersalah eja). Apakah gejalanya?
   - [x] Tiada ralat — cache `stat_dashboard` tidak dikosongkan, jadi dashboard kekal basi sehingga TTL 600 s tamat
   - [ ] `CacheException` dilontar serta-merta kerana `delete()` menyemak dahulu bahawa kunci `stats_dashboard` wujud
   - [ ] Dashboard memaparkan halaman kosong kerana `remember()` memulangkan `null` selepas `delete()` yang gagal
   - [ ] Semua cache aplikasi dikosongkan kerana handler `file` memadam seluruh `writable/cache/` jika kunci tiada
   > `delete()` pada kunci yang tiada tidak menghasilkan ralat. Sebab itu kunci ditulis sebagai pemalar `StatisticsService::CACHE_KEY`, bukan string yang ditaip di banyak tempat.

---

## S3 · Ujian akhir sistem & pembetulan pepijat (14:30–16:00)

### 3.1 UAT — menguji sebagai pengguna, bukan sebagai pembangun

UAT (User Acceptance Testing) menjawab soalan pemilik sistem: "*Adakah sistem ini mematuhi peraturan BR-TLK/BR-PAS dalam [SPEC](../docs/spesifikasi-sistem.md) §2?*" (contoh acceptance criteria: [`rujukan-keperluan.md`](../docs/rujukan-keperluan.md)). Ia **bukan** ujian unit. Ia dijalankan melalui pelayar, mengikut peranan, dengan data sintetik.

Dua templat (disediakan dalam modul **Templat & Rujukan**):

- `templates/dokumen/kes-ujian-templat.md` (modul **Templat & Rujukan**) — kes ujian terperinci (TC-…) + **log pepijat**.
- `templates/dokumen/uat-signoff-templat.md` (modul **Templat & Rujukan**) — senario UAT-01..10 + keputusan penerimaan + tandatangan.

### 3.2 Skrip UAT merentas 4 modul ikut peranan

Jalankan **mengikut tertib** — setiap langkah menyediakan data untuk langkah seterusnya. Guna tetingkap incognito berasingan untuk setiap peranan.

| # | Peranan (log masuk) | Tindakan | Hasil dijangka | UAT |
|---|---------------------|----------|----------------|-----|
| 1 | `pemohon1@latihan.test` | Mohon slot TLK (tarikh esok, 5 hari) | `TLK-2026-####` dijana; status **Menunggu** | UAT-01 |
| 2 | `pemohon2@latihan.test` | Mohon slot **sama**, tarikh bertindih | Ditolak: slot tidak tersedia | UAT-02 |
| 3 | `pemohon1@latihan.test` | Cuba mohon tempahan kedua | Ditolak: sudah ada tempahan aktif | UAT-03 |
| 4 | `pelulus@latihan.test` | Buka `/statistik` — catat KPI "Tempahan aktif" & masa jana | Dashboard dipapar | UAT-10 |
| 5 | `pelulus@latihan.test` | `/tlk/keputusan` → Lulus tempahan langkah 1 | Status **Diluluskan**; log direkod | UAT-01 |
| 6 | `pelulus@latihan.test` | Muat semula `/statistik` | "Data dijana" = masa sekarang (bukti cache dikosongkan walaupun belum 10 minit) | UAT-10 |
| 7 | `pemohon1@latihan.test` | Mohon Pas `kenderaan` + 2 dokumen (PDF, PNG) | `PAS-2026-####`; **Dihantar** | UAT-04 |
| 8 | `pemohon1@latihan.test` | Muat naik `.docx` / fail 3 MB | Ditolak dengan mesej jelas | UAT-05 |
| 9 | `pemohon2@latihan.test` | Buka `/pas/permohonan/{id milik pemohon1}` terus | 404/403 | UAT-07 |
| 10 | `penyemak@latihan.test` | Ambil untuk semakan; cuba tolak dengan catatan "Tidak ok" | **Dalam Semakan**; penolakan disekat (< 10 aksara) | UAT-04, UAT-06 |
| 11 | `pelulus@latihan.test` | Lulus pas → buka `/statistik` | **Diluluskan**; garis masa 3 entri; KPI "Pas menunggu" turun 1 **serta-merta** | UAT-04, UAT-10 |
| 12 | `pemohon1@latihan.test` | Buka `/tlk/keputusan`, `/laporan/tempahan`, `/statistik` terus | Semua **disekat** | UAT-08 |
| 13 | `penyemak@latihan.test` | Buka `/statistik` | **Disekat** (reviewer tiada `statistik.view`) | UAT-08 |
| 14 | `penyemak@latihan.test` | RPT-02 tapis status Diluluskan → eksport PDF & Excel | Jumlah skrin = PDF = Excel = `COUNT(*)` | UAT-09 |
| 15 | `admin@latihan.test` | RPT-03 bulan semasa; bandingkan dengan carta "Penggunaan ikut zon" | Peratus **sama** | UAT-09, UAT-10 |

> 💡 **Tip:** Selepas **setiap** langkah, terus isi "Hasil sebenar" dan status ✅/❌ dalam templat sebelum klik langkah seterusnya. Jangan baiki pepijat semasa UAT — **rekod dahulu**, baiki kemudian mengikut keterukan.

### 3.3 Kitaran pembetulan pepijat (KOLABORASI §3)

```mermaid
flowchart LR
    R[1 Reproduce<br/>langkah tepat + data] --> T[2 Ujian GAGAL<br/>PHPUnit merah]
    T --> F[3 Baiki<br/>perubahan minimum]
    F --> P[4 Ujian LULUS<br/>+ semua ujian lain hijau]
    P --> C[5 Commit<br/>FIX: … BUG-00N]
```

**Contoh kerja — BUG-007: "RPT-02 tidak memaparkan permohonan hari terakhir julat"**

1. **Reproduce.** Log masuk `penyemak`. Hantar permohonan pas hari ini jam 14:00 (sebagai pemohon). RPT-02 → Dari: 01/09/2026, Hingga: *hari ini* → permohonan tadi **tiada**.
2. **Ujian gagal** — tulis ujian yang menerangkan tingkah laku yang **betul**:
   ```php
   public function testRpt02HariTerakhirJulatTidakTercicir(): void
   {
       // fixture: permohonan pada '2026-09-30 14:00:00'
       $f = $this->service->normaliseFilters('pas', ['from' => '2026-09-01', 'to' => '2026-09-30']);
       $this->assertSame(2, $this->service->paginate('pas', $f, 1)['total']);
   }
   ```
   `composer test -- --filter testRpt02HariTerakhirJulatTidakTercicir` → **merah** (dapat 1, jangka 2). Ujian gagal ini **membuktikan** anda memahami puncanya.
3. **Baiki** — perubahan minimum:
   ```diff
   - ->when($f['to'] ?? null, static fn ($q, $to) => $q->where('p.created_at <=', $to))
   + ->when($f['to'] ?? null, static fn ($q, $to) => $q->where(
   +     'p.created_at <', (new DateTimeImmutable($to))->modify('+1 day')->format('Y-m-d 00:00:00')))
   ```
4. **Lulus** — ujian tadi hijau **dan** `composer test` (semua) hijau.
5. **Commit** — `git commit -m "FIX: RPT-02 julat tarikh separuh-terbuka (BUG-007)"`; kemas kini log pepijat → *Ditutup*.

> ⚠️ **Kesilapan lazim — baiki dahulu, tulis ujian kemudian.** Ujian yang ditulis selepas pembetulan hampir selalu lulus — ia tidak membuktikan apa-apa. Ujian mesti **dilihat gagal** sekurang-kurangnya sekali.

### 3.4 Senarai semak keselamatan akhir

Rujukan mendalam: [`docs/nota-11-keselamatan-aplikasi-web.md`](../docs/nota-11-keselamatan-aplikasi-web.md).

| # | Perkara | Cara semak (bukti) |
|---|---------|--------------------|
| K1 | **CSRF** hidup secara global | `app/Config/Filters.php` → `$globals['before']` mengandungi `'csrf'`; setiap `<form method="post">` ada `<?= csrf_field() ?>`; hantar borang dengan token dipadam (DevTools) → ditolak |
| K2 | **Output dilepaskan** dengan `esc()` | `grep -rnF '<?= $' app/Views \| grep -vF 'esc(' \| grep -vF '$this->'` — setiap baris baki mesti dijustifikasi (cth integer `$n`, `$pager->makeLinks()`); abaikan `app/Views/errors/` (fail rangka kerja) |
| K3 | **`.env` tidak dalam Git** | `git ls-files \| grep -E "(^\|/)\.env$"` → tiada output; `git log --all --oneline -- .env` → tiada |
| K4 | **Muat naik di luar `public/`** | Fail berada di `writable/uploads/pas/` dengan nama rawak; `ls public/` tiada folder uploads; muat turun hanya melalui controller dengan semakan pemilikan |
| K5 | **Filter route** pada setiap kumpulan | `php spark routes` — lajur *Filters* untuk `/tlk/keputusan`, `/admin/slot`, `/pas/semakan`, `/laporan/*`, `/statistik*`; `MSYS_NO_PATHCONV=1 php spark filter:check GET /statistik` (Git Bash) |
| K6 | **Semakan pemilikan** dalam service | UAT langkah 9 (pemohon2 → permohonan pemohon1) = disekat |
| K7 | **Tiada SQL mentah bercantum input** | `grep -rn -e '->query(' app/` — setiap hit mesti guna binding `?` (pengecualian sah: `EXPLAIN` dalam `ReportExplain` — SQL dikompil Query Builder, CLI sahaja) |
| K8 | **Whitelist susunan/filter** laporan | `/laporan/tempahan?sort=(SELECT 1)` → jatuh ke susunan lalai |
| K9 | **Data sintetik sahaja** | Tiada nama/IC/plat sebenar dalam seeder, fixture, tangkapan skrin demo |
| K10 | **Mod pengeluaran** untuk staging | `CI_ENVIRONMENT = production` → tiada Debug Toolbar, tiada jejak ralat dipapar |

### 🎯 Kuiz S3

1. Semasa UAT ditemui BUG-007: RPT-02 tidak memaparkan permohonan pada hari terakhir julat. Apakah susunan langkah yang betul?
   - [ ] Baiki kod → tulis ujian → commit
   - [ ] Baiki kod → uji manual semula dalam pelayar mengikut skrip UAT → commit → tulis ujian PHPUnit jika masa mengizinkan
   - [x] Reproduce → tulis ujian yang gagal → baiki (perubahan minimum) → ujian itu dan semua ujian lain lulus → commit
   - [ ] Tulis ujian → commit → baiki kemudian
   > Ujian yang ditulis selepas pembetulan hampir selalu lulus dan tidak membuktikan apa-apa. Ujian mesti dilihat gagal sekurang-kurangnya sekali.

2. Dalam skrip UAT, `penyemak@latihan.test` membuka `/statistik` terus. Apakah hasil dijangka, dan kenapa?
   - [ ] Dashboard dipapar kerana `laporan.view` milik penyemak meliputi `/statistik` — kedua-duanya modul bacaan yang membaca data M1 dan M2
   - [x] Disekat — group `reviewer` tiada `statistik.view`; route dilindungi `permission:statistik.view`
   - [ ] Dashboard dipapar tanpa carta
   - [ ] 404 kerana route tidak wujud untuk penyemak
   > Mengikut SPEC §4, `statistik.view` hanya untuk `approver` dan `admin` (melalui `statistik.*`). `laporan.view` tidak memberi akses kepada dashboard.

---

## S4 · Demo capstone kepada pemilik sistem & penutup (16:00–17:00)

### 4.1 Format demo — 8 minit setiap peserta

| Minit | Segmen | Apa yang panel mahu lihat |
|-------|--------|---------------------------|
| 0–1 | **Pengenalan** | Nama, repo `kelas-ci-<nama>`, tag Git (`v1.0-capstone`), satu ayat "apa yang saya bina" |
| 1–3 | **M1 TLK** | Pemohon mohon → pertindihan ditolak → pelulus lulus → `TLK-2026-####` |
| 3–5 | **M2 Pas** | Mohon + dokumen → penyemak → pelulus → garis masa `status_logs` |
| 5–6 | **M3 Laporan** | Tapis RPT-01/02 → halaman 2 kekal filter → PDF & Excel dengan jumlah sama |
| 6–7 | **M4 Statistik** | 4 KPI + 4 carta; lulus satu permohonan pas → KPI "Pas menunggu" berubah serta-merta (invalidasi) |
| 7–8 | **Terangkan kod** | Panel pilih **satu fail + satu baris**; peserta menerangkan sendiri |
| Selepas 8 | **Markah** | Panel isi rubrik; peserta seterusnya bersedia |

Rubrik penuh & helaian markah: [`docs/rubrik-capstone.md`](../docs/rubrik-capstone.md). Ringkasan pemberat:

| Kriteria | Markah |
|----------|--------|
| A. Kefungsian 4 modul (TLK 8 · Pas 8 · Laporan 7 · Statistik 7) | 30 |
| B. Keselamatan & kawalan akses | 20 |
| C. Kualiti kod & seni bina (termasuk peraturan perniagaan dalam service) | 20 |
| D. Ujian automatik | 15 |
| E. Demo & penerangan | 15 |
| **Jumlah** | **100** |

Terdapat juga 5 **gate kritikal** (cth pemohon tidak boleh melihat rekod orang lain, `.env` tidak dalam Git) — satu gate gagal menghadkan keputusan kepada *Lulus bersyarat*.

> 💡 **Tip demo:** Sediakan **data demo** sebelum mula (`migrate:refresh` + seed), buka tab pelayar untuk setiap peranan, dan tulis skrip 1 halaman. Demo yang gagal hampir selalu kerana "data semalam" atau "lupa kata laluan", bukan kerana kod.

### 4.2 Retrospektif — Start / Stop / Continue

Setiap peserta menulis sekurang-kurangnya satu kad untuk setiap lajur. Tujuannya **penambahbaikan**, bukan penilaian individu.

| 🟢 **Start** (mula buat) | 🔴 **Stop** (berhenti buat) | 🔵 **Continue** (teruskan) |
|--------------------------|-----------------------------|----------------------------|
| Amalan yang patut kita mulakan dalam projek sebenar | Amalan yang merugikan masa/kualiti | Amalan yang terbukti berkesan |
| cth "Tulis ujian gagal sebelum baiki" | cth "Commit terus ke `main`" | cth "Kad spesifikasi sebelum SQL" |

### 4.3 Kriteria sijil tamat kursus

Sijil **tamat kursus** dikeluarkan kepada peserta yang memenuhi **semua** kriteria berikut (tertakluk kepada peraturan penganjur):

| # | Kriteria | Bukti |
|---|----------|-------|
| 1 | Kehadiran **≥ 80 %** sesi (≥ 32 daripada 40 sesi S1–S4) | Senarai kehadiran harian |
| 2 | Modul **M1–M4** didemo dalam capstone oleh peserta sendiri | Helaian markah rubrik |
| 3 | Markah capstone peserta **≥ 60 / 100** dan **tiada** kegagalan gate kritikal yang tidak dibaiki | [`rubrik-capstone.md`](../docs/rubrik-capstone.md) |
| 4 | Peserta **sendiri** menerangkan sekurang-kurangnya satu baris kod dengan betul semasa demo (segmen 7–8) | Catatan panel |
| 5 | Repo diserahkan: tag `v1.0-capstone`, `composer test` hijau, tiada `.env`/data sebenar | Pautan repo / arkib zip |

Peserta yang tidak memenuhi kriteria 2–5 tetapi hadir ≥ 80 % menerima **sijil penyertaan** dan pelan tindakan susulan (satu modul untuk disiapkan dalam 2 minggu, disemak jurulatih).

### 🎯 Kuiz S4

1. Seorang peserta mendapat 78/100 dalam rubrik capstone, tetapi semasa demo panel mendapati `pemohon2` boleh membuka permohonan `pemohon1`. Apakah kesannya?
   - [ ] Tiada — markah melebihi 60, jadi lulus penuh
   - [x] Ia kegagalan gate kritikal — keputusan dihadkan kepada *Lulus bersyarat* sehingga dibaiki
   - [ ] Hanya markah kriteria B (Keselamatan & kawalan akses) dikurangkan; keputusan kekal lulus penuh kerana jumlah masih ≥ 60
   - [ ] Peserta terus gagal kursus tanpa peluang membaiki
   > Terdapat 5 gate kritikal (cth pemohon tidak boleh melihat rekod orang lain, `.env` tidak dalam Git). Sijil tamat kursus memerlukan tiada kegagalan gate kritikal yang tidak dibaiki. Pilihan "hanya markah kriteria B dikurangkan" salah kerana gate kritikal menghadkan keputusan tanpa mengira jumlah markah.

2. Seorang peserta hadir 30 daripada 40 sesi. Dia mendapat 85/100 tanpa kegagalan gate, dan dia sendiri menerangkan satu baris kod dengan betul. Adakah dia layak menerima **sijil tamat kursus**?
   - [ ] Ya, kerana markah capstone melebihi 60
   - [ ] Ya, kerana dia menerangkan kod dengan betul
   - [x] Tidak — kehadiran 75 % kurang daripada syarat ≥ 80 % (≥ 32 daripada 40 sesi)
   - [ ] Ya, jika repo ditag `v1.0-capstone` dan `composer test` hijau, kerana kriteria repo mengatasi syarat kehadiran
   > Sijil tamat kursus memerlukan **semua** kriteria dipenuhi. Markah tinggi tidak menggantikan syarat kehadiran ≥ 80 %.

---

## 📦 Hasil Hari Ini

- [ ] `app/Services/StatisticsService.php` — 4 KPI, 4 dataset, `remember()` 10 minit, pemalar `CACHE_KEY`
- [ ] `service('statisticsService')` didaftar dalam `app/Config/Services.php`
- [ ] `app/Controllers/Statistik/DashboardController.php` — `index()` + `data()` (JSON)
- [ ] `app/Views/statistik/dashboard.php` — kad KPI + 4 carta Chart.js 4
- [ ] `cache()->delete(StatisticsService::CACHE_KEY)` selepas `transCommit()` dalam `BookingService` & `PassWorkflowService`
- [ ] `tests/Services/StatisticsCacheTest.php` — hijau (dan **pernah** merah tanpa invalidasi)
- [ ] `docs/UAT-signoff.md` diisi; log pepijat dengan ≥ 1 pepijat ditutup melalui kitaran ujian-gagal
- [ ] Senarai semak keselamatan K1–K10 ditanda
- [ ] Tag `v1.0-capstone`; demo 8 minit; helaian markah ditandatangani → **M4 siap** · **Sistem lengkap** 🎓

---

## 🧠 Semakan Kendiri

**1. Kenapa dashboard memisahkan kad KPI (render di server) dan carta (endpoint JSON)?**
<details><summary>Jawapan</summary>

Kad KPI muncul serta-merta dan berfungsi tanpa JavaScript, serta mudah diuji dengan `FeatureTestTrait`. Carta memerlukan JavaScript; endpoint JSON memisahkan data daripada persembahan dan boleh digunakan semula. Kedua-duanya memanggil `StatisticsService::dashboard()` jadi nombor datang dari cache yang sama.
</details>

**2. `bookings_by_month` memulangkan `[3, 5, 2]` untuk Jan, Feb, Jun. Apa yang salah pada carta dan bagaimana membaikinya?**
<details><summary>Jawapan</summary>

`GROUP BY` tidak memulangkan bulan tanpa rekod, jadi Chart.js melukis 3 nilai itu sebagai Jan, Feb, **Mac**. Baiki dengan memetakan hasil ikut nombor bulan (`array_column($rows, 'total', 'm')`) dan mengisi 12 bulan dengan `?? 0`.
</details>

**3. Terangkan kenapa `cache()->delete('stat_dashboard')` mesti diletakkan selepas `transCommit()`, bukan sebelum.**
<details><summary>Jawapan</summary>

Jika dikosongkan sebelum commit, permintaan lain boleh membina semula cache dalam jurang sebelum commit dan hanya melihat data lama (transaksi belum kelihatan) — data lama itu kemudian kekal sehingga TTL tamat (10 minit). Selepas commit, sebarang binaan semula pasti melihat data baharu. Jika transaksi rollback, tiada perubahan, jadi tiada invalidasi diperlukan.
</details>

**4. Berikan satu kelebihan dan satu kelemahan strategi "TTL + delete semasa tulis" berbanding "TTL sahaja".**
<details><summary>Jawapan</summary>

Kelebihan: dashboard segar serta-merta selepas perubahan status (tiada kekeliruan "saya dah lulus tapi tak berubah"). Kelemahan: pembangun mesti ingat setiap path tulis — terlepas satu (cth kaedah cipta) menyebabkan data basi senyap sehingga TTL tamat. Mitigasi: satu pintu perubahan status (`transition()`), pemalar `CACHE_KEY`, dan ujian automatik.
</details>

**5. Semasa UAT, anda jumpa pepijat. Senaraikan 5 langkah kitaran pembetulan dan terangkan kenapa langkah 2 tidak boleh dilangkau.**
<details><summary>Jawapan</summary>

(1) Reproduce dengan langkah & data tepat; (2) tulis ujian yang **gagal**; (3) baiki dengan perubahan minimum; (4) ujian itu dan semua ujian lain lulus; (5) commit `FIX:` dan kemas kini log pepijat. Langkah 2 membuktikan ujian benar-benar mengesan pepijat — ujian yang tidak pernah dilihat gagal mungkin tidak menguji apa-apa, dan ia menjadi pengawal regresi selama-lamanya.
</details>

---

## ➡️ Langkah seterusnya selepas kursus

Tahniah — anda telah membina sistem 4 modul dari keperluan hingga demo. Sistem ini **latihan**: jangan masukkan data sebenar sehingga ia melalui proses rasmi jabatan anda.

### A. Ke persekitaran *staging* (bukan pengeluaran)

| # | Langkah | Arahan / nota |
|---|---------|---------------|
| 1 | Server PHP 8.2+ dengan `intl`, `mbstring`, `mysqlnd`, `gd`, `zip`, `xml`, `curl` | `php -m` |
| 2 | Document root menghala ke **`public/`** sahaja | Bukan akar projek — jika tidak, `.env` & `writable/` boleh dicapai dari web |
| 3 | Pasang dependency tanpa package dev | `composer install --no-dev --optimize-autoloader` |
| 4 | `.env` staging (tidak dalam Git) | `CI_ENVIRONMENT = production` · `app.baseURL` · `database.default.*` · `php spark key:generate` |
| 5 | Migration | `php spark migrate --all` |
| 6 | Data rujukan sahaja | Seed jabatan/zon/slot; **jangan** jalankan `UserSeeder` sintetik (`Latihan@2026`) di staging — cipta akaun sebenar melalui proses rasmi |
| 7 | Kebenaran folder | `writable/` boleh ditulis oleh pengguna web server; `public/` baca sahaja |
| 8 | Optimumkan | `php spark optimize` (CI 4.5+: cache konfigurasi & lokasi fail) |
| 9 | HTTPS | `app.forceGlobalSecureRequests = true`; sijil TLS daripada pasukan infrastruktur |
| 10 | Tugasan berjadual | cron harian: `php spark pas:expire` (server Windows: Task Scheduler / `schtasks /sc daily`) |
| 11 | Cache | Server tunggal: `file` memadai. Berbilang server: tukar ke Redis/Memcached supaya `cache()->delete()` berkuat kuasa di semua server |
| 12 | Log & sandaran | Putaran `writable/logs/`; sandaran DB harian + ujian pemulihan |
| 13 | Semakan keselamatan | Jalankan semula K1–K10; `composer audit`; ikut prosedur penilaian keselamatan ICT jabatan sebelum pengeluaran |

### B. Pembelajaran lanjut

- **CodeIgniter 4 User Guide** — bab *Testing*, *Caching*, *Events* (cabaran: gantikan panggilan `cache()->delete()` dengan `Events::trigger('status_changed')`) — <https://codeigniter.com/user_guide/>
- **CodeIgniter Shield** — *Authorization*, *Magic Link*, polisi kata laluan — <https://shield.codeigniter.com/>
- **OWASP Top 10** — bandingkan setiap risiko dengan senarai semak K1–K10 — <https://owasp.org/Top10/>
- **Chart.js 4** — aksesibiliti & plugin *datalabels* — <https://www.chartjs.org/docs/latest/>
- Rujukan penuh: [`docs/pautan-rujukan.md`](../docs/pautan-rujukan.md)

### C. Amalan yang dibawa pulang

1. **Peraturan (BR-*) → AC → ujian** sebelum kod.
2. **Satu pintu** untuk perubahan status (service + enum + `status_logs`).
3. **Server** yang menguatkuasa akses — bukan butang yang disembunyikan.
4. **Ujian gagal dahulu** untuk setiap pepijat.
5. **Faham dahulu, terima kemudian** — termasuk cadangan AI.
