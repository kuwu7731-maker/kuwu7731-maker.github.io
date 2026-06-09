import { PrismaClient } from '@prisma/client'
import { DFAMatcher } from './dfa'
import { generatePinyinVariants, textToPinyinString } from './pinyin'

const prisma = new PrismaClient()

export interface SensitiveWordMatch {
  word: string
  type: 'banned' | 'suspect'
  start: number
  end: number
}

export interface ValidateResult {
  hasBanned: boolean
  hasSuspect: boolean
  matches: SensitiveWordMatch[]
}

class SensitiveWordService {
  private dfaBanned: DFAMatcher = new DFAMatcher()
  private dfaSuspect: DFAMatcher = new DFAMatcher()
  private regexBanned: RegExp[] = []
  private regexSuspect: RegExp[] = []

  async loadWords() {
    const words = await prisma.sensitiveWord.findMany()

    const bannedWords: string[] = []
    const suspectWords: string[] = []
    const bannedRegex: string[] = []
    const suspectRegex: string[] = []

    for (const word of words) {
      if (word.isRegex) {
        if (word.type === 'banned') {
          bannedRegex.push(word.word)
        } else {
          suspectRegex.push(word.word)
        }
      } else {
        if (word.type === 'banned') {
          bannedWords.push(word.word)
          if (word.pinyinVariants && word.pinyinVariants.length > 0) {
            bannedWords.push(...word.pinyinVariants)
          }
        } else {
          suspectWords.push(word.word)
          if (word.pinyinVariants && word.pinyinVariants.length > 0) {
            suspectWords.push(...word.pinyinVariants)
          }
        }
      }
    }

    this.dfaBanned.buildTrie(bannedWords)
    this.dfaSuspect.buildTrie(suspectWords)
    this.regexBanned = bannedRegex.map(r => new RegExp(r, 'gi'))
    this.regexSuspect = suspectRegex.map(r => new RegExp(r, 'gi'))
  }

  validate(text: string): ValidateResult {
    const matches: SensitiveWordMatch[] = []
    let hasBanned = false
    let hasSuspect = false

    const dfaBannedMatches = this.dfaBanned.match(text)
    for (const match of dfaBannedMatches) {
      matches.push({
        word: match.word,
        type: 'banned',
        start: match.start,
        end: match.end,
      })
      hasBanned = true
    }

    const dfaSuspectMatches = this.dfaSuspect.match(text)
    for (const match of dfaSuspectMatches) {
      matches.push({
        word: match.word,
        type: 'suspect',
        start: match.start,
        end: match.end,
      })
      hasSuspect = true
    }

    for (const regex of this.regexBanned) {
      let match
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          word: match[0],
          type: 'banned',
          start: match.index,
          end: match.index + match[0].length - 1,
        })
        hasBanned = true
      }
    }

    for (const regex of this.regexSuspect) {
      let match
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          word: match[0],
          type: 'suspect',
          start: match.index,
          end: match.index + match[0].length - 1,
        })
        hasSuspect = true
      }
    }

    const pinyinText = textToPinyinString(text)

    const dfaBannedPinyinMatches = this.dfaBanned.match(pinyinText)
    for (const match of dfaBannedPinyinMatches) {
      matches.push({
        word: match.word,
        type: 'banned',
        start: match.start,
        end: match.end,
      })
      hasBanned = true
    }

    const dfaSuspectPinyinMatches = this.dfaSuspect.match(pinyinText)
    for (const match of dfaSuspectPinyinMatches) {
      matches.push({
        word: match.word,
        type: 'suspect',
        start: match.start,
        end: match.end,
      })
      hasSuspect = true
    }

    return { hasBanned, hasSuspect, matches }
  }

  filter(text: string, replaceChar: string = '*'): string {
    const result = this.validate(text)
    if (result.matches.length === 0) return text

    let filtered = text.split('')
    for (const match of result.matches) {
      for (let i = match.start; i <= match.end; i++) {
        if (i < filtered.length) {
          filtered[i] = replaceChar
        }
      }
    }
    return filtered.join('')
  }

  async logMatch(wordId: string, content: string, userId: string | undefined, action: 'reject' | 'pending') {
    await prisma.sensitiveWordLog.create({
      data: {
        wordId,
        content,
        userId,
        action,
      },
    })
  }

  async addWord(word: string, type: 'banned' | 'suspect', isRegex: boolean = false) {
    const pinyinVariants = isRegex ? [] : generatePinyinVariants(word)

    const created = await prisma.sensitiveWord.create({
      data: {
        word,
        type,
        isRegex,
        pinyinVariants: JSON.stringify(pinyinVariants),
      },
    })

    await this.loadWords()
    return created
  }

  async removeWord(id: string) {
    await prisma.sensitiveWord.delete({
      where: { id },
    })
    await this.loadWords()
  }

  async updateWord(id: string, updates: { word?: string; type?: 'banned' | 'suspect'; isRegex?: boolean }) {
    const pinyinVariants = updates.isRegex || !updates.word ? [] : generatePinyinVariants(updates.word)

    const updated = await prisma.sensitiveWord.update({
      where: { id },
      data: {
        ...updates,
        pinyinVariants: JSON.stringify(pinyinVariants),
      },
    })

    await this.loadWords()
    return updated
  }

  async getAllWords() {
    return await prisma.sensitiveWord.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async getLogs() {
    return await prisma.sensitiveWordLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { word: true, user: true },
    })
  }
}

export const sensitiveWordService = new SensitiveWordService()

export async function validateContent(content: string, userId?: string): Promise<{ valid: boolean; status: 'approved' | 'pending' | 'rejected'; message: string }> {
  const result = sensitiveWordService.validate(content)

  if (result.hasBanned) {
    if (userId) {
      for (const match of result.matches.filter(m => m.type === 'banned')) {
        const word = await prisma.sensitiveWord.findFirst({ where: { word: match.word } })
        if (word) {
          await sensitiveWordService.logMatch(word.id, content, userId, 'reject')
        }
      }
    }
    return { valid: false, status: 'rejected', message: '内容包含违规词汇，无法发布' }
  }

  if (result.hasSuspect) {
    if (userId) {
      for (const match of result.matches.filter(m => m.type === 'suspect')) {
        const word = await prisma.sensitiveWord.findFirst({ where: { word: match.word } })
        if (word) {
          await sensitiveWordService.logMatch(word.id, content, userId, 'pending')
        }
      }
    }
    return { valid: false, status: 'pending', message: '内容需要审核，请耐心等待' }
  }

  return { valid: true, status: 'approved', message: '内容审核通过' }
}