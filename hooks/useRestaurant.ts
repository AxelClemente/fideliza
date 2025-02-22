import { useState, useEffect } from 'react'
import { Restaurant } from '@/app/[locale]/business-dashboard/shop/types/types'

export function useRestaurant() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        // Actualizada la URL al endpoint correcto
        const response = await fetch('/api/restaurant', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch restaurant')
        }

        const data = await response.json()
        setRestaurant(data)
      } catch (err) {
        console.error('Error fetching restaurant:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [])

  return { restaurant, loading, error }
} 