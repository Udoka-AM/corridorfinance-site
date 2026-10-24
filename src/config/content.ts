/** Copy reused across more than one page. Links and statuses live in links.ts. */

export const PRINCIPLES = [
  {
    title: 'Exactly once',
    body: 'A retry never pays twice.',
    icon: 'once',
  },
  {
    title: 'Books that match the chain',
    body: 'Every movement and fee is accounted for.',
    icon: 'books',
  },
  {
    title: 'Your keys',
    body: 'Operators sign with their own signer.',
    icon: 'keys',
  },
  {
    title: 'Licensed partners',
    body: 'Fiat moves only through regulated partners in each corridor.',
    icon: 'licensed',
  },
] as const;

export const LAYERS = [
  {
    name: 'Corridor Core',
    audience: 'The settlement engine',
    body:
      'Payouts execute exactly once, books match the chain, and one reference follows each payment end to end.',
    href: '/platform/',
    icon: 'core',
  },
  {
    name: 'Corridor Hub',
    audience: 'For licensed payment companies',
    body:
      'A payout ledger and router they run in their own environment, on their own keys.',
    href: '/products/hub/',
    icon: 'hub',
  },
  {
    name: 'Corridor Ramp',
    audience: 'For apps, agents and merchants',
    body:
      'A hosted API and SDK to send and receive local African currency through licensed partners.',
    href: '/products/ramp/',
    icon: 'ramp',
  },
] as const;

export const HERO = {
  h1: 'Payout infrastructure for money moving into and out of Africa.',
  sub:
    'Corridor Finance gives licensed payment companies and the apps they serve one way to move ' +
    'stablecoin payouts exactly once, on the settlement network that fits each corridor.',
} as const;
