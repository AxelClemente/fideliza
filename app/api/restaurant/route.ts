import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { v2 as cloudinary } from 'cloudinary'
import { ModelType, PermissionType, Role, PrismaClient } from '@prisma/client'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface UserPermission {
  modelType: ModelType
  permission: PermissionType
}

interface UserWithPermissions {
  role: Role | null
  permissions: UserPermission[]
}

const checkUserPermissions = async (prismaClient: PrismaClient, userId: string, restaurantId?: string) => {
  console.log('🔒 [CHECK_PERMISSIONS] Starting permission check:', {
    userId,
    restaurantId
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
    if (!restaurantId) {
      console.log('➕ [BUSINESS_CREATE] Granting creation permission')
      return true
    }

    const restaurant = await prismaClient.restaurant.findFirst({
      where: {
        id: restaurantId,
        userId: userId
      }
    })
    
    console.log('🏢 [BUSINESS_RESTAURANT] Restaurant ownership check:', {
      found: !!restaurant,
      restaurantId
    })
    return !!restaurant
  }

  if (user?.role === 'STAFF') {
    console.log('👥 [STAFF_ACCESS] Checking permissions')
    
    const hasPermission = user.permissions?.some((p: UserPermission) => 
      p.modelType === ModelType.MAIN_INFO && p.permission === PermissionType.ADD_EDIT_DELETE
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
      console.log('❌ Unauthorized: No session found')
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verificar permisos
    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      console.log('❌ Permission denied for user:', session.user.id)
      return new NextResponse("Forbidden", { status: 403 })
    }

    const { title, description, website, images, category, subcategory } = await req.json()
    console.log('📝 Received restaurant data:', { 
      title, 
      description, 
      website, 
      category,
      subcategory,
      imageCount: images?.length 
    })

    // Validar campos requeridos
    if (!title || !description) {
      console.log('❌ Missing required fields:', { title: !!title, description: !!description })
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Crear el restaurante
    const restaurant = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          title,
          description,
          website: website || null,
          category: category || null,
          subcategory: subcategory || null,
          userId: session.user.id,
        },
      })

      if (images && images.length > 0) {
        await Promise.all(
          images.map((imageUrl: string) => 
            tx.restaurantImage.create({
              data: {
                url: imageUrl,
                publicId: imageUrl.split('/').pop()?.split('.')[0] || '',
                restaurantId: restaurant.id,
              }
            })
          )
        )
      }

      return restaurant
    })

    console.log('✅ Restaurant created:', restaurant.id)
    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('❌ [RESTAURANT_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No session found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, title, description, website, images, category, subcategory } = await req.json()
    console.log('📝 Updating restaurant:', id)

    // Verificar permisos
    const hasPermission = await checkUserPermissions(prisma, session.user.id, id)
    if (!hasPermission) {
      console.log('❌ Permission denied for user:', session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validar campos requeridos
    if (!title || !description) {
      console.log('❌ Missing required fields:', { title: !!title, description: !!description })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedRestaurant = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.update({
        where: { id },
        data: {
          title,
          description,
          website: website || null,
          category: category || null,
          subcategory: subcategory || null,
        },
        include: {
          images: true
        }
      })

      if (images?.length > 0) {
        await tx.restaurantImage.deleteMany({
          where: { restaurantId: id }
        })

        await Promise.all(
          images.map((imageUrl: string) => 
            tx.restaurantImage.create({
              data: {
                url: imageUrl,
                publicId: imageUrl.split('/').pop()?.split('.')[0] || '',
                restaurantId: id,
              }
            })
          )
        )
      }

      return restaurant
    })

    console.log('✅ Restaurant updated successfully:', id)
    return NextResponse.json(updatedRestaurant)
  } catch (error) {
    console.error('❌ [RESTAURANT_PUT]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('🗑️ [RESTAURANT_DELETE] Starting:', { userId: session?.user?.id })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
    }

    // Verificar permisos
    const hasPermission = await checkUserPermissions(prisma, session.user.id, id)
    if (!hasPermission) {
      console.log('❌ Permission denied for user:', session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Eliminar en una transacción
    await prisma.$transaction(async (tx) => {
      // Primero eliminar las imágenes asociadas
      await tx.restaurantImage.deleteMany({
        where: { restaurantId: id }
      })

      // Luego eliminar el restaurante
      await tx.restaurant.delete({
        where: { id }
      })
    })

    console.log('✅ [RESTAURANT_DELETE] Deleted:', id)
    return NextResponse.json({ message: "Restaurant deleted successfully" })

  } catch (error) {
    console.error('❌ [RESTAURANT_DELETE]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No session found')
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Buscar el restaurante asociado al usuario actual
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        userId: session.user.id
      },
      include: {
        images: true
      }
    })

    if (!restaurant) {
      return new NextResponse("Restaurant not found", { status: 404 })
    }

    console.log('✅ Restaurant fetched:', restaurant.id)
    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('❌ [RESTAURANT_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}