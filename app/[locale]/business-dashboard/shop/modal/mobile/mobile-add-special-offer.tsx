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
import { useState, useEffect } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import type { Offer } from '../../types/types'
import { ModalPortal } from "../../components/modal-portal"
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

interface MobileAddSpecialOfferProps {
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
  const [fieldErrors, setFieldErrors] = useState<{title?: boolean, description?: boolean, startDate?: boolean, finishDate?: boolean, selectedPlace?: boolean, photos?: boolean}>({});

  // Agregar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '')
      setDescription(initialData?.description || '')
      setStartDate(initialData?.startDate ? new Date(initialData.startDate) : undefined)
      setFinishDate(initialData?.finishDate ? new Date(initialData.finishDate) : undefined)
      setSelectedPlace(initialData?.placeId || '')
      setWebsite(initialData?.website || '')
      setPhotos(initialData?.images.map(img => img.url) || [])
      setFieldErrors({})
      setIsLoading(false)
      setIsUploadingImages(false)
    }
  }, [isOpen, initialData])

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setDescription('')
      setStartDate(undefined)
      setFinishDate(undefined)
      setSelectedPlace('')
      setWebsite('')
      setPhotos([])
      setFieldErrors({})
      setIsLoading(false)
      setIsUploadingImages(false)
    }
  }, [isOpen])

  // Actualizar el tipo del manejador
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
        {/* Header */}
        <div className="p-4 pb-0 mt-6">
          <h2 className="
            text-[26px] 
            font-bold 
            leading-[30px] 
            font-['Open_Sans'] 
            px-4
            mb-6
            w-full
            text-center
          ">
            Add Special Offer
          </h2>
        </div>

        {/* Contenedor scrolleable */}
        <div className="
          flex-1 
          overflow-y-auto 
          overflow-x-hidden
        ">
          <div className="
            flex 
            flex-col 
            items-center 
            w-full
          ">
            <div className="space-y-3 w-[390px]">
              {/* Contenido scrolleable */}
              {/* Title Input */}
              <div className="space-y-2">
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={classNames(
                    'w-full',
                    'h-[78px]',
                    'bg-main-gray',
                    'pl-8',
                    'rounded-[100px]',
                    'border-0',
                    'text-third-gray',
                    {'border-2 border-red-500': fieldErrors.title}
                  )}
                  placeholder="Title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={classNames(
                    'w-full',
                    'h-[78px]',
                    'bg-main-gray',
                    'pl-8',
                    'rounded-[100px]',
                    'border-0',
                    'text-third-gray',
                    'resize-none',
                    {'border-2 border-red-500': fieldErrors.description}
                  )}
                  placeholder="Describe your special offer..."
                />
              </div>

              {/* Date Selectors */}
              <div className="space-y-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <label className="block text-[16px] font-bold leading-[20px] text-black mb-1 font-['Open_Sans']">
                    Start Date
                  </label>
                  <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={classNames(
                          'w-full',
                          'h-[78px]',
                          'bg-main-gray',
                          'border-0',
                          'rounded-[100px]',
                          'justify-start',
                          'text-left',
                          'font-normal',
                          'pl-8',
                          'text-third-gray',
                          {'border-2 border-red-500': fieldErrors.startDate}
                        )}
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
                  <label className="block text-[16px] font-bold leading-[20px] text-black mb-1 font-['Open_Sans']">
                    Finish Date
                  </label>
                  <Popover open={isFinishDateOpen} onOpenChange={setIsFinishDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={classNames(
                          'w-full',
                          'h-[78px]',
                          'bg-main-gray',
                          'border-0',
                          'rounded-[100px]',
                          'justify-start',
                          'text-left',
                          'font-normal',
                          'pl-8',
                          'text-third-gray',
                          {'border-2 border-red-500': fieldErrors.finishDate}
                        )}
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
                <label className="block text-[16px] font-bold leading-[20px] text-black mb-1 font-['Open_Sans']">
                  Select Place
                </label>
                <Select 
                  value={selectedPlace} 
                  onValueChange={handlePlaceSelect}
                >
                  <SelectTrigger className={classNames(
                    'w-full',
                    'h-[78px]',
                    'bg-main-gray',
                    'border-0',
                    'rounded-[100px]',
                    'pl-8',
                    'text-third-gray',
                    {'border-2 border-red-500': fieldErrors.selectedPlace}
                  )}>
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
                  className={classNames(
                    'w-full',
                    'h-[78px]',
                    'bg-main-gray',
                    'pl-16',
                    'rounded-[100px]',
                    'border-0',
                    'text-third-gray'
                  )}
                  placeholder="http//:example.com"
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
                    <div 
                      onClick={() => document.getElementById('fileInput')?.click()}
                      className={classNames(
                        'w-[390px]',
                        'h-[78px]',
                        'bg-main-gray',
                        'rounded-[100px]',
                        'mx-auto',
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
                    <div className="w-[390px] mx-auto -ml-6">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext 
                          items={photos}
                          strategy={rectSortingStrategy}
                        >
                          <div className="flex gap-2 overflow-x-auto pb-2 pl-6">
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
        </div>

        {/* Footer */}
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
            "
          >
            Cancel
          </Button>
        </div>
      </div>
    </ModalPortal>
  )
}