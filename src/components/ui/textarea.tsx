import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "min-h-[80px] w-full rounded-lg border bg-gray-800 px-3 py-2 text-sm text-gray-100",
            "placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-150 resize-none",
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
Textarea.displayName = "Textarea"

export { Textarea }
