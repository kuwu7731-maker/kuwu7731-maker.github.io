import NextAuth, { CredentialsSignin, type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { validatePassword } from './password-validator'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      role?: string
      identity?: string
      grade?: number
    }
  }
}

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string
        
        if (!email || !password) {
          throw new CredentialsSignin('请填写邮箱和密码')
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          throw new CredentialsSignin('邮箱或密码错误')
        }

        if (user.status !== 'active') {
          throw new CredentialsSignin('账号已被禁用')
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          throw new CredentialsSignin('邮箱或密码错误')
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
})

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