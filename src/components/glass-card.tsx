'use client';
import * as React from "react"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const GlassCardComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="h-full"
      style={{ willChange: "transform" }}
    >
      <Card
        ref={ref}
        className={cn(
          "rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] bg-[#0B1220]/40 overflow-hidden",
          className
        )}
        {...props}
      />
    </motion.div>
  )
})
GlassCardComponent.displayName = "GlassCard"

export const GlassCard = React.memo(GlassCardComponent)

export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
