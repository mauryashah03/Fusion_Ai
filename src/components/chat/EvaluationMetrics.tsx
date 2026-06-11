import { motion } from "framer-motion";
import { MODELS, type ModelResponse } from "@/lib/ai-models";
import { ModelAvatar } from "./ModelAvatar";

const METRIC_LABELS: Array<[keyof ModelResponse["metrics"], string]> = [
  ["accuracy", "Accuracy"],
  ["completeness", "Completeness"],
  ["creativity", "Creativity"],
  ["technical", "Technical Depth"],
  ["reasoning", "Reasoning"],
  ["clarity", "Clarity"],
];

export function EvaluationMetrics({ responses }: { responses: ModelResponse[] }) {
  if (!responses.length) return null;
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">AI Evaluation Engine</h3>
          <p className="text-xs text-muted-foreground">Scored across six independent dimensions.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {responses.map((r) => {
          const model = MODELS.find((m) => m.id === r.modelId)!;
          return (
            <div key={r.modelId} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2">
                <ModelAvatar id={r.modelId} size={24} />
                <span className="text-sm font-semibold">{model.name}</span>
              </div>
              <div className="space-y-2.5">
                {METRIC_LABELS.map(([key, label]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono">{r.metrics[key]}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.metrics[key]}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: model.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
