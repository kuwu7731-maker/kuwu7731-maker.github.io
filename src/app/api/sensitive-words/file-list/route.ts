import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { freeContentFilter } from '@/lib/sensitive-word/free-content-filter'

export async function GET() {
  try {
    const count = await freeContentFilter.getWordCount()
    
    const wordsPath = path.join(process.cwd(), 'data', 'clean-base-words.txt')
    let words: string[] = []
    
    if (fs.existsSync(wordsPath)) {
      const content = fs.readFileSync(wordsPath, 'utf-8')
      words = content.split('\n').map((w: string) => w.trim()).filter((w: string) => w.length >= 2)
    }
    
    return NextResponse.json({ words, count })
  } catch (error) {
    return NextResponse.json({ words: [], count: 0 }, { status: 500 })
  }
}

export async function POST() {
  try {
    const count = await freeContentFilter.getWordCount()
    
    const wordsPath = path.join(process.cwd(), 'data', 'clean-base-words.txt')
    let words: string[] = []
    
    if (fs.existsSync(wordsPath)) {
      const content = fs.readFileSync(wordsPath, 'utf-8')
      words = content.split('\n').map((w: string) => w.trim()).filter((w: string) => w.length >= 2)
    }
    
    return NextResponse.json({ words, count })
  } catch (error) {
    return NextResponse.json({ words: [], count: 0 }, { status: 500 })
  }
}