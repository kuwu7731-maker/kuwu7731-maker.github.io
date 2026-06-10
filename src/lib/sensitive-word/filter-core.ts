export interface TrieNode {
  children: Map<string, TrieNode>
  isEnd: boolean
  word?: string
}

export interface FilterResult {
  isBlocked: boolean
  isWarning: boolean
  blockedWords: string[]
  warningWords: string[]
  message: string
}

export class FilterCore {
  private blockRoot: TrieNode = { children: new Map(), isEnd: false }
  private warnRoot: TrieNode = { children: new Map(), isEnd: false }

  constructor(blockWords: string[], warnWords: string[]) {
    this.buildTrie(blockWords, this.blockRoot)
    this.buildTrie(warnWords, this.warnRoot)
  }

  private buildTrie(words: string[], root: TrieNode) {
    for (const word of words) {
      if (!word.trim()) continue
      let node = root
      for (const char of word) {
        if (!node.children.has(char)) {
          node.children.set(char, { children: new Map(), isEnd: false })
        }
        node = node.children.get(char)!
      }
      node.isEnd = true
      node.word = word
    }
  }

  private dfaMatch(text: string, root: TrieNode): string[] {
    const matches: string[] = []
    const len = text.length

    for (let i = 0; i < len; i++) {
      let node = root
      let j = i

      while (j < len && node.children.has(text[j])) {
        node = node.children.get(text[j])!
        j++

        if (node.isEnd && node.word) {
          if (!matches.includes(node.word)) {
            matches.push(node.word)
          }
        }
      }
    }

    return matches
  }

  filter(text: string): FilterResult {
    const blockMatches = this.dfaMatch(text, this.blockRoot)
    const warnMatches = this.dfaMatch(text, this.warnRoot)

    if (blockMatches.length > 0) {
      return {
        isBlocked: true,
        isWarning: false,
        blockedWords: blockMatches,
        warningWords: [],
        message: `内容包含违规词：${blockMatches.join(', ')}`,
      }
    }

    if (warnMatches.length > 0) {
      return {
        isBlocked: false,
        isWarning: true,
        blockedWords: [],
        warningWords: warnMatches,
        message: `内容包含需要注意的词语：${warnMatches.join(', ')}，请注意发言规范`,
      }
    }

    return {
      isBlocked: false,
      isWarning: false,
      blockedWords: [],
      warningWords: [],
      message: '内容合规',
    }
  }
}

export function getDefaultBlockWords(): string[] {
  const singleChar = [
    '操', '草', '日', '妈', '逼', '屌', '屁', '屎',
    '尿', '粪', '奸', '淫', '毒', '赌', '嫖', '骗',
    '抢', '杀', '偷', '盗', '炸', '烧', '砍', '打',
    '骂', '秽', '裸', '暴', '恐', '邪', '黑', '诈',
    '贪', '腐', '贿', '枪', '弹', '刀', '凶',
  ]

  const twoChar = [
    '暴力', '色情', '赌博', '毒品', '自杀', '杀人', '抢劫', '诈骗',
    '违法', '违规', '邪教', '恐怖', '反动', '分裂', '台独', '藏独',
    '卖淫', '嫖娼', '强奸', '乱伦', '兽交', '恋童', '血腥', '自残',
    '斗殴', '绑架', '勒索', '纵火', '爆炸', '贪污', '腐败', '受贿',
    '洗钱', '走私', '贩毒', '吸毒', '黑客', '攻击', '入侵', '病毒',
    '木马', '钓鱼', '造谣', '谣言', '诽谤', '煽动', '仇恨', '歧视',
    '淫秽', '露骨', '挑逗', '博彩', '枪支', '弹药', '管制', '武器',
    '凶器', '辱骂', '脏话', '粗口', '威胁', '人肉', '隐私', '广告',
    '推广', '营销', '引流', '刷单', '返利', '欺诈', '虚假', '骗局',
    '传销', '颠覆', '圣战', '霸凌', '欺凌', '偷拍', '偷窥', '骚扰',
    '侮辱', '殴打', '恐吓', '敲诈', '勒索', '盗窃',
  ]

  const multiChar = [
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

  const pinyin = [
    'baoli', 'seqing', 'dubo', 'dupin', 'zisha', 'sharen', 'qiangjie',
    'zhapian', 'weifa', 'weigui', 'xiejiao', 'kongbu', 'fandong',
    'fenlie', 'taiwan', 'cangdu', 'falungong', 'maiyin', 'piaochang',
    'qiangjian', 'luanlun', 'shoujiao', 'liantong', 'xuexing', 'zican',
    'douou', 'bangjia', 'lesuo', 'zonghuo', 'baozha', 'tanwu', 'fubai',
    'shouhui', 'xiqian', 'zousi', 'xidu', 'heike', 'gongji', 'ruqin',
    'bingdu', 'muma', 'diaoyu', 'zaoyao', 'feibang', 'sandong',
    'chouhen', 'qishi', 'pianjian', 'lugut', 'tiaodou', 'bocai',
    'caipiao', 'duqiu', 'gupiao', 'qiangzhi', 'wuqi', 'xiongqi',
    'ruma', 'zanghua', 'cukou', 'weixie', 'renrou', 'yinsi', 'guanggao',
    'tuiguang', 'yingxiao', 'yinliu', 'shuadan', 'fanli', 'qiya',
    'xuji', 'pianju', 'chuanxiao', 'dianfu', 'shengzhan', 'qingpie',
    'ziwen', 'qingsheng', 'juewang', 'yiyu', 'luoliao', 'luoben',
    'toupai', 'toukou', 'saorao', 'wuru', 'ouchong', 'kongxia',
    'qiaozha', 'daoqie',
  ]

  return [...singleChar, ...twoChar, ...multiChar, ...pinyin]
}

export function getDefaultWarnWords(): string[] {
  return [
    '老师', '校长', '班主任', '教导主任', '学生', '同学', '早恋',
    '暗恋', '表白', '情书', '约会', '牵手', '恋爱', '男女朋友',
    '分手', '失恋', '追星', '偶像', '游戏', '电竞', '网游', '手游',
    '竞技', '比赛', '聊天', '交友', '社交', '聚会', '活动', '社团',
    '心理健康', '心理咨询', '心理辅导', '情绪', '压力', '焦虑', '抑郁',
    '成长', '青春期', '叛逆', '补课', '补习', '培训', '辅导班',
    '兴趣班', '特长班', '作业', '考试', '成绩', '分数', '课程',
    '课堂', '教室', '学校', '校园', '操场', '图书馆', '食堂', '宿舍',
    '体育馆', '运动会', '艺术节', '科技节', '校庆', '毕业典礼', '开学典礼',
    '少先队', '共青团', '学生会', '班干部', '班长', '团支书',
    '学习', '复习', '预习', '作业', '考试', '测验', '考试', '作业',
    '成绩', '分数', '排名', '升学', '中考', '高考', '复习资料', '参考书',
  ]
}