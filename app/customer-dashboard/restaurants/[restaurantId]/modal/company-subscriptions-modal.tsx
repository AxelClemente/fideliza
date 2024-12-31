'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPinIcon } from "lucide-react"
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'

interface CompanySubscriptionsProps {
  isOpen: boolean
  onClose: () => void
  subscriptions: Array<{
    id: string
    name: string
    benefits: string
    price: number
    website?: string
    places?: Array<{
      id: string
      name: string
      location: string
      phoneNumber: string
    }>
  }>
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CompanySubscriptions({ 
  isOpen, 
  onClose,
  subscriptions 
}: CompanySubscriptionsProps) {
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

  const [isLoading, setIsLoading] = useState<string | null>(null)

  if (!subscriptions) return null

  const handleBuyClick = async (subscription: {
    id: string
    name: string
    price: number
    places?: Array<{ id: string }>
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
          name: subscription.name
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
      console.error('Checkout error:', error)
      toast.error('Failed to initiate checkout', {
        description: 'Please try again later'
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="
        max-w-none 
        w-full
        p-0 
        overflow-hidden 
        !fixed 
        !left-0
        !right-0
        !translate-x-0
        !translate-y-0 
        !rounded-none
        !top-0
        
        flex
        flex-col
        bg-white
        h-screen
        
      ">
        <DialogHeader className="p-3 md:p-4 pb-0 flex-shrink-0">
          <DialogTitle className="
            !text-[30px]
            !font-['Open_Sans']
            font-[700]
            !leading-[36px]
            -mb-6
            text-center
            px-4 
            md:px-8 
            mt-10
          ">
            Subscriptions
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="md:grid md:grid-cols-3 md:gap-6 p-6 hidden">
            {subscriptions.map((subscription) => (
              <div 
                key={subscription.id}
                className="
                  border-2 
                  border-black 
                  rounded-[20px] 
                  p-6 
                  flex 
                  flex-col 
                  min-h-[600px]
                  transition-all
                  duration-300
                  ease-in-out
                  hover:scale-[1.02]
                  hover:shadow-lg
                  bg-white
                "
              >
                <div className="flex-1 space-y-6">
                  {/* Subscription Header */}
                  <div className="text-center">
                    <h3 className="
                      !text-[24px]
                      !font-['Open_Sans']
                      font-[700]
                      !leading-[32.68px]
                      -mb-2
                      
                    ">
                      {subscription.name}
                    </h3>
                    <p className="
                      !text-[20px]
                      !font-['Open_Sans']
                      font-[700]
                      !leading-[32px]
                      
                    ">
                      ${subscription.price}/month
                    </p>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="
                      !text-[16px]
                      !font-['Open_Sans']
                      !font-[400]
                      !leading-[32px]
                      !mb-2
                    ">
                      Purchase benefit:
                    </h4>
                    <p className="
                      !text-[14px]
                      !font-['Open_Sans']
                      leading-normal
                      ml-10
                    ">
                      {subscription.benefits}
                    </p>
                  </div>

                  {/* Places */}
                  {subscription.places && subscription.places.length > 0 && (
                    <div>
                      <h4 className="
                        !text-[16px]
                        !font-['Open_Sans']
                        !font-[400]
                        !leading-[32px]
                        mb-4
                      ">
                        Where to use:
                      </h4>
                      <div className="space-y-4">
                        {subscription.places.map((place) => (
                          <div 
                            key={place.id}
                            className="flex items-start gap-2"
                          >
                            <MapPinIcon className="h-5 w-5 shrink-0 mt-1" />
                            <div>
                              <h5 className="
                                !text-[14px]
                                !font-['Open_Sans']
                                font-[600]
                                !leading-[26px]
                                underline
                              ">
                                {place.name}
                              </h5>
                              <p className="
                                !text-[14px]
                                !font-['Open_Sans']
                                font-[600]
                                !leading-[26px]
                                underline
                              ">
                                {place.location}
                              </p>
                              <p className="
                                !text-[14px]
                                !font-['Open_Sans']
                                font-[600]
                                !leading-[26px]
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
                    <div>
                      <a 
                        href={subscription.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          !text-[14px]
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

                {/* Buy Button */}
                <Button 
                  onClick={() => handleBuyClick(subscription)}
                  disabled={isLoading === subscription.id}
                  className="
                    w-full
                    h-[78px]
                    rounded-[100px]
                    bg-black 
                    text-[16px] 
                    font-semibold 
                    leading-[20px] 
                    font-['Open_Sans']
                    mt-6
                  "
                >
                  {isLoading === subscription.id ? 'Processing...' : 'Buy'}
                </Button>
              </div>
            ))}
          </div>

          {/* Carousel view para móvil */}
          <div className="md:hidden">
            <div className="relative">
              <button
                onClick={scrollPrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="overflow-visible" ref={emblaRef}>
                <div className="flex gap-4 p-6">
                  {subscriptions.map((subscription) => (
                    <div 
                      key={subscription.id}
                      className="
                        flex-[0_0_85%]
                        min-w-0
                        border-2 
                        border-black 
                        rounded-[20px] 
                        p-6 
                        flex 
                        flex-col 
                        min-h-[600px]
                        transition-all
                        duration-300
                        ease-in-out
                        hover:scale-[1.02]
                        hover:shadow-lg
                        bg-white
                      "
                    >
                      <div className="flex-1 space-y-6">
                        {/* Subscription Header */}
                        <div className="text-center">
                          <h3 className="
                            !text-[24px]
                            !font-['Open_Sans']
                            font-[700]
                            !leading-[32.68px]
                            
                          ">
                            {subscription.name}
                          </h3>
                          <p className="
                            !text-[20px]
                            !font-['Open_Sans']
                            font-[700]
                            !leading-[24.2px]
                          ">
                            ${subscription.price}/month
                          </p>
                        </div>

                        {/* Benefits */}
                        <div>
                          <h4 className="
                            !text-[16px]
                            !font-['Open_Sans']
                            !font-[400]
                            !leading-[32px]
                            !mb-2
                          ">
                            Purchase benefit:
                          </h4>
                          <p className="
                            !text-[14px]
                            !font-['Open_Sans']
                            leading-normal
                            ml-10
                          ">
                            {subscription.benefits}
                          </p>
                        </div>

                        {/* Places */}
                        {subscription.places && subscription.places.length > 0 && (
                          <div>
                            <h4 className="
                              !text-[16px]
                              !font-['Open_Sans']
                              !font-[400]
                              !leading-[32px]
                              
                            ">
                              Where to use:
                            </h4>
                            <div className="space-y-4">
                              {subscription.places.map((place) => (
                                <div 
                                  key={place.id}
                                  className="flex items-start gap-2"
                                >
                                  <MapPinIcon className="h-5 w-5 shrink-0 mt-1" />
                                  <div>
                                    <h5 className="
                                      !text-[14px]
                                      !font-['Open_Sans']
                                      font-[600]
                                      !leading-[26px]
                                      underline
                                    ">
                                      {place.name}
                                    </h5>
                                    <p className="
                                      !text-[14px]
                                      !font-['Open_Sans']
                                      font-[600]
                                      !leading-[26px]
                                      underline
                                    ">
                                      {place.location}
                                    </p>
                                    <p className="
                                      !text-[14px]
                                      !font-['Open_Sans']
                                      font-[600]
                                      !leading-[26px]
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
                          <div>
                            <a 
                              href={subscription.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                !text-[14px]
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

                      {/* Buy Button */}
                      <Button 
                        onClick={() => handleBuyClick(subscription)}
                        disabled={isLoading === subscription.id}
                        className="
                          w-full
                          h-[78px]
                          rounded-[100px]
                          bg-black 
                          text-[16px] 
                          font-semibold 
                          leading-[20px] 
                          font-['Open_Sans']
                          mt-6
                        "
                      >
                        {isLoading === subscription.id ? 'Processing...' : 'Buy'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={scrollNext}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}