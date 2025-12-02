import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const models = await prisma.bestAiModel.findMany({
      where: { deletedAt: null },
      orderBy: { rank: "asc" },
    })
    return NextResponse.json({ data: models })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const model = await prisma.bestAiModel.create({
      data: {
        rank: body.rank,
        name: body.name,
        resolved: body.resolved,
        costPerTask: body.costPerTask,
        organization: body.organization,
        link: body.link,
        notes: body.notes,
      },
    })
    return NextResponse.json({ data: model })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
