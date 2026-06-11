import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { useChat } from "@/lib/chat-store";
import { MODELS } from "@/lib/ai-models";
import { Search, Bookmark, BookmarkCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — Three Minds AI" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const history = useChat((s) => s.history);
  const toggle = useChat((s) => s.toggleSaved);
  const remove = useChat((s) => s.removeRecord);
  const [q, setQ] = useState("");
  const [model, setModel] = useState<string>("all");

  const filtered = history.filter((h) => {
    if (q && !h.prompt.toLowerCase().includes(q.toLowerCase())) return false;
    if (model !== "all") {
      const winner = [...h.responses].sort((a, b) => b.finalScore - a.finalScore)[0];
      if (winner?.modelId !== model) return false;
    }
    return true;
  });

  return (
    <>
      <Topbar title="History" subtitle="Every comparison you've run" />
      <div className="space-y-4 p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="glass flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search prompts…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="glass rounded-xl bg-transparent px-4 py-2.5 text-sm outline-none"
          >
            <option value="all">All winners</option>
            {MODELS.filter((m) => m.enabled).map((m) => (
              <option key={m.id} value={m.id}>{m.name} wins</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            No history yet.
          </div>
        ) : (
          filtered.map((h) => {
            const winner = [...h.responses].sort((a, b) => b.finalScore - a.finalScore)[0];
            const wm = MODELS.find((m) => m.id === winner?.modelId)!;
            return (
              <div key={h.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</div>
                    <div className="mt-1 font-medium">{h.prompt}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggle(h.id)} className="rounded-md p-2 hover:bg-white/[0.06]" title={h.saved ? "Unsave" : "Save"}>
                      {h.saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => remove(h.id)} className="rounded-md p-2 text-muted-foreground hover:text-destructive hover:bg-white/[0.06]">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {h.responses.map((r) => {
                    const m = MODELS.find((mm) => mm.id === r.modelId)!;
                    const isWin = r.modelId === winner.modelId;
                    return (
                      <div key={r.modelId} className={"rounded-xl border px-3 py-2 text-xs " + (isWin ? "border-primary/50 bg-primary/5" : "border-white/5 bg-white/[0.02]")}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full" style={{ background: m.color }} />
                            <span className="font-medium">{m.name}</span>
                          </div>
                          <span className={"font-mono " + (isWin ? "gradient-text font-semibold" : "text-muted-foreground")}>{r.finalScore}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {h.merged && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-primary">View merged answer</summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-xs text-muted-foreground">{h.merged}</pre>
                  </details>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  Winner: <span className="inline-block h-2 w-2 rounded-full" style={{ background: wm.color }} /> <strong className="text-foreground">{wm.name}</strong>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
