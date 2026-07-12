import { PAGE_SIZES, SETS, type Set } from '@/data';
import { getCardNumber, getSetCode } from '@/lib/card';
import { matchSorter, rankings } from 'match-sorter';
import type { Card } from '@/types/card';
import { NextResponse } from 'next/server';
import { readAllCards } from '@/lib/scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SET_ORDER = new Map<string, number>(SETS.map((s, i) => [s.code.toLowerCase(), i]));
const SET_NAME_BY_CODE = new Map<string, string>(
  SETS.map((s) => [s.code.toLowerCase(), s.name])
);
const SET_CODE_BY_NAME = new Map<string, string>(
  SETS.map((s) => [s.name.toLowerCase(), s.code.toLowerCase()])
);

function setRank(id: string): number {
  const rank = SET_ORDER.get(getSetCode(id).toLowerCase());
  return rank === undefined ? SETS.length : rank; // unknown sets sort last
}

function sortBySet(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const diff = setRank(a.id) - setRank(b.id);
    return diff !== 0 ? diff : getCardNumber(a.id) - getCardNumber(b.id);
  });
}

// Accepts either a set code ("B3b") or a full set name ("Everyday Wonders"), case-insensitive
function resolveSetCode(value: string): string {
  const needle = value.toLowerCase();

  if (SET_NAME_BY_CODE.has(needle)) return needle;

  if (SET_CODE_BY_NAME.has(needle)) return SET_CODE_BY_NAME.get(needle) as string;

  return needle; // fall through — will just match nothing if invalid
}

/**
 * GET /api/cards
 * Optional query params:
 *   ?set=B3b or ?set=Everyday%20Wonders   filter by set — accepts code or full name, case-insensitive
 *   ?pack=Charizard                        filter by pack name (case-insensitive, partial match) — legacy, prefer ?set
 *   ?rarity=%E2%99%95                      filter by exact rarity
 *   ?ex=Yes                                filter by ex flag ("Yes" | "No")
 *   ?q=pikachu                             fuzzy, relevance-ranked search across name/id/pack/set name/artist (match-sorter)
 *   ?id=b2b-001                            fetch a single card by exact id (case-insensitive)
 *   ?sort=set|name|hp                      sort order; ignored when ?q is present, since search relevance wins. default: set
 *   ?limit=50&offset=0                     pagination (limit capped at 200, default 50)
 *   ?includeSets=1                         also return the list of available sets (code + name) in the response
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  let cards: Card[];
  try {
    cards = await readAllCards();
  } catch (err) {
    console.error('Failed to read cards:', err);
    return NextResponse.json({ error: 'Failed to load card data' }, { status: 500 });
  }

  const id = searchParams.get('id');

  if (id) {
    const card = cards.find((c) => c.id.toLowerCase() === id.toLowerCase());

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  }

  let filtered: Card[] = cards;

  const set = searchParams.get('set');

  if (set) {
    const needle = resolveSetCode(set);
    filtered = filtered.filter((c) => getSetCode(c.id).toLowerCase() === needle);
  }

  const pack = searchParams.get('pack');

  if (pack) {
    const needle = pack.toLowerCase();
    filtered = filtered.filter((c) => c.pack.toLowerCase().includes(needle));
  }

  const rarity = searchParams.get('rarity');

  if (rarity) {
    filtered = filtered.filter((c) => c.rarity === rarity);
  }

  const ex = searchParams.get('ex');

  if (ex) {
    filtered = filtered.filter((c) => c.ex.toLowerCase() === ex.toLowerCase());
  }

  const q = searchParams.get('q');
  let rankedBySearch = false;

  if (q && q.trim()) {
    // Precompute a set-name field so match-sorter can search it like any other key
    const withSetName = filtered.map((c) => ({
      ...c,
      __setName: SET_NAME_BY_CODE.get(getSetCode(c.id).toLowerCase()) || ''
    }));

    filtered = matchSorter(withSetName, q.trim(), {
      keys: [
        'name', // best matches (exact/starts-with) rank highest
        'id',
        '__setName',
        'pack',
        { key: 'artist', threshold: rankings.CONTAINS } // lower-priority, looser match
      ]
    }).map(({ __setName, ...c }) => c as Card); // strip the helper field back out

    rankedBySearch = true;
  }

  if (!rankedBySearch) {
    const sort = searchParams.get('sort');

    if (sort === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'hp') {
      filtered = [...filtered].sort(
        (a, b) => (Number(b.health) || 0) - (Number(a.health) || 0)
      );
    } else {
      filtered = sortBySet(filtered);
    }
  }

  const total = filtered.length;

  const rawOffset = parseInt(searchParams.get('offset') ?? '', 10);
  const offset = Number.isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

  const rawLimit = parseInt(searchParams.get('limit') ?? '', 10);
  const limit = Number.isNaN(rawLimit)
    ? PAGE_SIZES[0]
    : Math.min(Math.max(rawLimit, 0), PAGE_SIZES[PAGE_SIZES.length - 1]);

  const page = filtered.slice(offset, offset + limit);

  const response: { total: number; count: number; cards: Card[]; sets?: Set[] } = {
    total,
    count: page.length,
    cards: page
  };

  if (searchParams.get('includeSets')) {
    const codesInData = new Set(cards.map((c) => getSetCode(c.id).toLowerCase()));
    response.sets = SETS.filter((s) => codesInData.has(s.code.toLowerCase()));
  }

  return NextResponse.json(response);
}
