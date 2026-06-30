import { Link } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";

export function LandingNav() {
  const user = useAuth((s) => s.user);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-2.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]">
          <Link to="/"><Logo /></Link>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#models" className="hover:text-foreground transition-colors">Models</a>
          </nav>

          <div className="flex items-center gap-2">

            {/* Theme toggle — uses CSS vars so it adapts to both light and dark */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="grid h-8 w-8 place-items-center rounded-full transition-all"
              style={{
                border: "1px solid var(--border)",
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {user ? (
              <Button variant="hero" size="sm" asChild>
                <Link to="/dashboard">Open app</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}