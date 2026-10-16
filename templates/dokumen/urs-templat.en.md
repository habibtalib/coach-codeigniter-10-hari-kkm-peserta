# URS — User Requirement Specification: TLK & Pass System

> **Template.** Copy to `docs/URS-v1.md` (Day 2 Lab 2.4). Replace every `<…>`. Delete the "Guide" blocks once filled in. Refer to [`docs/spesifikasi-sistem.md`](../../docs/spesifikasi-sistem.md) for status names, roles and BRs — **do not** invent new values.

---

## 1. Document information

| Item | Value |
|---------|-------|
| System name | Special Vehicle Parking (TLK) & Pass System |
| Organisation | `<Fasiliti KKM rekaan, cth Hospital Latihan Seri Harapan>` |
| System owner | `<nama persona>` |
| Prepared by | `<Pasangan / nama peserta>` |
| Version | `1.0` |
| Date | `2026-__-__` |
| Status | `Draf` (Draft) / `Untuk semakan` (For review) / **`Disahkan`** (Confirmed) |

### 1.1 Version history

| Version | Date | Changes | By |
|-------|--------|-----------|------|
| 0.1 | `<Hari 1>` | Initial list of FRs/NFRs from the interview | `<…>` |
| 0.9 | `<Hari 2>` | After the confirmation session (see the decision log) | `<…>` |
| 1.0 | `<Hari 2>` | Confirmed by the system owner | `<…>` |

---

## 2. Introduction

### 2.1 Background
> Guide: 3–5 sentences about the current process and its problems. Refer to pain points `PP-TLK-nn` / `PP-PAS-nn`.

`<…>`

### 2.2 Goal
`<1–2 ayat dalam bahasa pemilik sistem>`

### 2.3 Scope

| Module | In scope |
|-------|-----------|
| M1 TLK | `<…>` |
| M2 Pass | `<…>` |
| M3 Report | RPT-01, RPT-02, RPT-03 + PDF/Excel export |
| M4 Statistics | 4 KPI cards + 4 charts |

### 2.4 Out of scope (this phase)
- `<cth Bayaran/caj parkir>`
- `<cth Notifikasi SMS/WhatsApp>`
- `<…>`

---

## 3. Stakeholders & roles

| Stakeholder | System role (Shield group) | Responsibilities in the system |
|----------------------|-------------------------------|----------------------------|
| Staff / contractors | `applicant` | Apply for TLK bookings & passes; view their own status |
| Reviewing officer | `reviewer` | Review pass applications; reject with remarks |
| Approving officer | `approver` | Approve/reject TLK bookings & passes; view reports & statistics |
| System administrator | `admin` | Manage zones, slots, users; full access |
| `<pengguna tidak langsung>` | *(no account)* | `<…>` |

---

## 4. Glossary

| Term | Meaning |
|---------|--------|
| TLK | Tempat Letak Kenderaan Khas (Special Vehicle Parking) |
| Slot | One numbered parking bay within a zone |
| Zone | A parking area (e.g. Zone A — Main Lobby) |
| Active booking | A booking with status Pending (`pending`) or Approved (`approved`) |
| `<…>` | `<…>` |

### 4.1 Statuses

| Module | Value | Malay label |
|-------|-------|----------|
| TLK | `pending` | Menunggu (Pending) |
| TLK | `approved` | Diluluskan (Approved) |
| TLK | `rejected` | Ditolak (Rejected) |
| TLK | `cancelled` | Dibatalkan (Cancelled) |
| TLK | `expired` | Tamat Tempoh (Expired) |
| Pass | `submitted` | Dihantar (Submitted) |
| Pass | `under_review` | Dalam Semakan (Under review) |
| Pass | `approved` | Diluluskan (Approved) |
| Pass | `rejected` | Ditolak (Rejected) |
| Pass | `expired` | Tamat Tempoh (Expired) |

---

## 5. To-be process

> Guide: link to `docs/carta-alir.md` or paste the two Mermaid to-be charts. List the ⚡ improvement points.

- Flowchart: `docs/carta-alir.md` (in your project repo)

| ⚡ | Improvement | Pain point | BR |
|----|----------------|------------|----|
| 1 | `<…>` | `<PP-…>` | `<BR-…>` |

---

## 6. Business rules

> Guide: write in the users' language. IDs must be the same as in SPEC §2.

| ID | Rule |
|----|-----------|
| BR-TLK-01 | `<…>` |
| BR-TLK-02 | `<…>` |
| BR-TLK-03 | `<…>` |
| BR-TLK-04 | `<…>` |
| BR-TLK-05 | `<…>` |
| BR-TLK-06 | `<…>` |
| BR-PAS-01 | `<…>` |
| BR-PAS-02 | `<…>` |
| BR-PAS-03 | `<…>` |
| BR-PAS-04 | `<…>` |
| BR-PAS-05 | `<…>` |
| BR-PAS-06 | `<…>` |

---

## 7. Functional requirements

> Guide: pattern *"[Actor] can / The system must [action] [object] [condition]"*. One FR = one action. Only FRs with status Confirmed/Changed.

### 7.1 TLK module

| ID | Requirement | BR | MoSCoW | Status |
|----|-----------|----|--------|--------|
| FR-TLK-01 | `<…>` | `<…>` | Must | Confirmed |

### 7.2 Pass module

| ID | Requirement | BR | MoSCoW | Status |
|----|-----------|----|--------|--------|
| FR-PAS-01 | `<…>` | | | |

### 7.3 Report & Statistics

| ID | Requirement | MoSCoW | Status |
|----|-----------|--------|--------|
| FR-RPT-01 | `<…>` | | |
| FR-STAT-01 | `<…>` | | |

### 7.4 Won't (agreed not to be built in this phase)

| ID | Requirement | Reason (see the decision log) |
|----|-----------|-----------------------------|
| `<…>` | `<…>` | `<D-nn>` |

---

## 8. Non-functional requirements

| ID | Category | Requirement | How to measure |
|----|----------|-----------|-----------|
| NFR-01 | Security | `<…>` | `<…>` |
| NFR-02 | | | |

---

## 9. Acceptance criteria

- Full file: `docs/acceptance-criteria.md` (in your project repo; template: [`acceptance-criteria-templat.md`](./acceptance-criteria-templat.md))
- Summary: `<bil.>` FRs have ACs; total scenarios `<bil.>`.

---

## 10. Traceability matrix

> Guide: one row per BR. No empty AC cells before sign-off. The "Test" column is filled in on Day 6/8.

| BR | FR | AC | Test (Day 6/8) |
|----|----|----|------------------|
| BR-TLK-01 | | | |
| BR-TLK-02 | | | |
| BR-TLK-03 | | | |
| BR-TLK-04 | | | |
| BR-TLK-05 | | | |
| BR-TLK-06 | | | |
| BR-PAS-01 | | | |
| BR-PAS-02 | | | |
| BR-PAS-03 | | | |
| BR-PAS-04 | | | |
| BR-PAS-05 | | | |
| BR-PAS-06 | | | |

---

## 11. Open questions & assumptions

| # | Question / assumption | Action owner | Deadline | Status |
|---|------------------|------------------|--------------|--------|
| Q-01 | `<…>` | `<…>` | `<…>` | Open |
| A-01 | Assumption: `<…>` | — | — | Agreed |

---

## 12. Confirmation

By signing, the system owner agrees that the requirements above are complete for this phase. Changes after v1.0 go through a change request (CR) and raise the document version.

| Role | Name | Date | Decision |
|---------|------|--------|-----------|
| System owner | `<…>` | `<…>` | Confirmed / Rejected (reason: `<…>`) |
| Developer representative (driver) | `<…>` | `<…>` | Prepared |
| Developer representative (navigator) | `<…>` | `<…>` | Reviewed |

### 12.1 Change request log (after v1.0)

| CR-ID | Date | Requirements affected | Change | Impact | Decision |
|-------|--------|--------------------|-----------|-------|-----------|
| CR-01 | | | | | |
