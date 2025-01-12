'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddNewUserModal } from "../modal/add-new-user"
import { useState } from "react"
import Image from "next/image"
import { usePermissions } from "@/app/business-dashboard/shop/contexts/permission-context"

interface UserActionsProps {
  userId: string
  restaurants: {
    id: string
    title: string
    description: string | null
    userId: string
    places: {
      id: string
      name: string
      location: string
      phoneNumber?: string | null
    }[]
  }[]
  onSearch?: (value: string) => void
  isMobile?: boolean | "button"
}

export function UserActions({ userId, restaurants, onSearch, isMobile }: UserActionsProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { canAccess } = usePermissions()
  const access = canAccess('ADMIN_USERS')

  // Solo mostrar el botón para la versión móvil inferior
  if (isMobile === "button") {
    return access.canEdit ? (
      <>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-black text-white rounded-[100px] h-[78px] px-8 text-[18px] font-[600] leading-[22px]"
        >
          Add new user
        </Button>
        <AddNewUserModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          userId={userId}
          restaurants={restaurants}
        />
      </>
    ) : null
  }

  // Solo mostrar el searchbar para la versión móvil superior
  if (isMobile === true) {
    return (
      <>
        <h3 className="text-center text-[24px] font-[700] leading-[32px] mb-6 sm:hidden">
          Users
        </h3>
        <div className="relative w-[390px] mx-auto">
          <Image
            src="/lupa.svg"
            alt="Search"
            width={18}
            height={18}
            className="absolute left-8 top-1/2 -translate-y-1/2"
          />
          <Input
            type="search"
            placeholder="Search"
            className="w-full bg-main-gray text-third-gray rounded-[100px] h-[78px] pl-16 pr-8 placeholder:text-third-gray border-0 focus-visible:ring-0 focus-visible:ring-offset-0 -ml-[1px]"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </>
    )
  }

  // Vista desktop normal
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
      <div className="relative w-full">
        <Image
          src="/lupa.svg"
          alt="Search"
          width={18}
          height={18}
          className="absolute left-8 top-1/2 -translate-y-1/2"
        />
        <Input
          type="search"
          placeholder="Search"
          className="w-full bg-main-gray text-third-gray rounded-[100px] h-[78px] pl-16 pr-8 placeholder:text-third-gray border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      {access.canEdit && (
        <>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-[192px] bg-black text-white rounded-[100px] h-[78px] px-8 text-[18px] font-[600] leading-[22px]"
          >
            Add new user
          </Button>
          <AddNewUserModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            userId={userId}
            restaurants={restaurants}
          />
        </>
      )}
    </div>
  )
}