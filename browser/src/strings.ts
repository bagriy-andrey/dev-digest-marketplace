// All UI copy lives here, not inline in components. Not a full i18n setup
// (no locale switching yet) — just a single place to read/edit every string
// the app renders, and the seam a real i18n layer would slot into later.

export const strings = {
  brand: {
    name: "Dev Digest",
    accent: "Marketplace",
  },
  nav: {
    search: "Search",
    guidelines: "Guidelines",
    github: "GitHub",
  },
  totalLabel: (all: number, plugins: number) => `${all} artifacts · ${plugins} plugins`,
  list: {
    eyebrow: "Browse without installing",
    heading: "Every plugin, skill and agent in the marketplace",
    subhead:
      "Search names, descriptions and full document bodies. Copy an install command straight from a card — Claude Code installs the whole plugin.",
    searchPlaceholder: "Search plugins, skills, agents…",
    resultLabel: (count: number, query: string) =>
      query ? `${count} results for "${query}"` : `Showing all ${count} artifacts`,
    sortLabel: (hasQuery: boolean) => (hasQuery ? "Sorted by relevance" : "Most recently updated first"),
  },
  filters: {
    all: "All",
    plugin: "Plugins",
    skill: "Skills",
    agent: "Agents",
  },
  card: {
    copy: "Copy install",
    copied: "Copied",
    inParent: "in",
  },
  empty: {
    title: (query: string) => `No artifacts match "${query}"`,
    hint: "Try a shorter term, or clear the type filter.",
    reset: "Reset search",
  },
  detail: {
    backDefault: "Back to search",
    backTo: (query: string) => `Back to "${query}"`,
    kickerPlugin: (count: number) => `Plugin · ${count} artifacts indexed`,
    kickerChild: (typeLabel: string, pluginDisplayName: string) => `${typeLabel} · in ${pluginDisplayName}`,
    install: "Install",
    copyInstall: "Copy install command",
    copiedInstall: "Copied to clipboard",
    installedAsPartOf: "Installed as part of",
    metaLabel: "Metadata",
    metaType: "Type",
    metaVersion: "Version",
    metaAuthor: "Author",
    metaLicense: "License",
    metaPlugin: "Plugin",
    metaArtifacts: "Artifacts",
    metaSource: "Source",
    siblingsContains: "Contains",
    siblingsAlongside: "Alongside this",
  },
  typeLabels: {
    plugin: "Plugin",
    skill: "Skill",
    agent: "Agent",
  },
} as const;
