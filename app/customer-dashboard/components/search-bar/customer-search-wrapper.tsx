// app/customer-dashboard/components/customer-search-wrapper.tsx
'use client'

import { SearchSection } from './search-section'

interface Restaurant {
  id: string
  title: string
  images?: Array<{
    url: string
  }>
  places?: Array<{
    id: string
    offers?: Array<{
      id: string
      title: string
      images?: Array<{
        url: string
      }>
    }>
  }>
}

interface CustomerSearchWrapperProps {
  restaurants: Restaurant[]
  onSearch: (filtered: Restaurant[]) => void
  onFilterClick: () => void
}

export function CustomerSearchWrapper({ 
  restaurants, 
  onSearch,
  onFilterClick 
}: CustomerSearchWrapperProps) {
  function handleSearch(searchTerm: string) {
    if (!searchTerm?.trim()) {
      onSearch(restaurants)
      return
    }

    const filtered = restaurants.filter(restaurant => {
      const restaurantTitle = restaurant?.title || ''
      return restaurantTitle.toLowerCase().includes(searchTerm.toLowerCase())
    })
    
    onSearch(filtered)
  }

  return (
    <div>
      <SearchSection 
        onSearch={handleSearch} 
        onFilterClick={onFilterClick}
      />
    </div>
  )
}