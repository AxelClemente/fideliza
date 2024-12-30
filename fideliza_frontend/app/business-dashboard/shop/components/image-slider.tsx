'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MoreHorizontal } from 'lucide-react'
import type { RestaurantImage } from '../types/types'

interface ImageSliderProps {
  images: RestaurantImage[]
  title: string
}

export function ImageSlider({ images, title }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleImageClick = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div 
      className="
        w-full          /* Toma todo el ancho disponible */
        h-[250px]       /* Altura para móvil */
        md:w-[300px]    /* Ancho fijo para desktop */
        md:h-[215px]    /* Altura para desktop */
        relative 
        cursor-pointer 
        group
      "
      onClick={handleImageClick}
    >
      <Image
        src={images[currentIndex].url}
        alt={`${title} - Image ${currentIndex + 1}`}
        fill
        className="object-cover md:rounded-lg" /* Bordes redondeados solo en desktop */
        sizes="(max-width: 768px) 100vw, 300px"
        priority
      />
      
      {/* Indicador de más imágenes */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1">
          <MoreHorizontal className="w-5 h-5 text-white" />
          <span className="sr-only">More images available</span>
        </div>
      )}
    </div>
  )
}