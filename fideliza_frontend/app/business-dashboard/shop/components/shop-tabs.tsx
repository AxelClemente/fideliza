'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ClipLoader } from 'react-spinners'

const tabs = [
  { 
    name: 'Main info', 
    mobileName: 'Main',
    href: '/business-dashboard/shop' 
  },
  { 
    name: 'Special offers', 
    mobileName: 'Offers',
    href: '/business-dashboard/shop/special-offers' 
  },
  { 
    name: 'Subscriptions', 
    mobileName: 'Subscriptions',
    href: '/business-dashboard/shop/subscriptions' 
  }
]

export function ShopTabs() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState(pathname)

  const handleTabClick = (href: string) => {
    setActiveTab(href)
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <div className="relative border-b border-gray-200">
      <nav className="flex space-x-8 px-4" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          
          return (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.href)}
              className={`
                relative
                py-4 
                text-sm
                font-medium
                ${isActive 
                  ? 'border-black text-black border-b-2' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }
                ${isPending && activeTab === tab.href ? 'opacity-50' : ''}
              `}
            >
              <span className="md:hidden">{tab.mobileName}</span>
              <span className="hidden md:inline">{tab.name}</span>
              {isPending && activeTab === tab.href && (
                <span className="absolute -right-6 top-1/2 -translate-y-1/2">
                  <ClipLoader size={16} color="#0066FF" />
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}