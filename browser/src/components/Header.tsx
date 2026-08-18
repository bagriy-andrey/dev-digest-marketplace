import { strings } from "../strings";

interface HeaderProps {
  totalLabel: string;
  onGoHome: () => void;
}

export function Header({ totalLabel, onGoHome }: HeaderProps) {
  return (
    <header className="nav page-header">
      <div className="nav-brand page-header__brand">
        {strings.brand.name}&nbsp;<span className="accent-text">{strings.brand.accent}</span>
      </div>
      <span className="mono page-header__total">{totalLabel}</span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onGoHome();
        }}
      >
        {strings.nav.search}
      </a>
      <a href="#" onClick={(e) => e.preventDefault()}>
        {strings.nav.guidelines}
      </a>
      <a href="#" onClick={(e) => e.preventDefault()}>
        {strings.nav.github}
      </a>
    </header>
  );
}
