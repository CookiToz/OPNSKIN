"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  glowColor?: "green" | "blue" | "violet" | "none"
  tiltEffect?: boolean
  children: React.ReactNode
  animateIn?: boolean
  delay?: number
}

export function AnimatedCard({
  glowColor = "none",
  tiltEffect = false,
  children,
  className,
  animateIn = true,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(!animateIn)

  const glowClasses = {
    none: "",
    green: "hover-glow-green",
    blue: "hover-glow-blue",
    violet: "hover-glow-violet",
  }

  useEffect(() => {
    if (animateIn) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [animateIn, delay])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEffect || !cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    if (!tiltEffect || !cardRef.current) return

    const card = cardRef.current
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)"
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        "transition-all duration-300",
        glowClasses[glowColor],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        tiltEffect && "transition-transform duration-200",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Card>
  )
}
