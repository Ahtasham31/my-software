# Theme Architecture

## Model
```ts
interface Theme {
  id: string;
  name: string;
  mode: "light" | "dark";
  builtin: boolean;
  tokens: Record<TokenKey, string>; // HSL triplet strings
  radius?: string;
}