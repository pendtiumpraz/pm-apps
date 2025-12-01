import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "h-10 w-full appearance-none rounded-lg border bg-gray-800 px-3 pr-10 text-sm text-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-150",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
              : "border-gray-700 focus:border-primary-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
