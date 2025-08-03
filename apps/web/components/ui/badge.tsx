import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-[0_0_5px_rgba(81,167,194,0.3)]",
        secondary: "border-transparent bg-secondary text-secondary-foreground shadow-[0_0_5px_rgba(155,81,224,0.3)]",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-opnskin-green text-success-foreground shadow-[0_0_5px_rgba(0,255,163,0.3)]",
        neon: "border-opnskin-green/50 bg-opnskin-green/10 text-opnskin-green shadow-[0_0_5px_rgba(0,255,163,0.3)]",
        neonViolet:
          "border-opnskin-violet/50 bg-opnskin-violet/10 text-opnskin-violet shadow-[0_0_5px_rgba(155,81,224,0.3)]",
        neonBlue: "border-opnskin-blue/50 bg-opnskin-blue/10 text-opnskin-blue shadow-[0_0_5px_rgba(81,167,194,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
