import { SETS } from "@/data";
import { getSetCode } from "@/lib/card";

export function exportTradeLists(lists) {
  const sections = [];
  if (Object.keys(lists.lf).length)
    sections.push(`LF:\n\n${formatGroup(lists.lf)}`);
  if (Object.keys(lists.ft).length)
    sections.push(`FT:\n\n${formatGroup(lists.ft)}`);
  return sections.join("\n\n");
}

function formatGroup(map) {
  const bySet = {};
  for (const item of Object.values(map)) {
    const code = getSetCode(item.id).toLowerCase();
    (bySet[code] ??= []).push(item.name);
  }

  return [...SETS]
    .reverse() // latest release first
    .filter((s) => bySet[s.code.toLowerCase()]?.length)
    .map((s) => {
      const names = bySet[s.code.toLowerCase()]
        .sort((a, b) => a.localeCompare(b))
        .map((n) => n.toLowerCase());
      return `- [${s.abbreviation}] ${names.join(", ")}`;
    })
    .join("\n");
}
