import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'
import { ModelType, PermissionType, Role, PrismaClient } from '@prisma/client'

interface UserPermission {
  modelType: ModelType
  permission: PermissionType
}

interface UserWithPermissions {
  role: Role | null
  permissions: UserPermission[]
}

const checkUserPermissions = async (prismaClient: PrismaClient, userId: string, offerId?: string) => {
  console.log('🔒 [CHECK_PERMISSIONS] Starting permission check:', {
    userId,
    offerId
  })
  
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    include: {
      permissions: true
    }
  }) as UserWithPermissions
  
  console.log('👤 [USER_DATA]:', {
    role: user?.role,
    permissions: user?.permissions?.map((p: UserPermission) => ({
      modelType: p.modelType,
      permission: p.permission
    }))
  })

  if (user?.role === 'ADMIN') {
    console.log('👑 [ADMIN_ACCESS] Granting all permissions')
    return true
  }

  if (user?.role === 'BUSINESS') {
    console.log('💼 [BUSINESS_ACCESS] Checking ownership')
    if (!offerId) {
      console.log('➕ [BUSINESS_CREATE] Granting creation permission')
      return true
    }

    const offer = await prismaClient.offer.findFirst({
      where: {
        id: offerId,
        place: {
          restaurant: {
            userId: userId
          }
        }
      }
    })
    
    console.log('🏢 [BUSINESS_OFFER] Offer ownership check:', {
      found: !!offer,
      offerId
    })
    return !!offer
  }

  if (user?.role === 'STAFF') {
    console.log('👥 [STAFF_ACCESS] Checking permissions')
    
    const hasPermission = user.permissions?.some((p: UserPermission) => 
      p.modelType === ModelType.SPECIAL_OFFERS && p.permission === PermissionType.ADD_EDIT_DELETE
    ) || false

    console.log('🔑 [STAFF_PERMISSION] Check result:', {
      hasPermission,
      permissions: user.permissions?.map((p: UserPermission) => ({
        modelType: p.modelType,
        permission: p.permission
      }))
    })
    return hasPermission
  }

  console.log('❌ [NO_PERMISSION] No matching role or permissions found')
  return false
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, startDate, finishDate, placeId, website, images } = body

    // Validar campos requeridos
    if (!title || !description || !startDate || !finishDate || !placeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar permisos
    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Crear la oferta con sus imágenes en una transacción
    const offer = await prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          finishDate: new Date(finishDate),
          website,
          placeId,
        }
      })

      if (images?.length > 0) {
        await tx.offerImage.createMany({
          data: images.map((url: string) => ({
            url,
            publicId: url.split('/').pop()?.split('.')[0] || '',
            offerId: offer.id
          }))
        })
      }

      return offer
    })

    return NextResponse.json(offer)

  } catch (error) {
    console.error('[SPECIAL_OFFERS_POST]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('PUT request initiated for user:', session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, startDate, finishDate, placeId, website, images } = body

    // Validar campos requeridos
    if (!title || !description || !startDate || !finishDate || !placeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log('Checking permissions for PUT request')
    const hasPermission = await checkUserPermissions(prisma, session.user.id, id)
    console.log('Permission check result:', hasPermission)
    
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedOffer = await prisma.$transaction(async (tx) => {
      const offer = await tx.offer.update({
        where: { id },
        data: {
          title,
          description,
          startDate: new Date(startDate),
          finishDate: new Date(finishDate),
          website,
          placeId,
        }
      })

      await tx.offerImage.deleteMany({
        where: { offerId: id }
      })

      if (images?.length > 0) {
        await tx.offerImage.createMany({
          data: images.map((url: string) => ({
            url,
            publicId: url.split('/').pop()?.split('.')[0] || '',
            offerId: id
          }))
        })
      }

      return offer
    })

    return NextResponse.json(updatedOffer)

  } catch (error) {
    console.error('[SPECIAL_OFFERS_PUT]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 })
    }

    // Verificar que la oferta existe y pertenece al usuario
    const existingOffer = await prisma.offer.findFirst({
      where: {
        id,
        place: {
          restaurant: {
            userId: session.user.id
          }
        }
      }
    })

    if (!existingOffer) {
      return NextResponse.json({ error: "Offer not found or unauthorized" }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.offerImage.deleteMany({
        where: { offerId: id }
      })
      await tx.offer.delete({
        where: { id }
      })
    })

    return NextResponse.json({ message: "Offer deleted successfully" })

  } catch (error) {
    console.error('[SPECIAL_OFFERS_DELETE]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}