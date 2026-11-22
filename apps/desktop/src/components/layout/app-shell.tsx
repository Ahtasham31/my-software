import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { StatusBar } from "./status-bar";
import { TooltipProvider } from "@/components/ui/display";
import { CommandPalette } from "@/components/navigation/command-palette";
import { ConfirmProvider, ToastProvider } from "@/components/ui/overlay";

export function AppShell(): JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const toggleSidebar = useCallback(() => setCollapsed((v) => !v), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <TooltipProvider delayDuration={200}>
          <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
            <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header onOpenCommandPalette={openPalette} />
              <main className="min-h-0 flex-1 overflow-auto">
                <Outlet />
              </main>
              <StatusBar />
            </div>
          </div>
          <CommandPalette open={paletteOpen} onClose={closePalette} />
        </TooltipProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}