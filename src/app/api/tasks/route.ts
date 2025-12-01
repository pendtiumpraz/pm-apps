import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { taskSchema } from "@/lib/validations/project"
import { z } from "zod"

export const dynamic = "force-dynamic"

// GET all tasks (with filters)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")

    const tasks = await prisma.task.findMany({
      where: {
        project: { userId: session.user.id, deletedAt: null },
        deletedAt: null,
        ...(projectId && { projectId }),
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
      },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: [{ status: "asc" }, { priority: "asc" }, { order: "asc" }],
    })

    return NextResponse.json({ data: tasks })
  } catch (error) {
    console.error("GET /api/tasks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

// POST create task
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = taskSchema.parse(body)

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: validated.projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get max order for the project
    const maxOrder = await prisma.task.aggregate({
      where: { projectId: validated.projectId },
      _max: { order: true },
    })

    const task = await prisma.task.create({
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        projectId: validated.projectId,
        action: "CREATE",
        entityType: "TASK",
        entityId: task.id,
        description: `Created task "${task.title}"`,
      },
    })

    return NextResponse.json({ data: task }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("POST /api/tasks error:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
