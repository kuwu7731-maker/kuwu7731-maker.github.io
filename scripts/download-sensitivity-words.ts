import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

const GITEE_SENSITIVE_WORD_URLS = [
  'https://gitee.com/api/v5/repos/JK9021/SensitiveWordsFilter/contents/data/SensitiveWords.txt?ref=master',
  'https://gitee.com/api/v5/repos/observerss/textfilter/contents/data/badwords.txt?ref=master',
]

async function fetchFromGitee(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    if (!response.ok) {
      console.log(`Gitee请求失败: ${url}, 使用内置词库`)
      return []
    }
    const data = await response.json()
    if (data.content) {
      const decoded = Buffer.from(data.content, 'base64').toString('utf-8')
      return decoded.split('\n').map(w => w.trim()).filter(w => w.length >= 1)
    }
    return []
  } catch (error) {
    console.log(`Gitee请求异常: ${url}, 使用内置词库`)
    return []
  }
}

async function downloadSensitiveWords(): Promise<string[]> {
  const words: string[] = []
  
  const singleCharWords = [
    '操', '草', '日', '妈', '逼', '屌', '鸡', '巴', '屁', '屎',
    '尿', '粪', '奸', '淫', '毒', '赌', '嫖', '骗', '抢', '杀',
    '偷', '盗', '炸', '烧', '砍', '打', '骂', '淫', '秽', '裸',
    '性', '黄', '暴', '恐', '邪', '黑', '假', '骗', '诈', '贪',
    '腐', '贿', '毒', '枪', '弹', '刀', '凶', '邪', '恶', '坏',
  ]

  const twoCharWords = [
    '暴力', '色情', '赌博', '毒品', '自杀', '杀人', '抢劫', '诈骗',
    '违法', '违规', '邪教', '恐怖', '反动', '分裂', '台独', '藏独',
    '卖淫', '嫖娼', '强奸', '乱伦', '兽交', '恋童', '血腥', '自残',
    '斗殴', '绑架', '勒索', '纵火', '爆炸', '贪污', '腐败', '受贿',
    '洗钱', '走私', '贩毒', '吸毒', '黑客', '攻击', '入侵', '病毒',
    '木马', '钓鱼', '造谣', '谣言', '诽谤', '煽动', '仇恨', '歧视',
    '偏见', '淫秽', '露骨', '挑逗', '博彩', '彩票', '赌球', '赌马',
    '枪支', '弹药', '管制', '武器', '凶器', '辱骂', '脏话', '粗口',
    '威胁', '人肉', '隐私', '广告', '推广', '营销', '引流', '刷单',
    '返利', '欺诈', '虚假', '骗局', '传销', '颠覆', '圣战', '霸凌',
    '欺凌', '自虐', '轻生', '绝望', '抑郁', '裸聊', '裸奔', '偷拍',
    '偷窥', '骚扰', '侮辱', '殴打', '恐吓', '敲诈', '勒索', '盗窃',
  ]

  const multiCharWords = [
    '法轮功', '六合彩', '冰毒', '海洛因', '摇头丸', '色情网站',
    '成人网站', '黄色网站', '赌博网站', '毒品交易', '色情图片',
    '色情视频', '成人影片', '色情小说', '政治敏感', '敏感事件',
    '敏感人物', '敏感话题', '侮辱性', '攻击性', '威胁性',
    '人肉搜索', '隐私泄露', '个人信息', '身份证', '手机号',
    '钓鱼网站', '虚假信息', '非法集资', '反动言论', '煽动颠覆',
    '危害国家安全', '极端主义', '恐怖主义', 'ISIS', '基地组织',
    '种族歧视', '性别歧视', '地域歧视', '年龄歧视', '残障歧视',
    '校园霸凌', '校园暴力', '自杀倾向', '暴力游戏', '血腥游戏',
    '恐怖游戏', '杀人游戏', '暴力电影', '血腥电影', '恐怖电影',
  ]

  const pinyinWords = [
    'baoli', 'seqing', 'dubo', 'dupin', 'zisha', 'sharen', 'qiangjie',
    'zhapian', 'weifa', 'weigui', 'xiejiao', 'kongbu', 'fandong',
    'fenlie', 'taiwan', 'cangdu', 'falungong', 'maiyin', 'piaochang',
    'qiangjian', 'luanlun', 'shoujiao', 'liantong', 'xuexing', 'zican',
    'douou', 'bangjia', 'lesuo', 'zonghuo', 'baozha', 'tanwu', 'fubai',
    'shouhui', 'xiqian', 'zousi', 'fan du', 'xidu', 'heike', 'gongji',
    'ruqin', 'bingdu', 'muma', 'diaoyu', 'zaoyao', 'feibang', 'sandong',
    'chouhen', 'qishi', 'pianjian', 'yin hui', 'lugut', 'tiaodou',
    'bocai', 'caipiao', 'duqiu', 'gupiao', 'qiangzhi', 'wuqi', 'xiongqi',
    'ruma', 'zanghua', 'cukou', 'weixie', 'renrou', 'yinsi', 'guanggao',
    'tuiguang', 'yingxiao', 'yinliu', 'shuadan', 'fanli', 'qiya', 'xuji',
    'pianju', 'chuanxiao', 'dianfu', 'shengzhan', 'lingling', 'qingpie',
    'ziwen', 'qingsheng', 'juewang', 'yiyu', 'luoliao', 'luoben', 'toupai',
    'toukou', 'saorao', 'wuru', 'ouchong', 'kongxia', 'qiaozha', 'daoqie',
  ]

  const baseWords = [...singleCharWords, ...twoCharWords, ...multiCharWords, ...pinyinWords]

  words.push(...baseWords)
  
  for (const url of GITEE_SENSITIVE_WORD_URLS) {
    const giteeWords = await fetchFromGitee(url)
    if (giteeWords.length > 0) {
      words.push(...giteeWords)
      console.log(`从Gitee获取到 ${giteeWords.length} 个敏感词`)
    }
  }
  
  words.push(...CAMPUS_BULLYING_WORDS)

  return [...new Set(words)]
}

function cleanWords(words: string[]): string[] {
  const falsePositiveSet = new Set(FALSE_POSITIVE_WORDS.map(w => w.toLowerCase()))
  
  return words.filter(word => {
    const lowerWord = word.toLowerCase().trim()
    if (!lowerWord || lowerWord.length < 1) return false
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