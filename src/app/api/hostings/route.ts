import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hostingSchema } from "@/lib/validations/project"
import { z } from "zod"

// GET all hostings
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const expiring = searchParams.get("expiring")

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const hostings = await prisma.hosting.findMany({
      where: {
        project: { userId: session.user.id },
        ...(projectId && { projectId }),
        ...(expiring === "true" && {
          expiryDate: { lte: thirtyDaysFromNow },
          status: { not: "EXPIRED" },
        }),
      },
      include: {
        project: {
          select: { id: true, name: true, client: true },
        },
      },
      orderBy: { expiryDate: "asc" },
    })

    return NextResponse.json({ data: hostings })
  } catch (error) {
    console.error("GET /api/hostings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch hostings" },
      { status: 500 }
    )
  }
}

// POST create hosting
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = hostingSchema.parse(body)

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: validated.projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const hosting = await prisma.hosting.create({
      data: {
        ...validated,
        purchaseDate: validated.purchaseDate
          ? new Date(validated.purchaseDate)
          : null,
        expiryDate: validated.expiryDate
          ? new Date(validated.expiryDate)
          : null,
        cpanelUrl: validated.cpanelUrl || null,
      },
      include: {
        project: {
          select: { id: true, name: true, client: true },
        },
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        projectId: validated.projectId,
        action: "CREATE",
        entityType: "HOSTING",
        entityId: hosting.id,
        description: `Added hosting ${hosting.provider}`,
      },
    })

    return NextResponse.json({ data: hosting }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("POST /api/hostings error:", error)
    return NextResponse.json(
      { error: "Failed to create hosting" },
      { status: 500 }
    )
  }
}
