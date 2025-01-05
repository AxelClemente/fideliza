import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { ModelType, PermissionType, Role, PrismaClient } from '@prisma/client'

// Interfaces para tipar correctamente
interface UserPermission {
  modelType: ModelType
  permission: PermissionType
}

interface UserWithPermissions {
  id: string
  role: Role | null
  permissions: UserPermission[]
  ownerId: string | null
}

const checkUserPermissions = async (prismaClient: PrismaClient, userId: string) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    include: {
      permissions: true
    }
  }) as UserWithPermissions
  
  // Si es ADMIN, tiene todos los permisos
  if (user?.role === 'ADMIN') {
    return { hasPermission: true, ownerId: null }
  }

  // Si es BUSINESS, tiene permisos sobre sus propios mailings
  if (user?.role === 'BUSINESS') {
    return { hasPermission: true, ownerId: user.id }
  }

  // Si es STAFF, verificar permisos y obtener ownerId
  if (user?.role === 'STAFF') {
    const hasPermission = user.permissions?.some((p: UserPermission) => 
      p.modelType === ModelType.OFFERS_MAILINGS && 
      p.permission === PermissionType.ADD_EDIT_DELETE
    ) || false

    return { 
      hasPermission, 
      ownerId: user.ownerId 
    }
  }

  return { hasPermission: false, ownerId: null }
}

// CREATE mailing
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { hasPermission, ownerId } = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    
    const mailing = await prisma.mailing.create({
      data: {
        ...body,
        ownerId: ownerId!,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        subscriptionStatus: 'PENDING',
        lastVisit: new Date().toISOString(),
      }
    })

    return NextResponse.json(mailing)
  } catch (error) {
    console.error('[MAILINGS_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// GET all mailings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const mailings = await prisma.mailing.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(mailings)
  } catch (error) {
    console.error('[MAILINGS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// UPDATE mailing
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      id,
      name, 
      description, 
      startDate, 
      endDate, 
      time,
      subscriptionStatus,
      lastVisit,
      location 
    } = body

    if (!id) {
      return new NextResponse("Mailing ID is required", { status: 400 })
    }

    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedMailing = await prisma.mailing.update({
      where: {
        id
      },
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        time,
        subscriptionStatus,
        lastVisit,
        location
      }
    })

    return NextResponse.json(updatedMailing)
  } catch (error) {
    console.error('[MAILINGS_PUT]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// DELETE mailing
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse("Mailing ID is required", { status: 400 })
    }

    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const deletedMailing = await prisma.mailing.delete({
      where: {
        id
      }
    })

    return NextResponse.json(deletedMailing)
  } catch (error) {
    console.error('[MAILINGS_DELETE]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// PATCH mailing status
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const hasPermission = await checkUserPermissions(prisma, session.user.id)
    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!id) {
      return new NextResponse("Mailing ID is required", { status: 400 })
    }

    const updatedMailing = await prisma.mailing.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(updatedMailing)
  } catch (error) {
    console.error('[MAILINGS_PATCH]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}