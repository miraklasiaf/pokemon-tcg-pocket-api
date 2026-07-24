"use client";

const STORAGE_KEY = "tcg_trade_lists";

export function loadTradeLists() {
  if (typeof window === "undefined") return { ft: {}, lf: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ft: {}, lf: {} };
  } catch {
    return { ft: {}, lf: {} };
  }
}

export function saveTradeLists(lists) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}
