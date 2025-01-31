"use client"

import { useState, useEffect } from "react"
import { UserCard } from "./user-card"
import { BusinessUserCard } from "./business-user-card"
import { SubscriberCard } from "./subscriber-card"
import { ModelType, PermissionType } from '@prisma/client'
import { useTranslations } from "use-intl"

interface UsersGridProps {
  businessUser: {
    id: string
    name: string | null
    image: string | null
    restaurants: {
      id: string
      title: string
      places: {
        id: string
        name: string
      }[]
    }[]
  }
  adminUsers: Array<{
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: 'ADMIN' | 'STAFF'
    permissions?: Array<{
      modelType: ModelType
      permission: PermissionType
      restaurantId: string
    }>
  }>
  staffUsers: Array<{
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: 'ADMIN' | 'STAFF'
    permissions?: Array<{
      modelType: ModelType
      permission: PermissionType
      restaurantId: string
    }>
  }>
  searchTerm: string
}

export function UsersGrid({ businessUser, adminUsers, staffUsers, searchTerm }: UsersGridProps) {
  const t = useTranslations('BusinessDashboard')
  const [filteredAdminUsers, setFilteredAdminUsers] = useState(adminUsers)
  const [filteredStaffUsers, setFilteredStaffUsers] = useState(staffUsers)

  useEffect(() => {
    const filterUsers = (users: typeof adminUsers) => {
      if (!searchTerm) return users
      
      const term = searchTerm.toLowerCase()
      return users.filter(user => 
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      )
    }

    setFilteredAdminUsers(filterUsers(adminUsers))
    setFilteredStaffUsers(filterUsers(staffUsers))
  }, [searchTerm, adminUsers, staffUsers])

  const hasAnyUsers = filteredAdminUsers.length > 0 || filteredStaffUsers.length > 0
  const showAdminsSection = hasAnyUsers ? filteredAdminUsers.length > 0 : true
  const showStaffSection = hasAnyUsers ? filteredStaffUsers.length > 0 : true

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
      {/* Wrapper para Owner y Subscribers */}
      <div className="col-span-1 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-x-6">
        {/* Business User Section */}
        <div className="sm:flex sm:flex-col mb-8 sm:mb-0">
          <div className="flex items-center justify-between mb-4 w-[calc(100%-2rem)] sm:!w-[457px] mx-4 sm:mx-0 !mt-8">
            <h2 className="!text-[24px] font-medium">{t('owner')}</h2>
          </div>
          <div className="space-y-2 w-full">
            <BusinessUserCard
              name={businessUser.name || ''}
              restaurants={businessUser.restaurants}
              imageUrl={businessUser.image || ''}
            />
          </div>
        </div>

        {/* Subscribers Section */}
        <div className="sm:flex sm:flex-col">
          <div className="flex items-center justify-between mb-4 w-[calc(100%-2rem)] sm:!w-[457px] mx-4 sm:mx-0 !mt-8">
            <h2 className="!text-[24px] font-medium">{t('subscribers')}</h2>
          </div>
          <SubscriberCard />
        </div>
      </div>

      {/* Admins Section */}
      {showAdminsSection && (
        <section className="col-span-2 mt-6">
          <div className="flex items-center justify-between mb-4 w-[calc(100%-2rem)] sm:!w-[457px] mx-4 sm:mx-0">
            <h2 className="!text-[24px] font-medium">{t('admins')}</h2>
          </div>
          <div className="space-y-2">
            {filteredAdminUsers.length > 0 ? (
              filteredAdminUsers.map(admin => (
                <UserCard
                  key={admin.id}
                  id={admin.id}
                  name={admin.name || ''}
                  email={admin.email || ''}
                  role={admin.role}
                  ownerRestaurants={businessUser.restaurants}
                  imageUrl={admin.image || '/images/placeholder.png'}
                  userId={businessUser.id}
                  permissions={admin.permissions}
                />
              ))
            ) : (
              <div className="!text-[20px] text-muted-foreground hover:no-underline !font-[700] pt-3 pl-4">
                {searchTerm ? "No admin users found" : "No admin users yet"}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Staff Section */}
      {showStaffSection && (
        <section className="col-span-2 mt-6">
          <div className="flex items-center justify-between mb-4 w-[calc(100%-2rem)] sm:!w-[457px] mx-4 sm:mx-0">
            <h2 className="!text-[24px] font-medium">Staff</h2>
          </div>
          <div className="space-y-2">
            {filteredStaffUsers.length > 0 ? (
              filteredStaffUsers.map(staffUser => (
                <UserCard
                  key={staffUser.id}
                  id={staffUser.id}
                  name={staffUser.name || ''}
                  email={staffUser.email || ''}
                  role={staffUser.role}
                  ownerRestaurants={businessUser.restaurants}
                  imageUrl={staffUser.image || '/images/placeholder.png'}
                  userId={businessUser.id}
                  permissions={staffUser.permissions}
                />
              ))
            ) : (
              <div className="!text-[20px] text-muted-foreground hover:no-underline !font-[700] pt-3 pl-4">
                {searchTerm ? "No staff users found" : "No staff users yet"}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}