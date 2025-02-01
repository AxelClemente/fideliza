'use client'

import { useState } from 'react'
import Image from "next/image"
import { SubscriptionCarousel } from '../../../components/subscription-carousel'
import { CompanySubscriptions } from './../modal/company-subscriptions-modal'
import { Subscription } from '@/app/[locale]/customer-dashboard/types/subscription'
import { useTranslations } from 'next-intl'

interface RestaurantInfoProps {
  restaurant: {
    title: string
    description: string
    images: Array<{ url: string }>
  }
  subscriptions: Array<Subscription>
}

export function RestaurantInfo({ restaurant, subscriptions }: RestaurantInfoProps) {
  const uniqueSubscriptions = Array.from(
    new Map(subscriptions.map(sub => [sub.id, {
      ...sub,
      places: sub.places || []
    }])).values()
  );

  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const t = useTranslations('CustomerDashboard.dashboard')

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full">
        <div className="relative w-full h-[260px] md:h-[461px] overflow-hidden md:container md:mx-auto md:max-w-[1400px] md:mt-14">
          {restaurant.images?.[0] && (
            <Image
              src={restaurant.images[0].url}
              alt={restaurant.title}
              fill
              className="object-cover md:rounded-[20px]"
              priority
              sizes="100vw"
            />
          )}
        </div>
      </div>
      
      <div className="px-4 md:container md:mx-auto md:max-w-[1440px]">
        <div className="md:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="w-full md:w-1/2 space-y-4">
              <h1 className="!text-[30px] font-bold">{restaurant.title}</h1>
              <p className="
                !text-[18px] 
                md:!text-[20px] 
                text-main-dark 
                font-semibold 
                leading-[22px]
                md:leading-[26px] 
                text-justify
              ">
                {restaurant.description}
              </p>
            </div>
            
            <div className="w-full md:w-1/2">
              <h2 
                onClick={() => setIsCompareOpen(true)}
                className="!text-[30px] font-bold mb-4 md:underline mt-[4px] cursor-pointer"
              >
                {t('subscriptions')} ({uniqueSubscriptions.length})
              </h2>
              <SubscriptionCarousel subscriptions={uniqueSubscriptions} />
            </div>
          </div>
        </div>
      </div>

      <CompanySubscriptions
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        subscriptions={uniqueSubscriptions}
      />
    </div>
  )
}