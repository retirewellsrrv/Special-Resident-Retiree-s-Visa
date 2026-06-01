import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────────────────────
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        combo: "hsl(var(--combo))",

        // ── Add: all missing shadcn/base-ui semantic tokens ──────────
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },

        brand: {
          // ── Primary — SRRV Red #A6192E ──────────────────────────────────
          primary: {
            50: "#f0d7db",
            100: "#e8c2c8",
            200: "#d798a1",
            300: "#c76e7b",
            400: "#b64354",
            500: "#a6192e", // ← base
            600: "#871426",
            700: "#69101d",
            800: "#4a0b15",
            900: "#2c070c",
            950: "#1d0408",
            1000: "#0d0204",
          },

          // ── Secondary — Deep Charcoal #1A1C1E ───────────────────────────
          secondary: {
            50: "#d8d8d8",
            100: "#c3c3c4",
            200: "#98999a",
            300: "#6e7071",
            400: "#444647",
            500: "#1a1c1e", // ← base
            600: "#151718",
            700: "#101213",
            800: "#0c0d0d",
            900: "#070708",
            950: "#040505",
            1000: "#020202",
          },

          // ── Tertiary — Off-White #F8F9FA ─────────────────────────────────
          tertiary: {
            50: "#fefefe",
            100: "#fdfdfe",
            200: "#fcfcfd",
            300: "#fbfbfc",
            400: "#f9fafb",
            500: "#f8f9fa", // ← base
            600: "#cacbcc",
            700: "#9d9d9e",
            800: "#6f7070",
            900: "#414242",
            950: "#2b2b2b",
            1000: "#141414",
          },

          // ── Neutral — Soft Slate #64748B ─────────────────────────────────
          neutral: {
            50: "#e4e7eb",
            100: "#d6dae0",
            200: "#bac1cb",
            300: "#9da7b6",
            400: "#818ea0",
            500: "#64748b", // ← base
            600: "#525f71",
            700: "#3f4958",
            800: "#2d343e",
            900: "#1a1f25",
            950: "#111418",
            1000: "#08090b",
          },

          // accent
          goldAccent: {
            1: "#c9a84c",
            2: "#c5bfa8",
          },
        },

        // ── Heritage Trust semantic tokens ──────────────────────────────────
        ht: {
          surface: "#f8f9ff",
          "surface-dim": "#cbdbf5",
          "surface-bright": "#f8f9ff",
          "surface-container-lowest": "#ffffff",
          "surface-container-low": "#eff4ff",
          "surface-container": "#e5eeff",
          "surface-container-high": "#dce9ff",
          "surface-container-highest": "#d3e4fe",
          "surface-variant": "#d3e4fe",
          "surface-tint": "#b42537",
          "on-surface": "#0b1c30",
          "on-surface-variant": "#594040",
          "inverse-surface": "#213145",
          "inverse-on-surface": "#eaf1ff",
          outline: "#8d7070",
          "outline-variant": "#e1bebe",
          primary: "#a6192e",
          "on-primary": "#ffffff",
          "primary-container": "#871426",
          "on-primary-container": "#f0d7db",
          "inverse-primary": "#e8c2c8",
          "primary-fixed": "#f0d7db",
          "primary-fixed-dim": "#e8c2c8",
          "on-primary-fixed": "#0d0204",
          "on-primary-fixed-variant": "#69101d",
          secondary: "#1a1c1e",
          "on-secondary": "#ffffff",
          "secondary-container": "#444647",
          "on-secondary-container": "#d8d8d8",
          "secondary-fixed": "#d8d8d8",
          "secondary-fixed-dim": "#c3c3c4",
          "on-secondary-fixed": "#020202",
          "on-secondary-fixed-variant": "#444647",
          tertiary: "#64748b",
          "on-tertiary": "#ffffff",
          "tertiary-container": "#d6dae0",
          "on-tertiary-container": "#08090b",
          "tertiary-fixed": "#e4e7eb",
          "tertiary-fixed-dim": "#d6dae0",
          "on-tertiary-fixed": "#08090b",
          "on-tertiary-fixed-variant": "#3f4958",
          error: "#ba1a1a",
          "on-error": "#ffffff",
          "error-container": "#ffdad6",
          "on-error-container": "#93000a",
          background: "#f8f9fa",
          "on-background": "#1a1c1e",
        },
      },

      // ─── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },

      fontSize: {
        "ht-display": [
          "48px",
          { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "ht-headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "ht-headline-lg-mobile": [
          "28px",
          { lineHeight: "36px", fontWeight: "600" },
        ],
        "ht-headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "ht-body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "ht-body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "ht-label-md": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "500" },
        ],
        "ht-caption": ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },

      // ─── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        sm: "0.125rem", // 2px
        DEFAULT: "0.25rem", // 4px — buttons, inputs
        md: "0.375rem", // 6px
        lg: "0.5rem", // 8px — cards, image frames
        xl: "0.75rem", // 12px
        full: "9999px", // pill (avoid for primary elements)
      },

      // ─── Spacing ────────────────────────────────────────────────────────────
      spacing: {
        "ht-base": "8px",
        "ht-margin-mobile": "20px",
        "ht-margin-desktop": "80px",
        "ht-gutter": "24px",
        "ht-section-gap": "120px",
        "ht-tap-target": "48px",
      },

      // ─── Max Width ───────────────────────────────────────────────────────────
      maxWidth: {
        "ht-content": "1280px",
      },

      // ─── Shadows — tonal only, no heavy drops ────────────────────────────────
      boxShadow: {
        "ht-card": "0 0 0 1px #e2e8f0",
        "ht-hover":
          "0 4px 16px 0 rgba(26,28,30,0.10), 0 1px 4px 0 rgba(26,28,30,0.06)",
        "ht-focus": "0 0 0 3px rgba(166,25,46,0.30)",
        "ht-elevated":
          "0 8px 32px 0 rgba(26,28,30,0.12), 0 2px 8px 0 rgba(26,28,30,0.08)",
      },

      // ─── Transitions ─────────────────────────────────────────────────────────
      transitionTimingFunction: {
        "ht-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "ht-fast": "150ms",
        "ht-base": "200ms",
        "ht-slow": "300ms",
      },
    },
  },
  plugins: [],
};

export default config;
