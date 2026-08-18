# Security

## Permissions

Plugins that declare hooks or MCP servers can execute commands on a user's machine. Any plugin requesting new permissions (new hook matchers, new MCP server commands, filesystem or network access) must call that out explicitly in its pull request description.

## Secrets policy

- No credentials, tokens, or API keys committed to this repository, in plugin code, `plugin.json`, or `.mcp.json`.
- Plugins that need a secret at runtime must read it from an environment variable or the plugin's `userConfig` with `sensitive: true` — never hardcode it.
- If a secret is committed accidentally, rotate it immediately and open an issue; do not rely on `git revert` alone (history still contains it).

## Responding to an unsafe release

1. Pin affected users away from the bad version: bump `renames` or remove the plugin entry from `marketplace.json` and publish immediately.
2. Open an incident note in `docs/RELEASES.md` under the affected plugin's history.
3. Root-cause the issue in a follow-up pull request before re-adding the plugin.

## Reporting

Report suspected security issues privately to the marketplace owner (see `CODEOWNERS`) rather than in a public issue.
