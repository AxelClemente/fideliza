import { Toaster } from 'sonner'
import { PermissionProvider } from '../shop/contexts/permission-context'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { Breadcrumb } from "@/app/business-dashboard/components/breadcrumb"

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
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
      <div className="p-0 sm:p-8 overflow-x-hidden">
        <div className="mb-4">
          <Breadcrumb />
        </div>
        <div className="mt-6">
          {children}
        </div>
        <Toaster 
          richColors 
          position="bottom-right"
          expand={false}
          closeButton={false}
        />
      </div>
    </PermissionProvider>
  )
}