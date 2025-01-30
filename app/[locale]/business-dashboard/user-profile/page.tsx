import { ProfileInfo } from './components/profile-info'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'

async function getUserProfile() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Primero obtenemos el usuario con su rol y owner
  const userWithRole = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      location: true,
      role: true,
      owner: {
        select: {
          id: true
        }
      }
    }
  })

  if (!userWithRole) return null

  // Determinamos el queryId basado en el rol
  const queryId = userWithRole.role === 'BUSINESS' 
    ? userWithRole.id 
    : userWithRole.owner?.id ?? userWithRole.id

  // Obtenemos los restaurantes usando el queryId correcto
  const restaurants = await prisma.restaurant.findMany({
    where: {
      userId: queryId
    },
    select: {
      id: true,
      title: true,
      places: {
        select: {
          id: true,
          name: true,
          location: true
        }
      }
    }
  })

  const placesWithRestaurant = restaurants.flatMap(restaurant => 
    restaurant.places.map(place => ({
      name: place.name,
      restaurantTitle: restaurant.title
    }))
  )

  // Obtenemos los permisos del usuario
  const permissions = await prisma.permission.findMany({
    where: {
      userId: session.user.id
    },
    select: {
      modelType: true,
      permission: true,
      restaurantId: true
    }
  })

  const accesses = [{
    name: "My Permissions",
    editAccess: permissions
      .filter(p => p.permission === 'ADD_EDIT_DELETE')
      .map(p => p.modelType),
    viewAccess: permissions
      .filter(p => p.permission === 'VIEW_ONLY')
      .map(p => p.modelType)
  }]

  return {
    id: userWithRole.id,
    name: userWithRole.name,
    email: userWithRole.email,
    image: userWithRole.image,
    location: userWithRole.location,
    accesses,
    places: placesWithRestaurant.map(p => `${p.name} (${p.restaurantTitle})`)
  }
}

export default async function UserProfilePage() {
  const userData = await getUserProfile()

  if (!userData) {
    return null
  }

  return (
    <ProfileInfo 
      name={userData.name}
      email={userData.email}
      image={userData.image}
      location={userData.location}
      accesses={userData.accesses}
      places={userData.places}
    />
  )
}