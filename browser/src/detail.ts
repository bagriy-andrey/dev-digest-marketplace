import { strings } from "./strings";
import { TYPE_LABELS, type SearchableArtifact } from "./types";

export interface SiblingLink {
  id: string;
  displayName: string;
  typeLabel: string;
}

export interface MetaRow {
  label: string;
  value: string;
}

export interface DetailViewModel {
  artifact: SearchableArtifact;
  kicker: string;
  meta: MetaRow[];
  siblings: SiblingLink[];
  siblingsLabel: string;
}

export function buildDetail(index: SearchableArtifact[], detail: SearchableArtifact): DetailViewModel {
  const siblings = index.filter((a) =>
    a.id !== detail.id &&
    (detail.type === "plugin" ? a.pluginName === detail.name : a.pluginName === detail.pluginName || a.id === detail.pluginName)
  );

  return {
    artifact: detail,
    kicker:
      detail.type === "plugin"
        ? strings.detail.kickerPlugin(index.length)
        : strings.detail.kickerChild(TYPE_LABELS[detail.type], detail.pluginDisplayName),
    meta: [
      { label: strings.detail.metaType, value: TYPE_LABELS[detail.type] },
      { label: strings.detail.metaVersion, value: detail.version },
      { label: strings.detail.metaAuthor, value: detail.author },
      { label: strings.detail.metaLicense, value: detail.license },
      {
        label: detail.pluginName ? strings.detail.metaPlugin : strings.detail.metaArtifacts,
        value: detail.pluginName ?? String(siblings.length + 1),
      },
      { label: strings.detail.metaSource, value: detail.path },
    ],
    siblings: siblings.slice(0, 6).map((s) => ({
      id: s.id,
      displayName: s.displayName,
      typeLabel: TYPE_LABELS[s.type],
    })),
    siblingsLabel: detail.type === "plugin" ? strings.detail.siblingsContains : strings.detail.siblingsAlongside,
  };
}
