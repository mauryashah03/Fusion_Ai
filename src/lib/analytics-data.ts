// Deterministic seeded mock analytics so charts look stable.
export const dailyUsage = [
  { day: "Mon", prompts: 24, responses: 72 },
  { day: "Tue", prompts: 38, responses: 114 },
  { day: "Wed", prompts: 32, responses: 96 },
  { day: "Thu", prompts: 51, responses: 153 },
  { day: "Fri", prompts: 64, responses: 192 },
  { day: "Sat", prompts: 28, responses: 84 },
  { day: "Sun", prompts: 19, responses: 57 },
];

export const modelUsage = [
  { name: "GPT-4o", value: 38 },
  { name: "Claude", value: 34 },
  { name: "Gemini", value: 28 },
];

export const qualityTrends = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  gpt: 86 + Math.round(Math.sin(i / 2) * 5 + Math.random() * 3),
  claude: 88 + Math.round(Math.cos(i / 2) * 4 + Math.random() * 3),
  gemini: 84 + Math.round(Math.sin(i / 3) * 6 + Math.random() * 3),
}));

export const categoryDistribution = [
  { name: "Coding", value: 32 },
  { name: "Research", value: 24 },
  { name: "Marketing", value: 14 },
  { name: "Business", value: 12 },
  { name: "Education", value: 8 },
  { name: "Legal", value: 6 },
  { name: "Other", value: 4 },
];
