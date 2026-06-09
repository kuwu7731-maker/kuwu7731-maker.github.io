'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Upload, Trash2, Search, X, Save, AlertCircle, CheckCircle, BarChart3, RefreshCw } from 'lucide-react'
import { freeContentFilter } from '@/lib/sensitive-word/free-content-filter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface WordStat {
  word: string
  count: number
}

export default function SensitiveWordsPage() {
  const [words, setWords] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newWord, setNewWord] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [stats, setStats] = useState<WordStat[]>([])
  const [wordCount, setWordCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list')

  useEffect(() => {
    loadWords()
    loadStats()
  }, [])

  const loadWords = async () => {
    setIsLoading(true)
    try {
      const count = await freeContentFilter.getWordCount()
      setWordCount(count)
      
      const wordsPath = require('path').join(process.cwd(), 'data', 'clean-base-words.txt')
      const fs = require('fs')
      if (fs.existsSync(wordsPath)) {
        const content = fs.readFileSync(wordsPath, 'utf-8')
        const wordList = content.split('\n').map((w: string) => w.trim()).filter((w: string) => w.length >= 2)
        setWords(wordList)
      }
    } catch {
      setWords([])
    }
    setIsLoading(false)
  }

  const loadStats = async () => {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const logs = await prisma.sensitiveWordLog.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
      })

      const wordCounts: Record<string, number> = {}
      for (const log of logs) {
        const matchedWords = log.content.split('|').filter((w: string) => w.trim())
        for (const word of matchedWords) {
          wordCounts[word] = (wordCounts[word] || 0) + 1
        }
      }

      const sortedStats = Object.entries(wordCounts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)

      setStats(sortedStats)
    } catch (error) {
      console.error('加载统计数据失败:', error)
      setStats([])
    }
  }

  const filteredWords = words.filter(word => 
    word.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    if (!newWord.trim()) {
      setNotification({ type: 'error', message: '请输入敏感词' })
      return
    }

    try {
      await freeContentFilter.addWords([newWord])
      setNewWord('')
      setIsAdding(false)
      await loadWords()
      setNotification({ type: 'success', message: '敏感词添加成功' })
    } catch (error) {
      setNotification({ type: 'error', message: '添加失败' })
    }
  }

  const handleDelete = async (word: string) => {
    if (!confirm('确定删除这个敏感词吗？')) return

    try {
      await freeContentFilter.removeWord(word)
      await loadWords()
      setNotification({ type: 'success', message: '敏感词删除成功' })
    } catch (error) {
      setNotification({ type: 'error', message: '删除失败' })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/plain') {
      setNotification({ type: 'error', message: '仅支持txt文件' })
      return
    }

    try {
      const content = await file.text()
      const newWords = content.split('\n').map((w: string) => w.trim()).filter((w: string) => w.length >= 2)
      
      await freeContentFilter.addWords(newWords)
      await loadWords()
      setNotification({ type: 'success', message: `成功添加 ${newWords.length} 个敏感词` })
    } catch (error) {
      setNotification({ type: 'error', message: '上传失败' })
    }
  }

  const totalHits = stats.reduce((sum, stat) => sum + stat.count, 0)

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)' }}
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(213,0,249,0.08) 0%, transparent 70%)' }}
          animate={{
            x: [0, -30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="fixed top-0 left-0 right-0 h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">敏感词管理</h1>
        </div>
        <div className="flex gap-3">
          <motion.button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white font-medium text-sm flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            添加敏感词
          </motion.button>
          <label className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-all">
            <Upload className="w-4 h-4" />
            上传词库
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="pt-20 px-6 pb-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索敏感词..."
                  className="w-full px-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-white/60 text-sm">
                  共 <span className="text-cyan-400 font-semibold">{wordCount}</span> 个敏感词
                </div>
                <motion.button
                  onClick={() => { loadWords(); loadStats() }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-cyan-400 transition-all"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              词库列表
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              命中统计
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
              >
                {isLoading ? (
                  <div className="p-12 text-center">
                    <motion.div
                      className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-white/50">加载中...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-white/[0.05] backdrop-blur-xl border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-white/60">敏感词</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-white/60">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWords.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="px-6 py-12 text-center">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <Search className="w-8 h-8 text-white/30" />
                              </div>
                              <p className="text-white/40">暂无敏感词</p>
                            </td>
                          </tr>
                        ) : (
                          filteredWords.map((word, index) => (
                            <motion.tr
                              key={word}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.01 }}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              <td className="px-6 py-4 text-white font-medium">{word}</td>
                              <td className="px-6 py-4">
                                <motion.button
                                  onClick={() => handleDelete(word)}
                                  className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-2">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">最近7天命中排行</h3>
                      <div className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm">
                        总计命中 <span className="text-cyan-400 font-semibold">{totalHits}</span> 次
                      </div>
                    </div>

                    {stats.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-white/30" />
                        </div>
                        <p className="text-white/40">暂无统计数据</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {stats.map((stat, index) => (
                          <motion.div
                            key={stat.word}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium ${
                                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                  index === 1 ? 'bg-white/20 text-white/80' :
                                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-white/5 text-white/40'
                                }`}>
                                  {index + 1}
                                </span>
                                <span className="text-sm text-white/80 truncate max-w-[200px]">{stat.word}</span>
                              </div>
                              <span className="text-sm text-cyan-400 font-medium">{stat.count} 次</span>
                            </div>
                            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((stat.count / stats[0].count) * 100, 100)}%` }}
                                transition={{ duration: 0.6, delay: index * 0.05 }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">今日概览</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5">
                        <div className="text-2xl font-bold text-cyan-400">{totalHits}</div>
                        <div className="text-xs text-white/50 mt-1">7日总命中</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5">
                        <div className="text-2xl font-bold text-purple-400">{stats.length}</div>
                        <div className="text-xs text-white/50 mt-1">监控词数</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">系统状态</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">词库状态</span>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm text-green-400">正常</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">DFA 算法</span>
                        <span className="text-sm text-green-400">已加载</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">拼音检测</span>
                        <span className="text-sm text-green-400">已启用</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">零宽字符过滤</span>
                        <span className="text-sm text-green-400">已启用</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">添加敏感词</h2>
                <motion.button
                  onClick={() => setIsAdding(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">敏感词内容</label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="请输入敏感词"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 transition-all"
                    maxLength={100}
                    autoFocus
                  />
                  <p className="text-xs text-white/40 mt-2">支持中文、英文、数字及特殊字符</p>
                </div>

                <motion.button
                  onClick={handleAdd}
                  disabled={!newWord.trim()}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    !newWord.trim()
                      ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                      : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white'
                  }`}
                  whileHover={newWord.trim() && { scale: 1.02 }}
                  whileTap={newWord.trim() && { scale: 0.98 }}
                >
                  <Save className="w-5 h-5" />
                  添加敏感词
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 px-6 py-4 rounded-xl flex items-center gap-3 z-50 shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                : 'bg-red-500/15 border border-red-500/30 text-red-400'
            }`}
            style={{ backdropFilter: 'blur(10px)' }}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
