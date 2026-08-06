import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ResponsePanel } from "@/components/chat/ResponsePanel";
import { EvaluationMetrics } from "@/components/chat/EvaluationMetrics";
import { Scoreboard } from "@/components/chat/Scoreboard";
import { MergedAnswer } from "@/components/chat/MergedAnswer";
import { ACTIVE_MODELS } from "@/lib/ai-models";
import { resolveSharedChat, type SharedChatPayload } from "@/lib/share-link";

export const Route = createFileRoute("/share/$shareTd")({
  head: () => ({ meta: [{ title: "Shared Chat — Veriq AI" }] }),
  validateSearch: (search: Record<string, unknown>): { d?: string } => ({
    d: typeof search.d === "string" ? search.d : undefined,
  }),
  component: SharedChatPage,
});

function SharedChatPage() {
  const { shareId } = Route.useParams();
  const search = Route.useSearch();
  const [data, setData] = useState<SharedChatPayload | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    resolveSharedChat(shareId, search.d).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [shareId, search.d]);

  const winnerId = data?.responses.length
    ? [...data.responses].sort((a, b) => b.finalScore - a.finalScore)[0].modelId
    : null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 bg-transparent px-5 py-3 backdrop-blur-md">
        <Logo />
        <Link
          to="/chat"
          className="rounded-lg [background:var(--gradient-primary)] px-4 py-2 text-xs font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
        >
          Start your own chat
        </Link>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {data === undefined && (
          <div className="glass flex items-center justify-center gap-2 rounded-2xl p-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading shared chat…
          </div>
        )}

        {data === null && (
          <div className="glass rounded-2xl p-10 text-center">
            <h1 className="font-display text-xl font-semibold">Chat not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This link may be broken, expired, or copied incorrectly.
            </p>
            <Link
              to="/chat"
              className="mt-6 inline-block rounded-lg [background:var(--gradient-primary)] px-4 py-2 text-sm font-medium text-white"
            >
              Go start a new chat
            </Link>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-5">
            <div className="glass flex items-start gap-3 rounded-xl px-4 py-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/10 text-xs font-semibold">
                You
              </div>
              <p className="text-sm leading-relaxed">{data.prompt}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {ACTIVE_MODELS.map((m) => (
                <ResponsePanel
                  key={m.id}
                  modelId={m.id}
                  streamingText=""
                  result={data.responses.find((r) => r.modelId === m.id)}
                  isWinner={winnerId === m.id}
                />
              ))}
            </div>

            <EvaluationMetrics responses={data.responses} />
            <Scoreboard responses={data.responses} />
            {data.merged && <MergedAnswer text={data.merged} />}
          </div>
        )}
      </div>
    </div>
  );
}