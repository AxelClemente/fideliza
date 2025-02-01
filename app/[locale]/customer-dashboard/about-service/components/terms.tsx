import { useTranslations } from 'next-intl'

export default function Terms() {
    const t = useTranslations('CustomerDashboard.terms')
    
    return (
      <div className="w-full px-4 md:px-0">
        <h2 className="!text-[24px] font-bold font-[&quot;Open_Sans&quot;] leading-[32px] paragraph-[20px] text-center mb-6 
          sm:!text-[24px] sm:font-semibold sm:font-sans sm:leading-normal sm:paragraph-normal sm:text-left 
          md:!text-[30px] md:leading-normal md:mb-8">
          {t('title')}
        </h2>
        <div className="space-y-6 md:space-y-8">
          {/* Introduction */}
          <section>
            <h3 className="!text-[18px] sm:text-[16px] md:text-[18px] font-semibold sm:font-medium font-[&quot;Open_Sans&quot;] sm:font-sans leading-[24px] sm:leading-normal mb-4 sm:mb-2">
              {t('introduction.title')}
            </h3>
            <p className="!text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
              {t('introduction.content')}
            </p>
          </section>
  
          {/* Service Description */}
          <section>
            <h3 className="!text-[18px] sm:text-[16px] md:text-[18px] font-semibold sm:font-medium font-[&quot;Open_Sans&quot;] sm:font-sans leading-[24px] sm:leading-normal mb-4 sm:mb-2">
              {t('serviceDescription.title')}
            </h3>
            <p className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
              {t('serviceDescription.content')}
            </p>
          </section>
  
          {/* User Registration and Subscription */}
          <section>
            <h3 className="!text-[18px] sm:text-[16px] md:text-[18px] font-semibold sm:font-medium font-[&quot;Open_Sans&quot;] sm:font-sans leading-[24px] sm:leading-normal mb-4 sm:mb-2">
              {t('registration.title')}
            </h3>
            <ul className="list-disc pl-4 md:pl-5 space-y-3 sm:space-y-2">
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('registration.item1')}
              </li>
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('registration.item2')}
              </li>
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('registration.item3')}
              </li>
            </ul>
          </section>
  
          {/* Free Trial and Cancellation */}
          <section>
            <h3 className="!text-[18px] sm:text-[16px] md:text-[18px] font-semibold sm:font-medium font-[&quot;Open_Sans&quot;] sm:font-sans leading-[24px] sm:leading-normal mb-4 sm:mb-2">
              {t('freeTrial.title')}
            </h3>
            <ul className="list-disc pl-4 md:pl-5 space-y-3 sm:space-y-2">
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('freeTrial.item1')}
              </li>
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('freeTrial.item2')}
              </li>
            </ul>
          </section>
  
          {/* Partner Offers and Availability */}
          <section>
            <h3 className="!text-[18px] sm:text-[16px] md:text-[18px] font-semibold sm:font-medium font-[&quot;Open_Sans&quot;] sm:font-sans leading-[24px] sm:leading-normal mb-4 sm:mb-2">
              {t('partnerOffers.title')}
            </h3>
            <ul className="list-disc pl-4 md:pl-5 space-y-3 sm:space-y-2">
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('partnerOffers.item1')}
              </li>
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('partnerOffers.item2')}
              </li>
            </ul>
          </section>
  
          {/* User Responsibilities */}
          <section>
            <h3 className="!text-[18px] sm:text-[16px] md:text-[18px] font-semibold sm:font-medium font-[&quot;Open_Sans&quot;] sm:font-sans leading-[24px] sm:leading-normal mb-4 sm:mb-2">
              {t('userResponsibilities.title')}
            </h3>
            <ul className="list-disc pl-4 md:pl-5 space-y-3 sm:space-y-2">
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('userResponsibilities.item1')}
              </li>
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('userResponsibilities.item2')}
              </li>
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('userResponsibilities.item3')}
              </li>
            </ul>
          </section>
  
          {/* Refunds and Payment Issues */}
          <section>
            <h3 className="!text-[18px] sm:text-[16px] md:text-[18px] font-semibold sm:font-medium font-[&quot;Open_Sans&quot;] sm:font-sans leading-[24px] sm:leading-normal mb-4 sm:mb-2">
              {t('refunds.title')}
            </h3>
            <ul className="list-disc pl-4 md:pl-5 space-y-3 sm:space-y-2">
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('refunds.item1')}
              </li>
              <li className="text-[18px] sm:text-sm font-semibold sm:font-normal font-[&quot;Open_Sans&quot;] sm:font-sans leading-[22px] sm:leading-relaxed paragraph-[21.92px] sm:paragraph-normal">
                {t('refunds.item2')}
              </li>
            </ul>
          </section>
        </div>
      </div>
    )
  }