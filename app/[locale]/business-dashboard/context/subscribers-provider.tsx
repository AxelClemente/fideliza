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

  // Agrupar suscripciones por usuario
  const subscriberMap = new Map();
  
  stats.subscriptions.subscribers.forEach(subscriber => {
    if (!subscriberMap.has(subscriber.id)) {
      // Si es la primera vez que vemos este usuario, inicializamos su entrada
      subscriberMap.set(subscriber.id, {
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
        },
        subscriptions: [{
          id: subscriber.subscription.id,
          type: subscriber.subscription.type,
          name: subscriber.subscription.name,
          status: subscriber.subscription.status,
          startDate: subscriber.subscription.startDate,
          endDate: subscriber.subscription.endDate,
          remainingVisits: subscriber.subscription.remainingVisits
        }]
      });
    } else {
      // Si ya hemos visto este usuario, agregamos esta suscripción a su lista
      const existingSubscriber = subscriberMap.get(subscriber.id);
      existingSubscriber.subscriptions.push({
        id: subscriber.subscription.id,
        type: subscriber.subscription.type,
        name: subscriber.subscription.name,
        status: subscriber.subscription.status,
        startDate: subscriber.subscription.startDate,
        endDate: subscriber.subscription.endDate,
        remainingVisits: subscriber.subscription.remainingVisits
      });
    }
  });
  
  // Convertir el mapa a un array
  const uniqueSubscribers = Array.from(subscriberMap.values());

  const initialData = {
    subscribers: uniqueSubscribers,
    totalSubscribers: parseInt(stats.subscriptions.value),
    activeSubscribers: uniqueSubscribers.length
  }

  console.log('Transformed subscribers with multiple subscriptions:', initialData.subscribers)

  return (
    <SubscribersProvider initialData={initialData}>
      {children}
    </SubscribersProvider>
  )
} 