# Day 1 Lab — Scope Chart, Interviews & Requirements List

[📅 Schedule](../JADUAL.md) · [📘 SPEC canon](../SPEC-KURSUS.md) · [📖 Day 1 README](./README.md)

> Every lab today produces **Markdown documents**, not code. Work in pairs (the driver types, the navigator checks against the SPEC) — swap roles every lab.

| Lab | Session | Output |
|-----|---------|--------|
| [Lab 1.1](#lab-11--scope-chart--stakeholders) | S1 | `docs/carta-skop.md` |
| [Lab 1.2](#lab-12--structured-interview-tlk-module) | S2 | `docs/temubual-tlk.md` |
| [Lab 1.3](#lab-13--pass-module-interview) | S3 | `docs/temubual-pas.md` |
| [Lab 1.4](#lab-14--initial-fr--nfr-list--moscow) | S4 | `docs/keperluan-awal.md`, `docs/soalan-terbuka.md` |

---

## Lab 1.0 — Set up the document repo (10 min, S1 minutes 50–85 together with Lab 1.1)

1. Open VS Code → *Terminal → New Terminal*. 🪟 **Windows:** the terminal must be **Git Bash** — `echo $SHELL` prints `/usr/bin/bash` ([`persediaan.md`](../docs/persediaan.md) §5). Create the team's working folder and initialise Git:
   ```bash
   mkdir -p ~/latihan/sistem-tlk-pas/docs
   cd ~/latihan/sistem-tlk-pas
   git init
   echo "# Sistem TLK & Pas — Dokumen Keperluan" > README.md
   git add . && git commit -m "SETUP: mula repo dokumen"
   ```
   > Still in PowerShell? `&&` fails in Windows PowerShell 5.1, and `>` writes `README.md` as UTF-16 (Git and GitLab show it as garbled text). Switch to Git Bash, delete `README.md`, repeat.
2. Open the folder in VS Code. Install the **Markdown Preview Mermaid Support** extension (or use <https://mermaid.live>).

✅ **Checkpoint:** `git log --oneline` shows one commit `SETUP: mula repo dokumen`.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| The first commit fails: `Author identity unknown` / *"Please tell me who you are"* | The Git identity is not set on this computer | Run `git config --global user.name "Aminah Rahim"`, `git config --global user.email "aminah@latihan.test"` and `git config --global init.defaultBranch main` (Day 4 pushes the `main` branch), then repeat `git commit` (use your own name and email) |
| `git branch` shows `master`, not `main` | The repo was created before `init.defaultBranch main` was set | `git branch -m master main` |

---

## Lab 1.1 — Scope Chart & Stakeholders

### 🎯 Objective
Produce a scope chart that states the goal, the 4 modules, what is in and out of scope, the project constraints, and a mapping of stakeholders to Shield roles.

### Prerequisites
- 🪟 **Windows:** run every `bash` block in the VS Code **Git Bash** terminal, not PowerShell ([`persediaan.md`](../docs/persediaan.md) §5).
- You have attended the S1 project briefing.
- Read [`SPEC-KURSUS.md`](../SPEC-KURSUS.md) §1, §2 and §4.

### Steps
1. Create `docs/carta-skop.md` with this outline:
   ```markdown
   # Scope Chart — TLK & Pass System

   ## 1. Goal
   (1–2 sentences: what problem is solved, and for whom)

   ## 2. Modules
   | # | Module | Purpose | Prefix |
   |---|--------|---------|--------|

   ## 3. In scope
   ## 4. Out of scope (this phase)
   ## 5. Constraints (time, technology, data, environment)
   ## 6. Stakeholders
   | Party | Interest | Shield role | Influence (H/M/L) |
   |-------|----------|-------------|-------------------|
   ```
2. Write the **Goal** in the system owner's language, not technical language. Example: *"Make sure special parking slots and access passes are given out fairly, transparently and in a way that can be audited."*
3. Fill in the **Modules** table for M1–M4 based on SPEC §2. TLK stands for Special Vehicle Parking (*Tempat Letak Kenderaan Khas*).
4. List **≥ 5 in-scope items** and **≥ 4 out-of-scope items**. Every in-scope item must link to one module.
5. Add a short Mermaid `flowchart` that shows system → in scope / out of scope (see the example in README §1.2).
6. Fill in **Constraints** — at least 4 rows (time, technology, synthetic data, environment).
7. Fill in the **Stakeholders** table — ≥ 5 rows. Every row must map to `applicant`, `reviewer`, `approver`, `admin` **or** "no account".
8. Commit:
   ```bash
   git add docs/carta-skop.md && git commit -m "SETUP: carta skop & pihak berkepentingan"
   ```

### ✅ Checkpoint
- [ ] The Mermaid chart renders without errors in the preview.
- [ ] Every role name is spelt **exactly** as in SPEC §4 (`applicant`, not `pemohon` or `Applicant`).
- [ ] At least one stakeholder has "no account" (an indirect user).
- [ ] "Out of scope" has **≥ 4 items**, one sentence each, stating what will not be built in this phase.

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| Mermaid shows "Syntax error" | A label contains `(`, `)` or `:` without quotes | Wrap the label in `["..."]` |
| The preview does not show the diagram | The Mermaid extension is not installed | Install the extension or paste the code into mermaid.live |
| Out of scope is empty | You did not ask the system owner | Use README §1.2 as a starting point and confirm with the trainer |

### ⭐ Bonus challenge
Add a Mermaid `quadrantChart` (an influence–interest map) and pick **two** stakeholders who must be interviewed first. Explain why.

---

## Lab 1.2 — Structured Interview: TLK Module

### 🎯 Objective
Run a 35-minute interview with the system owner (the trainer playing a persona), record the answers and at least 5 TLK pain points.

### Prerequisites
- Lab 1.1 is done.
- Read README §2.1 (the 4-phase structure & questioning techniques).

### Steps
1. **Prepare the questions (20 min).** Create `docs/temubual-tlk.md`:
   ```markdown
   # Interview — TLK Module
   Date: 2026-__-__ · Interviewer: ____ · Note-taker: ____ · Respondent: (system owner persona)

   ## A. Prepared questions
   | # | Phase | Question | Answer (short) |
   |---|-------|----------|----------------|

   ## B. Pain points
   | ID | Who is affected | Problem | Impact | Possible requirement |
   |----|-----------------|---------|--------|----------------------|

   ## C. Rules discovered
   ## D. Unanswered questions
   ```
2. Write **≥ 12 questions** covering all four phases (Context, Problem, Detail, Confirmation). You must include:
   - ≥ 2 "What if…?" questions
   - ≥ 1 question about **who** approves
   - ≥ 1 question about the booking **duration**
   - ≥ 1 question about slot **types/categories**
3. **Interview (35 min, as a group).** The trainer plays the system owner persona. Each pair takes turns to ask at least 2 questions. The navigator takes notes.
   > Ground rule: the system owner answers **only** what is asked. Important information may be hidden behind follow-up questions.
4. **Summarise (20 min).** Fill in the "Answer" column. Then fill in the **Pain points** table with ≥ 5 rows `PP-TLK-01`… Every pain point must have all four elements (who, problem, impact, requirement).
5. In section **C. Rules discovered**, match your findings to the BRs in the SPEC:
   ```markdown
   - "One slot cannot be given to two people on the same date" → BR-TLK-01
   - "Maximum 3 months" → BR-TLK-03 (SPEC: 90 days)
   ```
6. In **D**, list anything the system owner said "I'll check later" about — these will move to `docs/soalan-terbuka.md` in Lab 1.4.
7. Commit: `git add docs/ && git commit -m "SETUP: temu bual TLK"`.

### ✅ Checkpoint
- [ ] ≥ 12 questions, with all four phases represented.
- [ ] ≥ 5 pain points, and **none** of them reads like a solution ("no online system").
- [ ] At least **5 of the 6** BR-TLK rules (01–06) have been found and matched in section C.
- [ ] All five `SlotCategory` values are mentioned (`oku`, `mengandung`, `pegawai_kanan`, `kenderaan_rasmi`, `pelawat_vip`).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| The system owner's answers are short and unhelpful | Closed questions ("Any problems?") | Switch to open questions: "Tell me about the last complaint you received, madam" |
| BR-TLK-05 (transaction) is not found | This is a **technical** rule, not one from users | Normal — ask "What happens if two clerks approve the same slot at the same moment?" to expose the need |
| Too much time on one topic | No timekeeper | Appoint a timekeeper; 2 minutes per question |

### ⭐ Bonus challenge
Draw a Mermaid `stateDiagram-v2` of the booking life cycle **based only on the interview answers**, then compare it with `BookingStatus` in SPEC §2.1. List the differences as open questions.

---

## Lab 1.3 — Pass Module Interview

### 🎯 Objective
Gather the Pass module requirements, including the documents for each pass type, the two approval levels and the rejection rules.

### Prerequisites
- Lab 1.2 is done (use the same structure).
- Read README §3.1–3.2.

### Steps
1. Copy the structure of `docs/temubual-tlk.md` into `docs/temubual-pas.md`, and add these sections:
   ```markdown
   ## E. Documents by pass type
   | pass_type | Required documents | Format | Max size |
   |-----------|--------------------|--------|----------|
   | kenderaan | | | |
   | kakitangan | | | |
   | kontraktor | | | |

   ## F. Approval matrix
   | From status | To status | Who | Condition |
   |-------------|-----------|-----|-----------|
   ```
2. Prepare **≥ 10 questions** in three groups: Documents, Approval flow, Duration & expiry (README §3.2).
3. Interview the system owner (Pass persona) — 30 minutes.
4. Fill in table **E** from the answers. Check the format/size limits against **BR-PAS-02**.
5. Fill in table **F** — it must give 5 rows that match the `PassStatus` table in SPEC §2.2.
6. Write ≥ 4 pain points `PP-PAS-nn`.
7. Commit: `git add docs/ && git commit -m "SETUP: temu bual Pas"`.

### ✅ Checkpoint
- [ ] Table E contains all three `pass_type` values, spelt exactly (`kenderaan`, `kakitangan`, `kontraktor`).
- [ ] Table F: 5 transitions; the `→ rejected` row mentions `remarks` ≥ 10 characters.
- [ ] At least one question about **who can view the documents** (BR-PAS-04).
- [ ] At least one question about the document **retention period** is recorded in section D (unanswered questions).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| Participants assume the reviewer also approves | They did not ask "who makes the final decision?" | Follow up: "After the reviewer is satisfied, what happens?" |
| Table F has a `submitted → approved` transition | They assume the approver can skip the review | Confirm with the system owner — the SPEC does not allow it |
| File format is not specific ("picture") | They did not ask for the actual format | "Which picture format? Is `.heic` from an iPhone accepted?" → No (`jpg`/`png` only) |

### ⭐ Bonus challenge
Identify **one field** that must be required for `pass_type = kenderaan` but optional for the other types (hint: look at `pass_applications.vehicle_id` in SPEC §3). Write its validation rule as a plain-language sentence.

---

## Lab 1.4 — Initial FR & NFR List + MoSCoW

### 🎯 Objective
Turn the interview results into a list of requirements with IDs, classified with MoSCoW and traced to the BRs.

### Prerequisites
- Labs 1.2 and 1.3 are done.
- Read README §4.

### Steps
1. Create `docs/keperluan-awal.md`:
   ```markdown
   # Initial Requirements List — v0.1 (Day 1)

   ## 1. Functional Requirements — TLK Module
   | ID | Requirement | Source (PP/interview) | BR | MoSCoW |
   |----|-------------|------------------------|----|--------|

   ## 2. Functional Requirements — Pass Module
   ## 3. Functional Requirements — Reports & Statistics (brief)
   ## 4. Non-Functional Requirements
   | ID | Category | Requirement | How to measure |
   |----|----------|-------------|----------------|
   ## 5. MoSCoW summary
   | Class | Count |
   ```
2. For **every pain point** from Lab 1.2/1.3, write at least one FR. Put the pain point ID in the "Source" column (e.g. `PP-TLK-01`).
3. Use the pattern: **[Actor] can / The system must [action] [object] [condition]**. One FR = one action.
4. Minimum targets: **≥ 16 FRs** — ≥ 8 `FR-TLK-nn`, ≥ 6 `FR-PAS-nn`, ≥ 1 `FR-RPT-nn`, ≥ 1 `FR-STAT-nn`.
5. Write ≥ 5 `NFR-nn` — each one must have a **How to measure** column (e.g. "Try to open `/pas/permohonan/5` as pemohon2 → must return 404").
6. Classify **every** FR and NFR with MoSCoW. Fill in the summary table. If > 60% are "Must", review again.
7. Move all unanswered questions into `docs/soalan-terbuka.md`:
   ```markdown
   | # | Question | Module | Asked by | Status |
   |---|----------|--------|----------|--------|
   | Q-01 | Can an applicant cancel a booking that is still pending? | TLK | Pair A | Open |
   ```
8. **Peer review (10 min):** swap files with the pair next to you. Mark ❌ on any FR that cannot be tested. Fix them.
9. Commit: `git add docs/ && git commit -m "SETUP: senarai awal FR/NFR v0.1"`.

### ✅ Checkpoint
- [ ] ≥ 16 FRs (≥ 8 `FR-TLK`, ≥ 6 `FR-PAS`, ≥ 1 `FR-RPT`, ≥ 1 `FR-STAT`) + ≥ 5 NFRs, each with MoSCoW.
- [ ] Every ID is unique and correctly formatted (`FR-TLK-01`, not `FR-1` or `TLK_FR_01`).
- [ ] Every BR in the SPEC (BR-TLK-01..06, BR-PAS-01..06) is traced by **at least one** FR or NFR.
- [ ] There are at least 2 "Won't" items.
- [ ] A reviewer from another pair finds no FR that combines two actions.
- [ ] `docs/soalan-terbuka.md` has ≥ 3 questions.

> ⏱️ Out of time? Unfinished items may be completed during the Day 2 recap (08:30).

### 🧯 Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| An FR names a class/code (`BookingService`) | Mixing requirements with design | Write from the user's point of view; design comes on Days 3–4 |
| BR-PAS-05 has no FR | The audit requirement was forgotten | Add the FR "The system must record every status transition…" |
| NFR with no measure | "Secure", "fast" | Add the How to measure column; if it cannot be measured, rewrite it |

### ⭐ Bonus challenge
Build a short **traceability matrix**: rows = BRs (12 rows), columns = the FRs that trace them. Identify any BR traced by more than one FR and explain why that is acceptable.

---

## Self-check — end of day

```bash
ls docs/
# carta-skop.md  keperluan-awal.md  soalan-terbuka.md  temubual-pas.md  temubual-tlk.md
git log --oneline
```

✅ Five files exist, with at least 4 commits that have clear messages.
