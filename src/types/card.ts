export interface Card {
  id: string;
  name: string;
  rarity: string;
  pack: string;
  health: string;
  image: string;
  fullart: string;
  ex: string;
  artist: string;
  type: string;
  [key: string]: unknown;
}
