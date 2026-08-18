import { strings } from "./strings";

export type ArtifactType = "plugin" | "skill" | "agent";

export type BlockKind = "p" | "h" | "li" | "code";

export interface Block {
  kind: BlockKind;
  text: string;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  name: string;
  displayName: string;
  description: string;
  pluginName: string | null;
  pluginDisplayName: string;
  version: string;
  updated: string;
  author: string;
  license: string;
  installCommand: string;
  path: string;
  blocks: Block[];
}

export interface SearchableArtifact extends Artifact {
  haystack: {
    name: string;
    desc: string;
    body: string;
  };
}

export const TYPE_LABELS: Record<ArtifactType, string> = strings.typeLabels;
