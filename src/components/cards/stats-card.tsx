import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "primary" | "success" | "warning" | "danger"
}

const variants = {
  default: {
    bg: "bg-gray-800/50",
    iconBg: "bg-gray-700",
    iconColor: "text-gray-400",
  },
  primary: {
    bg: "bg-primary-500/10",
    iconBg: "bg-primary-500/20",
    iconColor: "text-primary-400",
  },
  success: {
    bg: "bg-green-500/10",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
  },
  warning: {
    bg: "bg-yellow-500/10",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
  },
  danger: {
    bg: "bg-red-500/10",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
  },
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  const style = variants[variant]

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-800 p-5 transition-all duration-200",
        "hover:border-gray-700 hover:shadow-lg",
        style.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            style.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", style.iconColor)} />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.isPositive
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-100">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}
