import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/lib/auth-store";


export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

const COLLAPSED_WIDTH = 56;
const MIN_WIDTH = 56;
const MAX_WIDTH = 280;
const SNAP_THRESHOLD = 80;

function AuthedLayout() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const [ready, setReady] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(208);
  const [isResizing, setIsResizing] = useState(false);

  const isCollapsed = sidebarWidth <= COLLAPSED_WIDTH + 10;

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      navigate({ to: "/auth" });
    } else {
      setReady(true);
    }
  }, [hydrated, user, navigate]);

  useEffect(() => {
    if (!isResizing) return;

    // Lock cursor + prevent text selection while dragging
    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onMouseMove(e: MouseEvent) {
      const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
      setSidebarWidth(newWidth < SNAP_THRESHOLD ? COLLAPSED_WIDTH : newWidth);
    }

    function onMouseUp() {
      setIsResizing(false);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
    };
  }, [isResizing]);

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
    <div className="relative flex h-screen overflow-hidden">
      
      

      {/* Sidebar */}
      <div
        style={{ width: sidebarWidth }}
        className={`relative z-20 h-screen shrink-0 ${
          isResizing ? "" : "transition-[width] duration-150"
        }`}
      >
        <AppSidebar collapsed={isCollapsed} width={sidebarWidth} />

        {/* Drag Handle */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          className="absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize group"
          title="Drag to resize"
        >
          <div
            className={`h-full w-1 transition-colors ${
              isResizing
                ? "bg-primary/60"
                : "bg-transparent group-hover:bg-primary/40"
            }`}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-w-0 flex-1 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}