import { execSync } from "child_process";

const sets = [
  "A1",
  "A1a",
  "A2",
  "A2a",
  "A2b",
  "A3",
  "A3a",
  "A3b",
  "A4",
  "A4a",
  "A4b",
  "PA",
  "B1",
  "B1a",
  "B2",
  "B2a",
  "B2b",
  "B3",
  "B3a",
  "B3b",
  "PB",
];

for (const set of sets) {
  console.log(`Scraping ${set}...`);
  try {
    execSync(`npm run scrape -- ${set}`, { stdio: "inherit" });
  } catch (err) {
    console.error(`Failed on ${set}:`, err.message);
  }
}

console.log(`Done. Scraped ${sets.length} sets.`);
