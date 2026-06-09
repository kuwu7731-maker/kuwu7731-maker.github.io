'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, GraduationCap, BookOpen, Settings, LogOut, Edit, Save, ArrowLeft, Calendar, MessageCircle, Trophy } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  id: string
  email: string
  name: string
  identity: string
  role: string
  grade?: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      setEditName(JSON.parse(userData).name)
    } else {
      window.location.href = '/login'
    }
  }, [])

  const handleSave = () => {
    if (user && editName.trim()) {
      const updatedUser = { ...user, name: editName }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setIsEditing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  if (!user) {
    return null
  }

  const stats = [
    { label: '发帖数', value: '12', icon: MessageCircle },
    { label: '注册日期', value: '2024-09-01', icon: Calendar },
    { label: '荣誉等级', value: 'Lv.3', icon: Trophy },
  ]

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-[400px] h-[400px] rounded-full" style={{background:'radial-gradient(circle,rgba(0,229,255,0.1) 0%,transparent 70%)'}} />
        <div className="absolute bottom-20 right-20 w-[300px] h-[300px] rounded-full" style={{background:'radial-gradient(circle,rgba(213,0,249,0.1) 0%,transparent 70%)'}} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] via-[#2979FF] to-[#D500F9] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9]">实验中学论坛</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24"
              >
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00E5FF] via-[#2979FF] to-[#D500F9] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:border-[#00E5FF]/50"
                      />
                      <button onClick={handleSave} className="p-2 text-[#00E5FF] hover:bg-white/10 rounded-lg transition-colors">
                        <Save className="w-5 h-5" />
                      </button>
                      <button onClick={() => { setIsEditing(false); setEditName(user.name) }} className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-xl font-bold text-white">{user.name}</h2>
                      <button onClick={() => setIsEditing(true)} className="p-1 text-white/40 hover:text-[#00E5FF] transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className={`text-sm mt-2 ${user.identity === 'teacher' ? 'text-[#D500F9]' : 'text-[#00E5FF]'}`}>
                    {user.identity === 'teacher' ? '教师' : `学生 · ${user.grade}年级`}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'profile' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>个人资料</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'posts' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>我的帖子</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'settings' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>账户设置</span>
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>退出登录</span>
                </button>
              </motion.div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, idx) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"
                      >
                        <stat.icon className="w-8 h-8 mx-auto mb-2 text-[#00E5FF]" />
                        <div className="text-xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-white/50">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">详细信息</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-white/40" />
                          <span className="text-white/60">邮箱</span>
                        </div>
                        <span className="text-white">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-white/40" />
                          <span className="text-white/60">身份</span>
                        </div>
                        <span className="text-white">{user.identity === 'teacher' ? '教师' : '学生'}</span>
                      </div>
                      {user.grade && (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-white/40" />
                            <span className="text-white/60">年级</span>
                          </div>
                          <span className="text-white">{user.grade}年级</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'posts' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">我的帖子</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00E5FF]/10 to-[#2979FF]/10 flex items-center justify-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#D500F9]">{idx}</div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">七年级数学学习方法分享</h4>
                          <p className="text-white/40 text-sm">3小时前 · 128浏览</p>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-white/40 rotate-180" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">账户设置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-white/40" />
                        <span className="text-white">修改密码</span>
                      </div>
                      <ArrowLeft className="w-5 h-5 text-white/40 rotate-180" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-white/40" />
                        <span className="text-white">修改邮箱</span>
                      </div>
                      <ArrowLeft className="w-5 h-5 text-white/40 rotate-180" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 text-white/40" />
                        <span className="text-white">注销账户</span>
                      </div>
                      <ArrowLeft className="w-5 h-5 text-white/40 rotate-180" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 py-12 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-white/30 text-sm">实验中学论坛 © 2024</div>
      </footer>
    </div>
  )
}
