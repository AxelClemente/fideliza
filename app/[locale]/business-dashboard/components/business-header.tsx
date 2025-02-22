"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown, ArrowLeft, Menu, X } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { ClipLoader } from 'react-spinners'
import { useTranslations } from 'next-intl'
import { useQR } from './qr-context'
import { QRScanModal } from '../modal/qr-scan-modal'

const navigationItems = [
  { name: "home", href: "/business-dashboard" },
  { name: "users", href: "/business-dashboard/users" },
  { name: "myShops", href: "/business-dashboard/shop" },
  { name: "proposalMailings", href: "/business-dashboard/mailings" },
  { name: "aboutService", href: "/business-dashboard/about" },
  { name: "help", href: "/business-dashboard/about?section=help" },
]

export function BusinessHeader() {
  const t = useTranslations('BusinessHeader')
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isPending, startTransition] = useTransition()
  const [activeLink, setActiveLink] = useState(pathname)
  const isLoading = status === 'loading'
  const { isQRModalOpen, setIsQRModalOpen, canShowQRScan } = useQR()
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigation = (href: string) => {
    setActiveLink(href)
    startTransition(() => {
      router.push(href)
    })
  }

  const handleBack = () => {
    router.back()
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    console.log('BusinessHeader session updated:', session?.user?.image)
  }, [session])

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
            <Link href="/business-dashboard/user-profile" className="block mb-8">
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
                  key={item.href}
                  href={item.href}
                  className="block text-white hover:text-gray-300"
                  onClick={toggleMenu}
                >
                  {t(item.name)}
                </Link>
              ))}
              {canShowQRScan && (
                <button
                  onClick={() => {
                    setIsQRModalOpen(true)
                    toggleMenu()
                  }}
                  className="block text-white hover:text-gray-300"
                >
                  {t('qrScan')}
                </button>
              )}
            </nav>

            {/* Logout */}
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mt-8 text-gray-400 hover:text-white text-lg font-semibold"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Tablet Header */}
      <div className="hidden sm:block lg:hidden w-full bg-black">
        <header className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logofideliza.svg"
                  alt="Logo"
                  width={46}
                  height={40}
                  className="text-main-light"
                />
              </Link>

              <Link href="/business-dashboard/user-profile">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full">
                    {isLoading ? (
                      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                    ) : (
                      <Image
                        src={session?.user?.image || "/images/placeholder1.png"}
                        alt="User avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <span className="text-main-light text-sm">
                    {isLoading ? (
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      session?.user?.name?.split(' ')[0] || "Guest"
                    )}
                  </span>
                  <ChevronDown className="h-3 w-3 text-main-light" />
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <nav className="flex gap-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`
                      text-sm
                      font-semibold 
                      whitespace-nowrap
                      ${pathname === item.href
                        ? "text-main-light"
                        : "text-third-gray hover:text-main-light"
                      }
                    `}
                  >
                    {t(item.name)}
                  </button>
                ))}
                {canShowQRScan && (
                  <button
                    onClick={() => setIsQRModalOpen(true)}
                    className="text-sm font-semibold whitespace-nowrap text-third-gray hover:text-main-light"
                  >
                    {t('qrScan')}
                  </button>
                )}
              </nav>

              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-third-gray hover:text-main-light"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block w-full bg-black">
        <header className="container mx-auto h-[84px] flex flex-col md:flex-row items-center justify-between">
          {/* Left side: Logo and User Info */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start pl-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logofideliza.svg"
                alt="Logo"
                width={53}
                height={46}
                className="text-main-light"
              />
            </Link>

            {/* User Info */}
            <Link href="/business-dashboard/user-profile">
              <div className="flex items-center gap-3 group">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                  {isLoading ? (
                    <div className="h-11 w-11 rounded-full bg-gray-200 animate-pulse" />
                  ) : (
                    <Image
                      src={session?.user?.image || "/images/placeholder1.png"}
                      alt="User avatar"
                      width={44}
                      height={44}
                      className="rounded-full"
                    />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-main-light text-semi-bold-3 hidden sm:block group-hover:text-gray-300 transition-colors">
                    {isLoading ? (
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      session?.user?.name?.split(' ')[0] || "Guest"
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 text-main-light hidden sm:block group-hover:text-gray-300 transition-colors" />
                </div>
              </div>
            </Link>
          </div>

          {/* Right side: Navigation and Logout */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto pr-8">
            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-8">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    relative
                    text-base md:text-lg
                    leading-tight
                    font-semibold 
                    whitespace-nowrap
                    ${pathname === item.href
                      ? "text-main-light"
                      : "text-third-gray hover:text-main-light"
                    }
                    ${isPending && activeLink === item.href ? 'opacity-50' : ''}
                  `}
                  style={{ fontFamily: 'Open Sans' }}
                >
                  {t(item.name)}
                  {isPending && activeLink === item.href && (
                    <span className="absolute -right-6 top-1/2 -translate-y-1/2">
                      <ClipLoader size={16} color="#0066FF" />
                    </span>
                  )}
                </button>
              ))}
              
              {/* QR Scan Button */}
              {canShowQRScan && (
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="relative text-base md:text-lg leading-tight font-semibold whitespace-nowrap text-third-gray hover:text-main-light"
                  style={{ fontFamily: 'Open Sans' }}
                >
                  {t('qrScan')}
                </button>
              )}
            </nav>

            {/* Logout */}
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-semi-bold-2 text-third-gray hover:text-main-light md:ml-8 whitespace-nowrap"
            >
              {t('logout')}
            </button>
          </div>
        </header>
      </div>

      {/* QR Scan Modal */}
      <QRScanModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </>
  )
}