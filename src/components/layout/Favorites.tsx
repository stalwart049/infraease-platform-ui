import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@/components/common/Icon";
import { useFavorites } from "@/hooks/useFavorites";
import { menuLinkProps } from "./MenuTree";

/** Quick access to the user's starred menu items. */
export function Favorites() {
  const { favorites, toggle } = useFavorites();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Favorites (${favorites.length})`}
          className="relative grid size-8 place-items-center rounded-[3px] text-nav-foreground transition-colors hover:bg-nav-hover"
        >
          <Icon name="star" className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-64 rounded-[4px] p-1">
        <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Favorites
        </p>
        {favorites.length === 0 ? (
          <p className="px-2 py-4 text-center text-[13px] text-muted-foreground">
            Star any menu item to pin it here.
          </p>
        ) : (
          <ul className="space-y-px">
            {favorites.map((fav) => (
              <li key={fav.id} className="flex items-center gap-1">
                {fav.route ? (
                  <Link
                    {...menuLinkProps(fav.route)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-[3px] px-2 py-1.5 text-[13px] transition-colors hover:bg-muted"
                  >
                    <Icon name={fav.icon} className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{fav.label}</span>
                  </Link>
                ) : (
                  <span className="flex-1 truncate px-2 py-1.5 text-[13px]">{fav.label}</span>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${fav.label} from favorites`}
                  onClick={() => toggle(fav.id)}
                  className="grid size-6 shrink-0 place-items-center rounded-[3px] text-warning transition-colors hover:bg-muted"
                >
                  <Icon name="star" className="size-3.5 fill-current" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
