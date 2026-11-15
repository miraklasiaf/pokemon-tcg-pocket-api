'use client';

import { PAGE_SIZES, RARITIES, SETS } from '@/data';
import type { SxProps, Theme } from '@mui/material/styles';
import { getCardNumber, getSetCode, getSetImage, getSetName } from '@/lib/card';
import { useEffect, useMemo, useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MuiCard from '@mui/material/Card';
import Pagination from '@mui/material/Pagination';
import type { Card as PocketCard } from '@/types/card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import TradeTray from './TradeTray';
import Typography from '@mui/material/Typography';
import { useTradeList } from '@/context/TradeListContext';

type SetOption = { code: string; name: string };

type CardGridProps = {
  cards: PocketCard[];
  columns?: number;
};

type CardArtProps = {
  card: PocketCard;
  sx?: SxProps<Theme>;
};

const SET_ORDER = new Map(SETS.map((s, i) => [s.code.toLowerCase(), i]));
const SET_NAME_BY_CODE = new Map(SETS.map((s) => [s.code.toLowerCase(), s.name]));

function setRank(id: string): number {
  const rank = SET_ORDER.get(getSetCode(id).toLowerCase());
  return rank === undefined ? SETS.length : rank; // unknown sets sort last
}

export default function CardGrid({ cards, columns = 6 }: CardGridProps) {
  const [query, setQuery] = useState('');
  const [set, setSet] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [sortBy, setSortBy] = useState('set');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [activeCard, setActiveCard] = useState<PocketCard | null>(null);

  // Canonical SETS order, only sets present in the data
  const setOptions = useMemo<SetOption[]>(() => {
    const codesInData = new Set(cards.map((c) => getSetCode(c.id).toLowerCase()));
    return [
      { code: 'all', name: 'All' },
      ...SETS.filter((s) => codesInData.has(s.code.toLowerCase()))
    ];
  }, [cards]);

  const rarityOptions = useMemo<string[]>(() => ['All', ...RARITIES], []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const result = cards.filter((card) => {
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

    return [...result].sort((a, b) => {
      if (sortBy === 'hp') return (Number(b.health) || 0) - (Number(a.health) || 0);

      if (sortBy === 'name') return a.name.localeCompare(b.name);

      const rankDiff = setRank(a.id) - setRank(b.id);

      if (rankDiff !== 0) return rankDiff;

      return getCardNumber(a.id) - getCardNumber(b.id);
    });
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
    <Container
      maxWidth="xl"
      sx={{ py: 3, pb: 12 }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between', mb: 3 }}
      >
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
          >
            Pokemon TCG Pocket Card Database
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700 }}
          >
            Pocket Binder
          </Typography>
        </Box>

        <TextField
          type="search"
          size="small"
          placeholder="Search name, set, or id"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{ htmlInput: { 'aria-label': 'Search cards' } }}
          sx={{ flex: 1, maxWidth: { md: 400 } }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          <strong>{filtered.length}</strong> / {cards.length} cards
        </Typography>
      </Stack>

      {/* Toolbar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Autocomplete
          size="small"
          disableClearable
          options={setOptions}
          value={setOptions.find((s) => s.code === set) ?? setOptions[0]}
          onChange={(_, option) => setSet(option.code)}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(o, v) => o.code === v.code}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Set"
            />
          )}
          sx={{ minWidth: 220 }}
        />

        <Autocomplete
          size="small"
          disableClearable
          options={rarityOptions}
          value={rarity === 'all' ? 'All' : rarity}
          onChange={(_, v) => setRarity(v === 'All' ? 'all' : v)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Rarity"
            />
          )}
          sx={{ minWidth: 180 }}
        />

        <TextField
          select
          size="small"
          label="Sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="set">Set</MenuItem>
          <MenuItem value="name">Name (A–Z)</MenuItem>
          <MenuItem value="hp">HP (high–low)</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Per page"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          sx={{ minWidth: 120 }}
        >
          {PAGE_SIZES.map((size) => (
            <MenuItem
              key={size}
              value={size}
            >
              {size}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Typography
          color="text.secondary"
          sx={{ py: 8, textAlign: 'center' }}
        >
          No cards match &ldquo;{query}&rdquo;.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: `repeat(${columns}, 1fr)`
            }
          }}
        >
          {pageItems.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              onSelect={() => setActiveCard(card)}
            />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <Stack sx={{ alignItems: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={clampedPage}
            onChange={(_, p) => setPage(p)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}

      {activeCard && (
        <CardModal
          card={activeCard}
          onClose={() => setActiveCard(null)}
        />
      )}
      <TradeTray />
    </Container>
  );
}

function SetLabel({ card }: { card: PocketCard }) {
  const setCode = getSetCode(card.id);
  const setImage = getSetImage(card.id);
  const setName = getSetName(card.id);
  const cardNo = getCardNumber(card.id);
  const showPack = card.pack !== setName && !card.pack.startsWith('Shared(');

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', minWidth: 0 }}
    >
      {setImage ? (
        <Box
          component="img"
          src={setImage}
          alt={setName}
          loading="lazy"
          sx={{ height: 20, width: 'auto' }}
        />
      ) : (
        <Typography
          variant="caption"
          noWrap
        >
          {setName}
        </Typography>
      )}
      {showPack && (
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
        >
          {card.pack.trim()}
        </Typography>
      )}
      <Chip
        label={`${setCode}-${cardNo}`}
        size="small"
        variant="outlined"
        sx={{ ml: 'auto !important' }}
      />
    </Stack>
  );
}

function CardArt({ card, sx }: CardArtProps) {
  const extraSx = Array.isArray(sx) ? sx : [sx];

  return card.image ? (
    <Box
      component="img"
      src={card.image}
      alt={card.name}
      loading="lazy"
      sx={[{ width: '100%', aspectRatio: '5 / 7', objectFit: 'contain' }, ...extraSx]}
    />
  ) : (
    <Box
      sx={[
        {
          width: '100%',
          aspectRatio: '5 / 7',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
          color: 'text.secondary'
        },
        ...extraSx
      ]}
    >
      <Typography variant="caption">No image</Typography>
    </Box>
  );
}

function CardTile({ card, onSelect }: { card: PocketCard; onSelect: () => void }) {
  const { lists, toggle } = useTradeList();
  const isFt = Boolean(lists.ft[card.id]);
  const isLf = Boolean(lists.lf[card.id]);
  const isPromo = card.rarity === 'Promo';

  return (
    <MuiCard
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      <CardActionArea
        onClick={onSelect}
        title={`${card.name} — ${card.id}`}
        sx={{ flex: 1 }}
      >
        <Box sx={{ px: 1, pt: 1 }}>
          <SetLabel card={card} />
        </Box>
        <Box sx={{ p: 1 }}>
          <CardArt card={card} />
        </Box>
      </CardActionArea>

      {!isPromo && (
        <ButtonGroup
          fullWidth
          size="small"
          sx={{ p: 1, pt: 0 }}
        >
          <Button
            color="info"
            variant={isLf ? 'contained' : 'outlined'}
            onClick={() => toggle(card, 'lf')}
          >
            LF
          </Button>
          <Button
            color="success"
            variant={isFt ? 'contained' : 'outlined'}
            onClick={() => toggle(card, 'ft')}
          >
            FT
          </Button>
        </ButtonGroup>
      )}
    </MuiCard>
  );
}

function CardModal({ card, onClose }: { card: PocketCard; onClose: () => void }) {
  // Dialog handles Escape and backdrop clicks for us
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', mb: 1 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SetLabel card={card} />
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close"
            size="small"
          >
            ×
          </IconButton>
        </Stack>
        <CardArt card={card} />
      </DialogContent>
    </Dialog>
  );
}
