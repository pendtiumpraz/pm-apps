"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core"
import { Plus, Search } from "lucide-react"

// Droppable Column Component
function DroppableColumn({ id, count, children }: { id: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  
  return (
    <div ref={setNodeRef} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{id.replace("_", " ")}</h3>
        <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{count}</span>
      </div>
      <div className={`space-y-2 min-h-[100px] rounded-lg p-2 transition-colors ${isOver ? "bg-primary-500/10 border border-primary-500/30" : ""}`}>
        {children}
      </div>
    </div>
  )
}

// Draggable Task Component
function DraggableTask({ task, children }: { task: any; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  
  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      {children}
    </div>
  )
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RightPanel } from "@/components/ui/right-panel"
import { TaskCard } from "@/components/cards/task-card"
import { TaskForm } from "@/components/forms/task-form"
import { TaskDetailModal } from "@/components/ui/task-detail-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import type { TaskInput } from "@/lib/validations/project"

export default function TasksPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [detailTask, setDetailTask] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

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

  // Update mutation with optimistic update
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
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] })
      const previous = queryClient.getQueryData(["tasks", search, statusFilter, projectFilter])
      
      // Optimistic update
      queryClient.setQueryData(["tasks", search, statusFilter, projectFilter], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((t: any) => t.id === id ? { ...t, ...data } : t)
        }
      })
      return { previous }
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(["tasks", search, statusFilter, projectFilter], context?.previous)
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Task updated!")
      handleCloseForm()
    },
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

  const handleTaskClick = (task: any) => {
    setDetailTask(task)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setDetailTask(null)
    setIsDetailOpen(false)
  }

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t: any) => t.id === event.active.id)
    setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as string
    const task = tasks.find((t: any) => t.id === taskId)

    if (task && task.status !== newStatus) {
      handleStatusChange(task, newStatus)
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
        // Kanban view with drag and drop
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 lg:grid-cols-4">
            {(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const).map((status) => (
              <DroppableColumn key={status} id={status} count={tasksByStatus[status].length}>
                {tasksByStatus[status].map((task: any) => (
                  <DraggableTask key={task.id} task={task}>
                    <TaskCard
                      task={task}
                      onClick={() => handleTaskClick(task)}
                      onEdit={() => handleOpenForm(task)}
                      onDelete={() => handleDelete(task)}
                      onStatusChange={(s) => handleStatusChange(task, s)}
                    />
                  </DraggableTask>
                ))}
                {tasksByStatus[status].length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-800 py-8 text-center">
                    <p className="text-xs text-gray-500">Drop here</p>
                  </div>
                )}
              </DroppableColumn>
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="opacity-80">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
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

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={detailTask}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onEdit={() => {
          handleCloseDetail()
          handleOpenForm(detailTask)
        }}
        onDelete={() => {
          handleCloseDetail()
          handleDelete(detailTask)
        }}
        onStatusChange={(status) => {
          handleStatusChange(detailTask, status)
          setDetailTask({ ...detailTask, status })
        }}
      />
    </div>
  )
}
