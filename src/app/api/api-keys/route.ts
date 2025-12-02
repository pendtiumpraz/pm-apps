import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const platformId = searchParams.get("platformId")

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        ...(platformId && { platformId }),
      },
      include: {
        platform: { select: { id: true, name: true, slug: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate totals
    const totals = await prisma.apiKey.aggregate({
      where: { userId: session.user.id, deletedAt: null },
      _sum: { creditTotal: true, creditUsed: true },
      _count: true,
    })

    return NextResponse.json({
      data: apiKeys,
      totals: {
        count: totals._count,
        creditTotal: totals._sum.creditTotal || 0,
        creditUsed: totals._sum.creditUsed || 0,
        creditRemaining: (totals._sum.creditTotal || 0) - (totals._sum.creditUsed || 0),
      },
    })
  } catch (error) {
    console.error("GET /api/api-keys error:", error)
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      platformId,
      email,
      password,
      loginMethod,
      apiKey,
      creditTotal,
      creditUsed,
      referralCode,
      referralLink,
      notes,
    } = body

    if (!platformId || !email || !apiKey) {
      return NextResponse.json(
        { error: "Platform, email and API key are required" },
        { status: 400 }
      )
    }

    // Verify platform belongs to user
    const platform = await prisma.apiPlatform.findFirst({
      where: { id: platformId, userId: session.user.id, deletedAt: null },
    })

    if (!platform) {
      return NextResponse.json({ error: "Platform not found" }, { status: 404 })
    }

    const newApiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        platformId,
        email,
        password,
        loginMethod,
        apiKey,
        creditTotal: creditTotal || 0,
        creditUsed: creditUsed || 0,
        referralCode,
        referralLink,
        notes,
      },
      include: {
        platform: { select: { id: true, name: true, slug: true, color: true } },
      },
    })

    return NextResponse.json({ data: newApiKey }, { status: 201 })
  } catch (error) {
    console.error("POST /api/api-keys error:", error)
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
  }
}
