# corridorfinance.tech

The parent-company website for **Corridor Finance**: payout infrastructure for money moving
into and out of Africa.

Astro, static output, Tailwind v4, no CMS and no third-party trackers.

## Running it

```bash
npm install
npm run dev        # http://localhost:4321
npm run verify     # contrast + types + build + audit. Run this before deploying.
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server. |
| `npm run build` | Static build into `dist/`. |
| `npm run preview` | Serve `dist/` locally. |
| `npm run contrast` | Checks every colour pair in both themes against WCAG AA. |
| `npm run audit` | Audits the built HTML (see below). |
| `npm run og` | Regenerates `public/og.png` and `public/apple-touch-icon.png`. |
| `npm run verify` | All of the above, in order. |

## Changing a link or a status

**Everything lives in [`src/config/links.ts`](src/config/links.ts).** Every external URL and
every status badge on the site is read from it, so moving something from Testnet to Live is a
one-line edit there and nothing else changes.

Two guards keep a badge from overstating where something actually runs:

1. **`src/config/links.ts` refuses to build** if a Stellar entry carries a mainnet status while
   `STELLAR_MAINNET_CONFIRMED` is `false`. Nothing in the Stellar build has touched Stellar
   mainnet, so it is `false`. Flip it only when that stops being true.
2. **`npm run audit`** re-checks the rendered HTML: no card, table row or diagram chip may
   describe Stellar and carry a mainnet badge, and every external link on the site must come
   from `links.ts` — a URL hardcoded into a page would escape the config and keep its own
   stale badge.

The audit also checks that internal links point at pages that were built, and that every page
has one `<h1>`, a title, a description, a canonical and an Open Graph image.

## Design tokens

Tokens are CSS variables on `:root` in [`src/styles/global.css`](src/styles/global.css), with a
dark set under both `prefers-color-scheme` and an explicit `data-theme`. Two accents: a deep
corridor green for identity and action, and an amber for the technical layer — the diagram flow,
references and section ticks.

Amber needs a different value per theme. On a light surface a bright yellow is near-invisible, so
text and strokes use darker ambers (`--accent-2`, `--accent-2-graphic`) and the bright value
(`--accent-2-fill`) is reserved for fills that sit under `--accent-2-ink`. `npm run contrast`
reads the tokens straight out of the stylesheet and checks every pair the site uses, so the
check cannot drift from the CSS.

## Structure

```
src/config/links.ts      every external link and status badge — the single source of truth
src/config/content.ts    copy reused on more than one page
src/styles/global.css    tokens, base type, layout primitives
src/layouts/             Base (head, nav, footer, reveals), Legal
src/components/          nav, footer, buttons, badges, cards, table, diagram, forms
src/pages/               the nine pages of the sitemap, plus 404
scripts/                 contrast.mjs, audit.mjs, og.mjs
```

## Deploying

Hosted on **GitHub Pages**, from this repository.

`.github/workflows/deploy.yml` builds and publishes on every push to `main`. The build step runs
`npm run verify` rather than a bare `astro build`, so the contrast check, the type check and the
link/status audit all gate a deploy: a badge that overstates where something runs fails CI
instead of shipping.

`public/CNAME` holds the custom domain, so Pages keeps `corridorfinance.tech` across deploys.
Deleting that file would drop the domain on the next publish.

The waitlist form posts to `PUBLIC_WAITLIST_ENDPOINT`, which is read at **build** time. Pages
has no runtime environment variables, so set it as a repository variable or secret and pass it
into the build step in the workflow. Without it the form stays off and points people at the
contact address. See `.env.example`.

## Before it goes live

- [ ] Confirm the contact address. `hello@corridorfinance.tech` in `links.ts` is a placeholder.
- [ ] Confirm the founder bio on `/company`.
- [ ] Replace the placeholder text on `/legal/terms` and `/legal/privacy`.
- [ ] Set `PUBLIC_WAITLIST_ENDPOINT`.
- [ ] The SCF slot in the footer stays commented out until an award is actually received, and
      then it goes in next to SCF's required disclaimer, with no SDF logo.
