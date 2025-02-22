"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown, Menu, X, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useTranslations } from 'next-intl'

const navigationItems = [
  { name: 'home', href: "/customer-dashboard" },
  { name: 'mySubscriptions', href: "/customer-dashboard/my-subscriptions" },
  { name: 'aboutService', href: "/customer-dashboard/about-service" },
  { name: 'help', href: "/customer-dashboard/about-service?section=Help" },
]

export function CustomerHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const t = useTranslations('CustomerDashboard.header')

  function handleBack() {
    if (pathname === '/customer-dashboard') {
      router.push('/')
    } else {
      router.back()
    }
  }

  function toggleMenu() {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <header className="flex items-center justify-between bg-black p-4 h-16">
          <button 
            onClick={handleBack}
            className="text-white"
          >
            <ArrowLeft className="h-6 w-6 stroke-[3]" />
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/logofideliza.svg"
              alt="Logo"
              width={40}
              height={40}
            />
          </Link>

          <button 
            onClick={toggleMenu}
            className="text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleMenu}
          />
        )}

        {/* Mobile Menu Drawer */}
        <div className={`
          fixed top-0 right-0 h-full w-1/2 bg-black z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="pt-20 px-6">
            {/* User Profile */}
            <Link href="/customer-dashboard/customer-profile" className="block mb-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full flex items-center justify-center">
                  <Image
                    src={session?.user?.image || "/images/placeholder1.png"}
                    alt="User avatar"
                    width={44}
                    height={44}
                    className="rounded-full"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold">
                    {session?.user?.name || "Guest"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white" />
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="space-y-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-white hover:text-gray-300"
                  onClick={toggleMenu}
                >
                  {t(item.name)}
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mt-8 text-gray-400 hover:text-white text-lg font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header with Tablet Responsive Adjustments */}
      <div className="hidden lg:block w-full bg-black">
        <header className="container mx-auto px-4 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-start pl-2 lg:pl-8">
            <Link href="/" className="flex items-center gap-2 mr-4 lg:mr-8">
              <Image
                src="/logofideliza.svg"
                alt="Logo"
                width={46}
                height={40}
                className="text-main-light lg:w-[53px] lg:h-[46px]"
              />
            </Link>

            <Link href="/customer-dashboard/customer-profile">
              <div className="flex items-center gap-2 lg:gap-3 group">
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full flex items-center justify-center">
                  {isLoading ? (
                    <div className="h-10 w-10 lg:h-11 lg:w-11 rounded-full bg-gray-200 animate-pulse" />
                  ) : (
                    <Image
                      src={session?.user?.image || "/images/placeholder1.png"}
                      alt="User avatar"
                      width={40}
                      height={40}
                      className="rounded-full lg:w-[44px] lg:h-[44px]"
                    />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-main-light text-sm lg:text-base hidden sm:block group-hover:text-gray-300 transition-colors">
                    {isLoading ? (
                      <div className="h-4 w-20 lg:w-24 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      session?.user?.name || "Guest"
                    )}
                  </span>
                  <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4 text-main-light hidden sm:block group-hover:text-gray-300 transition-colors" />
                </div>
              </div>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4 w-full lg:w-auto pr-2 lg:pr-8">
            <nav className="flex flex-wrap justify-center gap-4 lg:gap-8 mr-6 lg:mr-12">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    text-sm lg:text-lg
                    leading-tight
                    font-semibold 
                    whitespace-nowrap
                    ${pathname === item.href
                      ? "text-main-light"
                      : "text-third-gray hover:text-main-light"
                    }
                  `}
                  style={{ fontFamily: 'Open Sans' }}
                >
                  {t(item.name)}
                </Link>
              ))}
            </nav>

            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mr-4 lg:mr-8 text-sm lg:text-base text-third-gray hover:text-main-light lg:ml-8 whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </header>
      </div>

      {/* Spacer solo para tablet */}
      <div className="hidden md:block lg:hidden h-16" />
    </>
  )
}