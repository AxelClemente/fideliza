'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Trash2 } from 'lucide-react'
import Image from "next/image"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import type { Offer } from '../../types/types'
import { ModalPortal } from "../../components/modal-portal"

interface MobileAddSpecialOfferProps {
  isOpen: boolean
  onClose: () => void
  places: Array<{ id: string, name: string }>
  mode?: 'create' | 'edit'
  initialData?: Offer
}

export function MobileAddSpecialOffer({ 
  isOpen, 
  onClose, 
  places, 
  mode = 'create', 
  initialData 
}: MobileAddSpecialOfferProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined
  )
  const [finishDate, setFinishDate] = useState<Date | undefined>(
    initialData?.finishDate ? new Date(initialData.finishDate) : undefined
  )
  const [selectedPlace, setSelectedPlace] = useState(initialData?.placeId || '')
  const [website, setWebsite] = useState(initialData?.website || '')
  const [photos, setPhotos] = useState<string[]>(initialData?.images.map(img => img.url) || [])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isFinishDateOpen, setIsFinishDateOpen] = useState(false)

  if (!isOpen) return null

  console.log('Start Date:', startDate)
  console.log('Finish Date:', finishDate)
  console.log('Selected Place:', selectedPlace)
  console.log('Available Places:', places)

  const handlePlaceSelect = (value: string) => {
    console.log('Place Selected:', value)
    setSelectedPlace(value)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const MAX_FILE_SIZE = 10 * 1024 * 1024
    const MAX_FILES = 5
    
    if (files.length > MAX_FILES) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `You can only upload up to ${MAX_FILES} images at once.`,
      })
      return
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 10MB per image.`,
        })
        return
      }
    }

    try {
      setIsUploadingImages(true)
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Failed to upload image')
        const data = await response.json()
        return data.secure_url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setPhotos(prev => [...prev, ...uploadedUrls])
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload images. Please try again.",
      })
    } finally {
      setIsUploadingImages(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      if (!title.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Title is required",
        })
        return
      }

      if (!description.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Description is required",
        })
        return
      }

      if (!startDate || !finishDate) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Start and finish dates are required",
        })
        return
      }

      if (!selectedPlace) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a place",
        })
        return
      }

      const endpoint = mode === 'create' 
        ? '/api/special-offers' 
        : `/api/special-offers?id=${initialData?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startDate,
          finishDate,
          placeId: selectedPlace,
          website,
          images: photos
        })
      })

      if (!response.ok) throw new Error(`Failed to ${mode} offer`)

      toast({
        title: "Success",
        description: `Offer ${mode === 'create' ? 'created' : 'updated'} successfully`,
      })

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${mode} offer. Please try again.`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex-1 p-4 relative">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="!text-[22px] !font-bold !leading-[26px] !font-['Open_Sans']">
                {mode === 'create' ? 'Add special offer' : 'Edit special offer'}
              </h2>
              <button onClick={onClose} className="text-2xl">&times;</button>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="
                  bg-gray-50 
                  border-none 
                  w-[359px] 
                  h-[78px] 
                  rounded-[100px]
                  mx-auto
                  pl-6
                "
                placeholder="Offer title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="
                  bg-gray-50 
                  border-none 
                  w-[359px] 
                  min-h-[78px] 
                  rounded-[100px]
                  mx-auto
                  pl-6
                "
                placeholder="Offer description"
              />
            </div>

            {/* Date Selectors */}
            <div className="space-y-4">
              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="
                        w-[359px]
                        h-[78px]
                        rounded-[100px]
                        bg-gray-50
                        border-none
                        justify-start
                        text-left
                        font-normal
                        pl-6
                      "
                      onClick={() => console.log('Start Date Trigger Clicked')}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date)
                        setIsStartDateOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Finish Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Finish Date
                </label>
                <Popover open={isFinishDateOpen} onOpenChange={setIsFinishDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="
                        w-[359px]
                        h-[78px]
                        rounded-[100px]
                        bg-gray-50
                        border-none
                        justify-start
                        text-left
                        font-normal
                        pl-6
                      "
                      onClick={() => console.log('Finish Date Trigger Clicked')}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {finishDate ? format(finishDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <Calendar
                      mode="single"
                      selected={finishDate}
                      onSelect={(date) => {
                        setFinishDate(date)
                        setIsFinishDateOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Place Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Place
              </label>
              <Select 
                value={selectedPlace} 
                onValueChange={handlePlaceSelect}
              >
                <SelectTrigger className="w-[359px] h-[78px] rounded-[100px] bg-gray-50 border-none pl-6">
                  <SelectValue placeholder="Select a place" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {places.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="
                  bg-gray-50 
                  border-none 
                  w-[359px] 
                  h-[78px] 
                  rounded-[100px]
                  mx-auto
                  pl-12
                "
                placeholder="http://example.com"
              />
            </div>

            {/* Photos Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label 
                  htmlFor="fileInput" 
                  className="block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[26px] text-black cursor-pointer hover:opacity-80"
                >
                  Photos +
                </label>
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <div>
                {photos.length === 0 ? (
                  <div className="
                    w-[359px] 
                    h-[78px] 
                    bg-gray-50 
                    rounded-[100px]
                    mx-auto
                    flex 
                    items-center 
                    justify-center
                  ">
                    {isUploadingImages ? (
                      <ClipLoader size={20} color="#7B7B7B" />
                    ) : (
                      <p className="text-[#7B7B7B] text-sm">
                        Upload your offer photos here
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative flex-shrink-0 w-[80px] h-[80px]">
                        <Image
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <button 
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
                        >
                          <Trash2 className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2 mt-8">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="
                w-[359px]
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
                w-[359px]
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
      </div>
    </ModalPortal>
  )
}