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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { email: { contains: search, mode: "insensitive" as const } },
        { name: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              projects: { where: { deletedAt: null } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Get API key counts per user
    const userIds = users.map(u => u.id)
    const apiKeyCounts = await prisma.apiKey.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, deletedAt: null },
      _count: true,
    })
    
    const apiKeyCountMap = new Map(apiKeyCounts.map(a => [a.userId, a._count]))

    const usersWithStats = users.map(user => ({
      ...user,
      _count: {
        ...user._count,
        apiKeys: apiKeyCountMap.get(user.id) || 0,
      },
    }))

    return NextResponse.json({
      data: usersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/admin/users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
