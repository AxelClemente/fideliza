import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function MailingProvider(status: 'in_progress' | 'archive') {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { mailings: [] }
  }

  const mailingStatus = status === 'in_progress' ? 'IN_PROGRESS' : 'ARCHIVED'
  
  // Obtener el usuario con su información de owner
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      ownerId: true
    }
  })

  // Si es ADMIN, puede ver todos los mailings
  if (user?.role === 'ADMIN') {
    const mailings = await prisma.mailing.findMany({
      where: { status: mailingStatus },
      orderBy: { createdAt: 'desc' }
    })
    return { mailings }
  }

  // Para BUSINESS y STAFF, filtrar por ownerId
  const ownerId = user?.role === 'BUSINESS' ? user.id : user?.ownerId

  const whereCondition = {
    status: mailingStatus,
    ownerId: ownerId!
  } as const

  const mailings = await prisma.mailing.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' }
  })

  return { mailings }
}