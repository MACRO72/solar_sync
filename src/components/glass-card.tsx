'use client';
import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget;
    
    // Remove any existing ripples
    const existingRipple = card.querySelector(".ripple");
    if (existingRipple) {
      existingRipple.remove();
    }

    const circle = document.createElement("span");
    const diameter = Math.max(card.clientWidth, card.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - card.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - card.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");

    card.appendChild(circle);
    
    setTimeout(() => {
        circle.remove()
    }, 600)
  };

  return (
    <Card
      ref={ref}
      className={cn(
        "ripple-effect rounded-lg backdrop-blur-sm border border-border/20 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_5px] hover:shadow-yellow-500/30 hover:scale-[1.02] animate-energy-wave",
        className
      )}
      onMouseDown={createRipple}
      {...props}
    />
  )
})
GlassCard.displayName = "GlassCard"

export { GlassCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
