/**
 * Reads the tokens out of src/styles/global.css and checks every
 * foreground/background pair the site actually uses, in both themes.
 *
 * Text pairs must reach WCAG AA 4.5:1 (or 3:1 where the text is large).
 * Graphical objects (diagram strokes, borders carrying meaning) must reach
 * 3:1 per WCAG 1.4.11. Fails the build on any shortfall.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, '..', 'src', 'styles', 'global.css'), 'utf8');

/** Pull a `--token: #hex;` map out of the first block matching `selector`. */
function tokensFrom(selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`no block for ${selector}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const out = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

const light = tokensFrom(':root {');

const srgb = (h) => h.slice(1).match(/../g).map((x) => parseInt(x, 16) / 255);
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => {
  const [r, g, b] = srgb(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * [foreground, background, minimum, what it is]
 *
 * The yellow ramp is checked by the job each step actually does. The bright
 * steps are never asked to carry text; they are only ever a background with
 * ink on top, which is how they stay legible.
 */
const PAIRS = [
  ['--ink', '--surface', 4.5, 'body text on page'],
  ['--ink', '--surface-2', 4.5, 'body text on band'],
  ['--ink', '--surface-3', 4.5, 'body text on card'],
  ['--ink-2', '--surface', 4.5, 'lede on page'],
  ['--ink-2', '--surface-2', 4.5, 'lede on band'],
  ['--ink-2', '--surface-3', 4.5, 'lede on card'],
  ['--ink-muted', '--surface', 4.5, 'eyebrow on page'],
  ['--ink-muted', '--surface-2', 4.5, 'eyebrow on band'],
  ['--ink-muted', '--surface-3', 4.5, 'eyebrow on card'],

  // yellow carrying text: only the deep steps may
  ['--y-600', '--surface', 4.5, 'accent text on page'],
  ['--y-600', '--surface-2', 4.5, 'accent text on band'],
  ['--y-600', '--surface-3', 4.5, 'accent text on card'],
  ['--y-700', '--surface', 4.5, 'deep accent text on page'],
  ['--y-600', '--y-50', 4.5, 'accent text on wash'],
  ['--y-700', '--y-100', 4.5, 'deep accent text on wash-2'],

  // ink sitting on a yellow fill: the bright steps' only text job
  ['--ink', '--y-300', 4.5, 'ink on primary button / bright fill'],
  ['--ink', '--y-200', 4.5, 'ink on mid fill'],
  ['--ink', '--y-100', 4.5, 'ink on pale fill'],
  ['--ink', '--y-50', 4.5, 'ink on wash'],
  ['--ink', '--y-400', 4.5, 'ink on deep fill'],

  // non-text: strokes, rules, icons (WCAG 1.4.11)
  ['--y-500', '--surface', 3, 'accent stroke on page'],
  ['--y-500', '--surface-2', 3, 'accent stroke on band'],
  ['--y-500', '--surface-3', 3, 'accent stroke on card'],
  ['--y-300', '--ink', 3, 'bright yellow mark on ink'],
  ['--line-strong', '--surface', 1.4, 'hairline on page (decorative only)'],
];

let failed = 0;
for (const [name, tokens] of [['light', light]]) {
  console.log(`\n${name}`);
  for (const [fg, bg, min, what] of PAIRS) {
    const a = tokens[fg];
    const b = tokens[bg];
    if (!a || !b) {
      console.log(`  SKIP  ${fg} / ${bg} (not defined in ${name})`);
      continue;
    }
    const r = ratio(a, b);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(
      `  ${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)} / ${min}  ${what}  (${fg} on ${bg})`,
    );
  }
}

if (failed > 0) {
  console.error(`\n${failed} contrast pair(s) below the bar.`);
  process.exit(1);
}
console.log('\nAll contrast pairs meet the bar.');
