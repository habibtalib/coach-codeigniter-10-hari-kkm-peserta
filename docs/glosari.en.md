# Glossary Malay ↔ English

> Terms used throughout the CI-KKM-10 course. Convention: prose in **Malay**, code and technical terms in **English**. In prose, technical terms are written in plain English (see the table below); names from code are written as `code`.
> Domain names (tables, enums, statuses) follow [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md) and are **not translated in code**.

## Technical terms in prose

Write the way KKM developers talk at work: Malay sentences, English technical terms. Common terms are written plainly (not in *italics*); names from code are written as `code`.

| Don't write | Write | Keep the Malay word when it means… |
|-------------|-------|------------------------------------|
| laluan | route | a file path (*path*), the catch-up track |
| penapis | filter | |
| pelayan | server | |
| cawangan / cabang (Git) | branch | |
| sambungan | extension (PHP/VS Code), connection (DB) | a continuation |
| pengawal | controller | |
| paparan (in code) | view | a screen shown to the user |
| templat (code/view) | template | the "Templat & Rujukan" label, the `templates/` folder |
| pangkalan data | database | |
| pemboleh ubah / tatasusunan / rentetan | variable / array / string | |
| kebergantungan / pakej | dependency / package | |

Stay in Malay: ralat (error), sesi (class session), pengesahan (owner sign-off), ujian (testing), semakan (review), keperluan (requirements).

## A. Course domain

| Malay | English | In code / SPEC | Notes |
|---------------|---------|------------------|---------|
| Tempat Letak Kenderaan Khas (TLK) | TLK (Special Vehicle Parking) | Module M1, prefix `TLK-{YYYY}-{0000}` | |
| Slot letak kenderaan | Parking slot | `parking_slots` | |
| Zon letak kenderaan | Parking zone | `parking_zones` | |
| Kategori slot | Slot category | `SlotCategory` (`oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`) | Enum values stay in Malay |
| Tempahan | Booking | `slot_bookings` | |
| Pas | Pass | Module M2, prefix `PAS-{YYYY}-{0000}` | |
| Permohonan pas | Pass application | `pass_applications` | |
| Jenis pas | Pass type | `PassType` (`kenderaan`, `kakitangan`, `kontraktor`) | |
| Dokumen sokongan | Supporting document | `pass_documents` | |
| Log status / sejarah | Status log / audit trail | `status_logs` | One table for both TLK and Pass |
| Nombor rujukan | Reference number | `ref_no`, `ReferenceNumberService`, `reference_sequences` | |
| Jabatan | Department | `departments` | |
| Kenderaan | Vehicle | `vehicles` | Made-up plates `WXX 1234` |
| Pemohon | Applicant | group `applicant` | |
| Penyemak | Reviewer | group `reviewer` | |
| Pelulus | Approver | group `approver` | |
| Pentadbir | Administrator | group `admin` | |
| Menunggu / Diluluskan / Ditolak / Dibatalkan / Tamat Tempoh | Pending / Approved / Rejected / Cancelled / Expired | `BookingStatus` | |
| Dihantar / Dalam Semakan | Submitted / Under review | `PassStatus::Submitted`, `PassStatus::UnderReview` | |
| Catatan | Remarks | `remarks` | Required when rejecting (BR-PAS-03) |
| Laporan | Report | Module M3, `RPT-01..03` | |
| Statistik / papan pemuka | Statistics / dashboard | Module M4, `/statistik` | |
| Kad KPI | KPI card | | Key performance indicator |
| Kadar penggunaan | Utilisation rate | | |
| Pemilik sistem | System owner | | Main stakeholder (also called *product owner*) |
| Pegawai | Officer | `pegawai_kanan` (senior officer) | Government staff member |
| Permohonan | Application | `pass_applications` | A request submitted for approval |
| Kelulusan | Approval | `PassStatus::Approved`, `BookingStatus` | Decision made by the approver |
| Hari N | Day N | `hari-N/` | e.g. Hari 3 = Day 3 |

## B. Requirements & design (Day 1–3)

| Malay | English | Abbreviation | Notes |
|---------------|---------|-----------|---------|
| Keperluan pengguna | User requirements | URS (*User Requirement Specification*) | |
| Keperluan fungsian | Functional requirement | FR (e.g. `FR-TLK-01`) | What the system **does** |
| Keperluan bukan fungsian | Non-functional requirement | NFR | Performance, security, usability |
| Kriteria penerimaan | Acceptance criteria | AC | Given/When/Then format |
| Diberi / Apabila / Maka | Given / When / Then | | |
| Peraturan perniagaan | Business rule | `BR-*` | |
| Pihak berkepentingan | Stakeholder | | |
| Titik kesakitan | Pain point | | Problem in the current process |
| Carta alir semasa / cadangan | As-is / to-be process flow | | |
| Keutamaan MoSCoW | MoSCoW prioritisation | Must / Should / Could / Won't | |
| Rajah hubungan entiti | Entity-relationship diagram | ERD | |
| Kamus data | Data dictionary | | Type, null, index, FK |
| Kekardinalan | Cardinality | 1:1, 1:N, M:N | |
| Penormalan | Normalisation | 3NF | |
| Kunci primer / asing | Primary / foreign key | PK / FK | |
| Indeks unik | Unique index | `UNIQUE` | |
| Rangka skrin | Wireframe / mockup | | |
| Ujian penerimaan pengguna | User acceptance testing | UAT | |
| Definisi Siap | Definition of Done | DoD | [`docs/kolaborasi.md`](kolaborasi.md) §2 |

## C. CodeIgniter 4 & PHP

| Malay | English | In CI4 | Notes |
|---------------|---------|-----------|------|
| Rangka kerja | Framework | CodeIgniter 4.6 | |
| Model–Paparan–Pengawal | Model–View–Controller | MVC | [01](nota-01-mvc-dan-kitaran-request-ci4.md) |
| Pengawal | Controller | `app/Controllers/` | |
| Paparan | View | `app/Views/`, `view()` | |
| Susun atur | Layout | `$this->extend()`, `$this->section()` | |
| Laluan | Route | `app/Config/Routes.php` | |
| Penapis | Filter (middleware) | `app/Config/Filters.php` | |
| Permintaan / respons | Request / response | `$this->request`, `$this->response` | |
| Kitaran hayat permintaan | Request lifecycle | | |
| Pemindahan skema | Migration | `php spark migrate` | [02](nota-02-migration-seeder-dan-query-builder.md) |
| Penyemai data | Seeder | `php spark db:seed` | |
| Pembina query | Query Builder | `$db->table()` | |
| Pengikatan parameter | Parameter binding | `?` placeholder | Prevents SQL injection |
| Entiti | Entity | `CodeIgniter\Entity\Entity` | [03](nota-03-model-entity-dan-enum.md) |
| Enum bersandar | Backed enum | `enum BookingStatus: string` | PHP 8.1+ |
| Medan dibenarkan | Allowed fields | `$allowedFields` | Blocks *mass assignment* |
| Padam lembut | Soft delete | `$useSoftDeletes`, `deleted_at` | |
| Panggil balik model | Model callback | `$beforeInsert`, `$afterUpdate` | |
| Pengesahan input | Validation | `$validationRules`, `validateData()` | [04](nota-04-validasi-dan-borang.md) |
| Peraturan tersuai | Custom rule | `Config\Validation::$ruleSets` | |
| Input lama | Old input | `old()`, `withInput()` | |
| Mesej kilat | Flash message | `session()->setFlashdata()`, `->with()` | |
| Penomboran halaman | Pagination | `paginate()`, `$pager->links()` | |
| Lapisan servis | Service layer | `app/Services/`, `service()` | [05](nota-05-service-layer-dan-transaksi.md) |
| Pengawal nipis | Thin controller | | Logic lives in the Service |
| Transaksi | Transaction | `transStart()`, `transComplete()` | |
| Kunci baris | Row lock | `SELECT … FOR UPDATE` | |
| Keadaan perlumbaan | Race condition | | Two requests at the same time |
| Pengecualian | Exception | `throw`, `try/catch` | |
| Fail dimuat naik | Uploaded file | `UploadedFile`, `getFile()` | [07](nota-07-muat-naik-fail-selamat.md) |
| Nama rawak | Random name | `getRandomName()` | |
| Cache / cache kosongkan | Cache / cache invalidation | `cache()->remember()`, `cache()->delete()` | [09](nota-09-statistik-chartjs-dan-cache.md) |
| Titik akhir JSON | JSON endpoint | `$this->response->setJSON()` | |
| Eksport | Export | Dompdf, PhpSpreadsheet | [08](nota-08-laporan-eksport-pdf-excel.md) |
| Pembolehubah persekitaran | Environment variable | `.env` | Never commit it |
| Antara muka baris arahan | Command-line interface | Spark (`php spark`) | |
| Pengurus pakej | Package manager | Composer | |

## D. Security & access

| Malay | English | In CI4 / Shield | Notes |
|---------------|---------|---------------------|------|
| Pengesahan identiti | Authentication (authn) | Shield `session`, `auth()->loggedIn()` | "Who are you?" |
| Kebenaran | Authorization (authz) | `can()`, `inGroup()`, filter `permission:` | "What are you allowed to do?" |
| Kawalan akses berasaskan peranan | Role-based access control | RBAC, `AuthGroups` | [06](nota-06-shield-auth-dan-rbac.md) |
| Kumpulan / kebenaran | Group / permission | `$groups`, `$permissions`, `$matrix` | |
| Semakan pemilikan | Ownership check | `user_id === auth()->id()` | BR-PAS-04 |
| Rujukan objek terus tidak selamat | Insecure direct object reference | IDOR | |
| Pemalsuan permintaan rentas tapak | Cross-site request forgery | CSRF, `csrf_field()` | |
| Skrip rentas tapak | Cross-site scripting | XSS, `esc()` | |
| Suntikan SQL | SQL injection | Query Builder / binding | |
| Tugasan beramai-ramai | Mass assignment | `$allowedFields` | |
| Suntikan formula | Formula / CSV injection | | Excel export |
| Pertahanan berlapis | Defence in depth | Filter + service + DB | |
| Kata laluan dicincang | Hashed password | Shield (`password_hash`) | |
| Pendikit log masuk | Login throttling | Filter `auth-rates` | |
| Pengepala keselamatan | Security headers | Filter `secureheaders`, CSP | [11](nota-11-keselamatan-aplikasi-web.md) |
| Data sintetik | Synthetic data | `@latihan.test` | Mandatory |

## E. Testing & quality

| Malay | English | In code | Notes |
|---------------|---------|-----------|------|
| Ujian unit | Unit test | `CIUnitTestCase` | [10](nota-10-ujian-phpunit-ci4.md) |
| Ujian ciri / fungsian | Feature / functional test | `FeatureTestTrait` | |
| Ujian pangkalan data | Database test | `DatabaseTestTrait` | |
| Bertindak sebagai | Acting as (a user) | `actingAs($user)` | Shield `AuthenticationTesting` |
| Penegasan | Assertion | `assertStatus()`, `seeInDatabase()` | |
| Pembekal data | Data provider | `#[DataProvider]` | PHPUnit 10+ |
| Kes sempadan | Edge case / boundary case | | |
| Ujian positif / negatif | Positive / negative test | | Access allowed / denied |
| Hasilkan semula → ujian gagal → baiki | Reproduce → failing test → fix | | Bug-fix cycle |
| Pepijat | Bug | | |
| Semakan kod | Code review | | |

## F. Git & collaboration

| Malay | English | Command | Notes |
|---------------|---------|--------|------|
| Kawalan versi | Version control | Git | [12](nota-12-git-aliran-kerja.md) |
| Repositori | Repository | `git init`, `git clone` | |
| Cabang | Branch | `git switch -c feat/…` | One feature = one branch |
| Serah / komit | Commit | `git commit -m "TLK: …"` | |
| Gabung | Merge | `git merge` | |
| Konflik gabungan | Merge conflict | `<<<<<<<`, `=======`, `>>>>>>>` | |
| Tolak / tarik | Push / pull | `git push`, `git pull` | |
| Permintaan gabung | Pull request / merge request | PR / MR | |
| Simpanan sementara | Stash | `git stash` | |
| Pemandu / navigator | Driver / navigator | | Pair programming — **optional**; this course is individual work in `kelas-ci-<nama>` |
| Pembantu AI | AI assistant | Claude Code | [`pustaka-prompt.md`](./pustaka-prompt.md) |
