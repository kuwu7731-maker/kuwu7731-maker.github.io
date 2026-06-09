'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        window.location.href = '/'
      } else {
        setError(data.message || '邮箱或密码错误')
      }
    } catch {
      setError('网络错误，请稍后重试')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-[400px] h-[400px] rounded-full" style={{background:'radial-gradient(circle,rgba(0,229,255,0.1) 0%,transparent 70%)'}} />
      <div className="absolute bottom-20 right-20 w-[300px] h-[300px] rounded-full" style={{background:'radial-gradient(circle,rgba(213,0,249,0.1) 0%,transparent 70%)'}} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.1)]">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-white/70" />
              </Link>
              <h1 className="text-xl font-bold text-white">登录</h1>
            </div>

            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#00E5FF] via-[#2979FF] to-[#D500F9] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9] mb-2">实验中学论坛</h1>
              <p className="text-white/50 text-sm">欢迎回来</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="请输入您的邮箱"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="请输入密码"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  isLoading
                    ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9] text-white shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-[1.02]'
                }`}
              >
                {isLoading ? '登录中...' : '立即登录'}
              </button>

              <p className="text-center text-white/50 text-sm">
                还没有账号？
                <Link href="/register" className="text-[#00E5FF] hover:underline ml-1">
                  立即注册
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
