'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

interface QRScanModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SubscriptionDetails {
  userName: string
  subscriptionName: string
  remainingVisits: number | null
  placeName: string
}

export function QRScanModal({ isOpen, onClose }: QRScanModalProps) {
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const checkSubscription = async () => {
    setError('')
    setIsProcessing(true)
    setShowConfirmation(false)

    try {
      console.log('Checking code:', manualCode)
      
      const response = await fetch('/api/validate-subscription/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: manualCode }),
      })

      const data = await response.json()
      console.log('Check response:', data)

      if (response.ok && data.subscription) {
        setSubscriptionDetails(data.subscription)
        setShowConfirmation(true)
      } else {
        setError(data.error || 'Invalid code')
      }
    } catch (error) {
      console.error('Error checking code:', error)
      setError('Error checking code')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!showConfirmation) {
      await checkSubscription()
      return
    }

    setError('')
    setIsProcessing(true)

    try {
      console.log('Validating code:', manualCode)
      
      const response = await fetch('/api/validate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: manualCode }),
      })

      const data = await response.json()
      console.log('Validation response:', data)

      if (response.ok) {
        setManualCode('')
        setSubscriptionDetails(null)
        setShowConfirmation(false)
        onClose()
      } else {
        setError(data.error || 'Error validating code')
      }
    } catch (error) {
      console.error('Error processing code:', error)
      setError('Error processing code')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showConfirmation ? 'Confirm Subscription' : 'Scan Subscription QR'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {!showConfirmation ? (
              <div>
                <label className="text-sm text-gray-500">Enter Code Manually:</label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full p-2 mt-1 border rounded-md"
                  placeholder="Enter 8-digit code"
                  maxLength={8}
                />
              </div>
            ) : (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">Subscription Details</h3>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{subscriptionDetails?.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subscription</p>
                  <p className="font-medium">{subscriptionDetails?.subscriptionName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Place</p>
                  <p className="font-medium">{subscriptionDetails?.placeName}</p>
                </div>
                {subscriptionDetails?.remainingVisits !== null && (
                  <div>
                    <p className="text-sm text-gray-500">Remaining Visits</p>
                    <p className="font-medium">{subscriptionDetails?.remainingVisits}</p>
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            <div className="flex gap-3">
              {showConfirmation && (
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 p-2 text-black bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 p-2 text-white bg-black rounded-md hover:bg-black/80 disabled:opacity-50"
              >
                {isProcessing 
                  ? 'Processing...' 
                  : showConfirmation 
                    ? 'Confirm Validation'
                    : 'Check Code'
                }
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}