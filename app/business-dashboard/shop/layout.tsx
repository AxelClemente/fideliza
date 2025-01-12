import { ShopTabs } from "@/app/business-dashboard/shop/components/shop-tabs"
import { Breadcrumb } from "@/app/business-dashboard/components/breadcrumb"
import { Toaster } from 'sonner'
import { PermissionProvider } from './contexts/permission-context'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'
import { TabContentWrapper } from "./components/tab-content-wrapper"

export default async function ShopLayout({
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
      <div className="p-0 md:p-8">
        <div className="hidden md:block mb-4">
          <Breadcrumb />
        </div>
        <div className="mt-[20px] md:mt-0">
          <ShopTabs />
        </div>
        <div className="mt-4 md:mt-8">
          <TabContentWrapper>
            {children}
          </TabContentWrapper>
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