import { SETS } from '@/data';

const SET_NAME_BY_CODE = new Map(SETS.map((s) => [s.code.toLowerCase(), s.name]));
const SET_IMAGE_BY_CODE = new Map(SETS.map((s) => [s.code.toLowerCase(), s.image]));

// "a1-224" -> "Genetic Apex"
export const getSetName = (id: string): string => {
  const code = getSetCode(id);
  return SET_NAME_BY_CODE.get(code.toLowerCase()) ?? code;
};

// "a1-224" -> "images/sets/a1.webp"
export const getSetImage = (id: string): string | undefined => {
  const code = getSetCode(id);
  return SET_IMAGE_BY_CODE.get(code.toLowerCase());
};

// "a1-224" -> "a1"
export const getSetCode = (id: string): string => {
  const dashIndex = id.indexOf('-');
  return dashIndex === -1 ? id : id.slice(0, dashIndex);
};

// "a1-224" -> 224
export const getCardNumber = (id: string): number => {
  const dashIndex = id.indexOf('-');
  const numPart = dashIndex === -1 ? id : id.slice(dashIndex + 1);
  const n = parseInt(numPart, 10);
  return Number.isNaN(n) ? 0 : n;
};
