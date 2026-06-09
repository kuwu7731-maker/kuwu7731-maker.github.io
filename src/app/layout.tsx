import type { Metadata } from 'next'
import './globals.css'
import { AgreementModal } from '@/components/AgreementModal'

export const metadata: Metadata = {
  title: '实验中学论坛 - 探索知识，连接校园',
  description: '实验中学官方论坛，为七至九年级师生打造的交流平台。分享学习经验，探讨成长困惑，共建美好校园。',
  keywords: '实验中学,论坛,校园,学习,交流,七年级,八年级,九年级',
  authors: [{ name: '实验中学' }],
  openGraph: {
    title: '实验中学论坛',
    description: '实验中学官方论坛，为七至九年级师生打造的交流平台',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '实验中学论坛',
    description: '实验中学官方论坛',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AgreementModal />
        {children}
      </body>
    </html>
  )
}
