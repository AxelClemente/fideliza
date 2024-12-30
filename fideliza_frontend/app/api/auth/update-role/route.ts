import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'
import { Prisma, Role as PrismaRole } from '@prisma/client'

// Actualizamos los tipos para incluir todos los roles posibles
type Role = 'BUSINESS' | 'CUSTOMER' | 'ADMIN' | 'STAFF'
type AccessLevel = 'ADD_EDIT_DELETE' | 'VIEW_ONLY'

interface UpdateRoleRequest {
  role: Role
  setAsOwner?: boolean
  accessLevel?: AccessLevel
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Not authenticated' }, 
      { status: 401 }
    )
  }

  const body = await req.json() as UpdateRoleRequest
  const { role, setAsOwner, accessLevel } = body
  
  // Validamos que el rol sea válido
  if (!['BUSINESS', 'CUSTOMER', 'ADMIN', 'STAFF'].includes(role)) {
    return NextResponse.json(
      { error: 'Invalid role' }, 
      { status: 400 }
    )
  }

  try {
    const updateData = {
      role: role as PrismaRole,
      ...(role === 'BUSINESS' && setAsOwner ? { 
        owner: {
          connect: { email: session.user.email }
        }
      } : {}),
      ...(role === 'STAFF' && accessLevel ? {
        accessLevel: {
          set: accessLevel
        }
      } : {})
    } satisfies Prisma.UserUpdateInput

    const updatedUser = await prisma.user.update({
      where: { 
        email: session.user.email
      },
      data: updateData,
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Failed to update user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' }, 
      { status: 500 }
    )
  }
}
