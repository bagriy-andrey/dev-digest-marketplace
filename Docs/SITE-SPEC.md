# Site Spec

Spec for the static site (built by `scripts/build-index.mjs`, deployed via `.github/workflows/pages.yml`) that lets people browse and search this marketplace's plugins, skills, and agents without installing Claude Code.

No backend is available (GitHub Pages is static hosting only). Everything below — search, filtering, copy-to-clipboard, deep links — runs client-side against a prebuilt JSON index.

## Screens

- **Search / index (`/`)** — a search box plus a grid of cards, one per artifact (plugin, skill, or agent). Typing filters the grid client-side; there is no separate "browse all" view, the empty query state just shows everything.
- **Artifact detail (`/plugins/<plugin-name>/`, `/plugins/<plugin-name>/skills/<skill-name>/`, ...)** — rendered README/SKILL.md content for that artifact, its metadata, and an install command.

## Data model

An **artifact** is anything a user can search for and install: a plugin itself, or a skill/agent that lives inside a plugin. Every artifact becomes one card and one detail page.

```jsonc
{
  "id": "architecture-review/skills/example-skill",  // stable slug, used in URLs
  "type": "plugin" | "skill" | "agent",
  "name": "example-skill",
  "displayName": "Example Skill",
  "description": "...",                // frontmatter/manifest description
  "pluginName": "architecture-review",  // null for type "plugin"
  "pluginDisplayName": "Architecture Review",
  "version": "0.1.0",                   // plugin version; skills/agents inherit their plugin's
  "author": { "name": "..." } | null,
  "license": "MIT" | null,
  "installCommand": "/plugin install architecture-review@dev-digest-marketplace",
  "body": "...",                        // full README.md / SKILL.md content, indexed but not all rendered on the card
  "path": "plugins/architecture-review/skills/example-skill/SKILL.md"
}
```

Notes:
- `installCommand` is always the **plugin's** install command — Claude Code installs whole plugins, not individual skills/agents. A skill/agent card shows this command plus a note "installed as part of `<plugin>`".
- Skills are discovered by globbing `plugins/*/skills/*/SKILL.md`; agents (once the repo has real ones) by `plugins/*/agents/*.md` or whatever convention `PLUGIN-GUIDELINES.md` settles on. If that convention isn't finalized yet, confirm it before implementing the glob.
- `body` is the full markdown so search can match content beyond the description; the index only *renders* description-length text on cards.

## `scripts/build-index.mjs` changes

Current script only emits plugin-level entries. It needs to:
1. Keep emitting one `plugin` artifact per marketplace entry (as today).
2. For each plugin, glob its `skills/*/SKILL.md` (and future agent files), parse frontmatter (`name`, `description`) with a small YAML-frontmatter parser (e.g. `gray-matter`, or hand-rolled since frontmatter here is trivial key/value), and emit one `skill`/`agent` artifact per match.
3. Write all artifacts to a single flat array in `site/index.json` (replacing the current `plugins` array) so the client only ever fetches one file.
4. Fail the build (non-zero exit) if a `SKILL.md` is missing required frontmatter (`name`, `description`) — bad data shouldn't silently ship an empty card.

CI trigger stays the same: rebuild on any push to `main` touching `plugins/**` or `.claude-plugin/marketplace.json`.

## Client-side search

- Library: a small dependency-free-ish full-text matcher (e.g. MiniSearch, ~10 KB) indexing `name`, `displayName`, `description`, and `body` fields with `description`/`name` weighted higher than `body`. Avoid anything that needs a server or build-time index beyond the JSON file itself.
- Search runs on every keystroke (debounced ~150 ms) against the in-memory index loaded from `site/index.json` on page load.
- Empty query shows all cards, most-recently-updated plugin first (fall back to alphabetical if no reliable "updated" timestamp exists).

### Filters

- Type filter (`plugin` / `skill` / `agent`) as toggle chips above the grid, combinable with the text query.
- No plugin-level or tag-level filter in this release (deferred, see below).

### Deep links

- Search state lives in the URL query string: `?q=<text>&type=<skill|agent|plugin>` (type omitted = all). Updated via `history.replaceState` as the user types, so back/forward doesn't spam history entries but the URL is always shareable/bookmarkable.
- Loading the page with `?q=`/`&type=` pre-populates the search box and filters on first render.

## Cards

Each card shows:
- Type badge (Plugin / Skill / Agent)
- `displayName`
- `description` (truncated, full text on hover/detail page)
- Parent plugin name (for skill/agent cards), linking to the plugin's detail page
- Version badge
- **Copy install command** button — copies `installCommand` to clipboard via the Clipboard API, with a brief "Copied" confirmation state (no page navigation)
- Click on the card body (not the copy button) navigates to the artifact's detail page

## Artifact detail pages

- Rendered markdown body (README.md for plugins, SKILL.md content minus frontmatter for skills/agents) via a client-side markdown renderer (e.g. `marked` + basic sanitization, or pre-render to HTML at build time in `build-index.mjs` and ship pre-rendered HTML strings in the index to avoid a runtime markdown dependency — prefer this if it doesn't bloat `index.json` significantly).
- Metadata block: version, author, license, parent plugin (for skills/agents).
- Same copy-install-command button as the card.
- "Back to search" link that preserves the search state the user came from (read from `document.referrer` query string, or a `?from=` param set when navigating from a card).

## Deferred (not in this release)

- Curated categories/collections (e.g. "for code review", "for spec-driven dev") as static filter pages.
- "Related" / "often used with" cross-links between plugins.
- Aggregated changelog / "what's new" view.
- Locally persisted (localStorage) recently-viewed/installed history.
- Multi-select "quick install" batch command generator.
- Any third-party analytics (would need a separate, explicitly-approved decision since it's an external service).

## Deployment

`site/` is entirely **generated** — nothing under it is committed (see `.gitignore`). Two things produce it:

- `scripts/build-index.mjs` writes `site/index.json`.
- `browser/` (a Vite + React app, source committed) builds into `site/browser/` via `npm run build` (`vite build`, configured with `outDir: '../site/browser'`, `emptyOutDir: true`).

Both `.github/workflows/pages.yml` (deploys to GitHub Pages) and `.github/workflows/site-build.yml` (uploads a build artifact without deploying) run these two steps in CI, triggered on pushes touching `plugins/**`, `.claude-plugin/marketplace.json`, `scripts/build-index.mjs`, or `browser/**`. Never hand-edit anything under `site/` — edit `browser/src/**` or `scripts/build-index.mjs` instead and rebuild.

## `browser/` — marketplace browser app

A Vite + React + TypeScript app implementing the search/index and detail screens above, published at `<pages-url>/browser/`. Kept in its own directory so its build output (`site/browser/`) never collides with `site/index.json`.

- **Local dev**: `cd browser && npm install && npm run dev` — Vite dev server with HMR, printed URL defaults to `http://localhost:5173/`.
- **Build**: `npm run build` inside `browser/` runs `tsc -b && vite build`, emitting straight into `site/browser/`.
- `vite.config.ts` sets `base: './'` so the built asset URLs are relative — the app works regardless of the GitHub Pages sub-path the repo ends up served under.
- Design tokens/component CSS live at `browser/src/ds/styles.css` (ported from the original design import), app-specific layout CSS at `browser/src/index.css`.
- **Data source**: `browser/src/data.ts` currently ships **hardcoded sample plugin/skill/agent data** — this is still a prototype, not wired to the real repository. Wiring the app to fetch `../index.json` (built by `scripts/build-index.mjs`) at runtime, and extending that index to cover skills/agents (not just plugins, see "Data model" above), is the next milestone before this stops being a prototype.
