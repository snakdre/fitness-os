import * as React from "react"

import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    const overflowClass =
      orientation === "vertical"
        ? "overflow-y-auto overflow-x-hidden"
        : orientation === "horizontal"
          ? "overflow-x-auto overflow-y-hidden"
          : "overflow-auto"

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          overflowClass,
          "scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
