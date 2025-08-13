"use client";

import { useEffect } from "react";

/**
 * Sets a stable CSS variable --app-vh to avoid iOS URL bar causing layout shift.
 * --app-vh equals window.innerHeight in px, so you can use calc(var(--app-vh) * X).
 */
export default function ViewportFix() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      // For convenience, expose full height in px as --app-vh
      document.documentElement.style.setProperty("--app-vh", `${vh * 100}px`);
    };
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(setVh);
    };
    setVh();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}


