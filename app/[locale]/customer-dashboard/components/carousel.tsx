// app/customer-dashboard/components/restaurant-carousel.tsx
'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback } from 'react'
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
                  {restaurant.images?.[0] && (
                    <div className="relative w-full h-[221px] md:h-[310px]">
                      <Image
                        src={restaurant.images[0].url}
                        alt={restaurant.title}
                        fill
                        className="object-cover rounded-[20px]"
                      />
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
                      <span className="text-third-gray !text-[20px] font-semibold">
                        300+ subs
                      </span>
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