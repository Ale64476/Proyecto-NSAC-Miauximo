"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check localStorage and system preference on mount
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const shouldBeDark = stored === "dark" || (!stored && prefersDark)
    setIsDark(shouldBeDark)

    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-primary/90 to-accent/90 backdrop-blur-md shadow-xl border-2 border-white/20 hover:scale-110 hover:shadow-2xl transition-all duration-300"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-white" />}
    </Button>
  )
}
