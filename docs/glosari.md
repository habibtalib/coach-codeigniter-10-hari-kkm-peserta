# Glosari BM ↔ English

> Istilah yang digunakan sepanjang kursus CI-KKM-10. Konvensyen: prosa **Bahasa Melayu**, kod & istilah teknikal **English**. Dalam nota, istilah English yang tidak diterjemah ditulis *condong* atau dalam `kod`.
> Nama domain (jadual, enum, status) mengikut [`SPEC-KURSUS.md`](../SPEC-KURSUS.md) dan **tidak diterjemah dalam kod**.

## A. Domain kursus

| Bahasa Melayu | English | Dalam kod / SPEC | Catatan |
|---------------|---------|------------------|---------|
| Tempat Letak Kenderaan Khas (TLK) | Special parking bay | Modul M1, prefix `TLK-{YYYY}-{0000}` | |
| Slot letak kenderaan | Parking slot | `parking_slots` | |
| Zon letak kenderaan | Parking zone | `parking_zones` | |
| Kategori slot | Slot category | `SlotCategory` (`oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`) | Nilai enum kekal BM |
| Tempahan | Booking | `slot_bookings` | |
| Pas | Pass | Modul M2, prefix `PAS-{YYYY}-{0000}` | |
| Permohonan pas | Pass application | `pass_applications` | |
| Jenis pas | Pass type | `PassType` (`kenderaan`, `kakitangan`, `kontraktor`) | |
| Dokumen sokongan | Supporting document | `pass_documents` | |
| Log status / sejarah | Status log / audit trail | `status_logs` | Satu jadual untuk TLK & Pas |
| Nombor rujukan | Reference number | `ref_no`, `ReferenceNumberService`, `reference_sequences` | |
| Jabatan | Department | `departments` | |
| Kenderaan | Vehicle | `vehicles` | Plat rekaan `WXX 1234` |
| Pemohon | Applicant | group `applicant` | |
| Penyemak | Reviewer | group `reviewer` | |
| Pelulus | Approver | group `approver` | |
| Pentadbir | Administrator | group `admin` | |
| Menunggu / Diluluskan / Ditolak / Dibatalkan / Tamat Tempoh | Pending / Approved / Rejected / Cancelled / Expired | `BookingStatus` | |
| Dihantar / Dalam Semakan | Submitted / Under review | `PassStatus::Submitted`, `PassStatus::UnderReview` | |
| Catatan | Remarks | `remarks` | Wajib semasa tolak (BR-PAS-03) |
| Laporan | Report | Modul M3, `RPT-01..03` | |
| Statistik / papan pemuka | Statistics / dashboard | Modul M4, `/statistik` | |
| Kad KPI | KPI card | | Petunjuk prestasi utama |
| Kadar penggunaan | Utilisation rate | | |
| Pemilik sistem | System owner / product owner | | Pihak berkepentingan utama |
| Pegawai | Officer | `pegawai_kanan` (pegawai kanan) | Kakitangan kerajaan |
| Permohonan | Application | `pass_applications` | Permintaan yang dihantar untuk kelulusan |
| Kelulusan | Approval | `PassStatus::Approved`, `BookingStatus` | Keputusan yang dibuat oleh pelulus |
| Hari N | Day N | `hari-N/` | cth Hari 3 = Day 3 |

## B. Keperluan & reka bentuk (Hari 1–3)

| Bahasa Melayu | English | Singkatan | Catatan |
|---------------|---------|-----------|---------|
| Keperluan pengguna | User requirements | URS (*User Requirement Specification*) | |
| Keperluan fungsian | Functional requirement | FR (cth `FR-TLK-01`) | Apa sistem **buat** |
| Keperluan bukan fungsian | Non-functional requirement | NFR | Prestasi, keselamatan, kebolehgunaan |
| Kriteria penerimaan | Acceptance criteria | AC | Format Given/When/Then |
| Diberi / Apabila / Maka | Given / When / Then | | |
| Peraturan perniagaan | Business rule | `BR-*` | |
| Pihak berkepentingan | Stakeholder | | |
| Titik kesakitan | Pain point | | Masalah proses semasa |
| Carta alir semasa / cadangan | As-is / to-be process flow | | |
| Keutamaan MoSCoW | MoSCoW prioritisation | Must / Should / Could / Won't | |
| Rajah hubungan entiti | Entity-relationship diagram | ERD | |
| Kamus data | Data dictionary | | Jenis, null, indeks, FK |
| Kekardinalan | Cardinality | 1:1, 1:N, M:N | |
| Penormalan | Normalisation | 3NF | |
| Kunci primer / asing | Primary / foreign key | PK / FK | |
| Indeks unik | Unique index | `UNIQUE` | |
| Rangka skrin | Wireframe / mockup | | |
| Ujian penerimaan pengguna | User acceptance testing | UAT | |
| Definisi Siap | Definition of Done | DoD | [`KOLABORASI.md`](../KOLABORASI.md) §2 |

## C. CodeIgniter 4 & PHP

| Bahasa Melayu | English | Dalam CI4 | Nota |
|---------------|---------|-----------|------|
| Rangka kerja | Framework | CodeIgniter 4.6 | |
| Model–Paparan–Pengawal | Model–View–Controller | MVC | [01](../nota/01-mvc-dan-kitaran-request-ci4.md) |
| Pengawal | Controller | `app/Controllers/` | |
| Paparan | View | `app/Views/`, `view()` | |
| Susun atur | Layout | `$this->extend()`, `$this->section()` | |
| Laluan | Route | `app/Config/Routes.php` | |
| Penapis | Filter (middleware) | `app/Config/Filters.php` | |
| Permintaan / respons | Request / response | `$this->request`, `$this->response` | |
| Kitaran hayat permintaan | Request lifecycle | | |
| Pemindahan skema | Migration | `php spark migrate` | [02](../nota/02-migration-seeder-dan-query-builder.md) |
| Penyemai data | Seeder | `php spark db:seed` | |
| Pembina query | Query Builder | `$db->table()` | |
| Pengikatan parameter | Parameter binding | `?` placeholder | Elak SQL injection |
| Entiti | Entity | `CodeIgniter\Entity\Entity` | [03](../nota/03-model-entity-dan-enum.md) |
| Enum bersandar | Backed enum | `enum BookingStatus: string` | PHP 8.1+ |
| Medan dibenarkan | Allowed fields | `$allowedFields` | Halang *mass assignment* |
| Padam lembut | Soft delete | `$useSoftDeletes`, `deleted_at` | |
| Panggil balik model | Model callback | `$beforeInsert`, `$afterUpdate` | |
| Pengesahan input | Validation | `$validationRules`, `validateData()` | [04](../nota/04-validasi-dan-borang.md) |
| Peraturan tersuai | Custom rule | `Config\Validation::$ruleSets` | |
| Input lama | Old input | `old()`, `withInput()` | |
| Mesej kilat | Flash message | `session()->setFlashdata()`, `->with()` | |
| Penomboran halaman | Pagination | `paginate()`, `$pager->links()` | |
| Lapisan servis | Service layer | `app/Services/`, `service()` | [05](../nota/05-service-layer-dan-transaksi.md) |
| Pengawal nipis | Thin controller | | Logik dalam Service |
| Transaksi | Transaction | `transStart()`, `transComplete()` | |
| Kunci baris | Row lock | `SELECT … FOR UPDATE` | |
| Keadaan perlumbaan | Race condition | | Dua permintaan serentak |
| Pengecualian | Exception | `throw`, `try/catch` | |
| Fail dimuat naik | Uploaded file | `UploadedFile`, `getFile()` | [07](../nota/07-muat-naik-fail-selamat.md) |
| Nama rawak | Random name | `getRandomName()` | |
| Cache / cache kosongkan | Cache / cache invalidation | `cache()->remember()`, `cache()->delete()` | [09](../nota/09-statistik-chartjs-dan-cache.md) |
| Titik akhir JSON | JSON endpoint | `$this->response->setJSON()` | |
| Eksport | Export | Dompdf, PhpSpreadsheet | [08](../nota/08-laporan-eksport-pdf-excel.md) |
| Pembolehubah persekitaran | Environment variable | `.env` | Jangan commit |
| Antara muka baris arahan | Command-line interface | Spark (`php spark`) | |
| Pengurus pakej | Package manager | Composer | |

## D. Keselamatan & akses

| Bahasa Melayu | English | Dalam CI4 / Shield | Nota |
|---------------|---------|---------------------|------|
| Pengesahan identiti | Authentication (authn) | Shield `session`, `auth()->loggedIn()` | "Siapa anda?" |
| Kebenaran | Authorization (authz) | `can()`, `inGroup()`, filter `permission:` | "Apa anda boleh buat?" |
| Kawalan akses berasaskan peranan | Role-based access control | RBAC, `AuthGroups` | [06](../nota/06-shield-auth-dan-rbac.md) |
| Kumpulan / kebenaran | Group / permission | `$groups`, `$permissions`, `$matrix` | |
| Semakan pemilikan | Ownership check | `user_id === auth()->id()` | BR-PAS-04 |
| Rujukan objek terus tidak selamat | Insecure direct object reference | IDOR | |
| Pemalsuan permintaan rentas tapak | Cross-site request forgery | CSRF, `csrf_field()` | |
| Skrip rentas tapak | Cross-site scripting | XSS, `esc()` | |
| Suntikan SQL | SQL injection | Query Builder / binding | |
| Tugasan beramai-ramai | Mass assignment | `$allowedFields` | |
| Suntikan formula | Formula / CSV injection | | Eksport Excel |
| Pertahanan berlapis | Defence in depth | Filter + service + DB | |
| Kata laluan dicincang | Hashed password | Shield (`password_hash`) | |
| Pendikit log masuk | Login throttling | Filter `auth-rates` | |
| Pengepala keselamatan | Security headers | Filter `secureheaders`, CSP | [11](../nota/11-keselamatan-aplikasi-web.md) |
| Data sintetik | Synthetic data | `@latihan.test` | Wajib |

## E. Ujian & kualiti

| Bahasa Melayu | English | Dalam kod | Nota |
|---------------|---------|-----------|------|
| Ujian unit | Unit test | `CIUnitTestCase` | [10](../nota/10-ujian-phpunit-ci4.md) |
| Ujian ciri / fungsian | Feature / functional test | `FeatureTestTrait` | |
| Ujian pangkalan data | Database test | `DatabaseTestTrait` | |
| Bertindak sebagai | Acting as (a user) | `actingAs($user)` | Shield `AuthenticationTesting` |
| Penegasan | Assertion | `assertStatus()`, `seeInDatabase()` | |
| Pembekal data | Data provider | `#[DataProvider]` | PHPUnit 10+ |
| Kes sempadan | Edge case / boundary case | | |
| Ujian positif / negatif | Positive / negative test | | Akses dibenarkan / ditolak |
| Hasilkan semula → ujian gagal → baiki | Reproduce → failing test → fix | | Kitaran pepijat |
| Pepijat | Bug | | |
| Semakan kod | Code review | | |

## F. Git & kolaborasi

| Bahasa Melayu | English | Arahan | Nota |
|---------------|---------|--------|------|
| Kawalan versi | Version control | Git | [12](../nota/12-git-aliran-kerja.md) |
| Repositori | Repository | `git init`, `git clone` | |
| Cabang | Branch | `git switch -c feat/…` | Satu ciri = satu cabang |
| Serah / komit | Commit | `git commit -m "TLK: …"` | |
| Gabung | Merge | `git merge` | |
| Konflik gabungan | Merge conflict | `<<<<<<<`, `=======`, `>>>>>>>` | |
| Tolak / tarik | Push / pull | `git push`, `git pull` | |
| Permintaan gabung | Pull request / merge request | PR / MR | |
| Simpanan sementara | Stash | `git stash` | |
| Pemandu / navigator | Driver / navigator | | Pengaturcaraan berpasangan |
| Pembantu AI | AI assistant | Claude Code | [`pustaka-prompt.md`](./pustaka-prompt.md) |
