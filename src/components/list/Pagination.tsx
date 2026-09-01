import { Icon } from "@/components/common/Icon";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  from,
  to,
  total,
  pageSize,
  pageSizes,
  onPage,
  onPageSize,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  pageSize: number;
  pageSizes: number[];
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}) {
  const windowStart = Math.max(0, Math.min(page - 2, totalPages - 5));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => windowStart + i);

  return (
    <div className="grid gap-3 border-t border-border px-3 py-2.5 sm:flex sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
        <span>
          Showing {from} - {to} of {total}
        </span>
        <label className="flex items-center gap-1.5">
          <span className="sr-only sm:not-sr-only">Rows</span>
          <select
            aria-label="Records per page"
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-7 rounded-[3px] border border-input bg-background px-1.5 text-[12px] outline-none focus:border-ring"
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          className="inline-flex h-7 items-center gap-1 rounded-[3px] border border-border px-2 text-[12px] text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="chevron-left" className="size-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPage(p)}
            className={cn(
              "size-7 rounded-[3px] border text-[12px] transition-colors",
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            {p + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex h-7 items-center gap-1 rounded-[3px] border border-border px-2 text-[12px] text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <Icon name="chevron-right" className="size-3.5" />
        </button>
      </nav>
    </div>
  );
}
