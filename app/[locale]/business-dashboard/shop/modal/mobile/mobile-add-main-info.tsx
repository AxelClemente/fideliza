"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "@/components/ui/use-toast";
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

interface MobileAddMainInfoProps {
  isOpen: boolean;
  onClose: () => void;
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
      <div className="absolute -top-2 -right-2 z-50">
        <button
          onClick={handleDelete}
          className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 cursor-pointer"
          type="button"
          aria-label="Delete image"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function MobileAddMainInfo({ isOpen, onClose }: MobileAddMainInfoProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isOpen) return null

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

      const response = await fetch('/api/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          website,
          images: photos
        })
      })

      if (!response.ok) throw new Error('Failed to save restaurant')

      toast({
        title: "Success",
        description: "Restaurant created successfully",
      })

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create restaurant. Please try again.",
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

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center py-4 mb-4">Add main info</h2>

          {/* Restaurant Name Input */}
          <div className="space-y-2">
            <div className="relative">
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Restaurante name"
                className="
                  bg-gray-50 
                  border-none 
                  w-[359px] 
                  h-[78px] 
                  rounded-[100px]
                  mx-auto
                  pl-14
                "
              />
              <svg
                className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B] ml-4"
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3.7125 1.6875C3.82986 1.55029 3.97555 1.44014 4.13954 1.36461C4.30354 1.28909 4.48195 1.24999 4.6625 1.25H15.3375C15.5181 1.24999 15.6965 1.28909 15.8605 1.36461C16.0245 1.44014 16.1701 1.55029 16.2875 1.6875L19.5487 5.4925C19.8399 5.83229 20 6.26502 20 6.7125V7.03125C20.0001 7.64997 19.8068 8.25325 19.4473 8.75678C19.0877 9.2603 18.5798 9.63891 17.9946 9.83968C17.4094 10.0405 16.776 10.0534 16.1831 9.87659C15.5901 9.69982 15.0673 9.34221 14.6875 8.85375C14.4102 9.21103 14.0549 9.50009 13.6486 9.69878C13.2423 9.89747 12.796 10.0005 12.3438 10C11.8915 10.0005 11.4452 9.89747 11.0389 9.69878C10.6326 9.50009 10.2773 9.21103 10 8.85375C9.72274 9.21103 9.36736 9.50009 8.9611 9.69878C8.55485 9.89747 8.10849 10.0005 7.65625 10C7.20401 10.0005 6.75765 9.89747 6.3514 9.69878C5.94514 9.50009 5.58976 9.21103 5.3125 8.85375C4.93274 9.34221 4.40985 9.69982 3.81692 9.87659C3.22399 10.0534 2.59065 10.0405 2.00541 9.83968C1.42017 9.63891 0.912278 9.2603 0.552728 8.75678C0.193177 8.25325 -6.82482e-05 7.64997 1.80807e-08 7.03125V6.7125C1.57594e-05 6.26502 0.160071 5.83229 0.45125 5.4925L3.7125 1.6875ZM5.9375 7.03125C5.9375 7.48709 6.11858 7.92426 6.44091 8.24659C6.76324 8.56892 7.20041 8.75 7.65625 8.75C8.11209 8.75 8.54926 8.56892 8.87159 8.24659C9.19392 7.92426 9.375 7.48709 9.375 7.03125C9.375 6.86549 9.44085 6.70652 9.55806 6.58931C9.67527 6.4721 9.83424 6.40625 10 6.40625C10.1658 6.40625 10.3247 6.4721 10.4419 6.58931C10.5592 6.70652 10.625 6.86549 10.625 7.03125C10.625 7.48709 10.8061 7.92426 11.1284 8.24659C11.4507 8.56892 11.8879 8.75 12.3438 8.75C12.7996 8.75 13.2368 8.56892 13.5591 8.24659C13.8814 7.92426 14.0625 7.48709 14.0625 7.03125C14.0625 6.86549 14.1283 6.70652 14.2456 6.58931C14.3628 6.4721 14.5217 6.40625 14.6875 6.40625C14.8533 6.40625 15.0122 6.4721 15.1294 6.58931C15.2467 6.70652 15.3125 6.86549 15.3125 7.03125C15.3125 7.48709 15.4936 7.92426 15.8159 8.24659C16.1382 8.56892 16.5754 8.75 17.0312 8.75C17.4871 8.75 17.9243 8.56892 18.2466 8.24659C18.5689 7.92426 18.75 7.48709 18.75 7.03125V6.7125C18.75 6.56353 18.6968 6.41946 18.6 6.30625L15.3375 2.5H4.6625L1.4 6.30625C1.30318 6.41946 1.24999 6.56353 1.25 6.7125V7.03125C1.25 7.48709 1.43108 7.92426 1.75341 8.24659C2.07574 8.56892 2.51291 8.75 2.96875 8.75C3.42459 8.75 3.86176 8.56892 4.18409 8.24659C4.50642 7.92426 4.6875 7.48709 4.6875 7.03125C4.6875 6.86549 4.75335 6.70652 4.87056 6.58931C4.98777 6.4721 5.14674 6.40625 5.3125 6.40625C5.47826 6.40625 5.63723 6.4721 5.75444 6.58931C5.87165 6.70652 5.9375 6.86549 5.9375 7.03125ZM1.875 10.625C2.04076 10.625 2.19973 10.6908 2.31694 10.8081C2.43415 10.9253 2.5 11.0842 2.5 11.25V18.75H17.5V11.25C17.5 11.0842 17.5658 10.9253 17.6831 10.8081C17.8003 10.6908 17.9592 10.625 18.125 10.625C18.2908 10.625 18.4497 10.6908 18.5669 10.8081C18.6842 10.9253 18.75 11.0842 18.75 11.25V18.75H19.375C19.5408 18.75 19.6997 18.8158 19.8169 18.9331C19.9342 19.0503 20 19.2092 20 19.375C20 19.5408 19.9342 19.6997 19.8169 19.8169C19.6997 19.9342 19.5408 20 19.375 20H0.625C0.45924 20 0.300269 19.9342 0.183058 19.8169C0.0658481 19.6997 1.80807e-08 19.5408 1.80807e-08 19.375C1.80807e-08 19.2092 0.0658481 19.0503 0.183058 18.9331C0.300269 18.8158 0.45924 18.75 0.625 18.75H1.25V11.25C1.25 11.0842 1.31585 10.9253 1.43306 10.8081C1.55027 10.6908 1.70924 10.625 1.875 10.625ZM4.375 11.25C4.54076 11.25 4.69973 11.3158 4.81694 11.4331C4.93415 11.5503 5 11.7092 5 11.875V16.25H15V11.875C15 11.7092 15.0658 11.5503 15.1831 11.4331C15.3003 11.3158 15.4592 11.25 15.625 11.25C15.7908 11.25 15.9497 11.3158 16.0669 11.4331C16.1842 11.5503 16.25 11.7092 16.25 11.875V16.25C16.25 16.5815 16.1183 16.8995 15.8839 17.1339C15.6495 17.3683 15.3315 17.5 15 17.5H5C4.66848 17.5 4.35054 17.3683 4.11612 17.1339C3.8817 16.8995 3.75 16.5815 3.75 16.25V11.875C3.75 11.7092 3.81585 11.5503 3.93306 11.4331C4.05027 11.3158 4.20924 11.25 4.375 11.25Z" 
                  fill="#7B7B7B"
                />
              </svg>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6 px-4">
            <h3 className="font-medium !text-[20px]">Description</h3>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your restaurant"
              className="
                bg-gray-50 
                border-none 
                w-[359px] 
                min-h-[78px] 
                rounded-[100px]
                mx-auto
                pl-14
                flex
                items-center
                py-6
              "
            />
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <div className="relative">
              <Input 
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="http://example.com"
                className="
                  bg-gray-50 
                  border-none 
                  w-[359px] 
                  h-[78px] 
                  rounded-[100px]
                  mx-auto
                  pl-14
                "
              />
              <svg
                className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B] ml-4"
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

          {/* Photos Section */}
          <div className="px-4">
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
            
            {/* Área de previsualización con placeholder */}
            <div>
              {photos.length === 0 ? (
                <div 
                  onClick={() => document.getElementById('fileInput')?.click()}
                  className="
                    w-[359px] 
                    h-[78px] 
                    bg-gray-50 
                    rounded-[100px]
                    mx-auto
                    flex 
                    items-center 
                    justify-center
                    cursor-pointer   
                    hover:bg-gray-100 
                    transition-colors
                  "
                >
                  {isUploadingImages ? (
                    <ClipLoader size={20} color="#7B7B7B" />
                  ) : (
                    <p className="text-[#7B7B7B] text-sm">
                      Upload your restaurant photos here
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-[359px] mx-auto">
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
                            id={photo}
                            onDelete={(id) => setPhotos(photos.filter((p) => p !== id))}
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
      
      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="
            w-[350px] 
            h-[78px] 
            bg-black 
            text-white 
            hover:bg-black/90
            rounded-[100px]
            mx-auto
            block
            font-['Open_Sans']
            text-[18px]
            font-semibold
            leading-[22px]
          "
        >
          {isLoading ? (
            <ClipLoader size={20} color="#FFFFFF" />
          ) : (
            'Save'
          )}
        </Button>
        <Button 
          variant="ghost" 
          disabled={isLoading}
          className="
            w-full
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
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}