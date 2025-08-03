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
        success: "border-transparent bg-kalpix-green text-success-foreground shadow-[0_0_5px_rgba(0,255,163,0.3)]",
        neon: "border-kalpix-green/50 bg-kalpix-green/10 text-kalpix-green shadow-[0_0_5px_rgba(0,255,163,0.3)]",
        neonViolet:
          "border-kalpix-violet/50 bg-kalpix-violet/10 text-kalpix-violet shadow-[0_0_5px_rgba(155,81,224,0.3)]",
        neonBlue: "border-kalpix-blue/50 bg-kalpix-blue/10 text-kalpix-blue shadow-[0_0_5px_rgba(81,167,194,0.3)]",
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
