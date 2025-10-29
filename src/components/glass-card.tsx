import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "rounded-xl bg-card/60 backdrop-blur-sm border border-border/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
      className
    )}
    {...props}
  />
))
GlassCard.displayName = "GlassCard"

export { GlassCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
