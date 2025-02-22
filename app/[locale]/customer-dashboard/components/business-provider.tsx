import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import type { Restaurant, Place, Subscription as SubscriptionType } from '@/app/[locale]/business-dashboard/shop/types/types'

// Interfaces
interface CurrentUser {
  id: string;
  role: Role | null;
}

interface BusinessProviderResult {
  restaurants: Restaurant[];
  places: Place[];
  subscriptions: SubscriptionType[];
  getRestaurantById: (id: string) => Promise<Restaurant | null>;
  getPlacesByRestaurantId: (restaurantId: string) => Promise<Place[]>;
  getSubscriptionsByPlaceId: (placeId: string) => Promise<SubscriptionType[]>;
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
      images: {
        select: {
          id: true,
          url: true,
          publicId: true,
          restaurantId: true,
          createdAt: true
        }
      },
      places: {
        include: {
          offers: {
            include: {
              images: {
                select: {
                  id: true,
                  url: true,
                  publicId: true,
                  offerId: true
                }
              },
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
              period: true,
              places: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }
    }
  })

  // Obtener todos los places
  const places = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      phoneNumber: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true,
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
      period: true,
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
  }).then(subs => subs.map(sub => ({
    ...sub,
    period: sub.period || 'MONTHLY'
  })) as SubscriptionType[]);
  console.log('Subscriptions from DB:', JSON.stringify(subscriptions, null, 2))

  // Funciones auxiliares para obtener datos específicos
  const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
    return await prisma.restaurant.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            url: true,
            publicId: true,
            restaurantId: true,
            createdAt: true
          }
        },
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
                period: true,
                places: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  const getPlacesByRestaurantId = async (restaurantId: string): Promise<Place[]> => {
    return await prisma.place.findMany({
      where: { restaurantId },
      select: {
        id: true,
        name: true,
        location: true,
        phoneNumber: true,
        restaurantId: true,
        createdAt: true,
        updatedAt: true,
        offers: {
          include: {
            images: true
          }
        },
        subscriptions: true
      }
    })
  }

  const getSubscriptionsByPlaceId = async (placeId: string): Promise<SubscriptionType[]> => {
    const subs = await prisma.subscription.findMany({
      where: {
        places: {
          some: { id: placeId }
        }
      },
      select: {
        id: true,
        name: true,
        benefits: true,
        price: true,
        website: true,
        visitsPerMonth: true,
        period: true,
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
    });

    return subs.map(sub => ({
      ...sub,
      period: sub.period || 'MONTHLY'
    })) as SubscriptionType[];
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