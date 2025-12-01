import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { projectSchema } from "@/lib/validations/project"
import { z } from "zod"

export const dynamic = "force-dynamic"

// GET all projects
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const type = searchParams.get("type")

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        ...(status && { status: status as any }),
        ...(type && { projectType: type as any }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { client: { contains: search, mode: "insensitive" } },
            { stack: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        _count: {
          select: {
            tasks: true,
            payments: true,
            invoices: true,
            domains: true,
            hostings: true,
          },
        },
      },
      orderBy: [{ priority: "asc" }, { deadline: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ data: projects })
  } catch (error) {
    console.error("GET /api/projects error:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// POST create project
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...validated,
        userId: session.user.id,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        repositoryUrl: validated.repositoryUrl || null,
        liveUrl: validated.liveUrl || null,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        action: "CREATE",
        entityType: "PROJECT",
        entityId: project.id,
        description: `Created project "${project.name}"`,
      },
    })

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("POST /api/projects error:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
