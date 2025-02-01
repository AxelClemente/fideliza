'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPinIcon } from "lucide-react"
import Image from "next/image"
import { OfferViewTracker } from "@/app/[locale]/customer-dashboard/components/offer-view-tracker"
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface CustomerOfferModalProps {
  isOpen: boolean
  onClose: () => void
  offer?: {
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
      restaurant: {
        id: string
      }
    }
  }
}

export function CustomerOfferModal({ 
  isOpen, 
  onClose,
  offer 
}: CustomerOfferModalProps) {
  const router = useRouter()
  const t = useTranslations('CustomerDashboard.offerModal')
  
  if (!offer) return null

  const getImageUrl = (offer: CustomerOfferModalProps['offer']) => {
    if (!offer?.images || offer.images.length === 0) {
      return '/images/defaultoffers.jpg'
    }
    return offer.images[0].url
  }

  const handleButtonClick = () => {
    if (offer.place?.restaurant?.id) {
      onClose()
      router.push(`/customer-dashboard/restaurants/${offer.place.restaurant.id}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && <OfferViewTracker offerId={offer.id} />}
      <DialogContent 
        className="
          max-w-[706px] 
          p-0 
          overflow-hidden 
          !fixed 
          !left-0
          !right-0
          !bottom-0 
          !top-0 
          !translate-x-0
          !translate-y-0 
          !rounded-none
          !h-screen
          md:!left-auto
          md:!right-[calc((100vw-1440px)/2)]
          flex
          flex-col
        "
      >
        <DialogHeader className="p-3 md:p-4 pb-0 flex-shrink-0">
          <DialogTitle className="
            !text-[24px]
            md:!text-[30px]
            !font-['Open_Sans']
            font-[700]
            !leading-[36px]
            -mb-2
            px-4 
            md:px-8 
            mt-6
            md:mt-10
          ">
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-3 md:p-4">
            {/* Image */}
            <div className="px-0 md:px-8">
              <div className="
                relative 
                w-[389px]
                h-[244px]
                md:w-[570px] 
                md:h-[314px] 
                mx-auto
                md:mx-0
                max-md:border-2
                max-md:border-gray-200
                max-md:rounded-t-[20px]
                overflow-hidden
              ">
                <Image
                  src={getImageUrl(offer)}
                  alt={offer.title}
                  fill
                  className="object-cover md:rounded-[20px]"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/images/defaultoffers.jpg';
                  }}
                />
              </div>
              
              {/* Contenedor con borde para el resto del contenido */}
              <div className="
                max-md:border-x-2
                max-md:border-b-2
                max-md:border-gray-200
                max-md:rounded-b-[20px]
                max-md:h-[371px]
                mx-auto
                md:mx-0
                w-[389px]
                md:w-[570px]
                p-4
                md:p-6
                max-md:overflow-y-auto
              ">
                {/* Title y Description */}
                <div className="px-0">
                  <h3 className="
                    !text-[20px]
                    !font-['Open_Sans']
                    font-[700]
                    !leading-[32px]
                    mb-4
                  ">
                    {offer.title}
                  </h3>
                  <p className="
                    text-[14px] 
                    !font-['Open_Sans']
                    font-[400]
                    !leading-[18px]
                    text-justify
                    md:text-[20px]               
                    md:!leading-[26px]
                    md:font-[400]
                  ">
                    {offer.description}
                  </p>
                </div>

                {/* Place */}
                {offer.place && (
                  <div className="px-0 mt-4">
                    <h3 className="
                      !text-[16px]
                      !font-['Open_Sans']
                      !font-[400]
                      !leading-[32px]
                      mb-4
                    ">
                      Where to use:
                    </h3>
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="h-5 w-5 shrink-0 mt-1" />
                      <div className="flex items-center flex-wrap ">
                        <span className="
                          !text-[14px]
                          !font-['Open_Sans']
                          font-[600]
                          !leading-[26px]
                          underline
                        ">
                          {offer.place.name}
                        </span>
                        <span className="mx-1">,</span>
                        <span className="
                          !text-[14px]
                          !font-['Open_Sans']
                          font-[600]
                          !leading-[26px]
                          underline
                        ">
                          {offer.place.location}
                        </span>
                        <span className="mx-1">,</span>
                        <span className="
                          !text-[14px]
                          !font-['Open_Sans']
                          font-[600]
                          !leading-[26px]
                          underline
                        ">
                          {offer.place.phoneNumber}.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Website */}
                {offer.website && (
                  <div className="px-0 mt-4">
                    <a 
                      href={offer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        !text-[14px]
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
          </div>
        </div>

        {/* Button */}
        <div className="p-3 md:p-4 px-4 md:px-14 mt-auto">
          <Button 
            variant="ghost"
            onClick={handleButtonClick}
            className="
              w-full
              h-[78px]
              rounded-[100px]
              bg-black
              text-white
              border-2
              border-black
              text-[16px] 
              font-semibold 
              leading-[20px] 
              font-['Open_Sans']
              hover:bg-gray-900
            "
          >
            {t('viewRestaurant')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}