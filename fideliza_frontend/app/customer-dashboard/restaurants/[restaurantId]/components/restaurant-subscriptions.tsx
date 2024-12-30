interface Subscription {
  id: string
  name: string
  benefits: string
  price: number
  website?: string
  createdAt: Date
  updatedAt: Date
}

interface RestaurantSubscriptionsProps {
  subscriptions: Subscription[]
}

export function RestaurantSubscriptions({ subscriptions }: RestaurantSubscriptionsProps) {
  return (
    <div className="w-full md:w-[400px]">
      <h2 className="text-xl font-semibold mb-4">
        Subscriptions ({subscriptions.length})
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {subscriptions.map((sub, index) => (
          <div 
            key={index} 
            className="p-4 border rounded-lg text-center hover:border-primary transition-colors"
          >
            <h3 className="font-medium">{sub.name}</h3>
            <p className="text-lg font-bold">
              ${sub.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}