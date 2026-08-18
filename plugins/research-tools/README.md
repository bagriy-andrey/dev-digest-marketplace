# Research Tools

A read-only research agent for Claude Code. Give it a topic and it investigates — the codebase, the web, or both — and reports back with citations. It never writes code, edits files, or runs commands that change state.

## Install

```
/plugin install research-tools@dev-digest-marketplace
```

## What's inside

| Agent | Description |
|---|---|
| [`researcher`](./agents/researcher.md) | Investigates the codebase (`Read`, `Grep`, `Glob`), the web (`WebSearch`, `WebFetch`), or both, and returns a structured, source-cited report. No `Write`, `Edit`, or `Bash` access. |

## When to use it

Ask for `researcher` whenever you want information gathered rather than code written — "how does library X handle Y", "where in this repo is Z implemented", "what do these three files have in common." It runs bounded, direct searches aimed at the actual question, not open-ended multi-hour research loops, and it explicitly separates "confirmed by a source" from "inferred" so you know how much to trust each finding.

If the request is ambiguous — no clear topic, unclear whether to search the project or the web, or a genuine fork in interpretation — it asks 1–3 targeted questions before searching, instead of guessing.

## Output shape

Every response follows the same structure: a short summary, a findings table per scope (`file:line` for project findings, source URL for web findings) each marked `confirmed` or `inferred`, an explicit "Not found" section (never silently omitted), and any open questions worth a human judgment call.

## Used by other plugins

`sdd-engineering`'s `spec-creator` agent dispatches `researcher` (via the Agent tool) for facts it can't verify by reading the target repo alone — this is why `sdd-engineering` declares `research-tools` as a dependency. `researcher` is equally useful standalone, outside that pipeline.

## License

MIT — see the plugin's [`plugin.json`](./.claude-plugin/plugin.json).
