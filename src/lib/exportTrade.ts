import { SETS, type Set } from '@/data';
import { getSetCode } from '@/lib/card';

export interface TradeItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

export type TradeMap = Record<string, TradeItem>;

export interface TradeLists {
  lf: TradeMap;
  ft: TradeMap;
}

export function exportTradeLists(lists: TradeLists): string {
  const sections: string[] = [];

  if (Object.keys(lists.lf).length) sections.push(`LF:\n${formatGroup(lists.lf)}`);

  if (Object.keys(lists.ft).length) sections.push(`FT:\n${formatGroup(lists.ft)}`);

  return sections.join('\n\n');
}

function formatGroup(map: TradeMap): string {
  const bySet: Record<string, string[]> = {};
  for (const item of Object.values(map)) {
    const code = getSetCode(item.id).toLowerCase();
    (bySet[code] ??= []).push(item.name);
  }

  return [...SETS]
    .reverse() // latest release first
    .filter((s: Set) => bySet[s.code.toLowerCase()]?.length)
    .map((s: Set) => {
      const names = bySet[s.code.toLowerCase()]
        .sort((a, b) => a.localeCompare(b))
        .map((n) => n);
      return `- [${s.abbreviation}] ${names.join(', ')}`;
    })
    .join('\n');
}
