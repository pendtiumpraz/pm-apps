import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// Default platforms to seed
const DEFAULT_PLATFORMS = [
  { name: "Hyperbolic", slug: "hyperbolic", color: "#6366F1" },
  { name: "Droid", slug: "droid", color: "#8B5CF6" },
  { name: "Requesty", slug: "requesty", color: "#EC4899" },
  { name: "Nebius Studio", slug: "nebius-studio", color: "#10B981" },
  { name: "Kluster.ai", slug: "kluster-ai", color: "#F59E0B" },
  { name: "SambaNova", slug: "sambanova", color: "#EF4444" },
  { name: "Groq", slug: "groq", color: "#F97316" },
  { name: "Cerebras", slug: "cerebras", color: "#14B8A6" },
  { name: "Fireworks.ai", slug: "fireworks-ai", color: "#F43F5E" },
  { name: "Together.ai", slug: "together-ai", color: "#3B82F6" },
  { name: "Cabina.ai", slug: "cabina-ai", color: "#A855F7" },
  { name: "MegaLLM", slug: "megallm", color: "#22C55E" },
]

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user has platforms, if not seed defaults
    const existingCount = await prisma.apiPlatform.count({
      where: { userId, deletedAt: null },
    })

    if (existingCount === 0) {
      await prisma.apiPlatform.createMany({
        data: DEFAULT_PLATFORMS.map((p) => ({ ...p, userId })),
      })
    }

    const platforms = await prisma.apiPlatform.findMany({
      where: { userId, deletedAt: null },
      include: {
        _count: { select: { apiKeys: { where: { deletedAt: null } } } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ data: platforms })
  } catch (error) {
    console.error("GET /api/platforms error:", error)
    return NextResponse.json({ error: "Failed to fetch platforms" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, website, description, color } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    const platform = await prisma.apiPlatform.create({
      data: {
        userId: session.user.id,
        name,
        slug,
        website,
        description,
        color: color || "#6366F1",
      },
    })

    return NextResponse.json({ data: platform }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/platforms error:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Platform already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create platform" }, { status: 500 })
  }
}
