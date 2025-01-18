"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ArrowLeft, Menu, X, ChevronDown } from "lucide-react"
import { useState } from "react"

const navigationItems = [
  { name: "Home", href: "/business-dashboard" },
  { name: "Users", href: "/business-dashboard/users" },
  { name: "My shops", href: "/business-dashboard/shop" },
  { name: "Mailing", href: "/business-dashboard/mailings" },
  { name: "About service", href: "/business-dashboard/about" },
  { name: "Help", href: "/business-dashboard/help" },
]

export function MobileBusinessHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()


  function handleBack() {
    if (pathname === '/business-dashboard') {
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
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-black px-4 h-16">
        <button 
          onClick={handleBack}
          className="text-white"
        >
          <ArrowLeft className="h-6 w-6 stroke-[3]" />
        </button>

        <Link 
          href="/" 
          className="absolute left-1/2 -translate-x-1/2"
        >
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

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-1/2 bg-black z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="pt-20 px-6">
          {/* User Profile */}
          <Link 
            href="/business-dashboard/user-profile" 
            className="block mb-8"
            onClick={toggleMenu}
          >
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={session?.user?.image || "/images/placeholder1.png"}
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white text-sm font-semibold truncate max-w-[100px]">
                  {session?.user?.name || "Guest"}
                </span>
                <ChevronDown className="h-4 w-4 text-white flex-shrink-0" />
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col space-y-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  py-2 text-lg font-semibold
                  ${pathname === item.href
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                  }
                `}
                onClick={toggleMenu}
              >
                {item.name}
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
    </>
  )
}