// Model abstraction layer — easy to swap mock for real APIs later.
export type ModelId = "gpt" | "claude" | "gemini" | "deepseek" | "grok" | "mistral" | "llama" | "perplexity";

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
  { id: "claude", name: "Claude Sonnet", provider: "Anthropic", color: "var(--claude)", enabled: true },
  { id: "gemini", name: "Gemini Pro", provider: "Google", color: "var(--gemini)", enabled: true },
  { id: "deepseek", name: "DeepSeek", provider: "DeepSeek", color: "var(--cyan)", enabled: false, comingSoon: true },
  { id: "grok", name: "Grok", provider: "xAI", color: "var(--violet)", enabled: false, comingSoon: true },
  { id: "mistral", name: "Mistral", provider: "Mistral AI", color: "var(--indigo)", enabled: false, comingSoon: true },
  { id: "llama", name: "Llama 3", provider: "Meta", color: "var(--accent)", enabled: false, comingSoon: true },
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

// Mocked response bodies — tuned to each model's personality
const RESPONSE_TEMPLATES: Record<ModelId, (prompt: string) => string> = {
  gpt: (p) =>
    `Here's a structured take on **"${p.slice(0, 80)}"**:\n\n1. **Context** — Modern AI systems can transform this domain by augmenting human judgment with data-driven insight.\n2. **Mechanisms** — Pattern recognition across vast corpora, low-latency reasoning, and adaptive personalization.\n3. **Risks** — Bias propagation, hallucination, and accountability gaps require continuous evaluation.\n4. **Outlook** — A pragmatic 12–24 month horizon favors hybrid workflows: AI proposes, humans dispose.\n\nIn short: think of AI as a force multiplier rather than a replacement.`,
  claude: (p) =>
    `Let me think through "${p.slice(0, 80)}" carefully.\n\nThere are really three lenses worth considering — the *empirical* (what evidence shows today), the *systemic* (how organizations would actually adopt it), and the *ethical* (who benefits, who is harmed).\n\nThe most underrated point is that quality of deployment matters more than capability of the model. A modestly intelligent system thoughtfully integrated into a workflow outperforms a frontier model bolted on as an afterthought.\n\nMy concrete recommendation: start with one high-value, low-risk workflow, measure rigorously, and expand only where outcomes clearly improve.`,
  gemini: (p) =>
    `Quick synthesis on "${p.slice(0, 80)}":\n\n• **Today** — practical wins in summarization, retrieval, and triage.\n• **Soon** — agentic workflows that chain tools and verify their own output.\n• **Limits** — context drift, evaluation gaps, and unclear regulation.\n\n**Bottom line:** the highest leverage right now is *workflow redesign*, not model selection. The teams winning aren't using the smartest model — they're using the model most thoughtfully.`,
  deepseek: () => "Coming soon.",
  grok: () => "Coming soon.",
  mistral: () => "Coming soon.",
  llama: () => "Coming soon.",
  perplexity: () => "Coming soon.",
};

function rand(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function buildMetrics(modelId: ModelId) {
  // Bias each model a little so scores feel believable.
  const base = {
    gpt:     { accuracy: 94, completeness: 92, creativity: 87, technical: 95, reasoning: 93, clarity: 95 },
    claude:  { accuracy: 91, completeness: 95, creativity: 93, technical: 88, reasoning: 96, clarity: 94 },
    gemini:  { accuracy: 89, completeness: 88, creativity: 90, technical: 92, reasoning: 87, clarity: 91 },
  } as Record<string, ModelResponse["metrics"]>;
  const b = base[modelId] ?? base.gpt;
  // jitter each by ±3
  const jitter = (v: number) => Math.max(60, Math.min(99, v + rand(-3, 3)));
  return {
    accuracy: jitter(b.accuracy),
    completeness: jitter(b.completeness),
    creativity: jitter(b.creativity),
    technical: jitter(b.technical),
    reasoning: jitter(b.reasoning),
    clarity: jitter(b.clarity),
  };
}

export function finalScore(m: ModelResponse["metrics"]) {
  const vals = Object.values(m);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/**
 * Streams a mocked response token-by-token via the provided callback.
 * Returns a promise that resolves with the final response object.
 */
export function streamMockResponse(
  modelId: ModelId,
  prompt: string,
  onChunk: (partial: string) => void,
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

export function buildMergedAnswer(prompt: string, responses: ModelResponse[]): string {
  const winner = [...responses].sort((a, b) => b.finalScore - a.finalScore)[0];
  return `### Merged Intelligence Answer\n\n**Prompt:** ${prompt}\n\nAfter synthesizing responses from ${responses.map((r) => MODELS.find((m) => m.id === r.modelId)?.name).join(", ")}, the unified answer is:\n\n${winner.text}\n\n---\n\n**Key consensus points across all models:**\n- AI delivers the biggest gains when paired with redesigned workflows, not bolted onto existing ones.\n- Evaluation discipline (measure outcomes, not vibes) separates winning deployments from theater.\n- Start narrow, prove value, then expand — premature scope kills most projects.\n\n*Synthesized using the highest-scoring reasoning chain, the most complete coverage, and the clearest structure across responses.*`;
}
