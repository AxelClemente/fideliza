import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    console.log('POST /api/validate-subscription - Starting')
    
    // 1. Verificar sesión y rol BUSINESS/STAFF
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Obtener y validar el código
    const { code } = await req.json()
    console.log('Processing code:', code)

    // 3. Buscar el código y su suscripción asociada
    const subscriptionCode = await prisma.subscriptionCode.findUnique({
      where: { code },
      include: {
        subscription: {
          include: {
            place: {
              include: {
                restaurant: {
                  select: {
                    id: true,
                    userId: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!subscriptionCode || !subscriptionCode.subscription) {
      console.log('Invalid code or subscription not found')
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    // 4. Verificar si el código ya fue usado
    if (subscriptionCode.isUsed) {
      console.log('Code already used')
      return NextResponse.json({ error: 'Code already used' }, { status: 400 })
    }

    const { subscription } = subscriptionCode

    // 5. Verificar autorización del negocio
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        role: true,
        owner: {
          select: { id: true }
        }
      }
    })

    const effectiveUserId = user?.role === 'BUSINESS' ? session.user.id : user?.owner?.id
    if (effectiveUserId !== subscription.place.restaurant.userId) {
      console.log('User not authorized for this subscription')
      return NextResponse.json({ error: 'Not authorized for this subscription' }, { status: 401 })
    }

    // 6. Actualizar visitas restantes si es necesario
    if (subscription.remainingVisits !== null) {
      if (subscription.remainingVisits <= 0) {
        console.log('No remaining visits')
        return NextResponse.json({ error: 'No remaining visits' }, { status: 400 })
      }

      console.log('Updating remaining visits for subscription:', subscription.id)
      
      // Actualizar la suscripción
      const updatedSubscription = await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          remainingVisits: {
            decrement: 1
          }
        }
      })

      console.log('Subscription updated:', updatedSubscription)

      // 7. Marcar el código como usado
      await prisma.subscriptionCode.update({
        where: { id: subscriptionCode.id },
        data: {
          isUsed: true,
          usedAt: new Date()
        }
      })

      console.log('Code marked as used')

      return NextResponse.json({
        success: true,
        message: 'Subscription validated successfully',
        remainingVisits: updatedSubscription.remainingVisits,
        subscriptionId: subscription.id,
        placeId: subscription.placeId,
        restaurantId: subscription.place.restaurant.id
      })
    }

    // 8. Si no hay visitas para contar, solo validamos
    return NextResponse.json({
      success: true,
      message: 'Subscription validated successfully',
      remainingVisits: subscription.remainingVisits,
      subscriptionId: subscription.id,
      placeId: subscription.placeId,
      restaurantId: subscription.place.restaurant.id
    })

  } catch (error) {
    console.error('Error in POST /api/validate-subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 