import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function Progress({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }

  const getColor = (percent: number) => {
    if (percent >= 80) return "bg-green-500"
    if (percent >= 50) return "bg-blue-500"
    if (percent >= 25) return "bg-yellow-500"
    return "bg-gray-500"
  }

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-gray-400">Progress</span>
          <span className="font-medium text-gray-300">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-gray-800", sizes[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getColor(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
