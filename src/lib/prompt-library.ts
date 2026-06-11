export type PromptCategory =
  | "Coding" | "Research" | "Marketing" | "Business"
  | "Government" | "Education" | "Legal" | "Data Science";

export type LibraryPrompt = {
  id: string;
  category: PromptCategory;
  title: string;
  prompt: string;
};

export const CATEGORIES: PromptCategory[] = [
  "Coding", "Research", "Marketing", "Business",
  "Government", "Education", "Legal", "Data Science",
];

export const LIBRARY: LibraryPrompt[] = [
  { id: "c1", category: "Coding", title: "Refactor React component", prompt: "Refactor this React component to use hooks and improve readability." },
  { id: "c2", category: "Coding", title: "Explain algorithm", prompt: "Explain the Dijkstra's algorithm with a TypeScript implementation." },
  { id: "c3", category: "Coding", title: "Code review", prompt: "Perform a senior-level code review on this function, focusing on edge cases and performance." },
  { id: "r1", category: "Research", title: "Literature summary", prompt: "Summarize the last 5 years of research on transformer architectures and their limitations." },
  { id: "r2", category: "Research", title: "Compare frameworks", prompt: "Compare React, Vue, and Svelte across performance, ecosystem, and DX." },
  { id: "m1", category: "Marketing", title: "Landing page copy", prompt: "Write a high-conversion landing page for an AI-powered productivity tool." },
  { id: "m2", category: "Marketing", title: "Social media plan", prompt: "Draft a 30-day social media plan for a B2B SaaS launching a new feature." },
  { id: "b1", category: "Business", title: "Investor memo", prompt: "Write a one-page investor memo for an AI startup raising a $5M seed round." },
  { id: "b2", category: "Business", title: "Competitive analysis", prompt: "Run a SWOT analysis comparing OpenAI, Anthropic, and Google in the enterprise AI market." },
  { id: "g1", category: "Government", title: "Policy brief", prompt: "Draft a policy brief on AI governance for a national digital ministry." },
  { id: "g2", category: "Government", title: "RFP response", prompt: "Outline a response to a government RFP for an AI-powered citizen services platform." },
  { id: "e1", category: "Education", title: "Lesson plan", prompt: "Design a 60-minute lesson plan teaching teenagers how large language models work." },
  { id: "e2", category: "Education", title: "Quiz generator", prompt: "Generate 10 multiple-choice questions on the French Revolution with explanations." },
  { id: "l1", category: "Legal", title: "Contract review", prompt: "Highlight risk clauses in this SaaS service agreement and propose redlines." },
  { id: "l2", category: "Legal", title: "GDPR checklist", prompt: "Produce a GDPR compliance checklist for a startup processing EU user data." },
  { id: "d1", category: "Data Science", title: "Feature engineering", prompt: "Suggest feature engineering strategies for a churn prediction model on telecom data." },
  { id: "d2", category: "Data Science", title: "Model explainability", prompt: "Explain SHAP values and how to apply them to a gradient boosting model." },
];
