'use client'

import { ChevronRight } from 'lucide-react'

interface BreadcrumbProps {
  section: string
  onReset: () => void
}

export function Breadcrumb({ section, onReset }: BreadcrumbProps) {
  return (
    <div className="hidden md:flex items-center justify-start gap-2">
      <button 
        onClick={onReset}
        className="text-sm font-normal leading-normal hover:text-gray-700 transition-colors paragraph-normal"
      >
        About service
      </button>
      {section !== "About service" && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{section}</span>
        </>
      )}
    </div>
  )
}