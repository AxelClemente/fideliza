export default function TermsSection() {
    return (
      <div className="w-full px-4 md:px-0">
        <h2 className="text-[24px] md:text-[30px] font-semibold mb-6 md:mb-8">Terms of Use</h2>
        <div className="space-y-6 md:space-y-8">
          {/* Introduction */}
          <section>
            <h3 className="text-[16px] md:text-[18px] font-medium mb-2">1. Introduction</h3>
            <p className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
              Welcome to [Your Service Name]! By using our platform, you agree to the following terms and conditions. Please read them carefully. If you don&apos;t agree, you should not use our service.
            </p>
          </section>
  
          {/* Service Description */}
          <section>
            <h3 className="text-[16px] md:text-[18px] font-medium mb-2">2. Service Description</h3>
            <p className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
              Our platform provides users with access to discounts and special offers at partner stores through a subscription plan. The discounts are subject to the terms set by each participating partner.
            </p>
          </section>
  
          {/* User Registration and Subscription */}
          <section>
            <h3 className="text-[16px] md:text-[18px] font-medium mb-2">3. User Registration and Subscription</h3>
            <ul className="list-disc pl-4 md:pl-5 space-y-3 sm:space-y-2">
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                Users must create an account to access our service.
              </li>
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                Subscription fees are charged on a monthly basis, with payments processed automatically.
              </li>
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                Users are responsible for maintaining up-to-date payment information.
              </li>
            </ul>
          </section>
  
          {/* Free Trial and Cancellation */}
          <section>
            <h3 className="text-[16px] md:text-[18px] font-medium mb-2">4. Free Trial and Cancellation</h3>
            <ul className="list-disc pl-4 md:pl-5 text-sm text-gray-600 space-y-2">
              <li className="leading-relaxed">If offered, the free trial allows users to access the service for a limited time without charge.</li>
              <li className="leading-relaxed">Subscriptions can be canceled at any time via the user&apos;s account settings. Access to discounts will remain until the end of the billing period.</li>
            </ul>
          </section>
  
          {/* Partner Offers and Availability */}
          <section>
            <h3 className="text-[16px] md:text-[18px] font-medium mb-2">5. Partner Offers and Availability</h3>
            <ul className="list-disc pl-4 md:pl-5 text-sm text-gray-600 space-y-2">
              <li className="leading-relaxed">Discounts and offers vary by partner and are subject to change without prior notice.</li>
              <li className="leading-relaxed">Availability of offers may differ based on location or other conditions defined by partners.</li>
            </ul>
          </section>
  
          {/* User Responsibilities */}
          <section>
            <h3 className="text-[16px] md:text-[18px] font-medium mb-2">6. User Responsibilities</h3>
            <ul className="list-disc pl-4 md:pl-5 text-sm text-gray-600 space-y-2">
              <li className="leading-relaxed">Users must use the service lawfully and in accordance with these Terms.</li>
              <li className="leading-relaxed">Sharing account information or unauthorized use of the service is prohibited.</li>
              <li className="leading-relaxed">Users are responsible for ensuring their actions align with the terms of each partner offer.</li>
            </ul>
          </section>
  
          {/* Refunds and Payment Issues */}
          <section>
            <h3 className="text-[16px] md:text-[18px] font-medium mb-2">7. Refunds and Payment Issues</h3>
            <ul className="list-disc pl-4 md:pl-5 text-sm text-gray-600 space-y-2">
              <li className="leading-relaxed">Subscription fees are non-refundable unless otherwise required by law.</li>
              <li className="leading-relaxed">If a payment fails, access to the service may be restricted until the issue is resolved.</li>
            </ul>
          </section>
        </div>
      </div>
    )
}