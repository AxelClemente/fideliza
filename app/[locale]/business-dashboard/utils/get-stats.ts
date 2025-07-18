import { prisma } from '@/lib/prisma'

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

  // NUEVO: Contar validaciones de suscripciones del último mes
  console.log('Consultando validaciones para restaurante:', restaurantId)
  const currentVisits = await prisma.subscriptionValidation.count({
    where: {
      restaurantId,
      validationDate: { gte: thirtyDaysAgo }
    }
  })
  console.log('Validaciones actuales encontradas:', currentVisits)

  // NUEVO: Contar validaciones del mes anterior
  const previousVisits = await prisma.subscriptionValidation.count({
    where: {
      restaurantId,
      validationDate: {
        gte: previousThirtyDays,
        lt: thirtyDaysAgo
      }
    }
  })
  console.log('Validaciones previas encontradas:', previousVisits)

  // NUEVO: Calcular cambio porcentual en validaciones
  const visitsChange = previousVisits === 0 
    ? 100 
    : ((currentVisits - previousVisits) / previousVisits) * 100
  console.log('Cambio porcentual en validaciones:', visitsChange)

  // Obtener vistas de ofertas
  const offerViews = await Promise.all(
    featuredOffers.map(async (offer) => {
      const currentViews = await prisma.offerView.count({
        where: {
          offerId: offer.id,
          viewedAt: { gte: thirtyDaysAgo }
        }
      })

      const previousViews = await prisma.offerView.count({
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
    where: {
      place: {
        restaurantId
      },
      isActive: true
    },
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      remainingVisits: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      subscription: {
        select: {
          id: true,
          name: true,
          benefits: true,
          visitsPerMonth: true
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
        imageUrl: sub.user.image || undefined,
        subscription: {
          id: sub.id,
          type: sub.subscription.name,
          name: sub.subscription.name,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          remainingVisits: sub.remainingVisits
        }
      }))
    },
    // NUEVO: Añadir estadísticas de visitas
    visits: {
      value: currentVisits.toString(),
      change: `${visitsChange > 0 ? '+' : ''}${visitsChange.toFixed(0)}%`,
      changeType: visitsChange >= 0 ? "positive" : "negative" as const
    },
    offerViews: offerViews.map(view => ({
      ...view,
      changeType: view.changeType as "positive" | "negative"
    }))
  } as const
} 