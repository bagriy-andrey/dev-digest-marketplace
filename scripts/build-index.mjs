#!/usr/bin/env node
// Reads .claude-plugin/marketplace.json + each plugin's plugin.json/README.md
// and writes site/index.json for the marketplace site's search index.
// See docs/SITE-SPEC.md.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function readJson(relPath) {
  const full = path.join(root, relPath);
  return JSON.parse(await readFile(full, "utf8"));
}

async function readReadme(pluginDir) {
  const readmePath = path.join(root, pluginDir, "README.md");
  if (!existsSync(readmePath)) return "";
  return readFile(readmePath, "utf8");
}

async function main() {
  const marketplace = await readJson(".claude-plugin/marketplace.json");

  const entries = await Promise.all(
    marketplace.plugins.map(async (entry) => {
      const pluginDir = typeof entry.source === "string" ? entry.source : entry.name;
      const manifestPath = path.join(pluginDir, ".claude-plugin", "plugin.json");
      let manifest = {};
      if (existsSync(path.join(root, manifestPath))) {
        manifest = await readJson(manifestPath);
      }
      const readme = await readReadme(pluginDir);

      return {
        name: entry.name,
        displayName: entry.displayName ?? manifest.displayName ?? entry.name,
        description: entry.description ?? manifest.description ?? "",
        version: entry.version ?? manifest.version ?? null,
        author: manifest.author ?? null,
        license: manifest.license ?? null,
        readme,
      };
    })
  );

  const index = {
    marketplace: marketplace.name,
    generatedAt: new Date().toISOString(),
    plugins: entries,
  };

  const outDir = path.join(root, "site");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "index.json"), JSON.stringify(index, null, 2));
  console.log(`Wrote site/index.json with ${entries.length} plugin(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
