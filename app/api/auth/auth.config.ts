import { AuthOptions, User, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// Extendemos los tipos base de NextAuth
declare module "next-auth" {
  interface User {
    id: string
    role?: 'BUSINESS' | 'ADMIN' | 'STAFF' | 'CUSTOMER' | null
    location?: string | null
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      role?: 'BUSINESS' | 'ADMIN' | 'STAFF' | 'CUSTOMER' | null
      location?: string | null
      ownerId?: string | null
    } & DefaultSession["user"]
  }
}

interface UserWithPassword extends User {
  password?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            role: true,
            location: true
          }
        }) as UserWithPassword | null

        if (!user || !user.password) {
          return null
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          location: user.location
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log('🔑 JWT Callback - Starting with trigger:', trigger)
      console.log('📄 Current token:', token)
      console.log('👤 User data:', user)

      try {
        // Verificar que tenemos un email
        if (!token.email) {
          console.log('❌ No email found in token')
          return token
        }

        // Ahora TypeScript sabe que token.email es string
        const freshUser = await prisma.user.findUnique({
          where: { 
            email: token.email 
          },
          select: {
            id: true,
            role: true,
            location: true,
            email: true,
            name: true,
            image: true
          }
        })
        
        console.log('📝 Fresh user data:', freshUser)

        if (freshUser) {
          token.sub = freshUser.id
          token.role = freshUser.role
          token.location = freshUser.location
          token.email = freshUser.email
          token.name = freshUser.name
          token.picture = freshUser.image
        }

        return token
      } catch (error) {
        console.error('Error in JWT callback:', error)
        return token
      }
    },

    async session({ session, token }) {
      console.log('🔄 Session Callback - Starting')
      console.log('📄 Current token:', token)
      console.log('🎫 Current session:', session)

      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as 'BUSINESS' | 'ADMIN' | 'STAFF' | 'CUSTOMER' | null
        session.user.location = token.location as string | null
        session.user.image = token.picture as string | null
      }

      console.log('✅ Updated session:', session)
      return session
    },

    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect Callback:', { url, baseUrl })
      
      // Si es una URL de autenticación, permitir la redirección
      if (url.startsWith('/auth/')) {
        console.log('📍 Redirecting to auth path:', url)
        return url
      }
      
      // Si es una URL interna válida, permitirla
      if (url.startsWith(baseUrl)) {
        console.log('📍 Redirecting to internal path:', url)
        return url
      }
      
      // Por defecto, redirigir a la página de location
      console.log('📍 Default redirect to location')
      return `${baseUrl}/auth/location`
    },

    async signIn({ user, account }) {
      if (account && (account.provider === "google" || account.provider === "facebook")) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          // Crear o actualizar usuario
          const dbUser = existingUser || await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              image: user.image || null,
              emailVerified: new Date()
            }
          });

          // Crear o actualizar la cuenta del proveedor
          if (account.provider) {
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                }
              },
              update: {
                access_token: account.access_token,
                expires_at: account.expires_at,
                refresh_token: account.refresh_token,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state
              },
              create: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                refresh_token: account.refresh_token,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state
              }
            });
          }
        } catch (error) {
          console.error("❌ Error in OAuth sign in:", error);
          return false;
        }
      }
      return true;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 días
  },
  pages: {
    signIn: '/auth?mode=signin',
    error: '/auth?mode=signin',
    newUser: '/auth?mode=signup'
  }
}