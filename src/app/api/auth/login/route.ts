import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: '请填写邮箱和密码' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: '邮箱或密码错误' }, { status: 401 })
    }

    if (user.status !== 'active') {
      return NextResponse.json({ message: '账号已被禁用' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ message: '邮箱或密码错误' }, { status: 401 })
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        identity: user.identity,
        role: user.role,
        grade: user.grade,
      },
    })
  } catch (error) {
    return NextResponse.json({ message: '服务器错误' }, { status: 500 })
  }
}
