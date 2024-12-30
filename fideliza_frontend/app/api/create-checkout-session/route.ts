import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { subscriptionId, placeId, price, name } = body

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name,
            },
            unit_amount: price * 100, // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer-dashboard/my-subscriptions?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer-dashboard/my-subscriptions?canceled=true`,
      metadata: {
        userId: session.user.id,
        subscriptionId,
        placeId,
      },
    })

    return NextResponse.json({ sessionId: stripeSession.id })
  } catch (error) {
    console.error('Stripe session error:', error)
    return new NextResponse('Error creating checkout session', { status: 500 })
  }
} 