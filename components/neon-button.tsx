import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NeonButtonProps extends React.ComponentProps<typeof Button> {
  neonColor?: "green" | "blue" | "violet"
  glitch?: boolean
  children: React.ReactNode
}

export function NeonButton({ neonColor = "green", glitch = false, children, className, ...props }: NeonButtonProps) {
  const colorClasses = {
    green:
      "border-kalpix-green text-kalpix-green hover:bg-kalpix-green/10 shadow-[0_0_10px_rgba(0,255,163,0.2)] hover:shadow-[0_0_20px_rgba(0,255,163,0.4)]",
    blue: "border-kalpix-blue text-kalpix-blue hover:bg-kalpix-blue/10 shadow-[0_0_10px_rgba(81,167,194,0.2)] hover:shadow-[0_0_20px_rgba(81,167,194,0.4)]",
    violet:
      "border-kalpix-violet text-kalpix-violet hover:bg-kalpix-violet/10 shadow-[0_0_10px_rgba(155,81,224,0.2)] hover:shadow-[0_0_20px_rgba(155,81,224,0.4)]",
  }

  return (
    <Button
      variant="outline"
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        colorClasses[neonColor],
        glitch && "hover:animate-glitch",
        className,
      )}
      {...props}
    >
      {children}
      <span className="absolute inset-0 opacity-0 hover:opacity-20 bg-gradient-to-r from-transparent via-current to-transparent transition-opacity duration-300"></span>
    </Button>
  )
}
