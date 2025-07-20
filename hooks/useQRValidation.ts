'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export interface QRValidationData {
  subscriptionId: string
  subscriptionName: string
  placeName: string
  restaurantName: string
  remainingVisits: number | null
  validatedAt: string
}

interface UseQRValidationOptions {
  qrId?: string
  onValidated?: (data: QRValidationData) => void
  enabled?: boolean
}

export function useQRValidation(options: UseQRValidationOptions) {
  const [isValidated, setIsValidated] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [validationData, setValidationData] = useState<QRValidationData | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onValidatedRef = useRef(options.onValidated)
  const { qrId, enabled = true } = options
  
  // Actualizar ref cuando cambie el callback
  onValidatedRef.current = options.onValidated

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }, [])

  const checkValidationStatus = useCallback(async () => {
    if (!qrId || !enabled) return

    try {
      const response = await fetch(`/api/qr-codes/status?qrId=${qrId}`)
      const data = await response.json()

      if (!response.ok) {
        console.error('Error checking QR status:', data.error)
        return
      }

      if (data.status === 'validated') {
        console.log('🎉 QR Code validated!', data.validationData)
        
        setIsValidated(true)
        setValidationData(data.validationData)
        stopPolling()

        // Mostrar notificación
        const remainingText = data.validationData.remainingVisits === null 
          ? 'Visitas ilimitadas' 
          : `${data.validationData.remainingVisits} visitas restantes`

        toast.success(
          `Validación exitosa en ${data.validationData.restaurantName} - ${data.validationData.placeName}. ${remainingText}`,
          { duration: 5000 }
        )

        // Llamar callback si existe
        onValidatedRef.current?.(data.validationData)
      } else if (data.status === 'expired') {
        console.log('QR Code expired')
        stopPolling()
        toast.error('El código QR ha expirado')
      }
      // Si status es 'pending', continúa polling
    } catch (error) {
      console.error('Error checking QR validation status:', error)
    }
  }, [qrId, enabled, stopPolling]) // Removí onValidated de las dependencias

  const startPolling = useCallback(() => {
    if (!qrId || !enabled || isPolling) return

    console.log('🔄 Starting QR validation polling for:', qrId)
    setIsPolling(true)
    
    // Verificar inmediatamente
    checkValidationStatus()
    
    // Luego verificar cada 2 segundos
    intervalRef.current = setInterval(checkValidationStatus, 2000)
  }, [qrId, enabled, isPolling, checkValidationStatus])

  // Efecto para iniciar/detener polling
  useEffect(() => {
    if (qrId && enabled && !isValidated) {
      startPolling()
    } else {
      stopPolling()
    }

    // Cleanup al desmontar
    return () => {
      stopPolling()
    }
  }, [qrId, enabled, isValidated, startPolling, stopPolling])

  return {
    isValidated,
    isPolling,
    validationData,
    startPolling,
    stopPolling
  }
}