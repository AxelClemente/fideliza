import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    console.log('POST /api/user-subscriptions - Starting')
    
    // Verificar sesión
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener datos del body
    const { subscriptionId, placeId, amount, initialVisits } = await req.json()
    console.log('Request body:', { subscriptionId, placeId, amount, initialVisits })

    if (!subscriptionId || !placeId || !amount) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verificar que el usuario sea CUSTOMER
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'CUSTOMER') {
      console.log('User is not a customer')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Crear la suscripción del usuario
    const userSubscription = await prisma.userSubscription.create({
      data: {
        userId: session.user.id,
        subscriptionId,
        placeId,
        amount,
        remainingVisits: initialVisits,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
        lastPayment: new Date(),
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        paymentMethod: 'CREDIT_CARD' // Valor por defecto para desarrollo
      }
    })

    console.log('UserSubscription created:', userSubscription)

    // Crear registro de pago
    const payment = await prisma.payment.create({
      data: {
        userSubscriptionId: userSubscription.id,
        amount,
        status: 'COMPLETED', // Por ahora lo marcamos como completado directamente
        paymentMethod: 'CREDIT_CARD',
        transactionId: `dev_${Date.now()}` // ID temporal para desarrollo
      }
    })

    console.log('Payment created:', payment)

    return NextResponse.json({ 
      success: true, 
      userSubscription,
      payment 
    })

  } catch (error) {
    console.error('Error in POST /api/user-subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('GET /api/user-subscriptions - Starting')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar que el usuario sea CUSTOMER
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'CUSTOMER') {
      console.log('User is not a customer')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener las suscripciones del usuario con toda la información relacionada
    const userSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        subscription: {
          include: {
            places: {
              select: {
                id: true,
                name: true,
                location: true,
                phoneNumber: true
              }
            }
          }
        },
        place: {
          select: {
            id: true,
            name: true,
            location: true,
            phoneNumber: true
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    console.log('User subscriptions found:', userSubscriptions)

    return NextResponse.json({ 
      success: true, 
      userSubscriptions 
    })

  } catch (error) {
    console.error('Error in GET /api/user-subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    console.log('PATCH /api/user-subscriptions - Starting')
    
    // Verificar sesión
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener datos del body
    const { userSubscriptionId } = await req.json()
    console.log('Received userSubscriptionId:', userSubscriptionId)
    
    if (!userSubscriptionId) {
      console.log('Missing subscription ID')
      return NextResponse.json({ error: 'Missing subscription ID' }, { status: 400 })
    }

    // Verificar que la suscripción pertenece al usuario
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        id: userSubscriptionId,
        userId: session.user.id
      }
    })
    console.log('Subscription found:', subscription)

    if (!subscription) {
      console.log('Subscription not found')
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Verificar que la suscripción no esté activa y haya vencido o esté cancelada
    if (subscription.isActive || (subscription.status !== 'CANCELLED' && new Date(subscription.endDate) > new Date())) {
      console.log('Cannot delete active or non-expired subscription')
      return NextResponse.json({ error: 'Cannot delete active or non-expired subscription' }, { status: 400 })
    }

    // Actualizar el estado de la suscripción
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: userSubscriptionId },
      data: {
        status: 'CANCELLED',
        isActive: false,
        endDate: new Date() // O podrías mantener la fecha original de finalización
      }
    })
    console.log('Subscription updated:', updatedSubscription)

    return NextResponse.json({ 
      success: true, 
      subscription: updatedSubscription 
    })

  } catch (error) {
    console.error('Error in PATCH /api/user-subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}