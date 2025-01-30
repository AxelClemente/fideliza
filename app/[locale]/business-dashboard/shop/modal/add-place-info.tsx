'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { ClipLoader } from "react-spinners"

interface AddPlaceInfoModalProps {
  isOpen: boolean
  onClose: () => void
  restaurantId: string
  mode?: 'create' | 'edit'
  initialData?: {
    id: string
    name: string
    location: string
    phoneNumber?: string | null
  }
}

export function AddPlaceInfoModal({ 
  isOpen, 
  onClose, 
  restaurantId,
  mode = 'create',
  initialData 
}: AddPlaceInfoModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '')

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      const endpoint = mode === 'create' 
        ? '/api/places' 
        : `/api/places?id=${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(mode === 'edit' && { id: initialData?.id }),
          name,
          location,
          phoneNumber,
          restaurantId
        })
      })

      if (!response.ok) throw new Error(`Failed to ${mode} place`)

      toast({
        title: "Success",
        description: `Branch ${mode === 'create' ? 'created' : 'updated'} successfully`,
      })

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${mode} branch`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="
          max-w-[706px] 
          p-0 
          overflow-hidden 
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
          md:!right-[calc((100vw-1440px)/2)]
        "
      >
        <DialogHeader className="p-3 md:p-4 pb-0">
          <DialogTitle className="
            !text-[30px]
            md:!text-[30px]
            !font-bold 
            !leading-[34px]
            md:!leading-[34px]
            !font-['Open_Sans']
            px-4 
            md:px-8 
            mt-10
            w-[390px]
            mx-auto
            ml-2
            md:w-full
            md:mx-0
          ">
            {mode === 'create' ? 'Add place info' : 'Edit place info'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
          <div className="
            space-y-3 
            px-4 
            md:px-8
            -mt-14
            md:mt-0
          ">
            <div>
              <label className="block text-[16px] font-[700] leading-[26px] text-black mb-2 pl-8">
                Branch Name
              </label>
              <div className="relative flex justify-center md:block">
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="
                    bg-main-gray 
                    pl-14 
                    h-[78px] 
                    w-[390px]
                    rounded-[100px]
                    border-0
                    mx-auto
                    mr-[250px]
                    md:mx-0
                    md:h-[78px]
                    md:w-[558px]
                    md:rounded-[100px]
                    text-third-gray
                    max-md:text-[18px]
                    max-md:font-['Open_Sans']
                    max-md:font-semibold
                    max-md:leading-[22px]
                  " 
                  placeholder="Branch name"
                />
                <svg
                  className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-[16px] font-[700] leading-[26px] text-black mb-2 pl-8">
                Address
              </label>
              <div className="relative flex justify-center md:block">
                <Input 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="
                    bg-main-gray 
                    pl-14 
                    h-[78px] 
                    w-[390px]
                    rounded-[100px]
                    border-0
                    mx-auto
                    mr-[250px]
                    md:mx-0
                    md:h-[78px]
                    md:w-[558px]
                    md:rounded-[100px]
                    text-third-gray
                    max-md:text-[18px]
                    max-md:font-['Open_Sans']
                    max-md:font-semibold
                    max-md:leading-[22px]
                  " 
                  placeholder="Branch address"
                />
                <svg
                  className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-[16px] font-[700] leading-[26px] text-black mb-2 pl-8">
                Phone Number
              </label>
              <div className="relative flex justify-center md:block">
                <Input 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="
                    bg-main-gray 
                    pl-14 
                    h-[78px] 
                    w-[390px]
                    rounded-[100px]
                    border-0
                    mx-auto
                    mr-[250px]
                    md:mx-0
                    md:h-[78px]
                    md:w-[558px]
                    md:rounded-[100px]
                    text-third-gray
                    max-md:text-[18px]
                    max-md:font-['Open_Sans']
                    max-md:font-semibold
                    max-md:leading-[22px]
                  " 
                  placeholder="Phone number"
                />
                <svg
                  className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="
          p-3 
          md:p-4 
          px-8 
          md:px-14 
          space-y-2 
          md:space-y-3
          mb-6
          md:mb-0
        ">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="
              w-[390px]
              h-[78px]
              rounded-[100px]
              mx-auto
              mr-[250px]
              -ml-3
              md:ml-0
              md:w-[558px]
              md:h-[78px]
              md:mx-0
              bg-black 
              text-[16px] 
              font-semibold 
              leading-[20px] 
              font-['Open_Sans']
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
              w-[340px]
              mx-auto
              mr-[250px]
              md:w-full
              md:mx-0
              h-[50px]
              md:h-[60px]
              !p-0
              !text-black 
              !text-[16px]
              md:!text-[18px] 
              !font-semibold 
              !leading-[20px]
              md:!leading-[22px] 
              !font-['Open_Sans'] 
              !underline
              !decoration-solid
              hover:bg-transparent
              hover:!text-black/80
              ml-3
              md:-ml-3
            "
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}