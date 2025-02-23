'use client'

import { useState, useCallback } from 'react'
import { CustomerSearchWrapper } from './search-bar/customer-search-wrapper'
import { RestaurantCarousel } from './carousel'
import Image from 'next/image'
import Link from 'next/link'
import { CustomerOfferModal } from '../modal/customer-offer-modal'
import { FilterModal } from './../../customer-dashboard/modal/filter-modal'
import { useTranslations } from 'next-intl'

// Importamos la interfaz Restaurant del customer-search-wrapper
interface Subscription {
  id: string
  name: string
  price: number
  description?: string
  status?: string
  startDate?: string
  endDate?: string
}

interface Restaurant {
  id: string
  title: string
  category?: string
  subcategory?: string
  images?: Array<{
    url: string
  }>
  places?: Array<{
    id: string
    name: string
    location: string
    phoneNumber: string
    offers?: Array<{
      id: string
      title: string
      description: string
      images?: Array<{
        url: string
      }>
      website?: string
    }>
    subscriptions?: Array<Subscription>
  }>
}

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

interface DashboardClientProps {
  restaurants: Restaurant[]
  userLocation: string
}

interface FilterValues {
  category: string
  subcategory: string
  hasSubscriptions: string
  hasOffers: string
}

export function DashboardClient({ restaurants, userLocation }: DashboardClientProps) {
  const t = useTranslations('CustomerDashboard.dashboard')
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants)
  const [selectedOffer, setSelectedOffer] = useState<Offer | undefined>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Función para resetear filtros
  const handleResetFilters = useCallback(() => {
    setFilteredRestaurants(restaurants) // Restaura todos los restaurantes
    setIsFilterModalOpen(false) // Cierra el modal de filtros si está abierto
  }, [restaurants])

  const handleFilter = useCallback((filters: FilterValues) => {
    console.log('handleFilter called with filters:', filters)
    let filtered = [...restaurants]

    // Si la categoría no es "all", aplicar el filtro
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(restaurant => 
        restaurant.category === filters.category
      )
    }

    // Si la subcategoría no es "all", aplicar el filtro
    if (filters.subcategory && filters.subcategory !== 'all') {
      filtered = filtered.filter(restaurant => 
        restaurant.subcategory === filters.subcategory
      )
    }

    // Filtro de suscripciones
    if (filters.hasSubscriptions) {
      filtered = filtered.filter(restaurant => {
        // Si el filtro es "yes", buscamos restaurantes que tengan suscripciones
        if (filters.hasSubscriptions === 'yes') {
          return restaurant.places?.some(place => 
            place.subscriptions && place.subscriptions.length > 0
          )
        }
        // Si el filtro es "no", buscamos restaurantes que NO tengan suscripciones
        if (filters.hasSubscriptions === 'no') {
          return restaurant.places?.every(place => 
            !place.subscriptions || place.subscriptions.length === 0
          )
        }
        return true // Si no hay filtro, mantenemos el restaurante
      })
    }

    // Filtro de ofertas
    if (filters.hasOffers) {
      filtered = filtered.filter(restaurant => {
        // Si el filtro es "yes", buscamos restaurantes que tengan ofertas
        if (filters.hasOffers === 'yes') {
          return restaurant.places?.some(place => 
            place.offers && place.offers.length > 0
          )
        }
        // Si el filtro es "no", buscamos restaurantes que NO tengan ofertas
        if (filters.hasOffers === 'no') {
          return restaurant.places?.every(place => 
            !place.offers || place.offers.length === 0
          )
        }
        return true // Si no hay filtro, mantenemos el restaurante
      })
    }

    setFilteredRestaurants(filtered)
    setIsFilterModalOpen(false)
  }, [restaurants])

  console.log('DashboardClient render:', { 
    hasHandleFilter: typeof handleFilter === 'function',
    restaurantsLength: restaurants?.length 
  })

  return (
    <div className="px-4 md:container md:mx-auto md:max-w-[1440px] py-6">
      {/* Search and Location Bar */}
      <div className="flex items-center mb-8">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-gray-600">Home</span>
        </div>
        <div className="hidden md:block flex-1" />
        <div className="flex items-center gap-2 mx-auto md:mx-0 md:-translate-x-16">
          <Image src="/location.svg" alt="Location icon" width={24} height={24} />
          <span className="text-[16px] font-[700] md:font-semibold">My city:</span>
          <span className="text-[16px] font-[700] md:font-semibold text-third-gray underline">{userLocation}</span>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-[60px]">
        <CustomerSearchWrapper 
          restaurants={restaurants} 
          onSearch={setFilteredRestaurants}
          onFilterClick={() => setIsFilterModalOpen(true)}
        />
      </div>

      {/* Subscriptions Section */}
      <div className="mb-12">
        <div className="flex items-center mb-6 relative md:px-8">
          <h2 className="!text-[24px] md:!text-[30px] font-bold">{t('subscriptions')}</h2>
          <div className="flex-1" />
          <Link 
            href="/customer-dashboard/subscriptions" 
            onClick={(e) => {
              e.preventDefault()
              handleResetFilters()
            }}
            className="!text-[20px] md:!text-[24px] font-bold text-main-dark hover:text-gray-800 absolute right-0 md:right-12 pt-[2px] md:pt-0"
          >
            {t('seeAll')}
          </Link>
        </div>
        
        <div className="md:px-8">
          {filteredRestaurants.length > 0 && (
            <RestaurantCarousel restaurants={filteredRestaurants.slice(0, 3)} />
          )}
        </div>
      </div>

      {/* Special Offers Section */}
      <div>
        <div className="flex items-center mb-6 relative md:px-8">
          <h2 className="!text-[24px] md:!text-[30px] font-bold">{t('specialOffers')}</h2>
          <div className="flex-1" />
          <Link 
            href="/customer-dashboard/offers" 
            className="!text-[20px] md:!text-[24px] font-bold text-main-dark hover:text-gray-800 absolute right-0 md:right-12 pt-[2px] md:pt-0"
          >
            {t('seeAll')}
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:px-8">
          {filteredRestaurants.map((restaurant) => 
            restaurant.places?.map(place => 
              place.offers?.map(offer => ({
                id: offer.id,
                title: offer.title,
                description: offer.description,
                images: offer.images || [],
                website: offer.website,
                place: {
                  id: place.id,
                  name: place.name,
                  location: place.location,
                  phoneNumber: place.phoneNumber,
                  restaurant: {
                    id: restaurant.id
                  }
                }
              })).map(offer => (
                <div
                  key={offer.id}
                  onClick={() => {
                    setSelectedOffer(offer)
                    setIsModalOpen(true)
                  }}
                  className="group relative overflow-hidden rounded-lg cursor-pointer"
                >
                  {offer.images?.[0] && (
                    <div className="relative w-full h-[200px] lg:w-[642px] lg:h-[358px]">
                      <Image
                        src={offer.images[0].url}
                        alt={offer.title}
                        fill
                        className="object-cover rounded-[20px]"
                      />
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </div>

      <CustomerOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        offer={selectedOffer}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onFilter={handleFilter}
      />
    </div>
  )
} 