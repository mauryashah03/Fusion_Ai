import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { CATEGORIES, LIBRARY, type PromptCategory } from "@/lib/prompt-library";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Prompt Library — Veriq AI" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<PromptCategory | "All">("All");
  const [q, setQ] = useState("");

  const filtered = LIBRARY.filter(
    (p) => (active === "All" || p.category === active) &&
      (q === "" || (p.title + " " + p.prompt).toLowerCase().includes(q.toLowerCase())),
  );

  function pick(prompt: string) {
    // stash in chat store as a quick prompt seed via sessionStorage
    sessionStorage.setItem("threeminds-seed-prompt", prompt);
    navigate({ to: "/chat" });
  }

  return (
    <>
      <Topbar title="Prompt Library" subtitle="Curated prompts across every domain" />
      <div className="space-y-5 p-6">
        <div className="glass flex items-center gap-3 rounded-xl px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search prompts…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                active === c
                  ? "[background:var(--gradient-primary)] text-white shadow-md"
                  : "glass text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => pick(p.prompt)}
              className="glass group rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(124,58,237,0.6)]"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{p.category}</div>
              <h3 className="mt-2 font-semibold">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.prompt}</p>
              <div className="mt-4 text-xs text-muted-foreground group-hover:text-foreground">
                Use prompt →
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No prompts match your filters.</p>
          )}
        </div>
      </div>
    </>
  );
}

// helper to consume seed prompt in chat page
export function consumeSeedPrompt(): string | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem("threeminds-seed-prompt");
  if (v) sessionStorage.removeItem("threeminds-seed-prompt");
  return v;
}
