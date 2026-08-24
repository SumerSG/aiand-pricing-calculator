// ai& model catalog — prices from https://docs.aiand.com/models/catalog/
// Quality scores & popularity (OR Rank) from https://theozard.com/models/text
const MODELS = [
  {
    id: "qwen/qwen3.6-27b",
    provider: "Qwen",
    context: 262_000,
    inputPer1M: 0,
    outputPer1M: 0,
    quality: null,        // not listed on Theozard
    popularity: null,
    capabilities: ["reasoning", "tool_calling"],
    description:
      "A free 27B Qwen model with no per-token charges — the zero-cost way to evaluate the ai& API, run test suites, and prototype integrations.",
    specialties: [
      "Completely free — no credit balance required",
      "Ideal for evals, CI pipelines, and prototyping",
      "262K context with reasoning and tool calling",
    ],
    limitations: [
      "Smallest model class on the platform — lower ceiling on hard tasks",
      "Text-only: no vision, video, or document input",
      "Not suited to production workloads that need frontier quality",
    ],
  },
  {
    id: "deepseek-ai/deepseek-v4-flash",
    provider: "DeepSeek",
    context: 1_000_000,
    inputPer1M: 0.15,
    outputPer1M: 0.25,
    quality: 67,          // Theozard "DeepSeek V4 Flash"
    popularity: 1,        // Theozard OR Rank
    capabilities: ["reasoning", "tool_calling"],
    description:
      "DeepSeek's fast, inexpensive workhorse. The best price-to-performance ratio on ai& and the most popular model on OpenRouter.",
    specialties: [
      "Cheapest paid output tokens on the platform ($0.25/1M)",
      "Full 1M-token context window",
      "#1 most popular model on OpenRouter",
    ],
    limitations: [
      "Text-only: no vision, video, or document input",
      "Quality score (67) trails the pro-tier models",
      "High-volume reasoning chains can add up — reasoning tokens bill as output",
    ],
  },
  {
    id: "google/gemma-4-31b-it",
    provider: "Google",
    context: 262_000,
    inputPer1M: 0.20,
    outputPer1M: 0.50,
    quality: null,
    popularity: null,
    capabilities: ["reasoning", "tool_calling", "vision", "video", "document"],
    description:
      "Google's multimodal Gemma — the only ai& model that accepts video input, alongside images and documents, at entry-level prices.",
    specialties: [
      "Only model on ai& with video understanding",
      "Vision + document input at just $0.20/1M input",
      "Strong pick for multimodal pipelines on a budget",
    ],
    limitations: [
      "262K context — smaller than the 1M flagships",
      "Not yet listed on the Theozard leaderboard",
      "31B class: below flagship quality on complex reasoning",
    ],
  },
  {
    id: "openai/gpt-oss-120b",
    provider: "OpenAI",
    context: 131_000,
    inputPer1M: 0.15,
    outputPer1M: 0.60,
    quality: null,
    popularity: null,
    capabilities: ["reasoning", "tool_calling"],
    description:
      "OpenAI's open-weight 120B model — solid reasoning and tool calling at the platform's cheapest input rate.",
    specialties: [
      "Cheapest input tokens on the platform ($0.15/1M)",
      "OpenAI open weights with reasoning + tool calling",
      "Good fit for agents with short, frequent calls",
    ],
    limitations: [
      "Smallest context window on ai& (131K)",
      "Text-only: no vision, video, or document input",
      "Not yet listed on the Theozard leaderboard",
    ],
  },
  {
    id: "deepseek-ai/deepseek-v4-pro",
    provider: "DeepSeek",
    context: 1_000_000,
    inputPer1M: 1.00,
    outputPer1M: 2.50,
    quality: 72,          // Theozard "DeepSeek V4 Pro"
    popularity: 10,
    capabilities: ["reasoning", "tool_calling"],
    description:
      "DeepSeek's flagship open-weight model — a big quality step up from Flash, with the same 1M-token context window.",
    specialties: [
      "Full 1M-token context for long-document workloads",
      "Top-10 most popular model on OpenRouter",
      "Strong reasoning at roughly half the price of GLM-5.2 output",
    ],
    limitations: [
      "Text-only: no vision, video, or document input",
      "~6.7x the input price of DeepSeek V4 Flash",
      "Quality (72) still behind GLM-5.2 (83)",
    ],
  },
  {
    id: "moonshotai/kimi-k2.7-code",
    provider: "Moonshot AI",
    context: 262_000,
    inputPer1M: 0.75,
    outputPer1M: 3.50,
    quality: 68,          // Theozard "Kimi K2.7 Code"
    popularity: 76,
    capabilities: ["reasoning", "tool_calling", "vision", "document"],
    description:
      "Moonshot's code-tuned Kimi — purpose-built for software engineering agents, with vision and document input for specs and screenshots.",
    specialties: [
      "Tuned for code generation, editing, and debugging agents",
      "Accepts image and document input (specs, diagrams, PDFs)",
      "Reasoning + tool calling for multi-step coding workflows",
    ],
    limitations: [
      "Premium output price ($3.50/1M) — long generations add up",
      "262K context, below the 1M flagships",
      "Code-tuning makes it narrower than general-purpose models",
    ],
  },
  {
    id: "moonshotai/kimi-k2.6",
    provider: "Moonshot AI",
    context: 262_000,
    inputPer1M: 0.85,
    outputPer1M: 3.50,
    quality: 72,          // Theozard "Kimi K2.6"
    popularity: 50,
    capabilities: ["reasoning", "tool_calling", "vision", "document"],
    description:
      "Moonshot's general-purpose Kimi K2.6 — multimodal reasoning with tool calling, aimed at assistant and agent workloads.",
    specialties: [
      "Vision + document understanding with 72 quality score",
      "Well-rounded for chat, analysis, and agentic tasks",
      "Reasoning + tool calling built in",
    ],
    limitations: [
      "Premium output price ($3.50/1M)",
      "262K context, below the 1M flagships",
      "Priced close to GLM-5.2, which scores higher on Theozard",
    ],
  },
  {
    id: "zai-org/glm-5.2",
    provider: "Z.ai",
    context: 1_000_000,
    inputPer1M: 1.00,
    outputPer1M: 4.00,
    quality: 83,          // Theozard "GLM-5.2"
    popularity: 8,
    capabilities: ["reasoning", "tool_calling"],
    description:
      "Z.ai's GLM-5.2 — the highest Theozard quality score of any model on ai&, paired with a full 1M-token context window.",
    specialties: [
      "Best quality on the platform (Theozard score 83)",
      "1M-token context for huge documents and codebases",
      "#8 most popular model on OpenRouter",
    ],
    limitations: [
      "Top-tier pricing: $1.00 / $4.00 per 1M tokens",
      "Text-only: no vision, video, or document input",
      "Overkill for simple tasks — cheaper models handle those fine",
    ],
  },
  {
    id: "zai-org/glm-5.1",
    provider: "Z.ai",
    context: 203_000,
    inputPer1M: 1.40,
    outputPer1M: 4.40,
    quality: 65,          // Theozard "GLM-5.1"
    popularity: 78,
    capabilities: ["reasoning", "tool_calling"],
    description:
      "The previous-generation GLM, kept available for workloads pinned to its behavior. New projects should generally start with GLM-5.2.",
    specialties: [
      "Predictable, established behavior for existing integrations",
      "Reasoning + tool calling support",
    ],
    limitations: [
      "Most expensive model on ai& ($1.40 / $4.40 per 1M)",
      "Only 203K context — smallest of the paid flagships",
      "Superseded by GLM-5.2, which is cheaper and higher quality",
    ],
  },
];

// Quick example presets: per-call token usage + monthly call volume
const PRESETS = {
  chatbot:   { label: "Chatbot",        inputTokens: 1_000,  outputTokens: 300,   callsPerMonth: 20_000 },
  code:      { label: "Code Assistant", inputTokens: 5_000,  outputTokens: 1_500, callsPerMonth: 5_000 },
  docs:      { label: "Doc Analysis",   inputTokens: 30_000, outputTokens: 2_000, callsPerMonth: 1_000 },
  content:   { label: "Content Gen",    inputTokens: 1_500,  outputTokens: 3_000, callsPerMonth: 3_000 },
};

// Approximate conversion factors (industry heuristics)
const CHARS_PER_TOKEN = 4;
const WORDS_PER_TOKEN = 0.75;
