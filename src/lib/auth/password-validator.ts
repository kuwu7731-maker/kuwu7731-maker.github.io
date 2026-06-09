const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('密码长度至少8位')
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('密码必须包含小写字母')
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('密码必须包含大写字母')
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('密码必须包含数字')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  return 'strong'
}