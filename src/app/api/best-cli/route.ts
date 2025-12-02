import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const clis = await prisma.bestCli.findMany({
      where: { deletedAt: null },
      orderBy: { rank: "asc" },
    })
    return NextResponse.json({ data: clis })
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
    const cli = await prisma.bestCli.create({
      data: {
        rank: body.rank,
        name: body.name,
        description: body.description,
        githubUrl: body.githubUrl,
        stars: body.stars,
        notes: body.notes,
      },
    })
    return NextResponse.json({ data: cli })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
