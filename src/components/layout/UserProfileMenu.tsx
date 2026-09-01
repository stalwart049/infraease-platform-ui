import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/common/Icon";
import type { ProfileInfo, ProfileMenuItem } from "@/services/types";

export function UserProfileMenu({
  profile,
  items,
}: {
  profile: ProfileInfo | null;
  items: ProfileMenuItem[];
}) {
  if (!profile) {
    return <div className="size-8 animate-pulse rounded-full bg-nav-hover" aria-hidden="true" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${profile.name}`}
          className="flex h-8 items-center gap-2 rounded-full pl-1 pr-2 text-nav-foreground transition-colors hover:bg-nav-hover focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-nav-foreground"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-nav-hover text-[11px] font-semibold">
            {profile.initials}
          </span>
          <span className="hidden max-w-32 truncate text-[13px] font-medium lg:inline">{profile.name}</span>
          <Icon name="chevron-down" className="size-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-[4px] p-1">
        <DropdownMenuLabel className="px-2 py-2">
          <span className="block truncate text-[13px] font-semibold text-foreground">{profile.name}</span>
          <span className="block truncate text-[12px] font-normal text-muted-foreground">{profile.title}</span>
          <span className="block truncate text-[12px] font-normal text-muted-foreground">
            {profile.organization}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <div key={item.id}>
            {item.separator_before && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="gap-2 rounded-[3px] text-[13px]"
              onSelect={() => toast.info(`${item.label} is handled by the InfraEase identity service.`)}
            >
              <Icon name={item.icon} className="size-3.5 text-muted-foreground" />
              {item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
