# Dev Digest Marketplace

Claude Code plugin marketplace for the Dev Digest engineering workflow. Kept as a separate repository from the DevDigest product so plugin releases and product releases don't share a version or a release cadence.

## Quick start

Add the marketplace:

```shell
/plugin marketplace add andriibahrii/dev-digest-marketplace
```

Install a plugin:

```shell
/plugin install engineering-paved-path@dev-digest-marketplace
```

## Plugins

| Plugin | Description |
|---|---|
| [`engineering-paved-path`](./plugins/engineering-paved-path) | Opinionated engineering workflow skills for the team's paved path. |
| [`research-tools`](./plugins/research-tools) | Skills for researching and summarizing external sources. |
| [`architecture-review`](./plugins/architecture-review) | Skills and agents for reviewing architecture and design docs. |
| [`sdd-engineering`](./plugins/sdd-engineering) | Spec-driven development workflow skills. |

## Repository layout

```
.claude-plugin/marketplace.json   # marketplace catalog
plugins/                          # one folder per plugin
docs/                             # guidelines, site spec, security, releases
scripts/build-index.mjs           # builds the site's search index
site/                             # static site build output (GitHub Pages)
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) to add or change a plugin.

## Docs

- [docs/PLUGIN-GUIDELINES.md](./docs/PLUGIN-GUIDELINES.md) — naming, required structure, manifest fields.
- [docs/SITE-SPEC.md](./docs/SITE-SPEC.md) — the browsable site's screens and search index.
- [docs/SECURITY.md](./docs/SECURITY.md) — permissions, secrets policy, unsafe-release response.
- [docs/RELEASES.md](./docs/RELEASES.md) — SemVer, tags, update and rollback.
