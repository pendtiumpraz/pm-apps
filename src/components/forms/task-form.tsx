"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { taskSchema, type TaskInput } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TaskFormProps {
  initialData?: Partial<TaskInput> & { id?: string }
  projectId?: string
  onSubmit: (data: TaskInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TaskForm({
  initialData,
  projectId,
  onSubmit,
  onCancel,
  isLoading,
}: TaskFormProps) {
  const { data: projectsData } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const dueDateValue = initialData?.dueDate
    ? new Date(initialData.dueDate).toISOString().split("T")[0]
    : ""

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      projectId: initialData?.projectId ?? projectId ?? "",
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      status: initialData?.status ?? "TODO",
      priority: initialData?.priority ?? "MEDIUM",
      dueDate: dueDateValue,
      order: initialData?.order ?? 0,
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
          {projectsData?.data?.map((project: any) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Task Title <span className="text-red-400">*</span>
        </label>
        <Input
          {...register("title")}
          placeholder="e.g., Setup database schema"
          error={errors.title?.message}
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Description
        </label>
        <Textarea
          {...register("description")}
          placeholder="Task details..."
          rows={3}
        />
      </div>

      {/* Status & Priority */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Status
          </label>
          <Select {...register("status")}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="BLOCKED">Blocked</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Priority
          </label>
          <Select {...register("priority")}>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Due Date
        </label>
        <Input type="date" {...register("dueDate")} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData?.id ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  )
}
