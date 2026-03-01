"use client"

import { useState, useMemo, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core"
import { useDroppable } from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"
import {
    ExternalLink, Edit, Trash2, Calendar, Banknote, User, Rocket, GripVertical
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn, formatCurrency, formatDate, getDaysUntil } from "@/lib/utils"
import { toast } from "react-hot-toast"

interface ProjectKanbanProps {
    onEdit: (project: any) => void
    onDelete: (project: any) => void
}

const STATUS_COLUMNS = [
    { key: "PLANNING", label: "Planning", color: "#6366F1", bgGlow: "from-indigo-500/10" },
    { key: "ACTIVE", label: "Active", color: "#3B82F6", bgGlow: "from-blue-500/10" },
    { key: "ON_HOLD", label: "On Hold", color: "#F59E0B", bgGlow: "from-amber-500/10" },
    { key: "REVIEW", label: "Review", color: "#8B5CF6", bgGlow: "from-purple-500/10" },
    { key: "COMPLETED", label: "Completed", color: "#10B981", bgGlow: "from-emerald-500/10" },
    { key: "CANCELLED", label: "Cancelled", color: "#EF4444", bgGlow: "from-red-500/10" },
]

export function ProjectKanban({ onEdit, onDelete }: ProjectKanbanProps) {
    const [activeTab, setActiveTab] = useState<"OWN" | "CLIENT">("OWN")
    const [activeId, setActiveId] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await fetch("/api/projects")
            if (!res.ok) throw new Error("Failed")
            return res.json()
        },
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) throw new Error((await res.json()).error || "Failed")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            queryClient.invalidateQueries({ queryKey: ["projects-table"] })
            queryClient.invalidateQueries({ queryKey: ["sidebar-projects"] })
            toast.success("Status updated!")
        },
        onError: (e: Error) => toast.error(e.message),
    })

    const allProjects = data?.data || []

    // Filter projects by active tab category
    const filteredProjects = useMemo(() => {
        return allProjects.filter((p: any) => (p.category || "CLIENT") === activeTab)
    }, [allProjects, activeTab])

    const projectsByStatus = useMemo(() => {
        const grouped: Record<string, any[]> = {}
        STATUS_COLUMNS.forEach(col => { grouped[col.key] = [] })
        filteredProjects.forEach((p: any) => {
            if (grouped[p.status]) {
                grouped[p.status].push(p)
            }
        })
        return grouped
    }, [filteredProjects])

    const activeProject = useMemo(() => {
        if (!activeId) return null
        return allProjects.find((p: any) => p.id === activeId) || null
    }, [activeId, allProjects])

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    )

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }, [])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const projectId = active.id as string
        const newStatus = over.id as string

        // Find the current project
        const project = allProjects.find((p: any) => p.id === projectId)
        if (!project || project.status === newStatus) return

        // Validate the new status is valid
        if (!STATUS_COLUMNS.find(col => col.key === newStatus)) return

        // Optimistically update
        updateStatusMutation.mutate({ id: projectId, status: newStatus })
    }, [allProjects, updateStatusMutation])

    // Count per category
    const ownCount = allProjects.filter((p: any) => (p.category || "CLIENT") === "OWN").length
    const clientCount = allProjects.filter((p: any) => (p.category || "CLIENT") === "CLIENT").length

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-800" />
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {STATUS_COLUMNS.slice(0, 4).map(col => (
                        <div key={col.key} className="w-72 flex-shrink-0">
                            <div className="h-8 w-24 animate-pulse rounded bg-gray-800 mb-3" />
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-800/50" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const visibleColumns = STATUS_COLUMNS.filter(
        col => (projectsByStatus[col.key]?.length > 0) || ["PLANNING", "ACTIVE", "REVIEW", "COMPLETED"].includes(col.key)
    )

    return (
        <div className="space-y-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 p-1 w-fit">
                <button
                    onClick={() => setActiveTab("OWN")}
                    className={cn(
                        "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                        activeTab === "OWN"
                            ? "bg-emerald-500/20 text-emerald-400 shadow-sm ring-1 ring-emerald-500/30"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                    )}
                >
                    <Rocket className="h-4 w-4" />
                    Own Projects
                    <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-bold",
                        activeTab === "OWN" ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-800 text-gray-500"
                    )}>
                        {ownCount}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("CLIENT")}
                    className={cn(
                        "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                        activeTab === "CLIENT"
                            ? "bg-amber-500/20 text-amber-400 shadow-sm ring-1 ring-amber-500/30"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                    )}
                >
                    <User className="h-4 w-4" />
                    Client Projects
                    <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-bold",
                        activeTab === "CLIENT" ? "bg-amber-500/20 text-amber-300" : "bg-gray-800 text-gray-500"
                    )}>
                        {clientCount}
                    </span>
                </button>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
                    {visibleColumns.map(col => {
                        const items = projectsByStatus[col.key] || []
                        return (
                            <KanbanColumn
                                key={col.key}
                                column={col}
                                items={items}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                activeTab={activeTab}
                            />
                        )
                    })}
                </div>

                {/* Drag Overlay */}
                <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
                    {activeProject ? (
                        <div className="w-72 opacity-90">
                            <KanbanCardContent
                                project={activeProject}
                                columnColor="#6366F1"
                                isDragging
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}

// ============================================
// Droppable Column
// ============================================
function KanbanColumn({
    column,
    items,
    onEdit,
    onDelete,
    activeTab,
}: {
    column: typeof STATUS_COLUMNS[0]
    items: any[]
    onEdit: (p: any) => void
    onDelete: (p: any) => void
    activeTab: string
}) {
    const { setNodeRef, isOver } = useDroppable({ id: column.key })

    return (
        <div className="w-72 flex-shrink-0">
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                    <h3 className="text-sm font-semibold text-gray-200">{column.label}</h3>
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-400">
                        {items.length}
                    </span>
                </div>
            </div>

            {/* Column Drop Zone */}
            <div
                ref={setNodeRef}
                className={cn(
                    "min-h-[200px] space-y-3 rounded-xl border bg-gradient-to-b to-transparent p-3 transition-all duration-200",
                    column.bgGlow,
                    isOver
                        ? "border-primary-500/50 bg-primary-500/5 ring-2 ring-primary-500/20"
                        : "border-gray-800/60"
                )}
            >
                {items.length > 0 ? (
                    items.map((project: any) => (
                        <DraggableCard
                            key={project.id}
                            project={project}
                            columnColor={column.color}
                            onEdit={() => onEdit(project)}
                            onDelete={() => onDelete(project)}
                        />
                    ))
                ) : (
                    <div className={cn(
                        "flex h-24 items-center justify-center rounded-lg border border-dashed transition-colors",
                        isOver ? "border-primary-500/40 bg-primary-500/5" : "border-gray-800/50"
                    )}>
                        <p className="text-xs text-gray-600">
                            {isOver ? "Drop here" : "No projects"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ============================================
// Draggable Card Wrapper
// ============================================
function DraggableCard({
    project,
    columnColor,
    onEdit,
    onDelete,
}: {
    project: any
    columnColor: string
    onEdit: () => void
    onDelete: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: project.id,
    })

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "transition-opacity",
                isDragging && "opacity-30"
            )}
        >
            <KanbanCardContent
                project={project}
                columnColor={columnColor}
                onEdit={onEdit}
                onDelete={onDelete}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    )
}

// ============================================
// Card Content (shared between real card and overlay)
// ============================================
function KanbanCardContent({
    project,
    columnColor,
    onEdit,
    onDelete,
    isDragging,
    dragHandleProps,
}: {
    project: any
    columnColor: string
    onEdit?: () => void
    onDelete?: () => void
    isDragging?: boolean
    dragHandleProps?: any
}) {
    const isOwnProject = project.category === "OWN"
    const daysLeft = project.deadline ? getDaysUntil(project.deadline) : null
    const isOverdue = daysLeft !== null && daysLeft < 0
    const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0

    return (
        <div className={cn(
            "group relative rounded-xl border bg-gray-900/90 p-3.5 transition-all duration-200",
            isDragging
                ? "shadow-2xl shadow-primary-500/20 ring-2 ring-primary-500/40 rotate-2"
                : "hover:shadow-lg hover:-translate-y-0.5",
            isOwnProject
                ? "border-gray-800 hover:border-emerald-800/50 hover:shadow-emerald-500/5"
                : "border-gray-800 hover:border-amber-800/50 hover:shadow-amber-500/5"
        )}>
            {/* Top bar accent */}
            <div
                className="absolute left-3 right-3 top-0 h-0.5 rounded-b"
                style={{ backgroundColor: project.color || columnColor }}
            />

            {/* Header */}
            <div className="flex items-start gap-1.5">
                {/* Drag Handle */}
                <button
                    {...dragHandleProps}
                    className="mt-0.5 cursor-grab rounded p-0.5 text-gray-600 hover:text-gray-400 active:cursor-grabbing"
                    tabIndex={-1}
                >
                    <GripVertical className="h-3.5 w-3.5" />
                </button>

                <div className="flex-1 min-w-0">
                    <Link
                        href={`/projects/${project.id}`}
                        className="font-medium text-sm text-gray-100 hover:text-primary-400 transition-colors line-clamp-2"
                        onClick={(e) => isDragging && e.preventDefault()}
                    >
                        {project.name}
                    </Link>
                    {project.client && (
                        <p className="mt-0.5 text-xs text-gray-500 truncate">{project.client}</p>
                    )}
                </div>

                {/* Actions */}
                {onEdit && onDelete && (
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                            onClick={onEdit}
                            className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                        >
                            <Edit className="h-3 w-3" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="rounded p-1 text-gray-500 hover:bg-red-500/20 hover:text-red-400"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Progress */}
            <div className="mt-2.5">
                <Progress value={project.progress} showLabel />
            </div>

            {/* Footer */}
            <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Category Icon */}
                    <span
                        className={cn(
                            "inline-flex items-center rounded-full p-0.5",
                            isOwnProject
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-amber-500/15 text-amber-400"
                        )}
                    >
                        {isOwnProject ? <Rocket className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                    </span>

                    {/* Deadline */}
                    {project.deadline && (
                        <span className={cn(
                            "flex items-center gap-0.5 text-[10px]",
                            isOverdue ? "text-red-400" : isUrgent ? "text-yellow-400" : "text-gray-500"
                        )}>
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDate(project.deadline)}
                        </span>
                    )}
                </div>

                {/* Value */}
                {project.totalValue > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                        <Banknote className="h-2.5 w-2.5" />
                        {formatCurrency(project.totalValue)}
                    </span>
                )}
            </div>

            {/* Tasks mini bar */}
            {project._count?.tasks > 0 && (
                <div className="mt-2 flex items-center gap-1">
                    <div className="h-1 flex-1 rounded-full bg-gray-800">
                        <div className="h-1 rounded-full bg-gray-600" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500">{project._count.tasks} tasks</span>
                </div>
            )}
        </div>
    )
}
