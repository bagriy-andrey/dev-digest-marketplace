# Plugin Guidelines

Rules every plugin in this marketplace must follow before it's added to `plugins/` and listed in `.claude-plugin/marketplace.json`.

## Naming

- Plugin folder name and `plugin.json` `name` field must match, kebab-case (e.g. `architecture-review`).
- Names must be unique across this marketplace and must not shadow a reserved marketplace name (`claude-code-*`, `anthropic-*`, `claude-plugins-*`).

## Required structure

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json        # manifest only — no skills/agents/hooks in here
├── skills/<skill-name>/SKILL.md
├── agents/                # optional
├── hooks/hooks.json        # optional
└── .mcp.json                # optional
```

Nothing except `plugin.json` may live inside `.claude-plugin/`.

## Required `plugin.json` fields

| Field | Required | Notes |
|---|---|---|
| `name` | yes | kebab-case, matches folder name |
| `description` | yes | one sentence, shown in `/plugin` UI |
| `version` | yes | SemVer, bump on every release (see [RELEASES.md](./RELEASES.md)) |
| `author.name` | yes | individual or team |
| `license` | yes | SPDX identifier |

## Before opening a pull request

1. `claude plugin validate ./plugins/<plugin-name>` passes with no errors.
2. Plugin installs and runs locally: `claude --plugin-dir ./plugins/<plugin-name>`.
3. No secrets, tokens, or absolute local paths committed anywhere in the plugin.
4. `CHANGELOG.md` entry added inside the plugin folder describing the change.
