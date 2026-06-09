export interface CaptchaResult {
  success: boolean
  challengeId: string
}

let challengeStore: Map<string, { answer: number; timestamp: number }> = new Map()

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateCaptcha(): { challengeId: string; offset: number } {
  const challengeId = crypto.randomUUID()
  const offset = generateRandomNumber(50, 200)

  challengeStore.set(challengeId, {
    answer: offset,
    timestamp: Date.now(),
  })

  setTimeout(() => {
    challengeStore.delete(challengeId)
  }, 60000)

  return { challengeId, offset }
}

export function verifyCaptcha(challengeId: string, userAnswer: number): CaptchaResult {
  const challenge = challengeStore.get(challengeId)

  if (!challenge) {
    return { success: false, challengeId }
  }

  const timeDiff = Date.now() - challenge.timestamp
  if (timeDiff > 60000) {
    challengeStore.delete(challengeId)
    return { success: false, challengeId }
  }

  const tolerance = 10
  const isCorrect = Math.abs(userAnswer - challenge.answer) <= tolerance

  if (isCorrect) {
    challengeStore.delete(challengeId)
  }

  return { success: isCorrect, challengeId }
}