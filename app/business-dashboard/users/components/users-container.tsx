"use client"

import { useState } from "react"
import { UserActions } from "./user-actions"
import { UsersGrid } from "./users-grid"
import type { BusinessUser } from "../types/types"

interface UsersContainerProps {
  businessUser: BusinessUser
  adminUsers: any[]
  staffUsers: any[]
}

export function UsersContainer({ businessUser, adminUsers, staffUsers }: UsersContainerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="relative min-h-screen pb-[120px] sm:pb-0">
      {/* Vista Desktop */}
      <div className="hidden sm:block space-y-6">
        <UserActions 
          userId={businessUser.id} 
          restaurants={businessUser.restaurants}
          onSearch={setSearchTerm}
        />
      </div>

      {/* Vista Móvil */}
      <div className="block sm:hidden space-y-6">
        <UserActions 
          userId={businessUser.id} 
          restaurants={businessUser.restaurants}
          onSearch={setSearchTerm}
          isMobile
        />
      </div>
      
      <UsersGrid
        businessUser={businessUser}
        adminUsers={adminUsers}
        staffUsers={staffUsers}
        searchTerm={searchTerm}
      />

      {/* Botón flotante en móvil */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t block sm:hidden">
        <UserActions 
          userId={businessUser.id} 
          restaurants={businessUser.restaurants}
          onSearch={setSearchTerm}
          isMobile="button"
        />
      </div>
    </div>
  )
}