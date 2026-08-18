import { strings } from "../strings";
import type { ArtifactType } from "../types";

interface TypeFilterOption {
  label: string;
  value: ArtifactType | "all";
  count: number;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  filters: TypeFilterOption[];
  activeType: ArtifactType | "all";
  onTypeChange: (type: ArtifactType | "all") => void;
}

export function SearchBar({ value, onChange, filters, activeType, onTypeChange }: SearchBarProps) {
  return (
    <div className="search-row">
      <label className="blueprint search-field">
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.2" y1="16.2" x2="21" y2="21" />
        </svg>
        <input
          className="input search-field__input"
          type="search"
          placeholder={strings.list.searchPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>

      <div className="seg search-seg">
        {filters.map((f) => (
          <label className="seg-opt search-seg__opt" key={f.value}>
            <input
              type="radio"
              name="typefilter"
              className="search-seg__radio"
              checked={activeType === f.value}
              onChange={() => onTypeChange(f.value)}
            />
            {f.label}
            <span className="mono search-seg__count">{f.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
