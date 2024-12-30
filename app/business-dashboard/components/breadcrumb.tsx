'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const routeMap: Record<string, string> = {
  '/business-dashboard': 'Home',
  '/business-dashboard/users': 'Users',
  '/business-dashboard/shop': 'My shop',
  '/business-dashboard/mailings': 'Proposal mailings',
  '/business-dashboard/about': 'About service',
  '/business-dashboard/help': 'Help',
  '/business-dashboard/user-profile': 'My profile'
} as const

export function Breadcrumb() {
  const pathname = usePathname()
  
  const breadcrumbStyle = {
    fontFamily: 'Open Sans',
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '22px',
  }
  
  // Si estamos en la página principal del dashboard
  if (pathname === '/business-dashboard') {
    return <p style={breadcrumbStyle} className="hidden md:block ml-6">Home</p>
  }

  // Para todas las demás rutas
  return (
    <div className="hidden md:block mx-4 md:mx-8 lg:mx-8">
      <div className="flex items-center gap-2" style={breadcrumbStyle}>
        <Link 
          href="/business-dashboard" 
          className="text-gray-600 hover:text-gray-900"
        >
          Home
        </Link>
        <span className="text-gray-600">{'>'}</span>
        <span className="text-black">
          {routeMap[pathname as keyof typeof routeMap]}
        </span>
      </div>
    </div>
  )
}