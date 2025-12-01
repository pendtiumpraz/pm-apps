"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { domainSchema, type DomainInput } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface DomainFormProps {
  initialData?: Partial<DomainInput> & { id?: string }
  onSubmit: (data: DomainInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function DomainForm({ initialData, onSubmit, onCancel, isLoading }: DomainFormProps) {
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
  } = useForm<DomainInput>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      projectId: initialData?.projectId ?? "",
      domainName: initialData?.domainName ?? "",
      registrar: initialData?.registrar ?? "",
      purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split("T")[0] : "",
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split("T")[0] : "",
      autoRenew: initialData?.autoRenew ?? false,
      cost: initialData?.cost ?? 0,
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

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Domain Name <span className="text-red-400">*</span></label>
        <Input {...register("domainName")} placeholder="e.g., example.com" error={errors.domainName?.message} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Registrar</label>
        <Input {...register("registrar")} placeholder="e.g., Niagahoster, Domainesia" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Purchase Date</label>
          <Input type="date" {...register("purchaseDate")} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Expiry Date <span className="text-red-400">*</span></label>
          <Input type="date" {...register("expiryDate")} error={errors.expiryDate?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Cost (Rp/year)</label>
          <Input type="number" min={0} {...register("cost", { valueAsNumber: true })} placeholder="0" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Reminder Days</label>
          <Input type="number" min={1} {...register("reminderDays", { valueAsNumber: true })} />
        </div>
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
        <Button type="submit" isLoading={isLoading}>{initialData?.id ? "Update" : "Add"} Domain</Button>
      </div>
    </form>
  )
}
