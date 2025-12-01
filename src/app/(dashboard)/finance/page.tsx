"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Wallet, FileText, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RightPanel } from "@/components/ui/right-panel"
import { PaymentForm } from "@/components/forms/payment-form"
import { StatsCard } from "@/components/cards/stats-card"
import { StatusBadge, Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "react-hot-toast"
import type { PaymentInput } from "@/lib/validations/project"

export default function FinancePage() {
  const [tab, setTab] = useState<"payments" | "invoices">("payments")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("")

  const queryClient = useQueryClient()

  // Fetch payments
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/payments?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: tab === "payments",
  })

  // Fetch invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/invoices?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: tab === "invoices",
  })

  // Fetch dashboard stats
  const { data: statsData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/dashboard")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // Payment mutations
  const createPayment = useMutation({
    mutationFn: async (data: PaymentInput) => {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Payment created!")
      handleCloseForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updatePayment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PaymentInput> }) => {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Payment updated!")
      handleCloseForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/payments/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      toast.success("Payment deleted!")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleOpenForm = (item?: any) => {
    setSelectedItem(item || null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setSelectedItem(null)
    setIsFormOpen(false)
  }

  const handleSubmit = async (data: PaymentInput) => {
    if (selectedItem) {
      await updatePayment.mutateAsync({ id: selectedItem.id, data })
    } else {
      await createPayment.mutateAsync(data)
    }
  }

  const handleDelete = (item: any) => {
    if (confirm(`Delete this payment?`)) {
      deletePayment.mutate(item.id)
    }
  }

  const stats = statsData?.data?.finance

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Finance</h1>
          <p className="mt-1 text-gray-400">Track payments and invoices</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4" /> New Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalValue || 0)}
          icon={DollarSign}
          variant="primary"
        />
        <StatsCard
          title="Paid Amount"
          value={formatCurrency(stats?.paidAmount || 0)}
          icon={Wallet}
          variant="success"
        />
        <StatsCard
          title="Pending"
          value={formatCurrency(stats?.pendingAmount || 0)}
          icon={TrendingUp}
          variant="warning"
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(stats?.monthlyIncome || 0)}
          subtitle={`${stats?.monthlyPaymentsCount || 0} payments`}
          icon={FileText}
          variant="default"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        <button
          onClick={() => setTab("payments")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "payments"
              ? "border-b-2 border-primary-500 text-primary-400"
              : "text-gray-400 hover:text-gray-100"
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setTab("invoices")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "invoices"
              ? "border-b-2 border-primary-500 text-primary-400"
              : "text-gray-400 hover:text-gray-100"
          }`}
        >
          Invoices
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          {tab === "payments" && <option value="PROCESSING">Processing</option>}
        </select>
      </div>

      {/* Payments Table */}
      {tab === "payments" && (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paymentsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : paymentsData?.data?.length > 0 ? (
                paymentsData.data.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: payment.project?.color || "#6366F1" }}
                        />
                        <span className="text-sm text-gray-100">{payment.project?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-100">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" size="sm">{payment.paymentType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{payment.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {payment.paymentDate ? formatDate(payment.paymentDate) : "-"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenForm(payment)}
                        className="mr-2 text-sm text-primary-400 hover:text-primary-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(payment)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoices Table */}
      {tab === "invoices" && (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {invoicesLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : invoicesData?.data?.length > 0 ? (
                invoicesData.data.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-100">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-400">{invoice.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-100">{invoice.project?.name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-100">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={invoice.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Form Panel */}
      <RightPanel
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedItem ? "Edit Payment" : "New Payment"}
        width="md"
      >
        <PaymentForm
          initialData={selectedItem}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={createPayment.isPending || updatePayment.isPending}
        />
      </RightPanel>
    </div>
  )
}
