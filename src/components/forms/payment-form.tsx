"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { paymentSchema, type PaymentInput } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface PaymentFormProps {
  initialData?: Partial<PaymentInput> & { id?: string }
  onSubmit: (data: PaymentInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PaymentForm({ initialData, onSubmit, onCancel, isLoading }: PaymentFormProps) {
  const { data: projectsData } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const paymentDateValue = initialData?.paymentDate
    ? new Date(initialData.paymentDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      projectId: initialData?.projectId ?? "",
      invoiceId: initialData?.invoiceId ?? "",
      amount: initialData?.amount ?? 0,
      description: initialData?.description ?? "",
      paymentType: initialData?.paymentType ?? "FULL",
      paymentMethod: initialData?.paymentMethod ?? "TRANSFER",
      paymentDate: paymentDateValue,
      status: initialData?.status ?? "PENDING",
      installmentNo: initialData?.installmentNo ?? undefined,
      proofUrl: initialData?.proofUrl ?? "",
      notes: initialData?.notes ?? "",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Project */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Project <span className="text-red-400">*</span>
        </label>
        <Select {...register("projectId")} error={errors.projectId?.message}>
          <option value="">Select project</option>
          {projectsData?.data?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </div>

      {/* Amount */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Amount (Rp) <span className="text-red-400">*</span>
        </label>
        <Input
          type="number"
          min={0}
          {...register("amount", { valueAsNumber: true })}
          placeholder="0"
          error={errors.amount?.message}
        />
      </div>

      {/* Type & Method */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Type</label>
          <Select {...register("paymentType")}>
            <option value="FULL">Full Payment</option>
            <option value="DP">Down Payment (DP)</option>
            <option value="TERMIN">Termin</option>
            <option value="INSTALLMENT">Installment</option>
            <option value="RECURRING">Recurring</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RENEWAL">Renewal</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Method</label>
          <Select {...register("paymentMethod")}>
            <option value="CASH">Cash</option>
            <option value="TRANSFER">Bank Transfer</option>
            <option value="EWALLET">E-Wallet</option>
            <option value="QRIS">QRIS</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
      </div>

      {/* Status & Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
          <Select {...register("status")}>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Payment Date</label>
          <Input type="date" {...register("paymentDate")} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
        <Input {...register("description")} placeholder="e.g., DP 50%" />
      </div>

      {/* Proof URL */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Proof URL</label>
        <Input {...register("proofUrl")} placeholder="https://..." />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Notes</label>
        <Textarea {...register("notes")} placeholder="Additional notes..." rows={2} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData?.id ? "Update" : "Create"} Payment
        </Button>
      </div>
    </form>
  )
}
