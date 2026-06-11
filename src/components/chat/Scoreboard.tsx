import { MODELS, type ModelResponse } from "@/lib/ai-models";
import { ModelAvatar } from "./ModelAvatar";
import { Trophy } from "lucide-react";

export function Scoreboard({ responses }: { responses: ModelResponse[] }) {
  if (!responses.length) return null;
  const ranked = [...responses].sort((a, b) => b.finalScore - a.finalScore);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="border-b border-white/5 px-5 py-4">
        <h3 className="font-semibold">Scoreboard</h3>
        <p className="text-xs text-muted-foreground">Highest combined score wins the round.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Rank</th>
              <th className="px-5 py-3 font-medium">Model</th>
              <th className="px-5 py-3 font-medium">Accuracy</th>
              <th className="px-5 py-3 font-medium">Speed</th>
              <th className="px-5 py-3 font-medium">Creativity</th>
              <th className="px-5 py-3 font-medium">Final</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => {
              const model = MODELS.find((m) => m.id === r.modelId)!;
              const isWinner = i === 0;
              return (
                <tr key={r.modelId} className="border-t border-white/5">
                  <td className="px-5 py-3">
                    <span className={"font-mono " + (isWinner ? "text-primary" : "text-muted-foreground")}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ModelAvatar id={r.modelId} size={24} />
                      <span className="font-medium">{model.name}</span>
                      {isWinner && <Trophy className="h-3.5 w-3.5 text-primary" />}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono">{r.metrics.accuracy}</td>
                  <td className="px-5 py-3 font-mono">{(r.speedMs / 1000).toFixed(1)}s</td>
                  <td className="px-5 py-3 font-mono">{r.metrics.creativity}</td>
                  <td className="px-5 py-3">
                    <span className={"font-mono font-semibold " + (isWinner ? "gradient-text" : "")}>
                      {r.finalScore}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
