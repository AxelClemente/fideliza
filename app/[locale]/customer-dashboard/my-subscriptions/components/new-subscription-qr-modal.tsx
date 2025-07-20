'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QRCode from "react-qr-code"
import { useEffect, useState } from "react"
import { useQRValidation } from "@/hooks/useQRValidation"
import { useSubscriptionRefresh } from "@/hooks/useSubscriptionRefresh"

interface NewSubscriptionQRModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionData: {
    id: string
    remainingVisits: number | null
    place: {
      name: string
      restaurant: {
        title: string
      }
    }
  }
}

export function NewSubscriptionQRModal({ isOpen, onClose, subscriptionData }: NewSubscriptionQRModalProps) {
  console.log('🔧 New QR Modal rendered', { isOpen, subscriptionId: subscriptionData.id })
  
  const [qrData, setQrData] = useState<{ code: string; qrId: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { refreshSubscriptions } = useSubscriptionRefresh()
  
  // Hook para detectar validación - TEMPORALMENTE DESHABILITADO
  // const { isValidated, isPolling } = useQRValidation({
  //   qrId: qrData?.qrId,
  //   enabled: isOpen && !!qrData,
  //   onValidated: (validationData) => {
  //     console.log('🎉 Validation received in NEW QR Modal:', validationData)
  //     console.log('🔒 Closing modal for subscription:', subscriptionData.id)
      
  //     // Refrescar las suscripciones para actualizar visitas restantes
  //     refreshSubscriptions()
      
  //     // Cerrar el modal automáticamente cuando se valide
  //     onClose()
  //   }
  // })
  const isPolling = false // temporal

  useEffect(() => {
    if (isOpen && !qrData) {
      generateQRCode()
    }
    if (!isOpen) {
      setQrData(null)
    }
  }, [isOpen]) // Simplificar dependencias

  const generateQRCode = async () => {
    try {
      setIsGenerating(true)
      console.log('Generating NEW QR code for subscription:', subscriptionData.id)
      
      const response = await fetch('/api/qr-codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionData.id,
        }),
      })

      const data = await response.json()
      console.log('NEW QR API Response:', data)

      if (!response.ok) {
        console.error('NEW QR API Error:', data.error)
        return
      }

      if (data.success && data.code && data.qrId) {
        console.log('NEW QR Code generated successfully:', data.code)
        setQrData({ code: data.code, qrId: data.qrId })
      }
    } catch (error) {
      console.error('Error generating NEW QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!qrData && !isGenerating) {
    return null
  }

  const qrValue = qrData ? JSON.stringify({
    code: qrData.code
  }) : ''

  console.log('Rendering NEW QR with value:', qrValue, 'isPolling:', isPolling)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Subscription QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          {isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <span className="ml-2">Generating QR code...</span>
            </div>
          ) : qrData ? (
            <>
              <QRCode
                value={qrValue}
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
              <p className="mt-4 text-sm text-center text-gray-500">
                Show this QR code at {subscriptionData.place.restaurant.title}
              </p>
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Numeric Code:</p>
                <p className="text-2xl font-bold tracking-wider text-center">
                  {qrData.code.match(/.{1,4}/g)?.join(' ')}
                </p>
              </div>
              {isPolling && (
                <div className="mt-4 flex items-center text-sm text-blue-600">
                  <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Waiting for validation...
                </div>
              )}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}