# KOLABORASI — Working Agreement

> How we work throughout the 10 days. Technical canon: [`SPEC-KURSUS.md`](./SPEC-KURSUS.md).

## 1. Git — one branch per feature

```bash
git switch main && git pull
git switch -c feat/tlk-borang-tempahan      # one feature = one branch
# … work, small & frequent commits …
git commit -m "TLK: tambah validasi tarikh tempahan"
git push -u origin feat/tlk-borang-tempahan # open a PR/merge request
```

Commit prefixes: `TLK:` · `PAS:` · `RPT:` · `STAT:` · `SETUP:` · `FIX:`.

## 2. Definition of Done (DoD)

A feature is "done" only when:

- [ ] The acceptance criteria (Given/When/Then) from the URS **pass** manual testing.
- [ ] Validation runs on the **server** (Model rules / Validation) — not JavaScript only.
- [ ] Access is controlled on the server (filter + ownership check).
- [ ] Status transitions are recorded in `status_logs` (where relevant).
- [ ] The related PHPUnit tests pass (`vendor/bin/phpunit`).
- [ ] No `.env`/secrets in the commit; synthetic data only.
- [ ] The participant can **explain** every line of code to a colleague/the trainer.

Run the tests with `composer test` (= `vendor/bin/phpunit`; it works the same in Git Bash, PowerShell, macOS and Linux).

## 3. AI discipline — "understand first, accept later"

Claude Code (or any AI) **is allowed** to: explain errors, suggest tests, review logic, generate small boilerplate.
**Not allowed:** generating a whole module to copy. A suggestion is accepted **only** after the participant can explain it. On an error: **reproduce → failing test → fix → passing test**.

## 4. Division of work (recommended, Day 4)

Participants work **in pairs** (driver/navigator, swap every session). Every pair builds all four modules in their own repo; the trainer checks at each ✅ checkpoint. Fast pairs take on the extra ⭐ challenges.

## 5. Security & data

- **Synthetic** data only (`@latihan.test`, made-up number plates).
- CSRF is enabled (`app/Config/Filters.php` → `globals.before['csrf']`).
- Uploads go in `writable/uploads/` — not `public/`.
- Query Builder / bindings only — no raw SQL concatenated with input.
- View output is escaped with `esc()`.
