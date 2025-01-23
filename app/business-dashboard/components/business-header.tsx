"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { ClipLoader } from 'react-spinners'

const navigationItems = [
  { name: "Home", href: "/business-dashboard" },
  { name: "Users", href: "/business-dashboard/users" },
  { name: "My shops", href: "/business-dashboard/shop" },
  { name: "Proposal mailings", href: "/business-dashboard/mailings" },
  { name: "About service", href: "/business-dashboard/about" },
  { name: "Help", href: "/business-dashboard/help" },
]

export function BusinessHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isPending, startTransition] = useTransition()
  const [activeLink, setActiveLink] = useState(pathname)
  const isLoading = status === 'loading'

  const handleNavigation = (href: string) => {
    setActiveLink(href)
    startTransition(() => {
      router.push(href)
    })
  }

  useEffect(() => {
    console.log('BusinessHeader session updated:', session?.user?.image)
  }, [session])

  return (
    <div className="w-full bg-black">
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
                {item.name}
                {isPending && activeLink === item.href && (
                  <span className="absolute -right-6 top-1/2 -translate-y-1/2">
                    <ClipLoader size={16} color="#0066FF" />
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-semi-bold-2 text-third-gray hover:text-main-light md:ml-8 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </header>
    </div>
  )
}