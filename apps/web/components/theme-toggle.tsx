"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = (resolvedTheme || theme) === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Basculer le thème clair/sombre"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="text-opnskin-text-secondary hover:text-opnskin-text-primary"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}


