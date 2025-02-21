import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener el usuario con su owner y restaurant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        owner: {
          include: {
            restaurants: true
          }
        }
      }
    })

    // Obtener el suscriptor para su nombre
    const validationData = await req.json()
    const subscriber = await prisma.user.findUnique({
      where: { id: validationData.subscriberId },
      select: { name: true }
    })

    console.log('Saving validation data:', validationData)
    console.log('User data:', user)
    console.log('Subscriber data:', subscriber)

    const validation = await prisma.subscriptionValidation.create({
      data: {
        subscriberId: validationData.subscriberId,
        subscriberName: subscriber?.name || 'Unknown',
        subscriptionId: validationData.subscriptionId,
        subscriptionName: validationData.subscriptionName,
        remainingVisits: validationData.remainingVisits,
        placeId: validationData.placeId,
        placeName: validationData.placeName,
        restaurantId: user?.owner?.restaurants[0]?.id,
        staffId: session.user.id,
        ownerId: user?.owner?.id || user?.id, // Si es owner, usa su propio id
        status: validationData.status,
        startDate: new Date(validationData.startDate),
        endDate: new Date(validationData.endDate)
      }
    })

    return NextResponse.json({ success: true, validation })
  } catch (error) {
    console.error('Error saving validation:', error)
    return NextResponse.json(
      { error: 'Error saving validation' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    console.log('GET /api/validate-subscription/save-validation - Starting')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const subscriberId = searchParams.get('subscriberId')
    
    const validations = await prisma.subscriptionValidation.findMany({
      where: {
        subscriberId: subscriberId || undefined,
        ownerId: session.user.id,
      },
      orderBy: {
        validationDate: 'desc'
      },
      select: {
        id: true,
        validationDate: true,
        subscriptionName: true,
        placeName: true,
        remainingVisits: true,
        startDate: true,
        endDate: true
      }
    })

    console.log('Validations data:', validations)
    return NextResponse.json({ success: true, validations })
  } catch (error) {
    console.error('Error fetching validations:', error)
    return NextResponse.json(
      { error: 'Error fetching validations' },
      { status: 500 }
    )
  }
} 