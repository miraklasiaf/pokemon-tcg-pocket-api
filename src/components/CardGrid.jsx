"use client";

import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

export default function CardGrid({ cards, columns = 5 }) {
  const [query, setQuery] = useState("");
  const [pack, setPack] = useState("all");
  const [rarity, setRarity] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [activeCard, setActiveCard] = useState(null);

  const packs = useMemo(() => {
    const set = new Set(cards.map((c) => c.pack).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [cards]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    let result = cards.filter((card) => {
      const matchesQuery =
        !needle ||
        card.name.toLowerCase().includes(needle) ||
        card.pack.toLowerCase().includes(needle) ||
        card.id.toLowerCase().includes(needle);

      const matchesPack = pack === "all" || card.pack === pack;

      const matchesRarity =
        rarity === "all" ||
        (rarity === "ex" && card.ex === "Yes") ||
        (rarity === "fullart" && card.fullart === "Yes") ||
        (rarity === "regular" && card.ex !== "Yes" && card.fullart !== "Yes");

      return matchesQuery && matchesPack && matchesRarity;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "hp") return (Number(b.health) || 0) - (Number(a.health) || 0);
      if (sortBy === "pack") return a.pack.localeCompare(b.pack);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [cards, query, pack, rarity, sortBy]);

  // Reset to page 1 whenever the result set changes shape
  useEffect(() => {
    setPage(1);
  }, [query, pack, rarity, sortBy, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, clampedPage, pageSize]);

  return (
    <>
      <header className="binder-header">
        <div className="binder-title-block">
          <span className="binder-eyebrow">Pokemon TCG Pocket Card Database</span>
          <h1 className="binder-title">Pocket Binder</h1>
        </div>
        <input
          type="text"
          className="binder-search"
          placeholder="Search name, set, or id…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search cards"
        />
        <span className="binder-count">
          <strong>{filtered.length}</strong> / {cards.length} cards
        </span>
      </header>

      <div className="binder-toolbar">
        <label className="binder-toolbar-field">
          Pack
          <select value={pack} onChange={(e) => setPack(e.target.value)}>
            {packs.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "All packs" : p}
              </option>
            ))}
          </select>
        </label>

        <label className="binder-toolbar-field">
          Rarity
          <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
            <option value="all">All rarities</option>
            <option value="ex">EX</option>
            <option value="fullart">Full Art</option>
            <option value="regular">Regular</option>
          </select>
        </label>

        <label className="binder-toolbar-field">
          Sort
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name (A–Z)</option>
            <option value="hp">HP (high–low)</option>
            <option value="pack">Pack</option>
          </select>
        </label>

        <label className="binder-toolbar-field">
          Per page
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="binder-page">
        {filtered.length === 0 ? (
          <p className="binder-no-results">
            No cards match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="card-grid" style={{ "--grid-columns": columns }}>
            {pageItems.map((card) => (
              <CardTile key={card.id} card={card} onSelect={() => setActiveCard(card)} />
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <nav className="binder-pagination" aria-label="Pagination">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={clampedPage === 1}
          >
            Prev
          </button>
          <span className="binder-pagination-status">
            Page <strong>{clampedPage}</strong> of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={clampedPage === totalPages}
          >
            Next
          </button>
        </nav>
      )}

      {activeCard && (
        <CardModal card={activeCard} onClose={() => setActiveCard(null)} />
      )}
    </>
  );
}

function CardTile({ card, onSelect }) {
  const isEx = card.ex === "Yes";
  const isFullArt = card.fullart === "Yes";

  return (
    <button
      type="button"
      className={`card-tile${isEx ? " is-ex" : ""}`}
      onClick={onSelect}
      title={`${card.name} — ${card.id}`}
    >
      <div className="card-art-wrap">
        {card.image ? (
          <img src={card.image} alt={card.name} loading="lazy" />
        ) : (
          <span className="card-art-placeholder">No image</span>
        )}
      </div>
      <div className="card-body">
        <span className="card-name">{card.name}</span>
        <div className="card-meta-row">
          <span className="card-id">{card.id}</span>
          {card.health ? <span className="card-hp">{card.health} HP</span> : null}
        </div>
        <div className="card-meta-row">
          <span
            className={`card-rarity-dot${isEx ? " rare" : isFullArt ? " fullart" : ""}`}
            aria-hidden="true"
          />
          <span className="card-pack">{card.pack}</span>
        </div>
      </div>
    </button>
  );
}

function CardModal({ card, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="card-modal-overlay" onClick={onClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="card-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="card-modal-art">
          {card.image ? (
            <img src={card.image} alt={card.name} />
          ) : (
            <span className="card-art-placeholder">No image</span>
          )}
        </div>
        <div className="card-modal-body">
          <h2>{card.name}</h2>
          <p className="card-id">{card.id}</p>
          {card.health ? <p>{card.health} HP</p> : null}
          <p className="card-pack">{card.pack}</p>
          {card.ex === "Yes" && <span className="card-tag">EX</span>}
          {card.fullart === "Yes" && <span className="card-tag">Full Art</span>}
        </div>
      </div>
    </div>
  );
}