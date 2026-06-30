import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ACTIVE_MODELS, streamMockResponse, type ModelId } from "@/lib/ai-models";
import { ModelAvatar } from "@/components/chat/ModelAvatar";

const SAMPLE_PROMPT = "How can AI improve healthcare?";

export function HeroDemo() {
  const [texts, setTexts] = useState<Record<ModelId, string>>({
    gpt: "", claude: "", gemini: "",
    deepseek: "", grok: "", mistral: "", llama: "", perplexity: "",
  });
  const [key, setKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setTexts({ gpt: "", claude: "", gemini: "", deepseek: "", grok: "", mistral: "", llama: "", perplexity: "" });

    ACTIVE_MODELS.forEach((m) => {
      streamMockResponse(m.id, SAMPLE_PROMPT, (partial) => {
        if (cancelled) return;
        setTexts((t) => ({ ...t, [m.id]: partial }));
      });
    });

    const loop = setTimeout(() => setKey((k) => k + 1), 14000);
    return () => { cancelled = true; clearTimeout(loop); };
  }, [key]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="glass-strong relative overflow-hidden rounded-3xl p-4 md:p-6 shadow-[0_30px_120px_-30px_rgba(124,58,237,0.5)]"
    >
      {/* 1. Translucent Top Prompt Bar */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
        <div className="grid h-7 w-7 place-items-center rounded-md [background:var(--gradient-primary)] text-xs font-bold text-white">3M</div>
        <div className="text-sm">
          <span className="text-foreground font-medium">{SAMPLE_PROMPT}</span>
        </div>
        <span className="ml-auto inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      </div>

      {/* 2. Columns Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {ACTIVE_MODELS.map((m, i) => (
          <div 
            key={m.id} 
            className="glass relative flex h-80 flex-col rounded-2xl p-4 transition-all hover:border-white/20"
          >
            {/* Model Identity Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ModelAvatar id={m.id} />
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.provider}</div>
                </div>
              </div>
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full" style={{ background: m.color }} />
            </div>

            {/* AI Streaming Output Text Layer */}
            <div className="flex-1 overflow-hidden whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground relative pb-12 text-fade-bottom">
              {texts[m.id]}
              {texts[m.id] && <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-primary align-middle" />}
            </div>

            {/* High-Contrast Dark Pill Badge Layout */}
            <div className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-zinc-900 px-3 py-1 flex gap-2 items-center shadow-2xl z-10">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
                Score
              </span>
              <span className="font-mono text-xs font-extrabold" style={{ color: m.color }}>
                {[94, 91, 89][i]}/100
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}