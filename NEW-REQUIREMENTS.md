# New Requirements - AI Tools Features

## Overview
Menambahkan menu baru untuk mengelola dan menampilkan AI Tools yang berguna untuk developer.

---

## 1. AI Tools Directory (`/tools`)

### Description
Direktori lengkap AI tools yang bisa di-view dan ditambahkan oleh semua user, tapi hanya admin yang bisa delete.

### Categories (50+)
| Category | Examples |
|----------|----------|
| **Agentic Coding** | Cursor, GitHub Copilot, Codeium, Tabnine |
| **CLI Tools** | Droid, Aider, Claude CLI, OpenAI CLI |
| **IDE/Editor** | Cursor, Windsurf, VS Code, Zed |
| **Vibe Coding** | Lovable, Bolt, v0.dev, Replit Agent |
| **AI Design** | Canva AI, Figma AI, Looka |
| **Image Generation** | Midjourney, DALL-E, Stable Diffusion, Flux |
| **Video Generation** | Synthesia, Runway, Pika, Sora |
| **Video Editing** | CapCut, Descript, OpusClip |
| **Voice Generation** | ElevenLabs, Murf, PlayHT |
| **Music Generation** | Suno, Udio, AIVA |
| **AI Chat** | ChatGPT, Claude, Gemini, Grok |
| **AI Agents** | AutoGPT, AgentGPT, CrewAI |
| **Writing** | Jasper, Copy.ai, Writesonic |
| **Research** | Perplexity, Elicit, Consensus |
| **Workflow** | Zapier, Make, n8n |
| **Meeting Assistant** | Otter.ai, Fathom, Fireflies |
| **Presentation** | Gamma, Beautiful.ai, Tome |

### Pricing Categories
| Pricing | Description |
|---------|-------------|
| `FREE` | 100% Free, no limits |
| `FREEMIUM` | Free tier + paid upgrades |
| `FREE_TRIAL` | Limited time free |
| `PAY_PER_USE` | Credit/usage based |
| `SUBSCRIPTION` | Monthly/yearly |
| `ENTERPRISE` | Custom pricing |
| `OPEN_SOURCE` | Free, self-hosted |

### Permissions
| Action | User | Admin |
|--------|------|-------|
| View all tools | ✅ | ✅ |
| Add tool | ✅ | ✅ |
| Edit own tool | ✅ | ✅ |
| Delete tool | ❌ | ✅ |
| Add category | ✅ | ✅ |
| Edit category | ❌ | ✅ |
| Delete category | ❌ | ✅ |

### Fields
- `name` - Tool name
- `url` - Website URL
- `downloadUrl` - Download link (optional)
- `description` - Short description
- `pricing` - Pricing category
- `categoryId` - Foreign key to category
- `notes` - Additional notes

---

## 2. Best AI Models (`/best-ai-models`)

### Description
Top 20 AI models dari SWE-bench leaderboard. Hanya admin yang bisa input/edit/delete.

### Data (from swebench.com - SWE-bench Verified)
| Rank | Model | % Resolved | Cost/Task | Organization |
|------|-------|------------|-----------|--------------|
| 1 | Claude 4.5 Opus (20251101) | 74.40% | $0.72 | Anthropic |
| 2 | Gemini 3 Pro Preview | 74.20% | $0.46 | Google DeepMind |
| 3 | Claude 4.5 Sonnet (20250929) | 70.60% | $0.56 | Anthropic |
| 4 | Claude 4 Opus (20250514) | 67.60% | $1.13 | Anthropic |
| 5 | GPT-5 (medium reasoning) | 65.00% | $0.28 | OpenAI |
| 6 | Claude 4 Sonnet (20250514) | 64.93% | $0.37 | Anthropic |
| 7 | GPT-5 mini (medium reasoning) | 59.80% | $0.04 | OpenAI |
| 8 | o3 (2025-04-16) | 58.40% | $0.33 | OpenAI |
| 9 | Qwen3-Coder 480B/A35B | 55.40% | $0.25 | Qwen |
| 10 | GLM-4.5 | 54.20% | $0.30 | Z.ai |
| 11 | Gemini 2.5 Pro | 53.60% | $0.29 | Google DeepMind |
| 12 | Claude 3.7 Sonnet | 52.80% | $0.35 | Anthropic |
| 13 | o4-mini (2025-04-16) | 45.00% | $0.21 | OpenAI |
| 14 | Kimi K2 Instruct | 43.80% | $0.53 | Moonshot AI |
| 15 | GPT-4.1 | 39.58% | $0.15 | OpenAI |
| 16 | GPT-5 nano (medium reasoning) | 34.80% | $0.04 | OpenAI |
| 17 | Gemini 2.5 Flash | 28.73% | $0.13 | Google DeepMind |
| 18 | gpt-oss-120b | 26.00% | $0.06 | OpenAI |
| 19 | GPT-4.1-mini | 23.94% | $0.44 | OpenAI |
| 20 | GPT-4o | 21.62% | $1.53 | OpenAI |

### Permissions
| Action | User | Admin |
|--------|------|-------|
| View | ✅ | ✅ |
| Add | ❌ | ✅ |
| Edit | ❌ | ✅ |
| Delete | ❌ | ✅ |

---

## 3. Best AI IDEs (`/best-ide`)

### Description
Top AI-powered IDEs dengan link download. Hanya admin yang bisa input/edit/delete.

### Data
| Rank | Name | Description | Download URL | Pricing |
|------|------|-------------|--------------|---------|
| 1 | **Cursor** | AI-first code editor, fork of VS Code | https://cursor.com/download | Freemium ($20/mo) |
| 2 | **Windsurf** | AI-native IDE with Cascade agent | https://windsurf.com/download | Freemium ($15/mo) |
| 3 | **Zed** | Fast, Rust-based editor with AI | https://zed.dev/download | Free |
| 4 | **VS Code + Copilot** | Most popular IDE with AI extension | https://code.visualstudio.com/download | Freemium ($10/mo) |
| 5 | **JetBrains + AI** | Professional IDEs with AI Assistant | https://www.jetbrains.com/ai/ | Subscription |
| 6 | **Replit** | Browser-based AI coding | https://replit.com | Freemium |
| 7 | **Neovim + AI** | Terminal editor with AI plugins | https://neovim.io | Free |
| 8 | **Sublime Text + AI** | Lightweight editor with AI | https://www.sublimetext.com/download | Paid ($99) |

### Permissions
| Action | User | Admin |
|--------|------|-------|
| View | ✅ | ✅ |
| Add | ❌ | ✅ |
| Edit | ❌ | ✅ |
| Delete | ❌ | ✅ |

---

## 4. Best AI CLIs (`/best-cli`)

### Description
Top AI CLI tools untuk terminal coding. Hanya admin yang bisa input/edit/delete.

### Data
| Rank | Name | Description | GitHub URL | Stars |
|------|------|-------------|------------|-------|
| 1 | **Aider** | AI pair programming in terminal | https://github.com/Aider-AI/aider | 38.7k |
| 2 | **Claude Code** | Anthropic's CLI coding agent | https://github.com/anthropics/claude-code | - |
| 3 | **OpenHands CLI** | AI-powered dev in terminal | https://github.com/All-Hands-AI/OpenHands | 47k |
| 4 | **Codex CLI** | OpenAI's terminal assistant | https://github.com/openai/codex-cli | - |
| 5 | **Gemini CLI** | Google's AI CLI tool | https://github.com/google/gemini-cli | - |
| 6 | **Warp** | AI-powered terminal | https://github.com/warpdotdev/Warp | 21k |
| 7 | **Droid** | Factory AI CLI agent | https://factory.ai | - |
| 8 | **Amazon Q CLI** | AWS AI coding assistant | https://aws.amazon.com/q/developer/ | - |
| 9 | **Continue** | Open-source AI code assistant | https://github.com/continuedev/continue | 24k |
| 10 | **TabbyML** | Self-hosted AI coding | https://github.com/TabbyML/tabby | 25k |

### Permissions
| Action | User | Admin |
|--------|------|-------|
| View | ✅ | ✅ |
| Add | ❌ | ✅ |
| Edit | ❌ | ✅ |
| Delete | ❌ | ✅ |

---

## 5. Best CLI Orchestrators (`/best-orchestrator`)

### Description
Top multi-agent CLI orchestrators. Hanya admin yang bisa input/edit/delete.

### Data
| Rank | Name | Description | GitHub URL | Stars |
|------|------|-------------|------------|-------|
| 1 | **Goose** | Extensible AI agent by Block | https://github.com/block/goose | 22.3k |
| 2 | **Cline** | Autonomous coding agent for IDE | https://github.com/cline/cline | 53.6k |
| 3 | **SWE-agent** | AI for software engineering | https://github.com/SWE-agent/SWE-agent | 15k |
| 4 | **OpenDevin** | Open-source Devin alternative | https://github.com/All-Hands-AI/OpenHands | 47k |
| 5 | **AgentBase** | Multi-agent orchestrator | https://github.com/AgentOrchestrator/AgentBase | - |
| 6 | **Orchestra** | Cognitive architectures | https://github.com/mainframecomputer/orchestra | - |
| 7 | **CoAgent** | Distributed agentic systems | https://github.com/OpenCSGs/coagent | - |
| 8 | **CLI Agent Orchestrator** | AWS multi-agent framework | https://aws.amazon.com/blogs/opensource | - |
| 9 | **CrewAI** | AI agent crews | https://github.com/crewAIInc/crewAI | 28k |
| 10 | **AutoGen** | Microsoft multi-agent | https://github.com/microsoft/autogen | 40k |

### Permissions
| Action | User | Admin |
|--------|------|-------|
| View | ✅ | ✅ |
| Add | ❌ | ✅ |
| Edit | ❌ | ✅ |
| Delete | ❌ | ✅ |

---

## Database Schema

```prisma
// Tool Categories (for AI Tools Directory)
model ToolCategory {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  icon        String?
  color       String   @default("#6366F1")
  createdBy   String?
  user        User?    @relation(fields: [createdBy], references: [id])
  tools       Tool[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}

// AI Tools Directory
model Tool {
  id           String        @id @default(cuid())
  name         String
  slug         String        @unique
  url          String
  downloadUrl  String?
  description  String?
  pricing      ToolPricing   @default(FREEMIUM)
  categoryId   String
  category     ToolCategory  @relation(fields: [categoryId], references: [id])
  notes        String?
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  deletedAt    DateTime?
}

enum ToolPricing {
  FREE
  FREEMIUM
  FREE_TRIAL
  PAY_PER_USE
  SUBSCRIPTION
  ENTERPRISE
  OPEN_SOURCE
}

// Best AI Models (Admin only)
model BestAiModel {
  id           String   @id @default(cuid())
  rank         Int
  name         String
  resolved     Float    // percentage
  costPerTask  Float?
  organization String
  link         String?
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?
}

// Best IDEs (Admin only)
model BestIde {
  id          String   @id @default(cuid())
  rank        Int
  name        String
  description String?
  downloadUrl String
  pricing     String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}

// Best CLIs (Admin only)
model BestCli {
  id          String   @id @default(cuid())
  rank        Int
  name        String
  description String?
  githubUrl   String
  stars       String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}

// Best CLI Orchestrators (Admin only)
model BestOrchestrator {
  id          String   @id @default(cuid())
  rank        Int
  name        String
  description String?
  githubUrl   String
  stars       String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}
```

---

## Frontend Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/tools` | AI Tools Directory | All users |
| `/tools/categories` | Browse by category | All users |
| `/best-ai-models` | SWE-bench leaderboard | All users (view only) |
| `/best-ide` | Top AI IDEs | All users (view only) |
| `/best-cli` | Top AI CLI tools | All users (view only) |
| `/best-orchestrator` | Top orchestrators | All users (view only) |
| `/admin/tools` | Manage tools | Admin only |
| `/admin/best-lists` | Manage best lists | Admin only |

---

## API Routes

### Tools (User accessible)
- `GET /api/tools` - List all tools
- `POST /api/tools` - Add tool (auth required)
- `GET /api/tools/[id]` - Get tool detail
- `PUT /api/tools/[id]` - Update own tool
- `DELETE /api/tools/[id]` - Admin only

### Categories (User can add, Admin can edit/delete)
- `GET /api/tool-categories` - List categories
- `POST /api/tool-categories` - Add category (auth)
- `PUT /api/tool-categories/[id]` - Admin only
- `DELETE /api/tool-categories/[id]` - Admin only

### Best Lists (Admin only for CUD)
- `GET /api/best-ai-models` - Public read
- `POST/PUT/DELETE /api/best-ai-models` - Admin only

- `GET /api/best-ide` - Public read
- `POST/PUT/DELETE /api/best-ide` - Admin only

- `GET /api/best-cli` - Public read
- `POST/PUT/DELETE /api/best-cli` - Admin only

- `GET /api/best-orchestrator` - Public read
- `POST/PUT/DELETE /api/best-orchestrator` - Admin only

---

## Implementation Steps

1. ✅ Create NEW-REQUIREMENTS.md
2. [ ] Update Prisma schema
3. [ ] Run prisma db push
4. [ ] Seed initial data (Best AI Models, IDEs, CLIs, Orchestrators)
5. [ ] Create API routes for tools & categories
6. [ ] Create API routes for best lists
7. [ ] Build /tools page with grid/list view
8. [ ] Build /best-ai-models page
9. [ ] Build /best-ide page
10. [ ] Build /best-cli page
11. [ ] Build /best-orchestrator page
12. [ ] Add navigation menu
13. [ ] Build admin management pages
14. [ ] TypeScript check & deploy
