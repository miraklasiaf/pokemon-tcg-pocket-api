"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadTradeLists, saveTradeLists } from "@/lib/tradeList";

const TradeListContext = createContext(null);

export function TradeListProvider({ children }) {
  const [lists, setLists] = useState({ ft: {}, lf: {} });

  useEffect(() => {
    setLists(loadTradeLists());
  }, []);

  const toggle = useCallback((card, type) => {
    setLists((prev) => {
      const next = { ...prev, [type]: { ...prev[type] } };
      if (next[type][card.id]) {
        delete next[type][card.id];
      } else {
        next[type][card.id] = { id: card.id, name: card.name };
      }
      saveTradeLists(next);
      return next;
    });
  }, []);

  return (
    <TradeListContext.Provider value={{ lists, toggle }}>
      {children}
    </TradeListContext.Provider>
  );
}

export function useTradeList() {
  const ctx = useContext(TradeListContext);
  if (!ctx)
    throw new Error("useTradeList must be used inside TradeListProvider");
  return ctx;
}
