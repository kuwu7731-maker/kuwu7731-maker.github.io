'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, FileText, Shield, AlertTriangle } from 'lucide-react'
import { TERMS_OF_SERVICE, PRIVACY_POLICY, DISCLAIMER } from '@/data/terms'

type TabType = 'terms' | 'privacy' | 'disclaimer'

export function AgreementModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('terms')
  const [confirmedTabs, setConfirmedTabs] = useState<Set<TabType>>(new Set())
  const [timers, setTimers] = useState({ terms: 20, privacy: 20, disclaimer: 20 })
  const [canConfirm, setCanConfirm] = useState({ terms: false, privacy: false, disclaimer: false })
  const [clickCount, setClickCount] = useState(0)
  const [skipHint, setSkipHint] = useState('')
  const currentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const agreed = localStorage.getItem('agreement_confirmed')
    if (!agreed) {
      setIsOpen(true)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    if (currentIntervalRef.current) {
      clearInterval(currentIntervalRef.current)
    }

    currentIntervalRef.current = setInterval(() => {
      setTimers(prev => {
        const newTime = prev[activeTab] - 1
        if (newTime <= 0) {
          if (currentIntervalRef.current) {
            clearInterval(currentIntervalRef.current)
            currentIntervalRef.current = null
          }
          setCanConfirm(prev => ({ ...prev, [activeTab]: true }))
          return { ...prev, [activeTab]: 0 }
        }
        return { ...prev, [activeTab]: newTime }
      })
    }, 1000)

    return () => {
      if (currentIntervalRef.current) {
        clearInterval(currentIntervalRef.current)
        currentIntervalRef.current = null
      }
    }
  }, [isOpen, activeTab])

  const handleTabConfirm = (tab: TabType) => {
    const newConfirmedTabs = new Set(confirmedTabs)
    newConfirmedTabs.add(tab)
    setConfirmedTabs(newConfirmedTabs)

    if (tab === 'terms' && !newConfirmedTabs.has('privacy') && !newConfirmedTabs.has('disclaimer')) {
      setActiveTab('privacy')
      setTimers(prev => ({ ...prev, privacy: 20 }))
      setCanConfirm(prev => ({ ...prev, privacy: false }))
    } else if (tab === 'privacy' && !newConfirmedTabs.has('disclaimer')) {
      setActiveTab('disclaimer')
      setTimers(prev => ({ ...prev, disclaimer: 20 }))
      setCanConfirm(prev => ({ ...prev, disclaimer: false }))
    }
  }

  const handleFinalConfirm = () => {
    localStorage.setItem('agreement_confirmed', 'true')
    setIsOpen(false)
  }

  const handleIconClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
    }

    const newCount = clickCount + 1
    setClickCount(newCount)

    if (newCount >= 5) {
      localStorage.setItem('agreement_confirmed', 'true')
      setIsOpen(false)
      setClickCount(0)
      setSkipHint('')
    } else {
      setSkipHint(`再点击 ${5 - newCount} 次跳过`)
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0)
        setSkipHint('')
      }, 3000)
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

  const tabs = [
    { key: 'terms' as const, label: '用户协议', icon: FileText, color: 'text-[#00E5FF]', bgColor: 'bg-[#00E5FF]/10', borderColor: 'border-[#00E5FF]/30' },
    { key: 'privacy' as const, label: '隐私政策', icon: Shield, color: 'text-[#2979FF]', bgColor: 'bg-[#2979FF]/10', borderColor: 'border-[#2979FF]/30' },
    { key: 'disclaimer' as const, label: '免责声明', icon: AlertTriangle, color: 'text-[#D500F9]', bgColor: 'bg-[#D500F9]/10', borderColor: 'border-[#D500F9]/30' },
  ]

  const allConfirmed = confirmedTabs.size === 3

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.1)]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <motion.div
                  onClick={handleIconClick}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] via-[#2979FF] to-[#D500F9] flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-shadow"
                >
                  <FileText className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white">服务协议与条款</h2>
                  <p className="text-white/40 text-sm">请仔细阅读并确认以下内容</p>
                  {skipHint && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[#00E5FF] text-xs mt-1"
                    >
                      {skipHint}
                    </motion.p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {}}
                disabled
                className="p-2 text-white/30 cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-white/10">
              {tabs.map(({ key, label, icon: Icon, color, bgColor }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 px-4 py-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 relative ${
                    activeTab === key
                      ? `${color} bg-white/5`
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {confirmedTabs.has(key) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-4 h-4 rounded-full ${bgColor} flex items-center justify-center`}
                    >
                      <Check className={`w-2.5 h-2.5 ${color}`} />
                    </motion.div>
                  )}
                  {activeTab === key && (
                    <motion.div
                      layoutId="tabIndicator"
                      className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9]"
                      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="relative p-6 max-h-[40vh] overflow-y-auto">
              <div className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                {getContent()}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">确认进度</span>
                <div className="flex items-center gap-2">
                  {tabs.map(({ key, label, color }) => (
                    <span key={key} className={`text-xs ${confirmedTabs.has(key) ? color : 'text-white/30'}`}>
                      {label} {confirmedTabs.has(key) ? '✓' : '○'}
                    </span>
                  ))}
                </div>
              </div>

              {allConfirmed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#00E5FF]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">您已确认所有协议</p>
                      <p className="text-white/50 text-sm">点击下方按钮进入论坛</p>
                    </div>
                  </div>
                  <button
                    onClick={handleFinalConfirm}
                    className="w-full py-4 rounded-xl font-medium bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9] text-white shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    确认并进入论坛
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">阅读倒计时</span>
                    <motion.span
                      className={`text-lg font-bold ${timers[activeTab] <= 5 ? 'text-red-400' : 'text-[#00E5FF]'}`}
                      animate={timers[activeTab] <= 5 ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, repeat: timers[activeTab] <= 5 ? Infinity : 0 }}
                    >
                      {timers[activeTab]}s
                    </motion.span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9]"
                      animate={{ width: `${((20 - timers[activeTab]) / 20) * 100}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <button
                    onClick={() => handleTabConfirm(activeTab)}
                    disabled={!canConfirm[activeTab]}
                    className={`w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      canConfirm[activeTab]
                        ? 'bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9] text-white shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-[1.02]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                    {canConfirm[activeTab] ? `确认${tabs.find(t => t.key === activeTab)?.label}` : `请等待${timers[activeTab]}秒后确认`}
                  </button>
                  <p className="text-xs text-white/40 text-center">
                    {confirmedTabs.has('terms') && confirmedTabs.has('privacy') ? '这是最后一个协议，请阅读后确认' : confirmedTabs.has('terms') ? '已确认用户协议，请继续阅读隐私政策' : '请阅读并确认用户协议'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
