import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { ArtifactCard } from "./components/ArtifactCard";
import { EmptyState } from "./components/EmptyState";
import { ArtifactDetail } from "./components/ArtifactDetail";
import { loadIndex } from "./data";
import { search } from "./search";
import { buildDetail } from "./detail";
import { strings } from "./strings";
import type { ArtifactType, SearchableArtifact } from "./types";

const TYPE_ORDER: ArtifactType[] = ["plugin", "skill", "agent"];

function readUrlState() {
  if (typeof location === "undefined") return { q: "", type: "all" as const };
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  return {
    q: params.get("q") ?? "",
    type: (type && TYPE_ORDER.includes(type as ArtifactType) ? type : "all") as ArtifactType | "all",
  };
}

function syncUrl(query: string, type: ArtifactType | "all") {
  try {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type !== "all") params.set("type", type);
    const s = params.toString();
    history.replaceState(null, "", s ? `?${s}` : location.pathname);
  } catch {
    // ignore — e.g. sandboxed preview without history access
  }
}

export default function App() {
  const initial = useMemo(readUrlState, []);

  const [index, setIndex] = useState<SearchableArtifact[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    loadIndex()
      .then((data) => {
        if (cancelled) return;
        setIndex(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [input, setInput] = useState(initial.q);
  const [query, setQueryState] = useState(initial.q);
  const [type, setType] = useState<ArtifactType | "all">(initial.type);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cameFrom, setCameFrom] = useState<{ q: string; type: ArtifactType | "all" } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleQueryInput = (value: string) => {
    setInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQueryState(value);
      syncUrl(value, type);
    }, 150);
  };

  const handleTypeChange = (next: ArtifactType | "all") => {
    setType(next);
    syncUrl(query, next);
  };

  const open = (id: string) => {
    setDetailId(id);
    setCameFrom({ q: query, type });
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const back = () => setDetailId(null);

  const copy = (artifact: SearchableArtifact) => {
    try {
      navigator.clipboard?.writeText(artifact.installCommand);
    } catch {
      // clipboard blocked
    }
    setCopiedId(artifact.id);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedId(null), 1600);
  };

  const reset = () => {
    clearTimeout(debounceRef.current);
    setInput("");
    setQueryState("");
    setType("all");
    syncUrl("", "all");
  };

  const counts = useMemo(() => {
    const c: Record<ArtifactType | "all", number> = { all: index.length, plugin: 0, skill: 0, agent: 0 };
    for (const t of TYPE_ORDER) c[t] = index.filter((a) => a.type === t).length;
    return c;
  }, [index]);

  const results = useMemo(() => search(index, query, type), [index, query, type]);
  const detail = detailId ? index.find((a) => a.id === detailId) ?? null : null;
  const detailVm = detail ? buildDetail(index, detail) : null;

  const filters = [
    { label: strings.filters.all, value: "all" as const, count: counts.all },
    { label: strings.filters.plugin, value: "plugin" as const, count: counts.plugin },
    { label: strings.filters.skill, value: "skill" as const, count: counts.skill },
    { label: strings.filters.agent, value: "agent" as const, count: counts.agent },
  ];

  const isEmpty = status === "ready" && !detail && results.length === 0;
  const resultLabel = strings.list.resultLabel(results.length, query);
  const sortLabel = strings.list.sortLabel(Boolean(query));
  const backLabel = cameFrom && cameFrom.q ? strings.detail.backTo(cameFrom.q) : strings.detail.backDefault;

  return (
    <div className="page">
      <Header totalLabel={strings.totalLabel(counts.all, counts.plugin)} onGoHome={back} />

      {!detail && (
        <main className="list">
          <div className="list__intro">
            <div>
              <div className="mono list__eyebrow">{strings.list.eyebrow}</div>
              <h1 className="list__heading">{strings.list.heading}</h1>
            </div>
            <p className="list__subhead">{strings.list.subhead}</p>
          </div>

          <SearchBar
            value={input}
            onChange={handleQueryInput}
            filters={filters}
            activeType={type}
            onTypeChange={handleTypeChange}
          />

          {status === "ready" && (
            <div className="mono list__meta-row">
              <span>{resultLabel}</span>
              <span>{sortLabel}</span>
            </div>
          )}

          {status === "loading" && <p className="mono list__meta-row">Loading marketplace index…</p>}

          {status === "error" && (
            <p className="mono list__meta-row">
              Couldn't load the marketplace index. Run <code>node scripts/build-index.mjs</code> and reload.
            </p>
          )}

          {isEmpty && <EmptyState query={query} onReset={reset} />}

          {status === "ready" && (
            <div className="list__grid">
              {results.map((a) => (
                <ArtifactCard key={a.id} artifact={a} copied={copiedId === a.id} onOpen={open} onCopy={copy} />
              ))}
            </div>
          )}
        </main>
      )}

      {detail && detailVm && (
        <ArtifactDetail
          detail={detailVm}
          backLabel={backLabel}
          copied={copiedId === detail.id}
          onBack={back}
          onCopy={() => copy(detail)}
          onOpen={open}
        />
      )}
    </div>
  );
}
