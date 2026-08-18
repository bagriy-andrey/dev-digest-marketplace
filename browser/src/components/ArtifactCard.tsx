import { strings } from "../strings";
import { TYPE_LABELS, type SearchableArtifact } from "../types";

interface ArtifactCardProps {
  artifact: SearchableArtifact;
  copied: boolean;
  onOpen: (id: string) => void;
  onCopy: (artifact: SearchableArtifact) => void;
}

export function ArtifactCard({ artifact, copied, onOpen, onCopy }: ArtifactCardProps) {
  return (
    <article
      className="card blueprint artcard"
      onClick={() => onOpen(artifact.id)}
      data-screen-label="card"
    >
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />

      <div className="artcard__top">
        <span className="tag tag-outline mono artcard__type">{TYPE_LABELS[artifact.type]}</span>
        <span className="mono artcard__version">v{artifact.version}</span>
      </div>

      <h3 className="card-title artcard__title">{artifact.displayName}</h3>
      <p className="card-body clamp3 artcard__desc" title={artifact.description}>
        {artifact.description}
      </p>

      {artifact.pluginName && (
        <div className="mono artcard__parent">
          {strings.card.inParent}{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpen(artifact.pluginName!);
            }}
          >
            {artifact.pluginDisplayName}
          </a>
        </div>
      )}

      <div className="artcard__footer">
        <button
          className="btn btn-secondary mono artcard__copy"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCopy(artifact);
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="12" height="12" />
            <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
          </svg>
          {copied ? strings.card.copied : strings.card.copy}
        </button>
        <span className="mono artcard__shortinstall">{artifact.name}</span>
      </div>
    </article>
  );
}
