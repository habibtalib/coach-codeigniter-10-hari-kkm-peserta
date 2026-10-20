# Slides — CI-KKM-10

Slide deck for the course **Application Development Coaching with CodeIgniter** (10 days, KKM, RH Dynamic Resources).

| File | Description |
|------|------------|
| `ci-kkm-10.html` | Full deck (129 slides), **one self-contained file**: inline CSS + JavaScript, system fonts, no CDN. Works **without internet**. |

The content follows [`../docs/spesifikasi-sistem.md`](../docs/spesifikasi-sistem.md) and [`../JADUAL.md`](../JADUAL.md). If the SPEC changes (table names, enums, classes, routes), update the related slides.

## Deck order

1. **Introduction** (slides 1–9): cover, agenda, course objectives, 4 modules, what is new, daily rhythm, 10-day map, stack, way of working.
2. **Days 1–10**: each day = navy divider slide → *Today's objectives* → concept/code slides → *Today's deliverables*.
3. **Closing**: security checklist, capstone rubric, next steps, thank you.

## How to present

1. Open `ci-kkm-10.html` in Chrome, Edge or Firefox (double-click it or drag it into the browser).
2. Press **F** for full screen.
3. Press **S** for the speaker notes panel (bottom of the screen: notes, next slide, elapsed-time clock).

The slide stage is fixed at 1280×720 (16:9) and scales automatically to the window size.

### Keyboard shortcuts

| Key | Action |
|---------|----------|
| `→` `↓` `Space` `PageDown` `N` | Next slide |
| `←` `↑` `PageUp` `P` `Shift+Space` | Previous slide |
| `Home` / `End` | First / last slide |
| `G`, number, `Enter` | Jump to a slide (e.g. `G` `4` `2` `Enter`) |
| `O` | Overview of all slides (click to jump) |
| `S` | Open/close speaker notes |
| `F` | Full screen |
| `?` | List of shortcuts |
| `Esc` | Close panel |

Mouse & touch: click the **left half** = previous, the **right half** = next. On a tablet, **swipe** left/right.

Direct links: add `#n` to the URL, e.g. `ci-kkm-10.html#77` opens slide 77 (Day 5). The URL updates as you move.

## Print to PDF

1. Open the deck in **Chrome/Edge** → `Ctrl/Cmd + P`.
2. Destination: **Save as PDF**. Paper size **A4**, orientation **Landscape**, margins **None**.
3. Turn on **Background graphics**.
4. Save. Result: one slide per landscape A4 page (129 pages), page numbers in the corner, **speaker notes are not printed**.

## How to edit

Each slide is one `<section class="slide">` inside `<div class="stage">`. The order in the file = the presentation order; slide numbers are calculated automatically.

```html
<section class="slide">
  <div class="eyebrow">Hari 5 · S1 — Enum</div>
  <h2>Tajuk slaid</h2>
  … kandungan …
  <aside class="notes"><p>Nota penceramah dalam BM.</p></aside>
</section>
```

- The **day label** in the bottom HUD comes from `data-label` on the divider slide (e.g. `data-label="Hari 5 · TLK (1)"`). Following slides inherit that label.
- **Dark slides**: add the `dark` class (+ `divider` for day dividers, `cover` for the cover).
- **Code-heavy slides**: add the `codey` class so the title is more compact.
- **Content limits**: ≤ 6 bullets per slide; code ≤ ~22 lines. If it overflows, split it into two slides.

### Available components

| Class | Use |
|-------|----------|
| `.grid.c2` / `.c3` / `.c4` | 2/3/4-column card grid |
| `.split` (`.l`, `.r`) | Two columns (wide left / wide right) |
| `.card` (+ `.top`, `.side`, `.flat`) | Card; stripe colour follows the module class |
| `.m-tlk` `.m-pas` `.m-rpt` `.m-stat` | Module colours: TLK teal, Pass indigo, Report amber, Statistics rose |
| `.chip` | Rounded chip (use with a module class) |
| `.st.pending` / `.approved` / `.rejected` / … | Status badge (enum value) |
| `ul.checks` / `ul.checks.done` | Objectives list (empty boxes) / deliverables list (ticked boxes) — **wrap the text of each `<li>` in a `<span>`** |
| `ol.steps` | Numbered steps |
| `.callout.tip` / `.warn` / `.danger` | 💡 / ⚠️ boxes |
| `table.t` | Table |
| `.flow > .node + .arr` | Horizontal flow |

### Code blocks

```html
<div class="codewrap"><div class="codebar">app/Enums/BookingStatus.php<span class="lang">php</span></div>
<pre class="code sm" data-lang="php">…kod…</pre></div>
```

- Escape HTML characters in code: `<` → `&lt;`, `>` → `&gt;`, `&` → `&amp;`.
- Syntax colours are manual `<span>`s: `.k` keyword, `.s` string, `.c` comment, `.f` function, `.t` type/class, `.v` variable, `.n` number, `.o` operator. These spans are **optional**. Code without spans still displays correctly (light text on a dark background).
- Code must be valid for **CodeIgniter 4.6+ / PHP 8.2+** and use the exact names from the SPEC.

## Theme tokens

All colours and fonts are defined as CSS variables in `:root` at the top of `<style>`. Change them there only.

| Token | Value | Use |
|-------|-------|----------|
| `--navy-900` / `--navy-800` | `#14213D` / `#1F3864` | Cover & day divider background |
| `--paper` | `#F7F8FA` | Content slide background |
| `--ink` / `--muted` | `#0F172A` / `#64748B` | Main / secondary text |
| `--teal` | `#0EA5A4` | Main accent, TLK module |
| `--amber` | `#F59E0B` | Warnings, Report module |
| `--indigo` | `#6366F1` | Pass module |
| `--rose` | `#F43F5E` | Statistics module |
| `--code-bg` | `#0B1220` | Code block background |
| `--font` | `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", …` | Text font (Inter if installed, otherwise the system font) |
| `--mono` | `ui-monospace, "SF Mono", Consolas, …` | Code font |

Transition animations are ≤ 200 ms and are switched off automatically if the system sets *reduce motion*.

## Check after editing

```bash
grep -c '<section class="slide' ci-kkm-10.html   # number of slides
```

Then open the deck, press `O` to see all slides at once, and check that no text overflows or is cut off.
