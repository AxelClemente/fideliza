'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalPortalProps {
  children: React.ReactNode
  isOpen: boolean
}

export function ModalPortal({ children, isOpen }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !isOpen) return null

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/20 z-[9998]" />
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="min-h-full bg-white relative">
          {children}
        </div>
      </div>
    </>,
    document.body
  )
} 