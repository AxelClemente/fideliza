'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useState, useEffect } from 'react'
import { CustomerSubscriptionModal } from '../modal/customer-subscription-modal'
import { Subscription } from '@/app/customer-dashboard/types/subscription'

export function SubscriptionCarousel({ subscriptions }: { subscriptions: Subscription[] }) {
  console.log('SubscriptionCarousel - subscriptions:', subscriptions)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  })

  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    if (selectedSubscription) {
      console.log('Selected subscription state:', {
        id: selectedSubscription.id,
        placesCount: selectedSubscription.places?.length || 0
      });
    }
  }, [selectedSubscription]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const handleSubscriptionClick = (subscription: Subscription) => {
    const subscriptionData: Subscription = {
      ...subscription,
      id: subscription.id,
      name: subscription.name,
      benefits: subscription.benefits,
      price: subscription.price,
      website: subscription.website,
      visitsPerMonth: subscription.visitsPerMonth,
      places: subscription.places || []
    };
    
    console.log('Subscription before modal:', {
      id: subscriptionData.id,
      name: subscriptionData.name,
      visitsPerMonth: subscriptionData.visitsPerMonth,
      placesCount: subscriptionData.places.length,
      places: subscriptionData.places
    });
    
    setSelectedSubscription(subscriptionData);
  }

  return (
    <>
      <div className="overflow-hidden">
        <div className="relative">
          <button
            onClick={scrollPrev}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hidden md:block"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="overflow-visible md:overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 pr-4 md:gap-6">
              {subscriptions.map((subscription) => (
                <div 
                  key={subscription.id}
                  className="
                    flex-[0_0_55%]
                    min-w-0 
                    md:flex-[0_0_calc(33.33%-16px)]
                  "
                >
                  <div 
                    onClick={() => handleSubscriptionClick(subscription)}
                    className="
                      w-[194px] 
                      h-[227px] 
                      md:w-full
                      p-4 
                      border-[6px] 
                      border-black 
                      rounded-lg 
                      text-center 
                      transition-all
                      duration-300
                      ease-in-out
                      hover:scale-[1.02]
                      hover:shadow-lg
                      flex 
                      flex-col 
                      items-center 
                      justify-center
                      cursor-pointer
                    "
                  >
                    <h3 className="!text-[20px] font-medium">{subscription.name}</h3>
                    <p className="text-lg font-bold mt-2">
                      ${subscription.price}
                    </p>
                    <p className="
                      !text-[16px] 
                      md:!text-[20px] 
                      text-third-gray 
                      mt-2
                      leading-[20px]
                      md:leading-normal
                      font-semibold
                      text-center
                      line-clamp-1
                      md:line-clamp-none
                    ">
                      <span className="md:hidden">
                        {subscription.benefits.split(' ').slice(0, 3).join(' ')}
                        {subscription.benefits.split(' ').length > 3 && '...'}
                      </span>
                      <span className="hidden md:inline">
                        {subscription.benefits.split(' ').slice(0, 5).join(' ')}
                        {subscription.benefits.split(' ').length > 5 && '...'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollNext}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hidden md:block"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <CustomerSubscriptionModal
        isOpen={!!selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
        subscription={selectedSubscription || undefined}
      />
    </>
  )
} 