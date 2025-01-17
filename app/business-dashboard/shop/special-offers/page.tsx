import { RestaurantProvider } from '../components/restaurant-provider'
import { ClientWrapper } from '../components/client-wrapper'
import Image from 'next/image'
import { format } from 'date-fns'
import type { Offer } from '../types/types'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

interface ExtendedOffer extends Offer {
  placeName: string;
}

type Restaurant = {
  places: {
    id: string;
    name: string;
    offers: Array<Offer>;
  }[];
};

export default async function SpecialOffersPage() {
  const { restaurants } = await RestaurantProvider()
  
  const offers: ExtendedOffer[] = (restaurants as Restaurant[]).flatMap(restaurant => 
    restaurant.places.flatMap(place => 
      place.offers.map(offer => ({
        ...offer,
        placeName: place.name,
        placeId: place.id
      }))
    )
  )

  return (
    <div className="
      mx-4 
      md:mx-8 
      lg:mx-8
      -mt-4              /* Subir todo el contenido en móvil */
      md:mt-0            /* Reset en desktop */
    ">
      <div className="
        space-y-2        /* Reducir espacio vertical en móvil */
        md:space-y-4     /* Espacio normal en desktop */
      ">
        <div className="flex items-center justify-between">
          {offers.length === 0 && (
            <h2 className="
              text-[30px]          
              md:text-[30px] 
              text-[#7B7B7B] 
              font-bold
              mt-8               /* Nuevo: margen superior solo en móvil */
              md:mt-0           /* Reset del margen en desktop */
            ">
              No Special offers yet!
            </h2>
          )}
          
          <div className="hidden md:block">
            <ClientWrapper 
              type="special-offer"
              mode="add"
              restaurants={restaurants}
            />
          </div>
        </div>

        {offers.length > 0 ? (
          <>
            {/* Versión Móvil con Carrusel */}
            <div className="
              block 
              md:hidden 
              -mx-4
            ">
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full overflow-hidden"
              >
                <CarouselContent className="!gap-0 overflow-hidden px-4">
                  {offers.map((offer) => (
                    <CarouselItem 
                      key={offer.id}
                      className="basis-[calc(100vw-8px)] !pl-0 first:!pl-0 overflow-hidden"
                    >
                      <div className="
                        bg-white 
                        border
                        border-gray-100          /* Suavizado: border más fino y color más claro */
                        rounded-2xl              /* Suavizado: bordes más redondeados */
                        shadow-sm                /* Agregado: sombra suave */
                        flex 
                        flex-col 
                        overflow-hidden
                        mx-1
                      ">
                        {/* Imagen */}
                        <div className="w-full h-[244px] md:h-[200px] relative flex-shrink-0">
                          {offer.images[0] && (
                            <Image
                              src={offer.images[0].url}
                              alt={offer.title}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* Resto del contenido de la card */}
                        <div className="flex-1 p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-[20px] md:text-[24px] font-bold leading-[26px] md:leading-[30px] font-['Open_Sans'] truncate">
                              {offer.title}
                            </h3>
                            <div className="hidden md:block">
                              <ClientWrapper 
                                type="special-offer"
                                mode="edit"
                                restaurants={restaurants}
                                offer={offer}
                              />
                            </div>
                          </div>

                          <p className="text-[14px] md:text-[18px] leading-[20px] md:leading-[22px] font-['Open_Sans'] text-justify break-words">
                            {offer.description}
                          </p>

                          <div className="space-y-2 text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] font-['Open_Sans']">
                            {/* Lugar */}
                            <div className="space-y-1">
                              <span className="block text-[16px] leading-[20px] font-['Open_Sans'] pb-3 pt-3">
                                Where to use:
                              </span>
                              <div className="flex items-center gap-2 font-semibold">
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
                                <span className="
                                  !text-[14px]           /* Size: 14px */
                                  !leading-[18px]        /* Line height: 18px */
                                  !font-['Open_Sans']    /* Font: Open Sans */
                                  !font-[600]            /* Weight: 600 */
                                  !text-justify          /* Align: Justified */
                                  !leading-[21.92px]     /* Paragraph: 21.92px */
                                ">
                                  {offer.placeName}
                                </span>
                              </div>
                            </div>

                            {/* Website si existe */}
                            {offer.website && (
                              <a 
                                href={offer.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-black hover:text-black/80"
                              >
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
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                  />
                                </svg>
                                <span className="
                                  !text-[14px]           /* Móvil: 14px */
                                  !leading-[18px]        /* Móvil: 18px line height */
                                  !font-['Open_Sans']    
                                  !font-[700]            /* Móvil: weight 700 */
                                  !text-justify          /* Móvil: justified */
                                  !underline            
                                  !decoration-solid      
                                ">
                                  {offer.website}
                                </span>
                              </a>
                            )}

                            {/* Fechas */}
                            <div className="hidden md:flex items-center gap-2 font-semibold">
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
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span>
                                Valid from {format(new Date(offer.startDate), 'PP')} to {format(new Date(offer.finishDate), 'PP')}
                              </span>
                            </div>
                          </div>

                          {/* Botones móviles en la parte inferior */}
                          <div className="
                            md:hidden 
                            pt-4
                            flex               
                            items-center       
                            justify-center     
                            w-full            
                          ">
                            <ClientWrapper 
                              type="special-offer"
                              mode="edit"
                              restaurants={restaurants}
                              offer={offer}
                            />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Versión Desktop/Tablet (Diseño original) */}
            <div className="hidden md:block">
              <div className="space-y-6">
                {offers.map((offer) => (
                  <div 
                    key={offer.id} 
                    className="
                      bg-white 
                      border-2
                      border-gray-200
                      rounded-xl 
                      flex 
                      flex-row
                      overflow-hidden
                      transition-all
                      duration-300
                      ease-in-out
                      hover:shadow-lg
                      min-w-0
                    "
                  >
                    {/* Imagen */}
                    <div className="w-[642px] h-[358px] relative flex-shrink-0">
                      {offer.images[0] && (
                        <Image
                          src={offer.images[0].url}
                          alt={offer.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1 p-6 space-y-4 min-w-0 overflow-hidden">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-[24px] font-bold leading-[30px] font-['Open_Sans'] truncate">
                          {offer.title}
                        </h3>
                        <div className="block">
                          <ClientWrapper 
                            type="special-offer"
                            mode="edit"
                            restaurants={restaurants}
                            offer={offer}
                          />
                        </div>
                      </div>

                      <p className="text-[16px] md:text-[18px] leading-[20px] md:leading-[22px] font-['Open_Sans'] text-justify break-words">
                        {offer.description}
                      </p>

                      <div className="space-y-2 text-[13px] md:text-[14px] leading-[18px] md:leading-[20px] font-['Open_Sans']">
                        {/* Lugar */}
                        <div className="space-y-1">
                          <span className="block text-[16px] leading-[20px] font-['Open_Sans'] pb-3 pt-3">
                            Where to use:
                          </span>
                          <div className="flex items-center gap-2 font-semibold">
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
                            <span>{offer.placeName}</span>
                          </div>
                        </div>

                        {/* Website si existe */}
                        {offer.website && (
                          <a 
                            href={offer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-black hover:text-black/80"
                          >
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
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            <span className="underline decoration-solid">
                              {offer.website}
                            </span>
                          </a>
                        )}

                        {/* Fechas */}
                        <div className="hidden md:flex items-center gap-2 font-semibold">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            Valid from {format(new Date(offer.startDate), 'PP')} to {format(new Date(offer.finishDate), 'PP')}
                          </span>
                        </div>
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

        {/* Botón móvil al final - Ajustado el margen superior */}
        <div className="!mt-4 md:hidden">
          <ClientWrapper 
            type="special-offer"
            mode="add"
            restaurants={restaurants}
          />
        </div>
      </div>
    </div>
  )
}