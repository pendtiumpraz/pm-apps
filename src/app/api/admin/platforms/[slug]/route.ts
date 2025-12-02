import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

async function checkAdmin(session: any) {
  if (!session?.user?.id) return false
  const isAdminRole = (session.user as any).role === "ADMIN"
  const adminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || []
  const isAdminEmail = session.user.email && adminEmails.includes(session.user.email.toLowerCase())
  return isAdminRole || isAdminEmail
}

// Update all platforms with this slug (e.g., change name/color globally)
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await auth()
    if (!await checkAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, website, color } = body

    const newSlug = name 
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") 
      : params.slug

    // Update all platforms with this slug
    const result = await prisma.apiPlatform.updateMany({
      where: { slug: params.slug, deletedAt: null },
      data: { 
        name: name || undefined,
        slug: newSlug,
        website: website !== undefined ? website : undefined,
        color: color || undefined,
      },
    })

    return NextResponse.json({ 
      message: `Updated ${result.count} platform instances`,
      data: { count: result.count }
    })
  } catch (error) {
    console.error("PUT /api/admin/platforms/[slug] error:", error)
    return NextResponse.json({ error: "Failed to update platform" }, { status: 500 })
  }
}

// Delete all platforms with this slug (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await auth()
    if (!await checkAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all platform IDs with this slug
    const platforms = await prisma.apiPlatform.findMany({
      where: { slug: params.slug, deletedAt: null },
      select: { id: true },
    })

    const platformIds = platforms.map(p => p.id)

    // Soft delete all API keys for these platforms
    await prisma.apiKey.updateMany({
      where: { platformId: { in: platformIds }, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    // Soft delete all platforms with this slug
    const result = await prisma.apiPlatform.updateMany({
      where: { slug: params.slug, deletedAt: null },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ 
      message: `Deleted ${result.count} platform instances and their API keys`,
      data: { count: result.count }
    })
  } catch (error) {
    console.error("DELETE /api/admin/platforms/[slug] error:", error)
    return NextResponse.json({ error: "Failed to delete platform" }, { status: 500 })
  }
}
