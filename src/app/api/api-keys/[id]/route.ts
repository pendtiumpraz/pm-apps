import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: { id: params.id, userId: session.user.id, deletedAt: null },
      include: {
        platform: { select: { id: true, name: true, slug: true, color: true } },
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    return NextResponse.json({ data: apiKey })
  } catch (error) {
    console.error("GET /api/api-keys/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch API key" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const existing = await prisma.apiKey.findFirst({
      where: { id: params.id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    const updated = await prisma.apiKey.update({
      where: { id: params.id },
      data: {
        platformId: body.platformId,
        email: body.email,
        password: body.password,
        loginMethod: body.loginMethod,
        apiKey: body.apiKey,
        creditTotal: body.creditTotal,
        creditUsed: body.creditUsed,
        tokenTotal: body.tokenTotal,
        tokenUsed: body.tokenUsed,
        referralCode: body.referralCode,
        referralLink: body.referralLink,
        notes: body.notes,
      },
      include: {
        platform: { select: { id: true, name: true, slug: true, color: true } },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("PUT /api/api-keys/[id] error:", error)
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.apiKey.findFirst({
      where: { id: params.id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    await prisma.apiKey.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "API key deleted" })
  } catch (error) {
    console.error("DELETE /api/api-keys/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 })
  }
}
