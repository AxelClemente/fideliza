"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

interface NavigationItem {
  href: string
  label: string
}


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
        <div className="fixed inset-0 z-40 bg-white pt-10">
          <nav className="flex flex-col h-[calc(100vh-80px)] justify-end px-4">
            <div className="mb-8 space-y-4">
              <Link 
                href="/auth?mode=signin" 
                onClick={toggleMenu}
                className="block w-[390px] h-[78px] leading-[78px] text-lg font-[800] text-white bg-black text-center border border-black rounded-full hover:bg-white hover:text-black transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth?mode=signup" 
                onClick={toggleMenu}
                className="block text-lg font-[800] text-black text-center transition-colors hover:text-gray-600"
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