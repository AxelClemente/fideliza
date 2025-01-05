import { MailingProvider } from './components/mailing-provider'
import { MailingActions } from './components/mailing-actions'
import { Breadcrumb } from '../components/breadcrumb'
import { RestaurantProvider } from '../shop/components/restaurant-provider'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function MailingsPage({ searchParams }: PageProps) {
  const { restaurants } = await RestaurantProvider()
  const currentTab = typeof searchParams?.tab === 'string' 
    ? searchParams.tab 
    : 'in_progress'

  const status = currentTab === 'archive' ? 'archive' : 'in_progress'
  const { mailings } = await MailingProvider(status)
  
  return (
    <div className="p-8">
      <div className="mb-4">
        <Breadcrumb />
      </div>

      <div className="space-y-6">
        {/* Tabs */}
        <MailingActions 
          showOnlyTabs={true}
          restaurants={restaurants}
        />

        {/* Desktop Add Button y mensaje "No Subscriptions yet!" */}
        <div className="hidden md:flex justify-between items-center">
          {mailings.length === 0 && (
            <h2 className="text-[30px] font-[700] leading-[36px] text-third-gray">
              No Mailings yet!
            </h2>
          )}
          <MailingActions 
            showOnlyButton={true}
            restaurants={restaurants}
            hasMailing={mailings.length > 0}
          />
        </div>

        {/* Mailings List */}
        <div className="space-y-4">
          {mailings.length > 0 ? (
            mailings.map((mailing) => (
              <div 
                key={mailing.id}
                className="bg-main-gray rounded-xl border border-gray-200 p-6 lg:w-[1392px] min-h-[150px] w-full"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{mailing.name}</h3>
                    <p className="text-gray-600">{mailing.description}</p>
                  </div>
                  <MailingActions 
                    mode="edit"
                    mailing={mailing}
                    restaurants={restaurants}
                    showSendButton={true}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="md:hidden text-center py-12">
              <p className="text-gray-500">No mailings found</p>
            </div>
          )}
        </div>

        {/* Mobile Add Button */}
        <div className="md:hidden">
          <MailingActions 
            showOnlyButton={true}
            restaurants={restaurants}
          />
        </div>
      </div>
    </div>
  )
}