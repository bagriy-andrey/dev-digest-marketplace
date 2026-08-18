# Changelog

## 1.0.0 — 2026-08-18

- First real release: content ported and generalized from the source SDD workflow.

## 0.1.0

- Initial port of the `architecture-reviewer` agent, generalized from an
  internal onion-architecture reviewer into a portable, read-only
  architecture pass: repo package layout and architectural role are now
  discovered at review time (workspace manifest, top-level directories, or
  root `AGENTS.md`/`CLAUDE.md`) instead of hardcoded to fixed package names,
  and the vendored-copy drift check now applies generically to any
  hand-duplicated shared code the reviewer finds in a repo.
