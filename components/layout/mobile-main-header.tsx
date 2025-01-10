"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

interface NavigationItem {
  href: string
  label: string
}

const navigationItems: NavigationItem[] = [
  { href: "/about", label: "About service" },
  { href: "/help", label: "Help" },
]

export function MobileMainHeader() {
  const [isOpen, setIsOpen] = React.useState(false)

  function toggleMenu() {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-black border-b px-4 h-16">
        <Link href="/" className="flex items-center">
          <Image
            src="/logofideliza.svg"
            alt="Logo"
            width={40}
            height={40}
          />
        </Link>
        <button 
          onClick={toggleMenu}
          className="relative z-50 text-white hover:text-gray-300"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-20">
          <nav className="flex flex-col px-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-4 text-lg font-medium text-white border-b border-gray-800"
                onClick={toggleMenu}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-8 space-y-4">
              <Link 
                href="/auth?mode=signin" 
                onClick={toggleMenu}
                className="block py-3 text-lg font-[800] text-white text-center border border-white rounded-full hover:bg-white hover:text-black transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth?mode=signup" 
                onClick={toggleMenu}
                className="block py-3 text-lg font-[800] text-black text-center bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                Join now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}