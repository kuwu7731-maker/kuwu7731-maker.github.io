export interface TrieNode {
  children: Map<string, TrieNode>
  isEnd: boolean
  word?: string
}

export class DFAMatcher {
  private root: TrieNode = { children: new Map(), isEnd: false }

  constructor(words: string[] = []) {
    this.buildTrie(words)
  }

  buildTrie(words: string[]) {
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

  match(text: string): { word: string; start: number; end: number }[] {
    const matches: { word: string; start: number; end: number }[] = []
    const len = text.length

    for (let i = 0; i < len; i++) {
      let node = this.root
      let j = i

      while (j < len && node.children.has(text[j])) {
        node = node.children.get(text[j])!
        j++

        if (node.isEnd) {
          matches.push({
            word: node.word || text.slice(i, j),
            start: i,
            end: j - 1,
          })
        }
      }
    }

    return matches
  }

  hasMatch(text: string): boolean {
    const len = text.length

    for (let i = 0; i < len; i++) {
      let node = this.root
      let j = i

      while (j < len && node.children.has(text[j])) {
        node = node.children.get(text[j])!
        j++

        if (node.isEnd) {
          return true
        }
      }
    }

    return false
  }

  filter(text: string, replaceChar: string = '*'): string {
    let result = text.split('')
    const matches = this.match(text)

    for (const match of matches) {
      for (let i = match.start; i <= match.end; i++) {
        result[i] = replaceChar
      }
    }

    return result.join('')
  }
}