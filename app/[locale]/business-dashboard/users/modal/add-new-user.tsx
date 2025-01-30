'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddAccessModal } from "./add-access"
import { ModelType, PermissionType } from "@prisma/client"

interface AddNewUserModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  restaurants: {
    id: string
    title: string
    places: {
      id: string
      name: string
    }[]
  }[]
  mode?: 'create' | 'edit'
  initialData?: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'STAFF'
    canDeleteShop?: boolean
    permissions?: Array<{
      modelType: ModelType
      permission: PermissionType
      restaurantId: string
    }>
  }
}

export function AddNewUserModal({
  isOpen,
  onClose,
  userId,
  restaurants,
  mode = 'create',
  initialData
}: AddNewUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>(initialData?.role || 'STAFF')
  const [canDeleteShop, setCanDeleteShop] = useState(initialData?.canDeleteShop || false)
  const [permissions, setPermissions] = useState<Array<{
    modelType: ModelType
    permission: PermissionType
    restaurantId: string
  }>>(initialData?.permissions || [])

  const handleSavePermissions = (
    newPermissions: Array<{
      modelType: ModelType
      permission: PermissionType
      restaurantId: string
    }>,
    newCanDeleteShop: boolean
  ) => {
    setPermissions(newPermissions)
    setCanDeleteShop(newCanDeleteShop)
    setIsAccessModalOpen(false)
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // Validaciones básicas
      if (!name.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Name is required",
        })
        return
      }

      if (!email.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Email is required",
        })
        return
      }

      if (mode === 'create' && !password.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Password is required for new users",
        })
        return
      }

      const endpoint = mode === 'create' ? '/api/business-users' : `/api/business-users?id=${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialData?.id,
          name,
          email,
          ...(password && { password }),
          role,
          ownerId: userId,
          permissions,
          canDeleteShop: role === 'STAFF' ? canDeleteShop : false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Failed to ${mode} user`)
      }

      toast({
        title: "Success",
        description: `User ${mode === 'create' ? 'created' : 'updated'} successfully`,
      })

      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: typeof error === 'string' ? error : `Failed to ${mode} user. Please try again.`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="
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
        ">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="
              text-[22px]
              md:text-[26px]
              font-bold 
              leading-[30px] 
              font-['Open_Sans'] 
              px-4
              md:px-8 
              mt-6
            ">
              {mode === 'create' ? 'Add new user' : 'Edit user'}
            </DialogTitle>
          </DialogHeader>

          <div className="
            p-4 
            space-y-4 
            overflow-y-auto 
            max-h-[calc(100vh-200px)]
            md:max-h-[calc(100vh-240px)]
          ">
            <div className="space-y-3 px-4 md:px-8">
              {/* Campos del formulario - ajustados para móvil */}
              <div className="space-y-3">
                {/* Input Name */}
                <div className="relative">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="
                      bg-[#F6F6F6] 
                      pl-12 
                      h-[60px]
                      md:h-[78px]
                      md:w-[558px]
                      rounded-[100px]
                      border-0
                      text-base
                    "
                    placeholder="Name"
                  />
                  <svg
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                {/* Input Email */}
                <div className="relative">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                      bg-[#F6F6F6] 
                      pl-12
                      h-[60px]
                      md:h-[78px]
                      md:w-[558px]
                      rounded-[100px]
                      border-0
                      text-base
                    "
                    placeholder="Email"
                    type="email"
                  />
                  <svg
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Input Password */}
                {mode === 'create' && (
                  <div className="relative">
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="
                        bg-[#F6F6F6] 
                        pl-12
                        h-[60px]
                        md:h-[78px]
                        md:w-[558px]
                        rounded-[100px]
                        border-0
                        text-base
                      "
                      placeholder="Password"
                      type="password"
                    />
                    <svg
                      className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B7B7B]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                )}

                {/* Select Role */}
                <div>
                  <div className="
                    text-[16px] 
                    leading-[20px] 
                    font-['Open_Sans'] 
                    font-[700] 
                    mb-1 
                    text-black
                  ">
                    Role
                  </div>
                  <Select
                    onValueChange={(value) => setRole(value as 'ADMIN' | 'STAFF')}
                    value={role}
                  >
                    <SelectTrigger className="
                      bg-[#F6F6F6] 
                      border-0 
                      rounded-[100px]
                      h-[60px]
                      md:h-[78px]
                      md:w-[558px]
                      pl-6
                    ">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Botones de Staff */}
                {role === 'STAFF' && (
                  <div className="space-y-2">
                    <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-6">
                      <Button
                        variant="default"
                        onClick={() => setPermissions([])}
                        className="
                          w-full 
                          md:w-[280px] 
                          h-[78px] 
                          rounded-[100px] 
                          bg-black 
                          text-white 
                          text-[16px] 
                          font-semibold 
                          leading-[20px] 
                          font-['Open_Sans']
                        "
                      >
                        Reset access
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => setIsAccessModalOpen(true)}
                        className="
                          w-full 
                          md:w-[280px] 
                          h-[78px] 
                          rounded-[100px] 
                          bg-black 
                          text-white 
                          text-[16px] 
                          font-semibold 
                          leading-[20px] 
                          font-['Open_Sans']
                        "
                      >
                        Add access
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="
            p-4 
            md:px-14 
            space-y-3
            mt-auto
            bg-white
            border-t
          ">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="
                w-full 
                h-[78px] 
                rounded-[100px] 
                bg-black 
                text-white 
                text-[16px] 
                font-semibold 
                leading-[20px] 
                font-['Open_Sans']
              "
            >
              {isLoading ? (
                <ClipLoader size={20} color="#FFFFFF" />
              ) : (
                mode === 'create' ? 'Save' : 'Update'
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="
                w-full 
                h-[60px] 
                !text-black 
                !text-[18px] 
                !font-semibold 
                !underline 
                hover:bg-transparent
              "
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onSave={handleSavePermissions}
        restaurants={restaurants}
      />
    </>
  )
}