'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, GraduationCap, BookOpen, AlertCircle, CheckCircle, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { SlideCaptcha } from '@/components/SlideCaptcha'
import { TermsModal } from '@/components/TermsModal'
import { validatePassword, getPasswordStrength } from '@/lib/auth/password-validator'
import { generateCaptcha, verifyCaptcha } from '@/lib/auth/captcha'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    identity: '' as 'student' | 'teacher' | '',
    grade: 7,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')
  const [captcha, setCaptcha] = useState<{ challengeId: string; offset: number } | null>(null)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const ALLOWED_DOMAINS = ['gmail.com', 'qq.com', '163.com', '139.com', 'outlook.com', 'yeah.net', 'sina.com', 'hotmail.com']

  const validateEmailDomain = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return false
    if (ALLOWED_DOMAINS.includes(domain)) return true
    if (domain.endsWith('.edu.cn')) return true
    return false
  }

  useEffect(() => {
    setCaptcha(generateCaptcha())
  }, [])

  useEffect(() => {
    if (formData.password) {
      const result = validatePassword(formData.password)
      setPasswordErrors(result.errors)
      setPasswordStrength(getPasswordStrength(formData.password))
    } else {
      setPasswordErrors([])
      setPasswordStrength('weak')
    }
  }, [formData.password])

  const handlePasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
    }
  }

  const handleCaptchaVerify = async (offset: number) => {
    if (!captcha) return
    const result = verifyCaptcha(captcha.challengeId, offset)
    if (result.success) {
      setCaptchaVerified(true)
    } else {
      setCaptcha(generateCaptcha())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    if (!formData.identity) {
      setErrors(['请选择身份'])
      return
    }
    if (!termsAgreed) {
      setErrors(['请阅读并同意用户协议'])
      return
    }
    if (!captchaVerified) {
      setErrors(['请完成滑块验证'])
      return
    }
    if (!validateEmailDomain(formData.email)) {
      setErrors(['请使用以下邮箱域名注册：gmail.com、qq.com、163.com、139.com、outlook.com、yeah.net、sina.com、hotmail.com 或学校域名.edu.cn'])
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setShowSuccess(true)
      } else {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors([data.message || '注册失败'])
        }
      }
    } catch {
      setErrors(['网络错误，请稍后重试'])
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)' }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(213,0,249,0.1) 0%, transparent 70%)' }}
          animate={{ x: [0, -50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <AnimatePresence>
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="relative z-10 w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.5)]"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="relative z-10 text-3xl font-bold gradient-text mb-4">注册成功</h2>
              <p className="relative z-10 text-white/60 mb-8">您已成功注册实验中学论坛账号</p>
              <Link href="/login" className="relative z-10 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-[length:200%_200%] animate-gradient-shift rounded-xl px-8 py-3 font-medium text-white shadow-[0_0_20px_rgba(0,229,255,0.4),0_0_40px_rgba(41,121,255,0.2)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.6),0_0_60px_rgba(213,0,249,0.3)] hover:scale-[1.02]">
                立即登录
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)]"
                  >
                    <GraduationCap className="w-10 h-10 text-white" />
                  </motion.div>
                  <h1 className="text-2xl font-bold gradient-text mb-3">实验中学论坛</h1>
                  <p className="text-white/50 text-sm">欢迎加入校园交流社区</p>
                </div>

                <AnimatePresence>
                  {errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                    >
                      {errors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">身份选择</label>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        type="button"
                        onClick={() => setFormData({ ...formData, identity: 'student' })}
                        className={`relative overflow-hidden p-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                          formData.identity === 'student'
                            ? 'border-cyan-400/60 bg-cyan-400/10'
                            : 'border-white/10 hover:border-cyan-400/30 hover:bg-white/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <BookOpen className={`w-8 h-8 ${formData.identity === 'student' ? 'text-cyan-400' : 'text-white/60'}`} />
                        <span className={`text-sm font-medium ${formData.identity === 'student' ? 'text-cyan-400' : 'text-white/80'}`}>学生</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setFormData({ ...formData, identity: 'teacher' })}
                        className={`relative overflow-hidden p-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                          formData.identity === 'teacher'
                            ? 'border-purple-500/60 bg-purple-500/10'
                            : 'border-white/10 hover:border-purple-500/30 hover:bg-white/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <GraduationCap className={`w-8 h-8 ${formData.identity === 'teacher' ? 'text-purple-400' : 'text-white/60'}`} />
                        <span className={`text-sm font-medium ${formData.identity === 'teacher' ? 'text-purple-400' : 'text-white/80'}`}>教师</span>
                      </motion.button>
                    </div>
                  </div>

                  {formData.identity === 'student' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <label className="block text-sm font-medium text-white/80 mb-3">所在年级</label>
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                        className="w-full bg-white/3 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 focus:bg-white/5 transition-all duration-300"
                      >
                        <option value={7} className="bg-[#1a1a2e] text-white">七年级 · 启航</option>
                        <option value={8} className="bg-[#1a1a2e] text-white">八年级 · 深耕</option>
                        <option value={9} className="bg-[#1a1a2e] text-white">九年级 · 冲刺</option>
                      </select>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">昵称</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="请输入您的昵称"
                        className="w-full bg-white/3 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 focus:bg-white/5 transition-all duration-300 pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">邮箱</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="请输入您的邮箱"
                        className="w-full bg-white/3 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 focus:bg-white/5 transition-all duration-300 pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">密码</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="请输入密码"
                        className="w-full bg-white/3 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 focus:bg-white/5 transition-all duration-300 pl-12 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {formData.password && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/50">密码强度</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength === 'weak' ? 'text-red-400' :
                            passwordStrength === 'medium' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {passwordStrength === 'weak' ? '弱' : passwordStrength === 'medium' ? '中等' : '强'}
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${handlePasswordStrengthColor()}`}
                            initial={{ width: 0 }}
                            animate={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {passwordErrors.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {passwordErrors.map((error, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-xs text-red-400"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {error}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">滑块验证</label>
                    {captcha && (
                      <SlideCaptcha
                        challengeId={captcha.challengeId}
                        targetOffset={captcha.offset}
                        onVerify={handleCaptchaVerify}
                        disabled={captchaVerified}
                      />
                    )}
                    {captchaVerified && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 flex items-center gap-2 text-green-400 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        验证通过
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setIsTermsOpen(true)}
                      className={`w-full py-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                        termsAgreed
                          ? 'border-green-500/50 bg-green-500/10 text-green-400'
                          : 'border-white/10 hover:border-cyan-400/30 text-white/60'
                      }`}
                    >
                      {termsAgreed ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">已阅读并同意用户协议</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">点击阅读并同意用户协议</span>
                        </>
                      )}
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !formData.identity || !termsAgreed || !captchaVerified || passwordErrors.length > 0}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                      isSubmitting || !formData.identity || !termsAgreed || !captchaVerified || passwordErrors.length > 0
                        ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                        : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-[length:200%_200%] animate-gradient-shift text-white shadow-[0_0_20px_rgba(0,229,255,0.4),0_0_40px_rgba(41,121,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6),0_0_60px_rgba(213,0,249,0.3)] hover:scale-[1.02]'
                    }`}
                    whileHover={isSubmitting ? undefined : { scale: 1.02 }}
                    whileTap={isSubmitting ? undefined : { scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        注册中...
                      </div>
                    ) : (
                      '立即注册'
                    )}
                  </motion.button>

                  <p className="text-center text-white/50 text-sm">
                    已有账号？
                    <Link href="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline ml-1">
                      立即登录
                    </Link>
                  </p>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        onConfirm={() => {
          setTermsAgreed(true)
          setIsTermsOpen(false)
        }}
      />
    </div>
  )
}
