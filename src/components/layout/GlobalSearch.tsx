import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/common/Icon";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { menuLinkProps } from "./MenuTree";
import { cn } from "@/lib/utils";

/** Platform-wide search. Result routes come from the API, never hard-coded. */
export function GlobalSearch() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, total, loading, error, debounced } = useGlobalSearch(term);

  useEffect(() => setIndex(0), [debounced]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function openResult(i: number) {
    const result = results[i];
    if (!result?.route) return;
    setOpen(false);
    setTerm("");
    void navigate(menuLinkProps(result.route));
  }

  return (
    <div ref={boxRef} className="relative hidden min-w-0 flex-1 md:block lg:max-w-md">
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-nav-foreground/70"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="global-search-results"
          aria-label="Search all records"
          placeholder="Search everything…  (Ctrl + /)"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              openResult(index);
            }
          }}
          className="h-7 w-full rounded-[3px] border border-nav-hover bg-nav-hover pl-7 pr-2 text-[13px] text-nav-foreground placeholder:text-nav-foreground/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        />
      </div>

      {open && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-9 z-50 max-h-[70vh] overflow-y-auto rounded-[4px] border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {!debounced ? (
            <p className="px-2 py-4 text-center text-[13px] text-muted-foreground">
              Start typing to search across every table.
            </p>
          ) : loading ? (
            <div className="space-y-1 p-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 animate-pulse rounded-[3px] bg-muted" />
              ))}
            </div>
          ) : error ? (
            <p className="px-2 py-4 text-center text-[13px] text-destructive">
              Search is unavailable right now.
            </p>
          ) : results.length === 0 ? (
            <p className="px-2 py-4 text-center text-[13px] text-muted-foreground">
              No results for “{debounced}”.
            </p>
          ) : (
            <>
              <p className="px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {total} match{total === 1 ? "" : "es"}
              </p>
              <ul className="space-y-px">
                {results.map((r, i) => (
                  <li key={`${r.table}:${r.sys_id}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === index}
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => openResult(i)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-left transition-colors",
                        i === index ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                      )}
                    >
                      <Icon name={r.icon} className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">{r.display_value}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{r.subtitle}</span>
                      </span>
                      <span className="shrink-0 rounded-[3px] border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        {r.table_label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
