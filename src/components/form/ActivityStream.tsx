import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@/components/common/Icon";
import { activityService } from "@/services/activityService";
import type { ActivityEntry, ActivityStreamData, ActivityType, ActivityTypeMeta } from "@/services/types";
import { cn } from "@/lib/utils";

const POSTABLE: ActivityType[] = ["comment", "work_note"];

/** Metadata-driven activity stream — works for any table and record. */
export function ActivityStream({ tableName, recordId }: { tableName: string; recordId: string }) {
  const queryClient = useQueryClient();
  const key = ["activities", tableName, recordId] as const;
  const [content, setContent] = useState("");
  const [type, setType] = useState<ActivityType>("comment");

  const stream = useQuery<ActivityStreamData>({
    queryKey: key,
    queryFn: () => activityService.getActivities(tableName, recordId),
    enabled: recordId !== "new",
  });

  const post = useMutation({
    mutationFn: () => activityService.postActivity(tableName, recordId, { type, content: content.trim() }),
    onSuccess: () => {
      setContent("");
      void queryClient.invalidateQueries({ queryKey: key });
      toast.success("Activity posted");
    },
    onError: () => toast.error("Unable to post activity.", { description: "Please try again." }),
  });

  if (recordId === "new") {
    return (
      <aside className="rounded-[4px] border border-border bg-surface p-4 text-[13px] text-muted-foreground">
        The activity stream becomes available once the record is saved.
      </aside>
    );
  }

  const types = stream.data?.types ?? [];
  const entries = stream.data?.entries ?? [];
  const options = types.filter((t) => POSTABLE.includes(t.id));

  return (
    <aside
      aria-label="Activity stream"
      className="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-[4px] border border-border bg-surface"
    >
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Icon name="history" className="size-4 text-muted-foreground" />
        <h2 className="text-[13px] font-semibold">Activity</h2>
        <span className="ml-auto text-[11px] text-muted-foreground">{entries.length}</span>
      </header>

      <div className="border-b border-border p-3">
        <label htmlFor="activity-input" className="sr-only">
          Add work notes or a customer-visible comment
        </label>
        <textarea
          id="activity-input"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add work notes or a customer-visible comment..."
          className="w-full resize-y rounded-[3px] border border-input bg-background px-2 py-1.5 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        />
        <div className="mt-2 flex items-center gap-2">
          <select
            aria-label="Activity type"
            value={type}
            onChange={(e) => setType(e.target.value as ActivityType)}
            className="h-7 rounded-[3px] border border-input bg-background px-1.5 text-[12px]"
          >
            {options.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!content.trim() || post.isPending}
            onClick={() => post.mutate()}
            className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-[3px] bg-primary px-3 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {post.isPending && <Icon name="loader-circle" className="size-3.5 animate-spin" />}
            Post
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {stream.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-[3px] bg-muted" />
            ))}
          </div>
        ) : stream.error ? (
          <p className="py-6 text-center text-[13px] text-destructive">Unable to load activity.</p>
        ) : entries.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">No activity yet.</p>
        ) : (
          <ol className="relative space-y-4 pl-6">
            <span aria-hidden="true" className="absolute bottom-2 left-[11px] top-2 w-px bg-border" />
            {entries.map((entry) => (
              <ActivityItem key={entry.id} entry={entry} types={types} />
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

const TONE: Record<ActivityType, string> = {
  comment: "bg-primary/10 text-primary",
  work_note: "bg-warning/15 text-warning",
  system: "bg-muted text-muted-foreground",
  field_change: "bg-accent text-accent-foreground",
  attachment: "bg-success/15 text-success",
};

function ActivityItem({ entry, types }: { entry: ActivityEntry; types: ActivityTypeMeta[] }) {
  const meta = types.find((t) => t.id === entry.type);
  return (
    <li className="relative">
      <span
        className={cn(
          "absolute -left-6 top-0 grid size-[22px] place-items-center rounded-full border border-border bg-surface",
          TONE[entry.type],
        )}
      >
        <Icon name={meta?.icon ?? "circle"} className="size-3" />
      </span>
      <div className="rounded-[3px] border border-border bg-surface-sunken px-2.5 py-2">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[12px] font-semibold">{entry.author.displayName}</span>
          <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            {meta?.label ?? entry.type}
          </span>
          <time dateTime={entry.createdAt} className="ml-auto text-[11px] text-muted-foreground">
            {new Date(entry.createdAt).toLocaleString()}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-[13px] text-foreground">{entry.content}</p>
        {entry.type === "field_change" && entry.field_label && (
          <p className="mt-1 text-[12px] text-muted-foreground">
            {entry.field_label}: <span className="line-through">{entry.old_value}</span> → {entry.new_value}
          </p>
        )}
      </div>
    </li>
  );
}
