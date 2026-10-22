# Finished example — eSPKP Contoh

[← Docs index](./README.md) · [📘 System specification](./spesifikasi-sistem.md) · [📏 Capstone rubric](./rubrik-capstone.md)

**eSPKP Contoh** is a fully finished CodeIgniter 4 application: Security Passes and Special Parking (TLK) with a 6-role approval workflow, built with the same practices as this course. Use it as a **comparison** — open the same screen as your module and see how it is built.

⚠️ **Warning:** this is a training demo, not an official KKM system. All data is synthetic. Do not enter real personal data.

## Open the demo

| Item | Value |
|---|---|
| Address | <https://eskp.synctexts.com> |
| Password for every account | `Latihan@2026` |
| TAC codes & email | Shown on screen (demo mode) — no email is sent |

| IC No. | Role | Try this |
|---|---|---|
| `900101010001` | Applicant (staff) | Apply for a new, lost or damaged pass and TLK; amend; cancel |
| `900101010007` | Company representative | Register company workers; apply for several workers at once |
| `900101010002` | Division secretariat | Check completeness, choose the supervisor |
| `900101010003` | Supervisor | Support / return for amendment |
| `900101010004` | Security Unit (UKS) | Access blocks, lost-pass investigation & charge, assign a TLK lot, issue and hand over cards |
| `900101010005` | Approver | Approve / reject |
| `900101010006` | Administrator | Users, reference codes, announcements, audit log, reports |

Officers (02–06) use **two-step verification**. In the demo, all five accounts share one key: add the key below manually in an authenticator app (for example Google Authenticator — time-based, 6 digits), then enter the 6-digit code after the password.

```text
ESPKPDEMOLATIHANCIKKMSEPULUHXXYZ
```

The shared training accounts cannot change their password or 2FA factors. To try 2FA enrolment, passkeys and password reset, **register your own account** on the Daftar page. Demo data is reset every day at 03:00.

## Compare with your module

| Day | Course topic | Look at in eSPKP Contoh |
|---|---|---|
| 3–4 | Migrations, seeders, models | The database is built from migrations + seeders only; demo data runs through the real workflow |
| 5 | Validation & forms | Application form: required attachments per type, TLK date checks (≤ 90 days, no overlap) |
| 6 | Services & transactions | One status-transition table drives the buttons, server checks and stepper; every action is one transaction |
| 7 | File upload | Attachments outside `public/`, random names, ownership checked before download |
| 8 | Shield & RBAC | 6 Shield groups, permission-based menu, 404 for other people's records, account lockout, 2FA (TOTP & passkey), audit log |
| 9 | Reports & statistics | 9 reports with filters, capped PDF & Excel export, role-based dashboard with cache |
| 10 | Testing & handover | PHPUnit tests (unit, database, HTTP), Playwright end-to-end tests, CI pipeline, Docker |

**Side track (optional):** once your module passes the checklist, find one difference from this example and explain your design choice — a good discussion point for the capstone demo.
