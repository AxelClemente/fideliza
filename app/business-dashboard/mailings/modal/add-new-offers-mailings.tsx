'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mailing, Restaurant } from "../../shop/types/types"

interface AddNewOffersMailingsModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'edit'
  initialData?: Mailing
  restaurants: Restaurant[]
}

// Definimos las clases del placeholder como una constante para reutilizar
const placeholderStyles = `
  placeholder:text-[18px]
  placeholder:font-['Open_Sans']
  placeholder:font-semibold
  placeholder:leading-[22px]
  placeholder:text-[#7B7B7B]
`

export function AddNewOffersMailingsModal({ 
  isOpen, 
  onClose, 
  mode = 'add',
  initialData,
  restaurants 
}: AddNewOffersMailingsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '')
  const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '')
  const [time, setTime] = useState(initialData?.time || '')
  const [location, setLocation] = useState(initialData?.location || '')

  const places = restaurants.flatMap(restaurant => 
    restaurant.places.map(place => ({
      id: place.id,
      name: `${place.name} - ${restaurant.title}`
    }))
  )

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      const url = mode === 'edit' ? `/api/mailing?id=${initialData?.id}` : '/api/mailing'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      if (!name.trim() || !description.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Name and description are required",
        })
        return
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialData?.id,
          name,
          description,
          startDate,
          endDate,
          time,
          location
        })
      })

      if (!response.ok) throw new Error('Failed to create mailing')

      toast({
        title: "Success",
        description: "Mailing created successfully",
      })

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create mailing. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
        max-md:!h-screen 
        max-md:!m-0 
        max-md:!p-0 
        max-md:!rounded-none 
        max-md:!translate-x-0 
        max-md:!translate-y-0
      ">
        <div className="flex flex-col h-full bg-white">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="
              !text-[26px]
              font-bold 
              leading-[30px] 
              font-['Open_Sans'] 
              px-4
              md:px-8 
              mt-2
              md:mt-0
            ">
              Add new offers mailings
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pb-[200px]">
            <div className="p-4 space-y-4">
              <div className="
                space-y-3 
                flex
                flex-col
                items-center     {/* Centrar en móvil */}
                md:items-center  {/* Mantener centrado en desktop */}
                md:px-8
              ">
                {/* Name Input */}
                <div>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`
                      bg-[#F6F6F6] 
                      pl-8 
                      w-[390px]
                      h-[78px] 
                      rounded-[100px] 
                      border-0
                      md:w-[558px]
                      ${placeholderStyles}
                    `}
                    placeholder="Name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1 pl-6">
                    Description
                  </label>
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`
                      bg-[#F6F6F6] 
                      w-[390px]
                      h-[132px] 
                      rounded-[20px] 
                      border-0
                      
                      md:w-[558px]
                      pt-7
                      pl-8 
                      ${placeholderStyles}
                    `}
                    placeholder="Describe your mailing..."
                  />
                </div>

                {/* Container for date and time inputs */}
                <div className="flex flex-col gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] pl-6 mb-1">
                      Start date
                    </label>
                    <div className="relative">
                      <Input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`
                          bg-[#F6F6F6] 
                          w-[390px]
                          h-[78px] 
                          rounded-[100px] 
                          border-0 
                          text-gray-500
                          md:w-[558px]
                          pl-8 
                          ${placeholderStyles}
                          [&::-webkit-calendar-picker-indicator]:opacity-0
                        `}
                      />
                      <svg 
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none md:hidden" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          fill="none" 
                          stroke="currentColor" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="m6 9 6 6 6-6"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] pl-6 mb-1">
                      End date
                    </label>
                    <div className="relative">
                      <Input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`
                          bg-[#F6F6F6] 
                          w-[390px]
                          h-[78px] 
                          rounded-[100px] 
                          border-0 
                          text-gray-500
                          md:w-[558px]
                          pl-8 
                          ${placeholderStyles}
                          [&::-webkit-calendar-picker-indicator]:opacity-0
                        `}
                      />
                      <svg 
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none md:hidden" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          fill="none" 
                          stroke="currentColor" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="m6 9 6 6 6-6"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex-1">
                    <label className="block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] pl-6 mb-1">
                      Time
                    </label>
                    <Input 
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="
                        bg-[#F6F6F6] 
                        w-[390px]
                        h-[78px] 
                        rounded-[100px] 
                        border-0 
                        text-[18px]
                        font-['Open_Sans']
                        font-semibold
                        text-[#7B7B7B]
                        pl-8
                       
                        md:w-[558px]
                        [&::-webkit-calendar-picker-indicator]:hidden
                      "
                    />
                  </div>
                </div>

                {/* The audience section */}
                <div className="space-y-3">
                  <h3 className="!text-[16px] font-bold leading-[20px] font-['Open_Sans'] pt-2 pl-6">
                    The audience
                  </h3>

                  {/* Location */}
                  <Select onValueChange={setLocation}>
                    <SelectTrigger className={`
                      bg-[#F6F6F6] 
                      w-[390px]
                      h-[78px] 
                      rounded-[100px]  
                      border-0 
                      !text-third-gray
                      
                      md:w-[558px]
                      pl-8
                      ${placeholderStyles}
                    `}>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {places.map(place => (
                        <SelectItem key={place.id} value={place.id}>
                          {place.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="
            fixed
            bottom-0
            left-0
            right-0
            p-4 
            space-y-3 
            bg-white
            px-4          
            md:px-14
            z-10
            pb-6
          ">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="
                w-[390px]
                h-[78px] 
                rounded-[100px] 
                bg-black 
                text-white 
                text-[16px] 
                font-semibold 
                leading-[20px] 
                font-['Open_Sans']
                mx-auto
                block
                md:w-[558px]
              "
            >
              {isLoading ? <ClipLoader size={20} color="#FFFFFF" /> : mode === 'edit' ? 'Update' : 'Save'}
            </Button>

            <Button 
              variant="ghost"
              onClick={onClose}
              className="
                w-[390px]        
                h-[60px] 
                !text-black 
                !text-[18px] 
                !font-semibold 
                !underline 
                hover:bg-transparent 
                mx-auto          
                block            
                md:w-[558px]     
                mb-4             
                md:mb-0          
              "
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}