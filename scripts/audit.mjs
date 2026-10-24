/**
 * Audits the built site. Runs as part of `npm run verify`, so the guarantees
 * below cannot quietly rot:
 *
 *  1. Every external link on the site comes from src/config/links.ts. This is
 *     what makes a status change a one-line edit: a URL hardcoded into a page
 *     would escape the config and keep its own stale badge.
 *  2. No page places "Stellar" next to a mainnet badge. links.ts already
 *     refuses that in the data; this catches it in the rendered copy too.
 *  3. Every internal link points at a page that was actually built.
 *  4. Every page carries one h1, a title, a description, a canonical and an
 *     Open Graph image.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, '..', 'dist');

if (!existsSync(dist)) {
  console.error('No dist/. Run `astro build` first.');
  process.exit(1);
}

/* links.ts is TypeScript. Read the URLs out of the source rather than
   importing it, so this runs on any Node version without a transpile step. */
const linksSrc = readFileSync(join(root, '..', 'src', 'config', 'links.ts'), 'utf8');
const configuredHrefs = [...linksSrc.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]);

if (configuredHrefs.length === 0) {
  console.error('Read no hrefs out of src/config/links.ts; the audit would pass vacuously.');
  process.exit(1);
}

const allowed = new Set(configuredHrefs);
/* Astro's own output and the sitemap are not page content. */
allowed.add('https://corridorfinance.tech');

const html = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) html.push(p);
  }
})(dist);

const pagePaths = new Set(
  html.map((p) => {
    const rel = '/' + relative(dist, p).replace(/\\/g, '/');
    return rel.replace(/\/index\.html$/, '') || '/';
  }),
);
pagePaths.add('/');

const problems = [];
const add = (file, msg) => problems.push(`${relative(dist, file)}: ${msg}`);

for (const file of html) {
  const src = readFileSync(file, 'utf8');
  const body = src.slice(src.indexOf('<body'));

  // 1 + 3. Links.
  for (const m of body.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (href.startsWith('#') || href.startsWith('data:')) continue;

    if (/^(https?:|mailto:)/.test(href)) {
      if (!allowed.has(href)) {
        add(file, `external link not in links.ts: ${href}`);
      }
      continue;
    }
    if (href.startsWith('/')) {
      const path = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
      if (path.includes('.')) continue; // an asset, not a page
      if (!pagePaths.has(path)) add(file, `internal link to a page that was not built: ${href}`);
    }
  }

  // 2. No single card, table row or diagram chip may describe Stellar and
  //    carry a mainnet badge. This is structural on purpose: a flat
  //    text-proximity check flags Tempo's badge merely sitting near a Stellar
  //    row in the same table, which is correct and intended.
  const blocks = [
    ...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g),
    ...body.matchAll(/<a[^>]*class="[^"]*\blc\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g),
    ...body.matchAll(/<div[^>]*class="[^"]*\bnc\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g),
    ...body.matchAll(/<div[^>]*class="[^"]*\bav__head\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g),
    ...body.matchAll(/<g[^>]*class="[^"]*\bdg__chip\b[^"]*"[^>]*>([\s\S]*?)<\/g>/g),
  ];

  for (const b of blocks) {
    const t = b[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (/Stellar/i.test(t) && /Mainnet/i.test(t)) {
      add(file, `a single card or row claims Stellar on mainnet: "${t.slice(0, 120)}"`);
    }
  }

  // 4. Head and heading structure.
  const h1s = (body.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) add(file, `expected exactly one <h1>, found ${h1s}`);
  if (!/<title>[^<]+<\/title>/.test(src)) add(file, 'missing <title>');
  if (!/<meta name="description" content="[^"]+"/.test(src)) add(file, 'missing meta description');
  if (!/<link rel="canonical"/.test(src)) add(file, 'missing canonical');
  if (!/property="og:image"/.test(src)) add(file, 'missing og:image');
}

console.log(`Audited ${html.length} built page(s).`);

if (problems.length > 0) {
  console.error('\nProblems:');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('Links all come from links.ts, no overstated status, head and headings in order.');
