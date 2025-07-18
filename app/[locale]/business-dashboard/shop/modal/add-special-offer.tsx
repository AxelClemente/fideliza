'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Trash2, ChevronDown, Check } from 'lucide-react'
import Image from "next/image"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import type { Offer } from '../types/types'
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
import classNames from 'classnames';

interface AddSpecialOfferModalProps {
  isOpen: boolean
  onClose: () => void
  places: Array<{ id: string, name: string }>
  mode?: 'create' | 'edit'
  initialData?: Offer
}

// Componente Sortable para cada imagen
function SortablePhoto({ url, index, onDelete }: { url: string; index: number; onDelete: (index: number) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: url });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete button clicked for image at index:', index);
    onDelete(index);
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
        className="relative w-[70px] h-[70px] flex-shrink-0"
      >
        <Image
          src={url}
          alt={`Photo ${index + 1}`}
          width={70}
          height={70}
          className="rounded-lg object-cover w-full h-full"
        />
      </div>
      
      {/* Botón de eliminar fuera de los listeners del DnD */}
      <div className="absolute top-1 right-1 z-50">
        <button
          onClick={handleDelete}
          className="bg-black/50 rounded-full p-1 hover:bg-black/70 cursor-pointer"
          type="button"
          aria-label="Delete image"
        >
          <Trash2 className="h-3 w-3 text-white" />
        </button>
      </div>
    </div>
  );
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
  const [openCommand, setOpenCommand] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{title?: boolean, description?: boolean, startDate?: boolean, finishDate?: boolean, selectedPlace?: boolean, photos?: boolean}>({});

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
    const errors: {title?: boolean, description?: boolean, startDate?: boolean, finishDate?: boolean, selectedPlace?: boolean, photos?: boolean} = {};
    const errorMessages: string[] = [];
    if (!title.trim()) {
      errors.title = true;
      errorMessages.push('Title is required');
    }
    if (!description.trim()) {
      errors.description = true;
      errorMessages.push('Description is required');
    }
    if (!startDate) {
      errors.startDate = true;
      errorMessages.push('Start date is required');
    }
    if (!finishDate) {
      errors.finishDate = true;
      errorMessages.push('Finish date is required');
    }
    if (!selectedPlace) {
      errors.selectedPlace = true;
      errorMessages.push('Place is required');
    }
    if (photos.length === 0) {
      errors.photos = true;
      errorMessages.push('At least one photo is required');
    }
    setFieldErrors(errors);
    if (errorMessages.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: errorMessages.map(msg => `• ${msg}`).join('\n'),
      });
      return;
    }

    try {
      setIsLoading(true)

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
          !h-[100dvh]        
          flex               
          flex-col          
          md:!left-auto
          md:!right-[calc((100vw-1440px)/2)]
          overflow-x-hidden
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

        {/* Contenedor scrolleable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 space-y-4">
            <div className="
              space-y-3 
              px-8
              max-w-full
            ">
              {/* Title */}
              <div className="relative">
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={classNames(
                    'bg-main-gray',
                    'pl-8',
                    'h-10',
                    'w-full',
                    'rounded-2xl',
                    'border-0',
                    'md:w-[558px]',
                    'md:h-[78px]',
                    'md:rounded-[100px]',
                    'text-third-gray',
                    'max-md:h-[78px]',
                    'max-md:rounded-[100px]',
                    'max-md:text-[18px]',
                    'max-md:font-["Open_Sans"]',
                    'max-md:font-semibold',
                    'max-md:leading-[22px]',
                    'max-md:w-[390px]',
                    'max-md:-ml-6',
                    {'border-2 border-red-500': fieldErrors.title}
                  )}
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
                  className={classNames(
                    'max-md:h-[78px]',
                    'max-md:rounded-[100px]',
                    'bg-main-gray',
                    'pl-8',
                    'h-10',
                    'w-full',
                    'rounded-2xl',
                    'border-0',
                    'md:w-[558px]',
                    'md:h-[78px]',
                    'md:rounded-[100px]',
                    'text-third-gray',
                    'resize-none',
                    'max-md:text-[18px]',
                    'max-md:font-["Open_Sans"]',
                    'max-md:font-semibold',
                    'max-md:leading-[22px]',
                    'max-md:w-[390px]',
                    'max-md:-ml-6',
                    {'border-2 border-red-500': fieldErrors.description}
                  )}
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
                        className={classNames(
                          'max-md:h-[78px]',
                          'max-md:rounded-[100px]',
                          'w-full',
                          'bg-main-gray',
                          'border-0',
                          'rounded-2xl',
                          'justify-start',
                          'text-left',
                          'font-normal',
                          'pl-8',
                          'h-10',
                          'md:w-[558px]',
                          'md:h-[78px]',
                          'md:rounded-[100px]',
                          'text-third-gray',
                          'max-md:text-[18px]',
                          'max-md:font-["Open_Sans"]',
                          'max-md:font-semibold',
                          'max-md:leading-[22px]',
                          'max-md:w-[390px]',
                          'max-md:-ml-6',
                          {'border-2 border-red-500': fieldErrors.startDate}
                        )}
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
                        className={classNames(
                          'w-full',
                          'bg-main-gray',
                          'border-0',
                          'rounded-2xl',
                          'justify-start',
                          'text-left',
                          'font-normal',
                          'pl-8',
                          'h-10',
                          'md:w-[558px]',
                          'md:h-[78px]',
                          'md:rounded-[100px]',
                          'text-third-gray',
                          'max-md:h-[78px]',
                          'max-md:rounded-[100px]',
                          'max-md:text-[18px]',
                          'max-md:font-["Open_Sans"]',
                          'max-md:font-semibold',
                          'max-md:leading-[22px]',
                          'max-md:w-[390px]',
                          'max-md:-ml-6',
                          {'border-2 border-red-500': fieldErrors.finishDate}
                        )}
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
                <label className="pt-3 pl-6 block !text-[16px] !font-['Open_Sans'] !font-bold !leading-[20px] text-black mb-1">
                  Where to use
                </label>
                <Popover open={openCommand} onOpenChange={setOpenCommand}>
                  <PopoverTrigger asChild>
                    <div className={classNames(
                      'bg-main-gray',
                      'border-0',
                      'text-center',
                      'text-third-gray',
                      'md:w-[558px]',
                      'md:h-[78px]',
                      'md:rounded-[100px]',
                      'max-md:w-[390px]',
                      'max-md:h-[78px]',
                      'max-md:rounded-[100px]',
                      'max-md:mx-auto',
                      'cursor-pointer',
                      'flex',
                      'items-center',
                      'justify-between',
                      'px-8',
                      {'border-2 border-red-500': fieldErrors.selectedPlace}
                    )}>
                      <span className="text-left">
                        {selectedPlace ? places.find(p => p.id === selectedPlace)?.name : 'Select place...'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="
                    w-[558px]
                    p-4
                    bg-[#F6F6F6]
                    border-0
                    rounded-[20px]
                    shadow-lg
                  ">
                    <div className="space-y-2">
                      {places.map((place) => (
                        <div
                          key={place.id}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-full cursor-pointer"
                          onClick={() => {
                            setSelectedPlace(place.id)
                            setOpenCommand(false)
                          }}
                        >
                          <div className={classNames(
                            'w-5 h-5 rounded-full border',
                            {'bg-black border-black': selectedPlace === place.id},
                            {'border-gray-400': selectedPlace !== place.id}
                          )}>
                            {selectedPlace === place.id && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="text-[16px] font-semibold">{place.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Website */}
              <div className="relative">
                <Input 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={classNames(
                    'bg-main-gray',
                    'pl-16',
                    'h-10',
                    'w-full',
                    'rounded-2xl',
                    'border-0',
                    'md:w-[558px]',
                    'md:h-[78px]',
                    'md:rounded-[100px]',
                    'text-third-gray',
                    'max-md:h-[78px]',
                    'max-md:rounded-[100px]',
                    'max-md:text-[18px]',
                    'max-md:font-["Open_Sans"]',
                    'max-md:font-semibold',
                    'max-md:leading-[22px]',
                    'max-md:w-[390px]',
                    'max-md:-ml-6'
                  )}
                  placeholder="http//:example.com"
                />
                <svg
                  className="
                    absolute 
                    max-md:left-2        // En móvil mantener left-2
                    md:left-8           // En desktop mover más a la derecha
                    top-1/2 
                    -translate-y-1/2 
                    h-4 
                    w-4 
                    text-[#7B7B7B]
                  "
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
                  <div 
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className={classNames(
                      'bg-main-gray',
                      'h-[78px]',
                      'w-[390px]',
                      'rounded-[100px]',
                      'border-0',
                      'mx-auto',
                      '-ml-6',
                      'md:w-[558px]',
                      'md:mx-0',
                      'flex',
                      'items-center',
                      'justify-center',
                      'cursor-pointer',
                      'hover:bg-gray-100',
                      'transition-colors',
                      'text-third-gray',
                      {'border-2 border-red-500': fieldErrors.photos}
                    )}
                  >
                    {isUploadingImages ? (
                      <ClipLoader size={20} color="#7B7B7B" />
                    ) : (
                      <p className="text-[#7B7B7B] text-sm">
                        Upload your offer photos here
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-[390px] mx-auto -ml-6 md:w-[558px] md:mx-0">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={photos}
                        strategy={rectSortingStrategy}
                      >
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {isUploadingImages && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
                              <ClipLoader size={20} color="#000000" />
                            </div>
                          )}
                          {photos.map((photo, index) => (
                            <SortablePhoto
                              key={photo}
                              url={photo}
                              index={index}
                              onDelete={(index) => setPhotos(photos.filter((_, i) => i !== index))}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
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
              max-md:w-[390px]         
              max-md:-ml-4           
              md:w-[558px]
              md:mx-0
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