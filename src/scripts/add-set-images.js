// Backfills set icon images only — does NOT scrape cards or packs.
// Adjust the import path below to wherever scraper.js actually lives
// in your project (same place add-expansion.js imports it from).

import {
  EXPANSIONS_JSON_PATH,
  discoverSetImageUrl,
  downloadSetImage,
  normalizeSetCode,
  readAllExpansions,
} from "../lib/scraper.js";

import fsp from "fs/promises";

// <-- fix this path if needed

async function backfillOne(rawSetCode) {
  const setCode = normalizeSetCode(rawSetCode);
  const prefix = setCode.startsWith("P-")
    ? `p${setCode.slice(2).toLowerCase()}`
    : setCode.toLowerCase();

  const expansions = await readAllExpansions();
  const expansion = expansions.find((e) => e.id === prefix);

  if (!expansion) {
    console.log(
      `⚠️  No expansion entry found for ${setCode} (id: ${prefix}). Skipping.`,
    );
    return;
  }

  console.log(`Looking up set icon for ${setCode}...`);
  const url = await discoverSetImageUrl(setCode);

  if (!url) {
    console.log(
      `⚠️  Could not find set icon for ${setCode} on the sets index page.`,
    );
    return;
  }

  const result = await downloadSetImage(setCode, url);
  console.log(`${setCode}: ${result.status} -> ${result.image}`);

  expansion.image = result.image;
  await fsp.writeFile(
    EXPANSIONS_JSON_PATH,
    JSON.stringify(expansions, null, 2),
    "utf-8",
  );
  console.log(`✅ Updated expansions.json entry for ${prefix}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (!args.length) {
    console.error(
      "Usage: node add-set-images.js <SETCODE> [SETCODE2 ...] | --all",
    );
    process.exit(1);
  }

  if (args[0] === "--all") {
    const expansions = await readAllExpansions();
    for (const exp of expansions) {
      // Reconstruct the real set code casing: capitalize just the first
      // letter (A/B), keep everything else lowercase — e.g. "a3b" -> "A3b"
      const reconstructed = exp.id.charAt(0).toUpperCase() + exp.id.slice(1);
      await backfillOne(reconstructed);
    }
    return;
  }

  for (const code of args) {
    await backfillOne(code);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
