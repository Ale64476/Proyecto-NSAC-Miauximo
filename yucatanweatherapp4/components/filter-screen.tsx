"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LanguageToggle } from "@/components/language-toggle"
import { translations, type Language } from "@/lib/translations"
import {
  MapPin,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Snowflake,
  Waves,
  Landmark,
  Mountain,
  Building2,
  CalendarIcon,
  ArrowLeft,
  Moon,
  User,
} from "lucide-react"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { InteractiveMap } from "@/components/interactive-map"

interface FilterScreenProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  selectedPlace: string
  setSelectedPlace: (place: string) => void
  selectedClimate: string
  setSelectedClimate: (climate: string) => void
  setSelectedLocationData: (data: { name: string; lat: number; lng: number; type: string } | null) => void
  onPredict: () => void
  onBack: () => void
  onProfile: () => void
}

const locationsByPlace = {
  playas: [
    {
      x: 310,
      y: 160,
      lat: 20.6296,
      lng: -87.0739,
      possibleClimates: ["soleado", "ventoso", "nublado"],
      name: "Playa del Carmen",
    },
    {
      x: 330,
      y: 140,
      lat: 21.1619,
      lng: -86.8515,
      possibleClimates: ["soleado", "lluvioso", "ventoso"],
      name: "Cancún",
    },
    { x: 290, y: 180, lat: 20.2114, lng: -87.4654, possibleClimates: ["soleado", "nublado", "ventoso"], name: "Tulum" },
    { x: 350, y: 200, lat: 21.2311, lng: -86.745, possibleClimates: ["soleado", "lluvioso"], name: "Isla Mujeres" },
    {
      x: 100,
      y: 280,
      lat: 19.8301,
      lng: -90.5349,
      possibleClimates: ["soleado", "ventoso", "lluvioso"],
      name: "Campeche",
    },
    { x: 140, y: 240, lat: 20.8667, lng: -90.3833, possibleClimates: ["soleado", "nublado"], name: "Celestún" },
  ],
  arqueologicas: [
    {
      x: 200,
      y: 180,
      lat: 20.6843,
      lng: -88.5678,
      possibleClimates: ["soleado", "lluvioso", "nublado"],
      name: "Chichén Itzá",
    },
    { x: 180, y: 220, lat: 20.3597, lng: -89.7717, possibleClimates: ["soleado", "nublado", "ventoso"], name: "Uxmal" },
    { x: 280, y: 190, lat: 20.495, lng: -87.734, possibleClimates: ["soleado", "lluvioso"], name: "Cobá" },
    {
      x: 240,
      y: 200,
      lat: 21.15,
      lng: -88.0833,
      possibleClimates: ["soleado", "nublado", "lluvioso"],
      name: "Ek Balam",
    },
    { x: 130, y: 260, lat: 19.595, lng: -90.2333, possibleClimates: ["soleado", "lluvioso", "ventoso"], name: "Edzná" },
    { x: 160, y: 200, lat: 20.6333, lng: -89.4667, possibleClimates: ["soleado", "nublado"], name: "Mayapán" },
    { x: 300, y: 170, lat: 20.2145, lng: -87.4292, possibleClimates: ["soleado", "lluvioso"], name: "Tulum Ruinas" },
  ],
  montanas: [
    { x: 150, y: 190, lat: 20.3, lng: -89.5, possibleClimates: ["nublado", "ventoso", "lluvioso"], name: "Puuc" },
    {
      x: 190,
      y: 240,
      lat: 19.85,
      lng: -89.2,
      possibleClimates: ["nublado", "lluvioso", "ventoso"],
      name: "Sierra Alta",
    },
    {
      x: 220,
      y: 220,
      lat: 20.1,
      lng: -88.8,
      possibleClimates: ["ventoso", "nublado", "soleado"],
      name: "Cerro Benito Juárez",
    },
    { x: 170, y: 270, lat: 19.6, lng: -89.6, possibleClimates: ["lluvioso", "nublado"], name: "Sierrita de Ticul" },
  ],
  ciudades: [
    {
      x: 180,
      y: 200,
      lat: 20.9674,
      lng: -89.5926,
      possibleClimates: ["soleado", "nublado", "lluvioso", "ventoso"],
      name: "Mérida",
    },
    {
      x: 320,
      y: 150,
      lat: 21.1619,
      lng: -86.8515,
      possibleClimates: ["soleado", "lluvioso", "ventoso"],
      name: "Cancún",
    },
    {
      x: 110,
      y: 270,
      lat: 19.8301,
      lng: -90.5349,
      possibleClimates: ["soleado", "ventoso", "lluvioso"],
      name: "Campeche",
    },
    {
      x: 250,
      y: 210,
      lat: 20.6896,
      lng: -88.2026,
      possibleClimates: ["soleado", "nublado", "ventoso"],
      name: "Valladolid",
    },
    {
      x: 300,
      y: 180,
      lat: 20.6296,
      lng: -87.0739,
      possibleClimates: ["soleado", "lluvioso"],
      name: "Playa del Carmen",
    },
    {
      x: 340,
      y: 190,
      lat: 18.5001,
      lng: -88.296,
      possibleClimates: ["soleado", "ventoso", "lluvioso"],
      name: "Chetumal",
    },
  ],
}

export function FilterScreen({
  selectedDate,
  setSelectedDate,
  selectedPlace,
  setSelectedPlace,
  selectedClimate,
  setSelectedClimate,
  setSelectedLocationData,
  onPredict,
  onBack,
  onProfile,
}: FilterScreenProps) {
  const [showDatePicker, setShowDatePicker] = useState(true)
  const [showPlaces, setShowPlaces] = useState(false)
  const [showClimates, setShowClimates] = useState(false)
  const [mapMarkers, setMapMarkers] = useState<
    Array<{ x: number; y: number; lat: number; lng: number; type: string; id: number; name: string; climate?: string }>
  >([])
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState<Language>("es")
  const [selectedClimates, setSelectedClimates] = useState<string[]>([])

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

  useEffect(() => {
    if (!selectedPlace) {
      handlePlaceSelect("arqueologicas")
      setTimeout(() => {
        handleLocationClick(0)
      }, 100)
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

  const handlePlaceSelect = (placeId: string) => {
    setSelectedPlace(placeId)
    setSelectedLocation(null)
    setSelectedClimates([])
    setSelectedClimate("")

    const locations = locationsByPlace[placeId as keyof typeof locationsByPlace] || []

    const markers = locations.map((loc, index) => ({
      x: loc.x,
      y: loc.y,
      lat: loc.lat,
      lng: loc.lng,
      type: "place",
      id: index,
      name: loc.name,
    }))
    setMapMarkers(markers)
  }

  const handleClimateSelect = (climateId: string) => {
    let newSelectedClimates: string[]

    if (selectedClimates.includes(climateId)) {
      newSelectedClimates = selectedClimates.filter((c) => c !== climateId)
    } else {
      newSelectedClimates = [...selectedClimates, climateId]
    }

    setSelectedClimates(newSelectedClimates)
    setSelectedClimate(newSelectedClimates[0] || "")
    setSelectedLocation(null)

    if (!selectedPlace) {
      return
    }

    const locations = locationsByPlace[selectedPlace as keyof typeof locationsByPlace] || []

    if (newSelectedClimates.length === 0) {
      const markers = locations.map((loc, index) => ({
        x: loc.x,
        y: loc.y,
        lat: loc.lat,
        lng: loc.lng,
        type: "place",
        id: index,
        name: loc.name,
      }))
      setMapMarkers(markers)
      return
    }

    const filteredLocations = locations.filter((loc) => {
      return loc.possibleClimates.some((climate) => newSelectedClimates.includes(climate))
    })

    const markers = filteredLocations.map((loc, index) => {
      const climateFromBackend = newSelectedClimates[0] || "place"
      return {
        x: loc.x,
        y: loc.y,
        lat: loc.lat,
        lng: loc.lng,
        type: "place-with-climate",
        climate: climateFromBackend,
        id: index,
        name: loc.name,
      }
    })
    setMapMarkers(markers)
  }

  const handleLocationClick = (id: number) => {
    setSelectedLocation(id)
    const locationData = mapMarkers[id]
    if (locationData) {
      setSelectedLocationData({
        name: locationData.name,
        lat: locationData.lat,
        lng: locationData.lng,
        type: selectedClimate || "place",
      })
    }
  }

  const togglePlaces = () => {
    setShowPlaces(!showPlaces)
    if (!showPlaces) {
      setShowClimates(false)
    }
  }

  const toggleClimates = () => {
    setShowClimates(!showClimates)
    if (!showClimates) {
      setShowPlaces(false)
    }
  }

  const toggleLanguage = () => {
    const newLang: Language = language === "es" ? "en" : "es"
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
  }

  const t = translations[language]

  const places = [
    { id: "playas", label: t.beaches, icon: Waves },
    { id: "arqueologicas", label: t.archaeological, icon: Landmark },
    { id: "montanas", label: t.mountains, icon: Mountain },
    { id: "ciudades", label: t.cities, icon: Building2 },
  ]

  const climates = [
    { id: "soleado", label: t.sunny, icon: Sun, color: "text-yellow-500" },
    { id: "nublado", label: t.cloudy, icon: Cloud, color: "text-gray-500" },
    { id: "ventoso", label: t.windy, icon: Wind, color: "text-blue-400" },
    { id: "lluvioso", label: t.rainy, icon: CloudRain, color: "text-blue-600" },
    { id: "nevado", label: t.snowy, icon: Snowflake, color: "text-cyan-300" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/12 via-teal-400/8 to-cyan-500/12 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-3 flex justify-between items-start border-b border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" />
              {t.backButton}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDatePicker(true)} className="gap-1.5 text-sm">
              <CalendarIcon className="w-3.5 h-3.5" />
              {format(selectedDate, "dd/MM/yy", { locale: language === "es" ? es : enUS })}
            </Button>
          </div>
          <div className="flex gap-2">
            <LanguageToggle language={language} onToggle={toggleLanguage} />
            <Button
              variant="outline"
              size="sm"
              onClick={onProfile}
              className="shadow-sm text-sm gap-1.5 bg-transparent"
            >
              <User className="w-3.5 h-3.5" />
              {t.profile || "Perfil"}
            </Button>
          </div>
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

        <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">{t.selectDate}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
              <Button onClick={() => setShowDatePicker(false)} className="w-full">
                {t.continue}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <main className="flex-1 p-4 space-y-4">
          <div className="flex gap-2">
            <Button
              variant={showPlaces ? "default" : "outline"}
              onClick={togglePlaces}
              className="gap-1.5 whitespace-nowrap text-sm transition-all hover:scale-105 active:scale-95"
              size="sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              {t.placeButton}
            </Button>
            <Button
              variant={showClimates ? "default" : "outline"}
              onClick={toggleClimates}
              className="gap-1.5 whitespace-nowrap text-sm transition-all hover:scale-105 active:scale-95"
              size="sm"
            >
              <Cloud className="w-3.5 h-3.5" />
              {t.climateButton}
            </Button>
          </div>

          {showPlaces && (
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {places.map((place) => {
                  const Icon = place.icon
                  return (
                    <Button
                      key={place.id}
                      variant={selectedPlace === place.id ? "default" : "outline"}
                      onClick={() => handlePlaceSelect(place.id)}
                      className="gap-1.5 whitespace-nowrap text-sm transition-all hover:scale-105 active:scale-95"
                      size="sm"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {place.label}
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          {showClimates && (
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {climates.map((climate) => {
                  const Icon = climate.icon
                  const isSelected = selectedClimates.includes(climate.id)
                  return (
                    <Button
                      key={climate.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleClimateSelect(climate.id)}
                      className="gap-1.5 whitespace-nowrap text-sm transition-all hover:scale-105 active:scale-95"
                      size="sm"
                      disabled={!selectedPlace}
                    >
                      <Icon className={`w-3.5 h-3.5 ${climate.color}`} />
                      {climate.label}
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          <InteractiveMap
            markers={mapMarkers}
            selectedLocation={selectedLocation}
            onLocationClick={handleLocationClick}
            selectedClimate={selectedClimate}
            language={language}
          />

          {(selectedPlace || selectedClimates.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedPlace && (
                <Badge variant="secondary" className="gap-1.5 text-sm py-1.5 px-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {places.find((p) => p.id === selectedPlace)?.label}
                </Badge>
              )}
              {selectedClimates.map((climateId) => {
                const climate = climates.find((c) => c.id === climateId)
                if (!climate) return null
                const Icon = climate.icon
                return (
                  <Badge key={climateId} variant="secondary" className="gap-1.5 text-sm py-1.5 px-3">
                    <Icon className="w-3.5 h-3.5" />
                    {climate.label}
                  </Badge>
                )
              })}
            </div>
          )}

          <Button
            onClick={onPredict}
            disabled={selectedLocation === null}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base py-6 font-semibold hover:scale-105 active:scale-95"
          >
            {selectedLocation === null ? t.selectLocation : t.predictWeather}
          </Button>
        </main>
      </div>
    </div>
  )
}
