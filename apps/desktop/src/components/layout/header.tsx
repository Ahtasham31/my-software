import { Bell, Command, Moon, Search, Settings, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { IconButton } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/display";
import { useTheme } from "@/design-system/useTheme";
import { NAV_LOOKUP } from "@/app/nav-config";

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export function Header({ onOpenCommandPalette }: HeaderProps): JSX.Element {
  const { pathname } = useLocation();
  const { appearance, setMode } = useTheme();
  const title = NAV_LOOKUP[pathname] ?? "DocuVerse Studio";

  const toggleMode = () => {
    const next = appearance.mode === "light" ? "dark" : "light";
    setMode(next);
  };

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-header px-4 text-header-foreground">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold">{title}</h1>
      </div>

      <button
        onClick={onOpenCommandPalette}
        aria-label="Open command palette"
        className="hidden items-center gap-2 rounded-md border border-input bg-background/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-hover md:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search or run a command</span>
        <kbd className="ml-2 inline-flex items-center gap-0.5 rounded border border-input bg-background px-1.5 text-[10px]">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton aria-label="Toggle theme mode" onClick={toggleMode}>
            {appearance.mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>Toggle theme mode</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton aria-label="Settings">
            <Settings className="h-4 w-4" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
    </header>
  );
}