'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { HelpCircle, LifeBuoy, FileText, CreditCard, QrCode, Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Breadcrumb } from './components/breadcrumb'
import FAQSection from './components/faq-section'
import TermsSection from './components/terms-section'
import BillingSection from './components/billing-section'
import QRSection from './components/qr-section'
import HelpSection from './components/help-section'
import { ShareAppModal } from './components/share-app'
import { useRestaurant } from '@/hooks/useRestaurant'

export default function ServiceInfo() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const t = useTranslations('BusinessDashboard.about')
  const { restaurant } = useRestaurant()

  // Efecto para manejar el parámetro section de la URL
  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'help') {
      setActiveSection('Help')
    }
  }, [searchParams])

  const handleReset = () => {
    setActiveSection(null)
  }

  const getShareUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    if (restaurant?.id) {
      return `${baseUrl}/customer-dashboard/restaurants/${restaurant.id}`
    }
    return baseUrl
  }

  const renderContent = () => {
    switch(activeSection) {
      case 'FAQ':
        return <FAQSection />
      case 'Help':
        return <HelpSection />
      case 'Terms of Use':
        return <TermsSection />
      case 'Billing':
        return <BillingSection />
      case 'QR and links':
        return <QRSection shareUrl={getShareUrl()} />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* FAQ Section */}
            <div 
              onClick={() => setActiveSection('FAQ')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors w-[389px] sm:w-auto mx-auto sm:mx-0"
            >
              <HelpCircle className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('faq')}</h3>
              <p className="text-sm">{t('faqDescription')}</p>
            </div>

            {/* Help Section */}
            <div 
              onClick={() => setActiveSection('Help')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors w-[389px] sm:w-auto mx-auto sm:mx-0"
            >
              <LifeBuoy className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('help')}</h3>
              <p className="text-sm">{t('helpDescription')}</p>
            </div>

            {/* Terms of Use Section */}
            <div 
              onClick={() => setActiveSection('Terms of Use')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors w-[389px] sm:w-auto mx-auto sm:mx-0"
            >
              <FileText className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('termsOfUse')}</h3>
              <p className="text-sm">{t('termsDescription')}</p>
            </div>

            {/* Billing Section */}
            <div 
              onClick={() => setActiveSection('Billing')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors w-[389px] sm:w-auto mx-auto sm:mx-0"
            >
              <CreditCard className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('billing')}</h3>
              <p className="text-sm">{t('billingDescription')}</p>
            </div>

            {/* QR and Links Section */}
            <div 
              onClick={() => setActiveSection('QR and links')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors w-[389px] sm:w-auto mx-auto sm:mx-0"
            >
              <QrCode className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('qrAndLinks')}</h3>
              <p className="text-sm">{t('qrDescription')}</p>
            </div>

            {/* Share App Section */}
            <div 
              onClick={() => setIsShareModalOpen(true)}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors w-[389px] sm:w-auto mx-auto sm:mx-0"
            >
              <Share2 className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('shareApp')}</h3>
              <p className="text-sm">{t('shareDescription')}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="p-0 md:p-8">
      {/* Título móvil con padding superior añadido */}
      <h3 className="text-center text-[24px] font-[700] leading-[32px] mb-6 pt-6 md:hidden">
        {t('title')}
      </h3>

      {/* Breadcrumb solo visible en desktop */}
      <div className="mx-0 md:mx-8">
        <div className="mb-4 px-4 md:px-0 hidden md:block">
          <Breadcrumb 
            section={activeSection ?? t('title')} 
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
        shareUrl={getShareUrl()}
      />
    </div>
  )
}

