"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LoginModal } from "@/components/login-modal"
import { LanguageToggle } from "@/components/language-toggle"
import { translations, type Language } from "@/lib/translations"
import {
  ArrowLeft,
  MapPin,
  Sun,
  CloudRain,
  Wind,
  Snowflake,
  Droplets,
  Gauge,
  Calendar,
  Moon,
  Cloud,
  User,
  Heart,
  Umbrella,
  Shirt,
  Glasses,
  WindIcon,
  SunSnowIcon as SnowIcon,
} from "lucide-react"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { InteractiveMap } from "@/components/interactive-map"
import Image from "next/image"

interface ResultsScreenProps {
  selectedDate: Date
  selectedPlace: string
  selectedClimate: string
  selectedLocationData: { name: string; lat: number; lng: number; type: string } | null
  onBack: () => void
  onProfile: () => void
  isFavorite: (locationName: string) => boolean
  toggleFavorite: (location: { name: string; lat: number; lng: number; type: string }) => boolean
}

const climateIcons = {
  soleado: Sun,
  nublado: Cloud,
  ventoso: Wind,
  lluvioso: CloudRain,
  nevado: Snowflake,
}

const climateColors = {
  soleado: "text-yellow-500",
  nublado: "text-gray-500",
  ventoso: "text-blue-400",
  lluvioso: "text-blue-600",
  nevado: "text-cyan-300",
}

const climateRecommendations = {
  soleado: {
    es: [
      { icon: Glasses, text: "Usa protector solar FPS 50+" },
      { icon: Glasses, text: "Lleva gafas de sol" },
      { icon: Shirt, text: "Viste ropa ligera y clara" },
      { icon: Droplets, text: "Mantente hidratado" },
    ],
    en: [
      { icon: Glasses, text: "Use SPF 50+ sunscreen" },
      { icon: Glasses, text: "Bring sunglasses" },
      { icon: Shirt, text: "Wear light, bright clothing" },
      { icon: Droplets, text: "Stay hydrated" },
    ],
  },
  lluvioso: {
    es: [
      { icon: Umbrella, text: "Lleva paraguas o impermeable" },
      { icon: Shirt, text: "Usa calzado antideslizante" },
      { icon: Wind, text: "Protege tus dispositivos electrónicos" },
    ],
    en: [
      { icon: Umbrella, text: "Bring umbrella or raincoat" },
      { icon: Shirt, text: "Wear non-slip footwear" },
      { icon: Wind, text: "Protect your electronic devices" },
    ],
  },
  nublado: {
    es: [
      { icon: Glasses, text: "Aún necesitas protector solar" },
      { icon: Shirt, text: "Lleva una chaqueta ligera" },
    ],
    en: [
      { icon: Glasses, text: "You still need sunscreen" },
      { icon: Shirt, text: "Bring a light jacket" },
    ],
  },
  ventoso: {
    es: [
      { icon: WindIcon, text: "Usa ropa ajustada" },
      { icon: Shirt, text: "Lleva una chaqueta cortavientos" },
      { icon: Glasses, text: "Protege tus ojos del polvo" },
    ],
    en: [
      { icon: WindIcon, text: "Wear fitted clothing" },
      { icon: Shirt, text: "Bring a windbreaker" },
      { icon: Glasses, text: "Protect your eyes from dust" },
    ],
  },
  nevado: {
    es: [
      { icon: SnowIcon, text: "Viste en capas" },
      { icon: Shirt, text: "Usa ropa térmica" },
      { icon: Glasses, text: "Protege extremidades del frío" },
    ],
    en: [
      { icon: SnowIcon, text: "Dress in layers" },
      { icon: Shirt, text: "Wear thermal clothing" },
      { icon: Glasses, text: "Protect extremities from cold" },
    ],
  },
}

const locationInfo: Record<string, { description: { es: string; en: string }; image: string }> = {
  "Chichén Itzá": {
    description: {
      es: "Una de las Siete Maravillas del Mundo Moderno. Impresionante ciudad maya con la icónica pirámide de Kukulkán.",
      en: "One of the Seven Wonders of the Modern World. Impressive Mayan city with the iconic Kukulkan pyramid.",
    },
    image: "/chichen-itza-pyramid.jpg",
  },
  Uxmal: {
    description: {
      es: "Sitio arqueológico maya con la majestuosa Pirámide del Adivino y arquitectura Puuc excepcional.",
      en: "Mayan archaeological site with the majestic Pyramid of the Magician and exceptional Puuc architecture.",
    },
    image: "/uxmal-pyramid-maya.jpg",
  },
  Cobá: {
    description: {
      es: "Antigua ciudad maya con la pirámide Nohoch Mul, una de las más altas de la península de Yucatán.",
      en: "Ancient Mayan city with the Nohoch Mul pyramid, one of the tallest in the Yucatan Peninsula.",
    },
    image: "/coba-pyramid-jungle.jpg",
  },
  "Ek Balam": {
    description: {
      es: "Zona arqueológica maya conocida por sus impresionantes esculturas de estuco y la Acrópolis.",
      en: "Mayan archaeological zone known for its impressive stucco sculptures and the Acropolis.",
    },
    image: "/ek-balam-maya-ruins.jpg",
  },
  Edzná: {
    description: {
      es: "Sitio maya con el impresionante Edificio de los Cinco Pisos y avanzados sistemas hidráulicos.",
      en: "Mayan site with the impressive Five-Story Building and advanced hydraulic systems.",
    },
    image: "/edzna-maya-temple.jpg",
  },
  Mayapán: {
    description: {
      es: "Última gran capital maya, conocida como la 'Bandera de los Mayas', con templos y murallas.",
      en: "Last great Mayan capital, known as the 'Banner of the Mayas', with temples and walls.",
    },
    image: "/mayapan-ruins.jpg",
  },
  "Tulum Ruinas": {
    description: {
      es: "Única ciudad maya amurallada junto al mar Caribe, con vistas espectaculares.",
      en: "Only walled Mayan city by the Caribbean Sea, with spectacular views.",
    },
    image: "/tulum-ruins-beach.jpg",
  },
  Cancún: {
    description: {
      es: "Paraíso turístico con playas de arena blanca, aguas turquesas y vida nocturna vibrante.",
      en: "Tourist paradise with white sand beaches, turquoise waters and vibrant nightlife.",
    },
    image: "/cancun-beach-caribbean.jpg",
  },
  "Playa del Carmen": {
    description: {
      es: "Destino costero con hermosas playas, la famosa Quinta Avenida y acceso a cenotes.",
      en: "Coastal destination with beautiful beaches, the famous Fifth Avenue and access to cenotes.",
    },
    image: "/playa-del-carmen-beach.png",
  },
  Tulum: {
    description: {
      es: "Pueblo bohemio con playas paradisíacas, cenotes místicos y ambiente relajado.",
      en: "Bohemian town with paradisiacal beaches, mystical cenotes and relaxed atmosphere.",
    },
    image: "/tulum-beach-palm-trees.jpg",
  },
  Mérida: {
    description: {
      es: "Capital cultural de Yucatán, conocida como la 'Ciudad Blanca', con arquitectura colonial.",
      en: "Cultural capital of Yucatan, known as the 'White City', with colonial architecture.",
    },
    image: "/merida-yucatan-cathedral.jpg",
  },
  Campeche: {
    description: {
      es: "Ciudad amurallada Patrimonio de la Humanidad con coloridas fachadas coloniales.",
      en: "Walled city World Heritage Site with colorful colonial facades.",
    },
    image: "/campeche-colonial-city.jpg",
  },
  Celestún: {
    description: {
      es: "Reserva natural famosa por sus flamencos rosados y manglares impresionantes.",
      en: "Natural reserve famous for its pink flamingos and impressive mangroves.",
    },
    image: "/celestun-flamingos-beach.jpg",
  },
  "Isla Mujeres": {
    description: {
      es: "Isla paradisíaca con playas cristalinas, snorkel y ambiente caribeño relajado.",
      en: "Paradisiacal island with crystal clear beaches, snorkeling and relaxed Caribbean atmosphere.",
    },
    image: "/isla-mujeres-beach.jpg",
  },
  Valladolid: {
    description: {
      es: "Pueblo mágico colonial con cenotes cercanos y arquitectura colorida tradicional.",
      en: "Colonial magical town with nearby cenotes and traditional colorful architecture.",
    },
    image: "/valladolid-yucatan-colonial.jpg",
  },
  Chetumal: {
    description: {
      es: "Capital de Quintana Roo, puerta a Belice y la Bahía de Chetumal.",
      en: "Capital of Quintana Roo, gateway to Belize and Chetumal Bay.",
    },
    image: "/chetumal-bay-mexico.jpg",
  },
  Puuc: {
    description: {
      es: "Región montañosa con arquitectura maya única y paisajes naturales impresionantes.",
      en: "Mountainous region with unique Mayan architecture and impressive natural landscapes.",
    },
    image: "/placeholder.svg?height=300&width=400",
  },
  "Sierra Alta": {
    description: {
      es: "Zona montañosa con vegetación exuberante y vistas panorámicas de la península.",
      en: "Mountainous area with lush vegetation and panoramic views of the peninsula.",
    },
    image: "/placeholder.svg?height=300&width=400",
  },
  "Cerro Benito Juárez": {
    description: {
      es: "Elevación natural con senderos y miradores para observar la región.",
      en: "Natural elevation with trails and viewpoints to observe the region.",
    },
    image: "/placeholder.svg?height=300&width=400",
  },
  "Sierrita de Ticul": {
    description: {
      es: "Pequeña sierra con formaciones rocosas y biodiversidad única de la región.",
      en: "Small mountain range with rock formations and unique biodiversity of the region.",
    },
    image: "/placeholder.svg?height=300&width=400",
  },
}

export function ResultsScreen({
  selectedDate,
  selectedPlace,
  selectedClimate,
  selectedLocationData,
  onBack,
  onProfile,
  isFavorite,
  toggleFavorite,
}: ResultsScreenProps) {
  const climates = ["soleado", "nublado", "ventoso", "lluvioso", "nevado"]
  const randomClimate = climates[Math.floor(Math.random() * climates.length)]
  const actualClimate = selectedClimate || "soleado" // Default to sunny if no climate selected

  // TODO: Fetch these values from your backend API
  const predictionPercentage = 0 // Replace with backend data
  const temperature = 0 // Replace with backend data (°C)
  const humidity = 0 // Replace with backend data (%)
  const windSpeed = 0 // Replace with backend data (km/h)

  const ClimateIcon = climateIcons[actualClimate as keyof typeof climateIcons] || Cloud
  const climateColor = climateColors[actualClimate as keyof typeof climateColors] || "text-gray-500"

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState<Language>("es")
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = stored === "dark" || (!stored && prefersDark)
    setIsDark(shouldBeDark)

    const storedLang = localStorage.getItem("language") as Language
    if (storedLang && (storedLang === "es" || storedLang === "en")) {
      setLanguage(storedLang)
    }

    if (selectedLocationData) {
      setIsFav(isFavorite(selectedLocationData.name))
    }
  }, [selectedLocationData, isFavorite])

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

  const handleToggleFavorite = () => {
    if (selectedLocationData) {
      const added = toggleFavorite(selectedLocationData)
      setIsFav(added)
    }
  }

  const t = translations[language]

  const climateLabels: Record<string, string> = {
    soleado: t.sunny,
    nublado: t.cloudy,
    ventoso: t.windy,
    lluvioso: t.rainy,
    nevado: t.snowy,
  }

  const recommendations = climateRecommendations[actualClimate as keyof typeof climateRecommendations]?.[language] || []
  const locationDetails = selectedLocationData ? locationInfo[selectedLocationData.name] : null

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/12 via-teal-400/8 to-cyan-500/12 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-3 flex justify-between items-start border-b border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" />
            {t.backToFilters}
          </Button>
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

        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} language={language} />

        <main className="flex-1 p-4 space-y-4 pb-8">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="gap-1.5 text-sm py-1.5 px-3">
              <Calendar className="w-3.5 h-3.5" />
              {format(selectedDate, "dd/MM/yy", { locale: language === "es" ? es : enUS })}
            </Badge>
            {selectedLocationData && (
              <>
                <Badge variant="outline" className="gap-1.5 text-sm py-1.5 px-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedLocationData.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className="gap-1.5 hover:scale-110 transition-all"
                >
                  <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </>
            )}
          </div>

          <Card className="border-2 border-primary/40 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-teal-500/40 rounded-full blur-2xl opacity-60 animate-pulse" />
                  <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center border-4 border-primary/40 shadow-xl">
                    <ClimateIcon className={`w-16 h-16 ${climateColor} drop-shadow-lg`} />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold capitalize bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {climateLabels[actualClimate] || actualClimate}
              </CardTitle>
              <p className="text-muted-foreground text-base">{t.weatherPrediction}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t.predictionConfidence}</span>
                  <span className="text-xl font-bold text-primary">{predictionPercentage}%</span>
                </div>
                <Progress value={predictionPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center shadow-md">
                      <Gauge className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{t.temperature}</p>
                      <p className="text-xl font-bold">{temperature}°C</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 shadow-lg">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent/30 to-accent/20 flex items-center justify-center shadow-md">
                      <Droplets className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{t.humidity}</p>
                      <p className="text-xl font-bold">{humidity}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30 col-span-2 shadow-lg">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/20 flex items-center justify-center shadow-md">
                      <Wind className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{t.windSpeed}</p>
                      <p className="text-xl font-bold">{windSpeed} km/h</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <Card className="border border-primary/30 shadow-xl bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">
                  {language === "es" ? "Recomendaciones" : "Recommendations"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recommendations.map((rec, index) => {
                  const Icon = rec.icon
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-sm font-medium">{rec.text}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {selectedLocationData && locationDetails && (
            <Card className="border border-primary/30 shadow-xl overflow-hidden bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">
                  {language === "es" ? "Sobre este lugar" : "About this place"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={locationDetails.image || "/placeholder.svg"}
                    alt={selectedLocationData.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="px-4 pb-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {locationDetails.description[language]}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedLocationData && (
            <Card className="border border-primary/30 shadow-xl overflow-hidden bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">{t.predictionLocation}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <InteractiveMap
                  markers={[
                    {
                      x: 0,
                      y: 0,
                      lat: selectedLocationData.lat,
                      lng: selectedLocationData.lng,
                      type: selectedLocationData.type,
                      id: 0,
                      name: selectedLocationData.name,
                    },
                  ]}
                  selectedLocation={0}
                  onLocationClick={() => {}}
                  selectedClimate={actualClimate}
                  zoomLevel={11}
                  centerLat={selectedLocationData.lat}
                  centerLng={selectedLocationData.lng}
                  showZoomControls={false}
                />
              </CardContent>
            </Card>
          )}

          <Button
            onClick={onBack}
            size="lg"
            variant="outline"
            className="w-full bg-transparent hover:bg-primary/5 border-2 shadow-lg hover:shadow-xl transition-all text-base py-6 font-semibold hover:scale-105 active:scale-95"
          >
            {t.newPrediction}
          </Button>
        </main>
      </div>
    </div>
  )
}
