"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe, Plane, Moon, Sun } from "lucide-react"
import { LoginModal } from "@/components/login-modal"
import { LanguageToggle } from "@/components/language-toggle"
import { translations, type Language } from "@/lib/translations"
import Image from "next/image"

interface LandingScreenProps {
  onContinue: () => void
  onProfile: () => void
}

export function LandingScreen({ onContinue, onProfile }: LandingScreenProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState<Language>("es")

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = stored === "dark" || (!stored && prefersDark)
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    }

    const storedLang = localStorage.getItem("language") as Language
    if (storedLang && (storedLang === "es" || storedLang === "en")) {
      setLanguage(storedLang)
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

  const toggleLanguage = () => {
    const newLang: Language = language === "es" ? "en" : "es"
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
  }

  const t = translations[language]

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-teal-400/10 to-cyan-500/15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-3 flex justify-end gap-2 border-b border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
          <LanguageToggle language={language} onToggle={toggleLanguage} />
          <Button variant="outline" size="sm" onClick={() => setShowLoginModal(true)} className="shadow-sm text-sm">
            {t.loginButton}
          </Button>
        </header>

        <div className="flex justify-end px-3 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/90 to-accent/90 backdrop-blur-md shadow-lg border border-white/20 hover:scale-110 hover:shadow-xl transition-all duration-300"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-white" /> : <Moon className="h-4 w-4 text-white" />}
          </Button>
        </div>

        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} language={language} />

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-teal-500/30 rounded-full blur-3xl opacity-60 animate-pulse" />
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-card to-card/80 border-4 border-primary/40 shadow-2xl backdrop-blur-sm">
              <Globe className="w-16 h-16 text-primary animate-spin-slow drop-shadow-lg" />
              <div className="absolute inset-0 flex items-center justify-center animate-orbit-plane">
                <Plane className="w-7 h-7 text-accent drop-shadow-lg transform rotate-60" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-3 max-w-sm px-2">
            <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-primary via-blue-600 to-teal-600 bg-clip-text text-transparent leading-tight">
              {t.appTitle}
            </h1>
            <p className="text-muted-foreground text-pretty leading-relaxed text-base">{t.appDescription}</p>
          </div>

          <Button
            onClick={onContinue}
            size="lg"
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 px-8 py-6 text-base font-semibold"
          >
            {t.startButton}
          </Button>

          <div className="w-full max-w-sm mt-6 relative">
            <div className="aspect-square rounded-2xl overflow-hidden border-2 border-primary/40 shadow-2xl relative bg-black">
              <Image
                src={
                  isDark
                    ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_h3urr3h3urr3h3ur-GawNF6uynK1X2GxNB6y6nvnLC7LIp7.png"
                    : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dise%C3%B1o%20sin%20t%C3%ADtulo%20%282%29-QgmSFNCgjqUSW0NnspBrY4NydbKdXz.png"
                }
                alt="Península de Yucatán"
                fill
                className="object-contain"
                priority
              />
              <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
                <defs>
                  <filter id="glow-landing">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {[
                  { x: 140, y: 240, size: 4, delay: 0, color: "oklch(0.6 0.2 220)" },
                  { x: 180, y: 200, size: 5, delay: 0.3, color: "oklch(0.65 0.18 145)" },
                  { x: 220, y: 220, size: 4.5, delay: 0.6, color: "oklch(0.6 0.2 220)" },
                  { x: 270, y: 190, size: 6, delay: 0.9, color: "oklch(0.65 0.18 145)" },
                  { x: 160, y: 170, size: 5, delay: 1.2, color: "oklch(0.6 0.2 220)" },
                  { x: 250, y: 150, size: 5.5, delay: 1.5, color: "oklch(0.65 0.18 145)" },
                  { x: 300, y: 240, size: 6, delay: 1.8, color: "oklch(0.6 0.2 220)" },
                  { x: 200, y: 260, size: 5, delay: 2.1, color: "oklch(0.65 0.18 145)" },
                  { x: 190, y: 180, size: 4.5, delay: 2.4, color: "oklch(0.6 0.2 220)" },
                  { x: 240, y: 270, size: 5, delay: 2.7, color: "oklch(0.65 0.18 145)" },
                ].map((location, i) => (
                  <g key={i}>
                    <circle
                      cx={location.x}
                      cy={location.y}
                      r={location.size * 2}
                      fill={location.color}
                      opacity="0.3"
                      filter="url(#glow-landing)"
                      className="animate-pulse-glow"
                      style={{ animationDelay: `${location.delay}s` }}
                    />
                    <circle
                      cx={location.x}
                      cy={location.y}
                      r={location.size}
                      fill={location.color}
                      stroke="white"
                      strokeWidth="1.5"
                      className="drop-shadow-lg"
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
