'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import { SubscriptionQRModal } from './subscription-qr-modal'

interface UserSubscriptionsListProps {
  subscriptions: Array<{
    id: string
    subscription: {
      name: string
      benefits: string
    }
    place: {
      name: string
      restaurant: {
        title: string
        images: Array<{
          url: string
        }>
      }
    }
    status: string
    nextPayment: Date
    amount: number
  }>
}

export function UserSubscriptionsList({ subscriptions }: UserSubscriptionsListProps) {
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscriptionsListProps['subscriptions'][0] | null>(null)

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don&apos;t have any active subscriptions yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((sub) => (
          <div 
            key={sub.id}
            className="
              w-full
              md:w-[389px]
              border 
              rounded-[20px]
              overflow-hidden 
              shadow-sm 
              hover:shadow-md 
              transition-shadow
              mx-auto
            "
          >
            {sub.place.restaurant.images?.[0] && (
              <>
                <div className="relative w-full md:w-[389px] h-[245px]">
                  <Image
                    src={sub.place.restaurant.images[0].url}
                    alt={sub.place.restaurant.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center py-4">
                  <p className="
                    w-[209px]
                    h-[26px]
                    text-[20px]
                    leading-[26px]
                    font-['Open_Sans']
                    font-semibold
                    text-justify
                    mx-auto
                    flex
                    items-center
                    justify-center
                  ">
                    {sub.place.restaurant.title}
                  </p>
                  <p className="
                    text-[14px]
                    leading-[18px]
                    font-['Open_Sans']
                    font-[600]
                    text-center
                    mt-1
                    -mb-4
                    text-[#7B7B7B]
                  ">
                    {sub.place.name}
                  </p>
                </div>
              </>
            )}
            
            <div className="p-6">
              <h2 className="
                !text-[24px]
                !leading-[32.68px]
                !font-['Open_Sans']
                !font-bold
                !text-center
                !mb-[2.5px]
                !mx-auto
                flex
                items-center
                justify-center
              ">
                {sub.subscription.name}
              </h2>

              <p className="
                text-[20px]
                leading-[24.2px]          
                font-bold
                text-center
                mb-1
              ">
                {sub.amount}€/month
              </p>
              <p className="
                text-[20px]
                leading-[26px]
                font-['Open_Sans']
                font-semibold
                text-center
                text-[#7B7B7B]
                mb-4
              ">
                Valid until: {formatDate(sub.nextPayment)}
              </p>
              
              <h4 className="
                text-[14px]
                leading-[26px]
                font-['Open_Sans']            
                mb-1
              ">
                Purchase benefits:
              </h4>
              <p className="
                text-[14px]
                leading-[18px]
                font-['Open_Sans']
                font-[400]
                
              ">
                {sub.subscription.benefits}
              </p>


              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => setSelectedSubscription(sub)}
                  className="
                    w-[329px]
                    h-[78px]
                    rounded-[100px]
                    bg-black 
                    text-white 
                    text-[18px] 
                    font-semibold 
                    leading-[22px] 
                    font-['Open_Sans']
                    flex 
                    items-center 
                    justify-center 
                    mx-auto
                    hover:bg-black/90 
                    transition-colors
                  "
                >
                  Generate QR
                </button>
                <button 
                  onClick={() => {}} // Implementar compartir info
                  className="
                    w-[329px]
                    h-[78px]
                    rounded-[100px]
                    bg-black 
                    text-white 
                    text-[18px] 
                    font-semibold 
                    leading-[22px] 
                    font-['Open_Sans']
                    flex 
                    items-center 
                    justify-center 
                    mx-auto
                    hover:bg-black/90 
                    transition-colors
                  "
                >
                  Share info
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedSubscription && (
        <SubscriptionQRModal
          isOpen={!!selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          subscriptionData={selectedSubscription}
        />
      )}
    </>
  )
}