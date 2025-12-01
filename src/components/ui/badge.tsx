import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple"
  size?: "sm" | "md"
  dot?: boolean
  pulse?: boolean
  className?: string
}

const variantStyles = {
  default: "bg-gray-700 text-gray-300",
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

const dotColors = {
  default: "bg-gray-400",
  success: "bg-green-400",
  warning: "bg-yellow-400",
  danger: "bg-red-400",
  info: "bg-blue-400",
  purple: "bg-purple-400",
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  pulse = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dotColors[variant],
            pulse && "animate-pulse"
          )}
        />
      )}
      {children}
    </span>
  )
}

// Status badge presets
export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: BadgeProps["variant"]; label: string; pulse?: boolean }> = {
    PLANNING: { variant: "purple", label: "Planning" },
    ACTIVE: { variant: "success", label: "Active", pulse: true },
    ON_HOLD: { variant: "warning", label: "On Hold" },
    REVIEW: { variant: "info", label: "Review" },
    COMPLETED: { variant: "default", label: "Completed" },
    CANCELLED: { variant: "danger", label: "Cancelled" },
    // Task statuses
    TODO: { variant: "default", label: "To Do" },
    IN_PROGRESS: { variant: "info", label: "In Progress", pulse: true },
    BLOCKED: { variant: "danger", label: "Blocked" },
    // Payment statuses
    PENDING: { variant: "warning", label: "Pending" },
    PAID: { variant: "success", label: "Paid" },
    OVERDUE: { variant: "danger", label: "Overdue" },
  }

  const { variant, label, pulse } = config[status] || { variant: "default", label: status }

  return (
    <Badge variant={variant} dot pulse={pulse}>
      {label}
    </Badge>
  )
}
