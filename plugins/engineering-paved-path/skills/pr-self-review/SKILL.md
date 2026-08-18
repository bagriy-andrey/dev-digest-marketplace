---
name: pr-self-review
description: "Pre-PR gate: analyses git diff, routes changed files through architecture and quality skills by file type, blocks on CRITICAL findings. Run manually with /pr-self-review or auto-triggered before GitHub PR creation."
allowed-tools: Read, Bash, Glob
user-invocable: true
---

# PR Self-Review

Local gate that runs before opening a PR. Inspects `git diff main...HEAD`, routes each changed file to the relevant skills, then returns **BLOCKED** or **PASS**.

This skill is also invoked automatically by a `PreToolUse` hook before `mcp__github__create_pull_request`. If the result is BLOCKED, do NOT proceed with PR creation — report findings and stop.

---

## Step 1 — Collect the diff

```bash
git diff main...HEAD --name-only   # changed files
git diff main...HEAD               # full diff for content analysis
```

If the current branch IS `main`, fall back to `git diff HEAD`.

---

## Step 2 — Classify files into buckets

Each changed file belongs to one or more buckets, based on its **architectural role**, not a fixed
list of package names. Before classifying, check this repo's actual package layout (`package.json`
workspaces, or top-level directories) to find the real names of its frontend, backend, and any
pure-domain/core packages — substitute those real names for the placeholders below.

| Bucket | Architectural role | Typical path patterns (adapt to this repo's layout) |
|--------|--------------------|-------------------------------------------------------|
| `ui-pages` | Frontend/UI — routed pages/layouts | `<frontend-pkg>/src/app/**/*.tsx` (e.g. Next.js App Router pages/layouts) |
| `ui-components` | Frontend/UI — components (not already in ui-pages) | `<frontend-pkg>/**/*.tsx`, `<frontend-pkg>/**/*.jsx` |
| `ui-tests` | Frontend/UI — tests | `<frontend-pkg>/**/*.test.*`, `<frontend-pkg>/**/*.spec.*` |
| `ui-other` | Frontend/UI — other TypeScript | `<frontend-pkg>/**/*.ts` (not test) |
| `backend-routes` | Backend/API — route/handler definitions | `<backend-pkg>/src/**/*route*.ts`, `<backend-pkg>/src/**/*plugin*.ts` |
| `backend-db` | Backend/API — data access layer | `<backend-pkg>/src/db/**/*.ts` |
| `backend-other` | Backend/API — other backend logic | `<backend-pkg>/src/**/*.ts` (not db, not routes) |
| `core-domain` | Pure-domain/core logic (if this repo has one) | `<core-pkg>/**/*.ts` |
| `zod-schemas` | Any role — schema validation | any file whose diff contains `z.object(` or `z.string(` |
| `all` | Every role | every changed file (security cross-cut, always runs) |

If this repo has no separate pure-domain/core package, skip `core-domain` and treat that logic as
part of whichever package contains it (usually backend).

---

## Step 3 — Baseline checks (run before skills)

For each package in this repo's actual layout that contains at least one changed file:

```bash
cd <package-dir> && pnpm typecheck 2>&1
```

- Each TypeScript error → `CRITICAL` finding (category: `typecheck`, file + line from error output)
- A failing typecheck does **not** stop the remaining steps — continue and collect all findings

---

## Step 4 — Route skills by bucket

Apply each skill **only if its bucket has ≥ 1 file**. Analyse the diff content, not the whole file (read surrounding context only when needed to judge a finding).

These skills live in this same plugin (`engineering-paved-path`), so they're referenced by name only, no namespace needed.

| Bucket | Skills |
|--------|--------|
| `ui-pages` | `ui-architecture`, `react-best-practices`, `next-best-practices` |
| `ui-components` | `ui-architecture`, `react-best-practices` |
| `ui-tests` | `react-testing-library` |
| `ui-other` | `ui-architecture` |
| `backend-routes` | `fastify-best-practices`, `onion-architecture`, `security` |
| `backend-db` | `drizzle-orm-patterns`, `postgresql-table-design` |
| `backend-other` | `onion-architecture`, `typescript-expert` |
| `core-domain` | `onion-architecture`, `typescript-expert` |
| `zod-schemas` | `zod` |
| `all` | `security` (scan every file for secret patterns and injection sinks) |

---

## Step 5 — Severity classification

Every finding must have one of three severities:

| Severity | Criteria | Effect on PR |
|----------|----------|--------------|
| `CRITICAL` | Exploitable security issue; architecture constraint violated (dependency inversion, DB imported directly in route); typecheck error | **Blocks PR** |
| `WARNING` | Best-practice deviation, non-idiomatic pattern, missing test coverage for changed logic | Shown, does not block |
| `INFO` | Optional improvement, stylistic note | Shown, does not block |

**Confidence rule** (inherited from `security` skill): only report what you can confirm with HIGH confidence. Trace the data flow before flagging. Do not promote a theoretical issue to CRITICAL.

---

## Step 6 — Render the report

### When BLOCKED

```
## PR Self-Review — <branch> → main

### ❌ BLOCKED — <N> critical issue(s) must be fixed before opening the PR

#### [CRITICAL] <category> — <file>:<line>
What: <one sentence describing the violation>
Fix:  <specific, actionable instruction>

---
### ⚠️ Warnings (<N>)

#### [WARNING] <category> — <file>:<line>
What: <one sentence>
Suggestion: <specific action>

---
### Summary

| Package       | Files reviewed | Critical | Warning | Info |
|---------------|----------------|----------|---------|------|
| <frontend-pkg> | 2              | 0        | 1       | 0    |
| <backend-pkg>  | 3              | 2        | 0       | 1    |

**Decision: ❌ BLOCKED** — do not open the PR until all CRITICAL issues above are resolved.
Re-run `/pr-self-review` after fixing.
```

### When PASS

```
## PR Self-Review — <branch> → main

### ✅ PASS — safe to open the PR

[If warnings exist, render the ⚠️ Warnings section. Otherwise omit.]

| Package       | Files reviewed | Critical | Warning | Info |
|---------------|----------------|----------|---------|------|
| <frontend-pkg> | 2              | 0        | 0       | 1    |

**Decision: ✅ PASS**
```

---

## Step 7 — Gate enforcement

- **BLOCKED**: stop here. Do NOT create the PR. Tell the user to fix the listed CRITICALs and re-run the skill.
- **PASS / PASS with warnings**: the skill is done. If invoked from the PreToolUse hook, allow the PR creation to proceed.
