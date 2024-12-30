import { PermissionProvider } from '../shop/contexts/permission-context'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { Toaster } from 'sonner'

export default async function MailingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  // Obtener los permisos del usuario
  const permissions = session?.user?.id 
    ? await prisma.permission.findMany({
        where: { userId: session.user.id }
      })
    : []

  return (
    <PermissionProvider 
      permissions={permissions}
      role={session?.user?.role ?? null}
    >
      {children}
      <Toaster 
        richColors 
        position="bottom-right"
        expand={false}
        closeButton={false}
      />
    </PermissionProvider>
  )
}