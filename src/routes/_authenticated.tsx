import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for zustand persist hydration before deciding
    if (!hydrated) return;
    if (!user) {
      navigate({ to: "/auth" });
    } else {
      setReady(true);
    }
  }, [hydrated, user, navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass rounded-2xl px-6 py-4 text-sm text-muted-foreground">
          Loading your workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
