# Changelog

## 1.0.0 — 2026-08-18

- First real release: content ported and generalized from the source SDD workflow.

All notable changes to the `sdd-engineering` plugin are documented in this
file.

## 0.1.0

Initial release. Ports and generalizes an internal spec-driven-development
workflow into a portable, product-agnostic plugin:

- **Agents:** `spec-creator`, `implementation-planner`, `implementer`,
  `plan-verifier` — a plan-then-execute pipeline where a feature spec becomes
  a file-by-file Implementation Plan, gets executed one non-overlapping step
  at a time (in parallel where the plan allows), and is verified against the
  real `git diff` and actual test runs rather than self-reported completion.
- **Skills:** `run-plan` (executes an approved Implementation Plan end-to-end,
  including a bounded architecture fix-loop) and `workflow-retro` (retrospects
  a completed multi-agent workflow from the current conversation's
  transcript).
- Generalized away all repo-specific assumptions: no hardcoded package names,
  package manager, or test runner; skill references point at this
  marketplace's namespaced skills (`engineering-paved-path:*`); cross-plugin
  agent references (`researcher`, `architecture-reviewer`) documented as
  provided by the `research-tools` and `architecture-review` plugin
  dependencies.
