'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, Users, FileText, Settings, Shield, GraduationCap } from 'lucide-react'
import Link from 'next/link'

const menuItems = [
  { icon: LayoutDashboard, label: '数据看板', href: '/admin/dashboard' },
  { icon: Users, label: '用户管理', href: '/admin/users' },
  { icon: FileText, label: '内容审核', href: '/admin/content' },
  { icon: Shield, label: '敏感词管理', href: '/admin/sensitive-words' },
  { icon: Settings, label: '系统配置', href: '/admin/settings' },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 h-16 glass-card border-b-0 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-glass-sm bg-gemini-gradient flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">管理后台</span>
        </div>
      </div>

      <div className="pt-16 flex">
        <div className="fixed left-0 top-16 bottom-0 w-64 glass-card border-r-0 rounded-r-glass-lg p-6">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-glass-sm text-white/60 hover:text-gemini-cyan hover:bg-white/5 transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="ml-64 p-6 flex-1">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <h1 className="text-2xl font-bold text-white mb-6">欢迎来到管理后台</h1>
              <p className="text-white/60 mb-8">
                在这里您可以管理用户、审核内容、配置敏感词库等。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card glass-card-hover p-6 cursor-pointer"
                  >
                    <item.icon className="w-10 h-10 text-gemini-cyan mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">{item.label}</h3>
                    <p className="text-white/50 text-sm">
                      {[
                        '查看平台数据统计和分析',
                        '管理用户账号和权限',
                        '审核待发布的内容',
                        '管理敏感词库和内容安全',
                        '配置系统参数和公告',
                      ][index]}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}