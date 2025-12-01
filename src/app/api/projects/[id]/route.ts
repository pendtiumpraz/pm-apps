import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { projectSchema } from "@/lib/validations/project"
import { z } from "zod"

// GET single project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        tasks: {
          orderBy: [{ status: "asc" }, { order: "asc" }],
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
        },
        domains: {
          orderBy: { expiryDate: "asc" },
        },
        hostings: {
          orderBy: { expiryDate: "asc" },
        },
        subscriptions: {
          orderBy: { nextBillingDate: "asc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            tasks: true,
            payments: true,
            invoices: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ data: project })
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

// PUT update project
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check ownership
    const existing = await prisma.project.findFirst({
      where: { id: params.id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const body = await req.json()
    const validated = projectSchema.partial().parse(body)

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...validated,
        deadline: validated.deadline ? new Date(validated.deadline) : undefined,
        repositoryUrl: validated.repositoryUrl || null,
        liveUrl: validated.liveUrl || null,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        action: "UPDATE",
        entityType: "PROJECT",
        entityId: project.id,
        description: `Updated project "${project.name}"`,
      },
    })

    return NextResponse.json({ data: project })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("PUT /api/projects/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}

// DELETE project (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check ownership
    const existing = await prisma.project.findFirst({
      where: { id: params.id, userId: session.user.id, deletedAt: null },
    })

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Soft delete
    await prisma.project.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        projectId: params.id,
        action: "DELETE",
        entityType: "PROJECT",
        entityId: params.id,
        description: `Deleted project "${existing.name}"`,
      },
    })

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}
