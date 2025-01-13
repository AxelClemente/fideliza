'use client'

import { useState } from "react"
import Image from "next/image"
import { CustomerOfferModal } from "../../../modal/customer-offer-modal"
import { CompanyOffers } from "./company-offers"

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
  }
}

interface RestaurantOffersProps {
  offers: Offer[]
}

export function RestaurantOffers({ offers }: RestaurantOffersProps) {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [isCompanyOffersOpen, setIsCompanyOffersOpen] = useState(false)

  console.log('Offers data:', JSON.stringify(offers, null, 2))
  offers.forEach(offer => {
    console.log(`Offer ${offer.id} images:`, offer.images)
  })

  return (
    <div className="mb-12">
      <h2 
        onClick={() => setIsCompanyOffersOpen(true)} 
        className="!text-[30px] font-bold mb-8 cursor-pointer"
      >
        Special offers ({offers.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {offers.map((offer) => (
          <div
            key={offer.id}
            onClick={() => setSelectedOffer(offer)}
            className="group relative overflow-hidden rounded-[20px] cursor-pointer"
          >
            {offer.images && offer.images.length > 0 ? (
              <div className="relative w-full h-[200px] md:w-[642px] md:h-[358px]">
                <Image
                  src={offer.images[0].url}
                  alt={offer.title}
                  fill
                  className="object-cover rounded-[20px]"
                />
              </div>
            ) : (
              <div className="relative w-full h-[200px] md:w-[642px] md:h-[358px] bg-gray-200 rounded-[20px] flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <h3 className="text-white !text-[30px] font-bold">{offer.title}</h3>
            </div>
          </div>
        ))}
      </div>

      <CustomerOfferModal
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        offer={selectedOffer || undefined}
      />

      <CompanyOffers
        isOpen={isCompanyOffersOpen}
        onClose={() => setIsCompanyOffersOpen(false)}
        offers={offers}
      />
    </div>
  )
}