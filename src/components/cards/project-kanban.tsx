"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ExternalLink, Edit, Trash2, Calendar, Banknote, User, Rocket, GripVertical } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn, formatCurrency, formatDate, getDaysUntil } from "@/lib/utils"

interface ProjectKanbanProps {
    onEdit: (project: any) => void
    onDelete: (project: any) => void
}

const COLUMNS = [
    { key: "PLANNING", label: "Planning", color: "#6366F1", bgGlow: "from-indigo-500/10" },
    { key: "ACTIVE", label: "Active", color: "#3B82F6", bgGlow: "from-blue-500/10" },
    { key: "ON_HOLD", label: "On Hold", color: "#F59E0B", bgGlow: "from-amber-500/10" },
    { key: "REVIEW", label: "Review", color: "#8B5CF6", bgGlow: "from-purple-500/10" },
    { key: "COMPLETED", label: "Completed", color: "#10B981", bgGlow: "from-emerald-500/10" },
    { key: "CANCELLED", label: "Cancelled", color: "#EF4444", bgGlow: "from-red-500/10" },
]

export function ProjectKanban({ onEdit, onDelete }: ProjectKanbanProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await fetch("/api/projects")
            if (!res.ok) throw new Error("Failed")
            return res.json()
        },
    })

    const projects = data?.data || []

    const projectsByStatus = useMemo(() => {
        const grouped: Record<string, any[]> = {}
        COLUMNS.forEach(col => { grouped[col.key] = [] })
        projects.forEach((p: any) => {
            if (grouped[p.status]) {
                grouped[p.status].push(p)
            }
        })
        return grouped
    }, [projects])

    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4">
                {COLUMNS.slice(0, 4).map(col => (
                    <div key={col.key} className="w-72 flex-shrink-0">
                        <div className="h-8 w-24 animate-pulse rounded bg-gray-800 mb-3" />
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-800/50" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Only show columns that have projects or are important statuses
    const visibleColumns = COLUMNS.filter(
        col => (projectsByStatus[col.key]?.length > 0) || ["PLANNING", "ACTIVE", "REVIEW", "COMPLETED"].includes(col.key)
    )

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {visibleColumns.map(col => {
                const items = projectsByStatus[col.key] || []
                return (
                    <div key={col.key} className="w-72 flex-shrink-0">
                        {/* Column Header */}
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                                <h3 className="text-sm font-semibold text-gray-200">{col.label}</h3>
                                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-400">
                                    {items.length}
                                </span>
                            </div>
                        </div>

                        {/* Column Content */}
                        <div className={cn(
                            "min-h-[200px] space-y-3 rounded-xl border border-gray-800/60 bg-gradient-to-b to-transparent p-3",
                            col.bgGlow
                        )}>
                            {items.length > 0 ? (
                                items.map((project: any) => (
                                    <KanbanCard
                                        key={project.id}
                                        project={project}
                                        columnColor={col.color}
                                        onEdit={() => onEdit(project)}
                                        onDelete={() => onDelete(project)}
                                    />
                                ))
                            ) : (
                                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-800/50">
                                    <p className="text-xs text-gray-600">No projects</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function KanbanCard({
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
    const isOwnProject = project.category === "OWN"
    const daysLeft = project.deadline ? getDaysUntil(project.deadline) : null
    const isOverdue = daysLeft !== null && daysLeft < 0
    const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0

    return (
        <div className={cn(
            "group relative rounded-xl border bg-gray-900/80 p-3.5 transition-all duration-200",
            "hover:shadow-lg hover:-translate-y-0.5",
            isOwnProject
                ? "border-gray-800 hover:border-emerald-800/50 hover:shadow-emerald-500/5"
                : "border-gray-800 hover:border-amber-800/50 hover:shadow-amber-500/5"
        )}>
            {/* Top bar - color accent */}
            <div
                className="absolute left-3 right-3 top-0 h-0.5 rounded-b"
                style={{ backgroundColor: project.color || columnColor }}
            />

            {/* Header */}
            <div className="flex items-start justify-between">
                <Link
                    href={`/projects/${project.id}`}
                    className="flex-1 font-medium text-sm text-gray-100 hover:text-primary-400 transition-colors line-clamp-2"
                >
                    {project.name}
                </Link>
                <div className="ml-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
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
            </div>

            {/* Client */}
            {project.client && (
                <p className="mt-1 text-xs text-gray-500 truncate">{project.client}</p>
            )}

            {/* Progress */}
            <div className="mt-2.5">
                <Progress value={project.progress} showLabel />
            </div>

            {/* Footer */}
            <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Category */}
                    <span
                        className={cn(
                            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[10px] font-medium",
                            isOwnProject
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-amber-500/15 text-amber-400"
                        )}
                    >
                        {isOwnProject ? (
                            <><Rocket className="h-2.5 w-2.5" /></>
                        ) : (
                            <><User className="h-2.5 w-2.5" /></>
                        )}
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

            {/* Tasks count */}
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
