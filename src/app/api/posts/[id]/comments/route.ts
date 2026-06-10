import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { freeContentFilter } from '@/lib/sensitive-word/free-content-filter'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { content, token } = await request.json()

    if (!content || !token) {
      return NextResponse.json({ code: 400, msg: '参数不全' }, { status: 400 })
    }

    // 验证用户
    const user = await prisma.user.findFirst({
      where: { id: token },
    })

    if (!user) {
      return NextResponse.json({ code: 401, msg: '请先登录' }, { status: 401 })
    }

    // 敏感词过滤
    const filterResult = freeContentFilter.filter(content)
    if (filterResult.isBlocked) {
      return NextResponse.json(
        { code: 403, msg: filterResult.message, words: filterResult.blockedWords },
        { status: 403 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        userId: user.id,
        content,
        status: 'approved',
      },
      include: { user: { select: { id: true, name: true, identity: true } } },
    })

    if (filterResult.isWarning) {
      return NextResponse.json({ code: 200, msg: filterResult.message, comment, warning: true })
    }

    return NextResponse.json({ code: 200, msg: '评论成功', comment })
  } catch (error) {
    return NextResponse.json({ error: '评论失败' }, { status: 500 })
  }
}
