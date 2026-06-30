import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === "dark" ? "light" : "dark";
          applyTheme(next);
          return { theme: next };
        }),
    }),
    {
      name: "threeminds-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
      },
    },
  ),
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  if (theme === "light") {
    // ── WARM IVORY LIGHT ──────────────────────────────────────────
    root.style.setProperty("--background", "#f7f4ef");
    root.style.setProperty("--foreground", "#1a1208");

    root.style.setProperty("--card", "#fefdf9");
    root.style.setProperty("--card-foreground", "#1a1208");

    root.style.setProperty("--popover", "#fefdf9");
    root.style.setProperty("--popover-foreground", "#1a1208");

    root.style.setProperty("--primary", "#1a1208");
    root.style.setProperty("--primary-foreground", "#fefdf9");

    root.style.setProperty("--secondary", "#ede8df");
    root.style.setProperty("--secondary-foreground", "#1a1208");

    root.style.setProperty("--muted", "#ede8df");
    root.style.setProperty("--muted-foreground", "#8a7d6b");

    root.style.setProperty("--accent", "#1a1208");
    root.style.setProperty("--accent-foreground", "#fefdf9");

    root.style.setProperty("--destructive", "oklch(0.6 0.22 27)");
    root.style.setProperty("--destructive-foreground", "#ffffff");

    root.style.setProperty("--border", "rgba(26, 18, 8, 0.10)");
    root.style.setProperty("--input", "rgba(26, 18, 8, 0.06)");
    root.style.setProperty("--ring", "#1a1208");

    root.style.setProperty("--sidebar", "#fefdf9");
    root.style.setProperty("--sidebar-foreground", "#1a1208");
    root.style.setProperty("--sidebar-primary", "#1a1208");
    root.style.setProperty("--sidebar-primary-foreground", "#fefdf9");
    root.style.setProperty("--sidebar-accent", "#f0ece4");
    root.style.setProperty("--sidebar-accent-foreground", "#1a1208");
    root.style.setProperty("--sidebar-border", "rgba(26, 18, 8, 0.08)");

    root.style.setProperty("--gradient-primary", "linear-gradient(135deg, #1a1208 0%, #3d3020 50%, #2a2010 100%)");
    root.style.setProperty("--gradient-soft", "linear-gradient(135deg, rgba(26,18,8,0.08) 0%, rgba(61,48,32,0.05) 100%)");

    root.style.setProperty("--glass-bg", "rgba(254, 253, 249, 0.82)");
    root.style.setProperty("--glass-border", "rgba(26, 18, 8, 0.10)");
    root.style.setProperty("--glass-blur", "18px");

    root.style.setProperty("--shadow-glow", "0 0 60px -10px rgba(26, 18, 8, 0.18)");
    root.style.setProperty("--shadow-card", "0 10px 40px -20px rgba(26, 18, 8, 0.12)");

    document.body.style.backgroundColor = "#f7f4ef";
    document.body.style.backgroundImage =
      "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(26,18,8,0.04), transparent), " +
      "radial-gradient(ellipse 60% 50% at 100% 30%, rgba(42,32,16,0.03), transparent), " +
      "radial-gradient(ellipse 60% 50% at 0% 60%, rgba(61,48,32,0.03), transparent)";

  } else {
    // ── TRUE CHARCOAL DARK ────────────────────────────────────────
    root.style.setProperty("--background", "#111111");
    root.style.setProperty("--foreground", "#f5f5f0");

    root.style.setProperty("--card", "#1a1a1a");
    root.style.setProperty("--card-foreground", "#f5f5f0");

    root.style.setProperty("--popover", "#1a1a1a");
    root.style.setProperty("--popover-foreground", "#f5f5f0");

    root.style.setProperty("--primary", "#f5f5f0");
    root.style.setProperty("--primary-foreground", "#111111");

    root.style.setProperty("--secondary", "#242424");
    root.style.setProperty("--secondary-foreground", "#f5f5f0");

    root.style.setProperty("--muted", "#1e1e1e");
    root.style.setProperty("--muted-foreground", "#888880");

    root.style.setProperty("--accent", "#f5f5f0");
    root.style.setProperty("--accent-foreground", "#111111");

    root.style.setProperty("--destructive", "oklch(0.65 0.24 27)");
    root.style.setProperty("--destructive-foreground", "#ffffff");

    root.style.setProperty("--border", "rgba(245, 245, 240, 0.10)");
    root.style.setProperty("--input", "rgba(245, 245, 240, 0.07)");
    root.style.setProperty("--ring", "#f5f5f0");

    root.style.setProperty("--sidebar", "#0d0d0d");
    root.style.setProperty("--sidebar-foreground", "#f5f5f0");
    root.style.setProperty("--sidebar-primary", "#f5f5f0");
    root.style.setProperty("--sidebar-primary-foreground", "#111111");
    root.style.setProperty("--sidebar-accent", "#1a1a1a");
    root.style.setProperty("--sidebar-accent-foreground", "#888880");
    root.style.setProperty("--sidebar-border", "rgba(245, 245, 240, 0.08)");

    root.style.setProperty("--gradient-primary", "linear-gradient(135deg, #f5f5f0 0%, #d0d0c8 50%, #e8e8e0 100%)");
    root.style.setProperty("--gradient-soft", "linear-gradient(135deg, rgba(245,245,240,0.08) 0%, rgba(208,208,200,0.05) 100%)");

    root.style.setProperty("--glass-bg", "rgba(26, 26, 26, 0.88)");
    root.style.setProperty("--glass-border", "rgba(245, 245, 240, 0.10)");
    root.style.setProperty("--glass-blur", "18px");

    root.style.setProperty("--shadow-glow", "0 0 60px -10px rgba(245, 245, 240, 0.12)");
    root.style.setProperty("--shadow-card", "0 10px 40px -20px rgba(0, 0, 0, 0.60)");

    document.body.style.backgroundColor = "#111111";
    document.body.style.backgroundImage = "none";
  }
}