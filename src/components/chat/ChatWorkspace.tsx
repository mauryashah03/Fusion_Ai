import { useEffect, useRef, useState } from "react";
import { ACTIVE_MODELS, buildMergedAnswer, fetchLiveResponses, streamMockResponse, type ModelId, type ModelResponse, StreamController } from "@/lib/ai-models";
import { useChat } from "@/lib/chat-store";
import { useShareChat } from "@/lib/share-store";
import { PromptInput } from "./PromptInput";
import { ResponsePanel } from "./ResponsePanel";
import { EvaluationMetrics } from "./EvaluationMetrics";
import { Scoreboard } from "./Scoreboard";
import { MergedAnswer } from "./MergedAnswer";
import { toast } from "sonner";

export function ChatWorkspace({ initialPrompt }: { initialPrompt?: string }) {
  const [prompt, setPrompt] = useState<string>("");
  const [streams, setStreams] = useState<Record<ModelId, string>>({} as Record<ModelId, string>);
  const [results, setResults] = useState<ModelResponse[]>([]);
  const [merged, setMerged] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [paused, setPaused] = useState(false);
  const addRecord = useChat((s) => s.addRecord);
  const setShareData = useShareChat((s) => s.setShareData);
  const controllerRef = useRef<StreamController | null>(null);

  async function run(p: string, mode: "compare" | "merge") {
    setPrompt(p);
    setStreams({} as Record<ModelId, string>);
    setResults([]);
    setMerged("");
    setBusy(true);
    setPaused(false);
    setShareData({ prompt: "", responses: [], merged: undefined });

    const controller = new StreamController();
    controllerRef.current = controller;

    try {
      const { responses, merged: backendMerged } = await fetchLiveResponses(p, (modelId, partial) => {
        setStreams((s) => ({ ...s, [modelId]: partial }));
      });

      setResults(responses);
      const mergedText = mode === "merge" ? (backendMerged || buildMergedAnswer(p, responses)) : backendMerged || "";
      if (mergedText) {
        setMerged(mergedText);
      }

      addRecord({
        id: "c-" + Date.now(),
        prompt: p,
        createdAt: Date.now(),
        responses,
        merged: mergedText || undefined,
      });
    } catch (error) {
      console.error(error);
      try {
        const fallback = await Promise.all(
          ACTIVE_MODELS.map((m) =>
            streamMockResponse(m.id, p, (partial) => {
              setStreams((s) => ({ ...s, [m.id]: partial }));
            }),
          ),
        );
        setResults(fallback);
        if (mode === "merge") {
          setMerged(buildMergedAnswer(p, fallback));
        }
        addRecord({
          id: "c-" + Date.now(),
          prompt: p,
          createdAt: Date.now(),
          responses: fallback,
          merged: mode === "merge" ? buildMergedAnswer(p, fallback) : undefined,
        });
      } catch {
        toast.error("The backend is unavailable right now. Please try again shortly.");
      }
    } finally {
      setBusy(false);
      setPaused(false);
      controllerRef.current = null;
    }
  }

  // Toggles between pausing the in-flight streams and resuming them
  // exactly where they left off.
  function toggleStop() {
    const controller = controllerRef.current;
    if (!controller) return;

    if (paused) {
      controller.resume();
      setPaused(false);
    } else {
      controller.pause();
      setPaused(true);
    }
  }

  useEffect(() => {
    const seed = typeof window !== "undefined" ? sessionStorage.getItem("threeminds-seed-prompt") : null;
    if (seed) {
      sessionStorage.removeItem("threeminds-seed-prompt");
      run(seed, "compare");
    } else if (initialPrompt) {
      run(initialPrompt, "compare");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const winnerId = results.length
    ? [...results].sort((a, b) => b.finalScore - a.finalScore)[0].modelId
    : null;

  return (
    <div className="flex flex-col gap-5">

      {/* Empty state or results in scrollable area */}
      <div className="flex-1">
        {prompt && (
          <div className="glass flex items-start gap-3 rounded-xl px-4 py-3 mb-5">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/10 text-xs font-semibold">You</div>
            <p className="text-sm leading-relaxed">{prompt}</p>
          </div>
        )}

        {(busy || results.length > 0) && (
          <div className="grid gap-4 lg:grid-cols-3 mb-5">
            {ACTIVE_MODELS.map((m) => (
              <ResponsePanel
                key={m.id}
                modelId={m.id}
                streamingText={streams[m.id] ?? ""}
                result={results.find((r) => r.modelId === m.id)}
                isWinner={winnerId === m.id && results.length > 0}
              />
            ))}
          </div>
        )}

        {results.length > 0 && (
          <>
            <EvaluationMetrics responses={results} />
            <Scoreboard responses={results} />
            {merged && <MergedAnswer text={merged} />}
            {!merged && (
              <div className="glass flex items-center justify-between rounded-2xl p-4 text-sm mt-5">
                <span className="text-muted-foreground">Want a single, synthesized answer combining the best of all three?</span>
                <button
                  onClick={() => {
                    const mergedText = buildMergedAnswer(prompt, results);
                    setMerged(mergedText);
                    setShareData({ prompt, responses: results, merged: mergedText });
                  }}
                  className="rounded-lg [background:var(--gradient-primary)] px-4 py-2 text-sm font-medium text-white shadow-md transition-transform hover:-translate-y-0.5"
                >
                  Generate Merged Answer
                </button>
              </div>
            )}
          </>
        )}

        {!prompt && !busy && !results.length && (
          <EmptyState onPick={(p) => run(p, "compare")} />
        )}
      </div>

      {/* Prompt bar always at bottom */}
      <PromptInput busy={busy} paused={paused} onSubmit={run} onToggleStop={toggleStop} />

    </div>
  );
}

const SUGGESTIONS = [
  "How can AI improve healthcare?",
  "Compare React, Vue, and Svelte for an enterprise dashboard.",
  "Draft a one-page investor memo for an AI startup.",
  "Explain quantum entanglement to a curious teenager.",
];

function EmptyState({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="glass rounded-2xl p-8 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl [background:var(--gradient-primary)] glow">
        <span className="font-display text-lg font-bold text-white">3M</span>
      </div>
      <h3 className="font-display text-xl font-semibold">Ask once. Get three minds.</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try a starter prompt or write your own above.
      </p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.06]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}