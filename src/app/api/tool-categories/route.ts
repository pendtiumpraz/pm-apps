import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await prisma.toolCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { tools: { where: { deletedAt: null } } },
        },
      },
    })
    return NextResponse.json({ data: categories })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    const existing = await prisma.toolCategory.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    const category = await prisma.toolCategory.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        icon: body.icon,
        color: body.color || "#6366F1",
        createdBy: session.user.id,
      },
    })
    return NextResponse.json({ data: category })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
