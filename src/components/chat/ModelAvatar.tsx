import { type ModelId } from "@/lib/ai-models";

const LABELS: Record<ModelId, string> = {
  gpt: "G", claude: "C", gemini: "✦",
  deepseek: "D", grok: "X", mistral: "M", llama: "L", perplexity: "P",
};
const COLORS: Record<ModelId, string> = {
  gpt: "var(--gpt)", claude: "var(--claude)", gemini: "var(--gemini)",
  deepseek: "var(--cyan)", grok: "var(--violet)", mistral: "var(--indigo)",
  llama: "var(--accent)", perplexity: "var(--gemini)",
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
