'use client'

import { useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface QRData {
  subscriptionId: string
  timestamp: string
  restaurantName: string
  placeName: string
}

export function QRScanner() {
  const [scannedData, setScannedData] = useState<QRData | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (!isScanning) return

    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    }, false)

    scanner.render(onScanSuccess, onScanError)

    function onScanSuccess(decodedText: string) {
      try {
        const data: QRData = JSON.parse(decodedText)
        setScannedData(data)
        scanner.clear()
        setIsScanning(false)
        verifySubscription(data)
      } catch (_) {
        toast.error('Invalid QR Code')
      }
    }

    function onScanError(errorMessage: string) {
      console.warn('Scanning in progress...', errorMessage)
    }

    return () => {
      scanner.clear()
    }
  }, [isScanning])

  async function verifySubscription(data: QRData) {
    try {
      const response = await fetch('/api/business/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: data.subscriptionId,
          timestamp: data.timestamp,
        }),
      })

      const result = await response.json()

      if (result.valid) {
        toast.success('Valid subscription!')
      } else {
        toast.error('Invalid or expired subscription')
      }
    } catch (_) {
      toast.error('Error verifying subscription')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!isScanning && !scannedData && (
        <Button onClick={() => setIsScanning(true)}>
          Start Scanning
        </Button>
      )}

      {isScanning && (
        <>
          <div id="reader" className="w-full max-w-sm" />
          <Button variant="outline" onClick={() => setIsScanning(false)}>
            Cancel
          </Button>
        </>
      )}

      {scannedData && (
        <div className="text-center">
          <h3 className="text-lg font-semibold">Subscription Details</h3>
          <p>Restaurant: {scannedData.restaurantName}</p>
          <p>Location: {scannedData.placeName}</p>
          <p>Scanned at: {new Date().toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  )
}