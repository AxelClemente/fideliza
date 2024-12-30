'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPinIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Subscription } from '@/app/customer-dashboard/types/subscription'

interface CustomerSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  subscription?: Subscription
}

export function CustomerSubscriptionModal({ 
  isOpen, 
  onClose,
  subscription 
}: CustomerSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  if (!subscription) {
    console.log('No subscription provided')
    return null
  }

  if (!Array.isArray(subscription.places) || subscription.places.length === 0) {
    console.log('Subscription has no valid places')
    return null
  }

  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      
      const selectedPlace = subscription.places[0]
      console.log('Initiating purchase:', {
        subscriptionId: subscription.id,
        placeId: selectedPlace.id,
        amount: subscription.price
      })

      const response = await fetch('/api/user-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          placeId: selectedPlace.id,
          amount: subscription.price
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to purchase subscription')
      }

      const data = await response.json()
      console.log('Purchase successful:', data)
      
      toast.success('Subscription purchased successfully!')
      onClose()
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to purchase subscription')
    } finally {
      setIsLoading(false)
    }
  }

  console.log('CustomerSubscriptionModal - full subscription:', JSON.stringify(subscription, null, 2))
  console.log('CustomerSubscriptionModal - places array:', Array.isArray(subscription?.places))

  if (!subscription) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="
          max-w-[706px] 
          p-0 
          overflow-hidden 
          !fixed 
          !left-0
          !right-0
          !bottom-0 
          !top-0 
          !translate-x-0
          !translate-y-0 
          !rounded-none
          !h-screen
          md:!left-auto
          md:!right-[calc((100vw-1440px)/2)]
          flex
          flex-col
        "
      >
        <DialogHeader className="p-3 md:p-4 pb-0 flex-shrink-0">
          <div className="px-4 md:px-8 mt-10">
            <h2 className="
              !text-[30px]
              !font-['Open_Sans']
              font-[700]
              !leading-[36px]
              mb-8
            ">
              Subscription detail
            </h2>
            <DialogTitle className="
              !text-[40px]
              !font-['Open_Sans']
              font-[700]
              !leading-[54px]
              text-center
              
            ">
              {subscription.name}
            </DialogTitle>
            <p className="
              !text-[24px]
              !font-['Open_Sans']
              font-[700]
              !leading-[32px]
              text-center
              -mb-4
              
            ">
              ${subscription.price}/month
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-3 md:p-4">
            {/* Benefits */}
            <div className="px-4 md:px-8">
              <h3 className="
                !text-[24px]
                !font-['Open_Sans']
                !font-[400]
                !leading-[32px]
                !mb-2
              ">
                Purchase benefit:
              </h3>
              <p className="
                text-[16px] 
                md:text-[20px]               
                leading-[20px]
                md:leading-normal
                ml-10
                
                
              ">
                {subscription.benefits}
              </p>
            </div>

            {/* Places */}
            {subscription.places && subscription.places.length > 0 && (
              <div className="px-4 md:px-8">
                <h3 className="
                  !text-[24px]
                  !font-['Open_Sans']
                  !font-[400]
                  !leading-[32px]
                  mb-4
                ">
                  Where to use:
                </h3>
                <div className="space-y-4">
                  {subscription.places.map((place) => (
                    <div 
                      key={place.id}
                      className="flex items-start gap-2"
                    >
                      <MapPinIcon className="h-5 w-5 shrink-0 mt-1" />
                      <div>
                        <h4 className="
                          !text-[20px]
                          !font-['Open_Sans']
                          font-[600]
                          !leading-[26px]
                          underline
                        ">
                          {place.name}
                        </h4>
                        <p className="
                          !text-[20px]
                          !font-['Open_Sans']
                          font-[600]
                          !leading-[26px]                        
                          mt-1
                          underline
                        ">
                          {place.location}
                        </p>
                        <p className="
                          !text-[20px]
                          !font-['Open_Sans']
                          font-[600]
                          !leading-[26px]
                          mt-1
                          underline
                        ">
                          {place.phoneNumber}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Website */}
            {subscription.website && (
              <div className="px-4 md:px-8">
                <h3 className="
                  !text-[24px]
                  !font-['Open_Sans']
                  !font-[400]
                  !leading-[32px]
                  mb-4
                ">
                 
                </h3>
                <a 
                  href={subscription.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    !text-[20px]
                    !font-['Open_Sans']
                    font-[600]
                    !leading-[26px]
                    underline                 
                    hover:text-blue-800
                    
                  "
                >
                  {subscription.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="p-3 md:p-4 px-8 md:px-14 space-y-2 md:space-y-3">
          <Button 
            onClick={handlePurchase}
            disabled={isLoading}
            className="
              w-[340px]
              h-[78px]
              rounded-[100px]
              mx-auto
              mr-[250px]
              md:w-full
              md:mx-0
              bg-black 
              text-[16px] 
              font-semibold 
              leading-[20px] 
              font-['Open_Sans']
            "
          >
            {isLoading ? 'Processing...' : 'Buy'}
          </Button>
          <Button 
            variant="ghost"
            onClick={onClose}
            className="
              w-[340px]
              h-[78px]
              rounded-[100px]
              mx-auto
              mr-[250px]
              md:w-full
              md:mx-0
              bg-white
              border-2
              border-black
              text-[16px] 
              font-semibold 
              leading-[20px] 
              font-['Open_Sans']
              hover:bg-gray-100
            "
          >
            Other subscriptions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}