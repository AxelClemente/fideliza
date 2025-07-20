import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { redirect } from 'next/navigation'
import { BusinessProvider } from '../components/business-provider'
import { getTranslations } from 'next-intl/server'
import { SubscriptionsClient } from './components/subscriptions-client'

interface Subscription {
  id: string
  name: string
  benefits: string
  price: number
  website?: string
  visitsPerMonth?: number
  period?: 'MONTHLY' | 'ANNUAL'
  places: Array<{
    id: string
    name: string
    location: string
    phoneNumber: string
    restaurant: {
      id: string
      title: string
    }
  }>
}

export default async function SubscriptionsPage() {
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

  // Obtener todas las suscripciones de todos los restaurantes
  const allSubscriptions: Subscription[] = formattedRestaurants.flatMap(restaurant => 
    restaurant.places?.flatMap(place => 
      place.subscriptions?.map(subscription => ({
        id: subscription.id,
        name: subscription.name,
        benefits: subscription.benefits,
        price: subscription.price,
        website: subscription.website,
        visitsPerMonth: subscription.visitsPerMonth,
        period: subscription.period,
        places: [{
          id: place.id,
          name: place.name,
          location: place.location,
          phoneNumber: place.phoneNumber,
          restaurant: {
            id: restaurant.id,
            title: restaurant.title
          }
        }]
      })) || []
    ) || []
  ) || []

  console.log('Subscriptions page render:', { 
    hasRestaurants: Boolean(formattedRestaurants?.length),
    subscriptionsCount: allSubscriptions.length
  })

  return (
    <div className="px-4 md:container md:mx-auto md:max-w-[1440px] py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[30px] md:text-[36px] font-bold mb-4">
          {t('subscriptions')} ({allSubscriptions.length})
        </h1>
        <p className="text-gray-600 text-lg">
          Discover all available subscriptions from our partner restaurants
        </p>
      </div>

      {/* Subscriptions Grid */}
      {allSubscriptions.length > 0 ? (
        <SubscriptionsClient subscriptions={allSubscriptions} />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            No subscriptions available at the moment
          </div>
          <p className="text-gray-400">
            Check back later for new subscriptions from our partner restaurants
          </p>
        </div>
      )}
    </div>
  )
} 