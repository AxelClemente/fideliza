import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UserSubscriptionsList } from './components/user-subscriptions-list'
import { getTranslations } from 'next-intl/server'

export default async function MySubscriptionsPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations('CustomerDashboard')
  
  if (!session?.user?.id) {
    redirect('/auth?mode=signin')
  }

  const userSubscriptions = await prisma.userSubscription.findMany({
    where: {
      userId: session.user.id,
      isActive: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      remainingVisits: true,
      status: true,
      nextPayment: true,
      amount: true,
      subscriptionId: true,
      createdAt: true,
      subscription: {
        select: {
          name: true,
          benefits: true,
          visitsPerMonth: true
        }
      },
      place: {
        include: {
          restaurant: {
            select: {
              id: true,
              title: true,
              images: {
                select: {
                  url: true
                },
                take: 1
              }
            }
          }
        }
      }
    }
  })

  const latestSubscriptions = Object.values(
    userSubscriptions.reduce((acc, sub) => {
      if (!acc[sub.subscriptionId] || 
          new Date(acc[sub.subscriptionId].createdAt) < new Date(sub.createdAt)) {
        acc[sub.subscriptionId] = sub;
      }
      return acc;
    }, {} as Record<string, typeof userSubscriptions[0]>)
  );

  console.log('UserSubscriptions data:', JSON.stringify(latestSubscriptions.map(sub => ({
    subscriptionId: sub.id,
    restaurantId: sub.place.restaurant.id,
    restaurantTitle: sub.place.restaurant.title
  })), null, 2))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Versión móvil */}
      <div className="
        flex 
        flex-row
        items-center 
        justify-center 
        gap-2 
        mb-8
        md:hidden
      ">
        <h1 className="
          !text-[24px]
          !leading-[32.68px]
          !font-['Open_Sans']
          !font-[700]
        ">
          {t('MySubscriptions.title')}
        </h1>
        <span className="
          !text-[24px]
          !leading-[32.68px]
          !font-['Open_Sans']
          !font-[700]
          text-main-dark
        ">
          ({latestSubscriptions.length})
        </span>
      </div>

      {/* Versión desktop */}
      <div className="
        hidden
        md:flex 
        items-center 
        gap-2 
        mb-8
        md:pl-12
      ">
        <h1 className="
          text-[30px]
          font-bold
        ">
          {t('MySubscriptions.title')}
        </h1>
        <span className="
          text-[30px]
          font-bold
          text-main-dark
        ">
          ({latestSubscriptions.length})
        </span>
      </div>
      <UserSubscriptionsList subscriptions={latestSubscriptions} />
    </div>
  )
}