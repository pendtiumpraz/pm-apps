import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { taskSchema } from "@/lib/validations/project"
import { z } from "zod"

// GET single task
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id, deletedAt: null },
        deletedAt: null,
      },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ data: task })
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

// PUT update task
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
    const existing = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id, deletedAt: null },
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const body = await req.json()
    const validated = taskSchema.partial().parse(body)

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        completedAt:
          validated.status === "COMPLETED" && existing.status !== "COMPLETED"
            ? new Date()
            : validated.status !== "COMPLETED"
            ? null
            : undefined,
      },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    })

    // Update project progress based on completed tasks
    const projectTasks = await prisma.task.findMany({
      where: { projectId: task.projectId },
    })
    const completedCount = projectTasks.filter(
      (t) => t.status === "COMPLETED"
    ).length
    const progress = Math.round((completedCount / projectTasks.length) * 100)

    await prisma.project.update({
      where: { id: task.projectId },
      data: { progress },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        projectId: task.projectId,
        action: "UPDATE",
        entityType: "TASK",
        entityId: task.id,
        description: `Updated task "${task.title}"`,
      },
    })

    return NextResponse.json({ data: task })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("PUT /api/tasks/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

// DELETE task (soft delete)
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
    const existing = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id, deletedAt: null },
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Soft delete
    await prisma.task.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
