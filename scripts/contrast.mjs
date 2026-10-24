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
const dark = tokensFrom(":root[data-theme='dark']");

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

/** [foreground token, background token, minimum, what it is] */
const PAIRS = [
  ['--ink', '--surface', 4.5, 'body text on page'],
  ['--ink', '--surface-2', 4.5, 'body text on band'],
  ['--ink-muted', '--surface', 4.5, 'secondary text on page'],
  ['--ink-muted', '--surface-2', 4.5, 'secondary text on band'],
  ['--accent', '--surface', 4.5, 'link on page'],
  ['--accent', '--surface-2', 4.5, 'link on band'],
  ['--accent-ink', '--accent', 4.5, 'text on primary button / Live badge'],
  ['--accent', '--accent-wash', 4.5, 'accent text on green wash'],
  ['--accent-2', '--surface', 4.5, 'amber text on page'],
  ['--accent-2', '--surface-2', 4.5, 'amber text on band'],
  ['--accent-2-ink', '--accent-2-fill', 4.5, 'text on amber fill'],
  ['--accent-2', '--accent-2-wash', 4.5, 'amber text on amber wash'],
  ['--ink', '--accent-2-wash', 4.5, 'body text on amber wash'],
  ['--accent-2-graphic', '--surface', 3, 'amber stroke on page'],
  ['--accent-2-graphic', '--surface-2', 3, 'amber stroke on band'],
  ['--accent', '--surface', 3, 'green stroke on page'],
  ['--accent-2-graphic', '--accent-2-wash', 3, 'amber stroke on amber wash'],
];

let failed = 0;
for (const [name, tokens] of [
  ['light', light],
  ['dark', dark],
]) {
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
console.log('\nAll contrast pairs meet the bar in both themes.');
