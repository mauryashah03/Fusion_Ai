import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-store";
import {
  MessageSquarePlus, LayoutDashboard, GitCompare, Library,
  Bookmark, BarChart3, Settings, LogOut, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/chat", label: "New Chat", icon: MessageSquarePlus },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/compare", label: "AI Compare", icon: GitCompare },
  { to: "/library", label: "Prompt Library", icon: Library },
  { to: "/saved", label: "Saved Chats", icon: Bookmark },
  { to: "/history", label: "History", icon: MessageSquarePlus },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-sidebar/60 backdrop-blur-xl md:flex">
      <div className="px-5 py-5">
        <Link to="/dashboard"><Logo /></Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-white/[0.06] text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              <n.icon className={cn("h-4 w-4 transition-colors", active && "text-primary")} />
              <span>{n.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="glass mb-2 flex items-center gap-3 rounded-xl p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full [background:var(--gradient-primary)] text-sm font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.name}</div>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Crown className="h-3 w-3 text-primary" />
              {user?.plan ?? "free"} plan
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
