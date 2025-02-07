import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'
import { ModelType, PermissionType, Prisma, Role } from '@prisma/client'

// Tipos simplificados incluyendo permisos de usuarios
type UserWithRestaurants = {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  password: string | null
  location: string | null
  role: Role | null
  createdAt: Date
  updatedAt: Date
  owner: { id: string } | null
  restaurants: {
    id: string
    title: string
    description: string | null
    userId: string
    places: {
      id: string
      name: string
      location: string
      phoneNumber?: string | null
    }[]
  }[]
  permissions?: Array<{
    modelType: ModelType
    permission: PermissionType
    restaurantId: string
  }>
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  password: true,
  location: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true
    }
  },
  restaurants: {
    select: {
      id: true,
      title: true,
      description: true,
      userId: true,
      places: {
        select: {
          id: true,
          name: true,
          location: true,
          phoneNumber: true
        }
      }
    }
  },
  permissions: {
    select: {
      modelType: true,
      permission: true,
      restaurantId: true
    }
  }
} satisfies Prisma.UserSelect

export async function BusinessUserProvider() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { businessUser: null, currentUser: null, staff: [] }
  }

  try {
    console.log('📝 [USER_PROVIDER] Getting current user:', session.user.id)
    
    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        role: {
          in: ['BUSINESS', 'ADMIN', 'STAFF'] as Role[]
        }
      },
      select: userSelect
    }) as UserWithRestaurants | null

    if (!currentUser) {
      console.log('❌ [USER_PROVIDER] No current user found')
      return { businessUser: null, currentUser: null, staff: [] }
    }

    // Si es ADMIN o STAFF, buscamos su owner
    const businessOwner = currentUser.role !== 'BUSINESS' 
      ? await prisma.user.findUnique({
          where: {
            id: currentUser.owner?.id,
            role: 'BUSINESS' as Role
          },
          select: userSelect
        }) as UserWithRestaurants
      : currentUser

    // Obtenemos el staff con sus permisos
    const staff = await prisma.user.findMany({
      where: {
        owner: { id: businessOwner.id },
        OR: [
          { role: 'ADMIN' as Role },
          { role: 'STAFF' as Role }
        ]
      },
      select: userSelect
    }) as UserWithRestaurants[]

    console.log('✅ [USER_PROVIDER] Staff found:', staff.length, 'members')
    console.log('📝 [USER_PROVIDER] User permissions:', currentUser.permissions)

    return { 
      businessUser: businessOwner,
      currentUser,
      staff 
    }
  } catch (error) {
    console.error('❌ [USER_PROVIDER] Error:', error)
    return { businessUser: null, currentUser: null, staff: [] }
  }
}