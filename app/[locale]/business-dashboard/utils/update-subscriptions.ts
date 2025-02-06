import { prisma } from '@/lib/prisma'

export async function updateSubscriptionStatus() {
  const now = new Date()

  // Obtener suscripciones activas
  const subscriptions = await prisma.userSubscription.findMany({
    where: {
      status: 'ACTIVE'
    }
  })

  for (const subscription of subscriptions) {
    const endDate = new Date(subscription.endDate)
    const remainingVisits = subscription.remainingVisits ?? 0

    // Verificar si la suscripción debe ser cancelada
    if (remainingVisits <= 0 || endDate < now) {
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELLED' }
      })
    }
  }
}
