'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback } from 'react'
import { MapPinIcon, PhoneIcon } from "lucide-react"

interface Place {
  id: string
  location: string
  phoneNumber: string
  name: string
}

export function PlacesCarousel({ places }: { places: Place[] }) {
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

  return (
    <div className="overflow-hidden">
      <div className="relative">
        <button
          onClick={scrollPrev}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hidden md:block"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="overflow-visible md:overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8 pl-0 md:gap-8">
            {places.map((place) => (
              <div 
                key={place.id}
                className="
                  flex-[0_0_auto]
                  min-w-0
                "
              >
                <div 
                  className="
                    w-[300px]
                    md:w-[550px] 
                    h-[150px]
                    md:h-[183px] 
                    p-4 
                    rounded-[20px] 
                    bg-main-gray
                    transition-all
                    duration-300
                    ease-in-out
                    hover:scale-[1.02]
                    hover:shadow-lg
                    flex
                    flex-col
                    justify-center
                  "
                >
                  <h3 className="font-medium mb-2 pl-2 !text-[20px] md:!text-[30px] pb-2">{place.name}</h3>
                  <div className="flex items-start gap-2 pl-2">
                    <MapPinIcon className="h-5 w-5 shrink-0" />
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        !text-[18px] 
                        md:!text-[20px] 
                        leading-[22px] 
                        md:leading-normal 
                        underline 
                        font-semibold
                        md:line-clamp-none
                        line-clamp-1
                        max-w-[200px]
                        md:max-w-none
                        hover:text-blue-600
                        transition-colors
                        cursor-pointer
                      "
                    >
                      {place.location}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pl-2">
                    <PhoneIcon className="h-5 w-5 shrink-0" />
                    <a 
                      href={`tel:${place.phoneNumber}`}
                      className="
                        !text-[18px] 
                        md:!text-[20px] 
                        leading-[22px] 
                        md:leading-normal 
                        underline 
                        font-semibold
                        hover:text-blue-600
                        transition-colors
                        cursor-pointer
                      "
                    >
                      {place.phoneNumber}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={scrollNext}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hidden md:block"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}