'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SignInForm from '@/app/[locale]/auth/components/signInForm'
import SignUpForm from '@/app/[locale]/auth/components/signUpForm'
import AuthLayout from '@/app/[locale]/auth/components/authLayout'
import { useTranslations } from 'next-intl'

// Componente que usa useSearchParams
function AuthContent() {
  const t = useTranslations('Auth')
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get('mode')
  
  const headerText = mode === 'signup' 
    ? {
        title: t('signUp'),
        subtitle: t('signUpSubtitle'),
        subtitleClassName: "hidden sm:block mb-6 sm:mb-0"
      }
    : {
        title: t('signIn'),
        subtitle: t('signInSubtitle'),
        subtitleClassName: "hidden sm:block mb-6 sm:mb-0"
      }

  return (
    <div className="relative">
      {/* Botón de retorno */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-8 left-5 z-10 flex items-center text-main-dark hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="h-6 w-6 mr-1" />
        <span className="text-sm font-medium"></span>
      </button>
      
      <AuthLayout headerText={headerText}>
        {mode === 'signup' ? <SignUpForm /> : <SignInForm />}
      </AuthLayout>
    </div>
  )
}

// Página principal envuelta en Suspense
export default function AuthPage() {
  const t = useTranslations('Auth')
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">{t('loading')}</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}