import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

async function checkAdmin(session: any) {
  if (!session?.user?.id) return false
  const isAdminRole = (session.user as any).role === "ADMIN"
  const adminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || []
  const isAdminEmail = session.user.email && adminEmails.includes(session.user.email.toLowerCase())
  return isAdminRole || isAdminEmail
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!await checkAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    // Get all unique platforms across all users
    const platforms = await prisma.apiPlatform.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          name: { contains: search, mode: "insensitive" as const },
        }),
      },
      select: {
        id: true,
        userId: true,
        name: true,
        slug: true,
        website: true,
        color: true,
        createdAt: true,
        _count: {
          select: {
            apiKeys: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    // Group by slug to find unique platforms and count users
    const platformsBySlug = new Map<string, {
      name: string
      slug: string
      website: string | null
      color: string | null
      userCount: number
      apiKeyCount: number
      instances: typeof platforms
    }>()

    for (const p of platforms) {
      const existing = platformsBySlug.get(p.slug)
      if (existing) {
        existing.userCount++
        existing.apiKeyCount += p._count.apiKeys
        existing.instances.push(p)
      } else {
        platformsBySlug.set(p.slug, {
          name: p.name,
          slug: p.slug,
          website: p.website,
          color: p.color,
          userCount: 1,
          apiKeyCount: p._count.apiKeys,
          instances: [p],
        })
      }
    }

    const aggregatedPlatforms = Array.from(platformsBySlug.values())
      .sort((a, b) => b.userCount - a.userCount)

    return NextResponse.json({
      data: aggregatedPlatforms,
      totalPlatforms: platforms.length,
      uniquePlatforms: platformsBySlug.size,
    })
  } catch (error) {
    console.error("GET /api/admin/platforms error:", error)
    return NextResponse.json({ error: "Failed to fetch platforms" }, { status: 500 })
  }
}
