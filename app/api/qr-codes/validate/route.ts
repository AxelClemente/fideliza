import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    console.log('Validating QR code:', code)

    // Buscar el código QR
    const qrCode = await prisma.qRCode.findUnique({
      where: { code },
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
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid QR code' 
      }, { status: 404 })
    }

    // Verificar si ya fue validado
    if (qrCode.isValidated) {
      return NextResponse.json({ 
        success: false, 
        error: 'QR code already used' 
      }, { status: 400 })
    }

    // Verificar si ha expirado
    if (qrCode.expiresAt < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'QR code expired' 
      }, { status: 400 })
    }

    // Verificar si la suscripción tiene visitas disponibles
    if (qrCode.subscription.remainingVisits !== null && qrCode.subscription.remainingVisits <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No remaining visits' 
      }, { status: 400 })
    }

    const currentDate = new Date()
    
    // Calcular visitas restantes ANTES de la transacción
    const updatedRemainingVisits = qrCode.subscription.remainingVisits !== null 
      ? qrCode.subscription.remainingVisits - 1 
      : null

    // Actualizar en una transacción
    await prisma.$transaction(async (tx) => {
      // Marcar QR como validado
      await tx.qRCode.update({
        where: { id: qrCode.id },
        data: {
          isValidated: true,
          validatedAt: currentDate
        }
      })

      // Actualizar visitas restantes si no es ilimitado
      if (qrCode.subscription.remainingVisits !== null) {
        await tx.userSubscription.update({
          where: { id: qrCode.subscriptionId },
          data: {
            remainingVisits: qrCode.subscription.remainingVisits - 1
          }
        })
      }

      // Guardar validación en historial
      await tx.subscriptionValidation.create({
        data: {
          subscriberId: qrCode.userId,
          subscriptionId: qrCode.subscriptionId,
          subscriptionName: qrCode.subscription.subscription.name,
          remainingVisits: updatedRemainingVisits,
          placeName: qrCode.subscription.place.name,
          restaurantId: qrCode.subscription.place.restaurant.id,
          validationDate: currentDate
        }
      })
    })

    console.log('QR validation successful:', {
      subscriptionId: qrCode.subscriptionId,
      userId: qrCode.userId,
      remainingVisits: updatedRemainingVisits
    })

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: qrCode.subscriptionId,
        subscriptionName: qrCode.subscription.subscription.name,
        placeName: qrCode.subscription.place.name,
        restaurantName: qrCode.subscription.place.restaurant.title,
        remainingVisits: updatedRemainingVisits,
        validationDate: currentDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Error validating QR code:', error)
    return NextResponse.json(
      { error: 'Error validating QR code' },
      { status: 500 }
    )
  }
}