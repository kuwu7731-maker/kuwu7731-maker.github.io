'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, MessageCircle, TrendingUp, BookOpen, ArrowRight, Menu, X, Users, Clock, Eye, User, LogIn, LogOut } from 'lucide-react'
import Link from 'next/link'

const grades = [
  { id: 7, name: '七年级 · 启航', desc: '新生适应、学习方法、社团招新' },
  { id: 8, name: '八年级 · 深耕', desc: '学科答疑、竞赛交流、心理健康' },
  { id: 9, name: '九年级 · 冲刺', desc: '中考资料、志愿填报、学长经验' },
]

const stats = [
  { label: '今日活跃', value: '1,234', icon: Users },
  { label: '总帖子', value: '12,580', icon: MessageCircle },
  { label: '敏感词拦截', value: '234', icon: TrendingUp },
]

export default function HomePage() {
  const [hotPosts, setHotPosts] = useState([
    { id: '1', title: '加载中...', createdAt: new Date().toISOString(), viewCount: 0, user: { name: '' } },
  ])
  const [mobileMenu, setMobileMenu] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    const fetchHotPosts = async () => {
      try {
        const res = await fetch('/api/posts?limit=5')
        const data = await res.json()
        if (data.posts) {
          setHotPosts(data.posts)
        }
      } catch (error) {
        console.error('获取热门帖子失败', error)
      }
    }
    fetchHotPosts()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    window.location.reload()
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute top-20 left-20 w-[400px] h-[400px] rounded-full" style={{background:'radial-gradient(circle,rgba(0,229,255,0.1) 0%,transparent 70%)'}} animate={{x:[0,30,0],y:[0,20,0]}} transition={{duration:15,repeat:Infinity}} />
        <motion.div className="absolute bottom-20 right-20 w-[300px] h-[300px] rounded-full" style={{background:'radial-gradient(circle,rgba(213,0,249,0.1) 0%,transparent 70%)'}} animate={{x:[0,-20,0],y:[0,-30,0]}} transition={{duration:12,repeat:Infinity}} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] via-[#2979FF] to-[#D500F9] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9]">实验中学论坛</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/grade/7" className="text-white/70 hover:text-[#00E5FF] transition-colors relative group">
              <span>七年级</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00E5FF] to-[#2979FF] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/grade/8" className="text-white/70 hover:text-[#2979FF] transition-colors relative group">
              <span>八年级</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#2979FF] to-[#D500F9] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/grade/9" className="text-white/70 hover:text-[#D500F9] transition-colors relative group">
              <span>九年级</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#D500F9] to-[#00E5FF] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/post/create" className="px-5 py-2.5 bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9] rounded-xl text-white font-medium shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transition-shadow">发帖</Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#D500F9] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <LogOut className="w-5 h-5 text-white/70" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-white/70">
                  <LogIn className="w-5 h-5" />
                  <span>登录</span>
                </Link>
                <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-[#00E5FF] to-[#D500F9] rounded-xl text-white font-medium shadow-[0_0_15px_rgba(0,229,255,0.3)]">注册</Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 text-white/70" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="md:hidden px-4 pb-4 bg-white/5">
              <div className="space-y-2">
                <Link href="/grade/7" className="block py-2 px-4 rounded-lg hover:bg-white/10 text-white/70">七年级</Link>
                <Link href="/grade/8" className="block py-2 px-4 rounded-lg hover:bg-white/10 text-white/70">八年级</Link>
                <Link href="/grade/9" className="block py-2 px-4 rounded-lg hover:bg-white/10 text-white/70">九年级</Link>
                <Link href="/post/create" className="block py-2 px-4 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#D500F9] text-white text-center">发帖</Link>
                {user ? (
                  <>
                    <Link href="/profile" className="block py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {user.name}
                    </Link>
                    <button onClick={handleLogout} className="block w-full py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center gap-2">
                      <LogOut className="w-5 h-5" />
                      退出登录
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      登录
                    </Link>
                    <Link href="/register" className="block py-2 px-4 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#D500F9] text-white text-center">注册</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="pt-16 relative z-10">
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                <span className="text-white/60 text-sm">实验中学官方论坛</span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9]">探索知识</span>
                <span className="text-white"> · </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9]">连接校园</span>
              </h1>
              <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">为七至九年级师生打造的交流平台</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/post/create" className="px-8 py-4 bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9] rounded-xl text-white font-medium shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all hover:scale-105">发布新帖</Link>
                <Link href="/grade/7" className="px-8 py-4 bg-white/5 border border-white/20 rounded-xl text-white font-medium hover:bg-white/10 hover:border-white/30 transition-all">浏览板块</Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {stats.map((stat, idx) => (
                <motion.div key={stat.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:idx*0.1}} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 hover:-translate-y-1 transition-all">
                  <stat.icon className="w-10 h-10 mx-auto mb-4 text-[#00E5FF]" />
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#D500F9] mb-2">{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {grades.map((grade, idx) => (
                <motion.div key={grade.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2+idx*0.1}} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 cursor-pointer hover:border-white/20 hover:-translate-y-1 transition-all" onClick={()=>window.location.href=`/grade/${grade.id}`}>
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${idx===0?'bg-gradient-to-br from-[#00E5FF]/20 to-[#2979FF]/10 border border-[#00E5FF]/20':idx===1?'bg-gradient-to-br from-[#2979FF]/20 to-[#D500F9]/10 border border-[#2979FF]/20':'bg-gradient-to-br from-[#D500F9]/20 to-[#00E5FF]/10 border border-[#D500F9]/20'}`}>
                    <BookOpen className={`w-8 h-8 ${idx===0?'text-[#00E5FF]':idx===1?'text-[#2979FF]':'text-[#D500F9]'}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{grade.name}</h3>
                  <p className="text-white/50 text-sm mb-6">{grade.desc}</p>
                  <div className="flex items-center gap-2 text-white/70 hover:text-[#00E5FF] transition-colors">进入板块 <ArrowRight className="w-4 h-4" /></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">热门帖子</h2>
                  <p className="text-white/40 text-sm">大家都在关注</p>
                </div>
              </div>
              <Link href="/grade/7" className="text-[#00E5FF] text-sm">查看更多</Link>
            </div>

            <div className="space-y-4">
              {hotPosts.map((post, idx) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:idx*0.05}} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 flex items-center gap-4 hover:border-white/20 hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00E5FF]/10 to-[#2979FF]/10 flex items-center justify-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#D500F9]">{idx+1}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{post.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-white/40 text-sm">
                        <span>{post.user?.name || '匿名'}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount || 0}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/40" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#D500F9] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#D500F9]">实验中学论坛</span>
              </div>
              <p className="text-white/40 text-sm">为七至九年级师生打造的交流平台</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">快速导航</h4>
              <div className="space-y-2">
                <Link href="/grade/7" className="block text-white/40 hover:text-[#00E5FF] text-sm">七年级</Link>
                <Link href="/grade/8" className="block text-white/40 hover:text-[#2979FF] text-sm">八年级</Link>
                <Link href="/grade/9" className="block text-white/40 hover:text-[#D500F9] text-sm">九年级</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">联系我们</h4>
              <p className="text-white/40 text-sm">admin@shool.edu</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/30 text-sm">实验中学论坛 © 2024</div>
        </div>
      </footer>
    </div>
  )
}
