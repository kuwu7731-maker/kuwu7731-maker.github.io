import * as fs from 'fs'
import * as path from 'path'
import { FilterCore, FilterResult, getDefaultBlockWords, getDefaultWarnWords } from './filter-core'

export type { FilterResult } from './filter-core'

export class FreeContentFilter {
  private filterCore: FilterCore
  private blockWords: string[] = []
  private warnWords: string[] = []

  constructor() {
    this.loadWords()
    this.filterCore = new FilterCore(this.blockWords, this.warnWords)
  }

  private getWordFilePath(fileName: string): string {
    const possiblePaths = [
      path.join(process.cwd(), 'data', fileName),
      path.join(process.cwd(), '..', 'data', fileName),
      path.join(__dirname, '..', '..', '..', 'data', fileName),
      path.join(__dirname, '..', '..', 'data', fileName),
      path.join('/app', 'data', fileName),
    ]

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p
      }
    }
    return path.join(process.cwd(), 'data', fileName)
  }

  private loadWords() {
    try {
      const blockPath = this.getWordFilePath('block-words.txt')
      const warnPath = this.getWordFilePath('warn-words.txt')

      if (fs.existsSync(blockPath)) {
        const content = fs.readFileSync(blockPath, 'utf-8')
        this.blockWords = content.split('\n').map(w => w.trim()).filter(w => w.length >= 1)
      } else {
        this.blockWords = getDefaultBlockWords()
        console.log('[FreeContentFilter] 词库文件不存在，使用默认词库')
      }

      if (fs.existsSync(warnPath)) {
        const content = fs.readFileSync(warnPath, 'utf-8')
        this.warnWords = content.split('\n').map(w => w.trim()).filter(w => w.length >= 1)
      } else {
        this.warnWords = getDefaultWarnWords()
      }

      this.filterCore = new FilterCore(this.blockWords, this.warnWords)
      console.log(`[FreeContentFilter] 加载了 ${this.blockWords.length} 个拦截词，${this.warnWords.length} 个警告词`)
    } catch (error) {
      console.error('[FreeContentFilter] 加载词库失败:', error)
      this.blockWords = getDefaultBlockWords()
      this.warnWords = getDefaultWarnWords()
      this.filterCore = new FilterCore(this.blockWords, this.warnWords)
    }
  }

  filter(text: string): FilterResult {
    return this.filterCore.filter(text)
  }

  async addBlockWords(words: string[]): Promise<void> {
    const cleanWords = words.filter(w => w.trim().length >= 1)
    const blockPath = this.getWordFilePath('block-words.txt')

    let existingWords: string[] = []
    if (fs.existsSync(blockPath)) {
      const content = fs.readFileSync(blockPath, 'utf-8')
      existingWords = content.split('\n').map(w => w.trim()).filter(w => w.length >= 1)
    }

    const existingSet = new Set(existingWords)
    const newWords = cleanWords.filter(w => !existingSet.has(w))

    if (newWords.length > 0) {
      fs.appendFileSync(blockPath, '\n' + newWords.join('\n'), 'utf-8')
      this.loadWords()
      console.log(`[FreeContentFilter] 添加了 ${newWords.length} 个拦截词`)
    }
  }

  async addWarnWords(words: string[]): Promise<void> {
    const cleanWords = words.filter(w => w.trim().length >= 1)
    const warnPath = this.getWordFilePath('warn-words.txt')

    let existingWords: string[] = []
    if (fs.existsSync(warnPath)) {
      const content = fs.readFileSync(warnPath, 'utf-8')
      existingWords = content.split('\n').map(w => w.trim()).filter(w => w.length >= 1)
    }

    const existingSet = new Set(existingWords)
    const newWords = cleanWords.filter(w => !existingSet.has(w))

    if (newWords.length > 0) {
      fs.appendFileSync(warnPath, '\n' + newWords.join('\n'), 'utf-8')
      this.loadWords()
      console.log(`[FreeContentFilter] 添加了 ${newWords.length} 个警告词`)
    }
  }

  async removeWord(word: string, type: 'block' | 'warn'): Promise<void> {
    const pathStr = type === 'block'
      ? this.getWordFilePath('block-words.txt')
      : this.getWordFilePath('warn-words.txt')

    if (!fs.existsSync(pathStr)) return

    const content = fs.readFileSync(pathStr, 'utf-8')
    const words = content.split('\n').map(w => w.trim()).filter(w => w !== word && w.length >= 1)

    fs.writeFileSync(pathStr, words.join('\n'), 'utf-8')
    this.loadWords()
    console.log(`[FreeContentFilter] 删除了${type === 'block' ? '拦截' : '警告'}词: ${word}`)
  }

  async getWordCount(): Promise<{ block: number; warn: number }> {
    const blockPath = this.getWordFilePath('block-words.txt')
    const warnPath = this.getWordFilePath('warn-words.txt')

    let blockCount = getDefaultBlockWords().length
    let warnCount = getDefaultWarnWords().length

    if (fs.existsSync(blockPath)) {
      const content = fs.readFileSync(blockPath, 'utf-8')
      blockCount = content.split('\n').filter(w => w.trim().length >= 1).length
    }

    if (fs.existsSync(warnPath)) {
      const content = fs.readFileSync(warnPath, 'utf-8')
      warnCount = content.split('\n').filter(w => w.trim().length >= 1).length
    }

    return { block: blockCount, warn: warnCount }
  }

  getWords(): { blockWords: string[]; warnWords: string[] } {
    return { blockWords: this.blockWords, warnWords: this.warnWords }
  }
}

export const freeContentFilter = new FreeContentFilter()