import { NextRequest, NextResponse } from 'next/server'
import { sensitiveWordService } from '@/lib/sensitive-word'

export async function GET() {
  try {
    const words = await sensitiveWordService.getAllWords()
    return NextResponse.json(words)
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { word, type, isRegex } = await request.json()

    if (!word) {
      return NextResponse.json({ error: '敏感词不能为空' }, { status: 400 })
    }

    const created = await sensitiveWordService.addWord(word, type as 'banned' | 'suspect', isRegex || false)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '添加失败' }, { status: 500 })
  }
}