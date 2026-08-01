import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { useChat } from "@/lib/chat-store";
import { MODELS } from "@/lib/ai-models";
import { Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved Chats — Veriq AI" }] }),
  component: SavedPage,
});

function SavedPage() {
  const historyAll = useChat((s) => s.history);
  const history = useMemo(() => historyAll.filter((h) => h.saved), [historyAll]);
  const toggle = useChat((s) => s.toggleSaved);
  const remove = useChat((s) => s.removeRecord);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // When arriving from a sidebar link like /saved#<id>, scroll to and
  // briefly highlight that chat.
  useEffect(() => {
    const id = window.location.hash?.slice(1);
    if (!id) return;
    const el = document.getElementById(`saved-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlighted(id);
      const t = setTimeout(() => setHighlighted(null), 2000);
      return () => clearTimeout(t);
    }
  }, [history.length]);

  return (
    <>
      <Topbar title="Saved Chats" subtitle="Your bookmarked comparisons" />
      <div className="space-y-3 p-6">
        {history.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Bookmark className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nothing saved yet. Star a comparison from <Link to="/history" className="text-primary">History</Link>.</p>
          </div>
        ) : (
          history.map((h) => (
            <div
              key={h.id}
              id={`saved-${h.id}`}
              className={cn(
                "glass flex items-start justify-between gap-3 rounded-2xl p-4 transition-shadow",
                highlighted === h.id && "ring-2 ring-primary/60",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</div>
                <div className="mt-1 font-medium">{h.prompt}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  {h.responses.map((r) => {
                    const m = MODELS.find((mm) => mm.id === r.modelId)!;
                    return (
                      <span key={r.modelId} className="rounded-full bg-white/[0.05] px-2 py-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: m.color }} /> {m.name} · {r.finalScore}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggle(h.id)} className="rounded-md p-2 text-primary hover:bg-white/[0.06]" title="Unsave">
                  <BookmarkCheck className="h-4 w-4" />
                </button>
                <button onClick={() => remove(h.id)} className="rounded-md p-2 text-muted-foreground hover:text-destructive hover:bg-white/[0.06]" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
