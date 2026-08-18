# sdd-engineering

A spec-driven development pipeline for Claude Code: define requirements as a
testable spec, turn the spec into a file-by-file build plan, execute the plan
(in parallel where safe), verify what actually landed against what the plan
promised, and retro the workflow itself once it's done.

## What's in this plugin

**Agents** (`agents/`) — a plan-then-execute chain. Each agent's deliverable
is the next agent's input, so keep the document shapes intact if you fork
this plugin:

| Agent | Deliverable |
|---|---|
| `spec-creator` | A `SPEC-NN-<slug>.md` feature spec — Problem/Goals/EARS acceptance criteria/Edge cases/Workflow & Contracts. Never writes code or a build plan. |
| `implementation-planner` | An Implementation Plan — file-by-file breakdown, dependency-ordered execution steps with disjoint file lists, Definition of Done. Never redefines requirements. |
| `implementer` | Executes exactly one plan step, in an isolated git worktree. Meant to be launched multiple times in parallel, one instance per non-overlapping step. |
| `plan-verifier` | Read-only. Cross-checks the plan's steps, test criteria, and Definition-of-Done items against the real `git diff` and by actually running the plan's declared test commands — not against self-reported completion. |

**Skills** (`skills/`):

| Skill | Use |
|---|---|
| `run-plan` | Runs an already-approved Implementation Plan end-to-end: dispatches `implementer`(s) per dependency tier, merges branches, runs `plan-verifier` + `architecture-reviewer`, and drives a bounded architecture fix-loop. Invoke with `/run-plan <plan-file-path>`. |
| `workflow-retro` | Retrospective over a just-completed multi-agent workflow in the current conversation — agent roster, token/tool-call/duration stats, clarification friction, duplicated work, gaps, and concrete recommendations. Invoke with `/workflow-retro`. |

## Recommended pipeline order

```
1. spec-creator            → SPEC-NN-*.md (user reviews/approves)
2. implementation-planner  → Implementation Plan (asks multi-agent vs single-agent)
3. implementer(s)          → new chat, parallel per non-overlapping step
                              (or run all of 3–5 via the run-plan skill)
4. plan-verifier (pass 1)  → right after implementer(s), in parallel with
                              architecture-reviewer (from architecture-review)
5. plan-verifier (pass 2)  → final confirmation, after any fixes land
6. workflow-retro          → run manually once the workflow above is done
```

`run-plan` automates steps 3–5 for you, including a bounded fix-loop against
`architecture-reviewer` findings. `spec-creator` and `implementation-planner`
are deliberately left as separate, manual, user-reviewed steps — a plan
should get a human look before anything executes against it.

## Dependencies

This plugin doesn't ship every skill and agent its own agents reference — it
depends on three sibling plugins in this marketplace for those:

| Dependency | Provides | Why this plugin needs it |
|---|---|---|
| `engineering-paved-path` | Skills like `onion-architecture`, `ui-architecture`, `security`, `react-best-practices`, `mermaid-diagram`, `pr-self-review`, etc. | `implementation-planner` and `implementer` route to these by file pattern so plan/build output follows the team's own conventions instead of reinventing them per feature. |
| `research-tools` | The `researcher` agent — read-only, cited research over the repo and the web. | `spec-creator` dispatches it for facts it can't verify by reading this repo (external API behavior, a standard, a third-party library's actual semantics). |
| `architecture-review` | The `architecture-reviewer` agent — layering, module placement, and cross-package boundary checks. | `plan-verifier` explicitly defers architecture/quality judgment to it rather than scope-creeping into that territory; `run-plan` dispatches it as part of verification. |

**Claude Code does not currently auto-install a plugin's declared
`dependencies`.** After installing `sdd-engineering`, also install all three
dependencies yourself, or the agents above will fail to find the skills/agents
they reference.

## Install

```
/plugin install sdd-engineering@dev-digest-marketplace
/plugin install engineering-paved-path@dev-digest-marketplace
/plugin install research-tools@dev-digest-marketplace
/plugin install architecture-review@dev-digest-marketplace
```

## Adapting to your repo

Nothing here hardcodes a particular package layout, package manager, or test
runner. The agents and skills are written to discover your repo's actual
structure on first use (via `package.json` workspaces, a root
`AGENTS.md`/`CLAUDE.md`, or top-level directories) and to use generic
phrasing ("this package's typecheck command") rather than assuming a fixed
toolchain. The skill-routing tables in `implementation-planner.md` and
`implementer.md` use illustrative glob patterns ("frontend pages/layouts",
"backend db layer") — adjust them to your repo's real paths the first time
you use this plugin.
