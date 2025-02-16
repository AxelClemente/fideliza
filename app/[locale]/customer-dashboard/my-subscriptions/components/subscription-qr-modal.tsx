'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QRCode from "react-qr-code"

interface SubscriptionQRModalProps {
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

export function SubscriptionQRModal({ isOpen, onClose, subscriptionData }: SubscriptionQRModalProps) {
  // Generamos un timestamp en milisegundos
  const timestamp = new Date().getTime();
  
  // Log para debug
  console.log('Generating QR for subscription CHECKKKKKKKK:', {
    id: subscriptionData.id,
    remainingVisits: subscriptionData.remainingVisits,
    timestamp
  });
  
  // Combinamos el ID de la suscripción con el timestamp para generar un código único
  const numericCode = (subscriptionData.id + timestamp)
    .replace(/[^0-9]/g, '')  // Removemos caracteres no numéricos
    .slice(-8);              // Tomamos los últimos 8 dígitos
    
  const qrValue = JSON.stringify({
    subscriptionId: subscriptionData.id,
    timestamp: new Date().toISOString(),
    restaurantName: subscriptionData.place.restaurant.title,
    placeName: subscriptionData.place.name,
    numericCode,
    remainingVisits: subscriptionData.remainingVisits,
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Subscription QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
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
              {numericCode.match(/.{1,4}/g)?.join(' ')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}