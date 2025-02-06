import { getRestaurantStats } from "../utils/get-stats"
import { SubscribersProvider } from "./subscribers-context"


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
      subscription: {
        id: subscriber.subscription.id,
        type: subscriber.subscription.type,
        name: subscriber.subscription.name,
        status: subscriber.subscription.status,
        startDate: subscriber.subscription.startDate,
        endDate: subscriber.subscription.endDate,
        remainingVisits: subscriber.subscription.remainingVisits
      }
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