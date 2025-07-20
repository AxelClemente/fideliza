import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { redirect } from 'next/navigation'
import { BusinessProvider } from '../components/business-provider'
import { getTranslations } from 'next-intl/server'
import { OffersClient } from './components/offers-client'

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

export default async function OffersPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('CustomerDashboard.dashboard')
  
  if (!session?.user?.id) {
    redirect('/auth?mode=signin')
  }

  const { restaurants } = await BusinessProvider()

  // Transformamos los datos para que coincidan con la interfaz esperada
  const formattedRestaurants = restaurants?.map(restaurant => ({
    ...restaurant,
    places: restaurant.places?.map(place => ({
      ...place,
      phoneNumber: place.phoneNumber || '',
    }))
  })) || []

  // Obtener todas las ofertas de todos los restaurantes
  const allOffers: Offer[] = formattedRestaurants.flatMap(restaurant => 
    restaurant.places?.flatMap(place => 
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
      })) || []
    ) || []
  ) || []

  console.log('Offers page render:', { 
    hasRestaurants: Boolean(formattedRestaurants?.length),
    offersCount: allOffers.length
  })

  return (
    <div className="px-4 md:container md:mx-auto md:max-w-[1440px] py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[30px] md:text-[36px] font-bold mb-4">
          {t('specialOffers')} ({allOffers.length})
        </h1>
        <p className="text-gray-600 text-lg">
          Discover all special offers from our partner restaurants
        </p>
      </div>

      {/* Offers Grid */}
      {allOffers.length > 0 ? (
        <OffersClient offers={allOffers} />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            No special offers available at the moment
          </div>
          <p className="text-gray-400">
            Check back later for new offers from our partner restaurants
          </p>
        </div>
      )}
    </div>
  )
} 