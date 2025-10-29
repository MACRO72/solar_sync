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
      "rounded-lg bg-card/60 backdrop-blur-sm border border-border/20 shadow-lg bg-cover bg-center bg-blend-screen",
      "bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]",
      className
    )}
    {...props}
  />
))
GlassCard.displayName = "GlassCard"

export { GlassCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
