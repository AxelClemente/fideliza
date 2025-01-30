import React from 'react'
import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'
import { CustomerHeader } from "./components/customer-header"
import { authOptions } from "@/app/api/auth/auth.config"
import { Toaster } from 'sonner'
import { Metadata } from 'next'
import { metadata as siteMetadata } from '../metadata-config'

export const metadata: Metadata = {
  title: siteMetadata.client.title,
  description: siteMetadata.client.description,
}

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const userRole = session.user?.role
  if (!userRole || userRole !== 'CUSTOMER') {
    console.log('Redirecting: Invalid role', userRole)
    redirect('/choose-role')
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <CustomerHeader />

      <main className="w-full flex-1 mt-16 sm:mt-0">
        {children}
      </main>
      <Toaster 
        richColors 
        position="bottom-right"
        expand={false}
        closeButton={true}
      />
    </div>
  )
}

