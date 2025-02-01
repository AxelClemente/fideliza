'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import { SubscriptionQRModal } from './subscription-qr-modal'
import { UpgradeSubscriptionModal } from '@/app/[locale]/customer-dashboard/my-subscriptions/components/upgrade-subscription-modal'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface UserSubscriptionsListProps {
  subscriptions: Array<{
    id: string
    subscription: {
      name: string
      benefits: string
      visitsPerMonth: number | null
    }
    place: {
      name: string
      restaurant: {
        id: string
        title: string
        images: Array<{
          url: string
        }>
        subscriptions?: Array<{
          id: string
          name: string
          benefits: string
          price: number
          visitsPerMonth: number | null
          places: Array<{
            id: string
            name: string
            location: string
          }>
        }>
      }
    }
    status: string
    nextPayment: Date
    amount: number
    remainingVisits: number | null
  }>
}

export function UserSubscriptionsList({ subscriptions }: UserSubscriptionsListProps) {
  const t = useTranslations('CustomerDashboard.MySubscriptions')
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscriptionsListProps['subscriptions'][0] | null>(null)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [subscriptionToUpgrade, setSubscriptionToUpgrade] = useState<UserSubscriptionsListProps['subscriptions'][0] | null>(null)

  const handleUpgradeClick = (subscription: UserSubscriptionsListProps['subscriptions'][0]) => {
    setSubscriptionToUpgrade(subscription)
    setIsUpgradeModalOpen(true)
  }

  const handleUnsubscribe = async (subscriptionId: string) => {
    toast(
      t('unsubscribe'),
      {
        duration: Infinity,
        position: "bottom-right",
        style: {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
        action: {
          label: t('unsubscribe'),
          onClick: async () => {
            try {
              const response = await fetch('/api/user-subscriptions', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userSubscriptionId: subscriptionId }),
              })

              if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to cancel subscription')
              }

              toast.success('Subscription cancelled successfully')
              window.location.reload()
              
            } catch (error) {
              console.error('Error canceling subscription:', error)
              toast.error('Failed to cancel subscription')
            }
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
      }
    )
  }

  const handleShare = async (sub: UserSubscriptionsListProps['subscriptions'][0]) => {
    const restaurantUrl = `${window.location.origin}/customer-dashboard/restaurants/${sub.place.restaurant.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${sub.place.restaurant.title}`,
          text: `Check out ${sub.place.restaurant.title} and their subscriptions!`,
          url: restaurantUrl
        });
      } else {
        await navigator.clipboard.writeText(restaurantUrl);
        toast.success('Restaurant link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share restaurant info');
    }
  };

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
                    w-auto
                    min-w-[209px]
                    h-auto
                    min-h-[26px]
                    text-[20px]
                    leading-[26px]
                    font-['Open_Sans']
                    font-semibold
                    text-center
                    mx-auto
                    flex
                    items-center
                    justify-center
                    whitespace-nowrap
                    px-2
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
                text-[16px]
                leading-[26px]
                font-['Open_Sans']
                font-semibold
                text-center
                text-[#7B7B7B]
                mb-4
              ">
                {t('validUntil')}: {formatDate(sub.nextPayment)}
              </p>
              {sub.subscription.visitsPerMonth && sub.remainingVisits !== null && (
                <p className="
                  text-[20px]
                  leading-[26px]
                  font-['Open_Sans']
                  font-semibold
                  text-center
                  text-[#7B7B7B]
                  mb-4
                ">
                  {t('visitsRemaining', {
                    remaining: sub.remainingVisits,
                    total: sub.subscription.visitsPerMonth
                  })}
                </p>
              )}
              
              <h4 className="
                text-[14px]
                leading-[26px]
                font-['Open_Sans']            
                mb-1
              ">
                {t('purchaseBenefits')}:
              </h4>
              <div className="relative group">
                <p className="
                  text-[14px]
                  leading-[18px]
                  font-['Open_Sans']
                  font-[400]
                ">
                  {sub.subscription.benefits.split(' ').slice(0, 5).join(' ')}
                  {sub.subscription.benefits.split(' ').length > 5 && (
                    <span className="text-blue-600"> show more...</span>
                  )}
                </p>
                <div className="
                  absolute 
                  left-0 
                  top-full 
                  mt-2 
                  p-4 
                  bg-white 
                  shadow-lg 
                  rounded-lg 
                  border 
                  w-full 
                  z-10 
                  opacity-0 
                  invisible 
                  group-hover:opacity-100 
                  group-hover:visible 
                  transition-all 
                  duration-200
                ">
                  <p className="
                    text-[14px]
                    leading-[18px]
                    font-['Open_Sans']
                    font-[400]
                  ">
                    {sub.subscription.benefits}
                  </p>
                </div>
              </div>

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
                  {t('generateQR')}
                </button>
                <button 
                  onClick={() => handleShare(sub)}
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
                  {t('shareInfo')}
                </button>
                <button 
                  onClick={() => handleUpgradeClick(sub)}
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
                  {t('upgrade')}
                </button>
                <button 
                  onClick={() => handleUnsubscribe(sub.id)}
                  className="
                    w-[329px]
                    h-[78px]
                    rounded-[100px]
                    bg-white 
                    text-black 
                    border-2
                    border-black
                    text-[18px] 
                    font-semibold 
                    leading-[22px] 
                    font-['Open_Sans']
                    flex 
                    items-center 
                    justify-center 
                    mx-auto
                    hover:bg-gray-50
                    transition-colors
                  "
                >
                  {t('unsubscribe')}
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

      <UpgradeSubscriptionModal
        isOpen={isUpgradeModalOpen}
        onClose={() => {
          setIsUpgradeModalOpen(false)
          setSubscriptionToUpgrade(null)
        }}
        currentSubscription={subscriptionToUpgrade}
      />
    </>
  )
}