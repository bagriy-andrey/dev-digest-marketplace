# Releases

## Versioning

Every plugin uses SemVer (`MAJOR.MINOR.PATCH`) in `plugin.json`:

- **MAJOR** — breaking change to a skill's interface/behavior, or removal of a component.
- **MINOR** — new skill, agent, or capability, backward compatible.
- **PATCH** — bug fix, docs, or prompt tweak with no behavior contract change.

`plugin.json`'s `version` is authoritative; the marketplace entry's `version` must always mirror it — never let the two drift apart. `scripts/release.mjs` and `scripts/rollback.mjs` (below) keep them in sync automatically.

## Tags

Tag releases at the marketplace level as `v<version>` when the whole marketplace catalog changes (adding/removing plugins). Tag individual plugin releases as `<plugin-name>-v<version>` so a rollback has an exact ref to check out — `scripts/release.mjs` prints the tag command to run.

## Tooling

### `scripts/release.mjs` — bump a plugin's version

```shell
node scripts/release.mjs <plugin-name> <patch|minor|major|X.Y.Z> "<changelog message>"
```

Bumps `version` in the plugin's `plugin.json`, mirrors it into the marketplace entry, prepends a `CHANGELOG.md` entry, and runs `claude plugin validate` on the plugin. It only stages the changes (`git add`) — review with `git diff --cached`, then commit and tag yourself with the command it prints.

### `scripts/rollback.mjs` — undo a bad release

```shell
node scripts/rollback.mjs <plugin-name> <git-ref> "<reason>"
```

Checks out `plugins/<plugin-name>/` from the given ref (a `<plugin-name>-v<version>` tag, a commit, or a branch), mirrors the restored `version` back into the marketplace entry, appends a rollback entry to `CHANGELOG.md`, and re-validates. It only stages the changes — review and commit yourself.

## Update flow

1. Run `scripts/release.mjs` (see above) or bump `version` by hand in the plugin's `plugin.json` and mirror it into the marketplace entry.
2. Review the staged diff, commit, and tag `<plugin-name>-v<version>`.
3. Merge to `main` — users' `/plugin marketplace update` picks up the new version.

## Rollback

If a release breaks a plugin:

1. Run `scripts/rollback.mjs <plugin-name> <previous-tag-or-commit> "<reason>"` (see above), or do the equivalent by hand.
2. Review the staged diff — confirm the marketplace entry now resolves to the previous `version`.
3. Commit and merge to `main`.

See [SECURITY.md](./SECURITY.md) for the process when a rollback is security-motivated.
