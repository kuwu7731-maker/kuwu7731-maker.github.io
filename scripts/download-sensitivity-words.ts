import fs from 'fs'
import path from 'path'

const FALSE_POSITIVE_WORDS = [
  '同志', '激情', '小姐', '菊花', '黄瓜', '木耳', '鲍鱼', '百合', '攻', '受',
  '小学生', '中学生', '大学生', '老师', '校长', '班主任', '教导主任',
  '学习', '作业', '考试', '成绩', '分数', '课程', '课堂', '教室',
  '学校', '校园', '操场', '图书馆', '食堂', '宿舍', '体育馆',
  '运动会', '艺术节', '科技节', '校庆', '毕业典礼', '开学典礼',
  '少先队', '共青团', '学生会', '班干部', '班长', '团支书',
  '补课', '补习', '培训', '辅导班', '兴趣班', '特长班',
  '早恋', '暗恋', '表白', '情书', '约会', '牵手',
  '游戏', '电竞', '网游', '手游', '竞技', '比赛',
  '聊天', '交友', '社交', '聚会', '活动', '社团',
  '心理健康', '心理咨询', '心理辅导', '情绪', '压力', '焦虑',
  '成长', '青春期', '叛逆', '早恋', '追星', '偶像',
]

const CAMPUS_BULLYING_WORDS = [
  '欺负', '霸凌', '殴打', '辱骂', '侮辱', '嘲笑', '排挤',
  '孤立', '威胁', '恐吓', '敲诈', '勒索', '殴打',
  '校园暴力', '校园欺凌', '霸凌者', '受害者', '施暴',
]

async function downloadSensitiveWords(): Promise<string[]> {
  const words: string[] = []
  
  const baseWords = [
    '暴力', '色情', '赌博', '毒品', '自杀', '杀人', '抢劫', '诈骗',
    '违法', '违规', '邪教', '恐怖', '反动', '分裂', '台独', '藏独',
    '法轮功', '卖淫', '嫖娼', '强奸', '乱伦', '兽交', '恋童',
    '血腥', '自残', '斗殴', '绑架', '勒索', '纵火', '爆炸',
    '贪污', '腐败', '受贿', '洗钱', '走私', '贩毒', '吸毒',
    '黑客', '攻击', '入侵', '病毒', '木马', '钓鱼', '诈骗',
    '谣言', '诽谤', '造谣', '煽动', '仇恨', '歧视', '偏见',
    '色情网站', '成人网站', '黄色网站', '淫秽', '露骨', '挑逗',
    '赌博网站', '博彩', '彩票', '赌球', '赌马', '六合彩',
    '毒品交易', '冰毒', '海洛因', '大麻', '摇头丸', '鸦片',
    '枪支', '弹药', '管制刀具', '武器', '凶器',
    '色情图片', '色情视频', '成人影片', 'AV', '色情小说',
    '政治敏感', '敏感事件', '敏感人物', '敏感话题',
    '辱骂', '脏话', '粗口', '侮辱性', '攻击性', '威胁性',
    '人肉搜索', '隐私泄露', '个人信息', '身份证', '手机号',
    '广告', '推广', '营销', '引流', '刷单', '返利',
    '钓鱼网站', '欺诈', '虚假信息', '骗局', '传销', '非法集资',
    '反动言论', '颠覆', '煽动颠覆', '危害国家安全',
    '极端主义', '恐怖主义', '圣战', 'ISIS', '基地组织',
    '种族歧视', '性别歧视', '地域歧视', '年龄歧视', '残障歧视',
    '校园霸凌', '校园暴力', '欺凌', '殴打', '辱骂', '排挤',
    '自杀倾向', '自残', '自虐', '轻生', '绝望', '抑郁',
    '暴力游戏', '血腥游戏', '恐怖游戏', '杀人游戏',
    '暴力电影', '血腥电影', '恐怖电影', '色情电影',
  ]

  const pinyinVariants: Record<string, string[]> = {
    'baoli': ['暴力'],
    'seqing': ['色情'],
    'dubo': ['赌博'],
    'dupin': ['毒品'],
    'zisha': ['自杀'],
    'sharen': ['杀人'],
    'qiangjie': ['抢劫'],
    'zhapian': ['诈骗'],
    'weifa': ['违法'],
    'weigui': ['违规'],
    'xiejiao': ['邪教'],
    'kongbu': ['恐怖'],
    'fandong': ['反动'],
  }

  words.push(...baseWords)
  
  for (const pinyin of Object.keys(pinyinVariants)) {
    words.push(pinyin)
  }
  
  words.push(...CAMPUS_BULLYING_WORDS)

  return words
}

function cleanWords(words: string[]): string[] {
  const falsePositiveSet = new Set(FALSE_POSITIVE_WORDS.map(w => w.toLowerCase()))
  
  return words.filter(word => {
    const lowerWord = word.toLowerCase().trim()
    if (!lowerWord || lowerWord.length < 2) return false
    if (falsePositiveSet.has(lowerWord)) return false
    if (lowerWord.includes('test') || lowerWord.includes('example')) return false
    return true
  })
}

async function main() {
  console.log('开始下载敏感词...')
  const rawWords = await downloadSensitiveWords()
  console.log(`原始词库: ${rawWords.length} 条`)
  
  console.log('开始清洗词库...')
  const cleanedWords = cleanWords(rawWords)
  console.log(`清洗后词库: ${cleanedWords.length} 条`)
  
  const outputDir = path.join(__dirname, '../data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const outputPath = path.join(outputDir, 'clean-base-words.txt')
  fs.writeFileSync(outputPath, cleanedWords.join('\n'), 'utf-8')
  
  console.log(`词库已保存到: ${outputPath}`)
}

main().catch(console.error)