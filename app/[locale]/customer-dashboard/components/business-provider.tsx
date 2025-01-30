import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import type { Restaurant, Place, Subscription } from '../../[locale]/business-dashboard/shop/types/types'

// Interfaces
interface CurrentUser {
  id: string;
  role: Role | null;
}

interface BusinessProviderResult {
  restaurants: Restaurant[];
  places: Place[];
  subscriptions: Subscription[];
  getRestaurantById: (id: string) => Promise<Restaurant | null>;
  getPlacesByRestaurantId: (restaurantId: string) => Promise<Place[]>;
  getSubscriptionsByPlaceId: (placeId: string) => Promise<Subscription[]>;
}

export async function BusinessProvider(): Promise<BusinessProviderResult> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      restaurants: [],
      places: [],
      subscriptions: [],
      getRestaurantById: async () => null,
      getPlacesByRestaurantId: async () => [],
      getSubscriptionsByPlaceId: async () => []
    }
  }

  // Verificar que el usuario sea CUSTOMER
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true
    }
  }) as CurrentUser | null

  if (!user || user.role !== 'CUSTOMER') {
    return {
      restaurants: [],
      places: [],
      subscriptions: [],
      getRestaurantById: async () => null,
      getPlacesByRestaurantId: async () => [],
      getSubscriptionsByPlaceId: async () => []
    }
  }

  // Obtener todos los restaurantes con sus relaciones
  const restaurants = await prisma.restaurant.findMany({
    include: {
      images: true,
      places: {
        include: {
          offers: {
            include: {
              images: true,
              place: {
                select: {
                  id: true,
                  name: true,
                  location: true,
                  phoneNumber: true
                }
              }
            }
          },
          subscriptions: true
        }
      }
    }
  })

  // Obtener todos los places
  const places = await prisma.place.findMany({
    include: {
      offers: {
        include: {
          images: true
        }
      },
      subscriptions: true
    }
  })

  // Obtener todas las subscriptions
  const subscriptions = await prisma.subscription.findMany({
    select: {
      id: true,
      name: true,
      benefits: true,
      price: true,
      website: true,
      visitsPerMonth: true,
      places: {
        select: {
          id: true,
          name: true,
          location: true,
          phoneNumber: true
        }
      }
    }
  })
  console.log('Subscriptions from DB:', JSON.stringify(subscriptions, null, 2))

  // Funciones auxiliares para obtener datos específicos
  const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        images: true,
        places: {
          select: {
            id: true,
            name: true,
            location: true,
            phoneNumber: true,
            restaurantId: true,
            offers: {
              include: {
                images: true,
                place: {
                  select: {
                    id: true,
                    name: true,
                    location: true,
                    phoneNumber: true,
                    restaurantId: true
                  }
                }
              }
            },
            subscriptions: {
              select: {
                id: true,
                name: true,
                benefits: true,
                price: true,
                website: true,
                visitsPerMonth: true,
                places: {
                  select: {
                    id: true,
                    name: true,
                    location: true,
                    phoneNumber: true,
                    restaurantId: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return restaurant
  }

  const getPlacesByRestaurantId = async (restaurantId: string) => {
    return await prisma.place.findMany({
      where: { restaurantId },
      include: {
        offers: {
          include: {
            images: true
          }
        },
        subscriptions: true
      }
    })
  }

  const getSubscriptionsByPlaceId = async (placeId: string) => {
    return await prisma.subscription.findMany({
      where: {
        places: {
          some: {
            id: placeId
          }
        }
      },
      select: {
        id: true,
        name: true,
        benefits: true,
        price: true,
        website: true,
        createdAt: true,
        updatedAt: true,
        places: true
      }
    })
  }

  return {
    restaurants,
    places,
    subscriptions,
    getRestaurantById,
    getPlacesByRestaurantId,
    getSubscriptionsByPlaceId
  }
}