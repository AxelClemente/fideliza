'use client'

import { usePermissions } from '../../shop/contexts/permission-context'
import { ModelType } from '@prisma/client'
import { AddNewOffersMailingsModal } from "../modal/add-new-offers-mailings"
import { useState } from "react"
import { toast } from "sonner"
import { useSearchParams, useRouter } from 'next/navigation'
import type { Mailing } from "../../shop/types/types"
import { Restaurant } from '@/app/business-dashboard/shop/types/types'
import { ClipLoader } from "react-spinners"
import { useTranslations } from 'next-intl'

interface MailingActionsProps {
  mode?: 'edit'
  mailing?: Mailing
  showOnlyButton?: boolean
  showOnlyTabs?: boolean
  restaurants: Restaurant[]
  showSendButton?: boolean
  hasMailing?: boolean
}

export function MailingActions({ 
  mode,
  mailing,
  showOnlyButton = false,
  showOnlyTabs = false,
  restaurants,
  showSendButton = false,
  hasMailing = false
}: MailingActionsProps) {
  const { canAccess } = usePermissions()
  const access = canAccess(ModelType.OFFERS_MAILINGS)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMailing, setEditingMailing] = useState<Mailing | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'in_progress'
  const [isSending, setIsSending] = useState(false)
  const t = useTranslations('BusinessDashboard')

  // Si no tiene permisos de edición y está en modo edit, no mostrar nada
  if (mode === 'edit' && !access.canEdit) {
    return null
  }

  // Si no tiene permisos de vista, no mostrar nada
  if (!access.canView) {
    return null
  }

  // Función para manejar la edición
  const handleEditMailing = (mailing: Mailing) => {
    setEditingMailing(mailing)
    setIsAddModalOpen(true)
  }

  // Función para archivar
  const handleArchiveMailing = async () => {
    try {
      const response = await fetch(`/api/mailing?id=${mailing?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'ARCHIVED'
        })
      })

      if (!response.ok) throw new Error('Failed to archive mailing')

      toast.success('Mailing archived successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to archive mailing')
    }
  }

  // Función para confirmar el archivo
  const handleArchiveConfirmation = () => {
    toast(
      "Are you sure you want to archive this mailing?",
      {
        duration: Infinity,
        position: "bottom-right",
        style: {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
        action: {
          label: "Archive",
          onClick: () => handleArchiveMailing(),
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
      }
    )
  }

  // Función para eliminar
  const handleDeleteMailing = async () => {
    try {
      const response = await fetch(`/api/mailing?id=${mailing?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete mailing')

      toast.success('Mailing deleted successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete mailing')
    }
  }

  // Función para confirmar la eliminación
  const handleDeleteConfirmation = () => {
    toast(
      "Are you sure you want to delete this mailing?",
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
          onClick: () => handleDeleteMailing(),
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
      }
    )
  }

  // Función para enviar correos electrónicos
  const handleSendEmails = async (mailing: Mailing) => {
    if (isSending) return
    setIsSending(true)
    
    try {
      const currentPlace = restaurants.flatMap(restaurant => 
        restaurant.places.find(place => place.id === mailing.location)
      ).find(Boolean)

      if (!currentPlace) {
        toast.error('Place not found')
        return
      }

      const response = await fetch('/api/send-mailing-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mailing.name,
          description: mailing.description,
          location: currentPlace.name,
          placeId: mailing.location
        })
      })

      if (!response.ok) throw new Error('Failed to send emails')
      toast.success('Emails sent successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send emails')
    } finally {
      setIsSending(false)
    }
  }

  // Modo edición
  if (mode === 'edit' && mailing) {
    return (
      <div className="flex -gap-3 sm:gap-2">
        {access.canEdit && (
          <>
            <button
              onClick={() => handleEditMailing(mailing)}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
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

            {showSendButton && (
              <button 
                onClick={() => handleSendEmails(mailing!)}
                disabled={isSending}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
              >
                {isSending ? (
                  <ClipLoader size={20} color="#000000" />
                ) : (
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
                )}
              </button>
            )}

            <button 
              onClick={handleArchiveConfirmation}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 25"
              >
                <path 
                  d="M4.382 9.27198V17.772C4.382 18.617 4.726 19.428 5.339 20.025C5.95687 20.6257 6.78522 20.961 7.647 20.959H16.353C17.219 20.959 18.049 20.623 18.661 20.025C18.9628 19.7323 19.2029 19.3822 19.3673 18.9952C19.5317 18.6083 19.6169 18.1924 19.618 17.772V9.27198M4.382 9.27198C3.48 9.27198 2.75 8.55798 2.75 7.67798V5.55298C2.75 4.67298 3.481 3.95898 4.382 3.95898H19.618C20.52 3.95898 21.25 4.67298 21.25 5.55298V7.67798C21.25 8.55798 20.519 9.27198 19.618 9.27198M4.382 9.27198H19.618" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M12 17.459V12.459" 
                  strokeWidth="2"
                  strokeMiterlimit="10" 
                  strokeLinecap="round"
                />
                <path 
                  d="M14.293 13.4565L12.326 11.4895C12.2832 11.4466 12.2324 11.4125 12.1765 11.3893C12.1205 11.366 12.0606 11.3541 12 11.3541C11.9394 11.3541 11.8794 11.366 11.8235 11.3893C11.7675 11.4125 11.7167 11.4466 11.674 11.4895L9.70697 13.4565" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            <button 
              onClick={handleDeleteConfirmation}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
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

            {editingMailing && (
              <AddNewOffersMailingsModal
                isOpen={isAddModalOpen}
                onClose={() => {
                  setIsAddModalOpen(false)
                  setEditingMailing(null)
                }}
                mode="edit"
                initialData={editingMailing}
                restaurants={restaurants}
              />
            )}
          </>
        )}
      </div>
    )
  }

  // Modo por defecto (añadir)
  return (
    <>
      {!showOnlyButton && (
        <div className="
          flex 
          sm:justify-start    /* Alineación normal en desktop */
          justify-center      /* Centrado en móvil */
          gap-4 
          border-b 
          border-gray-200
        ">
          <button
            onClick={() => router.push('/business-dashboard/mailings?tab=in_progress')}
            className={`
              pb-4 
              px-4
              text-[20px]          /* Tamaño de texto en móvil */
              sm:text-[16px]       /* Tamaño de texto en desktop */
              font-[700]           /* Peso de la fuente */
              font-['Open_Sans']   /* Tipo de fuente */
              leading-[26px]       /* Altura de línea */
              ${activeTab === 'in_progress' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500'
              }
            `}
          >
            {t('inProgress')}
          </button>
          <button
            onClick={() => router.push('/business-dashboard/mailings?tab=archive')}
            className={`
              pb-4 
              px-4
              text-[20px]          /* Tamaño de texto en móvil */
              sm:text-[16px]       /* Tamaño de texto en desktop */
              font-[700]           /* Peso de la fuente */
              font-['Open_Sans']   /* Tipo de fuente */
              leading-[26px]       /* Altura de línea */
              ${activeTab === 'archive' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500'
              }
            `}
          >
            {t('archive')}
          </button>
        </div>
      )}

      {!showOnlyTabs && (
        <div className={`
          flex 
          justify-end     
          ${!hasMailing ? 'fixed bottom-6 left-0 right-0 px-3' : ''}          
          md:relative    
          md:bottom-0   
          md:left-0     
          md:right-0
          md:mr-20      
        `}>
          {access.canEdit && (
            <>
              {/* Versión Desktop - Sin cambios */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className={`
                  hidden          
                  md:block       
                  ${hasMailing 
                    ? "text-black underline text-[24px] font-semibold leading-[32px]" 
                    : "bg-black text-white w-[329px] h-[78px] rounded-[100px] text-[18px] font-semibold leading-[22px] font-['Open_Sans']"
                  }
                `}
              >
                {t('addNewOffersMailing')}
              </button>

              {/* Versión Móvil */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="
                  md:hidden      
                  bg-black 
                  text-white 
                  w-[390px]          
                  h-[78px]           
                  rounded-[100px]    
                  text-[18px] 
                  font-semibold 
                  leading-[22px] 
                  font-['Open_Sans']
                  mx-auto
                  block
                "
              >
                {t('addNewOffersMailing')}
              </button>

              <AddNewOffersMailingsModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                restaurants={restaurants}
              />
            </>
          )}
        </div>
      )}
    </>
  )
}