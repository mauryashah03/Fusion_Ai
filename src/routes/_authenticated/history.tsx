import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { useChat } from "@/lib/chat-store";
import { MODELS } from "@/lib/ai-models";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      {
        title: "History — Veriq AI",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const history = useChat((state) => state.history);
  const toggleSaved = useChat((state) => state.toggleSaved);
  const removeRecord = useChat((state) => state.removeRecord);

  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (!item) return false;

      const responses = (item.responses ?? []).filter(Boolean);

      if (responses.length === 0) return false;

      if (
        query &&
        !(item.prompt ?? "")
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        return false;
      }

      if (selectedModel !== "all") {
        const winner = [...responses].sort(
          (a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0)
        )[0];

        if (!winner || winner.modelId !== selectedModel) {
          return false;
        }
      }

      return true;
    });
  }, [history, query, selectedModel]);

  return (
    <>
      <Topbar
        title="History"
        subtitle="Every comparison you've run"
      />

      <div className="space-y-4 p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="glass flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search prompts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="glass rounded-xl bg-transparent px-4 py-2.5 text-sm outline-none"
          >
            <option value="all">All winners</option>

            {MODELS.filter((m) => m.enabled).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} wins
              </option>
            ))}
          </select>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            No history found.
          </div>
        ) : (
          filteredHistory.map((item) => {
            const responses = (item.responses ?? []).filter(Boolean);

            const sortedResponses = [...responses].sort(
              (a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0)
            );

            const winner = sortedResponses[0];

            if (!winner) return null;

            const winnerModel = MODELS.find(
              (m) => m.id === winner.modelId
            );

            if (!winnerModel) return null;

            return (
              <div
                key={item.id}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Unknown date"}
                    </div>

                    <div className="mt-1 font-medium">
                      {item.prompt || "No prompt"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleSaved(item.id)}
                      title={item.saved ? "Unsave" : "Save"}
                      className="rounded-md p-2 hover:bg-white/10"
                    >
                      {item.saved ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    <button
                      type="button"
                      title="Delete"
                      onClick={() => removeRecord(item.id)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-white/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-3">
                  {responses.map((response, index) => {
                    if (!response?.modelId) return null;

                    const model = MODELS.find(
                      (m) => m.id === response.modelId
                    );

                    if (!model) return null;

                    const isWinner =
                      response.modelId === winner.modelId;

                    return (
                      <div
                        key={`${response.modelId}-${index}`}
                        className={`rounded-xl border px-3 py-2 text-xs ${
                          isWinner
                            ? "border-primary/50 bg-primary/5"
                            : "border-white/5 bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{
                                background: model.color,
                              }}
                            />

                            <span className="font-medium">
                              {model.name}
                            </span>
                          </div>

                          <span
                            className={
                              isWinner
                                ? "gradient-text font-mono font-semibold"
                                : "font-mono text-muted-foreground"
                            }
                          >
                            {response.finalScore ?? 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {item.merged && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-primary">
                      View merged answer
                    </summary>

                    <p className="mt-2 whitespace-pre-wrap rounded-lg bg-black/30 p-3 font-mono text-xs text-muted-foreground">
                      {item.merged}
                    </p>
                  </details>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  Winner

                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      background: winnerModel.color,
                    }}
                  />

                  <strong className="text-foreground">
                    {winnerModel.name}
                  </strong>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}