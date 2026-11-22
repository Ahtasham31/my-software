import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))"
        },
        header: {
          DEFAULT: "hsl(var(--header))",
          foreground: "hsl(var(--header-foreground))"
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        information: "hsl(var(--information))",
        selection: "hsl(var(--selection))",
        hover: "hsl(var(--hover))",
        active: "hsl(var(--active))"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        urdu: ["var(--font-urdu)", "Noto Nastaliq Urdu", "serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      fontSize: {
        "display": ["2.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "title": ["1.75rem", { lineHeight: "1.2", fontWeight: "600" }],
        "section": ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        "card-heading": ["1rem", { lineHeight: "1.4", fontWeight: "600" }]
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } }
      },
      animation: {
        "accordion-down": "accordion-down 150ms ease-out",
        "accordion-up": "accordion-up 150ms ease-out",
        "fade-in": "fade-in 150ms ease-out",
        "fade-out": "fade-out 150ms ease-in"
      }
    }
  },
  plugins: [animate]
} satisfies Config;