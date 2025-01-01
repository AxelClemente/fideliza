'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export default function VerifyCode({ email }: { email: string }) {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(55)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && !isNaN(Number(value))) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleVerify = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 4) {
      setError('Please enter all digits')
      return
    }

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      })

      if (response.ok) {
        window.location.href = `/auth/reset-password?email=${encodeURIComponent(email)}`
      } else {
        const errorData = await response.json()
        console.log('Error data:', errorData)
        setError('Invalid code')
      }
    } catch (error) {
      console.error('Verify error')
      setError('An error occurred')
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    try {
      await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setTimer(55)
    } catch (error) {
      setError('Failed to resend code')
    }
    setIsResending(false)
  }

  return (
    <div className="w-[400px] h-[700px] bg-white rounded-[20px] shadow-[0_10px_50px_0_rgba(0,0,0,0.1)] p-4 flex flex-col items-center">
      <div className="text-center mb-6 mt-12">
        <h1 className="!text-[20px] font-bold leading-[28px] text-main-dark mb-2 font-open-sans">
          Forgot the password?
        </h1>
        <p className="text-[16px] font-semibold leading-[20px] text-third-gray text-center font-open-sans">
          Code has been send to {email.replace(/(.{2})(.*)(?=@)/, (_, start, rest) => start + '*'.repeat(rest.length))}
        </p>
      </div>

      <form className="space-y-3 flex flex-col items-center">
        <div className="flex justify-center gap-2 mb-4">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              className="w-[60px] h-[60px] text-center text-[16px] font-semibold rounded-[16px] bg-main-gray border-0"
            />
          ))}
        </div>

        {error && (
          <div className="p-3 text-red-500 bg-red-100 rounded-md text-sm w-[360px]">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          <button
            onClick={handleResendCode}
            disabled={timer > 0 || isResending}
            className="text-[16px] font-semibold leading-[20px] font-open-sans"
          >
            Resend code in {timer}s
          </button>
        </div>

        <Button
          onClick={handleVerify}
          className="h-[60px] w-[360px] rounded-[100px] bg-main-dark text-white hover:bg-main-dark/90 text-[16px] font-semibold"
        >
          Verify
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-[60px] w-[360px] rounded-[100px] hover:text-gray-900 text-[16px] font-semibold leading-[20px] font-open-sans underline decoration-solid"
          onClick={() => router.push('/auth')}
        >
          Cancel
        </Button>
      </form>
    </div>
  )
}