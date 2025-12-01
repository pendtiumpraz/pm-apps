import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { paymentSchema } from "@/lib/validations/project"
import { z } from "zod"

// GET single payment
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id, deletedAt: null },
        deletedAt: null,
      },
      include: {
        project: {
          select: { id: true, name: true, client: true },
        },
        invoice: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({ data: payment })
  } catch (error) {
    console.error("GET /api/payments/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    )
  }
}

// PUT update payment
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.payment.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id, deletedAt: null },
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const body = await req.json()
    const validated = paymentSchema.partial().parse(body)

    // Handle status change to PAID
    const wasPaid = existing.status === "PAID"
    const willBePaid = validated.status === "PAID"

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        ...validated,
        paymentDate: validated.paymentDate
          ? new Date(validated.paymentDate)
          : undefined,
        proofUrl: validated.proofUrl || null,
      },
      include: {
        project: {
          select: { id: true, name: true, client: true },
        },
      },
    })

    // Update project paidAmount if status changed
    if (!wasPaid && willBePaid) {
      await prisma.project.update({
        where: { id: payment.projectId },
        data: { paidAmount: { increment: payment.amount } },
      })

      // Create income record
      const now = new Date()
      await prisma.income.create({
        data: {
          projectId: payment.projectId,
          paymentId: payment.id,
          amount: payment.amount,
          type: "PROJECT",
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      })
    } else if (wasPaid && !willBePaid) {
      await prisma.project.update({
        where: { id: payment.projectId },
        data: { paidAmount: { decrement: existing.amount } },
      })

      // Remove income record
      await prisma.income.deleteMany({
        where: { paymentId: payment.id },
      })
    }

    return NextResponse.json({ data: payment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("PUT /api/payments/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    )
  }
}

// DELETE payment (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.payment.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id, deletedAt: null },
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // If was paid, decrement project paidAmount
    if (existing.status === "PAID") {
      await prisma.project.update({
        where: { id: existing.projectId },
        data: { paidAmount: { decrement: existing.amount } },
      })
    }

    // Soft delete
    await prisma.payment.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Payment deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/payments/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    )
  }
}
