'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from 'sonner'
import changePassIcon from "@/public/changepass.svg"
import Image from "next/image"

interface CustomerChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CustomerChangePasswordModal({
  isOpen,
  onClose,
}: CustomerChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async () => {
    try {
      console.log('Starting password change...')
      setIsLoading(true)

      if (!oldPassword || !newPassword || !confirmPassword) {
        console.log('Missing fields:', { oldPassword, newPassword, confirmPassword })
        toast.error('Error', {
          description: 'All fields are required'
        })
        return
      }

      if (newPassword !== confirmPassword) {
        console.log('Passwords do not match:', { newPassword, confirmPassword })
        toast.error('Error', {
          description: "New passwords don't match"
        })
        return
      }

      console.log('Sending request to change password...')
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      })

      const data = await response.json()
      console.log('Server response:', data)

      if (!response.ok) {
        console.log('Server error:', response.status)
        throw new Error('Failed to change password')
      }

      console.log('Password changed successfully, showing toast...')
      toast.success('Success', {
        description: 'Password changed successfully. Please log out and sign in again with your new password.'
      })

      onClose()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast.error('Error', {
        description: 'Failed to change password. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="
        !max-w-[706px] 
        !p-0 
        !overflow-auto
        !fixed 
        !left-0
        !right-0
        !bottom-0 
        !top-0 
        !translate-x-0
        !translate-y-0 
        !rounded-none
        !h-screen
        md:!left-auto
        md:!right-[calc((100vw-1440px)/2)]
        !duration-0
        !animate-none
        !transition-none
      ">
        <div className="!min-h-screen !flex !flex-col">
          <DialogHeader className="!p-3 md:!p-4 !pb-0 !flex-shrink-0">
            <DialogTitle className="
              !text-[24px]
              md:!text-[30px]
              !font-bold 
              !leading-[28px]
              md:!leading-[34px]
              !font-['Open_Sans'] 
              !px-4 
              md:!px-8            
              !mb-2
              !w-full
              !text-center
              md:!text-left
            ">
              Change password
            </DialogTitle>
          </DialogHeader>

          <div className="!flex-1 !flex !flex-col">
            {/* Content Section */}
            <div className="!flex-1 !p-3 md:!p-4">
              {/* Form Fields */}
              <div className="
                !space-y-4 
                !px-4 
                md:!px-8 
                !mt-8
              ">
                <div className="relative w-full">
                  <Image 
                    src={changePassIcon}
                    alt="Lock"
                    className="absolute left-4 md:left-10 top-1/2 transform -translate-y-1/2 z-10"
                  />
                  <Input 
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="
                      bg-main-gray 
                      h-[60px]
                      md:h-[78px] 
                      w-full
                      md:w-[558px] 
                      rounded-[100px]
                      border-0
                      text-[16px]
                      pl-12
                      md:pl-20
                      pr-6
                      text-[#7B7B7B]
                      placeholder:text-[#7B7B7B]
                    " 
                    placeholder="Old password"
                  />
                </div>

                <div className="relative w-full">
                  <Image 
                    src={changePassIcon}
                    alt="Lock"
                    className="absolute left-4 md:left-10 top-1/2 transform -translate-y-1/2 z-10"
                  />
                  <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="
                      bg-main-gray 
                      h-[60px]
                      md:h-[78px] 
                      w-full
                      md:w-[558px] 
                      rounded-[100px]
                      border-0
                      text-[16px]
                      pl-12
                      md:pl-20
                      pr-6
                      text-[#7B7B7B]
                      placeholder:text-[#7B7B7B]
                    " 
                    placeholder="New password"
                  />
                </div>

                <div className="relative w-full">
                  <Image 
                    src={changePassIcon}
                    alt="Lock"
                    className="absolute left-4 md:left-10 top-1/2 transform -translate-y-1/2 z-10"
                  />
                  <Input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="
                      bg-main-gray 
                      h-[60px]
                      md:h-[78px] 
                      w-full
                      md:w-[558px] 
                      rounded-[100px]
                      border-0
                      text-[16px]
                      pl-12
                      md:pl-20
                      pr-6
                      text-[#7B7B7B]
                      placeholder:text-[#7B7B7B]
                    " 
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="
              !w-full
              !p-4
              !bg-white
              !flex 
              !flex-col 
              !items-center
              !mt-auto
              !fixed
              !bottom-0
              !left-0
              !right-0
              md:!relative
              md:!mt-0
            ">
              <div className="
                !flex
                !flex-col
                !gap-4
                md:!gap-2
                !w-full
                !items-center
              ">
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="
                    !w-[350px]
                    md:!w-[558px]
                    !h-[78px]
                    !rounded-[100px]
                    !bg-black 
                    !text-white
                    !text-[16px] 
                    !font-semibold 
                    !leading-[20px] 
                    !font-['Open_Sans']
                  "
                >
                  {isLoading ? <ClipLoader size={20} color="#FFFFFF" /> : 'Save'}
                </Button>

                <Button 
                  variant="ghost"
                  onClick={onClose}
                  className="
                    !w-[350px]
                    md:!w-[558px]
                    !h-[78px]
                    !rounded-[100px]
                    !underline
                    !text-[16px] 
                    !font-semibold 
                    !leading-[20px] 
                    !font-['Open_Sans']
                    hover:!bg-gray-100
                  "
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
