import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/auth.config"
import { Prisma } from "@prisma/client"

// Add GET method to fetch available locations
export async function GET() {
  try {
    const locations = [
      "Madrid",
      "Barcelona",
      "Valencia",
      "Sevilla",
      "Zaragoza",
      "Málaga",
      "Murcia",
      "Palma",
      "Las Palmas",
      "Bilbao",
      "Alicante",
      "Córdoba",
      "Valladolid",
      "Vigo",
      "Gijón",
      "Hospitalet"
    ]
    
    return NextResponse.json(locations)
  } catch (error) {
    console.error("Error fetching locations:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name, email, city } = await req.json()

    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        name,
        email,
        location: city,
      } as Prisma.UserUpdateInput,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { location } = await req.json()

    // Actualizar usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        location,
      } as Prisma.UserUpdateInput,
    })

    // Forzar actualización de la sesión
    await prisma.session.updateMany({
      where: {
        userId: updatedUser.id
      },
      data: {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      }
    })

    // Crear una nueva sesión con los datos actualizados
    const sessionToken = `${updatedUser.id}_${Date.now()}`
    await prisma.session.create({
      data: {
        sessionToken: sessionToken,
        userId: updatedUser.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({
      ...updatedUser,
      sessionToken // Devolver el nuevo token para actualizar la sesión del cliente
    })
  } catch (error) {
    console.error("Error updating location:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}