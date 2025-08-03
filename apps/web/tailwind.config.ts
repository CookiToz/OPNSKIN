import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        "satoshi-bold": ["var(--font-satoshi-bold)"],
        "satoshi-regular": ["var(--font-satoshi-regular)"],
        "share-tech-mono": ["var(--font-share-tech-mono)"],
        sans: ["var(--font-satoshi-regular)"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // OPNSKIN specific colors
        "opnskin-primary": "hsl(var(--opnskin-primary))",
        "opnskin-primary-hover": "hsl(var(--opnskin-primary-hover))",
        "opnskin-bg-primary": "hsl(var(--opnskin-bg-primary))",
        "opnskin-bg-secondary": "hsl(var(--opnskin-bg-secondary))",
        "opnskin-bg-card": "hsl(var(--opnskin-bg-card))",
        "opnskin-text-primary": "hsl(var(--opnskin-text-primary))",
        "opnskin-text-secondary": "hsl(var(--opnskin-text-secondary))",
        "opnskin-accent": "hsl(var(--opnskin-accent))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-neon": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 5px rgba(40, 124, 250, 0.3), 0 0 10px rgba(40, 124, 250, 0.2)" 
          },
          "50%": { 
            boxShadow: "0 0 10px rgba(40, 124, 250, 0.5), 0 0 20px rgba(40, 124, 250, 0.3)" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-neon": "pulse-neon 2s infinite",
        float: "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-pattern":
          "linear-gradient(to right, rgba(40, 124, 250, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(40, 124, 250, 0.1) 1px, transparent 1px)",
        "opnskin-gradient": "linear-gradient(135deg, #287CFA 0%, #4A9FFF 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
