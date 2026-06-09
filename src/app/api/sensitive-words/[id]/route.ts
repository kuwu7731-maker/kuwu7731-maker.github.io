import { NextRequest, NextResponse } from 'next/server'
import { sensitiveWordService } from '@/lib/sensitive-word'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { word, type, isRegex } = await request.json()
    const { id } = params

    if (!word) {
      return NextResponse.json({ error: '敏感词不能为空' }, { status: 400 })
    }

    const updated = await sensitiveWordService.updateWord(id, {
      word,
      type: type as 'banned' | 'suspect',
      isRegex: isRegex || false,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await sensitiveWordService.removeWord(id)
    return NextResponse.json({ message: '删除成功' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}