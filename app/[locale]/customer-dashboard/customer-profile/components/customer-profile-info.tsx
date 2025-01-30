"use client"

import Image from "next/image"
import { Camera } from "lucide-react"
import { formatDate } from '@/lib/utils'
import editIcon from "@/public/edit.svg"
import { useState, useRef } from "react"
import { CustomerProfileModal } from "../modal/customer-profile-modal"
import { ClipLoader } from 'react-spinners'
import { toast } from 'sonner'
import { useSession } from "next-auth/react"

interface CustomerProfileInfoProps {
  id: string
  name: string | null
  email: string | null
  image: string | null
  location: string | null
  subscriptions: Array<{
    id: string
    subscription: {
      name: string
      benefits: string
    }
    place: {
      name: string
      restaurant: {
        title: string
        images: Array<{
          url: string
        }>
      }
    }
    nextPayment: Date
    amount: number
  }>
}

export function CustomerProfileInfo({ 
  id,
  name, 
  email, 
  image,
  location,
  subscriptions
}: CustomerProfileInfoProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(image)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { update: updateSession } = useSession()

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Error', {
        description: "Image must be less than 5MB"
      })
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/avatar-image', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setPreviewImage(data.image)
      
      await updateSession({
        image: data.image
      })

      toast.success('Success', {
        description: "Profile picture updated successfully"
      })

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error', {
        description: "Failed to update profile picture"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-full">
          {/* Sección de perfil */}
          <div className="md:pl-20">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden">
                  <Image
                    src={previewImage || "/images/placeholder1.png"}
                    alt="Profile"
                    width={146}
                    height={146}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button 
                  onClick={handleImageClick}
                  className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ClipLoader size={20} color="#FFFFFF" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Información del usuario */}
              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="
                    !text-[30px]
                    !leading-[36px]
                    !font-['Open_Sans']
                    !font-[700]
                    !mt-3
                  ">
                    {name}
                  </h1>
                  <Image 
                    src={editIcon}
                    alt="Edit"
                    className="mt-4 cursor-pointer ml-20"
                    onClick={() => setIsEditModalOpen(true)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="
                    text-[20px]
                    leading-[26px]
                    font-['Open_Sans']
                    font-[700]
                  ">Email:</p>
                  <p className="font-semibold">{email}</p>
                </div>
                {location && (
                  <div className="flex items-center gap-2">
                    <p className="
                      text-[20px]
                      leading-[26px]
                      font-['Open_Sans']
                      font-[700]
                    ">City:</p>
                    <p className="
                      text-[20px]
                      leading-[26px]
                      font-['Open_Sans']
                      font-[600]
                      text-justify
                    ">{location}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nueva sección de suscripciones */}
          <div className="mt-8 md:pl-12">
            <h2 className="text-[30px] font-bold mb-6 font-['Open_Sans'] pl-8">
              Active Subscriptions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:ml-0">
              {subscriptions.map((sub) => (
                <div 
                  key={sub.id}
                  className="
                    w-full
                    md:w-[389px]
                    border 
                    rounded-[20px]
                    overflow-hidden 
                    shadow-sm 
                    hover:shadow-md 
                    transition-shadow
                    mx-auto
                  "
                >
                  {sub.place.restaurant.images?.[0] && (
                    <>
                      <div className="relative w-full md:w-[389px] h-[245px]">
                        <Image
                          src={sub.place.restaurant.images[0].url}
                          alt={sub.place.restaurant.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-center py-4">
                        <p className="
                          w-[209px]
                          h-[26px]
                          text-[20px]
                          leading-[26px]
                          font-['Open_Sans']
                          font-semibold
                          text-justify
                          mx-auto
                          flex
                          items-center
                          justify-center
                        ">
                          {sub.place.restaurant.title}
                        </p>
                        <p className="
                          text-[14px]
                          leading-[18px]
                          font-['Open_Sans']
                          font-[600]
                          text-center
                          mt-1
                          -mb-4
                          text-[#7B7B7B]
                        ">
                          {sub.place.name}
                        </p>
                      </div>
                    </>
                  )}
                  
                  <div className="p-6">
                    <h2 className="
                      !text-[24px]
                      !leading-[32.68px]
                      !font-['Open_Sans']
                      !font-bold
                      !text-center
                      !mb-[2.5px]
                      !mx-auto
                      flex
                      items-center
                      justify-center
                    ">
                      {sub.subscription.name}
                    </h2>

                    <p className="
                      text-[20px]
                      leading-[24.2px]          
                      font-bold
                      text-center
                      mb-1
                    ">
                      {sub.amount}€/month
                    </p>
                    <p className="
                      text-[20px]
                      leading-[26px]
                      font-['Open_Sans']
                      font-semibold
                      text-center
                      text-[#7B7B7B]
                      mb-4
                    ">
                      Valid until: {formatDate(sub.nextPayment)}
                    </p>
                    
                    <h4 className="
                      text-[14px]
                      leading-[26px]
                      font-['Open_Sans']            
                      mb-1
                    ">
                      Purchase benefits:
                    </h4>
                    <p className="
                      text-[14px]
                      leading-[18px]
                      font-['Open_Sans']
                      font-[400]
                    ">
                      {sub.subscription.benefits}
                    </p>

                    <div className="mt-6 space-y-3">
                      <button 
                        onClick={() => {}}
                        className="
                          w-[329px]
                          h-[78px]
                          rounded-[100px]
                          bg-black 
                          text-white 
                          text-[18px] 
                          font-semibold 
                          leading-[22px] 
                          font-['Open_Sans']
                          flex 
                          items-center 
                          justify-center 
                          mx-auto
                          hover:bg-black/90 
                          transition-colors
                        "
                      >
                        Generate QR
                      </button>
                      <button 
                        onClick={() => {}}
                        className="
                          w-[329px]
                          h-[78px]
                          rounded-[100px]
                          bg-black 
                          text-white 
                          text-[18px] 
                          font-semibold 
                          leading-[22px] 
                          font-['Open_Sans']
                          flex 
                          items-center 
                          justify-center 
                          mx-auto
                          hover:bg-black/90 
                          transition-colors
                        "
                      >
                        Share info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CustomerProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          id,
          name: name || '',
          email: email || '',
          location: location || '',
          avatar: image || ''
        }}
      />
    </>
  )
}