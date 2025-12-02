import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const tool = await prisma.tool.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })
    if (!tool || tool.deletedAt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ data: tool })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const tool = await prisma.tool.findUnique({ where: { id } })
    if (!tool || tool.deletedAt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const isAdmin = (session.user as any).role === "ADMIN"
    if (tool.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const body = await req.json()
    const updated = await prisma.tool.update({
      where: { id },
      data: {
        name: body.name,
        url: body.url,
        downloadUrl: body.downloadUrl,
        description: body.description,
        pricing: body.pricing,
        categoryId: body.categoryId,
        notes: body.notes,
      },
      include: { category: true },
    })
    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const { id } = await params
    await prisma.tool.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
