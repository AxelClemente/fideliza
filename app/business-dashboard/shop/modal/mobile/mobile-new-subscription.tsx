'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import { Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ModalPortal } from "../../components/modal-portal"
import Image from "next/image"

interface MobileNewSubscriptionProps {
  isOpen: boolean
  onClose: () => void
  places: Array<{ id: string, name: string }>
  mode?: 'create' | 'edit'
  initialData?: {
    id: string
    name: string
    benefits: string
    price: number
    placeId: string
    website?: string | null
  }
}

export function MobileNewSubscription({
  isOpen,
  onClose,
  places,
  mode = 'create',
  initialData
}: MobileNewSubscriptionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [benefits, setBenefits] = useState(initialData?.benefits || '')
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>(
    initialData?.placeId ? [initialData.placeId] : []
  )
  const [website, setWebsite] = useState(initialData?.website || '')
  const [openCommand, setOpenCommand] = useState(false)

  if (!isOpen) return null

  // Logs para debugging
  console.log('Selected Places:', selectedPlaces)
  console.log('Available Places:', places)
  console.log('Open Command State:', openCommand)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // Validaciones básicas
      if (!name.trim() || !benefits.trim() || !price || selectedPlaces.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        })
        return
      }

      const endpoint = mode === 'create' 
        ? '/api/subscriptions' 
        : `/api/subscriptions?id=${initialData?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const payload = {
        name: name.trim(),
        benefits: benefits.trim(),
        price: Number(price),
        placeIds: selectedPlaces,
        ...(website && { website: website.trim() })
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${mode} subscription`)
      }

      toast({
        title: "Success",
        description: `Subscription ${mode === 'create' ? 'created' : 'updated'} successfully`,
      })

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${mode} subscription`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Contenedor principal con scroll */}
        <div className="flex-1 overflow-y-auto pb-[200px]"> {/* Padding bottom para espacio de botones */}
          <div className="p-0 max-w-[390px] mx-auto w-full">
            <h2 className="text-xl font-semibold text-center py-4 mb-4">
              {mode === 'create' ? 'Add new Subscription' : 'Edit Subscription'}
            </h2>

            <div className="space-y-6">
              {/* Subscription Name con icono shop1.svg */}
              <div className="space-y-2 relative">
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Subscription name"
                  className="
                    bg-gray-50 
                    border-none 
                    w-[390px]
                    h-[78px] 
                    rounded-[100px]
                    pl-[60px]
                    mx-auto
                    flex
                    items-center
                  "
                />
                <div className="absolute left-6 top-[50%] -translate-y-[90%] pointer-events-none">
                  <Image
                    src="/shop1.svg"
                    alt="Shop"
                    width={20}
                    height={20}
                  />
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <label className="block text-[16px] font-bold mb-1 pl-6">
                  Purchase benefit
                </label>
                <Textarea 
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Subscription benefits"
                  className="
                    bg-gray-50 
                    border-none 
                    w-[390px]
                    min-h-[78px] 
                    rounded-[100px]
                    pl-12
                    pt-6
                    mx-auto
                  "
                />
              </div>

              {/* Price Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-6">
                  Price
                </label>
                <div className="flex flex-col space-y-3">
                  <Input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="
                      bg-gray-50 
                      border-none 
                      w-[390px]
                      h-[78px] 
                      rounded-[100px]
                      pl-[52px]
                      mx-auto
                    "
                    placeholder="2"
                  />
                  
                  <Input 
                    type="text"
                    value="€"
                    readOnly
                    className="
                      bg-gray-50 
                      border-none 
                      w-[390px]
                      h-[78px] 
                      rounded-[100px]
                      text-left
                      pl-12
                      text-gray-500
                      mx-auto
                    "
                  />
                  
                  <Input 
                    type="text"
                    value="Month"
                    readOnly
                    className="
                      bg-gray-50 
                      border-none 
                      w-[390px]
                      h-[78px] 
                      rounded-[100px]
                      text-left
                      pl-12
                      text-gray-500
                      mx-auto
                    "
                  />
                </div>
              </div>

              {/* Where to use */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 pl-6">
                  Where to use
                </label>
                <Popover open={openCommand} onOpenChange={setOpenCommand}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCommand}
                      className="
                        w-[390px]
                        h-[78px]
                        bg-gray-50
                        border-none
                        rounded-[100px]
                        justify-between
                        pl-6
                        mx-auto
                      "
                    >
                      {selectedPlaces.length === 0 
                        ? "Select places..." 
                        : `${selectedPlaces.length} place${selectedPlaces.length > 1 ? 's' : ''} selected`
                      }
                      <svg
                        className="ml-2 h-4 w-4 shrink-0 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                        />
                      </svg>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[390px] p-0 z-[9999]">
                    <div className="max-h-[300px] overflow-auto p-2">
                      {places.map((place) => (
                        <div
                          key={place.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => {
                            setSelectedPlaces(current => {
                              const isSelected = current.includes(place.id)
                              return isSelected 
                                ? current.filter(id => id !== place.id)
                                : [...current, place.id]
                            })
                            console.log('Place clicked:', place.id)
                          }}
                        >
                          <div className="border border-gray-300 rounded w-4 h-4 flex items-center justify-center">
                            {selectedPlaces.includes(place.id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                          <span className="text-sm">{place.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Website con icono */}
              <div className="space-y-2 relative">
                <Input 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="http://example.com"
                  className="
                    bg-gray-50 
                    border-none 
                    w-[390px]
                    h-[78px] 
                    rounded-[100px]
                    pl-[60px]
                    mx-auto
                    flex
                    items-center
                  "
                />
                <div className="absolute left-6 top-[50%] -translate-y-[90%] pointer-events-none">
                  <Image
                    src="/website.svg"
                    alt="Website"
                    width={19}
                    height={19}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones fijos en la parte inferior */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 space-y-2">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="
              w-[390px]
              h-[78px] 
              rounded-[100px] 
              bg-black 
              text-white
              text-[18px] 
              font-semibold 
              leading-[22px] 
              font-['Open_Sans']
              mx-auto
              block
            "
          >
            {isLoading ? (
              <ClipLoader size={20} color="#FFFFFF" />
            ) : (
              mode === 'create' ? 'Save' : 'Update'
            )}
          </Button>
          <Button 
            variant="ghost"
            onClick={onClose}
            className="
              w-[390px]
              h-[78px]
              mx-auto
              block
              !text-black 
              !text-[18px] 
              !font-semibold 
              !leading-[22px] 
              !font-['Open_Sans'] 
              !underline
              !decoration-solid
              hover:bg-transparent
              hover:!text-black/80
            "
          >
            Cancel
          </Button>
        </div>
      </div>
    </ModalPortal>
  )
}