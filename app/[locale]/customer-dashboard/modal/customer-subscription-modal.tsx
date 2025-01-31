'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPinIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Subscription } from '@/app/[locale]/customer-dashboard/types/subscription'

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
  
  console.log('🔍 Modal Subscription Data:', {
    subscription,
    visitsPerMonth: subscription?.visitsPerMonth,
    places: subscription?.places
  })

  if (!subscription) {
    console.log('❌ No subscription provided')
    return null
  }

  if (!Array.isArray(subscription.places) || subscription.places.length === 0) {
    console.log('❌ Subscription has no valid places')
    return null
  }

  console.log('✅ Rendering modal with visits:', subscription.visitsPerMonth)

  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      
      const selectedPlace = subscription.places[0]
      console.log('Initiating purchase:', {
        subscriptionId: subscription.id,
        placeId: selectedPlace.id,
        amount: subscription.price,
        visitsPerMonth: subscription.visitsPerMonth
      })

      const response = await fetch('/api/user-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          placeId: selectedPlace.id,
          amount: subscription.price,
          initialVisits: subscription.visitsPerMonth
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
        <div className="h-[100dvh] bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto">
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
                  max-md:mb-8
                  md:-mb-4
                ">
                  ${subscription.price}/month
                </p>
                {subscription.visitsPerMonth && (
                  <p className="
                    !text-[20px]
                    !font-['Open_Sans']
                    font-[600]
                    !leading-[26px]
                    text-center
                    text-[#7B7B7B]
                    mt-4
                  ">
                    {subscription.visitsPerMonth} visits per month
                  </p>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-6 p-3 md:p-4 pb-[200px]">
              {/* Benefits */}
              <div className="px-4 md:px-8">
                <h3 className="
                  !text-[20px]
                  !font-['Open_Sans']
                  !font-semibold
                  !leading-[26px]
                  !mb-2
                  md:!text-[24px]
                  md:!font-semibold
                  md:!leading-[32px]
                ">
                  Purchase benefit:
                </h3>
                <p className="
                  text-[18px]
                  font-normal
                  leading-[24px]
                  ml-10
                  md:text-[20px]
                  md:leading-normal
                ">
                  {subscription.benefits}
                </p>
              </div>

              {/* Places */}
              {subscription.places && subscription.places.length > 0 && (
                <div className="px-4 md:px-8">
                  <h3 className="
                    !text-[20px]
                    !font-['Open_Sans']
                    !font-semibold
                    !leading-[26px]
                    mb-4
                    md:!text-[24px]
                    md:!font-semibold
                    md:!leading-[32px]
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
                        <div className="flex items-center flex-wrap">
                          <span className="
                            !text-[18px]
                            !font-['Open_Sans']
                            font-[600]
                            !leading-[24px]
                            underline
                            md:!text-[20px]
                            md:!leading-[26px]
                          ">
                            {place.name}
                          </span>
                          <span>,</span>
                          <span className="
                            !text-[18px]
                            !font-['Open_Sans']
                            font-[600]
                            !leading-[24px]
                            underline
                            md:!text-[20px]
                            md:!leading-[26px]
                          ">
                            {place.location}
                          </span>
                          <span>,</span>
                          <span className="
                            !text-[18px]
                            !font-['Open_Sans']
                            font-[600]
                            !leading-[24px]
                            underline
                            md:!text-[20px]
                            md:!leading-[26px]
                          ">
                            {place.phoneNumber}.
                          </span>
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
          <div className="
            bg-white 
            p-3 
            md:p-4 
            md:px-14
            space-y-2 
            md:space-y-3
            border-t 
            border-gray-100
          ">
            <Button 
              onClick={handlePurchase}
              disabled={isLoading}
              className="
                w-[390px]
                h-[78px]
                rounded-[100px]
                mx-auto
                md:w-full
                md:mx-0
                bg-black 
                !text-[18px]
                !font-semibold 
                !leading-[22px]
                !font-['Open_Sans']
                md:!text-[16px]
                md:!leading-[20px]
              "
            >
              {isLoading ? 'Processing...' : 'Buy'}
            </Button>
            
            <Button 
              variant="ghost"
              onClick={onClose}
              className="
                w-[390px]
                h-[78px]
                rounded-[100px]
                mx-auto
                md:w-full
                md:mx-0
                bg-white
                border-2
                border-black
                !text-[18px]
                !font-semibold 
                !leading-[22px]
                !font-['Open_Sans']
                md:!text-[16px]
                md:!leading-[20px]
                hover:bg-gray-100
              "
            >
              Other subscriptions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}