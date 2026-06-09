'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, RefreshCw } from 'lucide-react'

interface SlideCaptchaProps {
  onVerify: (offset: number) => void
  challengeId: string
  targetOffset: number
  disabled?: boolean
}

export function SlideCaptcha({ onVerify, challengeId, targetOffset, disabled = false }: SlideCaptchaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [imageUrl, setImageUrl] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const maxOffset = 280
  const sliderWidth = 56

  useEffect(() => {
    setOffset(0)
    setStatus('idle')
    generateRandomImage()
  }, [challengeId])

  const generateRandomImage = () => {
    const images = [
      'https://picsum.photos/id/10/350/120',
      'https://picsum.photos/id/11/350/120',
      'https://picsum.photos/id/12/350/120',
      'https://picsum.photos/id/13/350/120',
      'https://picsum.photos/id/14/350/120',
      'https://picsum.photos/id/15/350/120',
    ]
    setImageUrl(images[Math.floor(Math.random() * images.length)])
  }

  const handleStart = useCallback(() => {
    if (disabled) return
    setIsDragging(true)
    setStatus('idle')
  }, [disabled])

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newOffset = Math.max(0, Math.min(maxOffset, clientX - rect.left - sliderWidth / 2))
    setOffset(newOffset)
  }, [isDragging])

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const tolerance = 15
    if (Math.abs(offset - targetOffset) <= tolerance) {
      setStatus('success')
      setTimeout(() => {
        onVerify(offset)
      }, 600)
    } else {
      setStatus('error')
      setTimeout(() => {
        setOffset(0)
        setStatus('idle')
      }, 400)
    }
  }, [isDragging, offset, targetOffset, onVerify])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const handleMouseUp = () => handleEnd()
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX)
    const handleTouchEnd = () => handleEnd()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMove, handleEnd])

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <div className="relative h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10">
        <img
          src={imageUrl}
          alt="captcha"
          className="w-full h-full object-cover"
          style={{ opacity: 0.7 }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

        <motion.div
          className="absolute top-0 bottom-0 left-0 rounded-l-xl"
          style={{
            background: 'linear-gradient(90deg, rgba(0,229,255,0.3) 0%, rgba(41,121,255,0.3) 50%, rgba(213,0,249,0.3) 100%)',
            width: `${Math.max(0, offset)}px`,
          }}
          transition={{ duration: 0.05 }}
        />

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            left: `${targetOffset}px`,
            background: 'rgba(0,0,0,0.4)',
            border: '2px dashed rgba(0,229,255,0.6)',
          }}
          animate={{
            scale: isDragging ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isDragging ? Infinity : 0,
          }}
        >
          <motion.div
            className="w-6 h-6 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,229,255,0.8) 0%, rgba(0,229,255,0.3) 100%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
            }}
          />
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/80 text-sm font-medium drop-shadow-lg">
            {status === 'success' ? '验证成功' : '拖动滑块完成验证'}
          </span>
        </div>

        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'rgba(0,229,255,0.15)',
                border: '2px solid rgba(0,229,255,0.6)',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute -bottom-2 left-1 w-14 h-14 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.95) 0%, rgba(41,121,255,0.95) 50%, rgba(213,0,249,0.95) 100%)',
          boxShadow: isDragging
            ? '0 0 35px rgba(0,229,255,0.7), 0 0 70px rgba(41,121,255,0.4), inset 0 2px 0 rgba(255,255,255,0.3)'
            : '0 6px 25px rgba(0,229,255,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
        }}
        animate={{
          x: offset,
          scale: isDragging ? 1.08 : 1,
          rotate: isDragging ? 3 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        drag={!disabled}
        dragConstraints={{ left: 0, right: maxOffset }}
        dragElastic={0}
        onDragStart={handleStart}
        onDragEnd={handleEnd}
        onMouseDown={handleStart}
      >
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check className="w-7 h-7 text-white" />
            </motion.div>
          ) : status === 'error' ? (
            <motion.div
              key="error"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={() => {
                setOffset(0)
                setStatus('idle')
              }}
            >
              <RefreshCw className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="arrow"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              animate={{
                x: isDragging ? [0, 6, 0] : 0,
              }}
              transition={{
                duration: 0.4,
                repeat: isDragging ? Infinity : 0,
              }}
            >
              <ChevronRight className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white"
          animate={{
            opacity: isDragging ? [0.6, 1, 0.6] : 0.4,
            scale: isDragging ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.8,
            repeat: isDragging ? Infinity : 0,
          }}
        />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-3 rounded-b-xl overflow-hidden">
        <motion.div
          className="h-full rounded-b-xl"
          style={{
            background: 'linear-gradient(90deg, rgba(0,229,255,0.6) 0%, rgba(41,121,255,0.6) 50%, rgba(213,0,249,0.6) 100%)',
          }}
          animate={{ width: `${(offset / maxOffset) * 100}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
    </div>
  )
}
