import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.id) // Debug session

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const subscriberId = searchParams.get('subscriberId')
    const restaurantId = searchParams.get('restaurantId')
    
    console.log('Query params:', { subscriberId, restaurantId }) // Debug params

    if (!subscriberId || !restaurantId) {
      return NextResponse.json({ error: 'Subscriber ID and Restaurant ID are required' }, { status: 400 })
    }

    // Obtener las suscripciones del usuario filtradas por restaurante
    const userSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId: subscriberId,
        place: {
          restaurantId: restaurantId
        }
      },
      include: {
        subscription: true,
        place: true,
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log('Found subscriptions:', userSubscriptions.length) // Debug results

    // Transformar los datos para mostrar el historial
    const transactions = userSubscriptions.flatMap(subscription => {
      const baseTransaction = {
        id: subscription.id,
        code: subscription.id.slice(-8).toUpperCase(),
        timestamp: subscription.updatedAt,
        subscriptionType: subscription.subscription.name,
        remainingVisits: subscription.remainingVisits,
        placeName: subscription.place.name
      }

      const paymentTransactions = subscription.payments.map(payment => ({
        id: payment.id,
        code: payment.transactionId || payment.id.slice(-8).toUpperCase(),
        timestamp: payment.createdAt,
        subscriptionType: subscription.subscription.name,
        remainingVisits: subscription.remainingVisits,
        placeName: subscription.place.name,
        amount: payment.amount,
        status: payment.status
      }))

      return [baseTransaction, ...paymentTransactions]
    })

    const sortedTransactions = transactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    console.log('Returning transactions:', sortedTransactions.length) // Debug final result

    return NextResponse.json({ transactions: sortedTransactions })

  } catch (error) {
    console.error('Error in GET /api/user-transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 