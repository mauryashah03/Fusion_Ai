import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { ModelAvatar } from "./ModelAvatar";
import { MODELS, type ModelId, type ModelResponse } from "@/lib/ai-models";

type Props = {
  modelId: ModelId;
  streamingText: string;
  result?: ModelResponse;
  isWinner?: boolean;
};

export function ResponsePanel({ modelId, streamingText, result, isWinner }: Props) {
  const model = MODELS.find((m) => m.id === modelId)!;
  const text = result?.text ?? streamingText;
  const done = Boolean(result);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        "relative flex h-full flex-col rounded-2xl border p-4 transition-shadow " +
        (isWinner
          ? "gradient-border shadow-[0_20px_60px_-30px_rgba(124,58,237,0.7)]"
          : "glass border-transparent")
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ModelAvatar id={modelId} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{model.name}</span>
              {isWinner && (
                <span className="rounded-full [background:var(--gradient-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                  🏆 Best
                </span>
              )}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{model.provider}</div>
          </div>
        </div>
        {!done ? (
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full" style={{ background: model.color }} />
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            done
          </span>
        )}
      </div>

      <div className="prose prose-invert prose-sm flex-1 min-h-[180px] max-w-none overflow-y-auto pr-1 text-sm leading-relaxed">
        {text ? (
          <ReactMarkdown>{text}</ReactMarkdown>
        ) : (
          <div className="space-y-2">
            <div className="h-3 w-5/6 rounded shimmer bg-white/5" />
            <div className="h-3 w-4/6 rounded shimmer bg-white/5" />
            <div className="h-3 w-3/6 rounded shimmer bg-white/5" />
          </div>
        )}
        {!done && text && (
          <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-primary align-middle" />
        )}
      </div>

      {result && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-xs">
          <Stat label="Tokens" value={result.tokens.toString()} />
          <Stat label="Speed" value={`${(result.speedMs / 1000).toFixed(1)}s`} />
          <Stat label="Score" value={`${result.finalScore}`} accent />
        </div>
      )}
    </motion.div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={"font-mono text-sm font-semibold " + (accent ? "gradient-text" : "")}>{value}</div>
    </div>
  );
}
