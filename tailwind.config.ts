import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
        // Set 'Press Start 2P' as the default sans-serif font
        sans: ['"Press Start 2P"', 'cursive'],
        // Keep pixel for explicit use if needed, though 'sans' will now be pixelated
        pixel: ['"Press Start 2P"', 'cursive'],
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // New macOS-inspired grayscale colors
        'mac-light-gray': 'hsl(var(--mac-light-gray))',
        'mac-medium-gray': 'hsl(var(--mac-medium-gray))',
        'mac-darker-gray': 'hsl(var(--mac-darker-gray))',
        'mac-dark-gray': 'hsl(var(--mac-dark-gray))',
        'mac-black': 'hsl(var(--mac-black))',
        'mac-white': 'hsl(var(--mac-white))',
        // Apple-inspired colors
        'apple-blue': 'hsl(var(--apple-blue))',
        'apple-blue-dark': 'hsl(var(--apple-blue-dark))',
        'apple-rainbow': {
          red: 'hsl(var(--apple-rainbow-red))',
          orange: 'hsl(var(--apple-rainbow-orange))',
          yellow: 'hsl(var(--apple-rainbow-yellow))',
          green: 'hsl(var(--apple-rainbow-green))',
          blue: 'hsl(var(--apple-rainbow-blue))',
          purple: 'hsl(var(--apple-rainbow-purple))',
        },
        // Cream color variants for subtle warmth
        'cream': {
          25: '#fefdf9',
          50: '#fdf8f0',
          100: '#faf2e0',
          200: '#f5e6c8',
          300: '#edd5a3',
          400: '#e1bc6f',
          500: '#d4a043',
          600: '#c2892a',
          700: '#a06f21',
          800: '#845a20',
          900: '#6f4a1f',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;