import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hostingSchema } from "@/lib/validations/project"
import { z } from "zod"

// GET single hosting
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hosting = await prisma.hosting.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id },
      },
      include: {
        project: {
          select: { id: true, name: true, client: true },
        },
      },
    })

    if (!hosting) {
      return NextResponse.json({ error: "Hosting not found" }, { status: 404 })
    }

    return NextResponse.json({ data: hosting })
  } catch (error) {
    console.error("GET /api/hostings/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch hosting" },
      { status: 500 }
    )
  }
}

// PUT update hosting
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.hosting.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Hosting not found" }, { status: 404 })
    }

    const body = await req.json()
    const validated = hostingSchema.partial().parse(body)

    const hosting = await prisma.hosting.update({
      where: { id: params.id },
      data: {
        ...validated,
        purchaseDate: validated.purchaseDate
          ? new Date(validated.purchaseDate)
          : undefined,
        expiryDate: validated.expiryDate
          ? new Date(validated.expiryDate)
          : undefined,
        cpanelUrl: validated.cpanelUrl || null,
      },
      include: {
        project: {
          select: { id: true, name: true, client: true },
        },
      },
    })

    return NextResponse.json({ data: hosting })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("PUT /api/hostings/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update hosting" },
      { status: 500 }
    )
  }
}

// DELETE hosting
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.hosting.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Hosting not found" }, { status: 404 })
    }

    await prisma.hosting.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Hosting deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/hostings/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete hosting" },
      { status: 500 }
    )
  }
}
