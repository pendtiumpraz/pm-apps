const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  // Get categories
  const categories = await prisma.toolCategory.findMany({ where: { deletedAt: null } })
  const catMap = {}
  categories.forEach(c => { catMap[c.slug] = c.id })

  // Get admin user (first admin or first user)
  let user = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  if (!user) user = await prisma.user.findFirst()
  if (!user) {
    console.log("No user found, skipping tools seed")
    return
  }

  console.log(`Seeding tools as user: ${user.email}`)

  const tools = [
    // AI Chat
    { name: "ChatGPT", slug: "chatgpt", url: "https://chat.openai.com", description: "OpenAI's conversational AI assistant", pricing: "FREEMIUM", categoryId: catMap["ai-chat"] },
    { name: "Claude", slug: "claude", url: "https://claude.ai", description: "Anthropic's helpful, harmless, and honest AI", pricing: "FREEMIUM", categoryId: catMap["ai-chat"] },
    { name: "Gemini", slug: "gemini", url: "https://gemini.google.com", description: "Google's multimodal AI assistant", pricing: "FREEMIUM", categoryId: catMap["ai-chat"] },
    { name: "Grok", slug: "grok", url: "https://grok.x.ai", description: "xAI's witty conversational AI", pricing: "SUBSCRIPTION", categoryId: catMap["ai-chat"] },
    { name: "Perplexity", slug: "perplexity", url: "https://perplexity.ai", description: "AI-powered search engine with citations", pricing: "FREEMIUM", categoryId: catMap["ai-chat"] },
    { name: "Poe", slug: "poe", url: "https://poe.com", description: "Access multiple AI models in one place", pricing: "FREEMIUM", categoryId: catMap["ai-chat"] },
    { name: "HuggingChat", slug: "huggingchat", url: "https://huggingface.co/chat", description: "Open-source chat with various models", pricing: "FREE", categoryId: catMap["ai-chat"] },
    { name: "You.com", slug: "you-com", url: "https://you.com", description: "AI search engine with chat", pricing: "FREEMIUM", categoryId: catMap["ai-chat"] },
    
    // Agentic Coding
    { name: "GitHub Copilot", slug: "github-copilot", url: "https://github.com/features/copilot", downloadUrl: "https://marketplace.visualstudio.com/items?itemName=GitHub.copilot", description: "AI pair programmer by GitHub & OpenAI", pricing: "SUBSCRIPTION", categoryId: catMap["agentic-coding"] },
    { name: "Cursor", slug: "cursor", url: "https://cursor.com", downloadUrl: "https://cursor.com/download", description: "AI-first code editor built on VS Code", pricing: "FREEMIUM", categoryId: catMap["agentic-coding"] },
    { name: "Codeium", slug: "codeium", url: "https://codeium.com", downloadUrl: "https://codeium.com/download", description: "Free AI code completion and chat", pricing: "FREE", categoryId: catMap["agentic-coding"] },
    { name: "Tabnine", slug: "tabnine", url: "https://tabnine.com", downloadUrl: "https://tabnine.com/install", description: "AI code completion for all IDEs", pricing: "FREEMIUM", categoryId: catMap["agentic-coding"] },
    { name: "Amazon CodeWhisperer", slug: "codewhisperer", url: "https://aws.amazon.com/codewhisperer", description: "AWS AI coding companion", pricing: "FREEMIUM", categoryId: catMap["agentic-coding"] },
    { name: "Sourcegraph Cody", slug: "sourcegraph-cody", url: "https://sourcegraph.com/cody", description: "AI coding assistant with codebase context", pricing: "FREEMIUM", categoryId: catMap["agentic-coding"] },
    
    // CLI Tools
    { name: "Aider", slug: "aider", url: "https://aider.chat", downloadUrl: "https://github.com/Aider-AI/aider", description: "AI pair programming in your terminal", pricing: "OPEN_SOURCE", categoryId: catMap["cli-tools"] },
    { name: "Claude Code", slug: "claude-code", url: "https://docs.anthropic.com/claude/docs/claude-code", description: "Anthropic's CLI coding agent", pricing: "PAY_PER_USE", categoryId: catMap["cli-tools"] },
    { name: "OpenHands", slug: "openhands", url: "https://github.com/All-Hands-AI/OpenHands", downloadUrl: "https://github.com/All-Hands-AI/OpenHands", description: "Open-source AI software developer", pricing: "OPEN_SOURCE", categoryId: catMap["cli-tools"] },
    { name: "Warp", slug: "warp", url: "https://warp.dev", downloadUrl: "https://warp.dev/download", description: "AI-powered terminal for developers", pricing: "FREEMIUM", categoryId: catMap["cli-tools"] },
    { name: "Continue", slug: "continue", url: "https://continue.dev", downloadUrl: "https://github.com/continuedev/continue", description: "Open-source AI code assistant", pricing: "OPEN_SOURCE", categoryId: catMap["cli-tools"] },
    
    // IDE/Editor
    { name: "Windsurf", slug: "windsurf", url: "https://windsurf.com", downloadUrl: "https://windsurf.com/download", description: "AI-native IDE with Cascade agent", pricing: "FREEMIUM", categoryId: catMap["ide-editor"] },
    { name: "Zed", slug: "zed", url: "https://zed.dev", downloadUrl: "https://zed.dev/download", description: "Fast, collaborative code editor with AI", pricing: "FREE", categoryId: catMap["ide-editor"] },
    { name: "VS Code", slug: "vscode", url: "https://code.visualstudio.com", downloadUrl: "https://code.visualstudio.com/download", description: "Popular code editor with AI extensions", pricing: "FREE", categoryId: catMap["ide-editor"] },
    { name: "JetBrains AI", slug: "jetbrains-ai", url: "https://www.jetbrains.com/ai", description: "AI Assistant for JetBrains IDEs", pricing: "SUBSCRIPTION", categoryId: catMap["ide-editor"] },
    { name: "Neovim", slug: "neovim", url: "https://neovim.io", downloadUrl: "https://neovim.io/download", description: "Terminal editor with AI plugins", pricing: "OPEN_SOURCE", categoryId: catMap["ide-editor"] },
    
    // Vibe Coding
    { name: "Lovable", slug: "lovable", url: "https://lovable.dev", description: "Build full-stack apps with AI prompts", pricing: "FREEMIUM", categoryId: catMap["vibe-coding"] },
    { name: "Bolt", slug: "bolt", url: "https://bolt.new", description: "AI app builder in the browser", pricing: "FREEMIUM", categoryId: catMap["vibe-coding"] },
    { name: "v0", slug: "v0", url: "https://v0.dev", description: "Vercel's AI UI generator", pricing: "FREEMIUM", categoryId: catMap["vibe-coding"] },
    { name: "Replit Agent", slug: "replit-agent", url: "https://replit.com", description: "Build apps with AI in browser", pricing: "FREEMIUM", categoryId: catMap["vibe-coding"] },
    { name: "Create", slug: "create-xyz", url: "https://create.xyz", description: "AI-powered app creation platform", pricing: "FREEMIUM", categoryId: catMap["vibe-coding"] },
    
    // Image Generation
    { name: "Midjourney", slug: "midjourney", url: "https://midjourney.com", description: "Best-in-class AI image generation", pricing: "SUBSCRIPTION", categoryId: catMap["image-generation"] },
    { name: "DALL-E 3", slug: "dalle-3", url: "https://openai.com/dall-e-3", description: "OpenAI's image generation model", pricing: "PAY_PER_USE", categoryId: catMap["image-generation"] },
    { name: "Stable Diffusion", slug: "stable-diffusion", url: "https://stability.ai", downloadUrl: "https://github.com/AUTOMATIC1111/stable-diffusion-webui", description: "Open-source image generation", pricing: "OPEN_SOURCE", categoryId: catMap["image-generation"] },
    { name: "Leonardo AI", slug: "leonardo-ai", url: "https://leonardo.ai", description: "AI image generation for creators", pricing: "FREEMIUM", categoryId: catMap["image-generation"] },
    { name: "Ideogram", slug: "ideogram", url: "https://ideogram.ai", description: "AI image generation with text", pricing: "FREEMIUM", categoryId: catMap["image-generation"] },
    { name: "Flux", slug: "flux", url: "https://flux.ai", description: "Fast, high-quality image generation", pricing: "FREEMIUM", categoryId: catMap["image-generation"] },
    { name: "Adobe Firefly", slug: "adobe-firefly", url: "https://firefly.adobe.com", description: "Adobe's generative AI for creatives", pricing: "FREEMIUM", categoryId: catMap["image-generation"] },
    
    // AI Design
    { name: "Canva AI", slug: "canva-ai", url: "https://canva.com", description: "Design platform with AI features", pricing: "FREEMIUM", categoryId: catMap["ai-design"] },
    { name: "Figma AI", slug: "figma-ai", url: "https://figma.com", description: "Design tool with AI capabilities", pricing: "FREEMIUM", categoryId: catMap["ai-design"] },
    { name: "Looka", slug: "looka", url: "https://looka.com", description: "AI logo and brand design", pricing: "FREEMIUM", categoryId: catMap["ai-design"] },
    { name: "Uizard", slug: "uizard", url: "https://uizard.io", description: "AI UI/UX design tool", pricing: "FREEMIUM", categoryId: catMap["ai-design"] },
    { name: "Galileo AI", slug: "galileo-ai", url: "https://usegalileo.ai", description: "AI-powered UI design generation", pricing: "FREEMIUM", categoryId: catMap["ai-design"] },
    { name: "Framer AI", slug: "framer-ai", url: "https://framer.com", description: "AI website builder and design", pricing: "FREEMIUM", categoryId: catMap["ai-design"] },
    
    // Video Generation
    { name: "Sora", slug: "sora", url: "https://openai.com/sora", description: "OpenAI's text-to-video model", pricing: "PAY_PER_USE", categoryId: catMap["video-generation"] },
    { name: "Runway", slug: "runway", url: "https://runway.ml", description: "AI video generation and editing", pricing: "FREEMIUM", categoryId: catMap["video-generation"] },
    { name: "Pika", slug: "pika", url: "https://pika.art", description: "AI video creation platform", pricing: "FREEMIUM", categoryId: catMap["video-generation"] },
    { name: "Synthesia", slug: "synthesia", url: "https://synthesia.io", description: "AI video with digital avatars", pricing: "SUBSCRIPTION", categoryId: catMap["video-generation"] },
    { name: "HeyGen", slug: "heygen", url: "https://heygen.com", description: "AI avatar video generation", pricing: "FREEMIUM", categoryId: catMap["video-generation"] },
    { name: "D-ID", slug: "d-id", url: "https://d-id.com", description: "AI talking head videos", pricing: "FREEMIUM", categoryId: catMap["video-generation"] },
    { name: "Kling AI", slug: "kling-ai", url: "https://klingai.com", description: "Text-to-video by Kuaishou", pricing: "FREEMIUM", categoryId: catMap["video-generation"] },
    
    // Video Editing
    { name: "CapCut", slug: "capcut", url: "https://capcut.com", downloadUrl: "https://capcut.com/download", description: "Free video editor with AI features", pricing: "FREE", categoryId: catMap["video-editing"] },
    { name: "Descript", slug: "descript", url: "https://descript.com", downloadUrl: "https://descript.com/download", description: "AI video/audio editing by text", pricing: "FREEMIUM", categoryId: catMap["video-editing"] },
    { name: "OpusClip", slug: "opusclip", url: "https://opus.pro", description: "AI video repurposing for shorts", pricing: "FREEMIUM", categoryId: catMap["video-editing"] },
    { name: "Pictory", slug: "pictory", url: "https://pictory.ai", description: "AI video creation from text", pricing: "FREEMIUM", categoryId: catMap["video-editing"] },
    { name: "Kapwing", slug: "kapwing", url: "https://kapwing.com", description: "Online video editor with AI", pricing: "FREEMIUM", categoryId: catMap["video-editing"] },
    
    // Voice Generation
    { name: "ElevenLabs", slug: "elevenlabs", url: "https://elevenlabs.io", description: "Best AI voice synthesis and cloning", pricing: "FREEMIUM", categoryId: catMap["voice-generation"] },
    { name: "Murf", slug: "murf", url: "https://murf.ai", description: "AI voice generator for videos", pricing: "FREEMIUM", categoryId: catMap["voice-generation"] },
    { name: "PlayHT", slug: "playht", url: "https://play.ht", description: "AI text-to-speech platform", pricing: "FREEMIUM", categoryId: catMap["voice-generation"] },
    { name: "Resemble AI", slug: "resemble-ai", url: "https://resemble.ai", description: "AI voice cloning and synthesis", pricing: "FREEMIUM", categoryId: catMap["voice-generation"] },
    { name: "Speechify", slug: "speechify", url: "https://speechify.com", description: "Text-to-speech with AI voices", pricing: "FREEMIUM", categoryId: catMap["voice-generation"] },
    
    // Music Generation
    { name: "Suno", slug: "suno", url: "https://suno.ai", description: "AI music generation from text", pricing: "FREEMIUM", categoryId: catMap["music-generation"] },
    { name: "Udio", slug: "udio", url: "https://udio.com", description: "AI music creation platform", pricing: "FREEMIUM", categoryId: catMap["music-generation"] },
    { name: "AIVA", slug: "aiva", url: "https://aiva.ai", description: "AI music composer", pricing: "FREEMIUM", categoryId: catMap["music-generation"] },
    { name: "Soundraw", slug: "soundraw", url: "https://soundraw.io", description: "AI music for creators", pricing: "SUBSCRIPTION", categoryId: catMap["music-generation"] },
    { name: "Boomy", slug: "boomy", url: "https://boomy.com", description: "Create and release AI music", pricing: "FREEMIUM", categoryId: catMap["music-generation"] },
    
    // AI Agents
    { name: "AutoGPT", slug: "autogpt", url: "https://agpt.co", downloadUrl: "https://github.com/Significant-Gravitas/AutoGPT", description: "Autonomous AI agent framework", pricing: "OPEN_SOURCE", categoryId: catMap["ai-agents"] },
    { name: "AgentGPT", slug: "agentgpt", url: "https://agentgpt.reworkd.ai", description: "Browser-based autonomous AI agent", pricing: "FREEMIUM", categoryId: catMap["ai-agents"] },
    { name: "CrewAI", slug: "crewai", url: "https://crewai.com", downloadUrl: "https://github.com/crewAIInc/crewAI", description: "Multi-agent AI framework", pricing: "OPEN_SOURCE", categoryId: catMap["ai-agents"] },
    { name: "Devin", slug: "devin", url: "https://cognition.ai", description: "AI software engineer by Cognition", pricing: "ENTERPRISE", categoryId: catMap["ai-agents"] },
    { name: "Cline", slug: "cline", url: "https://github.com/cline/cline", downloadUrl: "https://github.com/cline/cline", description: "Autonomous coding agent for IDE", pricing: "OPEN_SOURCE", categoryId: catMap["ai-agents"] },
    { name: "Goose", slug: "goose", url: "https://github.com/block/goose", downloadUrl: "https://github.com/block/goose", description: "Extensible AI agent by Block", pricing: "OPEN_SOURCE", categoryId: catMap["ai-agents"] },
    
    // Writing
    { name: "Jasper", slug: "jasper", url: "https://jasper.ai", description: "AI content and marketing writing", pricing: "SUBSCRIPTION", categoryId: catMap["writing"] },
    { name: "Copy.ai", slug: "copy-ai", url: "https://copy.ai", description: "AI copywriting assistant", pricing: "FREEMIUM", categoryId: catMap["writing"] },
    { name: "Writesonic", slug: "writesonic", url: "https://writesonic.com", description: "AI writing and content generation", pricing: "FREEMIUM", categoryId: catMap["writing"] },
    { name: "Grammarly", slug: "grammarly", url: "https://grammarly.com", downloadUrl: "https://grammarly.com/desktop", description: "AI writing assistant and grammar", pricing: "FREEMIUM", categoryId: catMap["writing"] },
    { name: "QuillBot", slug: "quillbot", url: "https://quillbot.com", description: "AI paraphrasing and writing tool", pricing: "FREEMIUM", categoryId: catMap["writing"] },
    { name: "Notion AI", slug: "notion-ai", url: "https://notion.so/product/ai", description: "AI writing in Notion workspace", pricing: "SUBSCRIPTION", categoryId: catMap["writing"] },
    { name: "Sudowrite", slug: "sudowrite", url: "https://sudowrite.com", description: "AI writing for fiction authors", pricing: "SUBSCRIPTION", categoryId: catMap["writing"] },
    
    // Research
    { name: "Elicit", slug: "elicit", url: "https://elicit.com", description: "AI research assistant", pricing: "FREEMIUM", categoryId: catMap["research"] },
    { name: "Consensus", slug: "consensus", url: "https://consensus.app", description: "AI search for scientific papers", pricing: "FREEMIUM", categoryId: catMap["research"] },
    { name: "Semantic Scholar", slug: "semantic-scholar", url: "https://semanticscholar.org", description: "AI-powered academic search", pricing: "FREE", categoryId: catMap["research"] },
    { name: "Scite", slug: "scite", url: "https://scite.ai", description: "AI for smart citations", pricing: "FREEMIUM", categoryId: catMap["research"] },
    { name: "NotebookLM", slug: "notebooklm", url: "https://notebooklm.google.com", description: "Google's AI research notebook", pricing: "FREE", categoryId: catMap["research"] },
    
    // Workflow/Automation
    { name: "Zapier", slug: "zapier", url: "https://zapier.com", description: "Workflow automation with AI", pricing: "FREEMIUM", categoryId: catMap["workflow"] },
    { name: "Make", slug: "make", url: "https://make.com", description: "Visual automation platform", pricing: "FREEMIUM", categoryId: catMap["workflow"] },
    { name: "n8n", slug: "n8n", url: "https://n8n.io", downloadUrl: "https://github.com/n8n-io/n8n", description: "Open-source workflow automation", pricing: "OPEN_SOURCE", categoryId: catMap["workflow"] },
    { name: "Bardeen", slug: "bardeen", url: "https://bardeen.ai", description: "AI workflow automation", pricing: "FREEMIUM", categoryId: catMap["workflow"] },
    { name: "Activepieces", slug: "activepieces", url: "https://activepieces.com", downloadUrl: "https://github.com/activepieces/activepieces", description: "Open-source automation tool", pricing: "OPEN_SOURCE", categoryId: catMap["workflow"] },
    
    // Meeting Assistant
    { name: "Otter.ai", slug: "otter-ai", url: "https://otter.ai", description: "AI meeting transcription and notes", pricing: "FREEMIUM", categoryId: catMap["meeting-assistant"] },
    { name: "Fathom", slug: "fathom", url: "https://fathom.video", description: "Free AI meeting assistant", pricing: "FREEMIUM", categoryId: catMap["meeting-assistant"] },
    { name: "Fireflies.ai", slug: "fireflies-ai", url: "https://fireflies.ai", description: "AI meeting notes and search", pricing: "FREEMIUM", categoryId: catMap["meeting-assistant"] },
    { name: "Krisp", slug: "krisp", url: "https://krisp.ai", downloadUrl: "https://krisp.ai/download", description: "AI noise cancellation and notes", pricing: "FREEMIUM", categoryId: catMap["meeting-assistant"] },
    { name: "Grain", slug: "grain", url: "https://grain.com", description: "AI meeting recording and highlights", pricing: "FREEMIUM", categoryId: catMap["meeting-assistant"] },
    
    // Presentation
    { name: "Gamma", slug: "gamma", url: "https://gamma.app", description: "AI presentation and doc creator", pricing: "FREEMIUM", categoryId: catMap["presentation"] },
    { name: "Beautiful.ai", slug: "beautiful-ai", url: "https://beautiful.ai", description: "AI-powered presentations", pricing: "FREEMIUM", categoryId: catMap["presentation"] },
    { name: "Tome", slug: "tome", url: "https://tome.app", description: "AI storytelling and presentations", pricing: "FREEMIUM", categoryId: catMap["presentation"] },
    { name: "SlidesAI", slug: "slidesai", url: "https://slidesai.io", description: "AI slides from text", pricing: "FREEMIUM", categoryId: catMap["presentation"] },
    { name: "Decktopus", slug: "decktopus", url: "https://decktopus.com", description: "AI presentation maker", pricing: "FREEMIUM", categoryId: catMap["presentation"] },
    
    // API Providers
    { name: "OpenAI API", slug: "openai-api", url: "https://platform.openai.com", description: "GPT-4, DALL-E, Whisper APIs", pricing: "PAY_PER_USE", categoryId: catMap["api-providers"] },
    { name: "Anthropic API", slug: "anthropic-api", url: "https://anthropic.com/api", description: "Claude API access", pricing: "PAY_PER_USE", categoryId: catMap["api-providers"] },
    { name: "Google AI Studio", slug: "google-ai-studio", url: "https://aistudio.google.com", description: "Gemini API access", pricing: "FREEMIUM", categoryId: catMap["api-providers"] },
    { name: "Groq", slug: "groq", url: "https://groq.com", description: "Ultra-fast LLM inference", pricing: "FREEMIUM", categoryId: catMap["api-providers"] },
    { name: "Together AI", slug: "together-ai", url: "https://together.ai", description: "Open-source model hosting", pricing: "FREEMIUM", categoryId: catMap["api-providers"] },
    { name: "Replicate", slug: "replicate", url: "https://replicate.com", description: "Run ML models via API", pricing: "PAY_PER_USE", categoryId: catMap["api-providers"] },
    { name: "Hugging Face", slug: "hugging-face", url: "https://huggingface.co", description: "ML models and datasets hub", pricing: "FREEMIUM", categoryId: catMap["api-providers"] },
    { name: "Hyperbolic", slug: "hyperbolic", url: "https://hyperbolic.xyz", description: "GPU cloud for AI inference", pricing: "FREEMIUM", categoryId: catMap["api-providers"] },
    { name: "Fireworks AI", slug: "fireworks-ai", url: "https://fireworks.ai", description: "Fast AI inference platform", pricing: "FREEMIUM", categoryId: catMap["api-providers"] },
  ]

  let created = 0
  let skipped = 0

  for (const tool of tools) {
    if (!tool.categoryId) {
      console.log(`Skipping ${tool.name} - category not found`)
      skipped++
      continue
    }

    const existing = await prisma.tool.findUnique({ where: { slug: tool.slug } })
    if (existing) {
      skipped++
      continue
    }

    await prisma.tool.create({
      data: {
        ...tool,
        userId: user.id,
      },
    })
    created++
  }

  console.log(`\n✅ Seeding completed!`)
  console.log(`Created: ${created} tools`)
  console.log(`Skipped: ${skipped} tools (already exist or no category)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
