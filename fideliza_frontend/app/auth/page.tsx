'use client'

import { useSearchParams } from 'next/navigation'
import SignInForm from '@/app/auth/components/signInForm'
import SignUpForm from '@/app/auth/components/signUpForm'
import AuthLayout from '@/app/auth/components/authLayout'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  
  const headerText = mode === 'signup' 
    ? {
        title: "Welcome!",
        subtitle: "First time, you should login or sign up",
        subtitleClassName: "hidden sm:block"
      }
    : {
        title: "Welcome!",
        subtitle: "First time, you should login or sign up",
        subtitleClassName: "hidden sm:block"
      }

  return (
    <AuthLayout headerText={headerText}>
      {mode === 'signup' ? <SignUpForm /> : <SignInForm />}
    </AuthLayout>
  )
}