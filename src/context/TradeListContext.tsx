'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode
} from 'react';
import { loadTradeLists, saveTradeLists, resetTradeLists } from '@/lib/tradeList';
import type { TradeLists, TradeItem } from '@/lib/exportTrade';

export type TradeType = keyof TradeLists; // 'ft' | 'lf'

// Minimum shape needed to add a card to a trade list;
// callers may pass a fuller card object, only id/name are used here.
export interface ToggleableCard {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface TradeListContextValue {
  lists: TradeLists;
  toggle: (card: ToggleableCard, type: TradeType) => void;
  reset: () => void;
}

const TradeListContext = createContext<TradeListContextValue | null>(null);

export function TradeListProvider({ children }: { children: ReactNode }): ReactElement {
  const [lists, setLists] = useState<TradeLists>({ ft: {}, lf: {} });

  useEffect(() => {
    setLists(loadTradeLists());
  }, []);

  const toggle = useCallback((card: ToggleableCard, type: TradeType) => {
    setLists((prev) => {
      const next: TradeLists = { ...prev, [type]: { ...prev[type] } };

      if (next[type][card.id]) {
        delete next[type][card.id];
      } else {
        const item: TradeItem = { id: card.id, name: card.name };
        next[type][card.id] = item;
      }

      saveTradeLists(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    resetTradeLists();
    setLists({ ft: {}, lf: {} });
  }, []);

  return (
    <TradeListContext.Provider value={{ lists, toggle, reset }}>
      {children}
    </TradeListContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components */
export function useTradeList(): TradeListContextValue {
  const ctx = useContext(TradeListContext);

  if (!ctx) throw new Error('useTradeList must be used inside TradeListProvider');

  return ctx;
}
