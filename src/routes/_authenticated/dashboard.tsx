import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Link } from "@tanstack/react-router";
import { useChat } from "@/lib/chat-store";
import { motion } from "framer-motion";
import { MessageSquarePlus, GitCompare, Sparkles, TrendingUp, Trophy, Library } from "lucide-react";
import { MODELS } from "@/lib/ai-models";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Three Minds AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const history = useChat((s) => s.history);
  const total = history.length;
  const merged = history.filter((h) => h.merged).length;
  const avgScore =
    total === 0
      ? 0
      : Math.round(
          history.reduce(
            (acc, r) => acc + r.responses.reduce((a, b) => a + b.finalScore, 0) / Math.max(r.responses.length, 1),
            0,
          ) / total,
        );

  return (
    <>
      <Topbar title="Dashboard" subtitle="Your multi-model workspace at a glance" />
      <div className="space-y-6 p-6">
        {/* Hero CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-border relative overflow-hidden rounded-3xl p-8"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ready when you are</p>
              <h2 className="font-display mt-1 text-3xl font-bold">Start a new comparison</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask once. Watch GPT, Claude, and Gemini answer in parallel.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/chat" className="inline-flex items-center gap-2 rounded-xl [background:var(--gradient-primary)] px-5 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:-translate-y-0.5">
                <MessageSquarePlus className="h-4 w-4" /> New Chat
              </Link>
              <Link to="/library" className="glass inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium">
                <Library className="h-4 w-4" /> Browse Prompts
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total comparisons" value={total} icon={GitCompare} />
          <StatCard label="Merged answers" value={merged} icon={Sparkles} />
          <StatCard label="Avg. winning score" value={avgScore || "—"} icon={Trophy} accent />
          <StatCard label="Models active" value={MODELS.filter((m) => m.enabled).length} icon={TrendingUp} />
        </div>

        {/* Recent + Models */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="glass rounded-2xl p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Recent comparisons</h3>
              <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comparisons yet. <Link to="/chat" className="text-primary">Start your first one →</Link></p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 6).map((h) => {
                  const winner = [...h.responses].sort((a, b) => b.finalScore - a.finalScore)[0];
                  const wm = MODELS.find((m) => m.id === winner?.modelId);
                  return (
                    <Link
                      key={h.id}
                      to="/history"
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="min-w-0 flex-1 truncate pr-3">{h.prompt}</span>
                      <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: wm?.color }} />
                        {wm?.name} · <span className="gradient-text font-mono">{winner?.finalScore}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 font-semibold">Models</h3>
            <div className="space-y-2">
              {MODELS.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: m.color }} />
                    <span>{m.name}</span>
                  </div>
                  <span className={"text-[10px] uppercase tracking-wider " + (m.enabled ? "text-emerald-400" : "text-muted-foreground")}>
                    {m.enabled ? "active" : "soon"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className={"mt-2 font-display text-3xl font-bold " + (accent ? "gradient-text" : "")}>{value}</div>
    </div>
  );
}
