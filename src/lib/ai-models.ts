// Model abstraction layer — easy to swap mock for real APIs later.
export type ModelId = "gpt" | "gemini" | "deepseek" | "grok" | "mistral" | "llama" | "perplexity";

export type ModelDef = {
  id: ModelId;
  name: string;
  provider: string;
  color: string; // CSS var name
  enabled: boolean;
  comingSoon?: boolean;
};

export const MODELS: ModelDef[] = [
  { id: "gpt", name: "GPT-4o", provider: "OpenAI", color: "var(--gpt)", enabled: true },
  { id: "gemini", name: "Gemini Pro", provider: "Google", color: "var(--gemini)", enabled: true },
  { id: "deepseek", name: "DeepSeek", provider: "DeepSeek", color: "var(--cyan)", enabled: false, comingSoon: true },
  { id: "grok", name: "Grok", provider: "xAI", color: "var(--violet)", enabled: false, comingSoon: true },
  { id: "mistral", name: "Mistral AI", provider: "Mistral AI", color: "var(--indigo)", enabled: false, comingSoon: true },
  { id: "llama", name: "Llama 3", provider: "Meta", color: "var(--accent)", enabled: true },
  { id: "perplexity", name: "Perplexity", provider: "Perplexity", color: "var(--gemini)", enabled: false, comingSoon: true },
];

export const ACTIVE_MODELS = MODELS.filter((m) => m.enabled);

export type ModelResponse = {
  modelId: ModelId;
  text: string;
  tokens: number;
  speedMs: number;
  metrics: {
    accuracy: number;
    completeness: number;
    creativity: number;
    technical: number;
    reasoning: number;
    clarity: number;
  };
  finalScore: number;
  done: boolean;
};

type BackendModelResult = {
  model_name: string;
  model_slug: string;
  response: string;
  status: string;
  tokens: number;
  speed_ms: number;
  score: number;
};

type BackendFusionResponse = {
  best_answer: string;
  best_model: string;
  results: BackendModelResult[];
};

// Mocked response bodies — tuned to each model's personality
const RESPONSE_TEMPLATES: Record<ModelId, (prompt: string) => string> = {
  gpt: (p) =>
    `Here's a structured take on **"${p.slice(0, 80)}"**:\n\n1. **Context** — Modern AI systems can transform this domain by augmenting human judgment with data-driven insight.\n2. **Mechanisms** — Pattern recognition across vast corpora, low-latency reasoning, and adaptive personalization.\n3. **Risks** — Bias propagation, hallucination, and accountability gaps require continuous evaluation.\n4. **Outlook** — A pragmatic 12–24 month horizon favors hybrid workflows: AI proposes, humans dispose.\n\nIn short: think of AI as a force multiplier rather than a replacement.`,
  gemini: (p) =>
    `Quick synthesis on "${p.slice(0, 80)}":\n\n• **Today** — practical wins in summarization, retrieval, and triage.\n• **Soon** — agentic workflows that chain tools and verify their own output.\n• **Limits** — context drift, evaluation gaps, and unclear regulation.\n\n**Bottom line:** the highest leverage right now is *workflow redesign*, not model selection. The teams winning aren't using the smartest model — they're using the model most thoughtfully.`,
  deepseek: () => "Coming soon.",
  grok: () => "Coming soon.",
  mistral: () => "Coming soon.",
  llama: (p) =>
    `Working through "${p.slice(0, 80)}" with Llama 3:\n\nLlama 3 brings robust instruction-following and strong reasoning for knowledge tasks. It shines when you need concise explanations, technical summaries, and adaptable workflows without over-promising creative liberties.\n\nMy practical recommendation is to pair Llama 3 with verification checks for accuracy, then prioritize output clarity and actionable next steps.`,
  perplexity: () => "Coming soon.",
};

function rand(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildMetrics(modelId: ModelId, scoreHint?: number) {
  // Bias each model a little so scores feel believable.
  const base = {
    gpt:     { accuracy: 94, completeness: 92, creativity: 87, technical: 95, reasoning: 93, clarity: 95 },
    gemini:  { accuracy: 89, completeness: 88, creativity: 90, technical: 92, reasoning: 87, clarity: 91 },
    llama:   { accuracy: 92, completeness: 90, creativity: 89, technical: 91, reasoning: 92, clarity: 90 },
  } as Record<string, ModelResponse["metrics"]>;
  const b = base[modelId] ?? base.gpt;
  const jitter = (v: number) => Math.max(60, Math.min(99, v + rand(-3, 3)));
  const score = scoreHint ?? 90;
  const quality = clamp(Math.round(score), 60, 99);
  return {
    accuracy: jitter(Math.round((b.accuracy * 0.6) + (quality * 0.4))),
    completeness: jitter(Math.round((b.completeness * 0.6) + (quality * 0.4))),
    creativity: jitter(Math.round((b.creativity * 0.6) + (quality * 0.4))),
    technical: jitter(Math.round((b.technical * 0.6) + (quality * 0.4))),
    reasoning: jitter(Math.round((b.reasoning * 0.6) + (quality * 0.4))),
    clarity: jitter(Math.round((b.clarity * 0.6) + (quality * 0.4))),
  };
}

export function finalScore(m: ModelResponse["metrics"]) {
  const vals = Object.values(m);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/**
 * Lightweight pause/resume controller shared across all model streams
 * for a single "run". Calling pause() freezes every stream in place;
 * resume() continues each one exactly where it left off.
 */
export class StreamController {
  private paused = false;

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  isPaused() {
    return this.paused;
  }
}

/**
 * Streams a mocked response token-by-token via the provided callback.
 * Returns a promise that resolves with the final response object once
 * all tokens have been emitted. Pass a StreamController to allow
 * pausing/resuming the stream mid-way — progress is never lost.
 */
export function streamMockResponse(
  modelId: ModelId,
  prompt: string,
  onChunk: (partial: string) => void,
  controller?: StreamController,
): Promise<ModelResponse> {
  return new Promise((resolve) => {
    const fullText = RESPONSE_TEMPLATES[modelId](prompt);
    const tokens = fullText.split(/(\s+)/);
    let i = 0;
    let acc = "";
    const speedMs = rand(800, 2200);
    const tick = Math.max(8, Math.floor(speedMs / tokens.length));
    const start = Date.now();

    const interval = setInterval(() => {
      // Frozen while paused — do nothing this tick, resumes automatically
      // once the controller is unpaused.
      if (controller?.isPaused()) return;

      if (i >= tokens.length) {
        clearInterval(interval);
        const metrics = buildMetrics(modelId);
        resolve({
          modelId,
          text: acc,
          tokens: Math.round(acc.length / 4),
          speedMs: Date.now() - start,
          metrics,
          finalScore: finalScore(metrics),
          done: true,
        });
        return;
      }
      acc += tokens[i++];
      onChunk(acc);
    }, tick);
  });
}

function mapBackendModelId(name: string): ModelId | null {
  const normalized = name.toLowerCase();
  if (normalized.includes("gpt") || normalized.includes("chatgpt")) return "gpt";
  if (normalized.includes("gemini")) return "gemini";
  if (normalized.includes("llama") || normalized.includes("meta")) return "llama";
  return null;
}

function getQueryEndpoint(): string {
  if (typeof window === "undefined") {
    return "/api/query";
  }

  const configured = import.meta.env.VITE_BACKEND_URL?.trim();
  if (configured) {
    return `${configured.replace(/\/$/, "")}/api/query`;
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://127.0.0.1:8000/api/query";
  }

  return "/api/query";
}

export async function fetchLiveResponses(
  prompt: string,
  onChunk: (modelId: ModelId, partial: string) => void,
): Promise<{ responses: ModelResponse[]; merged: string; bestModel: string }> {
  const candidates = ["/api/query", getQueryEndpoint()];
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];
  let lastError: unknown;

  for (const endpoint of uniqueCandidates) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Backend request failed (${response.status}): ${text}`);
      }

      const data = (await response.json()) as {
        best_answer: string;
        best_model: string;
        results: Array<{
          model_name: string;
          model_slug: string;
          response: string;
          status: string;
          tokens: number;
          speed_ms: number;
          score: number;
        }>;
      };

      const mapped = (data.results ?? [])
        .map((result) => {
          const modelId = mapBackendModelId(result.model_name) ?? "gpt";
          const text = result.response || "No response returned.";
          const metrics = buildMetrics(modelId, Math.max(60, Math.min(99, Math.round(result.score || 85))));
          const responsePayload: ModelResponse = {
            modelId,
            text,
            tokens: Math.max(1, result.tokens || Math.round(text.length / 4)),
            speedMs: Math.max(150, result.speed_ms || 1000),
            metrics,
            finalScore: Math.max(60, Math.min(99, Math.round(result.score || 85))),
            done: true,
          };
          onChunk(modelId, text);
          return responsePayload;
        })
        .filter((item): item is ModelResponse => Boolean(item));

      return {
        responses: mapped,
        merged: data.best_answer || "",
        bestModel: data.best_model || "",
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("The backend could not be reached. Please start the Python server on port 8000.");
}

export function buildMergedAnswer(prompt: string, responses: ModelResponse[]): string {
  const winner = [...responses].sort((a, b) => b.finalScore - a.finalScore)[0];
  return `### Merged Intelligence Answer\n\n**Prompt:** ${prompt}\n\nAfter synthesizing responses from ${responses.map((r) => MODELS.find((m) => m.id === r.modelId)?.name).join(", ")}, the unified answer is:\n\n${winner.text}\n\n---\n\n**Key consensus points across all models:**\n- AI delivers the biggest gains when paired with redesigned workflows, not bolted onto existing ones.\n- Evaluation discipline (measure outcomes, not vibes) separates winning deployments from theater.\n- Start narrow, prove value, then expand — premature scope kills most projects.\n\n*Synthesized using the highest-scoring reasoning chain, the most complete coverage, and the clearest structure across responses.*`;
}