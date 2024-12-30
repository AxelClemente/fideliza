import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

// Definir la interfaz para el usuario
interface CurrentUser {
  id: string;
  role: Role | null;
  owner: {
    id: string;
  } | null;
}

export async function RestaurantProvider() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { restaurants: [] }
  }

  const userSelect = {
    id: true,
    role: true,
    owner: {
      select: {
        id: true
      }
    }
  } as const

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: userSelect
  }) as CurrentUser | null

  const queryId = user?.role === 'BUSINESS' 
    ? user.id 
    : user?.owner?.id ?? user?.id

  const restaurants = await prisma.restaurant.findMany({
    where: {
      userId: queryId
    },
    include: {
      images: true,
      places: {
        include: {
          offers: {
            include: {
              images: true
            }
          },
          subscriptions: true
        }
      }
    }
  })

  return { restaurants }
}