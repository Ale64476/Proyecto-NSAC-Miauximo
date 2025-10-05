"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageToggle } from "@/components/language-toggle"
import { translations, type Language } from "@/lib/translations"
import { ArrowLeft, Moon, Sun, History, Heart, MapPin, Calendar, Cloud } from "lucide-react"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import type { SearchHistory, Favorite } from "@/app/page"

interface ProfileScreenProps {
  searchHistory: SearchHistory[]
  favorites: Favorite[]
  onBack: () => void
  onSelectFavorite: (favorite: Favorite) => void
}

export function ProfileScreen({ searchHistory, favorites, onBack, onSelectFavorite }: ProfileScreenProps) {
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState<Language>("es")

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = stored === "dark" || (!stored && prefersDark)
    setIsDark(shouldBeDark)

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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/12 via-teal-400/8 to-cyan-500/12 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-3 flex justify-between items-start border-b border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" />
            {t.backButton}
          </Button>
          <LanguageToggle language={language} onToggle={toggleLanguage} />
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

        <main className="flex-1 p-4 space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {language === "es" ? "Mi Perfil" : "My Profile"}
            </h1>
            <p className="text-muted-foreground text-base">
              {language === "es" ? "Historial y lugares favoritos" : "History and favorite places"}
            </p>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history" className="gap-2 text-sm">
                <History className="w-4 h-4" />
                {language === "es" ? "Historial" : "History"}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2 text-sm">
                <Heart className="w-4 h-4" />
                {language === "es" ? "Favoritos" : "Favorites"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-4">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3">
                  {searchHistory.length === 0 ? (
                    <Card className="border border-border/50">
                      <CardContent className="p-6 text-center">
                        <History className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          {language === "es" ? "No hay búsquedas recientes" : "No recent searches"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    searchHistory.map((item) => (
                      <Card
                        key={item.id}
                        className="border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {item.location}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(item.date, "dd/MM/yy", { locale: language === "es" ? es : enUS })}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              <Cloud className="w-3 h-3 mr-1" />
                              {item.climate}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(item.timestamp, "PPp", { locale: language === "es" ? es : enUS })}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="favorites" className="mt-4">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3">
                  {favorites.length === 0 ? (
                    <Card className="border border-border/50">
                      <CardContent className="p-6 text-center">
                        <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          {language === "es" ? "No tienes lugares favoritos" : "You have no favorite places"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    favorites.map((fav) => (
                      <Card
                        key={fav.id}
                        className="border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg cursor-pointer"
                        onClick={() => onSelectFavorite(fav)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            {fav.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {fav.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {language === "es" ? "Agregado el" : "Added on"}{" "}
                            {format(fav.addedAt, "PP", { locale: language === "es" ? es : enUS })}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectFavorite(fav)
                            }}
                          >
                            {language === "es" ? "Ver en mapa" : "View on map"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
