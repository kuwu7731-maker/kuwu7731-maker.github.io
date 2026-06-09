import { FreeContentFilter } from './free-content-filter'

describe('FreeContentFilter', () => {
  let filter: FreeContentFilter

  beforeEach(() => {
    filter = new FreeContentFilter()
  })

  describe('正常文本测试', () => {
    it('应该通过正常学习内容', () => {
      const result = filter.filter('今天数学考试考得很好，老师表扬了我')
      expect(result.isBlocked).toBe(false)
      expect(result.matchedWords).toEqual([])
    })

    it('应该通过校园日常交流', () => {
      const result = filter.filter('明天学校要举办运动会，大家一起加油')
      expect(result.isBlocked).toBe(false)
      expect(result.matchedWords).toEqual([])
    })

    it('应该通过心理健康讨论', () => {
      const result = filter.filter('最近学习压力有点大，需要调整心态')
      expect(result.isBlocked).toBe(false)
      expect(result.matchedWords).toEqual([])
    })

    it('应该通过师生互动内容', () => {
      const result = filter.filter('老师您好，请问这个问题怎么解答')
      expect(result.isBlocked).toBe(false)
      expect(result.matchedWords).toEqual([])
    })
  })

  describe('纯拼音测试', () => {
    it('应该检测到暴力的拼音', () => {
      const result = filter.filter('baoli')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('baoli')
    })

    it('应该检测到色情的拼音', () => {
      const result = filter.filter('seqing')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('seqing')
    })

    it('应该检测到赌博的拼音', () => {
      const result = filter.filter('dubo')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('dubo')
    })

    it('应该检测到毒品的拼音', () => {
      const result = filter.filter('dupin')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('dupin')
    })

    it('应该检测到混合拼音内容', () => {
      const result = filter.filter('这个游戏很baoli，不适合小孩玩')
      expect(result.isBlocked).toBe(true)
    })
  })

  describe('零宽字符插入测试', () => {
    it('应该检测到零宽字符分隔的暴力', () => {
      const result = filter.filter('暴\u200B力')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('暴力')
    })

    it('应该检测到多个零宽字符分隔的色情', () => {
      const result = filter.filter('色\u200B\u200C情')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('色情')
    })

    it('应该检测到零宽字符分隔的赌博', () => {
      const result = filter.filter('赌\uFEFF博')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('赌博')
    })

    it('应该检测到多种零宽字符混合', () => {
      const result = filter.filter('暴\u200B力\u200C游戏')
      expect(result.isBlocked).toBe(true)
    })
  })

  describe('校园专属词测试', () => {
    it('应该检测到校园霸凌', () => {
      const result = filter.filter('我们班有人被校园霸凌了')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('校园霸凌')
    })

    it('应该检测到校园暴力', () => {
      const result = filter.filter('校园暴力是不好的行为')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('校园暴力')
    })

    it('应该检测到欺凌', () => {
      const result = filter.filter('不要欺凌同学')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('欺凌')
    })

    it('应该检测到殴打', () => {
      const result = filter.filter('有人在学校殴打同学')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('殴打')
    })

    it('应该检测到辱骂', () => {
      const result = filter.filter('不要辱骂他人')
      expect(result.isBlocked).toBe(true)
      expect(result.matchedWords).toContain('辱骂')
    })

    it('不应该误杀正常的校园相关词汇', () => {
      const result = filter.filter('校园里有很多花草树木')
      expect(result.isBlocked).toBe(false)
    })

    it('不应该误杀学习相关词汇', () => {
      const result = filter.filter('今天的作业很难，需要老师辅导')
      expect(result.isBlocked).toBe(false)
    })

    it('不应该误杀师生关系词汇', () => {
      const result = filter.filter('老师和同学关系很好')
      expect(result.isBlocked).toBe(false)
    })
  })

  describe('误杀率测试', () => {
    it('不应该误杀同志', () => {
      const result = filter.filter('同学们要互相同志互爱')
      expect(result.isBlocked).toBe(false)
    })

    it('不应该误杀激情', () => {
      const result = filter.filter('学习要有激情')
      expect(result.isBlocked).toBe(false)
    })

    it('不应该误杀小学生', () => {
      const result = filter.filter('我是一名小学生')
      expect(result.isBlocked).toBe(false)
    })

    it('不应该误杀老师', () => {
      const result = filter.filter('老师辛苦了')
      expect(result.isBlocked).toBe(false)
    })

    it('不应该误杀心理健康', () => {
      const result = filter.filter('关注心理健康很重要')
      expect(result.isBlocked).toBe(false)
    })

    it('不应该误杀早恋讨论', () => {
      const result = filter.filter('如何正确看待早恋问题')
      expect(result.isBlocked).toBe(false)
    })
  })
})