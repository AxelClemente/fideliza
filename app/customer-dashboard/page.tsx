import { DashboardClient } from './components/dashboard-client'
import { BusinessProvider } from './components/business-provider'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth.config"

export default async function CustomerDashboardPage() {
  const { restaurants } = await BusinessProvider()
  const session = await getServerSession(authOptions)
  const userLocation = session?.user?.location || 'No location set'

  console.log('Page render:', { 
    hasRestaurants: Boolean(restaurants?.length),
    userLocation 
  })

  return (
    <DashboardClient 
      restaurants={restaurants || []}
      userLocation={userLocation} 
    />
  )
}