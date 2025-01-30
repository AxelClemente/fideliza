import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'
import { BusinessHeader } from "./components/business-header"
import { MobileBusinessHeader } from "./components/mobile-business-header"
import { authOptions } from "@/app/api/auth/auth.config"
import { SubscribersDataProvider } from "./context/subscribers-provider"
import { prisma } from "@/lib/prisma"
import { MainContentWrapper } from "./components/main-content-wrapper"
import { Metadata } from 'next'
import { metadata as siteMetadata } from '../../metadata-config'

export const metadata: Metadata = {
  title: siteMetadata.business.title,
  description: siteMetadata.business.description,
}

export default async function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const userRole = session.user?.role
  if (!userRole || (userRole !== 'BUSINESS' && userRole !== 'STAFF' && userRole !== 'ADMIN')) {
    console.log('Redirecting: Invalid role', userRole)
    redirect('/choose-role')
  }

  // Obtener el usuario con su rol y owner
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      owner: {
        select: {
          id: true
        }
      }
    }
  })

  // Determinar el queryId basado en el rol
  const queryId = user?.role === 'BUSINESS' 
    ? user.id 
    : user?.owner?.id ?? user?.id

  // Obtener el primer restaurante del usuario
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      userId: queryId
    },
    select: {
      id: true
    }
  })

  return (
    <div className="flex flex-col w-full min-h-screen">
      <SubscribersDataProvider restaurantId={restaurant?.id ?? "default"}>
        <div className="block sm:hidden">
          <MobileBusinessHeader />
        </div>
        <div className="hidden sm:block">
          <BusinessHeader />
        </div>
        <main className="w-full flex-1 mt-16 sm:mt-0">
          <MainContentWrapper>
            {children}
          </MainContentWrapper>
        </main>
      </SubscribersDataProvider>
    </div>
  )
}