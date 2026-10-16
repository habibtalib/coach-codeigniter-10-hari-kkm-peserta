# AI Prompt Library — for LEARNING, not copying

> A collection of Claude Code (or any AI assistant) prompts for the **CI-KKM-10** course. Every prompt has an **ID**, **when to use**, **don't**, and **after** — so it can be referred to in labs and during trainer reviews.
> Basis: [`docs/kolaborasi.md`](kolaborasi.md) §3 · Canon: [`docs/spesifikasi-sistem.md`](spesifikasi-sistem.md)

## Principle: **understand first, accept later**

AI in this course is an **explainer and reviewer**, not a module generator. On Day 10 you will be assessed with one simple question: *"Explain this line."* If the answer is "the AI wrote it", the feature is **not done** (DoD).

```mermaid
flowchart LR
    A[Write the code yourself] --> B{Stuck / unsure?}
    B -- Yes --> C[Use prompt AI-xx]
    C --> D[Read the answer]
    D --> E{Can you explain it<br/>to a colleague?}
    E -- No --> F[Ask a follow-up<br/>or check notes/official docs]
    F --> D
    E -- Yes --> G[Type it yourself + test]
    G --> H[Commit]
    B -- No --> G
```

### Golden rules (apply to every prompt)

| # | Rule | Why |
|---|-----------|--------|
| 1 | **Synthetic data only** — don't paste real KKM data, real names/IC numbers/plates | Government data must not go out to external services |
| 2 | **Don't paste `.env`**, passwords, tokens, `encryption.key` | A pasted secret = a leaked secret |
| 3 | **Include context**: versions (CI 4.6, PHP 8.2+, Shield), related files, the full error message | AI answers are only as good as their context |
| 4 | **Refer to the SPEC**: "Use table/field/enum names as in docs/spesifikasi-sistem.md" | Stops the AI inventing field names (`booking_status` vs `status`) |
| 5 | **Ask for an explanation, not just code** — add "explain why" | You learn from the *why*, not from the *what* |
| 6 | **Verify** with tests, `php spark routes`, `getLastQuery()`, or the official documentation | AI can be confident but wrong — especially with old-version APIs (CI3!) |
| 7 | **Type it yourself** — don't copy-paste large blocks | Typing forces you to read every line |

> ⚠️ **CI3 warning:** many examples on the internet (and in AI training data) are **CodeIgniter 3** (`$this->load->model()`, `$this->input->post()`, `$this->db->insert()` in a controller). If an AI answer contains this syntax, **reject** it and ask again for CI 4.6.

---

## Index

| ID | Prompt | Category | Day |
|----|--------|----------|------|
| **AI-01** | Explain this error | Understand | 4–10 |
| **AI-02** | Explain this code line by line | Understand | 4–10 |
| **AI-03** | Explain a concept with a TLK/Pass domain example | Understand | 4–10 |
| **AI-04** | Check my logic (without rewriting) | Review | 5–10 |
| **AI-05** | Check code against the `BR-*` rules | Review | 6, 8 |
| **AI-06** | File upload security review | Review | 7 |
| **AI-07** | Access control review (RBAC + ownership) | Review | 8 |
| **AI-08** | Pre-commit review (DoD) | Review | 5–10 |
| **AI-09** | Suggest test cases | Test | 6, 8, 9, 10 |
| **AI-10** | Help write a failing test first (reproduce a bug) | Test | 6, 8, 10 |
| **AI-11** | Check the migrations against the reference ERD | Design | 3, 4 |
| **AI-12** | Convert a sketch to Mermaid | Design | 1–3 |
| **AI-13** | Small permitted boilerplate | Build | 4–10 |
| **AI-14** | Quiz me | Understand | Daily recap |

---

## A · Understand

### AI-01 — Explain this error

- **When to use:** An error page appears, `spark` fails, a test is red, and you have already read the error message yourself at least once.
- **Don't:** Paste only the error with no code — or accept "try changing this" without understanding the cause. Don't paste a *stack trace* that contains real paths/passwords.

```prompt title="AI-01"
I am building a CodeIgniter 4.6 application (PHP 8.2+, MySQL 8, Shield).
I get the following error:

[paste the FULL error message + the first 5 lines of the stack trace]

Related code (file: <app/Controllers/Tlk/BookingController.php>):

[paste only the related function]

What I expected to happen: <…>
What I have already tried: <…>

Please:
1. Explain what this error MEANS in plain English.
2. List 2–3 possible causes, most likely first.
3. For each cause, give ONE way for me to verify it myself (command/log/dd()).
DO NOT rewrite my whole file.
```

- **After:** Verify the cause with the suggested method **before** changing the code. Record the real cause in your bug log.

### AI-02 — Explain this code line by line

- **When to use:** You are reading an example from the notes/documentation/a colleague and there is a line you don't understand; or before accepting another AI suggestion.
- **Don't:** Ask for an explanation of 200 lines at once — break it into functions. Don't assume you "understand" just because the explanation sounds logical; try to explain it again in your own words.

```prompt title="AI-02"
Explain the CodeIgniter 4.6 code below LINE BY LINE in plain English.
For each line: (a) what it does, (b) WHY it is needed, (c) what happens if it is removed.
Mark lines related to security (CSRF, esc(), binding, access) with [SECURITY].
If there is CodeIgniter 3 syntax or an outdated practice, say so.

[paste the code — maximum ~40 lines]
```

- **After:** Explain the code to the trainer or a neighbour **without looking at** the AI answer. Can't? Repeat with a follow-up question.

### AI-03 — Explain a concept with a TLK/Pass domain example

- **When to use:** A new concept (transactions, *race condition*, Entity, filter, cache invalidation) feels abstract.
- **Don't:** Ask for a full module's code "as an example".

```prompt title="AI-03"
I am a participant in a CodeIgniter 4.6 course. Explain the concept of <DB transactions and SELECT ... FOR UPDATE>
using the example of a special parking slot booking system (tables slot_bookings,
parking_slots — see the schema below).
- Start with a real-world analogy (not computers).
- Then show what GOES WRONG if this concept is not used (a timeline with 2 users).
- Finally, a SHORT (≤ 15 lines) CI 4.6 code example.
Plain English; keep technical terms as they are.

[paste the related part of the schema from docs/spesifikasi-sistem.md §3]
```

- **After:** Compare with the topic notes ([`nota.md`](nota.md)). If they conflict, **the notes & official documentation win** — ask the trainer.

### AI-14 — Quiz me

- **When to use:** Morning recap (08:30–09:00) or before the demo.
- **Don't:** Ask for the answers together with the questions.

```prompt title="AI-14"
Give me 5 quiz questions (a mix of MCQ and "explain why") about <Shield filters and
ownership checks in CodeIgniter 4.6>, based on the Pass module domain (pass_applications,
roles applicant/reviewer/approver/admin). One question at a time. Wait for my answer,
then give feedback and an explanation before the next question.
```

---

## B · Review

### AI-04 — Check my logic (without rewriting)

- **When to use:** Your code **already runs** but you are unsure about edge cases.
- **Don't:** Let the AI rewrite it — you want a **list of issues**, not new code.

```prompt title="AI-04"
Check the LOGIC of the CodeIgniter 4.6 function below. Business rule context:
- BR-TLK-03: maximum period 90 days; end_date >= start_date; start_date is not in the past.

[paste the function]

List:
1. Edge cases that are NOT handled (give an example input that breaks it).
2. Hidden assumptions in the code.
3. Security issues, if any.
Format: table | Issue | Example input | Effect |. DO NOT rewrite the code.
```

- **After:** For each issue, write a **failing test** first (AI-10), then fix it yourself.

### AI-05 — Check code against the `BR-*` rules

- **When to use:** End of Day 6 (BR-TLK-01..06) and Day 8 (BR-PAS-01..06), before marking a module "done".
- **Don't:** Paste the whole `app/` folder. Choose the related service + controller.

```prompt title="AI-05"
Here are the business rules of the <TLK> module (from docs/spesifikasi-sistem.md):
[paste the list BR-TLK-01..06]

Here is my code:
[paste BookingService.php and the related controller functions]

For EACH rule, give: Status (Met / Partial / Not met), the line of code that
enforces it, and if Partial/Not met — what is missing (an explanation, not code).
Pay special attention: are the overlap check and the approval in ONE transaction
with SELECT ... FOR UPDATE (BR-TLK-05)?
```

- **After:** Update [`senarai-semak-modul.md`](./senarai-semak-modul.md). Every "Not met" → a task for you.

### AI-06 — File upload security review

- **When to use:** Day 7 S3–S4, after the Pass document upload form works.
- **Don't:** Ask the AI to "build a secure upload" from scratch. Don't upload real malicious files to "test".

```prompt title="AI-06"
Do a security review (refer to the OWASP File Upload Cheat Sheet) of my CodeIgniter 4.6
upload code. Requirement BR-PAS-02:
- pdf, jpg, png only; maximum 2 MB per file; maximum 3 files
- store in writable/uploads/pas/ with $file->getRandomName(); only the path in the DB
- download only through a controller that checks ownership (BR-PAS-04)

[paste the validation rules, the create() function and the document download function]

Review and report in a table | Risk | Control in place? (Yes/No/Partial) | Line evidence | Suggestion |
for: file type (extension vs real MIME), size, number of files, file name (path traversal),
storage location (not public/), IDOR on download, Content-Disposition, empty file,
hasMoved()/isValid(). DO NOT rewrite the code — explain only.
```

- **After:** Test every "No" yourself: a `.php` file renamed to `.pdf`, a 2.1 MB file, 4 files, accessing `/pas/permohonan/dokumen/{id}` that belongs to another applicant. See [`nota-07-muat-naik-fail-selamat.md`](nota-07-muat-naik-fail-selamat.md).

### AI-07 — Access control review (RBAC + ownership)

- **When to use:** Day 8 S2–S3.
- **Don't:** Accept an answer that only hides buttons in the view.

```prompt title="AI-07"
CodeIgniter 4.6 + Shield application. Role matrix (AuthGroups::$matrix):
[paste docs/spesifikasi-sistem.md §4]

My routes (app/Config/Routes.php):
[paste the pas/ and tlk/ route groups]

Controller:
[paste the show() and dokumen() functions of ApplicationController]

For each route, answer: who CAN access it, who CANNOT, and is it enforced on the
SERVER (filter + ownership check) or only in the view? Identify any IDOR
(pemohon1 can see pemohon2's application by changing {id} in the URL).
List the positive & negative access tests I need to write.
```

- **After:** Write the negative tests first (applicant → `/pas/semakan` must be denied). See [`nota-06-shield-auth-dan-rbac.md`](nota-06-shield-auth-dan-rbac.md).

### AI-08 — Pre-commit review (DoD)

- **When to use:** Before `git commit` for a complete feature / before a merge.
- **Don't:** Use this as a replacement for a trainer review or a colleague's MR comment.

```bash
git diff --staged > /tmp/diff.txt   # make sure there is no .env in the diff!
```

```prompt title="AI-08"
Review the following CodeIgniter 4.6 diff against the course Definition of Done:
1. Validation on the server (Model $validationRules / $this->validateData) — not JS only?
2. Access controlled on the server (filter + ownership check)?
3. Status transitions recorded in status_logs?
4. View output escaped with esc()?
5. No raw SQL concatenated with input (Query Builder / binding)?
6. No secrets (.env, passwords) and synthetic data only?
7. Table/field/enum names match the SPEC (attached)?
For each item: Pass / Fail + line evidence. Suggest a commit message
in the format "<PREFIX>: <summary>" (TLK/PAS/RPT/STAT/SETUP/FIX).

[paste the diff]
```

- **After:** Fix every "Fail" yourself; run `composer test` before committing.

---

## C · Test

### AI-09 — Suggest test cases

- **When to use:** Day 6 S3, Day 8 S3, Day 9 S4, Day 10 S3 — before writing tests.
- **Don't:** Ask the AI to write the whole test file and then run it without reading. A test you don't understand protects nothing.

```prompt title="AI-09"
For the following function/feature in CodeIgniter 4.6, suggest PHPUnit test cases.
Feature: <BookingService::approve() — approve a TLK booking, check overlap BR-TLK-01>
The related BR-* rules (docs/spesifikasi-sistem.md):
[paste the BR rules]

Give a table | # | Type (unit/feature) | Given | When | Then | BR rule |
Include: the happy path, date edge cases (same day, overlapping by 1 day, adjacent),
access cases (wrong role), invalid status cases. DO NOT write test code yet.
```

- **After:** Choose the 3–5 most important cases; write them yourself following [`nota-10-ujian-phpunit-ci4.md`](nota-10-ujian-phpunit-ci4.md).

### AI-10 — Help write a failing test first (reproduce a bug)

- **When to use:** A bug is found (manual testing/UAT). Cycle: **reproduce → failing test → fix → passing test**.
- **Don't:** Ask the AI to "fix the bug" directly — you will lose the proof that it has been fixed.

```prompt title="AI-10"
Bug: <an approver can approve two overlapping bookings for the same slot>.
Steps to reproduce: <1. … 2. … 3. …>
Expected: <the second booking is rejected with an overlap message>. Actual: <both are approved>.

Help me write ONE CodeIgniter 4.6 PHPUnit test (DatabaseTestTrait, MySQL test DB)
that FAILS now because of this bug. Explain every line of the test.
DO NOT fix the application code — I will fix it myself after the test is red.
```

- **After:** Run `composer test -- --filter <nama>` (`<nama>` = the test name) → it must be **red**. Fix → **green**. Commit with the prefix `FIX:`.

---

## D · Design

### AI-11 — Check the migrations against the reference ERD

- **When to use:** Day 3 S2 (first migrations) and Day 4 S3 (8 more migrations).
- **Don't:** Ask the AI to generate all the migrations — you need to understand the FK order.

```prompt title="AI-11"
Compare my CodeIgniter 4.6 migrations with the canonical schema (docs/spesifikasi-sistem.md §3 and docs/erd-rujukan.md, attached).
Report in a table: | Table | Field | In SPEC | In migration | Issue |
Check: type & length, NULL, UNIQUE, INDEX, FK (onDelete), deleted_at only where
specified, utf8mb4. Also check the migration ORDER (parent tables before child tables).
List issues only.

[paste SPEC §3 and erd-rujukan.md]
[paste the migrations]
```

- **After:** Fix; `php spark migrate:refresh` + `php spark db:seed DatabaseSeeder`.

### AI-12 — Convert a sketch to Mermaid

- **When to use:** Day 2 (as-is/to-be process flow), Day 3 (ERD), status chart.
- **Don't:** Let the AI add entities/steps that are not in your sketch.

```prompt title="AI-12"
Convert the following description into ONE Mermaid code block (<flowchart TD | erDiagram | stateDiagram-v2>).
Use table/status names EXACTLY as I give them. DO NOT add new entities, fields or
steps — if anything is unclear, list it as questions OUTSIDE the code block.

[paste the sketch/description]
```

- **After:** Preview in VS Code (`bierner.markdown-mermaid`); compare with the original sketch.

---

## E · Build (limited)

### AI-13 — Small permitted boilerplate

- **When to use:** Repetitive code whose concept **you already understand**: Bootstrap view structure, `<select>` options from an enum, synthetic seeder data, an HTML table skeleton.
- **Don't:** Ask for a full controller/service/model; ask for "the complete TLK module". That is **forbidden** (KOLABORASI §3).

```prompt title="AI-13"
Generate ONLY <a Bootstrap 5.3 view for the booking list table> with the columns:
ref_no, slot, start_date, end_date, status (badge from BookingStatus::badge()).
Conditions: extend the layout 'layouts/main', use esc() on ALL output, use $pager->links().
No business logic in the view. Explain each part after the code.
```

```prompt title="AI-13"
Generate 10 rows of SYNTHETIC data for the vehicles seeder (plate_no in the made-up format "WXX 1234",
common car models in Malaysia, colour). No real data. Format: PHP array.
```

- **After:** Read, adapt, and **type** it into the project. Note in the commit message if the boilerplate was AI-generated (e.g. `TLK: senarai tempahan (rangka view dibantu AI)`).

---

## Anti-patterns — prompts that are **not** allowed

| ❌ Prompt | Why it is wrong | ✅ Replace with |
|-----------|--------------|-----------------|
| "Build a complete CodeIgniter Pass module with approval." | Breaks KOLABORASI §3; you cannot explain it | AI-03 (concept) + AI-04 (check your logic) |
| "Fix this code." (with no context) | The AI guesses; you don't learn the cause | AI-01 |
| "Write all the tests for my project." | Tests you don't understand = false confidence | AI-09 → write them yourself |
| "Change this code so it passes the tests." | Can weaken the tests or hide bugs | AI-10 + fix it yourself |
| Pasting `.env` / real user data | Leak of secrets/government data | Paste a sample `env` without values |

---

## Understanding check after using AI

Before accepting any suggestion, answer yes to **all** of these:

- [ ] I can explain **every line** to the trainer or a neighbour without looking at the AI answer.
- [ ] I know **why** this solution is correct, not just that "it runs".
- [ ] This syntax is **CodeIgniter 4.6** (not CI3) and the names match the **SPEC**.
- [ ] I have **tested** it (manually or with PHPUnit) — including one negative case.
- [ ] There are no secrets or real data in my prompt.

One "no"? **Don't accept it yet.**
