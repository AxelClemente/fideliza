'use client'

import { useState } from 'react'
import { HelpCircle, LifeBuoy, FileText, CreditCard, QrCode, Share2 } from 'lucide-react'
import { Breadcrumb } from './components/breadcrumb'
import FAQSection from './components/faq-section'
import TermsSection from './components/terms-section'
import BillingSection from './components/billing-section'
import QRSection from './components/qr-section'
import HelpSection from './components/help-section'
import { ShareAppModal } from './components/share-app'

export default function ServiceInfo() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const handleReset = () => {
    setActiveSection(null)
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
        return <QRSection />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* FAQ Section */}
            <div 
              onClick={() => setActiveSection('FAQ')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              <HelpCircle className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">FAQ</h3>
              <p className="text-sm">
                Find answers to the most common questions about our service and its features. Learn how to use your subscription and enjoy discounts.
              </p>
            </div>

            {/* Help Section */}
            <div 
              onClick={() => setActiveSection('Help')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              <LifeBuoy className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Help</h3>
              <p className="text-sm">
                Need assistance? This section provides guides, tips, and solutions for common issues with our service.
              </p>
            </div>

            {/* Terms of Use Section */}
            <div 
              onClick={() => setActiveSection('Terms of Use')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              <FileText className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Terms of Use</h3>
              <p className="text-sm">
                Here you'll find the rules and conditions for using our service. Review them to understand your rights and responsibilities as a user.
              </p>
            </div>

            {/* Billing Section */}
            <div 
              onClick={() => setActiveSection('Billing')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              <CreditCard className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Billing</h3>
              <p className="text-sm">
                Terms and details of the contract and payment terms.
              </p>
            </div>

            {/* QR and Links Section */}
            <div 
              onClick={() => setActiveSection('QR and links')}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              <QrCode className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">QR and links</h3>
              <p className="text-sm">
                Recommendations for using QRs and links to our service to get your customers to join the service faster and support your business with subscriptions.
              </p>
            </div>

            {/* Share App Section */}
            <div 
              onClick={() => setIsShareModalOpen(true)}
              className="p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              <Share2 className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Share app</h3>
              <p className="text-sm">
                Get in touch with us if you have questions or suggestions. Our support team is ready to assist you promptly.
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

