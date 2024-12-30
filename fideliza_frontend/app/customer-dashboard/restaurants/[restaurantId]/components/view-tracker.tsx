'use client'

import { useEffect, useRef } from 'react'

interface ViewTrackerProps {
  restaurantId: string
}

export function ViewTracker({ restaurantId }: ViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!hasTracked.current) {
      fetch('/api/views/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restaurantId })
      })
      hasTracked.current = true
    }
  }, [restaurantId])

  return null
} 