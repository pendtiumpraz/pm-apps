"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RightPanel } from "@/components/ui/right-panel"
import { TaskCard } from "@/components/cards/task-card"
import { TaskForm } from "@/components/forms/task-form"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import type { TaskInput } from "@/lib/validations/project"

export default function TasksPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("")

  const queryClient = useQueryClient()

  // Fetch tasks
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", search, statusFilter, projectFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      if (projectFilter) params.set("projectId", projectFilter)
      const res = await fetch(`/api/tasks?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // Fetch projects for filter
  const { data: projectsData } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TaskInput) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task created!")
      handleCloseForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskInput> }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Task updated!")
      handleCloseForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task deleted!")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleOpenForm = (task?: any) => {
    setSelectedTask(task || null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setSelectedTask(null)
    setIsFormOpen(false)
  }

  const handleSubmit = async (data: TaskInput) => {
    if (selectedTask) {
      await updateMutation.mutateAsync({ id: selectedTask.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleStatusChange = (task: any, status: string) => {
    updateMutation.mutate({ id: task.id, data: { ...task, status } })
  }

  const handleDelete = (task: any) => {
    if (confirm(`Delete "${task.title}"?`)) {
      deleteMutation.mutate(task.id)
    }
  }

  const tasks = data?.data || []
  const filteredTasks = search
    ? tasks.filter((t: any) => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks

  // Group by status
  const tasksByStatus = {
    TODO: filteredTasks.filter((t: any) => t.status === "TODO"),
    IN_PROGRESS: filteredTasks.filter((t: any) => t.status === "IN_PROGRESS"),
    REVIEW: filteredTasks.filter((t: any) => t.status === "REVIEW"),
    COMPLETED: filteredTasks.filter((t: any) => t.status === "COMPLETED"),
    BLOCKED: filteredTasks.filter((t: any) => t.status === "BLOCKED"),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Tasks</h1>
          <p className="mt-1 text-gray-400">Manage all your project tasks</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100"
        >
          <option value="">All Projects</option>
          {projectsData?.data?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100"
        >
          <option value="">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="COMPLETED">Completed</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      {/* Task Columns (Kanban-lite) */}
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ))}
        </div>
      ) : statusFilter ? (
        // List view when filtered
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenForm(task)}
                onDelete={() => handleDelete(task)}
                onStatusChange={(status) => handleStatusChange(task, status)}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 py-16 text-center">
              <p className="text-gray-400">No tasks found</p>
            </div>
          )}
        </div>
      ) : (
        // Kanban view
        <div className="grid gap-4 lg:grid-cols-4">
          {(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const).map((status) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">
                  {status.replace("_", " ")}
                </h3>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  {tasksByStatus[status].length}
                </span>
              </div>
              <div className="space-y-2">
                {tasksByStatus[status].map((task: any) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => handleOpenForm(task)}
                    onDelete={() => handleDelete(task)}
                    onStatusChange={(s) => handleStatusChange(task, s)}
                  />
                ))}
                {tasksByStatus[status].length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-800 py-8 text-center">
                    <p className="text-xs text-gray-500">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Panel */}
      <RightPanel
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedTask ? "Edit Task" : "Create New Task"}
        width="md"
      >
        <TaskForm
          initialData={selectedTask}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </RightPanel>
    </div>
  )
}
