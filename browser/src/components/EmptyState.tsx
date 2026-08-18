import { strings } from "../strings";

interface EmptyStateProps {
  query: string;
  onReset: () => void;
}

export function EmptyState({ query, onReset }: EmptyStateProps) {
  return (
    <div className="blueprint empty-state">
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      <h3 className="empty-state__title">{strings.empty.title(query)}</h3>
      <p className="empty-state__hint">{strings.empty.hint}</p>
      <button className="btn btn-secondary" onClick={onReset}>
        {strings.empty.reset}
      </button>
    </div>
  );
}
