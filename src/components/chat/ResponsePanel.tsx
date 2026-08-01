import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
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
      {/* Header */}
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
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {model.provider}
            </div>
          </div>
        </div>
        {!done ? (
          <span
            className="inline-flex h-2 w-2 animate-pulse rounded-full"
            style={{ background: model.color }}
          />
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            done
          </span>
        )}
      </div>

      {/* Response text — capped height with scroll so score never overlaps */}
      <div className="prose prose-invert prose-sm flex-1 min-h-[180px] max-h-[260px] max-w-none overflow-y-auto pr-1 text-sm leading-relaxed pb-2">
        {text ? (
          <div className="
            prose prose-sm prose-invert max-w-none
            text-sm leading-relaxed

            [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3
            [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-white/90
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-white/80

            [&_p]:mb-2 [&_p]:text-white/80 [&_p]:leading-relaxed

            [&_strong]:text-white [&_strong]:font-semibold
            [&_em]:text-white/70 [&_em]:italic

            [&_ul]:mb-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:text-white/75
            [&_ol]:mb-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:text-white/75
            [&_li]:mb-0.5 [&_li]:leading-snug

            [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_table]:mb-3
            [&_thead]:bg-white/10
            [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-white/90 [&_th]:border [&_th]:border-white/10
            [&_td]:px-2 [&_td]:py-1.5 [&_td]:text-white/70 [&_td]:border [&_td]:border-white/10
            [&_tr:nth-child(even)]:bg-white/[0.03]

            [&_code]:bg-white/10 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_code]:text-emerald-300 [&_code]:font-mono
            [&_pre]:bg-black/40 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:mb-3 [&_pre]:border [&_pre]:border-white/10
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-xs [&_pre_code]:text-emerald-300

            [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_blockquote]:text-white/60 [&_blockquote]:italic [&_blockquote]:mb-2

            [&_hr]:border-white/10 [&_hr]:my-3

            [&_a]:text-violet-400 [&_a]:underline [&_a]:underline-offset-2

            [&_.katex]:text-white/90
            [&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto
          ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {text}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className="h-3 w-5/6 rounded animate-pulse bg-white/5" />
            <div className="h-3 w-4/6 rounded animate-pulse bg-white/5" />
            <div className="h-3 w-3/6 rounded animate-pulse bg-white/5" />
            <div className="h-3 w-4/5 rounded animate-pulse bg-white/5" />
            <div className="h-3 w-2/3 rounded animate-pulse bg-white/5" />
          </div>
        )}
        {!done && text && (
          <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-primary align-middle" />
        )}
      </div>

      {/* Score / stats row — always below text, never overlapping */}
      {result && (
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-xs">
          <Stat label="Tokens" value={result.tokens.toString()} />
          <Stat label="Speed" value={`${(result.speedMs / 1000).toFixed(1)}s`} />
          <Stat label="Score" value={`${result.finalScore}/100`} accent />
        </div>
      )}
    </motion.div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-3">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={
          "font-mono text-sm font-semibold leading-snug " +
          (accent ? "gradient-text" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}