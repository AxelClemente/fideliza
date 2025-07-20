'use client'

import { useCallback } from 'react'

export function useSubscriptionRefresh() {
  const refreshSubscriptions = useCallback(() => {
    // Disparar evento personalizado para refrescar las suscripciones
    window.dispatchEvent(new CustomEvent('refreshSubscriptions'))
  }, [])

  return { refreshSubscriptions }
}