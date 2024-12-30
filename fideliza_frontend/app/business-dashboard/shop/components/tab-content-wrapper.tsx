'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'

interface TabContentWrapperProps {
  children: React.ReactNode
}

export function TabContentWrapper({ children }: TabContentWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)
    // Simular un pequeño delay para mostrar el loading state
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClipLoader size={40} color="#0066FF" />
      </div>
    )
  }

  return <>{children}</>
}