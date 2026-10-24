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

Tokens are CSS variables on `:root` in [`src/styles/global.css`](src/styles/global.css).
**Light only** — there is no dark mode, no toggle and no `prefers-color-scheme` block.

Typeface is **Space Mono** throughout, matching the Corridor console.

The accent is a yellow ramp (`--y-50` to `--y-700`) rather than a single colour, and the steps
split by job because yellow cannot carry text at the bright end — `#F7CE4B` on the off-white
page is about 1.6:1:

| Steps | Job |
| --- | --- |
| `--y-50` – `--y-300` | Fills and washes. Only ever sit **under** ink, never carry text. |
| `--y-500` | The lightest step safe for strokes, rules and icons (3:1). |
| `--y-600` – `--y-700` | The only steps that may carry text (4.5:1). |

Components reach for the semantic aliases (`--accent`, `--accent-text`, `--accent-stroke`,
`--accent-wash`) rather than raw ramp steps. `npm run contrast` reads the values straight out of
the stylesheet and checks each pair against the bar for the job it does, so the check cannot
drift from the CSS.

Layout is **full bleed**: bands run edge to edge and `--pad-x` holds content off the glass, with
`.measure` capping running text. Hairlines between grid cells are drawn as child borders, not as
a coloured gap behind the grid — a gap-background shows through any child that is mid-fade,
which reads as a grey hole while the scroll-in staggers.

### Logos

The Corridor mark (a hub with four spokes) is taken from the Corridor console so the parent
company and the product read as one brand.

Network logos are the official marks from [`@web3icons/core`](https://www.npmjs.com/package/@web3icons/core),
the same source the console uses, in its `branded` (full-colour) set. Tempo's and Stellar's brand
marks are black by design; Base and Solana carry their own colours. `NetworkLogo.astro`
namespaces any gradient ids per instance, because the same logo renders more than once on a page
and duplicate ids would make every copy point at the first one's gradient.

### Motion

Named models, all cut by `prefers-reduced-motion`:

| Model | Where |
| --- | --- |
| `marquee-l` / `marquee-r` | The counter-scrolling giant type in the CTA band, and the network strip. |
| `grain` | A faint moving grain over the whole page. |
| `blink` | Status dots on live badges and the footer pill. |
| `wire` | Dashes travelling along the flows in the hero illustration. |
| `rise` | The scroll-in reveal. |
| `sweep` | A light passing across a button on hover. |

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

### DNS for corridorfinance.tech

The custom domain is set on the Pages site and `public/CNAME` carries it through each build.
DNS is on Cloudflare, so the apex needs these records there:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `udoka-am.github.io` |

Optionally also the AAAA records `2606:50c0:8000::153` through `...8003::153` on `@`.

**Set them to DNS only (grey cloud), not proxied.** With Cloudflare's proxy on, GitHub cannot
complete its domain check and will not issue the TLS certificate, so the site stays on HTTP and
shows a certificate error. Once the certificate has been issued, turn on Enforce HTTPS in the
repository's Pages settings.

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
