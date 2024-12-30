'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPinIcon } from "lucide-react"
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback } from 'react'
import Image from "next/image"

interface CompanyOffersProps {
  isOpen: boolean
  onClose: () => void
  offers: Array<{
    id: string
    title: string
    description: string
    images: Array<{ url: string }>
    website?: string
    place?: {
      id: string
      name: string
      location: string
      phoneNumber: string
    }
  }>
}

export function CompanyOffers({ 
  isOpen, 
  onClose,
  offers 
}: CompanyOffersProps) {
  if (!offers) return null

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="
        max-w-none 
        w-full
        p-0 
        overflow-hidden 
        !fixed 
        !left-0
        !right-0
        !translate-x-0
        !translate-y-0 
        !rounded-none
        !top-0
        flex
        flex-col
        bg-white
        h-screen
      ">
        <DialogHeader className="p-3 md:p-4 pb-0 flex-shrink-0">
          <DialogTitle className="
            !text-[30px]
            !font-['Open_Sans']
            font-[700]
            !leading-[36px]
            -mb-3
            text-center
            px-4 
            md:px-8 
            mt-10
          ">
            Special Offers
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="md:grid md:grid-cols-2 md:gap-6 p-6 hidden">
            {offers.map((offer) => (
              <div 
                key={offer.id}
                className="
                  border-2 
                  border-black 
                  rounded-[20px] 
                  p-6 
                  flex 
                  flex-col 
                  min-h-[600px]
                  transition-all
                  duration-300
                  ease-in-out
                  hover:scale-[1.02]
                  hover:shadow-lg
                  bg-white
                "
              >
                <div className="flex-1 space-y-6">
                  {/* Image */}
                  <div className="relative w-full h-[200px] md:h-[358px]">
                    <Image
                      src={offer.images[0].url}
                      alt={offer.title}
                      fill
                      className="object-cover rounded-[20px]"
                    />
                  </div>

                  {/* Title and Description */}
                  <div>
                    <h3 className="
                      !text-[20px]
                      !font-['Open_Sans']
                      font-[600]
                      !leading-[26px]
                      mb-4
                      text-justify
                      md:!text-[24px]
                      md:font-[700]
                      md:!leading-[32px]
                      md:text-left
                    ">
                      {offer.title}
                    </h3>
                    <p className="
                      text-[16px] 
                      md:text-[20px]               
                      leading-[20px]
                      md:leading-normal
                    ">
                      {offer.description}
                    </p>
                  </div>

                  {/* Place */}
                  {offer.place && (
                    <div>
                      <h4 className="
                        !text-[16px]
                        !font-['Open_Sans']
                        font-[400]
                        !leading-[20px]
                        mb-4
                        md:!text-[24px]
                        md:!leading-[32px]
                      ">
                        Where to use:
                      </h4>
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="h-5 w-5 shrink-0 mt-1" />
                        <div>
                          <h5 className="
                            !text-[14px]
                            !font-['Open_Sans']
                            font-[600]
                            !leading-[18px]
                            underline
                            text-justify
                            md:!text-[20px]
                            md:!leading-[26px]
                          ">
                            {offer.place.name}
                          </h5>
                          <p className="
                            !text-[14px]
                            !font-['Open_Sans']
                            font-[600]
                            !leading-[18px]
                            mt-1
                            underline
                            text-justify
                            md:!text-[20px]
                            md:!leading-[26px]
                          ">
                            {offer.place.location}
                          </p>
                          <p className="
                            !text-[14px]
                            !font-['Open_Sans']
                            font-[600]
                            !leading-[18px]
                            mt-1
                            underline
                            text-justify
                            md:!text-[20px]
                            md:!leading-[26px]
                          ">
                            {offer.place.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {offer.website && (
                    <div>
                      <a 
                        href={offer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          !text-[20px]
                          !font-['Open_Sans']
                          font-[600]
                          !leading-[26px]
                          underline
                          hover:text-blue-800
                        "
                      >
                        {offer.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Carousel view para móvil */}
          <div className="md:hidden">
            <div className="relative">
              <button
                onClick={scrollPrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="overflow-visible" ref={emblaRef}>
                <div className="flex gap-4 p-6">
                  {offers.map((offer) => (
                    <div 
                      key={offer.id}
                      className="
                        flex-[0_0_85%]
                        min-w-0
                        border
                        border-[#E5E5E5]
                        rounded-[20px] 
                        p-6 
                        flex 
                        flex-col 
                        min-h-[600px]
                        transition-all
                        duration-300
                        ease-in-out
                        hover:scale-[1.02]
                        hover:shadow-lg
                        bg-white
                      "
                    >
                      {/* Contenido del carousel igual al grid de arriba */}
                      <div className="flex-1 space-y-6">
                        {/* Image */}
                        <div className="relative w-[calc(100%+48px)] -ml-6 h-[200px] -mt-6">
                          <Image
                            src={offer.images[0].url}
                            alt={offer.title}
                            fill
                            className="object-cover rounded-t-[20px]"
                          />
                        </div>

                        {/* Title and Description */}
                        <div>
                          <h3 className="
                            !text-[20px]
                            !font-['Open_Sans']
                            font-[600]
                            !leading-[26px]
                            mb-4
                            text-justify
                            md:!text-[24px]
                            md:font-[700]
                            md:!leading-[32px]
                            md:text-left
                          ">
                            {offer.title}
                          </h3>
                          <p className="
                            text-[14px]
                            !font-['Open_Sans']
                            font-[400]
                            !leading-[19px]
                            md:text-[16px]              
                            md:leading-[20px]
                          ">
                            {offer.description}
                          </p>
                        </div>

                        {/* Place */}
                        {offer.place && (
                          <div>
                            <h4 className="
                              !text-[16px]
                              !font-['Open_Sans']
                              font-[400]
                              !leading-[20px]
                              mb-4
                              md:!text-[24px]
                              md:!leading-[32px]
                            ">
                              Where to use:
                            </h4>
                            <div className="flex items-start gap-2">
                              <MapPinIcon className="h-5 w-5 shrink-0 mt-1" />
                              <div>
                                <h5 className="
                                  !text-[14px]
                                  !font-['Open_Sans']
                                  font-[600]
                                  !leading-[18px]
                                  underline
                                  text-justify
                                  md:!text-[20px]
                                  md:!leading-[26px]
                                ">
                                  {offer.place.name}
                                </h5>
                                <p className="
                                  !text-[14px]
                                  !font-['Open_Sans']
                                  font-[600]
                                  !leading-[18px]
                                  mt-1
                                  underline
                                  text-justify
                                  md:!text-[20px]
                                  md:!leading-[26px]
                                ">
                                  {offer.place.location}
                                </p>
                                <p className="
                                  !text-[14px]
                                  !font-['Open_Sans']
                                  font-[600]
                                  !leading-[18px]
                                  mt-1
                                  underline
                                  text-justify
                                  md:!text-[20px]
                                  md:!leading-[26px]
                                ">
                                  {offer.place.phoneNumber}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Website */}
                        {offer.website && (
                          <div>
                            <a 
                              href={offer.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                !text-[14px]
                                !font-['Open_Sans']
                                font-[700]
                                !leading-[18px]
                                underline
                                text-justify
                                hover:text-blue-800
                                md:!text-[20px]
                                md:font-[600]
                                md:!leading-[26px]
                              "
                            >
                              {offer.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={scrollNext}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}