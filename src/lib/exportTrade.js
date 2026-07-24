import { SETS } from "@/data";
import { getSetCode } from "@/lib/card";

export function exportTradeLists(lists) {
  const sections = [];
  if (Object.keys(lists.ft).length)
    sections.push(`FT:\n\n${formatGroup(lists.ft)}`);
  if (Object.keys(lists.lf).length)
    sections.push(`LF:\n\n${formatGroup(lists.lf)}`);
  return sections.join("\n\n");
}

function formatGroup(map) {
  const bySet = {};
  for (const item of Object.values(map)) {
    const code = getSetCode(item.id).toUpperCase();
    (bySet[code] ??= []).push(item.name);
  }

  return [...SETS]
    .reverse() // latest release first
    .map((s) => s.code.toUpperCase())
    .filter((code) => bySet[code]?.length)
    .map((code) => {
      const names = bySet[code]
        .sort((a, b) => a.localeCompare(b))
        .map((n) => n.toLowerCase());
      return `- [${code}] ${names.join(", ")}`;
    })
    .join("\n");
}
