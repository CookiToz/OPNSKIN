"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {Array.isArray(props.value) && props.value.length === 2 ? (
      <>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full bg-[#287CFA] transition-all duration-150 hover:scale-110" />
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full bg-[#287CFA] transition-all duration-150 hover:scale-110" />
      </>
    ) : (
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full bg-[#287CFA] transition-all duration-150 hover:scale-110" />
    )}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
