'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"

interface QRScanModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SubscriptionDetails {
  userName: string
  subscriptionName: string
  remainingVisits: number | null
  placeName: string
  startDate: string
  endDate: string
  status: string
  userId: string
}

export function QRScanModal({ isOpen, onClose }: QRScanModalProps) {
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setManualCode('')
      setError('')
      setSubscriptionDetails(null)
      setShowConfirmation(false)
      setIsProcessing(false)
    }
  }, [isOpen])

  const checkSubscription = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a code')
      return
    }

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

  // Función para formatear la fecha actual
  const getCurrentDateTime = () => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(new Date())
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle>
            {showConfirmation ? 'Confirm Subscription' : 'Scan Subscription QR'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center px-4">
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {!showConfirmation ? (
              <div>
                <label className="text-sm text-gray-500">Enter Code Manually:</label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-[329px] h-[78px] p-2 mt-1 rounded-[100px] bg-main-gray pl-6 border-0 
                           text-[16px] font-semibold text-third-gray
                           placeholder:text-third-gray placeholder:text-[16px] placeholder:font-semibold
                           focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Enter 8-digit code"
                  maxLength={8}
                />
              </div>
            ) : (
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg max-h-[50vh] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-2">Subscription Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">{getCurrentDateTime()}</p>
                  </div>
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
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {subscriptionDetails?.startDate ? new Date(subscriptionDetails.startDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {subscriptionDetails?.endDate ? new Date(subscriptionDetails.endDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${
                      subscriptionDetails?.status === 'ACTIVE' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {subscriptionDetails?.status}
                    </p>
                  </div>
                  {subscriptionDetails?.remainingVisits !== null && (
                    <div>
                      <p className="text-sm text-gray-500">Remaining Visits</p>
                      <p className="font-medium">{subscriptionDetails?.remainingVisits}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            <div className="flex flex-col space-y-2 pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="h-[60px] w-full rounded-[100px] bg-main-dark text-white 
                         hover:bg-main-dark/90 disabled:opacity-50 text-[16px] font-semibold"
              >
                {isProcessing 
                  ? 'Processing...' 
                  : showConfirmation 
                    ? 'Confirm Validation'
                    : 'Check Code'
                }
              </button>
              {showConfirmation && (
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="h-[60px] w-full rounded-[100px] border-[1px] border-third-gray/30 
                           text-[16px] font-semibold bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}