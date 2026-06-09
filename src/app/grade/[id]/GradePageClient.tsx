'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/lib/auth/auth'

interface GradePageClientProps {
  mobile?: boolean
}

export default function GradePageClient({ mobile }: GradePageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: true, redirectTo: '/' })
  }

  if (mobile) {
    return (
      <>
        <button
          className="md:hidden p-2 text-white/60"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

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
      </>
    )
  }

  return (
    <button onClick={handleSignOut} className="glass-button text-sm px-4 py-2">退出</button>
  )
}