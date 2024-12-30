import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  export default function FAQSection() {
    return (
      <div className="w-full">
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border border-gray-100 rounded-xl shadow-sm">
            <AccordionTrigger className="text-[20px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[26px] sm:leading-[36px] py-[16px] sm:py-[20px] text-left px-4">
              How does our loyalty service work?
            </AccordionTrigger>
            <AccordionContent className="!px-4 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
              Our loyalty service rewards you for shopping at participating stores. Earn points with every purchase and redeem them for exclusive rewards and discounts.
            </AccordionContent>
          </AccordionItem>
  
          <AccordionItem value="item-2" className="border border-gray-100 rounded-xl shadow-sm">
            <AccordionTrigger className="text-[20px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[26px] sm:leading-[36px] py-[16px] sm:py-[20px] text-left px-4">
              Which stores are part of the program?
            </AccordionTrigger>
            <AccordionContent className="!px-4 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
              We have partnerships with a wide range of retailers, from local shops to major brands. Check our store directory for a complete list of participating locations.
            </AccordionContent>
          </AccordionItem>
  
          <AccordionItem value="item-3" className="border border-gray-100 rounded-xl shadow-sm">
            <AccordionTrigger className="text-[20px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[26px] sm:leading-[36px] py-[16px] sm:py-[20px] text-left px-4">
              What subscription plans are available?
            </AccordionTrigger>
            <AccordionContent className="!px-4 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
              We offer several subscription tiers to suit different needs, from basic to premium plans. Each plan includes different benefits and reward rates.
            </AccordionContent>
          </AccordionItem>
  
          <AccordionItem value="item-4" className="border border-gray-100 rounded-xl shadow-sm">
            <AccordionTrigger className="text-[20px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[26px] sm:leading-[36px] py-[16px] sm:py-[20px] text-left px-4">
              How do I subscribe?
            </AccordionTrigger>
            <AccordionContent className="!px-4 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
              You can subscribe via the website or app by choosing the plan that suits you. Payments are charged automatically on a monthly basis.
            </AccordionContent>
          </AccordionItem>
  
          <AccordionItem value="item-5" className="border border-gray-100 rounded-xl shadow-sm">
            <AccordionTrigger className="text-[20px] sm:text-[30px] font-bold font-['Open_Sans'] leading-[26px] sm:leading-[36px] py-[16px] sm:py-[20px] text-left px-4">
              How can I cancel my subscription?
            </AccordionTrigger>
            <AccordionContent className="!px-4 !text-[20px] !font-semibold !font-['Open_Sans'] !leading-[26px] !paragraph-[20px]">
              You can cancel your subscription at any time through your account settings. The service will remain active until the end of your current billing period.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }
  
  