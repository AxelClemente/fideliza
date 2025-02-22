import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth.config"
import { prisma } from '@/lib/prisma'
import { CustomerProfileInfo } from './components/customer-profile-info'

async function getCustomerProfile() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      location: true,
      userSubscriptions: {
        where: {
          isActive: true
        },
        distinct: ['subscriptionId'],
        include: {
          subscription: {
            select: {
              name: true,
              benefits: true,
              price: true
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
      }
    }
  })

  if (!user) return null

  const subscriptions = user.userSubscriptions.map(sub => ({
    id: sub.id,
    nextPayment: sub.nextPayment,
    amount: sub.subscription.price,
    remainingVisits: sub.remainingVisits,
    place: {
      name: sub.place.name,
      restaurant: {
        id: sub.place.restaurant.id,
        title: sub.place.restaurant.title,
        images: sub.place.restaurant.images
      }
    },
    subscription: {
      name: sub.subscription.name,
      benefits: sub.subscription.benefits
    }
  }))

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    location: user.location,
    subscriptions
  }
}

export default async function CustomerProfilePage() {
  const userData = await getCustomerProfile()

  if (!userData) {
    return null
  }

  return <CustomerProfileInfo {...userData} />
}