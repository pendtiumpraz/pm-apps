"use client"

import Link from "next/link"
import { MoreVertical, Calendar, Banknote, Edit, Trash2, ExternalLink, User, Rocket } from "lucide-react"
import { useState } from "react"
import { cn, formatCurrency, formatDate, getDaysUntil } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    client?: string | null
    stack?: string | null
    status: string
    category?: string | null
    projectNature?: string | null
    deadline?: string | Date | null
    progress: number
    totalValue: number
    paidAmount: number
    color?: string | null
    _count?: {
      tasks?: number
      payments?: number
    }
  }
  onEdit?: () => void
  onDelete?: () => void
}

const categoryStyles = {
  CLIENT: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    label: "Client",
    icon: User,
  },
  OWN: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
    label: "Own Project",
    icon: Rocket,
  },
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const daysUntilDeadline = project.deadline ? getDaysUntil(project.deadline) : null
  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 3 && daysUntilDeadline >= 0

  const cat = project.category === "OWN" ? "OWN" : "CLIENT"
  const catStyle = categoryStyles[cat]
  const CatIcon = catStyle.icon

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-gradient-to-br from-gray-900 to-gray-900/50 p-5 transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-lg",
        cat === "OWN"
          ? "border-gray-800 hover:border-emerald-700/50 hover:shadow-emerald-500/5"
          : "border-gray-800 hover:border-amber-700/50 hover:shadow-amber-500/5"
      )}
    >
      {/* Color indicator - uses category color */}
      <div
        className={cn("absolute left-0 top-0 h-full w-1 rounded-l-xl")}
        style={{ backgroundColor: project.color || (cat === "OWN" ? "#10B981" : "#F59E0B") }}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href={`/projects/${project.id}`}
            className="group/link flex items-center gap-2"
          >
            <h3 className="font-semibold text-gray-100 group-hover/link:text-primary-400">
              {project.name}
            </h3>
            <ExternalLink className="h-3.5 w-3.5 text-gray-500 opacity-0 transition-opacity group-hover/link:opacity-100" />
          </Link>
          {project.client && (
            <p className="mt-1 text-sm text-gray-400">{project.client}</p>
          )}
          {project.stack && (
            <p className="mt-0.5 text-xs text-gray-500">{project.stack}</p>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-800 bg-gray-900 py-1 shadow-xl">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onEdit?.()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onDelete?.()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <Progress value={project.progress} showLabel />
      </div>

      {/* Info */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Calendar className="h-4 w-4" />
          {project.deadline ? (
            <span
              className={cn(
                isOverdue && "text-red-400",
                isUrgent && "text-yellow-400"
              )}
            >
              {formatDate(project.deadline)}
              {isOverdue && " (Overdue)"}
              {isUrgent && ` (${daysUntilDeadline}d left)`}
            </span>
          ) : (
            <span>No deadline</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <Banknote className="h-4 w-4" />
          <span>{formatCurrency(project.totalValue)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={project.status} />
        {/* Category Badge */}
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", catStyle.badge)}>
          <CatIcon className="h-3 w-3" />
          {catStyle.label}
        </span>
        {/* Nature Badge */}
        <span className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          project.projectNature === "STATIC"
            ? "bg-cyan-500/10 text-cyan-400"
            : "bg-violet-500/10 text-violet-400"
        )}>
          {project.projectNature === "STATIC" ? "📄 Static" : "🗄️ Dynamic"}
        </span>
        {project._count?.tasks !== undefined && project._count.tasks > 0 && (
          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
            {project._count.tasks} tasks
          </span>
        )}
        {project.paidAmount > 0 && project.totalValue > 0 && (
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
            {Math.round((project.paidAmount / project.totalValue) * 100)}% paid
          </span>
        )}
      </div>
    </div>
  )
}
