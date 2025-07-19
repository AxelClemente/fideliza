'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CityChangeModalProps {
  isOpen: boolean
  onClose: () => void
  currentCity: string
}

export function CityChangeModal({
  isOpen,
  onClose,
  currentCity
}: CityChangeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [city, setCity] = useState(currentCity)
  const [locations, setLocations] = useState<string[]>([])

  // Actualizar estado cuando cambie currentCity
  useEffect(() => {
    setCity(currentCity)
  }, [currentCity])

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/location')
        const data = await response.json()
        setLocations(data)
      } catch (err: unknown) {
        console.error('Error fetching locations:', err instanceof Error ? err.message : 'Unknown error')
      }
    }

    if (isOpen) {
      fetchLocations()
    }
  }, [isOpen])

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      if (!city) {
        toast.error("Please select a city")
        return
      }

      const response = await fetch('/api/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
        }),
      })

      if (!response.ok) throw new Error('Failed to update city')

      onClose()

      setTimeout(() => {
        toast.success("City updated successfully", {
          description: `Your city is now set to ${city}`,
          duration: 3000,
        })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }, 300)

    } catch {
      toast.error("Failed to update city. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="
        !max-w-[500px] 
        !p-0 
        !overflow-auto
        !fixed 
        !left-0
        !right-0
        !bottom-0 
        !top-0 
        !translate-x-0
        !translate-y-0 
        !rounded-none
        !h-screen
        md:!left-auto
        md:!right-0
        md:!w-[500px]
        !duration-0
        !animate-none
        !transition-none
      ">
        <div className="!min-h-screen !flex !flex-col">
          <DialogHeader className="!p-3 md:!p-4 !pb-0 !flex-shrink-0">
            <DialogTitle className="
              !text-[24px]
              md:!text-[30px]
              !font-bold 
              !leading-[28px]
              md:!leading-[34px]
              !font-['Open_Sans'] 
              !px-4 
              md:!px-8            
              !mb-2
              !w-full
              !text-center
              md:!text-left
            ">
              Change your city
            </DialogTitle>
          </DialogHeader>

          <div className="!flex-1 !flex !flex-col">
            {/* Content Section */}
            <div className="!flex-1 !p-3 md:!p-4">
              <div className="
                !space-y-6 
                !px-4 
                md:!px-8 
                !mt-8
                md:!mt-12
              ">
                <div className="space-y-2 w-full">
                  <p className="
                    text-[16px]
                    leading-[20px]
                    font-[700]
                    pl-6
                    md:pl-12
                  ">
                    Your City
                  </p>
                  <Select
                    value={city || ''}
                    onValueChange={(value) => {
                      console.log('🏙️ City changed to:', value)
                      setCity(value)
                    }}
                  >
                    <SelectTrigger className="
                      bg-main-gray 
                      h-[60px]
                      md:h-[78px] 
                      w-full
                      md:w-[400px] 
                      rounded-[100px]
                      border-0
                      text-[16px]
                      px-6
                      md:px-12
                      text-[#7B7B7B]
                      flex
                      items-center
                      justify-between
                    ">
                      <SelectValue placeholder="Select your city">
                        {city ? city : "Select your city"}
                      </SelectValue>
                      <ChevronDown className="w-4 h-4 text-[#7B7B7B]" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem 
                          key={location} 
                          value={location}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="
              !w-full
              !p-4
              !bg-white
              !flex 
              !flex-col 
              !items-center
              !mt-auto
              !fixed
              !bottom-0
              !left-0
              !right-0
              md:!relative
              md:!mt-0
            ">
              {/* Buttons Container */}
              <div className="
                !flex
                !flex-col
                !gap-4
                md:!gap-2
                !w-full
                !items-center
              ">
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="
                    !w-[350px]
                    md:!w-[400px]
                    !h-[78px]
                    !rounded-[100px]
                    !bg-black 
                    !text-white
                    !text-[16px] 
                    !font-semibold 
                    !leading-[20px] 
                    !font-['Open_Sans']
                    md:!mt-2
                  "
                >
                  {isLoading ? <ClipLoader size={20} color="#FFFFFF" /> : 'Save'}
                </Button>

                <Button 
                  variant="ghost"
                  onClick={onClose}
                  className="
                    !w-[350px]
                    md:!w-[400px]
                    !h-[78px]
                    !rounded-[100px]
                    !underline
                    !text-[16px] 
                    !font-semibold 
                    !leading-[20px] 
                    !font-['Open_Sans']
                    hover:!bg-gray-100
                  "
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 