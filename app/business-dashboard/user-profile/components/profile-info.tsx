'use client'

import { useState, useRef } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { ClipLoader } from "react-spinners"
import { Breadcrumb } from '../../components/breadcrumb'
import Image from 'next/image'
import { useSession } from "next-auth/react"
import { Trash2 } from "lucide-react"

interface AccessPlace {
  name: string
  editAccess: string[]
  viewAccess?: string[]
}

interface ProfileInfoProps {
  name: string | null
  email: string | null
  image: string | null
  location: string | null
  accesses: AccessPlace[]
  places: string[]
}

export function ProfileInfo({
  name,
  email,
  image,
  location,
  accesses,
  places
}: ProfileInfoProps) {
  console.log('Places received:', places)
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
      toast({
        variant: "destructive",
        title: "Error",
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
      
      // Actualizar solo la imagen en la sesión
      await updateSession({
        image: data.image
      })

      toast({
        title: "Success",
        description: "Profile picture updated successfully"
      })

    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 lg:px-8">
      <div className="pl-4 md:pl-8">
        <div className="mb-8 mt-6">
          <Breadcrumb />
        </div>

        {/* Profile Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex gap-6">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
              <Avatar className="h-28 w-28">
                <AvatarImage src={previewImage || "/placeholder1.png"} alt={name || "User"} />
                <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <ClipLoader size={20} color="#FFFFFF" />
                  </div>
                )}
              </Avatar>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                  Change Photo
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">{name}</h1>
                <div className="flex items-center justify-center ml-8 mt-1">
                  <Image 
                    src="/edit.svg"
                    alt="Edit"
                    width={20}
                    height={20}
                    className="cursor-pointer hover:opacity-80"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p><span className="font-medium">Email: </span>{email}</p>
                {location && (
                  <p><span className="font-medium">Location: </span>{location}</p>
                )}
                {places.length > 0 && (
                  <p>
                    
                    {places.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Accesses Section */}
        <div>
          <h2 className="text-xl font-semibold mb-6">
            My Places ({places.length})
          </h2>
          <div className="space-y-4">
            {accesses.map((access, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-lg p-6"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {places.map((place, index) => (
                      <div
                        key={index}
                        className="
                          bg-[#F9F9F9]
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          text-black
                          flex
                          items-center
                          gap-2
                          -ml-4
                        "
                      >
                        <span className="font-semibold">{place}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-[16px]">Add/Edit</p>
                      <div className="flex gap-3">
                        <Image 
                          src="/edit.svg"
                          alt="Edit"
                          width={20}
                          height={20}
                          className="cursor-pointer hover:opacity-80"
                        />
                        <Trash2 className="w-5 h-5 text-black cursor-pointer hover:text-black/80" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-[16px]">{access.editAccess.join(', ')}</p>
                  </div>
                  
                  {access.viewAccess && (
                    <div>
                      <p className="font-bold mb-1 text-[16px]">View only</p>
                      <p className="text-gray-600 text-[16px]">{access.viewAccess.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}