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
