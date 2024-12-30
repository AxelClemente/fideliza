import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, location, placeId } = body
    
    console.log('Request body:', { name, description, location, placeId })

    // Obtener los userSubscriptions activos para el place específico
    const userSubscriptions = await prisma.userSubscription.findMany({
      where: {
        placeId: placeId,
        isActive: true
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!userSubscriptions.length) {
      console.log('No subscribers found for placeId:', placeId)
      return NextResponse.json(
        { error: 'No subscribers found for this place' },
        { status: 404 }
      )
    }

    console.log('Found subscribers:', {
      count: userSubscriptions.length,
      subscribers: userSubscriptions.map(sub => ({
        userName: sub.user?.name,
        userEmail: sub.user?.email,
        isActive: sub.isActive
      }))
    })

    // Crear el template HTML con el nombre del place
    const createEmailHTML = (subscriberName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">✨ Exclusive for Loyalty Program Members</h2>
        <h3>${name}</h3>
        <p style="color: #666; line-height: 1.6;">${description}</p>
        <p style="color: #666;">Location: ${location}</p>
      </div>
    `

    // 3. Enviar emails con Resend (con rate limiting básico)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const failedEmails = []

    for (const subscriber of userSubscriptions) {
      if (!subscriber.user?.email) continue

      try {
        await resend.emails.send({
          from: 'Loyalty Program <onboarding@resend.dev>',
          to: subscriber.user.email,
          subject: `New Offer: ${name}`,
          html: createEmailHTML(subscriber.user.name || 'Valued Member')
        })
        
        await delay(100) // Rate limiting básico
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.user.email}:`, error)
        failedEmails.push(subscriber.user.email)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Emails sent to ${userSubscriptions.length - failedEmails.length} subscribers`,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined
    })

  } catch (error) {
    console.error('Error sending emails:', error)
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    )
  }
} 