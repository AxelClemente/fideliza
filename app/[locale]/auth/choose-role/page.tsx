'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { toast } from '@/components/ui/use-toast'
import { ClipLoader } from 'react-spinners'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ChooseRolePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'business' | 'customer' | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  const handleRoleSelection = async (role: 'business' | 'customer') => {
    setIsLoading(true)
    setSelectedRole(role)

    try {
      console.log('🚀 Starting role update process for:', role)
      console.log('👤 Current session:', session)
      
      if (role === 'business') {
        const response = await fetch('/api/auth/update-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            role: 'BUSINESS',
            setAsOwner: true
          }),
        })

        console.log('📥 Update role response:', response.status)
        
        if (!response.ok) {
          throw new Error('Failed to update role')
        }

        if (!session?.user?.email?.includes('gmail.com')) {
          console.log('🔄 Forcing session update for non-Google account...')
          await signIn('credentials', {
            redirect: false,
            email: session?.user?.email,
          })
        } else {
          console.log('🔄 Waiting for Google session update...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          const sessionResponse = await fetch('/api/auth/session')
          const sessionData = await sessionResponse.json()
          console.log('🔄 Updated session data:', sessionData)
        }

        router.push('/business-dashboard')
      } else {
        const response = await fetch('/api/auth/update-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            role: 'CUSTOMER'
          }),
        })

        console.log('📥 Update role response:', response.status)

        if (!response.ok) {
          throw new Error('Failed to update role')
        }

        if (!session?.user?.email?.includes('gmail.com')) {
          await signIn('credentials', {
            redirect: false,
            email: session?.user?.email,
          })
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000))
          const sessionResponse = await fetch('/api/auth/session')
          const sessionData = await sessionResponse.json()
          console.log('🔄 Updated session data:', sessionData)
        }

        router.push('/customer-dashboard')
      }
    } catch (error) {
      console.error('❌ Error updating role:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update role. Please try again.",
      })
      setIsLoading(false)
      setSelectedRole(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-center mb-12">
        Choose your role
      </h1>
      
      <div className="w-full flex flex-col md:flex-row justify-center gap-8">
        <button
          onClick={() => handleRoleSelection('business')}
          disabled={isLoading}
          className="flex flex-col items-center p-8 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
        >
          <div className="w-[195px] h-[195px] mb-2 relative">
            <Image
              src="/business.svg"
              alt="Business icon"
              fill
              className={`object-contain ${isLoading && selectedRole === 'business' ? 'opacity-50' : ''}`}
              priority
            />
          </div>
          <h2 className="text-[32px] font-bold leading-[36px] text-main-dark text-center font-open-sans">
            Business owner
          </h2>
          {isLoading && selectedRole === 'business' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <ClipLoader size={40} color="#0066FF" />
            </div>
          )}
        </button>

        <button
          onClick={() => handleRoleSelection('customer')}
          disabled={isLoading}
          className="flex flex-col items-center p-8 hover:bg-gray-50 transition-colors relative"
        >
          <div className="w-[195px] h-[195px] mb-2 relative">
            <Image
              src="/customer-choose-role.svg"
              alt="Customer icon"
              fill
              className={`object-contain ${isLoading && selectedRole === 'customer' ? 'opacity-50' : ''}`}
              priority
            />
          </div>
          <h2 className="text-[32px] font-bold leading-[36px] text-main-dark text-center font-open-sans">
            Customer
          </h2>
          {isLoading && selectedRole === 'customer' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <ClipLoader size={40} color="#0066FF" />
            </div>
          )}
        </button>
      </div>
    </div>
  )
}