import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// Only allow updating platform (name, color, etc) - no delete for users
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, website, description, color } = body

    const platform = await prisma.apiPlatform.findFirst({
      where: { id: params.id, userId: session.user.id, deletedAt: null },
    })

    if (!platform) {
      return NextResponse.json({ error: "Platform not found" }, { status: 404 })
    }

    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : platform.slug

    const updated = await prisma.apiPlatform.update({
      where: { id: params.id },
      data: { name, slug, website, description, color },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("PUT /api/platforms/[id] error:", error)
    return NextResponse.json({ error: "Failed to update platform" }, { status: 500 })
  }
}

// DELETE is disabled for regular users - only super admin can delete platforms
