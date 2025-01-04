import { MailingProvider } from './components/mailing-provider'
import { MailingActions } from './components/mailing-actions'
import { Breadcrumb } from '../components/breadcrumb'
import { RestaurantProvider } from '../shop/components/restaurant-provider'

export default async function MailingsPage() {
  const { restaurants } = await RestaurantProvider()
  const { mailings } = await MailingProvider('in_progress')
  
  return (
    <div className="p-8">
      <div className="mb-4">
        <Breadcrumb />
      </div>

      <div className="space-y-6">
        {/* Tabs and Actions */}
        <MailingActions 
          showOnlyTabs={true}
          restaurants={restaurants}
        />

        {/* Mailings List */}
        <div className="space-y-4">
          {mailings.length > 0 ? (
            mailings.map((mailing) => (
              <div 
                key={mailing.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
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
            <div className="text-center py-12">
              <p className="text-gray-500">No mailings found</p>
            </div>
          )}
        </div>

        {/* Add New Button */}
        <MailingActions 
          showOnlyButton={true}
          restaurants={restaurants}
        />
      </div>
    </div>
  )
}