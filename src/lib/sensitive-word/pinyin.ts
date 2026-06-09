const pinyinMap: Record<string, string[]> = {
  '暴': ['bao'],
  '力': ['li'],
  '色': ['se'],
  '情': ['qing'],
  '赌': ['du'],
  '博': ['bo'],
  '毒': ['du'],
  '品': ['pin'],
  '自': ['zi'],
  '杀': ['sha'],
  '杀': ['sha'],
  '人': ['ren'],
  '抢': ['qiang'],
  '劫': ['jie'],
  '诈': ['zha'],
  '骗': ['pian'],
  '违': ['wei'],
  '法': ['fa'],
  '规': ['gui'],
}

const pinyinCharMap: Record<string, string[]> = {}

for (const [char, pinyins] of Object.entries(pinyinMap)) {
  for (const pinyin of pinyins) {
    if (!pinyinCharMap[pinyin]) {
      pinyinCharMap[pinyin] = []
    }
    pinyinCharMap[pinyin].push(char)
  }
}

export function charToPinyin(char: string): string[] {
  return pinyinMap[char] || []
}

export function pinyinToChar(pinyin: string): string[] {
  return pinyinCharMap[pinyin] || []
}

export function textToPinyin(text: string): string[] {
  const result: string[] = []
  for (const char of text) {
    const pinyins = charToPinyin(char)
    if (pinyins.length > 0) {
      result.push(...pinyins)
    } else {
      result.push(char)
    }
  }
  return result
}

export function textToPinyinString(text: string): string {
  return textToPinyin(text).join('')
}

export function generatePinyinVariants(word: string): string[] {
  const variants: string[] = []
  const chars = word.split('')
  const pinyinGroups = chars.map(char => {
    const pinyins = charToPinyin(char)
    return pinyins.length > 0 ? [...pinyins, char] : [char]
  })

  function combine(index: number, current: string) {
    if (index === pinyinGroups.length) {
      if (current !== word) {
        variants.push(current)
      }
      return
    }

    for (const option of pinyinGroups[index]) {
      combine(index + 1, current + option)
    }
  }

  combine(0, '')
  return variants
}