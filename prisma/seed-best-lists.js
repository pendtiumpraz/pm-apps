const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding Best AI Models...")
  
  // Best AI Models from SWE-bench
  const aiModels = [
    { rank: 1, name: "Claude 4.5 Opus (20251101)", resolved: 74.40, costPerTask: 0.72, organization: "Anthropic", link: "https://anthropic.com" },
    { rank: 2, name: "Gemini 3 Pro Preview", resolved: 74.20, costPerTask: 0.46, organization: "Google DeepMind", link: "https://deepmind.google" },
    { rank: 3, name: "Claude 4.5 Sonnet (20250929)", resolved: 70.60, costPerTask: 0.56, organization: "Anthropic", link: "https://anthropic.com" },
    { rank: 4, name: "Claude 4 Opus (20250514)", resolved: 67.60, costPerTask: 1.13, organization: "Anthropic", link: "https://anthropic.com" },
    { rank: 5, name: "GPT-5 (medium reasoning)", resolved: 65.00, costPerTask: 0.28, organization: "OpenAI", link: "https://openai.com" },
    { rank: 6, name: "Claude 4 Sonnet (20250514)", resolved: 64.93, costPerTask: 0.37, organization: "Anthropic", link: "https://anthropic.com" },
    { rank: 7, name: "GPT-5 mini (medium reasoning)", resolved: 59.80, costPerTask: 0.04, organization: "OpenAI", link: "https://openai.com" },
    { rank: 8, name: "o3 (2025-04-16)", resolved: 58.40, costPerTask: 0.33, organization: "OpenAI", link: "https://openai.com" },
    { rank: 9, name: "Qwen3-Coder 480B/A35B Instruct", resolved: 55.40, costPerTask: 0.25, organization: "Qwen", link: "https://qwen.ai" },
    { rank: 10, name: "GLM-4.5", resolved: 54.20, costPerTask: 0.30, organization: "Z.ai", link: "https://zhipuai.cn" },
    { rank: 11, name: "Gemini 2.5 Pro", resolved: 53.60, costPerTask: 0.29, organization: "Google DeepMind", link: "https://deepmind.google" },
    { rank: 12, name: "Claude 3.7 Sonnet", resolved: 52.80, costPerTask: 0.35, organization: "Anthropic", link: "https://anthropic.com" },
    { rank: 13, name: "o4-mini (2025-04-16)", resolved: 45.00, costPerTask: 0.21, organization: "OpenAI", link: "https://openai.com" },
    { rank: 14, name: "Kimi K2 Instruct", resolved: 43.80, costPerTask: 0.53, organization: "Moonshot AI", link: "https://kimi.ai" },
    { rank: 15, name: "GPT-4.1", resolved: 39.58, costPerTask: 0.15, organization: "OpenAI", link: "https://openai.com" },
    { rank: 16, name: "GPT-5 nano (medium reasoning)", resolved: 34.80, costPerTask: 0.04, organization: "OpenAI", link: "https://openai.com" },
    { rank: 17, name: "Gemini 2.5 Flash", resolved: 28.73, costPerTask: 0.13, organization: "Google DeepMind", link: "https://deepmind.google" },
    { rank: 18, name: "gpt-oss-120b", resolved: 26.00, costPerTask: 0.06, organization: "OpenAI", link: "https://openai.com" },
    { rank: 19, name: "GPT-4.1-mini", resolved: 23.94, costPerTask: 0.44, organization: "OpenAI", link: "https://openai.com" },
    { rank: 20, name: "GPT-4o", resolved: 21.62, costPerTask: 1.53, organization: "OpenAI", link: "https://openai.com" },
  ]

  for (const model of aiModels) {
    await prisma.bestAiModel.upsert({
      where: { id: `ai-model-${model.rank}` },
      update: model,
      create: { id: `ai-model-${model.rank}`, ...model },
    })
  }
  console.log(`✓ Seeded ${aiModels.length} AI models`)

  console.log("Seeding Best IDEs...")
  const ides = [
    { rank: 1, name: "Cursor", description: "AI-first code editor, fork of VS Code", downloadUrl: "https://cursor.com/download", pricing: "Freemium ($20/mo)" },
    { rank: 2, name: "Windsurf", description: "AI-native IDE with Cascade agent", downloadUrl: "https://windsurf.com/download", pricing: "Freemium ($15/mo)" },
    { rank: 3, name: "Zed", description: "Fast, Rust-based editor with AI", downloadUrl: "https://zed.dev/download", pricing: "Free" },
    { rank: 4, name: "VS Code + Copilot", description: "Most popular IDE with AI extension", downloadUrl: "https://code.visualstudio.com/download", pricing: "Freemium ($10/mo)" },
    { rank: 5, name: "JetBrains + AI", description: "Professional IDEs with AI Assistant", downloadUrl: "https://www.jetbrains.com/ai/", pricing: "Subscription" },
    { rank: 6, name: "Replit", description: "Browser-based AI coding", downloadUrl: "https://replit.com", pricing: "Freemium" },
    { rank: 7, name: "Neovim + AI", description: "Terminal editor with AI plugins", downloadUrl: "https://neovim.io", pricing: "Free (Open Source)" },
    { rank: 8, name: "Sublime Text + AI", description: "Lightweight editor with AI plugins", downloadUrl: "https://www.sublimetext.com/download", pricing: "Paid ($99)" },
  ]

  for (const ide of ides) {
    await prisma.bestIde.upsert({
      where: { id: `ide-${ide.rank}` },
      update: ide,
      create: { id: `ide-${ide.rank}`, ...ide },
    })
  }
  console.log(`✓ Seeded ${ides.length} IDEs`)

  console.log("Seeding Best CLIs...")
  const clis = [
    { rank: 1, name: "Aider", description: "AI pair programming in terminal", githubUrl: "https://github.com/Aider-AI/aider", stars: "38.7k" },
    { rank: 2, name: "Claude Code", description: "Anthropic's CLI coding agent", githubUrl: "https://github.com/anthropics/anthropic-cookbook", stars: "-" },
    { rank: 3, name: "OpenHands CLI", description: "AI-powered dev in terminal", githubUrl: "https://github.com/All-Hands-AI/OpenHands", stars: "47k" },
    { rank: 4, name: "Codex CLI", description: "OpenAI's terminal assistant", githubUrl: "https://github.com/openai/codex", stars: "-" },
    { rank: 5, name: "Gemini CLI", description: "Google's AI CLI tool", githubUrl: "https://github.com/google-gemini/gemini-api", stars: "-" },
    { rank: 6, name: "Warp", description: "AI-powered terminal", githubUrl: "https://github.com/warpdotdev/Warp", stars: "21k" },
    { rank: 7, name: "Droid (Factory)", description: "Factory AI CLI agent", githubUrl: "https://factory.ai", stars: "-" },
    { rank: 8, name: "Amazon Q CLI", description: "AWS AI coding assistant", githubUrl: "https://aws.amazon.com/q/developer/", stars: "-" },
    { rank: 9, name: "Continue", description: "Open-source AI code assistant", githubUrl: "https://github.com/continuedev/continue", stars: "24k" },
    { rank: 10, name: "TabbyML", description: "Self-hosted AI coding", githubUrl: "https://github.com/TabbyML/tabby", stars: "25k" },
  ]

  for (const cli of clis) {
    await prisma.bestCli.upsert({
      where: { id: `cli-${cli.rank}` },
      update: cli,
      create: { id: `cli-${cli.rank}`, ...cli },
    })
  }
  console.log(`✓ Seeded ${clis.length} CLIs`)

  console.log("Seeding Best Orchestrators...")
  const orchestrators = [
    { rank: 1, name: "Cline", description: "Autonomous coding agent for IDE", githubUrl: "https://github.com/cline/cline", stars: "53.6k" },
    { rank: 2, name: "OpenHands (OpenDevin)", description: "Open-source Devin alternative", githubUrl: "https://github.com/All-Hands-AI/OpenHands", stars: "47k" },
    { rank: 3, name: "AutoGen", description: "Microsoft multi-agent framework", githubUrl: "https://github.com/microsoft/autogen", stars: "40k" },
    { rank: 4, name: "CrewAI", description: "AI agent crews framework", githubUrl: "https://github.com/crewAIInc/crewAI", stars: "28k" },
    { rank: 5, name: "Goose", description: "Extensible AI agent by Block", githubUrl: "https://github.com/block/goose", stars: "22.3k" },
    { rank: 6, name: "SWE-agent", description: "AI for software engineering", githubUrl: "https://github.com/SWE-agent/SWE-agent", stars: "15k" },
    { rank: 7, name: "AgentBase", description: "Multi-agent orchestrator", githubUrl: "https://github.com/AgentOrchestrator/AgentBase", stars: "-" },
    { rank: 8, name: "Orchestra", description: "Cognitive architectures for agents", githubUrl: "https://github.com/mainframecomputer/orchestra", stars: "-" },
    { rank: 9, name: "CoAgent", description: "Distributed agentic systems", githubUrl: "https://github.com/OpenCSGs/coagent", stars: "-" },
    { rank: 10, name: "LangGraph", description: "LangChain multi-agent graphs", githubUrl: "https://github.com/langchain-ai/langgraph", stars: "8k" },
  ]

  for (const orch of orchestrators) {
    await prisma.bestOrchestrator.upsert({
      where: { id: `orch-${orch.rank}` },
      update: orch,
      create: { id: `orch-${orch.rank}`, ...orch },
    })
  }
  console.log(`✓ Seeded ${orchestrators.length} Orchestrators`)

  console.log("Seeding Tool Categories...")
  const categories = [
    { slug: "agentic-coding", name: "Agentic Coding", description: "AI coding assistants", icon: "🤖", color: "#8B5CF6" },
    { slug: "cli-tools", name: "CLI Tools", description: "Command line AI tools", icon: "⌨️", color: "#10B981" },
    { slug: "ide-editor", name: "IDE/Editor", description: "AI-powered code editors", icon: "📝", color: "#3B82F6" },
    { slug: "vibe-coding", name: "Vibe Coding", description: "Build apps with prompts", icon: "✨", color: "#EC4899" },
    { slug: "ai-design", name: "AI Design", description: "Design tools with AI", icon: "🎨", color: "#F59E0B" },
    { slug: "image-generation", name: "Image Generation", description: "Text to image AI", icon: "🖼️", color: "#EF4444" },
    { slug: "video-generation", name: "Video Generation", description: "Text to video AI", icon: "🎬", color: "#8B5CF6" },
    { slug: "video-editing", name: "Video Editing", description: "AI video editors", icon: "✂️", color: "#06B6D4" },
    { slug: "voice-generation", name: "Voice Generation", description: "Text to speech AI", icon: "🎤", color: "#14B8A6" },
    { slug: "music-generation", name: "Music Generation", description: "AI music creation", icon: "🎵", color: "#F97316" },
    { slug: "ai-chat", name: "AI Chat", description: "Conversational AI", icon: "💬", color: "#6366F1" },
    { slug: "ai-agents", name: "AI Agents", description: "Autonomous AI agents", icon: "🤖", color: "#A855F7" },
    { slug: "writing", name: "Writing", description: "AI writing assistants", icon: "✍️", color: "#22C55E" },
    { slug: "research", name: "Research", description: "AI research tools", icon: "🔬", color: "#0EA5E9" },
    { slug: "workflow", name: "Workflow", description: "Automation tools", icon: "⚙️", color: "#64748B" },
    { slug: "meeting-assistant", name: "Meeting Assistant", description: "AI meeting tools", icon: "📅", color: "#84CC16" },
    { slug: "presentation", name: "Presentation", description: "AI slide creation", icon: "📊", color: "#D946EF" },
    { slug: "api-providers", name: "API Providers", description: "AI API services", icon: "🔌", color: "#F43F5E" },
  ]

  for (const cat of categories) {
    await prisma.toolCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  console.log(`✓ Seeded ${categories.length} categories`)

  console.log("\n✅ Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
