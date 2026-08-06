import { type ModelId } from "@/lib/ai-models";

const LABELS: Record<ModelId, string> = {
  "Gpt": "G",
  Gemini: "C",
  "Llama3": "✦",
  deepseek: "D",
  grok: "X",
  mistral: "M",
  "Veriq Logic": "L",
  perplexity: "P",
};

const COLORS: Record<ModelId, string> = {
  "Gpt": "var(--veriq-think)",
  Gemini: "var(--Gemini)",
  "Llama3": "var(--veriq-vision)",
  deepseek: "var(--cyan)",
  grok: "var(--violet)",
  mistral: "var(--indigo)",
  "Veriq Logic": "var(--accent)",
  perplexity: "var(--veriq-vision)",
};

export function ModelAvatar({ id, size = 32 }: { id: ModelId; size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-lg font-bold text-white shadow-md"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${COLORS[id]}, color-mix(in oklch, ${COLORS[id]} 60%, black))`,
        fontSize: size * 0.42,
      }}
    >
      {LABELS[id]}
    </div>
  );
}