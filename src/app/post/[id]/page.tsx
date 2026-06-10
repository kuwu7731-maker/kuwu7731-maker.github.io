'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, MessageCircle, Clock, Eye, ArrowLeft, Send } from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  viewCount: number
  createdAt: string
  user: { id: string; name: string; identity: string }
  comments: Comment[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; identity: string }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.id}`)
        const data = await res.json()
        if (data.post) {
          setPost(data.post)
        }
      } catch (error) {
        console.error('获取帖子失败', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [params.id])

  const handleSubmitComment = async () => {
    if (!comment.trim() || !post) return

    const token = localStorage.getItem('token')
    if (!token) {
      alert('请先登录')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment, token }),
      })
      const data = await res.json()
      if (data.code === 200) {
        setComment('')
        // 重新获取帖子数据
        const postRes = await fetch(`/api/posts/${params.id}`)
        const postData = await postRes.json()
        if (postData.post) {
          setPost(postData.post)
        }
      } else {
        alert(data.msg || '评论失败')
      }
    } catch (error) {
      alert('评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">加载中...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-white/60">帖子不存在</div>
        <Link href="/" className="text-[#00E5FF]">返回首页</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] via-[#2979FF] to-[#D500F9] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </Link>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9]">实验中学论坛</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-white/70 hover:text-[#00E5FF] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,229,255,0.05)]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF] via-[#2979FF] to-[#D500F9] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                <span className="text-white text-lg font-bold">{post.user.name.charAt(0)}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{post.user.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#00E5FF]/20 text-[#00E5FF]">{post.user.identity}</span>
                </div>
                <div className="flex items-center gap-4 text-white/40 text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.viewCount} 阅读
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">{post.title}</h1>

            <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-lg">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">{paragraph || '\u00A0'}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,229,255,0.05)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">评论</h2>
                <p className="text-white/40 text-sm">{post.comments.length} 条评论</p>
              </div>
            </div>

            <div className="mb-8">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="写下你的评论..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-[#00E5FF]/50 focus:shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSubmitComment}
                  disabled={submitting || !comment.trim()}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#00E5FF] via-[#2979FF] to-[#D500F9] rounded-xl text-white font-medium shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? '发送中...' : '发送评论'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {post.comments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white/30" />
                  </div>
                  <p className="text-white/40">暂无评论，快来发表你的看法吧</p>
                </div>
              ) : (
                post.comments.map((c, index) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 rounded-xl p-5 hover:bg-white/8 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#D500F9] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{c.user.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium text-sm">{c.user.name}</span>
                          <span className="text-white/40 text-xs">{new Date(c.createdAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
