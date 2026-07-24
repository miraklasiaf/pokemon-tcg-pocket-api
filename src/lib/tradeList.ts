'use client';

import type { TradeLists } from '@/lib/exportTrade';

const STORAGE_KEY = 'tcg_trade_lists';

const EMPTY_LISTS: TradeLists = { ft: {}, lf: {} };

export function loadTradeLists(): TradeLists {
  if (typeof window === 'undefined') return EMPTY_LISTS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TradeLists) : EMPTY_LISTS;
  } catch {
    return EMPTY_LISTS;
  }
}

export function saveTradeLists(lists: TradeLists): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function resetTradeLists(): void {
  localStorage.removeItem(STORAGE_KEY);
}
