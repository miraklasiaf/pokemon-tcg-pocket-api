import * as cheerio from "cheerio";

import axios from "axios";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import sharp from "sharp";

const BASE_URL = "https://pocket.limitlesstcg.com/cards/";
const SEREBII_BASE_URL = "https://www.serebii.net/tcgpocket/";

const ROOT_DIR = process.cwd();
export const DATA_DIR = process.env.DATA_DIR || path.join(ROOT_DIR, "data");
const IMAGES_DIR =
  process.env.IMAGES_DIR || path.join(ROOT_DIR, "public", "images");

export const V4_JSON_PATH = path.join(DATA_DIR, "v4.json");
export const EXPANSIONS_JSON_PATH = path.join(DATA_DIR, "expansions.json");
const CARDS_DIR = path.join(IMAGES_DIR, "cards");
const PACKS_DIR = path.join(IMAGES_DIR, "packs");
const SETS_DIR = path.join(IMAGES_DIR, "sets");

const FULLART_RARITIES = ["☆", "☆☆", "☆☆☆", "Crown Rare"];
const MAX_CONSECUTIVE_ERRORS = 5;

const PROMO_A_PACK_KEYWORDS = [
  "Premium Missions",
  "Missions",
  "Shop",
  "Campaign",
  "Promo pack",
  "Wonder Pick",
];
const PROMO_CARDS_PER_VOLUME = 5;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomUniform(min, max) {
  return Math.random() * (max - min) + min;
}

export function normalizeSetCode(code) {
  const cleaned = code.trim().toUpperCase().replace(/-/g, "");

  if (cleaned === "PA") return "P-A";

  if (cleaned === "PB") return "P-B";

  return code.trim();
}

async function fetchPage(url) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; TCGScraper/1.0)" },
      });
      return cheerio.load(response.data);
    } catch (err) {
      lastErr = err;

      if (attempt === 2) throw lastErr;

      await sleep(1000);
    }
  }
  throw lastErr;
}

function setCodeToPrefix(setCode) {
  if (setCode.startsWith("P-")) {
    return `p${setCode.slice(2).toLowerCase()}`;
  }

  return setCode.toLowerCase();
}

// ---------------------------------------------------------------------------
// Step 1: Discover expansion name
// ---------------------------------------------------------------------------

export async function discoverExpansion(setCode) {
  const $ = await fetchPage(`${BASE_URL}${setCode}`);
  const titleTag = $("title");

  if (!titleTag.length) {
    throw new Error(`Could not find page title for set ${setCode}`);
  }

  let name = titleTag.text().split(" (")[0].trim();
  for (const sep of [" – ", " — ", " - Limitless"]) {
    name = name.split(sep)[0].trim();
  }
  return name;
}

// ---------------------------------------------------------------------------
// Step 1b: Discover the set's icon/logo image from the sets index page
// ---------------------------------------------------------------------------

export async function discoverSetImageUrl(setCode) {
  const $ = await fetchPage(BASE_URL);
  const link = $(`a[href="/cards/${setCode}"]`).first();

  if (!link.length) return null;

  const img = link.find("img.set");

  if (!img.length) return null;

  return img.attr("src") || null;
}

// ---------------------------------------------------------------------------
// Step 2: Scrape all cards
// ---------------------------------------------------------------------------

function extractCard($, setCode = "") {
  const titleEl = $("p.card-text-title");
  const titleLink = titleEl.find("a");

  if (!titleEl.length || !titleLink.length) {
    throw new Error("Card title not found");
  }

  const href = titleLink.attr("href") || "";
  const cardNumber = href.split("/").pop();
  const name = titleLink.text().trim();
  const hpSource = titleEl.text().split(" - ").pop();
  const hp = hpSource.replace(/\D/g, "");

  const titleText = titleEl.text().trim();
  let cardType;

  if (!titleText.includes(" - ")) {
    cardType = "Trainer";
  } else {
    const parts = titleText.split(" - ");
    const extracted = parts.length >= 2 ? parts[1].trim() : "Unknown";
    cardType = extracted.includes("HP") ? "Trainer" : extracted;
  }

  const imageDiv = $("div.card-image");
  const image =
    imageDiv.length && imageDiv.find("img").length
      ? imageDiv.find("img").attr("src")
      : "";

  let rarity = "Unknown";
  const rarityTable = $("table.card-prints-versions");

  if (rarityTable.length) {
    const current = rarityTable.find("tr.current");

    if (current.length) {
      rarity = current.find("td").last().text().trim();
    }
  }

  const fullart = FULLART_RARITIES.includes(rarity) ? "Yes" : "No";
  const ex = name.split(" ").includes("ex") ? "Yes" : "No";

  let pack = "Every pack";
  const setInfo = $("div.card-prints-current");

  if (setInfo.length) {
    if (setCode === "P-A") {
      const text = setInfo.text();
      for (const keyword of PROMO_A_PACK_KEYWORDS) {
        if (text.includes(keyword)) {
          pack = keyword;
          break;
        }
      }
    } else {
      const spans = setInfo.find("span");

      if (spans.length) {
        const lastSpanText = spans.last().text().trim();
        const segments = lastSpanText.split("·");
        const lastSegment = segments[segments.length - 1].trim();

        if (lastSegment.endsWith(" pack")) {
          pack = lastSegment;
        }
      }
    }
  }

  const artistDiv = $("div.card-text-section.card-text-artist");
  const artist =
    artistDiv.length && artistDiv.find("a").length
      ? artistDiv.find("a").text().trim()
      : "Unknown";

  return {
    number: cardNumber,
    name,
    hp,
    type: cardType,
    image,
    rarity,
    fullart,
    ex,
    pack,
    artist,
  };
}

export async function scrapeCards(setCode, { onProgress } = {}) {
  const cards = [];
  let errors = 0;
  let i = 0;

  while (true) {
    i += 1;
    const url = `${BASE_URL}${setCode}/${i}`;
    try {
      const $ = await fetchPage(url);
      const card = extractCard($, setCode);
      cards.push(card);
      errors = 0;

      if (onProgress && cards.length % 10 === 0) onProgress(cards.length);

      await sleep(150);
    } catch (err) {
      errors += 1;

      if (errors >= MAX_CONSECUTIVE_ERRORS) break;
    }
  }

  return cards;
}

// ---------------------------------------------------------------------------
// Step 3: Transform scraped data
// ---------------------------------------------------------------------------

export function transformCards(rawCards, setCode, expansionName) {
  const prefix = setCodeToPrefix(setCode);
  const isPa = setCode === "P-A";
  const isPromo = setCode.startsWith("P-");

  const specificPacks = new Set(
    rawCards.filter((c) => c.pack !== "Every pack").map((c) => c.pack),
  );
  const isMultiPack = specificPacks.size > 0;

  let promoVolume = 1;
  let promoVolumeCount = 0;

  return rawCards.map((card) => {
    const cardId = `${prefix}-${card.number.padStart(3, "0")}`;

    let rarity = card.rarity;

    if (rarity === "Crown Rare") rarity = "♕";

    if (isPromo) rarity = "Promo";

    let pack = card.pack;

    if (isPa) {
      if (pack === "Promo pack") {
        promoVolumeCount += 1;

        if (promoVolumeCount > PROMO_CARDS_PER_VOLUME) {
          promoVolume += 1;
          promoVolumeCount = 1;
        }

        pack = `Promo V${promoVolume}`;
      }
    } else if (isPromo) {
      pack = expansionName;
    } else if (pack === "Every pack") {
      pack = isMultiPack ? `Shared(${expansionName})` : expansionName;
    } else if (pack.endsWith(" pack")) {
      pack = pack.slice(0, -5);
    }

    return {
      id: cardId,
      name: card.name,
      rarity,
      pack,
      health: card.hp,
      image: card.image,
      fullart: card.fullart,
      ex: card.ex,
      artist: card.artist,
      type: card.type,
    };
  });
}

// ---------------------------------------------------------------------------
// Step 4: Download card images (writes into public/images/cards)
// ---------------------------------------------------------------------------

export async function downloadImages(cards, { onProgress } = {}) {
  await fsp.mkdir(CARDS_DIR, { recursive: true });
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const card of cards) {
    const cardId = card.id;
    const sourceUrl = card.image;
    const localUrl = `/images/cards/${cardId}.webp`;
    const outputPath = path.join(CARDS_DIR, `${cardId}.webp`);

    if (fs.existsSync(outputPath)) {
      card.image = localUrl;
      skipped += 1;
      continue;
    }

    if (!sourceUrl || !sourceUrl.includes("limitlesstcg")) {
      card.image = localUrl;
      continue;
    }

    try {
      await sleep(randomUniform(100, 400));
      const response = await axios.get(sourceUrl, {
        timeout: 30000,
        responseType: "arraybuffer",
      });
      await sharp(response.data)
        .ensureAlpha()
        .webp({ quality: 82 })
        .toFile(outputPath);
      card.image = localUrl;
      downloaded += 1;

      if (onProgress && downloaded % 10 === 0) onProgress(downloaded);
    } catch (e) {
      card.image = localUrl;
      failed += 1;
    }
  }

  return { downloaded, skipped, failed };
}

// ---------------------------------------------------------------------------
// Step 5: Download pack images from serebii.net
// ---------------------------------------------------------------------------

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function serebiiSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export async function downloadPackImages(expansionName, packs) {
  await fsp.mkdir(PACKS_DIR, { recursive: true });
  const expSlug = serebiiSlug(expansionName);
  const results = [];

  for (const pack of packs) {
    const packId = pack.id;
    const outputPath = path.join(PACKS_DIR, `${packId}.webp`);

    let existing = false;
    for (const ext of ["webp", "png", "jpg", "jpeg"]) {
      if (fs.existsSync(path.join(PACKS_DIR, `${packId}.${ext}`))) {
        existing = true;
        break;
      }
    }

    if (existing) {
      results.push({ packId, status: "exists" });
      continue;
    }

    const packSlug = serebiiSlug(pack.name);
    let downloaded = false;

    for (const ext of ["jpg", "png"]) {
      const url = `${SEREBII_BASE_URL}${expSlug}/${packSlug}.${ext}`;
      try {
        const resp = await axios.get(url, {
          timeout: 15000,
          responseType: "arraybuffer",
          validateStatus: () => true,
        });

        if (resp.status === 200 && resp.data.length > 500) {
          await sharp(resp.data)
            .ensureAlpha()
            .webp({ quality: 82 })
            .toFile(outputPath);
          downloaded = true;
          break;
        }
      } catch {
        continue;
      }
    }

    results.push({ packId, status: downloaded ? "downloaded" : "failed" });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Step 5b: Download the set's own icon/logo image
// ---------------------------------------------------------------------------

export async function downloadSetImage(setCode, sourceUrl) {
  const prefix = setCodeToPrefix(setCode);
  await fsp.mkdir(SETS_DIR, { recursive: true });
  const outputPath = path.join(SETS_DIR, `${prefix}.webp`);
  const localUrl = `images/sets/${prefix}.webp`;

  if (fs.existsSync(outputPath)) {
    return { status: "exists", image: localUrl };
  }

  if (!sourceUrl) {
    return { status: "no-source", image: localUrl };
  }

  try {
    const response = await axios.get(sourceUrl, {
      timeout: 30000,
      responseType: "arraybuffer",
    });
    await sharp(response.data)
      .ensureAlpha()
      .webp({ quality: 90 })
      .toFile(outputPath);
    return { status: "downloaded", image: localUrl };
  } catch (e) {
    return { status: "failed", image: localUrl };
  }
}

// ---------------------------------------------------------------------------
// Step 6: Update data files
// ---------------------------------------------------------------------------

async function readJson(filePath, fallback) {
  try {
    const raw = await fsp.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;

    throw err;
  }
}

export async function readAllCards() {
  return readJson(V4_JSON_PATH, []);
}

export async function readAllExpansions() {
  return readJson(EXPANSIONS_JSON_PATH, []);
}

export async function updateV4(newCards) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  const existing = await readJson(V4_JSON_PATH, []);
  const existingIds = new Set(existing.map((c) => c.id));
  const toAdd = newCards.filter((c) => !existingIds.has(c.id));

  if (!toAdd.length) return { added: 0, total: existing.length };

  existing.push(...toAdd);
  await fsp.writeFile(V4_JSON_PATH, JSON.stringify(existing, null, 2), "utf-8");
  return { added: toAdd.length, total: existing.length };
}

export async function updateExpansions(
  setCode,
  expansionName,
  cards,
  setImage = null,
) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  const prefix = setCodeToPrefix(setCode);
  const expansions = await readJson(EXPANSIONS_JSON_PATH, []);

  const existingExp = expansions.find((exp) => exp.id === prefix);

  if (existingExp) {
    return { expansion: existingExp, created: false };
  }

  const uniquePacks = [
    ...new Set(
      cards.filter((c) => !c.pack.startsWith("Shared(")).map((c) => c.pack),
    ),
  ].sort();

  let packs;

  if (
    !uniquePacks.length ||
    (uniquePacks.length === 1 && uniquePacks[0] === expansionName)
  ) {
    packs = [
      {
        id: `${prefix}-booster`,
        name: "Booster",
        image: `images/packs/${prefix}-booster.webp`,
      },
    ];
  } else {
    packs = uniquePacks.map((packName) => {
      const slug = slugify(packName);
      return {
        id: `${prefix}-${slug}`,
        name: packName,
        image: `images/packs/${prefix}-${slug}.webp`,
      };
    });
  }

  const newExpansion = {
    id: prefix,
    name: expansionName,
    image: setImage || `images/sets/${prefix}.webp`,
    packs,
  };
  expansions.push(newExpansion);
  await fsp.writeFile(
    EXPANSIONS_JSON_PATH,
    JSON.stringify(expansions, null, 2),
    "utf-8",
  );

  return { expansion: newExpansion, created: true };
}

// ---------------------------------------------------------------------------
// Orchestrator — mirrors main() from the original script
// ---------------------------------------------------------------------------

export async function runAddExpansion(rawSetCode, options = {}) {
  const { name: nameOverride, skipImages = false, log = () => {} } = options;

  const setCode = normalizeSetCode(rawSetCode);
  const prefix = setCodeToPrefix(setCode);
  const isPromo = setCode.startsWith("P-");

  log(`Processing set ${setCode} (promo: ${isPromo})`);

  const expansionName = nameOverride || (await discoverExpansion(setCode));
  log(`Expansion name: ${expansionName} -> prefix '${prefix}'`);

  const rawCards = await scrapeCards(setCode, {
    onProgress: (n) => log(`...scraped ${n} cards`),
  });

  if (!rawCards.length) {
    throw new Error("No cards found. Check the set code and try again.");
  }

  log(`Scraped ${rawCards.length} cards`);

  const cards = transformCards(rawCards, setCode, expansionName);

  let imageStats = null;
  let setImageResult = null;

  if (!skipImages) {
    imageStats = await downloadImages(cards, {
      onProgress: (n) => log(`...downloaded ${n} images`),
    });

    log(`Looking up set icon for ${setCode}...`);
    const setImageUrl = await discoverSetImageUrl(setCode);

    if (setImageUrl) {
      setImageResult = await downloadSetImage(setCode, setImageUrl);
      log(`Set icon: ${setImageResult.status} -> ${setImageResult.image}`);
    } else {
      log(`Set icon not found on sets index page for ${setCode}`);
      setImageResult = {
        status: "not-found",
        image: `images/sets/${prefix}.webp`,
      };
    }
  } else {
    for (const card of cards) {
      card.image = `images/cards/${card.id}.webp`;
    }

    setImageResult = { status: "skipped", image: `images/sets/${prefix}.webp` };
  }

  const v4Result = await updateV4(cards);

  let expansionResult = null;

  if (!isPromo) {
    expansionResult = await updateExpansions(
      setCode,
      expansionName,
      cards,
      setImageResult ? setImageResult.image : null,
    );

    if (!skipImages && expansionResult.created) {
      await downloadPackImages(expansionName, expansionResult.expansion.packs);
    }
  }

  return {
    setCode,
    prefix,
    expansionName,
    isPromo,
    cardsScraped: cards.length,
    cardsAdded: v4Result.added,
    totalCardsInDb: v4Result.total,
    imageStats,
    setImage: setImageResult,
    expansion: expansionResult ? expansionResult.expansion : null,
    expansionCreated: expansionResult ? expansionResult.created : false,
  };
}
