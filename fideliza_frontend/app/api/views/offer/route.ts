import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { offerId } = await request.json()

    const view = await (prisma as any).offerView.create({
      data: {
        offerId
      }
    })

    return NextResponse.json(view)
  } catch (error) {
    console.error('Error tracking offer view:', error)
    return NextResponse.error()
  }
}