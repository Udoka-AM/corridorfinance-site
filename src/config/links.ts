/**
 * Single source of truth for every external link and every status badge on the
 * site. A status change is a one-line edit here and nowhere else.
 *
 * Rule: never publish a badge that overstates where something actually runs.
 * Nothing in the Stellar build has touched Stellar mainnet, so every Stellar
 * entry reads Testnet. The invariant at the bottom of this file fails the
 * build if that slips.
 */

export type StatusId = 'live-mainnet' | 'live' | 'testnet' | 'coming-soon' | 'none';

export type StatusVariant = 'solid' | 'outline' | 'muted';

export interface Status {
  /** Badge text. */
  label: string;
  variant: StatusVariant;
  /** Longer form for table cells and screen readers. */
  long: string;
}

export const STATUS: Record<StatusId, Status> = {
  'live-mainnet': { label: 'Live · Mainnet', variant: 'solid', long: 'Live on mainnet' },
  live: { label: 'Live', variant: 'solid', long: 'Live' },
  testnet: { label: 'Testnet', variant: 'outline', long: 'Testnet' },
  'coming-soon': { label: 'Coming soon', variant: 'muted', long: 'Coming soon' },
  none: { label: '', variant: 'muted', long: '' },
};

export interface LinkEntry {
  label: string;
  href: string;
  status: StatusId;
  /** Opens in a new tab and gets rel=noopener. */
  external: boolean;
  /** One short line used on card listings. */
  blurb?: string;
  /** Which settlement network this entry belongs to, for the invariant below. */
  network?: NetworkId;
}

export type LinkId =
  | 'tempoConsole'
  | 'tempoDocs'
  | 'tempoSource'
  | 'hubStellarSource'
  | 'rampStellarSource'
  | 'rampMultichain'
  | 'contact'
  | 'founderSite'
  | 'founderGithub';

export const LINKS: Record<LinkId, LinkEntry> = {
  tempoConsole: {
    label: 'Corridor on Tempo: console',
    href: 'https://corridorapp.udokaam.dev',
    status: 'live-mainnet',
    external: true,
    blurb: 'The operator console for the Tempo deployment.',
    network: 'tempo',
  },
  tempoDocs: {
    label: 'Corridor on Tempo: docs',
    href: 'https://corridor.udokaam.dev',
    status: 'live',
    external: true,
    blurb: 'Integration guides, references and the payout evidence.',
    network: 'tempo',
  },
  tempoSource: {
    label: 'Corridor on Tempo: source',
    href: 'https://github.com/Udoka-AM/corridor',
    status: 'live-mainnet',
    external: true,
    blurb: 'The settlement engine and ledger running on Tempo.',
    network: 'tempo',
  },
  hubStellarSource: {
    label: 'Corridor Hub on Stellar: source',
    href: 'https://github.com/Udoka-AM/corridorHub',
    status: 'testnet',
    external: true,
    blurb: 'The Stellar-native Hub, on testnet.',
    network: 'stellar',
  },
  rampStellarSource: {
    label: 'Corridor Ramp on Stellar: API + SDK',
    href: 'https://github.com/Udoka-AM/corridorHub/tree/main/packages/ramp',
    status: 'testnet',
    external: true,
    blurb: 'The hosted payout API and the TypeScript SDK, on testnet.',
    network: 'stellar',
  },
  rampMultichain: {
    label: 'Corridor Ramp: multichain',
    href: '/products/ramp#multichain',
    status: 'coming-soon',
    external: false,
    blurb: 'Join the waitlist for additional settlement networks.',
  },
  contact: {
    // PLACEHOLDER: confirm the address before the site goes live.
    label: 'hello@corridorfinance.tech',
    href: 'mailto:hello@corridorfinance.tech',
    status: 'none',
    external: true,
  },
  founderSite: {
    label: 'udokaam.dev',
    href: 'https://udokaam.dev',
    status: 'none',
    external: true,
  },
  founderGithub: {
    label: 'GitHub',
    href: 'https://github.com/Udoka-AM',
    status: 'none',
    external: true,
  },
};

/* ---------------------------------------------------------------- networks */

export type NetworkId = 'tempo' | 'stellar' | 'base' | 'solana';

export interface Network {
  name: string;
  /** Short role, used on cards. */
  role: string;
  /** Long role, used in the networks table. */
  roleLong: string;
  status: StatusId;
  /** Status qualifier shown in the table, e.g. "Tempo deployment". */
  statusNote?: string;
  links: LinkId[];
}

export const NETWORKS: Record<NetworkId, Network> = {
  tempo: {
    name: 'Tempo',
    role: 'Settlement network',
    roleLong: 'Settlement network',
    status: 'live-mainnet',
    links: ['tempoConsole', 'tempoDocs', 'tempoSource'],
  },
  stellar: {
    name: 'Stellar',
    role: 'Settlement network',
    roleLong: 'Settlement network (anchor corridors)',
    status: 'testnet',
    links: ['hubStellarSource'],
  },
  base: {
    name: 'Base',
    role: 'Routing',
    roleLong: 'Routing',
    status: 'live',
    statusNote: 'Tempo deployment',
    links: [],
  },
  solana: {
    name: 'Solana',
    role: 'Routing and payout',
    roleLong: 'Routing and payout',
    status: 'live',
    statusNote: 'Tempo deployment',
    links: [],
  },
};

export const NETWORK_ORDER: NetworkId[] = ['tempo', 'stellar', 'base', 'solana'];

export const NETWORK_NOTE = 'Network availability varies by corridor and partner.';

/* ------------------------------------------------------------------- facts */

/**
 * The one quantitative claim on the site. The first mainnet payout moved
 * 2.90 USDC.e on Tempo and arrived as NGN 3,891.48 in a Nigerian bank account
 * in 74 seconds, on 11 October 2026. Keep the asset name precise.
 */
export const FIRST_PAYOUT = {
  line: 'First mainnet payout: stablecoin to a Nigerian bank account in 74 seconds.',
  href: LINKS.tempoDocs.href,
} as const;

/* ------------------------------------------------------------------ config */

/** Waitlist endpoint. Swap for the real one; empty means the form says so. */
export const WAITLIST_ENDPOINT = import.meta.env.PUBLIC_WAITLIST_ENDPOINT ?? '';

/* --------------------------------------------------------------- invariant */

/**
 * Flip to true only when Stellar has actually settled on mainnet. Until then
 * the build refuses to publish a mainnet badge against a Stellar entry.
 */
const STELLAR_MAINNET_CONFIRMED = false;

const MAINNET_STATUSES: StatusId[] = ['live-mainnet'];

function assertNoOverstatedStatus(): void {
  if (STELLAR_MAINNET_CONFIRMED) return;

  const offenders: string[] = [];

  for (const [id, entry] of Object.entries(LINKS)) {
    if (entry.network === 'stellar' && MAINNET_STATUSES.includes(entry.status)) {
      offenders.push(`LINKS.${id}`);
    }
  }
  if (MAINNET_STATUSES.includes(NETWORKS.stellar.status)) {
    offenders.push('NETWORKS.stellar');
  }

  if (offenders.length > 0) {
    throw new Error(
      `Stellar has not settled on mainnet, so these cannot carry a mainnet badge: ${offenders.join(
        ', ',
      )}. Set STELLAR_MAINNET_CONFIRMED in src/config/links.ts once it has.`,
    );
  }
}

assertNoOverstatedStatus();
