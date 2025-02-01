import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslations } from 'next-intl'

export default function FAQ() {
    const t = useTranslations('CustomerDashboard.faq')
    
    return (
        <div className="w-full px-4 sm:px-0">
            <h2 className="text-[24px] font-bold font-['Open_Sans'] leading-[32px] paragraph-[20px] text-center mb-6 sm:hidden">
                FAQ
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="item-1" className="border border-gray-100 rounded-xl shadow-sm">
                    <AccordionTrigger className="text-[24px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[32px] sm:leading-[36px] py-[20px] sm:py-[20px] text-left px-6">
                        {t('howItWorks')}
                    </AccordionTrigger>
                    <AccordionContent className="!px-6 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
                        {t('howItWorksAnswer')}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border border-gray-100 rounded-xl shadow-sm">
                    <AccordionTrigger className="text-[24px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[32px] sm:leading-[36px] py-[20px] sm:py-[20px] text-left px-6">
                        {t('whichStores')}
                    </AccordionTrigger>
                    <AccordionContent className="!px-6 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
                        {t('whichStoresAnswer')}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border border-gray-100 rounded-xl shadow-sm">
                    <AccordionTrigger className="text-[24px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[32px] sm:leading-[36px] py-[20px] sm:py-[20px] text-left px-6">
                        {t('subscriptionPlans')}
                    </AccordionTrigger>
                    <AccordionContent className="!px-6 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
                        {t('subscriptionPlansAnswer')}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border border-gray-100 rounded-xl shadow-sm">
                    <AccordionTrigger className="text-[24px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[32px] sm:leading-[36px] py-[20px] sm:py-[20px] text-left px-6">
                        {t('howToSubscribe')}
                    </AccordionTrigger>
                    <AccordionContent className="!px-6 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
                        {t('howToSubscribeAnswer')}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border border-gray-100 rounded-xl shadow-sm">
                    <AccordionTrigger className="text-[24px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[32px] sm:leading-[36px] py-[20px] sm:py-[20px] text-left px-6">
                        {t('howToCancel')}
                    </AccordionTrigger>
                    <AccordionContent className="!px-6 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
                        {t('howToCancelAnswer')}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border border-gray-100 rounded-xl shadow-sm">
                    <AccordionTrigger className="text-[24px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[32px] sm:leading-[36px] py-[20px] sm:py-[20px] text-left px-6">
                        {t('noDiscount')}
                    </AccordionTrigger>
                    <AccordionContent className="!px-6 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
                        {t('noDiscountAnswer')}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}