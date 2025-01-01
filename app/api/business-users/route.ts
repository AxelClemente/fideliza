import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { prisma } from '@/lib/prisma'
import { authOptions } from "../auth/[...nextauth]/route"
import { hash } from 'bcryptjs'
import { ModelType, PermissionType, Role, PrismaClient } from '@prisma/client'

interface UserPermission {
  modelType: ModelType
  permission: PermissionType
  restaurantId?: string
}

interface UserWithPermissions {
  role: Role | null
  permissions: UserPermission[]
}

interface PermissionCreate {
  modelType: ModelType
  permission: PermissionType
  restaurantId?: string
}

const checkUserPermissions = async (prismaClient: PrismaClient, userId: string) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    include: {
      permissions: true
    }
  }) as UserWithPermissions

  if (user?.role === 'BUSINESS' || user?.role === 'ADMIN') {
    return true
  }

  if (user?.role === 'STAFF') {
    return user.permissions?.some(p => 
      p.modelType === 'ADMIN_USERS' && p.permission === 'ADD_EDIT_DELETE'
    ) || false
  }

  return false
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('📝 [POST] Request body:', body)
    
    // Validación de campos requeridos
    if (!body.name || !body.email || !body.password || !body.role || !body.ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Verificar permisos del usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true
      }
    })

    if (!currentUser?.role || (currentUser.role !== 'BUSINESS' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Not authorized to create users' },
        { status: 403 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await hash(body.password, 12)

    // Crear usuario con manejo de permisos opcional
    const userData = {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role as Role,
      ownerId: body.ownerId,
      canDeleteShop: body.role === 'STAFF' ? !!body.canDeleteShop : false,
    }

    // Solo agregar permisos si es STAFF y hay permisos definidos
    if (body.role === 'STAFF' && Array.isArray(body.permissions)) {
      const newUser = await prisma.user.create({
        data: {
          ...userData,
          permissions: {
            create: body.permissions.map((p: PermissionCreate) => ({
              modelType: p.modelType,
              permission: p.permission,
              restaurantId: p.restaurantId
            }))
          }
        },
        include: {
          permissions: true
        }
      })
      
      console.log('✅ [POST] Created user with permissions:', {
        userId: newUser.id,
        role: newUser.role,
        permissions: newUser.permissions
      })

      return NextResponse.json({ user: newUser })
    }

    // Crear usuario sin permisos
    const newUser = await prisma.user.create({
      data: userData,
      include: {
        permissions: true
      }
    })

    console.log('✅ [POST] Created user without permissions:', {
      userId: newUser.id,
      role: newUser.role
    })

    return NextResponse.json({ user: newUser })

  } catch (error: any) {
    console.error('❌ [POST] Failed to create user:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Not authenticated' }, 
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verificar permisos usando checkUserPermissions
    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Not authorized to delete this user' },
        { status: 403 }
      )
    }

    // Eliminar usuarioo
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, role, permissions } = body

    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role: role as Role,
        ...(Array.isArray(permissions) && {
          permissions: {
            deleteMany: {
              userId: id
            },
            create: permissions.map((p: PermissionCreate) => ({
              modelType: p.modelType,
              permission: p.permission,
              restaurantId: p.restaurantId
            }))
          }
        })
      },
      include: {
        permissions: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: unknown) {
    console.error('[BUSINESS_USERS_PATCH]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}