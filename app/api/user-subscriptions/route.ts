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
    const body = await req.json()
    console.log('Request body:', body)

    const { subscriptionId, placeId, amount } = body

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
        status: 'ACTIVE', // Por ahora lo ponemos como activo directamente
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
        lastPayment: new Date(),
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount,
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