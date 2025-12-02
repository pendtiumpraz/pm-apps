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

// Get user detail with stats
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!await checkAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: { where: { deletedAt: null } },
            activities: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get API key stats (count per platform, not the actual keys)
    const apiKeyStats = await prisma.apiKey.groupBy({
      by: ["platformId"],
      where: { userId: params.id, deletedAt: null },
      _count: true,
      _sum: { creditTotal: true, creditUsed: true, tokenTotal: true, tokenUsed: true },
    })

    const platformIds = apiKeyStats.map(s => s.platformId)
    const platforms = await prisma.apiPlatform.findMany({
      where: { id: { in: platformIds } },
      select: { id: true, name: true, color: true },
    })
    const platformMap = new Map(platforms.map(p => [p.id, p]))

    const apiKeysByPlatform = apiKeyStats.map(stat => ({
      platform: platformMap.get(stat.platformId),
      count: stat._count,
      creditTotal: stat._sum.creditTotal || 0,
      creditUsed: stat._sum.creditUsed || 0,
      tokenTotal: stat._sum.tokenTotal || 0,
      tokenUsed: stat._sum.tokenUsed || 0,
    }))

    return NextResponse.json({
      data: {
        ...user,
        apiKeyStats: {
          total: apiKeyStats.reduce((sum, s) => sum + s._count, 0),
          byPlatform: apiKeysByPlatform,
        },
      },
    })
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// Update user (change role, ban, etc.)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!await checkAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { role } = body

    // Prevent admin from demoting themselves
    if (params.id === session?.user?.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("PUT /api/admin/users/[id] error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// Delete user (soft delete all their data)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!await checkAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Prevent admin from deleting themselves
    if (params.id === session?.user?.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    // Delete user and cascade to their data
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "User deleted" })
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
