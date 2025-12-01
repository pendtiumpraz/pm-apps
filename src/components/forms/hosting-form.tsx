"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { hostingSchema, type HostingInput } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface HostingFormProps {
  initialData?: Partial<HostingInput> & { id?: string }
  onSubmit: (data: HostingInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function HostingForm({ initialData, onSubmit, onCancel, isLoading }: HostingFormProps) {
  const { data: projectsData } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostingInput>({
    resolver: zodResolver(hostingSchema),
    defaultValues: {
      projectId: initialData?.projectId ?? "",
      provider: initialData?.provider ?? "",
      planName: initialData?.planName ?? "",
      serverType: initialData?.serverType ?? "SHARED",
      purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split("T")[0] : "",
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split("T")[0] : "",
      autoRenew: initialData?.autoRenew ?? false,
      cost: initialData?.cost ?? 0,
      billingCycle: initialData?.billingCycle ?? "YEARLY",
      serverIp: initialData?.serverIp ?? "",
      cpanelUrl: initialData?.cpanelUrl ?? "",
      notes: initialData?.notes ?? "",
      reminderDays: initialData?.reminderDays ?? 30,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Project <span className="text-red-400">*</span></label>
        <Select {...register("projectId")} error={errors.projectId?.message}>
          <option value="">Select project</option>
          {projectsData?.data?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Provider <span className="text-red-400">*</span></label>
          <Input {...register("provider")} placeholder="e.g., Domainesia, Vercel" error={errors.provider?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Plan Name</label>
          <Input {...register("planName")} placeholder="e.g., Basic, Pro" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Server Type</label>
          <Select {...register("serverType")}>
            <option value="SHARED">Shared</option>
            <option value="VPS">VPS</option>
            <option value="DEDICATED">Dedicated</option>
            <option value="CLOUD">Cloud</option>
            <option value="SERVERLESS">Serverless</option>
            <option value="MANAGED">Managed</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Billing Cycle</label>
          <Select {...register("billingCycle")}>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
            <option value="BIYEARLY">2 Years</option>
            <option value="TRIYEARLY">3 Years</option>
            <option value="LIFETIME">Lifetime</option>
            <option value="FREE">Free</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Purchase Date</label>
          <Input type="date" {...register("purchaseDate")} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Expiry Date</label>
          <Input type="date" {...register("expiryDate")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Cost (Rp)</label>
          <Input type="number" min={0} {...register("cost", { valueAsNumber: true })} placeholder="0" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Server IP</label>
          <Input {...register("serverIp")} placeholder="e.g., 123.456.789.0" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">cPanel URL</label>
        <Input {...register("cpanelUrl")} placeholder="https://..." />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" {...register("autoRenew")} className="h-4 w-4 rounded border-gray-600 bg-gray-800" />
        <label className="text-sm text-gray-300">Auto Renew</label>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Notes</label>
        <Textarea {...register("notes")} placeholder="Additional notes..." rows={2} />
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{initialData?.id ? "Update" : "Add"} Hosting</Button>
      </div>
    </form>
  )
}
