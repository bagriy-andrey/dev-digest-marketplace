# Engineering Paved Path

A library of technical skills — no agents. Each skill is reference/procedural knowledge that Claude Code loads into whichever agent is already running, activated by pattern-matching the skill's `description` against what you're doing (writing a Fastify route, defining a Drizzle schema, reviewing a diff before a PR, ...). Install this plugin once and every skill becomes available to any agent, including agents from other plugins.

## Install

```
/plugin install engineering-paved-path@dev-digest-marketplace
```

This plugin has no dependencies of its own — everything else in this marketplace depends on it.

## What's inside

| Skill | Scope |
|---|---|
| [`onion-architecture`](./skills/onion-architecture/SKILL.md) | Onion Architecture (Ports & Adapters) for a backend service's modules — layering, dependency rule, repository/adapter placement, composition root. |
| [`ui-architecture`](./skills/ui-architecture/SKILL.md) | React/Next.js frontend code organization — folder structure, feature modules, component splitting, where business logic lives. Covers both feature-based and Feature-Sliced Design. |
| [`fastify-best-practices`](./skills/fastify-best-practices/SKILL.md) | Building and debugging Fastify servers — routes, plugins, schema validation, hooks, error handling, auth, CORS, WebSockets, deployment. |
| [`drizzle-orm-patterns`](./skills/drizzle-orm-patterns/SKILL.md) | Drizzle ORM — schema definition, type-safe queries, relations, transactions, migrations. PostgreSQL/MySQL/SQLite/MSSQL/CockroachDB. |
| [`postgresql-table-design`](./skills/postgresql-table-design/SKILL.md) | PostgreSQL schema design — data types, indexing, constraints, performance patterns. |
| [`next-best-practices`](./skills/next-best-practices/SKILL.md) | Next.js file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling. |
| [`react-best-practices`](./skills/react-best-practices/SKILL.md) | Modern React patterns and anti-patterns — component design, state, hooks misuse, performance, data fetching. |
| [`react-testing-library`](./skills/react-testing-library/SKILL.md) | React Testing Library + Vitest — setup, query priority, `userEvent`, async patterns, mocking, anti-patterns. |
| [`typescript-expert`](./skills/typescript-expert/SKILL.md) | Type-level programming, performance, monorepo management, migration strategies, tooling. |
| [`zod`](./skills/zod/SKILL.md) | Zod schema validation — `z.object`/`z.string` patterns, `safeParse`, `z.infer`, composition. |
| [`security`](./skills/security/SKILL.md) | OWASP Top 10:2025 — vulnerability review, auth/authorization, input handling, file uploads, secrets. |
| [`mermaid-diagram`](./skills/mermaid-diagram/SKILL.md) | Mermaid diagrams in Markdown — flowcharts, sequence/class/ER/state diagrams. |
| [`pr-self-review`](./skills/pr-self-review/SKILL.md) | Pre-PR gate — routes a `git diff`'s changed files through the relevant architecture/quality skills above by file type, blocks on CRITICAL findings. Run manually (`/pr-self-review`) before opening a PR. |

## How other plugins use this one

Skills here are referenced by name from agents in other plugins using this marketplace's namespace convention — `engineering-paved-path:<skill-name>` (e.g. `engineering-paved-path:security`). `sdd-engineering`'s `implementation-planner` and `implementer` route to these by file pattern so plan/build output follows the same conventions this plugin teaches, instead of reinventing them per feature; `architecture-review`'s `architecture-reviewer` consumes `onion-architecture` and `ui-architecture` directly rather than duplicating that guidance.

## Adapting to your repo

None of these skills assume a specific package layout or package manager — `onion-architecture` and `ui-architecture` in particular teach the underlying pattern with placeholder paths (`<backend-package>/src/modules/<name>/`, etc.) rather than a fixed folder name. Swap the illustrative paths for your repo's actual layout the first time you use them.

## License

MIT — see the plugin's [`plugin.json`](./.claude-plugin/plugin.json).
