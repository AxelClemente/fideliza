'use client'

import * as React from "react"
import { useRouter } from 'next/navigation'
import { MapPin, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClipLoader } from 'react-spinners'

const cities = [
  "A Coruña",
  "Albacete",
  "Alcalá de Guadaíra",
  "Alcalá de Henares",
  "Alcobendas",
  "Alcorcón",
  "Algeciras",
  "Alicante",
  "Almería",
  "Ávila",
  "Avilés",
  "Badajoz",
  "Badalona",
  "Barakaldo",
  "Barcelona",
  "Benidorm",
  "Bilbao",
  "Burgos",
  "Cáceres",
  "Cádiz",
  "Cartagena",
  "Castellón de la Plana",
  "Ceuta",
  "Chiclana de la Frontera",
  "Ciudad Real",
  "Cornellà de Llobregat",
  "Coslada",
  "Cuenca",
  "Dos Hermanas",
  "El Ejido",
  "El Puerto de Santa María",
  "Elche",
  "Ferrol",
  "Fuengirola",
  "Fuenlabrada",
  "Gandia",
  "Getafe",
  "Gijón",
  "Girona",
  "Granada",
  "Guadalajara",
  "Huelva",
  "Huesca",
  "Jaén",
  "Jerez de la Frontera",
  "La Línea de la Concepción",
  "Las Palmas de Gran Canaria",
  "Las Rozas de Madrid",
  "León",
  "Leganés",
  "Lleida",
  "Logroño",
  "Lorca",
  "Lugo",
  "Madrid",
  "Majadahonda",
  "Málaga",
  "Manresa",
  "Marbella",
  "Mataró",
  "Melilla",
  "Mijas",
  "Móstoles",
  "Murcia",
  "Orihuela",
  "Ourense",
  "Oviedo",
  "Palencia",
  "Palma de Mallorca",
  "Pamplona",
  "Parla",
  "Paterna",
  "Pontevedra",
  "Pozuelo de Alarcón",
  "Reus",
  "Rivas-Vaciamadrid",
  "Rubí",
  "Sabadell",
  "Sagunto",
  "Salamanca",
  "San Cristóbal de La Laguna",
  "San Fernando",
  "San Sebastián",
  "San Sebastián de los Reyes",
  "Sanlúcar de Barrameda",
  "Santa Coloma de Gramenet",
  "Santa Cruz de Tenerife",
  "Santander",
  "Santiago de Compostela",
  "Segovia",
  "Sevilla",
  "Soria",
  "Talavera de la Reina",
  "Tarragona",
  "Telde",
  "Terrassa",
  "Teruel",
  "Toledo",
  "Torrejón de Ardoz",
  "Torremolinos",
  "Torrent",
  "Torrevieja",
  "Valencia",
  "Valladolid",
  "Vélez-Málaga",
  "Vigo",
  "Vilanova i la Geltrú",
  "Vitoria-Gasteiz",
  "Zamora",
  "Zaragoza"
]

export default function Location() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCity, setSelectedCity] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCity) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: selectedCity,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update location')
        }

        router.push('/auth/choose-role')
      } catch {
        toast({
          title: "Error",
          description: "Failed to update location. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="w-[500px] h-[580px] bg-white rounded-[20px] shadow-[0_10px_50px_0_rgba(0,0,0,0.1)] p-4 flex flex-col items-center">
      <h2 className="text-[20px] font-semibold text-main-dark mb-12 mt-8">
        Your city
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
        <div className="relative w-[462px]">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-third-gray z-10" />
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-third-gray z-10" />
          <Select onValueChange={setSelectedCity}>
            <SelectTrigger 
              className="h-[78px] w-[462px] rounded-[100px] bg-main-gray pl-12 pr-12 border-0 
                       !text-[14px] !font-semibold text-third-gray
                       placeholder:text-third-gray placeholder:text-[14px] placeholder:font-semibold
                       focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <SelectValue placeholder="Search your city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem 
                  key={city} 
                  value={city}
                  className="text-[14px] font-semibold text-third-gray"
                >
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          className="h-[78px] w-[462px] rounded-[100px] bg-main-dark text-white hover:bg-main-dark/90 text-[14px] font-semibold relative"
          disabled={!selectedCity || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <ClipLoader size={20} color="#FFFFFF" />
              <span>Updating...</span>
            </div>
          ) : (
            "Continue"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-[78px] w-[462px] rounded-[100px] hover:bg-transparent hover:text-main-dark/80 text-[18px] font-semibold underline decoration-solid"
          onClick={() => router.push('/auth/choose-role')}
          disabled={isLoading}
        >
          Skip
        </Button>
      </form>
    </div>
  )
}