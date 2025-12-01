import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invoiceSchema } from "@/lib/validations/project"
import { generateInvoiceNumber } from "@/lib/utils"
import { z } from "zod"

// GET all invoices
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")

    const invoices = await prisma.invoice.findMany({
      where: {
        project: { userId: session.user.id },
        ...(projectId && { projectId }),
        ...(status && { status: status as any }),
      },
      include: {
        project: {
          select: { id: true, name: true, client: true, clientContact: true },
        },
        payments: {
          select: { id: true, amount: true, status: true, paymentDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: invoices })
  } catch (error) {
    console.error("GET /api/invoices error:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}

// POST create invoice
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = invoiceSchema.parse(body)

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: validated.projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const invoice = await prisma.invoice.create({
      data: {
        ...validated,
        invoiceNumber: generateInvoiceNumber(),
        dueDate: new Date(validated.dueDate),
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
        entityType: "INVOICE",
        entityId: invoice.id,
        description: `Created invoice ${invoice.invoiceNumber}`,
      },
    })

    return NextResponse.json({ data: invoice }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("POST /api/invoices error:", error)
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    )
  }
}
