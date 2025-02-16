'use client'

import { createContext, useContext, useState } from 'react'

interface QRContextType {
  isQRModalOpen: boolean
  setIsQRModalOpen: (open: boolean) => void
  canShowQRScan: boolean
}

const QRContext = createContext<QRContextType | undefined>(undefined)

interface QRProviderProps {
  children: React.ReactNode
  restaurantId?: string
}

export function QRProvider({ children, restaurantId }: QRProviderProps) {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  
  const canShowQRScan = Boolean(restaurantId && restaurantId !== "default")
  
  console.log('QR Context - Restaurant ID:', restaurantId)
  console.log('QR Context - Can Show QR:', canShowQRScan)

  return (
    <QRContext.Provider value={{ isQRModalOpen, setIsQRModalOpen, canShowQRScan }}>
      {children}
    </QRContext.Provider>
  )
}

export function useQR() {
  const context = useContext(QRContext)
  if (context === undefined) {
    throw new Error('useQR must be used within a QRProvider')
  }
  return context
}