'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ClipLoader } from 'react-spinners'

const tabs = [
  { 
    name: 'Main info', 
    mobileName: 'Main info',
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
    <div className="relative border-none mb-2 md:mb-0 md:border-b md:border-gray-200">
      <nav className="flex space-x-2 md:space-x-8 px-4" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          
          return (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.href)}
              className={`
                relative
                py-2
                md:py-4
                px-3
                md:px-0
                text-[20px]
                md:text-sm
                font-[700]
                md:font-medium
                leading-[26px]
                md:leading-normal
                ${isActive 
                  ? 'border-none md:border-b-2 md:border-black text-black' 
                  : 'text-gray-500 hover:text-gray-700 border-none md:border-b-2 md:border-transparent'
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