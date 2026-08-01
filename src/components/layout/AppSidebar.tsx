import { useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-store";
import { useChat } from "@/lib/chat-store";
import {
  MessageSquarePlus, LayoutDashboard, Library,
  BarChart3, Settings, LogOut, Crown, Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/chat", label: "New Chat", icon: MessageSquarePlus },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/library", label: "Prompt Library", icon: Library },
  { to: "/history", label: "History", icon: MessageSquarePlus },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

type Props = {
  collapsed?: boolean;
  width?: number;
};

export function AppSidebar({ collapsed = false }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  const history = useChat((s) => s.history);
  const savedChats = useMemo(
    () => [...history].filter((h) => h.saved).sort((a, b) => b.createdAt - a.createdAt),
    [history],
  );

  return (
    <aside className="flex h-screen w-full flex-col border-r border-white/5 bg-sidebar/60 backdrop-blur-xl">

      {/* Logo */}
      <div className={cn("flex items-center border-b border-white/5 shrink-0", collapsed ? "justify-center px-0 py-4" : "px-4 py-4")}>
        <Link to="/dashboard">
          {collapsed ? (
            <div className="grid h-8 w-8 place-items-center rounded-xl [background:var(--gradient-primary)] text-xs font-bold text-white">
              3M
            </div>
          ) : (
            <Logo />
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3 min-h-0">
        {nav.map((n) => {
          const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
          return (
            <Link
              key={n.to}
              to={n.to}
              title={collapsed ? n.label : undefined}
              className={cn(
                "group flex items-center rounded-lg transition-all",
                collapsed ? "justify-center px-0 py-2.5" : "gap-2 px-2.5 py-2",
                active
                  ? "bg-white/[0.06] text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              <n.icon className={cn("h-4 w-4 shrink-0 transition-colors", active && "text-primary")} />
              {!collapsed && (
                <>
                  <span className="text-xs">{n.label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Saved Chats */}
      <div className="shrink-0 border-t border-white/5 px-2 py-3">
        {!collapsed && (
          <div className="mb-1.5 flex items-center gap-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Bookmark className="h-3 w-3" />
            Saved Chats
            {savedChats.length > 0 && (
              <span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] normal-case tracking-normal">
                {savedChats.length}
              </span>
            )}
          </div>
        )}

        {collapsed ? (
          <Link
            to="/saved"
            title={
              savedChats.length > 0
                ? `${savedChats.length} saved chat${savedChats.length === 1 ? "" : "s"}`
                : "Saved chats"
            }
            className={cn(
              "flex justify-center rounded-lg py-2 transition-colors hover:bg-white/[0.04]",
              pathname.startsWith("/saved") ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Bookmark className="h-4 w-4" />
          </Link>
        ) : savedChats.length === 0 ? (
          <p className="px-2.5 py-1.5 text-[11px] text-muted-foreground">
            Nothing saved yet. Star a chat from History.
          </p>
        ) : (
          <div className="max-h-40 space-y-0.5 overflow-y-auto">
            {savedChats.slice(0, 8).map((h) => (
              <Link
                key={h.id}
                to="/saved"
                hash={h.id}
                title={h.prompt}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                <span className="truncate">{h.prompt}</span>
              </Link>
            ))}
            {savedChats.length > 8 && (
              <Link
                to="/saved"
                className="block px-2.5 py-1 text-[11px] text-primary hover:underline"
              >
                View all {savedChats.length}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* User + Sign out — always pinned at bottom */}
      <div className="shrink-0 border-t border-white/5 p-2">
        {collapsed ? (
          <>
            <div title={user?.name} className="mb-1 flex justify-center">
              <div className="grid h-7 w-7 place-items-center rounded-full [background:var(--gradient-primary)] text-xs font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="flex w-full justify-center rounded-lg px-0 py-1.5 text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="glass mb-2 flex items-center gap-2 rounded-xl p-2">
              <div className="grid h-7 w-7 place-items-center rounded-full [background:var(--gradient-primary)] text-xs font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{user?.name}</div>
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
                  <Crown className="h-3 w-3 text-primary" />
                  {user?.plan ?? "free"} plan
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}