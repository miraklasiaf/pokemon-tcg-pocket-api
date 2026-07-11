#!/usr/bin/env node
/**
 * Local CLI for scraping a new Pokemon TCG Pocket expansion.
 *
 * This is the only way to trigger a scrape — there is no API route for it.
 * Workflow: run this locally, review the diff in data/v4.json,
 * data/expansions.json, and public/images/, then commit + push to GitHub.
 * The deployed app only ever serves the committed JSON via
 * GET /api/cards and GET /api/expansions.
 *
 * Usage:
 *   npm run scrape -- B2b
 *   npm run scrape -- B1 --name "Mega Rising"
 *   npm run scrape -- PA                 # update Promo-A with new cards
 *   npm run scrape -- PB --skip-images
 */

import { runAddExpansion } from "../lib/scraper.js";

function parseArgs(argv) {
  const args = { setCode: null, name: null, skipImages: false };
  const rest = argv.slice(2);

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--name") {
      args.name = rest[i + 1];
      i += 1;
    } else if (arg === "--skip-images") {
      args.skipImages = true;
    } else if (!arg.startsWith("--") && args.setCode === null) {
      args.setCode = arg;
    }
  }

  if (!args.setCode) {
    console.error(
      "Usage: npm run scrape -- <set_code> [--name NAME] [--skip-images]",
    );
    process.exit(1);
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Scraping set: ${args.setCode}`);
  console.log("=".repeat(60));

  const result = await runAddExpansion(args.setCode, {
    name: args.name,
    skipImages: args.skipImages,
    log: (msg) => console.log(`    ${msg}`),
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Done! ${result.expansionName} (${result.setCode})`);
  console.log(
    `  ${result.cardsScraped} cards scraped, ${result.cardsAdded} new cards added ` +
      `(${result.totalCardsInDb} total in db)`,
  );
  if (result.imageStats) {
    console.log(
      `  Images: ${result.imageStats.downloaded} downloaded, ` +
        `${result.imageStats.skipped} skipped, ${result.imageStats.failed} failed`,
    );
  }
  if (!result.isPromo) {
    console.log(
      `  Expansion entry: ${result.expansionCreated ? "created" : "already existed"}`,
    );
  }
  console.log("=".repeat(60));
  console.log(
    "\nNext steps: review the changes in data/ and public/images/, then:\n" +
      "  git add -A && git commit -m " +
      `"Add ${result.expansionName} (${result.setCode})" && git push\n`,
  );
}

main().catch((err) => {
  console.error("\nScrape failed:", err.message || err);
  process.exit(1);
});
