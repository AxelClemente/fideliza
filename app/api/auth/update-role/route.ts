import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { prisma } from '@/lib/prisma'
import { authOptions } from "@/app/api/auth/auth.config"
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

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { 
        email: session.user.email
      },
      data: updateData,
    })

    // Actualizar la sesión en la base de datos
    await prisma.session.updateMany({
      where: {
        userId: updatedUser.id
      },
      data: {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    // Crear una nueva sesión con los datos actualizados
    const sessionToken = `${updatedUser.id}_${Date.now()}`
    await prisma.session.create({
      data: {
        sessionToken: sessionToken,
        userId: updatedUser.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    console.log('✅ Role updated successfully:', {
      userId: updatedUser.id,
      newRole: updatedUser.role,
      sessionToken
    })

    return NextResponse.json({ 
      user: updatedUser,
      sessionToken // Devolver el nuevo token
    })
  } catch (error) {
    console.error('Failed to update user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' }, 
      { status: 500 }
    )
  }
}
