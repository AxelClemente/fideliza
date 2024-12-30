'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QRCode from "react-qr-code"

interface SubscriptionQRModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionData: {
    id: string
    place: {
      name: string
      restaurant: {
        title: string
      }
    }
  }
}

export function SubscriptionQRModal({ isOpen, onClose, subscriptionData }: SubscriptionQRModalProps) {
  // Creamos un objeto con la información que queremos codificar
  const qrValue = JSON.stringify({
    subscriptionId: subscriptionData.id,
    timestamp: new Date().toISOString(),
    restaurantName: subscriptionData.place.restaurant.title,
    placeName: subscriptionData.place.name,
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
        </div>
      </DialogContent>
    </Dialog>
  )
}