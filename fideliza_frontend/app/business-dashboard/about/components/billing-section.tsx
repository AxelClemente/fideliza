import { Download } from 'lucide-react'

export default function BillingSection() {
  return (
    <div className="w-full">
     
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tariff Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 w-full lg:w-[400px] h-fit">
          <h3 className="text-lg font-semibold mb-1 text-center">Unlimited tariff</h3>
          <div className="text-lg font-semibold mb-4 text-center">90€ a year</div>
          <p className="text-sm text-gray-500 mb-6 text-center">Valid until: 20.10.2025</p>
          <p className="text-sm text-gray-600 mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed consequat mi
            et libero et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <div className="space-y-3">
            <button className="w-[329px] h-[78px] bg-black text-white rounded-full py-2 px-4 text-sm hover:bg-gray-800 transition-colors">
              Download your contract copy
            </button>
            <button className="w-[329px] h-[78px] bg-black text-white rounded-full py-2 px-4 text-sm hover:bg-gray-800 transition-colors">
              Extend the contract
            </button>
            <button className="w-[329px] h-[78px] bg-black text-white rounded-full py-2 px-4 text-sm hover:bg-gray-800 transition-colors">
              Change tariff
            </button>
          </div>
        </div>

        {/* Billing History Table - Hidden on mobile */}
        <div className="hidden md:flex flex-1 overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-semibold">Date</th>
                <th className="text-left py-4 px-4 font-semibold">Tariff</th>
                <th className="text-left py-4 px-4 font-semibold">Price</th>
                <th className="text-left py-4 px-4 font-semibold">State</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {[2025, 2024, 2023, 2022].map((year) => (
                <tr key={year} className="border-b">
                  <td className="py-4 px-4">20.10.{year}</td>
                  <td className="py-4 px-4">Unlimited tariff</td>
                  <td className="py-4 px-4">90€ a year</td>
                  <td className="py-4 px-4">Success</td>
                  <td className="py-4 px-4">
                    <button className="hover:bg-gray-100 p-2 rounded-full">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Transactions Button */}
        <div className="md:hidden w-full bg-white rounded-lg border border-gray-200 p-6">
          <button className="w-full h-[78px] bg-[#000000] text-white rounded-full py-2 px-4 text-sm hover:bg-opacity-90 transition-colors">
            See transactions
          </button>
        </div>
      </div>
    </div>
  )
}