import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const ides = await prisma.bestIde.findMany({
      where: { deletedAt: null },
      orderBy: { rank: "asc" },
    })
    return NextResponse.json({ data: ides })
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
    const ide = await prisma.bestIde.create({
      data: {
        rank: body.rank,
        name: body.name,
        description: body.description,
        downloadUrl: body.downloadUrl,
        pricing: body.pricing,
        notes: body.notes,
      },
    })
    return NextResponse.json({ data: ide })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
