'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModelType, PermissionType } from "@prisma/client"
import { useState } from "react"

interface AddAccessModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    permissions: Array<{ modelType: ModelType; permission: PermissionType; restaurantId: string }>,
    canDeleteShop: boolean
  ) => void
  restaurants: {
    id: string
    title: string
    places: {
      id: string
      name: string
    }[]
  }[]
  initialPermissions?: Array<{
    modelType: ModelType
    permission: PermissionType
    restaurantId: string
  }>
}

export function AddAccessModal({ 
  isOpen, 
  onClose, 
  onSave, 
  restaurants,
  initialPermissions = []
}: AddAccessModalProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [canDeleteShop, setCanDeleteShop] = useState(false)

  const [permissions, setPermissions] = useState<Record<ModelType, PermissionType>>(() => {
    if (initialPermissions?.length) {
      const existingPermissions: Record<ModelType, PermissionType> = {
        ADMIN_USERS: 'VIEW_ONLY',
        SUBSCRIBERS: 'VIEW_ONLY',
        MAIN_INFO: 'VIEW_ONLY',
        PLACES: 'VIEW_ONLY',
        SPECIAL_OFFERS: 'VIEW_ONLY',
        SUBSCRIPTIONS: 'VIEW_ONLY',
        OFFERS_MAILINGS: 'VIEW_ONLY'
      }

      initialPermissions.forEach(perm => {
        existingPermissions[perm.modelType] = perm.permission
      })

      return existingPermissions
    }

    return {
      ADMIN_USERS: 'VIEW_ONLY',
      SUBSCRIBERS: 'VIEW_ONLY',
      MAIN_INFO: 'VIEW_ONLY',
      PLACES: 'VIEW_ONLY',
      SPECIAL_OFFERS: 'VIEW_ONLY',
      SUBSCRIPTIONS: 'VIEW_ONLY',
      OFFERS_MAILINGS: 'VIEW_ONLY'
    }
  })

  const handlePermissionChange = (modelType: ModelType, permission: PermissionType) => {
    setPermissions(prev => ({
      ...prev,
      [modelType]: permission
    }))
  }

  const handleSave = () => {
    if (!selectedRestaurant) {
      return
    }
    const permissionsArray = Object.entries(permissions).map(([modelType, permission]) => ({
      modelType: modelType as ModelType,
      permission,
      restaurantId: selectedRestaurant
    }))
    onSave(permissionsArray, canDeleteShop)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="
        /* Desktop styles */
        max-w-[706px] 
        p-0 
        overflow-hidden 
        md:!fixed 
        md:!left-auto 
        md:!right-[calc((100vw-1440px)/2)] 
        md:!bottom-0 
        md:!top-0 
        md:!translate-x-0 
        md:!translate-y-0 
        md:!rounded-none 
        md:!h-screen
        /* Mobile styles */
        max-md:!fixed
        max-md:!inset-0
        max-md:!w-[100vw]
        max-md:!max-w-[100vw]
        max-md:!h-screen
        max-md:!m-0
        max-md:!p-0
        max-md:!rounded-none
        max-md:!translate-x-0
        max-md:!translate-y-0
        /* Layout styles */
        flex
        flex-col
      ">
        <DialogHeader className="p-2 pb-0">
          <DialogTitle className="!text-[20px] !font-bold !leading-[24px] !font-['Open_Sans'] px-8">
            Change Access
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="space-y-4 px-8">
              <div className="space-y-0.5">
                <div className="text-[14px] font-bold text-gray-700 uppercase tracking-wide">
                  Name of shop/business
                </div>
                <Select
                  value={selectedRestaurant}
                  onValueChange={setSelectedRestaurant}
                >
                  <SelectTrigger className="bg-[#F6F6F6] border-0 rounded-2xl h-7 text-xs text-gray-500">
                    <SelectValue placeholder="Select a restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map(restaurant => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {Object.entries(permissions).map(([modelType, permission]) => (
                <div key={modelType} className="space-y-0.5">
                  <div className="text-[14px] font-bold text-gray-700 uppercase tracking-wide">
                    {modelType.replace(/_/g, ' ')}
                  </div>
                  <Select
                    value={permission}
                    onValueChange={(value) => handlePermissionChange(modelType as ModelType, value as PermissionType)}
                  >
                    <SelectTrigger className="bg-[#F6F6F6] border-0 rounded-2xl h-7 text-xs text-gray-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEW_ONLY">View only</SelectItem>
                      <SelectItem value="ADD_EDIT">Add/Edit</SelectItem>
                      <SelectItem value="ADD_EDIT_DELETE">Add/Edit/Delete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="space-y-0.5">
                <div className="text-[14px] font-bold text-gray-700 uppercase tracking-wide">
                  Can delete shop
                </div>
                <Select
                  value={canDeleteShop ? "YES" : "NO"}
                  onValueChange={(value) => setCanDeleteShop(value === "YES")}
                >
                  <SelectTrigger className="bg-[#F6F6F6] border-0 rounded-2xl h-7 text-xs text-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO">No</SelectItem>
                    <SelectItem value="YES">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 px-14">
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={!selectedRestaurant}
              className="flex-1 h-[45px] rounded-[100px] bg-black text-white text-[16px] font-semibold leading-[20px] font-['Open_Sans']"
            >
              Save Changes
            </Button>

            <Button 
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-[45px] !text-black !text-[18px] !font-semibold !underline hover:bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}