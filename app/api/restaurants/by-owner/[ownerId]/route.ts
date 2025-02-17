import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Props = {
  params: { ownerId: string }
}

export async function GET(
  req: NextRequest,
  props: Props
) {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        userId: props.params.ownerId
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 