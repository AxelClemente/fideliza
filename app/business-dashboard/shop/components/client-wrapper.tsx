'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { usePermissions } from '../contexts/permission-context'
import type { ModelType } from '@prisma/client'
import type { Restaurant, Place, Offer, Subscription, Mailing } from '../types/types'
import { AddMainInfoModal } from '../modal/add-main-info'
import { AddPlaceInfoModal } from '../modal/add-place-info'
import { AddSpecialOfferModal } from '../modal/add-special-offer'
import { AddSubscriptionModal } from '../modal/add-new-subscription'
import { useMediaQuery } from '@/app/hooks/use-media-query'
import { MobileAddMainInfo } from '../modal/mobile/mobile-add-main-info'
import { MobileAddPlaceInfo } from '../modal/mobile/mobile-add-place-info'
import { MobileAddSpecialOffer } from '../modal/mobile/mobile-add-special-offer'
import { MobileNewSubscription } from '../modal/mobile/mobile-new-subscription'

interface ClientWrapperProps {
  type: string
  restaurants: Restaurant[]
  restaurant?: Restaurant
  mode?: 'add' | 'edit'
  place?: Place
  offer?: Offer
  subscription?: Subscription
  mailing?: Mailing
  hasSubscriptions?: boolean
}

const getModelType = (type: string): ModelType => {
  const typeMap: Record<string, ModelType> = {
    'main-info': 'MAIN_INFO',
    'place': 'PLACES',
    'special-offer': 'SPECIAL_OFFERS',
    'subscription': 'SUBSCRIPTIONS'
  }
  return typeMap[type]
}

export function ClientWrapper({ 
  type,
  restaurants,
  restaurant,
  mode = 'add',
  place,
  offer,
  subscription,
  mailing
}: ClientWrapperProps) {
  const { canAccess } = usePermissions()
  const access = canAccess(getModelType(type))

  // Estados
  const [isMainInfoModalOpen, setIsMainInfoModalOpen] = useState(false)
  const [isPlaceInfoModalOpen, setIsPlaceInfoModalOpen] = useState(false)
  const [isSpecialOfferModalOpen, setIsSpecialOfferModalOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)

  const isMobile = useMediaQuery('(max-width: 768px)')

  // En lugar de recibir hasPlaces como prop, calcularlo internamente
  const hasPlaces = restaurants.some(r => r.places && r.places.length > 0)

  // Mover handleSendEmails aquí junto con las otras funciones de manejo
  const handleSendEmails = async () => {
    try {
      if (!mailing) {
        toast.error('No mailing data found')
        return
      }

      const place = restaurants.flatMap(r => r.places).find(p => p.id === mailing.location)
      
      if (!place) {
        toast.error('Place not found')
        return
      }

      const response = await fetch('/api/send-mailing-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mailing.name,
          description: mailing.description,
          location: place.name,
          testEmail: 'axelclementesosa@gmail.com' // Email verificado para pruebas
        })
      })

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Testing mode: Email will be sent to axelclementesosa@gmail.com')
          return
        }
        throw new Error('Failed to send emails')
      }

      toast.success('Test email sent successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send test email')
    }
  }

  // Permisos y returns condicionales
  if (mode === 'edit' && !access.canEdit) return null
  if (!access.canView) return null

  // Función para manejar la edición de un place
  const handleEditPlace = (place: Place) => {
    setEditingPlace(place)
    setIsPlaceInfoModalOpen(true)
  }

  // Añadimos la función de eliminación
  const handleDeletePlace = async () => {
    try {
      const response = await fetch(`/api/places?id=${place?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete place')

      toast.success('Place deleted successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete place')
    }
  }

  const handleDeleteConfirmation = () => {
    toast(
      "Are you sure you want to delete this place?",
      {
        duration: Infinity,
        position: "bottom-right",
        style: {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
        action: {
          label: "Delete",
          onClick: () => handleDeletePlace(),
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
      }
    );
  };

  // Función para manejar la edición de una oferta
  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer)
    setIsSpecialOfferModalOpen(true)
  }

  // Función para eliminar una oferta
  const handleDeleteOffer = async () => {
    try {
      const response = await fetch(`/api/special-offers?id=${offer?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete offer')

      toast.success('Offer deleted successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete offer')
    }
  }

  // Función para confirmar la eliminación
  const handleDeleteOfferConfirmation = () => {
    toast(
      "Are you sure you want to delete this offer?",
      {
        duration: Infinity,
        position: "bottom-right",
        style: {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
        action: {
          label: "Delete",
          onClick: () => handleDeleteOffer(),
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
      }
    )
  }

  // Función para eliminar una suscripción
  const handleDeleteSubscription = async () => {
    try {
      const response = await fetch(`/api/subscriptions?id=${subscription?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete subscription')

      toast.success('Subscription deleted successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete subscription')
    }
  }

  // Función para confirmar la eliminación de suscripción
  const handleDeleteSubscriptionConfirmation = () => {
    toast(
      "Are you sure you want to delete this subscription?",
      {
        duration: Infinity,
        position: "bottom-right",
        style: {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
        action: {
          label: "Delete",
          onClick: () => handleDeleteSubscription(),
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
      }
    )
  }

  // Función para eliminar un restaurante
  const handleDeleteRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurant?id=${restaurant?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete restaurant')

      toast.success('Restaurant deleted successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete restaurant')
    }
  }

  // Función para confirmar la eliminación del restaurante
  const handleDeleteRestaurantConfirmation = () => {
    toast(
      "Are you sure you want to delete this restaurant?",
      {
        duration: Infinity,
        position: "bottom-right",
        style: {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
        action: {
          label: "Delete",
          onClick: () => handleDeleteRestaurant(),
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
      }
    )
  }

  // Obtenemos todos los places de todos los restaurantes
  const places = restaurants.flatMap(restaurant => 
    restaurant.places.map(place => ({
      id: place.id,
      name: place.name
    }))
  )

  // Si es special-offer en modo edit
  if (type === 'special-offer' && mode === 'edit' && offer) {
    return (
      <>
        {/* Versión Desktop */}
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => handleEditOffer(offer)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          
          <button 
            onClick={() => handleDeleteOfferConfirmation()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Versión Mobile - Ajustado el centrado */}
        <div className="
          md:hidden 
          flex 
          flex-col 
          items-center     /* Añadido: centrar elementos horizontalmente */
          w-full 
          gap-3
        ">
          <button 
            onClick={() => handleEditOffer(offer)}
            className="
              w-[345px]
              h-[78px]
              rounded-[100px]
              bg-black 
              text-white 
              font-semibold
              text-[16px]
            "
          >
            Edit
          </button>
          
          <button 
            onClick={() => handleDeleteOfferConfirmation()}
            className="
              w-[345px]          /* Ajustado: mismo ancho que el botón Edit */
              text-black 
              font-semibold 
              underline 
              decoration-solid
              text-[16px]
              text-center       /* Centrado del texto */
            "
          >
            Delete
          </button>
        </div>

        {/* Modal de edición */}
        {editingOffer && (
          <AddSpecialOfferModal
            isOpen={isSpecialOfferModalOpen}
            onClose={() => {
              setIsSpecialOfferModalOpen(false)
              setEditingOffer(null)
            }}
            mode="edit"
            initialData={editingOffer}
            places={places}
          />
        )}
      </>
    )
  }

  // Si es special-offer en modo add (botón principal)
  if (type === 'special-offer' && mode === 'add') {
    return (
      <>
        {access.canEdit && (
          <>
            {/* Versión Móvil */}
            <div className="
              md:hidden 
              w-full 
              fixed        /* Nuevo */
              bottom-6     /* Nuevo */
              left-0       /* Nuevo */
              px-3         /* Nuevo */
              z-50         /* Nuevo */
            ">
              <button 
                onClick={() => setIsSpecialOfferModalOpen(true)}
                className="
                  w-full 
                  h-[78px] 
                  rounded-[100px] 
                  bg-[#000000] 
                  text-white 
                  shadow-lg
                  text-[18px] 
                  font-semibold 
                  leading-[22px] 
                "
              >
                Add special offer
              </button>
            </div>

            {/* Versión Desktop */}
            <button 
              onClick={() => setIsSpecialOfferModalOpen(true)}
              className={`
                hidden            
                md:flex         
                justify-end   
                items-center      
                w-full
                whitespace-nowrap
              `}
            >
              <span className={`
                ${!hasPlaces 
                  ? "w-[329px] h-[78px] rounded-[100px] bg-[#000000] text-white flex items-center justify-center " 
                  : "text-black hover:text-black/80 text-[24px] font-semibold leading-[22px] font-['Open_Sans'] underline decoration-solid pl-[1120px] pb-2"
                }
              `}>
                {!hasPlaces ? "Add special offer" : "Add new special offer"}
              </span>
            </button>

            {/* Modales */}
            {isMobile ? (
              <MobileAddSpecialOffer
                isOpen={isSpecialOfferModalOpen}
                onClose={() => setIsSpecialOfferModalOpen(false)}
                places={restaurants?.[0]?.places || []}
              />
            ) : (
              <AddSpecialOfferModal
                isOpen={isSpecialOfferModalOpen}
                onClose={() => setIsSpecialOfferModalOpen(false)}
                places={restaurants?.[0]?.places || []}
              />
            )}
          </>
        )}
      </>
    )
  }

  // Renderizado condicional para Places
  if (type === 'place' && mode === 'edit' && place) {
    return (
      <>
        <div className="flex gap-1">
          {access.canEdit && (
            <>
              <button 
                onClick={() => handleEditPlace(place)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <svg
                  className="h-5 w-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              
              <button 
                onClick={handleDeleteConfirmation}
                className="hover:bg-gray-100 rounded-full"
              >
                <svg
                  className="h-5 w-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Modal de edición */}
        {editingPlace && access.canEdit && (
          <AddPlaceInfoModal
            isOpen={isPlaceInfoModalOpen}
            onClose={() => {
              setIsPlaceInfoModalOpen(false)
              setEditingPlace(null)
            }}
            mode="edit"
            initialData={editingPlace}
            restaurantId={editingPlace.restaurantId}
          />
        )}
      </>
    )
  }

  // Si es subscription
  if (type === 'subscription') {
    if (mode === 'edit' && subscription) {
      return (
        <>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="
                w-full          
                md:w-[329px]    
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
                text-center
                md:mx-auto      
              "
            >
              <span className="inline-flex items-center justify-center">
                Edit
              </span>
            </button>

            <button 
              onClick={handleDeleteSubscriptionConfirmation}
              className="text-black hover:text-black/80 text-[18px] font-semibold leading-[22px] font-['Open_Sans'] underline decoration-solid text-center"
            >
              Delete
            </button>
          </div>

          <AddSubscriptionModal
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            places={places}
            mode="edit"
            initialData={{
              id: subscription.id,
              name: subscription.name,
              benefits: subscription.benefits,
              price: subscription.price,
              website: subscription.website,
              placeId: subscription.places?.[0]?.id || places[0]?.id
            }}
          />
        </>
      )
    }

    return (
      <>
        {access.canEdit && (
          <>
            {/* Versión Móvil */}
            <div className="
              md:hidden 
              w-full 
              fixed        /* Nuevo */
              bottom-6     /* Nuevo */
              left-0       /* Nuevo */
              px-3         /* Nuevo */
              z-50         /* Nuevo */
            ">
              <button 
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="
                  w-full 
                  h-[78px] 
                  rounded-[100px] 
                  bg-[#000000] 
                  text-white 
                  shadow-lg
                  text-[18px] 
                  font-semibold 
                  leading-[22px] 
                "
              >
                Add subscription
              </button>
            </div>

            {/* Versión Desktop */}
            <button 
              onClick={() => setIsSubscriptionModalOpen(true)}
              className={`
                hidden
                md:flex         
                justify-end   
                items-center      
                px-4              
              `}
            >
              <span className={`
                ${!hasPlaces 
                  ? "w-[329px] h-[78px] rounded-[100px] bg-[#000000] text-white flex items-center justify-center" 
                  : "text-black hover:text-black/80 text-[24px] font-semibold leading-[22px] font-['Open_Sans'] underline decoration-solid pl-[1050px] pb-2"
                }
              `}>
                {!hasPlaces ? "Add subscription" : "Add new subscription"}
              </span>
            </button>

            {/* Modal */}
            {isMobile ? (
              <MobileNewSubscription
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                places={places}
              />
            ) : (
              <AddSubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                places={places}
              />
            )}
          </>
        )}
      </>
    )
  }

  // Si es main-info en modo add
  if (type === 'main-info' && mode === 'add') {
    return (
      <>
        {access.canEdit && (
          <>
            {/* Versión Móvil */}
            <div className={`
              md:hidden 
              w-full 
              ${!restaurants.length ? 'fixed bottom-6 left-0 z-50' : ''} 
              px-3
            `}>
              <button 
                onClick={() => setIsMainInfoModalOpen(true)}
                className="
                  w-full
                  h-[78px] 
                  rounded-[100px] 
                  bg-[#000000] 
                  text-white 
                  shadow-lg
                  text-[18px] 
                  font-semibold 
                  leading-[22px]
                "
              >
                {!restaurants.length ? "Add main info" : "Add new main info"}
              </button>
            </div>

            {/* Versión Desktop */}
            <button 
              onClick={() => setIsMainInfoModalOpen(true)}
              className={`
                hidden            
                md:flex         
                justify-end   
                items-center      
                w-full
                whitespace-nowrap
              `}
            >
              <span className={`
                ${!restaurants.length 
                  ? "w-[329px] h-[78px] rounded-[100px] bg-[#000000] text-white flex items-center justify-center" 
                  : "text-black hover:text-black/80 text-[24px] font-semibold leading-[22px] font-['Open_Sans'] underline decoration-solid pb-4"
                }
              `}>
                {!restaurants.length ? "Add main info" : "Add new main info"}
              </span>
            </button>

            {/* Modales */}
            {isMobile ? (
              <MobileAddMainInfo
                isOpen={isMainInfoModalOpen}
                onClose={() => setIsMainInfoModalOpen(false)}
              />
            ) : (
              <AddMainInfoModal
                isOpen={isMainInfoModalOpen}
                onClose={() => setIsMainInfoModalOpen(false)}
                mode="create"
              />
            )}
          </>
        )}
      </>
    )
  }

  // Para el botón de Add new place
  if (type === 'place' && mode === 'add') {
    return (
      <>
        {access.canEdit && (
          <>
            <button 
              onClick={() => setIsPlaceInfoModalOpen(true)}
              className={`
                hidden            
                md:flex         
                justify-end   
                items-center      
                w-full
                whitespace-nowrap
              `}
            >
              <span className={`
                ${!hasPlaces 
                  ? "w-[329px] h-[78px] rounded-[100px] bg-[#000000] text-white flex items-center justify-center" 
                  : "text-black hover:text-black/80 text-[24px] font-semibold leading-[22px] font-['Open_Sans'] underline decoration-solid"
                }
              `}>
                {!hasPlaces ? "Add place" : "Add new place"}
              </span>
            </button>

            {/* Versión Móvil */}
            <div className="
              md:hidden
              flex
              justify-center
              w-full
              mt-6
            ">
              <button 
                onClick={() => setIsPlaceInfoModalOpen(true)}
                className="
                  w-[390px]
                  h-[78px]
                  bg-black
                  text-white
                  text-[18px]
                  font-semibold
                  leading-[22px]
                  rounded-[100px]
                  shadow-lg
                "
              >
                Add new place
              </button>
            </div>

            {/* Modal */}
            {isPlaceInfoModalOpen && restaurants.length > 0 && (
              <MobileAddPlaceInfo
                isOpen={isPlaceInfoModalOpen}
                onClose={() => setIsPlaceInfoModalOpen(false)}
                restaurantId={restaurants[0].id}
              />
            )}
          </>
        )}
      </>
    )
  }

  // Agregar el caso condicional para mailing después de los otros casos (special-offer, subscription)
  if (type === 'mailing' && mode === 'edit' && mailing) {
    return (
      <>
        {/* Versión Desktop */}
        <div className="hidden md:flex gap-2">
          <button 
            onClick={handleSendEmails}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>

        {/* Versión Mobile */}
        <div className="md:hidden flex flex-col w-full gap-3">
          <button 
            onClick={handleSendEmails}
            className="
              w-[345px]
              h-[78px]
              rounded-[100px]
              bg-black 
              text-white 
              font-semibold
              text-[16px]
              mx-auto
            "
          >
            Send Email
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {mode === 'add' ? (
        <>
          {access.canEdit && (
            <>
              {type === 'main-info' ? (
                <>
                  <button 
                    onClick={() => setIsMainInfoModalOpen(true)}
                    className="w-[329px] h-[78px] rounded-[100px] bg-[#000000] text-white text-[18px] font-semibold leading-[22px] font-['Open_Sans']"
                  >
                    Add main info
                  </button>

                  {isMobile ? (
                    <MobileAddMainInfo
                      isOpen={isMainInfoModalOpen}
                      onClose={() => setIsMainInfoModalOpen(false)}
                    />
                  ) : (
                    <AddMainInfoModal
                      isOpen={isMainInfoModalOpen}
                      onClose={() => setIsMainInfoModalOpen(false)}
                      mode="create"
                    />
                  )}
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsPlaceInfoModalOpen(true)}
                    className={`
                      hidden            
                      md:flex         
                      justify-end   
                      items-center      
                      px-4              
                    `}
                  >
                    <span className={`
                      ${!hasPlaces 
                        ? "w-[329px] h-[78px] rounded-[100px] bg-[#000000] text-white flex items-center justify-center" 
                        : "text-black hover:text-black/80 text-[24px] font-semibold leading-[22px] font-['Open_Sans'] underline decoration-solid"
                      }
                    `}>
                      {!hasPlaces ? "Add place" : "Add new place"}
                    </span>
                  </button>

                  {/* Versión Móvil */}
                  <div className="
                    md:hidden
                    flex
                    justify-center
                    w-full
                    mt-6
                  ">
                    <button 
                      onClick={() => setIsPlaceInfoModalOpen(true)}
                      className="
                        w-[390px]
                        h-[78px]
                        bg-black
                        text-white
                        text-[18px]
                        font-semibold
                        leading-[22px]
                        rounded-[100px]
                        shadow-lg
                      "
                    >
                      Add new place
                    </button>
                  </div>

                  {/* Modal */}
                  {isPlaceInfoModalOpen && restaurants.length > 0 && (
                    <MobileAddPlaceInfo
                      isOpen={isPlaceInfoModalOpen}
                      onClose={() => setIsPlaceInfoModalOpen(false)}
                      restaurantId={restaurants[0].id}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      ) : (
        // Nuevo código para editar
        <>
          {access.canEdit && (
            <div className="flex ">
              <button
                onClick={() => setIsMainInfoModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              >
                <Image 
                  src="/pencil.svg"
                  alt="Edit"
                  width={16}
                  height={16}
                  className="
                    w-4 h-4
                    md:w-5 md:h-5
                  "
                />
              </button>

              <button
                onClick={handleDeleteRestaurantConfirmation}
                className="p-1.5 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              >
                <Image 
                  src="/trash.svg"
                  alt="Delete"
                  width={32}
                  height={32}
 
                />
              </button>

              <AddMainInfoModal
                isOpen={isMainInfoModalOpen}
                onClose={() => setIsMainInfoModalOpen(false)}
                mode="edit"
                initialData={restaurant}
              />
            </div>
          )}
        </>
      )}
    </>
  )
}