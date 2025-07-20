import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'

function generateQRCode(length = 8) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId } = await req.json()
    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 })
    }

    // Verificar que la suscripción pertenece al usuario
    const userSubscription = await prisma.userSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id
      }
    })

    if (!userSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Limpiar códigos expirados
    await prisma.qRCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    // Generar código único
    let code: string
    let isUnique = false
    
    while (!isUnique) {
      code = generateQRCode()
      
      const existing = await prisma.qRCode.findUnique({
        where: { code }
      })
      
      if (!existing) {
        isUnique = true
      }
    }

    // Crear el código QR en la base de datos
    const qrCode = await prisma.qRCode.create({
      data: {
        code: code!,
        subscriptionId: subscriptionId,
        userId: session.user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        isValidated: false
      }
    })

    console.log('Generated QR code:', qrCode.code, 'for subscription:', subscriptionId)

    return NextResponse.json({ 
      success: true,
      code: qrCode.code,
      qrId: qrCode.id
    })
    
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Error generating QR code' }, 
      { status: 500 }
    )
  }
}