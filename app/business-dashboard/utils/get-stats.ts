import { prisma } from '@/lib/prisma'

// First, let's define proper interfaces for our data structures
interface ViewData {
  _count: number
  date: string
}

interface AggregatedData {
  _count: number
  date: Date
}

export async function getRestaurantStats(restaurantId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
  const previousThirtyDays = new Date(thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30))

  // Obtener las ofertas destacadas del restaurante
  const featuredOffers = await prisma.offer.findMany({
    where: {
      place: {
        restaurantId
      }
    },
    select: {
      id: true,
      title: true,
      images: {
        select: {
          url: true
        }
      },
      place: {
        select: {
          name: true
        }
      }
    }
  })

  // Obtener vistas y calcular cambio porcentual (código existente)
  const currentViews = await prisma.restaurantView.count({
    where: {
      restaurantId,
      viewedAt: { gte: thirtyDaysAgo }
    }
  })

  const previousViews = await prisma.restaurantView.count({
    where: {
      restaurantId,
      viewedAt: {
        gte: previousThirtyDays,
        lt: thirtyDaysAgo
      }
    }
  })

  // Calcular ingresos de suscripciones del último mes
  const currentEarnings = await prisma.userSubscription.aggregate({
    where: {
      place: {
        restaurantId
      },
      isActive: true,
      startDate: { gte: thirtyDaysAgo }
    },
    _sum: {
      amount: true
    }
  })

  // Calcular ingresos del mes anterior
  const previousEarnings = await prisma.userSubscription.aggregate({
    where: {
      place: {
        restaurantId
      },
      isActive: true,
      startDate: {
        gte: previousThirtyDays,
        lt: thirtyDaysAgo
      }
    },
    _sum: {
      amount: true
    }
  })

  const currentAmount = currentEarnings._sum.amount || 0
  const previousAmount = previousEarnings._sum.amount || 0
  const earningsChange = previousAmount === 0 
    ? 100 
    : ((currentAmount - previousAmount) / previousAmount) * 100

  const viewsChange = previousViews === 0 
    ? 100 
    : ((currentViews - previousViews) / previousViews) * 100

  // Contar nuevas suscripciones del último mes
  const currentSubs = await prisma.userSubscription.count({
    where: {
      place: {
        restaurantId
      },
      isActive: true,
      startDate: { gte: thirtyDaysAgo }
    }
  })

  // Contar suscripciones del mes anterior
  const previousSubs = await prisma.userSubscription.count({
    where: {
      place: {
        restaurantId
      },
      isActive: true,
      startDate: {
        gte: previousThirtyDays,
        lt: thirtyDaysAgo
      }
    }
  })

  const subsChange = previousSubs === 0 
    ? 100 
    : ((currentSubs - previousSubs) / previousSubs) * 100

  // Obtener vistas de ofertas
  const offerViews = await Promise.all(
    featuredOffers.map(async (offer) => {
      const currentViews = await (prisma as any).offerView.count({
        where: {
          offerId: offer.id,
          viewedAt: { gte: thirtyDaysAgo }
        }
      })

      const previousViews = await (prisma as any).offerView.count({
        where: {
          offerId: offer.id,
          viewedAt: {
            gte: previousThirtyDays,
            lt: thirtyDaysAgo
          }
        }
      })

      const change = previousViews === 0 
        ? 100 
        : ((currentViews - previousViews) / previousViews) * 100

      return {
        offerId: offer.id,
        value: currentViews.toString(),
        change: `${change > 0 ? '+' : ''}${change.toFixed(0)}%`,
        changeType: change >= 0 ? "positive" : "negative" as const
      }
    })
  )

  const subscriptionWithUser = await prisma.userSubscription.findMany({
    take: 5, // Limitamos a los 5 más recientes
    where: {
      place: {
        restaurantId
      },
      isActive: true
    },
    orderBy: {
      startDate: 'desc'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  })

  return {
    views: {
      value: currentViews.toString(),
      change: `${viewsChange > 0 ? '+' : ''}${viewsChange.toFixed(0)}%`,
      changeType: viewsChange >= 0 ? "positive" : "negative" as const
    },
    earnings: {
      value: `€${currentAmount.toFixed(2)}`,
      change: `${earningsChange > 0 ? '+' : ''}${earningsChange.toFixed(0)}%`,
      changeType: earningsChange >= 0 ? "positive" : "negative" as const
    },
    subscriptions: {
      value: currentSubs.toString(),
      change: `${subsChange > 0 ? '+' : ''}${subsChange.toFixed(0)}%`,
      changeType: subsChange >= 0 ? "positive" : "negative",
      subscribers: subscriptionWithUser.map(sub => ({
        id: sub.user.id,
        name: sub.user.name || 'Unknown',
        email: sub.user.email || 'No email',
        imageUrl: sub.user.image || undefined
      }))
    },
    offerViews: offerViews.map(view => ({
      ...view,
      changeType: view.changeType as "positive" | "negative"
    }))
  } as const
} 