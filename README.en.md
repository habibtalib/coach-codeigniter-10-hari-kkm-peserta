# Application Development Coaching with CodeIgniter — 10 Days (KKM)

> **Public repo for participants.** Trainer notes, the answer key and trainer-only material are not included here. The latest material is also on pelatih.my.

Course code **CI-KKM-10** · Ministry of Health Malaysia (Kementerian Kesihatan Malaysia) · Prepared by **RH Dynamic Resources**

Complete coaching material (notes, hands-on labs, trainer notes, templates, slides) for building a real **CodeIgniter 4** system with four modules:

| # | Module | Day | Outcome |
|---|-------|------|-------|
| M1 | **TLK (Special Vehicle Parking)** | 5–6 | Special slot applications, availability check, overlap prevention, approve/reject |
| M2 | **Pass** | 7–8 | Pass application + documents, apply → review → approve/reject flow, RBAC, status history |
| M3 | **Report** | 9 | 3 filtered reports + PDF/Excel export |
| M4 | **Statistics** | 10 | KPI dashboard + cross-module charts, cache |

Course map ([`JADUAL.md`](./JADUAL.md) § Phase summary):

| Phase | Days | Focus |
|-------|------|-------|
| **A — Understand & Build CI Basics** | 1–3 | Requirements (Day 1 + Day 2 S1); from Day 2 every participant builds in their own private project **`kelas-ci-<nama>`** on KKM's GitLab: routes, views, forms, database & first migrations |
| **B — Set Up & Build** | 4–8 | Shield, the remaining migrations, the solo Git flow (MRs into your own `main`), **M1 TLK**, **M2 Pass** |
| **C — Report & Hand Over** | 9–10 | **M3 Report**, **M4 Statistics**, final testing; Day 10 closes with an **individual capstone demo to the system owner** |

## Start here

| You are… | Open |
|-------|------|
| Trainer | [`JADUAL.md`](./JADUAL.md) → `hari-N/nota-penceramah.md` → [`slides/`](./slides/) |
| Participant | [`docs/persediaan.md`](./docs/persediaan.md) → `hari-N/README.md` → `hari-N/lab.md` |

## Each day contains

| File | Contents |
|------|-----|
| `README.md` | 🎯 **Measurable learning objectives** (tagged S1–S4) · timetable following the tentative schedule · concept notes for each session · day deliverables · self-check |
| `lab.md` | 🎯 Objective → Prerequisites → numbered steps → ✅ Checkpoint → 🧯 Troubleshooting → ⭐ Challenge |
| `nota-penceramah.md` | Minute-by-minute time breakdown, key messages, questions, common misconceptions, catch-up plan |

## What is new compared with the 15-day edition

| Aspect | Previous edition (`coach-codeigniter-15-hari-kkm`) | This edition (CI-KKM-10) |
|-------|------------------------------------------------|------------------------|
| Duration & scope | 15 days, Parking + Work Permit | **10 compact days** following the tentative schedule, 4 modules (TLK, Pass, Report, Statistics) |
| Objectives | General focus per day | **Measurable objectives per session** + self-check + lab ✅ checkpoints |
| Notes | Short README; labs "to be expanded later" | Full concept notes, step-by-step labs, trainer notes, topical notes in `docs/nota-*` |
| Stack | CI4 + home-made auth | **CI 4.6+ · PHP 8.2 enum · Shield (groups/permissions) · Service layer · Entities** |
| Data integrity | Overlap check in the controller | **Transactions + `SELECT … FOR UPDATE`**, a `reference_sequences` table, a single `status_logs` audit table |
| Report/Statistics | Part of the module dashboards | **Dedicated modules**: 3 reports + PDF/Excel export; Chart.js dashboard + cache + invalidation |
| Testing | Mentioned | PHPUnit tests for overlap, status transitions & role-based access |
| Design | Markdown only | **Modern HTML slide deck** (offline, speaker notes, overview mode, PDF printing) + document templates |

## Structure

```text
JADUAL.md  CLAUDE.md
hari-1/ … hari-10/     README.md · lab.md · nota-penceramah.md
docs/nota-NN-*.md      topical notes (MVC, migration, model/enum, validation, transactions, Shield, upload, reports, cache, testing, security, Git)
templates/dokumen/     URS, acceptance criteria, data dictionary, test cases, UAT sign-off
templates/kod/         trainer reference code (*.php.txt) — answer key
docs/                  setup, kelas-ci repo (trek-gitlab), reference ERD, prompt library, capstone rubric, glossary
slides/                ci-kkm-10.html (open directly in the browser)
```

## Conventions

- Prose in **Malay**; code & technical terms in **English**.
- **Synthetic data only** — no real KKM data. No secrets in the repo.
- AI discipline: **understand first, accept later** — see [`docs/kolaborasi.md`](./docs/kolaborasi.md).

---

*Timetable source: Tentative Schedule for the KKM CodeIgniter Course (RH Dynamic Resources). The timetable can be adjusted to actual needs during the course.*
