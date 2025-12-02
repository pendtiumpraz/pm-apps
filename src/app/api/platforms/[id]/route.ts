import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const platform = await prisma.apiPlatform.findFirst({
      where: { id: params.id, userId: session.user.id, deletedAt: null },
    })

    if (!platform) {
      return NextResponse.json({ error: "Platform not found" }, { status: 404 })
    }

    // Soft delete platform and its api keys
    await prisma.$transaction([
      prisma.apiKey.updateMany({
        where: { platformId: params.id },
        data: { deletedAt: new Date() },
      }),
      prisma.apiPlatform.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      }),
    ])

    return NextResponse.json({ message: "Platform deleted" })
  } catch (error) {
    console.error("DELETE /api/platforms/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete platform" }, { status: 500 })
  }
}
