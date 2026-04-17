import NextAuth, { type Session } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { JWT } from 'next-auth/jwt'
import type { Account, Profile, User } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id?: string
  }
  interface Session {
    user: User & { id: string }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    email?: string | null
  }
}

// Parse admin emails from environment variable
// Format: "email1@example.com,email2@example.com"
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((email: string) => email.trim().toLowerCase())
  : ['richard.ramdial@gmail.com'] // Fallback to original default

const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }): Promise<boolean> {
      // Check if email is in admin list
      if (!isAdminEmail(user.email)) {
        return false
      }
      return true
    },
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }): Promise<JWT> {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
