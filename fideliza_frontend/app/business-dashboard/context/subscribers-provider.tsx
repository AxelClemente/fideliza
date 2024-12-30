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
  
  const initialData = {
    subscribers: stats.subscriptions.subscribers || [],
    totalSubscribers: parseInt(stats.subscriptions.value),
    activeSubscribers: stats.subscriptions.subscribers?.length || 0
  }

  return (
    <SubscribersProvider initialData={initialData}>
      {children}
    </SubscribersProvider>
  )
} 