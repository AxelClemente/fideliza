import { RestaurantProvider } from './shop/components/restaurant-provider'
import AnalyticsDashboard from "./components/chart"
import { Breadcrumb } from "@/app/[locale]/business-dashboard/components/breadcrumb"
import { getRestaurantStats } from './utils/get-stats'

export default async function BusinessDashboardPage() {
  const { restaurants } = await RestaurantProvider()
  
  // Obtenerr estadísticas antes de renderizar
  const viewStats = restaurants.length > 0 
    ? await getRestaurantStats(restaurants[0].id)
    : {
        views: {
          value: "0",
          change: "0%",
          changeType: "positive" as const
        },
        earnings: {
          value: "€0",
          change: "0%",
          changeType: "positive" as const
        },
        subscriptions: {
          value: "0",
          change: "0%",
          changeType: "positive" as const
        },
        offerViews: []
      }
  
  const featuredOffers = restaurants
    .flatMap(restaurant => 
      restaurant.places.flatMap(place => 
        place.offers.map(offer => ({
          id: offer.id,
          title: offer.title,
          images: offer.images,
          placeName: place.name
        }))
      )
    )
    .filter(offer => offer.images?.length > 0)
    .slice(-2)

  return (
    <div >
      <div className="mb-4">
        <Breadcrumb />
      </div>
      <AnalyticsDashboard 
        featuredOffers={featuredOffers}
        viewStats={viewStats}
      />
    </div>
  )
}