'use client'

import { useState, useCallback } from 'react'
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const t = useTranslations('CustomerDashboard.dashboard')

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === restaurant.images.length - 1 ? 0 : prev + 1
    )
  }, [restaurant.images.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? restaurant.images.length - 1 : prev - 1
    )
  }, [restaurant.images.length])

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full">
        <div className="relative w-full h-[260px] md:h-[461px] overflow-hidden md:container md:mx-auto md:max-w-[1400px] md:mt-14">
          {restaurant.images && restaurant.images.length > 0 && (
            <div className="relative w-full h-full">
              {/* Imagen actual */}
              <Image
                src={restaurant.images[currentImageIndex].url}
                alt={`${restaurant.title} image ${currentImageIndex + 1}`}
                fill
                className="object-cover md:rounded-[20px] transition-opacity duration-300"
                priority={currentImageIndex === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1400px"
                quality={95}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />

              {/* Indicadores de imagen */}
              {restaurant.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {restaurant.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Botones de navegación para imágenes */}
              {restaurant.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
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