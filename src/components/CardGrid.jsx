'use client';

import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
const RARITY_OPTIONS = ['◊', '◊◊', '◊◊◊', '◊◊◊◊', '☆', '☆☆', '☆☆☆', '♕', 'Promo'];

// Ordered oldest -> newest within each series; code is the id prefix, name is the display label
const SETS = [
  { code: 'A1', name: 'Genetic Apex' },
  { code: 'A1a', name: 'Mythical Island' },
  { code: 'A2', name: 'Space-Time Smackdown' },
  { code: 'A2a', name: 'Triumphant Light' },
  { code: 'A2b', name: 'Shining Revelry' },
  { code: 'A3', name: 'Celestial Guardians' },
  { code: 'A3a', name: 'Extradimensional Crisis' },
  { code: 'A3b', name: 'Eevee Grove' },
  { code: 'A4', name: 'Wisdom of Sea and Sky' },
  { code: 'A4a', name: 'Secluded Springs' },
  { code: 'A4b', name: 'Deluxe Pack: ex' },
  { code: 'PA', name: 'Promo-A' },
  { code: 'B1', name: 'Mega Rising' },
  { code: 'B1a', name: 'Crimson Blaze' },
  { code: 'B2', name: 'Fantastical Parade' },
  { code: 'B2a', name: 'Paldean Wonders' },
  { code: 'B2b', name: 'Mega Shine' },
  { code: 'B3', name: 'Pulsing Aura' },
  { code: 'B3a', name: 'Paradox Drive' },
  { code: 'B3b', name: 'Everyday Wonders' },
  { code: 'PB', name: 'Promo-B' }
];

const SET_ORDER = new Map(SETS.map((s, i) => [s.code.toLowerCase(), i]));
const SET_NAME_BY_CODE = new Map(SETS.map((s) => [s.code.toLowerCase(), s.name]));

// "a1-224" -> "a1"
function getSetCode(id) {
  const dashIndex = id.indexOf('-');
  return dashIndex === -1 ? id : id.slice(0, dashIndex);
}

// "a1-224" -> 224
function getCardNumber(id) {
  const dashIndex = id.indexOf('-');
  const numPart = dashIndex === -1 ? id : id.slice(dashIndex + 1);
  const n = parseInt(numPart, 10);
  return Number.isNaN(n) ? 0 : n;
}

function setRank(id) {
  const rank = SET_ORDER.get(getSetCode(id).toLowerCase());
  return rank === undefined ? SETS.length : rank; // unknown sets sort last
}

export default function CardGrid({ cards, columns = 5 }) {
  const [query, setQuery] = useState('');
  const [set, setSet] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [sortBy, setSortBy] = useState('set');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [activeCard, setActiveCard] = useState(null);

  // Dropdown options: canonical SETS order, only sets actually present in the data,
  // value = code (e.g. "A1"), label = full name (e.g. "Genetic Apex")
  const setOptions = useMemo(() => {
    const codesInData = new Set(cards.map((c) => getSetCode(c.id).toLowerCase()));
    return [
      { code: 'all', name: 'All' },
      ...SETS.filter((s) => codesInData.has(s.code.toLowerCase()))
    ];
  }, [cards]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    let result = cards.filter((card) => {
      const cardSet = getSetCode(card.id).toLowerCase();

      const matchesQuery =
        !needle ||
        card.name.toLowerCase().includes(needle) ||
        cardSet.includes(needle) ||
        card.id.toLowerCase().includes(needle) ||
        (SET_NAME_BY_CODE.get(cardSet) || '').toLowerCase().includes(needle);

      const matchesSet = set === 'all' || cardSet === set.toLowerCase();

      const matchesRarity = rarity === 'all' || card.rarity === rarity;

      return matchesQuery && matchesSet && matchesRarity;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'hp') return (Number(b.health) || 0) - (Number(a.health) || 0);

      if (sortBy === 'name') return a.name.localeCompare(b.name);

      // default: by set order, then by card number within the set
      const rankDiff = setRank(a.id) - setRank(b.id);

      if (rankDiff !== 0) return rankDiff;

      return getCardNumber(a.id) - getCardNumber(b.id);
    });

    return result;
  }, [cards, query, set, rarity, sortBy]);

  // Reset to page 1 whenever the result set changes shape
  useEffect(() => {
    setPage(1);
  }, [query, set, rarity, sortBy, pageSize]);

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
          placeholder="Search name, set, or id"
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
          Set
          <select
            value={set}
            onChange={(e) => setSet(e.target.value)}
          >
            {setOptions.map((s) => (
              <option
                key={s.code}
                value={s.code}
              >
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="binder-toolbar-field">
          Rarity
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
          >
            <option value="all">All</option>
            {RARITY_OPTIONS.map((r) => (
              <option
                key={r}
                value={r}
              >
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="binder-toolbar-field">
          Sort
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="set">Set (default order)</option>
            <option value="name">Name (A–Z)</option>
            <option value="hp">HP (high–low)</option>
          </select>
        </label>

        <label className="binder-toolbar-field">
          Per page
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option
                key={size}
                value={size}
              >
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="binder-page">
        {filtered.length === 0 ? (
          <p className="binder-no-results">No cards match &ldquo;{query}&rdquo;.</p>
        ) : (
          <div
            className="card-grid"
            style={{ '--grid-columns': columns }}
          >
            {pageItems.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                onSelect={() => setActiveCard(card)}
              />
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <nav
          className="binder-pagination"
          aria-label="Pagination"
        >
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
        <CardModal
          card={activeCard}
          onClose={() => setActiveCard(null)}
        />
      )}
    </>
  );
}

function CardTile({ card, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={`${card.name} — ${card.id}`}
    >
      <div className="card-art-wrap">
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            loading="lazy"
          />
        ) : (
          <span className="card-art-placeholder">No image</span>
        )}
      </div>
    </button>
  );
}

function CardModal({ card, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="card-modal-overlay"
      onClick={onClose}
    >
      <div
        className="card-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="card-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="card-modal-art">
          {card.image ? (
            <img
              src={card.image}
              alt={card.name}
            />
          ) : (
            <span className="card-art-placeholder">No image</span>
          )}
        </div>
      </div>
    </div>
  );
}
