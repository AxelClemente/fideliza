import { MailingProvider } from './components/mailing-provider'
import { MailingActions } from './components/mailing-actions'
import { Breadcrumb } from "@/app/business-dashboard/components/breadcrumb"
import { Toaster } from 'sonner'
import type { Mailing } from './../shop/types/types'
import { RestaurantProvider } from '@/app/business-dashboard/shop/components/restaurant-provider'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

// Función auxiliar para limitar palabras (añadir al inicio del archivo)
function truncateWords(text: string, limit: number) {
  const words = text.split(' ')
  if (words.length > limit) {
    return words.slice(0, limit).join(' ') + '...'
  }
  return text
}

export default async function MailingsPage(props: PageProps) {
  // Esperamos a que se resuelvan los searchParams
  const searchParamsData = await Promise.resolve(props.searchParams)
  const tabValue = searchParamsData?.tab?.toString()
  const activeTab = tabValue === 'archive' ? 'archive' : 'in_progress'
  
  // Obtenemos tanto los mailings como los restaurants
  const { mailings } = await MailingProvider(activeTab)
  const { restaurants } = await RestaurantProvider()
  const hasMailings = mailings && mailings.length > 0

  return (
    <div className="
      p-0           /* Eliminar padding en móvil */
      sm:p-8        /* Restaurar padding en desktop */
    ">
      {/* Título solo para móvil */}
      <h1 className="
        block          /* Mostrar en móvil */
        sm:hidden      /* Ocultar en desktop */
        text-center
        !text-[24px]
        font-[700]
        font-['Open_Sans']
        mb-6
        mt-4
      ">
        Offers mailings
      </h1>

      <div className="mb-4">
        <Breadcrumb />
      </div>

      <div className="
        space-y-6
        mx-0        /* Eliminar margen horizontal en móvil */
        md:mx-8     /* Restaurar margen horizontal en desktop */
      ">
        {/* Desktop Actions */}
        <div className="hidden sm:flex justify-between items-center">
          <MailingActions hasMailings={hasMailings} restaurants={restaurants} />
        </div>
        
        {/* Mobile Tabs */}
        <div className="block sm:hidden">
          <MailingActions hasMailings={hasMailings} showOnlyTabs restaurants={restaurants} />
        </div>
        
        {!hasMailings ? (
          <div>
            <h2 className="
              !text-[22px]          
              md:!text-[30px]       
              text-[#7B7B7B] 
              font-bold 
              !leading-[28px]       
              md:!leading-[36px]    
              font-['Open_Sans']
            ">
              No Mailings yet!
            </h2>
            {/* Mobile Actions - Solo el botón */}
            <div className="mt-6 block sm:hidden">
              <MailingActions hasMailings={hasMailings} showOnlyButton restaurants={restaurants} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {mailings.map((mailing: Mailing) => (
              <div 
                key={mailing.id} 
                className="
                  bg-[#F9F9F9] 
                  p-6 
                  rounded-xl 
                  hover:shadow-lg 
                  transition-all 
                  duration-300 
                  ease-in-out
                  w-[360px]        /* Ancho más pequeño en móvil para crear espacio */
                  h-[170px]        /* Alto fijo en móvil */
                  md:w-auto        /* Ancho automático en desktop */
                  md:h-auto        /* Alto automático en desktop */
                  mx-auto          /* Centrar en móvil */
                  md:mx-0          /* Quitar centrado en desktop */
                "
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="
                    space-y-1        /* Menos espacio en móvil */
                    sm:space-y-4     /* Espacio original en desktop */
                    w-full
                  ">
                    <div className="flex justify-between items-start">
                      <h3 className="!text-[20px] font-bold leading-[30px] font-['Open_Sans']">
                        {mailing.name}
                      </h3>
                      <div className="block sm:hidden">
                        <MailingActions 
                          mode="edit" 
                          mailing={mailing} 
                          hasMailings={hasMailings} 
                          restaurants={restaurants}
                        />
                      </div>
                    </div>
                    <div className="!text-[14px] font-bold">
                      <span className="font-bold">To all Subscribers </span>
                      <span className="capitalize">
                        {mailing.subscriptionStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[16px] leading-[24px] text-gray-600">
                      <span className="block sm:hidden">
                        {truncateWords(mailing.description, 13)}
                      </span>
                      <span className="hidden sm:block">
                        {mailing.description}
                      </span>
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <MailingActions 
                      mode="edit" 
                      mailing={mailing} 
                      hasMailings={hasMailings} 
                      restaurants={restaurants}
                      showSendButton={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Toaster 
        richColors 
        position="bottom-right"
        expand={false}
        closeButton={false}
      />
    </div>
  )
}