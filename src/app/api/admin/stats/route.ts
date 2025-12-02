import { NextResponse } from "next/server"
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

export async function GET() {
  try {
    const session = await auth()
    if (!await checkAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      totalProjects,
      totalTasks,
      totalApiKeys,
      totalPlatforms,
      recentUsers,
      usersByMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: thisWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.task.count({ where: { deletedAt: null } }),
      prisma.apiKey.count({ where: { deletedAt: null } }),
      prisma.apiPlatform.count({ where: { deletedAt: null } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
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
      }),
      // User registrations by month (last 6 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
    ])

    return NextResponse.json({
      data: {
        users: {
          total: totalUsers,
          today: usersToday,
          thisWeek: usersThisWeek,
          thisMonth: usersThisMonth,
        },
        content: {
          projects: totalProjects,
          tasks: totalTasks,
          apiKeys: totalApiKeys,
          platforms: totalPlatforms,
        },
        recentUsers,
        usersByMonth,
      },
    })
  } catch (error) {
    console.error("GET /api/admin/stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
