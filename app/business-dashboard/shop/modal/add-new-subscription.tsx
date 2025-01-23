'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import { Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface AddSubscriptionModalProps {
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
    visitsPerMonth?: number
  }
}

export function AddSubscriptionModal({ 
  isOpen, 
  onClose, 
  places,
  mode = 'create',
  initialData 
}: AddSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [benefits, setBenefits] = useState(initialData?.benefits || '')
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>(
    initialData?.placeId ? [initialData.placeId] : []
  )
  const [website, setWebsite] = useState(initialData?.website || '')
  const [openCommand, setOpenCommand] = useState(false)
  const [visitsPerMonth, setVisitsPerMonth] = useState(
    initialData?.visitsPerMonth?.toString() || ''
  )

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      console.log('Starting submission...', { mode, initialData })

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
        ...(website && { website: website.trim() }),
        visitsPerMonth: Number(visitsPerMonth)
      }

      console.log('Sending request:', { endpoint, method, payload })

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${mode} subscription`)
      }

      const data = await response.json()
      console.log('Success response:', data)

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

  // Aseguramos que places sea único por ID
  const uniquePlaces = Array.from(
    new Map(places.map(place => [place.id, place])).values()
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="
        max-w-[706px] 
        p-0 
        overflow-hidden 
        md:!fixed 
        md:!left-auto 
        md:!right-[calc((100vw-1440px)/2)] 
        md:!bottom-0 
        md:!top-0 
        md:!translate-x-0 
        md:!translate-y-0 
        md:!rounded-none 
        md:!h-screen
        max-md:!fixed
        max-md:!inset-0
        max-md:!w-[100vw]
        max-md:!max-w-[100vw]
        max-md:!h-[100dvh]
        max-md:!m-0
        max-md:!p-0
        max-md:!rounded-none
        max-md:!translate-x-0
        max-md:!translate-y-0
        flex
        flex-col
      ">
        <DialogHeader className="p-4 pb-0 max-md:mt-6 flex-shrink-0">
          <DialogTitle className="
            text-[22px]
            md:text-[26px]
            font-bold 
            leading-[30px] 
            font-['Open_Sans'] 
            px-4
            md:px-8 
            mt-6
            md:mt-8
          ">
            {mode === 'create' ? 'Add new Subscription' : 'Edit Subscription'}
          </DialogTitle>
        </DialogHeader>

        {/* Contenedor con scroll */}
        <div className="flex-1 overflow-y-auto max-md:pb-[120px]">
          <div className="p-4 space-y-4">
            {/* Nombre de la Suscripción */}
            <div className="space-y-3 px-8 max-md:px-0">
              <div className="relative">
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="
                    bg-main-gray 
                    pl-14 
                    rounded-[100px]
                    border-0
                    text-third-gray
                    md:w-[558px]
                    md:h-[78px]
                    max-md:w-[390px]
                    max-md:h-[78px]
                    max-md:mx-auto
                  " 
                  placeholder="Subscription name"
                />
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B]"
                >
                  <path 
                    d="M3.7125 1.6875C3.82986 1.55029 3.97555 1.44014 4.13954 1.36461C4.30354 1.28909 4.48195 1.24999 4.6625 1.25H15.3375C15.5181 1.24999 15.6965 1.28909 15.8605 1.36461C16.0245 1.44014 16.1701 1.55029 16.2875 1.6875L19.5487 5.4925C19.8399 5.83229 20 6.26502 20 6.7125V7.03125C20.0001 7.64997 19.8068 8.25325 19.4473 8.75678C19.0877 9.2603 18.5798 9.63891 17.9946 9.83968C17.4094 10.0405 16.776 10.0534 16.1831 9.87659C15.5901 9.69982 15.0673 9.34221 14.6875 8.85375C14.4102 9.21103 14.0549 9.50009 13.6486 9.69878C13.2423 9.89747 12.796 10.0005 12.3438 10C11.8915 10.0005 11.4452 9.89747 11.0389 9.69878C10.6326 9.50009 10.2773 9.21103 10 8.85375C9.72274 9.21103 9.36736 9.50009 8.9611 9.69878C8.55485 9.89747 8.10849 10.0005 7.65625 10C7.20401 10.0005 6.75765 9.89747 6.3514 9.69878C5.94514 9.50009 5.58976 9.21103 5.3125 8.85375C4.93274 9.34221 4.40985 9.69982 3.81692 9.87659C3.22399 10.0534 2.59065 10.0405 2.00541 9.83968C1.42017 9.63891 0.912278 9.2603 0.552728 8.75678C0.193177 8.25325 -6.82482e-05 7.64997 1.80807e-08 7.03125V6.7125C1.57594e-05 6.26502 0.160071 5.83229 0.45125 5.4925L3.7125 1.6875ZM5.9375 7.03125C5.9375 7.48709 6.11858 7.92426 6.44091 8.24659C6.76324 8.56892 7.20041 8.75 7.65625 8.75C8.11209 8.75 8.54926 8.56892 8.87159 8.24659C9.19392 7.92426 9.375 7.48709 9.375 7.03125C9.375 6.86549 9.44085 6.70652 9.55806 6.58931C9.67527 6.4721 9.83424 6.40625 10 6.40625C10.1658 6.40625 10.3247 6.4721 10.4419 6.58931C10.5592 6.70652 10.625 6.86549 10.625 7.03125C10.625 7.48709 10.8061 7.92426 11.1284 8.24659C11.4507 8.56892 11.8879 8.75 12.3438 8.75C12.7996 8.75 13.2368 8.56892 13.5591 8.24659C13.8814 7.92426 14.0625 7.48709 14.0625 7.03125C14.0625 6.86549 14.1283 6.70652 14.2456 6.58931C14.3628 6.4721 14.5217 6.40625 14.6875 6.40625C14.8533 6.40625 15.0122 6.4721 15.1294 6.58931C15.2467 6.70652 15.3125 6.86549 15.3125 7.03125C15.3125 7.48709 15.4936 7.92426 15.8159 8.24659C16.1382 8.56892 16.5754 8.75 17.0312 8.75C17.4871 8.75 17.9243 8.56892 18.2466 8.24659C18.5689 7.92426 18.75 7.48709 18.75 7.03125V6.7125C18.75 6.56353 18.6968 6.41946 18.6 6.30625L15.3375 2.5H4.6625L1.4 6.30625C1.30318 6.41946 1.24999 6.56353 1.25 6.7125V7.03125C1.25 7.48709 1.43108 7.92426 1.75341 8.24659C2.07574 8.56892 2.51291 8.75 2.96875 8.75C3.42459 8.75 3.86176 8.56892 4.18409 8.24659C4.50642 7.92426 4.6875 7.48709 4.6875 7.03125C4.6875 6.86549 4.75335 6.70652 4.87056 6.58931C4.98777 6.4721 5.14674 6.40625 5.3125 6.40625C5.47826 6.40625 5.63723 6.4721 5.75444 6.58931C5.87165 6.70652 5.9375 6.86549 5.9375 7.03125ZM1.875 10.625C2.04076 10.625 2.19973 10.6908 2.31694 10.8081C2.43415 10.9253 2.5 11.0842 2.5 11.25V18.75H17.5V11.25C17.5 11.0842 17.5658 10.9253 17.6831 10.8081C17.8003 10.6908 17.9592 10.625 18.125 10.625C18.2908 10.625 18.4497 10.6908 18.5669 10.8081C18.6842 10.9253 18.75 11.0842 18.75 11.25V18.75H19.375C19.5408 18.75 19.6997 18.8158 19.8169 18.9331C19.9342 19.0503 20 19.2092 20 19.375C20 19.5408 19.9342 19.6997 19.8169 19.8169C19.6997 19.9342 19.5408 20 19.375 20H0.625C0.45924 20 0.300269 19.9342 0.183058 19.8169C0.0658481 19.6997 1.80807e-08 19.5408 1.80807e-08 19.375C1.80807e-08 19.2092 0.0658481 19.0503 0.183058 18.9331C0.300269 18.8158 0.45924 18.75 0.625 18.75H1.25V11.25C1.25 11.0842 1.31585 10.9253 1.43306 10.8081C1.55027 10.6908 1.70924 10.625 1.875 10.625ZM4.375 11.25C4.54076 11.25 4.69973 11.3158 4.81694 11.4331C4.93415 11.5503 5 11.7092 5 11.875V16.25H15V11.875C15 11.7092 15.0658 11.5503 15.1831 11.4331C15.3003 11.3158 15.4592 11.25 15.625 11.25C15.7908 11.25 15.9497 11.3158 16.0669 11.4331C16.1842 11.5503 16.25 11.7092 16.25 11.875V16.25C16.25 16.5815 16.1183 16.8995 15.8839 17.1339C15.6495 17.3683 15.3315 17.5 15 17.5H5C4.66848 17.5 4.35054 17.3683 4.11612 17.1339C3.8817 16.8995 3.75 16.5815 3.75 16.25V11.875C3.75 11.7092 3.81585 11.5503 3.93306 11.4331C4.05027 11.3158 4.20924 11.25 4.375 11.25Z" 
                    fill="#7B7B7B"
                  />
                </svg>
              </div>

              {/* Purchase benefit */}
              <div>
                <label className="pt-3 pl-6 block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1 max-md:pl-4">
                  Purchase benefit
                </label>
                <Textarea 
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="
                    bg-main-gray 
                    rounded-2xl 
                    border-0 
                    resize-none 
                    text-third-gray
                    pl-6
                    md:w-[558px]
                    md:h-[126px]
                    max-md:w-[390px]
                    max-md:h-[78px]
                    max-md:mx-auto
                  "
                  placeholder="Benefits"
                />
              </div>

              {/* Price Section */}
              <div>
                <label className="pt-3 pl-6 block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1 max-md:pl-4">
                  Price
                </label>
                <div className="
                  flex 
                  flex-col
                  md:flex-row 
                  gap-3
                  md:gap-1
                  max-md:px-0
                  md:px-6
                ">
                  {/* Price Input */}
                  <Input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="
                      bg-main-gray 
                      border-0 
                      text-center 
                      text-third-gray
                      md:w-[180px]
                      md:h-[78px]
                      md:rounded-[100px]
                      md:bg-[#F6F6F6]
                      max-md:w-[390px]
                      max-md:h-[78px]
                      max-md:rounded-[100px]
                      max-md:mx-auto
                    " 
                    placeholder="2"
                  />
                  
                  {/* Currency */}
                  <Input 
                    type="text"
                    value="€"
                    readOnly
                    className="
                      bg-main-gray 
                      border-0 
                      text-center 
                      text-[#7B7B7B]
                      md:flex-1
                      md:basis-1/3
                      md:w-[180px]
                      md:h-[78px]
                      md:rounded-[100px]
                      md:bg-[#F6F6F6]
                      max-md:w-[390px]
                      max-md:h-[78px]
                      max-md:rounded-[100px]
                      max-md:mx-auto
                    "
                  />
                  
                  {/* Period */}
                  <Input 
                    type="text"
                    value="Month"
                    readOnly
                    className="
                      bg-main-gray 
                      border-0 
                      text-center 
                      text-[#7B7B7B]
                      md:flex-1
                      md:basis-1/3
                      md:w-[180px]
                      md:h-[78px]
                      md:rounded-[100px]
                      md:bg-[#F6F6F6]
                      max-md:w-[390px]
                      max-md:h-[78px]
                      max-md:rounded-[100px]
                      max-md:mx-auto
                    "
                  />
                </div>
              </div>

              {/* Visits per month section */}
              <div>
                <label className="pt-3 pl-6 block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1">
                  Visits per month
                </label>
                <Input 
                  type="number"
                  value={visitsPerMonth}
                  onChange={(e) => setVisitsPerMonth(e.target.value)}
                  className="
                    bg-main-gray 
                    border-0 
                    text-center 
                    text-third-gray
                    md:w-[558px]
                    md:h-[78px]
                    md:rounded-[100px]
                    max-md:w-[390px]
                    max-md:h-[78px]
                    max-md:rounded-[100px]
                    max-md:mx-auto
                  " 
                  placeholder="5"
                />
              </div>

              {/* Where to use - Nueva implementación */}
              <div>
                <label className="pt-3 pl-6 block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1 max-md:pl-4">
                  Where to use
                </label>
                <Popover open={openCommand} onOpenChange={setOpenCommand}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCommand}
                      className="
                        pl-8 
                        w-full 
                        bg-main-gray 
                        border-0 
                        rounded-2xl 
                        justify-between
                        text-third-gray
                        md:w-[558px]
                        md:h-[78px]
                        md:rounded-[100px]
                        md:bg-[#F6F6F6]
                        md:mx-0
                        max-md:w-[390px]
                        max-md:h-[78px]
                        max-md:rounded-[100px]
                        max-md:text-[18px]
                        max-md:font-['Open_Sans']
                        max-md:font-semibold
                        max-md:leading-[22px]
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
                  <PopoverContent className="w-full p-0">
                    <div className="max-h-[300px] overflow-auto p-2">
                      {uniquePlaces.map((place) => (
                        <div
                          key={`place-option-${place.id}`}
                          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => {
                            setSelectedPlaces(current => {
                              const isSelected = current.includes(place.id)
                              return isSelected 
                                ? current.filter(id => id !== place.id)
                                : [...current, place.id]
                            })
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
                
                {/* Selected places tags */}
                {selectedPlaces.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 pl-6">
                    {selectedPlaces.map((placeId) => {
                      const place = uniquePlaces.find(p => p.id === placeId)
                      if (!place) return null
                      return (
                        <div
                          key={`selected-tag-${placeId}`}
                          className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          <span>{place.name}</span>
                          <button
                            onClick={() => setSelectedPlaces(current => 
                              current.filter(id => id !== placeId)
                            )}
                            className="hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Website */}
              <div className="relative">
                <Input 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="
                    bg-main-gray 
                    border-0 
                    text-third-gray
                    pl-14
                    md:w-[558px]
                    md:h-[78px]
                    md:rounded-[100px]
                    md:bg-[#F6F6F6]
                    max-md:w-[390px]
                    max-md:h-[78px]
                    max-md:rounded-[100px]
                  " 
                  placeholder="http://example.com"
                />
                <svg
                  className="left-8 absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="
          p-3 
          flex 
          flex-col 
          items-center 
          bg-white           
          sticky            
          bottom-0          
          left-0            
          right-0           
          z-10
          flex-shrink-0    
        ">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="
              w-full
              h-[78px]
              rounded-[100px]
              bg-black 
              text-white 
              text-[18px]
              font-['Open_Sans']
              font-semibold
              leading-[22px]
              md:w-[558px]
              md:mx-auto
            "
          >
            {isLoading ? <ClipLoader size={20} color="#FFFFFF" /> : mode === 'create' ? 'Save' : 'Update'}
          </Button>
          <Button 
            variant="ghost"
            onClick={onClose}
            className="
              w-full
              h-[50px]
              !p-0
              !text-black 
              !text-[18px]
              !font-semibold 
              !leading-[22px]
              !font-['Open_Sans'] 
              !underline
              !decoration-solid
              hover:bg-transparent
              hover:!text-black/80
              md:w-[558px]
              md:mx-auto
            "
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}