'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPinIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Subscription } from '@/app/[locale]/customer-dashboard/types/subscription'
import { useTranslations } from 'next-intl'
import { loadStripe } from '@stripe/stripe-js'

interface CustomerSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  subscription?: Subscription
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CustomerSubscriptionModal({ 
  isOpen, 
  onClose,
  subscription 
}: CustomerSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isStripeLoading, setIsStripeLoading] = useState(false)
  const [error, setError] = useState('')
  const t = useTranslations('CustomerDashboard.subscriptionModal')
  
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

  // Función de prueba existente (sin Stripe)
  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      setError('')  // Limpiar error previo
      
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase subscription')
      }

      toast.success(t('purchaseSuccess'))
      onClose()
    } catch (error) {
      console.error('Purchase error:', error)
      setError(error instanceof Error ? error.message : 'Failed to purchase subscription')
      toast.error(error instanceof Error ? error.message : 'Failed to purchase subscription')
    } finally {
      setIsLoading(false)
    }
  }

  // Nueva función con integración de Stripe
  const handleStripePurchase = async () => {
    try {
      setIsStripeLoading(true)
      setError('')  // Limpiar error previo
      
      const selectedPlace = subscription.places[0]
      console.log('Initiating Stripe purchase:', {
        subscriptionId: subscription.id,
        placeId: selectedPlace.id,
        price: subscription.price,
        name: subscription.name
      })

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          placeId: selectedPlace.id,
          price: subscription.price,
          name: subscription.name
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error('Stripe failed to initialize')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Stripe purchase error:', error)
      setError(error instanceof Error ? error.message : 'Failed to process payment')
      toast.error(error instanceof Error ? error.message : 'Failed to process payment')
    } finally {
      setIsStripeLoading(false)
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
                  {t('title')}
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
                  {t('purchaseBenefit')}:
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
                    {t('whereToUse')}:
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

            {error && (
              <div className="px-4 md:px-8 mb-4">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
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
            {/* Botón de prueba existente */}
            <Button 
              onClick={handlePurchase}
              disabled={isLoading}
              className="
                w-full 
                h-[78px] 
                rounded-[100px] 
                bg-black 
                text-white 
                text-[16px] 
                font-semibold 
                leading-[20px] 
                font-['Open_Sans']
              "
            >
              {isLoading ? t('processing') : t('purchase')}
            </Button>
            
            {/* Nuevo botón de Stripe */}
            <Button 
              onClick={handleStripePurchase}
              disabled={isStripeLoading}
              className="
                w-full 
                h-[78px] 
                rounded-[100px] 
                bg-[#635BFF] 
                text-white 
                text-[16px] 
                font-semibold 
                leading-[20px] 
                font-['Open_Sans']
                hover:bg-[#4F46E5]
              "
            >
              {isStripeLoading ? t('processing') : 'Stripe'}
            </Button>
            
            <Button 
              onClick={onClose}
              variant="outline"
              className="
                w-full 
                h-[78px] 
                rounded-[100px] 
                border-[1px] 
                border-third-gray/30 
                text-[16px] 
                font-semibold 
                leading-[20px] 
                font-['Open_Sans']
              "
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}