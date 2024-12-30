'use client'

import { useSearchParams } from 'next/navigation'
import VerifyCode from '../components/verifyCode'
import AuthLayout from '../components/authLayout'

export default function VerifyCodePage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const headerText = {
    title: "Forgot the password?",
    subtitle: "The confirmation code usually arrives in 55 sec"
  }

  return (
    <AuthLayout headerText={headerText}>
      <VerifyCode email={email} />
    </AuthLayout>
  )
}