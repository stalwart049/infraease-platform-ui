import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/common/Icon";
import { referenceService } from "@/services/referenceService";

export function RecordPreview({
  open,
  onOpenChange,
  tableName,
  recordId,
  displayField,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  recordId: string;
  displayField: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reference-preview", tableName, recordId],
    queryFn: () => referenceService.getPreview(tableName, recordId, displayField),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 rounded-[4px] p-0">
        <DialogHeader className="border-b border-border px-4 py-3 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
            {data?.table_label ?? tableName.replace(/_/g, " ")}
          </p>
          <DialogTitle className="text-base font-semibold">{data?.title ?? "Loading record"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-3.5 overflow-y-auto px-4 py-4">
          {isLoading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          )}
          {isError && <p className="text-[13px] text-destructive">Unable to load this record preview.</p>}
          {data?.fields.map((f) => (
            <div key={f.label}>
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                <Icon name={f.icon} className="size-3" />
                {f.label}
              </p>
              <p className="mt-0.5 text-[13px] text-foreground">{f.value}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-4 py-3">
          <Link
            to="/form/$tableName/$recordId"
            params={{ tableName, recordId }}
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
          >
            <Icon name="external-link" className="size-3.5" />
            Open Record
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
