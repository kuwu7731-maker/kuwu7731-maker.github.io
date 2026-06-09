import { NextRequest, NextResponse } from 'next/server'
import { sensitiveWordService } from '@/lib/sensitive-word'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }

    const result = sensitiveWordService.validate(content)

    return NextResponse.json({
      hasBanned: result.hasBanned,
      hasSuspect: result.hasSuspect,
      matches: result.matches,
    })
  } catch (error) {
    return NextResponse.json({ error: '验证失败' }, { status: 500 })
  }
}