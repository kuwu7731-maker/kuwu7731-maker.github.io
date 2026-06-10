import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

  const users = [
    { email: 'student1@shool.edu', password: '123456', name: '小明', role: 'student', identity: '学生', grade: 7 },
    { email: 'student2@shool.edu', password: '123456', name: '学霸君', role: 'student', identity: '学生', grade: 8 },
    { email: 'teacher1@shool.edu', password: '123456', name: '王老师', role: 'teacher', identity: '教师', grade: 9 },
    { email: 'student3@shool.edu', password: '123456', name: '学生会', role: 'student', identity: '学生', grade: 7 },
    { email: 'student4@shool.edu', password: '123456', name: '班长', role: 'student', identity: '学生', grade: 8 },
  ]

  for (const user of users) {
    const existing = await prisma.user.findFirst({ where: { email: user.email } })
    const hashedPassword = await bcrypt.hash(user.password, 10)
    if (!existing) {
      await prisma.user.create({ data: { ...user, password: hashedPassword } })
    } else {
      await prisma.user.update({ 
        where: { email: user.email }, 
        data: { password: hashedPassword } 
      })
    }
  }

  const student1 = await prisma.user.findFirst({ where: { email: 'student1@shool.edu' } })
  const student2 = await prisma.user.findFirst({ where: { email: 'student2@shool.edu' } })
  const teacher1 = await prisma.user.findFirst({ where: { email: 'teacher1@shool.edu' } })
  const student3 = await prisma.user.findFirst({ where: { email: 'student3@shool.edu' } })
  const student4 = await prisma.user.findFirst({ where: { email: 'student4@shool.edu' } })

  if (student1 && student2 && teacher1 && student3 && student4) {
    const posts = [
      { title: '七年级数学学习方法分享', content: '各位同学好，我想分享一下我学习数学的一些心得。首先，课前预习非常重要，可以帮助我们提前了解课堂内容。其次，课后一定要及时复习，巩固当天学的知识。最后，多做练习题，熟能生巧。希望这些方法对大家有帮助！', gradeId: 7, userId: student1.id, isTop: true, status: 'approved' },
      { title: '新学期社团招新啦！', content: '新学期开始了，学生会各部门开始招新啦！欢迎七年级的新同学加入我们。我们有文艺部、体育部、学习部等多个部门，总有一个适合你。具体招新时间和地点请关注公告栏。', gradeId: 7, userId: student3.id, isTop: false, status: 'approved' },
      { title: '如何快速适应初中生活', content: '作为刚升入初中的同学，可能会感到有些不适应。其实初中生活并没有想象中那么难，只要调整好心态，积极面对，很快就能适应。建议大家多和同学交流，遇到问题及时向老师请教。', gradeId: 7, userId: teacher1.id, isTop: true, status: 'approved' },
      { title: '八年级物理竞赛经验', content: '去年我参加了物理竞赛，取得了不错的成绩。想和大家分享一些经验：首先要夯实基础，把课本知识学扎实；其次要多做真题，了解竞赛的题型和难度；最后要有耐心和毅力，坚持每天练习。', gradeId: 8, userId: student2.id, isTop: true, status: 'approved' },
      { title: '英语单词记忆技巧', content: '背单词是英语学习的基础，分享几个记忆技巧：1. 利用碎片时间记单词；2. 结合句子记忆，不要孤立地记；3. 定期复习，遗忘曲线很重要；4. 可以使用一些记忆工具辅助。希望大家都能轻松记单词！', gradeId: 8, userId: student2.id, isTop: false, status: 'approved' },
      { title: '周末作业讨论群', content: '建了一个周末作业讨论群，大家有不会的题目可以在群里讨论。但是请记住，讨论不等于抄袭，要独立思考后再讨论。群号：123456789，欢迎大家加入！', gradeId: 8, userId: student4.id, isTop: false, status: 'approved' },
      { title: '中考志愿填报指南2024', content: '中考志愿填报是非常重要的一步，大家一定要认真对待。首先要了解各个高中的录取分数线和招生政策，其次要根据自己的成绩合理定位，最后要注意志愿的梯度设置。希望大家都能考上理想的高中！', gradeId: 9, userId: teacher1.id, isTop: true, status: 'approved' },
      { title: '中考复习计划分享', content: '距离中考还有不到一年的时间，制定一个合理的复习计划非常重要。建议大家按科目制定计划，每天安排好时间。同时也要注意劳逸结合，保持良好的心态。加油，同学们！', gradeId: 9, userId: student1.id, isTop: false, status: 'approved' },
      { title: '心理健康讲座回顾', content: '上周学校举办了心理健康讲座，专家给我们讲了很多关于压力管理和情绪调节的方法。印象最深的是深呼吸放松法，当感到紧张时，可以试试深呼吸，确实很有效果。希望学校能多举办这样的活动。', gradeId: 8, userId: student4.id, isTop: false, status: 'approved' },
    ]

    for (const post of posts) {
      const existing = await prisma.post.findFirst({ where: { title: post.title } })
      if (!existing) {
        await prisma.post.create({ data: post })
      }
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
