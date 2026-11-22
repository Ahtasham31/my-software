import type { PassportPreset } from "@/types/passport";

export const BUILTIN_PRESETS: Omit<PassportPreset, "createdAt">[] = [
  {
    id: "passport-35x45",
    name: "Passport 35×45 mm",
    category: "identity",
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    aspectRatio: "35:45",
    backgroundPreference: "white",
    custom: false
  },
  {
    id: "cnic-25x30",
    name: "CNIC 25×30 mm",
    category: "identity",
    widthMm: 25,
    heightMm: 30,
    dpi: 300,
    aspectRatio: "5:6",
    backgroundPreference: "white",
    custom: false
  },
  {
    id: "id-2x2",
    name: "ID 2×2 in (51×51 mm)",
    category: "identity",
    widthMm: 50.8,
    heightMm: 50.8,
    dpi: 300,
    aspectRatio: "1:1",
    backgroundPreference: "white",
    custom: false
  },
  {
    id: "student-id",
    name: "Student ID 30×40 mm",
    category: "id-card",
    widthMm: 30,
    heightMm: 40,
    dpi: 300,
    aspectRatio: "3:4",
    backgroundPreference: "light-blue",
    custom: false
  },
  {
    id: "employee-id",
    name: "Employee ID 30×40 mm",
    category: "id-card",
    widthMm: 30,
    heightMm: 40,
    dpi: 300,
    aspectRatio: "3:4",
    backgroundPreference: "white",
    custom: false
  },
  {
    id: "visa-2x2",
    name: "Visa 2×2 in",
    category: "visa",
    widthMm: 50.8,
    heightMm: 50.8,
    dpi: 300,
    aspectRatio: "1:1",
    backgroundPreference: "white",
    custom: false
  },
  {
    id: "visa-35x45",
    name: "Visa 35×45 mm",
    category: "visa",
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    aspectRatio: "35:45",
    backgroundPreference: "white",
    custom: false
  },
  {
    id: "visa-50x50",
    name: "Visa 50×50 mm",
    category: "visa",
    widthMm: 50,
    heightMm: 50,
    dpi: 300,
    aspectRatio: "1:1",
    backgroundPreference: "white",
    custom: false
  },
  {
    id: "visa-45x35",
    name: "Visa 45×35 mm",
    category: "visa",
    widthMm: 45,
    heightMm: 35,
    dpi: 300,
    aspectRatio: "45:35",
    backgroundPreference: "white",
    custom: false
  },
  {
    id: "visa-40x50",
    name: "Visa 40×50 mm",
    category: "visa",
    widthMm: 40,
    heightMm: 50,
    dpi: 300,
    aspectRatio: "4:5",
    backgroundPreference: "white",
    custom: false
  }
];

export function builtinPresets(): PassportPreset[] {
  const now = new Date().toISOString();
  return BUILTIN_PRESETS.map((p) => ({ ...p, createdAt: now }));
}

export function findPreset(
  presets: PassportPreset[],
  id: string
): PassportPreset | undefined {
  return presets.find((p) => p.id === id);
}

export function categoriesOf(presets: PassportPreset[]): Record<string, PassportPreset[]> {
  const groups: Record<string, PassportPreset[]> = {};
  for (const p of presets) {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  }
  return groups;
}