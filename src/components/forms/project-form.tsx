"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema, type ProjectInput } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ProjectFormProps {
  initialData?: Partial<ProjectInput> & { id?: string }
  onSubmit: (data: ProjectInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const PROJECT_COLORS = [
  "#6366F1", // Primary
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Yellow
  "#10B981", // Green
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
]

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ProjectFormProps) {
  const deadlineValue = initialData?.deadline
    ? new Date(initialData.deadline).toISOString().split("T")[0]
    : ""

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      client: initialData?.client ?? "",
      clientContact: initialData?.clientContact ?? "",
      projectType: initialData?.projectType ?? "FULLSTACK",
      stack: initialData?.stack ?? "",
      hosting: initialData?.hosting ?? "",
      repositoryUrl: initialData?.repositoryUrl ?? "",
      liveUrl: initialData?.liveUrl ?? "",
      status: initialData?.status ?? "PLANNING",
      priority: initialData?.priority ?? 5,
      deadline: deadlineValue,
      progress: initialData?.progress ?? 0,
      totalValue: initialData?.totalValue ?? 0,
      paidAmount: initialData?.paidAmount ?? 0,
      currency: initialData?.currency ?? "IDR",
      notes: initialData?.notes ?? "",
      color: initialData?.color ?? "#6366F1",
    },
  })

  const selectedColor = watch("color")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Project Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Project Name <span className="text-red-400">*</span>
        </label>
        <Input
          {...register("name")}
          placeholder="e.g., Website Pondok Imam Syafii"
          error={errors.name?.message}
        />
      </div>

      {/* Color Picker */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Project Color
        </label>
        <div className="flex gap-2">
          {PROJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue("color", color)}
              className={`h-8 w-8 rounded-full transition-all ${
                selectedColor === color
                  ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Client Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Client Name
          </label>
          <Input {...register("client")} placeholder="e.g., Pak Ayubi" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Client Contact
          </label>
          <Input {...register("clientContact")} placeholder="e.g., 08123456789" />
        </div>
      </div>

      {/* Type & Stack */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Project Type
          </label>
          <Select {...register("projectType")}>
            <option value="FRONTEND">Frontend</option>
            <option value="BACKEND">Backend</option>
            <option value="FULLSTACK">Full Stack</option>
            <option value="MOBILE">Mobile</option>
            <option value="AI">AI/ML</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Tech Stack
          </label>
          <Input {...register("stack")} placeholder="e.g., Next.js, Laravel" />
        </div>
      </div>

      {/* Status & Priority */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Status
          </label>
          <Select {...register("status")}>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Priority (1 = highest)
          </label>
          <Input
            type="number"
            min={1}
            max={10}
            {...register("priority", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Deadline & Progress */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Deadline
          </label>
          <Input type="date" {...register("deadline")} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Progress (%)
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            {...register("progress", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Financial */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Total Value (Rp)
          </label>
          <Input
            type="number"
            min={0}
            {...register("totalValue", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Paid Amount (Rp)
          </label>
          <Input
            type="number"
            min={0}
            {...register("paidAmount", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
      </div>

      {/* Hosting */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Hosting
        </label>
        <Input {...register("hosting")} placeholder="e.g., Vercel, Domainesia" />
      </div>

      {/* URLs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Repository URL
          </label>
          <Input {...register("repositoryUrl")} placeholder="https://github.com/..." />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Live URL
          </label>
          <Input {...register("liveUrl")} placeholder="https://..." />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Notes
        </label>
        <Textarea {...register("notes")} placeholder="Additional notes..." rows={3} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData?.id ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  )
}
