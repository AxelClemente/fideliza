import { RestaurantProvider } from '../components/restaurant-provider'
import { ClientWrapper } from '../components/client-wrapper'
import { getTranslations } from 'next-intl/server'
import type { Subscription } from '../types/types'

interface ProviderSubscription {
  id: string
  name: string
  benefits: string
  price: number
  website?: string | null
  visitsPerMonth?: number | null
  createdAt?: Date
  updatedAt?: Date
}

export default async function SubscriptionsPage() {
  const { restaurants } = await RestaurantProvider()
  const hasPlaces = restaurants.some(r => r.places && r.places.length > 0)
  const t = await getTranslations('BusinessDashboard')
  
  const subscriptionMap = new Map<string, Subscription>()
  
  restaurants.forEach(restaurant => 
    restaurant.places.forEach(place => 
      place.subscriptions?.forEach((subscription: ProviderSubscription) => {
        if (!subscriptionMap.has(subscription.id)) {
          subscriptionMap.set(subscription.id, {
            ...subscription,
            places: [{
              id: place.id,
              name: place.name
            }]
          })
        } else {
          const existing = subscriptionMap.get(subscription.id)
          if (existing) {
            existing.places.push({
              id: place.id,
              name: place.name
            })
          }
        }
      })
    )
  )

  const uniqueSubscriptions = Array.from(subscriptionMap.values())

  return (
    <div className="mx-4 md:mx-8 lg:mx-8 -mt-4 md:mt-0">
      <div className="space-y-2 md:space-y-4">
        <div className="flex items-center justify-between">
          {uniqueSubscriptions.length === 0 && (
            <h2 className="
              text-[30px]          
              md:text-[30px] 
              text-[#7B7B7B] 
              font-bold
              mt-8
              md:mt-0
              flex-1
            ">
              {!hasPlaces ? t('createPlaceFirst') : t('noSubscriptionsYet')}
            </h2>
          )}
          
          <div className="flex-1 flex justify-end">
            {hasPlaces && (
              <ClientWrapper 
                type="subscription"
                mode="add"
                restaurants={restaurants}
                hasSubscriptions={uniqueSubscriptions.length > 0}
              />
            )}
          </div>
        </div>

        {uniqueSubscriptions.length > 0 ? (
          <>
            {/* Versión Desktop - Grid normal */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueSubscriptions.map((subscription) => (
                <div 
                  key={subscription.id}
                  className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg w-[389px] h-[638px] relative"
                >
                  <div className="p-6 space-y-4">
                    <div className="text-center pb-6" >
                      <h3 className="text-[24px] font-bold leading-[30px] font-['Open_Sans']">
                        {subscription.name}
                      </h3>
                      <p className="text-[20px] font-semibold mt-2">
                        {subscription.price}€/month
                      </p>
                      {subscription.visitsPerMonth && (
                        <p className="text-[16px] font-semibold mt-1 text-[#7B7B7B]">
                          {t('visitsPerMonth', { visits: subscription.visitsPerMonth })}
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <h4 className="text-[16px] mb-2">{t('purchaseBenefit')}:</h4>
                      <div className="whitespace-pre-line text-[14px] leading-[20px] pl-4">
                        {subscription.benefits}
                      </div>
                    </div>

                    <div className="mt-4 pt-3">
                      <h4 className="text-[16px] mb-2">{t('whereToUse')}:</h4>
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
                      >
                        <span className="text-[14px] font-semibold">
                          {subscription.website}
                        </span>
                      </a>
                    )}
                  </div>

                  <div className="hidden md:block absolute bottom-10 left-4 right-4">
                    <ClientWrapper 
                      type="subscription"
                      mode="edit"
                      restaurants={restaurants}
                      subscription={subscription}
                    />
                  </div>

                  <div className="md:hidden mt-4">
                    <ClientWrapper 
                      type="subscription"
                      mode="edit"
                      restaurants={restaurants}
                      subscription={subscription}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Versión Mobile - Carrusel */}
            <div className="block md:hidden w-full mt-6">
              <div className="
                flex 
                overflow-x-auto 
                snap-x 
                snap-mandatory
                scrollbar-hide
                no-scrollbar
                px-4
                gap-4
              ">
                {uniqueSubscriptions.map((subscription) => (
                  <div 
                    key={subscription.id}
                    className="
                      flex-none
                      snap-center
                      bg-white 
                      border-2 
                      border-gray-200 
                      rounded-xl 
                      overflow-hidden 
                      w-[389px]
                      h-[641px]
                      relative
                      first:ml-[5%]
                      last:mr-[5%]
                    "
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1 p-6 space-y-4 mt-6 md:mt-0">
                        <div className="text-center pb-4">
                          <h3 className="text-[20px] font-bold leading-[26px] font-['Open_Sans']">
                            {subscription.name}
                          </h3>
                          <p className="text-[20px] font-bold mt-1">
                            {subscription.price}€/month
                          </p>
                          {subscription.visitsPerMonth && (
                            <p className="text-[16px] font-semibold mt-1 text-[#7B7B7B]">
                              {t('visitsPerMonth', { visits: subscription.visitsPerMonth })}
                            </p>
                          )}
                        </div>

                        <div className="mt-8 md:mt-4">
                          <h4 className="text-[16px] mb-2">{t('purchaseBenefit')}:</h4>
                          <div className="whitespace-pre-line text-[14px] leading-[20px]">
                            {subscription.benefits}
                          </div>
                        </div>

                        <div className="mt-8 md:mt-4">
                          <h4 className="text-[16px] mb-2">{t('whereToUse')}:</h4>
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
                            className="mt-8 md:mt-4 block text-black underline decoration-solid hover:text-black/80"
                          >
                            <span className="text-[14px] font-semibold">
                              {subscription.website}
                            </span>
                          </a>
                        )}
                      </div>

                      <div className="p-6 mt-auto">
                        <ClientWrapper 
                          type="subscription"
                          mode="edit"
                          restaurants={restaurants}
                          subscription={subscription}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500" />
        )}

        {hasPlaces && (
          <div className="!mt-4 md:hidden">
            <ClientWrapper 
              type="subscription"
              mode="add"
              restaurants={restaurants}
              hasSubscriptions={uniqueSubscriptions.length > 0}
            />
          </div>
        )}
      </div>
    </div>
  )
}