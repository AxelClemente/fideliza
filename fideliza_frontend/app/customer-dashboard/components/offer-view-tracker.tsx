'use client'

import { useEffect, useRef } from 'react'

interface OfferViewTrackerProps {
  offerId: string
}

export function OfferViewTracker({ offerId }: OfferViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!hasTracked.current) {
      fetch('/api/views/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offerId })
      })
      hasTracked.current = true
    }
  }, [offerId])

  return null
} 