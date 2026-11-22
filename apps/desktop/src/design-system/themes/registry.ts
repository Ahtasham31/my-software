import { BUILTIN_THEMES } from "./builtin";
import type { Theme } from "./types";

export class ThemeRegistry {
  private themes = new Map<string, Theme>();

  constructor(initial: Theme[] = BUILTIN_THEMES) {
    for (const th of initial) this.themes.set(th.id, th);
  }

  list(): Theme[] {
    return Array.from(this.themes.values());
  }

  builtin(): Theme[] {
    return this.list().filter((t) => t.builtin);
  }

  get(id: string): Theme | undefined {
    return this.themes.get(id);
  }

  register(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  remove(id: string): boolean {
    const t = this.themes.get(id);
    if (!t || t.builtin) return false;
    return this.themes.delete(id);
  }
}

export const themeRegistry = new ThemeRegistry();