# Contributing

## Adding a new plugin

1. Read [docs/PLUGIN-GUIDELINES.md](./docs/PLUGIN-GUIDELINES.md) for naming and required structure.
2. Create `plugins/<plugin-name>/` following that structure.
3. Add an entry to `.claude-plugin/marketplace.json`'s `plugins` array.
4. Run `claude plugin validate .` and fix any errors.
5. Test locally: `claude --plugin-dir ./plugins/<plugin-name>` and, if possible, `/plugin marketplace add .` from a separate project.
6. Open a pull request.

## Pull request checklist

- [ ] What changed, and why.
- [ ] Why this is not a breaking change (or, if it is, why a MAJOR bump is included — see [docs/RELEASES.md](./docs/RELEASES.md)).
- [ ] Any new permissions requested (hooks, MCP servers, network/filesystem access) — see [docs/SECURITY.md](./docs/SECURITY.md).
- [ ] Any new dependencies (MCP servers, external commands, npm packages) called out explicitly.
- [ ] `claude plugin validate .` passes.
- [ ] `CHANGELOG.md` updated inside the affected plugin folder.

## Review and release

Pull requests require approval from the code owner listed in `CODEOWNERS`. Merging to `main` is the release action — see [docs/RELEASES.md](./docs/RELEASES.md) for versioning and rollback.
