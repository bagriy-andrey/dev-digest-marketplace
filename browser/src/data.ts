import type { Artifact, ArtifactType, Block, SearchableArtifact } from "./types";

// Sample data standing in for the real marketplace index. The site's build
// (scripts/build-index.mjs) will eventually emit site/index.json from the
// actual plugins/**; wiring this app to fetch that file is follow-up work,
// see Docs/SITE-SPEC.md.

function P(text: string): Block {
  return { kind: "p", text };
}
function H(text: string): Block {
  return { kind: "h", text };
}
function L(text: string): Block {
  return { kind: "li", text };
}
function C(text: string): Block {
  return { kind: "code", text };
}

interface RawArtifact {
  name: string;
  displayName: string;
  description: string;
  blocks: Block[];
}

interface RawPlugin extends RawArtifact {
  version: string;
  updated: string;
  skills: RawArtifact[];
  agents: RawArtifact[];
}

const PLUGINS: RawPlugin[] = [
  {
    name: "architecture-review",
    displayName: "Architecture Review",
    version: "0.3.1",
    updated: "2026-08-12",
    description:
      "Reviews a diff against the repo's architectural boundaries and flags layering, coupling and dependency-direction violations.",
    blocks: [
      P(
        "Architecture Review reads your dependency graph before it reads your diff, so its comments are about structure rather than style. It is meant to run as a second pass after the usual linters."
      ),
      H("What it checks"),
      L("Import direction across module boundaries declared in architecture.toml"),
      L("New cross-layer dependencies introduced by the change"),
      L("Public surface growth — newly exported symbols with no consumer"),
      H("Usage"),
      C("/plugin install architecture-review@dev-digest-marketplace\n/architecture-review --diff HEAD~1"),
      P("The plugin ships three skills and one agent; installing the plugin installs all of them."),
    ],
    skills: [
      {
        name: "boundary-map",
        displayName: "Boundary Map",
        description: "Builds a module boundary map from imports and reports the layers a change crosses.",
        blocks: [
          P(
            "Boundary Map walks the import graph and groups modules into layers using architecture.toml, then prints the crossings a diff introduces."
          ),
          H("Inputs"),
          L("architecture.toml at the repo root"),
          L("A git ref range, defaulting to the current branch against main"),
          H("Output"),
          P("A compact table of crossings, each marked allowed, discouraged or forbidden."),
        ],
      },
      {
        name: "coupling-report",
        displayName: "Coupling Report",
        description:
          "Scores afferent and efferent coupling per module and highlights the files pulling the graph together.",
        blocks: [
          P(
            "A numbers-first skill: it computes fan-in and fan-out per module and sorts by instability, so review conversation starts from the worst offenders."
          ),
          H("Reading the score"),
          L("Instability near 1.0 means the module depends on everything and nothing depends on it"),
          L("Instability near 0.0 with high fan-in means a de facto core module — changes there are expensive"),
        ],
      },
      {
        name: "adr-check",
        displayName: "ADR Check",
        description:
          "Cross-references a change against accepted architecture decision records and cites the ADR a violation contradicts.",
        blocks: [
          P("ADR Check indexes docs/adr/*.md and matches changed paths against the scope of each accepted record."),
          H("Conventions"),
          L("Records must carry status: accepted and an applies-to glob"),
          L("Superseded records are skipped, but named in the report for context"),
        ],
      },
    ],
    agents: [
      {
        name: "reviewer",
        displayName: "Architecture Reviewer",
        description: "Long-running agent that opens a review thread per boundary violation and follows up on replies.",
        blocks: [
          P(
            "The reviewer agent orchestrates the three skills, then writes one review thread per violation instead of a single wall-of-text comment."
          ),
          H("Behaviour"),
          L("Re-runs on force-push and edits its own threads rather than posting duplicates"),
          L("Resolves a thread when the violation disappears from the diff"),
        ],
      },
    ],
  },
  {
    name: "spec-driven-dev",
    displayName: "Spec Driven Dev",
    version: "1.2.0",
    updated: "2026-08-15",
    description:
      "Turns a written spec into an implementation plan, keeps the spec and the code in step, and reports drift as work lands.",
    blocks: [
      P(
        "Spec Driven Dev treats the spec file as the source of truth. It generates a task breakdown from headings, then tracks which sections are implemented, partially implemented or drifted."
      ),
      H("Workflow"),
      L("Write or paste a spec into specs/<feature>.md"),
      L("Run the planner to get a checklist keyed to spec sections"),
      L("Each PR references its section; drift is reported when code and spec disagree"),
      C("/plugin install spec-driven-dev@dev-digest-marketplace\n/spec plan specs/site.md"),
    ],
    skills: [
      {
        name: "spec-to-tasks",
        displayName: "Spec to Tasks",
        description: "Parses a markdown spec into an ordered, dependency-aware task list keyed to its section anchors.",
        blocks: [
          P("Every heading becomes a candidate task; deferred sections are recognised and excluded automatically."),
          H("Anchors"),
          P("Tasks keep the section anchor so a later drift check can map code back to the sentence that asked for it."),
        ],
      },
      {
        name: "drift-report",
        displayName: "Drift Report",
        description: "Compares merged code against the spec sections it claims to implement and lists the mismatches.",
        blocks: [
          P(
            "Drift Report is the counterweight to plan-once-and-forget: it re-reads the spec on every run and flags sections whose implementation has moved on."
          ),
          H("Categories"),
          L("Missing — the section has no implementation"),
          L("Extra — behaviour exists that the spec never described"),
          L("Changed — both exist and disagree"),
        ],
      },
      {
        name: "acceptance-writer",
        displayName: "Acceptance Writer",
        description: "Drafts acceptance criteria and test names for each spec section before implementation starts.",
        blocks: [
          P(
            "Produces given/when/then criteria plus suggested test names, so review has something concrete to argue with before code exists."
          ),
        ],
      },
    ],
    agents: [],
  },
  {
    name: "pr-digest",
    displayName: "PR Digest",
    version: "2.0.4",
    updated: "2026-08-17",
    description:
      "Summarises a pull request for reviewers: what changed, why it matters, and which files deserve a careful read.",
    blocks: [
      P(
        "PR Digest is the plugin the marketplace is named after. It reads the diff, the linked issue and the CI results, and writes a short reviewer-facing brief at the top of the PR."
      ),
      H("What lands on the PR"),
      L("A three-line summary in plain language"),
      L("A read-order list: the files that carry the change, before the noise"),
      L("Risk notes for migrations, deletions and public API changes"),
      C("/plugin install pr-digest@dev-digest-marketplace"),
    ],
    skills: [
      {
        name: "read-order",
        displayName: "Read Order",
        description: "Ranks changed files by how much of the change they carry, so reviewers start in the right place.",
        blocks: [
          P("Generated files, lockfiles and mechanical renames sink; the files holding new logic float."),
          H("Heuristics"),
          L("Weight by new logical lines rather than raw diff size"),
          L("Cluster files that only make sense read together"),
        ],
      },
      {
        name: "risk-notes",
        displayName: "Risk Notes",
        description: "Calls out migrations, deletions, config changes and public API edits that need a human decision.",
        blocks: [P("A short list, never longer than five items, of things that are hard to undo after merge.")],
      },
    ],
    agents: [
      {
        name: "digest-bot",
        displayName: "Digest Bot",
        description: "Watches open pull requests and refreshes the digest comment whenever the diff changes.",
        blocks: [P("Runs in CI, keeps exactly one comment per PR, and stays quiet when nothing material changed.")],
      },
    ],
  },
  {
    name: "test-coverage",
    displayName: "Test Coverage",
    version: "0.9.0",
    updated: "2026-07-30",
    description:
      "Finds the untested paths a change introduces and proposes the smallest set of tests that would cover them.",
    blocks: [
      P(
        "Coverage percentages are a poor review signal. This plugin reports coverage of the diff instead of the repo, then proposes tests for what the diff left bare."
      ),
      H("Notes"),
      L("Language support: TypeScript, Python, Go"),
      L("Reads existing coverage output rather than running the suite itself"),
      C("/plugin install test-coverage@dev-digest-marketplace"),
    ],
    skills: [
      {
        name: "diff-coverage",
        displayName: "Diff Coverage",
        description: "Reports coverage for only the lines a change touches, with the uncovered branches listed.",
        blocks: [P("Consumes lcov or coverage.py output and intersects it with the diff.")],
      },
      {
        name: "test-proposals",
        displayName: "Test Proposals",
        description: "Suggests the minimum set of test cases that would cover the uncovered branches in a change.",
        blocks: [
          P(
            "Proposals are written as test names and setup notes, not generated test bodies — the point is a decision, not filler code."
          ),
        ],
      },
    ],
    agents: [],
  },
];

function toArtifact(
  type: ArtifactType,
  raw: RawArtifact,
  plugin: RawPlugin
): Artifact {
  const isPlugin = type === "plugin";
  const path = isPlugin
    ? `plugins/${plugin.name}/README.md`
    : type === "skill"
      ? `plugins/${plugin.name}/skills/${raw.name}/SKILL.md`
      : `plugins/${plugin.name}/agents/${raw.name}.md`;

  return {
    id: isPlugin ? plugin.name : `${plugin.name}/${type}s/${raw.name}`,
    type,
    name: raw.name,
    displayName: raw.displayName,
    description: raw.description,
    pluginName: isPlugin ? null : plugin.name,
    pluginDisplayName: plugin.displayName,
    version: plugin.version,
    updated: plugin.updated,
    author: "dev-digest",
    license: "MIT",
    installCommand: `/plugin install ${plugin.name}@dev-digest-marketplace`,
    path,
    blocks: raw.blocks,
  };
}

function withHaystack(a: Artifact): SearchableArtifact {
  const bodyText = a.blocks
    .map((b) => b.text)
    .join(" ")
    .toLowerCase();
  return {
    ...a,
    haystack: {
      name: `${a.name} ${a.displayName}`.toLowerCase(),
      desc: a.description.toLowerCase(),
      body: bodyText,
    },
  };
}

export function buildIndex(): SearchableArtifact[] {
  const out: Artifact[] = [];
  for (const plugin of PLUGINS) {
    out.push(toArtifact("plugin", plugin, plugin));
    for (const skill of plugin.skills) out.push(toArtifact("skill", skill, plugin));
    for (const agent of plugin.agents) out.push(toArtifact("agent", agent, plugin));
  }
  return out.map(withHaystack);
}
