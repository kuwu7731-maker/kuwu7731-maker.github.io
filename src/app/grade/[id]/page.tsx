import { GraduationCap, MessageCircle, Clock, ArrowRight, TrendingUp, Eye, User } from 'lucide-react'
import Link from 'next/link'
import GradePageClient from './GradePageClient'

const gradeInfo: Record<number, { name: string; description: string; color: string }> = {
  7: { name: '七年级 · 启航', description: '新生适应、学习方法、社团招新', color: 'cyan' },
  8: { name: '八年级 · 深耕', description: '学科答疑、竞赛交流、心理健康', color: 'blue' },
  9: { name: '九年级 · 冲刺', description: '中考资料、志愿填报、学长学姐经验分享', color: 'purple' },
}

type GradePageProps = {
  params: Promise<{ id: string }>
}

async function getPosts(gradeId: number) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/posts?gradeId=${gradeId}&limit=20`, {
      cache: 'no-store',
    })
    const data = await res.json()
    return data.posts || []
  } catch {
    return []
  }
}

export default async function GradePage({ params }: GradePageProps) {
  const { id } = await params
  const gradeId = parseInt(id)
  const grade = gradeInfo[gradeId] || gradeInfo[7]
  const posts = await getPosts(gradeId)

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
              <GradePageClient />
            </div>

            <GradePageClient mobile />
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <section className="relative py-12 px-4">
          <div className={`absolute inset-0 bg-gemini-${grade.color}/5`} />
          
          <div className="relative max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">{grade.name}</h1>
            <p className="text-white/60">{grade.description}</p>
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

            {posts.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gemini-cyan/10 to-gemini-purple/10 flex items-center justify-center border border-white/10">
                  <GraduationCap className="w-10 h-10 text-gemini-cyan/70" />
                </div>
                <p className="text-white/50 text-lg mb-6">暂无帖子，快来发布第一篇吧！</p>
                <Link 
                  href="/post/create" 
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gemini-cyan via-gemini-blue to-gemini-purple rounded-xl text-white font-medium shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-105 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  发布帖子
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className={`block bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 ${post.isTop ? 'border-l-4 border-l-gemini-cyan' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gemini-cyan/20 to-gemini-purple/20 flex items-center justify-center">
                        <span className="text-white/80 text-sm font-semibold">{post.user?.name?.charAt(0) || '?'}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isTop && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-gemini-cyan/20 text-gemini-cyan">置顶</span>
                          )}
                          <span className="text-white/50 text-sm">{post.user?.name || '匿名'}</span>
                          <span className="text-white/30 text-xs">·</span>
                          <span className="text-white/40 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <h3 className="text-white font-medium text-lg mb-2 hover:text-gemini-cyan transition-colors line-clamp-2">{post.title}</h3>
                        <p className="text-white/40 text-sm line-clamp-2">{post.content?.substring(0, 100)}...</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 text-white/40 text-sm">
                        <span className="flex items-center gap-1 hover:text-gemini-cyan transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.viewCount || 0}
                        </span>
                        <ArrowRight className="w-5 h-5 text-gemini-cyan/60 hover:text-gemini-cyan transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

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
