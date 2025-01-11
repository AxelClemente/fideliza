'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SignInForm from '@/app/auth/components/signInForm'
import SignUpForm from '@/app/auth/components/signUpForm'
import AuthLayout from '@/app/auth/components/authLayout'

// Componente que usa useSearchParams
function AuthContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  
  const headerText = mode === 'signup' 
    ? {
        title: "Welcome!",
        subtitle: "First time, you should login or sign up",
        subtitleClassName: "hidden sm:block mb-6 sm:mb-0"
      }
    : {
        title: "Welcome!",
        subtitle: "First time, you should login or sign up",
        subtitleClassName: "hidden sm:block mb-6 sm:mb-0"
      }

  return (
    <AuthLayout headerText={headerText}>
      {mode === 'signup' ? <SignUpForm /> : <SignInForm />}
    </AuthLayout>
  )
}

// Página principal envuelta en Suspense
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}