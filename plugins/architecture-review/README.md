# architecture-review

A read-only architecture reviewer for Claude Code: given a diff, a set of
files, or a whole package, it judges whether the change respects onion
architecture (backend/domain layering) and UI architecture (frontend
placement), and checks the integrity of the boundaries *between* packages —
without touching a single file.

## What's in this plugin

- **`architecture-reviewer` agent** — discovers a repo's actual package
  layout (workspace manifest, top-level directories, or a root
  `AGENTS.md`/`CLAUDE.md`), classifies each touched package by architectural
  role (backend/API, frontend/UI, pure-domain/core, or other), and reports
  `CRITICAL` / `WARNING` / `INFO` findings with a `BLOCKED` / `PASS`
  verdict. It also runs a cross-package boundary check every review: whether
  any hand-duplicated shared code has drifted out of sync between its
  copies, and whether any import crosses a package boundary it shouldn't
  (e.g. a pure-domain layer reaching into I/O code).

## When to use it vs. a full code review

This agent is one focused pass, not a substitute for a full pre-PR gate.

- Use it when you specifically want a layering/boundary check — before or
  after a PR, on a package you're refactoring, or as a sanity check before
  merging a change that touches multiple packages.
- Don't reach for it for general code quality, style, test coverage, or
  security review — those are out of scope by design. Run
  `engineering-paved-path:pr-self-review` for the full pre-PR gate, which
  covers architecture alongside typecheck status and other conventions.
- It doesn't do requirement-coverage / plan-traceability checking either;
  that's a separate `plan-verifier` agent's job.

The agent has no `Write`/`Edit` access. It reports findings; it never
applies fixes.

## Dependency: `engineering-paved-path`

This plugin depends on
[`engineering-paved-path`](../engineering-paved-path) (`^1.0.0`) and will
not work correctly without it. `architecture-reviewer` preloads that
plugin's `onion-architecture` and `ui-architecture` skills
(`engineering-paved-path:onion-architecture`,
`engineering-paved-path:ui-architecture`) to get the actual layering rules —
this plugin intentionally does not duplicate that guidance. It only adds
what those two skills don't cover: discovering a repo's package layout and
checking the boundaries *between* packages.

## Install

```shell
/plugin install architecture-review@dev-digest-marketplace
```

Also install `engineering-paved-path`, since `architecture-review` depends
on it:

```shell
/plugin install engineering-paved-path@dev-digest-marketplace
```
