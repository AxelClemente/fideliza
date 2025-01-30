'use client'

import { createContext, useContext } from 'react'
import { SubscriptionStatus } from '@prisma/client'

type Subscriber = {
  id: string
  name: string
  email: string
  imageUrl?: string
  subscription: {
    type: string
    name: string
    status: SubscriptionStatus
    startDate: Date
    endDate: Date
    remainingVisits: number | null | undefined
  }
}

type SubscribersContextType = {
  subscribers: Subscriber[]
  totalSubscribers: number
  activeSubscribers: number
}

const SubscribersContext = createContext<SubscribersContextType | undefined>(undefined)

export function useSubscribers() {
  const context = useContext(SubscribersContext)
  if (!context) {
    throw new Error('useSubscribers must be used within a SubscribersProvider')
  }
  return context
}

export function SubscribersProvider({ 
  children, 
  initialData 
}: { 
  children: React.ReactNode
  initialData: SubscribersContextType 
}) {
  return (
    <SubscribersContext.Provider value={initialData}>
      {children}
    </SubscribersContext.Provider>
  )
} 