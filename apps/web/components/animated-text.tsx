"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
  type?: "typing" | "fade" | "glitch"
  color?: "default" | "green" | "blue" | "violet"
}

export function AnimatedText({
  text,
  className,
  delay = 0,
  speed = 50,
  type = "typing",
  color = "default",
}: AnimatedTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  const colorClasses = {
    default: "text-foreground",
      green: "text-opnskin-green",
  blue: "text-opnskin-blue",
  violet: "text-opnskin-violet",
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout

    timeout = setTimeout(() => {
      setIsAnimating(true)

      if (type === "typing") {
        let i = 0
        const typingInterval = setInterval(() => {
          setDisplayText(text.substring(0, i))
          i++
          if (i > text.length) {
            clearInterval(typingInterval)
            setIsAnimating(false)
          }
        }, speed)

        return () => clearInterval(typingInterval)
      } else if (type === "fade" || type === "glitch") {
        setDisplayText(text)

        const animationTimeout = setTimeout(() => {
          setIsAnimating(false)
        }, 500) // Animation duration

        return () => clearTimeout(animationTimeout)
      }
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, delay, speed, type])

  if (type === "typing") {
    return (
      <span className={cn(colorClasses[color], "font-mono", className)}>
        {displayText}
        {isAnimating && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse"></span>}
      </span>
    )
  }

  if (type === "glitch") {
    return (
      <span className={cn(colorClasses[color], isAnimating ? "animate-glitch" : "", "inline-block", className)}>
        {displayText}
      </span>
    )
  }

  // Fade type
  return (
    <span className={cn(colorClasses[color], isAnimating ? "animate-fade-in" : "opacity-0", "inline-block", className)}>
      {displayText}
    </span>
  )
}
