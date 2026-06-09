import NextAuth, { AuthOptions, Session } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    identity?: string
    grade?: number
  }

  interface Session {
    user: {
      id?: string
      role?: string
      identity?: string
      grade?: number
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { validatePassword } from './password-validator'

const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        if (user.status !== 'active') {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          identity: user.identity,
          grade: user.grade ?? undefined,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.identity = (user as any).identity
        token.grade = (user as any).grade
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        role: token.role as string,
        identity: token.identity as string,
        grade: token.grade as number | undefined,
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

export async function registerUser(data: {
  email: string
  password: string
  name: string
  identity: 'student' | 'teacher'
  grade?: number
}) {
  const { valid, errors } = validatePassword(data.password)
  if (!valid) {
    return { success: false, errors }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    return { success: false, errors: ['该邮箱已被注册'] }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const role = data.identity === 'teacher' ? 'teacher' : 'student'

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      identity: data.identity,
      role,
      grade: data.grade,
      status: 'active',
    },
  })

  return { success: true, user }
}