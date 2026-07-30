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
  { code: 'A1', name: 'Genetic Apex', abbreviation: 'GA', image: 'images/sets/a1.webp' },
  {
    code: 'A1a',
    name: 'Mythical Island',
    abbreviation: 'MI',
    image: 'images/sets/a1a.webp'
  },
  {
    code: 'A2',
    name: 'Space-Time Smackdown',
    abbreviation: 'STS',
    image: 'images/sets/a2.webp'
  },
  {
    code: 'A2a',
    name: 'Triumphant Light',
    abbreviation: 'TL',
    image: 'images/sets/a2a.webp'
  },
  {
    code: 'A2b',
    name: 'Shining Revelry',
    abbreviation: 'SR',
    image: 'images/sets/a2b.webp'
  },
  {
    code: 'A3',
    name: 'Celestial Guardians',
    abbreviation: 'CG',
    image: 'images/sets/a3.webp'
  },
  {
    code: 'A3a',
    name: 'Extradimensional Crisis',
    abbreviation: 'EC',
    image: 'images/sets/a3a.webp'
  },
  {
    code: 'A3b',
    name: 'Eevee Grove',
    abbreviation: 'EG',
    image: 'images/sets/a3b.webp'
  },
  {
    code: 'A4',
    name: 'Wisdom of Sea and Sky',
    abbreviation: 'WSS',
    image: 'images/sets/a4.webp'
  },
  {
    code: 'A4a',
    name: 'Secluded Springs',
    abbreviation: 'SS',
    image: 'images/sets/a4a.webp'
  },
  {
    code: 'A4b',
    name: 'Deluxe Pack: ex',
    abbreviation: 'DPex',
    image: 'images/sets/a4b.webp'
  },
  {
    code: 'B1',
    name: 'Mega Rising',
    abbreviation: 'MR',
    image: 'images/sets/b1.webp'
  },
  {
    code: 'B1a',
    name: 'Crimson Blaze',
    abbreviation: 'CB',
    image: 'images/sets/b1a.webp'
  },
  {
    code: 'B2',
    name: 'Fantastical Parade',
    abbreviation: 'FP',
    image: 'images/sets/b2.webp'
  },
  {
    code: 'B2a',
    name: 'Paldean Wonders',
    abbreviation: 'PW',
    image: 'images/sets/b2a.webp'
  },
  {
    code: 'B2b',
    name: 'Mega Shine',
    abbreviation: 'MS',
    image: 'images/sets/b2b.webp'
  },
  {
    code: 'B3',
    name: 'Pulsing Aura',
    abbreviation: 'PA',
    image: 'images/sets/b3.webp'
  },
  {
    code: 'B3a',
    name: 'Paradox Drive',
    abbreviation: 'PD',
    image: 'images/sets/b3a.webp'
  },
  {
    code: 'B3b',
    name: 'Everyday Wonders',
    abbreviation: 'EW',
    image: 'images/sets/b3b.webp'
  },
  {
    code: 'B4',
    name: 'Ruler of the Skies',
    abbreviation: 'RTS',
    image: 'images/sets/b4.webp'
  },
  {
    code: 'PA',
    name: 'Promo-A',
    abbreviation: 'P-A',
    image: 'images/sets/pa.webp'
  },
  {
    code: 'PB',
    name: 'Promo-B',
    abbreviation: 'P-B',
    image: 'images/sets/pb.webp'
  }
] as const;

export type Set = (typeof SETS)[number];
export type SetCode = Set['code'];
