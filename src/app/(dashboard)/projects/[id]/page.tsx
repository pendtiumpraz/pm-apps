"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import {
  ArrowLeft, Edit, Trash2, ExternalLink, Github, Calendar, Banknote,
  CheckSquare, Plus, Globe, Server
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RightPanel } from "@/components/ui/right-panel"
import { Progress } from "@/components/ui/progress"
import { StatusBadge, Badge } from "@/components/ui/badge"
import { TaskCard } from "@/components/cards/task-card"
import { TaskForm } from "@/components/forms/task-form"
import { ProjectForm } from "@/components/forms/project-form"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate, getDaysUntil } from "@/lib/utils"
import { toast } from "react-hot-toast"
import type { TaskInput, ProjectInput } from "@/lib/validations/project"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const projectId = params.id as string

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  // Fetch project
  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // Fetch project tasks
  const { data: tasksData } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?projectId=${projectId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // Update project mutation
  const updateProject = useMutation({
    mutationFn: async (data: ProjectInput) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Project updated!")
      setIsEditOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Delete project mutation
  const deleteProject = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Project deleted!")
      router.push("/projects")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Task mutations
  const createTask = useMutation({
    mutationFn: async (data: TaskInput) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
      toast.success("Task created!")
      setIsTaskFormOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskInput> }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
      toast.success("Task updated!")
      setIsTaskFormOpen(false)
      setSelectedTask(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      toast.success("Task deleted!")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleTaskSubmit = async (data: TaskInput) => {
    if (selectedTask) {
      await updateTask.mutateAsync({ id: selectedTask.id, data })
    } else {
      await createTask.mutateAsync({ ...data, projectId })
    }
  }

  const handleDeleteProject = () => {
    if (confirm("Delete this project? This cannot be undone.")) {
      deleteProject.mutate()
    }
  }

  const project = projectData?.data
  const tasks = tasksData?.data || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-400">Project not found</p>
        <Link href="/projects" className="mt-4 text-primary-400 hover:text-primary-300">
          Back to projects
        </Link>
      </div>
    )
  }

  const daysUntilDeadline = project.deadline ? getDaysUntil(project.deadline) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/projects"
            className="mt-1 rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: project.color || "#6366F1" }}
              />
              <h1 className="text-2xl font-bold text-gray-100">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.client && (
              <p className="mt-1 text-gray-400">{project.client}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="danger" onClick={handleDeleteProject}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Deadline</span>
          </div>
          <p className={`mt-2 text-lg font-semibold ${
            daysUntilDeadline !== null && daysUntilDeadline < 0 ? "text-red-400" :
            daysUntilDeadline !== null && daysUntilDeadline <= 7 ? "text-yellow-400" : "text-gray-100"
          }`}>
            {project.deadline ? formatDate(project.deadline) : "No deadline"}
            {daysUntilDeadline !== null && (
              <span className="ml-2 text-sm font-normal">
                ({daysUntilDeadline >= 0 ? `${daysUntilDeadline}d left` : "Overdue"})
              </span>
            )}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Banknote className="h-4 w-4" />
            <span className="text-sm">Value</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-gray-100">
            {formatCurrency(project.totalValue)}
          </p>
          <p className="text-sm text-green-400">
            {formatCurrency(project.paidAmount)} paid
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-gray-400">
            <CheckSquare className="h-4 w-4" />
            <span className="text-sm">Progress</span>
          </div>
          <div className="mt-2">
            <Progress value={project.progress} size="lg" showLabel />
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-sm">Priority</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-gray-100">
            {project.priority}
            <span className="ml-2 text-sm font-normal text-gray-400">
              (1 = highest)
            </span>
          </p>
        </div>
      </div>

      {/* Details & Tasks */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project Details */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-gray-100">Details</h3>
            <dl className="mt-4 space-y-3">
              {project.stack && (
                <div>
                  <dt className="text-xs text-gray-500">Tech Stack</dt>
                  <dd className="text-sm text-gray-300">{project.stack}</dd>
                </div>
              )}
              {project.projectType && (
                <div>
                  <dt className="text-xs text-gray-500">Type</dt>
                  <dd><Badge variant="default">{project.projectType}</Badge></dd>
                </div>
              )}
              {project.hosting && (
                <div>
                  <dt className="text-xs text-gray-500">Hosting</dt>
                  <dd className="text-sm text-gray-300">{project.hosting}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Links */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-lg font-semibold text-gray-100">Links</h3>
            <div className="mt-4 space-y-2">
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  <Github className="h-4 w-4" />
                  Repository
                  <ExternalLink className="ml-auto h-3 w-3" />
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  <Globe className="h-4 w-4" />
                  Live Site
                  <ExternalLink className="ml-auto h-3 w-3" />
                </a>
              )}
              {!project.repositoryUrl && !project.liveUrl && (
                <p className="text-sm text-gray-500">No links added</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {project.notes && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="text-lg font-semibold text-gray-100">Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-400">{project.notes}</p>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-100">Tasks</h3>
              <Button size="sm" onClick={() => { setSelectedTask(null); setIsTaskFormOpen(true) }}>
                <Plus className="mr-1 h-4 w-4" /> Add Task
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task: any) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => { setSelectedTask(task); setIsTaskFormOpen(true) }}
                    onDelete={() => {
                      if (confirm(`Delete "${task.title}"?`)) deleteTask.mutate(task.id)
                    }}
                    onStatusChange={(status) => updateTask.mutate({ id: task.id, data: { ...task, status } })}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-800 py-8 text-center">
                  <CheckSquare className="mx-auto h-8 w-8 text-gray-600" />
                  <p className="mt-2 text-sm text-gray-400">No tasks yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Panel */}
      <RightPanel
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Project"
        width="lg"
      >
        <ProjectForm
          initialData={project}
          onSubmit={async (data) => await updateProject.mutateAsync(data)}
          onCancel={() => setIsEditOpen(false)}
          isLoading={updateProject.isPending}
        />
      </RightPanel>

      {/* Task Form Panel */}
      <RightPanel
        isOpen={isTaskFormOpen}
        onClose={() => { setIsTaskFormOpen(false); setSelectedTask(null) }}
        title={selectedTask ? "Edit Task" : "Add Task"}
        width="md"
      >
        <TaskForm
          initialData={selectedTask}
          projectId={projectId}
          onSubmit={handleTaskSubmit}
          onCancel={() => { setIsTaskFormOpen(false); setSelectedTask(null) }}
          isLoading={createTask.isPending || updateTask.isPending}
        />
      </RightPanel>
    </div>
  )
}
