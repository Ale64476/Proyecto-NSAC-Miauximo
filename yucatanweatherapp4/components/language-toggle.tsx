"use client"

import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import type { Language } from "@/lib/translations"

interface LanguageToggleProps {
  language: Language
  onToggle: () => void
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="shadow-sm text-xs gap-1 min-w-[70px] bg-transparent"
    >
      <Languages className="w-3 h-3" />
      {language === "es" ? "ES" : "EN"}
    </Button>
  )
}
