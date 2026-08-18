import type { ArtifactType, SearchableArtifact } from "./types";

function score(a: SearchableArtifact, tokens: string[]): number {
  let total = 0;
  for (const t of tokens) {
    let s = 0;
    if (a.haystack.name.includes(t)) s += 6;
    if (a.haystack.desc.includes(t)) s += 3;
    if (a.haystack.body.includes(t)) s += 1;
    if (s === 0) return 0;
    total += s;
  }
  return total;
}

export function search(
  index: SearchableArtifact[],
  query: string,
  type: ArtifactType | "all"
): SearchableArtifact[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const pool = type === "all" ? index : index.filter((a) => a.type === type);

  if (!tokens.length) {
    return [...pool].sort(
      (x, y) => (y.updated || "").localeCompare(x.updated || "") || x.displayName.localeCompare(y.displayName)
    );
  }

  return pool
    .map((a) => ({ a, s: score(a, tokens) }))
    .filter((r) => r.s > 0)
    .sort((x, y) => y.s - x.s || x.a.displayName.localeCompare(y.a.displayName))
    .map((r) => r.a);
}
