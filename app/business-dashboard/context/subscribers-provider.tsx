import { getRestaurantStats } from "../utils/get-stats"
import { SubscribersProvider } from "./subscribers-context"

type SubscriptionData = {
  id: string
  type: string
  status: string
  startDate: Date
  restaurantId: string
  remainingVisits?: number
  name: string
}


export async function SubscribersDataProvider({ 
  children,
  restaurantId 
}: { 
  children: React.ReactNode
  restaurantId: string 
}) {
  const stats = await getRestaurantStats(restaurantId)
  
  console.log('Stats data:', {
    subscribers: stats.subscriptions.subscribers,
    total: stats.subscriptions.value
  })

  const initialData = {
    subscribers: stats.subscriptions.subscribers.map(subscriber => ({
      id: subscriber.id,
      name: subscriber.name,
      email: subscriber.email,
      imageUrl: subscriber.imageUrl,
      subscription: subscriber.subscription
    })),
    totalSubscribers: parseInt(stats.subscriptions.value),
    activeSubscribers: stats.subscriptions.subscribers.length
  }

  console.log('Transformed subscribers:', initialData.subscribers)

  return (
    <SubscribersProvider initialData={initialData}>
      {children}
    </SubscribersProvider>
  )
} 