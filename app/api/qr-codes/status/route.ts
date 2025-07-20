import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const qrId = searchParams.get('qrId')

    if (!qrId) {
      return NextResponse.json({ error: 'qrId is required' }, { status: 400 })
    }

    // Buscar el código QR
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: qrId,
        userId: session.user.id
      },
      include: {
        subscription: {
          include: {
            subscription: true,
            place: {
              include: {
                restaurant: true
              }
            }
          }
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Verificar si ha expirado
    if (qrCode.expiresAt < new Date()) {
      return NextResponse.json({ 
        status: 'expired',
        validated: false 
      })
    }

    // Si está validado, devolver información de la validación
    if (qrCode.isValidated) {
      return NextResponse.json({ 
        status: 'validated',
        validated: true,
        validationData: {
          subscriptionId: qrCode.subscriptionId,
          subscriptionName: qrCode.subscription.subscription.name,
          placeName: qrCode.subscription.place.name,
          restaurantName: qrCode.subscription.place.restaurant.title,
          remainingVisits: qrCode.subscription.remainingVisits,
          validatedAt: qrCode.validatedAt
        }
      })
    }

    // Aún no validado
    return NextResponse.json({ 
      status: 'pending',
      validated: false 
    })
    
  } catch (error) {
    console.error('Error checking QR status:', error)
    return NextResponse.json(
      { error: 'Error checking QR status' }, 
      { status: 500 }
    )
  }
}