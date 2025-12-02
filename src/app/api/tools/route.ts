import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const pricing = searchParams.get("pricing")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = { deletedAt: null }
    if (category) where.categoryId = category
    if (pricing) where.pricing = pricing
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        include: {
          category: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tool.count({ where }),
    ])

    return NextResponse.json({
      data: tools,
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },
    })
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

    const existing = await prisma.tool.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Tool already exists" }, { status: 400 })
    }

    const tool = await prisma.tool.create({
      data: {
        name: body.name,
        slug,
        url: body.url,
        downloadUrl: body.downloadUrl,
        description: body.description,
        pricing: body.pricing || "FREEMIUM",
        categoryId: body.categoryId,
        notes: body.notes,
        userId: session.user.id,
      },
      include: { category: true },
    })
    return NextResponse.json({ data: tool })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
