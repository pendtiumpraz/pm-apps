import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const category = await prisma.toolCategory.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        color: body.color,
      },
    })
    return NextResponse.json({ data: category })
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
    await prisma.toolCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
