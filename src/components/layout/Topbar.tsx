import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";
import { Moon, Sun } from "lucide-react";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = useAuth((s) => s.user);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 bg-transparent px-5 py-2.5 backdrop-blur-md">
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground">Veriq · Workspace</div>
        <h1 className="font-display truncate text-base font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Theme toggle — CSS vars adapt to both light and dark */}
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

        {/* User info */}
        <div className="hidden text-right md:block">
          <div className="text-xs font-medium">{user?.name}</div>
          <div className="text-[10px] text-muted-foreground">{user?.email}</div>
        </div>
        <div
          className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold shadow-md"
          style={{
            background: "var(--gradient-primary)",
            color: "var(--primary-foreground)",
          }}
        >
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}