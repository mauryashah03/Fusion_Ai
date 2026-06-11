import { useAuth } from "@/lib/auth-store";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = useAuth((s) => s.user);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 bg-background/60 px-5 py-3 backdrop-blur-xl">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">Three Minds AI · Workspace</div>
        <h1 className="font-display truncate text-lg font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right md:block">
          <div className="text-sm font-medium">{user?.name}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full [background:var(--gradient-primary)] text-sm font-semibold text-white shadow-md">
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
