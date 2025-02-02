import { notFound, redirect } from "next/navigation"
import { BusinessProvider } from "../../components/business-provider"
import { RestaurantInfo } from "./components/restaurant-info"
import { RestaurantOffers } from "./components/restaurant-offers"
import { RestaurantPlaces } from "./components/restaurant-places"
import { ViewTracker } from './components/view-tracker'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { getAuthRedirectUrl } from '@/lib/auth-utils'

interface Place {
  id: string
  name: string
  location: string
  phoneNumber: string
  subscriptions: Array<{
    id: string
    name: string
    benefits: string
    price: number
    website?: string
    visitsPerMonth?: number
  }>
  offers: Array<{
    id: string
    title: string
    description: string
    website?: string
    images: Array<{
      url: string
    }>
    place?: {
      id: string
      name: string
      location: string
      phoneNumber: string
    }
  }>
}

interface Restaurant {
  id: string
  title: string
  description: string
  images: Array<{ url: string }>
  places: Place[]
}

interface RestaurantPageProps {
  params: Promise<{
    restaurantId: string
  }>
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const session = await getServerSession(authOptions)
  const { restaurantId } = await params

  if (!session?.user?.id) {
    const returnUrl = `/customer-dashboard/restaurants/${restaurantId}`
    redirect(getAuthRedirectUrl(returnUrl))
  }

  try {
    const { getRestaurantById } = await BusinessProvider()
    const restaurant = await getRestaurantById(restaurantId) as Restaurant | null

    if (!restaurant) {
      notFound()
    }

    console.log('Restaurant data:', JSON.stringify({
      places: restaurant?.places?.map(place => ({
        id: place.id,
        subscriptions: place.subscriptions?.map(sub => ({
          id: sub.id,
          name: sub.name,
          visitsPerMonth: sub.visitsPerMonth
        }))
      }))
    }, null, 2))

    const subscriptions = restaurant.places?.flatMap(place => 
      (place.subscriptions || []).map(subscription => ({
        ...subscription,
        visitsPerMonth: subscription.visitsPerMonth,
        places: [{
          id: place.id,
          name: place.name,
          location: place.location,
          phoneNumber: place.phoneNumber
        }]
      }))
    ) || [];
    const offers = restaurant.places?.flatMap(place => 
      (place.offers || []).map(offer => ({
        ...offer,
        place: {
          id: place.id,
          name: place.name,
          location: place.location,
          phoneNumber: place.phoneNumber
        }
      }))
    ) || []

    return (
      <div className="flex flex-col w-full">
        <ViewTracker restaurantId={restaurant.id} />
        
        <div className="w-full">
          <RestaurantInfo 
            restaurant={restaurant} 
            subscriptions={subscriptions}
          />
        </div>

        <div className="container mx-auto px-4 md:container md:mx-auto md:max-w-[1440px] py-8">
          <div className="md:px-8">
            <RestaurantPlaces 
              places={restaurant.places || []} 
            />
            <RestaurantOffers 
              offers={offers} 
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading restaurant:', error)
    notFound()
  }
}