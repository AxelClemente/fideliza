import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { SubscriptionStatus } from '@prisma/client'

export async function POST(req: Request) {
  try {
    // Verificar que el business está autenticado
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId, timestamp } = await req.json()

    // Verificar que el QR no ha expirado (ejemplo: 5 minutos)
    const scanTime = new Date(timestamp)
    const now = new Date()
    const diffMinutes = (now.getTime() - scanTime.getTime()) / 1000 / 60
    
    if (diffMinutes > 5) {
      return NextResponse.json({ valid: false, error: 'QR code expired' })
    }

    // Verificar la suscripción en la base de datos
    const subscription = await prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
      },
      include: {
        places: true,
        subscribers: {
          select: {
            id: true,
            status: true,
            userId: true
          }
        }
      },
    })

    if (!subscription) {
      return NextResponse.json({ valid: false, error: 'Subscription not found' })
    }

    // Verificar que la suscripción pertenece al restaurante actual
    if (subscription.places[0].restaurantId !== session.user.id) {
      return NextResponse.json({ valid: false, error: 'Invalid restaurant' })
    }

    // Verificar que la suscripción está activa
    if (subscription.subscribers[0]?.status !== SubscriptionStatus.ACTIVE) {
      return NextResponse.json({ valid: false, error: 'Subscription not active' })
    }

    // Registrar el uso de la suscripción
    await prisma.userSubscription.update({
      where: {
        id: subscription.subscribers[0].id
      },
      data: {
        lastPayment: now
      }
    })

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Error verifying subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 