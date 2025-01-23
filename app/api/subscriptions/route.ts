import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
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

const checkUserPermissions = async (prismaClient: PrismaClient, userId: string, subscriptionId?: string) => {
  console.log('🔒 [CHECK_PERMISSIONS] Starting permission check:', {
    userId,
    subscriptionId
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
    if (!subscriptionId) {
      console.log('➕ [BUSINESS_CREATE] Granting creation permission')
      return true
    }

    const subscription = await prismaClient.subscription.findFirst({
      where: {
        id: subscriptionId,
        places: {
          some: {
            restaurant: {
              userId: userId
            }
          }
        }
      }
    })
    
    console.log('🏢 [BUSINESS_SUBSCRIPTION] Subscription ownership check:', {
      found: !!subscription,
      subscriptionId
    })
    return !!subscription
  }

  if (user?.role === 'STAFF') {
    console.log('👥 [STAFF_ACCESS] Checking permissions')
    
    const hasPermission = user.permissions?.some((p: UserPermission) => 
      p.modelType === ModelType.SUBSCRIPTIONS && p.permission === PermissionType.ADD_EDIT_DELETE
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
    console.log('📝 [SUBSCRIPTIONS_POST] Starting:', { userId: session?.user?.id })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, benefits, price, placeIds, website, visitsPerMonth } = body
    
    console.log('📦 [SUBSCRIPTIONS_POST] Payload:', { 
      name, 
      benefits, 
      price, 
      placeIds, 
      website,
      visitsPerMonth 
    })

    // Validar campos requeridos
    if (!name || !benefits || !price || !placeIds?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar permisos
    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Crear la subscripción en una transacción
    const subscription = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          name,
          benefits,
          price: Number(price),
          website,
          visitsPerMonth: visitsPerMonth ? Number(visitsPerMonth) : null,
          places: {
            connect: placeIds.map((id: string) => ({ id }))
          }
        },
        include: {
          places: true
        }
      })

      return subscription
    })

    console.log('✅ [SUBSCRIPTIONS_POST] Created:', subscription.id)
    return NextResponse.json(subscription)

  } catch (error) {
    console.error('[SUBSCRIPTIONS_POST]', error)
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { name, benefits, price, placeIds, website, visitsPerMonth } = body

    // Validar campos requeridos
    if (!name || !benefits || !price || !placeIds?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar permisos
    const hasPermission = await checkUserPermissions(prisma, session.user.id, id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const subscription = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.update({
        where: { id },
        data: {
          name,
          benefits,
          price: Number(price),
          website,
          visitsPerMonth: visitsPerMonth ? Number(visitsPerMonth) : null,
          places: {
            set: placeIds.map((id: string) => ({ id }))
          }
        }
      })

      return subscription
    })

    return NextResponse.json(subscription)

  } catch (error) {
    console.error('[SUBSCRIPTIONS_PUT]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('🗑️ [SUBSCRIPTIONS_DELETE] Starting:', { userId: session?.user?.id })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Verificar permisos
    const hasPermission = await checkUserPermissions(prisma, session.user.id, id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Eliminar en una transacción
    await prisma.$transaction(async (tx) => {
      await tx.subscription.delete({
        where: { id }
      })
    })

    console.log('✅ [SUBSCRIPTIONS_DELETE] Deleted:', id)
    return NextResponse.json({ message: "Subscription deleted successfully" })

  } catch (error) {
    console.error('[SUBSCRIPTIONS_DELETE]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}