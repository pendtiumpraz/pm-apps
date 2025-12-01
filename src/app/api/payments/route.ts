import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { paymentSchema } from "@/lib/validations/project"
import { z } from "zod"

// GET all payments
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const payments = await prisma.payment.findMany({
      where: {
        project: { userId: session.user.id, deletedAt: null },
        deletedAt: null,
        ...(projectId && { projectId }),
        ...(status && { status: status as any }),
        ...(type && { paymentType: type as any }),
      },
      include: {
        project: {
          select: { id: true, name: true, client: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true },
        },
      },
      orderBy: { paymentDate: "desc" },
    })

    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error("GET /api/payments error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

// POST create payment
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = paymentSchema.parse(body)

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: validated.projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const payment = await prisma.payment.create({
      data: {
        ...validated,
        paymentDate: validated.paymentDate
          ? new Date(validated.paymentDate)
          : new Date(),
        proofUrl: validated.proofUrl || null,
      },
      include: {
        project: {
          select: { id: true, name: true, client: true },
        },
      },
    })

    // If payment is PAID, update project paidAmount and create income record
    if (payment.status === "PAID") {
      await prisma.project.update({
        where: { id: validated.projectId },
        data: {
          paidAmount: { increment: payment.amount },
        },
      })

      // Create income record
      const now = new Date()
      await prisma.income.create({
        data: {
          projectId: validated.projectId,
          paymentId: payment.id,
          amount: payment.amount,
          type: "PROJECT",
          description: payment.description,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      })

      // Update invoice if linked
      if (payment.invoiceId) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: payment.invoiceId },
        })
        if (invoice) {
          const newPaidAmount = invoice.paidAmount + payment.amount
          await prisma.invoice.update({
            where: { id: payment.invoiceId },
            data: {
              paidAmount: newPaidAmount,
              status: newPaidAmount >= invoice.totalAmount ? "PAID" : "PARTIAL",
            },
          })
        }
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        projectId: validated.projectId,
        action: "CREATE",
        entityType: "PAYMENT",
        entityId: payment.id,
        description: `Added payment Rp ${payment.amount.toLocaleString("id-ID")}`,
      },
    })

    return NextResponse.json({ data: payment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("POST /api/payments error:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
