import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
} from "react";

/**
 * FloatingSearchBar
 * A self-contained, dependency-free (no Tailwind) search bar that floats
 * over a page, expands into a results panel, and groups matches into
 * sections — Events, Venues, Artists.
 *
 * Drop the file in and render <FloatingSearchBar items={...} /> — styles
 * are injected once via a <style> tag, so nothing else needs to be wired up.
 */

export type ItemCategory = "event" | "venue" | "artist";

export interface SearchItem {
  id: string;
  category: ItemCategory;
  title: string;
  subtitle?: string;
  /** e.g. a date for events, a city for venues, a genre for artists */
  meta?: string;
}

interface FloatingSearchBarProps {
  items: SearchItem[];
  placeholder?: string;
  onSelect?: (item: SearchItem) => void;
}

const CATEGORY_ORDER: ItemCategory[] = ["event", "venue", "artist"];

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  event: "Events",
  venue: "Venues",
  artist: "Artists",
};

const CATEGORY_ICON: Record<ItemCategory, JSX.Element> = {
  event: (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
      <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 8h14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 2.5v3M13.5 2.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  venue: (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
      <path
        d="M10 17.5S16 12.2 16 8a6 6 0 10-12 0c0 4.2 6 9.5 6 9.5z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  artist: (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matches(item: SearchItem, query: string): boolean {
  const q = normalize(query);
  if (!q) return false;
  return (
    normalize(item.title).includes(q) ||
    (item.subtitle ? normalize(item.subtitle).includes(q) : false) ||
    (item.meta ? normalize(item.meta).includes(q) : false)
  );
}

export default function FloatingSearchBar({
  items,
  placeholder = "Search events, venues, artists…",
  onSelect,
}: FloatingSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const grouped = useMemo(() => {
    const q = query;
    const result: { category: ItemCategory; items: SearchItem[] }[] = [];
    for (const category of CATEGORY_ORDER) {
      const inCategory = items.filter(
        (item) => item.category === category && matches(item, q)
      );
      if (inCategory.length > 0) {
        result.push({ category, items: inCategory.slice(0, 5) });
      }
    }
    return result;
  }, [items, query]);

  const flatResults = useMemo(
    () => grouped.flatMap((group) => group.items),
    [grouped]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: SearchItem) {
    onSelect?.(item);
    setQuery(item.title);
    setIsOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flatResults.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % flatResults.length);
      setIsOpen(true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flatResults.length === 0) return;
      setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
      setIsOpen(true);
    } else if (event.key === "Enter") {
      if (flatResults[activeIndex]) {
        handleSelect(flatResults[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  const showPanel = isOpen && query.trim().length > 0;
  const hasResults = flatResults.length > 0;

  let runningIndex = -1;

  return (
    <div className="fsb-root" ref={containerRef}>
      <style>{STYLES}</style>

      <div className={`fsb-bar${showPanel ? " fsb-bar--open" : ""}`}>
        <span className="fsb-bar__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M16 16l-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>

        <input
          ref={inputRef}
          className="fsb-bar__input"
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showPanel}
          aria-autocomplete="list"
          aria-controls="fsb-listbox"
        />

        {query.length > 0 && (
          <button
            type="button"
            className="fsb-bar__clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {showPanel && (
        <div className="fsb-panel" id="fsb-listbox" role="listbox">
          {!hasResults && (
            <div className="fsb-empty">
              Nothing matches "{query}". Try a different name or keyword.
            </div>
          )}

          {grouped.map((group) => (
            <div className="fsb-section" key={group.category}>
              <div className="fsb-section__label">
                {CATEGORY_LABEL[group.category]}
              </div>
              {group.items.map((item) => {
                runningIndex += 1;
                const isActive = runningIndex === activeIndex;
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isActive}
                    className={`fsb-row${isActive ? " fsb-row--active" : ""}`}
                    onMouseEnter={() => setActiveIndex(runningIndex)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(item);
                    }}
                  >
                    <span className="fsb-row__icon">
                      {CATEGORY_ICON[item.category]}
                    </span>
                    <span className="fsb-row__text">
                      <span className="fsb-row__title">{item.title}</span>
                      {item.subtitle && (
                        <span className="fsb-row__subtitle">{item.subtitle}</span>
                      )}
                    </span>
                    {item.meta && <span className="fsb-row__meta">{item.meta}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STYLES = `
.fsb-root {
  --fsb-ink: #16181D;
  --fsb-surface: #1E2128;
  --fsb-surface-raised: #262A33;
  --fsb-border: #33384270;
  --fsb-text: #EEEEF0;
  --fsb-text-dim: #9A9FAC;
  --fsb-accent: #6E7BF2;
  --fsb-accent-dim: #6E7BF224;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  position: relative;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  z-index: 40;
}

.fsb-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--fsb-surface);
  border: 1px solid var(--fsb-border);
  border-radius: 999px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28), 0 1px 0 rgba(255, 255, 255, 0.03) inset;
  transition: border-radius 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.fsb-bar--open {
  border-radius: 22px 22px 0 0;
  border-color: var(--fsb-accent);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.34);
}

.fsb-bar__icon {
  color: var(--fsb-text-dim);
  display: flex;
  flex-shrink: 0;
}

.fsb-bar__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--fsb-text);
  font-size: 15px;
  line-height: 1.4;
}

.fsb-bar__input::placeholder {
  color: var(--fsb-text-dim);
}

.fsb-bar__clear {
  background: transparent;
  border: none;
  color: var(--fsb-text-dim);
  cursor: pointer;
  display: flex;
  padding: 4px;
  border-radius: 999px;
}

.fsb-bar__clear:hover {
  color: var(--fsb-text);
  background: rgba(255, 255, 255, 0.06);
}

.fsb-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--fsb-surface);
  border: 1px solid var(--fsb-accent);
  border-top: none;
  border-radius: 0 0 22px 22px;
  padding: 8px 8px 12px;
  max-height: 420px;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.34);
}

.fsb-empty {
  padding: 20px 16px;
  color: var(--fsb-text-dim);
  font-size: 13.5px;
}

.fsb-section {
  padding: 6px 0;
}

.fsb-section + .fsb-section {
  border-top: 1px solid var(--fsb-border);
}

.fsb-section__label {
  padding: 8px 14px 4px;
  font-size: 12px;
  color: var(--fsb-text-dim);
  letter-spacing: 0.01em;
}

.fsb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 12px;
  cursor: pointer;
  margin: 0 4px;
}

.fsb-row--active,
.fsb-row:hover {
  background: var(--fsb-accent-dim);
}

.fsb-row__icon {
  color: var(--fsb-text-dim);
  display: flex;
  flex-shrink: 0;
}

.fsb-row--active .fsb-row__icon {
  color: var(--fsb-accent);
}

.fsb-row__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.fsb-row__title {
  color: var(--fsb-text);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fsb-row__subtitle {
  color: var(--fsb-text-dim);
  font-size: 12.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fsb-row__meta {
  color: var(--fsb-text-dim);
  font-size: 12px;
  flex-shrink: 0;
  padding-left: 8px;
}

.fsb-panel::-webkit-scrollbar {
  width: 8px;
}

.fsb-panel::-webkit-scrollbar-thumb {
  background: var(--fsb-surface-raised);
  border-radius: 8px;
}
`;
