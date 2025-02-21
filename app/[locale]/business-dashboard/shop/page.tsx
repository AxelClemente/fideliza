import { RestaurantProvider } from './components/restaurant-provider'
import { ClientWrapper } from './components/client-wrapper'
import type { Restaurant } from './types/types'
import { ImageSlider } from './components/image-slider'
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { DescriptionText } from './components/description-text'
import { getTranslations } from 'next-intl/server'

export default async function ShopPage() {
  const { restaurants } = await RestaurantProvider()
  const t = await getTranslations('BusinessDashboard')

  return (
    <div className="w-full px-4 md:px-8 max-w-full overflow-x-hidden">
      <div className="space-y-2 md:space-y-6">
        <div >
          <div className="
            -mx-4           
            px-4            
            md:mx-0         
            md:px-0
            -mt-2 md:mt-0
          ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {(!restaurants || restaurants.length === 0) && (
                <h2 className="
                  text-[30px]          
                  md:text-[40px] 
                  font-semibold 
                  text-[#7B7B7B]
                  mt-8               
                  md:mt-0           
                  whitespace-nowrap
                ">
                  {t('noMainInfo')}
                </h2>
              )}
              <div className={`
                ${restaurants.length > 0 ? 'hidden md:flex md:justify-end md:w-full' : ''}
              `}>
                <ClientWrapper type="main-info" restaurants={restaurants} mode="add" />
              </div>
            </div>
            
            {restaurants.length > 0 ? (
              <div className="space-y-6">
                {restaurants.map((restaurant: Restaurant) => (
                  <div key={restaurant.id} className="
                    flex 
                    flex-col 
                    md:flex-row 
                    gap-6
                    md:mx-0   
                  ">
                    {restaurant.images && restaurant.images.length > 0 && (
                      <div className="
                        w-screen 
                        relative
                        left-[50%]
                        right-[50%]
                        ml-[-50vw]
                        mr-[-50vw]
                        md:w-auto 
                        md:left-0
                        md:right-0
                        md:ml-0
                        md:mr-0
                        -mt-[25px]
                        mt-0.5              /* Añadido: margen superior en móvil */
                        md:mt-0           /* Reset del margen en desktop */
                      ">
                        <ImageSlider 
                          images={restaurant.images}
                          title={restaurant.title}
                        />
                      </div>
                    )}
                    <div className="
                      flex-1 
                      space-y-2 
                      px-4 
                      md:px-0
                      md:mx-0   
                    ">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                          <h3 className="
                            !text-[24px]          
                            md:!text-[30px]       
                            !leading-[32px]       
                            md:!leading-[36px]    
                            !font-['Open_Sans'] 
                            !font-bold 
                            !text-black
                          ">
                            {restaurant.title}
                          </h3>
                          <ClientWrapper 
                            type="main-info" 
                            restaurants={restaurants}
                            restaurant={restaurant} 
                            mode="edit" 
                          />
                        </div>
                      </div>
                      <DescriptionText text={restaurant.description} />
                      {restaurant.website && (
                        <a 
                          href={restaurant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            hidden           // <- Oculto por defecto
                            md:block         // <- Visible en pantallas medianas y mayores
                            !text-[20px] 
                            !leading-[26px] 
                            !font-['Open_Sans'] 
                            !font-bold 
                            !text-black 
                            !underline 
                            !decoration-solid
                            !mt-4
                            block
                          "
                        >
                          {restaurant.website}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Nuevo: Contenedor para el botón en móvil cuando hay restaurantes */}
                <div className="md:hidden">
                  <ClientWrapper type="main-info" restaurants={restaurants} mode="add" />
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
              </div>
            )}
          </div>
        </div>

        {/* Separador */}
        <hr className="hidden md:block border-gray-200" />

        {/* Sección Places */}
        <div className="
          space-y-2 
          md:space-y-6
          -mx-4           
          px-4            
          md:mx-0         
          md:px-0
          overflow-visible  /* Nuevo: asegurar que no hay overflow oculto */
        ">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-4">
            <h2 className="
              !text-[24px]          
              md:!text-[30px]       
              !leading-[32px]       
              md:!leading-[36px]    
              !font-['Open_Sans']   
              !font-bold          
              pl-4              
              md:pl-0
              mt-6              
              md:mt-0           
              text-[#7B7B7B]
            ">
              {t('places')} ({restaurants.reduce((total, restaurant) => total + restaurant.places.length, 0)})
            </h2>

            {/* Botón Add new place solo en desktop */}
            <div className="hidden md:block">
              <ClientWrapper 
                type="place" 
                restaurants={restaurants}
              />
            </div>
          </div>
          
          {restaurants.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
              }}
              className="
                w-[calc(100%+16px)]   /* Cambiado: ancho ajustado */
                -ml-2                  /* Cambiado: margen negativo más pequeño */
                md:w-full          
                md:ml-0
                overflow-visible   
              "
            >
              <CarouselContent className="
                !gap-1             /* Gap pequeño en móvil */
                md:!gap-4         /* Restaurar gap original en desktop */
                overflow-visible   
              ">
                {restaurants.map((restaurant: Restaurant) => (
                  restaurant.places.map((place) => (
                    <CarouselItem 
                      key={place.id} 
                      className="
                        basis-[calc(100vw-24px)]  /* Cambiado: ajuste del ancho base */
                        md:basis-[550px] 
                        !pl-2              
                        first:!pl-2        
                        md:!pl-4           
                        md:first:!pl-4     
                        overflow-visible
                      "
                    >
                      <div className="
                        bg-[#F9F9F9] 
                        p-4 
                        rounded-[20px]
                        flex 
                        justify-between 
                        items-start
                        w-full
                        md:w-[550px]
                        min-h-[100px]
                        md:min-h-[183px]
                        relative
                        transition-all
                        duration-300
                        ease-in-out
                        hover:shadow-lg
                        hover:scale-[1.02]
                        cursor-pointer
                        !mx-2              /* Márgenes pequeños en móvil */
                        md:!mx-4          /* Restaurar márgenes en desktop */
                      ">
                        <div className="space-y-2 pl-4 flex-1">
                          <h3 className="
                            !text-[20px]
                            md:!text-[30px]
                            !font-['Open_Sans']
                            !font-bold
                            !leading-[24px]
                            md:!leading-[36px]
                            !text-black
                          ">
                            {place.name}
                          </h3>
                          <div className="flex items-center gap-2">
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
                                d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9a2 2 0 110-4 2 2 0 010 4z"
                              />
                            </svg>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                text-[18px]           
                                md:!text-[20px]
                                leading-[22px]        
                                md:!leading-[26px]
                                font-['Open_Sans']    
                                font-semibold         
                                md:!font-semibold
                                whitespace-nowrap
                                md:!underline
                                md:!decoration-solid
                                line-clamp-1
                                md:line-clamp-none
                                max-w-[270px]
                                md:max-w-none
                                overflow-hidden
                                text-ellipsis
                                text-justify
                                hover:text-blue-600
                                transition-colors
                              "
                            >
                              {place.location}
                            </a>
                          </div>
                          {place.phoneNumber && (
                            <div className="flex items-center gap-2">
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
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <a 
                                href={`tel:${place.phoneNumber}`}
                                className="
                                  text-[18px]           
                                  md:!text-[20px]
                                  leading-[22px]        
                                  md:!leading-[26px]
                                  font-['Open_Sans']    
                                  font-semibold         
                                  md:!font-semibold
                                  whitespace-nowrap
                                  md:!underline
                                  md:!decoration-solid
                                  line-clamp-1
                                  md:line-clamp-none
                                  max-w-[270px]
                                  md:max-w-none
                                  overflow-hidden
                                  text-ellipsis
                                  text-justify
                                  hover:text-blue-600
                                  transition-colors
                                "
                              >
                                {place.phoneNumber}
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-4 right-4">
                          <ClientWrapper 
                            type="place"
                            mode="edit"
                            restaurants={restaurants}
                            place={{
                              ...place,
                              restaurantId: restaurant.id
                            }}
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div className="text-gray-500">
              
            </div>
          )}

          {/* Botón Add new place en móvil */}
          <div className="mt-6 md:hidden">
            <ClientWrapper 
              type="place" 
              restaurants={restaurants}
            />
          </div>
        </div>
      </div>
    </div>
  )
}