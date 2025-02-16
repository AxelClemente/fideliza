import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'

interface QRCodeData {
  subscriptionId: string
  timestamp: string
  restaurantName: string
  placeName: string
  numericCode: string
  remainingVisits: number | null
}

export async function POST(req: Request) {
  try {
    console.log('POST /api/validate-subscription - Starting')
    
    // 1. Verificar sesión y rol BUSINESS
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mejorar la consulta del usuario para incluir todos los campos necesarios
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,      // Agregar id del usuario
        role: true,
        owner: {
          select: { id: true }
        },
        restaurants: { // Agregar relación con restaurants
          select: {
            id: true,
            places: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    console.log('User data:', {
      id: user?.id,
      role: user?.role,
      ownerId: user?.owner?.id,
      restaurants: user?.restaurants
    })

    if (!user || (user.role !== 'BUSINESS' && user.role !== 'STAFF')) {
      console.log('User is not authorized:', user?.role)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Obtener y validar el código
    const { code } = await req.json()
    console.log('Processing code:', code)

    let subscriptionId: string;
    let qrData: QRCodeData;

    try {
      // Intentar parsear como JSON (para códigos QR)
      qrData = JSON.parse(code) as QRCodeData;
      subscriptionId = qrData.subscriptionId;
      console.log('Decoded QR data:', qrData);
    } catch {
      // Si falla el parse, asumimos que es un código numérico
      console.log('Not a JSON code, processing as numeric code:', code);
      
      // Aquí necesitamos buscar la suscripción por el código numérico
      const subscription = await prisma.userSubscription.findFirst({
        where: {
          isActive: true,
          status: 'ACTIVE'
        },
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
      });

      if (!subscription) {
        console.log('No active subscription found for numeric code');
        return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
      }

      subscriptionId = subscription.id;
    }

    // 3. Buscar la suscripción con más detalles
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        id: subscriptionId,
        isActive: true,
        status: 'ACTIVE'
      },
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
    })

    console.log('Found subscription:', subscription)

    if (!subscription) {
      console.log('Subscription not found or inactive')
      return NextResponse.json({ error: 'Invalid or inactive subscription' }, { status: 400 })
    }

    // 4. Verificar que el negocio que valida es el dueño de la suscripción
    const effectiveUserId = user.role === 'BUSINESS' ? user.id : user.owner?.id
    const restaurantUserId = subscription.place.restaurant.userId

    console.log('Authorization check:', {
      effectiveUserId,
      restaurantUserId,
      isAuthorized: effectiveUserId === restaurantUserId
    })

    if (effectiveUserId !== restaurantUserId) {
      console.log('Business not authorized for this subscription')
      return NextResponse.json({ error: 'Not authorized for this subscription' }, { status: 401 })
    }

    // 5. Actualizar visitas restantes
    if (subscription.remainingVisits !== null) {
      if (subscription.remainingVisits <= 0) {
        console.log('No remaining visits')
        return NextResponse.json({ error: 'No remaining visits' }, { status: 400 })
      }

      const updatedSubscription = await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          remainingVisits: subscription.remainingVisits - 1
        }
      })

      console.log('Updated subscription:', updatedSubscription)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Subscription validated successfully',
      remainingVisits: subscription.remainingVisits !== null ? subscription.remainingVisits - 1 : null
    })

  } catch (error) {
    console.error('Error in POST /api/validate-subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 