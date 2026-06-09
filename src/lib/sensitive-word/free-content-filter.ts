import fs from 'fs'
import path from 'path'

export interface TrieNode {
  children: Map<string, TrieNode>
  isEnd: boolean
  word?: string
}

export interface FilterResult {
  isBlocked: boolean
  matchedWords: string[]
  message: string
}

export class FreeContentFilter {
  private root: TrieNode = { children: new Map(), isEnd: false }
  private pinyinMap: Record<string, string[]> = {}
  private zeroWidthChars = ['\u200B', '\u200C', '\u200D', '\uFEFF', '\u2060', '\u180E']

  constructor() {
    this.loadWords()
  }

  private loadWords() {
    try {
      const wordsPath = path.join(process.cwd(), 'data', 'clean-base-words.txt')
      if (fs.existsSync(wordsPath)) {
        const content = fs.readFileSync(wordsPath, 'utf-8')
        const words = content.split('\n').map(w => w.trim()).filter(w => w.length >= 2)
        this.buildTrie(words)
        this.buildPinyinMap(words)
        console.log(`[FreeContentFilter] 加载了 ${words.length} 个敏感词`)
      } else {
        console.log('[FreeContentFilter] 词库文件不存在，使用默认词库')
        this.buildTrie(this.getDefaultWords())
        this.buildPinyinMap(this.getDefaultWords())
      }
    } catch (error) {
      console.error('[FreeContentFilter] 加载词库失败:', error)
      this.buildTrie(this.getDefaultWords())
      this.buildPinyinMap(this.getDefaultWords())
    }
  }

  private getDefaultWords(): string[] {
    return [
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
      'baoli', 'seqing', 'dubo', 'dupin', 'zisha', 'sharen',
      'qiangjie', 'zhapian', 'weifa', 'weigui', 'xiejiao', 'kongbu',
    ]
  }

  private buildTrie(words: string[]) {
    this.root = { children: new Map(), isEnd: false }
    for (const word of words) {
      if (!word.trim()) continue
      let node = this.root
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

  private buildPinyinMap(words: string[]) {
    const pinyinMap: Record<string, string[]> = {
      '暴': ['bao'], '力': ['li'], '色': ['se'], '情': ['qing'],
      '赌': ['du'], '博': ['bo'], '毒': ['du'], '品': ['pin'],
      '自': ['zi'], '杀': ['sha'], '人': ['ren'], '抢': ['qiang'],
      '劫': ['jie'], '诈': ['zha'], '骗': ['pian'], '违': ['wei'],
      '法': ['fa'], '规': ['gui'], '邪': ['xie'], '教': ['jiao'],
      '恐': ['kong'], '怖': ['bu'], '反': ['fan'], '动': ['dong'],
      '分': ['fen'], '裂': ['lie'], '台': ['tai'], '独': ['du'],
      '藏': ['cang'], '法': ['fa'], '轮': ['lun'], '功': ['gong'],
      '卖': ['mai'], '淫': ['yin'], '嫖': ['piao'], '娼': ['chang'],
      '强': ['qiang'], '奸': ['jian'], '乱': ['luan'], '伦': ['lun'],
      '兽': ['shou'], '交': ['jiao'], '恋': ['lian'], '童': ['tong'],
      '血': ['xue'], '腥': ['xing'], '残': ['can'], '斗': ['dou'],
      '殴': ['ou'], '绑': ['bang'], '架': ['jia'], '勒': ['le'],
      '索': ['suo'], '纵': ['zong'], '火': ['huo'], '爆': ['bao'],
      '炸': ['zha'], '贪': ['tan'], '污': ['wu'], '腐': ['fu'],
      '败': ['bai'], '受': ['shou'], '贿': ['hui'], '洗': ['xi'],
      '钱': ['qian'], '走': ['zou'], '私': ['si'], '贩': ['fan'],
      '吸': ['xi'], '黑': ['hei'], '客': ['ke'], '攻': ['gong'],
      '入': ['ru'], '侵': ['qin'], '病': ['bing'], '毒': ['du'],
      '木': ['mu'], '马': ['ma'], '钓': ['diao'], '谣': ['yao'],
      '言': ['yan'], '诽': ['fei'], '谤': ['bang'], '造': ['zao'],
      '煽': ['shan'], '动': ['dong'], '仇': ['chou'], '恨': ['hen'],
      '歧': ['qi'], '视': ['shi'], '偏': ['pian'], '见': ['jian'],
      '淫': ['yin'], '秽': ['hui'], '露': ['lu'], '骨': ['gu'],
      '挑': ['tiao'], '逗': ['dou'], '博': ['bo'], '彩': ['cai'],
      '彩': ['cai'], '票': ['piao'], '赌': ['du'], '球': ['qiu'],
      '赌': ['du'], '马': ['ma'], '六': ['liu'], '合': ['he'],
      '彩': ['cai'], '交': ['jiao'], '易': ['yi'], '冰': ['bing'],
      '海': ['hai'], '洛': ['luo'], '因': ['yin'], '大': ['da'],
      '麻': ['ma'], '摇': ['yao'], '头': ['tou'], '丸': ['wan'],
      '鸦': ['ya'], '片': ['pian'], '枪': ['qiang'], '支': ['zhi'],
      '弹': ['dan'], '药': ['yao'], '管': ['guan'], '制': ['zhi'],
      '刀': ['dao'], '具': ['ju'], '武': ['wu'], '器': ['qi'],
      '凶': ['xiong'], '图': ['tu'], '片': ['pian'], '视': ['shi'],
      '频': ['pin'], '影': ['ying'], '片': ['pian'], '政': ['zheng'],
      '治': ['zhi'], '事': ['shi'], '件': ['jian'], '人': ['ren'],
      '物': ['wu'], '话': ['hua'], '题': ['ti'], '辱': ['ru'],
      '骂': ['ma'], '脏': ['zang'], '话': ['hua'], '粗': ['cu'],
      '口': ['kou'], '侮': ['wu'], '辱': ['ru'], '性': ['xing'],
      '攻': ['gong'], '击': ['ji'], '威': ['wei'], '胁': ['xie'],
      '性': ['xing'], '肉': ['rou'], '搜': ['sou'], '索': ['suo'],
      '隐': ['yin'], '私': ['si'], '泄': ['xie'], '露': ['lu'],
      '广': ['guang'], '告': ['gao'], '推': ['tui'], '广': ['guang'],
      '营': ['ying'], '销': ['xiao'], '引': ['yin'], '流': ['liu'],
      '刷': ['shua'], '单': ['dan'], '返': ['fan'], '利': ['li'],
      '欺': ['qi'], '诈': ['zha'], '虚': ['xu'], '假': ['jia'],
      '信': ['xin'], '息': ['xi'], '骗': ['pian'], '局': ['ju'],
      '传': ['chuan'], '销': ['xiao'], '非': ['fei'], '法': ['fa'],
      '集': ['ji'], '资': ['zi'], '颠': ['dian'], '覆': ['fu'],
      '极': ['ji'], '端': ['duan'], '主': ['zhu'], '义': ['yi'],
      '圣': ['sheng'], '战': ['zhan'], '种': ['zhong'], '族': ['zu'],
      '年': ['nian'], '龄': ['ling'], '残': ['can'], '障': ['zhang'],
      '校': ['xiao'], '园': ['yuan'], '霸': ['ba'], '凌': ['ling'],
      '倾': ['qing'], '向': ['xiang'], '虐': ['nue'], '轻': ['qing'],
      '生': ['sheng'], '绝': ['jue'], '望': ['wang'], '抑': ['yi'],
      '郁': ['yu'], '游': ['you'], '戏': ['xi'], '影': ['ying'],
    }
    this.pinyinMap = pinyinMap
  }

  private removeZeroWidthChars(text: string): string {
    let result = text
    for (const char of this.zeroWidthChars) {
      result = result.replace(new RegExp(char, 'g'), '')
    }
    return result
  }

  private textToPinyin(text: string): string {
    let result = ''
    for (const char of text) {
      const pinyins = this.pinyinMap[char]
      if (pinyins && pinyins.length > 0) {
        result += pinyins[0]
      } else {
        result += char
      }
    }
    return result
  }

  private dfaMatch(text: string): string[] {
    const matches: string[] = []
    const len = text.length

    for (let i = 0; i < len; i++) {
      let node = this.root
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
    const cleanText = this.removeZeroWidthChars(text)
    
    const directMatches = this.dfaMatch(cleanText)
    
    const pinyinText = this.textToPinyin(cleanText)
    const pinyinMatches = this.dfaMatch(pinyinText)
    
    const allMatches = [...new Set([...directMatches, ...pinyinMatches])]

    if (allMatches.length > 0) {
      return {
        isBlocked: true,
        matchedWords: allMatches,
        message: '内容包含违规词',
      }
    }

    return {
      isBlocked: false,
      matchedWords: [],
      message: '内容合规',
    }
  }

  async addWords(words: string[]): Promise<void> {
    const cleanWords = words.filter(w => w.trim().length >= 2)
    
    const wordsPath = path.join(process.cwd(), 'data', 'clean-base-words.txt')
    let existingWords: string[] = []
    
    if (fs.existsSync(wordsPath)) {
      const content = fs.readFileSync(wordsPath, 'utf-8')
      existingWords = content.split('\n').map(w => w.trim()).filter(w => w.length >= 2)
    }
    
    const existingSet = new Set(existingWords)
    const newWords = cleanWords.filter(w => !existingSet.has(w))
    
    if (newWords.length > 0) {
      fs.appendFileSync(wordsPath, '\n' + newWords.join('\n'), 'utf-8')
      this.loadWords()
      console.log(`[FreeContentFilter] 添加了 ${newWords.length} 个新敏感词`)
    }
  }

  async removeWord(word: string): Promise<void> {
    const wordsPath = path.join(process.cwd(), 'data', 'clean-base-words.txt')
    
    if (!fs.existsSync(wordsPath)) return
    
    const content = fs.readFileSync(wordsPath, 'utf-8')
    const words = content.split('\n').map(w => w.trim()).filter(w => w !== word && w.length >= 2)
    
    fs.writeFileSync(wordsPath, words.join('\n'), 'utf-8')
    this.loadWords()
    console.log(`[FreeContentFilter] 删除了敏感词: ${word}`)
  }

  async getWordCount(): Promise<number> {
    const wordsPath = path.join(process.cwd(), 'data', 'clean-base-words.txt')
    
    if (!fs.existsSync(wordsPath)) {
      return this.getDefaultWords().length
    }
    
    const content = fs.readFileSync(wordsPath, 'utf-8')
    return content.split('\n').filter(w => w.trim().length >= 2).length
  }
}

export const freeContentFilter = new FreeContentFilter()