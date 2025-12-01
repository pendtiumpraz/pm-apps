import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    // Run all queries in parallel
    const [
      totalProjects,
      projectsByStatus,
      totalTasks,
      tasksByStatus,
      monthlyPayments,
      projectFinancials,
      upcomingDeadlines,
      expiringDomains,
      expiringHostings,
      recentActivities,
      monthlyIncome,
    ] = await Promise.all([
      // Total projects
      prisma.project.count({ where: { userId, deletedAt: null } }),
      
      // Projects by status
      prisma.project.groupBy({
        by: ["status"],
        where: { userId, deletedAt: null },
        _count: true,
      }),
      
      // Total tasks
      prisma.task.count({ where: { project: { userId, deletedAt: null }, deletedAt: null } }),
      
      // Tasks by status
      prisma.task.groupBy({
        by: ["status"],
        where: { project: { userId, deletedAt: null }, deletedAt: null },
        _count: true,
      }),
      
      // Monthly payments (this month)
      prisma.payment.aggregate({
        where: {
          project: { userId, deletedAt: null },
          deletedAt: null,
          status: "PAID",
          paymentDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
        _count: true,
      }),
      
      // Project financials
      prisma.project.aggregate({
        where: { userId, deletedAt: null },
        _sum: { totalValue: true, paidAmount: true },
      }),
      
      // Upcoming deadlines (next 14 days)
      prisma.project.findMany({
        where: {
          userId,
          deletedAt: null,
          status: { in: ["ACTIVE", "PLANNING", "REVIEW"] },
          deadline: {
            gte: now,
            lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          name: true,
          client: true,
          deadline: true,
          status: true,
          progress: true,
          color: true,
        },
        orderBy: { deadline: "asc" },
        take: 5,
      }),
      
      // Expiring domains
      prisma.domain.findMany({
        where: {
          project: { userId, deletedAt: null },
          deletedAt: null,
          expiryDate: { lte: thirtyDaysFromNow },
          status: { not: "EXPIRED" },
        },
        select: {
          id: true,
          domainName: true,
          expiryDate: true,
          project: { select: { id: true, name: true } },
        },
        orderBy: { expiryDate: "asc" },
        take: 5,
      }),
      
      // Expiring hostings
      prisma.hosting.findMany({
        where: {
          project: { userId, deletedAt: null },
          deletedAt: null,
          expiryDate: { lte: thirtyDaysFromNow },
          status: { not: "EXPIRED" },
        },
        select: {
          id: true,
          provider: true,
          expiryDate: true,
          project: { select: { id: true, name: true } },
        },
        orderBy: { expiryDate: "asc" },
        take: 5,
      }),
      
      // Recent activities
      prisma.activity.findMany({
        where: { userId },
        select: {
          id: true,
          action: true,
          entityType: true,
          description: true,
          createdAt: true,
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      
      // Monthly income (last 6 months)
      prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM "createdAt") as month,
          EXTRACT(YEAR FROM "createdAt") as year,
          SUM(amount) as total
        FROM "Income"
        WHERE "projectId" IN (
          SELECT id FROM "Project" WHERE "userId" = ${userId}
        )
        AND "createdAt" >= ${new Date(now.getFullYear(), now.getMonth() - 5, 1)}
        GROUP BY EXTRACT(MONTH FROM "createdAt"), EXTRACT(YEAR FROM "createdAt")
        ORDER BY year DESC, month DESC
      `,
    ])

    // Process project status counts
    const statusCounts = {
      PLANNING: 0,
      ACTIVE: 0,
      ON_HOLD: 0,
      REVIEW: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }
    projectsByStatus.forEach((item) => {
      statusCounts[item.status as keyof typeof statusCounts] = item._count
    })

    // Process task status counts
    const taskCounts = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      COMPLETED: 0,
      BLOCKED: 0,
    }
    tasksByStatus.forEach((item) => {
      taskCounts[item.status as keyof typeof taskCounts] = item._count
    })

    const totalValue = projectFinancials._sum.totalValue || 0
    const paidAmount = projectFinancials._sum.paidAmount || 0
    const pendingAmount = totalValue - paidAmount

    return NextResponse.json({
      data: {
        overview: {
          totalProjects,
          activeProjects: statusCounts.ACTIVE,
          completedProjects: statusCounts.COMPLETED,
          totalTasks,
          pendingTasks: taskCounts.TODO + taskCounts.IN_PROGRESS,
          completedTasks: taskCounts.COMPLETED,
        },
        projectsByStatus: statusCounts,
        tasksByStatus: taskCounts,
        finance: {
          totalValue,
          paidAmount,
          pendingAmount,
          monthlyIncome: monthlyPayments._sum.amount || 0,
          monthlyPaymentsCount: monthlyPayments._count || 0,
        },
        upcomingDeadlines,
        alerts: {
          expiringDomains,
          expiringHostings,
          domainsCount: expiringDomains.length,
          hostingsCount: expiringHostings.length,
        },
        recentActivities,
        incomeChart: monthlyIncome,
      },
    })
  } catch (error) {
    console.error("GET /api/analytics/dashboard error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
