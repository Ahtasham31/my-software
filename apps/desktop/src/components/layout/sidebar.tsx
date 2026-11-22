import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { IconButton } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/display";
import { cn } from "@/lib/cn";
import { NAV_GROUPS } from "@/app/nav-config";
import { BrandLogo } from "../../../assets/brand-logo";

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps): JSX.Element {
  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        <BrandLogo compact={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            {!collapsed && (
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const link = (
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-active/15 text-foreground"
                          : "text-sidebar-foreground/80 hover:bg-hover hover:text-sidebar-foreground",
                        collapsed && "justify-center"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );

                return (
                  <li key={item.to}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <IconButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          className="w-full"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </IconButton>
      </div>
    </aside>
  );
}