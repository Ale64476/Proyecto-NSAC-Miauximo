// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// TODO: Conectar con tu backend - Obtener todos los lugares disponibles
export async function getLugares() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lugares`)
    if (!response.ok) {
      throw new Error("Error al obtener lugares")
    }
    const data = await response.json()
    console.log("[v0] Lugares obtenidos:", data)
    return data
  } catch (error) {
    console.error("[v0] Error en getLugares:", error)
    throw error
  }
}

// TODO: Conectar con tu backend - Enviar datos a la RNA para predicción
export async function predictWeather(data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Error al obtener predicción")
    }

    const result = await response.json()
    console.log("[v0] Predicción obtenida:", result)
    return result
  } catch (error) {
    console.error("[v0] Error en predictWeather:", error)
    throw error
  }
}

// Tipos de datos para las respuestas del backend
export interface WeatherPrediction {
  temperature?: number
  humidity?: number
  windSpeed?: number
  climate?: string
  predictionPercentage?: number
}

export interface Location {
  id?: string
  name: string
  lat: number
  lng: number
  type: "beach" | "archaeological" | "mountain" | "city"
}
