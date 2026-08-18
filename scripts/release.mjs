#!/usr/bin/env node
// Bumps a plugin's version, keeps .claude-plugin/marketplace.json in sync,
// prepends a CHANGELOG.md entry, and validates the result. Does not commit
// or tag — review the staged diff and commit yourself. See docs/RELEASES.md.
//
// Usage:
//   node scripts/release.mjs <plugin-name> <patch|minor|major|X.Y.Z> "<changelog message>"

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function usage(msg) {
  if (msg) console.error(`Error: ${msg}\n`);
  console.error('Usage: node scripts/release.mjs <plugin-name> <patch|minor|major|X.Y.Z> "<changelog message>"');
  process.exit(1);
}

function bumpVersion(current, bump) {
  const m = current.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Current version "${current}" is not valid SemVer (X.Y.Z)`);
  const [, majorStr, minorStr, patchStr] = m;
  const major = Number(majorStr), minor = Number(minorStr), patch = Number(patchStr);
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump;
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  if (bump === "patch") return `${major}.${minor}.${patch + 1}`;
  throw new Error(`Unknown bump type "${bump}" — use patch, minor, major, or an explicit X.Y.Z`);
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
  const [pluginName, bump, message] = process.argv.slice(2);
  if (!pluginName || !bump || !message) usage();

  const pluginDir = path.join(root, "plugins", pluginName);
  const manifestPath = path.join(pluginDir, ".claude-plugin", "plugin.json");
  if (!existsSync(manifestPath)) usage(`No plugin at plugins/${pluginName}/.claude-plugin/plugin.json`);

  const marketplacePath = path.join(root, ".claude-plugin", "marketplace.json");
  const marketplace = await readJson(marketplacePath);
  const entry = marketplace.plugins.find((p) => p.name === pluginName);
  if (!entry) usage(`No marketplace entry for plugin "${pluginName}" in .claude-plugin/marketplace.json`);

  const manifest = await readJson(manifestPath);
  const currentVersion = manifest.version;
  const nextVersion = bumpVersion(currentVersion, bump);

  manifest.version = nextVersion;
  entry.version = nextVersion;
  await writeJson(manifestPath, manifest);
  await writeJson(marketplacePath, marketplace);

  const changelogPath = path.join(pluginDir, "CHANGELOG.md");
  const date = new Date().toISOString().slice(0, 10);
  const entryText = `## ${nextVersion} — ${date}\n\n- ${message}\n\n`;
  const existing = existsSync(changelogPath) ? await readFile(changelogPath, "utf8") : null;
  await writeFile(changelogPath, prependChangelogEntry(existing, pluginName, entryText));

  console.log(`plugins/${pluginName}: ${currentVersion} -> ${nextVersion}`);

  try {
    execFileSync("claude", ["plugin", "validate", pluginDir], { stdio: "inherit", cwd: root });
  } catch {
    console.error(`\nclaude plugin validate failed for ${pluginName} — fix before committing.`);
    process.exit(1);
  }

  execFileSync("git", ["add", manifestPath, marketplacePath, changelogPath], { cwd: root });
  console.log(`\nStaged. Review with \`git diff --cached\`, then commit and tag yourself:`);
  console.log(`  git commit -m "release(${pluginName}): v${nextVersion} — ${message}"`);
  console.log(`  git tag ${pluginName}-v${nextVersion}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
