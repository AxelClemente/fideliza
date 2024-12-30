import Link from 'next/link'
import Image from 'next/image'

export function MainHeader() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-black text-white p-4 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logofideliza.svg"
              alt="Logo"
              width={40}
              height={40}
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-16">
            <Link 
              href="/about" 
              className="text-white hover:text-gray-300 transition font-semibold text-[15.79px] leading-[21.5px]"
            >
              About service
            </Link>
            <Link 
              href="/help" 
              className="text-white hover:text-gray-300 transition font-semibold text-[15.79px] leading-[21.5px]"
            >
              Help
            </Link>
            <Link 
              href="/auth?mode=signup" 
              className="text-white hover:text-gray-300 transition font-semibold text-[15.79px] leading-[21.5px]"
            >
              Sign up
            </Link>
            <Link 
              href="/auth?mode=signin" 
              className="text-white hover:text-gray-300 transition font-semibold text-[15.79px] leading-[21.5px]"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <div className="h-16"></div>
    </>
  )
}