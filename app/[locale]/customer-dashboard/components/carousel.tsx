// app/customer-dashboard/components/restaurant-carousel.tsx
'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Restaurant {
  id: string
  title: string
  images?: Array<{
    url: string
  }>
  places?: Array<{
    id: string
    location: string
    offers?: Array<{
      id: string
      title: string
      images?: Array<{
        url: string
      }>
    }>
  }>
}

export function RestaurantCarousel({ restaurants }: { restaurants: Restaurant[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // Función para formatear las locations
  const formatLocations = (places?: Array<{ location: string }>) => {
    if (!places || places.length === 0) return '';
    
    // Obtener locations únicas (por si hay duplicados)
    const uniqueLocations = [...new Set(places.map(place => place.location))];
    
    // Si hay más de 2 locations, mostrar las 2 primeras y un "+X más"
    if (uniqueLocations.length > 2) {
      return `${uniqueLocations[0]}, ${uniqueLocations[1]} +${uniqueLocations.length - 2} more`;
    }
    
    // Si hay 2 o menos, mostrarlas todas separadas por coma
    return uniqueLocations.join(', ');
  }

  return (
    <div className="overflow-hidden">
      <div className="relative">
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hidden md:block"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="overflow-visible md:overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 pr-4 md:gap-6">
            {restaurants.map((restaurant) => (
              <div 
                key={restaurant.id}
                className="
                  flex-[0_0_85%]  /* Ajustamos el ancho en móvil para mostrar parte del siguiente */
                  min-w-0 
                  md:flex-[0_0_calc(33.33%-16px)]
                "
              >
                <Link 
                  href={`/customer-dashboard/restaurants/${restaurant.id}`}
                  className="group relative overflow-hidden rounded-lg block"
                >
                  {/* Carousel automático de imágenes del restaurante */}
                  {restaurant.images && restaurant.images.length > 0 && (
                    <div className="relative w-full h-[221px] md:h-[310px]">
                      <RestaurantImageCarousel images={restaurant.images} />
                    </div>
                  )}
                  <div className="p-4 bg-white">
                    {/* Locations */}
                    <div className="text-third-gray text-sm font-semibold mb-2">
                      {formatLocations(restaurant.places)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold !text-[20px]">
                        {restaurant.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hidden md:block"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Componente interno para el carousel automático de imágenes del restaurante
function RestaurantImageCarousel({ images }: { images: Array<{ url: string }> }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto-play cada 3 segundos
  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [images.length])

  // Mostrar máximo 3 imágenes
  const displayImages = images.slice(0, 3)

  return (
    <div className="relative w-full h-full">
      {/* Imagen actual */}
      <Image
        src={displayImages[currentImageIndex].url}
        alt={`Restaurant image ${currentImageIndex + 1}`}
        fill
        className="object-cover rounded-[20px] transition-opacity duration-500"
        quality={95}
        sizes="(max-width: 768px) 85vw, (max-width: 1200px) 33vw, 400px"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />

      {/* Indicadores de imagen */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {displayImages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}