import { NextResponse } from 'next/server';
import { readAllCards } from '../../../lib/scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

/**
 * GET /api/cards
 * Optional query params:
 *   ?pack=Charizard        filter by pack name (case-insensitive, partial match)
 *   ?rarity=%E2%99%95      filter by exact rarity
 *   ?ex=Yes                filter by ex flag ("Yes" | "No")
 *   ?q=pikachu             search by name, id, or pack (case-insensitive, partial match)
 *   ?id=b2b-001            fetch a single card by exact id
 *   ?limit=50&offset=0     pagination (limit capped at 200, default 50)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  let cards;
  try {
    cards = await readAllCards();
  } catch (err) {
    console.error('Failed to read cards:', err);
    return NextResponse.json({ error: 'Failed to load card data' }, { status: 500 });
  }

  const id = searchParams.get('id');

  if (id) {
    const card = cards.find((c) => c.id === id);

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  }

  let filtered = cards;

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

  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.id.toLowerCase().includes(needle) ||
        c.pack.toLowerCase().includes(needle)
    );
  }

  const total = filtered.length;

  // Pagination — offset always applies; limit is clamped and defaulted.
  const rawOffset = parseInt(searchParams.get('offset'), 10);
  const offset = Number.isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

  const rawLimit = parseInt(searchParams.get('limit'), 10);
  const limit = Number.isNaN(rawLimit)
    ? DEFAULT_LIMIT
    : Math.min(Math.max(rawLimit, 0), MAX_LIMIT);

  filtered = filtered.slice(offset, offset + limit);

  return NextResponse.json({ total, count: filtered.length, cards: filtered });
}
