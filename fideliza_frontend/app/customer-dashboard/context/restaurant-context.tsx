// app/customer-dashboard/context/restaurant-context.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Restaurant {
  id: string
  title: string
  images?: Array<{ url: string }>
  places?: Array<{
    id: string
    offers?: Array<{
      id: string
      title: string
      images?: Array<{ url: string }>
    }>
  }>
}

interface RestaurantContextType {
  filteredRestaurants: Restaurant[]
  setFilteredRestaurants: (restaurants: Restaurant[]) => void
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined)

export function RestaurantProvider({ 
  children, 
  initialRestaurants 
}: { 
  children: ReactNode
  initialRestaurants: Restaurant[] 
}) {
  const [filteredRestaurants, setFilteredRestaurants] = useState(initialRestaurants)

  return (
    <RestaurantContext.Provider value={{ filteredRestaurants, setFilteredRestaurants }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurants() {
  const context = useContext(RestaurantContext)
  if (context === undefined) {
    throw new Error('useRestaurants must be used within a RestaurantProvider')
  }
  return context
}