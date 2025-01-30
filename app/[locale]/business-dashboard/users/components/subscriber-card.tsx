'use client'

import { Trash2 } from "lucide-react"
import { useSubscribers } from "../../context/subscribers-context"

export function SubscriberCard() {
  const { subscribers } = useSubscribers()
  
  // Eliminar duplicados basados en el ID del suscriptor
  const uniqueSubscribers = Array.from(
    new Map(subscribers.map(sub => [sub.id, sub])).values()
  )
  
  return (
    <div className="space-y-5">
      {uniqueSubscribers.length > 0 ? (
        uniqueSubscribers.map((subscriber) => (
          <div 
            key={subscriber.id} 
            className="flex items-center justify-between rounded-[20px] border bg-white w-[390px] sm:w-[476px] h-[84px] overflow-hidden ml-4 sm:ml-0"
          >
            <div className="flex items-center h-full">
              <div className="h-full w-[90px] sm:w-[106px] relative">
                <img 
                  src={subscriber.imageUrl || '/images/placeholder.png'}
                  alt={subscriber.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="px-4">
                <p className="font-medium text-base">{subscriber.name}</p>
                <p className="text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-[250px]">
                  {subscriber.email}
                </p>
                {subscriber.subscription && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-black">{subscriber.subscription.type}</span>
                    <span className="mx-1">•</span>
                    {new Date(subscriber.subscription.startDate).toLocaleDateString()}
                    <span className="mx-1">→</span>
                    {new Date(subscriber.subscription.endDate).toLocaleDateString()}
                  </p>
                )}
                {subscriber.subscription && subscriber.subscription.remainingVisits !== null && subscriber.subscription.remainingVisits !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-gray-500">{subscriber.subscription.remainingVisits} Remaining visits</span>
                  </p>
                )}
              </div>
            </div>
            
            <button className="text-black hover:text-destructive transition-colors p-4 pr-10">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))
      ) : (
        <div className="!text-[20px] text-muted-foreground hover:no-underline !font-[700] pt-3 pl-4">
          No subscribers yet
        </div>
      )}
    </div>
  )
}