import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-transparent border-none min-h-[80px] w-full min-w-0 rounded-md px-3 py-2 text-base transition-[color,box-shadow] outline-none resize-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:outline-none focus:ring-0",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
