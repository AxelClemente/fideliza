import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    console.log('POST /api/validate-subscription/check - Starting')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await req.json()
    console.log('Checking code:', code)

    let subscriptionId: string;

    try {
      const qrData = JSON.parse(code);
      subscriptionId = qrData.subscriptionId;
    } catch (error) {
      // Si falla el parse, asumimos que es un código numérico
      const subscription = await prisma.userSubscription.findFirst({
        where: {
          isActive: true,
          status: 'ACTIVE'
        }
      });

      if (!subscription) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
      }

      subscriptionId = subscription.id;
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        id: subscriptionId,
        isActive: true,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            name: true
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
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Invalid or inactive subscription' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      subscription: {
        userName: subscription.user.name,
        subscriptionName: subscription.subscription.name,
        remainingVisits: subscription.remainingVisits,
        placeName: subscription.place.name
      }
    })

  } catch (error) {
    console.error('Error in POST /api/validate-subscription/check:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 