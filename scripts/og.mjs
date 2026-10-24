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
  ink: '#0B1220',
  inkMuted: '#4A5568',
  surface: '#FFFFFF',
  surface2: '#F5F7FA',
  line: '#E2E8F0',
  accent: '#0F5C4D',
  accentWash: '#EEF5F2',
  amber: '#B07900',
  amberWash: '#FDF3D4',
};

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Menlo', 'DejaVu Sans Mono', monospace";

/* A compact version of the layers diagram for the right-hand side. */
const diagram = `
  <g transform="translate(628 118)">
    <rect x="0.5" y="0.5" width="508" height="394" rx="12" fill="${T.surface2}" stroke="${T.line}"/>

    <rect x="20" y="20" width="230" height="86" rx="8" fill="${T.surface}" stroke="${T.line}"/>
    <text x="38" y="54" font-family="${FONT}" font-size="17" font-weight="600" fill="${T.ink}">Corridor Hub</text>
    <text x="38" y="78" font-family="${FONT}" font-size="13" fill="${T.inkMuted}">payment companies</text>

    <rect x="259" y="20" width="230" height="86" rx="8" fill="${T.surface}" stroke="${T.line}"/>
    <text x="277" y="54" font-family="${FONT}" font-size="17" font-weight="600" fill="${T.ink}">Corridor Ramp</text>
    <text x="277" y="78" font-family="${FONT}" font-size="13" fill="${T.inkMuted}">apps · agents</text>

    <line x1="0.5" y1="130" x2="508.5" y2="130" stroke="${T.line}"/>
    <path d="M135 106 V152" stroke="${T.amber}" stroke-width="1.5" stroke-dasharray="5 6"/>
    <path d="M374 106 V152" stroke="${T.amber}" stroke-width="1.5" stroke-dasharray="5 6"/>

    <rect x="20" y="152" width="469" height="86" rx="8" fill="${T.surface}" stroke="#7FA69C"/>
    <text x="38" y="186" font-family="${FONT}" font-size="17" font-weight="600" fill="${T.ink}">Corridor Core</text>
    <text x="38" y="210" font-family="${FONT}" font-size="13" fill="${T.inkMuted}">exactly-once settlement, ledger, reconciliation</text>

    <line x1="0.5" y1="262" x2="508.5" y2="262" stroke="${T.line}"/>
    <path d="M254 238 V286" stroke="${T.amber}" stroke-width="1.5" stroke-dasharray="5 6"/>

    <rect x="20" y="286" width="150" height="50" rx="8" fill="${T.accentWash}" stroke="#8FB8AC"/>
    <text x="38" y="309" font-family="${FONT}" font-size="14" font-weight="600" fill="${T.ink}">Tempo</text>
    <circle cx="41" cy="324" r="3" fill="${T.accent}"/>
    <text x="50" y="328" font-family="${MONO}" font-size="10.5" fill="${T.inkMuted}">Live · Mainnet</text>

    <rect x="180" y="286" width="150" height="50" rx="8" fill="${T.amberWash}" stroke="#D6B775"/>
    <text x="198" y="309" font-family="${FONT}" font-size="14" font-weight="600" fill="${T.ink}">Stellar</text>
    <circle cx="201" cy="324" r="3" fill="${T.amber}"/>
    <text x="210" y="328" font-family="${MONO}" font-size="10.5" fill="${T.inkMuted}">Testnet</text>

    <rect x="340" y="286" width="149" height="50" rx="8" fill="${T.surface}" stroke="${T.line}"/>
    <text x="358" y="309" font-family="${FONT}" font-size="14" font-weight="600" fill="${T.ink}">Base · Solana</text>
    <circle cx="361" cy="324" r="3" fill="${T.line}"/>
    <text x="370" y="328" font-family="${MONO}" font-size="10.5" fill="${T.inkMuted}">routing</text>

    <path d="M254 336 V366" stroke="${T.amber}" stroke-width="1.5" stroke-dasharray="4 5"/>
    <path d="M248 360 254 368 260 360" fill="none" stroke="${T.amber}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="254" y="388" font-family="${MONO}" font-size="11.5" fill="${T.inkMuted}" text-anchor="middle">licensed partners → local bank accounts</text>
  </g>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${T.surface}"/>
  <rect y="626" width="1200" height="4" fill="${T.accent}"/>
  <rect y="626" width="200" height="4" fill="${T.amber}"/>

  <g transform="translate(72 96)">
    <path d="M25 8.6A11.5 11.5 0 1 0 25 23.4" fill="none" stroke="${T.accent}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M18.5 16H29" fill="none" stroke="${T.amber}" stroke-width="3.4" stroke-linecap="round"/>
    <text x="46" y="22" font-family="${FONT}" font-size="21" font-weight="600" fill="${T.ink}">Corridor <tspan fill="${T.inkMuted}" font-weight="500">Finance</tspan></text>
  </g>

  <text x="72" y="248" font-family="${FONT}" font-size="46" font-weight="600" fill="${T.ink}">Payout infrastructure</text>
  <text x="72" y="302" font-family="${FONT}" font-size="46" font-weight="600" fill="${T.ink}">for money moving into</text>
  <text x="72" y="356" font-family="${FONT}" font-size="46" font-weight="600" fill="${T.ink}">and out of Africa.</text>

  <text x="72" y="418" font-family="${FONT}" font-size="19" fill="${T.inkMuted}">One platform, three layers. Settlement network</text>
  <text x="72" y="446" font-family="${FONT}" font-size="19" fill="${T.inkMuted}">chosen per corridor.</text>

  <g transform="translate(72 508)">
    <rect x="0" y="0" width="12" height="2" fill="${T.amber}"/>
    <text x="0" y="28" font-family="${MONO}" font-size="13" fill="${T.inkMuted}">corridorfinance.tech</text>
  </g>

  ${diagram}
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="38" fill="${T.surface}"/>
  <g transform="translate(26 26) scale(4)">
    <path d="M25 8.6A11.5 11.5 0 1 0 25 23.4" fill="none" stroke="${T.accent}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M18.5 16H29" fill="none" stroke="${T.amber}" stroke-width="3.4" stroke-linecap="round"/>
  </g>
</svg>`;

await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(join(out, 'og.png'));
await sharp(Buffer.from(icon)).png({ compressionLevel: 9 }).toFile(join(out, 'apple-touch-icon.png'));

console.log('wrote public/og.png and public/apple-touch-icon.png');
