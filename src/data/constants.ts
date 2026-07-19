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
  { code: 'A1', name: 'Genetic Apex', image: 'images/sets/a1.webp' },
  { code: 'A1a', name: 'Mythical Island', image: 'images/sets/a1a.webp' },
  { code: 'A2', name: 'Space-Time Smackdown', image: 'images/sets/a2.webp' },
  { code: 'A2a', name: 'Triumphant Light', image: 'images/sets/a2a.webp' },
  { code: 'A2b', name: 'Shining Revelry', image: 'images/sets/a2b.webp' },
  { code: 'A3', name: 'Celestial Guardians', image: 'images/sets/a3.webp' },
  { code: 'A3a', name: 'Extradimensional Crisis', image: 'images/sets/a3a.webp' },
  { code: 'A3b', name: 'Eevee Grove', image: 'images/sets/a3b.webp' },
  { code: 'A4', name: 'Wisdom of Sea and Sky', image: 'images/sets/a4.webp' },
  { code: 'A4a', name: 'Secluded Springs', image: 'images/sets/a4a.webp' },
  { code: 'A4b', name: 'Deluxe Pack: ex', image: 'images/sets/a4b.webp' },
  { code: 'PA', name: 'Promo-A', image: 'images/sets/pa.webp' },
  { code: 'B1', name: 'Mega Rising', image: 'images/sets/b1.webp' },
  { code: 'B1a', name: 'Crimson Blaze', image: 'images/sets/b1a.webp' },
  { code: 'B2', name: 'Fantastical Parade', image: 'images/sets/b2.webp' },
  { code: 'B2a', name: 'Paldean Wonders', image: 'images/sets/b2a.webp' },
  { code: 'B2b', name: 'Mega Shine', image: 'images/sets/b2b.webp' },
  { code: 'B3', name: 'Pulsing Aura', image: 'images/sets/b3.webp' },
  { code: 'B3a', name: 'Paradox Drive', image: 'images/sets/b3a.webp' },
  { code: 'B3b', name: 'Everyday Wonders', image: 'images/sets/b3b.webp' },
  { code: 'PB', name: 'Promo-B', image: 'images/sets/pb.webp' }
] as const;

export type Set = (typeof SETS)[number];
export type SetCode = Set['code'];
