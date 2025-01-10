import HeroSection from '@/components/landing-page/hero'
import VideoSection from '@/components/landing-page/video'
import FAQSection from '@/components/landing-page/faq'
import { MainHeader } from '@/components/layout/main-header'
import { MobileMainHeader } from '@/components/layout/mobile-main-header'
import { Footer } from '@/components/layout/footer'

export default function Page() {
  return (
    <main className="bg-white">
      <div className="md:hidden">
        <MobileMainHeader />
      </div>
      <div className="hidden md:block">
        <MainHeader />
      </div>
      <div className="
        w-full
        px-4
        max-w-[500px]
        mx-auto
        sm:px-6
        md:max-w-none
        md:mx-8 
        lg:mx-16
      ">
        <HeroSection />
        <VideoSection />
        <FAQSection />
        <Footer />
      </div>
    </main>
  )
}

