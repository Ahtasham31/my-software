import type { Theme } from "./types";

const t = (tokens: Theme["tokens"], mode: Theme["mode"], id: string, name: string): Theme => ({
  id, name, mode, builtin: true, tokens
});

export const BUILTIN_THEMES: Theme[] = [
  t({
    primary: "217 91% 60%", primaryForeground: "222 47% 6%",
    secondary: "222 47% 14%", secondaryForeground: "210 40% 98%",
    accent: "199 89% 55%", accentForeground: "222 47% 6%",
    background: "222 47% 6%", foreground: "210 40% 98%",
    card: "222 47% 9%", cardForeground: "210 40% 98%",
    popover: "222 47% 10%", popoverForeground: "210 40% 98%",
    sidebar: "222 47% 5%", sidebarForeground: "210 40% 92%",
    header: "222 47% 7%", headerForeground: "210 40% 98%",
    muted: "222 30% 15%", mutedForeground: "215 20% 65%",
    border: "222 30% 18%", input: "222 30% 18%", ring: "217 91% 60%",
    hover: "222 30% 14%", active: "217 91% 60%", selection: "217 91% 55%",
    success: "142 71% 45%", warning: "38 92% 55%", error: "0 84% 60%", information: "199 89% 55%"
  }, "dark", "midnight-pro", "Midnight Pro"),

  t({
    primary: "210 10% 85%", primaryForeground: "210 10% 10%",
    secondary: "210 8% 22%", secondaryForeground: "210 10% 95%",
    accent: "210 10% 70%", accentForeground: "210 10% 10%",
    background: "210 8% 12%", foreground: "210 10% 95%",
    card: "210 8% 15%", cardForeground: "210 10% 95%",
    popover: "210 8% 16%", popoverForeground: "210 10% 95%",
    sidebar: "210 8% 10%", sidebarForeground: "210 10% 90%",
    header: "210 8% 13%", headerForeground: "210 10% 95%",
    muted: "210 8% 20%", mutedForeground: "210 10% 70%",
    border: "210 8% 24%", input: "210 8% 24%", ring: "210 10% 85%",
    hover: "210 8% 22%", active: "210 10% 85%", selection: "210 10% 70%",
    success: "142 60% 45%", warning: "38 85% 60%", error: "0 75% 62%", information: "200 80% 60%"
  }, "dark", "graphite-professional", "Graphite Professional"),

  t({
    primary: "200 95% 55%", primaryForeground: "210 60% 8%",
    secondary: "205 40% 18%", secondaryForeground: "200 40% 96%",
    accent: "190 90% 60%", accentForeground: "210 60% 8%",
    background: "210 50% 8%", foreground: "200 40% 96%",
    card: "210 45% 11%", cardForeground: "200 40% 96%",
    popover: "210 45% 12%", popoverForeground: "200 40% 96%",
    sidebar: "210 55% 6%", sidebarForeground: "200 40% 90%",
    header: "210 50% 9%", headerForeground: "200 40% 96%",
    muted: "205 35% 18%", mutedForeground: "200 30% 70%",
    border: "205 35% 22%", input: "205 35% 22%", ring: "200 95% 55%",
    hover: "205 40% 18%", active: "200 95% 55%", selection: "200 90% 50%",
    success: "150 65% 45%", warning: "40 90% 55%", error: "0 85% 60%", information: "200 95% 55%"
  }, "dark", "ocean-blue", "Ocean Blue"),

  t({
    primary: "270 80% 65%", primaryForeground: "270 60% 8%",
    secondary: "270 40% 20%", secondaryForeground: "270 30% 96%",
    accent: "290 85% 65%", accentForeground: "270 60% 8%",
    background: "270 40% 8%", foreground: "270 30% 96%",
    card: "270 35% 11%", cardForeground: "270 30% 96%",
    popover: "270 35% 12%", popoverForeground: "270 30% 96%",
    sidebar: "270 40% 6%", sidebarForeground: "270 30% 90%",
    header: "270 40% 9%", headerForeground: "270 30% 96%",
    muted: "270 30% 18%", mutedForeground: "270 20% 70%",
    border: "270 30% 22%", input: "270 30% 22%", ring: "270 80% 65%",
    hover: "270 40% 18%", active: "270 80% 65%", selection: "270 80% 55%",
    success: "150 60% 50%", warning: "40 85% 60%", error: "0 80% 62%", information: "280 80% 65%"
  }, "dark", "royal-purple", "Royal Purple"),

  t({
    primary: "152 75% 45%", primaryForeground: "152 60% 8%",
    secondary: "155 30% 18%", secondaryForeground: "150 30% 96%",
    accent: "170 80% 45%", accentForeground: "152 60% 8%",
    background: "155 40% 8%", foreground: "150 30% 96%",
    card: "155 35% 11%", cardForeground: "150 30% 96%",
    popover: "155 35% 12%", popoverForeground: "150 30% 96%",
    sidebar: "155 40% 6%", sidebarForeground: "150 30% 90%",
    header: "155 40% 9%", headerForeground: "150 30% 96%",
    muted: "155 25% 18%", mutedForeground: "150 20% 70%",
    border: "155 25% 22%", input: "155 25% 22%", ring: "152 75% 45%",
    hover: "155 30% 18%", active: "152 75% 45%", selection: "152 75% 40%",
    success: "152 75% 45%", warning: "40 85% 55%", error: "0 80% 60%", information: "170 80% 55%"
  }, "dark", "emerald-studio", "Emerald Studio"),

  t({
    primary: "210 80% 45%", primaryForeground: "0 0% 100%",
    secondary: "210 20% 92%", secondaryForeground: "210 30% 20%",
    accent: "200 85% 50%", accentForeground: "0 0% 100%",
    background: "210 25% 98%", foreground: "210 30% 15%",
    card: "0 0% 100%", cardForeground: "210 30% 15%",
    popover: "0 0% 100%", popoverForeground: "210 30% 15%",
    sidebar: "210 25% 96%", sidebarForeground: "210 30% 20%",
    header: "0 0% 100%", headerForeground: "210 30% 15%",
    muted: "210 20% 92%", mutedForeground: "210 15% 45%",
    border: "210 20% 85%", input: "210 20% 85%", ring: "210 80% 45%",
    hover: "210 25% 94%", active: "210 80% 45%", selection: "210 80% 60%",
    success: "142 70% 40%", warning: "35 90% 45%", error: "0 80% 50%", information: "200 80% 45%"
  }, "light", "arctic-light", "Arctic Light"),

  t({
    primary: "220 90% 45%", primaryForeground: "0 0% 100%",
    secondary: "220 15% 94%", secondaryForeground: "220 20% 20%",
    accent: "200 90% 50%", accentForeground: "0 0% 100%",
    background: "0 0% 100%", foreground: "220 20% 12%",
    card: "0 0% 100%", cardForeground: "220 20% 12%",
    popover: "0 0% 100%", popoverForeground: "220 20% 12%",
    sidebar: "220 15% 98%", sidebarForeground: "220 20% 20%",
    header: "0 0% 100%", headerForeground: "220 20% 12%",
    muted: "220 15% 95%", mutedForeground: "220 10% 45%",
    border: "220 15% 88%", input: "220 15% 88%", ring: "220 90% 45%",
    hover: "220 15% 96%", active: "220 90% 45%", selection: "220 90% 60%",
    success: "142 70% 40%", warning: "35 90% 45%", error: "0 80% 50%", information: "200 80% 45%"
  }, "light", "pure-white", "Pure White"),

  t({
    primary: "30 70% 45%", primaryForeground: "0 0% 100%",
    secondary: "30 20% 90%", secondaryForeground: "30 25% 20%",
    accent: "25 80% 55%", accentForeground: "0 0% 100%",
    background: "35 30% 96%", foreground: "30 25% 15%",
    card: "35 25% 98%", cardForeground: "30 25% 15%",
    popover: "35 25% 98%", popoverForeground: "30 25% 15%",
    sidebar: "35 30% 92%", sidebarForeground: "30 25% 20%",
    header: "35 25% 98%", headerForeground: "30 25% 15%",
    muted: "30 20% 90%", mutedForeground: "30 15% 42%",
    border: "30 20% 82%", input: "30 20% 82%", ring: "30 70% 45%",
    hover: "30 25% 93%", active: "30 70% 45%", selection: "30 70% 60%",
    success: "142 65% 40%", warning: "35 90% 45%", error: "0 78% 50%", information: "200 75% 45%"
  }, "light", "warm-sand", "Warm Sand"),

  t({
    primary: "340 75% 55%", primaryForeground: "0 0% 100%",
    secondary: "340 20% 92%", secondaryForeground: "340 25% 20%",
    accent: "320 75% 60%", accentForeground: "0 0% 100%",
    background: "340 30% 97%", foreground: "340 25% 15%",
    card: "340 25% 99%", cardForeground: "340 25% 15%",
    popover: "340 25% 99%", popoverForeground: "340 25% 15%",
    sidebar: "340 30% 94%", sidebarForeground: "340 25% 20%",
    header: "340 25% 99%", headerForeground: "340 25% 15%",
    muted: "340 20% 93%", mutedForeground: "340 15% 45%",
    border: "340 20% 86%", input: "340 20% 86%", ring: "340 75% 55%",
    hover: "340 25% 95%", active: "340 75% 55%", selection: "340 75% 68%",
    success: "150 65% 42%", warning: "35 90% 48%", error: "0 80% 52%", information: "200 80% 48%"
  }, "light", "rose-quartz", "Rose Quartz"),

  t({
    primary: "300 95% 60%", primaryForeground: "300 60% 8%",
    secondary: "240 30% 15%", secondaryForeground: "300 40% 96%",
    accent: "180 100% 55%", accentForeground: "300 60% 8%",
    background: "240 60% 4%", foreground: "300 40% 96%",
    card: "240 50% 7%", cardForeground: "300 40% 96%",
    popover: "240 50% 8%", popoverForeground: "300 40% 96%",
    sidebar: "240 60% 3%", sidebarForeground: "300 40% 92%",
    header: "240 55% 5%", headerForeground: "300 40% 96%",
    muted: "240 30% 13%", mutedForeground: "280 20% 70%",
    border: "270 60% 25%", input: "270 60% 25%", ring: "300 95% 60%",
    hover: "270 40% 15%", active: "300 95% 60%", selection: "300 90% 55%",
    success: "150 100% 50%", warning: "45 100% 60%", error: "0 100% 62%", information: "180 100% 55%"
  }, "dark", "cyber-neon", "Cyber Neon"),

  t({
    primary: "0 0% 90%", primaryForeground: "0 0% 8%",
    secondary: "0 0% 22%", secondaryForeground: "0 0% 95%",
    accent: "0 0% 65%", accentForeground: "0 0% 8%",
    background: "0 0% 12%", foreground: "0 0% 95%",
    card: "0 0% 15%", cardForeground: "0 0% 95%",
    popover: "0 0% 16%", popoverForeground: "0 0% 95%",
    sidebar: "0 0% 10%", sidebarForeground: "0 0% 90%",
    header: "0 0% 13%", headerForeground: "0 0% 95%",
    muted: "0 0% 20%", mutedForeground: "0 0% 65%",
    border: "0 0% 25%", input: "0 0% 25%", ring: "0 0% 90%",
    hover: "0 0% 22%", active: "0 0% 90%", selection: "0 0% 60%",
    success: "0 0% 80%", warning: "0 0% 75%", error: "0 0% 85%", information: "0 0% 70%"
  }, "dark", "monochrome", "Monochrome"),

  t({
    primary: "210 100% 40%", primaryForeground: "0 0% 100%",
    secondary: "0 0% 100%", secondaryForeground: "0 0% 0%",
    accent: "45 100% 40%", accentForeground: "0 0% 0%",
    background: "0 0% 0%", foreground: "0 0% 100%",
    card: "0 0% 8%", cardForeground: "0 0% 100%",
    popover: "0 0% 5%", popoverForeground: "0 0% 100%",
    sidebar: "0 0% 0%", sidebarForeground: "0 0% 100%",
    header: "0 0% 0%", headerForeground: "0 0% 100%",
    muted: "0 0% 15%", mutedForeground: "0 0% 85%",
    border: "0 0% 60%", input: "0 0% 60%", ring: "210 100% 55%",
    hover: "0 0% 20%", active: "45 100% 55%", selection: "45 100% 55%",
    success: "120 100% 45%", warning: "45 100% 55%", error: "0 100% 60%", information: "200 100% 60%"
  }, "dark", "high-contrast-accessibility", "High Contrast Accessibility")
];