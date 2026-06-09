import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  for (const grade of [
    { id: 7, name: '七年级 · 启航', description: '新生适应、学习方法、社团招新' },
    { id: 8, name: '八年级 · 深耕', description: '学科答疑、竞赛交流、心理健康' },
    { id: 9, name: '九年级 · 冲刺', description: '中考资料、志愿填报、学长学姐经验分享' },
  ]) {
    await prisma.grade.upsert({
      where: { id: grade.id },
      update: grade,
      create: grade,
    })
  }

  const words = [
    '暴力', '色情', '赌博', '毒品', '自杀', '杀人', '抢劫', '诈骗',
  ]
  
  for (const word of words) {
    const existing = await prisma.sensitiveWord.findFirst({ where: { word } })
    if (!existing) {
      await prisma.sensitiveWord.create({ data: { word, type: 'banned' } })
    }
  }
  
  const suspectWords = ['违法', '违规']
  for (const word of suspectWords) {
    const existing = await prisma.sensitiveWord.findFirst({ where: { word } })
    if (!existing) {
      await prisma.sensitiveWord.create({ data: { word, type: 'suspect' } })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
