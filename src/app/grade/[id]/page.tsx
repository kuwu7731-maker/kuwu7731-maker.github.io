'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, MessageCircle, Clock, ArrowRight, Menu, X, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/lib/auth/auth'
import { useParams } from 'next/navigation'

const gradeInfo: Record<number, { name: string; description: string; color: string }> = {
  7: { name: '七年级 · 启航', description: '新生适应、学习方法、社团招新', color: 'cyan' },
  8: { name: '八年级 · 深耕', description: '学科答疑、竞赛交流、心理健康', color: 'blue' },
  9: { name: '九年级 · 冲刺', description: '中考资料、志愿填报、学长学姐经验分享', color: 'purple' },
}

const mockPosts = [
  { id: 1, title: '七年级数学学习方法分享', author: '小明', time: '1小时前', views: 128, replies: 15, isTop: true },
  { id: 2, title: '新学期社团招新啦！', author: '学生会', time: '2小时前', views: 256, replies: 32, isTop: false },
  { id: 3, title: '如何快速适应初中生活', author: '班主任', time: '3小时前', views: 196, replies: 28, isTop: false },
  { id: 4, title: '英语单词记忆技巧', author: '学霸君', time: '5小时前', views: 89, replies: 12, isTop: false },
  { id: 5, title: '周末作业讨论群', author: '班长', time: '昨天', views: 145, replies: 45, isTop: false },
]

export default function GradePage() {
  const params = useParams()
  const gradeId = parseInt(params.id as string)
  const grade = gradeInfo[gradeId] || gradeInfo[7]
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b-0 rounded-b-glass-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/">
                <div className="w-10 h-10 rounded-glass-sm bg-gemini-gradient flex items-center justify-center shadow-glow">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </Link>
              <span className="text-xl font-bold text-gradient">实验中学论坛</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/grade/7" className={`text-sm ${gradeId === 7 ? 'text-gemini-cyan' : 'text-white/60 hover:text-gemini-cyan'}`}>七年级</Link>
              <Link href="/grade/8" className={`text-sm ${gradeId === 8 ? 'text-gemini-cyan' : 'text-white/60 hover:text-gemini-cyan'}`}>八年级</Link>
              <Link href="/grade/9" className={`text-sm ${gradeId === 9 ? 'text-gemini-cyan' : 'text-white/60 hover:text-gemini-cyan'}`}>九年级</Link>
              <Link href="/post/create" className="gradient-button text-sm px-4 py-2">发帖</Link>
              <button onClick={handleSignOut} className="glass-button text-sm px-4 py-2">退出</button>
            </div>

            <button
              className="md:hidden p-2 text-white/60"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-4 pb-4 space-y-2">
            <Link href="/grade/7" className="block py-2 text-white/60 hover:text-gemini-cyan">七年级</Link>
            <Link href="/grade/8" className="block py-2 text-white/60 hover:text-gemini-cyan">八年级</Link>
            <Link href="/grade/9" className="block py-2 text-white/60 hover:text-gemini-cyan">九年级</Link>
            <Link href="/post/create" className="block py-2 text-center gradient-button text-sm">发帖</Link>
            <button onClick={handleSignOut} className="w-full py-2 glass-button text-sm">退出</button>
          </div>
        </motion.div>
      </nav>

      <div className="pt-16">
        <section className="relative py-12 px-4">
          <div className={`absolute inset-0 bg-gemini-${grade.color}/5`} />
          
          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2">{grade.name}</h1>
              <p className="text-white/60">{grade.description}</p>
            </motion.div>
          </div>
        </section>

        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">最新帖子</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-glass-sm glass-button text-sm">最新</button>
                <button className="px-4 py-2 rounded-glass-sm glass-button text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  热门
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {mockPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card glass-card-hover p-4 flex items-center gap-4 ${post.isTop ? 'border-l-4 border-gemini-cyan' : ''}`}
                >
                  {post.isTop && (
                    <div className="w-8 h-8 rounded-glass-sm bg-gemini-cyan/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-gemini-cyan text-xs font-bold">顶</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-white font-medium hover:text-gemini-cyan cursor-pointer">{post.title}</h3>
                    <p className="text-white/50 text-sm mt-1">
                      <span className="mr-4">{post.author}</span>
                      <span className="mr-4 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.time}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-white/40 text-sm">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.replies}
                    </span>
                    <span>{post.views} 阅读</span>
                    <ArrowRight className="w-4 h-4 text-gemini-cyan" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button className="glass-button">查看更多帖子</button>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-glass-borderDark py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-white/40 text-sm">
          <p>实验中学论坛 © 2024 - 版权所有</p>
        </div>
      </footer>
    </div>
  )
}