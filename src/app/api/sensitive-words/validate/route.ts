import { NextRequest, NextResponse } from 'next/server'
import { freeContentFilter } from '@/lib/sensitive-word/free-content-filter'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
    }

    const result = freeContentFilter.filter(content)

    return new NextResponse(JSON.stringify({
      isBlocked: result.isBlocked,
      isWarning: result.isWarning,
      blockedWords: result.blockedWords,
      warningWords: result.warningWords,
      message: result.message,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: '验证失败' }, { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
}