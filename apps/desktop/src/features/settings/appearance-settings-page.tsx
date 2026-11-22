import { useTheme } from "@/design-system/useTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Label, RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue, Slider, Switch
} from "@/components/ui/form";
import { Badge } from "@/components/ui/display";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import type { Density } from "@/design-system/themes/types";

export function AppearanceSettingsPage(): JSX.Element {
  const {
    appearance, theme, themes, setTheme, setMode, setDensity, setScale, setRadius, reset
  } = useTheme();

  return (
    <PageContainer>
      <PageHeader
        title="Appearance"
        description="Customize themes, colors, density, and typography. All settings are stored locally."
        actions={<Button variant="outline" onClick={reset}>Reset to defaults</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  aria-pressed={t.id === theme.id}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    t.id === theme.id
                      ? "border-primary bg-hover"
                      : "border-border hover:bg-hover"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{t.name}</span>
                    <Badge variant={t.mode === "dark" ? "secondary" : "outline"}>
                      {t.mode}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {(["primary", "accent", "background", "card", "sidebar"] as const).map((k) => (
                      <span
                        key={k}
                        aria-hidden
                        className="h-4 flex-1 rounded-sm border border-border"
                        style={{ background: `hsl(${t.tokens[k]})` }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Mode</Label>
              <RadioGroup
                value={appearance.mode}
                onValueChange={(v) => setMode(v as typeof appearance.mode)}
                className="flex gap-3"
              >
                {(["light", "dark", "system"] as const).map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={m} /> {m}
                  </label>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Layout</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="density">Density</Label>
              <Select value={appearance.density} onValueChange={(v) => setDensity(v as Density)}>
                <SelectTrigger id="density"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Interface scale: {Math.round(appearance.scale * 100)}%</Label>
              <Slider
                min={0.85} max={1.25} step={0.05}
                value={[appearance.scale]}
                onValueChange={([v]) => v && setScale(v)}
              />
            </div>
            <div className="space-y-1">
              <Label>Corner radius: {appearance.radius.toFixed(2)}rem</Label>
              <Slider
                min={0} max={1.5} step={0.05}
                value={[appearance.radius]}
                onValueChange={([v]) => v !== undefined && setRadius(v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced">Respect reduced motion</Label>
              <Switch id="reduced" defaultChecked disabled aria-label="Respect reduced motion" />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}