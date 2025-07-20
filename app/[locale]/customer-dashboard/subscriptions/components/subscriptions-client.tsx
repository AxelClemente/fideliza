'use client'

import { useState } from 'react'
import { CustomerSubscriptionModal } from '../../modal/customer-subscription-modal'

interface Subscription {
  id: string
  name: string
  benefits: string
  price: number
  website?: string
  visitsPerMonth?: number
  period?: 'MONTHLY' | 'ANNUAL'
  places: Array<{
    id: string
    name: string
    location: string
    phoneNumber: string
    restaurant: {
      id: string
      title: string
    }
  }>
}

interface SubscriptionsClientProps {
  subscriptions: Subscription[]
}

export function SubscriptionsClient({ subscriptions }: SubscriptionsClientProps) {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubscriptionClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            onClick={() => handleSubscriptionClick(subscription)}
            className="group relative overflow-hidden rounded-[20px] cursor-pointer bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-gray-200"
          >
            <div className="p-6 space-y-4">
              <div className="text-center pb-4">
                <h3 className="text-[24px] font-bold leading-[30px] font-['Open_Sans']">
                  {subscription.name}
                </h3>
                <p className="text-[20px] font-semibold mt-2">
                  {subscription.price}€/{subscription.period?.toLowerCase() === 'annual' ? 'year' : 'month'}
                </p>
                {subscription.period?.toLowerCase() === 'annual' ? (
                  <p className="text-[16px] font-semibold mt-1 text-[#7B7B7B]">
                    Unlimited
                  </p>
                ) : subscription.visitsPerMonth && (
                  <p className="text-[16px] font-semibold mt-1 text-[#7B7B7B]">
                    {subscription.visitsPerMonth} visits per month
                  </p>
                )}
              </div>

              <div className="mt-4">
                <h4 className="text-[16px] mb-2 font-bold">Purchase benefit:</h4>
                <div className="whitespace-pre-line text-[14px] leading-[20px] pl-4">
                  {subscription.benefits}
                </div>
              </div>

              <div className="mt-4 pt-3">
                <h4 className="text-[16px] mb-2 font-bold">Where to use:</h4>
                <div className="flex flex-col space-y-2">
                  {subscription.places.map(place => (
                    <div key={`${subscription.id}-${place.id}`} className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9a2 2 0 110-4 2 2 0 010 4z"
                        />
                      </svg>
                      <span className="text-[14px] font-semibold">
                        {place.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {subscription.website && (
                <a 
                  href={subscription.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-black underline decoration-solid hover:text-black/80 pl-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[14px] font-semibold">
                    {subscription.website}
                  </span>
                </a>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <button 
                className="w-full h-[78px] rounded-[100px] bg-black text-white text-[18px] font-semibold leading-[22px] font-['Open_Sans'] flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubscriptionClick(subscription)
                }}
              >
                Purchase
              </button>
            </div>
          </div>
        ))}
      </div>

      <CustomerSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSubscription(null)
        }}
        subscription={selectedSubscription || undefined}
      />
    </>
  )
} 