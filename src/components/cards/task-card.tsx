"use client"

import { useState } from "react"
import { MoreVertical, Calendar, Edit, Trash2, CheckCircle2 } from "lucide-react"
import { cn, formatDate, getDaysUntil } from "@/lib/utils"
import { StatusBadge, Badge } from "@/components/ui/badge"

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string | null
    status: string
    priority: string
    dueDate?: string | Date | null
    project?: {
      id: string
      name: string
      color?: string | null
    }
  }
  onEdit?: () => void
  onDelete?: () => void
  onStatusChange?: (status: string) => void
}

const priorityColors = {
  URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  LOW: "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const daysUntilDue = task.dueDate ? getDaysUntil(task.dueDate) : null
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== "COMPLETED"
  const isCompleted = task.status === "COMPLETED"

  return (
    <div
      className={cn(
        "group rounded-lg border bg-gray-900/50 p-4 transition-all",
        "hover:border-gray-700 hover:bg-gray-900",
        isCompleted && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onStatusChange?.(isCompleted ? "TODO" : "COMPLETED")}
          className={cn(
            "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
            isCompleted
              ? "border-green-500 bg-green-500 text-white"
              : "border-gray-600 hover:border-gray-500"
          )}
        >
          {isCompleted && <CheckCircle2 className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium text-gray-100",
                isCompleted && "line-through text-gray-400"
              )}
            >
              {task.title}
            </h4>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-gray-800 bg-gray-900 py-1 shadow-xl">
                    <button
                      onClick={() => { setShowMenu(false); onEdit?.() }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); onDelete?.() }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-sm text-gray-400 line-clamp-2">{task.description}</p>
          )}

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <Badge
              variant={task.priority === "URGENT" ? "danger" : task.priority === "HIGH" ? "warning" : "default"}
              size="sm"
            >
              {task.priority}
            </Badge>
            {task.project && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: task.project.color || "#6366F1" }}
                />
                {task.project.name}
              </span>
            )}
            {task.dueDate && (
              <span className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-red-400" : "text-gray-500")}>
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
                {isOverdue && " (Overdue)"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
