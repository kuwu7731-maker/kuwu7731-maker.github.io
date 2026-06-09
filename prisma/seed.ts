import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.grade.createMany({
    data: [
      { id: 7, name: '七年级 · 启航', description: '新生适应、学习方法、社团招新' },
      { id: 8, name: '八年级 · 深耕', description: '学科答疑、竞赛交流、心理健康' },
      { id: 9, name: '九年级 · 冲刺', description: '中考资料、志愿填报、学长学姐经验分享' },
    ],
    skipDuplicates: true,
  })

  await prisma.sensitiveWord.createMany({
    data: [
      { word: '暴力', type: 'banned' },
      { word: '色情', type: 'banned' },
      { word: '赌博', type: 'banned' },
      { word: '毒品', type: 'banned' },
      { word: '自杀', type: 'banned' },
      { word: '杀人', type: 'banned' },
      { word: '抢劫', type: 'banned' },
      { word: '诈骗', type: 'banned' },
      { word: '违法', type: 'suspect' },
      { word: '违规', type: 'suspect' },
    ],
    skipDuplicates: true,
  })
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