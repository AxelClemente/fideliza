'use client'

import { useState } from 'react'
import { HelpCircle, FileText, Share2 } from 'lucide-react'
import { Breadcrumb } from './components/breadcrumbs'
import FAQ from './components/faq'
import Terms from './components/terms'
import Help from './components/help'
import { ShareAppModal } from './components/share-app'
import Image from 'next/image'

export default function CustomerServiceInfo() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const handleReset = () => {
    setActiveSection(null)
  }

  const cardClasses = "bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center transition-all duration-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1"

  const renderContent = () => {
    switch(activeSection) {
      case 'FAQ':
        return <FAQ />
      case 'Help':
        return <Help />
      case 'Terms of Use':
        return <Terms />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* FAQ Section */}
            <div 
              onClick={() => setActiveSection('FAQ')}
              className={`${cardClasses} cursor-pointer w-[339px] h-[276px] md:w-auto md:h-auto p-4 md:p-6 mx-auto md:mx-0`}
            >
              <HelpCircle className="w-[72px] h-[72px] md:w-12 md:h-12 mb-3 md:mb-4" />
              <h3 className="text-[24px] md:text-lg font-bold md:font-semibold leading-[32.68px] md:leading-normal mb-[21.5px] md:mb-2 text-justify md:text-center">
                FAQ
              </h3>
              <p className="text-[14px] md:text-sm font-[600] md:font-normal leading-[18px] md:leading-normal font-['Open_Sans'] md:font-sans tracking-[-0.1px] paragraph-[21.92px] md:paragraph-normal md:text-current">
                Find answers to the most common questions about our service and its features. Learn how to use your subscription and enjoy discounts.
              </p>
            </div>

            {/* Help Section */}
            <div 
              onClick={() => setActiveSection('Help')}
              className={`${cardClasses} cursor-pointer w-[339px] h-[276px] md:w-auto md:h-auto p-4 md:p-6 mx-auto md:mx-0`}
            >
              <Image 
                src="/help-fideliza.svg" 
                alt="Help Icon"
                width={72}
                height={72}
                className="md:w-12 md:h-12 mb-3 md:mb-4"
              />
              <h3 className="text-[24px] md:text-lg font-bold md:font-semibold leading-[32.68px] md:leading-normal mb-[21.5px] md:mb-2 text-justify md:text-center">
                Help
              </h3>
              <p className="text-[14px] md:text-sm font-[600] md:font-normal leading-[18px] md:leading-normal font-['Open_Sans'] md:font-sans tracking-[-0.1px] paragraph-[21.92px] md:paragraph-normal md:text-current">
                Need assistance? This section provides guides, tips, and solutions for common issues with our service.
              </p>
            </div>

            {/* Terms of Use Section */}
            <div 
              onClick={() => setActiveSection('Terms of Use')}
              className={`${cardClasses} cursor-pointer w-[339px] h-[276px] md:w-auto md:h-auto p-4 md:p-6 mx-auto md:mx-0`}
            >
              <FileText className="w-[72px] h-[72px] md:w-12 md:h-12 mb-3 md:mb-4" />
              <h3 className="text-[24px] md:text-lg font-bold md:font-semibold leading-[32.68px] md:leading-normal mb-[21.5px] md:mb-2 text-justify md:text-center">
                Terms of Use
              </h3>
              <p className="text-[14px] md:text-sm font-[600] md:font-normal leading-[18px] md:leading-normal font-['Open_Sans'] md:font-sans tracking-[-0.1px] paragraph-[21.92px] md:paragraph-normal md:text-current">
                Here you&apos;ll find the rules and conditions for using our service. Review them to understand your rights and responsibilities as a user.
              </p>
            </div>

            {/* Share App Section */}
            <div 
              onClick={() => setIsShareModalOpen(true)}
              className={`${cardClasses} cursor-pointer w-[339px] h-[276px] md:w-auto md:h-auto p-4 md:p-6 mx-auto md:mx-0`}
            >
              <Share2 className="w-[72px] h-[72px] md:w-12 md:h-12 mb-3 md:mb-4" />
              <h3 className="!text-[30px] font-['Open_Sans'] font-[700] leading-[36px] mb-5">
                Share app
              </h3>
              <p className="text-[14px] md:text-sm font-[600] md:font-normal leading-[18px] md:leading-normal font-['Open_Sans'] md:font-sans tracking-[-0.1px] paragraph-[21.92px] md:paragraph-normal md:text-current">
                Let your friends find the best deals in town!
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="p-0 md:p-8">
      <div className="mx-0 md:mx-8">
        <div className="mb-4 px-4 md:px-0">
          <Breadcrumb 
            section={activeSection ?? "About service"} 
            onReset={handleReset}
          />
        </div>
        
        <div className="space-y-0 md:space-y-6">
          {renderContent()}
        </div>
      </div>
      <ShareAppModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </div>
  )
}