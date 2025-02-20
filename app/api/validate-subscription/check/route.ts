import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    console.log('Axelito resolviendo - POST /api/validate-subscription/check - Starting')
    
    const { code } = await req.json()
    console.log('Axelito resolviendo - Received code:', code)

    // Buscar el código en la base de datos
    const subscriptionCode = await prisma.subscriptionCode.findUnique({
      where: { code },
      include: {
        subscription: {
          include: {
            user: {
              select: {
                name: true,
                id: true
              }
            },
            subscription: {
              select: {
                name: true
              }
            },
            place: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    console.log('Axelito resolviendo - Found subscription code:', subscriptionCode)

    if (!subscriptionCode) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    if (subscriptionCode.isUsed) {
      return NextResponse.json({ error: 'Code already used' }, { status: 400 })
    }

    if (subscriptionCode.expiresAt && subscriptionCode.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 })
    }

    const { subscription } = subscriptionCode

    if (!subscription.isActive || subscription.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Subscription is not active' }, { status: 400 })
    }

    console.log('Axelito resolviendo - Returning subscription details:', subscription)

    return NextResponse.json({
      success: true,
      subscription: {
        userName: subscription.user.name,
        subscriptionName: subscription.subscription.name,
        remainingVisits: subscription.remainingVisits,
        placeName: subscription.place.name,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
        userId: subscription.user.id
      }
    })

  } catch (error) {
    console.error('Axelito resolviendo - Error in check:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 