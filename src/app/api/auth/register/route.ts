import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function validatePassword(password: string) {
  const errors: string[] = []
  if (password.length < 8) errors.push('密码至少8位')
  if (!/[a-zA-Z]/.test(password)) errors.push('密码需包含字母')
  if (!/[0-9]/.test(password)) errors.push('密码需包含数字')
  return { valid: errors.length === 0, errors }
}

function validateEmailDomain(email: string): boolean {
  const allowedDomains = ['gmail.com', 'qq.com', '163.com', '139.com', 'outlook.com', 'yeah.net', 'sina.com', 'hotmail.com']
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  if (allowedDomains.includes(domain)) return true
  if (domain.endsWith('.edu.cn')) return true
  return false
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, identity, grade } = await request.json()

    if (!email || !password || !name || !identity) {
      return NextResponse.json({ message: '请填写所有必填项' }, { status: 400 })
    }

    if (!validateEmailDomain(email)) {
      return NextResponse.json({ message: '邮箱域名不允许注册' }, { status: 400 })
    }

    const { valid, errors } = validatePassword(password)
    if (!valid) {
      return NextResponse.json({ message: '密码验证失败', errors }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: '该邮箱已被注册' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const role = identity === 'teacher' ? 'teacher' : 'student'

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        identity,
        role,
        grade,
        status: 'active',
      },
    })

    return NextResponse.json({
      success: true,
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
