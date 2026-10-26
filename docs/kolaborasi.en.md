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

**Claude Code may write implementation code, with review gates.** From Day 1 to Day 7 morning, Claude explains, plans and reviews; you write the code. From Day 7 afternoon to Day 10, Claude may write module code (Pass, Report, Statistics) **one slice at a time**, and every slice goes through these seven gates:

1. **SPEC.** Read the SPEC section and the related `BR-*` IDs. The project `CLAUDE.md` points to them.
2. **Plan (*Plan* mode).** Ask for a slice plan: files (migration, model, service, controller, view, tests) and the BR mapping, **with no code**. You review and edit the plan.
3. **Implement (*Manual* mode, the default).** Claude edits; you **read every diff** and approve or reject it. The *accept edits*, *auto* and *bypass permissions* modes are not allowed.
4. **Verify.** `composer test`, the browser, and the `ci4-spark` tools (`routes`, `filter_check`, `migrate_status`).
5. **Review.** Run the `semak-ci4` subagent, then ask Claude to fix the findings, with the same diff gate.
6. **Explain.** In `docs/nota-claude.md`, explain 3 key lines in your own words (`fail:baris`, file:line). The quiz checks this understanding.
7. **Commit.** A small commit with a clear message, on a feature branch.

**Still not allowed:** one prompt that generates a whole module; the *auto*/*bypass* modes (or *accept edits*); committing code you cannot explain; secrets (`.env`, passwords, tokens) or real data in a prompt.

The principle stays **"understand first, accept later"**: a diff is accepted **only** after you can explain it. On an error: **reproduce → failing test → fix → passing test**.

## 4. Individual work & review

Every participant works **alone** in the private project `kelas-ci-<nama>` and builds all four modules. The trainer (a Reporter in your project) checks at each ✅ checkpoint and comments on MRs. Help a neighbour by explaining, not by typing for them. Fast participants take on the extra ⭐ challenges.

## 5. Security & data

- **Synthetic** data only (`@latihan.test`, made-up number plates).
- CSRF is enabled (`app/Config/Filters.php` → `globals.before['csrf']`).
- Uploads go in `writable/uploads/` — not `public/`.
- Query Builder / bindings only — no raw SQL concatenated with input.
- View output is escaped with `esc()`.
