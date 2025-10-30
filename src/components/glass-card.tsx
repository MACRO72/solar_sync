'use client';
import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {

  return (
    <Card
      ref={ref}
      className={cn(
        "rounded-2xl backdrop-blur-sm border border-border/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_5px] hover:shadow-yellow-500/30 hover:scale-[1.02] animate-energy-wave",
        className
      )}
      {...props}
    />
  )
})
GlassCard.displayName = "GlassCard"

export { GlassCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
