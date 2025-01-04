import { ModelType, PermissionType, Role } from '@prisma/client'

export interface BusinessUser {
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
}

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: 'ADMIN' | 'STAFF'
  permissions?: Array<{
    modelType: ModelType
    permission: PermissionType
    restaurantId: string
  }>
}