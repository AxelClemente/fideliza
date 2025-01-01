'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ClipLoader } from 'react-spinners'
import { toast } from 'sonner'
import personIcon from "@/public/person-icon.svg"
import emailIcon from "@/public/email.-icon.svg"
import { CustomerChangePasswordModal } from "./customer-change-password-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomerProfileModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    id: string
    name: string
    email: string
    location: string
    avatar?: string
  }
}

// Definimos una interfaz para los errores
interface ApiError {
  message: string
}

export function CustomerProfileModal({
  isOpen,
  onClose,
  initialData
}: CustomerProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [city, setCity] = useState(initialData?.location || '')
  const [avatar, setAvatar] = useState(initialData?.avatar || '')
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [hasPassword, setHasPassword] = useState<boolean>(false)
  const [locations, setLocations] = useState<string[]>([])

  const checkPasswordStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-password')
      const data = await response.json()
      setHasPassword(data.hasPassword)
    } catch (err: unknown) { // Tipado más específico
      console.error('Error checking password status:', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkPasswordStatus()
    }
  }, [isOpen])

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/location')
        const data = await response.json()
        setLocations(data)
      } catch (err: unknown) { // Tipado más específico
        console.error('Error fetching locations:', err instanceof Error ? err.message : 'Unknown error')
      }
    }

    if (isOpen) {
      fetchLocations()
    }
  }, [isOpen])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload image')

      const data = await response.json()
      setAvatar(data.secure_url)
    } catch { // Eliminado el parámetro error no utilizado
      toast.error("Failed to upload image. Please try again.")
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      if (!name.trim() || !email.trim() || !city) {
        toast.error("All fields are required")
        return
      }

      const response = await fetch('/api/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          city,
        }),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      onClose()

      setTimeout(() => {
        toast.success("Your profile has been updated", {
          description: `Your location is now set to ${city}`,
          duration: 3000,
        })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }, 300)

    } catch { // Eliminado el parámetro error no utilizado
      toast.error("Failed to update profile. Please try again.")
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
              Edit profile
            </DialogTitle>
          </DialogHeader>

          <div className="!flex-1 !flex !flex-col">
            {/* Content Section */}
            <div className="!flex-1 !p-3 md:!p-4">
              {/* Avatar Upload */}
              <div className="
                !flex 
                !justify-center 
                !mb-6 
                !mt-4
                md:!mt-[-30px]
                md:!mb-12
              ">
                <div className="relative">
                  <Image
                    src={avatar || '/default-avatar.png'}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full object-cover"
                  />
                  <label 
                    htmlFor="avatarInput"
                    className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                  </label>
                  <input
                    id="avatarInput"
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="
                !space-y-4 
                !px-4 
                md:!px-8 
                !mt-2
                md:!mt-[-20px]
              ">
                <div className="relative w-full">
                  <Image 
                    src={personIcon}
                    alt="Person"
                    className="absolute left-4 md:left-10 top-1/2 transform -translate-y-1/2 z-10"
                  />
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    placeholder="Name"
                  />
                </div>

                <div className="relative w-full">
                  <Image 
                    src={emailIcon}
                    alt="Email"
                    className="absolute left-4 md:left-10 top-1/2 transform -translate-y-1/2 z-10"
                  />
                  <Input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Email"
                    type="email"
                  />
                </div>

                <div className="space-y-2 w-full">
                  <p className="
                    text-[16px]
                    leading-[20px]
                    font-[700]
                    pl-6
                    md:pl-12
                  ">
                    Your City
                  </p>
                  <Select
                    value={city || ''}
                    onValueChange={setCity}
                  >
                    <SelectTrigger className="
                      bg-main-gray 
                      h-[60px]
                      md:h-[78px] 
                      w-full
                      md:w-[558px] 
                      rounded-[100px]
                      border-0
                      text-[16px]
                      px-6
                      md:px-12
                      text-[#7B7B7B]
                    ">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem 
                          key={location} 
                          value={location}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              {/* Buttons Container */}
              <div className="
                !flex
                !flex-col
                !gap-4
                md:!gap-2
                !w-full
                !items-center
              ">
                <Button 
                  variant="ghost"
                  onClick={() => {
                    if (!hasPassword) {
                      toast.error('Error', {
                        description: 'You need to set up a password first. Please contact support.'
                      })
                      return
                    }
                    setIsPasswordModalOpen(true)
                  }}
                  className="
                    !w-[350px]
                    md:!w-[558px]
                    !h-[78px]
                    !rounded-[100px]
                    !bg-black
                    !text-white
                    !font-['Open_Sans']
                    !text-[16px]
                    md:!text-[18px]
                    !font-[600]
                    !leading-[22px]
                    !tracking-[0.0192px]
                    !text-center
                    md:!mb-0
                  "
                >
                  Change password
                </Button>

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
                    md:!mt-2
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
                    md:!hidden
                  "
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        <CustomerChangePasswordModal 
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}