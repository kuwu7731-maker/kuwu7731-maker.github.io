'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, AlertCircle, CheckCircle, BookOpen, FileText, Sparkles, X, AlertTriangle, Home } from 'lucide-react'
import Link from 'next/link'
import { FilterCore, getDefaultBlockWords, getDefaultWarnWords, FilterResult } from '@/lib/sensitive-word/filter-core'

export default function CreatePostPage() {
  const [formData, setFormData] = useState({
    grade: 7,
    title: '',
    content: '',
  })
  const [validationResult, setValidationResult] = useState<FilterResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<{ type: 'block' | 'warning'; words: string[] } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [filterCore, setFilterCore] = useState<FilterCore | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch('/api/sensitive-words/file-list')
        if (response.ok) {
          const data = await response.json()
          const blockWords = data.blockWords || getDefaultBlockWords()
          const warnWords = data.warnWords || getDefaultWarnWords()
          setFilterCore(new FilterCore(blockWords, warnWords))
        } else {
          setFilterCore(new FilterCore(getDefaultBlockWords(), getDefaultWarnWords()))
        }
      } catch {
        setFilterCore(new FilterCore(getDefaultBlockWords(), getDefaultWarnWords()))
      } finally {
        setIsLoading(false)
      }
    }

    loadWords()
  }, [])

  const validateText = useCallback((text: string): FilterResult => {
    if (!filterCore) {
      return {
        isBlocked: false,
        isWarning: false,
        blockedWords: [],
        warningWords: [],
        message: '内容合规',
      }
    }
    const result = filterCore.filter(text)
    setValidationResult(result)
    return result
  }, [filterCore])

  const handleInputChange = (field: 'title' | 'content', value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)

    const fullText = newData.title + ' ' + newData.content
    const result = validateText(fullText)

    if (result.isBlocked && result.blockedWords.length > 0 && !showModal) {
      setModalContent({ type: 'block', words: result.blockedWords })
      setShowModal(true)
    } else if (result.isWarning && result.warningWords.length > 0) {
      setModalContent({ type: 'warning', words: result.warningWords })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }

    const fullText = formData.title + ' ' + formData.content
    const result = validateText(fullText)

    if (result.isBlocked) {
      setModalContent({ type: 'block', words: result.blockedWords })
      setShowModal(true)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowSuccess(true)
      }
    } catch {
      // Handle error
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full" style={{background:'radial-gradient(circle,rgba(0,229,255,0.08) 0%,transparent 70%)'}} />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full" style={{background:'radial-gradient(circle,rgba(213,0,249,0.08) 0%,transparent 70%)'}} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-white/70" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9]">发布帖子</h1>
                <p className="text-white/40 text-xs">分享你的想法和见解</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-[0_0_50px_rgba(0,229,255,0.1)]"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00E5FF] via-[#2979FF] to-[#D500F9] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)]"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#D500F9] mb-4"
                >
                  发布成功
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 mb-8"
                >
                  {validationResult?.isWarning ? '您的帖子需要审核，请耐心等待' : '您的帖子已成功发布'}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9] rounded-xl text-white font-medium shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-[1.02] transition-all"
                  >
                    <Home className="w-5 h-5" />
                    返回首页
                  </Link>
                  <Link
                    href="/grade/7"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 hover:border-white/30 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    浏览帖子
                  </Link>
                  <Link
                    href="/post/create"
                    onClick={() => {
                      setShowSuccess(false)
                      setFormData({ grade: 7, title: '', content: '' })
                      setValidationResult(null)
                    }}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#2979FF] to-[#D500F9] rounded-xl text-white font-medium shadow-[0_0_20px_rgba(41,121,255,0.4)] hover:shadow-[0_0_30px_rgba(41,121,255,0.6)] hover:scale-[1.02] transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    发布新帖
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,229,255,0.1)]"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#D500F9]/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#00E5FF]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">分享精彩内容</h2>
                    <p className="text-white/40 text-sm">发布前请确保内容符合社区规范</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                      <BookOpen className="w-4 h-4" />
                      选择板块
                    </label>
                    <div className="relative">
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value={7} className="bg-[#1a1a2e] text-white">七年级 · 启航</option>
                        <option value={8} className="bg-[#1a1a2e] text-white">八年级 · 深耕</option>
                        <option value={9} className="bg-[#1a1a2e] text-white">九年级 · 冲刺</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                      <FileText className="w-4 h-4" />
                      标题
                      {validationResult?.isBlocked && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          包含违禁词
                        </motion.span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="请输入帖子标题..."
                      className={`w-full px-4 py-4 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none transition-all ${
                        validationResult?.isBlocked
                          ? 'border-red-500/50 focus:border-red-500/50'
                          : validationResult?.isWarning
                          ? 'border-yellow-500/30 focus:border-yellow-500/30'
                          : 'border-white/20 focus:border-[#00E5FF]/50'
                      }`}
                      required
                    />
                    <p className="text-white/30 text-xs mt-2">标题应简洁明了，准确描述内容</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                      <Send className="w-4 h-4" />
                      内容
                      {validationResult?.isBlocked && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          包含违禁词
                        </motion.span>
                      )}
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="请输入帖子内容..."
                      rows={12}
                      className={`w-full px-4 py-4 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none transition-all resize-none ${
                        validationResult?.isBlocked
                          ? 'border-red-500/50 focus:border-red-500/50'
                          : validationResult?.isWarning
                          ? 'border-yellow-500/30 focus:border-yellow-500/30'
                          : 'border-white/20 focus:border-[#00E5FF]/50'
                      }`}
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-white/30 text-xs">支持 markdown 格式</p>
                      <span className="text-white/30 text-xs">{formData.content.length} 字</span>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {validationResult && (validationResult.isBlocked || validationResult.isWarning) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-5 rounded-xl border ${
                          validationResult.isBlocked
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-yellow-500/10 border-yellow-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              validationResult.isBlocked ? 'bg-red-500/20' : 'bg-yellow-500/20'
                            }`}
                          >
                            {validationResult.isBlocked ? (
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            )}
                          </motion.div>
                          <div>
                            <span className={`font-medium ${validationResult.isBlocked ? 'text-red-400' : 'text-yellow-400'}`}>
                              {validationResult.isBlocked ? '内容包含违禁词汇' : '内容包含需要注意的词语'}
                            </span>
                            <p className="text-white/40 text-xs">
                              {validationResult.isBlocked ? '请修改后再发布' : '请注意发言规范'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {validationResult.blockedWords.map((word, index) => (
                            <motion.span
                              key={`block-${index}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-3 py-1.5 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30"
                            >
                              {word}
                            </motion.span>
                          ))}
                          {validationResult.warningWords.map((word, index) => (
                            <motion.span
                              key={`warn-${index}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-3 py-1.5 rounded-full text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            >
                              {word}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.title.trim() || !formData.content.trim() || validationResult?.isBlocked}
                      className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        isSubmitting || !formData.title.trim() || !formData.content.trim() || validationResult?.isBlocked
                          ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                          : 'bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9] text-white shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-[1.02]'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          发布中...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          {validationResult?.isWarning ? '发布（需审核）' : '立即发布'}
                        </>
                      )}
                    </button>
                    <p className="text-center text-white/30 text-xs mt-3">
                      发布即表示同意 <span className="text-[#00E5FF]">用户协议</span> 和 <span className="text-[#00E5FF]">隐私政策</span>
                    </p>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/30 text-sm">实验中学论坛 © 2024</div>
      </footer>

      <AnimatePresence>
        {showModal && modalContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(239,68,68,0.2)]"
            >
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </motion.button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                  modalContent.type === 'block'
                    ? 'bg-gradient-to-br from-red-500/30 to-red-600/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                    : 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                }`}
              >
                {modalContent.type === 'block' ? (
                  <AlertCircle className="w-8 h-8 text-red-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                )}
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-xl font-bold text-center mb-3 ${
                  modalContent.type === 'block' ? 'text-red-400' : 'text-yellow-400'
                }`}
              >
                {modalContent.type === 'block' ? '内容包含违禁词汇' : '内容包含需要注意的词语'}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/60 text-center mb-6"
              >
                {modalContent.type === 'block'
                  ? '您输入的内容包含以下违禁词汇，请修改后再发布'
                  : '您输入的内容包含以下需要注意的词语，请谨慎发言'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-2 mb-8"
              >
                {modalContent.words.map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      modalContent.type === 'block'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setShowModal(false)}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  modalContent.type === 'block'
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                }`}
              >
                我知道了
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}