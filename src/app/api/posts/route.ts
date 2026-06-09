import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { freeContentFilter } from '@/lib/sensitive-word/free-content-filter'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gradeId = searchParams.get('gradeId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = { status: 'approved' }
    if (gradeId) {
      where.gradeId = parseInt(gradeId)
    }

    const posts = await prisma.post.findMany({
      where,
      include: { user: { select: { name: true, identity: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.post.count({ where })

    return NextResponse.json({ posts, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, gradeId, userId } = await request.json()

    if (!title || !content || !gradeId || !userId) {
      return NextResponse.json(
        { code: 400, msg: '参数不全' },
        { status: 400 }
      )
    }

    const filterResult = freeContentFilter.filter(title + ' ' + content)

    if (filterResult.isBlocked) {
      await prisma.sensitiveWordLog.create({
        data: {
          wordId: 'filter-block',
          content: title.substring(0, 200),
          userId,
          action: 'reject',
        },
      })

      return NextResponse.json(
        {
          code: 403,
          msg: '内容包含违规词',
          words: filterResult.matchedWords,
        },
        { status: 403 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        gradeId,
        userId,
        status: 'approved',
      },
      include: { user: { select: { name: true } } },
    })

    return NextResponse.json(
      { code: 200, msg: '发布成功', post },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: '发布失败' }, { status: 500 })
  }
}