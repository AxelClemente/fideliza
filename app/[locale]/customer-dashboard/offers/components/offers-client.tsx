'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CustomerOfferModal } from '../../modal/customer-offer-modal'

interface Offer {
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

interface OffersClientProps {
  offers: Offer[]
}

export function OffersClient({ offers }: OffersClientProps) {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getImageUrl = (offer: Offer) => {
    if (!offer.images || offer.images.length === 0) {
      return '/images/defaultoffers.jpg'
    }
    return offer.images[0].url
  }

  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            onClick={() => handleOfferClick(offer)}
            className="group relative overflow-hidden rounded-[20px] cursor-pointer bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="relative w-full h-[200px] md:h-[250px]">
              <Image
                src={getImageUrl(offer)}
                alt={offer.title}
                fill
                className="object-cover rounded-t-[20px]"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/images/defaultoffers.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white text-[24px] font-bold text-center px-4">
                  {offer.title}
                </h3>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-[20px] font-bold mb-2 line-clamp-2">
                {offer.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {offer.description}
              </p>
              
              {offer.place && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{offer.place.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CustomerOfferModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOffer(null)
        }}
        offer={selectedOffer || undefined}
      />
    </>
  )
} 