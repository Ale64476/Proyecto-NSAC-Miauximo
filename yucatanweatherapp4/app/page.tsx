"use client"

import { useState, useEffect } from "react"
import { LandingScreen } from "@/components/landing-screen"
import { FilterScreen } from "@/components/filter-screen"
import { ResultsScreen } from "@/components/results-screen"
import { ProfileScreen } from "@/components/profile-screen"

export type SearchHistory = {
  id: string
  date: Date
  location: string
  climate: string
  place: string
  timestamp: Date
}

export type Favorite = {
  id: string
  name: string
  lat: number
  lng: number
  type: string
  addedAt: Date
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"landing" | "filter" | "results" | "profile">("landing")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPlace, setSelectedPlace] = useState<string>("")
  const [selectedClimate, setSelectedClimate] = useState<string>("")
  const [selectedLocationData, setSelectedLocationData] = useState<{
    name: string
    lat: number
    lng: number
    type: string
  } | null>(null)

  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])

  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory")
    const storedFavorites = localStorage.getItem("favorites")

    if (storedHistory) {
      const parsed = JSON.parse(storedHistory)
      setSearchHistory(
        parsed.map((item: any) => ({
          ...item,
          date: new Date(item.date),
          timestamp: new Date(item.timestamp),
        })),
      )
    }

    if (storedFavorites) {
      const parsed = JSON.parse(storedFavorites)
      setFavorites(
        parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        })),
      )
    }
  }, [])

  const addToHistory = (location: string, climate: string, place: string) => {
    const newEntry: SearchHistory = {
      id: Date.now().toString(),
      date: selectedDate,
      location,
      climate,
      place,
      timestamp: new Date(),
    }

    const updated = [newEntry, ...searchHistory].slice(0, 20) // Mantener solo las últimas 20
    setSearchHistory(updated)
    localStorage.setItem("searchHistory", JSON.stringify(updated))
  }

  const toggleFavorite = (location: { name: string; lat: number; lng: number; type: string }) => {
    const exists = favorites.find((f) => f.name === location.name)

    if (exists) {
      const updated = favorites.filter((f) => f.name !== location.name)
      setFavorites(updated)
      localStorage.setItem("favorites", JSON.stringify(updated))
      return false
    } else {
      const newFav: Favorite = {
        id: Date.now().toString(),
        ...location,
        addedAt: new Date(),
      }
      const updated = [newFav, ...favorites]
      setFavorites(updated)
      localStorage.setItem("favorites", JSON.stringify(updated))
      return true
    }
  }

  const isFavorite = (locationName: string) => {
    return favorites.some((f) => f.name === locationName)
  }

  return (
    <div className="min-h-screen max-w-md mx-auto">
      {currentScreen === "landing" && (
        <LandingScreen onContinue={() => setCurrentScreen("filter")} onProfile={() => setCurrentScreen("profile")} />
      )}
      {currentScreen === "filter" && (
        <FilterScreen
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
          selectedClimate={selectedClimate}
          setSelectedClimate={setSelectedClimate}
          setSelectedLocationData={setSelectedLocationData}
          onPredict={() => {
            if (selectedLocationData) {
              addToHistory(selectedLocationData.name, selectedClimate, selectedPlace)
            }
            setCurrentScreen("results")
          }}
          onBack={() => setCurrentScreen("landing")}
          onProfile={() => setCurrentScreen("profile")}
        />
      )}
      {currentScreen === "results" && (
        <ResultsScreen
          selectedDate={selectedDate}
          selectedPlace={selectedPlace}
          selectedClimate={selectedClimate}
          selectedLocationData={selectedLocationData}
          onBack={() => setCurrentScreen("filter")}
          onProfile={() => setCurrentScreen("profile")}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
        />
      )}
      {currentScreen === "profile" && (
        <ProfileScreen
          searchHistory={searchHistory}
          favorites={favorites}
          onBack={() => setCurrentScreen("landing")}
          onSelectFavorite={(fav) => {
            setSelectedLocationData({
              name: fav.name,
              lat: fav.lat,
              lng: fav.lng,
              type: fav.type,
            })
            setCurrentScreen("filter")
          }}
        />
      )}
    </div>
  )
}
