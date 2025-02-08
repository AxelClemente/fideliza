'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, ChevronDown, Plus } from 'lucide-react'
import Image from "next/image"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Componente Sortable para cada imagen
function SortablePhoto({ url, id, onDelete }: { url: string; id: string; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete button clicked for image:', id);
    onDelete(id);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="relative cursor-move"
    >
      {/* Área arrastrable */}
      <div 
        {...attributes}
        {...listeners}
        className="relative w-[138px] h-[138px]"
      >
        <Image 
          src={url} 
          alt="Preview"
          fill
          className="object-cover rounded-[20px]"
        />
      </div>
      
      {/* Botón de eliminar fuera de los listeners del DnD */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 z-[100] bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 cursor-pointer"
        type="button"
        aria-label="Delete image"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
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
  );
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex(item => item === active.id);
        const newIndex = items.findIndex(item => item === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleImageDelete = (urlToDelete: string) => {
    setPhotos(prev => prev.filter(url => url !== urlToDelete));
  };

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
    if (!files || isUploadingImages) return // Prevenir múltiples cargas

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
      console.log('Starting image upload...');

      const uploadPromises = Array.from(files).map(async (file) => {
        console.log('Uploading file:', file.name);
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload image: ${file.name}`)
        }

        const data = await response.json()
        console.log('Upload successful:', data.secure_url);
        return data.secure_url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      console.log('All uploads completed:', uploadedUrls);
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
      console.log('Upload process finished');
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

            {/* Sección de fotos */}
            <div className="flex flex-col items-center space-y-4 px-4">
              <div className="w-full">
                <label className="block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1 pl-8">
                  Photos +
                </label>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={photos}
                    strategy={rectSortingStrategy}
                  >
                    <div className="flex flex-wrap gap-4 p-4">
                      {photos.map((url) => (
                        <SortablePhoto 
                          key={url} 
                          id={url} 
                          url={url}
                          onDelete={handleImageDelete}
                        />
                      ))}
                      
                      {/* Botón de upload */}
                      <div className="w-[138px] h-[138px] relative">
                        <label className={`
                          w-full 
                          h-full 
                          flex 
                          items-center 
                          justify-center 
                          border-2 
                          border-dashed 
                          border-gray-300 
                          rounded-[20px]
                          ${isUploadingImages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-400'}
                        `}>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                            accept="image/*"
                            disabled={isUploadingImages}
                          />
                          {isUploadingImages ? (
                            <ClipLoader size={24} color="#666666" />
                          ) : (
                            <Plus className="w-8 h-8 text-gray-400" />
                          )}
                        </label>
                      </div>
                    </div>
                  </SortableContext>
                </DndContext>
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