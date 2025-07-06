import type React from "react"
import { cn } from "@/lib/utils"

interface TerminalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  scanLines?: boolean
  glowColor?: "green" | "blue" | "violet" | "none"
  children: React.ReactNode
}

export function TerminalCard({
  title,
  scanLines = true,
  glowColor = "none",
  children,
  className,
  ...props
}: TerminalCardProps) {
  const glowClasses = {
    none: "",
    green: "shadow-[0_0_15px_rgba(0,255,163,0.2)]",
    blue: "shadow-[0_0_15px_rgba(81,167,194,0.2)]",
    violet: "shadow-[0_0_15px_rgba(155,81,224,0.2)]",
  }

  return (
    <div
      className={cn(
        "terminal-bg rounded-lg overflow-hidden border border-white/10 transition-all duration-300",
        scanLines && "scan-lines",
        glowClasses[glowColor],
        className,
      )}
      {...props}
    >
      {title && (
        <div className="px-4 py-2 border-b border-white/10 bg-black/50 flex items-center">
          <div className="flex gap-1.5 mr-3">
            <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
          </div>
          <div className="font-mono text-xs text-white/70">{title}</div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
