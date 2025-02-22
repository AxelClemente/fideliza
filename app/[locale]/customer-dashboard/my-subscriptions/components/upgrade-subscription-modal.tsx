'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPinIcon } from "lucide-react"
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback } from 'react'

interface UpgradeSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  currentSubscription: {
    id: string
    subscription: {
      name: string
      benefits: string
      visitsPerMonth: number | null
    }
    place: {
      name: string
      restaurant: {
        title: string
        images: Array<{
          url: string
        }>
        places?: Array<{
          id: string
          name: string
          location: string
          subscriptions: Array<{
            id: string
            name: string
            benefits: string
            price: number
            visitsPerMonth: number | null
            period: 'MONTHLY' | 'ANNUAL'
          }>
        }>
      }
    }
    status: string
    nextPayment: Date
    amount: number
    period: 'MONTHLY' | 'ANNUAL'
    remainingVisits: number | null
  } | null
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const formatPeriod = (period: 'MONTHLY' | 'ANNUAL') => {
  return period === 'MONTHLY' ? '/month' : '/year'
}

export function UpgradeSubscriptionModal({
  isOpen,
  onClose,
  currentSubscription
}: UpgradeSubscriptionModalProps) {
  // Obtener suscripciones únicas basadas en el ID y filtrar las del mismo precio
  const allRestaurantSubscriptions = currentSubscription?.place.restaurant.places?.reduce((acc, place) => {
    place.subscriptions.forEach(sub => {
      // Ignorar suscripciones con el mismo precio que la actual
      if (sub.price === currentSubscription.amount) {
        return;
      }

      const existingSub = acc.find(s => s.id === sub.id);
      if (!existingSub) {
        acc.push({
          ...sub,
          places: [{
            id: place.id,
            name: place.name,
            location: place.location
          }]
        });
      } else {
        // Agregar la ubicación al subscription existente si no está ya incluida
        if (!existingSub.places.some(p => p.id === place.id)) {
          existingSub.places.push({
            id: place.id,
            name: place.name,
            location: place.location
          });
        }
      }
    });
    return acc;
  }, [] as Array<{
    id: string;
    name: string;
    benefits: string;
    price: number;
    visitsPerMonth: number | null;
    places: Array<{
      id: string;
      name: string;
      location: string;
    }>;
    period: 'MONTHLY' | 'ANNUAL';
  }>) || [];

  console.log('Current subscription:', currentSubscription);
  console.log('All restaurant subscriptions:', allRestaurantSubscriptions);

  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  if (!currentSubscription) return null

  const handleUpgradeClick = async (subscription: {
    id: string
    name: string
    price: number
    places: Array<{ id: string }>
    period: 'MONTHLY' | 'ANNUAL'
  }) => {
    try {
      if (!subscription.places?.[0]) {
        throw new Error('No place available for this subscription')
      }

      setIsLoading(subscription.id)
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          placeId: subscription.places[0].id,
          price: subscription.price,
          name: subscription.name,
          isUpgrade: true,
          currentSubscriptionId: currentSubscription.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      const { error } = await stripe!.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Failed to initiate upgrade', {
        description: 'Please try again later'
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full p-0 overflow-hidden !fixed !left-0 !right-0 !translate-x-0 !translate-y-0 !rounded-none !top-0 flex flex-col bg-white h-screen">
        <DialogHeader className="p-3 md:p-4 pb-0 flex-shrink-0">
          <DialogTitle className="!text-[30px] !font-['Open_Sans'] font-[700] !leading-[36px] -mb-6 text-center px-4 md:px-8 mt-10">
            Available Subscriptions
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Vista Desktop */}
          <div className="md:grid md:grid-cols-3 md:gap-6 p-6 hidden">
            {/* Current Plan */}
            <div className="border-2 border-[#2e29af] rounded-[20px] p-6 flex flex-col w-[389px] h-[600px]">
              <div className="text-center mb-6">
                <h3 className="text-[24px] font-['Open_Sans'] font-[700] text-[#2e29af]">
                  Current Plan
                </h3>
                <p className="text-[20px] font-['Open_Sans'] font-[700]">
                  {currentSubscription?.amount}€{formatPeriod(currentSubscription?.period || 'MONTHLY')}
                </p>
                <p className="text-[16px] font-['Open_Sans'] text-gray-600 mt-2">
                  Valid until: {formatDate(currentSubscription?.nextPayment)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[16px] font-['Open_Sans'] font-[400] mb-2">
                    Benefits:
                  </h4>
                  <p className="text-[14px] font-['Open_Sans'] ml-4">
                    {currentSubscription.subscription.benefits}
                  </p>
                </div>

                {currentSubscription.subscription.visitsPerMonth && (
                  <div>
                    <h4 className="text-[16px] font-['Open_Sans'] font-[400] mb-2">
                      Visits:
                    </h4>
                    <p className="text-[14px] font-['Open_Sans'] ml-4">
                      {currentSubscription.remainingVisits} of {currentSubscription.subscription.visitsPerMonth} remaining
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Available Subscriptions */}
            {allRestaurantSubscriptions.map((subscription) => (
              <div 
                key={subscription.id}
                className="border-2 border-black rounded-[20px] p-6 flex flex-col w-[389px] h-[600px] transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg bg-white"
              >
                <div className="flex-1 space-y-6">
                  <div className="text-center">
                    <h3 className="!text-[24px] !font-['Open_Sans'] font-[700] !leading-[32.68px] -mb-2">
                      {subscription.name}
                    </h3>
                    <p className="!text-[20px] !font-['Open_Sans'] font-[700] !leading-[32px]">
                      ${subscription.price}{formatPeriod(subscription.period)}
                    </p>
                  </div>

                  <div>
                    <h4 className="!text-[16px] !font-['Open_Sans'] !font-[400] !leading-[32px] !mb-2">
                      Purchase benefit:
                    </h4>
                    <p className="!text-[14px] !font-['Open_Sans'] leading-normal ml-10">
                      {subscription.benefits}
                    </p>
                  </div>

                  {subscription.places?.length > 0 && (
                    <div>
                      <h4 className="!text-[16px] !font-['Open_Sans'] !font-[400] !leading-[32px] mb-4">
                        Where to use:
                      </h4>
                      <div className="space-y-4">
                        {subscription.places.map((place) => (
                          <div key={place.id} className="flex items-start gap-2">
                            <MapPinIcon className="h-5 w-5 shrink-0 mt-1" />
                            <div>
                              <h5 className="!text-[14px] !font-['Open_Sans'] font-[600] !leading-[26px] underline">
                                {place.name}
                              </h5>
                              <p className="!text-[14px] !font-['Open_Sans'] font-[600] !leading-[26px] underline">
                                {place.location}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleUpgradeClick(subscription)}
                  disabled={isLoading === subscription.id}
                  className="w-full h-[78px] rounded-[100px] bg-black text-[16px] font-semibold mt-6"
                >
                  {isLoading === subscription.id ? 'Processing...' : 
                    subscription.price > currentSubscription.amount ? 'Upgrade to this plan' : 
                    subscription.price < currentSubscription.amount ? 'Downgrade to this plan' :
                    'Switch to this plan'
                  }
                </Button>
              </div>
            ))}
          </div>

          {/* Vista Móvil (Carousel) */}
          <div className="md:hidden">
            <div className="relative">
              <div className="overflow-visible" ref={emblaRef}>
                <div className="flex gap-4 p-6">
                  {/* Current Plan */}
                  <div className="flex-[0_0_85%] min-w-0 border-2 border-[#2e29af] rounded-[20px] p-6 flex flex-col h-[600px]">
                    <div className="text-center mb-6">
                      <h3 className="text-[24px] font-['Open_Sans'] font-[700] text-[#2e29af]">
                        Current Plan
                      </h3>
                      <p className="text-[20px] font-['Open_Sans'] font-[700]">
                        {currentSubscription?.amount}€{formatPeriod(currentSubscription?.period || 'MONTHLY')}
                      </p>
                      <p className="text-[16px] font-['Open_Sans'] text-gray-600 mt-2">
                        Valid until: {formatDate(currentSubscription?.nextPayment)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[16px] font-['Open_Sans'] font-[400] mb-2">
                          Benefits:
                        </h4>
                        <p className="text-[14px] font-['Open_Sans'] ml-4">
                          {currentSubscription.subscription.benefits}
                        </p>
                      </div>

                      {currentSubscription.subscription.visitsPerMonth && (
                        <div>
                          <h4 className="text-[16px] font-['Open_Sans'] font-[400] mb-2">
                            Visits:
                          </h4>
                          <p className="text-[14px] font-['Open_Sans'] ml-4">
                            {currentSubscription.remainingVisits} of {currentSubscription.subscription.visitsPerMonth} remaining
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available Subscriptions */}
                  {allRestaurantSubscriptions.map((subscription) => (
                    <div 
                      key={subscription.id}
                      className="flex-[0_0_85%] min-w-0 border-2 border-black rounded-[20px] p-6 flex flex-col h-[600px]"
                    >
                      <div className="text-center">
                        <h3 className="!text-[24px] !font-['Open_Sans'] font-[700] !leading-[32.68px] -mb-2">
                          {subscription.name}
                        </h3>
                        <p className="!text-[20px] !font-['Open_Sans'] font-[700] !leading-[32px]">
                          ${subscription.price}{formatPeriod(subscription.period)}
                        </p>
                      </div>

                      <div>
                        <h4 className="!text-[16px] !font-['Open_Sans'] !font-[400] !leading-[32px] !mb-2">
                          Purchase benefit:
                        </h4>
                        <p className="!text-[14px] !font-['Open_Sans'] leading-normal ml-10">
                          {subscription.benefits}
                        </p>
                      </div>

                      {subscription.places?.length > 0 && (
                        <div>
                          <h4 className="!text-[16px] !font-['Open_Sans'] !font-[400] !leading-[32px] mb-4">
                            Where to use:
                          </h4>
                          <div className="space-y-4">
                            {subscription.places.map((place) => (
                              <div key={place.id} className="flex items-start gap-2">
                                <MapPinIcon className="h-5 w-5 shrink-0 mt-1" />
                                <div>
                                  <h5 className="!text-[14px] !font-['Open_Sans'] font-[600] !leading-[26px] underline">
                                    {place.name}
                                  </h5>
                                  <p className="!text-[14px] !font-['Open_Sans'] font-[600] !leading-[26px] underline">
                                    {place.location}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Botones de navegación */}
              <button
                onClick={scrollPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 