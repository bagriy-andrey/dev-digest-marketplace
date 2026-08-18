import { strings } from "../strings";
import type { DetailViewModel } from "../detail";

interface ArtifactDetailProps {
  detail: DetailViewModel;
  backLabel: string;
  copied: boolean;
  onBack: () => void;
  onCopy: () => void;
  onOpen: (id: string) => void;
}

export function ArtifactDetail({ detail, backLabel, copied, onBack, onCopy, onOpen }: ArtifactDetailProps) {
  const { artifact, kicker, meta, siblings, siblingsLabel } = detail;

  return (
    <main className="detail" data-screen-label="detail">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
        className="mono detail__back"
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
          <line x1="20" y1="12" x2="4" y2="12" />
          <polyline points="10 6 4 12 10 18" />
        </svg>
        {backLabel}
      </a>

      <div className="detail__grid">
        <div>
          <div className="mono detail__kicker">{kicker}</div>
          <h1 className="detail__title">{artifact.displayName}</h1>
          <p className="detail__desc">{artifact.description}</p>

          <div className="detail__blocks">
            {artifact.blocks.map((b, i) => {
              if (b.kind === "h") return <h2 key={i} className="detail__block-h">{b.text}</h2>;
              if (b.kind === "li")
                return (
                  <div key={i} className="detail__block-li">
                    <span className="detail__block-li-marker">+</span>
                    <span>{b.text}</span>
                  </div>
                );
              if (b.kind === "code")
                return (
                  <pre key={i} className="mono detail__block-code">
                    {b.text}
                  </pre>
                );
              return (
                <p key={i} className="detail__block-p">
                  {b.text}
                </p>
              );
            })}
          </div>
        </div>

        <aside className="detail__aside">
          <div className="blueprint detail__install">
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            <div className="mono detail__install-label">{strings.detail.install}</div>
            <pre className="mono detail__install-command">{artifact.installCommand}</pre>
            <button
              className="btn btn-primary btn-block blueprint mono detail__install-btn"
              onClick={onCopy}
            >
              <i className="corner tl" />
              <i className="corner tr" />
              <i className="corner bl" />
              <i className="corner br" />
              {copied ? strings.detail.copiedInstall : strings.detail.copyInstall}
            </button>
            {artifact.pluginName && (
              <p className="detail__install-note">
                {strings.detail.installedAsPartOf}{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpen(artifact.pluginName!);
                  }}
                  className="mono"
                >
                  {artifact.pluginName}
                </a>
                .
              </p>
            )}
          </div>

          <div>
            <div className="mono detail__meta-label">{strings.detail.metaLabel}</div>
            <table className="table">
              <tbody>
                {meta.map((m) => (
                  <tr key={m.label}>
                    <th className="detail__meta-th">{m.label}</th>
                    <td className="mono detail__meta-td">{m.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {siblings.length > 0 && (
            <div>
              <div className="mono detail__meta-label">{siblingsLabel}</div>
              <div className="detail__siblings">
                {siblings.map((s) => (
                  <a
                    href="#"
                    key={s.id}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpen(s.id);
                    }}
                    className="detail__sibling"
                  >
                    <span>{s.displayName}</span>
                    <span className="mono detail__sibling-type">{s.typeLabel}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
