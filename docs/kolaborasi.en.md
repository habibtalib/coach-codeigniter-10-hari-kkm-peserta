# KOLABORASI — Working Agreement

How we work throughout the 10 days. Technical canon: [`docs/spesifikasi-sistem.md`](./spesifikasi-sistem.md).

## 1. Git — one branch per feature

```bash
git switch main && git pull
git switch -c feat/tlk-borang-tempahan      # one feature = one branch
# … work, small & frequent commits …
git commit -m "TLK: tambah validasi tarikh tempahan"
git push -u origin feat/tlk-borang-tempahan # open a merge request into your main
```

Every feature goes through a **merge request (MR) into the `main` of your own project** `kelas-ci-<nama>` ([`trek-gitlab.md`](./trek-gitlab.md) §6). Ask the trainer or a neighbour for at least one comment, answer it, then merge it yourself. On Days 2–3 you push straight to `main`; the MR flow starts on Day 4 S4.

Commit prefixes: `TLK:` · `PAS:` · `RPT:` · `STAT:` · `SETUP:` · `FIX:`.

## 2. Definition of Done (DoD)

A feature is "done" only when:

- [ ] The related BR-* rules in [`spesifikasi-sistem.md`](./spesifikasi-sistem.md) are **tested** and pass (manual + PHPUnit).
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

## 4. Individual work & review

Every participant works **alone** in the private project `kelas-ci-<nama>` and builds all four modules. The trainer (a Reporter in your project) checks at each ✅ checkpoint and comments on MRs. Help a neighbour by explaining, not by typing for them. Fast participants take on the extra ⭐ challenges.

## 5. Security & data

- **Synthetic** data only (`@latihan.test`, made-up number plates).
- CSRF is enabled (`app/Config/Filters.php` → `globals.before['csrf']`).
- Uploads go in `writable/uploads/` — not `public/`.
- Query Builder / bindings only — no raw SQL concatenated with input.
- View output is escaped with `esc()`.
