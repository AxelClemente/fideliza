'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, ChevronDown } from 'lucide-react'
import Image from "next/image"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddMainInfoModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'create' | 'edit'
  initialData?: {
    id: string
    title: string
    description: string
    website?: string | null
    category?: string | null
    subcategory?: string | null
    images?: { url: string }[]
  }
}

export function AddMainInfoModal({ 
  isOpen, 
  onClose, 
  mode = 'create',
  initialData 
}: AddMainInfoModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [website, setWebsite] = useState(initialData?.website || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '')
  const [photos, setPhotos] = useState<string[]>(
    initialData?.images?.map(img => img.url) || []
  )
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // Validaciones básicas
      if (!title.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Restaurant name is required",
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

      if (photos.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "At least one photo is required",
        })
        return
      }

      const endpoint = mode === 'create' ? '/api/restaurant' : `/api/restaurant`
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(mode === 'edit' && { id: initialData?.id }),
          title,
          description,
          website,
          category,
          subcategory,
          images: photos
        })
      })

      if (!response.ok) throw new Error('Failed to save restaurant')

      toast({
        title: "Success",
        description: `Restaurant ${mode === 'create' ? 'created' : 'updated'} successfully`,
      })

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${mode} restaurant. Please try again.`,
      })
    } finally {
      setIsLoading(false)
    }
  }

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
      setIsUploadingImages(true)  // Activar spinner
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
      setIsUploadingImages(false)  // Desactivar spinner
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
        <DialogHeader className="p-3 md:p-4 pb-0 flex-shrink-0">
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
            w-[340px]          
            mx-auto            
            ml-6          // Añadido margen derecho igual que los otros elementos
            md:w-full          
            md:mx-0            
            md:mr-0            // Reset del margen en desktop
          ">
            {mode === 'create' ? 'Add main info' : 'Edit main info'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3 md:p-4 space-y-3 md:space-y-4">
            {/* Nombre del Restaurante */}
            <div className="flex flex-col items-center space-y-4 px-4">
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="
                  bg-main-gray 
                  h-[78px] 
                  w-[390px]          
                  rounded-[100px]
                  border-0
                  mx-auto
                  -ml-4 
                  md:w-[558px]
                  md:mx-0
                  pl-8              // Añadir padding izquierdo
                  text-third-gray   // Cambiar color del texto a gris
                "
                placeholder="Restaurant name"
              />

              {/* Descripción */}
              <div className="flex flex-col items-start">
                <label className="
                  block 
                  !text-[16px] 
                  !font-['Open_Sans'] 
                  !font-bold 
                  !leading-[20px] 
                  text-black 
                  mb-1
                  pl-8
                ">
                  Description
                </label>
                <Textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="
                    bg-main-gray 
                    min-h-[78px] 
                    w-[390px]          
                    rounded-[100px]
                    border-0
                    mx-auto
                    md:w-[558px]
                    md:mx-0
                    md:min-h-[80px]
                    md:rounded-2xl
                    px-8
                    py-6
                    text-third-gray   // Cambiar color del texto a gris
                  "
                  placeholder="Describe your restaurant..."
                  style={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                />
              </div>

              {/* Website */}
              <div className="relative flex justify-center md:block">
                <Input 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="
                    bg-main-gray 
                    pl-14 
                    h-[78px] 
                    w-[390px]          
                    rounded-[100px]
                    border-0
                    mx-auto
                    md:w-[558px]
                    md:mx-0
                    text-third-gray
                    max-md:text-[18px]
                    max-md:font-['Open_Sans']
                    max-md:font-semibold
                    max-md:leading-[22px]
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

            {/* Category */}
            <div className="space-y-2 px-4 md:px-8">
              <label className="block text-[16px] font-bold pl-8">
                Category of business
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="
                  bg-main-gray 
                  h-[78px] 
                  w-[390px]           
                  rounded-[100px]
                  border-0
                  mx-auto
                  -ml-4            
                  md:w-[558px]
                  md:mx-0
                  text-third-gray
                  pl-8
                  pr-8             // Añadir padding derecho para separar el ícono del borde
                ">
                  <SelectValue placeholder="Select category" />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="fastfood">Fast Food</SelectItem>
                  <SelectItem value="cafe">Café & Bakery</SelectItem>
                  <SelectItem value="pizzeria">Pizzeria</SelectItem>
                  <SelectItem value="sushi">Sushi Bar</SelectItem>
                  <SelectItem value="buffet">Buffet</SelectItem>
                  <SelectItem value="foodtruck">Food Truck</SelectItem>
                  <SelectItem value="icecream">Ice Cream & Desserts</SelectItem>
                  <SelectItem value="deli">Deli & Sandwiches</SelectItem>
                  <SelectItem value="seafood">Seafood Restaurant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div className="space-y-2 px-4 md:px-8">
              <label className="block text-[16px] font-bold pl-8">
                Subcategory of business
              </label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger className="
                  bg-main-gray 
                  h-[78px] 
                  w-[390px]           
                  rounded-[100px]
                  border-0
                  mx-auto
                  -ml-4            
                  md:w-[558px]
                  md:mx-0
                  text-third-gray
                  pl-8
                  pr-8             // Añadir padding derecho para separar el ícono del borde
                ">
                  <SelectValue placeholder="Select subcategory" />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="thai">Thai</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="bbq">BBQ & Grill</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian & Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fotos */}
            <div>
              <div className="flex items-center justify-between mb-2 px-4 md:px-8">
                <label 
                  htmlFor="fileInput" 
                  className="
                    block 
                    !text-[16px] 
                    !font-['Open_Sans'] 
                    !font-bold 
                    !leading-[26px] 
                    text-black 
                    cursor-pointer 
                    hover:opacity-80 
                    pl-8
                  "
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
              
              {/* Área de previsualización con placeholder */}
              <div className="px-4 md:px-8">
                {photos.length === 0 ? (
                  <div className="
                    w-[390px]           
                    h-[78px] 
                    bg-main-gray 
                    rounded-[100px]
                    mx-auto
                    -ml-4            // Margen negativo para mover a la izquierda
                    md:w-full
                    md:mx-0
                    md:h-[80px]
                    md:rounded-2xl
                  ">
                    {isUploadingImages ? (
                      <ClipLoader size={20} color="#7B7B7B" />
                    ) : (
                      <p className="text-[#7B7B7B] text-sm">
                        Upload your restaurant photos here
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="
                    w-[390px]           
                    mx-auto            
                    mr-[40px]
                    md:w-full          
                    md:mx-0            
                  ">
                    <div className="
                      flex 
                      gap-2 
                      md:gap-4 
                      overflow-x-auto 
                      pb-2
                      pl-6            // <- Añadido padding izquierdo
                    ">
                      {photos.map((photo, index) => (
                        <div 
                          key={index} 
                          className="
                            relative 
                            group 
                            w-[70px] 
                            h-[70px] 
                            md:w-[80px] 
                            md:h-[80px] 
                            flex-shrink-0
                          "
                        >
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
              w-[390px]         
              h-[78px]
              rounded-[100px]
              mx-auto
              -ml-4            // Margen negativo para mover a la izquierda
              md:w-[558px]
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
              w-[390px]         
              mx-auto
              -ml-4            // Margen negativo para mover a la izquierda
              md:w-[558px]
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
            "
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}