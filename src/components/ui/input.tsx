import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "h-10 w-full rounded-lg border bg-gray-800 px-3 text-sm text-gray-100",
            "placeholder:text-gray-500",
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
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
