import { Suspense } from 'react';
import { MailingProvider } from './components/mailing-provider';
import { MailingActions } from './components/mailing-actions';
import { Breadcrumb } from '../components/breadcrumb';
import { RestaurantProvider } from '../shop/components/restaurant-provider';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MailingsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { restaurants } = await RestaurantProvider();
  const currentTab =
    typeof resolvedSearchParams?.tab === 'string'
      ? resolvedSearchParams.tab
      : 'in_progress';

  const status = currentTab === 'archive' ? 'archive' : 'in_progress';
  const { mailings } = await MailingProvider(status);

  return (
    <div className="p-8">
      <div className="mb-4">
        <Breadcrumb />
      </div>

      <h3 className="text-center text-[24px] font-[700] leading-[32px] mb-6 md:hidden">
        Offers mailings
      </h3>

      <div className="space-y-6">
        <MailingActions showOnlyTabs={true} restaurants={restaurants} />

        <Suspense fallback={<div>Loading...</div>}>
          <div className="hidden md:flex justify-between items-center">
            {mailings.length === 0 && (
              <h2 className="text-[30px] font-[700] leading-[36px] text-third-gray">
                No Mailings yet!
              </h2>
            )}
            <div className="ml-auto">
              <MailingActions
                showOnlyButton={true}
                restaurants={restaurants}
                hasMailing={mailings.length > 0}
              />
            </div>
          </div>

          <div className="space-y-4">
            {mailings.length > 0 ? (
              mailings.map((mailing) => (
                <div
                  key={mailing.id}
                  className="bg-main-gray rounded-xl border border-gray-200 p-6 lg:w-[1392px] min-h-[150px] w-full"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div className="
                      mb-4 
                      md:mb-0 
                      md:ml-auto 
                      order-first 
                      md:order-last
                      flex
                      justify-end        /* Alinea los iconos a la derecha en móvil */
                      md:justify-start   /* Mantiene alineación original en desktop */
                    ">
                      <MailingActions
                        mode="edit"
                        mailing={mailing}
                        restaurants={restaurants}
                        showSendButton={true}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {mailing.name}
                      </h3>
                      <p className="text-gray-600">{mailing.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:hidden text-center py-12">
                <p className="text-gray-500">No mailings found</p>
              </div>
            )}
          </div>
        </Suspense>

        <div className="md:hidden">
          <MailingActions 
            showOnlyButton={true} 
            restaurants={restaurants}
            hasMailing={mailings.length > 0}
          />
        </div>
      </div>
    </div>
  );
}
