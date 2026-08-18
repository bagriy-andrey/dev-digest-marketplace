#!/usr/bin/env node
// Restores a plugin's files from a given git ref (tag, commit, or branch),
// syncs its version back into .claude-plugin/marketplace.json, and records
// why in CHANGELOG.md. Does not commit — review the staged diff and commit
// yourself. See docs/RELEASES.md and docs/SECURITY.md.
//
// Usage:
//   node scripts/rollback.mjs <plugin-name> <git-ref> "<reason>"
//
// Example:
//   node scripts/rollback.mjs sdd-engineering sdd-engineering-v1.2.0 "v1.3.0 broke plan-verifier on multi-step plans"

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function usage(msg) {
  if (msg) console.error(`Error: ${msg}\n`);
  console.error('Usage: node scripts/rollback.mjs <plugin-name> <git-ref> "<reason>"');
  process.exit(1);
}

async function readJson(p) {
  return JSON.parse(await readFile(p, "utf8"));
}

async function writeJson(p, data) {
  await writeFile(p, JSON.stringify(data, null, 2) + "\n");
}

function prependChangelogEntry(existing, pluginName, entryText) {
  if (existing === null) return `# Changelog — ${pluginName}\n\n${entryText}`;
  const headerMatch = existing.match(/^# Changelog[^\n]*\n/);
  const header = headerMatch ? headerMatch[0] : `# Changelog — ${pluginName}\n`;
  const rest = (headerMatch ? existing.slice(header.length) : existing).replace(/^\n+/, "");
  return `${header}\n${entryText}${rest}`;
}

async function main() {
  const [pluginName, ref, reason] = process.argv.slice(2);
  if (!pluginName || !ref || !reason) usage();

  const pluginRelDir = path.join("plugins", pluginName);
  const pluginDir = path.join(root, pluginRelDir);
  if (!existsSync(pluginDir)) usage(`No plugin at plugins/${pluginName}`);

  try {
    execFileSync("git", ["cat-file", "-e", `${ref}:${pluginRelDir}`], { cwd: root, stdio: "ignore" });
  } catch {
    usage(`git ref "${ref}" has no plugins/${pluginName} — check the ref (tag, commit, or branch)`);
  }

  execFileSync("git", ["checkout", ref, "--", pluginRelDir], { cwd: root, stdio: "inherit" });

  const manifestPath = path.join(pluginDir, ".claude-plugin", "plugin.json");
  const manifest = await readJson(manifestPath);

  const marketplacePath = path.join(root, ".claude-plugin", "marketplace.json");
  const marketplace = await readJson(marketplacePath);
  const entry = marketplace.plugins.find((p) => p.name === pluginName);
  if (entry) {
    entry.version = manifest.version;
    await writeJson(marketplacePath, marketplace);
    execFileSync("git", ["add", marketplacePath], { cwd: root });
  }

  const changelogPath = path.join(pluginDir, "CHANGELOG.md");
  const date = new Date().toISOString().slice(0, 10);
  const entryText = `## Rollback to ${manifest.version} — ${date}\n\n- ${reason}\n\n`;
  const existing = existsSync(changelogPath) ? await readFile(changelogPath, "utf8") : null;
  await writeFile(changelogPath, prependChangelogEntry(existing, pluginName, entryText));
  execFileSync("git", ["add", changelogPath], { cwd: root });

  console.log(`plugins/${pluginName} restored to ${ref} (now v${manifest.version}).`);

  try {
    execFileSync("claude", ["plugin", "validate", pluginDir], { stdio: "inherit", cwd: root });
  } catch {
    console.error(`\nclaude plugin validate failed after rollback — investigate before committing.`);
    process.exit(1);
  }

  console.log(`\nStaged. Review with \`git diff --cached\`, then commit yourself:`);
  console.log(`  git commit -m "rollback(${pluginName}): to v${manifest.version} — ${reason}"`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
