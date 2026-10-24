/**
 * Generates public/og.png (1200x630) and public/apple-touch-icon.png from SVG
 * written here, so both can be regenerated with `npm run og` after a copy or
 * token change. The PNGs are committed, since the hosts do not run this.
 *
 * The card uses a system sans rather than Inter: librsvg resolves fonts
 * through fontconfig, and Inter is not installed on build machines. Token
 * values are inlined for the same reason -- there is no CSS cascade here.
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const T = {
  ink: '#0A0A0A',
  ink2: '#3D3D3D',
  muted: '#6B6B6B',
  surface: '#FAFAF8',
  surface2: '#F2F2EE',
  white: '#FFFFFF',
  line: '#E2E2DC',
  lineStrong: '#C9C9C1',
  y300: '#F7CE4B',
  y400: '#E3B01A',
  y500: '#B07900',
  y600: '#8A6300',
  y50: '#FEFAEC',
};

/* Space Mono is not installed on build machines and librsvg resolves fonts
   through fontconfig, so the card falls back to a system monospace. It keeps
   the mono character of the site even though the exact face differs. */
const FONT = "'Menlo', 'DejaVu Sans Mono', 'Courier New', monospace";

/* The Corridor mark, at a given scale. */
const mark = (x, y, scale, stroke) => `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <circle cx="12" cy="12" r="4.2" stroke="${stroke}" stroke-width="1.6" fill="none"/>
    <path d="M1.5 6.5 L8.4 10.6 M1.5 17.5 L8.4 13.4 M22.5 6.5 L15.6 10.6 M22.5 17.5 L15.6 13.4"
          stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  </g>`;

/* A compact version of the hero illustration for the right-hand side. */
const art = `
  <g transform="translate(648 150)">
    <rect x="0.5" y="0.5" width="480" height="330" fill="${T.white}" stroke="${T.line}"/>

    <rect x="24" y="130" width="112" height="70" fill="${T.surface}" stroke="${T.lineStrong}"/>
    <text x="40" y="160" font-family="${FONT}" font-size="13" font-weight="700" fill="${T.ink}">Stablecoin</text>
    <text x="40" y="180" font-family="${FONT}" font-size="11" fill="${T.muted}">treasury</text>

    <rect x="184" y="112" width="112" height="106" fill="${T.y50}" stroke="${T.y400}"/>
    ${mark(214, 128, 2.6, T.ink)}
    <text x="240" y="202" font-family="${FONT}" font-size="12" font-weight="700" fill="${T.ink}" text-anchor="middle">Corridor</text>

    <rect x="344" y="130" width="112" height="70" fill="${T.surface}" stroke="${T.lineStrong}"/>
    <text x="360" y="160" font-family="${FONT}" font-size="13" font-weight="700" fill="${T.ink}">Local bank</text>
    <text x="360" y="180" font-family="${FONT}" font-size="11" fill="${T.muted}">account</text>

    <path d="M136 165 H184" stroke="${T.y500}" stroke-width="1.5" stroke-dasharray="5 7"/>
    <path d="M296 165 H344" stroke="${T.y500}" stroke-width="1.5" stroke-dasharray="5 7"/>

    <rect x="184" y="258" width="112" height="48" fill="${T.surface}" stroke="${T.lineStrong}"/>
    <text x="240" y="280" font-family="${FONT}" font-size="11" fill="${T.muted}" text-anchor="middle">Licensed</text>
    <text x="240" y="296" font-family="${FONT}" font-size="11" fill="${T.muted}" text-anchor="middle">partners</text>
    <path d="M240 218 V258" stroke="${T.y500}" stroke-width="1.5" stroke-dasharray="5 7"/>

    <rect x="24" y="28" width="150" height="30" fill="${T.y300}" stroke="${T.y400}"/>
    <text x="38" y="48" font-family="${FONT}" font-size="11" font-weight="700" letter-spacing="1.4" fill="${T.ink}">EXACTLY ONCE</text>
  </g>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${T.surface}"/>

  <g transform="translate(72 74)">
    ${mark(0, 0, 1.1, T.ink)}
    <text x="40" y="20" font-family="${FONT}" font-size="19" font-weight="700" fill="${T.ink}">Corridor <tspan fill="${T.muted}" font-weight="400">Finance</tspan></text>
  </g>

  <text x="72" y="178" font-family="${FONT}" font-size="15" letter-spacing="2.6" fill="${T.muted}">[ 01 / CORRIDOR FINANCE ]</text>

  <text x="72" y="262" font-family="${FONT}" font-size="54" font-weight="700" fill="${T.ink}">Payout</text>
  <text x="72" y="322" font-family="${FONT}" font-size="54" font-weight="700" fill="${T.ink}">infrastructure</text>
  <text x="72" y="382" font-family="${FONT}" font-size="54" font-weight="700" fill="${T.ink}">for Africa.</text>

  <text x="72" y="438" font-family="${FONT}" font-size="17" fill="${T.ink2}">One platform, three layers. The settlement</text>
  <text x="72" y="464" font-family="${FONT}" font-size="17" fill="${T.ink2}">network that fits each corridor.</text>

  <rect x="72" y="516" width="12" height="3" fill="${T.y400}"/>
  <text x="72" y="548" font-family="${FONT}" font-size="14" fill="${T.muted}">corridorfinance.tech</text>

  ${art}

  <rect y="624" width="1200" height="6" fill="${T.ink}"/>
  <rect y="624" width="240" height="6" fill="${T.y300}"/>
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="${T.surface}"/>
  ${mark(18, 18, 6, T.ink)}
</svg>`;

await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(join(out, 'og.png'));
await sharp(Buffer.from(icon)).png({ compressionLevel: 9 }).toFile(join(out, 'apple-touch-icon.png'));

console.log('wrote public/og.png and public/apple-touch-icon.png');
