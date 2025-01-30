'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'

interface MainContentWrapperProps {
  children: React.ReactNode
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ClipLoader size={40} color="#0066FF" />
      </div>
    )
  }

  return <>{children}</>
}