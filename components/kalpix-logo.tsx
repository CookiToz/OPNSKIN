import Image from "next/image"
import { cn } from "@/lib/utils"

interface OPNSKINLogoProps {
  className?: string
}

export function OPNSKINLogo({ className }: OPNSKINLogoProps) {
  return (
    <Image
      src="/logo-OPNSKIN.png"
      alt="OPNSKIN logo"
      width={48}
      height={48}
      className={cn("h-12 w-12", className)}
      style={{ minWidth: 48, minHeight: 48 }}
    />
  )
}

