"use client"

import { X, Calendar, Clock, Flag, Edit, Trash2, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { StatusBadge, Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, getDaysUntil } from "@/lib/utils"

interface TaskDetailModalProps {
  task: any
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: string) => void
}

const priorityColors: Record<string, string> = {
  URGENT: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-gray-400",
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskDetailModalProps) {
  if (!task) return null

  const daysUntilDue = task.dueDate ? getDaysUntil(task.dueDate) : null
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== "COMPLETED"
  const isCompleted = task.status === "COMPLETED"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-800 bg-gray-900 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-800 p-6">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} />
                  <Badge
                    variant={task.priority === "URGENT" ? "danger" : task.priority === "HIGH" ? "warning" : "default"}
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
                <h2 className={`mt-3 text-xl font-semibold ${isCompleted ? "text-gray-400 line-through" : "text-gray-100"}`}>
                  {task.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              {task.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                  <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                {/* Project */}
                {task.project && (
                  <div className="rounded-lg bg-gray-800/50 p-3">
                    <p className="text-xs text-gray-500">Project</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: task.project.color || "#6366F1" }}
                      />
                      <span className="text-sm text-gray-200">{task.project.name}</span>
                    </div>
                  </div>
                )}

                {/* Due Date */}
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <p className="text-xs text-gray-500">Due Date</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {task.dueDate ? (
                      <span className={`text-sm ${isOverdue ? "text-red-400" : "text-gray-200"}`}>
                        {formatDate(task.dueDate)}
                        {isOverdue && " (Overdue)"}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">No due date</span>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <p className="text-xs text-gray-500">Priority</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Flag className={`h-4 w-4 ${priorityColors[task.priority]}`} />
                    <span className={`text-sm ${priorityColors[task.priority]}`}>{task.priority}</span>
                  </div>
                </div>

                {/* Created */}
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <p className="text-xs text-gray-500">Created</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-200">{formatDate(task.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Status Change */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Change Status</h4>
                <div className="flex flex-wrap gap-2">
                  {["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => onStatusChange(status)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        task.status === status
                          ? "bg-primary-500 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between border-t border-gray-800 p-4">
              <Button variant="danger" size="sm" onClick={onDelete}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
              <Button size="sm" onClick={onEdit}>
                <Edit className="mr-1 h-4 w-4" /> Edit
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
