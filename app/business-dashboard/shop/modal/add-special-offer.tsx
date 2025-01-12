'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Trash2, ChevronDown } from 'lucide-react'
import Image from "next/image"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import type { Offer } from '../types/types'

interface AddSpecialOfferModalProps {
  isOpen: boolean
  onClose: () => void
  places: Array<{ id: string, name: string }>
  mode?: 'create' | 'edit'
  initialData?: Offer
}

export function AddSpecialOfferModal({ isOpen, onClose, places, mode = 'create', initialData }: AddSpecialOfferModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [startDate, setStartDate] = useState<Date | undefined>(initialData?.startDate ? new Date(initialData.startDate) : undefined)
  const [finishDate, setFinishDate] = useState<Date | undefined>(initialData?.finishDate ? new Date(initialData.finishDate) : undefined)
  const [selectedPlace, setSelectedPlace] = useState(initialData?.placeId || '')
  const [website, setWebsite] = useState(initialData?.website || '')
  const [photos, setPhotos] = useState<string[]>(initialData?.images.map(img => img.url) || [])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isFinishDateOpen, setIsFinishDateOpen] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Validación de tamaño
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB en bytes
    const MAX_FILES = 5 // Máximo número de archivos permitidos
    
    // Validar número de archivos
    if (files.length > MAX_FILES) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `You can only upload up to ${MAX_FILES} images at once.`,
      })
      return
    }

    // Validar tamaño de archivos
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

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

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

      // Validaciones básicas
      if (!title.trim() || !description.trim() || !startDate || !finishDate || !selectedPlace) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
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
          ...(mode === 'edit' && { id: initialData?.id }),
          title,
          description,
          startDate,
          finishDate,
          placeId: selectedPlace,
          website,
          images: photos
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${mode} offer`)
      }

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
        description: error instanceof Error ? error.message : `Failed to ${mode} offer`,
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
          overflow-y-auto     
          !fixed 
          !left-0
          !right-0
          !bottom-0 
          !top-0 
          !translate-x-0
          !translate-y-0 
          !rounded-none
          !h-[100dvh]        // Cambiar h-screen por h-[100dvh] para mejor soporte móvil
          flex               
          flex-col          
          md:!left-auto
          md:!right-[calc((100vw-1440px)/2)]
        "
      >
        <DialogHeader className="p-4 pb-0 mt-6 md:mt-8">
          <DialogTitle className="
            !text-[26px] 
            !font-bold 
            !leading-[30px] 
            !font-['Open_Sans'] 
            px-8 
            -mt-1
            w-[340px]          
            mx-auto            
            mr-[250px]         
            md:w-full          
            md:mx-0
            max-md:ml-8 
          ">
            Add new Special Offer
          </DialogTitle>
        </DialogHeader>

        {/* Contenedor scrolleable manteniendo alineación */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="space-y-3 px-8">
              {/* Title */}
              <div className="relative">
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="
                    bg-main-gray 
                    pl-8 
                    h-10 
                    w-full
                    rounded-2xl
                    border-0
                    md:w-[558px]      // <- Ancho fijo en desktop
                    md:h-[78px]       // <- Altura en desktop
                    md:rounded-[100px] // <- Radio en desktop
                    text-third-gray
                    max-md:h-[78px]          // <- Solo afecta móvil
                    max-md:rounded-[100px]   // <- Solo afecta móvil
                    max-md:text-[18px]          // <- Tamaño de fuente en móvil
                    max-md:font-['Open_Sans']   // <- Fuente en móvil
                    max-md:font-semibold       // <- Peso 600 en móvil
                    max-md:leading-[22px]      // <- Line height en móvil
                    max-md:w-[390px]          // <- Solo añadir esto para móvil
                    max-md:-ml-6            
                  "
                  placeholder="Title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="px-6 block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1">
                  Description
                </label>
                <Textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="
                    max-md:h-[78px]          // <- Solo afecta móvil
                    max-md:rounded-[100px]   // <- Solo afecta móvil
                    bg-main-gray 
                    pl-8 
                    h-10 
                    w-full
                    rounded-2xl 
                    border-0
                    md:w-[558px]      // <- Ancho fijo en desktop
                    md:h-[78px]       // <- Altura en desktop
                    md:rounded-[100px] // <- Radio en desktop
                    text-third-gray   // <- Color del texto
                    resize-none       // <- Prevenir resize
                    max-md:text-[18px]          // <- Tamaño de fuente en móvil
                    max-md:font-['Open_Sans']   // <- Fuente en móvil
                    max-md:font-semibold       // <- Peso 600 en móvil
                    max-md:leading-[22px]      // <- Line height en móvil
                    max-md:w-[390px]          // <- Solo añadir esto para móvil
                    max-md:-ml-6            
                  "
                  placeholder="Describe your special offer..."
                />
              </div>

              {/* Date Range Container */}
              <div className="space-y-4">
                {/* Start Date */}
                <div>
                  <label className="px-6 block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1">
                    Start date
                  </label>
                  <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="
                          max-md:h-[78px]          // <- Solo afecta móvil
                          max-md:rounded-[100px]   // <- Solo afecta móvil
                          w-full
                          bg-main-gray 
                          border-0 
                          rounded-2xl 
                          justify-start 
                          text-left 
                          font-normal 
                          pl-8
                          h-10
                          md:w-[558px]      // <- Ancho fijo en desktop
                          md:h-[78px]       // <- Altura en desktop
                          md:rounded-[100px] // <- Radio en desktop
                          text-third-gray    // <- Color del texto
                          max-md:text-[18px]          // <- Tamaño de fuente en móvil
                          max-md:font-['Open_Sans']   // <- Fuente en móvil
                          max-md:font-semibold       // <- Peso 600 en móvil
                          max-md:leading-[22px]      // <- Line height en móvil
                          max-md:w-[390px]          // <- Solo añadir esto para móvil
                          max-md:-ml-6            
                        "
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
                <div>
                  <label className=" px-6 block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1 ">
                    Finish date
                  </label>
                  <Popover open={isFinishDateOpen} onOpenChange={setIsFinishDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="
                          w-full
                          bg-main-gray 
                          border-0 
                          rounded-2xl 
                          justify-start 
                          text-left 
                          font-normal 
                          pl-8
                          h-10
                          md:w-[558px]      // <- Ancho fijo en desktop
                          md:h-[78px]       // <- Altura en desktop
                          md:rounded-[100px] // <- Radio en desktop
                          text-third-gray    // <- Color del texto
                          max-md:h-[78px]          // <- Solo afecta móvil
                          max-md:rounded-[100px]   // <- Solo afecta móvil
                          max-md:text-[18px]          // <- Tamaño de fuente en móvil
                          max-md:font-['Open_Sans']   // <- Fuente en móvil
                          max-md:font-semibold       // <- Peso 600 en móvil
                          max-md:leading-[22px]      // <- Line height en móvil
                          max-md:w-[390px]          // <- Solo añadir esto para móvil
                          max-md:-ml-6            
                        "
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {finishDate ? format(finishDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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

              {/* Where to use */}
              <div>
                <label className="px-6 block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1">
                  Where to use
                </label>
                <Select onValueChange={setSelectedPlace} value={selectedPlace}>
                  <SelectTrigger className="
                    relative    
                    pl-8 
                    w-full 
                    bg-main-gray 
                    border-0 
                    rounded-2xl
                    h-10
                    md:w-[558px]      
                    md:h-[78px]       
                    md:rounded-[100px] 
                    text-third-gray    
                    max-md:h-[78px]          
                    max-md:rounded-[100px]   
                    max-md:text-[18px]          // <- Tamaño de fuente en móvil
                    max-md:font-['Open_Sans']   // <- Fuente en móvil
                    max-md:font-semibold       // <- Peso 600 en móvil
                    max-md:leading-[22px]      // <- Line height en móvil
                    max-md:w-[390px]          // <- Solo añadir esto para móvil
                    max-md:-ml-6            
                  ">
                    <SelectValue placeholder="Select places" />
                    <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-third-gray" />
                  </SelectTrigger>
                  <SelectContent>
                    {places.map((place) => (
                      <SelectItem key={place.id} value={place.id}>
                        {place.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Website */}
              <div className="relative">
                <Input 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="
                    bg-main-gray 
                    pl-16 
                    h-10 
                    w-full
                    rounded-2xl
                    border-0
                    md:w-[558px]      // <- Ancho fijo en desktop
                    md:h-[78px]       // <- Altura en desktop
                    md:rounded-[100px] // <- Radio en desktop
                    text-third-gray
                    max-md:h-[78px]          // <- Solo afecta móvil
                    max-md:rounded-[100px]   // <- Solo afecta móvil
                    max-md:text-[18px]          // <- Tamaño de fuente en móvil
                    max-md:font-['Open_Sans']   // <- Fuente en móvil
                    max-md:font-semibold       // <- Peso 600 en móvil
                    max-md:leading-[22px]      // <- Line height en móvil
                    max-md:w-[390px]          // <- Solo añadir esto para móvil
                    max-md:-ml-6            
                  "
                  placeholder="http//:example.com"
                />
                <svg
                  className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B]"
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

            {/* Photos */}
            <div>
              <div className="flex items-center justify-between mb-1 px-8">
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
              
              {/* Preview area */}
              <div className="px-8">
                {photos.length === 0 ? (
                  <div className="w-full h-[60px] bg-main-gray rounded-2xl flex items-center justify-center">
                    {isUploadingImages ? (
                      <ClipLoader size={20} color="#7B7B7B" />
                    ) : (
                      <p className="text-[#7B7B7B] text-sm">
                        Upload your offer photos here
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-4 relative">
                    {isUploadingImages && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                        <ClipLoader size={20} color="#000000" />
                      </div>
                    )}
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group w-[80px] h-[80px]">
                        <Image
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover w-full h-full"
                        />
                        <button 
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full z-10"
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
        </div>

        {/* Contenedor de botones */}
        <div className="
          p-3 
          md:p-4 
          px-8 
          md:px-14 
          space-y-2 
          md:space-y-3 
          flex-shrink-0      
          bg-white           
          sticky            // Añadir sticky
          bottom-0          // Fijar al fondo
          left-0            // Asegurar posición
          right-0           // Asegurar posición
          z-10             // Asegurar que esté por encima del contenido
        ">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="
              max-md:w-[390px]         
              max-md:-ml-4            
              w-[340px]
              h-[78px]
              rounded-[100px]
              mx-auto
              mr-[250px]
              md:mr-0
              md:w-[558px]
              md:mx-auto
              bg-black 
              text-white 
              text-[16px] 
              font-semibold 
              leading-[20px] 
              font-['Open_Sans']
              max-md:text-[18px]          // <- Tamaño de fuente en móvil
              max-md:font-['Open_Sans']   // <- Fuente en móvil
              max-md:font-semibold       // <- Peso 600 en móvil
              max-md:leading-[22px]      // <- Line height en móvil
            "
          >
            {isLoading ? <ClipLoader size={20} color="#FFFFFF" /> : mode === 'create' ? 'Save' : 'Update'}
          </Button>
          <Button 
            variant="ghost"
            onClick={onClose}
            className="
              w-[340px]
              mx-auto
              mr-[250px]
              md:mr-0
              md:w-[558px]
              md:mx-auto
              h-[50px]
              !p-0
              !text-black 
              !text-[16px]
              !font-semibold 
              !leading-[20px]
              !font-['Open_Sans'] 
              !underline
              !decoration-solid
              hover:bg-transparent
              hover:!text-black/80
              max-md:text-[18px]          // <- Tamaño de fuente en móvil
              max-md:font-['Open_Sans']   // <- Fuente en móvil
              max-md:font-semibold       // <- Peso 600 en móvil
              max-md:leading-[22px]      // <- Line height en móvil
            "
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}