"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RightPanel } from "@/components/ui/right-panel"
import { ProjectCard } from "@/components/cards/project-card"
import { ProjectCardSkeleton } from "@/components/ui/skeleton"
import { ProjectForm } from "@/components/forms/project-form"
import { toast } from "react-hot-toast"
import type { ProjectInput } from "@/lib/validations/project"

export default function ProjectsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const queryClient = useQueryClient()

  // Fetch projects
  const { data, isLoading } = useQuery({
    queryKey: ["projects", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/projects?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProjectInput) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["sidebar-projects"] })
      toast.success("Project created successfully!")
      handleCloseForm()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectInput }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["sidebar-projects"] })
      toast.success("Project updated successfully!")
      handleCloseForm()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["sidebar-projects"] })
      toast.success("Project deleted successfully!")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleOpenForm = (project?: any) => {
    setSelectedProject(project || null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setSelectedProject(null)
    setIsFormOpen(false)
  }

  const handleSubmit = async (data: ProjectInput) => {
    if (selectedProject) {
      await updateMutation.mutateAsync({ id: selectedProject.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDelete = (project: any) => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteMutation.mutate(project.id)
    }
  }

  const projects = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Projects</h1>
          <p className="mt-1 text-gray-400">
            Manage all your client and personal projects
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100 focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="REVIEW">Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <div className="flex rounded-lg border border-gray-700">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 ${viewMode === "grid" ? "bg-gray-700 text-gray-100" : "text-gray-400 hover:text-gray-100"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 ${viewMode === "list" ? "bg-gray-700 text-gray-100" : "text-gray-400 hover:text-gray-100"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {projects.map((project: any) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => handleOpenForm(project)}
              onDelete={() => handleDelete(project)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
            <Plus className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-300">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first project
          </p>
          <Button onClick={() => handleOpenForm()} className="mt-4">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      )}

      {/* Right Panel Form */}
      <RightPanel
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedProject ? "Edit Project" : "Create New Project"}
        description={
          selectedProject
            ? "Update project details"
            : "Add a new project to track"
        }
        width="lg"
      >
        <ProjectForm
          initialData={selectedProject}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </RightPanel>
    </div>
  )
}
