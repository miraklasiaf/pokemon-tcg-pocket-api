export const PAGE_SIZES = [25, 50, 100, 200] as const;

export const RARITIES = [
  '◊',
  '◊◊',
  '◊◊◊',
  '◊◊◊◊',
  '☆',
  '☆☆',
  '☆☆☆',
  '♕',
  'Promo'
] as const;

export const SETS = [
  { code: 'A1', name: 'Genetic Apex' },
  { code: 'A1a', name: 'Mythical Island' },
  { code: 'A2', name: 'Space-Time Smackdown' },
  { code: 'A2a', name: 'Triumphant Light' },
  { code: 'A2b', name: 'Shining Revelry' },
  { code: 'A3', name: 'Celestial Guardians' },
  { code: 'A3a', name: 'Extradimensional Crisis' },
  { code: 'A3b', name: 'Eevee Grove' },
  { code: 'A4', name: 'Wisdom of Sea and Sky' },
  { code: 'A4a', name: 'Secluded Springs' },
  { code: 'A4b', name: 'Deluxe Pack: ex' },
  { code: 'PA', name: 'Promo-A' },
  { code: 'B1', name: 'Mega Rising' },
  { code: 'B1a', name: 'Crimson Blaze' },
  { code: 'B2', name: 'Fantastical Parade' },
  { code: 'B2a', name: 'Paldean Wonders' },
  { code: 'B2b', name: 'Mega Shine' },
  { code: 'B3', name: 'Pulsing Aura' },
  { code: 'B3a', name: 'Paradox Drive' },
  { code: 'B3b', name: 'Everyday Wonders' },
  { code: 'PB', name: 'Promo-B' }
] as const;

export type Set = (typeof SETS)[number];
export type SetCode = Set['code'];
