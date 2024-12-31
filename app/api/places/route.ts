import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "../auth/[...nextauth]/route"
import { ModelType, PermissionType, Role, PrismaClient } from '@prisma/client'

// Interfaces para tipar correctamente
interface UserPermission {
  modelType: ModelType
  permission: PermissionType
}

interface UserWithPermissions {
  role: Role | null
  permissions: UserPermission[]
}

const checkUserPermissions = async (prismaClient: PrismaClient, userId: string, placeId?: string) => {
  console.log('🔒 [CHECK_PERMISSIONS] Starting permission check:', {
    userId,
    placeId
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

  // Si es ADMIN, tiene todos los permisos
  if (user?.role === 'ADMIN') {
    console.log('👑 [ADMIN_ACCESS] Granting all permissions')
    return true
  }

  // Si es BUSINESS, verificar si el place pertenece a su restaurante
  if (user?.role === 'BUSINESS') {
    console.log('💼 [BUSINESS_ACCESS] Checking ownership')
    if (!placeId) {
      console.log('➕ [BUSINESS_CREATE] Granting creation permission')
      return true
    }

    const place = await prismaClient.place.findFirst({
      where: {
        id: placeId,
        restaurant: {
          userId: userId
        }
      }
    })
    
    console.log('🏢 [BUSINESS_PLACE] Place ownership check:', {
      found: !!place,
      placeId
    })
    return !!place
  }

  // Si es STAFF, verificar sus permisos
  if (user?.role === 'STAFF') {
    console.log('👥 [STAFF_ACCESS] Checking permissions')
    
    const hasPermission = user.permissions?.some((p: UserPermission) => 
      p.modelType === ModelType.PLACES && p.permission === PermissionType.ADD_EDIT_DELETE
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, location, phoneNumber, restaurantId } = await req.json()

    // Validar campos requeridos
    if (!name || !location || !restaurantId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar permisos
    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const place = await prisma.place.create({
      data: {
        name,
        location,
        phoneNumber,
        restaurantId
      },
      include: {
        restaurant: true
      }
    })

    return NextResponse.json(place)
  } catch (error) {
    console.error('[PLACE_POST]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('PUT request initiated for user:', session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, name, location, phoneNumber, restaurantId } = await req.json()

    // Validar campos requeridos
    if (!name || !location || !restaurantId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log('Checking permissions for PUT request')
    const hasPermission = await checkUserPermissions(prisma, session.user.id, id)
    console.log('Permission check result:', hasPermission)
    
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedPlace = await prisma.place.update({
      where: { id },
      data: {
        name,
        location,
        phoneNumber
      },
      include: {
        restaurant: true
      }
    })

    return NextResponse.json(updatedPlace)
  } catch (error) {
    console.error('[PLACE_PUT] Detailed error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener el ID del place de la URL
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Place ID is required" }, { status: 400 })
    }

    // Verificar que el place existe y pertenece al usuario
    const existingPlace = await prisma.place.findFirst({
      where: {
        id,
        restaurant: {
          userId: session.user.id
        }
      }
    })

    if (!existingPlace) {
      return NextResponse.json({ error: "Place not found or unauthorized" }, { status: 404 })
    }

    // Eliminar el place
    await prisma.place.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Place deleted successfully" })
  } catch (error) {
    console.error('[PLACE_DELETE]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}