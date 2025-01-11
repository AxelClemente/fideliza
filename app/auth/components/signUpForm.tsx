'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { User, Mail, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignUpForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      if (res.ok) {
        router.push('/auth?mode=signin')
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('An error occurred during registration')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        callbackUrl: '/auth/location',
        redirect: false,
      })

      if (result?.error) {
        setError('Error signing in with Google')
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch {
      setError('An error occurred during Google sign in')
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      const result = await signIn('facebook', {
        callbackUrl: '/auth/location',
        redirect: false,
      })

      if (result?.error) {
        setError('Error signing in with Facebook')
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch {
      setError('An error occurred during Facebook sign in')
    }
  }

  return (
    <div className="w-[400px] sm:w-[514px] h-[800px] sm:h-[822px] bg-white rounded-[20px] shadow-[0_10px_50px_0_rgba(0,0,0,0.1)] p-4 flex flex-col items-center">
      <div className="flex gap-2 mb-6 mt-12">
        <span className="cursor-pointer font-['Open_Sans'] text-[20px] leading-[32.68px] font-[700] text-main-dark">
          Sign up
        </span>
        <span className="font-['Open_Sans'] text-[20px] leading-[32.68px] font-[700] text-third-gray">|</span>
        <span 
          className="cursor-pointer font-['Open_Sans'] text-[20px] leading-[32.68px] font-[700] text-third-gray"
          onClick={() => router.push('/auth?mode=signin')}
        >
          Sign in
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 flex flex-col items-center">
        {error && (
          <div className="p-3 text-red-500 bg-red-100 rounded-md text-sm w-[390px] sm:w-[462px]">
            {error}
          </div>
        )}
        
        <div className="relative">
          <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-third-gray" />
          <Input
            placeholder="Name"
            className="h-[78px] w-[390px] sm:w-[462px] rounded-[100px] bg-main-gray pl-20 border-0 
                     !text-[16px] !font-semibold text-third-gray
                     placeholder:text-third-gray placeholder:text-[16px] placeholder:font-semibold
                     focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-third-gray" />
          <Input
            type="email"
            placeholder="Email"
            className="h-[78px] w-[390px] sm:w-[462px] rounded-[100px] bg-main-gray pl-20 border-0 
                     !text-[16px] !font-semibold text-third-gray
                     placeholder:text-third-gray placeholder:text-[16px] placeholder:font-semibold
                     focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-third-gray" />
          <Input
            type="password"
            placeholder="Password"
            className="h-[78px] w-[390px] sm:w-[462px] rounded-[100px] bg-main-gray pl-20 border-0 
                     !text-[16px] !font-semibold text-third-gray
                     placeholder:text-third-gray placeholder:text-[16px] placeholder:font-semibold
                     focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-third-gray" />
          <Input
            type="password"
            placeholder="Confirm password"
            className="h-[78px] w-[390px] sm:w-[462px] rounded-[100px] bg-main-gray pl-20 border-0 
                     !text-[16px] !font-semibold text-third-gray
                     placeholder:text-third-gray placeholder:text-[16px] placeholder:font-semibold
                     focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <Button 
          type="submit" 
          className="h-[78px] w-[390px] sm:w-[462px] rounded-[100px] bg-main-dark text-white hover:bg-main-dark/90 text-[16px] font-semibold"
        >
          Continue
        </Button>

        <div className="w-[390px] sm:w-[462px] relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-third-gray/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-semi-bold-2">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-[78px] w-[390px] sm:w-[462px] rounded-[100px] border-[1px] border-third-gray/30 text-[16px] font-semibold"
          onClick={handleGoogleSignIn}
        >
          <img src="/google.svg" alt="Google logo" className="w-4 h-4 mr-2" />
          Google account
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-[78px] w-[390px] sm:w-[462px] rounded-[100px] bg-[#1877F2] text-white hover:bg-[#166FE5] border-0 text-[16px] font-semibold"
          onClick={handleFacebookSignIn}
        >
          <img src="/facebook.svg" alt="Facebook logo" className="w-4 h-4 mr-2" />
          Facebook account
        </Button>
      </form>
    </div>
  )
}