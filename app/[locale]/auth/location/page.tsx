import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'
import Location from '../components/location'
import AuthLayout from '../components/authLayout'
import { authOptions } from "@/app/api/auth/auth.config"

export default async function LocationPage() {
  const session = await getServerSession(authOptions)
  
  // Log para debugging
  console.log('Location Page - Session:', {
    exists: !!session,
    user: session?.user,
    location: session?.user?.location
  })

  // Si no hay sesión, redirigir a login
  if (!session?.user) {
    redirect('/auth?mode=signin')
  }

  // Si el usuario ya tiene una ubicación, redirigir según su rol
  if (session.user.location) {
    if (session.user.role === 'CUSTOMER') {
      redirect('/customer-dashboard')
    } else if (session.user.role === 'BUSINESS' || session.user.role === 'STAFF' || session.user.role === 'ADMIN') {
      redirect('/business-dashboard')
    } else {
      redirect('/auth/choose-role')
    }
  }

  const headerText = {
    title: "Choose your city",
    subtitle: "You can change it at any time on the home page"
  }

  return (
    <AuthLayout headerText={headerText}>
      <Location />
    </AuthLayout>
  )
}