"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { AddNewUserModal } from "../modal/add-new-user"
import { ModelType, PermissionType } from "@prisma/client"
import { usePermissions } from "../../shop/contexts/permission-context"

interface UserCardProps {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'STAFF'
  ownerRestaurants: {
    id: string
    title: string
    places: {
      id: string
      name: string
    }[]
  }[]
  imageUrl: string
  userId: string
  permissions?: Array<{
    modelType: ModelType
    permission: PermissionType
    restaurantId: string
  }>
}

export function UserCard({ id, name, email, role, ownerRestaurants, imageUrl, userId, permissions }: UserCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { canAccess } = usePermissions()
  const access = canAccess('ADMIN_USERS')

  const handleDeleteConfirmation = () => {
    toast(
      "Are you sure you want to delete this user?",
      {
        duration: Infinity,
        action: {
          label: "Delete",
          onClick: () => handleDelete(),
        },
        cancel: {
          label: "Cancel",
          onClick: () => console.log("Cancel"),
        },
      }
    )
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/business-users?userId=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      toast.success('User deleted successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-[20px] border bg-white w-[390px] sm:w-[476px] h-[84px] overflow-hidden ml-4 sm:ml-0">
        <div className="flex items-center h-full">
          <div className="h-full w-[90px] sm:w-[106px] relative">
            <img 
              src={imageUrl} 
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="px-4">
            <p className="font-medium text-base">{name}</p>
            <p className="text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-[250px]">
              {ownerRestaurants.flatMap(restaurant => 
                restaurant.places.map(place => place.name)
              ).join(", ")}
            </p>
          </div>
        </div>
        
        {access.canEdit && (
          <div className="!flex !gap-0 !mr-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsEditModalOpen(true)}
              className="!p-2 hover:!text-blue-600"
            >
              <Image
                src="/edit.svg"
                alt="Edit"
                width={17}
                height={15}
              />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDeleteConfirmation}
              disabled={isDeleting}
              className="!p-2 hover:!text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {access.canEdit && (
        <AddNewUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userId={userId}
          restaurants={ownerRestaurants}
          mode="edit"
          initialData={{
            id,
            name,
            email,
            role,
            permissions
          }}
        />
      )}
    </>
  )
}