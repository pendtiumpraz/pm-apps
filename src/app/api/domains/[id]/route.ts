import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { domainSchema } from "@/lib/validations/project"
import { z } from "zod"

// GET single domain
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const domain = await prisma.domain.findFirst({
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

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    return NextResponse.json({ data: domain })
  } catch (error) {
    console.error("GET /api/domains/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch domain" },
      { status: 500 }
    )
  }
}

// PUT update domain
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.domain.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    const body = await req.json()
    const validated = domainSchema.partial().parse(body)

    const domain = await prisma.domain.update({
      where: { id: params.id },
      data: {
        ...validated,
        purchaseDate: validated.purchaseDate
          ? new Date(validated.purchaseDate)
          : undefined,
        expiryDate: validated.expiryDate
          ? new Date(validated.expiryDate)
          : undefined,
      },
      include: {
        project: {
          select: { id: true, name: true, client: true },
        },
      },
    })

    return NextResponse.json({ data: domain })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("PUT /api/domains/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update domain" },
      { status: 500 }
    )
  }
}

// DELETE domain
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.domain.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    await prisma.domain.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Domain deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/domains/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    )
  }
}
