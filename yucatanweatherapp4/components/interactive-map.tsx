"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, Sun, Cloud, CloudRain, Wind, Snowflake, X } from "lucide-react"
import Image from "next/image"
import { translations, type Language } from "@/lib/translations"

interface MapMarker {
  x: number
  y: number
  type: string
  climate?: string
  id: number
  name: string
  lat: number
  lng: number
}

interface InteractiveMapProps {
  markers: MapMarker[]
  selectedLocation: number | null
  onLocationClick: (id: number) => void
  selectedClimate: string
  zoomLevel?: number
  centerLat?: number
  centerLng?: number
  showZoomControls?: boolean
  language: Language
}

const getLocationDescription = (locationName: string, language: Language): string => {
  const descriptionKeys: Record<string, string> = {
    "Chichén Itzá": "chichenItzaDesc",
    Uxmal: "uxmalDesc",
    Cobá: "cobaDesc",
    "Ek Balam": "ekBalamDesc",
    Edzná: "edznaDesc",
    Mayapán: "mayapanDesc",
    "Tulum Ruinas": "tulumRuinasDesc",
    Cancún: "cancunDesc",
    "Playa del Carmen": "playaDelCarmenDesc",
    Tulum: "tulumDesc",
    Mérida: "meridaDesc",
    Campeche: "campecheDesc",
    Celestún: "celestunDesc",
    "Isla Mujeres": "islaMujeresDesc",
    Valladolid: "valladolidDesc",
    Chetumal: "chetumalDesc",
  }

  const key = descriptionKeys[locationName]
  return key ? translations[language][key as keyof typeof translations.es] : ""
}

const locationInfo: Record<string, { image: string }> = {
  "Chichén Itzá": {
    image: "/chichen-itza-pyramid.jpg",
  },
  Uxmal: {
    image: "/uxmal-pyramid-maya.jpg",
  },
  Cobá: {
    image: "/coba-pyramid-jungle.jpg",
  },
  "Ek Balam": {
    image: "/ek-balam-maya-ruins.jpg",
  },
  Edzná: {
    image: "/edzna-maya-temple.jpg",
  },
  Mayapán: {
    image: "/mayapan-ruins.jpg",
  },
  "Tulum Ruinas": {
    image: "/tulum-ruins-beach.jpg",
  },
  Cancún: {
    image: "/cancun-beach-caribbean.jpg",
  },
  "Playa del Carmen": {
    image: "/playa-del-carmen-beach.png",
  },
  Tulum: {
    image: "/tulum-beach-palm-trees.jpg",
  },
  Mérida: {
    image: "/merida-yucatan-cathedral.jpg",
  },
  Campeche: {
    image: "/campeche-colonial-city.jpg",
  },
  Celestún: {
    image: "/celestun-flamingos-beach.jpg",
  },
  "Isla Mujeres": {
    image: "/isla-mujeres-beach.jpg",
  },
  Valladolid: {
    image: "/valladolid-yucatan-colonial.jpg",
  },
  Chetumal: {
    image: "/chetumal-bay-mexico.jpg",
  },
}

const climateIcons = {
  soleado: Sun,
  nublado: Cloud,
  ventoso: Wind,
  lluvioso: CloudRain,
  nevado: Snowflake,
}

function getClimateIconSvg(climate: string, isSelected: boolean): string {
  const size = isSelected ? 11 : 10
  const strokeWidth = isSelected ? 2.5 : 2

  switch (climate) {
    case "soleado":
      return `
        <svg width="20" height="20" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="${size}" fill="#fbbf24" stroke="white" strokeWidth="${strokeWidth}"/>
          ${[0, 45, 90, 135, 180, 225, 270, 315]
            .map(
              (angle) => `
            <line x1="${20 + Math.cos((angle * Math.PI) / 180) * 14}" 
                  y1="${20 + Math.sin((angle * Math.PI) / 180) * 14}"
                  x2="${20 + Math.cos((angle * Math.PI) / 180) * 19}" 
                  y2="${20 + Math.sin((angle * Math.PI) / 180) * 19}"
                  stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
          `,
            )
            .join("")}
        </svg>
      `
    case "nublado":
      return `
        <svg width="20" height="20" viewBox="0 0 40 40">
          <ellipse cx="20" cy="20" rx="${size + 2}" ry="${size - 1}" 
                   fill="#9ca3af" stroke="white" strokeWidth="${strokeWidth}"/>
        </svg>
      `
    case "lluvioso":
      return `
        <svg width="20" height="20" viewBox="0 0 40 40">
          <ellipse cx="20" cy="17" rx="${size + 1}" ry="${size - 2}" 
                   fill="#3b82f6" stroke="white" strokeWidth="${strokeWidth}"/>
          <line x1="15" y1="25" x2="13" y2="32" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="20" y1="25" x2="18" y2="32" stroke="#3b82f6" strokeWidth="2"/>
          <line x1="25" y1="25" x2="23" y2="32" stroke="#3b82f6" strokeWidth="2"/>
        </svg>
      `
    case "ventoso":
      return `
        <svg width="20" height="20" viewBox="0 0 40 40">
          <path d="M 5 20 L 30 20 L 26 15" stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M 8 28 L 28 28 L 24 23" stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      `
    case "nevado":
      return `
        <svg width="20" height="20" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="${size - 7}" fill="#67e8f9" stroke="white" strokeWidth="1"/>
          ${[0, 60, 120, 180, 240, 300]
            .map(
              (angle) => `
            <circle cx="${20 + Math.cos((angle * Math.PI) / 180) * 8}" 
                    cy="${20 + Math.sin((angle * Math.PI) / 180) * 8}" 
                    r="${size - 7}" 
                    fill="#67e8f9" stroke="white" strokeWidth="1"/>
          `,
            )
            .join("")}
        </svg>
      `
    default:
      return ""
  }
}

export function InteractiveMap({
  markers,
  selectedLocation,
  onLocationClick,
  selectedClimate,
  zoomLevel,
  centerLat,
  centerLng,
  showZoomControls = true,
  language,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [popupData, setPopupData] = useState<{
    marker: MapMarker
    position: { x: number; y: number }
  } | null>(null)
  const [previousZoom, setPreviousZoom] = useState<number | null>(null)
  const [previousCenter, setPreviousCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [isMapLocked, setIsMapLocked] = useState(false)
  const [mapSize, setMapSize] = useState<number>(0)

  const currentLanguage: Language = language && translations[language] ? language : "es"
  const t = translations[currentLanguage]

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        if ((window as any).L) {
          initializeMap()
          return
        }

        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => {
          initializeMap()
        }
        script.onerror = () => {
          setError("Error al cargar el mapa")
          setIsLoading(false)
        }
        document.head.appendChild(script)
      } catch (err) {
        console.error("[v0] Error loading Leaflet:", err)
        setError("Error al cargar el mapa")
        setIsLoading(false)
      }
    }

    const initializeMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = (window as any).L
      if (!L) return

      try {
        const map = L.map(mapRef.current, {
          center: centerLat && centerLng ? [centerLat, centerLng] : [20.5, -88.5],
          zoom: zoomLevel || 8,
          minZoom: 7,
          maxZoom: 13,
          zoomControl: false,
        })

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        mapInstanceRef.current = map
        markersLayerRef.current = L.layerGroup().addTo(map)
        setIsLoading(false)
      } catch (err) {
        console.error("[v0] Error initializing map:", err)
        setError("Error al inicializar el mapa")
        setIsLoading(false)
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [zoomLevel, centerLat, centerLng])

  useEffect(() => {
    const updateMapSize = () => {
      if (mapRef.current) {
        const width = mapRef.current.offsetWidth
        setMapSize(width * 0.75)
      }
    }

    updateMapSize()
    window.addEventListener("resize", updateMapSize)

    return () => {
      window.removeEventListener("resize", updateMapSize)
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return

    const L = (window as any).L
    if (!L) return

    markersLayerRef.current.clearLayers()

    markers.forEach((marker) => {
      const isSelected = selectedLocation === marker.id

      let iconHtml = ""
      let iconSize: [number, number] = [30, 30]

      if (marker.type === "place-with-climate" && marker.climate) {
        const climateIconSvg = getClimateIconSvg(marker.climate, false)
        iconHtml = `
          <div style="position: relative; display: flex; align-items: center; gap: 4px;">
            <svg width="30" height="40" viewBox="0 0 30 40">
              <path d="M15 0 C7 0 0 7 0 15 C0 23 15 40 15 40 C15 40 30 23 30 15 C30 7 23 0 15 0 Z" 
                    fill="${isSelected ? "oklch(0.65 0.25 220)" : "oklch(0.55 0.15 220)"}" 
                    stroke="white" 
                    strokeWidth="${isSelected ? "2.5" : "2"}"/>
              <circle cx="15" cy="15" r="5" fill="white"/>
            </svg>
            <div style="width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              ${climateIconSvg}
            </div>
            ${isSelected ? '<div style="position: absolute; top: 50%; left: 15px; transform: translate(-50%, -50%); width: 60px; height: 60px; border-radius: 50%; background: oklch(0.6 0.2 220); opacity: 0.2; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ""}
          </div>
        `
        iconSize = [60, 40]
      } else if (marker.type === "place") {
        iconHtml = `
          <div style="position: relative;">
            <svg width="30" height="40" viewBox="0 0 30 40">
              <path d="M15 0 C7 0 0 7 0 15 C0 23 15 40 15 40 C15 40 30 23 30 15 C30 7 23 0 15 0 Z" 
                    fill="${isSelected ? "oklch(0.65 0.25 220)" : "oklch(0.55 0.15 220)"}" 
                    stroke="white" 
                    strokeWidth="${isSelected ? "2.5" : "2"}"/>
              <circle cx="15" cy="15" r="5" fill="white"/>
            </svg>
            ${isSelected ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; border-radius: 50%; background: oklch(0.6 0.2 220); opacity: 0.2; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ""}
          </div>
        `
        iconSize = [30, 40]
      } else if (marker.type === "soleado") {
        iconHtml = getClimateIconSvg("soleado", isSelected)
      } else if (marker.type === "nublado") {
        iconHtml = getClimateIconSvg("nublado", isSelected)
      } else if (marker.type === "lluvioso") {
        iconHtml = getClimateIconSvg("lluvioso", isSelected)
      } else if (marker.type === "ventoso") {
        iconHtml = getClimateIconSvg("ventoso", isSelected)
      } else if (marker.type === "nevado") {
        iconHtml = getClimateIconSvg("nevado", isSelected)
      }

      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-marker",
        iconSize: iconSize,
        iconAnchor: marker.type === "place" || marker.type === "place-with-climate" ? [15, 40] : [20, 20],
      })

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon }).on("click", (e: any) => {
        const map = mapInstanceRef.current
        if (map) {
          setPreviousZoom(map.getZoom())
          setPreviousCenter(map.getCenter())

          const bounds = map.getBounds()
          const lngOffset = (bounds.getEast() - bounds.getWest()) * 0.08
          const latOffset = (bounds.getNorth() - bounds.getSouth()) * 0.08

          map.setView([marker.lat + latOffset, marker.lng + lngOffset], 10, { animate: true, duration: 0.5 })

          setTimeout(() => {
            map.dragging.disable()
            map.scrollWheelZoom.disable()
            map.doubleClickZoom.disable()
            map.touchZoom.disable()
            setIsMapLocked(true)
          }, 500)
        }

        setPopupData({
          marker,
          position: { x: 0, y: 0 },
        })
      })

      markersLayerRef.current.addLayer(leafletMarker)
    })
  }, [markers, selectedLocation, onLocationClick])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const handleClosePopup = () => {
    if (mapInstanceRef.current) {
      if (previousZoom !== null && previousCenter !== null) {
        mapInstanceRef.current.setView([previousCenter.lat, previousCenter.lng], previousZoom, {
          animate: true,
          duration: 0.5,
        })
      }
      mapInstanceRef.current.dragging.enable()
      mapInstanceRef.current.scrollWheelZoom.enable()
      mapInstanceRef.current.doubleClickZoom.enable()
      mapInstanceRef.current.touchZoom.enable()
    }
    setPopupData(null)
    setPreviousZoom(null)
    setPreviousCenter(null)
    setIsMapLocked(false)
  }

  const handlePopupClick = () => {
    if (popupData) {
      onLocationClick(popupData.marker.id)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dragging.enable()
        mapInstanceRef.current.scrollWheelZoom.enable()
        mapInstanceRef.current.doubleClickZoom.enable()
        mapInstanceRef.current.touchZoom.enable()
      }
      setPopupData(null)
      setPreviousZoom(null)
      setPreviousCenter(null)
      setIsMapLocked(false)
    }
  }

  const ClimateIcon = selectedClimate ? climateIcons[selectedClimate as keyof typeof climateIcons] : Sun

  if (error) {
    return (
      <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl bg-card flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-card flex items-center justify-center z-10">
          <p className="text-muted-foreground text-sm">{t.loadingMap}</p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      {showZoomControls && (
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-[1000]">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow h-9 w-9"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow h-9 w-9"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      )}

      {popupData && mapSize > 0 && (
        <div className="absolute inset-0 z-[2000] flex items-start justify-center p-4 pt-12 pl-24 pointer-events-none">
          <Card
            className="shadow-2xl border-2 border-primary/40 bg-card/98 backdrop-blur-md overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-300"
            style={{
              width: `${mapSize}px`,
              height: `${mapSize * 0.6}px`,
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/90 hover:bg-background shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                handleClosePopup()
              }}
            >
              <X className="w-4 h-4" />
            </Button>

            <div
              className="cursor-pointer hover:scale-[1.01] transition-transform h-full overflow-y-auto custom-scrollbar"
              onClick={handlePopupClick}
            >
              <div className="relative flex flex-col">
                <div className="relative w-full h-48 overflow-hidden flex-shrink-0">
                  <Image
                    src={locationInfo[popupData.marker.name]?.image || "/placeholder.svg"}
                    alt={popupData.marker.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <ClimateIcon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-lg">
                    {t[popupData.marker.name as keyof typeof t] || popupData.marker.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {getLocationDescription(popupData.marker.name, currentLanguage)}
                  </p>
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-sm text-center text-muted-foreground font-medium">{t.selectIfInterested}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .custom-marker {
          background: none !important;
          border: none !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>
    </div>
  )
}
