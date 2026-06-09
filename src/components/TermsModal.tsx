'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { TERMS_OF_SERVICE, PRIVACY_POLICY, DISCLAIMER, AGREEMENT_CONFIRM_TEXT } from '@/data/terms'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

type TabType = 'terms' | 'privacy' | 'disclaimer'

export function TermsModal({ isOpen, onClose, onConfirm }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('terms')
  const [inputValue, setInputValue] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setIsConfirmed(false)
      setScrollProgress(0)
    }
  }, [isOpen])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const scrollPercent = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100
    setScrollProgress(scrollPercent)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value.trim() === AGREEMENT_CONFIRM_TEXT) {
      setIsConfirmed(true)
    } else {
      setIsConfirmed(false)
    }
  }

  const getContent = () => {
    switch (activeTab) {
      case 'terms':
        return TERMS_OF_SERVICE
      case 'privacy':
        return PRIVACY_POLICY
      case 'disclaimer':
        return DISCLAIMER
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden glass-card"
          >
            <div className="flex items-center justify-between p-4 border-b border-glass-borderDark">
              <h2 className="text-xl font-semibold text-gradient">用户协议与隐私政策</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="flex border-b border-glass-borderDark">
              {([
                { key: 'terms', label: '用户协议' },
                { key: 'privacy', label: '隐私政策' },
                { key: 'disclaimer', label: '免责声明' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    activeTab === key
                      ? 'text-gemini-cyan border-b-2 border-gemini-cyan bg-gemini-cyan/5'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative">
              <div
                className="h-48 overflow-y-auto p-4 text-sm leading-relaxed text-white/80"
                onScroll={handleScroll}
              >
                <pre className="whitespace-pre-wrap">{getContent()}</pre>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-glass-dark/90 to-transparent pointer-events-none" />
            </div>

            <div className="p-4 border-t border-glass-borderDark">
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span>阅读进度</span>
                  <span>{Math.round(scrollProgress)}%</span>
                </div>
                <div className="h-1 bg-glass-dark/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gemini-gradient"
                    animate={{ width: `${scrollProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-white/50 mb-2">请输入以下文字以确认您已阅读并同意：</p>
                <p className="text-xs text-gemini-cyan mb-3">{AGREEMENT_CONFIRM_TEXT}</p>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="在此输入确认文字..."
                  className="w-full input-glass text-sm"
                  maxLength={AGREEMENT_CONFIRM_TEXT.length}
                />
              </div>

              <button
                onClick={isConfirmed ? onConfirm : undefined}
                disabled={!isConfirmed}
                className={`w-full py-3 rounded-glass-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isConfirmed
                    ? 'gradient-button'
                    : 'bg-glass-dark/40 text-white/40 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                {isConfirmed ? '确认并同意' : '请输入确认文字'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}