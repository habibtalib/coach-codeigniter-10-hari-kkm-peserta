#!/usr/bin/env node
// Semak struktur terjemahan: setiap fail BM yang ada adik `.en.` mesti sama strukturnya.
// Pelatih (training-console) memadankan blok EN dengan blok BM ikut struktur, jadi tajuk,
// kuiz, senarai tugasan, kod dan penanda latihan mesti selari. Peraturan: docs/terjemahan.md.
//   node scripts/semak-terjemahan.mjs            semak semua pasangan + laporan liputan
//   node scripts/semak-terjemahan.mjs <fail…>    semak pasangan tertentu sahaja (BM atau EN)
//   node scripts/semak-terjemahan.mjs --self-test
// Kod keluar 1 jika ada pasangan yang tidak sepadan.
// Diadaptasi daripada kursus-javascript-pgn-5-hari/scripts/semak-terjemahan.mjs
// (adapted from kursus-javascript-pgn-5-hari/scripts/semak-terjemahan.mjs):
// hari-10 (dua digit), blok kod php/sql/powershell/blade, dan senarai fail kursus CI4.
import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── JS tokenizer ──────────────────────────────────────────────────────────────
// Memadam komen; string, template literal dan regex literal dikekalkan sebagai satu token.
const REGEX_BEFORE_KEYWORDS = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);

export function tokenizeJs(src) {
  const tokens = [];
  let i = 0;
  const n = src.length;
  const prevAllowsRegex = () => {
    const p = tokens[tokens.length - 1];
    if (!p) return true;
    if (p.t === 'punct') return !/^[)\]}]$/.test(p.v) || p.v === '}';
    if (p.t === 'word') return REGEX_BEFORE_KEYWORDS.has(p.v);
    return false;
  };
  const readString = (q) => {
    let j = i + 1;
    while (j < n && src[j] !== q) {
      if (src[j] === '\\') j++;
      else if (src[j] === '\n') break; // string tidak ditutup: berhenti di hujung baris
      j++;
    }
    return j + 1;
  };
  const readTemplate = (start) => {
    // pulang [indeks selepas `, bahagian] — ${…} ditokenkan secara rekursif
    let j = start + 1;
    let out = '`';
    while (j < n && src[j] !== '`') {
      if (src[j] === '\\') { out += src[j] + (src[j + 1] ?? ''); j += 2; continue; }
      if (src[j] === '$' && src[j + 1] === '{') {
        let depth = 1;
        let k = j + 2;
        const exprStart = k;
        while (k < n && depth > 0) {
          const c = src[k];
          if (c === '`') { k = readTemplate(k)[0]; continue; }
          if (c === '"' || c === "'") { const save = i; i = k; k = readString(c); i = save; continue; }
          if (c === '/' && src[k + 1] === '/') { while (k < n && src[k] !== '\n') k++; continue; }
          if (c === '/' && src[k + 1] === '*') { k = src.indexOf('*/', k + 2); k = k < 0 ? n : k + 2; continue; }
          if (c === '{') depth++;
          else if (c === '}') depth--;
          k++;
        }
        out += '${' + tokenizeJs(src.slice(exprStart, k - 1)).map((t) => t.v).join(' ') + '}';
        j = k;
        continue;
      }
      out += src[j];
      j++;
    }
    return [j + 1, out + '`'];
  };
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === '←') { while (i < n && src[i] !== '\n') i++; continue; } // anotasi jurulatih
    if (c === '"' || c === "'") { const e = readString(c); tokens.push({ t: 'str', v: src.slice(i, e) }); i = e; continue; }
    if (c === '`') { const [e, v] = readTemplate(i); tokens.push({ t: 'tpl', v }); i = e; continue; }
    if (c === '/' && src[i - 1] !== '<' && prevAllowsRegex()) { // `</tag>` dalam JSX/HTML bukan regex
      let j = i + 1;
      let inClass = false;
      while (j < n && src[j] !== '\n') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '[') inClass = true;
        else if (src[j] === ']') inClass = false;
        else if (src[j] === '/' && !inClass) break;
        j++;
      }
      if (src[j] === '/') {
        j++;
        while (j < n && /[a-z]/i.test(src[j])) j++;
        tokens.push({ t: 're', v: src.slice(i, j) });
        i = j;
        continue;
      }
    }
    const w = /^(?:[A-Za-z_$À-￿][\w$À-￿]*|\d[\w.]*|\.\d[\w]*)/u.exec(src.slice(i, i + 200));
    if (w && !/[←⇒]/.test(w[0])) { tokens.push({ t: /^\d|^\.\d/.test(w[0]) ? 'num' : 'word', v: w[0] }); i += w[0].length; continue; }
    const p = /^(?:\?\?=|\?\.|\.\.\.|===|!==|\*\*=|>>>=|<<=|>>=|>>>|=>|==|!=|<=|>=|&&=|\|\|=|&&|\|\||\?\?|\+\+|--|[+\-*/%&|^]=|<<|>>|\*\*|[\s\S])/u.exec(src.slice(i, i + 4));
    tokens.push({ t: 'punct', v: p[0] });
    i += p[0].length;
  }
  return tokens;
}

// Label semak('1a …', …) boleh diterjemah; hanya awalan id (1a, 2, ✳) mesti sama.
function normaliseSemakLabels(tokens) {
  return tokens.map((tk, k) => {
    if (tk.t === 'str' && tokens[k - 1]?.v === '(' && tokens[k - 2]?.v === 'semak') {
      return { t: 'str', v: `semak-label:${tk.v.slice(1, -1).trim().split(/\s+/)[0]}` };
    }
    return tk;
  });
}

const EXPECT_LINE = /(?<!["'`])\/\/\s*⇒/u;

function jsFacts(src) {
  const lines = src.split('\n');
  const comments = [];
  // Kumpul teks komen (untuk TODO/pembahagi) dengan tokenizer ringkas: baris yang bermula // atau /* dan komen hujung baris.
  for (const line of lines) {
    const m = line.match(/(?:^|[^:'"`])\/\/(.*)$/) ?? line.match(/\/\*(.*?)(?:\*\/|$)/);
    if (m) comments.push(m[1]);
  }
  const todos = [];
  for (const c of comments) {
    for (const m of c.matchAll(/\bTODO\b(?:\s*:?\s*([A-Z]?\d+[a-z]?(?:\s*[–-]\s*\d+)?|[a-z](?![\w-])|\([^)]*\)))?/g)) {
      todos.push(m[1] ? m[1].replace(/\s+/g, '') : '·');
    }
  }
  const dividers = lines
    .filter((l) => /^\s*\/\/\s*──/.test(l))
    .map((l) => {
      const inner = l.replace(/^\s*\/\/\s*─+\s*/, '');
      const id = inner.match(/^([A-Z])\.\s/)?.[1] ?? inner.match(/^TODO\s+([A-Z]?\d+[a-z]?)/)?.[0] ?? (inner.trim() === '' ? 'rule' : 'label');
      return id;
    });
  const expect = lines.filter((l) => EXPECT_LINE.test(l));
  const banner = src.match(/^\/\/\s*((?:Latihan|Exercise)\s+\d+)/m)?.[1].replace(/^(Latihan|Exercise)/, '#');
  return { tokens: normaliseSemakLabels(tokenizeJs(src)).map((t) => t.v), todos, dividers, expect, banner };
}

// ── Markdown ─────────────────────────────────────────────────────────────────
const EMOJI = /^(?:[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\u{1F1E6}-\u{1F1FF}]\s*)+/u;

function normTitle(t) {
  return t.replace(/[*_`]/g, '').replace(EMOJI, '').replace(/^\d+(?:\.[0-9A-Z]+)*[.)]?\s+/, '').trim().toLowerCase();
}

const CATEGORY_RULES = {
  // [kategori, uji(tajuk ternormal)] — ikut susunan; yang pertama padan menang.
  lab: [
    ['objective', (t) => /^(objektif|objective|matlamat)/.test(t)],
    ['prerequisites', (t) => /^(prasyarat|prerequisite|keperluan awal)/.test(t)],
    ['troubleshooting', (t) => /^(masalah lazim|masalah biasa|ralat lazim|troubleshooting|penyelesaian masalah)/.test(t)],
    ['challenge', (t) => /^(cabaran|challenge|bonus)/.test(t)],
    ['self-check', (t) => /^(semakan kendiri|self-check|self check)/.test(t)],
    ['checklist', (t) => /^(checkpoint|semakan|senarai semak|checklist|kriteria siap)/.test(t)],
  ],
  readme: [
    ['self-check', (t) => /semakan kendiri|self-check|self check/.test(t)],
    ['objective', (t) => /objektif|objective|fokus hari ini|hasil pembelajaran/.test(t)],
    ['deliverables', (t) => /^(hasil|deliverable|output hari)/.test(t)],
  ],
};

function headingKey(level, raw, kind) {
  const t = raw.trim();
  const parts = [`h${level}`];
  const emoji = t.match(EMOJI)?.[0].replace(/\s|\u{FE0F}/gu, '');
  if (emoji) parts.push(emoji);
  const bare = t.replace(EMOJI, '').replace(/^\*+|\*+$/g, '');
  const num = bare.match(/^(\d+(?:\.[0-9A-Z]+)*)[.)]?\s/);
  if (num) parts.push(`#${num[1]}`);
  const lab = bare.match(/^(Lab|Latihan)\s+(\d+(?:\.\d+)?[a-z]?)(?:\s*\(([^()]*)\))?\s*[—–-]/u);
  if (lab) parts.push(`${lab[1]} ${lab[2]}${lab[3] !== undefined ? ` (${lab[3].match(/\bS\d\b/)?.[0] ?? '…'})` : ''}`);
  if (/^Capstone\b/.test(bare)) parts.push('Capstone');
  const ses = bare.match(/^(?:S|SESI\s*|Sesi\s*)(\d+)\s*(\([^()]*\)\s*)?([—–:·-])/u);
  if (ses) parts.push(`S${ses[1]}${ses[3]}`);
  if (/(^|[^\p{L}])(kuiz|quiz)([^\p{L}]|$)/iu.test(bare)) parts.push(`quiz${bare.match(/\bS\d\b/)?.[0] ?? ''}`);
  const cp = bare.match(/^(?:✅\s*)?Checkpoint\b\s*([A-Z]\b|\d+(?:\.\d+)?)?/);
  if (cp) parts.push(`Checkpoint${cp[1] ? ' ' + cp[1] : ''}`);
  // Tag hujung dalam kurungan: kod sesi dan tag masa (minit|min|jam|hour(s)) mesti kekal.
  const paren = bare.match(/\(([^()]*)\)\s*\**\s*$/);
  if (paren) {
    const s = paren[1].match(/\bS\d\b/)?.[0];
    if (s) parts.push(`(${s})`);
    // Hanya tajuk lab: splitTitle Pelatih membuang tag masa di situ; di fail lain "±1 hour" pun boleh.
    if (kind === 'lab' && /minit|min\b|jam|hours?\b/iu.test(paren[1])) parts.push(`(time ${paren[1].match(/\d+/g)?.join(',') ?? ''})`);
  }
  const rules = CATEGORY_RULES[kind];
  if (rules && (kind === 'lab' || level === 2)) {
    const nt = normTitle(bare);
    const hit = rules.find(([, test]) => test(nt));
    if (hit) parts.push(`[${hit[0]}]`);
  }
  return parts.join(' ');
}

function stripCodeComments(lang, body) {
  const l = (lang || '').toLowerCase();
  if (['js', 'javascript', 'mjs', 'cjs', 'ts', 'typescript', 'jsx', 'tsx', 'json', 'jsonc', 'json5'].includes(l)) {
    return tokenizeJs(body).map((t) => t.v).join(' ');
  }
  if (['html', 'vue', 'svelte', 'xml', 'svg', 'blade'].includes(l)) {
    return tokenizeJs(body.replace(/<!--[\s\S]*?-->/g, '').replace(/\{\{--[\s\S]*?--\}\}/g, '')).map((t) => t.v).join(' ');
  }
  // PHP: komen //, /* */ dan # (kecuali atribut #[...]), serta <!-- --> dalam fail view; selebihnya ditoken seperti JS.
  if (['php'].includes(l)) {
    return tokenizeJs(stripHashComments(body.replace(/<!--[\s\S]*?-->/g, ''))).map((t) => t.v).join(' ');
  }
  if (['sql', 'mysql'].includes(l)) {
    return stripLineComments(body.replace(/\/\*[\s\S]*?\*\//g, ''), (line, k) => line[k] === '-' && line[k + 1] === '-');
  }
  if (['css'].includes(l)) return body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
  if (['bash', 'sh', 'shell', 'zsh', 'console', 'http', 'ini', 'env', 'dotenv', 'yaml', 'yml', 'python', 'py', 'toml', 'powershell', 'ps1', 'pwsh'].includes(l)) {
    return stripLineComments(body, (line, k) => line[k] === '#' && (k === 0 || /\s/.test(line[k - 1])));
  }
  return null; // text, mermaid, dll.: kandungan ialah prosa → tidak dibanding
}

// Buang komen baris (isComment menguji kedudukan k) di luar string; ← anotasi jurulatih juga dibuang.
function stripLineComments(body, isComment) {
  return body
    .split('\n')
    .map((line) => {
      let q = null;
      for (let k = 0; k < line.length; k++) {
        const ch = line[k];
        if (q) { if (ch === q) q = null; continue; }
        if (ch === '"' || ch === "'") q = ch;
        else if (ch === '←') return line.slice(0, k);
        else if (isComment(line, k)) return line.slice(0, k);
      }
      return line;
    })
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

// PHP: buang komen # (bukan #[atribut]) di luar string, sebelum ditoken.
function stripHashComments(body) {
  return body
    .split('\n')
    .map((line) => {
      let q = null;
      for (let k = 0; k < line.length; k++) {
        const ch = line[k];
        if (q) { if (ch === '\\') k++; else if (ch === q) q = null; continue; }
        if (ch === '"' || ch === "'") q = ch;
        else if (ch === '/' && line[k + 1] === '/') return line;
        else if (ch === '#' && line[k + 1] !== '[') return line.slice(0, k);
      }
      return line;
    })
    .join('\n');
}

function mdFacts(src, kind) {
  const lines = src.split('\n');
  const sections = [{ key: '(mula)', tasks: 0, tables: 0, details: 0, quiz: null, codes: [] }];
  const quizzes = [];
  const codes = [];
  const inlineCode = new Map();
  let fence = null;
  let body = [];
  let quiz = null; // { key, level, questions: [] }
  let cur = sections[0];
  for (let ln = 0; ln < lines.length; ln++) {
    const line = lines[ln];
    const f = line.match(/^(\s*)(`{3,}|~{3,})\s*([\w+-]*)/);
    if (fence) {
      if (f && f[2][0] === fence.mark[0] && f[2].length >= fence.mark.length && line.trim() === f[2]) {
        const lang = fence.lang;
        const stripped = stripCodeComments(lang, body.join('\n'));
        codes.push({ lang: lang || '(tiada)', stripped, line: fence.line, section: cur.key });
        fence = null;
        body = [];
      } else body.push(line);
      continue;
    }
    if (f) { fence = { mark: f[2], lang: f[3], line: ln + 1 }; continue; }

    const h = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    const boldOnly = kind === 'lab' && line.match(/^\*\*([^*]+)\*\*[.:]?\s*$/);
    if (h || boldOnly) {
      const level = h ? h[1].length : 7;
      const title = h ? h[2] : boldOnly[1];
      if (quiz && level <= quiz.level) quiz = null;
      const key = h ? headingKey(level, title, kind) : `bold ${headingKey(7, title, kind).replace(/^h7 ?/, '')}`.trim();
      cur = { key, tasks: 0, tables: 0, details: 0, line: ln + 1 };
      sections.push(cur);
      if (h && /(^|[^\p{L}])(kuiz|quiz)([^\p{L}]|$)/iu.test(title)) {
        quiz = { key, level, line: ln + 1, questions: [] };
        quizzes.push(quiz);
      }
      continue;
    }
    for (const m of line.matchAll(/(?<!`)(`+)(?!`)(.+?)(?<!`)\1(?!`)/g)) inlineCode.set(m[2], (inlineCode.get(m[2]) ?? 0) + 1);
    if (quiz) {
      const q = line.match(/^\d+[.)]\s+/);
      const opt = line.match(/^\s+[-*+]\s+\[( |x|X)\]\s+/);
      if (q) { quiz.questions.push({ line: ln + 1, options: 0, checked: [], explain: 0 }); continue; }
      const cq = quiz.questions[quiz.questions.length - 1];
      if (opt && cq) { if (opt[1] !== ' ') cq.checked.push(cq.options); cq.options++; continue; }
      if (/^\s*>/.test(line) && cq) { cq.explain++; continue; }
    }
    if (/^\s*[-*+]\s+\[[ xX]\]\s/.test(line)) cur.tasks++;
    if (/^\s*\|/.test(line)) cur.tables++;
    cur.details += (line.match(/<details>/g) ?? []).length;
  }
  return { sections, quizzes, codes, inlineCode };
}

// ── Banding ──────────────────────────────────────────────────────────────────
function diffSeq(label, a, b, show = (x) => x) {
  const out = [];
  const max = Math.max(a.length, b.length);
  for (let k = 0; k < max; k++) {
    if (a[k] !== b[k]) {
      out.push(`${label}[${k + 1}]: BM ${a[k] === undefined ? '(tiada)' : JSON.stringify(show(a[k]))} ≠ EN ${b[k] === undefined ? '(tiada)' : JSON.stringify(show(b[k]))}`);
      if (out.length >= 5) { out.push(`${label}: … (${max - k - 1} lagi tidak disemak)`); break; }
    }
  }
  return out;
}

function firstTokenDiff(a, b) {
  let k = 0;
  while (k < a.length && k < b.length && a[k] === b[k]) k++;
  if (k === a.length && k === b.length) return null;
  const ctx = (arr) => arr.slice(Math.max(0, k - 6), k + 6).join(' ');
  return `token #${k + 1}: BM «${a[k] ?? '(habis)'}» ≠ EN «${b[k] ?? '(habis)'}»\n      BM …${ctx(a)}…\n      EN …${ctx(b)}…`;
}

function kindOf(rel) {
  if (/^hari-\d+\/lab(\.en)?\.md$/.test(rel)) return 'lab';
  if (/^hari-\d+\/README(\.en)?\.md$/.test(rel)) return 'readme';
  return 'other';
}

export function compareMd(msSrc, enSrc, kind) {
  const a = mdFacts(msSrc, kind);
  const b = mdFacts(enSrc, kind);
  const errors = [];
  const warnings = [];
  errors.push(...diffSeq('tajuk', a.sections.map((s) => s.key), b.sections.map((s) => s.key)));
  if (a.sections.length === b.sections.length) {
    a.sections.forEach((s, k) => {
      const t = b.sections[k];
      const where = `bahagian "${s.key}" (BM baris ${s.line ?? 1}, EN baris ${t.line ?? 1})`;
      if (s.tasks !== t.tasks) errors.push(`${where}: senarai tugasan - [ ] BM ${s.tasks} ≠ EN ${t.tasks}`);
      if (s.details !== t.details) errors.push(`${where}: <details> BM ${s.details} ≠ EN ${t.details}`);
      if (s.tables !== t.tables) warnings.push(`${where}: baris jadual BM ${s.tables} ≠ EN ${t.tables}`);
    });
  }
  if (a.quizzes.length !== b.quizzes.length) errors.push(`kuiz: BM ${a.quizzes.length} bahagian ≠ EN ${b.quizzes.length}`);
  a.quizzes.forEach((qa, k) => {
    const qb = b.quizzes[k];
    if (!qb) return;
    const where = `kuiz "${qa.key}" (BM baris ${qa.line}, EN baris ${qb.line})`;
    if (qa.questions.length !== qb.questions.length) errors.push(`${where}: soalan BM ${qa.questions.length} ≠ EN ${qb.questions.length}`);
    qa.questions.forEach((x, j) => {
      const y = qb.questions[j];
      if (!y) return;
      if (x.options !== y.options) errors.push(`${where} S${j + 1}: pilihan BM ${x.options} ≠ EN ${y.options}`);
      if (x.checked.join() !== y.checked.join()) errors.push(`${where} S${j + 1}: jawapan [x] BM #${x.checked.map((c) => c + 1).join(',')} ≠ EN #${y.checked.map((c) => c + 1).join(',')}`);
      if (x.explain > 0 !== y.explain > 0) errors.push(`${where} S${j + 1}: penerangan > BM ${x.explain ? 'ada' : 'tiada'} ≠ EN ${y.explain ? 'ada' : 'tiada'}`);
    });
  });
  errors.push(...diffSeq('bahasa blok kod', a.codes.map((c) => c.lang), b.codes.map((c) => c.lang)));
  if (a.codes.length === b.codes.length) {
    a.codes.forEach((c, k) => {
      const d = b.codes[k];
      if (c.stripped === null || c.lang !== d.lang) return;
      if (c.stripped !== d.stripped) {
        const tokDiff = firstTokenDiff(c.stripped.split(/\s+/), d.stripped.split(/\s+/));
        errors.push(`blok kod #${k + 1} (${c.lang}, BM baris ${c.line}, EN baris ${d.line}) berbeza selepas komen dibuang — ${tokDiff}`);
      }
    });
  }
  const missing = [];
  for (const [code, count] of a.inlineCode) if ((b.inlineCode.get(code) ?? 0) < count) missing.push(code);
  if (missing.length) warnings.push(`kod sebaris BM tiada/kurang dalam EN (${missing.length}): ${missing.slice(0, 12).map((c) => '`' + c + '`').join(' ')}${missing.length > 12 ? ' …' : ''}`);
  return { errors, warnings };
}

export function compareJs(msSrc, enSrc) {
  const a = jsFacts(msSrc);
  const b = jsFacts(enSrc);
  const errors = [];
  const d = firstTokenDiff(a.tokens, b.tokens);
  if (d) errors.push(`kod (tanpa komen) berbeza — ${d}`);
  errors.push(...diffSeq('TODO id', a.todos, b.todos));
  errors.push(...diffSeq('pembahagi // ──', a.dividers, b.dividers));
  errors.push(...diffSeq('baris // ⇒', a.expect, b.expect));
  if (a.banner !== b.banner) errors.push(`banner // Latihan NN: BM ${a.banner} ≠ EN ${b.banner}`);
  return { errors, warnings: [] };
}

// ── Senarai fail ─────────────────────────────────────────────────────────────
const SKIP_DIRS = new Set(['.git', 'node_modules', '_sumber', 'penyelesaian', 'vendor', 'dist', '.omc', '.claude']);
const NOT_TRANSLATED = new Set(['CLAUDE.md', 'docs/terjemahan.md']);
// Nota penceramah kekal BM (tidak diterjemah).
const NOT_TRANSLATED_RE = /(^|\/)nota-penceramah\.md$/;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP_DIRS.has(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(relative(ROOT, p));
  }
  return out;
}

const isPrimary = (rel) =>
  !NOT_TRANSLATED.has(rel) &&
  !NOT_TRANSLATED_RE.test(rel) &&
  !/\.en\.[a-z]+$/.test(rel) &&
  /\.md$/.test(rel);

const enOf = (rel) => rel.replace(/\.(md|js|html)$/, '.en.$1');

export function checkPair(msRel, enRel, root = ROOT) {
  const ms = readFileSync(join(root, msRel), 'utf8');
  const en = readFileSync(join(root, enRel), 'utf8');
  if (msRel.endsWith('.js')) return compareJs(ms, en);
  if (msRel.endsWith('.md')) return compareMd(ms, en, kindOf(msRel));
  return { errors: [], warnings: ['(tidak disemak: jenis fail)'] };
}

function main(argv) {
  if (argv.includes('--self-test')) return selfTest();
  const all = walk(ROOT);
  const primaries = all.filter(isPrimary).sort();
  const orphans = all.filter((f) => /\.en\.(md|js)$/.test(f) && !existsSync(join(ROOT, f.replace(/\.en\.(md|js)$/, '.$1'))));
  let targets = primaries.filter((p) => existsSync(join(ROOT, enOf(p))));
  const args = argv.filter((a) => !a.startsWith('--'));
  if (args.length) {
    const want = new Set(args.map((a) => relative(ROOT, join(process.cwd(), a)).replace(/\.en\.(md|js)$/, '.$1')));
    targets = targets.filter((t) => want.has(t));
    for (const w of want) if (!targets.includes(w)) console.log(`?  ${w}: tiada pasangan .en.`);
  }
  let fail = 0;
  for (const ms of targets) {
    const en = enOf(ms);
    const { errors, warnings } = checkPair(ms, en);
    if (errors.length) fail++;
    console.log(`${errors.length ? 'FAIL' : 'PASS'}  ${en}`);
    for (const e of errors) console.log(`      ✗ ${e}`);
    for (const w of warnings) console.log(`      ⚠ ${w}`);
  }
  for (const o of orphans) { fail++; console.log(`FAIL  ${o}: tiada fail BM sepadan`); }
  if (!args.length) {
    const missing = primaries.filter((p) => !existsSync(join(ROOT, enOf(p))));
    console.log(`\nLiputan: ${primaries.length - missing.length}/${primaries.length} fail utama ada terjemahan EN.`);
    const byDir = {};
    for (const m of missing) (byDir[dirname(m)] ??= []).push(basename(m));
    for (const [d, fs] of Object.entries(byDir)) console.log(`  belum: ${d}/ — ${fs.join(', ')}`);
  }
  console.log(`\n${fail ? `${fail} fail tidak sepadan.` : 'Semua pasangan sepadan.'}`);
  return fail ? 1 : 0;
}

// ── Ujian kendiri ────────────────────────────────────────────────────────────
function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'semak-terjemahan-'));
  const cases = [];
  const t = (name, fn) => cases.push([name, fn]);
  const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

  const msMd = [
    '# Lab Hari 9 — Contoh', '', '## Lab 9.1 — Asas (S1)', '### 🎯 Objektif', 'Teks.', '### ✅ Checkpoint', '- [ ] satu', '- [ ] dua',
    '```js', "const a = 'nilai'; // komen BM", '```', '## S1 — Tajuk (9.00 – 11.00 pagi)', '### 🎯 Kuiz S1', '',
    '1. Soalan?', '   - [ ] A', '   - [x] B', '   > Sebab.', '',
  ].join('\n');
  const enGood = msMd.replace('### 🎯 Objektif', '### 🎯 Objective').replace('Teks.', 'Text.').replace('satu', 'one').replace('komen BM', 'English comment')
    .replace('Asas (S1)', 'Basics (S1)').replace('Kuiz S1', 'Quiz S1').replace('Soalan?', 'Question?').replace('Sebab.', 'Because.').replace('pagi', 'am');

  t('md: terjemahan setia lulus', () => { const r = compareMd(msMd, enGood, 'lab'); ok(r.errors.length === 0, r.errors.join('\n')); });
  t('md: literal dalam kod diubah → gagal', () => ok(compareMd(msMd, enGood.replace("'nilai'", "'value'"), 'lab').errors.some((e) => e.includes('blok kod')), 'tidak dikesan'));
  t('md: [x] beralih → gagal', () => ok(compareMd(msMd, enGood.replace('- [ ] A', '- [x] A').replace('- [x] B', '- [ ] B'), 'lab').errors.some((e) => e.includes('[x]')), 'tidak dikesan'));
  t('md: pilihan hilang → gagal', () => ok(compareMd(msMd, enGood.replace('   - [ ] A\n', ''), 'lab').errors.some((e) => e.includes('pilihan')), 'tidak dikesan'));
  t('md: tugasan hilang → gagal', () => ok(compareMd(msMd, enGood.replace('- [ ] one\n', ''), 'lab').errors.some((e) => e.includes('tugasan')), 'tidak dikesan'));
  t('md: "Session 1" bukan "S1" → gagal', () => ok(compareMd(msMd, enGood.replace('## S1 —', '## Session 1 —'), 'lab').errors.length > 0, 'tidak dikesan'));
  t('md: Lab → Exercise → gagal', () => ok(compareMd(msMd, enGood.replace('## Lab 9.1', '## Exercise 9.1'), 'lab').errors.length > 0, 'tidak dikesan'));
  t('md: Objective → Goal (kata kunci hilang) → gagal', () => ok(compareMd(msMd, enGood.replace('🎯 Objective', '🎯 Goal'), 'lab').errors.length > 0, 'tidak dikesan'));

  const msJam = '# Nota\n\n## 7. Bacaan (pilihan, ±1 jam)\n\nTeks.\n';
  t('md: tag masa "jam" → "hour" lulus', () => { const r = compareMd(msJam, msJam.replace('Bacaan (pilihan, ±1 jam)', 'Reading (optional, ±1 hour)').replace('Teks.', 'Text.'), 'lab'); ok(r.errors.length === 0, r.errors.join('\n')); });
  t('md: tag masa "hours" nombor berbeza → gagal', () => ok(compareMd(msJam, msJam.replace('Bacaan (pilihan, ±1 jam)', 'Reading (optional, ±2 hours)'), 'lab').errors.length > 0, 'tidak dikesan'));
  t('md: tag masa digugurkan → gagal', () => ok(compareMd(msJam, msJam.replace('Bacaan (pilihan, ±1 jam)', 'Reading (optional)'), 'lab').errors.length > 0, 'tidak dikesan'));

  const msJs = [
    '// Latihan 01 — S1 · Contoh', "import { semak } from './lib/semak.js';", '// ── A. Asas ──────', '// TODO A1 — Isi nilai.',
    '//   sambungan teks', "const x = 'baharu'; // TODO", "console.log('A1', x); // ⇒ A1 baharu", "semak('1a nilai betul', x === 'baharu');",
    'const re = /a\\/b/g; const s = `${x} // bukan komen`;', '/* blok */ const y = 1;',
  ].join('\n');
  const enJs = msJs.replace('Latihan 01 — S1 · Contoh', 'Exercise 01 — S1 · Example').replace('A. Asas', 'A. Basics').replace('Isi nilai.', 'Fill in the value.')
    .replace('sambungan teks', 'continuation text').replace("'1a nilai betul'", "'1a value is correct'").replace('blok', 'block');
  t('js: terjemahan setia lulus', () => { const r = compareJs(msJs, enJs); ok(r.errors.length === 0, r.errors.join('\n')); });
  t('js: literal diubah → gagal', () => ok(compareJs(msJs, enJs.replace("const x = 'baharu'", "const x = 'new'")).errors.length > 0, 'tidak dikesan'));
  t('js: template literal diubah → gagal', () => ok(compareJs(msJs, enJs.replace('// bukan komen`', '// not a comment`')).errors.length > 0, 'tidak dikesan'));
  t('js: baris ⇒ diubah → gagal', () => ok(compareJs(msJs, enJs.replace('⇒ A1 baharu', '⇒ A1 new')).errors.some((e) => e.includes('⇒')), 'tidak dikesan'));
  t('js: id TODO hilang → gagal', () => ok(compareJs(msJs, enJs.replace('TODO A1', 'TODO')).errors.some((e) => e.includes('TODO')), 'tidak dikesan'));
  t('js: huruf pembahagi diubah → gagal', () => ok(compareJs(msJs, enJs.replace('── A. Basics', '── Basics')).errors.some((e) => e.includes('pembahagi')), 'tidak dikesan'));
  t('js: awalan label semak diubah → gagal', () => ok(compareJs(msJs, enJs.replace("'1a value", "'1b value")).errors.length > 0, 'tidak dikesan'));
  const msPhp = ['## Lab 1.1 — Contoh (S1)', '```php', "$a = 'nilai'; // komen BM", '# komen hash', '#[Attr] /* blok */ $b = 1;', '```', '```sql', "SELECT 1 -- komen", '```'].join('\n');
  const enPhp = msPhp.replace('Contoh', 'Example').replace('komen BM', 'EN comment').replace('komen hash', 'hash comment').replace('blok', 'block').replace('-- komen', '-- comment');
  t('php/sql: komen diterjemah lulus', () => { const r = compareMd(msPhp, enPhp, 'lab'); ok(r.errors.length === 0, r.errors.join('\n')); });
  t('php: literal diubah → gagal', () => ok(compareMd(msPhp, enPhp.replace("'nilai'", "'value'"), 'lab').errors.some((e) => e.includes('blok kod')), 'tidak dikesan'));
  t('php: atribut #[...] dikekalkan → gagal jika diubah', () => ok(compareMd(msPhp, enPhp.replace('#[Attr]', '#[Other]'), 'lab').errors.length > 0, 'tidak dikesan'));
  t('sql: kod diubah → gagal', () => ok(compareMd(msPhp, enPhp.replace('SELECT 1', 'SELECT 2'), 'lab').errors.length > 0, 'tidak dikesan'));
  t('js: regex literal dikekalkan', () => ok(tokenizeJs('x = /a\\/b/g;').some((k) => k.v === '/a\\/b/g'), 'regex tidak ditoken'));
  t('js: pembahagian bukan regex', () => ok(tokenizeJs('a = b / c / d;').filter((k) => k.v === '/').length === 2, 'salah baca pembahagian'));

  t('fail: pasangan pada cakera', () => {
    writeFileSync(join(tmp, 'a.md'), msMd);
    writeFileSync(join(tmp, 'a.en.md'), enGood);
    ok(checkPair('a.md', 'a.en.md', tmp).errors.length === 0, 'pasangan gagal');
  });

  let failed = 0;
  for (const [name, fn] of cases) {
    try { fn(); console.log(`ok    ${name}`); } catch (e) { failed++; console.log(`GAGAL ${name}\n      ${e.message}`); }
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log(`\n${cases.length - failed}/${cases.length} ujian lulus.`);
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
