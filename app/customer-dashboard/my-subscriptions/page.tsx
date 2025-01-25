import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/api/auth/auth.config"
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UserSubscriptionsList } from './components/user-subscriptions-list'

export default async function MySubscriptionsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const userSubscriptions = await prisma.userSubscription.findMany({
    distinct: ['subscriptionId'],
    where: {
      userId: session.user.id,
      isActive: true
    },
    select: {
      id: true,
      remainingVisits: true,
      status: true,
      nextPayment: true,
      amount: true,
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
              },
              places: {
                select: {
                  id: true,
                  name: true,
                  location: true,
                  subscriptions: {
                    select: {
                      id: true,
                      name: true,
                      benefits: true,
                      price: true,
                      visitsPerMonth: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  console.log('UserSubscriptions data:', JSON.stringify(userSubscriptions.map(sub => ({
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
          My Subscriptions
        </h1>
        <span className="
          !text-[24px]
          !leading-[32.68px]
          !font-['Open_Sans']
          !font-[700]
          text-main-dark
        ">
          ({userSubscriptions.length})
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
          My Subscriptions
        </h1>
        <span className="
          text-[30px]
          font-bold
          text-main-dark
        ">
          ({userSubscriptions.length})
        </span>
      </div>
      <UserSubscriptionsList subscriptions={userSubscriptions} />
    </div>
  )
}