#!/usr/bin/env node
// Reads .claude-plugin/marketplace.json + each plugin's plugin.json/README.md
// and every plugins/*/skills/*/SKILL.md and plugins/*/agents/*.md, and writes
// site/index.json (a flat array of plugin/skill/agent artifacts) for the
// marketplace site's search index. See Docs/SITE-SPEC.md.

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function readJson(relPath) {
  const full = path.join(root, relPath);
  return JSON.parse(await readFile(full, "utf8"));
}

async function readFileIfExists(relPath) {
  const full = path.join(root, relPath);
  if (!existsSync(full)) return "";
  return readFile(full, "utf8");
}

async function listDirs(relPath) {
  const full = path.join(root, relPath);
  if (!existsSync(full)) return [];
  const entries = await readdir(full, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function listFiles(relPath) {
  const full = path.join(root, relPath);
  if (!existsSync(full)) return [];
  const entries = await readdir(full, { withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => e.name);
}

// Small hand-rolled YAML frontmatter parser. Handles plain `key: value` lines
// (with optional surrounding quotes) and folded/block scalars (`key: >` or
// `key: |` followed by indented continuation lines) — the two styles used by
// SKILL.md / agent frontmatter in this repo. Not a general YAML parser.
function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: markdown };

  const [, rawFrontmatter, body] = match;
  const lines = rawFrontmatter.split(/\r?\n/);
  const data = {};
  let currentKey = null;
  let blockLines = [];

  const flushBlock = () => {
    if (currentKey) data[currentKey] = blockLines.join(" ").trim();
    currentKey = null;
    blockLines = [];
  };

  for (const line of lines) {
    const blockStart = line.match(/^([\w-]+):\s*[>|]\s*$/);
    const keyValue = line.match(/^([\w-]+):\s*(.*)$/);

    if (blockStart) {
      flushBlock();
      currentKey = blockStart[1];
      continue;
    }
    if (currentKey && /^\s+\S/.test(line)) {
      blockLines.push(line.trim());
      continue;
    }
    if (currentKey) flushBlock();

    if (keyValue) {
      const value = keyValue[2].trim().replace(/^["'](.*)["']$/, "$1");
      data[keyValue[1]] = value;
    }
  }
  flushBlock();

  return { data, body };
}

// Small hand-rolled markdown -> block converter (paragraph/heading/list-item/
// code), matching the Block shape browser/src/types.ts renders. Not a full
// markdown parser — enough fidelity for detail-page rendering.
function markdownToBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let inCode = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  for (const line of lines) {
    const fence = line.match(/^```/);
    if (fence) {
      if (inCode) {
        blocks.push({ kind: "code", text: codeLines.join("\n") });
        codeLines = [];
        inCode = false;
      } else {
        flushParagraph();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const listItem = line.match(/^\s*[-*+]\s+(.*)$/) ?? line.match(/^\s*\d+\.\s+(.*)$/);

    if (!line.trim()) {
      flushParagraph();
    } else if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      flushParagraph();
    } else if (heading) {
      flushParagraph();
      blocks.push({ kind: "h", text: heading[1].trim() });
    } else if (listItem) {
      flushParagraph();
      blocks.push({ kind: "li", text: listItem[1].trim() });
    } else {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();

  return blocks;
}

function toArtifact({ type, id, name, displayName, description, pluginName, pluginDisplayName, version, author, license, path: filePath, blocks }) {
  return {
    id,
    type,
    name,
    displayName,
    description,
    pluginName,
    pluginDisplayName,
    version,
    updated: "",
    author,
    license,
    installCommand: `/plugin install ${pluginName ?? name}@dev-digest-marketplace`,
    path: filePath,
    blocks,
  };
}

async function buildSkillOrAgentArtifacts({ type, plugin, manifest }) {
  const artifacts = [];

  if (type === "skill") {
    const skillDirs = await listDirs(path.join(plugin.pluginDir, "skills"));
    for (const skillName of skillDirs) {
      const relPath = path.join(plugin.pluginDir, "skills", skillName, "SKILL.md");
      const raw = await readFileIfExists(relPath);
      if (!raw) continue;
      const { data, body } = parseFrontmatter(raw);
      if (!data.name || !data.description) {
        throw new Error(`${relPath} is missing required frontmatter (name, description)`);
      }
      artifacts.push(
        toArtifact({
          type: "skill",
          id: `${plugin.name}/skills/${data.name}`,
          name: data.name,
          displayName: data.name,
          description: data.description,
          pluginName: plugin.name,
          pluginDisplayName: plugin.displayName,
          version: plugin.version,
          author: manifest.author?.name ?? "",
          license: manifest.license ?? null,
          path: relPath,
          blocks: markdownToBlocks(body),
        })
      );
    }
  }

  if (type === "agent") {
    const agentFiles = (await listFiles(path.join(plugin.pluginDir, "agents"))).filter((f) => f.endsWith(".md"));
    for (const fileName of agentFiles) {
      const relPath = path.join(plugin.pluginDir, "agents", fileName);
      const raw = await readFileIfExists(relPath);
      if (!raw) continue;
      const { data, body } = parseFrontmatter(raw);
      if (!data.name || !data.description) {
        throw new Error(`${relPath} is missing required frontmatter (name, description)`);
      }
      artifacts.push(
        toArtifact({
          type: "agent",
          id: `${plugin.name}/agents/${data.name}`,
          name: data.name,
          displayName: data.name,
          description: data.description,
          pluginName: plugin.name,
          pluginDisplayName: plugin.displayName,
          version: plugin.version,
          author: manifest.author?.name ?? "",
          license: manifest.license ?? null,
          path: relPath,
          blocks: markdownToBlocks(body),
        })
      );
    }
  }

  return artifacts;
}

async function main() {
  const marketplace = await readJson(".claude-plugin/marketplace.json");
  const artifacts = [];

  for (const entry of marketplace.plugins) {
    const pluginDir = typeof entry.source === "string" ? entry.source.replace(/^\.\//, "") : entry.name;
    const manifestPath = path.join(pluginDir, ".claude-plugin", "plugin.json");
    let manifest = {};
    if (existsSync(path.join(root, manifestPath))) {
      manifest = await readJson(manifestPath);
    }
    const readme = await readFileIfExists(path.join(pluginDir, "README.md"));

    const plugin = {
      name: entry.name,
      pluginDir,
      displayName: entry.displayName ?? manifest.displayName ?? entry.name,
      version: entry.version ?? manifest.version ?? null,
    };

    artifacts.push(
      toArtifact({
        type: "plugin",
        id: plugin.name,
        name: plugin.name,
        displayName: plugin.displayName,
        description: entry.description ?? manifest.description ?? "",
        pluginName: null,
        pluginDisplayName: plugin.displayName,
        version: plugin.version,
        author: manifest.author?.name ?? "",
        license: manifest.license ?? null,
        path: path.join(pluginDir, "README.md"),
        blocks: markdownToBlocks(readme),
      })
    );

    artifacts.push(...(await buildSkillOrAgentArtifacts({ type: "skill", plugin, manifest })));
    artifacts.push(...(await buildSkillOrAgentArtifacts({ type: "agent", plugin, manifest })));
  }

  const index = {
    marketplace: marketplace.name,
    generatedAt: new Date().toISOString(),
    artifacts,
  };

  const outDir = path.join(root, "site");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "index.json"), JSON.stringify(index, null, 2));
  console.log(`Wrote site/index.json with ${artifacts.length} artifact(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
